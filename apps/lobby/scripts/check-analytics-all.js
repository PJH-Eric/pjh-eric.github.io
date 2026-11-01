'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const games = require('../config/games.json').games;
/* 3D貪吃蛇是 Vite 建置（client/index.html、沒有 seo.config.json），GA4 由自己的 client 單元測試驗證 */
function runSnakeAnalytics(repo) {
  const client = path.join(repo, 'client');
  return spawnSync(process.execPath, [path.join(client, 'node_modules', 'vitest', 'vitest.mjs'), 'run', 'tests/analytics.test.js'], { cwd: client, encoding: 'utf8' });
}
let failed = false;
for (const game of [{ id: 'lobby', repo: root }, ...games.map(game => ({ id: game.id, repo: path.resolve(root, '..', game.projectFolder) }))]) {
  if (game.id === 'snake-3d') {
    const result = runSnakeAnalytics(game.repo);
    if (result.status !== 0) { failed = true; console.error(game.id, result.stdout, result.stderr); }
    else console.log('✓ GA4 ' + game.id);
    if (!fs.readFileSync(path.join(game.repo, 'client', 'index.html'), 'utf8').includes('GAME_ANALYTICS_CONFIG')) { failed = true; console.error(game.id + ' 缺少 GA4 設定'); }
    continue;
  }
  const result = spawnSync(process.execPath, ['tests/analytics.js'], { cwd: game.repo, encoding: 'utf8' });
  if (result.status !== 0) { failed = true; console.error(game.id, result.stdout, result.stderr); }
  else console.log('✓ GA4 ' + game.id);
  const html = fs.readFileSync(path.join(game.repo, game.id === 'lobby' ? 'index.html' : 'public/index.html'), 'utf8');
  if (!html.includes('analytics.js')) { failed = true; console.error(game.id + ' 缺少追蹤程式入口'); }
}
process.exitCode = failed ? 1 : 0;
