(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C,
    I = C.ink;

  function bg(c) {
    return [c, 'R-20 -20 1040 1040', { s: 'none' }];
  }
  function gnd(c, y) {
    return [
      c,
      'M-20 ' + y + 'L1020 ' + y + 'L1020 1020L-20 1020Z',
      { s: 'none' },
    ];
  }
  function line(d, c, w) {
    return ['none', d, { s: c || I, w: w || 7 }];
  }
  function dot(x, y, r, c, o) {
    return [c, 'E' + x + ' ' + y + ' ' + r + ' ' + r, o || { s: 'none' }];
  }
  // union of ellipses with one outer outline: list of [x,y,rx,ry]
  function blob(list, fill, w) {
    var d1 = '',
      i;
    var out = [];
    for (i = 0; i < list.length; i++)
      out.push([fill, 'E' + list[i].join(' '), { s: I, w: (w || 7) * 2 }]);
    for (i = 0; i < list.length; i++)
      out.push([fill, 'E' + list[i].join(' '), { s: 'none' }]);
    return out;
  }
  function cloud(x, y, s, c) {
    return blob(
      [
        [x - 90 * s, y + 10 * s, 70 * s, 50 * s],
        [x, y - 20 * s, 85 * s, 70 * s],
        [x + 95 * s, y + 10 * s, 70 * s, 50 * s],
        [x, y + 30 * s, 130 * s, 40 * s],
      ],
      c || C.paper,
    );
  }
  function sun(x, y, r, c, rays) {
    var out = [],
      i,
      a;
    if (rays)
      for (i = 0; i < 12; i++) {
        a = (i * Math.PI) / 6;
        out.push(
          line(
            'M' +
              (x + Math.cos(a) * (r + 25)) +
              ' ' +
              (y + Math.sin(a) * (r + 25)) +
              'L' +
              (x + Math.cos(a) * (r + 80)) +
              ' ' +
              (y + Math.sin(a) * (r + 80)),
            C.orange,
            16,
          ),
        );
      }
    out.push([c || C.yellow, 'E' + x + ' ' + y + ' ' + r + ' ' + r, {}]);
    return out;
  }
  function star(x, y, r, c) {
    var p = [],
      i,
      a,
      rr;
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 5;
      rr = i % 2 ? r * 0.45 : r;
      p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    return [c || C.yellow, K.poly(p), { w: 5 }];
  }
  function sparkle(x, y, r, c) {
    return [
      c || C.yellow,
      'M' +
        x +
        ' ' +
        (y - r) +
        'L' +
        (x + r * 0.25) +
        ' ' +
        (y - r * 0.25) +
        'L' +
        (x + r) +
        ' ' +
        y +
        'L' +
        (x + r * 0.25) +
        ' ' +
        (y + r * 0.25) +
        'L' +
        x +
        ' ' +
        (y + r) +
        'L' +
        (x - r * 0.25) +
        ' ' +
        (y + r * 0.25) +
        'L' +
        (x - r) +
        ' ' +
        y +
        'L' +
        (x - r * 0.25) +
        ' ' +
        (y - r * 0.25) +
        'Z',
      { w: 5 },
    ];
  }
  function heart(x, y, s, c) {
    return [
      c || C.red,
      'M' +
        x +
        ' ' +
        (y + 60 * s) +
        'C' +
        (x - 120 * s) +
        ' ' +
        (y - 20 * s) +
        ' ' +
        (x - 60 * s) +
        ' ' +
        (y - 100 * s) +
        ' ' +
        x +
        ' ' +
        (y - 40 * s) +
        'C' +
        (x + 60 * s) +
        ' ' +
        (y - 100 * s) +
        ' ' +
        (x + 120 * s) +
        ' ' +
        (y - 20 * s) +
        ' ' +
        x +
        ' ' +
        (y + 60 * s) +
        'Z',
      {},
    ];
  }
  function pine(x, y, s, c) {
    c = c || C.green;
    return [
      [
        C.brown,
        'R' + (x - 15 * s) + ' ' + (y - 60 * s) + ' ' + 30 * s + ' ' + 60 * s,
        {},
      ],
      [
        c,
        'M' +
          x +
          ' ' +
          (y - 330 * s) +
          'L' +
          (x + 90 * s) +
          ' ' +
          (y - 170 * s) +
          'L' +
          (x - 90 * s) +
          ' ' +
          (y - 170 * s) +
          'Z',
        {},
      ],
      [
        c,
        'M' +
          x +
          ' ' +
          (y - 250 * s) +
          'L' +
          (x + 120 * s) +
          ' ' +
          (y - 80 * s) +
          'L' +
          (x - 120 * s) +
          ' ' +
          (y - 80 * s) +
          'Z',
        {},
      ],
    ];
  }
  function house(x, y, s, wall, roof) {
    return [
      [
        wall,
        'R' +
          (x - 130 * s) +
          ' ' +
          (y - 170 * s) +
          ' ' +
          260 * s +
          ' ' +
          170 * s,
        {},
      ],
      [
        roof,
        'M' +
          (x - 165 * s) +
          ' ' +
          (y - 165 * s) +
          'L' +
          x +
          ' ' +
          (y - 300 * s) +
          'L' +
          (x + 165 * s) +
          ' ' +
          (y - 165 * s) +
          'Z',
        {},
      ],
      [
        C.brown,
        'R' + (x - 28 * s) + ' ' + (y - 100 * s) + ' ' + 56 * s + ' ' + 100 * s,
        {},
      ],
      [
        C.sky,
        'R' + (x + 55 * s) + ' ' + (y - 140 * s) + ' ' + 50 * s + ' ' + 50 * s,
        {},
      ],
      [
        C.sky,
        'R' + (x - 105 * s) + ' ' + (y - 140 * s) + ' ' + 50 * s + ' ' + 50 * s,
        {},
      ],
    ];
  }
  function spiral(cx, cy, rmax, turns, c, w) {
    var d = '',
      n = Math.round(turns * 28),
      i,
      t,
      a,
      r;
    for (i = 0; i <= n; i++) {
      t = i / n;
      a = turns * 2 * Math.PI * t;
      r = rmax * t;
      d +=
        (i ? 'L' : 'M') +
        Math.round(cx + Math.cos(a) * r) +
        ' ' +
        Math.round(cy + Math.sin(a) * r);
    }
    return ['none', d, { s: c, w: w }];
  }
  // simple person; (x,y)=feet, s=1 -> about 400 tall
  function man(x, y, s, shirt, pants, aL, aR, mood) {
    var sh = y - 270 * s,
      out = [];
    out = out.concat(
      K.tube(
        [
          [x - 22 * s, y - 10 * s],
          [x - 20 * s, y - 150 * s],
        ],
        38 * s,
        pants,
      ),
    );
    out = out.concat(
      K.tube(
        [
          [x + 22 * s, y - 10 * s],
          [x + 20 * s, y - 150 * s],
        ],
        38 * s,
        pants,
      ),
    );
    out = out.concat(
      K.tube(
        [
          [x - 40 * s, sh],
          [x - 40 * s + aL[0] * s, sh + aL[1] * s],
        ],
        28 * s,
        shirt,
      ),
    );
    out = out.concat(
      K.tube(
        [
          [x + 40 * s, sh],
          [x + 40 * s + aR[0] * s, sh + aR[1] * s],
        ],
        28 * s,
        shirt,
      ),
    );
    out.push([
      shirt,
      'R' +
        (x - 48 * s) +
        ' ' +
        (y - 295 * s) +
        ' ' +
        96 * s +
        ' ' +
        160 * s +
        ' ' +
        28 * s,
      {},
    ]);
    out.push([
      C.yellow,
      'E' + x + ' ' + (y - 345 * s) + ' ' + 48 * s + ' ' + 52 * s,
      {},
    ]);
    out.push([
      I,
      'M' +
        (x - 50 * s) +
        ' ' +
        (y - 350 * s) +
        'C' +
        (x - 50 * s) +
        ' ' +
        (y - 425 * s) +
        ' ' +
        (x + 50 * s) +
        ' ' +
        (y - 425 * s) +
        ' ' +
        (x + 50 * s) +
        ' ' +
        (y - 350 * s) +
        'C' +
        (x + 20 * s) +
        ' ' +
        (y - 375 * s) +
        ' ' +
        (x - 20 * s) +
        ' ' +
        (y - 375 * s) +
        ' ' +
        (x - 50 * s) +
        ' ' +
        (y - 350 * s) +
        'Z',
      { s: 'none' },
    ]);
    out.push(dot(x - 18 * s, y - 340 * s, 6 * s, I));
    out.push(dot(x + 18 * s, y - 340 * s, 6 * s, I));
    if (mood === 'open')
      out.push([
        C.red,
        'E' + x + ' ' + (y - 315 * s) + ' ' + 12 * s + ' ' + 16 * s,
        { w: 5 },
      ]);
    else if (mood === 'wavy')
      out.push(
        line(
          'M' +
            (x - 22 * s) +
            ' ' +
            (y - 315 * s) +
            'Q' +
            (x - 10 * s) +
            ' ' +
            (y - 330 * s) +
            ' ' +
            x +
            ' ' +
            (y - 315 * s) +
            'T' +
            (x + 22 * s) +
            ' ' +
            (y - 315 * s),
          I,
          6,
        ),
      );
    else
      out.push(
        line(
          'M' +
            (x - 20 * s) +
            ' ' +
            (y - 322 * s) +
            'Q' +
            x +
            ' ' +
            (y - 298 * s) +
            ' ' +
            (x + 20 * s) +
            ' ' +
            (y - 322 * s),
          I,
          6,
        ),
      );
    return out;
  }
  // horse facing right, (x,y)=ground under body
  function horse(x, y, s, col, mane) {
    var o = [];
    o = o.concat(
      K.tube(
        [
          [x - 80 * s, y - 120 * s],
          [x - 90 * s, y - 10 * s],
        ],
        30 * s,
        col,
      ),
    );
    o = o.concat(
      K.tube(
        [
          [x + 80 * s, y - 120 * s],
          [x + 90 * s, y - 10 * s],
        ],
        30 * s,
        col,
      ),
    );
    o = o.concat(
      K.tube(
        [
          [x - 40 * s, y - 120 * s],
          [x - 40 * s, y],
        ],
        30 * s,
        col,
      ),
    );
    o = o.concat(
      K.tube(
        [
          [x + 45 * s, y - 120 * s],
          [x + 45 * s, y],
        ],
        30 * s,
        col,
      ),
    );
    o = o.concat(
      K.tube(
        [
          [x - 120 * s, y - 180 * s],
          [x - 170 * s, y - 100 * s],
        ],
        20 * s,
        mane,
      ),
    );
    o.push([
      col,
      'E' + x + ' ' + (y - 170 * s) + ' ' + 125 * s + ' ' + 60 * s,
      {},
    ]);
    o.push([
      col,
      'M' +
        (x + 70 * s) +
        ' ' +
        (y - 190 * s) +
        'L' +
        (x + 130 * s) +
        ' ' +
        (y - 310 * s) +
        'L' +
        (x + 175 * s) +
        ' ' +
        (y - 270 * s) +
        'L' +
        (x + 130 * s) +
        ' ' +
        (y - 170 * s) +
        'Z',
      {},
    ]);
    o.push([
      col,
      'M' +
        (x + 120 * s) +
        ' ' +
        (y - 320 * s) +
        'L' +
        (x + 215 * s) +
        ' ' +
        (y - 265 * s) +
        'L' +
        (x + 200 * s) +
        ' ' +
        (y - 235 * s) +
        'L' +
        (x + 130 * s) +
        ' ' +
        (y - 260 * s) +
        'Z',
      {},
    ]);
    o.push([
      mane,
      'M' +
        (x + 100 * s) +
        ' ' +
        (y - 330 * s) +
        'L' +
        (x + 125 * s) +
        ' ' +
        (y - 370 * s) +
        'L' +
        (x + 140 * s) +
        ' ' +
        (y - 315 * s) +
        'Z',
      {},
    ]);
    o.push(
      line(
        'M' +
          (x + 80 * s) +
          ' ' +
          (y - 215 * s) +
          'L' +
          (x + 125 * s) +
          ' ' +
          (y - 310 * s),
        mane,
        16 * s,
      ),
    );
    o.push(dot(x + 150 * s, y - 285 * s, 7 * s, C.paper, { w: 4 }));
    o.push(dot(x + 152 * s, y - 285 * s, 3.5 * s, I));
    return o;
  }

  var wavePath =
    'M-20 1020L-20 640C150 640 260 540 330 400C400 250 560 170 700 230C830 285 840 440 740 460C660 475 630 390 690 360C610 320 520 390 530 500C540 620 700 700 1020 720L1020 1020Z';
  var wave = [
    [C.blue, wavePath, { b: 1 }],
    [
      C.sky,
      'M-20 760C200 740 350 640 400 520C430 600 520 700 620 740C500 800 200 860 -20 860Z',
      { i: 1, s: 'none' },
    ],
    [
      C.paper,
      'M330 400C400 250 560 170 700 230C830 285 840 440 740 460C660 475 630 390 690 360C640 330 590 330 560 360C520 290 450 300 420 360C390 330 360 350 330 400Z',
      { i: 1, s: 'none' },
    ],
  ];

  var STR = function (d, w) {
    return line(d, I, w || 7);
  };

  Object.assign(R, {
    'w-idiom-76': [
      // 半斤八兩
      gnd(C.mint, 880),
      [
        'R380 840 240 50 18'.length ? C.brown : C.brown,
        'R380 840 240 50 18',
        {},
      ],
      [C.brown, 'R478 260 44 590 10', {}],
      line(
        'M200 268L100 560M200 268L300 560M800 268L700 560M800 268L900 560',
        I,
        7,
      ),
      [C.yellow, 'M70 560L330 560C320 660 80 660 70 560Z', {}],
      [C.yellow, 'M670 560L930 560C920 660 680 660 670 560Z', {}],
      [C.orange, 'R160 240 680 40 18', {}],
      [C.red, 'E200 505 55 55', {}],
      [C.orange, 'E800 505 55 55', {}],
      line('M200 450L210 430', C.brown, 10),
      [C.mint, 'M215 435C240 410 260 420 265 430C250 445 230 445 215 435Z', {}],
      [C.yellow, 'E500 250 34 34', {}],
    ],
    'w-idiom-77': [
      // 瓜熟蒂落
      bg(C.sky),
      gnd(C.mint, 800),
      K.tube(
        [
          [-20, 140],
          [300, 190],
          [520, 120],
          [760, 180],
          [1020, 130],
        ],
        26,
        C.green,
      ),
      [C.mint, 'E300 250 70 36 -40', {}],
      [C.mint, 'E720 245 70 36 40', {}],
      K.tube(
        [
          [520, 125],
          [520, 250],
        ],
        18,
        C.brown,
      ),
      [C.green, 'E520 610 250 180', { b: 1 }],
      [
        C.mint,
        'M370 450C340 560 350 680 400 760L460 775C410 680 410 560 440 440Z',
        { i: 1, s: 'none' },
      ],
      [
        C.mint,
        'M600 440C630 560 620 680 580 775L640 760C690 680 700 560 660 450Z',
        { i: 1, s: 'none' },
      ],
      [C.mint, 'M500 425L500 800L540 800L540 425Z', { i: 1, s: 'none' }],
      K.tube(
        [
          [520, 435],
          [545, 380],
        ],
        16,
        C.brown,
      ),
      [C.red, 'E700 255 6 6', { s: 'none' }],
    ],
    'w-idiom-78': [
      // 坐井觀天
      gnd(C.mint, 520),
      [C.violet, 'R230 340 540 540 14', {}],
      [C.blue, 'R340 360 320 520', {}],
      [C.violet, 'E500 345 270 45', {}],
      [C.blue, 'E500 345 160 26', { s: I }],
      [C.green, 'E350 800 36 26', {}],
      [C.green, 'E650 800 36 26', {}],
      [C.green, 'E500 770 100 70', {}],
      [C.paper, 'E462 700 26 26', { w: 5 }],
      [C.paper, 'E538 700 26 26', { w: 5 }],
      dot(462, 692, 11, I),
      dot(538, 692, 11, I),
      line('M455 750Q500 780 545 750', I, 7),
      [C.sky, 'E500 140 130 130', {}],
      dot(560, 100, 36, C.yellow, { w: 5 }),
      [C.paper, 'E430 170 55 28', { s: 'none' }],
      line('M450 255L420 330M550 255L580 330', C.sky, 16),
    ],
    'w-idiom-79': [
      // 目不轉睛
      [
        C.paper,
        'M110 330C300 150 700 150 890 330C700 510 300 510 110 330Z',
        { b: 1 },
      ],
      [C.blue, 'E500 360 105 105', { i: 1, s: 'none' }],
      [I, 'E500 360 50 50', { i: 1, s: 'none' }],
      [C.paper, 'E470 330 20 20', { i: 1, s: 'none' }],
      line('M130 140C350 20 650 20 870 140', C.brown, 34),
      line('M110 330C300 150 700 150 890 330C700 510 300 510 110 330Z', I, 12),
      line('M430 500L440 700M570 500L560 700', C.sky, 16),
      [C.red, 'E500 820 150 150', {}],
      [C.paper, 'E500 820 100 100', {}],
      [C.red, 'E500 820 50 50', {}],
    ],
    'w-idiom-80': [
      // 聚沙成塔
      bg(C.sky),
      gnd(C.yellow, 800),
      sun(850, 150, 70, C.yellow, true),
      [C.yellow, 'M60 810C120 700 240 700 310 810Z', {}],
      [C.yellow, 'M720 810C760 740 860 740 900 810Z', {}],
      [C.yellow, 'M280 810L330 620L670 620L720 810Z', { b: 1 }],
      [C.orange, 'M560 620L670 620L720 810L600 810Z', { i: 1, s: 'none' }],
      [C.yellow, 'M360 620L390 450L610 450L640 620Z', { b: 1 }],
      [C.orange, 'M540 450L610 450L640 620L560 620Z', { i: 1, s: 'none' }],
      [C.yellow, 'M410 450L440 300L560 300L590 450Z', {}],
      [C.yellow, 'R425 270 36 34 6', {}],
      [C.yellow, 'R482 270 36 34 6', {}],
      [C.yellow, 'R539 270 36 34 6', {}],
      line('M500 270L500 150', C.brown, 16),
      [C.red, 'M500 150L620 195L500 240Z', {}],
      [
        I,
        'M470 720L470 800L530 800L530 720C530 680 470 680 470 720Z',
        { s: 'none' },
      ],
      [I, 'E500 540 18 28', { s: 'none' }],
      [I, 'E500 380 14 24', { s: 'none' }],
      [C.blue, 'M770 700L890 700L870 800L790 800Z', {}],
      [C.red, 'R760 685 140 24 8', {}],
    ],
    'w-idiom-81': [
      // 眼花撩亂
      [C.yellow, 'E500 520 210 230', {}],
      [C.paper, 'E410 470 62 62', {}],
      [C.paper, 'E590 470 62 62', {}],
      spiral(410, 470, 52, 2.5, I, 7),
      spiral(590, 470, 52, 2.5, I, 7),
      line('M390 640Q440 590 500 640T610 640', I, 7),
      star(130, 200, 60, C.yellow),
      star(870, 300, 55, C.pink),
      star(160, 820, 55, C.orange),
      dot(260, 110, 38, C.red, { w: 5 }),
      dot(780, 120, 40, C.sky, { w: 5 }),
      dot(880, 640, 40, C.mint, { w: 5 }),
      dot(100, 520, 36, C.violet, { w: 5 }),
      dot(820, 860, 36, C.red, { w: 5 }),
      dot(500, 940, 34, C.blue, { w: 5 }),
      sparkle(500, 100, 50, C.pink),
      sparkle(930, 480, 40, C.yellow),
    ],
    'w-idiom-82': [
      // 柳暗花明
      bg(C.sky),
      sun(820, 170, 70, C.yellow, true),
      [C.mint, 'E800 860 360 180', {}],
      [C.green, 'E220 880 380 200', {}],
      [
        C.yellow,
        'M380 1020C500 880 540 810 680 740L790 740C660 820 700 900 650 1020Z',
        {},
      ],
      K.tube(
        [
          [230, 800],
          [235, 560],
          [265, 340],
        ],
        56,
        C.brown,
      ),
      [C.green, 'E260 320 190 80', {}],
      K.tube(
        [
          [150, 340],
          [90, 480],
          [100, 640],
        ],
        16,
        C.mint,
      ),
      K.tube(
        [
          [210, 380],
          [180, 540],
          [190, 700],
        ],
        16,
        C.mint,
      ),
      K.tube(
        [
          [300, 380],
          [320, 540],
          [310, 700],
        ],
        16,
        C.mint,
      ),
      K.tube(
        [
          [370, 340],
          [420, 480],
          [410, 620],
        ],
        16,
        C.mint,
      ),
      [C.red, 'E720 640 34 34', {}],
      [C.yellow, 'E720 640 12 12', { s: 'none' }],
      [C.pink, 'E830 700 36 36', {}],
      [C.yellow, 'E830 700 12 12', { s: 'none' }],
      [C.red, 'E920 650 30 30', {}],
      [C.pink, 'E640 700 30 30', {}],
      [C.orange, 'E930 780 32 32', {}],
      [C.pink, 'E560 730 26 26', {}],
    ],
    'w-idiom-83': [
      // 開門見山
      gnd(C.mint, 880),
      [C.brown, 'R200 110 600 790 10', {}],
      [C.sky, 'R245 155 510 700', { b: 1 }],
      [C.green, 'M245 700L420 330L600 700Z', { i: 1 }],
      [C.blue, 'M480 700L650 430L760 600L760 700Z', { i: 1 }],
      [C.paper, 'M420 330L470 420L420 400L370 430Z', { i: 1, s: 'none' }],
      [C.mint, 'R245 700 510 160', { i: 1, s: 'none' }],
      [C.yellow, 'E650 270 45 45', { i: 1, s: 'none' }],
      [C.orange, 'M245 155L70 60L70 940L245 855Z', {}],
      [C.brown, 'M110 180L205 230L205 790L110 840Z', { w: 5 }],
      dot(130, 520, 15, C.yellow, { w: 5 }),
    ],
    'w-idiom-84': [
      // 一飛沖天
      bg(C.sky),
      cloud(250, 880, 1.6, C.paper),
      cloud(780, 900, 1.5, C.paper),
      sun(150, 160, 60, C.yellow, true),
      line(
        'M300 800C330 700 330 650 340 600M250 750C270 700 270 680 280 640',
        C.paper,
        16,
      ),
    ].concat(
      K.T(
        [
          [
            C.blue,
            'M450 480C400 300 330 250 220 220C290 340 320 420 370 510Z',
            {},
          ],
          [C.blue, 'M380 500L230 560L260 470Z', {}],
          [C.blue, 'E510 510 150 75', {}],
          [C.sky, 'E500 530 100 40', { s: 'none' }],
          [C.blue, 'E650 450 58 54', {}],
          [C.orange, 'M695 435L775 470L690 485Z', {}],
          dot(665, 438, 12, C.paper, { w: 4 }),
          dot(668, 438, 6, I),
          [
            C.sky,
            'M470 470C430 330 380 300 330 280C380 360 400 420 430 490Z',
            { s: 'none' },
          ],
        ],
        { rot: -45, cx: 500, cy: 500, dx: 60, dy: -20 },
      ),
    ),
    'w-idiom-85': [
      // 生龍活虎
      bg(C.sky),
      gnd(C.mint, 850),
      line(
        'M90 330C170 120 260 120 330 260C400 400 460 400 530 250C580 150 620 190 660 290',
        I,
        64,
      ),
      line(
        'M90 330C170 120 260 120 330 260C400 400 460 400 530 250C580 150 620 190 660 290',
        C.green,
        50,
      ),
      [C.green, 'E730 290 80 55 -15', {}],
      [C.green, 'M700 250L690 170L740 220Z', {}],
      [C.green, 'M770 240L790 170L810 240Z', {}],
      dot(750, 275, 11, C.yellow, { w: 4 }),
      dot(752, 275, 5, I),
      line('M800 320Q870 330 900 300M795 335Q860 370 900 360', C.orange, 12),

      K.tube(
        [
          [220, 700],
          [100, 620],
          [110, 520],
        ],
        30,
        C.orange,
      ),
      K.tube(
        [
          [330, 850],
          [335, 720],
        ],
        50,
        C.orange,
      ),
      K.tube(
        [
          [600, 850],
          [595, 720],
        ],
        50,
        C.orange,
      ),
      K.tube(
        [
          [480, 850],
          [480, 730],
        ],
        50,
        C.orange,
      ),
      K.tube(
        [
          [260, 850],
          [265, 730],
        ],
        50,
        C.orange,
      ),
      [C.orange, 'E430 690 230 110', { b: 1 }],
      [C.paper, 'E430 770 150 40', { i: 1, s: 'none' }],
      [
        I,
        'M300 590L330 600L320 700L290 690ZM400 585L430 590L425 700L395 700ZM500 590L530 600L525 700L495 700Z',
        { i: 1, s: 'none' },
      ],
      [C.orange, 'E670 600 105 95', {}],
      [C.orange, 'M590 530L600 460L650 520ZM720 525L750 470L765 545Z', {}],
      [C.paper, 'E690 640 60 40', { s: 'none' }],
      dot(640, 585, 11, C.yellow, { w: 4 }),
      dot(705, 585, 11, C.yellow, { w: 4 }),
      dot(641, 585, 5, I),
      dot(704, 585, 5, I),
      [C.pink, 'M672 620L695 620L683 635Z', { w: 4 }],
      [I, 'M610 550L640 570L615 575ZM735 560L710 570L740 580Z', { s: 'none' }],
    ],
    'w-idiom-86': [
      // 害群之馬
      gnd(C.mint, 840),
      horse(780, 760, 0.6, C.orange, C.brown),
      horse(600, 800, 0.7, C.orange, C.brown),
      line('M30 700L30 850M180 690L180 850', C.brown, 34),
      [C.brown, 'R-20 730 220 28', {}],
      [C.brown, 'M30 700L190 640L200 670L40 720Z', {}],
      horse(330, 930, 0.95, I, C.red),
      sparkle(130, 560, 30, C.yellow),
    ],
    'w-idiom-87': [
      // 山明水秀
      bg(C.sky),
      sun(820, 150, 65, C.yellow, true),
      [C.blue, 'M-20 640L220 280L440 640Z', {}],
      [C.green, 'M200 640L470 220L760 640Z', {}],
      [C.mint, 'M520 640L780 360L1020 640Z', {}],
      [C.paper, 'M470 220L520 320L470 300L430 330Z', { s: 'none' }],
      [C.blue, 'R-20 640 1040 400', { s: 'none' }],
      line(
        'M120 760Q170 730 220 760T320 760M600 880Q650 850 700 880T800 880M300 940Q350 910 400 940T500 940',
        C.sky,
        12,
      ),
      [C.brown, 'R130 560 28 100', {}],
      [C.green, 'E144 530 85 70', {}],
      [C.orange, 'M620 740L840 740L800 800L660 800Z', {}],
      line('M730 740L730 650', C.brown, 12),
      [C.red, 'M730 650L800 700L730 700Z', {}],
    ],
    'w-idiom-88': [
      // 三心二意
      gnd(C.mint, 900),
    ].concat(
      man(500, 900, 1.05, C.sky, C.blue, [-70, -90], [70, -90], 'wavy'),
      [
        dot(430, 430, 22, C.paper, { w: 6 }),
        dot(460, 380, 14, C.paper, { w: 6 }),
      ],
      cloud(500, 190, 1.7, C.paper),
      [
        heart(380, 190, 0.55, C.red),
        heart(500, 200, 0.55, C.pink),
        heart(620, 190, 0.55, C.red),
        star(440, 280, 36, C.yellow),
        star(560, 285, 36, C.yellow),
      ],
    ),
    'w-idiom-89': [
      // 一心一意
      gnd(C.mint, 900),
      line('M730 900L730 640', C.brown, 34),
      [C.red, 'E730 480 190 190', {}],
      [C.paper, 'E730 480 130 130', {}],
      [C.red, 'E730 480 70 70', {}],
      line('M570 480L800 480', I, 16),
      [C.paper, 'M560 480L610 455L610 505Z', {}],
      [C.violet, 'M800 480L860 440L850 480L860 520Z', {}],
    ].concat(
      man(230, 900, 1.05, C.orange, C.blue, [-30, 100], [120, -20], 'smile'),
      [heart(230, 330, 0.9, C.red)],
    ),
    'w-idiom-90': [
      // 眼明手快
      [
        C.paper,
        'M60 260C180 120 440 120 560 260C440 400 180 400 60 260Z',
        { b: 1 },
      ],
      [C.blue, 'E350 290 78 78', { i: 1, s: 'none' }],
      [I, 'E350 290 36 36', { i: 1, s: 'none' }],
      [C.paper, 'E335 275 13 13', { i: 1, s: 'none' }],
      line('M80 120C200 40 420 40 540 120', C.brown, 24),
      line('M60 260C180 120 440 120 560 260C440 400 180 400 60 260Z', I, 10),
      K.tube(
        [
          [600, 700],
          [570, 560],
        ],
        54,
        C.yellow,
      ),
      K.tube(
        [
          [690, 700],
          [690, 540],
        ],
        54,
        C.yellow,
      ),
      K.tube(
        [
          [780, 700],
          [800, 560],
        ],
        54,
        C.yellow,
      ),
      K.tube(
        [
          [860, 740],
          [900, 640],
        ],
        50,
        C.yellow,
      ),
      K.tube(
        [
          [560, 780],
          [480, 690],
        ],
        50,
        C.yellow,
      ),
      [C.yellow, 'E710 780 150 140', {}],
      [C.red, 'E700 420 85 85', {}],
      line('M640 400C660 370 700 360 730 372', C.paper, 12),
      line('M500 520L530 560M880 500L850 540M700 270L700 310', C.orange, 16),
    ],
    'w-idiom-91': [
      // 大開眼界
      [C.yellow, 'E500 320 200 215', {}],
      [C.paper, 'E415 300 68 78', {}],
      [C.paper, 'E585 300 68 78', {}],
      dot(425, 305, 28, I),
      dot(575, 305, 28, I),
      dot(435, 292, 9, C.paper),
      dot(585, 292, 9, C.paper),
      line('M350 170Q415 100 480 160M520 160Q585 100 650 170', C.brown, 16),
      [C.red, 'E500 450 42 55', { w: 7 }],
      [C.blue, 'E500 800 165 165', { b: 1 }],
      [
        C.green,
        'M400 700C450 660 520 700 500 760C480 800 420 780 400 700ZM540 800C590 770 640 810 620 880C580 900 540 860 540 800Z',
        { i: 1, s: 'none' },
      ],
      sparkle(180, 560, 50, C.yellow),
      sparkle(830, 580, 50, C.pink),
      sparkle(130, 180, 36, C.sky),
      sparkle(880, 150, 40, C.orange),
    ],
    'w-phenomenon-0': [
      // 下雪
      bg(C.sky),
      gnd(C.paper, 760),
      pine(160, 780, 1, C.green),
      pine(330, 800, 0.8, C.green),
      [C.paper, 'E700 710 110 100', {}],
      [C.paper, 'E700 540 78 72', {}],
      [
        C.red,
        'M625 590C680 620 730 620 775 590L775 625C730 650 680 650 625 625Z',
        {},
      ],
      dot(675, 525, 7, I),
      dot(725, 525, 7, I),
      [C.orange, 'M700 545L755 560L700 572Z', { w: 5 }],
      dot(700, 690, 9, I),
      dot(700, 730, 9, I),
      K.tube(
        [
          [630, 680],
          [540, 620],
        ],
        12,
        C.brown,
      ),
      K.tube(
        [
          [770, 680],
          [860, 620],
        ],
        12,
        C.brown,
      ),
      dot(60, 100, 18, C.paper, { w: 5 }),
      dot(240, 200, 16, C.paper, { w: 5 }),
      dot(420, 90, 18, C.paper, { w: 5 }),
      dot(580, 240, 16, C.paper, { w: 5 }),
      dot(780, 120, 18, C.paper, { w: 5 }),
      dot(930, 260, 16, C.paper, { w: 5 }),
      dot(120, 400, 16, C.paper, { w: 5 }),
      dot(480, 420, 18, C.paper, { w: 5 }),
      dot(900, 450, 16, C.paper, { w: 5 }),
      dot(60, 560, 14, C.paper, { w: 5 }),
    ],
    'w-phenomenon-1': [
      // 日出
      bg(C.sky),
      [C.yellow, 'R-20 400 1040 260', { s: 'none' }],
      sun(500, 640, 170, C.orange, true),
      [C.blue, 'R-20 640 1040 400', { s: 'none' }],
      line('M-20 640L1020 640', I, 7),
      [C.yellow, 'R380 700 240 24 12', { s: 'none' }],
      [C.yellow, 'R420 770 160 24 12', { s: 'none' }],
      [C.yellow, 'R450 840 100 24 12', { s: 'none' }],
      line('M120 220Q150 190 180 220M180 220Q210 190 240 220', I, 7),
      cloud(780, 300, 0.9, C.paper),
    ],
    'w-phenomenon-2': [
      // 日落
      bg(C.pink),
      [C.orange, 'R-20 420 1040 600', { s: 'none' }],
      [C.red, 'E500 640 190 190', {}],
      [
        C.violet,
        'M-20 1020L-20 700C150 600 300 700 420 740C560 680 760 600 1020 720L1020 1020Z',
        {},
      ],
      [C.blue, 'M-20 1020L-20 840C250 760 600 900 1020 800L1020 1020Z', {}],
      pine(820, 800, 0.9, I),
      cloud(200, 250, 0.9, C.paper),
      line('M700 260Q730 230 760 260M760 260Q790 230 820 260', I, 7),
    ],
    'w-phenomenon-3': [
      // 海浪
      bg(C.sky),
      sun(850, 150, 60, C.yellow, false),
      cloud(200, 190, 0.9, C.paper),
    ].concat(wave, [
      line(wavePath, I, 7),
      [C.paper, 'E250 840 40 14', { s: 'none' }],
      [C.paper, 'E800 880 50 14', { s: 'none' }],
    ]),
    'w-phenomenon-4': [
      // 地震
      bg(C.sky),
      gnd(C.mint, 720),
      [C.brown, 'R-20 720 1040 300', { s: 'none' }],
    ].concat(
      K.T(house(280, 740, 1.3, C.yellow, C.red), { rot: 9, cx: 280, cy: 740 }),
      [
        [
          I,
          'M600 720L680 720L650 800L700 870L640 940L660 1020L600 1020L620 940L570 870L620 800Z',
          { s: 'none' },
        ],
        K.tube(
          [
            [800, 700],
            [800, 540],
          ],
          40,
          C.brown,
        )[0],
        K.tube(
          [
            [800, 700],
            [800, 540],
          ],
          40,
          C.brown,
        )[1],
        [C.green, 'E800 480 120 90', {}],
        line(
          'M30 400Q-10 460 30 520M100 360Q50 450 100 540M910 360Q960 450 910 540M980 400Q1010 460 980 520',
          I,
          7,
        ),
        [C.violet, 'R520 800 40 30', {}],
        [C.violet, 'R720 880 50 40', {}],
      ],
    ),
    'w-phenomenon-5': [
      // 颱風
      bg(C.sky),
      [C.blue, 'R-20 780 1040 300', { s: 'none' }],
      spiral(500, 400, 330, 2.6, I, 76),
      spiral(500, 400, 330, 2.6, C.paper, 60),
      [C.violet, 'E500 400 60 60', {}],
      line(
        'M80 800Q130 770 180 800T280 800M600 900Q650 870 700 900T800 900',
        C.sky,
        12,
      ),
      K.tube(
        [
          [860, 790],
          [880, 640],
          [830, 540],
        ],
        28,
        C.brown,
      ),
      [
        C.green,
        'M830 540C760 520 700 560 690 600C750 580 790 570 830 540ZM830 540C880 480 950 480 990 510C930 520 880 530 830 540Z',
        {},
      ],
      line('M120 600L90 700M300 640L270 740M420 700L390 800', C.sky, 12),
    ],
    'w-phenomenon-6': [
      // 雷雨
      bg(C.sky),
      gnd(C.mint, 880),
    ].concat(cloud(500, 230, 2.4, C.violet), [
      [
        C.yellow,
        'M540 400L380 640L490 640L400 880L650 560L530 560L640 400Z',
        {},
      ],
      line(
        'M200 480L170 580M280 520L250 620M720 480L690 580M800 520L770 620M880 460L850 560M140 650L110 750',
        C.blue,
        16,
      ),
      pine(120, 900, 0.7, C.green),
    ]),
    'w-phenomenon-7': [
      // 極光
      bg(C.blue),
      [
        C.mint,
        'M-20 520C200 300 380 450 520 260C650 90 800 200 1020 100L1020 330C800 420 700 330 560 500C420 680 200 520 -20 700Z',
        {},
      ],
      [
        C.violet,
        'M-20 330C150 180 300 250 420 100L520 60C420 220 300 330 150 420C80 450 20 440 -20 470Z',
        {},
      ],
      star(120, 120, 22, C.yellow),
      star(780, 480, 20, C.yellow),
      star(900, 120, 24, C.yellow),
      star(250, 560, 18, C.yellow),
      star(640, 80, 18, C.yellow),
      [
        C.paper,
        'M-20 1020L-20 780C200 700 400 800 560 760C760 700 900 760 1020 740L1020 1020Z',
        {},
      ],
      pine(180, 830, 0.8, C.green),
      pine(320, 850, 0.6, C.green),
      pine(820, 830, 0.9, C.green),
    ],
    'w-phenomenon-8': [
      // 濃霧
      gnd(C.paper, 700),
      K.tube(
        [
          [200, 740],
          [200, 300],
        ],
        40,
        C.violet,
      ),
      [C.violet, 'E200 260 120 150', {}],
      K.tube(
        [
          [520, 760],
          [520, 350],
        ],
        36,
        C.violet,
      ),
      [C.violet, 'E520 320 100 130', {}],
      K.tube(
        [
          [820, 740],
          [820, 250],
        ],
        44,
        C.violet,
      ),
      [C.violet, 'E820 210 130 160', {}],
      [
        C.paper,
        'M-20 540C150 500 250 580 400 540S650 500 800 550S950 520 1020 540L1020 660C900 700 750 640 600 680S300 710 150 670S0 680 -20 660Z',
        { s: C.violet },
      ],
      [
        C.paper,
        'M-20 800C150 760 250 840 400 800S650 760 800 810S950 780 1020 800L1020 940C900 980 750 920 600 960S300 990 150 950S0 960 -20 940Z',
        { s: C.violet },
      ],
      line('M100 150Q150 120 200 150M650 100Q700 70 750 100', C.violet, 7),
    ],
    'w-phenomenon-9': [
      // 月蝕
      bg(C.blue),
      [C.yellow, 'E500 470 240 240', { b: 1 }],
      [C.brown, 'E590 430 240 240', { i: 1, s: 'none' }],
      line('M500 230C650 230 740 350 740 470C740 640 620 710 500 710', I, 7),
      star(140, 140, 30, C.yellow),
      star(860, 160, 26, C.yellow),
      star(170, 800, 24, C.yellow),
      star(840, 830, 30, C.yellow),
      star(520, 90, 18, C.yellow),
      sparkle(120, 480, 26, C.paper),
      sparkle(900, 540, 24, C.paper),
    ],
    'w-phenomenon-10': [
      // 日蝕
      bg(C.blue),
      [C.orange, 'E500 480 280 280', { s: 'none' }],
      sun(500, 480, 190, C.yellow, true),
      [I, 'E560 480 180 180', {}],
      star(120, 140, 22, C.yellow),
      star(880, 140, 22, C.yellow),
      star(130, 860, 22, C.yellow),
      star(880, 860, 22, C.yellow),
    ],
    'w-phenomenon-11': [
      // 洪水
      bg(C.sky),
    ].concat(
      cloud(250, 150, 1.3, C.violet),
      cloud(740, 130, 1.2, C.violet),
      [
        line(
          'M150 280L130 350M280 290L260 360M650 270L630 340M780 290L760 360M900 270L880 340',
          C.blue,
          12,
        ),
      ],
      house(300, 800, 1.2, C.yellow, C.red),
      house(780, 800, 0.9, C.paper, C.orange),
      [
        K.tube(
          [
            [560, 700],
            [560, 580],
          ],
          30,
          C.brown,
        )[0],
        K.tube(
          [
            [560, 700],
            [560, 580],
          ],
          30,
          C.brown,
        )[1],
        [C.green, 'E560 540 80 70', {}],
        [
          C.blue,
          'M-20 640C100 600 200 680 320 640S520 600 640 650S860 600 1020 650L1020 1020L-20 1020Z',
          {},
        ],
        line(
          'M-20 640C100 600 200 680 320 640S520 600 640 650S860 600 1020 650',
          I,
          7,
        ),
        line(
          'M100 760Q150 730 200 760T300 760M600 860Q650 830 700 860T800 860',
          C.sky,
          12,
        ),
        [C.brown, 'R430 700 100 80 10', {}],
        line('M430 740L530 740M430 770L530 770', I, 5),
      ],
    ),
    'w-phenomenon-12': [
      // 山崩
      bg(C.sky),
      gnd(C.mint, 840),
      [C.brown, 'M-20 840L400 160L1020 840Z', {}],
      [
        C.orange,
        'M400 220L500 400L440 460L520 560L460 640L560 700L500 840L300 840L340 700L400 560L340 420Z',
        { i: 1, s: 'none' },
      ],
      [C.violet, 'E560 470 50 45', {}],
      [C.violet, 'E610 600 70 62', {}],
      [C.violet, 'E700 740 90 80', {}],
      line('M520 380L500 340M590 500L570 450M660 640L640 590', I, 7),
      cloud(480, 790, 0.7, C.paper),
      cloud(300, 800, 0.6, C.paper),
    ].concat(house(880, 900, 0.55, C.paper, C.red)),
    'w-phenomenon-13': [
      // 雪崩
      bg(C.sky),
      gnd(C.paper, 860),
      [C.violet, 'M-20 860L400 160L1020 860Z', {}],
      [C.paper, 'M400 160L520 330L440 340L340 330L300 360Z', { s: I }],
      blob(
        [
          [470, 420, 70, 55],
          [540, 520, 90, 70],
          [610, 630, 105, 80],
          [690, 740, 120, 90],
          [560, 700, 100, 70],
          [780, 830, 110, 70],
        ],
        C.paper,
      ),
      line('M450 300L520 400', I, 7),
      pine(180, 880, 0.55, C.green),
      pine(290, 880, 0.45, C.green),
      sparkle(900, 300, 30, C.paper),
    ],
    'w-phenomenon-14': [
      // 潮汐
      bg(C.sky),
      dot(830, 160, 80, C.yellow, {}),
      [C.blue, 'R-20 480 1040 540', { s: 'none' }],
      line('M-20 480L1020 480', I, 7),
      [
        C.yellow,
        'M-20 520C200 560 330 680 520 800C650 890 800 960 1020 1020L-20 1020Z',
        {},
      ],
      [
        C.sky,
        'M-20 510C200 540 340 650 540 780L450 800C300 720 200 640 -20 600Z',
        { s: 'none' },
      ],
      line(
        'M650 600Q700 570 750 600T850 600M720 740Q770 710 820 740T920 740',
        C.sky,
        12,
      ),
      [C.red, 'M860 330L860 470M810 390L860 330L910 390', {}],
      line('M860 470L860 330M815 390L860 330L905 390', C.red, 24),
      line('M120 380Q150 350 180 380M180 380Q210 350 240 380', I, 7),
    ],
    'w-phenomenon-15': [
      // 海嘯
      bg(C.violet),
      gnd(C.yellow, 880),
    ].concat(
      K.mirror(wave.concat([line(wavePath, I, 7)]), 500),
      house(200, 900, 0.8, C.paper, C.red),
      house(380, 900, 0.6, C.yellow, C.orange),
      [line('M880 900L880 800', C.brown, 24), [C.green, 'E880 780 60 40', {}]],
    ),
    'w-phenomenon-16': [
      // 冰雹
      bg(C.sky),
      gnd(C.mint, 860),
    ].concat(
      cloud(500, 160, 2.4, C.violet),
      house(500, 880, 1.1, C.yellow, C.brown),
      [
        [C.paper, 'E150 400 34 34', { w: 7 }],
        [C.paper, 'E320 460 38 38', { w: 7 }],
        [C.paper, 'E560 400 34 34', { w: 7 }],
        [C.paper, 'E760 440 38 38', { w: 7 }],
        [C.paper, 'E230 620 36 36', { w: 7 }],
        [C.paper, 'E680 610 34 34', { w: 7 }],
        [C.paper, 'E880 580 34 34', { w: 7 }],
        [C.paper, 'E80 650 32 32', { w: 7 }],
        [C.paper, 'E430 560 30 30', { w: 7 }],
        line('M150 360L140 330M320 420L310 390M760 400L750 370', C.blue, 7),
      ],
    ),
    'w-phenomenon-17': [
      // 乾旱
      bg(C.yellow),
      sun(800, 170, 100, C.orange, true),
      gnd(C.orange, 700),
      line(
        'M100 760L220 800L200 880L300 940M300 720L420 760L480 840L560 880L540 980M700 740L640 820L720 900L680 1000M880 760L820 840L900 900M420 860L340 920',
        I,
        7,
      ),
      K.tube(
        [
          [300, 760],
          [310, 480],
          [260, 330],
        ],
        44,
        C.brown,
      ),
      K.tube(
        [
          [308, 540],
          [420, 440],
          [450, 340],
        ],
        26,
        C.brown,
      ),
      K.tube(
        [
          [305, 600],
          [200, 520],
          [150, 440],
        ],
        24,
        C.brown,
      ),
      K.tube(
        [
          [300, 400],
          [350, 300],
        ],
        18,
        C.brown,
      ),
      line('M600 860L700 830L800 860', I, 7),
    ],
    'w-phenomenon-18': [
      // 晚霞
      [C.violet, 'R-20 -20 1040 330', { s: 'none' }],
      [C.pink, 'R-20 300 1040 220', { s: 'none' }],
      [C.orange, 'R-20 510 1040 250', { s: 'none' }],
      [C.yellow, 'R-20 750 1040 270', { s: 'none' }],
      dot(500, 780, 110, C.red, {}),
      [
        C.blue,
        'M-20 1020L-20 820C150 760 300 840 450 820C600 790 800 760 1020 840L1020 1020Z',
        {},
      ],
    ].concat(
      cloud(200, 330, 1.2, C.pink),
      cloud(760, 240, 1.4, C.orange),
      cloud(640, 540, 1.1, C.red),
      cloud(230, 620, 1, C.pink),
    ),
    'w-phenomenon-19': [
      // 彗星
      bg(C.blue),
      [
        C.orange,
        'M730 230C550 300 300 470 70 760C320 700 560 610 780 350Z',
        {},
      ],
      [
        C.yellow,
        'M740 260C560 340 330 500 200 690C390 630 590 530 760 340Z',
        { s: 'none' },
      ],
      [C.paper, 'E760 290 85 80', {}],
      [C.yellow, 'E775 300 40 36', { s: 'none' }],
      star(150, 150, 24, C.yellow),
      star(480, 120, 20, C.yellow),
      star(900, 560, 24, C.yellow),
      star(300, 880, 22, C.yellow),
      star(620, 800, 18, C.yellow),
      sparkle(900, 100, 34, C.paper),
      [
        C.violet,
        'M-20 1020L-20 900C200 850 400 920 600 900C800 880 900 900 1020 920L1020 1020Z',
        {},
      ],
    ],
    'w-phenomenon-20': [
      // 流星雨
      bg(C.blue),
      [C.yellow, 'M300 300L40 120L60 90Z', {}],
      dot(300, 300, 22, C.paper, { w: 5 }),
      [C.yellow, 'M600 400L300 180L330 150Z', {}],
      dot(600, 400, 24, C.paper, { w: 5 }),
      [C.yellow, 'M880 280L650 100L675 75Z', {}],
      dot(880, 280, 20, C.paper, { w: 5 }),
      [C.yellow, 'M480 620L300 480L325 455Z', {}],
      dot(480, 620, 18, C.paper, { w: 5 }),
      [C.yellow, 'M920 640L760 520L780 495Z', {}],
      dot(920, 640, 18, C.paper, { w: 5 }),
      star(150, 400, 20, C.yellow),
      star(700, 600, 18, C.yellow),
      star(80, 650, 18, C.yellow),
      [
        C.green,
        'M-20 1020L-20 820C200 760 400 860 600 820C800 780 900 820 1020 840L1020 1020Z',
        {},
      ],
      pine(200, 860, 0.8, I),
      pine(780, 860, 1, I),
    ],
    'w-phenomenon-21': [
      // 暴風雪
      bg(C.violet),
      gnd(C.paper, 780),
    ].concat(
      K.T(pine(230, 820, 1.1, C.green), { rot: 14, cx: 230, cy: 820 }),
      K.T(pine(650, 840, 0.9, C.green), { rot: 14, cx: 650, cy: 840 }),
      [
        line('M-20 200Q200 160 400 220T800 200T1020 230', C.paper, 16),
        line('M-20 400Q250 350 450 420T850 400', C.paper, 16),
        line('M200 540Q400 500 600 560T1020 540', C.paper, 16),
        line('M-20 640Q200 600 380 660T700 640', C.paper, 16),
        dot(120, 300, 14, C.paper, { w: 5 }),
        dot(500, 320, 14, C.paper, { w: 5 }),
        dot(900, 330, 14, C.paper, { w: 5 }),
        dot(780, 500, 14, C.paper, { w: 5 }),
        dot(80, 500, 14, C.paper, { w: 5 }),
        dot(930, 650, 14, C.paper, { w: 5 }),
      ],
    ),
    'w-phenomenon-22': [
      // 沙塵暴
      bg(C.yellow),
      gnd(C.orange, 800),
      blob(
        [
          [100, 640, 140, 170],
          [260, 560, 150, 250],
          [440, 500, 160, 320],
          [620, 460, 160, 380],
          [800, 480, 150, 340],
          [940, 540, 140, 280],
        ],
        C.orange,
      ),
      blob(
        [
          [200, 720, 130, 90],
          [400, 760, 150, 100],
          [620, 740, 140, 100],
          [820, 760, 130, 90],
        ],
        C.yellow,
      ),
      line('M-20 330Q150 290 300 350M700 200Q850 170 1000 230', C.paper, 16),
      K.tube(
        [
          [860, 900],
          [860, 800],
        ],
        20,
        C.green,
      )[0],
      K.tube(
        [
          [860, 900],
          [860, 800],
        ],
        20,
        C.green,
      )[1],
      line('M150 880Q300 850 450 880M500 940Q650 910 800 940', C.paper, 12),
    ],
    'w-phenomenon-23': [
      // 火山爆發
      bg(C.sky),
      gnd(C.mint, 860),
      blob(
        [
          [500, 150, 200, 110],
          [330, 220, 120, 90],
          [680, 220, 130, 90],
          [500, 270, 200, 70],
        ],
        C.violet,
      ),
      [C.brown, 'M110 880L400 410L600 410L890 880Z', {}],
      [C.red, 'M380 420L620 420L560 360L440 360Z', {}],
      [
        C.red,
        'M480 420L540 420L570 560L520 640L600 780L540 880L440 880L480 760L440 640L500 560Z',
        { s: I },
      ],
      [
        C.orange,
        'M440 360L400 250L470 320L500 230L530 320L600 250L560 360Z',
        {},
      ],
      dot(260, 360, 30, C.brown, { w: 7 }),
      dot(740, 330, 34, C.red, { w: 7 }),
      dot(180, 500, 24, C.red, { w: 7 }),
      dot(850, 500, 26, C.brown, { w: 7 }),
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
