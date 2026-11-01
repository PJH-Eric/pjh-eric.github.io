'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(require.resolve('playwright', { paths: [path.resolve(__dirname, '../../fruit-link')] }));
const { inject } = require('./seo/inject-seo');
const root = path.resolve(__dirname, '../..');
const games = require('../config/games.json').games;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'game-ga4-'));
const indexes = {};
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const publicId = 'G-PG79WZK8QY';

async function main() {
  for (const game of games.filter(game => game.id !== 'maze-roll' && game.id !== 'snake-3d')) {
    const folder = path.join(temp, game.id);
    fs.mkdirSync(path.join(folder, 'public'), { recursive: true });
    fs.copyFileSync(path.join(root, game.id, 'seo.config.json'), path.join(folder, 'seo.config.json'));
    fs.copyFileSync(path.join(root, game.id, 'public/index.html'), path.join(folder, 'public/index.html'));
    inject(folder, {});
    indexes[game.id] = fs.readFileSync(path.join(folder, 'public/index.html'), 'utf8');
  }
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let tagLoads = 0;
  const errors = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    // 測試正式 hostname 的初始化，但攔截 Google script，絕不污染正式 GA 資料。
    if (url.hostname === 'www.googletagmanager.com') {
      tagLoads++;
      return route.fulfill({ contentType: 'text/javascript', body: '/* GA loader intercepted for verification */' });
    }
    if (!['pjh-eric.github.io', '127.0.0.1'].includes(url.hostname)) return route.abort();
    const [id, ...parts] = decodeURIComponent(url.pathname).split('/').filter(Boolean);
    const base = path.join(root, id || '', id === 'game-lobby' ? 'dist' : 'public');
    const target = path.resolve(base, parts.length ? parts.join('/') : 'index.html');
    if (!target.startsWith(base + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) return route.fulfill({ status: 404 });
    let body = fs.readFileSync(target);
    if (!parts.length && indexes[id]) body = indexes[id];
    if (id === 'maze-roll' && parts.join('/') === 'js/config.js') body = body.toString('utf8').replace('__GA4_MEASUREMENT_ID__', publicId);
    return route.fulfill({ contentType: mime[path.extname(target)] || 'application/octet-stream', body });
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const events = () => page.evaluate(() => (window.dataLayer || []).map(args => Array.from(args)).filter(args => args[0] === 'event'));
  try {
    for (const id of ['game-lobby', ...games.map(game => game.id)]) {
      const before = tagLoads;
      await page.goto('https://pjh-eric.github.io/' + id + '/?token=private-token#private-hash');
      await page.waitForFunction(() => !!window.GameAnalytics);
      await page.waitForFunction(() => (window.dataLayer || []).some(args => args[0] === 'config'));
      assert.equal(tagLoads - before, 1, id + ' 只載入一個 Google tag');
      const configs = await page.evaluate(() => dataLayer.filter(args => args[0] === 'config').map(args => args[2]));
      assert.equal(configs.length, 1, id + ' config 只送一次');
      assert.equal(configs[0].game_id, id === 'game-lobby' ? 'lobby' : id);
      assert.ok(!JSON.stringify(configs).includes('private-'));
      await page.evaluate(() => {
        GameAnalytics.start({ mode: 'online', players: 2 }, 'browser-round');
        GameAnalytics.start({ mode: 'online', players: 2 }, 'browser-round');
        GameAnalytics.end({ result: 'win' });
        GameAnalytics.end({ result: 'win' });
        GameAnalytics.sync('playing', 'watch-round', { spectator: true });
      });
      const recorded = await events();
      assert.equal(recorded.filter(event => event[1] === 'game_start').length, 1);
      assert.equal(recorded.filter(event => event[1] === 'game_end').length, 1);
      assert.ok(recorded.every(event => event[2].game_id === (id === 'game-lobby' ? 'lobby' : id)));
      await page.goto('http://127.0.0.1/' + id + '/');
      await page.waitForFunction(() => !!window.GameAnalytics);
      assert.equal(await page.evaluate(() => typeof window.gtag), 'undefined', id + ' 本機不初始化 GA');
      assert.equal(tagLoads - before, 1, id + ' 本機不載入 Google tag');
      console.log('✓ browser GA4 ' + id + ': production bootstrap, deduplication, spectator, local isolation');
    }

    await page.goto('https://pjh-eric.github.io/game-lobby/');
    await page.waitForSelector('.game-card');
    await page.locator('[data-details]').first().click();
    await page.locator('#details-launch').evaluate(link => {
      link.addEventListener('click', event => event.preventDefault()); link.click();
    });
    await page.keyboard.press('Escape');
    await page.locator('[data-favorite]').first().click();
    await page.locator('[data-filter="brain"]').click();
    const lobbyEvents = await events();
    for (const name of ['view_game_details', 'select_content', 'favorite_game', 'filter_games']) {
      assert.equal(lobbyEvents.filter(event => event[1] === name).length, 1, name);
    }
    assert.equal(lobbyEvents.find(event => event[1] === 'select_content')[2].entry_point, 'details');

    await page.goto('https://pjh-eric.github.io/fruit-link/');
    await page.click('#b-solo');
    await page.click('#opt-level .pickcard[data-v="kids"]');
    await page.click('#b-solo-start');
    await page.waitForFunction(() => window.__fruitLink?.snap?.phase === 'playing');
    for (let i = 0; i < 40; i++) {
      const pair = await page.evaluate(() => {
        const state = window.__fruitLink.snap;
        return state.over ? null : Rules.findPair(state.grid, state.W, state.H);
      });
      if (!pair) break;
      await page.click('#board .tile[data-i="' + pair.a + '"]');
      await page.click('#board .tile[data-i="' + pair.b + '"]');
      await page.waitForTimeout(450);
    }
    await page.waitForFunction(() => !document.getElementById('ov-result').hidden);
    const round = await events();
    assert.equal(round.filter(event => event[1] === 'game_start').length, 1);
    assert.equal(round.filter(event => event[1] === 'game_end').length, 1);
    await page.click('#ov-result-btns button:nth-child(2)');
    assert.equal((await events()).filter(event => event[1] === 'game_start').length, 2);
    console.log('✓ lobby interactions and Fruit Link complete round/replay');

    await page.goto('https://pjh-eric.github.io/maze-roll/');
    await page.getByRole('button', { name: /自由練習/ }).click();
    await page.getByRole('button', { name: '開始遊戲', exact: true }).click();
    await page.waitForFunction(() => window.__MRGAME?.state === 'play');
    assert.equal((await events()).filter(event => event[1] === 'game_start').length, 1);
    // 透過規則引擎模擬抵達終點，驗證新的 onEnd 接線與結算 overlay。
    await page.evaluate(() => {
      const game = window.__MRGAME, world = game.world, player = world.byId.get(game.meId);
      const goal = world.maze.goal;
      player.x = goal % world.maze.w + 0.5;
      player.y = Math.floor(goal / world.maze.w) + 0.5;
      player.vx = player.vy = 0;
    });
    await page.waitForFunction(() => (window.dataLayer || []).some(args => args[1] === 'game_end'));
    assert.equal((await events()).filter(event => event[1] === 'game_end').length, 1);
    console.log('✓ Maze Roll actual start and rules-engine finish integration');
    assert.deepEqual(errors, [], '沒有未處理的 JavaScript 錯誤');
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  if (path.dirname(temp) === path.resolve(os.tmpdir()) && path.basename(temp).startsWith('game-ga4-')) fs.rmSync(temp, { recursive: true, force: true });
});
