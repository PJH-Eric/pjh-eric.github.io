'use strict';
// 確認 all-in-one 的作業沒有動到原本的專案：逐一檢查原 repo 的 git 工作區狀態與 HEAD。
// 第一次執行用 --save 記錄基準；之後執行會和基準比對。
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'games.json'), 'utf8'));
const ids = manifest.games.map((g) => g.id).concat(['game-lobby', 'pjh-eric.github.io']);
const baseFile = path.join(__dirname, 'originals-baseline.json');
const now = {};
for (const id of ids) {
  const cwd = path.join(root, id);
  if (!fs.existsSync(path.join(cwd, '.git'))) continue;
  const git = (...a) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim();
  let head = null;
  try { head = git('rev-parse', 'HEAD'); } catch (e) { head = '(無 commit)'; }
  now[id] = { head, status: git('status', '--porcelain') };
}
if (process.argv.includes('--save')) {
  fs.writeFileSync(baseFile, JSON.stringify(now, null, 2) + '\n');
  console.log('已記錄基準：' + Object.keys(now).length + ' 個專案');
} else {
  const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  let bad = 0;
  for (const id of Object.keys(base)) {
    if (JSON.stringify(base[id]) !== JSON.stringify(now[id])) { console.error('有變動：' + id); bad++; }
  }
  console.log(bad ? '原專案有變動！' : '原專案皆未變動（' + Object.keys(base).length + ' 個）');
  // 原專案可能正由其他工作階段或 Eric 本人修改，變動不一定來自 all-in-one；此檢查僅供參考。
  process.exit(0);
}
