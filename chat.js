/* Ready Now helper: a guided, rule-based assistant. No external services, no data stored. */
(function(){
  if(window.__rnChat) return; window.__rnChat = true;
  var PHONE = '0432 910 369', TEL = '+61432910369', EMAIL = 'info@tradiehire.net';
  var TRADES = ['Builders','Carpenters','Electricians','Plumbers','Roofers','Concreters','Tilers','Painters','Plasterers','Bricklayers','Landscapers','Labourers','Traffic Control'];
  var SING = {Builders:'builder',Carpenters:'carpenter',Electricians:'electrician',Plumbers:'plumber',Roofers:'roofer',Concreters:'concreter',Tilers:'tiler',Painters:'painter',Plasterers:'plasterer',Bricklayers:'bricklayer',Landscapers:'landscaper',Labourers:'labourer','Traffic Control':'traffic control'};
  var ALIAS = {sparky:'Electricians',sparkie:'Electricians',electric:'Electricians',power:'Electricians',lights:'Electricians',plumbing:'Plumbers',drain:'Plumbers',leak:'Plumbers','hot water':'Plumbers',tap:'Plumbers',chippy:'Carpenters',carpentry:'Carpenters',deck:'Carpenters',framing:'Carpenters',roof:'Roofers',gutter:'Roofers',tiling:'Tilers',tile:'Tilers',bathroom:'Tilers',paint:'Painters',concrete:'Concreters',driveway:'Concreters',slab:'Concreters',plaster:'Plasterers',gyprock:'Plasterers',brick:'Bricklayers',garden:'Landscapers',landscaping:'Landscapers',labour:'Labourers',labor:'Labourers','clean up':'Labourers',traffic:'Traffic Control',build:'Builders',reno:'Builders',renovation:'Builders',extension:'Builders'};
  var state = {step:'start', trade:''};

  var G = 'linear-gradient(135deg,#175A8A 0%,#1F6FA8 45%,#4894C4 100%)';
  var css = '#rnc-btn{position:fixed;right:20px;bottom:20px;z-index:900;display:flex;align-items:center;gap:10px;height:56px;padding:0 22px 0 8px;border:0;border-radius:999px;background:#fff;color:#14171A;font:600 15px/1 Poppins,system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 6px rgba(20,23,26,.1),0 16px 40px rgba(23,90,138,.25);transition:transform .25s cubic-bezier(.22,1,.36,1),opacity .2s}'+
  '#rnc-btn .ic{width:42px;height:42px;border-radius:50%;background:'+G+';display:flex;align-items:center;justify-content:center;color:#fff}'+
  '#rnc-btn:hover{transform:translateY(-2px)}#rnc-btn:active{transform:scale(.97)}#rnc-btn:focus-visible{outline:3px solid #1F6FA8;outline-offset:3px}'+
  '#rnc-btn[aria-expanded="true"]{opacity:0;pointer-events:none;transform:scale(.9)}'+
  '#rnc{position:fixed;right:20px;bottom:20px;z-index:901;width:min(390px,calc(100vw - 24px));height:min(600px,calc(100dvh - 40px));display:flex;flex-direction:column;border:2px solid transparent;border-radius:24px;background:linear-gradient(#fff,#fff) padding-box,linear-gradient(160deg,#175A8A,#4894C4 55%,#9CCBEE) border-box;overflow:hidden;font-family:Poppins,system-ui,sans-serif;box-shadow:0 4px 10px rgba(20,23,26,.06),0 30px 70px rgba(23,90,138,.28);opacity:0;transform:translateY(14px) scale(.98);transform-origin:bottom right;pointer-events:none;transition:opacity .25s,transform .35s cubic-bezier(.22,1,.36,1)}'+
  '#rnc.open{opacity:1;transform:none;pointer-events:auto}'+
  '#rnc header{display:flex;align-items:center;gap:12px;padding:16px 14px 14px 18px;border-bottom:1px solid #EEF0F3}'+
  '.rnc-av{width:28px;height:28px;flex-shrink:0;border-radius:50%;background:'+G+';display:flex;align-items:center;justify-content:center;color:#fff}'+
  '.rnc-av svg{stroke:#fff!important;fill:none!important;width:60%;height:60%}#rnc header .rnc-av{width:40px;height:40px}#rnc header b{display:block;font-size:15.5px;color:#14171A;letter-spacing:-.01em}#rnc header span{display:flex;align-items:center;gap:6px;font-size:12.5px;color:#6B717A}#rnc header span i{width:7px;height:7px;border-radius:50%;background:#3DDC84}'+
  '#rnc-x{margin-left:auto;width:40px;height:40px;border:0;border-radius:12px;background:transparent;color:#6B717A;cursor:pointer;display:flex;align-items:center;justify-content:center}#rnc-x:hover{background:#F2F4F7;color:#14171A}#rnc-x:focus-visible{outline:2px solid #1F6FA8}'+
  '#rnc-log{flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}'+
  '.rnc-row{display:flex;align-items:flex-end;gap:8px;max-width:92%;animation:rncIn .35s cubic-bezier(.22,1,.36,1)}.rnc-row>div{display:flex;flex-direction:column;gap:8px;min-width:0}'+
  '.rnc-m{padding:11px 15px;border-radius:16px 16px 16px 6px;font-size:14.5px;line-height:1.5;color:#14171A;background:#F1F3F6}'+
  '.rnc-m.me{align-self:flex-end;max-width:80%;border-radius:16px 16px 6px 16px;background:'+G+';color:#fff;animation:rncIn .3s cubic-bezier(.22,1,.36,1)}.rnc-m a{color:#175A8A;font-weight:600}'+
  '.rnc-q{display:flex;flex-wrap:wrap;gap:8px;padding-left:36px;animation:rncIn .35s cubic-bezier(.22,1,.36,1)}'+
  '.rnc-q button,.rnc-q a{min-height:38px;padding:0 15px;border-radius:999px;border:1.5px solid #8FB9DC;background:#fff;color:#1F6FA8;font:500 14px Poppins,system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;transition:background .2s,border-color .2s,color .2s}'+
  '.rnc-q button:hover,.rnc-q a:hover{background:#EAF2F9;border-color:#1F6FA8}.rnc-q button:focus-visible,.rnc-q a:focus-visible,.rnc-l button:focus-visible,.rnc-l a:focus-visible{outline:2px solid #1F6FA8;outline-offset:2px}'+
  '.rnc-q .go{background:'+G+';border:0;color:#fff;font-weight:600}.rnc-q .go:hover{background:#175A8A}'+
  '.rnc-l{background:#fff;border:1px solid #E6E9ED;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(20,23,26,.04),0 6px 16px rgba(23,90,138,.08);margin-left:36px;width:calc(100% - 36px);max-width:300px;animation:rncIn .35s cubic-bezier(.22,1,.36,1)}'+
  '.rnc-l button,.rnc-l a{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:46px;padding:0 16px;border:0;border-top:1px solid #EEF0F3;background:#fff;color:#14171A;font:500 14px Poppins,system-ui,sans-serif;text-align:left;cursor:pointer;text-decoration:none;transition:background .2s}'+
  '.rnc-l>:first-child{border-top:0}.rnc-l button:hover,.rnc-l a:hover{background:#F5F8FB}.rnc-l svg{flex-shrink:0;color:#6B717A}'+
  '#rnc form{display:flex;align-items:center;gap:8px;margin:0 12px 12px;padding:6px 6px 6px 16px;border:1px solid #E2E6EB;border-radius:999px;background:#fff;transition:border-color .2s,box-shadow .2s}'+
  '#rnc form:focus-within{border-color:#1F6FA8;box-shadow:0 0 0 3px rgba(31,111,168,.15)}'+
  '#rnc input{flex:1;min-width:0;height:40px;border:0;background:transparent;font:15px Poppins,system-ui,sans-serif;color:#14171A}#rnc input:focus{outline:none}#rnc input::placeholder{color:#8A9099}'+
  '#rnc-s{width:42px;height:42px;flex-shrink:0;border:0;border-radius:50%;background:'+G+';color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .2s,transform .2s}#rnc-s:disabled{background:#E6E9ED;color:#A3AAB3;cursor:default}#rnc-s:not(:disabled):active{transform:scale(.94)}#rnc-s:focus-visible{outline:2px solid #14171A;outline-offset:2px}'+
  '.rnc-note{text-align:center;font-size:11.5px;color:#8A9099;padding:0 12px 10px}'+
  '.rnc-t{display:inline-flex;gap:4px;padding:4px 0}.rnc-t i{width:6px;height:6px;border-radius:50%;background:#A3AAB3;animation:rncD 1s infinite}.rnc-t i:nth-child(2){animation-delay:.15s}.rnc-t i:nth-child(3){animation-delay:.3s}'+
  '@keyframes rncIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes rncD{0%,60%,100%{opacity:.3}30%{opacity:1}}'+
  '@media(max-width:560px){#rnc-btn{right:12px;bottom:12px;height:52px;padding:0 18px 0 6px}#rnc-btn .ic{width:40px;height:40px}#rnc{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0;border-width:0}}'+
  '@media(prefers-reduced-motion:reduce){#rnc,#rnc-btn,.rnc-row,.rnc-m,.rnc-q,.rnc-l{transition:none;animation:none}}';
  var HAT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 18h18"/><path d="M5 18v-2a7 7 0 0 1 14 0v2"/><path d="M10 9.5V7h4v2.5"/></svg>', CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';
  var st = document.createElement('style'); st.id = 'rnc-css'; st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id = 'rnc-btn'; btn.type = 'button'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'rnc');
  btn.innerHTML = '<span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg></span>Need a hand?';
  var box = document.createElement('section');
  box.id = 'rnc'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Ready Now helper'); box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<header><span class="rnc-av">' + HAT + '</span><div><b>Ready Now helper</b><span><i></i>Here to help you find a tradie</span></div><button id="rnc-x" type="button" aria-label="Close helper"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>'+
    '<div id="rnc-log" role="log" aria-live="polite"></div>'+
    '<form id="rnc-f" autocomplete="off"><label for="rnc-i" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Type a message</label><input id="rnc-i" type="text" maxlength="120" placeholder="Type a trade, suburb or question"><button id="rnc-s" type="submit" aria-label="Send" disabled><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9z"/></svg></button></form><p class="rnc-note">Automated helper. For anything else call 0432 910 369.</p>';
  document.body.appendChild(btn); document.body.appendChild(box);
  var log = box.querySelector('#rnc-log'), inp = box.querySelector('#rnc-i'), send = box.querySelector('#rnc-s'), started = false;
  inp.addEventListener('input', function(){ send.disabled = !inp.value.trim(); });

  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function scroll(){ log.scrollTop = log.scrollHeight; }
  function me(t){ var d = document.createElement('div'); d.className = 'rnc-m me'; d.textContent = t; log.appendChild(d); scroll(); }
  function bot(html, chips, cb, asList){
    var row = document.createElement('div'); row.className = 'rnc-row';
    row.innerHTML = '<span class="rnc-av" aria-hidden="true">' + HAT.replace('width="18" height="18"', 'width="15" height="15"') + '</span><div><div class="rnc-m"><span class="rnc-t" aria-label="Typing"><i></i><i></i><i></i></span></div></div>';
    log.appendChild(row); scroll(); var t = row.querySelector('.rnc-m');
    setTimeout(function(){
      t.innerHTML = html;
      if(chips && chips.length){
        var q = document.createElement('div'); q.className = asList ? 'rnc-l' : 'rnc-q';
        chips.forEach(function(c){
          var el;
          if(c.href){ el = document.createElement('a'); el.href = c.href; if(c.go) el.className = 'go'; }
          else { el = document.createElement('button'); el.type = 'button'; el.addEventListener('click', function(){ q.remove(); me(c.label); c.fn(); }); }
          el.textContent = c.label; if(asList) el.insertAdjacentHTML('beforeend', CHEV); q.appendChild(el);
        });
        log.appendChild(q);
      }
      scroll(); if(cb) cb();
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500);
  }
  function menu(){
    state.step = 'start';
    return [{label:'Find a tradie', fn:askTrade},{label:'List my trade', fn:listTrade},{label:'Is it free?', fn:free},{label:'Contact Ready Now', fn:contact}];
  }
  function start(){ bot("G'day. I can help you find a local tradie or get your trade listed. What are you after?", menu(), null, true); }
  function askTrade(){
    state.step = 'trade';
    var top = ['Electricians','Plumbers','Carpenters','Builders','Roofers','Tilers','Painters','Labourers'];
    bot('Sure. What trade do you need? Pick one or type it in.', top.map(function(t){ return {label:t, fn:function(){ gotTrade(t); }}; }));
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
  function listTrade(){ bot('Listing is free. You get your own profile with your photo, trade and area, and customers call you direct. No lead fees.', [{label:'List my trade free', href:'join.html', go:true},{label:'Something else', fn:function(){ bot('No worries. What else can I help with?', menu(), null, true); }}]); }
  function free(){ bot('Yes. Searching, calling a tradie and listing your trade are all free right now. There are no booking fees.', [{label:'Find a tradie', fn:askTrade},{label:'List my trade', fn:listTrade}]); }
  function contact(){ bot('You can reach Ready Now on <a href="tel:' + TEL + '">' + PHONE + '</a> or <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.', [{label:'Contact page', href:'contact.html'},{label:'Back to start', fn:function(){ bot('What else can I help with?', menu(), null, true); }}]); }
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
    if(/\b(hi|hey|hello|g'?day)\b/.test(v)){ bot('Hey. What can I help with?', menu(), null, true); return; }
    bot('Sorry, I didn\'t quite get that. I can help you find a tradie, list your trade, or put you in touch with the team.', menu(), null, true);
  }
  box.querySelector('#rnc-f').addEventListener('submit', function(e){
    e.preventDefault(); var t = inp.value.trim(); if(!t) return; inp.value = '';
    log.querySelectorAll('.rnc-q,.rnc-l').forEach(function(q){ if(!q.querySelector('a')) q.remove(); }); send.disabled = true;
    me(t); handle(t);
  });

  var lastFocus = null;
  function open(){ lastFocus = document.activeElement; box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true'); if(!started){ started = true; start(); } setTimeout(function(){ inp.focus({preventScroll:true}); }, 60); }
  function close(){ box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); (lastFocus && lastFocus.focus ? lastFocus : btn).focus({preventScroll:true}); }
  btn.addEventListener('click', open);
  box.querySelector('#rnc-x').addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && box.classList.contains('open')) close(); });
})();
