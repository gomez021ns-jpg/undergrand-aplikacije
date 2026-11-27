// Punkman — jezici: srpski (latinica) i engleski. Svi tekstovi igre su ovde, osim naziva tabli i neprijatelja (polje `en` u config.js).
// Jezik: ?lang=en ili ?lang=sr u adresi, pa sačuvan izbor (localStorage `punkman-jezik`), pa jezik pregledača
// (srpski, hrvatski, bosanski, crnogorski → srpski; sve ostalo → engleski). Dugme u zaglavlju menja jezik.
// Statični HTML: data-t (tekst), data-t-html (HTML), data-t-title, data-t-aria. U tekstu {ime} se zamenjuje vrednošću.
const LANGS=['sr','en'];
let LANG=(()=>{
  try{
    const q=new URLSearchParams(location.search).get('lang'); if(LANGS.includes(q)) return q;
    const s=localStorage.getItem('punkman-jezik'); if(LANGS.includes(s)) return s;
  }catch(e){}
  const l=[...(navigator.languages||[]),navigator.language||''].map(x=>x.toLowerCase().split('-')[0]);
  return l.some(x=>['sr','hr','bs','sh','cnr','me'].includes(x))?'sr':'en';
})();
const STR={
  // zaglavlje i dugmad
  verTitle:['Šta je novo',"What's new"],
  slogan:['Tri akorda, tri table, nula kompromisa.','Three chords, three boards, zero compromise.'],
  lang:['English','Srpski'], langTitle:['Prebaci na engleski','Switch to Serbian'],
  musicOn:['Muzika: uklj.','Music: on'], musicOff:['Muzika: isklj.','Music: off'],
  soundOn:['Zvuk: uklj.','Sound: on'], soundOff:['Zvuk: isklj.','Sound: off'],
  fsPun:['Pun ekran','Fullscreen'], fsIzadji:['Izađi','Exit'], fsF11:['Pritisni F11','Press F11'],
  fsIzadjiNaslov:['Izađi iz punog ekrana (Esc)','Exit fullscreen (Esc)'], fsF11Naslov:['Izlaz iz punog ekrana: taster F11','Exit fullscreen: press F11'],
  // skor, pojačalo, tasteri
  score:['Skor','Score'], hi:['Rekord','High score'], lives:['Životi','Lives'], board:['Tabla','Board'],
  boardAria:['Tabla igre','Game board'],
  amp:['Pojačalo','Amp'], bonuses:['Bonusi','Bonuses'], shelfTitle:['Skupljeni bonusi','Collected bonuses'], collected:[' — skupljeno',' — collected'],
  up:['Gore','Up'], left:['Levo','Left'], down:['Dole','Down'], right:['Desno','Right'],
  keys:['Strelice ili WASD · P pauza · M zvuk · N muzika · na telefonu prevuci prstom po tabli','Arrows or WASD · P pause · M sound · N music · on a phone, swipe across the board'],
  // listovi
  rekH:['Rekordi','High scores'], rekSub:['deset najboljih','top ten'],
  rekHint:['Ko na kraju igre uđe među deset najboljih, upisuje svoja tri slova.','Make the top ten and you enter your three letters at the end of the game.'],
  rekEmpty:['Još niko. Budi prvi na listi.','Nobody yet. Be the first on the list.'],
  rekMeta:['tabla {n} · {name}','board {n} · {name}'],
  privH:['Privatnost','Privacy'], privSub:['tvoji podaci','your data'],
  priv1:['Igra ne prikuplja ničije podatke: nema naloga, praćenja, reklama ni kolačića za praćenje, i ništa se ne šalje na internet.',
         "The game collects no one's data: no accounts, no tracking, no ads and no tracking cookies, and nothing is sent over the internet."],
  priv2:['Rekordi, tvoja tri slova i podešavanja muzike i jezika čuvaju se samo u ovom pregledaču, na ovom računaru. Kad u pregledaču obrišeš podatke sajtova, brišu se i oni.',
         'High scores, your three letters and the music and language settings are stored only in this browser, on this computer. Clearing site data in the browser deletes them too.'],
  castH:['Postava','The cast'], castSub:['ko te juri',"who's after you"],
  tourH:['Turneja','The tour'], tourSub:['tri table','three boards'],
  credit:['Igra <a href="https://undergrandradio.com" target="_blank" rel="noopener">UnderGRAND radija</a> · undergrandradio.com',
          'A game by <a href="https://undergrandradio.com" target="_blank" rel="noopener">UnderGRAND radio</a> · undergrandradio.com'],
  punkRole:['Ti. Kresta, zihernadla u uvu, bez kompromisa.','You. Mohawk, safety pin in the ear, no compromise.'],
  ampName:['Pojačalo „odvrnuto na 11“','Amp “turned up to 11”'],
  ampRole:['Pojedi ga i svi beže od tebe. Hvataj ih dok se pojačalo ne ugasi.','Eat it and everyone runs from you. Catch them before the amp dies down.'],
  tourRow:['<b>{name}</b> · skupljaš {pellets}, bonus: {bonus}','<b>{name}</b> · collect the {pellets}, bonus: {bonus}'],
  // flajeri preko table
  titleTag:['nova igra · demo','new game · demo'],
  titleH:['Pojedi sve zihernadle. Ne daj se sistemu.',"Eat all the safety pins. Don't let the system win."],
  titleP:['Tri table, četiri neprijatelja i jedno pojačalo odvrnuto na 11. Murija, menadžer, rijaliti zvezda i komunalni inspektor jure te od podruma do grada.',
          'Three boards, four enemies and one amp turned up to 11. The cops, the label manager, the reality star and the city inspector chase you from the basement to the city.'],
  play:['Sviraj','Play'], startHint:['Enter ili razmak za start','Enter or space to start'],
  interTag:['tabla {n} od 3 · {diff}','board {n} of 3 · {diff}'],
  interP:['Skupljaš {pellets}. Kad pojedeš trećinu, pa još trećinu, na startu se pojavi bonus: <b>{bonus}</b>.',
          'Collect the {pellets}. After a third of them, and again after two thirds, a bonus appears at the start: <b>{bonus}</b>.'],
  onStage:['Na binu','On stage'],
  overTag:['kraj svirke','gig over'], points:['{n} poena','{n} points'],
  overP:['Stigao si do table {n}: {name}. Rekord: {hi}.','You reached board {n}: {name}. High score: {hi}.'],
  again:['Još jednom','Again'],
  winTag:['turneja završena','tour complete'], winH:['Podrum, klub, grad. Sve tvoje.','Basement, club, city. All yours.'],
  winP:['{n} poena. Demo-snimak je spreman, ali publika traži još.','{n} points. The demo tape is ready, but the crowd wants more.'],
  encore:['Bis! (brže)','Encore! (faster)'],
  nameTag:['kraj svirke · {place}. mesto na listi','gig over · #{place} on the list'],
  nameP:['Ušao si među deset najboljih. Upiši tri slova:','You made the top ten. Enter three letters:'],
  nameAria:['Tri slova','Three letters'], save:['Upiši','Save'], nameHint:['Samo slova · Enter za upis','Letters only · Enter to save'],
  // na tabli
  life:['+1 ŽIVOT','+1 LIFE'], turnedUp:['ODVRNUTO NA 11!','TURNED UP TO 11!'],
  demoHint:['Enter ili razmak za igru','Enter or space to play'],
  count:[['JEDAN','DVA','TRI','ČETIR!'],['ONE','TWO','THREE','FOUR!']],
  paused:['PAUZA','PAUSED'], pausedHint:['pritisni P ili dodirni tablu','press P or tap the board'],
};
function t(k,v){ const e=STR[k]; let s=e?e[LANG==='en'?1:0]:k; if(v&&typeof s==='string') s=s.replace(/\{(\w+)\}/g,(_,n)=>v[n]!=null?v[n]:''); return s; }
function tx(o,f){ return LANG==='en'&&o.en&&o.en[f]!=null?o.en[f]:o[f]; } // polje table/neprijatelja na izabranom jeziku
function num(n){ return n.toLocaleString(LANG==='en'?'en-US':'sr-RS'); }
function fmtDay(iso){ const [y,m,d]=iso.split('-'); return LANG==='en'?new Date(+y,m-1,+d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):`${+d}. ${+m}. ${y}.`; }
// Statični delovi stranice i dugme „Pun ekran“ (punekran.js čita window.UG_FS_TEXT).
function applyStatic(){
  document.documentElement.lang=LANG==='en'?'en':'sr-Latn';
  for(const el of document.querySelectorAll('[data-t]')) el.textContent=t(el.dataset.t);
  for(const el of document.querySelectorAll('[data-t-html]')) el.innerHTML=t(el.dataset.tHtml);
  for(const el of document.querySelectorAll('[data-t-title]')) el.title=t(el.dataset.tTitle);
  for(const el of document.querySelectorAll('[data-t-aria]')) el.setAttribute('aria-label',t(el.dataset.tAria));
  const lb=document.getElementById('lang'); if(lb) lb.lang=LANG==='en'?'sr-Latn':'en'; // dugme nosi naziv drugog jezika
  window.UG_FS_TEXT={pun:t('fsPun'), izadji:t('fsIzadji'), f11:t('fsF11'), izadjiNaslov:t('fsIzadjiNaslov'), f11Naslov:t('fsF11Naslov')};
  document.dispatchEvent(new Event('ug:jezik'));
}
