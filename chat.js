/* Ready Now helper: a guided, rule-based assistant. No external services, no data stored. */
(function(){
  if(window.__rnChat) return; window.__rnChat = true;
  var PHONE = '0432 910 369', TEL = '+61432910369', EMAIL = 'info@tradiehire.net';
  var TRADES = ['Builders','Carpenters','Electricians','Plumbers','Roofers','Concreters','Tilers','Painters','Plasterers','Bricklayers','Landscapers','Labourers','Traffic Control'];
  var SING = {Builders:'builder',Carpenters:'carpenter',Electricians:'electrician',Plumbers:'plumber',Roofers:'roofer',Concreters:'concreter',Tilers:'tiler',Painters:'painter',Plasterers:'plasterer',Bricklayers:'bricklayer',Landscapers:'landscaper',Labourers:'labourer','Traffic Control':'traffic control'};
  var ALIAS = {sparky:'Electricians',sparkie:'Electricians',electric:'Electricians',power:'Electricians',lights:'Electricians',plumbing:'Plumbers',drain:'Plumbers',leak:'Plumbers','hot water':'Plumbers',tap:'Plumbers',chippy:'Carpenters',carpentry:'Carpenters',deck:'Carpenters',framing:'Carpenters',roof:'Roofers',gutter:'Roofers',tiling:'Tilers',tile:'Tilers',bathroom:'Tilers',paint:'Painters',concrete:'Concreters',driveway:'Concreters',slab:'Concreters',plaster:'Plasterers',gyprock:'Plasterers',brick:'Bricklayers',garden:'Landscapers',landscaping:'Landscapers',labour:'Labourers',labor:'Labourers','clean up':'Labourers',traffic:'Traffic Control',build:'Builders',reno:'Builders',renovation:'Builders',extension:'Builders'};
  var state = {step:'start', trade:''};

  var css = '#rnc-btn{position:fixed;right:20px;bottom:20px;z-index:900;display:flex;align-items:center;gap:10px;height:52px;padding:0 20px 0 16px;border:0;border-radius:999px;background:#14171A;color:#fff;font:600 15px/1 Poppins,system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 6px rgba(20,23,26,.15),0 14px 34px rgba(20,23,26,.28);transition:transform .25s cubic-bezier(.22,1,.36,1),background .2s}'+
  '#rnc-btn:hover{background:#000}#rnc-btn:active{transform:scale(.97)}#rnc-btn:focus-visible{outline:3px solid #1F6FA8;outline-offset:3px}#rnc-btn .d{width:8px;height:8px;border-radius:50%;background:#3DDC84}'+
  '#rnc-btn[aria-expanded="true"]{opacity:0;pointer-events:none;transform:scale(.9)}'+
  '#rnc{position:fixed;right:20px;bottom:20px;z-index:901;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100dvh - 40px));display:flex;flex-direction:column;background:#fff;border:1px solid #E2E6EB;border-radius:18px;overflow:hidden;font-family:Poppins,system-ui,sans-serif;box-shadow:0 4px 10px rgba(20,23,26,.08),0 30px 70px rgba(20,23,26,.25);opacity:0;transform:translateY(12px) scale(.98);transform-origin:bottom right;pointer-events:none;transition:opacity .25s,transform .3s cubic-bezier(.22,1,.36,1)}'+
  '#rnc.open{opacity:1;transform:none;pointer-events:auto}'+
  '#rnc header{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 18px;background:#14171A;color:#fff}#rnc header img{width:36px;height:36px;border-radius:10px;background:#fff;object-fit:contain;padding:3px}'+
  '#rnc header b{display:block;font-size:15px}#rnc header span{font-size:12.5px;color:rgba(255,255,255,.65)}'+
  '#rnc-x{margin-left:auto;width:40px;height:40px;border:0;border-radius:10px;background:transparent;color:#fff;cursor:pointer;font-size:22px;line-height:1}#rnc-x:hover{background:rgba(255,255,255,.1)}#rnc-x:focus-visible{outline:2px solid #8EC2E8}'+
  '#rnc-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#F5F6F8;scroll-behavior:smooth}'+
  '.rnc-m{max-width:86%;padding:10px 14px;border-radius:14px;font-size:14.5px;line-height:1.5;color:#14171A;background:#fff;border:1px solid #E2E6EB;align-self:flex-start;animation:rncIn .3s cubic-bezier(.22,1,.36,1)}'+
  '.rnc-m.me{align-self:flex-end;background:#1F6FA8;border-color:#1F6FA8;color:#fff}.rnc-m a{color:#175A8A;font-weight:600}'+
  '.rnc-q{display:flex;flex-wrap:wrap;gap:6px;animation:rncIn .3s cubic-bezier(.22,1,.36,1)}'+
  '.rnc-q button,.rnc-q a{min-height:36px;padding:0 13px;border-radius:999px;border:1px solid #C9D9E8;background:#fff;color:#175A8A;font:600 13.5px Poppins,system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;transition:background .2s,border-color .2s}'+
  '.rnc-q button:hover,.rnc-q a:hover{background:#EAF2F9;border-color:#1F6FA8}.rnc-q button:focus-visible,.rnc-q a:focus-visible{outline:2px solid #1F6FA8;outline-offset:2px}'+
  '.rnc-q .go{background:#1F6FA8;border-color:#1F6FA8;color:#fff}.rnc-q .go:hover{background:#175A8A}'+
  '#rnc form{display:flex;gap:8px;padding:12px;border-top:1px solid #E2E6EB;background:#fff}'+
  '#rnc input{flex:1;min-width:0;height:44px;border:1px solid #E2E6EB;border-radius:10px;padding:0 12px;font:15px Poppins,system-ui,sans-serif;color:#14171A}#rnc input:focus{outline:none;border-color:#1F6FA8;box-shadow:0 0 0 3px rgba(31,111,168,.18)}'+
  '#rnc form button{height:44px;padding:0 16px;border:0;border-radius:10px;background:#1F6FA8;color:#fff;font:600 14px Poppins,system-ui,sans-serif;cursor:pointer}#rnc form button:hover{background:#175A8A}#rnc form button:focus-visible{outline:2px solid #14171A;outline-offset:2px}'+
  '.rnc-t{display:inline-flex;gap:4px}.rnc-t i{width:6px;height:6px;border-radius:50%;background:#A3AAB3;animation:rncD 1s infinite}.rnc-t i:nth-child(2){animation-delay:.15s}.rnc-t i:nth-child(3){animation-delay:.3s}'+
  '@keyframes rncIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes rncD{0%,60%,100%{opacity:.3}30%{opacity:1}}'+
  '@media(max-width:560px){#rnc-btn{right:12px;bottom:12px;height:48px;padding:0 16px 0 14px}#rnc{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0;border:0}}'+
  '@media(prefers-reduced-motion:reduce){#rnc,#rnc-btn,.rnc-m,.rnc-q{transition:none;animation:none}}';
  var st = document.createElement('style'); st.id = 'rnc-css'; st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id = 'rnc-btn'; btn.type = 'button'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'rnc');
  btn.innerHTML = '<span class="d" aria-hidden="true"></span>Need a hand?';
  var box = document.createElement('section');
  box.id = 'rnc'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Ready Now helper'); box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<header><img src="logo-square-v2.png" alt="" width="36" height="36"><div><b>Ready Now helper</b><span>Find a tradie or list your trade</span></div><button id="rnc-x" type="button" aria-label="Close helper">&times;</button></header>'+
    '<div id="rnc-log" role="log" aria-live="polite"></div>'+
    '<form id="rnc-f" autocomplete="off"><label for="rnc-i" class="vh" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Type a message</label><input id="rnc-i" type="text" maxlength="120" placeholder="Type a trade, suburb or question"><button type="submit">Send</button></form>';
  document.body.appendChild(btn); document.body.appendChild(box);
  var log = box.querySelector('#rnc-log'), inp = box.querySelector('#rnc-i'), started = false;

  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function scroll(){ log.scrollTop = log.scrollHeight; }
  function me(t){ var d = document.createElement('div'); d.className = 'rnc-m me'; d.textContent = t; log.appendChild(d); scroll(); }
  function bot(html, chips, cb){
    var t = document.createElement('div'); t.className = 'rnc-m'; t.innerHTML = '<span class="rnc-t" aria-label="Typing"><i></i><i></i><i></i></span>'; log.appendChild(t); scroll();
    setTimeout(function(){
      t.innerHTML = html;
      if(chips && chips.length){
        var q = document.createElement('div'); q.className = 'rnc-q';
        chips.forEach(function(c){
          var el;
          if(c.href){ el = document.createElement('a'); el.href = c.href; if(c.go) el.className = 'go'; }
          else { el = document.createElement('button'); el.type = 'button'; el.addEventListener('click', function(){ q.remove(); me(c.label); c.fn(); }); }
          el.textContent = c.label; q.appendChild(el);
        });
        log.appendChild(q);
      }
      scroll(); if(cb) cb();
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
  }
  function menu(){
    state.step = 'start';
    return [{label:'Find a tradie', fn:askTrade},{label:'List my trade', fn:listTrade},{label:'Is it free?', fn:free},{label:'Contact Ready Now', fn:contact}];
  }
  function start(){ bot("G'day. I can help you find a local tradie or get your trade listed. What are you after?", menu()); }
  function askTrade(){
    state.step = 'trade';
    var top = ['Electricians','Plumbers','Carpenters','Builders','Roofers','Tilers','Painters','Labourers'];
    bot('What trade do you need? Pick one or type it in.', top.map(function(t){ return {label:t, fn:function(){ gotTrade(t); }}; }));
  }
  function gotTrade(t){
    state.trade = t; state.step = 'where';
    bot('Sweet, ' + esc(t.toLowerCase()) + '. Which suburb or area is the job in?', [{label:'Skip, show all', fn:function(){ results(''); }}]);
  }
  function results(where){
    state.step = 'done';
    var url = 'members.html?trade=' + encodeURIComponent(state.trade) + (where ? '&q=' + encodeURIComponent(where) : '');
    bot('Here you go. You can check each tradie\'s profile and call them direct. Ask about licences and insurance before work starts.', [
      {label:'Show ' + state.trade.toLowerCase() + (where ? ' near ' + where : ''), href:url, go:true},
      {label:'Search another trade', fn:askTrade}
    ]);
  }
  function listTrade(){ bot('Listing is free. You get your own profile with your photo, trade and area, and customers call you direct. No lead fees.', [{label:'List my trade free', href:'join.html', go:true},{label:'Something else', fn:function(){ bot('No worries. What else can I help with?', menu()); }}]); }
  function free(){ bot('Yes. Searching, calling a tradie and listing your trade are all free right now. There are no booking fees.', [{label:'Find a tradie', fn:askTrade},{label:'List my trade', fn:listTrade}]); }
  function contact(){ bot('You can reach Ready Now on <a href="tel:' + TEL + '">' + PHONE + '</a> or <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.', [{label:'Contact page', href:'contact.html'},{label:'Back to start', fn:function(){ bot('What else can I help with?', menu()); }}]); }
  function check(){ bot('Good question. Each tradie lists their own details, so ask for their licence number and proof of insurance before work starts. You can check NSW licences on the Service NSW website.', [{label:'Find a tradie', fn:askTrade}]); }

  function matchTrade(v){
    v = ' ' + v.toLowerCase() + ' ';
    for(var i = 0; i < TRADES.length; i++){ if(v.indexOf(TRADES[i].toLowerCase()) > -1 || v.indexOf(SING[TRADES[i]]) > -1) return TRADES[i]; }
    for(var k in ALIAS){ if(v.indexOf(k) > -1) return ALIAS[k]; }
    return '';
  }
  function handle(text){
    var v = text.toLowerCase();
    var intent = /\b(free|cost|price|fee|fees|pay|charge|list|join|sign ?up|register|contact|phone|call|email|number|licen[cs]e|insur|verified|legit|help|hi|hey|hello|g'?day)\b/.test(v) || v.indexOf('?') > -1;
    if(state.step === 'where' && !matchTrade(v) && !intent){
      if(text.trim().split(/\s+/).length <= 4){ results(text.trim()); return; }
      bot('Just the suburb or postcode is perfect, like Miranda or 2228.', [{label:'Skip, show all', fn:function(){ results(''); }}]); return;
    }
    var t = matchTrade(v);
    if(t){ gotTrade(t); return; }
    if(/\b(free|cost|price|fee|fees|pay|charge)\b/.test(v)){ free(); return; }
    if(/\b(list|join|sign ?up|register|tradie here|get work|more work|profile)\b/.test(v)){ listTrade(); return; }
    if(/\b(contact|phone|call|email|number|talk|speak)\b/.test(v)){ contact(); return; }
    if(/\b(licen[cs]e|insur|verified|trust|legit|safe)\b/.test(v)){ check(); return; }
    if(/\b(hi|hey|hello|g'?day)\b/.test(v)){ bot('Hey. What can I help with?', menu()); return; }
    bot('Sorry, I didn\'t quite get that. I can help you find a tradie, list your trade, or put you in touch with the team.', menu());
  }
  box.querySelector('#rnc-f').addEventListener('submit', function(e){
    e.preventDefault(); var t = inp.value.trim(); if(!t) return; inp.value = '';
    log.querySelectorAll('.rnc-q').forEach(function(q){ if(!q.querySelector('a')) q.remove(); });
    me(t); handle(t);
  });

  var lastFocus = null;
  function open(){ lastFocus = document.activeElement; box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true'); if(!started){ started = true; start(); } setTimeout(function(){ inp.focus({preventScroll:true}); }, 60); }
  function close(){ box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); (lastFocus && lastFocus.focus ? lastFocus : btn).focus({preventScroll:true}); }
  btn.addEventListener('click', open);
  box.querySelector('#rnc-x').addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && box.classList.contains('open')) close(); });
})();
