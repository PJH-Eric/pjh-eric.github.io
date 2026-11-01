'use strict';
/* ===== all-in-one 共用遊戲伺服器 =====
 * 一個程序、一個 port，把每款遊戲的伺服器當成「外掛」掛在 /g/<遊戲id>/ 之下：
 *   HTTP      /g/<id>/...      （靜態檔、/health、REST）
 *   WebSocket /g/<id>/ws       （遊戲連線；舊遊戲各自的 path 規則不變，只是前面多了 /g/<id>）
 *   彙總      /health          （每款遊戲載入狀態）、/api/games
 * 做法：載入各遊戲的 server 模組（ALLINONE_EMBEDDED=1，模組只建立 http.Server、不自己 listen），
 * 再把請求／升級事件轉送給那個 http.Server（去掉 /g/<id> 前綴）。遊戲本身幾乎不用改。
 * 錯誤隔離：單款載入失敗只會讓該款回 503；單款的未捕捉例外交給 process 層記錄，不讓整個服務掛掉。
 */
process.env.ALLINONE_EMBEDDED = '1';
const http = require('http');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));
const { injectConfig, envJs } = require('../../scripts/lib/inject-config.js');
const PREFIX = /^\/g\/([a-z0-9-]+)(\/.*|$)/;

function entryOf(g) {
  const dir = path.join(root, g.projectFolder);
  const rel = g.serverEntry || (g.id === 'snake-3d' ? 'server/server.js' : g.id === 'ice-duel' ? 'server/index.ts' : 'server.js');
  return path.join(dir, rel);
}

async function loadPlugin(g) {
  const file = entryOf(g);
  const dir = path.dirname(file);
  const cwd = process.cwd();
  // 部分遊戲用相對於專案根目錄的路徑找 public／檔案；載入時暫時切換工作目錄
  process.chdir(path.join(root, g.projectFolder));
  try {
    const mod = await import(pathToFileURL(file).href);
    const m = mod.default && !mod.server && !mod.createServer ? mod.default : mod;
    let srv = m instanceof http.Server ? m : m.server;
    if (!srv && typeof m.createServer === 'function') {
      const r = m.createServer();
      srv = r instanceof http.Server ? r : (r && r.server);
    }
    if (!(srv instanceof http.Server)) throw new Error('模組沒有匯出 http.Server：' + path.relative(root, file));
    return { id: g.id, server: srv, dir, cwd: path.join(root, g.projectFolder) };
  } finally { process.chdir(cwd); }
}

function createGameServer(options) {
  const opt = options || {};
  const only = opt.only || null;
  const exclude = opt.exclude || [];   // 例：Render 上排除已另外部署在 Oracle 的 bomb-squad（環境變數 GAMES_EXCLUDE）
  const plugins = new Map();   // id -> {server}
  const status = {};           // id -> {state, error?}
  const log = opt.log || ((...a) => console.log(...a));

  const shared = http.createServer((req, res) => {
    const url = (req.url || '/').split('?')[0];
    if (url === '/health') {
      const body = { ok: true, uptime: Math.round(process.uptime()), games: status };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify(body));
    }
    if (url === '/api/games') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify(Object.keys(status).map((id) => ({ id, state: status[id].state }))));
    }
    if (url === '/' || url === '/index.html') {
      const rows = manifest.games.map((g) => '<li><a href="/g/' + g.id + '/">' + (g.title || g.id) + '</a> <small>' + g.id + ' · ' + ((status[g.id] || {}).state || '-') + '</small></li>').join('');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>遊戲小小島（本機測試）</title><style>body{font:16px system-ui;max-width:560px;margin:24px auto;padding:0 16px}li{margin:8px 0}small{color:#888}</style><h1>遊戲小小島（本機測試）</h1><ul>' + rows + '</ul><p><a href="/health">/health</a></p>');
    }
    const m = PREFIX.exec(url);
    if (!m) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
    const p = plugins.get(m[1]);
    if (!p) {
      const known = status[m[1]];
      res.writeHead(known ? 503 : 404, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, game: m[1], error: known ? known.error || 'unavailable' : 'unknown game' }));
    }
    // 本機同源測試：即時把「<本機網址>/g/<id>」注入該遊戲的連線設定，不必先 build
    const sub = m[2] || '/';
    if (req.method === 'GET' && (sub === '/js/config.js' || sub === '/env.js')) {
      const proto = req.headers['x-forwarded-proto'] || 'http';
      const base = proto + '://' + (req.headers.host || 'localhost') + '/g/' + m[1];
      try {
        if (sub === '/env.js') {
          if (m[1] === 'house-stack') { res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(envJs(base)); }
        } else {
          const g = manifest.games.find((x) => x.id === m[1]);
          const file = path.join(root, g.projectFolder, 'public', 'js', 'config.js');
          const r = injectConfig(fs.readFileSync(file, 'utf8'), base);
          if (r.kind !== 'none') { res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(r.text); }
        }
      } catch (e) { /* 找不到就交給遊戲自己的伺服器處理 */ }
    }
    // Vite 遊戲（snake-3d、ice-duel）：由共用伺服器直接發建置好的前端，並把網址佔位符換成實際主機
    const gm = manifest.games.find((x) => x.id === m[1]);
    if (gm && gm.viteDist && (req.method === 'GET' || req.method === 'HEAD') && sub !== '/health') {
      const distDir = path.join(root, gm.projectFolder, gm.viteDist);
      let rel = decodeURIComponent(sub.split('?')[0]);
      if (rel === '/' || rel === '') rel = '/index.html';
      const file = path.normalize(path.join(distDir, rel));
      if (file.startsWith(distDir) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        const ext = path.extname(file).toLowerCase();
        const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' }[ext] || 'application/octet-stream';
        const origin = (req.headers['x-forwarded-proto'] || 'http') + '://' + (req.headers.host || 'localhost');
        let body = fs.readFileSync(file);
        if (/\.(html|js|mjs|css|json)$/.test(ext)) body = Buffer.from(body.toString('utf8').split('https://gamesrv.invalid').join(origin), 'utf8');
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
        return res.end(req.method === 'HEAD' ? undefined : body);
      }
      if (sub === '/' || sub === '') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<!doctype html><meta charset="utf-8"><title>尚未建置</title><p>' + m[1] + ' 的前端尚未建置。請執行：<code>node scripts/build-vite-local.js</code>（啟動遊戲小小島.bat 會自動做）。</p>');
      }
    }
    const q = (req.url || '').indexOf('?');
    req.url = (m[2] || '/') + (q >= 0 ? req.url.slice(q) : '');
    try { p.server.emit('request', req, res); } catch (e) {
      log('[game-server] ' + m[1] + ' 例外：' + (e && e.stack || e));
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end('{"ok":false}');
    }
  });

  shared.on('upgrade', (req, socket, head) => {
    const url = req.url || '/';
    const m = PREFIX.exec(url.split('?')[0]);
    const p = m && plugins.get(m[1]);
    if (!p) { socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n'); socket.destroy(); return; }
    const q = url.indexOf('?');
    req.url = (m[2] || '/') + (q >= 0 ? url.slice(q) : '');
    socket.on('error', () => {});
    try {
      if (!p.server.emit('upgrade', req, socket, head)) { socket.destroy(); }
    } catch (e) { log('[game-server] ' + m[1] + ' upgrade 例外：' + (e && e.message)); socket.destroy(); }
  });

  async function loadAll() {
    for (const g of manifest.games) {
      if (only && !only.includes(g.id)) continue;
      if (exclude.includes(g.id)) { status[g.id] = { state: 'external', url: g.externalServer || null }; continue; }
      status[g.id] = { state: 'loading' };
      try {
        const p = await loadPlugin(g);
        plugins.set(g.id, p);
        status[g.id] = { state: 'ok' };
      } catch (e) {
        status[g.id] = { state: 'error', error: String(e && e.message || e).slice(0, 300) };
        log('[game-server] 載入失敗 ' + g.id + '：' + (e && e.message));
      }
    }
  }

  async function close() {
    await new Promise((r) => shared.close(() => r()));
  }
  return { server: shared, plugins, status, loadAll, close };
}

module.exports = { createGameServer };

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  const only = process.env.GAMES ? process.env.GAMES.split(',') : null;
  const exclude = process.env.GAMES_EXCLUDE ? process.env.GAMES_EXCLUDE.split(',').map((x) => x.trim()).filter(Boolean) : [];
  process.on('uncaughtException', (e) => console.error('[game-server] uncaughtException:', e && e.stack || e));
  process.on('unhandledRejection', (e) => console.error('[game-server] unhandledRejection:', e && e.stack || e));
  const app = createGameServer({ only, exclude });
  app.loadAll().then(() => {
    app.server.listen(PORT, () => {
      const ok = Object.keys(app.status).filter((k) => app.status[k].state === 'ok');
      Object.keys(app.status).filter((k) => app.status[k].state === 'external').forEach((k) => console.log('  ↗ ' + k + ' 由外部伺服器提供：' + app.status[k].url));
      console.log('遊戲小小島共用伺服器 :' + PORT + '，已載入 ' + ok.length + '/' + Object.keys(app.status).length + ' 款');
      Object.keys(app.status).filter((k) => app.status[k].state !== 'ok' && app.status[k].state !== 'external').forEach((k) => console.log('  ✗ ' + k + '：' + app.status[k].error));
    });
  });
  const stop = () => { app.close().finally(() => process.exit(0)); setTimeout(() => process.exit(0), 2000).unref(); };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
