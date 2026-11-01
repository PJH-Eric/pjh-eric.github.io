(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C,
    INK = C.ink,
    SK = C.yellow;
  var E = K.E;

  function ln(d, w, col) {
    return ['none', d, { s: col || INK, w: w || 12 }];
  }
  function dot(cx, cy, rx, ry, col) {
    return [col || INK, E(cx, cy, rx, ry), { s: 'none' }];
  }
  function hand(x, y, r) {
    return [SK, E(x, y, r || 38, r || 38), {}];
  }
  function arm(pts, col, r) {
    var p = pts[pts.length - 1];
    return [].concat(K.tube(pts, 62, col), [hand(p[0], p[1], r)]);
  }
  function eye(x, t, y) {
    y = y || 372;
    if (t === 'o') return [dot(x, y, 15, 21)];
    if (t === 'c')
      return [
        ln(
          'M' +
            (x - 28) +
            ' ' +
            (y + 8) +
            'Q' +
            x +
            ' ' +
            (y - 28) +
            ' ' +
            (x + 28) +
            ' ' +
            (y + 8),
          12,
        ),
      ];
    if (t === 'u')
      return [
        ln(
          'M' +
            (x - 28) +
            ' ' +
            (y - 4) +
            'Q' +
            x +
            ' ' +
            (y + 24) +
            ' ' +
            (x + 28) +
            ' ' +
            (y - 4),
          12,
        ),
      ];
    if (t === 'l')
      return [ln('M' + (x - 30) + ' ' + y + 'L' + (x + 30) + ' ' + y, 12)];
    if (t === 'f') return [[INK, E(x, y, 32, 8), { s: 'none' }]];
    if (t === 'w')
      return [[C.paper, E(x, y, 44, 50), { w: 8 }], dot(x, y + 4, 16, 18)];
    if (t === 'L') return [dot(x - 8, y - 14, 15, 21)];
    return [];
  }
  function eyes(t, t2) {
    return [].concat(eye(430, t), eye(570, t2 || t));
  }
  function brows(t) {
    var a = {
      flat: ['M390 330L460 330', 'M540 330L610 330'],
      angry: ['M385 320L460 350', 'M615 320L540 350'],
      sad: ['M385 350L460 322', 'M615 350L540 322'],
      up: ['M390 335Q425 300 460 330', 'M540 330Q575 300 610 335'],
    }[t];
    return [ln(a[0], 14), ln(a[1], 14)];
  }
  var smile = ln('M430 460Q500 530 570 460', 12);
  /* bust: back layers (torso, neck, head). hair: color or null */
  function bust(shirt, hair, hat) {
    var L = [
      [
        shirt,
        'M300 965L300 770C300 650 400 610 500 610C600 610 700 650 700 770L700 965Z',
        {},
      ],
      [SK, 'R455 520 90 110 20', {}],
      [SK, E(332, 400, 26, 40), {}],
      [SK, E(668, 400, 26, 40), {}],
      [SK, E(500, 390, 170, 180), {}],
    ];
    if (hair)
      L.push([
        hair,
        'M330 380C300 200 410 195 500 195C590 195 700 200 670 380C640 290 570 255 500 255C430 255 360 290 330 380Z',
        {},
      ]);
    return L;
  }
  var NOSE = [dot(500, 425, 9, 7, C.orange)];
  function face(e, br, m, more) {
    return [].concat(
      eyes(e),
      br ? brows(br) : [],
      NOSE,
      m ? [m] : [],
      more || [],
    );
  }
  function small(shirt, hair, dx) {
    return K.T(bust(shirt, hair).concat(face('o', 'flat', smile)), {
      s: 0.5,
      cx: 500,
      cy: 965,
      dx: dx,
      dy: -60,
    });
  }
  function note(x, y, col) {
    return [
      [col || C.violet, E(x, y, 26, 20, -20), {}],
      ln('M' + (x + 22) + ' ' + (y - 6) + 'L' + (x + 22) + ' ' + (y - 110), 12),
      ln(
        'M' +
          (x + 22) +
          ' ' +
          (y - 110) +
          'Q' +
          (x + 60) +
          ' ' +
          (y - 90) +
          ' ' +
          (x + 58) +
          ' ' +
          (y - 60),
        12,
      ),
    ];
  }
  var HB = C.brown;
  var shirtA = C.sky,
    shirtB = C.mint,
    shirtC = C.pink;
  function cat() {
    return [].concat.apply([], arguments);
  }

  var cheeks = [dot(385, 450, 40, 26, C.pink), dot(615, 450, 40, 26, C.pink)];

  var r = {};

  r['w-expression-16'] = cat(
    bust(shirtA, HB),
    face('L', 'up', ln('M445 475Q480 455 500 478Q525 500 560 470', 12)),
    [ln('M600 360L650 330', 8)],
    arm(
      [
        [640, 700],
        [790, 580],
        [650, 250],
      ],
      shirtA,
    ),
    [dot(785, 300, 18, 26, C.sky)],
  );

  r['w-expression-17'] = cat(
    bust(C.violet, HB),
    face('f', 'angry', ln('M440 490Q500 440 560 490', 12)),
    [ln('M488 300L488 330M512 300L512 330', 8)],
  );

  r['w-expression-18'] = cat(
    bust(shirtB),
    face('x', null, null),
    [
      [C.red, E(500, 480, 42, 52), {}],
      [C.paper, 'R560 430 160 140 24', { w: 8 }],
      ln('M590 470L700 470M590 505L700 505', 6, C.sky),
    ],
    [ln('M410 340L458 372L410 400', 12), ln('M590 340L542 372L590 400', 12)],
    [
      dot(380, 560, 12, 12, C.sky),
      dot(500, 590, 12, 12, C.sky),
      dot(430, 600, 10, 10, C.sky),
    ],
  );

  r['w-expression-19'] = cat(
    bust(C.orange, HB),
    face('c', 'sad', null),
    arm(
      [
        [640, 710],
        [740, 580],
        [520, 490],
      ],
      C.orange,
      46,
    ),
    [ln('M380 430L320 410M380 470L310 480M395 510L335 545', 10)],
  );

  r['w-expression-20'] = cat(
    bust(C.red, HB),
    face('c', 'up', ln('M440 450Q500 540 560 450Z', 10)),
    [
      [C.red, 'M440 450Q500 540 560 450Z', { s: INK, w: 10 }],
      [C.paper, 'M455 455L545 455Q500 490 455 455Z', { s: 'none' }],
    ],
    arm(
      [
        [360, 720],
        [380, 640],
        [490, 640],
      ],
      C.red,
    ),
    arm(
      [
        [640, 720],
        [620, 640],
        [510, 640],
      ],
      C.red,
    ),
    [ln('M330 560L290 520M670 560L710 520M500 520L500 470', 12)],
  );

  r['w-expression-21'] = cat(
    bust(C.blue, null),
    face('o', 'flat', ln('M450 475L550 475', 12)),
    [
      [C.blue, 'M335 330C335 200 400 170 500 170C600 170 665 200 665 330Z', {}],
      [C.blue, 'R320 310 360 36 14', {}],
      [C.yellow, E(500, 245, 26, 26), {}],
    ],
    arm(
      [
        [640, 710],
        [800, 590],
        [610, 330],
      ],
      C.blue,
      36,
    ),
  );

  r['w-expression-22'] = cat(
    small(shirtA, HB, -200),
    small(C.red, null, 200),
    arm(
      [
        [395, 820],
        [470, 760],
      ],
      shirtA,
    ),
    arm(
      [
        [605, 820],
        [530, 760],
      ],
      C.red,
    ),
    [hand(500, 760, 44)],
  );

  r['w-expression-23'] = cat(
    bust(C.pink, HB),
    cheeks,
    [
      [C.paper, E(430, 365, 30, 36), { w: 8 }],
      dot(430, 370, 20, 24),
      [C.paper, E(436, 360, 7, 7), { s: 'none' }],
      [C.paper, E(570, 365, 30, 36), { w: 8 }],
      dot(570, 370, 20, 24),
      [C.paper, E(576, 360, 7, 7), { s: 'none' }],
    ],
    NOSE,
    [ln('M465 470Q485 495 500 470Q515 495 535 470', 10)],
    arm(
      [
        [340, 800],
        [350, 680],
        [420, 600],
      ],
      C.pink,
      40,
    ),
    arm(
      [
        [660, 800],
        [650, 680],
        [580, 600],
      ],
      C.pink,
      40,
    ),
    [
      [
        C.red,
        'M860 300C860 250 930 250 930 300C930 250 1000 250 1000 300C1000 350 930 390 930 400C930 390 860 350 860 300Z',
        { w: 8 },
      ],
    ],
  );

  r['w-expression-24'] = cat(
    bust(C.violet, HB),
    brows('angry'),
    [
      [C.paper, E(430, 375, 44, 50), { w: 8 }],
      dot(430, 378, 13, 15),
      [C.paper, E(570, 375, 44, 50), { w: 8 }],
      dot(570, 378, 13, 15),
    ],
    NOSE,
    [ln('M450 485L550 485', 12)],
  );

  r['w-expression-25'] = cat(
    bust(C.mint, HB),
    cheeks,
    face('c', null, ln('M430 470Q470 520 520 475', 12)),
    arm(
      [
        [640, 710],
        [740, 600],
        [580, 480],
      ],
      C.mint,
      42,
    ),
  );

  r['w-expression-26'] = cat(
    bust(C.red, HB),
    face('x', 'angry', null),
    [
      [C.red, E(500, 490, 62, 80), {}],
      [C.pink, E(500, 535, 40, 28), { s: 'none' }],
    ],
    [ln('M410 340L458 372L410 400', 12), ln('M590 340L542 372L590 400', 12)],
    arm(
      [
        [330, 740],
        [270, 600],
        [350, 480],
      ],
      C.red,
      42,
    ),
    arm(
      [
        [670, 740],
        [730, 600],
        [650, 480],
      ],
      C.red,
      42,
    ),
    [
      ln(
        'M250 400Q200 480 250 560M170 360Q100 480 170 600M750 400Q800 480 750 560M830 360Q900 480 830 600',
        12,
        C.blue,
      ),
    ],
  );

  r['w-expression-27'] = cat(bust(C.orange, HB), face('o', 'up', null), [
    [C.red, 'M440 465Q500 530 560 465Q500 480 440 465Z', {}],
    [C.pink, E(500, 495, 24, 14), { s: 'none' }],
    [
      C.sky,
      'M555 480C575 520 590 540 560 580C530 540 545 520 555 480Z',
      { w: 8 },
    ],
    [
      C.sky,
      'M570 580C590 620 600 640 570 670C545 640 555 620 570 580Z',
      { w: 8 },
    ],
  ]);

  r['w-expression-28'] = cat(
    bust(C.sky, HB),
    eyes('u'),
    NOSE,
    [
      [C.red, E(380, 450, 50, 34), { s: 'none' }],
      [C.red, E(620, 450, 50, 34), { s: 'none' }],
      ln('M455 485Q500 510 545 485', 12),
    ],
    [ln('M360 300L330 260M640 300L670 260M500 270L500 220', 12, C.red)],
  );

  r['w-expression-29'] = cat(
    bust(C.violet, HB),
    eyes('c', 'w'),
    brows('up'),
    NOSE,
    [
      [C.red, 'M420 470Q500 450 585 480Q560 570 480 560Q430 540 420 470Z', {}],
      [C.pink, 'M470 520Q500 700 560 650Q590 570 560 530Z', {}],
      ln('M520 530L530 620', 8),
    ],
    arm(
      [
        [330, 760],
        [240, 620],
        [310, 420],
      ],
      C.violet,
      36,
    ),
    arm(
      [
        [670, 760],
        [760, 620],
        [690, 420],
      ],
      C.violet,
      36,
    ),
  );

  r['w-expression-30'] = cat(
    bust(C.green, HB),
    eyes('w'),
    brows('up'),
    [hand(500, 490, 78)].concat(
      arm(
        [
          [330, 740],
          [310, 600],
          [440, 500],
        ],
        C.green,
        70,
      ),
    ),
    [ln('M500 450L500 530M470 450L470 520M530 450L530 520', 6, C.orange)],
  );

  r['w-expression-31'] = cat(
    small(C.red, HB, -230),
    small(C.blue, null, 230),
    arm(
      [
        [390, 840],
        [430, 620],
        [500, 460],
      ],
      C.red,
      40,
    ),
    arm(
      [
        [610, 840],
        [570, 620],
        [500, 460],
      ],
      C.blue,
      40,
    ),
    [ln('M470 340L450 290M500 330L500 270M530 340L550 290', 12, C.orange)],
  );

  r['w-expression-32'] = cat(
    bust(C.blue, HB),
    face('o', 'up', ln('M450 485Q500 465 550 485', 12)),
    arm(
      [
        [350, 740],
        [250, 760],
        [220, 640],
      ],
      C.blue,
      44,
    ),
    arm(
      [
        [650, 740],
        [750, 760],
        [780, 640],
      ],
      C.blue,
      44,
    ),
  );

  r['w-expression-33'] = cat(
    arm(
      [
        [360, 700],
        [260, 480],
        [350, 160],
      ],
      C.orange,
      44,
    ),
    arm(
      [
        [640, 700],
        [740, 480],
        [650, 160],
      ],
      C.orange,
      44,
    ),
    bust(C.orange, HB),
    face('c', null, null),
    [[C.red, E(500, 490, 40, 50), {}]],
  );

  r['w-expression-34'] = cat(
    bust(C.pink, HB),
    face('o', 'up', ln('M430 460Q500 500 570 460', 12)),
    [
      [C.pink, 'M465 470Q500 480 535 470Q540 600 500 610Q460 600 465 470Z', {}],
      ln('M500 490L500 560', 8),
    ],
  );

  r['w-expression-35'] = cat(
    bust(C.sky, HB),
    eyes('c'),
    brows('flat'),
    NOSE,
    [
      [C.red, E(500, 500, 60, 78), {}],
      [C.pink, E(500, 540, 38, 26), { s: 'none' }],
    ],
    [dot(385, 420, 12, 18, C.sky), dot(615, 420, 12, 18, C.sky)],
    arm(
      [
        [660, 740],
        [780, 620],
        [640, 560],
      ],
      C.sky,
      46,
    ),
  );

  r['w-expression-36'] = cat(
    bust(C.red, HB),
    face('o', null, ln('M430 460Q500 530 570 460', 12)),
    arm(
      [
        [650, 750],
        [790, 650],
        [740, 520],
      ],
      C.red,
      52,
    ),
    K.tube(
      [
        [720, 500],
        [690, 330],
      ],
      34,
      SK,
    ),
    K.tube(
      [
        [765, 500],
        [810, 340],
      ],
      34,
      SK,
    ),
  );

  r['w-expression-37'] = cat(
    bust(C.mint, HB),
    eyes('L'),
    brows('up'),
    NOSE,
    [[C.red, E(500, 480, 20, 24), {}]],
    note(740, 430, C.violet),
    note(850, 300, C.orange),
  );

  r['w-expression-38'] = cat(
    bust(C.violet, HB),
    eyes('u'),
    NOSE,
    [ln('M460 490Q500 505 540 490', 12)],
    [[C.paper, E(560, 455, 30, 30), { w: 8 }]],
    [
      ln('M720 330L810 330L720 420L810 420', 12, C.blue),
      ln('M830 190L890 190L830 250L890 250', 12, C.blue),
    ],
  );

  r['w-expression-39'] = cat(
    bust(C.orange, HB),
    eyes('L'),
    brows('sad'),
    NOSE,
    [ln('M440 490Q470 465 500 490Q530 515 565 480', 12)],
    [
      [
        C.sky,
        'M650 250C690 320 700 350 660 380C620 350 630 320 650 250Z',
        { w: 8 },
      ],
    ],
  );

  r['w-expression-40'] = cat(
    bust(C.green, HB),
    eyes('f'),
    brows('angry'),
    NOSE,
    [ln('M450 485L550 485', 12)],
    K.sun(160, 160, 70),
  );

  r['w-expression-41'] = cat(
    bust(C.blue, HB),
    face('o', 'flat', null),
    cheeks,
    [
      [C.pink, E(500, 485, 52, 14), { w: 8 }],
      ln('M440 480Q430 470 420 478M560 480Q570 470 580 478', 8),
    ],
  );

  r['w-expression-42'] = cat(
    bust(C.red, HB),
    face('o', 'up', ln('M430 460Q500 530 570 460', 12)),
    arm(
      [
        [360, 780],
        [400, 800],
        [490, 770],
      ],
      C.red,
      40,
    ),
    arm(
      [
        [640, 780],
        [600, 800],
        [510, 770],
      ],
      C.red,
      40,
    ),
    [ln('M420 720L400 690M580 720L600 690M500 700L500 660', 12, C.orange)],
  );

  r['w-expression-43'] = cat(
    bust(C.violet, HB),
    brows('angry'),
    eyes('f'),
    NOSE,
    [
      [C.paper, 'R425 445 150 70 22', { w: 10 }],
      ln('M475 447L475 513M525 447L525 513M425 480L575 480', 7),
    ],
    [ln('M360 520L320 540M640 520L680 540', 10)],
  );

  r['w-expression-44'] = cat(bust(C.sky, HB), eyes('o'), NOSE, [
    ln('M385 345L460 340', 14),
    ln('M540 300Q580 265 620 295', 14),
    ln('M440 490Q500 480 560 450', 12),
  ]);

  r['w-expression-45'] = cat(bust(C.green, HB), eyes('o'), brows('up'), NOSE, [
    [C.red, E(500, 500, 80, 66), {}],
    [C.paper, 'R440 440 120 24 8', { w: 7 }],
    [C.pink, E(500, 535, 44, 22), { s: 'none' }],
  ]);

  r['w-expression-46'] = cat(
    bust(C.pink, HB),
    cheeks,
    eye(430, 'o'),
    eye(570, 'c'),
    brows('up'),
    NOSE,
    [ln('M455 470Q480 495 500 470Q520 495 545 470', 10)],
    arm(
      [
        [640, 800],
        [740, 680],
        [640, 470],
      ],
      C.pink,
      30,
    ),
    K.tube(
      [
        [640, 470],
        [590, 450],
      ],
      26,
      SK,
    ),
    [
      [
        C.red,
        'M840 300C840 250 910 250 910 300C910 250 980 250 980 300C980 350 910 390 910 400C910 390 840 350 840 300Z',
        { w: 8 },
      ],
    ],
  );

  /* jobs */
  function stetho() {
    return [
      ln('M400 640Q410 800 500 800Q590 800 600 640', 12),
      [C.sky, E(500, 810, 26, 26), { w: 8 }],
    ];
  }
  r['w-job-0'] = cat(
    bust(C.paper, HB),
    face('o', 'flat', smile),
    [
      [
        C.paper,
        'M340 330C340 200 400 170 500 170C600 170 660 200 660 330Z',
        {},
      ],
      [C.red, 'R480 215 40 14 4', { s: 'none' }],
    ],
    stetho(),
    [
      [C.red, 'R620 760 90 26 6', { s: 'none' }],
      [C.red, 'R652 728 26 90 6', { s: 'none' }],
    ],
  );

  r['w-job-1'] = cat(
    [
      [C.brown, 'R80 80 840 600 20', {}],
      [C.green, 'R110 110 780 540 10', {}],
      ln('M180 200L460 200M180 280L400 280M180 360L520 360', 12, C.paper),
    ],
    bust(C.mint, HB),
    face('o', 'flat', smile),
    [
      ['none', E(430, 372, 36, 36), { s: INK, w: 10 }],
      ['none', E(570, 372, 36, 36), { s: INK, w: 10 }],
      ln('M466 372L534 372', 8),
    ],
    arm(
      [
        [650, 740],
        [790, 640],
        [820, 420],
      ],
      C.mint,
      38,
    ),
    K.tube(
      [
        [820, 420],
        [880, 150],
      ],
      22,
      C.brown,
    ),
  );

  r['w-job-2'] = cat(
    bust(C.blue, null),
    face('o', 'flat', ln('M450 475L550 475', 12)),
    [
      [C.blue, 'M335 330C335 200 400 170 500 170C600 170 665 200 665 330Z', {}],
      [INK, 'R320 310 360 36 14', {}],
      [C.yellow, E(500, 245, 28, 28), {}],
    ],
    [[C.yellow, E(590, 720, 30, 36), {}], ln('M500 620L500 960', 8, C.ink)],
  );

  r['w-job-3'] = cat(
    [
      [
        C.orange,
        'M740 960C640 800 700 700 720 600C780 680 860 760 840 860C830 910 800 940 770 960Z',
        {},
      ],
      [
        C.yellow,
        'M770 960C720 880 760 820 790 780C830 840 840 900 810 960Z',
        { s: 'none' },
      ],
    ],
    bust(C.red, null),
    face('o', 'flat', smile),
    [
      [C.red, 'M330 320C330 190 400 150 500 150C600 150 670 190 670 320Z', {}],
      [C.red, 'R300 300 400 44 16', {}],
      [C.yellow, E(500, 230, 30, 36), {}],
    ],
    [[C.yellow, 'R300 820 400 40', { s: 'none' }]],
  );

  r['w-job-4'] = cat(
    bust(C.paper, HB),
    face('o', 'flat', smile),
    [
      [
        C.paper,
        'M340 250C250 250 250 100 380 120C400 40 600 40 620 120C750 100 750 250 660 250Z',
        {},
      ],
      [C.paper, 'R340 230 320 70 10', {}],
    ],
    [
      [C.red, 'M455 620L545 620L500 690Z', {}],
      [C.paper, 'R400 700 200 260 20', {}],
      dot(450, 780, 12, 12),
      dot(450, 850, 12, 12),
    ],
    arm(
      [
        [690, 740],
        [790, 640],
        [820, 520],
      ],
      C.paper,
      36,
    ),
    K.tube(
      [
        [820, 520],
        [820, 350],
      ],
      22,
      C.brown,
    ),
    [[C.orange, E(820, 330, 36, 50), {}]],
  );

  r['w-job-5'] = cat(
    [
      [C.paper, 'R760 200 200 330 8', {}],
      [C.sky, 'R780 220 160 190', { s: 'none' }],
      [C.mint, 'M780 410L840 300L900 380L940 330L940 410Z', { s: 'none' }],
    ],
    bust(C.violet, HB),
    face('o', 'flat', smile),
    [
      [C.red, E(500, 205, 190, 70, -8), {}],
      [C.red, E(540, 150, 18, 18), {}],
    ],
    [
      [C.orange, E(250, 760, 110, 80, -15), {}],
      dot(210, 730, 18, 18, C.red),
      dot(260, 710, 18, 18, C.sky),
      dot(300, 760, 18, 18, C.green),
    ],
    arm(
      [
        [650, 780],
        [720, 700],
        [600, 600],
      ],
      C.violet,
      34,
    ),
    K.tube(
      [
        [600, 600],
        [530, 520],
      ],
      18,
      C.brown,
    ),
    [[C.red, E(520, 506, 18, 24, -30), {}]],
  );

  r['w-job-6'] = cat(
    [
      [
        C.violet,
        'M0 965L0 800C300 760 700 760 1000 800L1000 965Z',
        { s: 'none' },
      ],
    ],
    bust(C.pink, HB),
    face('c', 'up', null),
    [[C.red, E(500, 480, 36, 44), {}]],
    arm(
      [
        [650, 800],
        [690, 680],
        [570, 540],
      ],
      C.pink,
      36,
    ),
    K.tube(
      [
        [570, 540],
        [540, 480],
      ],
      20,
      INK,
    ),
    [[C.violet, E(525, 450, 38, 38), {}]],
    note(160, 420, C.violet),
    note(840, 300, C.orange),
  );

  r['w-job-7'] = cat(
    K.tube(
      [
        [820, 960],
        [820, 330],
      ],
      22,
      C.brown,
    ),
    [ln('M770 250L770 350L870 350L870 250M820 220L820 350', 14)],
    bust(C.mint, HB),
    face('o', 'flat', smile),
    [
      [
        C.blue,
        'M360 965L360 760L420 700L420 640L580 640L580 700L640 760L640 965Z',
        {},
      ],
      [C.yellow, E(420, 740, 14, 14), { s: 'none' }],
      [C.yellow, E(580, 740, 14, 14), { s: 'none' }],
    ],
    [
      [C.yellow, E(500, 215, 270, 60), {}],
      [C.yellow, 'M360 220C360 120 640 120 640 220Z', {}],
      [C.brown, 'R365 195 270 30', { s: 'none' }],
    ],
    arm(
      [
        [650, 780],
        [740, 720],
        [800, 600],
      ],
      C.mint,
      36,
    ),
  );

  r['w-job-8'] = cat(
    bust(C.green, null),
    face('o', 'flat', smile),
    [
      [
        C.green,
        'M335 330C335 200 400 170 500 170C600 170 665 200 665 330Z',
        {},
      ],
      [C.green, 'R320 310 360 36 14', {}],
      [C.yellow, E(500, 245, 24, 24), {}],
    ],
    K.tube(
      [
        [330, 640],
        [680, 960],
      ],
      44,
      C.brown,
    ),
    [
      [C.brown, 'R620 780 240 190 24', {}],
      [C.paper, 'R690 800 100 70', {}],
      ln('M690 800L740 835L790 800', 8),
    ],
    arm(
      [
        [340, 740],
        [300, 800],
        [330, 850],
      ],
      C.green,
      34,
    ),
  );

  Object.assign(R, r);
})(typeof globalThis !== 'undefined' ? globalThis : this);
