/* ===== storage.js — 本機偏好與個人紀錄 =====
 * localStorage 在無痕視窗或封鎖第三方資料的瀏覽器會丟例外，
 * 所以每一次存取都包 try/catch，失敗就當成「沒存過」繼續玩。
 */
(function (w) {
  'use strict';

  var KEY = {
    nick: 'fl_nick',
    clientId: 'fl_client',
    level: 'fl_level',
    theme: 'fl_theme',
    music: 'fl_music',
    musicVol: 'fl_music_vol',
    sfx: 'fl_sfx',
    sfxVol: 'fl_sfx_vol',
    haptic: 'fl_haptic',
    reduceMotion: 'fl_reduce_motion',
    /* v2：預設改成開啟。換一個 key，舊版「恢復預設」時寫進去的 0 才不會蓋掉新預設 */
    labelOn: 'fl_label_v2',
    sidebarOpen: 'fl_sidebar',
    best: 'fl_best',
    stats: 'fl_stats',
    tutorialDone: 'fl_tutorial'
  };

  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  function getJson(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function setJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function getFlag(k, d) { var v = get(k, null); return v === null ? d : v === '1'; }
  function setFlag(k, v) { set(k, v ? '1' : '0'); }
  function getNum(k, d) { var v = Number(get(k, NaN)); return isFinite(v) ? v : d; }

  /** 這台裝置的身分：重新整理之後要靠它回到原本的座位 */
  function clientId() {
    var id = get(KEY.clientId, '');
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      id = 'c' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
      set(KEY.clientId, id);
    }
    return id;
  }

  /** 每一關的個人最佳：分數愈高愈好、時間愈短愈好 */
  function best(level, rec) {
    var all = getJson(KEY.best, {}) || {};
    if (rec === undefined) return all[level] || null;
    var cur = all[level] || { score: 0, sec: 0, bestCombo: 0, pairs: 0 };
    all[level] = {
      score: Math.max(cur.score || 0, rec.score || 0),
      sec: cur.sec ? Math.min(cur.sec, rec.sec || cur.sec) : (rec.sec || 0),
      bestCombo: Math.max(cur.bestCombo || 0, rec.bestCombo || 0),
      pairs: Math.max(cur.pairs || 0, rec.pairs || 0),
      at: Date.now()
    };
    setJson(KEY.best, all);
    return all[level];
  }
  function allBest() { return getJson(KEY.best, {}) || {}; }
  function clearBest() { setJson(KEY.best, {}); }

  var EMPTY_STATS = { solo: { clear: 0, fail: 0 }, online: { win: 0, lose: 0, draw: 0 } };
  function stats() {
    var s = getJson(KEY.stats, null);
    if (!s || !s.solo || !s.online) return JSON.parse(JSON.stringify(EMPTY_STATS));
    return s;
  }
  function recordResult(mode, outcome) {
    var s = stats();
    var bucket = s[mode === 'online' ? 'online' : 'solo'];
    if (bucket && typeof bucket[outcome] === 'number') bucket[outcome] += 1;
    setJson(KEY.stats, s);
    return s;
  }
  function clearStats() { setJson(KEY.stats, JSON.parse(JSON.stringify(EMPTY_STATS))); }

  w.Store = {
    KEY: KEY,
    clientId: clientId,
    nick: function (v) { if (v === undefined) return get(KEY.nick, ''); set(KEY.nick, v); return v; },
    level: function (v) { if (v === undefined) return get(KEY.level, 'easy'); set(KEY.level, v); return v; },
    /* 造型主題（蔬果／動物／食物／國旗／大混搭）；建立線上房間時會先沿用 */
    theme: function (v) { if (v === undefined) return get(KEY.theme, 'fruits'); set(KEY.theme, v); return v; },
    music: function (v) { if (v === undefined) return getFlag(KEY.music, true); setFlag(KEY.music, v); return v; },
    musicVol: function (v) { if (v === undefined) return getNum(KEY.musicVol, 0.7); set(KEY.musicVol, v); return v; },
    sfx: function (v) { if (v === undefined) return getFlag(KEY.sfx, true); setFlag(KEY.sfx, v); return v; },
    sfxVol: function (v) { if (v === undefined) return getNum(KEY.sfxVol, 1); set(KEY.sfxVol, v); return v; },
    haptic: function (v) { if (v === undefined) return getFlag(KEY.haptic, true); setFlag(KEY.haptic, v); return v; },
    reduceMotion: function (v) { if (v === undefined) return getFlag(KEY.reduceMotion, false); setFlag(KEY.reduceMotion, v); return v; },
    /* 水果名稱標籤：預設開啟（格子太小時 CSS 會自動不顯示，見 style.css），不想看可以關掉 */
    labelOn: function (v) { if (v === undefined) return getFlag(KEY.labelOn, true); setFlag(KEY.labelOn, v); return v; },
    sidebarOpen: function (v) { if (v === undefined) return getFlag(KEY.sidebarOpen, true); setFlag(KEY.sidebarOpen, v); return v; },
    tutorialDone: function (v) { if (v === undefined) return getFlag(KEY.tutorialDone, false); setFlag(KEY.tutorialDone, v); return v; },
    best: best,
    allBest: allBest,
    clearBest: clearBest,
    stats: stats,
    recordResult: recordResult,
    clearStats: clearStats,
    resetDefaults: function () {
      setFlag(KEY.music, true); set(KEY.musicVol, 0.7);
      setFlag(KEY.sfx, true); set(KEY.sfxVol, 1);
      setFlag(KEY.haptic, true);
      setFlag(KEY.reduceMotion, false);
      setFlag(KEY.labelOn, true);
    }
  };
}(window));
