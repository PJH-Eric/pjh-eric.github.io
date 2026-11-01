/* ===== themes.js — 造型主題的登記處 =====
 *
 * 每一個主題就是一份造型清單（themes/*.js）。盤面本身只認「第幾種」這個數字，
 * 主題只決定那個數字畫成什麼樣子，所以換主題完全不影響規則。
 *
 * 瀏覽器：themes/*.js 先用 script 標籤載入，各自掛上全域變數，這裡再收集起來。
 * Node（伺服器與測試）：直接 require，用來驗證主題名稱與可用的造型數量。
 */
(function (root, factory) {
  'use strict';
  var isNode = (typeof module === 'object' && module.exports);
  var parts = isNode
    ? [
        require('./themes/fruits.js'),
        require('./themes/animals.js'),
        require('./themes/food.js'),
        require('./themes/flags.js'),
        require('./themes/mahjong.js')
      ]
    : [root.THEME_FRUITS, root.THEME_ANIMALS, root.THEME_FOOD, root.THEME_FLAGS, root.THEME_MAHJONG];
  var api = factory(parts);
  if (isNode) module.exports = api;
  root.Themes = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (parts) {
  'use strict';

  var BASE = parts.filter(function (t) { return t && t.list && t.list.length; });

  /* 大混搭：把四個平面主題接起來，麻將保留給專用疊牌模式。
     id 前面加上來源主題，避免不同主題剛好撞名。 */
  var MIXED_BASE = BASE.filter(function (t) { return t.key !== 'mahjong'; });
  var MIXED = {
    key: 'mixed',
    label: '大混搭',
    emoji: '🎲',
    note: '蔬果、動物、食物和國旗混在一起',
    list: MIXED_BASE.reduce(function (acc, t) {
      return acc.concat(t.list.map(function (x) {
        return { id: t.key + ':' + x.id, label: x.label, svg: x.svg };
      }));
    }, [])
  };

  var LIST = BASE.concat([MIXED]);
  var BY_KEY = {};
  LIST.forEach(function (t) { BY_KEY[t.key] = t; });

  var DEFAULT = LIST[0].key;

  /** 不認得的主題名稱一律收斂回預設，前端傳什麼進來都不會壞掉 */
  function of(key) { return BY_KEY[String(key || '')] || BY_KEY[DEFAULT]; }
  function has(key) { return !!BY_KEY[String(key || '')]; }
  function count(key) { return of(key).list.length; }

  /**
   * 取第 i 種造型。i 會繞回頭，所以就算關卡要的種類數比主題多也不會出錯。
   * @param {string} key 主題名稱
   * @param {number} i   0 起算
   */
  function art(key, i) {
    var list = of(key).list;
    var n = list.length;
    return list[((Math.floor(i) % n) + n) % n];
  }

  /** 給選單用的簡表（不含 SVG，資料量小） */
  function menu() {
    return LIST.map(function (t) {
      return { key: t.key, label: t.label, emoji: t.emoji, note: t.note, count: t.list.length };
    });
  }

  return {
    LIST: LIST,
    KEYS: LIST.map(function (t) { return t.key; }),
    DEFAULT: DEFAULT,
    of: of,
    has: has,
    count: count,
    art: art,
    menu: menu
  };
}));
