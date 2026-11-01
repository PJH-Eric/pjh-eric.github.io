(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;
  function cat() {
    return [].concat.apply([], arguments);
  }
  function at(l, x, y, s, rot) {
    return K.T(l, { dx: x, dy: y, s: s || 1, rot: rot || 0 });
  }
  function ln(d, col, w) {
    return [['none', d, { s: col || C.ink, w: w || 7 }]];
  }
  function band(y, col) {
    return [[col || C.mint, 'R100 ' + y + ' 800 ' + (940 - y) + ' 24']];
  }
  function pt(x, y, h, fx, fy) {
    return [x + fx * h, y + fy * h];
  }
  /* generic person: x,y = feet centre, h = height */
  function man(o) {
    var x = o.x,
      y = o.y,
      h = o.h || 520,
      sk = o.skin || C.yellow,
      out = [];
    var shY = y - 0.74 * h,
      hipY = y - 0.4 * h;
    var aL = o.aL || [-0.12, 0.28],
      aR = o.aR || [0.12, 0.28];
    var fL = o.fL || [-0.08, 0],
      fR = o.fR || [0.08, 0];
    var pants = o.pants || C.blue,
      shirt = o.shirt || C.red;
    if (o.hairStyle === 'long')
      out.push([
        '#FFFDF8',
        'R' +
          (x - 0.115 * h) +
          ' ' +
          (y - 0.97 * h) +
          ' ' +
          0.23 * h +
          ' ' +
          0.3 * h +
          ' 20',
        { fill: 0 },
      ]);
    out[0] &&
      (out = [
        [
          o.hair || C.brown,
          'R' +
            (x - 0.115 * h) +
            ' ' +
            (y - 0.97 * h) +
            ' ' +
            0.23 * h +
            ' ' +
            0.3 * h +
            ' 20',
        ],
      ]);
    out = out.concat(
      K.tube(
        [
          [x - 0.06 * h, hipY],
          pt(x - 0.06 * h, y, h, fL[0] - 0.06 + 0.06, -fL[1]),
        ],
        0.11 * h,
        pants,
      ),
      K.tube(
        [[x + 0.06 * h, hipY], pt(x + 0.06 * h, y, h, fR[0], -fR[1])],
        0.11 * h,
        pants,
      ),
      [
        [
          C.ink,
          'E' +
            (x - 0.06 * h + fL[0] * h - 0.02 * h) +
            ' ' +
            (y - fL[1] * h) +
            ' ' +
            0.07 * h +
            ' ' +
            0.035 * h,
          {},
        ],
        [
          C.ink,
          'E' +
            (x + 0.06 * h + fR[0] * h + 0.02 * h) +
            ' ' +
            (y - fR[1] * h) +
            ' ' +
            0.07 * h +
            ' ' +
            0.035 * h,
          {},
        ],
      ],
      [
        [
          shirt,
          'R' +
            (x - 0.15 * h) +
            ' ' +
            (shY - 0.03 * h) +
            ' ' +
            0.3 * h +
            ' ' +
            0.4 * h +
            ' ' +
            0.07 * h,
          {},
        ],
      ],
      K.tube(
        [
          [x - 0.14 * h, shY + 0.02 * h],
          [
            x - 0.14 * h + aL[0] * h * 0.5 - 0.02 * h,
            shY + aL[1] * h * 0.5 + 0.02 * h,
          ],
          [x - 0.14 * h + aL[0] * h, shY + aL[1] * h],
        ],
        0.085 * h,
        shirt,
      ),
      K.tube(
        [
          [x + 0.14 * h, shY + 0.02 * h],
          [
            x + 0.14 * h + aR[0] * h * 0.5 + 0.02 * h,
            shY + aR[1] * h * 0.5 + 0.02 * h,
          ],
          [x + 0.14 * h + aR[0] * h, shY + aR[1] * h],
        ],
        0.085 * h,
        shirt,
      ),
      [
        [
          sk,
          'E' +
            (x - 0.14 * h + aL[0] * h) +
            ' ' +
            (shY + aL[1] * h) +
            ' ' +
            0.05 * h +
            ' ' +
            0.05 * h,
          {},
        ],
        [
          sk,
          'E' +
            (x + 0.14 * h + aR[0] * h) +
            ' ' +
            (shY + aR[1] * h) +
            ' ' +
            0.05 * h +
            ' ' +
            0.05 * h,
          {},
        ],
      ],
      [
        [
          sk,
          'R' +
            (x - 0.035 * h) +
            ' ' +
            (shY - 0.08 * h) +
            ' ' +
            0.07 * h +
            ' ' +
            0.07 * h,
          { s: 'none' },
        ],
      ],
    );
    if (o.hairStyle === 'pig') {
      out.push([
        o.hair || C.brown,
        'E' +
          (x - 0.14 * h) +
          ' ' +
          (y - 0.9 * h) +
          ' ' +
          0.05 * h +
          ' ' +
          0.05 * h,
        {},
      ]);
      out.push([
        o.hair || C.brown,
        'E' +
          (x + 0.14 * h) +
          ' ' +
          (y - 0.9 * h) +
          ' ' +
          0.05 * h +
          ' ' +
          0.05 * h,
        {},
      ]);
    }
    out.push([
      sk,
      'E' + x + ' ' + (y - 0.87 * h) + ' ' + 0.1 * h + ' ' + 0.11 * h,
      {},
    ]);
    if (o.hairStyle !== 'bald')
      out.push([
        o.hair || C.brown,
        'E' + x + ' ' + (y - 0.915 * h) + ' ' + 0.108 * h + ' ' + 0.075 * h,
        {},
      ]);
    if (o.hairStyle === 'cap')
      out.push([
        o.cap || C.red,
        'M' +
          (x - 0.11 * h) +
          ' ' +
          (y - 0.9 * h) +
          'C' +
          (x - 0.1 * h) +
          ' ' +
          (y - 1.02 * h) +
          ' ' +
          (x + 0.1 * h) +
          ' ' +
          (y - 1.02 * h) +
          ' ' +
          (x + 0.11 * h) +
          ' ' +
          (y - 0.9 * h) +
          'L' +
          (x + 0.22 * h) +
          ' ' +
          (y - 0.89 * h) +
          'L' +
          (x - 0.11 * h) +
          ' ' +
          (y - 0.87 * h) +
          'Z',
        {},
      ]);
    out.push([
      C.ink,
      'E' +
        (x - 0.04 * h) +
        ' ' +
        (y - 0.865 * h) +
        ' ' +
        0.013 * h +
        ' ' +
        0.018 * h,
      { s: 'none' },
    ]);
    out.push([
      C.ink,
      'E' +
        (x + 0.04 * h) +
        ' ' +
        (y - 0.865 * h) +
        ' ' +
        0.013 * h +
        ' ' +
        0.018 * h,
      { s: 'none' },
    ]);
    out.push([
      'none',
      'M' +
        (x - 0.03 * h) +
        ' ' +
        (y - 0.82 * h) +
        'Q' +
        x +
        ' ' +
        (y - 0.79 * h) +
        ' ' +
        (x + 0.03 * h) +
        ' ' +
        (y - 0.82 * h),
      { s: C.ink, w: 7 },
    ]);
    return out;
  }
  function pent(x, y, r) {
    var d = '',
      i,
      a;
    for (i = 0; i < 5; i++) {
      a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      d +=
        (i ? 'L' : 'M') +
        Math.round(x + r * Math.cos(a)) +
        ' ' +
        Math.round(y + r * Math.sin(a));
    }
    return d + 'Z';
  }
  function star(x, y, r, col) {
    var d = '',
      i,
      a,
      rr;
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 5;
      rr = i % 2 ? r * 0.45 : r;
      d +=
        (i ? 'L' : 'M') +
        Math.round(x + rr * Math.cos(a)) +
        ' ' +
        Math.round(y + rr * Math.sin(a));
    }
    return [[col || C.yellow, d + 'Z', {}]];
  }
  function sball(x, y, r) {
    return [
      [C.paper, 'E' + x + ' ' + y + ' ' + r + ' ' + r, {}],
      [C.ink, pent(x, y, r * 0.42), { s: 'none' }],
      [
        'none',
        'M' +
          x +
          ' ' +
          (y - r * 0.42) +
          'L' +
          x +
          ' ' +
          (y - r) +
          'M' +
          (x + r * 0.4) +
          ' ' +
          (y - r * 0.13) +
          'L' +
          (x + r * 0.95) +
          ' ' +
          (y - r * 0.3) +
          'M' +
          (x - r * 0.4) +
          ' ' +
          (y - r * 0.13) +
          'L' +
          (x - r * 0.95) +
          ' ' +
          (y - r * 0.3) +
          'M' +
          (x + r * 0.25) +
          ' ' +
          (y + r * 0.35) +
          'L' +
          (x + r * 0.5) +
          ' ' +
          (y + r * 0.85) +
          'M' +
          (x - r * 0.25) +
          ' ' +
          (y + r * 0.35) +
          'L' +
          (x - r * 0.5) +
          ' ' +
          (y + r * 0.85),
        { s: C.ink, w: 7 },
      ],
    ];
  }
  function note(x, y, s, col) {
    return at(
      [
        [col || C.ink, 'E0 0 30 22 -20', { s: 'none' }],
        ['none', 'M26 -8L26 -130L70 -90', { s: col || C.ink, w: 12 }],
      ],
      x,
      y,
      s,
    );
  }
  function heart(x, y, s, col) {
    return at(
      [
        [
          col || C.red,
          'M0 90C-150 -10 -90 -110 0 -50C90 -110 150 -10 0 90Z',
          {},
        ],
      ],
      x,
      y,
      s,
    );
  }
  function guitar(col) {
    return [
      ['none', 'M0 -60L0 -330', { s: C.ink, w: 50 }],
      ['none', 'M0 -60L0 -330', { s: C.brown, w: 34 }],
      [C.brown, 'R-28 -400 56 90 14', {}],
      [col, 'E0 70 120 105', {}],
      [col, 'E0 -45 88 78', {}],
      [col, 'E0 10 80 70', { s: 'none' }],
      [C.ink, 'E0 25 38 38', { s: 'none' }],
      [C.brown, 'R-70 150 140 22 8', {}],
      ['none', 'M-8 -330L-8 140M8 -330L8 140', { s: C.paper, w: 4 }],
    ];
  }
  function mic(col) {
    return [
      [C.ink, 'M-30 -30L30 -30L22 190L-22 190Z', {}],
      [C.violet, 'M-26 -20L26 -20L20 100L-20 100Z', { s: 'none' }],
      [col, 'E0 -100 62 62', {}],
      [
        'none',
        'M-55 -100H55M-40 -140Q0 -120 40 -140M-40 -60Q0 -80 40 -60M0 -160V-40',
        { s: C.ink, w: 7 },
      ],
    ];
  }
  function racket(col, big) {
    var k = big ? 1 : 0.85;
    return at(
      [
        ['none', 'M0 -40L0 140', { s: C.ink, w: 34 }],
        ['none', 'M0 -40L0 140', { s: C.brown, w: 20 }],
        [C.paper, 'E0 -150 70 95', { s: 'none' }],
        [
          'none',
          'M0 -245V-55M-62 -150H62M-45 -205H45M-45 -95H45M-30 -230V-70M30 -230V-70',
          { s: C.ink, w: 4 },
        ],
        ['none', 'E0 -150 70 95', { s: col, w: 16 }],
        ['none', 'E0 -150 80 105', { s: C.ink, w: 5 }],
      ],
      0,
      0,
      k,
    );
  }
  function snow(x, y, r, col) {
    var d = '',
      i,
      a,
      ex,
      ey,
      bx,
      by;
    for (i = 0; i < 3; i++) {
      a = (i * Math.PI) / 3;
      ex = Math.cos(a) * r;
      ey = Math.sin(a) * r;
      d +=
        'M' +
        Math.round(x - ex) +
        ' ' +
        Math.round(y - ey) +
        'L' +
        Math.round(x + ex) +
        ' ' +
        Math.round(y + ey);
      bx = x + ex * 0.6;
      by = y + ey * 0.6;
      d +=
        'M' +
        Math.round(bx) +
        ' ' +
        Math.round(by) +
        'l' +
        Math.round(-r * 0.2 * Math.cos(a - 0.8)) +
        ' ' +
        Math.round(-r * 0.2 * Math.sin(a - 0.8));
      d +=
        'M' +
        Math.round(bx) +
        ' ' +
        Math.round(by) +
        'l' +
        Math.round(-r * 0.2 * Math.cos(a + 0.8)) +
        ' ' +
        Math.round(-r * 0.2 * Math.sin(a + 0.8));
      bx = x - ex * 0.6;
      by = y - ey * 0.6;
      d +=
        'M' +
        Math.round(bx) +
        ' ' +
        Math.round(by) +
        'l' +
        Math.round(r * 0.2 * Math.cos(a - 0.8)) +
        ' ' +
        Math.round(r * 0.2 * Math.sin(a - 0.8));
      d +=
        'M' +
        Math.round(bx) +
        ' ' +
        Math.round(by) +
        'l' +
        Math.round(r * 0.2 * Math.cos(a + 0.8)) +
        ' ' +
        Math.round(r * 0.2 * Math.sin(a + 0.8));
    }
    return [
      ['none', d, { s: C.ink, w: 22 }],
      ['none', d, { s: col || C.sky, w: 10 }],
    ];
  }
  function palm(x, y, s) {
    return at(
      [
        ['none', 'M0 0C20 -120 -10 -220 20 -300', { s: C.ink, w: 48 }],
        ['none', 'M0 0C20 -120 -10 -220 20 -300', { s: C.brown, w: 32 }],
        [
          C.green,
          'M20 -300C-40 -380 -120 -370 -170 -310C-100 -320 -50 -310 20 -300Z',
          {},
        ],
        [
          C.green,
          'M20 -300C80 -390 170 -380 210 -320C140 -330 80 -320 20 -300Z',
          {},
        ],
        [
          C.mint,
          'M20 -300C-10 -400 30 -450 70 -470C60 -420 50 -360 20 -300Z',
          {},
        ],
      ],
      x,
      y,
      s,
    );
  }

  Object.assign(R, {
    'w-star-47': cat(
      band(790),
      [[C.red, 'M80 790L300 790L220 700Z', { s: 'none' }]].slice(0, 0),
      ln('M790 790V480H950V790', C.ink, 16),
      man({
        x: 360,
        y: 790,
        h: 520,
        shirt: C.red,
        pants: C.paper,
        hair: C.brown,
        fR: [0.22, 0.17],
        fL: [-0.04, 0],
        aL: [-0.22, 0.12],
        aR: [0.2, 0.05],
      }),
      sball(610, 750, 45),
      ln('M690 700L740 680M700 740L760 740', C.ink, 7),
    ),
    'w-star-48': cat(
      band(790, C.green),
      ln('M100 800H900', C.paper, 7),
      man({
        x: 400,
        y: 790,
        h: 520,
        shirt: C.paper,
        pants: C.paper,
        hair: C.brown,
        aR: [0.2, 0.0],
        aL: [-0.1, 0.25],
        fL: [-0.1, 0],
        fR: [0.12, 0],
      }),
      at(racket(C.red, true), 640, 520, 1.15, 70),
      [[C.yellow, 'E830 330 42 42', {}]],
      ln('M800 320Q830 300 860 320', C.paper, 7),
    ),
    'w-star-49': cat(
      band(790),
      man({
        x: 380,
        y: 790,
        h: 520,
        shirt: C.blue,
        pants: C.paper,
        hairStyle: 'cap',
        cap: C.blue,
        aL: [0.12, -0.2],
        aR: [0.18, -0.22],
        fL: [-0.12, 0],
        fR: [0.1, 0],
      }),
      K.tube(
        [
          [510, 420],
          [640, 200],
        ],
        34,
        C.orange,
      ),
      [[C.paper, 'E800 250 42 42', {}]],
      ln('M775 235Q790 250 778 270M825 232Q812 250 824 270', C.red, 7),
      ln('M700 300L650 330M720 260L660 270', C.ink, 7),
    ),
    'w-star-50': cat(
      band(790),
      [[C.brown, 'M180 800C200 700 520 700 540 800Z', {}]],
      man({
        x: 360,
        y: 730,
        h: 500,
        shirt: C.paper,
        pants: C.paper,
        hairStyle: 'cap',
        cap: C.blue,
        aR: [0.12, -0.3],
        aL: [-0.22, 0.02],
        fL: [-0.1, 0],
        fR: [0.2, 0.06],
      }),
      [[C.brown, 'E270 480 50 40', {}]],
      [[C.paper, 'E605 195 40 40', {}]],
      ln('M580 185Q595 200 583 218', C.red, 7),
      ln('M650 195H760M660 230H780M650 160H740', C.ink, 7),
    ),
    'w-star-51': cat(
      band(800, C.green),
      man({
        x: 400,
        y: 800,
        h: 540,
        shirt: C.pink,
        pants: C.paper,
        hair: C.ink,
        hairStyle: 'long',
        aR: [0.16, -0.28],
        aL: [-0.14, 0.1],
        fL: [-0.12, 0],
        fR: [0.12, 0],
      }),
      at(racket(C.red, false), 520, 440, 1.0, 20),
      [
        [C.paper, 'M780 250L820 250L840 190L760 190Z', {}],
        [C.orange, 'E800 270 30 26', {}],
      ],
      ln('M780 200L790 250M800 195V250M820 200L810 250', C.ink, 5),
    ),
    'w-star-52': cat(
      [
        [C.ink, 'R200 400 600 380 16', {}],
        [C.paper, 'R230 430 540 320 8', { s: 'none' }],
      ].slice(0, 0),
      [[C.ink, 'R200 440 600 380 20', {}]],
      [
        [C.violet, 'M200 400L760 280L800 340L200 440Z', {}],
        [
          C.yellow,
          'M200 400L330 372L360 420L200 440ZM420 358L550 331L580 379L420 400ZM640 305L760 280L790 332L640 360Z',
          { s: 'none' },
        ],
      ],
      [[C.paper, 'R240 480 520 20 8', { s: 'none' }]],
      star(560, 210, 90, C.yellow),
      star(280, 250, 45, C.orange),
      star(800, 520, 55, C.orange),
    ),
    'w-star-53': cat(
      K.tube(
        [
          [500, 640],
          [330, 880],
        ],
        24,
        C.brown,
      ),
      K.tube(
        [
          [500, 640],
          [670, 880],
        ],
        24,
        C.brown,
      ),
      K.tube(
        [
          [500, 640],
          [500, 880],
        ],
        24,
        C.brown,
      ),
      [
        [C.red, 'E390 340 105 105', {}],
        [C.red, 'E600 340 105 105', {}],
        [C.paper, 'E390 340 50 50', { s: 'none' }],
        [C.paper, 'E600 340 50 50', { s: 'none' }],
      ],
      [
        [C.violet, 'R240 420 440 240 24', {}],
        [C.ink, 'M680 510L830 440L830 610L680 560Z', {}],
        [C.blue, 'R700 480 130 60 0', { s: 'none' }].slice(0, 0),
      ],
      [[C.sky, 'E700 510 28 46', {}]],
      [[C.orange, 'E300 540 20 20', { s: 'none' }]],
      ln('M290 460H620', C.paper, 7),
    ),
    'w-star-54': cat(
      [['none', 'M500 80V260', { s: C.ink, w: 8 }]],
      [[C.violet, 'E500 400 160 160', { b: 1 }]],
      [
        [
          C.sky,
          'M340 330C420 360 580 360 660 330L660 350C580 390 420 390 340 350ZM350 430C430 470 570 470 650 430L650 450C570 490 430 490 350 450Z',
          { i: 1, s: 'none' },
        ],
      ],
      ln(
        'M500 240V560M400 260C440 360 440 440 400 540M600 260C560 360 560 440 600 540',
        C.ink,
        6,
      ).slice(0, 0),
      star(250, 250, 40, C.yellow),
      star(760, 300, 50, C.yellow),
      star(820, 170, 28, C.orange),
      man({
        x: 300,
        y: 940,
        h: 340,
        shirt: C.pink,
        pants: C.violet,
        hairStyle: 'long',
        hair: C.ink,
        aL: [-0.15, -0.25],
        aR: [0.15, -0.25],
        fL: [-0.1, 0],
        fR: [0.14, 0.04],
      }),
      man({
        x: 700,
        y: 940,
        h: 340,
        shirt: C.orange,
        pants: C.blue,
        hair: C.ink,
        aL: [-0.15, -0.25],
        aR: [0.2, 0.1],
        fL: [-0.14, 0.03],
        fR: [0.1, 0],
      }),
    ),
    'w-star-55': cat(
      [[C.brown, 'R100 830 800 60 12', {}]],
      [
        [C.red, 'M100 100L350 100C330 300 300 600 260 830L100 830Z', {}],
        [C.red, 'M900 100L650 100C670 300 700 600 740 830L900 830Z', {}],
      ],
      [[C.brown, 'M120 100L120 830', { s: 'none' }]].slice(0, 0),
      K.tube(
        [
          [500, 830],
          [500, 400],
        ],
        18,
        C.violet,
      ),
      [[C.violet, 'E500 840 130 28', {}]],
      at(mic(C.ink), 500, 330, 1.1, 0),
      note(740, 320, 1.2, C.blue),
      note(260, 460, 1.0, C.pink),
    ),
    'w-star-56': cat(
      at(guitar(C.orange), 500, 560, 1.15, -28),
      note(790, 240, 1.2, C.blue),
      note(210, 270, 1.0, C.red),
      note(820, 600, 0.9, C.violet),
    ),
    'w-star-57': cat(
      band(840, C.violet),
      man({
        x: 440,
        y: 840,
        h: 620,
        shirt: C.orange,
        pants: C.violet,
        hairStyle: 'cap',
        cap: C.ink,
        aL: [-0.2, 0.22],
        aR: [0.05, -0.34],
        fL: [-0.12, 0],
        fR: [0.14, 0],
      }),
      at(mic(C.ink), 530, 330, 0.6, 20),
      note(790, 300, 1.1, C.red),
      note(160, 360, 1.0, C.blue),
    ),
    'w-star-58': cat(
      band(860),
      man({
        x: 440,
        y: 860,
        h: 640,
        shirt: C.paper,
        pants: C.sky,
        hairStyle: 'long',
        hair: C.ink,
        aL: [0.2, -0.05],
        aR: [0.0, 0.1],
        fL: [-0.06, 0],
        fR: [0.08, 0],
      }),
      at(guitar(C.orange), 450, 600, 0.7, -75),
      note(790, 300, 1.1, C.pink),
    ),
    'w-star-59': cat(
      [[C.yellow, 'E500 440 360 360', {}]].slice(0, 0),
      K.sun ? [] : [],
      [[C.yellow, 'E760 220 80 80', {}]],
      ln(
        'M760 90V60M760 380V350M630 220H600M920 220H890M670 130L650 110M850 130L870 110M670 310L650 330M850 310L870 330',
        C.orange,
        16,
      ),
      band(800),
      [
        [C.pink, 'E220 780 30 30', {}],
        [C.red, 'E220 780 12 12', { s: 'none' }],
      ],
      ln('M220 810V870', C.green, 16),
      at(guitar(C.yellow), 480, 540, 0.8, -35).concat(
        at(guitar(C.yellow), 0, 0, 1).slice(0, 0),
      ),
      note(210, 320, 1.1, C.blue),
    ),
    'w-star-60': cat(
      man({
        x: 420,
        y: 880,
        h: 660,
        shirt: C.pink,
        pants: C.violet,
        hairStyle: 'pig',
        hair: C.brown,
        aL: [-0.16, 0.2],
        aR: [0.06, -0.3],
        fL: [-0.1, 0],
        fR: [0.14, 0],
      }),
      at(mic(C.pink), 520, 330, 0.55, 15),
      heart(800, 270, 0.8, C.red),
      heart(220, 330, 0.5, C.pink),
      heart(790, 520, 0.4, C.pink),
    ),
    'w-star-61': cat(
      [
        [C.ink, 'E580 570 260 260', {}],
        [C.orange, 'E580 570 90 90', { s: 'none' }],
        [C.paper, 'E580 570 22 22', { s: 'none' }],
      ],
      ln(
        'M390 570A190 190 0 0 1 580 380M770 570A190 190 0 0 1 580 760',
        C.violet,
        7,
      ),
      ln('M240 560C240 240 640 240 640 560', C.ink, 70),
      ln('M240 560C240 240 640 240 640 560', C.blue, 46),
      [
        [C.red, 'R180 480 110 190 50', {}],
        [C.red, 'R580 480 110 190 50', {}],
      ],
    ),
    'w-star-62': cat(
      [
        [
          C.red,
          'M230 280L330 280C340 480 460 560 700 600C800 610 880 680 840 730C780 770 600 740 520 700C420 640 330 590 260 560L240 300Z',
          {},
        ].slice(0, 0),
      ],
      [
        [
          C.red,
          'M230 250L350 250C350 480 470 580 700 620C830 640 900 720 840 780C760 800 620 780 540 740C440 690 360 650 300 620L230 600Z',
          {},
        ],
      ],
      [
        [C.brown, 'M230 600L300 620L270 880L225 880Z', {}],
        [C.paper, 'E700 640 90 20 20', { i: 1 }].slice(0, 0),
      ],
      ln('M360 270C390 460 500 560 700 620', C.paper, 7),
      [[C.ink, 'E258 872 20 9', { s: 'none' }]],
      [[C.yellow, 'E600 560 24 24', {}]],
      star(700, 330, 60, C.yellow),
      star(840, 450, 35, C.orange),
      star(600, 210, 30, C.orange),
    ),
    'w-star-63': cat(
      K.tube(
        [
          [300, 270],
          [200, 120],
        ],
        12,
        C.ink,
      ),
      K.tube(
        [
          [700, 270],
          [800, 120],
        ],
        12,
        C.ink,
      ),
      [
        [C.brown, 'R130 250 740 520 50', {}],
        [C.sky, 'R190 310 620 400 28', { b: 1 }],
        [
          C.pink,
          'M190 710C190 600 360 560 400 540L600 540C640 560 810 600 810 710Z',
          { i: 1 },
        ],
        [C.yellow, 'E500 440 100 110', { i: 1 }],
        [C.brown, 'E500 400 105 70', { i: 1 }].slice(0, 0),
      ],
      [
        [C.brown, 'R220 770 80 90 10', {}],
        [C.brown, 'R700 770 80 90 10', {}],
      ],
      [[C.red, 'E805 420 30 30', {}]],
    ),
    'w-star-64': cat(
      [
        [C.red, 'R120 320 760 480 30', {}],
        [C.red, 'R160 760 680 40 10', {}],
      ],
      [
        [
          C.paper,
          'M500 330C420 250 250 250 170 330L170 760C250 700 420 700 500 760Z',
          {},
        ],
        [
          C.paper,
          'M500 330C580 250 750 250 830 330L830 760C750 700 580 700 500 760Z',
          {},
        ],
      ],
      [
        [
          C.red,
          'M130 760L500 800L870 760L870 810L500 850L130 810Z',
          { s: 'none' },
        ].slice(0, 0),
      ],
      ln(
        'M230 400C300 380 400 390 450 420M230 470C300 450 400 460 450 490M230 540C300 520 400 530 450 560M550 420C600 390 700 380 770 400M550 490C600 460 700 450 770 470',
        C.violet,
        7,
      ),
      [[C.red, 'M640 280L740 280L740 480L690 440L640 480Z', {}]],
      ln('M500 330V760', C.ink, 7),
      heart(330, 220, 0.5, C.pink),
    ),
    'w-star-65': cat(
      heart(500, 460, 3.0, C.red),
      [[C.paper, 'E330 340 24 50 -35', { s: 'none' }]],
      note(240, 780, 1.4, C.violet),
      note(780, 780, 1.4, C.blue),
      heart(780, 190, 0.7, C.pink),
      heart(200, 200, 0.5, C.pink),
    ),
    'w-star-66': cat(
      ln('M500 100V220', C.ink, 12),
      [
        [C.yellow, 'R400 200 200 50 14', {}],
        [C.red, 'E500 460 230 250', {}],
      ],
      [
        [
          C.orange,
          'M320 360C400 400 600 400 680 360L690 380C600 430 400 430 310 380Z',
          { s: 'none' },
        ].slice(0, 0),
      ],
      ln(
        'M500 210V710M390 230C330 330 330 590 390 700M610 230C670 330 670 590 610 700',
        C.orange,
        12,
      ),
      [[C.yellow, 'R400 690 200 50 14', {}]],
      ln('M500 740V880', C.red, 12),
      [[C.red, 'E500 890 28 38', {}]],
      note(170, 640, 1.2, C.blue),
      note(840, 440, 1.0, C.pink),
    ),
    'w-star-67': cat(
      at(
        [
          [C.sky, 'M-30 -230L0 -720L30 -230Z', {}],
          ['none', 'M0 -230V-650', { s: C.paper, w: 8 }],
          [C.yellow, 'R-110 -245 220 44 14', {}],
          [C.brown, 'R-20 -200 40 230 10', {}],
          [C.yellow, 'E0 60 34 34', {}],
        ],
        500,
        620,
        1.0,
        40,
      ),
      at(mic(C.ink), 500, 560, 1.5, -40),
      note(200, 250, 1.2, C.blue),
      star(820, 220, 50, C.yellow),
    ),
    'w-star-68': cat(
      [
        [
          C.violet,
          'M180 960C180 780 330 710 500 710C670 710 820 780 820 960Z',
          {},
        ],
      ],
      [[C.yellow, 'R450 640 100 100 20', { s: 'none' }]],
      [[C.yellow, 'E500 470 190 220', {}]],
      [
        [C.pink, 'E350 190 80 55 -30', {}],
        [C.pink, 'E650 190 80 55 30', {}],
        [C.pink, 'E500 215 38 38', {}],
      ],
      [
        [C.ink, 'R320 410 150 90 36', {}],
        [C.ink, 'R530 410 150 90 36', {}],
        [C.sky, 'R340 425 40 20 8', { s: 'none' }],
        [C.sky, 'R550 425 40 20 8', { s: 'none' }],
      ],
      ln('M470 440H530', C.ink, 12),
      [[C.red, 'M440 580Q500 640 560 580Q500 595 440 580Z', {}]],
      [[C.yellow, 'M690 330L630 440L670 440L620 560L730 420L685 420Z', {}]],
    ),
    'w-star-69': cat(
      band(870, C.violet),
      ln('M150 870V760M850 870V760', C.ink, 34),
      [
        [C.brown, 'R120 300 760 400 30', {}],
        [C.brown, 'R170 330 660 340 12', { s: C.ink }].slice(0, 0),
      ],
      [[C.paper, 'R150 330 700 90 10', {}]],
      [[C.paper, 'R130 640 740 110 12', {}]],
      ln(
        'M170 640V750M250 640V750M330 640V750M410 640V750M490 640V750M570 640V750M650 640V750M730 640V750M810 640V750',
        C.ink,
        5,
      ),
      [
        [C.ink, 'R230 640 40 70 6', {}],
        [C.ink, 'R310 640 40 70 6', {}],
        [C.ink, 'R470 640 40 70 6', {}],
        [C.ink, 'R550 640 40 70 6', {}],
        [C.ink, 'R630 640 40 70 6', {}],
      ],
      ln('M170 570V750M850 570V750', C.ink, 7).slice(0, 0),
      [[C.violet, 'R400 770 200 30 8', {}]].slice(0, 0),
      note(780, 200, 1.4, C.pink),
    ),
    'w-star-70': cat(
      band(860),
      man({
        x: 420,
        y: 860,
        h: 640,
        shirt: C.violet,
        pants: C.blue,
        hair: C.orange,
        aL: [0.2, -0.04],
        aR: [0.16, 0.0],
        fL: [-0.1, 0],
        fR: [0.1, 0],
      }),
      at(guitar(C.red), 480, 590, 0.65, -80),
      [
        [C.ink, 'R640 790 220 70 14', {}],
        [C.orange, 'E710 825 14 14', { s: 'none' }],
        [C.paper, 'E790 825 14 14', { s: 'none' }],
      ],
      note(780, 360, 1.1, C.pink),
    ),
    'w-star-71': cat(
      band(880, C.violet),
      [[C.blue, 'M430 400L570 400L700 870L300 870Z', {}]],
      K.tube(
        [
          [440, 420],
          [250, 470],
          [160, 330],
        ],
        34,
        C.sky,
      ),
      K.tube(
        [
          [560, 420],
          [750, 470],
          [840, 330],
        ],
        34,
        C.sky,
      ),
      [
        [C.yellow, 'E160 320 36 36', {}],
        [C.yellow, 'E840 320 36 36', {}],
      ],
      [[C.ink, 'R388 130 224 330 100', {}]],
      [[C.yellow, 'E500 290 100 118', {}]],
      [[C.ink, 'E500 220 112 80', { s: 'none' }]],
      ln('M470 320Q500 345 530 320', C.ink, 7),
      [
        [C.ink, 'E465 290 12 14', { s: 'none' }],
        [C.ink, 'E535 290 12 14', { s: 'none' }],
      ],
      heart(840, 700, 0.6, C.red),
      star(180, 640, 40, C.yellow),
    ),
    'w-star-72': cat(
      band(880, C.violet),
      K.tube(
        [
          [300, 880],
          [380, 640],
        ],
        70,
        C.blue,
      ),
      K.tube(
        [
          [700, 880],
          [620, 640],
        ],
        70,
        C.blue,
      ),
      [[C.paper, 'M360 330L640 330L700 700L300 700Z', {}]],
      [[C.paper, 'M360 330L640 330L700 700L300 700Z', { s: 'none' }]],
      [[C.red, 'M360 330L640 330L700 700L300 700Z', {}]],
      K.tube(
        [
          [360, 400],
          [220, 300],
          [300, 120],
        ],
        80,
        C.orange,
      ),
      K.tube(
        [
          [640, 400],
          [780, 300],
          [700, 120],
        ],
        80,
        C.orange,
      ),
      ln('M120 100H880', C.ink, 34),
      [
        [C.ink, 'R100 30 60 140 12', {}],
        [C.ink, 'R840 30 60 140 12', {}],
      ],
      [[C.orange, 'E500 280 100 110', {}]],
      ln('M440 250L480 262M560 250L520 262M450 330H550', C.ink, 12),
    ),
    'w-star-73': cat(
      band(860),
      [
        [C.brown, 'R120 560 760 60 12', {}],
        [C.brown, 'R120 400 760 120 12', {}],
        ln('M160 400V600', C.ink, 7).slice(0, 0),
      ],
      [
        [C.brown, 'R170 620 50 240 8', {}],
        [C.brown, 'R780 620 50 240 8', {}],
      ],
      [
        [C.red, 'R300 440 200 120 8', {}],
        [C.yellow, 'R380 440 40 120 0', { s: 'none' }],
      ],
      [
        [
          C.paper,
          'M690 540C640 400 760 300 800 200C820 340 780 440 760 540Z',
          {},
        ],
      ],
      ln('M780 220C740 330 730 440 725 540', C.ink, 5).slice(0, 0),
    ),
    'w-star-74': cat(
      [
        [C.yellow, 'R300 790 400 80 14', {}],
        [C.brown, 'R340 870 320 40 10', {}],
      ].slice(0, 0),
      [[C.brown, 'R280 800 440 90 12', {}]],
      [[C.yellow, 'M440 800L460 560L540 560L560 800Z', {}]],
      [[C.yellow, 'E500 220 70 80', {}]],
      [[C.yellow, 'M420 330C420 290 580 290 580 330L600 560L400 560Z', {}]],
      K.tube(
        [
          [430, 340],
          [380, 440],
          [470, 520],
        ],
        30,
        C.yellow,
      ),
      K.tube(
        [
          [570, 340],
          [620, 440],
          [530, 520],
        ],
        30,
        C.yellow,
      ),
      [[C.paper, 'E470 200 14 28 -20', { s: 'none' }]],
      star(210, 220, 50, C.orange),
      star(800, 280, 60, C.yellow),
      star(780, 620, 36, C.orange),
      star(200, 580, 32, C.yellow),
    ),
    'w-star-75': cat(
      band(870, C.sky),
      K.tube(
        [
          [500, 610],
          [500, 840],
        ],
        42,
        C.pink,
      ),
      K.tube(
        [
          [560, 600],
          [680, 520],
          [500, 590],
        ],
        36,
        C.pink,
      ),
      [[C.ink, 'E500 870 36 16', {}]],
      [
        [
          C.paper,
          'M500 580C400 560 280 600 230 640C300 670 400 680 500 660C600 680 700 670 770 640C720 600 600 560 500 580Z',
          {},
        ],
      ],
      [[C.pink, 'R440 400 120 200 30', {}]],
      [[C.paper, 'E500 600 270 50', { s: C.ink }].slice(0, 0)],
      K.tube(
        [
          [440, 440],
          [280, 330],
          [440, 150],
        ],
        30,
        C.pink,
      ),
      K.tube(
        [
          [560, 440],
          [720, 330],
          [560, 150],
        ],
        30,
        C.pink,
      ),
      [[C.yellow, 'E500 300 62 70', {}]],
      [[C.ink, 'E500 215 30 24', {}]],
    ),
    'w-star-76': cat(
      band(880, C.violet),
      K.tube(
        [
          [430, 700],
          [420, 880],
        ],
        60,
        C.red,
      ),
      K.tube(
        [
          [570, 700],
          [580, 880],
        ],
        60,
        C.red,
      ),
      [
        [C.red, 'R350 400 300 330 40', {}],
        [C.yellow, 'R390 470 220 28 10', { s: 'none' }].slice(0, 0),
      ],
      [
        [C.yellow, 'E500 520 60 60', {}],
        [C.paper, 'E500 520 28 28', { s: 'none' }],
      ],
      K.tube(
        [
          [360, 450],
          [250, 520],
          [230, 650],
        ],
        50,
        C.red,
      ),
      K.tube(
        [
          [640, 450],
          [750, 520],
          [770, 650],
        ],
        50,
        C.red,
      ),
      [
        [C.yellow, 'E230 670 36 36', {}],
        [C.yellow, 'E770 670 36 36', {}],
      ],
      [[C.yellow, 'R400 190 200 190 36', {}]],
      [
        [C.paper, 'R440 240 120 40 16', {}],
        [C.ink, 'R450 300 100 14 0', { s: 'none' }].slice(0, 0),
      ],
      [
        [C.sky, 'E480 260 14 8', { s: 'none' }],
        [C.sky, 'E520 260 14 8', { s: 'none' }],
      ],
      ln('M450 320H550', C.ink, 7),
      [[C.red, 'R480 100 40 90 8', {}]],
    ),
    'w-movie-0': cat(
      [[C.sky, 'R100 560 800 340 20', { s: 'none' }].slice(0, 0)],
      [[C.blue, 'R60 650 880 250 20', {}]],
      [
        [C.paper, 'M640 500L760 330L900 560L860 660L660 660Z', {}],
        [C.sky, 'M760 330L810 450L720 470Z', { i: 1 }].slice(0, 0),
      ],
      [
        [C.ink, 'M130 520L860 520L780 700L220 700Z', {}],
        [C.red, 'M215 665L785 665L780 700L220 700Z', { s: 'none' }],
      ],
      [[C.paper, 'R250 420 380 100 8', {}]],
      [[C.paper, 'R330 350 200 70 8', {}]],
      [
        [C.orange, 'R270 280 50 150 6', {}],
        [C.orange, 'R350 260 50 170 6', {}],
        [C.orange, 'R430 280 50 150 6', {}],
        [C.orange, 'R510 300 50 130 6', {}],
      ],
      ln('M290 280V270M370 260V250M450 280V270M530 300V290', C.ink, 7).slice(
        0,
        0,
      ),
      [
        [C.ink, 'R270 270 50 22 4', { s: 'none' }],
        [C.ink, 'R350 250 50 22 4', { s: 'none' }],
        [C.ink, 'R430 270 50 22 4', { s: 'none' }],
        [C.ink, 'R510 290 50 22 4', { s: 'none' }],
      ],
      ln('M290 460H600M290 490H600', C.ink, 7),
      ln(
        'M100 720Q150 690 200 720T300 720T400 720T500 720T600 720T700 720T800 720T900 720',
        C.sky,
        7,
      ),
      ln(
        'M100 800Q150 770 200 800T300 800T400 800T500 800T600 800T700 800T800 800',
        C.sky,
        7,
      ),
    ),
    'w-movie-1': cat(
      [[C.sky, 'R60 60 880 880 40', {}].slice(0, 0)],
      [[C.yellow, 'E780 190 70 70', {}]],

      [[C.mint, 'M60 330L170 160L290 330Z', {}]],
      [[C.brown, 'M60 330L290 330L240 400L110 400Z', {}]],
      ln('M330 580V640', C.sky, 16).slice(0, 0),
      [
        [C.mint, 'M720 330L810 220L900 330Z', {}],
        [C.brown, 'M720 330L900 330L860 390L760 390Z', {}],
      ],
      band(840, C.green).slice(0, 0),
      K.tube(
        [
          [500, 940],
          [500, 700],
          [470, 560],
        ],
        90,
        C.brown,
      ),
      [
        [C.violet, 'E500 450 270 160', {}],
        [C.violet, 'E390 540 160 110', {}],
        [C.violet, 'E620 540 160 110', {}],
      ],
      [
        [C.pink, 'E410 400 24 24', { s: 'none' }],
        [C.pink, 'E560 360 24 24', { s: 'none' }],
        [C.pink, 'E640 480 24 24', { s: 'none' }],
        [C.pink, 'E330 500 24 24', { s: 'none' }],
        [C.sky, 'E500 480 24 24', { s: 'none' }],
      ],
    ),
    'w-movie-2': cat(
      band(840, C.mint),
      palm(180, 860, 0.85),
      palm(880, 860, 0.7),
      K.tube(
        [
          [300, 700],
          [150, 780],
          [80, 760],
        ],
        50,
        C.green,
      ).slice(0, 0),
      [
        [
          C.green,
          'M300 520C220 580 120 650 70 740C150 740 260 700 330 650Z',
          {},
        ],
      ],
      K.tube(
        [
          [560, 480],
          [680, 380],
        ],
        100,
        C.green,
      ),
      [[C.green, 'E470 520 210 140 -8', {}]],
      [
        [
          C.green,
          'M600 400L690 250C730 200 850 230 880 280C900 340 840 380 770 390L700 450Z',
          {},
        ],
      ],
      [
        [
          C.mint,
          'M700 390C760 350 840 345 870 300L880 330C860 380 780 430 700 450Z',
          { s: 'none' },
        ].slice(0, 0),
      ],
      [[C.mint, 'E470 570 190 80 -8', { s: 'none' }].slice(0, 0)],
      [
        [C.green, 'R360 600 110 230 40', {}],
        [C.green, 'R500 620 110 210 40', {}],
      ],
      [
        [C.ink, 'E360 840 110 40', {}],
        [C.ink, 'E520 840 110 40', {}],
      ].slice(0, 0),
      [
        [C.green, 'E330 850 70 38', {}],
        [C.green, 'E510 850 70 38', {}],
      ],
      [[C.paper, 'M740 380L760 350L780 385ZM790 380L810 345L825 380Z', {}]],
      [[C.green, 'M650 470L690 420L690 480Z', {}]],
      [[C.ink, 'E760 300 14 14', { s: 'none' }]],
      [
        [C.green, 'M620 480L660 440L670 500L630 520Z', { s: 'none' }].slice(
          0,
          0,
        ),
      ],
      K.tube(
        [
          [620, 520],
          [660, 560],
        ],
        24,
        C.green,
      ),
    ),
    'w-movie-3': cat(
      [[C.ink, 'R60 60 880 880 40', {}]],
      star(160, 180, 24, C.paper),
      star(800, 150, 30, C.paper),
      star(640, 330, 18, C.yellow),
      star(200, 760, 28, C.yellow),
      star(850, 780, 22, C.paper),
      [
        [C.violet, 'E300 330 150 150', {}],
        [C.paper, 'M200 250C260 230 340 270 380 220', { s: 'none' }].slice(
          0,
          0,
        ),
      ],
      ln('M130 400C220 290 400 330 470 270', C.sky, 16),
      [
        [
          C.pink,
          'M190 280C240 260 300 270 340 240L400 260L410 330L330 330Z',
          { i: 1 },
        ].slice(0, 0),
      ],
      [[C.violet, 'E300 330 150 150', {}]],
      ln('M110 330C100 430 500 400 490 300', C.yellow, 16),
      ln('M110 330C105 300 150 280 190 270', C.yellow, 16).slice(0, 0),
      [[C.paper, 'E620 620 190 46', {}]],
      [
        [C.red, 'M480 560L330 470L420 650ZM770 560L920 470L830 650Z', {}].slice(
          0,
          0,
        ),
      ],
      [
        [C.red, 'M520 600L380 470L440 640Z', {}],
        [C.red, 'M720 600L860 470L800 640Z', {}],
        [C.red, 'M520 640L380 770L440 620Z', {}],
        [C.red, 'M720 640L860 770L800 620Z', {}],
      ],
      [[C.paper, 'E620 620 190 46', {}]],
      [[C.sky, 'E680 605 55 28', {}]],
      ln('M470 620H400M770 620H840', C.ink, 7),
    ),
    'w-movie-4': cat(
      [[C.paper, 'M130 650L130 500L180 500L180 650Z', {}].slice(0, 0)],
      [
        [
          C.mint,
          'M60 880C200 700 420 640 500 620C600 640 800 700 940 880Z',
          {},
        ],
      ],
      [
        [C.violet, 'R640 440 220 270 8', {}],
        [C.paper, 'R660 460 180 60 4', { s: 'none' }].slice(0, 0),
      ],
      [
        [C.violet, 'R640 440 40 270 4', {}],
        [C.violet, 'R720 400 40 310 4', {}],
        [C.violet, 'R800 440 40 270 4', {}],
      ],
      [
        [
          C.red,
          'M640 440L660 360L680 440ZM720 400L740 310L760 400ZM800 440L820 360L840 440Z',
          {},
        ],
      ],
      [[C.yellow, 'R710 600 60 90 28', { s: C.ink }]],
      [
        [
          C.violet,
          'M500 800C500 600 560 400 700 220L760 360C700 400 700 600 740 800Z',
          {},
        ].slice(0, 0),
      ],
      [
        [
          C.blue,
          'M200 800C200 700 260 620 300 520C340 420 330 300 340 220C360 300 420 380 460 500C520 560 560 700 580 800Z',
          {},
        ],
        [C.yellow, 'R200 500 400 50 0', {}].slice(0, 0),
      ],
      [[C.blue, 'E390 810 310 70', {}]],
      [[C.yellow, 'R230 700 320 50 10', {}]],
      K.tube(
        [
          [300, 380],
          [520, 260],
          [740, 180],
        ],
        24,
        C.brown,
      ).slice(0, 0),
      star(150, 220, 50, C.yellow),
      star(860, 200, 30, C.orange).slice(0, 0),
    ),
    'w-movie-5': cat(
      [[C.red, 'M80 880L430 480L520 560L620 440L930 880Z', {}]],
      [
        [
          C.orange,
          'M355 560L430 480L520 560L620 440L680 510C620 580 560 560 520 620C440 600 400 620 355 560Z',
          { s: 'none' },
        ].slice(0, 0),
      ],
      [[C.orange, 'M390 520L430 480L470 520Z', { s: 'none' }].slice(0, 0)],
      [
        [C.orange, 'M560 500L620 440L660 480L610 520Z', { s: 'none' }].slice(
          0,
          0,
        ),
      ],
      [[C.yellow, 'M440 480L520 560L540 520Z', { s: 'none' }].slice(0, 0)],
      ln(
        'M360 880C380 780 420 720 450 670C430 640 420 620 430 600',
        C.orange,
        24,
      ).slice(0, 0),
      [
        [C.ink, 'M430 480L520 560L620 440L560 400L470 450Z', {}],
        [
          C.orange,
          'M450 500L520 570L610 450L590 440L525 520L470 470Z',
          { s: 'none' },
        ].slice(0, 0),
      ],
      [
        ['none', 'E500 330 170 170', { s: C.ink, w: 80 }],
        ['none', 'E500 330 170 170', { s: C.yellow, w: 56 }],
        ['none', 'M360 280C380 230 420 200 450 190', { s: C.paper, w: 12 }],
      ],
      [
        [C.orange, 'M470 520L500 440L530 520Z', {}],
        [C.yellow, 'M488 520L500 480L512 520Z', { s: 'none' }],
      ],
      [C.orange, 'M470 780L440 880L500 850L520 880L540 820Z', {}].slice(0, 0),
    ),
    'w-movie-6': cat(
      band(850, C.mint),
      [
        [C.red, 'R120 640 240 210 10', {}],
        [C.paper, 'E240 745 60 60', { s: C.ink }],
      ],
      [
        [C.blue, 'R360 640 240 210 10', {}],
        [C.yellow, 'M480 660L420 760L540 760Z', { s: C.ink }],
      ],
      [
        [C.yellow, 'R240 430 240 210 10', {}],
        [C.red, 'R300 480 120 100 10', { s: 'none' }],
      ],
      [[C.sky, 'M200 440L360 330L520 440Z', {}]].slice(0, 0),
      [
        [C.red, 'E740 760 90 90', {}],
        [
          C.paper,
          'M650 740Q740 700 830 740L830 780Q740 740 650 780Z',
          { s: 'none' },
        ],
      ],
      [
        [
          C.brown,
          'M640 480C660 400 800 400 820 480L900 500C880 540 600 540 580 500Z',
          {},
        ],
      ],
      [[C.red, 'M650 480L810 480L810 500L650 500Z', { s: 'none' }].slice(0, 0)],
      star(700, 310, 40, C.yellow),
      star(840, 200, 26, C.orange),
    ),
    'w-movie-7': cat(
      band(840, C.paper),
      [
        [C.sky, 'M100 840L250 600L400 840Z', {}],
        [C.sky, 'M600 840L760 580L900 840Z', {}],
      ],
      [[C.sky, 'R380 460 240 380 8', {}]],
      [
        [C.paper, 'M380 460L420 280L460 460Z', {}],
        [C.paper, 'M540 460L580 280L620 460Z', {}],
        [C.paper, 'M440 460L500 120L560 460Z', {}],
      ],
      [[C.sky, 'M440 460L500 120L560 460Z', { s: 'none' }].slice(0, 0)],
      [[C.blue, 'R470 640 60 200 28', {}]],
      ln('M500 140V300', C.blue, 7).slice(0, 0),
      [
        [C.sky, 'R340 620 80 220 8', {}],
        [C.sky, 'R580 620 80 220 8', {}],
      ],
      [[C.blue, 'M340 620L380 540L420 620ZM580 620L620 540L660 620Z', {}]],
      snow(190, 240, 90, C.sky),
      snow(820, 260, 70, C.sky),
      snow(780, 480, 40, C.sky),
      snow(250, 470, 35, C.sky),
    ),
    'w-movie-8': cat(
      [[C.yellow, 'E500 520 330 330', {}].slice(0, 0)],
      [[C.orange, 'E500 620 260 260', {}]].slice(0, 0),
      [[C.orange, 'E730 250 100 100', {}]].slice(0, 0),
      [[C.yellow, 'E770 170 90 90', {}]],
      ln(
        'M770 40V60M650 100L670 120M880 100L860 120M880 240L860 220M650 240L670 220',
        C.orange,
        16,
      ).slice(0, 0),
      [
        [
          C.violet,
          'M60 880L130 700L400 680L450 560L650 560L700 700L940 740L960 880Z',
          {},
        ],
      ],
      [
        [
          C.violet,
          'M60 880L130 700L400 680L450 560L650 560L700 700L940 740L960 880Z',
          { s: 'none' },
        ].slice(0, 0),
      ],
      K.tube(
        [
          [330, 640],
          [330, 520],
        ],
        44,
        C.yellow,
      ).slice(0, 0),
      [[C.orange, 'E600 480 190 100', {}]],
      K.tube(
        [
          [440, 560],
          [440, 640],
        ],
        40,
        C.orange,
      ),
      K.tube(
        [
          [740, 560],
          [740, 640],
        ],
        40,
        C.orange,
      ),
      K.tube(
        [
          [780, 450],
          [880, 400],
          [900, 280],
        ],
        24,
        C.orange,
      ),
      [[C.brown, 'E900 270 36 36', {}]],
      [[C.brown, 'E380 330 150 150', {}]],
      [[C.yellow, 'E380 340 90 100', {}]],
      [
        [C.ink, 'E350 320 10 14', { s: 'none' }],
        [C.ink, 'E410 320 10 14', { s: 'none' }],
        [C.ink, 'E380 370 24 16', { s: 'none' }],
      ],
      ln('M380 385V410M360 415Q380 430 400 415', C.ink, 7),
      [
        [C.orange, 'E300 240 28 28', {}],
        [C.orange, 'E460 240 28 28', {}],
      ],
    ),
    'w-movie-9': cat(
      [[C.sky, 'R80 100 840 780 40', {}].slice(0, 0)],
      [[C.yellow, 'R80 800 840 120 20', {}]],
      [
        [
          C.violet,
          'M200 800C200 650 260 600 280 520C300 600 330 600 350 520C370 600 400 650 400 800Z',
          {},
        ],
      ],
      ln('M240 800V620M300 800V580M360 800V620', C.pink, 12),
      [[C.orange, 'M780 480L930 340L930 640Z', {}]],
      [[C.orange, 'E560 490 230 150', { b: 1 }]],
      [
        [
          C.paper,
          'M470 345C500 400 500 580 470 635L520 640C550 580 550 400 520 345Z',
          { i: 1 },
        ],
        [
          C.paper,
          'M640 360C660 420 660 560 640 620L690 610C715 560 715 420 690 370Z',
          { i: 1 },
        ],
      ],
      [[C.orange, 'M470 345L430 250L580 350Z', {}]],
      [[C.orange, 'M500 640L460 720L580 630Z', {}]],
      [
        [C.paper, 'E400 460 38 38', {}],
        [C.ink, 'E390 460 16 16', { s: 'none' }],
      ],
      ln('M335 530Q370 560 400 540', C.ink, 7),
      [
        [C.sky, 'E160 300 30 30', {}],
        [C.sky, 'E250 220 20 20', {}],
        [C.sky, 'E800 250 36 36', {}],
        [C.sky, 'E720 180 18 18', {}],
      ],
    ),
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
