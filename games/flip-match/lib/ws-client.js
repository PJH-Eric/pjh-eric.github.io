/* ===== ws-client.js — 測試用：Node 內建 WebSocket 包成 npm「ws」用戶端的寫法 =====
 * 讓各款線上檢查腳本不必再依賴 npm 的 ws 套件：
 *   const WebSocket = require('./lib/ws-client');
 *   const c = new WebSocket(url); c.on('open'|'message'|'close'|'error'); c.send(); c.close(); c.readyState; WebSocket.OPEN
 * message 事件給字串。需要 Node >= 22（內建 WebSocket）。
 */
'use strict';

const { EventEmitter } = require('events');

class WebSocketClient extends EventEmitter {
  constructor(url) {
    super();
    const Native = globalThis.WebSocket;
    if (!Native) throw new Error('需要 Node 22 以上（內建 WebSocket）');
    this._ws = new Native(url);
    this._ws.onopen = () => this.emit('open');
    this._ws.onmessage = (ev) => this.emit('message', typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data));
    this._ws.onclose = (ev) => this.emit('close', ev.code, ev.reason);
    this._ws.onerror = (ev) => { if (this.listenerCount('error')) this.emit('error', new Error((ev && ev.message) || 'websocket error')); };
  }

  get readyState() { return this._ws.readyState; }
  get OPEN() { return 1; }
  send(data) { this._ws.send(data); }
  close() { this._ws.close(); }
  terminate() { this._ws.close(); }
}
WebSocketClient.CONNECTING = 0;
WebSocketClient.OPEN = 1;
WebSocketClient.CLOSING = 2;
WebSocketClient.CLOSED = 3;

module.exports = WebSocketClient;
module.exports.WebSocket = WebSocketClient;
