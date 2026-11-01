'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const assert = require('assert');
const { chromium } = require(require.resolve('playwright', { paths: [path.resolve(__dirname, '../../fruit-link')] }));
const { inject } = require('./seo/inject-seo');
const root = path.resolve(__dirname, '../..');
/* 3D貪吃蛇是 Vite 建置、沒有 seo.config.json，GA4 由自己的單元測試驗證，這裡不含 */
const games = require('../config/games.json').games.filter((game) => game.id !== 'snake-3d');
const shots = path.join(root, 'game-lobby/verification/seo-shots');
fs.mkdirSync(shots, { recursive: true });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-browser-'));
const indexes = {};
for (const game of games) {
  const dir = path.join(temp, game.id);
  fs.mkdirSync(path.join(dir, 'public'), { recursive: true });
  fs.copyFileSync(path.join(root, game.id, 'seo.config.json'), path.join(dir, 'seo.config.json'));
  fs.copyFileSync(path.join(root, game.id, 'public/index.html'), path.join(dir, 'public/index.html'));
  inject(dir, {});
  indexes[game.id] = fs.readFileSync(path.join(dir, 'public/index.html'), 'utf8');
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const parts = decodeURIComponent(u.pathname).split('/').filter(Boolean);
  const id = parts.shift();
  let target;
  if (id === 'root') target = path.join(root, 'pjh-eric.github.io/dist', ...parts, parts.length ? '' : 'index.html');
  else if (id === 'game-lobby') target = path.join(root, id, 'dist', ...parts, parts.length ? '' : 'index.html');
  else if (indexes[id]) {
    if (!parts.length || parts[0] === 'index.html') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(indexes[id]); return; }
    target = path.join(root, id, 'public', ...parts);
  }
  if (!target || !target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', (types[path.extname(target)] || 'application/octet-stream') + '; charset=utf-8');
  fs.createReadStream(target).pipe(res);
});

async function main() {
  await new Promise(resolve => server.listen(3899, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  const problems = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', e => problems.push(e.message));
    let gaRequests = 0;
    page.on('request', req => { if (/googletagmanager|google-analytics/.test(req.url())) gaRequests++; });
    for (const game of games) {
      const cfg = JSON.parse(fs.readFileSync(path.join(root, game.id, 'seo.config.json'), 'utf8'));
      await page.goto('http://127.0.0.1:3899/' + game.id + '/', { waitUntil: 'networkidle' });
      assert.equal(await page.title(), cfg.title, game.id + ' zh title');
      assert.equal(await page.locator('meta[name=description]').getAttribute('content'), cfg.description, game.id + ' zh desc');
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), cfg.siteUrl);
      await page.evaluate(() => window.I18N.setLang('en'));
      assert.ok(!/[\u3400-\u9fff]/.test(await page.title()), game.id + ' en title');
      await page.evaluate(() => window.I18N.setLang('zh-Hant'));
      assert.equal(await page.title(), cfg.title, game.id + ' switched zh title');
      console.log('✓ browser metadata ' + game.id);
    }
    assert.equal(gaRequests, 0, '本機不得向 GA 發送資料');
    for (const [name, width, height] of [['phone', 390, 844], ['tablet-portrait', 834, 1112], ['tablet-landscape', 1112, 834], ['desktop', 1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.goto('http://127.0.0.1:3899/fruit-link/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, name + ' horizontal overflow ' + overflow);
      await page.screenshot({ path: path.join(shots, 'fruit-link-' + name + '.png') });
    }
    await page.addInitScript(() => { window.__gaEvents = []; window.gtag = (...args) => window.__gaEvents.push(args); });
    await page.goto('http://127.0.0.1:3899/fruit-link/', { waitUntil: 'networkidle' });
    await page.click('#b-solo');
    await page.click('#opt-level .pickcard[data-v="kids"]');
    await page.click('#b-solo-start');
    await page.waitForFunction(() => window.__fruitLink.snap && window.__fruitLink.snap.phase === 'playing');
    for (let i = 0; i < 40; i++) {
      const pair = await page.evaluate(() => {
        const m = window.__fruitLink.snap;
        if (m.over) return null;
        return window.Rules.findPair(m.grid, m.W, m.H);
      });
      if (!pair) break;
      await page.click('#board .tile[data-i="' + pair.a + '"]');
      await page.click('#board .tile[data-i="' + pair.b + '"]');
      await page.waitForTimeout(450);
    }
    await page.waitForFunction(() => !document.getElementById('ov-result').hidden);
    const events = await page.evaluate(() => window.__gaEvents.filter(e => e[0] === 'event'));
    assert.equal(events.filter(e => e[1] === 'game_start').length, 1);
    assert.equal(events.filter(e => e[1] === 'game_end').length, 1);
    assert.equal(events.find(e => e[1] === 'game_end')[2].result, 'win');
    await page.screenshot({ path: path.join(shots, 'fruit-link-result.png') });
    await page.click('#ov-result-btns button:nth-child(2)');
    assert.equal(await page.evaluate(() => window.__gaEvents.filter(e => e[1] === 'game_start').length), 2);
    console.log('✓ 完成一局並重玩：開局與結算各送一次');
    await page.goto('http://127.0.0.1:3899/game-lobby/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { window.__gaEvents = []; window.gtag = (...args) => window.__gaEvents.push(args); });
    // 防止離站，觀察 click 事件是否只送一次。
    await page.route('https://pjh-eric.github.io/**', route => route.abort());
    await page.locator('.play-link').first().evaluate(el => { el.addEventListener('click', e => e.preventDefault()); el.click(); });
    assert.equal(await page.evaluate(() => window.__gaEvents.filter(e => e[1] === 'select_content').length), 1);
    await page.goto('http://127.0.0.1:3899/root/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.locator('li').count(), 15);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(shots, 'root-phone.png'), fullPage: true });
    assert.equal(gaRequests, 0, '本機含大廳及根網站皆不得傳送 GA');
    assert.deepEqual(problems, [], '瀏覽器未處理錯誤');
    console.log('✓ 大廳選擇事件、根入口與 RWD 抽查通過');
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  server.close(); fs.rmSync(temp, { recursive: true, force: true });
});
