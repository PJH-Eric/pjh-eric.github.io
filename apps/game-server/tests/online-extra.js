'use strict';
/* 共用伺服器上、「原本的線上檢查拿不到 server.js」的兩款（amaze-go、stair-kids）的線上端到端檢查：
 * 在真實共用伺服器的 /g/<id>/ws 上，用兩個以上的用戶端走：建房 → 加入 → 雙方收到房間狀態 → 觀戰 → 聊天。
 *   tsx apps/game-server/tests/online-extra.js */
const assert = require('assert');
const path = require('path');
const root = path.resolve(__dirname, '..', '..', '..');
process.chdir(root);
const { createGameServer } = require('../server.js');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let n = 0;
const t = async (name, fn) => { await fn(); n++; console.log('  ✓ ' + name); };

function client(base, id) {
  const ws = new WebSocket(base.replace(/^http/, 'ws') + '/g/' + id + '/ws');
  const c = { ws, log: [] };
  ws.onmessage = (e) => { try { c.log.push(JSON.parse(String(e.data))); } catch (x) { /* 忽略 */ } };
  c.send = (o) => ws.send(JSON.stringify(o));
  c.open = new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('WebSocket 連不上 /g/' + id + '/ws')); });
  c.find = (pred) => c.log.find(pred);
  c.last = (type, key) => [...c.log].reverse().find((m) => m[key || 't'] === type);
  c.until = async (fn, ms = 4000, what = '') => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = fn(); if (v) return v; await sleep(20); } throw new Error('逾時：' + what); };
  return c;
}

(async () => {
  const app = createGameServer({ log: () => {}, only: ['amaze-go', 'stair-kids'] });
  await app.loadAll();
  for (const id of ['amaze-go', 'stair-kids']) assert.strictEqual(app.status[id].state, 'ok', id + ' 載入失敗：' + app.status[id].error);
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + app.server.address().port;

  console.log('amaze-go（箭頭解密）');
  {
    const [A, B, S] = [client(base, 'amaze-go'), client(base, 'amaze-go'), client(base, 'amaze-go')];
    await Promise.all([A.open, B.open, S.open]);
    let code, playToken, watchToken;
    await t('連上後收到 welcome', async () => { await A.until(() => A.last('welcome'), 4000, 'welcome'); await B.until(() => B.last('welcome')); await S.until(() => S.last('welcome')); });
    await t('建房：房主是玩家，大廳列表看得到', async () => {
      A.send({ t: 'hello', name: '甲' }); A.send({ t: 'create', name: '測試房', diff: 'normal' });
      const room = await A.until(() => A.last('room'), 4000, 'room');
      code = room.id; assert.strictEqual(room.role, 'player');
      playToken = room.invites.find((i) => i.role === 'play').token; watchToken = room.invites.find((i) => i.role === 'watch').token;
      S.send({ t: 'rooms' }); const l = await S.until(() => S.last('rooms'), 4000, 'rooms');
      assert.ok(l.rooms.some((r) => r.id === code));
    });
    await t('第二位玩家用邀請加入；觀戰者用觀戰邀請加入', async () => {
      B.send({ t: 'join', room: code, token: playToken, name: '乙' });
      assert.strictEqual((await B.until(() => B.last('room'), 4000, 'B room')).role, 'player');
      S.send({ t: 'join', room: code, token: watchToken, name: '觀' });
      assert.strictEqual((await S.until(() => S.last('room') && S.last('room').role === 'spectator' && S.last('room'), 4000, 'S room')).role, 'spectator');
    });
    await t('聊天：觀戰者的訊息房主收得到', async () => {
      S.send({ t: 'chat', text: 'hi' });
      await A.until(() => A.find((m) => m.t === 'chat' && /hi/.test(m.text || '')), 4000, 'chat');
    });
    [A, B, S].forEach((c) => c.ws.close());
  }

  console.log('stair-kids（樓梯小孩）');
  {
    const [A, B, S] = [client(base, 'stair-kids'), client(base, 'stair-kids'), client(base, 'stair-kids')];
    await Promise.all([A.open, B.open, S.open]);
    let roomId;
    await t('連上後收到 hello', async () => { for (const c of [A, B, S]) await c.until(() => c.last('hello', 'type'), 4000, 'hello'); });
    await t('建房：房主入座，收到 joined 與 room', async () => {
      A.send({ type: 'create', name: 'A' });
      const j = await A.until(() => A.last('joined', 'type'), 4000, 'joined');
      roomId = j.roomId; assert.strictEqual(j.role, 'player');
      await A.until(() => A.last('room', 'type'), 4000, 'room');
    });
    await t('第二位玩家加入、觀戰者加入；房主看到房間更新', async () => {
      B.send({ type: 'join', roomId, role: 'player' });
      assert.strictEqual((await B.until(() => B.last('joined', 'type'), 4000, 'B joined')).role, 'player');
      S.send({ type: 'join', roomId, role: 'spectator' });
      assert.strictEqual((await S.until(() => S.last('joined', 'type'), 4000, 'S joined')).role, 'spectator');
      await A.until(() => { const r = A.last('room', 'type'); return r && r.room && r.room.id === roomId; }, 4000, 'A room update');
    });
    [A, B, S].forEach((c) => c.ws.close());
  }

  console.log('共用伺服器線上補充檢查：' + n + ' 項通過');
  process.exit(0);
})().catch((e) => { console.error('✗ ' + (e && e.stack || e)); process.exit(1); });
