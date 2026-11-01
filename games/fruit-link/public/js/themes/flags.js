/* ===== themes/flags.js — 國旗造型庫（純資料，無 DOM 相依） =====
 *
 * 每一個項目就是一段 100x100 viewBox 的 SVG 內容：粗描邊 #5B4636、腮紅、笑臉，
 * 和同系列其他小遊戲用的是同一套可愛風格。
 *
 * 盤面只認「第幾種」這個數字，造型換掉不影響任何規則，
 * 所以這個檔案可以一直加東西，不必動 rules.js。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.THEME_FLAGS = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  /* ------------------------------------------------------------ 旗面產生器
   * 國旗大多是「幾條色帶 + 一個簡單標誌」，逐面手畫既冗長又容易畫錯，
   * 所以下面用規格產生：色帶、北歐十字、星星、星月各一個小函式。
   * 產出的仍然是純資料（模組載入時就算好），外面用起來和手畫的沒有差別。
   */
  var INK = '#5B4636';
  var X = 5, Y = 18, FW = 90, FH = 58;

  /** 統一的旗面外框：底色 → 內容 → 最後補上粗描邊，描邊才不會被內容蓋掉 */
  function frame(inner, base) {
    return '<rect x="5" y="18" width="90" height="58" rx="5" fill="' + (base || '#FFFDF8') + '"/>' +
      inner +
      '<rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  }

  /** 等分色帶。vertical=true 就是直的三色旗 */
  function bands(colors, vertical) {
    var n = colors.length, out = '';
    for (var i = 0; i < n; i++) {
      if (vertical) {
        var w = FW / n;
        out += '<rect x="' + (X + i * w).toFixed(2) + '" y="18" width="' + w.toFixed(2) + '" height="58" fill="' + colors[i] + '"/>';
      } else {
        var h = FH / n;
        out += '<rect x="5" y="' + (Y + i * h).toFixed(2) + '" width="90" height="' + h.toFixed(2) + '" fill="' + colors[i] + '"/>';
      }
    }
    return out;
  }

  /** 北歐十字：直槓偏左，和真的國旗一樣 */
  function nordic(bg, cross, inner) {
    var out = '<rect x="5" y="18" width="90" height="58" fill="' + bg + '"/>' +
      '<rect x="29" y="18" width="12" height="58" fill="' + cross + '"/>' +
      '<rect x="5" y="41" width="90" height="12" fill="' + cross + '"/>';
    if (inner) {
      out += '<rect x="32" y="18" width="6" height="58" fill="' + inner + '"/>' +
        '<rect x="5" y="44" width="90" height="6" fill="' + inner + '"/>';
    }
    return out;
  }

  /** 五芒星 */
  function star(cx, cy, r, fill, rot) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var rr = (i % 2 === 0) ? r : r * 0.42;
      var a = (Math.PI / 5) * i - Math.PI / 2 + (rot || 0);
      pts.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + fill + '"/>';
  }

  /** 星月：用兩個圓相減做出彎月 */
  function crescent(cx, cy, r, fill, bg) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"/>' +
      '<circle cx="' + (cx + r * 0.34) + '" cy="' + cy + '" r="' + (r * 0.82) + '" fill="' + bg + '"/>';
  }

  var MORE = [
    { id: 'russia',      label: '俄羅斯',   svg: frame(bands(['#FFFDF8', '#0039A6', '#D52B1E'])) },
    { id: 'austria',     label: '奧地利',   svg: frame(bands(['#ED2939', '#FFFDF8', '#ED2939'])) },
    { id: 'hungary',     label: '匈牙利',   svg: frame(bands(['#CE2939', '#FFFDF8', '#477050'])) },
    { id: 'bulgaria',    label: '保加利亞', svg: frame(bands(['#FFFDF8', '#00966E', '#D62612'])) },
    { id: 'lithuania',   label: '立陶宛',   svg: frame(bands(['#FDB913', '#006A44', '#C1272D'])) },
    { id: 'estonia',     label: '愛沙尼亞', svg: frame(bands(['#4891D9', '#2B2B2B', '#FFFDF8'])) },
    { id: 'poland',      label: '波蘭',     svg: frame(bands(['#FFFDF8', '#DC143C'])) },
    { id: 'ukraine',     label: '烏克蘭',   svg: frame(bands(['#0057B7', '#FFD700'])) },
    { id: 'belgium',     label: '比利時',   svg: frame(bands(['#2B2B2B', '#FAE042', '#ED2939'], true)) },
    { id: 'ireland',     label: '愛爾蘭',   svg: frame(bands(['#169B62', '#FFFDF8', '#FF883E'], true)) },
    { id: 'romania',     label: '羅馬尼亞', svg: frame(bands(['#002B7F', '#FCD116', '#CE1126'], true)) },
    { id: 'nigeria',     label: '奈及利亞', svg: frame(bands(['#008751', '#FFFDF8', '#008751'], true)) },
    { id: 'peru',        label: '秘魯',     svg: frame(bands(['#D91023', '#FFFDF8', '#D91023'], true)) },
    { id: 'ivory-coast', label: '象牙海岸', svg: frame(bands(['#F77F00', '#FFFDF8', '#009E60'], true)) },
    { id: 'denmark',     label: '丹麥',     svg: frame(nordic('#C60C30', '#FFFDF8')) },
    { id: 'iceland',     label: '冰島',     svg: frame(nordic('#02529C', '#FFFDF8', '#DC1E35')) },
    {
      id: 'czechia', label: '捷克',
      svg: frame(bands(['#FFFDF8', '#D7141A']) +
        '<polygon points="5,18 47,47 5,76" fill="#11457E"/>')
    },
    {
      id: 'turkey', label: '土耳其',
      svg: frame('<rect x="5" y="18" width="90" height="58" fill="#E30A17"/>' +
        crescent(41, 47, 14, '#FFFDF8', '#E30A17') +
        star(63, 47, 8, '#FFFDF8'), '#E30A17')
    },
    {
      id: 'chile', label: '智利',
      svg: frame('<rect x="5" y="18" width="90" height="29" fill="#FFFDF8"/>' +
        '<rect x="5" y="47" width="90" height="29" fill="#D52B1E"/>' +
        '<rect x="5" y="18" width="30" height="29" fill="#0039A6"/>' +
        star(20, 32, 9, '#FFFDF8'))
    },
    {
      id: 'morocco', label: '摩洛哥',
      svg: frame('<rect x="5" y="18" width="90" height="58" fill="#C1272D"/>' +
        star(50, 47, 17, 'none') +
        '<polygon points="50,31 54.7,45.5 70,45.5 57.6,54.5 62.3,69 50,60 37.7,69 42.4,54.5 30,45.5 45.3,45.5" ' +
        'fill="none" stroke="#006233" stroke-width="3.4" stroke-linejoin="round"/>', '#C1272D')
    },
    {
      id: 'greece', label: '希臘',
      svg: frame((function () {
        var out = '', i;
        for (i = 0; i < 9; i++) {
          out += '<rect x="5" y="' + (Y + i * (FH / 9)).toFixed(2) + '" width="90" height="' + (FH / 9).toFixed(2) +
            '" fill="' + (i % 2 === 0 ? '#0D5EAF' : '#FFFDF8') + '"/>';
        }
        out += '<rect x="5" y="18" width="32" height="32" fill="#0D5EAF"/>' +
          '<rect x="18" y="18" width="6" height="32" fill="#FFFDF8"/>' +
          '<rect x="5" y="31" width="32" height="6" fill="#FFFDF8"/>';
        return out;
      }()))
    }
  ];

  /* 原本手畫的 32 面（台灣、日本、美國…）維持不動 */
  var BASE = [
    { id: "taiwan", label: "台灣", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#DE2910"/><rect x="5" y="18" width="38" height="29" fill="#000095"/><polygon points="24.0,20.0 26.8,28.1 35.4,28.3 28.6,33.5 31.1,41.7 24.0,36.8 16.9,41.7 19.4,33.5 12.6,28.3 21.2,28.1" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "japan", label: "日本", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><circle cx="50" cy="47" r="18" fill="#BC002D"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "south-korea", label: "韓國", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><path d="M50 29 A18 18 0 0 1 50 65 A9 9 0 0 0 50 47 A9 9 0 0 1 50 29Z" fill="#CD2E3A"/><path d="M50 47 A9 9 0 0 0 50 65 A18 18 0 0 0 50 29 A9 9 0 0 1 50 47Z" fill="#0047A0"/><path d="M22 31l12 5M20 36l12 5M78 59l-12-5M80 54l-12-5" stroke="#111" stroke-width="3"/><path d="M22 59l12-5M20 54l12-5M78 31l-12 5M80 36l-12 5" stroke="#111" stroke-width="3"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "china", label: "中國", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#DE2910"/><polygon points="24.0,22.0 26.6,29.4 34.5,29.6 28.2,34.4 30.5,41.9 24.0,37.4 17.5,41.9 19.8,34.4 13.5,29.6 21.4,29.4" fill="#FFDE00"/><polygon points="43.0,22.0 43.7,24.0 45.9,24.1 44.1,25.4 44.8,27.4 43.0,26.2 41.2,27.4 41.9,25.4 40.1,24.1 42.3,24.0" fill="#FFDE00"/><polygon points="49.0,31.0 49.7,33.0 51.9,33.1 50.1,34.4 50.8,36.4 49.0,35.2 47.2,36.4 47.9,34.4 46.1,33.1 48.3,33.0" fill="#FFDE00"/><polygon points="47.0,41.0 47.7,43.0 49.9,43.1 48.1,44.4 48.8,46.4 47.0,45.2 45.2,46.4 45.9,44.4 44.1,43.1 46.3,43.0" fill="#FFDE00"/><polygon points="38.0,48.0 38.7,50.0 40.9,50.1 39.1,51.4 39.8,53.4 38.0,52.2 36.2,53.4 36.9,51.4 35.1,50.1 37.3,50.0" fill="#FFDE00"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "mongolia", label: "蒙古", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#C4272F"/><rect x="35" y="18" width="30" height="58" fill="#015197"/><circle cx="19" cy="47" r="10" fill="#FFD700"/><path d="M19 38v18M12 47h14" stroke="#C4272F" stroke-width="2"/><circle cx="19" cy="42" r="2" fill="#C4272F"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "india", label: "印度", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="19.333333333333332" fill="#FF9933"/><rect x="5" y="37.33333333333333" width="90" height="19.333333333333332" fill="#FFFDF8"/><rect x="5" y="56.666666666666664" width="90" height="19.333333333333332" fill="#138808"/><circle cx="50" cy="47" r="10" fill="none" stroke="#000080" stroke-width="2"/><circle cx="50" cy="47" r="3" fill="#000080"/><path d="M50 37v20M40 47h20M43 40l14 14M57 40L43 54" stroke="#000080" stroke-width="1.5"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "singapore", label: "新加坡", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="29" fill="#EF3340"/><circle cx="29" cy="32" r="10" fill="#FFF"/><circle cx="33" cy="30" r="9" fill="#EF3340"/><polygon points="43.0,22.0 43.7,24.0 45.9,24.1 44.1,25.4 44.8,27.4 43.0,26.2 41.2,27.4 41.9,25.4 40.1,24.1 42.3,24.0" fill="#FFFDF8"/><polygon points="47.0,29.0 47.7,31.0 49.9,31.1 48.1,32.4 48.8,34.4 47.0,33.2 45.2,34.4 45.9,32.4 44.1,31.1 46.3,31.0" fill="#FFFDF8"/><polygon points="44.0,37.0 44.7,39.0 46.9,39.1 45.1,40.4 45.8,42.4 44.0,41.2 42.2,42.4 42.9,40.4 41.1,39.1 43.3,39.0" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "thailand", label: "泰國", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#A51931"/><rect x="5" y="18" width="90" height="9.666666666666666" fill="#A51931"/><rect x="5" y="27.666666666666664" width="90" height="9.666666666666666" fill="#FFFDF8"/><rect x="5" y="37.33333333333333" width="90" height="9.666666666666666" fill="#2D2A4A"/><rect x="5" y="47" width="90" height="9.666666666666666" fill="#2D2A4A"/><rect x="5" y="56.666666666666664" width="90" height="9.666666666666666" fill="#FFFDF8"/><rect x="5" y="66.33333333333333" width="90" height="9.666666666666666" fill="#A51931"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "vietnam", label: "越南", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#DA251D"/><polygon points="50.0,29.0 54.2,41.2 67.1,41.4 56.8,49.2 60.6,61.6 50.0,54.2 39.4,61.6 43.2,49.2 32.9,41.4 45.8,41.2" fill="#FFCD00"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "philippines", label: "菲律賓", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#0038A8"/><rect x="5" y="47" width="90" height="29" fill="#CE1126"/><polygon points="5,18 5,76 58,47" fill="#FFF"/><circle cx="22" cy="47" r="11" fill="#FCD116"/><circle cx="22" cy="47" r="4" fill="#DE2910"/><polygon points="12.0,25.0 12.9,27.7 15.8,27.8 13.5,29.5 14.4,32.2 12.0,30.6 9.6,32.2 10.5,29.5 8.2,27.8 11.1,27.7" fill="#FCD116"/><polygon points="12.0,61.0 12.9,63.7 15.8,63.8 13.5,65.5 14.4,68.2 12.0,66.6 9.6,68.2 10.5,65.5 8.2,63.8 11.1,63.7" fill="#FCD116"/><polygon points="64.0,43.0 64.9,45.7 67.8,45.8 65.5,47.5 66.4,50.2 64.0,48.6 61.6,50.2 62.5,47.5 60.2,45.8 63.1,45.7" fill="#FCD116"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "indonesia", label: "印尼", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="29" fill="#CE1126"/><rect x="5" y="47" width="90" height="29" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "malaysia", label: "馬來西亞", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#CC0001"/><rect x="5" y="18" width="90" height="4.461538461538462" fill="#CC0001"/><rect x="5" y="22.46153846153846" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="26.923076923076923" width="90" height="4.461538461538462" fill="#CC0001"/><rect x="5" y="31.384615384615387" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="35.84615384615385" width="90" height="4.461538461538462" fill="#CC0001"/><rect x="5" y="40.30769230769231" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="44.769230769230774" width="90" height="4.461538461538462" fill="#CC0001"/><rect x="5" y="49.23076923076923" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="53.69230769230769" width="90" height="4.461538461538462" fill="#CC0001"/><rect x="5" y="58.15384615384615" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="62.61538461538461" width="90" height="4.461538461538462" fill="#CC0001"/><rect x="5" y="67.07692307692308" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="71.53846153846155" width="90" height="4.461538461538462" fill="#CC0001"/><rect x="5" y="18" width="42" height="29" fill="#010066"/><circle cx="25" cy="32" r="10" fill="#FFCC00"/><circle cx="30" cy="29" r="9" fill="#010066"/><polygon points="38.0,26.0 39.4,30.1 43.7,30.1 40.3,32.7 41.5,36.9 38.0,34.4 34.5,36.9 35.7,32.7 32.3,30.1 36.6,30.1" fill="#FFCC00"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "australia", label: "澳洲", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#00008B"/><rect x="5" y="18" width="42" height="29" fill="#012169"/><path d="M5 18l42 29M47 18L5 47" stroke="#FFF" stroke-width="7"/><path d="M5 18l42 29M47 18L5 47" stroke="#C8102E" stroke-width="3"/><polygon points="74.0,50.0 75.6,54.7 80.7,54.8 76.7,57.9 78.1,62.7 74.0,59.8 69.9,62.7 71.3,57.9 67.3,54.8 72.4,54.7" fill="#FFFDF8"/><polygon points="82.0,27.0 82.9,29.7 85.8,29.8 83.5,31.5 84.4,34.2 82.0,32.6 79.6,34.2 80.5,31.5 78.2,29.8 81.1,29.7" fill="#FFFDF8"/><polygon points="88.0,43.0 88.9,45.7 91.8,45.8 89.5,47.5 90.4,50.2 88.0,48.6 85.6,50.2 86.5,47.5 84.2,45.8 87.1,45.7" fill="#FFFDF8"/><polygon points="72.0,33.0 72.9,35.7 75.8,35.8 73.5,37.5 74.4,40.2 72.0,38.6 69.6,40.2 70.5,37.5 68.2,35.8 71.1,35.7" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "new-zealand", label: "紐西蘭", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#00247D"/><rect x="5" y="18" width="42" height="29" fill="#012169"/><path d="M5 18l42 29M47 18L5 47" stroke="#FFF" stroke-width="7"/><path d="M5 18l42 29M47 18L5 47" stroke="#C8102E" stroke-width="3"/><polygon points="70.0,30.0 71.2,33.4 74.8,33.5 71.9,35.6 72.9,39.0 70.0,37.0 67.1,39.0 68.1,35.6 65.2,33.5 68.8,33.4" fill="#CC142B"/><polygon points="82.0,43.0 83.2,46.4 86.8,46.5 83.9,48.6 84.9,52.0 82.0,50.0 79.1,52.0 80.1,48.6 77.2,46.5 80.8,46.4" fill="#CC142B"/><polygon points="74.0,56.0 75.2,59.4 78.8,59.5 75.9,61.6 76.9,65.0 74.0,63.0 71.1,65.0 72.1,61.6 69.2,59.5 72.8,59.4" fill="#CC142B"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "united-states", label: "美國", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="4.461538461538462" fill="#B22234"/><rect x="5" y="22.46153846153846" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="26.923076923076923" width="90" height="4.461538461538462" fill="#B22234"/><rect x="5" y="31.384615384615387" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="35.84615384615385" width="90" height="4.461538461538462" fill="#B22234"/><rect x="5" y="40.30769230769231" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="44.769230769230774" width="90" height="4.461538461538462" fill="#B22234"/><rect x="5" y="49.23076923076923" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="53.69230769230769" width="90" height="4.461538461538462" fill="#B22234"/><rect x="5" y="58.15384615384615" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="62.61538461538461" width="90" height="4.461538461538462" fill="#B22234"/><rect x="5" y="67.07692307692308" width="90" height="4.461538461538462" fill="#FFFDF8"/><rect x="5" y="71.53846153846155" width="90" height="4.461538461538462" fill="#B22234"/><rect x="5" y="18" width="43" height="31" fill="#3C3B6E"/><polygon points="14.0,22.5 14.6,24.2 16.4,24.2 15.0,25.3 15.5,27.0 14.0,26.0 12.5,27.0 13.0,25.3 11.6,24.2 13.4,24.2" fill="#FFFDF8"/><polygon points="24.0,22.5 24.6,24.2 26.4,24.2 25.0,25.3 25.5,27.0 24.0,26.0 22.5,27.0 23.0,25.3 21.6,24.2 23.4,24.2" fill="#FFFDF8"/><polygon points="34.0,22.5 34.6,24.2 36.4,24.2 35.0,25.3 35.5,27.0 34.0,26.0 32.5,27.0 33.0,25.3 31.6,24.2 33.4,24.2" fill="#FFFDF8"/><polygon points="19.0,31.5 19.6,33.2 21.4,33.2 20.0,34.3 20.5,36.0 19.0,35.0 17.5,36.0 18.0,34.3 16.6,33.2 18.4,33.2" fill="#FFFDF8"/><polygon points="29.0,31.5 29.6,33.2 31.4,33.2 30.0,34.3 30.5,36.0 29.0,35.0 27.5,36.0 28.0,34.3 26.6,33.2 28.4,33.2" fill="#FFFDF8"/><polygon points="39.0,31.5 39.6,33.2 41.4,33.2 40.0,34.3 40.5,36.0 39.0,35.0 37.5,36.0 38.0,34.3 36.6,33.2 38.4,33.2" fill="#FFFDF8"/><polygon points="14.0,40.5 14.6,42.2 16.4,42.2 15.0,43.3 15.5,45.0 14.0,44.0 12.5,45.0 13.0,43.3 11.6,42.2 13.4,42.2" fill="#FFFDF8"/><polygon points="24.0,40.5 24.6,42.2 26.4,42.2 25.0,43.3 25.5,45.0 24.0,44.0 22.5,45.0 23.0,43.3 21.6,42.2 23.4,42.2" fill="#FFFDF8"/><polygon points="34.0,40.5 34.6,42.2 36.4,42.2 35.0,43.3 35.5,45.0 34.0,44.0 32.5,45.0 33.0,43.3 31.6,42.2 33.4,42.2" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "canada", label: "加拿大", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="25" height="58" fill="#D80621"/><rect x="70" y="18" width="25" height="58" fill="#D80621"/><path d="M50 27l4 10 9-5-4 10 9 4-11 3 2 12-9-7-9 7 2-12-11-3 9-4-4-10 9 5z" fill="#D80621"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "mexico", label: "墨西哥", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="30" height="58" fill="#006847"/><rect x="35" y="18" width="30" height="58" fill="#FFFDF8"/><rect x="65" y="18" width="30" height="58" fill="#CE1126"/><circle cx="50" cy="47" r="8" fill="#8C6B3E"/><path d="M44 50q6-14 12 0q-6 6-12 0z" fill="#2D7D46"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "brazil", label: "巴西", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#009B3A"/><polygon points="50,22 84,47 50,72 16,47" fill="#FFDF00"/><circle cx="50" cy="47" r="15" fill="#002776"/><path d="M37 43q13-8 26 1" fill="none" stroke="#FFF" stroke-width="3"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "argentina", label: "阿根廷", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="19.333333333333332" fill="#74ACDF"/><rect x="5" y="37.33333333333333" width="90" height="19.333333333333332" fill="#FFFDF8"/><rect x="5" y="56.666666666666664" width="90" height="19.333333333333332" fill="#74ACDF"/><circle cx="50" cy="47" r="11" fill="#F6B40E"/><circle cx="50" cy="47" r="4" fill="#DE2910"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "united-kingdom", label: "英國", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#012169"/><rect x="43" y="18" width="14" height="58" fill="#FFFDF8"/><rect x="5" y="40" width="90" height="14" fill="#FFFDF8"/><rect x="47" y="18" width="6" height="58" fill="#C8102E"/><rect x="5" y="44" width="90" height="6" fill="#C8102E"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "france", label: "法國", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="30" height="58" fill="#0055A4"/><rect x="35" y="18" width="30" height="58" fill="#FFFDF8"/><rect x="65" y="18" width="30" height="58" fill="#EF4135"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "germany", label: "德國", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="19.333333333333332" fill="#000"/><rect x="5" y="37.33333333333333" width="90" height="19.333333333333332" fill="#DD0000"/><rect x="5" y="56.666666666666664" width="90" height="19.333333333333332" fill="#FFCE00"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "italy", label: "義大利", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="30" height="58" fill="#009246"/><rect x="35" y="18" width="30" height="58" fill="#FFFDF8"/><rect x="65" y="18" width="30" height="58" fill="#CE2B37"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "spain", label: "西班牙", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFC400"/><rect x="5" y="18" width="90" height="19.333333333333332" fill="#AA151B"/><rect x="5" y="37.33333333333333" width="90" height="19.333333333333332" fill="#FFC400"/><rect x="5" y="56.666666666666664" width="90" height="19.333333333333332" fill="#AA151B"/><rect x="30" y="39" width="10" height="16" fill="#C60B1E"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "portugal", label: "葡萄牙", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FF0000"/><rect x="5" y="18" width="36" height="58" fill="#046A38"/><circle cx="41" cy="47" r="12" fill="#FFCC29"/><circle cx="41" cy="47" r="7" fill="#DA291C"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "netherlands", label: "荷蘭", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="19.333333333333332" fill="#AE1C28"/><rect x="5" y="37.33333333333333" width="90" height="19.333333333333332" fill="#FFFDF8"/><rect x="5" y="56.666666666666664" width="90" height="19.333333333333332" fill="#21468B"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "switzerland", label: "瑞士", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#D52B1E"/><rect x="43" y="29" width="14" height="36" fill="#FFF"/><rect x="31" y="40" width="38" height="14" fill="#FFF"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "sweden", label: "瑞典", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#006AA7"/><rect x="29" y="18" width="11" height="58" fill="#FECC00"/><rect x="5" y="40" width="90" height="11" fill="#FECC00"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "norway", label: "挪威", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#BA0C2F"/><rect x="29" y="18" width="18" height="58" fill="#FFF"/><rect x="5" y="39" width="90" height="18" fill="#FFF"/><rect x="35" y="18" width="7" height="58" fill="#00205B"/><rect x="5" y="45" width="90" height="7" fill="#00205B"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "finland", label: "芬蘭", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="29" y="18" width="13" height="58" fill="#003580"/><rect x="5" y="40" width="90" height="14" fill="#003580"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "south-africa", label: "南非", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#007A4D"/><path d="M5 18h90v58H5z" fill="#007A4D"/><path d="M5 18l42 29L5 76h22l40-29-40-29z" fill="#FFB81C"/><path d="M5 18l42 29L5 76h12l40-29-40-29z" fill="#FFF"/><path d="M5 18l42 29L5 76h9l40-29L14 18z" fill="#DE3831"/><path d="M5 18v58l42-29z" fill="#000"/><path d="M5 18v58l27-29z" fill="#FFB81C"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` },
    { id: "egypt", label: "埃及", svg: `<rect x="5" y="18" width="90" height="58" rx="5" fill="#FFFDF8"/><rect x="5" y="18" width="90" height="19.333333333333332" fill="#CE1126"/><rect x="5" y="37.33333333333333" width="90" height="19.333333333333332" fill="#FFFDF8"/><rect x="5" y="56.666666666666664" width="90" height="19.333333333333332" fill="#000"/><circle cx="50" cy="47" r="8" fill="#C09300"/><path d="M44 43h12v8H44z" fill="#FFF"/><rect x="5" y="18" width="90" height="58" rx="5" fill="none" stroke="#5B4636" stroke-width="3"/>` }
  ];

  /* 第三批：再加 19 面，國旗的造型池從 53 面變成 72 面。
     一樣走上面的產生器，挑的都是「色帶配置或標誌明顯不同」的旗，
     避免又多出好幾面只差顏色順序的三色旗。 */
  var MORE2 = [
    {
      id: 'colombia', label: '哥倫比亞',
      svg: frame('<rect x="5" y="18" width="90" height="29" fill="#FCD116"/>' +
        '<rect x="5" y="47" width="90" height="14.5" fill="#003893"/>' +
        '<rect x="5" y="61.5" width="90" height="14.5" fill="#CE1126"/>')
    },
    { id: 'ghana', label: '迦納', svg: frame(bands(['#CE1126', '#FCD116', '#006B3F']) + star(50, 47, 10, '#111111')) },
    {
      id: 'ethiopia', label: '衣索比亞',
      svg: frame(bands(['#078930', '#FCDD09', '#DA121A']) +
        '<circle cx="50" cy="47" r="14" fill="#0F47AF"/>' + star(50, 47, 10, '#FCDD09'))
    },
    { id: 'senegal', label: '塞內加爾', svg: frame(bands(['#00853F', '#FDEF42', '#E31B23'], true) + star(50, 47, 10, '#00853F')) },
    { id: 'cameroon', label: '喀麥隆', svg: frame(bands(['#007A5E', '#CE1126', '#FCD116'], true) + star(50, 47, 9, '#FCD116')) },
    { id: 'armenia', label: '亞美尼亞', svg: frame(bands(['#D90012', '#0033A0', '#F2A800'])) },
    {
      id: 'kenya', label: '肯亞',
      svg: frame('<rect x="5" y="18" width="90" height="17" fill="#111111"/>' +
        '<rect x="5" y="35" width="90" height="3" fill="#FFFDF8"/>' +
        '<rect x="5" y="38" width="90" height="18" fill="#BB0000"/>' +
        '<rect x="5" y="56" width="90" height="3" fill="#FFFDF8"/>' +
        '<rect x="5" y="59" width="90" height="17" fill="#006600"/>' +
        '<ellipse cx="50" cy="47" rx="9" ry="19" fill="#BB0000" stroke="#FFFDF8" stroke-width="2.6"/>' +
        '<path d="M50 30 L50 64" stroke="#111111" stroke-width="2.4"/>')
    },
    {
      id: 'pakistan', label: '巴基斯坦',
      svg: frame('<rect x="5" y="18" width="90" height="58" fill="#01411C"/>' +
        '<rect x="5" y="18" width="22" height="58" fill="#FFFDF8"/>' +
        crescent(56, 47, 15, '#FFFDF8', '#01411C') +
        star(74, 37, 7, '#FFFDF8'), '#01411C')
    },
    {
      id: 'algeria', label: '阿爾及利亞',
      svg: frame('<rect x="5" y="18" width="45" height="58" fill="#006233"/>' +
        '<rect x="50" y="18" width="45" height="58" fill="#FFFDF8"/>' +
        crescent(62, 47, 13, '#D21034', '#FFFDF8') +
        star(76, 47, 7, '#D21034'))
    },
    {
      id: 'tunisia', label: '突尼西亞',
      svg: frame('<rect x="5" y="18" width="90" height="58" fill="#E70013"/>' +
        '<circle cx="50" cy="47" r="17" fill="#FFFDF8"/>' +
        crescent(46, 47, 12, '#E70013', '#FFFDF8') +
        star(58, 47, 6, '#E70013'), '#E70013')
    },
    {
      id: 'israel', label: '以色列',
      svg: frame('<rect x="5" y="24" width="90" height="8" fill="#0038B8"/>' +
        '<rect x="5" y="62" width="90" height="8" fill="#0038B8"/>' +
        '<polygon points="50,33 60.4,51 39.6,51" fill="none" stroke="#0038B8" stroke-width="3"/>' +
        '<polygon points="50,61 39.6,43 60.4,43" fill="none" stroke="#0038B8" stroke-width="3"/>')
    },
    {
      id: 'uae', label: '阿聯',
      svg: frame('<rect x="5" y="18" width="90" height="19.33" fill="#00732F"/>' +
        '<rect x="5" y="37.33" width="90" height="19.33" fill="#FFFDF8"/>' +
        '<rect x="5" y="56.66" width="90" height="19.34" fill="#111111"/>' +
        '<rect x="5" y="18" width="24" height="58" fill="#FF0000"/>')
    },
    {
      id: 'bangladesh', label: '孟加拉',
      svg: frame('<rect x="5" y="18" width="90" height="58" fill="#006A4E"/>' +
        '<circle cx="44" cy="47" r="17" fill="#F42A41"/>', '#006A4E')
    },
    {
      id: 'laos', label: '寮國',
      svg: frame('<rect x="5" y="18" width="90" height="14.5" fill="#CE1126"/>' +
        '<rect x="5" y="32.5" width="90" height="29" fill="#002868"/>' +
        '<rect x="5" y="61.5" width="90" height="14.5" fill="#CE1126"/>' +
        '<circle cx="50" cy="47" r="11" fill="#FFFDF8"/>')
    },
    {
      id: 'cambodia', label: '柬埔寨',
      svg: frame('<rect x="5" y="18" width="90" height="14.5" fill="#032EA1"/>' +
        '<rect x="5" y="32.5" width="90" height="29" fill="#E00025"/>' +
        '<rect x="5" y="61.5" width="90" height="14.5" fill="#032EA1"/>' +
        '<g fill="#FFFDF8"><rect x="34" y="52" width="32" height="6"/>' +
        '<polygon points="50,34 58,49 42,49"/><polygon points="38,40 44,50 32,50"/><polygon points="62,40 68,50 56,50"/></g>')
    },
    { id: 'myanmar', label: '緬甸', svg: frame(bands(['#FECB00', '#34B233', '#EA2839']) + star(50, 47, 17, '#FFFDF8')) },
    {
      id: 'cuba', label: '古巴',
      svg: frame((function () {
        var out = '', i;
        for (i = 0; i < 5; i++) {
          out += '<rect x="5" y="' + (Y + i * (FH / 5)).toFixed(2) + '" width="90" height="' + (FH / 5).toFixed(2) +
            '" fill="' + (i % 2 === 0 ? '#002A8F' : '#FFFDF8') + '"/>';
        }
        return out + '<polygon points="5,18 47,47 5,76" fill="#CF142B"/>' + star(20, 47, 9, '#FFFDF8');
      }()))
    },
    {
      id: 'jamaica', label: '牙買加',
      svg: frame('<rect x="5" y="18" width="90" height="58" fill="#009B3A"/>' +
        '<polygon points="5,18 50,47 5,76" fill="#111111"/>' +
        '<polygon points="95,18 50,47 95,76" fill="#111111"/>' +
        '<path d="M5 18 L95 76 M95 18 L5 76" stroke="#FED100" stroke-width="11"/>', '#009B3A')
    },
    {
      id: 'georgia', label: '喬治亞',
      svg: frame('<rect x="42" y="18" width="16" height="58" fill="#FF0000"/>' +
        '<rect x="5" y="39" width="90" height="16" fill="#FF0000"/>' +
        '<g fill="#FF0000"><rect x="20" y="26" width="10" height="3.4"/><rect x="23.3" y="22.7" width="3.4" height="10"/>' +
        '<rect x="70" y="26" width="10" height="3.4"/><rect x="73.3" y="22.7" width="3.4" height="10"/>' +
        '<rect x="20" y="64.6" width="10" height="3.4"/><rect x="23.3" y="61.3" width="3.4" height="10"/>' +
        '<rect x="70" y="64.6" width="10" height="3.4"/><rect x="73.3" y="61.3" width="3.4" height="10"/></g>')
    }
  ];

  return {
    key: "flags",
    label: "國旗",
    emoji: "🚩",
    note: "各國國旗",
    list: BASE.concat(MORE).concat(MORE2)
  };
}));
