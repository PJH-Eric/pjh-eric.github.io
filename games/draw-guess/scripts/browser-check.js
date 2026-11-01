/*
 * scripts/browser-check.js — 用無頭 Chrome 實際跑一遍遊戲並檢查版面
 * 執行：node scripts/browser-check.js      （會自己啟動 server.js）
 *
 * 零外部套件：直接用 Node 內建的 fetch 與 WebSocket 講 Chrome DevTools Protocol。
 *
 * 檢查項目
 *   A. 七種尺寸／方向（手機窄版、手機直橫、平板直橫、桌機寬版）下的每個主要畫面：
 *      不可水平溢出、右上角設定按鈕在安全區內且夠大、設定鈕不遮住可操作元素、
 *      觸控命中區足夠、畫布是正方形而且沒有超出可用範圍。
 *   B. 主控台不可以有未處理的錯誤。
 *   C. 設定彈窗：開啟、焦點鎖定、Escape 關閉、焦點歸位、靜音設定重新載入後仍保留。
 *   D. 小畫家工具列：鉛筆／直線／矩形／橢圓／橡皮擦／油漆桶都真的畫得出筆畫，
 *      復原、重做、全部清除都有作用，而且非畫家時工具列不會出現。
 *   E. 單機完整一局：選題 → 作畫 → 猜題 → 電腦回合 → 結算 → 再玩一局。
 *   F. 左側操作摘要可以展開收合，而且每一則猜題（含猜錯的）都列在「猜題紀錄」。
 *   G. 線上 UI：同一個瀏覽器開三個分頁（房主、玩家、觀戰），走完
 *      邀請連結 →（停在大廳改暱稱）→ 加入 → 準備 → 開打，
 *      並確認觀戰者的工具列與猜題框確實不存在。
 *
 * 螢幕截圖會存到 screenshots/。
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.CHECK_PORT || 3132);
const BASE = 'http://127.0.0.1:' + PORT + '/';
const DEBUG_PORT = Number(process.env.CDP_PORT || 9345);
const PROFILE = path.join(ROOT, '.chrome-rwd-test');
const SHOTS = path.join(ROOT, 'screenshots');

const VIEWPORTS = [
  { name: '手機窄版直向', width: 360, height: 640, mobile: true, dsf: 2 },
  { name: '手機中窄版直向', width: 456, height: 800, mobile: true, dsf: 2 },
  { name: '手機直向', width: 390, height: 844, mobile: true, dsf: 3 },
  { name: '手機橫向', width: 844, height: 390, mobile: true, dsf: 3 },
  { name: '小手機橫向', width: 667, height: 375, mobile: true, dsf: 2 },
  { name: '平板直向', width: 768, height: 1024, mobile: true, dsf: 2 },
  { name: '平板橫向', width: 1024, height: 768, mobile: true, dsf: 2 },
  { name: '桌機寬版', width: 1440, height: 900, mobile: false, dsf: 1 }
];

const failures = [];
function check(label, condition, detail) {
  if (condition) console.log('  ✓ ' + label);
  else {
    console.log('  ✗ ' + label + (detail ? ' — ' + detail : ''));
    failures.push(label + (detail ? ' — ' + detail : ''));
  }
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium'
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------- 極簡 CDP 用戶端 */

class CDP {
  constructor(ws, label) {
    this.ws = ws;
    this.label = label || '';
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        (this.listeners.get(msg.method) || []).forEach((fn) => fn(msg.params));
      }
    });
  }
  send(method, params) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('CDP timeout: ' + method)); }
      }, 30000);
    });
  }
  on(method, fn) {
    const list = this.listeners.get(method) || [];
    list.push(fn);
    this.listeners.set(method, list);
  }
  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression: '(function(){' + expression + '})()',
      returnByValue: true, awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error('頁面執行例外：' + (res.exceptionDetails.exception && res.exceptionDetails.exception.description));
    }
    return res.result.value;
  }
  async json(expression) { return JSON.parse(await this.eval('return JSON.stringify(' + expression + ');')); }
  async waitFor(expression, timeoutMs, label) {
    const deadline = Date.now() + (timeoutMs || 8000);
    while (Date.now() < deadline) {
      if (await this.eval('try { return !!(' + expression + '); } catch (e) { return false; }')) return true;
      await sleep(140);
    }
    throw new Error((this.label ? this.label + '：' : '') + '等不到條件 ' + (label || expression));
  }
}

/* ------------------------------ 頁面端探針（字串化送進瀏覽器） */

const PAGE_HELPERS = `
  window.__probe = {
    layout: function () {
      var doc = document.documentElement;
      var vw = window.innerWidth, vh = window.innerHeight;
      var fab = document.getElementById('b-settings');
      var fr = fab.getBoundingClientRect();

      /* 收合中的抽屜（左側摘要、收起來的猜題紀錄）是刻意畫在畫面外的，
         不算版面溢出，也不用檢查命中區。 */
      function offCanvas(el) {
        if (!el.closest) return false;
        var aside = el.closest('#game-aside');
        if (aside && !aside.classList.contains('open') && getComputedStyle(aside).position === 'fixed') return true;
        return false;
      }
      function hitBox(el) {
        var lab = el.closest ? el.closest('label') : null;
        return (lab || el).getBoundingClientRect();
      }
      /* 橫向可捲動的工具帶裡，捲出可視範圍的項目是正常的，不是版面溢出 */
      function inHScroller(el) {
        var n = el.parentElement;
        while (n && n !== document.body) {
          var ox = getComputedStyle(n).overflowX;
          if (ox === 'auto' || ox === 'scroll') return true;
          n = n.parentElement;
        }
        return false;
      }
      /* 畫布工具（工具、顏色、筆寬、填滿）數量多又常駐，刻意做得比一般按鈕小；
         它們有自己的下限，想要大按鈕的人可以開設定裡的「放大工具列」。 */
      function isCanvasTool(el) {
        if (!el.closest) return false;
        /* 提示鈕跟畫布工具一樣，刻意做小把空間讓給畫布（只要看得到、點得到） */
        return !!(el.closest('.toolbtn') || el.closest('.widthbtn') ||
          el.closest('.colorbtn') || el.closest('.fillbox') || el.closest('.hintbtn'));
      }

      var small = [];
      var smallTools = [];
      var list = document.querySelectorAll(
        '.screen.active button, .settings-modal.open button, .settings-modal.open input, .screen.active input:not([type=range])'
      );
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        if (el.hidden || el.offsetParent === null || offCanvas(el)) continue;
        var r = hitBox(el);
        if (r.width === 0 && r.height === 0) continue;
        var label = (el.id || el.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height);
        if (isCanvasTool(el)) {
          if (r.height < 34 || r.width < 34) smallTools.push(label);
        } else if (r.height < 46 || r.width < 46) {
          small.push(label);
        }
      }

      var wide = [];
      var all = document.querySelectorAll('.screen.active *, .settings-modal.open *');
      for (var j = 0; j < all.length; j++) {
        var rr = all[j].getBoundingClientRect();
        if (rr.width === 0 || all[j].offsetParent === null || offCanvas(all[j])) continue;
        if (inHScroller(all[j])) continue;
        if (rr.right > vw + 1.5 || rr.left < -1.5) {
          wide.push((all[j].id || all[j].className || all[j].tagName) + ' [' + Math.round(rr.left) + ',' + Math.round(rr.right) + ']');
        }
      }

      var covered = [];
      var clickable = document.querySelectorAll('.screen.active button:not(#b-settings), .screen.active input, .screen.active .optcard, .screen.active .pillbtn');
      for (var k = 0; k < clickable.length; k++) {
        var el2 = clickable[k];
        if (el2.hidden || el2.offsetParent === null || offCanvas(el2)) continue;
        var cr = el2.getBoundingClientRect();
        if (cr.width === 0 || cr.height === 0) continue;
        if (cr.left < fr.right && cr.right > fr.left && cr.top < fr.bottom && cr.bottom > fr.top) {
          covered.push(el2.id || el2.className);
        }
      }
      return {
        vw: vw, vh: vh,
        scrollWidth: doc.scrollWidth,
        activeScreen: (document.querySelector('.screen.active') || {}).id,
        fab: { top: Math.round(fr.top), right: Math.round(vw - fr.right), w: Math.round(fr.width), h: Math.round(fr.height) },
        smallTargets: small.slice(0, 6),
        smallTools: smallTools.slice(0, 6),
        overflowing: wide.slice(0, 6),
        fabCovers: covered.slice(0, 6)
      };
    },
    stage: function () {
      var c = document.getElementById('board');
      var s = document.getElementById('stage');
      var cr = c.getBoundingClientRect();
      var sr = s.getBoundingClientRect();
      var toolbar = document.getElementById('toolbar');
      var guessbar = document.getElementById('guessbar');
      return {
        canvas: { w: Math.round(cr.width), h: Math.round(cr.height), l: Math.round(cr.left), r: Math.round(cr.right), t: Math.round(cr.top), b: Math.round(cr.bottom) },
        stage: { w: Math.round(sr.width), h: Math.round(sr.height), l: Math.round(sr.left), r: Math.round(sr.right), t: Math.round(sr.top), b: Math.round(sr.bottom) },
        ratio: Math.round((cr.width / Math.max(1, cr.height)) * 100) / 100,
        fill: Math.round((cr.width * cr.height) / Math.max(1, sr.width * sr.height) * 100),
        toolbarShown: !toolbar.hidden,
        guessbarShown: !guessbar.hidden,
        recentCount: document.querySelectorAll('#sum-list li').length,
        asideOpen: document.getElementById('game-aside').classList.contains('open'),
        overlayShown: !document.getElementById('stage-overlay').hidden
      };
    },
    topActions: function () {
      var group = document.querySelector('.game-top-actions');
      var aside = document.getElementById('b-aside-toggle');
      var settings = document.getElementById('b-game-settings');
      var fab = document.getElementById('b-settings');
      function rect(el) {
        var r = el.getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), top: Math.round(r.top), bottom: Math.round(r.bottom) };
      }
      return { group: rect(group), aside: rect(aside), settings: rect(settings), fab: rect(fab) };
    },
    click: function (sel) {
      var el = document.querySelector(sel);
      if (!el || el.disabled) return false;
      el.click();
      return true;
    },
    text: function (sel) {
      var el = document.querySelector(sel);
      return el ? (el.textContent || '').trim() : null;
    },
    exists: function (sel) { return !!document.querySelector(sel); },
    game: function () {
      var a = window.DrawGuessApp;
      if (!a) return null;
      var v = a.view;
      return {
        mode: a.mode, screen: a.screen,
        phase: v && v.game ? v.game.phase : null,
        roomPhase: v && v.room ? v.room.phase : null,
        turnNo: v && v.game ? v.game.turnNo : null,
        totalTurns: v && v.game ? v.game.totalTurns : null,
        isDrawer: v && v.game ? v.game.you.isDrawer : null,
        canDraw: v ? v.you.can.draw : null,
        canGuess: v ? v.you.can.guess : null,
        canPick: v ? v.you.can.pick : null,
        role: v ? v.you.role : null,
        over: v && v.game ? v.game.over : null,
        strokes: a.paint ? a.paint.count() : 0,
        redo: a.paint ? a.paint.redoCount() : 0,
        scores: v && v.game ? v.game.players.map(function (p) { return p.name + ':' + p.score; }).join(',') : '',
        answer: v && v.game ? v.game.answer : null,
        mask: v && v.game && v.game.hint ? v.game.hint.mask : null,
        feed: a.feed.length,
        code: a.roomCode
      };
    }
  };
`;

/* ------------------------------------------------------------ 主流程 */

async function attach(target, label) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
    setTimeout(() => reject(new Error('WebSocket 連線逾時')), 10000);
  });
  const cdp = new CDP(ws, label);
  const errors = [];
  cdp.on('Runtime.exceptionThrown', (p) => {
    errors.push((p.exceptionDetails && p.exceptionDetails.exception && p.exceptionDetails.exception.description) || '未知例外');
  });
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') errors.push(p.args.map((a) => a.description || a.value).join(' '));
  });
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: PAGE_HELPERS });
  cdp.errors = errors;
  return cdp;
}

async function goto(cdp, url) {
  await cdp.send('Page.navigate', { url });
  await sleep(700);
  await cdp.waitFor('window.__probe && window.DrawGuessApp', 10000, '頁面初始化');
}

/** 在畫布上真的拖一條線（會產生 pointerdown / move / up） */
async function drag(cdp, from, to, steps) {
  const n = steps || 6;
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', clickCount: 1, pointerType: 'mouse' });
  for (let i = 1; i <= n; i++) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved', button: 'left', buttons: 1, pointerType: 'mouse',
      x: Math.round(from.x + (to.x - from.x) * i / n),
      y: Math.round(from.y + (to.y - from.y) * i / n)
    });
    await sleep(25);
  }
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', clickCount: 1, pointerType: 'mouse' });
  await sleep(120);
}

async function tap(cdp, x, y) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1, pointerType: 'mouse' });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1, pointerType: 'mouse' });
  await sleep(120);
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.log('找不到 Chrome 或 Edge，略過瀏覽器檢查。設定 CHROME_PATH 環境變數後可再執行。');
    process.exit(0);
  }
  fs.mkdirSync(SHOTS, { recursive: true });

  console.log('啟動遊戲伺服器 (port ' + PORT + ')…');
  const server = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
    env: Object.assign({}, process.env, { PORT: String(PORT), HOST: '127.0.0.1', GAME_ALLOWED_ORIGIN: '*', ROOM_TICK_MS: '250' }),
    stdio: 'ignore'
  });
  let up = false;
  for (let i = 0; i < 40 && !up; i++) {
    await sleep(200);
    try { up = (await fetch(BASE + 'health')).ok; } catch (e) {}
  }
  if (!up) { server.kill(); throw new Error('伺服器沒有啟動'); }

  console.log('啟動無頭瀏覽器…');
  const browser = spawn(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + DEBUG_PORT, '--user-data-dir=' + PROFILE, 'about:blank'
  ], { stdio: 'ignore' });

  const cleanup = () => { try { browser.kill(); } catch (e) {} try { server.kill(); } catch (e) {} };
  process.on('exit', cleanup);

  let firstTarget = null;
  for (let i = 0; i < 50 && !firstTarget; i++) {
    await sleep(300);
    try {
      const list = await (await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/list')).json();
      firstTarget = list.find((t) => t.type === 'page');
    } catch (e) {}
  }
  if (!firstTarget) { cleanup(); throw new Error('無法連上瀏覽器的偵錯埠'); }

  const cdp = await attach(firstTarget, '主分頁');

  async function shot(name, tab) {
    try {
      const res = await (tab || cdp).send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(SHOTS, name.replace(/[\\/:*?"<>|]/g, '_') + '.png'), Buffer.from(res.data, 'base64'));
    } catch (e) { /* 截圖失敗不影響檢查 */ }
  }
  async function setViewport(v) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: v.width, height: v.height, deviceScaleFactor: v.dsf, mobile: v.mobile });
    await sleep(320);
  }

  function assertLayout(where, v, info) {
    check(where + '：沒有水平溢出',
      info.scrollWidth <= v.width + 2 && info.overflowing.length === 0,
      'scrollWidth=' + info.scrollWidth + ' 溢出=' + JSON.stringify(info.overflowing));
    check(where + '：設定鈕在安全區內且夠大',
      info.fab.w >= 46 && info.fab.h >= 46 && info.fab.top >= 0 && info.fab.top < 90 && info.fab.right >= 0 && info.fab.right < 90,
      JSON.stringify(info.fab));
    check(where + '：設定鈕沒有蓋住其他可操作元素', info.fabCovers.length === 0, JSON.stringify(info.fabCovers));
    check(where + '：觸控命中區都夠大', info.smallTargets.length === 0, JSON.stringify(info.smallTargets));
    check(where + '：畫布工具雖然小，但沒有小到看不見（≥34px）',
      info.smallTools.length === 0, JSON.stringify(info.smallTools));
  }

  /* ================= A. 各尺寸的版面檢查 ================= */

  for (const v of VIEWPORTS) {
    console.log('\n【' + v.name + ' ' + v.width + '×' + v.height + '】');
    await setViewport(v);
    await goto(cdp, BASE);
    await cdp.eval('localStorage.clear(); return 1;');
    await goto(cdp, BASE);

    let info = await cdp.json('window.__probe.layout()');
    check(v.name + '：第一次進來直接顯示純文字教學', info.activeScreen === 's-help', info.activeScreen);
    assertLayout('教學', v, info);
    await shot(v.name + '-1-教學');

    await cdp.eval('window.__probe.click("#b-tut-skip"); return 1;');
    await sleep(250);
    info = await cdp.json('window.__probe.layout()');
    check(v.name + '：跳過教學後回到主選單', info.activeScreen === 's-home', info.activeScreen);
    assertLayout('主選單', v, info);
    await shot(v.name + '-2-主選單');

    /* 設定彈窗 */
    await cdp.eval('window.__probe.click("#b-settings"); return 1;');
    await sleep(300);
    info = await cdp.json('window.__probe.layout()');
    assertLayout('設定彈窗', v, info);
    const modal = await cdp.json('({open:document.getElementById("settings-modal").classList.contains("open"),focus:document.activeElement.id,aria:document.getElementById("settings-modal").getAttribute("aria-hidden"),role:document.getElementById("settings-modal").getAttribute("role"),modalAttr:document.getElementById("settings-modal").getAttribute("aria-modal")})');
    check(v.name + '：設定是 Modal 彈窗、焦點進入面板、aria 正確',
      modal.open && modal.focus === 'settings-panel' && modal.aria === 'false' && modal.role === 'dialog' && modal.modalAttr === 'true',
      JSON.stringify(modal));
    const mixed = await cdp.json('({hasGameActions:!!document.querySelector("#settings-modal #gs-skip") || !!document.querySelector("#settings-modal #gs-quit"),gameOpen:document.getElementById("game-settings-modal").classList.contains("open")})');
    check(v.name + '：系統設定不混入本局操作', !mixed.hasGameActions && !mixed.gameOpen, JSON.stringify(mixed));
    await shot(v.name + '-3-設定彈窗');

    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(250);
    const closed = await cdp.json('({open:document.getElementById("settings-modal").classList.contains("open"),focus:document.activeElement.id})');
    check(v.name + '：Escape 關閉設定並把焦點還給設定鈕',
      !closed.open && closed.focus === 'b-settings', JSON.stringify(closed));

    /* 單機設定 */
    await cdp.eval('window.__probe.click("#b-solo"); return 1;');
    await sleep(250);
    info = await cdp.json('window.__probe.layout()');
    check(v.name + '：進入單機設定', info.activeScreen === 's-solo', info.activeScreen);
    assertLayout('單機設定', v, info);
    await shot(v.name + '-4-單機設定');

    /* 對局畫面：單機沒有電腦對手了，練幾次、畫多久都不用設定，直接開始 */
    await cdp.eval(`
      window.__probe.click('#b-solo-start');
      return 1;
    `);
    await cdp.waitFor('window.DrawGuessApp.mode === "solo"', 6000, '進入對局');
    await sleep(500);
    info = await cdp.json('window.__probe.layout()');
    check(v.name + '：進入對局畫面', info.activeScreen === 's-game', info.activeScreen);
    assertLayout('對局中', v, info);
    const topAlignment = await cdp.json('(function(){return ["b-game-back","b-game-settings","b-settings"].map(function(id){return document.getElementById(id).getBoundingClientRect().top;});})()');
    check(v.name + '：返回、對局設定與系統設定在同一水平線',
      Math.max.apply(null, topAlignment) - Math.min.apply(null, topAlignment) <= 1,
      JSON.stringify(topAlignment));
    if (v.width <= 620) {
      /* 單機沒有左側摘要，只剩「對局設定」一顆，一樣要靠攏在系統設定鈕左邊 */
      const topActions = await cdp.json('window.__probe.topActions()');
      check(v.name + '：上方對局按鈕靠攏且不被設定鈕拉開',
        topActions.group.width <= 132 &&
        topActions.fab.left - topActions.settings.right <= 8 &&
        topActions.group.right <= topActions.fab.left + 1,
        JSON.stringify(topActions));
    }

    await sleep(400);
    const stage = await cdp.json('window.__probe.stage()');
    check(v.name + '：畫布是正方形', Math.abs(stage.ratio - 1) < 0.03, 'ratio=' + stage.ratio);
    check(v.name + '：畫布沒有超出可用範圍',
      stage.canvas.w <= stage.stage.w + 2 && stage.canvas.h <= stage.stage.h + 2,
      JSON.stringify(stage));
    /* 畫布是正方形，所以「最大化」= 邊長貼齊舞台較短的那一邊 */
    const limit = Math.min(stage.stage.w, stage.stage.h);
    check(v.name + '：畫布已經吃滿可用空間的較短邊',
      stage.canvas.w >= limit - 10, stage.canvas.w + ' / ' + limit);
    await shot(v.name + '-5-對局中');

    /* 單機只有自己一個人：左側操作摘要、玩家分數列、三張提示、階段與倒數標籤都拿掉，空間全部給畫布 */
    const solo = await cdp.json('(function(){function vis(id){var e=document.getElementById(id);if(!e)return false;var r=e.getBoundingClientRect();return getComputedStyle(e).display!=="none"&&r.width>0&&r.height>0;}return {aside:vis("game-aside"),toggle:vis("b-aside-toggle"),strip:vis("canvastop"),status:vis("phase-chip")||vis("timer-chip")};})()');
    check(v.name + '：單機沒有左側操作摘要（也沒有開它的按鈕）', !solo.aside && !solo.toggle, JSON.stringify(solo));
    check(v.name + '：單機畫布上方不再佔一列玩家分數／提示', !solo.strip, JSON.stringify(solo));
    check(v.name + '：單機上排不顯示階段與倒數（不限時）', !solo.status, JSON.stringify(solo));
    check(v.name + '：沒有猜題紀錄浮層',
      await cdp.eval('return !document.getElementById("feeddock") && !document.getElementById("feed-panel");'));

    /* 工具列展開時再量一次：之前的檢查都在「選題中」，工具列是收著的，
       所以工具、顏色、筆寬那些按鈕的命中區從來沒被驗到。 */
    await cdp.eval(`var a = window.DrawGuessApp, st = a.solo.state;
      if (st.drawerId !== 'me') { st.drawerId = 'me'; st.order = ['me'].concat(st.order.filter(function(x){return x!=='me';})); }
      /* 固定畫單字題「貓」：題目越短，抬頭越容易只剩一行、比右上角設定鈕矮，
         工具欄第一排就會鑽到設定鈕底下。隨機抽題時只有偶爾抽到短題才測得到。 */
      st.choices[0] = 'cat';
      window.Rules.pickWord(st, 'me', st.choices[0], Date.now());
      return 1;`);
    await cdp.waitFor('window.DrawGuessApp.view && window.DrawGuessApp.view.you.can.draw', 8000, '進入作畫');
    await sleep(500);
    const drawStage = await cdp.json('window.__probe.stage()');
    const drawInfo = await cdp.json('window.__probe.layout()');
    check(v.name + '：畫家的工具列有出現', drawStage.toolbarShown === true);
    assertLayout('作畫中（工具列展開）', v, drawInfo);
    const drawLimit = Math.min(drawStage.stage.w, drawStage.stage.h);
    check(v.name + '：工具列展開時畫布仍吃滿較短邊',
      drawStage.canvas.w >= drawLimit - 10, drawStage.canvas.w + ' / ' + drawLimit);
    /* 畫布是這個遊戲的主體，不能被工具列壓到只剩一小塊 */
    check(v.name + '：畫布邊長至少是視窗較短邊的六成',
      drawStage.canvas.w >= Math.min(v.width, v.height) * 0.6,
      drawStage.canvas.w + ' / 視窗較短邊 ' + Math.min(v.width, v.height));
    await shot(v.name + '-7-作畫中');

    /* Offline reference: both languages, staged strokes and actual modal geometry. */
    for (const lang of ['zh-Hant', 'en']) {
      await cdp.eval('window.I18N.setLang(' + JSON.stringify(lang) + '); document.getElementById("b-reference").focus(); document.getElementById("b-reference").click(); return 1;');
      await sleep(180);
      const reference = await cdp.json(`(function(){
        var panel=document.getElementById('reference-panel'), r=panel.getBoundingClientRect();
        var ids=['reference-word','reference-picture','reference-steps','reference-note','reference-done','reference-close'];
        var rects=ids.map(function(id){var e=document.getElementById(id),b=e.getBoundingClientRect();return {id:id,l:b.left,t:b.top,r:b.right,b:b.bottom,w:b.width,h:b.height};});
        var overlaps=[];
        rects.forEach(function(a,i){rects.slice(i+1).forEach(function(b){if(Math.min(a.r,b.r)-Math.max(a.l,b.l)>2&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>2)overlaps.push([a.id,b.id]);});});
        return {open:document.getElementById('reference-modal').getAttribute('aria-hidden')==='false',
          inView:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,
          content:rects.every(function(b){return b.l>=r.left&&b.t>=r.top&&b.r<=r.right+1&&b.b<=r.bottom+1&&b.w>0&&b.h>0;}),
          overlaps:overlaps, paths:document.querySelectorAll('#reference-picture path').length,
          strokes:JSON.stringify(window.DrawGuessApp.solo.state.strokes),
          picture:rects[1], word:document.getElementById('reference-word').textContent};
      })()`);
      const label = v.name + ' ' + lang + ' 範本';
      check(label + '：畫家可開啟且題目正確', reference.open && reference.word === '貓');
      check(label + '：彈窗與全部內容都在視窗內', reference.inView && reference.content, JSON.stringify(reference));
      check(label + '：圖片、步驟、說明與按鈕互不重疊', reference.overlaps.length === 0, JSON.stringify(reference.overlaps));
      check(label + '：圖像有足夠參考尺寸', reference.picture.w >= 120 && reference.picture.h >= 100, JSON.stringify(reference.picture));
      await shot(v.name + '-範本-' + lang);
      await cdp.eval(`document.querySelector('[data-reference-step="1"]').click(); return 1;`);
      const firstPaths = await cdp.eval('return document.querySelectorAll("#reference-picture path").length;');
      check(label + '：起筆階段只顯示部分筆畫', firstPaths > 0 && firstPaths < reference.paths);
      check(label + '：查看範本不會修改作品', await cdp.eval('return JSON.stringify(window.DrawGuessApp.solo.state.strokes);') === reference.strokes);
      await cdp.eval('document.getElementById("reference-done").focus(); return 1;');
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      check(label + '：Tab 焦點鎖在彈窗內', await cdp.eval('return document.activeElement.id === "reference-close";'));
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      check(label + '：Escape 關閉並回到入口', await cdp.eval('return document.getElementById("reference-modal").getAttribute("aria-hidden")==="true" && document.activeElement.id==="b-reference";'));
    }
    /* Expanded topics use the same pen-stroke recipes as the drawing game. */
    const gameRecipeReferenceId = await cdp.eval(`var word=window.Words.all().find(function(item){
      return item.id.indexOf('w-')===0 && !window.MeaningReference.get(item.id) &&
        window.Words.strokesOf(item.id).length>=3;
    }); return word && word.id;`);
    check(v.name + '：擴充題有遊戲筆畫範本', !!gameRecipeReferenceId, '找不到可驗證的擴充題');
    if (gameRecipeReferenceId) {
      await cdp.eval(
        'window.__recipeReferenceOriginal=window.DrawGuessApp.solo.state.wordId; ' +
        'window.DrawGuessApp.solo.state.wordId=' + JSON.stringify(gameRecipeReferenceId) + '; return 1;'
      );
      await cdp.waitFor('window.DrawGuessApp.view.game.referenceId === ' + JSON.stringify(gameRecipeReferenceId), 3000, '切換遊戲筆畫範本');
      await cdp.eval('document.getElementById("b-reference").click(); return 1;');
      await cdp.waitFor('document.querySelectorAll("#reference-picture path").length >= 3', 3000, '顯示遊戲筆畫範本');
      const recipeLayout = await cdp.json(`(function(){
        var panel=document.getElementById('reference-panel'), r=panel.getBoundingClientRect();
        var picture=document.getElementById('reference-picture'), b=picture.getBoundingClientRect();
        var svg=picture.querySelector('svg');
        return {open:document.getElementById('reference-modal').getAttribute('aria-hidden')==='false',
          inView:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,
          pictureInView:b.left>=r.left&&b.top>=r.top&&b.right<=r.right+1&&b.bottom<=r.bottom+1,
          svg:!!svg,paths:picture.querySelectorAll('path').length,noImage:!picture.querySelector('img'),
          noCatalog:!window.OfflineReferences,creditRemoved:!document.getElementById('reference-credit'),
          strokes:JSON.stringify(window.DrawGuessApp.solo.state.strokes),word:document.getElementById('reference-word').textContent};
      })()`);
      check(v.name + '：擴充題由 SVG 遊戲筆畫繪製且符合螢幕尺寸',
        recipeLayout.open && recipeLayout.inView && recipeLayout.pictureInView && recipeLayout.svg &&
          recipeLayout.paths >= 3 && recipeLayout.noImage && recipeLayout.noCatalog && recipeLayout.creditRemoved,
        JSON.stringify(recipeLayout));
      await shot(v.name + '-範本-遊戲筆畫');
      await cdp.eval('document.querySelectorAll("[data-reference-step]")[0].click(); return 1;');
      const firstRecipePaths = await cdp.eval('return document.querySelectorAll("#reference-picture path").length;');
      check(v.name + '：遊戲筆畫能分階段顯示且作品不變',
        firstRecipePaths > 0 && firstRecipePaths < recipeLayout.paths &&
          await cdp.eval('return JSON.stringify(window.DrawGuessApp.solo.state.strokes) === ' + JSON.stringify(recipeLayout.strokes) + ';'));
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await cdp.waitFor('document.getElementById("reference-modal").getAttribute("aria-hidden")==="true"', 3000, '關閉遊戲筆畫範本');
      await cdp.eval('window.DrawGuessApp.solo.state.wordId=window.__recipeReferenceOriginal; return 1;');
      await cdp.waitFor('window.DrawGuessApp.view.game.referenceId === window.DrawGuessApp.solo.state.wordId', 3000, '還原範本題目');
    }
    const semanticReferenceId = await cdp.eval('return window.MeaningReference.ids()[0] || null;');
    if (semanticReferenceId) {
      await cdp.eval(
        'window.__semanticReferenceOriginal=window.DrawGuessApp.solo.state.wordId; ' +
        'window.DrawGuessApp.solo.state.wordId=' + JSON.stringify(semanticReferenceId) + '; return 1;'
      );
      await cdp.waitFor('window.DrawGuessApp.view.game.referenceId === ' + JSON.stringify(semanticReferenceId), 3000, '切換語意組圖範本');
      await cdp.eval('document.getElementById("b-reference").click(); return 1;');
      await cdp.waitFor('document.querySelectorAll("#reference-picture path").length > 0', 3000, '顯示離線語意組圖');
      const semanticLayout = await cdp.json(`(function(){
        var panel=document.getElementById('reference-panel'), r=panel.getBoundingClientRect();
        var picture=document.getElementById('reference-picture'), b=picture.getBoundingClientRect();
        return {open:document.getElementById('reference-modal').getAttribute('aria-hidden')==='false',
          inView:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,
          pictureInView:b.left>=r.left&&b.top>=r.top&&b.right<=r.right+1&&b.bottom<=r.bottom+1,
          svg:!!picture.querySelector('svg'),paths:picture.querySelectorAll('path').length,
          noRemoteImage:!picture.querySelector('img'),creditRemoved:!document.getElementById('reference-credit'),
          strokes:JSON.stringify(window.DrawGuessApp.solo.state.strokes),word:document.getElementById('reference-word').textContent};
      })()`);
      check(v.name + '：語意組圖在螢幕內且不載入網路圖片',
        semanticLayout.open && semanticLayout.inView && semanticLayout.pictureInView &&
          semanticLayout.svg && semanticLayout.paths > 0 && semanticLayout.noRemoteImage && semanticLayout.creditRemoved,
        JSON.stringify(semanticLayout));
      await shot(v.name + '-範本-離線語意圖');
      await cdp.eval('document.querySelectorAll("[data-reference-step]")[0].click(); return 1;');
      const firstSemanticPaths = await cdp.eval('return document.querySelectorAll("#reference-picture path").length;');
      check(v.name + '：語意圖能切換起筆階段且作品不變',
        firstSemanticPaths > 0 && firstSemanticPaths < semanticLayout.paths &&
          await cdp.eval('return JSON.stringify(window.DrawGuessApp.solo.state.strokes) === ' + JSON.stringify(semanticLayout.strokes) + ';'));
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await cdp.waitFor('document.getElementById("reference-modal").getAttribute("aria-hidden")==="true"', 3000, '關閉語意組圖');
      await cdp.eval('window.DrawGuessApp.solo.state.wordId=window.__semanticReferenceOriginal; return 1;');
      await cdp.waitFor('window.DrawGuessApp.view.game.referenceId === window.DrawGuessApp.solo.state.wordId', 3000, '還原語意組圖題目');
    }
    await cdp.eval('window.I18N.setLang("zh-Hant"); return 1;');

    /* 版面微調：題號只留題目列、橫向工具列分組、較高手機展開不滑、平板直向工具放大 */
    const tb = await cdp.json(`(function(){
      function R(e){ if(!e) return null; var r=e.getBoundingClientRect(); return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}; }
      var colors=document.getElementById('color-list'), scroll=document.getElementById('toolscroll');
      var tools=[].slice.call(document.querySelectorAll('#tool-list .toolbtn')).map(function(e){return e.getBoundingClientRect().width;});
      return {
        roundChip: getComputedStyle(document.getElementById('round-chip')).display,
        undo:R(document.getElementById('b-undo')), redo:R(document.getElementById('b-redo')), clear:R(document.getElementById('b-clear')),
        skip:R(document.getElementById('b-solo-next')),
        colorsHeight: colors.querySelector('button').getBoundingClientRect().height,
        filesVisible: [].slice.call(document.querySelectorAll('#solo-file-actions button')).every(function(e){
          var r=e.getBoundingClientRect(), hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
          return r.top>=0 && r.bottom<=innerHeight+1 && r.right<=innerWidth+1 && e.contains(hit);
        }),
        colorsOverflow: colors.scrollWidth - colors.clientWidth,
        scrollOverflow: scroll.scrollWidth - scroll.clientWidth,
        minTool: Math.min.apply(null, tools)
      };
    })()`);
    check(v.name + '：題號只顯示在題目列（上排不再重複一個「第 N 題」）', tb.roundChip === 'none', tb.roundChip);
    check(v.name + '：存檔、圖片、載入與換題可直接操作，不被遮擋', tb.filesVisible);
    const portrait = v.height > v.width;
    if (!portrait && v.width >= 560) {
      check(v.name + '：橫向工具列的復原／重做／清除排在同一排',
        Math.abs(tb.undo.t - tb.redo.t) < 3 && Math.abs(tb.undo.t - tb.clear.t) < 3, JSON.stringify([tb.undo, tb.redo, tb.clear]));
    }
    if (portrait && v.width <= 620 && v.height >= 740) {
      check(v.name + '：手機直向色盤維持 44px 觸控高度', tb.colorsHeight >= 44, 'height=' + tb.colorsHeight);
      check(v.name + '：較高的手機直向粗細與復原鍵不用左右滑', tb.scrollOverflow <= 1, 'overflow=' + tb.scrollOverflow);
      check(v.name + '：清除鍵沒有被「換題」擋住',
        tb.clear.r <= tb.skip.l + 1 || tb.clear.b <= tb.skip.t + 1 || tb.clear.t >= tb.skip.b - 1, JSON.stringify([tb.clear, tb.skip]));
    }
    if (portrait && v.width >= 621) {
      check(v.name + '：平板直向工具鈕放大到 48px 以上', tb.minTool >= 48, 'min=' + tb.minTool);
    }

    /* 工具鈕刻意做小了，設定裡的「放大工具列」就是它的無障礙備案：
       打開之後每一顆都要回到 46px 以上。 */
    await cdp.eval('document.body.classList.add("big-tools"); return 1;');
    await sleep(350);
    const bigInfo = await cdp.json(`(function(){
      var out = [];
      var list = document.querySelectorAll('#toolbar .toolbtn, #toolbar .widthbtn, #toolbar .colorbtn, #toolbar .fillbox');
      for (var i = 0; i < list.length; i++) {
        var r = list[i].getBoundingClientRect();
        if (r.width === 0) continue;
        if (r.width < 46 || r.height < 46) out.push(list[i].className + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
      return { small: out.slice(0, 5), total: list.length };
    })()`);
    check(v.name + '：打開「放大工具列」後每顆工具鈕都 ≥46px',
      bigInfo.total > 0 && bigInfo.small.length === 0, JSON.stringify(bigInfo));
    await cdp.eval('document.body.classList.remove("big-tools"); return 1;');
    await sleep(250);

    check(v.name + '：主控台沒有未處理錯誤', cdp.errors.length === 0, cdp.errors.slice(0, 2).join(' | '));
    cdp.errors.length = 0;
  }

  /* ================= C. 設定保存 ================= */
  console.log('\n【設定保存】');
  await setViewport({ width: 1024, height: 768, mobile: true, dsf: 2 });
  await goto(cdp, BASE);
  await cdp.eval('window.__probe.click("#b-tut-skip"); window.__probe.click("#b-settings"); return 1;');
  await sleep(300);
  await cdp.eval('var m=document.getElementById("settings-music"); m.checked=false; m.dispatchEvent(new Event("change")); var s=document.getElementById("settings-sfx"); s.checked=false; s.dispatchEvent(new Event("change")); return 1;');
  await sleep(200);
  check('可以同時關掉音樂與音效', await cdp.eval('return !window.Sound.isMusicOn() && !window.Sound.isSfxOn();'));
  await goto(cdp, BASE);
  check('重新載入後靜音設定仍保留', await cdp.eval('return !window.Sound.isMusicOn() && !window.Sound.isSfxOn();'));
  await cdp.eval('window.Sound.resetDefaults(); return 1;');
  check('恢復預設會把聲音打開', await cdp.eval('return window.Sound.isMusicOn() && window.Sound.isSfxOn();'));

  /* ================= D/E. 小畫家工具 + 單機一局 ================= */
  console.log('\n【小畫家工具與單機一局】');
  await setViewport({ width: 1024, height: 768, mobile: true, dsf: 2 });
  await goto(cdp, BASE);
  await cdp.eval('localStorage.clear(); return 1;');
  await goto(cdp, BASE);
  await cdp.eval(`
    window.__probe.click('#b-tut-skip');
    window.__probe.click('#b-solo');
    window.__probe.click('#b-solo-start');
    return 1;
  `);
  await cdp.waitFor('window.DrawGuessApp.mode === "solo"', 6000, '開始單機');

  /* 單機沒有電腦對手了，只有你自己，永遠輪到自己選題 */
  await cdp.waitFor('window.DrawGuessApp.view && window.DrawGuessApp.view.you.can.pick', 6000, '輪到自己選題');
  let g = await cdp.json('window.__probe.game()');
  check('輪到自己時可以選題', g.canPick === true, JSON.stringify(g));
  check('選題時看得到三個候選', await cdp.eval('return document.querySelectorAll(".wordchoice").length === 3;'));
  await shot('單機-選題');

  await cdp.eval('document.querySelectorAll(".wordchoice")[0].click(); return 1;');
  await cdp.waitFor('window.DrawGuessApp.view.you.can.draw', 6000, '進入作畫');
  g = await cdp.json('window.__probe.game()');
  check('選完題目可以開始畫', g.canDraw === true && g.phase === 'drawing', JSON.stringify(g));
  check('畫家看得到自己的題目', typeof g.answer === 'string' && g.answer.length > 0, g.answer);
  const barShown = await cdp.json('window.__probe.stage()');
  check('畫家看到工具列、看不到猜題框', barShown.toolbarShown === true && barShown.guessbarShown === false, JSON.stringify(barShown));

  /* 提示是給「別人」猜用的，單機只有自己，三張提示整塊不顯示（線上的提示區塊另外在線上流程裡驗） */
  check('單機不顯示提示區塊（只有自己一個人，用不到）',
    await cdp.eval('var h=document.getElementById("hintrow"); return h.getBoundingClientRect().height === 0;'));
  check('單機不限時：作畫中沒有倒數',
    await cdp.eval('return window.DrawGuessApp.solo.state.deadline === 0 && getComputedStyle(document.getElementById("timer-chip")).display === "none";'));

  /* 單機沒有電腦對手、只有你自己，「畫完了」沒有其他人可以通知，整顆鈕藏起來；
     改用「換題」，按下去會直接結束這一題並公布答案。 */
  const doneBtn = await cdp.json('(function(){var b=document.getElementById("b-done");return {hidden:b.hidden};})()');
  check('單機沒有「畫完了」鈕（藏起來）', doneBtn.hidden === true, JSON.stringify(doneBtn));

  const beforeSkip = await cdp.json('(function(){var g=window.DrawGuessApp.view.game;return {turnNo:g.turnNo,phase:g.phase};})()');
  await cdp.eval('document.getElementById("b-reference").click(); return 1;');
  await cdp.eval('window.__probe.click("#b-solo-next"); return 1;');
  await sleep(300);
  const afterSkip = await cdp.json('(function(){var g=window.DrawGuessApp.view.game;return {turnNo:g.turnNo,phase:g.phase};})()');
  check('按「換題」直接結束這一題並公布答案',
    afterSkip.turnNo === beforeSkip.turnNo && afterSkip.phase === 'reveal', JSON.stringify(afterSkip));
  check('回合揭曉自動關閉範本並隱藏入口', await cdp.eval('return document.getElementById("reference-modal").getAttribute("aria-hidden")==="true" && document.getElementById("b-reference").hidden;'));

  /* 公布答案時有「下一題」可以馬上換題，不用等倒數 */
  check('公布答案時有「下一題」按鈕', await cdp.eval('return !!document.querySelector("#overlay-card [data-act=solo-next]");'));
  await cdp.eval('window.__probe.click("#overlay-card [data-act=solo-next]"); return 1;');
  await cdp.waitFor('window.DrawGuessApp.view.game.phase === "drawing" || window.DrawGuessApp.view.game.phase === "picking"', 3000, '換下一題');
  check('按「下一題」馬上換題', true);
  check('單機不限時：選題不會倒數自動挑',
    await cdp.eval('var c=document.getElementById("overlay-card").textContent; return c.indexOf("不限時間") >= 0 && c.indexOf("秒內沒選") < 0;'),
    await cdp.eval('return document.getElementById("overlay-card").textContent;'));
  if ((await cdp.json('window.DrawGuessApp.view.game.phase')) === 'picking') {
    await cdp.eval('document.querySelectorAll(".wordchoice")[0].click(); return 1;');
    await cdp.waitFor('window.DrawGuessApp.view.game.phase === "drawing"', 6000, '再次進入作畫');
  }

  /* 上一頁要先問過：按了只開確認框，不會直接把人踢出對局 */
  await cdp.eval('window.__probe.click("#b-game-back"); return 1;');
  await sleep(220);
  const askedLeave = await cdp.json('(function(){return {open:document.getElementById("confirm-modal").classList.contains("open"),screen:(document.querySelector(".screen.active")||{}).id,text:(document.getElementById("confirm-text").textContent||"").trim()};})()');
  check('上一頁會先跳確認框', askedLeave.open === true, JSON.stringify(askedLeave));
  check('還沒確認之前留在對局裡', askedLeave.screen === 's-game', JSON.stringify(askedLeave));
  await cdp.eval('window.__probe.click("#confirm-cancel"); return 1;');
  await sleep(220);
  const stayed = await cdp.json('(function(){return {open:document.getElementById("confirm-modal").classList.contains("open"),screen:(document.querySelector(".screen.active")||{}).id,canDraw:!!(window.DrawGuessApp.view&&window.DrawGuessApp.view.you.can.draw)};})()');
  check('取消之後關掉確認框、繼續玩', stayed.open === false && stayed.screen === 's-game' && stayed.canDraw === true, JSON.stringify(stayed));

  const box = await cdp.json('(function(){var r=document.getElementById("board").getBoundingClientRect();return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};})()');
  const px = (fx, fy) => ({ x: Math.round(box.x + box.w * fx), y: Math.round(box.y + box.h * fy) });

  /* 每個工具都真的畫得出東西 */
  const tools = [
    ['pen', () => drag(cdp, px(0.2, 0.2), px(0.5, 0.4))],
    ['brush', () => drag(cdp, px(0.25, 0.5), px(0.55, 0.6))],
    ['line', () => drag(cdp, px(0.2, 0.75), px(0.8, 0.75))],
    ['rect', () => drag(cdp, px(0.3, 0.25), px(0.7, 0.5))],
    ['ellipse', () => drag(cdp, px(0.35, 0.3), px(0.65, 0.45))],
    ['erase', () => drag(cdp, px(0.4, 0.35), px(0.5, 0.35))],
    ['fill', () => tap(cdp, px(0.85, 0.15).x, px(0.85, 0.15).y)]
  ];
  for (const [key, act] of tools) {
    const before = (await cdp.json('window.__probe.game()')).strokes;
    await cdp.eval('window.__probe.click(\'.toolbtn[data-tool=' + key + ']\'); return 1;');
    await sleep(120);
    const selected = await cdp.eval('return document.querySelector(\'.toolbtn[data-tool=' + key + ']\').getAttribute("aria-checked") === "true";');
    await act();
    const after = (await cdp.json('window.__probe.game()')).strokes;
    check('工具「' + key + '」可以選取並畫得出筆畫', selected && after > before, before + ' → ' + after);
  }
  await shot('單機-作畫');

  /* 顏色與筆寬 */
  await cdp.eval('document.querySelectorAll(".colorbtn")[3].click(); document.querySelectorAll(".widthbtn")[2].click(); return 1;');
  await sleep(150);
  check('可以換顏色與筆寬',
    await cdp.eval('return window.DrawGuessApp.paint.getColor() === 3 && window.DrawGuessApp.paint.getWidth() === 2;'));

  /* 復原、重做、清除 */
  let cnt = (await cdp.json('window.__probe.game()')).strokes;
  await cdp.eval('window.__probe.click("#b-undo"); return 1;');
  await sleep(200);
  let after = await cdp.json('window.__probe.game()');
  check('復原會少一筆並存進重做堆疊', after.strokes === cnt - 1 && after.redo >= 1, cnt + ' → ' + after.strokes + ' redo=' + after.redo);
  await cdp.eval('window.__probe.click("#b-redo"); return 1;');
  await sleep(200);
  after = await cdp.json('window.__probe.game()');
  check('重做會把那一筆加回來', after.strokes === cnt, after.strokes + '/' + cnt);
  await cdp.eval('window.__probe.click("#b-clear"); return 1;');
  await sleep(200);
  after = await cdp.json('window.__probe.game()');
  check('全部清除會把畫布清空', after.strokes === 0, after.strokes);

  /* 快捷鍵 */
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'r', code: 'KeyR', windowsVirtualKeyCode: 82 });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'r', code: 'KeyR', windowsVirtualKeyCode: 82 });
  await sleep(200);
  check('鍵盤快捷鍵可以換工具', await cdp.eval('return window.DrawGuessApp.paint.getTool() === "rect";'),
    await cdp.eval('return window.DrawGuessApp.paint.getTool();'));

  /* 沒有電腦對手了：drawer 永遠是自己一個人，不會有「輪到自己猜」這種事，
     猜題框在單機應該完全不會出現。 */
  const soloGame = await cdp.json('window.__probe.game()');
  check('單機沒有猜題者，canGuess 永遠是 false', soloGame.canGuess === false, JSON.stringify(soloGame));
  const soloStage = await cdp.json('window.__probe.stage()');
  check('單機看不到猜題框', soloStage.guessbarShown === false, JSON.stringify(soloStage));
  await shot('單機-作畫中沒有猜題框');

  /* 不限次：畫再多題也不會跳出結算（以前畫滿 999 題會跳一張「你 0 分」的結算） */
  await cdp.eval(`
    var st = window.DrawGuessApp.solo.state;
    for (var i = 0; i < 40; i++) {
      if (st.phase === 'picking') window.Rules.pickWord(st, st.drawerId, st.choices[0], Date.now());
      if (st.phase === 'drawing') window.Rules.giveUp(st, st.drawerId, Date.now());
      if (st.phase === 'reveal') window.Rules.nextTurn(st, Date.now());
    }
    st.players[0].drew = 5000;
    if (st.phase === 'picking') window.Rules.pickWord(st, st.drawerId, st.choices[0], Date.now());
    window.Rules.giveUp(st, st.drawerId, Date.now());
    window.Rules.nextTurn(st, Date.now());
    return 1;
  `);
  await sleep(400);
  const endless = await cdp.json('(function(){var st=window.DrawGuessApp.solo.state;return {over:st.over,phase:st.phase,drew:st.players[0].drew,result:document.querySelectorAll(".resultlist li").length};})()');
  check('單機不限次：畫了幾千題也不會跳結算，繼續出下一題', endless.over === false && endless.phase === 'picking' && endless.result === 0, JSON.stringify(endless));
  check('單機流程沒有主控台錯誤', cdp.errors.length === 0, cdp.errors.slice(0, 2).join(' | '));
  cdp.errors.length = 0;

  /* ================= G. 線上三個分頁 ================= */
  console.log('\n【線上：房主 + 玩家 + 觀戰】');
  const hostTab = cdp;
  await setViewport({ width: 1024, height: 768, mobile: true, dsf: 2 });
  await goto(hostTab, BASE);
  await hostTab.eval('localStorage.clear(); localStorage.setItem("dg_tutorial","1"); localStorage.setItem("dg_nick","房主"); return 1;');
  await goto(hostTab, BASE);
  await hostTab.eval('window.__probe.click("#b-online"); return 1;');
  await hostTab.waitFor('window.Online && window.Online.isConnected()', 15000, '大廳連上線');
  await hostTab.eval('window.__probe.click("#b-lobby-host"); return 1;');
  await hostTab.waitFor('document.getElementById("room-create-modal").classList.contains("open")', 3000, '開房間設定');
  check('開房前先顯示開房間設定', await hostTab.eval('return document.getElementById("room-create-modal").classList.contains("open");'));
  await hostTab.eval('window.__probe.click("#room-create-rounds [data-v=\\"3\\"]"); window.__probe.click("#room-create-drawsec [data-v=\\"120\\"]"); window.__probe.click("#room-create-diff [data-v=\\"3\\"]"); return 1;');
  await hostTab.eval('window.__probe.click("#room-create-submit"); return 1;');
  await hostTab.waitFor('window.DrawGuessApp.mode === "online" && window.DrawGuessApp.view', 10000, '進入房間');
  const code = await hostTab.eval('return window.DrawGuessApp.roomCode;');
  check('房主開房成功', typeof code === 'string' && code.length === 4, code);
  check('開房設定有套用', await hostTab.eval('var s=window.DrawGuessApp.view.room.settings; return s.rounds===3 && s.drawSec===120 && s.diff===3;'));
  check('線上房間沒有電腦對手的入口', await hostTab.eval('return !document.getElementById("room-create-ai") && !document.querySelector("[data-act=add-ai]");'));
  check('房間設定裡有離開／退出房間的按鈕', await hostTab.eval('var b=document.querySelector("[data-act=leave-room]"); return !!b && b.textContent.indexOf("房間") >= 0;'));
  const actionGap = await hostTab.eval('var a=document.getElementById("b-aside-toggle").getBoundingClientRect(); var b=document.getElementById("b-game-settings").getBoundingClientRect(); var c=document.getElementById("b-settings").getBoundingClientRect(); return {gap: Math.max(0, b.left-a.right, a.left-b.right), fabGap: Math.round(c.left-b.right), aside:a.toJSON(), settings:b.toJSON(), fab:c.toJSON()};');
  check('左側欄與對局設定按鈕緊鄰', actionGap.gap <= 8, JSON.stringify(actionGap));
  check('系統設定鈕也併在同一排', actionGap.fabGap >= 0 && actionGap.fabGap <= 8, JSON.stringify(actionGap));

  /* 產生邀請連結：連結不綁身分，房主不再事先幫對方選好身分——玩家還是觀戰交給拿到連結的人自己決定 */
  check('邀請面板不再讓房主先選對方身分',
    await hostTab.eval('return !document.querySelector("[data-act=invite-role]");'));
  await hostTab.eval('window.__probe.click("[data-act=invite-new]"); return 1;');
  await hostTab.waitFor('document.getElementById("invite-url") && document.getElementById("invite-url").value.length > 0', 8000, '產生邀請連結');
  const inviteUrl = await hostTab.eval('return document.getElementById("invite-url").value;');
  check('產生得出邀請連結', /room=[A-Z0-9]{4}&invite=[0-9a-f]{32}/.test(inviteUrl), inviteUrl);
  await shot('線上-房主房間');

  /* 第二個分頁：從邀請連結進來 */
  const t2 = await (await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/new?' + encodeURIComponent('about:blank'), { method: 'PUT' })).json();
  const mateTab = await attach(t2, '玩家分頁');
  await mateTab.send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 2, mobile: true });
  await goto(mateTab, BASE);
  await mateTab.eval('localStorage.clear(); localStorage.setItem("dg_tutorial","1"); localStorage.setItem("dg_nick","舊名字"); return 1;');
  await goto(mateTab, inviteUrl);
  await mateTab.waitFor('!document.getElementById("lobby-invite").hidden', 12000, '邀請落地頁');
  const landed = await mateTab.json('window.__probe.game()');
  check('邀請連結不會自動進房，先停在大廳', landed.mode === null && landed.screen === 's-lobby', JSON.stringify(landed));
  check('落地頁看得到房號、可編輯的暱稱欄位，以及「加入當玩家／加入觀戰」兩個選擇',
    await mateTab.eval('return document.getElementById("lobby-invite-title").textContent.indexOf("' + code + '") >= 0 && !document.getElementById("lobby-nick").disabled && !document.getElementById("b-lobby-invite-player").hidden && !document.getElementById("b-lobby-invite-spectator").hidden;'),
    await mateTab.eval('return document.getElementById("lobby-invite-title").textContent;'));
  await shot('線上-邀請落地頁');

  await mateTab.eval('document.getElementById("lobby-nick").value="新名字"; window.__probe.click("#b-lobby-invite-player"); return 1;');
  await mateTab.waitFor('window.DrawGuessApp.mode === "online" && window.DrawGuessApp.view', 10000, '確認後才加入');
  const mateView = await mateTab.json('window.__probe.game()');
  check('自己選「加入當玩家」，落地就真的是玩家（不是房主先幫忙決定）', mateView.role === 'player', mateView.role);
  check('新暱稱有送出去',
    await mateTab.eval('return window.DrawGuessApp.view.you.name === "新名字";'),
    await mateTab.eval('return window.DrawGuessApp.view.you.name;'));
  check('改暱稱不影響自己選的身分', mateView.role === 'player');
  check('用過的邀請連結參數會從網址拿掉（離開房間回大廳不會又跳出邀請卡）',
    await mateTab.eval('return !/[?&]invite=/.test(location.search);'), await mateTab.eval('return location.search;'));

  /* 第三個分頁：同一種連結（不綁身分），這次自己選觀戰 */
  const t3 = await (await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/new?' + encodeURIComponent('about:blank'), { method: 'PUT' })).json();
  const watchTab = await attach(t3, '觀戰分頁');
  await watchTab.send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true });
  await goto(watchTab, BASE);
  await watchTab.eval('localStorage.clear(); localStorage.setItem("dg_tutorial","1"); localStorage.setItem("dg_nick","觀眾"); return 1;');
  await goto(watchTab, inviteUrl);
  await watchTab.waitFor('!document.getElementById("lobby-invite").hidden', 12000, '觀戰邀請落地頁');
  await watchTab.eval('window.__probe.click("#b-lobby-invite-spectator"); return 1;');
  await watchTab.waitFor('window.DrawGuessApp.mode === "online" && window.DrawGuessApp.view', 10000, '觀戰者進房');
  check('同一種連結，自己選「加入觀戰」就是觀戰者', (await watchTab.json('window.__probe.game()')).role === 'spectator');

  /* 房間設定：遊戲規則改下拉、房號縮小、玩家名單置左沒有「x/y 位玩家」、聊天室 */
  check('遊戲規則改成下拉選單、不是按鈕，而且不是原生 <select>（自己刻的按鈕＋清單）',
    await hostTab.eval('return !!document.querySelector("#overlay-card .ruledd-btn[data-field=set-rounds]") && !document.querySelector("#overlay-card [data-act=set-rounds][role=radio]") && !document.querySelector("#overlay-card select");'));
  await hostTab.eval('window.__probe.click("#overlay-card .ruledd-btn[data-field=set-rounds]"); return 1;');
  await hostTab.waitFor('document.querySelector("#overlay-card .ruledd-list")', 3000, '下拉選單展開');
  check('按下按鈕會展開清單（role=listbox），不是瀏覽器原生的下拉',
    await hostTab.eval('var l=document.querySelector("#overlay-card .ruledd-list"); return !!l && l.getAttribute("role")==="listbox";'));
  await hostTab.eval('window.__probe.click("#overlay-card .ruledd-opt[data-field=set-rounds][data-v=\\"4\\"]"); return 1;');
  await hostTab.waitFor('window.DrawGuessApp.view.room.settings.rounds === 4', 4000, '下拉選單套用設定');
  check('下拉選單可以改規則', await hostTab.eval('return window.DrawGuessApp.view.room.settings.rounds === 4;'));
  check('選完之後清單自己收起來', await hostTab.eval('return !document.querySelector("#overlay-card .ruledd-list");'));
  check('選完之後鍵盤焦點回到這個欄位的按鈕（不會掉到整頁最上面）',
    await hostTab.eval('var a=document.activeElement; return !!a && a.classList.contains("ruledd-btn") && a.getAttribute("data-field")==="set-rounds";'),
    await hostTab.eval('var a=document.activeElement; return a ? a.tagName + "." + a.className : "null";'));
  check('按鈕上顯示的目前值不是空的（純數字選項跟 {v,label} 選項都要顯示出字）',
    await hostTab.eval('var t=document.querySelector("#overlay-card .ruledd-btn[data-field=set-rounds] .ruledd-val").textContent.trim(); var s=document.querySelector("#overlay-card .ruledd-btn[data-field=set-drawsec] .ruledd-val").textContent.trim(); return t === "4" && s.length > 0;'),
    await hostTab.eval('return document.querySelector("#overlay-card .ruledd-btn[data-field=set-rounds] .ruledd-val").textContent;'));
  await mateTab.waitFor('window.DrawGuessApp.view.room.settings.rounds === 4', 4000, '同步規則');
  check('改規則後其他分頁也同步收到', await mateTab.eval('return window.DrawGuessApp.view.room.settings.rounds === 4;'));
  check('不再出現「x / y 位玩家」的字樣',
    await hostTab.eval('return !/\\d+\\s*\\/\\s*\\d+\\s*位玩家/.test(document.getElementById("overlay-card").textContent);'));
  check('玩家名單改成一列一個玩家、寬度滿版、文字置左',
    await hostTab.eval('var list=document.querySelector("#overlay-card .seatlist"); var row=list && list.querySelector(".seatrow"); if(!list||!row) return false; var lr=list.getBoundingClientRect(), rr=row.getBoundingClientRect(); return getComputedStyle(list).flexDirection==="column" && Math.abs(rr.width-lr.width)<2 && getComputedStyle(row).textAlign==="left";'));
  check('房號縮小了（字級小於原本的 1.5rem≈24px）',
    await hostTab.eval('var b=document.querySelector("#overlay-card .roomcode b"); return parseFloat(getComputedStyle(b).fontSize) < 22;'));

  /* 寬螢幕（1024×768）房間卡分兩欄：左邊房號／名單／規則，右邊邀請／聊天室，並排不上下接 */
  const cols = await hostTab.json('(function(){var c=document.querySelectorAll("#overlay-card .setup-col"); if(c.length!==2) return {n:c.length}; var a=c[0].getBoundingClientRect(), b=c[1].getBoundingClientRect(); return {n:2, side:b.left>=a.right-1, top:Math.abs(a.top-b.top), invInRight:!!c[1].querySelector("#invite-url"), chatInRight:!!c[1].querySelector("#chat-input"), rulesInLeft:!!c[0].querySelector(".rules-row")};})()');
  check('寬螢幕房間卡分成兩欄並排（左：名單／規則，右：邀請／聊天室）',
    cols.n === 2 && cols.side && cols.top < 3 && cols.invInRight && cols.chatInRight && cols.rulesInLeft, JSON.stringify(cols));
  check('房主只有一顆「開始！」，不用另外按「準備好了」',
    await hostTab.eval('return !document.querySelector("#overlay-card [data-act=ready]") && !!document.querySelector("#overlay-card [data-act=start]");'));
  check('「改成觀戰／退出房間」是小一號的次要鈕',
    await hostTab.eval('var l=document.querySelector("#overlay-card [data-act=leave-room]"), s=document.querySelector("#overlay-card [data-act=become-spectator]"); return l.classList.contains("sub") && (!s || s.classList.contains("sub"));'));
  await hostTab.eval('document.getElementById("toast").hidden = true; window.__probe.click("[data-act=invite-new]"); return 1;');
  await hostTab.waitFor('!document.getElementById("toast").hidden', 6000, '提示出現');
  check('房間卡開著時提示訊息出現在上方，不會蓋住底部的開始鈕',
    await hostTab.eval('var t=document.getElementById("toast").getBoundingClientRect(), b=document.querySelector("#overlay-card .overlay-btns").getBoundingClientRect(); return t.bottom < innerHeight/2 && t.bottom <= b.top;'),
    await hostTab.eval('return JSON.stringify(document.getElementById("toast").getBoundingClientRect());'));

  /* 上面都是用平板尺寸（1024×768）測的；房間設定卡的新版面（規則同一行、
     一列一個玩家、聊天室）另外用手機直向尺寸量一次，確保跟平板同步縮小、不會爆版。 */
  await hostTab.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await sleep(300);
  const phoneCard = await hostTab.json('({sw:document.getElementById("overlay-card").scrollWidth, cw:document.getElementById("overlay-card").clientWidth, rowW:(function(){var r=document.querySelector("#overlay-card .seatrow");return r?r.getBoundingClientRect().width:0;})(), listW:document.querySelector("#overlay-card .seatlist").getBoundingClientRect().width, rulesRowFlex:getComputedStyle(document.querySelector("#overlay-card .rules-row")).flexWrap})');
  check('手機直向：房間設定卡不會橫向溢出', phoneCard.sw <= phoneCard.cw + 2, JSON.stringify(phoneCard));
  check('手機直向：玩家列表同樣是滿版一列（不是縮成一團）',
    phoneCard.rowW > 0 && Math.abs(phoneCard.rowW - phoneCard.listW) < 2, JSON.stringify(phoneCard));
  check('手機直向：遊戲規則仍是同一行（不換行）', phoneCard.rulesRowFlex === 'nowrap', JSON.stringify(phoneCard));
  const phoneTop = await hostTab.json('(function(){var h=document.querySelector("#overlay-card h3").getBoundingClientRect(), f=document.getElementById("b-settings").getBoundingClientRect(), a=document.querySelector(".game-top-actions").getBoundingClientRect(); var i=document.getElementById("invite-url").getBoundingClientRect(); var bs=document.querySelectorAll("#overlay-card .inviterow .pillbtn"); var one=bs.length===3; for(var k=0;k<bs.length;k++){var b=bs[k].getBoundingClientRect(); if(Math.abs((b.top+b.bottom)/2-(i.top+i.bottom)/2)>4) one=false;} return {titleTop:h.top, btnBottom:Math.max(f.bottom,a.bottom), inviteOneRow:one, inviteW:i.width, oneCol:getComputedStyle(document.querySelector("#overlay-card .setup-cols")).display};})()');
  check('手機直向：「房間設定」標題沒有被右上角的固定鈕蓋住', phoneTop.titleTop >= phoneTop.btnBottom - 1, JSON.stringify(phoneTop));
  check('手機直向：網址欄跟三顆邀請按鈕排在同一行', phoneTop.inviteOneRow && phoneTop.inviteW >= 60, JSON.stringify(phoneTop));
  check('手機直向：房間卡維持一欄（兩欄上下接著排）', phoneTop.oneCol === 'block', JSON.stringify(phoneTop));
  await shot('線上-房間設定-手機直向');
  await hostTab.send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 2, mobile: true });
  await sleep(300);

  /* 聊天室：只在等待畫面出現 */
  check('等待畫面看得到聊天室輸入框', await hostTab.eval('return !!document.getElementById("chat-input");'));
  await hostTab.eval('var i=document.getElementById("chat-input"); i.value="大家好，準備好了嗎？"; window.__probe.click("[data-act=chat-send]"); return 1;');
  await mateTab.waitFor('window.DrawGuessApp.view.room.chat.some(function(m){return m.text==="大家好，準備好了嗎？";})', 4000, '聊天同步');
  check('聊天訊息送出後另一個分頁也看得到',
    await mateTab.eval('return window.DrawGuessApp.view.room.chat.some(function(m){return m.text==="大家好，準備好了嗎？";});'));
  check('聊天送出後輸入框清空', await hostTab.eval('return document.getElementById("chat-input").value === "";'));

  /* 準備 → 開始：房主不用按準備，其他玩家準備好了房主就能直接開始 */
  check('其他玩家還沒準備時房主的「開始！」是停用的',
    await hostTab.eval('var b=document.querySelector("#overlay-card [data-act=start]"); return !!b && b.disabled;'));
  /* 房主在聊天室打字打到一半，別人按了準備：輸入框必須是同一個元素、字跟焦點都還在
     （以前整張卡重建，注音會被打斷、iPhone 鍵盤會收起來） */
  await hostTab.eval('var i=document.getElementById("chat-input"); i.focus(); i.value="打到一半"; i.dispatchEvent(new Event("input",{bubbles:true})); window.__ci=i; return 1;');
  await mateTab.eval('window.__probe.click("[data-act=ready]"); return 1;');
  await hostTab.waitFor('(function(){var b=document.querySelector("#overlay-card [data-act=start]"); return !!b && !b.disabled;})()', 4000, '開始鈕可按');
  check('別人按準備時，房主的聊天輸入框沒有被換掉（字跟焦點都還在）',
    await hostTab.eval('var i=document.getElementById("chat-input"); return i===window.__ci && i.value==="打到一半" && document.activeElement===i;'));
  /* 撤銷邀請：畫面要跟著更新（以前伺服器沒回 ack，按了沒反應） */
  await hostTab.eval('window.__probe.click("[data-act=invite-revoke]"); return 1;');
  await hostTab.waitFor('document.getElementById("invite-url").value === ""', 4000, '撤銷後網址清空');
  check('按「撤銷」後網址清空、撤銷鈕停用',
    await hostTab.eval('var b=document.querySelector("[data-act=invite-revoke]"); return document.getElementById("invite-url").value==="" && !!b && b.disabled;'));
  check('房主沒按準備，其他玩家準備好了就能開始',
    await hostTab.eval('var b=document.querySelector("#overlay-card [data-act=start]"); return !!b && !b.disabled;'));
  await hostTab.eval('window.__probe.click("[data-act=start]"); return 1;');
  await hostTab.waitFor('window.DrawGuessApp.view.room.phase === "playing"', 10000, '對局開始');
  await sleep(800);
  check('三個分頁都進入對局',
    (await mateTab.json('window.__probe.game()')).roomPhase === 'playing' &&
    (await watchTab.json('window.__probe.game()')).roomPhase === 'playing');
  check('對局開始後聊天室跟著收起來（房間設定卡只在等待畫面出現）',
    await hostTab.eval('return !document.getElementById("chat-input") && !document.querySelector(".ruledd-btn[data-field=set-rounds]");'));

  const wStage = await watchTab.json('window.__probe.stage()');
  check('觀戰者沒有工具列也沒有猜題框',
    wStage.toolbarShown === false && wStage.guessbarShown === false, JSON.stringify(wStage));
  check('觀戰者的畫面上沒有任何可打字的欄位',
    await watchTab.eval('var l=document.querySelectorAll("#s-game input:not([type=range]):not([type=checkbox])"); for(var i=0;i<l.length;i++){ if(l[i].offsetParent!==null) return false; } return true;'));
  check('觀戰者看不到答案', (await watchTab.json('window.__probe.game()')).answer === null);
  check('觀戰者看不到畫家的選字卡',
    await watchTab.eval('return document.querySelectorAll(".wordchoice").length === 0;'),
    await watchTab.eval('return document.querySelectorAll(".wordchoice").length;'));
  check('觀戰者連候選題目清單都拿不到',
    await watchTab.eval('var c = window.DrawGuessApp.view.game.choices; return Array.isArray(c) && c.length === 0;'));
  await shot('線上-觀戰者', watchTab);
  await shot('線上-玩家', mateTab);
  /* 畫家順序是亂數：看這一題是誰在選題、誰在猜 */
  const hostIsDrawer = await hostTab.eval('return !!window.DrawGuessApp.view.game.you.isDrawer;');
  const drawerTab = hostIsDrawer ? hostTab : mateTab;
  const guesserTab = hostIsDrawer ? mateTab : hostTab;
  for (const [label, tab] of [['觀戰者', watchTab], ['猜題者', guesserTab]]) {
    check(label + '拿不到範本識別碼也看不到入口', await tab.eval('return window.DrawGuessApp.view.game.referenceId === null && document.getElementById("b-reference").hidden;'));
  }
  const ps1 = await drawerTab.eval('var e=document.querySelector("#overlay-card .pick-secs"); return e ? e.textContent : null;');
  await sleep(2200);
  const ps2 = await drawerTab.eval('var e=document.querySelector("#overlay-card .pick-secs"); return e ? e.textContent : null;');
  check('選題卡上的「N 秒內沒選」會跟著倒數', ps1 !== null && ps2 !== null && Number(ps2) < Number(ps1), ps1 + ' → ' + ps2);
  await shot('線上-房主對局');

  /* 這一題的猜題者（平板橫向）：沒有工具列，右側那一欄要收掉、畫布置中，不能偏左 */
  await sleep(300);
  const hc = await guesserTab.json('(function(){var c=document.getElementById("stage-canvas").getBoundingClientRect(), m=document.querySelector(".game-main").getBoundingClientRect(); return {canvasCenter:(c.left+c.right)/2, mainCenter:(m.left+m.right)/2, playbarW:document.getElementById("playbar").getBoundingClientRect().width, drawer:window.DrawGuessApp.view.game.you.isDrawer};})()');
  check('猜題者（橫向）沒有工具列：右側那欄收掉、畫布置中',
    !hc.drawer && hc.playbarW < 2 && Math.abs(hc.canvasCenter - hc.mainCenter) < 12, JSON.stringify(hc));

  const wLayout = await watchTab.json('window.__probe.layout()');
  check('觀戰畫面（平板直向）沒有水平溢出',
    wLayout.scrollWidth <= 768 + 2 && wLayout.overflowing.length === 0, JSON.stringify(wLayout.overflowing));

  check('線上流程三個分頁都沒有主控台錯誤',
    hostTab.errors.length === 0 && mateTab.errors.length === 0 && watchTab.errors.length === 0,
    [hostTab.errors[0], mateTab.errors[0], watchTab.errors[0]].filter(Boolean).join(' | '));

  cleanup();
}

main()
  .then(() => {
    console.log('\n' + '='.repeat(46));
    if (failures.length) {
      console.log('  瀏覽器檢查失敗 ' + failures.length + ' 項：');
      failures.forEach((f) => console.log('   - ' + f));
      console.log('='.repeat(46));
      process.exit(1);
    }
    console.log('  瀏覽器檢查全部通過');
    console.log('='.repeat(46));
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n✗ 瀏覽器檢查中斷：' + (e && e.stack ? e.stack : e));
    process.exit(1);
  });
