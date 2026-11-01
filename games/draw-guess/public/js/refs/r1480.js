(function (root) {
  'use strict';
  var R = root.ReferenceRecipes || require('../reference-recipes.js');
  var K = root.ReferenceKit || require('../reference-kit.js');
  var C = K.C,
    I = C.ink;
  var rd = function (n) {
    return Math.round(n * 10) / 10;
  };
  function L(f, d, o) {
    return [[f, d, o || {}]];
  }
  function ln(d, s, w) {
    return [['none', d, { s: s || I, w: w || 7 }]];
  }
  function E(cx, cy, rx, ry, rot) {
    return 'E' + [cx, cy, rx, ry, rot || 0].map(rd).join(' ');
  }
  function RR(x, y, w, h, r) {
    return 'R' + [x, y, w, h, r || 0].map(rd).join(' ');
  }
  function poly(p) {
    return K.poly(p, true);
  }
  function sky() {
    return L(C.sky, 'M-40 -40H1040V1040H-40Z', { s: 'none' });
  }
  function ground(y, col) {
    return L(col || C.mint, 'M-40 ' + y + 'H1040V1040H-40Z', {
      s: 'none',
    }).concat(ln('M-40 ' + y + 'H1040'));
  }
  function heart(cx, cy, s) {
    return (
      'M' +
      cx +
      ' ' +
      rd(cy + s * 0.9) +
      'C' +
      rd(cx - 1.5 * s) +
      ' ' +
      rd(cy + 0.1 * s) +
      ' ' +
      rd(cx - 0.9 * s) +
      ' ' +
      rd(cy - 0.9 * s) +
      ' ' +
      cx +
      ' ' +
      rd(cy - 0.3 * s) +
      'C' +
      rd(cx + 0.9 * s) +
      ' ' +
      rd(cy - 0.9 * s) +
      ' ' +
      rd(cx + 1.5 * s) +
      ' ' +
      rd(cy + 0.1 * s) +
      ' ' +
      cx +
      ' ' +
      rd(cy + 0.9 * s) +
      'Z'
    );
  }
  function star(cx, cy, r) {
    var p = [],
      i,
      a,
      rr;
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + (i * Math.PI) / 5;
      rr = i % 2 ? r * 0.45 : r;
      p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    return poly(p);
  }
  function man(x, yf, h, o) {
    o = o || {};
    var u = h / 300,
      sh = o.shirt || C.blue,
      pa = o.pants || C.brown,
      sk = o.skin || C.yellow,
      hr = o.hair || C.brown;
    var aL = o.aL || [-25, 95],
      aR = o.aR || [25, 95];
    var sy = yf - 200 * u,
      out = [];
    out = out.concat(
      K.tube(
        [
          [x - 17 * u, yf - 110 * u],
          [x - 19 * u, yf - 14 * u],
        ],
        30 * u,
        pa,
      ),
    );
    out = out.concat(
      K.tube(
        [
          [x + 17 * u, yf - 110 * u],
          [x + 19 * u, yf - 14 * u],
        ],
        30 * u,
        pa,
      ),
    );
    out = out.concat(
      L(I, E(x - 22 * u, yf - 6 * u, 26 * u, 12 * u), { s: 'none' }),
      L(I, E(x + 22 * u, yf - 6 * u, 26 * u, 12 * u), { s: 'none' }),
    );
    out = out.concat(
      L(sh, RR(x - 36 * u, yf - 220 * u, 72 * u, 125 * u, 22 * u)),
    );
    out = out.concat(
      K.tube(
        [
          [x - 33 * u, sy],
          [x - 33 * u + aL[0] * u, sy + aL[1] * u],
        ],
        26 * u,
        sh,
      ),
    );
    out = out.concat(
      K.tube(
        [
          [x + 33 * u, sy],
          [x + 33 * u + aR[0] * u, sy + aR[1] * u],
        ],
        26 * u,
        sh,
      ),
    );
    out = out.concat(
      L(sk, E(x - 33 * u + aL[0] * u, sy + aL[1] * u + 8 * u, 15 * u, 15 * u)),
      L(sk, E(x + 33 * u + aR[0] * u, sy + aR[1] * u + 8 * u, 15 * u, 15 * u)),
    );
    out = out.concat(L(sk, E(x, yf - 255 * u, 31 * u, 35 * u)));
    out = out.concat(
      L(
        hr,
        'M' +
          rd(x - 31 * u) +
          ' ' +
          rd(yf - 258 * u) +
          'C' +
          rd(x - 38 * u) +
          ' ' +
          rd(yf - 310 * u) +
          ' ' +
          rd(x + 38 * u) +
          ' ' +
          rd(yf - 310 * u) +
          ' ' +
          rd(x + 31 * u) +
          ' ' +
          rd(yf - 258 * u) +
          'Q' +
          x +
          ' ' +
          rd(yf - 280 * u) +
          ' ' +
          rd(x - 31 * u) +
          ' ' +
          rd(yf - 258 * u) +
          'Z',
      ),
    );
    out = out.concat(
      L(I, E(x - 11 * u, yf - 252 * u, 4 * u, 5 * u), { s: 'none' }),
      L(I, E(x + 11 * u, yf - 252 * u, 4 * u, 5 * u), { s: 'none' }),
    );
    out = out.concat(
      ln(
        'M' +
          rd(x - 9 * u) +
          ' ' +
          rd(yf - 238 * u) +
          'Q' +
          x +
          ' ' +
          rd(yf - 228 * u) +
          ' ' +
          rd(x + 9 * u) +
          ' ' +
          rd(yf - 238 * u),
        I,
        7,
      ),
    );
    return out;
  }
  function laptop(x, y, w, h, screen) {
    return [].concat(
      L(
        C.violet,
        poly([
          [x - 40, y + h + 8],
          [x + w + 40, y + h + 8],
          [x + w + 70, y + h + 50],
          [x - 70, y + h + 50],
        ]),
      ),
      L(C.blue, RR(x, y, w, h, 18)),
      L(screen || C.paper, RR(x + 22, y + 22, w - 44, h - 44, 6)),
    );
  }
  function wifi(cx, cy, s, col) {
    return [].concat(
      ln(
        'M' +
          rd(cx - 3 * s) +
          ' ' +
          rd(cy - 3 * s) +
          'Q' +
          cx +
          ' ' +
          rd(cy - 4.5 * s) +
          ' ' +
          rd(cx + 3 * s) +
          ' ' +
          rd(cy - 3 * s),
        col || I,
        16,
      ),
      ln(
        'M' +
          rd(cx - 5.5 * s) +
          ' ' +
          rd(cy - 1.5 * s) +
          'Q' +
          cx +
          ' ' +
          rd(cy - 8.5 * s) +
          ' ' +
          rd(cx + 5.5 * s) +
          ' ' +
          rd(cy - 1.5 * s),
        col || I,
        16,
      ),
      L(col || I, E(cx, cy + s * 0.6, s * 0.8, s * 0.8), { s: 'none' }),
    );
  }

  var o = {};

  o['w-trend-12'] = [].concat(
    L(C.blue, RR(370, 150, 280, 580, 46)),
    L(C.paper, RR(395, 205, 230, 470, 12)),
    L(C.sky, RR(412, 235, 196, 150, 8)),
    L(C.yellow, E(560, 280, 24, 24)),
    L(C.mint, 'M412 385L480 300L535 365L565 330L608 385Z', { s: 'none' }),
    L(C.red, heart(460, 450, 36)),
    ln('M525 440H595M525 470H570', I, 16),
    ln('M415 535H605M415 575H570M415 615H590', I, 16),
    L(C.pink, RR(690, 170, 230, 140, 40)),
    L(
      C.pink,
      poly([
        [720, 300],
        [700, 360],
        [770, 308],
      ]),
    ),
    L(C.paper, heart(805, 235, 34)),
    L(C.yellow, RR(80, 480, 230, 130, 40)),
    L(
      C.yellow,
      poly([
        [260, 600],
        [300, 665],
        [220, 608],
      ]),
    ),
    ln('M130 545H150M185 545H205M240 545H260', I, 16),
    L(C.red, heart(790, 520, 28)),
    L(C.orange, star(160, 280, 50)),
  );

  o['w-trend-13'] = [].concat(
    sky(),
    ground(780),
    ln('M300 560L220 780M300 560L380 780M300 560V400', I, 16),
    L(C.yellow, E(300, 390, 150, 150), { s: I, w: 16 }),
    L(C.paper, E(300, 390, 105, 105), { s: I }),
    L(C.sky, E(300, 390, 105, 105), { s: 'none' }),
    L(C.blue, RR(268, 335, 64, 110, 10)),
    L(C.paper, E(300, 350, 6, 6), { s: 'none' }),
    man(690, 790, 520, {
      shirt: C.pink,
      pants: C.blue,
      aL: [-30, 60],
      aR: [45, -70],
    }),
    L(C.red, heart(480, 250, 28)),
    L(C.red, heart(560, 160, 20)),
    L(C.red, heart(820, 230, 26)),
    L(C.orange, star(520, 620, 36)),
  );

  o['w-trend-14'] = [].concat(
    L(C.pink, 'M-40 -40H1040V700H-40Z', { s: 'none' }),
    L(C.sky, RR(620, 120, 240, 220, 10)),
    ln('M740 120V340M620 230H860', I, 12),
    L(C.mint, 'M-40 700H1040V1040H-40Z', { s: 'none' }),
    ln('M-40 700H1040'),
    L(C.blue, RR(130, 520, 110, 200, 14)),
    man(300, 720, 340, { shirt: C.orange, aL: [30, 40], aR: [70, 30] }),
    L(C.brown, RR(120, 600, 740, 50, 10)),
    L(C.brown, RR(160, 650, 40, 190, 6)),
    L(C.brown, RR(790, 650, 40, 190, 6)),
    laptop(470, 440, 240, 130, C.sky),
    L(C.yellow, RR(770, 550, 55, 50, 10)),
    L(C.red, RR(80, 150, 160, 130, 8)),
    L(C.yellow, E(160, 215, 30, 30), { s: 'none' }),
  );

  o['w-trend-15'] = [].concat(
    laptop(180, 190, 640, 420, C.sky),
    L(C.yellow, E(330, 330, 38, 42)),
    L(C.orange, 'M255 460C255 400 405 400 405 460V470H255Z'),
    L(C.pink, E(500, 330, 38, 42)),
    L(C.red, 'M425 460C425 400 575 400 575 460V470H425Z'),
    L(C.yellow, E(670, 330, 38, 42)),
    L(C.green, 'M595 460C595 400 745 400 745 460V470H595Z'),
    L(C.pink, E(420, 520, 30, 32), { s: I }),
    L(C.paper, E(420, 520, 30, 32)),
    L(C.mint, RR(250, 520, 0, 0, 0), { s: 'none' }),
    ln('M300 560H700', I, 7),
  );
  // simplify: replace the odd extra layers by a cleaner version
  o['w-trend-15'] = [].concat(
    laptop(180, 190, 640, 420, C.sky),
    L(C.paper, RR(215, 225, 270, 160, 8)),
    L(C.paper, RR(515, 225, 270, 160, 8)),
    L(C.paper, RR(215, 405, 270, 150, 8)),
    L(C.paper, RR(515, 405, 270, 150, 8)),
    L(C.yellow, E(350, 300, 30, 34)),
    L(C.orange, 'M290 385C290 335 410 335 410 385Z'),
    L(C.pink, E(650, 300, 30, 34)),
    L(C.green, 'M590 385C590 335 710 335 710 385Z'),
    L(C.orange, E(350, 475, 30, 34)),
    L(C.red, 'M290 555C290 505 410 505 410 555Z'),
    L(C.yellow, E(650, 475, 30, 34)),
    L(C.violet, 'M590 555C590 505 710 505 710 555Z'),
    L(I, E(500, 650, 8, 8), { s: 'none' }),
  );

  o['w-trend-16'] = [].concat(
    laptop(160, 250, 600, 400, C.paper),
    L(C.mint, RR(200, 290, 520, 250, 8)),
    ln('M240 340H460M240 390H400M240 440H430', I, 16),
    L(C.red, E(590, 410, 70, 70)),
    L(
      C.paper,
      poly([
        [570, 375],
        [570, 445],
        [625, 410],
      ]),
    ),
    L(C.orange, E(250, 580, 0, 0), { s: 'none' }),
    L(
      I,
      poly([
        [640, 160],
        [830, 100],
        [1010, 160],
        [830, 215],
      ]),
    ),
    L(I, 'M720 190V260C720 300 940 300 940 260V190L830 215Z'),
    ln('M1000 165V270', C.yellow, 12),
    L(C.yellow, E(1000, 280, 14, 14)),
    L(C.red, RR(640, 700, 220, 60, 8)),
    L(C.sky, RR(660, 640, 200, 60, 8)),
  );

  o['w-trend-17'] = [].concat(
    L(
      C.violet,
      poly([
        [400, 100],
        [600, 100],
        [620, 400],
        [380, 400],
      ]),
    ),
    L(
      C.violet,
      poly([
        [380, 600],
        [620, 600],
        [600, 900],
        [400, 900],
      ]),
    ),
    ln('M500 150V250M500 750V850', I, 7),
    L(C.blue, RR(630, 450, 40, 100, 14)),
    L(C.blue, RR(320, 330, 360, 340, 90)),
    L(I, RR(355, 365, 290, 270, 62), { s: 'none' }),
    L(C.paper, RR(365, 375, 270, 250, 54)),
    L(C.red, heart(440, 470, 40)),
    ln('M510 460H590', I, 16),
    ln('M385 560L440 560L465 520L495 600L520 560L615 560', C.green, 16),
  );

  var rotor = function (cx, cy) {
    return [].concat(
      L(C.sky, E(cx, cy, 110, 38)),
      ln('M' + (cx - 100) + ' ' + cy + 'H' + (cx + 100), I, 7),
      L(C.violet, E(cx, cy + 42, 16, 10)),
    );
  };
  o['w-trend-18'] = [].concat(
    sky(),
    K.tube(
      [
        [260, 380],
        [740, 640],
      ],
      26,
      C.ink,
    ),
    K.tube(
      [
        [740, 380],
        [260, 640],
      ],
      26,
      C.ink,
    ),
    L(C.violet, E(260, 380, 28, 18)),
    L(C.violet, E(740, 380, 28, 18)),
    L(C.violet, E(260, 640, 28, 18)),
    L(C.violet, E(740, 640, 28, 18)),
    L(C.paper, RR(0, 0, 0, 0, 0), { s: 'none' }),
    L(C.blue, E(500, 510, 130, 90)),
    L(C.sky, E(500, 480, 70, 40), { s: 'none' }),
    L(I, E(500, 610, 38, 38)),
    L(C.sky, E(500, 610, 20, 20), { s: 'none' }),
    rotor(260, 320),
    rotor(740, 320),
    rotor(260, 580),
    rotor(740, 580),
  );
  o['w-trend-18'] = [].concat(
    sky(),
    K.tube(
      [
        [270, 340],
        [730, 560],
      ],
      26,
      C.blue,
    ),
    K.tube(
      [
        [730, 340],
        [270, 560],
      ],
      26,
      C.blue,
    ),
    L(C.violet, E(270, 330, 26, 16)),
    L(C.violet, E(730, 330, 26, 16)),
    L(C.violet, E(270, 570, 26, 16)),
    L(C.violet, E(730, 570, 26, 16)),
    L(C.blue, E(500, 450, 120, 85)),
    L(C.sky, E(500, 430, 62, 34), { s: 'none' }),
    L(I, E(500, 540, 36, 36)),
    L(C.paper, E(500, 540, 14, 14), { s: 'none' }),
    rotor(270, 280),
    rotor(730, 280),
    rotor(270, 520),
    rotor(730, 520),
  );

  o['w-trend-19'] = [].concat(
    L(C.violet, 'M350 400V700C350 760 650 760 650 700V400Z'),
    L(C.violet, E(500, 400, 150, 45)),
    L(C.sky, E(500, 400, 105, 27), { s: 'none' }),
    L(C.paper, E(500, 400, 70, 15), { s: 'none' }),
    ln('M370 540Q500 590 630 540M365 620Q500 670 635 620', I, 7),
    ln('M230 420Q190 520 230 620M160 380Q100 520 160 660', C.blue, 16),
    ln('M770 420Q810 520 770 620M840 380Q900 520 840 660', C.blue, 16),
    L(C.mint, RR(0, 0, 0, 0, 0), { s: 'none' }),
    L(C.red, E(500, 700, 22, 8), { s: 'none' }),
  );

  o['w-trend-20'] = K.T(
    [].concat(
      L(C.blue, RR(300, 130, 400, 680, 50)),
      L(C.paper, RR(335, 175, 330, 540, 10)),
      ln(
        'M375 240H625M375 295H625M375 350H590M375 405H625M375 460H560M375 515H625M375 570H600',
        I,
        16,
      ),
      L(C.orange, E(500, 760, 24, 24), { s: I }),
      L(C.red, 'M590 175H640V250L615 232L590 250Z'),
      L(C.sky, RR(375, 620, 100, 60, 4)),
      L(C.mint, E(570, 650, 30, 30), { s: 'none' }),
    ),
    { rot: 8, cx: 500, cy: 470 },
  );

  var sunPanel = [].concat(
    ground(790),
    ln('M500 640V800M390 800H610', I, 34),
    L(
      C.blue,
      poly([
        [250, 640],
        [750, 640],
        [850, 360],
        [350, 360],
      ]),
    ),
    ln('M350 640L450 360M500 640L600 360M650 640L750 360', C.paper, 7),
    ln('M300 500H800', C.paper, 7),
  );
  o['w-trend-21'] = [].concat(
    sky(),
    L(C.yellow, E(200, 200, 90, 90)),
    ln(
      'M95 200H20M200 95V20M305 200H380M130 125L80 75M270 125L320 75',
      C.orange,
      16,
    ),
    sunPanel,
  );

  function blade(hx, hy, rot, len) {
    return K.T(
      L(
        C.paper,
        poly([
          [hx - 16, hy],
          [hx - 4, hy - len],
          [hx + 8, hy - len + 20],
          [hx + 18, hy],
        ]),
      ),
      { rot: rot, cx: hx, cy: hy },
    );
  }
  function turbine(x, base, h, len) {
    var hy = base - h;
    return [].concat(
      L(
        C.paper,
        poly([
          [x - 22, base],
          [x - 9, hy],
          [x + 9, hy],
          [x + 22, base],
        ]),
      ),
      blade(x, hy, 0, len),
      blade(x, hy, 120, len),
      blade(x, hy, 240, len),
      L(C.paper, E(x, hy, 26, 26)),
    );
  }
  o['w-trend-22'] = [].concat(
    sky(),
    L(
      C.mint,
      'M-40 760C100 640 300 640 420 740C520 660 760 640 1040 740V1040H-40Z',
    ),
    L(C.green, 'M-40 880C200 800 500 840 1040 820V1040H-40Z', { s: I }),
    turbine(300, 720, 330, 210),
    turbine(700, 720, 420, 250),
    L(C.yellow, E(880, 150, 50, 50)),
  );

  o['w-trend-23'] = [].concat(
    L(C.sky, E(350, 420, 36, 0), { s: 'none' }),
    L(C.sky, 'M330 300H370V250H390V210H330V250H310V300ZM300 300H400V520H300Z'),
    L(C.violet, RR(560, 340, 120, 180, 16)),
    L(C.red, RR(560, 310, 120, 40, 8)),
    L(
      C.green,
      poly([
        [240, 520],
        [760, 520],
        [710, 860],
        [290, 860],
      ]),
    ),
    L(C.green, RR(220, 470, 560, 60, 14)),
    L(
      C.paper,
      poly([
        [430, 640],
        [500, 520 + 40],
        [570, 640],
      ]),
      { s: 'none' },
    ),
    ln('M500 585L450 665M500 585L550 665M455 690H545', C.paper, 16),
    ln('M430 665L460 690L440 705M570 665L545 690L565 705', C.paper, 16),
    L(
      C.mint,
      poly([
        [500, 575],
        [440, 690],
        [560, 690],
      ]),
      { s: C.paper, w: 16 },
    ),
  );
  // cleaner recycling bin
  function arrowTri(cx, cy, s) {
    var p = [
        [cx, cy - s],
        [cx + s * 0.9, cy + s * 0.6],
        [cx - s * 0.9, cy + s * 0.6],
      ],
      out = [],
      i,
      a,
      b;
    for (i = 0; i < 3; i++) {
      a = p[i];
      b = p[(i + 1) % 3];
      var ax = a[0] + (b[0] - a[0]) * 0.12,
        ay = a[1] + (b[1] - a[1]) * 0.12,
        bx = a[0] + (b[0] - a[0]) * 0.72,
        by = a[1] + (b[1] - a[1]) * 0.72;
      var dx = b[0] - a[0],
        dy = b[1] - a[1],
        l = Math.sqrt(dx * dx + dy * dy),
        nx = -dy / l,
        ny = dx / l,
        ux = dx / l,
        uy = dy / l;
      out = out.concat(
        ln(
          'M' + rd(ax) + ' ' + rd(ay) + 'L' + rd(bx) + ' ' + rd(by),
          C.paper,
          20,
        ),
        L(
          C.paper,
          poly([
            [bx + ux * 55, by + uy * 55],
            [bx + nx * 28, by + ny * 28],
            [bx - nx * 28, by - ny * 28],
          ]),
          { s: 'none' },
        ),
      );
    }
    return out;
  }
  o['w-trend-23'] = [].concat(
    ground(850),
    L(C.sky, 'M280 330H340V250H370V210H310V250H280ZM265 330H385V560H265Z'),
    L(C.violet, RR(570, 340, 120, 230, 18)),
    L(C.red, RR(560, 310, 140, 44, 10)),
    L(
      C.green,
      poly([
        [230, 520],
        [770, 520],
        [720, 850],
        [280, 850],
      ]),
    ),
    L(C.green, RR(200, 470, 600, 60, 14)),
    arrowTri(500, 690, 90),
  );

  o['w-trend-24'] = [].concat(
    ground(840),
    L(
      C.mint,
      poly([
        [340, 330],
        [660, 330],
        [620, 830],
        [380, 830],
      ]),
    ),
    L(
      C.orange,
      poly([
        [350, 450],
        [650, 450],
        [638, 650],
        [362, 650],
      ]),
      { s: I },
    ),
    L(
      C.paper,
      'M500 600C440 600 420 530 440 480C500 520 540 540 560 560C550 590 530 600 500 600Z',
      { s: C.green, w: 7 },
    ),
    L(C.brown, RR(310, 270, 380, 70, 22)),
    L(C.brown, RR(380, 235, 240, 40, 12)),
    L(C.red, RR(560, 285, 70, 24, 10)),
    ln('M520 235L560 110', C.green, 16),
  );

  o['w-trend-25'] = [].concat(
    ground(800, C.sky),
    L(C.paper, RR(180, 400, 640, 230, 46)),
    L(C.sky, E(320, 515, 66, 66), { s: I }),
    L(C.blue, E(320, 515, 28, 28)),
    L(C.sky, RR(480, 460, 280, 110, 14), { s: I }),
    L(C.paper, RR(500, 475, 240, 80, 6)),
    ln('M560 470V560', C.red, 16),
    ln('M670 470V560', C.red, 16),
    ln('M200 700L430 740', C.violet, 34),
    L(C.paper, E(160, 690, 40, 34), { s: I }),
    L(C.paper, E(540, 760, 0, 0), { s: 'none' }),
    L(C.red, E(300, 700, 0, 0), { s: 'none' }),
    L(C.yellow, RR(560, 690, 190, 80, 16)),
    ln('M590 715H720M590 745H680', I, 7),
  );
  o['w-trend-25'] = [].concat(
    L(C.sky, 'M-40 800H1040V1040H-40Z', { s: 'none' }),
    ln('M-40 800H1040'),
    L(C.paper, RR(160, 330, 680, 250, 50)),
    L(C.sky, E(320, 455, 66, 66)),
    L(C.blue, E(320, 455, 28, 28)),
    L(C.violet, RR(480, 400, 290, 110, 14)),
    L(C.paper, RR(500, 415, 250, 80, 6)),
    ln('M560 410V500', C.red, 16),
    ln('M660 410V500', C.red, 16),
    ln('M180 790L520 710', C.violet, 34),
    L(C.paper, E(560, 700, 55, 38, -12)),
    L(C.yellow, RR(620, 620, 0, 0, 0), { s: 'none' }),
  );

  o['w-trend-26'] = [].concat(
    ground(860, C.paper),
    K.tube(
      [
        [250, 700],
        [650, 300],
      ],
      90,
      C.sky,
    ),
    L(
      I,
      poly([
        [180, 790],
        [260, 710],
      ]),
      { s: I },
    ),
    ln('M180 790L238 732', I, 7),
    L(
      C.blue,
      poly([
        [425, 575],
        [540, 460],
        [575, 495],
        [460, 610],
      ]),
      { s: 'none' },
    ),
    ln('M200 800L250 750', I, 16),
    ln('M690 260L720 230', I, 34),
    ln('M720 230L780 170', I, 7),
    ln('M770 160L840 230M790 140L860 210', I, 34),
    L(C.red, RR(790, 620, 120, 70, 10)),
    L(C.paper, RR(800, 560, 100, 70, 10)),
    L(C.paper, RR(0, 0, 0, 0), { s: 'none' }),
  );
  // cleaner syringe + vial
  function syringe() {
    return K.T(
      [].concat(
        ln('M130 500H220', I, 7),
        L(C.paper, RR(220, 440, 380, 120, 20)),
        L(C.blue, RR(260, 460, 300, 80, 6), { s: 'none' }),
        ln('M300 440V560M360 440V560M420 440V560M480 440V560', I, 7),
        ln('M180 500H230', C.ink, 34),
        L(C.paper, RR(80, 430, 20, 140, 6)),
        ln('M600 500H760', I, 16),
        ln('M600 500H690', C.paper, 7),
        L(C.paper, RR(570, 400, 40, 200, 12)),
        L(C.violet, RR(600, 470, 60, 60, 8)),
      ),
      { rot: -35, cx: 500, cy: 500 },
    );
  }
  o['w-trend-26'] = [].concat(
    ground(840, C.paper),
    L(C.violet, RR(660, 540, 200, 300, 40)),
    L(C.red, RR(690, 470, 140, 90, 18)),
    L(C.sky, RR(690, 560, 140, 150, 6)),
    ln('M705 610H815M705 650H790', I, 7),
    syringe(),
    L(C.sky, 'M340 330C340 330 300 390 340 410C380 390 380 330 340 330Z'),
  );

  o['w-trend-27'] = [].concat(
    ground(850),
    L(C.paper, E(250, 680, 135, 135), { s: 'none' }),
    ln('M250 545A135 135 0 1 0 250 815A135 135 0 1 0 250 545', I, 34),
    ln('M750 545A135 135 0 1 0 750 815A135 135 0 1 0 750 545', I, 34),
    ln('M250 545A135 135 0 1 0 250 815A135 135 0 1 0 250 545', C.orange, 16),
    ln('M750 545A135 135 0 1 0 750 815A135 135 0 1 0 750 545', C.orange, 16),
    K.tube(
      [
        [250, 680],
        [420, 450],
        [510, 680],
        [250, 680],
      ],
      18,
      C.orange,
    ),
    K.tube(
      [
        [420, 450],
        [690, 440],
        [510, 680],
      ],
      18,
      C.orange,
    ),
    K.tube(
      [
        [690, 440],
        [750, 680],
      ],
      18,
      C.orange,
    ),
    ln('M690 440L660 360L740 340', I, 16),
    L(C.ink, RR(350, 405, 140, 40, 18), { s: 'none' }),
    ln('M420 450V405', I, 16),
    L(C.mint, RR(730, 330, 170, 90, 12)),
    ln('M760 345V410M790 345V410M820 345V410M850 345V410M880 345V410', I, 7),
    L(C.mint, E(250, 680, 20, 20), { s: I }),
    L(C.mint, E(750, 680, 20, 20), { s: I }),
    L(C.mint, E(510, 680, 24, 24), { s: I }),
  );

  o['w-trend-28'] = [].concat(
    ground(840),
    L(C.green, RR(330, 740, 240, 80, 14)),
    L(
      C.yellow,
      poly([
        [440, 740],
        [560, 740],
        [545, 560],
        [455, 560],
      ]),
    ),
    L(
      C.yellow,
      'M350 200C320 330 380 460 455 520L545 520C620 460 680 330 650 200Z',
    ),
    L(C.orange, E(500, 200, 150, 36)),
    L(C.mint, E(500, 340, 70, 70)),
    ln('M430 340H570M500 270V410', I, 7),
    ln(
      'M345 230C250 230 260 400 380 430M655 230C750 230 740 400 620 430',
      C.yellow,
      16,
    ),
    L(C.paper, E(790, 760, 70, 70)),
    L(
      I,
      poly([
        [790, 730],
        [818, 750],
        [808, 782],
        [772, 782],
        [762, 750],
      ]),
      { s: 'none' },
    ),
    ln(
      'M790 730V692M818 750L850 738M808 782L826 810M772 782L754 810M762 750L730 738',
      I,
      7,
    ),
  );

  o['w-trend-29'] = [].concat(
    sky(),
    ground(860),
    L(C.yellow, E(300, 200, 0, 0), { s: 'none' }),
    L(
      C.brown,
      poly([
        [260, 500],
        [360, 500],
        [340, 850],
        [280, 850],
      ]),
    ),
    L(
      C.violet,
      poly([
        [210, 330],
        [410, 330],
        [370, 500],
        [250, 500],
      ]),
    ),
    L(C.red, 'M310 320C230 260 300 180 310 100C340 180 400 250 310 320Z'),
    L(C.yellow, 'M310 320C275 285 310 240 312 200C335 240 350 285 310 320Z', {
      s: 'none',
    }),
    L(C.yellow, E(700, 560, 130, 130)),
    L(C.orange, E(700, 560, 90, 90), { s: I }),
    L(C.yellow, star(700, 560, 55), { s: I }),
    L(
      C.red,
      poly([
        [610, 440],
        [680, 440],
        [700, 560],
        [640, 500],
      ]),
      { s: I },
    ),
    L(
      C.blue,
      poly([
        [790, 440],
        [720, 440],
        [700, 560],
        [760, 500],
      ]),
      { s: I },
    ),
  );
  // replace with cleaner medal + torch, ribbon above the medal
  o['w-trend-29'] = [].concat(
    sky(),
    ground(860),
    L(
      C.brown,
      poly([
        [250, 480],
        [350, 480],
        [330, 850],
        [270, 850],
      ]),
    ),
    L(
      C.violet,
      poly([
        [190, 320],
        [410, 320],
        [360, 480],
        [240, 480],
      ]),
    ),
    L(C.red, 'M300 315C200 250 290 170 300 80C340 170 410 240 300 315Z'),
    L(C.yellow, 'M300 315C260 280 300 235 302 195C335 235 345 280 300 315Z', {
      s: 'none',
    }),
    L(
      C.red,
      poly([
        [620, 150],
        [700, 150],
        [760, 360],
        [700, 360],
      ]),
    ),
    L(
      C.blue,
      poly([
        [900, 150],
        [820, 150],
        [760, 360],
        [820, 360],
      ]),
    ),
    L(C.yellow, E(760, 480, 125, 125)),
    L(C.orange, E(760, 480, 85, 85)),
    L(C.yellow, star(760, 480, 58), { s: I }),
  );

  o['w-trend-30'] = [].concat(
    L(C.blue, 'M-40 -40H1040V1040H-40Z', { s: 'none' }),
    ln('M-20 120H1020', I, 16),
    L(C.yellow, E(150, 190, 45, 45)),
    L(C.pink, E(380, 190, 45, 45)),
    L(C.sky, E(620, 190, 45, 45)),
    L(C.red, E(850, 190, 45, 45)),
    L(C.brown, RR(100, 720, 800, 60, 8)),
    L(I, RR(100, 780, 800, 70, 0)),
    man(500, 720, 420, {
      shirt: C.pink,
      pants: C.ink,
      aL: [-45, -50],
      aR: [50, -75],
    }),
    L(C.violet, E(120, 960, 62, 62)),
    L(C.pink, E(310, 975, 62, 62)),
    L(C.violet, E(690, 975, 62, 62)),
    L(C.sky, E(880, 960, 62, 62)),
    ln('M120 900V800M310 915V820M690 915V820M880 900V800', I, 16),
    L(C.yellow, RR(104, 740, 32, 100, 14)),
    L(C.mint, RR(294, 760, 32, 100, 14)),
    L(C.pink, RR(674, 760, 32, 100, 14)),
    L(C.yellow, RR(864, 740, 32, 100, 14)),
  );

  o['w-trend-31'] = [].concat(
    ground(860, C.paper),
    L(C.blue, RR(250, 270, 280, 520, 50)),
    L(C.paper, RR(285, 305, 210, 120, 14)),
    L(
      C.yellow,
      poly([
        [400, 315],
        [340, 380],
        [385, 380],
        [365, 420],
        [440, 345],
        [395, 345],
      ]),
    ),
    L(C.mint, E(320, 490, 18, 18)),
    L(C.mint, E(390, 490, 18, 18)),
    L(C.mint, E(460, 490, 18, 18)),
    L(C.paper, E(530, 490, 0, 0), { s: 'none' }),
    L(I, RR(340, 250, 100, 30, 8)),
    ln('M390 250V220C390 120 640 160 640 330', I, 34),
    ln('M390 250V220C390 120 640 160 640 330', C.orange, 16),
    L(C.violet, RR(570, 330, 150, 300, 30)),
    L(C.sky, RR(590, 360, 110, 220, 8)),
    L(C.mint, E(645, 420, 28, 28), { s: 'none' }),
    ln('M610 620H680', I, 7),
  );

  o['w-trend-32'] = [].concat(
    sky(),
    ground(850),
    L(C.blue, RR(250, 700, 0, 0, 0), { s: 'none' }),
    L(C.pink, 'M120 850C110 700 160 640 280 640C400 640 450 700 440 850Z'),
    L(C.yellow, E(280, 480, 110, 135)),
    L(
      C.brown,
      'M170 480C150 330 250 320 300 330C380 340 410 400 390 480C360 410 320 390 280 390C230 390 190 420 170 480Z',
    ),
    L(I, E(235, 490, 9, 12), { s: 'none' }),
    L(I, E(325, 490, 9, 12), { s: 'none' }),
    ln('M240 545Q280 585 320 545', I, 7),
    K.tube(
      [
        [380, 700],
        [450, 640],
        [500, 590],
      ],
      36,
      C.pink,
    ),
    L(C.yellow, E(510, 580, 28, 28)),
    K.tube(
      [
        [470, 640],
        [740, 260],
      ],
      18,
      C.violet,
    ),
    L(C.violet, RR(480, 560, 50, 60, 10)),
    K.T(L(C.blue, RR(700, 130, 130, 210, 20)), { rot: 25, cx: 740, cy: 270 }),
    K.T(L(C.sky, RR(722, 155, 86, 150, 8)), { rot: 25, cx: 740, cy: 270 }),
    L(C.red, heart(840, 480, 24)),
    L(C.orange, star(900, 330, 30)),
  );

  o['w-trend-33'] = [].concat(
    L(C.blue, RR(170, 170, 660, 420, 24)),
    L(C.ink, RR(200, 200, 600, 360, 10)),
    L(
      C.mint,
      'M200 460C300 400 400 450 500 420C600 390 700 440 800 400V550H200Z',
      { s: 'none' },
    ),
    L(C.red, E(500, 380, 70, 70), { s: 'none' }),
    L(C.ink, E(500, 380, 40, 40), { s: C.paper, w: 7 }),
    ln('M500 290V470M410 380H590', C.paper, 7),
    ln('M470 590V690M530 590V690M390 700H610', I, 34),
    L(C.violet, RR(200, 760, 440, 80, 14)),
    ln('M230 790H610', C.pink, 16),
    ln('M230 815H610', C.sky, 7),
    L(C.orange, E(740, 800, 38, 55)),
    ln('M225 120C225 20 475 20 475 120', I, 34),
    L(C.pink, RR(180, 95, 60, 100, 16)),
    L(C.pink, RR(460, 95, 60, 100, 16)),
  );

  o['w-trend-34'] = [].concat(
    ground(850),
    L(C.mint, 'M200 640C180 520 260 470 420 470H470L520 640Z'),
    L(
      C.mint,
      poly([
        [650, 640],
        [610, 340],
        [690, 330],
        [770, 650],
      ]),
    ),
    L(C.mint, RR(420, 620, 260, 40, 10)),
    L(C.brown, RR(240, 430, 230, 52, 22)),
    ln('M650 340L620 290L720 280', I, 16),
    L(C.yellow, E(700, 350, 30, 24)),
    L(
      C.sky,
      poly([
        [630, 345],
        [680, 330],
        [700, 215],
        [640, 220],
      ]),
    ),
    L(
      C.yellow,
      poly([
        [330, 540],
        [270, 600],
        [320, 600],
        [295, 650],
        [385, 570],
        [335, 570],
      ]),
      { s: I },
    ),
    L(I, E(300, 730, 105, 105), { s: 'none' }),
    L(I, E(740, 730, 100, 100), { s: 'none' }),
    L(C.violet, E(300, 730, 50, 50)),
    L(C.violet, E(740, 730, 48, 48)),
    ln('M850 840C850 700 950 780 960 700', C.mint, 16),
  );

  o['w-trend-35'] = [].concat(
    ground(850),
    L(C.mint, RR(150, 230, 190, 620, 40)),
    L(C.paper, RR(180, 270, 130, 110, 10)),
    L(
      C.yellow,
      poly([
        [260, 285],
        [215, 330],
        [248, 330],
        [232, 368],
        [285, 315],
        [252, 315],
      ]),
      { s: 'none' },
    ),
    L(C.ink, RR(200, 420, 90, 60, 8)),
    ln('M290 450C400 450 330 640 420 640', I, 34),
    L(C.violet, RR(410, 610, 70, 60, 12)),
    L(C.blue, RR(500, 590, 420, 150, 50)),
    L(C.sky, 'M600 590C630 520 740 500 800 590Z'),
    L(C.violet, E(620, 745, 50, 50)),
    L(C.violet, E(820, 745, 50, 50)),
    L(C.mint, E(620, 745, 0, 0), { s: 'none' }),
    L(C.yellow, E(905, 650, 12, 18), { s: 'none' }),
  );
  o['w-trend-35'] = [].concat(
    ground(850),
    L(C.mint, RR(130, 230, 190, 620, 40)),
    L(C.paper, RR(160, 275, 130, 110, 10)),
    L(
      C.yellow,
      poly([
        [240, 290],
        [195, 335],
        [228, 335],
        [212, 373],
        [265, 320],
        [232, 320],
      ]),
      { s: 'none' },
    ),
    L(I, RR(185, 430, 90, 60, 8)),
    ln('M275 465C390 465 330 650 440 650', I, 34),
    L(C.violet, RR(430, 620, 70, 60, 12)),
    L(C.blue, RR(520, 600, 420, 150, 50)),
    L(C.sky, 'M630 600C660 530 770 510 830 600Z'),
    L(I, E(640, 760, 58, 58), { s: 'none' }),
    L(I, E(840, 760, 58, 58), { s: 'none' }),
    L(C.violet, E(640, 760, 28, 28)),
    L(C.violet, E(840, 760, 28, 28)),
  );

  o['w-trend-36'] = [].concat(
    L(C.blue, RR(340, 170, 320, 600, 50)),
    L(C.paper, RR(370, 225, 260, 490, 14)),
    L(C.red, E(500, 400, 60, 60)),
    L(C.paper, RR(480, 360, 40, 70, 20), { s: 'none' }),
    ln('M470 450Q500 475 530 450M500 475V490', C.paper, 7),
    ln(
      'M400 560V600M440 530V630M480 545V615M520 520V640M560 545V615M600 560V600',
      C.violet,
      16,
    ),
    L(C.pink, RR(690, 130, 250, 150, 44)),
    L(
      C.pink,
      poly([
        [720, 270],
        [700, 340],
        [770, 275],
      ]),
    ),
    L(C.paper, E(760, 205, 14, 14), { s: 'none' }),
    L(C.paper, E(815, 205, 14, 14), { s: 'none' }),
    L(C.paper, E(870, 205, 14, 14), { s: 'none' }),
    ln('M230 400Q170 480 230 560M150 350Q70 480 150 610', C.sky, 16),
    L(C.yellow, E(500, 200, 0, 0), { s: 'none' }),
  );

  o['w-trend-37'] = [].concat(
    ground(850),
    L(C.sky, RR(80, 260, 220, 590, 24)),
    ln('M80 470H300', I, 7),
    ln('M110 320V420M110 510V600', I, 16),
    L(C.paper, RR(340, 440, 280, 410, 24)),
    L(C.sky, E(480, 650, 105, 105)),
    L(C.blue, E(480, 650, 70, 70), { s: 'none' }),
    L(C.red, E(380, 490, 14, 14), { s: 'none' }),
    L(C.yellow, E(430, 490, 14, 14), { s: 'none' }),
    L(C.yellow, RR(670, 440, 0, 0, 0), { s: 'none' }),
    L(
      C.orange,
      poly([
        [740, 450],
        [880, 450],
        [830, 570],
        [790, 570],
      ]),
    ),
    ln('M810 570V620M785 620H835', I, 16),
    L(C.yellow, E(810, 440, 95, 22)),
    wifi(420, 200, 36, C.blue),
    wifi(200, 210, 26, C.blue),
    wifi(780, 260, 26, C.blue),
  );
  o['w-trend-37'] = [].concat(
    ground(850),
    L(C.sky, RR(70, 300, 220, 550, 24)),
    ln('M70 500H290', I, 7),
    ln('M100 350V450M100 540V640', I, 16),
    L(C.paper, RR(330, 450, 290, 400, 24)),
    L(C.red, E(380, 495, 14, 14), { s: 'none' }),
    L(C.yellow, E(430, 495, 14, 14), { s: 'none' }),
    L(C.sky, E(480, 670, 100, 100)),
    L(C.blue, E(480, 670, 62, 62), { s: 'none' }),
    L(
      C.orange,
      poly([
        [720, 520],
        [900, 520],
        [840, 650],
        [780, 650],
      ]),
    ),
    ln('M810 650V740M770 740H850', I, 16),
    L(C.yellow, E(810, 510, 100, 24)),
    wifi(450, 330, 40, C.blue),
  );

  o['w-trend-38'] = [].concat(
    K.tube(
      [
        [40, 520],
        [520, 520],
      ],
      130,
      C.yellow,
    ),
    L(C.yellow, E(740, 520, 220, 150)),
    ln('M610 520Q700 400 800 420M610 520Q700 640 800 620', I, 7),
    L(C.orange, RR(330, 400, 110, 240, 24)),
    L(C.blue, RR(345, 440, 80, 150, 12)),
    L(C.red, heart(385, 520, 22)),
    L(C.violet, E(780, 250, 70, 70)),
    L(C.violet, RR(765, 270, 36, 130, 18)),
    L(C.paper, E(765, 245, 28, 28), { s: 'none' }),
    L(C.pink, E(200, 790, 0, 0), { s: 'none' }),
    ln('M120 780L200 780L240 730L290 830L330 780L420 780', C.red, 16),
  );

  o['w-trend-39'] = [].concat(
    sky(),
    L(
      C.blue,
      poly([
        [170, 270],
        [500, 300],
        [500, 760],
        [170, 790],
      ]),
    ),
    L(
      C.blue,
      poly([
        [500, 300],
        [830, 270],
        [830, 790],
        [500, 760],
      ]),
    ),
    L(
      C.violet,
      poly([
        [200, 305],
        [485, 330],
        [485, 735],
        [200, 760],
      ]),
    ),
    L(
      C.pink,
      poly([
        [515, 330],
        [800, 305],
        [800, 760],
        [515, 735],
      ]),
    ),
    L(C.mint, E(330, 580, 48, 48), { s: 'none' }),
    L(C.yellow, heart(660, 530, 55)),
    ln('M500 300V760', I, 16),
    L(I, E(180, 300, 14, 14), { s: 'none' }),
    L(C.orange, star(250, 880, 0), { s: 'none' }),
  );
  o['w-trend-39'] = [].concat(
    sky(),
    L(
      C.blue,
      poly([
        [170, 270],
        [500, 300],
        [500, 780],
        [170, 810],
      ]),
    ),
    L(
      C.blue,
      poly([
        [500, 300],
        [830, 270],
        [830, 810],
        [500, 780],
      ]),
    ),
    L(
      C.violet,
      poly([
        [200, 305],
        [485, 330],
        [485, 755],
        [200, 780],
      ]),
      { s: 'none' },
    ),
    L(
      C.pink,
      poly([
        [515, 330],
        [800, 305],
        [800, 780],
        [515, 755],
      ]),
      { s: 'none' },
    ),
    L(C.yellow, E(335, 480, 60, 60)),
    L(C.mint, 'M200 780L200 640L300 600L400 690L485 640V755Z', { s: 'none' }),
    L(C.red, heart(660, 540, 70)),
    ln('M500 300V780', I, 16),
    L(I, E(185, 310, 12, 12), { s: 'none' }),
  );

  o['w-trend-40'] = [].concat(
    L(C.violet, E(500, 840, 280, 70)),
    L(C.sky, E(500, 800, 220, 45)),
    K.tube(
      [
        [420, 360],
        [320, 450],
        [330, 640],
      ],
      70,
      C.mint,
    ),
    K.tube(
      [
        [580, 360],
        [680, 450],
        [670, 640],
      ],
      70,
      C.mint,
    ),
    L(C.pink, 'M390 780L420 580C440 540 560 540 580 580L610 780Z'),
    K.tube(
      [
        [420, 600],
        [350, 690],
      ],
      28,
      C.pink,
    ),
    K.tube(
      [
        [580, 600],
        [660, 540],
        [700, 460],
      ],
      28,
      C.pink,
    ),
    L(C.yellow, E(500, 450, 100, 115)),
    L(
      C.mint,
      'M395 440C390 320 450 300 500 300C560 300 615 330 605 440C570 380 530 360 500 355C460 355 420 380 395 440Z',
    ),
    L(I, E(465, 460, 9, 14), { s: 'none' }),
    L(I, E(535, 460, 9, 14), { s: 'none' }),
    L(C.red, E(500, 515, 20, 10), { s: I }),
    L(C.pink, E(420, 490, 16, 10), { s: 'none' }),
    L(C.pink, E(580, 490, 16, 10), { s: 'none' }),
    L(C.red, star(190, 230, 40)),
    L(C.yellow, star(830, 200, 45)),
    ln('M320 700L380 780M680 700L620 780', I, 16),
  );

  o['w-trend-41'] = [].concat(
    ground(870, C.paper),
    L(C.blue, RR(170, 170, 660, 430, 26)),
    L(C.paper, RR(200, 200, 600, 370, 10)),
    L(
      C.red,
      poly([
        [500, 240],
        [610, 450],
        [390, 450],
      ]),
      { s: I, w: 16 },
    ),
    ln('M500 300V380', I, 34),
    L(C.ink, E(500, 415, 14, 14), { s: 'none' }),
    ln('M500 600V700M390 700H610', I, 34),
    ln('M880 30V160', I, 7),
    ln('M880 160C880 300 930 330 860 330C800 330 840 270 840 270', I, 16),
    L(C.yellow, RR(640, 700, 220, 120, 18)),
    ln('M640 740H860', I, 34),
    ln('M665 790H740', I, 16),
    L(C.sky, RR(200, 750, 0, 0, 0), { s: 'none' }),
  );
  o['w-trend-41'] = [].concat(
    ground(870, C.paper),
    L(C.blue, RR(120, 280, 640, 400, 26)),
    L(C.paper, RR(150, 310, 580, 340, 10)),
    L(
      C.red,
      poly([
        [440, 340],
        [550, 550],
        [330, 550],
      ]),
      { s: I, w: 16 },
    ),
    ln('M440 400V470', I, 34),
    L(C.ink, E(440, 510, 13, 13), { s: 'none' }),
    ln('M440 680V770M330 780H550', I, 34),
    ln('M850 40V300', I, 7),
    ln('M850 300V380C850 470 750 470 750 400', I, 16),
    L(C.yellow, RR(720, 450, 220, 130, 18)),
    ln('M720 490H940', I, 34),
    ln('M745 545H820', I, 16),
    L(C.red, E(850, 40, 0, 0), { s: 'none' }),
  );

  o['w-trend-42'] = [].concat(
    sky(),
    L(C.blue, RR(120, 270, 760, 400, 56)),
    L(C.sky, RR(190, 310, 620, 320, 10)),
    L(
      C.mint,
      'M190 560C300 520 400 560 500 540C600 520 700 560 810 530V630H190Z',
      { s: 'none' },
    ),
    L(C.green, RR(190, 590, 620, 40, 0), { s: 'none' }),
    L(C.orange, E(380, 480, 45, 55)),
    L(I, E(365, 470, 6, 8), { s: 'none' }),
    L(I, E(395, 470, 6, 8), { s: 'none' }),
    L(C.yellow, star(580, 400, 38)),
    L(C.yellow, star(670, 450, 30)),
    L(C.violet, E(140, 470, 24, 24)),
    L(C.red, E(860, 430, 30, 30)),
    L(C.red, E(860, 520, 30, 30), { s: I }),
    L(C.yellow, E(130, 640, 70, 55)),
    L(C.yellow, E(870, 650, 70, 55)),
  );
  o['w-trend-42'] = [].concat(
    sky(),
    L(C.blue, RR(120, 270, 760, 400, 56)),
    L(C.sky, RR(200, 310, 600, 320, 10)),
    L(
      C.mint,
      'M200 570C300 530 400 570 500 550C600 530 700 570 800 540V630H200Z',
      { s: 'none' },
    ),
    L(C.orange, E(380, 470, 45, 55)),
    L(I, E(365, 460, 6, 8), { s: 'none' }),
    L(I, E(395, 460, 6, 8), { s: 'none' }),
    L(C.yellow, star(590, 400, 38)),
    L(C.yellow, star(680, 460, 30)),
    L(C.violet, E(150, 470, 24, 24)),
    L(C.red, E(850, 430, 28, 28)),
    L(C.pink, E(850, 515, 28, 28)),
    L(C.yellow, E(150, 700, 70, 55)),
    L(C.yellow, E(850, 700, 70, 55)),
  );

  o['w-trend-43'] = [].concat(
    ground(870),
    L(C.violet, RR(450, 700, 0, 0, 0), { s: 'none' }),
    L(C.ink, RR(130, 220, 740, 470, 34)),
    L(C.sky, RR(170, 260, 660, 390, 10)),
    L(C.red, E(500, 455, 95, 95)),
    L(
      C.paper,
      poly([
        [470, 400],
        [470, 510],
        [555, 455],
      ]),
      { s: 'none' },
    ),
    ln('M420 740H580', I, 34),
    L(C.violet, RR(380, 690, 240, 40, 8)),
    wifi(500, 190, 40, C.blue),
    L(
      C.paper,
      poly([
        [700, 780],
        [740, 780],
        [780, 920],
        [720, 920],
      ]),
      { s: 'none' },
    ),
    ln('M215 305H330M215 345H290', C.paper, 16),
  );
  o['w-trend-43'] = [].concat(
    ground(860),
    L(C.ink, RR(100, 230, 700, 440, 34)),
    L(C.sky, RR(140, 270, 620, 360, 10)),
    L(C.red, E(450, 450, 90, 90)),
    L(
      C.paper,
      poly([
        [420, 395],
        [420, 505],
        [505, 450],
      ]),
      { s: 'none' },
    ),
    L(C.violet, RR(340, 670, 220, 40, 8)),
    L(C.violet, RR(280, 710, 340, 36, 12)),
    wifi(450, 190, 36, C.blue),
    L(
      C.paper,
      poly([
        [740, 610],
        [940, 610],
        [900, 830],
        [780, 830],
      ]),
    ),
    ln('M790 610L800 830M840 610V830M890 610L880 830', C.red, 16),
    L(C.paper, E(800, 600, 28, 28)),
    L(C.paper, E(860, 585, 30, 30)),
    L(C.paper, E(915, 605, 26, 26)),
    L(C.yellow, E(860, 590, 12, 12), { s: 'none' }),
  );

  o['w-trend-44'] = [].concat(
    ground(870, C.sky),
    L(
      C.paper,
      'M250 100H600V780L565 810L530 780L495 810L460 780L425 810L390 780L355 810L320 780L285 810L250 780Z',
    ),
    L(I, RR(300, 160, 140, 0, 0), { s: 'none' }),
    ln('M300 170H550M300 220H500', I, 16),
    L(C.ink, RR(335, 290, 80, 80, 6), { s: 'none' }),
    L(C.paper, RR(352, 307, 46, 46, 0), { s: 'none' }),
    L(C.ink, RR(365, 320, 20, 20, 0), { s: 'none' }),
    L(C.ink, RR(435, 290, 40, 40, 6), { s: 'none' }),
    L(C.ink, RR(485, 340, 40, 30, 0), { s: 'none' }),
    ln('M300 450H550M300 500H520M300 550H550', I, 16),
    ln(
      'M310 640V720M345 640V720M375 640V720M420 640V720M450 640V720M490 640V720M520 640V720',
      I,
      7,
    ),
    L(C.mint, RR(690, 310, 230, 440, 44)),
    L(C.paper, RR(715, 360, 180, 330, 8)),
    ln('M740 540L790 590L870 480', C.green, 34),
  );
  o['w-trend-44'] = [].concat(
    ground(870, C.sky),
    L(
      C.paper,
      'M150 110H540V780L505 810L470 780L435 810L400 780L365 810L330 780L295 810L260 780L225 810L190 780L150 810Z',
    ),
    ln('M200 170H490M200 220H430', I, 16),
    L(C.ink, RR(210, 290, 110, 110, 6)),
    L(C.paper, RR(228, 308, 74, 74, 0), { s: 'none' }),
    L(C.ink, RR(245, 325, 40, 40, 0), { s: 'none' }),
    L(C.ink, RR(345, 290, 50, 50, 6), { s: 'none' }),
    L(C.ink, RR(410, 350, 60, 50, 0), { s: 'none' }),
    ln('M200 470H490M200 520H460M200 570H490', I, 16),
    ln(
      'M210 660V740M245 660V740M280 660V740M325 660V740M360 660V740M400 660V740M440 660V740',
      I,
      7,
    ),
    L(C.mint, RR(630, 310, 270, 480, 44)),
    L(C.paper, RR(660, 365, 210, 370, 8)),
    ln('M690 560L750 620L840 500', C.green, 34),
  );

  // ---- history ----
  o['w-history-0'] = [].concat(
    sky(),
    L(
      C.mint,
      'M-40 700C100 520 260 400 380 470C460 520 520 380 620 330C760 260 900 430 1040 480V1040H-40Z',
    ),
    L(
      C.green,
      'M-40 880C150 780 330 800 500 860C700 780 880 800 1040 850V1040H-40Z',
    ),
    K.tube(
      [
        [-20, 690],
        [150, 600],
        [300, 520],
        [360, 620],
        [520, 470],
        [640, 380],
        [780, 330],
        [900, 420],
        [1020, 440],
      ],
      48,
      C.yellow,
    ),
    L(C.yellow, RR(260, 400, 110, 140, 6)),
    L(C.brown, RR(260, 400, 110, 24, 0), { s: 'none' }),
    L(C.yellow, RR(590, 240, 110, 150, 6)),
    L(
      C.brown,
      'M265 400V370H285V400M300 400V370H320V400M335 400V370H355V400Z',
      { s: 'none' },
    ),
    L(I, 'M290 480V520H340V480Z', { s: 'none' }),
    L(I, 'M620 330V370H670V330Z', { s: 'none' }),
    L(C.yellow, E(150, 150, 60, 60)),
  );
  o['w-history-0'] = [].concat(
    sky(),
    L(C.yellow, E(150, 160, 60, 60)),
    L(
      C.violet,
      'M-40 760C100 560 240 420 360 480C440 520 520 380 620 340C760 280 900 440 1040 490V1040H-40Z',
    ),
    L(
      C.green,
      'M-40 900C150 800 330 820 500 880C700 800 880 820 1040 870V1040H-40Z',
    ),
    K.tube(
      [
        [-20, 700],
        [140, 620],
        [280, 560],
        [340, 650],
        [500, 510],
        [640, 400],
        [790, 360],
        [900, 440],
        [1020, 470],
      ],
      46,
      C.orange,
    ),
    L(C.orange, RR(240, 400, 130, 130, 4)),
    L(C.brown, RR(240, 400, 130, 22), { s: 'none' }),
    L(C.orange, RR(580, 250, 130, 140, 4)),
    L(C.brown, RR(580, 250, 130, 22), { s: 'none' }),
    L(I, RR(285, 460, 40, 70, 20), { s: 'none' }),
    L(I, RR(625, 320, 40, 70, 20), { s: 'none' }),
    ln('M240 400V370H265V400M290 400V370H315V400M345 400V370H370V400', I, 7),
    ln('M580 250V220H605V250M630 250V220H655V250M685 250V220H710V250', I, 7),
  );

  function warrior(x, yb, s) {
    var u = s;
    return [].concat(
      L(C.violet, RR(x - 70 * u, yb - 30 * u, 140 * u, 40 * u, 8 * u)),
      L(
        C.orange,
        poly([
          [x - 50 * u, yb - 30 * u],
          [x - 55 * u, yb - 170 * u],
          [x + 55 * u, yb - 170 * u],
          [x + 50 * u, yb - 30 * u],
        ]),
      ),
      ln(
        'M' +
          (x - 52 * u) +
          ' ' +
          (yb - 110 * u) +
          'H' +
          (x + 52 * u) +
          'M' +
          (x - 50 * u) +
          ' ' +
          (yb - 75 * u) +
          'H' +
          (x + 50 * u),
        I,
        7,
      ),
      L(C.brown, RR(x - 52 * u, yb - 175 * u, 104 * u, 50 * u, 12 * u)),
      K.tube(
        [
          [x - 55 * u, yb - 160 * u],
          [x - 75 * u, yb - 100 * u],
        ],
        30 * u,
        C.orange,
      ),
      K.tube(
        [
          [x + 55 * u, yb - 160 * u],
          [x + 85 * u, yb - 125 * u],
          [x + 70 * u, yb - 170 * u],
        ],
        30 * u,
        C.orange,
      ),
      L(C.orange, E(x, yb - 215 * u, 38 * u, 45 * u)),
      L(C.orange, E(x, yb - 270 * u, 17 * u, 22 * u)),
      L(
        C.brown,
        'M' +
          (x - 38 * u) +
          ' ' +
          (yb - 220 * u) +
          'C' +
          (x - 38 * u) +
          ' ' +
          (yb - 265 * u) +
          ' ' +
          (x + 38 * u) +
          ' ' +
          (yb - 265 * u) +
          ' ' +
          (x + 38 * u) +
          ' ' +
          (yb - 220 * u) +
          'Q' +
          x +
          ' ' +
          (yb - 240 * u) +
          ' ' +
          (x - 38 * u) +
          ' ' +
          (yb - 220 * u) +
          'Z',
      ),
      L(I, E(x - 14 * u, yb - 210 * u, 4 * u, 5 * u), { s: 'none' }),
      L(I, E(x + 14 * u, yb - 210 * u, 4 * u, 5 * u), { s: 'none' }),
      ln('M' + (x - 10 * u) + ' ' + (yb - 192 * u) + 'H' + (x + 10 * u), I, 7),
    );
  }
  o['w-history-1'] = [].concat(
    L(C.yellow, 'M-40 -40H1040V1040H-40Z', { s: 'none' }),
    L(C.brown, 'M-40 780H1040V1040H-40Z', { s: 'none' }),
    ln('M-40 780H1040'),
    L(C.orange, RR(0, 0, 0, 0), { s: 'none' }),
    warrior(210, 840, 1.7),
    warrior(500, 840, 1.7),
    warrior(790, 840, 1.7),
    ln('M-20 860H1020', I, 7),
  );
  o['w-history-1'] = [].concat(
    L(C.yellow, 'M-40 -40H1040V1040H-40Z', { s: 'none' }),
    L(C.brown, 'M-40 800H1040V1040H-40Z', { s: 'none' }),
    ln('M-40 800H1040'),
    warrior(200, 860, 1.7),
    warrior(500, 860, 1.7),
    warrior(800, 860, 1.7),
    L(C.brown, RR(-40, 860, 1080, 40), { s: 'none' }),
  );

  o['w-history-2'] = [].concat(
    sky(),
    L(C.orange, E(800, 200, 70, 70)),
    ground(780, C.yellow),
    L(
      C.orange,
      poly([
        [640, 780],
        [800, 520],
        [980, 780],
      ]),
    ),
    L(
      C.yellow,
      poly([
        [640, 780],
        [800, 520],
        [820, 780],
      ]),
      { s: 'none' },
    ),
    L(
      C.yellow,
      poly([
        [130, 800],
        [470, 220],
        [860, 800],
      ]),
    ),
    L(
      C.orange,
      poly([
        [470, 220],
        [860, 800],
        [560, 800],
      ]),
      { s: 'none' },
    ),
    ln('M470 220L860 800M470 220L130 800', I, 7),
    ln('M270 560L700 560M200 680L780 680M355 410L600 410', I, 7),
    L(
      C.yellow,
      poly([
        [130, 800],
        [470, 220],
        [560, 800],
      ]),
      { s: 'none' },
    ),
  );
  o['w-history-2'] = [].concat(
    sky(),
    L(C.orange, E(840, 170, 65, 65)),
    ground(800, C.yellow),
    L(
      C.yellow,
      poly([
        [600, 800],
        [790, 500],
        [980, 800],
      ]),
    ),
    L(
      C.orange,
      poly([
        [790, 500],
        [980, 800],
        [840, 800],
      ]),
      { s: 'none' },
    ),
    L(
      C.yellow,
      poly([
        [110, 830],
        [430, 220],
        [820, 830],
      ]),
    ),
    L(
      C.orange,
      poly([
        [430, 220],
        [820, 830],
        [560, 830],
      ]),
      { s: 'none' },
    ),
    ln('M270 540H640M200 680H730M345 400H560', I, 7),
    ln('M430 220L820 830', I, 7),
  );

  o['w-history-3'] = [].concat(
    sky(),
    L(C.orange, E(840, 160, 60, 60)),
    ground(800, C.yellow),
    L(
      C.yellow,
      poly([
        [580, 800],
        [770, 380],
        [960, 800],
      ]),
    ),
    L(
      C.orange,
      poly([
        [770, 380],
        [960, 800],
        [850, 800],
      ]),
      { s: 'none' },
    ),
    L(
      C.orange,
      'M120 800C110 640 200 590 340 600L560 610C640 620 680 680 690 800Z',
    ),
    L(C.yellow, RR(80, 750, 300, 70, 30)),
    L(C.yellow, 'M110 800V720C110 650 160 640 240 640L480 640L480 800Z', {
      s: 'none',
    }),
    L(
      C.yellow,
      'M250 640C230 560 260 420 330 380C400 340 520 360 540 450C560 540 520 600 480 640Z',
    ),
    L(
      C.blue,
      'M330 380C380 340 520 340 545 440L560 620L505 590C500 520 470 460 410 450Z',
    ),
    L(C.yellow, E(330, 500, 55, 70)),
    L(I, E(310, 480, 7, 9), { s: 'none' }),
    ln('M300 540Q320 555 345 540', I, 7),
    ln('M420 450L470 600M440 440L500 590', C.orange, 7),
  );
  o['w-history-3'] = [].concat(
    sky(),
    L(C.orange, E(850, 160, 60, 60)),
    ground(800, C.yellow),
    L(
      C.yellow,
      poly([
        [600, 800],
        [780, 420],
        [960, 800],
      ]),
    ),
    L(
      C.orange,
      poly([
        [780, 420],
        [960, 800],
        [860, 800],
      ]),
      { s: 'none' },
    ),
    L(
      C.yellow,
      'M330 800C280 800 280 660 320 640L620 640C700 640 780 700 780 800Z',
    ),
    L(C.orange, 'M380 800C400 760 600 760 780 800Z', { s: 'none' }),
    L(C.yellow, RR(60, 730, 330, 75, 36)),
    L(C.yellow, RR(60, 760, 330, 45, 20), { s: 'none' }),
    L(C.blue, 'M170 640C140 480 190 380 270 380C350 380 400 460 400 640Z'),
    L(C.yellow, 'M215 640C200 530 215 450 270 450C320 450 340 540 330 640Z', {
      s: 'none',
    }),
    L(C.yellow, E(262, 520, 55, 70)),
    L(I, E(245, 505, 6, 9), { s: 'none' }),
    L(I, E(282, 505, 6, 9), { s: 'none' }),
    ln('M245 548Q263 560 282 548', I, 7),
    ln('M180 450L200 640M385 450L370 640', C.yellow, 7),
  );
  o['w-history-3'] = [].concat(
    sky(),
    L(C.orange, E(850, 150, 60, 60)),
    ground(800, C.yellow),
    L(
      C.yellow,
      poly([
        [600, 800],
        [780, 440],
        [960, 800],
      ]),
    ),
    L(
      C.orange,
      poly([
        [780, 440],
        [960, 800],
        [860, 800],
      ]),
      { s: 'none' },
    ),
    L(
      C.yellow,
      'M230 800C230 640 300 590 400 590L640 600C730 610 790 700 790 800Z',
    ),
    L(C.yellow, RR(60, 730, 340, 70, 32)),
    L(C.orange, RR(80, 780, 300, 20, 0), { s: 'none' }),
    L(C.blue, 'M195 660C150 480 195 380 270 380C345 380 390 480 345 660Z'),
    L(C.yellow, E(268, 520, 58, 75)),
    L(I, E(247, 505, 6, 9), { s: 'none' }),
    L(I, E(289, 505, 6, 9), { s: 'none' }),
    ln('M247 550Q268 563 289 550', I, 7),
    ln('M170 500L190 660M365 500L345 660', C.blue, 7),
    ln('M440 700H760', I, 7),
  );

  function brickRows(x0, x1, ys, col) {
    var d = '',
      i;
    for (i = 0; i < ys.length; i++) d += 'M' + x0 + ' ' + ys[i] + 'H' + x1;
    return ln(d, col || I, 7);
  }
  o['w-history-4'] = [].concat(
    sky(),
    ground(820, C.yellow),
    L(
      C.yellow,
      'M100 830V450C100 380 300 330 520 330C660 330 740 370 790 430L810 520L900 540L920 830Z',
      { b: 1 },
    ),
    L(C.orange, RR(100, 700, 840, 130, 0), { i: 1 }),
    L(
      C.brown,
      'M130 480h50v70h-50zM210 465h50v85h-50zM290 455h50v95h-50zM370 450h50v100h-50zM450 450h50v100h-50zM530 450h50v100h-50zM610 455h50v95h-50zM690 465h50v85h-50zM770 500h50v50h-50z',
      { i: 1, s: I },
    ),
    L(
      C.brown,
      'M130 590h50v90h-50zM210 590h50v90h-50zM290 590h50v90h-50zM370 590h50v90h-50zM450 590h50v90h-50zM530 590h50v90h-50zM610 590h50v90h-50zM690 590h50v90h-50zM770 590h50v90h-50zM850 590h50v90h-50z',
      { i: 1, s: I },
    ),
    L(
      C.brown,
      'M130 730h50v100h-50zM210 730h50v100h-50zM290 730h50v100h-50zM370 730h50v100h-50zM450 730h50v100h-50zM530 730h50v100h-50zM610 730h50v100h-50zM690 730h50v100h-50zM770 730h50v100h-50zM850 730h50v100h-50z',
      { i: 1, s: I },
    ),
    ln('M100 560H810M100 700H920', I, 16),
  );
  function archRow(xs, y, w, h, n) {
    var d = '',
      i;
    for (i = 0; i < n; i++)
      d += RR(xs + i * (w + 30), y, w, h, w / 2 - 2) + ' ';
    return L(C.brown, d.trim(), { i: 1, s: I });
  }
  o['w-history-4'] = [].concat(
    sky(),
    ground(830, C.yellow),
    L(
      C.yellow,
      'M90 840V440C90 370 290 320 510 320C650 320 730 360 780 430L800 520L880 540L930 840Z',
      { b: 1 },
    ),
    L(C.orange, 'M740 330L800 520L880 540L940 840H720Z', { i: 1, s: 'none' }),
    archRow(120, 440, 44, 80, 7),
    archRow(120, 590, 44, 90, 11),
    archRow(120, 740, 44, 100, 11),
    ln('M90 560H800M90 700H930', I, 16),
    L(C.paper, RR(0, 0, 0, 0), { s: 'none' }),
  );

  o['w-history-5'] = [].concat(
    sky(),
    ground(820),
    K.T(
      [].concat(
        L(C.paper, RR(390, 120, 220, 700, 8)),
        L(C.paper, RR(420, 70, 160, 70, 14)),
        L(C.yellow, RR(430, 30, 140, 50, 24), { s: 'none' }),
        ln(
          'M390 230H610M390 330H610M390 430H610M390 530H610M390 630H610M390 730H610',
          I,
          16,
        ),
        ln(
          'M425 250V320M470 250V320M530 250V320M575 250V320M425 350V420M470 350V420M530 350V420M575 350V420M425 450V520M470 450V520M530 450V520M575 450V520M425 550V620M470 550V620M530 550V620M575 550V620M425 650V720M470 650V720M530 650V720M575 650V720',
          I,
          7,
        ),
        L(C.violet, RR(390, 120, 70, 0, 0), { s: 'none' }),
      ),
      { rot: 9, cx: 500, cy: 820 },
    ),
  );
  function tier(y, h, x, w) {
    return L(C.paper, RR(x, y, w, h, 4));
  }
  var tw = [].concat(
    tier(120, 70, 410, 180),
    tier(190, 90, 380, 240),
    tier(280, 90, 380, 240),
    tier(370, 90, 380, 240),
    tier(460, 90, 380, 240),
    tier(550, 90, 380, 240),
    tier(640, 90, 380, 240),
    tier(730, 80, 380, 240),
    L(C.violet, 'M410 120V190M590 120V190', { s: 'none' }),
    ln('M405 150H595', I, 7),
    ln(
      'M410 300V350M450 300V350M500 300V350M550 300V350M590 300V350M410 390V440M450 390V440M500 390V440M550 390V440M590 390V440M410 480V530M450 480V530M500 480V530M550 480V530M590 480V530M410 570V620M450 570V620M500 570V620M550 570V620M590 570V620M410 660V710M450 660V710M500 660V710M550 660V710M590 660V710',
      I,
      7,
    ),
    L(C.red, RR(430, 90, 140, 40, 8)),
    L(C.brown, RR(445, 740, 110, 70, 30), { s: 'none' }),
  );
  o['w-history-5'] = [].concat(
    sky(),
    ground(830),
    K.T(tw, { rot: 9, cx: 500, cy: 810 }),
    L(C.green, E(180, 830, 70, 25), { s: 'none' }),
    L(C.green, E(800, 835, 80, 25), { s: 'none' }),
  );

  function stone(x, y, w, h, col) {
    return L(col || C.violet, RR(x, y, w, h, 10));
  }
  o['w-history-6'] = [].concat(
    sky(),
    L(C.yellow, E(150, 220, 70, 70)),
    ground(760),
    stone(100, 520, 80, 250),
    stone(820, 530, 80, 240),
    stone(250, 450, 70, 300),
    stone(680, 450, 70, 300),
    stone(350, 340, 90, 430),
    stone(560, 340, 90, 430),
    stone(320, 250, 360, 100, C.violet),
    ln('M330 330H670', I, 7),
    ln('M375 400V700M595 400V700', C.sky, 7),
    stone(180, 640, 90, 150, C.sky),
    stone(750, 640, 90, 150, C.sky),
    L(C.green, E(500, 800, 480, 25), { s: 'none' }),
  );

  Object.assign(R, o);
})(typeof globalThis !== 'undefined' ? globalThis : this);
