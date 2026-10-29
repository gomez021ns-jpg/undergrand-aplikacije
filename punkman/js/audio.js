// Punkman — zvučni efekti preko WebAudio (bez fajlova).
// ---------- AUDIO ----------
// Svi tonovi idu kroz OUT (glavna jačina VOL), pa kroz kompresor da glasniji zvuk ne krči.
const VOL=3.2;
let AC=null, OUT=null, waka=0;
function initAudio(){
  if(AC){ if(AC.state==='suspended') AC.resume(); return; }
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    const comp=AC.createDynamicsCompressor(); comp.threshold.value=-12; comp.knee.value=6; comp.ratio.value=8;
    OUT=AC.createGain(); OUT.gain.value=VOL; OUT.connect(comp).connect(AC.destination);
  }catch(e){ AC=null; }
}
function tone(f,dur,type,vol,f2,delay){
  if(!AC||muted) return; const t0=AC.currentTime+(delay||0), o=AC.createOscillator(), g=AC.createGain();
  o.type=type||'square'; o.frequency.setValueAtTime(f,t0); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  g.gain.setValueAtTime(vol||.05,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur); o.connect(g).connect(OUT); o.start(t0); o.stop(t0+dur+.02);
}
function sfx(k){
  if(k==='waka'){ waka^=1; tone(waka?220:330,.06,'square',.035); }
  else if(k==='power'){ tone(82,.7,'sawtooth',.07,660); tone(123,.7,'sawtooth',.05,990); }
  else if(k==='eat'){ tone(300,.25,'square',.06,1200); }
  else if(k==='death'){ tone(660,1.2,'sawtooth',.07,55); }
  else if(k==='bonus'){ [523,659,784,1046].forEach((f,i)=>tone(f,.12,'square',.05,null,i*.07)); }
  else if(k==='raid'){ tone(700,.18,'triangle',.05,500); tone(700,.18,'triangle',.05,500,.2); }
  else if(k==='clear'){ [[82,123],[110,165],[123,185],[82,123]].forEach(([a,b],i)=>{ tone(a,.22,'sawtooth',.06,null,i*.24); tone(b,.22,'sawtooth',.045,null,i*.24); }); }
}
let muted=false;
function toggleMute(){ muted=!muted; document.getElementById('mute').textContent=muted?'Zvuk: isklj.':'Zvuk: uklj.'; }
