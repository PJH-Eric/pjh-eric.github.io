(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;
  function P(pts) {
    return (
      'M' +
      pts
        .map(function (p) {
          return Math.round(p[0]) + ' ' + Math.round(p[1]);
        })
        .join('L') +
      'Z'
    );
  }
  function star(cx, cy, Ro, ri, n, rot) {
    var pts = [],
      i,
      a,
      r;
    for (i = 0; i < n * 2; i++) {
      a = (rot || 0) + (i * Math.PI) / n;
      r = i % 2 === 0 ? Ro : ri;
      pts.push([cx + r * Math.sin(a), cy - r * Math.cos(a)]);
    }
    return P(pts);
  }
  function U(fill, paths, w) {
    var a = [],
      b = [];
    paths.forEach(function (p) {
      a.push([fill, p, { w: w || 16 }]);
      b.push([fill, p, { s: 'none' }]);
    });
    return a.concat(b);
  }
  function cloud(x, y, s, fill) {
    var f = s / 100;
    function e(dx, dy, rx, ry) {
      return (
        'E' +
        Math.round(x + dx * f) +
        ' ' +
        Math.round(y + dy * f) +
        ' ' +
        Math.round(rx * f) +
        ' ' +
        Math.round(ry * f)
      );
    }
    return U(fill || C.paper, [
      e(-130, 20, 90, 70),
      e(0, -30, 110, 100),
      e(120, 10, 100, 80),
      e(0, 40, 230, 60),
    ]);
  }
  function rect(c, x, y, w, h) {
    return [c, 'R' + x + ' ' + y + ' ' + w + ' ' + h, { s: 'none' }];
  }
  var ground = function (y, c) {
    return [c || C.mint, 'R0 ' + y + ' 1000 ' + (1000 - y), { s: C.ink }];
  };

  var sunRays = [],
    i,
    a;
  for (i = 0; i < 8; i++) {
    a = (i * Math.PI) / 4;
    sunRays.push(
      P([
        [500 + 215 * Math.sin(a - 0.2), 500 - 215 * Math.cos(a - 0.2)],
        [500 + 340 * Math.sin(a), 500 - 340 * Math.cos(a)],
        [500 + 215 * Math.sin(a + 0.2), 500 - 215 * Math.cos(a + 0.2)],
      ]),
    );
  }
  var sunL = [[C.orange, sunRays.join(''), {}]].concat([
    [C.yellow, 'E500 500 190 190', { b: 1 }],
    [
      C.orange,
      'M640 330C760 480 700 660 540 700C700 620 740 480 640 330Z',
      { i: 1 },
    ],
    [C.paper, 'E420 420 30 50 45', { i: 1 }],
    ['none', 'M420 540Q500 600 580 540', { s: C.ink, w: 7 }],
    [C.ink, 'E440 470 12 16', { s: 'none' }],
    [C.ink, 'E560 470 12 16', { s: 'none' }],
  ]);

  var moonStars = [];
  [
    [200, 220, 40],
    [820, 200, 30],
    [790, 760, 36],
    [250, 780, 28],
  ].forEach(function (s) {
    moonStars.push([
      C.yellow,
      star(s[0], s[1], s[2], s[2] * 0.45, 5, 0),
      { w: 7 },
    ]);
  });
  var moonL = [[C.blue, 'R60 60 880 880 60', { b: 1 }]].concat(moonStars, [
    [
      C.yellow,
      'M600 190A320 320 0 1 0 820 680A250 250 0 1 1 600 190Z',
      { b: 1 },
    ],
    [
      C.orange,
      'M330 520C340 600 400 700 500 740C400 640 380 560 330 520Z',
      { i: 1, s: 'none' },
    ],
    [C.orange, 'E400 600 30 24', { i: 1 }],
    [C.orange, 'E470 420 20 16', { i: 1 }],
  ]);

  var starL = [
    [C.yellow, star(500, 520, 380, 160, 5, 0), { w: 16, b: 1 }],
    [C.orange, 'M500 520L500 140L610 400Z', { i: 1, s: 'none' }],
    [C.orange, 'M500 520L880 440L640 520Z', { i: 1, s: 'none' }],
    [C.orange, 'M500 520L770 880L560 640Z', { i: 1, s: 'none' }],
    [C.orange, 'M500 520L230 880L440 640Z', { i: 1, s: 'none' }],
    [C.orange, 'M500 520L120 440L360 520Z', { i: 1, s: 'none' }],
    [C.paper, 'E440 330 20 36 20', { i: 1 }],
  ];

  var rainDrops = [];
  [
    [270, 650],
    [400, 700],
    [530, 650],
    [660, 700],
    [330, 810],
    [470, 850],
    [600, 810],
    [730, 850],
  ].forEach(function (d) {
    rainDrops.push([
      'none',
      'M' + d[0] + ' ' + d[1] + 'L' + (d[0] - 40) + ' ' + (d[1] + 90),
      { s: C.blue, w: 16 },
    ]);
  });

  var rainbow = [[C.sky, 'R0 0 1000 1000', { s: 'none' }]];
  [
    [420, C.red],
    [350, C.orange],
    [280, C.yellow],
    [210, C.mint],
    [140, C.sky],
    [70, C.paper],
  ].forEach(function (b) {
    rainbow.push([
      b[1],
      'M' +
        (500 - b[0]) +
        ' 720A' +
        b[0] +
        ' ' +
        b[0] +
        ' 0 0 1 ' +
        (500 + b[0]) +
        ' 720Z',
      { w: 7 },
    ]);
  });
  rainbow = rainbow.concat(cloud(170, 740, 90), cloud(830, 740, 90));

  var petals = [],
    pc = [];
  for (i = 0; i < 6; i++) {
    a = (i * Math.PI) / 3;
    pc.push(
      'E' +
        Math.round(500 + 110 * Math.sin(a)) +
        ' ' +
        Math.round(330 - 110 * Math.cos(a)) +
        ' 65 100 ' +
        Math.round((a * 180) / Math.PI),
    );
  }
  petals = U(C.pink, pc, 7);

  var snowman = [
    [C.sky, 'R0 780 1000 220', { s: C.ink }],
    ['none', 'M280 560L130 480M720 560L870 470', { s: C.ink, w: 34 }],
    ['none', 'M280 560L130 480M720 560L870 470', { s: C.brown, w: 16 }],
  ].concat([
    [C.paper, 'E500 680 230 200'],
    [C.paper, 'E500 340 150 140'],
    [
      C.sky,
      'M300 760C400 820 600 820 700 760C650 880 350 880 300 760Z',
      { s: 'none' },
    ],
    [C.ink, 'R350 170 300 30 8'],
    [C.ink, 'R400 70 200 120 12'],
    [C.red, 'R400 180 200 18 6', { s: 'none' }],
    [C.ink, 'E450 320 12 14', { s: 'none' }],
    [C.ink, 'E550 320 12 14', { s: 'none' }],
    [C.orange, 'M500 350L600 375L500 395Z'],
    [C.red, 'R350 460 300 50 24'],
    [C.red, 'R540 480 70 160 20'],
    [C.ink, 'E500 600 16 16', { s: 'none' }],
    [C.ink, 'E500 680 16 16', { s: 'none' }],
    [C.ink, 'E500 760 16 16', { s: 'none' }],
  ]);

  var cactusSp = [];
  [
    [470, 330],
    [530, 400],
    [470, 480],
    [540, 560],
    [480, 640],
    [535, 270],
  ].forEach(function (p) {
    cactusSp.push('M' + p[0] + ' ' + p[1] + 'l12 -14');
  });
  var cactus = [ground(780, C.yellow)].concat(
    K.tube(
      [
        [380, 610],
        [270, 610],
        [270, 420],
      ],
      80,
      C.green,
    ),
    K.tube(
      [
        [620, 520],
        [730, 520],
        [730, 330],
      ],
      80,
      C.green,
    ),
    [
      [C.green, 'R380 180 240 620 120'],
      [C.mint, 'R410 220 50 520 25', { s: 'none' }],
      ['none', cactusSp.join(''), { s: C.ink, w: 7 }],
      [C.orange, 'M350 760L650 760L610 900L390 900Z'],
      [C.pink, 'E500 170 40 30'],
      [C.pink, 'E270 400 30 24'],
      [C.pink, 'E730 310 30 24'],
    ],
  );

  var mush = [
    [C.mint, 'R0 800 1000 200', { s: C.ink }],
    [C.paper, 'M380 480C370 640 340 760 300 800H700C660 760 630 640 620 480Z'],
    [
      C.red,
      'M120 500C120 280 300 170 500 170C700 170 880 280 880 500C880 530 800 540 500 540C200 540 120 530 120 500Z',
      { b: 1 },
    ],
    [C.paper, 'E330 330 70 55', { i: 1 }],
    [C.paper, 'E560 270 55 42', { i: 1 }],
    [C.paper, 'E720 400 60 45', { i: 1 }],
    [C.paper, 'E470 450 40 30', { i: 1 }],
    [C.paper, 'E200 450 40 30', { i: 1 }],
    [
      C.brown,
      'M700 190C830 270 880 400 870 500C800 540 700 540 640 540C760 420 780 300 700 190Z',
      { i: 1, s: 'none' },
    ],
  ];

  var mapR = [
    [500, 130],
    [565, 250],
    [660, 210],
    [635, 390],
    [820, 350],
    [750, 480],
    [870, 570],
    [560, 625],
  ];
  var mapPts = mapR.concat(
    mapR
      .slice()
      .reverse()
      .map(function (p) {
        return [1000 - p[0], p[1]];
      }),
  );
  var maple = [].concat(
    K.tube(
      [
        [500, 560],
        [500, 880],
      ],
      22,
      C.brown,
    ),
    [
      [C.red, P(mapPts), { b: 1, w: 16 }],
      [
        C.orange,
        P([
          [500, 130],
          [565, 250],
          [660, 210],
          [635, 390],
          [500, 400],
        ]),
        { i: 1, s: 'none' },
      ],
      [
        'none',
        'M500 620L500 220M500 480L690 330M500 480L310 330M500 560L770 540M500 560L230 540',
        { s: C.orange, w: 7 },
      ],
      [C.paper, 'E350 470 20 36 -50', { i: 1 }],
      [C.brown, 'E500 640 24 24'],
    ],
  );

  var tornado = [
    ['#7FB4DA', 'R0 0 1000 1000', { s: 'none' }],
    ground(870, C.mint),
    [
      C.violet,
      'M150 330L850 330C780 520 650 700 560 860L440 860C350 700 220 520 150 330Z',
      { b: 1, w: 16 },
    ],
    [
      'none',
      'M210 450Q500 520 790 450M270 570Q500 630 730 570M340 690Q500 740 660 690',
      { s: C.paper, w: 16 },
    ],
    [
      C.blue,
      'M60 340C60 200 200 160 330 190C400 100 600 100 680 190C820 160 940 220 940 340C940 400 60 400 60 340Z',
    ],
    [
      'none',
      'M300 800L260 780M700 790L750 760M350 840L320 830',
      { s: C.brown, w: 16 },
    ],
  ];
  tornado[0][0] = C.sky;

  var soccerL = [[C.paper, 'E500 500 330 330', { b: 1, w: 16 }]];
  var sLines = '',
    sPatch = [];
  for (i = 0; i < 5; i++) {
    a = (i * 2 * Math.PI) / 5;
    sLines +=
      'M' +
      Math.round(500 + 90 * Math.sin(a)) +
      ' ' +
      Math.round(500 - 90 * Math.cos(a)) +
      'L' +
      Math.round(500 + 240 * Math.sin(a)) +
      ' ' +
      Math.round(500 - 240 * Math.cos(a));
    var pa = a,
      cx = 500 + 340 * Math.sin(pa),
      cy = 500 - 340 * Math.cos(pa),
      pp = [],
      j;
    for (j = 0; j < 5; j++) {
      var q = pa + Math.PI + (j * 2 * Math.PI) / 5;
      pp.push([cx + 100 * Math.sin(q), cy - 100 * Math.cos(q)]);
    }
    sPatch.push([C.ink, P(pp), { i: 1, s: 'none' }]);
  }
  var cp = [];
  for (i = 0; i < 5; i++) {
    a = (i * 2 * Math.PI) / 5;
    cp.push([500 + 100 * Math.sin(a), 500 - 100 * Math.cos(a)]);
  }
  soccerL = soccerL.concat(sPatch, [
    ['none', sLines, { s: C.ink, w: 16 }],
    [C.ink, P(cp), { w: 16 }],
  ]);

  var bball = [
    [C.orange, 'E500 500 340 340', { b: 1, w: 16 }],
    [
      C.brown,
      'M740 270C840 400 840 640 700 800C830 700 880 500 740 270Z',
      { i: 1, s: 'none' },
    ],
    ['none', 'M160 500H840M500 160V840', { s: C.ink, w: 16 }],
    ['none', 'M265 260C400 380 400 620 265 740', { s: C.ink, w: 16 }],
    ['none', 'M735 260C600 380 600 620 735 740', { s: C.ink, w: 16 }],
    [C.paper, 'E350 340 24 44 40', { i: 1 }],
    ['none', 'E500 500 340 340', { s: C.ink, w: 16 }],
  ];

  var strings = [],
    rx = 170,
    ry = 230,
    xx,
    hh;
  for (xx = 350; xx <= 650; xx += 50) {
    hh = ry * Math.sqrt(1 - Math.pow((xx - 500) / rx, 2));
    strings.push(
      'M' +
        xx +
        ' ' +
        Math.round(330 - hh + 4) +
        'V' +
        Math.round(330 + hh - 4),
    );
  }
  for (var yy = 180; yy <= 480; yy += 50) {
    hh = rx * Math.sqrt(1 - Math.pow((yy - 330) / ry, 2));
    strings.push(
      'M' +
        Math.round(500 - hh + 4) +
        ' ' +
        yy +
        'H' +
        Math.round(500 + hh - 4),
    );
  }
  var racket = K.T(
    [
      [C.brown, 'R465 600 70 280 30'],
      [C.paper, 'M410 540L500 520L590 540L540 610H460Z', { s: C.ink }],
      [C.mint, 'E500 330 170 230', { s: 'none' }],
      ['none', strings.join(''), { s: C.ink, w: 7 }],
      ['none', 'E500 330 170 230', { s: C.ink, w: 50 }],
      ['none', 'E500 330 170 230', { s: C.red, w: 30 }],
      [C.paper, 'R460 610 80 50 10'],
    ],
    { rot: 35, cx: 500, cy: 500, s: 0.95 },
  );
  racket.push(
    [C.yellow, 'E770 760 80 80', { w: 16 }],
    ['none', 'M700 720Q770 770 700 820', { s: C.paper, w: 7 }],
  );

  var gStr = [];
  [482, 500, 518].forEach(function (x) {
    gStr.push('M' + x + ' 160V740');
  });
  var guitar = K.T(
    [
      [C.brown, 'R470 130 60 480 12'],
      [C.ink, 'R450 70 100 90 22'],
      [C.orange, 'E500 780 200 160', { b: 1 }],
      [C.orange, 'E500 590 150 120'],
      [C.orange, 'E500 780 200 160', { s: 'none' }],
      [
        C.brown,
        'M520 640C640 640 700 760 650 880C700 780 600 700 520 640Z',
        { i: 1, s: 'none' },
      ],
      [C.ink, 'E500 690 62 62'],
      [C.brown, 'R430 800 140 26 8'],
      ['none', gStr.join(''), { s: C.paper, w: 5 }],
      [C.paper, 'R470 150 60 12', { s: 'none' }],
    ],
    { rot: -35, cx: 500, cy: 500, s: 0.95 },
  );
  guitar.splice(5, 0, [C.orange, 'E500 590 150 120', { s: 'none' }]);

  var zig = 'M260 520L330 760L400 540L470 780L540 540L610 780L680 540L740 520';
  var drum = [].concat(
    K.tube(
      [
        [250, 120],
        [450, 410],
      ],
      36,
      C.brown,
    ),
    K.tube(
      [
        [750, 120],
        [550, 410],
      ],
      36,
      C.brown,
    ),
    [
      [C.red, 'M230 480V760A270 90 0 0 0 770 760V480Z'],
      [C.paper, 'M230 480V520A270 90 0 0 0 770 520V480Z', { s: 'none' }],
      ['none', zig, { s: C.paper, w: 16 }],
      [C.paper, 'M230 480V520A270 90 0 0 0 770 520', { s: 'none' }],
      ['none', 'M230 760A270 90 0 0 0 770 760', { s: C.ink, w: 7 }],
      [C.paper, 'E500 480 270 90'],
      [C.yellow, 'E500 480 220 62', { s: C.ink, w: 7 }],
    ],
  );
  drum = drum.slice(4, 6).concat(drum.slice(0, 4), drum.slice(6));
  drum = [drum[0], drum[1]].concat(drum.slice(2));

  var kite = [
    [
      'none',
      'M500 740C440 800 560 840 500 900C460 950 540 970 500 990',
      { s: C.ink, w: 7 },
    ],
    [C.red, 'M500 120L740 420L500 760L260 420Z', { b: 1, w: 16 }],
    [C.yellow, 'M500 420L740 420L500 760Z', { i: 1, s: 'none' }],
    [C.yellow, 'M500 120L500 420L260 420Z', { i: 1, s: 'none' }],
    ['none', 'M500 120V760M260 420H740', { s: C.ink, w: 7 }],
    [C.blue, 'M475 810L430 790L440 840Z', { w: 7 }],
    [C.blue, 'M520 880L570 860L560 910Z', { w: 7 }],
    ['none', 'M500 760C440 800 560 840 500 900', { s: C.ink, w: 7 }],
  ];
  kite.shift();
  kite.unshift([
    'none',
    'M500 760C440 800 560 840 500 900C460 950 540 960 500 970',
    { s: C.ink, w: 7 },
  ]);
  kite.pop();

  var swing = [ground(800, C.mint)].concat(
    K.tube(
      [
        [200, 200],
        [90, 800],
      ],
      40,
      C.brown,
    ),
    K.tube(
      [
        [200, 200],
        [310, 800],
      ],
      40,
      C.brown,
    ),
    K.tube(
      [
        [800, 200],
        [690, 800],
      ],
      40,
      C.brown,
    ),
    K.tube(
      [
        [800, 200],
        [910, 800],
      ],
      40,
      C.brown,
    ),
    K.tube(
      [
        [160, 200],
        [840, 200],
      ],
      50,
      C.brown,
    ),
    [
      ['none', 'M400 220V640M600 220V640', { s: C.ink, w: 16 }],
      [C.red, 'R340 630 320 50 16'],
    ],
  );

  var slide = [ground(830, C.mint)].concat(
    K.tube(
      [
        [180, 360],
        [140, 830],
      ],
      36,
      C.brown,
    ),
    K.tube(
      [
        [310, 360],
        [350, 830],
      ],
      36,
      C.brown,
    ),
    [
      [C.brown, 'R130 560 230 20', { s: C.ink }],
      [C.brown, 'R140 680 210 20', { s: C.ink }],
      [C.yellow, 'R120 300 260 50 12'],
    ],
    K.tube(
      [
        [330, 290],
        [480, 420],
        [620, 640],
        [880, 760],
      ],
      90,
      C.red,
    ),
    [[C.paper, 'M340 275L470 395', { s: 'none' }]],
  );
  slide.pop();

  var fw = [ground(850, C.mint)].concat(
    K.tube(
      [
        [500, 430],
        [330, 850],
      ],
      36,
      C.brown,
    ),
    K.tube(
      [
        [500, 430],
        [670, 850],
      ],
      36,
      C.brown,
    ),
    [
      ['none', 'E500 430 300 300', { s: C.ink, w: 34 }],
      ['none', 'E500 430 300 300', { s: C.sky, w: 16 }],
      ['none', 'E500 430 160 160', { s: C.ink, w: 16 }],
      [
        'none',
        'M500 130V730M200 430H800M288 218L712 642M712 218L288 642',
        { s: C.ink, w: 7 },
      ],
    ],
  );
  var gc = [
    C.red,
    C.yellow,
    C.mint,
    C.pink,
    C.orange,
    C.violet,
    C.blue,
    C.yellow,
  ];
  for (i = 0; i < 8; i++) {
    a = (i * Math.PI) / 4;
    fw.push([
      gc[i],
      'E' +
        Math.round(500 + 300 * Math.sin(a)) +
        ' ' +
        Math.round(430 - 300 * Math.cos(a)) +
        ' 42 42',
      { w: 7 },
    ]);
  }
  fw.push([C.paper, 'E500 430 36 36', { w: 7 }]);

  var dice = [
    [C.paper, 'M500 190L790 340L500 490L210 340Z', { b: 1, w: 16 }],
    [C.paper, 'M210 340L500 490V810L210 660Z', { w: 16 }],
    [C.sky, 'M500 490L790 340V660L500 810Z', { w: 16 }],
    [C.ink, 'E500 340 38 24', { s: 'none' }],
    [C.ink, 'E320 540 28 32', { s: 'none' }],
    [C.ink, 'E400 630 28 32', { s: 'none' }],
    [C.ink, 'E570 640 28 32', { s: 'none' }],
    [C.ink, 'E650 570 28 32', { s: 'none' }],
    [C.ink, 'E730 500 28 32', { s: 'none' }],
  ];
  dice.splice(1, 1, dice[1]);

  var heart =
    'M500 600C400 520 390 420 450 400C480 392 500 410 500 430C500 410 520 392 550 400C610 420 600 520 500 600Z';
  var card = function (fill) {
    return [fill, 'R360 220 280 420 28', {}];
  };
  var cards = [].concat(
    K.T(
      [
        card(C.blue),
        [C.paper, 'R395 255 210 350 14', { s: 'none' }],
        [C.sky, 'R415 275 170 310 10', { s: 'none' }],
      ],
      { rot: -24, cx: 500, cy: 800 },
    ),
    K.T(
      [
        card(C.red),
        [C.paper, 'R395 255 210 350 14', { s: 'none' }],
        [C.pink, 'R415 275 170 310 10', { s: 'none' }],
      ],
      { rot: 24, cx: 500, cy: 800 },
    ),
    [
      card(C.paper),
      [C.red, heart, { w: 7 }],
      [C.red, 'M410 270L428 270L419 284Z', { s: 'none' }],
      [C.red, 'M572 590L590 590L581 576Z', { s: 'none' }],
    ],
  );
  cards.push(['none', 'M395 262H445', { s: C.red, w: 7 }]);

  var puzzle = [
    [C.sky, 'M100 300H300V440A60 60 0 1 1 300 560V700H100Z', { w: 16 }],
    [
      C.orange,
      'M300 300H440A60 60 0 1 1 560 300H700V440A60 60 0 1 1 700 560V700H560A60 60 0 1 1 440 700H300V560A60 60 0 1 0 300 440Z',
      { b: 1, w: 16 },
    ],
    [C.paper, 'E380 380 26 40 40', { i: 1 }],
    [C.sky, 'E300 500 60 60', { w: 16 }],
    [C.orange, 'R290 440 60 120', { s: 'none' }],
  ];
  puzzle.splice(5, 1);
  puzzle = K.T(puzzle, { dx: 70 });
  puzzle.push([C.paper, 'E200 380 20 30 40', { s: 'none' }]);
  puzzle.splice(5, 0, [C.paper, 'E200 380 20 30 40', { s: 'none' }]);
  puzzle.pop();

  var note = [
    [C.yellow, 'E500 500 400 400', { w: 16 }],
    [C.ink, 'R385 250 24 500', { s: 'none' }],
    [C.ink, 'R755 190 24 500', { s: 'none' }],
    [C.ink, 'M385 250L779 180V280L385 350Z'],
    [C.ink, 'E320 760 90 62 -20'],
    [C.ink, 'E690 700 90 62 -20'],
    [C.paper, 'E300 750 30 14 -20', { s: 'none' }],
    [C.paper, 'E670 690 30 14 -20', { s: 'none' }],
  ];

  var mic = [
    [C.ink, 'M430 470L570 470L545 810Q500 850 455 810Z'],
    [C.violet, 'M470 500L490 500L478 790L470 790Z', { s: 'none' }],
    [C.red, 'R400 440 200 60 20'],
    [C.violet, 'E500 290 160 160', { b: 1, w: 16 }],
    [
      'none',
      'M340 290H660M360 200H640M360 380H640M500 130V450M420 150Q370 290 420 430M580 150Q630 290 580 430',
      { s: C.ink, w: 7 },
    ],
    [C.paper, 'E440 230 24 40 40', { i: 1 }],
    ['none', 'E500 290 160 160', { s: C.ink, w: 16 }],
  ];
  mic.splice(5, 1);

  var camera = [
    [C.violet, 'R340 190 190 120 30'],
    [C.blue, 'R130 290 740 480 56', { b: 1 }],
    [C.ink, 'R130 360 740 70', { i: 1, s: 'none' }],
    [C.yellow, 'R190 230 100 60 12'],
    [C.paper, 'E500 560 190 190', { w: 16 }],
    [C.violet, 'E500 560 150 150'],
    [C.sky, 'E500 560 100 100'],
    [C.paper, 'E460 520 24 34 45', { s: 'none' }],
    [C.red, 'E760 360 24 24'],
    [C.paper, 'R160 700 40 20 6', { s: 'none' }],
  ];
  camera.pop();

  var trophy = [
    ['none', 'M300 290H210C190 450 250 520 330 540', { s: C.ink, w: 50 }],
    ['none', 'M700 290H790C810 450 750 520 670 540', { s: C.ink, w: 50 }],
    ['none', 'M300 290H210C190 450 250 520 330 540', { s: C.yellow, w: 30 }],
    ['none', 'M700 290H790C810 450 750 520 670 540', { s: C.yellow, w: 30 }],
    [
      C.yellow,
      'M290 200H710V420C710 580 610 650 500 650C390 650 290 580 290 420Z',
      { b: 1, w: 16 },
    ],
    [
      C.orange,
      'M600 210C700 400 640 600 500 650C640 650 710 560 710 420V210Z',
      { i: 1, s: 'none' },
    ],
    [C.paper, 'E380 340 24 70 10', { i: 1 }],
    [C.red, star(500, 400, 85, 38, 5, 0), { w: 7 }],
    [C.yellow, 'R450 640 100 120'],
    [C.brown, 'R340 750 320 90 14'],
    [C.yellow, 'R390 700 220 60 10'],
  ];

  var comp = [
    [C.violet, 'R230 730 540 90 24'],
    ['none', 'M290 770H710', { s: C.paper, w: 7 }],
    [C.violet, 'R440 570 120 100'],
    [C.violet, 'R330 650 340 40 12'],
    [C.violet, 'R130 140 740 470 36', { b: 1 }],
    [C.sky, 'R190 200 620 350 14', { b: 1 }],
    [C.paper, 'M300 200L420 200L270 550L190 550L190 460Z', { i: 1, s: 'none' }],
    ['none', 'M470 300H700M470 380H650M470 460H700', { s: C.paper, w: 16 }],
    [C.green, 'E700 650 14 14', { s: 'none' }],
  ];
  comp.pop();
  comp.splice(0, 0, [C.paper, 'R860 750 70 50 25']);
  comp.shift();

  var blackKeys = [],
    keyLines = 'M';
  for (i = 1; i < 10; i++) keyLines += 160 + i * 68 + ' 610V810M';
  keyLines = keyLines.slice(0, -1);
  [1, 2, 4, 5, 6, 8, 9].forEach(function (k) {
    blackKeys.push([
      C.ink,
      'R' + (160 + k * 68 - 20) + ' 610 40 120 6',
      { s: 'none' },
    ]);
  });
  var piano = [
    [C.brown, 'R130 190 740 400 24'],
    [C.paper, 'R330 250 340 200 10'],
    ['none', 'M370 300H630M370 350H630M370 400H590', { s: C.ink, w: 7 }],
    [C.brown, 'R110 570 780 50 12'],
    [C.paper, 'R160 610 680 200 8'],
    ['none', keyLines, { s: C.ink, w: 7 }],
  ].concat(blackKeys, [
    [C.brown, 'R160 810 60 100', {}],
    [C.brown, 'R780 810 60 100', {}],
  ]);

  function pin(cx, top, s) {
    var f = s;
    function X(v) {
      return Math.round(cx + v * f);
    }
    function Y(v) {
      return Math.round(top + v * f);
    }
    return [
      [
        C.paper,
        'M' +
          X(-30) +
          ' ' +
          Y(70) +
          'C' +
          X(-30) +
          ' ' +
          Y(140) +
          ' ' +
          X(-110) +
          ' ' +
          Y(220) +
          ' ' +
          X(-110) +
          ' ' +
          Y(320) +
          'C' +
          X(-110) +
          ' ' +
          Y(420) +
          ' ' +
          X(-70) +
          ' ' +
          Y(450) +
          ' ' +
          X(-70) +
          ' ' +
          Y(480) +
          'H' +
          X(70) +
          'C' +
          X(70) +
          ' ' +
          Y(450) +
          ' ' +
          X(110) +
          ' ' +
          Y(420) +
          ' ' +
          X(110) +
          ' ' +
          Y(320) +
          'C' +
          X(110) +
          ' ' +
          Y(220) +
          ' ' +
          X(30) +
          ' ' +
          Y(140) +
          ' ' +
          X(30) +
          ' ' +
          Y(70) +
          'Z',
        { b: 1 },
      ],
      [
        C.red,
        'R' +
          X(-120) +
          ' ' +
          Y(150) +
          ' ' +
          Math.round(240 * f) +
          ' ' +
          Math.round(26 * f),
        { i: 1, s: 'none' },
      ],
      [
        C.red,
        'R' +
          X(-120) +
          ' ' +
          Y(200) +
          ' ' +
          Math.round(240 * f) +
          ' ' +
          Math.round(20 * f),
        { i: 1, s: 'none' },
      ],
      [
        C.paper,
        'E' +
          cx +
          ' ' +
          Y(40) +
          ' ' +
          Math.round(42 * f) +
          ' ' +
          Math.round(46 * f),
      ],
    ];
  }
  var bowl = [ground(670, C.sky)].concat(
    pin(690, 190, 1),
    pin(850, 310, 0.75),
    [
      [C.blue, 'E330 640 210 210', { b: 1, w: 16 }],
      [
        C.ink,
        'M440 480C520 560 520 740 430 810C560 760 570 560 440 480Z',
        { i: 1, s: 'none' },
      ],
      [C.paper, 'E250 540 20 40 40', { i: 1 }],
      [C.ink, 'E300 590 24 24', { s: 'none' }],
      [C.ink, 'E390 570 24 24', { s: 'none' }],
      [C.ink, 'E340 500 24 24', { s: 'none' }],
    ],
  );

  var jump = [
    [C.mint, 'R0 820 1000 180'],
    ['none', 'M255 720C110 80 890 80 745 720', { s: C.ink, w: 34 }],
    ['none', 'M255 720C110 80 890 80 745 720', { s: C.red, w: 16 }],
    [C.orange, 'R200 700 110 210 40'],
    [C.orange, 'R690 700 110 210 40'],
    [C.yellow, 'R215 740 80 40 14', { s: 'none' }],
    [C.yellow, 'R705 740 80 40 14', { s: 'none' }],
    [C.paper, 'E450 190 30 14 -10', { s: 'none' }],
  ];
  jump.pop();
  jump.splice(
    5,
    2,
    [C.yellow, 'R215 740 80 40 14', { s: 'none' }],
    [C.yellow, 'R705 740 80 40 14', { s: 'none' }],
  );

  var seaL = [
    [C.sky, 'R0 0 1000 560', { s: 'none' }],
    [C.yellow, 'M110 560A110 110 0 0 1 330 560Z', { w: 7 }],
    [C.blue, 'R0 560 1000 440', { s: C.ink }],
    [
      'none',
      'M80 660Q130 620 180 660T280 660M720 640Q770 600 820 640T920 640M150 840Q200 800 250 840T350 840M650 860Q700 820 750 860T850 860M400 920Q450 880 500 920T600 920',
      { s: C.paper, w: 16 },
    ],
    [C.paper, 'M500 340L500 680L350 680Z'],
    [C.red, 'M520 400L520 680L650 680Z'],
    [C.brown, 'M320 700H680L610 780H390Z'],
    ['none', 'M510 330V700', { s: C.ink, w: 7 }],
  ];

  R['sun'] = sunL;
  R['moon'] = moonL;
  R['star'] = starL;
  R['cloud'] = [[C.sky, 'R60 160 880 680 60', { s: 'none' }]].concat(
    cloud(500, 500, 190),
  );
  R['rain'] = [].concat(cloud(500, 380, 190, C.violet), rainDrops, [
    [C.sky, 'E500 380 0 0', { s: 'none' }],
  ]);
  R['rainbow'] = rainbow;
  R['tree'] = [ground(820, C.mint)].concat(
    [[C.brown, 'M440 830L460 520H540L560 830Z']],
    U(C.green, ['E500 330 210 180', 'E340 420 150 130', 'E660 420 150 130']),
    [
      [C.mint, 'E440 280 40 60 30', { s: 'none' }],
      ['none', 'M500 560L430 450M500 580L570 460', { s: C.brown, w: 16 }],
      [C.red, 'E400 380 18 18', { w: 7 }],
      [C.red, 'E600 330 18 18', { w: 7 }],
      [C.red, 'E660 440 18 18', { w: 7 }],
    ],
  );
  R['flower'] = [ground(850, C.mint)].concat(
    K.tube(
      [
        [500, 460],
        [500, 860],
      ],
      30,
      C.green,
    ),
    [
      [C.mint, 'M500 700C600 600 720 640 760 700C700 780 580 780 500 700Z'],
      [C.mint, 'M500 760C400 660 280 700 240 760C300 840 420 840 500 760Z'],
    ],
    petals,
    [
      [C.yellow, 'E500 330 70 70'],
      [C.orange, 'E480 310 20 20', { s: 'none' }],
    ],
  );
  R['mountain'] = [
    [C.sky, 'R0 0 1000 1000', { s: 'none' }],
    [C.yellow, 'E800 200 60 60', { w: 7 }],
    [C.violet, 'M420 800L720 400L1000 800Z'],
    [C.blue, 'M80 800L400 230L720 800Z', { b: 1 }],
    [C.ink, 'M400 230L560 515L600 800H400Z', { i: 1, s: 'none' }],
    [
      C.paper,
      'M400 230L310 400L360 430L400 380L450 440L490 400Z',
      { i: 1, s: 'none' },
    ],
    ground(780, C.mint),
  ];
  R['mountain'][4][0] = C.violet;
  R['sea'] = seaL;
  R['lightning'] = [[C.violet, 'R0 0 1000 1000', { s: 'none' }]].concat(
    cloud(500, 280, 190, C.blue),
    [
      [
        C.yellow,
        'M560 400L360 640H480L400 920L700 560H560L650 400Z',
        { w: 16 },
      ],
      [C.orange, 'M560 400L480 640L400 920L520 640Z', { s: 'none' }],
      [
        'none',
        'M200 700L170 780M800 680L770 760M250 480L230 540',
        { s: C.paper, w: 16 },
      ],
    ],
  );
  R['lightning'][0][0] = C.sky;
  R['snowman'] = snowman;
  R['volcano'] = [
    [C.sky, 'R0 0 1000 1000', { s: 'none' }],
    [C.violet, 'E330 150 90 60', { w: 7 }],
    [C.violet, 'E400 90 70 50', { w: 7 }],
    [C.brown, 'M80 830L390 330H610L920 830Z', { b: 1, w: 16 }],
    [
      C.red,
      'M390 330C430 280 570 280 610 330C580 380 560 340 500 400C450 340 430 390 390 330Z',
      { s: C.ink },
    ],
    [
      C.orange,
      'M470 380L530 380L580 520L520 640L560 830H440L480 640L420 520Z',
      { i: 1, s: 'none' },
    ],
    [C.ink, 'M80 830L390 330L300 830Z', { i: 1, s: 'none' }],
    ground(830, C.mint),
  ];
  R['volcano'][6][0] = C.orange;
  R['island'] = [
    [C.sky, 'R0 0 1000 560', { s: 'none' }],
    [C.yellow, 'E170 150 60 60', { w: 7 }],
    [C.blue, 'R0 560 1000 440', { s: C.ink }],
    [
      'none',
      'M100 780Q150 740 200 780T300 780M720 820Q770 780 820 820T920 820',
      { s: C.paper, w: 16 },
    ],
    [
      C.yellow,
      'M180 700C280 520 720 520 820 700C700 770 300 770 180 700Z',
      { w: 16 },
    ],
  ].concat(
    K.tube(
      [
        [500, 620],
        [530, 450],
        [470, 280],
      ],
      34,
      C.brown,
    ),
    [
      [C.green, 'M470 280C400 190 300 220 250 300C350 280 420 300 470 280Z'],
      [C.green, 'M470 280C500 170 620 160 700 210C600 230 540 250 470 280Z'],
      [C.mint, 'M470 280C390 290 330 370 340 420C400 360 430 330 470 280Z'],
      [C.mint, 'M470 280C560 300 640 360 640 430C580 370 520 340 470 280Z'],
      [C.brown, 'E500 300 18 18', { w: 7 }],
    ],
  );
  R['desert'] = [
    [C.sky, 'R0 0 1000 1000', { s: 'none' }],
    [C.orange, 'E760 220 110 110', { w: 16 }],
    [
      C.yellow,
      'M0 560C200 440 450 500 560 600C700 520 900 540 1000 600V1000H0Z',
      { w: 16 },
    ],
    [C.orange, 'M0 760C250 700 600 720 1000 780V1000H0Z', { s: C.ink }],
    [C.green, 'R230 520 70 200 35'],
    [C.green, 'R150 580 50 100 25'],
    [C.green, 'R300 600 50 90 25'],
    [C.green, 'R215 650 100 80 30', { s: 'none' }],
    ['none', 'M80 880Q130 840 180 880T280 880', { s: C.ink, w: 7 }],
    [C.paper, 'E640 880 24 8', { w: 7 }],
  ];
  R['desert'].splice(
    4,
    4,
    [C.green, 'R220 500 90 300 45'],
    [C.green, 'R140 580 60 40 20'],
    [C.green, 'R100 540 50 140 25'],
    [C.green, 'R320 600 50 40 20'],
    [C.green, 'R320 540 50 100 25'],
    [C.green, 'R140 620 140 60 0', { s: 'none' }],
    [C.green, 'R240 640 120 50 0', { s: 'none' }],
  );
  R['waterfall'] = [
    [C.sky, 'R0 0 1000 1000', { s: 'none' }],
    [C.brown, 'R60 280 340 560'],
    [C.brown, 'R600 280 340 560'],
    [C.mint, 'R40 230 380 90 30'],
    [C.mint, 'R580 230 380 90 30'],
    [C.paper, 'R400 280 200 520', { s: C.ink }],
    ['none', 'M450 320V700M500 300V740M550 320V700', { s: C.sky, w: 16 }],
    [C.sky, 'E500 830 300 70', { w: 16 }],
    [C.paper, 'E430 790 50 36', { w: 7 }],
    [C.paper, 'E570 790 50 36', { w: 7 }],
    [C.paper, 'E500 770 60 40', { w: 7 }],
    [C.ink, 'M60 520L150 520L120 600L60 600Z', { i: 1, s: 'none' }],
  ];
  R['waterfall'].pop();
  R['cactus'] = cactus;
  R['mushroom'] = mush;
  R['maple'] = maple;
  R['tornado'] = tornado;
  R['soccer'] = soccerL;
  R['basketball'] = bball;
  R['racket'] = racket;
  R['guitar'] = guitar;
  R['drum'] = drum;
  R['kite'] = kite;
  R['swing'] = swing;
  R['slide'] = slide;
  R['ferriswheel'] = fw;
  R['dice'] = dice;
  R['cards'] = cards;
  R['puzzle'] = puzzle;
  R['note'] = note;
  R['microphone'] = mic;
  R['camera'] = camera;
  R['trophy'] = trophy;
  R['computer'] = comp;
  R['piano'] = piano;
  R['bowling'] = bowl;
  R['jumprope'] = jump;
})(typeof globalThis !== 'undefined' ? globalThis : this);
