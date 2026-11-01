/* ===== audio.js — Web Audio 即時合成的背景音樂與音效 =====
 *
 * 不需要任何外部音檔：所有聲音都是用振盪器＋噪音即時合成，
 * 因此沒有授權問題，也不會有載入失敗。
 * 要換成正式音檔時，只要保留 Sound.play / startBgm / stopBgm 這幾個介面即可
 * （交付摘要有列出這一點）。
 *
 * 瀏覽器規定必須在使用者第一次手勢之後才能播放聲音，
 * 所以 unlock() 由 app.js 綁在第一次 pointerdown / keydown 上。
 * 全部靜音時遊戲仍完整可玩：所有重要資訊都有文字與視覺。
 */
(function (w) {
  'use strict';

  var ctx = null, master = null, musicGain = null, sfxGain = null;
  var musicOn = true, sfxOn = true, musicVolume = 0.55, sfxVolume = 1, hapticOn = true;
  var penCueOn = true, chatCueOn = true;
  var timer = null, step = 0, nextTime = 0, curTrack = 'menu';
  var TEMPO = 96;                        // BPM，畫畫時不要太吵
  var STEP = 15 / TEMPO;                 // 十六分音符秒數
  var lastPenAt = 0;

  var KEY = {
    music: 'dg_music', sfx: 'dg_sfx',
    musicVol: 'dg_music_volume', sfxVol: 'dg_sfx_volume',
    haptic: 'dg_haptic', chatCue: 'dg_chat_cue', penCue: 'dg_pen_cue'
  };

  function loadFlag(k, d) {
    try { var v = localStorage.getItem(k); return v === null ? d : v === '1'; } catch (e) { return d; }
  }
  function saveFlag(k, v) { try { localStorage.setItem(k, v ? '1' : '0'); } catch (e) {} }
  function loadVolume(k, d) {
    try {
      var v = parseFloat(localStorage.getItem(k));
      return isFinite(v) ? Math.max(0, Math.min(1, v)) : d;
    } catch (e) { return d; }
  }
  function saveVolume(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }

  musicOn = loadFlag(KEY.music, true);
  sfxOn = loadFlag(KEY.sfx, true);
  musicVolume = loadVolume(KEY.musicVol, 0.55);
  sfxVolume = loadVolume(KEY.sfxVol, 1);
  hapticOn = loadFlag(KEY.haptic, true);
  chatCueOn = loadFlag(KEY.chatCue, true);
  penCueOn = loadFlag(KEY.penCue, true);

  function applyGain() {
    if (musicGain) musicGain.gain.value = musicOn ? 0.11 * musicVolume : 0;
    if (sfxGain) sfxGain.gain.value = sfxOn ? 0.5 * sfxVolume : 0;
  }

  function ensure() {
    if (ctx) return ctx;
    var AC = w.AudioContext || w.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.connect(master);
    applyGain();
    return ctx;
  }
  function unlock() {
    ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }
  function isUnlocked() { return !!ctx && ctx.state === 'running'; }

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
    osc.connect(g);
    g.connect(o.bus || sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(o) {
    if (!ctx) return;
    var t0 = o.t || ctx.currentTime, dur = o.dur || 0.12;
    var n = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, o.decay || 1);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var bp = ctx.createBiquadFilter(); bp.type = o.type || 'bandpass';
    bp.frequency.value = o.f || 2200; bp.Q.value = o.q || 1.1;
    var g = ctx.createGain(); g.gain.value = o.v === undefined ? 0.28 : o.v;
    src.connect(bp); bp.connect(g); g.connect(o.bus || sfxGain);
    src.start(t0);
  }

  /* ---- 音效語彙 ----
   * 點擊、下筆、擦掉、倒水（油漆桶）、復原、清空、
   * 猜對、很接近、猜錯、換人、提示揭字、倒數、時間到、勝利、結算、有人猜題、進出房間。
   * 每個玩家行動都至少對應一個聲音，但靜音時遊戲仍完整可玩。 */
  var SFX = {
    click: function (t) { tone({ t: t, f: 620, f2: 880, dur: 0.08, type: 'square', v: 0.22 }); },
    tick: function (t) { tone({ t: t, f: 1040, dur: 0.035, type: 'sine', v: 0.14 }); },
    /* 下筆：很短的沙沙聲，像鉛筆摩擦紙面 */
    pen: function (t) { noise({ t: t, f: 3200, q: 1.6, dur: 0.05, v: 0.05, decay: 2.4 }); },
    erase: function (t) { noise({ t: t, f: 900, q: 0.7, dur: 0.16, v: 0.12, decay: 1.4 }); },
    /* 油漆桶：往下倒的一聲 */
    fill: function (t) {
      tone({ t: t, f: 700, f2: 260, dur: 0.22, type: 'sine', v: 0.24 });
      noise({ t: t + 0.05, f: 1400, q: 0.8, dur: 0.2, v: 0.08, decay: 1.6 });
    },
    undo: function (t) { tone({ t: t, f: 760, f2: 520, dur: 0.12, type: 'triangle', v: 0.2 }); },
    clear: function (t) {
      noise({ t: t, f: 1600, q: 0.5, dur: 0.3, v: 0.16, decay: 1.2 });
      tone({ t: t, f: 420, f2: 180, dur: 0.26, type: 'sine', v: 0.16 });
    },
    shape: function (t) { tone({ t: t, f: 880, dur: 0.07, type: 'sine', v: 0.18 }); },
    /* 猜對：往上爬的大三和弦 */
    correct: function (t) {
      [72, 76, 79, 84].forEach(function (n, i) {
        tone({ t: t + i * 0.075, f: hz(n), dur: 0.36, type: 'triangle', v: 0.34 });
      });
      noise({ t: t + 0.3, f: 5200, dur: 0.3, v: 0.05 });
    },
    /* 很接近：中性的兩聲，跟猜對明顯不同 */
    close: function (t) {
      tone({ t: t, f: hz(74), dur: 0.12, type: 'sine', v: 0.24 });
      tone({ t: t + 0.11, f: hz(74), dur: 0.16, type: 'sine', v: 0.2 });
    },
    wrong: function (t) { tone({ t: t, f: 250, f2: 190, dur: 0.14, type: 'square', v: 0.16 }); },
    blocked: function (t) {
      tone({ t: t, f: 240, f2: 200, dur: 0.16, type: 'square', v: 0.2 });
      tone({ t: t + 0.14, f: 200, f2: 160, dur: 0.16, type: 'square', v: 0.16 });
    },
    turn: function (t) {
      tone({ t: t, f: hz(72), dur: 0.14, type: 'triangle', v: 0.24 });
      tone({ t: t + 0.09, f: hz(79), dur: 0.2, type: 'triangle', v: 0.2 });
    },
    hint: function (t) {
      tone({ t: t, f: hz(88), dur: 0.1, type: 'sine', v: 0.2 });
      tone({ t: t + 0.08, f: hz(93), dur: 0.14, type: 'sine', v: 0.16 });
    },
    warn: function (t) { tone({ t: t, f: hz(80), dur: 0.1, type: 'square', v: 0.2 }); },
    timeup: function (t) {
      [69, 65, 62].forEach(function (n, i) {
        tone({ t: t + i * 0.13, f: hz(n), dur: 0.36, type: 'sine', v: 0.28 });
      });
    },
    start: function (t) {
      tone({ t: t, f: 320, f2: 1100, dur: 0.3, type: 'triangle', v: 0.28 });
      noise({ t: t, f: 1800, dur: 0.26, v: 0.08 });
    },
    win: function (t) {
      [72, 76, 79, 84, 88].forEach(function (n, i) {
        tone({ t: t + i * 0.11, f: hz(n), dur: 0.5, type: 'triangle', v: 0.36 });
        tone({ t: t + i * 0.11, f: hz(n + 12), dur: 0.34, type: 'sine', v: 0.11 });
      });
      noise({ t: t + 0.5, f: 4200, dur: 0.6, v: 0.08 });
    },
    lose: function (t) {
      [72, 69, 65, 60].forEach(function (n, i) {
        tone({ t: t + i * 0.16, f: hz(n), dur: 0.5, type: 'sine', v: 0.3 });
      });
    },
    chat: function (t) {
      tone({ t: t, f: hz(84), dur: 0.09, type: 'sine', v: 0.22 });
      tone({ t: t + 0.06, f: hz(88), dur: 0.11, type: 'sine', v: 0.18 });
    },
    join: function (t) {
      tone({ t: t, f: hz(72), dur: 0.13, type: 'triangle', v: 0.24 });
      tone({ t: t + 0.08, f: hz(79), dur: 0.17, type: 'triangle', v: 0.2 });
    },
    leave: function (t) { tone({ t: t, f: hz(79), f2: hz(67), dur: 0.26, type: 'sine', v: 0.22 }); }
  };

  function play(name, delay) {
    if (!sfxOn) return;
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    var f = SFX[name];
    if (f) f(ctx.currentTime + (delay || 0));
  }

  /** 下筆的沙沙聲：限制頻率，畫長線時不會變成噪音牆 */
  function playPen() {
    if (!penCueOn || !sfxOn) return;
    var t = Date.now();
    if (t - lastPenAt < 90) return;
    lastPenAt = t;
    play('pen');
  }

  /* ---- 背景音樂：輕快的循環，選單與作畫各一條 ---- */
  var MEL = {
    menu: [76, null, 79, null, 81, null, 79, null, 76, null, 74, null, 72, null, null, null,
           74, null, 76, null, 79, null, 81, null, 83, null, 81, null, 79, null, null, null],
    draw: [72, null, 74, null, 76, null, null, null, 79, null, 76, null, 74, null, null, null,
           71, null, 74, null, 76, null, null, null, 81, null, 79, null, 76, null, null, null]
  };
  var BASS = {
    menu: [48, null, null, null, 55, null, null, null, 50, null, null, null, 53, null, null, null,
           48, null, null, null, 55, null, null, null, 52, null, null, null, 53, null, null, null],
    draw: [45, null, null, null, 52, null, null, null, 47, null, null, null, 54, null, null, null,
           43, null, null, null, 50, null, null, null, 45, null, null, null, 52, null, null, null]
  };

  function schedule() {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 0.22) {
      var i = step % 32;
      var m = MEL[curTrack][i];
      if (m !== null && m !== undefined) {
        tone({ t: nextTime, f: hz(m), dur: STEP * 3.2, type: 'triangle', v: 0.4, bus: musicGain, atk: 0.03 });
        tone({ t: nextTime, f: hz(m + 12), dur: STEP * 2, type: 'sine', v: 0.07, bus: musicGain, atk: 0.04 });
      }
      var b = BASS[curTrack][i];
      if (b !== null && b !== undefined) tone({ t: nextTime, f: hz(b), dur: STEP * 4, type: 'sine', v: 0.55, bus: musicGain, atk: 0.02 });
      if (i % 8 === 4) noise({ t: nextTime, f: 6400, dur: 0.04, v: 0.024, bus: musicGain });
      nextTime += STEP;
      step++;
    }
  }

  function startBgm(track) {
    if (track && MEL[track]) curTrack = track;
    if (!musicOn) return;
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (timer) return;
    nextTime = ctx.currentTime + 0.08;
    timer = setInterval(schedule, 40);
  }
  function stopBgm() { if (timer) { clearInterval(timer); timer = null; } }
  function setTrack(t) {
    if (!MEL[t] || curTrack === t) return;
    curTrack = t; step = 0;
  }

  function setMusic(on) {
    musicOn = !!on; saveFlag(KEY.music, musicOn);
    ensure(); applyGain();
    if (musicOn) startBgm(); else stopBgm();
    return musicOn;
  }
  function setSfx(on) {
    sfxOn = !!on; saveFlag(KEY.sfx, sfxOn);
    ensure(); applyGain();
    if (sfxOn) play('click');
    return sfxOn;
  }
  function setMusicVolume(value) {
    musicVolume = Math.max(0, Math.min(1, Number(value) || 0));
    saveVolume(KEY.musicVol, musicVolume);
    ensure(); applyGain();
    return musicVolume;
  }
  function setSfxVolume(value) {
    sfxVolume = Math.max(0, Math.min(1, Number(value) || 0));
    saveVolume(KEY.sfxVol, sfxVolume);
    ensure(); applyGain();
    return sfxVolume;
  }
  function setHaptic(on) { hapticOn = !!on; saveFlag(KEY.haptic, hapticOn); return hapticOn; }

  /* 猜題與下筆提示音是獨立開關，但仍受「遊戲音效」總開關管 */
  function setChatCue(on) {
    chatCueOn = !!on; saveFlag(KEY.chatCue, chatCueOn);
    if (chatCueOn) play('chat');
    return chatCueOn;
  }
  function setPenCue(on) {
    penCueOn = !!on; saveFlag(KEY.penCue, penCueOn);
    if (penCueOn) play('pen');
    return penCueOn;
  }
  function playChat() { if (chatCueOn) play('chat'); }

  function vibrate(pattern) {
    if (!hapticOn || !w.navigator || typeof w.navigator.vibrate !== 'function') return;
    /* 使用者還沒真的碰過畫面就呼叫 vibrate，瀏覽器會擋下並留下警告，先跳過 */
    var ua = w.navigator.userActivation;
    if (ua && ua.hasBeenActive === false) return;
    try { w.navigator.vibrate(pattern || 10); } catch (e) {}
  }

  /* 切到背景分頁時停掉音樂，回來再依設定恢復，避免疊播 */
  if (w.document && w.document.addEventListener) {
    w.document.addEventListener('visibilitychange', function () {
      if (w.document.hidden) stopBgm();
      else if (musicOn && isUnlocked()) startBgm();
    });
  }

  w.Sound = {
    unlock: unlock, isUnlocked: isUnlocked, play: play, playPen: playPen,
    startBgm: startBgm, stopBgm: stopBgm, setTrack: setTrack,
    setMusic: setMusic, setSfx: setSfx,
    setMusicVolume: setMusicVolume, setSfxVolume: setSfxVolume,
    setHaptic: setHaptic, vibrate: vibrate,
    setChatCue: setChatCue, playChat: playChat, setPenCue: setPenCue,
    isMusicOn: function () { return musicOn; },
    isSfxOn: function () { return sfxOn; },
    getMusicVolume: function () { return musicVolume; },
    getSfxVolume: function () { return sfxVolume; },
    isHapticOn: function () { return hapticOn; },
    isChatCueOn: function () { return chatCueOn; },
    isPenCueOn: function () { return penCueOn; },
    resetDefaults: function () {
      setMusic(true); setSfx(true); setMusicVolume(0.55); setSfxVolume(1); setHaptic(true);
      chatCueOn = true; saveFlag(KEY.chatCue, true);
      penCueOn = true; saveFlag(KEY.penCue, true);
    }
  };
}(typeof window !== 'undefined' ? window : globalThis));
