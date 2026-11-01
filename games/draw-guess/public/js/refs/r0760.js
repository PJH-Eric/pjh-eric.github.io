(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;
  var INK = { s: C.ink };

  function line(d, col, w) {
    return ['none', d, { s: col || C.ink, w: w || 16 }];
  }
  function dot(x, y, rx, ry, col) {
    return [
      col || C.ink,
      'E' + x + ' ' + y + ' ' + rx + ' ' + (ry || rx),
      { s: 'none' },
    ];
  }
  function heart(cx, cy, s, col) {
    return [
      col || C.red,
      'M' +
        cx +
        ' ' +
        (cy + s) +
        'C' +
        (cx - s * 1.6) +
        ' ' +
        (cy - s * 0.2) +
        ' ' +
        (cx - s * 0.7) +
        ' ' +
        (cy - s * 1.3) +
        ' ' +
        cx +
        ' ' +
        (cy - s * 0.4) +
        'C' +
        (cx + s * 0.7) +
        ' ' +
        (cy - s * 1.3) +
        ' ' +
        (cx + s * 1.6) +
        ' ' +
        (cy - s * 0.2) +
        ' ' +
        cx +
        ' ' +
        (cy + s) +
        'Z',
      { w: 7 },
    ];
  }
  function spark(cx, cy, r, col) {
    return [
      col || C.yellow,
      'M' +
        cx +
        ' ' +
        (cy - r) +
        'Q' +
        cx +
        ' ' +
        cy +
        ' ' +
        (cx + r) +
        ' ' +
        cy +
        'Q' +
        cx +
        ' ' +
        cy +
        ' ' +
        cx +
        ' ' +
        (cy + r) +
        'Q' +
        cx +
        ' ' +
        cy +
        ' ' +
        (cx - r) +
        ' ' +
        cy +
        'Q' +
        cx +
        ' ' +
        cy +
        ' ' +
        cx +
        ' ' +
        (cy - r) +
        'Z',
      { w: 7 },
    ];
  }
  function drop(x, y, s, col) {
    return [
      col || C.sky,
      'M' +
        x +
        ' ' +
        y +
        'C' +
        (x + s * 0.9) +
        ' ' +
        (y + s * 1.1) +
        ' ' +
        (x + s * 0.9) +
        ' ' +
        (y + s * 2) +
        ' ' +
        x +
        ' ' +
        (y + s * 2) +
        'C' +
        (x - s * 0.9) +
        ' ' +
        (y + s * 2) +
        ' ' +
        (x - s * 0.9) +
        ' ' +
        (y + s * 1.1) +
        ' ' +
        x +
        ' ' +
        y +
        'Z',
      { w: 7 },
    ];
  }
  function hand(x, y, skin) {
    return [skin || C.yellow, 'E' + x + ' ' + y + ' 42 42', {}];
  }
  function arm(pts, shirt, skin) {
    var e = pts[pts.length - 1];
    return K.tube(pts, 76, shirt || C.blue).concat([hand(e[0], e[1], skin)]);
  }
  function cloud(x, y, s, col) {
    return K.T(
      [
        [
          col || C.violet,
          'M150 250C100 250 90 170 160 160C170 100 270 90 300 150C350 110 430 150 400 220C440 250 410 290 370 290L170 290C130 290 110 270 150 250Z',
          {},
        ],
      ],
      { dx: x - 270, dy: y - 200, s: s, cx: 270, cy: 200 },
    );
  }

  /* face: o = {under, over, eyes, brows, mouth, blush, shirt, skin, hair, hairless} */
  function eyes(type, skin) {
    var out = [],
      xs = [430, 570],
      i,
      x,
      y = 410;
    for (i = 0; i < 2; i++) {
      x = xs[i];
      if (type === 'dot') out.push(dot(x, y, 16, 22));
      else if (type === 'wide')
        out.push(
          ['#FFFDF8', 'E' + x + ' ' + y + ' 36 42', {}],
          dot(x, y, 14, 18),
        );
      else if (type === 'widesmall')
        out.push(
          ['#FFFDF8', 'E' + x + ' ' + y + ' 36 42', {}],
          dot(x, y, 8, 10),
        );
      else if (type === 'happy')
        out.push(
          line(
            'M' +
              (x - 30) +
              ' ' +
              (y + 10) +
              'Q' +
              x +
              ' ' +
              (y - 35) +
              ' ' +
              (x + 30) +
              ' ' +
              (y + 10),
          ),
        );
      else if (type === 'closed')
        out.push(
          line(
            'M' +
              (x - 30) +
              ' ' +
              (y - 5) +
              'Q' +
              x +
              ' ' +
              (y + 28) +
              ' ' +
              (x + 30) +
              ' ' +
              (y - 5),
          ),
        );
      else if (type === 'half')
        out.push(
          dot(x, y + 10, 14, 12),
          line('M' + (x - 34) + ' ' + y + 'L' + (x + 34) + ' ' + y),
        );
      else if (type === 'heart') out.push(heart(x, y, 28, C.red));
      else if (type === 'star') out.push(spark(x, y, 38, C.yellow));
      else if (type === 'x')
        out.push(
          line(
            'M' +
              (x - 24) +
              ' ' +
              (y - 24) +
              'L' +
              (x + 24) +
              ' ' +
              (y + 24) +
              'M' +
              (x + 24) +
              ' ' +
              (y - 24) +
              'L' +
              (x - 24) +
              ' ' +
              (y + 24),
          ),
        );
      else if (type === 'side')
        out.push(
          ['#FFFDF8', 'E' + x + ' ' + y + ' 34 38', {}],
          dot(x + 16, y, 13, 16),
        );
      else if (type === 'down')
        out.push(
          ['#FFFDF8', 'E' + x + ' ' + y + ' 34 38', {}],
          dot(x, y + 18, 13, 14),
        );
      else if (type === 'up')
        out.push(
          ['#FFFDF8', 'E' + x + ' ' + y + ' 34 38', {}],
          dot(x, y - 16, 13, 14),
        );
      else if (type === 'shades') {
        /* drawn separately */
      }
    }
    if (type === 'shades')
      out.push(
        [C.ink, 'R365 380 120 70 28', {}],
        [C.ink, 'R510 380 120 70 28', {}],
        line('M485 405L515 405', C.ink, 16),
        ['none', 'M390 395L420 395', { s: C.sky, w: 7 }],
      );
    return out;
  }
  function brows(type) {
    if (type === 'angry')
      return [line('M375 330L470 370'), line('M625 330L530 370')];
    if (type === 'sad')
      return [line('M375 370L470 335'), line('M625 370L530 335')];
    if (type === 'up')
      return [
        line('M385 345Q430 300 470 335'),
        line('M615 345Q570 300 530 335'),
      ];
    if (type === 'one')
      return [line('M385 355L470 355'), line('M530 345Q575 295 620 335')];
    if (type === 'flat')
      return [line('M385 345L470 345'), line('M530 345L615 345')];
    return [];
  }
  function mouth(type) {
    if (type === 'smile') return [line('M430 500Q500 580 570 500')];
    if (type === 'small') return [line('M455 520Q500 555 545 520')];
    if (type === 'big')
      return [
        [
          C.red,
          'M410 490Q500 505 590 490Q585 610 500 610Q415 610 410 490Z',
          {},
        ],
        [C.pink, 'M455 585Q500 550 545 585Q500 615 455 585Z', { s: 'none' }],
      ];
    if (type === 'frown') return [line('M435 570Q500 500 565 570')];
    if (type === 'o') return [[C.red, 'E500 545 30 40', {}]];
    if (type === 'flat') return [line('M450 540L550 540')];
    if (type === 'wavy')
      return [line('M425 545Q452 510 478 545T530 545T575 545')];
    if (type === 'grit')
      return [
        ['#FFFDF8', 'R430 510 140 60 14', {}],
        line('M477 510L477 570', C.ink, 7),
        line('M523 510L523 570', C.ink, 7),
        line('M430 540L570 540', C.ink, 7),
      ];
    if (type === 'smirk') return [line('M440 535Q520 545 580 490')];
    if (type === 'pout') return [line('M445 560Q500 520 555 560')];
    if (type === 'yawn')
      return [
        [C.red, 'E500 550 55 70', {}],
        [C.pink, 'E500 585 32 22', { s: 'none' }],
      ];
    return [];
  }
  function face(o) {
    var skin = o.skin || C.yellow,
      shirt = o.shirt || C.blue,
      L = [];
    L = L.concat(o.under || []);
    L.push([skin, 'R452 560 96 150 20', {}]);
    L.push([
      shirt,
      'M200 940C200 760 320 690 500 690C680 690 800 760 800 940Z',
      {},
    ]);
    L.push([skin, 'E315 410 30 44', {}], [skin, 'E685 410 30 44', {}]);
    L.push([o.face || skin, 'E500 400 188 205', {}]);
    L.push([
      o.hair || C.brown,
      'M312 400C300 235 400 170 500 170C610 170 705 235 688 400C655 320 575 285 500 290C425 285 345 320 312 400Z',
      {},
    ]);
    if (o.blush)
      L.push(
        [C.pink, 'E378 480 42 26', { s: 'none' }],
        [C.pink, 'E622 480 42 26', { s: 'none' }],
      );
    L = L.concat(
      eyes(o.eyes || 'dot'),
      brows(o.brows),
      mouth(o.mouth || 'smile'),
    );
    L = L.concat(o.over || []);
    return L;
  }
  function mirrorPts(pts) {
    var r = [],
      i;
    for (i = 0; i < pts.length; i++) r.push([1000 - pts[i][0], pts[i][1]]);
    return r;
  }

  var FACE = {};
  FACE.joy = face({
    eyes: 'happy',
    mouth: 'big',
    blush: 1,
    over: [].concat(
      arm([
        [250, 790],
        [150, 640],
        [160, 470],
      ]),
      arm(
        mirrorPts([
          [250, 790],
          [150, 640],
          [160, 470],
        ]),
      ),
      [spark(820, 200, 50), spark(190, 190, 40)],
    ),
  });
  FACE.sad = face({
    eyes: 'dot',
    brows: 'sad',
    mouth: 'frown',
    over: [drop(425, 460, 24), drop(575, 460, 24)],
  });
  FACE.angry = face({
    eyes: 'dot',
    brows: 'angry',
    mouth: 'grit',
    face: C.orange,
    over: [cloud(200, 160, 0.7, C.paper), cloud(800, 160, 0.7, C.paper)],
  });
  FACE.scared = face({
    eyes: 'widesmall',
    brows: 'sad',
    mouth: 'wavy',
    face: C.pink,
    over: [].concat(
      arm([
        [260, 790],
        [230, 640],
        [330, 520],
      ]),
      arm(
        mirrorPts([
          [260, 790],
          [230, 640],
          [330, 520],
        ]),
      ),
      [drop(710, 270, 26)],
    ),
  });
  FACE.surprise = face({
    eyes: 'wide',
    brows: 'up',
    mouth: 'o',
    over: [
      line('M190 250L120 200'),
      line('M180 340L90 340'),
      line('M810 250L880 200'),
      line('M820 340L910 340'),
    ],
  });
  FACE.shy = face({
    eyes: 'down',
    brows: 'none',
    mouth: 'small',
    blush: 1,
    over: [].concat(
      arm([
        [300, 800],
        [380, 700],
        [440, 600],
      ]),
      arm(
        mirrorPts([
          [300, 800],
          [380, 700],
          [440, 600],
        ]),
      ),
      [heart(800, 230, 36, C.pink)],
    ),
  });
  FACE.excited = face({
    eyes: 'star',
    brows: 'up',
    mouth: 'big',
    blush: 1,
    over: [].concat(
      arm([
        [250, 790],
        [140, 650],
        [170, 500],
      ]),
      arm(
        mirrorPts([
          [250, 790],
          [140, 650],
          [170, 500],
        ]),
      ),
      [spark(820, 170, 50), spark(190, 150, 40), spark(500, 100, 34)],
    ),
  });
  FACE.nervous = face({
    eyes: 'dot',
    brows: 'sad',
    mouth: 'wavy',
    over: [
      drop(700, 260, 28),
      drop(300, 300, 22),
      line('M840 400L880 380M840 450L890 450', C.ink, 7),
    ],
  });
  FACE.bored = face({
    eyes: 'half',
    brows: 'flat',
    mouth: 'flat',
    over: arm([
      [730, 800],
      [790, 690],
      [660, 560],
    ]),
  });
  FACE.tired = face({
    eyes: 'closed',
    mouth: 'yawn',
    over: [
      line('M390 450Q430 470 470 450', C.violet, 7),
      line('M530 450Q570 470 610 450', C.violet, 7),
      line('M740 150L810 150L740 220L810 220', C.blue, 16),
    ],
  });
  FACE.proud = face({
    eyes: 'half',
    brows: 'one',
    mouth: 'smirk',
    over: [
      spark(760, 220, 44),
      spark(240, 250, 34),
      ['#E7C263', 'E500 780 46 46', { w: 7 }],
      star5(500, 780, 26),
    ],
  });
  function star5(cx, cy, r) {
    var pts = [],
      i,
      a,
      rr;
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 5;
      rr = i % 2 ? r * 0.45 : r;
      pts.push(
        Math.round(cx + rr * Math.cos(a)) +
          ' ' +
          Math.round(cy + rr * Math.sin(a)),
      );
    }
    return [C.red, 'M' + pts.join('L') + 'Z', { w: 7 }];
  }
  FACE.grievance = face({
    eyes: 'dot',
    brows: 'sad',
    mouth: 'pout',
    blush: 1,
    over: [drop(425, 455, 34), drop(575, 455, 34)],
  });
  FACE.sweat = null;

  /* lonely: small figure + moon */
  var lonely = [].concat(
    [[C.blue, 'R0 0 1000 1000', { s: 'none' }]],
    [
      [C.paper, 'E780 200 90 90', {}],
      [C.blue, 'E815 180 80 80', { s: 'none' }],
    ],
    [
      spark(200, 160, 30, C.yellow),
      spark(460, 110, 24, C.yellow),
      spark(620, 260, 24, C.yellow),
    ],
    [[C.green, 'M0 800L1000 800L1000 1000L0 1000Z', {}]],
    K.T(face({ eyes: 'dot', brows: 'sad', mouth: 'frown' }), {
      dx: 0,
      dy: 0,
      s: 0.5,
      cx: 500,
      cy: 1000,
    }),
  );
  lonely.splice(1, 0, [C.blue, 'M0 0L1000 0L1000 800L0 800Z', {}]);
  lonely.shift();

  function bgRect(col, y0) {
    return [
      col,
      'M0 ' + (y0 || 0) + 'L1000 ' + (y0 || 0) + 'L1000 1000L0 1000Z',
      { s: 'none' },
    ];
  }

  Object.assign(R, {
    'w-fun-79': [].concat(
      K.tube(
        [
          [300, 650],
          [300, 890],
        ],
        40,
        C.brown,
      ),
      K.tube(
        [
          [700, 650],
          [700, 890],
        ],
        40,
        C.brown,
      ),
      [
        [C.blue, 'R130 200 740 480 36', {}],
        [C.paper, 'R200 280 260 260 20', {}],
        [C.paper, 'R540 280 260 260 20', {}],
        [C.red, 'E280 410 28 28', {}],
        [C.red, 'E340 410 28 28', {}],
        [C.red, 'E400 410 28 28', {}],
        [C.red, 'E600 410 28 28', {}],
        [C.red, 'E680 410 28 28', {}],
        [C.yellow, 'E250 235 20 20', {}],
        [C.yellow, 'E500 235 20 20', {}],
        [C.yellow, 'E750 235 20 20', {}],
        [C.orange, 'R130 590 740 70 20', { b: 1 }],
        [C.yellow, 'R130 590 150 70', { i: 1 }],
        line('M330 560L670 560', C.paper, 16),
      ],
    ),
    'w-fun-80': [
      [
        C.paper,
        'M500 120C565 120 585 190 565 250C545 300 625 380 645 510C665 660 605 790 500 790C395 790 335 660 355 510C375 380 455 300 435 250C415 190 435 120 500 120Z',
        { b: 1 },
      ],
      [C.red, 'R300 290 400 36', { i: 1 }],
      [C.red, 'R300 345 400 36', { i: 1 }],
      line('M100 800L900 800', C.ink, 16),
      [C.blue, 'E780 710 90 90', {}],
      [C.ink, 'E750 680 13 13', { s: 'none' }],
      [C.ink, 'E800 670 13 13', { s: 'none' }],
      [C.ink, 'E785 725 13 13', { s: 'none' }],
      [C.sky, 'E745 665 22 30 -30', { i: 1, s: 'none' }],
    ],
    'w-fun-81': [
      [
        C.yellow,
        'M500 200C780 200 880 380 850 540C820 680 700 640 650 700C610 760 640 820 520 810C300 800 150 680 150 500C150 330 300 200 500 200Z',
        { w: 16 },
      ],
      [C.paper, 'E610 720 48 48', {}],
      [C.red, 'E320 400 52 52', {}],
      [C.sky, 'E470 290 52 52', {}],
      [C.mint, 'E650 320 52 52', {}],
      [C.violet, 'E770 470 48 48', {}],
      [C.pink, 'E250 560 48 48', {}],
      [C.orange, 'E380 680 46 46', {}],
      K.tube(
        [
          [780, 870],
          [900, 660],
        ],
        36,
        C.brown,
      ),
      K.tube(
        [
          [900, 660],
          [935, 600],
        ],
        36,
        C.red,
      ),
    ],
    'w-fun-82': [].concat(
      [
        [C.orange, 'R250 130 500 740 26', {}],
        [C.paper, 'R300 170 420 660 14', {}],
        [C.yellow, 'E600 300 54 54', {}],
        [C.mint, 'M330 700L450 520L540 640L620 560L700 700Z', {}],
        line('M340 440L460 440', C.sky, 16),
        line('M340 480L420 480', C.sky, 16),
      ],
      [260, 340, 420, 500, 580, 660, 740].map(function (y) {
        return line('M225 ' + y + 'L320 ' + y, C.ink, 16);
      }),
      K.tube(
        [
          [800, 860],
          [900, 580],
        ],
        44,
        C.yellow,
      ),
      K.tube(
        [
          [900, 580],
          [920, 530],
        ],
        44,
        C.pink,
      ),
    ),
    'w-emotion-0': FACE.joy,
    'w-emotion-1': FACE.sad,
    'w-emotion-2': FACE.angry,
    'w-emotion-3': FACE.scared,
    'w-emotion-4': FACE.surprise,
    'w-emotion-5': FACE.shy,
    'w-emotion-6': FACE.excited,
    'w-emotion-7': FACE.nervous,
    'w-emotion-8': FACE.bored,
    'w-emotion-9': FACE.tired,
    'w-emotion-10': FACE.proud,
    'w-emotion-11': FACE.grievance,
    'w-emotion-12': [].concat(
      [bgRect(C.violet, 0), [C.green, 'M0 820L1000 820L1000 1000L0 1000Z', {}]],
      [
        [C.paper, 'E760 220 90 90', {}],
        [C.violet, 'E800 195 80 80', { s: 'none' }],
      ],
      [spark(180, 170, 30), spark(470, 110, 24), spark(560, 330, 24)],
      K.T(face({ eyes: 'dot', brows: 'sad', mouth: 'frown' }), {
        dx: 0,
        dy: 0,
        s: 0.62,
        cx: 500,
        cy: 1000,
      }),
    ),
    'w-emotion-13': face({
      eyes: 'closed',
      mouth: 'smile',
      blush: 1,
      over: [
        heart(200, 250, 50),
        heart(800, 220, 60),
        heart(840, 480, 34, C.pink),
        heart(160, 500, 30, C.pink),
      ],
    }),
    'w-emotion-14': face({
      eyes: 'happy',
      mouth: 'smile',
      blush: 1,
      over: [
        drop(380, 450, 30),
        drop(620, 450, 30),
        heart(500, 790, 50),
      ].concat(
        arm([
          [320, 800],
          [400, 720],
          [470, 700],
        ]),
        arm(
          mirrorPts([
            [320, 800],
            [400, 720],
            [470, 700],
          ]),
        ),
      ),
    }),
    'w-emotion-15': FACE.proud.slice(0, 0).concat(
      face({
        eyes: 'closed',
        brows: 'none',
        mouth: 'smile',
        shirt: C.red,
        over: [
          [C.yellow, 'R420 740 160 100 14', {}],
          star5(500, 790, 38),
          spark(190, 230, 40),
          spark(820, 200, 46),
        ],
      }),
    ),
    'w-emotion-16': face({
      eyes: 'dot',
      brows: 'sad',
      mouth: 'wavy',
      over: [].concat(
        arm([
          [730, 800],
          [830, 640],
          [660, 470],
        ]),
        [cloud(200, 150, 0.8, C.violet)],
      ),
    }),
    'w-emotion-17': face({
      eyes: 'side',
      brows: 'sad',
      mouth: 'wavy',
      blush: 1,
      over: [
        drop(720, 250, 28),
        line('M800 400L850 420M800 460L860 480', C.ink, 7),
      ],
    }),
    'w-emotion-18': [].concat(
      face({
        eyes: 'wide',
        brows: 'up',
        mouth: 'big',
        blush: 1,
        over: [
          [C.red, 'R590 770 280 190 16', {}],
          [C.yellow, 'R570 720 320 70 16', {}],
          [C.yellow, 'R700 720 60 240', { s: C.ink }],
          spark(180, 220, 44),
          spark(840, 300, 36),
          [C.pink, 'E150 420 18 18', {}],
          [C.sky, 'E230 120 18 18', {}],
          [C.mint, 'E860 140 18 18', {}],
        ],
      }),
    ),
    'w-emotion-19': face({
      eyes: 'dot',
      brows: 'angry',
      mouth: 'smirk',
      shirt: C.red,
      under: [
        [
          C.red,
          'M120 960C80 700 200 520 320 560L680 560C800 520 920 700 880 960Z',
          {},
        ],
      ],
      over: arm(
        [
          [730, 790],
          [850, 640],
          [850, 450],
        ],
        C.red,
      ),
    }),
    'w-emotion-20': face({
      eyes: 'heart',
      brows: 'none',
      mouth: 'smile',
      blush: 1,
      over: [
        heart(210, 220, 50),
        heart(820, 180, 36),
        heart(850, 400, 28, C.pink),
      ],
    }),
    'w-emotion-21': face({
      eyes: 'x',
      brows: 'sad',
      mouth: 'grit',
      face: C.pink,
      over: [
        line('M170 250L110 210'),
        line('M830 250L890 210'),
        drop(740, 280, 28),
      ],
    }),
    'w-emotion-22': [].concat(
      [[C.sky, 'R100 700 800 260 40', { b: 1 }]],
      face({
        eyes: 'closed',
        mouth: 'smile',
        blush: 1,
        shirt: C.sky,
        over: [
          [C.paper, 'E200 640 60 60', {}],
          [C.paper, 'E300 590 50 50', {}],
          [C.paper, 'E790 620 70 70', {}],
          [C.paper, 'E880 560 40 40', {}],
          [C.sky, 'R100 770 800 200 40', {}],
          line('M180 830Q250 800 320 830T460 830T600 830T740 830', C.paper, 7),
        ],
      }),
    ),
    'w-emotion-23': face({
      eyes: 'down',
      brows: 'sad',
      mouth: 'frown',
      over: [
        cloud(500, 90, 1.0, C.violet),
        line('M380 190L370 250M500 195L490 255M620 190L610 250', C.sky, 16),
      ],
    }),
    'w-emotion-24': face({
      eyes: 'widesmall',
      brows: 'sad',
      mouth: 'wavy',
      over: [].concat(
        arm([
          [260, 790],
          [180, 600],
          [330, 340],
        ]),
        arm(
          mirrorPts([
            [260, 790],
            [180, 600],
            [330, 340],
          ]),
        ),
        [
          drop(700, 250, 28),
          line('M170 150Q230 100 290 150T400 130', C.ink, 7),
          line('M600 120Q670 70 720 120T850 100', C.ink, 7),
        ],
      ),
    }),
    'w-emotion-25': face({
      eyes: 'side',
      brows: 'angry',
      mouth: 'frown',
      face: C.mint,
      over: [
        heart(830, 520, 50, C.pink),
        [C.pink, 'E830 700 40 40', {}],
        line('M830 740L830 860', C.ink, 7),
      ],
    }),
    'w-emotion-26': face({
      eyes: 'up',
      brows: 'up',
      mouth: 'smile',
      blush: 1,
      over: [].concat(
        arm([
          [330, 800],
          [400, 720],
          [470, 690],
        ]),
        arm(
          mirrorPts([
            [330, 800],
            [400, 720],
            [470, 690],
          ]),
        ),
        [spark(180, 170, 44), spark(830, 150, 40), spark(500, 80, 28)],
      ),
    }),
    'w-emotion-27': face({
      eyes: 'closed',
      mouth: 'smile',
      blush: 1,
      over: [
        [C.red, 'R330 690 340 70 30', {}],
        [C.red, 'R330 720 90 190 24', {}],
        [C.orange, 'R560 780 190 160 24', {}],
        K.tube(
          [
            [750, 830],
            [800, 830],
            [800, 880],
          ],
          20,
          C.orange,
        ).slice(0, 0),
        line('M600 740Q570 700 610 660T600 600', C.ink, 7),
        line('M680 740Q650 700 690 660T680 600', C.ink, 7),
        hand(580, 850),
        hand(730, 850),
      ],
    }),
    'w-emotion-28': face({
      eyes: 'side',
      brows: 'one',
      mouth: 'o',
      over: [
        [C.sky, 'E800 520 80 80', { w: 16 }],
        K.tube(
          [
            [860, 580],
            [930, 680],
          ],
          36,
          C.brown,
        ).slice(0, 0),
        line('M860 580L930 680', C.brown, 34),
        line(
          'M170 150Q170 80 240 80Q310 80 310 140Q310 180 250 200L250 240',
          C.ink,
          16,
        ),
        dot(250, 290, 12),
      ],
    }),
    'w-emotion-29': face({
      eyes: 'shades',
      brows: 'none',
      mouth: 'smirk',
      over: [].concat(
        arm([
          [730, 790],
          [860, 700],
          [850, 520],
        ]),
        [
          [C.yellow, 'R815 380 70 40 20', {}],
          spark(180, 230, 40),
          spark(820, 200, 32),
        ],
      ),
    }),
    'w-emotion-30': face({
      eyes: 'happy',
      mouth: 'smile',
      blush: 1,
      over: [
        [C.yellow, 'R430 700 140 170 50', {}],
        line('M500 710L500 860', C.ink, 7),
        heart(830, 250, 44),
        heart(180, 280, 32, C.pink),
      ],
    }),
    'w-emotion-31': face({
      eyes: 'down',
      brows: 'sad',
      mouth: 'frown',
      face: C.sky,
      over: [
        cloud(500, 90, 1.0, C.blue),
        line('M380 190L370 250M500 195L490 255M620 190L610 250', C.sky, 16),
      ],
    }),
    'w-emotion-32': [].concat(
      [
        bgRect(C.sky, 0),
        [C.yellow, 'E200 180 80 80', {}],
        [C.mint, 'R0 880 1000 120', {}],
      ],
      face({
        eyes: 'closed',
        mouth: 'smile',
        blush: 0,
        shirt: C.orange,
        over: [].concat(
          arm(
            [
              [250, 800],
              [160, 640],
              [290, 470],
            ],
            C.orange,
          ),
          arm(
            mirrorPts([
              [250, 800],
              [160, 640],
              [290, 470],
            ]),
            C.orange,
          ),
        ),
      }),
    ),
    'w-emotion-33': face({
      eyes: 'dot',
      brows: 'sad',
      mouth: 'wavy',
      over: [].concat(
        arm([
          [300, 810],
          [230, 560],
          [400, 250],
        ]),
        [drop(700, 260, 28)],
      ),
    }),
    'w-emotion-34': face({
      eyes: 'happy',
      mouth: 'smile',
      blush: 1,
      over: [
        [
          C.paper,
          'M300 790L700 790C690 900 600 930 500 930C400 930 310 900 300 790Z',
          {},
        ],
        line('M300 790L700 790', C.ink, 16),
        K.tube(
          [
            [780, 700],
            [680, 820],
          ],
          16,
          C.brown,
        ).slice(0, 0),
        line('M760 640L690 800', C.brown, 16),
        line('M820 650L730 810', C.brown, 16),
        hand(300, 760),
        hand(700, 760),
      ],
    }),
    'w-emotion-35': face({
      eyes: 'closed',
      mouth: 'smile',
      blush: 1,
      over: [
        line('M780 560L780 800', C.brown, 16),
        heart(780, 500, 70, C.pink),
        heart(180, 220, 40),
        heart(830, 250, 32, C.pink),
        hand(780, 800),
      ],
    }),
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
