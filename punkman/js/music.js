// Punkman — pozadinska muzika u pank stilu, pravi je WebAudio (bez fajlova). Rifovi i melodije su naši.
// ---------- MUZIKA ----------
// Pesma = taktovi od 8 osmina. Takt: "KOREN gitara bubnjevi [8 nota melodije]" (koren power akorda, npr. E2).
// Nova pesma za tablu = nov unos u SONGS + `song` u BOARDS (js/config.js). Tabla bez pesme svira tišinu.
const MUS_VOL=.035; // muzika ide kroz OUT (glavna jačina iz audio.js); ovako je oko iste jačine kao „waka“, a tiša od ostalih efekata
const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const hz=n=>{ const r=/^([A-G])(#?)(\d)$/.exec(n); return r?440*2**((12*(+r[3]+1)+NOTE[r[1]]+(r[2]?1:0)-69)/12):0; };
// Gitara po osminama: M = prigušen akord (palm mute), O = otvoren akord koji zvoni do sledećeg udarca,
// K = kratak ska udarac oktavu više (bas tada svira koren i kvintu na udarcima), . = ništa.
const GTR={m:'MMMMMMMM', p:'O.MMO.MM', h:'O..O..O.', o:'O...O...', s:'O.......', k:'.K.K.K.K'};
// Bubnjevi po osminama: k = veliki bubanj, s = doboš, h = hi-hat. Veliko slovo obrasca = još i kraš na prvoj osmini.
const DRM={
  a:{k:'x...x.x.', s:'..x...x.', h:'xxxxxxxx'}, // osnovni
  b:{k:'x.x.x.x.', s:'.x.x.x.x', h:'xxxxxxxx'}, // brzi pank ritam
  f:{k:'x...x...', s:'..x.xxxx', h:'xxxx....'}, // prelaz
  t:{k:'x.......', s:'........', h:'........'}, // stop, akord zvoni
  s:{k:'x...x...', s:'..x...x.', h:'.x.x.x.x'}, // ska
  h:{k:'x.....x.', s:'....x...', h:'x.x.x.x.'}, // sporo i teško (polovina tempa)
};
const SONGS={
  // Podrum: sirovi garažni pank, E - G - A, pa refren sa melodijom i brzim ritmom, pa „stop“ deo.
  podrum:{bpm:172, bars:[
    'E2 m A','E2 m a','G2 m a','A2 m a','E2 m a','E2 m a','C3 m a','D3 m f',
    'A2 p B  E5 . E5 . D5 . C5 .','A2 p b  B4 . . . A4 . B4 .','E2 p b  G4 . G4 . A4 . B4 .','E2 p b  E4 . . . . . . .',
    'A2 p b  E5 . E5 . D5 . C5 .','A2 p b  B4 . . . D5 . E5 .','C3 p b  G5 . E5 . D5 . C5 .','D3 h f  D5 . . . . . . .',
    'E2 m A','E2 m a','G2 m a','A2 m a','E2 m a','E2 m a','C3 m a','D3 m a',
    'E2 s T','G2 s t','A2 s t','C3 o t','E2 s T','G2 s t','D3 o t','D3 m f',
  ]},
  // Klub: ska-pank - gitara na „i“, „duvači“ nose melodiju, pa brzi pank refren za ceo klub.
  klub:{bpm:164, bars:[
    'G2 k S  D5 . B4 . G4 . B4 .','C3 k s  C5 . E5 . G5 . E5 .','D3 k s  F#5 . E5 . D5 . A4 .','G2 k s  B4 . . . G4 . . .',
    'G2 k s  D5 . B4 . G4 . B4 .','C3 k s  E5 . G5 . A5 . G5 .','D3 k s  F#5 . A5 . F#5 . D5 .','D3 m f',
    'E2 p B  G5 . G5 . F#5 . E5 .','C3 p b  E5 . . . D5 . E5 .','G2 p b  D5 . D5 . B4 . D5 .','D3 p b  F#5 . . . . . . .',
    'E2 p b  G5 . G5 . F#5 . E5 .','C3 p b  E5 . . . G5 . A5 .','G2 p b  B5 . A5 . G5 . F#5 .','D3 h f  D5 . . . . . . .',
    'G2 k S','C3 k s','D3 k s','G2 k s','G2 s T','C3 s t','D3 o t','D3 m f',
  ]},
  // Grad: hardcore - brz rif, refren „iz grla“, pa spor i težak deo pre nego što sve krene ispočetka.
  grad:{bpm:196, bars:[
    'E2 m B','E2 m b','F2 m b','E2 m b','E2 m b','E2 m b','G2 m b','A#2 m f',
    'E2 p B  E5 . E5 . E5 . G5 .','C3 p b  F#5 . . . E5 . . .','A2 p b  E5 . E5 . E5 . G5 .','B2 p b  A5 . . . F#5 . . .',
    'E2 p b  E5 . E5 . E5 . G5 .','C3 p b  F#5 . . . G5 . A5 .','A2 p b  B5 . A5 . G5 . F#5 .','B2 h f  E5 . . . . . . .',
    'E2 s H','E2 o h','G2 s h','A#2 o h','E2 s H','E2 o h','F2 o h','F2 m f',
    'E2 m B','E2 m b','F2 m b','E2 m b','E2 m b','E2 m b','G2 m b','A#2 m f',
  ]},
};
for(const s of Object.values(SONGS)) s.bars=s.bars.map(b=>{ const t=b.trim().split(/\s+/);
  return {root:hz(t[0]), gtr:GTR[t[1]], ska:t[1]==='k', drm:DRM[t[2].toLowerCase()], crash:t[2]!==t[2].toLowerCase(), lead:t.length>3?t.slice(3).map(hz):null}; });

// Zvučni lanac muzike (pravi se jednom po AudioContext-u; dest = OUT).
function musicBus(c,dest){
  const b={c}; b.out=c.createGain(); b.out.gain.value=MUS_VOL; b.out.connect(dest);
  b.curve=new Float32Array(1024); for(let i=0;i<1024;i++) b.curve[i]=Math.tanh((i/511.5-1)*7); // izobličenje gitare
  const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=90;
  const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2800; lp.Q.value=.8; // „kutija“ pojačala
  b.gtr=c.createGain(); b.gtr.gain.value=.16; b.gtr.connect(hp).connect(lp).connect(b.out);
  b.mute=c.createBiquadFilter(); b.mute.type='lowpass'; b.mute.frequency.value=1100; b.mute.connect(b.gtr); // prigušeni akordi su tamniji
  b.noise=c.createBuffer(1,c.sampleRate,c.sampleRate); const d=b.noise.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  return b;
}
function env(c,t,peak,tau,end){ const g=c.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+.004); g.gain.setTargetAtTime(0,t+.006,tau); if(end) g.gain.setValueAtTime(0,end); return g; }
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
// Svira se samo dok traje igra; na pauzi i posle gubitka života nastavlja odakle je stala, nova tabla kreće od početka.
const Mus={on:true, name:null, last:null, step:0, next:0, bus:null, rate:1,
  play(name){ if(name && name!==this.last){ this.last=name; this.step=0; } if(name!==this.name){ this.name=name; this.next=0; } },
  reset(){ this.last=null; this.name=null; this.step=0; this.next=0; },
  tick(){ // note se zakazuju ~0,15 s unapred po satu zvuka, pa tempo ne zavisi od brzine ekrana
    const song=SONGS[this.name]; if(!song||!this.on||!AC||AC.state!=='running') return;
    if(!this.bus) this.bus=musicBus(AC,OUT);
    const dt=30/(song.bpm*this.rate);
    if(this.next<AC.currentTime) this.next=AC.currentTime+.05;
    while(this.next<AC.currentTime+.15){ playStep(this.bus,song,this.step,this.next,dt); this.next+=dt; this.step++; }
  },
};
try{ Mus.on=localStorage.getItem('punkman-muzika')!=='0'; }catch(e){}
function musicLabel(){ document.getElementById('music').textContent=Mus.on?'Muzika: uklj.':'Muzika: isklj.'; }
function toggleMusic(){ Mus.on=!Mus.on; try{ localStorage.setItem('punkman-muzika',Mus.on?'1':'0'); }catch(e){} musicLabel(); }
