(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C;
  var INK = C.ink;
  function rad(d) {
    return (d * Math.PI) / 180;
  }
  function D(a) {
    return [Math.sin(rad(a)), Math.cos(rad(a))];
  }
  function ad(p, a, l) {
    var d = D(a);
    return [p[0] + d[0] * l, p[1] + d[1] * l];
  }
  function n(v) {
    return Math.round(v * 10) / 10;
  }
  function E(x, y, rx, ry, rot) {
    return (
      'E' +
      n(x) +
      ' ' +
      n(y) +
      ' ' +
      n(rx) +
      ' ' +
      n(ry) +
      (rot ? ' ' + rot : '')
    );
  }
  function line(d, col, w) {
    return ['none', d, { s: col || INK, w: w || 7 }];
  }
  function dot(x, y, r) {
    return [INK, E(x, y, r, r), { s: 'none' }];
  }
  function flat(color, y) {
    return [
      [color, 'M0 ' + y + 'L1000 ' + y + 'L1000 1000L0 1000Z', { s: 'none' }],
    ];
  }
  function bg(color) {
    return [[color, 'M0 0L1000 0L1000 1000L0 1000Z', { s: 'none' }]];
  }
  function waves(y, color, amp, step) {
    amp = amp || 25;
    step = step || 100;
    var d = 'M0 ' + y,
      x = 0,
      up = true;
    while (x < 1000) {
      d +=
        'Q' +
        (x + step / 2) +
        ' ' +
        (y + (up ? -amp : amp)) +
        ' ' +
        (x + step) +
        ' ' +
        y;
      x += step;
      up = !up;
    }
    d += 'L1000 1000L0 1000Z';
    return [[color, d, {}]];
  }
  function star(x, y, r, col) {
    var pts = [],
      i;
    for (i = 0; i < 10; i++) {
      var a = rad(i * 36 - 90),
        rr = i % 2 ? r * 0.45 : r;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    return [col || C.yellow, K.poly(pts, true), { w: 5 }];
  }
  function note(x, y, s) {
    s = s || 1;
    return [
      [INK, E(x, y, 22 * s, 16 * s, -20), { s: 'none' }],
      line(
        'M' +
          n(x + 20 * s) +
          ' ' +
          n(y - 4 * s) +
          'L' +
          n(x + 20 * s) +
          ' ' +
          n(y - 90 * s) +
          'L' +
          n(x + 55 * s) +
          ' ' +
          n(y - 60 * s),
        INK,
        9,
      ),
    ];
  }
  // simple person
  function human(o) {
    var h = o.h || 600,
      x = o.x,
      fy = o.y,
      side = o.side || 0;
    var skin = o.skin || C.yellow,
      hair = o.hair || C.brown,
      shirt = o.shirt || C.sky,
      pants = o.pants || C.blue,
      shoe = o.shoe || C.brown;
    var legU = 0.21 * h,
      legL = 0.2 * h,
      torso = 0.3 * h;
    var lw = 0.07 * h,
      aw = 0.058 * h;
    var pel = [x, fy - legU - legL - 0.02 * h];
    var lean = o.lean || 0;
    var neck = ad(pel, 180 - lean, torso);
    var sh = ad(pel, 180 - lean, torso - 0.03 * h);
    var perp = [Math.cos(rad(lean)), -Math.sin(rad(lean))];
    var hw = side ? 0 : 0.045 * h,
      sw = side ? 0 : 0.1 * h;
    var legs = o.legs || [
      [4, 0],
      [-4, 0],
    ];
    var arms = o.arms || [
      [8, 4],
      [-8, -4],
    ];
    var hr = 0.1 * h;
    var hc = ad(neck, 180 - lean * 0.5, hr * 1.05);
    var out = [],
      pts = {
        hands: [],
        feet: [],
        head: [hc[0], hc[1], hr],
        neck: neck,
        pel: pel,
      };
    var order = side ? [0, 1] : [0, 1];
    var i;
    for (i = 0; i < 2; i++) {
      var sg = i === 0 ? -1 : 1;
      var hip = [pel[0] + sg * hw, pel[1]];
      var kn = ad(hip, legs[i][0], legU),
        an = ad(kn, legs[i][1], legL);
      pts.feet.push(an);
      if (o.dress) out = out.concat(K.tube([hip, kn, an], lw * 0.8, skin));
      else out = out.concat(K.tube([hip, kn, an], lw, pants));
      var fd = side ? side : sg * 0.5;
      out.push([
        shoe,
        E(an[0] + fd * 0.035 * h, an[1] + 0.012 * h, 0.06 * h, 0.03 * h),
        {},
      ]);
    }
    out = out.concat(
      K.tube(
        [pel, ad(pel, 180 - lean, torso - 0.05 * h)],
        0.19 * h,
        o.dress || shirt,
      ),
    );
    if (o.dress) {
      var wl = ad(pel, 180 - lean, torso * 0.5);
      out.push([
        o.dress,
        'M' +
          n(wl[0] - 0.08 * h) +
          ' ' +
          n(wl[1]) +
          'L' +
          n(wl[0] + 0.08 * h) +
          ' ' +
          n(wl[1]) +
          'L' +
          n(x + 0.2 * h) +
          ' ' +
          n(fy - 0.25 * h) +
          'Q' +
          n(x) +
          ' ' +
          n(fy - 0.17 * h) +
          ' ' +
          n(x - 0.2 * h) +
          ' ' +
          n(fy - 0.25 * h) +
          'Z',
        {},
      ]);
    }
    for (i = 0; i < 2; i++) {
      var sg2 = i === 0 ? -1 : 1;
      var s0 = [sh[0] + perp[0] * sg2 * sw, sh[1] + perp[1] * sg2 * sw];
      var el = ad(s0, arms[i][0], 0.16 * h),
        ha = ad(el, arms[i][1], 0.15 * h);
      pts.hands.push(ha);
      out = out.concat(K.tube([s0, el, ha], aw, o.longSleeve ? shirt : skin));
      out.push([skin, E(ha[0], ha[1], 0.032 * h, 0.032 * h), {}]);
    }
    // hair back
    var cx = hc[0],
      cy = hc[1];
    if (o.hs === 'long')
      out.push([
        hair,
        'R' +
          n(cx - hr * 1.15) +
          ' ' +
          n(cy - hr * 0.9) +
          ' ' +
          n(hr * 2.3) +
          ' ' +
          n(hr * 2.7) +
          ' ' +
          n(hr * 0.9),
        {},
      ]);
    out.push([skin, E(cx, cy, hr, hr), {}]);
    var fx = side * hr * 0.38;
    var face = o.face === undefined ? 'smile' : o.face;
    if (face) {
      var ey = cy - hr * 0.05;
      if (face === 'closed') {
        if (side)
          out.push(
            line(
              'M' +
                n(cx + fx - 14) +
                ' ' +
                n(ey) +
                'Q' +
                n(cx + fx) +
                ' ' +
                n(ey + 10) +
                ' ' +
                n(cx + fx + 14) +
                ' ' +
                n(ey),
              INK,
              7,
            ),
          );
        else
          out.push(
            line(
              'M' +
                n(cx - hr * 0.5) +
                ' ' +
                n(ey) +
                'Q' +
                n(cx - hr * 0.33) +
                ' ' +
                n(ey + 10) +
                ' ' +
                n(cx - hr * 0.16) +
                ' ' +
                n(ey) +
                'M' +
                n(cx + hr * 0.16) +
                ' ' +
                n(ey) +
                'Q' +
                n(cx + hr * 0.33) +
                ' ' +
                n(ey + 10) +
                ' ' +
                n(cx + hr * 0.5) +
                ' ' +
                n(ey),
              INK,
              7,
            ),
          );
      } else if (side) out.push(dot(cx + fx + side * hr * 0.2, ey, hr * 0.09));
      else {
        out.push(dot(cx - hr * 0.34 + fx, ey, hr * 0.09));
        out.push(dot(cx + hr * 0.34 + fx, ey, hr * 0.09));
      }
      var mx = cx + fx + (side ? side * hr * 0.2 : 0),
        my = cy + hr * 0.42;
      if (face === 'open')
        out.push([
          C.red,
          'M' +
            n(mx - hr * 0.3) +
            ' ' +
            n(my - 4) +
            'Q' +
            n(mx) +
            ' ' +
            n(my + hr * 0.6) +
            ' ' +
            n(mx + hr * 0.3) +
            ' ' +
            n(my - 4) +
            'Z',
          { w: 6 },
        ]);
      else if (face === 'o')
        out.push([C.red, E(mx, my + 4, hr * 0.14, hr * 0.2), { w: 6 }]);
      else if (face !== 'none')
        out.push(
          line(
            'M' +
              n(mx - hr * 0.28) +
              ' ' +
              n(my) +
              'Q' +
              n(mx) +
              ' ' +
              n(my + hr * 0.3) +
              ' ' +
              n(mx + hr * 0.28) +
              ' ' +
              n(my),
            INK,
            7,
          ),
        );
    }
    var hs = o.hs || 'short';
    var r1 = hr * 1.05;
    if (hs === 'short' || hs === 'long' || hs === 'bun') {
      out.push([
        hair,
        'M' +
          n(cx - r1) +
          ' ' +
          n(cy + hr * 0.05) +
          'A' +
          n(r1) +
          ' ' +
          n(r1) +
          ' 0 0 1 ' +
          n(cx + r1) +
          ' ' +
          n(cy + hr * 0.05) +
          'Q' +
          n(cx + hr * 0.3) +
          ' ' +
          n(cy - hr * 0.5) +
          ' ' +
          n(cx - hr * 0.5) +
          ' ' +
          n(cy - hr * 0.25) +
          'Q' +
          n(cx - hr * 0.9) +
          ' ' +
          n(cy - hr * 0.1) +
          ' ' +
          n(cx - r1) +
          ' ' +
          n(cy + hr * 0.05) +
          'Z',
        {},
      ]);
      if (hs === 'bun')
        out.push([hair, E(cx, cy - hr * 1.2, hr * 0.38, hr * 0.38), {}]);
    } else if (hs === 'cap') {
      out.push([
        o.cap || C.red,
        'M' +
          n(cx - r1) +
          ' ' +
          n(cy - hr * 0.1) +
          'A' +
          n(r1) +
          ' ' +
          n(r1) +
          ' 0 0 1 ' +
          n(cx + r1) +
          ' ' +
          n(cy - hr * 0.1) +
          'Z',
        {},
      ]);
      out.push([
        o.cap || C.red,
        'R' +
          n(cx - r1 * 1.25) +
          ' ' +
          n(cy - hr * 0.2) +
          ' ' +
          n(r1 * 2.5) +
          ' ' +
          n(hr * 0.18) +
          ' 8',
        {},
      ]);
    }
    out.pts = pts;
    return out;
  }
  function stick(x1, y1, x2, y2, col, w) {
    return K.tube(
      [
        [x1, y1],
        [x2, y2],
      ],
      w || 16,
      col || C.brown,
    );
  }
  var recipes = {};
  // 1200 玉兔
  recipes['w-fantasy-51'] = [].concat(
    bg(C.blue),
    [
      star(150, 150, 30),
      star(850, 200, 24),
      star(780, 90, 16),
      star(220, 330, 16),
    ],
    [
      [C.yellow, E(500, 470, 300, 300), { b: 1, w: 9 }],
      [C.orange, E(260, 330, 50, 36, -30), { i: 1, s: 'none' }],
      [C.orange, E(740, 300, 40, 30, 20), { i: 1, s: 'none' }],
      [C.orange, E(280, 600, 36, 28), { i: 1, s: 'none' }],
    ],
    // mortar
    [
      [C.brown, 'M590 690L800 690Q800 810 695 810Q590 810 590 690Z', {}],
      [C.orange, 'R570 665 250 40 16', {}],
    ],
    // rabbit
    [
      [C.paper, E(440, 640, 105, 125), {}],
      [C.paper, E(440, 490, 85, 75), {}],
      [C.paper, E(395, 330, 30, 95, -10), {}],
      [C.paper, E(485, 330, 30, 95, 10), {}],
      [C.pink, E(395, 335, 14, 70, -10), { s: 'none' }],
      [C.pink, E(485, 335, 14, 70, 10), { s: 'none' }],
      dot(405, 485, 10),
      dot(475, 485, 10),
      [C.pink, E(440, 520, 12, 9), { w: 5 }],
      line('M440 530Q425 552 408 540M440 530Q455 552 472 540', INK, 6),
    ],
    K.tube(
      [
        [520, 620],
        [640, 640],
        [700, 600],
      ],
      26,
      C.paper,
    ),
    K.tube(
      [
        [690, 680],
        [720, 540],
      ],
      28,
      C.brown,
    ),
    [
      [C.paper, E(380, 760, 50, 22), {}],
      [C.paper, E(490, 760, 50, 22), {}],
    ],
  );
  // 1201 牛郎
  recipes['w-fantasy-52'] = [].concat(
    flat(C.mint, 790),
    // cow
    [
      [
        C.paper,
        'M610 520C610 480 880 480 900 540L900 660C900 700 610 700 610 660Z',
        { b: 1 },
      ],
      [C.brown, E(700, 560, 55, 45), { i: 1, s: 'none' }],
      [C.brown, E(830, 640, 50, 40), { i: 1, s: 'none' }],
      [C.paper, 'R560 500 130 130 50', {}],
    ],
    [
      [C.paper, 'R620 660 40 130 10', {}],
      [C.paper, 'R690 660 40 130 10', {}],
      [C.paper, 'R810 660 40 130 10', {}],
      [C.paper, 'R860 660 40 130 10', {}],
    ],
    [
      [C.paper, 'R540 470 140 120 50', { b: 1 }],
      [C.brown, E(590, 500, 40, 30), { i: 1, s: 'none' }],
      [C.pink, 'R545 540 130 50 24', {}],
      dot(620, 490, 9),
      dot(570, 490, 9),
      dot(610, 560, 7),
      dot(590, 560, 7),
      [C.yellow, 'M560 470L520 400L585 450Z', {}],
      [C.yellow, 'M660 470L700 400L635 450Z', {}],
      [C.paper, E(520, 490, 28, 14, 25), {}],
      [C.paper, E(700, 490, 28, 14, -25), {}],
      line('M900 560C950 600 950 680 930 720', INK, 14),
    ],
    human({
      x: 270,
      y: 840,
      h: 640,
      shirt: C.orange,
      pants: C.blue,
      hs: 'cap',
      cap: C.yellow,
      arms: [
        [10, 6],
        [70, 80],
      ],
      legs: [
        [5, 0],
        [-5, 0],
      ],
    }),
    [line('M390 560Q470 610 540 560', C.brown, 8)],
  );
  // 1202 媽祖
  (function () {
    var p = human({
      x: 500,
      y: 860,
      h: 640,
      dress: C.red,
      hs: 'long',
      hair: C.ink,
      arms: [
        [-15, 110],
        [15, -110],
      ],
      legs: [
        [2, 0],
        [-2, 0],
      ],
      shoe: C.yellow,
    });
    var hd = p.pts.head;
    recipes['w-fantasy-53'] = [].concat(
      [[C.yellow, E(hd[0], hd[1], 150, 150), { s: 'none' }]],
      p,
      [
        [C.yellow, 'R' + (hd[0] - 110) + ' ' + (hd[1] - 130) + ' 220 36 6', {}],
        line(
          'M' +
            (hd[0] - 90) +
            ' ' +
            (hd[1] - 94) +
            'L' +
            (hd[0] - 90) +
            ' ' +
            (hd[1] - 20) +
            'M' +
            (hd[0] - 50) +
            ' ' +
            (hd[1] - 94) +
            'L' +
            (hd[0] - 50) +
            ' ' +
            (hd[1] - 30) +
            'M' +
            (hd[0] + 50) +
            ' ' +
            (hd[1] - 94) +
            'L' +
            (hd[0] + 50) +
            ' ' +
            (hd[1] - 30) +
            'M' +
            (hd[0] + 90) +
            ' ' +
            (hd[1] - 94) +
            'L' +
            (hd[0] + 90) +
            ' ' +
            (hd[1] - 20),
          INK,
          6,
        ),
        [C.yellow, 'R450 560 100 26 8', {}],
        [C.yellow, 'R430 530 140 24 8', { s: INK }],
      ],
      waves(840, C.sky, 24, 100),
    );
  })();
  // 1203 海怪
  (function () {
    function tent(d) {
      return [
        ['none', d, { s: INK, w: 70 }],
        ['none', d, { s: C.violet, w: 56 }],
      ];
    }
    recipes['w-fantasy-54'] = [].concat(
      bg('#FFFDF8'),
      tent('M300 640C200 560 150 420 230 300C260 250 320 260 300 320'),
      tent('M700 640C800 560 850 420 770 300C740 250 680 260 700 320'),
      tent('M400 640C380 520 400 400 340 340'),
      tent('M600 640C620 520 600 400 660 340'),
      [
        [
          C.violet,
          'M290 650C270 380 400 270 500 270C600 270 730 380 710 650Z',
          {},
        ],
        [C.paper, E(430, 440, 55, 65), {}],
        [C.paper, E(570, 440, 55, 65), {}],
        dot(440, 450, 26),
        dot(560, 450, 26),
        [C.red, 'M420 570Q500 640 580 570Z', { w: 6 }],
        [C.pink, E(380, 350, 18, 14), { s: 'none' }],
        [C.pink, E(620, 350, 18, 14), { s: 'none' }],
      ],
      waves(640, C.sky, 26, 100),
      [
        [C.brown, 'M80 750L250 750L215 810L115 810Z', {}],
        line('M165 750L165 640', INK, 9),
        [C.paper, 'M165 645L165 740L100 740Z', {}],
      ],
    );
  })();
  // 1204 傳送門
  recipes['w-fantasy-55'] = [].concat(
    flat(C.mint, 840),
    [
      [C.violet, E(560, 500, 210, 330), { w: 9 }],
      [C.blue, E(560, 500, 160, 280), { w: 9 }],
      line(
        'M560 270C690 290 700 430 580 450C480 465 470 560 570 580C650 595 650 680 560 720',
        C.sky,
        20,
      ),
      line('M560 330C640 345 640 410 580 420', C.paper, 12),
      star(330, 280, 30),
      star(820, 200, 22),
      star(850, 640, 24),
      star(320, 560, 16),
    ],
    human({
      x: 230,
      y: 860,
      h: 400,
      shirt: C.orange,
      pants: C.blue,
      hs: 'short',
      arms: [
        [40, 60],
        [60, 80],
      ],
      legs: [
        [20, 0],
        [-10, -5],
      ],
    }),
  );
  // 1205 海妖
  recipes['w-fantasy-56'] = [].concat(
    [
      [
        C.violet,
        'M180 800C180 640 350 600 500 620C650 600 820 660 820 800Z',
        {},
      ],
    ],
    [[C.violet, E(510, 380, 100, 150), { s: 'none' }]],
    [
      [
        C.mint,
        'M440 610C380 560 360 520 430 480C500 440 640 500 700 560C740 600 790 620 840 580C860 660 800 720 700 710C580 700 520 680 440 610Z',
        {},
      ],
      line('M680 570C700 600 740 610 780 600', C.green, 9),
    ],
    K.tube(
      [
        [470, 560],
        [470, 430],
      ],
      100,
      C.yellow,
    ),
    K.tube(
      [
        [430, 460],
        [350, 400],
        [330, 300],
      ],
      38,
      C.yellow,
    ),
    K.tube(
      [
        [510, 460],
        [590, 400],
        [610, 300],
      ],
      38,
      C.yellow,
    ),
    [
      [C.pink, E(440, 480, 26, 22), {}],
      [C.pink, E(500, 480, 26, 22), {}],
    ],
    [
      [C.violet, 'R400 270 140 200 60', {}],
      [C.yellow, E(470, 320, 78, 82), {}],
      [
        C.violet,
        'M390 320C390 220 550 220 550 320C500 270 440 270 390 320Z',
        {},
      ],
      dot(445, 330, 9),
      dot(495, 330, 9),
      [C.red, E(470, 375, 18, 22), { w: 6 }],
    ],
    [note(250, 250, 1), note(730, 230, 1.1)],
    waves(800, C.sky, 24, 100),
  );
  // 1206 樹精
  recipes['w-fantasy-57'] = [].concat(
    flat(C.mint, 800),
    K.tube(
      [
        [330, 540],
        [200, 480],
        [160, 380],
      ],
      40,
      C.brown,
    ),
    K.tube(
      [
        [670, 540],
        [800, 470],
        [840, 360],
      ],
      40,
      C.brown,
    ),
    [
      [C.mint, E(150, 340, 60, 50), {}],
      [C.mint, E(850, 320, 60, 50), {}],
    ],
    [
      [
        C.brown,
        'M380 800C400 700 360 600 350 500C420 470 580 470 650 500C640 600 600 700 620 800C560 780 440 780 380 800Z',
        {},
      ],
    ],
    [
      [C.green, E(500, 280, 250, 190), {}],
      [C.mint, E(330, 320, 110, 90), {}],
      [C.mint, E(660, 300, 120, 100), {}],
      [C.mint, E(500, 200, 130, 80), {}],
    ],
    [
      [C.paper, E(440, 570, 30, 34), {}],
      [C.paper, E(560, 570, 30, 34), {}],
      dot(445, 575, 13),
      dot(555, 575, 13),
      line('M500 600L490 640L510 640', INK, 7),
      [C.red, 'M450 680Q500 730 550 680Z', { w: 6 }],
    ],
  );
  // 1207 河童
  recipes['w-fantasy-58'] = [].concat(
    [[C.brown, E(500, 590, 190, 200), {}]],
    K.tube(
      [
        [420, 700],
        [410, 810],
      ],
      56,
      C.green,
    ),
    K.tube(
      [
        [580, 700],
        [590, 810],
      ],
      56,
      C.green,
    ),
    [
      [C.green, E(400, 830, 55, 26), {}],
      [C.green, E(600, 830, 55, 26), {}],
    ],
    [
      [C.green, E(500, 600, 135, 170), {}],
      [C.mint, E(500, 640, 85, 110), { s: 'none' }],
    ],
    K.tube(
      [
        [390, 520],
        [320, 600],
        [360, 660],
      ],
      40,
      C.green,
    ),
    K.tube(
      [
        [610, 520],
        [680, 580],
        [700, 500],
      ],
      40,
      C.green,
    ),
    [[C.mint, E(380, 680, 100, 24, -35), {}]],
    [
      [C.green, E(500, 380, 150, 120), {}],
      [C.ink, 'M370 330C400 270 600 270 630 330C580 300 420 300 370 330Z', {}],
      [C.sky, E(500, 285, 70, 20), {}],
      [C.paper, E(440, 380, 32, 34), {}],
      [C.paper, E(560, 380, 32, 34), {}],
      dot(445, 385, 13),
      dot(555, 385, 13),
      [
        C.yellow,
        'M440 420C460 400 540 400 560 420C550 470 450 470 440 420Z',
        {},
      ],
      line('M450 435L550 435', INK, 6),
    ],
    waves(850, C.sky, 20, 100),
  );
  // 1208 狐仙
  recipes['w-fantasy-59'] = [].concat(
    K.T(
      [
        [
          C.orange,
          'M620 780C800 800 900 680 850 540C830 470 770 480 780 540C790 620 740 700 620 700Z',
          { b: 1 },
        ],
        [
          C.paper,
          'M850 540C830 470 790 480 780 530C810 520 830 520 850 540Z',
          { i: 1, s: 'none' },
        ],
      ],
      { dx: -60 },
    ),
    [
      [
        C.orange,
        'M340 820C260 820 250 640 310 570C350 520 470 520 540 580C610 650 590 820 520 820Z',
        { b: 1 },
      ],
      [C.paper, E(430, 710, 70, 100), { i: 1 }],
    ],
    K.T(
      [
        [C.ink, 'M300 400L290 220L400 310ZM560 400L570 220L460 310Z', {}],
        [
          C.orange,
          'M300 380L295 235L385 305ZM560 380L565 235L475 305Z',
          { s: 'none' },
        ],
        [
          C.orange,
          'M300 400C290 330 360 300 430 300C500 300 570 330 560 400C555 450 480 480 430 480C380 480 305 450 300 400Z',
          {},
        ],
        [
          C.paper,
          'M300 400C310 440 380 450 430 430C480 450 550 440 560 400C560 470 480 490 430 490C380 490 300 470 300 400Z',
          { s: 'none' },
        ],
        line('M370 380L400 395M490 380L460 395', INK, 8),
        dot(430, 410, 13),
        line(
          'M430 420L430 440M430 440Q405 455 390 440M430 440Q455 455 470 440',
          INK,
          6,
        ),
      ],
      { dy: 60 },
    ),
    [
      [C.orange, E(370, 820, 50, 26), {}],
      [C.orange, E(490, 820, 50, 26), {}],
    ],
    [
      [
        C.red,
        'M200 200C150 140 230 100 210 50C290 100 300 160 270 200C260 240 220 240 200 200Z',
        {},
      ],
      [
        C.yellow,
        'M225 200C210 170 250 150 245 125C275 150 275 180 255 205Z',
        { s: 'none' },
      ],
      [
        C.red,
        'M700 220C650 160 730 120 710 70C790 120 800 180 770 220C760 260 720 260 700 220Z',
        {},
      ],
      [
        C.yellow,
        'M725 220C710 190 750 170 745 145C775 170 775 200 755 225Z',
        { s: 'none' },
      ],
    ],
  );
  // 1209 龍王
  (function () {
    var p = human({
      x: 450,
      y: 860,
      h: 580,
      dress: C.blue,
      hs: 'bald',
      arms: [
        [-20, -10],
        [60, 160],
      ],
      legs: [
        [2, 0],
        [-2, 0],
      ],
      shoe: C.yellow,
      face: 'neutral',
    });
    var hd = p.pts.head,
      cx = hd[0],
      cy = hd[1],
      r = hd[2];
    var hand = p.pts.hands[1];
    recipes['w-fantasy-60'] = [].concat(
      K.tube(
        [
          [hand[0], hand[1] + 130],
          [hand[0], hand[1] - 180],
        ],
        18,
        C.brown,
      ),
      [
        [
          'none',
          'M' +
            (hand[0] - 70) +
            ' ' +
            (hand[1] - 250) +
            'L' +
            (hand[0] - 70) +
            ' ' +
            (hand[1] - 330) +
            'M' +
            hand[0] +
            ' ' +
            (hand[1] - 170) +
            'L' +
            hand[0] +
            ' ' +
            (hand[1] - 320) +
            'M' +
            (hand[0] + 70) +
            ' ' +
            (hand[1] - 250) +
            'L' +
            (hand[0] + 70) +
            ' ' +
            (hand[1] - 330),
          { s: C.yellow, w: 14 },
        ],
        [
          'none',
          'M' +
            (hand[0] - 70) +
            ' ' +
            (hand[1] - 250) +
            'Q' +
            hand[0] +
            ' ' +
            (hand[1] - 150) +
            ' ' +
            (hand[0] + 70) +
            ' ' +
            (hand[1] - 250),
          { s: INK, w: 28 },
        ],
        [
          'none',
          'M' +
            (hand[0] - 70) +
            ' ' +
            (hand[1] - 250) +
            'Q' +
            hand[0] +
            ' ' +
            (hand[1] - 150) +
            ' ' +
            (hand[0] + 70) +
            ' ' +
            (hand[1] - 250),
          { s: C.yellow, w: 14 },
        ],
      ],
      K.tube(
        [
          [cx - 40, cy - r - 10],
          [cx - 90, cy - r - 80],
          [cx - 70, cy - r - 130],
        ],
        14,
        C.orange,
      ),
      K.tube(
        [
          [cx + 40, cy - r - 10],
          [cx + 90, cy - r - 80],
          [cx + 70, cy - r - 130],
        ],
        14,
        C.orange,
      ),
      p,
      [
        [
          C.paper,
          'M' +
            (cx - r * 0.9) +
            ' ' +
            (cy + r * 0.1) +
            'Q' +
            (cx - r * 0.5) +
            ' ' +
            (cy + r * 0.3) +
            ' ' +
            cx +
            ' ' +
            (cy + r * 0.25) +
            'Q' +
            (cx + r * 0.5) +
            ' ' +
            (cy + r * 0.3) +
            ' ' +
            (cx + r * 0.9) +
            ' ' +
            (cy + r * 0.1) +
            'C' +
            (cx + r * 0.9) +
            ' ' +
            (cy + r * 1.9) +
            ' ' +
            (cx + r * 0.2) +
            ' ' +
            (cy + r * 2.3) +
            ' ' +
            cx +
            ' ' +
            (cy + r * 2.4) +
            'C' +
            (cx - r * 0.2) +
            ' ' +
            (cy + r * 2.3) +
            ' ' +
            (cx - r * 0.9) +
            ' ' +
            (cy + r * 1.9) +
            ' ' +
            (cx - r * 0.9) +
            ' ' +
            (cy + r * 0.1) +
            'Z',
          {},
        ],
        dot(cx - 33, cy - 5, 8),
        dot(cx + 33, cy - 5, 8),
        [C.yellow, 'R' + (cx - 100) + ' ' + (cy - r - 40) + ' 200 34 6', {}],
      ],
      waves(830, C.sky, 24, 100),
    );
  })();
  function foxHead(cx, cy, s) {
    return K.T(
      [
        [C.ink, 'M300 400L290 220L400 310ZM560 400L570 220L460 310Z', {}],
        [
          C.orange,
          'M300 380L295 235L385 305ZM560 380L565 235L475 305Z',
          { s: 'none' },
        ],
        [
          C.orange,
          'M300 400C290 330 360 300 430 300C500 300 570 330 560 400C555 450 480 480 430 480C380 480 305 450 300 400Z',
          {},
        ],
        [
          C.paper,
          'M300 400C310 440 380 450 430 430C480 450 550 440 560 400C560 470 480 490 430 490C380 490 300 470 300 400Z',
          { s: 'none' },
        ],
        line('M370 380L400 395M490 380L460 395', INK, 8),
        dot(430, 410, 13),
        line(
          'M430 420L430 440M430 440Q405 455 390 440M430 440Q455 455 470 440',
          INK,
          6,
        ),
      ],
      { dx: cx - 430, dy: cy - 390, s: s, cx: 430, cy: 390 },
    );
  }
  // 1210 沙悟淨
  (function () {
    var p = human({
      x: 360,
      y: 840,
      h: 620,
      shirt: C.blue,
      pants: C.brown,
      hs: 'bald',
      arms: [
        [-10, -5],
        [35, 165],
      ],
      legs: [
        [3, 0],
        [-3, 0],
      ],
      face: 'neutral',
    });
    var hd = p.pts.head,
      nk = p.pts.neck,
      hand = p.pts.hands[1],
      cx = hd[0],
      cy = hd[1],
      r = hd[2];
    var neck = [],
      i;
    for (i = 0; i < 9; i++) {
      var dx = (i - 4) * 22;
      neck.push([
        C.paper,
        E(
          nk[0] + dx,
          nk[1] + 36 + (16 - (i - 4) * (i - 4)) * 1.6 * -1 + 26,
          13,
          13,
        ),
        { w: 6 },
      ]);
    }
    recipes['w-fantasy-61'] = [].concat(
      K.tube(
        [
          [hand[0], hand[1] + 260],
          [hand[0], hand[1] - 230],
        ],
        22,
        C.brown,
      ),
      [
        [
          C.yellow,
          'M' +
            (hand[0] - 100) +
            ' ' +
            (hand[1] - 330) +
            'C' +
            (hand[0] - 100) +
            ' ' +
            (hand[1] - 190) +
            ' ' +
            (hand[0] + 100) +
            ' ' +
            (hand[1] - 190) +
            ' ' +
            (hand[0] + 100) +
            ' ' +
            (hand[1] - 330) +
            'C' +
            (hand[0] + 50) +
            ' ' +
            (hand[1] - 260) +
            ' ' +
            (hand[0] - 50) +
            ' ' +
            (hand[1] - 260) +
            ' ' +
            (hand[0] - 100) +
            ' ' +
            (hand[1] - 330) +
            'Z',
          {},
        ],
      ],
      p,
      neck,
      [
        [
          C.brown,
          'M' +
            (cx - r * 0.95) +
            ' ' +
            (cy + r * 0.05) +
            'Q' +
            cx +
            ' ' +
            (cy + r * 0.25) +
            ' ' +
            (cx + r * 0.95) +
            ' ' +
            (cy + r * 0.05) +
            'C' +
            (cx + r * 0.9) +
            ' ' +
            (cy + r * 1.3) +
            ' ' +
            (cx + r * 0.3) +
            ' ' +
            (cy + r * 1.6) +
            ' ' +
            cx +
            ' ' +
            (cy + r * 1.6) +
            'C' +
            (cx - r * 0.3) +
            ' ' +
            (cy + r * 1.6) +
            ' ' +
            (cx - r * 0.9) +
            ' ' +
            (cy + r * 1.3) +
            ' ' +
            (cx - r * 0.95) +
            ' ' +
            (cy + r * 0.05) +
            'Z',
          {},
        ],
        dot(cx - 25, cy - 6, 8),
        dot(cx + 25, cy - 6, 8),
        line(
          'M' +
            (cx - 40) +
            ' ' +
            (cy - 26) +
            'L' +
            (cx - 12) +
            ' ' +
            (cy - 20) +
            'M' +
            (cx + 40) +
            ' ' +
            (cy - 26) +
            'L' +
            (cx + 12) +
            ' ' +
            (cy - 20),
          INK,
          7,
        ),
      ],
      waves(850, C.sky, 20, 100),
    );
  })();
  // 1211 織女
  (function () {
    var p = human({
      x: 300,
      y: 860,
      h: 640,
      dress: C.pink,
      hs: 'bun',
      hair: C.ink,
      arms: [
        [-8, -4],
        [55, 85],
      ],
      legs: [
        [2, 0],
        [-2, 0],
      ],
      shoe: C.red,
    });
    var st = [],
      i;
    for (i = 0; i < 5; i++)
      st.push([
        'none',
        'M' + (650 + i * 50) + ' 380L' + (650 + i * 50) + ' 700',
        { s: [C.pink, C.violet, C.red, C.violet, C.pink][i], w: 20 },
      ]);
    recipes['w-fantasy-62'] = [].concat(
      [star(160, 130, 30), star(500, 90, 20), star(850, 150, 28)],
      [
        [C.brown, 'R560 320 40 540 8', {}],
        [C.brown, 'R880 320 40 540 8', {}],
        [C.brown, 'R540 300 400 50 10', {}],
        [C.brown, 'R560 700 360 36 8', {}],
      ],
      [[C.paper, 'R620 360 260 340', { b: 1, s: 'none' }]],
      st.map(function (l) {
        l[2].i = 1;
        return l;
      }),
      [[C.paper, 'R620 360 260 340', { s: INK, w: 7, f: 0 }]].map(function (l) {
        return ['none', l[1], { s: INK, w: 7 }];
      }),
      p,
    );
  })();
  // 1212 半人馬
  recipes['w-fantasy-63'] = [].concat(
    flat(C.mint, 860),
    K.tube(
      [
        [760, 640],
        [880, 680],
        [850, 800],
      ],
      30,
      C.ink,
    ),
    K.tube(
      [
        [640, 700],
        [650, 860],
      ],
      40,
      C.brown,
    ),
    K.tube(
      [
        [730, 700],
        [750, 860],
      ],
      40,
      C.brown,
    ),
    [[C.brown, E(570, 660, 220, 105), {}]],
    K.tube(
      [
        [420, 700],
        [400, 860],
      ],
      40,
      C.brown,
    ),
    K.tube(
      [
        [490, 700],
        [490, 860],
      ],
      40,
      C.brown,
    ),
    [
      [C.ink, E(402, 862, 28, 12), {}],
      [C.ink, E(490, 862, 28, 12), {}],
      [C.ink, E(652, 862, 28, 12), {}],
      [C.ink, E(752, 862, 28, 12), {}],
    ],
    K.tube(
      [
        [400, 660],
        [400, 450],
      ],
      120,
      C.brown,
    ),
    K.tube(
      [
        [400, 560],
        [400, 460],
      ],
      100,
      C.sky,
    ),
    K.tube(
      [
        [350, 480],
        [270, 480],
      ],
      36,
      C.yellow,
    ),
    [
      ['none', 'M170 280C100 440 100 560 170 700', { s: INK, w: 30 }],
      ['none', 'M170 280C100 440 100 560 170 700', { s: C.brown, w: 16 }],
    ],
    line('M170 280L220 490L170 700', INK, 5),
    K.tube(
      [
        [440, 450],
        [520, 470],
        [540, 540],
      ],
      36,
      C.yellow,
    ),
    [
      [C.yellow, E(400, 340, 78, 82), {}],
      [C.ink, 'M322 340C322 250 480 250 478 340C440 290 360 290 322 340Z', {}],
      dot(425, 345, 9),
      dot(380, 345, 9),
      line('M385 385Q405 400 425 385', INK, 7),
    ],
  );
  // 1213 九尾狐
  (function () {
    var t = [],
      i,
      ang = [-64, -48, -32, -16, 0, 16, 32, 48, 64];
    for (i = 0; i < 9; i++) {
      t = t.concat(
        K.T(
          [
            [
              C.orange,
              'M500 800C440 640 450 440 500 330C550 440 560 640 500 800Z',
              { b: 1 },
            ],
            [C.paper, 'M440 400L560 400L500 320Z', { i: 1, s: 'none' }],
          ],
          { rot: ang[i], cx: 500, cy: 800 },
        ),
      );
    }
    recipes['w-fantasy-64'] = [].concat(
      t,
      [
        [C.orange, E(500, 800, 105, 90), {}],
        [C.paper, E(500, 810, 55, 60), { s: 'none' }],
      ],
      foxHead(500, 660, 0.8),
      [
        [C.orange, E(440, 880, 40, 22), {}],
        [C.orange, E(560, 880, 40, 22), {}],
      ],
    );
  })();
  // 1214 魔法書
  recipes['w-fantasy-65'] = [].concat(
    [
      star(500, 150, 56),
      star(280, 250, 28),
      star(730, 240, 32),
      star(380, 110, 18),
      star(640, 110, 16),
    ],
    [
      [C.violet, 'R150 500 700 290 24', {}],
      [
        C.paper,
        'M190 520C300 480 430 480 495 520L495 750C430 710 300 710 190 750Z',
        {},
      ],
      [
        C.paper,
        'M810 520C700 480 570 480 505 520L505 750C570 710 700 710 810 750Z',
        {},
      ],
      line(
        'M230 570C300 550 400 550 450 575M230 620C300 600 400 600 450 625M230 670C300 650 400 650 450 675',
        INK,
        6,
      ),
      line(
        'M770 570C700 550 600 550 550 575M770 620C700 600 600 600 550 625',
        INK,
        6,
      ),
      [C.red, E(660, 665, 38, 28), {}],
      star(660, 665, 20, C.yellow),
    ],
  );
  // 1215 許願池
  recipes['w-fantasy-66'] = [].concat(
    [
      [
        'none',
        'M500 420C440 330 380 360 340 440M500 420C560 330 620 360 660 440',
        { s: INK, w: 30 },
      ],
      [
        'none',
        'M500 420C440 330 380 360 340 440M500 420C560 330 620 360 660 440',
        { s: C.sky, w: 16 },
      ],
    ],
    [
      [C.violet, 'R465 400 70 220', {}],
      [C.violet, E(500, 430, 130, 36), {}],
      [
        C.violet,
        'M160 640C160 780 340 830 500 830C660 830 840 780 840 640Z',
        {},
      ],
      [C.violet, E(500, 640, 340, 120), {}],
      [C.sky, E(500, 640, 290, 85), {}],
      [C.yellow, E(360, 660, 36, 12), { w: 5 }],
      [C.yellow, E(560, 690, 36, 12), { w: 5 }],
      [C.yellow, E(660, 630, 30, 10), { w: 5 }],
      [C.yellow, E(830, 330, 38, 38), {}],
      line('M830 315L830 345', INK, 6),
      star(200, 300, 24),
      star(250, 220, 14),
    ],
  );
  // 1216 隱形斗篷
  recipes['w-fantasy-67'] = [].concat(
    [
      [
        C.blue,
        'M500 220C380 220 320 330 300 480L230 800C380 850 620 850 770 800L700 480C680 330 620 220 500 220Z',
        {},
      ],
      [
        C.violet,
        'M500 220C440 220 410 300 410 360C440 420 560 420 590 360C590 300 560 220 500 220Z',
        {},
      ],
      [C.ink, E(500, 340, 70, 55), { s: 'none' }],
      [C.violet, 'M410 440L500 800L590 440Q500 480 410 440Z', { s: 'none' }],
      [C.yellow, E(500, 430, 24, 24), {}],
    ],
    [
      [C.brown, E(430, 835, 55, 24), {}],
      [C.brown, E(580, 835, 55, 24), {}],
    ],
    [
      star(220, 250, 32),
      star(790, 200, 24),
      star(850, 420, 18),
      star(160, 520, 18),
    ],
  );
  // 1217 石像鬼
  recipes['w-fantasy-68'] = [].concat(
    [
      [
        C.blue,
        'M500 520C380 380 200 360 120 400C150 480 180 560 250 600C300 580 400 600 440 640Z',
        {},
      ],
      [
        C.blue,
        'M500 520C620 380 800 360 880 400C850 480 820 560 750 600C700 580 600 600 560 640Z',
        {},
      ],
    ],
    [[C.violet, 'R120 790 760 90 12', {}]],
    [
      [
        C.violet,
        'M360 780C340 640 380 520 500 520C620 520 660 640 640 780Z',
        {},
      ],
      [C.violet, E(380, 790, 55, 28), {}],
      [C.violet, E(620, 790, 55, 28), {}],
      [C.sky, E(500, 660, 70, 90), { s: 'none' }],
    ],
    [
      [C.violet, 'M410 420L380 280L470 360ZM590 420L620 280L530 360Z', {}],
      [C.violet, E(500, 440, 105, 90), {}],
      [C.yellow, E(455, 420, 20, 17), { w: 5 }],
      [C.yellow, E(545, 420, 20, 17), { w: 5 }],
      dot(455, 423, 7),
      dot(545, 423, 7),
      line('M440 385L475 400M560 385L525 400', INK, 8),
      [C.ink, 'M440 470Q500 510 560 470Q500 490 440 470Z', {}],
      [C.paper, 'M450 475L465 500L478 482ZM550 475L535 500L522 482Z', { w: 4 }],
    ],
  );
  // 1218 三頭犬
  (function () {
    function head(cx, cy) {
      return [
        [C.brown, E(cx - 62, cy - 10, 26, 48, 20), {}],
        [C.brown, E(cx + 62, cy - 10, 26, 48, -20), {}],
        [C.brown, E(cx, cy, 70, 62), {}],
        [C.orange, E(cx, cy + 28, 40, 28), {}],
        dot(cx, cy + 16, 10),
        dot(cx - 28, cy - 14, 8),
        dot(cx + 28, cy - 14, 8),
        [
          C.pink,
          'M' +
            (cx - 14) +
            ' ' +
            (cy + 46) +
            'L' +
            (cx + 14) +
            ' ' +
            (cy + 46) +
            'L' +
            (cx + 10) +
            ' ' +
            (cy + 80) +
            'Q' +
            cx +
            ' ' +
            (cy + 90) +
            ' ' +
            (cx - 10) +
            ' ' +
            (cy + 80) +
            'Z',
          { w: 5 },
        ],
      ];
    }
    recipes['w-fantasy-69'] = [].concat(
      flat(C.mint, 840),
      K.tube(
        [
          [760, 660],
          [860, 620],
          [880, 520],
        ],
        30,
        C.brown,
      ),
      K.tube(
        [
          [330, 720],
          [320, 830],
        ],
        44,
        C.brown,
      ),
      K.tube(
        [
          [440, 740],
          [440, 830],
        ],
        44,
        C.brown,
      ),
      [[C.brown, E(520, 700, 250, 110), {}]],
      K.tube(
        [
          [620, 740],
          [620, 830],
        ],
        44,
        C.brown,
      ),
      K.tube(
        [
          [700, 730],
          [710, 830],
        ],
        44,
        C.brown,
      ),
      K.tube(
        [
          [340, 650],
          [240, 520],
          [220, 440],
        ],
        52,
        C.brown,
      ),
      K.tube(
        [
          [520, 620],
          [520, 480],
          [500, 400],
        ],
        52,
        C.brown,
      ),
      K.tube(
        [
          [400, 620],
          [680, 560],
          [760, 470],
        ],
        52,
        C.brown,
      ),
      head(220, 400),
      head(500, 340),
      head(770, 430),
      [],
    );
  })();
  // 1219 獨眼巨人
  recipes['w-fantasy-70'] = [].concat(
    flat(C.mint, 860),
    K.tube(
      [
        [760, 560],
        [850, 640],
        [880, 780],
      ],
      70,
      C.yellow,
    ),
    K.tube(
      [
        [880, 800],
        [820, 380],
      ],
      50,
      C.brown,
    ),
    [[C.brown, E(810, 340, 60, 70, 8), {}]],
    K.tube(
      [
        [420, 700],
        [410, 840],
      ],
      90,
      C.yellow,
    ),
    K.tube(
      [
        [580, 700],
        [590, 840],
      ],
      90,
      C.yellow,
    ),
    [
      [C.yellow, E(500, 560, 220, 230), {}],
      [
        C.brown,
        'M330 620C400 700 600 700 670 620L690 740C600 780 400 780 310 740Z',
        {},
      ],
    ],
    K.tube(
      [
        [290, 520],
        [220, 620],
        [250, 720],
      ],
      70,
      C.yellow,
    ),
    [
      [C.yellow, E(500, 280, 150, 135), {}],
      [C.yellow, E(345, 290, 28, 40), {}],
      [C.yellow, E(655, 290, 28, 40), {}],
      [C.paper, E(500, 270, 80, 60), {}],
      [C.green, E(500, 275, 38, 38), {}],
      dot(500, 275, 18),
      line('M410 205Q500 160 590 205', INK, 16),
      line('M485 320L470 350L505 350', INK, 7),
      [C.red, 'M410 360Q500 440 590 360Z', { w: 7 }],
      [C.paper, 'M430 372L450 395L465 378ZM540 378L555 395L575 372Z', { w: 4 }],
    ],
  );
  // 1220 豬八戒
  (function () {
    var p = human({
      x: 360,
      y: 850,
      h: 620,
      skin: C.pink,
      shirt: C.violet,
      pants: C.brown,
      hs: 'bald',
      face: 'none',
      arms: [
        [-12, -4],
        [40, 165],
      ],
      legs: [
        [3, 0],
        [-3, 0],
      ],
    });
    var hd = p.pts.head,
      pel = p.pts.pel,
      hand = p.pts.hands[1],
      cx = hd[0],
      cy = hd[1];
    recipes['w-fantasy-71'] = [].concat(
      K.tube(
        [
          [hand[0], hand[1] + 240],
          [hand[0], hand[1] - 250],
        ],
        22,
        C.brown,
      ),
      [
        [
          C.violet,
          'R' + (hand[0] - 90) + ' ' + (hand[1] - 280) + ' 180 26 6',
          {},
        ],
      ],
      [0, 1, 2, 3].map(function (k) {
        return [
          C.violet,
          'M' +
            (hand[0] - 80 + k * 50) +
            ' ' +
            (hand[1] - 255) +
            'L' +
            (hand[0] - 55 + k * 50) +
            ' ' +
            (hand[1] - 255) +
            'L' +
            (hand[0] - 68 + k * 50) +
            ' ' +
            (hand[1] - 190) +
            'Z',
          { w: 6 },
        ];
      }),
      p,
      [
        [C.pink, E(pel[0], pel[1] - 70, 95, 95), {}],
        [
          C.violet,
          'M' +
            (pel[0] - 20) +
            ' ' +
            (pel[1] - 190) +
            'L' +
            (pel[0] - 20) +
            ' ' +
            (pel[1] - 130) +
            'M' +
            (pel[0] + 20) +
            ' ' +
            (pel[1] - 190) +
            'L' +
            (pel[0] + 20) +
            ' ' +
            (pel[1] - 130),
          { s: INK, w: 0, f: 0 },
        ],
      ].slice(0, 1),
      [
        [
          C.pink,
          'M' +
            (cx - 55) +
            ' ' +
            (cy - 50) +
            'L' +
            (cx - 125) +
            ' ' +
            (cy - 20) +
            'L' +
            (cx - 75) +
            ' ' +
            (cy + 40) +
            'Z',
          {},
        ],
        [
          C.pink,
          'M' +
            (cx + 55) +
            ' ' +
            (cy - 50) +
            'L' +
            (cx + 125) +
            ' ' +
            (cy - 20) +
            'L' +
            (cx + 75) +
            ' ' +
            (cy + 40) +
            'Z',
          {},
        ],
        [C.pink, E(cx, cy, 70, 64), {}],
        [C.orange, E(cx, cy + 20, 36, 26), {}],
        dot(cx - 11, cy + 20, 6),
        dot(cx + 11, cy + 20, 6),
        dot(cx - 33, cy - 18, 8),
        dot(cx + 33, cy - 18, 8),
        line(
          'M' +
            (cx - 20) +
            ' ' +
            (cy + 52) +
            'Q' +
            cx +
            ' ' +
            (cy + 62) +
            ' ' +
            (cx + 20) +
            ' ' +
            (cy + 52),
          INK,
          6,
        ),
      ],
    );
  })();
  // 1221 唐三藏
  (function () {
    var p = human({
      x: 400,
      y: 860,
      h: 640,
      dress: C.red,
      hs: 'cap',
      cap: C.yellow,
      arms: [
        [-12, -4],
        [35, 170],
      ],
      legs: [
        [2, 0],
        [-2, 0],
      ],
      shoe: C.brown,
    });
    var hand = p.pts.hands[1],
      nk = p.pts.neck,
      pel = p.pts.pel;
    recipes['w-fantasy-72'] = [].concat(
      K.tube(
        [
          [hand[0], hand[1] + 260],
          [hand[0], hand[1] - 250],
        ],
        20,
        C.brown,
      ),
      [
        ['none', E(hand[0], hand[1] - 300, 55, 55), { s: INK, w: 26 }],
        ['none', E(hand[0], hand[1] - 300, 55, 55), { s: C.yellow, w: 12 }],
        [C.yellow, E(hand[0] - 40, hand[1] - 210, 18, 18), {}],
        [C.yellow, E(hand[0] + 40, hand[1] - 210, 18, 18), {}],
      ],
      p,
      K.tube(
        [
          [nk[0] - 80, nk[1] - 10],
          [pel[0] + 60, pel[1] + 20],
        ],
        48,
        C.yellow,
      ),
      [[C.orange, 'R' + (pel[0] - 70) + ' ' + (pel[1] - 10) + ' 140 24 8', {}]],
    );
  })();
  // 1222 土地公
  (function () {
    var p = human({
      x: 400,
      y: 860,
      h: 560,
      dress: C.orange,
      hs: 'cap',
      cap: C.yellow,
      arms: [
        [-30, 40],
        [35, 175],
      ],
      legs: [
        [2, 0],
        [-2, 0],
      ],
      shoe: C.red,
      face: 'neutral',
    });
    var hd = p.pts.head,
      cx = hd[0],
      cy = hd[1],
      r = hd[2],
      hl = p.pts.hands[0],
      hr = p.pts.hands[1];
    recipes['w-fantasy-73'] = [].concat(
      [
        [C.red, 'R660 600 230 260 12', {}],
        [C.orange, 'M640 610L775 480L910 610Z', {}],
        [C.ink, 'R740 690 70 170 8', { s: 'none' }],
      ],
      K.tube(
        [
          [hr[0], hr[1] + 250],
          [hr[0], hr[1] - 260],
        ],
        20,
        C.brown,
      ),
      [[C.brown, E(hr[0] - 10, hr[1] - 270, 40, 28), {}]],
      p,
      [
        [C.yellow, 'R' + (cx - 140) + ' ' + (cy - 60) + ' 50 70 12', {}],
        [C.yellow, 'R' + (cx + 90) + ' ' + (cy - 60) + ' 50 70 12', {}],
        [
          C.paper,
          'M' +
            (cx - r * 0.95) +
            ' ' +
            (cy + r * 0.25) +
            'Q' +
            cx +
            ' ' +
            (cy + r * 0.4) +
            ' ' +
            (cx + r * 0.95) +
            ' ' +
            (cy + r * 0.25) +
            'C' +
            (cx + r * 0.7) +
            ' ' +
            (cy + r * 2.1) +
            ' ' +
            (cx + r * 0.2) +
            ' ' +
            (cy + r * 2.3) +
            ' ' +
            cx +
            ' ' +
            (cy + r * 2.4) +
            'C' +
            (cx - r * 0.2) +
            ' ' +
            (cy + r * 2.3) +
            ' ' +
            (cx - r * 0.7) +
            ' ' +
            (cy + r * 2.1) +
            ' ' +
            (cx - r * 0.95) +
            ' ' +
            (cy + r * 0.25) +
            'Z',
          {},
        ],
        line(
          'M' +
            (cx - 40) +
            ' ' +
            (cy - 20) +
            'L' +
            (cx - 12) +
            ' ' +
            (cy - 20) +
            'M' +
            (cx + 40) +
            ' ' +
            (cy - 20) +
            'L' +
            (cx + 12) +
            ' ' +
            (cy - 20),
          C.paper,
          9,
        ),
        [C.pink, E(cx - 38, cy + 12, 14, 9), { s: 'none' }],
        [C.pink, E(cx + 38, cy + 12, 14, 9), { s: 'none' }],
        [
          C.yellow,
          'M' +
            (hl[0] - 55) +
            ' ' +
            (hl[1] - 15) +
            'L' +
            (hl[0] + 55) +
            ' ' +
            (hl[1] - 15) +
            'L' +
            (hl[0] + 35) +
            ' ' +
            (hl[1] + 30) +
            'L' +
            (hl[0] - 35) +
            ' ' +
            (hl[1] + 30) +
            'Z',
          {},
        ],
      ],
    );
  })();
  // 1223 諾亞方舟
  recipes['w-fantasy-74'] = [].concat(
    [
      [C.violet, E(500, 130, 200, 70), {}],
      [C.violet, E(360, 150, 100, 55), {}],
      [C.violet, E(660, 150, 110, 55), {}],
    ],
    [380, 470, 560, 650, 740].map(function (x, i) {
      return line(
        'M' +
          x +
          ' ' +
          (230 + (i % 2) * 40) +
          'L' +
          (x - 16) +
          ' ' +
          (290 + (i % 2) * 40),
        C.blue,
        9,
      );
    }),
    K.tube(
      [
        [420, 500],
        [420, 330],
      ],
      44,
      C.yellow,
    ),
    [
      [C.yellow, E(445, 310, 56, 36, -15), {}],
      dot(465, 302, 8),
      [C.yellow, E(405, 255, 10, 24), {}],
    ],
    [
      [C.brown, 'M150 560L850 560L760 770Q500 850 240 770Z', {}],
      [C.orange, 'R290 460 420 110 10', {}],
      [C.red, 'M260 470L500 360L740 470Z', {}],
      [C.sky, 'R340 490 70 60 8', {}],
      [C.sky, 'R590 490 70 60 8', {}],
      line('M200 640L800 640', INK, 7),
      [C.paper, E(500, 705, 18, 12), { w: 5 }],
    ],
    waves(740, C.sky, 28, 100),
  );
  function glasses(cx, cy, r) {
    return [
      [
        'none',
        E(cx - r * 0.34, cy - r * 0.05, r * 0.26, r * 0.26),
        { s: INK, w: 6 },
      ],
      [
        'none',
        E(cx + r * 0.34, cy - r * 0.05, r * 0.26, r * 0.26),
        { s: INK, w: 6 },
      ],
      line(
        'M' +
          n(cx - r * 0.08) +
          ' ' +
          n(cy - r * 0.05) +
          'L' +
          n(cx + r * 0.08) +
          ' ' +
          n(cy - r * 0.05),
        INK,
        6,
      ),
    ];
  }
  // 1224 跑步
  recipes['w-action-0'] = [].concat(
    flat(C.mint, 830),
    [line('M80 420L230 420M60 500L200 500M110 580L240 580', C.sky, 16)],
    human({
      x: 520,
      y: 830,
      h: 620,
      side: 1,
      lean: 14,
      shirt: C.red,
      pants: C.blue,
      hs: 'short',
      face: 'open',
      arms: [
        [-60, -140],
        [60, 160],
      ],
      legs: [
        [-35, -85],
        [60, 5],
      ],
    }),
  );
  // 1225 睡覺
  recipes['w-action-1'] = [].concat(
    bg(C.blue),
    [star(780, 140, 28), star(870, 300, 16), star(560, 100, 14)],
    [
      [C.yellow, E(220, 180, 70, 70), {}],
      [C.blue, E(250, 160, 60, 60), { s: 'none' }],
    ],
    [
      line('M600 250L680 250L600 330L680 330', C.paper, 12),
      line('M720 150L770 150L720 200L770 200', C.paper, 10),
    ],
    [
      [C.brown, 'R100 480 40 340 8', {}],
      [C.brown, 'R80 640 800 50 12', {}],
      [C.brown, 'R800 560 40 140 8', {}],
      [C.brown, 'R120 690 40 90', {}],
      [C.brown, 'R800 690 40 90', {}],
    ],
    [
      [C.paper, E(270, 610, 120, 50), {}],
      [C.yellow, E(260, 550, 78, 70), {}],
      [
        C.brown,
        'M180 550C180 460 340 460 340 550C310 510 220 510 180 550Z',
        {},
      ],
      line('M225 565Q240 575 255 565M280 565Q295 575 310 565', INK, 7),
      [C.red, E(268, 605, 12, 7), { w: 5 }],
      [C.sky, 'R200 610 620 100 30', {}],
      line('M260 640L860 640', C.blue, 7),
      line('M380 625L380 700M520 625L520 700M660 625L660 700', INK, 5),
    ],
  );
  // 1226 游泳
  recipes['w-action-2'] = [].concat(
    [[C.sky, 'M0 560L1000 560L1000 1000L0 1000Z', { s: 'none' }]],
    [[C.yellow, E(470, 570, 190, 70), {}]],
    K.tube(
      [
        [350, 570],
        [310, 430],
        [200, 480],
      ],
      56,
      C.yellow,
    ),
    [
      [C.yellow, E(640, 520, 78, 74), {}],
      [C.red, 'M562 520C562 440 718 440 718 520Z', {}],
      [C.paper, E(670, 525, 22, 16), { w: 5 }],
      dot(676, 525, 7),
      line('M650 570Q670 580 690 568', INK, 7),
    ],
    waves(600, C.sky, 24, 100),
    [
      [C.paper, E(120, 560, 24, 20), {}],
      [C.paper, E(80, 510, 16, 14), {}],
      [C.paper, E(160, 500, 14, 12), {}],
    ],
    waves(760, C.blue, 20, 100),
  );
  // 1227 釣魚
  (function () {
    var p = human({
      x: 220,
      y: 720,
      h: 520,
      shirt: C.orange,
      pants: C.blue,
      hs: 'cap',
      cap: C.yellow,
      arms: [
        [35, 85],
        [50, 70],
      ],
      legs: [
        [3, 0],
        [-3, 0],
      ],
    });
    var hd = p.pts.hands[1],
      hx = hd[0],
      hy = hd[1],
      tx = 760,
      ty = 160;
    recipes['w-action-3'] = [].concat(
      [[C.sky, 'M0 720L1000 720L1000 1000L0 1000Z', { s: 'none' }]],
      [[C.mint, 'M0 720L420 720C440 780 380 840 300 1000L0 1000Z', {}]],
      [
        [C.orange, E(640, 880, 80, 46), {}],
        [C.orange, 'M560 880L500 830L500 930Z', {}],
        dot(680, 870, 7),
      ],
      p,
      K.tube(
        [
          [hx - 90, hy + 50],
          [tx, ty],
        ],
        10,
        C.brown,
      ),
      [
        line('M' + tx + ' ' + ty + 'L' + tx + ' 740', INK, 4),
        [C.red, E(tx, 730, 20, 20), { w: 6 }],
        [
          C.paper,
          'M' + (tx - 20) + ' 730Q' + tx + ' 712 ' + (tx + 20) + ' 730Z',
          { s: 'none' },
        ],
      ],
      waves(740, C.sky, 12, 100).slice(0, 0),
    );
  })();
  // 1228 刷牙
  recipes['w-action-4'] = [].concat(
    [
      [C.yellow, E(500, 500, 230, 250), {}],
      [C.yellow, E(265, 500, 28, 50), {}],
      [C.yellow, E(735, 500, 28, 50), {}],
      [
        C.brown,
        'M270 450C270 230 730 230 730 450C660 340 340 340 270 450Z',
        {},
      ],
      dot(420, 450, 12),
      dot(580, 450, 12),
      line('M375 405L455 395M625 405L545 395', INK, 9),
      [C.red, E(500, 620, 120, 62), {}],
      [C.paper, 'M395 600Q500 570 605 600L600 632Q500 612 400 632Z', { w: 5 }],
      [C.pink, E(500, 650, 50, 20), { s: 'none' }],
    ],
    K.tube(
      [
        [880, 700],
        [640, 610],
      ],
      40,
      C.blue,
    ),
    [
      [C.paper, 'R590 575 70 38 8', {}],
      [C.sky, E(840, 680, 24, 24), { s: 'none' }],
    ],
    [[C.yellow, E(830, 700, 52, 45), {}]],
    [
      [C.paper, E(380, 760, 34, 30), {}],
      [C.paper, E(450, 800, 24, 22), {}],
      [C.paper, E(320, 700, 20, 18), {}],
      [C.paper, E(660, 740, 26, 24), {}],
    ],
  );
  // 1229 洗澡
  recipes['w-action-5'] = [].concat(
    [
      [C.yellow, E(430, 440, 82, 78), {}],
      [
        C.brown,
        'M350 430C350 340 510 340 510 430C470 390 390 390 350 430Z',
        {},
      ],
      [C.brown, E(430, 340, 34, 34), {}],
      dot(405, 450, 8),
      dot(455, 450, 8),
      line('M410 485Q430 500 450 485', INK, 7),
      [C.yellow, E(430, 590, 140, 70), {}],
    ],
    [
      [
        C.paper,
        'M110 600L890 600L850 770Q830 840 740 840L260 840Q170 840 150 770Z',
        {},
      ],
      [C.sky, 'R125 598 750 36 18', {}],
      [C.brown, 'R200 840 50 36 8', {}],
      [C.brown, 'R750 840 50 36 8', {}],
    ],
    [
      [C.paper, E(300, 590, 55, 45), {}],
      [C.paper, E(360, 560, 42, 38), {}],
      [C.paper, E(560, 580, 62, 48), {}],
      [C.paper, E(500, 560, 40, 36), {}],
      [C.paper, E(220, 570, 36, 32), {}],
      [C.paper, E(190, 380, 24, 22), {}],
      [C.paper, E(700, 400, 30, 28), {}],
      [C.paper, E(760, 320, 18, 16), {}],
    ],
    [
      [C.yellow, E(740, 590, 70, 44), {}],
      [C.yellow, E(800, 530, 38, 36), {}],
      [C.orange, 'M830 530L880 545L830 555Z', {}],
      dot(808, 522, 6),
    ],
  );
  // 1230 吃飯
  (function () {
    var p = human({
      x: 280,
      y: 890,
      h: 560,
      shirt: C.pink,
      pants: C.blue,
      hs: 'bun',
      hair: C.ink,
      face: 'open',
      arms: [
        [-15, 30],
        [25, 165],
      ],
      legs: [
        [3, 0],
        [-3, 0],
      ],
    });
    var hd = p.pts.head,
      hh = p.pts.hands[1];
    recipes['w-action-6'] = [].concat(
      p,
      [
        [C.brown, 'R90 640 820 50 10', {}],
        [C.brown, 'R130 690 50 250', {}],
        [C.brown, 'R820 690 50 250', {}],
      ],
      [
        [C.red, 'M440 560L620 560Q620 650 530 650Q440 650 440 560Z', {}],
        [C.paper, E(530, 560, 90, 40), {}],
        line('M490 555L500 565M540 550L555 562', INK, 5),
      ],
      [
        [C.mint, E(770, 630, 90, 20), {}],
        [C.orange, E(770, 612, 50, 18), {}],
        [C.green, E(745, 605, 18, 10), { s: 'none' }],
      ],
      K.tube(
        [
          [hh[0] + 10, hh[1] - 10],
          [hd[0] + 40, hd[1] + 45],
        ],
        8,
        C.brown,
      ),
      K.tube(
        [
          [hh[0] + 22, hh[1] + 4],
          [hd[0] + 52, hd[1] + 52],
        ],
        8,
        C.brown,
      ),
    );
  })();
  // 1231 唱歌
  (function () {
    var p = human({
      x: 440,
      y: 850,
      h: 600,
      shirt: C.violet,
      pants: C.ink,
      hs: 'short',
      face: 'open',
      arms: [
        [-60, -100],
        [30, 170],
      ],
      legs: [
        [6, 0],
        [-6, 0],
      ],
    });
    var hh = p.pts.hands[1],
      hd = p.pts.head;
    recipes['w-action-7'] = [].concat(
      flat(C.pink, 850),
      p,
      K.tube(
        [
          [hh[0], hh[1] + 10],
          [hh[0] - 10, hh[1] - 50],
        ],
        16,
        C.ink,
      ),
      [[C.sky, E(hh[0] - 14, hh[1] - 66, 28, 30), {}]],
      [
        note(200, 330, 1.4),
        note(780, 260, 1.5),
        note(730, 520, 1.2),
        note(150, 560, 1.1),
      ],
    );
  })();
  // 1232 跳舞
  recipes['w-action-8'] = [].concat(
    flat(C.violet, 850),
    human({
      x: 500,
      y: 850,
      h: 600,
      dress: C.pink,
      hair: C.ink,
      hs: 'long',
      shoe: C.red,
      face: 'open',
      arms: [
        [-130, -165],
        [135, 170],
      ],
      legs: [
        [0, 0],
        [55, -10],
      ],
    }),
    [note(180, 300, 1.4), note(800, 330, 1.3)],
  );
  // 1233 看書
  (function () {
    var p = human({
      x: 500,
      y: 860,
      h: 600,
      shirt: C.mint,
      pants: C.blue,
      hs: 'short',
      face: 'closed',
      arms: [
        [-15, 100],
        [15, -100],
      ],
      legs: [
        [3, 0],
        [-3, 0],
      ],
    });
    var hd = p.pts.head,
      a = p.pts.hands[0],
      b = p.pts.hands[1];
    var mx = (a[0] + b[0]) / 2,
      my = (a[1] + b[1]) / 2 - 20;
    recipes['w-action-9'] = [].concat(
      flat(C.yellow, 860),
      p,
      glasses(hd[0], hd[1], hd[2]),
      [
        [C.orange, 'R' + (mx - 140) + ' ' + (my - 60) + ' 280 130 12', {}],
        [
          C.paper,
          'M' +
            (mx - 6) +
            ' ' +
            (my - 50) +
            'C' +
            (mx - 50) +
            ' ' +
            (my - 70) +
            ' ' +
            (mx - 110) +
            ' ' +
            (my - 60) +
            ' ' +
            (mx - 125) +
            ' ' +
            (my - 50) +
            'L' +
            (mx - 125) +
            ' ' +
            (my + 55) +
            'C' +
            (mx - 110) +
            ' ' +
            (my + 45) +
            ' ' +
            (mx - 50) +
            ' ' +
            (my + 40) +
            ' ' +
            (mx - 6) +
            ' ' +
            (my + 60) +
            'Z',
          {},
        ],
        [
          C.paper,
          'M' +
            (mx + 6) +
            ' ' +
            (my - 50) +
            'C' +
            (mx + 50) +
            ' ' +
            (my - 70) +
            ' ' +
            (mx + 110) +
            ' ' +
            (my - 60) +
            ' ' +
            (mx + 125) +
            ' ' +
            (my - 50) +
            'L' +
            (mx + 125) +
            ' ' +
            (my + 55) +
            'C' +
            (mx + 110) +
            ' ' +
            (my + 45) +
            ' ' +
            (mx + 50) +
            ' ' +
            (my + 40) +
            ' ' +
            (mx + 6) +
            ' ' +
            (my + 60) +
            'Z',
          {},
        ],
        line(
          'M' +
            (mx - 100) +
            ' ' +
            (my - 20) +
            'L' +
            (mx - 30) +
            ' ' +
            (my - 15) +
            'M' +
            (mx - 100) +
            ' ' +
            (my + 10) +
            'L' +
            (mx - 30) +
            ' ' +
            (my + 15) +
            'M' +
            (mx + 30) +
            ' ' +
            (my - 15) +
            'L' +
            (mx + 100) +
            ' ' +
            (my - 20) +
            'M' +
            (mx + 30) +
            ' ' +
            (my + 15) +
            'L' +
            (mx + 100) +
            ' ' +
            (my + 10),
          INK,
          5,
        ),
      ],
      [
        [C.yellow, E(a[0], a[1] + 10, 24, 24), {}],
        [C.yellow, E(b[0], b[1] + 10, 24, 24), {}],
      ],
    );
  })();
  // 1234 拍照
  (function () {
    var p = human({
      x: 440,
      y: 860,
      h: 600,
      shirt: C.orange,
      pants: C.blue,
      hs: 'short',
      face: 'none',
      arms: [
        [-30, 140],
        [30, -140],
      ],
      legs: [
        [4, 0],
        [-4, 0],
      ],
    });
    var hd = p.pts.head,
      cx = hd[0],
      cy = hd[1];
    recipes['w-action-10'] = [].concat(flat(C.mint, 860), p, [
      [C.violet, 'R' + (cx - 130) + ' ' + (cy - 20) + ' 260 150 20', {}],
      [
        C.paper,
        'R' + (cx - 130) + ' ' + (cy - 20) + ' 260 50 20',
        { s: 'none' },
      ],
      [C.violet, 'R' + (cx - 40) + ' ' + (cy - 55) + ' 80 40 8', {}],
      [C.blue, E(cx, cy + 65, 62, 62), {}],
      [C.sky, E(cx, cy + 65, 40, 40), { s: 'none' }],
      [C.paper, E(cx - 14, cy + 50, 12, 10), { s: 'none' }],
      [C.red, E(cx + 95, cy + 5, 11, 11), { w: 5 }],
      [C.yellow, E(cx - 105, cy + 12, 12, 12), { w: 5 }],
      star(cx + 200, cy - 110, 40),
      line(
        'M' + (cx + 130) + ' ' + (cy - 40) + 'L' + (cx + 160) + ' ' + (cy - 60),
        C.yellow,
        10,
      ),
    ]);
  })();
  // 1235 畫畫
  (function () {
    var p = human({
      x: 250,
      y: 860,
      h: 600,
      shirt: C.mint,
      pants: C.brown,
      hs: 'cap',
      cap: C.red,
      arms: [
        [-35, -110],
        [60, 105],
      ],
      legs: [
        [4, 0],
        [-4, 0],
      ],
    });
    var hl = p.pts.hands[0],
      hr = p.pts.hands[1];
    recipes['w-action-11'] = [].concat(
      flat(C.yellow, 860),
      K.tube(
        [
          [560, 760],
          [660, 240],
        ],
        24,
        C.brown,
      ),
      K.tube(
        [
          [820, 780],
          [720, 240],
        ],
        24,
        C.brown,
      ),
      K.tube(
        [
          [690, 560],
          [690, 880],
        ],
        24,
        C.brown,
      ),
      [
        [C.brown, 'R500 700 360 28 6', {}],
        [C.paper, 'R520 240 340 270', { b: 1 }],
        [C.sky, 'R520 240 340 170', { i: 1, s: 'none' }],
        [
          C.mint,
          'M520 420C620 380 760 460 860 400L860 510L520 510Z',
          { i: 1, s: 'none' },
        ],
        [C.yellow, E(780, 320, 40, 40), { i: 1, s: 'none' }],
        [C.paper, E(620, 310, 50, 22), { i: 1, s: 'none' }],
        ['none', 'R520 240 340 270', { s: INK, w: 12 }],
      ],
      p,
      [
        [C.brown, E(hl[0] - 10, hl[1] - 10, 55, 38), {}],
        [C.red, E(hl[0] - 30, hl[1] - 20, 9, 9), { s: 'none' }],
        [C.sky, E(hl[0] + 5, hl[1] - 30, 9, 9), { s: 'none' }],
        [C.yellow, E(hl[0] + 20, hl[1] - 10, 9, 9), { s: 'none' }],
      ],
      K.tube(
        [
          [hr[0], hr[1]],
          [530, 420],
        ],
        8,
        C.red,
      ),
    );
  })();
  // 1236 爬山
  (function () {
    var p = human({
      x: 340,
      y: 470,
      h: 380,
      side: 1,
      lean: 22,
      shirt: C.orange,
      pants: C.blue,
      hs: 'cap',
      cap: C.red,
      face: 'smile',
      arms: [
        [40, 90],
        [70, 110],
      ],
      legs: [
        [45, 0],
        [-10, -40],
      ],
    });
    var hh = p.pts.hands[1];
    recipes['w-action-12'] = [].concat(
      [[C.yellow, E(800, 160, 70, 70), {}]],
      [
        [C.violet, 'M40 880L500 180L960 880Z', { b: 1 }],
        [
          C.paper,
          'M500 180L400 330L460 300L500 350L550 300L610 330Z',
          { s: INK },
        ],
      ],
      [[C.green, 'M0 880L1000 880L1000 1000L0 1000Z', {}]],
      [
        [C.blue, 'M500 180L770 590L960 880L600 880Z', { i: 1, s: 'none' }],
      ].slice(0, 0),
      [
        line('M500 180L500 80', INK, 9),
        [C.red, 'M500 80L580 105L500 130Z', {}],
      ],
      [
        [
          C.red,
          'R' + (p.pts.neck[0] - 85) + ' ' + (p.pts.neck[1] - 5) + ' 50 100 14',
          {},
        ],
      ],
      p,
      K.tube(
        [
          [hh[0], hh[1]],
          [hh[0] + 50, hh[1] + 120],
        ],
        8,
        C.brown,
      ),
    );
  })();
  // 1237 種花
  (function () {
    var p = human({
      x: 250,
      y: 860,
      h: 600,
      shirt: C.yellow,
      pants: C.blue,
      hs: 'cap',
      cap: C.orange,
      arms: [
        [30, 70],
        [35, 60],
      ],
      legs: [
        [4, 0],
        [-4, 0],
      ],
    });
    var hh = p.pts.hands[1];
    recipes['w-action-13'] = [].concat(
      flat(C.mint, 800),
      [[C.brown, E(700, 800, 170, 55), {}]],
      K.tube(
        [
          [700, 800],
          [700, 560],
        ],
        18,
        C.green,
      ),
      [
        [C.mint, E(640, 660, 50, 20, -30), {}],
        [C.mint, E(760, 620, 50, 20, 30), {}],
      ],
      [0, 72, 144, 216, 288].map(function (a) {
        return [
          C.pink,
          E(700 + Math.sin(rad(a)) * 52, 510 - Math.cos(rad(a)) * 52, 36, 36),
          {},
        ];
      }),
      [[C.yellow, E(700, 510, 28, 28), {}]],
      p,
      K.tube(
        [
          [hh[0] - 10, hh[1] - 50],
          [hh[0] + 220, hh[1] + 240],
        ],
        14,
        C.brown,
      ),
      [
        [
          C.violet,
          'M' +
            (hh[0] + 190) +
            ' ' +
            (hh[1] + 215) +
            'L' +
            (hh[0] + 255) +
            ' ' +
            (hh[1] + 215) +
            'L' +
            (hh[0] + 255) +
            ' ' +
            (hh[1] + 300) +
            'L' +
            (hh[0] + 225) +
            ' ' +
            (hh[1] + 330) +
            'L' +
            (hh[0] + 190) +
            ' ' +
            (hh[1] + 300) +
            'Z',
          {},
        ],
      ].slice(0, 0),
    );
  })();
  // 1238 喝水
  (function () {
    var p = human({
      x: 450,
      y: 860,
      h: 600,
      shirt: C.sky,
      pants: C.blue,
      hs: 'short',
      face: 'closed',
      arms: [
        [-12, -6],
        [30, 175],
      ],
      legs: [
        [4, 0],
        [-4, 0],
      ],
    });
    var hd = p.pts.head,
      cx = hd[0],
      cy = hd[1],
      hh = p.pts.hands[1];
    recipes['w-action-14'] = [].concat(
      flat(C.yellow, 860),
      p,
      K.T(
        [
          [C.paper, 'M-48 -70L48 -70L36 70Q0 85 -36 70Z', {}],
          [C.sky, 'M-44 -30L44 -30L36 70Q0 85 -36 70Z', { s: 'none' }],
        ],
        { dx: cx + 50, dy: cy + 5, rot: -35 },
      ),
      [[C.yellow, E(hh[0], hh[1], 26, 26), {}]],
      [
        [C.sky, E(cx + 180, cy - 60, 12, 18), {}],
        [C.sky, E(cx + 130, cy - 130, 10, 15), {}],
        [C.sky, E(cx + 210, cy - 140, 9, 13), {}],
      ],
    );
  })();
  // 1239 掃地
  (function () {
    var p = human({
      x: 300,
      y: 850,
      h: 600,
      shirt: C.orange,
      pants: C.blue,
      hs: 'bun',
      hair: C.ink,
      arms: [
        [20, 55],
        [35, 65],
      ],
      legs: [
        [4, 0],
        [-4, 0],
      ],
    });
    var hh = p.pts.hands[1];
    recipes['w-action-15'] = [].concat(
      bg(C.paper),
      flat(C.yellow, 840),
      p,
      K.tube(
        [
          [hh[0] - 40, hh[1] - 90],
          [hh[0] + 190, hh[1] + 270],
        ],
        16,
        C.brown,
      ),
      [
        [
          C.orange,
          'M' +
            (hh[0] + 120) +
            ' ' +
            (hh[1] + 240) +
            'L' +
            (hh[0] + 260) +
            ' ' +
            (hh[1] + 240) +
            'L' +
            (hh[0] + 320) +
            ' 850L' +
            (hh[0] + 70) +
            ' 850Z',
          {},
        ],
        line(
          'M' +
            (hh[0] + 150) +
            ' ' +
            (hh[1] + 300) +
            'L' +
            (hh[0] + 135) +
            ' 835M' +
            (hh[0] + 190) +
            ' ' +
            (hh[1] + 300) +
            'L' +
            (hh[0] + 190) +
            ' 840M' +
            (hh[0] + 230) +
            ' ' +
            (hh[1] + 300) +
            'L' +
            (hh[0] + 245) +
            ' 835',
          C.brown,
          6,
        ),
      ],
      [
        [C.violet, E(780, 830, 70, 38), {}],
        [C.violet, E(850, 820, 40, 26), {}],
        [C.green, E(740, 790, 20, 10, 20), {}],
        [C.red, E(800, 790, 18, 10, -20), {}],
      ],
    );
  })();
  Object.assign(R, recipes);
})(typeof globalThis !== 'undefined' ? globalThis : this);
