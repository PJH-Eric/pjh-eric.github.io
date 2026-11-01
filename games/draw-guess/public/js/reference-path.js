/* Tiny SVG path toolkit for the drawing references: parses a path string (M L H V C S Q T A Z in
 * absolute or relative form, plus two helpers E = ellipse and R = rounded rectangle), returns a
 * normalised path made only of M/L/C/Q/Z and a flattened point list for geometry checks. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ReferencePath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var K = 0.5522847498;
  var ARGS = {
    M: 2,
    L: 2,
    H: 1,
    V: 1,
    C: 6,
    S: 4,
    Q: 4,
    T: 2,
    A: 7,
    Z: 0,
    E: 5,
    R: 5,
  };

  function rotPt(cx, cy, x, y, c, s) {
    return [cx + x * c - y * s, cy + x * s + y * c];
  }

  function ellipseSegs(cx, cy, rx, ry, rot) {
    var a = ((rot || 0) * Math.PI) / 180;
    var c = Math.cos(a),
      s = Math.sin(a);
    var P = function (x, y) {
      return rotPt(cx, cy, x, y, c, s);
    };
    var pts = [
      P(rx, 0),
      P(rx, K * ry),
      P(K * rx, ry),
      P(0, ry),
      P(-K * rx, ry),
      P(-rx, K * ry),
      P(-rx, 0),
      P(-rx, -K * ry),
      P(-K * rx, -ry),
      P(0, -ry),
      P(K * rx, -ry),
      P(rx, -K * ry),
      P(rx, 0),
    ];
    var out = [['M', pts[0][0], pts[0][1]]];
    for (var i = 0; i < 4; i++) {
      var q = pts.slice(1 + i * 3, 4 + i * 3);
      out.push(['C', q[0][0], q[0][1], q[1][0], q[1][1], q[2][0], q[2][1]]);
    }
    out.push(['Z']);
    return out;
  }

  function roundRectSegs(x, y, w, h, r) {
    r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
    if (!r)
      return [
        ['M', x, y],
        ['L', x + w, y],
        ['L', x + w, y + h],
        ['L', x, y + h],
        ['Z'],
      ];
    var k = r * (1 - K);
    return [
      ['M', x + r, y],
      ['L', x + w - r, y],
      ['C', x + w - k, y, x + w, y + k, x + w, y + r],
      ['L', x + w, y + h - r],
      ['C', x + w, y + h - k, x + w - k, y + h, x + w - r, y + h],
      ['L', x + r, y + h],
      ['C', x + k, y + h, x, y + h - k, x, y + h - r],
      ['L', x, y + r],
      ['C', x, y + k, x + k, y, x + r, y],
      ['Z'],
    ];
  }

  // SVG endpoint-parameterised arc -> cubic Béziers.
  function arcSegs(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
    if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2))
      return [['L', x2, y2]];
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    var p = (phi * Math.PI) / 180,
      c = Math.cos(p),
      s = Math.sin(p);
    var dx = (x1 - x2) / 2,
      dy = (y1 - y2) / 2;
    var xp = c * dx + s * dy,
      yp = -s * dx + c * dy;
    var lam = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
    if (lam > 1) {
      var sq = Math.sqrt(lam);
      rx *= sq;
      ry *= sq;
    }
    var num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
    var den = rx * rx * yp * yp + ry * ry * xp * xp;
    var co = Math.sqrt(Math.max(0, num / den)) * (fa === fs ? -1 : 1);
    var cxp = (co * rx * yp) / ry,
      cyp = (-co * ry * xp) / rx;
    var cx = c * cxp - s * cyp + (x1 + x2) / 2,
      cy = s * cxp + c * cyp + (y1 + y2) / 2;
    var ang = function (ux, uy, vx, vy) {
      var a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
      return a;
    };
    var t1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
    var dt = ang(
      (xp - cxp) / rx,
      (yp - cyp) / ry,
      (-xp - cxp) / rx,
      (-yp - cyp) / ry,
    );
    if (!fs && dt > 0) dt -= 2 * Math.PI;
    if (fs && dt < 0) dt += 2 * Math.PI;
    var n = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-9));
    var d = dt / n,
      out = [];
    var kk = (4 / 3) * Math.tan(d / 4);
    for (var i = 0; i < n; i++) {
      var a1 = t1 + i * d,
        a2 = a1 + d;
      var ex = function (a) {
        return [Math.cos(a), Math.sin(a)];
      };
      var e1 = ex(a1),
        e2 = ex(a2);
      var pt = function (u, v) {
        return [cx + rx * u * c - ry * v * s, cy + rx * u * s + ry * v * c];
      };
      var q1 = pt(e1[0] - kk * e1[1], e1[1] + kk * e1[0]);
      var q2 = pt(e2[0] + kk * e2[1], e2[1] - kk * e2[0]);
      var q3 = pt(e2[0], e2[1]);
      out.push(['C', q1[0], q1[1], q2[0], q2[1], q3[0], q3[1]]);
    }
    return out;
  }

  function segments(d) {
    var tokens = String(d).match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)/g) || [];
    var out = [],
      i = 0,
      cmd = '',
      x = 0,
      y = 0,
      sx = 0,
      sy = 0,
      lc = null,
      lq = null;
    var num = function () {
      var v = Number(tokens[i++]);
      if (!Number.isFinite(v)) throw new Error('bad path number in: ' + d);
      return v;
    };
    while (i < tokens.length) {
      if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
      else if (cmd === 'M') cmd = 'L';
      else if (cmd === 'm') cmd = 'l';
      var up = cmd.toUpperCase(),
        rel = cmd !== up;
      if (!(up in ARGS)) throw new Error('unsupported path command ' + cmd);
      var a = [];
      var need = up === 'E' || up === 'R' ? 4 : ARGS[up];
      for (var k = 0; k < need; k++) a.push(num());
      // E and R take an optional fifth number (rotation / corner radius), default 0.
      if (up === 'E' || up === 'R')
        a.push(i < tokens.length && !/[a-zA-Z]/.test(tokens[i]) ? num() : 0);
      var ox = rel ? x : 0,
        oy = rel ? y : 0;
      var prevC = lc,
        prevQ = lq;
      lc = lq = null;
      if (up === 'M') {
        x = a[0] + ox;
        y = a[1] + oy;
        sx = x;
        sy = y;
        out.push(['M', x, y]);
      } else if (up === 'L') {
        x = a[0] + ox;
        y = a[1] + oy;
        out.push(['L', x, y]);
      } else if (up === 'H') {
        x = a[0] + ox;
        out.push(['L', x, y]);
      } else if (up === 'V') {
        y = a[0] + oy;
        out.push(['L', x, y]);
      } else if (up === 'C') {
        out.push([
          'C',
          a[0] + ox,
          a[1] + oy,
          a[2] + ox,
          a[3] + oy,
          a[4] + ox,
          a[5] + oy,
        ]);
        lc = [a[2] + ox, a[3] + oy];
        x = a[4] + ox;
        y = a[5] + oy;
      } else if (up === 'S') {
        var r1 = prevC ? [2 * x - prevC[0], 2 * y - prevC[1]] : [x, y];
        out.push([
          'C',
          r1[0],
          r1[1],
          a[0] + ox,
          a[1] + oy,
          a[2] + ox,
          a[3] + oy,
        ]);
        lc = [a[0] + ox, a[1] + oy];
        x = a[2] + ox;
        y = a[3] + oy;
      } else if (up === 'Q') {
        out.push(['Q', a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy]);
        lq = [a[0] + ox, a[1] + oy];
        x = a[2] + ox;
        y = a[3] + oy;
      } else if (up === 'T') {
        var r2 = prevQ ? [2 * x - prevQ[0], 2 * y - prevQ[1]] : [x, y];
        out.push(['Q', r2[0], r2[1], a[0] + ox, a[1] + oy]);
        lq = r2;
        x = a[0] + ox;
        y = a[1] + oy;
      } else if (up === 'A') {
        var ex = a[5] + ox,
          ey = a[6] + oy;
        arcSegs(
          x,
          y,
          a[0],
          a[1],
          a[2],
          a[3] ? 1 : 0,
          a[4] ? 1 : 0,
          ex,
          ey,
        ).forEach(function (s) {
          out.push(s);
        });
        x = ex;
        y = ey;
      } else if (up === 'Z') {
        out.push(['Z']);
        x = sx;
        y = sy;
      } else if (up === 'E') {
        ellipseSegs(a[0] + ox, a[1] + oy, a[2], a[3], a[4]).forEach(
          function (s) {
            out.push(s);
          },
        );
        x = a[0] + ox + a[2];
        y = a[1] + oy;
        sx = x;
        sy = y;
      } else if (up === 'R') {
        roundRectSegs(a[0] + ox, a[1] + oy, a[2], a[3], a[4]).forEach(
          function (s) {
            out.push(s);
          },
        );
        x = a[0] + ox;
        y = a[1] + oy;
        sx = x;
        sy = y;
      }
      if (up === 'Z') {
        cmd = '';
      }
    }
    return out;
  }

  var r1 = function (n) {
    return Math.round(n * 10) / 10;
  };

  function toD(segs) {
    return segs
      .map(function (s) {
        return s[0] + s.slice(1).map(r1).join(' ');
      })
      .join('');
  }

  function flatten(segs) {
    var pts = [],
      x = 0,
      y = 0,
      sx = 0,
      sy = 0;
    var push = function (px, py) {
      pts.push(Math.round(px), Math.round(py));
    };
    segs.forEach(function (s) {
      var t, u;
      if (s[0] === 'M') {
        x = s[1];
        y = s[2];
        sx = x;
        sy = y;
        push(x, y);
      } else if (s[0] === 'L') {
        x = s[1];
        y = s[2];
        push(x, y);
      } else if (s[0] === 'C') {
        for (t = 1; t <= 8; t++) {
          u = t / 8;
          var m = 1 - u;
          push(
            m * m * m * x +
              3 * m * m * u * s[1] +
              3 * m * u * u * s[3] +
              u * u * u * s[5],
            m * m * m * y +
              3 * m * m * u * s[2] +
              3 * m * u * u * s[4] +
              u * u * u * s[6],
          );
        }
        x = s[5];
        y = s[6];
      } else if (s[0] === 'Q') {
        for (t = 1; t <= 6; t++) {
          u = t / 6;
          var n = 1 - u;
          push(
            n * n * x + 2 * n * u * s[1] + u * u * s[3],
            n * n * y + 2 * n * u * s[2] + u * u * s[4],
          );
        }
        x = s[3];
        y = s[4];
      } else if (s[0] === 'Z') {
        x = sx;
        y = sy;
        push(x, y);
      }
    });
    return pts;
  }

  function parse(d) {
    var segs = segments(d);
    return {
      d: toD(segs),
      p: flatten(segs),
      closed: segs.some(function (s) {
        return s[0] === 'Z';
      }),
    };
  }

  // Apply an affine map (x,y) -> (a*x+c*y+e, b*x+d*y+f) to a path string.
  function transform(d, m) {
    var segs = segments(d).map(function (seg) {
      var out = [seg[0]];
      for (var i = 1; i < seg.length; i += 2) {
        out.push(
          m[0] * seg[i] + m[2] * seg[i + 1] + m[4],
          m[1] * seg[i] + m[3] * seg[i + 1] + m[5],
        );
      }
      return out;
    });
    return toD(segs);
  }

  return { parse: parse, transform: transform };
});
