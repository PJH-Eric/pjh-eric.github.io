/* ===== paint.js — 小畫家風格的畫布引擎 =====
 *
 * 工具：鉛筆、筆刷、直線、矩形、橢圓、橡皮擦、油漆桶，加上顏色、筆寬、
 *       填滿開關、復原／重做、全部清除。刻意沒有「文字」工具 ——
 *       畫家可以直接把答案寫上去，那就不叫你畫我猜了。
 *
 * 座標：所有筆畫一律存成 0..1000 的整數（Rules.CONST.BOX），
 *       跟裝置解析度無關，所以手機畫的、平板看的、伺服器存的都是同一份。
 *
 * 畫面：
 *   layer  離線畫布（固定 1400×1400），所有「已完成」的筆畫都畫在這裡
 *   view   看得到的 canvas，每一幀把 layer 貼上來再疊一層「正在畫的預覽」
 *   固定解析度的 layer 讓油漆桶的漫填結果在每台裝置上都一致，
 *   否則同一張圖在不同螢幕上會填出不同區域。
 *
 * 串流：手繪的長線會每約 24 個點或 220 毫秒切成一段送出去，
 *       下一段從上一段的最後一點接著畫，所以線看起來是連續的，
 *       但其他人幾乎是即時看到，而不是等你放手才突然冒出一整筆。
 */
(function (w) {
  'use strict';

  var Rules = w.Rules;
  var BOX = Rules.CONST.BOX;          // 1000
  var BUF = 1400;                      // 離線畫布邊長（固定，油漆桶才會一致）
  var SCALE = BUF / BOX;
  var PAPER = '#FFFDF8';

  var SEG_POINTS = 24;                 // 一段最多幾個點
  var SEG_MS = 220;                    // 一段最多累積多久
  var MIN_DIST = 4;                    // 兩點最短距離（正規化單位）

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  function makeCanvas(size) {
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    return c;
  }

  /* ------------------------------------------------------------ 繪製 */

  function colorOf(i) { return Rules.COLORS[clamp(i | 0, 0, Rules.COLORS.length - 1)]; }
  function widthOf(i) { return Rules.WIDTHS[clamp(i | 0, 0, Rules.WIDTHS.length - 1)] * SCALE; }

  /** 把一筆畫到 2D context 上。committed=false 時是預覽（半透明一點） */
  function drawStroke(ctx, st, preview) {
    if (!st || !st.p || !st.p.length) return;
    var tool = st.t || 'pen';
    var lw = widthOf(st.w);
    var color = tool === 'erase' ? PAPER : colorOf(st.c);

    ctx.save();
    ctx.globalAlpha = preview ? 0.85 : 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;

    if (tool === 'fill') {
      /* 預覽時不做漫填（太慢），只畫一個小記號提示按下去會發生什麼 */
      if (!preview) floodFill(ctx.canvas, st.p[0] * SCALE, st.p[1] * SCALE, color);
      ctx.restore();
      return;
    }

    if (tool === 'rect') {
      var x = Math.min(st.p[0], st.p[2]) * SCALE, y = Math.min(st.p[1], st.p[3]) * SCALE;
      var ww = Math.abs(st.p[2] - st.p[0]) * SCALE, hh = Math.abs(st.p[3] - st.p[1]) * SCALE;
      if (st.f) ctx.fillRect(x, y, ww, hh);
      else ctx.strokeRect(x, y, ww, hh);
      ctx.restore();
      return;
    }

    if (tool === 'ellipse') {
      var cx = (st.p[0] + st.p[2]) / 2 * SCALE, cy = (st.p[1] + st.p[3]) / 2 * SCALE;
      var rx = Math.abs(st.p[2] - st.p[0]) / 2 * SCALE, ry = Math.abs(st.p[3] - st.p[1]) / 2 * SCALE;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2);
      if (st.f) ctx.fill(); else ctx.stroke();
      ctx.restore();
      return;
    }

    /* pen / brush / erase / line：都是折線 */
    if (st.p.length === 2) {
      /* 單點＝點一下，畫一個圓點 */
      ctx.beginPath();
      ctx.arc(st.p[0] * SCALE, st.p[1] * SCALE, lw / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(st.p[0] * SCALE, st.p[1] * SCALE);
    for (var i = 2; i + 1 < st.p.length; i += 2) {
      ctx.lineTo(st.p[i] * SCALE, st.p[i + 1] * SCALE);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ------------------------------------------------------- 油漆桶 */

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  /**
   * 掃描線漫填。跑在固定 1400×1400 的離線畫布上，
   * 所以同一串筆畫在任何裝置上都會填出同一塊區域。
   */
  function floodFill(canvas, sx, sy, hex) {
    var W = canvas.width, H = canvas.height;
    var x0 = Math.round(sx), y0 = Math.round(sy);
    if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    var img;
    try { img = ctx.getImageData(0, 0, W, H); } catch (e) { return; }
    var d = img.data;

    var idx = (y0 * W + x0) * 4;
    var tr = d[idx], tg = d[idx + 1], tb = d[idx + 2];
    var fill = hexToRgb(hex);
    if (Math.abs(tr - fill[0]) < 8 && Math.abs(tg - fill[1]) < 8 && Math.abs(tb - fill[2]) < 8) return;

    var TOL = 40;
    function same(i) {
      return Math.abs(d[i] - tr) <= TOL && Math.abs(d[i + 1] - tg) <= TOL && Math.abs(d[i + 2] - tb) <= TOL;
    }

    var stack = [[x0, y0]];
    var guard = 0;
    var maxSteps = W * H;
    while (stack.length && guard < maxSteps) {
      var pt = stack.pop();
      var x = pt[0], y = pt[1];
      var i = (y * W + x) * 4;
      if (!same(i)) continue;

      /* 往左右各掃到邊界 */
      var left = x;
      while (left > 0 && same((y * W + left - 1) * 4)) left--;
      var right = x;
      while (right < W - 1 && same((y * W + right + 1) * 4)) right++;

      for (var k = left; k <= right; k++) {
        var ki = (y * W + k) * 4;
        d[ki] = fill[0]; d[ki + 1] = fill[1]; d[ki + 2] = fill[2]; d[ki + 3] = 255;
        guard++;
        if (y > 0 && same(((y - 1) * W + k) * 4)) stack.push([k, y - 1]);
        if (y < H - 1 && same(((y + 1) * W + k) * 4)) stack.push([k, y + 1]);
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /* ------------------------------------------------------------ 主體 */

  function create(view, opts) {
    var o = opts || {};
    var layer = makeCanvas(BUF);
    var lctx = layer.getContext('2d', { willReadFrequently: true });
    var vctx = view.getContext('2d');

    var strokes = [];
    var redoStack = [];
    var enabled = false;
    var tool = 'pen';
    var color = 0;
    var width = 1;
    var filled = false;

    var live = null;          // 正在畫的筆畫
    var segStart = 0;         // 這一段是從第幾個點開始的
    var segAt = 0;
    var pointerId = null;
    var dirty = true;
    var raf = 0;

    function paperReset() {
      lctx.save();
      lctx.fillStyle = PAPER;
      lctx.fillRect(0, 0, BUF, BUF);
      lctx.restore();
    }

    function renderAll() {
      paperReset();
      for (var i = 0; i < strokes.length; i++) drawStroke(lctx, strokes[i], false);
      dirty = true;
    }

    /* 看得到的 canvas 依實際尺寸與像素密度調整，畫面才不會糊 */
    function resize() {
      var rect = view.getBoundingClientRect();
      var dpr = Math.min(3, w.devicePixelRatio || 1);
      var cw = Math.max(1, Math.round(rect.width * dpr));
      var ch = Math.max(1, Math.round(rect.height * dpr));
      if (view.width !== cw || view.height !== ch) {
        view.width = cw;
        view.height = ch;
      }
      dirty = true;
    }

    function paintFrame() {
      raf = 0;
      if (!dirty) return;
      dirty = false;
      var W = view.width, H = view.height;
      vctx.save();
      vctx.imageSmoothingEnabled = true;
      vctx.clearRect(0, 0, W, H);
      vctx.drawImage(layer, 0, 0, BUF, BUF, 0, 0, W, H);
      if (live && live.p.length >= 2) {
        /* 預覽直接畫在看得到的畫布上，比例跟 layer 一致 */
        vctx.scale(W / BUF, H / BUF);
        drawStroke(vctx, live, true);
      }
      vctx.restore();
    }

    function invalidate() {
      dirty = true;
      if (!raf) raf = w.requestAnimationFrame(paintFrame);
    }

    /* ---- 座標轉換：畫面像素 → 0..1000 ---- */
    function toBox(ev) {
      var rect = view.getBoundingClientRect();
      var x = (ev.clientX - rect.left) / Math.max(1, rect.width) * BOX;
      var y = (ev.clientY - rect.top) / Math.max(1, rect.height) * BOX;
      return [clamp(Math.round(x), 0, BOX), clamp(Math.round(y), 0, BOX)];
    }

    function emit(stroke) {
      if (typeof o.onStroke === 'function') o.onStroke(stroke);
    }

    /* ---- 送出目前累積的一段手繪 ---- */
    function flushSegment(final) {
      if (!live || live.t === 'line' || live.t === 'rect' || live.t === 'ellipse' || live.t === 'fill') return;
      var pts = live.p.slice(segStart);
      if (pts.length < 2) return;
      if (pts.length === 2 && !final && segStart > 0) return;
      emit({ t: live.t, c: live.c, w: live.w, f: 0, p: pts });
      /* 下一段從這一段的最後一點接著畫，線才不會斷 */
      segStart = live.p.length - 2;
      segAt = Date.now();
    }

    function start(ev) {
      if (!enabled) {
        if (typeof o.onBlocked === 'function') o.onBlocked();
        return;
      }
      if (pointerId !== null) return;
      pointerId = ev.pointerId;
      try { view.setPointerCapture(ev.pointerId); } catch (e) {}
      var p = toBox(ev);

      if (tool === 'fill') {
        var st = { t: 'fill', c: color, w: width, f: 0, p: [p[0], p[1]] };
        emit(st);
        if (typeof o.onSound === 'function') o.onSound('fill');
        pointerId = null;
        return;
      }

      live = {
        t: tool,
        c: color,
        w: tool === 'brush' ? Math.min(Rules.WIDTHS.length - 1, width + 1) : width,
        f: (tool === 'rect' || tool === 'ellipse') && filled ? 1 : 0,
        p: [p[0], p[1]]
      };
      segStart = 0;
      segAt = Date.now();
      if (typeof o.onSound === 'function') o.onSound(tool === 'erase' ? 'erase' : 'pen');
      invalidate();
      ev.preventDefault();
    }

    function move(ev) {
      if (pointerId === null || ev.pointerId !== pointerId || !live) return;
      var p = toBox(ev);

      if (live.t === 'line' || live.t === 'rect' || live.t === 'ellipse') {
        /* 形狀工具：只要起點與現在的位置 */
        live.p[2] = p[0];
        live.p[3] = p[1];
        live.p.length = 4;
        invalidate();
        ev.preventDefault();
        return;
      }

      var lx = live.p[live.p.length - 2], ly = live.p[live.p.length - 1];
      var dx = p[0] - lx, dy = p[1] - ly;
      if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) return;
      live.p.push(p[0], p[1]);
      if (typeof o.onSound === 'function') o.onSound('draw');

      var since = live.p.length / 2 - segStart / 2;
      if (since >= SEG_POINTS || Date.now() - segAt >= SEG_MS) flushSegment(false);

      /* 單筆太長就切一筆新的，避免超過規則的單筆點數上限 */
      if (live.p.length / 2 >= Rules.CONST.MAX_STROKE_POINTS - 2) {
        flushSegment(true);
        live.p = [p[0], p[1]];
        segStart = 0;
      }
      invalidate();
      ev.preventDefault();
    }

    function end(ev) {
      if (pointerId === null || (ev && ev.pointerId !== pointerId)) return;
      try { view.releasePointerCapture(pointerId); } catch (e) {}
      pointerId = null;
      if (!live) return;

      if (live.t === 'line' || live.t === 'rect' || live.t === 'ellipse') {
        if (live.p.length < 4) { live.p[2] = live.p[0]; live.p[3] = live.p[1]; }
        var a = live.p[0], b = live.p[1], c2 = live.p[2], d2 = live.p[3];
        if (Math.abs(c2 - a) + Math.abs(d2 - b) >= 3) {
          emit({ t: live.t, c: live.c, w: live.w, f: live.f, p: [a, b, c2, d2] });
          if (typeof o.onSound === 'function') o.onSound('shape');
        }
      } else {
        flushSegment(true);
      }
      live = null;
      invalidate();
    }

    function cancel() {
      if (pointerId !== null) { try { view.releasePointerCapture(pointerId); } catch (e) {} }
      pointerId = null;
      live = null;
      invalidate();
    }

    view.addEventListener('pointerdown', start);
    view.addEventListener('pointermove', move);
    view.addEventListener('pointerup', end);
    view.addEventListener('pointercancel', cancel);
    view.addEventListener('pointerleave', function (ev) {
      /* 手指滑出畫布就收筆，避免游標回來時接出一條莫名其妙的長線 */
      if (pointerId !== null && ev.pointerId === pointerId) end(ev);
    });
    view.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });

    var ro = w.ResizeObserver ? new ResizeObserver(function () { resize(); invalidate(); }) : null;
    if (ro) ro.observe(view);
    else w.addEventListener('resize', function () { resize(); invalidate(); });

    paperReset();
    resize();
    invalidate();

    return {
      BOX: BOX,
      canvas: view,

      setEnabled: function (v) {
        enabled = !!v;
        if (!enabled) cancel();
        view.classList.toggle('drawable', enabled);
      },
      isEnabled: function () { return enabled; },

      setTool: function (t) { if (Rules.TOOLS[t]) { tool = t; cancel(); } return tool; },
      getTool: function () { return tool; },
      setColor: function (i) { color = clamp(i | 0, 0, Rules.COLORS.length - 1); return color; },
      getColor: function () { return color; },
      setWidth: function (i) { width = clamp(i | 0, 0, Rules.WIDTHS.length - 1); return width; },
      getWidth: function () { return width; },
      setFilled: function (v) { filled = !!v; return filled; },
      isFilled: function () { return filled; },

      /** 整張換掉（進房、換題、復原、重新同步） */
      setStrokes: function (list) {
        strokes = (list || []).slice();
        renderAll();
        invalidate();
      },
      /** 增量：只把新的一筆畫上去，不用整張重算 */
      addStroke: function (st) {
        if (!st) return;
        strokes.push(st);
        drawStroke(lctx, st, false);
        invalidate();
      },
      count: function () { return strokes.length; },
      strokes: function () { return strokes.slice(); },

      clearLocal: function () { strokes = []; renderAll(); invalidate(); },

      /* 重做堆疊只存在本機：復原是把最後一筆退回來，重做就是再送一次 */
      pushRedo: function (st) { if (st) { redoStack.push(st); if (redoStack.length > 40) redoStack.shift(); } },
      popRedo: function () { return redoStack.pop() || null; },
      clearRedo: function () { redoStack = []; },
      redoCount: function () { return redoStack.length; },

      /** 匯出目前畫面（結算時顯示縮圖用） */
      toDataURL: function () {
        try { return layer.toDataURL('image/png'); } catch (e) { return ''; }
      },
      toBlob: function (callback) {
        try { layer.toBlob(callback, 'image/png'); }
        catch (e) { callback(null); }
      },

      resize: function () { resize(); invalidate(); },
      invalidate: invalidate,
      destroy: function () {
        if (ro) ro.disconnect();
        if (raf) w.cancelAnimationFrame(raf);
      }
    };
  }

  w.Paint = {
    create: create,
    BUF: BUF,
    PAPER: PAPER,
    drawStroke: drawStroke,
    floodFill: floodFill
  };
}(window));
