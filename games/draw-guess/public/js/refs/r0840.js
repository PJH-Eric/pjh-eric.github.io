(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C,
    INK = C.ink;
  var sin = Math.sin,
    cos = Math.cos,
    PI = Math.PI;
  function rd(n) {
    return Math.round(n * 10) / 10;
  }
  function E(cx, cy, rx, ry, rot) {
    return K.E(cx, cy, rx, ry, rot);
  }
  function RR(x, y, w, h, r) {
    return K.RR(x, y, w, h, r);
  }
  function L(d, col, w) {
    return ['none', d, { s: col || INK, w: w || 7 }];
  }
  function dot(x, y, r, col) {
    return [col || INK, E(x, y, r, r), { s: 'none' }];
  }
  function poly(pts, col, o) {
    var d =
      'M' +
      pts
        .map(function (p) {
          return rd(p[0]) + ' ' + rd(p[1]);
        })
        .join('L') +
      'Z';
    return [col, d, o || {}];
  }
  function tube(pts, w, col) {
    return K.tube(pts, w, col);
  }
  function skyBg(col) {
    return [[col || C.sky, RR(-20, -20, 1040, 1040, 0), { s: 'none' }]];
  }
  function groundBg(col, y) {
    return [
      [
        col || C.mint,
        'M-20 ' +
          y +
          'C250 ' +
          (y - 50) +
          ' 600 ' +
          (y + 30) +
          ' 1020 ' +
          (y - 30) +
          'L1020 1020L-20 1020Z',
        { s: 'none' },
      ],
    ];
  }
  function flower(x, y, s, pc, cc, stem) {
    var o = [];
    if (stem)
      o.push(
        L(
          'M' + x + ' ' + y + 'L' + x + ' ' + (y + stem * s),
          C.green,
          12 * s > 7 ? 12 * s : 7,
        ),
      );
    for (var i = 0; i < 5; i++) {
      var a = ((i * 72 - 90) * PI) / 180;
      o.push([
        pc,
        E(x + cos(a) * 26 * s, y + sin(a) * 26 * s, 20 * s, 20 * s),
        { w: 6 },
      ]);
    }
    o.push([cc || C.yellow, E(x, y, 15 * s, 15 * s), { w: 6 }]);
    return o;
  }
  function face(x, y, r, mood) {
    var o = [],
      ex = 0.38 * r,
      ey = y - 0.05 * r;
    o.push(dot(x - ex, ey, 0.1 * r), dot(x + ex, ey, 0.1 * r));
    if (mood === 'smile')
      o.push(
        L(
          'M' +
            (x - 0.4 * r) +
            ' ' +
            (y + 0.35 * r) +
            'Q' +
            x +
            ' ' +
            (y + 0.85 * r) +
            ' ' +
            (x + 0.4 * r) +
            ' ' +
            (y + 0.35 * r),
        ),
      );
    else if (mood === 'sad')
      o.push(
        L(
          'M' +
            (x - 0.35 * r) +
            ' ' +
            (y + 0.65 * r) +
            'Q' +
            x +
            ' ' +
            (y + 0.3 * r) +
            ' ' +
            (x + 0.35 * r) +
            ' ' +
            (y + 0.65 * r),
        ),
      );
    else if (mood === 'open')
      o.push([C.red, E(x, y + 0.5 * r, 0.22 * r, 0.28 * r), {}]);
    else if (mood === 'big')
      o.push([C.red, E(x, y + 0.5 * r, 0.3 * r, 0.4 * r), {}]);
    else
      o.push(
        L(
          'M' +
            (x - 0.3 * r) +
            ' ' +
            (y + 0.5 * r) +
            'L' +
            (x + 0.3 * r) +
            ' ' +
            (y + 0.5 * r),
        ),
      );
    return o;
  }
  /* person: x, y = feet center, s scale (height ~ 445*s) */
  function person(x, y, s, o) {
    o = o || {};
    var skin = o.skin || C.yellow,
      shirt = o.shirt || C.sky,
      pants = o.pants || C.blue,
      hair = o.hair || C.brown;
    var out = [],
      hy = y - 395 * s,
      r = 50 * s;
    var legs = o.legs || [
      [0, 0],
      [0, 0],
    ];
    if (o.hairStyle === 'long')
      out.push([
        hair,
        RR(x - r * 1.12, hy - r * 1.05, r * 2.24, r * 3.0, r * 0.7),
        {},
      ]);
    if (o.dress) {
      out.push(
        tube(
          [
            [x - 20 * s, y - 28 * s],
            [x - 20 * s + legs[0][0] * s, y - 4 * s],
          ],
          26 * s,
          skin,
        ),
      );
      out.push(
        tube(
          [
            [x + 20 * s, y - 28 * s],
            [x + 20 * s + legs[1][0] * s, y - 4 * s],
          ],
          26 * s,
          skin,
        ),
      );
      out.push([
        o.dress,
        'M' +
          (x - 55 * s) +
          ' ' +
          (y - 190 * s) +
          'L' +
          (x - 110 * s) +
          ' ' +
          (y - 28 * s) +
          'L' +
          (x + 110 * s) +
          ' ' +
          (y - 28 * s) +
          'L' +
          (x + 55 * s) +
          ' ' +
          (y - 190 * s) +
          'Z',
        {},
      ]);
    } else {
      for (var i = 0; i < 2; i++) {
        var sg = i ? 1 : -1,
          hx = x + sg * 26 * s,
          fx = x + sg * 30 * s + legs[i][0] * s,
          fy = y - 14 * s - legs[i][1] * s;
        out = out.concat(
          tube(
            [
              [hx, y - 175 * s],
              [fx, fy],
            ],
            38 * s,
            pants,
          ),
        );
        out.push([
          C.brown,
          E(fx + sg * 10 * s, fy + 8 * s, 34 * s, 15 * s),
          {},
        ]);
      }
    }
    out.push([
      shirt,
      RR(x - 55 * s, y - 350 * s, 110 * s, 195 * s, 34 * s),
      {},
    ]);
    for (var j = 0; j < 2; j++) {
      var sx = x + (j ? 1 : -1) * 50 * s,
        sy = y - 325 * s,
        a = o.arms ? o.arms[j] : 0,
        pts = [[sx, sy]];
      if (typeof a === 'number')
        pts.push([
          sx + 150 * s * sin((a * PI) / 180),
          sy + 150 * s * cos((a * PI) / 180),
        ]);
      else
        for (var q = 0; q + 1 < a.length; q += 2)
          pts.push([sx + a[q] * s, sy + a[q + 1] * s]);
      out = out.concat(tube(pts, 34 * s, shirt));
      var h = pts[pts.length - 1];
      out.push([skin, E(h[0], h[1], 23 * s, 23 * s), {}]);
    }
    out.push([skin, E(x, hy, r, r), {}]);
    if (o.hairStyle !== 'bald')
      out.push([
        hair,
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
          (hy - 0.6 * r) +
          ' ' +
          (x - r) +
          ' ' +
          (hy - 0.1 * r) +
          'Z',
        {},
      ]);
    out = out.concat(face(x, hy, r, o.mood || 'smile'));
    return out;
  }
  function hand(x, y, s, side, a) {
    var sx = x + (side ? 1 : -1) * 50 * s,
      sy = y - 325 * s;
    return [
      sx + 150 * s * sin((a * PI) / 180),
      sy + 150 * s * cos((a * PI) / 180),
    ];
  }

  function bird(x, y, s, col, dir, o) {
    o = o || {};
    var X = function (d) {
        return x + dir * d * s;
      },
      out = [];
    out.push(
      poly(
        [
          [X(-50), y - 5 * s],
          [X(-125), y - 45 * s],
          [X(-120), y + 25 * s],
        ],
        o.tail || col,
      ),
    );
    if (o.legs !== false)
      out.push(
        L(
          'M' +
            X(-10) +
            ' ' +
            (y + 40 * s) +
            'L' +
            X(-10) +
            ' ' +
            (y + 80 * s) +
            'M' +
            X(20) +
            ' ' +
            (y + 40 * s) +
            'L' +
            X(20) +
            ' ' +
            (y + 80 * s),
          C.orange,
          9,
        ),
      );
    out.push([col, E(x, y, 62 * s, 46 * s), {}]);
    out.push([
      o.wing || C.orange,
      E(X(-10), y + 5 * s, 38 * s, 24 * s, dir * -20),
      {},
    ]);
    out.push([col, E(X(55), y - 38 * s, 30 * s, 30 * s), {}]);
    if (o.comb) {
      out.push(
        [C.red, E(X(50), y - 70 * s, 11 * s, 11 * s), {}],
        [C.red, E(X(62), y - 68 * s, 11 * s, 11 * s), {}],
        [C.red, E(X(40), y - 66 * s, 10 * s, 10 * s), {}],
      );
      out.push([C.red, E(X(85), y - 14 * s, 9 * s, 14 * s), {}]);
    }
    if (o.open) {
      out.push(
        poly(
          [
            [X(82), y - 52 * s],
            [X(122), y - 52 * s],
            [X(84), y - 38 * s],
          ],
          C.orange,
        ),
      );
      out.push(
        poly(
          [
            [X(84), y - 36 * s],
            [X(116), y - 22 * s],
            [X(82), y - 26 * s],
          ],
          C.orange,
        ),
      );
    } else
      out.push(
        poly(
          [
            [X(82), y - 48 * s],
            [X(118), y - 36 * s],
            [X(82), y - 26 * s],
          ],
          C.orange,
        ),
      );
    out.push(dot(X(62), y - 46 * s, 5.5 * s));
    return out;
  }
  function quad(o) {
    var x = o.x,
      y = o.y,
      s = o.s,
      dir = o.dir,
      col = o.col,
      bx = 130,
      by = 68,
      Lg = o.leg || 95,
      run = o.run || 0;
    var cy = y - Lg * s - by * s * 0.55;
    var X = function (d) {
        return x + dir * d * s;
      },
      out = [];
    var fo = [-70 * run, 70 * run, -35 * run, 35 * run];
    var hips = [-60, 110, -90, 80];
    var dark = o.dark || col;
    out = out.concat(
      tube(
        [
          [X(-50), cy + 30 * s],
          [X(-50 + fo[2]), y - 8 * s],
        ],
        34 * s,
        dark,
      ),
    );
    out = out.concat(
      tube(
        [
          [X(100), cy + 30 * s],
          [X(100 + fo[3]), y - 8 * s],
        ],
        34 * s,
        dark,
      ),
    );
    var tp = o.tail || [
      [-120, -10],
      [-190, 0],
      [-210, -70],
    ];
    out = out.concat(
      tube(
        tp.map(function (p) {
          return [X(p[0]), cy + p[1] * s];
        }),
        24 * s,
        o.tailCol || col,
      ),
    );
    out.push([col, E(x, cy, bx * s, by * s), { b: 1 }]);
    if (o.inner) out = out.concat(o.inner(X, cy, s, x));
    out = out.concat(
      tube(
        [
          [X(-85), cy + 30 * s],
          [X(-85 + fo[0]), y - 8 * s],
        ],
        34 * s,
        col,
      ),
    );
    out = out.concat(
      tube(
        [
          [X(80), cy + 30 * s],
          [X(80 + fo[1]), y - 8 * s],
        ],
        34 * s,
        col,
      ),
    );
    var hx = X(bx + 40),
      hy = cy - 45 * s,
      r = 58 * s;
    if (o.ears === 'point')
      out.push(
        poly(
          [
            [X(bx + 5), hy - 25 * s],
            [X(bx + 20), hy - 115 * s],
            [X(bx + 60), hy - 45 * s],
          ],
          col,
        ),
      );
    if (o.ears === 'point' && o.earIn)
      out.push(
        poly(
          [
            [X(bx + 20), hy - 50 * s],
            [X(bx + 25), hy - 95 * s],
            [X(bx + 45), hy - 55 * s],
          ],
          o.earIn,
          { s: 'none' },
        ),
      );
    out.push([col, E(hx, hy, r, r), {}]);
    out.push([
      o.snout || col,
      E(X(bx + 40 + 52), hy + 18 * s, 38 * s, 28 * s),
      {},
    ]);
    if (o.ears === 'float')
      out.push([
        o.earCol || C.brown,
        E(X(bx + 15), hy - 5 * s, 22 * s, 46 * s, dir * 15),
        {},
      ]);
    if (o.ears === 'cow') {
      out.push([
        C.paper,
        E(X(bx + 5), hy - 40 * s, 40 * s, 17 * s, dir * -20),
        {},
      ]);
      out.push(
        poly(
          [
            [X(bx + 55), hy - 50 * s],
            [X(bx + 50), hy - 100 * s],
            [X(bx + 75), hy - 52 * s],
          ],
          C.paper,
        ),
      );
    }
    out.push(dot(X(bx + 40 + 88), hy + 10 * s, 8 * s));
    out.push(dot(X(bx + 40 + 22), hy - 14 * s, 6.5 * s));
    return out;
  }
  function horse(x, y, s, dir, col, mane, pose) {
    var Lg = 200,
      cy = y - Lg * s - 55 * s,
      X = function (d) {
        return x + dir * d * s;
      },
      out = [];
    var k = pose === 'run' ? 1 : pose === 'walk' ? 0.35 : 0;
    var f = [-85 * k, 85 * k, -40 * k, 40 * k];
    out = out.concat(
      tube(
        [
          [X(-85), cy + 40 * s],
          [X(-85 + f[2]), y - 14 * s],
        ],
        30 * s,
        col,
      ),
    );
    out = out.concat(
      tube(
        [
          [X(90), cy + 40 * s],
          [X(90 + f[3]), y - 14 * s],
        ],
        30 * s,
        col,
      ),
    );
    out = out.concat(
      tube(
        [
          [X(-140), cy - 15 * s],
          [X(-170), cy + 40 * s],
          [X(-195), cy + 120 * s],
        ],
        30 * s,
        mane,
      ),
    );
    out.push([col, E(x, cy, 150 * s, 70 * s), {}]);
    out = out.concat(
      tube(
        [
          [X(-110), cy + 40 * s],
          [X(-110 + f[0]), y - 14 * s],
        ],
        30 * s,
        col,
      ),
    );
    out = out.concat(
      tube(
        [
          [X(115), cy + 40 * s],
          [X(115 + f[1]), y - 14 * s],
        ],
        30 * s,
        col,
      ),
    );
    [[-85 + f[2]], [90 + f[3]], [-110 + f[0]], [115 + f[1]]].forEach(
      function (a) {
        out.push([INK, E(X(a[0]), y - 8 * s, 22 * s, 12 * s), {}]);
      },
    );
    out.push([
      col,
      'M' +
        X(85) +
        ' ' +
        (cy - 40 * s) +
        'L' +
        X(140) +
        ' ' +
        (cy - 200 * s) +
        'L' +
        X(205) +
        ' ' +
        (cy - 170 * s) +
        'L' +
        X(160) +
        ' ' +
        (cy + 20 * s) +
        'Z',
      {},
    ]);
    out = out.concat(
      tube(
        [
          [X(100), cy - 70 * s],
          [X(145), cy - 205 * s],
        ],
        26 * s,
        mane,
      ),
    );
    out.push([col, E(X(225), cy - 170 * s, 72 * s, 32 * s, dir * 35), {}]);
    out.push(
      poly(
        [
          [X(150), cy - 200 * s],
          [X(155), cy - 255 * s],
          [X(180), cy - 205 * s],
        ],
        col,
      ),
    );
    out.push(dot(X(212), cy - 185 * s, 6.5 * s));
    out.push(dot(X(285), cy - 148 * s, 6 * s));
    return out;
  }
  function wave(y, col) {
    return [
      col,
      'M-20 ' +
        y +
        'Q60 ' +
        (y - 30) +
        ' 130 ' +
        y +
        'T270 ' +
        y +
        'T410 ' +
        y +
        'T550 ' +
        y +
        'T690 ' +
        y +
        'T830 ' +
        y +
        'T970 ' +
        y +
        'T1020 ' +
        y +
        'L1020 1020L-20 1020Z',
      {},
    ];
  }
  function snowflake(x, y, r) {
    var o = [];
    for (var i = 0; i < 3; i++) {
      var a = (i * PI) / 3;
      o.push(
        L(
          'M' +
            rd(x - cos(a) * r) +
            ' ' +
            rd(y - sin(a) * r) +
            'L' +
            rd(x + cos(a) * r) +
            ' ' +
            rd(y + sin(a) * r),
          C.paper,
          9,
        ),
      );
    }
    return o;
  }
  function music(x, y) {
    return [
      L('M' + (x + 18) + ' ' + y + 'L' + (x + 18) + ' ' + (y - 70), INK, 8),
      [INK, E(x, y, 22, 15, -20), { s: 'none' }],
      L(
        'M' +
          (x + 18) +
          ' ' +
          (y - 70) +
          'Q' +
          (x + 50) +
          ' ' +
          (y - 50) +
          ' ' +
          (x + 42) +
          ' ' +
          (y - 20),
        INK,
        8,
      ),
    ];
  }
  function drop(x, y, s, col) {
    return [
      col || C.sky,
      'M' +
        x +
        ' ' +
        (y - 60 * s) +
        'C' +
        (x - 15 * s) +
        ' ' +
        (y - 20 * s) +
        ' ' +
        (x - 40 * s) +
        ' ' +
        (y + 5 * s) +
        ' ' +
        x +
        ' ' +
        (y + 30 * s) +
        'C' +
        (x + 40 * s) +
        ' ' +
        (y + 5 * s) +
        ' ' +
        (x + 15 * s) +
        ' ' +
        (y - 20 * s) +
        ' ' +
        x +
        ' ' +
        (y - 60 * s) +
        'Z',
      {},
    ];
  }
  function heart(x, y, s, col) {
    return [
      col || C.red,
      'M' +
        x +
        ' ' +
        (y + 70 * s) +
        'C' +
        (x - 110 * s) +
        ' ' +
        (y - 10 * s) +
        ' ' +
        (x - 60 * s) +
        ' ' +
        (y - 80 * s) +
        ' ' +
        x +
        ' ' +
        (y - 30 * s) +
        'C' +
        (x + 60 * s) +
        ' ' +
        (y - 80 * s) +
        ' ' +
        (x + 110 * s) +
        ' ' +
        (y - 10 * s) +
        ' ' +
        x +
        ' ' +
        (y + 70 * s) +
        'Z',
      {},
    ];
  }
  function cloudP(x, y, s) {
    return [
      C.paper,
      'M' +
        (x - 120 * s) +
        ' ' +
        (y + 40 * s) +
        'C' +
        (x - 190 * s) +
        ' ' +
        (y + 40 * s) +
        ' ' +
        (x - 190 * s) +
        ' ' +
        (y - 40 * s) +
        ' ' +
        (x - 110 * s) +
        ' ' +
        (y - 36 * s) +
        'C' +
        (x - 100 * s) +
        ' ' +
        (y - 110 * s) +
        ' ' +
        (x - 10 * s) +
        ' ' +
        (y - 120 * s) +
        ' ' +
        (x + 20 * s) +
        ' ' +
        (y - 60 * s) +
        'C' +
        (x + 70 * s) +
        ' ' +
        (y - 110 * s) +
        ' ' +
        (x + 140 * s) +
        ' ' +
        (y - 70 * s) +
        ' ' +
        (x + 130 * s) +
        ' ' +
        (y - 10 * s) +
        'C' +
        (x + 190 * s) +
        ' ' +
        (y - 10 * s) +
        ' ' +
        (x + 190 * s) +
        ' ' +
        (y + 40 * s) +
        ' ' +
        (x + 120 * s) +
        ' ' +
        (y + 40 * s) +
        'Z',
      {},
    ];
  }
  function sunP(x, y, r) {
    var o = [];
    for (var i = 0; i < 8; i++) {
      var a = (i * PI) / 4;
      o.push(
        L(
          'M' +
            rd(x + cos(a) * (r + 25)) +
            ' ' +
            rd(y + sin(a) * (r + 25)) +
            'L' +
            rd(x + cos(a) * (r + 65)) +
            ' ' +
            rd(y + sin(a) * (r + 65)),
          C.orange,
          14,
        ),
      );
    }
    o.push([C.yellow, E(x, y, r, r), {}]);
    return o;
  }
  function pine(x, y, s, snow) {
    var o = [[C.brown, RR(x - 14 * s, y - 60 * s, 28 * s, 60 * s, 3), {}]];
    o.push(
      poly(
        [
          [x, y - 330 * s],
          [x + 100 * s, y - 130 * s],
          [x - 100 * s, y - 130 * s],
        ],
        C.green,
      ),
    );
    o.push(
      poly(
        [
          [x, y - 230 * s],
          [x + 130 * s, y - 50 * s],
          [x - 130 * s, y - 50 * s],
        ],
        C.green,
      ),
    );
    if (snow) {
      o.push(
        poly(
          [
            [x, y - 330 * s],
            [x + 38 * s, y - 255 * s],
            [x - 38 * s, y - 255 * s],
          ],
          C.paper,
          { s: 'none' },
        ),
      );
    }
    return o;
  }
  function paperSheet(x, y, w, h, rot) {
    return K.T(
      [
        [C.paper, RR(x, y, w, h, 6), {}],
        L(
          'M' + (x + 20) + ' ' + (y + 30) + 'L' + (x + w - 20) + ' ' + (y + 30),
          INK,
          7,
        ),
      ],
      { rot: rot || 0, cx: x + w / 2, cy: y + h / 2 },
    );
  }
  function shield(x, y, r) {
    return [
      [C.blue, E(x, y, r, r), { w: 16 }],
      [C.sky, E(x, y, r * 0.72, r * 0.72), {}],
      [C.yellow, E(x, y, r * 0.22, r * 0.22), {}],
    ];
  }

  var CAT = C;
  Object.assign(R, {
    /* 840 一石二鳥 */
    'w-idiom-36': [].concat(
      tube(
        [
          [120, 560],
          [500, 530],
          [880, 540],
        ],
        30,
        C.brown,
      ),
      bird(340, 440, 1.3, C.yellow, 1, { wing: C.orange }),
      bird(660, 440, 1.3, C.pink, -1, { wing: C.red }),
      [
        [C.violet, E(500, 760, 50, 50), {}],
        [C.paper, E(484, 745, 14, 10), { s: 'none' }],
      ],
      [
        L('M300 930L430 840', C.violet, 12),
        L('M240 860L390 790', C.violet, 12),
        L('M360 950L460 880', C.violet, 12),
      ],
      [L('M500 690L500 600', INK, 7)],
    ),
    /* 841 九牛一毛 */
    'w-idiom-37': [].concat(
      quad({
        x: 470,
        y: 860,
        s: 1.35,
        dir: 1,
        col: C.paper,
        ears: 'cow',
        snout: C.pink,
        tail: [
          [-120, -10],
          [-175, 20],
          [-185, 100],
        ],
        inner: function (X, cy, s) {
          return [
            [C.brown, E(X(-50), cy - 15 * s, 50 * s, 38 * s), { i: 1 }],
            [C.brown, E(X(60), cy + 30 * s, 40 * s, 28 * s), { i: 1 }],
          ];
        },
      }),
      [L('M440 480C410 400 480 360 450 290C440 260 470 240 480 215', INK, 9)],
      [['none', E(450, 350, 130, 130), { s: C.red, w: 16 }]],
    ),
    /* 842 雞飛狗跳 */
    'w-idiom-38': [].concat(
      groundBg(C.mint, 880),
      quad({
        x: 340,
        y: 880,
        s: 1.2,
        dir: 1,
        col: C.orange,
        run: 1,
        ears: 'float',
        snout: C.yellow,
        tail: [
          [-120, -10],
          [-190, -30],
          [-215, -100],
        ],
      }),
      bird(680, 330, 1.5, C.paper, 1, { wing: C.yellow, comb: 1, open: 1 }),
      K.T([[C.paper, E(0, 0, 70, 24, -50), {}]], { dx: 600, dy: 200 }),
      [
        [C.paper, E(560, 230, 36, 12, 40), {}],
        [C.paper, E(520, 400, 36, 12, -30), {}],
        [C.yellow, E(760, 520, 36, 12, 20), {}],
      ],
      [L('M300 160L400 220M330 120L420 180', INK, 7)],
    ),
    /* 843 龍飛鳳舞 */
    'w-idiom-39': [].concat(
      [
        L('M120 720C250 430 380 760 520 540C620 380 500 330 620 250', INK, 74),
        L(
          'M120 720C250 430 380 760 520 540C620 380 500 330 620 250',
          C.green,
          56,
        ),
        L(
          'M120 720C250 430 380 760 520 540C620 380 500 330 620 250',
          C.mint,
          14,
        ),
      ],
      [
        poly(
          [
            [640, 180],
            [660, 90],
            [700, 170],
          ],
          C.brown,
        ),
        [C.green, E(680, 235, 85, 52, -15), {}],
        [C.mint, E(740, 255, 40, 30, -15), {}],
      ],
      [
        dot(690, 215, 9),
        dot(760, 245, 6),
        L('M740 275L790 290L735 290', INK, 7),
        L('M640 245C580 270 560 300 540 330', C.yellow, 10),
      ],
      tube(
        [
          [800, 700],
          [900, 790],
          [960, 850],
        ],
        28,
        C.orange,
      ),
      tube(
        [
          [800, 690],
          [940, 700],
          [970, 620],
        ],
        28,
        C.yellow,
      ),
      tube(
        [
          [790, 670],
          [900, 620],
          [920, 540],
        ],
        28,
        C.red,
      ),
      bird(690, 690, 1.3, C.red, -1, {
        wing: C.orange,
        comb: 1,
        tail: C.red,
        legs: false,
      }),
    ),
    /* 844 鳥語花香 */
    'w-idiom-40': [].concat(
      groundBg(C.mint, 800),
      tube(
        [
          [990, 330],
          [700, 400],
          [330, 470],
        ],
        34,
        C.brown,
      ),
      [
        [C.green, E(780, 340, 55, 28, 20), {}],
        [C.green, E(620, 400, 55, 28, -20), {}],
      ],
      bird(400, 400, 1.5, C.yellow, -1, {
        wing: C.orange,
        open: 1,
        legs: true,
      }),
      music(180, 270),
      music(120, 380),
      flower(200, 830, 1.5, C.pink, C.yellow, 130),
      flower(500, 850, 1.7, C.red, C.yellow, 140),
      flower(780, 830, 1.5, C.violet, C.yellow, 130),
    ),
    /* 845 風和日麗 */
    'w-idiom-41': [].concat(
      skyBg(C.sky),
      sunP(780, 200, 90),
      [cloudP(260, 220, 1)],
      [
        [
          C.mint,
          'M-20 800C200 650 450 650 600 740C760 650 900 680 1020 740L1020 1020L-20 1020Z',
          {},
        ],
      ],
      tube(
        [
          [300, 800],
          [310, 650],
        ],
        34,
        C.brown,
      ),
      [
        [C.green, E(310, 570, 130, 100), {}],
        [C.mint, E(270, 540, 50, 34), { s: 'none' }],
      ],
      [
        poly(
          [
            [700, 380],
            [760, 450],
            [700, 520],
            [640, 450],
          ],
          C.red,
        ),
        L('M700 520C720 590 660 620 690 700', INK, 8),
        L('M640 450L760 450M700 380L700 520', INK, 6),
      ],
      [
        L('M500 420C560 400 600 430 620 400', C.paper, 9),
        L('M480 470C540 450 590 480 610 450', C.paper, 9),
      ],
    ),
    /* 846 春暖花開 */
    'w-idiom-42': [].concat(
      [[C.mint, 'M-20 820C250 740 500 790 1020 740L1020 1020L-20 1020Z', {}]],
      sunP(180, 180, 70),
      tube(
        [
          [500, 830],
          [500, 540],
        ],
        44,
        C.brown,
      ),
      tube(
        [
          [500, 600],
          [380, 480],
        ],
        24,
        C.brown,
      ),
      tube(
        [
          [500, 590],
          [630, 470],
        ],
        24,
        C.brown,
      ),
      [
        [C.pink, E(500, 380, 150, 110), {}],
        [C.pink, E(350, 450, 100, 80), {}],
        [C.pink, E(660, 450, 100, 80), {}],
        [C.red, E(430, 340, 14, 14), { s: 'none' }],
        [C.red, E(560, 400, 14, 14), { s: 'none' }],
        [C.red, E(380, 460, 14, 14), { s: 'none' }],
        [C.red, E(660, 450, 14, 14), { s: 'none' }],
      ],
      flower(200, 880, 1.3, C.pink, C.yellow, 90),
      flower(780, 900, 1.3, C.violet, C.yellow, 90),
      flower(330, 940, 1.1, C.yellow, C.orange, 60),
      [
        [C.violet, E(780, 550, 30, 20, 30), {}],
        [C.violet, E(830, 520, 30, 20, -30), {}],
        L('M800 540L810 600', INK, 8),
      ],
      [
        [C.pink, E(250, 640, 14, 8, 30), { s: 'none' }],
        [C.pink, E(330, 720, 14, 8, -20), { s: 'none' }],
      ],
    ),
    /* 847 冰天雪地 */
    'w-idiom-43': [].concat(
      skyBg(C.sky),
      [
        [
          C.paper,
          'M-20 760C250 690 450 760 650 720C800 690 900 720 1020 700L1020 1020L-20 1020Z',
          {},
        ],
      ],
      pine(200, 790, 1.2, true),
      pine(790, 770, 1.4, true),
      pine(960, 800, 0.9, true),
      [
        [C.paper, E(500, 780, 90, 80), {}],
        [C.paper, E(500, 650, 65, 60), {}],
        [INK, E(480, 635, 7, 7), { s: 'none' }],
        [INK, E(520, 635, 7, 7), { s: 'none' }],
        poly(
          [
            [500, 655],
            [570, 665],
            [500, 675],
          ],
          C.orange,
        ),
        [INK, E(500, 760, 8, 8), { s: 'none' }],
        [INK, E(500, 800, 8, 8), { s: 'none' }],
      ],
      snowflake(220, 200, 40),
      snowflake(520, 130, 34),
      snowflake(800, 230, 44),
      snowflake(380, 360, 30),
      snowflake(680, 410, 34),
    ),
    /* 848 水落石出 */
    'w-idiom-44': [].concat(
      skyBg(C.paper),
      [
        [C.yellow, 'M-20 300C100 300 200 360 260 520L260 1020L-20 1020Z', {}],
        [C.yellow, 'M1020 300C900 300 800 360 740 520L740 1020L1020 1020Z', {}],
      ],
      [
        L('M-20 360L130 380', C.sky, 12),
        L('M880 360L1020 340', C.sky, 12),
        L('M60 420L60 500', INK, 9),
        poly(
          [
            [30, 490],
            [90, 490],
            [60, 540],
          ],
          INK,
          { s: 'none' },
        ),
      ],
      [
        [
          C.violet,
          'M300 620C300 480 380 400 470 420C520 340 650 380 640 520C700 540 700 620 700 640Z',
          {},
        ],
        [C.blue, 'M300 620C330 600 380 520 470 520L470 640Z', { s: 'none' }],
      ],
      [[C.violet, E(640, 590, 90, 60), {}]],
      [wave(600, C.sky)],
      [[C.sky, wave(600, C.sky)[1], { s: 'none' }]],
      [L('M330 700L450 700M560 780L700 780M300 860L430 860', C.paper, 9)],
    ),
    /* 849 滴水穿石 */
    'w-idiom-45': [].concat(
      [[C.brown, RR(380, 90, 240, 60, 10), {}]],
      [drop(500, 330, 1.4)],
      [L('M500 160L500 230', C.sky, 12)],
      [
        [
          C.violet,
          'M180 900C180 700 330 600 500 600C670 600 820 700 820 900Z',
          { b: 1 },
        ],
      ],
      [
        [INK, E(500, 650, 60, 26), {}],
        [C.sky, E(500, 640, 36, 12), { s: 'none' }],
      ],
      [
        L(
          'M380 600C400 560 440 560 460 580M540 580C560 560 600 560 620 600',
          C.sky,
          10,
        ),
      ],
    ),
    /* 850 走馬看花 */
    'w-idiom-46': [].concat(
      groundBg(C.mint, 800),
      horse(460, 760, 1.05, 1, C.brown, C.ink, 'run'),
      person(440, 470, 0.7, {
        shirt: C.red,
        pants: C.blue,
        arms: [[40, 70], 40],
        legs: [
          [10, 0],
          [30, 0],
        ],
      }),
      flower(130, 900, 1.2, C.pink, C.yellow, 70),
      flower(380, 930, 1.2, C.red, C.yellow, 60),
      flower(640, 920, 1.2, C.violet, C.yellow, 60),
      flower(880, 900, 1.2, C.yellow, C.orange, 70),
    ),
    /* 851 畫餅充飢 */
    'w-idiom-47': [].concat(
      [
        L('M200 700L130 920', INK, 20),
        L('M400 700L470 920', INK, 20),
        L('M200 700L130 920', C.brown, 10),
        L('M400 700L470 920', C.brown, 10),
      ],
      [
        [C.paper, RR(110, 220, 380, 500, 8), {}],
        [C.orange, E(300, 470, 140, 140), {}],
        [C.brown, E(300, 470, 140, 140), { s: 'none' }],
        [C.orange, E(300, 470, 140, 140), {}],
        L('M300 340L300 600M170 470L430 470', C.brown, 9),
        [C.red, E(240, 410, 14, 14), {}],
        [C.red, E(370, 410, 14, 14), {}],
        [C.red, E(240, 530, 14, 14), {}],
        [C.red, E(370, 530, 14, 14), {}],
      ],
      person(730, 900, 1.15, {
        shirt: C.green,
        pants: C.violet,
        arms: [
          [-80, -10, -150, -90 + 20],
          [-50, 90],
        ],
        mood: 'sad',
        hair: C.ink,
      }),
      [L('M660 640L640 700M700 650L700 720M740 650L760 710', C.red, 8)],
    ),
    /* 852 望子成龍 */
    'w-idiom-48': [].concat(
      [
        [C.paper, E(650, 270, 250, 170), {}],
        [C.paper, E(430, 480, 36, 36), {}],
        [C.paper, E(380, 560, 22, 22), {}],
      ],
      [
        poly(
          [
            [590, 210],
            [595, 150],
            [635, 195],
          ],
          C.brown,
        ),
        poly(
          [
            [690, 195],
            [725, 150],
            [735, 215],
          ],
          C.brown,
        ),
        [C.green, E(660, 270, 110, 85), {}],
        [C.mint, E(720, 300, 55, 40), {}],
        dot(630, 240, 10),
        dot(700, 240, 10),
        dot(705, 310, 5),
        dot(740, 310, 5),
        L('M600 330C560 360 570 390 600 400', C.yellow, 10),
      ],
      person(220, 900, 1.15, {
        shirt: C.violet,
        pants: C.ink,
        arms: [150, [40, 60]],
        hair: C.ink,
      }),
      person(520, 900, 0.62, {
        shirt: C.yellow,
        pants: C.blue,
        arms: [[-40, 30], 160],
        hair: C.brown,
        mood: 'smile',
      }),
    ),
    /* 853 狗急跳牆 */
    'w-idiom-49': [].concat(
      groundBg(C.mint, 880),
      [
        [C.red, RR(400, 560, 200, 340, 6), { b: 1 }],
        L(
          'M400 640L600 640M400 720L600 720M400 800L600 800M500 560L500 640M450 640L450 720M550 640L550 720M500 720L500 800',
          INK,
          7,
        ),
      ],
      quad({
        x: 470,
        y: 520,
        s: 1.05,
        dir: 1,
        col: C.orange,
        run: 1.1,
        ears: 'float',
        snout: C.yellow,
        tail: [
          [-120, -10],
          [-190, -30],
          [-215, -90],
        ],
      }),
      [
        L('M120 600C150 450 250 400 330 400', INK, 7),
        L('M760 440C830 460 870 520 890 600', INK, 7),
      ],
    ),
    /* 854 虎頭蛇尾 */
    'w-idiom-50': [].concat(
      tube(
        [
          [820, 630],
          [900, 680],
          [950, 560],
        ],
        40,
        C.green,
      ),
      tube(
        [
          [560, 600],
          [720, 640],
          [820, 630],
        ],
        90,
        C.orange,
      ),
      tube(
        [
          [300, 520],
          [560, 590],
        ],
        200,
        C.orange,
      ),
      [L('M440 480L460 600M520 500L540 620M590 570L600 650', INK, 14)],
      [
        [C.orange, E(260, 440, 170, 150), {}],
        poly(
          [
            [130, 340],
            [130, 230],
            [230, 300],
          ],
          C.orange,
        ),
        poly(
          [
            [390, 340],
            [400, 230],
            [300, 300],
          ],
          C.orange,
        ),
      ],
      [L('M190 330L170 380M260 310L260 370M330 330L350 380', INK, 14)],
      [
        [C.paper, E(260, 520, 90, 60), {}],
        poly(
          [
            [240, 460],
            [280, 460],
            [260, 485],
          ],
          C.pink,
        ),
        [C.red, E(260, 545, 40, 24), {}],
        dot(200, 410, 14),
        dot(320, 410, 14),
        L('M260 485L260 520', INK, 7),
        L(
          'M180 500L110 480M180 520L110 540M340 500L410 480M340 520L410 540',
          INK,
          6,
        ),
      ],
    ),
    /* 855 打草驚蛇 */
    'w-idiom-51': [].concat(
      groundBg(C.paper, 880),
      tube(
        [
          [650, 880],
          [560, 760],
          [720, 650],
          [650, 520],
        ],
        40,
        C.green,
      ),
      [
        [C.green, E(660, 470, 62, 46, -10), {}],
        dot(645, 455, 8),
        dot(690, 455, 8),
        L('M690 500L730 540M730 540L750 520M730 540L752 556', C.red, 7),
      ],
      person(230, 900, 1.15, {
        shirt: C.orange,
        pants: C.blue,
        arms: [
          [40, 60],
          [60, -80, 60, -170],
        ],
        mood: 'smile',
        hair: C.ink,
        legs: [
          [-20, 0],
          [30, 0],
        ],
      }),
      [L('M280 520L430 800', C.brown, 14)],
      [
        L(
          'M380 900L400 800L440 900M470 900L500 780L540 900M570 900L560 820L600 900M760 900L780 790L820 900M830 900L880 810L900 900',
          C.mint,
          14,
        ),
      ],
      [L('M780 380L800 340M840 440L890 420', C.red, 9)],
    ),
    /* 856 引狼入室 */
    'w-idiom-52': [].concat(
      groundBg(C.mint, 880),
      [
        [C.yellow, RR(450, 350, 500, 530, 6), {}],
        poly(
          [
            [420, 360],
            [700, 150],
            [980, 360],
          ],
          C.red,
        ),
      ],
      [
        [INK, RR(620, 520, 150, 360, 4), {}],
        [C.brown, 'M620 520L560 560L560 860L620 880Z', {}],
      ],
      [
        [C.sky, RR(820, 480, 90, 90, 4), {}],
        L('M865 480L865 570M820 525L910 525', INK, 6),
      ],
      quad({
        x: 640,
        y: 880,
        s: 0.85,
        dir: 1,
        col: C.violet,
        dark: C.violet,
        ears: 'point',
        earIn: C.pink,
        snout: C.paper,
        tail: [
          [-120, -10],
          [-200, 30],
          [-230, 90],
        ],
      }),
      person(220, 900, 1.15, {
        shirt: C.green,
        pants: C.ink,
        arms: [[-60, 20], 95],
        mood: 'smile',
        hair: C.ink,
      }),
    ),
    /* 857 螳螂捕蟬 */
    'w-idiom-53': [].concat(
      tube(
        [
          [40, 800],
          [500, 780],
          [980, 720],
        ],
        50,
        C.brown,
      ),
      [[C.green, E(820, 700, 80, 60), {}]],
      tube(
        [
          [220, 720],
          [320, 620],
        ],
        36,
        C.mint,
      ),
      tube(
        [
          [330, 620],
          [400, 440],
        ],
        34,
        C.mint,
      ),
      tube(
        [
          [330, 600],
          [260, 700],
          [250, 760],
        ],
        14,
        C.green,
      ),
      tube(
        [
          [320, 610],
          [370, 720],
          [380, 770],
        ],
        14,
        C.green,
      ),
      [
        [C.mint, E(420, 400, 36, 50, 20), {}],
        dot(405, 385, 8),
        dot(440, 390, 8),
      ],
      tube(
        [
          [400, 450],
          [510, 420],
          [540, 500],
        ],
        18,
        C.green,
      ),
      [
        poly(
          [
            [540, 500],
            [520, 540],
            [570, 520],
          ],
          C.green,
        ),
      ],
      [
        [C.sky, E(600, 590, 90, 40, -30), {}],
        [C.brown, E(680, 620, 90, 48, 0), {}],
        [C.brown, E(760, 625, 40, 38), {}],
        dot(780, 612, 7, C.paper),
        [C.sky, E(640, 570, 100, 36, -25), {}],
      ],
      [L('M620 650L610 720M670 660L670 730M720 660L730 730', INK, 8)],
    ),
    /* 858 老馬識途 */
    'w-idiom-54': [].concat(
      skyBg(C.paper),
      [
        [C.violet, 'M-20 600L220 300L440 600Z', {}],
        [C.blue, 'M300 600L600 220L920 600Z', {}],
        [C.paper, 'M600 220L650 300L600 290L560 320Z', { s: 'none' }],
      ],
      [[C.mint, 'M-20 600L1020 600L1020 1020L-20 1020Z', { s: 'none' }]],
      [
        [
          C.yellow,
          'M470 600C480 700 780 700 800 780C820 860 400 880 300 940L760 960C900 890 860 780 700 740C560 700 520 660 520 600Z',
          {},
        ],
      ],
      horse(400, 930, 0.9, 1, C.violet, C.paper, 'walk'),
      [[C.paper, E(250, 880, 50, 26), { s: 'none' }]],
    ),
    /* 859 如虎添翼 */
    'w-idiom-55': [].concat(
      groundBg(C.mint, 840),
      [
        [
          C.sky,
          'M420 520C360 380 250 250 120 220C150 340 230 440 330 540Z',
          {},
        ],
        [
          C.sky,
          'M470 500C470 360 440 230 350 120C340 260 360 400 400 540Z',
          {},
        ],
        [
          C.sky,
          'M500 500C550 380 620 280 760 230C730 340 650 440 560 540Z',
          {},
        ],
      ],
      L('M280 380L400 500M230 300L360 440', INK, 6),
      quad({
        x: 470,
        y: 840,
        s: 1.3,
        dir: 1,
        col: C.orange,
        ears: 'point',
        earIn: C.pink,
        snout: C.paper,
        tail: [
          [-120, -10],
          [-190, 20],
          [-210, -40],
        ],
        inner: function (X, cy, s) {
          return [
            L(
              'M' +
                X(-90) +
                ' ' +
                (cy - 70 * s) +
                'L' +
                X(-60) +
                ' ' +
                (cy + 10 * s),
              INK,
              16,
            ),
            L(
              'M' +
                X(-20) +
                ' ' +
                (cy - 70 * s) +
                'L' +
                X(10) +
                ' ' +
                (cy + 20 * s),
              INK,
              16,
            ),
            L(
              'M' +
                X(50) +
                ' ' +
                (cy - 65 * s) +
                'L' +
                X(75) +
                ' ' +
                (cy + 20 * s),
              INK,
              16,
            ),
          ];
        },
      }),
    ),
    /* 860 狼吞虎嚥 */
    'w-idiom-56': [].concat(
      [
        [C.yellow, E(400, 380, 190, 180), {}],
        [C.brown, 'M215 360A190 190 0 0 1 585 360Q400 220 215 360Z', {}],
      ],
      [
        [C.red, E(400, 490, 85, 75), {}],
        [C.paper, RR(340, 410, 120, 24, 8), {}],
        [C.pink, E(400, 530, 50, 26), { s: 'none' }],
      ],
      [
        L('M290 320L350 345M510 320L450 345', INK, 12),
        dot(320, 360, 11),
        dot(480, 360, 11),
      ],
      [
        [C.orange, E(620, 480, 70, 50, -35), {}],
        [C.paper, E(560, 545, 16, 16), {}],
        [C.yellow, E(640, 560, 70, 70), { s: 'none' }],
      ],
      [
        [C.brown, RR(40, 720, 920, 60, 8), {}],
        [C.brown, RR(110, 780, 50, 220, 4), {}],
        [C.brown, RR(840, 780, 50, 220, 4), {}],
      ],
      [
        [C.paper, E(300, 700, 150, 28), {}],
        [C.orange, E(300, 660, 100, 50), {}],
        [C.paper, E(700, 700, 150, 28), {}],
        [C.red, E(700, 650, 100, 55), {}],
        [C.mint, E(740, 640, 40, 20), { s: 'none' }],
      ],
    ),
    /* 861 七上八下 */
    'w-idiom-57': [].concat(
      [
        [C.brown, RR(180, 140, 40, 780, 4), {}],
        [C.brown, RR(780, 140, 40, 780, 4), {}],
        [C.brown, RR(160, 120, 680, 50, 6), {}],
      ],
      [
        [C.paper, E(500, 270, 100, 100), { w: 16 }],
        [C.brown, E(500, 270, 22, 22), {}],
      ],
      [L('M402 270L402 420', INK, 9), L('M598 270L598 700', INK, 9)],
      [
        [C.orange, 'M340 440L460 440L440 560L360 560Z', {}],
        L('M345 440C350 400 450 400 455 440', INK, 8),
        [C.sky, 'M345 450L455 450L452 480L348 480Z', { s: 'none' }],
      ],
      [
        [C.orange, 'M540 700L660 700L640 820L560 820Z', {}],
        L('M545 700C550 660 650 660 655 700', INK, 8),
      ],
      [
        [C.sky, E(600, 870, 100, 20), {}],
        L('M520 870L480 840M680 870L720 840', C.sky, 9),
      ],
    ),
    /* 862 五顏六色 */
    'w-idiom-58': (function () {
      var cols = [C.red, C.orange, C.yellow, C.mint, C.sky, C.violet],
        out = [];
      cols.forEach(function (c, i) {
        var x = 150 + i * 140,
          top = 330 + (i % 2) * 40;
        out.push([c, RR(x, top + 80, 110, 540, 12), {}]);
        out.push(
          poly(
            [
              [x, top + 80],
              [x + 110, top + 80],
              [x + 55, top - 40],
            ],
            c,
          ),
        );
        out.push([C.paper, RR(x, top + 260, 110, 150, 0), {}]);
        out.push(
          L(
            'M' +
              (x + 20) +
              ' ' +
              (top + 300) +
              'L' +
              (x + 90) +
              ' ' +
              (top + 300) +
              'M' +
              (x + 20) +
              ' ' +
              (top + 350) +
              'L' +
              (x + 90) +
              ' ' +
              (top + 350),
            INK,
            7,
          ),
        );
      });
      return out;
    })(),
    /* 863 七嘴八舌 */
    'w-idiom-59': [].concat(
      person(200, 520, 0.85, {
        shirt: C.red,
        arms: [[-30, 20, -30, -70], 50],
        hair: C.brown,
        mood: 'open',
        legs: [
          [0, 0],
          [0, 0],
        ],
      }),
      person(800, 520, 0.85, {
        shirt: C.green,
        arms: [-50, [30, 20, 30, -80]],
        hair: C.ink,
        skin: C.orange,
        mood: 'open',
      }),
      person(200, 960, 0.85, {
        shirt: C.violet,
        arms: [-40, 40],
        hair: C.ink,
        skin: C.pink,
        mood: 'open',
      }),
      person(800, 960, 0.85, {
        shirt: C.orange,
        arms: [[-30, 20, -30, -70], 50],
        hair: C.brown,
        mood: 'open',
      }),
      [
        [C.paper, E(500, 300, 110, 55), {}],
        L('M440 295L560 295M450 320L540 320', INK, 7),
      ],
      [
        [C.paper, E(500, 720, 110, 55), {}],
        L('M440 715L560 715M450 740L540 740', INK, 7),
      ],
      [[C.paper, E(500, 510, 90, 45), {}], L('M450 505L550 505', INK, 7)],
    ),
    /* 864 手忙腳亂 */
    'w-idiom-60': [].concat(
      [
        paperSheet(120, 180, 160, 120, -20),
        paperSheet(720, 160, 160, 120, 25),
        paperSheet(780, 560, 150, 110, -15),
        paperSheet(80, 560, 150, 110, 15),
        paperSheet(480, 100, 160, 110, 8),
      ],
      person(500, 960, 1.25, {
        shirt: C.red,
        pants: C.blue,
        arms: [
          [-70, -80, -110, -170],
          [100, 10, 120, 100],
        ],
        legs: [
          [-70, 0],
          [60, 60],
        ],
        mood: 'open',
        hair: C.ink,
      }),
      drop(330, 400, 0.6),
      drop(690, 360, 0.6),
    ),
    /* 865 目瞪口呆 */
    'w-idiom-61': [].concat(
      [
        [C.yellow, E(500, 520, 300, 320), {}],
        [C.brown, 'M200 450A300 300 0 0 1 800 450Q500 280 200 450Z', {}],
      ],
      [
        [C.paper, E(380, 480, 80, 80), { w: 10 }],
        [C.paper, E(620, 480, 80, 80), { w: 10 }],
        dot(380, 490, 20),
        dot(620, 490, 20),
      ],
      [
        L('M290 360C340 310 420 320 450 360', INK, 12),
        L('M550 360C580 320 660 310 710 360', INK, 12),
      ],
      [
        [C.red, E(500, 730, 65, 90), {}],
        [C.pink, E(500, 780, 40, 36), { s: 'none' }],
      ],
      [drop(800, 330, 0.8)],
    ),
    /* 866 面紅耳赤 */
    'w-idiom-62': [].concat(
      [
        [C.red, E(210, 520, 50, 80), {}],
        [C.red, E(790, 520, 50, 80), {}],
      ],
      [
        [C.pink, E(500, 520, 290, 310), {}],
        [C.brown, 'M210 450A290 290 0 0 1 790 450Q500 300 210 450Z', {}],
      ],
      [
        [C.red, E(330, 600, 75, 55), { s: 'none' }],
        [C.red, E(670, 600, 75, 55), { s: 'none' }],
      ],
      [
        dot(380, 500, 18),
        dot(620, 500, 18),
        L('M300 430L440 450M700 430L560 450', INK, 11),
      ],
      [L('M440 720C470 700 500 740 530 720C550 710 560 720 570 730', INK, 9)],
      [
        L(
          'M380 170C350 110 410 90 380 30M500 170C470 110 530 90 500 30M620 170C590 110 650 90 620 30',
          C.red,
          11,
        ),
      ],
    ),
    /* 867 心花怒放 */
    'w-idiom-63': [].concat(
      flower(180, 270, 1.6, C.pink, C.yellow),
      flower(820, 250, 1.6, C.violet, C.yellow),
      flower(100, 600, 1.3, C.yellow, C.orange),
      flower(900, 580, 1.3, C.pink, C.yellow),
      flower(500, 130, 1.3, C.red, C.yellow),
      person(500, 960, 1.3, {
        shirt: C.mint,
        pants: C.blue,
        arms: [-150, 150],
        mood: 'smile',
        hair: C.ink,
        legs: [
          [-10, 0],
          [10, 0],
        ],
      }),
      [heart(500, 600, 0.5)],
    ),
    /* 868 廢寢忘食 */
    'w-idiom-64': [].concat(
      [
        [C.blue, RR(600, 90, 300, 300, 10), { w: 16 }],
        [C.yellow, 'M770 150A80 80 0 1 0 830 290A60 60 0 1 1 770 150Z', {}],
        dot(660, 180, 8, C.paper),
        dot(680, 320, 8, C.paper),
        L('M750 90L750 390M600 240L900 240', INK, 9),
      ],
      person(260, 960, 1.15, {
        shirt: C.orange,
        pants: C.blue,
        arms: [
          [0, 60, 90, 110],
          [40, 90],
        ],
        mood: 'sad',
        hair: C.ink,
      }),
      [L('M215 580L255 570M295 580L335 570', INK, 7)],
      [
        [C.brown, RR(60, 700, 880, 60, 8), {}],
        [C.brown, RR(110, 760, 50, 220, 4), {}],
        [C.brown, RR(840, 760, 50, 220, 4), {}],
      ],
      [
        [C.paper, RR(280, 650, 190, 50, 4), {}],
        L('M300 670L450 670M300 685L450 685', INK, 5),
      ],
      [
        [C.paper, 'M640 700C640 640 760 640 760 700Z', {}],
        [C.orange, E(700, 660, 50, 20), { s: 'none' }],
        L('M690 640L690 590M720 640L720 590', C.sky, 9),
      ],
      [L('M780 690L880 600M800 700L900 620', C.brown, 9)],
    ),
    /* 869 自相矛盾 */
    'w-idiom-65': [].concat(
      shield(550, 520, 260),
      [L('M470 400L640 640M640 400L470 640', INK, 9)],
      [L('M100 960L800 260', INK, 40), L('M100 960L800 260', C.brown, 24)],
      [
        poly(
          [
            [800, 260],
            [900, 100],
            [740, 200],
          ],
          C.violet,
        ),
      ],
      [
        poly(
          [
            [800, 260],
            [900, 100],
            [900, 200],
            [820, 280],
          ],
          C.sky,
          { s: 'none' },
        ),
      ],
    ),
    /* 870 班門弄斧 */
    'w-idiom-66': [].concat(
      [
        [C.brown, RR(520, 150, 340, 760, 8), {}],
        [C.orange, RR(560, 200, 260, 320, 6), {}],
        [C.orange, RR(560, 560, 260, 300, 6), {}],
        [C.yellow, E(540, 560, 20, 20), {}],
        [C.yellow, RR(600, 60, 180, 50, 6), {}],
      ],
      person(260, 940, 1.15, {
        shirt: C.green,
        pants: C.blue,
        arms: [150, 175],
        mood: 'smile',
        hair: C.ink,
        legs: [
          [-10, 0],
          [20, 0],
        ],
      }),
      (function () {
        var h = hand(260, 940, 1.15, 1, 175);
        return [
          L(
            'M' +
              rd(h[0]) +
              ' ' +
              rd(h[1] + 80) +
              'L' +
              rd(h[0] + 10) +
              ' ' +
              rd(h[1] - 150),
            INK,
            30,
          ),
          L(
            'M' +
              rd(h[0]) +
              ' ' +
              rd(h[1] + 80) +
              'L' +
              rd(h[0] + 10) +
              ' ' +
              rd(h[1] - 150),
            C.brown,
            18,
          ),
          poly(
            [
              [h[0] + 10, h[1] - 150],
              [h[0] + 110, h[1] - 190],
              [h[0] + 110, h[1] - 60],
              [h[0] + 10, h[1] - 90],
            ],
            C.violet,
          ),
        ];
      })(),
    ),
    /* 871 東施效顰 */
    'w-idiom-67': [].concat(
      person(270, 960, 1.4, {
        dress: C.pink,
        hairStyle: 'long',
        arms: [150, [-30, 30, -90, 50]],
        mood: 'sad',
        hair: C.ink,
        skin: C.yellow,
      }),
      person(730, 960, 1.4, {
        dress: C.mint,
        hairStyle: 'long',
        arms: [[30, 30, 90, 50], -150],
        mood: 'sad',
        hair: C.brown,
        skin: C.orange,
      }),
      [heart(500, 300, 0.3, C.pink)],
    ),
    /* 872 濫竽充數 */
    'w-idiom-68': [].concat(
      person(380, 930, 1.2, {
        shirt: C.red,
        pants: C.ink,
        arms: [
          [-30, 60, 80, -120],
          [30, 60, 160, -130],
        ],
        mood: 'flat',
        hair: C.ink,
      }),
      [
        [C.yellow, E(560, 380, 70, 35), {}],
        [C.brown, RR(480, 120, 30, 250, 6), {}],
        [C.brown, RR(520, 80, 30, 290, 6), {}],
        [C.brown, RR(560, 140, 30, 230, 6), {}],
        [C.brown, RR(600, 100, 30, 270, 6), {}],
      ],
      [drop(240, 470, 0.7), drop(180, 540, 0.6), drop(530, 560, 0.5)],
      person(840, 930, 0.6, {
        shirt: C.violet,
        pants: C.ink,
        arms: [30, -30],
        mood: 'smile',
        hair: C.ink,
      }),
      [
        poly(
          [
            [800, 540],
            [820, 490],
            [840, 530],
            [860, 490],
            [880, 540],
          ],
          C.yellow,
        ),
      ],
    ),
    /* 873 南轅北轍 */
    'w-idiom-69': [].concat(
      groundBg(C.yellow, 860),
      [
        [C.brown, RR(870, 240, 36, 620, 4), {}],
        [C.red, 'M900 240L790 240L720 310L790 380L900 380Z', {}],
      ],
      [
        [C.brown, RR(150, 560, 230, 120, 8), {}],
        [C.brown, E(180, 760, 80, 80), {}],
        [C.yellow, E(180, 760, 28, 28), {}],
        [C.brown, E(350, 760, 80, 80), {}],
        [C.yellow, E(350, 760, 28, 28), {}],
        L('M120 690L120 560M410 690L410 560', INK, 8),
      ],
      horse(500, 880, 0.8, 1, C.violet, C.ink, 'walk'),
      [L('M400 640L470 640', INK, 10)],
    ),
    /* 874 守口如瓶 */
    'w-idiom-70': [].concat(
      [
        [C.yellow, E(330, 440, 210, 210), {}],
        [C.brown, 'M120 400A210 210 0 0 1 540 400Q330 230 120 400Z', {}],
        dot(250, 410, 15),
        dot(410, 410, 15),
        L('M230 340L280 330M380 330L430 340', INK, 9),
      ],
      [
        [C.yellow, RR(305, 470, 50, 250, 25), {}],
        [C.yellow, E(330, 770, 100, 90), {}],
        L('M270 590L390 590', INK, 7),
        [C.red, E(330, 590, 50, 14), { s: 'none' }],
      ],
      [
        [C.mint, RR(640, 560, 220, 380, 50), {}],
        [C.mint, RR(710, 380, 80, 200, 10), {}],
        [C.brown, RR(705, 330, 90, 70, 10), {}],
        [C.paper, RR(660, 680, 180, 120, 10), { s: 'none' }],
      ],
      [L('M280 590L380 590', INK, 9)],
    ),
    /* 875 雪上加霜 */
    'w-idiom-71': [].concat(
      skyBg(C.sky),
      [
        [
          C.paper,
          'M-20 760C250 690 450 760 650 720C800 690 900 720 1020 700L1020 1020L-20 1020Z',
          {},
        ],
      ],
      [
        [C.paper, E(380, 790, 110, 100), {}],
        [C.paper, E(380, 650, 80, 75), {}],
        [INK, E(360, 635, 8, 8), { s: 'none' }],
        [INK, E(400, 635, 8, 8), { s: 'none' }],
        poly(
          [
            [380, 655],
            [455, 668],
            [380, 680],
          ],
          C.orange,
        ),
        [INK, E(380, 770, 9, 9), { s: 'none' }],
        [INK, E(380, 810, 9, 9), { s: 'none' }],
        [INK, RR(325, 540, 110, 18, 3), {}],
        [INK, RR(345, 470, 70, 80, 3), {}],
      ],
      L('M300 700L220 640M460 700L540 650', C.brown, 14),
      [
        [C.paper, RR(740, 180, 80, 500, 40), { w: 9 }],
        [C.red, RR(768, 480, 24, 200, 12), { s: 'none' }],
        [C.red, E(780, 700, 56, 56), {}],
      ],
      snowflake(160, 180, 44),
      snowflake(420, 160, 36),
      snowflake(560, 330, 44),
      snowflake(250, 400, 34),
      snowflake(900, 380, 40),
      snowflake(640, 120, 30),
    ),
    /* 876 光陰似箭 */
    'w-idiom-72': [].concat(
      [[C.paper, E(450, 500, 280, 280), { w: 16 }]],
      [
        L(
          'M450 250L450 290M450 710L450 750M200 500L240 500M660 500L700 500',
          INK,
          14,
        ),
      ],
      [
        L('M450 500L450 340', INK, 16),
        L('M450 500L560 560', INK, 16),
        dot(450, 500, 16),
      ],
      [L('M60 560L880 480', INK, 34), L('M60 560L880 480', C.brown, 18)],
      [
        poly(
          [
            [960, 470],
            [840, 400],
            [850, 470],
            [840, 550],
          ],
          C.violet,
        ),
      ],
      [
        poly(
          [
            [60, 560],
            [140, 600],
            [100, 540],
          ],
          C.red,
        ),
        poly(
          [
            [60, 560],
            [150, 500],
            [110, 570],
          ],
          C.red,
        ),
        poly(
          [
            [110, 555],
            [200, 600],
            [160, 540],
          ],
          C.red,
        ),
      ],
      [L('M300 360L120 380M320 700L140 730', C.sky, 12)],
    ),
    /* 877 滄海桑田 */
    'w-idiom-73': [].concat(
      skyBg(C.paper),
      sunP(500, 170, 70),
      [
        [
          C.blue,
          'M-20 400L520 400C560 520 440 600 500 700C540 780 480 900 520 1020L-20 1020Z',
          {},
        ],
      ],
      [
        L(
          'M60 520Q130 490 200 520T340 520M120 640Q190 610 260 640T400 640M60 780Q130 750 200 780T340 780',
          C.sky,
          11,
        ),
      ],
      [
        [
          C.mint,
          'M520 400L1020 400L1020 1020L520 1020C480 900 540 780 500 700C440 600 560 520 520 400Z',
          {},
        ],
        L('M600 700L1000 700M580 800L1000 800M600 900L1000 900', C.green, 10),
      ],
      tube(
        [
          [800, 640],
          [800, 500],
        ],
        36,
        C.brown,
      ),
      [
        [C.green, E(800, 440, 120, 90), {}],
        [C.violet, E(750, 430, 14, 14), {}],
        [C.violet, E(830, 460, 14, 14), {}],
        [C.violet, E(790, 380, 14, 14), {}],
      ],
      [
        [C.brown, 'M130 450L330 450L290 520L170 520Z', {}],
        L('M230 450L230 330', INK, 9),
        poly(
          [
            [230, 330],
            [230, 440],
            [330, 440],
          ],
          C.paper,
        ),
      ],
    ),
    /* 878 世外桃源 */
    'w-idiom-74': [].concat(
      [
        [C.violet, 'M-20 600L220 260L460 600Z', {}],
        [C.sky, 'M300 600L640 200L1020 600Z', {}],
      ],
      [[C.mint, 'M-20 560C250 500 500 560 1020 520L1020 1020L-20 1020Z', {}]],
      [
        L(
          'M520 580C400 700 650 780 480 900C440 940 480 980 440 1020',
          C.sky,
          80,
        ),
        L(
          'M520 580C400 700 650 780 480 900C440 940 480 980 440 1020',
          C.paper,
          50,
        ),
      ],
      [
        [C.yellow, RR(720, 540, 180, 130, 4), {}],
        poly(
          [
            [700, 550],
            [810, 450],
            [920, 550],
          ],
          C.brown,
        ),
        [C.brown, RR(790, 590, 40, 80, 3), {}],
      ],
      tube(
        [
          [200, 760],
          [200, 640],
        ],
        30,
        C.brown,
      ),
      [
        [C.pink, E(200, 580, 110, 85), {}],
        [C.red, E(160, 570, 12, 12), { s: 'none' }],
        [C.red, E(240, 600, 12, 12), { s: 'none' }],
      ],
      tube(
        [
          [330, 700],
          [330, 600],
        ],
        26,
        C.brown,
      ),
      [
        [C.pink, E(330, 550, 85, 65), {}],
        [C.red, E(300, 540, 10, 10), { s: 'none' }],
      ],
      tube(
        [
          [640, 840],
          [640, 740],
        ],
        30,
        C.brown,
      ),
      [
        [C.pink, E(640, 680, 100, 80), {}],
        [C.red, E(610, 670, 12, 12), { s: 'none' }],
        [C.red, E(680, 700, 12, 12), { s: 'none' }],
      ],
      [
        [C.pink, E(780, 780, 12, 8), { s: 'none' }],
        [C.pink, E(860, 840, 12, 8), { s: 'none' }],
      ],
    ),
    /* 879 一目瞭然 */
    'w-idiom-75': [].concat(
      [L('M180 330C300 160 700 160 820 330C700 500 300 500 180 330Z', INK, 20)],
      [
        [
          C.paper,
          'M180 330C300 160 700 160 820 330C700 500 300 500 180 330Z',
          {},
        ],
        [C.sky, E(500, 330, 100, 100), {}],
        dot(500, 330, 50),
        dot(470, 300, 18, C.paper),
      ],
      [L('M280 190L240 120M500 150L500 70M720 190L760 120', INK, 14)],
      [L('M440 520L400 640M560 520L600 640', INK, 8)],
      [
        [C.paper, E(500, 780, 170, 170), {}],
        [C.red, E(500, 780, 130, 130), { s: 'none' }],
        [C.paper, E(500, 780, 85, 85), {}],
        [C.red, E(500, 780, 40, 40), {}],
      ],
    ),
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
