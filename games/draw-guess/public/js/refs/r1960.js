(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C,
    P = C.paper;
  function ln(d, c, w) {
    return ['none', d, { s: c || C.ink, w: w || 7 }];
  }
  function bg(c) {
    return [c, 'R-40 -40 1080 1080', { s: 'none' }];
  }
  function night() {
    return bg(C.blue);
  }
  function ground(c, y) {
    return [c, 'R-40 ' + y + ' 1080 ' + (1040 - y), { s: 'none' }];
  }
  function dot(c, x, y, r) {
    return [c, 'E' + x + ' ' + y + ' ' + r + ' ' + r, { s: 'none' }];
  }
  function stars(pts) {
    var o = [];
    for (var i = 0; i < pts.length; i++)
      o.push(dot(P, pts[i][0], pts[i][1], pts[i][2] || 9));
    return o;
  }
  function man(x, y, h, o) {
    o = o || {};
    var skin = o.skin || C.yellow,
      shirt = o.shirt || C.red,
      pants = o.pants || C.blue;
    var aL = o.armL || [-0.05, 0.3],
      aR = o.armR || [0.05, 0.3];
    var L = [];
    L.push(
      K.tube(
        [
          [x - 0.05 * h, y - 0.36 * h],
          [x - 0.05 * h, y],
        ],
        0.09 * h,
        pants,
      ),
    );
    L.push(
      K.tube(
        [
          [x + 0.05 * h, y - 0.36 * h],
          [x + 0.05 * h, y],
        ],
        0.09 * h,
        pants,
      ),
    );
    L.push([
      shirt,
      K.RR(x - 0.1 * h, y - 0.72 * h, 0.2 * h, 0.4 * h, 0.06 * h),
    ]);
    L.push(
      K.tube(
        [
          [x - 0.09 * h, y - 0.68 * h],
          [x - 0.09 * h + aL[0] * h, y - 0.68 * h + aL[1] * h],
        ],
        0.07 * h,
        shirt,
      ),
    );
    L.push(
      K.tube(
        [
          [x + 0.09 * h, y - 0.68 * h],
          [x + 0.09 * h + aR[0] * h, y - 0.68 * h + aR[1] * h],
        ],
        0.07 * h,
        shirt,
      ),
    );
    L.push([skin, K.E(x, y - 0.82 * h, 0.1 * h, 0.1 * h)]);
    if (o.hair !== null)
      L.push([o.hair || C.ink, K.E(x, y - 0.875 * h, 0.105 * h, 0.065 * h)]);
    L.push([
      C.ink,
      K.E(x - 0.035 * h, y - 0.81 * h, 0.012 * h, 0.016 * h),
      { s: 'none' },
    ]);
    L.push([
      C.ink,
      K.E(x + 0.035 * h, y - 0.81 * h, 0.012 * h, 0.016 * h),
      { s: 'none' },
    ]);
    return L;
  }
  function lantern(x, y, s, col) {
    var b = [
      ln('M500 100V262', C.brown, 7),
      [col, 'E500 400 150 130'],
      ln(
        'M440 275C400 340 400 460 440 525M560 275C600 340 600 460 560 525M500 270V530',
        C.ink,
        7,
      ),
      [C.yellow, 'R435 250 130 30 8'],
      [C.yellow, 'R435 520 130 30 8'],
      ln('M500 550V680', C.yellow, 16),
      [C.yellow, 'E500 690 22 36'],
    ];
    return K.T(b, { s: s, cx: 500, cy: 100, dx: x - 500, dy: y - 100 });
  }
  function pumpkin(x, y, s) {
    var b = [
      [C.orange, 'E500 560 300 230', { b: 1 }],
      ln(
        'M500 335C410 400 410 720 500 790M500 335C590 400 590 720 500 790',
        C.brown,
        7,
      )
        .concat([{}])
        .slice(0, 3),
      [C.green, 'R465 250 70 100 14'],
      [C.yellow, 'M360 500L440 500L400 430ZM560 500L640 500L600 430Z'],
      [
        C.yellow,
        'M360 620L420 650L460 610L500 660L540 610L580 650L640 620C610 720 390 720 360 620Z',
      ],
    ];
    b[1] = [
      'none',
      'M500 335C410 400 410 720 500 790M500 335C590 400 590 720 500 790',
      { i: 1, s: C.brown, w: 7 },
    ];
    return K.T(b, { s: s, cx: 500, cy: 500, dx: x - 500, dy: y - 500 });
  }
  function egg(cx, cy, s) {
    function p(a, b) {
      return (cx + a * s).toFixed(1) + ' ' + (cy + b * s).toFixed(1);
    }
    return (
      'M' +
      p(0, -100) +
      'C' +
      p(70, -100) +
      ' ' +
      p(100, 20) +
      ' ' +
      p(100, 80) +
      'C' +
      p(100, 150) +
      ' ' +
      p(60, 180) +
      ' ' +
      p(0, 180) +
      'C' +
      p(-60, 180) +
      ' ' +
      p(-100, 150) +
      ' ' +
      p(-100, 80) +
      'C' +
      p(-100, 20) +
      ' ' +
      p(-70, -100) +
      ' ' +
      p(0, -100) +
      'Z'
    );
  }
  function burst(cx, cy, r, col, n, w) {
    var d = '',
      i,
      a;
    for (i = 0; i < n; i++) {
      a = (i * Math.PI * 2) / n;
      d +=
        'M' +
        (cx + Math.cos(a) * r * 0.4).toFixed(0) +
        ' ' +
        (cy + Math.sin(a) * r * 0.4).toFixed(0) +
        'L' +
        (cx + Math.cos(a) * r).toFixed(0) +
        ' ' +
        (cy + Math.sin(a) * r).toFixed(0);
    }
    return [ln(d, col, w || 16), dot(col, cx, cy, r * 0.12)];
  }
  function flower(x, y, r, col, cen) {
    var o = [],
      i,
      a;
    for (i = 0; i < 8; i++) {
      a = (i * Math.PI) / 4;
      o.push([
        col,
        K.E(
          x + Math.cos(a) * r * 0.6,
          y + Math.sin(a) * r * 0.6,
          r * 0.45,
          r * 0.45,
        ),
      ]);
    }
    o.push([cen || C.yellow, K.E(x, y, r * 0.45, r * 0.45)]);
    return o;
  }
  function flat(a) {
    var o = [],
      i;
    for (i = 0; i < a.length; i++) {
      if (a[i] && Array.isArray(a[i][0])) o = o.concat(flat(a[i]));
      else o.push(a[i]);
    }
    return o;
  }
  var A = {};

  A['w-taiwan-8'] = [
    bg(P),
    dot(C.yellow, 780, 200, 80),
    ground(C.sky, 600),
    ln(
      'M100 700Q150 670 200 700T300 700M600 760Q650 730 700 760T800 760M300 840Q350 810 400 840T500 840',
      P,
      7,
    ),
    [C.violet, 'M620 600C660 540 760 540 800 600Z'],
    [C.brown, 'M60 790L140 520L360 430L700 430L880 520L950 790Z', { b: 1 }],
    [
      C.mint,
      'M100 520L360 440L700 440L900 520L900 580L100 580Z',
      { i: 1, s: 'none' },
    ],
    ln(
      'M240 575V640M300 575V640M360 575V640M420 575V640M480 575V640M540 575V640M600 575V640M660 575V640M720 575V640M780 575V640M840 575V640',
      C.ink,
      7,
    )
      .slice(0, 2)
      .concat([{ i: 1, s: C.ink, w: 7 }]),
    [P, 'E300 330 90 40', { s: 'none' }],
    [P, 'E380 310 70 40', { s: 'none' }],
  ];
  A['w-taiwan-8'][7] = [
    'none',
    'M170 580V800M240 580V800M310 580V800M380 580V800M450 580V800M520 580V800M590 580V800M660 580V800M730 580V800M800 580V800M870 580V800',
    { i: 1, s: C.ink, w: 7 },
  ];

  A['w-taiwan-9'] = [
    bg(P),
    dot(C.yellow, 800, 200, 70),
    [C.green, 'M-40 620L200 400L400 520L560 430L780 620Z'],
    ground(C.sky, 600),
    ln('M60 880Q110 850 160 880T260 880M700 900Q750 870 800 900T900 900', P, 7),
    [
      C.red,
      'M100 430C240 640 760 640 900 430C880 700 700 770 500 770C300 770 120 700 100 430Z',
      { b: 1 },
    ],
    [P, 'R0 590 1000 40', { i: 1, s: 'none' }],
    [C.ink, 'R0 630 1000 30', { i: 1, s: 'none' }],
    [C.ink, 'M100 430L70 360L130 400ZM900 430L930 360L870 400Z'],
    ln('M140 480L120 380M860 480L880 380', C.ink, 16),
    dot(P, 300, 700, 22),
    dot(P, 400, 725, 22),
    dot(P, 500, 735, 22),
    dot(P, 600, 725, 22),
    dot(P, 700, 700, 22),
  ];

  A['w-taiwan-10'] = [
    bg(P),
    ground(C.mint, 880),
    ln('M860 200V640', C.brown, 16),
    [C.red, 'M860 210L970 270L860 330Z'],
    ln('M150 260V640', C.brown, 16),
    [C.yellow, 'M150 270L260 320L150 380Z'],
    [C.yellow, 'M260 330L500 200L740 330L700 360L300 360Z'],
    [C.red, 'R320 360 360 240 10'],
    [C.yellow, 'R390 410 220 130 8'],
    ln('M430 410V540M500 410V540M570 410V540', C.ink, 7),
    [C.orange, 'R320 600 360 30 8'],
    ln('M110 650H890', C.brown, 34),
  ].concat(
    man(180, 900, 420, {
      shirt: C.orange,
      pants: C.ink,
      armL: [0.0, -0.05],
      armR: [0.1, -0.05],
    }),
    man(820, 900, 420, {
      shirt: C.orange,
      pants: C.ink,
      armL: [-0.1, -0.05],
      armR: [0, -0.05],
    }),
  );

  (function () {
    var r = [bg(P), ground(C.mint, 860)];
    r.push([C.brown, 'R230 450 560 330 12']);
    r.push([C.brown, 'M250 450L330 370H700L770 450Z']);
    var i,
      d1 = '',
      d2 = '';
    for (i = 0; i < 6; i++) {
      r.push([C.red, 'R' + (260 + i * 85) + ' 330 50 150 8']);
    }
    for (i = 0; i < 6; i++) {
      r.push([
        C.yellow,
        'M' +
          (260 + i * 85) +
          ' 330L' +
          (285 + i * 85) +
          ' 270L' +
          (310 + i * 85) +
          ' 330Z',
      ]);
    }
    r.push(
      ln(
        'M300 220L270 120M450 200L450 90M600 210L640 110M760 230L830 150M360 250L300 200',
        C.orange,
        16,
      ),
    );
    r.push(
      dot(C.orange, 270, 120, 18),
      dot(C.yellow, 450, 90, 18),
      dot(C.orange, 640, 110, 18),
      dot(C.yellow, 830, 150, 18),
    );
    r.push(ln('M300 560H720M300 650H720', C.ink, 7));
    r.push([C.brown, 'R250 780 60 90'], [C.brown, 'R690 780 60 90']);
    A['w-taiwan-11'] = r.concat(
      man(120, 860, 400, {
        shirt: C.red,
        hair: C.yellow,
        armL: [-0.1, -0.15],
        armR: [0.05, -0.15],
      }),
    );
  })();

  A['w-festival-0'] = [
    bg(P),
    [C.red, 'R300 180 400 640 24', { b: 1 }],
    [C.orange, 'M300 180L500 420L700 180Z', { i: 1 }],
    ln('M330 230H670M330 780H670', C.yellow, 7),
    [C.yellow, 'E500 560 100 100'],
    [C.red, 'M500 480L560 560L500 640L440 560Z'],
    dot(C.yellow, 500, 560, 20),
    [C.yellow, 'E820 780 50 50'],
    [C.yellow, 'E170 790 50 50'],
    ln('M820 760V800M170 770V810', C.ink, 7),
  ];

  A['w-festival-1'] = [
    bg(P),
    [C.green, 'R640 580 240 260 8'],
    [C.yellow, 'R740 580 40 260'],
    [C.red, 'R180 420 480 400 8', { b: 1 }],
    [C.brown, 'R180 780 480 40', { i: 1, s: 'none' }],
    [C.pink, 'R150 330 540 100 8'],
    [C.yellow, 'R390 330 80 490'],
    [C.yellow, 'E390 270 110 60 -25'],
    [C.yellow, 'E470 270 110 60 25'],
    [C.orange, 'E430 300 36 36'],
  ];

  A['w-festival-2'] = [
    bg(P),
    [C.red, 'R200 700 600 330 60'],
    [C.ink, 'R200 850 600 60'],
    [C.yellow, 'R450 840 100 80 8'],
    [C.pink, 'E500 460 150 150'],
    [
      P,
      'M340 480C330 700 400 830 500 840C600 830 670 700 660 480C620 560 560 580 500 560C440 580 380 560 340 480Z',
    ],
    [
      C.red,
      'M340 380C340 190 540 130 680 340L660 390C560 340 440 340 340 380Z',
    ],
    [P, 'R310 360 380 70 35'],
    [P, 'E710 350 45 45'],
    [P, 'E420 540 60 28 15'],
    [P, 'E580 540 60 28 -15'],
    [C.pink, 'E500 500 32 26'],
    [C.ink, 'E440 465 12 12', { s: 'none' }],
    [C.ink, 'E560 465 12 12', { s: 'none' }],
  ];

  A['w-festival-3'] = [night()]
    .concat(burst(500, 320, 250, C.yellow, 12, 16))
    .concat(burst(220, 580, 150, C.pink, 10, 16))
    .concat(burst(790, 560, 170, C.mint, 10, 16))
    .concat([
      [
        C.ink,
        'M-40 900H100V800H180V860H300V760H380V880H520V820H620V780H720V860H840V800H940V880H1040V1040H-40Z',
      ],
    ])
    .concat(
      stars([
        [100, 130],
        [900, 160],
        [650, 120],
        [380, 620],
      ]),
    );

  (function () {
    var r = [
      bg(P),
      ln('M500 60V230', C.brown, 16),
      [C.yellow, 'E500 240 40 30'],
    ];
    r.push(ln('M500 260V780', C.brown, 16));
    var i;
    for (i = 0; i < 4; i++) {
      r.push([C.red, 'R' + 390 + ' ' + (290 + i * 120) + ' 90 100 10']);
      r.push([C.red, 'R' + 520 + ' ' + (290 + i * 120) + ' 90 100 10']);
      r.push([
        C.yellow,
        'R' + 390 + ' ' + (290 + i * 120) + ' 90 22',
        { s: C.ink, w: 7 },
      ]);
      r.push([
        C.yellow,
        'R' + 520 + ' ' + (290 + i * 120) + ' 90 22',
        { s: C.ink, w: 7 },
      ]);
    }
    r.push([
      C.yellow,
      'M500 740L540 800L610 790L560 840L590 900L500 860L410 900L440 840L390 790L460 800Z',
    ]);
    r.push([
      C.orange,
      'M500 780L520 820L560 815L530 845L545 880L500 860L455 880L470 845L440 815L480 820Z',
    ]);
    A['w-festival-4'] = r;
  })();

  A['w-festival-5'] = [bg(P), ground(C.violet, 880)]
    .concat(pumpkin(500, 560, 1.3))
    .slice(0);
  A['w-festival-5'] = [bg(P), ground(C.violet, 860)].concat(
    pumpkin(500, 540, 1.3),
  );

  A['w-festival-6'] = [night()]
    .concat(
      stars([
        [120, 120],
        [880, 100],
        [100, 520],
        [900, 480],
        [700, 80],
      ]),
    )
    .concat([
      [C.orange, 'M300 220H700L750 700H250Z', { b: 1 }],
      [C.red, 'R290 200 420 40 8'],
      ln('M400 300V560M500 300V560M600 300V560', C.ink, 7)
        .slice(0, 2)
        .concat([{ i: 1, s: C.red, w: 16 }]),
      [C.yellow, 'E500 620 120 90', { i: 1, s: 'none' }],
      [C.brown, 'R320 700 360 36 8'],
      [C.yellow, 'M500 740C440 800 450 860 500 870C550 860 560 800 500 740Z'],
      [
        C.orange,
        'M500 790C480 820 485 850 500 855C515 850 520 820 500 790Z',
        { s: 'none' },
      ],
    ])
    .concat(
      K.T(
        [
          [C.orange, 'M300 220H700L750 700H250Z'],
          [C.red, 'R290 200 420 40 8'],
          [C.yellow, 'E500 620 80 60', { s: 'none' }],
        ],
        { s: 0.25, cx: 500, cy: 500, dx: 330, dy: -330 },
      ),
    );
  A['w-festival-6'][8] = [
    'none',
    'M400 300V560M500 300V560M600 300V560',
    { i: 1, s: C.red, w: 16 },
  ];

  A['w-festival-7'] = [
    bg(P),
    [C.brown, 'R290 260 420 640 8'],
    [C.red, 'R150 180 120 640 8'],
    [C.red, 'R730 180 120 640 8'],
    [C.red, 'R290 100 420 90 8'],
    ln(
      'M185 240H235M210 240V300M185 360H235M185 380V420M235 380V420M185 500H235M210 500V560M185 620H235M210 620V700',
      C.yellow,
      16,
    ),
    ln(
      'M765 240H815M790 240V300M765 360H815M765 400H815M765 500H815M790 500V560M765 620H815M790 620V700',
      C.yellow,
      16,
    ),
    ln(
      'M350 140H410M450 140H510M550 140H650M380 120V170M600 120V170',
      C.yellow,
      16,
    ),
    [C.red, 'M500 330L620 450L500 570L380 450Z'],
    ln('M450 440H550M500 400V500M470 480L530 480', C.yellow, 16),
    [C.yellow, 'E390 780 28 28'],
    [C.yellow, 'E610 780 28 28'],
    [C.yellow, 'E390 700 28 28'],
    [C.yellow, 'E610 700 28 28'],
  ];

  (function () {
    var r = [bg(P)];
    r.push(
      K.tube(
        [
          [380, 470],
          [450, 360],
          [540, 470],
          [640, 590],
          [730, 470],
          [820, 370],
          [900, 480],
        ],
        120,
        C.red,
      ),
    );
    var pts = [
        [450, 380],
        [540, 470],
        [640, 590],
        [730, 480],
        [820, 380],
      ],
      i;
    for (i = 0; i < pts.length; i++)
      r.push([C.yellow, K.E(pts[i][0], pts[i][1], 28, 28)]);
    r.push(ln('M450 460V850M640 680V850M820 460V850', C.brown, 16));
    r.push([C.red, 'E230 430 130 100']);
    r.push([C.orange, 'M120 340L90 250L190 320ZM240 330L260 240L320 340Z']);
    r.push([C.yellow, 'M120 440L40 480L110 520Z']);
    r.push([P, 'M130 500L160 540L190 500L220 540L250 500L280 540L310 500Z']);
    r.push([P, 'E240 400 28 28']);
    r.push([C.ink, 'E240 400 12 12', { s: 'none' }]);
    r.push([C.ink, 'E190 440 8 12', { s: 'none' }]);
    r.push([C.yellow, 'E300 340 30 24']);
    A['w-festival-8'] = r;
  })();

  (function () {
    var r = [bg(P)],
      i,
      a;
    for (i = 0; i < 14; i++) {
      a = (i * Math.PI * 2) / 14;
      r.push([
        C.yellow,
        K.E(500 + Math.cos(a) * 300, 500 + Math.sin(a) * 270, 80, 80),
      ]);
    }
    r.push([C.red, 'E500 520 260 230']);
    r.push([C.red, 'E270 340 70 70'], [C.red, 'E730 340 70 70']);
    r.push([C.orange, 'M500 190L460 300H540Z']);
    r.push([P, 'E390 430 80 70'], [P, 'E610 430 80 70']);
    r.push(
      [C.ink, 'E390 430 42 42', { s: 'none' }],
      [C.ink, 'E610 430 42 42', { s: 'none' }],
    );
    r.push(
      [P, 'E375 415 14 14', { s: 'none' }],
      [P, 'E595 415 14 14', { s: 'none' }],
    );
    r.push([C.yellow, 'E500 560 60 50']);
    r.push([C.ink, 'M340 680Q500 790 660 680Q500 720 340 680Z']);
    r.push([
      P,
      'M360 800L400 880L440 800L480 890L520 890L560 800L600 880L640 800Q500 850 360 800Z',
    ]);
    A['w-festival-9'] = r;
  })();

  A['w-festival-10'] = [bg(P), ln('M80 100H920', C.brown, 16)]
    .concat(lantern(330, 120, 1.1, C.red))
    .concat(lantern(720, 100, 0.75, C.orange))
    .concat([
      [C.sky, 'M560 770C560 920 880 920 880 770Z'],
      [P, 'E620 755 55 55'],
      [P, 'E730 725 55 55'],
      [P, 'E830 760 55 55'],
      [P, 'E700 780 55 55'],
      [C.pink, 'E700 727 12 12', { s: 'none' }],
    ]);

  A['w-festival-11'] = [night()]
    .concat(
      stars([
        [120, 120],
        [900, 140],
        [200, 400],
        [850, 460],
        [650, 80],
      ]),
    )
    .concat([
      [C.yellow, 'E500 340 230 230', { b: 1 }],
      [C.orange, 'E420 280 60 40', { i: 1, s: 'none' }],
      [C.orange, 'E580 380 80 50', { i: 1, s: 'none' }],
      [C.orange, 'E430 440 40 30', { i: 1, s: 'none' }],
      ground(C.brown, 760),
      [P, 'E500 830 340 70'],
      [C.orange, 'E370 780 120 70'],
      [C.orange, 'E640 770 120 70'],
      ln(
        'M300 780Q370 740 440 780M570 770Q640 730 710 770M370 760V800M640 750V790',
        C.brown,
        7,
      ),
    ]);

  (function () {
    var r = [bg(P)];
    r.push(ln('M500 40V180', C.brown, 16));
    r.push([C.green, 'M500 200L780 680L500 780L220 680Z', { b: 1 }]);
    r.push([C.mint, 'M500 200L500 780L220 680Z', { i: 1, s: 'none' }]);
    r.push(
      ln('M340 440L660 560M290 560L720 540', C.brown, 16)
        .slice(0, 1)
        .concat([{}])
        .slice(0, 1),
    );
    r[r.length - 1] = [
      'none',
      'M355 420L690 540M300 560L740 600',
      { i: 1, s: C.brown, w: 16 },
    ];
    r.push([C.green, 'M640 820L860 840L840 920L640 900Z']);
    r.push([C.mint, 'M670 770L790 780L760 850L660 830Z']);
    r.push(
      ln(
        'M700 790L800 880M170 860C230 800 300 800 330 860M350 860C410 800 470 800 500 860',
        C.ink,
        7,
      ),
    );
    r.push([C.mint, 'M120 880L400 860L440 930L150 940Z']);
    r.push(
      ln(
        'M120 870C150 780 220 760 300 780M300 850C340 770 400 770 440 800',
        C.green,
        16,
      ),
    );
    A['w-festival-12'] = r;
  })();

  (function () {
    var r = [bg(P), ground(C.sky, 740)];
    r.push([
      C.red,
      'M80 480L880 480C860 620 700 700 500 700C300 700 140 640 80 480Z',
      { b: 1 },
    ]);
    r.push([C.yellow, 'R0 540 1000 34', { i: 1, s: 'none' }]);
    r.push(
      K.tube(
        [
          [820, 500],
          [900, 400],
          [920, 300],
        ],
        60,
        C.green,
      ),
    );
    r.push([C.green, 'E940 270 85 60 -10']);
    r.push([C.yellow, 'M900 220L880 130L960 210Z']);
    r.push([P, 'E960 255 16 16']);
    r.push([C.ink, 'E962 255 7 7', { s: 'none' }]);
    r.push([C.red, 'M1000 290L1060 310L1000 340Z']);
    r.push(
      K.tube(
        [
          [100, 490],
          [50, 400],
        ],
        40,
        C.green,
      ),
    );
    var i;
    for (i = 0; i < 5; i++) {
      var x = 210 + i * 130;
      r = r.concat(
        man(x, 520, 290, {
          shirt: C.yellow,
          pants: C.yellow,
          hair: C.ink,
          armL: [0.2, 0.28],
          armR: [0.2, 0.28],
        }).slice(2),
      );
      r.push(ln('M' + (x + 80) + ' 400L' + (x + 210) + ' 700', C.brown, 16));
    }
    r = [r[0], r[1]].concat(
      K.T(flat(r.slice(2)), { s: 0.86, cx: 500, cy: 500, dx: -40, dy: 40 }),
    );
    r.push(
      ln(
        'M60 880Q110 850 160 880T260 880M520 940Q570 910 620 940T720 940',
        P,
        7,
      ),
    );
    A['w-festival-13'] = r;
  })();

  A['w-festival-14'] = [bg(P), ln('M60 100H940', C.brown, 34)]
    .concat(lantern(240, 100, 1.1, C.red), lantern(760, 100, 1.1, C.red))
    .concat([
      [C.red, 'M500 300L650 480L500 660L350 480Z', { b: 1 }],
      [C.yellow, 'M500 350L610 480L500 610L390 480Z', { i: 1 }],
      ln('M450 470H550M500 420V540M455 530L545 530', C.red, 16),
      [C.red, 'R300 800 400 90 14'],
      [C.yellow, 'E500 845 38 38'],
      ln('M200 900H300M700 900H800', C.red, 16),
    ]);

  A['w-festival-15'] = [
    bg(P),
    ground(P, 860),
    [C.brown, 'R450 760 100 110'],
    [C.green, 'M500 150L760 400H640L830 620H170L360 400H240Z'],
    [C.green, 'M200 640L800 640L860 780H140Z'],
    [
      C.yellow,
      'M500 60L530 130L605 135L548 185L566 258L500 220L434 258L452 185L395 135L470 130Z',
    ],
    [C.red, 'E440 420 30 30'],
    [C.pink, 'E580 500 30 30'],
    [C.yellow, 'E350 620 30 30'],
    [C.red, 'E660 650 30 30'],
    [C.sky, 'E500 600 30 30'],
    [C.pink, 'E250 760 30 30'],
    [C.red, 'R120 840 160 120 8'],
    [C.yellow, 'R190 840 22 120'],
    [C.sky, 'R700 860 170 100 8'],
    [C.red, 'R770 860 22 100'],
  ];

  A['w-festival-16'] = [night()]
    .concat(
      stars([
        [110, 100],
        [900, 460],
        [300, 60],
      ]),
    )
    .concat([[C.yellow, 'E780 200 100 100'], ground(C.violet, 800)])
    .concat([
      ln('M150 330C190 300 230 320 250 340C270 320 320 310 340 340', C.ink, 16),
      [
        P,
        'M150 780C150 560 220 440 320 440C420 440 480 560 480 780C440 740 410 790 370 750C330 790 290 740 250 780C210 750 180 790 150 780Z',
      ],
      [C.ink, 'E270 560 22 32', { s: 'none' }],
      [C.ink, 'E370 560 22 32', { s: 'none' }],
      [C.ink, 'E320 650 30 40', { s: 'none' }],
    ])
    .concat(pumpkin(700, 710, 0.65));

  (function () {
    var r = [bg(P), ground(C.mint, 800)];
    r.push([P, 'E500 650 170 170', { b: 1 }]);
    r.push([P, 'E500 450 120 100']);
    r.push([P, 'E420 220 42 120 -8']);
    r.push([P, 'E580 220 42 120 8']);
    r.push([C.pink, 'E422 225 18 90 -8', { s: 'none' }]);
    r.push([C.pink, 'E578 225 18 90 8', { s: 'none' }]);
    r.push([C.ink, 'E460 440 12 16', { s: 'none' }]);
    r.push([C.ink, 'E540 440 12 16', { s: 'none' }]);
    r.push([C.pink, 'M488 480L512 480L500 495Z']);
    r.push(
      ln(
        'M500 495V515M500 515Q480 535 465 520M500 515Q520 535 535 520',
        C.ink,
        7,
      ),
    );
    r.push([P, 'E420 810 60 32'], [P, 'E580 810 60 32']);
    r.push(
      [C.red, egg(210, 700, 0.75)],
      [C.sky, egg(770, 700, 0.75)],
      [C.yellow, egg(900, 800, 0.4)],
    );
    r.push(ln('M110 740L210 710L310 740', C.yellow, 16));
    r.push(ln('M700 740L770 720L840 740', P, 16));
    A['w-festival-17'] = r;
  })();

  A['w-festival-18'] = [
    bg(P),
    ground(C.mint, 780),
    [C.pink, egg(500, 380, 2.1), { b: 1 }],
    [
      'none',
      'M280 580L360 520L430 580L500 520L570 580L640 520L720 580',
      { i: 1, s: C.yellow, w: 34 },
    ],
    [
      'none',
      'M280 440L360 380L430 440L500 380L570 440L640 380L720 440',
      { i: 1, s: C.sky, w: 16 },
    ],
    dot(C.violet, 400, 680, 22)
      .slice(0, 2)
      .concat([{ i: 1, s: 'none' }]),
    [C.sky, egg(170, 640, 0.9)],
    [C.yellow, egg(830, 640, 0.9)],
    ['none', 'M110 700H230M115 760H225', C.red, 16],
    dot(C.red, 800, 650, 18),
    dot(C.red, 860, 700, 18),
    dot(C.red, 800, 740, 18),
  ];
  A['w-festival-18'][4] = [C.violet, 'E600 680 30 30', { i: 1, s: 'none' }];
  A['w-festival-18'][7] = ln('M110 650H230M115 710H225', C.red, 16);

  A['w-festival-19'] = [
    bg(P),
    [
      C.red,
      'M500 800C150 560 200 250 400 280C460 290 490 330 500 370C510 330 540 290 600 280C800 250 850 560 500 800Z',
      { b: 1 },
    ],
    [
      C.pink,
      'M500 800C650 700 780 500 700 360C640 460 560 700 500 800Z',
      { i: 1, s: 'none' },
    ],
    [P, 'E350 400 30 60 -35', { i: 1, s: 'none' }],
    ln('M180 200L820 740', C.ink, 16),
    [C.ink, 'M860 780L760 760L840 690Z'],
    [C.yellow, 'M180 200L120 180L150 230ZM180 200L200 140L230 180Z'],
    ln('M215 235L150 260M215 235L240 170', C.ink, 7),
    [C.pink, 'M800 250C760 200 700 240 800 320C900 240 840 200 800 250Z'],
    [C.pink, 'M170 700C140 660 90 690 170 760C250 690 200 660 170 700Z'],
  ];

  (function () {
    var r = [bg(P)];
    r.push([P, 'M280 620L720 620L500 1000Z', { b: 1 }]);
    r.push([C.pink, 'M280 620L720 620L690 680L310 680Z', { i: 1, s: 'none' }]);
    r.push(
      ln(
        'M420 560C430 700 470 800 500 880M580 560C570 700 530 800 500 880',
        C.green,
        16,
      ),
    );
    r.push(ln('M500 560V700', C.green, 16));
    r.push([
      C.mint,
      'M470 760C380 700 330 740 330 780C400 810 450 800 470 760Z',
    ]);
    r.push(flower(420, 400, 90, C.pink, C.red));
    r.push(flower(580, 400, 90, C.red, C.pink));
    r.push(flower(500, 270, 90, C.pink, C.yellow));
    r.push([C.red, 'M500 760L430 720L440 800ZM500 760L570 720L560 800Z']);
    A['w-festival-20'] = r;
  })();

  A['w-festival-21'] = [
    bg(P),
    [
      C.sky,
      'M240 140L380 140L500 230L620 140L760 140L840 280L760 330L760 900L240 900L240 330L160 280Z',
      { b: 1 },
    ],
    [P, 'M380 140L500 300L620 140L500 230Z'],
    [C.blue, 'M470 290L530 290L550 380L500 420L450 380Z'],
    [C.blue, 'M450 400L550 400L585 770L500 830L415 770Z'],
    [C.yellow, 'E500 500 14 14', { s: 'none' }],
    [C.yellow, 'E500 600 14 14', { s: 'none' }],
    [C.yellow, 'E490 700 14 14', { s: 'none' }],
    [C.paper, 'R630 480 90 100 6'],
    ln('M650 520H700M650 560H700', C.ink, 7),
    [C.red, 'M640 470L720 470L680 500Z'],
  ];

  (function () {
    var r = [bg(P), ground(C.mint, 820)];
    var kid1 = man(250, 840, 460, {
      shirt: C.orange,
      pants: C.blue,
      hair: C.brown,
      armL: [-0.05, -0.25],
      armR: [0.2, -0.28],
    });
    var kid2 = man(720, 840, 400, {
      shirt: C.pink,
      pants: C.violet,
      hair: C.ink,
      armL: [-0.2, -0.28],
      armR: [0.05, -0.25],
    });
    r = r.concat(kid1, kid2);
    r.push(
      ln('M210 340L190 220M870 460L850 260M690 410L540 250', C.ink, 7)
        .slice(0, 2)
        .concat([{}])
        .slice(0, 2),
    );
    r[r.length - 1] = [
      'none',
      'M440 330L350 180M575 330L560 170M690 410L690 260',
      { s: C.ink, w: 7 },
    ];
    r.push(
      [C.red, 'E340 140 70 85'],
      [C.yellow, 'E560 120 70 85'],
      [C.sky, 'E690 210 70 85'],
    );
    r.push([C.violet, 'E170 180 0 0', { s: 'none' }]);
    A['w-festival-22'] = r;
  })();
  A['w-festival-22'][A['w-festival-22'].length - 1] = [
    C.pink,
    'M0 0',
    { s: 'none' },
  ];
  A['w-festival-22'].pop();

  A['w-festival-23'] = [
    bg(P),
    [P, 'E500 830 380 70'],
    [C.brown, 'R200 580 600 250 16', { b: 1 }],
    [C.yellow, 'R200 640 600 24', { i: 1, s: 'none' }],
    [C.pink, 'R270 380 460 220 16'],
    [
      C.pink,
      'M180 540C180 480 330 480 330 540C330 600 180 600 180 540Z',
      { s: 'none' },
    ],
    [
      P,
      'M270 430C330 480 370 410 430 470C490 420 550 480 610 440C670 470 700 420 730 430L730 400L270 400Z',
      { s: 'none' },
    ],
    ln('M370 380V250M500 380V230M630 380V250', C.sky, 34),
    [C.yellow, 'M370 240C340 200 380 180 370 150C400 190 400 210 370 240Z'],
    [C.yellow, 'M500 220C470 180 510 160 500 130C530 170 530 190 500 220Z'],
    [C.yellow, 'M630 240C600 200 640 180 630 150C660 190 660 210 630 240Z'],
    [C.red, 'E340 560 38 32'],
    [C.red, 'E500 570 38 32'],
    [C.red, 'E660 560 38 32'],
  ];
  A['w-festival-23'][5] = [C.pink, 'R270 380 460 220 16'];
  A['w-festival-23'].splice(6, 1);

  A['w-festival-24'] = [
    bg(P),
    [C.brown, 'R60 100 880 60 10'],
    ln('M500 160V230', C.ink, 7),
    [
      C.red,
      'M360 240H640V560C640 680 780 690 820 780C850 860 780 910 700 890C560 850 360 760 360 600Z',
      { b: 1 },
    ],
    [
      C.yellow,
      'M640 700C700 740 780 790 830 860L700 900C730 830 680 760 600 700Z',
      { i: 1, s: 'none' },
    ],
    [C.yellow, 'E440 800 120 90', { i: 1, s: 'none' }],
    [P, 'R340 190 320 100 26'],
  ];
  A['w-festival-24'] = A['w-festival-24'].filter(function (l) {
    return !(
      l[1] &&
      (l[1].indexOf('M200 230') === 0 ||
        l[1].indexOf('M260 210') === 0 ||
        l[1].indexOf('M820 300') === 0)
    );
  });
  A['w-festival-24'].push(
    [C.red, 'R620 860 140 90 8'],
    [C.yellow, 'R680 860 20 90'],
  );
  A['w-festival-24'].pop();
  A['w-festival-24'].pop();
  A['w-festival-24'].push(
    [C.sky, 'R120 780 150 100 8'],
    [C.red, 'R180 780 24 100'],
  );
  A['w-festival-24'].push(
    ln('M800 260V180C800 130 870 130 870 180', C.ink, 34),
    ln('M800 260V180C800 130 870 130 870 180', C.red, 16),
  );

  (function () {
    var r = [bg(P)];
    r.push([C.red, 'E500 500 450 450', { s: 'none' }]);
    r.pop();
    r.push([C.brown, 'E500 520 420 420']);
    r.push([C.red, 'E500 520 380 380']);
    var i,
      a,
      x,
      y,
      cols = [C.mint, C.yellow, C.pink, C.sky, C.orange, C.mint];
    for (i = 0; i < 6; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 3;
      x = 500 + Math.cos(a) * 270;
      y = 520 + Math.sin(a) * 270;
      r.push([P, K.E(x, y, 85, 85)]);
      r.push([cols[i], K.E(x, y, 52, 52), { s: 'none' }]);
    }
    r.push([P, 'E500 520 130 130']);
    r.push([C.orange, 'E490 520 70 40', { s: 'none' }]);
    r.push([C.orange, 'M550 520L600 490L600 550Z', { s: 'none' }]);
    r.push([C.ink, 'E450 512 8 8', { s: 'none' }]);
    r.push(ln('M300 940L430 920M570 920L700 940', C.brown, 16));
    A['w-festival-25'] = r;
  })();

  A['w-festival-26'] = [night()]
    .concat(
      stars([
        [100, 120],
        [350, 80],
        [880, 400],
        [600, 60],
      ]),
    )
    .concat([
      [C.yellow, 'E680 240 160 160', { b: 1 }],
      [C.orange, 'E640 190 40 30', { i: 1, s: 'none' }],
      [C.orange, 'E740 290 50 36', { i: 1, s: 'none' }],
      [C.green, 'M-40 800C200 680 600 680 1040 800V1040H-40Z'],
      [C.brown, 'R400 760 300 30 8'],
      [C.brown, 'R440 790 24 90'],
      [C.brown, 'R630 790 24 90'],
      [P, 'E520 740 60 24', { s: C.ink }],
      [C.orange, 'E520 722 36 18'],
    ])
    .concat(
      man(250, 840, 400, {
        shirt: C.pink,
        pants: C.violet,
        hair: C.ink,
        armL: [-0.05, 0.28],
        armR: [0.2, -0.3],
      }),
      man(130, 860, 300, { shirt: C.sky, pants: C.blue, hair: C.brown }),
    );

  (function () {
    var r = [bg(P), ln('M60 100H940', C.brown, 34)];
    var xs = [220, 500, 780],
      i;
    for (i = 0; i < 3; i++) {
      r = r.concat(lantern(xs[i], 100, 0.7, i === 1 ? C.orange : C.red));
      r.push(ln('M' + xs[i] + ' 340V420', C.brown, 7));
      r.push([P, 'R' + (xs[i] - 22) + ' 420 44 150 4']);
      r.push(ln('M' + xs[i] + ' 450V540', C.ink, 7));
    }
    r = r.concat(
      man(500, 960, 380, {
        shirt: C.sky,
        pants: C.blue,
        hair: C.ink,
        armL: [-0.05, 0.28],
        armR: [0.12, -0.05],
      }),
    );
    r.push(
      ln('M740 700C740 640 840 640 840 700C840 740 790 740 790 780', C.ink, 34),
    );
    r.push(
      ln(
        'M740 700C740 640 840 640 840 700C840 740 790 740 790 780',
        C.yellow,
        16,
      ),
    );
    r.push(dot(C.ink, 790, 840, 28), dot(C.yellow, 790, 840, 14));
    A['w-festival-27'] = r;
  })();

  A['w-festival-28'] = [
    bg(P),
    [C.brown, 'R120 120 760 400 14'],
    [C.green, 'R150 150 700 340 6'],
    [P, 'E300 330 70 70', { s: 'none' }],
    ln('M450 420L520 260L590 420Z', P, 7),
    ln('M650 250H800M650 330H800M650 410H760', P, 7),
    [C.brown, 'R120 540 760 30 8'],
    [C.red, 'E700 830 60 55'],
    [C.green, 'M700 780L720 740', { s: C.ink }],
    [C.brown, 'R560 880 280 30'],
    ln('M380 580L560 330', C.brown, 16),
  ].concat(
    man(250, 960, 420, {
      shirt: C.violet,
      pants: C.ink,
      hair: C.brown,
      armL: [-0.05, 0.28],
      armR: [0.25, -0.25],
    }),
  );
  A['w-festival-28'][9] = [C.red, 'R660 870 80 10', { s: 'none' }];
  A['w-festival-28'].splice(9, 1);
  A['w-festival-28'].splice(8, 0, [C.brown, 'R560 910 280 20']);
  A['w-festival-28'].splice(
    7,
    2,
    [C.red, 'E700 830 60 55'],
    [C.green, 'M700 780L730 740L745 770Z'],
  );

  (function () {
    var r = [bg(P), [C.sky, 'M-40 400H1040V440H-40Z', { s: 'none' }]];
    r.pop();
    r.push([C.mint, 'M-40 780C200 620 600 620 1040 780V1040H-40Z']);
    r.push(
      ln(
        'M130 320C100 200 160 100 260 80M330 70C400 130 400 260 360 330',
        C.ink,
        7,
      )
        .slice(0, 1)
        .concat([{}])
        .slice(0, 1),
    );
    r.pop();
    r.push([C.brown, 'M180 640L230 340L270 340L290 640Z']);
    r.push(
      ln(
        'M250 340C190 280 100 320 90 420M250 340C310 280 400 320 410 420M250 340C250 270 250 270 250 220',
        C.mint,
        16,
      ),
    );
    r.push(ln('M120 400V480M170 380V500M330 380V500M380 400V470', C.green, 7));
    r.push([C.violet, 'M560 700V500C560 410 760 410 760 500V700Z']);
    r.push([C.green, 'E660 700 160 50']);
    r.push(ln('M620 560H700M640 600H680', C.ink, 7));
    r.push([C.brown, 'R800 740 120 80 10']);
    r.push(ln('M830 740V670M860 740V650M890 740V670', C.red, 7));
    r.push(
      ln(
        'M820 600C850 560 800 540 840 500M880 600C900 560 860 540 900 500',
        C.sky,
        7,
      ),
    );
    r.push(flower(430, 800, 70, C.yellow, C.orange));
    r.push(flower(560, 850, 60, P, C.yellow));
    r.push(
      ln(
        'M60 100L0 240M160 60L100 200M860 60L800 200M960 120L900 260M500 100L440 240M640 80L580 220M300 90L240 230',
        C.sky,
        7,
      ),
    );
    A['w-festival-29'] = r;
  })();

  A['w-festival-30'] = [night()]
    .concat(
      burst(160, 200, 110, C.yellow, 8, 16),
      burst(850, 220, 110, C.pink, 8, 16),
    )
    .concat(lantern(160, 360, 0.9, C.red), lantern(840, 360, 0.9, C.red))
    .concat([
      [P, 'E500 520 230 230'],
      [C.sky, 'E500 520 190 190', { s: 'none' }],
      ln('M500 520V380M500 520L600 560', C.ink, 16),
      dot(C.ink, 500, 520, 14),
      dot(C.red, 500, 360, 12),
      dot(C.ink, 500, 680, 12),
      dot(C.ink, 340, 520, 12),
      dot(C.ink, 660, 520, 12),
      ground(C.violet, 880),
      [C.red, 'R350 820 300 80 10'],
    ]);
  A['w-festival-30'][A['w-festival-30'].length - 1] = [
    C.red,
    'R400 790 200 90 10',
  ];
  A['w-festival-30'][A['w-festival-30'].length - 2] = ground(C.violet, 860);

  (function () {
    var r = [night()];
    r = r.concat(
      stars([
        [100, 100],
        [300, 60],
        [870, 90],
        [700, 40],
        [60, 400],
        [940, 380],
      ]),
    );
    r.push(ln('M-40 330C200 230 800 450 1040 300', C.violet, 90));
    r.push(
      ln('M-40 330C200 230 800 450 1040 300', P, 7)
        .slice(0, 2)
        .concat([{ s: P, w: 7 }]),
    );
    r.pop();
    r.push(ln('M-40 330C200 230 800 450 1040 300', P, 7));
    r.push([C.green, 'M-40 860C100 740 250 720 330 780V1040H-40Z']);
    r.push([C.green, 'M1040 860C900 740 750 720 680 780V1040H1040Z']);
    var i,
      t = [
        [260, 520],
        [340, 440],
        [420, 400],
        [500, 390],
        [580, 400],
        [660, 440],
        [740, 520],
      ];
    for (i = 0; i < t.length; i++) {
      r.push([P, K.E(t[i][0], t[i][1], 46, 28, i < 3 ? -15 : 15)]);
      r.push([
        C.ink,
        K.E(t[i][0], t[i][1] - 8, 34, 12, i < 3 ? -15 : 15),
        { s: 'none' },
      ]);
    }
    r.push([C.blue, 'R100 600 70 60 8'].slice(0, 2).concat([{}]));
    r = r.concat(
      man(150, 800, 320, { shirt: C.sky, pants: C.brown, hair: C.ink }),
    );
    r = r.concat(
      man(850, 800, 320, { shirt: C.pink, pants: C.red, hair: C.ink }),
    );
    A['w-festival-31'] = r;
  })();
  A['w-festival-31'] = A['w-festival-31'].filter(function (l) {
    return !(l[0] === C.blue && l[1] === 'R100 600');
  });

  (function () {
    var r = [bg(C.sky)];
    r.push(dot(C.yellow, 800, 160, 70));
    r.push([C.violet, 'M-40 900L300 380L520 700L700 480L1040 900Z', { b: 1 }]);
    r.push([P, 'M300 380L245 475L300 450L345 480Z', { i: 1, s: 'none' }]);
    r.push(ln('M200 840L360 760L260 680L420 600L350 540', C.brown, 16));
    r.push([C.mint, 'M-40 900C200 830 700 830 1040 900V1040H-40Z']);
    r.push(flower(750, 880, 90, C.yellow, C.orange));
    r.push(flower(880, 930, 70, P, C.yellow));
    r.push(ln('M750 920V1000M880 960V1020', C.green, 16));
    r = r.concat(
      man(350, 560, 240, {
        shirt: C.red,
        pants: C.ink,
        hair: P,
        armL: [-0.15, 0.2],
        armR: [0.1, 0.0],
      }),
    );
    r.push(ln('M385 470L395 580', C.brown, 16));
    r.push([C.red, 'M300 330L300 260L370 295Z']);
    r.push(ln('M300 330V410', C.brown, 7));
    A['w-festival-32'] = r;
  })();

  (function () {
    var r = [bg(P), ground(C.mint, 820)];
    var i,
      cols = [C.red, C.orange, C.yellow, C.brown, C.yellow, C.orange, C.red],
      ang = [-70, -45, -22, 0, 22, 45, 70];
    for (i = 0; i < 7; i++)
      r.push([
        cols[i],
        K.E(600, 450, 40, 210, ang[i]).replace(
          /E600 450/,
          'E' +
            (600 + Math.sin((ang[i] * Math.PI) / 180) * 160).toFixed(0) +
            ' ' +
            (450 - Math.cos((ang[i] * Math.PI) / 180) * 160 + 120).toFixed(0),
        ),
      ]);
    r.push([C.brown, 'E600 600 160 190']);
    r.push([
      C.orange,
      'M470 560C520 620 700 620 740 540L750 600C700 760 500 760 470 640Z',
      { s: 'none' },
    ]);
    r.push(
      K.tube(
        [
          [600, 430],
          [640, 340],
          [700, 300],
        ],
        56,
        C.brown,
      ),
    );
    r.push([C.brown, 'E720 290 55 45']);
    r.push([
      C.red,
      'M770 290C800 310 790 380 770 400C750 360 760 320 770 290Z',
    ]);
    r.push([C.yellow, 'M770 270L830 295L770 315Z']);
    r.push([C.ink, 'E710 275 8 8', { s: 'none' }]);
    r.push(
      ln('M570 780V830M630 780V830M540 830H600M600 830H660', C.orange, 16),
    );
    r = r.concat(pumpkin(230, 740, 0.55));
    A['w-festival-33'] = r;
  })();

  A['w-festival-34'] = [
    bg(P),
    [C.brown, 'R80 600 840 50 8'],
    [C.brown, 'R130 650 50 330'],
    [C.brown, 'R820 650 50 330'],
    [C.yellow, 'M400 560C390 480 430 440 500 440C570 440 610 480 600 560Z'],
    [C.ink, 'R380 560 240 40 8'],
    ln('M450 440V260M500 440V230M550 440V260', C.red, 16),
    ln('M500 220C470 180 540 140 500 90', C.sky, 16),
    [C.red, 'R200 480 50 120 8'],
    [C.red, 'R750 480 50 120 8'],
    [C.yellow, 'M225 480C210 450 240 440 225 410C260 440 250 460 225 480Z'],
    [C.yellow, 'M775 480C760 450 790 440 775 410C810 440 800 460 775 480Z'],
    [P, 'E700 585 130 18'],
    [C.red, 'E660 540 36 36'],
    [C.orange, 'E730 535 36 36'],
    [C.yellow, 'E695 500 36 36'],
    [C.yellow, 'R230 700 70 20'],
    [C.orange, 'R280 740 100 20'],
  ];
  A['w-festival-34'].splice(14, 2);
  A['w-festival-34'] = A['w-festival-34'].filter(function (l) {
    return !(l[1] === 'R230 700 70 20' || l[1] === 'R280 740 100 20');
  });
  A['w-festival-34'] = A['w-festival-34']
    .concat(lantern(130, 60, 0.8, C.orange))
    .concat(lantern(880, 60, 0.8, C.orange));

  (function () {
    var r = [night()];
    r = r.concat(
      burst(180, 220, 120, C.yellow, 10, 16),
      burst(830, 200, 140, C.pink, 10, 16),
      burst(500, 150, 90, C.mint, 8, 16),
    );
    r.push([
      C.ink,
      'M-40 900H80V800H180V860H300V740H380V880H520V820H620V780H720V860H840V800H940V880H1040V1040H-40Z',
    ]);
    var i, y;
    r.push([C.brown, 'R400 760 200 130 0'].slice(0, 2).concat([{}]));
    r.pop();
    r.push([C.mint, 'R360 840 280 80 0', { s: 'none' }]);
    r.pop();
    r.push([C.paper, 'R360 780 280 100 6']);
    r.push([
      C.red,
      'M500 280L520 340L580 340L535 375L550 435L500 400L450 435L465 375L420 340L480 340Z',
    ]);
    for (i = 0; i < 7; i++) {
      y = 760 - i * 70;
      r.push([
        C.mint,
        'M' +
          450 +
          ' ' +
          y +
          'L' +
          550 +
          ' ' +
          y +
          'L' +
          572 +
          ' ' +
          (y - 70) +
          'L' +
          428 +
          ' ' +
          (y - 70) +
          'Z',
      ]);
    }
    r.push(ln('M500 40V120', P, 7));
    A['w-festival-35'] = r;
  })();
  A['w-festival-35'] = (function () {
    var r = [night()];
    r = r.concat(
      burst(180, 260, 120, C.yellow, 10, 16),
      burst(830, 240, 140, C.pink, 10, 16),
      burst(500, 100, 80, C.orange, 8, 16),
    );
    r.push([
      C.ink,
      'M-40 900H80V800H180V860H300V740H380V880H520V820H620V780H720V860H840V800H940V880H1040V1040H-40Z',
    ]);
    r.push([C.green, 'R340 790 320 90 6']);
    var i, y;
    for (i = 0; i < 8; i++) {
      y = 790 - i * 80;
      r.push([
        C.mint,
        'M455 ' +
          y +
          'L545 ' +
          y +
          'L578 ' +
          (y - 80) +
          'L422 ' +
          (y - 80) +
          'Z',
      ]);
    }
    r.push([C.mint, 'M470 150L530 150L500 100Z']);
    r.push(ln('M500 100V50', P, 7));
    return r;
  })();

  Object.assign(R, A);
})(typeof globalThis !== 'undefined' ? globalThis : this);
