/* ===== sio-compat.js — 讓原本寫給 socket.io 的伺服器邏輯，改跑在共用的 ws.js 上 =====
 *
 * 目的：全部遊戲統一用同一套 WebSocket 連線層，但不必重寫各款已經驗證過的房間邏輯。
 * 提供 socket.io 伺服器端「實際有被用到」的那一小部分介面：
 *   io.on('connection')、io.to(room).emit、io.in、io.emit、io.engine.clientsCount、io.sockets.sockets
 *   socket.id / data / connected / handshake、on / once / off、emit（可帶 ack）、join / leave、disconnect
 *   client → server 的 ack（socket.on('x', (payload, ack) => ack(res))）
 *
 * 線上傳輸格式（JSON 文字訊息）：
 *   事件  { e: 事件名, d: 內容, i: ack 編號(可省), n: 1(沒有內容、只帶 ack) }
 *   回應  { a: ack 編號, d: 內容 }
 *   開場  { c: 'open', id: socketId }（伺服器在握手完成後送出第一則）
 *   心跳  伺服器 { c: 'p' } → 用戶端回 { c: 'q' }（應用層心跳；Node 內建 WebSocket 不會自動回 ws pong，不能只靠協定層 ping）
 * 瀏覽器／Node 端對應的用戶端是 web-core/sio-client.js。
 */
'use strict';

const crypto = require('crypto');
const ws = require('./ws');

const MAX_ROOMS_PER_SOCKET = 32;

class IoSocket {
  constructor(io, internals, raw, req) {
    this.io = io;
    this._i = internals;
    this._raw = raw;
    this.id = crypto.randomBytes(10).toString('hex');
    this.data = {};
    this.connected = true;
    this.rooms = new Set([this.id]);
    const url = String(req.url || '');
    this.handshake = {
      headers: req.headers || {},
      address: (req.socket && req.socket.remoteAddress) || '',
      query: Object.fromEntries(new URLSearchParams(url.split('?')[1] || '')),
      time: new Date().toISOString()
    };
    this._h = new Map();
    this._acks = new Map();
    this._ackSeq = 0;
    this._reason = 'transport close';
    this._since = Date.now();
    raw.on('message', (text) => this._receive(text));
    raw.on('close', () => this._closed());
  }

  on(ev, fn) {
    if (!this._h.has(ev)) this._h.set(ev, []);
    this._h.get(ev).push({ fn, once: false });
    return this;
  }

  once(ev, fn) {
    if (!this._h.has(ev)) this._h.set(ev, []);
    this._h.get(ev).push({ fn, once: true });
    return this;
  }

  off(ev, fn) {
    if (!fn) this._h.delete(ev);
    else this._h.set(ev, (this._h.get(ev) || []).filter((h) => h.fn !== fn));
    return this;
  }

  emit(ev, ...args) {
    if (!this.connected) return false;
    let ack = null;
    if (typeof args[args.length - 1] === 'function') ack = args.pop();
    const msg = { e: String(ev) };
    if (args.length) msg.d = args[0];
    else if (ack) msg.n = 1;
    if (ack) {
      msg.i = ++this._ackSeq;
      this._acks.set(msg.i, ack);
    }
    this._raw.send(JSON.stringify(msg));
    return true;
  }

  join(room) {
    if (this.rooms.size >= MAX_ROOMS_PER_SOCKET) return;
    room = String(room);
    this.rooms.add(room);
    if (!this._i.rooms.has(room)) this._i.rooms.set(room, new Set());
    this._i.rooms.get(room).add(this.id);
  }

  leave(room) {
    room = String(room);
    this.rooms.delete(room);
    const set = this._i.rooms.get(room);
    if (set) { set.delete(this.id); if (!set.size) this._i.rooms.delete(room); }
  }

  /** 對房間內「除了自己以外」的人廣播 */
  to(room) { return this._i.target([].concat(room), this.id); }
  in(room) { return this.to(room); }

  disconnect() {
    if (!this.connected) return this;
    this._reason = 'server namespace disconnect';
    this._raw.close();
    return this;
  }

  _receive(text) {
    let m;
    try { m = JSON.parse(text); } catch (e) { return; }
    if (!m || typeof m !== 'object') return;
    if (m.c !== undefined) return;   /* 心跳回覆（c:'q'）：收到任何 frame 就已更新 lastSeen，不需處理 */
    if (m.a !== undefined) {
      const fn = this._acks.get(m.a);
      if (fn) { this._acks.delete(m.a); this._call(fn, [m.d]); }
      return;
    }
    if (typeof m.e !== 'string') return;
    const list = this._h.get(m.e);
    if (!list || !list.length) return;
    let ack;
    if (m.i !== undefined) {
      let sent = false;
      ack = (res) => {
        if (sent || !this.connected) return;
        sent = true;
        this._raw.send(JSON.stringify(res === undefined ? { a: m.i } : { a: m.i, d: res }));
      };
    }
    const args = m.n ? [ack] : (ack ? [m.d, ack] : [m.d]);
    for (const h of list.slice()) {
      if (h.once) this.off(m.e, h.fn);
      this._call(h.fn, args);
    }
  }

  _call(fn, args) {
    try { fn(...args); } catch (e) { console.error('[io] handler error:', e && e.message); }
  }

  _closed() {
    if (!this.connected) return;
    this.connected = false;
    if (process.env.SIO_DEBUG) console.error('[io] 斷線', this.id, this._reason, '連線 ' + Math.round((Date.now() - this._since) / 1000) + ' 秒');
    for (const room of [...this.rooms]) this.leave(room);
    this._i.sockets.delete(this.id);
    this._acks.clear();
    const list = this._h.get('disconnect') || [];
    for (const h of list.slice()) this._call(h.fn, [this._reason]);
  }
}

/**
 * @param {import('http').Server} httpServer
 * @param {{path?:string, verify?:(req:any)=>boolean, originAllowed?:(origin:string)=>boolean,
 *          pingInterval?:number, pingTimeout?:number, maxMessage?:number}} opt
 */
function createIoServer(httpServer, opt = {}) {
  const pingInterval = opt.pingInterval || 20000;
  const pingTimeout = opt.pingTimeout || 25000;
  const sockets = new Map();
  const rooms = new Map();
  const handlers = new Map();

  function target(roomNames, exceptId) {
    return {
      emit(ev, ...args) {
        const seen = new Set();
        for (const r of roomNames) {
          for (const id of rooms.get(String(r)) || []) {
            if (id === exceptId || seen.has(id)) continue;
            seen.add(id);
            const s = sockets.get(id);
            if (s) s.emit(ev, ...args);
          }
        }
        return true;
      },
      /** 目標頻道內的連線全部加入／離開另一個頻道（socket.io 的 socketsJoin／socketsLeave） */
      socketsJoin(room) { for (const s of members()) s.join(room); },
      socketsLeave(room) { for (const s of members()) s.leave(room); },
      disconnectSockets() { for (const s of members()) s.disconnect(); },
      fetchSockets() { return Promise.resolve(members()); }
    };
    function members() {
      const out = new Map();
      for (const r of roomNames) {
        for (const id of rooms.get(String(r)) || []) {
          const s = sockets.get(id);
          if (s && id !== exceptId) out.set(id, s);
        }
      }
      return [...out.values()];
    }
  }

  const io = {
    engine: { get clientsCount() { return sockets.size; } },
    sockets: { sockets },
    on(name, fn) {
      if (!handlers.has(name)) handlers.set(name, []);
      handlers.get(name).push(fn);
      return io;
    },
    to(room) { return target([].concat(room), null); },
    in(room) { return io.to(room); },
    emit(ev, ...args) { for (const s of sockets.values()) s.emit(ev, ...args); return true; },
    /** 關掉全部連線（不關 http server，由呼叫端自己關） */
    close(cb) {
      clearInterval(timer);
      for (const s of [...sockets.values()]) s._raw.close();
      if (typeof cb === 'function') cb();
    }
  };

  let verify = opt.verify;
  if (!verify && typeof opt.originAllowed === 'function') {
    verify = (req) => opt.originAllowed(req.headers.origin);
  }

  ws.attach(httpServer, {
    path: opt.path || '/ws',
    maxMessage: opt.maxMessage,
    verify,
    onConnection(raw, req) {
      const s = new IoSocket(io, { sockets, rooms, target }, raw, req);
      s._lastPing = Date.now();
      sockets.set(s.id, s);
      s.join(s.id);
      raw.send(JSON.stringify({ c: 'open', id: s.id }));
      for (const fn of handlers.get('connection') || []) {
        try { fn(s); } catch (e) { console.error('[io] connection handler error:', e && e.message); }
      }
    }
  });

  /* 心跳：太久沒收到任何 frame 就斷線。約每 0.8×pingInterval 問一次（ws ping＋應用層 c:'p'），
   * 檢查間隔取 pingInterval/5，確保「最後一次問」到「超時判定」之間一定有時間讓對方回覆。 */
  const timer = setInterval(() => {
    const now = Date.now();
    for (const s of sockets.values()) {
      if (now - s._raw.lastSeen > pingTimeout) { s._reason = 'ping timeout'; s._raw.close(); continue; }
      if (now - (s._lastPing || 0) >= pingInterval * 0.8) { s._lastPing = now; s._raw.ping(); s._raw.send('{"c":"p"}'); }
    }
  }, Math.max(200, Math.min(5000, Math.floor(pingInterval / 5))));
  timer.unref();

  return io;
}

module.exports = { createIoServer, IoSocket };
