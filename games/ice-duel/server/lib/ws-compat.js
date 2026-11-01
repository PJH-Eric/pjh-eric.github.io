/* ===== ws-compat.js — 讓原本寫給 npm「ws」套件的伺服器程式，改跑在共用的 ws.js 上 =====
 * 只提供遊戲實際用到的部分：
 *   new WebSocketServer({ server, path, maxPayload, verifyClient({ origin }) })、wss.clients、wss.on('connection')
 *   socket：readyState／OPEN、send、ping、close、terminate、on('message'|'pong'|'close'|'error')、isAlive（由遊戲自己維護）
 * message 事件給的是字串（npm ws 給 Buffer，遊戲都是 JSON.parse／String 處理，兩者皆可）。
 */
'use strict';

const { EventEmitter } = require('events');
const wsLib = require('./ws');

class CompatSocket extends EventEmitter {
  constructor(raw, req) {
    super();
    this._raw = raw;
    this.req = req;
    this.OPEN = 1;
    this.isAlive = true;
    raw.on('message', (text) => this.emit('message', text));
    raw.on('pong', () => this.emit('pong'));
    raw.on('close', () => this.emit('close', 1006, ''));
  }

  get readyState() { return this._raw.alive ? 1 : 3; }
  send(data, cb) { this._raw.send(data); if (typeof cb === 'function') cb(); }
  ping() { this._raw.ping(); }
  close() { this._raw.close(); }
  terminate() { this._raw.close(); }
}

class WebSocketServer extends EventEmitter {
  /** @param {{server:import('http').Server, path?:string, maxPayload?:number, verifyClient?:(info:{origin:string,req:any,secure:boolean})=>boolean}} opt */
  constructor(opt) {
    super();
    this.clients = new Set();
    wsLib.attach(opt.server, {
      path: opt.path || '*',
      maxMessage: opt.maxPayload,
      verify: opt.verifyClient
        ? (req) => !!opt.verifyClient({ origin: req.headers.origin, req, secure: !!(req.socket && req.socket.encrypted) })
        : undefined,
      onConnection: (raw, req) => {
        const sock = new CompatSocket(raw, req);
        this.clients.add(sock);
        raw.on('close', () => this.clients.delete(sock));
        this.emit('connection', sock, req);
      }
    });
  }

  close(cb) {
    for (const c of [...this.clients]) c.terminate();
    if (typeof cb === 'function') cb();
  }
}

module.exports = { WebSocketServer, CompatSocket };
