(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;
  var PI = Math.PI;
  function star(cx, cy, R1, r1, n, fill, o) {
    var d = '',
      i,
      a,
      rr;
    for (i = 0; i < n * 2; i++) {
      a = -PI / 2 + (i * PI) / n;
      rr = i % 2 ? r1 : R1;
      d +=
        (i ? 'L' : 'M') +
        Math.round(cx + rr * Math.cos(a)) +
        ' ' +
        Math.round(cy + rr * Math.sin(a));
    }
    return [fill, d + 'Z', o || { s: 'none' }];
  }
  var FB = 'R200 280 600 400';
  function pole() {
    return [
      [C.brown, 'R150 240 28 600 8'],
      [C.yellow, 'E164 236 24 24'],
      [C.mint, 'R120 840 200 30 12', { s: 'none' }],
    ];
  }
  function flag(inner) {
    return [].concat(pole(), [[C.paper, FB, { b: 1 }]], inner, [
      ['none', FB, { s: C.ink, w: 7 }],
    ]);
  }
  function iR(col, x, y, w, h) {
    return [col, 'R' + x + ' ' + y + ' ' + w + ' ' + h, { i: 1, s: 'none' }];
  }
  function human(x, y, h, o) {
    o = o || {};
    var s = h / 700,
      skin = o.skin || C.yellow,
      shirt = o.shirt || C.blue,
      pants = o.pants || C.brown;
    var hx = x,
      hy = y - 560 * s,
      L = [];
    L.push(
      K.tube(
        [
          [x - 35 * s, y - 330 * s],
          [x - 40 * s, y - 20 * s],
        ],
        56 * s,
        pants,
      ),
    );
    L.push(
      K.tube(
        [
          [x + 35 * s, y - 330 * s],
          [x + 40 * s, y - 20 * s],
        ],
        56 * s,
        pants,
      ),
    );
    L.push([
      C.ink,
      'E' + (x - 45 * s) + ' ' + y + ' ' + 50 * s + ' ' + 22 * s,
      { s: C.ink },
    ]);
    L.push([
      C.ink,
      'E' + (x + 45 * s) + ' ' + y + ' ' + 50 * s + ' ' + 22 * s,
      { s: C.ink },
    ]);
    L.push(
      K.tube(
        o.armL || [
          [x - 70 * s, y - 470 * s],
          [x - 110 * s, y - 300 * s],
        ],
        50 * s,
        skin,
      ),
    );
    L.push(
      K.tube(
        o.armR || [
          [x + 70 * s, y - 470 * s],
          [x + 110 * s, y - 300 * s],
        ],
        50 * s,
        skin,
      ),
    );
    L.push([
      shirt,
      'R' +
        (x - 85 * s) +
        ' ' +
        (y - 500 * s) +
        ' ' +
        170 * s +
        ' ' +
        200 * s +
        ' ' +
        40 * s,
    ]);
    L.push([skin, 'E' + hx + ' ' + hy + ' ' + 62 * s + ' ' + 68 * s]);
    L.push([
      C.ink,
      'E' + (hx - 22 * s) + ' ' + (hy - 5 * s) + ' ' + 7 * s + ' ' + 9 * s,
      { s: 'none' },
    ]);
    L.push([
      C.ink,
      'E' + (hx + 22 * s) + ' ' + (hy - 5 * s) + ' ' + 7 * s + ' ' + 9 * s,
      { s: 'none' },
    ]);
    L.push([
      'none',
      'M' +
        (hx - 20 * s) +
        ' ' +
        (hy + 28 * s) +
        'Q' +
        hx +
        ' ' +
        (hy + 45 * s) +
        ' ' +
        (hx + 20 * s) +
        ' ' +
        (hy + 28 * s),
      { s: C.ink, w: 7 },
    ]);
    if (o.hair !== false)
      L.push([
        o.hair || C.brown,
        'M' +
          (hx - 64 * s) +
          ' ' +
          (hy - 8 * s) +
          'C' +
          (hx - 64 * s) +
          ' ' +
          (hy - 85 * s) +
          ' ' +
          (hx + 64 * s) +
          ' ' +
          (hy - 85 * s) +
          ' ' +
          (hx + 64 * s) +
          ' ' +
          (hy - 8 * s) +
          'C' +
          (hx + 30 * s) +
          ' ' +
          (hy - 45 * s) +
          ' ' +
          (hx - 30 * s) +
          ' ' +
          (hy - 45 * s) +
          ' ' +
          (hx - 64 * s) +
          ' ' +
          (hy - 8 * s) +
          'Z',
      ]);
    return L;
  }
  function shell(x, y, s, f) {
    var p = f
      ? [
          [0, 0],
          [-10, -200],
          [-120, -330],
          [-280, -360],
          [-240, -250],
          [-230, -120],
          [-250, 0],
        ]
      : [
          [0, 0],
          [10, -200],
          [120, -330],
          [280, -360],
          [240, -250],
          [230, -120],
          [250, 0],
        ];
    function q(i) {
      return Math.round(x + p[i][0] * s) + ' ' + Math.round(y + p[i][1] * s);
    }
    return [
      C.yellow,
      'M' +
        q(0) +
        'C' +
        q(1) +
        ' ' +
        q(2) +
        ' ' +
        q(3) +
        'C' +
        q(4) +
        ' ' +
        q(5) +
        ' ' +
        q(6) +
        'Z',
    ];
  }
  function hkPetals() {
    var L = [],
      i,
      a;
    for (i = 0; i < 5; i++) {
      a = i * 72;
      L.push([
        C.paper,
        'E' +
          Math.round(500 + 85 * Math.sin((a * PI) / 180)) +
          ' ' +
          Math.round(480 - 85 * Math.cos((a * PI) / 180)) +
          ' 42 90 ' +
          a,
        { i: 1, s: C.ink, w: 7 },
      ]);
    }
    L.push([C.red, 'E500 480 18 18', { i: 1, s: 'none' }]);
    return L;
  }
  function ballotBox(x, y, w, h) {
    return [
      [C.blue, 'R' + x + ' ' + (y + 40) + ' ' + w + ' ' + h + ' 12'],
      [C.sky, 'R' + (x - 20) + ' ' + y + ' ' + (w + 40) + ' 60 10'],
      [
        C.ink,
        'R' + (x + w / 2 - 90) + ' ' + (y + 18) + ' 180 22 8',
        { s: 'none' },
      ],
    ];
  }
  function ballot(x, y, w, h) {
    return [
      [C.paper, 'R' + x + ' ' + y + ' ' + w + ' ' + h + ' 10'],
      [
        'none',
        'M' +
          (x + w * 0.2) +
          ' ' +
          (y + h * 0.35) +
          'L' +
          (x + w * 0.4) +
          ' ' +
          (y + h * 0.5) +
          'L' +
          (x + w * 0.75) +
          ' ' +
          (y + h * 0.2),
        { s: C.green, w: 16 },
      ],
      [
        'none',
        'M' + (x + w * 0.2) + ' ' + (y + h * 0.75) + 'H' + (x + w * 0.8),
        { s: C.ink, w: 7 },
      ],
    ];
  }
  function bookPage(col, x, y, w, h) {
    return [col, 'R' + x + ' ' + y + ' ' + w + ' ' + h + ' 14'];
  }

  Object.assign(R, {
    'w-geography-55': flag([
      iR(C.blue, 200, 320, 600, 50),
      iR(C.blue, 200, 590, 600, 50),
      ['none', 'M500 390L575 515L425 515Z', { i: 1, s: C.blue, w: 16 }],
      ['none', 'M425 445L575 445L500 570Z', { i: 1, s: C.blue, w: 16 }],
    ]),
    'w-geography-56': flag([
      iR(C.blue, 200, 280, 600, 400),
      iR(C.yellow, 340, 280, 90, 400),
      iR(C.yellow, 200, 440, 600, 90),
    ]),
    'w-geography-57': flag([
      iR(C.red, 200, 280, 600, 400),
      iR(C.paper, 320, 280, 130, 400),
      iR(C.paper, 200, 420, 600, 130),
      iR(C.blue, 355, 280, 60, 400),
      iR(C.blue, 200, 455, 600, 60),
    ]),
    'w-geography-58': flag([
      iR(C.red, 200, 280, 600, 400),
      iR(C.paper, 340, 280, 90, 400),
      iR(C.paper, 200, 440, 600, 90),
    ]),
    'w-geography-59': flag([iR(C.red, 200, 480, 600, 200)]),
    'w-geography-60': flag([
      iR(C.red, 200, 480, 600, 200),
      [C.blue, 'M200 280L200 680L500 480Z', { i: 1, s: C.ink, w: 7 }],
    ]),
    'w-geography-61': flag([
      iR(C.red, 200, 280, 600, 135),
      iR(C.red, 200, 545, 600, 135),
    ]),
    'w-geography-62': flag([
      iR(C.green, 200, 280, 250, 400),
      iR(C.red, 450, 280, 350, 400),
      [C.yellow, 'E450 480 70 70', { i: 1, s: C.ink, w: 16 }],
      [C.paper, 'E450 480 32 32', { i: 1, s: C.ink, w: 7 }],
    ]),
    'w-geography-63': flag([
      iR(C.green, 200, 280, 200, 400),
      iR(C.orange, 600, 280, 200, 400),
    ]),
    'w-geography-64': flag([
      iR(C.red, 200, 480, 600, 200),
      iR(C.blue, 200, 280, 230, 200),
      star(315, 380, 70, 28, 5, C.paper),
    ]),
    'w-geography-65': flag([
      iR(C.red, 200, 280, 200, 400),
      iR(C.red, 600, 280, 200, 400),
      [C.green, 'E500 480 50 50', { i: 1, s: C.ink, w: 7 }],
    ]),
    'w-geography-66': flag([
      iR(C.blue, 200, 280, 600, 80),
      iR(C.blue, 200, 440, 600, 80),
      iR(C.blue, 200, 600, 600, 80),
      [C.red, 'M200 280L200 680L440 480Z', { i: 1, s: C.ink, w: 7 }],
      star(285, 480, 55, 22, 5, C.paper),
    ]),
    'w-geography-67': flag([
      iR(C.red, 200, 280, 600, 400),
      star(500, 480, 120, 48, 5, C.green),
    ]),
    'w-geography-68': flag([
      iR(C.green, 200, 280, 600, 135),
      iR(C.yellow, 200, 415, 600, 130),
      iR(C.red, 200, 545, 600, 135),
      [C.blue, 'E500 480 85 85', { i: 1, s: C.ink, w: 7 }],
      star(500, 480, 62, 26, 5, C.yellow),
    ]),
    // Dubai
    'w-geography-69': [
      [C.yellow, 'M60 800C250 740 750 740 940 800L940 880L60 880Z'],
      [C.orange, 'E800 300 70 70', { s: 'none' }],
      [C.blue, 'R190 560 140 270 8'],
      [C.sky, 'R690 480 150 350 8'],
      [
        'none',
        'M220 600H300M220 660H300M220 720H300M720 540H810M720 610H810M720 680H810M720 750H810',
        { s: C.paper, w: 16 },
      ],
      [
        C.violet,
        'M500 90L522 300L548 300L562 500L592 500L612 810L388 810L408 500L438 500L452 300L478 300Z',
        { b: 1 },
      ],
      [
        C.sky,
        'M500 90L522 300L548 300L562 500L592 500L612 810L500 810Z',
        { i: 1, s: 'none' },
      ],
      ['none', 'M460 330H540M440 520H560', { s: C.ink, w: 7 }],
    ],
    // Hong Kong: bauhinia flag
    'w-geography-70': flag([iR(C.red, 200, 280, 600, 400)].concat(hkPetals())),
    // Macau: green flag with lotus
    'w-geography-71': flag([
      iR(C.green, 200, 280, 600, 400),
      [C.paper, 'E500 420 30 70', { i: 1, s: C.ink, w: 7 }],
      [C.paper, 'E440 440 28 66 -35', { i: 1, s: C.ink, w: 7 }],
      [C.paper, 'E560 440 28 66 35', { i: 1, s: C.ink, w: 7 }],
      [
        C.paper,
        'M370 520Q500 600 630 520L630 545Q500 625 370 545Z',
        { i: 1, s: C.ink, w: 7 },
      ],
      star(500, 330, 20, 8, 5, C.yellow),
      star(420, 345, 14, 6, 5, C.yellow),
      star(580, 345, 14, 6, 5, C.yellow),
    ]),
    // Eiffel
    'w-geography-72': [
      [C.mint, 'M80 820C300 770 700 770 920 820L920 880L80 880Z'],
      [
        C.brown,
        'M500 130L535 330L570 480L650 700L730 830L620 830L560 710Q500 650 440 710L380 830L270 830L350 700L430 480L465 330Z',
        { b: 1 },
      ],
      [C.yellow, 'R392 600 216 34 6', { s: C.ink }],
      [C.yellow, 'R430 435 140 28 6', { s: C.ink }],
      [C.yellow, 'R462 320 76 24 6', { s: C.ink }],
      ['none', 'M500 130L500 70', { s: C.ink, w: 16 }],
      [
        'none',
        'M440 480L560 600M560 480L440 600M400 635L430 700M600 635L570 700M470 330L530 435M530 330L470 435',
        { s: C.ink, w: 7 },
      ],
      [C.sky, 'E800 250 70 40', { s: 'none' }],
      [C.sky, 'E200 330 80 40', { s: 'none' }],
    ],
    // Statue of Liberty
    'w-geography-73': [
      [C.violet, 'R340 830 320 50 8'],
      [C.violet, 'R385 690 230 150 6'],
      [C.mint, 'M395 700L420 420Q500 370 580 420L610 700Z', { b: 1 }],
      [C.green, 'M500 420L610 700L540 700Z', { i: 1, s: 'none' }],
      [
        'none',
        'M440 520L450 690M500 520L500 690M560 520L555 690',
        { s: C.green, w: 7 },
      ],
      K.tube(
        [
          [590, 440],
          [660, 340],
          [665, 230],
        ],
        46,
        C.mint,
      ),
      [C.paper, 'R690 140 40 70 6'].slice(0, 0),
      [C.brown, 'R646 190 40 50 6'],
      [C.yellow, 'M630 190Q640 100 668 70Q700 110 704 190Z'],
      [C.orange, 'M650 190Q660 140 668 120Q684 150 686 190Z', { s: 'none' }],
      [C.paper, 'R385 500 85 130 10', { s: C.ink }],
      [C.mint, 'E490 350 52 58'],
      [
        C.mint,
        'M440 325L420 255L460 305ZM470 310L465 235L500 300ZM500 300L520 230L530 305ZM530 310L575 250L548 325Z',
      ],
      ['none', 'M440 345Q490 365 540 345', { s: C.green, w: 7 }],
    ],
    // Big Ben
    'w-geography-74': [
      [C.mint, 'R120 835 760 45 10', { s: 'none' }],
      [C.yellow, 'R400 340 200 490', { b: 1 }],
      [C.orange, 'R540 340 60 490', { i: 1, s: 'none' }],
      [C.yellow, 'R340 750 320 85 6'],
      [C.yellow, 'R370 290 260 70 6'],
      [C.brown, 'M385 290L500 90L615 290Z'],
      [C.brown, 'R490 40 20 60 4'],
      [C.orange, 'M500 40L580 62L500 84Z', { w: 7 }],
      [C.paper, 'E500 460 78 78'],
      ['none', 'M500 460V405M500 460L540 480', { s: C.ink, w: 16 }],
      [C.ink, 'R455 300 14 50 6', { s: 'none' }],
      [C.ink, 'R493 300 14 50 6', { s: 'none' }],
      [C.ink, 'R531 300 14 50 6', { s: 'none' }],
      [C.ink, 'R445 590 24 80 8', { s: 'none' }],
      [C.ink, 'R531 590 24 80 8', { s: 'none' }],
      [C.ink, 'R460 770 80 65 30', { s: 'none' }],
    ],
    // Sydney Opera House
    'w-geography-75': [
      [C.sky, 'R0 780 1000 140', { s: 'none' }],
      [
        'none',
        'M80 840Q140 820 200 840T320 840T440 840T560 840T680 840T800 840T920 840',
        { s: C.blue, w: 7 },
      ],
      [C.violet, 'R110 700 780 90 10'],
      shell(110, 700, 1.2, false),
      shell(210, 700, 0.95, false),
      shell(300, 700, 0.65, false),
      shell(890, 700, 1.2, true),
      shell(790, 700, 0.95, true),
      shell(700, 700, 0.65, true),
      shell(560, 700, 0.5, false).slice(0, 0),
    ],
    // White House
    'w-geography-76': [
      [C.mint, 'R0 760 1000 160', { s: 'none' }],
      [C.paper, 'R120 540 190 220 6'],
      [C.paper, 'R690 540 190 220 6'],
      [C.paper, 'R300 470 400 290 6'],
      [C.paper, 'M360 470L500 380L640 470Z'],
      [C.paper, 'R380 470 240 30 4'],
      [C.paper, 'R390 500 24 200 6'],
      [C.paper, 'R458 500 24 200 6'],
      [C.paper, 'R526 500 24 200 6'],
      [C.paper, 'R594 500 24 200 6'],
      [C.paper, 'E500 380 0.1 0.1', { s: 'none' }].slice(0, 0),
      [C.ink, 'R145 590 40 60 6', { s: 'none' }],
      [C.ink, 'R235 590 40 60 6', { s: 'none' }],
      [C.ink, 'R725 590 40 60 6', { s: 'none' }],
      [C.ink, 'R815 590 40 60 6', { s: 'none' }],
      [C.ink, 'R320 560 50 80 6', { s: 'none' }].slice(0, 0),
      [C.violet, 'R430 640 140 120 6'],
      ['none', 'M500 380V250', { s: C.brown, w: 16 }],
      [C.red, 'R500 250 110 70 4'],
    ],
    // Sagrada Familia
    'w-geography-77': [
      [C.mint, 'R60 840 880 50 10', { s: 'none' }],
      [C.yellow, 'R230 600 540 240 6'],
      [C.orange, 'R560 600 210 240 6', { s: 'none' }].slice(0, 0),
      [C.yellow, 'M215 600L260 420L300 600Z'],
      [C.yellow, 'M700 600L740 420L785 600Z'],
      [C.yellow, 'M300 600L305 320Q335 250 365 320L370 600Z'],
      [C.yellow, 'M630 600L635 320Q665 250 695 320L700 600Z'],
      [C.yellow, 'M380 600L385 250Q420 160 455 250L460 600Z'],
      [C.yellow, 'M545 600L550 250Q585 160 620 250L625 600Z'],
      [C.yellow, 'M450 600L455 180Q500 60 545 180L550 600Z'],
      [C.red, 'E500 100 0.1 0.1', { s: 'none' }].slice(0, 0),
      [C.mint, 'E500 95 28 28'],
      [C.orange, 'E420 170 22 22'],
      [C.orange, 'E585 170 22 22'],
      [C.orange, 'E335 245 20 20'],
      [C.orange, 'E665 245 20 20'],
      [C.ink, 'R490 280 20 90 10', { s: 'none' }],
      [C.ink, 'R410 340 16 70 8', { s: 'none' }],
      [C.ink, 'R575 340 16 70 8', { s: 'none' }],
      [C.ink, 'R328 410 14 60 7', { s: 'none' }],
      [C.ink, 'R658 410 14 60 7', { s: 'none' }],
      [C.ink, 'M430 840V720Q500 640 570 720V840Z', { s: 'none' }],
      [
        'none',
        'M255 680H345M655 680H745M255 750H345M655 750H745',
        { s: C.ink, w: 7 },
      ],
    ],
    // vote
    'w-civics-0': [].concat(
      [[C.mint, 'R80 860 840 40 10', { s: 'none' }]],
      ballotBox(250, 560, 500, 280),
      K.tube(
        [
          [930, 140],
          [800, 240],
          [660, 300],
        ],
        80,
        C.yellow,
      ),
      ballot(390, 150, 230, 300),
      [[C.yellow, 'E640 300 42 44']],
    ),
    // election: voting booth
    'w-civics-1': [
      [C.mint, 'R80 850 840 40 10', { s: 'none' }],
      [C.sky, 'R270 320 460 530'],
      [C.blue, 'R230 280 540 60 10'],
      [C.blue, 'R230 320 40 530'],
      [C.blue, 'R730 320 40 530'],
      [C.yellow, 'E500 560 60 66'],
      [C.ink, 'E478 552 7 9', { s: 'none' }],
      [C.ink, 'E522 552 7 9', { s: 'none' }],
      [C.orange, 'M390 850Q390 660 500 640Q610 660 610 850Z'],
      [C.paper, 'R560 700 90 120 8'],
      ['none', 'M575 740L590 760L630 720', { s: C.green, w: 16 }],
      [C.red, 'M270 340H400Q420 500 390 700Q340 730 270 700Z'],
      [C.red, 'M730 340H610Q590 500 620 700Q670 730 730 700Z'].slice(0, 0),
      [C.red, 'M730 340H660V700Q700 730 730 700Z'].slice(0, 0),
      [C.yellow, 'E350 190 0.1 0.1', { s: 'none' }].slice(0, 0),
      [C.red, 'R440 180 120 70 10'],
    ]
      .slice(0, 12)
      .concat([
        [C.red, 'R440 180 120 70 10'],
        ['none', 'M470 215H530', { s: C.paper, w: 16 }],
      ]),
    // constitution
    'w-civics-2': [
      [C.paper, 'R310 760 420 50 8'],
      ['none', 'M330 785H700', { s: C.ink, w: 7 }],
      [C.blue, 'R280 200 440 580 14', { b: 1 }],
      [C.violet, 'R280 200 70 580', { i: 1, s: 'none' }],
      [C.paper, 'E540 440 105 105'],
      star(540, 440, 70, 30, 5, C.yellow, { s: C.ink, w: 7 }),
      ['none', 'M410 290H660M430 600H650M450 650H630', { s: C.paper, w: 16 }],
      [C.red, 'M560 780H620V890L590 860L560 890Z'],
    ],
    // law: scales
    'w-civics-3': [
      [C.brown, 'R340 790 320 60 14'],
      [C.brown, 'R470 270 60 530 10'],
      [C.yellow, 'E500 250 44 44'],
      [C.brown, 'R240 270 520 36 14'],
      [
        'none',
        'M255 305L170 560M255 305L340 560M745 305L660 560M745 305L830 560',
        { s: C.ink, w: 7 },
      ],
      [C.yellow, 'M130 560Q255 700 380 560Z'],
      [C.yellow, 'M620 560Q745 700 870 560Z'],
    ],
    // flag
    'w-civics-4': [].concat(pole(), [
      [C.red, FB, { b: 1 }],
      iR(C.blue, 200, 280, 300, 200),
      star(350, 380, 90, 56, 12, C.paper),
      [C.paper, 'E350 380 44 44', { i: 1, s: C.ink, w: 7 }],
      [C.blue, 'E350 380 30 30', { i: 1, s: 'none' }],
      ['none', FB, { s: C.ink, w: 7 }],
    ]),
    // parliament
    'w-civics-5': [
      [C.mint, 'R0 800 1000 120', { s: 'none' }],
      [C.yellow, 'R120 560 760 240 6'],
      [C.orange, 'R120 540 760 30 6'],
      [C.yellow, 'R400 460 200 110 6'],
      [C.sky, 'M360 480A140 140 0 0 1 640 480Z'],
      [C.sky, 'R440 280 120 0.1', { s: 'none' }].slice(0, 0),
      [C.yellow, 'R470 250 60 60 8'],
      ['none', 'M500 250V170', { s: C.ink, w: 16 }],
      [C.red, 'R500 170 90 55 4'],
      [C.paper, 'R155 600 30 160 6'],
      [C.paper, 'R225 600 30 160 6'],
      [C.paper, 'R295 600 30 160 6'],
      [C.paper, 'R675 600 30 160 6'],
      [C.paper, 'R745 600 30 160 6'],
      [C.paper, 'R815 600 30 160 6'],
      [C.ink, 'R440 640 120 160 40', { s: 'none' }],
      [C.violet, 'R380 800 240 30 4'],
      [C.violet, 'R340 830 320 30 4'],
    ],
    // court
    'w-civics-6': [
      [C.violet, 'M170 400L500 210L830 400Z'],
      [C.yellow, 'R190 400 620 44 6'],
      [C.paper, 'R230 444 52 270 8'],
      [C.paper, 'R360 444 52 270 8'],
      [C.paper, 'R490 444 52 270 8'],
      [C.paper, 'R620 444 52 270 8'],
      [C.paper, 'R718 444 52 270 8'],
      [C.sky, 'R150 714 700 40 4'],
      [C.sky, 'R110 754 780 44 4'],
      [
        'none',
        'M500 290V360M450 305H550M450 305L435 340M450 305L465 340M550 305L535 340M550 305L565 340',
        { s: C.paper, w: 7 },
      ],
    ],
    // verdict: gavel
    'w-civics-7': [].concat(
      [
        [C.brown, 'R160 760 680 90 14'],
        [C.orange, 'R160 750 680 30 12'],
        [C.brown, 'E500 740 0.1 0.1', { s: 'none' }].slice(0, 0),
      ],
      K.T(
        [
          [C.orange, 'R480 380 50 360 12'],
          [C.brown, 'R340 270 330 130 16'],
          [C.yellow, 'R380 270 36 130 4'],
          [C.yellow, 'R600 270 36 130 4'],
        ],
        { rot: 40, cx: 500, cy: 740, dx: -20, dy: 0 },
      ),
      [
        [
          'none',
          'M180 640L130 600M200 600L160 540M240 700L170 700',
          { s: C.ink, w: 7 },
        ].slice(0, 0),
      ],
    ),
    // tax
    'w-civics-8': [
      [C.paper, 'R180 170 400 580 14'],
      [
        'none',
        'M240 270H520M240 350H520M240 430H520M240 510H380',
        { s: C.ink, w: 16 },
      ],
      [C.green, 'R400 560 140 100 10'],
      ['none', 'M440 610H500', { s: C.paper, w: 16 }],
      [C.yellow, 'M620 650V800Q720 860 820 800V650Z'],
      [C.yellow, 'E720 650 100 36'],
      [C.orange, 'E720 650 56 18'],
      [C.yellow, 'E720 560 100 36'],
      [C.orange, 'E720 560 56 18'],
      [C.yellow, 'E720 470 100 36'],
      [C.orange, 'E720 470 56 18'],
    ],
    // id card
    'w-civics-9': [
      [C.paper, 'R130 280 740 460 40', { b: 1 }],
      [C.sky, 'R130 280 740 90', { i: 1, s: 'none' }],
      [C.violet, 'R200 410 230 270 14'],
      [C.yellow, 'E315 510 52 58'],
      [C.orange, 'M230 680Q230 590 315 580Q400 590 400 680Z', { s: 'none' }],
      [
        'none',
        'M480 430H800M480 510H760M480 590H800M480 660H700',
        { s: C.ink, w: 16 },
      ],
      [C.yellow, 'R720 300 70 50 8', { s: C.ink }],
    ],
    // passport
    'w-civics-10': [
      [C.blue, 'R290 170 420 650 20', { b: 1 }],
      [C.violet, 'R290 170 50 650', { i: 1, s: 'none' }],
      [C.yellow, 'E510 430 110 110'],
      [
        'none',
        'M510 320V540M400 430H620M420 370Q510 400 600 370M420 490Q510 460 600 490',
        { s: C.ink, w: 7 },
      ],
      ['none', 'M400 640H620M430 700H590', { s: C.yellow, w: 16 }],
      ['none', 'E690 790 80 50', { s: C.red, w: 16 }],
    ],
    // household register
    'w-civics-11': [
      [C.orange, 'R240 190 520 620 16', { b: 1 }],
      [C.brown, 'R240 190 60 620', { i: 1, s: 'none' }],
      [C.paper, 'M390 440L520 320L650 440Z'],
      [C.paper, 'R420 440 200 120 4'],
      [C.red, 'R490 490 60 70 4'],
      [C.yellow, 'E420 660 32 32'],
      [C.yellow, 'E520 660 32 32'],
      [C.yellow, 'E620 660 32 32'],
      [C.blue, 'R385 705 70 70 24'],
      [C.blue, 'R485 705 70 70 24'],
      [C.blue, 'R585 705 70 70 24'],
    ],
    // referendum
    'w-civics-12': [].concat(
      [[C.mint, 'R80 880 840 30 10', { s: 'none' }]],
      ballotBox(280, 650, 440, 180),
      [
        [C.paper, 'R320 140 360 520 12'],
        [C.paper, 'R340 200 110 110 10', { s: C.ink }],
        ['none', 'M360 260L390 290L435 220', { s: C.green, w: 16 }],
        [C.paper, 'R340 410 110 110 10', { s: C.ink }],
        ['none', 'M365 435L425 495M425 435L365 495', { s: C.red, w: 16 }],
        ['none', 'M490 255H650M490 465H650', { s: C.ink, w: 16 }],
      ],
    ),
    // mayor
    'w-civics-13': [].concat(
      [
        [C.mint, 'R60 860 880 40 10', { s: 'none' }],
        [C.sky, 'R560 300 320 560 6'],
        [C.violet, 'R540 270 360 50 6'],
        [C.ink, 'R600 380 50 60 6', { s: 'none' }],
        [C.ink, 'R700 380 50 60 6', { s: 'none' }],
        [C.ink, 'R800 380 50 60 6', { s: 'none' }],
        [C.ink, 'R600 500 50 60 6', { s: 'none' }],
        [C.ink, 'R700 500 50 60 6', { s: 'none' }],
        [C.ink, 'R800 500 50 60 6', { s: 'none' }],
        [C.yellow, 'R680 700 120 160 6'],
      ],
      human(330, 860, 700, { shirt: C.paper, pants: C.blue, hair: C.ink }),
      [
        K.tube(
          [
            [255, 400],
            [405, 600],
          ],
          40,
          C.red,
        )[0],
        K.tube(
          [
            [255, 400],
            [405, 600],
          ],
          40,
          C.red,
        )[1],
      ],
    ),
    // village chief: megaphone
    'w-civics-14': [].concat(
      [
        [C.mint, 'R60 860 880 40 10', { s: 'none' }],
        [C.paper, 'R560 600 160 260 4'],
        [C.red, 'M540 600L640 500L740 600Z'],
        [C.paper, 'R760 660 120 200 4'],
        [C.red, 'M745 660L820 590L895 660Z'],
        [C.blue, 'R620 740 40 60 6', { s: C.ink }],
      ],
      human(300, 860, 700, {
        shirt: C.orange,
        pants: C.blue,
        armR: [
          [370, 390],
          [470, 330],
          [530, 300],
        ],
      }),
      [
        [C.red, 'M470 330L560 255L600 340Z'],
        [C.yellow, 'R440 300 50 60 8'],
        [
          'none',
          'M600 230L640 210M610 290L660 290M600 345L640 370',
          { s: C.ink, w: 7 },
        ],
      ],
    ),
    // district office
    'w-civics-15': [
      [C.mint, 'R0 790 1000 130', { s: 'none' }],
      [C.paper, 'R150 460 700 330 6'],
      [C.red, 'M120 470L500 330L880 470Z'],
      [C.yellow, 'R420 570 160 220 8'],
      [C.blue, 'R450 620 100 170 4', { s: C.ink }].slice(0, 0),
      [C.sky, 'R200 540 140 120 6'],
      [C.sky, 'R660 540 140 120 6'],
      [
        'none',
        'M270 540V660M200 600H340M730 540V660M660 600H800',
        { s: C.ink, w: 7 },
      ],
      [C.blue, 'R430 480 140 50 8'],
      ['none', 'M500 330V190', { s: C.brown, w: 16 }],
      [C.red, 'R500 190 110 70 4'],
      [C.violet, 'R400 790 200 30 4'],
    ],
    // military service
    'w-civics-16': [].concat(
      [[C.mint, 'R120 880 760 30 10', { s: 'none' }]],
      human(480, 870, 740, {
        shirt: C.green,
        pants: C.green,
        hair: false,
        armR: [
          [550, 395],
          [620, 300],
          [560, 190],
        ],
      }),
      [
        [C.green, 'M410 215A72 72 0 0 1 560 215Z'],
        [C.yellow, 'R400 205 170 24 8'],
        [C.yellow, 'M470 160L490 130L510 160Z', { s: C.ink }].slice(0, 0),
      ],
      [
        ['none', 'M660 880V500', { s: C.brown, w: 16 }],
        [C.red, 'R665 500 140 90 4'],
        [C.blue, 'R665 500 60 45 4'],
      ],
    ),
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
