'use strict';
// 迴圈用的「確定性驗證器」：逐款跑各自的測試指令（不含需要瀏覽器的），不信任任何人為回報。
//   node scripts/verify-games.js [遊戲id ...] [--save-baseline] [--timeout=秒]
// 判定（任一不成立就是失敗）：
//   1. 每個指令結束碼 0
//   2. 通過數不得低於基準（docs/verify-baseline.json），基準裡的指令不得消失（防止刪測試）
//   3. 測試檔相對「初始複製 commit」的改動，只能是 require／import 路徑那幾行（防止改測試讓它變綠）
//   4. 白名單（docs/test-change-allowlist.json）：每筆要綁檔案 sha256（改了就失效）、斷言數不得低於初始版本、
//      白名單本身不得有未提交變更（只能由人確認後經 scripts/approve-test-change.js 登記並 commit）
// 停損：--budget=秒（預設 1500，超過就不再開始新的一款，退出碼 3）；同一失敗指紋連續 3 次、或同一款連續失敗超過 5 輪
//   → 判定沒有進展，標記 ESCALATE 並以退出碼 2 結束（交給人處理，不再自動重試）。狀態存在 docs/verify-state.json。
// 結果寫到 docs/verify-last.json（迴圈每輪重新讀它，不靠對話記憶）。
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));
const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith('--'));
const save = args.includes('--save-baseline');
const browserMode = args.includes('--browser');   // 只跑需要瀏覽器的檢查（需 playwright，請在本機用 驗證-瀏覽器.bat）
const cmdFilter = (args.find((a) => a.startsWith('--cmd=')) || '').slice(6); // 只跑指令字串含此片段者（把很慢的款拆成多次呼叫；存基準時合併）
const originalMode = args.includes('--original');   // 對照模式：把「原專案」複製到暫存資料夾跑同一批瀏覽器檢查（不動原專案），用來分辨是整合造成的退步還是原本就有的問題
if (originalMode && !browserMode) { console.error('--original 要和 --browser 一起用'); process.exit(4); }
const sharedMode = args.includes('--shared-online');   // 各遊戲「原本的線上檢查」改經共用伺服器的 /g/<id>/ 轉發路徑重跑（scripts/online-via-shared.js；不需要瀏覽器）
const SUFFIX = (browserMode ? '-browser' : '') + (originalMode ? '-original' : '') + (sharedMode ? '-shared' : '');
const budgetSec = Number((args.find((a) => a.startsWith('--budget=')) || '--budget=1500').split('=')[1]);
const startedAt = Date.now();
const stateFile = path.join(root, 'docs/verify-state' + SUFFIX + '.json');
const crypto = require('crypto');
const timeoutSec = Number((args.find((a) => a.startsWith('--timeout=')) || '--timeout=170').split('=')[1]);
const baseFile = path.join(root, 'docs/verify-baseline' + SUFFIX + '.json');
const lastFile = path.join(root, 'docs/verify-last' + SUFFIX + '.json');
const INITIAL_COMMIT = '5c89174';

// 需要瀏覽器（playwright）或圖形環境的檢查，這個環境跑不了，另行驗證
const NEEDS_BROWSER = /browser|ui-check|layout|render-check|audio-check|smooth-check|screenshots|reconnect-check|leave-check|sync-check|sidebar|invite-nick|tap-check|overlap|langmenu|timer-check|online-ui|online-tap|flow-check|result-check|settings-check|board-check|server-outage-browser|ai-match|ai-check/i;

function browserCommandsOf(game) {
  // 凡是 scripts／tests 底下引用 playwright 的 .js／.cjs 都算瀏覽器檢查（各自會啟動自己的伺服器）
  const out = [];
  for (const sub of ['scripts', 'tests']) {
    const dir = path.join(root, game.projectFolder, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).sort()) {
      if (!/\.(c?js)$/.test(f)) continue;
      if ((game.browserSkip || []).includes(f)) continue;   // 需要命令列參數的工具腳本，不是自動檢查
      if (/playwright/.test(fs.readFileSync(path.join(dir, f), 'utf8'))) out.push('node ' + sub + '/' + f);
    }
  }
  return out;
}

const EXTRA_ONLINE = new Set(['amaze-go', 'stair-kids']);   // 原本的線上檢查拿不到 server.js，改跑 apps/game-server/tests/online-extra.js
function commandsOf(game) {
  if (sharedMode) return ['../..::tsx ' + (EXTRA_ONLINE.has(game.id) ? 'apps/game-server/tests/online-extra.js' : 'scripts/online-via-shared.js ' + game.id)];
  if (browserMode) return browserCommandsOf(game);
  if (game.verifyCommands) return game.verifyCommands;   // 例：snake-3d 的測試在 server/ 子資料夾，寫成 "server::node tests/verify.js"
  const pkg = path.join(root, game.projectFolder, 'package.json');
  if (!fs.existsSync(pkg)) return [];
  const scripts = JSON.parse(fs.readFileSync(pkg, 'utf8')).scripts || {};
  const set = new Set();
  for (const key of ['verify', 'test']) {
    for (const part of String(scripts[key] || '').split('&&').map((s) => s.trim())) {
      if (/^node |^vitest|^tsx /.test(part) && (browserMode ? NEEDS_BROWSER.test(part) : !NEEDS_BROWSER.test(part))) set.add(part);
    }
  }
  if (game.id === 'pool-duel') { set.clear(); set.add('node scripts/verify-parallel.js'); }
  return [...set];
}

function countOf(text) {
  const m = /(\d+)\s*項通過|通過\s*(\d+)\s*(?:\/\s*\d+\s*)?項|(\d+)\s*passed|(\d+)\s*個?通過|通過\s*(\d+)/.exec(text);
  return m ? Number(m.slice(1).find(Boolean)) : null;
}

const allowFile = path.join(root, 'docs/test-change-allowlist.json');
let ALLOW = {};
try { ALLOW = JSON.parse(fs.readFileSync(allowFile, 'utf8')).files || {}; } catch (e) { /* 無白名單 */ }
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const ASSERT_RE = /\bassert\b|\bok\(|\bexpect\(|\bcheck\(|\bt\.(true|equal|ok)\(/g;
const assertCount = (text) => (text.match(ASSERT_RE) || []).length;
function git(argv) { return spawnSync('git', argv, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }

// 白名單本身被改過（未提交）也算問題：agent 不可以自己放行自己
function allowlistProblems() {
  const bad = [];
  const st = git(['status', '--porcelain', '--', 'docs/test-change-allowlist.json']).stdout.trim();
  if (st) bad.push('白名單有未提交變更，需人工確認並 commit：' + st);
  return bad;
}

function integrity(game) {
  const dir = game.projectFolder;
  const r = git(['diff', INITIAL_COMMIT, '--diff-filter=M', '--unified=0', '--', dir + '/tests', dir + '/scripts']);
  const bad = [];
  const files = new Set();
  let file = '';
  for (const line of r.stdout.split('\n')) {
    if (line.startsWith('+++ b/')) { file = line.slice(6); files.add(file); }
    else if (ALLOW[file]) continue;
    else if (/^[+-]/.test(line) && !/^(\+\+\+|---)/.test(line)) {
      if (!/require\(|import .* from|sio-client|ws-client|ws-compat/.test(line)) bad.push(file + ' ' + line.slice(0, 80));
    }
  }
  for (const f of files) {
    const a = ALLOW[f];
    if (!a) continue;
    if (!a.sha256 || !a.reason) { bad.push(f + ' 白名單缺少 reason 或 sha256'); continue; }
    if (sha256(f) !== a.sha256) bad.push(f + ' 內容與白名單核准時不同（需重新人工核准）');
    const before = git(['show', INITIAL_COMMIT + ':' + f]).stdout;
    const now = fs.readFileSync(path.join(root, f), 'utf8');
    if (assertCount(now) < assertCount(before)) bad.push(f + ' 斷言數下降：' + assertCount(before) + ' → ' + assertCount(now));
  }
  return bad;
}

// TypeScript／Vite 專案（需要 npm 相依）：複製到暫存資料夾安裝後驗證，不在掛載資料夾裡產生 node_modules
function runNpm(work, args, timeoutSec) {
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const useNpmCli = fs.existsSync(npmCli);
  return spawnSync(
    useNpmCli ? process.execPath : (process.platform === 'win32' ? 'npm.cmd' : 'npm'),
    [...(useNpmCli ? [npmCli] : []), ...args],
    {
      cwd: work,
      encoding: 'utf8',
      timeout: timeoutSec * 1000,
      maxBuffer: 64 * 1024 * 1024,
      shell: !useNpmCli && process.platform === 'win32',
      env: process.env
    }
  );
}

function runLocalNode(work, script, args, timeoutSec, env) {
  const entry = path.join(work, 'node_modules', script);
  if (!fs.existsSync(entry)) return { status: 1, stdout: '', stderr: '找不到本機驗證工具：' + entry };
  return spawnSync(process.execPath, [entry, ...args], {
    cwd: work,
    encoding: 'utf8',
    timeout: timeoutSec * 1000,
    maxBuffer: 64 * 1024 * 1024,
    env: env || process.env
  });
}

async function runOnlineCheck(work, game) {
  const port = 3091;
  const url = 'http://127.0.0.1:' + port + '/health';
  const env = { ...process.env, PORT: String(port) };
  const server = spawn(process.execPath, [path.join(work, 'node_modules', 'tsx', 'dist', 'cli.mjs'), 'server/index.ts'], {
    cwd: work,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });
  let result;
  try {
    const deadline = Date.now() + 20000;
    let ready = false;
    while (Date.now() < deadline && server.exitCode === null) {
      try { ready = (await fetch(url)).ok; } catch (e) { /* 等待伺服器啟動 */ }
      if (ready) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) {
      result = { status: 1, stdout: '', stderr: '伺服器未能在 20 秒內啟動。\n' + serverOutput };
    } else {
      result = runLocalNode(work, 'tsx/dist/cli.mjs', [game.onlineCheck, 'ws://127.0.0.1:' + port], 120, env);
    }
  } catch (error) {
    result = { status: 1, stdout: '', stderr: String(error && error.stack || error) };
  } finally {
    if (server.pid && server.exitCode === null) {
      server.kill();
      await Promise.race([
        new Promise((resolve) => server.once('exit', resolve)),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
      if (server.exitCode === null) server.kill();
    }
  }
  if (result && result.status !== 0 && !result.stderr) result.stderr = serverOutput;
  return result;
}

async function verifyTypescript(g) {
  const tempRoot = path.resolve(require('os').tmpdir(), 'pjh-work');
  const work = path.resolve(tempRoot, g.id);
  if (!work.startsWith(tempRoot + path.sep)) throw new Error('暫存路徑超出驗證目錄：' + work);
  fs.mkdirSync(path.dirname(work), { recursive: true });
  fs.rmSync(work, { recursive: true, force: true });
  fs.cpSync(path.join(root, g.projectFolder), work, {
    recursive: true,
    filter: (file) => !/[\\/](node_modules|dist|\.git)([\\/]|$)/.test(file)
  });
  const steps = [
    ['npm install', () => runNpm(work, ['install', '--no-audit', '--no-fund', '--silent'], 150)],
    ['tsc', () => runLocalNode(work, 'typescript/bin/tsc', ['--noEmit'], 120)],
    ['vitest', () => runLocalNode(work, 'vitest/vitest.mjs', ['run'], 150)]
  ];
  if (fs.existsSync(path.join(work, 'tsconfig.worker.json'))) {
    steps.splice(2, 0, ['tsc-worker', () => runLocalNode(work, 'typescript/bin/tsc', ['-p', 'tsconfig.worker.json'], 120)]);
  }
  if (g.onlineCheck) steps.push(['online-check', () => runOnlineCheck(work, g)]);
  const commands = [];
  for (const [name, run] of steps) {
    const t0 = Date.now();
    const r = await run();
    const out = (r.stdout || '') + (r.stderr || '');
    let count = null;
    if (name === 'online-check') count = (out.match(/PASS/g) || []).length;
    else { const m = /Tests\s+(\d+) passed/.exec(out); if (m) count = Number(m[1]); }
    const rec = { cmd: name, exit: r.status === null ? 'timeout' : r.status, count, sec: Math.round((Date.now() - t0) / 1000) };
    if (rec.exit !== 0) rec.tail = out.trim().split('\n').slice(-40).join("\n").slice(-4000);
    commands.push(rec);
    if (rec.exit !== 0) break;
  }
  return commands;
}

const games = manifest.games.filter((g) => !ids.length || ids.includes(g.id));
const baseline = fs.existsSync(baseFile) ? JSON.parse(fs.readFileSync(baseFile, 'utf8')) : {};
const last = fs.existsSync(lastFile) ? JSON.parse(fs.readFileSync(lastFile, 'utf8')) : {};
let failed = 0;
// 瀏覽器模式：先確認環境（缺套件不是測試失敗，不計入失敗次數、不寫狀態）
// NODE_OPTIONS 會把反斜線當跳脫字元，Windows 路徑必須改成正斜線，否則 --require 會找不到檔案（internal/preload MODULE_NOT_FOUND）
const shimPath = path.join(__dirname, 'lib', 'playwright-shim.js');
const childEnv = { ...process.env, NODE_PATH: [path.join(root, 'node_modules'), process.env.NODE_PATH || ''].filter(Boolean).join(path.delimiter) };
if (browserMode) {
  childEnv.NODE_OPTIONS = ((process.env.NODE_OPTIONS || '') + ' --require "' + shimPath.replace(/\\/g, '/') + '"').trim();
  const missing = ['playwright', 'express'].filter((m) => { try { require.resolve(m, { paths: [root] }); return false; } catch (e) { return true; } });
  if (missing.length) {
    console.error('✗ 環境不完整：根目錄 node_modules 缺少 ' + missing.join('、') + '。請先在這個資料夾執行 npm install（BAT 會處理），並確認沒有其他視窗同時在跑 npm／驗證。');
    process.exit(4);
  }
}
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
let escalated = 0;
let budgetHit = false;
const allowBad = allowlistProblems();
(async () => {
for (const g of games) {
  if ((Date.now() - startedAt) / 1000 > budgetSec) { budgetHit = true; console.log('⏱ 超過時間預算，略過：' + g.id); continue; }
  const useTs = g.typescript && !browserMode && !sharedMode;   // 瀏覽器模式不跑 TypeScript 的安裝／tsc／vitest 流程
  let cmds = useTs ? [] : commandsOf(g);
  if (cmdFilter) cmds = cmds.filter((c) => c.includes(cmdFilter));
  const entry = { at: new Date().toISOString(), commands: [], problems: [] };
  let cwd = path.join(root, g.projectFolder);
  if (originalMode) {
    const src = path.resolve(root, '..', g.projectFolder.replace(/^games[\\/]/, ''));
    if (!fs.existsSync(src)) { console.log('⏭ 找不到原專案，略過：' + g.id); continue; }
    cwd = path.join(require('os').tmpdir(), 'allinone-original', g.id);
    fs.rmSync(cwd, { recursive: true, force: true });
    fs.cpSync(src, cwd, { recursive: true, filter: (f) => !/[\\/](node_modules|\.git)([\\/]|$)/.test(f) && !/\.(key|pem)$/.test(f) });
    childEnv.NODE_PATH = [path.join(root, 'node_modules'), path.join(src, 'node_modules'), process.env.NODE_PATH || ''].filter(Boolean).join(path.delimiter);   // 根目錄在前：playwright／Chromium 版本要和本機已安裝的一致，原專案自己的 node_modules 只補 socket.io 等缺的套件
  }
  if (useTs) {
    for (const rec of await verifyTypescript(g)) {
      entry.commands.push(rec);
      const b = (baseline[g.id] || {})[rec.cmd];
      if (rec.exit !== 0) entry.problems.push('失敗：' + rec.cmd + '（結束碼 ' + rec.exit + '）' + (rec.tail ? '\n' + rec.tail : ''));
      else if (b && b.count !== null && rec.count !== null && rec.count < b.count) entry.problems.push('通過數低於基準：' + rec.cmd + ' ' + rec.count + ' < ' + b.count);
      cmds.push(rec.cmd);
    }
  }
  let srvProc = null;
  if (browserMode && g.browserServer && cmds.length) {
    const port = g.browserServer.port || g.localPort;
    srvProc = require('child_process').spawn(process.execPath, [g.browserServer.entry || 'server.js'], { cwd, env: { ...childEnv, PORT: String(port) }, stdio: 'ignore' });
    const until = Date.now() + 20000;
    let up = false;
    while (Date.now() < until && !up) {
      await new Promise((r) => setTimeout(r, 500));
      try { const res = await fetch('http://127.0.0.1:' + port + '/health'); up = res.ok; } catch (e) { /* 等待啟動 */ }
    }
    console.log('  ' + (up ? '▶ 已啟動 ' + g.id + ' 測試伺服器 :' + port : '✗ ' + g.id + ' 測試伺服器沒有啟動'));
  }
  for (const cmd of useTs ? [] : cmds) {
    const t0 = Date.now();
    const [sub, realCmd] = cmd.includes('::') ? cmd.split('::') : ['', cmd];
    const runCwd = sub ? path.join(cwd, sub) : cwd;
    const argv = realCmd.split(/\s+/);
    let bin = argv[0] === 'node' ? process.execPath : argv[0];
    let rest = argv.slice(1);
    if (argv[0] === 'tsx') {   // 優先用根目錄的 tsx；沒有就用環境變數 TSX_BIN 指定的執行檔
      const cli = path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
      if (fs.existsSync(cli)) { bin = process.execPath; rest = [cli, ...rest]; } else if (process.env.TSX_BIN) bin = process.env.TSX_BIN;
    }
    console.log('  ▶ ' + g.id + '：' + cmd + ' …');
    const r = spawnSync(bin, rest, { cwd: runCwd, encoding: 'utf8', timeout: Math.max(timeoutSec, browserMode && g.browserTimeout || 0) * 1000, maxBuffer: 64 * 1024 * 1024, env: childEnv });
    const out = (r.stdout || '') + (r.stderr || '');
    const rec = { cmd, exit: r.status === null ? 'timeout' : r.status, count: countOf(out), sec: Math.round((Date.now() - t0) / 1000) };
    console.log('    ' + (rec.exit === 0 ? '✓' : '✗ 結束碼 ' + rec.exit) + '（' + rec.sec + ' 秒）');
    if (rec.exit !== 0) rec.tail = out.trim().split('\n').slice(-40).join("\n").slice(-4000);
    entry.commands.push(rec);
    const b = (baseline[g.id] || {})[cmd];
    if (rec.exit !== 0) entry.problems.push('失敗：' + cmd + '（結束碼 ' + rec.exit + '）');
    else if (b && b.count !== null && rec.count !== null && rec.count < b.count) entry.problems.push('通過數低於基準：' + cmd + ' ' + rec.count + ' < ' + b.count);
  }
  if (srvProc) { try { srvProc.kill(); } catch (e) { /* 已結束 */ } }
  for (const cmd of Object.keys(baseline[g.id] || {})) if (!cmds.includes(cmd) && !save && !cmdFilter) entry.problems.push('基準中的指令消失了：' + cmd);
  if (!originalMode) for (const bad of integrity(g)) entry.problems.push('測試檔被改了不只是 require 路徑：' + bad);
  if (save && !entry.problems.length) {
    const add = Object.fromEntries(entry.commands.map((c) => [c.cmd, { count: c.count }]));
    baseline[g.id] = cmdFilter ? Object.assign({}, baseline[g.id] || {}, add) : add;
  }
  if (allowBad.length && Object.keys(ALLOW).some((f) => f.startsWith(g.projectFolder + '/'))) entry.problems.push(...allowBad);
  // 沒有進展偵測：失敗指紋（問題＋失敗指令尾端）連續相同就升級給人處理
  const fp = crypto.createHash('sha1').update(entry.problems.join('|') + entry.commands.filter((c) => c.exit !== 0).map((c) => c.cmd + (c.tail || '')).join('|')).digest('hex').slice(0, 12);
  const st = state[g.id] || { fp: '', streak: 0, rounds: 0 };
  if (!entry.problems.length) { state[g.id] = { fp: '', streak: 0, rounds: 0 }; }
  else {
    st.rounds += 1; st.streak = st.fp === fp ? st.streak + 1 : 1; st.fp = fp; state[g.id] = st;
    if (st.streak >= 3 || st.rounds > 5) { entry.problems.push('ESCALATE：連續 ' + st.streak + ' 次相同失敗／已 ' + st.rounds + ' 輪仍未通過，停止自動重試，請人工處理'); escalated++; }
  }
  last[g.id] = entry;
  failed += entry.problems.length ? 1 : 0;
  console.log((entry.problems.length ? '✘ ' : '✔ ') + g.id.padEnd(15) + entry.commands.map((c) => (c.exit === 0 ? '✓' : '✗') + (c.count ?? '')).join(' ') + (entry.problems.length ? '\n    ' + entry.problems.join('\n    ') : ''));
}
fs.mkdirSync(path.dirname(lastFile), { recursive: true });
fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
fs.writeFileSync(lastFile, JSON.stringify(last, null, 2) + '\n');
if (save) { fs.writeFileSync(baseFile, JSON.stringify(baseline, null, 2) + '\n'); console.log('已更新基準：' + baseFile); }
console.log(failed ? '\n未通過：' + failed + ' 款' : '\n全部通過');
process.exit(escalated ? 2 : budgetHit ? 3 : failed ? 1 : 0);
})().catch((e) => { console.error('驗證器內部錯誤：' + (e && e.stack || e)); process.exit(5); });
