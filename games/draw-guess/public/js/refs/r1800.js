(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;

  function place(layers, x, y, s, rot) {
    return K.T(layers, {
      dx: x - 500,
      dy: y - 500,
      s: s,
      rot: rot || 0,
      cx: 500,
      cy: 500,
    });
  }
  function line(d, col, w) {
    return ['none', d, { s: col, w: w }];
  }
  function note(x, y, s, col) {
    return [
      [
        'none',
        'M' +
          (x + 24 * s) +
          ' ' +
          (y - 4 * s) +
          'L' +
          (x + 24 * s) +
          ' ' +
          (y - 110 * s),
        { s: C.ink, w: 12 * s },
      ],
      [
        col,
        'M' +
          (x + 24 * s) +
          ' ' +
          (y - 110 * s) +
          'C' +
          (x + 60 * s) +
          ' ' +
          (y - 95 * s) +
          ' ' +
          (x + 75 * s) +
          ' ' +
          (y - 60 * s) +
          ' ' +
          (x + 60 * s) +
          ' ' +
          (y - 40 * s) +
          'C' +
          (x + 62 * s) +
          ' ' +
          (y - 70 * s) +
          ' ' +
          (x + 40 * s) +
          ' ' +
          (y - 80 * s) +
          ' ' +
          (x + 24 * s) +
          ' ' +
          (y - 75 * s) +
          'Z',
        { w: 5 },
      ],
      [col, 'E' + x + ' ' + y + ' ' + 28 * s + ' ' + 20 * s + ' -20', {}],
    ];
  }
  function star(x, y, r, col) {
    var pts = [],
      i,
      a,
      rr;
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 5;
      rr = i % 2 ? r * 0.45 : r;
      pts.push([
        Math.round(x + rr * Math.cos(a)),
        Math.round(y + rr * Math.sin(a)),
      ]);
    }
    return [
      [
        col,
        'M' +
          pts
            .map(function (p) {
              return p[0] + ' ' + p[1];
            })
            .join('L') +
          'Z',
        { w: 6 },
      ],
    ];
  }
  function heart(x, y, s, col) {
    return [
      [
        col,
        'M' +
          x +
          ' ' +
          (y + 40 * s) +
          'C' +
          (x - 70 * s) +
          ' ' +
          (y - 10 * s) +
          ' ' +
          (x - 40 * s) +
          ' ' +
          (y - 60 * s) +
          ' ' +
          x +
          ' ' +
          (y - 25 * s) +
          'C' +
          (x + 40 * s) +
          ' ' +
          (y - 60 * s) +
          ' ' +
          (x + 70 * s) +
          ' ' +
          (y - 10 * s) +
          ' ' +
          x +
          ' ' +
          (y + 40 * s) +
          'Z',
        { w: 6 },
      ],
    ];
  }
  function sp(str, f) {
    return str.replace(/(-?\d+\.?\d*)[ ,](-?\d+\.?\d*)/g, function (m, a, b) {
      var p = f(parseFloat(a), parseFloat(b));
      return Math.round(p[0] * 10) / 10 + ' ' + Math.round(p[1] * 10) / 10;
    });
  }

  /* generic front-view person; feet centre (x,y), s = scale, hs = head scale */
  function H(o) {
    var s = o.s || 1,
      hs = o.hs || 1,
      x = o.x,
      y = o.y;
    var skin = o.skin || C.yellow,
      hair = o.hair || C.brown,
      shirt = o.shirt || C.blue,
      pants = o.pants || C.ink,
      shoe = o.shoe || C.ink;
    var hcy = -500 - 65 * hs;
    function P(dx, dy) {
      return [x + dx * s, y + dy * s];
    }
    function HP(str) {
      return sp(str, function (a, b) {
        return [x + a * hs * s, y + (hcy + b * hs) * s];
      });
    }
    function PP(str) {
      return sp(str, function (a, b) {
        return [x + a * s, y + b * s];
      });
    }
    function HE(cx, cy, rx, ry) {
      return (
        'E' +
        (x + cx * hs * s) +
        ' ' +
        (y + (hcy + cy * hs) * s) +
        ' ' +
        rx * hs * s +
        ' ' +
        ry * hs * s
      );
    }
    function HR(rx, ry, w, h, r) {
      return (
        'R' +
        (x + rx * hs * s) +
        ' ' +
        (y + (hcy + ry * hs) * s) +
        ' ' +
        w * hs * s +
        ' ' +
        h * hs * s +
        ' ' +
        r * hs * s
      );
    }
    function PR(rx, ry, w, h, r) {
      return (
        'R' +
        (x + rx * s) +
        ' ' +
        (y + ry * s) +
        ' ' +
        w * s +
        ' ' +
        h * s +
        ' ' +
        r * s
      );
    }
    var L = [],
      hl,
      hr,
      a,
      b,
      fl,
      fr;
    var st = o.hairStyle || 'short';
    if (st === 'long') L.push([hair, HR(-74, -70, 148, 190, 50), {}]);
    if (st === 'bun')
      L.push([
        hair,
        'E' +
          x +
          ' ' +
          (y + (hcy - 78 * hs) * s) +
          ' ' +
          32 * hs * s +
          ' ' +
          32 * hs * s,
        {},
      ]);
    if (st === 'pig') {
      L.push([
        hair,
        'E' +
          (x - 76 * hs * s) +
          ' ' +
          (y + (hcy + 25 * hs) * s) +
          ' ' +
          28 * hs * s +
          ' ' +
          30 * hs * s,
        {},
      ]);
      L.push([
        hair,
        'E' +
          (x + 76 * hs * s) +
          ' ' +
          (y + (hcy + 25 * hs) * s) +
          ' ' +
          28 * hs * s +
          ' ' +
          30 * hs * s,
        {},
      ]);
    }
    if (st === 'pony')
      L = L.concat(
        K.tube(
          [P(50, hcy - 40 * hs), P(105, hcy + 40 * hs), P(95, hcy + 100 * hs)],
          30 * s,
          hair,
        ),
      );
    /* feet */
    fl = o.fl || [x - 36 * s, y - 20 * s];
    fr = o.fr || [x + 36 * s, y - 20 * s];
    var hipY = o.dress ? -215 : -250,
      hipL = P(-32, hipY),
      hipR = P(32, hipY);
    var legc = o.dress ? skin : pants;
    L = L.concat(K.tube([hipL, fl], 36 * s, legc));
    L = L.concat(K.tube([hipR, fr], 36 * s, legc));
    L.push([
      shoe,
      'E' +
        (fl[0] - 6 * s) +
        ' ' +
        (fl[1] + 4 * s) +
        ' ' +
        42 * s +
        ' ' +
        20 * s,
      {},
    ]);
    L.push([
      shoe,
      'E' +
        (fr[0] + 6 * s) +
        ' ' +
        (fr[1] + 4 * s) +
        ' ' +
        42 * s +
        ' ' +
        20 * s,
      {},
    ]);
    /* torso */
    if (o.dress)
      L.push([
        o.dress,
        PP(
          'M-58 -490 C-40 -505 40 -505 58 -490 L100 -190 C40 -170 -40 -170 -100 -190Z',
        ),
        {},
      ]);
    L.push([shirt, PR(-62, -495, 124, 270, 34), {}]);
    if (o.dress) {
      L.push([
        o.dress,
        PP('M-58 -400 L58 -400 L100 -190 C40 -170 -40 -170 -100 -190Z'),
        { s: 'none' },
      ]);
    }
    if (o.torsoExtra) L = L.concat(o.torsoExtra);
    /* arms */
    hl = o.hl || P(-92, -255);
    hr = o.hr || P(92, -255);
    a = P(-66, -462);
    b = P(66, -462);
    L = L.concat(K.tube([a, hl], 32 * s, o.sleeve || shirt));
    L = L.concat(K.tube([b, hr], 32 * s, o.sleeve || shirt));
    L.push([skin, 'E' + hl[0] + ' ' + hl[1] + ' ' + 20 * s + ' ' + 20 * s, {}]);
    L.push([skin, 'E' + hr[0] + ' ' + hr[1] + ' ' + 20 * s + ' ' + 20 * s, {}]);
    if (o.handExtra) L = L.concat(o.handExtra);
    /* head */
    L.push([
      skin,
      'E' + x + ' ' + (y + hcy * s) + ' ' + 60 * hs * s + ' ' + 64 * hs * s,
      {},
    ]);
    if (
      st === 'short' ||
      st === 'long' ||
      st === 'bun' ||
      st === 'pig' ||
      st === 'pony'
    )
      L.push([
        hair,
        HP('M-64 -6 C-72 -100 72 -100 64 -6 C45 -40 -45 -40 -64 -6Z'),
        {},
      ]);
    if (st === 'white')
      L.push([
        C.paper,
        HP('M-64 -6 C-72 -100 72 -100 64 -6 C45 -40 -45 -40 -64 -6Z'),
        {},
      ]);
    if (st === 'side') {
      L.push([
        C.paper,
        HP('M-62 -20 C-80 -30 -75 20 -60 25 C-58 5 -58 -5 -62 -20Z'),
        {},
      ]);
      L.push([
        C.paper,
        HP('M62 -20 C80 -30 75 20 60 25 C58 5 58 -5 62 -20Z'),
        {},
      ]);
    }
    /* face */
    L.push([C.ink, HE(-22, -2, 7, 10), { s: 'none' }]);
    L.push([C.ink, HE(22, -2, 7, 10), { s: 'none' }]);
    if (o.glasses) {
      L.push(['none', HE(-24, -2, 20, 18), { s: C.ink, w: 6 }]);
      L.push(['none', HE(24, -2, 20, 18), { s: C.ink, w: 6 }]);
      L.push(['none', HP('M-4 -2 L4 -2'), { s: C.ink, w: 6 }]);
    }
    if (o.face === 'open') L.push([C.red, HE(0, 30, 15, 14), { w: 6 }]);
    else L.push(['none', HP('M-20 22 Q0 42 20 22'), { s: C.ink, w: 7 }]);
    if (o.stache)
      L.push([
        o.stache,
        HP(
          'M-30 22 C-20 6 -5 10 0 16 C5 10 20 6 30 22 C15 20 5 22 0 22 C-5 22 -15 20 -30 22Z',
        ),
        { w: 5 },
      ]);
    if (o.beard)
      L.push([
        o.beard,
        HP('M-58 12 C-50 80 50 80 58 12 C40 40 -40 40 -58 12Z'),
        { w: 5 },
      ]);
    if (o.hat) L = L.concat(o.hat(x, y + hcy * s, hs * s));
    return L;
  }
  function mic(x, y, s) {
    return [
      [
        C.ink,
        'R' +
          (x - 11 * s) +
          ' ' +
          y +
          ' ' +
          22 * s +
          ' ' +
          80 * s +
          ' ' +
          8 * s,
        {},
      ],
      [C.paper, 'E' + x + ' ' + (y - 10 * s) + ' ' + 26 * s + ' ' + 28 * s, {}],
    ];
  }
  function micStand(x, y, h) {
    return [
      line('M' + x + ' ' + y + 'L' + x + ' ' + (y - h), C.ink, 14),
      [C.ink, 'E' + x + ' ' + y + ' ' + 60 + ' ' + 14, {}],
    ].concat(mic(x, y - h - 60, 1));
  }

  /* ---------- instruments (drawn in the 0-1000 box) ---------- */
  var bowL = function () {
    return [
      line('M700 200L800 880', C.ink, 20),
      line('M700 200L800 880', C.brown, 10),
      line('M706 200L806 880', C.paper, 4),
    ];
  };
  function violinBody(col, dark) {
    return [
      [
        col,
        'M500 430C400 430 360 480 380 540C395 580 400 590 385 620C340 680 360 800 500 800C640 800 660 680 615 620C600 590 605 580 620 540C640 480 600 430 500 430Z',
        { b: 1 },
      ],
      [
        dark,
        'M500 430C400 430 360 480 380 540C395 580 400 590 385 620C340 680 360 800 500 800Z',
        { i: 1, s: 'none' },
      ],
    ];
  }
  function violin(col, dark) {
    return [].concat(
      [
        [C.ink, 'R478 130 44 330 10', {}],
        [C.ink, 'E500 110 32 32', {}],
        [C.brown, 'R490 130 20 40', { s: 'none' }],
      ],
      violinBody(col, dark),
      [
        [C.ink, 'M440 600C430 560 450 560 450 600Z', { s: C.ink, w: 7 }],
        [C.ink, 'M560 600C570 560 550 560 550 600Z', { s: C.ink, w: 7 }],
        [C.ink, 'R450 710 100 14', {}],
        [C.ink, 'R470 770 60 20', {}],
        line('M492 300L492 725M508 300L508 725', C.paper, 4),
      ],
    );
  }
  function guitarA(col, dark) {
    return [].concat(
      [
        [C.ink, 'R470 170 60 330 10', {}],
        [C.brown, 'R462 90 76 100 14', {}],
        [C.paper, 'E480 120 8 8', {}],
        [C.paper, 'E520 120 8 8', {}],
      ],
      [
        [
          col,
          'M500 480C590 480 620 540 600 590C590 620 610 640 640 680C680 760 620 850 500 850C380 850 320 760 360 680C390 640 410 620 400 590C380 540 410 480 500 480Z',
          { b: 1 },
        ],
        [
          dark,
          'M500 850C380 850 320 760 360 680C390 640 410 620 400 590C430 600 470 600 500 640Z',
          { i: 1, s: 'none' },
        ],
        [C.ink, 'E500 700 48 48', { s: 'none' }],
        [C.brown, 'R440 790 120 22 8', {}],
        line('M490 180L490 790M510 180L510 790', C.paper, 4),
      ],
    );
  }
  function guitarE() {
    return [].concat(
      [
        [C.ink, 'R475 150 50 380 10', {}],
        [C.orange, 'R458 70 84 110 16', {}],
        [C.paper, 'E480 100 8 8', { s: 'none' }],
        [C.paper, 'E520 100 8 8', { s: 'none' }],
      ],
      [
        [
          C.red,
          'M500 500C430 430 360 470 380 560C395 620 340 650 340 740C340 830 430 870 500 870C570 870 660 830 660 740C660 650 605 620 620 560C640 470 570 430 500 500Z',
          { b: 1 },
        ],
        [
          C.brown,
          'M500 870C430 870 340 830 340 740C340 650 395 620 380 560C420 600 480 640 500 700Z',
          { i: 1, s: 'none' },
        ],
        [C.ink, 'R450 640 100 24 6', { s: 'none' }],
        [C.ink, 'R450 720 100 24 6', { s: 'none' }],
        [C.paper, 'R450 800 100 18 6', {}],
        line('M492 180L492 800M508 180L508 800', C.paper, 4),
      ],
    );
  }
  function bass() {
    return [].concat(
      [
        [C.ink, 'R478 80 44 340 10', {}],
        [C.ink, 'E500 66 34 34', {}],
      ],
      [
        [
          C.orange,
          'M500 380C580 380 610 440 590 500C580 530 600 550 630 600C680 680 640 850 500 850C360 850 320 680 370 600C400 550 420 530 410 500C390 440 420 380 500 380Z',
          { b: 1 },
        ],
        [
          C.brown,
          'M500 850C360 850 320 680 370 600C400 550 420 530 410 500C440 560 470 600 500 640Z',
          { i: 1, s: 'none' },
        ],
        [C.ink, 'R450 650 100 14', {}],
        [C.ink, 'R470 720 12 60', {}],
        [C.ink, 'R518 720 12 60', {}],
        [C.ink, 'R490 850 20 90', {}],
      ],
    );
  }
  function sax() {
    return [].concat(
      K.tube(
        [
          [300, 130],
          [350, 150],
        ],
        30,
        C.ink,
      ),
      K.tube(
        [
          [340, 150],
          [440, 190],
          [490, 270],
        ],
        36,
        C.yellow,
      ),
      K.tube(
        [
          [490, 270],
          [500, 400],
          [500, 640],
          [540, 760],
          [620, 800],
          [690, 740],
          [700, 650],
        ],
        80,
        C.yellow,
      ),
      [
        [C.yellow, 'E702 640 66 30 -15', {}],
        [C.ink, 'E702 640 44 16 -15', { s: 'none' }],
      ],
      [
        [C.orange, 'E500 340 17 17', {}],
        [C.orange, 'E500 430 17 17', {}],
        [C.orange, 'E500 520 17 17', {}],
        [C.orange, 'E510 610 17 17', {}],
      ],
    );
  }
  function trombone() {
    return [].concat(
      K.tube(
        [
          [220, 440],
          [640, 440],
        ],
        30,
        C.yellow,
      ),
      K.tube(
        [
          [220, 540],
          [640, 540],
        ],
        30,
        C.yellow,
      ),
      K.tube(
        [
          [220, 440],
          [170, 490],
          [220, 540],
        ],
        30,
        C.yellow,
      ),
      [
        [
          C.yellow,
          'M620 420C720 420 800 340 890 270L890 640C800 580 720 540 620 540Z',
          {},
        ],
        [
          C.orange,
          'M890 270L890 640C860 620 830 600 800 585C830 520 840 340 890 270Z',
          { s: 'none' },
        ],
        [C.ink, 'E890 455 30 185', { s: 'none' }],
        [C.yellow, 'R330 420 34 140 10', {}],
        [C.yellow, 'R520 420 34 140 10', {}],
      ],
      K.tube(
        [
          [200, 440],
          [170, 330],
        ],
        18,
        C.ink,
      ),
      [[C.ink, 'E168 322 22 12', {}]],
    );
  }
  function horn() {
    return [].concat(
      [
        ['none', 'E580 520 200 200', { s: C.ink, w: 66 }],
        ['none', 'E580 520 200 200', { s: C.yellow, w: 52 }],
        ['none', 'E580 520 110 110', { s: C.ink, w: 66 }],
        ['none', 'E580 520 110 110', { s: C.yellow, w: 52 }],
      ],
      K.tube(
        [
          [700, 320],
          [760, 230],
          [840, 180],
        ],
        30,
        C.yellow,
      ),
      [[C.ink, 'E850 175 22 22', {}]],
      [
        [C.yellow, 'E370 560 230 230', {}],
        [C.orange, 'E370 560 160 160', { s: 'none' }],
        [C.ink, 'E370 560 90 90', { s: 'none' }],
      ],
      [
        [C.orange, 'R600 280 26 80 8', {}],
        [C.orange, 'R640 270 26 80 8', {}],
        [C.orange, 'R680 260 26 80 8', {}],
      ],
    );
  }
  function oboe() {
    return [].concat(
      K.tube(
        [
          [500, 240],
          [500, 140],
        ],
        14,
        C.orange,
      ),
      [
        [C.ink, 'M450 780L390 890L610 890L550 780Z', {}],
        [C.ink, 'R470 240 60 560 10', {}],
        [C.sky, 'R455 330 90 18 8', {}],
        [C.sky, 'R455 600 90 18 8', {}],
        [C.paper, 'E500 420 16 16', {}],
        [C.paper, 'E500 480 16 16', {}],
        [C.paper, 'E500 540 16 16', {}],
        [C.paper, 'E500 680 16 16', {}],
      ],
    );
  }
  function snare(x, y, s, col) {
    return place(
      [
        [col, 'R300 480 400 200 16', {}],
        [C.paper, 'R300 480 400 36 0', { s: 'none' }],
        [C.paper, 'E500 480 200 50', {}],
        [C.sky, 'E500 480 150 30', { s: 'none' }],
        line(
          'M300 520L350 680M400 520L450 680M500 520L550 680M600 520L650 680',
          C.ink,
          7,
        ),
      ],
      x,
      y,
      s,
    );
  }
  function kit() {
    return [].concat([
      line('M170 380L170 880', C.ink, 12),
      [C.yellow, 'E170 380 120 24', {}],
      line('M850 320L850 880', C.ink, 12),
      [C.yellow, 'E850 320 130 26', {}],
      [C.red, 'E500 660 200 200', {}],
      [C.paper, 'E500 660 140 140', {}],
      [C.red, 'E500 660 40 40', {}],
      [C.blue, 'R320 380 150 120 14', {}],
      [C.paper, 'E395 380 75 22', {}],
      [C.blue, 'R530 380 150 120 14', {}],
      [C.paper, 'E605 380 75 22', {}],
      [C.sky, 'R680 600 140 100 12', {}],
      [C.paper, 'E750 600 70 20', {}],
      line('M300 280L380 360', C.brown, 16),
      line('M700 280L620 360', C.brown, 16),
    ]);
  }
  function stage(y) {
    return [[C.brown, 'R0 ' + y + ' 1000 ' + (1000 - y), { s: C.ink }]];
  }
  function star5(x, y, r) {
    return star(x, y, r, C.yellow);
  }

  var B = {};

  /* 1800 樂團 */
  B['w-music-29'] = [].concat(
    stage(850),
    place(kit(), 500, 540, 0.55),
    place(guitarE(), 220, 570, 0.65, -12),
    place(bass(), 790, 580, 0.6, 8),
    note(130, 220, 1, C.red),
    note(880, 230, 1, C.blue),
    star5(500, 160, 40),
  );
  /* 1801 搖滾 */
  B['w-music-30'] = [].concat(
    [
      [
        C.yellow,
        'M620 100L440 470L560 470L430 880L760 400L620 400L760 100Z',
        {},
      ],
    ],
    place(guitarE(), 420, 500, 0.95, -22),
    [[C.paper, 'E190 280 60 60', {}]].slice(0, 0),
    star5(180, 220, 45),
    star5(850, 700, 40),
  );
  /* 1802 饒舌 */
  B['w-music-31'] = [].concat(
    H({
      x: 500,
      y: 860,
      s: 1,
      hair: C.ink,
      shirt: C.red,
      pants: C.blue,
      shoe: C.paper,
      face: 'open',
      hl: [300, 380],
      hr: [585, 505],
      torsoExtra: [
        line('M440 395Q500 470 560 395', C.yellow, 12),
        [C.yellow, 'E500 450 20 20', {}],
      ],
      handExtra: [
        [C.ink, 'R575 460 22 70 8', {}],
        [C.paper, 'E586 452 26 28', {}],
      ],
      hat: function (x, y, k) {
        return [
          [
            C.blue,
            'M' +
              (x - 64 * k) +
              ' ' +
              (y - 8 * k) +
              'C' +
              (x - 70 * k) +
              ' ' +
              (y - 110 * k) +
              ' ' +
              (x + 70 * k) +
              ' ' +
              (y - 110 * k) +
              ' ' +
              (x + 64 * k) +
              ' ' +
              (y - 8 * k) +
              'Z',
            {},
          ],
          [
            C.blue,
            'R' +
              (x + 40 * k) +
              ' ' +
              (y - 30 * k) +
              ' ' +
              100 * k +
              ' ' +
              20 * k +
              ' ' +
              10 * k,
            {},
          ],
        ];
      },
    }),
    note(180, 300, 1, C.red),
    note(820, 270, 1, C.mint),
    note(850, 520, 0.8, C.violet),
  );
  /* 1803 爵士 */
  B['w-music-32'] = []
    .concat(
      [[C.violet, 'E500 900 330 40', { s: 'none' }]],
      sax(),
      note(180, 300, 1, C.red),
      note(850, 240, 1, C.blue),
      note(200, 700, 0.8, C.mint),
    )
    .slice(0);
  /* 1804 古典樂 */
  B['w-music-33'] = [].concat(
    [
      [C.brown, 'R120 470 12 380 0', {}],
      [C.brown, 'R60 860 130 20 6', {}],
      [C.paper, 'M20 330L230 310L240 470L30 480Z', {}],
      line('M50 360L210 345M50 395L215 380M52 430L220 415', C.ink, 6),
    ],
    H({
      x: 600,
      y: 880,
      s: 1,
      hair: C.ink,
      shirt: C.ink,
      pants: C.ink,
      sleeve: C.ink,
      shoe: C.ink,
      hl: [420, 360],
      hr: [790, 330],
      torsoExtra: [
        [C.paper, 'M500 410L545 410L522 520Z', {}],
        [C.red, 'M510 410L535 410L535 430L510 430Z', {}],
      ],
      handExtra: [
        line('M790 330L880 230', C.ink, 14),
        line('M790 330L880 230', C.paper, 6),
      ],
    }),
    star5(300, 150, 0).slice(0, 0),
    note(740, 170, 0.8, C.red),
  );
  /* 1805 搖籃曲 */
  B['w-music-34'] = [].concat(
    [
      [C.yellow, 'E260 200 90 90', {}],
      [C.paper, 'E300 180 80 80', { s: 'none' }],
    ],
    star5(520, 130, 36),
    star5(700, 220, 30),
    star5(430, 300, 26),
    [
      [C.brown, 'R170 520 660 40 10', {}],
      [C.brown, 'R170 460 40 420 10', {}],
      [C.brown, 'R790 460 40 420 10', {}],
      [C.yellow, 'E500 640 70 70', {}],
      [C.sky, 'R210 640 580 190 24', {}],
      [C.violet, 'R210 640 580 40 0', { s: 'none' }],
      [C.yellow, 'M450 585C470 560 530 560 550 585Z', { s: C.ink }],
      [C.ink, 'E478 635 6 6', { s: 'none' }],
      [C.ink, 'E522 635 6 6', { s: 'none' }],
      line('M470 665Q500 685 530 665', C.ink, 6),
      [C.sky, 'R170 560 660 40 10', { s: 'none' }].slice(0, 0),
    ].slice(0, -1),
    [
      line(
        'M280 540L280 880M360 540L360 880M640 540L640 880M720 540L720 880',
        C.brown,
        14,
      ),
      [C.brown, 'R160 860 680 40 10', {}],
    ],
    note(110, 420, 0.8, C.pink),
  );
  /* 1806 圓舞曲 */
  B['w-music-35'] = [].concat(
    H({
      x: 330,
      y: 880,
      s: 0.95,
      hair: C.ink,
      shirt: C.ink,
      pants: C.ink,
      sleeve: C.ink,
      hl: [200, 480],
      hr: [500, 430],
      torsoExtra: [[C.paper, 'M300 395L350 395L325 500Z', {}]],
    }),
    H({
      x: 680,
      y: 880,
      s: 0.95,
      hair: C.brown,
      hairStyle: 'bun',
      shirt: C.pink,
      dress: C.pink,
      hl: [500, 430],
      hr: [800, 480],
      face: 'smile',
    }),
    [[C.yellow, 'E500 430 22 22', {}]],
    note(500, 130, 1, C.red),
    note(130, 200, 0.8, C.blue),
    note(860, 200, 0.8, C.mint),
  );
  /* 1807 國歌 */
  B['w-music-36'] = [].concat(
    [
      [C.ink, 'R90 150 24 740 6', {}],
      [C.yellow, 'E102 140 28 28', {}],
      [C.red, 'R114 170 340 220 0', {}],
      [C.blue, 'R114 170 140 110 0', {}],
      [C.paper, 'E184 225 34 34', {}],
      [C.paper, 'R254 280 200 40 0', { s: 'none' }],
    ],
    H({
      x: 700,
      y: 900,
      s: 1,
      hair: C.ink,
      shirt: C.sky,
      pants: C.blue,
      face: 'open',
      hr: [710, 440],
      hl: [610, 450],
    }),
  );
  /* 1808 卡農 */
  var stv = '';
  var i, j, yy;
  var staffL = [];
  for (j = 0; j < 2; j++)
    for (i = 0; i < 5; i++) {
      yy = 330 + j * 270 + i * 28;
      staffL.push(line('M200 ' + yy + 'L800 ' + yy, C.ink, 5));
    }
  B['w-music-37'] = []
    .concat(
      [[C.paper, 'R130 190 740 620 24', {}]],
      staffL,
      [
        line('M200 320L200 430M200 590L200 700', C.ink, 7),
        line('M800 320L800 430M800 590L800 700', C.ink, 7),
      ],
      note(300, 400, 1, C.red),
      note(420, 372, 1, C.red),
      note(540, 344, 1, C.red),
      note(660, 372, 1, C.red),
      note(420, 670, 1, C.blue),
      note(540, 642, 1, C.blue),
      note(660, 614, 1, C.blue),
      note(780, 642, 1, C.blue),
    )
    .slice(0, 80);
  /* 1809 兒歌 */
  B['w-music-38'] = [].concat(
    H({
      x: 340,
      y: 880,
      s: 0.8,
      hs: 1.35,
      hair: C.brown,
      shirt: C.orange,
      pants: C.blue,
      face: 'open',
      hl: [290, 600],
      hr: [440, 620],
    }),
    H({
      x: 670,
      y: 880,
      s: 0.8,
      hs: 1.35,
      hair: C.ink,
      hairStyle: 'pig',
      shirt: C.pink,
      dress: C.pink,
      face: 'open',
      hl: [560, 620],
      hr: [720, 620],
    }),
    note(480, 220, 1, C.red),
    note(160, 260, 0.9, C.blue),
    note(820, 280, 0.9, C.mint),
    note(520, 100, 0.7, C.violet),
  );
  /* 1810 錄音室 */
  B['w-music-39'] = [].concat(
    [
      [C.red, 'R700 100 220 80 16', {}],
      [C.yellow, 'E760 140 22 22', {}],
      [C.yellow, 'E840 140 22 22', {}],
    ],
    [
      line('M500 560L500 860', C.ink, 16),
      [C.ink, 'E500 870 130 26', {}],
      ['none', 'M390 480C390 600 610 600 610 480', { s: C.ink, w: 14 }],
      [C.sky, 'E500 400 160 160', {}].slice(0, 0),
    ].slice(0, -1),
    [
      [C.sky, 'E500 380 170 170', {}],
      [C.paper, 'E500 380 140 140', { s: 'none' }].slice(0, 0),
    ].slice(0, 1),
    [
      [C.violet, 'R440 270 120 200 50', {}],
      line('M440 330L560 330M440 380L560 380M440 430L560 430', C.ink, 6),
    ],
    [
      ['none', 'M150 700C150 480 330 480 330 700', { s: C.ink, w: 40 }],
      ['none', 'M150 700C150 480 330 480 330 700', { s: C.blue, w: 24 }],
      [C.blue, 'R110 660 70 130 30', {}],
      [C.blue, 'R300 660 70 130 30', {}],
    ],
  );
  /* 1811 二重唱 */
  B['w-music-40'] = [].concat(
    H({
      x: 300,
      y: 880,
      s: 0.9,
      hair: C.brown,
      shirt: C.blue,
      pants: C.ink,
      face: 'open',
      hl: [210, 560],
      hr: [385, 440],
      handExtra: mic(385, 410, 0.9),
    }),
    H({
      x: 700,
      y: 880,
      s: 0.9,
      hair: C.ink,
      hairStyle: 'long',
      shirt: C.red,
      dress: C.red,
      face: 'open',
      hl: [615, 440],
      hr: [790, 560],
      handExtra: mic(615, 410, 0.9),
    }),
    heart(500, 300, 1.1, C.pink),
    note(500, 150, 0.8, C.violet),
  );
  /* 1812 獨奏 */
  B['w-music-41'] = [].concat(
    [[C.yellow, 'M440 60L560 60L800 880L200 880Z', { s: 'none' }]],
    stage(860),
    H({
      x: 500,
      y: 880,
      s: 0.95,
      hair: C.ink,
      shirt: C.ink,
      pants: C.ink,
      sleeve: C.ink,
      hl: [350, 395],
      hr: [650, 380],
      face: 'smile',
    }),
    place(violin(C.orange, C.brown), 520, 410, 0.42, -70),
    [line('M420 520L700 330', C.ink, 12), line('M420 520L700 330', C.brown, 5)],
    [
      [C.yellow, 'E350 395 20 20', {}],
      [C.yellow, 'E650 380 20 20', {}],
    ],
    note(170, 250, 0.9, C.red),
  );
  /* 1813 雙簧管 */
  B['w-music-42'] = [].concat(
    [[C.violet, 'E500 900 330 40', { s: 'none' }]],
    place(oboe(), 500, 500, 1.0, -35),
    note(180, 250, 1, C.red),
    note(840, 700, 0.9, C.blue),
  );
  /* 1814 伸縮號 */
  B['w-music-43'] = [].concat(
    trombone(),
    note(250, 750, 0.9, C.red),
    note(660, 760, 0.8, C.blue),
  );
  /* 1815 中提琴 */
  B['w-music-44'] = []
    .concat(
      place(violin(C.brown, C.ink), 450, 520, 1.1, 0),
      [[C.orange, 'E500 650 10 10', { s: 'none' }]].slice(0, 0),
      bowL(),
      note(180, 300, 1, C.violet),
    )
    .slice(0, 80);
  /* 1816 低音提琴 */
  B['w-music-45'] = [].concat(
    place(bass(), 420, 520, 1.0, 0),
    [
      line('M720 140L850 900', C.ink, 20),
      line('M720 140L850 900', C.brown, 10),
      line('M726 140L856 900', C.paper, 4),
    ],
    [[C.violet, 'E500 950 280 20', { s: 'none' }]],
  );
  /* 1817 法國號 */
  B['w-music-46'] = [].concat(horn(), note(840, 750, 0.9, C.red));
  /* 1818 交響樂團 */
  function mini(x, y, s, shirt, hair) {
    return [
      [
        shirt,
        'R' +
          (x - 50 * s) +
          ' ' +
          (y - 220 * s) +
          ' ' +
          100 * s +
          ' ' +
          220 * s +
          ' ' +
          30 * s,
        {},
      ],
      [
        C.yellow,
        'E' + x + ' ' + (y - 270 * s) + ' ' + 42 * s + ' ' + 46 * s,
        {},
      ],
      [
        hair,
        'M' +
          (x - 44 * s) +
          ' ' +
          (y - 268 * s) +
          'C' +
          (x - 48 * s) +
          ' ' +
          (y - 330 * s) +
          ' ' +
          (x + 48 * s) +
          ' ' +
          (y - 330 * s) +
          ' ' +
          (x + 44 * s) +
          ' ' +
          (y - 268 * s) +
          'C' +
          (x + 25 * s) +
          ' ' +
          (y - 295 * s) +
          ' ' +
          (x - 25 * s) +
          ' ' +
          (y - 295 * s) +
          ' ' +
          (x - 44 * s) +
          ' ' +
          (y - 268 * s) +
          'Z',
        {},
      ],
    ];
  }
  function violinMini(x, y, s) {
    return [
      [C.orange, 'E' + x + ' ' + y + ' ' + 30 * s + ' ' + 42 * s + ' 40', {}],
      line(
        'M' + x + ' ' + y + 'L' + (x - 70 * s) + ' ' + (y - 70 * s),
        C.ink,
        10,
      ),
    ];
  }
  var orch = [];
  for (i = 0; i < 4; i++) {
    orch = orch.concat(mini(220 + i * 180, 480, 0.8, C.ink, C.brown));
  }
  for (i = 0; i < 5; i++) {
    orch = orch.concat(
      mini(130 + i * 185, 700, 0.9, C.ink, i % 2 ? C.ink : C.brown),
      violinMini(150 + i * 185, 640, 1),
    );
  }
  B['w-music-47'] = []
    .concat(
      [[C.paper, 'E500 260 400 130', { s: 'none' }].slice(0, 0)].slice(0, 1),
      orch.slice(0, 12),
      orch.slice(12),
      H({
        x: 500,
        y: 1000,
        s: 0.5,
        hair: C.ink,
        shirt: C.ink,
        pants: C.ink,
        sleeve: C.ink,
        hl: [440, 790],
        hr: [560, 770],
        handExtra: [line('M560 770L620 700', C.paper, 8)],
      }),
      note(150, 200, 0.8, C.red),
      note(850, 200, 0.8, C.blue),
    )
    .slice(0, 85);
  /* 1819 音樂會 */
  var crowd = [];
  for (i = 0; i < 6; i++) {
    crowd = crowd.concat(
      [[C.ink, 'E' + (90 + i * 165) + ' 930 80 70', {}]],
      [[C.ink, 'E' + (90 + i * 165) + ' 820 45 50', {}]],
    );
  }
  B['w-music-48'] = []
    .concat(
      [
        [C.yellow, 'M60 40L180 40L440 520L300 520Z', { s: 'none' }],
        [C.sky, 'M940 40L820 40L560 520L700 520Z', { s: 'none' }],
      ],
      stage(560).slice(0, 0),
      [[C.brown, 'R200 560 600 60 8', {}]],
      H({
        x: 500,
        y: 560,
        s: 0.55,
        hair: C.brown,
        shirt: C.red,
        pants: C.ink,
        face: 'open',
        hr: [540, 345],
        handExtra: mic(540, 320, 0.5),
      }),
      crowd,
      [
        line('M120 800L90 650', C.ink, 26),
        line('M450 800L470 640', C.ink, 26),
        line('M780 800L810 650', C.ink, 26),
        [C.red, 'E90 640 14 24', {}],
        [C.mint, 'E470 630 14 24', {}],
        [C.yellow, 'E810 640 14 24', {}],
      ],
      star5(500, 100, 40),
    )
    .slice(0, 88);
  /* 1820 流行歌 */
  B['w-music-49'] = [].concat(
    H({
      x: 500,
      y: 880,
      s: 1,
      hair: C.brown,
      hairStyle: 'pony',
      shirt: C.pink,
      dress: C.pink,
      face: 'open',
      hl: [330, 380],
      hr: [590, 500],
      handExtra: mic(585, 450, 0.9),
    }),
    heart(200, 240, 1, C.red),
    heart(820, 330, 0.8, C.pink),
    star5(800, 160, 40),
    note(170, 520, 1, C.violet),
    note(840, 560, 0.9, C.blue),
  );
  /* 1821 進行曲 */
  B['w-music-50'] = [].concat(
    H({
      x: 480,
      y: 880,
      s: 1,
      hair: C.ink,
      shirt: C.red,
      pants: C.blue,
      shoe: C.ink,
      face: 'smile',
      fl: [400, 860],
      fr: [560, 740],
      hl: [345, 450],
      hr: [610, 450],
      torsoExtra: [
        line('M440 400L540 600', C.yellow, 12),
        [C.yellow, 'E460 440 12 12', {}],
        [C.yellow, 'E480 490 12 12', {}],
      ],
      handExtra: [
        line('M345 450L300 380', C.paper, 12),
        line('M610 450L670 380', C.paper, 12),
      ],
      hat: function (x, y, k) {
        return [
          [
            C.paper,
            'R' +
              (x - 8 * k) +
              ' ' +
              (y - 210 * k) +
              ' ' +
              16 * k +
              ' ' +
              60 * k +
              ' ' +
              8 * k,
            {},
          ],
          [
            C.red,
            'R' +
              (x - 50 * k) +
              ' ' +
              (y - 100 * k) +
              ' ' +
              100 * k +
              ' ' +
              85 * k +
              ' ' +
              12 * k,
            {},
          ],
          [
            C.ink,
            'R' +
              (x - 65 * k) +
              ' ' +
              (y - 30 * k) +
              ' ' +
              130 * k +
              ' ' +
              18 * k +
              ' ' +
              8 * k,
            {},
          ],
        ];
      },
    }),
    [
      [C.red, 'R380 560 200 130 22', {}],
      [C.paper, 'R380 560 200 30 0', { s: 'none' }],
      [C.paper, 'E480 560 100 28', {}],
      line('M400 600L440 680M480 610L480 690M560 600L520 680', C.ink, 7),
    ],
    note(150, 250, 0.9, C.blue),
    note(860, 250, 0.9, C.mint),
  );
  /* 1822 生日快樂歌 */
  B['w-music-51'] = [].concat(
    [[C.paper, 'E500 860 380 40', { s: C.ink }]],
    [
      [C.pink, 'R230 600 540 240 30', {}],
      [C.paper, 'R230 600 540 60 0', { s: 'none' }],
      [C.orange, 'R320 430 360 180 30', {}],
      [C.paper, 'R320 430 360 40 0', { s: 'none' }],
      [C.red, 'E390 600 28 28', {}],
      [C.red, 'E500 610 28 28', {}],
      [C.red, 'E610 600 28 28', {}],
      [C.sky, 'R385 300 30 130 6', {}],
      [C.yellow, 'R485 300 30 130 6', {}],
      [C.mint, 'R585 300 30 130 6', {}],
      [
        C.orange,
        'M400 300C370 260 390 220 400 190C420 230 430 260 400 300Z',
        {},
      ],
      [
        C.orange,
        'M500 300C470 260 490 220 500 190C520 230 530 260 500 300Z',
        {},
      ],
      [
        C.orange,
        'M600 300C570 260 590 220 600 190C620 230 630 260 600 300Z',
        {},
      ],
    ],
    note(130, 450, 0.9, C.red),
    note(850, 450, 0.9, C.blue),
    heart(170, 180, 0.8, C.pink),
    star5(840, 180, 38),
  );
  /* 1823 電子音樂 */
  var bars = [],
    hh = [180, 290, 220, 340, 250, 300, 160];
  var bc = [C.mint, C.sky, C.pink, C.yellow, C.violet, C.mint, C.orange];
  for (i = 0; i < 7; i++)
    bars.push([
      bc[i],
      'R' + (130 + i * 110) + ' ' + (480 - hh[i]) + ' 80 ' + hh[i] + ' 8',
      {},
    ]);
  B['w-music-52'] = [].concat(
    bars,
    [
      [C.blue, 'R90 500 820 360 24', {}],
      [C.ink, 'E300 680 140 140', {}],
      [C.violet, 'E300 680 90 90', { s: 'none' }],
      [C.red, 'E300 680 40 40', { s: 'none' }],
      [C.paper, 'E300 680 8 8', { s: 'none' }],
      [C.ink, 'E700 680 140 140', {}],
      [C.violet, 'E700 680 90 90', { s: 'none' }],
      [C.red, 'E700 680 40 40', { s: 'none' }],
      [C.paper, 'E700 680 8 8', { s: 'none' }],
      [C.sky, 'R440 540 120 280 14', {}],
      [C.red, 'E480 600 16 16', {}],
      [C.yellow, 'E520 600 16 16', {}],
      line('M470 700L470 780M530 700L530 760', C.ink, 12),
      [C.paper, 'R455 700 30 16 4', {}].slice(0, 0),
    ].slice(0, 12),
  );
  /* 1824 街頭藝人 */
  B['w-music-53'] = [].concat(
    [
      [C.sky, 'R0 880 1000 120', { s: C.ink }],
      line('M0 930L1000 930', C.ink, 5),
    ].slice(0, 2),
    H({
      x: 400,
      y: 880,
      s: 0.95,
      hair: C.brown,
      shirt: C.green,
      pants: C.brown,
      hl: [260, 440],
      hr: [470, 520],
      face: 'smile',
      hat: function (x, y, k) {
        return [
          [
            C.red,
            'M' +
              (x - 64 * k) +
              ' ' +
              (y - 14 * k) +
              'C' +
              (x - 70 * k) +
              ' ' +
              (y - 100 * k) +
              ' ' +
              (x + 70 * k) +
              ' ' +
              (y - 100 * k) +
              ' ' +
              (x + 64 * k) +
              ' ' +
              (y - 14 * k) +
              'Z',
            {},
          ],
        ];
      },
    }),
    place(guitarA(C.orange, C.brown), 380, 570, 0.55, -65),
    [
      [C.yellow, 'E260 440 20 20', {}],
      [C.yellow, 'E470 520 20 20', {}],
    ],
    [
      [C.violet, 'R640 780 280 100 12', {}],
      [C.ink, 'R660 800 240 70 8', {}],
      [C.yellow, 'E720 830 24 14', {}],
      [C.yellow, 'E790 820 24 14', {}],
      [C.yellow, 'E850 835 24 14', {}],
    ],
    note(780, 500, 0.9, C.red),
    note(850, 330, 0.8, C.blue),
  );
  /* 1825 打擊樂 */
  B['w-music-54'] = [].concat(
    [
      [C.orange, 'R120 560 220 220 30', {}],
      [C.paper, 'E230 560 110 30', {}],
      [C.red, 'R360 600 220 220 30', {}],
      [C.paper, 'E470 600 110 30', {}],
      [C.violet, 'R130 700 200 20 0', { s: 'none' }].slice(0, 0),
    ].slice(0, 4),
    [
      [C.yellow, 'E760 260 120 120', {}],
      [C.paper, 'E760 260 80 80', { s: 'none' }],
      [C.ink, 'E700 200 12 12', {}],
      [C.ink, 'E820 220 12 12', {}],
      [C.ink, 'E800 330 12 12', {}],
      [C.ink, 'E700 310 12 12', {}],
    ],
    [
      line('M270 340L270 500', C.ink, 16),
      [C.red, 'E270 280 70 70', {}],
      line('M470 320L470 520', C.ink, 16),
      [C.blue, 'E470 260 70 70', {}],
    ],
    [
      ['none', 'M600 480L760 480L680 640Z', { s: C.sky, w: 16 }],
      line('M600 480L760 480L680 640Z', C.ink, 4).slice(0, 0),
    ].slice(0, 1),
    [line('M240 780L260 560', C.brown, 16)].slice(0, 0),
    note(760, 780, 1, C.red),
    note(150, 330, 0.9, C.mint),
  );

  /* ---------- people ---------- */
  /* 1826 爸爸 */
  B['w-people-0'] = [].concat(
    H({
      x: 500,
      y: 920,
      s: 1.05,
      hair: C.ink,
      shirt: C.sky,
      pants: C.blue,
      face: 'smile',
      hr: [640, 690],
      torsoExtra: [[C.red, 'M485 400L515 400L525 430L500 560L475 430Z', {}]],
      handExtra: [
        [C.brown, 'R590 670 130 100 12', {}],
        ['none', 'M630 670Q655 630 680 670', { s: C.ink, w: 9 }],
      ].slice(0, 2),
    }),
  );
  /* 1827 媽媽 */
  B['w-people-1'] = [].concat(
    H({
      x: 500,
      y: 920,
      s: 1,
      hair: C.brown,
      hairStyle: 'long',
      shirt: C.red,
      dress: C.red,
      face: 'smile',
      hr: [640, 640],
      torsoExtra: [line('M450 400Q500 470 550 400', C.yellow, 10)],
      handExtra: [
        [C.brown, 'R590 640 110 90 22', {}],
        ['none', 'M610 640Q645 590 680 640', { s: C.ink, w: 9 }],
      ],
    }),
  );
  /* 1828 嬰兒 */
  B['w-people-2'] = [].concat(
    K.tube(
      [
        [400, 780],
        [340, 840],
      ],
      70,
      C.yellow,
    ),
    K.tube(
      [
        [600, 780],
        [660, 840],
      ],
      70,
      C.yellow,
    ),
    [
      [C.yellow, 'E320 850 48 34', {}],
      [C.yellow, 'E680 850 48 34', {}],
    ],
    [
      [C.pink, 'E500 650 140 160', {}],
      [
        C.paper,
        'M370 740C420 790 580 790 630 740L640 800C560 840 440 840 360 800Z',
        {},
      ],
    ],
    K.tube(
      [
        [390, 600],
        [330, 520],
      ],
      44,
      C.pink,
    ),
    K.tube(
      [
        [610, 600],
        [680, 640],
      ],
      44,
      C.pink,
    ),
    [
      [C.yellow, 'E325 510 28 28', {}],
      [C.yellow, 'E688 646 28 28', {}],
    ],
    [
      [C.sky, 'R690 560 56 130 12', {}],
      [C.orange, 'M705 560L730 560L722 520L713 520Z', {}],
      [C.paper, 'R690 600 56 20 0', { s: 'none' }],
    ],
    [
      [C.yellow, 'E500 380 150 140', {}],
      [C.yellow, 'E350 390 26 34', {}],
      [C.yellow, 'E650 390 26 34', {}],
      ['none', 'M500 255C470 215 520 190 540 215', { s: C.brown, w: 16 }],
      [C.ink, 'E440 390 12 18', { s: 'none' }],
      [C.ink, 'E560 390 12 18', { s: 'none' }],
      [C.pink, 'E400 430 20 14', { s: 'none' }],
      [C.pink, 'E600 430 20 14', { s: 'none' }],
      ['none', 'M470 440Q500 470 530 440', { s: C.ink, w: 7 }],
    ],
  );
  /* 1829 爺爺 */
  B['w-people-3'] = [].concat(
    H({
      x: 480,
      y: 920,
      s: 1,
      hair: C.paper,
      hairStyle: 'side',
      shirt: C.brown,
      pants: C.ink,
      face: 'smile',
      glasses: true,
      stache: C.paper,
      hr: [650, 610],
      hl: [385, 665],
      torsoExtra: [[C.paper, 'M455 400L505 400L480 560Z', {}]],
      handExtra: [
        ['none', 'M650 610L650 900', { s: C.ink, w: 22 }],
        ['none', 'M650 610L650 900', { s: C.orange, w: 10 }],
        ['none', 'M650 610C650 560 710 560 710 610', { s: C.ink, w: 22 }],
        ['none', 'M650 610C650 560 710 560 710 610', { s: C.orange, w: 10 }],
        [C.yellow, 'E650 612 20 20', {}],
      ],
    }),
  );
  /* 1830 奶奶 */
  B['w-people-4'] = [].concat(
    H({
      x: 480,
      y: 920,
      s: 1,
      hair: C.paper,
      hairStyle: 'bun',
      shirt: C.violet,
      dress: C.violet,
      face: 'smile',
      glasses: true,
      hr: [650, 640],
      torsoExtra: [
        [
          C.pink,
          'M425 405C460 450 540 450 575 405L560 470C520 500 480 500 440 470Z',
          {},
        ],
      ],
      handExtra: [
        [C.brown, 'R600 640 110 90 22', {}],
        ['none', 'M620 640Q655 590 690 640', { s: C.ink, w: 9 }],
      ],
    }),
  );
  /* 1831 哥哥 */
  B['w-people-5'] = [].concat(
    [[C.green, 'R360 420 280 280 30', {}]],
    H({
      x: 500,
      y: 920,
      s: 1.0,
      hair: C.ink,
      shirt: C.orange,
      pants: C.blue,
      shoe: C.paper,
      face: 'smile',
      hl: [350, 700],
      hr: [590, 630],
      torsoExtra: [line('M440 400L440 520M560 400L560 520', C.green, 12)],
      handExtra: [
        [C.orange, 'E630 610 55 55', { w: 7 }],
        line('M575 610L685 610M630 555L630 665', C.ink, 5),
      ],
      hat: function (x, y, k) {
        return [
          [
            C.red,
            'M' +
              (x - 64 * k) +
              ' ' +
              (y - 14 * k) +
              'C' +
              (x - 70 * k) +
              ' ' +
              (y - 110 * k) +
              ' ' +
              (x + 70 * k) +
              ' ' +
              (y - 110 * k) +
              ' ' +
              (x + 64 * k) +
              ' ' +
              (y - 14 * k) +
              'Z',
            {},
          ],
          [
            C.red,
            'R' +
              (x - 110 * k) +
              ' ' +
              (y - 30 * k) +
              ' ' +
              90 * k +
              ' ' +
              20 * k +
              ' ' +
              10 * k,
            {},
          ],
        ];
      },
    }),
  );
  /* 1832 姊姊 */
  B['w-people-6'] = [].concat(
    H({
      x: 480,
      y: 920,
      s: 1.0,
      hair: C.brown,
      hairStyle: 'pony',
      shirt: C.paper,
      dress: C.blue,
      face: 'smile',
      hl: [365, 720],
      hr: [600, 600],
      torsoExtra: [[C.red, 'M440 405L560 405L540 440L460 440Z', {}]],
      handExtra: [
        [C.red, 'R570 600 120 150 8', {}],
        [C.paper, 'R580 610 100 30 0', { s: 'none' }],
        line('M600 580Q630 540 660 580', C.ink, 8),
      ],
    }),
  );
  /* 1833 弟弟 */
  B['w-people-7'] = [].concat(
    H({
      x: 450,
      y: 900,
      s: 0.7,
      hs: 1.35,
      hair: C.brown,
      shirt: C.green,
      pants: C.orange,
      shoe: C.red,
      face: 'smile',
      hr: [580, 760],
      hl: [330, 700],
      handExtra: [
        [C.paper, 'E620 790 52 52', {}],
        [C.ink, 'E620 790 18 18', { s: 'none' }],
        line(
          'M620 772L620 738M620 808L620 842M603 795L575 805M637 795L665 805',
          C.ink,
          6,
        ),
      ],
    }),
  );
  /* 1834 妹妹 */
  B['w-people-8'] = [].concat(
    H({
      x: 450,
      y: 900,
      s: 0.7,
      hs: 1.35,
      hair: C.brown,
      hairStyle: 'pig',
      shirt: C.pink,
      dress: C.pink,
      face: 'smile',
      hl: [340, 740],
      hr: [570, 760],
      handExtra: [],
    }),
    [[C.red, 'E300 500 16 16', {}]].slice(0, 0),
    [
      [C.brown, 'E640 760 54 66', {}],
      [C.brown, 'E605 695 20 20', {}],
      [C.brown, 'E675 695 20 20', {}],
      [C.brown, 'E640 650 40 38', {}],
      [C.paper, 'E640 663 18 12', { s: 'none' }],
      [C.ink, 'E630 645 5 6', { s: 'none' }],
      [C.ink, 'E652 645 5 6', { s: 'none' }],
    ],
  );
  /* 1835 外公 */
  B['w-people-9'] = [].concat(
    [
      line('M470 600L840 220', C.ink, 12),
      line('M840 220L840 420', C.ink, 5),
      [C.sky, 'E840 470 40 22', {}],
      [C.sky, 'M880 470L915 445L915 495Z', {}],
    ],
    H({
      x: 400,
      y: 920,
      s: 1,
      hair: C.paper,
      hairStyle: 'side',
      shirt: C.green,
      pants: C.brown,
      face: 'smile',
      stache: C.paper,
      hl: [330, 600],
      hr: [500, 570],
      torsoExtra: [[C.yellow, 'R340 430 120 100 12', {}]].slice(0, 0),
      hat: function (x, y, k) {
        return [
          [
            C.blue,
            'M' +
              (x - 66 * k) +
              ' ' +
              (y - 14 * k) +
              'C' +
              (x - 72 * k) +
              ' ' +
              (y - 100 * k) +
              ' ' +
              (x + 72 * k) +
              ' ' +
              (y - 100 * k) +
              ' ' +
              (x + 66 * k) +
              ' ' +
              (y - 14 * k) +
              'Z',
            {},
          ],
          [
            C.blue,
            'R' +
              (x - 90 * k) +
              ' ' +
              (y - 30 * k) +
              ' ' +
              180 * k +
              ' ' +
              22 * k +
              ' ' +
              10 * k,
            {},
          ],
        ];
      },
    }),
    [[C.violet, 'E600 920 360 30', { s: 'none' }]].slice(0, 0),
  );
  /* 1836 外婆 */
  B['w-people-10'] = [].concat(
    H({
      x: 450,
      y: 920,
      s: 1,
      hair: C.paper,
      hairStyle: 'bun',
      shirt: C.mint,
      dress: C.mint,
      face: 'smile',
      glasses: true,
      hl: [350, 600],
      hr: [560, 600],
      handExtra: [
        line('M350 600L470 520', C.brown, 10),
        line('M560 600L450 520', C.brown, 10),
      ],
    }),
    [
      [C.red, 'E700 800 90 90', {}],
      line('M640 760Q700 700 760 780', C.ink, 6),
      line('M620 820Q700 870 780 820', C.ink, 6),
      line('M610 760L700 800', C.ink, 6),
      [
        'none',
        'M610 800C560 780 530 700 560 640C580 620 600 610 560 610',
        { s: C.red, w: 8 },
      ],
    ].slice(0, 5),
    [[C.red, 'R420 460 60 40 6', { s: 'none' }].slice(0, 0)].slice(0, 0),
  );
  /* 1837 老人 */
  B['w-people-11'] = [].concat(
    H({
      x: 470,
      y: 920,
      s: 1,
      hair: C.paper,
      hairStyle: 'side',
      shirt: C.violet,
      pants: C.brown,
      face: 'smile',
      glasses: true,
      beard: C.paper,
      hr: [660, 640],
      hl: [380, 690],
      handExtra: [
        ['none', 'M660 640L700 900', { s: C.ink, w: 22 }],
        ['none', 'M660 640L700 900', { s: C.brown, w: 10 }],
        ['none', 'M660 640C650 590 730 580 725 630', { s: C.ink, w: 22 }],
        ['none', 'M660 640C650 590 730 580 725 630', { s: C.brown, w: 10 }],
        [C.yellow, 'E660 642 20 20', {}],
      ],
    }),
  );
  /* 1838 新娘 */
  B['w-people-12'] = [].concat(
    [
      [C.paper, 'M350 250C300 400 280 700 260 880L420 880L420 280Z', {}].slice(
        0,
        0,
      ),
    ].slice(0, 0),
    [
      [
        C.paper,
        'M430 270C380 420 340 560 330 650L670 650C660 560 620 420 570 270Z',
        {},
      ],
    ],
    H({
      x: 500,
      y: 920,
      s: 1,
      hair: C.brown,
      hairStyle: 'bun',
      shirt: C.paper,
      dress: C.paper,
      face: 'smile',
      hr: [610, 560],
      hl: [400, 560],
      handExtra: [
        [C.pink, 'E505 560 42 42', {}],
        [C.red, 'E480 545 20 20', { s: 'none' }],
        [C.yellow, 'E525 560 18 18', { s: 'none' }],
        [C.mint, 'M470 590L505 640L540 590Z', {}],
      ],
      hat: function (x, y, k) {
        return [
          [
            C.paper,
            'M' +
              (x - 55 * k) +
              ' ' +
              (y - 75 * k) +
              'L' +
              (x - 90 * k) +
              ' ' +
              (y - 30 * k) +
              'L' +
              (x + 90 * k) +
              ' ' +
              (y - 30 * k) +
              'L' +
              (x + 55 * k) +
              ' ' +
              (y - 75 * k) +
              'Z',
            {},
          ],
        ]
          .slice(0, 0)
          .concat([
            [
              'none',
              'M' +
                (x - 60 * k) +
                ' ' +
                (y - 50 * k) +
                'Q' +
                x +
                ' ' +
                (y - 110 * k) +
                ' ' +
                (x + 60 * k) +
                ' ' +
                (y - 50 * k),
              { s: C.ink, w: 7 },
            ],
            [
              C.yellow,
              'E' +
                (x + 52 * k) +
                ' ' +
                (y - 42 * k) +
                ' ' +
                14 * k +
                ' ' +
                14 * k,
              {},
            ],
          ]);
      },
    }),
  );
  /* 1839 新郎 */
  B['w-people-13'] = [].concat(
    H({
      x: 500,
      y: 920,
      s: 1.05,
      hair: C.ink,
      shirt: C.ink,
      pants: C.ink,
      sleeve: C.ink,
      face: 'smile',
      hl: [405, 700],
      hr: [595, 700],
      torsoExtra: [
        [C.paper, 'M455 400L545 400L500 600Z', {}],
        [C.red, 'M475 410L525 410L525 440L475 440Z', {}],
        [C.red, 'E500 425 12 12', { s: 'none' }],
        [C.pink, 'E560 480 16 16', {}],
        [C.red, 'E560 480 7 7', { s: 'none' }],
      ],
      hat: function (x, y, k) {
        return [
          [
            C.ink,
            'R' +
              (x - 90 * k) +
              ' ' +
              (y - 38 * k) +
              ' ' +
              180 * k +
              ' ' +
              22 * k +
              ' ' +
              8 * k,
            {},
          ],
          [
            C.ink,
            'R' +
              (x - 55 * k) +
              ' ' +
              (y - 140 * k) +
              ' ' +
              110 * k +
              ' ' +
              110 * k +
              ' ' +
              10 * k,
            {},
          ],
          [
            C.red,
            'R' +
              (x - 55 * k) +
              ' ' +
              (y - 70 * k) +
              ' ' +
              110 * k +
              ' ' +
              22 * k +
              ' ' +
              0,
            { s: 'none' },
          ],
        ];
      },
    }),
  );

  Object.assign(R, B);
})(typeof globalThis !== 'undefined' ? globalThis : this);
