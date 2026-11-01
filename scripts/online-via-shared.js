'use strict';
/* 把各遊戲「原本的線上檢查」改成經共用伺服器跑（測試程式碼一行都不改）：
 *   tsx scripts/online-via-shared.js <遊戲id> [檢查腳本路徑]
 *
 * 其他 17 款先在同一個程序載入（驗證彼此共存：cwd、全域狀態），再執行該款原本的 online-check：
 *  A) 檢查腳本在程序內建 http.Server 並 listen() → 攔下來，改由「閘道」監聽：
 *     用戶端連 http://127.0.0.1:<port>/ws → 閘道補上 /g/<id> 前綴 → 共用伺服器依前綴轉給該款（request／upgrade 都走真正的轉發路徑）。
 *  B) 檢查腳本用 child_process.spawn 啟動遊戲的 server.js → 改為啟動「共用伺服器子程序」，
 *     同樣用閘道把 /ws、/health 對應到 /g/<id>/…（子程序只載入該款，求啟動快；共存另由 A 與煙霧測試驗證）。
 * 檢查腳本若兩種都沒走到（例如直接用遊戲內部函式庫），會明確回報「無法經共用伺服器驗證」，結束碼 66。 */
const path = require('path');
const fs = require('fs');
const http = require('http');
const cp = require('child_process');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));

/* ---- 子程序模式：共用伺服器 + 閘道（被 B 啟動） ---- */
if (process.argv[2] === '--child') {
  const id = process.argv[3];
  process.env.ALLINONE_EMBEDDED = '1';
  const { createGameServer } = require('../apps/game-server/server.js');
  const app = createGameServer({ log: () => {}, only: [id] });
  app.loadAll().then(() => {
    const gw = http.createServer((req, res) => { req.url = '/g/' + id + req.url; app.server.emit('request', req, res); });
    gw.on('upgrade', (req, socket, head) => { if (process.env.VIA_DEBUG) console.log('[gw] upgrade ' + req.url); req.url = '/g/' + id + req.url; app.server.emit('upgrade', req, socket, head); });
    gw.listen(...[Number(process.env.PORT) || 0, process.env.HOST || null].filter((x) => x !== null), () => console.log('listening ' + gw.address().port));
  }).catch((e) => { console.error(e && e.stack || e); process.exit(1); });
  return;
}

const id = process.argv[2];
if (!id) { console.error('用法：tsx scripts/online-via-shared.js <遊戲id> [腳本]'); process.exit(64); }
const g = manifest.games.find((x) => x.id === id);
if (!g) { console.error('找不到遊戲：' + id); process.exit(64); }
const gameDir = path.join(root, g.projectFolder);
const script = process.argv[3]
  ? path.resolve(process.argv[3])
  : ['scripts/online-check.js', 'tests/online-check.js', 'scripts/online-check.ts', 'tests/online-check.ts', 'server/scripts/online-check.js']
    .map((r) => path.join(gameDir, r)).find((f) => fs.existsSync(f));
if (!script) { console.error('SKIP ' + id + '：沒有 online-check'); process.exit(65); }

process.env.ALLINONE_EMBEDDED = '1';

/* C) 檢查腳本是「對已啟動的伺服器網址做檢查」（例：ice-duel 的 online-check.ts [ws://…]）：
 *    在這裡啟動共用伺服器（只載入該款），把 ws://127.0.0.1:<port>/g/<id>/ws 當參數交給它。 */
const URL_ARG_GAMES = new Set(['ice-duel']);
if (URL_ARG_GAMES.has(id)) {
  (async () => {
    const { createGameServer } = require('../apps/game-server/server.js');
    const app = createGameServer({ log: () => {}, only: [id] });
    await app.loadAll();
    if (app.status[id].state !== 'ok') { console.error('✗ 載入失敗：' + app.status[id].error); process.exit(1); }
    await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
    const url = 'ws://127.0.0.1:' + app.server.address().port + '/g/' + id + '/ws';
    console.log('▶ 共用伺服器已載入 ' + id + '；對 ' + url + ' 執行 ' + path.relative(root, script));
    // 注意：不能用 spawnSync，否則同程序內的共用伺服器會被卡住、沒人回應
    const child = cp.spawn(process.execPath, [...process.execArgv, script, url], { cwd: gameDir, stdio: 'inherit', env: process.env });
    child.on('exit', (code) => process.exit(code === null ? 1 : code));
  })();
  return;
}

(async () => {
  const { createGameServer } = require('../apps/game-server/server.js');
  const others = manifest.games.map((x) => x.id).filter((x) => x !== id);
  // 載入其他款時別讓它們的計時器拖住程序結束
  const si = global.setInterval; const st = global.setTimeout;
  global.setInterval = (...a) => { const t = si(...a); t && t.unref && t.unref(); return t; };
  global.setTimeout = (...a) => { const t = st(...a); t && t.unref && t.unref(); return t; };
  const app = createGameServer({ log: () => {}, only: others });
  await app.loadAll();
  global.setInterval = si; global.setTimeout = st;
  delete process.env.ALLINONE_EMBEDDED;   // 該款自己的 server.js 若在 require 時就會 listen（例：sudoku），照原樣讓它 listen，再由閘道接手
  const bad = Object.entries(app.status).filter(([, s]) => s.state !== 'ok');
  if (bad.length) { console.error('✗ 載入失敗：' + bad.map(([k, s]) => k + '(' + s.error + ')').join('、')); process.exit(1); }
  console.log('▶ 共用伺服器已載入其他 ' + app.plugins.size + ' 款；經共用伺服器執行 ' + id + '：' + path.relative(root, script));

  let via = 0;
  const gateways = new Set();
  // A) 程序內 listen()
  const origListen = http.Server.prototype.listen;
  http.Server.prototype.listen = function (...args) {
    if (this === app.server || gateways.has(this) || this.__viaShared) return origListen.apply(this, args);
    via++;
    this.__viaShared = true;
    app.plugins.set(id, { id, server: this, cwd: gameDir });
    app.status[id] = { state: 'ok' };
    const cb = args.find((a) => typeof a === 'function');
    const gw = http.createServer((req, res) => { req.url = '/g/' + id + req.url; app.server.emit('request', req, res); });
    gateways.add(gw);
    gw.on('upgrade', (req, socket, head) => { if (process.env.VIA_DEBUG) console.log('[gw] upgrade ' + req.url); req.url = '/g/' + id + req.url; app.server.emit('upgrade', req, socket, head); });
    const host = typeof args[1] === 'string' ? args[1] : undefined;   // 沒指定主機就和原本一樣綁全部介面（localhost 解析成 ::1 也連得到）
    const port = /^\d+$/.test(String(args[0])) ? Number(args[0]) : 0;   // 檢查腳本若寫死埠號，閘道就監聽那個埠
    origListen.call(gw, ...[port, host].filter((x) => x !== undefined), () => { if (cb) cb(); this.emit('listening'); });
    this.address = () => gw.address();
    Object.defineProperty(this, 'listening', { configurable: true, get: () => gw.listening });
    const origClose = this.close;
    this.close = function (...a) { try { gw.close(); } catch (e) { /* 已關 */ } return origClose.apply(this, a); };
    return this;
  };
  // B) spawn 遊戲的 server.js
  const origSpawn = cp.spawn;
  cp.spawn = function (cmd, args, opts) {
    if (Array.isArray(args) && args[0] && path.resolve(String(args[0])) === path.join(gameDir, 'server.js')) {
      via++;
      return origSpawn.call(cp, cmd, [...(g.typescript ? process.execArgv : []), __filename, '--child', id], opts);   // 非 TypeScript 的款用純 node 啟動，比 tsx 快很多（檢查腳本有啟動等待上限）
    }
    return origSpawn.apply(cp, arguments);
  };
  process.on('exit', (code) => {
    if (!via && code === 0) { console.error('⚠ ' + id + ' 的檢查沒有經過共用伺服器（無法驗證）'); process.exitCode = 66; }
  });
  process.chdir(gameDir);
  process.argv = [process.argv[0], script];
  require(script);
})().catch((e) => { console.error('✗ ' + (e && e.stack || e)); process.exit(1); });
