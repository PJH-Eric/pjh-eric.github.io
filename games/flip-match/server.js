/*
 * 翻牌配對碰 - 遊戲伺服器
 * 零外部套件：只用 Node.js 內建模組實作靜態檔案伺服器 + 原生 WebSocket (RFC 6455)
 * 啟動：node server.js   （或 npm start）
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');
const ALLOWED_ORIGINS = String(process.env.GAME_ALLOWED_ORIGIN || '*')
  .split(',').map((value) => value.trim()).filter(Boolean);
const allowAllOrigins = ALLOWED_ORIGINS.includes('*');

function originAllowed(origin) {
  return allowAllOrigins || !origin || ALLOWED_ORIGINS.includes(origin);
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (!origin || !originAllowed(origin)) return false;
  res.setHeader('Access-Control-Allow-Origin', allowAllOrigins ? '*' : origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  return true;
}

/* ---------------- 靜態檔案 ---------------- */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  setCorsHeaders(req, res);
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"ok":true,"game":"flip-match"}'); }
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^([/\\])+/, ''));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 Not Found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

/* ---------------- WebSocket（共用連線層 lib/ws.js） ---------------- */
const wsLib = require('./lib/ws');
wsLib.attach(server, {
  path: '*',                       // 這款原本就不限路徑
  maxMessage: 4 * 1024 * 1024,     // 沿用原本的 4MB 上限
  onConnection(conn) {
    conn.sendText = (str) => conn.send(str);   // 相容原本的 WSConn 介面
    handleClient(conn);
  }
});

/* ---------------- 遊戲大廳邏輯 ---------------- */
const RULES = {
  4: { memory: 10, turn: 10, hints: 1 },
  6: { memory: 20, turn: 20, hints: 2 },
  8: { memory: 30, turn: 30, hints: 3 }
};
const DECK_IDS = ['animals', 'vehicles', 'fruits', 'characters', 'stationery', 'food', 'flags', 'numbers', 'phonetics', 'sports', 'mixed'];
const SEQ_DECKS = ['numbers'];
const ICONS_PER_DECK = 32;
const DECK_ICON_COUNTS = { phonetics: 37, mixed: 324 };

const clients = new Map();   // id -> client
const rooms = new Map();     // id -> room
let seq = 1;

function uid(p) { return p + (seq++) + Math.random().toString(36).slice(2, 6); }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function sample(n, k) { const a = []; for (let i = 0; i < n; i++) a.push(i); shuffle(a); return a.slice(0, k); }

function roomBrief(r) {
  return {
    id: r.id, name: r.name, size: r.size, deck: r.deck,
    host: r.players[0] ? r.players[0].name : '',
    count: r.players.length, state: r.state
  };
}
function roomFull(r) {
  return {
    id: r.id, name: r.name, size: r.size, deck: r.deck, first: r.first, state: r.state,
    hostId: r.players[0] ? r.players[0].id : null,
    players: r.players.map(p => ({ id: p.id, name: p.name, ready: !!p.ready }))
  };
}
function pruneEmptyRooms() {
  for (const r of rooms.values()) {
    if (r.players.length === 0) { clearTimers(r); rooms.delete(r.id); }
  }
}
function broadcastRooms() {
  const list = [];
  pruneEmptyRooms();
  for (const r of rooms.values()) if (r.state !== 'dead' && r.players.length > 0) list.push(roomBrief(r));
  list.sort((a, b) => (a.state === 'wait' ? -1 : 1) - (b.state === 'wait' ? -1 : 1));
  const msg = JSON.stringify({ t: 'rooms', rooms: list, online: clients.size });
  for (const c of clients.values()) if (!c.room) c.conn.sendText(msg);
}
function sendRoom(r) {
  const msg = JSON.stringify({ t: 'room', room: roomFull(r) });
  r.players.forEach(p => p.conn.sendText(msg));
}
function bcast(r, obj) {
  const msg = JSON.stringify(obj);
  r.players.forEach(p => p.conn.sendText(msg));
}

function clearTimers(r) {
  if (r.turnTimer) { clearTimeout(r.turnTimer); r.turnTimer = null; }
  if (r.memTimer) { clearTimeout(r.memTimer); r.memTimer = null; }
  if (r.flipTimer) { clearTimeout(r.flipTimer); r.flipTimer = null; }
}

function startGame(r) {
  const rule = RULES[r.size];
  const pairs = (r.size * r.size) / 2;
  const iconCount = DECK_ICON_COUNTS[r.deck] || ICONS_PER_DECK;
  var picks;
  if (SEQ_DECKS.indexOf(r.deck) >= 0) { picks = []; for (var pi = 0; pi < Math.min(pairs, iconCount); pi++) picks.push(pi); }
  else picks = sample(iconCount, Math.min(pairs, iconCount));
  const cells = [];
  for (let i = 0; i < pairs; i++) cells.push(picks[i % picks.length], picks[i % picks.length]);
  shuffle(cells);
  r.state = 'play';
  r.layout = cells;
  r.matched = new Array(cells.length).fill(false);
  r.open = [];
  r.scores = { };
  r.hintsLeft = {};
  r.players.forEach(p => { r.scores[p.id] = 0; r.hintsLeft[p.id] = rule.hints; });
  r.cur = r.first === 'guest' && r.players.length > 1 ? 1 : 0;
  r.busy = true;
  bcast(r, {
    t: 'start', layout: cells, size: r.size, deck: r.deck,
    memorySec: rule.memory, turnSec: rule.turn, hints: rule.hints,
    players: r.players.map(p => ({ id: p.id, name: p.name })),
    cur: r.players[r.cur].id
  });
  clearTimers(r);
  r.memTimer = setTimeout(() => { r.busy = false; beginTurn(r); }, rule.memory * 1000 + 900);
  broadcastRooms();
}

function beginTurn(r) {
  if (r.state !== 'play') return;
  const rule = RULES[r.size];
  r.open = [];
  bcast(r, { t: 'turn', cur: r.players[r.cur].id, turnSec: rule.turn });
  if (r.turnTimer) clearTimeout(r.turnTimer);
  r.turnTimer = setTimeout(() => onTimeout(r), rule.turn * 1000 + 400);
}

function onTimeout(r) {
  if (r.state !== 'play') return;
  const closed = r.open.slice();
  r.open = [];
  r.cur = (r.cur + 1) % r.players.length;
  bcast(r, { t: 'timeout', close: closed, cur: r.players[r.cur].id });
  beginTurn(r);
}

function checkEnd(r) {
  if (r.matched.every(Boolean)) {
    r.state = 'over';
    clearTimers(r);
    let best = -1, winner = null, tie = false;
    r.players.forEach(p => {
      const s = r.scores[p.id];
      if (s > best) { best = s; winner = p.id; tie = false; }
      else if (s === best) tie = true;
    });
    bcast(r, { t: 'end', scores: r.scores, winner: tie ? null : winner });
    r.players.forEach(p => { p.ready = false; });
    broadcastRooms();
    return true;
  }
  return false;
}

function onFlip(cl, i) {
  const r = cl.room;
  if (!r || r.state !== 'play' || r.busy) return;
  if (r.players[r.cur].id !== cl.id) return;
  if (typeof i !== 'number' || i < 0 || i >= r.layout.length) return;
  if (r.matched[i] || r.open.indexOf(i) >= 0) return;
  r.open.push(i);
  bcast(r, { t: 'flip', i: i, sym: r.layout[i], by: cl.id });
  if (r.open.length < 2) return;

  r.busy = true;
  if (r.turnTimer) { clearTimeout(r.turnTimer); r.turnTimer = null; }
  const a = r.open[0], b = r.open[1];
  const isMatch = r.layout[a] === r.layout[b];
  r.flipTimer = setTimeout(() => {
    if (r.state !== 'play') return;
    if (isMatch) { r.matched[a] = true; r.matched[b] = true; r.scores[cl.id] += 1; }
    else { r.cur = (r.cur + 1) % r.players.length; }
    r.open = [];
    r.busy = false;
    bcast(r, { t: 'result', a: a, b: b, match: isMatch, scores: r.scores, by: cl.id });
    if (!checkEnd(r)) beginTurn(r);
  }, isMatch ? 650 : 500);
}

function onHint(cl) {
  const r = cl.room;
  if (!r || r.state !== 'play' || r.busy) return;
  if (r.players[r.cur].id !== cl.id) return;
  if ((r.hintsLeft[cl.id] || 0) <= 0) return;
  // 新規則：必須先自己翻開第一張牌，提示會直接翻出配對的另一張
  if (r.open.length !== 1) return;
  const first = r.open[0];
  const sym = r.layout[first];
  let target = -1;
  for (let i = 0; i < r.layout.length; i++) {
    if (i === first || r.matched[i]) continue;
    if (r.layout[i] === sym) { target = i; break; }
  }
  if (target < 0) return;
  r.hintsLeft[cl.id]--;
  bcast(r, { t: 'hintuse', by: cl.id, left: r.hintsLeft[cl.id] });
  onFlip(cl, target);
}

function leaveRoom(cl, silent) {
  const r = cl.room;
  if (!r) return;
  cl.room = null;
  cl.ready = false;
  const idx = r.players.indexOf(cl);
  if (idx >= 0) r.players.splice(idx, 1);
  if (r.players.length === 0) {
    clearTimers(r);
    rooms.delete(r.id);
  } else {
    if (r.state === 'play') {
      r.state = 'wait';
      clearTimers(r);
      bcast(r, { t: 'oppLeft', name: cl.name });
      r.players.forEach(p => { p.ready = false; });
    } else {
      if (idx === 0) r.first = 'host';
      bcast(r, { t: 'sys', code: 'left', name: cl.name, m: cl.name + ' 離開了房間' });
    }
    sendRoom(r);
  }
  if (!silent) cl.conn.sendJSON({ t: 'left' });
  broadcastRooms();
}

function handleClient(conn) {
  const cl = { id: uid('p'), name: '玩家', conn: conn, room: null, ready: false };
  clients.set(cl.id, cl);
  conn.sendJSON({ t: 'welcome', id: cl.id });

  conn.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    switch (m.t) {
      case 'ping':
        conn.sendJSON({ t: 'pong', at: m.at });
        break;
      case 'hello':
        cl.name = String(m.name || '玩家').slice(0, 12) || '玩家';
        conn.sendJSON({ t: 'welcome', id: cl.id, name: cl.name });
        if (cl.room) sendRoom(cl.room);
        broadcastRooms();
        break;
      case 'rooms': {
        pruneEmptyRooms();
        const list = [];
        for (const r of rooms.values()) if (r.state !== 'dead' && r.players.length > 0) list.push(roomBrief(r));
        conn.sendJSON({ t: 'rooms', rooms: list, online: clients.size });
        break;
      }
      case 'create': {
        if (cl.room) leaveRoom(cl, true);
        const size = [4, 6, 8].indexOf(+m.size) >= 0 ? +m.size : 4;
        const deck = DECK_IDS.indexOf(m.deck) >= 0 ? m.deck : 'animals';
        const r = {
          id: uid('r'), name: String(m.roomName || (cl.name + ' 的房間')).slice(0, 16),
          size: size, deck: deck, first: m.first === 'guest' ? 'guest' : 'host', players: [cl], state: 'wait',
          layout: [], matched: [], open: [], scores: {}, hintsLeft: {}, cur: 0, busy: false,
          turnTimer: null, memTimer: null, flipTimer: null
        };
        rooms.set(r.id, r);
        cl.room = r; cl.ready = false;
        conn.sendJSON({ t: 'joined', id: r.id });
        sendRoom(r);
        broadcastRooms();
        break;
      }
      case 'join': {
        const r = rooms.get(m.id);
        if (!r) return conn.sendJSON({ t: 'err', code: 'roomNotFound', m: '房間不存在' });
        if (r.players.length >= 2) return conn.sendJSON({ t: 'err', code: 'roomFull', m: '房間已滿' });
        if (r.state === 'play') return conn.sendJSON({ t: 'err', code: 'roomPlaying', m: '對戰進行中' });
        if (cl.room) leaveRoom(cl, true);
        r.players.push(cl); cl.room = r; cl.ready = false;
        conn.sendJSON({ t: 'joined', id: r.id });
        bcast(r, { t: 'sys', code: 'joined', name: cl.name, m: cl.name + ' 加入了房間' });
        sendRoom(r);
        broadcastRooms();
        break;
      }
      case 'setopt': {
        const r = cl.room;
        if (!r || r.players[0] !== cl || r.state === 'play') return;
        if ([4, 6, 8].indexOf(+m.size) >= 0) r.size = +m.size;
        if (DECK_IDS.indexOf(m.deck) >= 0) r.deck = m.deck;
        if (m.first === 'host' || m.first === 'guest') r.first = m.first;
        r.players.forEach(p => { p.ready = false; });
        sendRoom(r); broadcastRooms();
        break;
      }
      case 'ready': {
        const r = cl.room;
        if (!r || r.state === 'play' || r.players[0] === cl) return;
        cl.ready = !!m.v;
        sendRoom(r);
        break;
      }
      case 'start': {
        const r = cl.room;
        if (!r || (r.state !== 'wait' && r.state !== 'over') || r.players[0] !== cl || r.players.length < 2 || !r.players[1].ready) return;
        startGame(r);
        break;
      }
      case 'flip': onFlip(cl, +m.i); break;
      case 'hint': onHint(cl); break;
      case 'chat': {
        const r = cl.room;
        if (!r) return;
        const message = String(m.m || '').trim().slice(0, 60);
        if (!message) return;
        bcast(r, { t: 'chat', fromId: cl.id, from: cl.name, m: message, ts: Date.now() });
        break;
      }
      case 'leave': leaveRoom(cl); break;
      default: break;
    }
  });

  conn.on('close', () => {
    leaveRoom(cl, true);
    clients.delete(cl.id);
    broadcastRooms();
  });
}

setInterval(() => { for (const c of clients.values()) c.conn.ping(); }, 25000);

/* ---------------- 啟動 ---------------- */
/* 內嵌於 all-in-one 共用伺服器時（ALLINONE_EMBEDDED=1）由外層負責監聽 */
if (!process.env.ALLINONE_EMBEDDED) {
  server.listen(PORT, () => {
    const nets = os.networkInterfaces();
    const ips = [];
    for (const k of Object.keys(nets)) for (const n of nets[k]) if (n.family === 'IPv4' && !n.internal) ips.push(n.address);
    console.log('');
    console.log('  🎴 翻牌配對碰 伺服器已啟動！');
    console.log('  ------------------------------------------');
    console.log('  本機開啟：  http://localhost:' + PORT);
    ips.forEach(ip => console.log('  平板連線：  http://' + ip + ':' + PORT));
    console.log('  ------------------------------------------');
    console.log('  （關閉此視窗即停止伺服器）');
    console.log('');
  });
}

module.exports = { server };
