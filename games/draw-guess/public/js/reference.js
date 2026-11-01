/* Offline drawing references use the same shape recipes as the game. */
(function (root, factory) {
  'use strict';
  var api = factory(
    typeof module === 'object' && module.exports
      ? require('./words.js')
      : root.Words,
    typeof module === 'object' && module.exports
      ? require('./reference-recipes.js')
      : root.ReferenceRecipes,
    typeof module === 'object' && module.exports
      ? require('./reference-path.js')
      : root.ReferencePath
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.DrawingReference = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Words, Recipes, Path) {
  'use strict';

  // Each entry describes the named subject, rather than its category or a similar word.
  var recipes = {
    棒球: [
      ['c', 500, 500, 310],
      ['ae', 210, 500, 210, 310, 285, 75],
      ['ae', 790, 500, 210, 310, 105, 255],
      ['l', 320, 290, 365, 320],
      ['l', 365, 390, 410, 405],
      ['l', 365, 610, 410, 595],
      ['l', 320, 710, 365, 680],
      ['l', 635, 320, 680, 290],
      ['l', 590, 405, 635, 390],
      ['l', 590, 595, 635, 610],
      ['l', 635, 680, 680, 710]
    ],
    排球: [
      ['c', 500, 500, 310],
      ['p', 500, 500, 470, 340, 500, 190],
      ['p', 500, 500, 650, 560, 780, 630],
      ['p', 500, 500, 370, 610, 220, 630],
      ['p', 425, 210, 400, 360, 430, 490],
      ['p', 575, 210, 550, 340, 570, 450],
      ['p', 790, 550, 660, 480, 580, 450],
      ['p', 740, 700, 610, 620, 540, 580],
      ['p', 290, 730, 430, 690, 540, 580],
      ['p', 195, 550, 340, 540, 430, 490]
    ],
    網球: [
      ['c', 500, 500, 310],
      ['ae', 200, 500, 230, 310, 275, 85],
      ['ae', 800, 500, 230, 310, 95, 265]
    ],
    雪花: [
      ['l', 500, 150, 500, 850],
      ['l', 197, 325, 803, 675],
      ['l', 197, 675, 803, 325],
      ['p', 420, 210, 500, 290, 580, 210],
      ['p', 420, 790, 500, 710, 580, 790],
      ['p', 210, 430, 320, 396, 285, 285],
      ['p', 715, 715, 680, 604, 790, 570],
      ['p', 210, 570, 320, 604, 285, 715],
      ['p', 715, 285, 680, 396, 790, 430]
    ],
    流星: [
      ['st', 640, 640, 180, 75, 5],
      ['l', 230, 150, 540, 460],
      ['l', 150, 270, 460, 580],
      ['l', 330, 150, 620, 440]
    ],
    櫻桃: [
      ['c', 350, 650, 145],
      ['c', 650, 650, 145],
      ['p', 350, 505, 450, 220, 550, 200, 650, 505],
      ['e', 660, 250, 140, 55, 20]
    ],
    紅蘿蔔: [
      ['s', 300, 350, 700, 350, 430, 880],
      [
        'p',
        420,
        350,
        300,
        150,
        470,
        280,
        500,
        100,
        550,
        290,
        700,
        160,
        580,
        350
      ],
      ['l', 350, 450, 460, 470],
      ['l', 560, 550, 620, 540],
      ['l', 400, 680, 460, 690]
    ],
    糖果: [
      ['r', 330, 350, 340, 300],
      ['s', 330, 400, 150, 300, 150, 700, 330, 600],
      ['s', 670, 400, 850, 300, 850, 700, 670, 600],
      ['l', 430, 350, 430, 650],
      ['l', 560, 350, 560, 650]
    ],
    冰棒: [
      ['a', 500, 330, 200, 180, 360],
      ['p', 300, 330, 300, 650, 700, 650, 700, 330],
      ['p', 450, 650, 450, 850, 550, 850, 550, 650],
      ['l', 430, 320, 430, 570],
      ['l', 570, 320, 570, 570]
    ],
    禮物: [
      ['r', 200, 400, 600, 400],
      ['r', 170, 320, 660, 100],
      ['r', 455, 320, 90, 480],
      ['e', 390, 240, 115, 65, 25],
      ['e', 610, 240, 115, 65, -25]
    ],
    信封: [
      ['r', 150, 270, 700, 460],
      ['p', 150, 270, 500, 560, 850, 270],
      ['l', 150, 730, 390, 500],
      ['l', 850, 730, 610, 500]
    ],
    梯子: [
      ['l', 300, 130, 300, 870],
      ['l', 700, 130, 700, 870],
      ['l', 300, 250, 700, 250],
      ['l', 300, 410, 700, 410],
      ['l', 300, 570, 700, 570],
      ['l', 300, 730, 700, 730]
    ],
    磁鐵: [
      [
        'p',
        250,
        220,
        250,
        560,
        300,
        700,
        400,
        780,
        600,
        780,
        700,
        700,
        750,
        560,
        750,
        220
      ],
      ['p', 400, 220, 400, 550, 430, 610, 570, 610, 600, 550, 600, 220],
      ['l', 250, 220, 400, 220],
      ['l', 600, 220, 750, 220],
      ['l', 250, 370, 400, 370],
      ['l', 600, 370, 750, 370]
    ],
    天平: [
      ['s', 430, 820, 570, 820, 500, 700],
      ['l', 500, 700, 500, 200],
      ['l', 200, 300, 800, 300],
      ['p', 200, 300, 100, 570, 300, 570, 200, 300],
      ['a', 200, 570, 100, 0, 180],
      ['p', 800, 300, 700, 570, 900, 570, 800, 300],
      ['a', 800, 570, 100, 0, 180]
    ],
    土星: [
      ['c', 500, 500, 190],
      ['e', 500, 500, 370, 80, -25]
    ],
    北斗七星: [
      [
        'p',
        150,
        200,
        320,
        300,
        450,
        450,
        650,
        400,
        800,
        600,
        650,
        750,
        450,
        700,
        650,
        400
      ],
      ['d', 150, 200],
      ['d', 320, 300],
      ['d', 450, 450],
      ['d', 650, 400],
      ['d', 800, 600],
      ['d', 650, 750],
      ['d', 450, 700]
    ],
    冰塊: [
      ['s', 250, 350, 500, 200, 780, 350, 530, 510],
      ['p', 250, 350, 250, 690, 530, 850, 780, 690, 780, 350],
      ['l', 530, 510, 530, 850],
      ['l', 320, 450, 430, 510]
    ],
    山洞: [
      ['p', 100, 800, 240, 350, 450, 180, 700, 320, 900, 800],
      ['ae', 500, 800, 220, 340, 180, 360],
      ['l', 100, 800, 900, 800]
    ],
    嘴巴: [
      [
        'p',
        150,
        500,
        330,
        400,
        430,
        440,
        500,
        400,
        570,
        440,
        670,
        400,
        850,
        500
      ],
      ['p', 150, 500, 350, 680, 650, 680, 850, 500],
      ['p', 150, 500, 400, 540, 600, 540, 850, 500]
    ],
    鼻子: [
      [
        'p',
        480,
        200,
        400,
        570,
        320,
        650,
        400,
        720,
        500,
        680,
        600,
        720,
        680,
        650,
        600,
        570
      ],
      ['a', 420, 660, 35, 180, 360],
      ['a', 580, 660, 35, 180, 360]
    ],
    牙齒: [
      [
        'p',
        500,
        250,
        350,
        200,
        240,
        280,
        220,
        420,
        300,
        750,
        380,
        820,
        450,
        600,
        550,
        600,
        620,
        820,
        700,
        750,
        780,
        420,
        760,
        280,
        650,
        200,
        500,
        250
      ]
    ],
    褲子: [
      [
        'p',
        280,
        200,
        720,
        200,
        780,
        830,
        560,
        830,
        500,
        460,
        440,
        830,
        220,
        830,
        280,
        200
      ],
      ['l', 280, 300, 720, 300],
      ['l', 500, 300, 500, 460]
    ],
    裙子: [
      ['r', 350, 200, 300, 110],
      ['s', 350, 310, 650, 310, 850, 800, 150, 800],
      ['l', 410, 350, 330, 750],
      ['l', 590, 350, 670, 750]
    ],
    領帶: [
      ['s', 400, 180, 600, 180, 550, 300, 450, 300],
      ['s', 450, 300, 550, 300, 640, 730, 500, 870, 360, 730]
    ],
    圍巾: [
      ['r', 250, 250, 500, 150],
      ['r', 300, 400, 150, 420],
      ['r', 550, 400, 150, 300],
      ['l', 300, 750, 450, 750],
      ['l', 550, 630, 700, 630]
    ],
    手錶: [
      ['r', 390, 100, 220, 200],
      ['c', 500, 500, 220],
      ['r', 390, 700, 220, 200],
      ['p', 500, 350, 500, 500, 610, 540]
    ],
    紅綠燈: [
      ['r', 330, 100, 340, 650],
      ['c', 500, 230, 75],
      ['c', 500, 425, 75],
      ['c', 500, 620, 75],
      ['l', 500, 750, 500, 930]
    ],
    斑馬線: [
      ['p', 100, 200, 900, 200],
      ['p', 100, 800, 900, 800],
      ['r', 160, 300, 90, 400],
      ['r', 350, 300, 90, 400],
      ['r', 540, 300, 90, 400],
      ['r', 730, 300, 90, 400]
    ],
    彈簧: [
      [
        'p',
        250,
        200,
        700,
        200,
        300,
        300,
        700,
        400,
        300,
        500,
        700,
        600,
        300,
        700,
        700,
        800,
        250,
        800
      ]
    ],
    三角鐵: [
      ['p', 450, 200, 150, 750, 800, 750, 500, 200],
      ['l', 500, 200, 500, 100],
      ['l', 650, 450, 900, 600]
    ]
  };

  function pointsOf(op) {
    // Share the existing shape converter without changing the game's recipes.
    return Words.pointsOf(op)
      .filter(function (p) {
        return p.length >= 4;
      })
      .map(function (p) {
        return { p: p };
      });
  }

  // Rich items are realistic layered shapes: [fill, 'svg path', opts] or {f, d, ...opts}.
  //   fill: '#rrggbb' | 'none'   opts: s outline colour|'none', w outline width, a opacity,
  //   g gradient ('r' radial default, 'l' vertical, 'c' cylinder, 'n' flat),
  //   b:1 base shape other items can be clipped to, i:1 clipped to the latest base,
  //   bl blur radius (soft shadow / highlight).
  // A plain object without d (first entry only) is scene meta: {bg, ground:0, shadow:0}.
  function isRich(item) {
    if (Array.isArray(item)) return typeof item[0] === 'string' && /^(#|none$)/.test(item[0]);
    return !!item && typeof item === 'object' && typeof item.d === 'string';
  }

  function richStroke(item) {
    var o = Array.isArray(item) ? Object.assign({ f: item[0], d: item[1] }, item[2] || {}) : item;
    var parsed = Path.parse(o.d);
    return {
      p: parsed.p, d: parsed.d, f: o.f || 'none', s: o.s, w: o.w, a: o.a,
      g: o.g, b: o.b, i: o.i, bl: o.bl
    };
  }

  // A composed op is a game shape op, {c: paletteKey, o: op} to colour that part, or a rich item.
  function flatten(list) {
    return [].concat.apply([], list.map(function (item) {
      return Array.isArray(item) && Array.isArray(item[0]) ? flatten(item) : [item];
    }));
  }

  function composed(ops) {
    var meta = null;
    ops = flatten(ops);
    var out = [].concat.apply(
      [],
      ops.map(function (op) {
        if (isRich(op)) return [richStroke(op)];
        if (!Array.isArray(op) && !op.o) { meta = op; return []; }
        var key = Array.isArray(op) ? null : op.c;
        return pointsOf(key ? op.o : op).map(function (stroke) {
          return key ? { p: stroke.p, c: key } : stroke;
        });
      })
    );
    if (meta) out.meta = meta;
    return out;
  }

  /* ---------- Lazy loading of the hand-composed recipe blocks (40 topics per file) ---------- */
  var BLOCK = 40;
  var indexOf = null;
  function blockOf(id) {
    if (!indexOf) {
      indexOf = {};
      Words.all().forEach(function (w, i) { indexOf[w.id] = i; });
    }
    return indexOf[id] === undefined ? -1 : Math.floor(indexOf[id] / BLOCK) * BLOCK;
  }
  function blockFile(id) {
    var b = blockOf(id);
    return b < 0 ? null : 'js/refs/r' + ('000' + b).slice(-4) + '.js';
  }
  var pending = {};
  /** Browser only: load the recipe block holding `id`, then call back (always called once). */
  function ensure(id, done) {
    var file = blockFile(id);
    if (!file || (Recipes && Recipes[id]) || typeof document === 'undefined') return done();
    if (pending[file]) { pending[file].push(done); return; }
    pending[file] = [done];
    var el = document.createElement('script');
    var finish = function () {
      var list = pending[file];
      pending[file] = null;
      list.forEach(function (fn) { fn(); });
    };
    el.src = file;
    el.onload = finish;
    el.onerror = finish;
    document.head.appendChild(el);
  }

  function get(id) {
    var word = Words.byId(id);
    if (!word) return null;
    if (Recipes && Recipes[id]) return composed(Recipes[id]);
    if (recipes[word.text])
      return [].concat.apply([], recipes[word.text].map(pointsOf));
    var strokes = Words.strokesOf(id);
    // Expanded recipes end with a small topic-bank marker, not part of the drawing.
    if (id.indexOf('w-') === 0 && strokes.length > 3) return strokes.slice(0, -3);
    return strokes;
  }

  /* ---------- Realistic rendering: colour, light and depth over the same strokes ---------- */

  // Four related colours per palette: body, secondary, accent, highlight tone.
  var PALETTES = {
    animal: ['#C98F5B', '#F0D2A8', '#8A5A3B', '#F6A97A'],
    food: ['#E8A04C', '#F6D56E', '#D9503F', '#8DBB5B'],
    home: ['#8FA9C7', '#E7C98B', '#B6BCC6', '#D98C7A'],
    vehicle: ['#D9544D', '#9DB7D1', '#5A6270', '#F1C94B'],
    nature: ['#6FB35E', '#A6D6F0', '#C99A6B', '#F3D669'],
    fun: ['#4F9BD9', '#F2B94B', '#E5604F', '#7BC47F'],
    emotion: ['#F28FA8', '#FFD36B', '#9C8CE0', '#F7B8C8'],
    idiom: ['#C89B5A', '#7FA68B', '#B85C50', '#EAD9AE'],
    phenomenon: ['#7FA8D6', '#C9D6E6', '#F2C94C', '#5C6F94'],
    place: ['#C98C6B', '#9DB7D1', '#8DB27A', '#E9D7B0'],
    expression: ['#F5C26B', '#F28F7E', '#8E7CC3', '#FFE6B0'],
    job: ['#5B87C2', '#F0C79A', '#E5604F', '#F2D24B'],
    fantasy: ['#9B7FD6', '#F2A6D2', '#6FC3D9', '#F5D86B'],
    action: ['#F29F5C', '#6FB3D9', '#8CC678', '#E9768B'],
    star: ['#F2C14B', '#D96A8B', '#6C7FD1', '#F6E3A5'],
    movie: ['#B04A4A', '#3F4A63', '#E5B94B', '#CFC7B8'],
    trend: ['#4FA3B8', '#F28F5C', '#9B84D6', '#F2D36B'],
    history: ['#B58A58', '#8D6E63', '#D8C08F', '#6E8B74'],
    geography: ['#5AA469', '#5B9BD5', '#E2C27D', '#C27C5A'],
    civics: ['#5878A8', '#D5B25C', '#B8505A', '#BFC7D1'],
    physics: ['#4F8FD6', '#E55A4F', '#F2C94C', '#9AA6B5'],
    astro: ['#5C6BC0', '#F2C94C', '#9575CD', '#7FB3E0'],
    music: ['#B05AB0', '#F2B94B', '#4FA3D9', '#E5604F'],
    people: ['#E3A57F', '#5B87C2', '#E5604F', '#F2D24B'],
    body: ['#F0B493', '#E07A7A', '#C9856A', '#F6CDB8'],
    clothes: ['#5B87C2', '#E5748B', '#F2C14B', '#8E7CC3'],
    festival: ['#D9423E', '#F2B53B', '#E8745A', '#8E2E3A'],
    taiwan: ['#3FA796', '#F2A541', '#D9544D', '#F4DDA0'],
    // Subject colours override the category when the name says what it looks like.
    sun: ['#F5C842', '#F9E08A', '#F29B30', '#FFF0B8'],
    red: ['#D9423E', '#F27A6B', '#8E2E3A', '#F7B3A6'],
    green: ['#5FAE5A', '#A5D67F', '#3E8048', '#D3EBA8'],
    blue: ['#4F8FD6', '#9CC7EE', '#2F5E9E', '#D3E7F8'],
    ice: ['#A9D4EE', '#E4F2FA', '#6FA6CC', '#FFFFFF'],
    orange: ['#F28C38', '#F7B36B', '#D9622B', '#FBD9A8'],
    purple: ['#8E6BC9', '#B99AE0', '#5F4396', '#DCCBF2'],
    brown: ['#A06A42', '#C99A6B', '#6E4529', '#E2C29B'],
    dark: ['#4A4A55', '#7A7A88', '#26262E', '#B3B3C0'],
    gold: ['#F2C14B', '#F8DE8C', '#C99425', '#FFF2C4'],
    white: ['#F1EEE8', '#FFFFFF', '#CFC9BE', '#FAF8F4'],
    gray: ['#9AA0A8', '#C4C9CF', '#6B7078', '#E1E4E8'],
    silver: ['#B8C2CC', '#E3E9EF', '#7F8C99', '#FFFFFF'],
    pink: ['#F2A0B8', '#F9CBD8', '#D96A8B', '#FDE6EC'],
    skin: ['#F0BE9A', '#F8D8C0', '#D99A78', '#FBE7D8'],
    yellow: ['#F5D04A', '#FAE58C', '#D9A92A', '#FFF4C2'],
    teal: ['#3FA8A0', '#8FD3CC', '#26746E', '#CBEDE9'],
    sky: ['#7DBDEB', '#BFE0F6', '#4C8FC4', '#E6F3FC'],
    black: ['#33333B', '#5A5A66', '#15151A', '#8C8C99'],
    wood: ['#B07A4A', '#D2A574', '#7C512C', '#E8C9A0'],
    cream: ['#F4E3BC', '#FBF1D8', '#D9BF86', '#FFF8E8']
  };
  var SUBJECTS = [
    [/太陽|陽光|香蕉|檸檬|黃色|向日葵|玉米|蜂蜜|蛋黃/, 'sun'],
    [/月亮|星|金|皇冠|獎牌|獎盃|銅|寶藏/, 'gold'],
    [/雪|冰|雲|牛奶|白|霜/, 'ice'],
    [/紅蘿蔔|胡蘿蔔|橘|橙|南瓜|柿|火|辣椒|岩漿/, 'orange'],
    [/紅|蘋果|草莓|番茄|櫻桃|玫瑰|愛心|心|血|消防|蝦|蟹/, 'red'],
    [/綠|葉|草|樹|竹|菜|青蛙|西瓜|仙人掌|黃瓜|森林|蔬|瓜/, 'green'],
    [/藍|海|水|雨|魚|鯨|海豚|企鵝|游泳|河|湖|浪|潛/, 'blue'],
    [/紫|葡萄|茄子|薰衣草/, 'purple'],
    [/黑|烏鴉|熊貓|夜|蝙蝠|影/, 'dark'],
    [/巧克力|咖啡|木|熊|猴|土|泥|餅乾|可可|栗/, 'brown']
  ];

  function paletteKeyOf(id) {
    var word = Words.byId(id);
    if (!word) return 'nature';
    for (var i = 0; i < SUBJECTS.length; i++)
      if (SUBJECTS[i][0].test(word.text)) return SUBJECTS[i][1];
    return PALETTES[word.cat] ? word.cat : 'nature';
  }

  function mix(a, b, t) {
    var x = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); });
    var y = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return (
      '#' +
      [0, 1, 2]
        .map(function (i) {
          var v = Math.round(x[i] + (y[i] - x[i]) * t);
          return (v < 16 ? '0' : '') + v.toString(16);
        })
        .join('')
    );
  }

  function near(p, i, q, j) {
    return Math.abs(p[i] - q[j]) < 8 && Math.abs(p[i + 1] - q[j + 1]) < 8;
  }

  function measure(p) {
    var n = p.length;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var area = 0;
    for (var i = 0; i < n; i += 2) {
      minX = Math.min(minX, p[i]);
      maxX = Math.max(maxX, p[i]);
      minY = Math.min(minY, p[i + 1]);
      maxY = Math.max(maxY, p[i + 1]);
      var j = (i + 2) % n;
      area += p[i] * p[j + 1] - p[j] * p[i + 1];
    }
    var w = maxX - minX;
    var h = maxY - minY;
    var big = Math.max(w, h) > 70;
    area = Math.abs(area) / 2;
    return {
      p: p, minX: minX, minY: minY, maxX: maxX, maxY: maxY,
      cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, area: area,
      dot: !big,
      fill: big && Math.min(w, h) >= 14 && area > w * h * 0.12,
      tier: 0
    };
  }

  function isClosed(p) {
    var n = p.length;
    return n >= 8 && near(p, 0, p, n - 2);
  }

  // Regions to paint: closed strokes, plus two open arcs that join end to end into a loop.
  // idx is the last stroke needed, so a region only appears once all its strokes are drawn.
  function regions(strokes) {
    var out = [];
    strokes.forEach(function (stroke, i) {
      var p = stroke.p;
      if (isClosed(p)) {
        var r = measure(p);
        r.idx = i;
        out.push(r);
        return;
      }
      for (var k = i + 1; k < strokes.length; k++) {
        var q = strokes[k].p;
        if (isClosed(q)) continue;
        var end = p.length - 2;
        var qend = q.length - 2;
        var joined = null;
        if (near(p, end, q, 0) && near(q, qend, p, 0)) joined = p.concat(q.slice(2));
        else if (near(p, end, q, qend) && near(q, 0, p, 0)) {
          var rev = [];
          for (var m = qend; m >= 0; m -= 2) rev.push(q[m], q[m + 1]);
          joined = p.concat(rev.slice(2));
        }
        if (joined) {
          var loop = measure(joined);
          loop.idx = k;
          out.push(loop);
          break;
        }
      }
    });
    // Nested regions get a lighter or contrasting colour tier.
    out.forEach(function (a) {
      if (!a.fill) return;
      out.forEach(function (b) {
        if (b !== a && b.fill && b.area > a.area &&
            a.cx > b.minX && a.cx < b.maxX && a.cy > b.minY && a.cy < b.maxY) a.tier++;
      });
    });
    return out.filter(function (r) { return r.fill || r.dot; });
  }

  function gradients(key) {
    return PALETTES[key].map(function (color, i) {
      return (
        '<radialGradient id="g' + key + i + '" cx=".35" cy=".28" r=".85">' +
        '<stop offset="0" stop-color="' + mix(color, '#ffffff', 0.5) + '"/>' +
        '<stop offset=".5" stop-color="' + color + '"/>' +
        '<stop offset="1" stop-color="' + mix(color, '#2a1a30', 0.38) + '"/></radialGradient>'
      );
    }).join('');
  }

  function pointsAttr(p) {
    var out = [];
    for (var i = 0; i < p.length; i += 2) out.push(p[i] + ',' + p[i + 1]);
    return out.join(' ');
  }

  /* ---------- Rich renderer: layered shapes restricted to what the game's paint tools can make ---------- */
  var uidCounter = 0;
  // The in-game canvas offers exactly these colours and pen widths (rules.js COLORS / WIDTHS),
  // flat fills and lines only, so references are flattened to them: no gradient, blur or opacity.
  var PAPER = '#FFFDF8';
  var INK = '#4A3B55';
  var GAME_COLORS = ['#4A3B55', '#D2444F', '#F0913F', '#E7C263', '#5FBF95', '#3E8F6B',
    '#7FB4DA', '#4A6FA5', '#A48FDB', '#E88CAA', '#8B5E3C', '#FFFDF8'];
  var GAME_WIDTHS = [7, 16, 34, 64];

  function rgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  var snapCache = {};
  function snapColor(hex) {
    hex = hex.toLowerCase();
    if (snapCache[hex]) return snapCache[hex];
    var c = rgb(hex), best = GAME_COLORS[0], bd = Infinity;
    GAME_COLORS.forEach(function (g) {
      var q = rgb(g);
      var rm = (c[0] + q[0]) / 2;
      var dr = c[0] - q[0], dg = c[1] - q[1], db = c[2] - q[2];
      var d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
      if (d < bd) { bd = d; best = g; }
    });
    snapCache[hex] = best;
    return best;
  }
  function snapWidth(w) {
    if (w > 16) return w; // thick bars (limbs, trunks) are brush-filled shapes; keep their size
    var best = GAME_WIDTHS[0];
    GAME_WIDTHS.forEach(function (g) { if (Math.abs(g - w) < Math.abs(best - w)) best = g; });
    return best;
  }

  function renderRich(strokes, step) {
    var meta = strokes.meta || {};
    var uid = 'q' + (++uidCounter) + '-';
    var count = Math.ceil((strokes.length * Math.max(1, Math.min(3, step || 3))) / 3);
    var defs = {};
    var body = '';
    var baseId = null;
    var baseColor = PAPER;
    var clips = {};
    for (var n = 0; n < count; n++) {
      var st = strokes[n];
      var f = st.f || 'none';
      var hex = /^#[0-9a-fA-F]{6}$/.test(f) ? f.toLowerCase() : null;
      var fill = 'none';
      if (hex) {
        var col = hex;
        if (st.a != null && st.a < 1) col = mix(st.i ? baseColor : PAPER, hex, st.a);
        fill = snapColor(col);
      }
      var stroke = 'none', sw = 0;
      if (st.s === 'none') stroke = 'none';
      else if (!hex) {
        var lc = st.s && /^#[0-9a-fA-F]{6}$/.test(st.s) ? st.s : INK;
        if (st.a != null && st.a < 1) lc = mix(st.i ? baseColor : PAPER, lc, st.a);
        stroke = snapColor(lc);
        sw = snapWidth(st.w || 8);
      } else if (!st.i || st.s) {
        stroke = INK;
        sw = snapWidth(st.w && st.w > 10 ? st.w : 7);
      }
      var attrs = 'd="' + st.d + '" fill="' + fill + '"' +
        (stroke !== 'none' ? ' stroke="' + stroke + '" stroke-width="' + sw + '"' : '');
      if (st.b) { baseId = uid + 'p' + n; attrs += ' id="' + baseId + '"'; baseColor = fill === 'none' ? baseColor : fill; }
      var piece = '<path ' + attrs + '/>';
      if (st.i && baseId) {
        if (!clips[baseId]) {
          clips[baseId] = uid + 'c' + n;
          defs[clips[baseId]] = '<clipPath id="' + clips[baseId] + '"><use href="#' + baseId + '"/></clipPath>';
        }
        piece = '<g clip-path="url(#' + clips[baseId] + ')">' + piece + '</g>';
      }
      body += piece;
    }
    var bg = meta.bg;
    var bgFill = PAPER;
    if (bg) bgFill = snapColor(Array.isArray(bg) ? bg[0] : bg);
    return (
      '<svg viewBox="-40 -40 1080 1080" aria-hidden="true" focusable="false">' +
      '<defs>' + Object.keys(defs).map(function (k) { return defs[k]; }).join('') + '</defs>' +
      '<rect x="-40" y="-40" width="1080" height="1080" rx="64" fill="' + bgFill + '"/>' +
      '<g stroke-linecap="round" stroke-linejoin="round">' + body + '</g></svg>'
    );
  }

  /** Strokes may carry `c` (palette key) so composed scenes can colour each object. */
  function render(strokes, step, fallbackKey) {
    if (!strokes || !strokes.length) return '';
    if (strokes[0].d) return renderRich(strokes, step, fallbackKey);
    var count = Math.ceil(
      (strokes.length * Math.max(1, Math.min(3, step || 3))) / 3
    );
    var used = {};
    var keyOf = function (i) {
      var k = strokes[i].c || fallbackKey;
      return PALETTES[k] ? k : 'nature';
    };
    var minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    var lines = '';
    for (var s = 0; s < count; s++) {
      var p = strokes[s].p;
      var path = 'M' + p[0] + ' ' + p[1];
      for (var q = 0; q < p.length; q += 2) {
        minX = Math.min(minX, p[q]);
        maxX = Math.max(maxX, p[q]);
        maxY = Math.max(maxY, p[q + 1]);
        if (q) path += 'L' + p[q] + ' ' + p[q + 1];
      }
      used[keyOf(s)] = 1;
      lines += '<path d="' + path + '" stroke="' +
        mix(PALETTES[keyOf(s)][0], '#1d1224', 0.7) + '"' +
        (isClosed(p) ? '' : ' stroke-width="11"') + '/>';
    }
    var order = regions(strokes).filter(function (r) { return r.idx < count; });
    order.sort(function (a, b) { return b.area - a.area; });

    var first = keyOf(0);
    var tint = PALETTES[first][0];
    var body = '';
    var glints = '';
    order.forEach(function (r) {
      var k = keyOf(r.idx);
      var pts = pointsAttr(r.p);
      if (r.dot) {
        body += '<polygon points="' + pts + '" fill="' + mix(PALETTES[k][2], '#120a18', 0.72) + '"/>';
        var gr = Math.max(4, (r.maxX - r.minX) * 0.14);
        glints += '<circle cx="' + Math.round(r.cx - gr * 1.2) + '" cy="' +
          Math.round(r.cy - gr * 1.4) + '" r="' + Math.round(gr) + '" fill="#fff" opacity=".85"/>';
      } else {
        body += '<polygon points="' + pts + '" fill="url(#g' + k + (r.tier % 4) + ')"/>';
      }
    });
    return (
      '<svg viewBox="-40 -40 1080 1080" aria-hidden="true" focusable="false">' +
      '<defs>' +
      Object.keys(used).map(gradients).join('') +
      '<linearGradient id="bg' + first + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + mix(tint, '#ffffff', 0.93) + '"/>' +
      '<stop offset="1" stop-color="' + mix(tint, '#ffffff', 0.78) + '"/></linearGradient>' +
      '<radialGradient id="gr' + first + '"><stop offset="0" stop-color="#2a1a30" stop-opacity=".3"/>' +
      '<stop offset="1" stop-color="#2a1a30" stop-opacity="0"/></radialGradient>' +
      '<filter id="sh' + first + '" x="-10%" y="-10%" width="120%" height="125%">' +
      '<feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#2a1a30" flood-opacity=".25"/></filter>' +
      '</defs>' +
      '<rect x="-40" y="-40" width="1080" height="1080" rx="64" fill="url(#bg' + first + ')"/>' +
      '<ellipse cx="' + Math.round((minX + maxX) / 2) + '" cy="' + Math.round(Math.min(985, maxY + 22)) +
      '" rx="' + Math.round(Math.max(120, (maxX - minX) * 0.5)) + '" ry="34" fill="url(#gr' + first + ')"/>' +
      '<g filter="url(#sh' + first + ')">' + body + '</g>' + glints +
      '<g fill="none" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">' +
      lines + '</g></svg>'
    );
  }

  function svg(id, step) {
    var strokes = get(id);
    if (!strokes) return '';
    return render(strokes, step, paletteKeyOf(id));
  }

  return {
    get: get,
    svg: svg,
    render: render,
    paletteKeyOf: paletteKeyOf,
    paletteKeys: function () { return Object.keys(PALETTES); },
    ensure: ensure,
    blockFile: blockFile,
    hasRecipe: function (id) { return !!(Recipes && Recipes[id]); }
  };
});
