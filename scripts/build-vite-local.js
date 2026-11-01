'use strict';
/* 本機試玩用：建置 Vite 遊戲（snake-3d、ice-duel）的前端，輸出給 apps/game-server 直接發送。
 *   node scripts/build-vite-local.js [--force]
 * 伺服器網址先寫成佔位符 https://gamesrv.invalid/g/<id>，game-server 發檔時換成實際的 <協定>://<主機>/g/<id>，
 * 所以同一份建置可以用 localhost 或區域網路 IP 開。 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));
const force = process.argv.includes('--force');
const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
const npmArgs = fs.existsSync(npmCli) ? [process.execPath, [npmCli]] : [process.platform === 'win32' ? 'npm.cmd' : 'npm', []];
const run = (cmd, args, cwd, env) => spawnSync(cmd, args, { cwd, env: { ...process.env, ...(env || {}) }, stdio: 'inherit', shell: !fs.existsSync(npmCli) && cmd.startsWith('npm') });
let bad = 0;
for (const g of manifest.games.filter((x) => x.viteDist)) {
  const proj = path.join(root, g.projectFolder);
  const appDir = g.viteAppDir ? path.join(proj, g.viteAppDir) : proj;
  const dist = path.join(proj, g.viteDist);
  if (!force && fs.existsSync(path.join(dist, 'index.html'))) { console.log('✓ ' + g.id + ' 已建置（--force 重建）'); continue; }
  console.log('▶ 建置 ' + g.id + '（第一次需要安裝套件，請稍候）…');
  const url = 'https://gamesrv.invalid/g/' + g.id;
  let r = run(npmArgs[0], [...npmArgs[1], 'install', '--no-audit', '--no-fund'], appDir);
  if (r.status !== 0) { console.error('✗ ' + g.id + ' npm install 失敗'); bad++; continue; }
  const vite = path.join(appDir, 'node_modules', 'vite', 'bin', 'vite.js');
  r = run(process.execPath, [vite, 'build'], appDir, { VITE_GAME_SERVER_URL: url, GAME_SERVER_URL: url });
  if (r.status !== 0 || !fs.existsSync(path.join(dist, 'index.html'))) { console.error('✗ ' + g.id + ' 建置失敗'); bad++; continue; }
  console.log('✓ ' + g.id + ' 完成');
}
process.exit(bad ? 1 : 0);
