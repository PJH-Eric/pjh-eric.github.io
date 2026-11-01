(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C,
    INK = C.ink;
  function ln(d, col, w) {
    return ['none', d, { s: col || INK, w: w || 7 }];
  }
  function dot(x, y, r) {
    return [INK, 'E' + x + ' ' + y + ' ' + r + ' ' + r, { s: 'none' }];
  }
  function el(f, x, y, rx, ry, rot) {
    return [
      f,
      'E' + x + ' ' + y + ' ' + rx + ' ' + ry + (rot ? ' ' + rot : ''),
    ];
  }
  function rc(f, x, y, w, h, r) {
    return [f, 'R' + x + ' ' + y + ' ' + w + ' ' + h + ' ' + (r || 0)];
  }
  function pg(f, d, o) {
    return [f, d, o || {}];
  }
  function cat() {
    var a = [];
    for (var i = 0; i < arguments.length; i++) {
      a = a.concat(arguments[i]);
    }
    return a;
  }

  // simple chunky person. offsets are relative to centre x.
  function guy(o) {
    var x = o.x || 500,
      sk = o.skin || C.yellow,
      sh = o.shirt || C.blue,
      pa = o.pants || C.ink;
    var hy = o.hy || 250;
    function P(p) {
      return [x + p[0], p[1]];
    }
    var aL = o.aL || [
      [-100, 480],
      [-100, 590],
    ];
    var aR = o.aR || [
      [100, 480],
      [100, 590],
    ];
    var L = [];
    if (o.dress) {
      L.push(
        pg(
          o.dress,
          'M' +
            (x - 90) +
            ' 560L' +
            (x - 190) +
            ' 880L' +
            (x + 190) +
            ' 880L' +
            (x + 90) +
            ' 560Z',
        ),
      );
    } else {
      L = L.concat(
        K.tube([P([-50, 600]), P([-55, 855])], 66, pa),
        K.tube([P([50, 600]), P([55, 855])], 66, pa),
      );
      L.push(
        el(o.shoe || INK, x - 62, 872, 52, 26),
        el(o.shoe || INK, x + 62, 872, 52, 26),
      );
    }
    L.push(rc(sh, x - 100, 330, 200, o.dress ? 260 : 290, 50));
    if (o.mid) L = L.concat(o.mid);
    L = L.concat(
      K.tube([[x - 88, 375], P(aL[0]), P(aL[1])], 52, sh),
      K.tube([[x + 88, 375], P(aR[0]), P(aR[1])], 52, sh),
    );
    L.push(
      el(sk, x + aL[1][0], aL[1][1], 32, 32),
      el(sk, x + aR[1][0], aR[1][1], 32, 32),
    );
    L.push(rc(sk, x - 28, 295, 56, 60, 10));
    if (o.hair && o.long) L.push(rc(o.hair, x - 98, 190, 196, 250, 60));
    L.push(el(sk, x, hy, 82, 86));
    if (o.hair && o.hairStyle !== 'none')
      L.push(
        pg(
          o.hair,
          'M' +
            (x - 88) +
            ' ' +
            (hy + 10) +
            'C' +
            (x - 100) +
            ' ' +
            (hy - 130) +
            ' ' +
            (x + 100) +
            ' ' +
            (hy - 130) +
            ' ' +
            (x + 88) +
            ' ' +
            (hy + 10) +
            'C' +
            (x + 60) +
            ' ' +
            (hy - 50) +
            ' ' +
            (x - 60) +
            ' ' +
            (hy - 50) +
            ' ' +
            (x - 88) +
            ' ' +
            (hy + 10) +
            'Z',
        ),
      );
    if (o.bun) L.push(el(o.hair, x, hy - 110, 38, 38));
    L.push(
      dot(x - 28, hy + 8, 9),
      dot(x + 28, hy + 8, 9),
      ln(
        'M' +
          (x - 24) +
          ' ' +
          (hy + 45) +
          'Q' +
          x +
          ' ' +
          (hy + 68) +
          ' ' +
          (x + 24) +
          ' ' +
          (hy + 45),
      ),
    );
    if (o.top) L = L.concat(o.top);
    return L;
  }
  function glasses(x, y) {
    return cat([
      ln(
        'M' +
          (x - 62) +
          ' ' +
          y +
          'a30 28 0 1 0 60 0a30 28 0 1 0 -60 0M' +
          (x + 2) +
          ' ' +
          y +
          'a30 28 0 1 0 60 0a30 28 0 1 0 -60 0M' +
          (x - 2) +
          ' ' +
          y +
          'L' +
          (x + 2) +
          ' ' +
          y,
        INK,
        7,
      ),
    ]);
  }
  function ground(col, y) {
    return [
      rc(col, 0, y, 1000, 1000 - y),
      ln('M0 ' + y + 'L1000 ' + y, INK, 7),
    ];
  }
  function wall(col) {
    return [rc(col, 0, 0, 1000, 1000, 0)];
  }
  function stars(pts, c) {
    var a = [];
    pts.forEach(function (p) {
      a.push(
        pg(
          c || C.yellow,
          'M' +
            p[0] +
            ' ' +
            (p[1] - 30) +
            'L' +
            (p[0] + 9) +
            ' ' +
            (p[1] - 9) +
            'L' +
            (p[0] + 30) +
            ' ' +
            p[1] +
            'L' +
            (p[0] + 9) +
            ' ' +
            (p[1] + 9) +
            'L' +
            p[0] +
            ' ' +
            (p[1] + 30) +
            'L' +
            (p[0] - 9) +
            ' ' +
            (p[1] + 9) +
            'L' +
            (p[0] - 30) +
            ' ' +
            p[1] +
            'L' +
            (p[0] - 9) +
            ' ' +
            (p[1] - 9) +
            'Z',
          { w: 5 },
        ),
      );
    });
    return a;
  }
  function bubbles(pts) {
    return pts.map(function (p) {
      return [
        C.paper,
        'E' + p[0] + ' ' + p[1] + ' ' + p[2] + ' ' + p[2],
        { w: 7 },
      ];
    });
  }
  function cap(col, x, y) {
    return [
      pg(
        col,
        'M' +
          (x - 92) +
          ' ' +
          (y - 5) +
          'C' +
          (x - 95) +
          ' ' +
          (y - 120) +
          ' ' +
          (x + 95) +
          ' ' +
          (y - 120) +
          ' ' +
          (x + 92) +
          ' ' +
          (y - 5) +
          'Z',
      ),
      rc(col, x - 40, y - 15, 190, 24, 12),
    ];
  }
  function chefhat(x, y) {
    return [
      rc(C.paper, x - 70, y - 70, 140, 80, 10),
      el(C.paper, x - 55, y - 100, 45, 40),
      el(C.paper, x + 55, y - 100, 45, 40),
      el(C.paper, x, y - 130, 55, 50),
      rc(C.paper, x - 70, y - 70, 140, 80, 10),
    ];
  }
  function book(x, y, w, h, c) {
    return [
      rc(c, x, y, w, h, 6),
      ln(
        'M' + (x + 8) + ' ' + (y + 12) + 'L' + (x + 8) + ' ' + (y + h - 12),
        C.paper,
        7,
      ),
    ];
  }

  Object.assign(R, {
    // 1120 空服員
    'w-job-49': cat(
      wall(C.sky),
      [
        el(C.paper, 300, 150, 190, 48),
        pg(C.violet, 'M250 150L150 90L190 90L330 150Z'),
        pg(C.paper, 'M300 160L400 260L330 260L240 170Z'),
      ],
      guy({
        x: 500,
        shirt: C.blue,
        pants: C.blue,
        shoe: C.ink,
        hair: C.brown,
        long: 1,
        skin: C.yellow,
        aR: [
          [140, 440],
          [210, 330],
        ],
        mid: [pg(C.red, 'M450 335L500 410L550 335Z')],
        top: cat(cap(C.blue, 500, 190)),
      }),
      [
        rc(C.red, 720, 600, 130, 220, 20),
        ln('M785 600L785 480', INK, 16),
        rc(C.violet, 740, 640, 90, 50, 8),
        el(C.ink, 750, 840, 18, 18),
        el(C.ink, 820, 840, 18, 18),
      ],
    ),
    // 1121 潛水員
    'w-job-50': cat(
      wall(C.sky),
      bubbles([
        [760, 200, 40],
        [820, 330, 26],
        [740, 430, 18],
        [200, 240, 24],
      ]),
      [rc(C.orange, 560, 330, 90, 260, 40)],
      guy({
        x: 500,
        shirt: C.ink,
        pants: C.ink,
        shoe: C.yellow,
        skin: C.yellow,
        hair: C.ink,
        hairStyle: 'none',
        top: [
          rc(C.sky, 435, 215, 130, 75, 30),
          ln('M430 250L400 250', INK, 16),
        ],
      }),
      [
        pg(C.yellow, 'M440 890L330 940L330 880L440 850Z'),
        pg(C.yellow, 'M560 890L670 940L670 880L560 850Z'),
      ],
    ),
    // 1122 牙醫
    'w-job-51': cat(
      wall('#FFFDF8'),
      rc(C.sky, 0, 700, 1000, 300, 0),
      [
        pg(
          C.paper,
          'M720 300C650 260 640 380 670 470C690 560 700 700 730 700C760 700 750 600 770 600C790 600 780 700 810 700C840 700 850 560 870 470C900 380 890 260 820 300C790 315 750 315 720 300Z',
        ),
        ln('M730 440Q770 470 810 440', C.red, 7),
      ],
      guy({
        x: 330,
        shirt: C.paper,
        pants: C.blue,
        hair: C.brown,
        aR: [
          [100, 480],
          [160, 390],
        ],
        hy: 250,
        mid: [pg(C.green, 'M300 335L330 420L360 335Z')],
        top: [
          rc(C.sky, 275, 280, 110, 70, 28),
          ln('M230 270L210 250', INK, 7),
          ln('M170 330L170 420', INK, 16),
          el(C.paper, 170, 330, 26, 26),
        ],
      }),
    ),
    // 1123 甜點師
    'w-job-52': cat(
      wall(C.pink),
      guy({
        x: 500,
        shirt: C.paper,
        pants: C.ink,
        hair: C.brown,
        hairStyle: 'none',
        top: chefhat(500, 190),
        aL: [
          [-140, 520],
          [-100, 620],
        ],
        aR: [
          [140, 520],
          [100, 620],
        ],
      }),
      [
        rc(C.brown, 0, 640, 1000, 360, 0),
        ln('M0 640L1000 640', INK, 7),
        rc(C.paper, 300, 620, 400, 60, 20),
        rc(C.pink, 340, 530, 320, 100, 20),
        rc(C.yellow, 370, 460, 260, 80, 20),
        el(C.red, 500, 440, 28, 28),
        ln('M500 415L520 380', C.green, 16),
        rc(C.paper, 280, 590, 440, 24, 12),
      ],
    ),
    // 1124 美容師
    'w-job-53': cat(
      wall(C.violet),
      guy({
        x: 400,
        shirt: C.pink,
        pants: C.ink,
        hair: C.brown,
        long: 1,
        aR: [
          [110, 440],
          [190, 350],
        ],
        top: [
          ln('M590 340L650 280', C.brown, 16),
          pg(C.red, 'M640 300L660 240L690 250L670 310Z'),
        ],
      }),
      [
        ln('M780 800L780 600', INK, 34),
        ln('M780 800L780 600', C.brown, 16),
        el(C.sky, 780, 480, 130, 150),
        el(C.paper, 740, 430, 22, 50, 20),
      ],
    ),
    // 1125 插畫家
    'w-job-54': cat(
      wall(C.paper),
      [
        ln('M640 900L720 480M880 900L800 480M760 900L760 600', INK, 34),
        rc(C.paper, 600, 250, 300, 340, 8),
        el(C.yellow, 690, 360, 40, 40),
        pg(C.orange, 'M690 520L740 450L790 520Z'),
        rc(C.orange, 705, 490, 30, 30),
        ln('M620 560Q700 520 780 560T880 540', C.green, 16),
      ],
      guy({
        x: 330,
        shirt: C.mint,
        pants: C.blue,
        hair: C.ink,
        aR: [
          [110, 420],
          [290, 400],
        ],
        top: [
          pg(C.red, 'M240 190C250 110 410 110 420 190Z'),
          el(C.red, 330, 120, 20, 14),
          ln('M610 400L650 380', C.yellow, 16),
        ],
      }),
      [pg(C.yellow, 'M600 410L640 395L650 420Z', {})],
    ),
    // 1126 主持人
    'w-job-55': cat(
      wall(C.red),
      [
        pg(C.brown, 'M0 0L330 0C250 300 150 500 0 700Z'),
        pg(C.brown, 'M1000 0L670 0C750 300 850 500 1000 700Z'),
      ],
      ground(C.violet, 800),
      guy({
        x: 500,
        shirt: C.paper,
        pants: C.ink,
        hair: C.ink,
        aR: [
          [110, 420],
          [130, 300],
        ],
        mid: [
          pg(C.ink, 'M420 335L500 560L580 335Z'),
          pg(C.red, 'M485 340L515 340L520 450L480 450Z'),
        ],
        top: [ln('M630 300L630 240', INK, 16), dot(630, 215, 32)],
      }),
    ),
    // 1127 工人
    'w-job-56': cat(
      wall(C.sky),
      ground(C.yellow, 800),
      [
        rc(C.red, 700, 700, 120, 50, 6),
        rc(C.red, 760, 650, 120, 50, 6),
        rc(C.red, 640, 750, 120, 50, 6),
      ],
      guy({
        x: 400,
        shirt: C.orange,
        pants: C.blue,
        hair: C.brown,
        aR: [
          [130, 430],
          [220, 330],
        ],
        mid: [rc(C.yellow, 330, 360, 140, 30, 4)],
        top: [
          pg(C.yellow, 'M308 210C312 100 488 100 492 210Z'),
          rc(C.yellow, 290, 200, 220, 24, 12),
          ln('M600 400L690 280', C.brown, 34),
          rc(C.violet, 640, 220, 130, 70, 8),
        ],
      }),
    ),
    // 1128 牧羊人
    'w-job-57': cat(
      wall(C.sky),
      el(C.paper, 750, 150, 130, 50),
      ground(C.mint, 720),
      [
        el(C.paper, 760, 780, 110, 75),
        el(C.paper, 690, 740, 60, 50),
        el(C.ink, 650, 740, 26, 32),
        ln('M700 850L700 900M820 850L820 900', INK, 16),
        el(C.paper, 880, 700, 80, 55),
        el(C.ink, 835, 705, 22, 26),
      ],
      guy({
        x: 300,
        shirt: C.green,
        pants: C.brown,
        hair: C.ink,
        aR: [
          [110, 430],
          [120, 540],
        ],
        top: cat(cap(C.brown, 300, 190), [
          ln('M450 900L450 380Q450 300 520 310', C.brown, 16),
        ]),
      }),
    ),
    // 1129 秘書
    'w-job-58': cat(
      wall(C.paper),
      guy({
        x: 400,
        shirt: C.pink,
        pants: C.ink,
        hair: C.brown,
        long: 1,
        aL: [
          [-110, 520],
          [-60, 640],
        ],
        aR: [
          [110, 520],
          [60, 640],
        ],
        top: glasses(400, 258),
      }),
      [
        rc(C.brown, 100, 640, 800, 40, 8),
        ln('M160 680L160 920M840 680L840 920', INK, 34),
        rc(C.ink, 570, 440, 260, 180, 14),
        rc(C.sky, 590, 460, 220, 140, 6),
        rc(C.violet, 665, 620, 70, 20, 4),
        rc(C.red, 860, 590, 90, 50, 14),
        pg(C.red, 'M860 590L950 590L930 550L880 550Z'),
        rc(C.paper, 150, 600, 120, 36, 4),
      ],
    ),
    // 1130 心理師
    'w-job-59': cat(
      wall(C.paper),
      ground(C.sky, 800),
      [
        rc(C.violet, 90, 600, 520, 130, 40),
        rc(C.violet, 70, 520, 90, 210, 30),
        rc(C.violet, 560, 560, 70, 170, 30),
        ln('M130 730L130 800M570 730L570 800', INK, 16),
        rc(C.red, 260, 520, 300, 80, 36),
        el(C.yellow, 220, 560, 55, 55),
        pg(C.orange, 'M150 520C150 440 270 450 270 520Z'),
        rc(C.blue, 290, 480, 240, 60, 30),
        ln('M530 560L570 590', INK, 16),
        rc(C.paper, 760, 400, 70, 60, 6),
        el(C.paper, 140, 330, 70, 50),
        ln('M170 370L190 410', INK, 7),
        el(C.paper, 195, 425, 12, 12),
        ln('M120 320Q140 290 160 320T150 340', INK, 7),
      ],
      guy({
        x: 780,
        shirt: C.green,
        pants: C.ink,
        hair: C.ink,
        aL: [
          [-90, 520],
          [-10, 540],
        ],
        aR: [
          [100, 500],
          [20, 530],
        ],
        hy: 250,
        top: cat(glasses(780, 258), [
          rc(C.paper, 735, 460, 90, 130, 8),
          ln('M755 490L805 490M755 520L805 520M755 550L795 550', INK, 7),
        ]),
      }),
    ),
    // 1131 雕刻家
    'w-job-60': cat(
      wall(C.paper),
      ground(C.sky, 800),
      [
        rc(C.violet, 550, 520, 340, 330, 12),
        el(C.violet, 720, 430, 80, 100),
        ln('M720 520L720 540', INK, 7),
        pg(C.violet, 'M560 520L590 440L640 470L680 400Z'),
        el(C.violet, 930, 880, 24, 14),
        el(C.violet, 470, 880, 24, 14),
        el(C.violet, 520, 850, 14, 10),
      ],
      guy({
        x: 300,
        shirt: C.orange,
        pants: C.ink,
        hair: C.brown,
        aL: [
          [-110, 480],
          [-120, 590],
        ],
        aR: [
          [130, 430],
          [220, 400],
        ],
        top: [
          ln('M550 440L640 400', INK, 16),
          rc(C.violet, 540, 390, 40, 24, 4),
          rc(C.brown, 150, 410, 10, 10, 2),
        ],
      }),
    ),
    // 1132 書法家
    'w-job-61': cat(
      wall(C.paper),
      guy({
        x: 300,
        shirt: C.violet,
        pants: C.ink,
        hair: C.ink,
        hairStyle: 'none',
        aR: [
          [120, 430],
          [230, 500],
        ],
        top: [
          ln('M530 500L610 640', C.brown, 16),
          pg(C.ink, 'M600 630L630 640L610 700L590 660Z'),
        ],
      }),
      [
        rc(C.brown, 100, 690, 800, 40, 8),
        ln('M160 730L160 920M840 730L840 920', INK, 34),
        rc(C.paper, 480, 640, 400, 60, 4),
        ln('M520 670L640 660M700 650Q720 690 760 680M800 650L830 690', INK, 34),
        rc(C.ink, 130, 650, 100, 40, 10),
      ],
    ),
    // 1133 圖書館員
    'w-job-62': cat(
      wall(C.orange),
      rc(C.brown, 60, 80, 880, 700, 8),
      [
        rc(C.paper, 90, 110, 820, 150, 4),
        rc(C.paper, 90, 300, 820, 150, 4),
        rc(C.paper, 90, 490, 820, 150, 4),
      ],
      (function () {
        var a = [],
          cols = [
            C.red,
            C.blue,
            C.green,
            C.yellow,
            C.violet,
            C.pink,
            C.sky,
            C.mint,
          ],
          r,
          i;
        for (r = 0; r < 3; r++) {
          for (i = 0; i < 9; i++) {
            a.push(
              rc(
                cols[(i + r * 3) % 8],
                100 + i * 88,
                130 + r * 190,
                66,
                130,
                6,
              ),
            );
          }
        }
        return a;
      })(),
      guy({
        x: 500,
        shirt: C.mint,
        pants: C.ink,
        hair: C.brown,
        bun: 1,
        hairStyle: 'x',
        aL: [
          [-120, 500],
          [-60, 520],
        ],
        aR: [
          [120, 500],
          [60, 520],
        ],
        top: cat(glasses(500, 258), book(440, 500, 120, 90, C.red)),
      }),
    ),
    // 1134 考古學家
    'w-job-63': cat(
      wall(C.sky),
      ground(C.brown, 600),
      [rc('#E7C263', 0, 600, 1000, 60, 0)],
      [
        pg(
          C.orange,
          'M620 700C560 760 580 860 640 880L760 880C820 860 840 760 780 700Z',
        ),
        rc(C.orange, 660, 660, 80, 50, 8),
        ln('M600 780L810 780', C.red, 16),
        pg(C.paper, 'M860 800L930 770L950 800L890 830Z'),
      ],
      guy({
        x: 300,
        shirt: C.green,
        pants: C.brown,
        hair: C.ink,
        aR: [
          [120, 520],
          [220, 640],
        ],
        top: [
          pg(C.orange, 'M215 215C220 120 380 120 385 215Z'),
          rc(C.orange, 170, 205, 260, 26, 13),
          ln('M540 640L600 700', C.brown, 16),
          pg(C.yellow, 'M595 690L620 730L580 720Z'),
        ],
      }),
    ),
    // 1135 探險家
    'w-job-64': cat(
      wall(C.sky),
      [
        pg(C.violet, 'M0 700L260 280L460 700Z'),
        pg(C.paper, 'M260 280L325 390L260 370L200 390Z'),
        pg(C.blue, 'M300 700L640 200L1000 700Z'),
        pg(C.paper, 'M640 200L710 330L640 310L570 335Z'),
      ],
      ground(C.mint, 700),
      [rc(C.orange, 520, 360, 110, 260, 40)],
      guy({
        x: 400,
        shirt: C.red,
        pants: C.brown,
        hair: C.ink,
        aL: [
          [-130, 460],
          [-200, 560],
        ],
        aR: [
          [120, 440],
          [180, 380],
        ],
        top: [
          pg(C.green, 'M315 215C320 120 480 120 485 215Z'),
          rc(C.green, 270, 205, 260, 26, 13),
          ln('M200 560L190 900', C.brown, 16),
          ln('M240 330L330 330', C.brown, 7),
        ],
      }),
      [
        pg(
          C.paper,
          'M520 280L570 260L610 290L660 270L650 340L610 360L570 330L525 350Z',
          { w: 7 },
        ),
        ln('M550 290L560 320M600 300L630 320', INK, 7),
      ],
    ),
    // 1136 銀行員
    'w-job-65': cat(
      wall(C.mint),
      [
        pg(C.paper, 'M60 150L500 50L940 150Z'),
        rc(C.paper, 100, 150, 800, 40, 4),
        rc(C.paper, 140, 190, 60, 380, 4),
        rc(C.paper, 800, 190, 60, 380, 4),
      ],
      guy({
        x: 500,
        shirt: C.paper,
        pants: C.ink,
        hair: C.ink,
        aL: [
          [-110, 520],
          [-60, 630],
        ],
        aR: [
          [110, 520],
          [60, 630],
        ],
        mid: [pg(C.red, 'M485 340L515 340L525 520L500 545L475 520Z')],
      }),
      [
        rc(C.brown, 60, 640, 880, 360, 0),
        ln('M60 640L940 640', INK, 7),
        rc(C.sky, 200, 260, 600, 380, 0),
      ].slice(0, 0),
      [
        rc(C.brown, 60, 640, 880, 360, 0),
        ln('M60 640L940 640', INK, 7),
        rc(C.yellow, 130, 590, 90, 24, 12),
        rc(C.yellow, 130, 560, 90, 24, 12),
        rc(C.yellow, 130, 530, 90, 24, 12),
        rc(C.green, 700, 590, 160, 40, 4),
        rc(C.paper, 720, 560, 120, 36, 4),
      ],
    ),
    // 1137 調酒師
    'w-job-66': cat(
      wall(C.violet),
      rc(C.brown, 60, 150, 880, 30, 6),
      [
        rc(C.red, 110, 70, 50, 80, 12),
        rc(C.green, 220, 50, 50, 100, 12),
        rc(C.yellow, 330, 70, 50, 80, 12),
        rc(C.sky, 700, 60, 50, 90, 12),
        rc(C.orange, 810, 80, 50, 70, 12),
      ],
      guy({
        x: 400,
        shirt: C.paper,
        pants: C.ink,
        hair: C.brown,
        aL: [
          [-110, 520],
          [-60, 630],
        ],
        aR: [
          [130, 420],
          [150, 290],
        ],
        mid: [pg(C.ink, 'M330 335L400 560L470 335Z')],
        top: [
          pg(C.violet, 'M530 200L570 200L580 300L520 300Z'),
          rc(C.violet, 515, 300, 70, 90, 12),
          rc(C.violet, 530, 175, 40, 30, 6),
        ]
          .slice(0, 0)
          .concat([]),
      }),
      [
        pg(C.violet, 'M520 200L580 200L590 300L510 300Z'),
        rc(C.violet, 505, 300, 100, 110, 16),
        rc(C.paper, 520, 175, 60, 30, 8),
      ],
      [
        rc(C.brown, 0, 640, 1000, 360, 0),
        ln('M0 640L1000 640', INK, 7),
        pg(C.sky, 'M650 460L830 460L740 570Z'),
        pg(C.orange, 'M665 470L815 470L740 560Z', { s: 'none' }),
        ln('M740 570L740 640', INK, 16),
        ln('M680 640L800 640', INK, 16),
        el(C.red, 800, 440, 20, 20),
      ],
    ),
    // 1138 花藝師
    'w-job-67': cat(
      wall(C.pink),
      [
        rc(C.brown, 0, 700, 1000, 300, 0),
        ln('M0 700L1000 700', INK, 7),
        ln('M780 560L770 420M800 560L850 410M760 560L700 440', C.green, 16),
        rc(C.sky, 710, 560, 140, 140, 20),
        el(C.red, 770, 400, 40, 40),
        el(C.yellow, 850, 390, 36, 36),
        el(C.violet, 700, 420, 36, 36),
      ],
      guy({
        x: 330,
        shirt: C.paper,
        pants: C.ink,
        hair: C.brown,
        long: 1,
        aL: [
          [-110, 520],
          [-40, 480],
        ],
        aR: [
          [110, 520],
          [40, 470],
        ],
        mid: [pg(C.green, 'M270 400L390 400L400 610L260 610Z')],
        top: [
          ln(
            'M330 470L300 360M330 470L350 350M330 470L260 380M330 470L400 380',
            C.green,
            16,
          ),
          el(C.red, 300, 330, 40, 40),
          el(C.yellow, 350, 320, 36, 36),
          el(C.violet, 255, 360, 34, 34),
          el(C.orange, 405, 360, 34, 34),
          pg(C.pink, 'M290 470L370 470L350 520L310 520Z'),
        ],
      }),
    ),
    // 1139 按摩師
    'w-job-68': cat(
      wall(C.sky),
      ground(C.paper, 860),
      [
        rc(C.violet, 100, 560, 800, 60, 12),
        ln('M160 620L160 860M840 620L840 860', INK, 34),
        rc(C.pink, 160, 470, 520, 100, 40),
        el(C.yellow, 750, 500, 70, 70),
        el(C.brown, 770, 480, 62, 60),
        rc(C.blue, 640, 530, 220, 40, 10),
      ],
      guy({
        x: 420,
        shirt: C.mint,
        pants: C.ink,
        hair: C.ink,
        hy: 190,
        aL: [
          [-80, 400],
          [-30, 470],
        ],
        aR: [
          [80, 400],
          [30, 470],
        ],
      }).slice(0, 0),
      (function () {
        var g = guy({
          x: 420,
          shirt: C.mint,
          pants: C.ink,
          hair: C.ink,
          hy: 190,
          aL: [
            [-110, 400],
            [-20, 470],
          ],
          aR: [
            [110, 400],
            [80, 460],
          ],
        });
        return K.T(g, { dy: -80 });
      })(),
    ),
    // 1140 瑜珈老師
    'w-job-69': cat(
      wall(C.paper),
      [el(C.yellow, 780, 190, 90, 90)],
      ground(C.sky, 880),
      [rc(C.violet, 200, 880, 600, 50, 20)],
      K.tube(
        [
          [500, 560],
          [500, 880],
        ],
        66,
        C.pink,
      ),
      [el(C.ink, 520, 888, 55, 20)],
      K.tube(
        [
          [540, 560],
          [650, 650],
          [520, 740],
        ],
        66,
        C.pink,
      ),
      [rc(C.pink, 400, 330, 200, 290, 50)],
      K.tube(
        [
          [420, 390],
          [440, 250],
          [500, 130],
        ],
        52,
        C.pink,
      ),
      K.tube(
        [
          [580, 390],
          [560, 250],
          [500, 130],
        ],
        52,
        C.pink,
      ),
      [el(C.yellow, 500, 115, 32, 32)],
      [rc(C.yellow, 428, 325, 144, 40, 6).slice(0, 0)].slice(0, 0),
      [
        rc(C.yellow, 460, 290, 80, 60, 10),
        el(C.yellow, 500, 240, 76, 80),
        pg(
          C.brown,
          'M426 250C420 140 580 140 574 250C550 190 450 190 426 250Z',
        ),
        el(C.brown, 500, 150, 34, 34),
        dot(472, 248, 8),
        dot(528, 248, 8),
        ln('M476 280Q500 300 524 280'),
      ],
    ),
    // 1141 復健師
    'w-job-70': cat(
      wall(C.mint),
      ground(C.paper, 860),
      guy({
        x: 330,
        shirt: C.orange,
        pants: C.ink,
        hair: C.brown,
        aL: [
          [-120, 480],
          [-190, 600],
        ],
        aR: [
          [120, 480],
          [160, 600],
        ],
        top: [
          ln('M140 400L200 900', C.violet, 16),
          ln('M520 400L480 900', C.violet, 16),
          rc(C.paper, 275, 625, 70, 190, 14),
          ln('M280 660L340 660M280 700L340 700M280 740L340 740', INK, 7),
        ],
      }),
      guy({
        x: 770,
        shirt: C.paper,
        pants: C.blue,
        hair: C.ink,
        aL: [
          [-110, 480],
          [-190, 480],
        ],
        aR: [
          [110, 520],
          [80, 600],
        ],
        mid: [rc(C.sky, 700, 330, 140, 40, 4).slice(0, 0)].slice(0, 0),
      }).slice(0, 0),
      guy({
        x: 790,
        shirt: C.paper,
        pants: C.blue,
        hair: C.ink,
        aL: [
          [-110, 480],
          [-250, 460],
        ],
        aR: [
          [110, 520],
          [80, 610],
        ],
        top: [pg(C.green, 'M750 335L790 400L830 335Z', {})],
      }),
    ),
    // 1142 漫畫家
    'w-job-71': cat(
      wall(C.yellow),
      [
        rc(C.paper, 480, 180, 440, 480, 8),
        rc(C.paper, 500, 200, 190, 200, 0),
        rc(C.paper, 710, 200, 190, 130, 0),
        rc(C.paper, 710, 350, 190, 290, 0),
        rc(C.paper, 500, 420, 190, 220, 0),
        el(C.paper, 600, 290, 60, 40),
        pg(C.paper, 'M580 320L560 360L610 330Z'),
        el(C.orange, 800, 270, 28, 28),
        rc(C.red, 745, 410, 110, 90, 6),
        ln('M520 580Q600 500 670 600', INK, 7),
        el(C.pink, 600, 540, 30, 30),
      ],
      guy({
        x: 260,
        shirt: C.red,
        pants: C.blue,
        hair: C.ink,
        aR: [
          [120, 520],
          [210, 590],
        ],
        top: [ln('M440 600L520 620', INK, 16)],
      }),
      [
        rc(C.brown, 40, 700, 920, 40, 8),
        ln('M100 740L100 920M900 740L900 920', INK, 34),
        rc(C.paper, 140, 670, 140, 30, 4),
      ],
    ),
    // 1143 陶藝家
    'w-job-72': cat(
      wall(C.paper),
      [
        rc(C.brown, 640, 120, 300, 24, 6),
        pg(C.orange, 'M690 120C650 70 700 20 750 20C800 20 830 70 800 120Z'),
        pg(C.red, 'M860 120C830 80 850 50 880 50C910 50 920 80 910 120Z'),
      ],
      [
        rc(C.brown, 220, 760, 380, 160, 14),
        rc(C.violet, 150, 720, 520, 50, 20),
        pg(
          C.orange,
          'M300 720C260 660 280 580 330 540C310 500 330 460 360 440L460 440C490 460 510 500 490 540C540 580 560 660 520 720Z',
        ),
      ],
      guy({
        x: 700,
        shirt: C.paper,
        pants: C.blue,
        hair: C.brown,
        aL: [
          [-130, 520],
          [-210, 620],
        ],
        aR: [
          [120, 520],
          [160, 640],
        ],
        hy: 250,
        mid: [rc(C.green, 640, 360, 120, 280, 20)],
      }).slice(0, 0),
      guy({
        x: 760,
        shirt: C.sky,
        pants: C.blue,
        hair: C.brown,
        aL: [
          [-130, 500],
          [-250, 580],
        ],
        aR: [
          [130, 520],
          [90, 640],
        ],
        mid: [pg(C.orange, 'M690 400L830 400L850 600L670 600Z')],
      }),
      [
        pg(
          C.orange,
          'M300 720C260 660 280 580 330 540C310 500 330 460 360 440L460 440C490 460 510 500 490 540C540 580 560 660 520 720Z',
        ),
        ln('M330 520L490 520M290 640L525 640', C.brown, 7),
      ],
    ),
    // 1144 翻譯員
    'w-job-73': cat(
      wall(C.paper),
      [
        pg(C.paper, 'M60 80L400 80L400 330L300 330L250 400L250 330L60 330Z', {
          w: 7,
        }),
        el(C.red, 160, 200, 40, 40),
        pg(
          C.paper,
          'M600 80L940 80L940 330L800 330L800 400L750 330L600 330Z',
          {},
        ),
        rc(C.blue, 720, 150, 80, 80, 0),
        ln(
          'M430 200L570 200M540 170L570 200L540 230M460 170L430 200L460 230',
          INK,
          16,
        ),
      ],
      guy({
        x: 500,
        shirt: C.violet,
        pants: C.ink,
        hair: C.brown,
        long: 1,
        hy: 400,
        aL: [
          [-110, 590],
          [-60, 700],
        ],
        aR: [
          [110, 590],
          [60, 700],
        ],
      }).slice(0, 0),
      K.T(
        guy({
          x: 500,
          shirt: C.violet,
          pants: C.ink,
          hair: C.brown,
          long: 1,
          aL: [
            [-110, 520],
            [-60, 640],
          ],
          aR: [
            [110, 520],
            [60, 640],
          ],
          top: [
            ln('M418 240C410 110 590 110 582 240', INK, 16),
            el(C.sky, 415, 260, 24, 36),
            el(C.sky, 585, 260, 24, 36),
            ln('M585 290Q570 340 530 320', INK, 7),
            dot(525, 320, 14),
          ],
        }),
        { dy: 100, s: 0.85, cx: 500, cy: 900, dx: 0 },
      ),
      [
        rc(C.brown, 150, 740, 700, 40, 8),
        ln('M200 780L200 940M800 780L800 940', INK, 34),
        el(C.sky, 740, 640, 70, 70),
        ln('M700 600Q760 650 730 700', C.green, 16),
        ln('M670 640L810 640', INK, 7),
      ],
    ),
    // 1145 模特兒
    'w-job-74': cat(
      wall(C.violet),
      [
        pg(C.paper, 'M0 1000L100 700L900 700L1000 1000Z'),
        pg(C.yellow, 'M160 0L260 0L450 330L300 330Z', { s: 'none' }).slice(
          0,
          0,
        ),
      ].slice(0, 0),
      [rc(C.paper, 0, 880, 1000, 120, 0), ln('M0 880L1000 880', INK, 7)],
      guy({
        x: 500,
        shirt: C.pink,
        pants: C.ink,
        hair: C.ink,
        long: 1,
        dress: C.pink,
        aL: [
          [-130, 520],
          [-170, 480],
        ],
        aR: [
          [130, 520],
          [190, 560],
        ],
        hy: 230,
        top: [
          rc(C.ink, 440, 235, 50, 28, 12),
          rc(C.ink, 510, 235, 50, 28, 12),
          ln('M490 245L510 245', INK, 7),
        ],
      }),
      [el(C.red, 400, 880, 30, 12), el(C.red, 600, 880, 30, 12)].slice(0, 0),
      [
        rc(C.ink, 80, 800, 130, 90, 14),
        el(C.sky, 145, 845, 30, 30),
        pg(C.yellow, 'M260 780L300 740L290 790L340 770L300 810Z'),
      ],
    ),
    // 1146 設計師
    'w-job-75': cat(
      wall(C.paper),
      [el(C.yellow, 500, 90, 50, 50), rc(C.violet, 470, 135, 60, 30, 6)],
      guy({
        x: 270,
        shirt: C.orange,
        pants: C.ink,
        hair: C.ink,
        aR: [
          [110, 520],
          [200, 600],
        ],
        top: glasses(270, 258),
      }),
      [
        rc(C.brown, 40, 680, 920, 40, 8),
        ln('M90 720L90 940M910 720L910 940', INK, 34),
        rc(C.paper, 500, 350, 380, 300, 6),
        ln(
          'M560 580L560 420L650 400M560 500L640 500M600 580L600 500M680 580L680 500M560 580L680 580',
          INK,
          16,
        ),
        el(C.red, 760, 450, 30, 30),
        el(C.sky, 810, 520, 30, 30),
        el(C.green, 740, 570, 30, 30),
        pg(C.yellow, 'M380 640L470 640L470 560Z'),
        ln('M400 630L460 630L460 580', INK, 7),
      ],
    ),
    // 1147 教授
    'w-job-76': cat(
      wall(C.paper),
      rc(C.brown, 500, 120, 460, 460, 10),
      rc(C.green, 525, 145, 410, 410, 0),
      [
        ln(
          'M560 220L760 220M560 300Q620 250 680 330T800 300M570 420L900 420M600 490L860 490',
          C.paper,
          16,
        ),
        ln('M870 240L900 280M900 240L870 280', C.paper, 16),
      ],
      guy({
        x: 280,
        shirt: C.brown,
        pants: C.ink,
        hair: C.violet,
        aL: [
          [-110, 520],
          [-60, 600],
        ],
        aR: [
          [130, 450],
          [260, 450],
        ],
        mid: [pg(C.paper, 'M240 335L280 420L320 335Z')],
        top: cat(
          glasses(280, 258),
          [
            pg(C.violet, 'M220 320C240 420 320 420 340 320Z', {}).slice(0, 0),
          ].slice(0, 0),
          [
            pg(C.ink, 'M170 150L280 100L390 150L280 200Z'),
            rc(C.ink, 215, 160, 130, 40, 6),
            ln('M390 150L400 230', C.yellow, 7),
            el(C.yellow, 400, 235, 14, 14),
            ln('M540 450L720 330', C.yellow, 16),
          ],
        ),
      }),
    ),
    // 1148 藥師
    'w-job-77': cat(
      wall(C.sky),
      rc(C.paper, 60, 150, 880, 14, 0),
      [
        rc(C.brown, 60, 340, 880, 20, 0),
        rc(C.orange, 110, 80, 70, 100, 10),
        rc(C.green, 210, 100, 60, 80, 10),
        rc(C.red, 300, 80, 70, 100, 10),
        rc(C.violet, 640, 90, 60, 90, 10),
        rc(C.yellow, 730, 70, 70, 110, 10),
        rc(C.pink, 830, 100, 60, 80, 10),
        rc(C.paper, 110, 260, 70, 80, 10),
        rc(C.red, 200, 240, 60, 100, 10),
        rc(C.blue, 290, 270, 60, 70, 10),
        rc(C.orange, 640, 250, 70, 90, 10),
        rc(C.green, 740, 270, 60, 70, 10),
        pg(
          C.green,
          'M470 60L530 60L530 110L580 110L580 170L530 170L530 220L470 220L470 170L420 170L420 110L470 110Z',
        ),
        rc(C.paper, 0, 640, 1000, 360, 0).slice(0, 0),
      ],
      guy({
        x: 500,
        shirt: C.paper,
        pants: C.ink,
        hair: C.brown,
        long: 1,
        aL: [
          [-110, 520],
          [-60, 630],
        ],
        aR: [
          [110, 450],
          [150, 400],
        ],
        mid: [
          pg(
            C.green,
            'M470 360L530 360L530 400L570 400L570 440L530 440L530 480L470 480L470 440L430 440L430 400L470 400Z',
            { s: 'none' },
          ).slice(0, 0),
        ].slice(0, 0),
        top: [
          rc(C.orange, 620, 330, 80, 130, 14),
          rc(C.paper, 635, 370, 50, 50, 4),
          rc(C.paper, 625, 305, 70, 30, 6),
        ],
      }),
    ),
    // 1149 公主
    'w-fantasy-0': cat(
      wall(C.sky),
      ground(C.mint, 800),
      [
        rc(C.violet, 60, 380, 130, 420, 0),
        pg(C.red, 'M50 380L125 260L200 380Z'),
        rc(C.violet, 810, 380, 130, 420, 0),
        pg(C.red, 'M800 380L875 260L950 380Z'),
        rc(C.violet, 190, 480, 620, 320, 0),
        rc(C.brown, 440, 620, 120, 180, 50),
        el(C.yellow, 125, 480, 20, 28),
        el(C.yellow, 875, 480, 20, 28),
      ],
      guy({
        x: 500,
        shirt: C.pink,
        pants: C.ink,
        hair: C.yellow,
        long: 1,
        dress: C.pink,
        aL: [
          [-150, 520],
          [-200, 640],
        ],
        aR: [
          [150, 520],
          [200, 640],
        ],
        hy: 270,
        mid: [pg(C.red, 'M420 560L500 600L580 560L600 620L400 620Z', {})].slice(
          0,
          0,
        ),
        top: [
          pg(
            C.yellow,
            'M430 195L430 130L465 165L500 110L535 165L570 130L570 195Z',
          ),
          el(C.red, 500, 160, 12, 12),
        ],
      }),
    ),
    // 1150 國王
    'w-fantasy-1': cat(
      wall(C.violet),
      ground(C.red, 820),
      [rc(C.brown, 300, 150, 400, 700, 50)],
      guy({
        x: 500,
        shirt: C.red,
        pants: C.blue,
        hair: C.paper,
        long: 1,
        dress: C.red,
        aL: [
          [-130, 520],
          [-170, 600],
        ],
        aR: [
          [130, 440],
          [190, 540],
        ],
        hy: 270,
        mid: [pg(C.paper, 'M400 335L500 470L600 335L600 380L500 520L400 380Z')],
        top: [
          pg(
            C.paper,
            'M425 310C420 400 580 400 575 310C560 340 440 340 425 310Z',
          ),
          pg(
            C.yellow,
            'M430 195L430 130L465 165L500 110L535 165L570 130L570 195Z',
          ),
          ln('M690 560L690 330', C.yellow, 16),
          el(C.red, 690, 320, 34, 34),
        ],
      }),
    ),
    // 1151 天使
    'w-fantasy-2': cat(
      wall(C.sky),
      [
        el(C.paper, 200, 800, 160, 70),
        el(C.paper, 330, 830, 140, 60),
        el(C.paper, 800, 780, 150, 70),
        el(C.paper, 690, 840, 130, 60),
      ],
      [
        pg(C.paper, 'M400 400C300 300 150 250 80 330C130 400 180 470 400 520Z'),
        pg(
          C.paper,
          'M600 400C700 300 850 250 920 330C870 400 820 470 600 520Z',
        ),
        ln(
          'M360 440L180 360M370 480L200 430M640 440L820 360M630 480L800 430',
          INK,
          7,
        ),
      ],
      guy({
        x: 500,
        shirt: C.paper,
        pants: C.paper,
        hair: C.yellow,
        long: 1,
        dress: C.paper,
        aL: [
          [-150, 500],
          [-190, 600],
        ],
        aR: [
          [150, 500],
          [190, 600],
        ],
        hy: 270,
        top: [['none', 'E500 160 80 24', { s: C.yellow, w: 16 }]],
      }),
    ),
    // 1152 海盜
    'w-fantasy-3': cat(
      wall(C.sky),
      ground(C.brown, 860),
      [
        pg(C.paper, 'M60 300L160 80L260 300Z', {}),
        ln('M160 80L160 700', INK, 16),
      ].slice(0, 0),
      [
        rc(C.yellow, 740, 680, 190, 140, 12),
        rc(C.brown, 740, 640, 190, 70, 30),
        ln('M740 720L930 720', INK, 7),
        rc(C.orange, 820, 710, 30, 30, 4),
      ],
      guy({
        x: 400,
        shirt: C.paper,
        pants: C.red,
        hair: C.ink,
        aL: [
          [-130, 480],
          [-170, 560],
        ],
        aR: [
          [120, 430],
          [190, 340],
        ],
        shoe: C.brown,
        mid: [
          ln(
            'M300 340L300 600M340 340L340 600M380 340L380 600M420 340L420 600M460 340L460 600M500 340L500 600',
            C.red,
            16,
          ).slice(0, 0),
        ]
          .slice(0, 0)
          .concat([rc(C.ink, 300, 560, 200, 40, 4)]),
        top: [
          pg(C.ink, 'M300 190C310 90 490 90 500 190Z'),
          pg(C.ink, 'M290 190L510 190L480 160L320 160Z'),
          el(C.paper, 400, 140, 24, 24).slice(0, 0),
          ln('M310 255L490 220', INK, 7),
          el(C.ink, 372, 258, 28, 24),
          pg(C.ink, 'M345 225L420 230L400 200Z', {}).slice(0, 0),
          pg(
            C.ink,
            'M325 305C340 400 460 400 475 305C450 335 350 335 325 305Z',
          ),
          ln('M600 340L610 270', C.violet, 16),
          pg(C.violet, 'M595 280L625 280L610 230Z'),
          ln(
            'M630 380C650 340 660 330 650 310Q640 300 630 320',
            C.violet,
            16,
          ).slice(0, 0),
        ],
      }),
      [ln('M600 380Q640 400 620 440', C.violet, 16).slice(0, 0)].slice(0, 0),
      [rc(C.brown, 456, 800, 22, 100, 6)],
    ),
    // 1153 巨龍
    'w-fantasy-4': cat(
      wall(C.violet),
      ground(C.brown, 850),
      [
        pg(
          C.orange,
          'M170 300C100 340 40 330 20 400C100 420 130 400 200 340Z',
          {},
        ).slice(0, 0),
      ].slice(0, 0),
      K.tube(
        [
          [620, 700],
          [820, 820],
          [940, 700],
          [900, 560],
        ],
        70,
        C.green,
      ),
      [
        pg(C.green, 'M300 420C240 300 160 220 80 200C130 300 140 380 200 470Z'),
        pg(
          C.mint,
          'M300 440C250 340 200 280 130 250C160 330 160 400 210 470Z',
          { s: 'none' },
        ).slice(0, 0),
      ],
      [
        el(C.green, 480, 640, 230, 190),
        el(C.mint, 440, 700, 130, 120).slice(0, 0),
      ],
      K.tube(
        [
          [360, 560],
          [300, 420],
          [380, 320],
        ],
        80,
        C.green,
      ),
      [rc(C.green, 400, 840, 60, 20, 2).slice(0, 0)],
      [
        rc(C.green, 380, 760, 80, 120, 30),
        rc(C.green, 540, 780, 80, 100, 30),
        el(C.orange, 420, 885, 50, 20),
        el(C.orange, 580, 885, 50, 20),
      ],
      [
        pg(
          C.green,
          'M300 250C300 200 380 190 440 230C500 260 520 300 440 320C400 330 340 340 300 300Z',
        ),
        pg(C.yellow, 'M320 220L290 150L350 200Z'),
        pg(C.yellow, 'M380 210L370 130L420 205Z'),
        dot(375, 260, 12),
        dot(470, 285, 8),
        ln('M310 300L440 320', INK, 7),
      ],
      [
        pg(
          C.orange,
          'M300 300L220 270L250 320L180 340L260 360L210 400L300 340Z',
        ),
        pg(C.yellow, 'M285 315L240 320L260 340L230 360L290 335Z', {
          s: 'none',
        }),
      ],
      [
        pg(C.mint, 'M540 480C600 330 760 260 900 300C850 380 790 440 680 530Z'),
        ln('M600 450L720 340M690 500L810 390', INK, 7),
        pg(C.mint, 'M520 640C520 760 440 760 420 700Z', {}).slice(0, 0),
      ],
    ),
    // 1154 人魚
    'w-fantasy-5': cat(
      wall(C.sky),
      bubbles([
        [820, 200, 36],
        [870, 330, 22],
        [160, 180, 26],
        [120, 300, 16],
      ]),
      [
        pg(C.violet, 'M300 900L360 700C420 640 560 640 620 700L700 900Z'),
        pg(C.violet, 'M350 760Q480 700 640 760', {}).slice(0, 0),
      ],
      K.tube(
        [
          [480, 600],
          [430, 760],
          [330, 800],
          [250, 720],
        ],
        100,
        C.mint,
      ),
      [
        pg(
          C.mint,
          'M270 740C200 700 130 740 110 650C190 640 240 650 270 700C220 650 180 560 130 540C250 520 340 600 270 740Z',
        ).slice(0, 0),
      ],
      [
        pg(
          C.mint,
          'M290 760C220 780 130 860 80 900C170 930 260 880 290 840C330 880 400 900 470 880C420 830 360 790 290 760Z',
        ).slice(0, 0),
      ],
      [pg(C.green, 'M250 740L120 650L100 760L180 800L110 880L260 810Z')],
      [rc(C.pink, 410, 340, 140, 280, 50).slice(0, 0)],
      [
        rc(C.yellow, 435, 440, 130, 180, 40),
        pg(C.pink, 'M435 520L565 520L565 560L435 560Z', {}).slice(0, 0),
      ],
      K.tube(
        [
          [440, 450],
          [380, 560],
          [360, 640],
        ],
        44,
        C.yellow,
      ),
      K.tube(
        [
          [560, 450],
          [620, 540],
          [640, 600],
        ],
        44,
        C.yellow,
      ),
      [
        rc(C.pink, 430, 470, 140, 50, 20),
        rc(C.red, 400, 455, 64, 48, 20).slice(0, 0),
        el(C.yellow, 500, 330, 76, 82).slice(0, 0),
      ],
      [
        rc(C.orange, 405, 130, 190, 300, 80),
        rc(C.yellow, 450, 380, 100, 80, 20),
        el(C.yellow, 500, 300, 74, 80),
        pg(
          C.orange,
          'M426 300C420 190 580 190 574 300C550 240 450 240 426 300Z',
        ),
        dot(472, 300, 8),
        dot(528, 300, 8),
        ln('M476 335Q500 352 524 335'),
      ],
    ),
    // 1155 外星人
    'w-fantasy-6': cat(
      wall(C.ink),
      stars([
        [120, 120],
        [880, 200],
        [150, 500],
        [900, 600],
        [500, 60],
      ]),
      [
        el(C.violet, 800, 220, 150, 40),
        pg(C.sky, 'M720 210C720 110 880 110 880 210Z'),
        pg(C.yellow, 'M740 260L860 260L930 900L670 900Z', { s: 'none' }).slice(
          0,
          0,
        ),
      ],
      K.tube(
        [
          [430, 700],
          [400, 880],
        ],
        56,
        C.mint,
      ),
      K.tube(
        [
          [570, 700],
          [600, 880],
        ],
        56,
        C.mint,
      ),
      [el(C.mint, 395, 890, 45, 20), el(C.mint, 605, 890, 45, 20)],
      [el(C.mint, 500, 620, 110, 150)],
      K.tube(
        [
          [420, 570],
          [320, 650],
        ],
        40,
        C.mint,
      ),
      K.tube(
        [
          [580, 570],
          [680, 650],
        ],
        40,
        C.mint,
      ),
      K.tube(
        [
          [420, 260],
          [380, 120],
        ],
        12,
        C.mint,
      ),
      el(C.red, 380, 110, 22, 22),
      K.tube(
        [
          [580, 260],
          [620, 120],
        ],
        12,
        C.mint,
      ),
      el(C.red, 620, 110, 22, 22),
      [
        pg(
          C.mint,
          'M500 180C700 180 760 330 640 450C590 500 410 500 360 450C240 330 300 180 500 180Z',
        ),
      ],
      [
        el(C.ink, 410, 340, 55, 38, 25),
        el(C.ink, 590, 340, 55, 38, -25),
        el(C.paper, 395, 330, 12, 10),
        el(C.paper, 575, 330, 12, 10),
        ln('M470 440L530 440', INK, 7),
        rc(C.violet, 420, 600, 160, 30, 6).slice(0, 0),
      ],
    ),
    // 1156 幽靈
    'w-fantasy-7': cat(
      wall(C.blue),
      [el(C.yellow, 800, 180, 90, 90)],
      [
        pg(C.paper, 'M0 800L1000 800L1000 1000L0 1000Z', { s: 'none' }).slice(
          0,
          0,
        ),
      ],
      [
        pg(
          C.paper,
          'M280 880L280 400C280 220 400 150 500 150C600 150 720 220 720 400L720 880L650 820L580 880L510 820L440 880L360 820Z',
        ),
        pg(
          C.paper,
          'M280 480C180 500 140 560 120 600C200 620 250 590 280 560Z',
        ),
        pg(
          C.paper,
          'M720 480C820 500 860 560 880 600C800 620 750 590 720 560Z',
        ),
        el(C.ink, 420, 380, 36, 56),
        el(C.ink, 580, 380, 36, 56),
        el(C.ink, 500, 500, 30, 44),
        el(C.paper, 410, 360, 9, 10),
        el(C.paper, 570, 360, 9, 10),
      ],
      [ln('M60 230L120 230M100 150L150 190', C.paper, 7).slice(0, 0)].slice(
        0,
        0,
      ),
    ),
    // 1157 仙女
    'w-fantasy-8': cat(
      wall(C.mint),
      ground(C.green, 820),
      stars(
        [
          [150, 160],
          [850, 260],
          [220, 400],
        ],
        C.yellow,
      ),
      [
        pg(
          C.violet,
          'M470 400C350 250 200 210 140 300C120 420 330 480 470 480Z',
        ),
        pg(C.pink, 'M470 480C340 520 250 620 300 680C400 700 470 600 470 480Z'),
        pg(
          C.violet,
          'M530 400C650 250 800 210 860 300C880 420 670 480 530 480Z',
        ),
        pg(C.pink, 'M530 480C660 520 750 620 700 680C600 700 530 600 530 480Z'),
      ],
      [rc(C.red, 150, 760, 20, 60).slice(0, 0)],
      [
        pg(C.red, 'M770 760C770 680 910 680 910 760Z'),
        rc(C.paper, 825, 760, 40, 60, 6),
        el(C.paper, 810, 725, 12, 12),
        el(C.paper, 860, 730, 10, 10),
      ],
      guy({
        x: 500,
        shirt: C.pink,
        pants: C.pink,
        hair: C.orange,
        bun: 1,
        dress: C.pink,
        aL: [
          [-130, 520],
          [-170, 590],
        ],
        aR: [
          [130, 440],
          [190, 340],
        ],
        hy: 270,
        shoe: C.pink,
        top: [
          ln('M700 340L650 380', C.brown, 16),
          pg(
            C.yellow,
            'M690 300L702 325L730 330L710 350L715 380L690 365L665 380L670 350L650 330L678 325Z',
            { w: 7 },
          ),
        ],
      }),
    ),
    // 1158 狼人
    'w-fantasy-9': cat(
      wall(C.blue),
      [el(C.yellow, 500, 330, 280, 280)],
      ground(C.ink, 860).slice(0, 0),
      [
        pg(C.ink, 'M0 860L1000 860L1000 1000L0 1000Z'),
        pg(C.ink, 'M80 860L100 740L140 860Z'),
        pg(C.ink, 'M860 860L880 700L930 860Z'),
      ],
      K.tube(
        [
          [430, 600],
          [410, 860],
        ],
        80,
        C.violet,
      ),
      K.tube(
        [
          [570, 600],
          [590, 860],
        ],
        80,
        C.violet,
      ),
      [el(C.violet, 395, 880, 60, 24), el(C.violet, 605, 880, 60, 24)],
      [
        pg(
          C.brown,
          'M380 780L620 780L610 700L550 740L500 700L450 740L390 700Z',
          {},
        ).slice(0, 0),
      ],
      [
        rc(C.violet, 360, 380, 280, 300, 70),
        pg(
          C.brown,
          'M360 600L640 600L640 680L610 700L580 670L550 700L520 670L490 700L460 670L430 700L400 670L360 700Z',
        ),
      ],
      K.tube(
        [
          [370, 460],
          [270, 380],
          [250, 270],
        ],
        70,
        C.violet,
      ),
      K.tube(
        [
          [630, 460],
          [730, 380],
          [750, 270],
        ],
        70,
        C.violet,
      ),
      [
        pg(
          C.paper,
          'M235 240L225 200L250 220L260 190L270 225L285 205L275 255Z',
          {},
        ),
        pg(
          C.paper,
          'M725 240L715 200L740 220L750 190L760 225L775 205L765 255Z',
          {},
        ),
      ],
      [
        pg(C.violet, 'M380 280L360 140L450 210Z'),
        pg(C.violet, 'M620 280L640 140L550 210Z'),
        pg(C.pink, 'M385 250L375 180L425 220Z', { s: 'none' }),
        pg(C.pink, 'M615 250L625 180L575 220Z', { s: 'none' }),
        el(C.violet, 500, 290, 130, 120),
        el(C.paper, 500, 340, 80, 60).slice(0, 0),
        pg(C.violet, 'M440 310C440 380 560 380 560 310Z', {}).slice(0, 0),
      ],
      [
        pg(C.ink, 'M450 300L550 300L520 350L480 350Z'),
        pg(C.red, 'M440 360C470 410 530 410 560 360Z'),
        pg(C.paper, 'M455 362L470 392L485 372ZM515 372L530 392L545 362Z', {
          w: 5,
        }),
        dot(430, 265, 11),
        dot(570, 265, 11),
        ln('M405 240L450 255M595 240L550 255', INK, 7),
      ],
    ),
    // 1159 殭屍
    'w-fantasy-10': cat(
      wall(C.violet),
      ground(C.green, 830),
      [
        pg(C.paper, 'M70 830L70 400C70 300 230 300 230 400L230 830Z'),
        ln('M110 430L190 430M150 390L150 470', INK, 16),
      ],
      K.tube(
        [
          [420, 610],
          [380, 830],
        ],
        70,
        C.brown,
      ),
      K.tube(
        [
          [520, 610],
          [590, 800],
        ],
        70,
        C.brown,
      ),
      [el(C.ink, 360, 850, 60, 24), el(C.ink, 620, 820, 60, 24)],
      [
        rc(C.blue, 380, 340, 220, 290, 40),
        pg(
          C.blue,
          'M380 590L600 590L600 640L570 610L540 650L510 610L470 650L440 610L410 650L380 620Z',
        ),
        ln('M420 420L470 520', INK, 7),
      ],
      K.tube(
        [
          [580, 400],
          [700, 400],
          [830, 400],
        ],
        56,
        C.blue,
      ),
      K.tube(
        [
          [540, 360],
          [660, 330],
          [790, 330],
        ],
        56,
        C.blue,
      ).slice(0, 0),
      [el(C.mint, 850, 400, 36, 34), el(C.mint, 480, 250, 30, 30).slice(0, 0)],
      [
        rc(C.mint, 465, 295, 50, 60, 10),
        el(C.mint, 500, 240, 84, 88),
        pg(
          C.ink,
          'M420 200C420 140 580 140 580 200C550 170 450 170 420 200Z',
          {},
        ).slice(0, 0),
        pg(C.ink, 'M420 215C430 120 570 120 580 215C550 170 450 170 420 215Z'),
        ln(
          'M440 160L470 190M470 160L440 190M530 160L560 190M560 160L530 190',
          INK,
          7,
        ).slice(0, 0),
        el(C.paper, 465, 250, 20, 20),
        el(C.paper, 540, 250, 20, 20),
        dot(470, 250, 8),
        dot(535, 250, 8),
        ln(
          'M455 305L545 305M475 295L475 315M500 295L500 315M525 295L525 315',
          INK,
          7,
        ),
        ln('M430 190L470 220M470 190L430 220', C.ink, 7).slice(0, 0),
      ],
    ),
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
