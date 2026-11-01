'use strict';
// 唯讀地把原專案「目前」的內容重新複製進 all-in-one（原專案不會被寫入）。
// 預設只列出差異（dry-run）；加 --write 才會覆寫 all-in-one 內的複本。
// 注意：all-in-one 內已經改過的檔案會被原版覆蓋，所以只在還沒動某款時使用，或先 commit。
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const orig = path.resolve(root, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');
const ex = ['.git', 'node_modules', 'dist', 'screenshots', 'test-results', 'playwright-report', '.loop*', '*.key', '.env', '.env.*'].map((e) => '--exclude=' + e);
// .env.example 是被追蹤的範例檔，必須保留（真正的 .env 與其他 .env.* 才排除）；include 要排在 exclude 前面才有效
ex.unshift('--include=.env.example');
const jobs = manifest.games.map((g) => [g.id, path.join(orig, g.id), path.join(root, g.projectFolder)]);
jobs.push(['game-lobby', path.join(orig, 'game-lobby'), path.join(root, 'apps/lobby')], ['pjh-eric.github.io', path.join(orig, 'pjh-eric.github.io'), path.join(root, 'apps/site')]);
for (const [id, src, dst] of jobs) {
  if (only.length && !only.includes(id)) continue;
  const args = ['-ai', '--exclude=全遊戲整合規劃書.md', ...ex, ...(write ? [] : ['--dry-run']), src + '/', dst + '/'];
  const r = spawnSync('rsync', args, { encoding: 'utf8' });
  const lines = r.stdout.split('\n').filter((l) => /^[<>c]f/.test(l));
  console.log((lines.length ? '差異 ' + lines.length + ' 檔：' : '相同：') + id);
}
