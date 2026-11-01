'use strict';
// sio-compat（伺服器）＋ sio-client（用戶端）的整合測試：真的開 http server 與 WebSocket 連線。
const http = require('http');
const { createIoServer } = require('../sio-compat');
const { io } = require('../../web-core/sio-client');

let pass = 0, fail = 0;
function ok(cond, name) { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name); } }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function until(fn, ms = 3000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    (function tick() { if (fn()) return resolve(true); if (Date.now() - t0 > ms) return resolve(false); setTimeout(tick, 15); })();
  });
}

(async () => {
  const server = http.createServer((_q, r) => r.end('ok'));
  const srv = createIoServer(server, { path: '/ws', pingInterval: 20000, pingTimeout: 25000 });
  const log = { disconnects: [], connections: 0 };
  srv.on('connection', (s) => {
    log.connections++;
    s.on('hello', (p, ack) => { s.data.name = p.name; ack({ ok: true, id: s.id, name: p.name }); });
    s.on('noPayload', (ack) => ack('pong'));
    s.on('join', (room) => { s.join(room); s.emit('joined', room); });
    s.on('say', (p) => srv.to(p.room).emit('said', p.text));
    s.on('boom', () => { throw new Error('故意丟錯'); });
    s.on('kick', () => s.disconnect());
    s.on('disconnect', (reason) => log.disconnects.push(reason));
    s.emit('welcome', { n: 1 });
  });
  await new Promise((r) => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port;

  console.log('基本連線與事件');
  const a = io(base, { reconnection: false });
  const got = [];
  a.on('welcome', (d) => got.push(d));
  ok(await until(() => a.connected), '連上並收到 connect');
  ok(await until(() => got.length === 1) && got[0].n === 1, '伺服器開場事件送達');
  ok(srv.engine.clientsCount === 1 && srv.sockets.sockets.size === 1, 'clientsCount 與 sockets Map 正確');

  console.log('ack');
  const res = await new Promise((r) => a.emit('hello', { name: 'A' }, r));
  ok(res.ok && res.name === 'A' && res.id === a.id, '帶內容的 ack 回傳');
  ok((await new Promise((r) => a.emit('noPayload', r))) === 'pong', '沒有內容、只帶 ack 的事件');

  console.log('房間廣播');
  const b = io(base, { reconnection: false });
  await until(() => b.connected);
  const said = [];
  a.on('said', (t) => said.push('a:' + t));
  b.on('said', (t) => said.push('b:' + t));
  a.emit('join', 'r1');
  await until(() => srv.to('r1') && [...srv.sockets.sockets.values()].some((s) => s.rooms.has('r1')));
  a.emit('say', { room: 'r1', text: 'hi' });
  await wait(150);
  ok(said.join() === 'a:hi', '只有房間內的人收到，房外的 b 沒收到');

  console.log('頻道操作');
  a.emit('join', 'r2'); await wait(100);
  srv.in('r2').socketsJoin('r3'); await wait(30);
  ok([...srv.sockets.sockets.values()].some((s) => s.rooms.has('r3')), 'socketsJoin 把頻道內的連線加入另一頻道');
  srv.in('r3').socketsLeave('r2'); srv.in('r3').socketsLeave('r3'); await wait(30);
  ok(![...srv.sockets.sockets.values()].some((s) => s.rooms.has('r2') || s.rooms.has('r3')), 'socketsLeave 讓頻道內的連線離開');
  ok((await srv.in('r1').fetchSockets()).length === 1, 'fetchSockets 取得頻道成員');

  console.log('例外與格式防呆');
  a.emit('boom');
  await wait(100);
  ok(a.connected, '事件處理器丟例外不會斷線');
  const rawOk = await new Promise((resolve) => {
    const w = new WebSocket(base.replace('http', 'ws') + '/ws');
    w.onmessage = (ev) => { if (JSON.parse(ev.data).c === 'open') { w.send('不是 JSON'); w.send('123'); w.send('{"e":5}'); setTimeout(() => { resolve(w.readyState === 1); w.close(); }, 100); } };
    w.onerror = () => resolve(false);
  });
  ok(rawOk, '亂格式的訊息被忽略、不會斷線');

  console.log('斷線與重連');
  const c = io(base, { reconnectionDelay: 50, reconnectionDelayMax: 100 });
  let reason = null, reconnects = 0;
  c.on('connect', () => reconnects++);
  c.on('disconnect', (r) => { reason = r; });
  await until(() => c.connected);
  c.emit('kick');
  ok(await until(() => reason !== null), '被伺服器踢出時收到 disconnect');
  ok(await until(() => reconnects >= 2 && c.connected), '自動重連成功');
  ok(log.disconnects.includes('server namespace disconnect'), '伺服器端 disconnect 原因正確');
  c.disconnect();
  ok(await until(() => log.disconnects.includes('transport close')), '用戶端主動斷線，伺服器端收到 disconnect');

  console.log('心跳（閒置連線不能被誤判斷線）');
  const server3 = http.createServer();
  const srv3 = createIoServer(server3, { pingInterval: 1000, pingTimeout: 2500 });
  const reasons = [];
  srv3.on('connection', (s) => s.on('disconnect', (r) => reasons.push(r)));
  await new Promise((r) => server3.listen(0, r));
  const idle = io('http://127.0.0.1:' + server3.address().port, { reconnection: false });
  await until(() => idle.connected);
  await wait(6500);
  ok(idle.connected && !reasons.length, '閒置 6.5 秒（超過 pingTimeout 兩倍以上）仍保持連線');
  idle.disconnect(); srv3.close(); server3.close();

  console.log('來源檢查');
  const server2 = http.createServer();
  createIoServer(server2, { originAllowed: () => false });
  await new Promise((r) => server2.listen(0, r));
  const d = io('http://127.0.0.1:' + server2.address().port, { reconnection: false });
  let err = null;
  d.on('connect_error', (e) => { err = e; });
  ok(await until(() => err !== null) && !d.connected, '被拒絕的來源收到 connect_error');

  a.disconnect(); b.disconnect(); srv.close();
  server.close(); server2.close();
  console.log('\n' + pass + ' 項通過，' + fail + ' 項失敗');
  process.exit(fail ? 1 : 0);
})();
