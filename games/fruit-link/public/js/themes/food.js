/* ===== themes/food.js — 食物造型庫（純資料，無 DOM 相依） =====
 *
 * 寫實取向：參考真實食物的外形、質感與配料，不畫卡通表情。
 *
 * 這一組最容易混淆的是「裝在碗裡的東西」（拉麵、熱湯、沙拉、咖哩、刨冰、火鍋），
 * 所以刻意用不同的容器（紅碗／白碗／玻璃碗／平盤／高杯／金屬鍋）加上不同的配料來區分；
 * 飲料則靠杯型、顏色與吸管分辨。
 *
 * 全部向量手繪，不使用 emoji 文字（emoji 會被作業系統字型影響），
 * 也不使用漸層（同一張盤面會貼上幾十份相同 SVG，重複 id 會出問題），
 * 一律用「底色 + 陰影形狀 + 打亮形狀」疊出立體感。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.THEME_FOOD = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var INK = '#4A3226';

  function ground(rx, cy) {
    return '<ellipse cx="50" cy="' + (cy || 92) + '" rx="' + rx + '" ry="' + (rx * 0.16).toFixed(1) +
      '" fill="#4A3226" opacity="0.13"/>';
  }
  function gloss(cx, cy, rx, ry, rot, op) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
      '" fill="#FFFFFF" opacity="' + (op || 0.4) + '" transform="rotate(' + (rot || -30) + ' ' + cx + ' ' + cy + ')"/>';
  }
  /** 熱氣：熱食都加上，一眼看得出是熱的 */
  function steam(x, y) {
    return '<g fill="none" stroke="#C9C2B8" stroke-width="2.8" stroke-linecap="round" opacity="0.75">' +
      '<path d="M' + (x - 12) + ' ' + y + ' C' + (x - 16) + ' ' + (y - 7) + ' ' + (x - 8) + ' ' + (y - 10) + ' ' + (x - 12) + ' ' + (y - 18) + '"/>' +
      '<path d="M' + x + ' ' + (y - 3) + ' C' + (x - 4) + ' ' + (y - 11) + ' ' + (x + 4) + ' ' + (y - 14) + ' ' + x + ' ' + (y - 23) + '"/>' +
      '<path d="M' + (x + 12) + ' ' + y + ' C' + (x + 8) + ' ' + (y - 7) + ' ' + (x + 16) + ' ' + (y - 10) + ' ' + (x + 12) + ' ' + (y - 18) + '"/></g>';
  }
  /** 通用的碗；colour 決定是紅碗、白碗還是金屬鍋 */
  function bowl(top, side, y) {
    y = y || 54;
    return '<path d="M10 ' + y + ' L90 ' + y + ' C88 ' + (y + 22) + ' 72 ' + (y + 34) + ' 50 ' + (y + 34) +
      ' C28 ' + (y + 34) + ' 12 ' + (y + 22) + ' 10 ' + y + ' Z" fill="' + side + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M62 ' + (y + 1) + ' C62 ' + (y + 18) + ' 56 ' + (y + 30) + ' 44 ' + (y + 34) + ' C62 ' + (y + 34) +
      ' 76 ' + (y + 24) + ' 78 ' + (y + 6) + ' Z" fill="#000000" opacity="0.16"/>' +
      '<ellipse cx="50" cy="' + y + '" rx="40" ry="10" fill="' + top + '" stroke="' + INK + '" stroke-width="2.6"/>';
  }
  /** 飲料杯 */
  function cup(fill, dark) {
    return '<path d="M27 28 L73 28 L66 84 C66 89 34 89 34 84 Z" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M30 44 L70 44 L65 82 C65 86 35 86 35 82 Z" fill="' + fill + '"/>' +
      '<path d="M58 44 L70 44 L65 82 C65 85 58 86 52 86 C60 78 62 60 58 44 Z" fill="' + dark + '" opacity="0.8"/>' +
      '<ellipse cx="50" cy="28" rx="23" ry="6" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.5"/>' +
      gloss(38, 60, 3.4, 14, -6, 0.45);
  }

  var LIST = [
    {
      id: 'food1', label: '漢堡',
      svg: ground(32) +
        '<path d="M10 40 C10 24 28 14 50 14 C72 14 90 24 90 40 C90 44 86 46 82 46 L18 46 C14 46 10 44 10 40 Z" ' +
        'fill="#D89A4E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 18 C82 24 90 32 90 40 C90 44 86 46 82 46 L62 46 C76 42 76 28 66 18 Z" fill="#B87A2E" opacity="0.7"/>' +
        '<g fill="#FBF3E0"><ellipse cx="32" cy="27" rx="3.4" ry="2.2"/><ellipse cx="50" cy="22" rx="3.4" ry="2.2"/>' +
        '<ellipse cx="66" cy="28" rx="3.4" ry="2.2"/><ellipse cx="42" cy="33" rx="3" ry="2"/><ellipse cx="60" cy="36" rx="3" ry="2"/></g>' +
        '<path d="M8 46 C16 44 22 50 30 47 C38 44 44 50 52 47 C60 44 68 50 76 47 C84 44 92 48 92 52 ' +
        'C92 55 88 56 84 56 L16 56 C12 56 8 54 8 50 Z" fill="#6FAE3E" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<rect x="12" y="55" width="76" height="9" rx="3" fill="#E8B93C" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M14 63 L86 63 C86 71 82 74 76 74 L24 74 C18 74 14 71 14 63 Z" fill="#8A4A26" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M12 73 C12 84 28 90 50 90 C72 90 88 84 88 73 C88 71 86 70 82 70 L18 70 C14 70 12 71 12 73 Z" ' +
        'fill="#C98A3E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>'
    },
    {
      id: 'food2', label: '披薩',
      svg: ground(30, 90) +
        '<path d="M50 6 L94 82 C80 90 20 90 6 82 Z" fill="#F2C560" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M50 6 L94 82 C88 85 78 87 68 88 C70 60 62 28 50 6 Z" fill="#D9A63C" opacity="0.55"/>' +
        '<path d="M6 82 C20 90 80 90 94 82 C96 86 96 90 96 90 C80 98 20 98 4 90 C4 90 4 86 6 82 Z" ' +
        'fill="#C98A3E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g fill="#D6392E" stroke="' + INK + '" stroke-width="2.2">' +
        '<circle cx="38" cy="56" r="7"/><circle cx="64" cy="62" r="7"/><circle cx="50" cy="34" r="6"/><circle cx="30" cy="76" r="6"/></g>' +
        '<g fill="#8A1F18" opacity="0.5"><circle cx="40" cy="58" r="3.4"/><circle cx="66" cy="64" r="3.4"/></g>' +
        '<g fill="#4E9C3F"><ellipse cx="60" cy="44" rx="4" ry="2.6" transform="rotate(-25 60 44)"/>' +
        '<ellipse cx="44" cy="72" rx="4" ry="2.6" transform="rotate(20 44 72)"/>' +
        '<ellipse cx="72" cy="78" rx="3.4" ry="2.2"/></g>' +
        '<g fill="#FBF3E0" opacity="0.75"><ellipse cx="52" cy="66" rx="6" ry="3.4" transform="rotate(-14 52 66)"/>' +
        '<ellipse cx="34" cy="44" rx="5" ry="3" transform="rotate(20 34 44)"/></g>'
    },
    {
      id: 'food3', label: '壽司',
      svg: ground(30, 88) +
        '<path d="M16 56 C16 48 26 44 50 44 C74 44 84 48 84 56 L84 70 C84 80 70 84 50 84 C30 84 16 80 16 70 Z" ' +
        'fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M70 46 C80 49 84 52 84 56 L84 70 C84 80 70 84 50 84 C70 82 78 76 78 66 C78 56 74 49 70 46 Z" fill="#DDD6C8" opacity="0.85"/>' +
        '<g fill="#EFE7DA" opacity="0.9"><circle cx="30" cy="60" r="2.6"/><circle cx="42" cy="70" r="2.6"/>' +
        '<circle cx="58" cy="62" r="2.6"/><circle cx="68" cy="72" r="2.6"/><circle cx="36" cy="78" r="2.4"/></g>' +
        '<path d="M14 34 C14 24 28 18 50 18 C72 18 86 24 86 34 C86 44 72 50 50 50 C28 50 14 44 14 34 Z" ' +
        'fill="#F0755E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M68 21 C80 25 86 29 86 34 C86 44 72 50 50 50 C70 47 80 40 80 32 C80 27 74 23 68 21 Z" fill="#D45542" opacity="0.8"/>' +
        '<g stroke="#FBD8CC" stroke-width="3" stroke-linecap="round" opacity="0.9" fill="none">' +
        '<path d="M22 30 C34 26 62 26 76 30 M20 40 C34 37 64 37 80 40"/></g>' +
        '<rect x="42" y="46" width="16" height="40" rx="2" fill="#33403A" stroke="' + INK + '" stroke-width="2.4"/>'
    },
    {
      id: 'food4', label: '飯糰',
      svg: ground(30, 90) +
        '<path d="M50 10 C54 10 57 12 59 16 L90 76 C93 82 90 88 84 88 L16 88 C10 88 7 82 10 76 L41 16 C43 12 46 10 50 10 Z" ' +
        'fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M59 16 L90 76 C93 82 90 88 84 88 L62 88 C70 76 70 44 59 16 Z" fill="#DDD6C8" opacity="0.8"/>' +
        '<g fill="#EFE7DA" opacity="0.85"><circle cx="42" cy="40" r="2.4"/><circle cx="54" cy="54" r="2.4"/>' +
        '<circle cx="34" cy="62" r="2.4"/><circle cx="46" cy="74" r="2.4"/></g>' +
        '<path d="M28 60 L72 60 L79 76 C81 80 79 84 74 84 L26 84 C21 84 19 80 21 76 Z" ' +
        'fill="#2E3A33" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M60 60 L72 60 L79 76 C81 80 79 84 74 84 L60 84 C66 76 66 68 60 60 Z" fill="#1F2A24" opacity="0.7"/>' +
        '<path d="M44 22 L56 22 L60 34 L40 34 Z" fill="#E0533C" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>'
    },
    {
      id: 'food5', label: '拉麵',
      svg: ground(34, 92) + steam(50, 30) +
        '<path d="M62 22 L92 12 M66 28 L96 18" stroke="#D9BE96" stroke-width="4" stroke-linecap="round"/>' +
        bowl('#F2F0EA', '#D6382E', 52) +
        '<path d="M18 52 C24 42 34 38 44 40 C54 42 62 40 70 34 C76 30 82 32 84 40" ' +
        'fill="none" stroke="#F5DC8E" stroke-width="5.5" stroke-linecap="round"/>' +
        '<path d="M22 56 C30 48 40 46 50 48 C60 50 70 46 78 40" fill="none" stroke="#E8C55E" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M26 44 C34 36 44 34 52 36" fill="none" stroke="#FBEBB4" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="32" cy="50" r="9" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="32" cy="50" r="4.4" fill="#F0A82E"/>' +
        '<rect x="56" y="40" width="17" height="13" rx="3" fill="#C4703C" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M60 43 C64 46 66 48 70 50" fill="none" stroke="#8A4A22" stroke-width="1.8"/>' +
        '<rect x="42" y="34" width="12" height="16" rx="1.5" fill="#2E3A33" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<path d="M18 66 C30 76 70 76 82 66" fill="none" stroke="#F7F3EC" stroke-width="3" stroke-linecap="round" opacity="0.55"/>'
    },
    {
      id: 'food6', label: '墨西哥捲',
      svg: ground(26, 92) +
        '<path d="M28 88 C16 70 20 38 44 22 C58 12 76 14 82 24 C88 36 78 48 68 56 C56 66 50 78 48 90 Z" ' +
        'fill="#EFD9A8" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 18 C74 18 84 24 82 34 C80 44 70 52 60 58 C50 66 46 78 46 90 L36 90 C36 72 44 58 56 48 ' +
        'C66 40 72 32 70 26 C68 21 64 19 62 18 Z" fill="#D6BC84" opacity="0.75"/>' +
        '<path d="M44 22 C56 26 62 36 60 46 C58 54 52 58 46 58" fill="none" stroke="#C9AE74" stroke-width="2.6"/>' +
        '<path d="M76 16 C86 12 92 18 90 26 C84 30 76 26 72 20 Z" fill="#6FAE3E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M80 26 C90 26 94 32 90 38 C82 40 76 34 74 28 Z" fill="#D6392E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M28 88 C24 92 20 92 18 90 C22 88 26 88 28 88 Z" fill="#D6BC84"/>'
    },
    {
      id: 'food7', label: '三明治',
      svg: ground(32, 90) +
        '<path d="M8 84 L50 14 L92 84 Z" fill="#F2DFAE" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M50 14 L92 84 L70 84 C70 56 62 32 50 14 Z" fill="#D9C48E" opacity="0.7"/>' +
        '<path d="M22 60 L78 60 L82 68 L18 68 Z" fill="#F0C93C" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M18 68 C24 64 30 72 38 68 C46 64 54 72 62 68 C70 64 78 72 84 68 L88 76 L12 76 Z" ' +
        'fill="#6FAE3E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M12 76 L88 76 L92 84 L8 84 Z" fill="#F2DFAE" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M30 70 L38 70 M56 71 L66 71" stroke="#D6392E" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M20 82 L80 82" stroke="#D9C48E" stroke-width="2" opacity="0.8"/>'
    },
    {
      id: 'food8', label: '熱狗',
      svg: ground(34, 88) +
        '<path d="M6 60 C6 44 24 36 50 36 C76 36 94 44 94 60 C94 74 76 82 50 82 C24 82 6 74 6 60 Z" ' +
        'fill="#E0B26E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M70 39 C86 44 94 51 94 60 C94 74 76 82 50 82 C78 78 88 68 86 56 C84 47 76 41 70 39 Z" fill="#BE8C42" opacity="0.8"/>' +
        '<path d="M12 52 C22 42 34 38 50 38 C66 38 78 42 88 52 C80 62 66 66 50 66 C34 66 20 62 12 52 Z" ' +
        'fill="#D0523C" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M70 41 C80 45 85 48 88 52 C82 59 72 63 62 65 C74 60 78 50 70 41 Z" fill="#A83A28" opacity="0.75"/>' +
        '<path d="M16 46 C26 58 36 44 46 56 C56 44 66 58 76 46" fill="none" stroke="#F0C93C" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M20 56 C30 50 38 60 48 54" fill="none" stroke="#E8DCC0" stroke-width="3" stroke-linecap="round" opacity="0.7"/>'
    },
    {
      id: 'food9', label: '薯條',
      svg: ground(28, 92) +
        '<g stroke="' + INK + '" stroke-width="2.5">' +
        '<rect x="22" y="20" width="11" height="46" rx="3" fill="#F0C93C" transform="rotate(-8 27 42)"/>' +
        '<rect x="38" y="10" width="11" height="56" rx="3" fill="#F7DA6E"/>' +
        '<rect x="52" y="14" width="11" height="52" rx="3" fill="#F0C93C"/>' +
        '<rect x="66" y="22" width="11" height="44" rx="3" fill="#E0B62E" transform="rotate(9 71 44)"/></g>' +
        '<path d="M20 52 L80 52 L74 88 C74 92 26 92 26 88 Z" fill="#D6382E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 52 L80 52 L74 88 C74 90 66 91 58 91 C68 82 68 64 62 52 Z" fill="#A82A20" opacity="0.75"/>' +
        '<path d="M28 62 C40 66 60 66 72 62" fill="none" stroke="#F7F3EC" stroke-width="4" stroke-linecap="round" opacity="0.8"/>'
    },
    {
      id: 'food10', label: '牛排',
      svg: ground(34, 90) +
        '<path d="M8 56 C8 34 30 22 54 24 C80 26 94 42 90 62 C86 82 60 90 38 86 C18 82 8 70 8 56 Z" ' +
        'fill="#8A3A2A" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M20 54 C20 40 36 32 54 34 C72 36 82 46 80 58 C78 72 60 80 42 77 C28 74 20 65 20 54 Z" fill="#B85440"/>' +
        '<path d="M32 50 C32 42 42 38 54 40 C66 42 72 48 70 56 C68 64 56 68 46 66 C38 64 32 58 32 50 Z" fill="#D9705A"/>' +
        '<g stroke="#6B2A1E" stroke-width="2.4" opacity="0.7" stroke-linecap="round">' +
        '<path d="M20 40 L34 52 M40 32 L56 46 M60 34 L76 48 M18 60 L32 72 M42 68 L58 80"/></g>' +
        '<path d="M76 30 C86 30 92 38 90 46" fill="none" stroke="#F0EAD8" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M30 84 C40 88 56 89 66 86" fill="none" stroke="#6B2A1E" stroke-width="2.2" opacity="0.5"/>'
    },
    {
      id: 'food11', label: '烤雞',
      svg: ground(24, 92) +
        '<path d="M58 40 C78 40 90 56 86 72 C82 88 62 94 48 86 C36 79 34 60 44 48 Z" ' +
        'fill="#C4813C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M72 46 C84 54 88 66 84 76 C80 88 62 94 48 86 C66 88 78 76 78 62 C78 54 75 49 72 46 Z" fill="#9C5F22" opacity="0.8"/>' +
        '<g fill="#8A4A18" opacity="0.5"><ellipse cx="56" cy="58" rx="6" ry="4" transform="rotate(-20 56 58)"/>' +
        '<ellipse cx="70" cy="72" rx="5" ry="3.4" transform="rotate(20 70 72)"/></g>' +
        '<path d="M46 50 L22 26 C16 20 8 22 6 28 C4 34 10 38 16 36 L40 60 Z" ' +
        'fill="#F2E8D6" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M22 26 C16 20 8 22 6 28 C10 24 16 24 20 28 Z" fill="#DAD0BC"/>' +
        '<path d="M18 24 C14 18 18 12 24 14" fill="none" stroke="#C9BFA6" stroke-width="3" stroke-linecap="round"/>' +
        gloss(56, 54, 7, 4.4, -34, 0.28)
    },
    {
      id: 'food12', label: '荷包蛋',
      svg: ground(34, 88) +
        '<path d="M18 48 C8 38 16 22 30 22 C38 12 58 12 66 22 C82 20 94 36 84 50 C92 62 82 78 66 74 ' +
        'C58 84 38 84 30 74 C14 78 6 60 18 48 Z" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 22 C82 20 94 36 84 50 C92 62 82 78 66 74 C60 79 52 82 44 82 C64 80 78 68 78 52 ' +
        'C78 38 72 27 66 22 Z" fill="#E4DCCC" opacity="0.7"/>' +
        '<ellipse cx="48" cy="48" rx="20" ry="18" fill="#F2B01E" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M60 36 C66 40 68 46 68 50 C68 60 58 66 48 66 C60 62 66 50 60 36 Z" fill="#D48E0A" opacity="0.8"/>' +
        gloss(41, 41, 7, 4.6, -34, 0.55)
    },
    {
      id: 'food13', label: '起司',
      svg: ground(32, 88) +
        '<path d="M8 44 L86 26 L86 68 C86 76 8 88 8 80 Z" fill="#F0C93C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M8 44 L86 26 L66 14 L14 32 Z" fill="#F7DE7E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 32 L86 26 L86 68 C86 74 78 78 66 82 Z" fill="#D6A81E" opacity="0.75"/>' +
        '<g fill="#D6A81E"><circle cx="30" cy="60" r="6.5"/><circle cx="52" cy="70" r="5"/>' +
        '<circle cx="70" cy="48" r="5.5"/><circle cx="46" cy="52" r="4"/><circle cx="76" cy="68" r="3.6"/></g>' +
        '<g fill="#B88E10" opacity="0.6"><circle cx="31" cy="61" r="3.4"/><circle cx="71" cy="49" r="2.8"/></g>'
    },
    {
      id: 'food14', label: '吐司',
      svg: ground(30, 90) +
        '<path d="M14 40 C14 24 30 14 50 14 C70 14 86 24 86 40 C86 46 82 48 78 48 L78 80 C78 85 22 85 22 80 ' +
        'L22 48 C18 48 14 46 14 40 Z" fill="#C9944E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 19 C79 26 86 32 86 40 C86 46 82 48 78 48 L78 80 C78 83 70 84 60 84 ' +
        'C70 76 72 40 66 19 Z" fill="#A47030" opacity="0.75"/>' +
        '<path d="M22 42 C22 30 34 22 50 22 C66 22 78 30 78 42 L78 76 C78 79 22 79 22 76 Z" ' +
        'fill="#FBEFD2" stroke="#B08040" stroke-width="2"/>' +
        '<g fill="#F0DFB8" opacity="0.9"><circle cx="34" cy="44" r="2.6"/><circle cx="60" cy="38" r="2.2"/>' +
        '<circle cx="42" cy="60" r="2.4"/><circle cx="64" cy="62" r="2.2"/><circle cx="32" cy="70" r="2"/></g>' +
        '<path d="M40 44 L62 44 L58 62 L36 62 Z" fill="#F5C93C" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M40 44 L62 44 L60 50 L38 50 Z" fill="#FBE07E"/>' +
        '<path d="M36 62 C40 68 52 70 58 66" fill="none" stroke="#E0AE1E" stroke-width="3" stroke-linecap="round" opacity="0.85"/>'
    },
    {
      id: 'food15', label: '可頌',
      svg: ground(34, 86) +
        '<path d="M6 68 C6 44 26 30 50 30 C74 30 94 44 94 68 C86 74 78 72 72 64 C64 74 56 76 50 70 ' +
        'C44 76 36 74 28 64 C22 72 14 74 6 68 Z" fill="#DFA754" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 34 C84 42 94 54 94 68 C86 74 78 72 72 64 C68 68 64 71 60 71 C74 62 76 46 66 34 Z" fill="#BC842E" opacity="0.8"/>' +
        '<g fill="none" stroke="#B57C28" stroke-width="2.4" opacity="0.75">' +
        '<path d="M28 62 C28 48 36 38 46 34 M72 62 C72 48 64 38 54 34 M50 30 C50 46 50 60 50 68"/></g>' +
        '<path d="M6 68 C0 74 2 82 10 82 C14 80 14 74 10 70 M94 68 C100 74 98 82 90 82 C86 80 86 74 90 70" ' +
        'fill="#DFA754" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        gloss(34, 46, 9, 4.6, -28, 0.32)
    },
    {
      id: 'food16', label: '水餃',
      svg: ground(32, 88) +
        '<path d="M12 48 C12 32 30 24 50 24 C70 24 88 32 88 48 C88 68 70 82 50 82 C30 82 12 68 12 48 Z" ' +
        'fill="#F7F0DE" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M70 27 C82 33 88 40 88 48 C88 68 70 82 50 82 C70 78 80 64 80 48 C80 38 76 31 70 27 Z" fill="#DED5BE" opacity="0.85"/>' +
        '<path d="M12 48 C16 38 22 38 26 46 C30 36 38 34 42 44 C46 34 54 34 58 44 C62 34 70 36 74 46 C78 38 84 38 88 48" ' +
        'fill="#FBF7EA" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M22 62 C32 70 50 74 68 68" fill="none" stroke="#DED5BE" stroke-width="3" stroke-linecap="round"/>' +
        gloss(32, 54, 8, 4.4, -28, 0.4)
    },
    {
      id: 'food17', label: '熱湯',
      svg: ground(34, 92) + steam(50, 34) +
        bowl('#F2F0EA', '#F7F3EC', 54) +
        '<ellipse cx="50" cy="54" rx="34" ry="8" fill="#E8A84E"/>' +
        '<g stroke="' + INK + '" stroke-width="2.2">' +
        '<circle cx="34" cy="53" r="5" fill="#6FAE3E"/><circle cx="62" cy="56" r="5" fill="#E86A3E"/>' +
        '<circle cx="50" cy="50" r="4.4" fill="#FBF8F2"/></g>' +
        '<path d="M74 40 C86 34 92 44 84 52 L78 58" fill="none" stroke="#B8BEC4" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="82" cy="42" rx="8" ry="5" fill="#D2D8DE" stroke="' + INK + '" stroke-width="2.3" transform="rotate(-30 82 42)"/>' +
        '<path d="M18 66 C30 76 70 76 82 66" fill="none" stroke="#DDD6C8" stroke-width="3" stroke-linecap="round" opacity="0.7"/>'
    },
    {
      id: 'food18', label: '沙拉',
      svg: ground(32, 92) +
        '<path d="M16 56 L84 56 C82 76 68 88 50 88 C32 88 18 76 16 56 Z" fill="#EAF2F7" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" opacity="0.92"/>' +
        '<path d="M66 57 C66 74 60 84 48 88 C66 88 78 76 80 57 Z" fill="#C4D4E0" opacity="0.6"/>' +
        '<g stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round">' +
        '<path d="M14 54 C10 40 22 28 34 32 C42 34 44 44 40 52 Z" fill="#4E9C3F"/>' +
        '<path d="M40 52 C34 36 46 22 60 26 C70 30 70 44 62 54 Z" fill="#6FBE4E"/>' +
        '<path d="M60 52 C66 38 82 36 88 46 C92 54 86 58 78 56 Z" fill="#4E9C3F"/>' +
        '<circle cx="30" cy="60" r="7" fill="#D6392E"/><circle cx="66" cy="62" r="6" fill="#D6392E"/>' +
        '<circle cx="48" cy="64" r="6" fill="#F0A82E"/></g>' +
        '<g fill="#FBF3E0" opacity="0.8"><ellipse cx="40" cy="70" rx="5" ry="2.6"/><ellipse cx="58" cy="72" rx="4.4" ry="2.4"/></g>' +
        '<path d="M16 56 L84 56" stroke="' + INK + '" stroke-width="2.6"/>' +
        gloss(28, 70, 4, 8, -14, 0.5)
    },
    {
      id: 'food19', label: '咖哩飯',
      svg: ground(38, 90) +
        '<ellipse cx="50" cy="70" rx="44" ry="18" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<ellipse cx="50" cy="66" rx="38" ry="14" fill="#FBF8F2"/>' +
        '<path d="M12 62 C18 44 32 36 50 36 C50 52 40 62 22 68 C17 67 13 65 12 62 Z" ' +
        'fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<g fill="#EFE7DA" opacity="0.9"><circle cx="26" cy="56" r="2.2"/><circle cx="38" cy="48" r="2.2"/><circle cx="34" cy="62" r="2"/></g>' +
        '<path d="M50 36 C70 36 86 46 88 62 C86 66 78 70 66 71 C50 72 44 62 44 52 C44 44 46 38 50 36 Z" ' +
        'fill="#A8601E" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M74 42 C84 48 88 55 88 62 C86 66 78 70 66 71 C78 66 82 54 74 42 Z" fill="#7E4410" opacity="0.7"/>' +
        '<g stroke="' + INK + '" stroke-width="2.2"><circle cx="66" cy="50" r="5" fill="#E8A84E"/>' +
        '<circle cx="78" cy="60" r="4.4" fill="#6FAE3E"/><circle cx="58" cy="62" r="4.4" fill="#C4703C"/></g>'
    },
    {
      id: 'food20', label: '便當',
      svg: ground(38, 88) +
        '<rect x="6" y="26" width="88" height="56" rx="8" fill="#8A3A2A" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<rect x="11" y="31" width="78" height="46" rx="5" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<rect x="15" y="35" width="30" height="38" rx="3" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="30" cy="54" r="7" fill="#D6392E"/>' +
        '<g fill="#EFE7DA" opacity="0.9"><circle cx="21" cy="42" r="1.8"/><circle cx="38" cy="66" r="1.8"/></g>' +
        '<rect x="49" y="35" width="36" height="17" rx="3" fill="#C4813C" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<path d="M53 43 C58 40 62 46 67 43 C72 40 76 46 81 43" fill="none" stroke="#8A4A18" stroke-width="2"/>' +
        '<rect x="49" y="56" width="17" height="17" rx="3" fill="#6FAE3E" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<rect x="68" y="56" width="17" height="17" rx="3" fill="#F0C93C" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<path d="M6 26 L94 26" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M18 20 L82 20 L86 26 L14 26 Z" fill="#A8523A" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>'
    },
    {
      id: 'food21', label: '爆米花',
      svg: ground(30, 92) +
        '<g fill="#FBF3E0" stroke="' + INK + '" stroke-width="2.3">' +
        '<circle cx="28" cy="34" r="10"/><circle cx="50" cy="24" r="11"/><circle cx="72" cy="34" r="10"/>' +
        '<circle cx="38" cy="24" r="8"/><circle cx="62" cy="24" r="8"/><circle cx="40" cy="40" r="9"/><circle cx="60" cy="40" r="9"/></g>' +
        '<g fill="#EFDFBC"><circle cx="72" cy="36" r="5"/><circle cx="62" cy="26" r="4"/><circle cx="60" cy="42" r="4.4"/></g>' +
        '<path d="M20 46 L80 46 L72 88 C72 92 28 92 28 88 Z" fill="#D6382E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g fill="#F7F3EC"><path d="M32 47 L34 90 L42 90 L39 47 Z"/><path d="M53 47 L55 90 L63 90 L60 47 Z"/><path d="M72 48 L70 90 L66 90 L67 48 Z" opacity="0.9"/></g>' +
        '<path d="M64 46 L80 46 L72 88 C72 90 66 91 58 91 C68 82 70 62 64 46 Z" fill="#A82A20" opacity="0.6"/>' +
        '<path d="M20 46 L80 46" stroke="' + INK + '" stroke-width="2.6"/>'
    }
  ].concat([
    {
      id: 'food22', label: '蛋糕',
      svg: ground(32, 90) +
        '<path d="M14 48 L86 48 L86 82 C86 87 14 87 14 82 Z" fill="#F7DCE6" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M14 62 L86 62" stroke="#E0A8BE" stroke-width="7"/>' +
        '<path d="M68 48 L86 48 L86 82 C86 85 78 86 66 86 C74 74 74 60 68 48 Z" fill="#DEB8C8" opacity="0.7"/>' +
        '<path d="M14 48 C14 38 30 32 50 32 C70 32 86 38 86 48 C76 54 62 52 50 48 C38 52 24 54 14 48 Z" ' +
        'fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M22 34 C22 42 20 46 16 48 M78 34 C78 42 80 46 84 48" fill="none" stroke="#E4DCCC" stroke-width="2.4"/>' +
        '<circle cx="50" cy="24" r="8" fill="#D6392E" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M52 17 C54 10 60 9 62 13" fill="none" stroke="#4E9C3F" stroke-width="3" stroke-linecap="round"/>' +
        gloss(45, 21, 3, 2, -30, 0.55)
    },
    {
      id: 'food23', label: '杯子蛋糕',
      svg: ground(26, 92) +
        '<path d="M20 52 C20 32 32 20 50 20 C68 20 80 32 80 52 C70 58 62 52 50 55 C38 52 30 58 20 52 Z" ' +
        'fill="#F7C0D2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 26 C74 34 80 42 80 52 C74 56 68 54 62 54 C70 46 70 34 64 26 Z" fill="#DE9AB0" opacity="0.8"/>' +
        '<g fill="#F0C93C"><circle cx="36" cy="36" r="2.2"/><circle cx="58" cy="30" r="2.2"/></g>' +
        '<g fill="#6FBE4E"><circle cx="46" cy="42" r="2.2"/><circle cx="66" cy="44" r="2"/></g>' +
        '<g fill="#4E9CD8"><circle cx="30" cy="46" r="2"/><circle cx="54" cy="48" r="2"/></g>' +
        '<path d="M24 54 L76 54 L68 86 C68 90 32 90 32 86 Z" fill="#D9A25E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g stroke="#B57C34" stroke-width="3" opacity="0.85"><path d="M36 56 L34 88 M50 56 L50 89 M64 56 L66 88"/></g>' +
        '<circle cx="50" cy="16" r="6" fill="#D6392E" stroke="' + INK + '" stroke-width="2.3"/>'
    },
    {
      id: 'food24', label: '甜甜圈',
      svg: ground(32, 90) +
        '<circle cx="50" cy="54" r="38" fill="#D9A25E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M72 26 C84 36 88 46 88 54 C88 75 71 92 50 92 C68 84 78 70 78 52 C78 40 75 31 72 26 Z" fill="#B57C34" opacity="0.7"/>' +
        '<path d="M12 54 C12 32 29 16 50 16 C71 16 88 32 88 54 C82 62 76 50 68 58 C60 66 52 54 44 62 ' +
        'C36 70 28 56 20 64 C15 62 12 58 12 54 Z" fill="#EE7BA8" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M70 22 C82 32 88 44 88 54 C84 60 80 55 76 54 C80 42 77 30 70 22 Z" fill="#CC5285" opacity="0.65"/>' +
        '<circle cx="50" cy="54" r="13" fill="#FBF3E4" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<g stroke-width="3.4" stroke-linecap="round">' +
        '<path d="M28 36 L33 31" stroke="#F0C93C"/><path d="M48 26 L53 31" stroke="#6FBE4E"/>' +
        '<path d="M68 34 L73 30" stroke="#4E9CD8"/><path d="M24 50 L30 48" stroke="#FBF3E4"/>' +
        '<path d="M76 48 L82 46" stroke="#F0C93C"/><path d="M40 34 L44 39" stroke="#4E9CD8"/></g>' +
        gloss(30, 38, 8, 5, -34, 0.35)
    },
    {
      id: 'food25', label: '餅乾',
      svg: ground(32, 90) +
        '<path d="M50 14 C72 14 88 30 88 52 C88 74 72 90 50 90 C28 90 12 74 12 52 C12 30 28 14 50 14 Z" ' +
        'fill="#D9A25E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M70 20 C82 30 88 40 88 52 C88 74 72 90 50 90 C70 84 80 70 80 52 C80 36 76 26 70 20 Z" fill="#B57C34" opacity="0.75"/>' +
        '<g fill="#5B3218"><circle cx="34" cy="36" r="5.5"/><circle cx="66" cy="42" r="5"/>' +
        '<circle cx="70" cy="68" r="5"/><circle cx="30" cy="64" r="5"/><circle cx="50" cy="78" r="4.4"/>' +
        '<circle cx="50" cy="54" r="4"/></g>' +
        '<g fill="#7E4A26" opacity="0.85"><circle cx="33" cy="34" r="2.4"/><circle cx="65" cy="40" r="2.2"/><circle cx="29" cy="62" r="2.2"/></g>' +
        '<g fill="#C4884A" opacity="0.7"><circle cx="44" cy="26" r="2.6"/><circle cx="76" cy="54" r="2.4"/><circle cx="38" cy="76" r="2.4"/></g>'
    },
    {
      id: 'food26', label: '巧克力',
      svg: ground(32, 88) +
        '<path d="M12 26 L84 18 L88 74 L16 84 Z" fill="#5B3218" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M12 26 L84 18 L78 12 L8 20 Z" fill="#7E4A26" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<g stroke="#3E210E" stroke-width="2.6" fill="none">' +
        '<path d="M36 23 L39 80 M60 20 L64 77 M13 45 L86 37 M14 64 L87 56"/></g>' +
        '<g fill="#7E4A26" opacity="0.55">' +
        '<path d="M15 28 L34 26 L36 43 L16 46 Z"/><path d="M40 25 L58 23 L60 40 L42 42 Z"/><path d="M65 21 L83 19 L85 36 L67 39 Z"/></g>' +
        '<path d="M66 20 L84 18 L88 74 L70 76 Z" fill="#000000" opacity="0.18"/>'
    },
    {
      id: 'food27', label: '糖果',
      svg: ground(30, 88) +
        '<path d="M28 48 L8 32 C4 28 6 22 12 24 L32 34 Z" fill="#F7B8CC" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M28 62 L8 78 C4 82 6 88 12 86 L32 76 Z" fill="#F7B8CC" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M72 48 L92 32 C96 28 94 22 88 24 L68 34 Z" fill="#EE9CB8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M72 62 L92 78 C96 82 94 88 88 86 L68 76 Z" fill="#EE9CB8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="55" rx="26" ry="24" fill="#EE5B85" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M64 38 C72 44 76 50 76 55 C76 68 64 79 50 79 C64 74 70 60 64 38 Z" fill="#C43866" opacity="0.8"/>' +
        '<g stroke="#FBD8E4" stroke-width="4.4" stroke-linecap="round" fill="none">' +
        '<path d="M34 44 C40 52 40 60 34 68 M50 34 C56 44 56 66 50 76"/></g>' +
        gloss(38, 44, 6, 4, -34, 0.5)
    },
    {
      id: 'food28', label: '冰淇淋',
      svg: ground(20, 94) +
        '<path d="M30 50 L70 50 L54 92 C53 95 47 95 46 92 Z" fill="#D9A25E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g stroke="#B57C34" stroke-width="2" opacity="0.8"><path d="M36 58 L58 74 M44 76 L60 60 M34 68 L48 84"/></g>' +
        '<path d="M56 52 L70 50 L54 92 C53 94 50 95 48 94 C58 80 60 62 56 52 Z" fill="#B57C34" opacity="0.6"/>' +
        '<circle cx="32" cy="42" r="17" fill="#F7C0D2" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="68" cy="42" r="17" fill="#A8D9C0" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="50" cy="24" r="17" fill="#F7DC8E" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M60 32 C66 36 68 42 66 48 C72 44 74 34 68 28 Z" fill="#7EB8A0" opacity="0.7"/>' +
        '<circle cx="50" cy="7" r="5" fill="#D6392E" stroke="' + INK + '" stroke-width="2.3"/>' +
        gloss(44, 18, 5, 3.4, -34, 0.5)
    },
    {
      id: 'food29', label: '刨冰',
      svg: ground(24, 94) +
        '<path d="M26 46 L74 46 L64 84 C64 90 36 90 36 84 Z" fill="#EAF6FB" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" opacity="0.95"/>' +
        '<path d="M60 47 L74 46 L64 84 C64 87 58 89 50 89 C60 80 62 62 60 47 Z" fill="#C4DCE8" opacity="0.7"/>' +
        '<path d="M20 48 C20 24 32 8 50 8 C68 8 80 24 80 48 C70 42 62 48 50 44 C38 48 30 42 20 48 Z" ' +
        'fill="#FBFDFF" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M24 40 C26 22 36 12 50 12 C64 12 74 22 76 40 C66 34 58 40 50 36 C42 40 34 34 24 40 Z" fill="#F0455B" opacity="0.85"/>' +
        '<path d="M64 16 C74 24 78 34 78 44 C74 42 70 42 66 44 C70 34 68 24 64 16 Z" fill="#C42D42" opacity="0.6"/>' +
        '<path d="M50 8 C48 2 54 0 56 4" fill="none" stroke="#4E9C3F" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M30 60 C40 66 60 66 70 60" fill="none" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round" opacity="0.7"/>'
    },
    {
      id: 'food30', label: '咖啡',
      svg: ground(30, 92) + steam(46, 22) +
        '<path d="M74 44 C90 42 94 66 76 70" fill="none" stroke="#F7F3EC" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M74 44 C90 42 94 66 76 70" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
        cup('#6B3A18', '#4A2510') +
        '<ellipse cx="50" cy="45" rx="20" ry="5" fill="#8A5230"/>' +
        '<ellipse cx="44" cy="44" rx="7" ry="2.6" fill="#C9A282" opacity="0.8"/>' +
        '<path d="M20 84 L80 84 C80 90 20 90 20 84 Z" fill="#DDD6C8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>'
    },
    {
      id: 'food31', label: '牛奶',
      svg: ground(28, 92) +
        cup('#FBFAF6', '#E4DFD4') +
        '<ellipse cx="50" cy="45" rx="20" ry="5" fill="#FFFFFF"/>' +
        '<path d="M36 12 L64 12 L64 26 L36 26 Z" fill="#4E9CD8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M36 12 L50 4 L64 12 Z" fill="#6FB4E8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M42 18 L58 18" stroke="#F7F3EC" stroke-width="3" stroke-linecap="round"/>'
    },
    {
      id: 'food32', label: '果汁',
      svg: ground(28, 92) +
        cup('#F0912E', '#C4670E') +
        '<ellipse cx="50" cy="45" rx="20" ry="5" fill="#F7AC4E"/>' +
        '<path d="M60 30 L82 6" stroke="#6FBE4E" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M60 30 L82 6" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" opacity="0.35"/>' +
        '<path d="M30 30 C30 24 38 20 44 24 C40 30 34 32 30 30 Z" fill="#F0A82E" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<g fill="#F7C88A" opacity="0.85"><circle cx="40" cy="60" r="3.4"/><circle cx="60" cy="70" r="3"/><circle cx="46" cy="76" r="2.6"/></g>'
    },
    {
      id: 'pancake', label: '鬆餅',
      svg: ground(34, 90) +
        '<g stroke="' + INK + '" stroke-width="2.6">' +
        '<ellipse cx="50" cy="78" rx="36" ry="11" fill="#C4884A"/>' +
        '<ellipse cx="50" cy="66" rx="36" ry="11" fill="#D69A5A"/>' +
        '<ellipse cx="50" cy="54" rx="36" ry="11" fill="#E4AC6A"/></g>' +
        '<path d="M14 54 C14 44 30 38 50 38 C70 38 86 44 86 54 C86 62 70 68 50 68 C30 68 14 62 14 54 Z" ' +
        'fill="#EFC080" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M16 50 C22 42 34 44 42 38 C50 32 58 42 66 36 C74 30 82 40 85 48 C86 56 70 62 50 62 ' +
        'C30 62 16 58 16 50 Z" fill="#B87A2E" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M60 34 C70 30 80 38 84 46 C86 54 76 59 62 61 C74 54 72 42 60 34 Z" fill="#96601C" opacity="0.65"/>' +
        '<path d="M40 24 L62 24 L58 38 L44 38 Z" fill="#F7DC8E" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M56 24 L62 24 L58 38 L52 38 Z" fill="#E0BE5E" opacity="0.8"/>'
    },
    {
      id: 'bubble-tea', label: '珍珠奶茶',
      svg: ground(28, 92) +
        '<path d="M26 26 L74 26 L66 84 C66 89 34 89 34 84 Z" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" opacity="0.95"/>' +
        '<path d="M29 40 L71 40 L65 82 C65 86 35 86 35 82 Z" fill="#CBA173"/>' +
        '<path d="M59 40 L71 40 L65 82 C65 85 58 86 52 86 C60 76 62 56 59 40 Z" fill="#A87E52" opacity="0.8"/>' +
        '<g fill="#3B2618"><circle cx="41" cy="76" r="5.5"/><circle cx="55" cy="79" r="5.5"/><circle cx="49" cy="67" r="5.5"/>' +
        '<circle cx="61" cy="70" r="5"/><circle cx="38" cy="65" r="5"/><circle cx="58" cy="58" r="4.6"/></g>' +
        '<ellipse cx="50" cy="26" rx="24" ry="6" fill="#F0CBDA" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M56 26 L70 4" stroke="#E8546E" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M56 26 L70 4" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" opacity="0.3"/>' +
        gloss(37, 58, 3.4, 13, -6, 0.45)
    },
    {
      id: 'taiyaki', label: '鯛魚燒',
      svg: ground(32, 88) +
        '<path d="M8 54 C8 34 30 24 52 26 C74 28 86 40 90 52 C86 66 74 78 52 80 C30 82 8 72 8 54 Z" ' +
        'fill="#D9A25E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 30 C80 36 87 45 90 52 C86 66 74 78 52 80 C74 74 82 62 80 50 C78 40 70 32 66 30 Z" fill="#B57C34" opacity="0.8"/>' +
        '<path d="M90 52 C96 42 98 36 98 34 C94 42 90 46 88 48 M90 54 C96 64 98 72 98 74 C94 66 90 60 88 58 Z" ' +
        'fill="#C4884A" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M14 42 C24 38 34 38 42 40 M14 66 C24 70 34 70 42 68" fill="none" stroke="#B57C34" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M46 32 C50 42 50 62 46 74" fill="none" stroke="#B57C34" stroke-width="2.4"/>' +
        '<g fill="#B57C34" opacity="0.6"><ellipse cx="58" cy="44" rx="5" ry="4"/><ellipse cx="68" cy="52" rx="5" ry="4"/>' +
        '<ellipse cx="58" cy="62" rx="5" ry="4"/><ellipse cx="76" cy="60" rx="4" ry="3.4"/></g>' +
        '<circle cx="28" cy="50" r="5" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="28" cy="50" r="2.4" fill="#3B2618"/>'
    },
    {
      id: 'takoyaki', label: '章魚燒',
      svg: ground(34, 92) +
        '<path d="M10 74 C10 66 26 62 50 62 C74 62 90 66 90 74 C90 82 74 88 50 88 C26 88 10 82 10 74 Z" ' +
        'fill="#F2EAD8" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g stroke="' + INK + '" stroke-width="2.6">' +
        '<circle cx="26" cy="56" r="18" fill="#C4884A"/><circle cx="74" cy="56" r="18" fill="#C4884A"/>' +
        '<circle cx="50" cy="40" r="20" fill="#D69A5A"/></g>' +
        '<g fill="#9E6428" opacity="0.7"><circle cx="34" cy="62" r="7"/><circle cx="80" cy="62" r="7"/><circle cx="60" cy="48" r="7"/></g>' +
        '<path d="M14 52 C22 46 30 46 38 50 M62 52 C70 46 78 46 86 50" fill="none" stroke="#6B3E14" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M34 32 C40 26 46 32 52 26 C58 20 64 28 68 32" fill="none" stroke="#6B3E14" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M36 24 C42 20 48 24 54 20" fill="none" stroke="#F2EAD8" stroke-width="3" stroke-linecap="round"/>' +
        '<g fill="#E0A0A8" opacity="0.9"><path d="M40 16 L48 12 L46 20 Z"/><path d="M56 14 L64 12 L60 20 Z"/></g>' +
        '<g fill="#4E9C3F"><circle cx="30" cy="46" r="2"/><circle cx="70" cy="44" r="2"/></g>'
    },
    {
      id: 'pudding', label: '布丁',
      svg: ground(30, 90) +
        '<path d="M22 38 L78 38 L68 80 C68 86 32 86 32 80 Z" fill="#F7CE58" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 39 L78 38 L68 80 C68 83 60 85 50 85 C60 74 64 56 62 39 Z" fill="#D9A81E" opacity="0.75"/>' +
        '<path d="M22 38 C22 30 34 24 50 24 C66 24 78 30 78 38 C78 44 66 48 50 48 C34 48 22 44 22 38 Z" ' +
        'fill="#B06A1E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 27 C74 31 78 34 78 38 C78 43 70 46 60 47 C70 42 70 32 64 27 Z" fill="#8A4A10" opacity="0.7"/>' +
        '<path d="M30 82 C38 88 62 88 70 82" fill="none" stroke="#B06A1E" stroke-width="3" stroke-linecap="round" opacity="0.6"/>' +
        gloss(34, 56, 4, 12, -8, 0.45)
    },
    {
      id: 'lollipop', label: '棒棒糖',
      svg: ground(14, 94) +
        '<rect x="46" y="52" width="8" height="42" rx="4" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="50" cy="38" r="32" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M50 38 C50 20 62 8 76 12 C88 16 90 34 78 44 C68 52 56 50 50 38 Z" fill="#EE5B85"/>' +
        '<path d="M50 38 C50 56 38 68 24 64 C12 60 10 42 22 32 C32 24 44 26 50 38 Z" fill="#4EB4C4"/>' +
        '<path d="M50 38 C62 30 66 18 60 10 C54 6 44 8 38 16 C32 24 40 34 50 38 Z" fill="#F7DC58"/>' +
        '<path d="M50 38 C38 46 34 58 40 66 C46 70 56 68 62 60 C68 52 60 42 50 38 Z" fill="#6FBE4E"/>' +
        '<circle cx="50" cy="38" r="32" fill="none" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="50" cy="38" r="6" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.3"/>' +
        gloss(34, 24, 8, 5, -34, 0.5)
    },
    {
      id: 'chips', label: '洋芋片',
      svg: ground(28, 92) +
        '<path d="M24 26 L76 26 L72 88 C72 92 28 92 28 88 Z" fill="#F0C93C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 26 L76 26 L72 88 C72 90 66 91 58 91 C68 76 68 46 62 26 Z" fill="#D6A81E" opacity="0.8"/>' +
        '<path d="M20 10 L80 10 L76 28 L24 28 Z" fill="#D6382E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M24 10 L32 3 L42 10 L52 3 L62 10 L72 3 L80 10" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M28 18 L72 18" stroke="#F7F3EC" stroke-width="4" stroke-linecap="round"/>' +
        '<g stroke="' + INK + '" stroke-width="2.3">' +
        '<ellipse cx="38" cy="56" rx="12" ry="9" fill="#F7DEA0" transform="rotate(-14 38 56)"/>' +
        '<ellipse cx="60" cy="70" rx="12" ry="9" fill="#EFCE84" transform="rotate(12 60 70)"/></g>' +
        '<g fill="#D9B060" opacity="0.7"><circle cx="36" cy="55" r="1.8"/><circle cx="42" cy="59" r="1.6"/><circle cx="58" cy="70" r="1.8"/></g>'
    },
    {
      id: 'bagel', label: '貝果',
      svg: ground(32, 90) +
        '<circle cx="50" cy="54" r="37" fill="#C9944E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M72 25 C84 35 87 45 87 54 C87 74 71 91 50 91 C68 83 78 70 78 52 C78 39 75 30 72 25 Z" fill="#A47030" opacity="0.8"/>' +
        '<circle cx="50" cy="54" r="14" fill="#EFDFBC" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="50" cy="54" r="14" fill="none" stroke="#A47030" stroke-width="2" opacity="0.5"/>' +
        '<path d="M24 40 C34 32 50 30 62 34" fill="none" stroke="#E0B476" stroke-width="6" stroke-linecap="round" opacity="0.75"/>' +
        '<g fill="#F2E4C0" stroke="#B08040" stroke-width="0.8">' +
        '<ellipse cx="34" cy="30" rx="2.6" ry="1.8" transform="rotate(-20 34 30)"/>' +
        '<ellipse cx="52" cy="22" rx="2.6" ry="1.8"/><ellipse cx="70" cy="34" rx="2.6" ry="1.8" transform="rotate(30 70 34)"/>' +
        '<ellipse cx="80" cy="56" rx="2.6" ry="1.8" transform="rotate(80 80 56)"/>' +
        '<ellipse cx="68" cy="76" rx="2.6" ry="1.8" transform="rotate(-40 68 76)"/>' +
        '<ellipse cx="44" cy="84" rx="2.6" ry="1.8" transform="rotate(10 44 84)"/>' +
        '<ellipse cx="24" cy="66" rx="2.6" ry="1.8" transform="rotate(50 24 66)"/>' +
        '<ellipse cx="20" cy="46" rx="2.6" ry="1.8" transform="rotate(100 20 46)"/></g>'
    },
    {
      id: 'hotpot', label: '火鍋',
      svg: ground(38, 92) + steam(50, 32) +
        '<path d="M8 50 L92 50 L84 78 C84 86 16 86 16 78 Z" fill="#B8BEC4" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M70 51 C70 66 64 78 52 84 C70 84 82 80 84 78 L92 50 Z" fill="#8E959C" opacity="0.7"/>' +
        '<path d="M2 56 L12 52 M98 56 L88 52" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="50" cy="50" rx="42" ry="10" fill="#D2D8DE" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<ellipse cx="50" cy="50" rx="36" ry="7.5" fill="#D6382E"/>' +
        '<g stroke="' + INK + '" stroke-width="2.2">' +
        '<circle cx="34" cy="48" r="5.5" fill="#F0C93C"/><circle cx="62" cy="51" r="5.5" fill="#F7F3EC"/>' +
        '<circle cx="48" cy="46" r="4.6" fill="#6FAE3E"/><circle cx="74" cy="47" r="4.4" fill="#C4703C"/></g>' +
        '<path d="M20 48 C26 44 32 44 36 46" fill="none" stroke="#F0A0A0" stroke-width="3" stroke-linecap="round" opacity="0.8"/>'
    },
    {
      id: 'skewer', label: '串燒',
      svg: ground(18, 94) +
        '<rect x="46" y="4" width="8" height="90" rx="4" fill="#E0C89A" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<g stroke="' + INK + '" stroke-width="2.6">' +
        '<rect x="16" y="16" width="68" height="22" rx="10" fill="#B0603C"/>' +
        '<rect x="16" y="42" width="68" height="22" rx="10" fill="#C4703C"/>' +
        '<rect x="16" y="68" width="68" height="22" rx="10" fill="#B0603C"/></g>' +
        '<g fill="#8A4218" opacity="0.65">' +
        '<path d="M62 16 L84 16 C84 28 84 38 62 38 C72 32 72 22 62 16 Z"/>' +
        '<path d="M62 42 L84 42 C84 54 84 64 62 64 C72 58 72 48 62 42 Z"/>' +
        '<path d="M62 68 L84 68 C84 80 84 90 62 90 C72 84 72 74 62 68 Z"/></g>' +
        '<g stroke="#6B2E10" stroke-width="2.4" stroke-linecap="round" fill="none">' +
        '<path d="M24 22 C32 26 40 20 46 24 M24 48 C32 52 40 46 46 50 M24 74 C32 78 40 72 46 76"/></g>' +
        '<g fill="#F7F3EC" opacity="0.5"><ellipse cx="26" cy="24" rx="5" ry="2.6"/><ellipse cx="26" cy="50" rx="5" ry="2.6"/></g>'
    }
  ]);

  /* ---- 第三批：再加 18 種，食物的造型池從 42 種變成 60 種 ----
     容器仍然是主要的分辨方式：這批刻意避開「又一個碗」，改用平盤（義大利麵、
     炒飯、香腸、生魚片）、玻璃杯（聖代、汽水）、罐子（蜂蜜）、蒸籠（包子）
     與有特殊輪廓的點心（蝴蝶脆餅、馬卡龍、棉花糖、蛋糕捲）。 */
  var MORE = [
    {
      id: 'spaghetti', label: '義大利麵',
      svg: ground(34, 90) +
        '<ellipse cx="50" cy="64" rx="44" ry="24" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M78 50 C86 54 90 59 90 64 C90 77 72 88 50 88 C74 84 86 74 86 62 C86 57 82 52 78 50 Z" fill="#DDD6C8" opacity="0.8"/>' +
        '<ellipse cx="50" cy="62" rx="34" ry="17" fill="#EFE7DA"/>' +
        '<g fill="none" stroke="#F0D07A" stroke-width="4.4" stroke-linecap="round">' +
        '<path d="M24 60 C32 50 50 48 62 54 M28 68 C40 60 58 60 70 66 M24 52 C36 46 56 44 70 50 M34 72 C46 68 60 68 72 72"/></g>' +
        '<g fill="none" stroke="#E0B84E" stroke-width="2" stroke-linecap="round" opacity="0.9">' +
        '<path d="M26 64 C36 56 52 54 64 58 M32 56 C44 50 58 50 68 54"/></g>' +
        '<g fill="#C63A2A" stroke="' + INK + '" stroke-width="2.2">' +
        '<ellipse cx="46" cy="56" rx="11" ry="7"/><ellipse cx="64" cy="62" rx="8" ry="5.4"/></g>' +
        '<g fill="#8A1F18" opacity="0.45"><ellipse cx="48" cy="55" rx="4" ry="2.4"/></g>' +
        '<g fill="#4E9C3F"><ellipse cx="36" cy="50" rx="5" ry="3" transform="rotate(-22 36 50)"/>' +
        '<ellipse cx="68" cy="52" rx="4.4" ry="2.6" transform="rotate(20 68 52)"/></g>' +
        gloss(30, 56, 7, 3.4, -16, 0.4)
    },
    {
      id: 'taco', label: '塔可餅',
      svg: ground(32, 92) +
        '<path d="M24 60 C24 38 34 24 50 24 C66 24 76 38 76 60 Z" fill="#8A4A26" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<g fill="#6FAE3E" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round">' +
        '<path d="M28 44 C22 36 26 28 34 30 C40 32 42 40 38 46 Z"/>' +
        '<path d="M50 36 C46 26 54 20 60 24 C66 28 64 38 58 40 Z"/>' +
        '<path d="M68 46 C74 38 72 30 64 30 C58 32 58 40 62 46 Z"/></g>' +
        '<g fill="#D6392E" stroke="' + INK + '" stroke-width="2"><rect x="38" y="44" width="10" height="9" rx="2"/>' +
        '<rect x="56" y="48" width="9" height="8" rx="2"/></g>' +
        '<g fill="#F0C33C"><rect x="30" y="52" width="14" height="4" rx="2"/><rect x="52" y="40" width="13" height="4" rx="2"/>' +
        '<rect x="44" y="56" width="12" height="4" rx="2"/></g>' +
        '<path d="M12 46 C12 74 28 90 50 90 C72 90 88 74 88 46 C88 40 80 40 80 48 C78 68 66 80 50 80 C34 80 22 68 20 48 C20 40 12 40 12 46 Z" ' +
        'fill="#EFC25E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M88 46 C88 74 72 90 50 90 C66 84 76 68 76 46 C76 40 84 40 88 46 Z" fill="#CE9E36" opacity="0.75"/>' +
        '<g fill="#C98A3E" opacity="0.6"><circle cx="30" cy="72" r="3"/><circle cx="50" cy="80" r="3"/><circle cx="68" cy="72" r="3"/></g>'
    },
    {
      id: 'pretzel', label: '蝴蝶脆餅',
      svg: ground(30, 92) +
        '<path d="M50 86 C24 86 12 68 18 48 C24 32 44 32 48 50 C50 58 50 64 50 72 C50 64 50 58 52 50 C56 32 76 32 82 48 C88 68 76 86 50 86 Z" ' +
        'fill="none" stroke="' + INK + '" stroke-width="17" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M50 86 C24 86 12 68 18 48 C24 32 44 32 48 50 C50 58 50 64 50 72 C50 64 50 58 52 50 C56 32 76 32 82 48 C88 68 76 86 50 86 Z" ' +
        'fill="none" stroke="#B4762E" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M50 86 C24 86 12 68 18 48 C22 38 32 34 40 38" ' +
        'fill="none" stroke="#8E5518" stroke-width="3" stroke-linecap="round" opacity="0.55"/>' +
        '<g fill="#FBF8F2"><circle cx="30" cy="52" r="2.6"/><circle cx="70" cy="52" r="2.6"/><circle cx="38" cy="76" r="2.6"/>' +
        '<circle cx="62" cy="78" r="2.6"/><circle cx="50" cy="82" r="2.4"/><circle cx="22" cy="66" r="2.4"/><circle cx="78" cy="66" r="2.4"/></g>'
    },
    {
      id: 'macaron', label: '馬卡龍',
      svg: ground(32, 88) +
        '<path d="M14 46 C14 32 30 24 50 24 C70 24 86 32 86 46 C86 51 76 54 50 54 C24 54 14 51 14 46 Z" ' +
        'fill="#F5A7C0" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 27 C79 32 86 38 86 46 C86 51 76 54 50 54 C74 52 80 44 74 36 C72 32 69 29 66 27 Z" fill="#DB7E9C" opacity="0.8"/>' +
        '<g fill="#EE93B0"><ellipse cx="24" cy="52" rx="6" ry="3"/><ellipse cx="40" cy="54" rx="6" ry="3"/>' +
        '<ellipse cx="60" cy="54" rx="6" ry="3"/><ellipse cx="76" cy="52" rx="6" ry="3"/></g>' +
        '<path d="M16 54 C24 52 76 52 84 54 C86 59 83 64 76 66 L24 66 C17 64 14 59 16 54 Z" ' +
        'fill="#F6E3A8" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M14 66 C14 78 30 86 50 86 C70 86 86 78 86 66 C86 61 76 58 50 58 C24 58 14 61 14 66 Z" ' +
        'fill="#F5A7C0" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M74 60 C82 62 86 64 86 66 C86 78 70 86 50 86 C72 82 80 72 76 64 Z" fill="#DB7E9C" opacity="0.8"/>' +
        gloss(32, 36, 10, 5, -22, 0.45)
    },
    {
      id: 'mooncake', label: '月餅',
      svg: ground(32, 88) +
        '<path d="M22 26 L78 26 C84 26 88 30 88 36 L88 70 C88 76 84 80 78 80 L22 80 C16 80 12 76 12 70 L12 36 C12 30 16 26 22 26 Z" ' +
        'fill="#C98A3E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M70 27 C82 28 88 32 88 40 L88 70 C88 76 84 80 78 80 L52 80 C70 76 78 62 76 48 C75 39 73 31 70 27 Z" fill="#A5691F" opacity="0.75"/>' +
        '<path d="M20 32 L80 32 C84 32 86 35 86 39 L86 67 C86 71 84 74 80 74 L20 74 C16 74 14 71 14 67 L14 39 C14 35 16 32 20 32 Z" ' +
        'fill="#DDA155" stroke="#A5691F" stroke-width="2.2"/>' +
        '<circle cx="50" cy="53" r="14" fill="none" stroke="#A5691F" stroke-width="2.6"/>' +
        '<g fill="#A5691F" opacity="0.9"><ellipse cx="50" cy="43" rx="4" ry="6"/><ellipse cx="50" cy="63" rx="4" ry="6"/>' +
        '<ellipse cx="40" cy="53" rx="6" ry="4"/><ellipse cx="60" cy="53" rx="6" ry="4"/></g>' +
        '<circle cx="50" cy="53" r="4" fill="#8A5318"/>' +
        '<g fill="none" stroke="#A5691F" stroke-width="2.2" stroke-linecap="round">' +
        '<path d="M20 38 L26 38 M20 38 L20 44 M80 38 L74 38 M80 38 L80 44 M20 68 L26 68 M20 68 L20 62 M80 68 L74 68 M80 68 L80 62"/></g>'
    },
    {
      id: 'pineapple-cake', label: '鳳梨酥',
      svg: ground(30, 88) +
        '<path d="M20 30 L74 30 C78 30 80 33 80 37 L80 73 C80 77 78 80 74 80 L20 80 C16 80 14 77 14 73 L14 37 C14 33 16 30 20 30 Z" ' +
        'fill="#E8C070" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 31 C74 33 80 38 80 44 L80 73 C80 77 78 80 74 80 L54 80 C70 74 74 58 70 44 C68 37 66 33 64 31 Z" fill="#C99C46" opacity="0.8"/>' +
        '<rect x="21" y="37" width="52" height="36" rx="4" fill="none" stroke="#BE8F32" stroke-width="2.2"/>' +
        '<path d="M80 37 L80 73 C80 77 78 80 74 80 L74 30 C78 30 80 33 80 37 Z" fill="#F0C33C" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M86 34 C92 36 94 44 92 52 L92 68 C92 76 88 80 82 80 L74 80 L74 30 Z" fill="#EFB026" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<g fill="#D9891A" opacity="0.85"><ellipse cx="83" cy="46" rx="3.4" ry="4.4"/><ellipse cx="85" cy="62" rx="3.4" ry="4.4"/></g>' +
        gloss(32, 42, 10, 4, -8, 0.35)
    },
    {
      id: 'bao', label: '包子',
      svg: steam(50, 24) +
        '<path d="M50 28 C68 28 80 42 80 56 C80 66 68 72 50 72 C32 72 20 66 20 56 C20 42 32 28 50 28 Z" ' +
        'fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 33 C74 39 80 47 80 56 C80 66 68 72 50 72 C68 70 76 62 74 52 C72 44 68 37 64 33 Z" fill="#DDD6C8" opacity="0.85"/>' +
        '<g fill="none" stroke="#D2C9B6" stroke-width="2.4" stroke-linecap="round">' +
        '<path d="M50 34 C40 40 32 48 26 60 M50 34 C44 42 38 52 34 64 M50 34 C56 42 62 52 66 64 M50 34 C60 40 68 48 74 60"/></g>' +
        '<circle cx="50" cy="34" r="5" fill="#EFE7D6" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<path d="M10 68 L90 68 C90 84 80 90 50 90 C20 90 10 84 10 68 Z" ' +
        'fill="#C9A05E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M74 68 L90 68 C90 84 80 90 50 90 C72 88 78 80 74 68 Z" fill="#A57F3C" opacity="0.8"/>' +
        '<g fill="none" stroke="#8E6428" stroke-width="2.2"><path d="M14 76 L86 76 M18 84 L82 84"/></g>'
    },
    {
      id: 'tofu', label: '豆腐',
      svg: ground(32, 92) +
        '<ellipse cx="50" cy="80" rx="40" ry="13" fill="#E4EDF2" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M78 72 C84 75 86 78 86 80 C86 87 70 92 50 92 C68 90 78 84 78 76 Z" fill="#C4D2DA" opacity="0.85"/>' +
        '<path d="M26 44 L50 32 L74 44 L50 56 Z" fill="#FBF8EE" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M26 44 L26 68 L50 80 L50 56 Z" fill="#EFE7D6" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M74 44 L74 68 L50 80 L50 56 Z" fill="#D9CFB8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M36 40 C44 44 56 44 64 40" fill="none" stroke="#D9CFB8" stroke-width="2" opacity="0.8"/>' +
        '<path d="M40 34 C48 38 56 42 58 50 C60 58 56 66 50 70" fill="none" stroke="#7A4A22" stroke-width="3.4" stroke-linecap="round" opacity="0.9"/>' +
        '<g fill="#4E9C3F"><rect x="40" y="34" width="8" height="3.4" rx="1.7" transform="rotate(-18 44 36)"/>' +
        '<rect x="54" y="38" width="8" height="3.4" rx="1.7" transform="rotate(22 58 40)"/>' +
        '<rect x="46" y="44" width="7" height="3.2" rx="1.6" transform="rotate(-8 50 46)"/></g>'
    },
    {
      id: 'fried-rice', label: '炒飯',
      svg: steam(50, 26) + ground(36, 92) +
        '<ellipse cx="50" cy="74" rx="44" ry="18" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M80 62 C88 66 94 70 94 74 C94 84 74 92 50 92 C74 88 86 80 86 70 C86 67 83 64 80 62 Z" fill="#DDD6C8" opacity="0.8"/>' +
        '<path d="M16 70 C16 52 32 40 50 40 C68 40 84 52 84 70 C84 76 70 80 50 80 C30 80 16 76 16 70 Z" ' +
        'fill="#F0DFA8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M66 45 C78 51 84 60 84 70 C84 76 70 80 50 80 C72 78 80 70 78 60 C76 53 70 47 66 45 Z" fill="#D9C480" opacity="0.85"/>' +
        '<g fill="#FBF2D2"><ellipse cx="34" cy="58" rx="5" ry="3" transform="rotate(-20 34 58)"/>' +
        '<ellipse cx="48" cy="50" rx="5" ry="3" transform="rotate(15 48 50)"/><ellipse cx="62" cy="58" rx="5" ry="3" transform="rotate(-10 62 58)"/>' +
        '<ellipse cx="28" cy="68" rx="5" ry="3"/><ellipse cx="44" cy="70" rx="5" ry="3" transform="rotate(20 44 70)"/>' +
        '<ellipse cx="60" cy="70" rx="5" ry="3" transform="rotate(-16 60 70)"/><ellipse cx="72" cy="64" rx="5" ry="3"/></g>' +
        '<g fill="#4E9C3F"><circle cx="38" cy="52" r="3.4"/><circle cx="56" cy="64" r="3.4"/><circle cx="70" cy="54" r="3.2"/>' +
        '<circle cx="30" cy="63" r="3"/></g>' +
        '<g fill="#F0C33C"><rect x="50" y="55" width="7" height="4" rx="2"/><rect x="34" y="72" width="7" height="4" rx="2"/>' +
        '<rect x="64" y="70" width="7" height="4" rx="2"/></g>' +
        '<g fill="#E8892E"><ellipse cx="44" cy="60" rx="5" ry="3.4" transform="rotate(-24 44 60)"/>' +
        '<ellipse cx="66" cy="62" rx="4.4" ry="3" transform="rotate(16 66 62)"/></g>'
    },
    {
      id: 'sausage', label: '香腸',
      svg: ground(34, 92) +
        '<ellipse cx="50" cy="76" rx="42" ry="16" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M78 66 C86 69 92 72 92 76 C92 85 74 92 50 92 C74 88 84 82 84 74 C84 71 81 68 78 66 Z" fill="#DDD6C8" opacity="0.8"/>' +
        '<path d="M14 50 C14 42 22 38 30 40 L74 50 C82 52 86 58 84 64 C82 70 74 72 66 70 L22 60 C16 58 14 55 14 50 Z" ' +
        'fill="#B4522E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 46 C74 49 84 54 84 62 C84 68 76 72 66 70 L52 67 C68 64 72 54 62 46 Z" fill="#8A3418" opacity="0.85"/>' +
        '<g fill="none" stroke="#71290F" stroke-width="2.6" stroke-linecap="round" opacity="0.9">' +
        '<path d="M28 42 L24 58 M44 46 L40 62 M60 50 L56 66 M74 54 L70 69"/></g>' +
        '<path d="M18 66 C18 60 26 58 34 60 L70 70 C78 72 82 78 80 82 C78 87 70 88 62 86 L26 76 C20 74 18 71 18 66 Z" ' +
        'fill="#C4602E" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#8A3418" stroke-width="2.4" stroke-linecap="round" opacity="0.85">' +
        '<path d="M32 60 L28 74 M50 65 L46 79 M68 70 L64 84"/></g>' +
        gloss(30, 48, 8, 3, -14, 0.34)
    },
    {
      id: 'sundae', label: '聖代',
      svg: ground(20, 94) +
        '<path d="M26 40 C26 26 36 18 50 18 C64 18 74 26 74 38 C80 40 82 48 76 52 C72 46 66 44 62 46 C58 40 48 40 44 46 C38 42 30 44 26 40 Z" ' +
        'fill="#FBEBD2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 20 C70 24 74 30 74 38 C80 40 82 48 76 52 C72 46 66 44 62 46 C64 36 63 26 60 20 Z" fill="#E4CFA8" opacity="0.85"/>' +
        '<path d="M28 44 C36 52 44 46 50 50 C58 54 66 48 74 44 C76 52 72 58 66 60 L34 60 C28 58 26 50 28 44 Z" fill="#D6392E"/>' +
        '<circle cx="50" cy="14" r="7" fill="#D6342E" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<path d="M50 8 C52 2 58 2 60 4" fill="none" stroke="#4E9C3F" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M76 26 L88 22 L84 50 L78 48 Z" fill="#E8C070" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<path d="M28 48 L72 48 L64 80 C64 86 36 86 36 80 Z" fill="#EAF2F6" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" opacity="0.92"/>' +
        '<path d="M31 52 L69 52 L63 78 C63 82 37 82 37 78 Z" fill="#F7D9E4" opacity="0.85"/>' +
        '<path d="M45 84 L55 84 L55 88 L62 94 L38 94 L45 88 Z" fill="#EAF2F6" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        gloss(38, 62, 3.4, 12, -4, 0.5)
    },
    {
      id: 'tea', label: '熱茶',
      svg: steam(50, 28) +
        '<ellipse cx="50" cy="86" rx="36" ry="10" fill="#F0EAE0" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M72 80 C82 82 86 84 86 86 C86 91 70 96 50 96 C70 94 78 88 76 82 Z" fill="#D2C9B6" opacity="0.85"/>' +
        '<path d="M74 50 C88 50 88 70 74 70" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M74 50 C86 50 86 70 74 70" fill="none" stroke="#FBF8F2" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M24 44 L76 44 L70 74 C70 82 30 82 30 74 Z" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M62 45 L76 44 L70 74 C70 79 58 81 46 81 C62 79 66 72 66 62 C66 54 64 48 62 45 Z" fill="#DDD6C8" opacity="0.85"/>' +
        '<ellipse cx="50" cy="44" rx="26" ry="8" fill="#C98A3E" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<ellipse cx="44" cy="43" rx="9" ry="3" fill="#E0AC63" opacity="0.7"/>' +
        '<path d="M56 40 L64 22" fill="none" stroke="#D2C9B6" stroke-width="2" stroke-linecap="round"/>' +
        '<rect x="60" y="14" width="12" height="9" rx="2" fill="#EFC25E" stroke="' + INK + '" stroke-width="2.2"/>'
    },
    {
      id: 'soda', label: '汽水',
      svg: ground(22, 94) +
        '<path d="M42 16 L58 16 L58 28 C68 34 72 44 72 56 L72 80 C72 87 65 91 50 91 C35 91 28 87 28 80 L28 56 C28 44 32 34 42 28 Z" ' +
        'fill="#CFE8F2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M29 50 L71 50 L71 80 C71 87 65 90 50 90 C35 90 29 87 29 80 Z" fill="#E8892E"/>' +
        '<path d="M62 50 L71 50 L71 80 C71 87 65 90 50 90 C62 88 66 84 66 76 L66 50 Z" fill="#C46A18" opacity="0.85"/>' +
        '<g fill="#FBF8F2" opacity="0.75"><circle cx="40" cy="60" r="3"/><circle cx="52" cy="56" r="2.4"/>' +
        '<circle cx="60" cy="66" r="2.6"/><circle cx="44" cy="72" r="2.6"/><circle cx="56" cy="78" r="2.2"/><circle cx="36" cy="82" r="2.2"/></g>' +
        '<rect x="30" y="58" width="40" height="15" rx="4" fill="#FBF8F2" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<path d="M34 65 C40 61 46 69 52 65 C58 61 64 69 66 65" fill="none" stroke="#D6342E" stroke-width="2.6" stroke-linecap="round"/>' +
        '<rect x="39" y="8" width="22" height="10" rx="3" fill="#D6342E" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<g fill="none" stroke="#8A1F18" stroke-width="1.6"><path d="M43 9 L43 17 M50 9 L50 17 M57 9 L57 17"/></g>' +
        gloss(36, 46, 3.4, 12, -4, 0.5)
    },
    {
      id: 'honey', label: '蜂蜜',
      svg: ground(30, 92) +
        '<path d="M62 18 C68 14 76 18 74 26 L64 62" fill="none" stroke="#C98A3E" stroke-width="5" stroke-linecap="round"/>' +
        '<g fill="#E8B23C" stroke="' + INK + '" stroke-width="2.2">' +
        '<ellipse cx="68" cy="44" rx="8" ry="5"/><ellipse cx="66" cy="52" rx="9" ry="5"/><ellipse cx="64" cy="60" rx="8" ry="5"/></g>' +
        '<path d="M28 38 L72 38 C77 38 79 42 79 48 L79 78 C79 87 70 92 50 92 C30 92 21 87 21 78 L21 48 C21 42 23 38 28 38 Z" ' +
        'fill="#F0B429" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M66 39 C75 40 79 43 79 50 L79 78 C79 87 70 92 50 92 C68 89 73 82 72 70 C71 56 69 45 66 39 Z" fill="#CE8F10" opacity="0.8"/>' +
        '<rect x="24" y="26" width="52" height="14" rx="5" fill="#C98A3E" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M76 27 C79 30 79 36 76 39 L66 39 C69 36 69 30 66 27 Z" fill="#9E6A20" opacity="0.8"/>' +
        '<rect x="30" y="54" width="40" height="24" rx="5" fill="#FBF6E4" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<g fill="#E8B23C"><polygon points="40,60 45,60 47.5,64.5 45,69 40,69 37.5,64.5"/>' +
        '<polygon points="53,60 58,60 60.5,64.5 58,69 53,69 50.5,64.5"/>' +
        '<polygon points="46.5,69.5 51.5,69.5 54,74 51.5,78 46.5,78 44,74"/></g>'
    },
    {
      id: 'swiss-roll', label: '蛋糕捲',
      svg: ground(32, 90) +
        '<circle cx="50" cy="54" r="34" fill="#E8B96E" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M74 30 C82 38 84 46 84 54 C84 73 69 88 50 88 C68 84 78 70 78 54 C78 44 76 35 74 30 Z" fill="#C4954A" opacity="0.8"/>' +
        '<path d="M50 54 C50 44 60 40 68 46 C78 54 76 72 62 80 C46 88 26 76 26 56 C26 36 42 22 62 24" ' +
        'fill="none" stroke="#FBF0D8" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M50 54 C50 44 60 40 68 46 C78 54 76 72 62 80 C46 88 26 76 26 56 C26 36 42 22 62 24" ' +
        'fill="none" stroke="#B4762E" stroke-width="3.4" stroke-linecap="round" opacity="0.7"/>' +
        '<circle cx="50" cy="54" r="4.4" fill="#FBF0D8" stroke="#B4762E" stroke-width="2"/>' +
        gloss(34, 34, 10, 5, -32, 0.35)
    },
    {
      id: 'cotton-candy', label: '棉花糖',
      svg: ground(16, 95) +
        '<rect x="46.5" y="56" width="7" height="38" rx="3" fill="#E8DCC2" stroke="' + INK + '" stroke-width="2.3"/>' +
        '<path d="M50 12 C64 8 78 18 76 30 C88 34 88 50 76 54 C70 64 58 66 50 62 C42 66 30 64 24 54 ' +
        'C12 50 12 34 24 30 C22 18 36 8 50 12 Z" fill="#F7A8C8" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M64 14 C74 20 78 26 76 30 C88 34 88 50 76 54 C70 64 58 66 50 62 C64 60 72 52 72 42 C72 28 68 18 64 14 Z" ' +
        'fill="#E07FA8" opacity="0.8"/>' +
        '<g fill="#FBD0E0" opacity="0.9"><ellipse cx="36" cy="26" rx="10" ry="7" transform="rotate(-18 36 26)"/>' +
        '<ellipse cx="30" cy="42" rx="8" ry="5.4"/><ellipse cx="52" cy="20" rx="8" ry="5" transform="rotate(8 52 20)"/></g>' +
        '<g fill="#FFFFFF" opacity="0.5"><circle cx="42" cy="34" r="3"/><circle cx="60" cy="30" r="2.6"/><circle cx="56" cy="48" r="2.6"/></g>'
    },
    {
      id: 'egg-tart', label: '蛋塔',
      svg: ground(32, 90) +
        '<path d="M16 50 C16 42 30 38 50 38 C70 38 84 42 84 50 L78 76 C76 83 62 87 50 87 C38 87 24 83 22 76 Z" ' +
        'fill="#D9A45C" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M68 41 C79 44 84 46 84 50 L78 76 C76 83 62 87 50 87 C66 84 72 78 74 68 C77 56 72 46 68 41 Z" fill="#B47F32" opacity="0.8"/>' +
        '<g fill="none" stroke="#A5691F" stroke-width="2.2" opacity="0.9">' +
        '<path d="M28 48 L26 78 M40 50 L39 84 M52 50 L52 86 M64 50 L65 84 M74 48 L76 76"/></g>' +
        '<ellipse cx="50" cy="48" rx="32" ry="12" fill="#F2C34E" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<ellipse cx="50" cy="47" rx="26" ry="8.4" fill="#F7D66E"/>' +
        '<g fill="#8A5318" opacity="0.7"><ellipse cx="38" cy="45" rx="3.4" ry="2.2"/><ellipse cx="58" cy="49" rx="4" ry="2.4"/>' +
        '<ellipse cx="50" cy="42" rx="2.6" ry="1.8"/><ellipse cx="64" cy="44" rx="2.6" ry="1.8"/></g>' +
        gloss(38, 44, 7, 2.6, -8, 0.4)
    },
    {
      id: 'sashimi', label: '生魚片',
      svg: ground(34, 92) +
        '<ellipse cx="50" cy="70" rx="44" ry="20" fill="#F7F3EC" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M80 56 C89 61 94 66 94 70 C94 81 74 90 50 90 C74 86 86 77 86 66 C86 62 83 58 80 56 Z" fill="#DDD6C8" opacity="0.8"/>' +
        '<path d="M22 66 C18 54 26 44 40 44 C54 44 62 52 60 64 C48 70 32 72 22 66 Z" fill="#3F8A32" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
        '<g stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round">' +
        '<path d="M24 56 C30 46 46 42 56 48 C64 53 62 63 52 68 C40 74 26 68 24 56 Z" fill="#F0805E"/>' +
        '<path d="M38 50 C44 40 60 36 70 42 C78 47 76 57 66 62 C54 68 40 62 38 50 Z" fill="#F58C6A"/>' +
        '<path d="M52 58 C58 48 74 44 84 50 C92 55 90 65 80 70 C68 76 54 70 52 58 Z" fill="#F0805E"/></g>' +
        '<g fill="none" stroke="#FBE0D2" stroke-width="2.6" stroke-linecap="round" opacity="0.95">' +
        '<path d="M30 58 C36 52 46 50 52 54 M28 64 C34 58 44 56 50 60 M44 52 C50 46 60 44 66 48 M42 58 C48 52 58 50 64 54 ' +
        'M58 60 C64 54 74 52 80 56 M56 66 C62 60 72 58 78 62"/></g>' +
        '<g fill="#6FAE3E" stroke="' + INK + '" stroke-width="2"><circle cx="24" cy="76" r="7"/></g>' +
        '<g fill="none" stroke="#FBF8F2" stroke-width="2.4" stroke-linecap="round">' +
        '<path d="M64 76 L84 74 M64 80 L82 79 M66 72 L84 69"/></g>'
    }
  ];

  return {
    key: 'food',
    label: '食物',
    emoji: '🍔',
    note: '正餐、點心與飲料',
    list: LIST.concat(MORE)
  };
}));
