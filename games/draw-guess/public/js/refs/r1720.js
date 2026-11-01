(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;

  function flat(a) {
    var out = [],
      i;
    if (!(a instanceof Array)) return out;
    if (typeof a[0] === 'string') return [a];
    for (i = 0; i < a.length; i++) out = out.concat(flat(a[i]));
    return out;
  }
  function T(l, o) {
    return K.T(flat(l), o);
  }
  function def(o) {
    var k;
    for (k in o) if (o.hasOwnProperty(k)) R[k] = flat(o[k]);
  }
  function ln(d, col, w) {
    return ['none', d, { s: col, w: w || 16 }];
  }
  function tl(d, col, w) {
    return [ln(d, C.ink, w + 18), ln(d, col, w)];
  }
  function bgc(col) {
    return [[col, 'R-40 -40 1080 1080', { s: 'none' }]];
  }
  function dots(list) {
    var o = [],
      i;
    for (i = 0; i < list.length; i++)
      o.push([
        C.paper,
        K.E(list[i][0], list[i][1], list[i][2] || 7, list[i][2] || 7),
        { s: 'none' },
      ]);
    return o;
  }
  var STARS = [
    [90, 90],
    [880, 120, 9],
    [160, 880],
    [900, 850],
    [60, 480, 6],
    [950, 480, 6],
    [700, 60, 6],
    [300, 950, 8],
    [600, 940, 6],
    [420, 50, 8],
  ];
  function space() {
    return [].concat(bgc(C.ink), dots(STARS));
  }
  function star5(cx, cy, Ro, ri, fill, w) {
    var pts = [],
      i,
      a,
      r;
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 5;
      r = i % 2 ? ri : Ro;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return [fill, K.poly(pts, true), { w: w || 7 }];
  }
  function sparkle(cx, cy, Ro, ri, fill) {
    var pts = [],
      i,
      a,
      r;
    for (i = 0; i < 8; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 4;
      r = i % 2 ? ri : Ro;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return [fill, K.poly(pts, true), { w: 7 }];
  }
  function ball(cx, cy, r, col) {
    return [col, K.E(cx, cy, r, r), { b: 1 }];
  }
  function moonShape(cx, cy, r, k, lit) {
    // lit part on the right; k>0 crescent, k<0 gibbous
    var rx = Math.abs(k) * r;
    var d =
      'M' +
      cx +
      ' ' +
      (cy - r) +
      'A' +
      r +
      ' ' +
      r +
      ' 0 0 1 ' +
      cx +
      ' ' +
      (cy + r) +
      'A' +
      rx +
      ' ' +
      r +
      ' 0 0 ' +
      (k > 0 ? 0 : 1) +
      ' ' +
      cx +
      ' ' +
      (cy - r) +
      'Z';
    return [lit, d, { s: 'none' }];
  }
  function astro(x, y, s) {
    var L = [].concat(
      [[C.violet, 'R340 330 320 250 50']],
      K.tube(
        [
          [450, 560],
          [440, 780],
        ],
        90,
        C.paper,
      ),
      K.tube(
        [
          [555, 560],
          [570, 780],
        ],
        90,
        C.paper,
      ),
      [
        [C.orange, 'E432 800 70 34'],
        [C.orange, 'E580 800 70 34'],
      ],
      [[C.paper, 'R395 330 210 270 60']],
      K.tube(
        [
          [420, 380],
          [330, 520],
        ],
        80,
        C.paper,
      ),
      K.tube(
        [
          [580, 380],
          [680, 500],
        ],
        80,
        C.paper,
      ),
      [
        [C.yellow, 'E325 535 48 48'],
        [C.yellow, 'E685 515 48 48'],
      ],
      [[C.red, 'R445 400 110 80 14']],
      [
        [C.mint, 'E475 430 14 14'],
        [C.yellow, 'E525 430 14 14'],
      ],
      [[C.paper, 'E500 220 130 125']],
      [[C.sky, 'E505 225 92 72']],
      [[C.paper, 'E475 205 20 12 -25', { s: 'none' }]],
      [ln('M395 300Q500 340 605 300', C.ink, 7)],
    );
    return T(L, { dx: x - 500, dy: y - 500, s: s, cx: 500, cy: 500 });
  }
  function panel(x, y, w, h, col) {
    var L = [[col, K.RR(x, y, w, h, 6)]],
      i;
    for (i = 1; i < 3; i++)
      L.push(ln('M' + (x + (w * i) / 3) + ' ' + y + 'V' + (y + h), C.ink, 7));
    L.push(ln('M' + x + ' ' + (y + h / 2) + 'H' + (x + w), C.ink, 7));
    return L;
  }
  function ring(cx, cy, rx, ry, rot, col, back) {
    var full =
      'M' +
      (cx - rx) +
      ' ' +
      cy +
      'A' +
      rx +
      ' ' +
      ry +
      ' 0 1 1 ' +
      (cx + rx) +
      ' ' +
      cy +
      'A' +
      rx +
      ' ' +
      ry +
      ' 0 1 1 ' +
      (cx - rx) +
      ' ' +
      cy +
      'Z';
    var front =
      'M' +
      (cx - rx) +
      ' ' +
      cy +
      'A' +
      rx +
      ' ' +
      ry +
      ' 0 0 0 ' +
      (cx + rx) +
      ' ' +
      cy;
    var o = { rot: rot, cx: cx, cy: cy };
    return {
      back: T([ln(full, C.ink, 64), ln(full, col, 34)], o),
      front: T([ln(front, C.ink, 64), ln(front, col, 34)], o),
    };
  }
  function labelStars(pts, linesIdx, cols) {
    var o = [],
      i,
      d = '';
    for (i = 0; i < linesIdx.length; i++) {
      d +=
        'M' +
        pts[linesIdx[i][0]][0] +
        ' ' +
        pts[linesIdx[i][0]][1] +
        'L' +
        pts[linesIdx[i][1]][0] +
        ' ' +
        pts[linesIdx[i][1]][1];
    }
    o.push(ln(d, C.sky, 7));
    for (i = 0; i < pts.length; i++)
      o.push(
        star5(
          pts[i][0],
          pts[i][1],
          pts[i][2] || 36,
          (pts[i][2] || 36) * 0.45,
          (cols && cols[i]) || C.yellow,
        ),
      );
    return o;
  }

  /* ---- planets ---- */
  var ring1 = ring(500, 500, 420, 95, -20, C.orange);
  var ring2 = ring(500, 500, 380, 130, 80, C.sky);
  var spiral = [],
    a,
    arm,
    p1,
    p2,
    th,
    rr;
  for (arm = 0; arm < 2; arm++) {
    p1 = [];
    for (th = 0.3; th < 6.4; th += 0.25) {
      rr = 60 + 60 * th;
      p1.push(
        (500 + rr * Math.cos(th + arm * Math.PI)).toFixed(0) +
          ' ' +
          (500 + rr * 0.8 * Math.sin(th + arm * Math.PI)).toFixed(0),
      );
    }
    p2 = 'M' + p1.join('L');
    spiral.push(ln(p2, C.violet, 64));
  }
  for (arm = 0; arm < 2; arm++) {
    p1 = [];
    for (th = 0.3; th < 6.4; th += 0.25) {
      rr = 60 + 60 * th;
      p1.push(
        (500 + rr * Math.cos(th + arm * Math.PI)).toFixed(0) +
          ' ' +
          (500 + rr * 0.8 * Math.sin(th + arm * Math.PI)).toFixed(0),
      );
    }
    spiral.push(ln('M' + p1.join('L'), C.pink, 16));
  }

  var burst = [],
    i2,
    ang,
    rad2;
  for (i2 = 0; i2 < 24; i2++) {
    ang = (i2 * Math.PI) / 12;
    rad2 = i2 % 2 ? 230 : i2 % 4 === 0 ? 400 : 330;
    burst.push([500 + rad2 * Math.cos(ang), 500 + rad2 * Math.sin(ang)]);
  }
  var burst2 = [];
  for (i2 = 0; i2 < 24; i2++) {
    ang = (i2 * Math.PI) / 12;
    rad2 = i2 % 2 ? 130 : 220;
    burst2.push([500 + rad2 * Math.cos(ang), 500 + rad2 * Math.sin(ang)]);
  }

  var nine = [
    [480, 140, 36],
    [820, 300, 30],
    [640, 560, 40],
    [260, 400, 30],
    [350, 740, 34],
    [800, 760, 30],
  ];
  var dip = [
    [730, 300, 40],
    [760, 480, 40],
    [570, 540, 38],
    [540, 400, 38],
    [390, 430, 36],
    [270, 480, 36],
    [140, 580, 38],
  ];
  var ori = [
    [360, 200, 44],
    [650, 230, 38],
    [430, 470, 34],
    [500, 495, 34],
    [570, 520, 34],
    [340, 790, 42],
    [650, 770, 36],
    [500, 120, 26],
  ];

  def({
    'w-physics-25': [
      [C.brown, 'R170 120 660 50 10'],
      [C.brown, 'R170 120 50 700 10'],
      [C.brown, 'R780 120 50 700 10'],
      [C.brown, 'R120 800 760 50 10'],
      ln('M500 170L300 650', C.ink, 7),
      ['none', 'M255 705Q500 820 745 705', { s: C.sky, w: 7 }],
      [C.sky, 'E740 680 60 60'],
      ln('M500 170L740 620', C.sky, 7),
      [C.red, 'E300 700 70 70'],
      [C.paper, 'E280 675 18 14 -30', { s: 'none' }],
      [C.yellow, 'E500 170 20 20'],
    ],
    'w-physics-26': [
      [C.paper, 'R120 760 760 60 8', { s: 'none' }],
      [C.brown, 'R80 800 840 100 10'],
      [C.sky, 'R150 170 320 600 14', { b: 1 }],
      [C.paper, 'R150 170 320 130', { i: 1, s: 'none' }],
      ln('M470 400Q640 400 740 790', C.sky, 16),
      ln('M470 520Q580 520 620 790', C.sky, 16),
      ln('M470 640Q530 640 540 790', C.sky, 16),
      [C.ink, 'E470 400 12 12', { s: 'none' }],
      [C.ink, 'E470 520 12 12', { s: 'none' }],
      [C.ink, 'E470 640 12 12', { s: 'none' }],
      ln('M150 170V770H470', C.ink, 16),
      [C.blue, 'R150 300 320 28', { i: 1, s: 'none' }],
    ],
    'w-physics-27': [
      [C.paper, 'E500 440 300 300', { b: 1 }],
      [C.red, 'M500 440L650 250L690 290Z', { s: 'none' }],
      [C.sky, 'M290 440A210 210 0 0 1 500 230L500 440Z', { i: 1, s: 'none' }],
      [
        C.yellow,
        'M500 230A210 210 0 0 1 710 440L500 440Z',
        { i: 1, s: 'none' },
      ],
      [C.red, 'M710 440A210 210 0 0 1 640 600L500 440Z', { i: 1, s: 'none' }],
      ln('M500 440L640 270', C.ink, 16),
      [C.ink, 'E500 440 30 30'],
      [C.violet, 'R440 740 120 120 14'],
      ln('M500 700V745', C.ink, 34),
      ['none', 'E500 440 300 300', { s: C.orange, w: 34 }],
      [C.paper, 'E500 440 22 22', { s: C.ink }],
      ln('M500 440L640 270', C.ink, 16),
      [C.ink, 'E500 440 24 24'],
    ],
    'w-physics-28': [
      ['none', 'E500 500 320 320', { s: C.sky, w: 16 }],
      [C.orange, 'E500 500 60 60'],
      ln('M500 500L800 500', C.ink, 16),
      [C.red, 'E820 500 66 66'],
      [C.paper, 'E800 480 16 12 -30', { s: 'none' }],
      [C.red, 'E330 270 24 24'],
      ln('M500 500L330 270', C.ink, 7),
    ],
    'w-physics-29': [
      [C.paper, 'R100 380 300 420 14', { b: 1 }],
      [C.sky, 'R100 520 300 280', { i: 1, s: 'none' }],
      [C.paper, 'R600 560 300 280 14', { b: 1 }],
      [C.sky, 'R600 690 300 150', { i: 1, s: 'none' }],
      [
        K.tube(
          [
            [250, 620],
            [250, 260],
            [330, 170],
            [740, 170],
            [760, 270],
            [760, 740],
          ],
          50,
          C.sky,
        ),
      ],
      [C.sky, 'R100 520 300 20', { s: 'none' }],
      ln('M250 600V300', C.paper, 7),
      ln('M100 380V800H400V380', C.ink, 7),
      ln('M600 560V840H900V560', C.ink, 7),
      ln('M60 800H940', C.brown, 16),
      ln('M790 440V540', C.sky, 16),
    ],
    'w-physics-30': [
      [C.yellow, 'E250 250 130 130'],
      ln(
        'M250 60V0M70 250H0M110 110L50 50M390 110L450 50M110 390L50 450',
        C.orange,
        16,
      ),
      ln('M380 330L600 520L560 560L800 690', C.violet, 16),
      ln('M310 380L480 580L440 620L640 790', C.violet, 16),
      ln('M430 280L700 450L660 490L920 600', C.violet, 16),
      [C.red, 'M520 760C520 600 800 600 800 760Z'],
      ln('M660 760V880', C.brown, 16),
      [
        C.violet,
        'M560 700L640 640L640 700ZM720 700L720 650L780 700Z',
        { s: 'none' },
      ],
      ln('M200 940H900', C.yellow, 34),
    ],
    'w-physics-31': [
      [C.blue, 'R90 440 300 120 40', { b: 1 }],
      [C.violet, 'R90 440 300 40', { i: 1, s: 'none' }],
      [C.red, 'R300 470 40 60 8'],
      ln('M390 500H870', C.ink, 34),
      ln('M390 500H870', C.red, 16),
      [C.brown, 'R870 280 70 450 8'],
      [C.red, 'E880 500 40 40', { s: 'none' }],
      sparkle(870, 500, 60, 20, C.yellow),
      [C.red, 'E870 500 14 14', { s: 'none' }],
      [C.yellow, 'E160 500 16 16'],
    ],
    'w-physics-32': [
      [C.sky, 'M500 190C690 380 690 620 500 810C310 620 310 380 500 190Z'],
      [C.paper, 'M455 330C400 430 400 560 440 660', { s: 'none' }],
      ln('M60 500H940', C.ink, 7),
      ln('M100 330H500L810 500', C.red, 16),
      ln('M100 500H810', C.red, 16),
      ln('M100 670H500L810 500', C.red, 16),
      [C.yellow, 'E810 500 28 28'],
    ],
    'w-physics-33': [
      ln('M60 500H940', C.ink, 7),
      ln('M100 360H500L900 190', C.red, 16),
      ln('M100 500H900', C.red, 16),
      ln('M100 640H500L900 810', C.red, 16),
      [
        C.sky,
        'M360 190H640C570 380 570 620 640 810H360C430 620 430 380 360 190Z',
      ],
      [C.yellow, 'E260 500 26 26'],
    ],
    'w-physics-34': [
      [C.sky, 'E410 410 250 250'],
      [C.red, 'E390 430 80 55', { s: C.ink }],
      [C.ink, 'E360 410 10 10', { s: 'none' }],
      [C.ink, 'E420 410 10 10', { s: 'none' }],
      ln('M330 520L470 520M360 450L420 450', C.ink, 7),
      K.tube(
        [
          [600, 600],
          [820, 830],
        ],
        90,
        C.brown,
      ),
      ['none', 'E410 410 250 250', { s: C.ink, w: 34 }],
      ['none', 'E410 410 250 250', { s: C.orange, w: 16 }],
      ['none', 'M240 330A200 200 0 0 1 340 235', { s: C.paper, w: 16 }],
      [C.red, 'E840 220 36 28'],
      [C.ink, 'E840 220 8 8', { s: 'none' }],
      ln('M600 580L650 640', C.ink, 16),
    ],
    'w-physics-35': [
      [C.violet, 'R90 300 230 400 30'],
      [C.paper, 'E205 400 80 80'],
      [C.blue, 'E205 400 40 40'],
      [C.paper, 'E205 600 50 50'],
      [C.blue, 'E205 600 22 22'],
      [C.sky, 'E205 400 80 80', { s: 'none' }],
      ln('M400 320Q480 400 400 480', C.sky, 16),
      ln('M500 250Q630 400 500 550', C.sky, 16),
      ln('M600 190Q790 400 600 610', C.sky, 16),
      ln('M700 130Q950 400 700 670', C.sky, 16),
    ],
  });

  def({
    'w-physics-36': [].concat(
      bgc(C.paper),
      [
        [
          C.brown,
          'M180 520C170 330 330 330 420 460C450 410 550 410 580 460C670 330 830 330 820 520C700 460 640 560 500 640C360 560 300 460 180 520Z',
          { s: C.ink },
        ],
      ],
      [[C.brown, 'E500 520 80 120']],
      [[C.brown, 'M450 430L430 330L490 400ZM550 430L570 330L510 400Z']],
      [[C.pink, 'M455 420L440 355L480 400Z', { s: 'none' }]],
      [
        [C.ink, 'E470 500 9 9', { s: 'none' }],
        [C.ink, 'E530 500 9 9', { s: 'none' }],
      ],
      [ln('M470 560Q500 585 530 560', C.ink, 7)],
      [ln('M180 520Q250 600 300 520M820 520Q750 600 700 520', C.ink, 7)],
      [
        ln('M120 200Q40 300 120 400', C.violet, 16),
        ln('M200 130Q60 300 200 470', C.violet, 16),
        ln('M880 200Q960 300 880 400', C.violet, 16),
        ln('M800 130Q940 300 800 470', C.violet, 16),
      ],
      [
        [C.sky, 'E500 830 160 60'],
        [C.sky, 'M650 830L760 770L760 890Z'],
        [C.ink, 'E430 820 10 10', { s: 'none' }],
      ],
    ),
    'w-physics-37': [
      [C.sky, 'R200 360 580 80 30'],
      [C.sky, 'R170 340 50 120 14'],
      [C.sky, 'M780 380L840 400L780 420Z', { s: C.ink }],
      ln(
        'M290 350L330 450M340 350L380 450M390 350L430 450M440 350L480 450M490 350L530 450M540 350L580 450M590 350L630 450M640 350L680 450',
        C.ink,
        34,
      ),
      ln(
        'M290 350L330 450M340 350L380 450M390 350L430 450M440 350L480 450M490 350L530 450M540 350L580 450M590 350L630 450M640 350L680 450',
        C.orange,
        16,
      ),
      ln('M280 350Q250 650 380 720', C.orange, 16),
      ln('M690 450Q720 650 640 720', C.orange, 16),
      [C.violet, 'R340 680 300 150 20'],
      [C.red, 'R340 680 100 150 20'],
      ln('M430 720V810', C.ink, 7),
      [C.ink, 'E850 440 22 22'],
      [C.ink, 'E870 520 22 22'],
      [C.ink, 'E830 580 22 22'],
    ],
    'w-physics-38': [
      [C.sky, 'M200 820L180 450L260 300L340 450L330 820Z', { b: 1 }],
      [C.blue, 'M260 300L340 450L330 820L260 820Z', { i: 1, s: 'none' }],
      [C.violet, 'M360 840L340 330L450 120L560 330L550 840Z', { b: 1 }],
      [C.blue, 'M450 120L560 330L550 840L450 840Z', { i: 1, s: 'none' }],
      [C.paper, 'M385 360L395 700', { i: 1, s: C.paper, w: 16 }],
      [C.pink, 'M580 840L570 520L660 400L750 520L760 840Z', { b: 1 }],
      [C.violet, 'M660 400L750 520L760 840L660 840Z', { i: 1, s: 'none' }],
      ln('M360 330H560M340 450H260M570 520H750', C.ink, 7),
      ln('M160 840H840', C.brown, 34),
      [C.paper, 'M200 470L205 700', { s: C.paper, w: 7 }],
    ],
    'w-astro-0': [].concat(
      space(),
      [[C.yellow, 'E40 500 200 200', { s: C.orange, w: 16 }]],
      [ln('M240 500Q220 500 240 500', C.ink, 7)],
      [
        [C.violet, 'E330 500 24 24'],
        [C.orange, 'E400 500 36 36'],
        [C.sky, 'E490 500 38 38'],
        [C.mint, 'E495 490 16 14', { s: 'none' }],
        [C.red, 'E575 500 28 28'],
        [C.orange, 'E700 500 100 100'],
        [C.brown, 'M610 470H790M605 530H795', { s: C.brown, w: 16 }],
      ],
      [
        ring(870, 500, 120, 30, -20, C.yellow).back,
        [C.yellow, 'E870 500 60 60'],
        ring(870, 500, 120, 30, -20, C.yellow).front,
      ],
      [],
    ),
    'w-astro-1': [].concat(
      space(),
      spiral,
      [[C.orange, 'E500 500 110 90']],
      [[C.yellow, 'E500 500 60 50']],
      dots([
        [300, 300, 8],
        [720, 280, 8],
        [250, 650, 8],
        [760, 700, 8],
        [500, 130, 8],
      ]),
    ),
    'w-astro-2': [].concat(
      bgc(C.blue),
      dots([
        [100, 100, 8],
        [880, 130, 8],
        [140, 880, 8],
        [900, 850, 8],
        [500, 60, 8],
      ]),
      [
        ['none', 'E500 500 230 230', { s: C.orange, w: 34 }],
        ['none', 'E500 500 230 230', { s: C.yellow, w: 16 }],
      ],
      T([[C.orange, 'E500 500 420 80']], { rot: -10, cx: 500, cy: 500 }),
      T([[C.yellow, 'E500 500 340 50']], { rot: -10, cx: 500, cy: 500 }),
      [[C.ink, 'E500 500 170 170']],
      T(
        [
          ln('M80 500A420 80 0 0 0 920 500', C.orange, 34),
          ln('M160 500A340 50 0 0 0 840 500', C.yellow, 16),
        ],
        { rot: -10, cx: 500, cy: 500 },
      ),
    ),
    'w-astro-3': [].concat(
      space(),
      [[C.red, K.poly(burst, true), { w: 7 }]],
      [[C.orange, K.poly(burst2, true), { w: 7 }]],
      [
        [C.yellow, 'E500 500 120 120'],
        [C.paper, 'E500 500 60 60', { s: 'none' }],
      ],
      dots([
        [130, 300, 10],
        [860, 280, 10],
        [200, 800, 10],
        [820, 800, 10],
        [500, 70, 10],
      ]),
    ),
    'w-astro-4': [].concat(
      space(),
      labelStars(nine, [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [2, 4],
        [4, 5],
        [5, 2],
      ]),
    ),
    'w-astro-5': [].concat(
      space(),
      labelStars(dip, [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [3, 4],
        [4, 5],
        [5, 6],
      ]),
      [ln('M760 480L750 220', C.pink, 7), star5(745, 150, 44, 20, C.orange)],
    ),
    'w-astro-6': [].concat(
      space(),
      labelStars(
        ori,
        [
          [0, 2],
          [1, 4],
          [2, 3],
          [3, 4],
          [2, 5],
          [4, 6],
          [0, 7],
          [1, 7],
        ],
        [C.red, C.yellow, C.yellow, C.yellow, C.yellow, C.sky, C.sky, C.yellow],
      ),
      [
        ln('M500 560V690', C.sky, 7),
        star5(500, 600, 24, 11, C.paper),
        star5(500, 690, 22, 10, C.paper),
      ],
    ),
    'w-astro-7': [].concat(
      space(),
      [sparkle(500, 330, 300, 60, C.yellow)],
      [[C.paper, 'E500 330 40 40', { s: 'none' }]],
      [
        ln(
          'M240 830L330 760L420 800L500 760L520 690L610 670L650 740L500 760',
          C.sky,
          7,
        ),
      ],
      [
        star5(240, 830, 24, 11, C.paper),
        star5(330, 760, 24, 11, C.paper),
        star5(420, 800, 24, 11, C.paper),
        star5(500, 760, 24, 11, C.paper),
        star5(520, 690, 24, 11, C.paper),
        star5(610, 670, 24, 11, C.paper),
        star5(650, 740, 24, 11, C.paper),
      ],
    ),
    'w-astro-8': [].concat(
      space(),
      [ball(500, 500, 330, C.red)],
      [
        [
          C.brown,
          'M300 330C380 300 400 380 340 430C290 460 240 390 300 330ZM600 560C690 540 740 620 680 680C620 710 540 640 600 560ZM520 270C580 260 600 310 550 330Z',
          { i: 1, s: 'none' },
        ],
      ],
      [
        [
          C.paper,
          'M340 220C440 160 560 160 660 220C560 260 440 260 340 220Z',
          { i: 1, s: 'none' },
        ],
      ],
      [[C.orange, 'E640 410 40 30', { i: 1, s: 'none' }]],
    ),
    'w-astro-9': [].concat(
      space(),
      [ball(500, 500, 330, C.yellow)],
      [
        ln('M200 400Q350 330 500 400T800 400', C.orange, 16),
        ln('M170 520Q330 450 500 520T830 520', C.orange, 16),
        ln('M200 640Q350 570 500 640T800 640', C.orange, 16),
      ],
      [[C.paper, 'E380 330 80 30 -30', { s: 'none' }]],
    ),
    'w-astro-10': [].concat(
      space(),
      [ball(500, 500, 400, C.orange)],
      [
        [C.paper, 'R100 230 800 60', { i: 1, s: 'none' }],
        [C.brown, 'R100 330 800 70', { i: 1, s: 'none' }],
        [C.paper, 'R100 450 800 60', { i: 1, s: 'none' }],
        [C.brown, 'R100 560 800 80', { i: 1, s: 'none' }],
        [C.paper, 'R100 690 800 50', { i: 1, s: 'none' }],
      ],
      [[C.red, 'E640 505 90 55']],
      [[C.orange, 'E640 505 40 22', { s: 'none' }]],
    ),
    'w-astro-11': [].concat(
      space(),
      [ball(500, 500, 190, C.violet)],
      [
        [C.blue, 'E430 450 40 40', { i: 1, s: C.ink, w: 7 }],
        [C.blue, 'E560 540 50 50', { i: 1, s: C.ink, w: 7 }],
        [C.blue, 'E520 380 24 24', { i: 1, s: C.ink, w: 7 }],
        [C.blue, 'E410 590 26 26', { i: 1, s: C.ink, w: 7 }],
      ],
      [
        [
          C.sky,
          'M340 400C400 330 480 320 540 330',
          { i: 1, s: C.paper, w: 16 },
        ],
      ],
      [[C.yellow, 'E880 150 70 70', { s: C.orange, w: 16 }]],
    ),
    'w-astro-12': [].concat(
      space(),
      ring1.back,
      [ball(500, 500, 220, C.yellow)],
      [
        [C.orange, 'R280 400 440 40', { i: 1, s: 'none' }],
        [C.orange, 'R280 560 440 50', { i: 1, s: 'none' }],
      ],
      ring1.front,
    ),
    'w-astro-13': [].concat(
      space(),
      ring2.back,
      [ball(500, 500, 250, C.sky)],
      [
        [C.mint, 'E420 430 80 50', { i: 1, s: 'none' }],
        [C.paper, 'E400 420 30 14 -30', { i: 1, s: 'none' }],
      ],
      ring2.front,
    ),
    'w-astro-14': [].concat(
      space(),
      [ball(500, 500, 330, C.blue)],
      [[C.sky, 'E700 300 160 160', { i: 1, s: 'none' }]],
      [
        [C.sky, 'R100 560 800 50', { i: 1, s: 'none' }],
        [C.sky, 'R100 680 800 30', { i: 1, s: 'none' }],
      ],
      [[C.ink, 'E640 330 90 45', { s: 'none' }]],
      [ln('M250 420Q330 380 440 420', C.paper, 16)],
    ),
    'w-astro-15': [].concat(
      space(),
      [ball(430, 520, 250, C.brown)],
      [
        [
          C.pink,
          'M430 420C380 340 260 380 290 470C320 540 400 600 430 650C470 600 550 540 580 470C610 380 480 340 430 420Z',
          { s: 'none', i: 1 },
        ],
      ],
      [
        [C.orange, 'E300 650 40 30', { i: 1, s: 'none' }],
        [C.orange, 'E600 640 30 24', { i: 1, s: 'none' }],
      ],
      [[C.violet, 'E820 280 70 70']],
      [[C.blue, 'E800 270 25 20', { s: 'none' }]],
    ),
    'w-astro-16': [].concat(
      space(),
      [[C.blue, 'E120 500 85 85', { s: C.violet, w: 7 }]],
      [
        [C.violet, 'E310 500 85 85', { s: 'none' }],
        moonShape(310, 500, 85, 0.55, C.paper),
        ['none', 'E310 500 85 85', { s: C.ink, w: 7 }],
      ],
      [
        [C.violet, 'E500 500 85 85', { s: 'none' }],
        [C.paper, 'M500 415A85 85 0 0 1 500 585Z', { s: 'none' }],
        ['none', 'E500 500 85 85', { s: C.ink, w: 7 }],
      ],
      [
        [C.violet, 'E690 500 85 85', { s: 'none' }],
        moonShape(690, 500, 85, -0.55, C.paper),
        ['none', 'E690 500 85 85', { s: C.ink, w: 7 }],
      ],
      [[C.paper, 'E880 500 85 85']],
      [[C.paper, 'E500 800 6 6', { s: 'none' }]],
    ),
    'w-astro-17': [
      [C.sky, 'R-40 -40 1080 700', { s: 'none' }],
      [C.brown, 'M-40 600H1040V1040H-40Z', { s: 'none' }],
      [C.yellow, 'M150 600C250 800 750 800 850 600Z'],
      [
        C.brown,
        'M230 650C330 780 670 780 770 650C700 700 300 700 230 650Z',
        { s: 'none' },
      ],
      [
        C.violet,
        'M150 600C100 600 120 560 200 570ZM850 600C900 600 880 560 800 570Z',
        { s: 'none' },
      ],
      ln('M150 600C250 800 750 800 850 600', C.ink, 16),
      [C.orange, 'M170 200L420 280L380 350Z', { s: 'none' }],
      [C.orange, 'E450 330 80 70 20'],
      [C.red, 'M520 360L700 470L650 500Z'],
      [C.brown, 'E450 330 40 30 20', { s: 'none' }],
      [C.paper, 'E900 150 8 8', { s: 'none' }],
    ],
    'w-astro-18': [].concat(
      space(),
      [
        [C.sky, 'E500 1160 700 400', { s: C.ink }],
        [C.mint, 'E300 880 120 40', { s: 'none' }],
        [C.mint, 'E720 860 100 36', { s: 'none' }],
      ],
      [[C.violet, 'R120 470 760 60 20']],
      [
        [C.paper, 'R310 400 130 200 30'],
        [C.paper, 'R560 400 130 200 30'],
      ],
      [[C.orange, 'R440 440 120 120 14']],
      panel(100, 150, 200, 240, C.sky),
      panel(100, 610, 200, 240, C.sky),
      panel(700, 150, 200, 240, C.sky),
      panel(700, 610, 200, 240, C.sky),
      [[C.red, 'E500 500 20 20', { s: 'none' }]],
    ),
    'w-astro-19': [].concat(bgc(C.blue), dots(STARS), astro(500, 500, 1.15)),
    'w-astro-20': [].concat(
      space(),
      [
        [C.sky, 'E800 190 100 100'],
        [
          C.mint,
          'M740 160C780 130 830 170 800 220C760 230 720 200 740 160Z',
          { s: 'none' },
        ],
      ],
      [[C.violet, 'M-40 820C200 700 800 700 1040 820V1040H-40Z']],
      [
        [C.blue, 'E200 900 90 24', { s: 'none' }],
        [C.blue, 'E800 880 110 28', { s: 'none' }],
      ],
      [
        K.tube(
          [
            [760, 400],
            [760, 780],
          ],
          24,
          C.brown,
        ),
      ],
      [[C.red, 'M770 400L950 450L770 520Z']],
      astro(420, 560, 0.85),
    ),
    'w-astro-21': [].concat(
      space(),
      [[C.sky, 'E500 1250 800 480', { s: 'none' }]],
      T([panel(60, 380, 260, 240, C.sky), panel(680, 380, 260, 240, C.sky)], {
        rot: -20,
        cx: 500,
        cy: 500,
      }),
      T(
        [[ln('M320 500H380M620 500H680', C.ink, 16)]].reduce(function (a, b) {
          return a.concat(b);
        }),
        { rot: -20, cx: 500, cy: 500 },
      ),
      T(
        [
          [C.yellow, 'R380 400 240 200 20'],
          [C.orange, 'R380 470 240 40', { s: 'none' }],
          [C.violet, 'E500 400 40 20'],
        ],
        { rot: -20, cx: 500, cy: 500 },
      ),
      T([ln('M500 380V300', C.ink, 16), [C.paper, 'E500 280 40 40']], {
        rot: -20,
        cx: 500,
        cy: 500,
      }),
      [[C.mint, 'E300 950 150 30', { s: 'none' }]],
    ),
    'w-astro-22': [].concat(
      space(),
      [[C.sky, 'M170 780L520 120L880 300Z', { s: 'none' }]],
      [[C.paper, 'M200 770L600 250L720 330Z', { s: 'none' }]],
      [
        [C.paper, 'E190 790 120 120', { s: C.sky, w: 16 }],
        [C.yellow, 'E190 790 60 60', { s: 'none' }],
      ],
      dots([
        [700, 700, 8],
        [820, 820, 8],
        [900, 120, 8],
      ]),
    ),
    'w-astro-23': [].concat(
      space(),
      [
        [
          C.green,
          'M-40 1040V800C200 740 800 740 1040 800V1040Z',
          { s: 'none' },
        ],
      ],
      [
        [C.yellow, 'E800 150 60 60', { s: 'none' }],
        [C.ink, 'E825 135 52 52', { s: 'none' }],
      ],
      [[C.paper, 'R240 520 520 300 8']],
      [
        [C.paper, 'M260 520C260 250 740 250 740 520Z', { b: 1 }],
        [C.violet, 'M500 270L540 270L650 520L620 520Z', { i: 1, s: 'none' }],
      ],
      [[C.blue, 'M470 280L530 280L560 520L440 520Z']],
      [
        K.tube(
          [
            [500, 450],
            [640, 250],
          ],
          60,
          C.violet,
        ),
      ],
      [[C.sky, 'E650 242 40 24 -50']],
      [
        [C.brown, 'R440 650 120 170 10'],
        [C.yellow, 'R300 580 70 70', {}],
        [C.yellow, 'R630 580 70 70', {}],
      ],
    ),
    'w-astro-24': [].concat(
      space(),
      T(
        [
          panel(230, 120, 200, 230, C.sky),
          panel(570, 120, 200, 230, C.sky),
          [ln('M330 350V400M670 350V400', C.ink, 16)],
          [[C.violet, 'R320 400 360 260 14']],
          [[C.yellow, 'R320 470 360 30', { s: 'none' }]],
          [[C.paper, 'R230 420 130 220 14']],
          [[C.ink, 'E230 530 40 90', { s: 'none' }]],
          [[C.sky, 'E232 530 28 70', { s: 'none' }]],
          [[C.paper, 'R650 440 140 180 14']],
          [[C.paper, 'E680 400 5 5', { s: 'none' }]],
        ].reduce(function (a, b) {
          return a.concat(b);
        }),
        { dx: 0, dy: 100, s: 0.95, rot: 0, cx: 500, cy: 500 },
      ),
      [[C.red, 'E690 600 20 20', { s: 'none' }]],
    ),
    'w-astro-25': [].concat(
      space(),
      [
        [
          C.brown,
          'M240 420C280 300 420 260 520 290C620 250 760 320 780 440C830 520 760 640 650 680C560 760 400 740 330 670C230 640 190 500 240 420Z',
          { b: 1 },
        ],
      ],
      [
        [
          C.violet,
          'M520 290C620 250 760 320 780 440C830 520 760 640 650 680C560 760 580 520 520 290Z',
          { i: 1, s: 'none' },
        ],
      ],
      [
        [C.orange, 'E380 440 60 46', { i: 1, s: C.ink, w: 7 }],
        [C.orange, 'E560 560 50 40', { i: 1, s: C.ink, w: 7 }],
        [C.orange, 'E640 400 30 24', { i: 1, s: C.ink, w: 7 }],
      ],
      [
        [C.brown, 'M110 180L170 150L210 210L140 240Z'],
        [C.brown, 'M830 770L900 740L930 810L860 840Z'],
        [C.brown, 'E150 760 40 30'],
        [C.brown, 'E860 200 30 24'],
      ],
    ),
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
