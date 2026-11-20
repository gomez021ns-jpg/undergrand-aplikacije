// UnderGRAND Potera do Horgoša - sprajtovi. Svaki se nacrta JEDNOM u keš canvas (4× pa umanjenja na 2×, 1×, ½×),
// a u igri se samo kopira u potrebnoj veličini. Crtež je preuzet iz dizajn/scena.js (jedinica = logički piksel pri s = 1,
// s = dy/120, tačka (0,0) = sredina dna sprajta). Predmeti koji se okreću (kofer, novčanice) crtaju se direktno.
'use strict';

const KES = {};

// k = [kx, ky]: razvlačenje crteža na stvarne mere (crtež je u jedinicama makete, 21,7 jedinica = 1 m)
function napraviKes(box, crtaj, vrh = 4, nivoa = 4, k = [1, 1], ton = null) {
  const l = box[0] * k[0], t = box[1] * k[1], r = box[2] * k[0], b = box[3] * k[1];
  const lv = [];
  let f = vrh;
  const cv0 = document.createElement('canvas');
  cv0.width = Math.ceil((r - l) * f) + 2; cv0.height = Math.ceil((b - t) * f) + 2;
  const g0 = cv0.getContext('2d');
  g0.setTransform(f * k[0], 0, 0, f * k[1], 1 - l * f, 1 - t * f);
  crtaj(g0);
  if (ton) { // noćni / jutarnji ton deonice preko celog crteža (samo gde ima piksela)
    g0.setTransform(1, 0, 0, 1, 0, 0); g0.globalCompositeOperation = 'source-atop';
    g0.fillStyle = ton.boja; g0.fillRect(0, 0, cv0.width, cv0.height); g0.globalCompositeOperation = 'source-over';
  }
  lv.push({ f, cv: cv0 });
  for (let i = 1; i < nivoa; i++) {
    const pre = lv[i - 1]; f = pre.f / 2;
    const cv = document.createElement('canvas');
    cv.width = Math.ceil((r - l) * f) + 2; cv.height = Math.ceil((b - t) * f) + 2;
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(pre.cv, 0, 0, pre.cv.width, pre.cv.height, 1 - 1 / 2 * 1, 1 - 0.5, pre.cv.width / 2, pre.cv.height / 2);
    lv.push({ f, cv });
  }
  return { l, t, r, b, lv };
}

// g = pomoćni canvas sa scale(2,2); (x,y) = sredina dna u logičkim pikselima; s = razmera
function crtajKes(g, sp, x, y, s) {
  const need = s * 2;
  let L = sp.lv[0];
  for (const lv of sp.lv) if (lv.f >= need) L = lv;
  const k = s / L.f;
  g.drawImage(L.cv, x + (sp.l - 1 / L.f) * s, y + (sp.t - 1 / L.f) * s, L.cv.width * k, L.cv.height * k);
}

// TON = ton deonice (noć, zora) - postavlja ga novaDeonica; sprajt koji sam svetli (upaljena bandera) traži bezTona
let TON = null;
const TONOVI = { 'noć': { id: 'n', boja: 'rgba(6,8,30,0.6)' }, zora: { id: 'z', boja: 'rgba(70,40,90,0.2)' } };
function sprajt(ime, box, crtaj, vrh, nivoa, k, bezTona) {
  const ton = bezTona ? null : TON, kljuc = ime + (ton ? '|' + ton.id : '');
  if (!KES[kljuc]) KES[kljuc] = napraviKes(box, crtaj, vrh, nivoa, k, ton);
  return KES[kljuc];
}

// ---------- pomoćne ----------
const LGr = (g, x0, y0, x1, y1, stops) => { const l = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((s) => l.addColorStop(s[0], s[1])); return l; };
const Rk = (g, col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
const krug = (g, col, x, y, r) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
const tamnije = (c, k) => css(c.map((v) => v * k));
const svetlije = (c, k) => css(c.map((v) => v + (255 - v) * k));

// meka senka pod vozilom (elipsa sa prelivom) - crta se u keš, pa u igri ne košta ništa
const senka = (g, x, y, rx, ry, a = 0.5) => {
  g.save(); g.translate(x, y); g.scale(rx, ry);
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  // preliv se gasi do 0,72 poluprečnika, pa senka ne dodiruje ivicu keša (inače bi se sekla)
  rg.addColorStop(0, `rgba(0,0,0,${a})`); rg.addColorStop(0.45, `rgba(0,0,0,${a * 0.38})`); rg.addColorStop(0.72, 'rgba(0,0,0,0.02)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore();
};

// ---------- njive ----------
const BILJKE = {
  suncokret: [[-6, -33, 7, 1], (g) => {
    Rk(g, '#2f5a1c', -0.4, -26, 1.2, 26); krug(g, '#f4c21e', 0, -27, 5); krug(g, '#5a3410', 0, -27, 2.2);
    g.fillStyle = '#3d6e22'; g.beginPath(); g.ellipse(3, -14, 3.5, 1.5, -0.4, 0, TAU); g.fill();
  }],
  kukuruz: [[-11, -39, 11, 1], (g) => {
    const Hh = 34; Rk(g, '#5d7a22', -0.5, -Hh, 1.4, Hh);
    g.strokeStyle = '#3f6a1e'; g.lineWidth = 1.2;
    [[0.35, 1], [0.55, -1], [0.75, 1]].forEach((l) => { g.beginPath(); g.moveTo(0, -Hh * l[0]); g.quadraticCurveTo(l[1] * 7, -Hh * l[0] - 4, l[1] * 10, -Hh * l[0] + 2); g.stroke(); });
    Rk(g, '#e8c860', -0.6, -Hh - 4, 1.6, 4); Rk(g, '#d8b84a', 1.2, -Hh * 0.5, 2, 5);
  }],
  zito: [[-6, -20, 6, 1], (g) => {
    for (let k = -2; k <= 2; k++) { const xx = k * 2.2, Hh = 12 + ((k + 5) % 3) * 2; Rk(g, '#c9a24a', xx, -Hh, 0.7, Hh); Rk(g, '#f0d27a', xx - 0.6, -Hh - 3, 1.8, 3.5); }
  }],
  uzorano: [[-5, -3, 5, 1], (g) => { Rk(g, '#5a3418', -4, -2, 8, 2.5); Rk(g, '#8a5a34', -3, -2.5, 4, 1); }],
};
// visine u stvarnim merama: suncokret ~1,8 m, kukuruz ~2,3 m, žito ~1 m
const K_BILJKE = { suncokret: [1.5, 1.5], kukuruz: [1.4, 1.4], zito: [1.1, 1.1], uzorano: [1.5, 1.5] };
const biljka = (tip) => sprajt('b_' + tip, BILJKE[tip][0], BILJKE[tip][1], 4, 4, K_BILJKE[tip]);

// ---------- pored puta ----------
function bandera(desno, noc) {
  return sprajt('bandera' + (desno ? 'D' : 'L') + (noc ? 'n' : ''), [-24, -104, 24, 1], (g) => {
    if (!desno) g.scale(-1, 1);
    const h = 95;
    // noću: stub taman (bez tona, jer lampa sama svetli), sjaj veći, svetlosni krug na asfaltu ispod lampe
    g.fillStyle = LGr(g, 0, 0, 3, 0, noc ? [[0, '#22202c'], [1, '#0c0a12']] : [[0, '#4a3a58'], [1, '#1e1628']]); g.fillRect(0, -h, 3, h);
    Rk(g, noc ? '#141220' : '#2b2236', -12, -h, 14, 1.6); Rk(g, noc ? '#fffbe0' : '#fff2b8', -12, -h + 1.6, 3.5, 1.5);
    const rg = g.createRadialGradient(-10, -h + 2, 0, -10, -h + 2, noc ? 16 : 10);
    rg.addColorStop(0, `rgba(255,230,150,${noc ? 0.7 : 0.35})`); rg.addColorStop(1, 'rgba(255,230,150,0)');
    g.fillStyle = rg; g.fillRect(-26, -h - 14, 30, 30);
    if (noc) { const rp = g.createRadialGradient(-10, 0, 0, -10, 0, 22); rp.addColorStop(0, 'rgba(255,220,140,0.28)'); rp.addColorStop(1, 'rgba(255,220,140,0)'); g.save(); g.scale(1, 0.18); g.fillStyle = rp; g.fillRect(-34, -22, 48, 44); g.restore(); }
  }, 4, 4, [2, 2], noc);
}

function putokaz(tekst) {
  return sprajt('putokaz|' + tekst.join('|'), [-37, -66, 37, 1], (g) => {
    const w = 70, h = 34, top = -h - 30;
    Rk(g, '#3a3046', -w * 0.3, top, 2, h + 30); Rk(g, '#3a3046', w * 0.3, top, 2, h + 30);
    Rk(g, '#f0f0f0', -w / 2 - 1, top - 1, w + 2, h + 2);
    g.fillStyle = LGr(g, 0, top, 0, top + h, [[0, '#2a9150'], [1, '#17683a']]); g.fillRect(-w / 2, top, w, h);
    g.fillStyle = '#fff'; g.textBaseline = 'top';
    tekst.forEach((t, i) => {
      let fs = 9; g.font = `${fs}px VT`;
      while (g.measureText(t).width > w - 8 && fs > 5) { fs -= 0.5; g.font = `${fs}px VT`; }
      g.fillText(t, -w / 2 + 4, top + 4 + i * 13);
    });
  }, 4, 4, [1.6, 1.6]);
}

function bilbord(tekst) {
  return sprajt('bilbord|' + tekst, [-42, -52, 42, 1], (g) => {
    const w = 80, h = 30, top = -h - 20;
    Rk(g, '#2b2236', -w * 0.3, top + h, 2, 20); Rk(g, '#2b2236', w * 0.3 - 2, top + h, 2, 20);
    Rk(g, '#1b1424', -w / 2 - 1, top - 1, w + 2, h + 2);
    Rk(g, '#f4e9d0', -w / 2, top, w, h); Rk(g, '#c42a2a', -w / 2, top, w, h * 0.3);
    g.textBaseline = 'top';
    g.fillStyle = '#fff'; g.font = '8px VT'; g.fillText('REKLAMA', -w / 2 + 3, top + 1);
    let fs = 11; g.font = `${fs}px VT`;
    while (g.measureText(tekst).width > w - 6 && fs > 5) { fs -= 0.5; g.font = `${fs}px VT`; }
    g.fillStyle = '#1b1b2a'; g.fillText(tekst, -w / 2 + 3, top + 10 + (11 - fs) * 0.6);
    // svetlo iznad table
    Rk(g, '#3a3046', -20, top - 4, 2, 4); Rk(g, '#3a3046', 18, top - 4, 2, 4);
  }, 4, 4, [2.2, 2.2]);
}

function topola(var_) {
  return sprajt('topola' + var_, [-11, -116, 11, 1], (g) => {
    const h = 100 + var_ * 8;
    Rk(g, '#2a1a20', -1, -14, 2, 14);
    g.fillStyle = LGr(g, -8, 0, 8, 0, [[0, '#1c2e1a'], [0.55, '#2f4a24'], [1, '#6a5a2e']]);
    g.beginPath(); g.ellipse(0, -14 - (h - 14) / 2, 7 + var_, (h - 14) / 2, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,170,80,0.22)'; g.beginPath(); g.ellipse(3, -14 - (h - 14) / 2, 3, (h - 14) / 2 - 4, 0, 0, TAU); g.fill();
  }, 4, 4, [2.4, 2.4]);
}

function salasBlizu(noc) {
  return sprajt('salas' + (noc ? 'n' : ''), [-48, -52, 48, 1], (g) => {
    const w = 72, zid = 24;
    Rk(g, 'rgba(0,0,0,0.3)', -w / 2 - 4, -1.5, w + 8, 2.5);
    g.fillStyle = LGr(g, 0, -zid, 0, 0, [[0, '#f2e6cf'], [1, '#c8b694']]); g.fillRect(-w / 2, -zid, w, zid);
    g.fillStyle = LGr(g, 0, -zid - 20, 0, -zid, [[0, '#a2503a'], [1, '#6e2c20']]);
    g.beginPath(); g.moveTo(-w / 2 - 5, -zid); g.lineTo(-w / 2 + 12, -zid - 20); g.lineTo(w / 2 - 12, -zid - 20); g.lineTo(w / 2 + 5, -zid); g.fill();
    Rk(g, '#5a2a20', 14, -zid - 26, 5, 10);
    for (let k = 0; k < 3; k++) { const x = -w / 2 + 8 + k * 22; Rk(g, '#4a3a2a', x - 1, -zid + 5, 9, 10); Rk(g, noc ? '#ffd27a' : '#ffcf6a', x, -zid + 6, 7, 8); Rk(g, '#4a3a2a', x + 3, -zid + 6, 1, 8); }
    Rk(g, '#6a4a2a', -w / 2 - 22, -8, 18, 1); Rk(g, '#6a4a2a', -w / 2 - 22, -4, 18, 1);
    for (let k = 0; k < 5; k++) Rk(g, '#6a4a2a', -w / 2 - 22 + k * 4, -10, 1.2, 10);
  }, 4, 4, [2.6, 2.6]);
}

// traktor na njivi (sa strane, kao na maketi), krupan (×3.1); prašina i dim se crtaju posebno jer se pomeraju
function traktorNjiva(levo) {
  return sprajt('traktorN' + (levo ? 'L' : 'D'), [-64, -82, 46, 4], (g) => {
    if (levo) g.scale(-1, 1);
    const s = 3.1;
    Rk(g, 'rgba(40,20,10,0.45)', -9 * s, -1 * s, 24 * s, 2 * s);
    g.fillStyle = LGr(g, 0, -15 * s, 0, -6 * s, [[0, '#e2453a'], [1, '#8e1c16']]); g.fillRect(-2 * s, -14 * s, 15 * s, 8 * s);
    Rk(g, '#c8c8c8', 11.5 * s, -13 * s, 1.6 * s, 6 * s); for (let k = 0; k < 3; k++) Rk(g, '#6a6a6a', 11.8 * s, -12.4 * s + k * 2 * s, 1 * s, 0.6 * s);
    g.fillStyle = LGr(g, 0, -24 * s, 0, -14 * s, [[0, '#d63a30'], [1, '#a02018']]); g.fillRect(-6 * s, -24 * s, 9 * s, 10 * s);
    g.fillStyle = LGr(g, -5 * s, -23 * s, 2 * s, -16 * s, [[0, '#cfe4f4'], [0.5, '#7aa0c0'], [1, '#c0d8ec']]); g.fillRect(-5 * s, -23 * s, 7 * s, 7 * s);
    Rk(g, '#7a1410', -6.5 * s, -25 * s, 10 * s, 1.4 * s);
    Rk(g, '#2a2a2a', 7 * s, -21 * s, 1 * s, 7 * s);
    g.fillStyle = '#b8281e'; g.beginPath(); g.arc(-5 * s, -6 * s, 8 * s, Math.PI, 0); g.fill();
    krug(g, '#141414', -5 * s, -6 * s, 6.6 * s);
    g.strokeStyle = '#2c2c2c'; g.lineWidth = 0.9 * s;
    for (let k = 0; k < 10; k++) { const an = (k * Math.PI) / 5; g.beginPath(); g.moveTo(-5 * s + Math.cos(an) * 5 * s, -6 * s + Math.sin(an) * 5 * s); g.lineTo(-5 * s + Math.cos(an) * 6.6 * s, -6 * s + Math.sin(an) * 6.6 * s); g.stroke(); }
    krug(g, '#e0c03a', -5 * s, -6 * s, 2.8 * s); krug(g, '#8a7420', -5 * s, -6 * s, 1 * s);
    krug(g, '#141414', 9 * s, -3.4 * s, 3.4 * s); krug(g, '#e0c03a', 9 * s, -3.4 * s, 1.5 * s);
    Rk(g, '#4a4a52', -17 * s, -6 * s, 6 * s, 1.2 * s); Rk(g, '#6a6a74', -19 * s, -5 * s, 3 * s, 4 * s);
  });
}

// ---------- saobraćaj (pogled otpozadi) ----------
const BOJE_AUTA = ['#c8343a', '#e8b828', '#3a6ab8', '#e8e4d8', '#3a8a5a', '#8a3a8a'];

function maliAuto(boja) { // "fića": kocka sa motorom pozadi
  return sprajt('fica' + boja, [-18, -27, 18, 4], (g) => {
    const c = hexRgb(boja), w = 30, h = 24, x = -w / 2, y = -h;
    senka(g, 0, -1, w * 0.72, 2.6, 0.5);
    g.fillStyle = LGr(g, 0, y, 0, 0, [[0, svetlije(c, 0.25)], [0.55, boja], [1, tamnije(c, 0.55)]]);
    g.fillRect(x, y + 9, w, h - 9);
    g.beginPath(); g.moveTo(x + 3, y + 9); g.lineTo(x + 6, y + 1); g.lineTo(x + w - 6, y + 1); g.lineTo(x + w - 3, y + 9); g.fill();
    g.fillStyle = LGr(g, x, y, x + w, y + 8, [[0, '#2a3656'], [0.5, '#8aa4d0'], [1, '#2a3656']]);
    g.beginPath(); g.moveTo(x + 6, y + 8.5); g.lineTo(x + 8, y + 2.5); g.lineTo(x + w - 8, y + 2.5); g.lineTo(x + w - 6, y + 8.5); g.fill();
    for (let k = 0; k < 5; k++) Rk(g, tamnije(c, 0.45), x + 9 + k * 2.6, y + 12, 1.4, 5);
    krug(g, '#ff4040', x + 3.5, y + 15, 1.8); krug(g, '#ff4040', x + w - 3.5, y + 15, 1.8);
    Rk(g, '#ffb02a', x + 2, y + 18, 3, 1.5); Rk(g, '#ffb02a', x + w - 5, y + 18, 3, 1.5);
    Rk(g, '#efefef', x + w / 2 - 5, y + 18, 10, 3);
    Rk(g, '#cfcfcf', x - 0.5, y + h - 3.5, w + 1, 1.2);
    Rk(g, '#151515', x + 1.5, y + h - 2, 6, 3.5); Rk(g, '#151515', x + w - 7.5, y + h - 2, 6, 3.5);
  }, 4, 4, [1, 1.15]);
}

function yugo(boja) { // mali auto sa makete
  return sprajt('yugo' + boja, [-19, -24, 19, 4], (g) => {
    const c = hexRgb(boja), w = 34, h = 22, x = -w / 2, y = -h;
    senka(g, 0, -1, w * 0.72, 2.6, 0.5);
    g.fillStyle = LGr(g, 0, y, 0, 0, [[0, svetlije(c, 0.15)], [0.55, boja], [1, tamnije(c, 0.6)]]); g.fillRect(x, y + 5, w, h - 5); g.fillRect(x + 3, y, w - 6, 6);
    g.fillStyle = LGr(g, x, y, x + w, y + 6, [[0, '#3a4a70'], [0.5, '#8aa4d0'], [1, '#2a3656']]); g.fillRect(x + 5, y + 1, w - 10, 5);
    Rk(g, 'rgba(255,255,255,0.22)', x + 7, y + 2, w - 16, 0.8);
    Rk(g, '#ffb02a', x + 1.5, y + 11, 5, 3); Rk(g, '#ffb02a', x + w - 6.5, y + 11, 5, 3); Rk(g, '#ff4040', x + 1.5, y + 14, 5, 2); Rk(g, '#ff4040', x + w - 6.5, y + 14, 5, 2);
    Rk(g, '#efefef', x + w / 2 - 5, y + 12, 10, 3.5); Rk(g, '#cfcfcf', x, y + h - 4, w, 1.5);
    Rk(g, '#151515', x + 1.5, y + h - 2, 6, 3); Rk(g, '#151515', x + w - 7.5, y + h - 2, 6, 3);
  }, 4, 4, [1, 1.3]);
}

// kamion sa ceradom (kao na maketi): veliki 2,5 × 3,7 m; "tamić" (mali kamion) 2,2 × 2,8 m sa maslinastom ceradom
function kamion(tamic) {
  return sprajt(tamic ? 'tamic' : 'kamion', [-26, -43, 26, 4], (g) => {
    const w = 46, h = 40;
    senka(g, 0, -1, w * 0.7, 2.6, 0.45);
    g.fillStyle = LGr(g, 0, -h, 0, 0, tamic ? [[0, '#9aa676'], [1, '#5e6a44']] : [[0, '#f2ecd6'], [1, '#c9c1a4']]); g.fillRect(-w / 2, -h, w, h - 6);
    for (let k = 1; k < 4; k++) Rk(g, 'rgba(90,80,60,0.35)', -w / 2 + k * (w / 4), -h + 1, 0.6, h - 8);
    Rk(g, '#8a8268', -w / 2, -h, w, 1.2);
    Rk(g, '#2a2a3a', -w / 2, -6, w, 4); Rk(g, '#ff3a3a', -w / 2 + 2, -5.5, 5, 2.5); Rk(g, '#ff3a3a', w / 2 - 7, -5.5, 5, 2.5);
    Rk(g, '#f0c020', -6, -5.5, 12, 3);
    Rk(g, '#111', -w / 2 + 3, -2, 9, 3); Rk(g, '#111', w / 2 - 12, -2, 9, 3);
    Rk(g, '#6a6450', -0.5, -h + 2, 1, h - 10);
  }, 4, 4, tamic ? [1.04, 1.52] : [1.17, 2.0]);
}

function autobus() {
  return sprajt('autobus', [-28, -49, 28, 4], (g) => {
    const w = 50, h = 46, x = -w / 2, y = -h;
    senka(g, 0, -1, w * 0.72, 2.8, 0.5);
    g.fillStyle = LGr(g, 0, y, 0, 0, [[0, '#7ab0e0'], [0.5, '#3a78c0'], [1, '#1c4a88']]); g.fillRect(x, y, w, h - 3);
    Rk(g, 'rgba(255,255,255,0.20)', x + 2, y + 1, w - 4, 1);            // linija krova
    Rk(g, 'rgba(10,20,50,0.25)', x, y + h - 9, w, 6);                   // senka pri dnu karoserije
    g.fillStyle = LGr(g, x, y, x + w, y + 14, [[0, '#152238'], [0.5, '#5a7aa8'], [1, '#152238']]); g.fillRect(x + 3, y + 3, w - 6, 13);
    Rk(g, '#f2f2e8', x, y + 18, w, 3);
    Rk(g, '#2a3a5a', x + 10, y + 24, w - 20, 9); for (let k = 0; k < 8; k++) Rk(g, '#1a2238', x + 12 + k * 3.5, y + 25, 1.5, 7);
    Rk(g, '#ff3a3a', x + 2, y + 26, 5, 6); Rk(g, '#ff3a3a', x + w - 7, y + 26, 5, 6);
    Rk(g, '#ffb02a', x + 2, y + 33, 5, 2); Rk(g, '#ffb02a', x + w - 7, y + 33, 5, 2);
    Rk(g, '#efefef', x + w / 2 - 6, y + 35, 12, 3.5);
    Rk(g, '#2a2a30', x - 0.5, y + h - 5, w + 1, 2.5);
    Rk(g, '#111', x + 2, y + h - 3, 9, 5); Rk(g, '#111', x + w - 11, y + h - 3, 9, 5);
  }, 4, 4, [1.1, 1.55]);
}

function kombi() {
  return sprajt('kombi', [-21, -39, 21, 4], (g) => {
    const w = 38, h = 36, x = -w / 2, y = -h;
    senka(g, 0, -1, w * 0.72, 2.6, 0.5);
    g.fillStyle = LGr(g, 0, y, 0, 0, [[0, '#ffffff'], [0.5, '#e2e4e8'], [1, '#9a9ea8']]); g.fillRect(x, y + 2, w, h - 4); g.fillRect(x + 2, y, w - 4, 3);
    g.fillStyle = LGr(g, x, y, x + w, y + 12, [[0, '#1e2a44'], [0.5, '#7a94c0'], [1, '#1e2a44']]); g.fillRect(x + 3, y + 4, w / 2 - 4, 11); g.fillRect(x + w / 2 + 1, y + 4, w / 2 - 4, 11);
    Rk(g, '#9aa0aa', -0.4, y + 3, 0.8, h - 8);
    Rk(g, '#ff3a3a', x + 1, y + 18, 3, 9); Rk(g, '#ff3a3a', x + w - 4, y + 18, 3, 9); Rk(g, '#ffb02a', x + 1, y + 27, 3, 2); Rk(g, '#ffb02a', x + w - 4, y + 27, 3, 2);
    Rk(g, '#4a8a5a', x + 6, y + 20, w - 12, 4);
    Rk(g, '#efefef', x + w / 2 - 5, y + 27, 10, 3);
    Rk(g, '#2a2a30', x - 0.5, y + h - 4, w + 1, 2);
    Rk(g, '#111', x + 2, y + h - 2, 7, 4); Rk(g, '#111', x + w - 9, y + h - 2, 7, 4);
  }, 4, 4, [1.12, 1.25]);
}

function traktorPut() { // traktor na autoputu, otpozadi: velike zadnje gume, trougao "sporo vozilo"
  return sprajt('traktorP', [-23, -46, 23, 4], (g) => {
    senka(g, 0, -1, 26, 2.4, 0.45);
    g.fillStyle = LGr(g, 0, -44, 0, -18, [[0, '#d63a30'], [1, '#8e1c16']]); g.fillRect(-10, -44, 20, 22);
    g.fillStyle = LGr(g, -8, -42, 8, -26, [[0, '#cfe4f4'], [0.5, '#7aa0c0'], [1, '#c0d8ec']]); g.fillRect(-8, -42, 16, 14);
    Rk(g, '#7a1410', -11, -45, 22, 1.5);
    g.fillStyle = LGr(g, 0, -24, 0, -8, [[0, '#e2453a'], [1, '#8e1c16']]); g.fillRect(-12, -24, 24, 14);
    [-1, 1].forEach((sx) => {
      g.fillStyle = '#b8281e'; g.beginPath(); g.ellipse(sx * 16, -16, 7, 9, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#141414'; g.fillRect(sx * 16 - 5.5, -16, 11, 17);
      for (let k = 0; k < 6; k++) Rk(g, '#2c2c2c', sx * 16 - 5, -14 + k * 2.6, 10, 1);
    });
    g.fillStyle = '#f07a1a'; g.beginPath(); g.moveTo(0, -20); g.lineTo(-5, -12); g.lineTo(5, -12); g.fill();
    g.fillStyle = '#c42a1a'; g.beginPath(); g.moveTo(0, -18); g.lineTo(-3, -13.2); g.lineTo(3, -13.2); g.fill();
    Rk(g, '#ff3a3a', -11, -9, 3, 2); Rk(g, '#ff3a3a', 8, -9, 3, 2);
    Rk(g, '#4a4a52', -3, -8, 6, 4);
  }, 4, 4, [1, 1.25]);
}

// Stvarne mere (širina × visina): fića 1,4 × 1,4 m; mali auto 1,55 × 1,4; kombi 1,95 × 2,1; tamić 2,2 × 2,8;
// kamion 2,5 × 3,7; autobus 2,55 × 3,3; traktor 1,9 × 2,6; džip 1,9 × 1,8; policijski auto (Zastava) 1,62 × 1,45.
// pw = pola širine u širinama puta (put = ±1 = ±5,25 m); v = brzine u km/h.
const pw_ = (m) => (m / 2) * M / ROAD_W;
const VOZILA = {
  mali_auto: { v: [95, 130] },
  kamion: { v: [80, 95] },
  autobus: { v: [85, 100] },
  kombi: { v: [90, 120] },
  traktor: { v: [24, 34] },
};
// duz = dužina vozila (m → jedinice puta): vozila se ne preklapaju ni po dužini (kamion 9 m, autobus 12 m)
function vozilo(tip, boja, r) {
  const v = (sp, sir, duz, ime) => ({ sp, pw: pw_(sir), duz: Math.round(duz * M), ime });
  if (tip === 'mali_auto') return boja.charCodeAt(1) % 2 ? v(maliAuto(boja), 1.4, 3.3, 'fića') : v(yugo(boja), 1.55, 3.6, 'mali auto');
  if (tip === 'kamion') return r() < 0.45 ? v(kamion(true), 2.2, 6, 'tamić') : v(kamion(false), 2.5, 9, 'kamion');
  if (tip === 'autobus') return v(autobus(), 2.55, 12, 'autobus');
  if (tip === 'kombi') return v(kombi(), 1.95, 4.8, 'kombi');
  if (tip === 'traktor') return v(traktorPut(), 1.9, 3.6, 'traktor');
  return v(yugo(boja), 1.55, 3.6, 'mali auto');
}
const DZIP_PW = pw_(1.9), DZIP_DUZ = Math.round(4.7 * M);

// ---------- džip begunca ----------
const DZIP_K = [0.733, 0.93];   // crtež makete (56 × 42) → 1,9 × 1,8 m
function dzip(b, koci) {
  return sprajt('dzip' + b.deonica + (koci ? 'k' : ''), [-32, -60, 32, 5], (g) => {
    const w = 56, h = 42, x = -w / 2, y = -h;
    const c = hexRgb(b.dzip.boja);
    const crn = (c[0] + c[1] + c[2]) / 3 < 60;
    senka(g, 0, -2, w * 0.66, 3.4, 0.55);
    g.fillStyle = crn
      ? LGr(g, 0, y, 0, 0, [[0, '#3a3a4c'], [0.3, '#15151f'], [0.75, '#07070b'], [1, '#121219']])
      : LGr(g, 0, y, 0, 0, [[0, svetlije(c, 0.4)], [0.3, b.dzip.boja], [0.75, tamnije(c, 0.6)], [1, tamnije(c, 0.75)]]);
    g.fillRect(x, y + 9, w, h - 9);
    g.fillStyle = crn ? LGr(g, 0, y, 0, y + 12, [[0, '#40404f'], [1, '#16161f']]) : LGr(g, 0, y, 0, y + 12, [[0, svetlije(c, 0.3)], [1, tamnije(c, 0.8)]]);
    g.fillRect(x + 3, y, w - 6, 12);
    g.fillStyle = LGr(g, x, y, x + w, y + 10, [[0, '#16243e'], [0.45, '#4a6a9a'], [0.55, '#7a9acc'], [1, '#16243e']]); g.fillRect(x + 6, y + 2, w - 12, 8);
    if (b.deonica === 1) g.fillStyle = 'rgba(8,10,16,0.55)', g.fillRect(x + 6, y + 2, w - 12, 8); // zatamnjena stakla
    Rk(g, 'rgba(180,190,220,0.55)', x + 1, y + 10, w - 2, 0.8);
    [x + 2, x + w - 9].forEach((lx) => {
      g.fillStyle = LGr(g, 0, y + 15, 0, y + 25, koci ? [[0, '#ffd0d0'], [0.4, '#ff3030'], [1, '#c00010']] : [[0, '#ff6060'], [1, '#a00010']]);
      g.fillRect(lx, y + 15, 7, 10);
      const rg = g.createRadialGradient(lx + 3.5, y + 20, 0, lx + 3.5, y + 20, koci ? 16 : 10);
      rg.addColorStop(0, `rgba(255,60,60,${koci ? 0.7 : 0.45})`); rg.addColorStop(1, 'rgba(255,60,60,0)');
      g.fillStyle = rg; g.fillRect(lx - 14, y + 4, 35, 34);
    });
    krug(g, '#0a0a10', x + w / 2, y + 20, 8.5); krug(g, b.deonica === 2 ? '#c8a038' : '#2e2e3c', x + w / 2, y + 20, 5); krug(g, b.deonica === 2 ? '#f4d878' : '#8a8aa0', x + w / 2, y + 20, 1.6);
    g.fillStyle = LGr(g, 0, y + h - 8, 0, y + h - 5, [[0, '#e8eaf0'], [1, '#6a6c78']]); g.fillRect(x + 1, y + h - 8, w - 2, 3);
    Rk(g, '#f4f4f4', x + w / 2 - 11, y + 30, 22, 6);
    g.fillStyle = '#c42a2a'; g.font = '5.4px VT'; g.textBaseline = 'top'; g.textAlign = 'center';
    g.fillText('? ? ?', x + w / 2, y + 30 - 0.08); g.textAlign = 'left';
    Rk(g, '#0c0c0c', x + 2, y + h - 4, 11, 5); Rk(g, '#0c0c0c', x + w - 13, y + h - 4, 11, 5);
    if (b.deonica === 2) { g.fillStyle = '#e8c860'; g.font = '5px VT'; g.fillText('SAVETUJEM', x + 17, y + 3.5); krug(g, '#c8a038', x + 7.5, y + h - 1.5, 2); krug(g, '#c8a038', x + w - 7.5, y + h - 1.5, 2); }
    if (b.deonica === 4) { g.fillStyle = '#f4f4f4'; g.beginPath(); g.ellipse(x + 12, y + 33, 4, 2.6, 0, 0, TAU); g.fill(); g.fillStyle = '#1a2a6a'; g.font = '4px VT'; g.fillText('CD', x + 10.2, y + 31.2); }
    if (b.deonica === 1) { Rk(g, '#22222c', -3, y - 3, 6, 3); g.fillStyle = LGr(g, 0, y - 6, 0, y - 2, [[0, '#8ab0ff'], [1, '#1a4ad8']]); g.beginPath(); g.arc(0, y - 3, 3, Math.PI, 0); g.fill(); }
    if (b.deonica === 3) { // krovni nosač prepun kofera vezanih kanapom
      Rk(g, '#2a2a34', x + 5, y - 2, w - 10, 2);
      [[x + 6, -11, 14, '#8a5a2c'], [x + 19, -9, 12, '#5a3a1a'], [x + 30, -12, 13, '#a0682c'], [x + 42, -8, 9, '#6a4020']].forEach((k) => {
        g.fillStyle = LGr(g, 0, y - 2 + k[1], 0, y - 2, [[0, svetlije(hexRgb(k[3]), 0.2)], [1, k[3]]]); g.fillRect(k[0], y - 2 + k[1], k[2], -k[1]);
        Rk(g, '#3a200a', k[0] + k[2] / 2 - 2, y - 3.5 + k[1], 4, 1.5); Rk(g, '#d8b060', k[0], y - 2 + k[1] / 2, k[2], 0.7);
      });
      g.strokeStyle = '#d8c8a0'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(x + 5, y - 1); g.lineTo(x + 26, y - 13); g.lineTo(x + w - 5, y - 1); g.stroke();
    }
  }, 4, 4, DZIP_K);
}

// ---------- policijski auto (pogled otpozadi, kao na maketi; apsolutne logičke koordinate makete) ----------
// Svetla na rotaciji, auspuh i natpisi (POLICIJA, NS-007) crtaju se posebno u igri.
const AUTO = { x: 112, y: 164, w: 96, h: 50 };
function policija() {
  return sprajt('policija', [80, 152, 240, 226], (g) => {
    const { x, y, w, h } = AUTO;
    let rg = g.createRadialGradient(x + w / 2, y + h, 4, x + w / 2, y + h, 62); rg.addColorStop(0, 'rgba(0,0,0,0.55)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - 30, y + h - 14, w + 60, 24);
    g.fillStyle = LGr(g, 0, y + 12, 0, y + h, [[0, '#ffffff'], [0.45, '#e3e8ee'], [1, '#a9b0bc']]);
    g.beginPath(); g.moveTo(x + 2, y + 16); g.lineTo(x + w - 2, y + 16); g.lineTo(x + w, y + h - 6); g.lineTo(x, y + h - 6); g.closePath(); g.fill();
    g.fillStyle = LGr(g, 0, y, 0, y + 16, [[0, '#f6f8fb'], [1, '#c9ced8']]); g.beginPath(); g.moveTo(x + 12, y + 1); g.lineTo(x + w - 12, y + 1); g.lineTo(x + w - 6, y + 16); g.lineTo(x + 6, y + 16); g.closePath(); g.fill();
    g.fillStyle = LGr(g, x, y, x + w, y + 14, [[0, '#101a30'], [0.35, '#2c4470'], [0.42, '#9ab4e0'], [0.5, '#2c4470'], [1, '#0e1628']]);
    g.beginPath(); g.moveTo(x + 15, y + 3); g.lineTo(x + w - 15, y + 3); g.lineTo(x + w - 10, y + 14); g.lineTo(x + 10, y + 14); g.closePath(); g.fill();
    Rk(g, 'rgba(255,255,255,0.20)', x + 22, y + 5, 30, 1.2);            // odsjaj na zadnjem staklu
    Rk(g, 'rgba(255,255,255,0.55)', x + 12, y + 1, w - 24, 0.6);        // linija krova
    Rk(g, 'rgba(255,255,255,0.9)', x + 4, y + 17, w - 8, 0.5); Rk(g, 'rgba(120,130,150,0.6)', x + 4, y + 25, w - 8, 0.5);
    g.fillStyle = LGr(g, 0, y + 27, 0, y + 32, [[0, '#3a6ad0'], [1, '#163c8a']]); g.fillRect(x + 0.5, y + 27, w - 1, 5);
    [x + 3, x + w - 18].forEach((lx) => {
      g.fillStyle = LGr(g, 0, y + 34, 0, y + 42, [[0, '#ff7070'], [0.5, '#e01a2a'], [1, '#8a0010']]); g.fillRect(lx, y + 34, 15, 8); Rk(g, 'rgba(255,220,220,0.8)', lx + 2, y + 35, 4, 1.5);
      Rk(g, '#ffa020', lx + (lx < x + 40 ? 15.5 : -5.5), y + 36, 5, 5);
    });
    Rk(g, '#f6f6f6', x + w / 2 - 15, y + 36, 30, 8); Rk(g, '#1f4fa0', x + w / 2 - 15, y + 36, 3, 8);
    g.fillStyle = LGr(g, 0, y + h - 7, 0, y + h - 3, [[0, '#f4f6fa'], [0.5, '#8a8e9a'], [1, '#3a3c44']]); g.fillRect(x - 1, y + h - 7, w + 2, 4);
    [x + 3, x + w - 20].forEach((tx) => { g.fillStyle = LGr(g, 0, y + h - 4, 0, y + h + 3, [[0, '#2a2a30'], [1, '#050507']]); g.fillRect(tx, y + h - 4, 17, 7); for (let k = 0; k < 5; k++) Rk(g, '#3a3a42', tx + 1 + k * 3.3, y + h - 3.5, 1.2, 6); });
    g.fillStyle = LGr(g, 0, y - 6, 0, y, [[0, '#3a3a46'], [1, '#15151c']]); g.fillRect(x + 20, y - 6, w - 40, 6);
  }, 2, 1);
}

// ---------- predmeti koje džip izbacuje (crtaju se direktno, okreću se) ----------
function crtajPredmet(g, tip, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  if (tip === 'kofer') {
    g.fillStyle = LGr(g, 0, -6, 0, 6, [[0, '#a0682c'], [1, '#5a3512']]); g.fillRect(-8, -5.5, 16, 11);
    Rk(g, '#3a200a', -3, -7.5, 6, 2); Rk(g, '#d8b060', -8, -0.5, 16, 1); Rk(g, '#3a200a', -5, -5.5, 1, 11); Rk(g, '#3a200a', 4, -5.5, 1, 11);
  } else if (tip === 'kesa_novca') {
    g.fillStyle = LGr(g, -7, 0, 7, 0, [[0, '#c8b48a'], [1, '#8a7650']]); g.beginPath(); g.ellipse(0, 1, 7, 6, 0, 0, TAU); g.fill();
    Rk(g, '#6a5a3a', -2.5, -6.5, 5, 2.5); g.fillStyle = '#2a6a2a'; g.font = 'bold 7px VT'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 1.5); g.textAlign = 'left';
  } else if (tip === 'fascikla') {
    Rk(g, '#c8a030', -8, -5.5, 16, 11); Rk(g, '#f0d050', -8, -4.5, 16, 10); Rk(g, '#f6f2e6', -6, -6.5, 11, 1.5);
    g.fillStyle = '#c42a2a'; g.font = '3.6px VT'; g.textBaseline = 'middle'; g.fillText('POVERLJIVO', -7, 0.5);
  } else if (tip === 'novcanica') {
    Rk(g, '#7fd36a', -3, -1.5, 6, 3); Rk(g, '#4f9a3e', -1, -1, 2, 2);
  }
  g.restore();
}


// ---------- objekti preko puta i uz put (deonice 1, 2, 4) ----------
// nadvožnjak: betonska ploča preko celog puta na ~5,5 m, stubovi iza bankina
function nadvoznjak() {
  return sprajt('nadvoznjak', [-300, -168, 300, 2], (g) => {
    for (const sx of [-1, 1]) for (const x of [180, 262]) {
      g.fillStyle = LGr(g, sx * x - 10, 0, sx * x + 10, 0, [[0, '#8a8a92'], [0.5, '#b4b4bc'], [1, '#5a5a62']]);
      g.fillRect(sx * x - 10, -122, 20, 122);
    }
    g.fillStyle = LGr(g, 0, -152, 0, -120, [[0, '#c8c8cc'], [0.6, '#9a9aa2'], [1, '#5c5c66']]); g.fillRect(-300, -152, 600, 32);
    Rk(g, '#46464e', -300, -124, 600, 4);                  // senka ispod ploče
    Rk(g, '#d8d8dc', -300, -152, 600, 2);
    for (let x = -296; x <= 296; x += 12) Rk(g, '#7a7a84', x, -166, 2, 14);   // ograda
    Rk(g, '#9a9aa4', -300, -166, 600, 2.5);
    g.fillStyle = '#3a6ab8'; g.fillRect(-60, -146, 120, 18); g.fillStyle = '#fff'; g.font = '12px VT'; g.textBaseline = 'top';
    g.fillText('SUBOTICA  HORGOŠ ↑', -56, -143);
  });
}

// naplatna stanica: nadstrešnica preko puta, kućice i podignute rampe van traka (prolazi se bez zaustavljanja)
function naplatnaRampa() {
  return sprajt('naplatna', [-320, -150, 320, 2], (g) => {
    for (const sx of [-1, 1]) {
      for (const x of [170, 250, 310]) { Rk(g, '#6a6a74', sx * x - 4, -118, 8, 118); }
      // kućica naplate
      g.fillStyle = LGr(g, 0, -60, 0, 0, [[0, '#e8e8ec'], [1, '#a8a8b0']]); g.fillRect(sx * 200 - 22, -58, 44, 58);
      g.fillStyle = LGr(g, sx * 200 - 18, 0, sx * 200 + 18, 0, [[0, '#2a3a5a'], [0.5, '#8aa4d0'], [1, '#2a3a5a']]); g.fillRect(sx * 200 - 18, -50, 36, 22);
      g.fillStyle = '#ffcf6a'; g.fillRect(sx * 200 - 18, -24, 36, 3);
      // podignuta rampa
      g.save(); g.translate(sx * 172, -26); g.rotate(sx * -1.2);
      for (let k = 0; k < 6; k++) Rk(g, k % 2 ? '#f2f2f2' : '#d22a2a', sx > 0 ? k * 10 : -(k + 1) * 10, -2, 10, 4);
      g.restore();
    }
    g.fillStyle = LGr(g, 0, -150, 0, -118, [[0, '#2a5aa8'], [1, '#163a78']]); g.fillRect(-320, -150, 640, 32);
    Rk(g, '#f2f2f2', -320, -122, 640, 4);
    for (let x = -300; x <= 300; x += 60) Rk(g, '#fff6c8', x, -118, 30, 3);  // svetla ispod nadstrešnice
    g.fillStyle = '#fff'; g.font = '20px VT'; g.textBaseline = 'top'; g.textAlign = 'center';
    g.fillText('NAPLATNA STANICA', 0, -145); g.textAlign = 'left';
  });
}

// granični prelaz Horgoš: velika nadstrešnica, kućice, reflektori (uvek noć, pa bez tona - svetla sama svetle)
function granicniPrelaz() {
  return sprajt('granica', [-340, -190, 340, 2], (g) => {
    for (const sx of [-1, 1]) {
      for (const x of [175, 260, 330]) Rk(g, '#2a2a34', sx * x - 5, -150, 10, 150);
      g.fillStyle = LGr(g, 0, -64, 0, 0, [[0, '#3a3a48'], [1, '#1a1a24']]); g.fillRect(sx * 215 - 26, -62, 52, 62);
      g.fillStyle = '#ffd890'; g.fillRect(sx * 215 - 20, -54, 40, 20);
      Rk(g, '#c42a2a', sx * 172, -30, sx * 50, 4);   // spuštena rampa iza traka
    }
    g.fillStyle = LGr(g, 0, -190, 0, -150, [[0, '#1c2a48'], [1, '#0e1628']]); g.fillRect(-340, -190, 680, 40);
    for (let x = -320; x <= 320; x += 40) {
      const rg = g.createRadialGradient(x, -146, 0, x, -146, 26); rg.addColorStop(0, 'rgba(255,246,210,0.55)'); rg.addColorStop(1, 'rgba(255,246,210,0)');
      g.fillStyle = rg; g.fillRect(x - 26, -172, 52, 52); Rk(g, '#fffbe6', x - 8, -150, 16, 3);
    }
    g.fillStyle = '#fff6d0'; g.font = '30px VT'; g.textBaseline = 'top'; g.textAlign = 'center';
    g.fillText('GRANIČNI PRELAZ HORGOŠ', 0, -186); g.textAlign = 'left';
  }, 4, 4, [1, 1], true);
}

// ograda mosta preko kanala (DTD), jedan stub sa delom ograde
function ogradaMosta() {
  return sprajt('ograda', [-14, -30, 14, 1], (g) => {
    Rk(g, '#9aa0a8', -1.5, -26, 3, 26); Rk(g, '#c8ccd2', -14, -26, 28, 2.5); Rk(g, '#7a8088', -14, -14, 28, 2);
    Rk(g, '#5a6068', -14, -2, 28, 3);
  });
}
