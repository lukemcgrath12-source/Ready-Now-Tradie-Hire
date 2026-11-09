/* How it works: chapters light up one by one as you scroll through the section.
   Reduced motion or no JS: the four steps show as a plain list beside the photo. */
(function () {
  var sec = document.getElementById('how');
  if (!sec || !sec.classList.contains('hs')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = sec.querySelectorAll('.hs-list li'), bar = sec.querySelector('.hs-bar');
  document.documentElement.classList.add('hs-js');
  var target = 0, raf = 0, active = -1;
  function progress() {
    var r = sec.getBoundingClientRect(), run = Math.max(1, sec.offsetHeight - window.innerHeight);
    return Math.min(1, Math.max(0, -r.top / run));
  }
  function tick() {
    raf = 0;
    var c = Math.min(items.length - 1, Math.floor(target * items.length));
    if (c !== active) { active = c; items.forEach(function (li, i) { li.classList.toggle('on', i === c); }); }
    if (bar) bar.style.setProperty('--hp', target.toFixed(4));
  }
  function onScroll() { target = progress(); if (!raf) raf = requestAnimationFrame(tick); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
