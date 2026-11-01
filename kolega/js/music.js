// UnderGRAND E ne'š kolega!!! — muzika i playlista, pravi je WebAudio (bez fajlova). Pesme su naše.
// Mašina je ista kao u Punkman-u: pesma = taktovi od 8 osmina, takt = "KOREN gitara bubnjevi [8 nota melodije]".
const MUS_VOL=.035; // ide kroz OUT (glavna jačina iz audio.js), oko jačine sitnih efekata
const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const hz=n=>{ const r=/^([A-G])(#?)(\d)$/.exec(n); return r?440*2**((12*(+r[3]+1)+NOTE[r[1]]+(r[2]?1:0)-69)/12):0; };
// Gitara po osminama: M = prigušen akord, O = otvoren akord koji zvoni do sledećeg udarca,
// K = kratak ska udarac oktavu više (bas tada svira koren i kvintu na udarcima), . = ništa.
const GTR={m:'MMMMMMMM', p:'O.MMO.MM', h:'O..O..O.', o:'O...O...', s:'O.......', k:'.K.K.K.K', g:'MM.MMM.M'};
// Bubnjevi: k = veliki bubanj, s = doboš, h = hi-hat. Veliko slovo obrasca = još i kraš na prvoj osmini.
const DRM={
  a:{k:'x...x.x.', s:'..x...x.', h:'xxxxxxxx'}, // osnovni
  b:{k:'x.x.x.x.', s:'.x.x.x.x', h:'xxxxxxxx'}, // brzi pank ritam
  f:{k:'x...x...', s:'..x.xxxx', h:'xxxx....'}, // prelaz
  t:{k:'x.......', s:'........', h:'........'}, // stop, akord zvoni
  s:{k:'x...x...', s:'..x...x.', h:'.x.x.x.x'}, // ska
  h:{k:'x.....x.', s:'....x...', h:'x.x.x.x.'}, // sporo i teško
  d:{k:'xx..xx..', s:'..x...x.', h:'x.x.x.x.'}, // dupli bas
};
// Pesme svih nivoa; koje idu u playlistu nivoa i koja je pesma bosa piše u LEVELS (config.js). `passes` = koliko puta se pesma odsvira pre sledeće.
const SONGS={
  // Udarna vest: brzi pank, A - F - C - G, refren kao špica vesti.
  udarna:{title:'Udarna vest', bpm:184, passes:2, bars:[
    'A2 m A','A2 m a','F2 m a','G2 m f',
    'A2 p B  A4 . C5 . E5 . C5 .','A2 p b  D5 . C5 . A4 . . .','F2 p b  A4 . C5 . F5 . E5 .','G2 p b  D5 . . . B4 . . .',
    'A2 p b  A4 . C5 . E5 . A5 .','A2 p b  G5 . E5 . C5 . . .','C3 p b  E5 . G5 . E5 . C5 .','G2 m f  D5 . . . . . . .',
    'F2 p B  A5 . A5 . G5 . E5 .','C3 p b  G5 . . . E5 . D5 .','G2 p b  D5 . D5 . E5 . G5 .','A2 p b  E5 . . . . . . .',
    'F2 p b  A5 . A5 . G5 . E5 .','C3 p b  G5 . . . A5 . C6 .','G2 p b  B5 . A5 . G5 . D5 .','E2 h f  E5 . . . . . . .',
    'A2 s T','F2 s t','G2 o t','E2 m f',
  ]},
  // Autobusi iz unutrašnjosti: ska-pank - gitara na „i“, „duvači“ nose melodiju, pa brzi refren.
  autobusi:{title:'Autobusi iz unutrašnjosti', bpm:160, passes:2, bars:[
    'D3 k S  A4 . D5 . F#5 . A5 .','G2 k s  B5 . A5 . G5 . F#5 .','A2 k s  E5 . . . C#5 . A4 .','D3 k s  D5 . . . . . . .',
    'D3 k s  A4 . D5 . F#5 . A5 .','G2 k s  B5 . A5 . B5 . D6 .','A2 k s  C#6 . B5 . A5 . E5 .','A2 m f',
    'B2 p B  F#5 . F#5 . E5 . D5 .','G2 p b  D5 . . . B4 . D5 .','D3 p b  A5 . A5 . F#5 . A5 .','A2 p b  E5 . . . . . . .',
    'B2 p b  F#5 . F#5 . E5 . D5 .','G2 p b  D5 . . . E5 . F#5 .','A2 p b  G5 . F#5 . E5 . C#5 .','D3 h f  D5 . . . . . . .',
    'D3 k S','G2 k s','A2 k s','D3 k s','G2 s T','A2 s t','D3 o t','A2 m f',
  ]},
  // Pištaljka: hardcore - brz rif, refren sa „pištaljkom“ (visoka melodija), pa težak spori deo.
  pistaljka:{title:'Pištaljka', bpm:204, passes:2, bars:[
    'E2 g B','E2 g b','F2 g b','E2 g b','G2 g b','F2 g b','E2 g b','D2 m f',
    'E2 p B  E6 . . . E6 . . .','E2 p b  B5 . E6 . B5 . E6 .','C3 p b  E6 . . . E6 . . .','D3 p b  D6 . . . B5 . . .',
    'E2 p b  E6 . . . E6 . . .','E2 p b  B5 . E6 . B5 . E6 .','G2 p b  G6 . F#6 . E6 . D6 .','B2 m f  B5 . . . . . . .',
    'E2 s H','E2 o h','C3 s h','B2 o h','E2 s H','E2 o h','F2 o h','F2 m f',
    'E2 g B','F2 g b','E2 g b','G2 m f',
  ]},
  // Megakrkan: teška i spora pesma bosa; u fazi 2 ubrza (Mus.rate).
  megakrkan:{title:'Megakrkan', bpm:92, passes:1, bars:[
    'D2 o H','D2 o h','D#2 o h','D2 m f',
    'D2 h d  D5 . . . . . C#5 .','F2 h d  D5 . . . . . . .','D2 h d  A4 . . . G#4 . . .','C#2 m f  A4 . . . . . . .',
    'A#1 o H','A#1 o h','C2 o h','C#2 m f',
    'D2 h D  D6 . C#6 . A5 . G#5 .','F2 h d  A5 . . . . . . .','D#2 h d  G5 . . . F5 . D#5 .','D2 s t  D5 . . . . . . .',
  ]},
  // ---- nivo 2: Regulatorno telo ----
  // Šalter zatvoren: garažni pank u G, refren kao lupanje pečatom po šalteru.
  salter:{title:'Šalter zatvoren', bpm:176, passes:2, bars:[
    'G2 m A','G2 m a','C3 m a','D3 m f',
    'G2 p B  G4 . B4 . D5 . B4 .','C3 p b  C5 . E5 . G5 . E5 .','D3 p b  F#5 . E5 . D5 . . .','E2 p b  E5 . . . B4 . . .',
    'G2 p b  G4 . B4 . D5 . G5 .','C3 p b  E5 . G5 . E5 . C5 .','D3 p b  D5 . F#5 . A5 . F#5 .','D3 m f  D5 . . . . . . .',
    'C3 p B  E5 . E5 . E5 . D5 .','G2 p b  D5 . . . B4 . G4 .','D3 p b  A4 . B4 . D5 . E5 .','E2 p b  E5 . . . . . . .',
    'C3 p b  E5 . E5 . E5 . D5 .','G2 p b  D5 . . . B4 . D5 .','D3 p b  F#5 . E5 . D5 . A4 .','G2 h f  G4 . . . . . . .',
    'G2 s T','E2 s t','C3 o t','D3 m f',
  ]},
  // Dozvola za dozvolu: ska-pank u A - „duvači“ na „i“, pa brzi refren.
  dozvola:{title:'Dozvola za dozvolu', bpm:166, passes:2, bars:[
    'A2 k S  E5 . C#5 . A4 . C#5 .','D3 k s  F#5 . E5 . D5 . F#5 .','E2 k s  G#5 . F#5 . E5 . B4 .','A2 k s  A4 . . . . . . .',
    'A2 k s  E5 . C#5 . A4 . C#5 .','D3 k s  F#5 . A5 . F#5 . D5 .','E2 k s  B5 . A5 . G#5 . E5 .','E2 m f',
    'F#2 p B  A5 . A5 . G#5 . F#5 .','D3 p b  F#5 . . . E5 . D5 .','A2 p b  C#5 . E5 . A5 . E5 .','E2 p b  B4 . . . . . . .',
    'F#2 p b  A5 . A5 . G#5 . F#5 .','D3 p b  F#5 . . . G#5 . A5 .','E2 p b  B5 . G#5 . E5 . B4 .','A2 h f  A4 . . . . . . .',
    'A2 k S','D3 k s','E2 k s','A2 k s','D3 s T','E2 s t','A2 o t','E2 m f',
  ]},
  // Zapisnik: hardcore sa duplim basom, brz kao kucanje zapisnika, pa težak spori deo.
  zapisnik:{title:'Zapisnik', bpm:212, passes:2, bars:[
    'D2 g B','D2 g b','F2 g b','D2 g b','A#2 g b','A2 g b','D2 g b','C3 m f',
    'D2 p D  D5 . F5 . A5 . F5 .','A#2 p d  D5 . . . A#4 . . .','C3 p d  E5 . G5 . C6 . G5 .','A2 p d  C#5 . . . E5 . . .',
    'D2 p d  D5 . F5 . A5 . D6 .','A#2 p d  C6 . A#5 . A5 . F5 .','C3 p d  G5 . E5 . C5 . E5 .','A2 m f  A4 . . . . . . .',
    'D2 s H','D2 o h','F2 s h','C3 o h','D2 s H','A#1 o h','A2 o h','A2 m f',
    'D2 g B','F2 g b','D2 g b','C3 m f',
  ]},
  // Megakrkan Pečat: pesma bosa nivoa 2 - teški koraci i „stop“ udarci kao pečat po stolu; u fazi 2 ubrza.
  pecat:{title:'Megakrkan Pečat', bpm:100, passes:1, bars:[
    'E2 s H','E2 s t','F2 s h','E2 m f',
    'E2 h h  E5 . . . . . . .','G2 h h  D#5 . . . . . . .','E2 h h  E5 . . . F5 . . .','F2 m f  E5 . . . . . . .',
    'C2 o H','C2 o h','D2 o h','D#2 m f',
    'E2 h D  B5 . A#5 . A5 . G#5 .','G2 h d  G5 . . . . . . .','F2 h d  F5 . . . E5 . D#5 .','E2 s t  E5 . . . . . . .',
  ]},
  // ---- nivo 3: Brdo sa antenom ----
  // Smetnja na vezi: brzi pank u h-molu, refren koji „preskače“ kao signal koji se gubi.
  smetnja:{title:'Smetnja na vezi', bpm:180, passes:2, bars:[
    'B2 m A','B2 m a','G2 m a','A2 m f',
    'B2 p B  B4 . D5 . F#5 . D5 .','G2 p b  B4 . . . G4 . . .','D3 p b  A4 . D5 . F#5 . A5 .','A2 p b  E5 . . . C#5 . . .',
    'B2 p b  B4 . D5 . F#5 . B5 .','G2 p b  A5 . F#5 . D5 . . .','E2 p b  G5 . F#5 . E5 . D5 .','F#2 m f  C#5 . . . . . . .',
    'G2 p B  B5 . B5 . A5 . F#5 .','D3 p b  A5 . . . F#5 . D5 .','A2 p b  E5 . F#5 . A5 . C#6 .','B2 p b  B5 . . . . . . .',
    'G2 p b  B5 . B5 . A5 . F#5 .','D3 p b  A5 . . . B5 . D6 .','A2 p b  C#6 . B5 . A5 . E5 .','F#2 h f  F#5 . . . . . . .',
    'B2 s T','G2 s t','A2 o t','F#2 m f',
  ]},
  // Antena na brdu: ska-pank u C - „duvači“ na „i“, pa brzi refren.
  antena:{title:'Antena na brdu', bpm:162, passes:2, bars:[
    'C3 k S  G4 . C5 . E5 . G5 .','F2 k s  A5 . G5 . F5 . C5 .','G2 k s  B4 . D5 . G5 . F5 .','C3 k s  E5 . . . . . . .',
    'C3 k s  G4 . C5 . E5 . G5 .','F2 k s  A5 . C6 . A5 . F5 .','G2 k s  D6 . B5 . G5 . D5 .','G2 m f',
    'A2 p B  E5 . E5 . D5 . C5 .','F2 p b  C5 . . . A4 . C5 .','C3 p b  G5 . G5 . E5 . G5 .','G2 p b  D5 . . . . . . .',
    'A2 p b  E5 . E5 . D5 . C5 .','F2 p b  C5 . . . D5 . E5 .','G2 p b  F5 . E5 . D5 . B4 .','C3 h f  C5 . . . . . . .',
    'C3 k S','F2 k s','G2 k s','C3 k s','F2 s T','G2 s t','C3 o t','G2 m f',
  ]},
  // Beli šum: najbrži hardcore u igri, dupli bas, pa težak spori deo.
  belisum:{title:'Beli šum', bpm:216, passes:2, bars:[
    'F#2 g B','F#2 g b','D2 g b','F#2 g b','A2 g b','G#2 g b','F#2 g b','E2 m f',
    'F#2 p D  F#5 . A5 . C#6 . A5 .','D2 p d  F#5 . . . D5 . . .','E2 p d  G#5 . B5 . E6 . B5 .','C#3 p d  F5 . . . G#5 . . .',
    'F#2 p d  F#5 . A5 . C#6 . F#6 .','D2 p d  E6 . D6 . C#6 . A5 .','E2 p d  B5 . G#5 . E5 . G#5 .','C#3 m f  C#5 . . . . . . .',
    'F#2 s H','F#2 o h','A2 s h','E2 o h','F#2 s H','D2 o h','C#3 o h','C#3 m f',
    'F#2 g B','A2 g b','F#2 g b','E2 m f',
  ]},
  // Megakrkan Ometač: pesma poslednjeg bosa - spora, teška, melodija „puca“ kao signal; u fazi 2 ubrza.
  ometac:{title:'Megakrkan Ometač', bpm:96, passes:1, bars:[
    'C#2 o H','C#2 o h','D2 o h','C#2 m f',
    'C#2 h d  C#5 . . . . . C5 .','E2 h d  C#5 . . . . . . .','C#2 h d  G#4 . . . G4 . . .','C2 m f  G#4 . . . . . . .',
    'A1 o H','A1 o h','B1 o h','C2 m f',
    'C#2 h D  C#6 . C6 . G#5 . G5 .','E2 h d  G#5 . . . . . . .','D2 h d  F#5 . . . E5 . D5 .','C#2 s t  C#5 . . . . . . .',
  ]},
};
for(const s of Object.values(SONGS)) s.bars=s.bars.map(b=>{ const t=b.trim().split(/\s+/);
  return {root:hz(t[0]), gtr:GTR[t[1]], ska:t[1]==='k', drm:DRM[t[2].toLowerCase()], crash:t[2]!==t[2].toLowerCase(), lead:t.length>3?t.slice(3).map(hz):null}; });

// Zvučni lanac muzike (pravi se jednom po AudioContext-u; dest = OUT).
function musicBus(c,dest){
  const b={c}; b.out=c.createGain(); b.out.gain.value=MUS_VOL; b.out.connect(dest);
  b.curve=new Float32Array(1024); for(let i=0;i<1024;i++) b.curve[i]=Math.tanh((i/511.5-1)*7); // izobličenje gitare
  const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=80;
  const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2800; lp.Q.value=.8; // „kutija“ pojačala
  b.gtr=c.createGain(); b.gtr.gain.value=.16; b.gtr.connect(hp).connect(lp).connect(b.out);
  b.mute=c.createBiquadFilter(); b.mute.type='lowpass'; b.mute.frequency.value=1100; b.mute.connect(b.gtr); // prigušeni akordi su tamniji
  b.noise=c.createBuffer(1,c.sampleRate,c.sampleRate); const d=b.noise.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  return b;
}
function env(c,t,peak,tau){ const g=c.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+.004); g.gain.setTargetAtTime(0,t+.006,tau); return g; }
function noiseHit(b,t,type,freq,peak,tau){
  const c=b.c, n=c.createBufferSource(), f=c.createBiquadFilter(), g=env(c,t,peak,tau);
  n.buffer=b.noise; f.type=type; f.frequency.value=freq; n.connect(f).connect(g).connect(b.out); n.start(t,Math.random()*.5); n.stop(t+tau*6);
}
function gtrHit(b,f,t,dur,mute){
  const c=b.c, pre=c.createGain(), sh=c.createWaveShaper(), g=c.createGain();
  pre.gain.value=mute?.6:1; sh.curve=b.curve;
  for(const [m,det] of [[1,-7],[1.5,5],[2,0]]){ const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=f*m; o.detune.value=det; o.connect(pre); o.start(t); o.stop(t+dur+.06); }
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(1,t+.004);
  g.gain.setTargetAtTime(mute?0:.55,t+.01,mute?.04:dur*.7); g.gain.setTargetAtTime(0,t+dur,.02);
  pre.connect(sh).connect(g).connect(mute?b.mute:b.gtr);
}
function bassHit(b,f,t,dur){
  const c=b.c, o=c.createOscillator(), lp=c.createBiquadFilter(), g=c.createGain();
  o.type='square'; o.frequency.value=f; lp.type='lowpass'; lp.frequency.value=650;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.12,t+.005); g.gain.setTargetAtTime(.07,t+.01,.08); g.gain.setTargetAtTime(0,t+dur,.015);
  o.connect(lp).connect(g).connect(b.out); o.start(t); o.stop(t+dur+.08);
}
function kick(b,t){
  const c=b.c, o=c.createOscillator(), g=env(c,t,.45,.09);
  o.type='sine'; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(45,t+.11);
  o.connect(g).connect(b.out); o.start(t); o.stop(t+.4);
}
function snare(b,t){
  noiseHit(b,t,'bandpass',1900,.5,.06);
  const c=b.c, o=c.createOscillator(), g=env(c,t,.25,.04); o.type='triangle'; o.frequency.value=185; o.connect(g).connect(b.out); o.start(t); o.stop(t+.2);
}
function leadNote(b,f,t,dur){
  const c=b.c, o=c.createOscillator(), lp=c.createBiquadFilter(), g=c.createGain(), v=c.createOscillator(), vg=c.createGain();
  o.type='square'; o.frequency.value=f; v.frequency.value=5.5; vg.gain.value=f*.006; v.connect(vg).connect(o.frequency); // blagi vibrato
  lp.type='lowpass'; lp.frequency.value=2600;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.09,t+.01); g.gain.setTargetAtTime(.06,t+.02,.1); g.gain.setTargetAtTime(0,t+dur,.03);
  o.connect(lp).connect(g).connect(b.out); o.start(t); v.start(t); o.stop(t+dur+.15); v.stop(t+dur+.15);
}
// Jedna osmina pesme u trenutku t (dt = trajanje osmine).
function playStep(b,song,step,t,dt){
  const bar=song.bars[Math.floor(step/8)%song.bars.length], i=step%8, g=bar.gtr[i], d=bar.drm;
  const ring=(s,k)=>{ let n=1; while(k+n<8 && s[k+n]==='.') n++; return n; }; // koliko osmina zvoni do sledećeg udarca
  if(g==='K'){ gtrHit(b,bar.root*2,t,dt*.45,false); }
  else if(g!=='.'){ const n=g==='O'?ring(bar.gtr,i):1; gtrHit(b,bar.root,t,dt*n*(g==='M'?.75:.95),g==='M'); bassHit(b,bar.root,t,dt*n*.9); }
  if(bar.ska && i%2===0) bassHit(b,bar.root*(i%4===2?1.5:1),t,dt*1.8); // ska bas: koren pa kvinta
  if(d.k[i]==='x') kick(b,t);
  if(d.s[i]==='x') snare(b,t);
  if(d.h[i]==='x') noiseHit(b,t,'highpass',7500,.13,.022);
  if(i===0 && bar.crash) noiseHit(b,t,'highpass',4500,.22,.32);
  if(bar.lead && bar.lead[i]){ let n=1; while(i+n<8 && !bar.lead[i+n]) n++; leadNote(b,bar.lead[i],t,dt*n*.9); }
}
// Svira samo dok traje igra (`playing` postavlja game.js); na pauzi stoji i nastavlja odakle je stala.
// Pesme playliste idu redom; kad se pesma završi (posle `passes` prolaza) ili na „Sledeća pesma“ (B) kreće sledeća.
// Bos ima svoju pesmu; novi nivo (Mus.setLevel) kreće od prve pesme svoje playliste.
const Mus={on:true, playing:false, level:0, idx:0, boss:false, step:0, next:0, bus:null, rate:1,
  key(){ const L=LEVELS[this.level]; return this.boss?L.bossSong:L.playlist[this.idx]; },
  title(){ return SONGS[this.key()].title; },
  setLevel(i){ this.level=i; this.idx=0; this.boss=false; this.step=0; songLabel(); }, // svaki nivo ima svoju playlistu
  reset(){ this.setLevel(0); },
  // `next` (vreme sledeće note) se ovde ne dira: nova pesma se nastavlja tačno gde je stala stara.
  // (1.0.1: ranije je `next=0` usred tick() zakazao sve note od početka igre odjednom i ukočio pregledač.)
  skip(){ if(this.boss) return; this.idx=(this.idx+1)%LEVELS[this.level].playlist.length; this.step=0; songLabel(); },
  setBoss(on){ if(this.boss===on) return; this.boss=on; this.step=0; songLabel(); },
  tick(){ // note se zakazuju ~0,15 s unapred po satu zvuka, pa tempo ne zavisi od brzine ekrana
    if(!this.on||!this.playing||!AC||AC.state!=='running') return;
    if(!this.bus) this.bus=musicBus(AC,OUT);
    let song=SONGS[this.key()];
    if(this.next<AC.currentTime) this.next=AC.currentTime+.05;
    for(let guard=0; this.next<AC.currentTime+.15 && guard<64; guard++){ // osigurač: nikad više od 64 osmine odjednom
      if(this.step>=song.bars.length*8*song.passes){ if(this.boss) this.step=0; else { this.skip(); song=SONGS[this.key()]; } }
      const dt=30/(song.bpm*this.rate);
      playStep(this.bus,song,this.step,this.next,dt); this.next+=dt; this.step++;
    }
  },
};
try{ Mus.on=localStorage.getItem('kolega-muzika')!=='0'; }catch(e){}
function songLabel(){
  const el=document.getElementById('song'); if(el) el.innerHTML=(Mus.on?'Svira: ':'Na redu: ')+'<b>'+Mus.title()+'</b>';
  const nx=document.getElementById('next'); if(nx) nx.disabled=Mus.boss;
}
function musicLabel(){ document.getElementById('music').textContent=Mus.on?'Muzika: uklj.':'Muzika: isklj.'; songLabel(); }
function toggleMusic(){ Mus.on=!Mus.on; try{ localStorage.setItem('kolega-muzika',Mus.on?'1':'0'); }catch(e){} musicLabel(); }
