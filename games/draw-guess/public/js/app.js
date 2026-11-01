/* ===== app.js — 畫面、輸入與流程 =====
 *
 * 這一層只負責「呈現狀態」與「把玩家意圖送出去」，不自己判斷規則。
 *   單機：自己持有完整的 Rules state，用同一份 Rules 推進（就你一個人，沒有電腦對手）。
 *   線上：狀態在伺服器，這裡只收 Rules.toPublic 投影，權限一律看 you.can。
 * 兩種模式最後都收斂成同一個 view 物件，所以只有一套畫面程式碼。
 *
 * 這個遊戲沒有聊天室：唯一的文字輸入就是猜題框，「猜題紀錄」併在操作摘要裡，唯讀。
 */
(function (w) {
  'use strict';

  var D = document;
  var $ = function (id) { return D.getElementById(id); };
  var Rules = w.Rules, Words = w.Words, RNG = w.RNG;
  var Cfg = w.GameConfig, S = w.SvgUI, Store = w.Store, Sound = w.Sound, Paint = w.Paint;

  var ME = 'me';                    // 單機模式裡自己的玩家 id
  var LOOP_MS = 120;                // 單機推進與倒數更新的間隔

  /* 「猜題紀錄」最多列幾筆（再多也捲不完，前面的意義不大） */
  var RECENT_MAX = 60;

  var app = {
    screen: 's-home',
    mode: null,                     // 'solo' | 'online'
    paint: null,
    view: null,
    feed: [],
    feedSeen: {},
    solo: null,                     // { state, director, seed, level }
    loop: 0,
    asideOpen: false,
    lastTurnKey: '',
    lastPhase: '',
    lastMask: '',
    lastGuessedCount: 0,
    roomCode: null,
    pendingInvite: null,
    inviteToken: null,
    inviteUrl: '',
    chatDraft: '',                  // 聊天室打到一半的字，投影更新時用來保留輸入框內容
    ruleMenuOpen: null,              // 遊戲規則自訂下拉選單：哪個欄位（set-rounds／set-drawsec／set-diff）展開中
    ruleFocus: null,                 // 卡片更新完要把焦點放到哪：{ field, target: 'btn' | 'opt' }
    roomCreate: { roomName: '', rounds: 2, drawSec: 90, diff: 0 },
    lastOverlayHtml: null,
    conn: { status: 'idle', message: '' },
    wideLayout: null,
    recordedKey: '',
    resumeRoom: null                 // 重新整理前所在的房號（sessionStorage），連上線後自動回去
  };

  /* ================================================================
     小工具
     ================================================================ */

  function show(id) {
    if (w.ServerOutage) w.ServerOutage.setScreen(id);
    if (referenceModal) referenceModal.close();
    var list = D.querySelectorAll('.screen');
    for (var i = 0; i < list.length; i++) list[i].classList.toggle('active', list[i].id === id);
    app.screen = id;
    if (id !== 's-game' && w.NetworkLatency) w.NetworkLatency.setActive(false);
    if (id !== 's-game') { D.body.classList.remove('setup-open'); D.body.classList.remove('solo-mode'); }
    if (id === 's-game') { layoutStage(); if (app.paint) app.paint.resize(); }
    Sound.setTrack(id === 's-game' ? 'draw' : 'menu');
  }

  var toastTimer = 0;
  function toast(message, kind) {
    var el = $('toast');
    el.textContent = message;
    el.setAttribute('data-kind', kind || 'info');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, kind === 'error' ? 4200 : 2600);
  }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** 把 <span data-ico="pen"> 換成真正的 SVG */
  function paintIcons(root) {
    var list = (root || D).querySelectorAll('[data-ico]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.dataset.icoDone) continue;
      el.innerHTML = S.icon(el.getAttribute('data-ico'));
      el.dataset.icoDone = '1';
    }
  }

  /** 目前該用哪個時鐘：線上要用伺服器時間算倒數 */
  function netNow() {
    return (app.mode === 'online' && w.Online) ? w.Online.now() : Date.now();
  }

  function secsLeft(deadline) {
    if (!deadline) return 0;
    return Math.max(0, Math.ceil((deadline - netNow()) / 1000));
  }

  /* ================================================================
     Modal（設定彈窗）：遮罩、焦點鎖定、Escape、關閉返回原焦點
     ================================================================ */

  function makeModal(modalId, panelId, openerId) {
    var modal = $(modalId), panel = $(panelId), opener = $(openerId);
    var lastFocus = null;
    var onKey = function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); api.close(); return; }
      if (ev.key !== 'Tab') return;
      var f = panel.querySelectorAll('button,input,select,textarea,[href],[tabindex]:not([tabindex="-1"])');
      var able = [];
      for (var i = 0; i < f.length; i++) if (!f[i].disabled && f[i].offsetParent !== null) able.push(f[i]);
      if (!able.length) return;
      var first = able[0], last = able[able.length - 1];
      if (ev.shiftKey && D.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && D.activeElement === last) { ev.preventDefault(); first.focus(); }
    };
    var api = {
      isOpen: function () { return modal.classList.contains('open'); },
      open: function () {
        if (api.isOpen()) return;
        lastFocus = D.activeElement;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        if (opener) opener.setAttribute('aria-expanded', 'true');
        D.addEventListener('keydown', onKey, true);
        setTimeout(function () { panel.focus(); }, 0);
        S.repaintAll(panel);
      },
      close: function () {
        if (!api.isOpen()) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        if (opener) opener.setAttribute('aria-expanded', 'false');
        D.removeEventListener('keydown', onKey, true);
        /* 焦點回到原本的地方。觸控裝置按按鈕常常不會讓它取得焦點，
           那時候 lastFocus 會是 body，退而求其次回到開啟用的按鈕。 */
        var back = (lastFocus && lastFocus.focus && lastFocus !== D.body && D.contains(lastFocus))
          ? lastFocus : opener;
        if (back && back.focus) back.focus();
      },
      toggle: function () { api.isOpen() ? api.close() : api.open(); }
    };
    return api;
  }

  var settingsModal, gameModal, roomCreateModal, confirmModal, referenceModal;
  var referenceKey = '', referenceStep = 3;
  var referenceRendered = '';

  function referenceId() {
    var v = app.view;
    if (app.screen !== 's-game' || !v || !v.game || !v.you.can.draw ||
        !v.game.you.isDrawer || (v.room && v.room.closed)) return null;
    return v.game.referenceId;
  }

  function renderReference() {
    var id = referenceId();
    $('b-reference').hidden = !id;
    var key = id ? id + ':' + app.view.game.turnNo + ':' + app.view.game.lang : '';
    if (referenceKey !== key) {
      referenceKey = key;
      referenceStep = 3;
      referenceRendered = '';
      referenceModal.close();
      $('reference-picture').innerHTML = '';
      $('reference-word').textContent = '';
    }
    if (!id) { referenceModal.close(); return; }
    if (!referenceModal.isOpen()) return;
    var rendered = key + ':' + referenceStep + ':' + w.I18N.lang;
    if (rendered === referenceRendered) return;
    referenceRendered = rendered;
    var word = Words.byId(id, app.view.game.lang);
    var picture = $('reference-picture');
    $('reference-word').textContent = word.text;
    var semanticSvg = w.MeaningReference
      ? w.MeaningReference.svg(id, referenceStep)
      : '';
    var DR = w.DrawingReference;
    if (!semanticSvg && DR.hasRecipe && !DR.hasRecipe(id) && DR.ensure) {
      DR.ensure(id, function () { referenceRendered = ''; renderReference(); });
    }
    var svg = semanticSvg || DR.svg(id, referenceStep);
    picture.innerHTML = svg;
    var hasPicture = !!svg;
    picture.setAttribute('aria-label', w.I18N.t('reference.image', { word: word.text, step: referenceStep }));
    picture.hidden = !hasPicture;
    $('reference-empty').hidden = hasPicture;
    $('reference-steps').hidden = !hasPicture;
    var buttons = D.querySelectorAll('[data-reference-step]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(Number(buttons[i].dataset.referenceStep) === referenceStep));
    }
  }

  function setupReference() {
    referenceModal = makeModal('reference-modal', 'reference-panel', 'b-reference');
    $('b-reference').addEventListener('click', function () {
      if (!referenceId()) return;
      referenceStep = 3;
      referenceModal.open();
      renderReference();
    });
    ['reference-close', 'reference-done', 'reference-backdrop'].forEach(function (id) {
      $(id).addEventListener('click', function () { referenceModal.close(); });
    });
    $('reference-steps').addEventListener('click', function (ev) {
      var button = ev.target.closest('[data-reference-step]');
      if (!button) return;
      referenceStep = Number(button.dataset.referenceStep);
      renderReference();
    });
  }

  /* ---------------------------------------------------------- 確認對話框
     離開對局這種收不回來的動作，先再問一次。用同一組 Modal 行為
     （焦點鎖定、Escape 關閉、關閉後焦點歸位），不用瀏覽器的 confirm()。 */
  var confirmAction = null;

  function setupConfirm() {
    confirmModal = makeModal('confirm-modal', 'confirm-panel', null);
    $('confirm-cancel').addEventListener('click', function () { confirmAction = null; confirmModal.close(); Sound.play('click'); });
    $('confirm-ok').addEventListener('click', function () {
      var fn = confirmAction;
      confirmAction = null;
      confirmModal.close();
      Sound.play('click');
      if (fn) fn();
    });
    var back = D.querySelector('[data-confirm-close]');
    if (back) back.addEventListener('click', function () { confirmAction = null; confirmModal.close(); });
  }

  /**
   * 問一次再做。
   * @param {{title:string, text:string, ok:string, cancel:string}} o
   * @param {function} onOk 按下確定才會跑
   */
  function askConfirm(o, onOk) {
    $('confirm-title').textContent = o.title;
    $('confirm-text').textContent = o.text;
    S.setLabel($('confirm-ok'), esc(o.ok));
    S.setLabel($('confirm-cancel'), esc(o.cancel));
    confirmAction = onOk;
    confirmModal.open();
  }

  /** 離開對局前的確認：線上是離開房間、單機是離開這一局 */
  function askLeaveGame() {
    var online = app.mode === 'online';
    askConfirm({
      get title() { return online ? (globalThis.I18N ? globalThis.I18N.t("text.276") : "要離開這間房嗎？") : (globalThis.I18N ? globalThis.I18N.t("text.282") : "要離開這一局嗎？"); },
      get text() { return online
        ? (globalThis.I18N ? globalThis.I18N.t("text.281") : "離開後你的座位會釋出，房間裡的對局會繼續進行。想再回來的話要重新從大廳加入。")
        : (globalThis.I18N ? globalThis.I18N.t("text.280") : "目前這一局的進度與分數不會保留。"); },
      get ok() { return online ? (globalThis.I18N ? globalThis.I18N.t("text.104") : "離開房間") : (globalThis.I18N ? globalThis.I18N.t("text.279") : "離開這一局"); },
      get cancel() { return online ? (globalThis.I18N ? globalThis.I18N.t("text.272") : "留下來") : (globalThis.I18N ? globalThis.I18N.t("text.278") : "繼續玩"); }
    }, function () {
      leaveGame(online ? 's-lobby' : 's-home');
    });
  }

  /** 等待中的房間裡按「離開房間／退出房間」：房主退出會把房主交給下一位 */
  function askLeaveRoom() {
    var v = app.view;
    var isHost = !!(v && v.you && v.you.isHost);
    var alone = !!(v && v.room && v.room.members && v.room.members.length <= 1);
    askConfirm({
      get title() { return isHost ? (globalThis.I18N ? globalThis.I18N.t("text.277") : "要退出這間房嗎？") : (globalThis.I18N ? globalThis.I18N.t("text.276") : "要離開這間房嗎？"); },
      get text() { return isHost
        ? (alone
          ? (globalThis.I18N ? globalThis.I18N.t("text.275") : "房間裡只剩你，退出之後這間房會直接關掉，邀請連結也會失效。")
          : (globalThis.I18N ? globalThis.I18N.t("text.274") : "退出之後房主會交給下一位，房間會繼續留著。想再回來的話要重新從大廳加入。"))
        : (globalThis.I18N ? globalThis.I18N.t("text.273") : "離開後你的座位會釋出，房間會繼續留著。想再回來的話要重新從大廳加入。"); },
      get ok() { return isHost ? (globalThis.I18N ? globalThis.I18N.t("text.105") : "退出房間") : (globalThis.I18N ? globalThis.I18N.t("text.104") : "離開房間"); },
      get cancel() { return globalThis.I18N ? globalThis.I18N.t("text.272") : "留下來"; }
    }, function () {
      leaveGame('s-lobby');
    });
  }

  /* ================================================================
     系統設定
     ================================================================ */

  function applyDisplaySettings() {
    D.body.classList.toggle('reduced-motion', Store.reduceMotion());
    D.body.classList.toggle('big-tools', Store.bigTools());
  }

  function setupSettings() {
    settingsModal = makeModal('settings-modal', 'settings-panel', 'b-settings');
    $('b-settings').addEventListener('click', function () { Sound.play('click'); settingsModal.open(); syncSettingsUI(); });
    $('settings-close').addEventListener('click', function () { settingsModal.close(); });
    $('settings-done').addEventListener('click', function () { settingsModal.close(); });
    var back = D.querySelector('[data-settings-close]');
    if (back) back.addEventListener('click', function () { settingsModal.close(); });

    $('settings-music').addEventListener('change', function () {
      Sound.setMusic(this.checked); syncSettingsUI();
    });
    $('settings-sfx').addEventListener('change', function () { Sound.setSfx(this.checked); syncSettingsUI(); });
    $('settings-music-volume').addEventListener('input', function () {
      Sound.setMusicVolume(Number(this.value) / 100); syncSettingsUI();
    });
    $('settings-sfx-volume').addEventListener('input', function () {
      Sound.setSfxVolume(Number(this.value) / 100); syncSettingsUI();
    });
    $('settings-pencue').addEventListener('change', function () { Sound.setPenCue(this.checked); });
    $('settings-chatcue').addEventListener('change', function () { Sound.setChatCue(this.checked); });
    $('settings-haptic').addEventListener('change', function () { Sound.setHaptic(this.checked); Sound.vibrate(12); });
    $('settings-motion').addEventListener('change', function () { Store.reduceMotion(this.checked); applyDisplaySettings(); });
    $('settings-bigtools').addEventListener('change', function () {
      Store.bigTools(this.checked); applyDisplaySettings(); layoutStage();
    });
    $('settings-nick').addEventListener('change', function () { saveNick(this); });
    $('settings-reset').addEventListener('click', function () {
      Sound.resetDefaults();
      Store.resetDefaults();
      applyDisplaySettings();
      syncSettingsUI();
      toast((globalThis.I18N ? globalThis.I18N.t("text.271") : "已恢復預設設定。"), 'ok');
    });
  }

  function syncSettingsUI() {
    $('settings-music').checked = Sound.isMusicOn();
    $('settings-music-status').textContent = Sound.isMusicOn() ? (globalThis.I18N ? globalThis.I18N.t("text.265") : "開啟") : (globalThis.I18N ? globalThis.I18N.t("text.264") : "靜音");
    $('settings-sfx').checked = Sound.isSfxOn();
    $('settings-sfx-status').textContent = Sound.isSfxOn() ? (globalThis.I18N ? globalThis.I18N.t("text.265") : "開啟") : (globalThis.I18N ? globalThis.I18N.t("text.264") : "靜音");
    $('settings-music-volume').value = Math.round(Sound.getMusicVolume() * 100);
    $('settings-music-volume-value').textContent = Math.round(Sound.getMusicVolume() * 100) + '%';
    $('settings-sfx-volume').value = Math.round(Sound.getSfxVolume() * 100);
    $('settings-sfx-volume-value').textContent = Math.round(Sound.getSfxVolume() * 100) + '%';
    $('settings-pencue').checked = Sound.isPenCueOn();
    $('settings-chatcue').checked = Sound.isChatCueOn();
    $('settings-haptic').checked = Sound.isHapticOn();
    $('settings-motion').checked = Store.reduceMotion();
    $('settings-bigtools').checked = Store.bigTools();
    $('settings-nick').value = Store.nick();
    $('settings-server-url').textContent = Cfg.describe();
  }

  /* ================================================================
     教學（純文字）
     ================================================================ */

  var TUTORIAL = [
    { get h() { return globalThis.I18N ? globalThis.I18N.t("text.263") : "這個遊戲在玩什麼"; }, get b() { return (globalThis.I18N ? globalThis.I18N.t("text.262") : "<p>大家輪流當「畫家」。輪到你當畫家時，你會從三個題目裡挑一個，把它畫在畫布上；其他人看著你的線條，把答案打進下面的猜題框。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.261") : "<p>一局裡每個人都會當到畫家。全部畫完之後，分數最高的人獲勝。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.260") : "<p>下一段會說明畫家可以用哪些工具。</p>"); } },
    { get h() { return globalThis.I18N ? globalThis.I18N.t("text.259") : "當畫家：小畫家式的工具列"; }, get b() { return (globalThis.I18N ? globalThis.I18N.t("text.258") : "<p>輪到你畫的時候，畫布下面會出現工具列，用法跟小畫家一樣：</p>") +
      '<ul>' +
      (globalThis.I18N ? globalThis.I18N.t("text.257") : "<li><b>鉛筆</b>：按住拖曳就畫線，最常用。</li>") +
      (globalThis.I18N ? globalThis.I18N.t("text.256") : "<li><b>筆刷</b>：跟鉛筆一樣，但線比較粗。</li>") +
      (globalThis.I18N ? globalThis.I18N.t("text.255") : "<li><b>直線／矩形／橢圓</b>：從一點按住拖到另一點，放開才會定形。</li>") +
      (globalThis.I18N ? globalThis.I18N.t("text.254") : "<li><b>橡皮擦</b>：擦掉畫錯的地方。</li>") +
      (globalThis.I18N ? globalThis.I18N.t("text.253") : "<li><b>油漆桶</b>：點一下就把那一塊封閉區域填成目前的顏色。要先把輪廓連起來，不然顏色會流到整張紙。</li>") +
      '</ul>' +
      (globalThis.I18N ? globalThis.I18N.t("text.252") : "<p>右邊還有<b>復原</b>、<b>重做</b>、<b>全部清除</b>。顏色和粗細在工具列上直接點選；矩形和橢圓可以勾「填滿」畫成實心。</p>"); } },
    { get h() { return globalThis.I18N ? globalThis.I18N.t("text.251") : "當畫家：不能做的事"; }, get b() { return (globalThis.I18N ? globalThis.I18N.t("text.250") : "<p>這個遊戲刻意<b>沒有文字工具，也沒有聊天室</b>——畫家沒有任何可以打字的地方，所以不可能把答案寫出來。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.249") : "<p>線上房間裡，畫好了按<b>「畫完了」</b>——那只是告訴大家可以猜了，這一題還會繼續，你也還能補幾筆。（單機自己練習只有你一個人，沒有其他人要通知，看不到這顆鈕。）</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.248") : "<p>只能用線條和顏色表達。真的畫不出來就按<b>「跳過這題」</b>（單機時是「換題」，也可用右上角 🎮 的「跳過這一題」），會直接公布答案、換下一題。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.247") : "<p>線上房間裡，畫得越多人猜中，你這一題拿的分數越高；全部人都猜中還有額外加分。</p>"); } },
    { get h() { return globalThis.I18N ? globalThis.I18N.t("text.246") : "當猜題者：把答案打進去"; }, get b() { return (globalThis.I18N ? globalThis.I18N.t("text.245") : "<p>輪到別人畫的時候，畫布下方會出現猜題框。想到什麼就直接打進去按「猜！」，答錯不扣分，可以一直猜。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.244") : "<p>三種回應：</p>") +
      '<ul>' +
      (globalThis.I18N ? globalThis.I18N.t("text.243") : "<li><b>猜對了</b>：加分，而且你猜的內容不會被別人看到。</li>") +
      (globalThis.I18N ? globalThis.I18N.t("text.242") : "<li><b>很接近了</b>：猜中答案一半以上的字（兩個字的題目中一個、四個字的中兩個），這個提示只有你看得到。</li>") +
      (globalThis.I18N ? globalThis.I18N.t("text.241") : "<li><b>沒猜中</b>：會出現在操作摘要的「猜題紀錄」裡，讓大家知道這個答案已經有人試過了。</li>") +
      '</ul>' +
      (globalThis.I18N ? globalThis.I18N.t("text.240") : "<p>猜得越早、名次越前面，分數越高。</p>"); } },
    { get h() { return globalThis.I18N ? globalThis.I18N.t("text.239") : "題目提示怎麼看"; }, get b() { return (globalThis.I18N ? globalThis.I18N.t("text.238") : "<p>畫布上方那一條就是提示。提示不會自己出現，要等畫家按，而且依序給：</p>") +
      '<ul>' +
      (globalThis.I18N ? globalThis.I18N.t("text.237") : "<li><b>字數</b>：答案有幾個字就出現幾條底線，例如 <b>＿＿</b>。</li>") +
      (globalThis.I18N ? globalThis.I18N.t("text.236") : "<li><b>種類</b>：題目的分類，例如動物、食物、台灣在地。</li>") +
      (globalThis.I18N ? globalThis.I18N.t("text.235") : "<li><b>一個字</b>：隨機翻開答案裡的其中一個字，例如 <b>＿陽</b>。只有一個字的題目沒有這張。</li>") +
      '</ul>' +
      (globalThis.I18N ? globalThis.I18N.t("text.234") : "<p>右上角的倒數就是這一題剩下的時間。時間到、或所有人都猜中了，這一題就結束並公布答案。</p>"); } },
    { get h() { return globalThis.I18N ? globalThis.I18N.t("text.233") : "單機自己練習"; }, get b() { return (globalThis.I18N ? globalThis.I18N.t("text.232") : "<p>單機練習就你自己一個人，沒有電腦對手、也不計分，單純練習下筆用的。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.231") : "<p>挑一個題目開始畫，畫完（或不想畫了）按「換題」就換下一題，想練幾次、每次想畫多久都能自己調整。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.230") : "<p>因為只有你自己，猜題、提示、分數這些跟別人比賽的東西在單機裡都用不到，重點是練習下筆。</p>"); } },
    { get h() { return globalThis.I18N ? globalThis.I18N.t("text.229") : "線上一起玩"; }, get b() { return (globalThis.I18N ? globalThis.I18N.t("text.228") : "<p>在主選單按「線上對戰」可以開房間或用房號加入，2 到 8 個人都行（線上只有真人，沒有電腦對手）。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.227") : "<p>房主可以在對局設定裡產生<b>邀請連結</b>，對方開啟後會先停在大廳確認暱稱，按下按鈕才會真的進房。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.226") : "<p>位子滿了或對局已經開始時，新來的人會變成<b>觀戰者</b>：可以看畫、看紀錄，但不能畫也不能猜。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.225") : "<p>右上角的 📋 打開操作摘要：目前階段、你能做什麼、比分，還有「猜題紀錄」——每一則猜題（含猜錯的）與對局事件都在那裡。房間裡沒有任何真人玩家時會立刻關閉。</p>") +
      (globalThis.I18N ? globalThis.I18N.t("text.224") : "<p>等待畫面的「房間設定」最下面有<b>離開房間</b>（房主是<b>退出房間</b>）：房主退出會把房主交給下一位，最後一個人退出房間就會關掉。</p>"); } }
  ];

  var tutIndex = 0;
  function renderTutorial() {
    var t = TUTORIAL[tutIndex];
    $('tut-progress').textContent = (globalThis.I18N ? globalThis.I18N.t("text.162") : "第 ") + (tutIndex + 1) + (globalThis.I18N ? globalThis.I18N.t("text.223") : " 段 / 共 ") + TUTORIAL.length + (globalThis.I18N ? globalThis.I18N.t("text.222") : " 段");
    $('tut-box').innerHTML = '<h3>' + t.h + '</h3>' + t.b;
    $('b-tut-prev').disabled = tutIndex === 0;
    S.setLabel($('b-tut-next'), tutIndex === TUTORIAL.length - 1 ? (globalThis.I18N ? globalThis.I18N.t("text.221") : "看完了 ✓") : (globalThis.I18N ? globalThis.I18N.t("text.220") : "下一段 ▶"));
    $('tut-box').focus();
  }

  function setupTutorial() {
    $('b-tut-prev').addEventListener('click', function () {
      if (tutIndex > 0) { tutIndex--; renderTutorial(); Sound.play('click'); }
    });
    $('b-tut-next').addEventListener('click', function () {
      if (tutIndex < TUTORIAL.length - 1) { tutIndex++; renderTutorial(); Sound.play('click'); }
      else { Store.tutorialDone(true); show('s-home'); }
    });
    $('b-tut-skip').addEventListener('click', function () { Store.tutorialDone(true); show('s-home'); });
    $('b-tut-practice').addEventListener('click', function () {
      Store.tutorialDone(true);
      startSolo();
    });
  }

  /* ================================================================
     戰績
     ================================================================ */

  function renderStats() {
    var s = Store.stats();
    var card = function (title, b) {
      return '<div class="statcard"><h3>' + title + '</h3>' +
        (globalThis.I18N ? globalThis.I18N.t("text.219") : "<div class=\"statrow\"><span>玩過幾局</span><b>") + b.games + '</b></div>' +
        (globalThis.I18N ? globalThis.I18N.t("text.218") : "<div class=\"statrow\"><span>拿第一</span><b>") + b.win + '</b></div>' +
        (globalThis.I18N ? globalThis.I18N.t("text.217") : "<div class=\"statrow\"><span>總共猜對</span><b>") + b.correct + (globalThis.I18N ? globalThis.I18N.t("text.216") : " 題</b></div>") +
        (globalThis.I18N ? globalThis.I18N.t("text.215") : "<div class=\"statrow\"><span>當過畫家</span><b>") + b.drawn + (globalThis.I18N ? globalThis.I18N.t("text.214") : " 次</b></div>") +
        (globalThis.I18N ? globalThis.I18N.t("text.213") : "<div class=\"statrow\"><span>單局最高分</span><b>") + b.best + '</b></div>' +
        '</div>';
    };
    $('statgrid').innerHTML = card((globalThis.I18N ? globalThis.I18N.t("text.212") : "單機練習"), s.solo) + card((globalThis.I18N ? globalThis.I18N.t("text.211") : "線上對戰"), s.online);
  }

  /* ================================================================
     單機設定畫面
     ================================================================ */

  function buildChips(hostId, values, getter, setter) {
    var host = $(hostId);
    host.innerHTML = '';
    values.forEach(function (v) {
      var b = D.createElement('button');
      b.type = 'button';
      b.className = 'pillbtn';
      b.setAttribute('role', 'radio');
      b.textContent = v.label;
      b.setAttribute('aria-checked', String(getter() === v.value));
      b.addEventListener('click', function () {
        setter(v.value);
        Sound.play('click');
        var all = host.querySelectorAll('.pillbtn');
        for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-checked', String(all[i] === b));
      });
      host.appendChild(b);
    });
  }

  function renderSoloOptions() {
    /* 單機只剩「題目難度」要選：練幾次、每題畫多久都不設限（見 startSolo） */
    buildChips('opt-worddiff', [
      { value: 0, get label() { return globalThis.I18N ? globalThis.I18N.t("text.119") : "混合"; } }, { value: 1, get label() { return globalThis.I18N ? globalThis.I18N.t("text.140") : "簡單"; } },
      { value: 2, get label() { return globalThis.I18N ? globalThis.I18N.t("text.139") : "普通"; } }, { value: 3, get label() { return globalThis.I18N ? globalThis.I18N.t("text.138") : "困難"; } }
    ], Store.diff, Store.diff);
  }

  function setupSoloScreen() {
    renderSoloOptions();
    $('b-solo-start').addEventListener('click', startSolo);
  }

  /* ================================================================
     單機引擎：自己持有完整狀態，就你一個人，單純練習作畫用的
     ================================================================ */

  function startSolo() {
    var players = [{ id: ME, get name() { return globalThis.I18N ? globalThis.I18N.t("text.166") : "你"; }, ai: null }];
    var seed = RNG.randomSeed(null, 6);
    /* 單機練習不設限：沒有別人在等，所以直接把引擎上限吃滿 ——
       練幾次、每題畫多久都不用先決定，練夠了直接離開就好。
       （引擎需要一個有限數字才跑得動，所以用 CONST 的極限值當「不設限」。） */
    var state = Rules.createState({ lang: w.I18N.lang,
      seed: seed,
      players: players,
      rounds: Rules.CONST.ROUNDS_MAX,
      drawSec: Rules.CONST.DRAW_SEC_MAX,
      unlimited: true,               // 真的不限時、不限次：不會逾時、不會跳結算（見 rules.js createState）
      diff: Store.diff()
    });
    var r = Rules.start(state, Date.now());
    if (!r.ok) { toast(r.error, 'error'); return; }

    GameAnalytics.start({ mode: 'solo', difficulty: Store.diff(), players: 1 });
    app.mode = 'solo';
    app.solo = { state: state, seed: seed };
    /* 單機只有自己一個人：左側操作摘要、玩家分數列、給別人看的三張提示都用不到，
       整塊拿掉，空出來的高度全部給畫布（CSS 見 body.solo-mode） */
    D.body.classList.add('solo-mode');
    app.roomCode = null;
    app.feed = [];
    app.feedSeen = {};
    app.lastTurnKey = '';
    app.lastPhase = '';
    app.lastMask = '';
    app.lastGuessedCount = 0;
    /* 不設限＝上限吃滿，寫出「畫 999 次」只會讓人困惑，直接講怎麼換題 */
    pushFeed({ kind: 'system', get from() { return globalThis.I18N ? globalThis.I18N.t("text.173") : "系統"; }, get text() { return globalThis.I18N ? globalThis.I18N.t("text.210") : "練習開始，想畫幾題就畫幾題，按「換題」換下一題。"; }, at: Date.now() });

    show('s-game');
    ensurePaint();
    app.paint.clearLocal();
    app.paint.clearRedo();
    soloRefresh();
    Sound.play('start');
    startLoop();
  }

  /** 把單機的完整狀態投影成跟線上一樣形狀的 view */

  /** Project category codes into the current UI language without revealing hidden hints. */
  function localizeGame(game) {
    if (!game) return game;
    if (game.hint) Object.defineProperty(game.hint, 'catLabel', { configurable: true, get: function () { return game.hint.cat ? w.I18N.t('category.' + game.hint.cat) : null; } });
    (game.choices || []).forEach(function (choice) {
      Object.defineProperty(choice, 'catLabel', { configurable: true, get: function () { return w.I18N.t('category.' + choice.cat); } });
      Object.defineProperty(choice, 'diffLabel', { configurable: true, get: function () { return w.I18N.t('difficulty.' + choice.diff); } });
    });
    return game;
  }

  function soloRefresh() {
    var st = app.solo.state;
    var wasDrawer = !!(app.view && app.view.game && app.view.game.you.isDrawer);
    var game = localizeGame(Rules.toPublic(st, ME));
    app.view = {
      room: null,
      game: game,
      you: {
        id: ME,
        get name() { return globalThis.I18N ? globalThis.I18N.t("text.166") : "你"; },
        role: 'player',
        ready: true,
        isHost: true,
        inGame: true,
        can: {
          pick: game.you.canPick,
          draw: game.you.canDraw,
          guess: game.you.canGuess,
          skip: game.you.canDraw,
          rematch: st.over,
          invite: false,
          setAi: false,
          setSettings: false,
          becomePlayer: false,
          becomeSpectator: false
        }
      }
    };
    render();
  }

  function soloStep() {
    if (app.mode !== 'solo' || !app.solo) return;
    var st = app.solo.state;
    if (st.over) {
      /* 結束了還要再更新一次畫面，結算卡才出得來，戰績也才記得到 */
      if (!app.view || !app.view.game || !app.view.game.over) {
        soloRefresh();
        Sound.play(st.winners.indexOf(ME) >= 0 ? 'win' : 'lose');
        recordResult(app.view);
      }
      return;
    }
    var now = Date.now();

    /* 沒有電腦對手了：這裡只需要推進時間（選字逾時、作畫逾時、公布完換下一題），
       畫布跟猜題都是你自己在操作，走各自的按鈕處理函式就好。 */
    var t = Rules.tick(st, now);
    handleGameEvents(t.events);
    soloRefresh();
  }

  /** 提示要怎麼寫進猜題紀錄（單機與線上共用同一套措辭） */
  function hintFeedText(ev) {
    if (ev.step === 1) return (globalThis.I18N ? globalThis.I18N.t("text.209") : "畫家給了提示：題目有 ") + (ev.mask || '').length + (globalThis.I18N ? globalThis.I18N.t("text.176") : " 個字。");
    if (ev.step === 2) return (globalThis.I18N ? globalThis.I18N.t("text.208") : "畫家給了提示：題目的種類。");
    return (globalThis.I18N ? globalThis.I18N.t("text.207") : "畫家給了提示：") + (ev.mask || '');
  }

  function handleGameEvents(events) {
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      if (ev.type === 'autopick') {
        pushFeed({ kind: 'system', get from() { return globalThis.I18N ? globalThis.I18N.t("text.173") : "系統"; }, get text() { return globalThis.I18N ? globalThis.I18N.t("text.206") : "時間到，系統幫畫家挑了題目。"; }, at: Date.now() });
      } else if (ev.type === 'hint') {
        pushFeed({ kind: 'system', get from() { return globalThis.I18N ? globalThis.I18N.t("text.173") : "系統"; }, text: hintFeedText(ev), at: Date.now() });
        Sound.play('hint');
      } else if (ev.type === 'turnend') {
        /* 單機自己練習沒有其他人猜題，total 會是 0——這時候不要顯示「0/0 人猜中」，
           畫完（或跳過）就直接換下一題。 */
        var turnendText = ev.entry.total > 0
          ? (globalThis.I18N ? globalThis.I18N.t("text.204") : "答案是「") + ev.entry.word + '」，' + ev.entry.correct + '/' + ev.entry.total + (globalThis.I18N ? globalThis.I18N.t("text.205") : " 人猜中。")
          : (globalThis.I18N ? globalThis.I18N.t("text.204") : "答案是「") + ev.entry.word + (globalThis.I18N ? globalThis.I18N.t("text.203") : "」，換下一題。");
        pushFeed({ kind: 'system', get from() { return globalThis.I18N ? globalThis.I18N.t("text.173") : "系統"; }, text: turnendText, at: Date.now() });
        Sound.play(ev.entry.correct > 0 ? 'turn' : 'timeup');
        if (app.paint) { app.paint.clearRedo(); }
      } else if (ev.type === 'turnstart') {
        if (app.paint) { app.paint.clearLocal(); app.paint.clearRedo(); }
      } else if (ev.type === 'gameover') {
        Sound.play('win');
      }
    }
  }

  function startLoop() {
    stopLoop();
    app.loop = setInterval(function () {
      if (app.mode === 'solo') soloStep();
      else updateTimers();
    }, LOOP_MS);
  }
  function stopLoop() { if (app.loop) { clearInterval(app.loop); app.loop = 0; } }

  /* ================================================================
     猜題紀錄（唯讀，顯示在操作摘要裡）
     ================================================================ */

  function pushFeed(entry) {
    if (!entry) return;
    if (entry.id && app.feedSeen[entry.id]) return;
    if (entry.id) app.feedSeen[entry.id] = 1;
    app.feed.push(entry);
    if (app.feed.length > 120) app.feed.splice(0, app.feed.length - 120);
    renderRecent();
  }

  function replaceFeed(list) {
    app.feed = (list || []).slice();
    app.feedSeen = {};
    for (var i = 0; i < app.feed.length; i++) if (app.feed[i].id) app.feedSeen[app.feed[i].id] = 1;
    renderRecent();
  }

  /** 系統事件與每一則猜題合成同一條時間軸；線上的系統訊息以伺服器摘要為準，不重複。 */
  function recentEvents() {
    var v = app.view;
    var hasSummary = !!(v && v.room && v.room.summary);
    var out = [];
    var i, n, m;
    if (hasSummary) {
      for (i = 0; i < v.room.summary.length; i++) {
        n = v.room.summary[i];
        out.push({ at: n.at || 0, kind: n.kind || 'info', text: n.key ? w.I18N.message(n.key, n.params) : n.text });
      }
    }
    for (i = 0; i < app.feed.length; i++) {
      m = app.feed[i];
      if (hasSummary && m.kind !== 'guess') continue;
      out.push({
        at: m.at || 0,
        kind: m.kind === 'guess' ? 'guess' : (m.kind || 'info'),
        get text() { return m.kind === 'guess' ? (m.from + (globalThis.I18N ? globalThis.I18N.t("text.202") : " 猜「") + m.text + '」') : m.text; },
        mine: !!(m.fromId && v && v.you && m.fromId === v.you.id)
      });
    }
    out.sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
    return out;
  }

  /** 唯一的紀錄區：最新的排在最上面，不用捲到底就看得到 */
  function renderRecent() {
    var ul = $('sum-list');
    if (!ul) return;
    var recent = recentEvents().slice(-RECENT_MAX).reverse();
    ul.innerHTML = recent.map(function (n) {
      return '<li data-k="' + esc(n.kind || 'info') + '"' + (n.mine ? ' data-mine="true"' : '') +
        '>' + esc(n.text) + '</li>';
    }).join('');
    $('sum-empty').hidden = recent.length > 0;
  }

  function setAsideOpen(open) {
    app.asideOpen = !!open;
    var aside = $('game-aside');
    aside.classList.toggle('open', app.asideOpen);
    /* 窄版是把浮層移出畫面，寬版是常駐左欄；收合要用 display 才真的讓出空間 */
    aside.classList.toggle('collapsed', !app.asideOpen);
    $('game').classList.toggle('aside-open', app.asideOpen);
    $('b-aside-toggle').setAttribute('aria-expanded', String(app.asideOpen));
    layoutStage();
  }

  /* 寬版左欄常駐（紀錄就在裡面），窄版收起來、用 📋 叫出來 */
  function relayoutFeed() {
    var wide = w.matchMedia('(min-width:1100px)').matches;
    if (app.wideLayout === wide) return;
    app.wideLayout = wide;
    setAsideOpen(wide);
    renderRecent();
    layoutStage();
  }

  /* ================================================================
     畫布
     ================================================================ */

  function ensurePaint() {
    if (app.paint) return app.paint;
    app.paint = Paint.create($('board'), {
      onStroke: sendStroke,
      onSound: function (kind) {
        if (kind === 'draw' || kind === 'pen') Sound.playPen();
        else Sound.play(kind === 'erase' ? 'erase' : (kind === 'fill' ? 'fill' : 'shape'));
      },
      onBlocked: function () {
        var v = app.view;
        if (!v || !v.game) return;
        toolHint(v.you && v.you.role === 'spectator'
          ? (globalThis.I18N ? globalThis.I18N.t("text.201") : "你是觀戰者，不能畫也不能猜。")
          : (v.game.you.isDrawer ? (globalThis.I18N ? globalThis.I18N.t("text.200") : "還不能畫，先挑一個題目。") : (globalThis.I18N ? globalThis.I18N.t("text.199") : "現在不是你畫，換你猜猜看！")), 'error');
        Sound.play('blocked');
      }
    });
    app.paint.setTool(Store.tool());
    app.paint.setColor(Store.color());
    app.paint.setWidth(Store.width());
    return app.paint;
  }

  function sendStroke(stroke) {
    if (app.mode === 'solo') {
      var r = Rules.addStroke(app.solo.state, ME, stroke);
      if (!r.ok) { toolHint(r.error, 'error'); Sound.play('blocked'); return; }
      app.paint.addStroke(r.stroke);
      app.paint.clearRedo();
      soloRefresh();
      return;
    }
    /* 線上：本機先畫出來（不等來回），伺服器回聲會因為筆數相同而被略過 */
    var sanitized = Rules.sanitizeStroke(stroke);
    if (!sanitized) return;
    app.paint.addStroke(sanitized);
    app.paint.clearRedo();
    w.Online.send('room:stroke', { stroke: stroke });
  }

  var stageRO = null;
  function layoutStage() {
    var stage = $('stage'), box = $('stage-canvas');
    if (!stage || !box) return;
    /* 舞台是 flex:1，工具列或猜題框一出現高度就會變，所以用 ResizeObserver
       盯著它，畫布永遠不會比舞台大。 */
    if (!stageRO && w.ResizeObserver) {
      stageRO = new w.ResizeObserver(function () { sizeCanvas(); });
      stageRO.observe(stage);
    }
    sizeCanvas();
  }

  function sizeCanvas() {
    var stage = $('stage'), box = $('stage-canvas');
    if (!stage || !box) return;
    var r = stage.getBoundingClientRect();
    var size = Math.floor(Math.min(r.width, r.height));
    if (!isFinite(size) || size < 80) return;
    /* 只扣掉外框陰影需要的一點點餘裕，其餘全部給畫布 */
    size = Math.max(140, size - 2);
    if (box.style.width === size + 'px') return;
    box.style.width = size + 'px';
    box.style.height = size + 'px';
    if (app.paint) app.paint.resize();
  }

  function toolHint(text, kind) {
    var el = $('tool-hint');
    el.textContent = text || '';
    el.setAttribute('data-kind', kind || 'info');
  }

  /* ---------------------------------------------------------- 工具列 */

  var TOOL_ORDER = ['pen', 'brush', 'line', 'rect', 'ellipse', 'erase', 'fill'];
  var TOOL_ICON = { pen: 'pen', brush: 'brush', line: 'line', rect: 'rect', ellipse: 'ellipse', erase: 'erase', fill: 'fill' };
  var TOOL_TIP = {
    get pen() { return globalThis.I18N ? globalThis.I18N.t("text.198") : "鉛筆：按住拖曳畫線"; },
    get brush() { return globalThis.I18N ? globalThis.I18N.t("text.197") : "筆刷：比鉛筆粗一級"; },
    get line() { return globalThis.I18N ? globalThis.I18N.t("text.196") : "直線：按住拖到終點放開"; },
    get rect() { return globalThis.I18N ? globalThis.I18N.t("text.195") : "矩形：拖出對角線"; },
    get ellipse() { return globalThis.I18N ? globalThis.I18N.t("text.194") : "橢圓：拖出外框"; },
    get erase() { return globalThis.I18N ? globalThis.I18N.t("text.193") : "橡皮擦：擦掉畫錯的地方"; },
    get fill() { return globalThis.I18N ? globalThis.I18N.t("text.192") : "油漆桶：點一下填滿封閉區域"; }
  };

  function buildToolbar() {
    var tools = $('tool-list');
    tools.innerHTML = '';
    TOOL_ORDER.forEach(function (key) {
      var b = D.createElement('button');
      b.type = 'button';
      b.className = 'toolbtn';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-tool', key);
      b.title = TOOL_TIP[key];
      b.setAttribute('aria-label', Rules.TOOLS[key].label);
      b.innerHTML = '<span class="ico">' + S.icon(TOOL_ICON[key]) + '</span>';
      b.addEventListener('click', function () { chooseTool(key); });
      tools.appendChild(b);
    });

    var colors = $('color-list');
    colors.innerHTML = '';
    Rules.COLORS.forEach(function (hex, i) {
      var b = D.createElement('button');
      b.type = 'button';
      b.className = 'colorbtn';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-color-index', String(i));
      b.style.background = hex;
      b.setAttribute('aria-label', (globalThis.I18N ? globalThis.I18N.t("text.191") : "顏色 ") + (i + 1));
      b.title = (globalThis.I18N ? globalThis.I18N.t("text.191") : "顏色 ") + (i + 1);
      b.addEventListener('click', function () {
        app.paint.setColor(i); Store.color(i); Sound.play('click'); syncToolbar();
      });
      colors.appendChild(b);
    });

    var widths = $('width-list');
    widths.innerHTML = '';
    Rules.WIDTHS.forEach(function (px, i) {
      var b = D.createElement('button');
      b.type = 'button';
      b.className = 'widthbtn';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-width-index', String(i));
      b.setAttribute('aria-label', (globalThis.I18N ? globalThis.I18N.t("text.190") : "筆寬 ") + (i + 1));
      b.title = (globalThis.I18N ? globalThis.I18N.t("text.190") : "筆寬 ") + (i + 1);
      var dot = D.createElement('i');
      var size = Math.max(5, Math.round(px / 3.2));
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      b.appendChild(dot);
      b.addEventListener('click', function () {
        app.paint.setWidth(i); Store.width(i); Sound.play('click'); syncToolbar();
      });
      widths.appendChild(b);
    });

    $('opt-filled').addEventListener('change', function () {
      app.paint.setFilled(this.checked);
      $('fillbox').classList.toggle('on', this.checked);
    });
    $('b-undo').addEventListener('click', doUndo);
    $('b-redo').addEventListener('click', doRedo);
    $('b-clear').addEventListener('click', doClear);
    $('b-done').addEventListener('click', doDone);
    $('b-skip').addEventListener('click', doSkip);
    $('b-solo-save').addEventListener('click', saveSoloDrawing);
    $('b-solo-image').addEventListener('click', downloadSoloImage);
    $('b-solo-load').addEventListener('click', chooseSoloFile);
    $('b-solo-next').addEventListener('click', doSkip);
    $('b-solo-load-home').addEventListener('click', chooseSoloFile);
    $('solo-file-input').addEventListener('change', loadSoloFile);
    $('b-hint-1').addEventListener('click', doHint);
    $('b-hint-2').addEventListener('click', doHint);
    $('b-hint-3').addEventListener('click', doHint);
  }

  function soloDrawingReady() {
    return app.mode === 'solo' && app.solo && app.solo.state.phase === 'drawing';
  }

  function drawingFilename(extension) {
    return (globalThis.I18N ? globalThis.I18N.t("text.189") : "你畫我猜-") + Rules.word(app.solo.state).text + extension;
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = D.createElement('a');
    link.href = url;
    link.download = filename;
    D.body.appendChild(link);
    link.click();
    link.remove();
    w.setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  function saveSoloDrawing() {
    if (!soloDrawingReady()) return;
    var text = w.DrawingFile.encode(app.solo.state);
    downloadBlob(new Blob([text], { type: 'application/json;charset=utf-8' }), drawingFilename('.drawguess.json'));
    toast((globalThis.I18N ? globalThis.I18N.t("text.188") : "作品存檔已送出下載，可用「載入」繼續編輯。"), 'ok');
  }

  function downloadSoloImage() {
    if (!soloDrawingReady()) return;
    var filename = drawingFilename('.png');
    app.paint.toBlob(function (blob) {
      if (!blob) { toast((globalThis.I18N ? globalThis.I18N.t("text.187") : "圖片匯出失敗，請再試一次。"), 'error'); return; }
      downloadBlob(blob, filename);
      toast((globalThis.I18N ? globalThis.I18N.t("text.186") : "PNG 圖片已送出下載。"), 'ok');
    });
  }

  function chooseSoloFile() {
    if (app.screen !== 's-solo' && !soloDrawingReady()) return;
    var input = $('solo-file-input');
    input.value = '';
    input.click();
  }

  function loadSoloFile() {
    var file = this.files && this.files[0];
    if (!file) return;
    var screen = app.screen, solo = app.solo;
    if (screen !== 's-solo' && !soloDrawingReady()) return;
    var reader = new FileReader();
    reader.onerror = function () { toast((globalThis.I18N ? globalThis.I18N.t("text.185") : "讀取檔案失敗，請再試一次。"), 'error'); };
    reader.onload = function () {
      if (app.screen !== screen || app.solo !== solo) return;
      var state;
      try { state = w.DrawingFile.decode(reader.result, { id: ME, get name() { return globalThis.I18N ? globalThis.I18N.t("text.166") : "你"; } }, Date.now()); }
      catch (e) { toast(e.message, 'error'); return; }
      var replace = function () {
        if (app.screen !== screen || app.solo !== solo) return;
        if (screen === 's-solo') startSolo();
        app.solo.state = state;
        app.solo.seed = state.seed;
        app.paint.setStrokes(state.strokes);
        app.paint.clearRedo();
        soloRefresh();
        toast((globalThis.I18N ? globalThis.I18N.t("text.184") : "作品已載入，可以繼續畫。"), 'ok');
      };
      if (screen === 's-game' && solo.state.strokes.length) {
        askConfirm({
          get title() { return globalThis.I18N ? globalThis.I18N.t("text.183") : "載入作品？"; },
          get text() { return globalThis.I18N ? globalThis.I18N.t("text.182") : "載入會取代目前畫布。尚未存檔的筆畫會被取代，請先存檔再載入。"; },
          get ok() { return globalThis.I18N ? globalThis.I18N.t("text.181") : "載入作品"; }, get cancel() { return globalThis.I18N ? globalThis.I18N.t("text.180") : "保留目前作品"; }
        }, replace);
      } else replace();
    };
    reader.readAsText(file, 'UTF-8');
  }

  function chooseTool(key) {
    app.paint.setTool(key);
    Store.tool(key);
    Sound.play('click');
    toolHint(TOOL_TIP[key]);
    syncToolbar();
  }

  /** 「畫完了」按過就不再重複；「跳過這題」只有畫家能按 */
  function syncDoneButtons() {
    var done = $('b-done'), skip = $('b-skip');
    if (!done || !skip) return;
    var v = app.view, g = v && v.game;
    var drawing = !!(g && g.phase === 'drawing' && g.you.isDrawer);
    /* 單機自己練習只有你一個人，沒有其他人可以通知，「畫完了」這顆鈕整個用不到，
       改用作品操作列裡的「換題」換下一題。 */
    if (app.mode === 'solo') {
      done.hidden = true;
      skip.disabled = !drawing;
      $('b-solo-next').disabled = !drawing;
      return;
    }
    /* 線上房間：這顆鈕只要輪到你畫就一直能按，按過也不鎖、不改字 ——
       補了幾筆想再叫大家看一次是很自然的事，伺服器那邊同樣不擋重複。 */
    done.hidden = false;
    done.disabled = !drawing;
    var lbl = done.querySelector('.b3-lbl') || done;
    lbl.textContent = (globalThis.I18N ? globalThis.I18N.t("text.179") : "畫完了");
    skip.disabled = !drawing;
  }

  function syncToolbar() {
    var cur = app.paint ? app.paint.getTool() : 'pen';
    var list = $('tool-list').querySelectorAll('.toolbtn');
    for (var i = 0; i < list.length; i++) {
      list[i].setAttribute('aria-checked', String(list[i].getAttribute('data-tool') === cur));
    }
    var ci = app.paint ? app.paint.getColor() : 0;
    var cs = $('color-list').querySelectorAll('.colorbtn');
    for (var j = 0; j < cs.length; j++) {
      cs[j].setAttribute('aria-checked', String(Number(cs[j].getAttribute('data-color-index')) === ci));
    }
    var wi = app.paint ? app.paint.getWidth() : 1;
    var ws = $('width-list').querySelectorAll('.widthbtn');
    for (var k = 0; k < ws.length; k++) {
      ws[k].setAttribute('aria-checked', String(Number(ws[k].getAttribute('data-width-index')) === wi));
    }
    var shape = cur === 'rect' || cur === 'ellipse';
    $('fillbox').style.display = shape ? '' : 'none';
    $('b-redo').disabled = !app.paint || app.paint.redoCount() === 0;
    syncDoneButtons();
  }

  function doUndo() {
    if (app.mode === 'solo') {
      var r = Rules.undoStroke(app.solo.state, ME);
      if (!r.ok) { toolHint(r.error, 'error'); Sound.play('blocked'); return; }
      app.paint.pushRedo(r.removed);
      app.paint.setStrokes(app.solo.state.strokes);
      Sound.play('undo');
      soloRefresh();
      syncToolbar();
      return;
    }
    var list = app.paint.strokes();
    if (list.length) app.paint.pushRedo(list[list.length - 1]);
    w.Online.send('room:undo', {});
    Sound.play('undo');
    syncToolbar();
  }

  function doRedo() {
    var st = app.paint.popRedo();
    if (!st) { toolHint((globalThis.I18N ? globalThis.I18N.t("text.178") : "沒有可以重做的筆畫了。")); return; }
    sendStroke({ t: st.t, c: st.c, w: st.w, f: st.f, p: st.p.slice() });
    Sound.play('shape');
    syncToolbar();
  }

  function doClear() {
    if (app.mode === 'solo') {
      var r = Rules.clearBoard(app.solo.state, ME);
      if (!r.ok) { toolHint(r.error, 'error'); return; }
      app.paint.clearLocal();
      app.paint.clearRedo();
      Sound.play('clear');
      soloRefresh();
      return;
    }
    w.Online.send('room:clear', {});
    Sound.play('clear');
  }

  /* 三張提示依序給：字數 → 種類 → 一個字。按鈕只是送出「給下一張」。 */
  function doHint() {
    if (app.mode === 'solo') {
      var r = Rules.giveHint(app.solo.state, ME, Date.now());
      if (!r.ok) { toolHint(r.error, 'error'); Sound.play('blocked'); return; }
      noteHint(r);
      Sound.play('hint');
      soloRefresh();
      return;
    }
    w.Online.send('room:hint', {});
  }

  function noteHint(r) {
    var text = r.step === 1 ? (globalThis.I18N ? globalThis.I18N.t("text.177") : "你給了提示：題目有 ") + r.mask.length + (globalThis.I18N ? globalThis.I18N.t("text.176") : " 個字。")
      : r.step === 2 ? (globalThis.I18N ? globalThis.I18N.t("text.175") : "你給了提示：題目的種類。")
        : (globalThis.I18N ? globalThis.I18N.t("text.174") : "你給了提示：") + r.mask;
    pushFeed({ kind: 'system', get from() { return globalThis.I18N ? globalThis.I18N.t("text.173") : "系統"; }, text: text, at: Date.now() });
  }

  /**
   * 「畫完了」：只是告訴其他人可以認真猜了 —— 這一題不會結束，
   * 時間照跑，畫家還可以繼續補筆畫。真的要結束是「跳過這題」。
   */
  function doDone() {
    /* 單機自己練習沒有其他人可以通知，這顆鈕在單機一律藏起來（見 syncDoneButtons），
       按鈕不存在自然點不到，這裡留一個保險：真的被呼叫到也什麼都不做。 */
    if (app.mode === 'solo') return;
    /* 想按幾次就按幾次：不鎖按鈕、不記「按過了」，每一次都送出去再廣播一次 */
    w.Online.send('room:done', {});
  }

  function doSkip() {
    if (app.mode === 'solo') {
      var r = Rules.giveUp(app.solo.state, ME, Date.now());
      if (!r.ok) { toolHint(r.error, 'error'); return; }
      handleGameEvents([{ type: 'turnend', entry: r.entry }]);
      soloRefresh();
      return;
    }
    w.Online.send('room:skip', {});
  }

  /* ================================================================
     猜題
     ================================================================ */

  function setupGuessbar() {
    $('guessbar').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = $('guess-input');
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      submitGuess(text);
      input.focus();
    });
  }

  function submitGuess(text) {
    if (app.mode === 'solo') {
      var now = Date.now();
      var r = Rules.guess(app.solo.state, ME, text, now);
      if (!r.ok) { toast(r.error, 'error'); Sound.play('blocked'); return; }
      if (r.verdict === 'hit') {
        pushFeed({ kind: 'correct', get from() { return globalThis.I18N ? globalThis.I18N.t("text.173") : "系統"; }, get text() { return (globalThis.I18N ? globalThis.I18N.t("text.172") : "你猜對了！（第 ") + r.order + (globalThis.I18N ? globalThis.I18N.t("text.171") : " 個，+") + r.points + (globalThis.I18N ? globalThis.I18N.t("text.170") : " 分）"); }, at: now });
        Sound.play('correct'); Sound.vibrate([12, 40, 12]);
        toast((globalThis.I18N ? globalThis.I18N.t("text.169") : "猜對了！+") + r.points + (globalThis.I18N ? globalThis.I18N.t("text.168") : " 分"), 'ok');
      } else if (r.verdict === 'close') {
        toast('「' + text + (globalThis.I18N ? globalThis.I18N.t("text.167") : "」很接近了，再想一下！"), 'ok');
        Sound.play('close');
      } else {
        pushFeed({ kind: 'guess', get from() { return globalThis.I18N ? globalThis.I18N.t("text.166") : "你"; }, fromId: ME, role: 'player', text: text, at: now });
        Sound.play('wrong');
      }
      soloRefresh();
      return;
    }
    w.Online.send('room:guess', { text: text });
  }

  /* ================================================================
     畫面渲染（單機與線上共用）
     ================================================================ */

  var PHASE_LABEL = { get picking() { return globalThis.I18N ? globalThis.I18N.t("text.165") : "選題目"; }, get drawing() { return globalThis.I18N ? globalThis.I18N.t("text.150") : "作畫中"; }, get reveal() { return globalThis.I18N ? globalThis.I18N.t("text.164") : "公布答案"; }, get over() { return globalThis.I18N ? globalThis.I18N.t("text.163") : "結算"; } };

  /* 只顯示目前第幾題，不顯示「/ 總題數」：
     線上房間對局中可以一直有人中途加入，總題數在結束前其實還會變，
     顯示分母反而是誤導；單機沒有這回事，但兩邊乾脆都只看目前題號就好，簡單清楚。 */
  function turnLabel(g) {
    return (globalThis.I18N ? globalThis.I18N.t("text.162") : "第 ") + g.turnNo + (globalThis.I18N ? globalThis.I18N.t("text.161") : " 題");
  }

  function render() {
    var v = app.view;
    if (!v) return;
    var g = v.game;
    var closed = v.room && v.room.closed;
    if (w.NetworkLatency) w.NetworkLatency.setActive(app.screen === 's-game' && app.mode === 'online' && !!v.room && v.room.phase === 'playing' && !!g && g.phase !== 'over');

    /* ---- 上排狀態 ---- */
    var phaseChip = $('phase-chip');
    if (closed) {
      phaseChip.textContent = (globalThis.I18N ? globalThis.I18N.t("text.071") : "房間已結束");
      phaseChip.setAttribute('data-p', 'over');
    } else if (v.room && v.room.phase === 'waiting') {
      phaseChip.textContent = (globalThis.I18N ? globalThis.I18N.t("text.070") : "等待開始");
      phaseChip.setAttribute('data-p', 'picking');
    } else if (g) {
      phaseChip.textContent = PHASE_LABEL[g.phase] || g.phase;
      phaseChip.setAttribute('data-p', g.phase);
    }
    $('round-chip').textContent = g ? turnLabel(g) : (globalThis.I18N ? globalThis.I18N.t("text.160") : "尚未開始");

    updateTimers();

    /* ---- 題目提示 ----
       對局中一直留著（沒題目時顯示等待文字），提示列才不會忽然冒出來把畫布擠小 */
    var wb = $('wordbar');
    if (!g || closed) {
      wb.hidden = true;
    } else if (g.hint) {
      var mine = g.you.isDrawer;
      var h = g.hint;
      wb.hidden = false;
      wb.setAttribute('data-mine', String(mine));
      $('wordbar-label').textContent = mine ? (globalThis.I18N ? globalThis.I18N.t("text.159") : "你要畫的是") : (globalThis.I18N ? globalThis.I18N.t("text.156") : "題目");
      /* 猜題者要等畫家按提示：還沒按就連幾個字都不知道 */
      $('wordbar-mask').textContent = (mine || g.answer) ? (g.answer || '')
        : (h.lenShown ? h.mask : '？');
      var meta = [];
      if (h.catShown) meta.push(h.catLabel);
      if (h.lenShown) meta.push(h.len + (globalThis.I18N ? globalThis.I18N.t("text.158") : " 個字"));
      if (!mine && !h.lenShown && !h.catShown) meta.push((globalThis.I18N ? globalThis.I18N.t("text.069") : "畫家還沒給提示"));
      if (!mine && h.revealed) meta.push((globalThis.I18N ? globalThis.I18N.t("text.157") : "翻開了 1 個字"));
      meta.push(turnLabel(g));
      $('wordbar-meta').textContent = meta.join('・');
    } else {
      wb.hidden = false;
      wb.setAttribute('data-mine', 'false');
      $('wordbar-label').textContent = (globalThis.I18N ? globalThis.I18N.t("text.156") : "題目");
      $('wordbar-mask').textContent = '—';
      $('wordbar-meta').textContent = (g.phase === 'picking' ? (globalThis.I18N ? globalThis.I18N.t("text.155") : "畫家正在挑題目…") : (globalThis.I18N ? globalThis.I18N.t("text.070") : "等待開始")) +
        '・' + turnLabel(g);
    }
    /* 畫家斷線中：告訴大家不是當機，15 秒沒回來就會跳過這一題（伺服器算的） */
    if (v.room && v.room.drawerAwayUntil && !wb.hidden) {
      $('wordbar-meta').textContent = (globalThis.I18N ? globalThis.I18N.t("text.154") : "畫家斷線了，最多等 15 秒・") + $('wordbar-meta').textContent;
    }

    renderPlayers();
    renderOverlay();
    renderControls();
    renderReference();
    renderAside();
    sizeCanvas();
  }

  function updateTimers() {
    var v = app.view;
    if (!v || !v.game) { $('timer-chip').hidden = true; return; }
    var g = v.game;
    var chip = $('timer-chip');
    if (g.phase === 'over' || !g.deadline || (v.room && v.room.closed)) { chip.hidden = true; return; }
    /* 單機作畫不設限（上限 99999 秒）：寫「99999 秒」只會讓人以為壞了，
       但整顆藏起來會讓抬頭少一列的高度，右側工具列跟著上移鑽到設定鈕底下，
       所以維持同一顆 chip，只把數字換成「不限時」。
       選題那 15 秒是真的會逾時自動挑第一個，那個照常倒數。 */
    if (app.mode === 'solo' && g.phase === 'drawing') {
      chip.hidden = false;
      chip.setAttribute('data-urgent', 'false');
      $('timer-text').textContent = (globalThis.I18N ? globalThis.I18N.t("text.153") : "不限時");
      var soloSum = $('sum-timer');
      if (soloSum) soloSum.textContent = (globalThis.I18N ? globalThis.I18N.t("text.153") : "不限時");
      return;
    }
    var s = secsLeft(g.deadline);
    chip.hidden = false;
    $('timer-text').textContent = s + (globalThis.I18N ? globalThis.I18N.t("text.152") : " 秒");
    /* 選題卡上的「N 秒內沒選…」也跟著倒數（卡片本身只在收到投影時才更新） */
    var ps = D.querySelector('#overlay-card .pick-secs');
    if (ps && ps.textContent !== String(s)) ps.textContent = s;
    chip.setAttribute('data-urgent', String(g.phase === 'drawing' && s <= 10));
    var sum = $('sum-timer');
    if (sum) sum.textContent = s + (globalThis.I18N ? globalThis.I18N.t("text.152") : " 秒");
  }

  function moodOf(p, g) {
    if (g.phase === 'over') return g.winners.indexOf(p.id) >= 0 ? 'win' : 'sad';
    if (p.isDrawer) return g.phase === 'drawing' ? 'draw' : 'think';
    if (p.guessed) return 'happy';
    return g.phase === 'drawing' ? 'think' : 'idle';
  }

  function stateOf(p, g) {
    if (p.isDrawer) return g.phase === 'picking' ? (globalThis.I18N ? globalThis.I18N.t("text.151") : "選題目中") : (globalThis.I18N ? globalThis.I18N.t("text.150") : "作畫中");
    if (p.guessed) return (globalThis.I18N ? globalThis.I18N.t("text.149") : "已猜中");
    if (g.phase === 'drawing') return p.wrong ? ((globalThis.I18N ? globalThis.I18N.t("text.148") : "猜了 ") + p.wrong + (globalThis.I18N ? globalThis.I18N.t("text.147") : " 次")) : (globalThis.I18N ? globalThis.I18N.t("text.146") : "思考中");
    return p.ai ? (globalThis.I18N ? globalThis.I18N.t("text.145") : "電腦") : (globalThis.I18N ? globalThis.I18N.t("text.008") : "等待中");
  }

  function renderPlayers() {
    var v = app.view, g = v.game;
    var host = $('playerstrip');
    if (!g) { host.innerHTML = ''; return; }
    var html = '';
    for (var i = 0; i < g.players.length; i++) {
      var p = g.players[i];
      var cls = ['pcard'];
      if (p.isDrawer) cls.push('drawer');
      if (p.guessed) cls.push('guessed');
      if (p.id === v.you.id) cls.push('me');
      html += '<div class="' + cls.join(' ') + '">' +
        '<span class="pface" aria-hidden="true">' + S.face(i, moodOf(p, g)) + '</span>' +
        '<span class="pinfo"><b class="pname">' + esc(p.name) + '</b>' +
        '<span class="pstate">' + esc(stateOf(p, g)) + '</span></span>' +
        '<span class="pscore">' + p.score + '</span></div>';
    }
    host.innerHTML = html;
  }

  /* ---------------------------------------------------- 疊層（overlay） */

  function renderOverlay() {
    var v = app.view, g = v.game;
    var wrap = $('stage-overlay'), card = $('overlay-card');
    var html = null;

    /* 規則下拉選單只在等待畫面才有意義：一離開等待畫面（開始對局、房間結束……）
       就把展開狀態清掉，不然下次回到等待畫面（例如再玩一局）會莫名其妙自動展開。 */
    if (!v.room || v.room.phase !== 'waiting') app.ruleMenuOpen = null;

    if (v.room && v.room.closed) {
      html = (globalThis.I18N ? globalThis.I18N.t("text.144") : "<h3>房間已經結束</h3><p>") + esc(w.I18N.message(v.room.closedReason) || (globalThis.I18N ? globalThis.I18N.t("text.143") : "房間裡已經沒有玩家了。")) + '</p>' +
        (globalThis.I18N ? globalThis.I18N.t("text.142") : "<div class=\"overlay-btns\"><button class=\"btn3d\" data-color=\"grape\" data-act=\"lobby\">回大廳</button>") +
        (globalThis.I18N ? globalThis.I18N.t("text.141") : "<button class=\"btn3d small\" data-color=\"cream\" data-act=\"home\">回主選單</button></div>");
    } else if (v.room && v.room.phase === 'waiting') {
      html = roomSetupHtml(v);
    } else if (g && g.phase === 'picking') {
      html = pickingHtml(v, g);
    } else if (g && g.phase === 'reveal') {
      html = revealHtml(g);
    } else if (g && g.phase === 'over') {
      html = overHtml(v, g);
    }

    /* 房間設定卡比其他卡大得多：寬螢幕要改兩欄（.setup-card），而且它開著的時候
       提示訊息要改到上方出現，不然會蓋住卡片底部的「準備／開始」（body.setup-open）。 */
    var isSetup = !!html && !!v.room && !v.room.closed && v.room.phase === 'waiting';
    card.classList.toggle('setup-card', isSetup);
    D.body.classList.toggle('setup-open', isSetup);

    if (!html) {
      wrap.hidden = true;
      card.innerHTML = '';
      app.lastOverlayHtml = null;
      return;
    }
    wrap.hidden = false;
    /* 內容一樣就不重建 DOM：房間設定面板每秒都會收到投影，
       重建會把邀請連結輸入框的選取與按鈕焦點洗掉。 */
    if (html === app.lastOverlayHtml) return;
    app.lastOverlayHtml = html;
    /* 不再整張 innerHTML 重建，而是「就地更新」（morphOverlay）：只改有變的地方。
       以前別人一聊天、一按準備，整張卡就重建一次，聊天輸入框被換成新的元素：
       注音打到一半會中斷、游標跳到最後、iPhone 的鍵盤還會被收起來。
       現在輸入框、按鈕這些節點都會留著，只有文字或屬性真的變了才動。 */
    var list = card.querySelector('#chat-list');
    var stick = !list || (list.scrollHeight - list.scrollTop - list.clientHeight < 30);
    var tpl = D.createElement('div');
    tpl.innerHTML = html;
    morphChildren(card, tpl);
    S.decorateAll(card);
    paintIcons(card);
    afterOverlayRender(card, stick);
  }

  /* ---------------------------------------------------- 卡片就地更新 */

  /** 兩個節點算不算「同一個東西」：同標籤、同 id、同 data-act／data-field（按鈕的身分） */
  function sameKind(a, b) {
    if (a.nodeType !== b.nodeType) return false;
    if (a.nodeType !== 1) return true;
    if (a.tagName !== b.tagName) return false;
    return (a.id || '') === (b.id || '') &&
      (a.getAttribute('data-act') || '') === (b.getAttribute('data-act') || '') &&
      (a.getAttribute('data-field') || '') === (b.getAttribute('data-field') || '');
  }

  /* 這幾個屬性是畫面自己加上去的（立體按鈕、圖示），新的 HTML 裡本來就沒有，不能被清掉 */
  var MORPH_KEEP = { 'data-b3': 1, 'data-ico-done': 1 };

  function syncAttrs(o, n) {
    for (var i = o.attributes.length - 1; i >= 0; i--) {
      var name = o.attributes[i].name;
      if (!MORPH_KEEP[name] && !n.hasAttribute(name)) o.removeAttribute(name);
    }
    for (var j = 0; j < n.attributes.length; j++) {
      var a = n.attributes[j];
      var val = (a.name === 'class' && o.classList && o.classList.contains('press')) ? a.value + ' press' : a.value;
      if (o.getAttribute(a.name) !== val) o.setAttribute(a.name, val);
    }
  }

  function morphNode(o, n) {
    if (o.nodeType !== 1) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
    var colorBefore = o.getAttribute('data-color');
    var icoBefore = o.getAttribute('data-ico');
    syncAttrs(o, n);
    /* 已經裝飾過的立體按鈕：裡面是 svgui 畫的外框＋標籤，只換標籤文字，換色就請它重畫 */
    if (o.getAttribute('data-b3')) {
      var lbl = o.querySelector('.b3-lbl');
      if (lbl && lbl.innerHTML !== n.innerHTML) lbl.innerHTML = n.innerHTML;
      if (o.getAttribute('data-color') !== colorBefore) S.setColor(o, o.getAttribute('data-color'));
      return;
    }
    if (o.getAttribute('data-ico-done') && icoBefore === o.getAttribute('data-ico')) return;
    if (o.getAttribute('data-ico-done')) o.removeAttribute('data-ico-done');
    if (o.tagName === 'INPUT' || o.tagName === 'TEXTAREA') {
      /* 唯讀的（邀請網址）跟著新值換；使用者正在打的字（聊天）完全不動 */
      if (o.readOnly && o.value !== n.value) o.value = n.value;
      return;
    }
    morphChildren(o, n);
  }

  function morphChildren(o, n) {
    var oldKids = Array.prototype.slice.call(o.childNodes);
    var newKids = Array.prototype.slice.call(n.childNodes);
    for (var i = 0; i < newKids.length; i++) {
      var nk = newKids[i], ok = oldKids[i];
      if (!ok) o.appendChild(nk);
      else if (sameKind(ok, nk)) morphNode(ok, nk);
      else o.replaceChild(nk, ok);
    }
    for (var k = newKids.length; k < oldKids.length; k++) o.removeChild(oldKids[k]);
  }

  /** 卡片更新完之後：聊天捲到最新、帶回打到一半的字、規則下拉選單的焦點 */
  function afterOverlayRender(card, stick) {
    var list = card.querySelector('#chat-list');
    if (list && stick) list.scrollTop = list.scrollHeight;
    var ci = card.querySelector('#chat-input');
    if (ci && !ci.value && app.chatDraft && D.activeElement !== ci) ci.value = app.chatDraft;
    var f = app.ruleFocus;
    app.ruleFocus = null;
    if (f) {
      var el = f.target === 'opt'
        ? (card.querySelector('.ruledd-opt.on[data-field="' + f.field + '"]') || card.querySelector('.ruledd-opt[data-field="' + f.field + '"]'))
        : card.querySelector('.ruledd-btn[data-field="' + f.field + '"]');
      if (el) el.focus();
    }
  }

  /* 每人輪數／每題秒數／題目難度都用按鈕，不用滑桿：
     這張面板每次收到房間投影就會重畫，滑桿拖到一半會被打斷，按鈕不會。 */
  var ROUND_CHOICES = [1, 2, 3, 4, 5];
  var SEC_CHOICES = [60, 90, 120];
  var DIFF_CHOICES = [
    { v: 0, get label() { return globalThis.I18N ? globalThis.I18N.t("text.119") : "混合"; } }, { v: 1, get label() { return globalThis.I18N ? globalThis.I18N.t("text.140") : "簡單"; } },
    { v: 2, get label() { return globalThis.I18N ? globalThis.I18N.t("text.139") : "普通"; } }, { v: 3, get label() { return globalThis.I18N ? globalThis.I18N.t("text.138") : "困難"; } }
  ];
  function chips(act, list, current) {
    return '<div class="chiprow">' + list.map(function (o) {
      var val = (o.v !== undefined ? o.v : o);
      var label = (o.label !== undefined ? o.label : o);
      return '<button type="button" class="pillbtn" role="radio" data-act="' + act + '" data-v="' + esc(val) + '"' +
        ' aria-checked="' + (String(val) === String(current) ? 'true' : 'false') + '">' + esc(label) + '</button>';
    }).join('') + '</div>';
  }

  /* 房間設定卡片裡的「遊戲規則」用下拉選單，三個欄位排在同一行（不是三行堆疊），
     卡片矮下來，等待畫面才擠得出空間放聊天室；一顆按鈕不管螢幕多窄都不會換行，
     不像一排五顆按鈕在手機上會被迫斷成兩行。
     刻意不用原生 <select>：原生選單的清單樣式交給瀏覽器／作業系統畫，跟卡通風的
     圓角、陰影、配色完全不搭（尤其桌機瀏覽器那種灰底方框）。這裡自己刻一顆按鈕
     （顯示目前值）＋按下展開的清單，全部用卡片本身的樣式畫，跟其他按鈕一致。
     開合狀態記在 app.ruleMenuOpen（哪個欄位在展開，同時只會開一個），
     這樣重畫時（收到房間投影）還是知道要不要保持展開，不會每次投影一來就自動關掉。
     點外面或按 Escape 會關閉，見 setupRuleMenuClose()。 */
  function ruleDropdown(field, list, current) {
    var cur = list.filter(function (o) { return String(o.v !== undefined ? o.v : o) === String(current); })[0];
    /* list 有兩種形狀：純數字（ROUND_CHOICES／SEC_CHOICES）或 {v,label}（DIFF_CHOICES），
       所以「目前顯示的字」跟下面 opts 那份 val/label 用同一個 fallback 邏輯：
       沒有 .label 就退回 .v，兩個都沒有（純數字的情況）才退回 cur 本身。 */
    var curLabel = current;
    if (cur !== undefined) curLabel = (cur.label !== undefined ? cur.label : (cur.v !== undefined ? cur.v : cur));
    var open = app.ruleMenuOpen === field;
    var opts = list.map(function (o) {
      var val = (o.v !== undefined ? o.v : o);
      var label = (o.label !== undefined ? o.label : o);
      var on = String(val) === String(current);
      return '<button type="button" class="ruledd-opt' + (on ? ' on' : '') + '" role="option" aria-selected="' +
        (on ? 'true' : 'false') + '" data-act="rule-opt" data-field="' + esc(field) + '" data-v="' + esc(val) + '">' +
        esc(label) + (on ? '<span class="ruledd-check" aria-hidden="true">✓</span>' : '') + '</button>';
    }).join('');
    return '<div class="ruledd' + (open ? ' open' : '') + '">' +
      '<button type="button" class="ruledd-btn" data-act="rule-toggle" data-field="' + esc(field) + '" ' +
      'aria-haspopup="listbox" aria-expanded="' + (open ? 'true' : 'false') + '">' +
      '<span class="ruledd-val">' + esc(curLabel) + '</span>' +
      '<span class="ruledd-arrow" aria-hidden="true"></span></button>' +
      (open ? '<div class="ruledd-list" role="listbox">' + opts + '</div>' : '') +
      '</div>';
  }

  function renderRoomCreateOptions() {
    var c = app.roomCreate;
    $('lobby-room-name').value = c.roomName;
    $('room-create-rounds').innerHTML = chips('create-rounds', ROUND_CHOICES, c.rounds);
    $('room-create-drawsec').innerHTML = chips('create-drawsec', SEC_CHOICES, c.drawSec);
    $('room-create-diff').innerHTML = chips('create-diff', DIFF_CHOICES, c.diff);
  }

  function setupRoomCreate() {
    roomCreateModal = makeModal('room-create-modal', 'room-create-panel', 'b-lobby-host');
    $('room-create-close').addEventListener('click', function () { roomCreateModal.close(); });
    $('room-create-cancel').addEventListener('click', function () { roomCreateModal.close(); });
    var back = D.querySelector('[data-room-create-close]');
    if (back) back.addEventListener('click', function () { roomCreateModal.close(); });

    ['room-create-rounds', 'room-create-drawsec', 'room-create-diff'].forEach(function (id) {
      $(id).addEventListener('click', function (ev) {
        var button = ev.target.closest('button[data-act]');
        if (!button) return;
        var action = button.getAttribute('data-act');
        var value = button.getAttribute('data-v');
        if (action === 'create-rounds') app.roomCreate.rounds = Number(value);
        else if (action === 'create-drawsec') app.roomCreate.drawSec = Number(value);
        else if (action === 'create-diff') app.roomCreate.diff = Number(value);
        renderRoomCreateOptions();
        Sound.play('click');
      });
    });

    $('lobby-room-name').addEventListener('input', function () {
      app.roomCreate.roomName = this.value.slice(0, 16);
    });
    $('room-create-submit').addEventListener('click', createRoomFromSettings);
  }

  function openRoomCreate() {
    app.roomCreate = {
      roomName: (Store.nick() || (globalThis.I18N ? globalThis.I18N.t("text.137") : "大家")) + (globalThis.I18N ? globalThis.I18N.t("text.136") : " 的房間"),
      rounds: 2,
      drawSec: 90,
      diff: 0
    };
    renderRoomCreateOptions();
    roomCreateModal.open();
  }

  function createRoomFromSettings() {
    var c = app.roomCreate;
    var roomName = $('lobby-room-name').value.trim().slice(0, 16) || (globalThis.I18N ? globalThis.I18N.t("text.135") : "畫畫小房間");
    c.roomName = roomName;
    saveNick($('lobby-nick'));
    $('room-create-submit').disabled = true;
    w.Online.send('room:create', {
      name: Store.ensureNick(),
      roomName: roomName,
      settings: { wordLang: w.I18N.lang, rounds: c.rounds, drawSec: c.drawSec, diff: c.diff }
    }, function (res) {
      $('room-create-submit').disabled = false;
      if (!res || !res.ok) return toast((res && w.I18N.message(res.error, res.params)) || (globalThis.I18N ? globalThis.I18N.t("text.134") : "開房失敗。"), 'error');
      roomCreateModal.close();
      enterOnlineRoom(res.code);
    });
  }

  /** 房間設定：房主在這裡調規則、產生邀請連結；線上房間只有真人，沒有電腦對手 */
  /** 聊天室區塊（等待畫面、結算畫面共用）。輸入框刻意不帶 value：它的內容交給使用者，
      卡片就地更新時不會去動它（打到一半的字另外存在 app.chatDraft）。 */
  function chatBlockHtml(v) {
    if (!v.you || !v.you.can.chat) return '';
    var chatMsgs = (v.room.chat || []).map(function (c) {
      var mine = c.fromId === v.you.id;
      return '<li class="chatmsg' + (mine ? ' mine' : '') + '">' +
        '<b class="chatfrom">' + esc(c.from) + '</b>' +
        '<span class="chattext">' + esc(c.text) + '</span></li>';
    }).join('');
    return (globalThis.I18N ? globalThis.I18N.t("text.133") : "<div class=\"setupblock chatblock\"><h4>聊天室</h4>") +
      '<ol class="chatlist" id="chat-list">' +
      (chatMsgs || '<li class="chatempty">' + (v.room.phase === 'finished' ? (globalThis.I18N ? globalThis.I18N.t("text.132") : "聊聊剛剛那一局吧！") : (globalThis.I18N ? globalThis.I18N.t("text.131") : "開始之前先聊聊吧！")) + '</li>') + '</ol>' +
      (globalThis.I18N ? globalThis.I18N.t("text.130") : "<div class=\"chatrow\"><label class=\"sr-only\" for=\"chat-input\">聊天訊息</label>") +
      (globalThis.I18N ? globalThis.I18N.t("text.129") : "<input id=\"chat-input\" maxlength=\"200\" autocomplete=\"off\" enterkeyhint=\"send\" placeholder=\"說點什麼…\">") +
      (globalThis.I18N ? globalThis.I18N.t("text.128") : "<button type=\"button\" class=\"btn3d small\" data-color=\"sky\" data-act=\"chat-send\">送出</button></div></div>");
  }

  function roomSetupHtml(v) {
    var r = v.room;
    var seats = '';
    for (var i = 0; i < r.members.length; i++) {
      var m = r.members[i];
      if (m.role !== 'player') continue;
      seats += '<div class="seatrow' + (m.ready ? ' ready' : '') + '">' +
        '<span class="sface" aria-hidden="true">' + S.face(i, m.ready ? 'happy' : 'idle') + '</span>' +
        '<span class="seatname">' + esc(m.name) + (m.host ? (globalThis.I18N ? globalThis.I18N.t("text.127") : "（房主）") : '') + (m.ready ? ' ✓' : '') + '</span></div>';
    }
    var specs = r.members.filter(function (x) { return x.role === 'spectator'; });
    var host = v.you.can.setSettings;

    /* ---- 遊戲規則 ---- */
    var rules;
    if (host) {
      rules = (globalThis.I18N ? globalThis.I18N.t("text.123") : "<div class=\"setupblock\"><h4>遊戲規則</h4>") +
        '<div class="rules-row">' +
        (globalThis.I18N ? globalThis.I18N.t("text.126") : "<div class=\"rule-field\"><span>畫幾次</span>") + ruleDropdown('set-rounds', ROUND_CHOICES, r.settings.rounds) + '</div>' +
        (globalThis.I18N ? globalThis.I18N.t("text.125") : "<div class=\"rule-field\"><span>秒數</span>") + ruleDropdown('set-drawsec', SEC_CHOICES, r.settings.drawSec) + '</div>' +
        (globalThis.I18N ? globalThis.I18N.t("text.124") : "<div class=\"rule-field\"><span>題型</span>") + ruleDropdown('set-diff', DIFF_CHOICES, r.settings.diff) + '</div>' +
        '</div></div>';
    } else {
      var dl = DIFF_CHOICES.filter(function (d) { return d.v === r.settings.diff; })[0];
      rules = (globalThis.I18N ? globalThis.I18N.t("text.123") : "<div class=\"setupblock\"><h4>遊戲規則</h4>") +
        (globalThis.I18N ? globalThis.I18N.t("text.122") : "<p class=\"setupnote\">每人畫 ") + r.settings.rounds + (globalThis.I18N ? globalThis.I18N.t("text.121") : " 次・每題 ") + r.settings.drawSec + (globalThis.I18N ? globalThis.I18N.t("text.120") : " 秒・") +
        esc(dl ? dl.label : (globalThis.I18N ? globalThis.I18N.t("text.119") : "混合")) + (globalThis.I18N ? globalThis.I18N.t("text.118") : "難度（由房主決定）</p></div>");
    }

    /* ---- 邀請連結 ----
       以前這裡讓房主先選好對方的身分（一定是玩家／一定是觀戰），但那是房主在幫對方做決定。
       身分應該讓被邀請的人自己選，所以連結本身不綁身分（一律是 'any'），對方點連結後
       在大廳落地頁自己按「加入當玩家」或「加入觀戰」（見 checkPendingInvite／setupLobby）。 */
    /* 網址欄跟三顆按鈕排在同一行（以前網址一行、按鈕一行、說明兩行），說明也縮成一行，
       這一區矮下來。 */
    var invite = '';
    if (v.you.can.invite) {
      invite = (globalThis.I18N ? globalThis.I18N.t("text.117") : "<div class=\"setupblock\"><h4>邀請朋友</h4>") +
        (globalThis.I18N ? globalThis.I18N.t("text.116") : "<div class=\"inviterow\"><label class=\"sr-only\" for=\"invite-url\">邀請連結</label>") +
        (globalThis.I18N ? globalThis.I18N.t("text.115") : "<input id=\"invite-url\" readonly placeholder=\"按「產生連結」\" value=\"") + esc(app.inviteUrl) + '">' +
        (globalThis.I18N ? globalThis.I18N.t("text.114") : "<button type=\"button\" class=\"pillbtn\" data-act=\"invite-new\">產生連結</button>") +
        '<button type="button" class="pillbtn" data-act="invite-copy"' + (app.inviteUrl ? '' : ' disabled') + (globalThis.I18N ? globalThis.I18N.t("text.113") : ">複製</button>") +
        '<button type="button" class="pillbtn" data-act="invite-revoke"' + (app.inviteToken ? '' : ' disabled') + (globalThis.I18N ? globalThis.I18N.t("text.112") : ">撤銷</button>") +
        '</div>' +
        (globalThis.I18N ? globalThis.I18N.t("text.111") : "<p class=\"setupnote\">60 分鐘內有效・最多 20 人次・對方自己選身分</p></div>");
    }

    /* ---- 聊天室 ----
       刻意放在「邀請朋友」下面：只在等待畫面（跟結算畫面）才有，開始對局後 v.you.can.chat 就是 false，
       聊天室也就跟著收起來。 */
    var chatHtml = chatBlockHtml(v);

    /* ---- 主要按鈕 ----
       每個人只有一顆主要按鈕：房主是「開始！」（房主不用另外按準備，按開始就代表他準備好了，
       伺服器 canStart 也不等房主）、其他玩家是「準備好了」、觀戰者是「下場一起玩」。
       「改成觀戰」「離開房間」是次要動作，縮小一號（.sub）排在後面，手機上才排得進一行。 */
    var btns = '';
    if (v.you.isHost) {
      btns += '<button class="btn3d" data-color="grape" data-act="start"' +
        (v.you.can.start ? '' : ' disabled') + (globalThis.I18N ? globalThis.I18N.t("text.110") : ">開始！</button>");
    } else if (v.you.role === 'player') {
      btns += '<button class="btn3d" data-color="' + (v.you.ready ? 'lemon' : 'mint') + '" data-act="ready">' +
        (v.you.ready ? (globalThis.I18N ? globalThis.I18N.t("text.109") : "取消準備") : (globalThis.I18N ? globalThis.I18N.t("text.108") : "準備好了 ✓")) + '</button>';
    }
    if (v.you.can.becomePlayer) btns += (globalThis.I18N ? globalThis.I18N.t("text.107") : "<button class=\"btn3d\" data-color=\"mint\" data-act=\"become-player\">下場一起玩</button>");
    if (v.you.can.becomeSpectator) btns += (globalThis.I18N ? globalThis.I18N.t("text.106") : "<button class=\"btn3d small sub\" data-color=\"cream\" data-act=\"become-spectator\">改成觀戰</button>");
    /* 進來之後要走得掉：房主退出會把房主交給下一位，最後一個人退出房間就關掉 */
    btns += '<button class="btn3d small sub" data-color="peach" data-act="leave-room">' +
      (v.you.isHost ? (globalThis.I18N ? globalThis.I18N.t("text.105") : "退出房間") : (globalThis.I18N ? globalThis.I18N.t("text.104") : "離開房間")) + '</button>';

    /* 房號跟「x / y 位玩家」以前各佔一行；席位卡本身就數得出人數，
       那行字拿掉、房號也縮小，卡片才有地方放下面新的聊天室。
       內容分成兩欄（.setup-col）：寬螢幕並排（左：房號、名單、規則；右：邀請、聊天室），
       一個畫面就看得完不用捲；窄螢幕兩欄上下接著排，跟以前一樣是一欄。 */
    return (globalThis.I18N ? globalThis.I18N.t("text.103") : "<h3>房間設定</h3>") +
      '<div class="setup-cols"><div class="setup-col">' +
      '<div class="roomcode"><b>' + esc(r.code) + (globalThis.I18N ? globalThis.I18N.t("text.102") : "</b><span>把房號唸給朋友，或用邀請連結</span></div>") +
      '<div class="seatlist">' + (seats || (globalThis.I18N ? globalThis.I18N.t("text.101") : "<div class=\"seatrow\">還沒有人入座</div>")) +
      (specs.length ? '<div class="seatrow spec">👀 ' + specs.length + (globalThis.I18N ? globalThis.I18N.t("text.100") : " 位觀戰</div>") : '') + '</div>' +
      rules + '</div><div class="setup-col">' + invite + chatHtml + '</div></div>' +
      (v.you.can.start ? '' : '<p class="setup-blocked">' + esc(v.you.can.startBlockedBy || (globalThis.I18N ? globalThis.I18N.t("text.099") : "等房主按開始。")) + '</p>') +
      '<div class="overlay-btns">' + btns + '</div>';
  }

  function pickingHtml(v, g) {
    if (g.you.canPick && g.choices.length) {
      var cards = g.choices.map(function (c) {
        return '<button class="wordchoice" data-act="pick" data-word="' + esc(c.id) + '">' +
          '<b>' + esc(c.text) + '</b><span class="s">' + esc(c.catLabel) + '・' + esc(c.diffLabel) + '</span></button>';
      }).join('');
      return (globalThis.I18N ? globalThis.I18N.t("text.098") : "<h3>挑一個來畫</h3>") + (g.unlimited
        ? (globalThis.I18N ? globalThis.I18N.t("text.097") : "<p>不限時間，慢慢挑。</p>")
        : '<p><b class="pick-secs">' + secsLeft(g.deadline) + (globalThis.I18N ? globalThis.I18N.t("text.096") : "</b> 秒內沒選的話，系統會幫你挑第一個。</p>")) +
        '<div class="wordchoices">' + cards + '</div>';
    }
    var drawer = drawerName(g);
    return '<h3>' + esc(drawer) + (globalThis.I18N ? globalThis.I18N.t("text.095") : " 正在挑題目</h3><p>準備好了嗎？等一下就要開始猜囉。</p>");
  }

  function drawerName(g) {
    for (var i = 0; i < g.players.length; i++) if (g.players[i].isDrawer) return g.players[i].name;
    return (globalThis.I18N ? globalThis.I18N.t("text.094") : "畫家");
  }

  function revealHtml(g) {
    var last = g.log.length ? g.log[g.log.length - 1] : null;
    var rows = '';
    if (last) {
      for (var i = 0; i < last.guessed.length; i++) {
        var gg = last.guessed[i];
        rows += '<li><span class="rface" aria-hidden="true">' + S.face(i, 'happy') + '</span>' +
          '<span class="rname">' + esc(gg.name) + '</span><span class="rpts">+' + gg.points + '</span></li>';
      }
      rows += '<li><span class="rface" aria-hidden="true">' + S.face(7, last.drawerPoints > 0 ? 'happy' : 'sad') + '</span>' +
        '<span class="rname">' + esc(last.drawerName) + (globalThis.I18N ? globalThis.I18N.t("text.093") : "（畫家）</span>") +
        '<span class="rpts">+' + last.drawerPoints + '</span></li>';
    }
    /* 單機練習只有自己：不用列「你（畫家）+0」這種比分，公布答案就好，
       想馬上畫下一題可以直接按「下一題」，不用等倒數。 */
    if (app.mode === 'solo') {
      return (globalThis.I18N ? globalThis.I18N.t("text.089") : "<h3>答案是</h3><div class=\"revealword\">") + esc(g.answer || (last ? last.word : '—')) + '</div>' +
        (globalThis.I18N ? globalThis.I18N.t("text.092") : "<div class=\"overlay-btns\"><button class=\"btn3d\" data-color=\"mint\" data-act=\"solo-next\">下一題</button></div>");
    }
    /* 單機自己練習沒有其他人猜題（total===0），不顯示「0 / 0 人猜中」；
       換下一位畫家的措辭在單機也怪（永遠是同一個你），改成「換下一題」。 */
    var subline = last ? (last.total > 0 ? (last.correct + ' / ' + last.total + (globalThis.I18N ? globalThis.I18N.t("text.091") : " 人猜中")) : (globalThis.I18N ? globalThis.I18N.t("text.090") : "練習完成")) : '';
    return (globalThis.I18N ? globalThis.I18N.t("text.089") : "<h3>答案是</h3><div class=\"revealword\">") + esc(g.answer || (last ? last.word : '—')) + '</div>' +
      '<p>' + subline + '</p>' +
      '<ul class="resultlist">' + (rows || (globalThis.I18N ? globalThis.I18N.t("text.088") : "<li><span class=\"rname\">這一題沒有人猜中</span></li>")) + '</ul>' +
      '<p>' + (app.mode === 'solo' ? (globalThis.I18N ? globalThis.I18N.t("text.087") : "馬上出下一題…") : (globalThis.I18N ? globalThis.I18N.t("text.086") : "馬上換下一位畫家…")) + '</p>';
  }

  function overHtml(v, g) {
    var sorted = g.players.slice().sort(function (a, b) { return b.score - a.score; });
    var rows = sorted.map(function (p, i) {
      var win = g.winners.indexOf(p.id) >= 0;
      return '<li class="' + (win ? 'win' : '') + '">' +
        '<span class="rface" aria-hidden="true">' + S.face(indexOfPlayer(g, p.id), win ? 'win' : 'sad') + '</span>' +
        '<span class="rname">' + (win ? '🏆 ' : (i + 1) + '. ') + esc(p.name) + '</span>' +
        '<span class="rpts">' + p.score + (globalThis.I18N ? globalThis.I18N.t("text.085") : " 分</span></li>");
    }).join('');
    /* 線上：結算完由房主按「回房間」，大家回到等待畫面（可以聊天、改規則、重新準備）再開一局；
       不再是全員投票直接開新局（有一個人掛機就全部卡住）。單機維持「再玩一局」。 */
    var btns = '';
    var note = '';
    if (app.mode === 'online') {
      if (v.you.can.returnToRoom) btns += (globalThis.I18N ? globalThis.I18N.t("text.084") : "<button class=\"btn3d\" data-color=\"mint\" data-act=\"return-room\">回房間</button>");
      else note = (globalThis.I18N ? globalThis.I18N.t("text.083") : "<p>等房主帶大家回房間，就能再開一局。</p>");
      btns += (globalThis.I18N ? globalThis.I18N.t("text.082") : "<button class=\"btn3d small sub\" data-color=\"cream\" data-act=\"lobby\">回大廳</button>");
    } else {
      if (v.you.can.rematch) btns += (globalThis.I18N ? globalThis.I18N.t("text.081") : "<button class=\"btn3d\" data-color=\"mint\" data-act=\"rematch\">再玩一局</button>");
      btns += (globalThis.I18N ? globalThis.I18N.t("text.080") : "<button class=\"btn3d small\" data-color=\"cream\" data-act=\"home\">回主選單</button>");
    }
    return '<div data-result-share>' + (globalThis.I18N ? globalThis.I18N.t("text.079") : "<h3>結算</h3><ul class=\"resultlist\">") + rows + '</ul>' + note + '</div>' +
      (app.mode === 'online' ? chatBlockHtml(v) : '') +
      '<div class="overlay-btns">' + btns + '</div>';
  }

  function indexOfPlayer(g, id) {
    for (var i = 0; i < g.players.length; i++) if (g.players[i].id === id) return i;
    return 0;
  }

  /* 卡片上的按鈕用「事件委派」：監聽器只在 init 掛一次在卡片本身，
     卡片內容就地更新（見 morphChildren）時不用重綁，也不會越綁越多。 */
  function setupOverlayEvents() {
    var card = $('overlay-card');
    card.addEventListener('click', function (ev) {
      var el = ev.target && ev.target.closest ? ev.target.closest('button[data-act]') : null;
      if (!el || !card.contains(el) || el.disabled) return;
      onOverlayAct(el);
    });
    card.addEventListener('input', function (ev) {
      if (ev.target && ev.target.id === 'chat-input') app.chatDraft = ev.target.value;
    });
    card.addEventListener('keydown', function (ev) {
      var t = ev.target;
      if (!t) return;
      if (t.id === 'chat-input' && ev.key === 'Enter') {
        /* 注音／拼音選字時按的 Enter 是「確定這個字」，不是送出 */
        if (ev.isComposing || ev.keyCode === 229) return;
        ev.preventDefault();
        sendChatMessage();
        return;
      }
      ruleMenuKey(ev);
    });
  }

  /** 規則下拉選單的鍵盤操作：↓ 打開、↑↓ 在選項間移動、Home／End 跳到頭尾（Esc 見 setupRuleMenuClose） */
  function ruleMenuKey(ev) {
    var t = ev.target;
    var field = t.getAttribute && t.getAttribute('data-field');
    if (!field) return;
    if (t.classList.contains('ruledd-btn') && (ev.key === 'ArrowDown' || ev.key === 'ArrowUp')) {
      ev.preventDefault();
      if (app.ruleMenuOpen !== field) {
        app.ruleMenuOpen = field;
        app.ruleFocus = { field: field, target: 'opt' };
        app.lastOverlayHtml = null;
        renderOverlay();
      }
      return;
    }
    if (!t.classList.contains('ruledd-opt')) return;
    var opts = Array.prototype.slice.call(t.parentNode.querySelectorAll('.ruledd-opt'));
    var i = opts.indexOf(t);
    var next = null;
    if (ev.key === 'ArrowDown') next = opts[Math.min(opts.length - 1, i + 1)];
    else if (ev.key === 'ArrowUp') next = opts[Math.max(0, i - 1)];
    else if (ev.key === 'Home') next = opts[0];
    else if (ev.key === 'End') next = opts[opts.length - 1];
    if (next) { ev.preventDefault(); next.focus(); }
  }

  function onOverlayAct(el) {
    var act = el.getAttribute('data-act');
    Sound.play('click');
    if (act === 'pick') {
      var wid = el.getAttribute('data-word');
      if (app.mode === 'solo') {
        var r = Rules.pickWord(app.solo.state, ME, wid, Date.now());
        if (!r.ok) return toast(r.error, 'error');
        app.paint.clearLocal();
        soloRefresh();
      } else w.Online.send('room:pick', { wordId: wid });
    } else if (act === 'invite-new') newInvite();
    else if (act === 'invite-copy') copyText(app.inviteUrl);
    else if (act === 'invite-revoke') revokeInvite();
    else if (act === 'ready') w.Online.send('room:ready', { ready: !app.view.you.ready });
    else if (act === 'start') w.Online.send('room:start', {});
    else if (act === 'become-player') w.Online.send('room:becomePlayer', {});
    else if (act === 'become-spectator') w.Online.send('room:becomeSpectator', {});
    else if (act === 'leave-room') askLeaveRoom();
    else if (act === 'settings') gameModal.open();
    else if (act === 'chat-send') sendChatMessage();
    else if (act === 'rematch') startSolo();
    else if (act === 'solo-next') {
      /* 公布答案的倒數直接歸零，下一次推進就換題 */
      if (app.mode === 'solo' && app.solo && app.solo.state.phase === 'reveal') { app.solo.state.deadline = Date.now(); soloStep(); }
    }
    else if (act === 'return-room') w.Online.send('room:return', {});
    else if (act === 'lobby') leaveGame('s-lobby');
    else if (act === 'home') leaveGame('s-home');
    else if (act === 'rule-toggle') {
      var field = el.getAttribute('data-field');
      var opening = app.ruleMenuOpen !== field;
      app.ruleMenuOpen = opening ? field : null;
      /* 打開時焦點移到目前選中的那一項（鍵盤可以直接上下選），收起來就留在按鈕上 */
      app.ruleFocus = { field: field, target: opening ? 'opt' : 'btn' };
      app.lastOverlayHtml = null;
      renderOverlay();
    } else if (act === 'rule-opt') {
      var optField = el.getAttribute('data-field');
      var optValue = Number(el.getAttribute('data-v'));
      var key = optField === 'set-rounds' ? 'rounds' : optField === 'set-drawsec' ? 'drawSec' : optField === 'set-diff' ? 'diff' : null;
      if (key) {
        var payload = {};
        payload[key] = optValue;
        w.Online.send('room:settings', payload);
      }
      app.ruleMenuOpen = null;
      /* 選完焦點回到這個欄位的按鈕（以前選項被拿掉，焦點就掉到整頁最上面） */
      app.ruleFocus = { field: optField, target: 'btn' };
      app.lastOverlayHtml = null;
      renderOverlay();
    }
  }

  /** 送出聊天室訊息；空白的不送，送出後立刻清空輸入框（不等伺服器回應） */
  function sendChatMessage() {
    var input = $('chat-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    app.chatDraft = '';
    w.Online.send('room:chat', { text: text });
  }

  /* ------------------------------------------------ 工具列／猜題列切換 */

  function renderControls() {
    var v = app.view, g = v.game;
    var canDraw = !!(g && v.you.can.draw);
    var canGuess = !!(g && v.you.can.guess);
    var spectator = v.you.role === 'spectator';

    /* 畫家（含選題階段）不需要猜題框，觀戰者也沒有 */
    var isDrawer = !!(g && g.you.isDrawer);
    $('toolbar').hidden = !canDraw;
    $('solo-file-actions').hidden = app.mode !== 'solo' || !canDraw;
    /* 沒有工具列的人（猜題者、觀戰者、還在選題的畫家）：橫向時右側那一欄收掉，
       畫布回到正中間，不然右邊會空著一整欄、畫布偏左。舞台有 ResizeObserver，畫布會自己重算。 */
    /* 單機永遠是自己在畫，選題那幾秒工具列暫時收著也不要收掉右欄：
       右欄上面還放著返回鈕跟題目，收掉的話返回鈕會被擠出畫面、畫布也會跳一下 */
    D.body.classList.toggle('no-tools', !canDraw && app.mode !== 'solo');
    $('guessbar').hidden = canDraw || isDrawer || spectator || !g ||
      g.phase === 'over' || (v.room && v.room.closed);

    if (app.paint) app.paint.setEnabled(canDraw);

    if (canDraw) {
      syncToolbar();
      if (!$('tool-hint').textContent) toolHint(TOOL_TIP[app.paint.getTool()]);
    }
    renderHintRow(g, canDraw);
    syncDoneButtons();
    syncGuessbarSpace();

    var input = $('guess-input');
    if (!$('guessbar').hidden) {
      var guessed = g && g.you.guessed;
      input.disabled = !canGuess;
      $('b-guess').disabled = !canGuess;
      input.placeholder = guessed ? (globalThis.I18N ? globalThis.I18N.t("text.078") : "你已經猜對了，等其他人…")
        : (g && g.phase === 'drawing' ? (globalThis.I18N ? globalThis.I18N.t("text.077") : "猜猜看這是什麼？") : (globalThis.I18N ? globalThis.I18N.t("text.076") : "等畫家開始畫…"));
    }
  }

  /** 猜題列是固定在遊戲主畫面正下方的浮層，把它的高度讓回給畫布（不然會蓋到） */
  function syncGuessbarSpace() {
    var bar = $('guessbar');
    var on = !bar.hidden;
    document.body.classList.toggle('has-guessbar', on);
    var h = on ? Math.ceil(bar.getBoundingClientRect().height) + 12 : 0;
    document.documentElement.style.setProperty('--guessbar-h', h + 'px');
  }

  /** 畫家的三個提示按鈕：已給的標起來、下一張可以按、單字題沒有第三張 */
  function renderHintRow(g, canDraw) {
    var row = $('hintrow');
    row.hidden = !canDraw;
    if (!canDraw || !g || !g.hint) return;
    var steps = g.hint.steps || [];
    for (var i = 0; i < 3; i++) {
      var b = $('b-hint-' + (i + 1));
      var st = steps[i] || { done: false, available: false, exists: false };
      b.disabled = !st.available;
      b.classList.toggle('done', !!st.done);
      b.hidden = !st.exists;
      b.setAttribute('aria-pressed', String(!!st.done));
    }
    $('hintrow-note').textContent = g.hint.step >= g.hint.total
      ? (g.hint.total < 3 ? (globalThis.I18N ? globalThis.I18N.t("text.075") : "單字題沒有「一個字」這張提示。") : (globalThis.I18N ? globalThis.I18N.t("text.074") : "提示都給完了。"))
      : (globalThis.I18N ? globalThis.I18N.t("text.073") : "按下去就公開給所有人，收不回來。");
  }

  /* ------------------------------------------------------ 左側摘要 */

  function renderAside() {
    var v = app.view, g = v.game;
    var youRole = v.you.role === 'spectator' ? (globalThis.I18N ? globalThis.I18N.t("text.036") : "觀戰者")
      : (g && g.you.isDrawer ? (globalThis.I18N ? globalThis.I18N.t("text.035") : "這一題的畫家") : (globalThis.I18N ? globalThis.I18N.t("text.072") : "猜題者"));

    $('sum-phase').textContent = (v.room && v.room.closed) ? (globalThis.I18N ? globalThis.I18N.t("text.071") : "房間已結束")
      : (v.room && v.room.phase === 'waiting' ? (globalThis.I18N ? globalThis.I18N.t("text.070") : "等待開始")
        : (g ? (PHASE_LABEL[g.phase] || g.phase) : '—'));
    $('sum-drawer').textContent = g ? drawerName(g) : '—';
    $('sum-role').textContent = youRole;
    $('sum-can').textContent = canDoText(v, g);
    $('sum-hint').textContent = g && g.hint
      ? ((g.you.isDrawer || g.answer)
        ? (g.answer || '') + (g.hint.catLabel ? '（' + g.hint.catLabel + '）' : '')
        : (g.hint.lenShown ? g.hint.mask : (globalThis.I18N ? globalThis.I18N.t("text.069") : "畫家還沒給提示")) +
          (g.hint.catLabel ? '（' + g.hint.catLabel + '）' : ''))
      : '—';
    $('sum-conn').textContent = app.mode === 'solo' ? (globalThis.I18N ? globalThis.I18N.t("text.068") : "單機（不需要連線）")
      : ({ get connected() { return globalThis.I18N ? globalThis.I18N.t("text.067") : "已連線"; }, get connecting() { return globalThis.I18N ? globalThis.I18N.t("text.066") : "重新連線中…"; }, get loading() { return globalThis.I18N ? globalThis.I18N.t("text.065") : "載入中…"; }, get error() { return globalThis.I18N ? globalThis.I18N.t("text.064") : "連線錯誤"; }, get offline() { return globalThis.I18N ? globalThis.I18N.t("text.063") : "無伺服器"; }, get idle() { return globalThis.I18N ? globalThis.I18N.t("text.062") : "未連線"; } }[app.conn.status] || app.conn.status);

    /* 比分 */
    var sl = $('scorelist');
    if (g) {
      var sorted = g.players.slice().sort(function (a, b) { return b.score - a.score; });
      sl.innerHTML = sorted.map(function (p) {
        var cls = ['', p.isDrawer ? 'drawer' : '', p.id === v.you.id ? 'me' : ''].join(' ').trim();
        return '<li class="' + cls + '"><span class="sface" aria-hidden="true">' +
          S.face(indexOfPlayer(g, p.id), moodOf(p, g)) + '</span>' +
          '<span class="sname">' + esc(p.name) + (p.ai ? (globalThis.I18N ? globalThis.I18N.t("text.061") : "（電腦）") : '') + '</span>' +
          '<span class="spts">' + p.score + '</span></li>';
      }).join('');
    } else sl.innerHTML = '';

    /* 猜題紀錄：系統事件 + 每一則猜題 */
    renderRecent();
  }

  function canDoText(v, g) {
    if (v.room && v.room.closed) return (globalThis.I18N ? globalThis.I18N.t("text.060") : "房間已結束，回大廳再開一間吧。");
    if (v.room && v.room.phase === 'waiting') {
      if (v.you.role === 'spectator') return (globalThis.I18N ? globalThis.I18N.t("text.059") : "等這一局開始，你會以觀戰身分看畫。");
      if (v.you.isHost) return (globalThis.I18N ? globalThis.I18N.t("text.058") : "其他人都按「準備好了」之後，按「開始！」就能開局。");
      return v.you.ready ? (globalThis.I18N ? globalThis.I18N.t("text.057") : "已準備，等房主按開始。") : (globalThis.I18N ? globalThis.I18N.t("text.056") : "按「準備好了」讓房主可以開始。");
    }
    if (!g) return '—';
    if (v.you.role === 'spectator') return (globalThis.I18N ? globalThis.I18N.t("text.055") : "觀戰中：可以看畫與猜題紀錄，不能畫也不能猜。");
    if (g.phase === 'picking') return g.you.canPick ? (globalThis.I18N ? globalThis.I18N.t("text.054") : "從三個題目裡挑一個。") : (globalThis.I18N ? globalThis.I18N.t("text.053") : "等畫家挑題目。");
    if (g.phase === 'drawing') {
      if (g.you.isDrawer) return (globalThis.I18N ? globalThis.I18N.t("text.052") : "用工具列把題目畫出來；畫好了按「畫完了」告訴大家（這一題不會因此結束）。");
      if (g.you.guessed) return (globalThis.I18N ? globalThis.I18N.t("text.051") : "你已經猜中了，等其他人或時間結束。");
      return (globalThis.I18N ? globalThis.I18N.t("text.050") : "把答案打進下面的猜題框，猜錯不扣分。");
    }
    if (g.phase === 'reveal') return (globalThis.I18N ? globalThis.I18N.t("text.049") : "看一下答案，馬上換下一位畫家。");
    return app.mode === 'online' ? (globalThis.I18N ? globalThis.I18N.t("text.048") : "這一局結束了，房主可以帶大家回房間再開一局。") : (globalThis.I18N ? globalThis.I18N.t("text.047") : "這一局結束了，可以再玩一局或離開。");
  }

  /* ================================================================
     對局設定彈窗
     ================================================================ */

  function setupGameSettings() {
    gameModal = makeModal('game-settings-modal', 'game-settings-panel', 'b-game-settings');
    $('b-game-settings').addEventListener('click', function () { Sound.play('click'); gameModal.open(); renderGameSettings(); });
    $('game-settings-close').addEventListener('click', function () { gameModal.close(); });
    $('game-settings-done').addEventListener('click', function () { gameModal.close(); });
    var back = D.querySelector('[data-game-settings-close]');
    if (back) back.addEventListener('click', function () { gameModal.close(); });

    $('gs-skip').addEventListener('click', function () { doSkip(); gameModal.close(); });
    $('gs-quit').addEventListener('click', function () {
      gameModal.close();
      askLeaveGame();
    });
  }

  function newInvite() {
    if (app.mode !== 'online' || !app.roomCode) return toast((globalThis.I18N ? globalThis.I18N.t("text.046") : "目前不在可邀請的房間裡。"), 'error');
    /* 不指定 role：伺服器端 createInvite 沒收到合法值就會當成 'any'，
       由拿到連結的人自己選要當玩家還是觀戰（見 checkPendingInvite／setupLobby）。 */
    w.Online.send('room:invite', {
      ttlMinutes: 60,
      maxUses: 20
    }, function (res) {
      if (!res || !res.ok) return toast((res && w.I18N.message(res.error, res.params)) || (globalThis.I18N ? globalThis.I18N.t("text.045") : "邀請連結產生失敗。"), 'error');
      app.inviteToken = res.token;
      app.inviteUrl = Cfg.inviteUrl(app.roomCode, res.token);
      app.lastOverlayHtml = null;
      renderOverlay();
      toast((globalThis.I18N ? globalThis.I18N.t("text.044") : "邀請連結好了，按「複製」傳給朋友。"), 'ok');
    });
  }

  function revokeInvite() {
    if (!app.inviteToken) return;
    w.Online.send('room:revokeInvite', { token: app.inviteToken }, function (res) {
      if (res && res.ok === false) return toast(res.error || (globalThis.I18N ? globalThis.I18N.t("text.043") : "撤銷失敗。"), 'error');
      app.inviteToken = null;
      app.inviteUrl = '';
      app.lastOverlayHtml = null;
      renderOverlay();
      toast((globalThis.I18N ? globalThis.I18N.t("text.042") : "邀請連結已撤銷。"), 'ok');
    });
  }

  function copyText(text) {
    if (!text) return toast((globalThis.I18N ? globalThis.I18N.t("text.041") : "先按「產生連結」。"), 'error');
    var done = function () { toast((globalThis.I18N ? globalThis.I18N.t("text.040") : "已複製到剪貼簿。"), 'ok'); };
    if (w.navigator && w.navigator.clipboard && w.navigator.clipboard.writeText) {
      w.navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
    } else fallback();
    function fallback() {
      var el = $('invite-url');
      if (!el) return toast((globalThis.I18N ? globalThis.I18N.t("text.039") : "複製失敗，請手動選取連結。"), 'error');
      el.removeAttribute('readonly');
      el.select();
      try { D.execCommand('copy'); done(); } catch (e) { toast((globalThis.I18N ? globalThis.I18N.t("text.038") : "複製失敗，請手動選取。"), 'error'); }
      el.setAttribute('readonly', 'readonly');
    }
  }

  function renderGameSettings() {
    var v = app.view;
    var online = app.mode === 'online' && v && v.room;

    $('gs-code').textContent = online ? v.room.code : (globalThis.I18N ? globalThis.I18N.t("text.037") : "單機");
    $('gs-role').textContent = !v ? '—'
      : (v.you.role === 'spectator' ? (globalThis.I18N ? globalThis.I18N.t("text.036") : "觀戰者") : (v.game && v.game.you.isDrawer ? (globalThis.I18N ? globalThis.I18N.t("text.035") : "這一題的畫家") : (globalThis.I18N ? globalThis.I18N.t("text.034") : "玩家")));
    $('gs-role-note').textContent = !v ? '—'
      : (v.you.role === 'spectator' ? (globalThis.I18N ? globalThis.I18N.t("text.033") : "可以看畫與猜題紀錄，不能畫也不能猜")
        : (globalThis.I18N ? globalThis.I18N.t("text.032") : "可以畫、可以猜") + (v.you.isHost ? (globalThis.I18N ? globalThis.I18N.t("text.031") : "，而且是房主") : ''));

    var rb = $('gs-role-btns');
    rb.innerHTML = '';
    if (online && v.you.can.becomePlayer) rb.innerHTML = (globalThis.I18N ? globalThis.I18N.t("text.030") : "<button class=\"btn3d small\" data-color=\"mint\" id=\"gs-become-player\">下場一起玩</button>");
    else if (online && v.you.can.becomeSpectator) rb.innerHTML = (globalThis.I18N ? globalThis.I18N.t("text.029") : "<button class=\"btn3d small\" data-color=\"cream\" id=\"gs-become-spectator\">改成觀戰</button>");
    S.decorateAll(rb);
    if ($('gs-become-player')) $('gs-become-player').addEventListener('click', function () { w.Online.send('room:becomePlayer', {}); gameModal.close(); });
    if ($('gs-become-spectator')) $('gs-become-spectator').addEventListener('click', function () { w.Online.send('room:becomeSpectator', {}); gameModal.close(); });

    var canSkip = v && v.you && v.you.can.skip;
    $('gs-skip').disabled = !canSkip;
    $('gs-note').textContent = canSkip
      ? (globalThis.I18N ? globalThis.I18N.t("text.028") : "跳過會直接結束這一題，公布答案，沒有人得分。")
      : (v && v.game ? (globalThis.I18N ? globalThis.I18N.t("text.027") : "只有輪到你當畫家時才能跳過。") : (globalThis.I18N ? globalThis.I18N.t("text.026") : "目前沒有進行中的對局。"));
  }

  /* ================================================================
     大廳與線上
     ================================================================ */

  /** 從輸入框收暱稱：清空就重新配一個可愛名字，兩個輸入框一起同步。
      沒有名字的人在猜題紀錄與席位卡上會全部都叫「玩家」，分不出誰是誰。 */
  function saveNick(el) {
    Store.nick(String(el.value || '').trim().slice(0, 12));
    var n = Store.ensureNick();
    el.value = n;
    var other = el.id === 'lobby-nick' ? $('settings-nick') : $('lobby-nick');
    if (other) other.value = n;
    return n;
  }

  function setupLobby() {
    $('lobby-nick').addEventListener('change', function () { saveNick(this); });
    $('b-lobby-host').addEventListener('click', function () {
      saveNick($('lobby-nick'));
      Sound.play('click');
      openRoomCreate();
    });
    $('b-lobby-join').addEventListener('click', function () {
      var code = $('lobby-code').value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
      if (code.length !== 4) return toast((globalThis.I18N ? globalThis.I18N.t("text.025") : "房號是 4 個英數字。"), 'error');
      joinRoom(code, null, 'player');
    });
    /* 房號打完直接按 Enter 就加入 */
    $('lobby-code').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); $('b-lobby-join').click(); }
    });
    $('b-lobby-refresh').addEventListener('click', function () { w.Online.send('lobby:subscribe', {}); });
    $('b-lobby-retry').addEventListener('click', connectOnline);
    /* 邀請連結不綁身分：對方自己按「加入當玩家」或「加入觀戰」，見 checkPendingInvite。 */
    $('b-lobby-invite-player').addEventListener('click', function () {
      if (!app.pendingInvite) return;
      saveNick($('lobby-nick'));
      joinRoom(app.pendingInvite.code, app.pendingInvite.token, 'player');
    });
    $('b-lobby-invite-spectator').addEventListener('click', function () {
      if (!app.pendingInvite) return;
      saveNick($('lobby-nick'));
      joinRoom(app.pendingInvite.code, app.pendingInvite.token, 'spectator');
    });
    $('b-lobby-invite-cancel').addEventListener('click', function () {
      app.pendingInvite = null;
      clearInviteParams();
      $('lobby-invite').hidden = true;
    });
  }

  /**
   * @param {object} [opts]
   *   rejoin  斷線重連：已經在這間房的畫面上，成功就只要求重新同步，不要把邀請連結、聊天草稿清掉；
   *           失敗（房間關了、座位被收回）就直接顯示「房間已經結束」，不要停在凍住的舊畫面
   *   resume  重新整理頁面後自動回到原本的房間：失敗就留在大廳並說明原因
   */
  function joinRoom(code, token, role, opts) {
    opts = opts || {};
    w.Online.send('room:join', { code: code, token: token, role: role, name: Store.ensureNick() }, function (res) {
      if (!res || !res.ok) {
        var why = (res && w.I18N.message(res.error, res.params)) || (globalThis.I18N ? globalThis.I18N.t("text.024") : "加入失敗。");
        if (opts.rejoin && app.mode === 'online' && app.view) {
          forgetRoom();
          app.view.room.closed = true;
          app.view.room.closedReason = (globalThis.I18N ? globalThis.I18N.t("text.023") : "回不到原本的房間了：") + why;
          app.lastOverlayHtml = null;
          render();
          return;
        }
        if (opts.resume) { forgetRoom(); return toast((globalThis.I18N ? globalThis.I18N.t("text.022") : "原本的房間回不去了：") + why, 'error'); }
        return toast(why, 'error');
      }
      if (res.downgraded) toast((globalThis.I18N ? globalThis.I18N.t("text.021") : "位子滿了（或對局進行中），你先以觀戰身分進來。"), 'info');
      app.pendingInvite = null;
      $('lobby-invite').hidden = true;
      if (token) clearInviteParams();
      if (opts.rejoin && app.mode === 'online' && app.roomCode === res.code) {
        w.Online.send('room:resync', {});
        return;
      }
      enterOnlineRoom(res.code);
    });
  }

  /* 重新整理頁面後自動回到房間：房號只記在這個分頁（sessionStorage），按「離開房間」就忘掉 */
  function rememberRoom(code) { try { w.sessionStorage.setItem('dg_room', code); } catch (e) { /* 存不了就算了 */ } }
  function forgetRoom() { try { w.sessionStorage.removeItem('dg_room'); } catch (e) { /* 同上 */ } }
  function savedRoom() { try { return w.sessionStorage.getItem('dg_room') || null; } catch (e) { return null; } }

  /* 邀請連結用過（或確定不能用）之後，把網址上的 ?room=&invite= 拿掉：
     不然離開房間回到大廳時又會跳出同一張「收到房間邀請」 */
  function clearInviteParams() {
    try {
      var u = new URL(w.location.href);
      if (!u.searchParams.has('invite') && !u.searchParams.has('room')) return;
      u.searchParams.delete('invite');
      u.searchParams.delete('room');
      w.history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
    } catch (e) { /* 舊瀏覽器就維持原樣 */ }
  }

  function enterOnlineRoom(code) {
    app.mode = 'online';
    app.roomCode = code;
    app.view = null;
    app.feed = [];
    app.feedSeen = {};
    app.lastTurnKey = '';
    app.lastPhase = '';
    app.lastGuessedCount = 0;
    app.inviteToken = null;
    app.inviteUrl = '';
    app.chatDraft = '';
    app.ruleMenuOpen = null;
    app.lastOverlayHtml = null;
    D.body.classList.remove('solo-mode');
    rememberRoom(code);
    show('s-game');
    ensurePaint();
    app.paint.clearLocal();
    app.paint.clearRedo();
    startLoop();
    /* 保險：萬一第一份投影比 ack 早到而被丟掉，這裡再要一次 */
    w.Online.send('room:resync', {});
    Sound.play('join');
  }

  function leaveGame(target) {
    if (app.mode === 'solo') GameAnalytics.end({ result: 'complete' });
    if (app.mode === 'online') w.Online.send('room:leave', {});
    forgetRoom();
    D.body.classList.remove('solo-mode');
    stopLoop();
    app.mode = null;
    app.solo = null;
    app.view = null;
    app.roomCode = null;
    if (app.paint) { app.paint.setEnabled(false); app.paint.clearLocal(); }
    show(target || 's-home');
    if (target === 's-lobby') connectOnline();
  }

  /** 連線之前先把會送出請求的按鈕停用，避免按了卻沒有送出去 */
  function setLobbyEnabled(on) {
    ['b-lobby-host', 'b-lobby-join', 'b-lobby-refresh', 'b-lobby-invite-player', 'b-lobby-invite-spectator'].forEach(function (id) {
      var el = $(id);
      if (el) el.disabled = !on;
    });
  }

  function connectOnline() {
    $('lobby-nick').value = Store.ensureNick();
    setLobbyEnabled(false);
    if (!Cfg.isOnlineEnabled()) {
      $('lobby-off').hidden = false;
      $('lobby-live').hidden = true;
      $('lobby-off-note').textContent = Cfg.status === 'invalid'
        ? ((globalThis.I18N ? globalThis.I18N.t("text.020") : "伺服器設定有問題：") + Cfg.error)
        : (globalThis.I18N ? globalThis.I18N.t("text.019") : "線上對戰需要一台開著的伺服器。單機練習完全不受影響，可以直接玩。");
      return;
    }
    $('lobby-state').textContent = (globalThis.I18N ? globalThis.I18N.t("text.018") : "正在連線…");
    w.Online.connect({ clientId: Store.clientId(), name: Store.ensureNick() })
      .then(function () {
        $('lobby-off').hidden = true;
        $('lobby-live').hidden = false;
        setLobbyEnabled(true);
        w.Online.send('lobby:subscribe', {});
        $('lobby-state').textContent = (globalThis.I18N ? globalThis.I18N.t("text.017") : "已連線。");
        checkPendingInvite();
        /* 重新整理前在房間裡：自動回去（有邀請連結的話以邀請為準） */
        var entry = Cfg.entry();
        if (app.resumeRoom && !(entry.room && entry.invite) && app.mode !== 'online') {
          var code = app.resumeRoom;
          app.resumeRoom = null;
          $('lobby-state').textContent = (globalThis.I18N ? globalThis.I18N.t("text.016") : "正在回到房間 ") + code + '…';
          joinRoom(code, null, null, { resume: true });
        }
      })
      .catch(function (e) {
        setLobbyEnabled(false);
        $('lobby-off').hidden = false;
        $('lobby-live').hidden = true;
        $('lobby-off-note').textContent = e.message || (globalThis.I18N ? globalThis.I18N.t("text.015") : "連不到伺服器。");
      });
  }

  /** 邀請連結：先停在大廳讓被邀請者確認暱稱，確認後才送出加入 */
  function checkPendingInvite() {
    var entry = Cfg.entry();
    if (!entry.room || !entry.invite) return;
    w.Online.send('invite:check', { code: entry.room, token: entry.invite }, function (res) {
      var box = $('lobby-invite');
      box.hidden = false;
      if (!res || !res.ok) {
        app.pendingInvite = null;
        $('lobby-invite-title').textContent = (globalThis.I18N ? globalThis.I18N.t("text.014") : "這個邀請連結不能用了");
        $('lobby-invite-note').textContent = (res && w.I18N.message(res.error, res.params)) || (globalThis.I18N ? globalThis.I18N.t("text.013") : "連結無效。");
        $('b-lobby-invite-player').hidden = true;
        $('b-lobby-invite-spectator').hidden = true;
        clearInviteParams();
        return;
      }
      /* 連結不綁身分，玩家還是觀戰由對方自己按下面兩顆鈕決定；
         res.note 是伺服器算出來的提醒（例如玩家席已滿），有的話一起顯示。 */
      app.pendingInvite = { code: entry.room, token: entry.invite };
      $('b-lobby-invite-player').hidden = false;
      $('b-lobby-invite-spectator').hidden = false;
      $('lobby-invite-title').textContent = (globalThis.I18N ? globalThis.I18N.t("text.012") : "收到房間 ") + entry.room + (globalThis.I18N ? globalThis.I18N.t("text.011") : " 的邀請");
      $('lobby-invite-note').textContent =
        (globalThis.I18N ? globalThis.I18N.t("text.010") : "可以先改上面的暱稱，再選要當玩家還是觀戰。") + (res.note ? '（' + res.note + '）' : '');
    });
  }

  function renderRoomList(rooms) {
    app.rooms = rooms;
    var host = $('roomlist');
    if (!rooms || !rooms.length) {
      host.innerHTML = (globalThis.I18N ? globalThis.I18N.t("text.009") : "<p class=\"hint-note\">目前沒有公開房間。按「開一間房」自己開一間，把房號或邀請連結傳給朋友。</p>");
      return;
    }
    host.innerHTML = rooms.map(function (r) {
      var phase = { get waiting() { return globalThis.I18N ? globalThis.I18N.t("text.008") : "等待中"; }, get playing() { return globalThis.I18N ? globalThis.I18N.t("text.007") : "進行中"; }, get finished() { return globalThis.I18N ? globalThis.I18N.t("text.006") : "已結束"; } }[r.phase] || r.phase;
      return '<div class="roomcard"><span class="rc-code">' + esc(r.code) + '</span>' +
        '<span class="rc-main"><b class="rc-name">' + esc(r.name) + '</b>' +
        '<span class="rc-sub"><span class="rc-badge" data-p="' + r.phase + '">' + phase + '</span>' +
        r.players + '/' + r.maxPlayers + (globalThis.I18N ? globalThis.I18N.t("text.005") : " 位玩家") +
        (r.spectators ? '・' + r.spectators + (globalThis.I18N ? globalThis.I18N.t("text.004") : " 觀戰") : '') +
        (globalThis.I18N ? globalThis.I18N.t("text.003") : "・房主 ") + esc(r.host) + '</span></span>' +
        '<span class="rc-btns">' +
        '<button class="btn3d small" data-color="mint" data-join="' + esc(r.code) + (globalThis.I18N ? globalThis.I18N.t("text.002") : "\">加入</button>") +
        '<button class="btn3d small" data-color="sky" data-watch="' + esc(r.code) + (globalThis.I18N ? globalThis.I18N.t("text.001") : "\">觀戰</button>") +
        '</span></div>';
    }).join('');
    S.decorateAll(host);
    var j = host.querySelectorAll('[data-join]');
    for (var i = 0; i < j.length; i++) {
      (function (el) { el.addEventListener('click', function () { joinRoom(el.getAttribute('data-join'), null, 'player'); }); }(j[i]));
    }
    var s = host.querySelectorAll('[data-watch]');
    for (var k = 0; k < s.length; k++) {
      (function (el) { el.addEventListener('click', function () { joinRoom(el.getAttribute('data-watch'), null, 'spectator'); }); }(s[k]));
    }
  }

  /* -------------------------------------------------------- 線上事件 */

  function renderOnlineCount() {
    var el = $('lobby-online-count');
    var valid = app.conn && app.conn.status === 'connected' && Number.isInteger(app.onlineCount);
    el.hidden = !valid;
    el.textContent = valid ? w.I18N.t('lobby.onlineCount', { n: app.onlineCount }) : '';
  }

  function setupOnlineEvents() {
    var O = w.Online;

    O.on('status', function (s) {
      app.conn = s;
      if (s.status !== 'connected') app.onlineCount = null;
      renderOnlineCount();
      if (app.screen === 's-lobby') {
        if (s.message) $('lobby-state').textContent = s.message;
        setLobbyEnabled(s.status === 'connected');
      }
      if (app.view) renderAside();
    });

    O.on('lobby:rooms', function (p) {
      app.onlineCount = Number.isInteger(p.online) && p.online >= 0 ? p.online : null;
      renderOnlineCount();
      renderRoomList(p.rooms);
    });

    O.on('room:sync', function (v) {
      localizeGame(v.game);
      if (app.mode !== 'online') return;
      var prev = app.view;
      app.view = v;
      if (v.game) GameAnalytics.sync(v.room.phase, v.room.code + '|' + v.game.seed, {
        mode: 'online', difficulty: v.game.diff, players: v.game.players.length, spectator: v.you.role !== 'player'
      }, { result: v.game.winners && v.game.winners.indexOf(v.you.id) >= 0 ? 'win' : 'lose' });
      app.roomCode = v.room.code;

      /* 換題／換階段：清畫布、播音效 */
      var key = v.game ? (v.game.turnNo + ':' + v.game.phase) : (v.room.phase);
      if (v.game && prev && prev.game && prev.game.turnNo !== v.game.turnNo) {
        app.paint.clearLocal();
        app.paint.clearRedo();
      }
      if (key !== app.lastTurnKey) {
        app.lastTurnKey = key;
        if (v.game && v.game.phase === 'drawing') Sound.play('turn');
        if (v.game && v.game.phase === 'over') {
          Sound.play(v.game.winners.indexOf(v.you.id) >= 0 ? 'win' : 'lose');
          recordResult(v);
        }
      }

      /* 筆畫：有整張就換掉，沒有就比對筆數，對不上主動要求重新同步 */
      if (v.game && v.game.strokes) app.paint.setStrokes(v.game.strokes);
      else if (v.game && typeof v.game.strokeCount === 'number' && v.game.strokeCount !== app.paint.count()) {
        O.send('room:resync', {});
      }

      if (v.room.feed) replaceFeed(v.room.feed);
      render();
      if (gameModal && gameModal.isOpen()) renderGameSettings();
    });

    O.on('room:stroke', function (p) {
      if (app.mode !== 'online' || !p.stroke) return;
      /* 自己剛剛畫的那一筆已經在本機畫過了，筆數相同就略過 */
      if (app.paint.count() >= p.count) return;
      if (app.paint.count() < p.count - 1) { O.send('room:resync', {}); return; }
      app.paint.addStroke(p.stroke);
      Sound.playPen();
    });

    O.on('room:board', function (p) {
      if (app.mode !== 'online') return;
      if (p.action === 'clear') { app.paint.clearLocal(); Sound.play('clear'); return; }
      var list = app.paint.strokes();
      if (list.length > p.count) app.paint.setStrokes(list.slice(0, p.count));
      else if (list.length < p.count) O.send('room:resync', {});
      Sound.play('undo');
    });

    O.on('room:feed', function (p) {
      if (app.mode !== 'online') return;
      pushFeed(p.entry);
      Sound.playChat();
    });

    O.on('room:private', function (p) {
      if (p.kind === 'hit') { toast(w.I18N.message(p.message, p.params), 'ok'); Sound.play('correct'); Sound.vibrate([12, 40, 12]); }
      else if (p.kind === 'close') { toast(w.I18N.message(p.message, p.params), 'ok'); Sound.play('close'); }
      else if (p.kind === 'miss') { Sound.play('wrong'); }
      else if (p.kind === 'rejected') { toast(w.I18N.message(p.message, p.params), 'error'); Sound.play('blocked'); }
    });

    O.on('room:error', function (p) { toast(w.I18N.message(p.message, p.params), 'error'); Sound.play('blocked'); });

    O.on('room:closed', function (p) {
      if (app.mode !== 'online') return;
      forgetRoom();
      if (app.view) {
        app.view.room.closed = true;
        app.view.room.closedReason = p.reason;
        render();
      }
      toast(w.I18N.message(p.reason), 'error');
      Sound.play('leave');
    });

    O.on('room:left', function () {
      app.roomCode = null;
    });

    O.on('reconnected', function () {
      if (app.mode === 'online' && app.roomCode) {
        joinRoom(app.roomCode, null, null, { rejoin: true });
      }
    });
  }

  /**
   * 戰績只記一次：用「這一局」本身當鑰匙（種子＋開局時間），不是用一個會被重設的旗標。
   * 以前在結算畫面斷線重連會重設旗標 → 同一局記兩次；線上「再開一局」又沒重設 → 下一局完全沒記到。
   * 鑰匙存在 sessionStorage，重新整理頁面自動回到房間時也不會重記。
   */
  function recordedKeys() {
    try { return JSON.parse(w.sessionStorage.getItem('dg_recorded') || '[]'); } catch (e) { return []; }
  }
  function recordResult(v) {
    if (!v.game) return;
    var gameKey = app.mode + ':' + v.game.seed + ':' + v.game.startedAt;
    var keys = recordedKeys();
    if (app.recordedKey === gameKey || keys.indexOf(gameKey) >= 0) return;
    app.recordedKey = gameKey;
    try { w.sessionStorage.setItem('dg_recorded', JSON.stringify(keys.concat(gameKey).slice(-20))); } catch (e) { /* 私密模式存不了就算了，記憶體裡的鑰匙還是擋得住 */ }
    var me = null;
    for (var i = 0; i < v.game.players.length; i++) if (v.game.players[i].id === v.you.id) me = v.game.players[i];
    if (!me) return;
    var correct = 0;
    for (var j = 0; j < v.game.log.length; j++) {
      var g = v.game.log[j].guessed || [];
      for (var k = 0; k < g.length; k++) if (g[k].id === v.you.id) correct++;
    }
    Store.recordGame(app.mode === 'online' ? 'online' : 'solo', {
      win: v.game.winners.indexOf(v.you.id) >= 0,
      correct: correct,
      drawn: me.drew,
      score: me.score
    });
  }

  /* ================================================================
     鍵盤快捷鍵（畫家用）
     ================================================================ */

  function setupKeys() {
    D.addEventListener('keydown', function (ev) {
      if (app.screen !== 's-game') return;
      var tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (settingsModal.isOpen() || gameModal.isOpen() || referenceModal.isOpen() || (confirmModal && confirmModal.isOpen())) return;
      if (!app.view || !app.view.you.can.draw) return;

      var k = ev.key.toLowerCase();
      if ((ev.ctrlKey || ev.metaKey) && k === 'z') { ev.preventDefault(); doUndo(); return; }
      if ((ev.ctrlKey || ev.metaKey) && (k === 'y' || (k === 'z' && ev.shiftKey))) { ev.preventDefault(); doRedo(); return; }
      var map = { p: 'pen', b: 'brush', l: 'line', r: 'rect', o: 'ellipse', e: 'erase', f: 'fill' };
      if (map[k]) { ev.preventDefault(); chooseTool(map[k]); }
    });
  }

  /* 房間設定卡片裡「遊戲規則」的自訂下拉選單：點清單以外的地方，或按 Escape，就收起來。
     只掛一次在 document 上（跟卡片的事件委派一樣，不會越掛越多，
     掛在卡片本身的話舊的監聽器會一直留著、越掛越多）。 */
  function setupRuleMenuClose() {
    D.addEventListener('click', function (ev) {
      if (!app.ruleMenuOpen) return;
      if (ev.target.closest && ev.target.closest('.ruledd')) return;
      app.ruleMenuOpen = null;
      app.lastOverlayHtml = null;
      renderOverlay();
    }, true);
    D.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && app.ruleMenuOpen) {
        app.ruleFocus = { field: app.ruleMenuOpen, target: 'btn' };
        app.ruleMenuOpen = null;
        app.lastOverlayHtml = null;
        renderOverlay();
      }
    });
  }

  /* ================================================================
     啟動
     ================================================================ */

  function init() {
    w.I18N.mountToggle({ after: $('b-settings') });
    w.I18N.onChange(function () {
      app.lastOverlayHtml = null;
      $('logo').innerHTML = S.logo();
      renderSoloOptions();
      syncSettingsUI();
      if (app.rooms) renderRoomList(app.rooms);
      renderOnlineCount();
      if (gameModal && gameModal.isOpen()) renderGameSettings();
      if (roomCreateModal && roomCreateModal.isOpen()) renderRoomCreateOptions();
      if (app.screen === 's-help') renderTutorial();
      if (app.screen === 's-stats') renderStats();
      render(); syncToolbar(); renderRecent();
      var link = D.querySelector('.lobby-home-link');
      if (link) link.href = w.I18N.withLang(link.href);
    });

    $('logo').innerHTML = S.logo();
    paintIcons();
    S.decorateAll();
    S.decorateBackground($('bgdeco'), 12);
    applyDisplaySettings();

    setupSettings();
    setupReference();
    setupConfirm();
    setupRoomCreate();
    setupGameSettings();
    setupTutorial();
    setupSoloScreen();
    setupLobby();
    setupGuessbar();
    setupOnlineEvents();
    setupKeys();
    setupRuleMenuClose();
    setupOverlayEvents();
    buildToolbar();
    ensurePaint();
    syncToolbar();

    $('b-solo').addEventListener('click', function () { Sound.play('click'); show('s-solo'); });
    $('b-online').addEventListener('click', function () { Sound.play('click'); show('s-lobby'); connectOnline(); });
    $('b-help').addEventListener('click', function () { Sound.play('click'); tutIndex = 0; show('s-help'); renderTutorial(); });
    $('b-stats').addEventListener('click', function () { Sound.play('click'); renderStats(); show('s-stats'); });

    var backs = D.querySelectorAll('[data-back]');
    for (var i = 0; i < backs.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { Sound.play('click'); show(b.getAttribute('data-back')); });
      }(backs[i]));
    }

    $('b-game-back').addEventListener('click', function () {
      /* 對局已經結束就不用再問，直接走 */
      var g = app.view && app.view.game;
      var done = (app.view && app.view.room && app.view.room.closed) || (g && g.phase === 'over') || !g;
      if (done) { leaveGame(app.mode === 'online' ? 's-lobby' : 's-home'); return; }
      askLeaveGame();
    });
    $('b-aside-toggle').addEventListener('click', function () { setAsideOpen(!app.asideOpen); Sound.play('click'); });
    $('b-aside-close').addEventListener('click', function () { setAsideOpen(false); });
    /* 音訊必須等第一次使用者手勢才能解鎖 */
    var unlock = function () {
      Sound.unlock();
      Sound.startBgm(app.screen === 's-game' ? 'draw' : 'menu');
      D.removeEventListener('pointerdown', unlock);
      D.removeEventListener('keydown', unlock);
    };
    D.addEventListener('pointerdown', unlock);
    D.addEventListener('keydown', unlock);

    w.addEventListener('resize', function () { syncGuessbarSpace(); relayoutFeed(); layoutStage(); });
    w.addEventListener('orientationchange', function () { setTimeout(function () { syncGuessbarSpace(); relayoutFeed(); layoutStage(); }, 250); });
    relayoutFeed();
    layoutStage();

    /* 帶著邀請連結進來：直接停在大廳讓使用者確認暱稱 */
    var entry = Cfg.entry();
    var resume = savedRoom();
    if (entry.room && entry.invite) { show('s-lobby'); connectOnline(); }
    else if (resume && Cfg.isOnlineEnabled()) { app.resumeRoom = resume; show('s-lobby'); connectOnline(); }
    else if (!Store.tutorialDone()) { tutIndex = 0; show('s-help'); renderTutorial(); }
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init);
  else init();

  /* 給自動化檢查用 */
  w.DrawGuessApp = app;
}(window));
