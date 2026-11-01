/* Reusable building blocks for the drawing references. Every function returns an array of layers
 * ([fill, 'svg path', opts]) that can be spread into a recipe, e.g.
 *   cat: [].concat(K.sky(), K.ground('#7bb662'), K.tree(300, 800, 1), [['#e0a060', 'E500 500 120 90']])
 * Coordinates use the 0..1000 reference canvas; the picture is cropped to -40..1040. */
(function (root, factory) {
  'use strict';
  var api = factory(
    typeof module === 'object' && module.exports
      ? require('./reference-path.js')
      : root.ReferencePath,
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ReferenceKit = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Path) {
  'use strict';

  var rad = function (deg) {
    return (deg * Math.PI) / 180;
  };
  var r1 = function (n) {
    return Math.round(n * 10) / 10;
  };

  function hexMix(a, b, t) {
    var x = [1, 3, 5].map(function (i) {
      return parseInt(a.substr(i, 2), 16);
    });
    var y = [1, 3, 5].map(function (i) {
      return parseInt(b.substr(i, 2), 16);
    });
    return (
      '#' +
      [0, 1, 2]
        .map(function (i) {
          var v = Math.round(x[i] + (y[i] - x[i]) * t);
          return (v < 16 ? '0' : '') + v.toString(16);
        })
        .join('')
    );
  }
  var lighten = function (c, t) {
    return hexMix(c, '#ffffff', t == null ? 0.3 : t);
  };
  var darken = function (c, t) {
    return hexMix(c, '#1d1224', t == null ? 0.3 : t);
  };

  /* ---------- geometry helpers ---------- */
  var E = function (cx, cy, rx, ry, rot) {
    return 'E' + [cx, cy, rx, ry, rot || 0].map(r1).join(' ');
  };
  var RR = function (x, y, w, h, r) {
    return 'R' + [x, y, w, h, r || 0].map(r1).join(' ');
  };
  var poly = function (pts, closed) {
    var d =
      'M' +
      pts
        .map(function (p) {
          return r1(p[0]) + ' ' + r1(p[1]);
        })
        .join('L');
    return closed === false ? d : d + 'Z';
  };

  /** Transform layers: {dx,dy} move, {s} or {sx,sy} scale and {rot} degrees about pivot {cx,cy}. */
  function T(layers, o) {
    o = o || {};
    var sx = o.sx != null ? o.sx : o.s != null ? o.s : 1;
    var sy = o.sy != null ? o.sy : o.s != null ? o.s : 1;
    var cx = o.cx || 0,
      cy = o.cy || 0,
      a = rad(o.rot || 0);
    var c = Math.cos(a),
      s = Math.sin(a);
    // p' = R * S * (p - pivot) + pivot + move
    var m = [c * sx, s * sx, -s * sy, c * sy, 0, 0];
    m[4] = cx + (o.dx || 0) - (m[0] * cx + m[2] * cy);
    m[5] = cy + (o.dy || 0) - (m[1] * cx + m[3] * cy);
    var k = Math.sqrt(Math.abs(sx * sy)) || 1;
    return layers.map(function (layer) {
      var opts = Object.assign({}, layer[2] || {});
      if (opts.w) opts.w = r1(opts.w * k);
      if (opts.bl) opts.bl = r1(opts.bl * k);
      return [layer[0], Path.transform(layer[1], m), opts];
    });
  }
  var mirror = function (layers, cx) {
    return T(layers, { sx: -1, cx: cx == null ? 500 : cx });
  };

  /* ---------- limbs and tubes ---------- */
  /** A lit tube along a polyline: dark outline, body colour, soft highlight. */
  function tube(pts, w, color, o) {
    o = o || {};
    var d =
      'M' +
      pts
        .map(function (p) {
          return r1(p[0]) + ' ' + r1(p[1]);
        })
        .join('L');
    var out = [
      ['none', d, { s: o.outline || '#4A3B55', w: w + 14 }],
      ['none', d, { s: color, w: w }],
    ];
    return out;
  }

  /* ---------- people ---------- */
  var DIR = function (deg) {
    return [Math.sin(rad(deg)), Math.cos(rad(deg))];
  };
  var add = function (p, d, len) {
    return [p[0] + d[0] * len, p[1] + d[1] * len];
  };

  /**
   * A shaded person built from a skeleton. Angles are degrees measured from "straight down"
   * towards screen-right (0 down, 90 right, 180 up, -90 left); a limb is [upperAngle, lowerAngle].
   * opts: x,y feet centre; h total height (default 740); view 'front'|'side'; dir 1|-1 (side facing);
   * skin, hair, shirt, pants, shoe; hairStyle 'short'|'long'|'bun'|'bald'|'cap'|'pony';
   * female (dress=true for skirt); sleeves 'short'|'long'|'none'; shorts true;
   * face 'smile'|'open'|'sad'|'neutral'|'wink'; lean (torso tilt, deg); tilt (head tilt, deg);
   * armL, armR, legL, legR (screen left/right limbs when front view; far/near when side view).
   */
  function person(o) {
    o = Object.assign(
      {
        x: 500,
        y: 920,
        h: 740,
        view: 'front',
        dir: 1,
        skin: '#e8b48c',
        hair: '#3a2a22',
        shirt: '#3f7fd0',
        pants: '#33415f',
        shoe: '#2a2a32',
        hairStyle: 'short',
        female: false,
        dress: false,
        sleeves: 'short',
        shorts: false,
        face: 'smile',
        lean: 0,
        tilt: 0,
        armL: [10, 5],
        armR: [-10, -5],
        legL: [3, 0],
        legR: [-3, 0],
      },
      o,
    );
    var h = o.h,
      side = o.view === 'side',
      dir = o.dir;
    var legU = h * 0.245,
      legL2 = h * 0.235,
      footH = h * 0.03;
    var torsoH = h * 0.3,
      neckH = h * 0.04,
      headR = h * 0.092;
    var armU = h * 0.165,
      armL2 = h * 0.15;
    var hipW = (o.female ? 0.052 : 0.046) * h * (side ? 0 : 1);
    var shW = (o.female ? 0.088 : 0.108) * h * (side ? 0 : 1);
    var w1 = h * (o.female ? 0.058 : 0.066),
      w2 = h * 0.05;
    var pelvis = [o.x, o.y - legU - legL2 - footH];
    var lean = o.lean;
    var up = DIR(180 - lean);
    var neck = add(pelvis, up, torsoH);
    var shoulderBase = add(pelvis, up, torsoH - h * 0.03);
    var perp = [Math.cos(rad(lean)), -Math.sin(rad(lean))];
    var layers = [];
    var shoeCol = o.shoe;

    function leg(angles, sx) {
      var hip = side ? pelvis : [pelvis[0] + sx * hipW, pelvis[1]];
      var knee = add(hip, DIR(angles[0]), legU);
      var ankle = add(knee, DIR(angles[1]), legL2);
      var pantsFull = !o.shorts && !(o.dress && o.female);
      var parts = [];
      // skin leg first when shorts/dress, trousers cover afterwards
      if (!pantsFull)
        parts = parts.concat(tube([hip, knee, ankle], w1 * 0.9, o.skin));
      if (pantsFull)
        parts = parts.concat(tube([hip, knee, ankle], w1, o.pants));
      else if (o.shorts)
        parts = parts.concat(
          tube(
            [hip, add(hip, DIR(angles[0]), legU * 0.72)],
            w1 * 1.05,
            o.pants,
          ),
        );
      // shoe: a rounded wedge pointing the way the person faces
      var fdir = side ? dir : sx >= 0 ? 0.55 : -0.55;
      var fx = fdir * h * 0.075;
      var shoe = poly([
        [ankle[0] - w2 * 0.6, ankle[1] - w2 * 0.2],
        [ankle[0] + w2 * 0.6, ankle[1] - w2 * 0.2],
        [
          ankle[0] + fx + (fdir >= 0 ? w2 * 0.6 : -w2 * 0.6),
          ankle[1] + footH * 0.8,
        ],
        [ankle[0] + fx * 0.6, ankle[1] + footH * 1.3],
        [ankle[0] - w2 * 0.6, ankle[1] + footH * 1.3],
      ]);
      parts.push([shoeCol, shoe, { g: 'l', w: 6 }]);
      return parts;
    }
    function arm(angles, sx) {
      var sh = side
        ? add(shoulderBase, perp, 0)
        : add(shoulderBase, perp, sx * shW);
      var elbow = add(sh, DIR(angles[0]), armU);
      var hand = add(elbow, DIR(angles[1]), armL2);
      var sleeveFull = o.sleeves === 'long';
      var parts = [];
      parts = parts.concat(tube([sh, elbow, hand], w2, o.skin));
      if (o.sleeves !== 'none') {
        var cut = sleeveFull ? hand : add(sh, DIR(angles[0]), armU * 0.62);
        var pts = sleeveFull ? [sh, elbow, hand] : [sh, cut];
        parts = parts.concat(tube(pts, w2 * 1.12, o.shirt));
      }
      parts.push([o.skin, E(hand[0], hand[1], w2 * 0.62, w2 * 0.7), { w: 6 }]);
      return parts;
    }

    var farSign = side ? -1 : -1; // screen-left limbs in front view / far limbs in side view first
    layers = layers.concat(arm(o.armL, side ? 0 : -1));
    layers = layers.concat(leg(o.legL, -1));
    // torso
    var tw = (side ? 0.07 : o.female ? 0.1 : 0.12) * h;
    var bw = (side ? 0.062 : o.female ? 0.098 : 0.095) * h;
    var tl = add(neck, perp, -tw),
      tr = add(neck, perp, tw);
    var bl = add(pelvis, perp, -bw),
      br = add(pelvis, perp, bw);
    var torsoD =
      'M' +
      r1(tl[0]) +
      ' ' +
      r1(tl[1] + h * 0.02) +
      'Q' +
      r1(neck[0]) +
      ' ' +
      r1(neck[1] - h * 0.02) +
      ' ' +
      r1(tr[0]) +
      ' ' +
      r1(tr[1] + h * 0.02) +
      'L' +
      r1(br[0]) +
      ' ' +
      r1(br[1]) +
      'L' +
      r1(bl[0]) +
      ' ' +
      r1(bl[1]) +
      'Z';
    if (o.dress && o.female) {
      var hem = [
        [pelvis[0] - h * 0.17, pelvis[1] + h * 0.25],
        [pelvis[0] + h * 0.17, pelvis[1] + h * 0.25],
      ];
      layers.push([
        o.pants,
        'M' +
          r1(bl[0]) +
          ' ' +
          r1(bl[1]) +
          'L' +
          r1(hem[0][0]) +
          ' ' +
          r1(hem[0][1]) +
          'Q' +
          r1(pelvis[0]) +
          ' ' +
          r1(hem[0][1] + h * 0.03) +
          ' ' +
          r1(hem[1][0]) +
          ' ' +
          r1(hem[1][1]) +
          'L' +
          r1(br[0]) +
          ' ' +
          r1(br[1]) +
          'Z',
        { g: 'l', w: 7 },
      ]);
    }
    layers.push([o.shirt, torsoD, { g: 'l', w: 7 }]);
    layers = layers.concat(leg(o.legR, 1));
    layers = layers.concat(arm(o.armR, side ? 0 : 1));
    // neck + head
    var headC = add(neck, DIR(180 - lean + o.tilt), neckH + headR * 0.95);
    layers = layers.concat(
      tube(
        [add(neck, up, -h * 0.02), add(neck, up, h * 0.03)],
        h * 0.05,
        hexMix(o.skin, '#7a4a30', 0.12),
        { flat: true },
      ),
    );
    var hx = headC[0],
      hy = headC[1];
    layers.push([
      o.skin,
      E(hx, hy, headR * (side ? 0.95 : 0.88), headR, o.tilt),
      { w: 7 },
    ]);
    if (!side) {
      layers.push([
        o.skin,
        E(hx - headR * 0.9, hy + headR * 0.05, headR * 0.16, headR * 0.26),
        { w: 5 },
      ]);
      layers.push([
        o.skin,
        E(hx + headR * 0.9, hy + headR * 0.05, headR * 0.16, headR * 0.26),
        { w: 5 },
      ]);
    }
    // hair
    var hs = o.hairStyle;
    if (hs !== 'bald') {
      var hc = o.hair;
      if (hs === 'cap') hc = o.hat || '#d94a3d';
      var top =
        'M' +
        r1(hx - headR * 0.95) +
        ' ' +
        r1(hy - headR * 0.1) +
        'C' +
        r1(hx - headR * 1.0) +
        ' ' +
        r1(hy - headR * 1.35) +
        ' ' +
        r1(hx + headR * 1.0) +
        ' ' +
        r1(hy - headR * 1.35) +
        ' ' +
        r1(hx + headR * 0.95) +
        ' ' +
        r1(hy - headR * 0.1) +
        'Q' +
        r1(hx + headR * 0.6) +
        ' ' +
        r1(hy - headR * 0.62) +
        ' ' +
        r1(hx) +
        ' ' +
        r1(hy - headR * 0.58) +
        'Q' +
        r1(hx - headR * 0.6) +
        ' ' +
        r1(hy - headR * 0.62) +
        ' ' +
        r1(hx - headR * 0.95) +
        ' ' +
        r1(hy - headR * 0.1) +
        'Z';
      if (hs === 'long') {
        layers.unshift();
        layers.push([
          hc,
          'M' +
            r1(hx - headR * 0.98) +
            ' ' +
            r1(hy - headR * 0.1) +
            'L' +
            r1(hx - headR * 1.1) +
            ' ' +
            r1(hy + headR * 1.9) +
            'L' +
            r1(hx - headR * 0.55) +
            ' ' +
            r1(hy + headR * 1.7) +
            'L' +
            r1(hx - headR * 0.6) +
            ' ' +
            r1(hy) +
            'Z',
          { g: 'l', w: 6 },
        ]);
        layers.push([
          hc,
          'M' +
            r1(hx + headR * 0.98) +
            ' ' +
            r1(hy - headR * 0.1) +
            'L' +
            r1(hx + headR * 1.1) +
            ' ' +
            r1(hy + headR * 1.9) +
            'L' +
            r1(hx + headR * 0.55) +
            ' ' +
            r1(hy + headR * 1.7) +
            'L' +
            r1(hx + headR * 0.6) +
            ' ' +
            r1(hy) +
            'Z',
          { g: 'l', w: 6 },
        ]);
      }
      layers.push([hc, top, { g: 'l', w: 7 }]);
      if (hs === 'bun')
        layers.push([
          hc,
          E(hx, hy - headR * 1.25, headR * 0.42, headR * 0.36),
          { w: 6 },
        ]);
      if (hs === 'pony')
        layers.push([
          hc,
          'M' +
            r1(hx + headR * 0.8) +
            ' ' +
            r1(hy - headR * 0.6) +
            'Q' +
            r1(hx + headR * 1.9) +
            ' ' +
            r1(hy - headR * 0.2) +
            ' ' +
            r1(hx + headR * 1.35) +
            ' ' +
            r1(hy + headR * 1.4) +
            'Q' +
            r1(hx + headR * 1.1) +
            ' ' +
            r1(hy + headR * 0.4) +
            ' ' +
            r1(hx + headR * 0.7) +
            ' ' +
            r1(hy - headR * 0.2) +
            'Z',
          { w: 6 },
        ]);
      if (hs === 'cap')
        layers.push([
          hc,
          'M' +
            r1(hx - headR * 1.0) +
            ' ' +
            r1(hy - headR * 0.35) +
            'L' +
            r1(hx + headR * 1.55 * (side ? dir : 1)) +
            ' ' +
            r1(hy - headR * 0.3) +
            'L' +
            r1(hx + headR * 1.45 * (side ? dir : 1)) +
            ' ' +
            r1(hy - headR * 0.1) +
            'L' +
            r1(hx - headR * 0.9) +
            ' ' +
            r1(hy - headR * 0.1) +
            'Z',
          { w: 6 },
        ]);
    }
    // face
    var ink = '#2a1c18';
    var eyeY = hy + headR * 0.08;
    var face = [];
    if (!side) {
      [-1, 1].forEach(function (sg) {
        var ex = hx + sg * headR * 0.36;
        if (o.face === 'wink' && sg === 1)
          face.push([
            'none',
            'M' +
              r1(ex - headR * 0.14) +
              ' ' +
              r1(eyeY) +
              'Q' +
              r1(ex) +
              ' ' +
              r1(eyeY - headR * 0.14) +
              ' ' +
              r1(ex + headR * 0.14) +
              ' ' +
              r1(eyeY),
            { s: ink, w: 5 },
          ]);
        else {
          face.push([
            '#ffffff',
            E(ex, eyeY, headR * 0.15, headR * 0.12),
            { s: 'none', g: 'n' },
          ]);
          face.push([
            ink,
            E(ex, eyeY, headR * 0.09, headR * 0.1),
            { s: 'none', g: 'n' },
          ]);
        }
        face.push([
          'none',
          'M' +
            r1(ex - headR * 0.18) +
            ' ' +
            r1(eyeY - headR * 0.24) +
            'Q' +
            r1(ex) +
            ' ' +
            r1(eyeY - headR * 0.32) +
            ' ' +
            r1(ex + headR * 0.18) +
            ' ' +
            r1(eyeY - headR * 0.22),
          { s: darken(o.hair, 0.1), w: 5 },
        ]);
      });
      face.push([
        'none',
        'M' +
          r1(hx) +
          ' ' +
          r1(eyeY + headR * 0.08) +
          'L' +
          r1(hx - headR * 0.06) +
          ' ' +
          r1(eyeY + headR * 0.3) +
          'L' +
          r1(hx + headR * 0.05) +
          ' ' +
          r1(eyeY + headR * 0.31),
        { s: darken(o.skin, 0.25), w: 4 },
      ]);
    } else {
      var ex2 = hx + dir * headR * 0.42;
      face.push([
        '#ffffff',
        E(ex2, eyeY, headR * 0.14, headR * 0.12),
        { s: 'none', g: 'n' },
      ]);
      face.push([
        ink,
        E(ex2 + dir * headR * 0.03, eyeY, headR * 0.08, headR * 0.1),
        { s: 'none', g: 'n' },
      ]);
      face.push([
        o.skin,
        'M' +
          r1(hx + dir * headR * 0.88) +
          ' ' +
          r1(eyeY) +
          'L' +
          r1(hx + dir * headR * 1.13) +
          ' ' +
          r1(eyeY + headR * 0.28) +
          'L' +
          r1(hx + dir * headR * 0.85) +
          ' ' +
          r1(eyeY + headR * 0.3) +
          'Z',
        { w: 5 },
      ]);
    }
    var mx = hx + (side ? dir * headR * 0.45 : 0),
      my = hy + headR * 0.55;
    var mw = headR * (side ? 0.22 : 0.3);
    if (o.face === 'open')
      face.push([
        '#7a2230',
        E(mx, my, mw * 0.8, headR * 0.2),
        { s: '#3a1018', w: 4 },
      ]);
    else if (o.face === 'sad')
      face.push([
        'none',
        'M' +
          r1(mx - mw) +
          ' ' +
          r1(my + headR * 0.1) +
          'Q' +
          r1(mx) +
          ' ' +
          r1(my - headR * 0.14) +
          ' ' +
          r1(mx + mw) +
          ' ' +
          r1(my + headR * 0.1),
        { s: '#7a3a3a', w: 5 },
      ]);
    else if (o.face === 'neutral')
      face.push([
        'none',
        'M' + r1(mx - mw) + ' ' + r1(my) + 'L' + r1(mx + mw) + ' ' + r1(my),
        { s: '#7a3a3a', w: 5 },
      ]);
    else
      face.push([
        'none',
        'M' +
          r1(mx - mw) +
          ' ' +
          r1(my - headR * 0.04) +
          'Q' +
          r1(mx) +
          ' ' +
          r1(my + headR * 0.28) +
          ' ' +
          r1(mx + mw) +
          ' ' +
          r1(my - headR * 0.04),
        { s: '#8a3a3a', w: 5 },
      ]);
    layers = layers.concat(face);
    return layers;
  }

  /* ---------- scenery ---------- */
  /** Vertical sky gradient panel covering the whole picture (first layer of a scene). */
  function sky(top, bottom) {
    return [
      [top || '#bfe3f7', RR(-40, -40, 1080, 1080, 0), { g: 'l', s: 'none' }],
    ];
  }
  function ground(color, y) {
    y = y == null ? 820 : y;
    return [
      [
        color || '#7bb662',
        'M-40 ' +
          y +
          'C200 ' +
          (y - 40) +
          ' 400 ' +
          (y - 20) +
          ' 560 ' +
          (y - 36) +
          'C760 ' +
          (y - 56) +
          ' 900 ' +
          (y - 20) +
          ' 1040 ' +
          (y - 40) +
          'L1040 1040L-40 1040Z',
        { g: 'l', s: 'none' },
      ],
    ];
  }
  function sun(x, y, r) {
    r = r || 90;
    return [['#E7C263', E(x, y, r, r), {}]];
  }
  function cloud(x, y, s) {
    s = s || 1;
    var d =
      'M' +
      (x - 130 * s) +
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
      (x + 130 * s) +
      ' ' +
      (y + 40 * s) +
      'Z';
    return [['#ffffff', d, { g: 'l', s: '#b8c8da', w: 5 }]];
  }
  function tree(x, y, s) {
    s = s || 1;
    return [
      [
        '#7a5232',
        'M' +
          (x - 22 * s) +
          ' ' +
          y +
          'L' +
          (x - 12 * s) +
          ' ' +
          (y - 220 * s) +
          'L' +
          (x + 12 * s) +
          ' ' +
          (y - 220 * s) +
          'L' +
          (x + 22 * s) +
          ' ' +
          y +
          'Z',
        { g: 'c', w: 6 },
      ],
      ['#3f8f45', E(x, y - 290 * s, 120 * s, 105 * s), { b: 1, w: 6 }],
      ['#5FBF95', E(x - 45 * s, y - 330 * s, 50 * s, 34 * s), { i: 1 }],
    ];
  }
  function pine(x, y, s) {
    s = s || 1;
    var tier = function (top, half, hgt, col) {
      return [
        col,
        'M' +
          x +
          ' ' +
          (y - top * s) +
          'L' +
          (x + half * s) +
          ' ' +
          (y - (top - hgt) * s) +
          'L' +
          (x - half * s) +
          ' ' +
          (y - (top - hgt) * s) +
          'Z',
        { g: 'l', w: 6 },
      ];
    };
    return [
      [
        '#6b4a2c',
        RR(x - 14 * s, y - 70 * s, 28 * s, 70 * s, 4),
        { g: 'c', w: 5 },
      ],
      tier(330, 105, 150, '#2f7a46'),
      tier(250, 125, 150, '#378a50'),
      tier(170, 145, 140, '#3f9a58'),
    ];
  }
  function flower(x, y, s, color) {
    s = s || 1;
    color = color || '#ec5f8a';
    var out = [
      [
        'none',
        'M' +
          x +
          ' ' +
          y +
          'Q' +
          (x + 6 * s) +
          ' ' +
          (y - 80 * s) +
          ' ' +
          x +
          ' ' +
          (y - 150 * s),
        { s: '#3f8a3a', w: 9 * s },
      ],
    ];
    for (var i = 0; i < 5; i++) {
      var a = ((i * 72 - 90) * Math.PI) / 180;
      out.push([
        color,
        E(
          x + Math.cos(a) * 34 * s,
          y - 150 * s + Math.sin(a) * 34 * s,
          24 * s,
          17 * s,
          i * 72,
        ),
        { w: 4 },
      ]);
    }
    out.push(['#ffd23f', E(x, y - 150 * s, 17 * s, 17 * s), { w: 4 }]);
    return out;
  }
  function mountain(x, y, w, h, color) {
    color = color || '#8a97ad';
    return [
      [
        color,
        'M' +
          (x - w / 2) +
          ' ' +
          y +
          'L' +
          x +
          ' ' +
          (y - h) +
          'L' +
          (x + w / 2) +
          ' ' +
          y +
          'Z',
        { g: 'l', b: 1, w: 6 },
      ],
      [
        '#ffffff',
        'M' +
          x +
          ' ' +
          (y - h) +
          'L' +
          (x + w * 0.14) +
          ' ' +
          (y - h * 0.68) +
          'L' +
          (x + w * 0.04) +
          ' ' +
          (y - h * 0.74) +
          'L' +
          x +
          ' ' +
          (y - h * 0.62) +
          'L' +
          (x - w * 0.06) +
          ' ' +
          (y - h * 0.72) +
          'L' +
          (x - w * 0.14) +
          ' ' +
          (y - h * 0.68) +
          'Z',
        { i: 1, s: 'none' },
      ],
    ];
  }
  function rock(x, y, s, color) {
    s = s || 1;
    color = color || '#8d9199';
    return [
      [
        color,
        'M' +
          (x - 110 * s) +
          ' ' +
          y +
          'C' +
          (x - 130 * s) +
          ' ' +
          (y - 70 * s) +
          ' ' +
          (x - 60 * s) +
          ' ' +
          (y - 130 * s) +
          ' ' +
          (x + 10 * s) +
          ' ' +
          (y - 125 * s) +
          'C' +
          (x + 90 * s) +
          ' ' +
          (y - 120 * s) +
          ' ' +
          (x + 130 * s) +
          ' ' +
          (y - 50 * s) +
          ' ' +
          (x + 110 * s) +
          ' ' +
          y +
          'Z',
        { b: 1, w: 6 },
      ],
      [darken(color, 0.3), E(x + 60 * s, y - 30 * s, 80 * s, 50 * s), { i: 1 }],
    ];
  }
  function house(x, y, s, wall, roof) {
    s = s || 1;
    wall = wall || '#f1d9a8';
    roof = roof || '#c0503f';
    return [
      [
        wall,
        RR(x - 150 * s, y - 190 * s, 300 * s, 190 * s, 4),
        { g: 'l', w: 6 },
      ],
      [
        roof,
        'M' +
          (x - 185 * s) +
          ' ' +
          (y - 185 * s) +
          'L' +
          x +
          ' ' +
          (y - 330 * s) +
          'L' +
          (x + 185 * s) +
          ' ' +
          (y - 185 * s) +
          'Z',
        { g: 'l', w: 6 },
      ],
      [
        '#7a5232',
        RR(x - 30 * s, y - 110 * s, 60 * s, 110 * s, 4),
        { g: 'c', w: 5 },
      ],
      ['#bfe4f6', RR(x + 65 * s, y - 150 * s, 55 * s, 55 * s, 3), { w: 5 }],
      ['#bfe4f6', RR(x - 120 * s, y - 150 * s, 55 * s, 55 * s, 3), { w: 5 }],
    ];
  }

  return {
    E: E,
    RR: RR,
    poly: poly,
    T: T,
    mirror: mirror,
    tube: tube,
    person: person,
    lighten: lighten,
    darken: darken,
    mix: hexMix,
    C: {
      ink: '#4A3B55',
      red: '#D2444F',
      orange: '#F0913F',
      yellow: '#E7C263',
      mint: '#5FBF95',
      green: '#3E8F6B',
      sky: '#7FB4DA',
      blue: '#4A6FA5',
      violet: '#A48FDB',
      pink: '#E88CAA',
      brown: '#8B5E3C',
      paper: '#FFFDF8',
    },
    sky: sky,
    ground: ground,
    sun: sun,
    cloud: cloud,
    tree: tree,
    pine: pine,
    flower: flower,
    mountain: mountain,
    rock: rock,
    house: house,
  };
});
