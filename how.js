/* How it works: one continuous video scrubbed by scroll. Chapters light up as the video plays through each scene.
   Reduced motion or no JS: the four steps show as a plain list beside the poster frame. */
(function () {
  var sec = document.getElementById('how');
  if (!sec || !sec.classList.contains('hs')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var vid = sec.querySelector('.hs-vid'), items = sec.querySelectorAll('.hs-list li'), bar = sec.querySelector('.hs-bar');
  var cuts = [0, 3.33, 5.33, 7.5]; /* scene starts in seconds, one per chapter */
  document.documentElement.classList.add('hs-js');

  var loaded = false;
  function load() { if (loaded) return; loaded = true; var w = vid.getAttribute('data-webm'); vid.src = (w && vid.canPlayType('video/webm; codecs="vp9"')) ? w : vid.getAttribute('data-src'); vid.preload = 'auto'; vid.load(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(sec);
  } else load();

  var target = 0, shown = -1, raf = 0, active = -1;
  function progress() {
    var r = sec.getBoundingClientRect(), run = Math.max(1, sec.offsetHeight - window.innerHeight);
    return Math.min(1, Math.max(0, -r.top / run));
  }
  function tick() {
    raf = 0;
    var d = vid.duration;
    if (d && isFinite(d)) {
      var t = Math.min(d - 0.05, target * d);
      if (Math.abs(t - shown) > 0.02) { try { vid.currentTime = t; } catch (e) {} shown = t; }
      var c = 0; for (var i = 0; i < cuts.length; i++) if (t >= cuts[i]) c = i;
      if (c !== active) { active = c; items.forEach(function (li, i) { li.classList.toggle('on', i === c); }); }
    }
    if (bar) bar.style.setProperty('--hp', target.toFixed(4));
  }
  function onScroll() { target = progress(); if (!raf) raf = requestAnimationFrame(tick); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  vid.addEventListener('loadedmetadata', onScroll);
  onScroll();
})();
