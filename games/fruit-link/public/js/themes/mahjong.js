/* ===== themes/mahjong.js — 麻將造型庫（純資料，無 DOM 相依） =====
 *
 * 一副麻將的 42 種牌：筒子 1～9、條子 1～9、萬子 1～9、梅蘭竹菊、春夏秋冬，
 * 加上東南西北中發白。
 *
 * 【為什麼這一組可以用 <text>】
 * 其他主題一律不用文字（emoji 會被作業系統換成彩色圖，長相不受控）。
 * 但萬子與字牌本來就「是字」，硬用向量描邊反而畫得四不像；中文字型全站
 * 本來就在用（介面全是繁體中文），字型堆疊也和 body 同一套，所以這裡改用
 * <text>，只有這個主題例外。筒子與條子仍然是純圖形；牌面符號用留白、細黑框與傳統配色重現實體牌。
 *
 * 【怎麼分辨】
 * 42 張牌都是同一塊象牙色牌面，所以「數量」以外還靠顏色拉開距離：
 * 筒子是黑框實心圓點（依牌面使用黑／綠／紅）、條子是黑框竹節（八條是交叉竹節）、
 * 萬子是黑色數字配紅色「萬」、字牌則使用實體牌慣用的黑／紅／綠。
 *
 * 不使用漸層（同一張盤面會貼上幾十份相同 SVG，重複 id 在消除動畫時會出問題）。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.THEME_MAHJONG = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var INK = '#3B2C22';
  var GREEN = '#2E7A4A';
  var GREEN_D = '#1E5A34';
  var RED = '#C4302B';
  var DARK = '#2B2B2B';
  /* 牌面字使用較接近實體麻將的明體／宋體；屬性值用雙引號包住，字型名稱用單引號 */
  var FONT = "'DFKai-SB','BiauKai','PMingLiU','MingLiU','Noto Serif CJK TC',serif";
  var MARK_SCALE = 0.72;       // 牌面符號縮小，留下接近實體麻將的象牙色留白
  var MARK_CENTER_Y = 48;      // 對齊前牌面（y=6～90）的幾何中心

  /** 牌身：右下先畫一塊綠色牌背當厚度，再蓋上象牙色牌面 */
  function tile(inner) {
    return '<rect x="26" y="11" width="58" height="84" rx="10" fill="#4E8A5E" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<rect x="21" y="6" width="58" height="84" rx="10" fill="#FBF6E4" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<rect x="26" y="11" width="48" height="74" rx="7" fill="#F3EAD2"/>' +
      '<path d="M26 16 A5 5 0 0 1 31 11 L69 11" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.75"/>' +
      '<g transform="translate(50 ' + MARK_CENTER_Y + ') scale(' + MARK_SCALE + ') translate(-50 -50)">' + inner + '</g>';
  }

  /** 一顆筒：實心彩色圓點，保留外框、內層亮暗層次與中心高光。 */
  function dot(cx, cy, r, color) {
    var rx = r * 0.78, innerRx = r * 0.56;
    var shade = color === RED ? '#E36B53' : (color === GREEN_D ? GREEN : '#555555');
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx.toFixed(2) + '" ry="' + r.toFixed(2) +
      '" fill="' + color + '" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + innerRx.toFixed(2) + '" ry="' + (r * 0.8).toFixed(2) +
      '" fill="' + shade + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + (cy - r * 0.18).toFixed(2) + '" rx="' + (r * 0.18).toFixed(2) +
      '" ry="' + (r * 0.22).toFixed(2) + '" fill="#FFFFFF" opacity="0.55"/>';
  }

  /** 一根條：黑色外框、彩色內芯與兩道竹節箍，接近實體牌的細線畫法。 */
  function stick(cx, cy, h, fill) {
    var w = Math.max(5.2, h * 0.34), x = cx - w / 2, y = cy - h / 2;
    return '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + h +
      '" rx="' + (w / 2).toFixed(2) + '" fill="#F3EAD2" stroke="' + INK + '" stroke-width="1.7"/>' +
      '<rect x="' + (x + 1.8).toFixed(2) + '" y="' + (y + 1.8).toFixed(2) + '" width="' + (w - 3.6).toFixed(2) +
      '" height="' + (h - 3.6).toFixed(2) + '" rx="' + Math.max(1.2, (w - 3.6) / 2).toFixed(2) +
      '" fill="none" stroke="' + fill + '" stroke-width="2.2"/>' +
      '<path d="M' + x.toFixed(2) + ' ' + (y + h * 0.3).toFixed(2) + ' h' + w.toFixed(2) +
      ' M' + x.toFixed(2) + ' ' + (y + h * 0.7).toFixed(2) + ' h' + w.toFixed(2) +
      '" stroke="' + INK + '" stroke-width="1.3"/>';
  }

  /** 八條是實體牌常見的交叉竹節，不畫成普通的兩列直條。 */
  function bamboo8() {
    function line(path, color, width) {
      return '<path d="' + path + '" fill="none" stroke="' + INK + '" stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="' + (width * 0.54).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    return '<g>' +
      line('M27 20 V80', GREEN, 8) +
      line('M73 20 V80', GREEN, 8) +
      line('M29 42 L50 21 L71 42', GREEN, 7) +
      line('M29 21 L50 42 L71 21', DARK, 7) +
      line('M29 58 L50 79 L71 58', GREEN, 7) +
      line('M29 79 L50 58 L71 79', GREEN, 7) +
      '<path d="M22 35 h10 M22 50 h10 M22 65 h10 M68 35 h10 M68 50 h10 M68 65 h10" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
      '</g>';
  }

  /** 牌面上的字。size 是字級，y 是基線 */
  function glyph(ch, y, size, fill) {
    return '<text x="50" y="' + y + '" text-anchor="middle" font-family="' + FONT + '" font-size="' + size +
      '" font-weight="700" fill="' + fill + '">' + ch + '</text>';
  }

  /** 花牌左上角的名稱、右上角的傳統編號。 */
  function cornerGlyph(ch, x, y, size, fill) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="' + FONT + '" font-size="' + size +
      '" font-weight="700" fill="' + fill + '">' + ch + '</text>';
  }

  /** 花牌與季節牌共用的牌面標題，圖案本體放在下半部。 */
  function natureTile(title, number, art) {
    return tile(cornerGlyph(title, 31, 33, 15, DARK) + cornerGlyph(number, 69, 33, 15, DARK) + art);
  }

  /** 依座標表把一組同樣大小的圖形排好 */
  function lay(spots, draw) {
    var out = '', i;
    for (i = 0; i < spots.length; i++) out += draw(spots[i][0], spots[i][1], i);
    return out;
  }

  /* 筒子的傳統排法（3 筒是斜線、7 筒是斜線加下方四點）。 */
  var DOT_SPOTS = {
    1: [[50, 50]],
    2: [[50, 35], [50, 65]],
    3: [[36, 31], [50, 50], [64, 69]],
    4: [[38, 34], [62, 34], [38, 66], [62, 66]],
    5: [[37, 32], [63, 32], [50, 50], [37, 68], [63, 68]],
    6: [[38, 28], [62, 28], [38, 50], [62, 50], [38, 72], [62, 72]],
    7: [[36, 25], [50, 31], [64, 37], [38, 56], [62, 56], [38, 74], [62, 74]],
    8: [[37, 24], [63, 24], [37, 41], [63, 41], [37, 59], [63, 59], [37, 76], [63, 76]],
    9: [[35, 28], [50, 28], [65, 28], [35, 50], [50, 50], [65, 50], [35, 72], [50, 72], [65, 72]]
  };
  /* 條子的傳統排法；八條另外用交叉竹節繪製。 */
  var BAM_SPOTS = {
    2: [[50, 35], [50, 65]],
    3: [[50, 31], [37, 67], [63, 67]],
    4: [[38, 34], [62, 34], [38, 66], [62, 66]],
    5: [[38, 31], [62, 31], [50, 50], [38, 69], [62, 69]],
    6: [[34, 36], [50, 36], [66, 36], [34, 64], [50, 64], [66, 64]],
    7: [[50, 25], [36, 43], [50, 43], [64, 43], [36, 66], [50, 66], [64, 66]],
    9: [[35, 28], [50, 28], [65, 28], [35, 50], [50, 50], [65, 50], [35, 72], [50, 72], [65, 72]]
  };
  var DOT_R = { 1: 14, 2: 11, 3: 10, 4: 10, 5: 9, 6: 8.6, 7: 7.6, 8: 7.4, 9: 7.6 };
  var STICK_H = { 2: 26, 3: 24, 4: 24, 5: 22, 6: 21, 7: 18, 9: 18 };
  /* 實體牌的留白圓環配色：黑、竹綠、朱紅三色交錯。 */
  var DOT_COLORS = {
    1: [GREEN_D],
    2: [DARK, GREEN_D],
    3: [GREEN_D, RED, DARK],
    4: [DARK, GREEN_D, GREEN_D, DARK],
    5: [DARK, GREEN_D, RED, GREEN_D, DARK],
    6: [GREEN_D, GREEN_D, RED, RED, RED, RED],
    7: [GREEN_D, GREEN_D, GREEN_D, RED, RED, RED, RED],
    8: [DARK, DARK, DARK, DARK, DARK, DARK, DARK, DARK],
    9: [GREEN_D, GREEN_D, GREEN_D, RED, RED, RED, DARK, DARK, DARK]
  };
  var BAM_COLORS = {
    2: [DARK, GREEN_D],
    3: [GREEN_D, GREEN_D, GREEN_D],
    4: [DARK, GREEN_D, GREEN_D, DARK],
    5: [DARK, GREEN_D, RED, GREEN_D, DARK],
    6: [DARK, DARK, DARK, GREEN_D, GREEN_D, GREEN_D],
    7: [RED, GREEN_D, DARK, GREEN_D, GREEN_D, DARK, GREEN_D],
    9: [DARK, RED, GREEN_D, DARK, RED, GREEN_D, DARK, RED, GREEN_D]
  };

  var NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var LIST = [];
  var n;

  /* ---- 筒子 1～9 ---- */
  for (n = 1; n <= 9; n++) {
    LIST.push((function (k) {
      var colors = DOT_COLORS[k];
      return {
        id: 'dot-' + k, label: NUM[k - 1] + '筒',
        svg: tile(lay(DOT_SPOTS[k], function (x, y, i) {
          return dot(x, y, DOT_R[k], colors[i]);
        }))
      };
    }(n)));
  }

  /* ---- 條子 1～9（一條照傳統畫成一隻鳥） ---- */
  LIST.push({
    id: 'bam-1', label: '一條',
    svg: tile('<path d="M50 30 C60 30 66 38 66 48 C66 60 58 70 50 74 C42 70 34 60 34 48 C34 38 40 30 50 30 Z" ' +
      'fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M58 34 C64 38 66 44 66 48 C66 60 58 70 50 74 C58 66 62 56 62 46 C62 40 60 36 58 34 Z" fill="' + GREEN_D + '" opacity="0.85"/>' +
      '<circle cx="50" cy="30" r="9" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<path d="M50 21 C48 15 52 12 56 14" fill="none" stroke="' + RED + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M41 30 L32 33 L41 35 Z" fill="#E8B23C" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<circle cx="53" cy="28" r="2" fill="' + INK + '"/>' +
      '<path d="M42 44 C46 50 46 58 42 64 M58 44 C54 50 54 58 58 64" fill="none" stroke="' + GREEN_D + '" stroke-width="1.8"/>' +
      '<path d="M46 74 L44 82 M54 74 L56 82" stroke="' + RED + '" stroke-width="2.4" stroke-linecap="round"/>')
  });
  for (n = 2; n <= 9; n++) {
    LIST.push((function (k) {
      if (k === 8) {
        return { id: 'bam-8', label: '八條', svg: tile(bamboo8()) };
      }
      var colors = BAM_COLORS[k];
      return {
        id: 'bam-' + k, label: NUM[k - 1] + '條',
        svg: tile(lay(BAM_SPOTS[k], function (x, y, i) {
          return stick(x, y, STICK_H[k], colors[i]);
        }))
      };
    }(n)));
  }

  /* ---- 萬子 1～9：上面是數字，下面是紅色的「萬」 ---- */
  for (n = 1; n <= 9; n++) {
    LIST.push((function (k) {
      return {
        id: 'man-' + k, label: NUM[k - 1] + '萬',
        svg: tile(glyph(NUM[k - 1], 45, 30, DARK) + glyph('萬', 80, 30, RED))
      };
    }(n)));
  }

  /* ---- 字牌：東南西北中發白 ---- */
  [['east', '東', DARK], ['south', '南', DARK], ['west', '西', DARK], ['north', '北', DARK],
    ['red', '中', RED], ['green', '發', GREEN]].forEach(function (w) {
    LIST.push({ id: 'honor-' + w[0], label: w[1], svg: tile(glyph(w[1], 66, 46, w[2])) });
  });
  /* 白板：沒有字，只有一個黑色的框 */
  LIST.push({
    id: 'honor-white', label: '白',
    svg: tile('<rect x="32" y="24" width="36" height="52" rx="4" fill="none" stroke="' + DARK + '" stroke-width="3.4"/>' +
      '<rect x="37" y="29" width="26" height="42" rx="2" fill="none" stroke="' + DARK + '" stroke-width="1.8" opacity="0.55"/>')
  });

  /* ---- 花牌與季節牌：梅蘭竹菊、春夏秋冬 ---- */
  LIST.push({
    id: 'flower-plum', label: '梅',
    svg: natureTile('梅', '1',
      '<path d="M31 78 C42 68 48 58 53 43" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M40 69 C47 66 54 64 62 64 M45 59 C39 56 35 52 32 47" fill="none" stroke="' + GREEN_D + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<g fill="none" stroke="' + RED + '" stroke-width="2" stroke-linejoin="round">' +
        '<path d="M53 43 C45 38 39 42 42 49 C35 48 33 54 39 57 C35 62 40 67 46 63 C49 69 56 67 56 61 C63 63 67 57 62 53 C67 48 62 42 56 46 Z"/>' +
      '</g><circle cx="52" cy="54" r="3" fill="#E3A33C" stroke="' + INK + '" stroke-width="1.2"/>')
  });
  LIST.push({
    id: 'flower-orchid', label: '蘭',
    svg: natureTile('蘭', '2',
      '<path d="M49 80 C49 68 51 57 56 43 M50 68 C43 62 36 59 30 57 M52 61 C61 56 68 51 72 44" fill="none" stroke="' + GREEN_D + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<g fill="none" stroke="' + RED + '" stroke-width="1.8" stroke-linejoin="round">' +
        '<path d="M55 43 C47 36 39 38 41 45 C34 41 29 46 35 51 C29 55 34 61 42 57 C42 65 50 65 54 57 C60 63 67 58 62 53 C70 50 66 43 58 47 Z"/>' +
      '</g><circle cx="53" cy="51" r="2.6" fill="#E3A33C" stroke="' + INK + '" stroke-width="1.1"/>')
  });
  LIST.push({
    id: 'flower-chrysanthemum', label: '菊',
    svg: natureTile('菊', '3',
      '<g fill="none" stroke="' + RED + '" stroke-width="1.7" stroke-linecap="round">' +
        '<path d="M50 57 C44 47 38 47 39 53 C31 49 29 54 35 58 C27 60 29 66 38 65 C32 72 38 75 44 69 C44 78 50 78 50 70 C56 78 62 74 58 68 C66 71 69 65 61 62 C69 57 65 52 59 56 C61 47 55 46 50 57 Z"/>' +
        '<path d="M50 57 C50 48 48 43 45 39 M50 57 C54 47 58 43 62 40 M50 57 C42 53 37 51 32 51 M50 57 C59 54 65 52 71 53"/>' +
      '</g><circle cx="50" cy="58" r="3.4" fill="#E3A33C" stroke="' + INK + '" stroke-width="1.2"/>')
  });
  LIST.push({
    id: 'flower-bamboo', label: '竹',
    svg: natureTile('竹', '4',
      '<g fill="none" stroke="' + GREEN_D + '" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M38 80 C39 68 37 56 39 42 M49 80 C50 65 48 52 50 36 M60 80 C59 64 62 52 61 40" stroke-width="2.4"/>' +
        '<path d="M34 51 H44 M34 65 H44 M45 49 H55 M45 63 H55 M56 53 H65 M56 67 H65" stroke-width="1.4"/>' +
        '<path d="M39 47 C31 43 27 39 25 34 C33 34 38 38 41 43 M50 43 C57 36 63 34 69 35 C64 42 58 45 51 47 M60 59 C68 53 74 52 79 55 C74 61 68 63 61 63" stroke-width="1.7"/>' +
      '</g>')
  });
  LIST.push({
    id: 'season-spring', label: '春',
    svg: natureTile('春', '1',
      '<path d="M29 78 C42 69 50 59 56 43" fill="none" stroke="' + GREEN_D + '" stroke-width="2" stroke-linecap="round"/>' +
      '<g fill="none" stroke="' + RED + '" stroke-width="1.8">' +
        '<path d="M56 43 C49 37 42 40 44 47 C37 44 33 49 39 54 C33 58 38 64 45 60 C45 68 52 68 56 60 C62 66 68 61 63 56 C70 52 65 46 59 48 C61 41 59 39 56 43 Z"/>' +
      '</g><circle cx="55" cy="53" r="2.8" fill="#E3A33C"/>')
  });
  LIST.push({
    id: 'season-summer', label: '夏',
    svg: natureTile('夏', '2',
      '<circle cx="50" cy="58" r="11" fill="none" stroke="#D98632" stroke-width="2.4"/>' +
      '<g stroke="#D98632" stroke-width="1.8" stroke-linecap="round">' +
        '<path d="M50 40 V33 M50 76 V83 M32 58 H25 M68 58 H75 M37 45 L32 40 M63 45 L68 40 M37 71 L32 76 M63 71 L68 76"/>' +
      '</g><circle cx="50" cy="58" r="4" fill="#F0B84A"/>')
  });
  LIST.push({
    id: 'season-autumn', label: '秋',
    svg: natureTile('秋', '3',
      '<path d="M50 80 C49 68 49 57 51 47" fill="none" stroke="' + GREEN_D + '" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M51 47 C42 42 34 43 29 49 C35 51 38 55 38 60 C44 58 48 54 51 49 C54 57 60 61 68 62 C67 53 61 48 51 47 Z" fill="#D65A3B" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M51 48 L43 72 M51 48 L61 70 M51 48 L34 51 M51 48 L66 57" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-linecap="round"/>')
  });
  LIST.push({
    id: 'season-winter', label: '冬',
    svg: natureTile('冬', '4',
      '<g fill="none" stroke="' + GREEN_D + '" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M50 35 V79 M31 46 L69 68 M69 46 L31 68" stroke-width="2"/>' +
        '<path d="M50 43 L45 38 M50 43 L55 38 M50 71 L45 76 M50 71 L55 76 M39 51 L32 51 M39 51 L36 45 M61 63 L68 63 M61 63 L64 69 M61 51 L68 51 M61 51 L64 45 M39 63 L32 63 M39 63 L36 69" stroke-width="1.5"/>' +
      '</g>')
  });

  return {
    key: 'mahjong',
    label: '麻將',
    emoji: '🀄',
    note: '一副 42 種麻將牌（含花牌與季節牌）；這個主題會疊起來玩',
    list: LIST
  };
}));
