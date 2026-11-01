(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;
  var S = C.yellow;

  function ln(d, col, w) {
    return [['none', d, { s: col || C.ink, w: w || 7 }]];
  }
  function bg(col) {
    return [[col, 'R0 0 1000 1000', { s: 'none' }]];
  }
  function floor(col, y) {
    return [
      [col, 'R0 ' + (y || 870) + ' 1000 ' + (1000 - (y || 870)), { s: 'none' }],
    ];
  }
  function T(l, o) {
    return K.T(l, o);
  }

  // generic front-facing person; o: shirt, pants, shoe, hair, skirt, armL, armR (points after shoulder), legL, legR
  function man(o) {
    o = o || {};
    var skin = o.skin || S,
      out = [];
    var legL = o.legL || [
      [455, 650],
      [455, 850],
    ];
    var legR = o.legR || [
      [545, 650],
      [545, 850],
    ];
    var armL = o.armL || [[375, 650]];
    var armR = o.armR || [[625, 650]];
    var shoe = o.shoe || C.ink;
    out = out.concat(
      K.tube(legL, 62, o.pants || C.blue),
      K.tube(legR, 62, o.pants || C.blue),
    );
    var fl = legL[legL.length - 1],
      fr = legR[legR.length - 1];
    out.push(
      [shoe, K.E(fl[0] - 8, fl[1] + 10, 50, 22), {}],
      [shoe, K.E(fr[0] + 8, fr[1] + 10, 50, 22), {}],
    );
    if (o.skirt) out.push([o.skirt, 'M400 620L320 850L680 850L600 620Z', {}]);
    out.push([o.shirt || C.red, 'R395 440 210 230 36', {}]);
    out = out.concat(
      K.tube([[408, 485]].concat(armL), 46, o.sleeve || o.shirt || C.red),
    );
    out = out.concat(
      K.tube([[592, 485]].concat(armR), 46, o.sleeve || o.shirt || C.red),
    );
    var hl = armL[armL.length - 1],
      hr = armR[armR.length - 1];
    out.push(
      [skin, K.E(hl[0], hl[1], 27, 27), {}],
      [skin, K.E(hr[0], hr[1], 27, 27), {}],
    );
    out.push([skin, 'R468 350 64 50 12', {}]);
    out.push([skin, K.E(500, 295, 72, 78), {}]);
    if (o.hair !== null)
      out.push([
        o.hair || C.brown,
        'M427 292C415 200 585 200 573 292C560 250 520 236 500 240C470 240 440 250 427 292Z',
        {},
      ]);
    out.push(
      [C.ink, K.E(470, 300, 9, 12), { s: 'none' }],
      [C.ink, K.E(530, 300, 9, 12), { s: 'none' }],
    );
    out = out.concat(ln('M472 335Q500 358 528 335'));
    return out;
  }
  function cap(col, badge) {
    return [
      [col, 'M425 262C425 190 575 190 575 262Z', {}],
      [col, 'R410 255 180 22 8', {}],
    ].concat(badge ? [[badge, K.E(500, 232, 14, 14), { s: 'none' }]] : []);
  }
  function hardHat(col) {
    return [
      [col, 'M420 262C420 180 580 180 580 262Z', {}],
      [col, 'R400 255 200 24 10', {}],
      [col, 'R480 175 40 40 6', {}],
    ];
  }
  function tie(col) {
    return [[col, 'M485 440L515 440L525 560L500 590L475 560Z', {}]];
  }
  function collar(col) {
    return [[col || C.paper, 'M460 440L500 495L540 440Z', {}]];
  }

  Object.assign(R, {
    'w-job-9': [].concat(
      bg(C.mint),
      floor(C.sky, 880),
      man({
        shirt: C.paper,
        pants: C.paper,
        armR: [
          [665, 560],
          [690, 620],
        ],
      }),
      ln('M450 440C440 540 560 540 550 440'),
      [[C.violet, K.E(500, 540, 16, 16), {}]],
      [
        [C.paper, 'R440 190 120 60 10', {}],
        [C.red, 'R492 200 16 40', { s: 'none' }],
        [C.red, 'R480 212 40 16', { s: 'none' }],
      ],
      [
        [C.brown, 'R650 540 110 150 8', {}],
        [C.paper, 'R664 565 82 110', {}],
      ],
      ln('M676 590H734M676 615H734M676 640H714'),
    ),
    'w-job-10': [].concat(
      bg(C.sky),
      floor(C.mint, 880),
      T(
        [].concat(
          man({
            shirt: C.green,
            pants: C.blue,
            armR: [
              [650, 610],
              [700, 700],
            ],
          }),
          ln('M450 440C440 540 560 540 550 440'),
          [[C.violet, K.E(500, 540, 16, 16), {}]],
        ),
        { dx: -150, cx: 500, s: 0.9, cy: 870 },
      ),
      [
        [C.orange, K.E(740, 800, 110, 60), {}],
        [C.orange, 'R660 640 90 120 40', {}],
        [C.orange, K.E(700, 640, 62, 55), {}],
        [C.brown, 'M650 600C610 600 610 680 650 690Z', {}],
        [C.brown, 'M740 590C780 600 770 660 730 650Z', {}],
        [C.ink, K.E(690, 630, 7, 9), { s: 'none' }],
        [C.ink, K.E(725, 640, 12, 9), {}],
      ],
      [
        [C.orange, 'R650 840 40 40 14', {}],
        [C.orange, 'R760 840 40 40 14', {}],
      ],
      [],
    ),
    'w-job-11': [].concat(
      bg(C.yellow),
      [
        [C.brown, 'R120 760 760 100 10', {}],
        [C.brown, 'R300 860 400 40', {}],
      ],
      man({
        shirt: C.ink,
        pants: C.ink,
        skirt: C.ink,
        hair: C.paper,
        armL: [[345, 600]],
        armR: [
          [660, 540],
          [690, 480],
        ],
      }),
      collar(C.paper),
      [[C.paper, 'R467 440 66 14', { s: 'none' }]],
      T(
        [
          [C.brown, 'R-20 -70 40 140 8', {}],
          [C.brown, 'R-70 -105 140 50 12', {}],
        ],
        { dx: 760, dy: 400, rot: 30 },
      ),
      [[C.brown, K.E(840, 770, 70, 25), {}]],
    ),
    'w-job-12': [].concat(
      bg(C.sky),
      [
        [C.blue, 'R160 180 680 460 20', {}],
        [C.sky, 'R200 220 600 380 10', { s: C.paper }],
      ],
      T(
        man({
          shirt: C.blue,
          pants: C.blue,
          armL: [[400, 600]],
          armR: [[600, 600]],
        }),
        { dy: 0 },
      ),
      tie(C.red),
      collar(),
      [
        [C.brown, 'R120 640 760 260 14', {}],
        [C.orange, 'R120 640 760 40', {}],
      ],
      [
        [C.ink, 'R250 600 22 50 6', {}],
        [C.ink, K.E(261, 590, 20, 20), {}],
        [C.ink, 'R255 650 12 30', { s: 'none' }],
      ],
      [
        [C.paper, 'R620 600 150 30', {}],
        [C.red, K.E(790, 590, 20, 20), {}],
      ],
    ),
    'w-job-13': [].concat(
      bg(C.violet),
      [
        [C.red, 'M0 0H260C200 200 200 600 120 1000H0Z', {}],
        [C.red, 'M1000 0H740C800 200 800 600 880 1000H1000Z', {}],
      ],
      floor(C.brown, 880),
      man({
        shirt: C.orange,
        pants: C.ink,
        armL: [
          [330, 560],
          [300, 470],
        ],
        armR: [
          [670, 600],
          [700, 660],
        ],
      }),
      [
        [
          C.paper,
          'M255 400C250 330 340 330 345 400C345 450 320 470 300 470C275 470 255 450 255 400Z',
          {},
        ],
      ],
      [
        [C.ink, K.E(285, 395, 10, 8), { s: 'none' }],
        [C.ink, K.E(315, 395, 10, 8), { s: 'none' }],
      ],
      ln('M285 430Q300 445 315 430'),
      [[C.yellow, 'M300 20L340 200H260Z', { s: 'none' }]],
    ),
    'w-job-14': [].concat(
      bg(C.pink),
      floor(C.paper, 880),
      man({
        shirt: C.violet,
        pants: C.pink,
        shoe: C.pink,
        hair: C.brown,
        armL: [
          [330, 360],
          [350, 260],
        ],
        armR: [
          [670, 440],
          [740, 440],
        ],
        legL: [
          [455, 650],
          [455, 850],
        ],
        legR: [
          [545, 650],
          [640, 700],
          [700, 640],
        ],
      }),
      [
        [C.brown, K.E(500, 215, 40, 40), {}],
        [C.violet, K.E(500, 665, 120, 36), {}],
      ],
    ),
    'w-job-15': [].concat(
      bg(C.mint),
      floor(C.green, 880),
      man({
        shirt: C.red,
        pants: C.ink,
        armL: [[350, 600]],
        armR: [
          [660, 560],
          [650, 650],
        ],
      }),
      cap(C.red),
      [[C.paper, 'R400 505 40 30 4', { s: 'none' }]],
      ln('M450 420C450 480 500 520 500 520', C.ink, 7),
      [[C.yellow, 'R485 515 50 36 12', {}]],
      [[C.orange, K.E(650, 690, 70, 70), {}]],
      ln(
        'M580 690H720M650 620V760M600 640Q650 690 600 740M700 640Q650 690 700 740',
      ),
    ),
    'w-job-16': [].concat(
      bg(C.sky),
      [[C.blue, 'R0 760 1000 240', { s: 'none' }]],
      ln('M0 760Q125 730 250 760T500 760T750 760T1000 760', C.paper, 16),
      man({
        shirt: C.yellow,
        pants: C.green,
        shoe: C.brown,
        armL: [[360, 640]],
        armR: [
          [650, 520],
          [700, 450],
        ],
      }),
      [
        [C.orange, 'M380 262C380 190 620 190 620 262Z', {}],
        [C.orange, 'R340 255 320 24 12', {}],
      ],
      ln('M700 450L880 150', C.brown, 16),
      ln('M880 150L870 560', C.ink, 5),
      [
        [
          C.orange,
          'M790 640C830 600 910 600 950 640C910 680 830 680 790 640Z',
          {},
        ],
        [C.orange, 'M950 640L990 600V680Z', {}],
        [C.ink, K.E(820, 632, 7, 7), { s: 'none' }],
      ],
    ),
    'w-job-17': [].concat(
      bg(C.yellow),
      [
        [C.brown, 'R50 150 900 28', {}],
        [C.brown, 'R50 400 900 28', {}],
        [C.red, 'R90 70 80 80', {}],
        [C.sky, 'R200 90 80 60', {}],
        [C.mint, 'R320 70 80 80', {}],
        [C.violet, 'R90 320 90 80', {}],
        [C.orange, 'R720 320 90 80', {}],
        [C.pink, 'R840 330 80 70', {}],
      ],
      man({
        shirt: C.paper,
        pants: C.ink,
        armL: [[350, 620]],
        armR: [[650, 620]],
      }),
      [
        [C.mint, 'R410 520 180 160 20', {}],
        [C.mint, 'R440 440 28 90', { s: 'none' }],
        [C.mint, 'R532 440 28 90', { s: 'none' }],
      ],
      [[C.paper, 'R440 570 70 40 6', {}]],
      ln('M450 590H500'),
    ),
    'w-job-18': [].concat(
      bg(C.sky),
      K.cloud(220, 230, 1.2),
      floor(C.violet, 900),
      [
        [C.paper, 'M740 270L690 170L760 170L830 270Z', {}],
        [C.paper, K.E(790, 285, 150, 36), {}],
        [C.paper, 'M900 270L930 200L965 200L950 275Z', {}],
        [C.blue, K.E(740, 280, 8, 8), { s: 'none' }],
        [C.blue, K.E(780, 280, 8, 8), { s: 'none' }],
        [C.blue, K.E(820, 280, 8, 8), { s: 'none' }],
      ],
      man({
        shirt: C.blue,
        pants: C.blue,
        armL: [[375, 650]],
        armR: [[625, 650]],
      }),
      collar(),
      tie(C.red),
      cap(C.blue, C.yellow),
      [
        [C.yellow, 'R405 540 36 8', { s: 'none' }],
        [C.yellow, 'R405 560 36 8', { s: 'none' }],
        [C.yellow, 'R559 540 36 8', { s: 'none' }],
      ],
    ),
    'w-job-19': [].concat(
      bg(C.sky),
      [[C.blue, 'R0 700 1000 300', { s: 'none' }]],
      ln('M0 720Q125 690 250 720T500 720T750 720T1000 720', C.paper, 16),
      man({
        shirt: C.blue,
        pants: C.paper,
        armL: [[330, 620]],
        armR: [[670, 620]],
      }),
      [[C.paper, 'R500 410 4 4', { s: 'none' }]],
      [
        [
          C.paper,
          'M440 330C440 400 560 400 560 330C540 360 460 360 440 330Z',
          { s: 'none' },
        ],
      ],
      cap(C.paper, C.blue),
      [
        [C.brown, K.E(500, 650, 140, 140), {}],
        [C.sky, K.E(500, 650, 60, 60), {}],
        [C.brown, 'R490 510 20 280', {}],
        [C.brown, 'R360 640 280 20', {}],
      ],
    ),
    'w-job-20': [].concat(
      bg(C.ink),
      [
        [C.paper, K.E(150, 150, 5, 5), {}],
        [C.paper, K.E(850, 100, 5, 5), {}],
        [C.paper, K.E(900, 500, 5, 5), {}],
        [C.paper, K.E(100, 600, 5, 5), {}],
        [C.orange, K.E(170, 330, 70, 70), {}],
        [C.violet, 'M80 330H260', { s: C.violet, w: 7 }],
      ],
      floor(C.violet, 880),
      [[C.violet, 'R400 440 200 260 30', {}]],
      man({
        shirt: C.paper,
        pants: C.paper,
        shoe: C.violet,
        hair: null,
        skin: C.paper,
        armL: [[340, 600]],
        armR: [
          [660, 520],
          [700, 450],
        ],
      }),
      [
        [C.paper, K.E(500, 290, 120, 125), {}],
        [C.sky, K.E(500, 295, 85, 80), {}],
      ],
      [[C.paper, K.E(470, 270, 20, 12, -30), { s: 'none' }]],
      [
        [C.red, 'R440 520 40 40 8', {}],
        [C.blue, 'R520 520 40 40 8', {}],
      ],
      [
        [C.red, 'R800 380 120 70', {}],
        [C.brown, 'R790 350 14 300', {}],
      ],
    ),
    'w-job-21': [].concat(
      bg(C.sky),
      K.cloud(800, 160, 1),
      floor(C.mint, 900),
      [
        [C.paper, K.E(780, 300, 120, 30), {}],
        [C.paper, 'R690 240 20 120 6', {}],
        [C.paper, 'R860 240 20 120 6', {}],
        [C.paper, 'R770 220 20 160 6', {}],
        [C.red, K.E(670, 300, 14, 14), {}],
        ['none', 'M670 235V365', { s: C.ink, w: 16 }],
      ],
      man({
        shirt: C.brown,
        pants: C.brown,
        hair: null,
        armL: [[330, 600]],
        armR: [[670, 600]],
      }),
      [[C.brown, 'R440 430 120 20 6', { s: 'none' }]],
      [
        [
          C.brown,
          'M425 300C415 190 585 190 575 300C560 250 440 250 425 300Z',
          {},
        ],
        [C.violet, K.E(470, 290, 32, 28), {}],
        [C.violet, K.E(530, 290, 32, 28), {}],
        [C.ink, 'R490 280 20 12', { s: 'none' }],
      ],
      [
        [C.red, 'R440 425 120 36 16', {}],
        [C.red, 'M540 450L600 520L560 540L520 470Z', {}],
      ],
    ),
    'w-job-22': [].concat(
      bg(C.sky),
      floor(C.violet, 880),
      man({
        shirt: C.orange,
        pants: C.blue,
        armL: [[350, 600]],
        armR: [[650, 640]],
      }),
      [
        [C.yellow, 'R425 450 40 220', { s: 'none' }],
        [C.yellow, 'R535 450 40 220', { s: 'none' }],
      ],
      hardHat(C.yellow),
      [
        [C.paper, 'R640 600 200 70 12', {}],
        [C.paper, K.E(640, 635, 20, 36), {}],
      ],
      ln('M670 620H800M670 650H800'),
      [
        [C.violet, K.E(220, 330, 80, 80), {}],
        [C.violet, 'R200 220 40 40', { s: C.ink }],
        [C.sky, K.E(220, 330, 30, 30), {}],
      ],
    ),
    'w-job-23': [].concat(
      bg(C.yellow),
      floor(C.orange, 880),
      man({
        shirt: C.ink,
        pants: C.ink,
        armL: [[360, 640]],
        armR: [
          [630, 600],
          [660, 650],
        ],
      }),
      collar(),
      tie(C.red),
      [
        [C.brown, 'R620 660 160 120 12', {}],
        [C.brown, 'R675 625 50 40 8', { s: C.ink }],
        [C.yellow, 'R690 690 20 20', { s: 'none' }],
      ],
      [
        [C.ink, 'R210 280 14 540', {}],
        [C.ink, 'R140 810 150 40 8', {}],
      ],
      ln('M120 330H310', C.ink, 16),
      ln(
        'M140 330L100 500M140 330L180 500M290 330L250 480M290 330L330 480',
        C.ink,
        7,
      ),
      [
        [C.violet, 'M80 500C90 560 190 560 200 500Z', {}],
        [C.violet, 'M230 480C240 540 340 540 350 480Z', {}],
      ],
    ),
    'w-job-24': [].concat(
      bg(C.sky),
      floor(C.mint, 880),
      man({
        shirt: C.mint,
        pants: C.brown,
        armL: [
          [330, 560],
          [350, 650],
        ],
        armR: [
          [650, 480],
          [740, 400],
        ],
      }),
      [[C.brown, 'R400 262 200 18 6', { s: 'none' }]],
      [
        [C.brown, 'M420 262C420 200 580 200 580 262Z', {}],
        [C.brown, 'R405 255 190 20 8', {}],
      ],
      [
        [C.ink, 'R725 280 30 60 10', {}],
        [C.ink, K.E(740, 270, 40, 40), {}],
        [C.violet, K.E(740, 270, 22, 22), { s: 'none' }],
      ],
      [[C.paper, 'R300 560 100 120 6', {}]],
      ln('M318 590H382M318 615H382M318 640H362'),
    ),
    'w-job-25': [].concat(
      bg(C.yellow),
      man({
        shirt: C.violet,
        pants: C.blue,
        armL: [
          [380, 700],
          [450, 740],
        ],
        armR: [
          [620, 700],
          [570, 740],
        ],
      }),
      [[C.ink, 'R425 290 150 6', { s: 'none' }]],
      ln('M440 295H490M510 295H560'),
      [
        [C.brown, 'R120 700 760 200 14', {}],
        [C.orange, 'R120 700 760 40', {}],
      ],
      [[C.paper, 'M400 700L600 700L620 790L380 790Z', {}]],
      ln('M420 725H580M410 750H590'),
      [
        [C.red, 'R700 640 140 60 6', {}],
        [C.sky, 'R710 590 120 50 6', {}],
      ],
    ),
    'w-job-26': [].concat(
      bg(C.violet),
      floor(C.brown, 880),
      man({
        shirt: C.orange,
        pants: C.ink,
        armL: [
          [340, 560],
          [350, 640],
        ],
        armR: [
          [660, 520],
          [700, 450],
        ],
      }),
      [
        [C.red, 'M410 255C410 195 590 190 590 255Z', {}],
        [C.red, K.E(520, 200, 40, 20, -10), {}],
      ],
      [
        [C.orange, 'M690 400L820 320L830 400L700 480Z', {}],
        [C.yellow, 'M820 320L880 280L895 420L830 400Z', {}],
      ],
      [
        [C.ink, 'R160 640 200 200 8', {}],
        [C.paper, 'R160 640 200 50 8', {}],
        [C.paper, 'R185 640 22 50', { s: 'none' }],
        [C.paper, 'R240 640 22 50', { s: 'none' }],
        [C.paper, 'R295 640 22 50', { s: 'none' }],
      ],
      [[C.ink, 'R160 600 200 40 8', {}]],
    ),
    'w-job-27': [].concat(
      bg(C.red),
      floor(C.brown, 880),
      [
        [C.ink, 'R160 650 14 230', {}],
        [C.paper, 'R100 560 140 100 8', {}],
      ],
      ln('M120 590H220M120 615H220M120 640H200'),
      man({
        shirt: C.ink,
        pants: C.ink,
        armL: [
          [330, 420],
          [300, 340],
        ],
        armR: [
          [670, 440],
          [720, 360],
        ],
      }),
      collar(),
      [[C.red, 'M475 470L525 470L500 490Z', {}]],
      [
        [
          C.paper,
          'M420 292C415 205 585 205 575 292C560 250 440 250 420 292Z',
          {},
        ],
      ],
      ln('M720 360L860 220', C.paper, 7),
    ),
    'w-job-28': [].concat(
      bg(C.mint),
      floor(C.green, 880),
      man({
        shirt: C.paper,
        pants: C.ink,
        armL: [[350, 600]],
        armR: [
          [660, 380],
          [680, 300],
        ],
      }),
      [
        [C.ink, 'R395 470 210 30', { s: 'none' }],
        [C.ink, 'R395 540 210 30', { s: 'none' }],
        [C.ink, 'R395 610 210 30', { s: 'none' }],
      ],
      [[C.red, 'R650 190 70 100 8', {}]],
      [[C.yellow, 'R450 505 100 40 18', {}]],
    ),
    'w-job-29': [].concat(
      bg(C.sky),
      K.pine(150, 880, 1.1),
      K.pine(860, 880, 1.2),
      floor(C.green, 880),
      man({
        shirt: C.orange,
        pants: C.brown,
        shoe: C.brown,
        armL: [
          [330, 560],
          [280, 520],
        ],
        armR: [
          [620, 560],
          [640, 520],
        ],
      }),
      [
        [C.green, 'M410 262C410 190 590 190 590 262Z', {}],
        [C.green, 'R390 255 220 22 10', {}],
        [C.red, 'M570 215L650 160L600 240Z', {}],
      ],
      ln('M240 340C150 520 150 640 240 780', C.brown, 16),
      ln('M240 340L240 780', C.ink, 5),
      ln('M180 560L640 560', C.brown, 7),
      [[C.paper, 'M640 560L590 530V590Z', {}]],
    ),
    'w-job-30': [].concat(
      bg(C.yellow),
      floor(C.orange, 880),
      [
        [C.orange, 'R180 800 640 60 8', {}],
        [C.brown, 'R240 860 40 20', { s: 'none' }],
      ],
      man({
        shirt: C.paper,
        pants: C.brown,
        armL: [[340, 580]],
        armR: [
          [660, 500],
          [720, 440],
        ],
      }),
      [[C.brown, 'R405 450 190 200 20', {}]],
      [[C.brown, 'R415 440 170 24', { s: 'none' }]],
      [[C.yellow, 'R455 560 90 50 10', { s: C.ink }]],
      T(
        [
          [C.brown, 'R-15 -20 30 150 6', {}],
          [C.violet, 'R-60 -70 120 55 8', {}],
        ],
        { dx: 760, dy: 410, rot: 40 },
      ),
      [[C.violet, 'R400 770 14 40', { s: 'none' }]],
      [[C.violet, 'R260 780 80 14', {}]],
    ),
    'w-job-31': [].concat(
      bg(C.sky),
      floor(C.mint, 880),
      [
        [C.violet, 'R640 700 260 70 10', {}],
        [C.violet, 'R810 520 90 250 10', {}],
        [C.violet, 'R620 690 40 90 6', {}],
        [C.sky, K.E(760, 810, 18, 28), {}],
      ],
      man({
        shirt: C.orange,
        pants: C.blue,
        armL: [
          [330, 580],
          [270, 660],
        ],
        armR: [
          [660, 560],
          [700, 640],
        ],
      }),
      [[C.blue, 'R410 450 180 200 20', {}]],
      [[C.orange, 'R420 440 40 24', { s: 'none' }]],
      cap(C.yellow),
      [
        [C.violet, 'R130 540 40 220 14', {}],
        [
          C.violet,
          'M110 540C100 460 200 460 190 540L170 540C170 500 130 500 130 540Z',
          {},
        ],
      ],
    ),
    'w-job-32': [].concat(
      bg(C.sky),
      floor(C.violet, 880),
      [
        [C.paper, 'R760 300 110 400 55', { b: 1 }],
        [
          C.red,
          'M740 340L890 300L890 360L740 400ZM740 460L890 420L890 480L740 520ZM740 580L890 540L890 600L740 660Z',
          { i: 1, s: 'none' },
        ],
        [
          C.blue,
          'M740 400L890 360L890 420L740 460ZM740 520L890 480L890 540L740 580Z',
          { i: 1, s: 'none' },
        ],
        ['none', 'R760 300 110 400 55', { s: C.ink, w: 7 }],
      ],
      [[C.violet, 'R790 700 50 180', {}]],
      man({
        shirt: C.paper,
        pants: C.ink,
        armL: [
          [330, 560],
          [280, 520],
        ],
        armR: [
          [660, 560],
          [640, 520],
        ],
      }),
      [[C.ink, 'M410 255C410 195 590 190 590 255Z', { s: 'none' }]],
      ln('M280 520L330 450', C.violet, 16),
      [[C.ink, 'R270 500 20 10', { s: 'none' }]],
      ln('M600 470L660 600M660 470L600 600', C.violet, 7),
      [
        [C.violet, K.E(595, 610, 18, 18), {}],
        [C.violet, K.E(665, 610, 18, 18), {}],
      ],
    ),
    'w-job-33': [].concat(
      bg(C.sky),
      floor(C.violet, 900),
      [[C.sky, 'R100 140 800 400 20', { s: C.ink }]],
      man({
        shirt: C.mint,
        pants: C.blue,
        armL: [[390, 620]],
        armR: [[610, 620]],
      }),
      cap(C.blue),
      [[C.red, 'R40 740 920 160 20', {}]],
      [
        [C.ink, K.E(500, 650, 135, 135), {}],
        [C.sky, K.E(500, 650, 85, 85), {}],
      ],
      ln('M370 650H630M500 650V780', C.ink, 34),
      [[C.violet, K.E(500, 650, 36, 36), {}]],
    ),
    'w-job-34': [].concat(
      bg(C.sky),
      [[C.blue, 'R0 760 1000 240', { s: 'none' }]],
      ln('M0 760Q125 730 250 760T500 760T750 760T1000 760', C.paper, 16),
      K.sun(870, 130, 70),
      man({
        shirt: S,
        pants: C.red,
        shoe: C.sky,
        armL: [
          [340, 580],
          [300, 640],
        ],
        armR: [
          [660, 580],
          [700, 640],
        ],
        legL: [
          [455, 650],
          [455, 770],
        ],
        legR: [
          [545, 650],
          [545, 770],
        ],
      }),
      [
        [C.red, K.E(500, 570, 130, 130), {}],
        [C.sky, K.E(500, 570, 70, 70), {}],
      ],
      ln(
        'M410 480L450 520M590 480L550 520M410 660L450 620M590 660L550 620',
        C.paper,
        16,
      ),
      [[C.red, K.E(500, 570, 70, 70), { s: C.ink, w: 7 }]],
      [[C.sky, K.E(500, 570, 70, 70), { s: C.ink }]],
      [
        [C.red, 'M425 262C425 195 575 195 575 262Z', {}],
        [C.red, 'R405 255 190 20 8', {}],
      ],
      [[C.yellow, 'R485 410 30 30 8', {}]],
    ),
    'w-job-35': [].concat(
      bg(C.sky),
      floor(C.mint, 880),
      K.flower(130, 880, 1.2, C.pink),
      K.flower(250, 880, 1, C.red),
      K.flower(880, 880, 1.2, C.violet),
      K.flower(770, 880, 1, C.yellow),
      man({
        shirt: C.mint,
        pants: C.green,
        shoe: C.brown,
        armL: [
          [330, 560],
          [350, 640],
        ],
        armR: [
          [660, 560],
          [700, 600],
        ],
      }),
      [[C.green, 'R425 440 150 230 16', {}]],
      [
        [C.yellow, 'M360 262C360 190 640 190 640 262Z', {}],
        [C.yellow, 'R310 255 380 24 12', {}],
      ],
      [
        [C.blue, 'R690 570 130 110 20', {}],
        [C.blue, 'M820 600L910 540L930 570L830 640Z', {}],
        [C.ink, 'R660 570 30 10', { s: 'none' }],
      ],
      ln('M690 580Q760 520 820 580', C.blue, 16),
      ln('M930 570L960 590M930 590L960 620M920 610L940 650', C.sky, 7),
    ),
    'w-job-36': [].concat(
      bg(C.mint),
      floor(C.sky, 880),
      [
        [C.sky, 'M130 700L170 880H330L370 700Z', {}],
        [C.sky, K.E(250, 700, 120, 24), {}],
      ],
      man({
        shirt: C.blue,
        pants: C.blue,
        armL: [
          [330, 580],
          [270, 640],
        ],
        armR: [
          [670, 600],
          [710, 690],
        ],
      }),
      cap(C.blue),
      [
        [C.yellow, K.E(270, 640, 27, 27), {}],
        [C.yellow, K.E(710, 690, 27, 27), {}],
      ],
      ln('M750 300L720 690', C.brown, 16),
      [[C.paper, 'M690 690L780 690L800 770L670 770Z', {}]],
      ln('M700 700L695 765M730 700V770M760 700L765 765'),
      [[C.sky, 'R120 820 260 40', { s: 'none' }]],
    ),
    'w-job-37': [].concat(
      bg(C.sky),
      floor(C.violet, 880),
      man({
        shirt: C.orange,
        pants: C.ink,
        armL: [
          [330, 560],
          [400, 600],
        ],
        armR: [
          [670, 560],
          [600, 600],
        ],
      }),
      cap(C.orange),
      [
        [C.brown, 'R340 520 320 260 8', {}],
        [C.yellow, 'R480 520 40 260', { s: 'none' }],
        [C.paper, 'R360 580 100 70 4', {}],
      ],
      ln('M375 605H445M375 625H435'),
      [
        [C.yellow, K.E(400, 520, 27, 27), {}],
        [C.yellow, K.E(600, 520, 27, 27), {}],
      ],
    ),
    'w-job-38': [].concat(
      bg(C.violet),
      floor(C.ink, 880),
      man({
        shirt: C.blue,
        pants: C.ink,
        armL: [[350, 600]],
        armR: [
          [660, 540],
          [700, 620],
        ],
      }),
      collar(C.paper),
      cap(C.ink, C.yellow),
      [
        [C.ink, 'R425 290 150 28 10', { s: C.ink }],
        [C.violet, 'R435 295 50 16 6', { s: 'none' }],
        [C.violet, 'R515 295 50 16 6', { s: 'none' }],
      ],
      [
        [
          C.yellow,
          'M430 510C430 560 470 590 480 600C490 590 530 560 530 510Z',
          {},
        ],
      ],
      [
        [C.ink, 'R690 560 30 200 14', {}],
        [C.yellow, 'R680 540 50 50', { s: C.ink }],
      ],
    ),
    'w-job-39': [].concat(
      bg(C.yellow),
      [
        [C.violet, 'R560 330 360 240 14', {}],
        [C.ink, 'R600 570 40 40', { s: 'none' }],
        [C.orange, 'R590 380 50 30', { s: 'none' }],
        [C.red, K.E(870, 400, 14, 14), { s: 'none' }],
      ],
      [[C.brown, 'R0 700 1000 300', { s: 'none' }]],
      man({
        shirt: C.paper,
        pants: C.ink,
        armL: [[350, 600]],
        armR: [
          [640, 560],
          [660, 500],
        ],
      }),
      [[C.brown, 'R405 450 190 220 24', {}]],
      [
        [C.brown, 'R445 440 14 80', { s: 'none' }],
        [C.brown, 'R541 440 14 80', { s: 'none' }],
      ],
      [
        [C.paper, 'M630 440L710 440L695 540L645 540Z', {}],
        [C.brown, 'R625 420 90 24 8', {}],
      ],
      [[C.brown, 'R610 650 140 40 4', { s: 'none' }]],
      [[C.brown, 'R0 700 1000 40', { s: C.ink }]],
    ),
    'w-job-40': [].concat(
      bg(C.green),
      [
        [C.brown, 'R60 100 880 520 14', {}],
        [C.green, 'R90 130 820 460 8', { s: C.ink }],
      ],
      ln('M140 200H500M140 270H400M140 340H460', C.paper, 7),
      floor(C.brown, 880),
      man({
        shirt: C.blue,
        pants: C.ink,
        hair: C.paper,
        armL: [[345, 600]],
        armR: [
          [660, 600],
          [700, 650],
        ],
      }),
      collar(),
      tie(C.red),
      ln('M425 300H470M530 300H575', C.ink, 7),
      [
        ['none', K.E(445, 300, 26, 22), { s: C.ink }],
        ['none', K.E(555, 300, 26, 22), { s: C.ink }],
      ],
      [
        [C.paper, 'R690 560 40 180 10', {}],
        [C.red, 'R690 625 40 18', { s: 'none' }],
      ],
    ),
    'w-job-41': [].concat(
      bg(C.sky),
      floor(C.mint, 880),
      man({
        shirt: C.yellow,
        pants: C.brown,
        armL: [
          [340, 400],
          [420, 300],
        ],
        armR: [
          [660, 400],
          [580, 300],
        ],
      }),
      [[C.green, 'R425 440 40 220', { s: 'none' }]],
      [
        [C.ink, 'R360 220 280 190 24', {}],
        [C.paper, 'R400 200 90 40 8', {}],
        [C.violet, K.E(500, 320, 85, 85), {}],
        [C.sky, K.E(500, 320, 50, 50), {}],
        [C.paper, K.E(480, 300, 12, 12), { s: 'none' }],
      ],
      [
        [
          C.yellow,
          'M690 200L740 140L720 220L790 190L710 250Z',
          { s: C.orange },
        ],
      ],
    ),
    'w-job-42': [].concat(
      bg(C.sky),
      floor(C.ink, 880),
      [[C.red, 'M300 440L700 440L860 870L140 870Z', {}]],
      man({
        shirt: C.ink,
        pants: C.ink,
        armL: [[330, 600]],
        armR: [
          [660, 520],
          [730, 440],
        ],
      }),
      collar(),
      [[C.red, 'M455 450L545 450L500 485Z', {}]],
      [
        [C.ink, 'R430 120 140 100 8', {}],
        [C.ink, 'R390 215 220 30 10', {}],
        [C.red, 'R430 195 140 22', { s: 'none' }],
      ],
      ln('M730 440L860 300', C.ink, 16),
      ln('M730 440L860 300', C.paper, 7),
      [
        [
          C.yellow,
          'M880 190L900 250L960 260L910 300L925 360L880 325L835 360L850 300L800 260L860 250Z',
          {},
        ],
      ],
    ),
    'w-job-43': [].concat(
      bg(C.mint),
      floor(C.sky, 880),
      man({
        shirt: C.paper,
        pants: C.blue,
        hair: C.violet,
        armL: [[340, 580]],
        armR: [
          [650, 520],
          [680, 440],
        ],
      }),
      [[C.sky, 'R455 440 90 230', { s: 'none' }]],
      [[C.violet, 'M410 290C410 250 590 250 590 290Z', { s: 'none' }]],
      [
        [C.sky, K.E(470, 300, 28, 24), { s: C.ink }],
        [C.sky, K.E(530, 300, 28, 24), { s: C.ink }],
      ],
      [
        [
          C.sky,
          'M665 380H715V420L750 490C760 520 640 520 650 490L665 420Z',
          { b: 1 },
        ],
        [C.mint, 'M640 455H760V520H640Z', { i: 1, s: 'none' }],
        [
          C.ink,
          'M665 380H715V420L750 490C760 520 640 520 650 490L665 420Z',
          { s: C.ink },
        ],
      ],
      [
        [C.mint, K.E(770, 380, 12, 12), {}],
        [C.mint, K.E(790, 320, 18, 18), {}],
        [C.mint, K.E(765, 270, 12, 12), {}],
      ],
    ),
    'w-job-44': [].concat(
      bg(C.sky),
      floor(C.paper, 880),
      [
        [C.paper, 'R620 460 300 24', {}],
        [C.paper, 'R780 330 120 130 6', {}],
      ],
      [
        [C.orange, 'R640 320 120 200 6', {}],
        [C.sky, 'R660 350 30 30', { s: 'none' }],
        [C.sky, 'R705 350 30 30', { s: 'none' }],
        [C.sky, 'R660 410 30 30', { s: 'none' }],
        [C.sky, 'R705 410 30 30', { s: 'none' }],
        [C.red, 'M630 320L700 250L770 320Z', {}],
      ],
      [
        [C.brown, 'R660 484 20 380', { s: 'none' }],
        [C.brown, 'R860 484 20 380', { s: 'none' }],
      ],
      man({
        shirt: C.sky,
        pants: C.ink,
        hair: C.brown,
        armL: [
          [330, 560],
          [310, 620],
        ],
        armR: [
          [600, 520],
          [630, 470],
        ],
      }),
      [[C.paper, 'R160 540 60 300', { s: C.ink }]],
      [
        ['none', K.E(445, 300, 26, 22), { s: C.ink }],
        ['none', K.E(555, 300, 26, 22), { s: C.ink }],
      ],
      ln('M471 300H529', C.ink, 7),
      [[C.yellow, 'R200 580 12 200', { s: 'none' }]],
    ),
    'w-job-45': [].concat(
      bg(C.pink),
      floor(C.violet, 880),
      man({
        shirt: C.violet,
        pants: C.ink,
        armL: [
          [350, 560],
          [330, 640],
        ],
        armR: [
          [640, 640],
          [620, 570],
        ],
        hair: C.brown,
      }),
      [
        [
          C.brown,
          'M450 640C390 640 390 780 450 800C520 830 600 780 560 690C560 640 500 640 450 640Z',
          { b: 1 },
        ],
        [C.ink, K.E(500, 720, 24, 24), { s: 'none' }],
      ],
      [[C.brown, 'R490 480 24 170', { s: C.ink }]],
      ln('M470 710H560', C.ink, 5),
      [
        [C.ink, K.E(790, 560, 24, 18), {}],
        [C.ink, 'R806 410 8 150', { s: 'none' }],
        [C.ink, 'M806 410Q840 420 860 460', { s: C.ink, w: 7 }],
      ],
      [
        [C.ink, K.E(190, 620, 24, 18), {}],
        [C.ink, 'R206 470 8 150', { s: 'none' }],
      ],
    ),
    'w-job-46': [].concat(
      bg(C.sky),
      floor(C.red, 880),
      ln('M0 840H1000M0 900H1000', C.paper, 7),
      man({
        shirt: C.red,
        pants: C.blue,
        shoe: C.paper,
        hair: C.brown,
        armL: [
          [330, 560],
          [280, 500],
        ],
        armR: [
          [660, 560],
          [720, 640],
        ],
        legL: [
          [455, 650],
          [400, 750],
          [330, 800],
        ],
        legR: [
          [545, 650],
          [600, 740],
          [610, 850],
        ],
      }),
      [[C.yellow, 'R405 245 190 20 8', { s: 'none' }]],
      [[C.paper, 'R440 490 120 80 6', {}]],
      ln('M470 535H530', C.red, 16),
      [[C.yellow, 'M440 640H560', { s: 'none' }]],
    ),
    'w-job-47': [].concat(
      bg(C.yellow),
      floor(C.orange, 880),
      man({
        shirt: C.paper,
        pants: C.blue,
        armL: [
          [400, 600],
          [450, 580],
        ],
        armR: [
          [600, 600],
          [550, 580],
        ],
        hair: C.brown,
      }),
      [
        [C.paper, 'R410 440 180 260 18', {}],
        [C.paper, 'R400 400 200 30', { s: C.ink }],
      ],
      [
        [
          C.paper,
          'M430 240C390 240 380 130 440 140C450 80 550 80 560 140C620 130 610 240 570 240Z',
          {},
        ],
        [C.paper, 'R430 235 140 40 8', {}],
      ],
      [
        [C.orange, K.E(500, 580, 130, 55, -10), {}],
        [
          C.brown,
          'M430 560L450 590M490 540L510 580M545 550L565 585',
          { s: C.brown, w: 7, i: 0 },
        ],
      ],
    ),
    'w-job-48': [].concat(
      bg(C.violet),
      floor(C.brown, 880),
      man({
        shirt: C.paper,
        pants: C.ink,
        armL: [
          [350, 600],
          [400, 540],
        ],
        armR: [
          [660, 460],
          [690, 360],
        ],
        hair: C.brown,
      }),
      [
        [C.ink, 'R425 440 150 160 16', { s: C.ink }],
        [C.paper, 'R470 440 60 40', { s: 'none' }],
      ],
      [[C.red, 'M470 330L500 340L530 330L530 360L500 345L470 360Z', {}]],
      [[C.paper, 'R340 520 80 120 6', {}]],
      [
        [C.violet, K.E(690, 330, 130, 24), {}],
        [C.sky, 'M620 320L630 240H680L690 320Z', {}],
        [C.paper, 'M730 320C730 250 800 250 800 320Z', {}],
      ],
    ),
    'w-job-': [],
  });
  delete R['w-job-'];
})(typeof globalThis !== 'undefined' ? globalThis : this);
