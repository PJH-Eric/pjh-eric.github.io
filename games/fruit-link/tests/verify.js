/*
 * tests/verify.js — 規則核心與房間邏輯的單元測試
 * 不需要任何套件，直接 `node tests/verify.js` 就能跑。
 *
 * 涵蓋：連線判定（0/1/2 折、3 折要擋掉、不能穿過水果、可以繞盤面外圈）、
 *       盤面生成、死局自動洗牌、洗牌保證有解、計分與連擊、提示、名次、
 *       房間權限、觀戰、邀請 token 的有效期／次數／撤銷、斷線回收。
 */
'use strict';

require('./seo.js');

const assert = require('assert');
const path = require('path');
const Rules = require(path.join(__dirname, '..', 'public', 'js', 'rules.js'));
const RNG = require(path.join(__dirname, '..', 'public', 'js', 'rng.js'));
const { RoomStore, sanitizeName, sanitizeText } = require(path.join(__dirname, '..', 'lib', 'rooms.js'));
const Themes = require(path.join(__dirname, '..', 'public', 'js', 'themes.js'));

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ✅ ' + name); }
  catch (e) { fail++; console.log('  ❌ ' + name + '\n     ' + (e && e.message)); }
}
function group(name) { console.log('\n▍' + name); }

/* 用文字圖建盤面，一眼就看得出在測什麼。'.' = 空格，其他字元 = 一種水果。外圈自動補。 */
function fromArt(rowsArt) {
  const rows = rowsArt.length, cols = rowsArt[0].length;
  const b = Rules.makeGrid(cols, rows);
  const kinds = {};
  let next = 1;
  rowsArt.forEach((line, y) => {
    assert.strictEqual(line.length, cols, '每一列長度要一樣');
    for (let x = 0; x < cols; x++) {
      const ch = line[x];
      if (ch === '.') continue;
      if (!kinds[ch]) kinds[ch] = next++;
      b.grid[(y + 1) * b.W + (x + 1)] = kinds[ch];
    }
  });
  b.at = (x, y) => (y + 1) * b.W + (x + 1);
  return b;
}

/* ------------------------------------------------------------ 連線判定 */

group('連線判定：折數與路徑');

test('0 折：同一列中間沒有東西擋就能連', () => {
  const b = fromArt(['A..A']);
  const p = Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(3, 0));
  assert.ok(p, '應該連得到');
  assert.strictEqual(p.length, 2, '0 折的路徑只有頭尾兩點');
});

test('0 折：緊鄰的兩個也算（中間沒有格子）', () => {
  const b = fromArt(['AA']);
  assert.ok(Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(1, 0)));
});

test('直線中間被別的水果擋住就連不到', () => {
  const b = fromArt(['ABA']);
  const p = Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(2, 0));
  assert.ok(p, '這一張圖可以繞外圈，所以還是連得到');
  assert.strictEqual(p.length, 4, '被擋住就得繞外圈，變成 2 折');
});

test('1 折：轉一次彎連得到，路徑有 3 個點', () => {
  const b = fromArt(['A.', '..', '.A']);
  const p = Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(1, 2));
  assert.ok(p, '應該連得到');
  assert.strictEqual(p.length, 3, '1 折的路徑有 3 個點');
});

test('2 折：可以繞出盤面外圈，最外圈的水果不會被困住', () => {
  const b = fromArt(['ABA']);
  const p = Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(2, 0));
  assert.ok(p);
  const ys = p.map((i) => Math.floor(i / b.W));
  assert.ok(ys.indexOf(0) >= 0, '路徑真的有走到外圈那一列');
});

test('被水果牆完全包住就連不到', () => {
  const b = fromArt(['BBBB', 'BABA', 'BBBB']);
  assert.strictEqual(Rules.link(b.grid, b.W, b.H, b.at(1, 1), b.at(3, 1)), null);
});

/**
 * 參考實作：用「轉彎次數」當成本做分層 BFS，算出 a 到 b 的最少轉彎次數。
 * 這是獨立於 rules.js 的另一套算法，拿來交叉驗證 link() 的判定有沒有偏掉。
 */
function minTurns(g, W, H, a, b) {
  if (a === b) return Infinity;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const seen = new Set();
  let frontier = [];
  for (let d = 0; d < 4; d++) frontier.push([a, d]);
  for (let turns = 0; turns <= 8 && frontier.length; turns++) {
    const next = [];
    for (const [cell, d] of frontier) {
      let x = cell % W, y = Math.floor(cell / W);
      for (;;) {
        x += dirs[d][0]; y += dirs[d][1];
        if (x < 0 || y < 0 || x >= W || y >= H) break;
        const i = y * W + x;
        if (i === b) return turns;
        if (g[i] !== 0) break;                 // 路徑只能經過空格
        const key = i * 4 + d;
        if (seen.has(key)) break;
        seen.add(key);
        for (let nd = 0; nd < 4; nd++) if (nd !== d) next.push([i, nd]);
      }
    }
    frontier = next;
  }
  return Infinity;
}

test('轉彎超過 2 次的路徑要擋掉（用獨立的 BFS 交叉驗證）', () => {
  //  一條螺旋走廊：兩顆 A 之間唯一的通路要轉 4 次彎，超過三折以內的規則
  //  B B B B B B
  //  B A . . . B
  //  B B B B . B
  //  B . . . . B
  //  B . B B B B
  //  B . . . A B
  const b = fromArt([
    'BBBBBB',
    'BA...B',
    'BBBB.B',
    'B....B',
    'B.BBBB',
    'B...AB'
  ]);
  const kind = b.grid[b.at(1, 1)];
  const spots = Rules.innerCells(b.W, b.H).filter((i) => b.grid[i] === kind);
  assert.strictEqual(spots.length, 2, '這張圖上應該只有兩顆 A');
  assert.ok(minTurns(b.grid, b.W, b.H, spots[0], spots[1]) > Rules.MAX_TURNS, '這一組本來就要轉超過 2 次');
  assert.strictEqual(Rules.link(b.grid, b.W, b.H, spots[0], spots[1]), null, 'link 要擋掉');
});

test('隨機盤面上，link 的判定和獨立 BFS 完全一致', () => {
  let checked = 0;
  ['seedA', 'seedB', 'seedC'].forEach((seed) => {
    const rng = RNG.createRng(seed);
    const board = Rules.createBoard(8, 6, 5, rng);
    /* 隨機挖掉一些格子，製造各種形狀的空隙 */
    const cells = Rules.innerCells(board.W, board.H);
    cells.forEach((i) => { if (rng() < 0.35) board.grid[i] = 0; });

    const byKind = {};
    cells.forEach((i) => { const v = board.grid[i]; if (v) (byKind[v] || (byKind[v] = [])).push(i); });
    Object.keys(byKind).forEach((k) => {
      const list = byKind[k];
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const got = Rules.link(board.grid, board.W, board.H, list[i], list[j]);
          const want = minTurns(board.grid, board.W, board.H, list[i], list[j]) <= Rules.MAX_TURNS;
          assert.strictEqual(!!got, want,
            seed + ' 的 ' + list[i] + '→' + list[j] + ' 判定不一致（link=' + !!got + ' bfs=' + want + '）');
          if (got) assert.ok(got.length <= Rules.MAX_TURNS + 2, '路徑最多 ' + (Rules.MAX_TURNS + 2) + ' 個點');
          checked++;
        }
      }
    });
  });
  assert.ok(checked > 200, '至少要驗過 200 組，實際 ' + checked + ' 組');
});

test('不同種類、同一格、空格都不能連', () => {
  const b = fromArt(['AB', '..']);
  assert.strictEqual(Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(1, 0)), null, '不同種類');
  assert.strictEqual(Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(0, 0)), null, '同一格');
  assert.strictEqual(Rules.link(b.grid, b.W, b.H, b.at(0, 1), b.at(1, 1)), null, '兩個都是空格');
});

test('路徑的轉折點一定是空格，不會穿過任何水果', () => {
  const b = fromArt(['A.A', '.B.']);
  const p = Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(2, 0));
  assert.ok(p);
  p.slice(1, -1).forEach((i) => assert.strictEqual(b.grid[i], 0, '轉折點必須是空格'));
});

test('link 判定完不會弄壞盤面（兩端的水果要留著）', () => {
  const b = fromArt(['A..A']);
  const before = b.grid.slice();
  Rules.link(b.grid, b.W, b.H, b.at(0, 0), b.at(3, 0));
  assert.deepStrictEqual(b.grid, before);
});

/* ------------------------------------------------------------ 找解與洗牌 */

group('找解、死局與洗牌');

test('findPair 找到的那一組真的連得起來', () => {
  const b = fromArt(['A..A', '.BB.']);
  const hit = Rules.findPair(b.grid, b.W, b.H);
  assert.ok(hit, '應該找得到');
  assert.ok(Rules.link(b.grid, b.W, b.H, hit.a, hit.b));
});

test('空盤面沒有解', () => {
  const b = fromArt(['....', '....']);
  assert.strictEqual(Rules.findPair(b.grid, b.W, b.H), null);
});

test('shuffleBoard 洗完一定有解，水果的種類與數量不變', () => {
  const rng = RNG.createRng('shuffle-test');
  const b = Rules.createBoard(8, 6, 6, rng);
  const count = (g) => {
    const c = {};
    Rules.innerCells(b.W, b.H).forEach((i) => { if (g[i]) c[g[i]] = (c[g[i]] || 0) + 1; });
    return c;
  };
  const before = count(b.grid);
  assert.strictEqual(Rules.shuffleBoard(b.grid, b.W, b.H, rng), true);
  assert.deepStrictEqual(count(b.grid), before, '洗牌不能憑空生出或吃掉水果');
  assert.ok(Rules.findPair(b.grid, b.W, b.H), '洗完一定要有解');
});

test('createBoard：格數偶數、每種成雙、開局就有解', () => {
  Rules.LEVELS.forEach((L) => {
    const b = Rules.createBoard(L.cols, L.rows, L.kinds, RNG.createRng('board:' + L.key));
    const c = {};
    Rules.innerCells(b.W, b.H).forEach((i) => { c[b.grid[i]] = (c[b.grid[i]] || 0) + 1; });
    assert.strictEqual(Object.keys(c).length, L.kinds, L.key + ' 的水果種類數不對');
    Object.keys(c).forEach((k) => assert.strictEqual(c[k] % 2, 0, L.key + ' 第 ' + k + ' 種不是偶數個'));
    assert.ok(Rules.findPair(b.grid, b.W, b.H), L.key + ' 開局就沒解');
    assert.strictEqual((L.cols * L.rows) % 2, 0, L.key + ' 的格數不是偶數');
  });
});

test('平面關卡：每種水果最多出現 2 對', () => {
  Rules.LEVELS.forEach((L) => {
    const b = Rules.createBoard(L.cols, L.rows, L.kinds, RNG.createRng('repeat:' + L.key));
    const counts = {};
    Rules.innerCells(b.W, b.H).forEach((i) => { counts[b.grid[i]] = (counts[b.grid[i]] || 0) + 1; });
    assert.ok(L.kinds >= Math.ceil((L.cols * L.rows) / 4),
      L.key + ' 的種類數不足以讓每種最多 2 對');
    Object.keys(counts).forEach((kind) => {
      assert.ok(counts[kind] >= 2 && counts[kind] <= 4 && counts[kind] % 2 === 0,
        L.key + ' 第 ' + kind + ' 種應該是 1～2 對，實際 ' + counts[kind] + ' 顆');
    });
  });
});

test('同一個種子一定長出同一張盤面（可重現、可重播）', () => {
  const a = Rules.createBoard(10, 8, 10, RNG.createRng('same-seed'));
  const b = Rules.createBoard(10, 8, 10, RNG.createRng('same-seed'));
  assert.deepStrictEqual(a.grid, b.grid);
});

/* ------------------------------------------------------------ 對局與計分 */

group('對局、計分與連擊');

function newMatch(level, players, seedText) {
  const rng = RNG.createRng(seedText || 'match-test');
  const state = Rules.createMatch({
    seed: 'TEST', players: players || [{ id: 'p1', name: '甲' }],
    level: level || 'easy', now: 0, countdownMs: 0, rng
  });
  return { state, rng };
}

test('倒數期間不能出手', () => {
  const rng = RNG.createRng('countdown');
  const st = Rules.createMatch({ seed: 'T', players: [{ id: 'p1', name: '甲' }], level: 'easy', now: 0, countdownMs: 3000, rng });
  const hit = Rules.findPair(st.grid, st.W, st.H);
  const res = Rules.attempt(st, 'p1', hit.a, hit.b, 1000, rng);
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.code, 'countdown');
});

test('連成一對：基礎 100 分、盤面少 2 個、配對數 +1', () => {
  const { state: st, rng } = newMatch();
  const hit = Rules.findPair(st.grid, st.W, st.H);
  const before = st.left;
  const res = Rules.attempt(st, 'p1', hit.a, hit.b, 1000, rng);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.event.k, 'match');
  assert.strictEqual(res.event.gain, 100);
  assert.strictEqual(st.left, before - 2);
  assert.strictEqual(st.players.p1.pairs, 1);
  assert.strictEqual(st.grid[hit.a], 0);
  assert.strictEqual(st.grid[hit.b], 0);
  assert.ok(res.event.path && res.event.path.length >= 2, '事件要帶路徑給前端畫線');
});

test('連擊：5 秒內接上有加成，超過就歸零；最高連擊會記著', () => {
  const { state: st, rng } = newMatch();
  let t = 1000;
  let hit = Rules.findPair(st.grid, st.W, st.H);
  Rules.attempt(st, 'p1', hit.a, hit.b, t, rng);
  assert.strictEqual(st.players.p1.combo, 1);

  t += 1000;
  hit = Rules.findPair(st.grid, st.W, st.H);
  const r2 = Rules.attempt(st, 'p1', hit.a, hit.b, t, rng);
  assert.strictEqual(st.players.p1.combo, 2, '5 秒內要接得上');
  assert.strictEqual(r2.event.gain, 110, '第二對要有 +10%');

  t += Rules.COMBO_WINDOW_MS + 1000;
  hit = Rules.findPair(st.grid, st.W, st.H);
  const r3 = Rules.attempt(st, 'p1', hit.a, hit.b, t, rng);
  assert.strictEqual(st.players.p1.combo, 1, '超過 5 秒要歸零');
  assert.strictEqual(r3.event.gain, 100);
  assert.strictEqual(st.players.p1.bestCombo, 2);
});

test('連擊加成有上限（最多 ×2.0）', () => {
  assert.strictEqual(Rules.comboMultiplier(0), 1);
  assert.strictEqual(Math.round(Rules.comboMultiplier(10) * 100) / 100, 2);
  assert.strictEqual(Math.round(Rules.comboMultiplier(50) * 100) / 100, 2, '超過上限不會再加');
});

/** 在盤面上找一組「同種但連不到」的水果 */
function findUnlinkable(st) {
  const byKind = {};
  Rules.innerCells(st.W, st.H).forEach((i) => {
    const v = st.grid[i];
    if (v) (byKind[v] || (byKind[v] = [])).push(i);
  });
  const keys = Object.keys(byKind);
  for (let k = 0; k < keys.length; k++) {
    const list = byKind[keys[k]];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (!Rules.link(st.grid, st.W, st.H, list[i], list[j])) return [list[i], list[j]];
      }
    }
  }
  return null;
}

test('連錯：不扣分、連擊歸零、失誤 +1，而且不會把水果弄掉', () => {
  const { state: st, rng } = newMatch('hard', null, 'miss-test');
  const hit = Rules.findPair(st.grid, st.W, st.H);
  Rules.attempt(st, 'p1', hit.a, hit.b, 1000, rng);
  const scoreBefore = st.players.p1.score;

  const bad = findUnlinkable(st);
  assert.ok(bad, '困難關的盤面上應該找得到一組連不到的同種水果');
  const res = Rules.attempt(st, 'p1', bad[0], bad[1], 1100, rng);
  assert.strictEqual(res.event.k, 'miss');
  assert.strictEqual(st.players.p1.score, scoreBefore, '連錯不扣分');
  assert.strictEqual(st.players.p1.combo, 0, '連錯要斷連擊');
  assert.strictEqual(st.players.p1.misses, 1);
  assert.notStrictEqual(st.grid[bad[0]], 0, '連錯不能把水果弄掉');
});

test('提示：扣次數、給的一定連得到、用完就不能再用', () => {
  const { state: st } = newMatch('easy');
  const L = Rules.levelOf('easy');
  for (let n = 0; n < L.hints; n++) {
    const res = Rules.useHint(st, 'p1', 1000);
    assert.strictEqual(res.ok, true, '第 ' + (n + 1) + ' 次提示應該可以用');
    assert.ok(Rules.link(st.grid, st.W, st.H, res.event.a, res.event.b), '提示給的那一組要真的能連');
  }
  assert.strictEqual(st.players.p1.hints, 0);
  assert.strictEqual(Rules.useHint(st, 'p1', 1000).code, 'nohint');
});

test('洗牌：扣次數、盤面有變、洗完還有解', () => {
  const { state: st, rng } = newMatch('easy');
  const before = st.grid.slice();
  assert.strictEqual(Rules.useShuffle(st, 'p1', 1000, rng).ok, true);
  assert.strictEqual(st.players.p1.shuffles, Rules.levelOf('easy').shuffles - 1);
  assert.ok(Rules.findPair(st.grid, st.W, st.H));
  assert.notDeepStrictEqual(st.grid, before);
});

test('整場玩下來都不會卡死局，而且自動洗牌不扣玩家次數', () => {
  Rules.LEVEL_ORDER.forEach((lv) => {
    const { state: st, rng } = newMatch(lv, null, 'deadlock:' + lv);
    const shufflesAtStart = st.players.p1.shuffles;
    let t = 1000, guard = 0;
    while (!st.over && guard++ < 5000) {
      const hit = Rules.findPair(st.grid, st.W, st.H);
      assert.ok(hit, lv + '：每一步之前盤面都必須有解（死局要被自動洗掉）');
      Rules.attempt(st, 'p1', hit.a, hit.b, t, rng);
      t += 100;
    }
    assert.strictEqual(st.left, 0, lv + '：應該可以把盤面清空');
    assert.strictEqual(st.players.p1.shuffles, shufflesAtStart, lv + '：自動洗牌不能扣玩家次數');
  });
});

test('清空盤面就結束，而且有剩餘時間加分', () => {
  const { state: st, rng } = newMatch('easy', null, 'clear-run');
  let t = 1000, guard = 0;
  while (!st.over && guard++ < 5000) {
    const hit = Rules.findPair(st.grid, st.W, st.H);
    Rules.attempt(st, 'p1', hit.a, hit.b, t, rng);
    t += 100;
  }
  assert.strictEqual(st.cleared, true);
  assert.strictEqual(st.reason, 'cleared');
  assert.ok(st.players.p1.timeBonus > 0, '過關要有剩餘時間加分');
});

test('時間到就結束、沒有時間加分，之後不能再出手', () => {
  const { state: st, rng } = newMatch('easy');
  const hit = Rules.findPair(st.grid, st.W, st.H);
  Rules.attempt(st, 'p1', hit.a, hit.b, 1000, rng);
  const evs = Rules.tick(st, st.endAt + 10);
  assert.strictEqual(st.over, true);
  assert.strictEqual(st.cleared, false);
  assert.strictEqual(st.players.p1.timeBonus, 0);
  assert.ok(evs.some((e) => e.k === 'end'));
  assert.strictEqual(Rules.attempt(st, 'p1', hit.a, hit.b, st.endAt + 20, rng).ok, false);
});

test('名次：分數 > 配對數 > 失誤少；同分同名次', () => {
  const { state: st } = newMatch('easy', [
    { id: 'a', name: '甲' }, { id: 'b', name: '乙' }, { id: 'c', name: '丙' }
  ]);
  st.players.a.score = 300; st.players.a.pairs = 3;
  st.players.b.score = 300; st.players.b.pairs = 2;
  st.players.c.score = 500; st.players.c.pairs = 5;
  const rank = Rules.standings(st);
  assert.deepStrictEqual(rank.map((r) => r.id), ['c', 'a', 'b']);
  assert.deepStrictEqual(rank.map((r) => r.rank), [1, 2, 2]);
});

test('同盤搶消：一個人連掉之後，另一個人送同一組只會撲空', () => {
  const { state: st, rng } = newMatch('easy', [{ id: 'a', name: '甲' }, { id: 'b', name: '乙' }]);
  const hit = Rules.findPair(st.grid, st.W, st.H);
  assert.strictEqual(Rules.attempt(st, 'a', hit.a, hit.b, 1000, rng).event.k, 'match');
  assert.strictEqual(Rules.attempt(st, 'b', hit.a, hit.b, 1005, rng).event.k, 'miss', '慢一步只會撲空');
  assert.strictEqual(st.players.b.score, 0, '撲空不加分也不扣分');
});

test('不合法的格子編號會被擋下來', () => {
  const { state: st, rng } = newMatch();
  [[-1, 5], [5, 999999], ['x', 'y']].forEach((pair) => {
    const res = Rules.attempt(st, 'p1', pair[0], pair[1], 1000, rng);
    assert.strictEqual(res.ok, false, JSON.stringify(pair) + ' 應該被擋');
    assert.strictEqual(res.code, 'badcell');
  });
});

test('不在這一局裡的人不能出手', () => {
  const { state: st, rng } = newMatch();
  assert.strictEqual(Rules.attempt(st, '路人', 20, 21, 1000, rng).code, 'nomatch');
});

test('snapshot 帶得出畫面要的欄位，而且是複本', () => {
  const { state: st } = newMatch();
  const s = Rules.snapshot(st, st.startAt + 1000);
  ['seed', 'level', 'cols', 'rows', 'W', 'H', 'grid', 'left', 'startAt', 'endAt', 'phase', 'players']
    .forEach((k) => assert.ok(k in s, 'snapshot 少了 ' + k));
  assert.strictEqual(s.phase, 'playing');
  assert.strictEqual(s.grid.length, st.W * st.H);
  s.grid[0] = 999;
  assert.notStrictEqual(st.grid[0], 999, 'snapshot 要是複本，不能被外面改到');
});

/* ------------------------------------------------------------ 房間 */

group('房間、座位、觀戰與邀請');

function newStore() { return new RoomStore({}); }
function mkRoom(store, opts) {
  const res = store.create('host-client-01', Object.assign({ name: '房主', roomName: '測試房', level: 'easy', now: 0 }, opts || {}));
  assert.strictEqual(res.ok, true);
  return res.room;
}

test('建房：房主自動入座、房號 5 碼、公開房會出現在大廳', () => {
  const store = newStore();
  const room = mkRoom(store);
  assert.strictEqual(room.code.length, 5);
  assert.strictEqual(room.players().length, 1);
  assert.strictEqual(room.isHost('host-client-01'), true);
  assert.strictEqual(store.list().length, 1);
});

test('私人房沒有邀請連結進不去，也不列在大廳', () => {
  const store = newStore();
  const room = mkRoom(store, { private: true });
  const denied = room.join('other', { name: '路人', now: 100 });
  assert.strictEqual(denied.ok, false);
  assert.strictEqual(denied.code, 'private');
  assert.strictEqual(store.list().length, 0);
});

test('玩家席位滿了會轉觀戰，而且一定回報 downgraded', () => {
  const store = newStore();
  const room = mkRoom(store);
  for (let i = 1; i < Rules.MAX_PLAYERS; i++) {
    assert.strictEqual(room.join('c' + i, { name: '玩家' + i, now: 10 }).member.role, 'player');
  }
  assert.strictEqual(room.seatsFree(), 0);
  const extra = room.join('cX', { name: '晚到的', now: 20 });
  assert.strictEqual(extra.member.role, 'spectator');
  assert.strictEqual(extra.downgraded, true, '不能默默把觀戰者當成玩家');
});

test('對局進行中進來的人先觀戰，下一局才能下場', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.setReady('host-client-01', true);
  assert.strictEqual(room.start('host-client-01', 0, { countdownMs: 0 }).ok, true);
  const late = room.join('late', { name: '遲到的', now: 100 });
  assert.strictEqual(late.member.role, 'spectator');
  assert.strictEqual(late.waiting, true);
  assert.strictEqual(room.becomePlayer('late').code, 'phase');
});

test('觀戰者不能出手、不能用提示與洗牌', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('spec', { name: '觀眾', role: 'spectator', now: 10 });
  room.setReady('host-client-01', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  room.step(10);
  const hit = Rules.findPair(room.state.grid, room.state.W, room.state.H);
  assert.strictEqual(room.attempt('spec', hit.a, hit.b, 100).code, 'role');
  assert.strictEqual(room.hint('spec', 100).code, 'role');
  assert.strictEqual(room.shuffle('spec', 100).code, 'role');
});

test('線上玩家不能使用提示與手動洗牌', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.setReady('host-client-01', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  assert.strictEqual(room.hint('host-client-01', 100).code, 'disabled');
  assert.strictEqual(room.shuffle('host-client-01', 100).code, 'disabled');
});

test('只有房主能改關卡、能開始；對局中不能改', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('c2', { name: '客人', now: 10 });
  assert.strictEqual(room.setLevel('c2', 'hard').code, 'perm');
  assert.strictEqual(room.start('c2', 0).code, 'perm');
  assert.strictEqual(room.setLevel('host-client-01', 'hard').ok, true);
  assert.strictEqual(room.level, 'hard');
  assert.strictEqual(room.setLevel('host-client-01', 'nope').code, 'badlevel');
  room.setReady('host-client-01', true);
  room.setReady('c2', true);
  assert.strictEqual(room.start('host-client-01', 0, { countdownMs: 0 }).ok, true);
  assert.strictEqual(room.setLevel('host-client-01', 'easy').code, 'phase');
});

test('有人沒按準備就不能開始，而且會講清楚是誰', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('c2', { name: '客人', now: 10 });
  room.setReady('host-client-01', true);
  const res = room.start('host-client-01', 0);
  assert.strictEqual(res.code, 'notready');
  assert.ok(res.error.indexOf('客人') >= 0);
});

test('權限旗標由伺服器算好；觀戰者和玩家看到同一張盤面', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('spec', { name: '觀眾', role: 'spectator', now: 10 });
  room.setReady('host-client-01', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  room.step(10);
  const specView = room.viewFor('spec', 100);
  const hostView = room.viewFor('host-client-01', 100);
  assert.strictEqual(specView.you.can.play, false);
  assert.strictEqual(hostView.you.can.play, true);
  assert.strictEqual(specView.invites.length, 0, '非房主看不到邀請清單');
  assert.deepStrictEqual(specView.match.grid, hostView.match.grid);
});

test('邀請連結：有效期、使用次數、撤銷都由伺服器驗', () => {
  const store = newStore();
  const room = mkRoom(store);
  const made = room.createInvite('host-client-01', { role: 'player', ttlMs: 60000, maxUses: 2, now: 0 });
  assert.strictEqual(made.ok, true);
  const token = made.invite.token;

  assert.strictEqual(room.checkInvite('deadbeef', 0).code, 'badinvite');
  assert.strictEqual(room.checkInvite(token, 0).ok, true);
  assert.strictEqual(room.checkInvite(token, 70000).code, 'expired');

  assert.strictEqual(room.join('g1', { name: '客一', token, now: 10 }).ok, true);
  assert.strictEqual(room.join('g2', { name: '客二', token, now: 20 }).ok, true);
  assert.strictEqual(room.join('g3', { name: '客三', token, now: 30 }).code, 'used');

  const t2 = room.createInvite('host-client-01', { role: 'spectator', now: 40 }).invite.token;
  assert.strictEqual(room.checkInvite(t2, 40).invite.role, 'spectator');
  room.revokeInvite('host-client-01', t2);
  assert.strictEqual(room.checkInvite(t2, 41).code, 'revoked');
  assert.strictEqual(room.revokeInvite('g1', token).code, 'perm', '只有房主能撤銷');
});

test('觀戰用的邀請連結進來一定是觀戰身分', () => {
  const store = newStore();
  const room = mkRoom(store);
  const t = room.createInvite('host-client-01', { role: 'spectator', now: 0 }).invite.token;
  const joined = room.join('g1', { name: '觀眾', role: 'player', token: t, now: 10 });
  assert.strictEqual(joined.member.role, 'spectator', 'token 說了算，不能自己升成玩家');
});

test('聊天：擋空訊息、洗版與禁言；只有房主能禁言', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('c2', { name: '客人', now: 0 });
  assert.strictEqual(room.say('c2', '   ', 1000).code, 'empty');
  assert.strictEqual(room.say('c2', '哈囉', 1000).ok, true);
  assert.strictEqual(room.say('c2', '再一句', 1100).code, 'rate');
  assert.strictEqual(room.say('c2', '慢慢說', 3000).ok, true);
  room.mute('host-client-01', 'c2', 60, 3000);
  assert.strictEqual(room.say('c2', '還想說話', 5000).code, 'muted');
  assert.strictEqual(room.mute('c2', 'host-client-01', 60, 5000).code, 'perm');
});

test('名字與訊息會清掉控制字元、零寬字元並限制長度', () => {
  assert.strictEqual(sanitizeName('  阿  明  '), '阿 明');
  assert.strictEqual(sanitizeName('a​b‮c'), 'abc');
  assert.strictEqual(sanitizeName(''), '玩家');
  assert.strictEqual(sanitizeName('一二三四五六七八九十一二三四').length, 12);
  assert.strictEqual(sanitizeText('x'.repeat(500), 120).length, 120);
});

test('房主離開會交棒；最後一個人離開房間會空掉', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('c2', { name: '客人', now: 10 });
  const left = room.leave('host-client-01', 20);
  assert.strictEqual(left.emptied, false);
  assert.strictEqual(room.hostId, 'c2', '房主要換人');
  assert.strictEqual(room.leave('c2', 30).emptied, true);
});

test('斷線先保留座位，太久沒回來才釋出；空房會被關掉', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('c2', { name: '客人', now: 0 });
  room.disconnect('c2', 1000);
  assert.strictEqual(room.member('c2').connected, false);
  assert.ok(store.get(room.code), '斷線的人還算在房間裡');

  const swept = store.sweep(1000 + 61000);
  assert.strictEqual(room.member('c2'), null, '超過保留時間要釋出座位');
  assert.ok(swept.changed.indexOf(room) >= 0);

  room.leave('host-client-01', 70000);
  const swept2 = store.sweep(70001);
  assert.ok(swept2.closed.indexOf(room) >= 0, '空房要被關掉');
  assert.strictEqual(store.get(room.code), null);
});

test('重新連上線會回到原本的座位（憑 clientId）', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('c2', { name: '客人', now: 0 });
  room.disconnect('c2', 1000);
  const back = room.join('c2', { name: '客人', now: 2000 });
  assert.strictEqual(back.reconnected, true);
  assert.strictEqual(back.member.role, 'player');
  assert.strictEqual(back.member.connected, true);
});

test('對局中所有真人都斷線就直接結算，不會卡住一局', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.setReady('host-client-01', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  room.step(10);
  assert.strictEqual(room.phase, 'playing');
  room.leave('host-client-01', 100);
  assert.strictEqual(room.phase, 'over');
  assert.strictEqual(room.state.over, true);
});

test('再來一局：全部玩家都投票才會重開，而且換新盤面', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.join('c2', { name: '客人', now: 0 });
  room.setReady('host-client-01', true);
  room.setReady('c2', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  const firstSeed = room.seed;
  Rules.finish(room.state, 1000, 'timeup');
  room.phase = 'over';

  assert.strictEqual(room.voteRematch('host-client-01', 1100).started, false);
  assert.strictEqual(room.voteRematch('c2', 1200).started, true);
  assert.strictEqual(room.phase, 'countdown');
  assert.notStrictEqual(room.seed, firstSeed, '重開要換新種子');
});

test('房間開的那一局用房號＋種子當亂數來源，同一組一定重現同一張盤面', () => {
  const store = newStore();
  const room = mkRoom(store);
  room.setReady('host-client-01', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  const replay = Rules.createMatch({
    seed: room.seed, players: [{ id: 'host-client-01', name: '房主' }],
    level: room.level, theme: room.theme, maxKinds: Themes.count(room.theme),
    now: 0, countdownMs: 0,
    rng: RNG.createRng('board:' + room.code + ':' + room.seed)
  });
  assert.deepStrictEqual(replay.grid, room.state.grid, '盤面要能重現');
  assert.deepStrictEqual(replay.palette, room.state.palette, '抽到的造型也要能重現');
});

/* ------------------------------------------------------------ 造型主題 */

group('造型主題');

test('六個主題都在，而且每個主題的造型數量足夠', () => {
  const menu = Themes.menu();
  assert.deepStrictEqual(menu.map((t) => t.key), ['fruits', 'animals', 'food', 'flags', 'mahjong', 'mixed']);
  const most = Rules.LEVELS.reduce((m, l) => Math.max(m, l.kinds), 0);
  menu.forEach((t) => {
    assert.ok(t.count >= most, t.label + ' 只有 ' + t.count + ' 種，不夠最難的關卡用（要 ' + most + ' 種）');
    assert.ok(t.label && t.emoji, t.key + ' 少了名稱或圖示');
  });
});

test('每個主題裡的 id 不重複、造型都有內容', () => {
  Themes.LIST.forEach((t) => {
    const ids = new Set(t.list.map((x) => x.id));
    assert.strictEqual(ids.size, t.list.length, t.label + ' 有重複的 id');
    t.list.forEach((x) => {
      assert.ok(x.label && x.label.length, t.label + ' 的 ' + x.id + ' 沒有名稱');
      assert.ok(x.svg && x.svg.indexOf('<') === 0, t.label + ' 的 ' + x.id + ' 不是 SVG 內容');
      assert.ok(x.svg.indexOf('<script') < 0, t.label + ' 的 ' + x.id + ' 含有 script');
    });
  });
});

test('大混搭只接四個平面主題，不加入麻將', () => {
  const base = Themes.LIST.filter((t) => !['mixed', 'mahjong'].includes(t.key));
  const total = base.reduce((n, t) => n + t.list.length, 0);
  assert.strictEqual(Themes.count('mixed'), total);
  assert.ok(Themes.of('mixed').list.every((t) => !t.id.startsWith('mahjong:')));
});

test('不認得的主題名稱會收斂回預設，art 取值會繞回頭', () => {
  assert.strictEqual(Themes.of('nope').key, Themes.DEFAULT);
  assert.strictEqual(Themes.has('nope'), false);
  assert.strictEqual(Themes.has('animals'), true);
  const n = Themes.count('animals');
  assert.strictEqual(Themes.art('animals', n).id, Themes.art('animals', 0).id, '超過範圍要繞回第一個');
  assert.strictEqual(Themes.art('animals', -1).id, Themes.art('animals', n - 1).id, '負的也要繞回去');
});

test('rules 只把主題當字串處理，不合法的字元會被清掉', () => {
  assert.strictEqual(Rules.sanitizeTheme('animals'), 'animals');
  assert.strictEqual(Rules.sanitizeTheme('<script>'), '');
  assert.strictEqual(Rules.sanitizeTheme(null), '');
});

test('每一局會從主題裡隨機抽造型，抽出來的不重複也不超出範圍', () => {
  Themes.KEYS.forEach((key) => {
    const max = Themes.count(key);
    const st = Rules.createMatch({
      seed: 'T', players: [{ id: 'p1', name: '甲' }], level: 'hard',
      theme: key, maxKinds: max, now: 0, countdownMs: 0, rng: RNG.createRng('pal:' + key)
    });
    assert.strictEqual(st.theme, key);
    assert.strictEqual(st.palette.length, st.kinds, key + ' 的 palette 長度不對');
    assert.strictEqual(new Set(st.palette).size, st.palette.length, key + ' 抽到重複的造型');
    st.palette.forEach((i) => assert.ok(i >= 0 && i < max, key + ' 抽到超出範圍的造型 ' + i));
  });
});

test('同一關換不同種子會抽到不同組造型', () => {
  const mk = (seedText) => Rules.createMatch({
    seed: 'T', players: [{ id: 'p1', name: '甲' }], level: 'normal',
    theme: 'animals', maxKinds: Themes.count('animals'), now: 0, countdownMs: 0, rng: RNG.createRng(seedText)
  }).palette.join(',');
  assert.notStrictEqual(mk('runA'), mk('runB'), '不同種子應該抽到不同組');
  assert.strictEqual(mk('runA'), mk('runA'), '同一個種子一定抽到同一組');
});

test('主題的造型比關卡要的種類少時，種類會自動收斂，不會爆掉', () => {
  const st = Rules.createMatch({
    seed: 'T', players: [{ id: 'p1', name: '甲' }], level: 'hard',
    theme: 'animals', maxKinds: 3, now: 0, countdownMs: 0, rng: RNG.createRng('few')
  });
  assert.strictEqual(st.kinds, 3);
  assert.strictEqual(st.palette.length, 3);
  const kinds = new Set();
  Rules.innerCells(st.W, st.H).forEach((i) => { if (st.grid[i]) kinds.add(st.grid[i]); });
  assert.strictEqual(kinds.size, 3, '盤面上真的只出現 3 種');
  assert.ok(Rules.findPair(st.grid, st.W, st.H), '還是要有解');
});

test('snapshot 會帶著主題與造型對照表（線上才畫得出一樣的盤面）', () => {
  const st = Rules.createMatch({
    seed: 'T', players: [{ id: 'p1', name: '甲' }], level: 'easy',
    theme: 'flags', maxKinds: Themes.count('flags'), now: 0, countdownMs: 0, rng: RNG.createRng('snap')
  });
  const s = Rules.snapshot(st, st.startAt + 100);
  assert.strictEqual(s.theme, 'flags');
  assert.deepStrictEqual(s.palette, st.palette);
  s.palette[0] = 999;
  assert.notStrictEqual(st.palette[0], 999, 'palette 要是複本');
});

test('房間：只有房主能改主題，對局中不能改，亂寫會被擋', () => {
  const store = newStore();
  const room = mkRoom(store, { theme: 'animals' });
  assert.strictEqual(room.theme, 'animals');
  assert.strictEqual(room.brief().themeLabel, '動物');
  room.join('c2', { name: '客人', now: 0 });
  assert.strictEqual(room.setTheme('c2', 'flags').code, 'perm');
  assert.strictEqual(room.setTheme('host-client-01', 'nope').code, 'badtheme');
  assert.strictEqual(room.setTheme('host-client-01', 'flags').ok, true);
  assert.strictEqual(room.theme, 'flags');

  room.setReady('host-client-01', true);
  room.setReady('c2', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  assert.strictEqual(room.state.theme, 'flags', '開局要用房間設定的主題');
  assert.strictEqual(room.setTheme('host-client-01', 'food').code, 'phase');
});

test('房間建立時給不認得的主題會收斂回預設', () => {
  const store = newStore();
  const room = mkRoom(store, { theme: '../../etc/passwd' });
  assert.strictEqual(room.theme, Themes.DEFAULT);
});

test('房主與觀戰者看到的主題與造型對照表完全一致', () => {
  const store = newStore();
  const room = mkRoom(store, { theme: 'mixed' });
  room.join('spec', { name: '觀眾', role: 'spectator', now: 0 });
  room.setReady('host-client-01', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  const a = room.viewFor('host-client-01', 10);
  const b = room.viewFor('spec', 10);
  assert.strictEqual(a.theme, 'mixed');
  assert.strictEqual(a.match.theme, b.match.theme);
  assert.deepStrictEqual(a.match.palette, b.match.palette);
});

/* ------------------------------------------------------------ 麻將疊疊樂 */

group('麻將疊疊樂');

test('九條使用中央一列紅色竹節的牌面', () => {
  const art = Themes.of('mahjong').list.find((item) => item.id === 'bam-9');
  const redXs = Array.from(art.svg.matchAll(
    /<rect x="([^"]+)" y="[^"]+" width="[^"]+" height="[^"]+" rx="[^"]+" fill="none" stroke="#C4302B"/g
  )).map((match) => Number(match[1]));
  assert.strictEqual(redXs.length, 3, '九條應該有 3 根紅色竹節');
  redXs.forEach((x) => assert.ok(Math.abs(x - redXs[0]) < 0.01,
    '九條的紅色竹節應該位於中央列，實際 x=' + x));
});

test('八條使用左右竹節與交叉連接的實體牌圖案', () => {
  const art = Themes.of('mahjong').list.find((item) => item.id === 'bam-8');
  assert.ok(art.svg.includes('M27 20 V80'), '八條應該有左側完整竹節');
  assert.ok(art.svg.includes('M73 20 V80'), '八條應該有右側完整竹節');
  assert.ok(art.svg.includes('M29 42 L50 21 L71 42'), '八條上半部應該有第一組交叉竹節');
  assert.ok(art.svg.includes('M29 21 L50 42 L71 21'), '八條上半部應該有第二組交叉竹節');
  assert.ok(art.svg.includes('M29 58 L50 79 L71 58'), '八條下半部應該有第一組交叉竹節');
  assert.ok(art.svg.includes('M29 79 L50 58 L71 79'), '八條下半部應該有第二組交叉竹節');
});

test('六條使用上三根黑竹節、下三根綠竹節的牌面', () => {
  const art = Themes.of('mahjong').list.find((item) => item.id === 'bam-6');
  const sticks = Array.from(art.svg.matchAll(
    /<rect x="([^\"]+)" y="([^\"]+)" width="[^\"]+" height="21" rx="[^\"]+" fill="#F3EAD2"/g
  )).map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
  assert.strictEqual(sticks.length, 6, '六條應該有 6 根竹節');
  assert.deepStrictEqual([...new Set(sticks.map((stick) => stick.x))].length, 3, '六條應該分成三欄');
  assert.deepStrictEqual([...new Set(sticks.map((stick) => stick.y))].length, 2, '六條應該分成上下兩排');
  assert.strictEqual(sticks.filter((stick) => stick.y === Math.min(...sticks.map((item) => item.y))).length, 3,
    '六條上排應該有三根竹節');
});

test('筒子是實心圓點、字牌方向與白板使用黑色牌面圖案', () => {
  const mahjong = Themes.of('mahjong').list;
  const dot = mahjong.find((item) => item.id === 'dot-9');
  const east = mahjong.find((item) => item.id === 'honor-east');
  const white = mahjong.find((item) => item.id === 'honor-white');
  assert.ok(dot.svg.includes('<ellipse'), '筒子應該使用圓點');
  assert.ok(!dot.svg.includes('fill="none" stroke="#1E5A34"'), '筒子不應該使用中空圓環');
  assert.ok(east.svg.includes('fill="#2B2B2B"'), '東風應該使用黑色字');
  assert.ok(white.svg.includes('stroke="#2B2B2B"'), '白板應該使用黑色框');
});

test('麻將主題包含梅蘭竹菊與春夏秋冬八張花牌', () => {
  const flowers = Themes.of('mahjong').list.filter((item) => item.id.indexOf('flower-') === 0 || item.id.indexOf('season-') === 0);
  assert.deepStrictEqual(flowers.map((item) => item.id), [
    'flower-plum', 'flower-orchid', 'flower-chrysanthemum', 'flower-bamboo',
    'season-spring', 'season-summer', 'season-autumn', 'season-winter'
  ]);
  assert.deepStrictEqual(flowers.map((item) => item.label), ['梅', '蘭', '菊', '竹', '春', '夏', '秋', '冬']);
  flowers.forEach((item) => assert.ok(item.svg.indexOf('<rect') === 0 && item.svg.includes('stroke='),
    item.id + ' 應該有花牌圖案'));
  assert.strictEqual(Themes.count('mahjong'), 42, '麻將主題應該有 42 種牌面');
});

/* 開一局麻將（疊疊樂）的對局狀態 */
function mahjong(levelKey, seed) {
  return Rules.createMatch({
    seed: seed, players: [{ id: 'me', name: '我' }], level: levelKey, now: 0,
    theme: 'mahjong', maxKinds: Themes.count('mahjong'), countdownMs: 0,
    rng: RNG.createRng(seed)
  });
}
/* 同樣的關卡但換成別的主題，用來對照「只有麻將會疊」 */
function flat(levelKey, seed) {
  return Rules.createMatch({
    seed: seed, players: [{ id: 'me', name: '我' }], level: levelKey, now: 0,
    theme: 'fruits', maxKinds: Themes.count('fruits'), countdownMs: 0,
    rng: RNG.createRng(seed)
  });
}
function liveCount(grid) { return grid.filter((k) => k).length; }

test('只有麻將主題會疊起來，其他主題維持平面連連看', () => {
  Rules.LEVEL_ORDER.forEach((key) => {
    assert.strictEqual(mahjong(key, 'a').mode, 'stack', key + ' 的麻將盤應該是疊的');
    assert.strictEqual(flat(key, 'a').mode, 'flat', key + ' 的蔬果盤不該疊');
  });
  ['fruits', 'animals', 'food', 'flags', 'mixed'].forEach((t) => {
    assert.strictEqual(Rules.isStackTheme(t), false, t + ' 不該疊');
  });
  assert.strictEqual(Rules.isStackTheme('mahjong'), true);
});

test('每一層都是偶數張，總牌數也是偶數（不然配不完）', () => {
  Rules.LEVEL_ORDER.forEach((key) => {
    const st = mahjong(key, 'b');
    const byZ = {};
    st.stack.forEach((p) => { byZ[p.z] = (byZ[p.z] || 0) + 1; });
    Object.keys(byZ).forEach((z) => {
      assert.strictEqual(byZ[z] % 2, 0, key + ' 第 ' + z + ' 層有 ' + byZ[z] + ' 張，不是偶數');
    });
    assert.strictEqual(st.stack.length % 2, 0, key + ' 的總牌數不是偶數');
    assert.strictEqual(st.total, st.stack.length);
    assert.strictEqual(st.left, st.total);
    assert.ok(Object.keys(byZ).length >= 2, key + ' 至少要疊兩層');
  });
});

test('每一種牌都是偶數張，而且用滿了關卡要的種類數', () => {
  Rules.LEVEL_ORDER.forEach((key) => {
    const st = mahjong(key, 'c');
    const c = {};
    st.grid.forEach((k) => { c[k] = (c[k] || 0) + 1; });
    assert.ok(!c[0], key + ' 不該有空位');
    assert.strictEqual(Object.keys(c).length, st.kinds, key + ' 的種類數不對');
    Object.keys(c).forEach((k) => assert.strictEqual(c[k] % 2, 0, key + ' 第 ' + k + ' 種不是偶數張'));
  });
});

test('上層牌壓住下層 4 張，邊角壓得比較少', () => {
  const st = mahjong('normal', 'd');
  const upper = st.stack.filter((p) => p.z === 1);
  assert.ok(upper.length > 0);
  /* 隨便挑一張正中間的上層牌，它蓋住的下層牌應該剛好 4 張 */
  const mid = upper[Math.floor(upper.length / 2)];
  const under = st.stack.filter((p) => p.z === 0 &&
    Math.abs(p.x - mid.x) < 2 && Math.abs(p.y - mid.y) < 2);
  assert.strictEqual(under.length, 4, '中間的上層牌應該壓住 4 張，實際 ' + under.length);
  /* 最左上角那一張上層牌壓到的一定少於 4 張（下層沒有更左上的了） */
  const corner = upper[0];
  const underCorner = st.stack.filter((p) => p.z === 0 &&
    Math.abs(p.x - corner.x) < 2 && Math.abs(p.y - corner.y) < 2);
  assert.ok(underCorner.length <= 4 && underCorner.length >= 1);
});

test('牌面重疊會鎖住被蓋住的牌，移除上層後解鎖', () => {
  const st = mahjong('normal', 'e');
  const maxZ = st.stack.reduce((m, p) => Math.max(m, p.z), 0);
  const topIds = [];
  st.stack.forEach((p, i) => { if (p.z === maxZ) topIds.push(i); });
  /* 最上層一定沒有東西壓著 */
  topIds.forEach((i) => assert.strictEqual(Rules.stackCovered(st.stack, st.grid, i), false, '最上層應該露出來'));
  /* 被最上層蓋到的那一層，蓋到的每一張現在都不能點 */
  const under = [];
  st.stack.forEach((p, i) => {
    if (p.z !== maxZ - 1) return;
    if (topIds.some((t) => Math.abs(st.stack[t].x - p.x) < 2 && Math.abs(st.stack[t].y - p.y) < 2)) under.push(i);
  });
  assert.ok(under.length > 0);
  under.forEach((i) => {
    assert.strictEqual(Rules.stackCovered(st.stack, st.grid, i), true, '第 ' + i + ' 張應該被壓住');
    assert.strictEqual(Rules.stackFree(st.stack, st.grid, i), false, '被蓋住的牌不能操作');
  });
  topIds.forEach((i) => { st.grid[i] = 0; });   /* 把整層上面的拿走 */
  under.forEach((i) => {
    assert.strictEqual(Rules.stackCovered(st.stack, st.grid, i), false, '拿掉上面那層就不再被壓住');
    assert.strictEqual(Rules.stackFree(st.stack, st.grid, i), true);
  });
});

test('發出來的牌一定拆得完：由上往下一層一層拆都是露出來的', () => {
  Rules.LEVEL_ORDER.forEach((key) => {
    for (let s = 0; s < 5; s++) {
      const st = mahjong(key, 'solve-' + s);
      const grid = st.grid.slice();
      const byZ = {};
      st.stack.forEach((p, i) => { (byZ[p.z] = byZ[p.z] || []).push(i); });
      Object.keys(byZ).map(Number).sort((a, b) => b - a).forEach((z) => {
        byZ[z].forEach((i) => {
          assert.strictEqual(Rules.stackFree(st.stack, grid, i), true,
            key + '/' + s + '：第 ' + z + ' 層第 ' + i + ' 張拆到時竟然被壓住');
          grid[i] = 0;
        });
      });
      assert.strictEqual(liveCount(grid), 0);
    }
  });
});

test('麻將和其他模式一樣，相鄰同圖案可直連，不要求左右空位', () => {
  const pos = [0, 2, 4, 6].map((x) => ({ x, y: 0, z: 0 }));
  const grid = [2, 1, 1, 2];
  assert.strictEqual(Rules.stackFree(pos, grid, 1), true);
  assert.strictEqual(Rules.stackLink(pos, grid, 1, 2).length, 2);
  grid[0] = 0;
  assert.strictEqual(Rules.stackFree(pos, grid, 1), true);
  assert.strictEqual(Rules.stackFree(pos, grid, 2), true);
  grid[3] = 0;
  assert.ok(Rules.stackLink(pos, grid, 1, 2));
});

test('麻將路徑不能沿著共用邊界穿進隔壁牌面', () => {
  const pos = [
    { x: 2, y: 0, z: 0 },
    { x: 2, y: 2, z: 0 },
    { x: 0, y: 2, z: 0 }
  ];
  const grid = [3, 1, 3];
  const path = Rules.stackLink(pos, grid, 0, 2);
  assert.ok(path && path.length >= 2 && path.length <= 4);
  const blocker = { left: 2.5, right: 4.5, top: 2.5, bottom: 4.5 };
  const crossed = path.slice(1).some((point, n) => {
    const start = path[n];
    if (start.x === point.x) {
      return start.x >= blocker.left && start.x <= blocker.right &&
        Math.max(Math.min(start.y, point.y), blocker.top) <=
        Math.min(Math.max(start.y, point.y), blocker.bottom);
    }
    return start.y >= blocker.top && start.y <= blocker.bottom &&
      Math.max(Math.min(start.x, point.x), blocker.left) <=
      Math.min(Math.max(start.x, point.x), blocker.right);
  });
  assert.strictEqual(crossed, false, '路徑不能穿過隔壁牌面的共用邊界：' + JSON.stringify(path));
});

test('麻將連線忽略其他層，只遵守所在平面的空格規則', () => {
  const pos = [
    { x: 0, y: 0, z: 1 },
    { x: 2, y: 0, z: 0 },
    { x: 4, y: 0, z: 1 }
  ];
  const grid = [1, 2, 1];
  const path = Rules.stackLink(pos, grid, 0, 2);
  assert.ok(path, '其他層的牌不應讓同層配對失效');
  assert.strictEqual(path.length, 2, '其他層的牌不應阻擋同層 0 折直線');
});

test('麻將路徑仍會被同層仍在盤面上的牌阻擋，只能繞行', () => {
  const pos = [
    { x: 0, y: 0, z: 0 },
    { x: 2, y: 0, z: 0 },
    { x: 4, y: 0, z: 0 }
  ];
  const grid = [1, 2, 1];
  const path = Rules.stackLink(pos, grid, 0, 2);
  assert.ok(path, '同層牌可以依平面規則繞開阻擋');
  assert.ok(path.length > 2, '同層中間的牌應該阻擋 0 折直線');
});

test('麻將配對要同圖案、同層，且路徑不超過 2 折', () => {
  const st = mahjong('normal', 'f');
  const hit = Rules.stackFindPair(st.stack, st.grid);
  assert.ok(hit, '一開局一定要有得消');
  assert.strictEqual(st.stack[hit.a].z, st.stack[hit.b].z, '只能和同層的麻將配對');
  assert.ok(hit.path.length >= 2 && hit.path.length <= 4,
    '麻將路徑必須是 0／1／2 折');
  assert.deepStrictEqual(hit.path[0], {
    x: st.stack[hit.a].x + 1.5,
    y: st.stack[hit.a].y + 1.5
  }, '麻將路徑起點要對準牌面中心');
  assert.deepStrictEqual(hit.path[hit.path.length - 1], {
    x: st.stack[hit.b].x + 1.5,
    y: st.stack[hit.b].y + 1.5
  }, '麻將路徑終點要對準牌面中心');
  const ok = Rules.attempt(st, 'me', hit.a, hit.b, 1, RNG.createRng('f1'));
  assert.strictEqual(ok.event.k, 'match');
  assert.strictEqual(st.grid[hit.a], 0);
  assert.strictEqual(st.grid[hit.b], 0);
  assert.strictEqual(st.left, st.total - 2);
});

test('不同層的麻將即使同圖案、都露出也不能配對', () => {
  const pos = [
    { x: 0, y: 0, z: 0 },
    { x: 4, y: 0, z: 1 }
  ];
  const grid = [1, 1];
  assert.strictEqual(Rules.stackLink(pos, grid, 0, 1), null);
});

test('麻將路徑超過 2 折時不能配對', () => {
  const rows = [
    'BBBBBB',
    'BA...B',
    'BBBB.B',
    'B....B',
    'B.BBBB',
    'B...AB'
  ];
  const pos = [];
  const grid = [];
  const targets = [];
  rows.forEach((row, y) => {
    Array.from(row).forEach((cell, x) => {
      if (cell === '.') return;
      pos.push({ x: x * 2, y: y * 2, z: 0 });
      grid.push(cell === 'A' ? 1 : 2);
      if (cell === 'A') targets.push(grid.length - 1);
    });
  });
  assert.strictEqual(targets.length, 2);
  assert.strictEqual(Rules.stackLink(pos, grid, targets[0], targets[1]), null,
    '需要 3 折以上的路徑不算合法');
});

test('麻將發牌不應讓每局第一組可消牌都固定相鄰', () => {
  const firstPairs = ['layout-a', 'layout-b', 'layout-c', 'layout-d', 'layout-e'].map((seed) => {
    const st = mahjong('normal', seed);
    const pair = Rules.stackFindPair(st.stack, st.grid);
    return {
      pathLength: pair.path.length,
      positions: [st.stack[pair.a], st.stack[pair.b]].map((p) => p.x + ',' + p.y).join('|')
    };
  });
  assert.ok(firstPairs.some((pair) => pair.pathLength > 2),
    '固定種子仍全部是相鄰 0 折：' + firstPairs.map((pair) => pair.pathLength).join(', '));
  assert.ok(new Set(firstPairs.map((pair) => pair.positions)).size > 1,
    '不同種子仍產生相同的配對位置：' + firstPairs.map((pair) => pair.positions).join('; '));
});

test('麻將各牌面重複不應集中在少數牌面', () => {
  Rules.LEVELS.forEach((level) => {
    const st = mahjong(level.key, 'repeat-mahjong:' + level.key);
    const counts = {};
    st.grid.forEach((value) => { if (value) counts[value] = (counts[value] || 0) + 1; });
    const maxPairs = Math.max(...Object.values(counts).map((count) => count / 2));
    assert.strictEqual(st.kinds, Math.min(Themes.count('mahjong'), st.total / 2),
      level.key + ' 應優先使用可用的不同麻將牌面');
    assert.ok(maxPairs <= 2,
      level.key + ' 單一麻將牌面最多只能重複 2 對，實際 ' + maxPairs + ' 對');
  });
});

test('麻將各層都是獨立平面，仍遵守覆蓋鎖定', () => {
  const pos = [
    { x: 0, y: 0, z: 0 },
    { x: 2, y: 0, z: 1 },
    { x: 4, y: 0, z: 0 }
  ];
  const grid = [1, 2, 1];
  assert.strictEqual(Rules.stackFree(pos, grid, 0), true, '未被覆蓋的下層牌可以操作');
  assert.strictEqual(Rules.stackLink(pos, grid, 0, 2).length, 2,
    '其他層的牌不應阻擋同層的 0 折直線');
});

test('同一麻將牌面不應跨層造成看似相同卻無法配對', () => {
  const st = mahjong('normal', 'normal-nine-70');
  const kind = st.palette.findIndex((i) => Themes.art('mahjong', i).id === 'man-9') + 1;
  const layers = new Set();
  st.grid.forEach((value, i) => {
    if (value === kind) layers.add(st.stack[i].z);
  });
  assert.strictEqual(layers.size, 1, '九萬不應同時出現在不同層：' + Array.from(layers).join(','));
});

test('提示指出來的兩張一定都是露出來的', () => {
  const st = mahjong('easy', 'g');
  for (let n = 0; n < 12; n++) {
    const res = Rules.useHint(st, 'me', 10);
    if (!res.ok) break;
    const { a, b } = res.event;
    assert.strictEqual(Rules.stackFree(st.stack, st.grid, a), true);
    assert.strictEqual(Rules.stackFree(st.stack, st.grid, b), true);
    assert.strictEqual(st.grid[a], st.grid[b]);
    assert.strictEqual(st.stack[a].z, st.stack[b].z);
    assert.ok(Rules.stackLink(st.stack, st.grid, a, b));
    Rules.attempt(st, 'me', a, b, 10, RNG.createRng('g' + n));
  }
});

test('洗牌不動位置只換牌面，而且洗完一定有得消', () => {
  const st = mahjong('normal', 'h');
  const posBefore = JSON.stringify(st.stack);
  const before = st.grid.slice();
  const res = Rules.useShuffle(st, 'me', 10, RNG.createRng('h1'));
  assert.strictEqual(res.ok, true);
  assert.strictEqual(JSON.stringify(st.stack), posBefore, '洗牌不該搬動位置');
  assert.strictEqual(liveCount(st.grid), liveCount(before), '洗牌不能憑空生出或吃掉牌');
  const c1 = {}, c2 = {};
  before.forEach((k) => { c1[k] = (c1[k] || 0) + 1; });
  st.grid.forEach((k) => { c2[k] = (c2[k] || 0) + 1; });
  assert.deepStrictEqual(c2, c1, '每一種的張數不能變');
  assert.ok(Rules.stackFindPair(st.stack, st.grid), '洗完一定要有得消');
});

test('死局會自動洗牌，整局一定清得完', () => {
  Rules.LEVEL_ORDER.forEach((key) => {
    const st = mahjong(key, 'clear-' + key);
    let guard = 0, autoBefore = st.autoShuffles;
    while (guard++ < 5000 && st.left > 0) {
      const hit = Rules.stackFindPair(st.stack, st.grid);
      assert.ok(hit, key + '：沒得消卻沒有自動洗牌（剩 ' + st.left + ' 張）');
      Rules.attempt(st, 'me', hit.a, hit.b, 10 + guard, RNG.createRng('c' + guard));
    }
    assert.strictEqual(st.left, 0, key + ' 沒清完');
    assert.strictEqual(st.cleared, true, key + ' 沒判過關');
    assert.ok(st.autoShuffles >= autoBefore);
  });
});

test('快照帶著 mode 與每張牌的座標，觀戰者才畫得出同一疊', () => {
  const st = mahjong('normal', 'i');
  const snap = Rules.snapshot(st, 10);
  assert.strictEqual(snap.mode, 'stack');
  assert.strictEqual(snap.stack.length, snap.grid.length);
  snap.stack.forEach((p) => {
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
    assert.ok(p.x + 2 <= snap.W && p.y + 2 <= snap.H, '座標不能超出半格範圍');
  });
  /* 平面模式不帶這些，畫面才知道要走哪一套 */
  const f = Rules.snapshot(flat('normal', 'i'), 10);
  assert.strictEqual(f.mode, 'flat');
  assert.strictEqual(f.stack, null);
});

test('同一個種子一定疊出同一副牌（線上全場才會一致）', () => {
  const a = mahjong('hard', 'same-seed');
  const b = mahjong('hard', 'same-seed');
  assert.deepStrictEqual(a.grid, b.grid);
  assert.deepStrictEqual(a.stack, b.stack);
  const c = mahjong('hard', 'other-seed');
  assert.notDeepStrictEqual(a.grid, c.grid);
});

test('房間開麻將主題時，房主與觀戰者拿到的是同一副疊牌', () => {
  const store = newStore();
  const room = mkRoom(store, { theme: 'mahjong' });
  room.join('spec', { name: '觀眾', role: 'spectator', now: 0 });
  room.setReady('host-client-01', true);
  room.start('host-client-01', 0, { countdownMs: 0 });
  const a = room.viewFor('host-client-01', 10);
  const b = room.viewFor('spec', 10);
  assert.strictEqual(a.match.mode, 'stack');
  assert.deepStrictEqual(a.match.stack, b.match.stack);
  assert.deepStrictEqual(a.match.grid, b.match.grid);
});

/* ------------------------------------------------------------ 收尾 */

console.log('\n────────────────────────────');
console.log('通過 ' + pass + ' 項，失敗 ' + fail + ' 項');
if (fail) { process.exitCode = 1; console.log('❌ 驗證失敗'); }
else console.log('✅ 全部通過');
