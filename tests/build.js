'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { render } = require('../scripts/build');
const cfg = require('../seo.config.json');
const game = {
  id: 'test-game',
  title: '測試遊戲',
  description: '<可玩>',
  launchUrl: cfg.siteUrl + 'test-game/',
  imageUrl: cfg.siteUrl + 'test-game/assets/images/cover.webp'
};
const files = render(cfg, { games: [game] });
const sourceRobots = fs.readFileSync(path.join(__dirname, '..', 'robots.txt'), 'utf8');
assert.ok(sourceRobots.includes('User-agent: *'));
assert.ok(sourceRobots.includes('Allow: /'));
assert.ok(sourceRobots.includes('Sitemap: ' + cfg.siteUrl + 'sitemap.xml'));
assert.ok(sourceRobots.includes('Sitemap: ' + cfg.lobbyUrl + 'sitemap.xml'));
assert.ok(sourceRobots.includes('Sitemap: ' + cfg.siteUrl + 'snake-3d/sitemap.xml'));
assert.equal((files['sitemap.xml'].match(/<loc>/g) || []).length, 4);
assert.ok(files['robots.txt'].includes('Sitemap: ' + cfg.siteUrl + 'sitemap.xml'));
assert.ok(files['robots.txt'].includes('Sitemap: ' + cfg.lobbyUrl + 'sitemap.xml'));
assert.ok(files['robots.txt'].includes('Sitemap: ' + game.launchUrl + 'sitemap.xml'));
assert.ok(files['robots.txt'].includes('Sitemap: ' + cfg.siteUrl + 'snake-3d/sitemap.xml'));
assert.ok(files['index.html'].includes('href="' + cfg.lobbyUrl + '"'));
assert.ok(files['index.html'].includes('href="' + game.launchUrl + '"'));
assert.ok(files['index.html'].includes('src="' + game.imageUrl + '"'));
assert.ok(files['index.html'].includes(game.title));
assert.ok(files['index.html'].includes('3D貪吃蛇'));
assert.ok(files['sitemap.xml'].includes(game.launchUrl));
assert.ok(!files['index.html'].includes('http-equiv="refresh"'));
assert.ok(files['404.html'].includes('noindex'));
assert.ok(files['index.html'].includes('rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png"'));
assert.ok(files['index.html'].includes('property="og:image" content="' + cfg.siteUrl + 'og-image.png"'));
assert.throws(() => render(cfg, { games: [] }), /沒有任何遊戲/);
assert.throws(() => render(cfg, { games: [game, game] }), /重複/);
assert.throws(() => render(cfg, { games: [{ ...game, launchUrl: 'https://evil.example/' }] }), /遊戲設定/);
assert.throws(() => render({ ...cfg, siteUrl: 'https://other.example/' }, { games: [game] }), /SEO 設定/);
// 在多 repo 的本機工作區可加驗實際遊戲，CI 的單一 checkout 不依賴兄弟 repo。
const local = process.env.GAMES_JSON_PATH
  ? path.resolve(process.cwd(), process.env.GAMES_JSON_PATH)
  : path.resolve(__dirname, '../../game-lobby/config/games.json');
if (process.env.GAMES_JSON_PATH) assert.ok(fs.existsSync(local), 'GAMES_JSON_PATH 必須指向大廳設定檔');
if (fs.existsSync(local)) {
  const lobby = JSON.parse(fs.readFileSync(local, 'utf8'));
  const actual = render(cfg, lobby);
  assert.equal(sourceRobots, actual['robots.txt']);
  assert.equal((actual['sitemap.xml'].match(/<loc>/g) || []).length, lobby.games.length + 3);
  assert.equal((actual['robots.txt'].match(/^Sitemap:/gm) || []).length, lobby.games.length + 3);
  assert.ok(actual['sitemap.xml'].includes(cfg.siteUrl + 'snake-3d/'));
  assert.ok(actual['robots.txt'].includes('Sitemap: ' + cfg.siteUrl + 'snake-3d/sitemap.xml'));
  assert.equal((actual['index.html'].match(/class="game-tile"/g) || []).length, lobby.games.length + 1);
  lobby.games.forEach(g => {
    assert.ok(actual['sitemap.xml'].includes(g.launchUrl));
    assert.ok(actual['robots.txt'].includes('Sitemap: ' + g.launchUrl + 'sitemap.xml'));
    assert.equal(g.imageUrl, g.launchUrl + 'assets/images/cover.webp');
    assert.ok(actual['index.html'].includes('src="' + g.imageUrl + '"'));
  });
  assert.ok(actual['index.html'].includes('src="' + cfg.siteUrl + 'snake-3d/assets/images/cover.webp"'));
}
console.log('✓ 根網站遊戲封面、大廳入口、sitemap、robots、圖示與無效設定測試通過');
