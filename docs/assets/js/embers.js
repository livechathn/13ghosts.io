// ════════════════════════════════════════════════════════════════════════
//  13GHOSTS · embers.js — red-only ember drift on OLED-black.
//  Forked from jezabel.xyz/assets/embers.js. Drifts a "temperature" color
//  between deep-blood, signal-red, and ember-orange — never magenta, never
//  cyan. Lower alpha + smaller bloom than jezabel — OLED-black needs less
//  fight to read clean. Self-injecting, idempotent, dependency-free.
// ════════════════════════════════════════════════════════════════════════
(function () {
  if (window.__ghostsEmbers) return;
  window.__ghostsEmbers = true;

  // Red-only palette: deep blood → signal red → ember orange.
  var COLD = [120,   0,   0];   // deep blood
  var MID  = [255,  26,  26];   // signal red
  var HOT  = [255,  90,  31];   // ember orange

  var Temp = (function () {
    var t = 0.4, target = 0.4;
    setInterval(function () { target = Math.random(); }, 4200 + Math.random() * 2800);
    function lerp(a, b, k) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }); }
    return {
      step: function () { t += (target - t) * 0.010; return t; },
      rgb:  function (v) { return v <= 0.5 ? lerp(COLD, MID, v / 0.5) : lerp(MID, HOT, (v - 0.5) / 0.5); }
    };
  })();

  function init() {
    if (document.getElementById('ghostsEmbers')) return;
    var c = document.createElement('canvas');
    c.id = 'ghostsEmbers';
    c.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    document.body.insertBefore(c, document.body.firstChild);
    var x = c.getContext('2d');

    var W, H, DPR, bits = [];
    function build() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = c.width  = window.innerWidth  * DPR;
      H = c.height = window.innerHeight * DPR;
      c.style.width  = window.innerWidth  + 'px';
      c.style.height = window.innerHeight + 'px';
      var n = Math.floor(window.innerWidth * window.innerHeight / 22000);
      bits = [];
      for (var i = 0; i < n; i++) bits.push({
        x: Math.random() * W, y: Math.random() * H,
        r: (Math.random() * 1.6 + 0.5) * DPR,
        vy: -(Math.random() * 0.22 + 0.05) * DPR,
        vx: (Math.random() - 0.5) * 0.10 * DPR,
        a: Math.random() * 0.45 + 0.20, ph: Math.random() * 6.28
      });
    }
    build();
    window.addEventListener('resize', build);

    var root = document.documentElement.style, t = 0;
    function frame() {
      t += 0.016;
      var v = Temp.step(), col = Temp.rgb(v);
      x.clearRect(0, 0, W, H);
      x.globalCompositeOperation = 'lighter';
      root.setProperty('--temp',      'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')');
      root.setProperty('--temp-soft', 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',.5)');
      for (var i = 0; i < bits.length; i++) {
        var b = bits[i];
        b.y += b.vy; b.x += b.vx + Math.sin(t + b.ph) * 0.14 * DPR;
        if (b.y < -4) { b.y = H + 4; b.x = Math.random() * W; }
        var fl = b.a * (0.6 + 0.4 * Math.sin(t * 2 + b.ph));
        x.beginPath(); x.arc(b.x, b.y, b.r, 0, 6.2832);
        x.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + fl + ')';
        x.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
