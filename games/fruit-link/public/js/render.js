/* ===== render.js — 盤面、連線動畫、特效與側欄清單的繪製 =====
 *
 * 這一層只負責「把狀態畫出來」，不判斷任何規則：
 * 該不該消、加幾分一律是 rules.js（單機）或伺服器（線上）算好之後才送進來。
 *
 * 座標系
 * ------
 * 畫面上的 .board 是「含外圈」的 W×H 網格（W = cols+2、H = rows+2），
 * 外圈永遠空著，連線路徑才畫得到盤面外面。連線用的 SVG 用同一個座標系
 * （viewBox = "0 0 W H"，1 單位 = 1 格），所以路徑和格子一定對得準，
 * 不管裝置把盤面等比縮到多大都一樣。
 */
(function (w) {
  'use strict';

  var boardEl = null, lineEl = null, fxEl = null;
  var W = 0, H = 0, cols = 0, rows = 0;
  var theme = 'fruits', palette = [];
  var tiles = {};          // cellIndex -> button 元素
  var tr = function (key, params) { return w.I18N ? w.I18N.t(key, params) : key; };
  var disp = function (name) { return w.I18N ? w.I18N.name(name) : name; };
  var lastGrid = null;
  /* 麻將才有：stackPos[i] = 第 i 張牌的半格座標與層數。平面模式是 null。 */
  var stackPos = null;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  /* 畫面座標：外圈是半格寬，整個座標系因此是 (cols+1) × (rows+1)。
     欄位配置是 [0, 0.5] 半格、[0.5, 1.5] … [cols-0.5, cols+0.5] 整格、[cols+0.5, cols+1] 半格，
     所以內圈第 x 欄的中心剛好落在 x，兩側外圈則是 0.25 與 cols+0.75。 */
  function ax(x) { return x === 0 ? 0.25 : (x === W - 1 ? cols + 0.75 : x); }
  function ay(y) { return y === 0 ? 0.25 : (y === H - 1 ? rows + 0.75 : y); }
  function cx(i) { return ax(i % W); }
  function cy(i) { return ay(Math.floor(i / W)); }
  function vbW() { return stackPos ? W + 1 : cols + 1; }
  function vbH() { return stackPos ? H + 1 : rows + 1; }

  /* ---------------------------------------------------------- 盤面 */

  /**
   * 依快照建立整張盤面。換關卡或重開一局才會呼叫。
   * @param {{board:HTMLElement, line:SVGElement, fx:HTMLElement}} hosts
   */
  function mount(hosts, snap, onPick) {
    boardEl = hosts.board; lineEl = hosts.line; fxEl = hosts.fx;
    W = snap.W; H = snap.H; cols = snap.cols; rows = snap.rows;
    stackPos = (snap.mode === 'stack' && snap.stack && snap.stack.length) ? snap.stack : null;
    theme = snap.theme || 'fruits';
    palette = (snap.palette || []).slice();
    boardEl.classList.toggle('stacked', !!stackPos);
    /* 疊疊樂的網格單位是半格（牌本身佔 2×2 格），所以直接拿 W／H 當格數 */
    boardEl.style.setProperty('--cols', stackPos ? W : cols);
    boardEl.style.setProperty('--rows', stackPos ? H : rows);
    lineEl.setAttribute('viewBox', '0 0 ' + vbW() + ' ' + vbH());
    lineEl.setAttribute('preserveAspectRatio', 'none');
    lineEl.innerHTML = '';
    fxEl.innerHTML = '';
    /* 連線與特效這兩層要「疊在棋盤上」，不是疊在整個盤面容器上 ——
       容器通常比棋盤大（棋盤是等比縮放置中的），疊錯層連線就會偏掉。
       先把它們移出去，清空棋盤，最後再放回棋盤裡面。 */
    var wrap = boardEl.parentNode;
    if (lineEl.parentNode !== wrap) wrap.appendChild(lineEl);
    if (fxEl.parentNode !== wrap) wrap.appendChild(fxEl);
    boardEl.innerHTML = '';
    tiles = {};

    var frag = document.createDocumentFragment();
    if (stackPos) { buildStack(frag, onPick); boardEl.appendChild(frag); }
    else { buildFlat(frag, onPick); boardEl.appendChild(frag); }
    boardEl.appendChild(lineEl);
    boardEl.appendChild(fxEl);
    lastGrid = null;
    sync(snap.grid);
  }

  /**
   * 離開一局時把盤面整個拆掉。
   *
   * 少了這一步，上一局的磚塊會一直留在 DOM 裡 —— 麻將尤其明顯，
   * 128 個帶 filter／transform 的節點各自是一層合成層，畫面切走之後
   * 有些瀏覽器會留下殘影，而且下一局掛載前也可能先閃到舊盤面。
   * 連線與特效兩層是 mount() 認得的固定節點，清空之後要放回去。
   */
  function clear() {
    if (lineEl) { lineEl.innerHTML = ''; lineEl.removeAttribute('viewBox'); }
    if (fxEl) fxEl.innerHTML = '';
    if (boardEl) {
      boardEl.innerHTML = '';
      boardEl.classList.remove('stacked');
      boardEl.style.removeProperty('--cols');
      boardEl.style.removeProperty('--rows');
      if (lineEl) boardEl.appendChild(lineEl);
      if (fxEl) boardEl.appendChild(fxEl);
    }
    tiles = {};
    lastGrid = null;
    stackPos = null;
    W = H = cols = rows = 0;
  }

  /** 麻將視覺：每一張牌自己佔 2×2 個半格，層數只決定畫面前後 */
  function buildStack(frag, onPick) {
    for (var i = 0; i < stackPos.length; i++) {
      var p = stackPos[i];
      var cell = el('div', 'cell lay');
      cell.style.gridColumn = (p.x + 2) + ' / span 2';
      cell.style.gridRow = (p.y + 2) + ' / span 2';
      cell.style.zIndex = String(10 + p.z);
      cell.style.setProperty('--z', p.z);
      cell.dataset.i = i;
      cell.appendChild(makeTile(i, onPick));
      frag.appendChild(cell);
    }
  }

  /** 平面連連看：含外圈的 W×H 網格 */
  function buildFlat(frag, onPick) {
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var i = y * W + x;
        var pad = (x === 0 || y === 0 || x === W - 1 || y === H - 1);
        var cell = el('div', 'cell' + (pad ? ' pad' : ''));
        cell.dataset.i = i;
        if (!pad) cell.appendChild(makeTile(i, onPick));
        frag.appendChild(cell);
      }
    }
  }

  function makeTile(i, onPick) {
    var btn = el('button', 'tile' + (theme === 'mahjong' ? ' mahjong' : ''));
    btn.type = 'button';
    btn.dataset.i = i;
    btn.setAttribute('role', 'gridcell');
    btn.addEventListener('click', function (ev) { ev.preventDefault(); if (onPick) onPick(i); });
    tiles[i] = btn;
    return btn;
  }

  function tileLabel(i, kind) {
    var name = kind ? w.SvgUI.tileName(kind, theme, palette) : tr('tile.empty');
    if (stackPos) {
      var p = stackPos[i];
      return tr('tile.stackAria', { z: p.z + 1, r: Math.floor(p.y / 2) + 1, c: Math.floor(p.x / 2) + 1, name: name });
    }
    var x = (i % W), y = Math.floor(i / W);
    return tr('tile.flatAria', { r: y, c: x, name: name });
  }

  /** 切換語言：把每一格的名稱標籤與朗讀文字換成新語言（圖案與狀態不動） */
  function relabel() {
    if (!lastGrid) return;
    for (var idx in tiles) {
      var btn = tiles[idx];
      var kind = lastGrid[idx] || 0;
      if (!btn || !kind) continue;
      var nm = btn.querySelector('.tile-name');
      if (nm) nm.textContent = w.SvgUI.tileName(kind, theme, palette);
      btn.setAttribute('aria-label', tileLabel(Number(idx), kind));
    }
  }

  /* ---------------------------------------------------------- 麻將各層獨立平面
     連線只看所在層；層與層的重疊仍會鎖住被蓋住的牌。 */

  /** 被上層蓋住的牌要壓暗、不能點、也不進 Tab 順序。 */
  function syncLocks(grid) {
    for (var i = 0; i < stackPos.length; i++) {
      var btn = tiles[i];
      if (!btn) continue;
      var locked = !!grid[i] && !w.Rules.stackFree(stackPos, grid, i);
      btn.classList.toggle('locked', locked);
      if (grid[i]) {
        btn.tabIndex = locked ? -1 : 0;
        btn.setAttribute('aria-disabled', locked ? 'true' : 'false');
      }
    }
  }

  /** 只有沒有被上層蓋住的麻將能點。 */
  function isLocked(i) {
    return !!(stackPos && tiles[i] && tiles[i].classList.contains('locked'));
  }

  /** 疊疊樂的方向鍵：往 dx/dy 找最近的一張牌（偏離方向的要多算一點距離） */
  function stackStep(i, dx, dy, grid) {
    if (!stackPos || !stackPos[i]) return -1;
    var a = stackPos[i], best = -1, bestScore = Infinity, j, b, fwd, side, score;
    for (j = 0; j < stackPos.length; j++) {
      if (j === i || !grid[j]) continue;
      b = stackPos[j];
      if (b.z !== a.z) continue;
      fwd = (b.x - a.x) * dx + (b.y - a.y) * dy;
      if (fwd <= 0) continue;
      side = Math.abs((b.x - a.x) * dy - (b.y - a.y) * dx);
      score = fwd + side * 3;
      if (score < bestScore) { bestScore = score; best = j; }
    }
    return best;
  }

  /** 把畫面上的磚塊對齊到 grid；只動有變的格子 */
  function sync(grid) {
    for (var i in tiles) {
      if (!Object.prototype.hasOwnProperty.call(tiles, i)) continue;
      var idx = Number(i);
      var kind = grid[idx] || 0;
      var prev = lastGrid ? (lastGrid[idx] || 0) : -1;
      if (kind === prev) continue;
      var btn = tiles[idx];
      btn.classList.remove('sel', 'hint', 'gone', 'shake');
      if (!kind) {
        btn.innerHTML = '';
        btn.hidden = true;
        btn.setAttribute('aria-hidden', 'true');
        btn.tabIndex = -1;
      } else {
        btn.hidden = false;
        btn.removeAttribute('aria-hidden');
        btn.tabIndex = 0;
        btn.dataset.kind = kind;
        btn.innerHTML = w.SvgUI.tileSvg(kind, theme, palette) +
          (theme === 'mahjong'
            ? '<span class="mahjong-selection" aria-hidden="true"></span>'
            : '<span class="tile-name">' + w.SvgUI.tileName(kind, theme, palette) + '</span>');
        btn.setAttribute('aria-label', tileLabel(idx, kind));
        btn.setAttribute('aria-pressed', 'false');
      }
    }
    if (stackPos) syncLocks(grid);
    lastGrid = grid.slice();
  }

  function setSelected(i, on) {
    var b = tiles[i];
    if (!b) return;
    b.classList.toggle('sel', !!on);
    /* 疊疊樂：選起來的那一張要浮到最上面，選取框才不會被隔壁的牌切掉 */
    if (stackPos && b.parentNode) {
      b.parentNode.style.zIndex = on ? '60' : String(10 + stackPos[i].z);
    }
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function clearSelected() {
    for (var i in tiles) {
      if (!Object.prototype.hasOwnProperty.call(tiles, i)) continue;
      tiles[i].classList.remove('sel');
      tiles[i].setAttribute('aria-pressed', 'false');
    }
  }
  function clearHints() {
    for (var i in tiles) {
      if (Object.prototype.hasOwnProperty.call(tiles, i)) tiles[i].classList.remove('hint');
    }
  }
  function markHint(a, b, ms) {
    clearHints();
    [a, b].forEach(function (i) { if (tiles[i]) tiles[i].classList.add('hint'); });
    setTimeout(clearHints, ms || 3500);
  }
  function shake(i) {
    var b = tiles[i];
    if (!b) return;
    b.classList.remove('shake');
    void b.offsetWidth;                       // 強制重排，動畫才會重播
    b.classList.add('shake');
    setTimeout(function () { b.classList.remove('shake'); }, 300);
  }
  function focusTile(i) { if (tiles[i] && !tiles[i].hidden) tiles[i].focus(); }
  function tileAt(i) { return tiles[i] || null; }
  function dims() {
    return { W: W, H: H, cols: cols, rows: rows, theme: theme, palette: palette.slice(),
      mode: stackPos ? 'stack' : 'flat' };
  }

  /* ---------------------------------------------------------- 連線動畫 */

  /** 把路徑（格子編號陣列）畫成一條會淡出的折線 */
  function drawLink(path) {
    if (!lineEl || !path || path.length < 2) return;
    var pts = path.map(function (i) { return cx(i).toFixed(3) + ',' + cy(i).toFixed(3); }).join(' ');
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML =
      '<polyline class="lk-bg" points="' + pts + '"/>' +
      '<polyline class="lk" points="' + pts + '"/>';
    lineEl.appendChild(g);
    setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 700);
  }

  /** 把麻將判定器回傳的實際 0／1／2 折路徑畫出來 */
  function drawStackLink(path, a, b) {
    if (!lineEl || !stackPos || !path || path.length < 2 || !stackPos[a] || !stackPos[b]) return;
    var layerColors = ['#19A77C', '#7B5AD8', '#E27A2D', '#237FC1', '#D94375', '#98711A'];
    var layer = stackPos[a].z;
    var pts = path.map(function (point) {
      return Number(point.x).toFixed(3) + ',' + Number(point.y).toFixed(3);
    }).join(' ');
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('stack-link-group');
    g.setAttribute('data-layer', String(layer));
    g.style.setProperty('--stack-link-color', layerColors[layer % layerColors.length]);
    g.innerHTML =
      '<polyline class="stack-link stack-link-glow" points="' + pts + '"/>' +
      '<polyline class="lk-bg stack-link" points="' + pts + '"/>' +
      '<polyline class="lk stack-link" points="' + pts + '"/>';
    lineEl.appendChild(g);
    [a, b].forEach(function (i) {
      if (tiles[i]) tiles[i].classList.add('mahjong-match');
    });
    setTimeout(function () {
      if (g.parentNode) g.parentNode.removeChild(g);
      [a, b].forEach(function (i) {
        if (tiles[i]) tiles[i].classList.remove('mahjong-match');
      });
    }, 950);
  }

  /** 消除動畫：先彈一下再消失，動畫結束才真的把磚塊拿掉 */
  function popPair(a, b) {
    [a, b].forEach(function (i) {
      var t = tiles[i];
      if (!t || t.hidden) return;
      t.classList.remove('sel', 'hint');
      t.classList.add('gone');
    });
  }

  /* ---------------------------------------------------------- 特效 */

  function flyScore(i, text, mine) {
    if (!fxEl) return;
    var s = el('div', 'flyscore' + (mine ? '' : ' other'), text);
    var x = stackPos && stackPos[i] ? stackPos[i].x + 1.5 : cx(i);
    var y = stackPos && stackPos[i] ? stackPos[i].y + 1.5 : cy(i);
    s.style.left = (x / vbW() * 100).toFixed(2) + '%';
    s.style.top = (y / vbH() * 100).toFixed(2) + '%';
    fxEl.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 950);
  }

  function shout(text) {
    if (!fxEl) return;
    var s = el('div', 'shout', text);
    fxEl.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 1050);
  }

  /* ---------------------------------------------------------- 側欄清單 */

  var SEAT_COLORS = ['#A48FDB', '#79C6AC', '#E89C8B', '#7FB4DA', '#E7C263', '#E88CAA'];
  function seatColor(seat) { return SEAT_COLORS[seat % SEAT_COLORS.length]; }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** 即時排行（側欄）＋窄版浮條共用同一份資料 */
  function rank(host, liveHost, players, myId, order) {
    var rows = players.slice().sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return b.pairs - a.pairs;
    });
    var seatOf = {};
    (order || players.map(function (p) { return p.id; })).forEach(function (id, i) { seatOf[id] = i; });

    host.innerHTML = rows.map(function (p, i) {
      var me = p.id === myId;
      return '<li class="rankrow' + (me ? ' me' : '') + '" style="--who:' + seatColor(seatOf[p.id] || 0) + '">' +
        '<span class="no">' + (i + 1) + '</span>' +
        '<span class="nm">' + esc(disp(p.name)) + '</span>' +
        '<span class="sc">' + p.score +
          (p.combo > 1 ? '<small>' + tr('side.comboSmall', { n: p.combo }) + '</small>' : '<small>' + tr('side.pairsSmall', { n: p.pairs }) + '</small>') +
        '</span></li>';
    }).join('');

    if (liveHost) {
      liveHost.innerHTML = rows.map(function (p) {
        var me = p.id === myId;
        return '<span class="lchip' + (me ? ' me' : '') + '" style="--who:' + seatColor(seatOf[p.id] || 0) + '">' +
          '<span class="ln">' + esc(disp(p.name)) + '</span><i>' + p.score + '</i></span>';
      }).join('');
    }
  }

  function seats(host, members, hostId, myId) {
    host.innerHTML = members.map(function (m, i) {
      var tags = '';
      if (m.host) tags += '<span class="tag host">' + tr('seat.host') + '</span>';
      if (m.role === 'spectator') tags += '<span class="tag spec">' + tr('seat.spec') + '</span>';
      else tags += '<span class="tag' + (m.ready ? ' ready' : '') + '">' + tr(m.ready ? 'seat.ready' : 'seat.waiting') + '</span>';
      if (!m.connected) tags += '<span class="tag off">' + tr('seat.off') + '</span>';
      return '<div class="seatrow" style="--who:' + seatColor(i) + '">' +
        '<span class="nm">' + esc(disp(m.name)) + (m.id === myId ? tr('common.youTag') : '') + '</span>' + tags + '</div>';
    }).join('') || '<div class="empty">' + tr('seat.empty') + '</div>';
  }

  function results(host, standings, myId, order) {
    var seatOf = {};
    (order || []).forEach(function (id, i) { seatOf[id] = i; });
    host.innerHTML = standings.map(function (r) {
      var me = r.id === myId;
      return '<div class="resrow' + (r.rank === 1 ? ' win' : '') + '" style="--who:' + seatColor(seatOf[r.id] || r.seat || 0) + '">' +
        '<span class="no">' + r.rank + '</span>' +
        '<span class="nm">' + esc(disp(r.name)) + (me ? tr('common.youTag') : '') +
          '<small>' + tr('result.line', { pairs: r.pairs, combo: r.bestCombo, misses: r.misses }) +
          (r.timeBonus ? tr('result.bonus', { n: r.timeBonus }) : '') + '</small></span>' +
        '<span class="sc">' + r.score + '</span></div>';
    }).join('');
  }

  function chat(host, messages, myId) {
    host.innerHTML = messages.map(function (m) {
      if (m.system) return '<div class="msg sys">' + esc(w.I18N ? w.I18N.srv(m.text) : m.text) + '</div>';
      var cls = 'msg' + (m.from === myId ? ' me' : '') + (m.role === 'spectator' ? ' spec' : '');
      return '<div class="' + cls + '"><span class="who">' + esc(disp(m.name)) + '</span>' + esc(m.text) + '</div>';
    }).join('');
    host.scrollTop = host.scrollHeight;
  }

  /* ---------------------------------------------------------- 玩法頁示範圖 */

  /** 玩法說明用的三張小圖：0 折、1 折、2 折 */
  function pathDemos(host, demoTheme) {
    var themeName = demoTheme === 'mahjong' ? 'mahjong' : 'fruits';
    var demos = [
      { title: tr('help.demo0'), w: 5, h: 3, a: [1, 1], b: [3, 1], path: [[1, 1], [3, 1]], k: [1, 2] },
      { title: tr('help.demo1'), w: 5, h: 4, a: [1, 1], b: [3, 2], path: [[1, 1], [1, 2], [3, 2]], k: [3, 4] },
      { title: tr('help.demo2'), w: 5, h: 4, a: [1, 1], b: [3, 1], path: [[1, 1], [1, 0], [3, 0], [3, 1]], k: [5, 6] }
    ];
    host.innerHTML = demos.map(function (d) {
      var cells = '';
      for (var y = 0; y < d.h; y++) {
        for (var x = 0; x < d.w; x++) {
          cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1" rx="0.12" ' +
            'fill="' + ((x + y) % 2 ? '#FFF6E9' : '#FBEEDC') + '" stroke="#EADFC8" stroke-width="0.03"/>';
        }
      }
      /* 兩個要連的圖案；麻將造型本身已包含牌身，不再加外框。 */
      var piece = function (p, kind) {
        if (themeName === 'mahjong') {
          return '<g transform="translate(' + p[0] + ' ' + p[1] + ') scale(0.01)">' +
            (w.Themes ? w.Themes.art('mahjong', kind).svg : '') + '</g>';
        }
        return '<g transform="translate(' + p[0] + ' ' + p[1] + ') scale(0.01)">' +
          '<rect x="8" y="8" width="84" height="84" rx="18" fill="#FFF3F5" stroke="#4A3B55" stroke-width="5"/>' +
          '<g transform="translate(50 52) scale(0.66) translate(-50 -50)">' +
          (w.Themes ? w.Themes.art('fruits', kind).svg : '') + '</g></g>';
      };
      var pts = d.path.map(function (p) { return (p[0] + 0.5) + ',' + (p[1] + 0.5); }).join(' ');
      return '<figure><svg viewBox="0 0 ' + d.w + ' ' + d.h + '" aria-hidden="true">' + cells +
        '<polyline points="' + pts + '" fill="none" stroke="#FFFFFF" stroke-width="0.22" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<polyline points="' + pts + '" fill="none" stroke="#3FAF8B" stroke-width="0.13" stroke-linecap="round" stroke-linejoin="round"/>' +
        piece(d.a, d.k[0] % 17) + piece(d.b, d.k[0] % 17) +
        '</svg><figcaption>' + d.title + '</figcaption></figure>';
    }).join('');
  }

  w.Render = {
    mount: mount, clear: clear, sync: sync, dims: dims, tileAt: tileAt, focusTile: focusTile,
    isLocked: isLocked, stackStep: stackStep,
    setSelected: setSelected, clearSelected: clearSelected,
    relabel: relabel, markHint: markHint, clearHints: clearHints, shake: shake,
    drawLink: drawLink, drawStackLink: drawStackLink, popPair: popPair,
    flyScore: flyScore, shout: shout,
    rank: rank, seats: seats, results: results, chat: chat,
    pathDemos: pathDemos, seatColor: seatColor, esc: esc
  };
}(window));
