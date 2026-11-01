/* ===== audio.js — Web Audio 即時合成的背景音樂與音效（不需要任何音檔） =====
 *
 * 全部用震盪器與雜訊即時合成，所以沒有授權問題，也不必下載任何素材。
 * 音樂與音效各有獨立的 gain，設定裡可以分別開關與調音量。
 *
 * 瀏覽器規定要有使用者手勢才能出聲，所以第一次點畫面時才 unlock()。
 */
(function (w) {
  'use strict';

  var S = w.Store;
  var ctx = null, master = null, musicGain = null, sfxGain = null;
  var musicOn = S ? S.music() : true;
  var sfxOn = S ? S.sfx() : true;
  var musicVol = S ? S.musicVol() : 0.7;
  var sfxVol = S ? S.sfxVol() : 1;
  var hapticOn = S ? S.haptic() : true;

  var timer = null, step = 0, nextTime = 0, curTrack = 'menu';
  var TEMPO = 104;
  var STEP = 15 / TEMPO;                 // 十六分音符的秒數

  function applyGain() {
    if (musicGain) musicGain.gain.value = musicOn ? 0.15 * musicVol : 0;
    if (sfxGain) sfxGain.gain.value = sfxOn ? 0.55 * sfxVol : 0;
  }

  function ensure() {
    if (ctx) return ctx;
    var AC = w.AudioContext || w.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.connect(master);
    applyGain();
    return ctx;
  }
  function unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function tone(o) {
    if (!ctx) return;
    var t0 = o.t || ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = o.type || 'triangle';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + (o.dur || 0.2));
    var peak = o.v === undefined ? 0.5 : o.v;
    var atk = o.atk === undefined ? 0.008 : o.atk;
    var dur = o.dur || 0.2;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.bus || sfxGain);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function noise(o) {
    if (!ctx) return;
    var t0 = o.t || ctx.currentTime, dur = o.dur || 0.12;
    var n = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var bp = ctx.createBiquadFilter(); bp.type = o.type || 'bandpass';
    bp.frequency.value = o.f || 2200; bp.Q.value = o.q || 1.1;
    var g = ctx.createGain(); g.gain.value = o.v === undefined ? 0.26 : o.v;
    src.connect(bp); bp.connect(g); g.connect(o.bus || sfxGain);
    src.start(t0);
  }

  var SFX = {
    click: function (t) { tone({ t: t, f: 620, f2: 880, dur: 0.09, type: 'square', v: 0.26 }); },
    /* 選第一顆：短短一聲「啵」 */
    pick: function (t) { tone({ t: t, f: 720, f2: 980, dur: 0.11, type: 'triangle', v: 0.34 }); },
    /* 取消選取 */
    unpick: function (t) { tone({ t: t, f: 520, f2: 380, dur: 0.1, type: 'triangle', v: 0.24 }); },
    /* 連成功：往上三顆音，連擊時會再疊高音 */
    match: function (t, combo) {
      var base = 72 + Math.min(8, (combo || 1) - 1) * 2;
      [0, 0.07, 0.14].forEach(function (d, i) {
        tone({ t: t + d, f: hz(base + i * 4), dur: 0.24, type: 'triangle', v: 0.4 });
        tone({ t: t + d, f: hz(base + 12 + i * 4), dur: 0.18, type: 'sine', v: 0.15 });
      });
      noise({ t: t + 0.02, f: 5200, dur: 0.2, v: 0.07 });
    },
    /* 連不到：低低的「咘」，不刺耳，因為連不到本來就不扣分 */
    miss: function (t) {
      tone({ t: t, f: 250, f2: 165, dur: 0.2, type: 'sawtooth', v: 0.17 });
    },
    hint: function (t) {
      [0, 0.06, 0.12, 0.18].forEach(function (d, i) {
        tone({ t: t + d, f: hz(84 + i * 3), dur: 0.2, type: 'sine', v: 0.24 });
      });
    },
    shuffle: function (t) {
      for (var i = 0; i < 7; i++) {
        noise({ t: t + i * 0.045, f: 1800 + Math.random() * 2600, dur: 0.06, v: 0.11 });
      }
      tone({ t: t + 0.3, f: hz(76), dur: 0.26, type: 'triangle', v: 0.3 });
    },
    tick: function (t) { tone({ t: t, f: 1050, dur: 0.05, type: 'square', v: 0.18 }); },
    tickHot: function (t) { tone({ t: t, f: 1500, f2: 1300, dur: 0.09, type: 'square', v: 0.32 }); },
    go: function (t) {
      tone({ t: t, f: 300, f2: 1200, dur: 0.32, type: 'triangle', v: 0.3 });
      noise({ t: t, f: 1800, dur: 0.28, v: 0.09 });
    },
    count: function (t) { tone({ t: t, f: hz(72), dur: 0.18, type: 'triangle', v: 0.32 }); },
    clear: function (t) {
      [72, 76, 79, 84, 88, 91].forEach(function (n, i) {
        tone({ t: t + i * 0.1, f: hz(n), dur: 0.5, type: 'triangle', v: 0.42 });
        tone({ t: t + i * 0.1, f: hz(n + 12), dur: 0.4, type: 'sine', v: 0.13 });
      });
      noise({ t: t + 0.55, f: 4200, dur: 0.6, v: 0.09 });
    },
    fail: function (t) {
      [72, 68, 65, 60].forEach(function (n, i) { tone({ t: t + i * 0.15, f: hz(n), dur: 0.4, type: 'triangle', v: 0.3 }); });
    },
    draw: function (t) { [72, 76, 72].forEach(function (n, i) { tone({ t: t + i * 0.14, f: hz(n), dur: 0.32, type: 'triangle', v: 0.3 }); }); },
    chat: function (t) { tone({ t: t, f: 880, f2: 1180, dur: 0.08, type: 'sine', v: 0.2 }); }
  };

  function play(name, arg) {
    if (!sfxOn) return;
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    var f = SFX[name];
    if (f) f(ctx.currentTime, arg);
  }

  /* 背景音樂：五聲音階的小循環，選單慢一點、對局活潑一點 */
  var MEL = {
    menu: [72, null, 76, null, 79, null, 76, null, 74, null, 79, null, 77, null, null, null,
           72, null, 76, null, 81, null, 79, null, 76, null, 74, null, 72, null, null, null],
    game: [79, null, 76, 79, 81, null, 79, null, 84, null, 81, null, 79, null, 76, null,
           74, null, 76, 79, 81, null, 84, null, 81, null, 79, 76, 74, null, null, null]
  };
  var BASS = [48, null, null, null, 55, null, null, null, 53, null, null, null, 55, null, null, null,
              45, null, null, null, 52, null, null, null, 50, null, null, null, 55, null, null, null];

  function schedule() {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 0.22) {
      var i = step % 32;
      var m = MEL[curTrack][i];
      if (m !== null && m !== undefined) {
        tone({ t: nextTime, f: hz(m), dur: STEP * 2.4, type: 'triangle', v: 0.5, bus: musicGain, atk: 0.02 });
        tone({ t: nextTime, f: hz(m + 12), dur: STEP * 1.6, type: 'sine', v: 0.11, bus: musicGain, atk: 0.03 });
      }
      var b = BASS[i];
      if (b !== null && b !== undefined) tone({ t: nextTime, f: hz(b), dur: STEP * 3.2, type: 'sine', v: 0.7, bus: musicGain, atk: 0.02 });
      if (i % 8 === 4) noise({ t: nextTime, f: 6200, dur: 0.05, v: 0.045, bus: musicGain });
      if (i % 4 === 0) noise({ t: nextTime, f: 160, q: 2, dur: 0.09, v: 0.15, bus: musicGain });
      nextTime += STEP;
      step++;
    }
  }

  function startBgm(track) {
    if (track && MEL[track] && curTrack !== track) { curTrack = track; step = 0; }
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (timer) return;
    nextTime = ctx.currentTime + 0.08;
    timer = setInterval(schedule, 30);
  }
  function stopBgm() { if (timer) { clearInterval(timer); timer = null; } }
  function setTrack(t) { if (MEL[t] && curTrack !== t) { curTrack = t; step = 0; } }

  function setMusic(on) {
    musicOn = !!on;
    if (S) S.music(musicOn);
    ensure(); applyGain();
    if (musicOn) startBgm(); 
    return musicOn;
  }
  function setSfx(on) {
    sfxOn = !!on;
    if (S) S.sfx(sfxOn);
    ensure(); applyGain();
    if (sfxOn) play('click');
    return sfxOn;
  }
  function setMusicVolume(v) {
    musicVol = Math.max(0, Math.min(1, Number(v) || 0));
    if (S) S.musicVol(musicVol);
    ensure(); applyGain();
    return musicVol;
  }
  function setSfxVolume(v) {
    sfxVol = Math.max(0, Math.min(1, Number(v) || 0));
    if (S) S.sfxVol(sfxVol);
    ensure(); applyGain();
    return sfxVol;
  }
  function setHaptic(on) { hapticOn = !!on; if (S) S.haptic(hapticOn); return hapticOn; }
  function vibrate(pattern) {
    if (!hapticOn || !w.navigator || typeof w.navigator.vibrate !== 'function') return;
    try { w.navigator.vibrate(pattern || 10); } catch (e) {}
  }

  w.Sound = {
    unlock: unlock, play: play, startBgm: startBgm, stopBgm: stopBgm, setTrack: setTrack,
    setMusic: setMusic, setSfx: setSfx, setMusicVolume: setMusicVolume, setSfxVolume: setSfxVolume,
    setHaptic: setHaptic, vibrate: vibrate,
    isMusicOn: function () { return musicOn; },
    isSfxOn: function () { return sfxOn; },
    musicVolume: function () { return musicVol; },
    sfxVolume: function () { return sfxVol; },
    isHapticOn: function () { return hapticOn; }
  };
}(window));
