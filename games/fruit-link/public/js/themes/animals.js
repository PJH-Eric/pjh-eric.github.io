/* ===== themes/animals.js — 動物造型庫（純資料，無 DOM 相依） =====
 *
 * 寫實取向：參考真實動物的比例、毛色與花紋，不畫卡通表情。
 *
 * 頭像類（貓、狗、狐狸、浣熊、老鼠…）最容易被看成同一隻，所以刻意用
 * 三件事拉開距離：耳朵形狀（尖／垂／圓／大圓）、臉上的花紋（面罩、白頰、
 * 條紋、斑點）、以及毛色。全身類（松鼠、長頸鹿、企鵝、魚…）則靠剪影分辨。
 *
 * 不使用漸層（同一張盤面會貼上幾十份相同 SVG，重複 id 在消除動畫時會出問題），
 * 一律用「底色 + 陰影形狀 + 打亮形狀」疊出立體感。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.THEME_ANIMALS = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var INK = '#3B2C22';

  function ground(rx, cy) {
    return '<ellipse cx="50" cy="' + (cy || 93) + '" rx="' + rx + '" ry="' + (rx * 0.16).toFixed(1) +
      '" fill="#3B2C22" opacity="0.13"/>';
  }
  /** 眼睛：深色眼珠 + 左上一點反光，看起來才有神 */
  function eye(cx, cy, r) {
    r = r || 3.4;
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.12).toFixed(2) + '" fill="#241B14"/>' +
      '<circle cx="' + (cx - r * 0.34) + '" cy="' + (cy - r * 0.4) + '" r="' + (r * 0.34) + '" fill="#FFFFFF" opacity="0.92"/>';
  }
  /** 鼻子 */
  function nose(cx, cy, w, fill) {
    return '<path d="M' + (cx - w) + ' ' + (cy - w * 0.45) + ' Q' + cx + ' ' + (cy - w * 0.9) + ' ' + (cx + w) + ' ' + (cy - w * 0.45) +
      ' Q' + cx + ' ' + (cy + w * 0.9) + ' ' + (cx - w) + ' ' + (cy - w * 0.45) + ' Z" fill="' + (fill || '#3B2C22') + '"/>';
  }
  /** 鬍鬚 */
  function whiskers(cx, cy) {
    return '<g stroke="#6B5A4A" stroke-width="1.5" stroke-linecap="round" opacity="0.8" fill="none">' +
      '<path d="M' + (cx - 6) + ' ' + cy + ' L' + (cx - 24) + ' ' + (cy - 4) + '"/>' +
      '<path d="M' + (cx - 6) + ' ' + (cy + 3) + ' L' + (cx - 24) + ' ' + (cy + 5) + '"/>' +
      '<path d="M' + (cx + 6) + ' ' + cy + ' L' + (cx + 24) + ' ' + (cy - 4) + '"/>' +
      '<path d="M' + (cx + 6) + ' ' + (cy + 3) + ' L' + (cx + 24) + ' ' + (cy + 5) + '"/></g>';
  }
  /** 嘴：倒 Y 字，貓狗熊都用得到 */
  function muzzleLine(cx, cy, w) {
    return '<path d="M' + cx + ' ' + cy + ' L' + cx + ' ' + (cy + w * 0.5) +
      ' M' + cx + ' ' + (cy + w * 0.5) + ' Q' + (cx - w) + ' ' + (cy + w * 1.2) + ' ' + (cx - w * 1.5) + ' ' + (cy + w * 0.4) +
      ' M' + cx + ' ' + (cy + w * 0.5) + ' Q' + (cx + w) + ' ' + (cy + w * 1.2) + ' ' + (cx + w * 1.5) + ' ' + (cy + w * 0.4) +
      '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>';
  }

  var LIST = [
    {
      id: 'cat', label: '貓咪',
      svg: ground(26) +
        '<path d="M22 44 L20 14 L44 28 Z" fill="#E08A2E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M78 44 L80 14 L56 28 Z" fill="#E08A2E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M26 38 L25 22 L38 30 Z" fill="#F5B98A"/><path d="M74 38 L75 22 L62 30 Z" fill="#F5B98A"/>' +
        '<ellipse cx="50" cy="58" rx="31" ry="28" fill="#EE9C3C" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 34 C77 41 81 49 81 58 C81 74 67 86 50 86 C64 80 71 70 71 56 C71 46 68 38 66 34 Z" fill="#C4720F" opacity="0.7"/>' +
        '<g stroke="#A85C0C" stroke-width="3" stroke-linecap="round" opacity="0.9">' +
        '<path d="M50 30 L50 40 M40 32 L42 42 M60 32 L58 42 M22 52 L34 54 M78 52 L66 54 M24 64 L34 64 M76 64 L66 64"/></g>' +
        '<ellipse cx="50" cy="70" rx="16" ry="11" fill="#FBE4C6"/>' +
        eye(39, 55, 4.2) + eye(61, 55, 4.2) + nose(50, 67, 4, '#D46A78') + muzzleLine(50, 68, 4) + whiskers(50, 71)
    },
    {
      id: 'dog', label: '小狗',
      svg: ground(26) +
        '<path d="M22 36 C12 40 10 62 18 74 C24 82 32 78 32 68 L32 44 Z" fill="#7A4A26" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M78 36 C88 40 90 62 82 74 C76 82 68 78 68 68 L68 44 Z" fill="#6B3F1E" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M50 24 C34 24 26 36 26 52 C26 70 36 84 50 84 C64 84 74 70 74 52 C74 36 66 24 50 24 Z" ' +
        'fill="#C08B52" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 28 C71 34 74 42 74 52 C74 70 64 84 50 84 C62 78 68 66 68 52 C68 40 66 32 64 28 Z" fill="#9A6835" opacity="0.75"/>' +
        '<ellipse cx="50" cy="68" rx="17" ry="13" fill="#F0DCC0"/>' +
        eye(40, 50, 4) + eye(60, 50, 4) + nose(50, 65, 5.4) + muzzleLine(50, 66, 4.6) +
        '<path d="M36 30 C42 26 48 26 52 28" fill="none" stroke="#8A5E30" stroke-width="3" stroke-linecap="round" opacity="0.7"/>'
    },
    {
      id: 'rabbit', label: '兔子',
      svg: ground(24) +
        '<ellipse cx="36" cy="30" rx="9" ry="24" fill="#EFE7DC" stroke="' + INK + '" stroke-width="2.5" transform="rotate(-9 36 30)"/>' +
        '<ellipse cx="64" cy="30" rx="9" ry="24" fill="#EFE7DC" stroke="' + INK + '" stroke-width="2.5" transform="rotate(9 64 30)"/>' +
        '<ellipse cx="36" cy="31" rx="4.4" ry="16" fill="#F2B9C4" transform="rotate(-9 36 31)"/>' +
        '<ellipse cx="64" cy="31" rx="4.4" ry="16" fill="#F2B9C4" transform="rotate(9 64 31)"/>' +
        '<ellipse cx="50" cy="66" rx="28" ry="25" fill="#F7F2EA" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M64 46 C74 52 78 58 78 66 C78 80 66 91 50 91 C62 86 68 76 68 64 C68 55 66 49 64 46 Z" fill="#D8CEC0" opacity="0.7"/>' +
        eye(40, 63, 4.2) + eye(60, 63, 4.2) + nose(50, 74, 4, '#E08898') + muzzleLine(50, 75, 3.6) + whiskers(50, 77)
    },
    {
      id: 'bear', label: '熊',
      svg: ground(28) +
        '<circle cx="24" cy="32" r="13" fill="#7A5230" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="76" cy="32" r="13" fill="#7A5230" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="24" cy="32" r="6.5" fill="#A87C50"/><circle cx="76" cy="32" r="6.5" fill="#A87C50"/>' +
        '<ellipse cx="50" cy="60" rx="33" ry="30" fill="#8A5E33" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M68 36 C80 44 83 52 83 60 C83 77 68 90 50 90 C65 84 73 72 73 58 C73 46 70 40 68 36 Z" fill="#66421F" opacity="0.75"/>' +
        '<ellipse cx="50" cy="70" rx="19" ry="14" fill="#D9BE96"/>' +
        eye(39, 55, 4) + eye(61, 55, 4) + nose(50, 66, 6) + muzzleLine(50, 68, 5)
    },
    {
      id: 'panda', label: '貓熊',
      svg: ground(28) +
        '<circle cx="24" cy="30" r="13" fill="#2C2621" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="76" cy="30" r="13" fill="#2C2621" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<ellipse cx="50" cy="60" rx="33" ry="30" fill="#FBF7F0" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M70 38 C80 46 83 52 83 60 C83 77 68 90 50 90 C66 84 73 72 73 58 C73 48 72 42 70 38 Z" fill="#DAD3C8" opacity="0.7"/>' +
        '<ellipse cx="37" cy="54" rx="10" ry="12" fill="#2C2621" transform="rotate(-18 37 54)"/>' +
        '<ellipse cx="63" cy="54" rx="10" ry="12" fill="#2C2621" transform="rotate(18 63 54)"/>' +
        '<circle cx="37" cy="55" r="3.6" fill="#FBF7F0"/><circle cx="63" cy="55" r="3.6" fill="#FBF7F0"/>' +
        '<circle cx="37" cy="55" r="2.2" fill="#241B14"/><circle cx="63" cy="55" r="2.2" fill="#241B14"/>' +
        nose(50, 68, 6, '#2C2621') + muzzleLine(50, 70, 5)
    },
    {
      id: 'fox', label: '狐狸',
      svg: ground(26) +
        '<path d="M20 46 L16 12 L44 28 Z" fill="#E0651E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M80 46 L84 12 L56 28 Z" fill="#E0651E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M20 46 L17 20 L27 26 Z" fill="#2C2621"/><path d="M80 46 L83 20 L73 26 Z" fill="#2C2621"/>' +
        '<path d="M50 30 C33 30 22 42 22 56 C22 66 30 74 38 78 L50 88 L62 78 C70 74 78 66 78 56 C78 42 67 30 50 30 Z" ' +
        'fill="#E97A28" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 34 C74 40 78 48 78 56 C78 66 70 74 62 78 L50 88 C60 78 68 66 68 54 C68 44 67 38 66 34 Z" fill="#C05512" opacity="0.7"/>' +
        '<path d="M38 62 C40 74 44 82 50 88 C56 82 60 74 62 62 C58 66 42 66 38 62 Z" fill="#FBF3E8"/>' +
        eye(38, 56, 4) + eye(62, 56, 4) + nose(50, 76, 4.4, '#2C2621') + whiskers(50, 78)
    },
    {
      id: 'pig', label: '小豬',
      svg: ground(27) +
        '<path d="M26 40 L20 20 L42 30 Z" fill="#EFA0AE" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M74 40 L80 20 L58 30 Z" fill="#EFA0AE" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="60" rx="32" ry="28" fill="#F5B4C0" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M68 38 C79 45 82 52 82 60 C82 76 68 88 50 88 C65 82 72 71 72 58 C72 47 70 42 68 38 Z" fill="#D6808F" opacity="0.7"/>' +
        eye(38, 54, 4) + eye(62, 54, 4) +
        '<ellipse cx="50" cy="70" rx="15" ry="11" fill="#E88B9C" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<ellipse cx="44" cy="70" rx="3" ry="4.4" fill="#B4566A"/><ellipse cx="56" cy="70" rx="3" ry="4.4" fill="#B4566A"/>'
    },
    {
      id: 'cow', label: '乳牛',
      svg: ground(28) +
        '<path d="M18 34 C8 30 6 20 12 18 C20 16 26 24 26 34 Z" fill="#E8DCC6" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M82 34 C92 30 94 20 88 18 C80 16 74 24 74 34 Z" fill="#E8DCC6" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M20 46 L10 42 L14 56 Z" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M80 46 L90 42 L86 56 Z" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="58" rx="30" ry="28" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M28 38 C22 44 20 52 22 58 C30 58 36 50 36 42 C34 38 30 36 28 38 Z" fill="#2C2621"/>' +
        '<path d="M70 66 C76 62 78 54 76 48 C68 50 64 58 64 66 C66 70 68 68 70 66 Z" fill="#2C2621"/>' +
        eye(38, 54, 4) + eye(62, 52, 4) +
        '<ellipse cx="50" cy="72" rx="17" ry="12" fill="#F2C0C8" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<ellipse cx="44" cy="71" rx="2.8" ry="4" fill="#C4808C"/><ellipse cx="56" cy="71" rx="2.8" ry="4" fill="#C4808C"/>'
    },
    {
      id: 'sheep', label: '綿羊',
      svg: ground(28) +
        '<g fill="#FBF8F2" stroke="#C9C2B8" stroke-width="2.2">' +
        '<circle cx="24" cy="40" r="14"/><circle cx="76" cy="40" r="14"/><circle cx="50" cy="26" r="15"/>' +
        '<circle cx="18" cy="62" r="13"/><circle cx="82" cy="62" r="13"/><circle cx="30" cy="76" r="13"/>' +
        '<circle cx="70" cy="76" r="13"/><circle cx="34" cy="50" r="15"/><circle cx="66" cy="50" r="15"/>' +
        '<circle cx="50" cy="46" r="16"/><circle cx="50" cy="72" r="14"/></g>' +
        '<g fill="#E4DDD2" opacity="0.85"><circle cx="76" cy="42" r="9"/><circle cx="82" cy="62" r="8"/>' +
        '<circle cx="70" cy="78" r="8"/></g>' +
        '<ellipse cx="26" cy="64" rx="8" ry="11" fill="#6E6058" stroke="' + INK + '" stroke-width="2.3" transform="rotate(-22 26 64)"/>' +
        '<ellipse cx="74" cy="64" rx="8" ry="11" fill="#6E6058" stroke="' + INK + '" stroke-width="2.3" transform="rotate(22 74 64)"/>' +
        '<ellipse cx="50" cy="64" rx="17" ry="19" fill="#8A7A70" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M58 48 C64 52 66 60 66 66 C66 74 60 80 54 82 C62 76 64 62 58 48 Z" fill="#6E6058" opacity="0.8"/>' +
        eye(43, 60, 3.6) + eye(57, 60, 3.6) + nose(50, 74, 4, '#3B2C22') +
        '<path d="M46 78 Q50 82 54 78" fill="none" stroke="#3B2C22" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: 'monkey', label: '猴子',
      svg: ground(26) +
        '<circle cx="20" cy="52" r="12" fill="#8A5E33" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="80" cy="52" r="12" fill="#8A5E33" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="20" cy="52" r="6" fill="#D4A878"/><circle cx="80" cy="52" r="6" fill="#D4A878"/>' +
        '<ellipse cx="50" cy="56" rx="30" ry="29" fill="#9A6B3C" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 32 C77 40 80 48 80 56 C80 73 67 86 50 86 C64 80 70 70 70 54 C70 44 68 36 66 32 Z" fill="#754F28" opacity="0.75"/>' +
        '<path d="M50 38 C34 38 28 52 28 62 C28 76 38 86 50 86 C62 86 72 76 72 62 C72 52 66 38 50 38 Z" fill="#E8C49A"/>' +
        eye(41, 56, 4) + eye(59, 56, 4) +
        '<ellipse cx="50" cy="70" rx="9" ry="6" fill="#D9B084"/>' +
        '<ellipse cx="46" cy="68" rx="1.7" ry="2.4" fill="#6B4A2A"/><ellipse cx="54" cy="68" rx="1.7" ry="2.4" fill="#6B4A2A"/>' +
        '<path d="M42 76 Q50 82 58 76" fill="none" stroke="#6B4A2A" stroke-width="2.2" stroke-linecap="round"/>'
    },
    {
      id: 'lion', label: '獅子',
      svg: ground(30) +
        '<path d="M50 6 L59 18 L72 12 L74 26 L88 26 L84 40 L96 48 L86 58 L94 70 L80 74 L82 88 L68 84 L62 96 ' +
        'L50 88 L38 96 L32 84 L18 88 L20 74 L6 70 L14 58 L4 48 L16 40 L12 26 L26 26 L28 12 L41 18 Z" ' +
        'fill="#C4772A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M74 26 L88 26 L84 40 L96 48 L86 58 L94 70 L80 74 L82 88 L68 84 L62 96 L50 88 ' +
        'C68 84 80 66 80 48 C80 38 77 31 74 26 Z" fill="#9A5A16" opacity="0.72"/>' +
        '<circle cx="26" cy="42" r="9" fill="#A85F18" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<circle cx="74" cy="42" r="9" fill="#A85F18" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<ellipse cx="50" cy="54" rx="27" ry="25" fill="#EFA548" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M64 36 C74 43 77 48 77 54 C77 68 65 79 50 79 C63 74 69 64 69 52 C69 44 66 39 64 36 Z" fill="#D2842C" opacity="0.7"/>' +
        '<ellipse cx="50" cy="64" rx="15" ry="11" fill="#FBE0B8"/>' +
        eye(40, 50, 4) + eye(60, 50, 4) + nose(50, 61, 5, '#8A4A18') + muzzleLine(50, 62, 4.4) + whiskers(50, 65)
    },
    {
      id: 'tiger', label: '老虎',
      svg: ground(28) +
        '<path d="M22 44 L20 18 L42 30 Z" fill="#E0821E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M78 44 L80 18 L58 30 Z" fill="#E0821E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<circle cx="26" cy="28" r="4.4" fill="#2C2621"/><circle cx="74" cy="28" r="4.4" fill="#2C2621"/>' +
        '<ellipse cx="50" cy="58" rx="32" ry="29" fill="#F09A26" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<g fill="#2C2621">' +
        '<path d="M50 29 L46 42 L50 40 L54 42 Z"/><path d="M36 32 L34 44 L40 40 Z"/><path d="M64 32 L66 44 L60 40 Z"/>' +
        '<path d="M19 50 L34 54 L19 58 Z"/><path d="M81 50 L66 54 L81 58 Z"/>' +
        '<path d="M20 64 L34 64 L21 70 Z"/><path d="M80 64 L66 64 L79 70 Z"/></g>' +
        '<ellipse cx="50" cy="70" rx="17" ry="12" fill="#FBF3E4"/>' +
        eye(39, 55, 4.2) + eye(61, 55, 4.2) + nose(50, 67, 4.6, '#C4566A') + muzzleLine(50, 68, 4.4) + whiskers(50, 71)
    },
    {
      id: 'elephant', label: '大象',
      svg: ground(28) +
        '<path d="M26 34 C8 34 4 54 12 68 C18 78 30 76 32 64 Z" fill="#93A0AD" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M74 34 C92 34 96 54 88 68 C82 78 70 76 68 64 Z" fill="#8492A0" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M50 24 C34 24 28 36 28 52 C28 62 32 70 38 74 L38 84 C38 92 62 92 62 84 L62 74 C68 70 72 62 72 52 C72 36 66 24 50 24 Z" ' +
        'fill="#A2AFBC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 28 C70 34 72 42 72 52 C72 62 68 70 62 74 L62 84 C62 89 56 91 50 91 C58 88 56 78 56 72 C64 66 66 44 64 28 Z" fill="#7C8A98" opacity="0.7"/>' +
        '<path d="M42 76 C40 84 42 90 50 90 C58 90 60 84 58 76" fill="none" stroke="#7C8A98" stroke-width="2.2"/>' +
        eye(38, 48, 4) + eye(62, 48, 4) +
        '<path d="M40 66 C42 62 58 62 60 66" fill="none" stroke="#7C8A98" stroke-width="2.2" stroke-linecap="round"/>'
    },
    {
      id: 'giraffe', label: '長頸鹿',
      svg: ground(20, 92) +
        '<path d="M42 88 L42 46 C42 30 54 20 66 20 C76 20 84 26 84 36 C84 44 78 48 72 48 L60 48 L60 88 Z" ' +
        'fill="#EBC15E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g fill="#A8742A" opacity="0.9">' +
        '<ellipse cx="49" cy="58" rx="4.4" ry="5" transform="rotate(10 49 58)"/>' +
        '<ellipse cx="52" cy="74" rx="4.4" ry="5"/><ellipse cx="49" cy="42" rx="4" ry="4.6"/>' +
        '<ellipse cx="58" cy="32" rx="4" ry="4.4" transform="rotate(30 58 32)"/></g>' +
        '<path d="M66 20 C78 20 86 26 86 36 C86 44 80 48 72 48 C80 44 82 34 76 28 C72 24 68 21 66 20 Z" fill="#C99C3C" opacity="0.7"/>' +
        '<path d="M60 20 L58 8 M74 20 L76 8" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<circle cx="58" cy="7" r="3.6" fill="#7A5230"/><circle cx="76" cy="7" r="3.6" fill="#7A5230"/>' +
        '<path d="M84 34 C92 34 94 40 90 44 C86 46 84 42 84 34 Z" fill="#EBC15E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="86" cy="42" rx="1.6" ry="2.2" fill="#7A5230"/>' +
        eye(74, 30, 3.6)
    },
    {
      id: 'zebra', label: '斑馬',
      svg: ground(26) +
        '<path d="M30 40 L26 18 L44 30 Z" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M70 40 L74 18 L56 30 Z" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M30 38 L28 24 L38 30 Z" fill="#2C2621"/><path d="M70 38 L72 24 L62 30 Z" fill="#2C2621"/>' +
        '<path d="M50 28 C34 28 26 42 26 56 C26 74 36 88 50 88 C64 88 74 74 74 56 C74 42 66 28 50 28 Z" ' +
        'fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g fill="#2C2621">' +
        '<path d="M50 28 C46 28 44 30 44 34 L50 44 L56 34 C56 30 54 28 50 28 Z"/>' +
        '<path d="M30 40 C34 44 40 46 44 46 L40 40 C36 38 32 38 30 40 Z"/>' +
        '<path d="M70 40 C66 44 60 46 56 46 L60 40 C64 38 68 38 70 40 Z"/>' +
        '<path d="M27 56 C32 58 36 58 40 58 L38 52 C33 52 29 53 27 56 Z"/>' +
        '<path d="M73 56 C68 58 64 58 60 58 L62 52 C67 52 71 53 73 56 Z"/></g>' +
        '<ellipse cx="50" cy="74" rx="15" ry="12" fill="#4A4038" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<ellipse cx="45" cy="73" rx="2.4" ry="3.4" fill="#1C1712"/><ellipse cx="55" cy="73" rx="2.4" ry="3.4" fill="#1C1712"/>' +
        eye(38, 54, 4) + eye(62, 54, 4)
    },
    {
      id: 'hippo', label: '河馬',
      svg: ground(30) +
        '<circle cx="26" cy="32" r="9" fill="#A88CB0" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="74" cy="32" r="9" fill="#A88CB0" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="26" cy="32" r="4" fill="#C4ACC8"/><circle cx="74" cy="32" r="4" fill="#C4ACC8"/>' +
        '<ellipse cx="50" cy="56" rx="33" ry="26" fill="#A88CB0" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M70 36 C81 43 83 49 83 56 C83 70 68 82 50 82 C66 78 73 68 73 54 C73 44 72 40 70 36 Z" fill="#87708F" opacity="0.7"/>' +
        '<path d="M50 62 C34 62 24 70 24 78 C24 86 36 92 50 92 C64 92 76 86 76 78 C76 70 66 62 50 62 Z" ' +
        'fill="#C4A8CC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<ellipse cx="40" cy="76" rx="3.4" ry="4.6" fill="#7A6382"/><ellipse cx="60" cy="76" rx="3.4" ry="4.6" fill="#7A6382"/>' +
        '<path d="M36 86 C42 90 58 90 64 86" fill="none" stroke="#7A6382" stroke-width="2.2" stroke-linecap="round"/>' +
        eye(38, 48, 4) + eye(62, 48, 4)
    },
    {
      id: 'koala', label: '無尾熊',
      svg: ground(28) +
        '<g fill="#A8AFB6" stroke="' + INK + '" stroke-width="2.5">' +
        '<circle cx="20" cy="42" r="17"/><circle cx="80" cy="42" r="17"/></g>' +
        '<g fill="#D8DDE2"><circle cx="20" cy="42" r="10"/><circle cx="80" cy="42" r="10"/></g>' +
        '<g stroke="#8E959C" stroke-width="2" fill="none" opacity="0.9">' +
        '<path d="M12 36 L26 46 M12 48 L26 40 M74 46 L88 36 M74 40 L88 48"/></g>' +
        '<ellipse cx="50" cy="58" rx="29" ry="29" fill="#B7BEC5" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 36 C76 43 79 50 79 58 C79 74 66 87 50 87 C64 81 70 71 70 56 C70 46 68 40 66 36 Z" fill="#949BA2" opacity="0.7"/>' +
        eye(39, 55, 4) + eye(61, 55, 4) +
        '<path d="M50 60 C42 60 38 66 40 72 C42 79 50 82 50 82 C50 82 58 79 60 72 C62 66 58 60 50 60 Z" fill="#2C2621"/>'
    },
    {
      id: 'deer', label: '小鹿',
      svg: ground(24) +
        '<path d="M32 30 C24 22 22 12 26 8 C30 12 30 18 34 22 M26 16 L18 12 M30 22 L20 22" ' +
        'fill="none" stroke="#7A5230" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M68 30 C76 22 78 12 74 8 C70 12 70 18 66 22 M74 16 L82 12 M70 22 L80 22" ' +
        'fill="none" stroke="#7A5230" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M24 44 L14 38 L20 52 Z" fill="#C99458" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M76 44 L86 38 L80 52 Z" fill="#C99458" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M50 28 C36 28 28 40 28 54 C28 68 36 78 42 82 L50 88 L58 82 C64 78 72 68 72 54 C72 40 64 28 50 28 Z" ' +
        'fill="#CE9C5E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 32 C69 38 72 46 72 54 C72 68 64 78 58 82 L50 88 C60 80 66 68 66 54 C66 44 65 36 64 32 Z" fill="#A87438" opacity="0.7"/>' +
        '<g fill="#F2E2C8"><circle cx="38" cy="42" r="2.6"/><circle cx="62" cy="42" r="2.6"/><circle cx="34" cy="54" r="2.2"/><circle cx="66" cy="54" r="2.2"/></g>' +
        '<path d="M40 70 C42 80 46 86 50 88 C54 86 58 80 60 70 Z" fill="#FBF3E4"/>' +
        eye(39, 56, 4) + eye(61, 56, 4) + nose(50, 78, 4, '#3B2C22')
    },
    {
      id: 'squirrel', label: '松鼠',
      svg: ground(22, 90) +
        '<path d="M70 84 C88 80 94 54 82 34 C74 20 60 20 58 32 C56 44 70 46 74 58 C77 68 72 78 62 82 Z" ' +
        'fill="#B5763A" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M74 40 C82 52 82 68 74 78" fill="none" stroke="#D9A472" stroke-width="5" stroke-linecap="round" opacity="0.8"/>' +
        '<path d="M30 62 C22 66 18 78 24 86 C32 92 52 92 60 86 C68 80 66 66 56 60 Z" ' +
        'fill="#C9884A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M34 76 C34 86 42 90 48 90 C54 90 58 86 58 78 C50 82 40 82 34 76 Z" fill="#F0DCC0"/>' +
        '<path d="M24 40 L18 24 L34 32 Z" fill="#B5763A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M52 36 L54 20 L64 34 Z" fill="#B5763A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="38" cy="48" rx="22" ry="20" fill="#C9884A" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<ellipse cx="36" cy="56" rx="12" ry="9" fill="#F0DCC0"/>' +
        eye(30, 46, 3.6) + eye(46, 46, 3.6) + nose(37, 55, 3.4) + whiskers(37, 58)
    },
    {
      id: 'hedgehog', label: '刺蝟',
      svg: ground(28, 88) +
        '<path d="M14 72 C10 50 26 30 48 30 C68 30 82 46 82 64 C82 76 74 84 62 84 L26 84 C18 84 15 78 14 72 Z" ' +
        'fill="#6B5240" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g stroke="#3E2E20" stroke-width="2.4" stroke-linecap="round" fill="none">' +
        '<path d="M28 40 L20 26 M42 32 L38 16 M56 32 L58 16 M70 40 L78 26 M78 54 L92 46 M20 54 L8 46 M80 70 L92 68 M18 70 L8 70"/></g>' +
        '<g fill="#8A6B52"><path d="M32 44 L26 34 M46 38 L44 26 M60 38 L64 26 M72 46 L80 36" stroke="#8A6B52" stroke-width="3" stroke-linecap="round"/></g>' +
        '<path d="M14 72 C12 82 20 88 32 88 L20 88 C15 86 14 78 14 72 Z" fill="#4E3C2C" opacity="0.7"/>' +
        '<path d="M18 66 C12 66 6 72 10 80 C14 86 26 88 34 84 C42 80 40 68 30 64 Z" ' +
        'fill="#D9BE9C" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<ellipse cx="12" cy="77" rx="4" ry="3.4" fill="#3B2C22"/>' +
        eye(24, 72, 3.2) + whiskers(16, 80)
    },
    {
      id: 'frog', label: '青蛙',
      svg: ground(30, 90) +
        '<path d="M12 62 C6 68 6 80 14 84 C20 87 28 84 30 78 M88 62 C94 68 94 80 86 84 C80 87 72 84 70 78" ' +
        'fill="#4E9C3F" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M50 30 C28 30 14 46 14 62 C14 78 30 88 50 88 C70 88 86 78 86 62 C86 46 72 30 50 30 Z" ' +
        'fill="#5FB44A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M68 34 C80 42 86 52 86 62 C86 78 70 88 50 88 C70 84 78 72 78 60 C78 48 72 38 68 34 Z" fill="#3F8A32" opacity="0.75"/>' +
        '<path d="M34 76 C40 84 60 84 66 76" fill="none" stroke="#2F6B26" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="30" cy="30" r="14" fill="#6BC456" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="70" cy="30" r="14" fill="#6BC456" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="30" cy="30" r="8" fill="#F2C81E"/><circle cx="70" cy="30" r="8" fill="#F2C81E"/>' +
        '<ellipse cx="30" cy="30" rx="3.4" ry="7" fill="#241B14"/><ellipse cx="70" cy="30" rx="3.4" ry="7" fill="#241B14"/>' +
        '<circle cx="27" cy="26" r="2.4" fill="#FFFFFF" opacity="0.9"/><circle cx="67" cy="26" r="2.4" fill="#FFFFFF" opacity="0.9"/>' +
        '<g fill="#3F8A32" opacity="0.7"><circle cx="34" cy="52" r="3"/><circle cx="62" cy="56" r="2.6"/><circle cx="48" cy="46" r="2.4"/></g>'
    },
    {
      id: 'penguin', label: '企鵝',
      svg: ground(24, 92) +
        '<path d="M34 88 C30 94 22 94 22 90 C22 87 28 85 34 86 Z" fill="#EFA02E" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M66 88 C70 94 78 94 78 90 C78 87 72 85 66 86 Z" fill="#EFA02E" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M50 10 C32 10 22 28 22 52 C22 76 34 90 50 90 C66 90 78 76 78 52 C78 28 68 10 50 10 Z" ' +
        'fill="#2E3640" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M22 44 C14 50 12 70 18 82 C22 88 28 86 28 78 Z" fill="#232A32" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M78 44 C86 50 88 70 82 82 C78 88 72 86 72 78 Z" fill="#1C222A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M50 26 C38 26 32 42 32 58 C32 76 40 88 50 88 C60 88 68 76 68 58 C68 42 62 26 50 26 Z" fill="#F7F3EC"/>' +
        '<path d="M50 40 L60 48 L50 56 L40 48 Z" fill="#EFA02E" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        eye(40, 34, 3.8) + eye(60, 34, 3.8)
    },
    {
      id: 'owl', label: '貓頭鷹',
      svg: ground(24, 90) +
        '<path d="M36 84 C32 90 26 90 26 87 C26 84 30 83 36 84 M64 84 C68 90 74 90 74 87 C74 84 70 83 64 84" ' +
        'fill="#EFA02E" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M50 12 C32 12 20 30 20 54 C20 74 34 86 50 86 C66 86 80 74 80 54 C80 30 68 12 50 12 Z" ' +
        'fill="#8A6B4A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 18 C76 28 80 40 80 54 C80 74 66 86 50 86 C66 80 72 66 72 50 C72 34 68 22 66 18 Z" fill="#6B5236" opacity="0.75"/>' +
        '<path d="M24 26 L30 12 L42 24 Z" fill="#8A6B4A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M76 26 L70 12 L58 24 Z" fill="#8A6B4A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<g fill="#C9A87A" opacity="0.9"><path d="M30 58 C36 62 42 62 48 58 M52 58 C58 62 64 62 70 58 M34 70 C40 74 46 74 50 70 M50 70 C56 74 62 74 66 70"/>' +
        '<path d="M28 58 C34 64 42 64 48 58 L48 62 C42 68 32 66 28 62 Z"/><path d="M72 58 C66 64 58 64 52 58 L52 62 C58 68 68 66 72 62 Z"/>' +
        '<path d="M32 70 C38 76 46 76 50 70 L50 74 C44 80 36 78 32 74 Z"/><path d="M68 70 C62 76 54 76 50 70 L50 74 C56 80 64 78 68 74 Z"/></g>' +
        '<circle cx="37" cy="40" r="14" fill="#F2E2C4" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="63" cy="40" r="14" fill="#F2E2C4" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="37" cy="40" r="8" fill="#EFA02E"/><circle cx="63" cy="40" r="8" fill="#EFA02E"/>' +
        '<circle cx="37" cy="40" r="5" fill="#241B14"/><circle cx="63" cy="40" r="5" fill="#241B14"/>' +
        '<circle cx="34" cy="37" r="2" fill="#FFF" opacity="0.9"/><circle cx="60" cy="37" r="2" fill="#FFF" opacity="0.9"/>' +
        '<path d="M50 46 L56 54 L50 60 L44 54 Z" fill="#EFA02E" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>'
    },
    {
      id: 'chick', label: '小雞',
      svg: ground(22, 90) +
        '<path d="M40 86 L36 94 M40 86 L44 94 M60 86 L56 94 M60 86 L64 94" stroke="#EFA02E" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="50" cy="62" rx="28" ry="26" fill="#F7CE3A" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 42 C76 49 78 55 78 62 C78 77 65 88 50 88 C64 83 70 73 70 60 C70 50 68 45 66 42 Z" fill="#D6A80E" opacity="0.7"/>' +
        '<path d="M24 58 C16 62 14 72 22 76 C28 78 32 72 32 66 Z" fill="#E8BC22" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="32" rx="21" ry="19" fill="#FBDC55" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M50 13 C48 8 52 4 55 6 C56 10 54 13 50 13 Z" fill="#F5C21E" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 34 L60 39 L50 44 Z" fill="#EFA02E" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        eye(42, 30, 3.4) + eye(58, 30, 3.4)
    },
    {
      id: 'duck', label: '鴨子',
      svg: ground(26, 90) +
        '<path d="M38 86 L32 94 M38 86 L44 94 M60 86 L54 94 M60 86 L66 94" stroke="#EFA02E" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M22 60 C22 44 36 34 52 34 C72 34 84 48 84 64 C84 78 70 88 52 88 C34 88 22 76 22 60 Z" ' +
        'fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M68 40 C80 48 84 56 84 64 C84 78 70 88 52 88 C72 84 78 72 78 60 C78 50 72 43 68 40 Z" fill="#DAD3C8" opacity="0.8"/>' +
        '<path d="M40 58 C48 66 62 68 74 62" fill="none" stroke="#C4BCAE" stroke-width="2.4" stroke-linecap="round"/>' +
        '<ellipse cx="34" cy="30" rx="20" ry="18" fill="#FBF7F0" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M16 32 C4 32 2 42 10 44 C18 46 26 42 26 36 Z" fill="#EFA02E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M8 38 C14 40 22 40 26 38" fill="none" stroke="#C4780E" stroke-width="1.8"/>' +
        eye(32, 26, 3.6)
    },
    {
      id: 'whale', label: '鯨魚',
      svg: ground(30, 88) +
        '<path d="M46 22 C42 14 44 6 48 4 C52 8 52 16 50 22 M50 22 C54 14 60 10 64 12 C62 18 56 22 52 24" ' +
        'fill="none" stroke="#9EC8E0" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M14 58 C14 40 34 30 54 32 C74 34 86 46 86 58 C86 72 72 84 52 84 C30 84 14 74 14 58 Z" ' +
        'fill="#3E6A9C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 36 C80 42 86 50 86 58 C86 72 72 84 52 84 C74 80 80 66 78 54 C76 44 70 38 66 36 Z" fill="#2C5079" opacity="0.8"/>' +
        '<path d="M14 58 C8 46 4 40 2 40 C4 50 4 66 2 76 C4 76 10 70 16 62 Z" fill="#3E6A9C" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M24 66 C34 78 56 82 76 74 C64 82 34 84 24 66 Z" fill="#CFE2F0"/>' +
        '<path d="M22 62 C34 76 58 80 78 72" fill="none" stroke="#CFE2F0" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M50 66 C56 74 64 78 72 78" fill="none" stroke="#2C5079" stroke-width="2.2" opacity="0.6"/>' +
        eye(36, 52, 3.6)
    },
    {
      id: 'dolphin', label: '海豚',
      svg: ground(28, 88) +
        '<path d="M48 34 C48 22 54 14 60 14 C58 22 58 30 56 38 Z" fill="#6B93B8" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M10 52 C22 34 46 30 66 38 C80 44 88 54 90 62 C82 60 76 62 72 66 C64 76 44 82 26 76 C14 72 8 62 10 52 Z" ' +
        'fill="#7FA8CC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 38 C80 44 88 54 90 62 C82 60 76 62 72 66 C64 76 44 82 26 76 C50 78 68 68 72 56 C74 48 70 41 66 38 Z" fill="#5A85AD" opacity="0.8"/>' +
        '<path d="M90 62 C96 56 98 48 96 44 C92 48 88 54 88 60 Z" fill="#7FA8CC" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M44 68 C50 80 60 86 68 84 C58 82 50 76 46 68 Z" fill="#6B93B8" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M14 58 C28 66 52 70 74 64" fill="none" stroke="#DCE9F2" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M10 52 C6 50 4 52 4 56 C6 58 9 57 11 55 Z" fill="#5A85AD" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        eye(22, 52, 3.4)
    },
    {
      id: 'octopus', label: '章魚',
      svg: ground(30, 94) +
        '<g fill="#D2597A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round">' +
        '<path d="M20 60 C8 66 2 82 8 92 C14 98 22 92 20 82 C19 74 19 66 22 60 Z"/>' +
        '<path d="M35 68 C28 78 26 90 32 94 C40 96 42 86 40 76 C39 72 37 69 35 68 Z"/>' +
        '<path d="M50 70 C46 80 46 92 52 94 C60 94 60 84 57 74 C55 71 52 69 50 70 Z"/>' +
        '<path d="M65 68 C72 78 74 90 68 94 C60 96 58 86 60 76 C61 72 63 69 65 68 Z"/>' +
        '<path d="M80 60 C92 66 98 82 92 92 C86 98 78 92 80 82 C81 74 81 66 78 60 Z"/></g>' +
        '<g fill="#F2A0B4" opacity="0.9"><circle cx="14" cy="80" r="2.6"/><circle cx="34" cy="86" r="2.4"/>' +
        '<circle cx="53" cy="88" r="2.4"/><circle cx="66" cy="86" r="2.4"/><circle cx="86" cy="80" r="2.6"/></g>' +
        '<path d="M50 10 C28 10 16 28 16 48 C16 62 30 72 50 72 C70 72 84 62 84 48 C84 28 72 10 50 10 Z" ' +
        'fill="#E06A8A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M68 18 C79 28 84 38 84 48 C84 62 70 72 50 72 C70 68 76 56 76 44 C76 30 71 22 68 18 Z" fill="#B84266" opacity="0.8"/>' +
        '<path d="M28 26 C30 18 38 14 46 15" fill="none" stroke="#F7C0CC" stroke-width="6" stroke-linecap="round" opacity="0.75"/>' +
        '<circle cx="38" cy="42" r="8" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="62" cy="42" r="8" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="38" cy="43" r="4" fill="#241B14"/><circle cx="62" cy="43" r="4" fill="#241B14"/>' +
        '<circle cx="36" cy="40" r="1.6" fill="#FFF"/><circle cx="60" cy="40" r="1.6" fill="#FFF"/>' +
        '<path d="M44 58 Q50 63 56 58" fill="none" stroke="#A83A5C" stroke-width="2.4" stroke-linecap="round"/>'
    },
    {
      id: 'crab', label: '螃蟹',
      svg: ground(30, 88) +
        '<g stroke="' + INK + '" stroke-width="2.5" fill="#D6472E" stroke-linejoin="round">' +
        '<path d="M22 56 C10 52 4 40 8 32 C14 26 22 30 24 38 C26 44 24 50 26 54 Z"/>' +
        '<path d="M78 56 C90 52 96 40 92 32 C86 26 78 30 76 38 C74 44 76 50 74 54 Z"/></g>' +
        '<path d="M8 32 C4 26 8 20 14 22 C18 24 18 30 14 33 Z" fill="#E8604A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M92 32 C96 26 92 20 86 22 C82 24 82 30 86 33 Z" fill="#E8604A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<g stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round" fill="none">' +
        '<path d="M26 70 L12 78 M28 78 L16 88 M74 70 L88 78 M72 78 L84 88"/></g>' +
        '<path d="M50 40 C28 40 16 52 16 64 C16 76 30 84 50 84 C70 84 84 76 84 64 C84 52 72 40 50 40 Z" ' +
        'fill="#E0523A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M68 44 C79 50 84 56 84 64 C84 76 70 84 50 84 C70 80 78 70 78 60 C78 52 72 46 68 44 Z" fill="#B4361F" opacity="0.8"/>' +
        '<path d="M34 62 C40 68 60 68 66 62" fill="none" stroke="#8A2614" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M38 34 L38 46 M62 34 L62 46" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="38" cy="32" r="5" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="62" cy="32" r="5" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="38" cy="32" r="2.4" fill="#241B14"/><circle cx="62" cy="32" r="2.4" fill="#241B14"/>'
    },
    {
      id: 'turtle', label: '烏龜',
      svg: ground(30, 88) +
        '<g fill="#6FA85C" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round">' +
        '<ellipse cx="22" cy="74" rx="10" ry="7"/><ellipse cx="78" cy="74" rx="10" ry="7"/>' +
        '<ellipse cx="34" cy="82" rx="9" ry="6"/><ellipse cx="66" cy="82" rx="9" ry="6"/></g>' +
        '<path d="M84 62 C92 60 96 64 94 68 C90 70 86 68 84 64 Z" fill="#6FA85C" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M18 58 C8 54 4 44 10 38 C16 34 24 38 26 46 C27 52 24 56 22 58 Z" ' +
        'fill="#7FBF6A" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        eye(14, 44, 3.2) +
        '<path d="M50 26 C26 26 12 44 12 60 C12 72 28 80 50 80 C72 80 88 72 88 60 C88 44 74 26 50 26 Z" ' +
        'fill="#8A6B3C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M68 30 C82 40 88 50 88 60 C88 72 72 80 50 80 C74 76 82 64 80 52 C78 42 72 33 68 30 Z" fill="#6B5028" opacity="0.8"/>' +
        '<g fill="#B59A5A" stroke="#6B5028" stroke-width="1.8">' +
        '<path d="M50 34 L62 42 L58 56 L42 56 L38 42 Z"/>' +
        '<path d="M28 44 L38 42 L42 56 L30 60 L22 52 Z"/><path d="M72 44 L62 42 L58 56 L70 60 L78 52 Z"/>' +
        '<path d="M42 58 L58 58 L56 72 L44 72 Z"/><path d="M30 62 L42 58 L44 72 L32 74 Z"/><path d="M70 62 L58 58 L56 72 L68 74 Z"/></g>'
    },
    {
      id: 'snail', label: '蝸牛',
      svg: ground(28, 90) +
        '<path d="M22 86 C14 86 10 78 14 72 C18 66 26 62 34 62 L70 62 C82 62 88 72 84 80 C82 86 74 88 66 88 Z" ' +
        'fill="#D9BE96" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M20 68 C16 62 18 52 24 48 M30 66 C28 58 30 50 34 46" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="24" cy="46" r="3.6" fill="#3B2C22"/><circle cx="35" cy="44" r="3.6" fill="#3B2C22"/>' +
        '<path d="M62 66 C40 66 30 52 34 38 C38 24 56 18 70 24 C84 30 88 46 82 58 C76 68 68 70 62 66 Z" ' +
        'fill="#C4884A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 60 C48 60 42 50 45 40 C48 30 60 26 70 30 C80 34 82 46 78 54 C74 60 68 62 62 60 Z" ' +
        'fill="none" stroke="#8A5A22" stroke-width="2.4"/>' +
        '<path d="M62 52 C54 52 51 46 53 41 C56 35 63 34 68 37 C73 40 74 47 71 51" fill="none" stroke="#8A5A22" stroke-width="2.4"/>' +
        '<path d="M62 45 C59 45 58 43 59 41 C61 39 64 40 65 42" fill="none" stroke="#8A5A22" stroke-width="2.2"/>' +
        '<path d="M70 24 C82 30 88 46 82 58 C79 63 75 66 71 68 C80 58 82 40 70 24 Z" fill="#9A6428" opacity="0.75"/>'
    },
    {
      id: 'bee', label: '蜜蜂',
      svg: ground(24, 92) +
        '<path d="M46 38 C34 22 16 18 10 24 C6 32 20 42 42 46 Z" fill="#D8E8F5" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round" opacity="0.95"/>' +
        '<path d="M54 38 C66 22 84 18 90 24 C94 32 80 42 58 46 Z" fill="#D8E8F5" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round" opacity="0.95"/>' +
        '<path d="M20 26 C28 30 36 36 42 42 M80 26 C72 30 64 36 58 42" fill="none" stroke="#A8C4DC" stroke-width="1.8"/>' +
        '<ellipse cx="50" cy="62" rx="30" ry="26" fill="#F2C41E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<g fill="#2C2621">' +
        '<path d="M30.8 42 Q25 47 22.3 52 L77.7 52 Q75 47 69.2 42 Z"/>' +
        '<path d="M20.4 58 L79.6 58 L79.2 68 L20.8 68 Z"/>' +
        '<path d="M23.4 74 L76.6 74 Q71 80 66 84 L34 84 Q29 80 23.4 74 Z"/></g>' +
        '<ellipse cx="50" cy="62" rx="30" ry="26" fill="none" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M38 24 C34 16 28 12 24 12 M62 24 C66 16 72 12 76 12" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="24" cy="11" r="3.4" fill="#2C2621"/><circle cx="76" cy="11" r="3.4" fill="#2C2621"/>' +
        '<circle cx="41" cy="47" r="4" fill="#F7F3EC"/><circle cx="59" cy="47" r="4" fill="#F7F3EC"/>' +
        '<circle cx="41" cy="47" r="2.4" fill="#241B14"/><circle cx="59" cy="47" r="2.4" fill="#241B14"/>'
    },
    {
      id: 'mouse', label: '老鼠',
      svg: ground(24) +
        '<path d="M78 70 C90 68 94 78 88 86 C84 90 78 88 78 82" fill="none" stroke="#C4A08A" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="24" cy="34" r="19" fill="#A89A94" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="76" cy="34" r="19" fill="#A89A94" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="24" cy="34" r="11" fill="#F0BCC4"/><circle cx="76" cy="34" r="11" fill="#F0BCC4"/>' +
        '<ellipse cx="50" cy="62" rx="28" ry="26" fill="#B5A8A2" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M64 42 C75 49 78 55 78 62 C78 77 65 88 50 88 C64 83 70 73 70 60 C70 50 66 45 64 42 Z" fill="#8E837E" opacity="0.75"/>' +
        '<ellipse cx="50" cy="72" rx="14" ry="10" fill="#E4DAD4"/>' +
        eye(40, 58, 3.8) + eye(60, 58, 3.8) + nose(50, 70, 4, '#D48294') + whiskers(50, 74)
    },
    {
      id: 'butterfly', label: '蝴蝶',
      svg: ground(22, 92) +
        '<path d="M46 48 C34 22 12 18 8 32 C4 46 22 54 44 54 Z" fill="#E8742E" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M54 48 C66 22 88 18 92 32 C96 46 78 54 56 54 Z" fill="#E8742E" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M46 54 C36 66 16 74 14 84 C12 92 30 92 40 82 C46 76 47 64 47 58 Z" fill="#F2A03C" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M54 54 C64 66 84 74 86 84 C88 92 70 92 60 82 C54 76 53 64 53 58 Z" fill="#F2A03C" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M40 26 C30 22 18 24 14 30 C22 26 32 26 40 30 Z" fill="#2C2621" opacity="0.85"/>' +
        '<path d="M60 26 C70 22 82 24 86 30 C78 26 68 26 60 30 Z" fill="#2C2621" opacity="0.85"/>' +
        '<g fill="#FBF3E4"><circle cx="26" cy="38" r="4.4"/><circle cx="74" cy="38" r="4.4"/>' +
        '<circle cx="30" cy="78" r="3.4"/><circle cx="70" cy="78" r="3.4"/></g>' +
        '<ellipse cx="50" cy="58" rx="5.4" ry="24" fill="#4A3A2E" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<path d="M46 34 C42 24 36 18 32 16 M54 34 C58 24 64 18 68 16" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="32" cy="15" r="3" fill="#2C2621"/><circle cx="68" cy="15" r="3" fill="#2C2621"/>'
    },
    {
      id: 'ladybug', label: '瓢蟲',
      svg: ground(28, 90) +
        '<path d="M50 22 C40 22 32 16 30 8 M50 22 C60 22 68 16 70 8" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="30" cy="7" r="3.6" fill="#2C2621"/><circle cx="70" cy="7" r="3.6" fill="#2C2621"/>' +
        '<ellipse cx="50" cy="58" rx="36" ry="32" fill="#D6291F" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M70 34 C82 42 86 50 86 58 C86 76 70 90 50 90 C68 84 76 72 76 56 C76 44 73 38 70 34 Z" fill="#A31712" opacity="0.75"/>' +
        '<path d="M22 34 A36 32 0 0 1 78 34 Z" fill="#2C2621" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M50 26 L50 90" stroke="#2C2621" stroke-width="3"/>' +
        '<g fill="#2C2621"><circle cx="31" cy="52" r="6"/><circle cx="69" cy="52" r="6"/>' +
        '<circle cx="34" cy="74" r="5"/><circle cx="66" cy="74" r="5"/><circle cx="50" cy="82" r="4.4"/></g>' +
        '<circle cx="40" cy="30" r="3.4" fill="#F7F3EC"/><circle cx="60" cy="30" r="3.4" fill="#F7F3EC"/>' +
        '<circle cx="40" cy="30" r="1.8" fill="#241B14"/><circle cx="60" cy="30" r="1.8" fill="#241B14"/>' +
        '<ellipse cx="34" cy="48" rx="7" ry="4.4" fill="#FFFFFF" opacity="0.28" transform="rotate(-34 34 48)"/>'
    },
    {
      id: 'goldfish', label: '金魚',
      svg: ground(26, 90) +
        '<path d="M64 52 C78 34 92 34 94 44 C96 54 88 58 78 58 C88 60 94 66 92 74 C88 84 74 80 64 62 Z" ' +
        'fill="#F5A44A" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round" opacity="0.95"/>' +
        '<path d="M44 26 C50 14 60 12 64 18 C62 26 54 32 46 34 Z" fill="#F5A44A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round" opacity="0.95"/>' +
        '<ellipse cx="42" cy="56" rx="32" ry="27" fill="#EE7D22" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M56 34 C68 42 74 50 74 58 C74 72 60 83 42 83 C60 78 68 66 66 54 C64 44 60 37 56 34 Z" fill="#C45A0C" opacity="0.75"/>' +
        '<path d="M36 80 C42 90 56 92 62 86 C54 86 44 84 38 78 Z" fill="#F5A44A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M22 44 C28 54 28 62 22 70" fill="none" stroke="#FBC98A" stroke-width="5" stroke-linecap="round" opacity="0.8"/>' +
        '<path d="M56 40 C58 52 58 62 56 72" fill="none" stroke="#C45A0C" stroke-width="2.4" opacity="0.6"/>' +
        '<circle cx="26" cy="50" r="6" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="25" cy="50" r="3" fill="#241B14"/>' +
        '<path d="M12 58 C16 62 20 62 22 60" fill="none" stroke="#C45A0C" stroke-width="2.2" stroke-linecap="round"/>'
    },
    {
      id: 'shark', label: '鯊魚',
      svg: ground(30, 88) +
        '<path d="M48 30 L62 8 L66 32 Z" fill="#6E7C88" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M10 58 C10 42 30 32 52 34 C74 36 86 46 90 56 C86 68 74 80 52 82 C30 84 10 74 10 58 Z" ' +
        'fill="#8494A0" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 38 C80 44 87 50 90 56 C86 68 74 80 52 82 C74 76 82 64 80 52 C78 44 70 39 66 38 Z" fill="#616F7B" opacity="0.8"/>' +
        '<path d="M90 56 C96 44 98 38 98 36 C94 44 90 48 88 50 M90 58 C96 70 98 78 98 80 C94 72 90 66 88 62 Z" ' +
        'fill="#6E7C88" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M48 76 C52 86 60 90 66 88 C58 86 52 82 50 76 Z" fill="#6E7C88" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M14 66 C30 76 56 78 80 70" fill="none" stroke="#D2DBE2" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M12 62 C22 70 36 74 50 74" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<g stroke="#F7F3EC" stroke-width="2" stroke-linecap="round"><path d="M18 64 L20 68 M26 68 L27 72 M34 71 L35 75 M42 73 L43 77"/></g>' +
        '<g stroke="#616F7B" stroke-width="2" stroke-linecap="round"><path d="M56 44 L58 52 M63 44 L65 52 M70 45 L72 53"/></g>' +
        eye(34, 52, 3.6)
    },
    {
      id: 'starfish', label: '海星',
      svg: ground(30, 92) +
        '<path d="M50 8 L63 42 L98 44 L70 65 L80 96 L50 77 L20 96 L30 65 L2 44 L37 42 Z" ' +
        'fill="#EE8A2E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M63 42 L98 44 L70 65 L80 96 L50 77 C62 72 70 58 68 44 Z" fill="#C4650C" opacity="0.7"/>' +
        '<g fill="#F7C078"><circle cx="50" cy="30" r="2.6"/><circle cx="50" cy="42" r="2.6"/>' +
        '<circle cx="38" cy="50" r="2.4"/><circle cx="62" cy="50" r="2.4"/><circle cx="43" cy="64" r="2.4"/>' +
        '<circle cx="57" cy="64" r="2.4"/><circle cx="30" cy="52" r="2.2"/><circle cx="70" cy="52" r="2.2"/>' +
        '<circle cx="50" cy="56" r="3"/><circle cx="36" cy="76" r="2.2"/><circle cx="64" cy="76" r="2.2"/></g>' +
        '<path d="M50 8 L63 42 L37 42 Z" fill="#F7A855" opacity="0.55"/>'
    },
    {
      id: 'jellyfish', label: '水母',
      svg: ground(24, 94) +
        '<g fill="none" stroke="#B49CD9" stroke-width="3.4" stroke-linecap="round">' +
        '<path d="M30 60 C26 72 32 80 28 92 M42 63 C38 74 44 82 40 94 M58 63 C62 74 56 82 60 94 M70 60 C74 72 68 80 72 92"/></g>' +
        '<g fill="none" stroke="#D2BCF0" stroke-width="2.4" stroke-linecap="round" opacity="0.9">' +
        '<path d="M36 62 C32 74 38 82 34 92 M50 64 C48 76 52 84 50 94 M64 62 C68 74 62 82 66 92"/></g>' +
        '<path d="M14 56 C14 32 30 16 50 16 C70 16 86 32 86 56 C86 62 78 65 68 61 C60 65 40 65 32 61 C22 65 14 62 14 56 Z" ' +
        'fill="#9C7ECC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 20 C78 28 86 40 86 56 C86 62 78 65 68 61 C74 56 76 40 66 20 Z" fill="#7A5CAA" opacity="0.75"/>' +
        '<path d="M24 44 C24 30 34 22 46 22" fill="none" stroke="#E0D2F5" stroke-width="6" stroke-linecap="round" opacity="0.85"/>' +
        '<g fill="#C4ACE8" opacity="0.85"><ellipse cx="38" cy="50" rx="6" ry="4"/><ellipse cx="58" cy="46" rx="5" ry="3.4"/></g>'
    },
    {
      id: 'kangaroo', label: '袋鼠',
      svg: ground(26, 92) +
        '<path d="M34 74 C18 78 6 88 8 94 C20 94 34 88 44 82 Z" fill="#A87038" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M40 46 C28 52 24 68 30 80 C36 90 52 92 62 86 C74 78 76 60 68 50 C60 40 48 40 40 46 Z" ' +
        'fill="#C9884A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 48 C74 56 76 72 66 84 C60 90 52 92 46 91 C60 88 68 74 66 60 C65 54 63 50 62 48 Z" fill="#9E6B2E" opacity="0.75"/>' +
        '<path d="M40 64 C40 78 50 86 60 84 C58 70 50 62 40 64 Z" fill="#EFD8B4" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M30 78 C24 86 26 94 36 94 L58 94 C64 94 64 88 58 86 C48 84 38 82 30 78 Z" ' +
        'fill="#B57C42" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M52 52 C46 46 44 40 46 36" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M60 18 C56 8 56 2 60 2 C64 4 64 14 64 22 Z" fill="#B57C42" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M74 20 C76 10 80 4 84 6 C84 14 80 22 76 26 Z" fill="#B57C42" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M61 8 C60 14 60 18 61 21 M78 12 C77 18 76 22 75 25" fill="none" stroke="#E8C49A" stroke-width="2.6"/>' +
        '<path d="M62 22 C50 26 44 36 48 46 C52 54 64 56 74 52 C86 47 92 40 92 36 C92 32 86 30 82 32 ' +
        'C78 26 70 20 62 22 Z" fill="#C9884A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<ellipse cx="90" cy="36" rx="3.4" ry="2.8" fill="#3B2C22"/>' +
        eye(70, 34, 3.8)
    },
    {
      id: 'raccoon', label: '浣熊',
      svg: ground(26) +
        '<path d="M76 62 C90 58 96 70 90 80" fill="none" stroke="#8E959C" stroke-width="10" stroke-linecap="round"/>' +
        '<g stroke="#3B3A40" stroke-width="4" stroke-linecap="round"><path d="M80 61 L84 70 M89 66 L91 74"/></g>' +
        '<path d="M24 34 L18 12 L40 24 Z" fill="#9AA0A8" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M76 34 L82 12 L60 24 Z" fill="#9AA0A8" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="58" rx="32" ry="29" fill="#A8AEB6" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M68 36 C79 44 82 51 82 58 C82 74 68 87 50 87 C65 81 72 71 72 56 C72 46 70 40 68 36 Z" fill="#878D95" opacity="0.75"/>' +
        '<path d="M50 40 C40 40 32 48 30 58 C34 66 42 68 50 66 C58 68 66 66 70 58 C68 48 60 40 50 40 Z" fill="#F2EFEA"/>' +
        '<path d="M28 48 C34 40 46 40 48 52 C44 60 32 60 28 52 Z" fill="#2C2621"/>' +
        '<path d="M72 48 C66 40 54 40 52 52 C56 60 68 60 72 52 Z" fill="#2C2621"/>' +
        '<circle cx="37" cy="50" r="3.6" fill="#F7F3EC"/><circle cx="63" cy="50" r="3.6" fill="#F7F3EC"/>' +
        '<circle cx="37" cy="50" r="2.2" fill="#241B14"/><circle cx="63" cy="50" r="2.2" fill="#241B14"/>' +
        nose(50, 66, 4.4, '#2C2621') + whiskers(50, 70)
    },
    {
      id: 'parrot', label: '鸚鵡',
      svg: ground(22, 92) +
        '<path d="M56 70 C74 80 84 92 78 96 C70 98 56 86 50 74 Z" fill="#2E8A5E" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M40 18 C24 24 16 42 20 60 C24 78 40 88 54 84 C70 80 78 62 74 44 C70 26 56 12 40 18 Z" ' +
        'fill="#3FAF72" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M58 18 C70 26 76 40 74 56 C72 72 62 84 50 86 C64 78 70 62 68 46 C66 32 62 22 58 18 Z" fill="#2C8A56" opacity="0.8"/>' +
        '<path d="M44 12 C46 4 54 2 58 8 C56 14 50 16 44 14 Z" fill="#E8434F" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M62 44 C74 50 80 64 74 76 C66 84 58 72 56 58 Z" fill="#2C7A4E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M62 48 C70 54 74 64 70 72" fill="none" stroke="#F2C41E" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M32 42 C36 34 44 30 50 32 C46 40 40 46 34 48 Z" fill="#F2C41E"/>' +
        '<path d="M28 40 C18 38 14 46 20 52 C25 56 30 50 30 44 Z" fill="#E8B024" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M20 46 C24 50 28 50 30 48" fill="none" stroke="#B07C0C" stroke-width="1.8"/>' +
        eye(38, 38, 3.8)
    }
  ];

  /* ---- 第二批：再加 18 種，動物的造型池從 42 種變成 60 種 ----
     既有的頭像類已經很擠了，所以這批幾乎都走「全身剪影」：長脖子（馬、駱駝、
     天鵝、紅鶴）、展開的翅膀或尾巴（蝙蝠、孔雀、蜻蜓）、多腳的蟲（螞蟻、蜘蛛、
     獨角仙）與水裡的（海馬、蝦子、海豹、扇貝），縮到一格四十幾像素也分得出來。 */
  var MORE = [
    {
      id: 'horse', label: '馬',
      svg: ground(26, 93) +
        '<path d="M46 40 C62 46 74 62 76 80 C77 88 72 92 64 92 L40 92 C34 84 32 66 36 52 Z" ' +
        'fill="#8A5A2E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M48 26 C60 34 72 54 76 78 C70 76 66 72 62 66 C56 54 50 42 44 34 Z" fill="#3B2C22"/>' +
        '<path d="M44 26 L42 12 L54 22 Z" fill="#9A6836" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M54 24 L58 12 L66 26 Z" fill="#7A4A22" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M18 34 C12 32 12 24 18 22 C28 18 40 22 48 30 C54 36 54 46 48 50 C40 55 28 50 22 44 C19 41 18 38 18 34 Z" ' +
        'fill="#9A6836" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M18 34 C12 32 12 24 18 22 C23 20 28 21 32 23 C28 27 25 32 23 38 C21 38 19 36 18 34 Z" fill="#EFE3D2" opacity="0.9"/>' +
        '<ellipse cx="17" cy="29" rx="2.4" ry="3.2" fill="#3B2C22"/>' +
        eye(38, 32, 3.6)
    },
    {
      id: 'camel', label: '駱駝',
      svg: ground(30, 93) +
        '<g fill="#B98C4E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round">' +
        '<path d="M36 66 L34 90 L42 90 L42 66 Z"/><path d="M48 66 L47 90 L55 90 L54 66 Z"/>' +
        '<path d="M64 66 L63 90 L71 90 L70 66 Z"/><path d="M74 66 L74 90 L82 90 L80 66 Z"/></g>' +
        '<path d="M28 60 C28 48 34 42 44 42 C48 32 60 30 64 40 C72 32 84 36 86 46 C88 56 86 66 78 70 L36 70 C30 70 28 66 28 60 Z" ' +
        'fill="#D3A96A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 40 C72 32 84 36 86 46 C88 56 86 66 78 70 L60 70 C72 64 74 50 64 40 Z" fill="#B4884A" opacity="0.8"/>' +
        '<path d="M30 58 C22 46 20 30 26 20 L38 22 C34 34 34 46 38 58 Z" ' +
        'fill="#D3A96A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M26 20 C18 18 12 20 12 26 C12 32 18 34 24 32 L38 28 C41 22 34 18 26 20 Z" ' +
        'fill="#DDB477" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M28 15 L27 20 M36 17 L37 22" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<ellipse cx="13" cy="27" rx="2.4" ry="3" fill="#3B2C22"/>' +
        eye(27, 24, 3.2) +
        '<path d="M86 52 C93 56 93 66 88 72" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'
    },
    {
      id: 'sloth', label: '樹懶',
      svg: '<path d="M6 18 C30 12 70 12 94 18" fill="none" stroke="#6B4A2A" stroke-width="9" stroke-linecap="round"/>' +
        '<g fill="#8E7657" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round">' +
        '<path d="M32 22 C20 26 16 40 22 52 C26 60 34 58 34 50 C34 40 34 30 40 26 Z"/>' +
        '<path d="M68 22 C80 26 84 40 78 52 C74 60 66 58 66 50 C66 40 66 30 60 26 Z"/></g>' +
        '<g fill="none" stroke="#4E3620" stroke-width="3" stroke-linecap="round">' +
        '<path d="M26 22 C22 16 24 12 28 12 M34 20 C32 14 34 11 38 12 M74 22 C78 16 76 12 72 12 M66 20 C68 14 66 11 62 12"/></g>' +
        '<ellipse cx="50" cy="64" rx="23" ry="24" fill="#A08A6E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M62 46 C70 52 73 62 73 68 C73 80 63 88 50 88 C62 82 66 72 66 62 C66 55 64 49 62 46 Z" fill="#7E6748" opacity="0.85"/>' +
        '<circle cx="50" cy="44" r="20" fill="#CBB89A" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<g fill="#6E5537"><path d="M32 40 C34 32 42 30 46 36 C44 44 36 46 32 40 Z"/>' +
        '<path d="M68 40 C66 32 58 30 54 36 C56 44 64 46 68 40 Z"/></g>' +
        eye(40, 40, 3.4) + eye(60, 40, 3.4) +
        nose(50, 50, 4.4, '#4E3620') +
        '<path d="M42 56 C46 60 54 60 58 56" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>'
    },
    {
      id: 'bat', label: '蝙蝠',
      svg: ground(24, 92) +
        '<g fill="#4A3A5C" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round">' +
        '<path d="M38 48 C26 36 12 34 4 42 C12 44 14 50 10 56 C20 56 24 62 22 70 C30 62 36 60 40 62 Z"/>' +
        '<path d="M62 48 C74 36 88 34 96 42 C88 44 86 50 90 56 C80 56 76 62 78 70 C70 62 64 60 60 62 Z"/></g>' +
        '<g fill="none" stroke="#2E2438" stroke-width="1.8" opacity="0.8">' +
        '<path d="M38 50 L14 44 M38 56 L16 54 M38 62 L22 66 M62 50 L86 44 M62 56 L84 54 M62 62 L78 66"/></g>' +
        '<ellipse cx="50" cy="62" rx="15" ry="20" fill="#5C4A70" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M42 24 L36 6 L54 20 Z" fill="#5C4A70" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M58 24 L64 6 L46 20 Z" fill="#4A3A5C" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="36" r="17" fill="#6B5680" stroke="' + INK + '" stroke-width="2.6"/>' +
        eye(43, 34, 3.6) + eye(57, 34, 3.6) +
        nose(50, 44, 3.4, '#2E2438') +
        '<g fill="#FFFFFF"><path d="M45 46 L44 52 L48 47 Z"/><path d="M55 46 L56 52 L52 47 Z"/></g>'
    },
    {
      id: 'swan', label: '天鵝',
      svg: '<path d="M6 86 C24 80 40 90 58 84 C74 79 86 86 96 82" fill="none" stroke="#8FC5DE" stroke-width="4" stroke-linecap="round" opacity="0.9"/>' +
        '<path d="M20 72 C20 58 34 50 52 50 C72 50 86 58 86 68 C86 78 72 84 52 84 C32 84 20 80 20 72 Z" ' +
        'fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 52 C78 56 86 60 86 68 C86 78 72 84 52 84 C72 80 80 70 76 62 C73 57 68 54 62 52 Z" fill="#DED8CC" opacity="0.9"/>' +
        '<path d="M40 64 C30 54 30 32 42 22 C52 14 68 16 72 26 C63 22 55 24 51 32 C46 42 47 54 51 64 Z" ' +
        'fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<ellipse cx="67" cy="24" rx="12" ry="10" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M77 21 L92 26 L77 31 Z" fill="#E8892E" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M72 17 C77 17 79 19 79 22 L70 22 Z" fill="#2E2418"/>' +
        eye(70, 22, 3) +
        '<path d="M34 66 C38 54 52 50 64 54 C74 58 78 68 72 78 C62 84 44 80 34 66 Z" ' +
        'fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#CFC8BA" stroke-width="1.8"><path d="M42 66 C50 60 60 58 68 62 M44 74 C52 68 62 66 71 70"/></g>'
    },
    {
      id: 'flamingo', label: '紅鶴',
      svg: ground(16, 95) +
        '<g fill="none" stroke="#E8892E" stroke-width="4" stroke-linecap="round">' +
        '<path d="M52 68 L50 92 M44 92 L58 92 M60 66 C66 72 63 78 57 78"/></g>' +
        '<ellipse cx="52" cy="56" rx="26" ry="18" fill="#F49BB4" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M62 42 C74 46 78 54 78 58 C78 68 66 74 52 74 C68 70 74 60 70 50 C68 46 65 43 62 42 Z" fill="#DB7392" opacity="0.85"/>' +
        '<path d="M36 52 C44 44 60 44 68 52 C62 62 44 64 36 52 Z" fill="#FBC0CE" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M38 46 C28 36 30 20 42 14 C52 9 65 14 65 24 C58 18 50 18 46 24 C41 32 42 40 46 48 Z" ' +
        'fill="#F49BB4" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<ellipse cx="60" cy="20" rx="11" ry="9" fill="#F8AEC2" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M68 15 L86 21 C81 28 70 28 66 23 Z" fill="#F0E6D2" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M76 19 L86 21 C84 26 78 26 74 24 Z" fill="#2E2418"/>' +
        eye(62, 18, 3)
    },
    {
      id: 'peacock', label: '孔雀',
      svg: ground(22, 93) +
        '<path d="M50 70 C18 70 6 46 14 26 C22 8 78 8 86 26 C94 46 82 70 50 70 Z" ' +
        'fill="#2E8B74" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#1E6B58" stroke-width="2" opacity="0.9">' +
        '<path d="M50 68 C40 54 30 36 24 20 M50 68 C46 50 42 30 40 14 M50 68 C54 50 58 30 60 14 M50 68 C60 54 70 36 76 20"/></g>' +
        '<g stroke="#134C3E" stroke-width="2" fill="#3AA9CF">' +
        '<circle cx="24" cy="30" r="7"/><circle cx="40" cy="20" r="7"/><circle cx="60" cy="20" r="7"/>' +
        '<circle cx="76" cy="30" r="7"/><circle cx="32" cy="47" r="6"/><circle cx="68" cy="47" r="6"/><circle cx="50" cy="33" r="7"/></g>' +
        '<g fill="#F0B429"><circle cx="24" cy="30" r="3"/><circle cx="40" cy="20" r="3"/><circle cx="60" cy="20" r="3"/>' +
        '<circle cx="76" cy="30" r="3"/><circle cx="32" cy="47" r="2.6"/><circle cx="68" cy="47" r="2.6"/><circle cx="50" cy="33" r="3"/></g>' +
        '<ellipse cx="50" cy="74" rx="13" ry="16" fill="#1E5FA8" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M50 42 L50 35 M45 43 L43 36 M55 43 L57 36" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
        '<g fill="#2472C4"><circle cx="50" cy="34" r="2.6"/><circle cx="42.4" cy="35" r="2.4"/><circle cx="57.6" cy="35" r="2.4"/></g>' +
        '<circle cx="50" cy="54" r="12" fill="#2472C4" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M59 55 L70 58 L59 61 Z" fill="#E8B23C" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
        eye(47, 52, 3)
    },
    {
      id: 'rooster', label: '公雞',
      svg: ground(24, 93) +
        '<g fill="#2E7A4A" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round">' +
        '<path d="M32 60 C18 54 8 38 12 24 C22 32 30 44 36 52 Z"/>' +
        '<path d="M32 68 C16 70 4 60 4 46 C16 50 26 56 34 60 Z"/></g>' +
        '<path d="M34 44 C50 40 66 48 70 62 C74 76 64 86 50 86 C36 86 28 76 28 64 C28 56 30 48 34 44 Z" ' +
        'fill="#E9A03C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M58 46 C68 52 74 62 70 74 C66 82 58 86 50 86 C62 80 66 68 62 58 C61 53 59 48 58 46 Z" fill="#C57A1C" opacity="0.85"/>' +
        '<g fill="none" stroke="#E8892E" stroke-width="3.4" stroke-linecap="round"><path d="M44 86 L42 94 M58 86 L60 94"/></g>' +
        '<circle cx="58" cy="34" r="16" fill="#F5E7D2" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<g fill="#D6342E" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round">' +
        '<path d="M48 22 C50 12 56 12 58 18 C62 10 69 12 68 22 C62 20 54 20 48 22 Z"/>' +
        '<path d="M56 46 C54 55 61 59 65 52 C63 48 60 46 56 46 Z"/></g>' +
        '<path d="M73 31 L88 36 L73 41 Z" fill="#E8B23C" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        eye(64, 30, 3.4)
    },
    {
      id: 'crocodile', label: '鱷魚',
      svg: ground(30, 92) +
        '<path d="M6 62 L74 58 C86 58 92 64 92 70 C92 76 86 80 74 80 L20 80 C10 80 6 74 6 68 Z" ' +
        'fill="#4E8A3E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M8 63 L74 59 C85 59 91 64 91 70 L8 70 Z" fill="#69A64E"/>' +
        '<g fill="#3A6B2C" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round">' +
        '<path d="M22 59 L26 47 L31 58 Z"/><path d="M36 58 L40 45 L45 57 Z"/>' +
        '<path d="M50 57 L54 44 L59 56 Z"/><path d="M64 56 L68 45 L73 56 Z"/></g>' +
        '<g fill="#FBF8F2"><path d="M14 70 L18 78 L22 70 Z"/><path d="M26 70 L30 78 L34 70 Z"/>' +
        '<path d="M38 70 L42 78 L46 70 Z"/><path d="M50 70 L54 78 L58 70 Z"/><path d="M62 70 L66 78 L70 70 Z"/></g>' +
        '<ellipse cx="78" cy="53" rx="11" ry="9" fill="#5E9C48" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<ellipse cx="88" cy="52" rx="7" ry="6" fill="#5E9C48" stroke="' + INK + '" stroke-width="2.5"/>' +
        eye(78, 51, 3.4) + eye(89, 50, 2.8) +
        '<g fill="#3A6B2C" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round">' +
        '<path d="M22 80 L17 90 L28 90 Z"/><path d="M52 80 L47 90 L58 90 Z"/><path d="M78 80 L73 90 L84 90 Z"/></g>'
    },
    {
      id: 'snake', label: '蛇',
      svg: ground(26, 93) +
        '<path d="M18 88 C40 88 46 74 34 66 C22 58 26 42 44 40 C60 38 66 30 62 22" ' +
        'fill="none" stroke="' + INK + '" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M18 88 C40 88 46 74 34 66 C22 58 26 42 44 40 C60 38 66 30 62 22" ' +
        'fill="none" stroke="#5EA83C" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<g fill="#2F6B24"><ellipse cx="26" cy="88" rx="3.4" ry="4.4"/><ellipse cx="42" cy="82" rx="3.4" ry="4.4"/>' +
        '<ellipse cx="38" cy="68" rx="3.4" ry="4.4"/><ellipse cx="27" cy="58" rx="3.4" ry="4.4"/>' +
        '<ellipse cx="34" cy="45" rx="3.4" ry="4.4"/><ellipse cx="50" cy="39" rx="3.4" ry="4.4"/></g>' +
        '<ellipse cx="62" cy="20" rx="14" ry="11" fill="#6FBE46" stroke="' + INK + '" stroke-width="2.6" transform="rotate(-16 62 20)"/>' +
        '<path d="M74 16 C82 14 88 16 92 20 C86 22 80 22 75 21 Z" fill="#D6342E" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M86 18 L96 14 M86 19 L96 24" fill="none" stroke="#D6342E" stroke-width="2.4" stroke-linecap="round"/>' +
        eye(64, 15, 3.2)
    },
    {
      id: 'seahorse', label: '海馬',
      svg: ground(18, 94) +
        '<path d="M56 18 C68 18 74 28 72 40 C70 52 60 58 54 68 C48 78 52 86 60 86 C66 86 68 82 66 78" ' +
        'fill="none" stroke="' + INK + '" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M56 18 C68 18 74 28 72 40 C70 52 60 58 54 68 C48 78 52 86 60 86 C66 86 68 82 66 78" ' +
        'fill="none" stroke="#F0913C" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M44 24 C32 22 28 30 34 36 C26 38 26 46 34 48 C28 54 32 62 40 60" ' +
        'fill="none" stroke="#D9762A" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M52 14 C40 12 32 18 34 26 C38 32 48 32 55 26 Z" fill="#F5A45C" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M34 23 L17 30 L34 33 Z" fill="#F5A45C" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M56 10 C61 3 68 6 65 13" fill="none" stroke="#D9762A" stroke-width="4" stroke-linecap="round"/>' +
        eye(46, 22, 3.2) +
        '<g fill="#D9762A" opacity="0.85"><circle cx="67" cy="32" r="2.4"/><circle cx="66" cy="42" r="2.4"/>' +
        '<circle cx="60" cy="52" r="2.4"/><circle cx="53" cy="62" r="2.4"/><circle cx="52" cy="74" r="2.4"/></g>'
    },
    {
      id: 'shrimp', label: '蝦子',
      svg: ground(26, 92) +
        '<path d="M70 22 C46 18 26 34 26 54 C26 72 42 84 58 84 C68 84 74 80 76 74 C68 76 60 74 56 68 ' +
        'C50 60 52 46 62 40 C70 35 78 36 82 40 C82 30 78 24 70 22 Z" ' +
        'fill="#F2734E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#C94A2A" stroke-width="2.2" opacity="0.9">' +
        '<path d="M46 26 C48 34 46 42 40 48 M36 32 C40 40 40 50 34 58 M28 44 C34 52 36 62 32 70"/></g>' +
        '<path d="M76 74 C86 70 94 74 94 82 C86 87 78 82 76 74 Z" fill="#F79B78" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M58 84 C58 92 66 96 74 92 C70 86 65 84 58 84 Z" fill="#F79B78" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round">' +
        '<path d="M72 22 C80 12 90 10 96 14 M67 20 C73 8 84 4 92 6"/></g>' +
        '<g fill="none" stroke="#C94A2A" stroke-width="3" stroke-linecap="round">' +
        '<path d="M40 52 L30 62 M46 62 L38 74 M56 70 L52 82"/></g>' +
        eye(72, 30, 3.4)
    },
    {
      id: 'seal', label: '海豹',
      svg: ground(30, 92) +
        '<path d="M26 60 C26 46 40 38 56 40 C74 42 88 54 88 68 C88 80 76 86 60 86 L36 86 C28 86 26 78 26 70 Z" ' +
        'fill="#8E9AA8" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M70 46 C82 52 88 60 88 68 C88 80 76 86 60 86 C76 82 82 72 78 62 C76 55 73 49 70 46 Z" fill="#6E7A88" opacity="0.85"/>' +
        '<path d="M84 62 C94 55 99 62 96 71 C91 79 84 76 82 70 Z" fill="#7E8A98" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M46 84 C40 92 30 92 26 86 C32 82 40 82 46 84 Z" fill="#7E8A98" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<circle cx="34" cy="46" r="21" fill="#A3AFBC" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<ellipse cx="31" cy="55" rx="13" ry="9" fill="#D6DDE4"/>' +
        eye(26, 42, 3.8) + eye(43, 42, 3.8) +
        nose(31, 53, 4, '#3B2C22') + whiskers(31, 57)
    },
    {
      id: 'scallop', label: '扇貝',
      svg: ground(28, 91) +
        '<path d="M50 20 C74 20 92 44 92 66 C92 74 84 80 74 80 L26 80 C16 80 8 74 8 66 C8 44 26 20 50 20 Z" ' +
        'fill="#F0A9B4" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 24 C82 34 92 50 92 66 C92 74 84 80 74 80 L54 80 C72 76 80 62 76 46 C73 36 68 28 64 24 Z" fill="#D07E8E" opacity="0.75"/>' +
        '<g fill="none" stroke="#B85F72" stroke-width="2.2" opacity="0.9">' +
        '<path d="M50 22 L50 78 M38 24 L28 76 M62 24 L72 76 M28 33 L15 70 M72 33 L85 70"/></g>' +
        '<path d="M40 20 L60 20 L64 12 C58 8 42 8 36 12 Z" fill="#E890A0" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M12 78 C28 84 72 84 88 78 C88 84 80 88 50 88 C20 88 12 84 12 78 Z" fill="#D07E8E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>'
    },
    {
      id: 'ant', label: '螞蟻',
      svg: ground(24, 92) +
        '<g fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round">' +
        '<path d="M42 50 L24 40 L16 46 M42 56 L22 58 L14 66 M44 62 L28 74 L26 84"/>' +
        '<path d="M58 50 L76 40 L84 46 M58 56 L78 58 L86 66 M56 62 L72 74 L74 84"/></g>' +
        '<ellipse cx="70" cy="62" rx="22" ry="18" fill="#4E3626" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M80 50 C88 56 92 62 92 66 C92 74 82 80 70 80 C82 76 86 66 82 58 C81 55 80 51 80 50 Z" fill="#31220F" opacity="0.85"/>' +
        '<ellipse cx="46" cy="56" rx="12" ry="11" fill="#5E432E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="26" cy="48" r="15" fill="#5E432E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<g fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round">' +
        '<path d="M20 36 C16 26 8 22 6 26 M31 34 C31 24 25 16 21 18"/></g>' +
        eye(21, 45, 3.4) +
        '<g fill="#FFFFFF" opacity="0.3"><ellipse cx="62" cy="54" rx="8" ry="4" transform="rotate(-24 62 54)"/></g>'
    },
    {
      id: 'dragonfly', label: '蜻蜓',
      svg: ground(18, 94) +
        '<g fill="#BFE2EE" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round" opacity="0.92">' +
        '<path d="M46 34 C32 22 12 20 6 28 C12 38 30 42 46 40 Z"/>' +
        '<path d="M54 34 C68 22 88 20 94 28 C88 38 70 42 54 40 Z"/>' +
        '<path d="M46 44 C34 40 16 42 12 50 C20 58 36 56 46 50 Z"/>' +
        '<path d="M54 44 C66 40 84 42 88 50 C80 58 64 56 54 50 Z"/></g>' +
        '<g fill="none" stroke="#8EBACB" stroke-width="1.4" opacity="0.9">' +
        '<path d="M40 36 C28 30 16 28 10 30 M40 46 C30 44 20 46 15 50 M60 36 C72 30 84 28 90 30 M60 46 C70 44 80 46 85 50"/></g>' +
        '<path d="M50 24 C56 24 58 30 58 40 C58 54 56 76 50 92 C44 76 42 54 42 40 C42 30 44 24 50 24 Z" ' +
        'fill="#3AA9CF" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M54 28 C57 32 58 36 58 42 C58 56 56 76 50 92 C55 72 56 50 54 38 Z" fill="#1E7FA0" opacity="0.85"/>' +
        '<g fill="none" stroke="#1E7FA0" stroke-width="2" opacity="0.9"><path d="M44 56 L56 56 M45 66 L55 66 M46 76 L54 76"/></g>' +
        '<circle cx="50" cy="20" r="12" fill="#2E8B74" stroke="' + INK + '" stroke-width="2.6"/>' +
        eye(45, 18, 4) + eye(55, 18, 4)
    },
    {
      id: 'spider', label: '蜘蛛',
      svg: ground(24, 92) +
        '<g fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round">' +
        '<path d="M36 50 L18 36 L8 44 M34 58 L12 54 L4 64 M36 66 L16 72 L12 84 M40 72 L30 84 L34 92"/>' +
        '<path d="M64 50 L82 36 L92 44 M66 58 L88 54 L96 64 M64 66 L84 72 L88 84 M60 72 L70 84 L66 92"/></g>' +
        '<ellipse cx="50" cy="62" rx="23" ry="21" fill="#3E3346" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M62 46 C70 52 73 58 73 64 C73 76 63 83 50 83 C63 79 68 68 65 58 C64 53 63 48 62 46 Z" fill="#241D2C" opacity="0.85"/>' +
        '<g fill="#E8B23C"><path d="M50 50 L56 60 L50 70 L44 60 Z"/><circle cx="41" cy="72" r="3"/><circle cx="59" cy="72" r="3"/></g>' +
        '<circle cx="50" cy="34" r="15" fill="#4E4058" stroke="' + INK + '" stroke-width="2.6"/>' +
        eye(44, 31, 3.4) + eye(56, 31, 3.4) +
        '<g fill="#241D2C"><circle cx="40" cy="40" r="2"/><circle cx="60" cy="40" r="2"/><circle cx="50" cy="25" r="2"/></g>'
    },
    {
      id: 'beetle', label: '獨角仙',
      svg: ground(26, 92) +
        '<g fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round">' +
        '<path d="M32 52 L14 44 L8 52 M30 64 L10 66 L6 76 M34 74 L22 84 L24 92"/>' +
        '<path d="M68 52 L86 44 L92 52 M70 64 L90 66 L94 76 M66 74 L78 84 L76 92"/></g>' +
        '<path d="M50 10 C45 17 43 24 46 31 C48 27 52 27 54 31 C57 24 55 17 50 10 Z" ' +
        'fill="#4E3018" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="36" rx="14" ry="10" fill="#6B4522" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M50 44 C68 44 78 58 78 70 C78 82 66 90 50 90 C34 90 22 82 22 70 C22 58 32 44 50 44 Z" ' +
        'fill="#7A4E24" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 48 C73 54 78 62 78 70 C78 82 66 90 50 90 C66 86 72 76 70 66 C68 58 65 51 62 48 Z" fill="#563416" opacity="0.9"/>' +
        '<path d="M50 44 C51 60 51 76 50 90" fill="none" stroke="#3E2410" stroke-width="2.6"/>' +
        '<g fill="#C79A56" opacity="0.45"><ellipse cx="38" cy="58" rx="8" ry="5" transform="rotate(-24 38 58)"/>' +
        '<ellipse cx="34" cy="74" rx="6" ry="3.4" transform="rotate(-14 34 74)"/></g>' +
        eye(43, 34, 3) + eye(57, 34, 3)
    }
  ];

  return {
    key: 'animals',
    label: '動物',
    emoji: '🐻',
    note: '陸海空的動物們',
    list: LIST.concat(MORE)
  };
}));
