/* ===== rules.js — 水果連連看的規則核心 =====
 *
 * 這一份是「唯一的規則來源」：瀏覽器（單機）、伺服器（線上）與 Node 測試都 require 同一份，
 * 所以單機和線上不可能長出兩套會漂移的判定。
 *
 * 沒有任何 DOM 相依，也不碰時間以外的外部狀態；
 * 所有隨機都要傳入 rng（見 rng.js），同一個種子一定長出同一張盤面。
 *
 * 盤面表示法
 * ----------
 * 內部是一張「四周多一圈空白」的網格：W = cols + 2、H = rows + 2。
 * 那一圈永遠是空的，連線路徑因此可以繞到盤面外面 —— 這是連連看的標準規則，
 * 少了它，最外圈的水果常常會變成無解。
 *   index = y * W + x       0 = 空格，>0 = 第幾種水果（1 起算）
 *
 * 連線判定
 * --------
 * 兩個相同的水果，路徑只能走上下左右、只能經過空格，
 * 而且「轉彎不超過 2 次」（也就是最多 3 條線段，一般稱三折以內）。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.Rules = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ------------------------------------------------------------ 常數 */

  var MAX_PLAYERS = 6;          // 線上同盤競速的玩家上限
  var COUNTDOWN_MS = 3000;      // 開賽倒數
  var COMBO_WINDOW_MS = 5000;   // 連擊要在幾毫秒內接上
  var COMBO_STEP = 0.1;         // 每一段連擊加成
  var COMBO_MAX_STEPS = 10;     // 加成上限 ×2.0
  var BASE_SCORE = 100;         // 一對的基礎分
  var TIME_BONUS_PER_SEC = 2;   // 單機過關時每剩 1 秒的加分
  var MAX_TURNS = 2;            // 最多轉彎次數（三折以內）
  var SHUFFLE_TRIES = 400;      // 洗牌後重試找解的次數上限
  var STACK_THEME = 'mahjong';   // 只有這個主題會疊起來玩（見下面的疊疊樂盤面）

  /* 六個關卡：格數、水果種類、時間、提示與洗牌次數一起往上調。
     平面盤面把種類數控制在每種水果最多 2 對（4 顆），讓重複圖案不會太多。
     前三關是給 3～5 歲小朋友的幼幼班：盤面很小、時間長到幾乎沒有壓力、
     提示和洗牌不限次數，而且預設就把水果名稱顯示出來（showNames）。
     「幼幼進階」與「幼幼困難」再把種類數拉到剛好等於對數 —— 每一種水果只有一對、
     完全不重複，小朋友不用先分辨「這顆的另一半是哪一顆」，只要找到同一種就一定
     配得起來；兩關的差別只在盤面大小，難度是「要找多久」而不是「會不會認錯」。 */
  var LEVELS = [
    {
      key: 'kids', no: 1, label: '幼幼班 · 一起認水果', short: '幼幼', emoji: '🍼',
      cols: 4, rows: 3, kinds: 3, sec: 600, hints: 99, shuffles: 99, showNames: true,
      stack: { cols: 4, rows: 3 },
      blurb: '4 × 3，只有 3 種水果。格子很大、時間很長、提示和洗牌不限次數，適合 3～5 歲的小朋友。'
    },
    {
      key: 'kids2', no: 2, label: '幼幼進階 · 每種只有一對', short: '幼幼進階', emoji: '🍌',
      cols: 5, rows: 4, kinds: 10, sec: 600, hints: 99, shuffles: 99, showNames: true,
      stack: { cols: 5, rows: 4 },
      blurb: '5 × 4，10 種水果，每一種剛好只有一對、完全不重複。格子一樣很大、時間一樣很長，適合玩熟幼幼班的小朋友。'
    },
    {
      key: 'kids3', no: 3, label: '幼幼困難 · 找久一點', short: '幼幼困難', emoji: '🍉',
      cols: 6, rows: 5, kinds: 15, sec: 600, hints: 99, shuffles: 99, showNames: true,
      /* 疊牌只到 6 × 4：6 × 5 會多長出第三層、變成 44 張，和第一關一樣多，
         對幼幼班來說太跳了；6 × 4 的 32 張剛好貼著平面盤面的 30 格。 */
      stack: { cols: 6, rows: 4 },
      blurb: '6 × 5，15 種水果，每一種一樣只有一對、完全不重複。格子和時間都還是幼幼班的規格，只是要多找一下。'
    },
    {
      key: 'easy', no: 4, label: '第一關 · 果園入門', short: '簡單', emoji: '🍓',
      cols: 8, rows: 6, kinds: 12, sec: 240, hints: 5, shuffles: 5,
      stack: { cols: 8, rows: 4 },
      blurb: '8 × 6，12 種水果，每種最多出現 2 對。時間很寬鬆，先熟悉三折以內怎麼連。'
    },
    {
      key: 'normal', no: 5, label: '第二關 · 果園日常', short: '普通', emoji: '🍍',
      cols: 10, rows: 8, kinds: 20, sec: 300, hints: 3, shuffles: 3,
      stack: { cols: 10, rows: 5 },
      blurb: '10 × 8，20 種水果，每種最多出現 2 對。提示和洗牌都變少了，要開始看路徑。'
    },
    {
      key: 'hard', no: 6, label: '第三關 · 果園大亂', short: '困難', emoji: '🥑',
      cols: 12, rows: 10, kinds: 30, sec: 360, hints: 2, shuffles: 2,
      stack: { cols: 12, rows: 6 },
      blurb: '12 × 10，30 種水果，每種最多出現 2 對（開始混進蔬菜）。眼睛要放亮一點。'
    }
  ];
  /* 次數 >= UNLIMITED 就當成「不限」，畫面上顯示 ∞ 而不是一個大數字 */
  var UNLIMITED = 99;

  var LEVEL_ORDER = LEVELS.map(function (l) { return l.key; });

  function levelOf(key) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].key === key) return LEVELS[i];
    return LEVELS[0];
  }
  function nextLevel(key) {
    var i = LEVEL_ORDER.indexOf(levelOf(key).key);
    return (i >= 0 && i < LEVEL_ORDER.length - 1) ? LEVEL_ORDER[i + 1] : null;
  }
  function roundMsOf(key) { return levelOf(key).sec * 1000; }

  /* ------------------------------------------------------------ 網格工具 */

  function makeGrid(cols, rows) {
    var W = cols + 2, H = rows + 2;
    var g = new Array(W * H);
    for (var i = 0; i < g.length; i++) g[i] = 0;
    return { grid: g, W: W, H: H, cols: cols, rows: rows };
  }

  function xOf(i, W) { return i % W; }
  function yOf(i, W) { return Math.floor(i / W); }
  function idx(x, y, W) { return y * W + x; }

  /** 盤面內部（不含外圈）的所有格子編號，由左上到右下 */
  function innerCells(W, H) {
    var out = [];
    for (var y = 1; y < H - 1; y++) for (var x = 1; x < W - 1; x++) out.push(y * W + x);
    return out;
  }

  /** p、q 之間（不含兩端）是不是一路都是空格；不同列也不同行就回 false */
  function freeBetween(g, W, p, q) {
    if (p === q) return false;
    var px = xOf(p, W), py = yOf(p, W), qx = xOf(q, W), qy = yOf(q, W);
    var i;
    if (py === qy) {
      var a = Math.min(px, qx), b = Math.max(px, qx);
      for (i = a + 1; i < b; i++) if (g[idx(i, py, W)] !== 0) return false;
      return true;
    }
    if (px === qx) {
      var c = Math.min(py, qy), d = Math.max(py, qy);
      for (i = c + 1; i < d; i++) if (g[idx(px, i, W)] !== 0) return false;
      return true;
    }
    return false;
  }

  /** 從 p 出發，四個方向一路走到底，收集沿途所有「空格」 */
  function straightReach(g, W, H, p) {
    var out = [];
    var px = xOf(p, W), py = yOf(p, W), x, y, i;
    for (x = px - 1; x >= 0; x--) { i = idx(x, py, W); if (g[i] !== 0) break; out.push(i); }
    for (x = px + 1; x < W; x++) { i = idx(x, py, W); if (g[i] !== 0) break; out.push(i); }
    for (y = py - 1; y >= 0; y--) { i = idx(px, y, W); if (g[i] !== 0) break; out.push(i); }
    for (y = py + 1; y < H; y++) { i = idx(px, y, W); if (g[i] !== 0) break; out.push(i); }
    return out;
  }

  /** p 到 q 最多一次轉彎：回傳路徑（含兩端）或 null。p 可以是空格，q 是要連到的水果 */
  function oneTurnPath(g, W, p, q) {
    if (freeBetween(g, W, p, q)) return [p, q];
    var px = xOf(p, W), py = yOf(p, W), qx = xOf(q, W), qy = yOf(q, W);
    if (px === qx || py === qy) return null;         // 同行同列走不出轉彎路徑
    var corners = [idx(px, qy, W), idx(qx, py, W)];
    for (var k = 0; k < 2; k++) {
      var c = corners[k];
      if (g[c] !== 0) continue;                       // 轉角自己必須是空的
      if (freeBetween(g, W, p, c) && freeBetween(g, W, c, q)) return [p, c, q];
    }
    return null;
  }

  /**
   * 兩個格子能不能連起來（轉彎 ≤ 2 次）。
   * @returns {number[]|null} 轉折點的格子編號陣列（含頭尾），連不到就回 null
   */
  function link(g, W, H, a, b) {
    if (a === b) return null;
    if (!g[a] || g[a] !== g[b]) return null;

    /* 判定期間先把兩端當成空格，路徑才能貼著它們自己走 */
    var va = g[a], vb = g[b];
    g[a] = 0; g[b] = 0;
    var path = null;

    if (freeBetween(g, W, a, b)) {
      path = [a, b];                                   // 0 折
    } else {
      path = oneTurnPath(g, W, a, b);                  // 1 折
      if (!path) {
        var mids = straightReach(g, W, H, a);          // 2 折
        for (var i = 0; i < mids.length; i++) {
          var sub = oneTurnPath(g, W, mids[i], b);
          if (sub && sub.length === 3) { path = [a].concat(sub); break; }
        }
      }
    }

    g[a] = va; g[b] = vb;
    return path;
  }

  /** 目前盤面上還有沒有解；有的話回傳其中一組 {a, b, path} */
  function findPair(g, W, H) {
    var byKind = {};
    var cells = innerCells(W, H);
    var i, v;
    for (i = 0; i < cells.length; i++) {
      v = g[cells[i]];
      if (!v) continue;
      (byKind[v] || (byKind[v] = [])).push(cells[i]);
    }
    for (var kind in byKind) {
      if (!Object.prototype.hasOwnProperty.call(byKind, kind)) continue;
      var list = byKind[kind];
      for (i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          var p = link(g, W, H, list[i], list[j]);
          if (p) return { a: list[i], b: list[j], path: p };
        }
      }
    }
    return null;
  }

  function countLeft(g, W, H) {
    var cells = innerCells(W, H), n = 0;
    for (var i = 0; i < cells.length; i++) if (g[cells[i]]) n++;
    return n;
  }

  /**
   * 造型主題只是「數字要畫成什麼」，規則完全不在乎，所以這裡只做字元清洗，
   * 真正有沒有這個主題由 themes.js 判斷（rules.js 刻意不認識任何造型）。
   */
  function sanitizeTheme(t) {
    var str = String(t === undefined || t === null ? '' : t).slice(0, 24);
    return /^[a-z0-9_-]+$/i.test(str) ? str : '';
  }

  /* Fisher–Yates，rng 必須是 [0,1) 的函式 */
  function shuffleArray(list, rng) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  }

  /**
   * 把還在盤面上的水果重新排一次，並保證重排後「至少還有一組能連」。
   * 位置固定不動的玩法一旦死局就只能靠洗牌，所以這裡一定要驗有解。
   */
  function shuffleBoard(g, W, H, rng) {
    var cells = innerCells(W, H);
    var spots = [], vals = [], i;
    for (i = 0; i < cells.length; i++) {
      if (g[cells[i]]) { spots.push(cells[i]); vals.push(g[cells[i]]); }
    }
    if (spots.length < 2) return false;
    for (var t = 0; t < SHUFFLE_TRIES; t++) {
      shuffleArray(vals, rng);
      for (i = 0; i < spots.length; i++) g[spots[i]] = vals[i];
      if (findPair(g, W, H)) return true;
    }
    /* 極少數情況（例如只剩兩顆卡在角落）洗不出解：
       把同種水果兩兩排在一起，這樣一定連得到。 */
    vals.sort(function (a, b) { return a - b; });
    for (i = 0; i < spots.length; i++) g[spots[i]] = vals[i];
    return !!findPair(g, W, H);
  }

  /**
   * 從主題可用的 maxKinds 種造型裡，隨機抽 kinds 種來當這一局的水果。
   *
   * 這樣同一關每次玩到的組合都不一樣（動物 60 種抽 30 種、國旗 72 種抽 30 種…），
   * 而且因為用的是可注入的 rng，同一個種子一定抽到同一組，線上才能全場一致。
   */
  function pickPalette(maxKinds, kinds, rng) {
    var pool = [];
    for (var i = 0; i < Math.max(1, maxKinds); i++) pool.push(i);
    shuffleArray(pool, rng);
    return pool.slice(0, kinds);
  }

  /**
   * 產生一張新盤面。
   * 每一種水果都成雙成對放進去，洗到「開局就有解」為止。
   */
  function createBoard(cols, rows, kinds, rng) {
    var b = makeGrid(cols, rows);
    var total = cols * rows;
    if (total % 2 !== 0) throw new Error('盤面格數必須是偶數：' + cols + '×' + rows);
    var pairs = total / 2;
    var k = Math.max(1, Math.min(kinds, pairs));
    var vals = [];
    for (var i = 0; i < pairs; i++) {
      var kind = (i % k) + 1;
      vals.push(kind, kind);
    }
    var cells = innerCells(b.W, b.H);
    for (var t = 0; t < SHUFFLE_TRIES; t++) {
      shuffleArray(vals, rng);
      for (var j = 0; j < cells.length; j++) b.grid[cells[j]] = vals[j];
      if (findPair(b.grid, b.W, b.H)) return b;
    }
    for (var m = 0; m < cells.length; m++) b.grid[cells[m]] = vals[m];
    return b;
  }

  /* ------------------------------------------------------------ 疊疊樂盤面（麻將模式）
   *
   * 麻將主題在畫面上像真的麻將牌一樣「疊起來」，但每層的規則各自獨立：
   *   - 一張牌佔 2×2 個半格；上面那一層整層往右下偏半格，
   *     所以一張上層牌會壓住下層的 4 張牌（角落與邊上會少於 4 張）。
   *   - 牌的重疊會鎖住被蓋住的牌；但其他層不會成為連線路徑的障礙。
   *   - 兩張牌必須同圖案、同層，並且和其他主題一樣能用
   *     0／1／2 折的直角路徑連起來。
   *
   * 位置存在 state.stack（和 state.grid 同一組索引），grid[i] 仍然是「第幾種」，
   * 0 代表已經被消掉，所以 attempt / 分數 / 快照那一套完全不用改索引的形式。
   */

  /** 疊出一座金字塔的座標表；座標單位是半格 */
  function stackLayout(cols, rows) {
    var layers = [], z = 0, c = cols, r = rows;
    while (c >= 2 && r >= 1 && z < 6) {
      /* 偏移量：每往上一層就內縮一格，再往右下推半格，壓住的才會是 4 張 */
      var off = 2 * z + (z % 2);
      var one = [];
      for (var j = 0; j < r; j++) {
        for (var i = 0; i < c; i++) one.push({ x: off + 2 * i, y: off + 2 * j, z: z });
      }
      /* 每一層都要是偶數張：發牌是同一層兩兩配對，這樣才配得完 */
      if (one.length % 2) one.pop();
      if (one.length) layers.push(one);
      z += 1; c -= 2; r -= 2;
    }
    var out = [];
    layers.forEach(function (one) { out = out.concat(one); });
    return out;
  }

  /** 盤面在半格座標下的寬高（給畫面排版用） */
  function stackExtent(pos) {
    var w = 0, h = 0, i;
    for (i = 0; i < pos.length; i++) {
      if (pos[i].x + 2 > w) w = pos[i].x + 2;
      if (pos[i].y + 2 > h) h = pos[i].y + 2;
    }
    return { W: w, H: h };
  }

  /** i 的幾何位置有沒有和上面的牌重疊；stackFree 以此結果決定能否操作 */
  function stackCovered(pos, grid, i) {
    var a = pos[i], b, j;
    for (j = 0; j < pos.length; j++) {
      if (j === i || !grid[j]) continue;
      b = pos[j];
      if (b.z > a.z && Math.abs(b.x - a.x) < 2 && Math.abs(b.y - a.y) < 2) return true;
    }
    return false;
  }

  /** 上方沒有被壓住即可點選；每層的空格限制由自己的路徑判定。 */
  function stackFree(pos, grid, i) {
    return !!grid[i] && !!pos[i] && !stackCovered(pos, grid, i);
  }

  function stackFreeList(pos, grid) {
    var out = [], i;
    for (i = 0; i < grid.length; i++) if (stackFree(pos, grid, i)) out.push(i);
    return out;
  }

  /**
   * 把同一層投影到半格再細分一次的平面路徑盤面。
   * 只填入配對所在層的牌，其他層完全不參與空格與路徑判定。
   */
  function stackLink(pos, grid, a, b) {
    a = Number(a); b = Number(b);
    if (!isFinite(a) || !isFinite(b) || a < 0 || b < 0 ||
        a >= grid.length || b >= grid.length || a === b) return null;
    if (!grid[a] || grid[a] !== grid[b] || pos[a].z !== pos[b].z) return null;
    if (!stackFree(pos, grid, a) || !stackFree(pos, grid, b)) return null;

    var layer = pos[a].z;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var layerIds = [];
    for (var n = 0; n < grid.length; n++) {
      if (!grid[n] || pos[n].z !== layer) continue;
      layerIds.push(n);
      minX = Math.min(minX, pos[n].x);
      minY = Math.min(minY, pos[n].y);
      maxX = Math.max(maxX, pos[n].x);
      maxY = Math.max(maxY, pos[n].y);
    }

    var scale = 2;
    var W = (maxX - minX + 2) * scale + 3;
    var H = (maxY - minY + 2) * scale + 3;
    var routeGrid = new Array(W * H).fill(0);

    function tileBounds(i) {
      var p = pos[i];
      var left = 1 + (p.x - minX) * scale;
      var top = 1 + (p.y - minY) * scale;
      var right = 1 + (p.x - minX + 2) * scale;
      var bottom = 1 + (p.y - minY + 2) * scale;
      return { left: left, top: top, right: right, bottom: bottom };
    }

    function fillTile(i, value) {
      var bounds = tileBounds(i);
      var left = bounds.left, top = bounds.top;
      var right = bounds.right, bottom = bounds.bottom;
      for (var y = top; y <= bottom; y++) {
        for (var x = left; x <= right; x++) routeGrid[idx(x, y, W)] = value;
      }
    }

    /* 端點不填入障礙，路徑才可以從牌的中心離開；
       不能先填滿再清空端點，否則會把相鄰牌共用的邊界一起清掉，
       讓路徑看起來穿進隔壁的牌面。 */
    layerIds.forEach(function (i) {
      if (i !== a && i !== b) fillTile(i, 1);
    });

    function center(i) {
      return idx(1 + (pos[i].x - minX + 1) * scale,
        1 + (pos[i].y - minY + 1) * scale, W);
    }

    var start = center(a), end = center(b);
    routeGrid[start] = grid[a];
    routeGrid[end] = grid[b];
    var route = link(routeGrid, W, H, start, end);
    if (!route) return null;

    return route.map(function (point) {
      var x = xOf(point, W), y = yOf(point, W);
      return {
        x: x === 0 ? minX - 0.25 : minX + x / scale,
        y: y === 0 ? minY - 0.25 : minY + y / scale
      };
    });
  }

  /** 找一組符合「同圖案、同層、露出、0／1／2 折」的牌；找不到就回 null */
  function stackFindPair(pos, grid) {
    var free = stackFreeList(pos, grid), groups = {}, i, j, key, path;
    for (i = 0; i < free.length; i++) {
      key = pos[free[i]].z + ':' + grid[free[i]];
      if (!groups[key]) groups[key] = [];
      groups[key].push(free[i]);
    }
    for (key in groups) {
      for (i = 0; i < groups[key].length; i++) {
        for (j = i + 1; j < groups[key].length; j++) {
          path = stackLink(pos, grid, groups[key][i], groups[key][j]);
          if (path) return { a: groups[key][i], b: groups[key][j], path: path };
        }
      }
    }
    return null;
  }

  /**
   * 把種類數分配到各層，讓每層的重複對數盡量平均。
   * 同一種牌只會被分配到一層，因此不會破壞同層配對規則。
   */
  function planStackKindCounts(pairCounts, kinds) {
    var totalPairs = pairCounts.reduce(function (sum, count) { return sum + count; }, 0);
    if (!totalPairs) return [];

    var kindCount = Math.max(1, Math.min(kinds, totalPairs));
    var lowerBound = Math.ceil(totalPairs / kindCount);
    for (var maxPairs = lowerBound; maxPairs <= totalPairs; maxPairs++) {
      var counts = [];
      var minimum = 0;
      for (var i = 0; i < pairCounts.length; i++) {
        var minForLayer = Math.ceil(pairCounts[i] / maxPairs);
        counts.push(minForLayer);
        minimum += minForLayer;
      }
      if (minimum > kindCount) continue;

      var extra = kindCount - minimum;
      while (extra > 0) {
        var best = -1;
        var bestRatio = -1;
        for (i = 0; i < pairCounts.length; i++) {
          if (counts[i] >= pairCounts[i]) continue;
          var ratio = pairCounts[i] / counts[i];
          if (ratio > bestRatio) {
            best = i;
            bestRatio = ratio;
          }
        }
        if (best < 0) break;
        counts[best] += 1;
        extra -= 1;
      }
      if (!extra) return counts;
    }

    /* 正常關卡都能在上面的限制內完成；保留安全退路給外部直接呼叫。 */
    return pairCounts.map(function (count) { return count ? 1 : 0; });
  }

  /**
   * 發牌：由最上層往下，把同一層的位置隨機打散後兩兩配成一對。
   * 每一層都是偶數張，所以「由上往下一層一層拆」一定拆得完 ——
   * 開局必定有同層合法路徑，死局時也會自動洗牌，不會卡住。
   */
  function createStack(pos, kinds, rng) {
    var grid = [], byLayer = {}, i, z, ids, j, kind = 0;
    for (i = 0; i < pos.length; i++) {
      grid[i] = 0;
      if (!byLayer[pos[i].z]) byLayer[pos[i].z] = [];
      byLayer[pos[i].z].push(i);
    }

    /*
     * 先把每種牌分配給固定的一層，再在該層內平均重複。
     * 如果同一牌面跨層，玩家會看到兩張都露出的九萬，卻因「同層」規則
     * 無法配對；牌值和畫面應該要一起遵守同一個層級條件。
     */
    var layers = Object.keys(byLayer).map(Number).sort(function (a, b) { return b - a; });
    var pairCounts = layers.map(function (layer) { return byLayer[layer].length / 2; });
    var layerKindCounts = planStackKindCounts(pairCounts, kinds);
    var nextKind = 1;
    for (var layer = 0; layer < layers.length; layer++) {
      z = layers[layer];
      ids = (byLayer[z] || []).slice();
      shuffleArray(ids, rng);
      var layerKinds = [];
      var uniquePairs = layerKindCounts[layer] || 0;
      for (j = 0; j + 1 < ids.length; j += 2) {
        var pairIndex = j / 2;
        if (pairIndex < uniquePairs) {
          kind = nextKind++;
          layerKinds.push(kind);
        } else {
          kind = layerKinds.length ? layerKinds[pairIndex % layerKinds.length] : 1;
        }
        grid[ids[j]] = kind;
        grid[ids[j + 1]] = kind;
      }
    }
    if (!stackFindPair(pos, grid)) shuffleStack(pos, grid, rng);
    var ext = stackExtent(pos);
    return { grid: grid, pos: pos, W: ext.W, H: ext.H };
  }

  /* 隨機洗牌找不到解時，把某層的一對牌放到實際可走的兩個位置。 */
  function forceStackPair(pos, grid, idsByLayer, valsByLayer) {
    var z, ids, vals, free, i, j, a, b, trial, counts, value, pairValue, rest, k, r;
    for (z in idsByLayer) {
      ids = idsByLayer[z];
      vals = valsByLayer[z];
      free = [];
      for (i = 0; i < ids.length; i++) if (stackFree(pos, grid, ids[i])) free.push(ids[i]);
      if (free.length < 2) continue;

      counts = {};
      for (i = 0; i < vals.length; i++) counts[vals[i]] = (counts[vals[i]] || 0) + 1;
      pairValue = null;
      for (value in counts) if (counts[value] >= 2) { pairValue = Number(value); break; }
      if (pairValue === null) continue;

      for (i = 0; i < free.length; i++) {
        for (j = i + 1; j < free.length; j++) {
          a = free[i]; b = free[j];
          trial = grid.slice();
          trial[a] = pairValue;
          trial[b] = pairValue;
          if (!stackLink(pos, trial, a, b)) continue;

          rest = vals.slice();
          r = rest.indexOf(pairValue); rest.splice(r, 1);
          r = rest.indexOf(pairValue); rest.splice(r, 1);
          grid[a] = pairValue;
          grid[b] = pairValue;
          k = 0;
          for (var n = 0; n < ids.length; n++) {
            if (ids[n] === a || ids[n] === b) continue;
            grid[ids[n]] = rest[k++];
          }
          return true;
        }
      }
    }
    return false;
  }

  /** 洗牌：位置不動，只把剩下的牌重新分配，洗到「有得消」為止 */
  function shuffleStack(pos, grid, rng) {
    var idsByLayer = {}, valsByLayer = {}, i, z, ids, vals, t;
    for (i = 0; i < grid.length; i++) if (grid[i]) {
      z = pos[i].z;
      if (!idsByLayer[z]) { idsByLayer[z] = []; valsByLayer[z] = []; }
      idsByLayer[z].push(i);
      valsByLayer[z].push(grid[i]);
    }
    for (t = 0; t < SHUFFLE_TRIES; t++) {
      for (z in idsByLayer) {
        ids = idsByLayer[z];
        vals = valsByLayer[z];
        shuffleArray(vals, rng);
        for (i = 0; i < ids.length; i++) grid[ids[i]] = vals[i];
      }
      if (stackFindPair(pos, grid)) return true;
    }
    if (forceStackPair(pos, grid, idsByLayer, valsByLayer)) return true;
    return !!stackFindPair(pos, grid);
  }

  /** 這個主題要不要疊起來玩 */
  function isStackTheme(theme) { return sanitizeTheme(theme) === STACK_THEME; }

  /** 現在還有沒有能消的一組 */
  function hasPair(state) {
    return state.mode === 'stack'
      ? stackFindPair(state.stack, state.grid)
      : findPair(state.grid, state.W, state.H);
  }

  /** 洗牌：兩種盤面各走各的 */
  function reshuffle(state, rng) {
    if (state.mode === 'stack') return shuffleStack(state.stack, state.grid, rng);
    shuffleBoard(state.grid, state.W, state.H, rng);
    return true;
  }

  /* ------------------------------------------------------------ 對局 */

  function makePlayer(p, level) {
    return {
      id: String(p.id),
      name: String(p.name || '玩家'),
      score: 0,
      pairs: 0,
      misses: 0,
      combo: 0,
      bestCombo: 0,
      lastMatchAt: 0,
      hints: level.hints,
      shuffles: level.shuffles,
      finishedAt: 0
    };
  }

  /**
   * 開一場新的對局。單機和線上共用，差別只在 players 有幾個人。
   * @param {{seed:string, players:Array, level:string, now:number,
   *          theme?:string, maxKinds?:number,
   *          countdownMs?:number, roundMs?:number, rng:Function}} o
   */
  function createMatch(o) {
    var level = levelOf(o.level);
    var rng = o.rng;
    if (typeof rng !== 'function') throw new Error('createMatch 需要注入 rng');
    /* 主題能提供的造型數；沒給就當成剛好夠用 */
    var maxKinds = Math.max(1, Math.floor(o.maxKinds || level.kinds));
    /* 麻將主題改成疊疊樂盤面：牌數與「可不可以點」的規則都不一樣 */
    var stacked = isStackTheme(o.theme) && !!level.stack;
    var pos = stacked ? stackLayout(level.stack.cols, level.stack.rows) : null;
    var pairs = (stacked ? pos.length : level.cols * level.rows) / 2;
    /* 麻將牌面優先使用整副牌的種類，減少同一牌面重複出現；
       平面水果仍依關卡 kinds 控制，維持原本的難度分配。 */
    var kinds = stacked
      ? Math.max(1, Math.min(maxKinds, pairs))
      : Math.max(1, Math.min(level.kinds, maxKinds, pairs));
    var palette = pickPalette(maxKinds, kinds, rng);
    var board = stacked ? createStack(pos, kinds, rng) : createBoard(level.cols, level.rows, kinds, rng);
    var total = stacked ? board.grid.length : level.cols * level.rows;
    var countdown = o.countdownMs === undefined ? COUNTDOWN_MS : Math.max(0, o.countdownMs);
    var roundMs = o.roundMs > 0 ? o.roundMs : roundMsOf(level.key);
    var startAt = o.now + countdown;

    var players = {};
    var order = [];
    (o.players || []).forEach(function (p) {
      var m = makePlayer(p, level);
      players[m.id] = m;
      order.push(m.id);
    });

    return {
      seed: String(o.seed || ''),
      level: level.key,
      theme: sanitizeTheme(o.theme),
      /* palette[kind - 1] = 這一局第 kind 種水果要用主題裡的第幾號造型 */
      palette: palette,
      kinds: kinds,
      mode: stacked ? 'stack' : 'flat',
      /* stack[i] = 第 i 張牌的半格座標與層數；平面模式沒有這一項 */
      stack: stacked ? board.pos : null,
      cols: stacked ? level.stack.cols : level.cols,
      rows: stacked ? level.stack.rows : level.rows,
      W: board.W,
      H: board.H,
      grid: board.grid,
      total: total,
      left: total,
      createdAt: o.now,
      startAt: startAt,
      endAt: startAt + roundMs,
      roundMs: roundMs,
      over: false,
      cleared: false,
      draw: false,
      autoShuffles: 0,
      moves: 0,
      players: players,
      order: order
    };
  }

  function phaseOf(state, now) {
    if (state.over) return 'over';
    if (now < state.startAt) return 'countdown';
    return 'playing';
  }

  function comboMultiplier(combo) {
    return 1 + Math.min(COMBO_MAX_STEPS, combo) * COMBO_STEP;
  }

  function finish(state, now, reason) {
    if (state.over) return state;
    state.over = true;
    state.overAt = now;
    state.reason = reason || (state.left === 0 ? 'cleared' : 'timeup');
    state.cleared = state.left === 0;
    /* 單機過關才有剩餘時間加分；時間到就沒有 */
    if (state.cleared) {
      var leftSec = Math.max(0, Math.round((state.endAt - now) / 1000));
      state.timeLeftSec = leftSec;
      state.order.forEach(function (id) {
        var p = state.players[id];
        if (p.pairs > 0) {
          p.timeBonus = leftSec * TIME_BONUS_PER_SEC;
          p.score += p.timeBonus;
        } else {
          p.timeBonus = 0;
        }
      });
    } else {
      state.timeLeftSec = 0;
      state.order.forEach(function (id) { state.players[id].timeBonus = 0; });
    }
    var rank = standings(state);
    state.draw = rank.length > 1 && rank[0].score === rank[1].score;
    return state;
  }

  /** 主迴圈推進：目前只負責「時間到就結算」，但保留事件陣列讓伺服器統一處理 */
  function tick(state, now) {
    var events = [];
    if (state.over) return events;
    if (now >= state.endAt) {
      finish(state, now, 'timeup');
      events.push({ k: 'end', reason: 'timeup' });
    }
    return events;
  }

  /**
   * 有人送出一組連線。這是唯一會改變盤面的入口，線上模式由伺服器獨佔呼叫。
   * @returns {{ok:boolean, event?:object, error?:string, code?:string}}
   */
  function attempt(state, playerId, a, b, now, rng) {
    var p = state.players[String(playerId)];
    if (!p) return { ok: false, error: '你不在這一局裡。', code: 'nomatch' };
    if (state.over) return { ok: false, error: '這一局已經結束了。', code: 'over' };
    if (now < state.startAt) return { ok: false, error: '還在倒數，先別急。', code: 'countdown' };

    a = Number(a); b = Number(b);
    if (!isFinite(a) || !isFinite(b) || a < 0 || b < 0 || a >= state.grid.length || b >= state.grid.length) {
      return { ok: false, error: '格子編號不合法。', code: 'badcell' };
    }
    state.moves += 1;

    var path = state.mode === 'stack'
      ? stackLink(state.stack, state.grid, a, b)
      : link(state.grid, state.W, state.H, a, b);
    if (!path) {
      /* 連不到不扣分，只斷連擊 —— 對小朋友友善，也避免亂點被懲罰到不想玩 */
      p.combo = 0;
      p.misses += 1;
      return {
        ok: true,
        event: {
          k: 'miss', by: p.id, a: a, b: b,
          score: p.score, combo: 0, misses: p.misses, left: state.left
        }
      };
    }

    var kind = state.grid[a];
    var inCombo = p.lastMatchAt && (now - p.lastMatchAt) <= COMBO_WINDOW_MS;
    var mult = comboMultiplier(inCombo ? p.combo : 0);
    var gain = Math.round(BASE_SCORE * mult);

    state.grid[a] = 0;
    state.grid[b] = 0;
    state.left -= 2;
    p.score += gain;
    p.pairs += 1;
    p.combo = inCombo ? p.combo + 1 : 1;
    p.bestCombo = Math.max(p.bestCombo, p.combo);
    p.lastMatchAt = now;

    var event = {
      k: 'match', by: p.id, a: a, b: b, kind: kind, path: path.slice(),
      gain: gain, mult: Math.round(mult * 100) / 100,
      score: p.score, combo: p.combo, pairs: p.pairs, left: state.left
    };

    var extra = [];
    if (state.left === 0) {
      finish(state, now, 'cleared');
      extra.push({ k: 'end', reason: 'cleared' });
    } else if (!hasPair(state)) {
      /* 死局：位置固定的玩法一定要自動洗牌，否則玩家只能乾等時間到 */
      reshuffle(state, rng || Math.random);
      state.autoShuffles += 1;
      extra.push({ k: 'shuffle', auto: true, by: null, grid: state.grid.slice(), left: state.left });
    }
    return { ok: true, event: event, extra: extra };
  }

  /** 用一次提示：找出一組還能連的水果 */
  function useHint(state, playerId, now) {
    var p = state.players[String(playerId)];
    if (!p) return { ok: false, error: '你不在這一局裡。', code: 'nomatch' };
    if (state.over) return { ok: false, error: '這一局已經結束了。', code: 'over' };
    if (now < state.startAt) return { ok: false, error: '還在倒數，先別急。', code: 'countdown' };
    if (p.hints <= 0) return { ok: false, error: '提示已經用完了。', code: 'nohint' };
    var hit = hasPair(state);
    if (!hit) return { ok: false, error: '現在沒有可以連的水果，用洗牌吧。', code: 'nopair' };
    p.hints -= 1;
    return {
      ok: true,
      event: { k: 'hint', by: p.id, a: hit.a, b: hit.b, hints: p.hints }
    };
  }

  /** 用一次洗牌 */
  function useShuffle(state, playerId, now, rng) {
    var p = state.players[String(playerId)];
    if (!p) return { ok: false, error: '你不在這一局裡。', code: 'nomatch' };
    if (state.over) return { ok: false, error: '這一局已經結束了。', code: 'over' };
    if (now < state.startAt) return { ok: false, error: '還在倒數，先別急。', code: 'countdown' };
    if (p.shuffles <= 0) return { ok: false, error: '洗牌次數已經用完了。', code: 'noshuffle' };
    if (state.left < 2) return { ok: false, error: '剩下的水果太少了，不用洗。', code: 'nopair' };
    p.shuffles -= 1;
    reshuffle(state, rng || Math.random);
    return {
      ok: true,
      event: { k: 'shuffle', auto: false, by: p.id, grid: state.grid.slice(), left: state.left, shuffles: p.shuffles }
    };
  }

  /** 名次：分數 > 配對數 > 失誤少 > 加入順序 */
  function standings(state) {
    var rows = state.order.map(function (id, i) {
      var p = state.players[id];
      return {
        id: p.id, name: p.name, score: p.score, pairs: p.pairs,
        misses: p.misses, bestCombo: p.bestCombo, timeBonus: p.timeBonus || 0, seat: i
      };
    });
    rows.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (b.pairs !== a.pairs) return b.pairs - a.pairs;
      if (a.misses !== b.misses) return a.misses - b.misses;
      return a.seat - b.seat;
    });
    var rank = 0, prev = null;
    rows.forEach(function (r, i) {
      if (prev === null || r.score !== prev) { rank = i + 1; prev = r.score; }
      r.rank = rank;
    });
    return rows;
  }

  /** 給前端／網路用的快照。沒有隱藏資訊，觀戰者看到的和玩家一樣。 */
  function snapshot(state, now) {
    return {
      seed: state.seed,
      level: state.level,
      theme: state.theme,
      palette: state.palette.slice(),
      kinds: state.kinds,
      mode: state.mode || 'flat',
      /* 疊疊樂才有：每一張牌的半格座標與層數，觀戰者也要拿到才畫得出同一疊 */
      stack: state.stack ? state.stack.slice() : null,
      cols: state.cols,
      rows: state.rows,
      W: state.W,
      H: state.H,
      grid: state.grid.slice(),
      total: state.total,
      left: state.left,
      startAt: state.startAt,
      endAt: state.endAt,
      roundMs: state.roundMs,
      phase: phaseOf(state, now),
      over: state.over,
      cleared: state.cleared,
      draw: state.draw,
      autoShuffles: state.autoShuffles,
      remainMs: Math.max(0, state.endAt - now),
      players: state.order.map(function (id) {
        var p = state.players[id];
        return {
          id: p.id, name: p.name, score: p.score, pairs: p.pairs, misses: p.misses,
          combo: p.combo, bestCombo: p.bestCombo, hints: p.hints, shuffles: p.shuffles
        };
      }),
      standings: state.over ? standings(state) : null
    };
  }

  return {
    MAX_PLAYERS: MAX_PLAYERS,
    COUNTDOWN_MS: COUNTDOWN_MS,
    COMBO_WINDOW_MS: COMBO_WINDOW_MS,
    COMBO_MAX_STEPS: COMBO_MAX_STEPS,
    BASE_SCORE: BASE_SCORE,
    TIME_BONUS_PER_SEC: TIME_BONUS_PER_SEC,
    MAX_TURNS: MAX_TURNS,
    UNLIMITED: UNLIMITED,
    LEVELS: LEVELS,
    LEVEL_ORDER: LEVEL_ORDER,
    levelOf: levelOf,
    nextLevel: nextLevel,
    roundMsOf: roundMsOf,

    makeGrid: makeGrid,
    innerCells: innerCells,
    xOf: xOf,
    yOf: yOf,
    idx: idx,
    freeBetween: freeBetween,
    link: link,
    findPair: findPair,
    countLeft: countLeft,
    shuffleBoard: shuffleBoard,
    createBoard: createBoard,
    STACK_THEME: STACK_THEME,
    isStackTheme: isStackTheme,
    stackLayout: stackLayout,
    stackCovered: stackCovered,
    stackFree: stackFree,
    stackFreeList: stackFreeList,
    stackLink: stackLink,
    stackFindPair: stackFindPair,
    createStack: createStack,
    shuffleStack: shuffleStack,
    hasPair: hasPair,
    reshuffle: reshuffle,
    pickPalette: pickPalette,
    sanitizeTheme: sanitizeTheme,

    createMatch: createMatch,
    phaseOf: phaseOf,
    comboMultiplier: comboMultiplier,
    attempt: attempt,
    useHint: useHint,
    useShuffle: useShuffle,
    tick: tick,
    finish: finish,
    standings: standings,
    snapshot: snapshot
  };
}));
