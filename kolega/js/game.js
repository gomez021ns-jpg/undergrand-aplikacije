// UnderGRAND E ne'š kolega!!! — stanje igre, formacija, zakloni, hici, bos, crtanje, HUD i kontrole.
// Igra se crta u malom platnu GW×GH (logički pikseli), pa se uvećava bez zamućivanja; tekst ide preko, u punoj rezoluciji.
// ---------- DOM ----------
const $=id=>document.getElementById(id);
const cv=$('cv'), ctx=cv.getContext('2d'), stage=$('stage'), ov=$('ov');
const buf=document.createElement('canvas'); buf.width=GW; buf.height=GH;
const g=buf.getContext('2d');
let K=4; // ekranskih piksela po logičkom pikselu
const rand=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
const randInt=(a,b)=>Math.floor(rand(a,b+1));
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
const fmt=n=>n.toLocaleString('sr-RS');

// Eksplozija (pogođen neprijatelj) i veličine neprijateljskih hitaca.
const BOOM=['....W..W....','.W...YY...W.','..W.Y..Y.W..','...Y.OO.Y...','WY.O....O.YW','...Y.OO.Y...','..W.Y..Y.W..','.W...YY...W.','....W..W....'];
const BULLET={
  naslov:{w:6,h:5,rows:['WWWWWW','WKKKKW','WWWWWW','WKWKKW','WWWWWW']},
  munja:{w:3,h:7,zig:['L','W']},
  spam:{w:3,h:4,rows:['CCC','CWC','CCC','C..']},
  pecat:{w:4,h:5,rows:['.BB.','.BB.','.BB.','RRRR','RRRR']},
  smetnja:{w:3,h:7,zig:['P','V']},
  vest:{w:6,h:3,rows:['RRRRRR','RWWRWR','RRRRRR']},
  mastilo:{w:3,h:5,rows:['.C.','.U.','UCU','UUU','.U.']},
};
const STARS=Array.from({length:46},()=>[Math.floor(Math.random()*GW),Math.floor(Math.random()*(GROUND-10)),Math.random()<.3?'#2b323c':'#1a1f27']);

// ---------- STANJE ----------
let state='title', stateT=0, level=0, mode='wave', wave=0, score=0, shakeT=0, decals=[], hi=0, lives=START_LIVES, nextLife=LIFE_EVERY, clock=0;
let player={x:(GW-12)/2}, shot=null, bullets=[], form=null, shields=[], jeep=null, jeepT=0, drops=[], fx=[], popups=[], banner=null;
let sol=0, pwMsg=null, noiseT=0, noiseCD=4, diveT=0, fireT=0, boss=null, killed=[], deathMsg='', invaded=false, won=false;
const keys={L:false,R:false,F:false};
try{ hi=+localStorage.getItem('kolega-hi')||0; }catch(e){}
// Rekordi: deset najboljih {i: tri slova, s: poeni, l: nivo 0.. (stari upisi bez l = nivo 1), t: talas 0-2 ili 3 = bos,
// w: pređen poslednji nivo, d: datum, id} - podaci igrača, ne brisati.
const REK_MAX=10, REK_KEY='kolega-rekordi', IME_KEY='kolega-ime';
let rekordi=[], newRek=null;
try{ rekordi=JSON.parse(localStorage.getItem(REK_KEY)||'[]'); if(!Array.isArray(rekordi)) rekordi=[]; }catch(e){ rekordi=[]; }
if(rekordi[0] && rekordi[0].s>hi) hi=rekordi[0].s;

// ---------- FORMACIJA ----------
function mkEnemy(type,col,row){ return {type,col,row,hp:ENEMIES[type].hp,alive:true,dive:null,flash:0,spawn:0}; }
function makeForm(y0,list,cfg){ return {x:Math.round((GW-((FORM.cols-1)*FORM.dx+FORM.size))/2), y:y0, dir:1, t:.6, frame:0, list, total:Math.max(1,list.length), cfg}; }
function epos(e){ return e.dive?[e.dive.x,e.dive.y]:[form.x+e.col*FORM.dx, form.y+e.row*FORM.dy]; }
const aliveCount=()=>form.list.reduce((n,e)=>n+(e.alive?1:0),0);
const LV=()=>LEVELS[level];
function curCfg(){ const W=LV().waves; return mode==='wave'?W[wave]:{...W[W.length-1], fire:1.7, maxB:3, stepMax:.24, stepMin:.1}; }
// Korak formacije: što je manje neprijatelja, korak je brži. Na ivici red niže i okret.
function stepForm(dt){
  const live=form.list.filter(e=>e.alive&&!e.dive); if(!live.length) return;
  form.t-=dt; if(form.t>0) return;
  const C=form.cfg||curCfg(), n=aliveCount();
  form.t=C.stepMin+(C.stepMax-C.stepMin)*Math.max(0,(n-1)/Math.max(1,form.total-1));
  form.frame^=1;
  let minC=99,maxC=-1; for(const e of live){ minC=Math.min(minC,e.col); maxC=Math.max(maxC,e.col); }
  const left=form.x+minC*FORM.dx, right=form.x+maxC*FORM.dx+FORM.size;
  if((form.dir>0 && right+FORM.step>GW-FORM.margin) || (form.dir<0 && left-FORM.step<FORM.margin)){ form.y+=FORM.drop; form.dir*=-1; }
  else form.x+=form.dir*FORM.step;
  for(const e of live){ const [x,y]=epos(e); eraseRect(x,y,FORM.size,FORM.size); if(y+FORM.size>=PLAYER_Y && state==='play'){ invaded=true; killPlayer(); } }
}
function enemyFire(dt){
  const C=curCfg(); fireT-=dt; if(fireT>0) return;
  fireT=C.fire*rand(.5,1.5);
  if(bullets.filter(b=>!b.boss).length>=C.maxB) return;
  const live=form.list.filter(e=>e.alive&&!e.dive&&!e.spawn); if(!live.length) return;
  let col=pick(live).col;
  if(Math.random()<.4){ let bd=1e9; for(const e of live){ const d=Math.abs(form.x+e.col*FORM.dx+6-(player.x+6)); if(d<bd){ bd=d; col=e.col; } } } // kolona iznad igrača
  const inCol=live.filter(e=>e.col===col).sort((a,b)=>b.row-a.row);
  const s=Math.random()<.65?inCol[0]:pick(inCol), [x,y]=epos(s), kind=ENEMIES[s.type].shot;
  bullets.push({kind,x:x+6,y:y+11,vy:C.bSpeed*SHOTS[kind].speed,vx:0,t:0,stuck:0});
}
// Batinaš povremeno iskoči iz stroja, jurne nadole ka igraču, pa se vrati na svoje mesto ili izađe sa ekrana.
function updDive(dt){
  const C=curCfg();
  if(mode==='wave'){
    diveT-=dt;
    if(diveT<=0){
      diveT=C.dive*rand(.6,1.4);
      const cand=form.list.filter(e=>e.alive&&e.type==='batinas'&&!e.dive&&!e.spawn), now=form.list.filter(e=>e.alive&&e.dive).length;
      if(cand.length && now<(wave===2?2:1)){ const e=pick(cand), [x,y]=epos(e); e.dive={x,y,ph:'down',back:Math.random()<DIVE.back}; }
    }
  }
  for(const e of form.list){
    if(!e.alive||!e.dive) continue; const d=e.dive;
    if(d.ph==='down'){
      d.y+=DIVE.down*(1+wave*.12)*dt; d.x+=Math.sign(player.x-d.x)*Math.min(Math.abs(player.x-d.x),DIVE.steer*dt);
      if(d.y>=GROUND-FORM.size){ d.y=GROUND-FORM.size; d.ph=d.back?'up':'out'; } // stane na crvenu liniju: odbije se nazad ili potone
    } else if(d.ph==='out'){ d.y+=DIVE.sink*dt; if(d.y>=GROUND){ e.alive=false; e.dive=null; continue; } } // tone ispod linije (crta se samo deo iznad nje)
    else {
      const sx=form.x+e.col*FORM.dx, sy=form.y+e.row*FORM.dy, dx=sx-d.x, dy=sy-d.y, dist=Math.hypot(dx,dy), sp=DIVE.up*dt;
      if(dist<=sp){ e.dive=null; continue; } d.x+=dx/dist*sp; d.y+=dy/dist*sp;
    }
    eraseRect(d.x,d.y,FORM.size,FORM.size);
    if(state==='play' && overlap(d.x+1,d.y+1,10,10,player.x+1,PLAYER_Y+2,10,8)) killPlayer();
  }
}
function hitEnemy(e,ex,ey){
  e.hp--;
  if(e.hp>0){ e.flash=.35; sfx('batinas1'); return; }
  const E=ENEMIES[e.type], diving=!!e.dive;
  e.alive=false; e.dive=null; killed.push(e.type);
  addScore(diving?E.pts*2:E.pts); fx.push({x:ex,y:ey,t:.3,k:'boom'}); sfx('hit',e.type);
  if(diving) popup(ex+6,ey,'+'+E.pts*2,'#ffc93c');
  if(Math.random()<POWER.chance) drops.push({x:ex+6,y:ey+4,kind:pick(Object.keys(POWERS))});
  if(e.type==='bot' && Math.random()<BOT_COPY) copyBot(e);
}
// Bot farma: pogođeni bot se „iskopira“ u prazno mesto u formaciji.
function copyBot(src){
  const empty=form.list.filter(e=>!e.alive&&e!==src); if(!empty.length) return;
  const t=pick(empty); Object.assign(t,{type:'bot',hp:1,alive:true,dive:null,flash:0,spawn:.7});
  const [x,y]=epos(t); popup(x+6,y-2,MSG.copy,'#39d0ff'); sfx('kopija');
}

// ---------- ZAKLONI ----------
// Zaklon = mapa piksela (slovo boje iz PAL ili null) + broj „komada“ za svaki piksel (kaseta ili ploča, briše ga pečat).
function makeShields(){
  shields=[];
  const W=SHIELD.w, H=SHIELD.h, colW=[6,5,5,6], colX=[0,6,11,16], shells=['O','Y','C','P','N'];
  for(let i=0;i<SHIELD.count;i++){
    const sh={x:Math.round(GW*(i+1)/(SHIELD.count+1)-W/2), c:new Array(W*H).fill(null), p:new Int8Array(W*H)};
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const cut=y<3 && (x<3-y || x>W-1-(3-y)), notch=(y>=11 && x>=7 && x<=14) || (y===10 && x>=8 && x<=13);
      if(cut||notch) continue;
      const pc=x<6?0:x<11?1:x<16?2:3, pr=Math.floor(y/4), lx=x-colX[pc], ly=y%4, bw=colW[pc];
      let col;
      if(pr<2){ // kasete: kućište u boji, dva kotura, nalepnica, donja ivica
        col=shells[(pr*4+pc+i)%shells.length];
        if(ly===1 && (lx===1||lx===bw-2)) col='K'; else if(ly===2 && lx>0 && lx<bw-1) col='W'; else if(ly===3) col='D';
      } else { // ploče naslagane na ivicu: crne i sive pruge, etiketa u sredini
        col=y%2===0?'K':'D'; if(y%2===1 && lx===Math.floor(bw/2)) col=(pc+y)%2?'R':'G';
      }
      sh.c[y*W+x]=col; sh.p[y*W+x]=pr*4+pc;
    }
    shields.push(sh);
  }
}
function shieldHit(x,y){
  const ly=y-SHIELD.y; if(ly<0||ly>=SHIELD.h) return null;
  for(const sh of shields){ const lx=x-sh.x; if(lx>=0 && lx<SHIELD.w && sh.c[ly*SHIELD.w+lx]) return {sh,lx,ly}; }
  return null;
}
function crater(sh,cx,cy,r){
  const R=Math.ceil(r+1);
  for(let dy=-R;dy<=R;dy++) for(let dx=-R;dx<=R;dx++){
    const x=cx+dx, y=cy+dy; if(x<0||y<0||x>=SHIELD.w||y>=SHIELD.h) continue;
    const d=Math.hypot(dx,dy); if(d<=r-.4 || (d<=r+.7 && Math.random()<.45)) sh.c[y*SHIELD.w+x]=null;
  }
}
function sealPiece(sh,lx,ly){ const id=sh.p[ly*SHIELD.w+lx]; for(let i=0;i<sh.c.length;i++) if(sh.p[i]===id) sh.c[i]=null; }
function eraseRect(x,y,w,h){
  x=Math.round(x); y=Math.round(y);
  if(y+h<=SHIELD.y || y>=SHIELD.y+SHIELD.h) return;
  for(const sh of shields) for(let yy=Math.max(y,SHIELD.y);yy<Math.min(y+h,SHIELD.y+SHIELD.h);yy++)
    for(let xx=Math.max(x,sh.x);xx<Math.min(x+w,sh.x+SHIELD.w);xx++) sh.c[(yy-SHIELD.y)*SHIELD.w+(xx-sh.x)]=null;
}

// ---------- HICI ----------
function shoot(){ if(shot||state!=='play') return; shot={x:player.x+6,y:PLAYER_Y-6}; sfx('rif'); }
function updShot(dt){
  if(!shot) return; const n=Math.max(1,Math.ceil(SHOT_SPEED*dt));
  for(let i=0;i<n && shot;i++){ shot.y-=SHOT_SPEED*dt/n; shotHits(); }
}
// Rif ide gore piksel po piksel: neprijateljski hitac, zaklon, neprijatelj, džip, bos.
function shotHits(){
  const x=Math.round(shot.x), y=Math.round(shot.y);
  if(y<0){ shot=null; return; }
  for(const b of bullets){
    const B=BULLET[b.kind]; if(b.dead||b.boss&&Math.random()<.5) continue;
    if(Math.abs(b.x-x)<=B.w/2+.5 && y>=b.y && y<=b.y+B.h){ b.dead=true; shot=null; fx.push({x,y,t:.15,k:'spark'}); return; }
  }
  const h=shieldHit(x,y); if(h){ crater(h.sh,h.lx,h.ly,1.6); shot=null; return; }
  for(const e of form.list){
    if(!e.alive||e.spawn>0) continue; const [ex,ey]=epos(e);
    if(x>=ex && x<ex+FORM.size && y>=ey && y<ey+11){ hitEnemy(e,ex,ey); shot=null; return; }
  }
  if(jeep && x>=jeep.x && x<jeep.x+16 && y>=JEEP.y && y<JEEP.y+8){ hitJeep(); shot=null; return; }
  if(boss && state==='play') ({ometac:ometacShot,pecat:pecatShot}[boss.kind]||bossShot)(x,y);
}
function updBullets(dt){
  for(const b of bullets){
    if(b.dead) continue; b.t+=dt;
    if(b.stuck>0){ b.stuck-=dt; if(b.stuck<=0){ crater(b.sh,b.lx,b.ly,SHOTS.naslov.crater); b.dead=true; } continue; }
    if(b.kind==='naslov') b.x+=Math.sin(b.t*5)*10*dt; // lažni naslov leprša
    b.x+=b.vx*dt;
    const dy=b.vy*dt, n=Math.max(1,Math.ceil(dy));
    for(let i=0;i<n && !b.dead && !b.stuck;i++){ b.y+=dy/n; bulletHits(b); }
  }
  bullets=bullets.filter(b=>!b.dead);
}
function bulletHits(b){
  const B=BULLET[b.kind], S=SHOTS[b.kind], x=Math.round(b.x), y=Math.round(b.y+B.h-1);
  if(sol>0 && overlap(b.x-B.w/2,b.y,B.w,B.h,player.x-1,PLAYER_Y-11,14,7)){
    b.dead=true; sol--; fx.push({x,y,t:.15,k:'spark'}); sfx('shieldHit');
    if(!sol) popup(player.x+6,PLAYER_Y-14,'Štit je pao','#aab1bc'); updPw(); return;
  }
  const h=shieldHit(x,y);
  if(h){
    if(S.seal){ sealPiece(h.sh,h.lx,h.ly); popup(x,SHIELD.y-3,MSG.sealed,'#ff5a3c'); sfx('pecat'); b.dead=true; }
    else if(S.stick){ b.stuck=S.stick; b.sh=h.sh; b.lx=h.lx; b.ly=h.ly; }
    else { crater(h.sh,h.lx,h.ly,S.crater); b.dead=true; }
    return;
  }
  if(state==='play' && overlap(b.x-B.w/2,b.y,B.w,B.h,player.x+1,PLAYER_Y+2,10,8)){ b.dead=true; killPlayer(); return; }
  if(y>=GROUND){ b.dead=true; fx.push({x,y:GROUND-1,t:.15,k:'spark'}); }
}

// ---------- DŽIP I BONUSI ----------
function updJeep(dt){
  if(mode!=='wave') return;
  if(!jeep){ jeepT-=dt; if(jeepT<=0){ const dir=Math.random()<.5?1:-1; jeep={x:dir>0?-16:GW,dir,pts:pick(JEEP.pts),sir:0}; } return; }
  jeep.x+=jeep.dir*JEEP.speed*dt; jeep.sir-=dt; if(jeep.sir<=0){ jeep.sir=.5; sfx('sirena'); }
  if(jeep.x<-20||jeep.x>GW+4){ jeep=null; jeepT=rand(...JEEP.every); }
}
function hitJeep(){
  addScore(jeep.pts); fx.push({x:jeep.x+2,y:JEEP.y-1,t:.35,k:'boom'});
  popup(jeep.x+8,JEEP.y+14,MSG.jeep,'#ffc93c'); popup(jeep.x+8,JEEP.y+23,'+'+jeep.pts,'#ffc93c');
  sfx('jeep'); jeep=null; jeepT=rand(...JEEP.every);
}
function updDrops(dt){
  for(const d of drops){
    d.y+=POWER.fall*dt;
    if(state==='play' && overlap(d.x-6,d.y-4,12,8,player.x,PLAYER_Y,12,10)){ d.dead=true; applyPower(d.kind); }
    else if(d.y>GROUND) d.dead=true;
  }
  drops=drops.filter(d=>!d.dead);
}
function applyPower(k){
  const P=POWERS[k]; sfx('power'); pwMsg={k,t:3.5};
  if(k==='pistaljka'){ form.y=Math.max(FORM.top,form.y-FORM.dy); popup(GW/2,GH*.5,'PIŠTALJKA! Svi red nazad!','#ffc93c'); }
  else if(k==='solidarnost'){ sol=POWER.solHits; popup(player.x+6,PLAYER_Y-16,'Solidarnost!','#3ddc84'); }
  else if(k==='demanti'){ for(const b of bullets) fx.push({x:b.x,y:b.y,t:.2,k:'spark'}); bullets=[]; popup(GW/2,GH*.5,'ZVANIČNI DEMANTI!','#f1efe8'); }
  if(!P) return; updPw();
}

// ---------- BOS: MEGAKRKAN ĆACI ----------
// Sprajt 34×24 crta se 2× (68×48). Antene su na x 12-16 (leva) i 18-22 (desna) u sprajtu; ekran rect(2,7,25,13); traka rect(2,17,25,3).
function startBoss(){
  mode='boss'; Mus.setBoss(true); bullets=[]; drops=[]; shot=null; jeep=null; decals=[]; makeShields();
  const kind=LV().boss, B=BOSSES[kind];
  if(kind==='ometac') boss={kind, cfg:B, x:(GW-B.w)/2, y:-60, dir:1, dish:0, hp:B.dishHp, phase:1, f:0, ft:0, fireT:2, jamT:3, jams:[], lamp:false, lampT:0, flash:0, rows:null};
  else if(kind==='pecat') boss={kind, cfg:B, x:(GW-B.w)/2, y:-40, dir:1, hp:B.hp, phase:1, act:'hover', actT:0, tx:0, combo:0, slamT:rand(...B.slam)*.7, inkT:1.5, flash:0};
  else boss={kind, cfg:B, x:(GW-68)/2, y:-50, dir:1, antL:B.antHp, antR:B.antHp, scr:B.scrHp, fireT:2, phase:1, flash:0, part:'', f:0, ft:0, burst:0, burstT:0};
  form=makeForm(0,[],null);
  banner={pre:'Nivo '+(level+1)+' · bos', title:B.name, sub:B.sub, t:2.8, red:true}; setState('bossintro'); sfx('wave'); updHud();
}
function updBoss(dt){ if(boss.kind==='ometac') updOmetac(dt); else if(boss.kind==='pecat') updPecat(dt); else updCaci(dt); }
// Bos poražen: poeni, eksplozije, pa prelaz na sledeći nivo (ili kraj igre posle poslednjeg).
function bossDefeated(pts){
  addScore(pts); sfx('bossDown'); bullets=[]; shot=null; drops=[];
  for(const e of form.list) if(e.alive){ const [ex,ey]=epos(e); fx.push({x:ex,y:ey,t:.3,k:'boom'}); e.alive=false; }
  setState('bossdead');
}
function updCaci(dt){
  const ph2=boss.phase===2;
  boss.ft-=dt; if(boss.ft<=0){ boss.ft=ph2?.2:.35; boss.f^=1; }
  if(boss.flash>0) boss.flash-=dt;
  if(state==='bossintro'){ boss.y=-50+(BOSS.y+50)*Math.min(1,stateT/2.2); return; }
  if(state!=='play') return;
  boss.x+=boss.dir*(ph2?BOSS.speed2:BOSS.speed)*dt;
  if(boss.x<4){ boss.x=4; boss.dir=1; } if(boss.x>GW-72){ boss.x=GW-72; boss.dir=-1; }
  // rafali „udarnih vesti“ iz crvene trake na dnu ekrana
  boss.fireT-=dt;
  if(boss.fireT<=0){ boss.fireT=(ph2?BOSS.fire2:BOSS.fire)*rand(.8,1.2); boss.burst=randInt(...(ph2?BOSS.burst2:BOSS.burst)); boss.burstT=0; }
  if(boss.burst>0){ boss.burstT-=dt; if(boss.burstT<=0){ boss.burstT=.13; boss.burst--;
    const x=boss.x+rand(8,52); bullets.push({kind:'vest',x,y:boss.y+40,vy:BOSS.bSpeed*(ph2?1.15:1),vx:ph2?(player.x+6-x)*.25:0,t:0,stuck:0,boss:true}); } }
}
function bossShot(x,y){
  const rel=x-boss.x, ry=y-boss.y; if(rel<0||rel>=68) return;
  if(shot.through){ if(ry<=10){ hitAnt(shot.through,x); shot=null; } return; } // rif prolazi kroz telo i pogađa antenu
  if(ry>43||ry<10) return;
  if(rel>=22 && rel<36 && boss.antL>0){ shot.through='L'; return; }
  if(rel>=36 && rel<48 && boss.antR>0){ shot.through='R'; return; }
  if(boss.antL<=0 && boss.antR<=0 && rel>=4 && rel<54){ hitScreen(x,y); shot=null; return; }
  sfx('tink'); fx.push({x,y,t:.15,k:'spark'}); shot=null; // oklop: dok antene rade, ekran je zaštićen
}
function hitAnt(side,x){
  const k='ant'+side; boss[k]--; boss.flash=.12; boss.part=side; addScore(BOSS.pts.ant); sfx('bossHit');
  fx.push({x:x-1,y:boss.y+4,t:.15,k:'spark'});
  if(boss[k]<=0){
    addScore(BOSS.pts.antDown); sfx('antDown'); fx.push({x:boss.x+(side==='L'?24:36),y:boss.y,t:.35,k:'boom'});
    popup(boss.x+34,boss.y+56,boss.antL<=0&&boss.antR<=0?'Antene pale! Gađaj ekran!':'Antena pala!','#ffc93c');
  }
}
function hitScreen(x,y){
  boss.scr--; boss.flash=.12; boss.part='S'; addScore(BOSS.pts.scr); sfx('bossHit'); fx.push({x,y,t:.15,k:'spark'});
  if(boss.phase===1 && boss.scr<=BOSS.scrHp/2){ // faza 2: ekran se kvari i pušta „reprizu“
    boss.phase=2; popup(boss.x+34,boss.y+56,MSG.reprise,'#ff5a3c'); sfx('sum');
    const types=killed.slice(-BOSS.reprise); while(types.length<BOSS.reprise) types.push(pick(LV().rows));
    form=makeForm(boss.y+56,types.map((t,i)=>mkEnemy(t,2+i*2,0)),{stepMax:.24,stepMin:.12});
    form.list.forEach(e=>e.spawn=.7);
  }
  if(boss.scr<=0) bossDefeated(BOSS.pts.down);
}
function bossRows(){
  const rows=megakrkanCaci(boss.f).map(r=>r.split(''));
  for(let i=0;i<5;i++){ if(boss.antL<=0) rows[i][12+i]='.'; if(boss.antR<=0) rows[i][22-i]='.'; }
  return rows.map(r=>r.join(''));
}

// ---------- BOS NIVOA 2: MEGAKRKAN PEČAT ----------
// Lebdi samo pečat (redovi 0-17 sprajta = 60×36); dok je spušten crta se frejm 1 (pečat na „papiru“).
// Oči su u redovima 11-12 sprajta, kolone 8-11 i 18-21: otvorene (ranjive) samo dok je pečat podignut.
const PECAT_UP=megakrkanPecat(0).slice(0,18), PECAT_DOWN=megakrkanPecat(1).slice(7);
const EYES=[[8,11],[18,21]];
const closeEyes=rows=>rows.map((r,j)=>j===11||j===12?r.replace(/[WK]/g,'G'):r);
const PECAT_UP_SHUT=closeEyes(PECAT_UP), PECAT_DOWN_SHUT=closeEyes(PECAT_DOWN);
const pecatRaised=()=>boss.act==='hover'||boss.act==='aim';
function updPecat(dt){
  const B=PECAT, ph2=boss.phase===2;
  if(boss.flash>0) boss.flash-=dt;
  if(state==='bossintro'){ boss.y=-40+(B.y+40)*Math.min(1,stateT/2.2); return; }
  if(state!=='play') return;
  boss.actT+=dt;
  if(boss.act==='hover'){
    boss.x+=boss.dir*(ph2?B.speed2:B.speed)*dt;
    if(boss.x<4){ boss.x=4; boss.dir=1; } if(boss.x>GW-4-B.w){ boss.x=GW-4-B.w; boss.dir=-1; }
    boss.inkT-=dt;
    if(boss.inkT<=0){ boss.inkT=(ph2?B.ink2:B.ink)*rand(.7,1.3);
      for(let i=0;i<2;i++) bullets.push({kind:'mastilo',x:boss.x+rand(12,48),y:boss.y+B.h-2,vy:B.bSpeed*rand(.9,1.15),vx:0,t:0,stuck:0,boss:true}); }
    boss.slamT-=dt;
    if(boss.slamT<=0){
      boss.combo=ph2?2:1; pecatAim(); // faza 2: dva udarca zaredom
    }
  } else if(boss.act==='aim'){ // dolazi iznad igrača i stoji; na podu trepće crvena meta (u fazi 2 brže i kraće)
    const d=boss.tx-boss.x; boss.x+=Math.sign(d)*Math.min(Math.abs(d),(ph2?B.seek:140)*dt);
    if(boss.actT>=(ph2?B.aim2:B.aim)){ boss.act='drop'; boss.actT=0; }
  } else if(boss.act==='drop'){
    boss.y+=(ph2?B.drop2:B.drop)*dt; if(boss.y>=GROUND-B.h){ boss.y=GROUND-B.h; slam(); }
  } else if(boss.act==='stuck'){ if(boss.actT>=(ph2?B.stuck2:B.stuck)){ boss.act='rise'; boss.actT=0; } }
  else if(boss.act==='rise'){
    boss.y-=(ph2?B.rise2:B.rise)*dt;
    if(boss.y<=B.y){ boss.y=B.y; boss.actT=0;
      if(boss.combo>1){ boss.combo--; pecatAim(); } // drugi udarac odmah
      else { boss.combo=0; boss.act='hover'; boss.slamT=rand(...(ph2?B.slam2:B.slam)); } }
  }
}
function pecatAim(){ boss.act='aim'; boss.actT=0; boss.tx=pecatOver(); sfx('aim'); }
const pecatOver=()=>Math.max(4,Math.min(GW-4-PECAT.w,player.x+6-PECAT.w/2)); // x pečata tačno iznad igrača
// Udarac: zgnječi zaklone i igrača ispod sebe i ostavi trag „ODUZETA FREKVENCIJA“ (gde udari, zaklon nestaje).
function slam(){
  const B=PECAT; boss.act='stuck'; boss.actT=0; shakeT=.4; sfx('slam');
  eraseRect(boss.x+6,SHIELD.y-4,B.w-12,SHIELD.h+8);
  decals.push({x:boss.x+B.w/2,t:B.mark,r:rand(-.09,.09)});
  if(state==='play' && overlap(boss.x+8,GROUND-B.h,B.w-16,B.h,player.x+1,PLAYER_Y+2,10,8)) killPlayer();
}
// Rif u koloni oka prolazi kroz jastuče i pogađa oko - samo dok je pečat podignut; svuda drugde ga zaustavi pečat („tink“).
function pecatShot(x,y){
  const rel=x-boss.x, ry=y-boss.y, sx=Math.floor(rel/2), sy=Math.floor(ry/2), rows=pecatRows();
  if(sx<0||sx>=30||sy<0||sy>=rows.length) return;
  if(pecatRaised() && EYES.some(([a,b])=>sx>=a-1&&sx<=b+1)){ if(sy<=12) hitPecat(x,y); return; } // oko i po kolona sprajta levo i desno od njega
  if(rows[sy][sx]!=='.'){ sfx('tink'); fx.push({x,y,t:.15,k:'spark'}); shot=null; }
}
function hitPecat(x,y){
  const B=PECAT; shot=null; boss.hp--; boss.flash=.12; addScore(B.pts.hit); sfx('bossHit'); fx.push({x,y,t:.15,k:'spark'});
  if(boss.phase===1 && boss.hp<=B.hp/2){ boss.phase=2; popup(boss.x+B.w/2,boss.y+B.h+10,'Pečat je ljut!','#ff5a3c'); sfx('sum'); boss.slamT=Math.min(boss.slamT,1.2); }
  if(boss.hp<=0) bossDefeated(B.pts.down);
}
function pecatRows(){ const down=boss.act==='stuck', open=pecatRaised(); return down?(open?PECAT_DOWN:PECAT_DOWN_SHUT):(open?PECAT_UP:PECAT_UP_SHUT); }
function drawPecat(){
  const B=PECAT, bx=Math.round(boss.x), by=Math.round(boss.y);
  if(boss.act==='aim' && Math.floor(clock*10)%2===0){ // meta: crvena linija na podu i isprekidane ivice
    const tx=Math.round(boss.tx)+8, w=B.w-16; g.fillStyle='#ff5a3c'; g.fillRect(tx,GROUND-2,w,2);
    for(let y=by+B.h+4;y<GROUND-4;y+=6){ g.fillRect(tx,y,1,3); g.fillRect(tx+w-1,y,1,3); }
  }
  drawSprite(g,pecatRows(),bx,by,B.scale);
  if(boss.flash>0){ g.fillStyle='rgba(255,255,255,.7)'; for(const [a,b] of EYES) g.fillRect(bx+a*2,by+22,(b-a+1)*2,4); }
  if(boss.phase===2 && boss.act!=='stuck') for(let i=0;i<3;i++){ g.fillStyle=PAL.U; g.fillRect(bx+12+Math.floor(Math.random()*36),by+B.h+Math.floor(Math.random()*3),1,1); } // curi mastilo
}
// Trag udarca: crveni pravougaoni pečat sa natpisom, malo nakrivljen, preko mesta gde su bili zakloni (crta se u punoj rezoluciji).
function drawMarks(){
  for(const d of decals){
    ctx.save(); ctx.globalAlpha=Math.min(1,d.t/2)*.85; ctx.translate(Math.min(Math.max(d.x,30),GW-30),SHIELD.y+8); ctx.rotate(d.r);
    ctx.strokeStyle='#ff5a3c'; ctx.lineWidth=1; ctx.strokeRect(-28,-8,56,16); ctx.lineWidth=.5; ctx.strokeRect(-26.5,-6.5,53,13);
    ctx.font=`700 5.2px 'UG Cifre', 'Pixelify Sans', monospace`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#ff5a3c';
    ctx.fillText(MSG.revoked[0],0,-2.4); ctx.fillText(MSG.revoked[1],0,3); ctx.restore();
  }
}

// ---------- BOS NIVOA 3: MEGAKRKAN OMETAČ ----------
// Sprajt 32×28 crta se 2×. Tanjiri (u pikselima sprajta, redom kojim se ruše - odozdo nagore): tanjir + talasi su pravougaonik x0-x1, cy..cy+3.
const DISHES=[{x0:2,x1:7,cy:16,dir:-1},{x0:24,x1:29,cy:16,dir:1},{x0:5,x1:10,cy:8,dir:-1},{x0:21,x1:26,cy:8,dir:1}];
function ometacRows(){
  const rows=megakrkanOmetac(boss.f).map(r=>r.split(''));
  for(let i=0;i<boss.dish;i++){ const D=DISHES[i]; for(let y=D.cy;y<D.cy+4;y++) for(let x=D.x0;x<=D.x1;x++) rows[y][x]='.'; } // pali tanjiri
  rows[0][15]=rows[0][16]=boss.lamp?'R':'M'; // lampica svetli samo u fazi 2, dok kontrole kasne
  return rows.map(r=>r.join(''));
}
function updOmetac(dt){
  const B=OMETAC, ph2=boss.phase===2;
  boss.ft-=dt; if(boss.ft<=0){ boss.ft=ph2?.22:.35; boss.f^=1; }
  if(boss.flash>0) boss.flash-=dt;
  boss.rows=ometacRows();
  if(state==='bossintro'){ boss.y=-60+(B.y+60)*Math.min(1,stateT/2.2); return; }
  if(state!=='play'){ boss.lamp=false; boss.jams=[]; return; } // posle gubitka života kreće ispočetka
  boss.x+=boss.dir*(ph2?B.speed2:B.speed)*dt;
  if(boss.x<4){ boss.x=4; boss.dir=1; } if(boss.x>GW-4-B.w){ boss.x=GW-4-B.w; boss.dir=-1; }
  // smetnje iz tanjira koji još rade
  boss.fireT-=dt;
  if(boss.fireT<=0){ boss.fireT=(ph2?B.fire2:B.fire)*rand(.7,1.3);
    if(bullets.filter(b=>b.boss).length<B.maxB){
      const D=DISHES[randInt(boss.dish,3)], tx=D.dir<0?D.x0:D.x1, x=boss.x+tx*2+1, y=boss.y+(D.cy+2)*2;
      bullets.push({kind:'smetnja',x,y,vy:B.bSpeed*rand(.9,1.1),vx:ph2?(player.x+6-x)*.22:D.dir*10,t:0,stuck:0,boss:true}); } }
  // talas smetnji: pojas ekrana iznad igrača se na trenutak ugasi (prvo trepne upozorenje)
  boss.jamT-=dt;
  if(boss.jamT<=0){ boss.jamT=rand(...(ph2?B.jam2:B.jam));
    const W=B.jamW, at=c=>Math.max(0,Math.min(GW-W,Math.round(c-W/2)));
    boss.jams.push({x:at(player.x+6+rand(-20,20)),w:W,t:0,on:ph2?B.jamOn2:B.jamOn});
    if(ph2){ const o=boss.jams[boss.jams.length-1], x2=o.x+W/2<GW/2?rand(o.x+W+8,GW-W):rand(0,Math.max(0,o.x-W-8)); boss.jams.push({x:Math.round(x2),w:W,t:0,on:B.jamOn2}); }
  }
  for(const j of boss.jams){ const was=j.t<B.jamWarn; j.t+=dt; if(was && j.t>=B.jamWarn) sfx('sum'); }
  boss.jams=boss.jams.filter(j=>j.t<B.jamWarn+j.on);
  // faza 2: lampica na vrhu se pali i gasi; dok svetli, kontrole kasne
  if(ph2){ boss.lampT-=dt;
    if(boss.lampT<=0){ boss.lamp=!boss.lamp; boss.lampT=boss.lamp?B.lampOn:rand(...B.lampOff);
      if(boss.lamp){ popup(GW/2,PLAYER_Y-20,MSG.lag,'#ff5a3c'); sfx('lag'); } } }
}
// Rif u koloni tanjira koji je na redu prolazi kroz konstrukciju i pogađa ga; svuda drugde ga zaustavi gvožđe („tink“).
function ometacShot(x,y){
  const sx=Math.floor((x-boss.x)/2), sy=Math.floor((y-boss.y)/2); if(sx<0||sx>=32||sy<0||sy>=28) return;
  const D=DISHES[boss.dish];
  if(D && sx>=D.x0 && sx<=D.x1){ if(sy<=D.cy+3) hitDish(x,y); return; }
  if(boss.rows && boss.rows[sy][sx]!=='.'){ sfx('tink'); fx.push({x,y,t:.15,k:'spark'}); shot=null; }
}
function hitDish(x,y){
  const B=OMETAC, D=DISHES[boss.dish]; shot=null; boss.hp--; boss.flash=.12; addScore(B.pts.hit); sfx('bossHit'); fx.push({x,y,t:.15,k:'spark'});
  if(boss.hp>0) return;
  boss.dish++; boss.hp=B.dishHp; addScore(B.pts.dish); sfx('antDown');
  fx.push({x:boss.x+D.x0*2,y:boss.y+D.cy*2-1,t:.35,k:'boom'});
  if(boss.dish>=DISHES.length){ boss.lamp=false; boss.jams=[]; bossDefeated(B.pts.down); return; }
  popup(boss.x+B.w/2,boss.y+B.h+8,boss.dish===2?'Donji tanjiri pali! Lampica se pali...':MSG.dish,'#ffc93c');
  if(boss.dish===2){ boss.phase=2; boss.lampT=1.6; sfx('sum'); }
}
function drawOmetac(){
  const bx=Math.round(boss.x), by=Math.round(boss.y), D=DISHES[boss.dish];
  drawSprite(g,boss.rows||ometacRows(),bx,by,OMETAC.scale);
  if(boss.lamp){ g.fillStyle='rgba(255,90,60,.45)'; g.fillRect(bx+28,by-2,8,5); g.fillRect(bx+26,by,12,1); } // lampica svetli
  if(D && state!=='bossdead'){
    const X=bx+D.x0*2-2, Y=by+D.cy*2-2, W=(D.x1-D.x0+1)*2+4, H=12;
    if(boss.flash>0){ g.fillStyle='rgba(255,255,255,.7)'; g.fillRect(X+2,Y+2,W-4,H-4); }
    else if(Math.floor(clock*4)%2===0){ g.fillStyle=PAL.Y; // uglovi oko tanjira koji je na redu
      for(const [cx,cy,sx,sy] of [[X,Y,1,1],[X+W-1,Y,-1,1],[X,Y+H-1,1,-1],[X+W-1,Y+H-1,-1,-1]]){ g.fillRect(Math.min(cx,cx+sx*2),cy,3,1); g.fillRect(cx,Math.min(cy,cy+sy*2),1,3); } }
  }
}
// Talasi smetnji: pojas od dna bosa do iznad igrača; igrač ostaje vidljiv, hici u pojasu ne.
function drawJams(){
  if(!boss || boss.kind!=='ometac') return;
  const B=OMETAC, top=Math.round(boss.y+B.h+2), bot=PLAYER_Y-3;
  for(const j of boss.jams){
    if(j.t<B.jamWarn){ if(Math.floor(j.t*12)%2) continue; g.fillStyle=PAL.P; // upozorenje: isprekidane ivice
      for(let y=top;y<bot;y+=5){ g.fillRect(j.x,y,1,3); g.fillRect(j.x+j.w-1,y,1,3); } continue; }
    g.fillStyle='rgba(7,8,10,.95)'; g.fillRect(j.x,top,j.w,bot-top);
    for(let i=0;i<70;i++){ const v=Math.floor(Math.random()*150)+50; g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(j.x+Math.floor(Math.random()*j.w),top+Math.floor(Math.random()*(bot-top)),1,1); }
    for(let i=0;i<3;i++){ g.fillStyle='rgba(255,79,163,.35)'; g.fillRect(j.x,top+Math.floor(Math.random()*(bot-top)),j.w,1); }
  }
}
// Kašnjenje kontrola: dok lampica svetli, igra čita tastere od pre `lag` sekundi.
let keyHist=[];
const lagOn=()=>boss && boss.kind==='ometac' && boss.lamp && state==='play';
function ctl(){
  keyHist.push({t:clock,L:keys.L,R:keys.R,F:keys.F}); while(keyHist.length && keyHist[0].t<clock-1.5) keyHist.shift();
  if(!lagOn()) return keys;
  let k={L:false,R:false,F:false}; for(const h of keyHist){ if(h.t>clock-OMETAC.lag) break; k=h; } return k;
}

// ---------- DOGAĐAJI ----------
function addScore(n){
  score+=n;
  while(score>=nextLife){ nextLife+=LIFE_EVERY; lives++; popup(player.x+6,PLAYER_Y-8,'+1 ŽIVOT','#3ddc84'); sfx('life'); }
  if(score>hi){ hi=score; try{ localStorage.setItem('kolega-hi',hi); }catch(e){} }
  updHud();
}
function popup(x,y,text,color){ popups.push({x,y,text,color:color||'#f1efe8',t:1.5}); }
function killPlayer(){
  if(state!=='play') return;
  deathMsg=invaded?MSG.invaded:pick(MSG.death); setState('dying'); sfx('death'); bullets=[]; shot=null; sol=0; updPw();
  for(const e of form.list) e.dive=null;
}
function setState(s){ state=s; stateT=0; if(s!=='title'&&s!=='over'&&s!=='won') hideOv(); }
function startWave(i){
  wave=i; mode='wave'; const W=LV().waves[i];
  const list=[]; for(let r=0;r<FORM.rows;r++) for(let c=0;c<FORM.cols;c++) list.push(mkEnemy(LV().rows[r],c,r));
  form=makeForm(W.y0,list,null);
  makeShields(); bullets=[]; drops=[]; decals=[]; shot=null; jeep=null; jeepT=rand(...JEEP.every);
  fireT=1.5; diveT=W.dive*rand(.6,1); noiseCD=3; player.x=(GW-12)/2;
  banner={pre:'Nivo '+(level+1)+' · '+LV().name, title:W.title, sub:W.sub, t:2.4}; setState('intro'); if(i>0||level>0) sfx('wave'); updHud();
}
function startLevel(i){ level=i; boss=null; Mus.setLevel(i); startWave(0); }
function newGame(from){
  newRek=null; renderRek(); initAudio();
  score=0; lives=START_LIVES; nextLife=LIFE_EVERY; killed=[]; boss=null; sol=0; pwMsg=null; invaded=false; won=false; fx=[]; popups=[];
  startLevel(from||0); updPw();
}

// ---------- UPDATE ----------
function update(dt){
  stateT+=dt; clock+=dt;
  for(const p of popups) p.t-=dt; popups=popups.filter(p=>p.t>0);
  for(const f of fx) f.t-=dt; fx=fx.filter(f=>f.t>0);
  if(banner){ banner.t-=dt; if(banner.t<=0) banner=null; }
  if(pwMsg){ pwMsg.t-=dt; if(pwMsg.t<=0){ pwMsg=null; updPw(); } }
  if(noiseT>0) noiseT-=dt;
  if(shakeT>0) shakeT-=dt;
  for(const d of decals) d.t-=dt; decals=decals.filter(d=>d.t>0);
  if(form) for(const e of form.list){ if(e.flash>0) e.flash-=dt; if(e.spawn>0) e.spawn=Math.max(0,e.spawn-dt); }
  const moving=state==='play'||state==='intro'||state==='ready'||state==='bossintro'||state==='clear'||state==='levelclear';
  const k=ctl(); // tasteri (sa kašnjenjem dok svetli lampica Megakrkan Ometača)
  if(moving){ player.x=Math.max(4,Math.min(GW-16,player.x+((k.R?1:0)-(k.L?1:0))*PLAYER_SPEED*dt)); }
  if(boss) updBoss(dt);

  if(state==='intro'){ if(stateT>=2.4) setState('play'); return; }
  if(state==='bossintro'){ if(stateT>=2.8) setState('play'); return; }
  if(state==='ready'){ if(stateT>=1.3) setState('play'); return; }
  if(state==='clear'){ updShot(dt); if(stateT>=1.4){ if(wave<LV().waves.length-1) startWave(wave+1); else startBoss(); } return; }
  if(state==='levelclear'){ if(stateT>=3.6) startLevel(level+1); return; }
  if(state==='dying'){
    if(stateT>=1.9){
      lives--; if(invaded) lives=0;
      if(lives<=0){ state='over'; Mus.playing=false; sfx('over'); endGame(); }
      else { player.x=(GW-12)/2; setState('ready'); }
      updHud();
    }
    return;
  }
  if(state==='bossdead'){
    if(Math.random()<dt*14) fx.push({x:boss.x+rand(0,56),y:boss.y+rand(4,40),t:.3,k:'boom'});
    if(stateT>=2.8){
      boss=null; sfx('win');
      if(level<LEVELS.length-1){ // sledeći nivo: kratka pauza sa porukom, pa nastavlja sa istim poenima i životima
        banner={pre:'Nivo '+(level+1)+' pređen!',title:'Signal se ne gasi.',sub:'Sledeće: nivo '+(level+2)+' · '+LEVELS[level+1].name,t:3.6};
        setState('levelclear'); updHud();
      } else { won=true; state='won'; endGame(); }
    }
    return;
  }
  if(state!=='play') return;

  if(k.F) shoot();
  stepForm(dt); if(state!=='play') return;
  enemyFire(dt); updDive(dt); updJeep(dt);
  updShot(dt); updBullets(dt); updDrops(dt);
  // ometač: kad je stroj nisko (donja trećina), ekran povremeno zašumi
  if(mode==='wave' && form.list.some(e=>e.alive&&e.type==='ometac'&&!e.dive)){
    const low=Math.max(...form.list.filter(e=>e.alive&&!e.dive).map(e=>epos(e)[1]+FORM.size));
    if(low>GH*2/3){ noiseCD-=dt; if(noiseCD<=0){ noiseCD=rand(3,6); noiseT=.45; sfx('sum'); } }
  }
  if(mode==='wave' && state==='play' && aliveCount()===0){ setState('clear'); sfx('wave'); bullets=[]; }
}

// ---------- CRTANJE ----------
function flip(rows){ return rows.map(r=>r.split('').reverse().join('')); }
function drawZig(x,y,h,cols,shift){ for(let i=0;i<h;i++){ g.fillStyle=PAL[cols[(i+shift)%cols.length]]; g.fillRect(x+[1,2,1,0][(i+shift)%4],y+i,1,1); } }
function drawWorld(){
  g.fillStyle='#0b0d10'; g.fillRect(0,0,GW,GH);
  for(const [x,y,c] of STARS){ g.fillStyle=c; g.fillRect(x,y,1,1); }
  g.fillStyle='#14171c'; g.fillRect(0,GROUND+1,GW,GH-GROUND-1);
  g.fillStyle='#ff5a3c'; g.fillRect(0,GROUND,GW,1);
  const tick=Math.floor(clock*12);
  // zakloni
  for(const sh of shields) for(let y=0;y<SHIELD.h;y++) for(let x=0;x<SHIELD.w;x++){
    const c=sh.c[y*SHIELD.w+x]; if(c){ g.fillStyle=PAL[c]; g.fillRect(sh.x+x,SHIELD.y+y,1,1); }
  }
  // bos
  const bossVis=boss && !(state==='bossdead' && Math.floor(stateT*10)%2);
  if(bossVis && boss.kind==='ometac') drawOmetac();
  else if(bossVis && boss.kind==='pecat') drawPecat();
  else if(bossVis){
    const bx=Math.round(boss.x), by=Math.round(boss.y);
    drawSprite(g,bossRows(),bx,by,BOSS.scale);
    if(boss.phase===2){ // pokvaren ekran pušta reprizu
      for(let i=0;i<70;i++){ g.fillStyle=pick(['#f1efe8','#9aa1ad','#111018','#ff4fa3']); g.fillRect(bx+4+Math.floor(Math.random()*50),by+14+Math.floor(Math.random()*20),2,1); }
    }
    if(boss.flash>0){
      g.fillStyle='rgba(255,255,255,.7)';
      if(boss.part==='S') g.fillRect(bx+4,by+14,50,26);
      else g.fillRect(bx+(boss.part==='L'?24:36),by,10,10);
    }
  }
  // formacija
  if(form) for(const e of form.list){
    if(!e.alive) continue; if(e.spawn>0 && Math.floor(e.spawn*14)%2) continue;
    const [x,y]=epos(e), fr=e.dive?(tick>>1)%2:form.frame;
    let rows=SPR[e.type][fr];
    if(e.flash>0 && tick%2) rows=rows.map(r=>r.replace(/[^.]/g,'W'));
    const sink=e.dive && e.dive.ph==='out'; if(sink){ g.save(); g.beginPath(); g.rect(0,0,GW,GROUND); g.clip(); }
    drawSprite(g,rows,Math.round(x),Math.round(y),1);
    if(sink) g.restore();
    if(e.type==='batinas' && e.hp===1 && !sink){ g.fillStyle=PAL.R; g.fillRect(Math.round(x)+3,Math.round(y)+2,1,1); g.fillRect(Math.round(x)+8,Math.round(y)+3,1,1); } // modrice posle prvog pogotka
  }
  // džip
  if(jeep){ const r=SPR.dzip[(tick>>1)%2]; drawSprite(g,jeep.dir>0?r:flip(r),Math.round(jeep.x),JEEP.y,1); }
  // bonusi koji padaju
  for(const d of drops){ const r=PW[d.kind]; if(tick%6<5) drawSprite(g,r,Math.round(d.x-r[0].length/2),Math.round(d.y-r.length/2),1); }
  // igrač
  if(state!=='title' && state!=='over' && state!=='won'){
    const px=Math.round(player.x), rows=SPR.igrac[Math.floor(clock*3)%2];
    if(state==='dying'){
      const k=Math.min(1,stateT/1.2);
      for(let j=0;j<rows.length;j++) for(let i=0;i<rows[j].length;i++){ const c=PAL[rows[j][i]]; if(!c||Math.random()<k*.8) continue;
        g.fillStyle=Math.random()<.3?PAL.Y:c; g.fillRect(px+i+Math.round((Math.random()-.5)*k*14),PLAYER_Y+j+Math.round((Math.random()-.5)*k*8),1,1); }
    } else if(!(state==='ready' && tick%4<2)) drawSprite(g,rows,px,PLAYER_Y,1);
    if(sol>0) drawSprite(g,PW.solidarnost,px,PLAYER_Y-11,1);
  }
  // rif
  if(shot) drawZig(Math.round(shot.x)-1,Math.round(shot.y),7,['Y','O'],tick);
  // neprijateljski hici
  for(const b of bullets){
    const B=BULLET[b.kind], x=Math.round(b.x-B.w/2), y=Math.round(b.y);
    if(B.zig) drawZig(x,y,B.h,B.zig,tick); else drawSprite(g,B.rows,x,y,1);
  }
  drawJams();
  // eksplozije i varnice
  for(const f of fx){
    if(f.k==='boom') drawSprite(g,BOOM,Math.round(f.x),Math.round(f.y)+1,1);
    else { g.fillStyle=PAL.Y; g.fillRect(Math.round(f.x)-1,Math.round(f.y),3,1); g.fillRect(Math.round(f.x),Math.round(f.y)-1,1,3); }
  }
  // traka energije bosa
  if(boss && state!=='bossdead'){
    const x0=86, y0=3, seg=(x,w,v,max,c)=>{ g.fillStyle='#262b33'; g.fillRect(x,y0,w,3); g.fillStyle=c; g.fillRect(x,y0,Math.round(w*Math.max(0,v)/max),3); };
    if(boss.kind==='ometac') DISHES.forEach((D,i)=>seg(x0+i*38,36,i<boss.dish?0:i>boss.dish?OMETAC.dishHp:boss.hp,OMETAC.dishHp,i<2?PAL.Y:boss.phase===2?PAL.P:'#ff5a3c'));
    else if(boss.kind==='pecat') seg(x0,GW-x0-4,boss.hp,PECAT.hp,boss.phase===2?PAL.P:'#ff5a3c');
    else { seg(x0,22,boss.antL,BOSS.antHp,PAL.Y); seg(x0+24,22,boss.antR,BOSS.antHp,PAL.Y); seg(x0+48,GW-x0-52,boss.scr,BOSS.scrHp,boss.phase===2?PAL.P:'#ff5a3c'); }
  }
  if(lagOn()){ g.fillStyle=Math.floor(clock*6)%2?'#ff5a3c':'#8a1f2a'; g.fillRect(0,0,GW,1); g.fillRect(0,GROUND-1,GW,1); g.fillRect(0,0,1,GROUND); g.fillRect(GW-1,0,1,GROUND); } // okvir: kontrole kasne
  // „zašumljen“ ekran (ometač)
  if(noiseT>0){
    for(let i=0;i<900;i++){ const v=Math.floor(Math.random()*200)+40; g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(Math.floor(Math.random()*GW),Math.floor(Math.random()*GH),1,1); }
    for(let i=0;i<4;i++){ g.fillStyle='rgba(241,239,232,.25)'; g.fillRect(0,Math.floor(Math.random()*GH),GW,1); }
  }
}
function text(t,x,y,size,color,align){
  ctx.font=`700 ${size}px 'UG Cifre', 'Pixelify Sans', monospace`; ctx.textAlign=align||'center'; ctx.textBaseline='middle';
  ctx.lineWidth=size*.28; ctx.strokeStyle='#0b0d10'; ctx.lineJoin='round'; ctx.strokeText(t,x,y); ctx.fillStyle=color; ctx.fillText(t,x,y);
}
function render(){
  drawWorld();
  ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false;
  const sh=shakeT>0?Math.round((Math.random()-.5)*4)*K:0, sv=shakeT>0?Math.round((Math.random()-.5)*4)*K:0; // udarac pečata trese ekran
  if(sh||sv){ ctx.fillStyle='#0b0d10'; ctx.fillRect(0,0,cv.width,cv.height); }
  ctx.drawImage(buf,sh,sv,cv.width,cv.height);
  ctx.setTransform(K,0,0,K,0,0); // tekst u logičkim jedinicama, ali u punoj rezoluciji
  drawMarks(); // tragovi udarca pečata
  for(const p of popups){ ctx.globalAlpha=Math.min(1,p.t*1.6); const x=Math.min(Math.max(p.x,40),GW-40); text(p.text,x,p.y-(1.5-p.t)*6,7,p.color); }
  ctx.globalAlpha=1;
  if(boss && state!=='bossdead') text(boss.cfg.name.toUpperCase(),83,4.5,6,'#f1efe8','right');
  if(banner){
    ctx.globalAlpha=Math.min(1,banner.t*2); ctx.fillStyle='rgba(11,13,16,.75)'; ctx.fillRect(0,GH*.4-24,GW,42);
    if(banner.pre) text(banner.pre,GW/2,GH*.4-17,7,'#aab1bc');
    text(banner.title.toUpperCase(),GW/2,GH*.4-4,16,banner.red?'#ff5a3c':'#ffc93c'); text(banner.sub,GW/2,GH*.4+11,7.5,'#f1efe8'); ctx.globalAlpha=1;
  }
  if(state==='dying') text(deathMsg,GW/2,GH*.55,11,'#ff5a3c');
  if(state==='ready') text('U ETRU!',GW/2,GH*.55,13,'#ffc93c');
  if(state==='clear') text('TALAS ODBIJEN!',GW/2,GH*.45,14,'#ffc93c');
  if(state==='bossdead' && stateT>.6) text({pecat:'PEČAT PONIŠTEN!',ometac:'ANTENA OBORENA!'}[boss.kind]||'MEGAKRKAN UGAŠEN!',GW/2,GH*.45,14,'#ffc93c');
  if(state==='paused'){
    ctx.fillStyle='rgba(11,13,16,.6)'; ctx.fillRect(0,0,GW,GH);
    text('PAUZA',GW/2,GH/2-6,20,'#f1efe8'); text('pritisni P ili dodirni igralište',GW/2,GH/2+12,7,'#aab1bc');
  }
}

// ---------- HUD ----------
function spriteCanvas(rows,scale,size){
  const k=document.createElement('canvas'), w=rows[0].length*scale, h=rows.length*scale;
  k.width=size||w; k.height=size||h; const c=k.getContext('2d');
  drawSprite(c,rows,Math.floor((k.width-w)/2),Math.floor((k.height-h)/2),scale); return k;
}
let lastHud='';
function updHud(){
  $('score').textContent=fmt(score); $('hi').textContent=fmt(hi);
  $('lvl').textContent=level+1; $('wave').textContent=mode==='boss'?'bos':(wave+1)+'/'+LV().waves.length;
  const key=lives+'|'+level+'|'+mode+'|'+wave+'|'+state; if(key===lastHud) return; lastHud=key;
  // prikazuju se samo rezervni životi: odašiljač koji je u igri se ne broji (lives = rezerva + 1)
  const L=$('lives'), n=Math.max(0,lives-1); L.innerHTML='';
  for(let i=0;i<Math.min(n,4);i++){ const k=spriteCanvas(SPR.igrac[0],2); k.style.width='22px'; k.style.height='18px'; L.appendChild(k); }
  if(n>4){ const m=document.createElement('b'); m.className='lives-more'; m.textContent='+'+(n-4); L.appendChild(m); } // bez rezerve polje ostaje prazno (korisnik: bez nule)
  renderWaves();
}
function updPw(){
  const el=$('pw'); el.innerHTML=''; el.className='';
  let k=null, txt='';
  if(sol>0){ k='solidarnost'; txt=`još ${sol} ${sol===1?'pogodak':'pogotka'}`; }
  else if(pwMsg){ k=pwMsg.k; txt=POWERS[k].text; }
  if(!k){ el.textContent='nema'; return; }
  el.className='on'; el.appendChild(spriteCanvas(PW[k],2,28));
  const d=document.createElement('span'); d.innerHTML=`<b>${POWERS[k].name}</b><br>${txt}`; el.appendChild(d);
}
function renderCast(){
  const box=$('cast'); box.innerHTML='';
  const mk=(target,rows,scale,title,pts,text)=>{ const row=document.createElement('div'); row.className='row';
    row.appendChild(spriteCanvas(rows,scale,40));
    const d=document.createElement('div'); d.innerHTML=`<b>${title}<i>${pts}</i></b><span>${text}</span>`; row.appendChild(d); target.appendChild(row); };
  for(const t of ROW_TYPES){ const E=ENEMIES[t]; mk(box,SPR[t][0],3,E.name,E.pts+' p',E.role); }
  mk(box,SPR.dzip[0],2,'Crni džip bez tablica','50-300 p','Preleće vrhom ekrana. Pogodi ga za bonus.');
  const pw=$('powers'); pw.innerHTML='';
  for(const [k,P] of Object.entries(POWERS)) mk(pw,PW[k],3,P.name,'',P.text);
  mk(pw,SPR.igrac[0],3,'Novi život','+1',`Na svakih ${fmt(LIFE_EVERY)} poena dobijaš još jedan odašiljač u rezervi.`);
}
function renderWaves(){
  const ol=$('waves'); ol.innerHTML=''; const L=LV(), B=BOSSES[L.boss];
  $('lvl-h').innerHTML=`Nivo ${level+1} <small>${L.name}</small>`;
  const items=L.waves.map(w=>[w.title,w.sub]).concat([['Bos',`<b>${B.name}</b> - ${B.about}`]]);
  const done=won||state==='levelclear', cur=state==='title'?-1:mode==='boss'?L.waves.length:wave;
  items.forEach(([n,t],i)=>{ const li=document.createElement('li'); if(i===cur && !done) li.className='now'; else if(i<cur || done) li.className='done';
    li.innerHTML=`<span class="n">${n}</span><span class="t">${t}</span>`; ol.appendChild(li); });
}

// ---------- PREKRIVAČI ----------
let ovAct=null;
function showOv(html,act){ ov.innerHTML=`<div class="card">${html}</div>`; ov.hidden=false; const b=ov.querySelector('.go'); if(b){ b.onclick=e=>{ e.stopPropagation(); act(); }; setTimeout(()=>b.focus({preventScroll:true}),30); } ovAct=act; }
function hideOv(){ ov.hidden=true; ovAct=null; }
function showTitle(){
  showOv(`<h2>${MSG.title}</h2>
  <p>Ti si odašiljač UnderGRAND radija. Ćaci TV, batinaši, botovi, inspektori i ometači hoće da ugase signal. Svaki nivo ima tri talasa, a na kraju bosa.</p>
  <button class="go" type="button">Uključi odašiljač</button>
  <span class="small">Enter ili razmak za start · strelice + razmak za igru</span>`, newGame);
  ov.querySelector('.card').classList.add('center');
}
const lvName=r=>'nivo '+((r.l||0)+1), whereRek=r=>r.w?((r.l||0)>=2?'sva 3 nivoa pređena':lvName(r)+' pređen'):lvName(r)+' · '+(r.t>=3?'bos':'talas '+(r.t+1));
const curRek=()=>({l:level,t:mode==='boss'?LV().waves.length:wave,w:won?1:0});
const reached=()=>whereRek(curRek())+(mode==='boss'&&!won?' ('+BOSSES[LV().boss].name+')':'');
function showOver(){
  showOv(`<span class="tag">kraj igre</span><h2>${fmt(score)} poena</h2>
  <p>${invaded?MSG.invaded+' ':''}${MSG.over}</p><p class="small">Stigao si do: ${reached()}. Rekord: ${fmt(hi)}.</p>
  <button class="go" type="button">Ponovo u etar</button>`, newGame);
}
function showWin(){
  showOv(`<span class="tag">${fmt(score)} poena</span><h2>Sva ${LEVELS.length} nivoa pređena! Signal se ne gasi.</h2>
  <p>${MSG.win}</p><p class="small">Pali su ${LEVELS.map(L=>BOSSES[L.boss].name).join(', ')}. Rekord: ${fmt(hi)}.</p>
  <button class="go" type="button">Nova igra</button>`, newGame);
}
// ---------- REKORDI ----------
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const qualifies=n=>n>0 && (rekordi.length<REK_MAX || n>rekordi[rekordi.length-1].s);
const cleanIni=v=>v.toUpperCase().replace(/[^A-ZČĆŽŠĐ]/g,'').slice(0,3);
function renderRek(){
  const ol=$('rek'); ol.innerHTML='';
  if(!rekordi.length){ ol.innerHTML='<li><span class="empty">Još niko. Budi prvi na listi.</span></li>'; return; }
  rekordi.forEach((r,i)=>{ const li=document.createElement('li'); if(r.id===newRek) li.className='new';
    const [y,m,d]=r.d.split('-'), where=whereRek(r);
    li.innerHTML=`<span class="n">${i+1}.</span><span class="ini">${esc(r.i)}</span><span class="pts">${fmt(r.s)}</span>`+
      `<span class="meta">${where} · ${+d}. ${+m}. ${y}.</span>`; ol.appendChild(li); });
}
function saveRek(ini){
  const now=new Date(), d=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const r={i:ini,s:score,...curRek(),d,id:now.getTime()};
  rekordi.push(r); rekordi.sort((a,b)=>b.s-a.s||a.id-b.id); rekordi=rekordi.slice(0,REK_MAX); newRek=r.id;
  try{ localStorage.setItem(REK_KEY,JSON.stringify(rekordi)); localStorage.setItem(IME_KEY,ini); }catch(e){}
  renderRek();
}
const showEnd=()=>won?showWin():showOver();
function endGame(){ Mus.playing=false; updHud(); if(qualifies(score)) showName(); else showEnd(); }
// Kraj igre sa rezultatom za listu: upis tri slova (srpska latinica), Enter ili dugme „Upiši“.
function showName(){
  let last=''; try{ last=cleanIni(localStorage.getItem(IME_KEY)||''); }catch(e){}
  const place=rekordi.filter(r=>r.s>=score).length+1;
  showOv(`<span class="tag">${won?'sva '+LEVELS.length+' nivoa pređena':'kraj igre'} · ${place}. mesto na listi</span><h2>${fmt(score)} poena</h2>
  <p>${won?MSG.win:MSG.over}</p><p>Ušao si među deset najboljih. Upiši tri slova:</p>
  <div class="ini-row"><input class="ini-in" id="ini" autocomplete="off" spellcheck="false" aria-label="Tri slova" value="${esc(last)}"><button class="go" type="button">Upiši</button></div>
  <span class="small">Samo slova · Enter za upis</span>`, ()=>{
    const v=cleanIni($('ini').value); if(v.length<3){ $('ini').focus(); return; }
    saveRek(v); showEnd();
  });
  const inp=$('ini'), go=ov.querySelector('.go'), sync=()=>{ const v=cleanIni(inp.value); if(v!==inp.value) inp.value=v; go.disabled=v.length<3; };
  inp.addEventListener('input',sync); sync();
  setTimeout(()=>{ inp.focus({preventScroll:true}); inp.select(); },40);
}

// ---------- KONTROLE ----------
const KEYMAP={ArrowLeft:'L',a:'L',A:'L',ArrowRight:'R',d:'R',D:'R',' ':'F'};
addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]')) return; // prozor „Šta je novo“ je otvoren
  if(Boot.active){ e.preventDefault(); if(!e.repeat) Boot.key(e.key); return; } // uvodna špica
  if(e.target.closest && e.target.closest('input')){ if(e.key==='Enter' && ovAct){ e.preventDefault(); ovAct(); } return; } // kucanje tri slova
  if((e.key==='Enter'||e.key===' ') && ovAct){ e.preventDefault(); if(!e.repeat) ovAct(); return; }
  const k=KEYMAP[e.key];
  if(k){ keys[k]=true; if(state!=='title') e.preventDefault(); }
  if(e.key==='p'||e.key==='P'||e.key==='Escape') togglePause();
  else if(e.key==='m'||e.key==='M') toggleMute();
  else if(e.key==='n'||e.key==='N'){ initAudio(); toggleMusic(); }
  else if(e.key==='b'||e.key==='B'){ initAudio(); Mus.skip(); }
});
addEventListener('keyup',e=>{ const k=KEYMAP[e.key]; if(k) keys[k]=false; });
addEventListener('blur',()=>{ keys.L=keys.R=keys.F=false; });
function togglePause(){ if(state==='play') state='paused'; else if(state==='paused') state='play'; }
stage.addEventListener('pointerdown',()=>{ if(Boot.active) Boot.key('click'); else if(state==='paused') togglePause(); });
// dugmad za telefon: drži levo/desno, PUCAJ
const pad=$('pad');
pad.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); initAudio(); keys[b.dataset.k]=true; b.classList.add('on'); b.setPointerCapture?.(e.pointerId); });
const padUp=e=>{ const b=e.target.closest&&e.target.closest('button'); if(!b||!pad.contains(b)) return; keys[b.dataset.k]=false; b.classList.remove('on'); };
pad.addEventListener('pointerup',padUp); pad.addEventListener('pointercancel',padUp); pad.addEventListener('lostpointercapture',padUp);
document.addEventListener('click',e=>{ if(e.target.closest('[data-verzije]') && state==='play') state='paused'; });
document.addEventListener('visibilitychange',()=>{ if(document.hidden && state==='play') state='paused'; });
$('mute').onclick=()=>{ initAudio(); toggleMute(); };
$('music').onclick=()=>{ initAudio(); toggleMusic(); };
$('next').onclick=()=>{ initAudio(); Mus.skip(); };

// ---------- PETLJA ----------
function resize(){
  const w=stage.clientWidth; if(!w) return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(w*dpr); cv.height=Math.round(w*dpr*GH/GW); cv.style.height=(w*GH/GW)+'px'; K=cv.width/GW;
}
let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(Boot.active){ Mus.playing=false; Boot.frame(dt); requestAnimationFrame(frame); return; } // uvodna špica (js/intro.js)
  if(state!=='paused') update(dt);
  // muzika: svira dok traje igra, na pauzi i posle gubitka života stoji; tempo blago raste kako stroj opada
  Mus.playing=['intro','play','clear','ready','bossintro','bossdead','levelclear'].includes(state);
  Mus.rate=mode==='boss'?(boss&&boss.phase===2?1.35:1):1+.1*(1-(form?aliveCount()/form.total:1));
  Mus.tick();
  render();
  requestAnimationFrame(frame);
}
// Visina iznad igrališta (zaglavlje) + 14 px ispod, da igralište (--bh u CSS-u) stane u prozor bez pomeranja.
function fitHead(){ document.documentElement.style.setProperty('--head-h',Math.ceil(stage.getBoundingClientRect().top+scrollY+18)+'px'); }
fitHead(); addEventListener('resize',fitHead);
new ResizeObserver(resize).observe(stage);
startWave(0); state='title'; banner=null; resize(); renderCast(); renderRek(); updHud(); updPw(); soundLabel(); musicLabel(); Boot.start(); // posle špice ide naslovni ekran
if(document.fonts) document.fonts.ready.then(fitHead);
requestAnimationFrame(frame);
