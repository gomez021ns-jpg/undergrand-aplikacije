// UnderGRAND E ne'š kolega!!! — zvučni efekti preko WebAudio (bez fajlova).
// Svi tonovi idu kroz OUT (glavna jačina VOL), pa kroz kompresor da glasniji zvuk ne krči (kao u Punkman-u).
const VOL=3.2;
let AC=null, OUT=null, NOISE=null;
function initAudio(){
  if(AC){ if(AC.state==='suspended') AC.resume(); return; }
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    const comp=AC.createDynamicsCompressor(); comp.threshold.value=-12; comp.knee.value=6; comp.ratio.value=8;
    OUT=AC.createGain(); OUT.gain.value=VOL; OUT.connect(comp).connect(AC.destination);
    NOISE=AC.createBuffer(1,AC.sampleRate,AC.sampleRate); const d=NOISE.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  }catch(e){ AC=null; }
}
function tone(f,dur,type,vol,f2,delay){
  if(!AC||muted) return; const t0=AC.currentTime+(delay||0), o=AC.createOscillator(), g=AC.createGain();
  o.type=type||'square'; o.frequency.setValueAtTime(f,t0); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  g.gain.setValueAtTime(vol||.05,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur); o.connect(g).connect(OUT); o.start(t0); o.stop(t0+dur+.02);
}
function noise(dur,vol,freq,type,delay){
  if(!AC||muted) return; const t0=AC.currentTime+(delay||0), n=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
  n.buffer=NOISE; f.type=type||'bandpass'; f.frequency.value=freq||1500;
  g.gain.setValueAtTime(vol||.05,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur); n.connect(f).connect(g).connect(OUT); n.start(t0,Math.random()*.5); n.stop(t0+dur+.02);
}
// Pogodak neprijatelja: drugačiji zvuk za svaki red.
const HIT_SFX={
  tv:()=>{ tone(1200,.14,'square',.04,300); noise(.1,.05,3000,'highpass'); },          // ekran pukne
  batinas:()=>{ tone(150,.18,'sawtooth',.06,50); noise(.12,.06,500,'lowpass'); },     // tup pad
  bot:()=>{ tone(1600,.05,'square',.035,800); tone(800,.06,'square',.035,1600,.05); }, // digitalni cvrkut
  inspektor:()=>{ tone(320,.16,'triangle',.06,110); noise(.08,.05,900); },            // papiri
  ometac:()=>{ tone(500,.2,'sawtooth',.04,2400); noise(.15,.04,2500); },              // fijuk
};
function sfx(k,arg){
  if(demo) return; // demo je nem, kao na arkadi
  if(k==='rif'){ tone(330,.1,'sawtooth',.035,140); tone(495,.08,'square',.02,210); noise(.05,.025,2400); }
  else if(k==='hit') (HIT_SFX[arg]||HIT_SFX.bot)();
  else if(k==='batinas1'){ tone(110,.1,'square',.06,80); noise(.06,.06,350,'lowpass'); }
  else if(k==='kopija'){ [660,990,660,990].forEach((f,i)=>tone(f,.045,'square',.035,null,i*.05)); }
  else if(k==='pecat'){ noise(.18,.1,180,'lowpass'); tone(85,.16,'square',.07,45); }
  else if(k==='sum'){ noise(.45,.05,3200,'highpass'); noise(.45,.03,700); }
  else if(k==='sirena'){ tone(720,.24,'triangle',.03,960); tone(960,.24,'triangle',.03,720,.25); }
  else if(k==='jeep'){ [880,660,990,1320].forEach((f,i)=>tone(f,.1,'square',.045,null,i*.07)); }
  else if(k==='power'){ [523,659,784,1046,1318].forEach((f,i)=>tone(f,.09,'square',.04,null,i*.05)); }
  else if(k==='shieldHit'){ tone(520,.12,'triangle',.05,780); }
  else if(k==='death'){ tone(440,1.1,'sawtooth',.07,40); noise(.9,.08,600,'lowpass'); }
  else if(k==='wave'){ [[220,330],[262,392],[330,494],[440,660]].forEach(([a,b],i)=>{ tone(a,.16,'sawtooth',.05,null,i*.15); tone(b,.16,'square',.035,null,i*.15); }); }
  else if(k==='tink'){ tone(1900,.05,'triangle',.03); }
  else if(k==='bossHit'){ tone(150,.09,'square',.05,90); noise(.07,.05,1300); }
  else if(k==='antDown'){ tone(900,.4,'sawtooth',.05,80); noise(.35,.07,800); }
  else if(k==='aim'){ [0,.22,.44].forEach(d=>tone(880,.16,'square',.04,660,d)); }                 // pečat nišani: alarm
  else if(k==='lag'){ [0,.18].forEach(d=>{ tone(260,.16,'square',.05,180,d); tone(262,.16,'sawtooth',.03,176,d+.04); }); } // ometač: kontrole kasne
  else if(k==='slam'){ tone(70,.5,'sine',.12,30); noise(.4,.14,220,'lowpass'); noise(.15,.06,1600); } // udarac pečata
  else if(k==='bossDown'){ tone(300,1.8,'sawtooth',.08,28); tone(150,1.8,'square',.05,20); noise(1.8,.1,450,'lowpass'); }
  else if(k==='life'){ [784,988,1175,1568].forEach((f,i)=>tone(f,.1,'square',.045,null,i*.08)); }
  else if(k==='over'){ [392,349,311,262].forEach((f,i)=>tone(f,.32,'square',.05,null,i*.3)); tone(131,1.2,'sawtooth',.05,65,1.2); }
  else if(k==='win'){ [523,659,784,1046,784,1046,1318].forEach((f,i)=>tone(f,.14,'square',.05,null,i*.12)); }
}
let muted=false;
try{ muted=localStorage.getItem('kolega-zvuk')==='0'; }catch(e){}
function soundLabel(){ document.getElementById('mute').textContent=muted?'Zvuk: isklj.':'Zvuk: uklj.'; }
function toggleMute(){ muted=!muted; try{ localStorage.setItem('kolega-zvuk',muted?'0':'1'); }catch(e){} soundLabel(); }
