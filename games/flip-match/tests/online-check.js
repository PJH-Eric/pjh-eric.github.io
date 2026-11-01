'use strict';
// 線上流程檢查：真的啟動 server.js，用兩個 WebSocket 用戶端走完 大廳 → 建房 → 加入 → 準備 → 開局 → 翻牌 → 聊天 → 離開。
// 這款原本沒有真連線的測試；改用共用連線層（lib/ws.js）時補上，確保行為沒變。
const { spawn } = require('child_process');
const path = require('path');
const WebSocket = require('../lib/ws-client');

const PORT = 3300 + Math.floor(Math.random() * 400);
let pass = 0, fail = 0;
const ok = (c, name) => { if (c) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await wait(20); } return false; };

function client(name) {
  const c = { name, msgs: [], ws: new WebSocket('ws://127.0.0.1:' + PORT + '/ws') };
  c.ws.on('message', (d) => { try { c.msgs.push(JSON.parse(String(d))); } catch (e) { /* 忽略 */ } });
  c.send = (o) => c.ws.send(JSON.stringify(o));
  c.last = (t) => [...c.msgs].reverse().find((m) => m.t === t);
  c.opened = new Promise((res) => c.ws.on('open', res));
  return c;
}

(async () => {
  const proc = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'inherit'] });
  proc.stdout.on('data', () => {});
  try {
    await wait(1200);
    const a = client('小明'), b = client('小美');
    await Promise.all([a.opened, b.opened]);
    ok(true, '兩個用戶端連上伺服器（任意路徑）');

    a.send({ t: 'hello', name: '小明' }); b.send({ t: 'hello', name: '小美' });
    ok(await until(() => a.last('welcome') && b.last('welcome')), '收到 welcome');
    a.send({ t: 'ping', at: 123 });
    ok(await until(() => a.last('pong') && a.last('pong').at === 123), 'ping/pong');

    a.send({ t: 'create', size: 4, deck: 'animals', roomName: '測試房' });
    ok(await until(() => a.last('joined')), '建立房間');
    const roomId = a.last('joined').id;
    b.send({ t: 'rooms' });
    ok(await until(() => b.last('rooms') && b.last('rooms').rooms.some((r) => r.id === roomId)), '大廳列表看得到新房間');
    b.send({ t: 'join', id: roomId });
    ok(await until(() => b.last('joined')), '第二位加入房間');
    b.send({ t: 'ready', v: true });
    await wait(150);
    a.send({ t: 'start' });
    ok(await until(() => a.msgs.some((m) => m.t === 'start' || m.t === 'state' || m.t === 'game') && b.msgs.some((m) => m.t === 'start' || m.t === 'state' || m.t === 'game')), '房主開局，雙方都收到對局訊息');

    a.send({ t: 'chat', m: '你好' });
    ok(await until(() => b.msgs.some((m) => m.t === 'chat')), '聊天室訊息送到對方');

    const joinFull = client('路人'); await joinFull.opened;
    joinFull.send({ t: 'join', id: roomId });
    ok(await until(() => joinFull.last('err')), '房間已滿／對戰中，第三人被拒絕');
    joinFull.ws.close();

    b.ws.close();
    ok(await until(() => a.msgs.some((m) => m.t === 'rooms' || m.t === 'room' || m.t === 'sys' || m.t === 'over')), '對手離線後房主仍收到通知，伺服器沒當掉');
    a.send({ t: 'ping', at: 456 });
    ok(await until(() => a.last('pong') && a.last('pong').at === 456), '伺服器在對手離線後仍正常回應');
    a.ws.close();
  } catch (e) {
    fail++; console.error('✘ 例外：', e && e.stack || e);
  } finally {
    proc.kill();
    console.log('\n' + pass + ' 項通過，' + fail + ' 項失敗');
    setTimeout(() => process.exit(fail ? 1 : 0), 100);
  }
})();
