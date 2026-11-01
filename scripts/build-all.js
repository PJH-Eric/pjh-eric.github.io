/*
 * scripts/build-all.js — 統一建置：把大廳＋18 款遊戲的前端組成一個 site-dist/，可直接放 GitHub Pages。
 *   node scripts/build-all.js                         （只建靜態遊戲，vite 遊戲略過並提示）
 *   node scripts/build-all.js --vite                  （連 snake-3d、ice-duel 一起建；需要網路 npm install）
 *   GAME_SERVER_URL=https://xxx.onrender.com node scripts/build-all.js
 *       → 每款的 config 注入 <GAME_SERVER_URL>/g/<遊戲id>（共用伺服器），沒給就維持同源／單機
 * 輸出：site-dist/（大廳在根目錄，每款在 /<遊戲id>/，與既有網址相同）
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const out = process.env.SITE_OUT ? path.resolve(process.env.SITE_OUT) : path.join(root, 'site-dist');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));
const withVite = process.argv.includes('--vite');
const serverUrl = String(process.env.GAME_SERVER_URL || '').trim().replace(/\/+$/, '');
if (serverUrl && !/^https:\/\//.test(serverUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(serverUrl)) {
  console.error('✗ GAME_SERVER_URL 正式部署請用 https：' + serverUrl); process.exit(1);
}

const run = (cmd, cwd, env) => spawnSync('bash', ['-c', cmd], { cwd, env: Object.assign({}, process.env, env || {}), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
function copyDir(src, dst) { fs.mkdirSync(dst, { recursive: true }); fs.cpSync(src, dst, { recursive: true, filter: (p) => !/(^|[\\/])(node_modules|\.git)([\\/]|$)/.test(p) }); }

const { injectConfig, envJs } = require('./lib/inject-config.js');

// GA4／SEO：與各原專案的部署流程一致。測量 ID 全站共用，可用環境變數 GA_MEASUREMENT_ID 覆寫；
// 注入腳本只在暫存複製上跑（不改 games/ 原始碼）。
const GA_ID = String(process.env.GA_MEASUREMENT_ID || process.env.GA4_MEASUREMENT_ID || 'G-PG79WZK8QY').trim();
if (!/^G-[A-Z0-9]+$/.test(GA_ID)) { console.error('✗ GA_MEASUREMENT_ID 格式錯誤：' + GA_ID); process.exit(1); }
const GA_ENV = { GA_MEASUREMENT_ID: GA_ID };
function fillGaPlaceholder(dir) {   // maze-roll：public/js/config.js 的 __GA4_MEASUREMENT_ID__
  const cfg = path.join(dir, 'js', 'config.js');
  if (!fs.existsSync(cfg)) return;
  const t = fs.readFileSync(cfg, 'utf8');
  if (t.includes('__GA4_MEASUREMENT_ID__')) fs.writeFileSync(cfg, t.split('__GA4_MEASUREMENT_ID__').join(GA_ID));
}
function inject(dir, id) {
  // 單款可指定外部伺服器（例：bomb-squad 在 Oracle：games.json 的 externalServer，或環境變數 GAME_SERVER_URL_<ID>，ID 的 - 換成 _）
  const g = manifest.games.find((x) => x.id === id) || {};
  const ext = String(process.env['GAME_SERVER_URL_' + id.toUpperCase().replace(/-/g, '_')] || g.externalServer || '').trim().replace(/\/+$/, '');
  if (ext && !/^https:\/\//.test(ext)) { console.error('✗ ' + id + ' 的外部伺服器請用 https：' + ext); process.exit(1); }
  if (!serverUrl && !ext) return 'skip';
  const url = ext || serverUrl + '/g/' + id;
  // house-stack：連線設定放在 env.js（window.__GAME_CONFIG__），與原 build-pages.js 相同
  if (id === 'house-stack') { fs.writeFileSync(path.join(dir, 'env.js'), envJs(url)); return 'env.js'; }
  const cfg = path.join(dir, 'js', 'config.js');
  if (!fs.existsSync(cfg)) return 'skip';
  const r = injectConfig(fs.readFileSync(cfg, 'utf8'), url);
  if (r.kind !== 'none') fs.writeFileSync(cfg, r.text);
  return r.kind === 'none' ? 'no-marker' : r.kind;
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// 1) 大廳 → 根目錄
let r = run('node scripts/build-pages.js', path.join(root, 'apps/lobby'));
if (r.status !== 0) { console.error('✗ 大廳建置失敗\n' + r.stdout + r.stderr); process.exit(1); }
copyDir(path.join(root, 'apps/lobby/dist'), out);
console.log('✓ 大廳');

// 2) 各遊戲
const report = [];
for (const g of manifest.games) {
  const dst = path.join(out, g.id);
  const proj = path.join(root, g.projectFolder);
  if (g.buildType === 'static') {
    let pub = path.join(proj, 'public');
    if (fs.existsSync(path.join(proj, 'scripts', 'inject-seo.js'))) {
      const work = path.join(os.tmpdir(), 'pjh-seo', g.id);
      fs.rmSync(work, { recursive: true, force: true });
      copyDir(proj, work);
      const x = run('node scripts/inject-seo.js', work, GA_ENV);
      if (x.status !== 0) { console.error('✗ ' + g.id + ' SEO 注入失敗\n' + x.stdout + x.stderr); process.exit(1); }
      pub = path.join(work, 'public');
    }
    copyDir(pub, dst);
    fillGaPlaceholder(dst);
    report.push(['✓', g.id, '靜態', inject(dst, g.id)]);
  } else if (withVite) {
    const work = path.join(os.tmpdir(), 'pjh-build', g.id);
    fs.rmSync(work, { recursive: true, force: true });
    copyDir(proj, work);
    const env = serverUrl ? { VITE_GAME_SERVER_URL: serverUrl + '/g/' + g.id, GAME_SERVER_URL: serverUrl + '/g/' + g.id } : {};
    const clientDir = g.id === 'snake-3d' ? path.join(work, 'client') : work;
    const steps = ['npm install --no-audit --no-fund --silent', g.id === 'snake-3d' ? 'npx vite build' : 'npx vite build'];
    let ok = true;
    for (const s of steps) { const x = run(s, clientDir, env); if (x.status !== 0) { ok = false; console.error(x.stdout + x.stderr); break; } }
    if (ok && fs.existsSync(path.join(work, 'scripts', 'inject-seo.mjs'))) {   // ice-duel：建置後把 GA4／SEO 寫進 dist
      const x = run('node scripts/inject-seo.mjs', work, GA_ENV);
      if (x.status !== 0) { console.error(x.stdout + x.stderr); ok = false; }
    }
    if (ok) { copyDir(path.join(clientDir, 'dist'), dst); report.push(['✓', g.id, 'vite', serverUrl ? 'ok' : 'skip']); }
    else report.push(['✗', g.id, 'vite', '建置失敗']);
  } else {
    report.push(['-', g.id, 'vite', '略過（加 --vite 才建）']);
  }
}
// 3) 網址改寫：原專案的 SEO／GA／大廳連結都寫死舊的獨立網址（pjh-eric.github.io/<遊戲>/、/game-lobby/）。
//    新專案發佈在 https://pjh-eric.github.io/<SITE_BASE_PATH>/ 底下。預設為空字串 = 網域根目錄（pjh-eric.github.io/），
//    要放子路徑時設 SITE_BASE_PATH=games 之類。只在建置輸出 site-dist/ 改寫，games/ 與 apps/ 的原始碼不動。
const BASE_PATH = String(process.env.SITE_BASE_PATH != null ? process.env.SITE_BASE_PATH : '').replace(/^\/+|\/+$/g, '');
if (BASE_PATH && !/^[a-z0-9-]+$/.test(BASE_PATH)) { console.error('✗ SITE_BASE_PATH 格式錯誤：' + BASE_PATH); process.exit(1); }
const PREFIX = BASE_PATH ? '/' + BASE_PATH : '';   // 根目錄時為空，避免產生 // 網址
const ORIGIN = 'https://pjh-eric.github.io';
const ids = manifest.games.map((x) => x.id).concat(['game-lobby']);
const urlRe = new RegExp(ORIGIN.replace(/\./g, '\\.') + '/(' + ids.join('|') + ')/', 'g');
let rewritten = 0;
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const f = path.join(dir, name);
    if (fs.statSync(f).isDirectory()) { walk(f); continue; }
    if (!/\.(html|xml|txt|json|js|webmanifest)$/.test(name)) continue;
    const t = fs.readFileSync(f, 'utf8');
    const n = t
      .replace(urlRe, (m, id) => ORIGIN + PREFIX + '/' + (id === 'game-lobby' ? '' : id + '/'))
      .replace(/(['"])\/game-lobby\/\1/g, '$1' + PREFIX + '/$1');   // analytics.js 以 pathname 判斷「回大廳」連結
    if (n !== t) { fs.writeFileSync(f, n); rewritten++; }
  }
})(out);
console.log('✓ 網址改寫為 ' + ORIGIN + (PREFIX || '') + '/…（' + rewritten + ' 個檔案）');
fs.writeFileSync(path.join(out, '.nojekyll'), '');
report.forEach((x) => console.log(x.join(' ')));
const bad = report.filter((x) => x[0] === '✗' || x[3] === 'no-marker');
if (bad.length) { console.error('✗ 有問題：' + bad.map((x) => x[1]).join(', ')); process.exit(1); }
console.log('完成：' + path.relative(root, out) + '/');
