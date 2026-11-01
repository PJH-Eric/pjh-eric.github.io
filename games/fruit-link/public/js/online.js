/* ===== online.js — Socket.IO 連線包裝 =====
 *
 * 所有連線位置都從 GameConfig 取得（?server= 或建置注入或同源），
 * 這個檔案裡沒有任何寫死的網址。
 *
 * 對 app.js 只暴露「連線 / 送出意圖 / 訂閱事件」三件事；
 * 房間規則與計分判定都在伺服器上（共用盤面搶打先得分，一定要伺服器說了算），這裡不做任何權限判斷，
 * 只把伺服器算好的 you.can 原封不動交給 UI。
 */
(function (w) {
  'use strict';

  var Config = w.GameConfig;
  var socket = null;
  var loading = null;
  var connectionGeneration = 0;
  var listeners = {};
  var status = 'idle';    // idle | loading | connecting | connected | error | offline
  var lastError = '';

  function emitLocal(evt, payload) {
    var list = listeners[evt];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      try { list[i](payload); } catch (e) { console.error('[online] handler error', e); }
    }
  }

  function on(evt, fn) {
    (listeners[evt] || (listeners[evt] = [])).push(fn);
    return function off() {
      var list = listeners[evt] || [];
      var i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    };
  }

  function setStatus(next, message, spec) {
    status = next;
    if (w.ServerOutage) w.ServerOutage.state(next);
    lastError = message || '';
    emitLocal('status', { status: status, message: lastError, spec: spec || null });
  }

  /** 訊息走字典；錯誤物件帶著代碼，畫面切換語言時才能重新翻譯 */
  function tr(key, params) { return w.I18N ? w.I18N.t(key, params) : key; }
  function mkError(key, params) {
    var e = new Error(tr(key, params));
    e.i18n = { key: key, params: params || null };
    return e;
  }

  /** 連線用戶端（sio-client.js）由頁面直接載入；這裡只確認它存在 */
  function loadScript() {
    return w.io ? Promise.resolve() : Promise.reject(keyedError('net.cannotReach', { where: Config.describe() }));
  }

  /**
   * 建立連線。可以重複呼叫，已連上就直接回傳。
   * @param {{clientId:string, name:string}} identity
   */
  function connect(identity) {
    if (!Config.isOnlineEnabled()) {
      setStatus('offline', Config.error ? tr(Config.errorSpec.key, Config.errorSpec.params) : tr('net.noServer'), Config.errorSpec || { key: 'net.noServer' });
      return Promise.reject(mkError(Config.errorSpec ? Config.errorSpec.key : 'net.noServer', Config.errorSpec ? Config.errorSpec.params : null));
    }
    if (socket && socket.connected) return Promise.resolve(socket);

    var generation = connectionGeneration;
    if (w.ServerOutage) w.ServerOutage.state('begin');
    return loadScript().then(function () {
      if (generation !== connectionGeneration) throw new Error('Connection cancelled');
      if (socket) { socket.connect(); return waitHello(identity); }
      setStatus('connecting');
      socket = w.io(Config.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 800,
        reconnectionDelayMax: 6000,
        timeout: 12000
      });
      if (w.NetworkLatency) w.NetworkLatency.bindSocketIo(socket);

      socket.on('connect', function () {
        setStatus('connected');
        sayHello(identity);
        emitLocal('reconnected', {});
      });
      socket.on('disconnect', function (reason) {
        setStatus('connecting', tr('net.dropped', { reason: reason }), { key: 'net.dropped', params: { reason: reason } });
      });
      socket.on('connect_error', function (err) {
        var em = err && err.message ? err.message : null;
        setStatus('error', tr('net.failed', { msg: em || tr('net.unknown') }), em ? { key: 'net.failed', params: { msg: em } } : { key: 'net.failed', params: { msg: tr('net.unknown') } });
      });

      ['lobby:rooms', 'room:sync', 'room:events', 'room:chat', 'room:error', 'room:closed', 'room:left']
        .forEach(function (evt) {
          socket.on(evt, function (payload) { emitLocal(evt, payload); });
        });

      return waitHello(identity);
    }).catch(function (err) {
      setStatus('error', err.message || String(err), err.i18n || null);
      throw err;
    });
  }

  function sayHello(identity) {
    if (!socket) return;
    socket.emit('hello', { clientId: identity.clientId, name: identity.name });
  }

  function waitHello(identity) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        reject(mkError('net.timeout'));
      }, 15000);
      var finish = function () {
        if (done) return;
        socket.emit('hello', { clientId: identity.clientId, name: identity.name }, function (res) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          if (res && res.ok) {
            setStatus('connected');
            emitLocal('hello', res);        /* 帶 serverTime，app.js 用來校時 */
            resolve(socket);
          }
          else reject(mkError('net.refused'));
        });
      };
      if (socket.connected) finish();
      else socket.once('connect', finish);
    });
  }

  function send(evt, payload, ack) {
    if (!socket || !socket.connected) {
      emitLocal('room:error', { message: tr('net.offlineSend'), code: 'offline' });
      return false;
    }
    if (ack) socket.emit(evt, payload || {}, ack);
    else socket.emit(evt, payload || {});
    return true;
  }

  function disconnect() {
    connectionGeneration++;
    if (socket) { socket.disconnect(); }
    setStatus('idle');
  }

  w.Online = {
    on: on,
    connect: connect,
    send: send,
    disconnect: disconnect,
    isConnected: function () { return !!socket && socket.connected; },
    status: function () { return { status: status, message: lastError }; }
  };
}(window));
