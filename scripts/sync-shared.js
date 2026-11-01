'use strict';
// 把 packages/web-core 的共用檔複製到各款遊戲 public/js/（零行為變更：檔名與位置不變）。
//   node scripts/sync-shared.js          只檢查，不一致就失敗
//   node scripts/sync-shared.js --write  覆寫遊戲內的複本
// 哪些遊戲要同步由 games.json 每款的 "shared" 欄位決定（例外的款不列）。
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));
const write = process.argv.includes('--write');
let bad = 0;
// [games.json 欄位, 套件目錄, 來源檔, 遊戲內目的地（依檔名）]
const SPECS = [
  ['shared', 'web-core', (n) => n + '.js', (n) => 'public/js/' + n + '.js'],
  ['sharedPublic', 'web-core', (n) => n + '.js', (n, g) => (g.id === 'snake-3d' ? 'client/' : '') + 'public/' + n + '.js'],
  ['sharedLocales', 'web-core', (n) => 'locales/' + n + '.js', (n, g) => (g.id === 'snake-3d' ? 'client/' : '') + 'public/' + (g.buildType === 'vite' ? '' : 'js/') + 'locales/' + n + '.js'],
  ['sharedServer', 'net-server', (n) => n + '.js', (n, g) => (g.serverLibDir || 'lib') + '/' + n + '.js']
];
for (const g of manifest.games) {
  // "type": "module" 的專案（ice-duel、snake-3d）：共用的連線檔是 CommonJS，放進自己有 package.json 的獨立資料夾才不會被當成 ESM
  if (g.serverLibIsolated && g.serverLibDir && (g.sharedServer || []).length) {
    const pj = path.join(root, g.projectFolder, g.serverLibDir, 'package.json');
    const want = '{ "type": "commonjs" }\n';
    if (write) { fs.mkdirSync(path.dirname(pj), { recursive: true }); fs.writeFileSync(pj, want); }
    else if (!fs.existsSync(pj) || fs.readFileSync(pj, 'utf8') !== want) { console.error('不同步：' + g.id + '/' + g.serverLibDir + '/package.json'); bad++; }
  }
  for (const [field, pkg, srcName, dstName] of SPECS) {
    for (const name of g[field] || []) {
      // 同名的 .d.ts（給 TypeScript 專案的型別宣告）一起同步
      const variants = [[srcName(name), dstName(name, g)]];
      const dts = path.join(root, 'packages', pkg, name + '.d.ts');
      if (g.typescript && fs.existsSync(dts)) variants.push([name + '.d.ts', dstName(name, g).replace(/\.js$/, '.d.ts')]);
      for (const [from, to] of variants) {
        const src = path.join(root, 'packages', pkg, from);
        const dst = path.join(root, g.projectFolder, to);
        const want = fs.readFileSync(src);
        if (write) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, want); continue; }
        if (!fs.existsSync(dst) || !fs.readFileSync(dst).equals(want)) { console.error('不同步：' + g.id + '/' + to); bad++; }
      }
    }
  }
}
if (!write) console.log(bad ? '共用檔不同步 ' + bad + ' 處' : '共用檔全部同步');
process.exit(bad ? 1 : 0);
