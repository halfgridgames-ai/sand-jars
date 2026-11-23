/* Half Grid Games studio splash. Drop-in: paste inside a <script> tag at the top of <body>,
   then call HGSplash.show({ onDone: startGame }) once on launch. Tap skips.
   To use an uploaded logo instead of the drawn one, set HGSplash.image to an image, GIF/WebP
   or MP4/WebM URL (or data URI) before calling show(). */
(function () {
  var COLORS = ['#2EC4B6', '#FF6F59', '#2EC4B6', '#FF6F59'];
  var THEMES = {
    dark: { bg: '#0E1A2B', ink: '#FFFFFF', sub: 'rgba(255,255,255,.55)', line: 'rgba(255,255,255,.2)' },
    light: { bg: '#FFF8EE', ink: '#0E1A2B', sub: 'rgba(14,26,43,.5)', line: 'rgba(14,26,43,.16)' }
  };
  var CSS =
    '.hgs{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;' +
    'font-family:"Avenir Next","Nunito","Segoe UI",system-ui,-apple-system,sans-serif;transition:opacity .45s ease;cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none}' +
    '.hgs.hgs-in{position:absolute}.hgs.hgs-out{opacity:0;pointer-events:none}.hgs-wait *{animation-play-state:paused!important}' +
    '.hgs svg{width:min(34vmin,132px);height:auto;overflow:visible}' +
    '.hgs .c{transform-box:fill-box;transform-origin:center;animation:hgsPop .38s cubic-bezier(.3,1.7,.5,1) both}' +
    '.hgs .f{transform-box:fill-box;transform-origin:center;animation:hgsFill .34s cubic-bezier(.2,1.5,.5,1) both}' +
    '.hgs .m{transform-origin:center;animation:hgsNudge .5s ease 1.3s both}' +
    '.hgs .w{display:flex;flex-direction:column;align-items:center;gap:6px;line-height:1}' +
    '.hgs .w1{font-size:min(8vmin,30px);font-weight:800;letter-spacing:.16em;padding-left:.16em}' +
    '.hgs .w2{font-size:min(3.6vmin,13px);font-weight:700;letter-spacing:.6em;padding-left:.6em}' +
    '.hgs .w span{display:inline-block;animation:hgsRise .42s cubic-bezier(.2,1.4,.5,1) both}' +
    '.hgs img,.hgs video{width:min(56vmin,240px);height:auto;border-radius:12%;animation:hgsImg .7s cubic-bezier(.2,1.3,.5,1) both}' +
    '@keyframes hgsPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}' +
    '@keyframes hgsFill{from{transform:scale(.2);opacity:0}to{transform:scale(1);opacity:1}}' +
    '@keyframes hgsNudge{0%,100%{transform:rotate(0) scale(1)}40%{transform:rotate(-4deg) scale(1.06)}70%{transform:rotate(2deg) scale(.98)}}' +
    '@keyframes hgsRise{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}' +
    '@keyframes hgsImg{from{transform:scale(.8);opacity:0}to{transform:none;opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){.hgs *{animation-duration:.01s!important;animation-delay:0s!important}}';

  function mark(t) {
    var s = 22, g = 6, out = '', fills = '';
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var x = c * (s + g), y = r * (s + g), d = r + c;
      out += '<rect class="c" x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="5" fill="none" stroke="' + t.line +
        '" stroke-width="2" style="animation-delay:' + d * 55 + 'ms"/>';
      if (d < 3) continue;
      // Lower-right half fills in from the corner; the diagonal cells fill exactly half, as triangles.
      var col = COLORS[Math.min(d - 3, 3)], delay = 'animation-delay:' + (620 + (6 - d) * 85) + 'ms';
      fills += d === 3
        ? '<path class="f" d="M' + (x + s - 5) + ' ' + y + 'Q' + (x + s) + ' ' + y + ' ' + (x + s) + ' ' + (y + 5) + 'V' + (y + s - 5) + 'Q' + (x + s) + ' ' + (y + s) + ' ' + (x + s - 5) + ' ' + (y + s) + 'H' + (x + 5) + 'Q' + x + ' ' + (y + s) + ' ' + (x + 2) + ' ' + (y + s - 3) + 'L' + (x + s - 3) + ' ' + (y + 2) + 'Q' + (x + s - 4) + ' ' + y + ' ' + (x + s - 5) + ' ' + y + 'Z" fill="' + col + '" style="' + delay + '"/>'
        : '<rect class="f" x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="5" fill="' + col + '" style="' + delay + '"/>';
    }
    return '<svg viewBox="-2 -2 110 110" aria-hidden="true"><g class="m">' + out + fills + '</g></svg>';
  }

  function letters(text, start, step) {
    return text.split('').map(function (ch, i) {
      return '<span style="animation-delay:' + (start + i * step) + 'ms">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
    }).join('');
  }

  var HG = window.HGSplash = {
    image: null,
    theme: 'dark',
    duration: 2500,
    show: function (opts) {
      opts = opts || {};
      if (!document.body) { document.addEventListener('DOMContentLoaded', function () { HG.show(opts); }); return; }
      var t = THEMES[opts.theme || HG.theme] || THEMES.dark, host = opts.container || document.body, done = false, timer;
      if (!document.getElementById('hgs-css')) {
        var st = document.createElement('style'); st.id = 'hgs-css'; st.textContent = CSS; document.head.appendChild(st);
      }
      var el = document.createElement('div');
      el.className = 'hgs' + (opts.container ? ' hgs-in' : '');
      el.style.background = t.bg; el.style.color = t.ink;
      el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Half Grid Games');
      var img = opts.image || HG.image;
      var word = '<div class="w"><div class="w1">' + letters('HALF GRID', 1000, 40) +
        '</div><div class="w2" style="color:' + t.sub + '">' + letters('GAMES', 1380, 50) + '</div></div>';
      if (img) {
        // Uploaded art replaces the drawn mark; the studio name stays as crisp text underneath.
        el.innerHTML = (/\.(mp4|webm)(\?|$)|^data:video/i.test(img)
          ? '<video src="' + img + '" autoplay muted playsinline></video>' : '<img src="' + img + '" alt="">') + word;
        var v = el.querySelector('video'); if (v) v.addEventListener('ended', finish);
      } else {
        el.innerHTML = mark(t) + word;
      }
      function finish() {
        if (done) return; done = true; clearTimeout(timer);
        el.classList.add('hgs-out');
        setTimeout(function () { el.remove(); if (opts.onDone) opts.onDone(); }, 450);
      }
      el.addEventListener('pointerdown', finish);
      host.appendChild(el);
      // The navy screen covers the game at once, but the animation waits for the page to finish loading
      // (or 1.5s at most), so a game that takes a moment to build its scene doesn't eat the animation.
      el.classList.add('hgs-wait');
      var started = false;
      function start() {
        if (started || done) return; started = true;
        requestAnimationFrame(function () {
          el.classList.remove('hgs-wait');
          timer = setTimeout(finish, opts.duration || (el.querySelector('video') ? 8000 : HG.duration));
        });
      }
      if (document.readyState === 'complete') start();
      else { window.addEventListener('load', start); setTimeout(start, 1500); }
      return finish;
    }
  };
})();
