/* ===== sio-client.js — 與 net-server/sio-compat.js 搭配的用戶端 =====
 * 取代 socket.io-client：瀏覽器與 Node（>=22，使用內建 WebSocket）通用。
 * 介面刻意維持和遊戲現有程式相同：io(url, opts) → socket
 *   socket.on / once / off / emit(event, payload, ack) / connect / disconnect / connected / id
 *   事件：'connect'、'disconnect'（reason）、'connect_error'（err）
 *   opts：reconnection（預設 true）、reconnectionDelay、reconnectionDelayMax、timeout、path（預設 /ws）
 * 傳輸格式見 sio-compat.js 檔頭。
 */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.io = api.io;
}(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  var MAX_BUFFER = 64;

  function ClientSocket(url, opts) {
    this.url = String(url || '');
    this.opts = opts || {};
    this.connected = false;
    this.id = null;
    this._h = {};
    this._acks = {};
    this._seq = 0;
    this._buf = [];
    this._manual = false;
    this._attempt = 0;
    this._ws = null;
    this._retry = null;
    this._openTimer = null;
    this._bindNetEvents();
    if (this.opts.autoConnect !== false) this.connect();
  }

  var P = ClientSocket.prototype;

  P._wsUrl = function () {
    var base = this.url.replace(/^http/i, 'ws').replace(/\/+$/, '');
    return base + (this.opts.path || '/ws');
  };

  P.connect = function () {
    var self = this;
    if (this._ws && this._ws.readyState <= 1) return this;
    this._manual = false;
    clearTimeout(this._retry);
    var WS = root.WebSocket;
    if (!WS) { this._fire('connect_error', new Error('此環境沒有 WebSocket')); return this; }
    var sock;
    try { sock = new WS(this._wsUrl()); } catch (e) { this._fire('connect_error', e); this._schedule(); return this; }
    this._ws = sock;
    clearTimeout(this._openTimer);
    this._openTimer = setTimeout(function () { if (!self.connected) { try { sock.close(); } catch (e) { /* 忽略 */ } } }, this.opts.timeout || 20000);
    sock.onmessage = function (ev) { self._onMessage(ev.data); };
    sock.onclose = function () { if (self._ws === sock) self._onClose(); };
    sock.onerror = function () {
      /* 還沒連上就出錯（握手被拒、網路不通）：Node 內建 WebSocket 不一定會再送 close，這裡直接收尾。
       * 已連上之後的錯誤交給後續的 close 事件處理。 */
      if (self._ws === sock && !self.connected) {
        sock.onerror = sock.onclose = sock.onmessage = null;   // 先解除，避免 close() 再觸發 error 造成遞迴
        self._onClose();
        try { sock.close(); } catch (e) { /* 忽略 */ }
      }
    };
    return this;
  };

  P._onMessage = function (text) {
    var m;
    try { m = JSON.parse(text); } catch (e) { return; }
    if (!m || typeof m !== 'object') return;
    if (m.c === 'open') {
      clearTimeout(this._openTimer);
      this.id = m.id;
      this.connected = true;
      this._attempt = 0;
      this._fire('connect');
      var q = this._buf; this._buf = [];
      for (var i = 0; i < q.length; i++) this._send(q[i]);
      return;
    }
    if (m.c === 'p') { this._send({ c: 'q' }); return; }   // 應用層心跳：伺服器問、這裡答
    if (m.a !== undefined) {
      var fn = this._acks[m.a];
      if (fn) { delete this._acks[m.a]; this._call(fn, [m.d]); }
      return;
    }
    if (typeof m.e !== 'string') return;
    var self = this, ack;
    if (m.i !== undefined) {
      var sent = false;
      ack = function (res) {
        if (sent || !self.connected) return;
        sent = true;
        self._send(res === undefined ? { a: m.i } : { a: m.i, d: res });
      };
    }
    this._fire(m.e, m.n ? [ack] : (ack ? [m.d, ack] : [m.d]), true);
  };

  P._onClose = function () {
    clearTimeout(this._openTimer);
    var was = this.connected;
    this.connected = false;
    this.id = null;
    this._acks = {};
    this._ws = null;
    if (was) this._fire('disconnect', this._manual ? 'io client disconnect' : 'transport close');
    else if (!this._manual) this._fire('connect_error', new Error('websocket error'));
    if (!this._manual) this._schedule();
  };

  P._schedule = function () {
    var self = this;
    if (this.opts.reconnection === false || this._manual) return;
    var base = this.opts.reconnectionDelay || 1000;
    var max = this.opts.reconnectionDelayMax || 5000;
    var delay = Math.min(max, base * Math.pow(2, this._attempt++)) * (0.75 + Math.random() * 0.5);
    clearTimeout(this._retry);
    this._retry = setTimeout(function () { self.connect(); }, delay);
  };

  /* 瀏覽器回報離線／恢復：離線時立刻斷線（已建立的 WebSocket 不一定會被系統即時關閉），
   * 恢復時略過退避等待、馬上重連。 */
  P._bindNetEvents = function () {
    var self = this;
    if (typeof root.addEventListener !== 'function' || this._netBound) return;
    this._netBound = true;
    root.addEventListener('offline', function () {
      if (self._manual || !self._ws) return;
      var sock = self._ws;
      try { sock.close(); } catch (e) { /* 忽略 */ }
      if (self._ws === sock) { sock.onerror = sock.onclose = sock.onmessage = null; self._onClose(); }
    });
    root.addEventListener('online', function () {
      if (self._manual || self.opts.reconnection === false) return;
      if (self._ws && self._ws.readyState <= 1) return;
      self._attempt = 0;
      self.connect();
    });
  };

  P._send = function (obj) {
    /* CLOSING／CLOSED 時呼叫 send() 不會丟例外，但瀏覽器會自己在主控台印錯誤，所以要先看狀態 */
    var ws = this._ws;
    if (!ws || ws.readyState !== 1) return;
    try { ws.send(JSON.stringify(obj)); } catch (e) { /* 連線已斷，交給 close 流程 */ }
  };

  P.emit = function (ev) {
    var args = Array.prototype.slice.call(arguments, 1);
    var ack = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var msg = { e: String(ev) };
    if (args.length) msg.d = args[0]; else if (ack) msg.n = 1;
    if (ack) { msg.i = ++this._seq; this._acks[msg.i] = ack; }
    if (this.connected) this._send(msg);
    else if (this._buf.length < MAX_BUFFER) this._buf.push(msg);
    return this;
  };

  P.on = function (ev, fn) { (this._h[ev] = this._h[ev] || []).push({ fn: fn, once: false }); return this; };
  P.once = function (ev, fn) { (this._h[ev] = this._h[ev] || []).push({ fn: fn, once: true }); return this; };
  P.off = function (ev, fn) {
    if (!fn) delete this._h[ev];
    else this._h[ev] = (this._h[ev] || []).filter(function (h) { return h.fn !== fn; });
    return this;
  };

  P._call = function (fn, args) {
    try { fn.apply(null, args); } catch (e) { if (root.console) root.console.error('[io] handler error:', e && e.message); }
  };

  P._fire = function (ev, args, _raw) {
    var list = (this._h[ev] || []).slice();
    if (!_raw) args = args === undefined ? [] : [args];
    for (var i = 0; i < list.length; i++) {
      if (list[i].once) this.off(ev, list[i].fn);
      this._call(list[i].fn, args);
    }
  };

  P.disconnect = function () {
    this._manual = true;
    clearTimeout(this._retry);
    clearTimeout(this._openTimer);
    this._buf = [];
    if (this._ws) { try { this._ws.close(); } catch (e) { /* 忽略 */ } }
    return this;
  };
  P.close = P.disconnect;

  function io(url, opts) { return new ClientSocket(url, opts); }

  return { io: io, ClientSocket: ClientSocket };
}));
