'use strict';

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const games = JSON.parse(fs.readFileSync(path.join(root, 'config/games.json'), 'utf8')).games;
const files = [['inject-seo.js', 'scripts/inject-seo.js'], ['analytics.js', 'public/js/analytics.js'],
  ['seo-test.js', 'tests/seo.js'], ['analytics-test.js', 'tests/analytics.js']];
let failed = false;
for (const game of games) {
  const repo = path.resolve(root, '..', game.projectFolder);
  for (const [source, dest] of files) {
    // 疊疊高樓的 inject-seo 支援輸出到 dist/（GitHub Pages 建置需要），比共用範本新；維持自己的版本，不被覆寫。
    if (game.id === 'house-stack') continue;
    // 3D貪吃蛇是 Vite 建置，不使用這套 public/ 注入流程。
    if (game.id === 'snake-3d') continue;
    // 迷宮滾球沿用原有的 config.js 與畫面瀏覽設定，不建立另一套 SEO 注入流程。
    if (game.id === 'maze-roll' && (source === 'inject-seo.js' || source === 'seo-test.js')) continue;
    const expected = fs.readFileSync(path.join(__dirname, 'seo', source), 'utf8');
    const target = path.join(repo, dest);
    if (process.argv.includes('--write')) fs.writeFileSync(target, expected, 'utf8');
    else if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== expected) {
      console.error('共用檔案不同步：' + game.id + '/' + dest);
      failed = true;
    }
  }
}
for (const [source, dest] of [['analytics.js', 'analytics.js'], ['analytics-test.js', 'tests/analytics.js']]) {
  const expected = fs.readFileSync(path.join(__dirname, 'seo', source), 'utf8');
  const target = path.join(root, dest);
  if (process.argv.includes('--write')) fs.writeFileSync(target, expected, 'utf8');
  else if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== expected) {
    console.error('大廳共用檔案不同步：' + dest);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
if (!failed) console.log('✓ ' + games.length + ' 款遊戲 SEO 共用檔案一致');
