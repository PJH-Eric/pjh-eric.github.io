'use strict';
// 一次性遷移：把使用 socket.io 的遊戲改跑在共用的 ws 連線層（sio-compat／sio-client）。
//   node scripts/migrate-socketio.js whack-a-mole [draw-guess ...]
// 只改 all-in-one 內的複本；每一步都用精確樣式比對，對不上就停下來，不會亂改。
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function edit(file, fn) {
  const before = fs.readFileSync(file, 'utf8');
  const crlf = before.includes('\r\n');
  const after = fn(before.replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, crlf ? after.replace(/\n/g, '\r\n') : after, 'utf8');
}
function must(cond, msg) { if (!cond) throw new Error(msg); }

function migrate(id) {
  const dir = path.join(root, 'games', id);
  // 1. server.js
  edit(path.join(dir, 'server.js'), (s) => {
    must(s.includes("const { Server } = require('socket.io');"), id + ' server.js 找不到 require');
    s = s.replace("const { Server } = require('socket.io');", "const { createIoServer } = require('./lib/sio-compat');");
    const re = /const io = new Server\(server, \{\n  cors: \{\n    origin\(origin, cb\) \{ cb\(null, originAllowed\(origin\)\); \},\n    methods: \['GET', 'POST'\]\n  \},\n  pingInterval: 20000,\n  pingTimeout: 25000,\n(?:  \/\*[^\n]*\*\/\n)?  maxHttpBufferSize: ([0-9e]+)\n\}\);/;
    const m = re.exec(s);
    must(m, id + ' server.js 的 new Server 區塊樣式不符');
    const max = Math.round(Number(m[1]));
    s = s.replace(re, "/* 連線層：共用的 ws（lib/ws.js）＋ socket.io 相容層（lib/sio-compat.js） */\nconst io = createIoServer(server, {\n  originAllowed,\n  pingInterval: 20000,\n  pingTimeout: 25000,\n  maxMessage: " + max + "\n});");
    return s;
  });
  // 2. 前端 online.js：不再從伺服器載入 socket.io 腳本
  edit(path.join(dir, 'public/js/online.js'), (s) => {
    const start = s.indexOf('  /** socket.io 用戶端腳本是由伺服器提供的');
    must(start >= 0, id + ' online.js 找不到 loadScript 註解');
    const fnStart = s.indexOf('  function loadScript() {', start);
    const fnEnd = s.indexOf('\n  }\n', fnStart);
    must(fnStart > 0 && fnEnd > fnStart, id + ' online.js 找不到 loadScript 結尾');
    const stub = "  /** 連線用戶端（sio-client.js）由頁面直接載入；這裡只確認它存在 */\n  function loadScript() {\n    return w.io ? Promise.resolve() : Promise.reject(keyedError('net.cannotReach', { where: Config.describe() }));\n  }";
    return s.slice(0, start) + stub + s.slice(fnEnd + 4);
  });
  // 3. index.html：在 online.js 之前載入 sio-client.js
  edit(path.join(dir, 'public/index.html'), (s) => {
    const m = /<script src="js\/online\.js[^"]*"><\/script>/.exec(s);
    must(m, id + ' index.html 找不到 online.js');
    return s.replace(m[0], '<script src="js/sio-client.js"></script>\n' + m[0]);
  });
  // 4. 測試與檢查腳本：socket.io-client → 共用用戶端
  for (const sub of ['scripts', 'tests']) {
    const d = path.join(dir, sub);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter((n) => /\.(js|cjs|mjs)$/.test(n))) {
      const file = path.join(d, f);
      if (!fs.readFileSync(file, 'utf8').includes("require('socket.io-client')")) continue;
      edit(file, (s) => s.replace(/require\('socket\.io-client'\)/g, "require('../public/js/sio-client.js')"));
    }
  }
  // 5. package.json：拿掉 socket.io 相依
  edit(path.join(dir, 'package.json'), (s) => s.replace(/,?\n\s*"socket\.io(?:-client)?": "[^"]+"/g, '').replace(/,(\s*\n\s*\})/g, '$1'));
  console.log('已遷移：' + id);
}

for (const id of process.argv.slice(2)) migrate(id);
