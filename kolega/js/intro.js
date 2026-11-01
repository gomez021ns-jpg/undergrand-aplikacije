// UnderGRAND E ne'š kolega!!! — uvodna špica u fazonu starog kućnog računara sa kasetom (~10 s posle PLAY).
// Plavi ekran i kucanje LOAD → „PRESS PLAY ON TAPE“ (prvi taster/klik = PLAY, tada sme i zvuk) → SEARCHING / FOUND →
// šarene pruge po ivici i slika koja se učitava red po red, uz muziku → „ometač“ i „dozvola inspekcije“ → READY. RUN → naslovni ekran.
// Bilo koji taster posle PLAY (ili Esc bilo kad) preskače. Font je naš (8×8, sa č ć ž š đ), boje su samo po uzoru na stare mašine.
// Crta se u isto malo platno kao igra (`buf`/`g` iz game.js) - zato se sve odavde poziva tek kad je game.js učitan.
const C64={bg:'#40318d', fg:'#7c70da', blk:'#000000'};
const IN_X=16, IN_Y=15, IN_W=208, IN_H=150; // unutrašnji ekran; okolo je ivica (border)
const FONT={
  A:'..##..|.####.|##..##|######|##..##|##..##|##..##', B:'#####.|##..##|##..##|#####.|##..##|##..##|#####.',
  C:'.####.|##..##|##....|##....|##....|##..##|.####.', D:'####..|##.##.|##..##|##..##|##..##|##.##.|####..',
  E:'######|##....|##....|####..|##....|##....|######', F:'######|##....|##....|####..|##....|##....|##....',
  G:'.####.|##..##|##....|##.###|##..##|##..##|.####.', H:'##..##|##..##|##..##|######|##..##|##..##|##..##',
  I:'.####.|..##..|..##..|..##..|..##..|..##..|.####.', J:'...###|....##|....##|....##|....##|##..##|.####.',
  K:'##..##|##.##.|####..|###...|####..|##.##.|##..##', L:'##....|##....|##....|##....|##....|##....|######',
  M:'##...##|###.###|#######|##.#.##|##...##|##...##|##...##', N:'##..##|###.##|######|######|##.###|##..##|##..##',
  O:'.####.|##..##|##..##|##..##|##..##|##..##|.####.', P:'#####.|##..##|##..##|#####.|##....|##....|##....',
  Q:'.####.|##..##|##..##|##..##|##..##|.####.|...###', R:'#####.|##..##|##..##|#####.|####..|##.##.|##..##',
  S:'.####.|##..##|##....|.####.|....##|##..##|.####.', T:'######|..##..|..##..|..##..|..##..|..##..|..##..',
  U:'##..##|##..##|##..##|##..##|##..##|##..##|.####.', V:'##..##|##..##|##..##|##..##|##..##|.####.|..##..',
  W:'##...##|##...##|##...##|##.#.##|#######|###.###|##...##', X:'##..##|##..##|.####.|..##..|.####.|##..##|##..##',
  Y:'##..##|##..##|##..##|.####.|..##..|..##..|..##..', Z:'######|....##|...##.|..##..|.##...|##....|######',
  'Đ':'#####..|.##.##.|.##..##|####.##|.##..##|.##.##.|#####..',
  0:'.####.|##..##|##.###|######|###.##|##..##|.####.', 1:'..##..|.###..|..##..|..##..|..##..|..##..|######',
  2:'.####.|##..##|....##|...##.|..##..|.##...|######', 3:'.####.|##..##|....##|..###.|....##|##..##|.####.',
  4:'...##.|..###.|.####.|##.##.|######|...##.|...##.', 5:'######|##....|#####.|....##|....##|##..##|.####.',
  6:'.####.|##..##|##....|#####.|##..##|##..##|.####.', 7:'######|##..##|...##.|..##..|..##..|..##..|..##..',
  8:'.####.|##..##|##..##|.####.|##..##|##..##|.####.', 9:'.####.|##..##|##..##|.#####|....##|##..##|.####.',
  '.':'......|......|......|......|......|..##..|..##..', ',':'......|......|......|......|..##..|..##..|.##...',
  '!':'..##..|..##..|..##..|..##..|......|..##..|..##..', '?':'.####.|##..##|....##|...##.|..##..|......|..##..',
  "'":'..##..|..##..|.##...|......|......|......|......', '"':'##.##.|##.##.|......|......|......|......|......',
  ':':'......|..##..|..##..|......|..##..|..##..|......', '-':'......|......|......|######|......|......|......',
  '%':'##...#|##..##|...##.|..##..|.##...|##..##|#...##', '*':'......|##..##|.####.|######|.####.|##..##|......',
  '/':'....##|...##.|...##.|..##..|.##...|.##...|##....', '=':'......|......|######|......|######|......|......',
};
for(const k in FONT) FONT[k]=FONT[k].split('|');
const ACCENT={'Č':['C','.#..#.|..##..'], 'Ć':['C','....##|...##.'], 'Š':['S','.#..#.|..##..'], 'Ž':['Z','.#..#.|..##..']};
// Jedno slovo u (x,y), veličina piksela s; kvačica/akcenat ide u dva reda iznad slova.
function c64Char(c,ch,x,y,s,col){
  let rows=FONT[ch], acc=null;
  if(ACCENT[ch]){ rows=FONT[ACCENT[ch][0]]; acc=ACCENT[ch][1].split('|'); }
  if(!rows) return; c.fillStyle=col;
  rows.forEach((r,j)=>{ for(let i=0;i<r.length;i++) if(r[i]==='#') c.fillRect(x+i*s,y+j*s,s,s); });
  if(acc) acc.forEach((r,j)=>{ for(let i=0;i<r.length;i++) if(r[i]==='#') c.fillRect(x+i*s,y+(j-3)*s,s,s); });
}
function c64Text(c,str,x,y,s,col){ [...String(str).toUpperCase()].forEach((ch,i)=>c64Char(c,ch,x+i*8*s,y,s,col)); }

const Boot={active:false, ph:'type', t:0, lines:[], typed:'', bus:null, mus:null, fired:{}, pic:null, order:null,
  CMD:'LOAD"E NE\'Š KOLEGA",1',
  start(){
    Object.assign(this,{active:true, ph:'type', t:0, typed:'', fired:{}, lines:['','  **** UNDERGRAND 64 ****',' 64K RAM 38911 BYTES FREE','','READY.']});
    hideOv();
  },
  // Taster ili klik: pre PLAY je to PLAY (Esc preskače), posle PLAY sve preskače.
  key(k){
    if(k==='Escape' || this.ph==='load'){ this.finish(); return; }
    this.typed=this.CMD; if(this.lines.length<7) this.lines.push(this.CMD,'PRESS PLAY ON TAPE');
    this.play();
  },
  play(){
    this.ph='load'; this.t=0; this.lines.push('OK','','SEARCHING');
    initAudio();
    if(AC){ this.bus=AC.createGain(); this.bus.connect(OUT); this.mus=AC.createGain(); this.mus.connect(this.bus); this.vol(); this.sounds(); }
  },
  finish(){
    this.active=false;
    if(this.bus){ const b=this.bus; b.gain.setTargetAtTime(0,AC.currentTime,.03); setTimeout(()=>b.disconnect(),300); this.bus=null; }
    state='title'; banner=null; showTitle();
  },
  vol(){ if(this.bus){ this.bus.gain.value=muted?0:1; this.mus.gain.value=Mus.on?1:0; } }, // prekidači Zvuk/Muzika važe i ovde
  once(k){ if(this.fired[k]) return false; this.fired[k]=true; return true; },
  // ---- zvuk: sve se zakaže odjednom na PLAY (ide kroz `bus`, pa preskakanje sve utiša) ----
  sounds(){
    const c=AC, t0=c.currentTime, bus=this.bus;
    const osc=(type,f,t,dur,vol,dest)=>{ const o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.005); g.gain.setTargetAtTime(0,t+dur*.8,.02); o.connect(g).connect(dest); o.start(t); o.stop(t+dur+.1); return o; };
    const hiss=(t,dur,vol)=>{ const n=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); n.buffer=NOISE; n.loop=true; f.type='highpass'; f.frequency.value=5000;
      g.gain.setValueAtTime(vol,t); g.gain.setValueAtTime(0,t+dur); n.connect(f).connect(g).connect(bus); n.start(t); n.stop(t+dur+.05); };
    osc('square',110,t0,.06,.05,bus); osc('square',80,t0+.07,.05,.04,bus); // klik kasetofona
    hiss(t0+.1,1.5,.025); hiss(t0+2.3,5.5,.008);                           // traka šušti (dok traži, pa tiše dok učitava)
    // muzika učitavanja (naša): bas u osminama + brzi arpeđo akorda, 8 akorda po 0,68 s
    const hz=n=>440*2**((n-69)/12), CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62],[57,60,64],[53,57,60],[55,59,62],[52,56,59]], D=.68, m0=t0+2.3;
    CH.forEach((ch,i)=>{ const t=m0+i*D;
      for(let k=0;k<4;k++) osc('square',hz(ch[0]-24),t+k*D/4,D/4*.85,.016,this.mus);
      const o=osc('square',hz(ch[0]+12),t,D,.011,this.mus); for(let s=0;s*0.045<D;s++) o.frequency.setValueAtTime(hz(ch[s%3]+12+(s%6>2?12:0)),t+s*.045); });
    [76,79,84,88].forEach((n,i)=>osc('square',hz(n),t0+7.75+i*.07,.1,.03,bus));  // 100 %
    [0,1,2].forEach(i=>osc('square',1600,t0+8.95+i*.11,.02,.02,bus));               // kucanje RUN
  },
  // ---- tok ----
  frame(dt){ this.t+=dt; this.vol(); this.step(); this.draw(); },
  step(){
    const t=this.t;
    if(this.ph==='type'){
      const n=Math.max(0,Math.min(this.CMD.length,Math.floor((t-.9)*16))); this.typed=this.CMD.slice(0,n);
      if(t>=2.4 && this.once('wait')) this.lines.push(this.CMD,'PRESS PLAY ON TAPE');
      return;
    }
    if(t>=1.6 && this.once('found')) this.lines.push("FOUND E NE'Š KOLEGA!!!");
    if(t>=4.6 && this.once('jam1')) sfx('sum');
    if(t>=4.9 && this.once('jam2')) sfx('sum');
    if(t>=7.45 && this.once('stamp')) sfx('pecat');
    if(t>=8.7 && this.once('ready')) this.lines.push('LOADING','READY.');
    if(t>=9.6) this.finish();
  },
  progress(t){ // 0..1; zastane na „ometaču“ i na 99 %
    if(t<4.6) return .45*(t-2.3)/2.3; if(t<5.2) return .45; if(t<6.6) return .45+.54*(t-5.2)/1.4; if(t<7.6) return .99; return Math.min(1,.99+(t-7.6)/.2*.01);
  },
  draw(){
    const t=this.t, L=this.ph==='load';
    const blank=L && t>=.5 && t<1.6, loading=L && t>=2.3 && t<7.8, picture=L && t>=7.8 && t<8.7, jam=L && t>=4.6 && t<5.2;
    // ivica: obična, ili šarene pruge dok učitava (sive dok smeta ometač)
    g.fillStyle=C64.fg; g.fillRect(0,0,GW,GH);
    if(loading){ const P=jam?['#222','#555','#888','#bbb','#333']:[C64.bg,C64.fg,'#ff5a3c','#ffc93c','#39d0ff','#3ddc84','#ff4fa3','#f1efe8','#111018'];
      for(let y=0;y<GH;){ const h=1+Math.floor(Math.random()*4); g.fillStyle=P[Math.floor(Math.random()*P.length)]; g.fillRect(0,y,GW,h); y+=h; } }
    if(blank) return this.blit(); // dok traži, ekran je prazan (samo ivica)
    if(loading||picture){ this.drawPic(loading?this.progress(t):1, jam); return this.blit(); }
    // tekstualni ekran: poslednjih 15 redova, kursor trepće na kraju reda u koji se kuca
    g.fillStyle=C64.bg; g.fillRect(IN_X,IN_Y,IN_W,IN_H);
    const rows=this.lines.slice(); let cur=null;
    if(this.ph==='type' && !this.fired.wait){ rows.push(this.typed); cur=rows.length-1; }
    if(L && t>=8.7){ rows.push('RUN'.slice(0,Math.max(0,Math.floor((t-8.9)*9)))); cur=rows.length-1; }
    const vis=rows.slice(-15), off=rows.length-vis.length;
    vis.forEach((r,i)=>c64Text(g,r,IN_X,IN_Y+3+i*10,1,C64.fg));
    if(cur!==null && Math.floor(t/.33)%2===0){ g.fillStyle=C64.fg; g.fillRect(IN_X+rows[cur].length*8,IN_Y+3+(cur-off)*10-1,7,8); }
    this.blit();
  },
  // slika koja se učitava: redovi stižu kao na pravoj mašini (prvi red svakog pojasa od 8, pa drugi...), pa traka sa procentima
  drawPic(p,jam){
    if(!this.pic) this.buildPic();
    const n=Math.floor(p*this.order.length);
    g.fillStyle=C64.blk; g.fillRect(IN_X,IN_Y,IN_W,IN_H);
    for(let i=0;i<n;i++){ const y=this.order[i]; g.drawImage(this.pic,0,y,IN_W,1,IN_X,IN_Y+y,IN_W,1); }
    if(jam) for(let i=0;i<500;i++){ const v=40+Math.floor(Math.random()*180); g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(IN_X+Math.floor(Math.random()*IN_W),IN_Y+Math.floor(Math.random()*IN_H),2,1); }
    const box=(a,b)=>{ const w=Math.max(a.length,b.length)*8+12, x=IN_X+Math.round((IN_W-w)/2), y=IN_Y+52;
      g.fillStyle=C64.blk; g.fillRect(x,y,w,28); g.fillStyle=C64.fg; g.fillRect(x,y,w,1); g.fillRect(x,y+27,w,1); g.fillRect(x,y,1,28); g.fillRect(x+w-1,y,1,28);
      c64Text(g,a,x+6+(w-12-a.length*8)/2,y+6,1,'#ffc93c'); c64Text(g,b,x+6+(w-12-b.length*8)/2,y+16,1,'#ffc93c'); };
    const t=this.t;
    if(jam) box('OMETAČ SIGNALA','DETEKTOVAN!');
    else if(t>=6.6 && t<7.45) box('ČEKA SE DOZVOLA','INSPEKCIJE...');
    else if(t>=7.45 && t<7.8) box('ODOBRENO.','(ZA SADA)');
    if(p<1){ g.fillStyle=C64.blk; g.fillRect(IN_X,IN_Y+IN_H-11,IN_W,11); c64Text(g,'LOADING '+Math.floor(p*100)+'%',IN_X+4,IN_Y+IN_H-9,1,C64.fg);
      g.fillStyle=C64.fg; g.fillRect(IN_X+112,IN_Y+IN_H-8,Math.round(90*p),5); }
  },
  buildPic(){
    const k=document.createElement('canvas'); k.width=IN_W; k.height=IN_H; const c=k.getContext('2d');
    c.fillStyle='#0b0d10'; c.fillRect(0,0,IN_W,IN_H);
    for(let i=0;i<40;i++){ c.fillStyle=i%3?'#1a1f27':'#2b323c'; c.fillRect(Math.floor(Math.random()*IN_W),Math.floor(Math.random()*IN_H),1,1); }
    const big=(s,y)=>{ const x=Math.round((IN_W-[...s].length*16)/2); c64Text(c,s,x+2,y+2,2,'#ff5a3c'); c64Text(c,s,x,y,2,'#ffc93c'); };
    big("E NE'Š",10); big('KOLEGA!!!',32);
    // odašiljač sa talasima signala iz antene
    const sx=80, sy=64; drawSprite(c,SPR.igrac[0],sx,sy,4);
    [[8,'#ffc93c'],[13,'#ff5a3c'],[18,'#ffc93c']].forEach(([r,col])=>{ c.fillStyle=col;
      for(let a=-2.5;a<=-.64;a+=.04){ c.fillRect(Math.round(sx+24+Math.cos(a)*r*1.6),Math.round(sy+Math.sin(a)*r*.6),2,1); } });
    ['tv','batinas','bot','inspektor','ometac'].forEach((t,i)=>drawSprite(c,SPR[t][0],28+i*32,112,2));
    c64Text(c,'UNDERGRAND RADIO',40,140,1,'#ff5a3c');
    this.pic=k; this.order=[];
    for(let r=0;r<8;r++) for(let b=0;b*8<IN_H;b++) if(b*8+r<IN_H) this.order.push(b*8+r);
  },
  // u veliko platno, plus uputstvo ispod ekrana u punoj rezoluciji
  blit(){
    ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false; ctx.drawImage(buf,0,0,cv.width,cv.height);
    ctx.setTransform(K,0,0,K,0,0);
    ctx.fillStyle=C64.fg; ctx.fillRect(GW/2-70,GH-12.5,140,10); // podloga da se uputstvo čita i preko pruga
    ctx.font=`600 6px 'IBM Plex Mono', monospace`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='rgba(16,12,40,.85)';
    ctx.fillText(this.ph==='load'?'bilo koji taster ili klik: preskoči':'bilo koji taster ili klik: PLAY  ·  Esc: preskoči',GW/2,GH-7.5);
  },
};
