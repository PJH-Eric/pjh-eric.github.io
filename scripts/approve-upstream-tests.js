'use strict';
/* 一次登記「和原專案完全相同」的測試檔（也就是純粹從原專案同步過來的上游測試變更）。
 *   node scripts/approve-upstream-tests.js          只列出，不登記
 *   node scripts/approve-upstream-tests.js --yes    登記
 * 只處理：相對初始 commit 有改動、而且內容與原專案現況逐位元組相同的 games/<id>/(scripts|tests)/*。
 * 與原專案不同的（例如為了統一連線層改過的 online-check）一律不碰，只列出來請人看。 */
const fs = require('fs'); const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const yes = process.argv.includes('--yes');
const out = execFileSync('git', ['diff', '5c89174', '--name-only', '--diff-filter=M', '--', 'games/*/scripts/*', 'games/*/tests/*'], { cwd: root, encoding: 'utf8' });
const files = out.split('\n').map((s) => s.trim()).filter(Boolean);
const ok = []; const other = [];
for (const f of files) {
  const m = f.match(/^games\/([^/]+)\/(.+)$/);
  const orig = path.resolve(root, '..', m[1], m[2]);
  if (fs.existsSync(orig) && fs.readFileSync(orig).equals(fs.readFileSync(path.join(root, f)))) ok.push(f); else other.push(f);
}
console.log('與原專案完全相同（上游測試變更）：' + ok.length + ' 個');
ok.forEach((f) => console.log('  ' + f));
console.log('與原專案不同（含整合時改的內容，不自動登記）：' + other.length + ' 個');
other.forEach((f) => console.log('  ' + f));
if (!yes) { console.log('\n確認無誤後加 --yes 才會登記。'); process.exit(0); }
for (const f of ok) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'approve-test-change.js'), f, '同步原專案的上游測試更新（與原專案相同）'], { cwd: root, encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
}
console.log('\n完成。請接著 commit docs/test-change-allowlist.json（驗證器要求白名單已提交）。');
