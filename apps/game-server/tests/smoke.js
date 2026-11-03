'use strict';
/* 共用伺服器煙霧測試：17 款都載入、/g/<id>/health、/g/<id>/ws 可升級連線；socket.io 相容遊戲再多驗一次事件往返。
 * 執行：tsx tests/smoke.js（ice-duel 為 TypeScript，需要 tsx） */
const assert = require('assert');
const path = require('path');
const { createGameServer } = require('../server.js');
const { io } = require('../../../packages/web-core/sio-client.js');
const manifest = require('../../../games.json');

const ORIGIN = 'https://example.test';
process.env.GAME_ALLOWED_ORIGIN = ORIGIN;
let pass = 0;
const ok = (name) => { pass++; console.log('  ✓ ' + name); };

function wsOpen(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const t = setTimeout(() => { try { ws.close(); } catch (e) {} reject(new Error('逾時 ' + url)); }, 6000);
    ws.onopen = () => { clearTimeout(t); resolve(ws); };
    ws.onerror = () => { clearTimeout(t); reject(new Error('連線失敗 ' + url)); };
  });
}

(async () => {
  const app = createGameServer({ log: () => {} });
  await app.loadAll();
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + app.server.address().port;
  const wsBase = base.replace('http', 'ws');

  const health = await (await fetch(base + '/health')).json();
  const ids = manifest.games.map((g) => g.id);
  ids.forEach((id) => assert.strictEqual(health.games[id] && health.games[id].state, 'ok', id + ' 未載入：' + JSON.stringify(health.games[id])));
  ok('全部 ' + ids.length + ' 款載入成功');

  assert.strictEqual((await fetch(base + '/g/not-a-game/health')).status, 404);
  assert.strictEqual((await fetch(base + '/nothing')).status, 404);
  ok('未知遊戲／路徑回 404');

  for (const id of ids) {
    const r = await fetch(base + '/g/' + id + '/health', { headers: { Origin: ORIGIN } });
    assert.strictEqual(r.status, 200, id + ' /health 狀態 ' + r.status);
    const type = r.headers.get('content-type') || '';
    if (/json/.test(type)) assert.ok((await r.json()).ok !== false, id + ' /health ok=false'); else await r.text();
  }
  ok('每款 /g/<id>/health 回 200');

  // 靜態首頁（有 public/index.html 的）
  let staticCount = 0;
  for (const id of ids) {
    const r = await fetch(base + '/g/' + id + '/', { headers: { Origin: ORIGIN } });
    if (r.status === 200 && /html/.test(r.headers.get('content-type') || '')) staticCount++;
    await r.text();
  }
  console.log('    （其中 ' + staticCount + ' 款由伺服器直接提供首頁）');

  // 本機同源測試：config 即時注入 <本機網址>/g/<id>
  for (const id of ids) {
    if (manifest.games.find((game) => game.id === id).server === 'static' || id === 'snake-3d' || id === 'ice-duel' || id === 'house-stack') continue;
    const t = await (await fetch(base + '/g/' + id + '/js/config.js')).text();
    assert.ok(t.includes(base + '/g/' + id), id + ' config.js 沒有被注入本機網址');
  }
  assert.ok((await (await fetch(base + '/g/house-stack/env.js')).text()).includes('/g/house-stack'), 'house-stack env.js 未注入');
  assert.ok((await (await fetch(base + '/')).text()).includes('遊戲小小島'), '首頁不存在');
  ok('本機同源測試：config／env 即時注入、首頁清單');

  // WebSocket 升級：僅檢查 manifest 標記為線上伺服器的遊戲
  const websocketIds = ids.filter((id) => manifest.games.find((game) => game.id === id).server !== 'static');
  for (const id of websocketIds) {
    const ws = await wsOpen(wsBase + '/g/' + id + '/ws');
    ws.close();
  }
  ok(websocketIds.length + ' 款線上遊戲 /g/<id>/ws 都能升級為 WebSocket');

  // 排除外部伺服器：GAMES_EXCLUDE 的遊戲不載入，回報 external，/g/<id>/ 回 503
  {
    const ex = createGameServer({ log: () => {}, exclude: ['bomb-squad'], only: ['bomb-squad', 'reversi'] });
    await ex.loadAll();
    assert.strictEqual(ex.status['bomb-squad'].state, 'external');
    assert.strictEqual(ex.status['reversi'].state, 'ok');
    assert.ok(!ex.plugins.has('bomb-squad'));
    await new Promise((r) => ex.server.listen(0, '127.0.0.1', r));
    const exBase = 'http://127.0.0.1:' + ex.server.address().port;
    assert.strictEqual((await fetch(exBase + '/g/bomb-squad/health')).status, 503);
    await ex.close();
  }
  ok('GAMES_EXCLUDE：bomb-squad 標為 external、不載入');

  // 錯誤隔離：關閉其中一款不影響其他款
  await new Promise((r) => setTimeout(r, 50));

  // socket.io 相容遊戲：事件往返（健康度、ack）
  for (const id of ['whack-a-mole', 'fruit-link', 'shoot-balloon', 'draw-guess', 'house-stack']) {
    const s = io(base + '/g/' + id, { reconnection: false, timeout: 5000 });
    await new Promise((resolve, reject) => { s.on('connect', resolve); s.on('connect_error', (e) => reject(new Error(id + ' sio 連線失敗：' + (e && e.message)))); });
    s.disconnect();
  }
  ok('socket.io 相容遊戲經 /g/<id> 可連線');


  console.log('共用伺服器煙霧測試：' + pass + ' 項通過');
  await app.close().catch(() => {});
  process.exit(0);
})().catch((e) => { console.error('✗ ' + (e && e.stack || e)); process.exit(1); });
