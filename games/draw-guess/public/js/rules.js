/* ===== rules.js — 你畫我猜的規則核心（單機、伺服器、測試共用） =====
 *
 * 這一層只有「狀態 + 行動 → 新狀態」，沒有畫面、沒有網路、沒有計時器。
 * 時間一律由呼叫端把 now（毫秒）傳進來，所以同一組 seed 加上同一串行動
 * 一定得到同一個結果，重播、AI 測試與多人同步都可重現。
 *
 * 隱藏資訊：答案只放在 state.wordId。要送給玩家的東西一律走 toPublic(state, viewerId)，
 * 只有當回合的畫家會拿到答案與選字清單，其他人拿到的是遮罩後的提示。
 *
 * 一局的節奏
 *   picking  畫家從 3 個題目挑一個（逾時自動挑第一個）
 *   drawing  畫家作畫，其他人猜；全部猜中或時間到就結束
 *   reveal   公布答案與本回合得分
 *   → 下一位畫家；每個人都畫過 rounds 次就 over
 */
(function (root, factory) {
  'use strict';
  var api = factory(
    typeof module === 'object' && module.exports ? require('./rng.js') : root.RNG,
    typeof module === 'object' && module.exports ? require('./words.js') : root.Words
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.Rules = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (RNG, Words) {
  'use strict';

  var CONST = {
    /* 引擎本身只要求 1 個人就能開局（單機自己練習畫畫就是這樣）；
       線上房間需要至少 2 個真人才能開始，那是房間層級的規則，見 lib/rooms.js 的 ROOM_MIN_PLAYERS。 */
    MIN_PLAYERS: 1,
    /* 對局進行中一路掉到只剩 1 個人（例如線上房間走掉一個人）就沒辦法再猜題了，直接收掉這一局；
       這跟「開局最少要幾個人」（MIN_PLAYERS）是兩回事——單機本來就從 1 個人開始，不該套用這條。 */
    MULTIPLAYER_MIN: 2,
    MAX_PLAYERS: 8,
    CHOICES: 3,
    PICK_MS: 15000,          // 選字時間
    /* 預設作畫時間。沒帶 drawSec 的房間就用這個值，所以它必須剛好是線上房間
       設定面板那三顆按鈕（60／90／120）之一，否則秒數那一列會一顆都沒亮。 */
    DRAW_MS: 90000,
    REVEAL_MS: 7000,         // 公布答案停留時間
    ROUNDS_DEFAULT: 2,       // 每個人輪流當幾次畫家
    /* 這兩個上限是引擎層級的極限值：單機自己練習沒有電腦對手要等，可以拉到很大；
       線上房間為了不要讓其他真人乾等太久，用自己更小的上限，見 lib/rooms.js 的
       ROOM_ROUNDS_MAX / ROOM_DRAW_SEC_MAX。 */
    ROUNDS_MAX: 999,
    DRAW_SEC_MIN: 60,
    DRAW_SEC_MAX: 99999,
    MAX_STROKES: 600,        // 一題最多幾筆（防洪）
    MAX_STROKE_POINTS: 400,  // 單筆最多幾個點
    MAX_TOTAL_POINTS: 30000, // 一題全部點數上限
    GUESS_MAX: 40,           // 猜測字數上限（英文題目最長 32 個字元，要放得下）
    HINTS: 3,                      // 畫家手上的提示張數：字數 → 種類 → 揭一個字
    AI_HINT_AT: [0.18, 0.40, 0.62],// 電腦當畫家時，依已用時間比例自動按提示
    BOX: Words.BOX
  };

  /* 12 色盤：亮、可愛、彼此好分辨；index 進 state，色碼只給畫面用 */
  var COLORS = [
    '#4A3B55', '#D2444F', '#F0913F', '#E7C263',
    '#5FBF95', '#3E8F6B', '#7FB4DA', '#4A6FA5',
    '#A48FDB', '#E88CAA', '#8B5E3C', '#FFFDF8'
  ];
  /* 筆寬（正規化單位，1000 為畫布邊長） */
  var WIDTHS = [7, 16, 34, 64];

  /* 畫布工具：參考小畫家，但刻意不做「文字」工具 ——
     畫家可以直接把答案寫上去，那就不叫你畫我猜了。 */
  var TOOLS = {
    pen:     { key: 'pen',     label: '鉛筆',   points: 'many',  shape: false },
    brush:   { key: 'brush',   label: '筆刷',   points: 'many',  shape: false },
    erase:   { key: 'erase',   label: '橡皮擦', points: 'many',  shape: false },
    line:    { key: 'line',    label: '直線',   points: 2,       shape: true },
    rect:    { key: 'rect',    label: '矩形',   points: 2,       shape: true },
    ellipse: { key: 'ellipse', label: '橢圓',   points: 2,       shape: true },
    fill:    { key: 'fill',    label: '油漆桶', points: 1,       shape: false }
  };
  var TOOL_KEYS = Object.keys(TOOLS);

  var PHASES = ['picking', 'drawing', 'reveal', 'over'];


  /* 錯誤訊息一律是字典代碼（srv.err.＊）加參數，由畫面端依語系翻譯 */
  var err = function (key, code, params) { return { ok: false, error: key, params: params || null, code: code || 'invalid' }; };
  var ok = function (extra) { return Object.assign({ ok: true }, extra || {}); };

  var clamp = function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); };

  /* ------------------------------------------------------------ 建立 */

  /**
   * @param {object} opts
   *   seed      字串種子；同一個種子 + 同一批玩家 = 同一串題目與揭字順序
   *   players   [{id, name, ai}]，順序不重要，內部會用種子洗牌決定畫家順序
   *   rounds    每個人當幾次畫家
   *   drawSec   每題作畫秒數
   *   diff      1/2/3 或 0＝混合難度
   */
  function createState(opts) {
    var o = opts || {};
    var seed = RNG.normalizeSeed(o.seed) || RNG.randomSeed(null, 6);
    var players = (o.players || []).slice(0, CONST.MAX_PLAYERS).map(function (p, i) {
      return {
        id: String(p.id),
        name: String(p.name || ('P' + (i + 1))),
        ai: p.ai || null,
        score: 0,
        drew: 0
      };
    });
    var rounds = clamp(Math.round(Number(o.rounds) || CONST.ROUNDS_DEFAULT), 1, CONST.ROUNDS_MAX);
    var drawMs = clamp(Math.round(Number(o.drawSec) || CONST.DRAW_MS / 1000), CONST.DRAW_SEC_MIN, CONST.DRAW_SEC_MAX) * 1000;

    /* 畫家順序：用種子洗牌，所以重播會拿到同一個順序 */
    var rng = RNG.createRng(seed + ':order');
    var order = players.map(function (p) { return p.id; });
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)) % (i + 1);
      var t = order[i]; order[i] = order[j]; order[j] = t;
    }

    return {
      seed: seed,
      /* 題庫語言（zh-Hant／en）：題目、答案、字數、遮罩與猜測比對都跟著它走 */
      lang: Words.normLang(o.lang),
      /* 單機練習：真的不限時、不限次。選題不會逾時自動挑、作畫不會時間到、也永遠不會跳結算，
         練夠了自己離開就好。以前是拿引擎上限（999 次、99999 秒）假裝不限，
         結果選題還是 15 秒倒數、畫滿 999 題還會跳出一張「你 0 分」的結算。 */
      unlimited: !!o.unlimited,
      rounds: rounds,
      drawMs: drawMs,
      pickMs: CONST.PICK_MS,
      revealMs: CONST.REVEAL_MS,
      diff: [1, 2, 3].indexOf(Number(o.diff)) >= 0 ? Number(o.diff) : 0,
      players: players,
      order: order,
      round: 1,
      turn: 0,
      turnNo: 0,
      totalTurns: rounds * players.length,
      phase: 'picking',
      drawerId: null,
      choices: [],
      wordId: null,
      usedWords: [],
      hints: 0,
      revealed: [],
      hintPlan: [],
      strokes: [],
      pointCount: 0,
      guessed: [],
      wrong: {},
      deadline: 0,
      startedAt: 0,
      log: [],
      over: false,
      winners: []
    };
  }

  function player(state, id) {
    for (var i = 0; i < state.players.length; i++) {
      if (state.players[i].id === id) return state.players[i];
    }
    return null;
  }

  function guesserIds(state) {
    return state.players
      .filter(function (p) { return p.id !== state.drawerId; })
      .map(function (p) { return p.id; });
  }

  function hasGuessed(state, id) {
    for (var i = 0; i < state.guessed.length; i++) {
      if (state.guessed[i].id === id) return true;
    }
    return false;
  }

  function word(state) { return state.wordId ? Words.byId(state.wordId, state.lang) : null; }

  /* ------------------------------------------------------------ 開局 */

  /** 開始整局：安排第一位畫家並進入選字 */
  function start(state, now) {
    if (state.players.length < CONST.MIN_PLAYERS) {
      return err('srv.err.minPlayers', 'players', { n: CONST.MIN_PLAYERS });
    }
    state.round = 1;
    state.turn = 0;
    state.turnNo = 0;
    state.over = false;
    state.winners = [];
    state.usedWords = [];
    state.log = [];
    for (var i = 0; i < state.players.length; i++) {
      state.players[i].score = 0;
      state.players[i].drew = 0;
    }
    state.startedAt = now;
    beginTurn(state, now);
    return ok({ state: state });
  }

  /** 開始新的一題：指定畫家、抽三個題目、進入選字階段 */
  function beginTurn(state, now) {
    state.turnNo += 1;
    state.phase = 'picking';
    state.drawerId = state.order[state.turn] || (state.players[0] && state.players[0].id) || null;
    state.wordId = null;
    state.hints = 0;
    state.revealed = [];
    state.hintPlan = [];
    state.strokes = [];
    state.pointCount = 0;
    state.guessed = [];
    state.wrong = {};
    state.deadline = state.unlimited ? 0 : now + state.pickMs;

    var rng = RNG.createRng(state.seed + ':turn:' + state.turnNo);
    state.choices = Words.pick(rng, CONST.CHOICES, {
      diff: state.diff || 0,
      exclude: state.usedWords
    });
    /* 題庫用完了就從頭來，不要卡住 */
    if (state.choices.length < CONST.CHOICES) {
      state.usedWords = [];
      state.choices = Words.pick(rng, CONST.CHOICES, { diff: state.diff || 0 });
    }
    return state;
  }

  /** 畫家選定題目，進入作畫階段 */
  function pickWord(state, playerId, wordId, now) {
    if (state.phase !== 'picking') return err('srv.err.notPicking', 'phase');
    if (playerId !== state.drawerId) return err('srv.err.onlyDrawerPick', 'forbidden');
    var id = String(wordId || '');
    if (state.choices.indexOf(id) < 0) return err('srv.err.pickFromThree', 'choice');
    return commitWord(state, id, now, false);
  }

  function commitWord(state, id, now, auto) {
    var w = Words.byId(id, state.lang);
    if (!w) return err('srv.err.wordMissing', 'choice');
    state.wordId = id;
    state.usedWords.push(id);
    if (state.usedWords.length > 200) state.usedWords.splice(0, 100);
    state.phase = 'drawing';
    state.deadline = state.unlimited ? 0 : now + state.drawMs;
    state.startedAt = now;

    /* 第三張提示要揭哪一個字也吃種子，重播才會一樣。每個字都可能被翻開（包含最後一個字），
       否則兩個字的題目只剩第一個字可翻，永遠都是翻第一個字。單字題翻了就等於公布答案，沒有這張。 */
    var rng = RNG.createRng(state.seed + ':hint:' + state.turnNo);
    var slots = Words.revealable(w);
    state.hintPlan = slots.length >= 2 ? [slots[Math.floor(rng() * slots.length) % slots.length]] : [];
    state.hints = 0;
    state.revealed = [];
    return ok({ state: state, wordId: id, auto: !!auto });
  }

  /* ------------------------------------------------------------ 作畫 */

  /** 把用戶端送來的筆畫洗乾淨；不合法就回 null（伺服器據此拒絕） */
  function sanitizeStroke(raw) {
    if (!raw || typeof raw !== 'object') return null;
    /* 只接受字串／數字：物件的 toString 可以被亂塞，String()／Number() 碰到會直接丟例外 */
    var num = function (x) { return typeof x === 'number' ? x : (typeof x === 'string' ? Number(x) : NaN); };
    var tool = (typeof raw.t === 'string' && TOOLS[raw.t]) ? raw.t : 'pen';
    var spec = TOOLS[tool];

    var pts = raw.p;
    if (!Array.isArray(pts) || pts.length < 2 || pts.length % 2 !== 0) return null;
    if (spec.points === 'many') {
      if (pts.length > CONST.MAX_STROKE_POINTS * 2) pts = pts.slice(0, CONST.MAX_STROKE_POINTS * 2);
    } else if (pts.length !== spec.points * 2) {
      return null;               // 直線／矩形／橢圓固定兩點，油漆桶固定一點
    }

    var out = new Array(pts.length);
    for (var i = 0; i < pts.length; i++) {
      var v = num(pts[i]);
      if (!isFinite(v)) return null;
      out[i] = Math.round(clamp(v, 0, CONST.BOX));
    }
    var c = Math.round(num(raw.c));
    var w = Math.round(num(raw.w));
    return {
      t: tool,
      c: isFinite(c) ? clamp(c, 0, COLORS.length - 1) : 0,
      w: isFinite(w) ? clamp(w, 0, WIDTHS.length - 1) : 1,
      f: (spec.shape && tool !== 'line' && raw.f) ? 1 : 0,
      p: out
    };
  }

  /* --------------------------------------------------------------
     把任何一筆（含矩形、橢圓）攤平成折線。
     電腦對手看畫猜題、以及任何需要「形狀」的計算都走這裡，
     這樣玩家用哪個工具畫的都能一視同仁。油漆桶沒有輪廓，會被略過。
     -------------------------------------------------------------- */
  function toPolylines(strokes) {
    var out = [];
    for (var i = 0; i < (strokes || []).length; i++) {
      var st = strokes[i];
      if (!st || !st.p) continue;
      var t = st.t || 'pen';
      if (t === 'fill') continue;
      if (t === 'rect') {
        out.push({ p: [st.p[0], st.p[1], st.p[2], st.p[1], st.p[2], st.p[3], st.p[0], st.p[3], st.p[0], st.p[1]] });
      } else if (t === 'ellipse') {
        var cx = (st.p[0] + st.p[2]) / 2, cy = (st.p[1] + st.p[3]) / 2;
        var rx = Math.abs(st.p[2] - st.p[0]) / 2, ry = Math.abs(st.p[3] - st.p[1]) / 2;
        var pts = [];
        for (var a = 0; a <= 24; a++) {
          var ang = a / 24 * Math.PI * 2;
          pts.push(cx + Math.cos(ang) * rx, cy + Math.sin(ang) * ry);
        }
        out.push({ p: pts });
      } else {
        out.push({ p: st.p });
      }
    }
    return out;
  }

  function addStroke(state, playerId, raw) {
    if (state.phase !== 'drawing') return err('srv.err.cantDrawYet', 'phase');
    if (playerId !== state.drawerId) return err('srv.err.onlyDrawerDraw', 'forbidden');
    var stroke = sanitizeStroke(raw);
    if (!stroke) return err('srv.err.badStroke', 'stroke');
    /* 單機不限時練習會持續累積手繪分段，不套用線上對局的防洪上限。 */
    if (!state.unlimited && state.strokes.length >= CONST.MAX_STROKES) return err('srv.err.tooManyStrokes', 'limit');
    if (!state.unlimited && state.pointCount + stroke.p.length / 2 > CONST.MAX_TOTAL_POINTS) {
      return err('srv.err.tooFull', 'limit');
    }
    stroke.n = state.strokes.length + 1;
    state.strokes.push(stroke);
    state.pointCount += stroke.p.length / 2;
    return ok({ stroke: stroke });
  }

  function undoStroke(state, playerId) {
    if (state.phase !== 'drawing') return err('srv.err.nothingToUndo', 'phase');
    if (playerId !== state.drawerId) return err('srv.err.onlyDrawerUndo', 'forbidden');
    if (!state.strokes.length) return err('srv.err.boardEmpty', 'empty');
    var removed = state.strokes.pop();
    state.pointCount -= removed.p.length / 2;
    return ok({ removed: removed });
  }

  function clearBoard(state, playerId) {
    if (state.phase !== 'drawing') return err('srv.err.cantClear', 'phase');
    if (playerId !== state.drawerId) return err('srv.err.onlyDrawerClear', 'forbidden');
    state.strokes = [];
    state.pointCount = 0;
    return ok();
  }

  /* ------------------------------------------------------------ 猜題 */

  var ORDER_BONUS = [60, 40, 25, 15, 10];

  function scoreFor(state, now) {
    var elapsed = clamp(now - state.startedAt, 0, state.drawMs);
    var left = 1 - elapsed / state.drawMs;
    var order = state.guessed.length;                 // 第幾個猜中（0 起算）
    var bonus = ORDER_BONUS[Math.min(order, ORDER_BONUS.length - 1)];
    return 100 + Math.round(200 * left) + bonus;
  }

  /**
   * 猜一次。
   * @returns {{ok, verdict:'hit'|'close'|'miss', points?, allDone?}}
   *   hit   猜中（不會把答案廣播出去，由呼叫端只公布「某某猜對了」）
   *   close 猜中答案一半以上的字，僅私下提示猜的人
   *   miss  沒猜中，呼叫端把它寫進猜題紀錄讓大家看到
   */
  function guess(state, playerId, text, now) {
    if (state.phase !== 'drawing') return err('srv.err.notGuessTime', 'phase');
    var p = player(state, playerId);
    if (!p) return err('srv.err.notInGame', 'forbidden');
    if (playerId === state.drawerId) return err('srv.err.drawerCantGuess', 'forbidden');
    if (hasGuessed(state, playerId)) return err('srv.err.alreadyGuessed', 'done');
    var clean = String(text === undefined || text === null ? '' : text).slice(0, CONST.GUESS_MAX);
    if (!Words.normalize(clean, state.lang)) return err('srv.err.emptyGuess', 'empty');

    var w = word(state);
    var verdict = Words.match(w, clean);
    if (verdict === 'hit') {
      var points = scoreFor(state, now);
      state.guessed.push({ id: playerId, at: now, order: state.guessed.length + 1, points: points });
      p.score += points;
      var allDone = state.guessed.length >= guesserIds(state).length;
      return ok({ verdict: 'hit', points: points, order: state.guessed.length, allDone: allDone });
    }
    state.wrong[playerId] = (state.wrong[playerId] || 0) + 1;
    return ok({ verdict: verdict, points: 0 });
  }


  /* ------------------------------------------------------------ 結算 */

  var DRAWER_PER_GUESS = 40;
  var DRAWER_ALL_BONUS = 60;

  /** 收掉這一回合：算畫家分數、寫進紀錄、進入公布答案 */
  function endTurn(state, now, reason) {
    if (state.phase !== 'drawing' && state.phase !== 'picking') return err('srv.err.turnEnded', 'phase');
    var w = word(state);
    var total = guesserIds(state).length;
    var correct = state.guessed.length;
    var drawer = player(state, state.drawerId);
    var drawerPoints = 0;
    if (w && correct > 0) {
      drawerPoints = correct * DRAWER_PER_GUESS + (total > 0 && correct >= total ? DRAWER_ALL_BONUS : 0);
      if (drawer) drawer.score += drawerPoints;
    }
    if (drawer) drawer.drew += 1;

    var entry = {
      turnNo: state.turnNo,
      round: state.round,
      drawerId: state.drawerId,
      drawerName: drawer ? drawer.name : '—',
      wordId: state.wordId,
      word: w ? w.text : null,
      cat: w ? w.cat : null,
      correct: correct,
      total: total,
      strokes: state.strokes.length,
      drawerPoints: drawerPoints,
      guessed: state.guessed.map(function (g) {
        var gp = player(state, g.id);
        return { id: g.id, name: gp ? gp.name : '—', order: g.order, points: g.points };
      }),
      reason: reason || 'timeup',
      at: now
    };
    state.log.push(entry);
    state.phase = 'reveal';
    state.deadline = now + state.revealMs;
    return ok({ entry: entry });
  }

  /** 這個人還欠幾次沒畫（每人要畫 rounds 次） */
  function owes(state, id) {
    var p = player(state, id);
    return p ? Math.max(0, state.rounds - p.drew) : 0;
  }

  /**
   * 重算「這一場總共幾題」：已經結束的題數 + 每個人還欠的次數。
   * 以前是 rounds × 人數 直接乘，一有人中途離開或加入就算錯
   * （離開時總題數掉到目前題號以下 → 整局提早結束；最後一輪才加入 → 題號超過總題數）。
   * 作畫中那一題的畫家還沒算進 drew，所以這一題本身已經包含在「還欠的」裡面。
   */
  function recount(state) {
    if (state.unlimited) { state.totalTurns = state.turnNo; return state.totalTurns; }
    var owed = 0;
    for (var i = 0; i < state.players.length; i++) owed += Math.max(0, state.rounds - state.players[i].drew);
    var inProgress = state.phase === 'picking' || state.phase === 'drawing';
    state.totalTurns = Math.max(state.turnNo, state.turnNo - (inProgress ? 1 : 0) + owed);
    return state.totalTurns;
  }

  /**
   * 公布完就換下一位畫家；全部畫完就分出勝負。
   * 結束的判定是「每個人都畫滿 rounds 次」，不是「輪到第幾輪」：
   * 中途有人加入或離開時，順位一直在變，只看輪次會讓人少畫或多畫。
   * 往下找的時候跳過已經畫滿的人（例如離開又回來、已經畫滿的人不會再被排到）。
   */
  function nextTurn(state, now) {
    if (state.phase !== 'reveal') return err('srv.err.notChangeTurn', 'phase');
    var anyOwed = state.unlimited || state.order.some(function (id) { return owes(state, id) > 0; });
    if (!anyOwed) return finish(state, now);
    for (var guard = 0; guard <= state.order.length * 2; guard++) {
      state.turn += 1;
      if (state.turn >= state.order.length) {
        state.turn = 0;
        state.round += 1;
      }
      if (state.unlimited || owes(state, state.order[state.turn]) > 0) break;
    }
    beginTurn(state, now);
    recount(state);
    return ok({ state: state });
  }

  function finish(state, now) {
    state.phase = 'over';
    state.over = true;
    state.deadline = 0;
    var best = -1;
    for (var i = 0; i < state.players.length; i++) best = Math.max(best, state.players[i].score);
    state.winners = state.players.filter(function (p) { return p.score === best; }).map(function (p) { return p.id; });
    state.endedAt = now;
    return ok({ state: state, winners: state.winners });
  }

  /* ------------------------------------------------------------ 時間 */

  /**
   * 推進時間。呼叫端（伺服器每秒一次、單機每一幀）只要把 now 丟進來就好。
   * @returns {{events: Array}} 這次推進發生的事，呼叫端拿去播音效／寫摘要／廣播
   */
  function tick(state, now) {
    var events = [];
    var guard = 0;
    while (guard < 8) {
      guard += 1;
      if (state.phase === 'over') break;

      if (state.phase === 'picking') {
        if (state.unlimited || now < state.deadline) break;    // 不限時：不會逾時自動挑
        var auto = commitWord(state, state.choices[0], now, true);
        if (!auto.ok) break;
        events.push({ type: 'autopick', wordId: state.choices[0], drawerId: state.drawerId });
        continue;
      }

      if (state.phase === 'drawing') {
        /* 提示不再隨時間自動翻開：三張提示由畫家自己按（AI 畫家見 ai.js） */
        var all = guesserIds(state).length > 0 && state.guessed.length >= guesserIds(state).length;
        if (all) {
          var e1 = endTurn(state, now, 'allcorrect');
          if (e1.ok) events.push({ type: 'turnend', entry: e1.entry });
          continue;
        }
        if (!state.unlimited && now >= state.deadline) {
          var e2 = endTurn(state, now, 'timeup');
          if (e2.ok) events.push({ type: 'turnend', entry: e2.entry });
          continue;
        }
        break;
      }

      if (state.phase === 'reveal') {
        if (now < state.deadline) break;
        var before = state.turnNo;
        var r = nextTurn(state, now);
        if (!r.ok) break;
        if (state.over) events.push({ type: 'gameover', winners: state.winners });
        else events.push({ type: 'turnstart', turnNo: state.turnNo, drawerId: state.drawerId, from: before });
        continue;
      }
      break;
    }
    return { events: events };
  }

  /* ------------------------------------------------------------ 提示
     畫家手上有三張提示，只能依序給，給出去就收不回來：
       1 字數   畫面上出現對應數量的底線（漢堡 → ＿＿）
       2 種類   公開題目的分類
       3 一個字 在底線上填回其中一個字（單字題沒有這一張）
   */

  /** 這一題總共有幾張提示可以給（單字題只有兩張） */
  function hintTotal(state) {
    var w = word(state);
    if (!w) return 0;
    return Words.glyphCount(w) > 1 ? CONST.HINTS : CONST.HINTS - 1;
  }

  /** 三張提示現在各自的狀態，畫面直接拿去畫按鈕 */
  function hintSteps(state) {
    var total = hintTotal(state);
    var out = [];
    for (var i = 0; i < CONST.HINTS; i++) {
      out.push({
        step: i + 1,
        done: state.hints > i,
        /* 只能依序給：下一張才是可按的那一張 */
        available: i + 1 <= total && state.hints === i,
        exists: i + 1 <= total
      });
    }
    return out;
  }

  /** 畫家給出下一張提示 */
  function giveHint(state, playerId, now) {
    if (state.phase !== 'drawing') return err('srv.err.noWordNow', 'phase');
    if (playerId !== state.drawerId) return err('srv.err.onlyDrawerHint', 'forbidden');
    var total = hintTotal(state);
    var next = state.hints + 1;
    if (next > total) {
      return err(total < CONST.HINTS ? 'srv.err.noThirdHint' : 'srv.err.allHintsGiven', 'hint');
    }
    state.hints = next;
    if (next === 3 && state.hintPlan.length) state.revealed = [state.hintPlan[0]];
    return ok({
      state: state, step: next,
      mask: next >= 1 ? maskOf(state) : '',
      index: next === 3 ? state.revealed[0] : -1,
      at: now
    });
  }

  /** 畫家提前宣告畫完（或其他人都猜中了）時手動收掉這一回合 */
  function giveUp(state, playerId, now) {
    if (state.phase !== 'drawing') return err('srv.err.noWordNow', 'phase');
    if (playerId !== state.drawerId) return err('srv.err.onlyDrawerEnd', 'forbidden');
    return endTurn(state, now, 'skipped');
  }

  /* ------------------------------------------------------------ 成員異動 */

  /** 有人離開：從名單與順序裡拿掉；剛好是畫家就收掉這一題 */
  function removePlayer(state, id, now) {
    var idx = -1;
    for (var i = 0; i < state.players.length; i++) if (state.players[i].id === id) idx = i;
    if (idx < 0) return err('srv.err.noSuchPlayer', 'gone');
    state.players.splice(idx, 1);
    var oi = state.order.indexOf(id);
    if (oi >= 0) {
      state.order.splice(oi, 1);
      /* 目前順位（turn）指的就是這一題的畫家。拿掉的人排在他前面，或就是他本人，
         都要往回退一格：這樣 nextTurn 的「+1」才會剛好落在原本的下一位，
         不會跳過人（以前拿掉畫家本人時沒退，下一位就被跳過了）。 */
      if (oi <= state.turn) state.turn -= 1;
    }
    state.guessed = state.guessed.filter(function (g) { return g.id !== id; });
    delete state.wrong[id];

    if (state.over) { recount(state); return ok({ removed: id }); }
    if (state.players.length < CONST.MULTIPLAYER_MIN) {
      finish(state, now);
      return ok({ removed: id, finished: true });
    }
    if (state.drawerId === id && (state.phase === 'picking' || state.phase === 'drawing')) {
      var e = endTurn(state, now, 'drawerleft');
      recount(state);
      return ok({ removed: id, turnEnded: e.ok ? e.entry : null });
    }
    recount(state);
    if (state.phase === 'drawing') {
      /* 少一個猜題者，可能剛好湊齊「全部猜中」 */
      var t = tick(state, now);
      return ok({ removed: id, events: t.events });
    }
    return ok({ removed: id });
  }

  /** 對局進行中有人加入：排在目前順位的最後一位，這一輪還沒排到他就會排進去。
   *  總題數（rounds × 人數）跟著重算，所以人一直加，遊戲就一直往後延。 */
  function addPlayer(state, p) {
    if (state.over) return err('srv.err.gameOver', 'over');
    if (player(state, p.id)) return ok({ state: state, already: true });
    if (state.players.length >= CONST.MAX_PLAYERS) return err('srv.err.seatsFull', 'full');
    /* 同一局裡離開又回來的人（呼叫端會把他離開前的分數與已畫次數帶進來）：
       分數接回去，已經畫過的次數也算數，不會回來就歸零、又被多排一次。 */
    var entry = {
      id: String(p.id),
      name: String(p.name || ''),
      ai: p.ai || null,
      score: Math.max(0, Number(p.score) || 0),
      drew: Math.max(0, Math.floor(Number(p.drew) || 0))
    };
    state.players.push(entry);
    state.order.push(entry.id);
    recount(state);
    return ok({ state: state, player: entry });
  }

  /* ------------------------------------------------------------ 投影 */

  function maskOf(state) {
    var w = word(state);
    if (!w) return '';
    return Words.maskOf(w, state.revealed);
  }

  /**
   * 送給某一位觀看者的投影。
   * 答案只給當回合畫家；其他玩家與觀戰者拿到的是遮罩字串。
   * @param {string|null} viewerId null＝觀戰者
   */
  function toPublic(state, viewerId) {
    var isDrawer = !!viewerId && viewerId === state.drawerId;
    var w = word(state);
    var showAnswer = isDrawer || state.phase === 'reveal' || state.phase === 'over';
    var info = w ? Words.publicInfo(w) : null;

    return {
      seed: state.seed,
      lang: state.lang,
      unlimited: !!state.unlimited,
      phase: state.phase,
      round: state.round,
      rounds: state.rounds,
      turnNo: state.turnNo,
      totalTurns: state.totalTurns,
      drawerId: state.drawerId,
      deadline: state.deadline,
      drawMs: state.drawMs,
      pickMs: state.pickMs,
      revealMs: state.revealMs,
      startedAt: state.startedAt,
      players: state.players.map(function (p) {
        return {
          id: p.id, name: p.name, ai: p.ai, score: p.score, drew: p.drew,
          guessed: hasGuessed(state, p.id),
          isDrawer: p.id === state.drawerId,
          wrong: state.wrong[p.id] || 0
        };
      }),
      strokes: state.strokes,
      /* 題目資訊：字數與種類要等畫家按提示才會出現，答案本身只給有權限的人 */
      hint: info ? {
        step: state.hints,
        total: hintTotal(state),
        steps: hintSteps(state),
        lenShown: state.hints >= 1,
        catShown: state.hints >= 2,
        cat: state.hints >= 2 ? info.cat : null,
        catEmoji: state.hints >= 2 ? info.catEmoji : null,
        diff: info.diff,
        len: state.hints >= 1 ? info.len : 0,
        mask: state.hints >= 1 ? maskOf(state) : '',
        revealed: state.revealed.length
      } : null,
      answer: showAnswer && w ? w.text : null,
      // Only the active drawer receives the reference identifier.
      referenceId: isDrawer && state.phase === 'drawing' && w ? w.id : null,
      /* 選字清單只有畫家看得到，否則等於把三個候選答案送給所有人 */
      choices: (isDrawer && state.phase === 'picking')
        ? state.choices.map(function (id) {
          var c = Words.byId(id, state.lang);
          return { id: id, text: c.text, cat: c.cat, catEmoji: Words.CATEGORIES[c.cat].emoji, diff: c.diff };
        })
        : [],
      guessed: state.guessed.map(function (g) {
        var p = player(state, g.id);
        return { id: g.id, name: p ? p.name : '—', order: g.order, points: g.points };
      }),
      log: state.log.slice(-8),
      over: state.over,
      winners: state.winners,
      you: viewerId ? {
        id: viewerId,
        isDrawer: isDrawer,
        guessed: hasGuessed(state, viewerId),
        canDraw: isDrawer && state.phase === 'drawing',
        canPick: isDrawer && state.phase === 'picking',
        canHint: isDrawer && state.phase === 'drawing' && state.hints < hintTotal(state),
        canGuess: !isDrawer && state.phase === 'drawing' && !!player(state, viewerId) && !hasGuessed(state, viewerId)
      } : { id: null, isDrawer: false, guessed: false, canDraw: false, canPick: false, canHint: false, canGuess: false }
    };
  }

  /** 一句話描述目前狀態：回傳字典代碼與參數（srv.desc.＊），畫面端依語系翻譯 */
  function describe(state, viewerId) {
    var drawer = player(state, state.drawerId);
    var dn = drawer ? drawer.name : '—';
    var isDrawer = viewerId === state.drawerId;
    var d = function (key, params) { return { key: 'srv.desc.' + key, params: params || {} }; };
    if (state.phase === 'over') return d('over');
    if (state.phase === 'reveal') {
      var w = word(state);
      return d('reveal', { word: w ? w.text : '—', n: state.guessed.length });
    }
    if (state.phase === 'picking') return isDrawer ? d('pickMine') : d('pickOther', { name: dn });
    if (isDrawer) return d('drawing', { word: word(state) ? word(state).text : '—' });
    if (hasGuessed(state, viewerId)) return d('guessed');
    return d('guessing', { name: dn });
  }

  return {
    CONST: CONST,
    COLORS: COLORS,
    WIDTHS: WIDTHS,
    TOOLS: TOOLS,
    TOOL_KEYS: TOOL_KEYS,
    PHASES: PHASES,
    createState: createState,
    start: start,
    beginTurn: beginTurn,
    pickWord: pickWord,
    sanitizeStroke: sanitizeStroke,
    toPolylines: toPolylines,
    addStroke: addStroke,
    undoStroke: undoStroke,
    clearBoard: clearBoard,
    guess: guess,
    endTurn: endTurn,
    nextTurn: nextTurn,
    giveUp: giveUp,
    giveHint: giveHint,
    hintSteps: hintSteps,
    hintTotal: hintTotal,
    tick: tick,
    finish: finish,
    removePlayer: removePlayer,
    addPlayer: addPlayer,
    recount: recount,
    owes: owes,
    toPublic: toPublic,
    describe: describe,
    maskOf: maskOf,
    player: player,
    guesserIds: guesserIds,
    hasGuessed: hasGuessed,
    word: word
  };
}));
