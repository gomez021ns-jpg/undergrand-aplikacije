// Punkman — crtanje likova, predmeta i bonusa na canvas (bez slika).
// ---------- DRAW HELPERS ----------
function drawPin(c,x,y,s,a,col){
  c.save(); c.translate(x,y); c.rotate(a); c.strokeStyle=col; c.lineWidth=Math.max(1,s*.055); c.lineCap='round';
  c.beginPath(); c.moveTo(-s*.17,0); c.lineTo(s*.15,-s*.045); c.moveTo(-s*.17,0); c.lineTo(s*.13,s*.035); c.stroke();
  c.beginPath(); c.arc(-s*.17,0,s*.04,0,7); c.stroke();
  c.fillStyle=col; c.fillRect(s*.12,-s*.07,s*.07,s*.1); c.restore();
}
const BADGE_COLS=['#ff2d7a','#ffd400','#3b6cff','#f1eef2','#41d18a'];
function drawBadge(c,x,y,s,col){ c.fillStyle=col; c.beginPath(); c.arc(x,y,s*.13,0,7); c.fill(); c.fillStyle='#131115'; c.beginPath(); c.arc(x,y,s*.05,0,7); c.fill(); }
function drawTape(c,x,y,s,col){
  c.fillStyle=col; c.fillRect(x-s*.18,y-s*.12,s*.36,s*.24);
  c.fillStyle='#131115'; c.beginPath(); c.arc(x-s*.07,y,s*.035,0,7); c.arc(x+s*.07,y,s*.035,0,7); c.fill();
}
function drawAmp(c,x,y,s,t,edge){
  const pulse=.5+.5*Math.sin(t*6);
  c.save(); c.shadowColor='#ffd400'; c.shadowBlur=s*.5*pulse;
  c.fillStyle='#0d0c0e'; c.fillRect(x-s*.36,y-s*.32,s*.72,s*.64); c.restore();
  c.strokeStyle=edge; c.lineWidth=Math.max(1,s*.05); c.strokeRect(x-s*.36,y-s*.32,s*.72,s*.64);
  c.fillStyle='#ffd400'; c.fillRect(x-s*.36,y-s*.32,s*.72,s*.13);
  c.fillStyle='#0d0c0e'; for(let i=0;i<3;i++){c.beginPath();c.arc(x-s*.2+i*s*.2,y-s*.255,s*.035,0,7);c.fill()}
  c.strokeStyle='#5d5662'; c.beginPath(); c.arc(x,y+s*.07,s*.16+pulse*s*.02,0,7); c.stroke();
  c.fillStyle='#2b2730'; c.beginPath(); c.arc(x,y+s*.07,s*.1,0,7); c.fill();
}
function drawBonus(c,kind,x,y,s,t){
  c.save(); c.translate(x,y); const bob=Math.sin((t||0)*4)*s*.05; c.translate(0,bob);
  if(kind==='guitar'){
    c.rotate(-.7);
    c.fillStyle='#d4232f'; c.beginPath(); c.ellipse(0,s*.18,s*.2,s*.17,0,0,7); c.ellipse(0,-s*.02,s*.14,s*.12,0,0,7); c.fill();
    c.fillStyle='#6b4423'; c.fillRect(-s*.035,-s*.48,s*.07,s*.42); c.fillStyle='#222'; c.fillRect(-s*.06,-s*.56,s*.12,s*.1);
    c.fillStyle='#111'; c.beginPath(); c.arc(0,s*.12,s*.05,0,7); c.fill();
    c.strokeStyle='#eee'; c.lineWidth=Math.max(.6,s*.012); c.beginPath();
    for(const o of [-.02,0,.02]){ c.moveTo(o*s,-s*.5); c.lineTo(o*s,s*.24); } c.stroke();
  } else if(kind==='jacket'){
    c.fillStyle='#1b1a1d'; c.strokeStyle='#8a8590'; c.lineWidth=Math.max(1,s*.03);
    c.beginPath(); c.moveTo(-s*.14,-s*.34); c.lineTo(-s*.4,-s*.22); c.lineTo(-s*.42,s*.3); c.lineTo(-s*.3,s*.3); c.lineTo(-s*.28,s*.36); c.lineTo(s*.28,s*.36);
    c.lineTo(s*.3,s*.3); c.lineTo(s*.42,s*.3); c.lineTo(s*.4,-s*.22); c.lineTo(s*.14,-s*.34); c.lineTo(0,-s*.18); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle='#cfcad3'; c.beginPath(); c.moveTo(s*.02,-s*.16); c.lineTo(s*.06,s*.36); c.stroke();
    c.fillStyle='#cfcad3'; for(const [a,b] of [[-.2,-.18],[-.26,-.08],[.2,-.18],[.26,-.08],[-.3,.02],[.3,.02]]){ c.beginPath(); c.arc(a*s,b*s,s*.025,0,7); c.fill(); }
    c.fillStyle='#ff2d7a'; c.beginPath(); c.arc(-s*.16,s*.12,s*.06,0,7); c.fill();
  } else {
    c.fillStyle='#e9e7e2'; c.fillRect(-s*.4,-s*.26,s*.8,s*.52);
    c.fillStyle='#ffd400'; c.fillRect(-s*.33,-s*.2,s*.66,s*.2);
    c.fillStyle='#131115'; c.font=`${Math.round(s*.17)}px 'Permanent Marker', cursive`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('DEMO',0,-s*.1);
    c.fillStyle='#2b2730'; c.fillRect(-s*.22,s*.04,s*.44,s*.14);
    c.fillStyle='#e9e7e2'; c.beginPath(); c.arc(-s*.12,s*.11,s*.045,0,7); c.arc(s*.12,s*.11,s*.045,0,7); c.fill();
  }
  c.restore();
}
function drawPunk(c,x,y,s,dir,mouth,dying){
  const r=s*.42, a=ANG[dir||'R'];
  // mohawk
  c.fillStyle=HAWK;
  if(dying<1){
    const fall=(dying||0)*s*.6;
    for(let i=0;i<5;i++){
      const sa=-Math.PI/2+(i-2)*.33;
      let diff=Math.abs(((sa-a+Math.PI*3)%(Math.PI*2))-Math.PI);
      if(diff<mouth+.15) continue;
      const len=r*(i===2?1.62:1.42-Math.abs(i-2)*.08);
      c.beginPath();
      c.moveTo(x+Math.cos(sa-.13)*r*.85,y+Math.sin(sa-.13)*r*.85+fall);
      c.lineTo(x+Math.cos(sa)*len,y+Math.sin(sa)*len+fall*1.4);
      c.lineTo(x+Math.cos(sa+.13)*r*.85,y+Math.sin(sa+.13)*r*.85+fall);
      c.fill();
    }
  }
  // head
  c.fillStyle=SKIN; c.beginPath(); c.moveTo(x,y); c.arc(x,y,r,a+mouth,a-mouth+Math.PI*2); c.closePath(); c.fill();
  if(mouth>=Math.PI-.05) return;
  // eye
  const perp=(dir==='L')?a+Math.PI/2:a-Math.PI/2;
  const ex=x+Math.cos(perp)*r*.5+Math.cos(a)*r*.12, ey=y+Math.sin(perp)*r*.5+Math.sin(a)*r*.12;
  c.fillStyle='#131115'; c.beginPath(); c.arc(ex,ey,r*.11,0,7); c.fill();
  // safety-pin earring
  const ea=perp+Math.PI;
  drawPin(c,x+Math.cos(ea)*r*.75,y+Math.sin(ea)*r*.75+r*.15,s*.7,1.3,'#d6d9de');
}
function drawGhost(c,x,y,s,g,t,flash){
  const r=s*.44, top=y-s*.05, eyesOnly=g.state==='eyes', fr=g.fright;
  const d=DIRS[g.dir||'D'];
  if(!eyesOnly){
    c.fillStyle=fr?(flash?'#ff2d7a':'#ecebe6'):g.color;
    c.beginPath(); c.arc(x,top,r,Math.PI,0); c.lineTo(x+r,y+r*.92);
    const n=3, w=2*r/n, ph=Math.sin(t*12)*r*.12;
    for(let i=0;i<n;i++){ const x0=x+r-i*w; c.quadraticCurveTo(x0-w*.5,y+r*.92-r*.32+ph*(i%2?1:-1),x0-w,y+r*.92); }
    c.closePath(); c.fill();
  }
  if(fr && !eyesOnly){
    c.fillStyle='#131115';
    c.beginPath(); c.arc(x-r*.3,top+r*.05,r*.11,0,7); c.arc(x+r*.3,top+r*.05,r*.11,0,7); c.fill();
    c.strokeStyle='#131115'; c.lineWidth=Math.max(1,s*.05); c.beginPath();
    for(let i=0;i<=6;i++){ const px=x-r*.55+i*r*.183, py=top+r*.5+(i%2?-r*.1:r*.1); i?c.lineTo(px,py):c.moveTo(px,py); } c.stroke();
    return;
  }
  // accessories behind eyes
  if(!eyesOnly){
    if(g.id==='murija'){
      c.fillStyle='#14204a'; c.fillRect(x-r*.95,top-r*1.02,r*1.9,r*.5);
      c.fillStyle='#0b0f22'; c.fillRect(x-r*1.05,top-r*.56,r*2.1,r*.16);
      c.fillStyle='#ffd400'; c.beginPath(); c.arc(x,top-r*.77,r*.13,0,7); c.fill();
    } else if(g.id==='menadzer'){
      c.fillStyle='#2a2d31'; c.beginPath(); c.ellipse(x-r*.15,top-r*.78,r*.8,r*.3,-.15,0,7); c.fill();
      c.fillStyle='#d4232f'; c.beginPath(); c.moveTo(x-r*.12,top+r*.5); c.lineTo(x+r*.12,top+r*.5); c.lineTo(x+r*.16,y+r*.6); c.lineTo(x,y+r*.8); c.lineTo(x-r*.16,y+r*.6); c.closePath(); c.fill();
    } else if(g.id==='inspektor'){
      c.fillStyle='#4a3a22'; c.fillRect(x-r*1.1,top-r*.62,r*2.2,r*.14); c.fillRect(x-r*.6,top-r*1.05,r*1.2,r*.46);
      c.fillStyle='#e9e7e2'; c.fillRect(x+r*.45,y,r*.55,r*.7); c.fillStyle='#6b5a3a'; c.fillRect(x+r*.58,y-r*.06,r*.3,r*.12);
      c.strokeStyle='#131115'; c.lineWidth=Math.max(.6,s*.02); c.beginPath(); for(let i=1;i<4;i++){c.moveTo(x+r*.52,y+i*r*.16);c.lineTo(x+r*.92,y+i*r*.16)} c.stroke();
    }
  }
  if(g.id==='zvezda' && !eyesOnly){
    c.fillStyle='#ff2d7a';
    c.beginPath(); c.roundRect?c.roundRect(x-r*.72,top-r*.18,r*.62,r*.42,r*.14):c.rect(x-r*.72,top-r*.18,r*.62,r*.42);
    c.roundRect?c.roundRect(x+r*.1,top-r*.18,r*.62,r*.42,r*.14):c.rect(x+r*.1,top-r*.18,r*.62,r*.42); c.fill();
    c.fillRect(x-r*.12,top-r*.06,r*.24,r*.07);
    const sp=.6+.4*Math.sin(t*7); c.fillStyle='#fff';
    const sx=x+r*.8, sy=top-r*.85, k=r*.28*sp;
    c.beginPath(); c.moveTo(sx,sy-k); c.lineTo(sx+k*.25,sy); c.lineTo(sx,sy+k); c.lineTo(sx-k*.25,sy); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(sx-k,sy); c.lineTo(sx,sy+k*.25); c.lineTo(sx+k,sy); c.lineTo(sx,sy-k*.25); c.closePath(); c.fill();
  } else {
    c.fillStyle='#fff';
    c.beginPath(); c.ellipse(x-r*.36,top+r*.02,r*.25,r*.32,0,0,7); c.ellipse(x+r*.36,top+r*.02,r*.25,r*.32,0,0,7); c.fill();
    c.fillStyle='#14204a';
    c.beginPath(); c.arc(x-r*.36+d[0]*r*.11,top+r*.02+d[1]*r*.14,r*.13,0,7); c.arc(x+r*.36+d[0]*r*.11,top+r*.02+d[1]*r*.14,r*.13,0,7); c.fill();
  }
  if(g.id==='inspektor' && g.raid>0 && !eyesOnly){
    c.fillStyle='#ffd400'; c.font=`${Math.round(s*.8)}px 'Archivo Black', Impact, sans-serif`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('!',x,top-r*1.15);
  }
}
