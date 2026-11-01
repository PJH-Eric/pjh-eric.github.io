/* ===== app.js — 畫面流程、單機闖關、線上房間的串接 =====
 *
 * 分工：
 *   rules.js   規則與計分（單機在瀏覽器跑、線上在伺服器跑，同一份程式碼）
 *   render.js  畫面繪製
 *   online.js  Socket.IO 連線
 *   app.js     這一份：把它們接起來，管畫面切換、輸入與設定
 *
 * 線上模式的所有判定都以伺服器為準：這裡只送「我點了哪兩格」，
 * 能不能連、加幾分、那兩格還在不在，一律等伺服器的事件回來才改畫面。
 */
(function (w) {
  'use strict';

  var Rules = w.Rules, RNG = w.RNG, Store = w.Store, Sound = w.Sound;
  var UI = w.SvgUI, R = w.Render, Config = w.GameConfig, Online = w.Online, Themes = w.Themes;

  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* 多語系：T 查字典；SRV 把伺服器／規則回傳的訊息翻成目前語言；NAME 顯示預設名稱（玩家3、你） */
  var I = w.I18N;
  var T = function (key, params) { return I.t(key, params); };
  var SRV = function (text) { return I.srv(text); };
  var NAME = function (name) { return I.name(name); };
  /* 關卡與主題的名稱都由字典決定；Rules／Themes 裡的中文只是預設值 */
  function lvLabel(l) { return T('level.' + l.key + '.label'); }
  function lvShort(l) { return T('level.' + l.key + '.short'); }
  function thLabel(t) { return T('theme.' + t.key + '.label'); }
  function thNote(t) { return T('theme.' + t.key + '.note'); }

  /* ------------------------------------------------------------ 全域狀態 */

  var G = {
    mode: 'solo',            // solo | online
    screen: 's-home',
    run: null,               // 單機闖關：{startLevel, level, total, stages:[]}
    state: null,             // Rules 的對局狀態（只有單機會有）
    rng: null,
    view: null,              // 線上：伺服器送來的房間投影
    myId: null,
    joining: false,
    timeOffset: 0,           // 伺服器時間 - 本機時間
    snap: null,              // 目前畫面上的對局快照
    conn: ['idle', ''],      // 最近一次連線狀態（切換語言時重畫用）
    rooms: null,             // 最近一次公開房間清單
    gateKind: 'plain',       // 邀請門檻的說明種類
    inviteNote: null,        // 邀請彈窗說明的產生函式
    soloResult: null,        // 單機結算的資料（切換語言時重畫用）
    sel: null,               // 已選起來的格子
    mountKey: '',
    unread: 0,
    pane: 'sum',
    ticker: null,
    lastTick: 0,
    pendingLevel: 'easy',
    pendingTheme: 'fruits',
    inviteRole: 'player',
    pendingInvite: null
  };

  function nowSrv() { return Date.now() + G.timeOffset; }
  function isOnline() { return G.mode === 'online'; }

  /* 提示、洗牌與「重新開始」都是單機專屬：線上是大家共用同一張盤面，
     一個人重開或洗牌會影響到別人，所以這幾顆在線上一律收起來。 */
  function setAssistActionsVisible() {
    var visible = !isOnline();
    $('side-actions').hidden = !visible;
    $('stage-actions').hidden = !visible;
    $('b-restart').hidden = !visible;
    return visible;
  }

  /* ------------------------------------------------------------ 小工具 */

  var toastTimer = null;
  function toast(msg, ms) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, ms || 2600);
  }

  function show(id) {
    if (id === 's-lobby' && G.screen !== 's-lobby') {
      G.onlineCount = null;
      paintOnlineCount();
    }
    if (id === 's-home' || id === 's-solo') Online.disconnect();
    if (w.ServerOutage) w.ServerOutage.setScreen(id);
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
    G.screen = id;
    if (id !== 's-game' && w.NetworkLatency) w.NetworkLatency.setActive(false);
    if (w.NetworkLatency) w.NetworkLatency.setActive(id === 's-game' && isOnline() && !!G.view && G.view.phase === 'playing');
    Sound.setTrack(id === 's-game' ? 'game' : 'menu');
    if (Sound.isMusicOn()) Sound.startBgm();
  }

  /* --- 彈窗：遮罩、焦點鎖定、Esc 關閉、關閉後把焦點還回去 --- */
  var modalStack = [];
  function openModal(id, returnTo) {
    var m = $(id);
    m.hidden = false;
    modalStack.push({ id: id, returnTo: returnTo || document.activeElement });
    var focusable = m.querySelector('input,button,select,textarea,[tabindex]');
    if (focusable) focusable.focus();
    UI.repaintAll(m);
  }
  function closeModal(id) {
    var m = $(id);
    if (!m || m.hidden) return;
    m.hidden = true;
    for (var i = modalStack.length - 1; i >= 0; i--) {
      if (modalStack[i].id === id) {
        var back = modalStack[i].returnTo;
        modalStack.splice(i, 1);
        if (back && back.focus) { try { back.focus(); } catch (e) {} }
        break;
      }
    }
  }
  function topModal() { return modalStack.length ? modalStack[modalStack.length - 1].id : null; }

  /* 焦點鎖定：Tab 不會跑到彈窗外面；Esc 關閉最上層彈窗 */
  document.addEventListener('keydown', function (ev) {
    var top = topModal();
    if (!top) return;
    if (ev.key === 'Escape') { ev.preventDefault(); closeModal(top); return; }
    if (ev.key !== 'Tab') return;
    var m = $(top);
    var items = $$('input,button,select,textarea,[href],[tabindex]:not([tabindex="-1"])', m)
      .filter(function (e) { return !e.disabled && e.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });

  $$('[data-close-modal]').forEach(function (mask) {
    mask.addEventListener('click', function () {
      var m = mask.closest('.modal');
      if (m) closeModal(m.id);
    });
  });

  var confirmCb = null;
  function askConfirm(message, onYes, yesLabel) {
    $('confirm-message').textContent = message;
    UI.setLabel($('b-confirm-yes'), yesLabel || T('common.ok'));
    confirmCb = onYes;
    openModal('confirm-modal');
  }
  $('b-confirm-yes').addEventListener('click', function () {
    closeModal('confirm-modal');
    var cb = confirmCb; confirmCb = null;
    if (cb) cb();
  });
  $('b-confirm-no').addEventListener('click', function () { confirmCb = null; closeModal('confirm-modal'); });

  function mkBtn(color, label, onClick) {
    var b = document.createElement('button');
    b.className = 'btn3d';
    b.type = 'button';
    b.setAttribute('data-color', color);
    b.innerHTML = label;
    b.addEventListener('click', function () { Sound.play('click'); onClick(); });
    return b;
  }

  /* ------------------------------------------------------------ 設定 */

  /** 次數 >= Rules.UNLIMITED 就顯示成 ∞，不要印一個奇怪的 99 */
  function timesText(n) { return (n >= Rules.UNLIMITED) ? '∞' : String(n); }

  function applyBodyFlags() {
    var L = G.snap ? Rules.levelOf(G.snap.level) : null;
    document.body.classList.toggle('reduce-motion', Store.reduceMotion());
    /* 幼幼班本來就要看得到水果名稱，所以不管設定怎麼調都會顯示 */
    document.body.classList.toggle('show-label', Store.labelOn() || !!(L && L.showNames));
    document.body.classList.toggle('kids-board', !!(L && L.showNames));
  }

  function syncSettingsUI() {
    $('set-music').checked = Sound.isMusicOn();
    $('set-music-status').textContent = Sound.isMusicOn() ? T('common.on') : T('common.off');
    $('set-music-vol').value = Math.round(Sound.musicVolume() * 100);
    $('set-music-vol-out').textContent = Math.round(Sound.musicVolume() * 100) + '%';
    $('set-sfx').checked = Sound.isSfxOn();
    $('set-sfx-status').textContent = Sound.isSfxOn() ? T('common.on') : T('common.off');
    $('set-sfx-vol').value = Math.round(Sound.sfxVolume() * 100);
    $('set-sfx-vol-out').textContent = Math.round(Sound.sfxVolume() * 100) + '%';
    $('set-haptic').checked = Sound.isHapticOn();
    $('set-motion').checked = Store.reduceMotion();
    $('set-label').checked = Store.labelOn();
    $('set-server').textContent = T('set.server', { host: Config.describe() });
    applyBodyFlags();
  }

  $('b-settings').addEventListener('click', function () { Sound.unlock(); syncSettingsUI(); openModal('settings-modal'); });
  $('b-settings-close').addEventListener('click', function () { closeModal('settings-modal'); });
  $('b-settings-done').addEventListener('click', function () { closeModal('settings-modal'); });
  $('b-settings-reset').addEventListener('click', function () {
    Store.resetDefaults();
    Sound.setMusic(true); Sound.setMusicVolume(0.7);
    Sound.setSfx(true); Sound.setSfxVolume(1);
    Sound.setHaptic(true);
    syncSettingsUI();
    toast(T('set.resetDone'));
  });
  $('set-music').addEventListener('change', function () {
    Sound.unlock(); Sound.setMusic(this.checked);
    if (!this.checked) Sound.stopBgm();
    syncSettingsUI();
  });
  $('set-sfx').addEventListener('change', function () { Sound.unlock(); Sound.setSfx(this.checked); syncSettingsUI(); });
  $('set-music-vol').addEventListener('input', function () { Sound.setMusicVolume(this.value / 100); $('set-music-vol-out').textContent = this.value + '%'; });
  $('set-sfx-vol').addEventListener('input', function () { Sound.setSfxVolume(this.value / 100); $('set-sfx-vol-out').textContent = this.value + '%'; });
  $('set-haptic').addEventListener('change', function () { Sound.setHaptic(this.checked); if (this.checked) Sound.vibrate(15); });
  $('set-motion').addEventListener('change', function () { Store.reduceMotion(this.checked); applyBodyFlags(); });
  $('set-label').addEventListener('change', function () { Store.labelOn(this.checked); applyBodyFlags(); });

  /* ------------------------------------------------------------ 主選單與靜態畫面 */

  $$('[data-back]').forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-back')); });
  });

  $('b-solo').addEventListener('click', function () { Sound.unlock(); buildThemePicker(); buildLevelPicker(); show('s-solo'); });
  $('b-online').addEventListener('click', function () { Sound.unlock(); enterLobby(); });
  $('b-help').addEventListener('click', function () { buildHelp(); show('s-help'); });
  $('b-stats').addEventListener('click', function () { buildStats(); show('s-stats'); });

  /** 主題卡上放四個造型縮圖，一眼就看得出換了會變成什麼 */
  function themeCard(t, checked) {
    var pics = '';
    for (var i = 0; i < 4; i++) pics += UI.artSvg(t.key, Math.floor(i * t.count / 4));
    return '<button class="themecard" role="radio" type="button" data-v="' + t.key + '" aria-checked="' + checked + '"' +
      ' aria-label="' + T('theme.cardAria', { label: thLabel(t), n: t.count }) + '">' +
      '<span class="tname">' + t.emoji + ' ' + thLabel(t) + '</span>' +
      '<span class="tcount">' + T('theme.designs', { n: t.count }) + '</span>' +
      '<span class="tpics">' + pics + '</span></button>';
  }

  function buildThemePicker() {
    var host = $('opt-theme');
    var cur = Store.theme();
    if (!Themes.has(cur)) { cur = Themes.DEFAULT; Store.theme(cur); }
    G.pendingTheme = cur;
    host.innerHTML = Themes.menu().map(function (t) { return themeCard(t, t.key === cur); }).join('');
    var note = function () { $('theme-hint').textContent = T('solo.themeHint', { note: thNote(Themes.of(G.pendingTheme)) }); };
    note();
    $$('.themecard', host).forEach(function (b) {
      b.addEventListener('click', function () {
        G.pendingTheme = b.getAttribute('data-v');
        Store.theme(G.pendingTheme);
        $$('.themecard', host).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        note();
        Sound.play('click');
      });
    });
  }

  /* 關卡選單分成兩區。
     六關混在同一個 auto-fit 格線裡時，最後一列會空一格、卡片高度也參差不齊；
     分區之後每一區自己填滿一整列，而且「這一區是給誰玩的」講一次就好，
     卡片上不必每張都重複一段說明。 */
  var LEVEL_GROUPS = [
    {
      title: 'level.groupKids',
      sub: 'level.groupKidsSub',
      match: function (l) { return !!l.showNames; }
    },
    {
      title: 'level.groupPlay',
      sub: 'level.groupPlaySub',
      match: function (l) { return !l.showNames; }
    }
  ];

  function levelCard(l, cur) {
    return '<button class="pickcard lvcard" role="radio" type="button" data-v="' + l.key + '"' +
      ' aria-checked="' + (l.key === cur) + '">' +
      '<span class="lvhead"><b>' + l.emoji + ' ' + lvLabel(l) + '</b></span>' +
      '<span class="lvmeta"><i>' + l.cols + ' × ' + l.rows + '</i>' +
      '<i>' + T('level.kinds', { n: l.kinds }) + '</i><i>' + T('level.secs', { n: l.sec }) + '</i></span>' +
      '<span class="lvaid"><em>' + T('level.hintN', { n: timesText(l.hints) }) + '</em>' +
      '<em>' + T('level.shuffleN', { n: timesText(l.shuffles) }) + '</em></span></button>';
  }

  function buildLevelPicker() {
    var host = $('opt-level');
    var cur = Store.level();
    host.innerHTML = LEVEL_GROUPS.map(function (g) {
      var list = Rules.LEVELS.filter(g.match);
      if (!list.length) return '';
      return '<div class="lvgroup">' +
        '<div class="lvgtitle">' + T(g.title) + '<small>' + T(g.sub) + '</small></div>' +
        '<div class="lvrow">' + list.map(function (l) { return levelCard(l, cur); }).join('') + '</div>' +
        '</div>';
    }).join('');
    G.pendingLevel = cur;
    $$('.pickcard', host).forEach(function (b) {
      b.addEventListener('click', function () {
        G.pendingLevel = b.getAttribute('data-v');
        Store.level(G.pendingLevel);
        $$('.pickcard', host).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        Sound.play('click');
      });
    });
  }

  function buildHelp() {
    R.pathDemos($('path-demo'));
    R.pathDemos($('mahjong-path-demo'), 'mahjong');
    buildThemeGallery();
    $('level-table').innerHTML =
      '<tr><th>' + T('help.thLevel') + '</th><th>' + T('help.thBoard') + '</th><th>' + T('help.thKinds') + '</th><th>' +
        T('help.thTime') + '</th><th>' + T('help.thHints') + '</th><th>' + T('help.thShuffles') + '</th></tr>' +
      Rules.LEVELS.map(function (l) {
        return '<tr><td>' + l.emoji + ' ' + lvShort(l) + '</td><td>' + l.cols + ' × ' + l.rows + '</td>' +
          '<td>' + T('level.kinds', { n: l.kinds }) + '</td><td>' + T('level.secs', { n: l.sec }) + '</td><td>' +
          T('help.times', { n: timesText(l.hints) }) + '</td><td>' + T('help.times', { n: timesText(l.shuffles) }) + '</td></tr>';
      }).join('');
  }

  function buildThemeGallery() {
    $('theme-gallery').innerHTML = Themes.menu().map(function (t) {
      var pics = '';
      var n = Math.min(12, t.count);
      for (var i = 0; i < n; i++) pics += UI.artSvg(t.key, Math.floor(i * t.count / n));
      return '<div class="themerow"><div class="th">' + t.emoji + ' ' + thLabel(t) +
        '<small>' + T('theme.designs', { n: t.count }) + ' · ' + thNote(t) + '</small></div>' +
        '<div class="tp">' + pics + '</div></div>';
    }).join('');
  }

  function buildStats() {
    var best = Store.allBest();
    $('best-list').innerHTML = Rules.LEVELS.map(function (l) {
      var b = best[l.key];
      return '<div class="bestrow"><span class="bn">' + l.emoji + ' ' + lvLabel(l) + '</span>' +
        (b ? '<span class="bv">' + T('stats.bestRow', { score: b.score, sec: b.sec, combo: b.bestCombo }) + '</span>'
           : '<span class="bv">' + T('stats.none') + '</span>') + '</div>';
    }).join('');
    var s = Store.stats();
    $('stat-grid').innerHTML =
      '<div class="statcard"><b>' + s.solo.clear + '</b><span>' + T('stats.soloClear') + '</span></div>' +
      '<div class="statcard"><b>' + s.solo.fail + '</b><span>' + T('stats.soloFail') + '</span></div>' +
      '<div class="statcard"><b>' + s.online.win + '</b><span>' + T('stats.onlineWin') + '</span></div>' +
      '<div class="statcard"><b>' + s.online.lose + '</b><span>' + T('stats.onlineLose') + '</span></div>';
  }

  $('b-stats-reset').addEventListener('click', function () {
    askConfirm(T('stats.confirm'), function () {
      Store.clearBest(); Store.clearStats(); buildStats(); toast(T('stats.cleared'));
    }, T('stats.confirmYes'));
  });

  /* ------------------------------------------------------------ 單機闖關 */

  $('b-solo-start').addEventListener('click', function () { Sound.unlock(); startSoloRun(G.pendingLevel); });

  function startSoloRun(level) {
    G.run = { startLevel: level, level: level, total: 0, stages: [] };
    startSoloStage(level);
  }

  /** 開一關。一路闖下去的分數會累加在 G.run.total，中途重玩不會重複累加。 */
  function startSoloStage(level) {
    G.mode = 'solo';
    G.view = null;
    G.run.level = level;
    var seed = RNG.randomSeed();
    G.rng = RNG.createRng('solo:' + seed);
    var theme = Themes.has(Store.theme()) ? Store.theme() : Themes.DEFAULT;
    G.state = Rules.createMatch({
      seed: seed,
      players: [{ id: 'me', name: Store.nick() || '你' }],
      level: level,
      theme: theme,
      maxKinds: Themes.count(theme),
      now: Date.now(),
      countdownMs: Rules.COUNTDOWN_MS,
      rng: G.rng
    });
    G.timeOffset = 0;
    G.sel = null;
    G.lastTick = 0;
    G.snap = Rules.snapshot(G.state, Date.now());
    GameAnalytics.start({ mode: 'solo', difficulty: level, players: 1 });
    $('ov-wait').hidden = true;
    $('ov-result').hidden = true;
    $('chat-hint').hidden = false;
    applyBodyFlags();
    show('s-game');
    paintAll();
    startTicker();
  }

  /* ------------------------------------------------------------ 盤面掛載與繪製 */

  function mountIfNeeded() {
    if (!G.snap) return;
    var key = G.snap.level + '|' + G.snap.W + 'x' + G.snap.H + '|' + G.snap.startAt + '|' + G.snap.seed;
    if (key === G.mountKey) return;
    G.mountKey = key;
    G.sel = null;
    R.mount({ board: $('board'), line: $('linkline'), fx: $('fx') }, G.snap, onPick);
  }

  function myPlayer() {
    if (!G.snap) return null;
    var id = isOnline() ? G.myId : 'me';
    var list = G.snap.players || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /**
   * 目前真正的階段。
   *
   * 不能直接看 G.snap.phase：那是「產生快照的那一刻」算出來的，
   * 線上每 3 秒才補一次完整狀態、單機也只在有事件時重算，
   * 倒數結束之後它會一直卡在 'countdown'，玩家就點不動了。
   * 這裡改用時間戳當場算，畫面就不會有死角。
   */
  function livePhase() {
    if (!G.snap) return 'none';
    if (G.snap.over) return 'over';
    var t = nowSrv();
    if (t < G.snap.startAt) return 'countdown';
    if (t >= G.snap.endAt) return 'over';
    return 'playing';
  }

  function canPlay() {
    if (!G.snap || G.snap.over) return false;
    if (livePhase() !== 'playing') return false;
    if (!isOnline()) return true;
    return !!(G.view && G.view.you && G.view.you.can && G.view.you.can.play);
  }

  function fmtClock(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function paintHud() {
    var assistsVisible = setAssistActionsVisible();
    if (!G.snap) return;
    var L = Rules.levelOf(G.snap.level);
    var remain = G.snap.over ? 0 : Math.max(0, G.snap.endAt - nowSrv());
    var ratio = G.snap.roundMs ? remain / G.snap.roundMs : 0;
    $('hud-clock').textContent = fmtClock(remain);
    $('hud-time').classList.toggle('low', remain <= 15000 && !G.snap.over);
    var fill = $('timebar-fill');
    fill.style.width = (ratio * 100).toFixed(2) + '%';
    fill.className = ratio < 0.15 ? 'low' : (ratio < 0.35 ? 'warn' : '');

    var lv = $('hud-level');
    lv.textContent = L.emoji + ' ' + lvShort(L);
    lv.className = 'hud-stage lv' + L.no;

    var me = myPlayer();
    $('hud-score').textContent = me ? me.score : 0;
    $('hud-remain').textContent = G.snap.left;
    var combo = $('hud-combo');
    if (me && me.combo > 1) { combo.hidden = false; $('hud-combo-n').textContent = me.combo; }
    else combo.hidden = true;

    if (!assistsVisible) return;

    /* 單機提示與洗牌有兩組按鈕：寬版在左側欄、窄版在盤面下方，狀態要一起更新 */
    var hintTxt = me ? timesText(me.hints) : '0';
    var shufTxt = me ? timesText(me.shuffles) : '0';
    var playable = canPlay();
    var hintOff = !playable || !me || me.hints <= 0;
    var shufOff = !playable || !me || me.shuffles <= 0;
    ['hint-left', 'hint-left2'].forEach(function (id) { $(id).textContent = hintTxt; });
    ['shuffle-left', 'shuffle-left2'].forEach(function (id) { $(id).textContent = shufTxt; });
    ['b-hint', 'b-hint2'].forEach(function (id) { $(id).disabled = hintOff; });
    ['b-shuffle', 'b-shuffle2'].forEach(function (id) { $(id).disabled = shufOff; });
  }

  function paintSide() {
    if (!G.snap) return;
    var myId = isOnline() ? G.myId : 'me';
    var players = G.snap.players || [];
    R.rank($('rank-list'), $('live-bar'), players, myId, players.map(function (p) { return p.id; }));

    var L = Rules.levelOf(G.snap.level);
    var TH = Themes.of(G.snap.theme);
    if (isOnline() && G.view) {
      var specs = (G.view.members || []).filter(function (m) { return m.role === 'spectator'; }).length;
      $('sum-room').innerHTML = T('side.roomOnline', {
        code: R.esc(G.view.code), name: R.esc(SRV(G.view.name)), level: lvShort(L), cols: L.cols, rows: L.rows,
        theme: TH.emoji + ' ' + thLabel(TH), specs: specs
      });
    } else {
      $('sum-room').innerHTML = T('side.roomSolo', {
        level: lvShort(L), cols: L.cols, rows: L.rows, theme: TH.emoji + ' ' + thLabel(TH), total: (G.run ? G.run.total : 0)
      });
    }

    var me = myPlayer();
    var role = (isOnline() && G.view && G.view.you) ? G.view.you.role : 'player';
    $('my-stat').innerHTML = me
      ? (T('side.myStat', { pairs: me.pairs, misses: me.misses, combo: me.bestCombo, left: G.snap.left }) +
         (G.snap.autoShuffles ? T('side.autoShuffle', { n: G.snap.autoShuffles }) : ''))
      : (role === 'spectator' ? T('side.spectating') : '');
  }

  function paintAll() {
    mountIfNeeded();
    if (G.snap) R.sync(G.snap.grid);
    paintHud();
    paintSide();
  }

  /* ---- 主計時器：畫面每 200ms 更新一次；單機還要負責判定時間到 ---- */
  function startTicker() {
    stopTicker();
    G.ticker = setInterval(function () {
      if (!G.snap) return;
      if (!isOnline() && G.state && !G.state.over) {
        var evs = Rules.tick(G.state, Date.now());
        if (evs.length) {
          G.snap = Rules.snapshot(G.state, Date.now());
          evs.forEach(handleEvent);
        }
      }
      if (G.snap && !G.snap.over) {
        G.snap.phase = livePhase();          /* 讓快照裡的階段跟著時間走 */
        var sec = Math.ceil(Math.max(0, G.snap.endAt - nowSrv()) / 1000);
        if (G.snap.phase === 'playing' && sec <= 5 && sec > 0 && sec !== G.lastTick) {
          G.lastTick = sec;
          Sound.play(sec <= 3 ? 'tickHot' : 'tick');
        }
        paintCountdown();
      }
      paintHud();
    }, 200);
  }
  function stopTicker() { if (G.ticker) { clearInterval(G.ticker); G.ticker = null; } }

  var lastCount = null;
  function paintCountdown() {
    var c = $('countdown');
    if (!G.snap || G.snap.over) { c.hidden = true; return; }
    var left = G.snap.startAt - nowSrv();
    if (left > 0) {
      var n = Math.ceil(left / 1000);
      c.hidden = false;
      c.textContent = n;
      if (n !== lastCount) { lastCount = n; Sound.play('count'); }
    } else if (!c.hidden) {
      c.hidden = true;
      lastCount = null;
      if (!isOnline()) { R.shout(T('play.go')); Sound.play('go'); }
    }
  }

  /* ------------------------------------------------------------ 出手 */

  function curGrid() { return G.snap ? G.snap.grid : []; }
  /* 麻將主題視覺上會疊起來：路徑以單層平面處理，覆蓋牌仍要先解鎖 */
  function isStackBoard() { return !!(G.snap && G.snap.mode === 'stack'); }

  function onPick(i) {
    Sound.unlock();
    if (!canPlay()) {
      if (livePhase() === 'countdown') toast(T('play.countdown'));
      else if (isOnline() && G.view && G.view.you && G.view.you.role === 'spectator') toast(T('play.spectator'));
      return;
    }
    var grid = curGrid();
    if (!grid[i]) return;
    if (R.isLocked(i)) {
      R.shake(i);
      toast(T('play.locked'));
      return;
    }

    if (G.sel === i) { G.sel = null; R.setSelected(i, false); Sound.play('unpick'); return; }
    if (G.sel === null || !grid[G.sel]) { G.sel = i; R.setSelected(i, true); Sound.play('pick'); return; }

    /* 點到不同種水果就把選取換過去 —— 這比直接判失敗好操作得多，
       真正的「連錯」只會發生在同一種水果但路徑走不通的時候。 */
    if (grid[G.sel] !== grid[i]) {
      R.setSelected(G.sel, false);
      G.sel = i;
      R.setSelected(i, true);
      Sound.play('pick');
      return;
    }

    var a = G.sel;
    R.setSelected(a, false);
    G.sel = null;
    submit(a, i);
  }

  function submit(a, b) {
    if (isOnline()) { Online.send('room:link', { a: a, b: b }); return; }
    var res = Rules.attempt(G.state, 'me', a, b, Date.now(), G.rng);
    if (!res.ok) { toast(SRV(res.error)); return; }
    G.snap = Rules.snapshot(G.state, Date.now());
    handleEvent(res.event);
    (res.extra || []).forEach(handleEvent);
  }

  function askHint() {
    Sound.unlock();
    if (isOnline()) return;
    var res = Rules.useHint(G.state, 'me', Date.now());
    if (!res.ok) { toast(SRV(res.error)); return; }
    G.snap = Rules.snapshot(G.state, Date.now());
    handleEvent(res.event);
  }

  function askShuffle() {
    Sound.unlock();
    if (isOnline()) return;
    var res = Rules.useShuffle(G.state, 'me', Date.now(), G.rng);
    if (!res.ok) { toast(SRV(res.error)); return; }
    G.snap = Rules.snapshot(G.state, Date.now());
    handleEvent(res.event);
  }

  ['b-hint', 'b-hint2'].forEach(function (id) { $(id).addEventListener('click', askHint); });
  ['b-shuffle', 'b-shuffle2'].forEach(function (id) { $(id).addEventListener('click', askShuffle); });

  /* ------------------------------------------------------------ 事件處理 */

  function nameOf(id) {
    var list = (G.snap && G.snap.players) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name;
    return T('common.someone');
  }

  function handleEvent(ev) {
    if (!ev) return;
    var myId = isOnline() ? G.myId : 'me';

    if (ev.k === 'match') {
      var mine = ev.by === myId;
      /* 線上：伺服器說消掉了才動盤面，所以這裡直接套用事件的結果 */
      if (isOnline() && G.snap) {
        G.snap.grid[ev.a] = 0;
        G.snap.grid[ev.b] = 0;
        G.snap.left = ev.left;
        (G.snap.players || []).forEach(function (p) {
          if (p.id === ev.by) { p.score = ev.score; p.combo = ev.combo; p.pairs = ev.pairs; }
        });
      }
      if (isStackBoard()) R.drawStackLink(ev.path, ev.a, ev.b);
      else R.drawLink(ev.path);
      R.popPair(ev.a, ev.b);
      R.flyScore(ev.b, '+' + ev.gain + (ev.combo > 1 ? ' ×' + ev.mult : ''), mine);
      if (!mine) R.flyScore(ev.a, NAME(nameOf(ev.by)), false);
      Sound.play('match', ev.combo);
      if (mine) Sound.vibrate(12);
      if (mine && ev.combo === 5) R.shout(T('play.combo5'));
      if (mine && ev.combo === 10) R.shout(T('play.combo10'));
      setTimeout(function () { if (G.snap) R.sync(G.snap.grid); paintSide(); }, 260);
      paintHud();
      return;
    }

    if (ev.k === 'miss') {
      if (ev.by === myId) {
        R.shake(ev.a); R.shake(ev.b);
        Sound.play('miss');
        Sound.vibrate([8, 40, 8]);
        toast(T(isStackBoard() ? 'play.missStack' : 'play.missFlat'));
        if (isOnline() && G.snap) {
          (G.snap.players || []).forEach(function (p) { if (p.id === ev.by) { p.combo = 0; p.misses = ev.misses; } });
        }
      }
      paintHud(); paintSide();
      return;
    }

    if (ev.k === 'hint') {
      R.markHint(ev.a, ev.b);
      Sound.play('hint');
      if (isOnline() && G.snap) {
        (G.snap.players || []).forEach(function (p) { if (p.id === ev.by) p.hints = ev.hints; });
      }
      paintHud();
      return;
    }

    if (ev.k === 'shuffle') {
      if (isOnline() && G.snap && ev.grid) { G.snap.grid = ev.grid.slice(); G.snap.left = ev.left; }
      G.sel = null;
      R.clearSelected();
      if (G.snap) R.sync(G.snap.grid);
      Sound.play('shuffle');
      toast(T(ev.auto ? 'play.shuffleAuto' : 'play.shuffled'));
      paintHud(); paintSide();
      return;
    }

    if (ev.k === 'go') {
      $('countdown').hidden = true;
      R.shout(T('play.go'));
      Sound.play('go');
      return;
    }

    if (ev.k === 'end') { showResult(); return; }
  }

  /* ------------------------------------------------------------ 結算 */

  function showResult() {
    stopTicker();
    G.sel = null;
    R.clearSelected();
    $('countdown').hidden = true;
    if (isOnline()) { showOnlineResult(); return; }

    var st = G.state;
    G.snap = Rules.snapshot(st, Date.now());
    var me = st.players.me;
    var L = Rules.levelOf(st.level);
    var cleared = st.cleared;
    GameAnalytics.end({ result: cleared ? 'win' : 'lose' });

    if (cleared) {
      G.run.total += me.score;
      G.run.stages.push({ level: st.level, score: me.score, pairs: me.pairs, bestCombo: me.bestCombo });
      Store.best(st.level, {
        score: me.score,
        sec: Math.max(1, Math.round((st.overAt - st.startAt) / 1000)),
        bestCombo: me.bestCombo,
        pairs: me.pairs
      });
      Store.recordResult('solo', 'clear');
    } else {
      Store.recordResult('solo', 'fail');
    }

    var nxt = cleared ? Rules.nextLevel(st.level) : null;
    G.soloResult = { st: st, me: me, L: L, cleared: cleared, nxt: nxt, best: Store.best(st.level) };
    paintSoloResult();

    Sound.play(cleared ? 'clear' : 'fail');
    $('ov-result').hidden = false;
    paintSide();
  }

  /** 單機結算畫面的文字（切換語言時會再畫一次） */
  function paintSoloResult() {
    var r = G.soloResult;
    if (!r) return;
    var st = r.st, me = r.me, L = r.L, cleared = r.cleared, nxt = r.nxt, best = r.best;
    $('ov-trophy').innerHTML = cleared ? UI.trophy() : '';
    $('ov-result-title').textContent = cleared
      ? (nxt ? T('result.levelClear', { level: L.emoji + ' ' + lvShort(L) }) : T('result.allClear', { n: Rules.LEVELS.length }))
      : T('result.timeUp');
    $('result-table').innerHTML =
      '<div class="resrow win"><span class="no">🍀</span>' +
      '<span class="nm">' + T('result.thisLevel') + '<small>' +
      T('result.line', { pairs: me.pairs, combo: me.bestCombo, misses: me.misses }) +
      (me.timeBonus ? T('result.bonus', { n: me.timeBonus }) : '') + '</small></span>' +
      '<span class="sc">' + me.score + '</span></div>' +
      '<div class="resrow"><span class="no">Σ</span><span class="nm">' + T('result.total') + '</span>' +
      '<span class="sc">' + G.run.total + '</span></div>';
    $('ov-result-note').innerHTML = cleared
      ? T('result.best', { score: best.score, sec: best.sec, combo: best.bestCombo })
      : T('result.left', { n: st.left });

    var btns = $('ov-result-btns');
    btns.innerHTML = '';
    if (nxt) btns.appendChild(mkBtn('mint', T('result.next'), function () { startSoloStage(nxt); }));
    btns.appendChild(mkBtn(nxt ? 'cream' : 'mint', cleared ? T('result.again') : T('result.retry'), function () {
      startSoloStage(st.level);
    }));
    btns.appendChild(mkBtn('cream', T('result.home'), backHome));
    UI.decorateAll(btns);
  }

  /* 離開這一局。盤面、浮層與抽屜都要收乾淨 ——
     這些都是 #s-game 底下的東西，畫面切走之後留著不只是佔記憶體，
     上一局的磚塊也可能在切換的瞬間殘留在畫面上。 */
  function backHome() {
    closeGame();
    show('s-home');
  }

  /* 左上角 ◀ 離開：退回上一層 —— 單機回關卡選單、線上回大廳的房間列表，
     不要一路跳回首頁，想換一關或換一間房才不用重點一次。 */
  function backOut() {
    var online = isOnline();
    closeGame();
    if (online) { show('s-lobby'); Online.send('lobby:subscribe', {}); }
    else { buildThemePicker(); buildLevelPicker(); show('s-solo'); }
  }

  function closeGame() {
    stopTicker();
    if (isOnline()) leaveRoom(true);
    G.state = null; G.snap = null; G.mountKey = ''; G.view = null; G.mode = 'solo';
    G.sel = null; G.soloResult = null;
    $('ov-result').hidden = true;
    $('ov-wait').hidden = true;
    $('countdown').hidden = true;
    $('side').classList.remove('open');
    R.clear();
    applyBodyFlags();
  }

  $('b-quit').addEventListener('click', function () {
    if (G.snap && !G.snap.over) {
      askConfirm(T(isOnline() ? 'confirm.leaveRoom' : 'confirm.leaveSolo'), backOut, T('confirm.leave'));
    } else backOut();
  });

  /* 單機重開這一關：盤面會重抽，所以打到一半按下去要先問一聲 */
  $('b-restart').addEventListener('click', function () {
    if (isOnline()) return;
    var level = (G.snap && G.snap.level) || (G.run && G.run.level) || Store.level();
    var again = function () { Sound.play('click'); startSoloStage(level); };
    if (G.snap && !G.snap.over) {
      askConfirm(T('confirm.restart'), again, T('confirm.restartYes'));
    } else again();
  });

  /* ------------------------------------------------------------ 側欄分頁與聊天 */

  function setPane(name) {
    G.pane = name;
    $$('.stab').forEach(function (t) {
      var on = t.getAttribute('data-pane') === name;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('pane-sum').classList.toggle('on', name === 'sum');
    $('pane-chat').classList.toggle('on', name === 'chat');
    if (name === 'chat') {
      G.unread = 0;
      $('chat-unread').hidden = true;
      $('chat-unread2').hidden = true;
      var log = $('chat-log');
      log.scrollTop = log.scrollHeight;
    }
  }
  $$('.stab').forEach(function (t) {
    t.addEventListener('click', function () { setPane(t.getAttribute('data-pane')); Sound.play('click'); });
  });
  function openSide(pane) { $('side').classList.add('open'); setPane(pane); }
  $('b-open-sum').addEventListener('click', function () { openSide('sum'); });
  $('b-open-chat').addEventListener('click', function () { openSide('chat'); });
  $('b-side-close').addEventListener('click', function () { $('side').classList.remove('open'); });

  $('chat-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var input = $('chat-input');
    var text = input.value.trim();
    if (!text) return;
    if (!isOnline()) { toast(T('side.noChatToast')); return; }
    Online.send('room:chat', { text: text });
    input.value = '';
  });

  /* ------------------------------------------------------------ 鍵盤操作 */

  document.addEventListener('keydown', function (ev) {
    if (topModal()) return;
    if (G.screen !== 's-game') return;
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (ev.key === 'Escape') {
      if (G.sel !== null) { R.setSelected(G.sel, false); G.sel = null; Sound.play('unpick'); ev.preventDefault(); }
      return;
    }
    var dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
    if (!dir || !G.snap) return;
    ev.preventDefault();
    var d = R.dims();
    var act = document.activeElement;
    var cur = (act && act.dataset && act.dataset.i !== undefined) ? Number(act.dataset.i) : null;
    if (cur === null) { focusFirstTile(); return; }
    if (d.mode === 'stack') {
      var j = R.stackStep(cur, dir[0], dir[1], G.snap.grid);
      if (j >= 0) R.focusTile(j);
      return;
    }
    var x = cur % d.W, y = Math.floor(cur / d.W);
    for (var step = 0; step < Math.max(d.W, d.H); step++) {
      x += dir[0]; y += dir[1];
      if (x < 1 || y < 1 || x > d.cols || y > d.rows) break;
      var i = y * d.W + x;
      if (G.snap.grid[i]) { R.focusTile(i); return; }
    }
  });

  function focusFirstTile() {
    if (!G.snap) return;
    for (var i = 0; i < G.snap.grid.length; i++) {
      if (G.snap.grid[i] && !R.isLocked(i)) { R.focusTile(i); return; }
    }
  }

  /* ------------------------------------------------------------ 線上：連線與大廳 */

  function setConn(state, message, spec) {
    G.conn = [state, message, spec];
    if (state !== 'connected') G.onlineCount = null;
    paintOnlineCount();
    var text = spec ? T(spec.key, spec.params) : message;
    var map = {
      idle: ['', T('conn.idle')],
      loading: ['warn', T('conn.loading')],
      connecting: ['warn', text || T('conn.connecting')],
      connected: ['ok', T('conn.connected', { host: Config.describe() })],
      error: ['bad', text || T('conn.error')],
      offline: ['bad', text || T('conn.offline')]
    };
    var m = map[state] || map.idle;
    $('conn-dot').className = 'dot ' + m[0];
    $('conn-text').textContent = m[1];
    $('b-reconnect').hidden = !(state === 'error' || state === 'offline');
  }

  /** 連線錯誤：優先用錯誤物件帶的字典代碼，切換語言時才翻得回來 */
  function connError(err) {
    setConn('error', err && err.message, err && err.i18n);
  }

  function identity() { return { clientId: Store.clientId(), name: Store.nick() || '玩家' }; }

  function connect() {
    return Online.connect(identity()).then(function (s) {
      Online.send('lobby:subscribe', {});
      return s;
    });
  }

  function paintLobbyNote() {
    $('lobby-note').textContent = T(Config.isOnlineEnabled() ? 'lobby.noteEnabled' : 'lobby.noteDisabled');
  }

  function enterLobby() {
    show('s-lobby');
    $('lobby-nick').value = Store.nick();
    paintLobbyNote();
    if (!Config.isOnlineEnabled()) { setConn('offline', Config.error, Config.errorSpec); return; }
    connect().catch(connError);
  }

  $('b-reconnect').addEventListener('click', function () { connect().catch(connError); });
  $('b-refresh').addEventListener('click', function () { Online.send('lobby:subscribe', {}); });
  $('lobby-nick').addEventListener('change', function () {
    Store.nick(this.value.trim().slice(0, 12));
    if (Online.isConnected()) Online.send('hello', identity());
  });

  $('b-create').addEventListener('click', function () {
    Sound.unlock();
    Store.nick($('lobby-nick').value.trim().slice(0, 12));
    if (!Online.isConnected()) { toast(T('lobby.notConnected')); return; }
    Online.send('room:create', {
      name: Store.nick(),
      roomName: $('room-name').value,
      private: $('room-private').checked,
      level: Store.level(),
      theme: Store.theme()
    }, function (res) {
      if (res && res.ok) { GameAnalytics.track('room_create', { mode: 'online' }); enterRoom(); }
    });
  });

  $('b-join').addEventListener('click', function () {
    Sound.unlock();
    var code = $('join-code').value.trim().toUpperCase();
    if (!code) { toast(T('lobby.needCode')); return; }
    if (G.pendingInvite && G.pendingInvite.code === code) return joinPendingInvite();
    joinRoom(code, null);
  });

  $('b-invite-join').addEventListener('click', function () {
    Sound.unlock();
    joinPendingInvite();
  });

  function joinRoom(code, token) {
    Store.nick($('lobby-nick').value.trim().slice(0, 12) || Store.nick());
    if (G.joining) return;
    G.joining = true;
    var go = function () {
      Online.send('room:join', { code: code, name: Store.nick(), token: token }, function (res) {
        G.joining = false;
        if (!res || !res.ok) return;
        GameAnalytics.track('room_join', { mode: 'online', via: token ? 'invite_link' : 'lobby' });
        if (G.pendingInvite && G.pendingInvite.code === code) {
          G.pendingInvite = null;
          $('invite-gate').hidden = true;
        }
        if (res.downgraded) toast(T('lobby.downgraded'));
        else if (res.waiting) toast(T('lobby.waiting'));
        else if (res.note) toast(SRV(res.note));
        enterRoom();
      });
    };
    if (Online.isConnected()) go();
    else connect().then(go).catch(function (e) { G.joining = false; connError(e); });
  }

  function joinPendingInvite() {
    var invite = G.pendingInvite;
    if (!invite) return;
    var name = $('lobby-nick').value.trim().slice(0, 12);
    if (!name) {
      toast(T('lobby.needNick'));
      $('lobby-nick').focus();
      return;
    }
    Store.nick(name);
    joinRoom(invite.code, invite.token);
  }

  function paintGateNote() {
    var key = { token: 'lobby.inviteNoteToken', plain: 'lobby.inviteNote', spec: 'lobby.inviteNoteSpec', player: 'lobby.inviteNotePlayer' }[G.gateKind];
    $('invite-gate-note').textContent = T(key || 'lobby.inviteNote');
  }

  function prepareInvite(entry) {
    G.pendingInvite = { code: entry.room, token: entry.invite || '' };
    $('join-code').value = entry.room;
    $('invite-gate').hidden = false;
    G.gateKind = entry.invite ? 'token' : 'plain';
    paintGateNote();
    $('b-invite-join').disabled = !!entry.invite;
  }

  function enterRoom() {
    G.mode = 'online';
    G.state = null;
    G.rng = null;
    G.run = null;
    $('chat-hint').hidden = true;
    setAssistActionsVisible();
    Online.send('lobby:unsubscribe', {});
    show('s-game');
    startTicker();
  }

  function leaveRoom(silent) {
    if (G.mode !== 'online') return;
    if (Online.isConnected()) Online.send('room:leave', {});
    G.mode = 'solo';
    G.view = null;
    G.snap = null;
    G.mountKey = '';
    setAssistActionsVisible();
    if (!silent) { show('s-lobby'); Online.send('lobby:subscribe', {}); }
  }

  Online.on('lobby:rooms', function (p) {
    G.rooms = p;
    G.onlineCount = Number.isInteger(p.online) && p.online >= 0 ? p.online : null;
    paintOnlineCount();
    paintRooms();
  });

  function paintOnlineCount() {
    var el = $('online-count');
    var visible = G.conn && G.conn[0] === 'connected' && Number.isInteger(G.onlineCount);
    el.hidden = !visible;
    el.textContent = visible ? T('lobby.onlineCount', { n: G.onlineCount }) : '';
  }

  function paintRooms() {
    var rooms = (G.rooms && G.rooms.rooms) || [];
    $('rooms-count').textContent = rooms.length;
    if (!rooms.length) {
      $('room-list').innerHTML = '<div class="empty">' + T('lobby.empty') + '</div>';
      return;
    }
    $('room-list').innerHTML = rooms.map(function (r) {
      var tag = (r.phase === 'playing' || r.phase === 'countdown') ? 'playing' : (r.phase === 'over' ? 'over' : '');
      var label = T(r.phase === 'playing' ? 'lobby.phasePlaying' : (r.phase === 'countdown' ? 'lobby.phaseCountdown' : (r.phase === 'over' ? 'lobby.phaseOver' : 'lobby.phaseWaiting')));
      var canSit = r.seatsFree > 0 && r.phase === 'lobby';
      return '<div class="roomrow"><span class="rname">' + R.esc(SRV(r.name)) +
        '<small>' + T('lobby.roomMeta', {
          code: r.code, level: R.esc(I.label(r.levelLabel)), board: r.board,
          theme: (r.themeEmoji || '') + R.esc(I.label(r.themeLabel || ''))
        }) + '</small></span>' +
        '<span class="tag ' + tag + '">' + label + '</span>' +
        '<span class="tag">' + T('lobby.players', { n: r.players, max: r.seats }) + '</span>' +
        '<span class="tag">' + T('lobby.specs', { n: r.spectators }) + '</span>' +
        '<button class="btn3d small" data-color="mint" data-join="' + r.code + '" type="button">' +
        T(canSit ? 'lobby.sit' : 'lobby.watch') + '</button></div>';
    }).join('');
    UI.decorateAll($('room-list'));
    $$('[data-join]', $('room-list')).forEach(function (b) {
      b.addEventListener('click', function () { joinRoom(b.getAttribute('data-join'), null); });
    });
  }

  Online.on('status', function (s) { setConn(s.status, s.message, s.spec); });
  Online.on('hello', function (res) {
    G.myId = res.clientId || Store.clientId();
    if (res.serverTime) G.timeOffset = res.serverTime - Date.now();
  });
  Online.on('room:error', function (p) { toast(p.message ? SRV(p.message) : T('lobby.opFailed')); });
  Online.on('room:left', function () {
    G.mode = 'solo'; G.view = null; G.snap = null; G.mountKey = '';
    show('s-lobby'); Online.send('lobby:subscribe', {});
  });
  Online.on('room:closed', function (p) {
    G.mode = 'solo'; G.view = null; G.snap = null; G.mountKey = '';
    toast((p && p.reason) ? SRV(p.reason) : T('lobby.closed'));
    show('s-lobby'); Online.send('lobby:subscribe', {});
  });
  Online.on('reconnected', function () { toast(T('lobby.reconnected')); });

  Online.on('room:chat', function (p) {
    if (!G.view) return;
    G.view.chat = (G.view.chat || []).concat([p.message]).slice(-40);
    R.chat($('chat-log'), G.view.chat, G.myId);
    if (G.pane !== 'chat' && !p.message.system) {
      G.unread += 1;
      $('chat-unread').hidden = false; $('chat-unread').textContent = G.unread;
      $('chat-unread2').hidden = false; $('chat-unread2').textContent = G.unread;
      Sound.play('chat');
    }
  });

  Online.on('room:events', function (p) { (p.events || []).forEach(handleEvent); });

  Online.on('room:sync', function (view) {
    if (view.match && view.phase !== 'over') GameAnalytics.sync(view.phase, view.code + '|' + view.match.seed, {
      mode: 'online', difficulty: view.level, players: view.match.players.length,
      spectator: !view.you || view.you.role !== 'player'
    });
    G.mode = 'online';
    G.view = view;
    if (w.NetworkLatency) w.NetworkLatency.setActive(G.screen === 's-game' && view.phase === 'playing');
    G.myId = (view.you && view.you.id) || G.myId;
    if (G.screen !== 's-game') show('s-game');
    $('chat-hint').hidden = true;

    if (view.match) {
      var prevKey = G.mountKey;
      G.snap = view.match;
      mountIfNeeded();
      if (G.mountKey !== prevKey) { G.lastTick = 0; applyBodyFlags(); }
      R.sync(G.snap.grid);
    }
    R.chat($('chat-log'), view.chat || [], G.myId);
    paintRoomOverlays();
    paintHud();
    paintSide();
    if (!G.ticker) startTicker();
  });

  /* ---- 房間等待／結算浮層 ---- */

  function paintRoomOverlays() {
    var v = G.view;
    if (!v) return;
    var waiting = (v.phase === 'lobby');
    var over = (v.phase === 'over');

    $('ov-wait').hidden = !waiting;
    if (!over) $('ov-result').hidden = true;
    if (v.phase !== 'countdown') $('countdown').hidden = true;

    if (waiting) {
      $('ov-wait-title').textContent = T('wait.titleRoom', { name: SRV(v.name), code: v.code });
      R.seats($('seat-list'), v.members || [], v.hostId, G.myId);

      var canLevel = !!(v.you.can && v.you.can.setLevel);
      $('level-manage').hidden = !canLevel;
      if (canLevel) {
        $('level-pick').innerHTML = (v.levels || []).map(function (l) {
          return '<button class="pickcard mini" role="radio" type="button" data-v="' + l.key + '" aria-checked="' + (l.key === v.level) + '">' +
            '<b>' + l.emoji + ' ' + lvShort(l) + '</b><span>' + T('wait.levelCard', { cols: l.cols, rows: l.rows, sec: l.sec }) + '</span></button>';
        }).join('');
        $$('.pickcard', $('level-pick')).forEach(function (b) {
          b.addEventListener('click', function () { Online.send('room:setLevel', { level: b.getAttribute('data-v') }); });
        });
      }

      var canTheme = !!(v.you.can && v.you.can.setTheme);
      $('theme-manage').hidden = !canTheme;
      if (canTheme) {
        $('theme-pick').innerHTML = (v.themes || []).map(function (t) {
          return '<button class="pickcard mini" role="radio" type="button" data-v="' + t.key + '" aria-checked="' + (t.key === v.theme) + '">' +
            '<b>' + t.emoji + ' ' + thLabel(t) + '</b><span>' + T('theme.designs', { n: t.count }) + '</span></button>';
        }).join('');
        $$('.pickcard', $('theme-pick')).forEach(function (b) {
          b.addEventListener('click', function () { Online.send('room:setTheme', { theme: b.getAttribute('data-v') }); });
        });
      }

      var TH = Themes.of(v.theme);
      var L = Rules.levelOf(v.level);
      $('ov-wait-note').innerHTML = T('wait.note', {
        theme: TH.emoji + ' ' + thLabel(TH), n: TH.list.length, level: lvLabel(L), cols: L.cols, rows: L.rows, sec: L.sec, seats: v.seats
      }) + (v.you.startBlockedBy ? T('wait.blocked', { why: R.esc(SRV(v.you.startBlockedBy)) }) : '');

      var btns = $('ov-wait-btns');
      btns.innerHTML = '';
      if (v.you.can.ready) {
        btns.appendChild(mkBtn(v.you.ready ? 'cream' : 'mint', T(v.you.ready ? 'wait.cancelReady' : 'wait.ready'), function () {
          Online.send('room:ready', { ready: !v.you.ready });
        }));
      }
      if (v.you.can.sit) btns.appendChild(mkBtn('mint', T('wait.sit'), function () { Online.send('room:sit', {}); }));
      if (v.you.can.stand) btns.appendChild(mkBtn('cream', T('wait.stand'), function () { Online.send('room:stand', {}); }));
      if (v.you.can.start) btns.appendChild(mkBtn('grape', T('wait.start'), function () { Online.send('room:start', {}); }));
      if (v.you.can.invite) btns.appendChild(mkBtn('sky', T('wait.invite'), openInvite));
      btns.appendChild(mkBtn('cream', T('wait.leave'), function () { leaveRoom(); }));
      UI.decorateAll(btns);
    }

    if (over && v.match && v.match.standings) showOnlineResult();
    if (!$('invite-modal').hidden) paintInviteList();
  }

  var lastResultKey = '';
  function showOnlineResult() {
    var v = G.view;
    if (!v || !v.match || !v.match.standings) return;
    var st = v.match.standings;
    var key = v.code + '|' + v.match.seed + '|' + st.map(function (r) { return r.id + ':' + r.score; }).join(',');
    var fresh = key !== lastResultKey;
    lastResultKey = key;

    var mine = null;
    st.forEach(function (r) { if (r.id === G.myId) mine = r; });
    var champion = st[0];

    $('ov-trophy').innerHTML = (mine && mine.rank === 1) ? UI.trophy() : '';
    $('ov-result-title').textContent = T(v.match.cleared ? 'result.boardClear' : 'result.timeUp');
    R.results($('result-table'), st, G.myId, (v.match.players || []).map(function (p) { return p.id; }));
    $('ov-result-note').innerHTML = v.match.draw
      ? T('result.draw')
      : (T('result.champion', { name: R.esc(champion ? NAME(champion.name) : '—'), score: (champion ? champion.score : 0) }) +
         (mine ? T('result.myRank', { rank: mine.rank }) : T('result.watched')));

    var btns = $('ov-result-btns');
    btns.innerHTML = '';
    if (v.you.can.rematch) {
      btns.appendChild(mkBtn('mint', T('result.rematch', { votes: v.rematch.votes, need: v.rematch.need }), function () {
        Online.send('room:rematch', {});
      }));
    }
    if (v.you.can.reset) btns.appendChild(mkBtn('cream', T('result.toRoom'), function () { Online.send('room:reset', {}); }));
    btns.appendChild(mkBtn('cream', T('wait.leave'), function () { leaveRoom(); }));
    UI.decorateAll(btns);
    $('ov-result').hidden = false;

    if (fresh && mine) {
      GameAnalytics.end({ result: v.match.draw ? 'draw' : (mine.rank === 1 ? 'win' : 'lose') });
      Store.recordResult('online', (v.match.draw && mine.rank === 1) ? 'draw' : (mine.rank === 1 ? 'win' : 'lose'));
      Sound.play(mine.rank === 1 ? 'clear' : (v.match.draw ? 'draw' : 'fail'));
    }
  }

  /* ---- 邀請連結 ---- */

  function paintInviteNote() {
    $('invite-note').textContent = G.inviteNote ? G.inviteNote() : '';
  }

  function openInvite() {
    G.inviteRole = 'player';
    $$('.pickcard', $('invite-role')).forEach(function (b) {
      b.setAttribute('aria-checked', String(b.getAttribute('data-v') === 'player'));
    });
    $('invite-out').hidden = true;
    G.inviteNote = function () { return T('inv.note'); };
    paintInviteNote();
    paintInviteList();
    openModal('invite-modal');
  }
  $$('.pickcard', $('invite-role')).forEach(function (b) {
    b.addEventListener('click', function () {
      G.inviteRole = b.getAttribute('data-v');
      $$('.pickcard', $('invite-role')).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
    });
  });
  $('b-invite-close').addEventListener('click', function () { closeModal('invite-modal'); });
  $('b-invite-done').addEventListener('click', function () { closeModal('invite-modal'); });
  $('b-invite-make').addEventListener('click', function () {
    if (!G.view) return;
    Online.send('room:invite', { role: G.inviteRole, ttlMinutes: 30, maxUses: 5 }, function (res) {
      if (!res || !res.ok) return;
      $('invite-url').value = Config.inviteUrl(G.view.code, res.token);
      $('invite-out').hidden = false;
      G.inviteNote = function () {
        return T('inv.made', {
          role: T(res.role === 'spectator' ? 'inv.spec' : 'inv.player'), max: res.maxUses,
          time: new Date(res.expiresAt).toLocaleTimeString(I.lang === 'en' ? 'en-US' : 'zh-TW')
        });
      };
      paintInviteNote();
    });
  });
  $('b-invite-copy').addEventListener('click', function () {
    var input = $('invite-url');
    input.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value)
        .then(function () { toast(T('inv.copied')); })
        .catch(function () { toast(T('inv.copyManual')); });
      return;
    }
    try { document.execCommand('copy'); toast(T('inv.copied')); }
    catch (e) { toast(T('inv.copyManual')); }
  });

  function paintInviteList() {
    var v = G.view;
    var host = $('invite-list');
    if (!v || !v.invites || !v.invites.length) {
      host.innerHTML = '<div class="empty">' + T('inv.empty') + '</div>';
      return;
    }
    host.innerHTML = v.invites.map(function (iv) {
      var dead = iv.revoked || iv.expiresAt < Date.now() || iv.uses >= iv.maxUses;
      var why = T(iv.revoked ? 'inv.revoked' : (iv.expiresAt < Date.now() ? 'inv.expired' : (iv.uses >= iv.maxUses ? 'inv.used' : 'inv.valid')));
      return '<div class="invrow' + (dead ? ' dead' : '') + '">' +
        '<span class="txt">' + T('inv.row', { role: T(iv.role === 'spectator' ? 'inv.spec' : 'inv.player'), why: why, uses: iv.uses, max: iv.maxUses }) + '</span>' +
        (dead ? '' : '<button class="btn3d small" data-color="cream" data-revoke="' + iv.token + '" type="button">' + T('inv.revoke') + '</button>') +
        '</div>';
    }).join('');
    UI.decorateAll(host);
    $$('[data-revoke]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        Online.send('room:revokeInvite', { token: b.getAttribute('data-revoke') });
        toast(T('inv.revokedToast'));
      });
    });
  }

  /* ------------------------------------------------------------ 啟動 */

  /** 語言切換：把目前看得到的動態文字全部重畫一次 */
  function relocalize() {
    $('logo').innerHTML = UI.logo();
    $('lobby-link').setAttribute('href', I.withLang(LOBBY_URL));
    buildThemePicker(); buildLevelPicker(); buildHelp(); buildStats();
    syncSettingsUI();
    setConn(G.conn[0], G.conn[1], G.conn[2]);
    paintLobbyNote();
    paintGateNote();
    paintRooms();
    if (G.snap) {
      R.relabel();
      paintHud(); paintSide();
    }
    if (isOnline() && G.view) {
      R.chat($('chat-log'), G.view.chat || [], G.myId);
      paintRoomOverlays();
    } else if (G.soloResult && !$('ov-result').hidden) paintSoloResult();
    paintInviteNote();
    if (!$('invite-modal').hidden) paintInviteList();
    UI.decorateAll(document);
  }

  var LOBBY_URL = 'https://pjh-eric.github.io/game-lobby/';

  function boot() {
    I.mountToggle({ after: $('b-settings') });
    I.onChange(relocalize);
    $('lobby-link').setAttribute('href', I.withLang(LOBBY_URL));
    $('logo').innerHTML = UI.logo();
    UI.bgDeco($('bgdeco'));
    UI.decorateAll(document);
    applyBodyFlags();
    syncSettingsUI();
    setPane('sum');
    setConn('idle');
    $('lobby-nick').value = Store.nick();

    /* 第一次真的碰到畫面才解鎖音訊（瀏覽器規定要有使用者手勢） */
    var once = function () {
      Sound.unlock();
      if (Sound.isMusicOn()) Sound.startBgm('menu');
      document.removeEventListener('pointerdown', once);
      document.removeEventListener('keydown', once);
    };
    document.addEventListener('pointerdown', once);
    document.addEventListener('keydown', once);

    /* 邀請連結：先停在大廳，讓被邀請者確認暱稱後再進房 */
    var entry = Config.entry();
    if (entry.room) {
      prepareInvite(entry);
      enterLobby();
      connect().then(function () {
        if (!entry.invite) {
          $('b-invite-join').disabled = false;
          return;
        }
        Online.send('invite:check', { code: entry.room, token: entry.invite }, function (res) {
          if (!res || !res.ok) {
            G.pendingInvite = null;
            $('invite-gate').hidden = true;
            toast(res && res.error ? SRV(res.error) : T('lobby.inviteBad'));
            return;
          }
          if (res.note) toast(SRV(res.note));
          G.gateKind = res.role === 'spectator' ? 'spec' : 'player';
          paintGateNote();
          $('b-invite-join').disabled = false;
        });
      }).catch(connError);
    }

    /* 視窗大小或方向改變時重畫立體按鈕（它們依實際像素畫出來） */
    var repaint = null;
    w.addEventListener('resize', function () {
      clearTimeout(repaint);
      repaint = setTimeout(function () { UI.repaintAll(document); }, 120);
    });
    w.addEventListener('orientationchange', function () {
      setTimeout(function () { UI.repaintAll(document); }, 260);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* 自動化測試用的觀察窗；正常遊玩不會用到 */
  w.__fruitLink = G;
}(window));
