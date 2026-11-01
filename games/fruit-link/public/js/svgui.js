/* ===== svgui.js — 立體 SVG 按鈕、水果磚、標題 LOGO、獎盃、背景裝飾 =====
 *
 * 按鈕外觀依元素「實際像素尺寸」即時畫出來，所以不管被拉多寬都不會變形，
 * 而且一定有「上層面 + 較深底座 + 高光」的區塊立體感。
 * 文字仍然留在 HTML，不會烘焙進圖裡，本地化與螢幕閱讀器才讀得到。
 */
(function (w) {
  'use strict';
  var INK = '#4A3B55';
  var FRUIT_INK = '#5B4636';     // 水果造型本身的描邊色（沿用同一套素材）

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

  /* 磚塊配色：每一種圖案配一個色相，同一局裡不會有兩種圖案撞色。
   *
   * 色相刻意「跳著排」（紅 → 藍 → 黃 → 紫…），相鄰的種類差很多，
   * 玩家掃過盤面時不容易把兩種不同的圖案看成同一種。
   * 每個色相產出三個明度：正面（很淡，不跟圖案搶）、
   * 內緣陰影（中）、側面厚度（深，做立體感也是最顯眼的顏色標記）。
   */
  var TILE_HUES = [352, 205, 42, 268, 96, 320, 18, 172, 62, 290, 138, 232, 8, 112, 306, 250];

  function hsl(h, s2, l) { return 'hsl(' + h + ', ' + s2 + '%, ' + l + '%)'; }

  /** @param {number} kind 1 起算 → [正面, 內緣, 側面] */
  function tileColors(kind) {
    var h = TILE_HUES[(Math.max(1, kind) - 1) % TILE_HUES.length];
    return [hsl(h, 72, 93), hsl(h, 58, 80), hsl(h, 48, 63)];
  }

  /* ---------------------------------------------------------- 立體按鈕 */

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
  function setColor(el, key) { el.setAttribute('data-color', key); paint(el); }

  /* ---------------------------------------------------------- 造型磚 */


  /**
   * 這一局的第 kind 種要畫成什麼。
   *
   * 盤面只存 1..kinds 這種數字，palette 把它對到主題裡的第幾號造型
   * （palette 是開局時用種子亂數抽的，所以同一關每次的組合都不一樣，
   * 線上則靠同一個種子讓全場抽到同一組）。
   *
   * @param {string} theme   主題名稱
   * @param {number[]} palette 這一局的造型對照表
   * @param {number} kind    1 起算的種類編號
   */
  function artOf(theme, palette, kind) {
    if (!w.Themes) return null;
    var i = (palette && palette.length) ? palette[(kind - 1) % palette.length] : (kind - 1);
    return w.Themes.art(theme, i);
  }

  /**
   * 一塊造型磚：圓角木牌 + 該主題的造型。
   * viewBox 固定 100×100，實際大小交給 CSS，所以每種裝置只是等比縮放。
   */
  /**
   * 一塊立體磚：落地陰影 + 側面厚度 + 正面 + 內斜角 + 頂部光澤 + 圖案。
   *
   * viewBox 固定 100×100，實際大小交給 CSS，所以每種裝置只是等比縮放。
   * 正面是 y 2～90，下面 7 個單位留給側面，看起來就像一塊有厚度的牌。
   * 圖案裝在 .tile-art 這一層，開「顯示名稱」時由 CSS 往上縮，
   * 名稱才有自己的位置，不會蓋在圖案上。
   */
  function tileSvg(kind, theme, palette) {
    var art = artOf(theme, palette, kind);
    var c = tileColors(kind);
    var isMahjong = theme === 'mahjong';
    var frame = isMahjong ? '' :
      /* 落地陰影：讓磚看起來是浮在盤面上的 */
      '<ellipse cx="50" cy="96" rx="41" ry="3.6" fill="#4A3B55" opacity="0.18"/>' +
      /* 側面（厚度）：這一條深色也是這種圖案最好認的顏色標記 */
      '<rect x="2" y="9" width="96" height="88" rx="18" fill="' + c[2] + '" stroke="' + INK + '" stroke-width="3"/>' +
      /* 正面 */
      '<rect x="2" y="2" width="96" height="88" rx="18" fill="' + c[0] + '" stroke="' + INK + '" stroke-width="3"/>' +
      /* 內斜角：上緣打亮、下緣壓暗，厚度才立體 */
      '<path d="M7 21 A15 15 0 0 1 22 6 L78 6 A15 15 0 0 1 93 21" fill="none" stroke="#FFFFFF" ' +
        'stroke-width="4" stroke-linecap="round" opacity="0.6"/>' +
      '<path d="M7 71 A15 15 0 0 0 22 86 L78 86 A15 15 0 0 0 93 71" fill="none" stroke="' + c[1] + '" ' +
        'stroke-width="4" stroke-linecap="round" opacity="0.85"/>' +
      /* 頂部光澤 */
      '<rect x="13" y="7" width="74" height="19" rx="9.5" fill="#FFFFFF" opacity="0.42"/>';
    var artTransform = isMahjong
      ? 'translate(50 48) scale(1.18) translate(-50 -50)'
      : 'translate(50 46) scale(.88) translate(-50 -50)';
    return '<svg class="tile-svg' + (isMahjong ? ' tile-svg-mahjong' : '') + '" viewBox="0 0 100 100" aria-hidden="true">' +
      frame +
      /* 圖案層。裡面先放一個看不見的 100×100 定位框：每一種圖案的實際外框大小
         都不一樣（香蕉扁、玉米長），少了這個框，CSS 依 fill-box 縮放時每一種
         讓位的幅度就會不同，名稱標籤有時候還是會被蓋到。 */
      '<g class="tile-art" transform="' + artTransform + '">' +
      '<rect x="0" y="0" width="100" height="100" fill="none" stroke="none"/>' +
      (art ? art.svg : '') + '</g>' +
      '</svg>';
  }

  /** 只有造型本體（選單縮圖、說明頁用得到）。i 是主題裡的第幾號造型 */
  function artSvg(theme, i, cls) {
    var art = w.Themes ? w.Themes.art(theme, i) : null;
    return '<svg class="' + (cls || 'fruit-svg') + '" viewBox="0 0 100 100" aria-hidden="true">' +
      (art ? art.svg : '') + '</svg>';
  }

  /** 這一格要唸出來的名字（螢幕閱讀器與「顯示名稱」都用它） */
  function tileName(kind, theme, palette) {
    var art = artOf(theme, palette, kind);
    var I = w.I18N;
    if (!art) return I ? I.t('tile.fallback') : '圖案';
    /* 字典 key：art.<主題>.<造型 id>；大混搭的 id 形如 fruits:apple，轉成 fruits.apple */
    var id = String(art.id);
    var key = 'art.' + (id.indexOf(':') > 0 ? id.replace(':', '.') : theme + '.' + id);
    return I ? I.t(key, null, art.label) : art.label;
  }

  /* ---------------------------------------------------------- 標題與獎盃 */

  /** LOGO 上固定用蔬果主題的兩顆，換遊戲主題不會讓招牌跟著跳 */
  function logoArt(i) {
    return w.Themes ? w.Themes.art('fruits', i).svg : '';
  }

  function tr(key) { return w.I18N ? w.I18N.t(key) : key; }

  function logo() {
    var f = 'Yuanti TC, PingFang TC, Microsoft JhengHei, Noto Sans TC, sans-serif';
    return '<svg class="logo-svg" viewBox="0 0 560 210" role="img" aria-label="' + tr('logo.title') + '">' +
      /* 左邊一塊草莓磚 */
      '<g transform="translate(16 46) rotate(-12)">' +
        '<rect x="0" y="6" width="86" height="84" rx="18" fill="#FFD9E2"/>' +
        '<rect x="0" y="0" width="86" height="84" rx="18" fill="#FFF3F5" stroke="' + INK + '" stroke-width="5"/>' +
        '<g transform="translate(43 42) scale(0.66) translate(-50 -50)">' + logoArt(5) + '</g>' +
      '</g>' +
      /* 右邊一塊鳳梨磚 */
      '<g transform="translate(458 44) rotate(11)">' +
        '<rect x="0" y="6" width="86" height="84" rx="18" fill="#FFE9B0"/>' +
        '<rect x="0" y="0" width="86" height="84" rx="18" fill="#FFF9E8" stroke="' + INK + '" stroke-width="5"/>' +
        '<g transform="translate(43 42) scale(0.66) translate(-50 -50)">' + logoArt(9) + '</g>' +
      '</g>' +
      /* 中間的連線示意：兩折的虛線 */
      '<path d="M118 62 H196 V104 H364 V62 H442" fill="none" stroke="#79C6AC" stroke-width="7" ' +
        'stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 15" opacity="0.85"/>' +
      '<text x="280" y="112" text-anchor="middle" font-size="58" font-weight="900" letter-spacing="5" ' +
        'style="paint-order:stroke;stroke:' + INK + ';stroke-width:15px;stroke-linejoin:round" fill="#FFB8CF" font-family="' + f + '">' + tr('logo.title') + '</text>' +
      '<text x="280" y="112" text-anchor="middle" font-size="58" font-weight="900" letter-spacing="5" fill="#FFF6E4" font-family="' + f + '">' + tr('logo.title') + '</text>' +
      '<text x="280" y="152" text-anchor="middle" font-size="21" font-weight="800" letter-spacing="7" fill="#7A6A88" font-family="' + f + '">' + tr('logo.sub') + '</text>' +
      '<path d="M170 176 h220" stroke="#FFB8CF" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.7"/>' +
      '</svg>';
  }

  function trophy() {
    return '<svg class="trophy-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M26 16 h48 v22 c0 15 -11 25 -24 25 s-24 -10 -24 -25 z" fill="#FFE3A0" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M26 22 h-12 v8 c0 9 6 14 13 14" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M74 22 h12 v8 c0 9 -6 14 -13 14" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="44" y="62" width="12" height="14" fill="#E7C263" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="28" y="76" width="44" height="12" rx="5" fill="#FFC2B4" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="42" cy="34" r="3" fill="' + FRUIT_INK + '"/><circle cx="58" cy="34" r="3" fill="' + FRUIT_INK + '"/>' +
      '<path d="M42 43 Q50 50 58 43" fill="none" stroke="' + FRUIT_INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* ---------------------------------------------------------- 背景裝飾 */

  function bgDeco(host) {
    var cols = ['#FFC9D8', '#BFE9DA', '#BFDDF2', '#FFE9AE', '#E0D2F5', '#FFD9C2'];
    var html = '';
    for (var i = 0; i < 16; i++) {
      var s = 26 + Math.random() * 76;
      html += '<span style="width:' + s.toFixed(0) + 'px;height:' + s.toFixed(0) + 'px;left:' +
        (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;background:' +
        cols[i % cols.length] + ';animation-duration:' + (6 + Math.random() * 7).toFixed(1) +
        's;animation-delay:-' + (Math.random() * 6).toFixed(1) + 's;opacity:' + (0.16 + Math.random() * 0.2).toFixed(2) + '"></span>';
    }
    host.innerHTML = html;
  }

  w.SvgUI = {
    PALETTE: PALETTE, INK: INK,
    decorate: decorate, decorateAll: decorateAll, repaintAll: repaintAll, paint: paint,
    setLabel: setLabel, setColor: setColor,
    tileSvg: tileSvg, tileColors: tileColors, TILE_HUES: TILE_HUES, artOf: artOf, artSvg: artSvg, tileName: tileName,
    logo: logo, trophy: trophy, bgDeco: bgDeco
  };
}(window));
