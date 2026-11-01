/* ===== ai.js — 電腦對手：會畫，也會猜 =====
 *
 * 【會畫】
 *   照著 words.js 的形狀配方一筆一筆畫出來，並依難度加上抖動、省略與速度差異。
 *   簡單的電腦畫得慢、會漏掉細節、手很抖；困難的畫得快又完整。
 *   畫出來的線就是真的送進 Rules.addStroke 的筆畫，不是貼圖。
 *
 * 【會猜】
 *   只拿得到「畫布上的線 + 公開提示（類別、字數、已揭開的字）」，
 *   把線轉成形狀特徵，跟同類別題目的配方特徵比對後挑最像的說出來。
 *   它拿不到 state.wordId，猜錯是常態 —— 這是誠實的猜，不是偷看答案。
 *   難度差在：反應多快、猜幾次、用不用字數與已揭字過濾、以及從前幾名裡挑第幾個。
 *
 * 沒有 DOM 相依：瀏覽器（單機）與伺服器（線上房間的 AI 席位）共用同一份。
 */
(function (root, factory) {
  'use strict';
  var node = typeof module === 'object' && module.exports;
  var api = factory(
    node ? require('./rng.js') : root.RNG,
    node ? require('./words.js') : root.Words,
    node ? require('./rules.js') : root.Rules
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AI = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (RNG, Words, Rules) {
  'use strict';

  var LEVELS = {
    easy: {
      key: 'easy',
      label: '簡單',
      note: '手很抖、畫不完整，猜得慢又常猜錯',
      /* --- 當畫家 --- */
      keep: 0.62,          // 只畫配方的前 62% 筆畫（細節先不畫）
      jitter: 46,          // 抖動幅度（正規化單位，1000 為畫布邊長）
      paceRatio: 0.68,     // 把可用時間用掉這麼多比例才畫完
      pickSmart: 0,        // 選題時挑「好畫」題目的傾向
      /* --- 當猜題者 --- */
      firstMs: 16000,      // 最早幾毫秒後開口
      intervalMs: 9000,   // 兩次猜測的間隔
      maxGuesses: 4,
      topK: 8,             // 從距離前幾名裡挑
      useLength: true,     // 用字數過濾候選
      useMask: false,      // 用已揭開的字過濾候選
      minStrokes: 3,
      pickDelayMs: 2600      // 選題要想多久
    },
    normal: {
      key: 'normal',
      label: '普通',
      note: '畫得算完整，猜得中規中矩',
      keep: 0.85,
      jitter: 22,
      paceRatio: 0.55,
      pickSmart: 0.5,
      firstMs: 12000,
      intervalMs: 7000,
      maxGuesses: 6,
      topK: 4,
      useLength: true,
      useMask: false,
      minStrokes: 3,
      pickDelayMs: 1600
    },
    hard: {
      key: 'hard',
      label: '困難',
      note: '畫得又快又完整，會用字數和已揭開的字縮小範圍',
      keep: 1,
      jitter: 9,
      paceRatio: 0.4,
      pickSmart: 1,
      firstMs: 7000,
      intervalMs: 4000,
      maxGuesses: 12,
      topK: 1,
      useLength: true,
      useMask: true,
      minStrokes: 2,
      pickDelayMs: 900
    }
  };

  var LEVEL_KEYS = ['easy', 'normal', 'hard'];

  function levelOf(key) { return LEVELS[key] || LEVELS.normal; }

  /* ================================================================
     當畫家
     ================================================================ */

  /**
   * 選題。簡單的隨便挑；困難的挑「配方筆畫多＝畫出來比較好認」的那一題，
   * 讓越多人猜中、自己拿越多分。差異只在選擇策略，規則完全一樣。
   */
  function chooseWord(choices, level, rng) {
    var L = levelOf(level);
    var next = rng || Math.random;
    if (!choices || !choices.length) return null;
    if (next() > L.pickSmart) {
      return choices[Math.floor(next() * choices.length) % choices.length];
    }
    var best = choices[0];
    var bestScore = -Infinity;
    for (var i = 0; i < choices.length; i++) {
      var strokes = Words.strokesOf(choices[i]);
      var w = Words.byId(choices[i]);
      /* 筆畫多、字數短、難度低 = 比較好讓人猜中 */
      var score = strokes.length * 1.0 - (w ? w.text.length : 3) * 2.2 - (w ? w.diff : 2) * 1.6;
      if (score > bestScore) { bestScore = score; best = choices[i]; }
    }
    return best;
  }

  /** 讓一筆配方線條看起來像手畫的：整筆偏移 + 沿線緩慢擺動 */
  function wobble(points, amount, rng) {
    var next = rng || Math.random;
    var ox = (next() * 2 - 1) * amount * 0.6;
    var oy = (next() * 2 - 1) * amount * 0.6;
    var phase = next() * Math.PI * 2;
    var freq = 0.6 + next() * 1.4;
    var out = new Array(points.length);
    var n = points.length / 2;
    for (var i = 0; i < n; i++) {
      var t = n < 2 ? 0 : i / (n - 1);
      var s = Math.sin(phase + t * Math.PI * 2 * freq);
      var c = Math.cos(phase * 1.3 + t * Math.PI * 2 * freq * 0.8);
      out[i * 2] = Math.max(0, Math.min(Words.BOX, points[i * 2] + ox + s * amount * 0.5));
      out[i * 2 + 1] = Math.max(0, Math.min(Words.BOX, points[i * 2 + 1] + oy + c * amount * 0.5));
    }
    return out;
  }

  /**
   * 排出一份「什麼時候畫哪一筆」的計畫。
   * 呼叫端（伺服器或單機迴圈）到時間就把 stroke 丟進 Rules.addStroke，
   * 所以電腦畫的每一筆都跟人類走同一個入口、受同樣的規則檢查。
   *
   * @param {string} wordId
   * @param {string} level
   * @param {function} rng   可注入的種子亂數，固定情境可重播
   * @param {number} drawMs  這一題可以畫多久
   * @returns {Array<{at:number, stroke:{c:number,w:number,p:number[]}}>}
   */
  function planDrawing(wordId, level, rng, drawMs) {
    var L = levelOf(level);
    var next = rng || Math.random;
    var src = Words.strokesOf(wordId);
    if (!src.length) return [];

    var keep = Math.max(2, Math.round(src.length * L.keep));
    var chosen = src.slice(0, keep);

    /* 把可用時間平均分給每一筆，難度越高畫越快 */
    var span = Math.max(3000, (drawMs || 80000) * L.paceRatio);
    var lead = Math.min(2200, span * 0.06);       // 起筆前的猶豫
    var per = (span - lead) / chosen.length;

    var plan = [];
    for (var i = 0; i < chosen.length; i++) {
      var pts = wobble(chosen[i].p, L.jitter, next);
      var rounded = new Array(pts.length);
      for (var j = 0; j < pts.length; j++) rounded[j] = Math.round(pts[j]);
      plan.push({
        at: Math.round(lead + per * i + per * 0.25 * (next() * 2 - 1)),
        stroke: {
          t: 'pen',
          c: 0,
          /* 第一筆（通常是外框）粗一點，其餘一般粗細 */
          w: i === 0 ? 2 : 1,
          p: rounded
        }
      });
    }
    plan.sort(function (a, b) { return a.at - b.at; });
    return plan;
  }

  /* ================================================================
     當猜題者
     ================================================================ */

  /** 一位 AI 猜題者的記憶：說過什麼、下一次什麼時候開口 */
  function createGuesser(playerId, level) {
    return {
      playerId: String(playerId),
      level: levelOf(level).key,
      turnNo: 0,
      nextAt: 0,
      count: 0,
      said: {}
    };
  }

  /** 換一題就把記憶清掉 */
  function resetGuesser(g, turnNo, now) {
    g.turnNo = turnNo;
    g.count = 0;
    g.said = {};
    g.nextAt = now + levelOf(g.level).firstMs;
  }

  /** 遮罩字串（例如「太＿」）是否與某個候選答案相容 */
  function maskFits(mask, text) {
    if (!mask || mask.length !== text.length) return false;
    for (var i = 0; i < mask.length; i++) {
      var m = mask.charAt(i);
      if (m !== Words.MASK_CHAR && m !== text.charAt(i)) return false;
    }
    return true;
  }

  /**
   * 依公開資訊排出候選答案。
   * 輸入只有「畫布上的線」與「公開提示」，拿不到答案。
   * @param {object} view    Rules.toPublic 的結果（觀看者不是畫家）
   * @param {string} level
   * @returns {Array<{id, text, d}>} 依相似度由近到遠
   */
  function rankCandidates(view, level) {
    var L = levelOf(level);
    var hint = view && view.hint;
    if (!hint) return [];
    var f = Words.features(Rules.toPolylines(view.strokes || []));
    if (!f) return [];

    /* 電腦拿到的公開提示跟人一樣：畫家沒按提示，就沒有種類也沒有字數可用 */
    var pool = hint.cat ? Words.inCategory(hint.cat) : Words.all();
    var whole = pool;
    if (L.useLength && hint.len > 0) {
      pool = pool.filter(function (w) { return w.text.length === hint.len; });
    }
    if (L.useMask && hint.mask && hint.revealed > 0) {
      var narrowed = pool.filter(function (w) { return maskFits(hint.mask, w.text); });
      if (narrowed.length) pool = narrowed;
    }
    if (!pool.length) pool = whole;

    return pool.map(function (w) {
      return { id: w.id, text: w.text, d: Words.distance(f, Words.featuresOf(w.id)) };
    }).sort(function (a, b) { return a.d - b.d; });
  }

  /**
   * 該不該開口猜？要猜什麼？
   * @returns {{text:string, candidate:object}|null}
   */
  function think(g, view, now, rng) {
    var L = levelOf(g.level);
    var next = rng || Math.random;
    if (!view || view.phase !== 'drawing') return null;
    if (view.drawerId === g.playerId) return null;          // 自己是畫家就不猜
    if (view.you && view.you.guessed) return null;          // 已經猜中了
    if (g.turnNo !== view.turnNo) resetGuesser(g, view.turnNo, view.startedAt || now);
    if (g.count >= L.maxGuesses) return null;
    if (now < g.nextAt) return null;
    if ((view.strokes || []).length < L.minStrokes) return null;   // 畫布太空就先別亂猜

    var ranked = rankCandidates(view, g.level);
    if (!ranked.length) return null;

    /* 從前 K 名裡挑一個還沒說過的。K 越大越容易挑到不對的那個。 */
    var top = ranked.slice(0, Math.max(1, L.topK));
    var pool = top.filter(function (c) { return !g.said[c.id]; });
    if (!pool.length) {
      pool = ranked.filter(function (c) { return !g.said[c.id]; }).slice(0, 4);
    }
    if (!pool.length) { g.count = L.maxGuesses; return null; }

    var pickIdx = L.topK <= 1 ? 0 : Math.floor(next() * pool.length) % pool.length;
    var chosen = pool[pickIdx];

    g.said[chosen.id] = true;
    g.count += 1;
    g.nextAt = now + L.intervalMs + Math.round((next() * 2 - 1) * L.intervalMs * 0.25);
    return { text: chosen.text, candidate: chosen };
  }


  /* ================================================================
     AI 驅動器 —— 單機與線上房間共用同一份
     ----------------------------------------------------------------
     持有完整狀態的那一端（單機是瀏覽器、線上是伺服器）每幀／每秒呼叫
     drive() 一次；AI 的每個動作都透過 hooks 走回 Rules 的正式入口，
     跟人類玩家受完全一樣的檢查。
     猜題時只拿 Rules.toPublic(state, aiId) —— 跟人類玩家看到的一模一樣，
     所以 AI 不可能「看到」答案。
     ================================================================ */

  function createDirector() {
    return { plans: {}, cursor: {}, guessers: {}, pickAt: {}, turnNo: 0 };
  }

  /**
   * @param {object} d      createDirector() 的結果
   * @param {object} state  完整的 Rules state
   * @param {number} now
   * @param {string} seed   種子字串，讓同一場對局可重播
   * @param {object} hooks  { pick(aiId, wordId), stroke(aiId, stroke), guess(aiId, text) }
   */
  function drive(d, state, now, seed, hooks) {
    if (!state || state.over) return;
    var h = hooks || {};

    /* 換題就把所有作畫計畫清掉（猜題記憶由 think() 自己依 turnNo 重置） */
    if (d.turnNo !== state.turnNo) {
      d.turnNo = state.turnNo;
      d.plans = {};
      d.cursor = {};
      d.pickAt = {};
    }

    for (var i = 0; i < state.players.length; i++) {
      var p = state.players[i];
      if (!p.ai) continue;
      var L = levelOf(p.ai);
      var rng = RNG.createRng(String(seed) + ':ai:' + p.id + ':' + state.turnNo);

      /* ---- 輪到自己選題 ---- */
      if (state.phase === 'picking' && state.drawerId === p.id) {
        if (d.pickAt[p.id] === undefined) d.pickAt[p.id] = now + L.pickDelayMs;
        if (now >= d.pickAt[p.id] && typeof h.pick === 'function') {
          var wid = chooseWord(state.choices, p.ai, rng);
          if (wid) h.pick(p.id, wid);
        }
        continue;
      }

      if (state.phase !== 'drawing') continue;

      /* ---- 輪到自己作畫 ---- */
      if (state.drawerId === p.id) {
        /* 電腦畫家也會按提示：畫到一定比例就掀一張，人類才不會乾等 */
        if (typeof h.hint === 'function') {
          var at = Rules.CONST.AI_HINT_AT;
          var done = 0;
          var pace = (now - state.startedAt) / state.drawMs;
          for (var q = 0; q < at.length; q++) if (pace >= at[q]) done = q + 1;
          if (done > state.hints) h.hint(p.id);
        }
        if (!d.plans[p.id]) {
          d.plans[p.id] = planDrawing(state.wordId, p.ai, rng, state.drawMs);
          d.cursor[p.id] = 0;
        }
        var plan = d.plans[p.id];
        var elapsed = now - state.startedAt;
        while (d.cursor[p.id] < plan.length && plan[d.cursor[p.id]].at <= elapsed) {
          var step = plan[d.cursor[p.id]];
          d.cursor[p.id] += 1;
          if (typeof h.stroke === 'function') h.stroke(p.id, step.stroke);
        }
        continue;
      }

      /* ---- 當猜題者 ---- */
      if (!d.guessers[p.id] || d.guessers[p.id].level !== L.key) {
        d.guessers[p.id] = createGuesser(p.id, p.ai);
      }
      var view = Rules.toPublic(state, p.id);   // 跟人類玩家一樣的投影，看不到答案
      var say = think(d.guessers[p.id], view, now, rng);
      if (say && typeof h.guess === 'function') h.guess(p.id, say.text);
    }
  }

  /** 電腦畫家目前畫到第幾筆（畫面顯示「作畫中」進度用） */
  function drawProgress(d, playerId) {
    var plan = d.plans[playerId];
    if (!plan || !plan.length) return 0;
    return Math.min(1, (d.cursor[playerId] || 0) / plan.length);
  }

  return {
    LEVELS: LEVELS,
    LEVEL_KEYS: LEVEL_KEYS,
    levelOf: levelOf,
    chooseWord: chooseWord,
    planDrawing: planDrawing,
    wobble: wobble,
    createGuesser: createGuesser,
    resetGuesser: resetGuesser,
    rankCandidates: rankCandidates,
    maskFits: maskFits,
    think: think,
    createDirector: createDirector,
    drive: drive,
    drawProgress: drawProgress
  };
}));
