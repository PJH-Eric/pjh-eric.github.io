(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;
  var cat = function () {
    return [].concat.apply([], arguments);
  };

  function E(x, y, rx, ry, f, rot, o) {
    return [
      f,
      'E' + x + ' ' + y + ' ' + rx + ' ' + ry + (rot ? ' ' + rot : ''),
      o || {},
    ];
  }
  function RR(x, y, w, h, r, f, o) {
    return [f, 'R' + x + ' ' + y + ' ' + w + ' ' + h + ' ' + (r || 0), o || {}];
  }
  function P(d, f, o) {
    return [f, d, o || {}];
  }
  function L(d, s, w) {
    return ['none', d, { s: s || C.ink, w: w || 7 }];
  }
  function TB(pts, w, col) {
    return K.tube(pts, w, col);
  }
  function gnd(y, col) {
    return [
      [
        col || C.mint,
        'M0 ' + y + 'L1000 ' + y + 'L1000 1000L0 1000Z',
        { s: 'none' },
      ],
      L('M0 ' + y + 'L1000 ' + y),
    ];
  }
  function star(x, y, r, col) {
    var a = 0.3 * r;
    return [
      col || C.yellow,
      'M' +
        x +
        ' ' +
        (y - r) +
        'L' +
        (x + a) +
        ' ' +
        (y - a) +
        'L' +
        (x + r) +
        ' ' +
        y +
        'L' +
        (x + a) +
        ' ' +
        (y + a) +
        'L' +
        x +
        ' ' +
        (y + r) +
        'L' +
        (x - a) +
        ' ' +
        (y + a) +
        'L' +
        (x - r) +
        ' ' +
        y +
        'L' +
        (x - a) +
        ' ' +
        (y - a) +
        'Z',
    ];
  }
  function cloud(x, y, s, col) {
    var es = [
      [0, 0, 150, 70],
      [-110, 25, 90, 55],
      [115, 25, 100, 55],
      [0, 45, 190, 45],
    ];
    var out = [],
      i,
      e;
    for (i = 0; i < es.length; i++) {
      e = es[i];
      out.push(
        E(x + e[0] * s, y + e[1] * s, e[2] * s + 7, e[3] * s + 7, C.ink, 0, {
          s: 'none',
        }),
      );
    }
    for (i = 0; i < es.length; i++) {
      e = es[i];
      out.push(
        E(x + e[0] * s, y + e[1] * s, e[2] * s, e[3] * s, col || C.paper, 0, {
          s: 'none',
        }),
      );
    }
    return out;
  }
  function note(x, y) {
    return [
      E(x, y, 20, 14, C.ink, -20, {}),
      L(
        'M' +
          (x + 18) +
          ' ' +
          (y - 4) +
          'L' +
          (x + 18) +
          ' ' +
          (y - 80) +
          'L' +
          (x + 48) +
          ' ' +
          (y - 55),
        C.ink,
        7,
      ),
    ];
  }
  function hand(x, y, col) {
    return E(x, y, 17, 17, col || C.yellow, 0, {});
  }

  /* simple person. x,fy feet centre; h height */
  function fig(x, fy, h, shirt, pants, o) {
    o = o || {};
    var skin = o.skin || C.yellow,
      hairc = o.hair || C.ink;
    var r = 0.11 * h,
      hy = fy - 0.79 * h;
    var sy = fy - 0.62 * h,
      lx = x - 0.15 * h,
      rx = x + 0.15 * h;
    var al = o.al || [-0.05 * h, 0.26 * h],
      ar = o.ar || [0.05 * h, 0.26 * h];
    var hl = [lx + al[0], sy + al[1]],
      hr = [rx + ar[0], sy + ar[1]];
    var ll = o.ll || 0,
      lr = o.lr || 0;
    var fl = [x - 0.08 * h + ll, fy - 0.03 * h],
      fr = [x + 0.08 * h + lr, fy - 0.03 * h];
    var out = [];
    out = out.concat(TB([[x - 0.07 * h, fy - 0.38 * h], fl], 0.09 * h, pants));
    out = out.concat(TB([[x + 0.07 * h, fy - 0.38 * h], fr], 0.09 * h, pants));
    out.push(
      E(fl[0] - 0.02 * h, fy - 0.01 * h, 0.075 * h, 0.032 * h, C.brown, 0, {}),
    );
    out.push(
      E(fr[0] + 0.02 * h, fy - 0.01 * h, 0.075 * h, 0.032 * h, C.brown, 0, {}),
    );
    out.push(
      RR(x - 0.16 * h, fy - 0.66 * h, 0.32 * h, 0.31 * h, 0.07 * h, shirt, {}),
    );
    out = out.concat(TB([[lx, sy], hl], 0.065 * h, shirt));
    out = out.concat(TB([[rx, sy], hr], 0.065 * h, shirt));
    out.push(hand(hl[0], hl[1], skin), hand(hr[0], hr[1], skin));
    out.push(
      RR(x - 0.04 * h, fy - 0.7 * h, 0.08 * h, 0.07 * h, 0, skin, {
        s: 'none',
      }),
    );
    out.push(E(x, hy, r, r * 1.05, skin, 0, {}));
    var hs = o.hairStyle || 'cap';
    if (hs !== 'bald') {
      out.push(
        P(
          'M' +
            (x - r) +
            ' ' +
            (hy - 0.1 * r) +
            'A' +
            r +
            ' ' +
            r +
            ' 0 0 1 ' +
            (x + r) +
            ' ' +
            (hy - 0.1 * r) +
            'Q' +
            x +
            ' ' +
            (hy - 0.65 * r) +
            ' ' +
            (x - r) +
            ' ' +
            (hy - 0.1 * r) +
            'Z',
          hairc,
          {},
        ),
      );
    }
    var ey = hy - 0.02 * r,
      m = o.mood || 'smile';
    if (o.closed) {
      out.push(
        L(
          'M' +
            (x - 0.6 * r) +
            ' ' +
            ey +
            'L' +
            (x - 0.2 * r) +
            ' ' +
            ey +
            'M' +
            (x + 0.2 * r) +
            ' ' +
            ey +
            'L' +
            (x + 0.6 * r) +
            ' ' +
            ey,
          C.ink,
          7,
        ),
      );
    } else if (o.blind) {
      out.push(
        RR(x - r, hy - 0.3 * r, 2 * r, 0.5 * r, 0, C.ink, { s: 'none' }),
      );
    } else {
      out.push(
        E(x - 0.4 * r, ey, 0.13 * r + 3, 0.16 * r + 3, C.ink, 0, { s: 'none' }),
        E(x + 0.4 * r, ey, 0.13 * r + 3, 0.16 * r + 3, C.ink, 0, { s: 'none' }),
      );
    }
    if (m === 'smile')
      out.push(
        L(
          'M' +
            (x - 0.45 * r) +
            ' ' +
            (hy + 0.35 * r) +
            'Q' +
            x +
            ' ' +
            (hy + 0.9 * r) +
            ' ' +
            (x + 0.45 * r) +
            ' ' +
            (hy + 0.35 * r),
        ),
      );
    else if (m === 'sad') {
      out.push(
        L(
          'M' +
            (x - 0.4 * r) +
            ' ' +
            (hy + 0.65 * r) +
            'Q' +
            x +
            ' ' +
            (hy + 0.25 * r) +
            ' ' +
            (x + 0.4 * r) +
            ' ' +
            (hy + 0.65 * r),
        ),
      );
      out.push(
        L(
          'M' +
            (x - 0.7 * r) +
            ' ' +
            (hy - 0.2 * r) +
            'L' +
            (x - 0.2 * r) +
            ' ' +
            (hy - 0.5 * r) +
            'M' +
            (x + 0.7 * r) +
            ' ' +
            (hy - 0.2 * r) +
            'L' +
            (x + 0.2 * r) +
            ' ' +
            (hy - 0.5 * r),
        ),
      );
    } else if (m === 'open') {
      out.push(E(x, hy + 0.5 * r, 0.24 * r, 0.3 * r, C.red, 0, {}));
      if (o.brows)
        out.push(
          L(
            'M' +
              (x - 0.7 * r) +
              ' ' +
              (hy - 0.3 * r) +
              'L' +
              (x - 0.2 * r) +
              ' ' +
              (hy - 0.55 * r) +
              'M' +
              (x + 0.7 * r) +
              ' ' +
              (hy - 0.3 * r) +
              'L' +
              (x + 0.2 * r) +
              ' ' +
              (hy - 0.55 * r),
          ),
        );
    } else
      out.push(
        L(
          'M' +
            (x - 0.3 * r) +
            ' ' +
            (hy + 0.5 * r) +
            'L' +
            (x + 0.3 * r) +
            ' ' +
            (hy + 0.5 * r),
        ),
      );
    if (o.beard)
      out.push(
        P(
          'M' +
            (x - 0.85 * r) +
            ' ' +
            (hy + 0.2 * r) +
            'Q' +
            x +
            ' ' +
            (hy + 2.3 * r) +
            ' ' +
            (x + 0.85 * r) +
            ' ' +
            (hy + 0.2 * r) +
            'Q' +
            x +
            ' ' +
            (hy + 0.9 * r) +
            ' ' +
            (x - 0.85 * r) +
            ' ' +
            (hy + 0.2 * r) +
            'Z',
          C.paper,
          {},
        ),
      );
    return out;
  }
  function place(layers, x, y, s, flip) {
    var l = K.T(layers, { s: s, cx: 500, cy: 800, dx: x - 500, dy: y - 800 });
    return flip ? K.mirror(l, x) : l;
  }

  function horse(o) {
    o = o || {};
    var f = o.gallop
      ? [
          [760, 740],
          [710, 790],
          [250, 740],
          [300, 790],
        ]
      : [
          [670, 800],
          [590, 800],
          [440, 800],
          [350, 800],
        ];
    var body = C.orange,
      out = [];
    out = out.concat(
      TB(
        [
          [310, 480],
          [240, 560],
          [255, 700],
        ],
        34,
        C.brown,
      ),
    );
    out = out.concat(
      TB([[620, 590], f[1]], 34, body),
      TB([[380, 590], f[3]], 34, body),
    );
    out.push(P('M560 450C620 400 670 330 710 300L810 330L770 450Z', body, {}));
    out.push(E(500, 520, 205, 115, body, 0, {}));
    out = out.concat(
      TB([[660, 590], f[0]], 34, body),
      TB([[440, 600], f[2]], 34, body),
    );
    out.push(
      E(f[0][0] + 12, f[0][1], 26, 14, C.ink, 0, {}),
      E(f[1][0] + 12, f[1][1], 26, 14, C.ink, 0, {}),
      E(f[2][0] + 12, f[2][1], 26, 14, C.ink, 0, {}),
      E(f[3][0] + 12, f[3][1], 26, 14, C.ink, 0, {}),
    );
    out.push(E(810, 340, 90, 46, body, 35, {}));
    out.push(P('M730 300L735 235L775 285Z', body, {}));
    out.push(
      P(
        'M650 440C640 380 670 320 710 290L735 300C700 340 690 400 700 450Z',
        C.brown,
        {},
      ),
    );
    out.push(
      E(830, 355, 10, 10, C.ink, 0, { s: 'none' }),
      E(868, 372, 8, 8, C.ink, 0, { s: 'none' }),
    );
    return out;
  }
  function tiger(o) {
    o = o || {};
    var out = [],
      lie = o.lie;
    out = out.concat(
      TB(
        [
          [640, 650],
          [820, 560],
          [850, 480],
          [790, 400],
        ]
          .slice(0, 0)
          .concat([
            [250, 540],
            [160, 520],
            [130, 420],
            [190, 360],
          ]),
        34,
        C.orange,
      ),
    );
    if (!lie) {
      out = out.concat(
        TB(
          [
            [360, 640],
            [350, 800],
          ],
          50,
          C.orange,
        ),
        TB(
          [
            [620, 650],
            [640, 800],
          ],
          50,
          C.orange,
        ),
      );
    }
    out.push(
      E(480, lie ? 650 : 560, 215, lie ? 105 : 115, C.orange, 0, { b: 1 }),
    );
    var ty = lie ? 90 : 0;
    out.push(
      P(
        'M330 ' +
          (440 + ty) +
          'L380 ' +
          (440 + ty) +
          'L360 ' +
          (700 + ty) +
          'L300 ' +
          (700 + ty) +
          'ZM460 ' +
          (430 + ty) +
          'L510 ' +
          (430 + ty) +
          'L500 ' +
          (700 + ty) +
          'L440 ' +
          (700 + ty) +
          'ZM590 ' +
          (440 + ty) +
          'L640 ' +
          (445 + ty) +
          'L620 ' +
          (700 + ty) +
          'L570 ' +
          (700 + ty) +
          'Z',
        C.ink,
        { i: 1, s: 'none' },
      ),
    );
    if (!lie) {
      out = out.concat(
        TB(
          [
            [420, 650],
            [410, 800],
          ],
          50,
          C.orange,
        ),
        TB(
          [
            [560, 650],
            [580, 800],
          ],
          50,
          C.orange,
        ),
      );
      out.push(
        E(360, 800, 50, 22, C.orange, 0, {}),
        E(410, 800, 50, 22, C.orange, 0, {}),
        E(580, 800, 50, 22, C.orange, 0, {}),
        E(640, 800, 50, 22, C.orange, 0, {}),
      );
    } else {
      out.push(
        E(700, 770, 70, 34, C.orange, 0, {}),
        E(620, 780, 60, 30, C.orange, 0, {}),
      );
    }
    var hy = lie ? 560 : 470;
    out.push(
      E(690, hy - 70, 24, 24, C.orange, 0, {}),
      E(820, hy - 70, 24, 24, C.orange, 0, {}),
    );
    out.push(E(755, hy, 105, 90, C.orange, 0, {}));
    out.push(
      L(
        'M700 ' +
          (hy - 80) +
          'L710 ' +
          (hy - 45) +
          'M755 ' +
          (hy - 90) +
          'L755 ' +
          (hy - 50) +
          'M810 ' +
          (hy - 80) +
          'L800 ' +
          (hy - 45),
        C.ink,
        7,
      ),
    );
    out.push(E(765, hy + 35, 60, 40, C.paper, 0, {}));
    out.push(E(775, hy + 15, 14, 9, C.pink, 0, {}));
    out.push(
      E(720, hy - 12, 9, 9, C.ink, 0, { s: 'none' }),
      E(808, hy - 12, 9, 9, C.ink, 0, { s: 'none' }),
    );
    out.push(
      L(
        'M775 ' +
          (hy + 22) +
          'L775 ' +
          (hy + 40) +
          'M745 ' +
          (hy + 50) +
          'Q775 ' +
          (hy + 62) +
          ' 805 ' +
          (hy + 50),
        C.ink,
        7,
      ),
    );
    return out;
  }
  function fox() {
    var out = [];
    out = out.concat(
      TB(
        [
          [320, 620],
          [200, 600],
          [150, 500],
        ],
        80,
        C.red,
      ),
    );
    out.push(E(140, 480, 55, 45, C.paper, 0, {}));
    out = out.concat(
      TB(
        [
          [400, 690],
          [400, 800],
        ],
        36,
        C.red,
      ),
      TB(
        [
          [560, 690],
          [570, 800],
        ],
        36,
        C.red,
      ),
    );
    out.push(E(480, 600, 160, 90, C.red, 0, {}));
    out.push(E(580, 640, 70, 50, C.paper, 0, {}));
    out = out.concat(
      TB(
        [
          [450, 690],
          [450, 800],
        ],
        36,
        C.red,
      ),
      TB(
        [
          [610, 690],
          [620, 800],
        ],
        36,
        C.red,
      ),
    );
    out.push(
      P('M600 510L610 390L670 480Z', C.red, {}),
      P('M690 500L740 390L760 520Z', C.red, {}),
    );
    out.push(E(690, 540, 90, 75, C.red, 0, {}));
    out.push(P('M730 560L880 600L740 625Z', C.paper, {}));
    out.push(
      E(880, 600, 14, 12, C.ink, 0, { s: 'none' }),
      E(715, 525, 9, 9, C.ink, 0, { s: 'none' }),
    );
    return out;
  }
  function cow() {
    var out = [];
    out = out.concat(
      TB(
        [
          [270, 520],
          [240, 620],
          [250, 700],
        ],
        24,
        C.paper,
      ),
    );
    out = out.concat(
      TB(
        [
          [360, 600],
          [355, 790],
        ],
        54,
        C.paper,
      ),
      TB(
        [
          [620, 600],
          [625, 790],
        ],
        54,
        C.paper,
      ),
    );
    out.push(E(480, 520, 235, 125, C.paper, 0, { b: 1 }));
    out.push(
      E(380, 470, 60, 50, C.violet, 0, { i: 1, s: 'none' }),
      E(560, 580, 70, 55, C.violet, 0, { i: 1, s: 'none' }),
      E(620, 450, 40, 40, C.violet, 0, { i: 1, s: 'none' }),
    );
    out = out.concat(
      TB(
        [
          [430, 600],
          [430, 800],
        ],
        54,
        C.paper,
      ),
      TB(
        [
          [560, 600],
          [565, 800],
        ],
        54,
        C.paper,
      ),
    );
    out.push(
      RR(335, 780, 52, 24, 6, C.ink, {}),
      RR(405, 780, 52, 24, 6, C.ink, {}),
      RR(540, 780, 52, 24, 6, C.ink, {}),
      RR(600, 780, 52, 24, 6, C.ink, {}),
    );
    out.push(
      P('M760 410L735 340L785 395Z', C.yellow, {}),
      P('M850 410L880 340L835 395Z', C.yellow, {}),
    );
    out.push(E(740, 440, 40, 22, C.paper, 25, {}));
    out.push(E(800, 500, 85, 80, C.paper, 0, {}));
    out.push(E(815, 555, 60, 42, C.pink, 0, {}));
    out.push(
      E(800, 480, 9, 9, C.ink, 0, { s: 'none' }),
      E(795, 560, 8, 10, C.ink, 0, { s: 'none' }),
      E(838, 560, 8, 10, C.ink, 0, { s: 'none' }),
    );
    out.push(E(780, 470, 9, 9, C.ink, 0, { s: 'none' }));
    return out;
  }
  function elephant() {
    var out = [],
      g = C.violet;
    out = out.concat(
      TB(
        [
          [250, 520],
          [220, 640],
          [240, 720],
        ],
        20,
        g,
      ),
    );
    out.push(
      RR(330, 620, 80, 180, 20, g, {}),
      RR(540, 620, 80, 180, 20, g, {}),
    );
    out.push(E(470, 540, 230, 150, g, 0, {}));
    out.push(
      RR(420, 640, 80, 160, 20, g, {}),
      RR(620, 620, 80, 180, 20, g, {}),
    );
    out = out.concat(
      TB(
        [
          [800, 520],
          [860, 640],
          [820, 760],
          [760, 780],
        ],
        70,
        g,
      ),
    );
    out.push(E(740, 450, 105, 105, g, 0, {}));
    out.push(E(660, 470, 70, 110, C.violet, 0, {}));
    out.push(L('M660 400Q610 470 665 560', C.ink, 7));
    out.push(P('M810 540L880 600L835 595Z', C.paper, {}));
    out.push(E(785, 440, 10, 10, C.ink, 0, { s: 'none' }));
    return out;
  }
  function deer() {
    var out = [],
      b = C.brown;
    out = out.concat(
      TB(
        [
          [330, 560],
          [300, 600],
        ],
        26,
        b,
      ),
    );
    out = out.concat(
      TB(
        [
          [360, 620],
          [350, 800],
        ],
        26,
        b,
      ),
      TB(
        [
          [600, 620],
          [610, 800],
        ],
        26,
        b,
      ),
    );
    out.push(E(480, 540, 190, 95, b, 0, { b: 1 }));
    out.push(
      E(400, 520, 20, 15, C.paper, 0, { i: 1, s: 'none' }),
      E(480, 500, 20, 15, C.paper, 0, { i: 1, s: 'none' }),
      E(560, 530, 20, 15, C.paper, 0, { i: 1, s: 'none' }),
      E(440, 580, 18, 14, C.paper, 0, { i: 1, s: 'none' }),
      E(520, 590, 18, 14, C.paper, 0, { i: 1, s: 'none' }),
    );
    out = out.concat(
      TB(
        [
          [420, 620],
          [415, 800],
        ],
        26,
        b,
      ),
      TB(
        [
          [550, 620],
          [555, 800],
        ],
        26,
        b,
      ),
    );
    out = out.concat(
      TB(
        [
          [600, 480],
          [680, 360],
        ],
        60,
        b,
      ),
    );
    out.push(E(710, 340, 65, 45, b, -20, {}));
    out.push(
      E(765, 360, 20, 16, C.ink, 0, { s: 'none' }),
      E(710, 325, 8, 8, C.ink, 0, { s: 'none' }),
    );
    out = out.concat(
      TB(
        [
          [690, 300],
          [650, 190],
          [600, 130],
        ],
        14,
        C.yellow,
      ),
      TB(
        [
          [650, 190],
          [690, 120],
        ],
        14,
        C.yellow,
      ),
      TB(
        [
          [730, 300],
          [770, 190],
          [830, 140],
        ],
        14,
        C.yellow,
      ),
      TB(
        [
          [770, 190],
          [740, 120],
        ],
        14,
        C.yellow,
      ),
    );
    out.push(P('M670 300L640 260L700 285Z', b, {}));
    return out;
  }
  function frog() {
    return [
      E(500, 700, 140, 95, C.mint, 0, {}),
      E(410, 790, 55, 22, C.mint, 0, {}),
      E(590, 790, 55, 22, C.mint, 0, {}),
      E(420, 610, 38, 38, C.mint, 0, {}),
      E(580, 610, 38, 38, C.mint, 0, {}),
      E(420, 610, 20, 20, C.paper, 0, {}),
      E(580, 610, 20, 20, C.paper, 0, {}),
      E(420, 604, 9, 9, C.ink, 0, { s: 'none' }),
      E(580, 604, 9, 9, C.ink, 0, { s: 'none' }),
      L('M430 690Q500 740 570 690', C.ink, 7),
    ];
  }
  function sheep() {
    var out = [];
    out = out.concat(
      TB(
        [
          [420, 700],
          [415, 790],
        ],
        20,
        C.ink,
      ),
      TB(
        [
          [560, 700],
          [565, 790],
        ],
        20,
        C.ink,
      ),
    );
    out.push(
      E(380, 560, 80, 80, C.paper, 0, {}),
      E(480, 520, 100, 90, C.paper, 0, {}),
      E(580, 560, 80, 80, C.paper, 0, {}),
      E(480, 620, 130, 80, C.paper, 0, {}),
    );
    out.push(E(680, 560, 55, 60, C.ink, 0, {}));
    out.push(E(690, 550, 8, 8, C.paper, 0, { s: 'none' }));
    return out;
  }
  function dragonHead(o) {
    o = o || {};
    var out = [];
    out.push(
      P('M300 300L330 160L400 270L430 130L490 250L540 150L560 280Z', C.red, {}),
    );
    out.push(E(450, 500, 190, 170, C.green, 0, {}));
    out.push(E(670, 570, 175, 105, C.green, 0, {}));
    out.push(P('M410 360L370 190L500 330Z', C.yellow, {}));
    out.push(L('M560 620Q690 670 830 610', C.ink, 7));
    out.push(
      P('M610 640L630 690L650 645Z', C.paper, {}),
      P('M720 650L740 695L760 650Z', C.paper, {}),
    );
    out.push(E(810, 540, 14, 18, C.ink, 0, { s: 'none' }));
    out = out.concat(
      TB(
        [
          [800, 600],
          [880, 680],
          [850, 760],
        ],
        14,
        C.orange,
      ),
    );
    out.push(E(490, 430, 50, 54, C.paper, 0, {}));
    if (!o.noPupil) out.push(E(502, 434, 22, 30, C.ink, 0, { s: 'none' }));
    return out;
  }
  function bird() {
    return [
      P('M450 470L350 310L530 450Z', C.orange, {}),
      P('M390 510L280 550L300 480Z', C.orange, {}),
      E(500, 500, 135, 65, C.brown, -8, {}),
      E(640, 445, 44, 40, C.paper, 0, {}),
      P('M676 440L735 460L676 472Z', C.yellow, {}),
      E(650, 438, 8, 8, C.ink, 0, { s: 'none' }),
    ];
  }
  function fish() {
    return [
      P('M320 500L170 390L195 500L170 610Z', C.orange, {}),
      P('M440 400Q500 290 590 395Z', C.red, {}),
      E(500, 500, 210, 125, C.orange, 0, { b: 1 }),
      E(500, 600, 200, 60, C.paper, 0, { i: 1, s: 'none' }),
      L('M590 400Q560 500 590 600', C.ink, 7),
      E(645, 470, 26, 26, C.paper, 0, {}),
      E(652, 472, 11, 11, C.ink, 0, { s: 'none' }),
      L('M690 540Q720 560 700 520', C.ink, 7),
      P('M440 520Q480 590 520 530Z', C.red, {}),
    ];
  }
  function seedling(x, y, h) {
    return [].concat(
      TB(
        [
          [x, y],
          [x, y - h],
        ],
        10,
        C.mint,
      ),
      [
        E(x - 30, y - h + 8, 32, 13, C.mint, -25, {}),
        E(x + 30, y - h - 4, 32, 13, C.mint, 25, {}),
      ],
    );
  }
  function bell(x, y) {
    return [
      E(x, y - 262, 22, 22, C.ink, 0, {}),
      P(
        'M' +
          (x - 100) +
          ' ' +
          (y - 40) +
          'C' +
          (x - 100) +
          ' ' +
          (y - 150) +
          ' ' +
          (x - 70) +
          ' ' +
          (y - 240) +
          ' ' +
          x +
          ' ' +
          (y - 240) +
          'C' +
          (x + 70) +
          ' ' +
          (y - 240) +
          ' ' +
          (x + 100) +
          ' ' +
          (y - 150) +
          ' ' +
          (x + 100) +
          ' ' +
          (y - 40) +
          'Z',
        C.yellow,
        {},
      ),
      RR(x - 120, y - 52, 240, 36, 16, C.yellow, {}),
      E(x, y - 8, 24, 20, C.brown, 0, {}),
    ];
  }

  Object.assign(R, {
    'w-emotion-36': cat(
      gnd(800),
      fig(700, 800, 560, C.blue, C.brown, { mood: 'smile', ar: [30, -190] }),
      [
        P('M770 120L860 120Q860 215 814 230Q770 215 770 120Z', C.yellow, {}),
        RR(804, 228, 20, 25, 0, C.yellow, {}),
        hand(814, 263, C.yellow),
      ],
      fig(260, 800, 500, C.green, C.blue, { mood: 'sad', hair: C.brown }),
      [
        E(260, 165, 130, 75, C.paper, 0, {}),
        P('M225 120L295 120Q295 180 260 190Q225 180 225 120Z', C.yellow, {}),
        E(330, 270, 18, 18, C.paper, 0, {}),
        E(355, 310, 10, 10, C.paper, 0, {}),
      ],
    ),
    'w-emotion-37': cat(
      gnd(830),
      [E(500, 830, 130, 16, C.violet, 0, { s: 'none' })],
      fig(500, 760, 560, C.red, C.blue, {
        mood: 'open',
        al: [-120, -200],
        ar: [120, -200],
        ll: -70,
        lr: 70,
      }),
      [
        star(170, 300, 55),
        star(830, 270, 55),
        star(140, 580, 36, C.pink),
        star(860, 560, 36, C.sky),
        star(300, 150, 30, C.sky),
        star(720, 130, 30, C.pink),
      ],
    ),
    'w-emotion-38': cat(
      cloud(500, 130, 0.9, C.violet),
      gnd(840, C.green),
      [
        L('M300 280L280 350', C.sky, 16),
        L('M400 290L380 360', C.sky, 16),
        L('M600 290L620 360', C.sky, 16),
        L('M700 280L720 350', C.sky, 16),
      ],
      fig(500, 840, 540, C.violet, C.ink, {
        mood: 'sad',
        closed: true,
        al: [28, -85],
        ar: [-28, -85],
        hair: C.brown,
      }),
      [L('M450 440L445 480', C.sky, 16), L('M550 440L555 480', C.sky, 16)],
    ),
    'w-emotion-39': cat(
      gnd(820),
      fig(320, 820, 560, C.pink, C.blue, {
        mood: 'smile',
        ar: [150, 40],
        hair: C.brown,
      }),
      [
        RR(520, 380, 160, 180, 10, C.brown, {}),
        RR(542, 402, 116, 136, 4, C.paper, {}),
        P(
          'M600 500C550 460 570 430 600 450C630 430 650 460 600 500Z',
          C.red,
          {},
        ),
        hand(570, 525, C.yellow),
        E(740, 160, 150, 90, C.paper, 0, {}),
        RR(695, 160, 90, 55, 0, C.yellow, {}),
        P('M685 165L740 110L795 165Z', C.red, {}),
        RR(725, 175, 28, 40, 0, C.brown, {}),
        E(610, 270, 18, 18, C.paper, 0, {}),
        E(580, 315, 10, 10, C.paper, 0, {}),
      ],
    ),
    'w-idiom-0': cat(
      gnd(820),
      TB(
        [
          [372, 520],
          [385, 805],
        ],
        16,
        C.brown,
      ),
      [P('M385 805L460 795L450 840L385 840Z', C.violet, {})],
      fig(250, 820, 560, C.orange, C.brown, {
        mood: 'neutral',
        ar: [28, 120],
        hairStyle: 'bald',
      }),
      [
        E(250, 342, 100, 18, C.yellow, 0, {}),
        E(250, 322, 52, 36, C.yellow, 0, {}),
      ],
      [
        RR(540, 640, 220, 180, 20, C.brown, {}),
        E(650, 640, 110, 32, C.yellow, 0, {}),
        L('M600 640Q650 625 700 640', C.brown, 7),
      ],
      [
        E(850, 780, 80, 45, C.paper, 0, {}),
        E(905, 745, 36, 30, C.paper, 0, {}),
        E(880, 690, 14, 45, C.paper, -10, {}),
        E(925, 695, 14, 45, C.paper, 10, {}),
        E(915, 742, 6, 6, C.ink, 0, { s: 'none' }),
      ],
    ),
    'w-idiom-1': cat(
      gnd(800),
      TB(
        [
          [300, 560],
          [290, 660],
        ],
        24,
        C.green,
      ),
      TB(
        [
          [430, 660],
          [425, 760],
        ],
        24,
        C.green,
      ),
      TB(
        [
          [560, 560],
          [550, 660],
        ],
        24,
        C.green,
      ),
      TB(
        [
          [690, 660],
          [685, 760],
        ],
        24,
        C.green,
      ),
      [
        E(290, 665, 36, 16, C.green, 0, {}),
        E(425, 765, 36, 16, C.green, 0, {}),
        E(550, 665, 36, 16, C.green, 0, {}),
        E(685, 765, 36, 16, C.green, 0, {}),
      ],
      TB(
        [
          [170, 620],
          [300, 530],
          [430, 650],
          [560, 530],
          [690, 650],
          [790, 570],
        ],
        54,
        C.green,
      ),
      [
        E(820, 550, 60, 45, C.green, 0, {}),
        E(830, 535, 9, 9, C.ink, 0, { s: 'none' }),
        L('M875 560L930 560L950 540M930 560L950 580', C.red, 7),
      ],
      [P('M830 250L910 250L910 330L830 330Z', C.paper, { s: 'none' })].slice(
        0,
        0,
      ),
    ),
    'w-idiom-2': cat(
      [
        E(850, 100, 55, 55, C.yellow, 0, {}),
        RR(40, 190, 920, 60, 10, C.mint, {}),
      ],
      [
        RR(280, 250, 440, 600, 0, C.brown, {}),
        RR(380, 250, 240, 600, 0, C.violet, { s: C.ink }),
      ],
      [
        L(
          'M280 340H380M280 440H380M280 540H380M280 640H380M620 340H720M620 440H720M620 540H720M620 640H720',
          C.ink,
          7,
        ),
      ],
      [
        RR(255, 225, 125, 32, 10, C.paper, {}),
        RR(620, 225, 125, 32, 10, C.paper, {}),
        RR(380, 700, 240, 150, 0, C.sky, { s: C.ink }),
      ],
      place(frog(), 500, 830, 0.8),
      [L('M400 760Q430 745 460 760T520 760T580 760', C.paper, 7)],
    ),
    'w-idiom-3': cat(
      gnd(810),
      [
        RR(60, 560, 270, 24, 0, C.brown, {}),
        RR(60, 650, 270, 24, 0, C.brown, {}),
        RR(90, 510, 38, 300, 8, C.brown, {}),
        RR(200, 510, 38, 300, 8, C.brown, {}),
        RR(300, 510, 38, 300, 8, C.brown, {}),
      ],
      [
        RR(380, 460, 24, 200, 6, C.brown, {}),
        RR(300, 840, 160, 24, 0, C.brown, { s: C.ink }),
      ].slice(0, 1),
      TB(
        [
          [360, 600],
          [360, 480],
        ],
        16,
        C.brown,
      ),
      [RR(335, 450, 70, 34, 6, C.violet, {})],
      fig(480, 810, 520, C.orange, C.blue, { mood: 'smile', al: [-30, 80] }),
      TB(
        [
          [362, 560],
          [362, 480],
        ],
        1,
        C.brown,
      ).slice(0, 0),
      place(sheep(), 820, 830, 0.65, true),
      [L('M690 640L650 640M700 690L660 700', C.ink, 7)],
    ),
    'w-idiom-4': cat(
      gnd(810, C.mint),
      place(tiger(), 480, 810, 1),
      place(fox(), 480, 455, 0.5, false),
      [L('M850 300Q900 250 930 280', C.ink, 7)].slice(0, 0),
    ),
    'w-idiom-5': cat(
      gnd(820),
      fig(340, 820, 560, C.orange, C.blue, {
        mood: 'neutral',
        closed: true,
        al: [30, -88],
        ar: [-30, -88],
      }),
      bell(700, 820),
      [L('M850 600Q890 640 850 680M880 570Q940 640 880 710', C.ink, 7)],
    ),
    'w-idiom-6': cat(
      gnd(820),
      place(cow(), 730, 820, 0.8),
      fig(260, 820, 520, C.blue, C.brown, {
        mood: 'smile',
        ar: [12, 67],
        al: [48, 182],
      }),
      [
        E(250, 660, 75, 60, C.orange, 0, {}),
        E(250, 600, 50, 45, C.orange, 0, {}),
        E(250, 640, 22, 22, C.ink, 0, {}),
        L('M300 620L400 500', C.brown, 16),
        RR(385, 470, 36, 50, 6, C.brown, {}),
        hand(350, 545),
        hand(235, 660),
      ],
      note(480, 350),
      note(560, 250),
      note(450, 200),
    ),
    'w-idiom-7': cat(
      [C.sky].slice(0, 0),
      [P('M100 560L700 560L620 740L180 740Z', C.brown, {})],
      [L('M140 595L160 690', C.red, 16)],
      fig(400, 560, 420, C.green, C.blue, {
        mood: 'smile',
        al: [-50, 100],
        ar: [120, -50],
      }),
      [
        P(
          'M0 700Q100 670 200 700T400 700T600 700T800 700T1000 700L1000 1000L0 1000Z',
          C.sky,
          {},
        ),
        L(
          'M100 800Q150 785 200 800T300 800M600 850Q650 835 700 850T800 850',
          C.paper,
          7,
        ),
      ],
      [
        RR(805, 320, 30, 50, 5, C.brown, {}),
        RR(780, 370, 80, 18, 5, C.brown, {}),
        P('M790 388L850 388L830 640L820 660L810 640Z', C.violet, {}),
      ],
      [L('M740 720Q820 700 900 720', C.paper, 7)],
    ),
    'w-idiom-8': cat(
      [
        RR(80, 710, 840, 40, 6, C.brown, {}),
        RR(150, 750, 40, 190, 6, C.brown, {}),
        RR(810, 750, 40, 190, 6, C.brown, {}),
      ],
      [
        L('M190 120Q40 310 190 500', C.ink, 30),
        L('M190 120Q40 310 190 500', C.brown, 16),
        L('M190 120L190 500', C.ink, 7),
      ],
      [
        P(
          'M420 430H740L700 680Q690 710 660 710H500Q470 710 460 680Z',
          C.paper,
          { b: 1 },
        ),
        RR(380, 540, 400, 60, 0, C.sky, { i: 1, s: 'none' }),
      ],
      [
        L('M770 470Q870 510 770 640', C.ink, 30),
        L('M770 470Q870 510 770 640', C.paper, 16),
      ],
      [E(580, 430, 160, 40, C.orange, 0, {})],
      TB(
        [
          [470, 435],
          [510, 405],
          [550, 435],
          [590, 405],
          [630, 435],
          [670, 415],
        ],
        14,
        C.green,
      ),
      [
        E(690, 410, 22, 16, C.green, 0, {}),
        E(695, 406, 4, 4, C.ink, 0, { s: 'none' }),
      ],
    ),
    'w-idiom-9': cat(
      gnd(780, C.yellow),
      TB(
        [
          [230, 560],
          [210, 780],
        ],
        12,
        C.orange,
      ),
      TB(
        [
          [280, 560],
          [290, 780],
        ],
        12,
        C.orange,
      ),
      [
        P(
          'M300 770Q500 880 700 770Q620 700 500 700Q380 700 300 770Z',
          C.violet,
          { b: 1 },
        ),
        L('M400 730L360 790M500 710L500 800M600 730L640 790', C.ink, 7),
      ],
      [
        E(230, 470, 115, 72, C.sky, -10, {}),
        P('M200 440L120 340L280 420Z', C.blue, {}),
        P('M130 520L50 540L70 480Z', C.blue, {}),
      ],
      TB(
        [
          [310, 440],
          [390, 560],
        ],
        26,
        C.sky,
      ),
      [
        E(410, 575, 36, 28, C.sky, 0, {}),
        P('M440 560L505 725L450 595Z', C.orange, {}),
        E(415, 570, 7, 7, C.ink, 0, { s: 'none' }),
      ],
      [
        P('M310 770Q500 580 690 770Q500 720 310 770Z', C.violet, { b: 1 }),
        L('M400 720L380 760M500 690L500 740M600 720L620 760', C.ink, 7),
      ],
    ),
    'w-idiom-10': cat(
      gnd(820),
      place(horse({ gallop: true }), 790, 820, 0.62, false),
      TB(
        [
          [170, 460],
          [175, 820],
        ],
        16,
        C.brown,
      ),
      fig(300, 820, 560, C.orange, C.brown, {
        mood: 'smile',
        hair: C.paper,
        beard: true,
        al: [-46, 90],
        ar: [70, -120],
      }),
    ),
    'w-idiom-11': cat(
      gnd(830),
      place(elephant(), 560, 830, 0.85),
      fig(190, 830, 300, C.red, C.blue, {
        blind: true,
        mood: 'neutral',
        ar: [85, 18],
      }),
      fig(930, 830, 300, C.blue, C.brown, {
        blind: true,
        mood: 'neutral',
        al: [-80, 30],
      }),
      fig(560, 850, 250, C.green, C.ink, {
        blind: true,
        mood: 'neutral',
        ar: [10, -85],
        al: [-10, -85],
      }),
    ),
    'w-idiom-12': cat(
      gnd(830),
      [
        P('M120 830L450 220L780 830Z', C.violet, { b: 1 }),
        P('M360 390L450 220L540 390Q450 430 360 390Z', C.paper, {
          i: 1,
          s: 'none',
        }),
      ],
      [E(150, 830, 55, 36, C.violet, 0, {}), E(215, 840, 40, 26, C.sky, 0, {})],
      TB(
        [
          [845, 520],
          [845, 830],
        ],
        16,
        C.brown,
      ),
      [
        P('M775 520Q845 460 915 520', 'none', { s: C.ink, w: 34 }),
        L('M775 520Q845 460 915 520', C.violet, 16),
      ].slice(0, 0),
      fig(770, 830, 430, C.blue, C.brown, {
        mood: 'smile',
        hair: C.paper,
        beard: true,
        al: [139, 60],
        ar: [11, 40],
      }),
      [
        L('M770 505Q845 450 920 505', C.ink, 34),
        L('M770 505Q845 450 920 505', C.violet, 16),
      ],
    ),
    'w-idiom-13': cat(
      gnd(760, C.brown),
      seedling(100, 770, 90),
      seedling(215, 770, 90),
      seedling(330, 770, 90),
      seedling(445, 770, 90),
      TB(
        [
          [640, 770],
          [640, 420],
        ],
        10,
        C.mint,
      ),
      [
        E(612, 435, 32, 13, C.mint, -25, {}),
        E(668, 425, 32, 13, C.mint, 25, {}),
        E(630, 760, 26, 10, C.brown, 0, {}),
        E(655, 765, 22, 8, C.brown, 0, {}),
      ],
      fig(800, 800, 480, C.sky, C.blue, {
        mood: 'smile',
        al: [-73, -82],
        hairStyle: 'cap',
        hair: C.brown,
      }),
      [L('M720 330Q735 305 750 330', C.sky, 7)].slice(0, 0),
    ),
    'w-idiom-14': cat(
      gnd(830),
      [
        RR(520, 140, 440, 460, 20, C.brown, {}),
        RR(550, 170, 380, 400, 8, C.sky, {}),
      ],
      place(dragonHead(), 770, 660, 0.62, false),
      [RR(520, 380, 440, 18, 0, C.brown, { s: 'none' }).slice(0, 0)].slice(
        0,
        0,
      ),
      fig(250, 830, 560, C.orange, C.blue, {
        mood: 'open',
        brows: true,
        al: [-70, -120],
        ar: [70, -120],
        ll: -30,
        lr: 30,
        hair: C.brown,
      }),
      [RR(500, 600, 480, 30, 0, C.brown, {})],
    ),
    'w-idiom-15': cat(
      gnd(810),
      [
        P('M580 570L770 340L960 570Z', C.yellow, {}),
        RR(620, 570, 300, 240, 0, C.paper, {}),
        RR(740, 660, 60, 150, 6, C.brown, {}),
        RR(640, 610, 60, 60, 4, C.sky, {}),
        RR(840, 610, 60, 60, 4, C.sky, {}),
      ],
      [L('M650 520L760 400M700 520L790 410M860 520L780 410', C.brown, 7)],
      fig(110, 810, 400, C.red, C.blue, {
        mood: 'smile',
        al: [40, 40],
        ar: [-40, 40],
      }),
      fig(260, 810, 400, C.blue, C.brown, {
        mood: 'smile',
        al: [40, 40],
        ar: [-40, 40],
        hair: C.brown,
      }),
      fig(410, 810, 400, C.green, C.ink, {
        mood: 'smile',
        al: [40, 40],
        ar: [-40, 40],
      }),
    ),
    'w-idiom-16': cat(
      [C.sky].slice(0, 0),
      gnd(830, C.mint),
      TB(
        [
          [120, 330],
          [270, 200],
          [420, 320],
          [570, 190],
          [720, 290],
        ],
        46,
        C.green,
      ),
      place(dragonHead(), 810, 380, 0.4, false),
      cloud(300, 340, 0.55, C.paper),
      cloud(640, 330, 0.5, C.paper),
      cloud(150, 190, 0.35, C.paper),
      [E(480, 840, 280, 60, C.violet, 0, {})],
      place(tiger({ lie: true }), 400, 830, 0.7, false),
    ),
    'w-idiom-17': cat(
      gnd(830),
      TB(
        [
          [350, 750],
          [250, 840],
        ],
        10,
        C.green,
      ).slice(0, 0),
      place(dragonHead({ noPupil: true }), 580, 760, 0.8, false),
      TB(
        [
          [400, 800],
          [350, 900],
        ],
        10,
        C.green,
      ).slice(0, 0),
      fig(210, 830, 520, C.orange, C.blue, {
        mood: 'smile',
        ar: [152, 7],
        hair: C.brown,
      }),
      [L('M470 505L545 512', C.ink, 16)],
      [E(555, 515, 14, 14, C.ink, 0, { s: 'none' })].slice(0, 0),
    ),
    'w-idiom-18': cat(
      cloud(180, 160, 0.5, C.sky),
      cloud(820, 800, 0.5, C.sky),
      place(bird(), 380, 640, 0.8, false),
      place(bird(), 660, 440, 0.8, false),
      [
        L('M120 820L880 220', C.brown, 16),
        P('M880 220L820 215L850 270Z', C.violet, {}),
        P('M120 820L90 770L170 780Z', C.red, {}),
        P('M160 790L140 740L220 750Z', C.red, {}),
      ],
    ),
    'w-idiom-19': cat(
      gnd(820),
      TB(
        [
          [500, 440],
          [330, 820],
        ],
        14,
        C.brown,
      ),
      TB(
        [
          [500, 440],
          [670, 820],
        ],
        14,
        C.brown,
      ),
      [
        E(500, 400, 270, 270, C.red, 0, {}),
        E(500, 400, 215, 215, C.paper, 0, {}),
        E(500, 400, 160, 160, C.red, 0, {}),
        E(500, 400, 105, 105, C.paper, 0, {}),
        E(500, 400, 50, 50, C.red, 0, {}),
      ],
      [
        L('M500 400L300 470', C.brown, 7),
        P('M300 470L260 430L250 490Z', C.yellow, {}),
        L('M480 380L270 310', C.brown, 7),
        P('M270 310L225 290L235 345Z', C.yellow, {}),
        L('M520 425L330 560', C.brown, 7),
        P('M330 560L280 560L305 610Z', C.yellow, {}),
      ],
    ),
    'w-idiom-20': cat(
      gnd(810),
      TB(
        [
          [150, 200],
          [150, 810],
        ],
        16,
        C.brown,
      ),
      [
        P('M150 210L400 270L150 340Z', C.red, {}),
        E(215, 270, 20, 20, C.yellow, 0, { s: 'none' }),
      ],
      place(horse({ gallop: true }), 610, 810, 0.95, false),
    ),
    'w-idiom-21': cat(
      gnd(830),
      [RR(100, 100, 490, 560, 14, C.yellow, {})],
      [
        L(
          'M170 180H500M170 250H440M170 320H520M170 390H420M170 460H480M170 530H400',
          C.ink,
          16,
        ),
      ],
      [RR(150, 580, 300, 50, 8, 'none', { s: C.red, w: 16 })],
      [
        P('M240 830L400 660L560 830Z', C.violet, { b: 1 }),
        P('M345 720L400 660L455 720Q400 745 345 720Z', C.paper, {
          i: 1,
          s: 'none',
        }),
      ],
      fig(810, 830, 520, C.blue, C.brown, {
        mood: 'sad',
        hair: C.brown,
        al: [-60, 60],
      }),
    ),
    'w-idiom-22': cat(
      gnd(740, C.paper),
      [
        P('M120 640Q120 800 270 800Q420 800 420 640Z', C.brown, {}),
        E(270, 640, 150, 28, C.violet, 0, {}),
        L('M250 650L275 700L240 740L270 790', C.ink, 7),
      ],
      [
        P('M440 560L490 590L450 620Z', C.brown, {}),
        P('M110 560L60 590L120 620Z', C.brown, {}),
        P('M260 500L300 540L240 540Z', C.brown, {}),
      ],
      [
        P('M520 590L880 590L800 740L610 740Z', C.brown, {}),
        E(700, 660, 34, 28, C.ink, 0, {}),
      ],
      [
        P(
          'M0 720Q125 680 250 720T500 720T750 720T1000 720L1000 1000L0 1000Z',
          C.sky,
          {},
        ),
        L('M0 720Q125 680 250 720T500 720T750 720T1000 720', C.ink, 7),
      ],
      [L('M520 800Q580 780 640 800T760 800', C.paper, 7)],
    ),
    'w-idiom-23': cat(
      TB(
        [
          [130, 760],
          [870, 700],
        ],
        36,
        C.brown,
      ),
      TB(
        [
          [150, 710],
          [850, 780],
        ],
        36,
        C.orange,
      ),
      TB(
        [
          [130, 660],
          [870, 640],
        ],
        30,
        C.brown,
      ),
      TB(
        [
          [310, 480],
          [310, 100],
        ]
          .slice(0, 0)
          .concat([
            [270, 100],
            [270, 470],
          ]),
        6,
        C.ink,
      ).slice(0, 0),
      [RR(280, 560, 400, 110, 50, C.blue, {})],
      TB(
        [
          [660, 615],
          [830, 640],
        ],
        52,
        C.brown,
      ),
      [
        E(250, 600, 58, 58, C.yellow, 0, {}),
        P('M192 595A58 58 0 0 1 308 595Q250 540 192 595Z', C.ink, {}),
        L('M222 600L242 600M262 600L282 600', C.ink, 7),
        L('M232 635Q252 650 272 635', C.ink, 7),
        L('M255 100L255 460', C.ink, 7),
        E(255, 500, 42, 48, C.mint, 0, {}),
        L('M235 495L275 505', C.ink, 7),
      ]
        .slice(0, 6)
        .concat([
          L('M255 100L255 450', C.ink, 7),
          E(255, 500, 42, 48, C.mint, 0, {}),
        ]),
    ),
    'w-idiom-24': cat(
      gnd(820),
      [
        RR(650, 160, 130, 640, 0, C.red, {}),
        RR(620, 120, 190, 50, 6, C.yellow, {}),
        RR(620, 780, 190, 40, 6, C.yellow, {}),
        L('M690 190V770M740 190V770', C.ink, 7),
      ],
      fig(330, 820, 560, C.blue, C.brown, {
        mood: 'open',
        brows: true,
        al: [-20, 50],
        ar: [98, -148],
      }),
      [
        L('M510 240m-85 0a85 85 0 1 0 170 0a85 85 0 1 0 -170 0', C.ink, 30),
      ].slice(0, 0),
      [
        ['none', 'E510 235 85 85', { s: C.ink, w: 30 }],
        ['none', 'E510 235 85 85', { s: C.mint, w: 16 }],
        hand(512, 325, C.yellow),
      ],
    ),
    'w-idiom-25': cat(
      gnd(830),
      TB(
        [
          [130, 515],
          [870, 475],
        ],
        16,
        C.brown,
      ),
      TB(
        [
          [150, 470],
          [850, 520],
        ],
        16,
        C.brown,
      ),
      TB(
        [
          [140, 495],
          [860, 495],
        ],
        16,
        C.orange,
      ),
      [
        L(
          'M150 470L120 440M150 470L110 480M850 520L880 550M850 520L890 510M130 515L100 540M870 475L900 455',
          C.ink,
          7,
        ),
      ],
      fig(500, 830, 560, C.yellow, C.brown, {
        mood: 'sad',
        al: [-120, 10],
        ar: [120, 0],
        hair: C.brown,
      }),
    ),
    'w-idiom-26': cat(
      fig(500, 640, 520, C.blue, C.ink, {
        mood: 'smile',
        al: [-30, 150],
        ar: [30, 180],
      }),
      [
        RR(100, 600, 800, 40, 6, C.brown, {}),
        RR(170, 640, 40, 200, 6, C.brown, {}),
        RR(790, 640, 40, 200, 6, C.brown, {}),
        P('M180 600L820 600L750 520L250 520Z', C.paper, {}),
        L('M300 570H520M560 565L700 550', C.red, 16),
        L('M300 545L420 545', C.blue, 7),
      ],
      [
        E(300, 470, 24, 24, C.red, 0, {}),
        P('M268 540H332L318 490H282Z', C.red, {}),
        E(680, 470, 24, 24, C.blue, 0, {}),
        P('M648 540H712L698 490H662Z', C.blue, {}),
      ],
    ),
    'w-idiom-27': cat(
      gnd(830, C.paper),
      [
        E(820, 140, 70, 70, C.yellow, 0, {}),
        E(850, 120, 60, 60, '#FFFDF8', 0, { s: 'none' }),
      ].slice(0, 1),
      fig(500, 830, 500, C.red, C.blue, { mood: 'sad', hair: C.violet }),
      note(130, 480),
      note(870, 460),
      note(220, 250),
      note(740, 270),
      [
        L('M200 520Q170 560 200 600M240 500Q190 560 240 640', C.sky, 7),
        L('M800 500Q830 540 800 580M760 480Q810 540 760 620', C.sky, 7),
      ],
    ),
    'w-idiom-28': cat(
      gnd(820),
      place(deer(), 740, 820, 0.85, false),
      fig(260, 820, 560, C.red, C.ink, {
        mood: 'smile',
        hair: C.ink,
        ar: [170, 20],
      }),
      [
        E(260, 335, 70, 20, C.ink, 0, {}),
        RR(215, 300, 90, 40, 6, C.ink, {}),
      ].slice(0, 0),
    ),
    'w-idiom-29': cat(
      gnd(820),
      [
        RR(690, 450, 64, 380, 8, C.brown, {}),
        E(720, 320, 250, 200, C.green, 0, {}),
        E(580, 280, 26, 26, C.red, 0, {}),
        E(680, 220, 26, 26, C.red, 0, {}),
        E(790, 250, 26, 26, C.red, 0, {}),
        E(850, 360, 26, 26, C.red, 0, {}),
        E(640, 380, 26, 26, C.red, 0, {}),
        E(760, 330, 26, 26, C.red, 0, {}),
      ],
      fig(300, 820, 560, C.blue, C.brown, {
        mood: 'open',
        ar: [100, -150],
        hairStyle: 'cap',
        hair: C.violet,
      }),
      [P('M300 445Q290 475 300 495Q310 475 300 445Z', C.sky, {})],
    ),
    'w-idiom-30': cat(
      gnd(830),
      [
        RR(490, 480, 60, 360, 8, C.brown, {}),
        E(520, 330, 160, 190, C.green, 0, {}),
        P('M400 290A120 100 0 0 1 640 290Q520 240 400 290Z', C.violet, {}),
        E(480, 350, 20, 24, C.paper, 0, {}),
        E(560, 350, 20, 24, C.paper, 0, {}),
        E(484, 354, 8, 10, C.ink, 0, { s: 'none' }),
        E(564, 354, 8, 10, C.ink, 0, { s: 'none' }),
        L('M650 800V160', C.brown, 16),
        P('M650 100L630 170L670 170Z', C.violet, {}),
      ],
      [
        RR(790, 520, 50, 320, 8, C.brown, {}),
        E(815, 380, 120, 150, C.green, 0, {}),
        P('M720 350A95 80 0 0 1 910 350Q815 305 720 350Z', C.violet, {}),
        E(785, 400, 15, 18, C.paper, 0, {}),
        E(845, 400, 15, 18, C.paper, 0, {}),
        E(788, 404, 6, 8, C.ink, 0, { s: 'none' }),
        E(848, 404, 6, 8, C.ink, 0, { s: 'none' }),
      ],
      fig(200, 830, 520, C.orange, C.blue, {
        mood: 'open',
        brows: true,
        al: [-40, -120],
        ar: [40, -120],
        hair: C.brown,
      }),
    ),
    'w-idiom-31': cat(
      gnd(820),
      fig(280, 820, 560, C.sky, C.blue, {
        mood: 'smile',
        ar: [86, 87],
        hair: C.brown,
      }),
      TB(
        [
          [480, 580],
          [560, 440],
        ],
        16,
        C.brown,
      ),
      [E(480, 580, 12, 20, C.ink, 20, {})],
      [
        E(720, 250, 230, 160, C.paper, 0, {}),
        E(500, 430, 22, 22, C.paper, 0, {}),
        E(450, 480, 14, 14, C.paper, 0, {}),
      ],
      TB(
        [
          [620, 340],
          [620, 130],
        ],
        28,
        C.mint,
      ),
      TB(
        [
          [710, 350],
          [710, 120],
        ],
        28,
        C.mint,
      ),
      TB(
        [
          [800, 340],
          [800, 150],
        ],
        28,
        C.mint,
      ),
      [
        L(
          'M600 250H640M600 180H640M690 270H730M690 200H730M780 260H820M780 190H820',
          C.ink,
          7,
        ),
        E(570, 210, 34, 11, C.green, -25, {}),
        E(750, 160, 34, 11, C.green, 25, {}),
        E(850, 250, 34, 11, C.green, 25, {}),
      ],
    ),
    'w-idiom-32': cat(
      [['#FFFDF8', 'M0 790Q250 750 500 790T1000 780L1000 1000L0 1000Z', {}]],
      [
        P('M580 580L760 380L940 580Z', C.brown, { b: 1 }),
        P('M610 520L760 380L910 520Q760 560 610 520Z', C.paper, {
          i: 1,
          s: 'none',
        }),
        RR(620, 580, 280, 220, 0, C.yellow, {}),
        RR(730, 660, 70, 140, 6, C.brown, {}),
        RR(640, 620, 55, 55, 4, C.sky, {}),
      ],
      fig(280, 810, 540, C.red, C.brown, {
        mood: 'smile',
        al: [-16, 165],
        ar: [16, 165],
        hair: C.brown,
      }),
      [
        RR(200, 640, 160, 100, 12, C.brown, {}),
        E(235, 635, 30, 22, C.ink, 0, {}),
        E(285, 625, 32, 24, C.ink, 0, {}),
        E(335, 637, 28, 22, C.ink, 0, {}),
        hand(210, 655),
        hand(350, 655),
      ],
      [
        L('M130 190H170M150 170V210', C.sky, 7),
        L('M420 130H460M440 110V150', C.sky, 7),
        L('M620 250H660M640 230V270', C.sky, 7),
        L('M850 160H890M870 140V180', C.sky, 7),
        L('M450 420H490M470 400V440', C.sky, 7),
      ],
    ),
    'w-idiom-33': cat(
      [
        RR(130, 480, 740, 300, 20, C.pink, { b: 1 }),
        P(
          'M250 570L310 520L370 570L310 620ZM450 650L510 600L570 650L510 700ZM650 570L710 520L770 570L710 620ZM250 730L310 690L370 740L310 780ZM650 730L710 690L770 740L710 780Z',
          C.yellow,
          { i: 1, s: C.ink },
        ),
      ],
      TB(
        [
          [500, 600],
          [500, 740],
        ],
        16,
        C.green,
      ).slice(0, 0),
      [
        E(500, 330, 70, 100, C.red, 0, {}),
        E(500, 560, 70, 100, C.red, 0, {}),
        E(390, 445, 100, 70, C.red, 0, {}),
        E(610, 445, 100, 70, C.red, 0, {}),
        E(420, 360, 70, 70, C.red, 0, {}),
        E(580, 360, 70, 70, C.red, 0, {}),
        E(420, 530, 70, 70, C.red, 0, {}),
        E(580, 530, 70, 70, C.red, 0, {}),
        E(500, 445, 60, 60, C.yellow, 0, {}),
      ]
        .slice(0, 1)
        .concat([
          E(500, 330, 70, 100, C.red, 0, {}),
          E(500, 560, 70, 100, C.red, 0, {}),
          E(390, 445, 100, 70, C.red, 0, {}),
          E(610, 445, 100, 70, C.red, 0, {}),
          E(500, 445, 60, 60, C.yellow, 0, {}),
        ]),
      [
        star(220, 250, 50),
        star(800, 250, 50, C.sky),
        star(850, 420, 30, C.pink),
      ],
    ),
    'w-idiom-34': cat(
      gnd(800, C.paper).slice(0, 0),
      TB(
        [
          [220, 810],
          [790, 730],
        ],
        40,
        C.brown,
      ),
      TB(
        [
          [200, 730],
          [800, 810],
        ],
        40,
        C.brown,
      ),
      [
        P(
          'M560 130C660 280 820 360 800 560C790 700 690 780 560 780C430 780 330 700 320 560C300 360 460 280 560 130Z',
          C.red,
          {},
        ),
        P(
          'M560 330C620 440 710 480 700 620C690 700 630 740 560 740C490 740 430 700 420 620C410 480 500 440 560 330Z',
          C.orange,
          {},
        ),
        E(560, 670, 80, 85, C.yellow, 0, {}),
      ],
      [
        P('M60 220L290 290L250 440L30 370Z', C.red, {}),
        L('M70 280L40 340', C.ink, 7).slice(0, 0),
      ].slice(0, 1),
      TB(
        [
          [280, 330],
          [360, 350],
        ],
        28,
        C.red,
      ),
      [
        L('M370 345Q400 450 450 560', C.ink, 30),
        L('M370 345Q400 450 450 560', C.yellow, 16),
      ],
      [
        P('M60 230L90 340L80 370L30 360L40 330Z', C.yellow, {
          s: 'none',
        }).slice(0, 0),
      ].slice(0, 0),
    ),
    'w-idiom-35': cat(
      [
        RR(60, 140, 880, 680, 40, C.sky, {}),
        P(
          'M60 770Q150 740 250 775T450 775T650 775T850 770L940 770L940 790Q940 820 900 820L100 820Q60 820 60 790Z',
          C.yellow,
          {},
        ),
      ],
      TB(
        [
          [150, 780],
          [130, 650],
          [170, 560],
        ],
        22,
        C.mint,
      ),
      TB(
        [
          [820, 780],
          [840, 680],
          [800, 590],
        ],
        22,
        C.mint,
      ),
      TB(
        [
          [880, 780],
          [870, 700],
        ],
        18,
        C.green,
      ),
      [
        L(
          'M60 200Q130 170 200 200T340 200T480 200T620 200T760 200T900 200',
          C.paper,
          7,
        ),
      ],
      [
        E(780, 270, 28, 28, C.paper, 0, {}),
        E(850, 340, 18, 18, C.paper, 0, {}),
        E(250, 280, 20, 20, C.paper, 0, {}),
      ],
      place(fish(), 480, 800, 1),
      [L('M580 540Q620 590 680 560', C.ink, 7).slice(0, 0)],
    ),
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
