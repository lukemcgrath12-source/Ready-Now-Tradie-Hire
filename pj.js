/* Post a job forms (home and trade/suburb pages): send straight to info@tradiehire.net. */
(function(){
  Array.prototype.forEach.call(document.querySelectorAll('form.pj-form'), function(f){
    if(f.dataset.wired) return; f.dataset.wired = '1';
    var err = f.querySelector('.rq-err'), btn = f.querySelector('.rq-send'), done = f.querySelector('.pj-done');
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(f._gotcha && f._gotcha.value) return;
      var bad = Array.prototype.filter.call(f.querySelectorAll('[required]'), function(x){ return !x.value.trim(); });
      if(bad.length){ err.textContent = 'Please fill in the trade, suburb, job, your name and phone.'; bad[0].focus(); return; }
      err.textContent = ''; btn.disabled = true; btn.textContent = 'Posting...';
      var o = {_captcha: 'false', _template: 'table', _subject: 'Job posted: ' + f.trade.value + ' in ' + f.suburb.value, page: location.pathname};
      new FormData(f).forEach(function(v, k){ if(k !== '_gotcha') o[k] = v; });
      fetch('https://formsubmit.co/ajax/samlongmuir77@gmail.com', {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(o)})
        .then(function(r){ if(!r.ok) throw new Error(); Array.prototype.forEach.call(f.querySelectorAll('.rq-grid,.rq-send,.pj-note,.rq-err'), function(n){ n.hidden = true; }); done.hidden = false; done.focus(); })
        .catch(function(){ btn.disabled = false; btn.textContent = 'Post my job'; err.textContent = 'That did not send. Please try again or ring 0432 910 369.'; });
    });
  });
})();
