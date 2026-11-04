/* Hero signature: the trade word rolls through trades and snaps into place.
   One clock (GSAP ticker via delayedCall/timelines). Paused off screen and when the tab is hidden.
   Reduced motion: stays on "tradies". */
(function () {
  var roll = document.getElementById('roll');
  if (!roll || !window.gsap) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;
  var trades = ['electricians', 'plumbers', 'carpenters', 'tilers', 'roofers', 'concreters', 'painters', 'labourers', 'bricklayers', 'scaffolders'];
  var input = document.getElementById('srTrade');
  var pops = Array.prototype.slice.call(document.querySelectorAll('.rh-pop a'));
  var basePh = input ? input.getAttribute('placeholder') : '';
  var cur = roll.querySelector('.tword-w');
  var i = -1, onScreen = true, call = null, busy = false;
  var cap = function (w) { return w.charAt(0).toUpperCase() + w.slice(1); };

  function sync(word) {
    if (input && document.activeElement !== input && !input.value) input.setAttribute('placeholder', cap(word));
    pops.forEach(function (a) { a.classList.toggle('is-on', a.textContent.trim().toLowerCase() === word); });
  }
  function next() {
    if (!onScreen || document.hidden || window.RH_HOLD) { schedule(); return; }
    busy = true;
    i = (i + 1) % trades.length;
    var word = trades[i];
    var nxt = document.createElement('span');
    nxt.className = 'tword-w'; nxt.textContent = word;
    roll.appendChild(nxt);
    var tl = gsap.timeline({ onComplete: function () { cur.remove(); cur = nxt; busy = false; schedule(); } });
    tl.to(cur, { yPercent: -110, duration: 0.55, ease: 'power3.in' }, 0)
      .fromTo(nxt, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.18)
      .fromTo(roll, { '--tick': 0.2 }, { '--tick': 1, duration: 0.6, ease: 'back.out(2)' }, 0.3)
      .call(function () { sync(word); }, null, 0.3);
  }
  function schedule() { if (call) call.kill(); call = gsap.delayedCall(2.4, next); }

  roll.addEventListener('click', function () {
    var w = cur.textContent.trim();
    if (w === 'tradies' || !input) return;
    input.value = cap(w); input.focus();
  });
  if (input) input.addEventListener('blur', function () { if (!input.value) input.setAttribute('placeholder', basePh); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; }, { threshold: 0.1 }).observe(roll);
  }
  gsap.delayedCall(1.4, next);
})();
