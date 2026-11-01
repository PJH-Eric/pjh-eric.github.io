(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C,
    I = C.ink;
  function F(a) {
    var r = [];
    (function w(x) {
      x.forEach(function (y) {
        if (Array.isArray(y) && typeof y[0] !== 'string') w(y);
        else r.push(y);
      });
    })(a);
    return r;
  }
  function e(c, cx, cy, rx, ry, rot, o) {
    return [
      c,
      'E' + cx + ' ' + cy + ' ' + rx + ' ' + ry + ' ' + (rot || 0),
      o || {},
    ];
  }
  function r(c, x, y, w, h, rd, o) {
    return [
      c,
      'R' + x + ' ' + y + ' ' + w + ' ' + h + ' ' + (rd || 0),
      o || {},
    ];
  }
  function p(c, d, o) {
    return [c, d, o || {}];
  }
  function ln(d, c, w) {
    return ['none', d, { s: c || I, w: w || 7 }];
  }
  function pd(a, close) {
    return (
      'M' +
      a
        .map(function (q) {
          return Math.round(q[0]) + ' ' + Math.round(q[1]);
        })
        .join('L') +
      (close ? 'Z' : '')
    );
  }
  function star5(cx, cy, R0, c) {
    var pts = [],
      i,
      a,
      rr;
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 5;
      rr = i % 2 ? R0 * 0.45 : R0;
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    return p(c || C.yellow, pd(pts, 1), { w: 7 });
  }
  function heart(cx, cy, s, c) {
    return p(
      c,
      'M' +
        cx +
        ' ' +
        (cy + 40 * s) +
        'C' +
        (cx - 70 * s) +
        ' ' +
        (cy - 5 * s) +
        ' ' +
        (cx - 40 * s) +
        ' ' +
        (cy - 50 * s) +
        ' ' +
        cx +
        ' ' +
        (cy - 15 * s) +
        'C' +
        (cx + 40 * s) +
        ' ' +
        (cy - 50 * s) +
        ' ' +
        (cx + 70 * s) +
        ' ' +
        (cy - 5 * s) +
        ' ' +
        cx +
        ' ' +
        (cy + 40 * s) +
        'Z',
    );
  }
  function note(x, y, s, c) {
    c = c || I;
    return [
      e(c, x, y, 24 * s, 17 * s, -20),
      ln('M' + (x + 21 * s) + ' ' + (y - 4 * s) + 'V' + (y - 100 * s), c, 10),
      ln(
        'M' +
          (x + 21 * s) +
          ' ' +
          (y - 100 * s) +
          'C' +
          (x + 60 * s) +
          ' ' +
          (y - 80 * s) +
          ' ' +
          (x + 65 * s) +
          ' ' +
          (y - 55 * s) +
          ' ' +
          (x + 45 * s) +
          ' ' +
          (y - 40 * s),
        c,
        10,
      ),
    ];
  }
  function blob(c, els) {
    var out = [];
    els.forEach(function (q) {
      out.push(e(I, q[0], q[1], q[2] + 7, q[3] + 7, q[4] || 0, { s: 'none' }));
    });
    els.forEach(function (q) {
      out.push(e(c, q[0], q[1], q[2], q[3], q[4] || 0, { s: 'none' }));
    });
    return out;
  }
  function human(o) {
    var u = o.h / 100,
      x = o.x,
      fy = o.y,
      sk = o.skin || C.yellow,
      sh = o.shirt || C.blue,
      pn = o.pants || I,
      hr = o.hair || I;
    var hipY = fy - 46 * u,
      shY = fy - 76 * u,
      hc = fy - 88 * u,
      out = [];
    var lL = o.legL || [
        [-1, 23],
        [-1, 46],
      ],
      lR = o.legR || [
        [1, 23],
        [1, 46],
      ];
    var legs = [
      [lL, -6],
      [lR, 6],
    ];
    if ((o.hairStyle || 'short') === 'long')
      out.push(r(o.hair || I, x - 12 * u, hc - 4 * u, 24 * u, 34 * u, 10 * u));
    var dc = o.dress;
    legs.forEach(function (a) {
      var bx = x + a[1] * u,
        pts = [[bx, hipY]],
        i;
      for (i = 0; i < a[0].length; i++)
        pts.push([bx + a[0][i][0] * u, hipY + a[0][i][1] * u]);
      out.push(K.tube(pts, 9 * u, dc ? sk : pn));
      var en = pts[pts.length - 1];
      out.push(
        e(
          o.shoe || I,
          en[0] + (a[1] > 0 ? 3 : -3) * u,
          en[1] + u,
          7 * u,
          4 * u,
        ),
      );
    });
    if (dc) {
      var fl = o.flare || 22,
        hem = fy - (o.hemUp || 14) * u;
      out.push(
        p(
          dc,
          'M' +
            (x - 13 * u) +
            ' ' +
            shY +
            'L' +
            (x + 13 * u) +
            ' ' +
            shY +
            'L' +
            (x + fl * u) +
            ' ' +
            hem +
            'Q' +
            x +
            ' ' +
            (hem + 6 * u) +
            ' ' +
            (x - fl * u) +
            ' ' +
            hem +
            'Z',
        ),
      );
    } else {
      out.push(r(pn, x - 14 * u, hipY - 8 * u, 28 * u, 16 * u, 5 * u));
      out.push(r(sh, x - 14 * u, shY - 2 * u, 28 * u, 36 * u, 9 * u));
    }
    var aL = o.armL || [
        [-3, 14],
        [-4, 28],
      ],
      aR = o.armR || [
        [3, 14],
        [4, 28],
      ];
    [
      [aL, -13],
      [aR, 13],
    ].forEach(function (a) {
      var bx = x + a[1] * u,
        by = shY + 3 * u,
        pts = [[bx, by]],
        i;
      for (i = 0; i < a[0].length; i++)
        pts.push([bx + a[0][i][0] * u, by + a[0][i][1] * u]);
      out.push(K.tube(pts, 7 * u, o.sleeve || (dc && !o.sleeveOn ? sk : sh)));
      var en = pts[pts.length - 1];
      out.push(e(sk, en[0], en[1], 4.3 * u, 4.3 * u));
    });
    var hs = o.hairStyle || 'short';
    if (hs === 'bun') out.push(e(hr, x, hc - 13 * u, 5.5 * u, 5.5 * u));
    out.push(e(sk, x, hc, 10.5 * u, 11 * u));
    if (hs !== 'bald')
      out.push(
        p(
          hr,
          'M' +
            (x - 11 * u) +
            ' ' +
            (hc - u) +
            'C' +
            (x - 11 * u) +
            ' ' +
            (hc - 15 * u) +
            ' ' +
            (x + 11 * u) +
            ' ' +
            (hc - 15 * u) +
            ' ' +
            (x + 11 * u) +
            ' ' +
            (hc - u) +
            'C' +
            (x + 5 * u) +
            ' ' +
            (hc - 7 * u) +
            ' ' +
            (x - 5 * u) +
            ' ' +
            (hc - 7 * u) +
            ' ' +
            (x - 11 * u) +
            ' ' +
            (hc - u) +
            'Z',
        ),
      );
    if (o.face !== false) {
      out.push(
        e(I, x - 4 * u, hc + 1.5 * u, 1.3 * u, 1.6 * u, 0, { s: 'none' }),
      );
      out.push(
        e(I, x + 4 * u, hc + 1.5 * u, 1.3 * u, 1.6 * u, 0, { s: 'none' }),
      );
    }
    return F(out);
  }
  function micHead(x, y, s, rot) {
    var L = [
      r(I, x - 14 * s, y + 20 * s, 28 * s, 120 * s, 10 * s),
      e(C.violet, x, y, 44 * s, 52 * s),
      ln('M' + (x - 44 * s) + ' ' + (y + 8 * s) + 'H' + (x + 44 * s), I, 6),
      ln(
        'M' +
          (x - 22 * s) +
          ' ' +
          (y - 40 * s) +
          'V' +
          (y + 46 * s) +
          'M' +
          (x + 22 * s) +
          ' ' +
          (y - 40 * s) +
          'V' +
          (y + 46 * s),
        I,
        5,
      ),
      r(C.red, x - 16 * s, y + 52 * s, 32 * s, 14 * s, 4 * s),
    ];
    return K.T(L, { rot: rot || 0, cx: x, cy: y });
  }
  function stand(x, top, base, s) {
    s = s || 1;
    return F([
      e(I, x, base, 100 * s, 20 * s),
      ln('M' + x + ' ' + base + 'V' + (top + 100 * s), I, 18),
      micHead(x, top, s, 0),
    ]);
  }
  function clapper(x, y, s) {
    var L = [
        r(C.paper, x, y + 60 * s, 220 * s, 150 * s, 10),
        r(I, x, y, 220 * s, 55 * s, 8),
      ],
      i;
    for (i = 0; i < 4; i++)
      L.push(
        p(
          C.paper,
          pd(
            [
              [x + (22 + i * 55) * s, y + 52 * s],
              [x + (46 + i * 55) * s, y + 52 * s],
              [x + (66 + i * 55) * s, y + 5 * s],
              [x + (42 + i * 55) * s, y + 5 * s],
            ],
            1,
          ),
          { s: 'none' },
        ),
      );
    L.push(
      ln(
        'M' +
          (x + 20 * s) +
          ' ' +
          (y + 110 * s) +
          'H' +
          (x + 200 * s) +
          'M' +
          (x + 20 * s) +
          ' ' +
          (y + 150 * s) +
          'H' +
          (x + 140 * s),
        I,
        7,
      ),
    );
    return L;
  }
  function curtains() {
    return [
      p(C.red, 'M60 100L270 100C230 300 280 520 240 800L60 800Z'),
      p(C.red, 'M940 100L730 100C770 300 720 520 760 800L940 800Z'),
      r(C.brown, 60, 800, 880, 90, 8),
    ];
  }
  function ball(cx, cy, rr) {
    var pts = [],
      i;
    for (i = 0; i < 5; i++)
      pts.push([
        cx + rr * 0.38 * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 5),
        cy + rr * 0.38 * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 5),
      ]);
    var L = [e(C.paper, cx, cy, rr, rr), p(I, pd(pts, 1), { s: I, w: 7 })],
      q;
    for (i = 0; i < 5; i++) {
      q = [
        cx + rr * 0.38 * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 5),
        cy + rr * 0.38 * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 5),
      ];
      L.push(
        ln(
          'M' +
            Math.round(q[0]) +
            ' ' +
            Math.round(q[1]) +
            'L' +
            Math.round(cx + (q[0] - cx) * 2.4) +
            ' ' +
            Math.round(cy + (q[1] - cy) * 2.4),
          I,
          7,
        ),
      );
    }
    return L;
  }
  function acoustic(c) {
    var L = [ln('M500 140V520', C.brown, 44), ln('M500 140V520', I, 7)];
    L = [
      r(C.brown, 468, 110, 64, 80, 12),
      r(I, 472, 190, 56, 330, 4),
      r(C.yellow, 480, 190, 40, 330, 0, { s: 'none' }),
    ];
    L = L.concat(
      blob(c, [
        [500, 700, 170, 150],
        [500, 560, 120, 110],
      ]),
    );
    L.push(
      e(I, 500, 640, 55, 55),
      r(I, 440, 800, 120, 24, 8),
      ln('M500 190V800', C.paper, 5),
    );
    return L;
  }
  function bear(x, y, s) {
    return [
      e(C.brown, x - 70 * s, y - 230 * s, 36 * s, 36 * s),
      e(C.brown, x + 70 * s, y - 230 * s, 36 * s, 36 * s),
      e(C.brown, x - 60 * s, y - 40 * s, 45 * s, 50 * s),
      e(C.brown, x + 60 * s, y - 40 * s, 45 * s, 50 * s),
      e(C.brown, x, y - 120 * s, 100 * s, 105 * s),
      e(C.brown, x - 105 * s, y - 130 * s, 36 * s, 56 * s, 25),
      e(C.brown, x + 105 * s, y - 130 * s, 36 * s, 56 * s, -25),
      e(C.brown, x, y - 235 * s, 80 * s, 70 * s),
      e(C.yellow, x, y - 215 * s, 38 * s, 28 * s),
      e(I, x, y - 228 * s, 12 * s, 8 * s),
      e(I, x - 32 * s, y - 255 * s, 6 * s, 8 * s, 0, { s: 'none' }),
      e(I, x + 32 * s, y - 255 * s, 6 * s, 8 * s, 0, { s: 'none' }),
    ];
  }

  var rc = {};

  rc['w-star-7'] = F([
    r(C.mint, 60, 840, 880, 50, 8),
    clapper(640, 160, 1),
    human({
      x: 330,
      y: 840,
      h: 600,
      shirt: C.red,
      pants: C.blue,
      skin: C.yellow,
      hair: I,
      legL: [
        [-3, 23],
        [-6, 46],
      ],
      legR: [
        [18, 12],
        [38, 4],
      ],
      armL: [
        [-12, 8],
        [-22, -2],
      ],
      armR: [
        [10, 10],
        [16, 24],
      ],
    }),
    ball(700, 700, 75),
    ln('M590 770L610 790M600 740L575 740', I, 7),
    star5(160, 200, 60),
  ]);

  rc['w-star-8'] = F([
    ln(
      'M170 250L150 300M260 200L240 260M780 220L760 280M850 300L830 350M120 480L100 530M880 520L860 570M220 640L200 690M820 700L800 750',
      C.sky,
      16,
    ),
    human({
      x: 500,
      y: 860,
      h: 520,
      dress: C.violet,
      flare: 17,
      hemUp: 20,
      skin: C.yellow,
      hair: I,
      armR: [
        [6, -6],
        [5, -22],
      ],
      armL: [
        [-4, 14],
        [-4, 28],
      ],
    }),
    ln('M588 340V470', I, 14),
    p(
      C.red,
      'M290 340C290 190 440 130 588 130C736 130 886 190 886 340C846 300 810 300 778 340C740 300 706 300 672 340C640 300 604 300 588 340C570 300 536 300 502 340C470 300 434 300 400 340C366 300 330 300 290 340Z',
    ),
    ln('M588 130V105', I, 14),
  ]);

  rc['w-star-9'] = F([
    curtains(),
    stand(500, 330, 840, 1.3),
    p(C.yellow, 'M380 200L400 100L450 160L500 80L550 160L600 100L620 200Z'),
    note(180, 560, 1.2, I),
    note(800, 480, 1.2, I),
    star5(300, 300, 36),
    star5(720, 280, 36),
  ]);

  rc['w-star-10'] = F([
    r(C.violet, 60, 820, 880, 70, 8),
    r(C.yellow, 120, 830, 90, 50),
    r(C.pink, 300, 830, 90, 50),
    r(C.sky, 740, 830, 90, 50),
    ln('M730 90V200', I, 10),
    e(C.violet, 730, 310, 115, 115),
    ln(
      'M615 310H845M730 195V425M640 240C700 280 760 280 820 240M640 380C700 340 760 340 820 380M670 215C640 280 640 340 670 405M790 215C820 280 820 340 790 405',
      I,
      5,
    ),
    star5(870, 180, 36),
    star5(590, 220, 30, C.pink),
    human({
      x: 380,
      y: 820,
      h: 600,
      shirt: C.pink,
      pants: I,
      skin: C.orange,
      hair: I,
      armL: [
        [-10, -10],
        [-18, -32],
      ],
      armR: [
        [10, -12],
        [20, -30],
      ],
      legL: [
        [-10, 20],
        [-24, 46],
      ],
      legR: [
        [12, 20],
        [20, 46],
      ],
    }),
  ]);

  rc['w-star-11'] = F([
    curtains(),
    micHead(500, 360, 3.4, 0),
    ln(
      'M760 280C830 340 830 440 760 500M820 220C930 310 930 470 820 560',
      C.orange,
      16,
    ),
    ln(
      'M240 280C170 340 170 440 240 500M180 220C70 310 70 470 180 560',
      C.orange,
      16,
    ),
    note(220, 740, 1.2, I),
    note(790, 740, 1.2, I),
    star5(500, 120, 40),
  ]);

  rc['w-star-12'] = F([
    blob(C.paper, [
      [400, 250, 140, 80],
      [560, 230, 150, 95],
      [470, 190, 120, 85],
      [650, 270, 100, 65],
      [300, 280, 90, 55],
    ]),
    ln(
      'M300 400L270 480M400 400L370 480M500 400L470 480M600 400L570 480M700 400L670 480',
      C.sky,
      16,
    ),
    p(
      C.yellow,
      pd(
        [
          [540, 300],
          [450, 470],
          [510, 470],
          [440, 620],
          [600, 440],
          [535, 440],
          [610, 300],
        ],
        1,
      ),
    ),
    e(C.brown, 500, 800, 280, 62),
    p(C.brown, 'M360 790C340 640 400 600 500 600C600 600 660 640 640 790Z'),
    r(C.red, 360, 735, 280, 48, 10),
    star5(220, 700, 34, C.sky),
    star5(790, 690, 34, C.sky),
  ]);

  rc['w-star-13'] = F([
    e(C.red, 500, 250, 90, 90),
    r(C.mint, 60, 820, 880, 70, 8),
    p(C.blue, 'M120 820L400 330C450 250 550 250 600 330L880 820Z', { b: 1 }),
    p(
      C.paper,
      'M330 460L400 330C450 250 550 250 600 330L670 460L610 490L560 440L500 500L440 440L390 490Z',
      { i: 1 },
    ),
    ln('M120 820L400 330', I, 7),
    ln('M600 330L880 820', I, 7),
    ln('M370 580L630 580', C.violet, 16),
    stand(800, 420, 830, 1.0),
    note(190, 730, 1.0, I),
  ]);

  rc['w-star-14'] = F([
    r(C.mint, 60, 840, 880, 50, 8),
    ln('M300 560L690 820M690 560L300 820', C.brown, 30),
    ln('M280 400V830M700 400V830', C.brown, 30),
    r(C.red, 270, 560, 440, 54, 8),
    r(C.red, 270, 370, 440, 120, 8),
    ln('M240 520H740', C.brown, 30),
    clapper(610, 130, 0.8),
    p(C.yellow, 'M110 330L330 230L330 380L110 330Z'),
    e(C.orange, 330, 305, 28, 78),
    r(I, 70, 300, 50, 60, 10),
  ]);

  rc['w-star-15'] = F([
    r(C.mint, 60, 840, 880, 50, 8),
    human({
      x: 360,
      y: 840,
      h: 600,
      shirt: C.red,
      pants: I,
      skin: C.yellow,
      hair: I,
      hairStyle: 'long',
      legL: [
        [-2, 23],
        [-4, 46],
      ],
      legR: [
        [24, -2],
        [46, -26],
      ],
      armL: [
        [-14, 6],
        [-26, -6],
      ],
      armR: [
        [-4, 12],
        [-16, 24],
      ],
    }),
    r(C.yellow, 770, 780, 140, 60, 8),
    ln('M840 780V640', C.yellow, 30),
    e(C.yellow, 840, 560, 50, 90),
    e(C.yellow, 840, 440, 34, 34),
    star5(840, 300, 40),
  ]);

  rc['w-star-16'] = F([
    p(C.red, 'M360 420L640 420L900 880L100 880Z'),
    r(C.yellow, 150, 560, 40, 300, 10),
    r(C.yellow, 810, 560, 40, 300, 10),
    e(C.yellow, 170, 540, 34, 34),
    e(C.yellow, 830, 540, 34, 34),
    ln('M170 560Q500 700 830 560', C.violet, 16),
    human({
      x: 500,
      y: 850,
      h: 520,
      dress: C.pink,
      flare: 20,
      skin: C.yellow,
      hair: C.brown,
      hairStyle: 'long',
      armR: [
        [8, -8],
        [14, -22],
      ],
    }),
    star5(200, 220, 60),
    star5(800, 200, 50, C.pink),
    star5(500, 120, 36),
  ]);

  rc['w-star-17'] = F([
    r(C.violet, 60, 800, 880, 110, 10),
    p(C.paper, 'M300 800L700 800L860 910L140 910Z'),
    r(I, 190, 90, 60, 50, 8),
    r(I, 470, 90, 60, 50, 8),
    r(I, 750, 90, 60, 50, 8),
    e(C.yellow, 220, 150, 40, 40),
    e(C.yellow, 500, 150, 40, 40),
    e(C.yellow, 780, 150, 40, 40),
    human({
      x: 500,
      y: 800,
      h: 580,
      dress: C.sky,
      flare: 20,
      hemUp: 16,
      skin: C.yellow,
      hair: C.brown,
      hairStyle: 'long',
      armR: [
        [8, 4],
        [-2, 12],
      ],
      armL: [
        [-6, 14],
        [-10, 28],
      ],
      legL: [
        [-6, 23],
        [-9, 46],
      ],
      legR: [
        [8, 23],
        [6, 46],
      ],
    }),
    p(C.yellow, 'M440 330L445 290L470 310L500 280L530 310L555 290L560 330Z'),
  ]);

  rc['w-star-18'] = F([
    r(C.sky, 60, 100, 880, 520, 10, { s: 'none' }),
    r(C.mint, 60, 560, 880, 340, 10),
    ln('M60 640H940M60 720H940M60 800H940', C.green, 7),
    e(C.paper, 200, 230, 90, 36),
    e(C.paper, 260, 215, 70, 40),
    e(C.paper, 760, 300, 90, 36),
    e(C.paper, 810, 285, 60, 36),
    ln('M500 800C500 640 480 520 520 400', C.brown, 50),
    ln(
      'M510 520C440 480 400 440 350 400M505 480C560 440 620 420 670 360',
      C.brown,
      26,
    ),
    blob(C.green, [
      [500, 280, 200, 120],
      [360, 340, 130, 90],
      [650, 350, 140, 90],
      [520, 200, 130, 80],
    ]),
    e(C.mint, 440, 240, 70, 40, 0, { s: 'none' }),
    e(C.mint, 600, 300, 60, 36, 0, { s: 'none' }),
    human({ x: 760, y: 840, h: 280, shirt: C.paper, pants: C.blue, hair: I }),
  ]);

  rc['w-star-19'] = F([
    r(C.blue, 60, 700, 880, 200, 10),
    e(I, 330, 250, 100, 70),
    e(I, 670, 250, 100, 70),
    e(C.sky, 310, 235, 40, 18, -20, { s: 'none' }),
    e(C.sky, 650, 235, 40, 18, -20, { s: 'none' }),
    ln('M430 230Q500 190 570 230', I, 16),
    ln('M230 220L120 190M770 220L880 190', I, 16),
    K.T([r(C.paper, 330, 380, 190, 260, 14), heart(425, 500, 2, C.red)], {
      rot: -22,
      cx: 425,
      cy: 510,
    }),
    K.T([r(C.paper, 330, 380, 190, 260, 14), heart(425, 500, 2, C.red)], {
      rot: 14,
      cx: 425,
      cy: 510,
      dx: 150,
    }),
    e(C.red, 220, 800, 90, 30),
    r(C.red, 130, 770, 180, 30),
    e(C.red, 220, 770, 90, 30),
    e(C.paper, 220, 770, 45, 14),
    e(C.orange, 790, 840, 90, 30),
    r(C.orange, 700, 810, 180, 30),
    e(C.orange, 790, 810, 90, 30),
    e(C.paper, 790, 810, 45, 14),
  ]);

  rc['w-star-20'] = F([
    r(C.mint, 60, 840, 880, 50, 8),
    human({
      x: 430,
      y: 840,
      h: 600,
      shirt: C.yellow,
      pants: C.yellow,
      skin: C.orange,
      hair: I,
      legL: [
        [-16, 18],
        [-30, 46],
      ],
      legR: [
        [16, 18],
        [26, 46],
      ],
      armR: [
        [16, 2],
        [34, -2],
      ],
      armL: [
        [-6, 10],
        [4, 4],
      ],
    }),
    ln('M385 460L330 840', I, 7),
    K.tube(
      [
        [700, 180],
        [750, 290],
      ],
      34,
      C.brown,
    ),
    K.tube(
      [
        [800, 390],
        [860, 500],
      ],
      34,
      C.brown,
    ),
    ln('M750 290C790 320 790 360 800 390', I, 9),
    star5(780, 520, 34, C.red),
  ]);

  rc['w-star-21'] = F([
    r(C.mint, 60, 860, 880, 40, 8),
    r(C.brown, 360, 820, 280, 50, 10),
    r(C.brown, 450, 230, 100, 620, 36),
    r(C.brown, 270, 330, 230, 56, 18),
    r(C.brown, 500, 330, 230, 56, 18),
    r(C.brown, 280, 470, 220, 56, 18),
    ln('M520 600L640 700L610 760', C.brown, 40),
    human({
      x: 170,
      y: 860,
      h: 520,
      shirt: C.red,
      pants: I,
      skin: C.yellow,
      hair: I,
      legL: [
        [-6, 20],
        [-12, 46],
      ],
      legR: [
        [10, 22],
        [14, 46],
      ],
      armL: [
        [14, 2],
        [28, -10],
      ],
      armR: [
        [16, 12],
        [30, 4],
      ],
    }),
  ]);

  rc['w-star-22'] = F([
    r(C.paper, 130, 120, 260, 260, 8),
    ln('M260 120V380M130 250H390', C.brown, 16),
    e(C.yellow, 800, 190, 60, 80),
    r(I, 790, 100, 20, 20, 4),
    human({
      x: 500,
      y: 860,
      h: 640,
      dress: C.red,
      flare: 14,
      hemUp: 22,
      skin: C.yellow,
      hair: I,
      hairStyle: 'bun',
      armL: [
        [-3, 14],
        [6, 22],
      ],
      armR: [
        [3, 14],
        [-2, 26],
      ],
    }),
    e(C.pink, 480, 500, 22, 22),
    e(C.pink, 520, 570, 22, 22),
    e(C.pink, 485, 650, 22, 22),
    e(C.yellow, 480, 500, 8, 8, 0, { s: 'none' }),
    e(C.yellow, 520, 570, 8, 8, 0, { s: 'none' }),
    e(C.yellow, 485, 650, 8, 8, 0, { s: 'none' }),
  ]);

  rc['w-star-23'] = F([
    p(C.blue, 'M60 200L500 90L940 200L880 260L120 260Z'),
    r(C.brown, 100, 260, 800, 50, 4),
    r(C.brown, 150, 310, 40, 590, 4),
    r(C.brown, 810, 310, 40, 590, 4),
    r(C.sky, 190, 560, 620, 340, 4, { s: I }),
    ln('M500 560V900M190 730H810', I, 7),
    ln('M330 310V230M670 310V230', I, 7),
    ln('M300 310V350M500 310V350M700 310V350', I, 7),
    e(C.red, 300, 450, 80, 98),
    ln(
      'M255 360C240 450 260 520 300 548M345 360C360 450 340 520 300 548M300 352V548',
      I,
      6,
    ),
    r(C.yellow, 270, 350, 60, 12, 3),
    r(C.yellow, 270, 540, 60, 12, 3),
    e(C.red, 500, 450, 80, 98),
    ln(
      'M455 360C440 450 460 520 500 548M545 360C560 450 540 520 500 548M500 352V548',
      I,
      6,
    ),
    r(C.yellow, 470, 350, 60, 12, 3),
    r(C.yellow, 470, 540, 60, 12, 3),
    e(C.red, 700, 450, 80, 98),
    ln(
      'M655 360C640 450 660 520 700 548M745 360C760 450 740 520 700 548M700 352V548',
      I,
      6,
    ),
    r(C.yellow, 670, 350, 60, 12, 3),
    r(C.yellow, 670, 540, 60, 12, 3),
  ]);

  rc['w-star-24'] = F([
    e(C.yellow, 700, 250, 120, 120),
    r(C.mint, 120, 100, 50, 790, 24),
    r(C.mint, 800, 100, 50, 790, 24),
    r(C.green, 280, 100, 40, 790, 20),
    r(C.green, 690, 100, 40, 790, 20),
    ln(
      'M120 300H170M120 560H170M800 380H850M800 700H850M280 260H320M280 620H320M690 200H730M690 520H730',
      I,
      7,
    ),
    K.T(
      F([
        human({
          x: 500,
          y: 820,
          h: 520,
          shirt: C.red,
          pants: I,
          skin: C.yellow,
          hair: I,
          hairStyle: 'long',
          legL: [
            [-8, 18],
            [-20, 44],
          ],
          legR: [
            [8, 22],
            [26, 36],
          ],
          armL: [
            [-12, 6],
            [-26, 2],
          ],
          armR: [
            [14, 4],
            [30, 4],
          ],
        }),
        r(C.sky, 640, 405, 200, 18, 6),
        r(C.yellow, 600, 395, 40, 40, 6),
      ]),
      { rot: -70, cx: 500, cy: 560, dx: 20, dy: -60 },
    ),
  ]);

  rc['w-star-25'] = F([
    p(C.yellow, 'M620 160A230 230 0 1 0 830 560A190 190 0 1 1 620 160Z'),
    star5(230, 160, 34),
    star5(420, 280, 26),
    star5(840, 220, 30),
    star5(700, 120, 22, C.paper),
    stand(180, 420, 840, 0.9),
    p(
      C.red,
      'M380 760L520 700L520 830L380 780ZM660 760L520 700L520 830L660 780Z',
    ),
    r(C.red, 500, 730, 40, 70, 10),
  ]);

  rc['w-star-26'] = F([
    e(C.yellow, 500, 660, 330, 95),
    p(C.yellow, 'M300 640C300 420 400 340 500 340C600 340 700 420 700 640Z'),
    r(C.pink, 308, 560, 384, 70, 10, { s: 'none' }),
    ln('M308 560H692M308 630H692', I, 7),
    e(C.red, 380, 590, 34, 34),
    e(C.yellow, 380, 590, 12, 12, 0, { s: 'none' }),
    e(C.paper, 500, 590, 34, 34),
    e(C.yellow, 500, 590, 12, 12, 0, { s: 'none' }),
    e(C.red, 620, 590, 34, 34),
    e(C.yellow, 620, 590, 12, 12, 0, { s: 'none' }),
    micHead(830, 260, 1.3, 20),
    note(160, 300, 1.2, I),
    note(190, 160, 0.9, I),
  ]);

  rc['w-star-27'] = F([
    e(C.yellow, 500, 400, 270, 270),
    ln('M70 780C250 700 330 640 420 640', C.brown, 26),
    ln('M200 740L160 660M290 700L270 620', C.brown, 16),
    e(C.pink, 160, 640, 28, 28),
    e(C.pink, 270, 610, 28, 28),
    e(C.pink, 400, 640, 28, 28),
    e(C.paper, 160, 640, 9, 9, 0, { s: 'none' }),
    e(C.paper, 270, 610, 9, 9, 0, { s: 'none' }),
    e(C.paper, 400, 640, 9, 9, 0, { s: 'none' }),
    heart(500, 400, 3.2, C.red),
    stand(790, 560, 840, 0.7),
    note(250, 200, 1.0, I),
  ]);

  rc['w-star-28'] = F([
    r(I, 700, 600, 220, 260, 12),
    e(C.violet, 810, 740, 70, 70),
    e(C.yellow, 750, 640, 14, 14),
    e(C.yellow, 810, 640, 14, 14),
    e(C.yellow, 870, 640, 14, 14),
    r(C.brown, 90, 870, 820, 20, 4),
    K.T(acoustic(C.red), { rot: 28, cx: 500, cy: 500, s: 0.95, dx: -60 }),
    star5(780, 300, 40),
    star5(220, 180, 30, C.pink),
  ]);

  rc['w-star-29'] = F([
    e(C.paper, 500, 560, 170, 215),
    e(C.red, 500, 560, 100, 190, 0, { s: 'none' }),
    p(I, 'M340 480Q420 430 470 500Q400 520 340 480Z'),
    p(I, 'M660 480Q580 430 530 500Q600 520 660 480Z'),
    e(C.red, 500, 580, 24, 40),
    p(C.red, 'M410 700Q500 780 590 700Q500 740 410 700Z'),
    ln('M500 380V520', I, 7),
    p(C.yellow, 'M320 400C320 250 680 250 680 400Q500 330 320 400Z'),
    e(C.red, 330, 340, 36, 36),
    e(C.red, 670, 340, 36, 36),
    e(C.pink, 500, 250, 40, 40),
    ln('M580 260C700 120 790 120 840 200', C.red, 16),
    ln('M420 260C300 120 210 120 160 200', I, 16),
    ln('M170 760L830 860M830 760L170 860', C.sky, 16),
  ]);

  rc['w-star-30'] = F([
    K.T(acoustic(C.orange), { rot: -22, cx: 500, cy: 500, s: 0.95, dx: -90 }),
    heart(500, 620, 1.2, C.pink),
    p(
      C.red,
      'M700 780Q760 740 800 770Q840 740 900 780Q820 860 800 860Q760 860 700 780Z',
    ),
    ln('M705 782Q800 800 895 782', I, 6),
    star5(820, 240, 46),
    star5(700, 140, 28, C.pink),
    star5(900, 420, 26),
  ]);

  rc['w-star-31'] = F([
    star5(180, 260, 34),
    star5(840, 240, 34, C.pink),
    star5(820, 760, 28),
    p(C.yellow, 'M360 620L330 520L420 570L500 490L580 570L670 520L640 620Z'),
    ln('M470 380C430 280 380 240 330 240', I, 9),
    ln('M530 380C570 280 620 240 670 240', I, 9),
    e(C.sky, 360, 420, 150, 80, -30),
    e(C.sky, 640, 420, 150, 80, 30),
    e(C.yellow, 500, 560, 130, 170, 0, { b: 1 }),
    e(C.orange, 500, 560, 130, 36, 0, { i: 1 }),
    e(C.orange, 500, 640, 130, 36, 0, { i: 1 }),
    p(I, 'M500 720L488 790L512 790Z'),
    e(C.yellow, 500, 380, 80, 70),
    e(I, 475, 372, 9, 12, 0, { s: 'none' }),
    e(I, 525, 372, 9, 12, 0, { s: 'none' }),
    p(C.red, 'M410 330L390 220L450 280L500 200L550 280L610 220L590 330Z'),
  ]);

  rc['w-star-32'] = F([
    p(
      C.yellow,
      'M470 120C350 100 260 200 270 320C220 380 240 470 300 500L300 620L700 620L700 500C760 470 780 380 730 320C740 200 650 100 530 120Z',
    ),
    e(C.yellow, 500, 440, 180, 215),
    e(C.orange, 500, 440, 180, 215, 0, { s: 'none' }),
    e(C.yellow, 500, 440, 168, 205, 0, { s: 'none' }),
    p(C.pink, 'M180 900C180 700 330 660 500 660C670 660 820 700 820 900Z'),
    ln('M450 660L450 720M550 660L550 720', I, 7),
    e(I, 440, 430, 11, 14, 0, { s: 'none' }),
    e(I, 560, 430, 11, 14, 0, { s: 'none' }),
    p(C.red, 'M440 540Q500 580 560 540Q500 560 440 540Z'),
    e(C.yellow, 320, 520, 36, 36, 0, { s: I, w: 9 }),
    ln('M320 520V560', I, 7),
    p(C.yellow, 'M420 330L400 230L470 280L500 210L530 280L600 230L580 330Z'),
    ln('M345 480C330 570 380 600 470 600', I, 9),
    e(I, 475, 605, 24, 14),
    e(I, 400, 650, 4, 4),
  ]);

  rc['w-star-33'] = F([
    e(I, 500, 330, 170, 55),
    p(I, 'M360 320C350 200 390 140 500 140C610 140 650 200 640 320Z'),
    r(C.paper, 355, 270, 290, 44, 6),
    e(I, 500, 330, 170, 55, 0, { s: 'none' }),
    r(C.paper, 410, 500, 60, 110, 28),
    r(C.paper, 470, 480, 60, 130, 28),
    r(C.paper, 530, 500, 60, 110, 28),
    e(C.paper, 600, 590, 30, 56, -50),
    r(C.paper, 410, 580, 200, 140, 40),
    r(C.yellow, 400, 700, 210, 24, 8),
    star5(300, 560, 30),
    star5(720, 520, 26),
    star5(660, 740, 22, C.sky),
    r(C.paper, 180, 810, 90, 60, 10),
    e(I, 160, 880, 100, 40),
    r(C.paper, 730, 810, 90, 60, 10),
    e(I, 840, 880, 100, 40),
  ]);

  rc['w-star-34'] = F([
    p(C.blue, 'M170 920C170 760 320 700 500 700C680 700 830 760 830 920Z'),
    p(C.paper, 'M380 700L500 800L440 560Z'),
    p(C.paper, 'M620 700L500 800L560 560Z'),
    e(C.yellow, 500, 500, 160, 200),
    r(I, 335, 440, 30, 110, 8),
    r(I, 635, 440, 30, 110, 8),
    p(
      I,
      'M350 400C320 250 430 150 560 160C680 170 700 260 650 330C620 280 560 260 480 270C440 280 410 320 350 400Z',
    ),
    p(I, 'M360 440Q440 380 470 380L470 420Q420 420 360 440Z', { s: 'none' }),
    r(I, 360, 440, 120, 50, 22),
    r(I, 520, 440, 120, 50, 22),
    ln('M480 460H520', I, 9),
    p(C.red, 'M440 590Q500 620 560 590Q500 600 440 590Z'),
    star5(500, 840, 30),
    star5(330, 830, 22),
    star5(670, 830, 22),
  ]);

  rc['w-star-35'] = (function () {
    var L = [
      r(C.violet, 60, 640, 880, 240, 8),
      r(C.paper, 90, 700, 120, 36),
      r(C.paper, 250, 700, 120, 36),
      r(C.paper, 410, 700, 120, 36),
      r(C.paper, 570, 700, 120, 36),
      r(C.paper, 730, 700, 120, 36),
      r(C.paper, 90, 790, 120, 36),
      r(C.paper, 250, 790, 120, 36),
      r(C.paper, 410, 790, 120, 36),
      r(C.paper, 570, 790, 120, 36),
      r(C.paper, 730, 790, 120, 36),
    ];
    var xs = [210, 410, 610, 810],
      sh = [I, C.blue, C.brown, C.violet],
      k;
    for (k = 0; k < 4; k++)
      L.push(
        human({
          x: xs[k],
          y: 830,
          h: 460,
          shirt: sh[k],
          pants: sh[k],
          skin: C.yellow,
          hair: C.brown,
          legL:
            k % 2
              ? [
                  [-2, 23],
                  [-4, 46],
                ]
              : [
                  [6, 20],
                  [8, 44],
                ],
          legR:
            k % 2
              ? [
                  [6, 20],
                  [8, 44],
                ]
              : [
                  [-2, 23],
                  [-4, 46],
                ],
          armL:
            k % 2
              ? [
                  [-4, 14],
                  [-6, 28],
                ]
              : [
                  [6, 12],
                  [10, 24],
                ],
          armR:
            k % 2
              ? [
                  [8, 12],
                  [12, 24],
                ]
              : [
                  [3, 14],
                  [4, 28],
                ],
        }),
      );
    return F(L);
  })();

  rc['w-star-36'] = F([
    p(
      C.sky,
      'M500 110C540 110 560 180 560 260L560 330L800 520L800 580L560 540L560 690L640 760L640 800L500 770L360 800L360 760L440 690L440 540L200 580L200 520L440 330L440 260C440 180 460 110 500 110Z',
    ),
    e(C.yellow, 500, 300, 28, 60, 0, { s: I }),
    r(C.red, 460, 600, 80, 10, 4),
    ln('M440 400L300 520M560 400L700 520', C.violet, 7),
    p(I, 'M200 780C200 700 400 700 440 790C400 840 240 850 200 780Z'),
    p(I, 'M800 780C800 700 600 700 560 790C600 840 760 850 800 780Z'),
    e(C.sky, 330, 780, 65, 36, -15, { s: 'none' }),
    e(C.sky, 670, 780, 65, 36, 15, { s: 'none' }),
    ln('M435 790Q500 740 565 790', I, 14),
    ln('M200 790L100 770M800 790L900 770', I, 14),
  ]);

  rc['w-star-37'] = F([
    e(C.orange, 480, 560, 200, 200),
    r(C.blue, 60, 700, 880, 200, 8),
    ln('M60 760H940M60 820H940', C.sky, 7),
    p(C.violet, 'M80 640L840 640L940 440L960 440L960 700L860 820L80 820Z'),
    r(C.brown, 80, 620, 780, 26, 8),
    ln(
      'M170 620V540M300 620V540M430 620V540M560 620V540M690 620V540M820 620V540M170 540H830',
      I,
      7,
    ),
    human({
      x: 660,
      y: 620,
      h: 340,
      shirt: C.paper,
      pants: C.brown,
      hair: C.brown,
      armL: [
        [-18, 0],
        [-36, 0],
      ],
      armR: [
        [18, 0],
        [36, 0],
      ],
    }),
    human({
      x: 700,
      y: 620,
      h: 300,
      dress: C.pink,
      flare: 18,
      skin: C.yellow,
      hair: C.orange,
      hairStyle: 'long',
      armL: [
        [-14, 0],
        [-32, -2],
      ],
      armR: [
        [14, 0],
        [32, -2],
      ],
    }),
  ]);

  rc['w-star-38'] = F([
    r(C.paper, 100, 790, 800, 60, 10),
    K.T(
      [
        e(C.red, 500, 520, 200, 230),
        e(C.red, 300, 620, 80, 100, 30, {}),
        r(C.paper, 380, 700, 240, 150, 30),
        ln('M380 740H620M380 790H620', I, 7),
        ln('M350 410C400 340 520 330 580 380', C.paper, 16),
      ],
      { rot: -15, cx: 500, cy: 520, dx: -90 },
    ),
    r(C.pink, 620, 570, 280, 190, 40),
    r(C.paper, 640, 590, 240, 20, 10, { s: 'none' }),
    e(C.paper, 700, 480, 36, 36),
    e(C.paper, 790, 430, 50, 50),
    e(C.paper, 860, 520, 28, 28),
    e(C.sky, 770, 440, 12, 12, 0, { s: 'none' }),
  ]);

  rc['w-star-39'] = F([
    p(C.blue, 'M120 440L500 520L880 440L880 780L500 860L120 780Z'),
    p(C.paper, 'M150 400L500 470L500 800L150 730Z'),
    p(C.paper, 'M850 400L500 470L500 800L850 730Z'),
    ln(
      'M210 500L440 550M210 570L440 620M210 640L440 690M560 550L790 500M560 620L790 570M560 690L790 640',
      C.violet,
      7,
    ),
    ln('M500 470V800', I, 9),
    K.T([ln('M240 180L760 560', C.brown, 26), ln('M240 180L760 560', I, 7)], {
      cx: 500,
      cy: 400,
      s: 0.7,
      dx: 130,
      dy: -60,
    }),
    star5(280, 160, 50),
    star5(400, 240, 30, C.pink),
    star5(190, 270, 26, C.sky),
  ]);

  rc['w-star-40'] = (function () {
    var L = [r(I, 70, 100, 860, 800, 30)],
      i,
      x;
    for (i = 0; i < 12; i++) {
      x = 120 + i * 70;
      L.push(
        ln(
          'M' +
            x +
            ' ' +
            (140 + (i % 3) * 40) +
            'V' +
            (260 + (i % 3) * 40) +
            'M' +
            x +
            ' ' +
            (330 + (i % 4) * 30) +
            'V' +
            (440 + (i % 4) * 30) +
            'M' +
            x +
            ' ' +
            (520 + (i % 2) * 40) +
            'V' +
            (600 + (i % 2) * 40),
          C.green,
          16,
        ),
      );
    }
    L.push(
      e(C.blue, 340, 430, 120, 100, 0, { s: C.yellow, w: 16 }),
      e(C.blue, 660, 430, 120, 100, 0, { s: C.yellow, w: 16 }),
      ln('M460 410Q500 380 540 410', C.yellow, 16),
      e(C.sky, 310, 400, 36, 20, -20, { s: 'none' }),
      e(C.sky, 630, 400, 36, 20, -20, { s: 'none' }),
      K.T(
        [r(C.red, 200, 700, 110, 60, 30), r(C.paper, 300, 700, 110, 60, 30)],
        { rot: -20, cx: 300, cy: 730, dx: 90 },
      ),
      K.T(
        [r(C.sky, 540, 700, 110, 60, 30), r(C.paper, 650, 700, 110, 60, 30)],
        { rot: 20, cx: 650, cy: 730, dx: -100 },
      ),
    );
    return F(L);
  })();

  rc['w-star-41'] = F([
    r(C.sky, 60, 700, 880, 200, 8),
    r(C.sky, 700, 600, 200, 100, 10, { s: 'none' }),
    human({
      x: 430,
      y: 880,
      h: 760,
      dress: I,
      flare: 15,
      hemUp: 22,
      skin: C.yellow,
      hair: C.brown,
      hairStyle: 'bun',
      armR: [
        [12, 10],
        [26, 4],
      ],
      armL: [
        [-3, 14],
        [-4, 28],
      ],
    }),
    e(C.paper, 410, 422, 7, 7),
    e(C.paper, 430, 432, 7, 7),
    e(C.paper, 450, 432, 7, 7),
    e(C.paper, 470, 422, 7, 7),
    e(C.paper, 390, 410, 7, 7),
    r(C.paper, 640, 570, 90, 70, 12),
    ln('M650 590H720', I, 7),
    r(C.sky, 740, 760, 150, 120, 10),
    r(C.paper, 805, 760, 20, 120, 2),
    r(C.paper, 740, 810, 150, 20, 2),
    ln('M815 760L780 720M815 760L850 720', C.paper, 12),
  ]);

  rc['w-star-42'] = F([
    r(C.violet, 140, 800, 720, 90, 8),
    ln(
      'M200 800V890M300 800V890M400 800V890M500 800V890M600 800V890M700 800V890M800 800V890',
      I,
      7,
    ),
    ln(
      'M360 560C300 640 280 700 330 800M640 560C700 640 720 700 670 800',
      C.sky,
      16,
    ),
    ln('M500 800V700', C.sky, 16),
    human({
      x: 500,
      y: 780,
      h: 600,
      dress: C.paper,
      flare: 36,
      hemUp: 40,
      skin: C.yellow,
      hair: C.yellow,
      hairStyle: 'long',
      armL: [
        [-14, 6],
        [-26, 14],
      ],
      armR: [
        [14, 6],
        [26, 14],
      ],
      face: true,
    }),
    e(C.yellow, 400, 310, 26, 26, 0, { s: 'none' }),
    e(C.yellow, 600, 310, 26, 26, 0, { s: 'none' }),
    e(C.yellow, 440, 250, 30, 30, 0, { s: 'none' }),
    e(C.yellow, 560, 250, 30, 30, 0, { s: 'none' }),
    e(I, 535, 355, 4, 4),
  ]);

  rc['w-star-43'] = F([
    ln('M770 360C770 300 830 260 880 300', C.brown, 20),
    ln('M770 360V860', C.brown, 20),
    r(C.sky, 60, 860, 880, 30, 6),
    e(C.yellow, 500, 520, 150, 170),
    p(I, 'M360 440C360 300 640 300 640 440L640 450L360 450Z'),
    e(I, 500, 450, 215, 28),
    e(I, 440, 505, 13, 14, 0, { s: 'none' }),
    e(I, 560, 505, 13, 14, 0, { s: 'none' }),
    ln('M400 460Q440 440 475 458M525 458Q560 440 600 460', I, 9),
    r(I, 465, 585, 70, 22, 10),
    p(C.red, 'M450 650Q500 690 550 650Z'),
    p(
      I,
      'M180 830C150 770 240 740 330 790C350 830 300 880 240 880C200 880 190 860 180 830Z',
    ),
    p(
      I,
      'M820 830C850 770 760 740 670 790C650 830 700 880 760 880C800 880 810 860 820 830Z',
    ),
  ]);

  rc['w-star-44'] = F([
    r(C.mint, 60, 840, 880, 50, 8),
    e(C.green, 360, 720, 200, 90),
    r(C.green, 160, 640, 400, 120, 26),
    p(C.green, 'M240 640C260 530 340 500 430 500C520 500 560 580 580 640Z'),
    p(
      C.sky,
      'M280 630C295 560 340 535 380 535L380 630ZM410 630L410 535C470 540 510 580 520 630Z',
    ),
    r(C.yellow, 140, 690, 30, 40, 8),
    e(I, 260, 770, 52, 52),
    e(C.violet, 260, 770, 20, 20, 0, { s: 'none' }),
    e(I, 470, 770, 52, 52),
    e(C.violet, 470, 770, 20, 20, 0, { s: 'none' }),
    bear(780, 840, 1.0),
  ]);

  rc['w-star-45'] = F([
    e(I, 470, 860, 220, 22, 0, { s: 'none' }),
    r(C.paper, 720, 100, 220, 190, 12),
    r(C.red, 780, 170, 100, 90, 4, { s: C.red, w: 7 }),
    r(C.paper, 800, 190, 60, 50, 2),
    ln('M830 290V340', I, 14),
    ln('M690 320Q780 300 870 320', C.orange, 16),
    ln('M705 330L730 420M780 330V430M855 330L830 420', C.paper, 9),
    human({
      x: 430,
      y: 800,
      h: 500,
      shirt: C.red,
      pants: C.red,
      skin: C.orange,
      hair: I,
      hairStyle: 'bald',
      legL: [
        [-14, 14],
        [-26, 30],
      ],
      legR: [
        [10, 18],
        [14, 38],
      ],
      armR: [
        [12, -12],
        [24, -30],
      ],
      armL: [
        [-16, 2],
        [-30, 8],
      ],
    }),
    e(C.orange, 700, 150, 55, 55, 0, { s: I }),
    ln(
      'M650 150H750M700 95V205M665 110C690 150 690 150 665 195M735 110C710 150 710 150 735 195',
      I,
      6,
    ),
  ]);

  rc['w-star-46'] = F([
    r(C.mint, 60, 840, 880, 50, 8),
    r(C.paper, 600, 360, 300, 480, 8, { s: I }),
    ln(
      'M620 400H880M620 460H880M620 520H880M620 580H880M620 640H880M620 700H880M620 760H880M650 360V840M710 360V840M770 360V840M830 360V840',
      C.violet,
      5,
    ),
    r(I, 590, 340, 320, 24, 6),
    ln('M590 360V840M910 360V840', I, 16),
    human({
      x: 330,
      y: 840,
      h: 600,
      shirt: C.sky,
      pants: I,
      skin: C.orange,
      hair: I,
      legL: [
        [-3, 23],
        [-6, 46],
      ],
      legR: [
        [16, 14],
        [30, 8],
      ],
      armL: [
        [-14, 8],
        [-26, 0],
      ],
      armR: [
        [12, 10],
        [24, 6],
      ],
    }),
    r(C.paper, 345, 420, 12, 56, 0, { s: 'none' }),
    r(C.paper, 308, 420, 12, 56, 0, { s: 'none' }),
    ball(570, 770, 56),
  ]);

  Object.assign(R, rc);
})(typeof globalThis !== 'undefined' ? globalThis : this);
