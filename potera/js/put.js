// UnderGRAND Potera do Horgoša - put (pseudo 3D po segmentima, "Lou's pseudo 3d").
// Segment = SEG jedinica, ima krivinu i visinu. Tlo (njive sa brazdama, bankina, ivičnjak, asfalt, linije) crta se
// red po red u ImageData (Uint32Array.fill po rasponima), a sprajtovi pored puta preko toga, od horizonta ka kameri.
'use strict';

// Boje njiva sa makete (FIELD u dizajn/scena.js): osnova po trakama + boja brazdi preko osnove
const FIELD = {
  suncokret: { base: [[201, 156, 34], [184, 138, 28]], rows: ['rgba(96,68,8,0.5)', 'rgba(255,216,96,0.42)'], gap: 0.42, rw: 1 / 52 },
  zito: { base: [[222, 184, 86], [208, 168, 70]], rows: ['rgba(250,232,170,0.4)', 'rgba(150,110,40,0.34)'], gap: 0.22, rw: 1 / 80 },
  kukuruz: { base: [[104, 138, 44], [92, 124, 38]], rows: ['rgba(32,58,14,0.62)', 'rgba(184,204,92,0.45)'], gap: 0.38, rw: 1 / 42 },
  uzorano: { base: [[112, 70, 38], [100, 62, 32]], rows: ['rgba(52,28,12,0.78)', 'rgba(170,118,76,0.5)'], gap: 0.18, rw: 1 / 36 },
  kanal: { base: [[52, 96, 112], [46, 86, 102]], rows: ['rgba(170,210,225,0.35)', 'rgba(20,40,60,0.35)'], gap: 0.55, rw: 1 / 140 },   // voda kanala ispod mosta
};
const VRSTE_NJIVA = Object.keys(FIELD);

// Tema deonice: boje tla. Deonica 3 = tačno maketa; ostale su izvedene iz neba (noć tamna sa plavim tonom, zora malo prigušena).
function napraviTemu(dn) {
  const noc = dn.doba === 'noć', zora = dn.doba === 'zora';
  const nebo = dn.nebo.map(hexRgb);
  const t = {
    magla: dn.id === 3 ? [214, 140, 80] : mix(nebo[nebo.length - 1], nebo[nebo.length - 2], 0.3),
    bankina: [[87, 138, 51], [74, 122, 44]],
    ivica: [[239, 239, 239], [196, 42, 42]],
    ivSenka: [[46, 24, 24], [38, 20, 20]],
    asfalt: [[96, 95, 114], [86, 85, 104]],
    asfaltMagla: [150, 110, 120],
    linija: [232, 232, 232], ivLinija: [242, 242, 242],
    mnozi: 1,
  };
  if (noc) { t.mnozi = 0.32; t.asfaltMagla = mix(nebo[nebo.length - 1], [40, 40, 60], 0.5); }
  if (zora) { t.mnozi = 0.78; t.asfaltMagla = mix(nebo[nebo.length - 2], [150, 120, 140], 0.5); }
  // boje njiva (osnova i brazde) unapred, za obe trake
  t.njive = {};
  for (const k of VRSTE_NJIVA) {
    const F = FIELD[k];
    const m = (c) => (t.mnozi === 1 ? c : mix(c.map((v) => v * t.mnozi), [20, 22, 50], noc ? 0.25 : 0));
    t.njive[k] = { base: [m(F.base[0]), m(F.base[1])], red: [m(preko(F.base[0], F.rows[0])), m(preko(F.base[1], F.rows[1]))], gap: F.gap, rw: F.rw };
  }
  const m2 = (c) => (t.mnozi === 1 ? c : c.map((v) => v * (0.25 + t.mnozi * 0.75)));
  t.bankina = t.bankina.map(m2); t.ivica = t.ivica.map(m2); t.ivSenka = t.ivSenka.map(m2); t.asfalt = t.asfalt.map(m2);
  if (noc) { t.linija = [200, 200, 190]; t.ivLinija = [210, 210, 200]; }
  t.dalekoPolje = mix(t.njive[dn.njive[0]].base[0], t.magla, 0.62);
  return t;
}

// ---------- gradnja puta ----------
const RAZVUCI = 4;          // dužine krivina iz deonice ×4 (krivina traje 3-5 s pri punoj brzini)
const DUZ_DEONICE = 5000;   // segmenata do kraja deonice (~5,5 km vožnje; km "DO HORGOŠA" idu od kmOd do kmDo)

function napraviPut(dn) {
  const r = rng(dn.id * 7919 + 3);
  const segs = [];
  const dodaj = (duz, kriv, brdo) => {
    const n = Math.max(3, Math.round(duz));
    const ul = Math.round(n * 0.25), iz = Math.round(n * 0.25);
    const y0 = segs.length ? segs[segs.length - 1].y2 : 0, y1 = y0 + brdo * 600;   // blagi usponi (Bačka): do ~3 m
    for (let i = 0; i < n; i++) {
      const k = i < ul ? easeIO(0, kriv, i / ul) : i >= n - iz ? easeIO(kriv, 0, (i - (n - iz)) / iz) : kriv;
      const ya = easeIO(y0, y1, i / n), yb = easeIO(y0, y1, (i + 1) / n);
      segs.push({ i: segs.length, kriv: k, y1: ya, y2: yb, spr: [], pl: null, pd: null });
    }
  };
  dodaj(60, 0, 0);
  let prolaz = 0;
  while (segs.length < DUZ_DEONICE + DRAW + 900) {
    for (const [d, k, b] of dn.krivine) {
      const zn = prolaz % 2 ? -1 : 1;
      dodaj(d * RAZVUCI * (0.85 + r() * 0.3), k * zn * (0.85 + r() * 0.3), b * (prolaz % 2 ? -1 : 1));
    }
    prolaz++;
  }
  // njive: svaka strana posebno, smenjuju se na 45-140 m
  for (const strana of ['pl', 'pd']) {
    let i = 0, j = Math.floor(r() * dn.njive.length);
    while (i < segs.length) {
      const n = 40 + Math.floor(r() * 90), tip = dn.njive[j++ % dn.njive.length];
      for (let k = 0; k < n && i < segs.length; k++, i++) segs[i][strana] = tip;
    }
  }
  const put = { dn, segs, tema: napraviTemu(dn), traktori: [] };
  postaviObjekte(put, r);
  return put;
}

const kmUSeg = (put, km) => Math.round(((put.dn.kmOd - km) / (put.dn.kmOd - put.dn.kmDo)) * DUZ_DEONICE);
const segUKm = (put, s) => put.dn.kmOd - (clamp(s, 0, DUZ_DEONICE) / DUZ_DEONICE) * (put.dn.kmOd - put.dn.kmDo);

function postaviObjekte(put, r) {
  const { dn, segs } = put;
  const noc = !!dn.svetla;
  const ima = (k) => dn.pored.includes(k);
  const N = segs.length;
  const stavi = (i, o) => { if (i >= 0 && i < N) segs[i].spr.push(o); };
  // stvarni razmaci (segment = 1,1 m): bandere na ~35 m, desno kao na maketi
  if (ima('bandera')) for (let i = 30; i < N; i += 32) stavi(i, { sp: bandera(true, noc), x: 1.75 });
  // topole u grupama
  if (ima('topola')) for (let i = 60 + Math.floor(r() * 60); i < N; i += 120 + Math.floor(r() * 140)) {
    const st = r() < 0.5 ? -1 : 1, n = 4 + Math.floor(r() * 5);
    for (let k = 0; k < n; k++) stavi(i + k * 6, { sp: topola(k % 3), x: st * (2.25 + (k % 2) * 0.4 + r() * 0.1) });
  }
  // putokazi iz podataka (levo, kao na maketi)
  if (ima('putokaz')) for (const p of dn.putokazi || []) stavi(kmUSeg(put, p.km), { sp: putokaz(p.tekst), x: -1.9 });
  // bilbordi sa satiričnim natpisima (redom iz replike.js, promešano semenom)
  if (ima('bilbord')) {
    const nat = [...window.UG_REPLIKE.bilbordi].sort(() => r() - 0.5);
    let k = 0;
    for (let i = 150; i < N; i += 230 + Math.floor(r() * 170)) stavi(i, { sp: bilbord(nat[k++ % nat.length]), x: k % 2 ? 2.5 : -2.6 });
    // putokaz sa km do Horgoša između onih iz podataka
    if (ima('putokaz')) for (let i = 400; i < DUZ_DEONICE; i += 650) { const km = Math.round(segUKm(put, i)); stavi(i, { sp: putokaz([`HORGOŠ    ${km}`, `SUBOTICA  ${Math.max(1, km - 10)}`]), x: -1.9 }); }
  }
  // nadvožnjaci i naplatna stanica (deonica 1), most preko kanala (deonica 2), red kamiona i granica (deonica 4)
  if (ima('nadvoznjak')) for (let i = 700 + Math.floor(r() * 200); i < N - 400; i += 1100 + Math.floor(r() * 500)) stavi(i, { sp: nadvoznjak(), x: 0 });
  if (ima('naplatna_rampa')) stavi(330, { sp: naplatnaRampa(), x: 0 });
  if (ima('most_kanal')) for (let i = 800 + Math.floor(r() * 200); i < N - 300; i += 1500 + Math.floor(r() * 600)) {
    for (let k = i; k < i + 55 && k < N; k++) { segs[k].pl = 'kanal'; segs[k].pd = 'kanal'; segs[k].spr = segs[k].spr.filter((o) => Math.abs(o.x) < 1.2); }
    for (let k = i; k < i + 55; k += 3) { stavi(k, { sp: ogradaMosta(), x: -1.3 }); stavi(k, { sp: ogradaMosta(), x: 1.3 }); }
  }
  put.parkirani = [];
  if (ima('red_kamiona')) for (let i = kmUSeg(put, 4); i < DUZ_DEONICE - 25; i += 11 + Math.floor(r() * 4)) put.parkirani.push(i);
  if (ima('granicni_prelaz')) { for (let k = DUZ_DEONICE - 10; k < DUZ_DEONICE + 10; k++) segs[k].spr = []; stavi(DUZ_DEONICE, { sp: granicniPrelaz(), x: 0 }); }
  if (ima('salas_blizu')) for (let i = 260; i < N; i += 350 + Math.floor(r() * 300)) stavi(i, { sp: salasBlizu(noc), x: (r() < 0.5 ? -1 : 1) * (4.2 + r() * 1.2) });
  // traktor na uzoranoj njivi, sa prašinom iza pluga
  if (dn.traktor) for (let i = 200 + Math.floor(r() * 100); i < N - 100; i += 300 + Math.floor(r() * 300)) {
    const levo = r() < 0.5, strana = levo ? 'pl' : 'pd';
    for (let k = i - 90; k < i + 90; k++) if (segs[k]) segs[k][strana] = 'uzorano';
    const o = { sp: traktorNjiva(levo), x: (levo ? -1 : 1) * (2.6 + r() * 0.8), traktor: true, levo };
    stavi(i, o); put.traktori.push(o);
  }
}

// ---------- crtanje tla ----------
const TLO = (() => {
  const cv = document.createElement('canvas'); cv.width = BW; cv.height = BH;
  const g = cv.getContext('2d');
  const img = g.createImageData(BW, BH);
  return { cv, g, img, P: new Uint32Array(img.data.buffer) };
})();
const RED = { seg: new Int32Array(BH), cx: new Float32Array(BH), hw: new Float32Array(BH), d: new Float32Array(BH), mut: new Uint8Array(BH) };
const VIDLJIVI = [];   // segmenti od kamere ka horizontu, sa projekcijom (za sprajtove)

// kam = { z, x, y } (z i y apsolutno, x u jedinicama puta)
function projektujPut(put, kam) {
  const segs = put.segs;
  RED.seg.fill(-1);
  VIDLJIVI.length = 0;
  const base = Math.floor(kam.z / SEG);
  const bp = (kam.z % SEG) / SEG;
  let x = 0, dx = -(segs[base] ? segs[base].kriv * KRIV * bp : 0);
  let maxy = H;
  for (let n = 0; n < DRAW; n++) {
    const sg = segs[base + n];
    if (!sg) break;
    const z1 = sg.i * SEG - kam.z, z2 = z1 + SEG;
    const X1w = x, X2w = x + dx;
    x += dx; dx += sg.kriv * KRIV;
    sg.clip = maxy;
    if (z2 <= 12) { sg.vid = false; continue; }
    const zz1 = Math.max(z1, 12);
    const s1 = PF / zz1, s2 = PF / z2;
    const Y1 = HZ + (kam.y - sg.y1) * s1, Y2 = HZ + (kam.y - sg.y2) * s2;
    const C1 = 160 + (X1w - kam.x) * s1, C2 = 160 + (X2w - kam.x) * s2;
    sg.P = { x1: C1, y1: Y1, s1, x2: C2, y2: Y2, s2, z1: zz1 };
    sg.vid = true;
    VIDLJIVI.push(sg);
    if (Y2 >= maxy || Y1 <= Y2) continue;
    const W1 = ROAD_W * s1, W2 = ROAD_W * s2, D1 = CAM_H * s1, D2 = CAM_H * s2;
    const bot = Math.min(Y1, maxy);
    const r0 = Math.max(0, Math.ceil(Y2 * 2)), r1 = Math.min(BH, Math.ceil(bot * 2));
    const mut = (Y1 - Y2) * 2 < 1.6 ? 1 : 0;   // segment niži od reda: trake bi treperile, crta se prosek
    for (let rr = r0; rr < r1; rr++) {
      const t = (Y1 - (rr + 0.5) / 2) / (Y1 - Y2);
      RED.seg[rr] = sg.i; RED.cx[rr] = C1 + (C2 - C1) * t; RED.hw[rr] = W1 + (W2 - W1) * t; RED.d[rr] = D1 + (D2 - D1) * t; RED.mut[rr] = mut;
    }
    maxy = Y2;
  }
}
const KRIV = 0.045; // krivina (−1..1) → pomak u jedinicama po segmentu (mali, jer je segment 1,1 m i kamera ima uzak ugao)

// zrno asfalta: posvetli/tamni već pakovanu boju (u32 RGBA) bez pravljenja novog niza
function mnozi32(c, k) {
  const r = c & 255, g2 = (c >>> 8) & 255, b2 = (c >>> 16) & 255;
  const f = (v) => { const x = (v * k) | 0; return x > 255 ? 255 : x; };
  return ((255 << 24) | (f(b2) << 16) | (f(g2) << 8) | f(r)) >>> 0;
}

function crtajTlo(put) {
  const { P } = TLO, t = put.tema, segs = put.segs;
  const fill = (row, x0, x1, col) => {
    let a = Math.round(x0 * 2), b = Math.round(x1 * 2);
    if (a < 0) a = 0; if (b > BW) b = BW;
    if (b > a) P.fill(col, row + a, row + b);
  };
  const daleko = u32(t.dalekoPolje), daleko2 = u32(mix(t.dalekoPolje, t.magla, 0.4));
  const mg = t.magla;
  let preSi = -1;
  for (let rr = 0; rr < BH; rr++) {
    const row = rr * BW, si = RED.seg[rr];
    if (si < 0) {
      // iznad horizonta ostaje nebo (0 = providno); ispod je daleko polje, prošarano ka izmaglici
      if (rr < HZ * 2) { P.fill(0, row, row + BW); continue; }
      P.fill((rr & 1) ? daleko2 : daleko, row, row + BW); continue;
    }
    const sg = segs[si], band = RED.mut[rr] ? 2 : si & 1, par = (si + rr) & 1;
    const B = (a) => (band === 2 ? mix(a[0], a[1], 0.5) : a[band]);
    const BF = (a) => (band === 2 ? mix(a[0], a[1], 0.5) : a[par]);   // njive i bankina: zrno po redu
    const cx = RED.cx[rr], hw = RED.hw[rr], d = RED.d[rr];
    const hz = Math.max(0, 1 - d / 30), hm = hz * 0.6;
    const zr = hash(si * 8191 + rr * 127 + 13);       // zrno asfalta (0..1)
    const blizu = hz < 0.55 && hw > 3;                // tekstura se vidi samo u blizini
    // njive levo i desno
    for (let side = 0; side < 2; side++) {
      const nj = t.njive[side ? sg.pd : sg.pl];
      const x0 = side ? cx + hw * 1.45 : 0, x1 = side ? 320 : cx - hw * 1.45;
      if (x1 <= x0) continue;
      fill(row, x0, x1, u32(mix(BF(nj.base), mg, hm)));
      if (d > 2) {
        const cr = u32(mix(par ? nj.red[0] : nj.red[1], mg, hm)), fw = Math.max(0.5, d * nj.rw), sg2 = side ? 1 : -1;
        for (let k = 1; k <= 22; k++) {
          const xx = cx + sg2 * (hw * 1.5 + k * hw * nj.gap);
          if (xx < -2 || xx > 322) break;
          fill(row, xx, xx + fw, cr);
        }
      }
    }
    // bankina: prošarana trava (po redu), ivičnjak uži i sa tamnim obrisom
    fill(row, cx - hw * 1.45, cx + hw * 1.45, u32(mix(BF(t.bankina), mg, hm * 0.8)));
    fill(row, cx - hw * 1.1, cx + hw * 1.1, u32(mix(B(t.ivica), mg, hm * 0.6)));
    if (hw > 8) {
      const isen = u32(mix(t.ivSenka, mg, hm * 0.6));
      fill(row, cx - hw * 1.1, cx - hw * 1.07, isen); fill(row, cx + hw * 1.07, cx + hw * 1.1, isen);
    }
    // asfalt: zrno, crne zakrpe na spoju segmenata, tragovi guma i zaprljana ivica
    const asf0 = u32(mix(B(t.asfalt), t.asfaltMagla, hz * 0.5));
    const sav = si !== preSi && hash(si * 37 + 7) < 0.07;
    const asf = mnozi32(asf0, sav ? 0.72 : blizu ? 0.93 + zr * 0.15 : 1);
    fill(row, cx - hw, cx + hw, asf);
    if (blizu && hw > 26) {
      const trk = mnozi32(asf, 0.9), tw = hw * 0.05;
      for (const s2 of [-1, 1]) for (const o of [0.19, 0.48]) fill(row, cx + s2 * o * hw - tw, cx + s2 * o * hw + tw, trk);
      const grm = mnozi32(asf, 0.84);
      fill(row, cx - hw, cx - hw * 0.94, grm); fill(row, cx + hw * 0.94, cx + hw, grm);
    }
    if (band === 1) { const lw = Math.max(0.5, hw * 0.014), lc = u32(mix(t.linija, mg, hm)); fill(row, cx - hw / 3 - lw / 2, cx - hw / 3 + lw / 2, lc); fill(row, cx + hw / 3 - lw / 2, cx + hw / 3 + lw / 2, lc); }
    const ew = Math.max(0.5, hw * 0.021), ec = u32(mix(t.ivLinija, mg, hm));
    fill(row, cx - hw + ew, cx - hw + 2 * ew, ec); fill(row, cx + hw - 2 * ew, cx + hw - ew, ec);
    preSi = si;
  }
  TLO.g.putImageData(TLO.img, 0, 0);
}

// Tačka na putu: segment sg (sa projekcijom), deo f (0..1) po dubini, bočno x (širine puta). → {x, y, s} logički
function tacka(sg, f, bx) {
  const P = sg.P;
  const sc = P.s1 + (P.s2 - P.s1) * f;
  const cx = P.x1 + (P.x2 - P.x1) * f;
  return { x: cx + bx * ROAD_W * sc, y: P.y1 + (P.y2 - P.y1) * f, s: SU * sc, sc };
}
