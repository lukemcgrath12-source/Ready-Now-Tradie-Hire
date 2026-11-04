/* Home hero: intro reveal on load, then a scroll-driven "tape measure" sequence.
   Writes one number (--p, 0 to 1) on the hero; CSS does the rest with transforms and clip-path.
   Desktop pins the hero for one extra screen; phones get the same tape without pinning.
   Reduced motion: no intro, no pin, static tape. */
(function () {
  var rh = document.querySelector('.rh');
  if (!rh || !rh.querySelector('.rh-stage')) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) { rh.classList.add('rh-static'); return; }

  document.documentElement.classList.add('rh-js');
  requestAnimationFrame(function () { requestAnimationFrame(function () { rh.classList.add('rh-go'); }); });

  var wide = window.matchMedia('(min-width: 960px) and (min-height: 640px)');
  function layout() { rh.classList.toggle('rh-pin', wide.matches); update(); }

  var queued = false;
  function update() {
    queued = false;
    var r = rh.getBoundingClientRect(), vh = window.innerHeight;
    var run = wide.matches ? Math.max(1, rh.offsetHeight - vh) : Math.max(1, vh * 0.9);
    var p = Math.min(1, Math.max(0, -r.top / run));
    var seg = function (a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); };
    var ease = function (x) { return 1 - Math.pow(1 - x, 3); };
    rh.style.setProperty('--p', p.toFixed(4));
    rh.style.setProperty('--a', ease(seg(0, .42)).toFixed(4));   /* text breaks apart, word grows */
    rh.style.setProperty('--t', ease(seg(.05, .72)).toFixed(4)); /* tape runs out */
    rh.style.setProperty('--f', ease(seg(.78, 1)).toFixed(4));   /* frame closes to a window */
    window.RH_HOLD = wide.matches && p > 0.02; /* hold the rolling word still while it is scaled up */
  }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(update); } }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (wide.addEventListener) wide.addEventListener('change', layout); else wide.addListener(layout);
  layout();
})();
