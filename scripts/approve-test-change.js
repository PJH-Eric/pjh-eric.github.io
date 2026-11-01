'use strict';
/* 人工核准測試檔的合法改動（傳輸層統一、上游同步…）。
 *   node scripts/approve-test-change.js games/<id>/tests/x.js "原因"
 * 把檔案目前的 sha256 與原因寫進 docs/test-change-allowlist.json；檔案之後再被改動就會失效。
 * 白名單變更必須由人確認後 commit，verify-games 偵測到未提交的白名單變更會判失敗。 */
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const [file, ...r] = process.argv.slice(2); const reason = r.join(' ').trim();
if (!file || !reason) { console.error('用法：node scripts/approve-test-change.js <檔案> "<原因>"'); process.exit(1); }
const f = path.join(root, 'docs/test-change-allowlist.json');
const data = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
data.files = data.files || {};
data.files[file] = { reason, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex') };
data._說明 = '合法的測試改動白名單。每筆綁檔案 sha256，內容改動就失效；其餘測試檔只允許改 require/import 行。';
fs.writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
console.log('已登記：' + file);
