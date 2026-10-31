// Punkman — stanje igre, kretanje, AI neprijatelja, crtanje table, HUD i kontrole.
// ---------- DOM ----------
const $=id=>document.getElementById(id);
const cv=$('cv'), ctx=cv.getContext('2d'), stage=$('stage'), ov=$('ov');
const mazeCv=document.createElement('canvas'), mctx=mazeCv.getContext('2d');
let ts=20, dpr=1;
const segs=$('segs'); for(let i=0;i<11;i++) segs.appendChild(document.createElement('i'));
// ---------- STATE ----------
let grid, start, pelletsLeft, totalPellets, EXIT_X, EXIT_Y, HOUSE_Y, TUN_Y=-1, TUN_L=0, TUN_R=W-1, eatenCount, level=0, loop=0, score=0, hi=0, lives=3, nextLife=LIFE_EVERY;
let state='title', stateT=0, frightT=0, modeIdx=0, modeT=0, freezeT=0, shakeT=0, bannerT=0;
let player, ghosts=[], bonus=null, popups=[], combo=0, killer=null, collected=[false,false,false];
try{ hi=+localStorage.getItem('punkman-hi')||0; }catch(e){}
// Rekordi: deset najboljih {i: tri slova, s: poeni, l: tabla (0-2), k: krug, d: datum, id} - korisnikovi podaci, ne brisati.
const REK_MAX=10, REK_KEY='punkman-rekordi', IME_KEY='punkman-ime';
let rekordi=[], newRek=null;
try{ rekordi=JSON.parse(localStorage.getItem(REK_KEY)||'[]'); if(!Array.isArray(rekordi)) rekordi=[]; }catch(e){ rekordi=[]; }
if(rekordi[0] && rekordi[0].s>hi) hi=rekordi[0].s;

const mod=x=>((x%W)+W)%W;
const cfg=()=>{const b=BOARDS[level];const k=1+loop*.06;return {...b,pSpeed:b.pSpeed*Math.min(k,1.15),gSpeed:b.gSpeed*k,fright:Math.max(2,b.fright-loop)}};
const rand=a=>a[Math.floor(Math.random()*a.length)];
function hash(x,y){let h=x*374761393+y*668265263;h=(h^(h>>13))*1274126177;return ((h^(h>>16))>>>0)/4294967295}

function loadLevel(i){
  level=i; Mus.reset(); EXIT_X=undefined; grid=MAZES[i].map(r=>[...r]); pelletsLeft=0; eatenCount=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=grid[y][x]; if(c==='P'){start=[x,y];grid[y][x]=' '} if(c==='.'||c==='o')pelletsLeft++; if(c==='-'&&EXIT_X===undefined){EXIT_X=x;EXIT_Y=y-1;HOUSE_Y=y+1}}
  totalPellets=pelletsLeft;
  // Tunel: red koji je otvoren na ivici table. Čim lik pređe u crni deo van zidova (levo od kolone TUN_L, desno od TUN_R),
  // odmah izlazi na suprotnoj strani - ne prolazi kroz ceo crni deo. TUN_L je kolona zida u redu iznad tunela.
  TUN_Y=-1; for(let y=1;y<H-1;y++) if(grid[y][0]===' '&&grid[y][W-1]===' '){ TUN_Y=y; TUN_L=Math.max(0,grid[y-1].indexOf('#')); TUN_R=W-1-TUN_L; break; }
  bonus=null; renderMaze(); updHud(); renderTour();
}
function resetActors(){
  const L=cfg();
  player={x:start[0],y:start[1],dir:null,want:'L',wantT:99,last:'L',anim:0,stall:0};
  ghosts=GHOSTS.map((g,i)=>({...g,x:HOUSE_SLOTS[g.id]==null?EXIT_X:EXIT_X+HOUSE_SLOTS[g.id],y:HOUSE_SLOTS[g.id]==null?EXIT_Y:HOUSE_Y,hy:HOUSE_Y,dir:i===0?'L':'U',
    state:i===0?'active':'house',releaseT:L.release[i],bob:i,fright:false,rev:false,raid:0,raidCD:L.raid[0]+Math.random()*(L.raid[1]-L.raid[0]),whim:'player',whimT:2,t:0}));
  frightT=0; modeIdx=0; modeT=L.modes[0]; combo=0; popups=[];
}
function isWall(c){return c==='#'||c==='X'||c==='-'||c==='G'}
function open(x,y){ if(y<0||y>=H) return false; return !isWall(grid[y][mod(x)]); }
// ---------- MOVEMENT ----------
// Prelaz kroz tunel: odraz x -> W-1-x pogađa isto mesto u polju na drugoj strani, pa kretanje teče dalje bez trzaja.
function tunnel(e){
  if(TUN_Y<0 || Math.round(e.y)!==TUN_Y) return;
  if(e.dir==='L' && e.x<TUN_L-.5) e.x=W-1-e.x;
  else if(e.dir==='R' && e.x>TUN_R+.5) e.x=W-1-e.x;
}
// Razdaljina po x, i preko tunela (dva lika sa raznih strana prolaza su blizu).
function xDist(a,b,y){
  let d=Math.abs(a-b); d=Math.min(d,W-d);
  if(TUN_Y>=0 && Math.round(y)===TUN_Y){ const l=TUN_L-.5, r=TUN_R+.5; d=Math.min(d,Math.abs(a-l)+Math.abs(b-r),Math.abs(a-r)+Math.abs(b-l)); }
  return d;
}
function step(e,dist,onCenter){
  let guard=0;
  while(dist>1e-6 && guard++<8){
    if(!e.dir){ onCenter(e); if(!e.dir) return; }
    const [dx,dy]=DIRS[e.dir], cx=Math.round(e.x), cy=Math.round(e.y);
    const off=dx?(e.x-cx)*dx:(e.y-cy)*dy;
    const tx=dx?(off<0?cx:cx+dx):cx, ty=dy?(off<0?cy:cy+dy):cy;
    const d=Math.abs(tx-e.x)+Math.abs(ty-e.y);
    if(dist<d){ e.x+=dx*dist; e.y+=dy*dist; tunnel(e); return; }
    e.x=tx; e.y=ty; dist-=d;
    if(e.x<0) e.x+=W; if(e.x>W-1) e.x-=W;
    tunnel(e);
    onCenter(e);
    if(!e.dir) return;
  }
}
function playerCenter(p){
  const x=mod(Math.round(p.x)), y=Math.round(p.y);
  eat(x,y);
  if(state!=='play') { p.dir=null; return; }
  const w=p.want&&DIRS[p.want];
  if(w && open(x+w[0],y+w[1])) p.dir=p.want;
  else if(p.dir){ const d=DIRS[p.dir]; if(!open(x+d[0],y+d[1])) p.dir=null; }
  if(p.dir) p.last=p.dir;
}
function ghostTarget(g){
  if(g.state==='eyes') return [EXIT_X,EXIT_Y];
  const px=mod(Math.round(player.x)), py=Math.round(player.y), pd=DIRS[player.dir||player.last];
  if(g.id==='inspektor') return g.raid>0?[px,py]:null;
  if(modeIdx%2===0) return g.scatter;
  if(g.id==='murija') return [px,py];
  if(g.id==='menadzer') return [px+pd[0]*4,py+pd[1]*4];
  if(g.whim==='player') return [px,py];
  if(g.whim==='ambush') return [px+pd[0]*4,py+pd[1]*4];
  if(g.whim==='corner') return g.scatter;
  return null;
}
function ghostCenter(g){
  const x=mod(Math.round(g.x)), y=Math.round(g.y);
  if(g.state==='eyes' && x===EXIT_X && y===EXIT_Y){ g.state='entering'; g.dir=null; return; }
  let opts=ORDER.filter(d=>d!==OPP[g.dir] && open(x+DIRS[d][0],y+DIRS[d][1]));
  if(!opts.length) opts=[OPP[g.dir]];
  let t=(g.state==='active'&&g.fright)?null:ghostTarget(g);
  if(g.id==='zvezda' && g.state==='active' && !g.fright && Math.random()<.3) t=null;
  if(!t){ g.dir=rand(opts); return; }
  let best=opts[0],bd=1e9;
  for(const d of opts){const nx=x+DIRS[d][0],ny=y+DIRS[d][1],dd=(nx-t[0])**2+(ny-t[1])**2; if(dd<bd){bd=dd;best=d}}
  g.dir=best;
}
function updGhost(g,dt){
  const L=cfg(); g.t+=dt;
  if(g.state==='house'){ g.bob+=dt*6; g.y=g.hy+Math.sin(g.bob)*.18; g.releaseT-=dt; if(g.releaseT<=0){g.state='leaving';g.y=g.hy} return; }
  if(g.state==='leaving'){
    const sp=4*dt;
    if(Math.abs(g.x-EXIT_X)>.001){ g.dir=g.x<EXIT_X?'R':'L'; g.x+=Math.sign(EXIT_X-g.x)*Math.min(sp,Math.abs(EXIT_X-g.x)); }
    else { g.x=EXIT_X; g.dir='U'; g.y-=sp; if(g.y<=EXIT_Y){ g.y=EXIT_Y; g.state='active'; g.dir=Math.random()<.5?'L':'R'; } }
    return;
  }
  if(g.state==='entering'){ g.dir='D'; g.y+=9*dt; if(g.y>=HOUSE_Y){ g.y=HOUSE_Y; g.fright=false; g.state='leaving'; } return; }
  if(g.state==='active' && !g.fright){
    if(g.id==='zvezda'){ g.whimT-=dt; if(g.whimT<=0){ g.whim=rand(['player','player','ambush','random','corner']); g.whimT=1.5+Math.random()*2.5; if(Math.random()<.3) g.rev=true; } }
    if(g.id==='inspektor'){
      if(g.raid>0) g.raid-=dt;
      else { g.raidCD-=dt; if(g.raidCD<=0){ g.raid=3; g.raidCD=L.raid[0]+Math.random()*(L.raid[1]-L.raid[0]); sfx('raid'); } }
    }
  }
  let sp;
  if(g.state==='eyes') sp=15;
  else if(g.fright) sp=L.gSpeed*.55;
  else { sp=L.gSpeed; if(g.id==='inspektor'&&g.raid>0) sp*=1.35; }
  if(g.state==='active' && Math.round(g.y)===TUN_Y && (g.x<TUN_L+.5||g.x>TUN_R-.5)) sp*=.5; // u tunelu sporije
  if(g.rev && g.state==='active' && g.dir){ g.dir=OPP[g.dir]; }
  g.rev=false;
  step(g,sp*dt,ghostCenter);
}
// ---------- GAME EVENTS ----------
function addScore(n){
  score+=n;
  while(score>=nextLife){ nextLife+=LIFE_EVERY; lives++; popup(player.x,player.y-1,'+1 ŽIVOT','#ffd400'); sfx('bonus'); }
  if(score>hi){ hi=score; try{localStorage.setItem('punkman-hi',hi)}catch(e){} }
  updHud();
}
function eat(x,y){
  const c=grid[y][x];
  if(c==='.'){ grid[y][x]=' '; pelletsLeft--; eatenCount++; addScore(10); sfx('waka'); player.stall=1/60; }
  else if(c==='o'){ grid[y][x]=' '; pelletsLeft--; eatenCount++; addScore(50); power(); player.stall=3/60; }
  else return;
  if(eatenCount===Math.round(totalPellets*.3)||eatenCount===Math.round(totalPellets*.6)){ bonus={x:start[0],y:start[1],t:9}; }
  if(pelletsLeft===0){ setState('clear'); sfx('clear'); }
}
function power(){
  const L=cfg(); frightT=L.fright; combo=0; bannerT=1.6; shakeT=.35; sfx('power');
  for(const g of ghosts){ if(g.state==='active'){g.fright=true;g.rev=true} else if(g.state==='house'||g.state==='leaving') g.fright=true; }
}
function popup(x,y,text,color){ popups.push({x,y,text,color:color||'#fff',t:1.4}); }
function die(g){ killer=g; setState('dying'); sfx('death'); }

function setState(s){ state=s; stateT=0;
  if(s==='ready'){ hideOv(); }
  if(s==='play') hideOv();
}
// ---------- UPDATE ----------
function update(dt){
  stateT+=dt;
  for(const p of popups) p.t-=dt; popups=popups.filter(p=>p.t>0);
  if(bannerT>0) bannerT-=dt; if(shakeT>0) shakeT-=dt;
  if(state==='ready'){ if(stateT>=2) setState('play'); return; }
  if(state==='dying'){ if(stateT>=1.8){ lives--; if(lives<=0){ state='over'; endGame(); } else { resetActors(); setState('ready'); } updHud(); } return; }
  if(state==='clear'){ if(stateT>=1.8){ if(level===2){ state='win'; showWin(); } else { state='inter'; showInter(level+1); } } return; }
  if(state!=='play') return;
  if(freezeT>0){ freezeT-=dt; return; }
  const L=cfg();
  // modes
  if(frightT>0){ frightT-=dt; if(frightT<=0){ frightT=0; ghosts.forEach(g=>g.fright=false); } }
  else { modeT-=dt; if(modeT<=0 && modeIdx<L.modes.length-1){ modeIdx++; modeT=L.modes[modeIdx]; ghosts.forEach(g=>{if(g.state==='active')g.rev=true}); } }
  if(bonus){ bonus.t-=dt; if(bonus.t<=0) bonus=null; }
  if(player.want && !held.size){ player.wantT-=dt; if(player.wantT<=0) player.want=null; }
  const sub=2;
  for(let s=0;s<sub;s++){
    if(player.stall>0) player.stall-=dt/sub;
    else { tryCorner(); step(player,L.pSpeed*dt/sub,playerCenter); }
    if(state!=='play') break;
    for(const g of ghosts) updGhost(g,dt/sub);
    if(collide()) break;
  }
  if(player.dir) player.anim+=dt*14;
  if(bonus && Math.abs(player.x-bonus.x)<.6 && Math.abs(player.y-bonus.y)<.6){
    const b=BOARDS[level]; addScore(b.bonusPts); collected[level]=true; renderShelf();
    popup(bonus.x,bonus.y,'+'+b.bonusPts+' '+b.bonusName.toUpperCase(),'#ffd400'); bonus=null; sfx('bonus');
  }
  updAmp();
}
function collide(){
  for(const g of ghosts){
    if(g.state!=='active') continue;
    const dx=Math.round(g.y)===Math.round(player.y)?xDist(g.x,player.x,g.y):Math.min(Math.abs(g.x-player.x),W-Math.abs(g.x-player.x));
    if(dx+Math.abs(g.y-player.y)<.7){
      if(g.fright){
        g.fright=false; g.state='eyes'; const pts=200*2**combo; combo=Math.min(combo+1,3);
        addScore(pts); popup(g.x,g.y,pts+' '+g.eaten,'#ff2d7a'); freezeT=.45; sfx('eat');
      } else { die(g); return true; }
    }
  }
  return false;
}
// ---------- RENDER ----------
function resize(){
  const w=stage.clientWidth; if(!w) return;
  dpr=Math.min(window.devicePixelRatio||1,2); ts=w/W;
  cv.width=Math.round(w*dpr); cv.height=Math.round(ts*H*dpr); cv.style.height=(ts*H)+'px';
  mazeCv.width=cv.width; mazeCv.height=cv.height; renderMaze();
}
function renderMaze(){
  if(!grid) return; const b=BOARDS[level], c=mctx, s=ts;
  c.setTransform(dpr,0,0,dpr,0,0); c.fillStyle=b.floor; c.fillRect(0,0,W*s,H*s);
  // floor texture per venue
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const h=hash(x,y);
    if(level===0 && h>.82){ c.fillStyle='rgba(255,255,255,.025)'; c.fillRect(x*s+h*s*.5,y*s+h*s*.3,s*.2,s*.12); }
    if(level===1 && (x+y)%2===0){ c.fillStyle='rgba(255,255,255,.022)'; c.fillRect(x*s,y*s,s,s); }
    if(level===2 && y%4===1){ c.fillStyle='rgba(255,176,0,.03)'; c.fillRect(x*s+s*.3,y*s+s*.45,s*.4,s*.08); }
  }
  const lw=Math.max(1.5,s*.12), wall=(x,y)=>{ if(y<0||y>=H||x<0||x>=W) return true; const ch=grid[y][x]; return ch==='#'||ch==='X'; };
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const ch=grid[y][x];
    if(ch==='#'){
      c.fillStyle=b.wall; c.fillRect(x*s,y*s,s+.5,s+.5);
      if(level===2){ c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(x*s,y*s+s*.48,s,s*.06); c.fillRect(x*s+((y%2)?s*.5:0),y*s,s*.06,s*.5); }
      c.fillStyle=b.edge;
      if(!wall(x,y-1)&&grid[y-1][x]!=='-') c.fillRect(x*s,y*s,s,lw);
      if(!wall(x,y+1)) c.fillRect(x*s,(y+1)*s-lw,s,lw);
      if(!wall(x-1,y)) c.fillRect(x*s,y*s,lw,s);
      if(!wall(x+1,y)) c.fillRect((x+1)*s-lw,y*s,lw,s);
    } else if(ch==='-'){ c.fillStyle=b.door; c.fillRect(x*s,y*s+s*.4,s,s*.2); }
  }
  // venue sign above the ghost house
  c.fillStyle=b.edge; c.globalAlpha=.55; c.font=`${Math.round(s*.55)}px 'Special Elite', monospace`; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(b.short.toUpperCase(),W/2*s,(HOUSE_Y+1.5)*s); c.globalAlpha=1;
}
function render(t){
  if(!grid) return; const s=ts, c=ctx, b=BOARDS[level];
  c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,cv.width,cv.height);
  let sx=0,sy=0; if(shakeT>0){ sx=(Math.random()-.5)*s*.5; sy=(Math.random()-.5)*s*.5; }
  c.setTransform(1,0,0,1,sx*dpr,sy*dpr);
  const flashMaze=state==='clear' && Math.floor(stateT*5)%2===1;
  c.drawImage(mazeCv,0,0);
  if(flashMaze){ c.fillStyle='rgba(255,255,255,.18)'; c.fillRect(0,0,cv.width,cv.height); }
  c.setTransform(dpr,0,0,dpr,sx*dpr,sy*dpr);
  // pellets
  const pc=level===0?'#c9ced4':level===2?'#e7e2d6':'#fff';
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const ch=grid[y][x], px=(x+.5)*s, py=(y+.5)*s;
    if(ch==='.'){
      if(b.pellet==='pin') drawPin(c,px,py,s,hash(x,y)*Math.PI,pc);
      else if(b.pellet==='badge') drawBadge(c,px,py,s,BADGE_COLS[Math.floor(hash(x,y)*BADGE_COLS.length)]);
      else drawTape(c,px,py,s,pc);
    } else if(ch==='o') drawAmp(c,px,py,s,t,b.edge);
  }
  if(bonus && (bonus.t>2 || Math.floor(bonus.t*6)%2===0)) drawBonus(c,b.bonus,(bonus.x+.5)*s,(bonus.y+.5)*s,s*1.05,t);
  // ghosts
  if(state!=='dying' || stateT<.6){
    for(const g of ghosts){
      const flash=g.fright && frightT<2 && Math.floor(frightT*6)%2===0;
      drawGhost(c,(g.x+.5)*s,(g.y+.5)*s,s,g,t,flash);
      if(g.x>W-1.5) drawGhost(c,(g.x-W+.5)*s,(g.y+.5)*s,s,g,t,flash);
    }
  }
  // player
  let mouth=.08+Math.abs(Math.sin(player.anim))*.55, dying=0;
  if(state==='dying'){ const k=Math.min(1,Math.max(0,(stateT-.5)/1.1)); mouth=.1+k*(Math.PI-.1); dying=k; }
  if(state==='ready'||state==='title') mouth=.35;
  const pdir=player.dir||player.last;
  drawPunk(c,(player.x+.5)*s,(player.y+.5)*s,s*1.05,state==='dying'?'U':pdir,mouth,dying);
  if(player.x>W-1.5) drawPunk(c,(player.x-W+.5)*s,(player.y+.5)*s,s*1.05,pdir,mouth,dying);
  // popups
  c.textAlign='center'; c.textBaseline='middle';
  for(const p of popups){
    c.globalAlpha=Math.min(1,p.t*1.5); c.font=`${Math.round(s*.5)}px 'Archivo Black', Impact, sans-serif`;
    const tx=Math.min(Math.max((p.x+.5)*s,s*4),W*s-s*4);
    c.lineWidth=s*.18; c.strokeStyle='#131115'; c.strokeText(p.text,tx,(p.y+.5)*s-(1.4-p.t)*s); c.fillStyle=p.color; c.fillText(p.text,tx,(p.y+.5)*s-(1.4-p.t)*s);
  }
  c.globalAlpha=1;
  // banners
  if(bannerT>0){
    c.save(); c.translate(W*s/2,H*s*.36); c.rotate(-.06); const k=Math.min(1,(1.6-bannerT)*6);
    c.scale(k,k); c.fillStyle='#ffd400'; c.fillRect(-W*s*.42,-s*.9,W*s*.84,s*1.8);
    c.fillStyle='#131115'; c.font=`${Math.round(s*1.05)}px 'Archivo Black', Impact, sans-serif`; c.fillText('ODVRNUTO NA 11!',0,s*.05); c.restore();
  }
  if(state==='ready'){
    const n=Math.min(4,Math.floor(stateT/.5)+1); const txt=['JEDAN','DVA','TRI','ČETIR!'][n-1];
    c.font=`${Math.round(s*1.2)}px 'Permanent Marker', cursive`; c.lineWidth=s*.25; c.strokeStyle='#131115';
    c.strokeText(txt,W/2*s,(HOUSE_Y+3.5)*s); c.fillStyle='#ff2d7a'; c.fillText(txt,W/2*s,(HOUSE_Y+3.5)*s);
  }
  if(state==='paused'){
    c.fillStyle='rgba(19,17,21,.6)'; c.fillRect(0,0,W*s,H*s);
    c.font=`${Math.round(s*1.3)}px 'Archivo Black', Impact, sans-serif`; c.fillStyle='#f1eef2'; c.fillText('PAUZA',W/2*s,(H/2-.5)*s);
    c.font=`${Math.round(s*.5)}px 'IBM Plex Mono', monospace`; c.fillStyle='#9a92a0'; c.fillText('pritisni P ili dodirni tablu',W/2*s,(H/2+.9)*s);
  }
}
// ---------- HUD ----------
function updHud(){
  $('score').textContent=score.toLocaleString('sr-RS'); $('hi').textContent=hi.toLocaleString('sr-RS');
  $('board').textContent=(level+1)+' · '+BOARDS[level].short+(loop?' ×'+(loop+1):'');
  const L=$('lives'); L.innerHTML='';
  const n=Math.max(0,lives-(state==='play'||state==='ready'?1:0)); // najviše 5 sličica, ostatak kao „+n“
  for(let i=0;i<Math.min(n,5);i++){ const k=document.createElement('canvas'); k.width=36;k.height=36;k.style.width='18px';k.style.height='18px'; const x=k.getContext('2d'); drawPunk(x,18,20,30,'R',.35,0); L.appendChild(k); }
  if(n>5){ const m=document.createElement('b'); m.className='lives-more'; m.textContent='+'+(n-5); L.appendChild(m); }
}
let lastAmp=-1;
function updAmp(){
  const L=cfg(), n=frightT>0?Math.ceil(frightT/L.fright*11):0; if(n===lastAmp) return; lastAmp=n;
  [...segs.children].forEach((e,i)=>e.classList.toggle('on',i<n));
}
function renderShelf(){
  const sh=$('shelf'); sh.innerHTML='';
  BOARDS.forEach((b,i)=>{ const k=document.createElement('canvas'); k.width=60;k.height=60; k.title=b.bonusName+(collected[i]?' — skupljeno':''); if(collected[i]) k.className='got'; drawBonus(k.getContext('2d'),b.bonus,30,30,52,0); sh.appendChild(k); });
}
function renderCast(){
  const box=$('cast'); box.innerHTML='';
  const mk=(draw,title,text)=>{ const row=document.createElement('div'); row.className='row'; const k=document.createElement('canvas'); k.width=104;k.height=104; draw(k.getContext('2d')); row.appendChild(k);
    const d=document.createElement('div'); d.innerHTML=`<b>${title}</b><span>${text}</span>`; row.appendChild(d); box.appendChild(row); };
  mk(c=>drawPunk(c,52,58,80,'R',.4,0),'Punkman','Ti. Kresta, zihernadla u uvu, bez kompromisa.');
  for(const g of GHOSTS) mk(c=>drawGhost(c,52,56,84,{...g,state:'active',dir:'R',fright:false,raid:g.id==='inspektor'?1:0},.3,false),g.name,g.role);
  mk(c=>drawAmp(c,52,52,90,0,'#ffd400'),'Pojačalo „odvrnuto na 11“','Pojedi ga i svi beže od tebe. Hvataj ih dok se pojačalo ne ugasi.');
}
function renderTour(){
  const ol=$('tour'); ol.innerHTML='';
  BOARDS.forEach((b,i)=>{ const li=document.createElement('li'); if(i===level && state!=='title') li.className='now';
    li.innerHTML=`<span class="n">${i+1}</span><span class="t"><b>${b.name}</b> · skupljaš ${b.pelletName}, bonus: ${b.bonusName.toLowerCase()}</span><span class="lvl">${b.diff}</span>`; ol.appendChild(li); });
}
// ---------- OVERLAYS ----------
function showOv(html,act){ ov.innerHTML=`<div class="flyer">${html}</div>`; ov.hidden=false; const b=ov.querySelector('.go'); if(b){ b.onclick=e=>{e.stopPropagation(); act();}; setTimeout(()=>b.focus({preventScroll:true}),30); } ovAct=act; }
function hideOv(){ ov.hidden=true; ovAct=null; }
let ovAct=null;
function showTitle(){
  showOv(`<span class="tag">nova igra · demo</span><h2>Pojedi sve zihernadle. Ne daj se sistemu.</h2>
  <p>Tri table, četiri neprijatelja i jedno pojačalo odvrnuto na 11. Murija, menadžer, rijaliti zvezda i komunalni inspektor jure te od podruma do grada.</p>
  <button class="go" type="button">Sviraj</button><span class="small">Enter ili razmak za start</span>`, newGame);
}
function showInter(n){
  const b=BOARDS[n];
  showOv(`<span class="tag">tabla ${n+1} od 3 · ${b.diff}</span><h2>${b.name}</h2>
  <p>Skupljaš ${b.pelletName}. Kad pojedeš trećinu, pa još trećinu, na startu se pojavi bonus: <b>${b.bonusName.toLowerCase()}</b>.</p>
  <button class="go" type="button">Na binu</button>`, ()=>{ loadLevel(n); resetActors(); updHud(); setState('ready'); });
}
function showOver(){
  showOv(`<span class="tag">kraj svirke</span><h2>${score.toLocaleString('sr-RS')} poena</h2>
  <p>${killer?killer.catch:''}</p><p class="small">Stigao si do table ${level+1}: ${BOARDS[level].name}. Rekord: ${hi.toLocaleString('sr-RS')}.</p>
  <button class="go" type="button">Još jednom</button>`, newGame);
}
function showWin(){
  showOv(`<span class="tag">turneja završena</span><h2>Podrum, klub, grad. Sve tvoje.</h2>
  <p>${score.toLocaleString('sr-RS')} poena. Demo-snimak je spreman, ali publika traži još.</p>
  <button class="go" type="button">Bis! (brže)</button>`, ()=>{ loop++; loadLevel(0); resetActors(); updHud(); setState('ready'); });
}
// ---------- REKORDI ----------
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const qualifies=n=>n>0 && (rekordi.length<REK_MAX || n>rekordi[rekordi.length-1].s);
const cleanIni=v=>v.toUpperCase().replace(/[^A-ZČĆŽŠĐ]/g,'').slice(0,3);
function renderRek(){
  const ol=$('rek'); ol.innerHTML='';
  if(!rekordi.length){ ol.innerHTML='<li><span class="empty">Još niko. Budi prvi na listi.</span></li>'; return; }
  rekordi.forEach((r,i)=>{ const li=document.createElement('li'); if(r.id===newRek) li.className='new';
    const [y,m,d]=r.d.split('-'), b=BOARDS[r.l]||BOARDS[0];
    li.innerHTML=`<span class="n">${i+1}.</span><span class="ini">${esc(r.i)}</span><span class="pts">${r.s.toLocaleString('sr-RS')}</span>`+
      `<span class="meta">tabla ${r.l+1} · ${esc(b.short)}${r.k?' ×'+(r.k+1):''} · ${+d}. ${+m}. ${y}.</span>`; ol.appendChild(li); });
}
function saveRek(ini){
  const now=new Date(), d=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const r={i:ini,s:score,l:level,k:loop,d,id:now.getTime()};
  rekordi.push(r); rekordi.sort((a,b)=>b.s-a.s||a.id-b.id); rekordi=rekordi.slice(0,REK_MAX); newRek=r.id;
  try{ localStorage.setItem(REK_KEY,JSON.stringify(rekordi)); localStorage.setItem(IME_KEY,ini); }catch(e){}
  renderRek();
}
function endGame(){ if(qualifies(score)) showName(); else showOver(); }
// Kraj igre sa rezultatom za listu: upis tri slova (srpska latinica), Enter ili dugme „Upiši“.
function showName(){
  let last=''; try{ last=cleanIni(localStorage.getItem(IME_KEY)||''); }catch(e){}
  const place=rekordi.filter(r=>r.s>=score).length+1;
  showOv(`<span class="tag">kraj svirke · ${place}. mesto na listi</span><h2>${score.toLocaleString('sr-RS')} poena</h2>
  <p>${killer?killer.catch:''}</p><p>Ušao si među deset najboljih. Upiši tri slova:</p>
  <div class="ini-row"><input class="ini-in" id="ini" autocomplete="off" spellcheck="false" aria-label="Tri slova" value="${esc(last)}"><button class="go" type="button">Upiši</button></div>
  <span class="small">Samo slova · Enter za upis</span>`, ()=>{
    const v=cleanIni($('ini').value); if(v.length<3){ $('ini').focus(); return; }
    saveRek(v); showOver();
  });
  const inp=$('ini'), go=ov.querySelector('.go'), sync=()=>{ const v=cleanIni(inp.value); if(v!==inp.value) inp.value=v; go.disabled=v.length<3; };
  inp.addEventListener('input',sync); sync();
  setTimeout(()=>{ inp.focus({preventScroll:true}); inp.select(); },40);
}
function newGame(){ newRek=null; renderRek(); score=0; lives=3; loop=0; nextLife=LIFE_EVERY; collected=[false,false,false]; renderShelf(); loadLevel(0); resetActors(); setState('ready'); updHud(); initAudio(); }
// ---------- INPUT ----------
const KEYS={ArrowUp:'U',ArrowDown:'D',ArrowLeft:'L',ArrowRight:'R',w:'U',s:'D',a:'L',d:'R',W:'U',S:'D',A:'L',D:'R'};
const held=new Set();
function want(d){ if(!player) return; player.want=d; player.wantT=.45; if(player.dir && d===OPP[player.dir]) player.dir=d; else if(state==='play') tryCorner(); }
// Cornering: a turn pressed up to ~half a tile before or after an opening still takes it.
function tryCorner(){
  const p=player; if(!p.want||!p.dir||p.want===p.dir||p.want===OPP[p.dir]) return;
  const [dx,dy]=DIRS[p.dir], cx=Math.round(p.x), cy=Math.round(p.y);
  const off=dx?(p.x-cx)*dx:(p.y-cy)*dy; if(Math.abs(off)>.48) return;
  const w=DIRS[p.want]; if(!open(cx+w[0],cy+w[1])) return;
  p.x=cx<0?cx+W:cx; p.y=cy; eat(mod(cx),cy); if(state!=='play') return;
  p.dir=p.want; p.last=p.want;
}
addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]')) return; // prozor „Šta je novo“ je otvoren
  if(e.target.closest && e.target.closest('input')){ if(e.key==='Enter' && ovAct){ e.preventDefault(); ovAct(); } return; } // kucanje tri slova
  if(KEYS[e.key]){ held.add(e.key); want(KEYS[e.key]); if(state!=='title') e.preventDefault(); }
  if((e.key==='Enter'||e.key===' ') && ovAct){ e.preventDefault(); const a=ovAct; a(); }
  if(e.key==='p'||e.key==='P'||e.key==='Escape') togglePause();
  if(e.key==='m'||e.key==='M') toggleMute();
  if(e.key==='n'||e.key==='N'){ initAudio(); toggleMusic(); }
});
function togglePause(){ if(state==='play'){ state='paused'; } else if(state==='paused'){ state='play'; } }
let tStart=null;
stage.addEventListener('pointerdown',e=>{ tStart=[e.clientX,e.clientY]; if(state==='paused') togglePause(); });
stage.addEventListener('pointermove',e=>{ if(!tStart) return; const dx=e.clientX-tStart[0], dy=e.clientY-tStart[1];
  if(Math.hypot(dx,dy)>18){ want(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U')); tStart=[e.clientX,e.clientY]; } });
addEventListener('pointerup',()=>{ tStart=null; held.delete('pad'); });
addEventListener('keyup',e=>held.delete(e.key));
addEventListener('blur',()=>held.clear());
$('pad').addEventListener('pointerdown',e=>{ const d=e.target.closest('button')?.dataset.d; if(d){ e.preventDefault(); held.add('pad'); want(d); } });
document.addEventListener('click',e=>{ if(e.target.closest('[data-verzije]') && state==='play') state='paused'; });
document.addEventListener('visibilitychange',()=>{ if(document.hidden && state==='play') state='paused'; });
$('mute').onclick=()=>{ initAudio(); toggleMute(); };
$('music').onclick=()=>{ initAudio(); toggleMusic(); }; musicLabel();

// ---------- LOOP ----------
let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(state!=='paused') update(dt);
  // muzika: svira samo u igri; pojačalo = brže, a tempo blago raste kako se tabla prazni
  Mus.play(state==='play'?BOARDS[level].song:null);
  Mus.rate=(frightT>0?1.25:1)*(1+.08*(1-pelletsLeft/Math.max(1,totalPellets)));
  Mus.tick();
  render(now/1000);
  requestAnimationFrame(frame);
}
// Visina iznad table (zaglavlje) + 14 px ispod, da tabla (--board u CSS-u) stane u prozor bez pomeranja.
function fitHead(){ document.documentElement.style.setProperty('--head-h',Math.ceil(stage.getBoundingClientRect().top+scrollY+14)+'px'); resize(); } // resize odmah: veličina table zavisi od --head-h
fitHead(); addEventListener('resize',fitHead);
new ResizeObserver(resize).observe(stage);
loadLevel(0); resetActors(); resize(); renderCast(); renderShelf(); renderRek(); updHud(); showTitle();
if(document.fonts) document.fonts.ready.then(()=>{ fitHead(); renderMaze(); renderShelf(); renderCast(); });
requestAnimationFrame(frame);
