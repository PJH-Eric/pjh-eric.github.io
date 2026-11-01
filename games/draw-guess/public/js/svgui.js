/* ===== svgui.js — 立體 SVG 按鈕、標題 LOGO、玩家頭像、工具圖示 =====
 *
 * 按鈕外觀是依元素實際尺寸即時畫出來的 SVG，所以縮放時不會被拉扁，
 * 也保證有「上層面 + 較深底座 + 高光」的區塊立體感。
 * 文字仍然是 HTML，不會烘焙進圖裡，方便本地化與螢幕閱讀器。
 *
 * 所有圖示都是自己畫的 SVG（有 viewBox、可縮放描邊），不靠 emoji 當核心視覺。
 */
(function (w) {
  'use strict';
  var INK = '#4A3B55';

  var PALETTE = {
    grape: ['#C9B6F5', '#A48FDB'],
    peach: ['#FFC2B4', '#E89C8B'],
    mint:  ['#A9E7D2', '#79C6AC'],
    sky:   ['#AED9F5', '#7FB4DA'],
    lemon: ['#FFE3A0', '#E7C263'],
    cream: ['#FFF0DE', '#E6D2B4'],
    rose:  ['#FFB8CF', '#E88CAA'],
    gray:  ['#E9E3EE', '#C8BFD1']
  };

  /* 玩家頭像用的 8 組配色，依座位順序循環，方便一眼認人 */
  var FACES = [
    { body: '#FFE0C2', dark: '#F0BC8E', accent: '#FFB8CF' },
    { body: '#AED9F5', dark: '#7FB4DA', accent: '#FFFFFF' },
    { body: '#A9E7D2', dark: '#79C6AC', accent: '#FFF7E0' },
    { body: '#FFC2B4', dark: '#E89C8B', accent: '#FFF0DE' },
    { body: '#C9B6F5', dark: '#A48FDB', accent: '#FFE3A0' },
    { body: '#FFE3A0', dark: '#E7C263', accent: '#FFB8CF' },
    { body: '#FFB8CF', dark: '#E88CAA', accent: '#AED9F5' },
    { body: '#E3CBAE', dark: '#C2A17C', accent: '#A9E7D2' }
  ];

  /* ---- 立體按鈕 ---- */
  function paint(el) {
    var wpx = el.offsetWidth, hpx = el.offsetHeight;
    if (!wpx || !hpx) return;
    var cs = getComputedStyle(el);
    var d = parseFloat(cs.getPropertyValue('--d')) || 8;
    var key = el.getAttribute('data-color') || 'cream';
    var c = PALETTE[key] || PALETTE.cream;
    var faceH = hpx - d - 4;
    if (faceH < 10) return;
    var r = Math.min(20, faceH / 2.2);
    var svg = el.querySelector('.b3-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'b3-svg');
      svg.setAttribute('aria-hidden', 'true');
      el.insertBefore(svg, el.firstChild);
    }
    svg.setAttribute('viewBox', '0 0 ' + wpx + ' ' + hpx);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML =
      '<rect x="2" y="' + (2 + d) + '" width="' + (wpx - 4) + '" height="' + faceH + '" rx="' + r + '" fill="' + c[1] + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<g class="b3-face">' +
      '<rect x="2" y="2" width="' + (wpx - 4) + '" height="' + faceH + '" rx="' + r + '" fill="' + c[0] + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="' + (r * 0.55 + 4) + '" y="7" width="' + Math.max(4, wpx - 8 - r * 1.1) + '" height="' + Math.max(4, faceH * 0.36) + '" rx="' + (r * 0.5) + '" fill="#FFFFFF" opacity="0.45"/>' +
      '</g>';
  }

  var ro = w.ResizeObserver ? new ResizeObserver(function (list) {
    for (var i = 0; i < list.length; i++) paint(list[i].target);
  }) : null;

  function decorate(el) {
    if (el.dataset.b3) return;
    el.dataset.b3 = '1';
    var lbl = document.createElement('span');
    lbl.className = 'b3-lbl';
    lbl.innerHTML = el.innerHTML;
    el.innerHTML = '';
    el.appendChild(lbl);
    paint(el);
    if (ro) ro.observe(el); else w.addEventListener('resize', function () { paint(el); });

    var press = function () { if (!el.disabled) el.classList.add('press'); };
    var release = function () { el.classList.remove('press'); };
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointercancel', release);
  }

  function decorateAll(root) {
    var list = (root || document).querySelectorAll('.btn3d');
    for (var i = 0; i < list.length; i++) decorate(list[i]);
  }
  function repaintAll(root) {
    var list = (root || document).querySelectorAll('.btn3d');
    for (var i = 0; i < list.length; i++) paint(list[i]);
  }
  function setLabel(el, html) {
    var lbl = el.querySelector('.b3-lbl');
    if (lbl) lbl.innerHTML = html; else el.innerHTML = html;
  }
  function setColor(el, key) {
    el.setAttribute('data-color', key);
    paint(el);
  }

  /* ---------------------------------------------------------- 頭像 */

  /**
   * 圓臉頭像。
   * mood: idle | happy | think | draw | win | sad
   * seat 決定配色，讓同一個人在席位卡、計分板、猜題紀錄都是同一個顏色。
   */
  function face(seat, mood, label) {
    var c = FACES[((seat | 0) % FACES.length + FACES.length) % FACES.length];
    var m = mood || 'idle';
    var eyes, mouth, extra = '';

    if (m === 'happy' || m === 'win') {
      eyes = '<path d="M30 52 q8 -11 16 0M54 52 q8 -11 16 0" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
      mouth = '<path d="M36 66 q14 14 28 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
    } else if (m === 'sad') {
      eyes = '<path d="M30 50 q8 10 16 0M54 50 q8 10 16 0" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
      mouth = '<path d="M36 72 q14 -12 28 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
    } else if (m === 'think') {
      eyes = '<circle cx="38" cy="52" r="6" fill="' + INK + '"/><path d="M54 52 h16" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
      mouth = '<path d="M40 68 h16" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
      extra = '<circle cx="80" cy="26" r="6" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
              '<circle cx="90" cy="14" r="4" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.5"/>';
    } else {
      eyes = '<circle cx="38" cy="52" r="6.5" fill="' + INK + '"/><circle cx="62" cy="52" r="6.5" fill="' + INK + '"/>' +
             '<circle cx="40.5" cy="49.5" r="2" fill="#FFF"/><circle cx="64.5" cy="49.5" r="2" fill="#FFF"/>';
      mouth = '<path d="M40 66 q10 9 20 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
    }

    if (m === 'draw') {
      /* 正在畫畫：手上多一支筆 */
      extra += '<g transform="rotate(35 82 62)">' +
        '<rect x="76" y="34" width="12" height="40" rx="3" fill="#FFE3A0" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M76 74 L82 88 L88 74 Z" fill="#FFF0DE" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '</g>';
    }

    return '<svg viewBox="0 0 100 100" role="img" aria-label="' + (label || (globalThis.I18N ? globalThis.I18N.t("text.331") : "玩家頭像")) + '">' +
      '<circle cx="50" cy="55" r="40" fill="' + c.dark + '"/>' +
      '<circle cx="50" cy="52" r="40" fill="' + c.body + '" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M18 34 q14 -18 32 -18 q18 0 32 18 q-16 -8 -32 -8 q-16 0 -32 8 Z" fill="' + c.dark + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      eyes + mouth +
      '<ellipse cx="26" cy="64" rx="7" ry="4.5" fill="' + c.accent + '" opacity="0.85"/>' +
      '<ellipse cx="74" cy="64" rx="7" ry="4.5" fill="' + c.accent + '" opacity="0.85"/>' +
      extra +
      '</svg>';
  }

  /* ---------------------------------------------------------- 圖示 */

  function ico(inner, label, box) {
    return '<svg viewBox="0 0 ' + (box || 100) + ' ' + (box || 100) + '" role="img" aria-label="' + label + '">' + inner + '</svg>';
  }
  var S = 'stroke="' + INK + '" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';

  var ICONS = {
    pen: function () {
      return ico('<path d="M22 78 L30 58 L68 20 L80 32 L42 70 Z" fill="#FFE3A0" ' + S + '/>' +
        '<path d="M30 58 L42 70" ' + S + ' fill="none"/>' +
        '<path d="M22 78 L28 72" ' + S + ' fill="none"/>', (globalThis.I18N ? globalThis.I18N.t("text.330") : "鉛筆"));
    },
    brush: function () {
      return ico('<path d="M20 80 q4 -22 18 -26 q10 -3 12 8 q2 12 -12 16 q-12 4 -18 2 Z" fill="#FFB8CF" ' + S + '/>' +
        '<path d="M46 58 L82 22 L70 12 L38 46 Z" fill="#AED9F5" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.329") : "筆刷"));
    },
    erase: function () {
      return ico('<path d="M18 68 L50 36 q6 -6 12 0 L84 58 q6 6 0 12 L66 88 L34 88 Z" fill="#FFC2B4" ' + S + '/>' +
        '<path d="M40 46 L74 76" ' + S + ' fill="none"/>' +
        '<path d="M22 88 L88 88" ' + S + ' fill="none"/>', (globalThis.I18N ? globalThis.I18N.t("text.328") : "橡皮擦"));
    },
    line: function () {
      return ico('<path d="M20 80 L80 20" ' + S + ' fill="none"/>' +
        '<circle cx="20" cy="80" r="9" fill="#A9E7D2" ' + S + '/>' +
        '<circle cx="80" cy="20" r="9" fill="#A9E7D2" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.327") : "直線"));
    },
    rect: function () {
      return ico('<rect x="18" y="26" width="64" height="48" rx="4" fill="#AED9F5" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.326") : "矩形"));
    },
    ellipse: function () {
      return ico('<ellipse cx="50" cy="50" rx="34" ry="26" fill="#C9B6F5" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.325") : "橢圓"));
    },
    fill: function () {
      return ico('<path d="M30 26 L66 62 L44 84 q-6 6 -12 0 L14 66 q-6 -6 0 -12 Z" fill="#A9E7D2" ' + S + '/>' +
        '<path d="M30 26 L24 16" ' + S + ' fill="none"/>' +
        '<path d="M80 46 q10 16 10 22 a10 10 0 0 1 -20 0 q0 -6 10 -22 Z" fill="#7FB4DA" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.324") : "油漆桶"));
    },
    undo: function () {
      return ico('<path d="M30 42 H62 a20 20 0 0 1 0 40 H40" fill="none" ' + S + '/>' +
        '<path d="M44 26 L26 42 L44 58" fill="none" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.323") : "復原"));
    },
    redo: function () {
      return ico('<path d="M70 42 H38 a20 20 0 0 0 0 40 H60" fill="none" ' + S + '/>' +
        '<path d="M56 26 L74 42 L56 58" fill="none" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.322") : "重做"));
    },
    trash: function () {
      return ico('<path d="M24 30 H76" ' + S + ' fill="none"/>' +
        '<path d="M40 30 V20 H60 V30" fill="#FFC2B4" ' + S + '/>' +
        '<path d="M30 30 L34 84 H66 L70 30 Z" fill="#FFF0DE" ' + S + '/>' +
        '<path d="M44 42 V72 M56 42 V72" ' + S + ' fill="none"/>', (globalThis.I18N ? globalThis.I18N.t("text.321") : "全部清除"));
    },
    gear: function () {
      var teeth = '';
      for (var i = 0; i < 8; i++) {
        teeth += '<rect x="43" y="4" width="14" height="20" rx="4" fill="#FFF0DE" ' + S +
          ' transform="rotate(' + (i * 45) + ' 50 50)"/>';
      }
      return ico(teeth +
        '<circle cx="50" cy="50" r="28" fill="#FFF0DE" ' + S + '/>' +
        '<circle cx="50" cy="50" r="11" fill="#C9B6F5" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.320") : "設定"));
    },
    palette: function () {
      return ico('<path d="M50 14 a36 36 0 1 0 0 72 q10 0 10 -8 q0 -8 6 -8 h10 a14 14 0 0 0 14 -14 A36 36 0 0 0 50 14 Z" fill="#FFF0DE" ' + S + '/>' +
        '<circle cx="34" cy="38" r="7" fill="#D2444F"/><circle cx="56" cy="30" r="7" fill="#5FBF95"/>' +
        '<circle cx="72" cy="46" r="7" fill="#7FB4DA"/><circle cx="32" cy="62" r="7" fill="#E7C263"/>', (globalThis.I18N ? globalThis.I18N.t("text.319") : "調色盤"));
    },
    trophy: function () {
      return ico('<path d="M32 18 H68 V44 a18 18 0 0 1 -36 0 Z" fill="#FFE3A0" ' + S + '/>' +
        '<path d="M32 24 H20 a12 12 0 0 0 12 14 M68 24 H80 a12 12 0 0 1 -12 14" fill="none" ' + S + '/>' +
        '<path d="M50 62 V74 M36 74 H64 M30 86 H70 V74 H30 Z" fill="#E7C263" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.318") : "獎盃"));
    },
    eye: function () {
      return ico('<path d="M10 50 q40 -34 80 0 q-40 34 -80 0 Z" fill="#FFF0DE" ' + S + '/>' +
        '<circle cx="50" cy="50" r="14" fill="#AED9F5" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.317") : "觀戰"));
    },
    clock: function () {
      return ico('<circle cx="50" cy="52" r="34" fill="#FFF0DE" ' + S + '/>' +
        '<path d="M50 52 V32 M50 52 L66 60" ' + S + ' fill="none"/>', (globalThis.I18N ? globalThis.I18N.t("text.316") : "倒數"));
    },
    chat: function () {
      return ico('<path d="M16 26 H84 V66 H50 L32 82 V66 H16 Z" fill="#AED9F5" ' + S + '/>' +
        '<circle cx="36" cy="46" r="4.5" fill="' + INK + '"/><circle cx="50" cy="46" r="4.5" fill="' + INK + '"/><circle cx="64" cy="46" r="4.5" fill="' + INK + '"/>', (globalThis.I18N ? globalThis.I18N.t("text.315") : "猜題紀錄"));
    },
    board: function () {
      return ico('<rect x="14" y="18" width="72" height="56" rx="6" fill="#FFFDF8" ' + S + '/>' +
        '<path d="M26 60 q12 -26 22 -14 q8 10 16 -6" fill="none" stroke="#E88CAA" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M40 74 V86 M60 74 V86 M32 86 H68" ' + S + ' fill="none"/>', (globalThis.I18N ? globalThis.I18N.t("text.314") : "畫板"));
    },
    people: function () {
      return ico('<circle cx="36" cy="36" r="16" fill="#FFE3A0" ' + S + '/>' +
        '<circle cx="68" cy="42" r="12" fill="#AED9F5" ' + S + '/>' +
        '<path d="M12 84 q4 -24 24 -24 q20 0 24 24 Z" fill="#FFE3A0" ' + S + '/>' +
        '<path d="M60 84 q4 -18 16 -18 q12 0 14 18 Z" fill="#AED9F5" ' + S + '/>', (globalThis.I18N ? globalThis.I18N.t("text.034") : "玩家"));
    }
  };

  function icon(name, label) {
    var f = ICONS[name];
    return f ? f(label) : '';
  }

  /* ---------------------------------------------------------- LOGO */

  function logo() {
    return (globalThis.I18N ? globalThis.I18N.t("text.313") : "<svg viewBox=\"0 0 520 190\" role=\"img\" aria-label=\"你畫我猜\">") +
      '<defs>' +
      '<linearGradient id="dgSky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#FFF6E8"/><stop offset="1" stop-color="#FFE9F2"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect x="14" y="14" width="492" height="162" rx="40" fill="url(#dgSky)" stroke="' + INK + '" stroke-width="7"/>' +
      /* 左邊：畫板與筆 */
      '<rect x="44" y="48" width="96" height="76" rx="10" fill="#FFFDF8" stroke="' + INK + '" stroke-width="6"/>' +
      '<path d="M58 106 q16 -34 30 -18 q10 12 22 -10" fill="none" stroke="#E88CAA" stroke-width="7" stroke-linecap="round"/>' +
      '<circle cx="74" cy="70" r="7" fill="#7FB4DA"/>' +
      '<g transform="rotate(30 138 108)">' +
      '<rect x="130" y="62" width="16" height="48" rx="4" fill="#FFE3A0" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M130 110 L138 128 L146 110 Z" fill="#FFF0DE" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '</g>' +
      /* 文字 */
      '<text x="288" y="118" text-anchor="middle" font-size="70" font-weight="900" fill="#6E4FBF" ' +
      'stroke="' + INK + '" stroke-width="7" paint-order="stroke" ' +
      (globalThis.I18N ? globalThis.I18N.t("text.312") : "font-family=\"Yuanti TC, PingFang TC, Microsoft JhengHei, Noto Sans TC, sans-serif\">你畫我猜</text>") +
      /* 右邊：問號泡泡 */
      '<path d="M406 44 H486 V96 H448 L430 112 V96 H406 Z" fill="#C9B6F5" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>' +
      '<text x="446" y="84" text-anchor="middle" font-size="40" font-weight="900" fill="#FFFDF8" ' +
      'stroke="' + INK + '" stroke-width="5" paint-order="stroke" font-family="system-ui, sans-serif">?</text>' +
      '</svg>';
  }

  /* ------------------------------------------------------ 背景裝飾 */

  function decorateBackground(el, count) {
    if (!el) return;
    var n = count || 12;
    var colors = ['#FFE3A0', '#C9B6F5', '#A9E7D2', '#FFB8CF', '#AED9F5'];
    var html = '';
    for (var i = 0; i < n; i++) {
      var size = 28 + (i * 37) % 64;
      html += '<span style="left:' + ((i * 83) % 100) + '%;top:' + ((i * 47) % 100) + '%;' +
        'width:' + size + 'px;height:' + size + 'px;background:' + colors[i % colors.length] + ';' +
        'animation-duration:' + (10 + (i % 7) * 3) + 's;animation-delay:-' + (i * 1.7) + 's"></span>';
    }
    el.innerHTML = html;
  }

  w.SvgUI = {
    PALETTE: PALETTE,
    FACES: FACES,
    INK: INK,
    decorateAll: decorateAll,
    repaintAll: repaintAll,
    setLabel: setLabel,
    setColor: setColor,
    face: face,
    icon: icon,
    ICONS: ICONS,
    logo: logo,
    decorateBackground: decorateBackground
  };
}(window));
