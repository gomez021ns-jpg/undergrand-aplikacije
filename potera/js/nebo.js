// UnderGRAND Potera do Horgoša - nebo i siluete (crta se JEDNOM po deonici u pomoćni canvas).
// Dva sloja široka dva ekrana (640 logičkih piksela, ponavljaju se ukrug), za paralaksu u krivinama:
//   daleko = Bayer 4×4 dithering neba, zvezde, sunce/mesec, oblaci, daleki drvored u izmaglici
//   blizu  = siluete (salaš, đeram, topole, crkva, silos...), pomeraju se brže od neba
// Tehnika i boje su iz dizajn/scena.js (deonica 3 je kadar sa makete).
'use strict';

const NEBO_W = 1280, NEBO_H = HZ * 2;   // u pikselima pomoćnog canvasa
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const TAU = Math.PI * 2;
const per = (k) => (k * TAU) / 640;      // talas koji se tačno ponavlja na 640 logičkih piksela

function napraviNebo(dn) {
  const pal = dn.nebo.map(hexRgb);
  const noc = dn.doba === 'noć';
  const t3 = dn.id === 3;
  const sil = t3 ? '#2a1232' : css(mix(pal[0], [0, 0, 0], 0.45));
  const daleko = t3 ? '#7a2f5e' : css(mix(pal[Math.floor(pal.length * 0.6)], hexRgb(sil.startsWith('#') ? sil : '#000000'), 0.55));

  // ---- daleki sloj
  const far = document.createElement('canvas'); far.width = NEBO_W; far.height = NEBO_H;
  const g = far.getContext('2d');
  const img = g.createImageData(NEBO_W, NEBO_H);
  for (let y = 0; y < NEBO_H; y++) {
    const t = (y / NEBO_H) * (pal.length - 1), i = Math.min(pal.length - 2, Math.floor(t)), f = t - i;
    for (let x = 0; x < NEBO_W; x++) {
      const c = f > (BAYER[y & 3][x & 3] + 0.5) / 16 ? pal[i + 1] : pal[i];
      const k = (y * NEBO_W + x) * 4;
      img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  g.scale(2, 2);
  const R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, Math.max(0.5, w), Math.max(0.5, h)); };
  const nebo = (y) => pal[clamp(Math.floor((y / HZ) * (pal.length - 1)), 0, pal.length - 1)];

  // zvezde (gornji, tamni deo neba)
  const zr = rng(dn.id * 31 + 5);
  const brZv = noc ? 70 : t3 ? 22 : 12;
  for (let k = 0; k < brZv; k++) {
    const x = zr() * 640, y = zr() * (noc ? HZ - 20 : 30);
    R(k % 3 ? '#d8c8ff' : '#ffffff', x, y, 0.5, 0.5);
  }
  // sunce: preliv, sjaj i pruge (Amiga "retro sunce")
  if (dn.sunce) {
    const { x: sx, y: sy, r: sr } = dn.sunce;
    g.save(); g.beginPath(); g.rect(0, 0, 640, HZ); g.clip();
    const lg = g.createLinearGradient(0, sy - sr, 0, sy + sr);
    lg.addColorStop(0, '#fff3a8'); lg.addColorStop(0.45, '#ffc456'); lg.addColorStop(1, '#ff6a3a');
    g.fillStyle = lg; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill();
    const rg = g.createRadialGradient(sx, sy, sr * 0.8, sx, sy, sr * 2.4);
    rg.addColorStop(0, 'rgba(255,190,90,0.35)'); rg.addColorStop(1, 'rgba(255,190,90,0)');
    g.fillStyle = rg; g.fillRect(sx - sr * 2.5, 0, sr * 5, HZ);
    // pruge zalazećeg sunca: samo unutar kruga (Amiga "retro sunce"), sve deblje ka dnu
    g.save(); g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.clip();
    for (let k = 0; k < 9; k++) {
      const yy = sy + sr * (-0.02 + k * 0.1), hh = 0.45 + k * 0.5;
      g.fillStyle = css(mix(nebo(yy), [140, 30, 50], 0.4)); g.fillRect(sx - sr - 1, yy, sr * 2 + 2, hh);
    }
    g.restore();
    g.restore();
  }
  // mesec
  if (dn.mesec) {
    const { x: mx, y: my, r: mr } = dn.mesec;
    const rg = g.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3);
    rg.addColorStop(0, 'rgba(200,210,255,0.25)'); rg.addColorStop(1, 'rgba(200,210,255,0)');
    g.fillStyle = rg; g.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
    g.fillStyle = '#eef0ff'; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
    g.fillStyle = 'rgba(160,165,200,0.6)'; g.beginPath(); g.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.25, 0, TAU); g.arc(mx + mr * 0.35, my + mr * 0.3, mr * 0.18, 0, TAU); g.fill();
  }
  // oblaci (ravne meke pruge)
  const ob = t3
    ? [[20, 38, 90, '#4e1c5c'], [34, 41, 56, '#6c2660'], [140, 56, 110, '#9a3260'], [160, 59.5, 64, '#c04a56'], [245, 28, 64, '#3e1858'], [262, 30.5, 36, '#5a2060'],
       [360, 44, 80, '#5e1e60'], [380, 47, 40, '#7a2862'], [470, 62, 96, '#a83a5c'], [560, 34, 70, '#4a1a5a']]
    : [[30, 30, 80, 0.35], [180, 48, 100, 0.55], [330, 26, 70, 0.3], [470, 52, 90, 0.6], [580, 38, 60, 0.45]].map((a) => [a[0], a[1], a[2], css(mix(nebo(a[1]), noc ? [40, 40, 70] : [255, 200, 200], noc ? 0.25 : 0.18))]);
  ob.forEach((a) => {
    R(a[3], a[0], a[1], a[2], 1.5); R(a[3], a[0] + 6, a[1] + 1.5, a[2] - 12, 1);
    R('rgba(40,14,50,0.22)', a[0] + 2, a[1] + 1.6, a[2] - 4, 0.6);      // senka ispod oblaka
    if (!noc) R('rgba(255,225,205,0.16)', a[0] + 3, a[1] - 0.6, a[2] - 8, 0.5);   // svetlo na vrhu
  });
  // topao sjaj pri zalasku: izmaglica uz sam horizont (ispod silueta)
  if (!noc) {
    const hg = g.createLinearGradient(0, HZ - 30, 0, HZ);
    hg.addColorStop(0, 'rgba(255,190,120,0)'); hg.addColorStop(0.65, 'rgba(255,178,104,0.10)'); hg.addColorStop(1, 'rgba(255,168,96,0.22)');
    g.fillStyle = hg; g.fillRect(0, HZ - 30, 640, 30);
  }
  // brda u daljini: meka silueta iza drvoreda (daje dubinu)
  g.fillStyle = css(mix(t3 ? hexRgb('#7a2f5e') : pal[pal.length - 1], [24, 10, 30], t3 ? 0.3 : 0.38));
  for (let x = 0; x < 640; x += 0.5) {
    const h = (Math.sin(x * per(7) + 1.9) * 0.8 + Math.sin(x * per(3) + 0.4) * 1.5 + 2.6) * (t3 ? 2.4 : 1.6);
    g.fillRect(x, HZ - h - 3, 0.5, h + 3);
  }
  // daleki drvored u izmaglici
  g.fillStyle = daleko;
  for (let x = 0; x < 640; x += 0.5) { const h = (Math.sin(x * per(13)) + Math.sin(x * per(5)) * 1.3 + 2.4) * 1.3; g.fillRect(x, HZ - h - 1.5, 0.5, h + 1.5); }

  // ---- bliski sloj (siluete)
  const near = document.createElement('canvas'); near.width = NEBO_W; near.height = NEBO_H;
  const n = near.getContext('2d'); n.scale(2, 2);
  const S = (x, y, w, h) => n.fillRect(x, y, w, h);
  n.fillStyle = sil;
  for (let x = 0; x < 640; x += 0.5) { const h = (Math.sin(x * per(21)) + Math.sin(x * per(7)) * 1.5 + 2.6) * 1.05; S(x, HZ - h, 0.5, h); }
  const prozor = noc || t3 || dn.doba === 'zora' ? '#ffcf6a' : null;
  const C = {
    salas(x) {
      n.fillStyle = sil; S(x, HZ - 11, 22, 11);
      n.beginPath(); n.moveTo(x - 2.5, HZ - 11); n.lineTo(x + 11, HZ - 19); n.lineTo(x + 24.5, HZ - 11); n.fill(); S(x + 18, HZ - 17, 1.5, 4);
      if (prozor) { n.fillStyle = prozor; S(x + 5, HZ - 7.5, 2, 2); S(x + 14, HZ - 7.5, 2, 2); }
    },
    djeram(x) {
      n.fillStyle = sil; S(x, HZ - 15, 1, 15); n.strokeStyle = sil; n.lineWidth = 0.8;
      n.beginPath(); n.moveTo(x - 9, HZ - 19.5); n.lineTo(x + 14, HZ - 9); n.stroke(); S(x + 13.5, HZ - 9, 0.5, 7);
    },
    topole(x) { n.fillStyle = sil; [[0, 16], [6, 13], [14, 15]].forEach((a) => { n.beginPath(); n.ellipse(x + a[0], HZ - a[1] / 2, 2.2, a[1] / 2, 0, 0, TAU); n.fill(); }); },
    crkva(x) {
      n.fillStyle = sil; S(x, HZ - 21, 6, 21); n.beginPath(); n.moveTo(x - 1, HZ - 21); n.lineTo(x + 3, HZ - 31); n.lineTo(x + 7, HZ - 21); n.fill();
      if (prozor) { n.fillStyle = prozor; S(x + 2.25, HZ - 16, 1.5, 2.5); }
    },
    silos(x) { n.fillStyle = sil; S(x, HZ - 26, 9, 26); S(x + 10, HZ - 22, 8, 22); n.beginPath(); n.arc(x + 4.5, HZ - 26, 4.5, Math.PI, 0); n.arc(x + 14, HZ - 22, 4, Math.PI, 0); n.fill(); S(x + 18, HZ - 14, 10, 14); },
    zgrade(x) {
      [[0, 30, 14], [16, 22, 12], [30, 38, 16], [48, 26, 12]].forEach((b) => {
        n.fillStyle = sil; S(x + b[0], HZ - b[1], b[2], b[1]);
        if (prozor) { n.fillStyle = prozor; for (let yy = HZ - b[1] + 3; yy < HZ - 3; yy += 4) for (let xx = x + b[0] + 2; xx < x + b[0] + b[2] - 2; xx += 3) if (hash(xx * 7 + yy * 13) > 0.55) S(xx, yy, 1, 1.5); }
      });
    },
    dimnjak(x) { n.fillStyle = sil; n.beginPath(); n.moveTo(x, HZ); n.lineTo(x + 2, HZ - 44); n.lineTo(x + 5, HZ - 44); n.lineTo(x + 7, HZ); n.fill(); if (prozor) { n.fillStyle = '#ff4a3a'; S(x + 2.5, HZ - 46, 2, 1.5); } },
    dalekovod(x) {
      n.fillStyle = sil; n.strokeStyle = sil; n.lineWidth = 0.6;
      for (let k = 0; k < 3; k++) { const bx = x + k * 50; n.beginPath(); n.moveTo(bx - 4, HZ); n.lineTo(bx, HZ - 34); n.lineTo(bx + 4, HZ); n.fill(); S(bx - 6, HZ - 30, 12, 1); S(bx - 5, HZ - 24, 10, 1); }
      n.beginPath(); n.moveTo(x - 6, HZ - 29); n.quadraticCurveTo(x + 25, HZ - 22, x + 44, HZ - 29); n.quadraticCurveTo(x + 75, HZ - 22, x + 94, HZ - 29); n.stroke();
    },
    vetrenjace(x) {
      n.fillStyle = sil; n.strokeStyle = sil; n.lineWidth = 0.7;
      [[0, 36], [34, 30], [62, 40]].forEach((v, i) => { const bx = x + v[0], top = HZ - v[1]; S(bx - 0.6, top, 1.2, v[1]); for (let k = 0; k < 3; k++) { const a = i + k * 2.094; n.beginPath(); n.moveTo(bx, top); n.lineTo(bx + Math.cos(a) * 10, top + Math.sin(a) * 10); n.stroke(); } if (prozor) { n.fillStyle = '#ff4a3a'; S(bx - 0.7, top - 1.5, 1.4, 1.2); n.fillStyle = sil; } });
    },
    reflektori_granica(x) {
      n.fillStyle = sil; S(x, HZ - 12, 60, 12); S(x + 4, HZ - 22, 52, 3);
      for (let k = 0; k < 3; k++) { S(x + 6 + k * 22, HZ - 32, 1.5, 22); if (prozor) { n.fillStyle = '#fff6d0'; S(x + 4 + k * 22, HZ - 34, 5, 2); n.fillStyle = sil; } }
      if (prozor) { const rg = n.createRadialGradient(x + 30, HZ - 30, 0, x + 30, HZ - 30, 40); rg.addColorStop(0, 'rgba(255,240,200,0.25)'); rg.addColorStop(1, 'rgba(255,240,200,0)'); n.fillStyle = rg; S(x - 10, HZ - 70, 80, 70); }
    },
  };
  // raspored: deonica 3 kao na maketi (salaš 38, đeram 72, topole 96, crkva 295), pa još jedan "krug" na drugoj polovini
  const MESTA = t3
    ? [['salas', 38], ['djeram', 72], ['topole', 96], ['crkva', 295.5], ['topole', 360], ['salas', 420], ['djeram', 470], ['topole', 530], ['salas', 590]]
    : null;
  if (MESTA) MESTA.forEach(([k, x]) => C[k](x));
  else {
    const vrste = dn.siluete.filter((k) => C[k]);
    const r = rng(dn.id * 977);
    let x = 20;
    while (x < 600) { const k = vrste[Math.floor(r() * vrste.length)]; C[k](x); x += 70 + r() * 70; }
  }
  return { far, near };
}

// Crta oba sloja sa pomakom (u logičkim pikselima, ponavljaju se ukrug).
function crtajNebo(g, nebo, pomFar, pomNear) {
  for (const [cv, pom] of [[nebo.far, pomFar], [nebo.near, pomNear]]) {
    const p = (((pom * 2) % NEBO_W) + NEBO_W) % NEBO_W;
    g.drawImage(cv, -p, 0);
    if (p > NEBO_W - BW) g.drawImage(cv, NEBO_W - p, 0);
  }
}
