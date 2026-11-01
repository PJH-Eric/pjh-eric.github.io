/* ===== ws-stream.js — 用 WebSocket 實作「EventSource 介面」的下行串流 =====
 * 數獨的線上觀戰原本用 SSE（EventSource）。為了和其他遊戲統一連線層，下行改走共用的 WebSocket（sio-client.js），
 * 這個轉接層讓 online.js 幾乎不用改：用法與 EventSource 相同，
 *   var es = new WsEventSource('https://server/api/rooms/ABC123/stream?token=...');
 *   es.addEventListener('state', function (ev) { JSON.parse(ev.data) });
 *   es.readyState：0 連線中（含自動重連）／1 已開啟／2 已關閉（伺服器拒絕，不會再重連）
 * 事件：open、error、以及伺服器推的 welcome／state／note／chat／presence／closed／online。
 * 網址只用來決定「連哪台伺服器、訂閱哪個頻道」：/api/lobby/stream 或 /api/rooms/<房號>/stream?token|name|invite。
 */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WsEventSource = api.WsEventSource;
}(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  var EVENTS = ['welcome', 'state', 'note', 'chat', 'presence', 'closed', 'online'];

  function parse(url) {
    var u = new URL(url);
    var i = u.pathname.indexOf('/api/');
    var prefix = i > 0 ? u.pathname.slice(0, i) : '';
    var rest = u.pathname.slice(i >= 0 ? i : 0);
    var base = u.origin + prefix;
    var q = {};
    u.searchParams.forEach(function (v, k) { q[k] = v; });
    if (rest === '/api/lobby/stream') return { base: base, sub: { kind: 'lobby' } };
    var m = /^\/api\/rooms\/([A-Za-z0-9]{1,8})\/stream$/.exec(rest);
    if (!m) throw new Error('不是串流網址：' + url);
    return { base: base, sub: { kind: 'room', code: m[1].toUpperCase(), token: q.token || undefined, name: q.name || undefined, invite: q.invite || undefined } };
  }

  function WsEventSource(url, getIo) {
    var self = this;
    var target = parse(url);
    var io = getIo || (typeof require === 'function' ? require('./sio-client.js').io : root.io);
    this.readyState = 0;
    this.lastNack = null;
    this._h = {};
    this._sock = io(target.base, { reconnection: true, reconnectionDelay: 800, reconnectionDelayMax: 6000, timeout: 12000 });

    function subscribe() {
      self._sock.emit('stream', target.sub, function (res) {
        if (self.readyState === 2) return;
        if (res && res.ok) { self.readyState = 1; self._fire('open', {}); return; }
        /* 伺服器明確拒絕（房間不見、房滿、邀請失效…）：和 EventSource 收到非 200 一樣，不再重連 */
        self.lastNack = res || null;
        self.readyState = 2;
        self._fire('error', {});
        self._sock.disconnect();
      });
    }
    this._sock.on('connect', subscribe);
    this._sock.on('disconnect', function () { if (self.readyState !== 2) { self.readyState = 0; self._fire('error', {}); } });
    this._sock.on('connect_error', function () { if (self.readyState !== 2) { self.readyState = 0; self._fire('error', {}); } });
    EVENTS.forEach(function (name) {
      self._sock.on(name, function (data) { self._fire(name, { data: JSON.stringify(data), type: name }); });
    });
  }

  WsEventSource.prototype.addEventListener = function (name, fn) { (this._h[name] = this._h[name] || []).push(fn); };
  WsEventSource.prototype.removeEventListener = function (name, fn) { this._h[name] = (this._h[name] || []).filter(function (f) { return f !== fn; }); };
  WsEventSource.prototype._fire = function (name, ev) {
    var list = (this._h[name] || []).slice();
    for (var i = 0; i < list.length; i++) { try { list[i](ev); } catch (e) { if (root.console) root.console.error(e); } }
  };
  WsEventSource.prototype.close = function () { this.readyState = 2; try { this._sock.disconnect(); } catch (e) { /* 忽略 */ } };

  return { WsEventSource: WsEventSource, parse: parse };
}));
