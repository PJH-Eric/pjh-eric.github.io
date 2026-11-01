(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;
  var INK = C.ink;

  function mp(pts) {
    return pts.map(function (p) {
      return [1000 - p[0], p[1]];
    });
  }
  var ARMS = {
    down: [
      [
        [410, 385],
        [360, 500],
        [355, 600],
      ],
      [
        [590, 385],
        [640, 500],
        [645, 600],
      ],
    ],
    up: [
      [
        [410, 385],
        [350, 300],
        [330, 200],
      ],
      [
        [590, 385],
        [650, 300],
        [670, 200],
      ],
    ],
    wave: [
      [
        [410, 385],
        [360, 500],
        [355, 600],
      ],
      [
        [590, 385],
        [660, 300],
        [690, 200],
      ],
    ],
    cross: [
      [
        [410, 385],
        [430, 490],
        [560, 480],
      ],
      [
        [590, 385],
        [570, 480],
        [440, 510],
      ],
    ],
    holdR: [
      [
        [410, 385],
        [360, 500],
        [355, 600],
      ],
      [
        [590, 385],
        [640, 470],
        [600, 520],
      ],
    ],
    holdL: [
      [
        [410, 385],
        [360, 470],
        [400, 520],
      ],
      [
        [590, 385],
        [640, 500],
        [645, 600],
      ],
    ],
    both: [
      [
        [410, 385],
        [420, 480],
        [480, 520],
      ],
      [
        [590, 385],
        [580, 480],
        [520, 520],
      ],
    ],
    out: [
      [
        [410, 385],
        [330, 440],
        [270, 470],
      ],
      [
        [590, 385],
        [670, 440],
        [730, 470],
      ],
    ],
    reachR: [
      [
        [410, 385],
        [360, 500],
        [355, 600],
      ],
      [
        [590, 385],
        [680, 420],
        [760, 430],
      ],
    ],
    reachL: [
      [
        [410, 385],
        [320, 420],
        [240, 430],
      ],
      [
        [590, 385],
        [640, 500],
        [645, 600],
      ],
    ],
  };

  function pp(o) {
    var skin = o.skin || C.yellow,
      shirt = o.shirt || C.blue,
      pants = o.pants || C.brown,
      hair = o.hair || C.brown;
    var out = [];
    var a = o.arms
      ? typeof o.arms === 'string'
        ? ARMS[o.arms]
        : o.arms
      : ARMS.down;
    if (o.pre) out = out.concat(o.pre);
    if (o.hs === 'long') out.push([hair, 'R400 180 200 250 80']);
    if (o.hs === 'perm') out.push([hair, 'E500 215 130 120']);
    // legs
    if (o.dress) {
      out.push([skin, 'R435 600 50 250 20']);
      out.push([skin, 'R515 600 50 250 20']);
      out.push([o.dress, 'M400 540L600 540L660 720L340 720Z']);
    } else {
      out.push([pants, 'R420 570 75 290 22']);
      out.push([pants, 'R505 570 75 290 22']);
    }
    out.push([INK, 'E457 872 58 26']);
    out.push([INK, 'E543 872 58 26']);
    out.push([shirt, 'R395 335 210 260 50']);
    if (o.tie) {
      out.push([o.tie, 'M485 340L515 340L525 450L500 490L475 450Z']);
    }
    if (o.apron) {
      out.push([o.apron, 'R430 420 140 180 30']);
    }
    a.forEach(function (pts) {
      out = out.concat(K.tube(pts, 56, shirt));
    });
    a.forEach(function (pts) {
      var e = pts[pts.length - 1];
      out.push([skin, 'E' + e[0] + ' ' + e[1] + ' 36 36']);
    });
    if (o.armsPost) out = out.concat(o.armsPost);
    out.push([skin, 'R470 300 60 50 20']);
    if (o.hs === 'pony')
      out = out.concat(
        K.tube(
          [
            [580, 210],
            [650, 260],
            [640, 360],
          ],
          44,
          hair,
        ),
      );
    out.push([skin, 'E500 240 92 98']);
    if (o.hs === 'cap') {
      out.push([o.capColor || C.red, 'M408 225C408 120 592 120 592 225Z']);
      out.push([o.capColor || C.red, 'M560 215L690 225L690 245L560 245Z']);
    } else if (o.hs === 'bald') {
    } else if (o.hs === 'perm') {
      out.push([
        hair,
        'M408 230C400 130 600 130 592 230C560 190 440 190 408 230Z',
      ]);
    } else {
      out.push([
        hair,
        'M408 232C400 130 600 130 592 232C565 195 440 175 408 232Z',
      ]);
    }
    if (o.hs === 'bun') out.push([hair, 'E500 125 42 38']);
    if (o.cheeks) {
    }
    out.push([INK, 'E460 250 10 13', { s: 'none' }]);
    out.push([INK, 'E540 250 10 13', { s: 'none' }]);
    if (o.glasses) {
      out.push(['none', 'E460 250 28 24', { s: INK, w: 7 }]);
      out.push(['none', 'E540 250 28 24', { s: INK, w: 7 }]);
      out.push(['none', 'M488 250L512 250', { s: INK, w: 7 }]);
    }
    if (o.stache) out.push([hair, 'M450 292Q500 268 550 292Q500 310 450 292Z']);
    else out.push(['none', 'M462 290Q500 320 538 290', { s: INK, w: 7 }]);
    if (o.post) out = out.concat(o.post);
    return out;
  }
  function P(o, dx, dy, s) {
    return K.T(pp(o), {
      dx: dx || 0,
      dy: dy || 0,
      s: s || 1,
      cx: 500,
      cy: 500,
    });
  }
  function G(y, col) {
    return [[col || C.mint, 'R100 ' + y + ' 800 60 20']];
  }
  function heart(x, y, s, col) {
    return K.T(
      [
        [
          col || C.red,
          'M0 -10C-30 -60 -90 -20 -50 30L0 80L50 30C90 -20 30 -60 0 -10Z',
        ],
      ],
      { dx: x, dy: y, s: s },
    );
  }
  function star(x, y, r, col) {
    var pts = [],
      i;
    for (i = 0; i < 10; i++) {
      var ang = (Math.PI * i) / 5 - Math.PI / 2,
        rr = i % 2 ? r * 0.45 : r;
      pts.push([x + rr * Math.cos(ang), y + rr * Math.sin(ang)]);
    }
    return [[col || C.yellow, K.poly(pts)]];
  }

  Object.assign(R, {
    // 雙胞胎
    'w-people-14': [].concat(
      G(830, C.mint),
      P(
        {
          shirt: C.red,
          pants: C.blue,
          hair: C.brown,
          arms: [
            [
              [410, 385],
              [360, 500],
              [355, 600],
            ],
            [
              [590, 385],
              [650, 480],
              [700, 520],
            ],
          ],
        },
        -150,
        0,
        0.9,
      ),
      P(
        {
          shirt: C.red,
          pants: C.blue,
          hair: C.brown,
          arms: [
            [
              [410, 385],
              [350, 480],
              [300, 520],
            ],
            [
              [590, 385],
              [640, 500],
              [645, 600],
            ],
          ],
        },
        150,
        0,
        0.9,
      ),
    ),
    // 學生
    'w-people-15': [].concat(
      [[C.red, 'R590 360 150 230 40']],
      [[C.orange, 'R630 430 80 70 14']],
      P({
        shirt: C.paper,
        pants: C.blue,
        hair: C.ink,
        arms: 'holdR',
        tie: C.red,
        post: [
          [C.sky, 'R560 480 120 90 10'],
          [C.paper, 'R575 490 90 20 6'],
        ],
      }),
      G(850, C.mint),
    ),
    // 壽星
    'w-people-16': [].concat(
      P(
        {
          shirt: C.pink,
          pants: C.violet,
          hair: C.brown,
          arms: 'up',
          post: [
            [C.red, 'M500 70L440 170L560 170Z'],
            [C.yellow, 'E500 70 16 16'],
          ],
        },
        -100,
        20,
        0.85,
      ),
      [
        [C.paper, 'R560 700 300 150 20'],
        [C.pink, 'R560 700 300 55 20'],
        [C.yellow, 'R690 590 40 110 10'],
        [C.orange, 'M710 590Q690 550 710 520Q735 550 710 590Z'],
      ],
      [
        [C.violet, 'R590 600 30 100 8'],
        [C.orange, 'M605 600Q590 565 605 540Q620 565 605 600Z'],
      ],
      [
        [C.sky, 'R800 600 30 100 8'],
        [C.orange, 'M815 600Q800 565 815 540Q830 565 815 600Z'],
      ],
    ),
    // 觀眾
    'w-people-17': [].concat(
      [
        [C.red, 'R120 140 760 80 10'],
        [C.red, 'R120 140 130 400'],
        [C.red, 'R750 140 130 400'],
      ],
      [[C.violet, 'R250 650 500 210 30']],
      P(
        { shirt: C.orange, pants: C.blue, hair: C.ink, arms: 'up' },
        -270,
        150,
        0.6,
      ),
      P(
        { shirt: C.mint, pants: C.blue, hair: C.brown, hs: 'long', arms: 'up' },
        0,
        150,
        0.6,
      ),
      P(
        { shirt: C.sky, pants: C.blue, hair: C.ink, arms: 'up' },
        270,
        150,
        0.6,
      ),
      [[C.red, 'R100 760 800 100 24']],
    ),
    // 粉絲
    'w-people-18': [].concat(
      P({
        shirt: C.pink,
        pants: C.blue,
        hair: C.brown,
        hs: 'pony',
        arms: 'up',
        armsPost: [
          ['none', 'M650 190L670 100', { s: C.red, w: 20 }],
          ['none', 'M330 190L330 110', { s: C.violet, w: 20 }],
        ],
      }),
      heart(500, 70, 0.9, C.red),
      heart(780, 220, 0.7, C.pink),
      heart(210, 250, 0.7, C.pink),
    ),
    // 叔叔
    'w-people-19': [].concat(
      P({
        shirt: C.green,
        pants: C.brown,
        hair: C.ink,
        stache: 1,
        arms: 'wave',
      }),
      G(870, C.mint),
    ),
    // 阿姨
    'w-people-20': [].concat(
      P({
        shirt: C.violet,
        pants: C.blue,
        hair: C.brown,
        hs: 'perm',
        arms: 'holdR',
        dress: C.red,
        post: [
          [C.orange, 'R570 520 130 100 18'],
          ['none', 'M600 520Q635 460 670 520', { s: INK, w: 10 }],
        ],
      }),
    ),
    // 舅舅
    'w-people-21': [].concat(
      P({
        shirt: C.orange,
        pants: C.blue,
        hair: C.ink,
        glasses: 1,
        hs: 'cap',
        capColor: C.blue,
        arms: 'holdR',
        post: [
          [C.red, 'R570 500 130 110 10'],
          [C.yellow, 'R625 500 20 110'],
          [C.yellow, 'R570 540 130 20'],
        ],
      }),
      G(870, C.mint),
    ),
    // 表哥
    'w-people-22': [].concat(
      P({
        shirt: C.green,
        pants: C.ink,
        hair: C.ink,
        arms: 'holdR',
        post: [
          ['none', 'M415 220C400 100 600 100 585 220', { s: INK, w: 22 }],
          [C.red, 'R385 210 40 70 18'],
          [C.red, 'R575 210 40 70 18'],
          [C.ink, 'R560 470 70 110 10'],
          [C.sky, 'R570 480 50 80 6'],
        ],
      }),
    ),
    // 同學
    'w-people-23': [].concat(
      [[C.red, 'R145 380 130 200 30']],
      [[C.orange, 'R735 380 130 200 30']],
      P(
        { shirt: C.sky, pants: C.blue, hair: C.ink, arms: 'wave' },
        -160,
        0,
        0.85,
      ),
      P(
        {
          shirt: C.pink,
          pants: C.violet,
          hair: C.brown,
          hs: 'pony',
          arms: [
            [
              [410, 385],
              [350, 440],
              [330, 520],
            ],
            [
              [590, 385],
              [640, 500],
              [645, 600],
            ],
          ],
        },
        160,
        0,
        0.85,
      ),
      G(850, C.mint),
    ),
    // 鄰居
    'w-people-24': [].concat(
      K.house(250, 700, 0.9, C.yellow, C.red),
      P(
        { shirt: C.orange, pants: C.blue, hair: C.brown, arms: 'wave' },
        220,
        20,
        0.85,
      ),
      [
        [C.brown, 'R60 700 880 40 6'],
        [C.brown, 'R90 650 40 190 8'],
        [C.brown, 'R220 650 40 190 8'],
        [C.brown, 'R350 650 40 190 8'],
        [C.brown, 'R610 650 40 190 8'],
        [C.brown, 'R740 650 40 190 8'],
        [C.brown, 'R870 650 40 190 8'],
        [C.brown, 'R60 780 880 36 6'],
      ],
    ),
    // 朋友
    'w-people-25': [].concat(
      P(
        {
          shirt: C.orange,
          pants: C.blue,
          hair: C.ink,
          arms: [
            [
              [410, 385],
              [360, 500],
              [355, 600],
            ],
            [
              [590, 385],
              [700, 380],
              [790, 400],
            ],
          ],
        },
        -150,
        40,
        0.85,
      ),
      P(
        {
          shirt: C.mint,
          pants: C.violet,
          hair: C.brown,
          hs: 'pony',
          arms: [
            [
              [410, 385],
              [300, 380],
              [210, 400],
            ],
            [
              [590, 385],
              [640, 500],
              [645, 600],
            ],
          ],
        },
        150,
        40,
        0.85,
      ),
      heart(500, 110, 1, C.red),
    ),
    // 客人
    'w-people-26': [].concat(
      [
        [C.brown, 'R620 250 250 610 8'],
        [C.yellow, 'R660 290 170 530 8'],
        [C.yellow, 'E680 560 14 14'],
      ],
      [[C.red, 'R120 840 400 40 10']],
      P(
        {
          shirt: C.pink,
          pants: C.blue,
          hair: C.brown,
          hs: 'bun',
          arms: 'holdR',
          post: [
            [C.red, 'R560 520 110 100 10'],
            [C.yellow, 'R605 520 20 100'],
            [C.yellow, 'R560 555 110 20'],
          ],
        },
        -100,
        0,
        0.95,
      ),
    ),
    // 隊長
    'w-people-27': [].concat(
      [
        ['none', 'M760 160L760 700', { s: C.brown, w: 16 }],
        [C.red, 'M770 170L900 220L770 290Z'],
      ],
      P(
        {
          shirt: C.blue,
          pants: C.ink,
          hair: C.ink,
          arms: [
            [
              [410, 385],
              [360, 500],
              [355, 600],
            ],
            [
              [590, 385],
              [690, 480],
              [760, 560],
            ],
          ],
          post: [
            [C.yellow, 'R392 400 50 40 6', { s: INK }],
            [C.yellow, 'E500 460 14 14'],
          ],
        },
        -50,
        0,
        1,
      ),
      G(850, C.mint),
    ),
    // 室友
    'w-people-28': [].concat(
      [
        [C.brown, 'R130 150 30 700 6'],
        [C.brown, 'R840 150 30 700 6'],
        [C.brown, 'R130 420 740 30 6'],
        [C.brown, 'R130 700 740 30 6'],
      ],
      [
        [C.sky, 'R160 340 680 80 14'],
        [C.mint, 'R160 620 680 80 14'],
      ],
      [
        [C.paper, 'R180 270 140 70 24'],
        [C.paper, 'R180 550 140 70 24'],
      ],
      [
        [C.yellow, 'E320 270 62 62'],
        [C.yellow, 'E320 550 62 62'],
      ],
      [
        [C.ink, 'E300 265 8 10', { s: 'none' }],
        [C.ink, 'E340 265 8 10', { s: 'none' }],
        [C.ink, 'E300 545 8 10', { s: 'none' }],
        [C.ink, 'E340 545 8 10', { s: 'none' }],
      ],
      [
        [C.brown, 'M262 260C262 200 378 200 378 260C350 235 290 235 262 260Z'],
        [C.ink, 'M262 540C262 480 378 480 378 540C350 515 290 515 262 540Z'],
      ],
      [
        [C.pink, 'R520 340 300 80 14'],
        [C.violet, 'R520 620 300 80 14'],
      ],
    ),
    // 導遊
    'w-people-29': [].concat(
      [
        ['none', 'M720 120L720 520', { s: C.brown, w: 16 }],
        [C.yellow, 'M730 130L890 180L730 240Z'],
      ],
      P(
        {
          shirt: C.red,
          pants: C.ink,
          hair: C.ink,
          hs: 'cap',
          capColor: C.orange,
          arms: [
            [
              [410, 385],
              [360, 500],
              [355, 600],
            ],
            [
              [590, 385],
              [680, 420],
              [720, 480],
            ],
          ],
        },
        -50,
        0,
        1,
      ),
      G(850, C.mint),
    ),
    // 路人
    'w-people-30': [].concat(
      [
        [C.violet, 'R100 800 800 100 10'],
        [C.paper, 'R160 850 100 14'],
        [C.paper, 'R420 850 100 14'],
        [C.paper, 'R680 850 100 14'],
      ],
      [
        [C.ink, 'R810 180 30 620 6'],
        [C.yellow, 'E825 160 45 45'],
      ],
      K.T(
        pp({
          shirt: C.green,
          pants: C.blue,
          hair: C.ink,
          arms: [
            [
              [410, 385],
              [450, 500],
              [480, 590],
            ],
            [
              [590, 385],
              [550, 500],
              [520, 590],
            ],
          ],
        }),
        { dx: -60, dy: -30, s: 0.95, cx: 500, cy: 500 },
      ),
    ),
    // 偶像
    'w-people-31': [].concat(
      [[C.violet, 'R100 820 800 70 10']],
      star(200, 200, 70, C.yellow),
      star(800, 170, 60, C.yellow),
      star(840, 420, 45, C.pink),
      star(170, 460, 45, C.pink),
      P(
        {
          shirt: C.pink,
          pants: C.violet,
          hair: C.brown,
          hs: 'long',
          arms: 'holdR',
          post: [
            [C.ink, 'E640 440 28 28'],
            ['none', 'M628 460L600 520', { s: INK, w: 16 }],
          ],
        },
        0,
        -20,
        0.95,
      ),
      heart(300, 330, 0.5, C.red),
      heart(720, 300, 0.5, C.red),
    ),
    // 青少年
    'w-people-32': [].concat(
      [
        [C.red, 'R300 830 400 36 18'],
        [C.ink, 'E360 890 24 24'],
        [C.ink, 'E640 890 24 24'],
      ],
      P(
        {
          shirt: C.violet,
          pants: C.blue,
          hair: C.ink,
          arms: 'holdR',
          post: [
            [C.ink, 'R580 470 60 100 10'],
            [C.sky, 'R590 480 40 80 6'],
          ],
        },
        0,
        -30,
        0.95,
      ),
    ),
    // 班長
    'w-people-33': [].concat(
      [
        [C.green, 'R100 120 800 380 14'],
        [C.brown, 'R100 480 800 30 8'],
        [C.paper, 'R200 200 200 14'],
        [C.paper, 'R200 270 300 14'],
      ],
      P(
        {
          shirt: C.paper,
          pants: C.blue,
          hair: C.ink,
          arms: 'up',
          tie: C.red,
          post: [[C.red, 'R575 395 50 50 10'], star(600, 420, 20, C.yellow)[0]],
        },
        0,
        80,
        0.8,
      ),
      G(850, C.violet),
    ),
    // 房東
    'w-people-34': [].concat(
      K.house(750, 560, 0.7, C.sky, C.brown),
      P(
        {
          shirt: C.orange,
          pants: C.ink,
          hair: C.ink,
          stache: 1,
          arms: 'holdR',
          post: [
            ['none', 'M610 470L600 560', { s: INK, w: 12 }],
            [C.yellow, 'E600 575 30 30'],
            [C.yellow, 'E600 575 12 12', { s: 'none' }],
          ],
        },
        -120,
        0,
        1,
      ),
      G(860, C.mint),
    ),
    // 顧客
    'w-people-35': [].concat(
      P(
        {
          shirt: C.mint,
          pants: C.blue,
          hair: C.brown,
          hs: 'long',
          arms: [
            [
              [410, 385],
              [360, 500],
              [355, 600],
            ],
            [
              [590, 385],
              [640, 500],
              [645, 600],
            ],
          ],
          post: [
            [C.red, 'M270 600L440 600L420 800L290 800Z'],
            ['none', 'M310 600Q350 520 400 600', { s: INK, w: 10 }],
            [C.yellow, 'M560 600L730 600L710 800L580 800Z'],
            ['none', 'M600 600Q640 520 690 600', { s: INK, w: 10 }],
          ],
        },
        0,
        0,
        1,
      ),
      G(870, C.violet),
    ),
    // 夥伴
    'w-people-36': [].concat(
      P(
        {
          shirt: C.red,
          pants: C.blue,
          hair: C.ink,
          arms: [
            [
              [410, 385],
              [360, 500],
              [355, 600],
            ],
            [
              [590, 385],
              [680, 380],
              [740, 330],
            ],
          ],
        },
        -230,
        20,
        0.85,
      ),
      P(
        {
          shirt: C.green,
          pants: C.ink,
          hair: C.brown,
          arms: [
            [
              [410, 385],
              [320, 380],
              [260, 330],
            ],
            [
              [590, 385],
              [640, 500],
              [645, 600],
            ],
          ],
        },
        230,
        20,
        0.85,
      ),
      star(500, 290, 70, C.yellow),
      [
        [
          'none',
          'M500 170L500 130M410 200L380 170M590 200L620 170',
          { s: INK, w: 10 },
        ],
      ],
    ),
    // 對手
    'w-people-37': [].concat(
      P(
        {
          shirt: C.red,
          pants: C.ink,
          hair: C.ink,
          arms: [
            [
              [410, 385],
              [360, 500],
              [355, 600],
            ],
            [
              [590, 385],
              [680, 400],
              [740, 400],
            ],
          ],
          post: [[C.red, 'E745 400 48 48']],
        },
        -230,
        20,
        0.85,
      ),
      P(
        {
          shirt: C.blue,
          pants: C.ink,
          hair: C.brown,
          arms: [
            [
              [410, 385],
              [320, 400],
              [260, 400],
            ],
            [
              [590, 385],
              [640, 500],
              [645, 600],
            ],
          ],
          post: [[C.blue, 'E255 400 48 48']],
        },
        230,
        20,
        0.85,
      ),
      [[C.yellow, 'M520 180L450 330L500 330L460 450L570 290L515 290Z']],
    ),
    // 老闆
    'w-people-38': [].concat(
      P(
        {
          shirt: C.ink,
          pants: C.ink,
          hair: C.ink,
          arms: 'cross',
          tie: C.red,
          stache: 1,
          post: [[C.paper, 'M470 345L500 380L530 345Z']],
        },
        -100,
        0,
        1,
      ),
      [
        [C.yellow, 'E760 780 70 26'],
        [C.yellow, 'E760 740 70 26'],
        [C.yellow, 'E760 700 70 26'],
        [C.orange, 'E760 660 70 26'],
      ],
      G(880, C.violet),
    ),
    // 小學生
    'w-people-39': [].concat(
      [[C.red, 'R590 430 140 190 36']],
      P(
        {
          shirt: C.paper,
          pants: C.blue,
          hair: C.ink,
          hs: 'cap',
          capColor: C.yellow,
          arms: 'holdR',
          post: [
            [C.orange, 'R590 450 20 160'],
            [C.yellow, 'R628 410 26 120 6'],
            [C.pink, 'R628 400 26 20'],
          ],
        },
        0,
        60,
        0.82,
      ),
      G(850, C.mint),
    ),
    // 大學生
    'w-people-40': [].concat(
      P(
        {
          shirt: C.violet,
          pants: C.blue,
          hair: C.brown,
          arms: 'both',
          post: [
            [C.red, 'R400 500 200 40 6'],
            [C.sky, 'R410 465 180 35 6'],
            [C.yellow, 'R400 430 200 35 6'],
          ],
        },
        0,
        0,
        1,
      ),
      [[C.violet, 'R250 880 500 20 6']],
    ),
    // 畢業生
    'w-people-41': [].concat(
      P(
        {
          shirt: C.ink,
          pants: C.ink,
          hair: C.brown,
          arms: 'holdR',
          post: [
            [C.paper, 'R590 440 120 36 16'],
            [C.red, 'R640 436 18 44 4'],
            [C.ink, 'M500 80L650 140L500 190L350 140Z'],
            [C.ink, 'R430 150 140 50 10'],
            ['none', 'M500 140L640 150L640 220', { s: C.yellow, w: 10 }],
            [C.yellow, 'E640 230 16 16'],
          ],
        },
        0,
        40,
        0.88,
      ),
      G(870, C.mint),
    ),
    // 評審
    'w-people-42': [].concat(
      P(
        {
          shirt: C.violet,
          pants: C.ink,
          hair: C.ink,
          glasses: 1,
          arms: [
            [
              [410, 385],
              [440, 480],
              [480, 520],
            ],
            [
              [590, 385],
              [680, 330],
              [720, 250],
            ],
          ],
          post: [[C.paper, 'R620 90 200 160 12'], star(720, 170, 50, C.red)[0]],
        },
        -100,
        40,
        0.9,
      ),
      [
        [C.brown, 'R120 700 760 50 8'],
        [C.brown, 'R170 740 40 130'],
        [C.brown, 'R790 740 40 130'],
      ],
    ),
    // 保母
    'w-people-43': [].concat(
      P(
        {
          shirt: C.mint,
          pants: C.blue,
          hair: C.brown,
          hs: 'bun',
          arms: 'both',
          apron: C.paper,
          post: [
            [C.paper, 'E500 520 120 60'],
            [C.yellow, 'E440 490 40 40'],
            [C.pink, 'E440 490 40 40', { s: 'none' }],
          ],
        },
        0,
        0,
        1,
      ),
    ),
    // 鼻子
    'w-body-0': [
      [C.yellow, 'E500 500 340 360'],
      [C.ink, 'E360 360 26 34', { s: 'none' }],
      [C.ink, 'E640 360 26 34', { s: 'none' }],
      [
        'none',
        'M270 270C320 230 400 235 440 270M560 270C600 235 680 230 730 270',
        { s: C.brown, w: 16 },
      ],
      [
        C.orange,
        'M500 380C450 480 400 560 405 625C415 700 585 700 595 625C600 560 550 480 500 380Z',
      ],
      [C.ink, 'E450 645 22 16', { s: 'none' }],
      [C.ink, 'E550 645 22 16', { s: 'none' }],
      ['none', 'M390 780Q500 840 610 780', { s: INK, w: 16 }],
    ],
    // 嘴巴
    'w-body-1': [
      [
        C.red,
        'M150 500C300 380 440 420 500 450C560 420 700 380 850 500C760 740 240 740 150 500Z',
        { b: 1 },
      ],
      [C.ink, 'M230 520C400 570 600 570 770 520C700 660 300 660 230 520Z'],
      [
        C.paper,
        'M265 525C400 575 600 575 735 525L715 570C600 610 400 610 285 570Z',
      ],
      [C.pink, 'E500 625 100 36'],
      ['none', 'M500 590L500 650', { s: C.red, w: 7 }],
      [
        'none',
        'M150 500C300 380 440 420 500 450C560 420 700 380 850 500',
        { s: INK, w: 7 },
      ],
    ],
    // 耳朵
    'w-body-2': [
      [
        C.yellow,
        'M450 140C700 90 820 300 720 500C670 620 620 760 540 820C450 880 340 830 350 740C360 680 400 660 380 560C330 420 320 190 450 140Z',
        { b: 1 },
      ],
      [
        C.orange,
        'M470 480C500 430 580 450 570 520C560 600 480 590 470 480Z',
        { i: 1 },
      ],
      [
        'none',
        'M470 240C600 220 670 330 610 450C580 510 540 560 520 650',
        { s: C.orange, w: 34 },
      ],
      [
        'none',
        'M470 240C600 220 670 330 610 450C580 510 540 560 520 650',
        { s: INK, w: 7 },
      ],
      [C.orange, 'E470 500 26 50', { s: INK }],
      ['none', 'M400 650C420 700 440 720 470 735', { s: C.orange, w: 7 }],
    ],
    // 牙齒
    'w-body-3': [
      [
        C.paper,
        'M280 260C310 150 440 190 500 225C560 190 690 150 720 260C750 360 700 450 680 570C660 700 650 860 590 860C535 860 545 690 500 610C455 690 465 860 410 860C350 860 340 700 320 570C300 450 250 360 280 260Z',
        { b: 1 },
      ],
      [C.sky, 'M590 150L760 150L760 900L620 900L600 600Z', { i: 1, s: 'none' }],
      [
        'none',
        'M280 260C310 150 440 190 500 225C560 190 690 150 720 260C750 360 700 450 680 570C660 700 650 860 590 860C535 860 545 690 500 610C455 690 465 860 410 860C350 860 340 700 320 570C300 450 250 360 280 260Z',
        { s: INK, w: 7 },
      ],
      ['none', 'M360 260C380 220 420 230 440 250', { s: C.sky, w: 16 }],
      ['none', 'M500 230L500 330', { s: C.sky, w: 7 }],
      [
        'none',
        'M820 180L820 90M870 230L930 190M780 120L760 70',
        { s: C.yellow, w: 16 },
      ],
    ],
    // 腳
    'w-body-4': [
      [C.yellow, 'E410 310 56 62'],
      [C.yellow, 'E510 285 40 46'],
      [C.yellow, 'E580 310 36 42'],
      [C.yellow, 'E640 350 33 40'],
      [C.yellow, 'E690 410 30 36'],
      [
        C.yellow,
        'M340 860C270 860 260 740 290 620C320 520 345 420 370 340L640 340C710 440 740 560 710 700C690 800 650 860 580 860Z',
      ],
      [C.orange, 'E410 292 26 22', { s: 'none' }],
      [C.orange, 'E508 270 18 16', { s: 'none' }],
      [C.orange, 'E578 296 16 14', { s: 'none' }],
      ['none', 'M420 520Q500 560 600 520', { s: C.orange, w: 7 }],
    ],
    // 頭髮
    'w-body-5': [
      [C.brown, 'M180 520C180 130 820 130 820 520L820 860L180 860Z'],
      [C.yellow, 'E500 540 230 270'],
      [C.brown, 'M265 470C290 200 710 200 735 470C640 390 420 330 265 470Z'],
      [C.ink, 'E410 520 18 26', { s: 'none' }],
      [C.ink, 'E590 520 18 26', { s: 'none' }],
      ['none', 'M420 640Q500 700 580 640', { s: INK, w: 7 }],
      ['none', 'M230 600L230 800M770 600L770 800', { s: C.orange, w: 16 }],
    ],
    // 手指
    'w-body-6': [
      [C.yellow, 'R330 520 320 330 90'],
      [C.yellow, 'R330 250 70 330 35'],
      [C.yellow, 'R420 160 70 420 35'],
      [C.yellow, 'R510 190 70 390 35'],
      [C.yellow, 'R600 270 70 310 35'],
      [C.yellow, 'R330 520 320 330 90', { s: 'none' }],
      ['none', 'M650 700C730 640 790 560 800 460', { s: INK, w: 100 }],
      ['none', 'M650 700C730 640 790 560 800 460', { s: C.yellow, w: 86 }],
      [
        'none',
        'M400 560L400 600M490 560L490 600M580 560L580 600',
        { s: C.orange, w: 7 },
      ],
      ['none', 'M390 780Q500 830 610 780', { s: C.orange, w: 7 }],
    ],
    // 腳印
    'w-body-7': [].concat(
      [[C.yellow, 'R100 140 800 720 40']],
      K.T(
        [
          [C.brown, 'E330 600 70 120 -8'],
          [C.brown, 'E345 770 52 50'],
          [C.brown, 'E280 420 28 34'],
          [C.brown, 'E345 400 22 28'],
          [C.brown, 'E400 410 20 26'],
          [C.brown, 'E448 435 18 24'],
          [C.brown, 'E480 475 16 22'],
        ],
        { dx: -10, dy: 0 },
      ),
      K.T(
        [
          [C.brown, 'E330 600 70 120 -8'],
          [C.brown, 'E345 770 52 50'],
          [C.brown, 'E280 420 28 34'],
          [C.brown, 'E345 400 22 28'],
          [C.brown, 'E400 410 20 26'],
          [C.brown, 'E448 435 18 24'],
          [C.brown, 'E480 475 16 22'],
        ],
        { dx: 350, dy: -40 },
      ),
    ),
    // 眉毛
    'w-body-8': [
      [C.yellow, 'R100 230 800 600 220'],
      [C.paper, 'E310 560 115 75'],
      [C.paper, 'E690 560 115 75'],
      [C.ink, 'E320 560 48 52', { s: 'none' }],
      [C.ink, 'E680 560 48 52', { s: 'none' }],
      [C.paper, 'E335 545 14 14', { s: 'none' }],
      [C.paper, 'E695 545 14 14', { s: 'none' }],
      [
        C.brown,
        'M170 440C260 340 400 340 460 410L450 450C380 400 280 400 190 480Z',
      ],
      [
        C.brown,
        'M830 440C740 340 600 340 540 410L550 450C620 400 720 400 810 480Z',
      ],
      ['none', 'M500 600L470 700L520 710', { s: C.orange, w: 12 }],
    ],
    // 舌頭
    'w-body-9': [
      [C.yellow, 'E500 450 340 360'],
      [C.ink, 'E360 360 24 32', { s: 'none' }],
      [C.ink, 'E640 360 24 32', { s: 'none' }],
      [C.ink, 'M280 540C380 720 620 720 720 540Z'],
      [C.pink, 'M410 640L410 800C410 900 590 900 590 800L590 640Z'],
      ['none', 'M500 680L500 790', { s: C.red, w: 10 }],
      [C.orange, 'E250 500 40 28', { s: 'none' }],
      [C.orange, 'E750 500 40 28', { s: 'none' }],
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
