/*
 * tests/verify.js — 規則、題庫、AI、房間狀態機與設定解析的單元測試
 *
 *   node tests/verify.js
 *
 * 不需要瀏覽器也不需要網路：這一層測的是「狀態轉移」，
 * 線上端對端（兩個玩家 + 一個觀戰）在 scripts/online-check.js。
 */
'use strict';

require('./seo.js');

const Words = require('../public/js/words.js');
const Rules = require('../public/js/rules.js');
const DrawingFile = require('../public/js/drawing-file.js');
const AI = require('../public/js/ai.js');
const RNG = require('../public/js/rng.js');
const { RoomStore } = require('../lib/rooms.js');
const { GameConfig } = require('../public/js/config.js');

let passed = 0;
let failed = 0;
let group = '';

function section(name) { group = name; console.log('\n▍' + name); }
function check(name, condition, detail) {
  if (condition) { passed += 1; console.log('  ✓ ' + name); }
  else { failed += 1; console.log('  ✗ ' + name + (detail !== undefined ? '  →  ' + detail : '')); }
}

/* 一組固定的玩家，讓每個測試都從同樣的起點開始 */
function makeState(opts) {
  const o = opts || {};
  return Rules.createState({
    seed: o.seed || 'TESTAA',
    players: o.players || [
      { id: 'p1', name: '阿明' },
      { id: 'p2', name: '小華' },
      { id: 'p3', name: '電腦', ai: 'normal' }
    ],
    rounds: o.rounds || 1,
    drawSec: o.drawSec || 60,
    diff: o.diff || 0
  });
}

/** 走到 drawing 階段：開局 → 畫家選第一個題目 */
function toDrawing(st, t) {
  Rules.start(st, t);
  const r = Rules.pickWord(st, st.drawerId, st.choices[0], t);
  if (!r.ok) throw new Error('pickWord failed: ' + r.error);
  return st;
}

/* ================================================================
   題庫
   ================================================================ */
section('題庫（words.js）');
{
  check('題目數量為 2000', Words.LIST.length === 2000, Words.LIST.length);

  const ids = new Set();
  let dupe = null;
  for (const w of Words.LIST) if (ids.has(w.id)) dupe = w.id; else ids.add(w.id);
  check('沒有重複的題目 id', !dupe, dupe);
  check('沒有重複的題目文字', new Set(Words.LIST.map((w) => w.text)).size === Words.LIST.length);

  const cats = {};
  for (const w of Words.LIST) cats[w.cat] = (cats[w.cat] || 0) + 1;
  check('二十八個分類都有題目', Object.keys(cats).length === 28, JSON.stringify(cats));
  check('每個分類至少 10 題', Object.values(cats).every((n) => n >= 10), JSON.stringify(cats));
  const themes = ['emotion', 'idiom', 'phenomenon', 'place', 'expression', 'job', 'fantasy', 'action',
    'star', 'movie', 'trend', 'history', 'geography', 'civics', 'physics', 'astro', 'music', 'people',
    'body', 'clothes', 'festival'];
  check('每個主題分類都有題目', themes.every((cat) => cats[cat] >= 30), JSON.stringify(cats));

  /* 題目只能是名詞、成語或單一動作，不能是句子或加了場景的長描述 */
  /* 專有名詞（人名、片名、地名、術語）放寬到六個字，其餘一律四個字以內 */
  const NAME_CATS = ['star', 'movie', 'trend', 'history', 'geography', 'civics', 'physics', 'astro', 'music', 'taiwan'];
  const tooLong = Words.LIST.filter((w) => w.text.length > (NAME_CATS.indexOf(w.cat) >= 0 ? 6 : 4)).map((w) => w.text);
  check('每一題都是單詞（專有名詞最多六個字，其餘四個字）', tooLong.length === 0, tooLong.slice(0, 5).join('，'));
  /* 第二張提示會公開分類名稱：題目要是分類名稱的一部分（「宇宙」之於「天文宇宙」），等於直接公布答案 */
  const inLabel = Words.LIST.filter((w) => Words.CATEGORIES[w.cat].label.indexOf(w.text) >= 0).map((w) => w.text);
  check('題目不會出現在自己的分類名稱裡', inLabel.length === 0, inLabel.join('，'));
  const withParticle =Words.LIST.filter((w) => /[的了嗎呢，。]/.test(w.text)).map((w) => w.text);
  check('題目不含助詞或標點（不是句子）', withParticle.length === 0, withParticle.slice(0, 5).join('，'));

  const diffs = new Set(Words.LIST.map((w) => w.diff));
  check('三種難度都有題目', diffs.has(1) && diffs.has(2) && diffs.has(3), [...diffs].join(','));

  let badStrokes = [];
  let badFeatures = [];
  let outOfBox = [];
  for (const w of Words.LIST) {
    const strokes = Words.strokesOf(w.id);
    if (strokes.length < 2) badStrokes.push(w.id);
    if (!Words.featuresOf(w.id)) badFeatures.push(w.id);
    for (const s of strokes) {
      for (const v of s.p) {
        if (!isFinite(v) || v < -1 || v > Words.BOX + 1) { outOfBox.push(w.id); break; }
      }
    }
  }
  check('每一題都畫得出至少 2 筆', badStrokes.length === 0, badStrokes.slice(0, 5).join(','));
  check('每一題都算得出形狀特徵', badFeatures.length === 0, badFeatures.slice(0, 5).join(','));
  check('所有座標都在 0..1000 內', outOfBox.length === 0, outOfBox.slice(0, 5).join(','));

  /* 特徵要有鑑別力：每一題的配方跟自己最像 */
  let top1 = 0;
  for (const w of Words.LIST) {
    const f = Words.featuresOf(w.id);
    let best = null, bestD = Infinity;
    for (const x of Words.LIST) {
      const d = Words.distance(f, Words.featuresOf(x.id));
      if (d < bestD) { bestD = d; best = x.id; }
    }
    if (best === w.id) top1 += 1;
  }
  check('配方特徵自我識別率 100%', top1 === Words.LIST.length, top1 + '/' + Words.LIST.length);

  const sun = Words.byId('sun');
  check('答案比對：完全相同算對', Words.match(sun, ' 太陽 ') === 'hit');
  check('答案比對：別名算對', Words.match(sun, '日') === 'hit');
  check('答案比對：兩個字的題目猜中一個字算「很接近」', Words.match(sun, '太楊') === 'close');
  check('答案比對：猜的字出現在答案裡的哪個位置都算「很接近」', Words.match(sun, '陽光') === 'close');
  check('答案比對：猜中別名裡的字也算「很接近」', Words.match(Words.byId('cat'), '咪咪') === 'close');
  check('答案比對：字數一樣但一個字都沒中算沒中', Words.match(Words.byId('cat'), '狗') === 'miss');
  const giraffe = Words.byId('giraffe');
  check('答案比對：三個字的題目要猜中兩個字才算「很接近」', Words.match(giraffe, '長頸') === 'close');
  check('答案比對：三個字的題目只猜中一個字算沒中', Words.match(giraffe, '鹿') === 'miss');
  const tea = Words.byId('bubbletea');
  check('答案比對：四個字的題目猜中兩個字算「很接近」', Words.match(tea, '奶茶') === 'close');
  check('答案比對：四個字的題目只猜中一個字算沒中', Words.match(tea, '奶昔') === 'miss');
  check('答案比對：同一個字重複打不會重複算', Words.match(tea, '奶奶') === 'miss');
  check('答案比對：門檻看題目字數，別名比較短也不會放寬', Words.match(tea, '珍珠') === 'close' && Words.match(tea, '珍') === 'miss');
  check('答案比對：完全不同算沒中', Words.match(sun, '月亮') === 'miss');
  check('答案比對：空字串算沒中', Words.match(sun, '   ') === 'miss');
  check('全形標點會被正規化掉', Words.normalize('太陽！') === '太陽');
  check('遮罩只露出指定的字', Words.maskOf(Words.byId('bubbletea'), [0, 2]) === '珍＿奶＿');

  /* 同一個種子要抽到同一批題目 */
  const a = Words.pick(RNG.createRng('seed-a'), 3, {});
  const b = Words.pick(RNG.createRng('seed-a'), 3, {});
  check('同一個種子抽到同一批題目', a.join() === b.join(), a.join() + ' vs ' + b.join());
  const diffOnly = Words.pick(RNG.createRng('x'), 5, { diff: 1 });
  check('可以只抽指定難度', diffOnly.every((id) => Words.byId(id).diff === 1));

  /* 混合難度要偏簡單：題庫裡困難題比簡單題多，整池亂抽會變成大部分都很難 */
  const mixCount = { 1: 0, 2: 0, 3: 0 };
  for (let i = 0; i < 300; i++) {
    Words.pick(RNG.createRng('mix-' + i), 3, {}).forEach((id) => { mixCount[Words.byId(id).diff] += 1; });
  }
  const mixTotal = mixCount[1] + mixCount[2] + mixCount[3];
  check('混合難度以簡單題為大宗', mixCount[1] / mixTotal > 0.4, JSON.stringify(mixCount));
  check('混合難度只放一成左右的困難題', mixCount[3] / mixTotal < 0.18, JSON.stringify(mixCount));

  /* 明星、電影、歷史、地理、公民、物理、天文、時事、成語都畫不太出來，一律算困難 */
  const HARD_CATS = ['star', 'movie', 'history', 'geography', 'civics', 'physics', 'astro', 'trend', 'idiom'];
  const leaked = Words.LIST.filter((w) => HARD_CATS.indexOf(w.cat) >= 0 && w.diff !== 3);
  check('專有名詞與抽象題一律歸困難', leaked.length === 0, leaked.slice(0, 5).map((w) => w.text + '/' + w.cat).join(' '));
}

/* ================================================================
   規則核心
   ================================================================ */
section('規則核心（rules.js）');
{
  const s1 = makeState();
  const s2 = makeState();
  check('同一個種子產生同一個畫家順序', s1.order.join() === s2.order.join(), s1.order.join());

  const st = makeState();
  /* 引擎本身只要求 1 個人就能開局——單機自己練習畫畫就是這樣，沒有電腦對手也能開始；
     線上房間要 2 個真人才能開始是房間層級的規則，見 lib/rooms.js 的 ROOM_MIN_PLAYERS。 */
  check('單機一個人也能開局', Rules.start(Rules.createState({ seed: 'X', players: [{ id: 'a', name: 'A' }] }), 0).ok);
  check('一個人都沒有無法開始', !Rules.start(Rules.createState({ seed: 'X', players: [] }), 0).ok);

  const started = Rules.start(st, 1000);
  check('開局成功', started.ok);
  check('開局後進入選題階段', st.phase === 'picking');
  check('抽出三個候選題目', st.choices.length === 3, st.choices.length);
  check('候選題目不重複', new Set(st.choices).size === 3);
  check('總題數 = 輪數 × 人數', st.totalTurns === st.rounds * st.players.length, st.totalTurns);

  /* --- 選題 --- */
  check('別人不能替畫家選題', !Rules.pickWord(st, otherThan(st.drawerId), st.choices[0], 1000).ok);
  check('不能選清單以外的題目', !Rules.pickWord(st, st.drawerId, 'not-a-word', 1000).ok);
  const picked = Rules.pickWord(st, st.drawerId, st.choices[1], 1000);
  check('畫家可以選題', picked.ok);
  check('選完進入作畫階段', st.phase === 'drawing');
  check('作畫截止時間 = 現在 + 每題秒數', st.deadline === 1000 + st.drawMs, st.deadline);

  /* --- 筆畫驗證 --- */
  check('鉛筆筆畫合法', !!Rules.sanitizeStroke({ t: 'pen', c: 1, w: 2, p: [0, 0, 10, 10] }));
  check('矩形一定要兩個點', Rules.sanitizeStroke({ t: 'rect', p: [0, 0, 10] }) === null);
  check('矩形兩點合法', !!Rules.sanitizeStroke({ t: 'rect', p: [0, 0, 10, 10] }));
  check('油漆桶只要一個點', !!Rules.sanitizeStroke({ t: 'fill', p: [5, 5] }));
  check('油漆桶不接受兩個點', Rules.sanitizeStroke({ t: 'fill', p: [5, 5, 6, 6] }) === null);
  check('座標會被夾在 0..1000', Rules.sanitizeStroke({ t: 'pen', p: [-50, 9999] }).p.join() === '0,1000');
  check('NaN 座標被擋下', Rules.sanitizeStroke({ t: 'pen', p: [0, NaN] }) === null);
  check('奇數長度的點陣列被擋下', Rules.sanitizeStroke({ t: 'pen', p: [0, 0, 5] }) === null);
  check('未知工具退回鉛筆', Rules.sanitizeStroke({ t: 'hack', p: [0, 0, 1, 1] }).t === 'pen');
  check('直線不能填滿', Rules.sanitizeStroke({ t: 'line', f: 1, p: [0, 0, 1, 1] }).f === 0);
  check('矩形可以填滿', Rules.sanitizeStroke({ t: 'rect', f: 1, p: [0, 0, 1, 1] }).f === 1);
  check('色號超出範圍會被夾住', Rules.sanitizeStroke({ t: 'pen', c: 999, p: [0, 0, 1, 1] }).c === Rules.COLORS.length - 1);

  /* --- 作畫權限 --- */
  check('只有畫家能畫', !Rules.addStroke(st, otherThan(st.drawerId), { t: 'pen', p: [1, 1, 2, 2] }).ok);
  check('畫家可以畫', Rules.addStroke(st, st.drawerId, { t: 'pen', p: [1, 1, 2, 2] }).ok);
  check('只有畫家能清除', !Rules.clearBoard(st, otherThan(st.drawerId)).ok);
  check('只有畫家能復原', !Rules.undoStroke(st, otherThan(st.drawerId)).ok);
  check('畫家可以復原', Rules.undoStroke(st, st.drawerId).ok);
  check('沒有筆畫時復原會被擋下', !Rules.undoStroke(st, st.drawerId).ok);

  /* --- 猜題 --- */
  const answer = Rules.word(st).text;
  const guesser = otherThan(st.drawerId);
  check('畫家不能猜自己的題目', !Rules.guess(st, st.drawerId, answer, 1000).ok);
  check('空白猜測被擋下', !Rules.guess(st, guesser, '   ', 1000).ok);
  const miss = Rules.guess(st, guesser, '一定不是這個答案', 1100);
  check('猜錯回 miss', miss.ok && miss.verdict === 'miss', miss.verdict);
  check('猜錯會被記次數', st.wrong[guesser] === 1, st.wrong[guesser]);

  const hit = Rules.guess(st, guesser, answer, 1200);
  check('猜對回 hit', hit.ok && hit.verdict === 'hit', hit.verdict);
  check('猜對有加分', hit.points > 0, hit.points);
  check('分數進到玩家身上', Rules.player(st, guesser).score === hit.points);
  check('同一個人不能再猜', !Rules.guess(st, guesser, answer, 1300).ok);

  /* 猜中一半以上的字（這裡只差最後一個字）→ close */
  const st2 = toDrawing(makeState({ seed: 'CLOSE1' }), 0);
  const ans2 = Rules.word(st2).text;
  if (ans2.length >= 2) {
    const nearMiss = ans2.slice(0, -1) + '龘';
    const near = Rules.guess(st2, otherThan(st2.drawerId), nearMiss, 100);
    check('猜中一半以上的字回 close', near.ok && near.verdict === 'close', near.verdict);
    check('close 不算猜中', !Rules.hasGuessed(st2, otherThan(st2.drawerId)));
  } else check('猜中一半以上的字回 close（答案太短，略過）', true);

  /* 分數：越早猜中越高，名次越後越低 */
  const early = scoreAt(0);
  const late = scoreAt(0.9);
  check('越早猜中分數越高', early > late, early + ' vs ' + late);
  const firstScore = orderScore(0);
  const thirdScore = orderScore(2);
  check('名次越前面分數越高', firstScore > thirdScore, firstScore + ' vs ' + thirdScore);

  function scoreAt(ratio) {
    const s = toDrawing(makeState({ seed: 'SCORE1' }), 0);
    const t = Math.round(s.drawMs * ratio);
    const r = Rules.guess(s, otherThan(s.drawerId), Rules.word(s).text, t);
    return r.points;
  }
  function orderScore(nth) {
    const s = toDrawing(makeState({
      seed: 'SCORE2',
      players: [{ id: 'd', name: 'D' }, { id: 'g1', name: 'G1' }, { id: 'g2', name: 'G2' }, { id: 'g3', name: 'G3' }]
    }), 0);
    const ans = Rules.word(s).text;
    const others = s.players.filter((p) => p.id !== s.drawerId).map((p) => p.id);
    let last = 0;
    for (let i = 0; i <= nth; i++) last = Rules.guess(s, others[i], ans, 0).points;
    return last;
  }
}

function otherThan(id) { return id === 'p1' ? 'p2' : 'p1'; }

/* ================================================================
   隱藏資訊：答案不能外流
   ================================================================ */
section('隱藏資訊（toPublic 投影）');
{
  const st = toDrawing(makeState({ seed: 'HIDE01' }), 0);
  const answer = Rules.word(st).text;
  const drawerId = st.drawerId;
  const other = otherThan(drawerId);

  const drawerView = Rules.toPublic(st, drawerId);
  const guesserView = Rules.toPublic(st, other);
  const spectatorView = Rules.toPublic(st, null);

  check('畫家看得到答案', drawerView.answer === answer, drawerView.answer);
  check('其他玩家看不到答案', guesserView.answer === null, guesserView.answer);
  check('觀戰者看不到答案', spectatorView.answer === null, spectatorView.answer);
  check('畫家還沒給提示時沒有遮罩', guesserView.hint.mask === '' && guesserView.hint.len === 0, guesserView.hint.mask);
  check('畫家還沒給提示時也沒有種類', guesserView.hint.cat === null && spectatorView.hint.cat === null);
  check('整份投影字串裡沒有答案', JSON.stringify(guesserView).indexOf(answer) < 0);
  check('觀戰者的投影裡也沒有答案', JSON.stringify(spectatorView).indexOf(answer) < 0);
  /* 給了第一張提示：字數（底線）才會出現 */
  Rules.giveHint(st, drawerId, 1);
  const afterLen = Rules.toPublic(st, other);
  check('第一張提示公開字數', afterLen.hint.len === answer.length &&
    afterLen.hint.mask.length === answer.length &&
    afterLen.hint.mask.indexOf(Words.MASK_CHAR) >= 0, afterLen.hint.mask);
  check('第一張提示還沒公開種類', afterLen.hint.cat === null);
  Rules.giveHint(st, drawerId, 2);
  check('第二張提示公開種類', Rules.toPublic(st, other).hint.cat === Words.byId(st.wordId).cat);

  /* 第三張提示翻哪個字是隨機的：兩個字的題目，第一個字和最後一個字都要翻得到 */
  const picked = new Set();
  for (let i = 0; i < 40; i++) {
    const hs = makeState({ seed: 'HINTPOS' + i });
    Rules.start(hs, 0);
    hs.choices[0] = 'rabbit';
    Rules.pickWord(hs, hs.drawerId, 'rabbit', 0);
    picked.add(hs.hintPlan[0]);
  }
  check('一個字提示不固定翻第一個字，最後一個字也翻得到', picked.has(0) && picked.has(1), [...picked].join(','));
  const one = makeState({ seed: 'HINTONE' });
  Rules.start(one, 0);
  one.choices[0] = 'cat';
  Rules.pickWord(one, one.drawerId, 'cat', 0);
  check('單字題沒有一個字提示（翻了就是答案）', one.hintPlan.length === 0, one.hintPlan.join(','));

  /* 選字清單只有畫家看得到 */
  const picking = makeState({ seed: 'HIDE02' });
  Rules.start(picking, 0);
  check('畫家看得到三個候選', Rules.toPublic(picking, picking.drawerId).choices.length === 3);
  check('其他人看不到候選', Rules.toPublic(picking, otherThan(picking.drawerId)).choices.length === 0);
  check('觀戰者看不到候選', Rules.toPublic(picking, null).choices.length === 0);

  /* 揭曉後才公開 */
  Rules.endTurn(st, st.drawMs, 'timeup');
  check('公布答案階段大家都看得到答案', Rules.toPublic(st, other).answer === answer);
}

/* ================================================================
   時間推進與回合切換
   ================================================================ */
section('時間推進（tick）');
{
  const st = makeState({ seed: 'TICK01', rounds: 1 });
  Rules.start(st, 0);
  const firstDrawer = st.drawerId;

  /* 選題逾時 → 自動幫他挑第一個 */
  const r1 = Rules.tick(st, st.pickMs + 1);
  check('選題逾時會自動挑題', st.phase === 'drawing', st.phase);
  check('自動挑題有事件', r1.events.some((e) => e.type === 'autopick'));
  check('自動挑的是第一個候選', st.wordId === st.choices[0]);

  /* 提示不會隨時間自動翻開，一律要畫家自己按 */
  const base = st.startedAt;
  Rules.tick(st, base + st.drawMs * 0.5);
  check('時間過去不會自動翻字', st.revealed.length === 0 && st.hints === 0, st.hints + '/' + st.revealed.length);
  Rules.tick(st, base + st.drawMs * 0.99);
  const answer = Rules.word(st).text;
  check('時間到底了還是不會自動給提示', st.hints === 0, st.hints);

  /* 作畫逾時 → 公布答案 */
  const r2 = Rules.tick(st, st.deadline + 1);
  check('作畫逾時進入公布答案', st.phase === 'reveal', st.phase);
  check('逾時有回合結束事件', r2.events.some((e) => e.type === 'turnend'));
  check('沒人猜中時畫家不加分', Rules.player(st, firstDrawer).score === 0);

  /* 公布完換下一位 */
  const r3 = Rules.tick(st, st.deadline + st.revealMs + 2);
  check('公布完換下一位畫家', st.drawerId !== firstDrawer, st.drawerId);
  check('換人有事件', r3.events.some((e) => e.type === 'turnstart'));
  check('題號往前走', st.turnNo === 2, st.turnNo);

  /* 全部猜中會提早結束 */
  const st2 = toDrawing(makeState({ seed: 'TICK02', rounds: 1 }), 0);
  const ans2 = Rules.word(st2).text;
  for (const p of st2.players) if (p.id !== st2.drawerId) Rules.guess(st2, p.id, ans2, 100);
  const r4 = Rules.tick(st2, 200);
  check('全部猜中就提早結束這一題', st2.phase === 'reveal', st2.phase);
  check('全員猜中畫家有額外加分', Rules.player(st2, st2.drawerId).score > 0, Rules.player(st2, st2.drawerId).score);
  check('提早結束的理由是 allcorrect', st2.log[st2.log.length - 1].reason === 'allcorrect');
  check('提早結束有事件', r4.events.some((e) => e.type === 'turnend'));
}

section('整局跑到底');
{
  const st = makeState({ seed: 'FULL01', rounds: 1, drawSec: 30 });
  Rules.start(st, 0);
  let t = 0;
  let guard = 0;
  while (!st.over && guard < 5000) {
    guard += 1;
    t += 500;
    if (st.phase === 'picking') Rules.pickWord(st, st.drawerId, st.choices[0], t);
    /* 一半的回合讓某個人猜中，另一半讓它逾時，兩條路都走到 */
    if (st.phase === 'drawing' && st.turnNo % 2 === 0) {
      const g = st.players.find((p) => p.id !== st.drawerId);
      Rules.guess(st, g.id, Rules.word(st).text, t);
    }
    Rules.tick(st, t);
  }
  check('一局可以跑到結束', st.over, 'guard=' + guard);
  check('每個人都當過畫家', st.players.every((p) => p.drew === st.rounds), st.players.map((p) => p.name + ':' + p.drew).join(','));
  check('題數等於總題數', st.log.length === st.totalTurns, st.log.length + '/' + st.totalTurns);
  check('有勝利者', st.winners.length >= 1, st.winners.join(','));
  const best = Math.max(...st.players.map((p) => p.score));
  check('勝利者就是最高分', st.winners.every((id) => Rules.player(st, id).score === best));
  check('結束後不能再猜', !Rules.guess(st, st.players[0].id, 'x', t + 1).ok);
}

section('單機自己一個人練習（沒有電腦對手）');
{
  /* 拔掉電腦對手之後，單機就是 1 個玩家、沒有猜題者：
     每一題只能靠自己按「跳過這題」或時間到才會結束，不會有「全部猜中」這條路。 */
  const st = Rules.createState({ seed: 'SOLO01', players: [{ id: 'you', name: '你' }], rounds: 3, drawSec: 60 });
  const started = Rules.start(st, 0);
  check('一個人也能開局', started.ok, started.error);
  check('唯一的玩家就是這一輪的畫家', st.drawerId === 'you');
  check('沒有猜題者', Rules.guesserIds(st).length === 0);

  let t = 0;
  let guard = 0;
  while (!st.over && guard < 2000) {
    guard += 1;
    t += 1000;
    if (st.phase === 'picking') Rules.pickWord(st, st.drawerId, st.choices[0], t);
    else if (st.phase === 'drawing') Rules.giveUp(st, st.drawerId, t); // 自己按「跳過這題」
    Rules.tick(st, t);
  }
  check('自己一個人也能把整局玩完', st.over, 'guard=' + guard);
  check('畫了 rounds 次', Rules.player(st, 'you').drew === st.rounds, Rules.player(st, 'you').drew);
  check('每一題都沒有人猜中（total=0）', st.log.every((e) => e.total === 0 && e.correct === 0));

  /* 只靠時間到（不手動跳過）也走得完，不會卡住 */
  const st2 = Rules.createState({ seed: 'SOLO02', players: [{ id: 'you', name: '你' }], rounds: 1, drawSec: 30 });
  Rules.start(st2, 0);
  let t2 = 0, guard2 = 0;
  while (!st2.over && guard2 < 2000) {
    guard2 += 1;
    t2 += 1000;
    if (st2.phase === 'picking') Rules.pickWord(st2, st2.drawerId, st2.choices[0], t2);
    Rules.tick(st2, t2);
  }
  check('不按任何按鈕、光靠時間到也能結束', st2.over, 'guard=' + guard2);

  /* 單機練習（unlimited）：真的不限時、不限次 —— 不會逾時自動挑題、不會時間到、不會跳結算 */
  const u = Rules.createState({ seed: 'SOLO03', players: [{ id: 'you', name: '你' }], rounds: 1, drawSec: 30, unlimited: true });
  Rules.start(u, 0);
  Rules.tick(u, 10 * 60 * 1000);
  check('不限時：選題放著十分鐘也不會自動挑', u.phase === 'picking' && u.deadline === 0, u.phase);
  Rules.pickWord(u, 'you', u.choices[0], 10 * 60 * 1000);
  Rules.tick(u, 50 * 60 * 60 * 1000);
  check('不限時：作畫放著五十個小時也不會時間到', u.phase === 'drawing' && u.deadline === 0, u.phase);
  let tu = 50 * 60 * 60 * 1000;
  for (let i = 0; i < 30; i++) {
    if (u.phase === 'picking') Rules.pickWord(u, 'you', u.choices[0], tu);
    if (u.phase === 'drawing') Rules.giveUp(u, 'you', tu);
    tu += 8000;
    Rules.tick(u, tu);
  }
  check('不限次：畫超過「每人畫幾次」也不會結束', !u.over && Rules.player(u, 'you').drew >= 15, Rules.player(u, 'you').drew);
  check('投影會告訴畫面這是不限時的練習', Rules.toPublic(u, 'you').unlimited === true);
}

section('長時間單機作畫不會被線上防洪上限擋住');
{
  const segment = { t: 'pen', c: 0, w: 1, p: Array.from({ length: 24 * 2 }, (_, i) => i * 4) };
  const longStroke = { t: 'pen', c: 0, w: 1, p: Array.from({ length: Rules.CONST.MAX_STROKE_POINTS * 2 }, (_, i) => i) };

  function drawRepeated(unlimited, stroke, count) {
    const state = toDrawing(Rules.createState({
      seed: 'SOLO-LONG', players: [{ id: 'you', name: '你' }], unlimited: unlimited
    }), 0);
    let result;
    for (let i = 0; i < count; i++) {
      if (unlimited) Rules.tick(state, (i + 1) * 220);
      result = Rules.addStroke(state, 'you', stroke);
      if (!result.ok) break;
    }
    return { state, result };
  }

  const solo = drawRepeated(true, segment, Rules.CONST.MAX_STROKES + 2);
  check('單機持續送出手繪分段，超過 600 段仍可作畫',
    solo.result.ok && solo.state.strokes.length === Rules.CONST.MAX_STROKES + 2, solo.result.error);
  check('超過原筆畫上限後復原仍更新點數',
    Rules.undoStroke(solo.state, 'you').ok && solo.state.pointCount === (Rules.CONST.MAX_STROKES + 1) * 24);

  const pointSegments = Math.floor(Rules.CONST.MAX_TOTAL_POINTS / Rules.CONST.MAX_STROKE_POINTS) + 1;
  const soloPoints = drawRepeated(true, longStroke, pointSegments);
  check('單機超過 30000 個累積點仍可作畫',
    soloPoints.result.ok && soloPoints.state.pointCount > Rules.CONST.MAX_TOTAL_POINTS, soloPoints.result.error);
  check('長時間作畫後仍可清除並重新畫',
    Rules.clearBoard(soloPoints.state, 'you').ok && soloPoints.state.pointCount === 0 &&
    soloPoints.state.strokes.length === 0 && Rules.addStroke(soloPoints.state, 'you', segment).ok);

  const limited = drawRepeated(false, segment, Rules.CONST.MAX_STROKES + 1);
  check('有限時對局仍保留筆畫防洪上限',
    limited.result.code === 'limit' && limited.state.strokes.length === Rules.CONST.MAX_STROKES);
  const limitedPoints = drawRepeated(false, longStroke, pointSegments);
  check('有限時對局仍保留累積點數防洪上限',
    limitedPoints.result.code === 'limit' && limitedPoints.state.pointCount <= Rules.CONST.MAX_TOTAL_POINTS);
}

section('單機作品存檔與載入');
{
  const original = toDrawing(Rules.createState({ seed: 'SAVE01', players: [{ id: 'me' }], unlimited: true }), 0);
  for (const t of Rules.TOOL_KEYS) {
    Rules.addStroke(original, 'me', { t, c: 2, w: 1, f: 1, p: t === 'fill' ? [500, 500] : [100, 100, 800, 800] });
  }
  const long = { t: 'pen', c: 3, w: 2, p: Array.from({ length: 800 }, (_, i) => i) };
  for (let i = 0; i < 80; i++) Rules.addStroke(original, 'me', long);
  for (let i = 0; i < 610; i++) Rules.addStroke(original, 'me', { t: 'pen', p: [300, 300, 400, 400] });
  const text = DrawingFile.encode(original);
  const restored = DrawingFile.decode(text, { id: 'me', name: '你' }, 500000);
  check('所有工具與超過原上限的筆畫可完整存檔往返',
    JSON.stringify(restored.strokes) === JSON.stringify(original.strokes) && restored.pointCount === original.pointCount);
  check('載入保留題目與不限時作畫狀態',
    restored.wordId === original.wordId && restored.phase === 'drawing' && restored.deadline === 0 && restored.unlimited);
  check('載入後仍可復原並繼續作畫',
    Rules.undoStroke(restored, 'me').ok && Rules.addStroke(restored, 'me', { t: 'rect', p: [0, 0, 50, 50] }).ok);
  check('載入建立獨立狀態，不會改掉原作品', original.strokes[original.strokes.length - 1].t === 'pen');

  function rejects(value) {
    try { DrawingFile.decode(value, { id: 'me' }, 0); return false; }
    catch (e) { return true; }
  }
  const data = JSON.parse(text);
  check('無效 JSON 與其他格式檔案會被拒絕', rejects('{') && rejects('{}'));
  check('不支援的存檔版本會被拒絕', rejects(JSON.stringify(Object.assign({}, data, { version: 2 }))));
  check('不存在的題目會被拒絕', rejects(JSON.stringify(Object.assign({}, data, { wordId: 'missing-word' }))));
  check('損壞的筆畫會被拒絕', rejects(JSON.stringify(Object.assign({}, data, { strokes: [{ t: 'pen', p: [1] }] }))));
}

section('成員中途離開');
{
  const st = toDrawing(makeState({ seed: 'LEAVE1' }), 0);
  const drawer = st.drawerId;
  const r = Rules.removePlayer(st, drawer, 100);
  check('畫家離開後這一題結束', r.ok && !!r.turnEnded, JSON.stringify(r).slice(0, 80));
  check('離開的人不在名單裡', !Rules.player(st, drawer));

  const st2 = toDrawing(makeState({ seed: 'LEAVE2' }), 0);
  const gone = otherThan(st2.drawerId);
  Rules.removePlayer(st2, gone, 100);
  check('三個人少一個還有兩個，對局繼續', !st2.over, st2.phase);

  /* 只剩一個人就沒得玩了 */
  const st3 = toDrawing(makeState({
    seed: 'LEAVE3',
    players: [{ id: 'p1', name: 'A' }, { id: 'p2', name: 'B' }]
  }), 0);
  Rules.removePlayer(st3, 'p2', 100);
  check('剩下人數不足時整局結束', st3.over, st3.phase);
  check('不足人數結束後會算出勝利者', st3.winners.length >= 1, st3.winners.join(','));
}

/* ================================================================
   電腦對手
   ================================================================ */
section('電腦對手（ai.js）');
{
  check('三個難度都存在', AI.LEVEL_KEYS.length === 3 && AI.LEVEL_KEYS.every((k) => !!AI.LEVELS[k]));

  /* 作畫：難度只影響完整度與速度，不影響合法性 */
  const wordId = 'cat';
  const full = Words.strokesOf(wordId).length;
  const plans = {};
  for (const lv of AI.LEVEL_KEYS) {
    plans[lv] = AI.planDrawing(wordId, lv, RNG.createRng('plan:' + lv), 80000);
  }
  check('簡單畫得比普通少', plans.easy.length < plans.normal.length, plans.easy.length + ' < ' + plans.normal.length);
  check('困難會把配方畫完整', plans.hard.length === full, plans.hard.length + '/' + full);
  check('困難比簡單畫得快', last(plans.hard).at < last(plans.easy).at, last(plans.hard).at + ' < ' + last(plans.easy).at);

  let illegal = 0;
  for (const lv of AI.LEVEL_KEYS) {
    for (const step of plans[lv]) {
      if (!Rules.sanitizeStroke(step.stroke)) illegal += 1;
      for (const v of step.stroke.p) if (v < 0 || v > Words.BOX) illegal += 1;
    }
  }
  check('三個難度畫的每一筆都合法', illegal === 0, illegal);

  /* 抖動：簡單抖得比困難明顯 */
  const src = Words.strokesOf(wordId)[0].p;
  const jitterOf = (lv) => {
    const out = AI.wobble(src, AI.levelOf(lv).jitter, RNG.createRng('j:' + lv));
    let sum = 0;
    for (let i = 0; i < src.length; i++) sum += Math.abs(out[i] - src[i]);
    return sum / src.length;
  };
  check('簡單的手比困難抖', jitterOf('easy') > jitterOf('hard'), jitterOf('easy').toFixed(1) + ' > ' + jitterOf('hard').toFixed(1));

  /* 猜題：只吃公開投影，拿不到答案 */
  const st = toDrawing(makeState({ seed: 'AIGUE1', players: [
    { id: 'p1', name: '人' }, { id: 'ai1', name: '電腦', ai: 'hard' }
  ] }), 0);
  /* 讓人類當畫家：如果抽到電腦先畫就換一組種子 */
  const view = Rules.toPublic(st, 'ai1');
  check('AI 拿到的投影不含答案', view.answer === null || st.drawerId === 'ai1');

  const ranked = AI.rankCandidates(Rules.toPublic(st, 'zzz'), 'hard');
  check('沒有任何筆畫時排不出候選', ranked.length === 0, ranked.length);

  /* 畫上配方後，候選裡應該找得到那一題 */
  const target = 'sun';
  const st3 = makeState({ seed: 'AIGUE2', players: [{ id: 'd', name: 'D' }, { id: 'ai1', name: 'AI', ai: 'hard' }] });
  Rules.start(st3, 0);
  st3.choices = [target, st3.choices[1], st3.choices[2]];
  Rules.pickWord(st3, st3.drawerId, target, 0);
  const drawer = st3.drawerId;
  for (const s of Words.strokesOf(target)) Rules.addStroke(st3, drawer, { t: 'pen', p: s.p.map((v) => Math.round(v)) });
  const guesserId = drawer === 'd' ? 'ai1' : 'd';
  const rank2 = AI.rankCandidates(Rules.toPublic(st3, guesserId), 'hard');
  check('照配方畫出來時，正確答案排第一', rank2.length > 0 && rank2[0].id === target, rank2.slice(0, 3).map((c) => c.id).join(','));

  /* 畫家還沒給提示：電腦得在整個題庫裡找，不知道分類 */
  const cat = Words.byId(target).cat;
  check('沒有提示時，候選不限分類', rank2.some((c) => Words.byId(c.id).cat !== cat));

  /* 畫家給了「種類」這張提示之後，候選才收斂到那個分類 */
  Rules.giveHint(st3, drawer, 1);
  Rules.giveHint(st3, drawer, 2);
  const rank3 = AI.rankCandidates(Rules.toPublic(st3, guesserId), 'hard');
  check('給了種類提示後，候選只在那個分類裡', rank3.length > 0 && rank3.every((c) => Words.byId(c.id).cat === cat));
  check('給了字數提示後，正確答案仍排第一', rank3[0].id === target, rank3.slice(0, 3).map((c) => c.id).join(','));

  /* 難度差異：固定情境下的猜中率與速度 */
  const stats = {};
  for (const lv of AI.LEVEL_KEYS) stats[lv] = simulate(lv, 80);
  check('猜中率：困難 ≥ 普通 > 簡單',
    stats.hard.rate >= stats.normal.rate && stats.normal.rate > stats.easy.rate,
    JSON.stringify(stats));
  check('猜中速度：困難比普通快', stats.hard.avg < stats.normal.avg, JSON.stringify(stats));
  /* 簡單的電腦八十場只猜中個位數次，平均時間是雜訊；它慢不慢看的是開口時間與猜測間隔 */
  const E = AI.LEVELS.easy, N = AI.LEVELS.normal;
  check('猜中速度：簡單開口比普通晚、猜得比普通疏',
    E.firstMs > N.firstMs && E.intervalMs > N.intervalMs, JSON.stringify({ easy: [E.firstMs, E.intervalMs], normal: [N.firstMs, N.intervalMs] }));
  check('每個難度都至少猜中過一次', AI.LEVEL_KEYS.every((lv) => stats[lv].hits > 0), JSON.stringify(stats));

  function last(arr) { return arr[arr.length - 1]; }

  /** 電腦畫、同難度的電腦猜，統計猜中率與平均猜中時間 */
  function simulate(level, trials) {
    let hits = 0, sum = 0, guesses = 0;
    for (let i = 0; i < trials; i++) {
      const rng = RNG.createRng('sim:' + level + ':' + i);
      const s = Rules.createState({
        seed: 'S' + i,
        players: [{ id: 'a', name: '畫家', ai: level }, { id: 'b', name: '猜手', ai: level }],
        rounds: 1, drawSec: 80
      });
      Rules.start(s, 0);
      const wid = AI.chooseWord(s.choices, level, rng);
      Rules.pickWord(s, 'a', wid, 0);
      const plan = AI.planDrawing(wid, level, rng, s.drawMs);
      const g = AI.createGuesser('b', level);
      let now = 0, pi = 0, done = false;
      while (now <= s.drawMs && !done) {
        while (pi < plan.length && plan[pi].at <= now) { Rules.addStroke(s, 'a', plan[pi].stroke); pi += 1; }
        Rules.tick(s, now);
        if (s.phase !== 'drawing') break;
        const say = AI.think(g, Rules.toPublic(s, 'b'), now, rng);
        if (say) {
          guesses += 1;
          const r = Rules.guess(s, 'b', say.text, now);
          if (r.ok && r.verdict === 'hit') { hits += 1; sum += now; done = true; }
        }
        now += 500;
      }
    }
    return { hits, rate: +(hits / trials).toFixed(3), avg: hits ? Math.round(sum / hits) : 999999, guesses };
  }
}

section('電腦對手不會偷看答案');
{
  /* rankCandidates 只吃 toPublic 的結果；把答案抽掉也不影響它的輸出 */
  const st = makeState({ seed: 'NOCHEAT', players: [{ id: 'd', name: 'D' }, { id: 'g', name: 'G', ai: 'hard' }] });
  Rules.start(st, 0);
  Rules.pickWord(st, st.drawerId, 'tree', 0);
  const drawerId = st.drawerId;
  for (const s of Words.strokesOf('tree')) Rules.addStroke(st, drawerId, { t: 'pen', p: s.p.map(Math.round) });
  const guesserId = drawerId === 'd' ? 'g' : 'd';

  const view = Rules.toPublic(st, guesserId);
  const stripped = JSON.parse(JSON.stringify(view));
  stripped.answer = null;
  const a = AI.rankCandidates(view, 'hard').map((c) => c.id).join();
  const b = AI.rankCandidates(stripped, 'hard').map((c) => c.id).join();
  check('把答案欄位拿掉，AI 的候選排序完全不變', a === b);
  check('AI 用的投影本來就沒有答案', view.answer === null, view.answer);
}

/* ================================================================
   房間狀態機
   ================================================================ */
section('房間狀態機（lib/rooms.js）');
{
  const store = new RoomStore({});
  let t = 1000;
  const created = store.create('u1', { name: '阿明', roomName: '測試房', now: t });
  check('可以開房', created.ok);
  const configured = store.create('u-create', {
    name: '設定房主', roomName: '預先設定房',
    settings: { rounds: 3, drawSec: 120, diff: 3 }, now: t
  });
  check('開房時可以套用房主規則', configured.ok && configured.room.settings.rounds === 3 && configured.room.settings.drawSec === 120 && configured.room.settings.diff === 3);
  check('線上房間沒有電腦對手可以加', typeof configured.room.addAi !== 'function');
  const room = created.room;
  check('房號是 4 個字', room.code.length === 4, room.code);
  check('開房的人是房主', room.isHost('u1'));
  check('開房的人是玩家', room.member('u1').role === 'player');

  /* 線上房間至少要兩個真人才能開始，跟單機引擎允許 1 個人開局（Rules.CONST.MIN_PLAYERS）分開算：
     一個人只準備好還是不能開始，要去玩單機練習。 */
  room.setReady('u1', true);
  check('只有一個真人不能開始線上對局', !room.canStart().ok, room.canStart().error);
  room.setReady('u1', false);

  check('第二個人可以加入', room.join('u2', { name: '小華', role: 'player', now: t }).ok);
  check('觀戰者可以加入', room.join('s1', { name: '觀眾', role: 'spectator', now: t }).ok);
  check('實體玩家數 = 2', room.humanPlayers().length === 2, room.humanPlayers().length);
  check('觀戰者不算實體玩家', room.spectators().length === 1);

  check('席位數只算真人', room.seatsTaken() === 2, room.seatsTaken());

  /* 聊天室：只在等待畫面（房間還沒開始）開放，避免有人不小心把答案打進聊天室外流 */
  {
    check('等待畫面可以聊天', room.chat('u1', '大家好，準備好了嗎？', t).ok);
    check('聊天紀錄進得去投影', room.viewFor('u1', t).room.chat.some((c) => c.text === '大家好，準備好了嗎？'));
    check('不在房間裡的人不能聊天', !room.chat('nobody', '嗨', t).ok);
    check('空白訊息會被擋下', !room.chat('u1', '   ', t).ok);
    check('太快再聊會被擋下', !room.chat('u1', '再一句', t).ok);
    const longMsg = room.chat('u2', '一'.repeat(500), t + 1000);
    check('太長的訊息會被截斷', longMsg.ok && longMsg.entry.text.length <= 200, longMsg.entry && longMsg.entry.text.length);
    check('觀戰者也能聊天', room.chat('s1', '我先看看', t + 1000).ok);
  }

  check('沒準備時不能開始', !room.canStart().ok, room.canStart().error);
  room.setReady('u2', true);
  check('房主不用按準備：其他玩家都準備好就能開始', room.canStart().ok, room.canStart().error);
  room.setReady('u2', false);
  check('其他玩家還沒準備就不能開始（房主準備了也一樣）', (room.setReady('u1', true), !room.canStart().ok), room.canStart().error);
  room.setReady('u2', true);
  check('觀戰者不能按準備', !room.setReady('s1', true).ok);
  check('都準備好就能開始', room.canStart().ok, room.canStart().error);
  check('只有房主能開始', !room.start('u2', t).ok);
  check('房主開始成功', room.start('u1', t).ok);
  check('對局進行中', room.phase === 'playing' && !!room.state);
  check('兩個真人都在名單裡', room.state.players.length === 2, room.state.players.length);
  check('對局進行中不能聊天', !room.chat('u1', '開始之後還能聊嗎', t).ok);
  check('投影裡的聊天紀錄在對局中是空的（不送舊訊息）', room.viewFor('u1', t).room.chat.length === 0);

  /* 觀戰者的權限 */
  check('觀戰者不能畫', !room.stroke('s1', { t: 'pen', p: [1, 1, 2, 2] }, t).ok);
  check('觀戰者不能猜', !room.guess('s1', '太陽', t).ok);
  check('觀戰者不能選題', !room.pickWord('s1', 'sun', t).ok);
  check('觀戰者不能跳過', !room.skipTurn('s1', t).ok);
  const sv = room.viewFor('s1', t);
  check('觀戰者的投影不含答案', !sv.game.answer, sv.game.answer);
  check('觀戰者的權限旗標都是不能操作', !sv.you.can.draw && !sv.you.can.guess && !sv.you.can.pick);

  /* 線上房間只有真人，畫家一定是真人 */
  check('畫家一定是真人', room.state.drawerId.indexOf('ai') !== 0, room.state.drawerId);
  const drawerId = room.state.drawerId;
  const humanGuesser = ['u1', 'u2'].find((id) => id !== drawerId);
  if (room.state.phase === 'picking') room.pickWord(drawerId, room.state.choices[0], t);
  check('真人畫家可以選題並進入作畫', room.state.phase === 'drawing', room.state.phase);

  /* 「畫完了」只是通知，不會結束這一題 */
  {
    const turn0 = room.state.turnNo;
    check('只有畫家能說畫完了', !room.markDone(humanGuesser, t).ok);
    check('觀戰者不能說畫完了', !room.markDone('s1', t).ok);
    const done1 = room.markDone(drawerId, t);
    check('畫家可以說畫完了', done1.ok, done1.error);
    check('說完畫完了這一題不會結束', room.state.turnNo === turn0 && room.state.phase === 'drawing', room.state.phase);
    check('說完畫完了畫家還是畫家', room.state.drawerId === drawerId);
    check('同一題可以再說一次畫完了（不鎖、不擋重複）', room.markDone(drawerId, t).ok);
    check('投影看得出畫家已經說畫完了', room.viewFor(drawerId, t).room.drawerDone === true);
  }

  const answer = Rules.word(room.state).text;
  t += 1000;
  const miss = room.guess(humanGuesser, '絕對不是這個', t);
  check('猜錯會寫進猜題紀錄', miss.ok && miss.kind === 'miss' && !!miss.entry, JSON.stringify(miss).slice(0, 60));
  check('猜題紀錄裡看得到那一次猜測', room.feed.some((f) => f.kind === 'guess' && f.text === '絕對不是這個'));
  check('太快再猜會被擋下', !room.guess(humanGuesser, '再一次', t).ok);
  check('畫家沒有猜題的權限', !room.guess(drawerId, answer, t + 1000).ok);
  t += 1000;
  const hit = room.guess(humanGuesser, answer, t);
  check('猜對回 hit', hit.ok && hit.kind === 'hit', JSON.stringify(hit).slice(0, 60));
  check('猜對的內容不會出現在紀錄裡', !room.feed.some((f) => f.kind === 'guess' && f.text === answer));
  check('紀錄裡只公布「某某猜對了」', room.feed.some((f) => f.kind === 'correct' && f.key === 'srv.feed.correct' && f.params.name));
  check('摘要在揭曉前不會寫出答案', room.summary.every((s) => s.kind === 'reveal' || !JSON.stringify(s.params || {}).includes(answer)));
  check('猜對的人不能再猜', !room.guess(humanGuesser, answer, t + 2000).ok);

  /* 邀請連結 */
  const inv = room.createInvite('u1', { role: 'spectator', ttlMs: 60000, maxUses: 2, now: t });
  check('房主可以產生邀請連結', inv.ok);
  check('邀請 token 夠長猜不到', inv.invite.token.length === 32, inv.invite.token.length);
  check('邀請連結可以驗證', room.checkInvite(inv.invite.token, t).ok);
  check('假 token 會被拒絕', !room.checkInvite('0'.repeat(32), t).ok);
  check('過期的連結會被拒絕', !room.checkInvite(inv.invite.token, t + 120000).ok);
  const joined = room.join('s2', { name: '觀眾二', token: inv.invite.token, role: 'player', now: t });
  check('token 指定觀戰時不會因為要求玩家而變成玩家', joined.ok && joined.member.role === 'spectator', joined.member && joined.member.role);
  check('撤銷後連結失效', room.revokeInvite('u1', inv.invite.token).ok && !room.checkInvite(inv.invite.token, t).ok);
  check('別人不能撤銷不是自己發的連結', !room.revokeInvite('u2', 'nope').ok);

  /* 暱稱消毒 */
  const longName = room.join('u9', { name: '一二三四五六七八九十一二三四五', role: 'spectator', now: t });
  check('過長的暱稱會被截斷', longName.ok && longName.member.name.length <= 12, longName.member && longName.member.name.length);
}

section('房間生命週期：沒有實體玩家就關閉');
{
  const store = new RoomStore({});
  let t = 1000;
  const room = store.create('h1', { name: '房主', now: t }).room;
  room.join('s1', { name: '觀眾', role: 'spectator', now: t });
  check('有真人玩家時不該關閉', !room.shouldClose());

  room.leave('h1', t);
  check('最後一個真人離開後就該關閉', room.shouldClose());
  const swept = store.sweep(t + 1);
  check('定時工作會把它關掉', swept.closed.length === 1 && room.closed, swept.closed.length);
  check('關閉原因講清楚只剩觀戰者', room.closedReason === 'srv.closed.onlySpectators', room.closedReason);
  check('關閉後邀請全部失效', [...room.invites.values()].every((i) => i.revoked));
  check('關閉後對局狀態被清掉（計時器停工）', room.state === null);
  check('關閉的房間不會出現在大廳列表', store.list().every((r) => r.code !== room.code));
  check('關閉的房間用房號也找不到', store.get(room.code) === null);
  check('關閉後不能再加入（重連也救不回來）', !room.join('h1', { name: '房主', role: 'player', now: t + 2 }).ok);
  check('關閉的房間觀戰者還查得到狀態', store.getAny(room.code) === room);

  /* 只剩觀戰者也要關 */
  const store2 = new RoomStore({});
  const r2 = store2.create('h2', { name: '房主', now: t }).room;
  r2.join('s2', { name: '觀眾2', role: 'spectator', now: t });
  r2.leave('h2', t);
  check('只剩觀戰者也要關閉', r2.shouldClose());
}

section('斷線保留與重新連線');
{
  const store = new RoomStore({ graceMs: 1000 });
  let t = 1000;
  const room = store.create('a', { name: 'A', now: t }).room;
  room.join('b', { name: 'B', role: 'player', now: t });

  room.disconnect('b', t);
  check('斷線後座位先保留', !!room.member('b') && room.member('b').connected === false);
  store.sweep(t + 500);
  check('保留期間內不會被踢掉', !!room.member('b'));

  const back = room.join('b', { name: 'B', role: 'player', now: t + 600 });
  check('重新連線回到原本的位子', back.ok && back.reconnected === true);
  check('重連後標記為已連線', room.member('b').connected === true);

  room.disconnect('b', t + 700);
  store.sweep(t + 2000);
  check('超過保留時間就會被踢掉', !room.member('b'));
  check('房主還在，房間不關', !room.closed && !room.shouldClose());
}

section('滿房與觀戰轉換');
{
  const store = new RoomStore({ maxPlayers: 2 });
  const t = 1000;
  const room = store.create('a', { name: 'A', now: t }).room;
  room.settings.maxPlayers = 2;
  room.join('b', { name: 'B', role: 'player', now: t });
  check('席位已滿', room.openSeats() === 0, room.openSeats());
  const third = room.join('c', { name: 'C', role: 'player', now: t });
  check('滿房時想當玩家會被明確降為觀戰', third.ok && third.downgraded && third.member.role === 'spectator');
  check('滿房時觀戰者無法下場', !room.becomePlayer('c').ok);
  room.leave('b', t);
  check('有人離開後觀戰者可以下場', room.becomePlayer('c').ok && room.member('c').role === 'player');

  room.setReady('a', true);
  room.setReady('c', true);
  room.start('a', t);

  /* 對局進行中還有空位：中途加入直接當玩家，排在目前順位的最後一位 */
  const totalBefore = room.state.totalTurns;
  const orderBefore = room.state.order.length;
  room.settings.maxPlayers = 4;
  const late = room.join('d', { name: 'D', role: 'player', now: t });
  check('對局進行中還有空位就能直接加入當玩家', late.ok && late.member.role === 'player', JSON.stringify(late));
  check('中途加入的人會被排進這一局的名單', !!Rules.player(room.state, 'd'));
  check('中途加入排在順位最後一位', room.state.order[room.state.order.length - 1] === 'd', room.state.order.join(','));
  check('總題數跟著人數重新計算', room.state.totalTurns === room.state.rounds * (orderBefore + 1),
    totalBefore + '->' + room.state.totalTurns);

  /* 位子滿了的話，對局進行中一樣會被降為觀戰，也一樣下不了場 */
  room.settings.maxPlayers = 3;
  const full = room.join('e', { name: 'E', role: 'player', now: t });
  check('對局進行中位子滿了一樣降為觀戰', full.ok && full.downgraded && full.member.role === 'spectator');
  check('對局進行中位子滿著就不能下場', !room.becomePlayer('e', t).ok);

  /* 有空位之後，原本的觀戰者也能直接下場，一樣排在最後一位 */
  room.settings.maxPlayers = 5;
  const upgraded = room.becomePlayer('e', t);
  check('對局進行中有空位就能直接下場', upgraded.ok, JSON.stringify(upgraded));
  check('下場的人也排在順位最後一位', room.state.order[room.state.order.length - 1] === 'e', room.state.order.join(','));
}

section('房主設定與再玩一局');
{
  const store = new RoomStore({});
  const t = 1000;
  const room = store.create('a', { name: 'A', now: t }).room;
  room.join('b', { name: 'B', role: 'player', now: t });

  check('只有房主能改規則', !room.setSettings('b', { rounds: 3 }).ok);
  check('房主可以改輪數', room.setSettings('a', { rounds: 3 }).ok && room.settings.rounds === 3);
  check('超出範圍的輪數被拒絕', !room.setSettings('a', { rounds: 99 }).ok);
  /* 沒取名字的人不能全都叫「玩家」 */
  {
    const anonStore = new RoomStore({});
    const anon = anonStore.create('a1', { name: '', now: 1000 }).room;
    anon.join('a2', { name: '玩家', role: 'player', now: 1000 });
    const anonNames = [...anon.members.values()].map((m) => m.name);
    check('沒給名字會自動配一個可愛暱稱', anonNames.every((n) => n && n !== '玩家' && n.length >= 3), anonNames.join(','));
  }

  /* 同名的人要分得出來：猜題紀錄與席位卡都只認名字 */
  {
    const dupStore = new RoomStore({});
    const dup = dupStore.create('h', { name: '小明', now: 1000 }).room;
    dup.join('m1', { name: '小明', role: 'player', now: 1000 });
    dup.join('m2', { name: '小明', role: 'player', now: 1000 });
    const names = [...dup.members.values()].map((m) => m.name);
    check('同一間房不會有兩個一樣的名字', new Set(names).size === names.length, names.join(','));
    check('重複的名字自動接編號', names.indexOf('小明2') >= 0, names.join(','));
  }

  check('超出範圍的秒數被拒絕', !room.setSettings('a', { drawSec: 5 }).ok);
  check('超過上限的秒數被拒絕（180 已移除）', !room.setSettings('a', { drawSec: 180 }).ok);
  check('可以指定題目難度', room.setSettings('a', { diff: 1 }).ok && room.settings.diff === 1);
  check('不合法的難度被拒絕', !room.setSettings('a', { diff: 9 }).ok);

  room.setSettings('a', { rounds: 1, drawSec: 60 });
  room.setReady('a', true);
  room.setReady('b', true);
  room.start('a', t);
  check('規則有套用到對局', room.state.rounds === 1 && room.state.drawMs === 60000);

  /* 把一局跑完 */
  let now = t;
  let guard = 0;
  while (room.phase === 'playing' && guard < 4000) {
    guard += 1;
    now += 500;
    if (room.state && room.state.phase === 'picking') room.pickWord(room.state.drawerId, room.state.choices[0], now);
    room.tick(now);
  }
  check('房間對局可以跑到結束', room.phase === 'finished', 'guard=' + guard);
  check('結束後有結算訊息', room.feed.some((f) => f.key === 'srv.feed.win' || f.key === 'srv.feed.tie'));

  /* 結算完不再是「全員投票直接開新局」，而是房主帶大家回到等待畫面 */
  check('結算畫面可以聊天（答案都公布了）', room.chat('b', '好好玩！', now).ok);
  check('結算畫面不能直接開始新的一局', !room.start('a', now).ok);
  check('只有房主可以帶大家回房間', !room.returnToRoom('b', now).ok);
  check('房主可以帶大家回房間', room.returnToRoom('a', now).ok && room.phase === 'waiting' && room.state === null);
  check('回房間後大家要重新準備', !room.member('b').ready);
  check('回房間後可以改規則', room.setSettings('a', { rounds: 2 }).ok && room.settings.rounds === 2);
  room.setReady('b', true);
  check('其他人準備好就能再開一局', room.start('a', now).ok && room.phase === 'playing');
}

section('一直有人中途加入，最後順位就一直往後移');
{
  const store = new RoomStore({ maxPlayers: 8 });
  const t = 1000;
  const room = store.create('a', { name: 'A', now: t }).room;
  room.join('b', { name: 'B', role: 'player', now: t });
  room.setReady('a', true);
  room.setReady('b', true);
  room.start('a', t);

  const seq = ['c', 'd', 'e'];
  for (let i = 0; i < seq.length; i++) {
    const id = seq[i];
    const before = room.state.order.length;
    room.join(id, { name: id.toUpperCase(), role: 'player', now: t + i + 1 });
    check(id + ' 加入後排在目前的最後一位', room.state.order[room.state.order.length - 1] === id,
      room.state.order.join(','));
    check(id + ' 加入後總題數等於「輪數 × 目前人數」', room.state.totalTurns === room.state.rounds * (before + 1),
      room.state.totalTurns);
  }
  check('最後順位跟著加入順序一路往後移',
    room.state.order.indexOf('c') < room.state.order.indexOf('d') &&
    room.state.order.indexOf('d') < room.state.order.indexOf('e'),
    room.state.order.join(','));

  /* 把整場（含中途一直加入）跑到底，確認真的會結束，不會因為人數一直變而卡住 */
  let now = t + seq.length + 1;
  let guard = 0;
  while (room.phase === 'playing' && guard < 8000) {
    guard += 1;
    now += 500;
    if (room.state && room.state.phase === 'picking') room.pickWord(room.state.drawerId, room.state.choices[0], now);
    room.tick(now);
  }
  check('人數一直變動，這一場還是會正常結束', room.phase === 'finished', 'guard=' + guard);
  check('結束時五個人都在最終名單與比分裡',
    ['a', 'b', 'c', 'd', 'e'].every((id) => !!Rules.player(room.state, id)),
    room.state.players.map((p) => p.id).join(','));
}

section('中途加入的玩家可以順利再玩一局');
{
  /* 修正過的 bug：中途加入的玩家以前一律先被降為觀戰，
     這一局結束後常常忘記手動下場，結果「再玩一局」永遠等不到他投票。
     現在中途加入就直接是玩家，這裡驗證他從頭到尾都在名單裡，
     結束後可以直接投票，票數到齊也真的能重開一局。 */
  const store = new RoomStore({});
  const t = 1000;
  const room = store.create('a', { name: 'A', now: t }).room;
  room.join('b', { name: 'B', role: 'player', now: t });
  room.setSettings('a', { rounds: 1, drawSec: 60 });
  room.setReady('a', true);
  room.setReady('b', true);
  room.start('a', t);

  const joined = room.join('c', { name: 'C', role: 'player', now: t + 100 });
  check('中途加入的玩家一開始就是玩家，不是觀戰', joined.ok && joined.member.role === 'player');

  let now = t + 100;
  let guard = 0;
  while (room.phase === 'playing' && guard < 6000) {
    guard += 1;
    now += 500;
    if (room.state && room.state.phase === 'picking') room.pickWord(room.state.drawerId, room.state.choices[0], now);
    room.tick(now);
  }
  check('三個人的對局可以跑到結束', room.phase === 'finished', 'guard=' + guard);
  check('中途加入的玩家有被算進最終名單', !!Rules.player(room.state, 'c'));

  check('房主帶大家回房間', room.returnToRoom('a', now).ok);
  check('中途加入的玩家回房間後還是玩家', room.member('c').role === 'player');
  room.setReady('b', true);
  room.setReady('c', true);
  const started = room.start('a', now);
  check('三個人都準備好就能再開一局，不會卡住', started.ok && room.phase === 'playing', JSON.stringify(started.error || ''));
  check('新的一局三個人都在名單裡', ['a', 'b', 'c'].every((id) => !!Rules.player(room.state, id)),
    room.state.players.map((p) => p.id).join(','));
}

/* ================================================================
   排查出來的 bug：一個一個釘住，以後不會再壞
   ================================================================ */

/** 開一間房、n 個人、跑到開局；回傳 room */
function startedRoom(ids, rounds) {
  const store = new RoomStore({});
  const room = store.create(ids[0], { name: ids[0].toUpperCase(), now: 1000 }).room;
  for (const id of ids.slice(1)) room.join(id, { name: id.toUpperCase(), role: 'player', now: 1000 });
  room.setSettings(ids[0], { rounds: rounds || 1, drawSec: 60 });
  for (const id of ids) room.setReady(id, true);
  room.start(ids[0], 1000);
  return room;
}
/** 把目前這一題收掉（畫家跳過），推進到下一題的選題階段 */
function finishTurn(room, now) {
  if (room.state.phase === 'picking') room.pickWord(room.state.drawerId, room.state.choices[0], now);
  room.skipTurn(room.state.drawerId, now);
  room.tick(now + 8000);
  return now + 8000;
}

section('有人離開時畫家順序不會跳過或重複');
{
  /* 畫家本人在作畫中離開：下一位不能被跳過 */
  const room = startedRoom(['a', 'b', 'c', 'd'], 1);
  const order = room.state.order.slice();
  let now = 2000;
  now = finishTurn(room, now);                       // 第 1 位畫完
  const second = room.state.drawerId;
  room.pickWord(second, room.state.choices[0], now);
  room.leave(second, now);                           // 第 2 位畫到一半離開
  room.tick(now + 8000); now += 8000;
  const expectThird = order[order.indexOf(second) + 1];
  check('畫家離開後輪到原本的下一位（不跳過）', room.state.drawerId === expectThird, room.state.drawerId + ' vs ' + expectThird);

  /* 跑完整局：每個還在的人都剛好畫 1 次 */
  let guard = 0;
  while (room.phase === 'playing' && guard++ < 50) now = finishTurn(room, now);
  const drew = room.state.players.map((p) => p.id + ':' + p.drew).join(',');
  check('每個還在的人都剛好畫滿（沒人少畫、沒人多畫）', room.state.players.every((p) => p.drew === 1), drew);
}
{
  /* 順位最後一個人在作畫中離開：不能讓第一位連畫兩次、也不能提早結束 */
  const room = startedRoom(['a', 'b', 'c'], 2);
  let now = 2000;
  now = finishTurn(room, now);
  now = finishTurn(room, now);                       // 前兩位畫完，輪到順位最後一位
  const last = room.state.drawerId;
  room.leave(last, now);
  room.tick(now + 8000); now += 8000;
  let guard = 0;
  while (room.phase === 'playing' && guard++ < 50) now = finishTurn(room, now);
  const drew = room.state.players.map((p) => p.id + ':' + p.drew).join(',');
  check('最後一位離開後，剩下的人還是各畫滿 2 次', room.state.players.every((p) => p.drew === 2), drew);
}
{
  /* 後段有人離開：總題數不能掉到目前題號以下而讓整局提早結束 */
  const room = startedRoom(['a', 'b', 'c'], 2);
  let now = 2000;
  for (let i = 0; i < 3; i++) now = finishTurn(room, now);
  const guesser = room.state.order.find((id) => id !== room.state.drawerId);
  room.leave(guesser, now);
  check('後段有人離開不會提早結束', room.phase === 'playing', room.phase);
  let guard = 0;
  while (room.phase === 'playing' && guard++ < 50) now = finishTurn(room, now);
  check('剩下的人都畫滿 2 次才結束', room.state.players.every((p) => p.drew === 2),
    room.state.players.map((p) => p.id + ':' + p.drew).join(','));
}
{
  /* 最後一輪才加入的人：總題數要跟著加，最後題號也不會超過總題數 */
  const room = startedRoom(['a', 'b'], 1);
  let now = finishTurn(room, 2000);
  room.join('late', { name: 'LATE', role: 'player', now });
  let guard = 0;
  while (room.phase === 'playing' && guard++ < 50) now = finishTurn(room, now);
  check('最後一輪才加入的人也畫到了', Rules.player(room.state, 'late').drew === 1);
  check('結束時題號沒有超過總題數', room.state.turnNo <= room.state.totalTurns, room.state.turnNo + '/' + room.state.totalTurns);
}

section('最後一個猜題者離開時，答案照樣公布');
{
  const room = startedRoom(['a', 'b', 'c'], 1);
  const d = room.state.drawerId;
  room.pickWord(d, room.state.choices[0], 2000);
  const guessers = room.state.order.filter((id) => id !== d);
  const w = Words.byId(room.state.wordId).text;
  room.guess(guessers[0], w, 3000);
  room.leave(guessers[1], 3500);
  check('全部猜中而收掉的這一題有寫出答案', room.summary.some((n) => n.key === 'srv.sum.reveal' && n.params.word === w),
    room.summary.map((n) => n.text).slice(-3).join(' | '));
}

section('房主改成觀戰／離開：房主交給玩家，不會卡住');
{
  const store = new RoomStore({});
  const room = store.create('h', { name: 'H', now: 1000 }).room;
  room.join('s', { name: 'S', role: 'spectator', now: 1100 });
  check('房間只剩房主一個玩家時，房主不能改成觀戰', !room.becomeSpectator('h').ok && room.phase === 'waiting');
  room.join('b', { name: 'B', role: 'player', now: 1200 });
  room.join('c', { name: 'C', role: 'player', now: 1300 });
  const r = room.becomeSpectator('h');
  check('房主改成觀戰後，房主交給最早進房的玩家（不是觀戰者）', r.ok && room.hostId === 'b', room.hostId);
  room.becomePlayer('h', 1400);
  room.leave('b', 1500);
  check('房主離開時優先交給玩家，不交給比較早進來的觀戰者', room.hostId !== 's' && room.member(room.hostId).role === 'player', room.hostId);
}

section('改規則要嘛全套用、要嘛都不改');
{
  const store = new RoomStore({});
  const room = store.create('a', { name: 'A', now: 1000 }).room;
  room.setSettings('a', { rounds: 2 });
  check('一項不合法時其他項也不會被偷偷改掉', !room.setSettings('a', { rounds: 4, drawSec: 5 }).ok && room.settings.rounds === 2,
    room.settings.rounds);
  check('布林值不算數字', !room.setSettings('a', { rounds: true }).ok);
  check('陣列不算數字', !room.setSettings('a', { rounds: [3] }).ok);
  check('數字字串可以', room.setSettings('a', { rounds: '3' }).ok && room.settings.rounds === 3);
}

section('同一局裡離開又回來：分數跟畫過的次數接回去');
{
  const room = startedRoom(['a', 'b', 'c'], 1);
  let now = 2000;
  const d = room.state.drawerId;
  room.pickWord(d, room.state.choices[0], now);
  const g = room.state.order.find((id) => id !== d);
  room.guess(g, Words.byId(room.state.wordId).text, now + 1000);
  room.skipTurn(d, now + 1500);
  const before = Rules.player(room.state, d);
  const scoreBefore = before.score;
  room.leave(d, now + 2000);
  room.join(d, { name: d.toUpperCase(), role: 'player', now: now + 3000 });
  const after = Rules.player(room.state, d);
  check('回來後分數還在', after && after.score === scoreBefore && scoreBefore > 0, after && after.score + ' vs ' + scoreBefore);
  check('回來後已畫次數也還在，不會再被排去畫', after && after.drew === 1);
  room.tick(now + 20000);
  check('下一題不會又輪到他', room.state.drawerId !== d);
}

section('畫家斷線 15 秒沒回來就先跳過這一題');
{
  const room = startedRoom(['a', 'b', 'c'], 1);
  const d = room.state.drawerId;
  room.pickWord(d, room.state.choices[0], 2000);
  room.disconnect(d, 3000);
  check('斷線中投影會帶「等到幾點」', room.viewFor('a', 3100).room.drawerAwayUntil === 3000 + 15000);
  room.tick(3000 + 10000);
  check('15 秒內還在等他', room.state.phase === 'drawing' && room.state.drawerId === d);
  room.tick(3000 + 15000);
  check('15 秒到了就跳過這一題', room.state.phase === 'reveal', room.state.phase);
  check('沒畫到的這一題不算他畫過', Rules.player(room.state, d).drew === 0);
  check('座位還在（還沒被踢）', !!room.member(d));
}
{
  const room = startedRoom(['a', 'b', 'c'], 1);
  const d = room.state.drawerId;
  room.pickWord(d, room.state.choices[0], 2000);
  room.disconnect(d, 3000);
  room.join(d, { name: d.toUpperCase(), role: 'player', now: 8000 });
  room.tick(3000 + 20000);
  check('15 秒內回來就繼續畫（時間到之前不會被跳過）', room.state.drawerId === d);
}

section('用戶端亂送東西不會讓伺服器當掉');
{
  const evil = { toString: 1, valueOf: 1 };
  let threw = false;
  try {
    const store = new RoomStore({});
    store.get(evil);
    store.getAny(evil);
    const room = store.create('a', { name: evil, roomName: evil, now: 1000 }).room;
    room.join('b', { name: 'B', role: 'player', now: 1000 });
    room.chat('a', evil, 2000);
    room.setSettings('a', { rounds: evil, drawSec: evil });
    room.createInvite('a', { role: evil, ttlMs: evil, maxUses: evil, now: 1000 });
    room.checkInvite(evil, 1000);
    room.setReady('a', true); room.setReady('b', true); room.start('a', 1000);
    room.stroke(room.state.drawerId, { t: evil, p: [evil, evil], c: evil, w: evil }, 1100);
    room.guess('b', evil, 1200);
  } catch (e) { threw = e.message; }
  check('怪物件（toString 不是函式）不會讓任何方法丟例外', threw === false, threw);
}

section('邀請提示文字跟實際行為一致');
{
  const room = startedRoom(['a', 'b'], 1);
  const inv = room.createInvite('a', { now: 1500 }).invite;
  const chk = room.checkInvite(inv.token, 1600);
  check('對局中的提示不再說「會先以觀戰身分進入」', chk.ok && chk.note && chk.note.indexOf('觀戰身分進入') < 0, chk.note);
}

/* ================================================================
   server URL 設定解析
   ================================================================ */
section('server URL 設定（config.js）');
{
  check('設定資訊不會主動探測或喚醒遊戲伺服器',
    typeof GameConfig.checkHealth === 'undefined');
  const r = GameConfig._resolve;
  check('沒有設定且不是網頁環境 → 只能單機',
    r('', '', 'file:', '').status === 'unset');
  check('沒有設定但頁面是伺服器送的 → 用同源',
    r('', '', 'https:', 'https://example.test').url === 'https://example.test');
  check('建置注入的網址會被採用',
    r('https://api.example.test', '', 'file:', '').url === 'https://api.example.test');
  check('網址參數優先於建置注入',
    r('https://a.test', 'https://b.test', 'file:', '').url === 'https://b.test');
  check('不是絕對網址 → 明確報錯', r('not-a-url', '', 'file:', '').status === 'invalid');
  check('非 http(s) 協定 → 明確報錯', r('ftp://x.test', '', 'file:', '').status === 'invalid');
  check('https 頁面不接受 http 伺服器（混合內容）',
    r('http://x.test', '', 'https:', 'https://y.test').status === 'invalid');
  check('設定錯誤不會偷偷回退 localhost',
    r('not-a-url', '', 'https:', 'https://y.test').url === null);
  check('結尾的斜線會被normalize掉',
    r('https://x.test/', '', 'file:', '').url === 'https://x.test');
}

/* ================================================================
   結果
   ================================================================ */
console.log('\n' + '='.repeat(46));
console.log('  通過 ' + passed + ' 項，失敗 ' + failed + ' 項');
console.log('='.repeat(46));
process.exit(failed ? 1 : 0);
