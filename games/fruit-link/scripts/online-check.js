/*
 * scripts/online-check.js — 真的開一台伺服器、接真的 Socket.IO 用戶端跑一輪線上流程
 *
 * 這一支不是模擬：它 require 真正的 server.js、用真正的 socket.io-client 連上去，
 * 驗證大廳、建房、加入、觀戰、邀請連結、同盤搶消、線上禁用提示與洗牌、聊天、
 * 斷線重連、再來一局與離開房間。
 *
 *   node scripts/online-check.js
 */
'use strict';

const path = require('path');
const { io } = require('../public/js/sio-client.js');

process.env.PORT = process.env.PORT || '3941';
process.env.COUNTDOWN_MS = '0';          // 測試不等倒數
process.env.GAME_ALLOWED_ORIGIN = '*';

const Rules = require(path.join(__dirname, '..', 'public', 'js', 'rules.js'));
const { server } = require(path.join(__dirname, '..', 'server.js'));

const PORT = Number(process.env.PORT);
const URL = 'http://127.0.0.1:' + PORT;

let pass = 0, fail = 0;
function ok(name) { pass++; console.log('  ✅ ' + name); }
function no(name, detail) { fail++; console.log('  ❌ ' + name + (detail ? '\n     ' + detail : '')); }
function check(name, cond, detail) { cond ? ok(name) : no(name, detail); }
function group(name) { console.log('\n▍' + name); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 包一層方便等特定事件 */
function makeClient(clientId, name) {
  const socket = io(URL, { transports: ['websocket'], forceNew: true });
  const c = {
    socket, clientId, name,
    view: null, events: [], chat: [], errors: [], rooms: null, closed: null, left: false
  };
  socket.on('room:sync', (v) => { c.view = v; });
  socket.on('room:events', (p) => { (p.events || []).forEach((e) => c.events.push(e)); });
  socket.on('room:chat', (p) => { c.chat.push(p.message); });
  socket.on('room:error', (p) => { c.errors.push(p); });
  socket.on('room:closed', (p) => { c.closed = p; });
  socket.on('room:left', () => { c.left = true; });
  socket.on('lobby:rooms', (p) => { c.rooms = p; });

  c.hello = () => new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('hello 逾時')), 8000);
    const go = () => socket.emit('hello', { clientId, name }, (r) => { clearTimeout(t); res(r); });
    if (socket.connected) go(); else socket.once('connect', go);
  });
  c.emit = (evt, payload) => new Promise((res) => socket.emit(evt, payload || {}, (r) => res(r)));
  c.send = (evt, payload) => socket.emit(evt, payload || {});
  c.close = () => socket.disconnect();
  /** 等到條件成立（或逾時），避免用固定 sleep 造成不穩定 */
  c.until = async (fn, ms, label) => {
    const end = Date.now() + (ms || 4000);
    while (Date.now() < end) {
      if (fn(c)) return true;
      await sleep(30);
    }
    throw new Error('等不到條件：' + (label || ''));
  };
  return c;
}

/** 從某個人的 view 找一組真的可以連的水果 */
function pickPair(view) {
  const m = view.match;
  const hit = Rules.findPair(m.grid, m.W, m.H);
  return hit;
}

async function main() {
  await new Promise((res) => server.listen(PORT, '127.0.0.1', res));
  console.log('測試伺服器啟動於 ' + URL);

  const host = makeClient('client-host-0001', '房主小明');
  const p2 = makeClient('client-guest-0002', '玩家小華');
  const spec = makeClient('client-spect-0003', '觀眾小美');

  try {
    group('連線與大廳');
    const h = await host.hello();
    check('hello 拿得到 clientId 與伺服器時間', h.ok && h.clientId === 'client-host-0001' && h.serverTime > 0);
    await p2.hello();
    await spec.hello();

    host.send('lobby:subscribe', {});
    await host.until((c) => c.rooms !== null, 4000, '大廳列表');
    check('大廳一開始沒有房間', host.rooms.rooms.length === 0);
    check('大廳顯示三位在線使用者', host.rooms.online === 3);
    const probe = makeClient('client-count-probe', '測試');
    await probe.hello();
    await host.until((c) => c.rooms.online === 4, 4000, '在線人數增加');
    probe.close();
    await host.until((c) => c.rooms.online === 3, 4000, '在線人數減少');
    check('連線及斷線時更新在線人數', true);

    group('建房與加入');
    const created = await host.emit('room:create', { name: '房主小明', roomName: '果園擂台', level: 'easy' });
    check('建立房間成功並拿到房號', created.ok && created.code && created.code.length === 5);
    const code = created.code;
    await host.until((c) => c.view && c.view.code === code, 4000, '房間投影');
    check('房主是 host、而且自動入座當玩家', host.view.you.host === true && host.view.you.role === 'player');

    p2.send('lobby:subscribe', {});
    await p2.until((c) => c.rooms && c.rooms.rooms.length === 1, 4000, '大廳看到新房間');
    check('新房間出現在大廳列表', p2.rooms.rooms[0].code === code);

    const joined = await p2.emit('room:join', { code, name: '玩家小華' });
    check('第二個人加入成功、身分是玩家', joined.ok && joined.role === 'player');
    await host.until((c) => c.view.members.length === 2, 4000, '房主看到兩個人');
    check('房主的投影裡看得到兩個人', host.view.members.length === 2);

    group('邀請連結');
    const inv = await host.emit('room:invite', { role: 'spectator', ttlMinutes: 30, maxUses: 2 });
    check('房主產生得出邀請連結', inv.ok && inv.token && inv.role === 'spectator');
    const chk = await spec.emit('invite:check', { code, token: inv.token });
    check('進房前可以先驗證邀請連結', chk.ok && chk.role === 'spectator');
    const badChk = await spec.emit('invite:check', { code, token: 'deadbeefdeadbeef' });
    check('亂猜的 token 會被擋下來並說明原因', !badChk.ok && badChk.code === 'badinvite');

    const specJoin = await spec.emit('room:join', { code, name: '觀眾小美', token: inv.token });
    check('用觀戰邀請進來的身分是觀戰', specJoin.ok && specJoin.role === 'spectator');
    await host.until((c) => c.view.members.length === 3, 4000, '三個人');

    const notHost = await p2.emit('room:invite', { role: 'player' });
    check('非房主不能產生邀請連結', !notHost.ok && notHost.code === 'perm');

    group('開局前的權限');
    p2.send('room:setLevel', { level: 'hard' });
    await sleep(150);
    check('非房主改關卡會被擋下來', p2.errors.some((e) => e.code === 'perm'));
    check('關卡沒有被改掉', host.view.level === 'easy');

    host.send('room:start', {});
    await sleep(150);
    check('有人沒準備就不能開始', host.errors.some((e) => e.code === 'notready'));

    group('造型主題');
    p2.send('room:setTheme', { theme: 'animals' });
    await sleep(150);
    check('非房主不能改主題', p2.errors.some((e) => e.code === 'perm'));
    host.send('room:setTheme', { theme: 'nope' });
    await sleep(150);
    check('亂寫的主題會被擋下來', host.errors.some((e) => e.code === 'badtheme'));
    host.send('room:setTheme', { theme: 'animals' });
    await spec.until((c) => c.view.theme === 'animals', 4000, '主題同步');
    check('房主改主題會同步給全房（含觀戰者）', spec.view.theme === 'animals');
    check('房間投影帶得出主題選單', (host.view.themes || []).length >= 5);

    group('開局與同盤搶消');
    host.send('room:ready', { ready: true });
    p2.send('room:ready', { ready: true });
    await host.until((c) => c.view.members.filter((m) => m.ready).length === 2, 4000, '兩個人都準備');
    host.send('room:start', {});
    await host.until((c) => c.view.phase === 'playing' && c.view.match, 6000, '進入對局');
    check('開局之後三個人都拿得到盤面', !!host.view.match && !!p2.view.match && !!spec.view.match);
    check('觀戰者看到的盤面和玩家完全一樣',
      JSON.stringify(spec.view.match.grid) === JSON.stringify(host.view.match.grid));
    check('觀戰者的 can.play 是 false', spec.view.you.can.play === false);
    check('開局用的是房主選的主題', host.view.match.theme === 'animals');
    check('全場抽到同一組造型（觀戰者也一樣）',
      JSON.stringify(spec.view.match.palette) === JSON.stringify(host.view.match.palette) &&
      host.view.match.palette.length === host.view.match.kinds,
      JSON.stringify(host.view.match.palette));

    /* 同一組水果，兩個人同時送 —— 只有先到的那個人得分 */
    const pair = pickPair(host.view);
    host.events.length = 0; p2.events.length = 0; spec.events.length = 0;
    host.send('room:link', { a: pair.a, b: pair.b });
    p2.send('room:link', { a: pair.a, b: pair.b });
    await host.until((c) => c.events.filter((e) => e.k === 'match' || e.k === 'miss').length >= 2, 4000, '兩個判定結果');

    const matches = host.events.filter((e) => e.k === 'match');
    check('同一組水果只會被消掉一次', matches.length === 1, '實際 ' + matches.length + ' 次');
    check('先到的人得分、慢一步的人撲空',
      matches.length === 1 && matches[0].gain === Rules.BASE_SCORE);
    check('搶消的判定會廣播給觀戰者', spec.events.some((e) => e.k === 'match'));

    group('線上操作限制與聊天');
    /* 搶消是用事件推播的，用戶端手上的完整盤面要等下一次 room:sync 才會更新。 */
    await host.until((c) => c.view.match && c.view.match.left === matches[0].left, 6000, '盤面快照追上搶消結果');

    host.events.length = 0; p2.events.length = 0;
    host.errors.length = 0;
    const beforeAssistGrid = host.view.match.grid.slice();
    host.send('room:hint', {});
    host.send('room:shuffle', {});
    await sleep(150);
    const blockedAssist = {
      disabled: host.errors.filter((e) => e.code === 'disabled').length,
      hintEvents: host.events.filter((e) => e.k === 'hint').length,
      shuffleEvents: host.events.filter((e) => e.k === 'shuffle' && !e.auto).length,
      gridUnchanged: JSON.stringify(host.view.match.grid) === JSON.stringify(beforeAssistGrid)
    };
    check('線上模式不提供提示', blockedAssist.disabled >= 1 && blockedAssist.hintEvents === 0,
      JSON.stringify(blockedAssist));
    check('線上模式不提供手動洗牌', blockedAssist.disabled >= 2 && blockedAssist.shuffleEvents === 0 && blockedAssist.gridUnchanged,
      JSON.stringify(blockedAssist));

    p2.chat.length = 0;
    host.send('room:chat', { text: '一起加油！' });
    await p2.until((c) => c.chat.some((m) => m.text === '一起加油！'), 4000, '聊天訊息');
    check('聊天訊息會送到房間裡的每個人', p2.chat.some((m) => m.text === '一起加油！'));
    check('觀戰者也收得到聊天', spec.chat.some((m) => m.text === '一起加油！'));

    group('斷線與重新連線');
    p2.close();
    await host.until((c) => c.view.members.some((m) => m.id === 'client-guest-0002' && !m.connected), 5000, '對方標記為斷線');
    check('斷線的人會被標記，座位先保留',
      host.view.members.some((m) => m.id === 'client-guest-0002' && !m.connected));

    const p2b = makeClient('client-guest-0002', '玩家小華');
    await p2b.hello();
    const back = await p2b.emit('room:join', { code, name: '玩家小華' });
    check('用同一個 clientId 可以回到原本的座位', back.ok && back.reconnected === true && back.role === 'player');
    await host.until((c) => c.view.members.every((m) => m.connected), 5000, '大家都回來了');

    group('結算與再來一局');
    /* 直接把盤面連光，驗證「清空就結算」這條路徑。
       伺服器只在事件裡送「哪兩格被消掉」，完整盤面每 3 秒才補一次，
       所以這裡照著事件自己維護一份盤面 —— 前端也是這樣做的。 */
    let grid = host.view.match.grid.slice();
    const BW = host.view.match.W, BH = host.view.match.H;
    let guard = 0;
    while (guard++ < 400) {
      const hit = Rules.findPair(grid, BW, BH);
      if (!hit) break;
      host.events.length = 0;
      host.send('room:link', { a: hit.a, b: hit.b });
      await host.until((c) => c.events.some((e) => e.k === 'match' || e.k === 'miss'), 5000, '消除事件');
      const matched = host.events.find((e) => e.k === 'match');
      if (matched) { grid[matched.a] = 0; grid[matched.b] = 0; }
      const shuffled = host.events.find((e) => e.k === 'shuffle');
      if (shuffled) grid = shuffled.grid.slice();
      if (host.events.some((e) => e.k === 'end')) break;
    }
    await host.until((c) => c.view.phase === 'over', 8000, '對局結束');
    check('把盤面連光就會結算', host.view.match.over === true && host.view.match.cleared === true);
    check('結算有名次，第一名是連最多的人',
      host.view.match.standings && host.view.match.standings[0].rank === 1);
    check('觀戰者也看得到結算', spec.view.phase === 'over' && !!spec.view.match.standings);

    const firstSeed = host.view.seed;
    host.send('room:rematch', {});
    p2b.send('room:rematch', {});
    await host.until((c) => c.view.phase === 'countdown' || c.view.phase === 'playing', 6000, '重開一局');
    check('兩個玩家都投票就重開，而且換了新盤面', host.view.seed !== firstSeed);

    group('離開房間');
    p2b.send('room:leave', {});
    await p2b.until((c) => c.left, 4000, '離開回覆');
    check('離開房間會收到確認', p2b.left === true);
    await host.until((c) => c.view.members.length === 2, 4000, '剩兩個人');
    check('房間人數會更新', host.view.members.length === 2);

    host.send('room:leave', {});
    spec.send('room:leave', {});
    await sleep(300);
    const res = await fetch(URL + '/api/rooms');
    const body = await res.json();
    check('最後一個人離開之後房間會自動關掉', body.total === 0, JSON.stringify(body));

    group('健康檢查');
    const health = await (await fetch(URL + '/health')).json();
    check('/health 有回應而且說得出服務名稱', health.ok === true && health.service === 'fruit-link');

    p2b.close();
  } catch (e) {
    no('流程中斷', e && (e.stack || e.message));
  } finally {
    host.close(); p2.close(); spec.close();
    await sleep(200);
    server.close();
  }

  console.log('\n────────────────────────────');
  console.log('通過 ' + pass + ' 項，失敗 ' + fail + ' 項');
  if (fail) { console.log('❌ 線上流程驗證失敗'); process.exit(1); }
  console.log('✅ 線上流程全部通過');
  process.exit(0);
}

main();
