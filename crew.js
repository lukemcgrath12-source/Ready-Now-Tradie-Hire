/* The Ready Now crew, shown in the directory alongside self-listed tradies.
   Details come from the original Ready Now site. Calls go to the Ready Now number. */
window.RN_CREW = [
  {id:'crew-lewis-slatter', name:'Lewis Slatter', trade:'Plumbers', area:'Sydney metro', bio:'Licensed plumber, drainer and gasfitter. 10+ years on the tools.', photo:'/crew-lewis-slatter.webp'},
  {id:'crew-jake-littlewood', name:'Jake Littlewood', trade:'Tilers', area:'Sydney metro', bio:'Tiling certificate, waterproofing included. 10+ years on the tools.', photo:'/crew-jake-littlewood.webp'},
  {id:'crew-hayden-budd', name:'Hayden Budd', trade:'Electricians', area:'Sydney metro', bio:'Licensed electrician with a white card. 7 years on the tools.', photo:'/crew-hayden-budd.webp'},
  {id:'crew-macca-needham', name:'Macca Needham', trade:'Roofers', area:'Sydney metro', bio:'Roofing licence and working at heights. 5 years on the tools.', photo:'/crew-macca-needham.webp'},
  {id:'crew-teika-kakahi', name:'Teika Kakahi', trade:'Roofers', business:'Apprentice roofer', area:'Sydney metro', bio:'First year apprentice roofer. Working at heights ticket in progress.', photo:'/crew-teika-kakahi.webp'},
  {id:'crew-anfal-mehdaoui', name:'Anfal Mehdaoui', trade:'Traffic Control', area:'Sydney metro', bio:'White card, blue card and yellow card.', photo:'/crew-anfal-mehdaoui.webp'},
  {id:'crew-laurence-warnimont', name:'Laurence Warnimont', trade:'Labourers', business:'General labourer and forklift', area:'Sydney metro', bio:"White card, first aid, forklift (LF) and driver's licence. 2+ years on the tools.", photo:'/crew-laurence-warnimont.webp'}
].map(function (m) { m.crew = true; m.phone = '0432 910 369'; m.tel = '+61432910369'; return m; });
