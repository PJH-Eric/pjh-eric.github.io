/* 單機作品存檔：保留可編輯筆畫，載入時透過同一份規則驗證並重建狀態。 */
(function (root, factory) {
  'use strict';
  var api = factory(typeof module === 'object' && module.exports ? require('./rules.js') : root.Rules);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.DrawingFile = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (Rules) {
  'use strict';

  function encode(state) {
    return JSON.stringify({
      format: 'draw-guess-drawing',
      version: 1,
      seed: state.seed,
      diff: state.diff,
      wordId: state.wordId,
      strokes: state.strokes
    });
  }

  function decode(text, player, now) {
    var data;
    try { data = JSON.parse(text); }
    catch (e) { throw new Error((globalThis.I18N ? globalThis.I18N.t("text.295") : "無法讀取存檔，請選擇你畫我猜的作品存檔。")); }
    if (!data || data.format !== 'draw-guess-drawing' || data.version !== 1 ||
        typeof data.wordId !== 'string' || !Array.isArray(data.strokes)) {
      throw new Error((globalThis.I18N ? globalThis.I18N.t("text.294") : "這不是支援的你畫我猜作品存檔。"));
    }

    var state = Rules.createState({
      seed: typeof data.seed === 'string' ? data.seed : null,
      diff: data.diff,
      players: [player],
      unlimited: true
    });
    Rules.start(state, now);
    state.choices = [data.wordId];
    var picked = Rules.pickWord(state, player.id, data.wordId, now);
    if (!picked.ok) throw new Error((globalThis.I18N ? globalThis.I18N.t("text.293") : "存檔中的題目不存在。"));
    for (var i = 0; i < data.strokes.length; i++) {
      var raw = data.strokes[i];
      if (!raw || Rules.TOOL_KEYS.indexOf(raw.t) < 0 || !Array.isArray(raw.p) ||
          raw.p.length > Rules.CONST.MAX_STROKE_POINTS * 2) {
        throw new Error((globalThis.I18N ? globalThis.I18N.t("text.292") : "存檔中的筆畫資料不完整。"));
      }
      var result = Rules.addStroke(state, player.id, raw);
      if (!result.ok) throw new Error((globalThis.I18N ? globalThis.I18N.t("text.292") : "存檔中的筆畫資料不完整。"));
    }
    return state;
  }

  return { encode: encode, decode: decode };
}));
