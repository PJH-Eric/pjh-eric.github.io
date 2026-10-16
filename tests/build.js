'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { render } = require('../scripts/build');
const cfg = require('../seo.config.json');
const game = { id: 'test-game', title: '測試遊戲', description: '<可玩>', launchUrl: cfg.siteUrl + 'test-game/' };
const files = render(cfg, { games: [game] });
assert.equal((files['sitemap.xml'].match(/<loc>/g) || []).length, 3);
assert.ok(files['robots.txt'].includes('Sitemap: ' + cfg.siteUrl + 'sitemap.xml'));
assert.ok(files['index.html'].includes('&lt;可玩&gt;'));
assert.ok(files['index.html'].includes(game.launchUrl));
assert.ok(!files['index.html'].includes('http-equiv="refresh"'));
assert.ok(files['404.html'].includes('noindex'));
assert.throws(() => render(cfg, { games: [] }), /沒有任何遊戲/);
assert.throws(() => render(cfg, { games: [game, game] }), /重複/);
assert.throws(() => render(cfg, { games: [{ ...game, launchUrl: 'https://evil.example/' }] }), /遊戲設定/);
assert.throws(() => render({ ...cfg, siteUrl: 'https://other.example/' }, { games: [game] }), /SEO 設定/);
// 在多 repo 的本機工作區可加驗實際 15 款，CI 的單一 checkout 不依賴兄弟 repo。
const local = path.resolve(__dirname, '../../game-lobby/config/games.json');
if (fs.existsSync(local)) {
  const lobby = JSON.parse(fs.readFileSync(local, 'utf8'));
  const actual = render(cfg, lobby);
  assert.equal((actual['sitemap.xml'].match(/<loc>/g) || []).length, lobby.games.length + 2);
  lobby.games.forEach(g => assert.ok(actual['index.html'].includes(g.launchUrl)));
}
console.log('✓ 根網站連結、sitemap、robots、跳脫與無效設定測試通過');
