/* Trade and suburb pages: list matching tradies (crew + self-listed), with "Ready now today" badges. */
(function(){
  var box = document.getElementById('areaList'); if(!box) return;
  var trade = box.getAttribute('data-trade'), area = (box.getAttribute('data-area') || '').toLowerCase();
  var SING = {Builders:'Builder',Carpenters:'Carpenter',Electricians:'Electrician',Plumbers:'Plumber',Roofers:'Roofer',Concreters:'Concreter',Tilers:'Tiler',Painters:'Painter',Labourers:'Labourer'};
  function mk(t, c, x){ var n = document.createElement(t); if(c) n.className = c; if(x != null) n.textContent = x; return n; }
  Promise.all([
    fetch('/api/members').then(function(r){ return r.ok ? r.json() : {members: []}; }).then(function(d){ return d.members || []; }).catch(function(){ return []; }),
    window.RN ? RN.available() : Promise.resolve(new Set())
  ]).then(function(x){
    var hide = window.RN_HIDE || [];
    var all = (window.RN_CREW || []).concat(x[0].filter(function(m){ return hide.indexOf(m.id) < 0; }));
    var list = all.filter(function(m){ return m.trade === trade; });
    var local = list.filter(function(m){ return area && String(m.area || '').toLowerCase().indexOf(area) > -1; });
    var wide = list.filter(function(m){ return local.indexOf(m) < 0 && /sydney|metro|wide/i.test(m.area || ''); });
    var show = local.concat(wide);
    box.textContent = '';
    if(!show.length){
      box.appendChild(mk('p', 'ar-empty', 'No ' + trade.toLowerCase() + ' are listed for this area yet. Post the job below and Ready Now will line someone up.'));
      return;
    }
    show.forEach(function(m){
      var a = mk('a', 'ar-card'); a.href = '/members?id=' + encodeURIComponent(m.id);
      if(m.photo){ var im = mk('img', 'ar-ph'); im.src = m.photo; im.alt = ''; im.loading = 'lazy'; im.width = 64; im.height = 64; a.appendChild(im); }
      var t = mk('div', 'ar-tx');
      t.appendChild(mk('span', 'ar-n', m.name));
      t.appendChild(mk('span', 'ar-k', (SING[m.trade] || m.trade) + ' · ' + (m.area || 'Sydney')));
      if(x[1].has(m.id)) t.appendChild(mk('span', 'rn-today', 'Ready now today'));
      a.appendChild(t); a.appendChild(mk('span', 'ar-go', 'View profile →'));
      box.appendChild(a);
    });
  });
})();
