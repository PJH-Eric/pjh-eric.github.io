/* ===== themes/fruits.js — 蔬果造型庫（純資料，無 DOM 相依） =====
 *
 * 寫實取向：參考真實蔬果的輪廓、顏色與細節（種子、紋路、蒂頭、切面），
 * 不畫卡通表情 —— 表情會讓每一種都變成「一顆有臉的圓球」，反而難分辨。
 *
 * 每一顆都用同一套打光：左上受光、右下陰影、底下一片接觸陰影，
 * 所以縮到平板上一格四十幾像素時仍然看得出立體感與是哪一種。
 *
 * 不使用 <linearGradient> / <radialGradient>：同一張盤面會同時貼上幾十份
 * 相同的 SVG，漸層要靠 id 參照，重複 id 在消除動畫時會出現重繪問題，
 * 所以一律用「底色 + 陰影形狀 + 打亮形狀」的疊層做出漸層感。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.THEME_FRUITS = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var INK = '#4A3226';          // 輪廓線：暖色深褐，比純黑柔和
  var LEAF = '#4E9C3F';         // 葉子
  var LEAF_D = '#3A7A2E';
  var STEM = '#6B4A2A';

  /** 接觸陰影：讓東西看起來是放在桌上的，不是浮在空中 */
  function ground(rx, cy) {
    return '<ellipse cx="50" cy="' + (cy || 93) + '" rx="' + rx + '" ry="' + (rx * 0.16).toFixed(1) +
      '" fill="#4A3226" opacity="0.13"/>';
  }
  /** 高光：左上角的一小片反光，圓潤有蠟質感的水果都用得到 */
  function gloss(cx, cy, rx, ry, rot, op) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
      '" fill="#FFFFFF" opacity="' + (op || 0.42) + '" transform="rotate(' + (rot || -30) + ' ' + cx + ' ' + cy + ')"/>';
  }
  /** 一片葉子，ang 是傾斜角度 */
  function leaf(x, y, ang, size) {
    var k = size || 1;
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + ang + ') scale(' + k + ')">' +
      '<path d="M0 0 C10 -10 26 -10 32 -2 C26 8 10 9 0 0 Z" fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M2 0 C12 -3 22 -3 30 -2" fill="none" stroke="' + LEAF_D + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '</g>';
  }
  /** 蒂頭 */
  function stem(x1, y1, x2, y2, w) {
    return '<path d="M' + x1 + ' ' + y1 + ' Q' + ((x1 + x2) / 2 - 2) + ' ' + ((y1 + y2) / 2) + ' ' + x2 + ' ' + y2 +
      '" fill="none" stroke="' + STEM + '" stroke-width="' + (w || 5) + '" stroke-linecap="round"/>';
  }

  var LIST = [
    {
      id: 'apple', label: '蘋果',
      svg: ground(27) +
        stem(50, 30, 52, 16, 5) + leaf(52, 20, -28, 0.85) +
        '<path d="M50 30 C36 22 18 28 15 46 C12 64 24 88 38 88 C44 88 46 85 50 85 C54 85 56 88 62 88 C76 88 88 64 85 46 C82 28 64 22 50 30 Z" ' +
        'fill="#D6342E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 27 C78 26 86 36 85 46 C88 64 76 88 62 88 C58 88 56 86 53 85 C70 78 78 56 74 40 C71 31 66 28 62 27 Z" fill="#A81F1C" opacity="0.85"/>' +
        '<path d="M32 40 C26 50 26 62 30 72" fill="none" stroke="#F2705F" stroke-width="4" stroke-linecap="round" opacity="0.75"/>' +
        gloss(35, 44, 9, 5.5, -38, 0.5)
    },
    {
      id: 'pear', label: '梨子',
      svg: ground(24) +
        stem(50, 26, 51, 12, 4.6) + leaf(52, 16, -34, 0.8) +
        '<path d="M50 26 C57 26 58 36 55 44 C70 52 76 68 70 80 C63 92 37 92 30 80 C24 68 30 52 45 44 C42 36 43 26 50 26 Z" ' +
        'fill="#B8D044" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M55 44 C70 52 76 68 70 80 C66 87 58 90 50 90 C62 84 68 68 63 56 C60 49 56 46 55 44 Z" fill="#8CA82C" opacity="0.8"/>' +
        '<circle cx="40" cy="64" r="1.5" fill="#7E9424" opacity="0.7"/><circle cx="48" cy="76" r="1.5" fill="#7E9424" opacity="0.7"/>' +
        '<circle cx="34" cy="74" r="1.4" fill="#7E9424" opacity="0.7"/>' +
        gloss(38, 60, 7, 12, -18, 0.4)
    },
    {
      id: 'banana', label: '香蕉',
      svg: ground(30, 90) +
        '<path d="M18 20 C14 24 14 34 18 46 C26 70 48 84 72 82 C82 81 88 76 86 70 C84 65 78 65 72 66 C54 68 38 56 32 40 C29 32 28 26 27 22 C25 17 21 16 18 20 Z" ' +
        'fill="#F2C438" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M22 30 C26 50 42 68 62 72 C68 73 72 73 76 72 C74 76 66 78 58 77 C38 74 24 56 20 36 Z" fill="#C99A18" opacity="0.75"/>' +
        '<path d="M24 26 C28 44 40 58 56 64" fill="none" stroke="#FBE27A" stroke-width="4" stroke-linecap="round" opacity="0.8"/>' +
        '<path d="M86 70 C90 68 92 72 89 75 C87 77 85 75 86 70 Z" fill="#5B4028" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M18 20 C15 15 20 12 24 16" fill="#7A5A2A" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>'
    },
    {
      id: 'orange', label: '橘子',
      svg: ground(28) +
        stem(50, 28, 50, 18, 4.4) + leaf(52, 21, -22, 0.8) +
        '<ellipse cx="50" cy="58" rx="34" ry="31" fill="#F2851E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M62 30 C76 36 84 46 84 58 C84 75 69 89 50 89 C60 84 68 72 68 56 C68 44 66 36 62 30 Z" fill="#C4600C" opacity="0.8"/>' +
        '<circle cx="34" cy="46" r="1.5" fill="#C4600C" opacity="0.6"/><circle cx="44" cy="70" r="1.5" fill="#C4600C" opacity="0.6"/>' +
        '<circle cx="60" cy="76" r="1.5" fill="#C4600C" opacity="0.6"/><circle cx="30" cy="64" r="1.5" fill="#C4600C" opacity="0.6"/>' +
        gloss(36, 44, 10, 6, -34, 0.48)
    },
    {
      id: 'grape', label: '葡萄',
      svg: ground(24) +
        stem(50, 30, 48, 16, 4.4) + leaf(50, 20, -18, 0.78) +
        '<circle cx="34" cy="46" r="12" fill="#7B3FA0" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<circle cx="58" cy="42" r="12" fill="#8C4CB2" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<circle cx="30" cy="66" r="12" fill="#6A3390" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<circle cx="70" cy="60" r="12" fill="#7B3FA0" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<circle cx="48" cy="60" r="13" fill="#9556BE" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<circle cx="50" cy="82" r="11" fill="#6A3390" stroke="' + INK + '" stroke-width="2.3"/>' +
        gloss(44, 54, 4.6, 3, -30, 0.55) + gloss(54, 37, 4, 2.6, -30, 0.5) + gloss(30, 41, 4, 2.6, -30, 0.5)
    },
    {
      id: 'strawberry', label: '草莓',
      svg: ground(24) +
        '<path d="M50 30 C34 30 20 40 20 54 C20 72 38 90 50 90 C62 90 80 72 80 54 C80 40 66 30 50 30 Z" ' +
        'fill="#E0322F" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 34 C76 40 80 47 80 54 C80 72 62 90 50 90 C62 82 70 66 70 52 C70 44 68 38 66 34 Z" fill="#AD1E1E" opacity="0.8"/>' +
        '<g fill="#FFE9A8" stroke="#B58A2A" stroke-width="0.8">' +
        '<ellipse cx="36" cy="48" rx="2" ry="2.8"/><ellipse cx="52" cy="44" rx="2" ry="2.8"/><ellipse cx="65" cy="52" rx="2" ry="2.8"/>' +
        '<ellipse cx="30" cy="62" rx="2" ry="2.8"/><ellipse cx="44" cy="60" rx="2" ry="2.8"/><ellipse cx="58" cy="66" rx="2" ry="2.8"/>' +
        '<ellipse cx="38" cy="76" rx="2" ry="2.8"/><ellipse cx="52" cy="80" rx="2" ry="2.8"/></g>' +
        '<path d="M50 32 L36 22 L46 24 L44 12 L54 22 L64 14 L60 26 L72 26 L56 34 Z" ' +
        'fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        gloss(36, 44, 7, 4, -36, 0.4)
    },
    {
      id: 'watermelon', label: '西瓜',
      svg: ground(30, 92) +
        '<path d="M8 74 A44 44 0 0 1 92 74 Z" fill="#E8455B" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M8 74 A44 44 0 0 1 92 74 L86 74 A38 38 0 0 0 14 74 Z" fill="#FFF6EA"/>' +
        '<path d="M4 74 A46 46 0 0 1 96 74 L92 82 A42 42 0 0 0 8 82 Z" fill="#2F7A34" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M14 78 C24 62 40 54 50 54 C60 54 76 62 86 78" fill="none" stroke="#5FAE4A" stroke-width="3" opacity="0.6"/>' +
        '<g fill="#2A1A12"><ellipse cx="32" cy="62" rx="2.4" ry="3.4" transform="rotate(-20 32 62)"/>' +
        '<ellipse cx="50" cy="54" rx="2.4" ry="3.4"/><ellipse cx="68" cy="62" rx="2.4" ry="3.4" transform="rotate(20 68 62)"/>' +
        '<ellipse cx="40" cy="72" rx="2.4" ry="3.4" transform="rotate(-10 40 72)"/>' +
        '<ellipse cx="60" cy="72" rx="2.4" ry="3.4" transform="rotate(10 60 72)"/></g>'
    },
    {
      id: 'peach', label: '水蜜桃',
      svg: ground(26) +
        stem(52, 28, 54, 18, 4.4) + leaf(55, 21, -26, 0.82) +
        '<path d="M50 28 C34 24 18 36 18 54 C18 74 33 90 50 90 C67 90 82 74 82 54 C82 36 66 24 50 28 Z" ' +
        'fill="#F79A78" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 27 C74 32 82 42 82 54 C82 74 67 90 50 90 C64 82 72 66 72 50 C72 38 66 30 60 27 Z" fill="#DE6A50" opacity="0.85"/>' +
        '<path d="M50 30 C46 46 46 74 52 89" fill="none" stroke="#C4503C" stroke-width="2.2" opacity="0.55"/>' +
        '<path d="M28 44 C24 54 24 66 28 74" fill="none" stroke="#FFC9A8" stroke-width="5" stroke-linecap="round" opacity="0.7"/>' +
        gloss(35, 45, 8, 5, -36, 0.45)
    },
    {
      id: 'cherry', label: '櫻桃',
      svg: ground(26) +
        '<path d="M52 20 C44 32 38 46 36 60" fill="none" stroke="#4E7A2E" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M52 20 C60 32 66 44 68 56" fill="none" stroke="#4E7A2E" stroke-width="4" stroke-linecap="round"/>' +
        leaf(54, 18, -40, 0.75) +
        '<circle cx="34" cy="70" r="19" fill="#C81F32" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="70" cy="66" r="17" fill="#AB1728" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M44 58 C50 64 52 76 46 84" fill="#96121F" opacity="0.6"/>' +
        gloss(28, 63, 6, 4, -34, 0.55) + gloss(65, 60, 5, 3.4, -34, 0.5)
    },
    {
      id: 'pineapple', label: '鳳梨',
      svg: ground(24) +
        '<path d="M50 34 C44 22 40 12 42 6 C48 10 52 20 54 30 Z" fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 34 C40 26 30 20 26 14 C34 14 44 22 52 32 Z" fill="' + LEAF_D + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 34 C60 26 70 20 74 14 C66 14 56 22 48 32 Z" fill="' + LEAF_D + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 32 C54 20 58 12 62 8 C64 16 58 26 54 34 Z" fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="62" rx="27" ry="29" fill="#E8A420" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M62 36 C72 42 77 52 77 62 C77 78 65 91 50 91 C60 84 66 72 66 60 C66 48 64 40 62 36 Z" fill="#BE7C0C" opacity="0.8"/>' +
        '<g fill="none" stroke="#8A5A08" stroke-width="1.8" opacity="0.85">' +
        '<path d="M26 50 L48 78 M38 38 L70 74 M56 34 L76 60 M74 46 L62 34"/>' +
        '<path d="M74 50 L52 78 M62 36 L30 74 M44 34 L24 60 M26 46 L38 34"/></g>' +
        gloss(36, 48, 6, 9, -22, 0.3)
    },
    {
      id: 'lemon', label: '檸檬',
      svg: ground(28) +
        leaf(58, 26, -30, 0.8) +
        '<path d="M50 28 C70 28 86 42 86 58 C86 74 70 88 50 88 C30 88 14 74 14 58 C14 42 30 28 50 28 Z" ' +
        'fill="#F5D021" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M86 58 C90 56 93 57 94 58 C93 60 90 61 86 59 Z" fill="#D8B00C" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M14 58 C10 56 7 57 6 58 C7 60 10 61 14 59 Z" fill="#D8B00C" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M66 32 C78 38 86 48 86 58 C86 74 70 88 50 88 C68 84 78 70 78 56 C78 44 72 36 66 32 Z" fill="#D8B00C" opacity="0.8"/>' +
        '<g fill="#C9A20A" opacity="0.5"><circle cx="34" cy="48" r="1.4"/><circle cx="46" cy="66" r="1.4"/><circle cx="62" cy="72" r="1.4"/></g>' +
        gloss(36, 46, 10, 5, -28, 0.5)
    },
    {
      id: 'kiwi', label: '奇異果',
      svg: ground(28) +
        '<circle cx="50" cy="56" r="34" fill="#8A6236" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="50" cy="56" r="29" fill="#B7D45C"/>' +
        '<circle cx="50" cy="56" r="27" fill="none" stroke="#9CBF44" stroke-width="2"/>' +
        '<circle cx="50" cy="56" r="10" fill="#F2F5DC"/>' +
        '<g fill="#2A2416"><ellipse cx="50" cy="36" rx="1.7" ry="2.6"/><ellipse cx="64" cy="41" rx="1.7" ry="2.6" transform="rotate(35 64 41)"/>' +
        '<ellipse cx="70" cy="56" rx="1.7" ry="2.6" transform="rotate(90 70 56)"/><ellipse cx="64" cy="71" rx="1.7" ry="2.6" transform="rotate(140 64 71)"/>' +
        '<ellipse cx="50" cy="76" rx="1.7" ry="2.6"/><ellipse cx="36" cy="71" rx="1.7" ry="2.6" transform="rotate(40 36 71)"/>' +
        '<ellipse cx="30" cy="56" rx="1.7" ry="2.6" transform="rotate(90 30 56)"/><ellipse cx="36" cy="41" rx="1.7" ry="2.6" transform="rotate(140 36 41)"/></g>' +
        '<g stroke="#DCE9A8" stroke-width="1.6" opacity="0.9">' +
        '<path d="M50 46 L50 30 M58 48 L68 38 M60 56 L74 56 M58 64 L68 74 M50 66 L50 82 M42 64 L32 74 M40 56 L26 56 M42 48 L32 38"/></g>'
    },
    {
      id: 'mango', label: '芒果',
      svg: ground(27) +
        stem(64, 28, 66, 18, 4.2) + leaf(66, 21, -34, 0.78) +
        '<path d="M64 28 C82 34 90 52 84 68 C77 86 52 92 34 84 C16 76 12 56 22 42 C31 30 50 24 64 28 Z" ' +
        'fill="#F0A21C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M40 30 C56 26 74 32 82 44 C86 52 86 60 84 68 C77 86 52 92 34 84 C58 84 76 70 78 54 C79 42 70 32 40 30 Z" fill="#D2711A" opacity="0.75"/>' +
        '<path d="M30 44 C40 34 54 30 66 32" fill="none" stroke="#F7D45E" stroke-width="6" stroke-linecap="round" opacity="0.7"/>' +
        '<path d="M22 62 C26 74 38 82 52 84" fill="none" stroke="#B94E14" stroke-width="2.4" opacity="0.45"/>' +
        gloss(38, 44, 9, 5, -32, 0.4)
    },
    {
      id: 'blueberry', label: '藍莓',
      svg: ground(26) +
        '<circle cx="34" cy="62" r="19" fill="#3A4E8C" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="68" cy="68" r="16" fill="#2F4278" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="52" cy="42" r="21" fill="#4A61A6" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M52 30 L56 36 L63 37 L57 41 L59 48 L52 44 L45 48 L47 41 L41 37 L48 36 Z" fill="#25315C" opacity="0.9"/>' +
        '<circle cx="52" cy="42" r="21" fill="none" stroke="#7B8FCB" stroke-width="1.6" opacity="0.5"/>' +
        gloss(44, 33, 6, 4, -34, 0.45) + gloss(28, 55, 5, 3.4, -34, 0.4) + gloss(63, 62, 4.4, 3, -34, 0.4)
    },
    {
      id: 'avocado', label: '酪梨',
      svg: ground(24) +
        stem(50, 20, 50, 12, 4) +
        '<path d="M50 20 C58 22 60 32 56 40 C74 50 80 70 70 82 C60 93 40 93 30 82 C20 70 26 50 44 40 C40 32 42 22 50 20 Z" ' +
        'fill="#3E7A2C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M56 40 C74 50 80 70 70 82 C64 89 56 92 48 92 C62 86 70 70 66 56 C63 47 58 42 56 40 Z" fill="#2C5C1E" opacity="0.85"/>' +
        '<path d="M50 34 C60 42 70 56 68 70 C66 84 56 90 48 90 C38 90 30 82 30 70 C30 56 40 42 50 34 Z" fill="#CFE07A"/>' +
        '<circle cx="49" cy="68" r="13" fill="#8A5A2A" stroke="#6B4520" stroke-width="2"/>' +
        gloss(43, 60, 4.4, 3, -30, 0.5)
    },
    {
      id: 'coconut', label: '椰子',
      svg: ground(28) +
        '<circle cx="50" cy="58" r="33" fill="#7A5230" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 32 C78 40 83 50 83 58 C83 76 68 91 50 91 C62 84 70 72 70 56 C70 44 68 36 66 32 Z" fill="#573719" opacity="0.85"/>' +
        '<g stroke="#5C3C1E" stroke-width="1.8" opacity="0.7" fill="none">' +
        '<path d="M32 34 C36 50 36 68 32 82 M50 26 C48 46 48 70 50 90 M68 34 C64 50 64 68 68 82"/></g>' +
        '<path d="M22 58 A28 28 0 0 1 78 58 Z" fill="#FFF8ED" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M28 56 A22 22 0 0 1 72 56 Z" fill="#E8DCC6"/>' +
        '<circle cx="38" cy="44" r="3" fill="#4A3226" opacity="0.75"/><circle cx="50" cy="40" r="3" fill="#4A3226" opacity="0.75"/>' +
        gloss(34, 40, 7, 4.4, -34, 0.3)
    },
    {
      id: 'papaya', label: '木瓜',
      svg: ground(24) +
        stem(50, 18, 50, 10, 4) +
        '<path d="M50 18 C66 24 78 44 78 62 C78 80 66 91 50 91 C34 91 22 80 22 62 C22 44 34 24 50 18 Z" ' +
        'fill="#E8A83C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 24 C72 34 78 48 78 62 C78 80 66 91 50 91 C64 84 70 72 70 58 C70 42 64 30 60 24 Z" fill="#C77F1E" opacity="0.8"/>' +
        '<path d="M50 26 C60 34 68 48 68 62 C68 78 60 88 50 88 C40 88 32 78 32 62 C32 48 40 34 50 26 Z" fill="#F0743C" opacity="0.9"/>' +
        '<g fill="#2A2018"><circle cx="50" cy="56" r="3"/><circle cx="43" cy="66" r="3"/><circle cx="57" cy="66" r="3"/>' +
        '<circle cx="50" cy="74" r="3"/><circle cx="44" cy="48" r="2.4"/><circle cx="56" cy="48" r="2.4"/></g>' +
        gloss(35, 46, 6, 10, -18, 0.32)
    },
    {
      id: 'persimmon', label: '柿子',
      svg: ground(30, 90) +
        '<path d="M50 26 C50 22 51 20 53 19" fill="none" stroke="' + STEM + '" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="50" cy="62" rx="35" ry="27" fill="#E05A0E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 40 C80 46 85 53 85 62 C85 78 69 89 50 89 C66 84 73 74 73 60 C73 49 69 44 66 40 Z" fill="#B03A04" opacity="0.85"/>' +
        '<path d="M50 27 C58 22 70 24 74 30 C70 36 60 38 52 35 C56 40 56 46 53 49 C50 46 48 41 48 36 ' +
        'C48 41 46 46 43 49 C40 46 40 40 44 35 C36 38 26 36 22 30 C26 24 38 22 46 27 Z" ' +
        'fill="#5E7A32" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 30 L50 42" stroke="#415622" stroke-width="2"/>' +
        gloss(33, 54, 10, 5.5, -32, 0.42)
    },
    {
      id: 'carrot', label: '紅蘿蔔',
      svg: ground(16, 94) +
        '<path d="M50 34 C44 22 34 14 26 14 C28 24 38 32 48 34 Z" fill="' + LEAF_D + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 34 C56 22 66 14 74 14 C72 24 62 32 52 34 Z" fill="' + LEAF_D + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 32 C46 20 48 10 50 6 C54 12 54 22 52 32 Z" fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M32 34 L68 34 L54 88 C53 92 47 92 46 88 Z" fill="#EE7118" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M56 34 L68 34 L54 88 C53 91 50 92 48 91 Z" fill="#C4520A" opacity="0.8"/>' +
        '<g stroke="#A8420A" stroke-width="1.8" opacity="0.6" stroke-linecap="round">' +
        '<path d="M38 46 L46 44 M42 58 L52 56 M46 70 L54 68"/></g>' +
        gloss(40, 48, 3.4, 9, -8, 0.35)
    },
    {
      id: 'tomato', label: '番茄',
      svg: ground(30, 90) +
        '<path d="M50 30 C48 24 50 20 53 19" fill="none" stroke="#4E7A2E" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="50" cy="60" rx="36" ry="29" fill="#E63329" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M68 38 C81 45 86 52 86 60 C86 78 70 90 50 90 C66 84 74 74 74 58 C74 47 71 42 68 38 Z" fill="#AD1712" opacity="0.82"/>' +
        '<path d="M50 31 C56 26 64 26 70 30 C68 36 62 39 56 38 C60 42 60 46 58 49 C54 46 51 41 50 36 ' +
        'C49 41 46 46 42 49 C40 46 40 42 44 38 C38 39 32 36 30 30 C36 26 44 26 50 31 Z" ' +
        'fill="#4E8032" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        gloss(33, 50, 10, 6, -34, 0.5)
    },
    {
      id: 'broccoli', label: '花椰菜',
      svg: ground(24) +
        '<path d="M42 56 L58 56 L56 86 C56 90 44 90 44 86 Z" fill="#B8D07A" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M52 56 L58 56 L56 86 C56 89 53 90 50 90 Z" fill="#94AC58" opacity="0.8"/>' +
        '<circle cx="28" cy="48" r="15" fill="#2F6B2A" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="72" cy="48" r="15" fill="#2A5F26" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="50" cy="36" r="17" fill="#3A7F32" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="36" cy="58" r="13" fill="#357528" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="64" cy="58" r="13" fill="#2F6B2A" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<g fill="#5FA84A" opacity="0.85"><circle cx="44" cy="30" r="3.4"/><circle cx="56" cy="34" r="3"/>' +
        '<circle cx="26" cy="44" r="3"/><circle cx="70" cy="44" r="3"/><circle cx="34" cy="56" r="2.6"/><circle cx="62" cy="56" r="2.6"/></g>'
    },
    {
      id: 'corn', label: '玉米',
      svg: ground(20, 94) +
        '<path d="M34 34 C18 44 14 70 24 88 C34 78 36 54 34 34 Z" fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M66 34 C82 44 86 70 76 88 C66 78 64 54 66 34 Z" fill="' + LEAF_D + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M50 12 C64 12 72 26 72 50 C72 74 64 90 50 90 C36 90 28 74 28 50 C28 26 36 12 50 12 Z" ' +
        'fill="#F2CB2E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M58 14 C68 20 72 32 72 50 C72 74 64 90 50 90 C60 84 64 70 64 48 C64 30 62 20 58 14 Z" fill="#CFA20E" opacity="0.8"/>' +
        '<g stroke="#C29A10" stroke-width="1.6" opacity="0.8" fill="none">' +
        '<path d="M30 30 H70 M28 44 H72 M28 58 H72 M30 72 H70 M40 14 V88 M50 12 V90 M60 14 V88"/></g>' +
        '<path d="M50 12 C48 6 52 2 56 4" fill="none" stroke="#C9A64E" stroke-width="3" stroke-linecap="round"/>'
    },
    {
      id: 'pumpkin', label: '南瓜',
      svg: ground(30) +
        '<path d="M46 34 L46 24 C46 20 54 20 54 24 L54 34 Z" fill="#4E7A2E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="62" rx="36" ry="28" fill="#EE8B18" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M68 38 C80 46 86 54 86 62 C86 78 70 90 50 90 C66 84 74 74 74 60 C74 48 71 42 68 38 Z" fill="#C4650A" opacity="0.8"/>' +
        '<g fill="none" stroke="#B8600A" stroke-width="2.2" opacity="0.7">' +
        '<path d="M32 40 C25 48 25 76 32 84 M50 34 C46 46 46 78 50 90 M68 40 C75 48 75 76 68 84"/></g>' +
        gloss(34, 50, 8, 6, -30, 0.35)
    },
    {
      id: 'eggplant', label: '茄子',
      svg: ground(22) +
        '<path d="M56 30 C74 34 84 52 78 70 C72 88 48 94 34 86 C20 78 18 58 28 46 C36 36 46 28 56 30 Z" ' +
        'fill="#6B3A8C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 34 C78 42 84 56 78 70 C72 88 48 94 34 86 C56 88 72 76 74 60 C75 48 70 38 64 34 Z" fill="#4E2668" opacity="0.85"/>' +
        '<path d="M32 50 C38 42 46 36 54 34" fill="none" stroke="#A87ACC" stroke-width="5" stroke-linecap="round" opacity="0.6"/>' +
        '<path d="M50 32 C44 22 46 14 52 10 C60 14 64 24 62 32 Z" fill="#4E7A2E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M56 14 L58 6" stroke="' + STEM + '" stroke-width="4" stroke-linecap="round"/>'
    },
    {
      id: 'potato', label: '馬鈴薯',
      svg: ground(28) +
        '<path d="M18 58 C14 40 30 26 52 26 C74 26 88 40 86 60 C84 80 68 90 50 90 C30 90 21 76 18 58 Z" ' +
        'fill="#C99A5E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 28 C78 32 87 44 86 60 C84 80 68 90 50 90 C68 84 76 70 74 54 C72 40 68 32 62 28 Z" fill="#A47540" opacity="0.8"/>' +
        '<g fill="#8A5F2E" opacity="0.75"><ellipse cx="34" cy="44" rx="4" ry="2.8" transform="rotate(-20 34 44)"/>' +
        '<ellipse cx="66" cy="72" rx="4" ry="2.8" transform="rotate(20 66 72)"/>' +
        '<ellipse cx="62" cy="42" rx="3.2" ry="2.2"/><ellipse cx="36" cy="72" rx="3.2" ry="2.2"/></g>' +
        gloss(38, 42, 9, 5, -30, 0.3)
    },
    {
      id: 'onion', label: '洋蔥',
      svg: ground(26) +
        '<path d="M50 22 C52 30 56 34 62 38 C76 46 82 58 82 68 C82 82 68 92 50 92 C32 92 18 82 18 68 C18 58 24 46 38 38 C44 34 48 30 50 22 Z" ' +
        'fill="#B87ABF" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 38 C76 46 82 58 82 68 C82 82 68 92 50 92 C68 88 74 76 72 64 C70 52 66 42 62 38 Z" fill="#8E5296" opacity="0.8"/>' +
        '<g fill="none" stroke="#8E5296" stroke-width="2" opacity="0.65">' +
        '<path d="M34 46 C28 58 28 78 36 88 M66 46 C72 58 72 78 64 88 M50 34 C48 50 48 76 50 92"/></g>' +
        '<path d="M50 22 C44 14 40 10 36 10 C38 16 44 20 50 22 Z" fill="#4E7A2E" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 22 C56 14 60 10 64 10 C62 16 56 20 50 22 Z" fill="#5E8C36" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        gloss(34, 56, 5, 10, -14, 0.35)
    },
    {
      id: 'mushroom', label: '香菇',
      svg: ground(22) +
        '<path d="M38 54 L62 54 L60 82 C60 88 40 88 40 82 Z" fill="#EFE3CB" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M54 54 L62 54 L60 82 C60 86 56 88 52 88 Z" fill="#CFBE9C" opacity="0.8"/>' +
        '<path d="M12 56 C12 32 28 18 50 18 C72 18 88 32 88 56 C70 62 30 62 12 56 Z" ' +
        'fill="#8A5230" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 20 C80 26 88 40 88 56 C78 59 68 60 58 61 C70 56 74 38 64 20 Z" fill="#653A1E" opacity="0.8"/>' +
        '<g fill="#C9A276" opacity="0.9"><ellipse cx="30" cy="34" rx="7" ry="4.6" transform="rotate(-16 30 34)"/>' +
        '<ellipse cx="60" cy="30" rx="6" ry="4" transform="rotate(10 60 30)"/><ellipse cx="44" cy="44" rx="5" ry="3.4"/></g>'
    },
    {
      id: 'pepper', label: '甜椒',
      svg: ground(28) +
        '<path d="M50 22 C48 16 45 12 41 10" fill="none" stroke="' + STEM + '" stroke-width="4.6" stroke-linecap="round"/>' +
        '<path d="M50 30 C41 21 32 19 28 23 C33 30 41 33 50 32 C59 33 67 30 72 23 C68 19 59 21 50 30 Z" ' +
        'fill="#4E7A2E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M50 32 C28 32 14 43 14 58 C14 70 19 79 26 84 C31 87 36 85 37 79 C40 86 44 89 50 89 ' +
        'C56 89 60 86 63 79 C64 85 69 87 74 84 C81 79 86 70 86 58 C86 43 72 32 50 32 Z" ' +
        'fill="#F2B415" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 35 C80 42 86 49 86 58 C86 70 81 79 74 84 C69 87 64 85 63 79 C77 72 81 57 76 46 ' +
        'C73 40 69 36 66 35 Z" fill="#C4870A" opacity="0.85"/>' +
        '<g fill="none" stroke="#C4870A" stroke-width="2.6" opacity="0.6">' +
        '<path d="M37 79 C32 66 32 46 39 36 M63 79 C68 66 68 46 61 36"/></g>' +
        gloss(32, 50, 6.5, 13, -12, 0.5)
    },
    {
      id: 'cucumber', label: '小黃瓜',
      svg: ground(18, 94) +
        '<path d="M50 10 C64 10 72 22 72 40 L72 66 C72 84 64 92 50 92 C36 92 28 84 28 66 L28 40 C28 22 36 10 50 10 Z" ' +
        'fill="#3F8236" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 12 C68 18 72 28 72 40 L72 66 C72 84 64 92 50 92 C62 88 64 76 64 62 L64 34 C64 22 62 16 60 12 Z" fill="#2C6326" opacity="0.85"/>' +
        '<path d="M36 24 C34 36 34 62 36 78" fill="none" stroke="#7FBF62" stroke-width="4" stroke-linecap="round" opacity="0.7"/>' +
        '<g fill="#2C6326" opacity="0.6"><ellipse cx="44" cy="30" rx="2.4" ry="1.6"/><ellipse cx="56" cy="44" rx="2.4" ry="1.6"/>' +
        '<ellipse cx="42" cy="58" rx="2.4" ry="1.6"/><ellipse cx="56" cy="72" rx="2.4" ry="1.6"/></g>' +
        '<path d="M50 10 C48 4 52 2 54 4" fill="none" stroke="' + STEM + '" stroke-width="3.4" stroke-linecap="round"/>'
    },
    {
      id: 'cabbage', label: '高麗菜',
      svg: ground(30) +
        '<circle cx="50" cy="58" r="34" fill="#8FBF5A" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 32 C80 40 84 50 84 58 C84 77 69 92 50 92 C66 84 74 72 74 56 C74 44 70 36 66 32 Z" fill="#6B9A3C" opacity="0.8"/>' +
        '<path d="M50 24 C34 30 26 44 28 60 C30 76 40 88 50 90 C60 88 70 76 72 60 C74 44 66 30 50 24 Z" fill="#B5D982"/>' +
        '<g fill="none" stroke="#7FAE4C" stroke-width="2.2" opacity="0.9">' +
        '<path d="M50 26 C42 40 40 66 48 88 M50 26 C60 40 62 66 54 88 M32 44 C42 52 44 70 42 84 M68 44 C58 52 56 70 58 84"/></g>' +
        '<path d="M50 26 C46 46 46 70 50 90" fill="none" stroke="#F0F7DC" stroke-width="3" stroke-linecap="round" opacity="0.85"/>'
    },
    {
      id: 'peas', label: '豌豆',
      svg: ground(28, 88) +
        '<path d="M10 46 C10 72 28 86 50 86 C72 86 90 72 90 46 C74 60 26 60 10 46 Z" ' +
        'fill="#4E9C3F" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M90 46 C90 72 72 86 50 86 C42 86 34 85 28 82 C56 82 76 68 82 46 Z" fill="#357A2A" opacity="0.85"/>' +
        '<circle cx="26" cy="50" r="12" fill="#8FCB5A" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<circle cx="50" cy="44" r="14" fill="#9CD666" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<circle cx="74" cy="50" r="12" fill="#8FCB5A" stroke="' + INK + '" stroke-width="2.3"/>' +
        gloss(22, 45, 4, 2.8, -34, 0.5) + gloss(45, 38, 4.6, 3, -34, 0.5) + gloss(70, 45, 4, 2.8, -34, 0.5) +
        '<path d="M10 46 C6 42 6 36 10 34" fill="none" stroke="' + STEM + '" stroke-width="3.4" stroke-linecap="round"/>'
    },
    {
      id: 'radish', label: '白蘿蔔',
      svg: ground(16, 94) +
        '<path d="M50 32 C42 20 32 12 24 12 C26 22 36 30 46 32 Z" fill="' + LEAF_D + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 32 C58 20 68 12 76 12 C74 22 64 30 54 32 Z" fill="' + LEAF_D + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 30 C46 18 48 8 50 4 C54 10 54 20 52 30 Z" fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M32 34 C32 54 40 74 46 86 C48 91 52 91 54 86 C60 74 68 54 68 34 Z" ' +
        'fill="#FBF6EC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M56 34 L68 34 C68 54 60 74 54 86 C53 89 51 90 50 90 C58 74 62 52 56 34 Z" fill="#DCD2C0" opacity="0.85"/>' +
        '<g stroke="#C9BFA8" stroke-width="1.6" opacity="0.8"><path d="M38 46 L44 44 M40 60 L48 58 M44 74 L50 72"/></g>'
    },
    {
      id: 'guava', label: '芭樂',
      svg: ground(27) +
        stem(50, 30, 50, 20, 4.2) + leaf(52, 23, -28, 0.78) +
        '<path d="M50 30 C32 32 20 46 20 62 C20 78 33 90 50 90 C67 90 80 78 80 62 C80 46 68 32 50 30 Z" ' +
        'fill="#9CBF4A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 33 C74 40 80 50 80 62 C80 78 67 90 50 90 C66 84 72 72 72 58 C72 46 67 37 62 33 Z" fill="#78993A" opacity="0.8"/>' +
        '<g fill="#7E9C32" opacity="0.55"><circle cx="34" cy="52" r="1.6"/><circle cx="44" cy="70" r="1.6"/>' +
        '<circle cx="62" cy="76" r="1.6"/><circle cx="30" cy="70" r="1.4"/></g>' +
        gloss(36, 50, 8, 5, -32, 0.4)
    },
    {
      id: 'dragonfruit', label: '火龍果',
      svg: ground(24) +
        '<path d="M22 42 C14 34 12 26 16 22 C24 24 30 34 30 44 Z" fill="#7FBF4A" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M78 42 C86 34 88 26 84 22 C76 24 70 34 70 44 Z" fill="#6BA83C" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M20 66 C12 64 6 58 8 52 C18 52 26 60 28 68 Z" fill="#7FBF4A" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M80 66 C88 64 94 58 92 52 C82 52 74 60 72 68 Z" fill="#6BA83C" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M50 18 C68 24 80 42 80 60 C80 79 67 92 50 92 C33 92 20 79 20 60 C20 42 32 24 50 18 Z" ' +
        'fill="#D8306B" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 24 C74 34 80 46 80 60 C80 79 67 92 50 92 C66 86 72 74 72 58 C72 42 68 30 62 24 Z" fill="#A81C4E" opacity="0.85"/>' +
        '<ellipse cx="46" cy="58" rx="17" ry="22" fill="#FBF3F6"/>' +
        '<g fill="#2A2018"><circle cx="42" cy="46" r="1.7"/><circle cx="52" cy="52" r="1.7"/><circle cx="40" cy="60" r="1.7"/>' +
        '<circle cx="50" cy="66" r="1.7"/><circle cx="44" cy="72" r="1.7"/><circle cx="36" cy="52" r="1.5"/></g>'
    },
    {
      id: 'melon', label: '哈密瓜',
      svg: ground(29) +
        stem(50, 28, 50, 18, 4.4) +
        '<circle cx="50" cy="58" r="33" fill="#CFD96B" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 32 C79 40 83 50 83 58 C83 76 68 91 50 91 C64 84 70 74 70 58 C70 44 68 36 66 32 Z" fill="#A8B448" opacity="0.8"/>' +
        '<g fill="none" stroke="#F2F7DC" stroke-width="2.2" opacity="0.95" stroke-linecap="round">' +
        '<path d="M22 44 C34 50 50 52 64 46 M18 60 C32 68 56 68 74 58 M26 74 C38 80 58 80 72 72 M30 34 C40 40 54 40 66 34"/>' +
        '<path d="M34 30 C30 44 30 70 36 86 M56 27 C52 44 52 72 58 88 M74 40 C70 52 70 66 74 76"/></g>' +
        gloss(36, 44, 8, 5, -32, 0.32)
    },
    {
      id: 'durian', label: '榴槤',
      svg: ground(24) +
        stem(50, 22, 50, 12, 5) +
        '<path d="M50 22 L60 30 L72 26 L70 38 L82 44 L72 52 L80 64 L66 64 L62 78 L50 70 L38 78 L34 64 L20 64 L28 52 L18 44 ' +
        'L30 38 L28 26 L40 30 Z" fill="#B59A34" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 30 L72 26 L70 38 L82 44 L72 52 L80 64 L66 64 L62 78 L50 70 C64 66 72 52 70 40 C69 34 64 31 60 30 Z" fill="#8A741E" opacity="0.8"/>' +
        '<g fill="none" stroke="#D6BC58" stroke-width="2" opacity="0.85" stroke-linecap="round">' +
        '<path d="M42 42 L48 48 M58 42 L52 48 M42 60 L48 54 M58 60 L52 54 M50 36 L50 44 M50 66 L50 58"/></g>'
    },
    {
      id: 'pomegranate', label: '石榴',
      svg: ground(28) +
        '<path d="M50 24 L50 14 M42 18 L50 12 L58 18" fill="none" stroke="#7A4A26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="58" r="33" fill="#C42D3A" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 32 C79 40 83 50 83 58 C83 76 68 91 50 91 C64 84 70 74 70 58 C70 44 68 36 66 32 Z" fill="#96181F" opacity="0.85"/>' +
        '<path d="M34 60 C34 46 44 38 54 40 C64 42 70 54 66 66 C62 78 48 82 40 76 C34 71 34 65 34 60 Z" fill="#8A1220" opacity="0.5"/>' +
        '<g fill="#F2647A" opacity="0.9"><circle cx="42" cy="52" r="3.4"/><circle cx="54" cy="50" r="3"/>' +
        '<circle cx="48" cy="62" r="3.4"/><circle cx="60" cy="62" r="3"/><circle cx="40" cy="66" r="3"/><circle cx="52" cy="72" r="3"/></g>' +
        gloss(34, 46, 8, 5, -32, 0.38)
    },
    {
      id: 'sweet-potato', label: '地瓜',
      svg: ground(28) +
        '<path d="M16 62 C10 44 26 28 50 26 C74 24 90 36 88 54 C86 74 66 86 46 86 C30 86 20 76 16 62 Z" ' +
        'fill="#A8477A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 27 C80 32 89 42 88 54 C86 74 66 86 46 86 C68 82 78 68 78 52 C78 38 72 30 64 27 Z" fill="#7E2F5C" opacity="0.85"/>' +
        '<path d="M88 54 C94 52 97 48 96 44 C90 44 86 48 84 52 Z" fill="#7E2F5C" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<g stroke="#7E2F5C" stroke-width="1.8" opacity="0.7" stroke-linecap="round">' +
        '<path d="M32 44 C40 42 48 42 54 44 M56 68 C64 66 70 62 74 58"/></g>' +
        gloss(36, 44, 10, 5, -22, 0.3)
    },
    {
      id: 'garlic', label: '大蒜',
      svg: ground(25) +
        '<path d="M50 20 C46 12 50 4 56 6" fill="none" stroke="#9CA86A" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M50 20 C44 26 40 32 38 40 C24 48 20 64 26 76 C32 88 44 92 50 92 C56 92 68 88 74 76 ' +
        'C80 64 76 48 62 40 C60 32 56 26 50 20 Z" fill="#F5F0E4" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 40 C76 48 80 64 74 76 C68 88 56 92 50 92 C60 88 66 78 66 66 C66 54 64 45 62 40 Z" fill="#D4CAB4" opacity="0.85"/>' +
        '<g fill="none" stroke="#C2B69A" stroke-width="2.4" opacity="0.95" stroke-linecap="round">' +
        '<path d="M38 40 C32 54 32 76 38 90 M62 40 C68 54 68 76 62 90 M50 22 C48 46 48 74 50 92"/></g>' +
        '<path d="M28 78 C34 84 42 88 50 88" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.55"/>' +
        gloss(37, 52, 4.6, 10, -12, 0.4)
    },
    {
      id: 'chili', label: '辣椒',
      svg: ground(20, 92) +
        '<path d="M42 22 C36 14 42 8 48 12" fill="none" stroke="#4E7A2E" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M34 24 C46 18 58 22 58 30 C58 35 46 35 38 31 Z" fill="#4E7A2E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M46 30 C66 34 78 52 74 72 C70 88 54 94 44 86 C32 76 30 56 34 42 C36 34 40 29 46 30 Z" ' +
        'fill="#DC2A22" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M56 33 C70 42 78 58 74 72 C70 88 54 94 44 86 C58 88 68 76 68 62 C68 46 62 37 56 33 Z" fill="#A5140F" opacity="0.85"/>' +
        '<path d="M42 40 C38 52 38 68 44 80" fill="none" stroke="#F5806E" stroke-width="4" stroke-linecap="round" opacity="0.7"/>'
    },
    {
      id: 'scallion', label: '蔥',
      svg: ground(18, 94) +
        '<path d="M38 48 C28 32 26 14 30 6 C38 14 42 32 44 48 Z" fill="' + LEAF_D + '" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M62 48 C72 32 74 14 70 6 C62 14 58 32 56 48 Z" fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M50 46 C46 30 48 10 50 4 C54 12 54 32 52 46 Z" fill="#5E9C42" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M38 48 L62 48 L60 84 C60 90 40 90 40 84 Z" fill="#F5F7EA" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M54 48 L62 48 L60 84 C60 88 56 90 52 90 Z" fill="#D8DCC4" opacity="0.85"/>' +
        '<g stroke="#B8BFA0" stroke-width="2" opacity="0.85" stroke-linecap="round">' +
        '<path d="M42 90 L40 96 M50 90 L50 97 M58 90 L60 96"/></g>'
    },
    {
      id: 'bitter-melon', label: '苦瓜',
      svg: ground(20, 94) +
        '<path d="M50 12 C46 6 40 8 40 14" fill="none" stroke="' + STEM + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M50 14 C66 20 76 40 76 60 C76 80 65 92 50 92 C35 92 24 80 24 60 C24 40 34 20 50 14 Z" ' +
        'fill="#9CC44A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 19 C70 30 76 44 76 60 C76 80 65 92 50 92 C64 86 70 74 70 58 C70 40 65 27 60 19 Z" fill="#7BA030" opacity="0.85"/>' +
        '<g fill="none" stroke="#6B8F26" stroke-width="2.6" opacity="0.9" stroke-linecap="round">' +
        '<path d="M36 26 C32 42 32 70 38 88 M50 18 C48 40 48 70 50 90 M64 26 C68 42 68 70 62 88"/></g>' +
        '<g fill="#C4DE7A"><ellipse cx="32" cy="44" rx="3" ry="4.4"/><ellipse cx="42" cy="62" rx="3" ry="4.4"/>' +
        '<ellipse cx="58" cy="40" rx="3" ry="4.4"/><ellipse cx="68" cy="60" rx="3" ry="4.4"/><ellipse cx="44" cy="30" rx="2.6" ry="3.8"/></g>'
    }
  ];

  /* ---- 第二批：再加 18 種，蔬果的造型池從 42 種變成 60 種 ----
     挑選原則和上面一樣：輪廓、顏色、切面至少要有一項和既有的拉開，
     所以這批刻意多放「切面」（無花果、百香果、蓮藕、秋葵）與
     「長條狀」（芹菜、蘆筍、竹筍），避免又多出一堆圓球。 */
  var MORE = [
    {
      id: 'plum', label: '李子',
      svg: ground(25) + stem(50, 28, 53, 15, 4) + leaf(53, 19, -26, 0.7) +
        '<ellipse cx="50" cy="57" rx="29" ry="31" fill="#6E2E63" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M62 30 C74 38 79 47 79 58 C79 76 66 88 50 88 C65 82 73 70 73 56 C73 45 68 35 62 30 Z" fill="#4A1A45" opacity="0.85"/>' +
        '<path d="M50 27 C45 42 45 73 50 88" fill="none" stroke="#3C1339" stroke-width="2.6" opacity="0.75"/>' +
        gloss(37, 45, 9, 5.5, -34, 0.34)
    },
    {
      id: 'fig', label: '無花果',
      svg: ground(23, 94) + stem(50, 18, 50, 8, 4) +
        '<path d="M50 14 C64 26 79 46 79 63 C79 81 66 91 50 91 C34 91 21 81 21 63 C21 46 36 26 50 14 Z" ' +
        'fill="#6E3060" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M50 23 C62 33 73 49 73 63 C73 77 63 85 50 85 C37 85 27 77 27 63 C27 49 38 33 50 23 Z" fill="#F3E7DA"/>' +
        '<path d="M50 32 C60 40 67 51 67 63 C67 74 59 80 50 80 C41 80 33 74 33 63 C33 51 40 40 50 32 Z" fill="#C33A5C"/>' +
        '<g fill="#8C1F3E" opacity="0.9"><ellipse cx="50" cy="46" rx="2" ry="3"/><ellipse cx="42" cy="55" rx="2" ry="3"/>' +
        '<ellipse cx="58" cy="55" rx="2" ry="3"/><ellipse cx="46" cy="66" rx="2" ry="3"/><ellipse cx="56" cy="68" rx="2" ry="3"/>' +
        '<ellipse cx="38" cy="68" rx="2" ry="3"/><ellipse cx="63" cy="64" rx="2" ry="3"/><ellipse cx="50" cy="74" rx="2" ry="3"/></g>'
    },
    {
      id: 'lychee', label: '荔枝',
      svg: ground(25) + stem(50, 30, 55, 16, 4) + leaf(55, 20, -30, 0.68) +
        '<circle cx="50" cy="58" r="29" fill="#D2452E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M64 35 C75 43 79 51 79 59 C79 75 66 87 50 87 C65 81 73 70 73 57 C73 47 69 40 64 35 Z" fill="#A02B1B" opacity="0.8"/>' +
        '<g fill="#E9755A" stroke="#9E2818" stroke-width="1.2">' +
        '<circle cx="38" cy="45" r="4"/><circle cx="50" cy="40" r="4"/><circle cx="62" cy="46" r="4"/>' +
        '<circle cx="32" cy="58" r="4"/><circle cx="44" cy="56" r="4"/><circle cx="56" cy="57" r="4"/><circle cx="68" cy="58" r="4"/>' +
        '<circle cx="37" cy="70" r="4"/><circle cx="50" cy="72" r="4"/><circle cx="63" cy="70" r="4"/></g>' +
        gloss(38, 44, 8, 5, -34, 0.34)
    },
    {
      id: 'starfruit', label: '楊桃',
      svg: ground(27, 94) +
        '<polygon points="50,8 61,40 94,42 68,62 77,94 50,75 23,94 32,62 6,42 39,40" ' +
        'fill="#F2CE49" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<polygon points="50,20 58,43 79,45 62,57 68,79 50,66 32,79 38,57 21,45 42,43" fill="#E0B62C" opacity="0.55"/>' +
        '<polygon points="50,34 54,46 66,47 56,54 59,66 50,58 41,66 44,54 34,47 46,46" fill="#FBEBA6" opacity="0.85"/>' +
        '<g fill="#8A6A18" opacity="0.8"><ellipse cx="50" cy="45" rx="1.8" ry="2.6"/><ellipse cx="45" cy="53" rx="1.8" ry="2.6"/>' +
        '<ellipse cx="55" cy="53" rx="1.8" ry="2.6"/></g>'
    },
    {
      id: 'passionfruit', label: '百香果',
      svg: ground(27) +
        '<circle cx="50" cy="54" r="33" fill="#5C2A4C" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M68 28 C79 37 83 45 83 54 C83 72 68 87 50 87 C68 80 76 68 76 52 C76 42 72 33 68 28 Z" fill="#3E1733" opacity="0.85"/>' +
        '<circle cx="50" cy="54" r="26" fill="#F6EEE0"/>' +
        '<path d="M50 32 C62 32 72 42 72 54 C72 68 62 76 50 76 C36 76 28 66 28 54 C28 41 38 32 50 32 Z" fill="#F0A62C"/>' +
        '<g fill="#4A3226"><ellipse cx="42" cy="45" rx="2.4" ry="3.4" transform="rotate(-20 42 45)"/>' +
        '<ellipse cx="56" cy="43" rx="2.4" ry="3.4" transform="rotate(15 56 43)"/>' +
        '<ellipse cx="36" cy="57" rx="2.4" ry="3.4"/><ellipse cx="50" cy="55" rx="2.4" ry="3.4"/>' +
        '<ellipse cx="63" cy="55" rx="2.4" ry="3.4"/><ellipse cx="44" cy="68" rx="2.4" ry="3.4"/>' +
        '<ellipse cx="58" cy="68" rx="2.4" ry="3.4"/></g>' +
        gloss(34, 38, 8, 5, -34, 0.3)
    },
    {
      id: 'raspberry', label: '覆盆子',
      svg: ground(21) +
        '<g fill="' + LEAF + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round">' +
        '<path d="M50 26 L34 16 L44 30 Z"/><path d="M50 26 L66 16 L56 30 Z"/><path d="M50 24 L50 10 L54 24 Z"/></g>' +
        '<g fill="#C42A4E" stroke="' + INK + '" stroke-width="1.8">' +
        '<circle cx="36" cy="38" r="8"/><circle cx="50" cy="34" r="8"/><circle cx="64" cy="38" r="8"/>' +
        '<circle cx="31" cy="52" r="8"/><circle cx="45" cy="50" r="8"/><circle cx="59" cy="50" r="8"/><circle cx="70" cy="53" r="8"/>' +
        '<circle cx="38" cy="65" r="8"/><circle cx="52" cy="64" r="8"/><circle cx="64" cy="66" r="8"/>' +
        '<circle cx="45" cy="78" r="7.5"/><circle cx="58" cy="78" r="7.5"/></g>' +
        '<g fill="#EE7A92" opacity="0.75"><circle cx="33" cy="35" r="2.6"/><circle cx="47" cy="31" r="2.6"/>' +
        '<circle cx="28" cy="49" r="2.6"/><circle cx="42" cy="47" r="2.6"/><circle cx="35" cy="62" r="2.6"/></g>'
    },
    {
      id: 'mangosteen', label: '山竹',
      svg: ground(25) +
        '<circle cx="50" cy="58" r="29" fill="#4B2038" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M64 35 C75 43 79 51 79 59 C79 75 66 87 50 87 C65 81 73 70 73 57 C73 47 69 40 64 35 Z" fill="#33132A" opacity="0.9"/>' +
        stem(50, 30, 50, 16, 5) +
        '<g fill="#5E8F32" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round">' +
        '<path d="M50 32 C40 24 28 26 26 34 C34 40 46 40 50 32 Z"/>' +
        '<path d="M50 32 C60 24 72 26 74 34 C66 40 54 40 50 32 Z"/>' +
        '<path d="M50 34 C44 26 40 18 44 14 C52 18 54 28 50 34 Z"/>' +
        '<path d="M50 34 C56 26 60 18 56 14 C48 18 46 28 50 34 Z"/></g>' +
        '<g fill="#8A6A4A"><circle cx="50" cy="80" r="3"/>' +
        '<ellipse cx="43" cy="77" rx="4" ry="2.6" transform="rotate(-35 43 77)"/>' +
        '<ellipse cx="57" cy="77" rx="4" ry="2.6" transform="rotate(35 57 77)"/>' +
        '<ellipse cx="45" cy="85" rx="4" ry="2.6" transform="rotate(30 45 85)"/>' +
        '<ellipse cx="55" cy="85" rx="4" ry="2.6" transform="rotate(-30 55 85)"/></g>' +
        gloss(36, 44, 8, 5, -34, 0.26)
    },
    {
      id: 'loquat', label: '枇杷',
      svg: ground(26, 94) +
        '<path d="M50 12 C48 22 44 30 38 38 M50 16 C56 24 62 30 66 38" fill="none" stroke="' + STEM + '" stroke-width="3.6" stroke-linecap="round"/>' +
        leaf(52, 14, -14, 0.72) +
        '<ellipse cx="36" cy="60" rx="18" ry="22" fill="#F0A22E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M44 42 C50 48 54 56 54 62 C54 74 46 82 36 82 C46 78 50 70 50 60 C50 52 47 46 44 42 Z" fill="#C8781A" opacity="0.8"/>' +
        '<ellipse cx="66" cy="66" rx="16" ry="20" fill="#E8952A" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M72 50 C78 56 82 62 82 68 C82 78 75 86 66 86 C75 82 78 74 78 66 C78 59 75 54 72 50 Z" fill="#C0700F" opacity="0.8"/>' +
        '<g fill="#7A4A12"><circle cx="36" cy="81" r="2.6"/><circle cx="66" cy="85" r="2.4"/></g>' +
        gloss(30, 50, 6, 4, -34, 0.36) + gloss(60, 57, 5, 3.4, -34, 0.32)
    },
    {
      id: 'celery', label: '芹菜',
      svg: ground(20, 94) +
        '<g fill="#2F6B24"><circle cx="30" cy="20" r="9"/><circle cx="42" cy="13" r="9"/><circle cx="56" cy="14" r="9"/>' +
        '<circle cx="68" cy="21" r="9"/><circle cx="38" cy="26" r="8"/><circle cx="60" cy="27" r="8"/><circle cx="49" cy="22" r="9"/></g>' +
        '<g fill="#4E9C3F" opacity="0.85"><circle cx="33" cy="17" r="5"/><circle cx="45" cy="12" r="5"/>' +
        '<circle cx="58" cy="13" r="5"/><circle cx="52" cy="20" r="5"/></g>' +
        '<g stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round">' +
        '<path d="M34 28 C30 48 30 70 34 88 L46 88 C44 68 44 46 46 28 Z" fill="#B7D46A"/>' +
        '<path d="M46 28 C44 48 44 70 46 88 L58 88 C58 70 58 48 56 28 Z" fill="#C6DE82"/>' +
        '<path d="M56 28 C58 48 58 70 58 88 L68 88 C72 70 72 48 68 28 Z" fill="#A9C95C"/></g>' +
        '<g fill="none" stroke="#8FAF44" stroke-width="1.8" opacity="0.9">' +
        '<path d="M38 34 C36 52 36 70 38 84 M52 34 C51 52 51 70 52 84 M63 34 C64 52 64 70 63 84"/></g>' +
        '<path d="M32 84 L70 84 C71 90 68 92 50 92 C32 92 30 90 32 84 Z" fill="#E8E2C8" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>'
    },
    {
      id: 'asparagus', label: '蘆筍',
      svg: ground(18, 94) +
        '<g stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round">' +
        '<path d="M30 22 C24 22 22 28 26 34 L36 88 L44 88 L38 32 C40 26 36 22 30 22 Z" fill="#5E9B3A"/>' +
        '<path d="M50 12 C43 12 41 18 45 25 L47 88 L57 88 L58 25 C62 18 57 12 50 12 Z" fill="#6FAE44"/>' +
        '<path d="M70 24 C64 24 60 30 64 36 L58 88 L66 88 L74 34 C78 28 76 24 70 24 Z" fill="#548D30"/></g>' +
        '<g fill="#4A2C6B" opacity="0.55">' +
        '<path d="M28 24 C24 24 23 29 26 33 L36 32 C39 27 34 24 28 24 Z"/>' +
        '<path d="M49 14 C43 14 42 19 45 24 L57 24 C60 19 55 14 49 14 Z"/>' +
        '<path d="M69 26 C64 26 61 31 64 35 L74 34 C77 29 74 26 69 26 Z"/></g>' +
        '<g fill="none" stroke="#3D7526" stroke-width="1.8" stroke-linecap="round" opacity="0.9">' +
        '<path d="M28 40 L38 42 M30 52 L40 54 M32 64 L42 66 M46 34 L56 34 M46 48 L57 48 M47 62 L57 62 M63 44 L72 42 M61 56 L70 54"/></g>'
    },
    {
      id: 'spinach', label: '菠菜',
      svg: ground(24, 94) +
        '<g fill="#2E6B28" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round">' +
        '<path d="M46 62 C30 58 16 42 18 24 C34 22 48 34 50 52 Z"/>' +
        '<path d="M54 62 C70 58 84 42 82 24 C66 22 52 34 50 52 Z"/>' +
        '<path d="M50 58 C42 44 44 24 50 12 C58 24 58 44 52 58 Z"/></g>' +
        '<g fill="#3F8A32" opacity="0.9">' +
        '<path d="M46 60 C34 54 24 42 24 30 C36 32 44 44 46 60 Z"/>' +
        '<path d="M50 56 C46 44 47 28 50 18 C54 30 54 46 50 56 Z"/></g>' +
        '<g fill="none" stroke="#1F4A1C" stroke-width="1.6" opacity="0.85">' +
        '<path d="M46 60 C36 52 26 40 20 27 M54 60 C64 52 74 40 80 27 M50 58 C49 44 50 26 50 15"/></g>' +
        '<path d="M44 60 C42 74 42 84 44 90 L56 90 C58 84 58 74 56 60 Z" fill="#D8607A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M52 62 C54 74 54 84 53 90 L56 90 C58 84 58 74 56 60 Z" fill="#B2405C" opacity="0.8"/>'
    },
    {
      id: 'okra', label: '秋葵',
      svg: ground(24, 94) +
        '<path d="M34 20 C30 14 24 14 22 18 C26 22 30 24 34 24 Z" fill="' + STEM + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M34 22 C46 30 54 50 54 74 C54 84 50 90 46 90 C40 90 34 82 32 68 C29 48 30 32 34 22 Z" ' +
        'fill="#5E9B32" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M42 32 C50 44 54 58 54 74 C54 84 50 90 46 90 C49 82 49 66 46 52 C44 42 43 36 42 32 Z" fill="#417318" opacity="0.85"/>' +
        '<g fill="none" stroke="#3C6E1C" stroke-width="1.8" opacity="0.9" stroke-linecap="round">' +
        '<path d="M36 28 C34 46 35 68 39 86 M42 27 C42 46 44 66 47 84 M48 30 C50 48 51 66 51 80"/></g>' +
        '<circle cx="74" cy="62" r="18" fill="#8FC154" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<polygon points="74,48 78.5,58.5 90,59 81,66 84,77 74,70.5 64,77 67,66 58,59 69.5,58.5" fill="#DCEBAE"/>' +
        '<g fill="#F3F7E2"><circle cx="74" cy="55" r="1.8"/><circle cx="67" cy="63" r="1.8"/><circle cx="81" cy="63" r="1.8"/>' +
        '<circle cx="70" cy="70" r="1.8"/><circle cx="78" cy="70" r="1.8"/></g>'
    },
    {
      id: 'beetroot', label: '甜菜根',
      svg: ground(22, 94) +
        '<g fill="#2F6B28" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round">' +
        '<path d="M46 40 C34 34 24 20 26 8 C40 10 48 24 50 38 Z"/>' +
        '<path d="M54 40 C66 34 76 20 74 8 C60 10 52 24 50 38 Z"/></g>' +
        '<g fill="none" stroke="#B22C52" stroke-width="2.4" stroke-linecap="round">' +
        '<path d="M47 44 C42 32 34 20 29 12 M53 44 C58 32 66 20 71 12"/></g>' +
        '<path d="M50 40 C68 40 78 52 78 64 C78 78 66 88 56 92 C52 94 48 94 44 92 C34 88 22 78 22 64 C22 52 32 40 50 40 Z" ' +
        'fill="#9C1F4C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 43 C73 48 78 55 78 64 C78 78 66 88 56 92 C66 82 72 70 70 58 C69 51 66 46 62 43 Z" fill="#701034" opacity="0.9"/>' +
        '<path d="M50 92 C50 96 51 99 53 100" fill="none" stroke="#701034" stroke-width="3" stroke-linecap="round"/>' +
        '<g fill="none" stroke="#C4527A" stroke-width="2" opacity="0.6"><path d="M34 54 C30 62 30 72 34 80"/></g>' +
        gloss(38, 55, 8, 5, -34, 0.26)
    },
    {
      id: 'ginger', label: '薑',
      svg: ground(28, 92) +
        '<path d="M24 60 C18 50 22 40 32 40 C40 40 44 46 46 54 C50 44 58 38 66 42 C74 46 74 56 68 60 ' +
        'C78 60 84 68 80 76 C76 84 64 84 58 78 C56 86 46 90 38 86 C30 82 28 74 32 68 C26 68 24 64 24 60 Z" ' +
        'fill="#D9BE8E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 42 C74 46 74 56 68 60 C78 60 84 68 80 76 C76 84 64 84 58 78 C68 76 74 68 70 62 C67 57 62 56 60 54 C62 46 64 43 66 42 Z" ' +
        'fill="#B6975F" opacity="0.85"/>' +
        '<g fill="none" stroke="#9B7C48" stroke-width="1.9" stroke-linecap="round" opacity="0.9">' +
        '<path d="M30 48 C36 50 40 54 42 60 M36 74 C42 72 46 68 48 62 M62 50 C60 56 58 60 54 63 M64 74 C62 70 62 66 64 62"/></g>' +
        '<g fill="#EFDCB8" opacity="0.75"><ellipse cx="34" cy="47" rx="5" ry="3" transform="rotate(-24 34 47)"/>' +
        '<ellipse cx="64" cy="48" rx="5" ry="3" transform="rotate(24 64 48)"/>' +
        '<ellipse cx="74" cy="70" rx="5" ry="3" transform="rotate(30 74 70)"/></g>'
    },
    {
      id: 'lotus-root', label: '蓮藕',
      svg: ground(28, 92) +
        '<path d="M18 34 L64 34 C74 34 82 42 82 52 L82 62 C82 72 74 80 64 80 L18 80 C22 74 24 66 24 57 C24 48 22 40 18 34 Z" ' +
        'fill="#E8DCC2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 34 C74 34 82 42 82 52 L82 62 C82 72 74 80 64 80 C70 72 72 64 72 57 C72 48 70 40 64 34 Z" fill="#CBBB99" opacity="0.9"/>' +
        '<ellipse cx="24" cy="57" rx="10" ry="23" fill="#F5EEDD" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<g fill="#B7A57F"><ellipse cx="24" cy="42" rx="3" ry="4.6"/><ellipse cx="24" cy="57" rx="3.4" ry="5"/>' +
        '<ellipse cx="24" cy="72" rx="3" ry="4.6"/><ellipse cx="19" cy="50" rx="2.6" ry="4"/><ellipse cx="19" cy="65" rx="2.6" ry="4"/>' +
        '<ellipse cx="29" cy="50" rx="2.6" ry="4"/><ellipse cx="29" cy="65" rx="2.6" ry="4"/></g>' +
        '<g fill="none" stroke="#B7A57F" stroke-width="2.2" opacity="0.8"><path d="M46 34 C44 46 44 68 46 80 M64 34 C62 46 62 68 64 80"/></g>' +
        gloss(40, 42, 10, 4, -6, 0.3)
    },
    {
      id: 'bamboo-shoot', label: '竹筍',
      svg: ground(24, 92) +
        '<path d="M50 8 C62 24 74 54 74 74 C74 84 64 88 50 88 C36 88 26 84 26 74 C26 54 38 24 50 8 Z" ' +
        'fill="#D6BE8A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M58 22 C68 40 74 60 74 74 C74 84 64 88 50 88 C62 84 68 78 68 68 C68 54 64 36 58 22 Z" fill="#B69A63" opacity="0.9"/>' +
        '<g fill="none" stroke="#8B7038" stroke-width="2.4" stroke-linejoin="round">' +
        '<path d="M35 46 C42 52 58 52 65 46 M30 62 C40 70 60 70 70 62 M40 30 C45 34 55 34 60 30"/></g>' +
        '<g fill="#8B7038" opacity="0.55"><ellipse cx="40" cy="40" rx="2.4" ry="3.4"/><ellipse cx="60" cy="40" rx="2.4" ry="3.4"/>' +
        '<ellipse cx="34" cy="56" rx="2.4" ry="3.4"/><ellipse cx="66" cy="56" rx="2.4" ry="3.4"/><ellipse cx="50" cy="58" rx="2.4" ry="3.4"/>' +
        '<ellipse cx="42" cy="74" rx="2.4" ry="3.4"/><ellipse cx="58" cy="74" rx="2.4" ry="3.4"/></g>' +
        '<path d="M50 8 C54 14 56 20 56 24 C52 22 48 22 44 24 C44 20 46 14 50 8 Z" fill="#A8C46A"/>'
    },
    {
      id: 'taro', label: '芋頭',
      svg: ground(25, 92) +
        '<path d="M50 14 C66 14 76 30 76 52 C76 74 64 88 50 88 C36 88 24 74 24 52 C24 30 34 14 50 14 Z" ' +
        'fill="#8A6A4E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 20 C71 28 76 38 76 52 C76 74 64 88 50 88 C62 82 68 68 68 52 C68 36 65 26 62 20 Z" fill="#66492F" opacity="0.9"/>' +
        '<g fill="none" stroke="#4E3620" stroke-width="2.4" opacity="0.85">' +
        '<path d="M27 34 C38 40 62 40 73 34 M25 48 C36 55 64 55 75 48 M27 62 C38 69 62 69 73 62 M31 75 C40 80 60 80 69 75"/></g>' +
        '<g stroke="#3E2A18" stroke-width="1.4" stroke-linecap="round" opacity="0.7">' +
        '<path d="M32 28 L28 24 M44 24 L42 19 M58 24 L60 19 M70 30 L74 26 M30 44 L25 42 M72 44 L77 42 M30 58 L25 57 M72 58 L77 57"/></g>' +
        '<path d="M44 14 C46 8 54 8 56 14 C54 18 46 18 44 14 Z" fill="#B78CC4" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>'
    },
    {
      id: 'chestnut', label: '栗子',
      svg: ground(26) +
        '<path d="M50 16 C54 22 56 26 58 30 C74 36 84 52 84 66 C84 80 70 88 50 88 C30 88 16 80 16 66 C16 52 26 36 42 30 C44 26 46 22 50 16 Z" ' +
        'fill="#7A4A22" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 32 C76 39 84 53 84 66 C84 80 70 88 50 88 C68 84 76 74 76 62 C76 50 70 39 62 32 Z" fill="#5A3213" opacity="0.9"/>' +
        '<path d="M22 78 C30 86 40 88 50 88 C60 88 70 86 78 78 C74 74 62 72 50 72 C38 72 26 74 22 78 Z" ' +
        'fill="#E6D3B0" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#C4AC85" stroke-width="1.8" opacity="0.9"><path d="M34 76 L34 86 M44 74 L44 87 M56 74 L56 87 M66 76 L66 86"/></g>' +
        '<path d="M50 16 C48 12 47 8 50 6 C53 8 52 12 50 16 Z" fill="#4E3620"/>' +
        gloss(36, 46, 9, 5.5, -36, 0.3)
    }
  ];

  return {
    key: 'fruits',
    label: '蔬果',
    emoji: '🍓',
    note: '水果與蔬菜',
    list: LIST.concat(MORE)
  };
}));
