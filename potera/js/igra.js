// UnderGRAND Potera do Horgoša - igra: stanje, vožnja, saobraćaj, džip i potera, crtanje sveta, HUD, CRT prolaz, petlja.
// Fiksni korak logike 60 Hz + interpolacija crtanja (isto na 60 i 144 Hz).
'use strict';

const DEONICE = window.UG_DEONICE, BEGUNCI = window.UG_BEGUNCI, REPLIKE = window.UG_REPLIKE, PREDMETI = window.UG_PREDMETI;
const DISP = REPLIKE.dispecerka;
const DZIP_START = 75000;   // džip kreće ~415 m ispred (u igri piše "2 km"; km na tabli su skraćeni)
const POL_SC = 0.366 * SU * PF / PLAYER_DZ;   // crtež policijskog auta sa makete (96 jedinica) → 1,62 m na njegovoj daljini

// ---------- canvasi ----------
const ekran = document.getElementById('ekran');
const O = ekran.getContext('2d');
const buf = document.createElement('canvas'); buf.width = BW; buf.height = BH;
const g = buf.getContext('2d');
const blm = document.createElement('canvas'); blm.width = 160; blm.height = 112;
const bg = blm.getContext('2d');
const crtSloj = (() => {
  const c = document.createElement('canvas'); c.width = OW; c.height = OH;
  const x = c.getContext('2d');
  // skenlinije: svaki drugi red
  x.fillStyle = 'rgba(0,0,0,0.13)'; for (let y = 0; y < OH; y += 2) x.fillRect(0, y + 1, OW, 1);
  // blagi RGB razliv na ivicama: levo crvenkasto, desno plavicasto (kao na starom monitoru)
  const rgb = x.createLinearGradient(0, 0, OW, 0);
  rgb.addColorStop(0, 'rgba(255,48,48,0.14)'); rgb.addColorStop(0.1, 'rgba(255,48,48,0)');
  rgb.addColorStop(0.9, 'rgba(48,90,255,0)'); rgb.addColorStop(1, 'rgba(48,90,255,0.14)');
  x.fillStyle = rgb; x.fillRect(0, 0, OW, OH);
  // odsjaj stakla (gore levo)
  const staklo = x.createRadialGradient(OW * 0.2, OH * 0.04, 0, OW * 0.2, OH * 0.04, OW * 0.5);
  staklo.addColorStop(0, 'rgba(255,255,255,0.05)'); staklo.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = staklo; x.fillRect(0, 0, OW, OH);
  // vinjeta (blaža, da natpisi u uglovima ostanu čitljivi)
  const gr = x.createRadialGradient(OW / 2, OH / 2, 420, OW / 2, OH / 2, 880);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.75, 'rgba(0,0,0,0.30)'); gr.addColorStop(1, 'rgba(0,0,0,0.46)');
  x.fillStyle = gr; x.fillRect(0, 0, OW, OH);
  return c;
})();

// ---------- portreti 24×24 (dispečerka sa makete; begunci izmišljeni, po opisu iz begunci.js) ----------
const PORTRETI = {
  dragana: {
    px: ['........hhhhhhhh........', '......hhhhhhhhhhhh......', '.....hhhhhhhhhhhhhh.....', '....hhhhhhhhhhhhhhhh....', '....hhhsssssssssshhh....', '...khhssssssssssssshk...', '...kkhssweesssweesshkk..', '...kkhsswpesssswpesshkk.', '...kkhssssssssssssshkk..', '....khsssssnnssssssh....', '....hhssssssssssssshh...', '....hhsssslllllsssshhm..', '.....hhssssssssssshh.m..', '......hhsssssssssh...m..', '.......ssssssssss....m..', '......ccssssssscc..mmm..', '....ccccccsssscccccc....', '...ccccccccbbccccccccc..', '..cccccccccbbcccccccccc.', '..cccyycccccccccccyyccc.', '..ccccccccccccccccccccc.', '..ccccccccccccccccccccc.', '..ccccccccccccccccccccc.', '..ccccccccccccccccccccc.'],
    c: { h: '#3a1e14', s: '#f0b48a', k: '#22222c', w: '#ffffff', e: '#2a6a9a', p: '#111', n: '#d8946a', l: '#c0384a', m: '#22222c', c: '#1f3f7a', b: '#e9edf2', y: '#ffd34a' },
  },
  b3: { // Ministar Bezportfeljić: okrugao, rumen, mali brkovi, frizura kao kaciga, tamnoplavo odelo, značka bez simbola
    px: ['........................', '......hhhhhhhhhhhh......', '....hhhhhhhhhhhhhhhh....', '...hhhhhhhhhhhhhhhhhh...', '...hhhhhhhhhhhhhhhhhh...', '...hhsssssssssssssshh...', '..hssssssssssssssssssh..', '..ssssweessssweesssss...', '..srrssssssssssssrrsss..', '..sssssssssnnsssssssss..', '...sssssmmmmmmmmsssss...', '...sssssslllllssssss....', '....ssssssssssssssss....', '.....ssssssssssssss.....', '......ssssssssssss......', '........ssssssss........', '.....ccccbbbbbbbbcccc...', '..ccccccccbbttbbcccccccc', '.cccccccccbttbcccccccccc', '.cczccccccbttbcccccccccc', '.ccccccccccttccccccccccc', '.ccccccccccttccccccccccc', '.ccccccccccttccccccccccc', '.ccccccccccttccccccccccc'],
    c: { h: '#2a1a10', s: '#f2a682', r: '#e0625a', w: '#ffffff', e: '#222', m: '#3a2010', n: '#d87a5a', l: '#8a2a2a', c: '#1c2a5a', b: '#e9edf2', t: '#8a1a1a', z: '#ffd34a' },
  },
};

function crtajPortret(ctx, ime, bx, by, vel) {
  const P = PORTRETI[ime];
  ctx.fillStyle = '#1a1438'; ctx.fillRect(bx, by, vel, vel);
  const k = (vel - 8) / 24;
  if (!P) { ctx.fillStyle = '#3a3460'; ctx.beginPath(); ctx.arc(bx + vel / 2, by + vel * 0.4, vel * 0.2, 0, TAU); ctx.fill(); ctx.fillRect(bx + vel * 0.2, by + vel * 0.65, vel * 0.6, vel * 0.35); return; }
  P.px.forEach((r, yy) => { for (let xx = 0; xx < r.length; xx++) { const ch = r[xx]; if (P.c[ch]) { ctx.fillStyle = P.c[ch]; ctx.fillRect(bx + 4 + xx * k, by + 4 + yy * k, k + 0.3, k + 0.3); } } });
}

// ---------- stanje ----------
let S = null;
let DEONICA_START = 1;   // ?deonica=N u adresi: igra kreće od te deonice (za probe)
try { const q = +new URLSearchParams(location.search).get('deonica'); if (q >= 1 && q <= 4) DEONICA_START = q; } catch (e) { /* file:// bez parametara */ }

function novaDeonica(id, skor) {
  const dn = DEONICE.find((d) => d.id === id);
  const b = BEGUNCI.find((x) => x.deonica === id);
  TON = TONOVI[dn.doba] || null;   // noćni / jutarnji ton za sve sprajtove ove deonice
  const put = napraviPut(dn);
  const r = rng(id * 1013 + 7);
  S = {
    id, dn, b, put, nebo: napraviNebo(dn), r,
    faza: 'start', t: 0, tSve: 0, pauzaIz: null, meni: 0,
    pos: 0, ppos: 0, x: 0, px: 0, v: 0, menjac: 'LO', turbo: 3, turboT: 0, nagib: 0,
    vreme: dn.vreme, skor: skor || 0, steta: 0, sudari: 0, shake: 0, papiri: 0, vanPuta: 0,
    nebof: 0, nebon: 0, sirena: false, viden: false, maloVremena: false,
    dzip: { z: PLAYER_DZ + DZIP_START, pz: 0, x: 0, px: 0, cx: 0, v: 0, koci: 0, kociT: 3 + r() * 3, baci: 2.5, bacen: 0, cxT: 0, udarCD: 0, ek: null },
    saobracaj: [], predmeti: [], novc: [], cestice: [], iskacuci: [],
    poruka: null, zadnje: {}, bonus: null,
  };
  S.dzip.pz = S.dzip.z;
  S.dzip.v = brzinaDzipa();
  const n = Math.round(dn.saobracaj.gustina * 40 * T().saob);
  for (let k = 0; k < n; k++) { const a = novoVozilo(PLAYER_DZ + 6000 + r() * 170000); S.saobracaj.push(a); naSlobodno(a); }
  // red kamiona pred granicom (deonica 4): parkirani na desnoj bankini, ne pomeraju se
  for (const i of put.parkirani) {
    const vz = vozilo('kamion', '#000000', r);
    S.saobracaj.push({ tip: 'parkiran', sp: vz.sp, pw: vz.pw, duz: vz.duz, vz: 0, v: 0, x: 1.3, px: 1.3, cx: 1.3, z: i * SEG, pz: i * SEG, stoji: true });
  }
}

// Džip je sporiji od policijskog auta (290), da se stigne za ~15-25 s i kad se udari u poneko vozilo.
// Pojačano 12. 11. (korisnik: "malo je laka igra"): brži džip, manja "guma", izmicanje kad mu priđeš.
function brzinaDzipa() { return [0, 210, 216, 222, 230][S ? S.id : 3] + T().dzip; }

// ---------- težina (korisnik 13. 11. 2026: "laki, srednji i težak... ovaj što je sada je nešto blizu teškog") ----------
// dzip: km/h u odnosu na težak; guma: [razmak posle kog džip popušta, za koliko km/h]; izmakni: [najmanje, + slučajno] s
// između izmicanja (null = ne izmiče); bezi: [s, +km/h] posle udarca; baci: [s, + slučajno] između predmeta;
// saob: gustina saobraćaja; dodir: popustljivost udarca (širina puta); pad: policija posle udarca pada na deo brzine džipa;
// bankina: da li džip beži bankinom kad su trake pune.
const TEZINE = {
  lako: { naziv: 'LAKO', dzip: -26, guma: [32000, -30], izmakni: null, bezi: [0.5, 15], baci: [3.4, 2.4], saob: 0.7, dodir: 0.12, pad: 0.88, bankina: false },
  srednje: { naziv: 'SREDNJE', dzip: -12, guma: [50000, -20], izmakni: [2.4, 2.0], bezi: [1.0, 30], baci: [2.4, 2.0], saob: 0.85, dodir: 0.08, pad: 0.8, bankina: true },
  tesko: { naziv: 'TEŠKO', dzip: 0, guma: [70000, -14], izmakni: [1.1, 1.4], bezi: [1.4, 45], baci: [1.7, 1.8], saob: 1, dodir: 0.05, pad: 0.75, bankina: true },
};
const REDOSLED_TEZINA = ['lako', 'srednje', 'tesko'];
function tezina() { return (typeof IGRA !== 'undefined' && IGRA.demo) || !TEZINE[PODESAVANJA.tezina] ? 'srednje' : PODESAVANJA.tezina; }
const T = () => TEZINE[tezina()];

function novoVozilo(z) {
  const r = S.r, dn = S.dn;
  const tip = pick(dn.saobracaj.vozila, r), V = VOZILA[tip], boja = pick(BOJE_AUTA, r);
  const x = tip === 'traktor' ? 0.62 : pick([-0.62, 0, 0.62], r);
  const vz = vozilo(tip, boja, r), brz = V.v[0] + r() * (V.v[1] - V.v[0]);
  return { tip, sp: vz.sp, pw: vz.pw, duz: vz.duz, vz: brz, v: brz, x, px: x, cx: x, z, pz: z };
}

// ---------- vozila se ne preklapaju (korisnik 12. 11.: "džip prolazi kroz druga vozila") ----------
// Svako vozilo zauzima [z, z + duz] po dužini i x ± pw bočno. Saobraćaj, džip i policijski auto se međusobno ne preklapaju:
// ko naleti otpozadi, uspori i drži razmak (ili pređe u slobodnu traku), a bočno se ne ulazi u vozilo pored.
const RAZMAK = Math.round(1.2 * M);
const TRAKE = [-0.62, 0, 0.62];
const bocno = (x1, pw1, b) => Math.abs(x1 - b.x) < pw1 + b.pw + 0.02;
const uzduz = (z1, d1, b, rez) => b.z < z1 + d1 + rez && b.z + b.duz > z1 - rez;
function voziloPolicije() { return { z: S.pos + PLAYER_DZ, duz: DUZ_AUTA, x: S.x, pw: POL_PW, v: S.v, pol: true }; }
function voziloDzipa() { const d = S.dzip; return { z: d.z, duz: DZIP_DUZ, x: d.x, pw: DZIP_PW, v: d.v, dzip: true }; }
// najbliže vozilo ispred u istoj "traci" (bočno se preklapa) i razmak do njega
function vodja(z, duz, x, pw, ostali, sam) {
  let b = null, g = Infinity;
  for (const o of ostali) { if (o === sam || o.z <= z || !bocno(x, pw, o)) continue; const gg = o.z - (z + duz); if (gg < g) { g = gg; b = o; } }
  return { b, g };
}
// novo vozilo se pomera napred dok ne nađe slobodno mesto u svojoj traci
function naSlobodno(a) {
  for (let k = 0; k < 20; k++) {
    const c = S.saobracaj.find((o) => o !== a && bocno(a.x, a.pw, o) && uzduz(a.z, a.duz, o, RAZMAK * 2));
    if (!c) return;
    a.z = c.z + c.duz + RAZMAK * 3; a.pz = a.z;
  }
}
// brzina kojom se drži razmak iza vođe (km/h)
const brzinaIza = (vod, g) => Math.max(0, vod.v + (g - RAZMAK) / KMH * 1.2);

// ---------- poruke dispečerke ----------
const PAUZE_PORUKA = { udarac: 4, sudarSaobracaj: 5, njiva: 7, dzipNaVidiku: 999 };
function reci(kljuc, vars, opcije) {
  const o = opcije || {};
  if (!o.uvek && S.zadnje[kljuc] != null && S.tSve - S.zadnje[kljuc] < (PAUZE_PORUKA[kljuc] || 0)) return;
  S.zadnje[kljuc] = S.tSve;
  // "onaj sa koferima na krovu" važi samo za džip sa deonice 3
  const izbor = (DISP[kljuc] || []).filter((l) => S.id === 3 || !/koferima na krovu/i.test(l));
  let tekst = o.tekst || pick(izbor.length ? izbor : DISP[kljuc], Math.random);
  const v = Object.assign({ km: 2, vreme: Math.ceil(S.vreme), ime: S.b.ime }, vars || {});
  tekst = tekst.replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  S.poruka = { ko: o.ko || DISP.ime, tekst, t: o.t || 4.2, portret: o.portret || 'dragana' };
  if (!IGRA.demo && kljuc !== 'start') Zvuk.efekat('radio');
}
function porukaPocetak() { reci('brifing', null, { tekst: S.b.brifing, t: 9999, uvek: true }); }

// ---------- korak logike ----------
function korak() {
  Ulaz.anketa();
  if (Ulaz.pritisnut('crt')) { PODESAVANJA.crt = !PODESAVANJA.crt; sacuvajPodesavanja(); }
  if (Ulaz.pritisnut('fps')) { PODESAVANJA.fps = !PODESAVANJA.fps; sacuvajPodesavanja(); }
  if (Ulaz.pritisnut('muzika')) { PODESAVANJA.muzikaIskl = !PODESAVANJA.muzikaIskl; sacuvajPodesavanja(); }
  if (IGRA.demo) { // demo: Enter/razmak = prava igra, bilo šta drugo = naslovni ekran; traje 20 s
    if (Ulaz.pritisnut('ok') || Ulaz.pritisnut('turbo')) { novaIgra(); return; }
    if (Ulaz.ikakav()) { zavrsiDemo(); return; }
    IGRA.t += STEP;
    if (IGRA.t > 20 || (S.faza !== 'voznja' && S.t > 4)) { zavrsiDemo(); return; }
  }
  if (S.faza === 'pauza') { korakPauza(); return; }
  if (!IGRA.demo && Ulaz.pritisnut('pauza') && ['voznja', 'start'].includes(S.faza)) { S.pauzaIz = S.faza; S.faza = 'pauza'; S.meni = 0; Zvuk.efekat('klik'); return; }
  S.t += STEP; S.tSve += STEP;
  S.ppos = S.pos; S.px = S.x; S.dzip.pz = S.dzip.z; S.dzip.px = S.dzip.x;
  for (const a of S.saobracaj) { a.pz = a.z; a.px = a.x; }

  const f = S.faza;
  let kontrola = { gas: false, koc: false, lev: false, des: false };
  if (f === 'start') {
    if (S.t < 2.4 && Math.random() < 0.35) Zvuk.efekat('tik');   // teleprinter dok stiže brifing
    if (Ulaz.pritisnut('turbo') || Ulaz.pritisnut('ok')) { S.faza = 'voznja'; S.t = 0; reci('start', { km: 2 }, { uvek: true }); Zvuk.efekat('start'); Zvuk.efekat('rev'); }
  } else if (f === 'voznja') {
    if (IGRA.demo) {
      kontrola = demoVozac(S);
      if (S.menjac === 'LO' && S.v > 155) S.menjac = 'HI';
      if (kontrola.turbo && S.turbo > 0 && S.turboT <= 0) { S.turbo--; S.turboT = TURBO_T; Zvuk.efekat('turbo'); }
    } else {
      kontrola = { gas: Ulaz.drzi('gas'), koc: Ulaz.drzi('koc'), lev: Ulaz.drzi('lev'), des: Ulaz.drzi('des') };
      if (Ulaz.pritisnut('menjac')) { S.menjac = S.menjac === 'LO' ? 'HI' : 'LO'; Zvuk.efekat('menjac'); }
      if (Ulaz.pritisnut('turbo') && S.turbo > 0 && S.turboT <= 0) { S.turbo--; S.turboT = TURBO_T; Zvuk.efekat('turbo'); }
    }
    S.vreme -= STEP;
    if (S.vreme <= 15 && !S.maloVremena) { S.maloVremena = true; reci('malo_vremena', null, { uvek: true }); }
    if (S.vreme <= 0) { S.vreme = 0; pocniBeg(); }
    // deonica 4: ako stigneš do same granice, kasno je - džip je već prešao
    if (S.id === 4 && S.faza === 'voznja' && (S.pos + PLAYER_DZ) / SEG > DUZ_DEONICE - 40) { S.vreme = Math.max(S.vreme, 0); pocniBeg(); }
  } else if (f === 'zaustavljanje') kontrola = autopilotZaustavi();
  else if (f === 'hapsenje') korakHapsenje();
  else if (f === 'predjena') korakPredjena();
  else if (f === 'pobegao' || f === 'nastavak' || f === 'kraj') korakBeg();
  Ulaz.ocisti();
  if (IGRA.ekran !== 'deonica') return;   // igra je upravo završena (kraj na granici)

  if (f !== 'start') voznja(kontrola);
  if (f !== 'start') { saobracaj(); dzipKorak(); predmetiKorak(); }
  cesticeKorak();
  if (S.poruka && S.poruka.t < 9000) { S.poruka.t -= STEP; if (S.poruka.t <= 0) S.poruka = null; }
  S.shake = Math.max(0, S.shake - STEP);
  S.papiri = Math.max(0, S.papiri - STEP);
  for (const p of S.iskacuci) p.t += STEP;
  S.iskacuci = S.iskacuci.filter((p) => p.t < 1.4);
}

function segNa(z) { return S.put.segs[clamp(Math.floor(z / SEG), 0, S.put.segs.length - 1)]; }

function voznja(k) {
  S.kont = k;
  // bankina (trava uz put, 1,12-1,45) samo ograničava na 170 km/h; tek njiva usporava na ~90 i diže prašinu
  const offroad = Math.abs(S.x) > 1.45, bankina = !offroad && Math.abs(S.x) > 1.12;
  const vmax = S.turboT > 0 ? MAXV + TURBO_V : MAXV;
  let a;
  if (k.gas) {
    if (S.menjac === 'LO') a = S.v < 160 ? 95 : S.v < 172 ? 8 : -20;
    else a = S.v < 100 ? 26 : 62 * (1 - Math.pow(Math.max(0, S.v - 100) / 190, 1.6)) + 5;
    if (S.turboT > 0) a += 80;
  } else a = -22;
  if (k.koc) a = -190;
  if (offroad && S.v > 90) a = Math.min(a, -120);
  if (bankina && S.v > 170) a = Math.min(a, -90);
  S.v += a * STEP;
  if (S.v > vmax) S.v = Math.max(vmax, S.v - 45 * STEP);
  S.v = Math.max(0, S.v);
  if (S.turboT > 0) S.turboT -= STEP;

  const sp = S.v / MAXV;
  const volan = (k.lev ? -1 : 0) + (k.des ? 1 : 0);
  const sg = segNa(S.pos + PLAYER_DZ);
  S.x += volan * STEP * 2.2 * Math.min(1, 0.25 + sp) * Math.min(1, S.v / 40);
  S.x -= STEP * 1.9 * sp * sp * sg.kriv;
  S.x = clamp(S.x, -2.5, 2.5);
  S.nagib += (volan - S.nagib) * Math.min(1, STEP * 8);

  const pom = S.v * KMH * STEP;
  S.pos += pom;
  S.nebof += sg.kriv * (pom / SEG) * 0.55;
  S.nebon += sg.kriv * (pom / SEG) * 1.1;

  // van puta: prašina u boji njive
  if (offroad && S.v > 5) {
    S.vanPuta += STEP;
    if (S.vanPuta > 1 && S.faza === 'voznja') reci('njiva');
    const nj = FIELD[S.x < 0 ? sg.pl : sg.pd].base[0];
    for (let i = 0; i < 2; i++) S.cestice.push({ x: 160 + (Math.random() - 0.5) * 96 * POL_SC, y: 212 + Math.random() * 4, vx: (Math.random() - 0.5) * 60 - volan * 20, vy: -20 - Math.random() * 40, r: 3 + Math.random() * 3, rr: 14, z: 0, max: 0.7, col: nj, tip: 'prah' });
  } else S.vanPuta = 0;
  // turbo: plamen + iskre
  if (S.turboT > 0 && Math.random() < 0.6) S.cestice.push({ x: 160 + (AUTO.x + 14 - 160) * POL_SC + Math.random() * 4, y: 215, vx: (Math.random() - 0.5) * 20, vy: 30 + Math.random() * 30, r: 1, rr: 0.5, z: 0, max: 0.25, col: [255, 200, 80], tip: 'iskra' });
}

function saobracaj() {
  const A = S.saobracaj;
  const ostali = [...A, S.faza === 'start' ? null : voziloDzipa(), voziloPolicije()].filter(Boolean);
  for (const a of A) {
    const { b: vod, g } = vodja(a.z, a.duz, a.x, a.pw, ostali, a);
    // sporije vozilo ispred: pređi u slobodnu susednu traku (traktor ostaje desno), inače uspori
    if (!a.stoji && vod && g < 30 * M && vod.v < a.vz - 5 && Math.abs(a.x - a.cx) < 0.02 && a.tip !== 'traktor') {
      const trake = TRAKE.filter((l) => Math.abs(l - a.cx) > 0.1 && Math.abs(l - a.cx) < 0.7 &&
        !ostali.some((c) => c !== a && bocno(l, a.pw, c) && c.z < a.z + a.duz + 25 * M && c.z + c.duz > a.z - 15 * M));
      if (trake.length) a.cx = trake[Math.floor(S.r() * trake.length)];
    }
    let cilj = a.vz;
    if (vod && g < 40 * M) cilj = Math.min(cilj, brzinaIza(vod, g));
    a.v += clamp(cilj - a.v, -220 * STEP, 12 * STEP);
    // bočno: ne ulazi u vozilo pored; ako bi, odustaje od prelaska
    const nx = a.x + clamp(a.cx - a.x, -0.5 * STEP, 0.5 * STEP);
    if (nx !== a.x && ostali.some((c) => c !== a && uzduz(a.z, a.duz, c, RAZMAK * 0.5) && bocno(nx, a.pw, c) && !bocno(a.x, a.pw, c))) {
      a.cx = TRAKE.reduce((p, l) => (Math.abs(l - a.x) < Math.abs(p - a.x) ? l : p));
    } else a.x = nx;
    a.z += a.v * KMH * STEP;
    // tvrda granica: nikad u vozilo ispred
    if (vod && a.z + a.duz + 20 > vod.z) { a.z = vod.z - a.duz - 20; a.v = Math.min(a.v, vod.v); }
    if (a.stoji) { a.v = 0; continue; }
    if (a.z < S.pos - 400) { Object.assign(a, novoVozilo(S.pos + DRAW * SEG + 2000 + S.r() * 30000)); naSlobodno(a); }
  }
  sudariPolicije();
}

// policijski auto i saobraćaj: otpozadi = sudar (pad brzine, trešnja, bez štete); sa strane = odbijanje u stranu
function sudariPolicije() {
  const pz = S.pos + PLAYER_DZ;
  S.bokCD = Math.max(0, (S.bokCD || 0) - STEP);
  for (const a of S.saobracaj) {
    if (!bocno(S.x, POL_PW, a) || !uzduz(pz, DUZ_AUTA, a, 0)) continue;
    const dz = a.z - pz;
    if (dz > -80 && S.v > a.v) {
      S.v = a.v * 0.75;
      S.pos = a.z - DUZ_AUTA - PLAYER_DZ - 1; S.ppos = Math.min(S.ppos, S.pos);
      S.shake = 0.45; S.sudari++; Zvuk.efekat('sudar');
      S.x += S.x < a.x ? -0.05 : 0.05;
      iskre(160, 176, 8, [255, 230, 160]);
      if (S.faza === 'voznja') reci('sudarSaobracaj');
    } else {
      const sm = S.x < a.x ? -1 : 1;
      S.x = a.x + sm * (a.pw + POL_PW + 0.025);
      if (S.bokCD <= 0) { S.bokCD = 0.5; S.v *= 0.94; Zvuk.efekat('okrzni'); S.shake = Math.max(S.shake, 0.2); S.sudari++; iskre(160 - sm * 30, 190, 6, [255, 230, 160]); if (S.faza === 'voznja') reci('sudarSaobracaj'); }
    }
  }
}

function dzipKorak() {
  const d = S.dzip, pz = S.pos + PLAYER_DZ, gap = d.z - pz;
  if (S.faza === 'voznja') {
    let cilj = brzinaDzipa();
    if (gap > T().guma[0]) cilj += T().guma[1];
    else if (gap < 15000) cilj += 12;
    if (gap < -200) cilj = S.v + 40;  // ako ga pretekneš, juri da se vrati ispred
    d.kociT -= STEP;
    if (d.kociT <= 0) { if (gap > 1200 && gap < 9000) d.koci = 0.9; d.kociT = 4 + S.r() * 4; }
    if (d.koci > 0) { d.koci -= STEP; cilj -= 95; }
    if (d.bezi > 0) { d.bezi -= STEP; cilj += T().bezi[1]; d.koci = 0; }
    d.cilj = cilj;
    // bacanje predmeta kroz prozor
    if (gap > 1500 && gap < 20000) {
      d.baci -= STEP;
      if (d.baci <= 0) {
        const pr = S.b.predmeti, tip = pr[d.bacen++ % pr.length];
        S.predmeti.push({ tip, z: d.z - 40, x: d.x + (S.r() - 0.5) * 0.3, h: 260, vh: 500, v: d.v * 0.65, rot: 0, vr: (S.r() < 0.5 ? -1 : 1) * (5 + S.r() * 4) });
        d.baci = T().baci[0] + S.r() * T().baci[1];
      }
    }
    // džip na vidiku: strelica i sirena
    S.sirena = gap < 30000;
    if (S.sirena && !S.viden) { S.viden = true; reci('dzipNaVidiku', null, { uvek: true }); }
    // udarac
    d.udarCD -= STEP;
    // otpozadi (malo popustljivije od stvarnog preklapanja) ili sa strane dok ste rame uz rame
    if (d.udarCD <= 0 && Math.abs(d.x - S.x) < DZIP_PW + POL_PW + T().dodir) {
      if (gap > -80 && gap < DUZ_AUTA) udarac(false);
      else if (gap <= -80 && gap > -DUZ_AUTA * 1.6) udarac(true);
    }
  } else if (S.faza === 'zaustavljanje' || S.faza === 'hapsenje' || S.faza === 'predjena') {
    d.cx = 1.3; d.x += clamp(d.cx - d.x, -0.7 * STEP, 0.7 * STEP);
    d.v = Math.max(0, d.v - 120 * STEP); d.koci = d.v > 0 ? 1 : 0;
  } else if (S.faza === 'pobegao' || S.faza === 'nastavak' || S.faza === 'kraj') {
    d.cilj = 330; d.koci = 0;
  }
  if (S.faza === 'voznja' || S.faza === 'pobegao' || S.faza === 'nastavak' || S.faza === 'kraj') dzipUSaobracaju(d);
  else d.z += d.v * KMH * STEP;
  // dim iz haube kad je oštećen
  if (S.steta >= 5 && d.ek && Math.random() < (S.steta >= 8 ? 0.5 : 0.2)) S.cestice.push({ x: d.ek.x + (Math.random() - 0.5) * 30 * d.ek.s, y: d.ek.y - 37 * d.ek.s, vx: (Math.random() - 0.5) * 10, vy: -12 - Math.random() * 10, r: 3 * d.ek.s + 1, rr: 10 * d.ek.s + 3, z: 0, max: 1.4, col: S.steta >= 8 ? [40, 40, 44] : [120, 120, 130], tip: 'dim' });
}

// džip vijuga i obilazi saobraćaj, ali ne prolazi kroz vozila: drži razmak iza sporijeg, a u susednu traku
// prelazi samo kad je slobodna (bočno se ne uvlači u vozilo pored). Policijski auto mu je prepreka samo sa strane
// (otpozadi ga udara - to je udarac).
function dzipUSaobracaju(d) {
  const A = S.saobracaj;
  const slobodna = (l) => !A.some((a) => bocno(l, DZIP_PW, a) && a.z < d.z + DZIP_DUZ + 35 * M && a.z + a.duz > d.z - 10 * M);
  const { b: vod, g } = vodja(d.z, DZIP_DUZ, d.x, DZIP_PW, A, null);
  // izmicanje: kad je policija tik iza u istoj traci, džip pređe u slobodnu traku dalje od nje
  const iza = S.pos + PLAYER_DZ, gp = d.z - iza;
  d.izmakni = (d.izmakni == null ? 1.5 : d.izmakni) - STEP;
  if (S.faza === 'voznja' && T().izmakni && d.izmakni <= 0 && gp > DUZ_AUTA * 0.8 && gp < 28 * M && Math.abs(S.x - d.x) < 0.35) {
    const tr = TRAKE.filter((l) => Math.abs(l - S.x) > 0.4 && slobodna(l)).sort((a, b) => Math.abs(b - S.x) - Math.abs(a - S.x));
    if (tr.length) { d.cx = tr[0]; d.cxT = 1.0; }
    d.izmakni = T().izmakni[0] + S.r() * T().izmakni[1];
  }
  d.cxT -= STEP;
  const naBankini = Math.abs(d.cx) > 0.9;
  if (d.cxT <= 0 || (vod && g < 25 * M && vod.v < d.cilj - 10 && Math.abs(d.x - d.cx) < 0.05)) {
    d.cxT = 0.5;
    if (!slobodna(d.cx) || (naBankini && TRAKE.some(slobodna))) {
      // prvo slobodna traka na putu (najbliža), a ako su sve zauzete - bankina (begunac beži i njome)
      const tr = TRAKE.filter((l) => l !== d.cx && slobodna(l)).sort((a, b) => Math.abs(a - d.x) - Math.abs(b - d.x));
      const bank = BANKINE.filter((l) => l !== d.cx && slobodna(l)).sort((a, b) => Math.abs(a - d.x) - Math.abs(b - d.x));
      if (tr.length) d.cx = tr[0]; else if (T().bankina && bank.length && !naBankini) d.cx = bank[0];
    } else if (S.faza === 'voznja' && !naBankini && S.r() < 0.12) { const l = pick(TRAKE, S.r); if (slobodna(l)) d.cx = l; }
  }
  let cilj = d.cilj;
  if (Math.abs(d.x) > 1.0) cilj = Math.min(cilj, 175);   // bankinom sporije (kao i policija)
  if (vod && g < 50 * M) cilj = Math.min(cilj, brzinaIza(vod, g));
  d.v += clamp(cilj - d.v, -240 * STEP, 45 * STEP);
  // bočno (sa vijuganjem), ali ne u vozilo pored
  const nx = d.x + clamp(d.cx - d.x, -0.9 * STEP, 0.9 * STEP) + Math.sin(S.tSve * 2.3) * 0.08 * STEP * 2.3;
  const pored = [...A, voziloPolicije()].filter((c) => uzduz(d.z, DZIP_DUZ, c, RAZMAK * 0.5));
  if (!pored.some((c) => bocno(nx, DZIP_PW, c) && !bocno(d.x, DZIP_PW, c))) d.x = nx;
  else d.cx = [...TRAKE, ...BANKINE].reduce((p, l) => (Math.abs(l - d.x) < Math.abs(p - d.x) ? l : p));
  // ako se ipak preklapa sa nekim pored (gurnut udarcem), izgura se u stranu
  for (const c of pored) if (!c.pol && bocno(d.x, DZIP_PW, c) && c.z <= d.z) d.x = c.x + (d.x < c.x ? -1 : 1) * (c.pw + DZIP_PW + 0.03);
  d.z += d.v * KMH * STEP;
  // tvrda granica: nikad u vozilo ispred
  for (const a of A) if (bocno(d.x, DZIP_PW, a) && a.z > d.z - 50 && a.z < d.z + DZIP_DUZ + 20) { d.z = a.z - DZIP_DUZ - 20; d.v = Math.min(d.v, a.v); }
  d.x = clamp(d.x, -1.2, 1.2);
}
const BANKINE = [-1.16, 1.16];   // sredina džipa na bankini: ne dodiruje ni autobus u krajnjoj traci

function udarac(sastrane) {
  const d = S.dzip;
  const dmg = S.turboT > 0 ? 2 : 1;
  S.steta = Math.min(10, S.steta + dmg);
  d.udarCD = 0.8;
  if (sastrane) { // rame uz rame: odgurnu se u stranu, bez vraćanja unazad
    const sm = d.x >= S.x ? 1 : -1;
    d.x += sm * 0.12; S.x -= sm * 0.06; d.cx = clamp(d.x + sm * 0.3, -0.62, 0.62); S.v *= 0.95;
  } else {
    S.v = Math.min(S.v, d.v * T().pad);
    S.pos = d.z - DUZ_AUTA - PLAYER_DZ - 6; S.ppos = Math.min(S.ppos, S.pos);
    d.cx = pick([-0.62, 0, 0.62], S.r);
  }
  d.v += 28; d.izmakni = 0.3; d.bezi = sastrane ? T().bezi[0] * 0.6 : T().bezi[0];   // posle udarca na kratko pobegne i izmiče
  S.shake = 0.35; S.skor += 200 * dmg; Zvuk.efekat('udarac');
  if (d.ek) iskre(d.ek.x, d.ek.y - 8 * d.ek.s, 14, [255, 220, 120]);
  for (let i = 0; i < 4 + dmg * 2; i++) S.novc.push({ z: d.z - 30, x: d.x + (Math.random() - 0.5) * 0.5, vx: (Math.random() - 0.5) * 0.8, h: 250 + Math.random() * 200, vh: 300 + Math.random() * 500, v: d.v * (0.4 + Math.random() * 0.4), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14 });
  iskace(dmg === 2 ? 'TURBO UDARAC!' : 'UDARAC!', 160, 120, '#ffd34a');
  if (S.steta >= 10) { S.faza = 'zaustavljanje'; S.t = 0; S.sirena = true; S.poruka = null; }
  else reci('udarac');
}

function predmetiKorak() {
  const pz = S.pos + PLAYER_DZ;
  for (const it of S.predmeti) {
    it.v = Math.max(0, it.v - 260 * STEP);
    it.z += it.v * KMH * STEP;
    it.h += it.vh * STEP; it.vh -= 2000 * STEP;
    if (it.h < 0) { it.h = 0; it.vh = -it.vh * 0.3; it.vr *= 0.6; if (Math.abs(it.vh) < 60) it.vh = 0; }
    it.rot += it.vr * STEP;
    if (it.ukras) continue;
    const dz = it.z - pz;
    if (!it.pogodjen && S.faza === 'voznja' && dz > -60 && dz < DUZ_AUTA && Math.abs(it.x - S.x) < POL_PW + 0.08 && it.h < 380) {
      it.pogodjen = true;
      const P = PREDMETI[it.tip];
      S.v = Math.max(0, S.v - P.usporenje); S.skor += P.poeni; S.shake = 0.2; Zvuk.efekat(it.tip === 'kesa_novca' ? 'novac' : 'predmet');
      iskace(`${P.naziv} +${P.poeni}`, 160, 130, '#ffffff');
      if (it.tip === 'fascikla') S.papiri = 1.0;
      if (it.tip === 'kesa_novca') for (let i = 0; i < 8; i++) S.novc.push({ z: it.z + 300, x: it.x + (Math.random() - 0.5) * 0.4, vx: (Math.random() - 0.5) * 1.2, h: 50, vh: 400 + Math.random() * 400, v: S.v * 0.8, rot: 0, vr: (Math.random() - 0.5) * 14 });
    }
  }
  S.predmeti = S.predmeti.filter((it) => !it.pogodjen && it.z > S.pos - 400);
  for (const n of S.novc) {
    n.v = Math.max(0, n.v - 200 * STEP); n.z += n.v * KMH * STEP; n.x += n.vx * STEP; n.vx *= 0.98;
    n.h += n.vh * STEP; n.vh = Math.max(-140, n.vh - 900 * STEP); if (n.h < 0) { n.h = 0; n.vh = 0; n.vr *= 0.9; }
    n.rot += n.vr * STEP;
    const dz = n.z - pz;
    if (!n.uzeta && S.faza === 'voznja' && dz > -60 && dz < DUZ_AUTA && Math.abs(n.x - S.x) < POL_PW + 0.1 && n.h < 420) { n.uzeta = true; S.skor += 100; Zvuk.efekat('novcanica'); iskace('+100', 160 + (n.x - S.x) * 60, 150, '#7fd36a'); }
  }
  S.novc = S.novc.filter((n) => !n.uzeta && n.z > S.pos - 400);
}

function iskre(x, y, n, col) { for (let i = 0; i < n; i++) S.cestice.push({ x, y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 120, r: 1, rr: 0.5, z: 300, max: 0.5, col, tip: 'iskra' }); }
function iskace(tekst, x, y, boja) { S.iskacuci.push({ tekst, x, y, boja, t: 0 }); }

function cesticeKorak() {
  for (const c of S.cestice) { c.t = (c.t || 0) + STEP; c.x += c.vx * STEP; c.y += c.vy * STEP; c.vy += c.z * STEP; }
  S.cestice = S.cestice.filter((c) => c.t < c.max);
  if (S.cestice.length > 400) S.cestice.splice(0, S.cestice.length - 400);
}

// ---------- kraj potere ----------
function autopilotZaustavi() {
  const d = S.dzip, gap = d.z - (S.pos + PLAYER_DZ);
  const cilj = Math.max(0, (gap - DUZ_AUTA - 260) / (KMH * 0.55));
  S.v += clamp(cilj - S.v, -160 * STEP, 100 * STEP) + 22 * STEP;   // +22 poništava "pušten gas" u voznja()
  if (S.v < 3 && d.v <= 0) S.v = 0;
  S.x += clamp(0.9 - S.x, -0.6 * STEP, 0.6 * STEP);
  if (S.t > 1.8 && d.v <= 0 && S.v <= 0) { S.faza = 'hapsenje'; S.t = 0; }
  return { gas: false, koc: false, lev: false, des: false };
}

function korakHapsenje() {
  const d = S.dzip, t = S.t;
  if (d.ek && t < 4 && Math.random() < 0.7) S.cestice.push({ x: d.ek.x + (Math.random() - 0.5) * 20 * d.ek.s, y: d.ek.y - 40 * d.ek.s, vx: (Math.random() - 0.5) * 14, vy: -22 - Math.random() * 14, r: 2 * d.ek.s + 1, rr: 9 * d.ek.s + 3, z: 0, max: 1.2, col: [235, 235, 245], tip: 'para' });
  if (t >= 0.8 && !S.koferi) {
    S.koferi = true;
    for (let i = 0; i < 4; i++) S.predmeti.push({ tip: i % 2 ? 'kofer' : (S.b.predmeti[i] || 'kofer'), z: d.z + 60 + i * 70, x: d.x + (i % 2 ? 0.24 : -0.22), h: 420, vh: 300 + i * 80, v: 0, rot: 0, vr: (i % 2 ? 1 : -1) * 6, ukras: true });
  }
  if (t >= 1.4 && !S.izgovor) { S.izgovor = true; reci('izgovor', null, { tekst: pick(S.b.izgovori, Math.random), ko: `${S.b.inicijali} · ${S.b.ime.toUpperCase()}`, portret: 'b' + S.id, t: 4.6, uvek: true }); }
  if (t >= 3.0 && !S.pecat) { S.pecat = true; S.skor += 20000; Zvuk.efekat('pecat'); iskace('BEGUNAC +20000', 160, 150, '#ffd34a'); }
  if (t >= 6.2) {
    S.faza = 'predjena'; S.t = 0; reci('uhapsen', null, { uvek: true, t: 5 }); IGRA.uhapseni[S.id - 1] = true;
    S.bonus = { vreme: Math.ceil(S.vreme) * 1000, bezSudara: S.sudari === 0 ? 10000 : 0, dodato: 0 };
  }
}

function korakPredjena() {
  const B = S.bonus, ukupno = B.vreme + B.bezSudara;
  if (S.t > 0.8 && B.dodato < ukupno) { const k = Math.min(ukupno - B.dodato, Math.ceil(ukupno / 90)); B.dodato += k; S.skor += k; }
  if (S.t > 2 && (Ulaz.pritisnut('turbo') || Ulaz.pritisnut('ok'))) { if (B.dodato < ukupno) S.skor += ukupno - B.dodato; sledecaDeonica(); }
}

function pocniBeg() { S.faza = 'pobegao'; S.t = 0; S.sirena = false; S.poruka = null; }
function korakBeg() {
  if (S.v > 0) S.v = Math.max(0, S.v - 90 * STEP);
  if (S.faza === 'pobegao') {
    if (S.t > 1 && !S.recenoBeg) { S.recenoBeg = true; reci('pobegao', null, { uvek: true, t: 5 }); }
    // posle poslednje deonice nema nastavka - pravo na kraj (granica)
    if (S.t > 9 || (S.t > 3 && (Ulaz.pritisnut('turbo') || Ulaz.pritisnut('ok')))) { IGRA.uhapseni[S.id - 1] = false; if (S.id < 4) { S.faza = 'nastavak'; S.t = 0; } else zavrsiIgru(); }
  } else if (S.faza === 'nastavak') {
    // NASTAVAK: potera ide dalje na sledeću deonicu (ovaj begunac je pobegao), sa istim bodovima
    if (Ulaz.pritisnut('turbo') || Ulaz.pritisnut('ok')) { sledecaDeonica(); return; }
    if (S.t >= 10) zavrsiIgru(true);
  }
}
function sledecaDeonica() { if (S.id < 4) novaDeonica(S.id + 1, S.skor); else zavrsiIgru(); }

// ---------- pauza ----------
// jačina: ←→ menja za 10 %, Enter uključuje/isključuje
const jacina = (k, isk) => (PODESAVANJA[isk] ? 'ISKLJUČENA' : `<  ${Math.round(PODESAVANJA[k] * 100)} %  >`);
function stavkePauze() {
  return ['NASTAVI', `MUZIKA: ${jacina('muzika', 'muzikaIskl')}`, `EFEKTI: ${jacina('efekti', 'efektiIskl')}`,
    `CRT EFEKAT: ${PODESAVANJA.crt ? 'UKLJUČEN' : 'ISKLJUČEN'}`, 'NASLOVNI EKRAN'];
}
function korakPauza() {
  const n = stavkePauze().length;
  if (Ulaz.pritisnut('gas')) { S.meni = (S.meni + n - 1) % n; Zvuk.efekat('klik'); }
  if (Ulaz.pritisnut('koc')) { S.meni = (S.meni + 1) % n; Zvuk.efekat('klik'); }
  if (Ulaz.pritisnut('pauza')) { S.faza = S.pauzaIz; Ulaz.ocisti(); return; }
  const kljuc = S.meni === 1 ? ['muzika', 'muzikaIskl'] : S.meni === 2 ? ['efekti', 'efektiIskl'] : null;
  if (kljuc) {
    const d = Ulaz.pritisnut('des') ? 0.1 : Ulaz.pritisnut('lev') ? -0.1 : 0;
    if (d) { PODESAVANJA[kljuc[0]] = clamp(Math.round((PODESAVANJA[kljuc[0]] + d) * 10) / 10, 0, 1); PODESAVANJA[kljuc[1]] = false; sacuvajPodesavanja(); Zvuk.efekat('klik'); }
  }
  if (Ulaz.pritisnut('ok') || Ulaz.pritisnut('turbo')) {
    if (S.meni === 0) S.faza = S.pauzaIz;
    else if (kljuc) { PODESAVANJA[kljuc[1]] = !PODESAVANJA[kljuc[1]]; sacuvajPodesavanja(); Zvuk.efekat('klik'); }
    else if (S.meni === 3) { PODESAVANJA.crt = !PODESAVANJA.crt; sacuvajPodesavanja(); }
    else { naNaslov(); Ulaz.ocisti(); return; }
  }
  Ulaz.ocisti();
}

// ---------- crtanje sveta ----------
const DIN = new Map();   // segment → dinamični objekti u njemu (crtaju se zajedno sa sprajtovima segmenta)
const BILJ_OFF = [-1.62, 1.62, -1.88, 1.92, -2.3, 2.35, -2.75, 2.8];

function crtajSvet(al) {
  const put = S.put;
  const kz = lerp(S.ppos, S.pos, al), kx = lerp(S.px, S.x, al);
  const pz = kz + PLAYER_DZ, sp = segNa(pz), fr = (pz % SEG) / SEG;
  const kam = { z: kz, x: kx * ROAD_W, y: lerp(sp.y1, sp.y2, fr) + CAM_H };

  g.setTransform(1, 0, 0, 1, 0, 0);
  crtajNebo(g, S.nebo, S.nebof, S.nebon);
  projektujPut(put, kam);
  crtajTlo(put);
  g.drawImage(TLO.cv, 0, 0);
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.imageSmoothingEnabled = true;

  // dinamični objekti po segmentima
  DIN.clear();
  const dodaj = (z, o) => { const i = Math.floor(z / SEG); if (!DIN.has(i)) DIN.set(i, []); DIN.get(i).push(o); };
  const zMax = kz + DRAW * SEG;
  for (const a of S.saobracaj) { const z = lerp(a.pz, a.z, al); if (z > kz && z < zMax) dodaj(z, { z, a, x: lerp(a.px, a.x, al) }); }
  const d = S.dzip, dz = lerp(d.pz, d.z, al);
  d.ek = null;
  if (S.faza !== 'start' && dz > kz && dz < zMax) dodaj(dz, { z: dz, dzip: true, x: lerp(d.px, d.x, al) });
  for (const it of S.predmeti) if (it.z > kz && it.z < zMax) dodaj(it.z, { z: it.z, it });
  for (const n of S.novc) if (n.z > kz && n.z < zMax) dodaj(n.z, { z: n.z, n });

  const base = Math.floor(kz / SEG);
  for (let k = VIDLJIVI.length - 1; k >= 0; k--) {
    const sg = VIDLJIVI[k];
    const P0 = sg.P;
    const treba = P0.y1 > sg.clip + 0.5;
    if (treba) { g.save(); g.beginPath(); g.rect(0, 0, W, sg.clip); g.clip(); }
    // biljke na njivi (samo blizu, kao na maketi)
    if (sg.i - base < 90) {
      for (let h = sg.i - base < 40 ? 1 : 0; h >= 0; h--) for (let j = 0; j < BILJ_OFF.length; j++) {
        const hs = hash(sg.i * 16 + h * 8 + j), off = BILJ_OFF[j] * (1 + (hs - 0.5) * 0.08);
        const tip = off < 0 ? sg.pl : sg.pd;
        if (!BILJKE[tip] || (tip === 'uzorano' && j % 2)) continue;
        const p = tacka(sg, h * 0.5 + hs * 0.2, off);
        if (p.s < 0.15 || p.x < -20 || p.x > 340) continue;
        crtajKes(g, biljka(tip), p.x, p.y, p.s);
      }
    }
    for (const o of sg.spr) {
      const p = tacka(sg, 0, o.x);
      if (p.s < 0.02 || p.x < -150 || p.x > 470) continue;
      if (o.traktor) crtajPrasinuTraktora(p, o.levo);
      crtajKes(g, o.sp, p.x, p.y, p.s);
      if (o.traktor) crtajDimTraktora(p, o.levo);
    }
    const dl = DIN.get(sg.i);
    if (dl) {
      dl.sort((a, b) => b.z - a.z);
      for (const o of dl) crtajDinamicno(sg, o);
    }
    if (treba) g.restore();
  }
  crtajPolicija();
  // čestice (ekranske)
  for (const c of S.cestice) {
    const k = c.t / c.max, r = c.r + (c.rr - c.r) * k;
    if (c.tip === 'iskra') { g.fillStyle = css(c.col, 1 - k); g.fillRect(c.x, c.y, 1, 1); continue; }
    g.fillStyle = css(c.col, (c.tip === 'prah' ? 0.55 : c.tip === 'para' ? 0.5 : 0.45) * (1 - k));
    g.beginPath(); g.arc(c.x, c.y, r, 0, TAU); g.fill();
  }
  return kam;
}

function crtajDinamicno(sg, o) {
  const f = (o.z - sg.i * SEG) / SEG;
  if (o.a) {
    const p = tacka(sg, f, o.x);
    if (p.x < -60 || p.x > 380) return;
    crtajKes(g, o.a.sp, p.x, p.y, p.s);
    if (S.dn.svetla && !o.a.stoji) zadnjaSvetla(p, o.a.pw * ROAD_W * p.sc, o.a.sp.t * p.s * 0.4, false);
  } else if (o.dzip) {
    const p = tacka(sg, f, o.x);
    crtajKes(g, dzip(S.b, S.dzip.koci > 0), p.x, p.y, p.s);
    if (S.dn.svetla) zadnjaSvetla(p, DZIP_PW * ROAD_W * p.sc, -22 * p.s, S.dzip.koci > 0);
    S.dzip.ek = p;
    if (S.faza === 'hapsenje' || S.faza === 'predjena') { // otvorena vrata
      const s = p.s; g.fillStyle = '#0a0a10';
      g.fillRect(p.x - 23 * s, p.y - 34 * s, 3 * s, 20 * s); g.fillRect(p.x + 20 * s, p.y - 34 * s, 3 * s, 20 * s);
      g.fillStyle = 'rgba(140,160,200,0.6)'; g.fillRect(p.x - 25 * s, p.y - 34 * s, 2 * s, 8 * s); g.fillRect(p.x + 23 * s, p.y - 34 * s, 2 * s, 8 * s);
    }
  } else if (o.it) {
    const it = o.it, p = tacka(sg, f, it.x);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(p.x, p.y, 8 * p.s, 2 * p.s, 0, 0, TAU); g.fill();
    crtajPredmet(g, it.tip, p.x, p.y - it.h * p.sc - 6 * p.s, p.s, it.rot);
  } else if (o.n) {
    const n = o.n, p = tacka(sg, f, n.x);
    crtajPredmet(g, 'novcanica', p.x, p.y - n.h * p.sc - 2 * p.s, p.s * 1.4, n.rot);
  }
}

// noću: crveni sjaj zadnjih svetala (sprajtovi su zatamnjeni tonom deonice, svetla sijaju preko)
function zadnjaSvetla(p, pola, dy, koci) {
  const r = Math.max(1.2, pola * (koci ? 0.9 : 0.55));
  for (const sx of [-1, 1]) {
    const x = p.x + sx * pola * 0.78, y = p.y + dy;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, koci ? 'rgba(255,90,80,0.95)' : 'rgba(255,60,50,0.8)'); rg.addColorStop(1, 'rgba(255,40,40,0)');
    g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function crtajPrasinuTraktora(p, levo) {
  const s = p.s * 3.1, sm = levo ? -1 : 1;
  for (let k = 0; k < 4; k++) {
    const ph = (S.tSve * 0.6 + k / 4) % 1;
    const x = p.x + sm * (-16 - ph * 22) * s, y = p.y - (5 + ph * 8) * s, r = (8 + ph * 16) * s;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(205,160,110,${0.5 * (1 - ph)})`); rg.addColorStop(1, 'rgba(205,160,110,0)');
    g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
function crtajDimTraktora(p, levo) {
  const s = p.s * 3.1, sm = levo ? -1 : 1;
  for (let k = 0; k < 3; k++) {
    const ph = (S.tSve * 0.8 + k / 3) % 1;
    g.fillStyle = `rgba(90,90,90,${0.45 * (1 - ph)})`;
    g.beginPath(); g.arc(p.x + sm * (7.5 - ph * 5) * s, p.y - (23 + ph * 8) * s, (1.6 + ph * 2.4) * s, 0, TAU); g.fill();
  }
}

// policijski auto: položaj na ekranu (nagib pri skretanju, drmanje van puta i u sudaru)
function transformAuta(ctx, k, ox, oy) {
  const dr = Math.abs(S.x) > 1.12 && S.v > 5 ? (hash(Math.floor(S.tSve * 30)) - 0.5) * 1.4 : 0;
  ctx.setTransform(k, 0, 0, k, ox || 0, oy || 0);
  ctx.translate(160 + S.nagib * 2, 214 + dr);
  ctx.rotate(S.nagib * 0.02);
  ctx.scale(POL_SC, POL_SC);
  ctx.translate(-160, -214);
}
function crtajPolicija() {
  const { x, y, w, h } = AUTO;
  // noću: farovi osvetljavaju put ispred auta
  if (S.dn.svetla) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const cx = 160 + S.nagib * 2, rg = g.createRadialGradient(cx, 168, 4, cx, 168, 90);
    rg.addColorStop(0, 'rgba(255,240,200,0.20)'); rg.addColorStop(1, 'rgba(255,240,200,0)');
    g.translate(cx, 168); g.scale(1, 0.32); g.translate(-cx, -168); g.fillStyle = rg; g.fillRect(cx - 90, 78, 180, 180);
    g.restore();
  }
  g.save();
  transformAuta(g, 2);
  // izduvni gas
  for (let k = 0; k < 3; k++) {
    const ph = (S.tSve * (1 + S.v / 120) + k / 3) % 1, ax = x + 16 - ph * 14, ay = y + h + 1 + ph * 3, ar = 3 + ph * 3;
    const rg = g.createRadialGradient(ax, ay, 0, ax, ay, ar * 2); rg.addColorStop(0, `rgba(230,230,240,${0.5 * (1 - ph)})`); rg.addColorStop(1, 'rgba(230,230,240,0)');
    g.fillStyle = rg; g.fillRect(ax - ar * 2, ay - ar * 2, ar * 4, ar * 4);
  }
  crtajKes(g, policija(), 0, 0, 1);
  // turbo plamen
  if (S.turboT > 0) {
    const fl = 5 + Math.random() * 5;
    const rg = g.createRadialGradient(x + 14, y + h + 1, 0, x + 14, y + h + 1, fl);
    rg.addColorStop(0, 'rgba(255,255,220,0.95)'); rg.addColorStop(0.4, 'rgba(255,170,40,0.8)'); rg.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = rg; g.fillRect(x + 14 - fl, y + h + 1 - fl, fl * 2, fl * 2);
  }
  // kočenje (i noću stalno): stop svetla sijaju
  if (S.dn.svetla || (Ulaz.drzi('koc') && S.faza === 'voznja' && !IGRA.demo)) [x + 10, x + w - 10].forEach((lx) => { const rg = g.createRadialGradient(lx, y + 38, 0, lx, y + 38, 18); rg.addColorStop(0, 'rgba(255,60,60,0.55)'); rg.addColorStop(1, 'rgba(255,60,60,0)'); g.fillStyle = rg; g.fillRect(lx - 18, y + 20, 36, 36); });
  // rotacija: trepće kad je džip blizu
  const faza = Math.floor(S.tSve * 6) % 2;
  const plavo = !S.sirena || faza === 0, crveno = !S.sirena || faza === 1;
  g.fillStyle = LGr(g, 0, y - 5, 0, y - 1, plavo ? [[0, '#8ab0ff'], [1, '#1a4ad8']] : [[0, '#2a3a6a'], [1, '#121c40']]); g.fillRect(x + 21, y - 5, 26, 4);
  g.fillStyle = LGr(g, 0, y - 5, 0, y - 1, crveno ? [[0, '#ff9a9a'], [1, '#d81a1a']] : [[0, '#5a2a2a'], [1, '#2a0a0a']]); g.fillRect(x + w - 47, y - 5, 26, 4);
  g.restore();
}

// ---------- ekran: uvećanje, bloom, natpisi, HUD, CRT ----------
function txt(s, x, y, size, col, font, senka, align) {
  O.font = `${size}px ${font || 'PS'}`; O.textAlign = align || 'left'; O.textBaseline = 'top';
  if (senka !== false) { O.fillStyle = '#000'; O.fillText(s, x + 4, y + 4); }
  O.fillStyle = col; O.fillText(s, x, y);
}
function prelomi(tekst, sirina, font) {
  O.font = font; const reci_ = tekst.split(' '), red = []; let r = '';
  for (const w of reci_) { const t = r ? r + ' ' + w : w; if (O.measureText(t).width > sirina && r) { red.push(r); r = w; } else r = t; }
  if (r) red.push(r); return red;
}

function crtajEkran(al) {
  crtajSvet(al);
  O.setTransform(1, 0, 0, 1, 0, 0);
  O.globalCompositeOperation = 'source-over'; O.globalAlpha = 1;
  const sx = S.shake > 0 ? (Math.random() - 0.5) * 18 * S.shake / 0.45 : 0, sy = S.shake > 0 ? (Math.random() - 0.5) * 12 * S.shake / 0.45 : 0;
  O.fillStyle = '#000'; O.fillRect(0, 0, OW, OH);
  O.imageSmoothingEnabled = true; O.imageSmoothingQuality = 'low';
  O.drawImage(buf, sx, sy, OW, OH);
  if (PODESAVANJA.crt) {
    bg.globalCompositeOperation = 'copy'; bg.filter = 'blur(1.2px)'; bg.drawImage(buf, 0, 0, 160, 112); bg.filter = 'none';
    O.save(); O.globalAlpha = 0.28; O.globalCompositeOperation = 'lighter'; O.imageSmoothingQuality = 'high'; O.drawImage(blm, sx, sy, OW, OH); O.restore();
  }
  // oštri natpisi na autu
  O.save(); transformAuta(O, K4, sx, sy);
  O.textBaseline = 'top'; O.textAlign = 'center';
  O.fillStyle = '#ffffff'; O.font = 'bold 5.5px PS'; O.fillText('POLICIJA', AUTO.x + AUTO.w / 2, AUTO.y + 27.6);
  O.fillStyle = '#1b1b2a'; O.font = '6.5px VT'; O.fillText('NS-007', AUTO.x + AUTO.w / 2 + 1.5, AUTO.y + 36.6);
  O.restore();
  // sjaj sirene
  if (S.sirena) {
    const f = Math.floor(S.tSve * 6) % 2;
    const gx = f ? 720 : 560, col = f ? '255,40,40' : '60,110,255', a = f ? 0.16 : 0.2;
    const gr = O.createRadialGradient(gx, 600, 10, gx, 600, 520); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
    O.fillStyle = gr; O.fillRect(0, 0, OW, OH);
  }
  if (S.papiri > 0) crtajPapire();
  if (S.faza !== 'start') crtajHUD();
  if (S.faza !== 'pauza' && !IGRA.demo) crtajPoruku();
  crtajIskacuce();
  crtajNatpiseFaze();
  if (PODESAVANJA.crt) O.drawImage(crtSloj, 0, 0);
  if (PODESAVANJA.fps) txt(`${FPS.v} FPS`, 20, OH - 30, 14, '#7dffb0', 'PS', true);   // dole levo, van okvira brzine
}

function crtajHUD() {
  txt('VREME', 40, 20, 30, '#ffd34a', 'VT'); txt(String(Math.ceil(S.vreme)).padStart(2, '0'), 40, 52, 48, S.vreme <= 10 && Math.floor(S.tSve * 4) % 2 ? '#ff5a5a' : '#ffffff');
  txt('SKOR', 40, 108, 30, '#ffd34a', 'VT'); txt(String(S.skor).padStart(7, '0'), 40, 138, 16, '#ffffff');
  txt('OŠTEĆENJE DŽIPA', 640, 18, 30, '#ffd34a', 'VT', true, 'center');
  const trep = S.steta >= 8 && S.steta < 10 && Math.floor(S.tSve * 5) % 2;
  for (let i = 0; i < 10; i++) {
    const x = 440 + i * 40, pun = i < S.steta;
    O.fillStyle = '#000'; O.fillRect(x + 4, 58, 32, 26);
    O.fillStyle = pun ? (trep ? '#ffffff' : i < 2 ? '#ff3a2a' : i < 4 ? '#ff7a2a' : i < 7 ? '#ffa42a' : '#ffd34a') : '#2a2440';
    O.fillRect(x, 54, 32, 26);
    if (pun) { O.fillStyle = 'rgba(255,255,255,0.35)'; O.fillRect(x, 54, 32, 5); }
  }
  txt(`DEONICA ${S.id} · ${S.dn.naziv}`, 640, 88, 30, '#9fd3ff', 'VT', true, 'center');
  txt('DO HORGOŠA', 1240, 20, 30, '#ffd34a', 'VT', true, 'right');
  txt(`${Math.ceil(segUKm(S.put, (S.pos + PLAYER_DZ) / SEG))} KM`, 1240, 52, 32, '#ffffff', 'PS', true, 'right');
  // brzina: okvir 1010-1250 × 740-860, unutra 18 px od ivice; broj desno poravnat uz KM/H (iste donje ivice),
  // ispod tanka linija, pa BRZINA levo i menjač LO/HI desno (uključen je svetao, drugi prigušen)
  const BX = 1010, BY = 740, BWd = 240, BHt = 120, L = BX + 18, D = BX + BWd - 18;
  O.fillStyle = 'rgba(10,8,24,0.82)'; O.fillRect(BX, BY, BWd, BHt); O.strokeStyle = '#ffd34a'; O.lineWidth = 4; O.strokeRect(BX, BY, BWd, BHt);
  const zel = S.turboT > 0 ? '#ffd34a' : '#7dffb0';
  txt(String(Math.round(S.v)), L + 120, 756, 40, zel, 'PS', false, 'right');
  txt('KM/H', D, 782, 14, zel, 'PS', false, 'right');
  O.fillStyle = 'rgba(255,211,74,0.35)'; O.fillRect(L, 808, D - L, 2);
  txt('BRZINA', L, 816, 30, '#ffd34a', 'VT', false);
  const hi = S.menjac === 'HI';
  txt('HI', D, 826, 14, hi ? '#ff5a5a' : '#4a3a5a', 'PS', false, 'right');
  txt('LO', D - 44, 826, 14, hi ? '#4a3a5a' : '#9fd3ff', 'PS', false, 'right');
  O.fillStyle = hi ? '#ff5a5a' : '#9fd3ff'; O.fillRect(hi ? D - 28 : D - 72, 844, 28, 3);
  // turbo: natpis poravnat sa levom ivicom okvira, tri polja sa desnom
  txt('TURBO', BX, 711, 14, '#ffd34a', 'PS');
  for (let i = 0; i < 3; i++) {
    const x = BX + BWd - 3 * 22 - 2 * 8 + i * 30, y = 709;
    O.fillStyle = '#000'; O.fillRect(x + 3, y + 3, 22, 16);
    O.fillStyle = i < S.turbo ? '#ff7a2a' : '#2a2440'; O.fillRect(x, y, 22, 16);
    if (i < S.turbo) { O.fillStyle = '#ffd34a'; O.fillRect(x + 6, y + 4, 10, 8); }
  }
  // strelica DŽIP
  const d = S.dzip, gap = d.z - (S.pos + PLAYER_DZ);
  if (S.faza === 'voznja' && d.ek && gap < 30000 && gap > 1500 && Math.floor(S.tSve * 4) % 2) {
    const ax = d.ek.x * K4, ay = Math.max(60, (d.ek.y - 45 * d.ek.s) * K4 - 60);
    txt('DŽIP', ax, ay - 34, 34, '#ffd34a', 'VT', true, 'center');
    O.fillStyle = '#000'; O.beginPath(); O.moveTo(ax - 12 + 3, ay + 3); O.lineTo(ax + 12 + 3, ay + 3); O.lineTo(ax + 3, ay + 18 + 3); O.fill();
    O.fillStyle = '#ffd34a'; O.beginPath(); O.moveTo(ax - 12, ay); O.lineTo(ax + 12, ay); O.lineTo(ax, ay + 18); O.fill();
  }
}

function crtajPoruku() {
  const p = S.poruka;
  if (!p) return;
  const bx = 48, by = 196;
  O.fillStyle = 'rgba(10,8,24,0.85)'; O.fillRect(bx - 8, by - 8, 168, 168); O.strokeStyle = '#9fd3ff'; O.lineWidth = 4; O.strokeRect(bx - 8, by - 8, 168, 168);
  O.save(); O.beginPath(); O.rect(bx, by, 152, 152); O.clip();
  crtajPortret(O, p.portret, bx, by, 152);
  O.restore();
  const linije = prelomi(p.tekst, 556, '36px VT').slice(0, 5);
  const vis = Math.max(168, 60 + linije.length * 36);
  O.fillStyle = 'rgba(10,8,24,0.85)'; O.fillRect(228, 188, 600, vis); O.strokeStyle = '#9fd3ff'; O.strokeRect(228, 188, 600, vis);
  txt(p.ko, 248, 198, 30, '#9fd3ff', 'VT', false);
  linije.forEach((l, i) => txt(l, 248, 234 + i * 36, 36, '#ffffff', 'VT', false));
}

function crtajIskacuce() {
  for (const p of S.iskacuci) { O.globalAlpha = clamp(1.4 - p.t, 0, 1); txt(p.tekst, p.x * K4, p.y * K4 - p.t * 60, 34, p.boja, 'VT', true, 'center'); }
  O.globalAlpha = 1;
}

function crtajPapire() {
  const a = Math.min(1, S.papiri * 2);
  for (let i = 0; i < 9; i++) {
    O.save(); O.globalAlpha = a; O.translate(200 + hash(i * 3) * 880, 300 + hash(i * 5) * 420); O.rotate((hash(i * 7) - 0.5) * 0.9);
    O.fillStyle = '#f6f2e6'; O.fillRect(-90, -120, 180, 240); O.fillStyle = '#b8b0a0'; for (let k = 0; k < 9; k++) O.fillRect(-70, -90 + k * 22, 140 - (k % 3) * 30, 6);
    O.fillStyle = '#c42a2a'; O.font = '30px VT'; O.textAlign = 'center'; O.fillText('POVERLJIVO', 0, -98); O.restore();
  }
}

function velikNatpis(tekst, y, boja, vel) {
  txt(tekst, 640, y, vel || 72, boja || '#ffd34a', 'VT', true, 'center');
}

function crtajNatpiseFaze() {
  const f = S.faza, t = S.t;
  if (IGRA.demo) { // gore, ispod naziva deonice (oblačić dispečerke se u demu ne prikazuje)
    if (Math.floor(S.tSve * 2) % 2) velikNatpis('DEMO', 150, '#ffd34a', 80);
    txt('PRITISNI SPACE', 640, 236, 22, '#ffffff', 'PS', true, 'center');
  }
  if (f === 'start') crtajBrifing();
  else if (f === 'hapsenje' && S.pecat) {
    const k = Math.min(1, (t - 3) / 0.25);
    O.save(); O.translate(640, 470); O.rotate(-0.12); O.scale(2.4 - 1.4 * k, 2.4 - 1.4 * k); O.globalAlpha = k;
    O.strokeStyle = '#e8262a'; O.lineWidth = 10; O.strokeRect(-250, -70, 500, 140);
    O.font = '120px VT'; O.textAlign = 'center'; O.textBaseline = 'middle'; O.fillStyle = '#e8262a'; O.fillText(REPLIKE.ekrani.uhapsen, 0, 6);
    O.restore();
  } else if (f === 'predjena') {
    O.fillStyle = 'rgba(10,8,24,0.72)'; O.fillRect(240, 380, 800, 330); O.strokeStyle = '#ffd34a'; O.lineWidth = 4; O.strokeRect(240, 380, 800, 330);
    velikNatpis(REPLIKE.ekrani.deonicaPredjena, 396, '#ffd34a', 76);
    const B = S.bonus;
    txt(`${REPLIKE.ekrani.vremeBonus}: ${Math.ceil(S.vreme)} × 1000`, 290, 490, 36, '#ffffff', 'VT', false);
    txt(String(B.vreme), 990, 494, 24, '#7dffb0', 'PS', false, 'right');
    txt('BEZ SUDARA SA SAOBRAĆAJEM', 290, 540, 36, B.bezSudara ? '#ffffff' : '#8a84a8', 'VT', false);
    txt(B.bezSudara ? String(B.bezSudara) : `${S.sudari} SUDAR${S.sudari === 1 ? '' : 'A'}`, 990, 544, 24, B.bezSudara ? '#7dffb0' : '#ff7a6a', 'PS', false, 'right');
    txt('SKOR', 290, 600, 36, '#ffd34a', 'VT', false); txt(String(S.skor).padStart(7, '0'), 990, 604, 24, '#ffffff', 'PS', false, 'right');
    if (t > 2 && Math.floor(S.tSve * 2) % 2) txt('PRITISNI SPACE', 640, 660, 20, '#ffffff', 'PS', true, 'center');
    txt(S.id < 4 ? `DALJE: DEONICA ${S.id + 1} · ${DEONICE[S.id].naziv}` : 'DALJE: GRANICA', 640, 340, 30, '#cfc8ff', 'VT', true, 'center');
  } else if (f === 'pobegao') {
    if (t > 1) velikNatpis(REPLIKE.ekrani.pobegao, 410, '#ff5a4a', 80);
    if (t > 2.5) crtajRazglednicu(Math.min(1, (t - 2.5) / 0.5));
  } else if (f === 'nastavak') {
    O.fillStyle = 'rgba(10,8,24,0.7)'; O.fillRect(0, 380, OW, 260);
    velikNatpis(REPLIKE.ekrani.nastavak, 400, '#ffd34a', 96);
    txt(String(Math.max(0, 10 - Math.floor(t))), 640, 500, 72, '#ffffff', 'PS', true, 'center');
    if (Math.floor(S.tSve * 2) % 2) txt('PRITISNI SPACE', 640, 596, 20, '#ffffff', 'PS', true, 'center');
    txt(`POTERA SE NASTAVLJA NA DEONICI ${S.id + 1} · ${DEONICE[S.id].naziv}`, 640, 650, 30, '#cfc8ff', 'VT', true, 'center');
  } else if (f === 'pauza') {
    O.fillStyle = 'rgba(6,4,16,0.7)'; O.fillRect(0, 0, OW, OH);
    velikNatpis(REPLIKE.ekrani.pauza, 260, '#ffd34a', 110);
    stavkePauze().forEach((s, i) => txt((i === S.meni ? '▶ ' : '  ') + s, 640, 390 + i * 60, 44, i === S.meni ? '#ffffff' : '#9fd3ff', 'VT', true, 'center'));
    txt('↑↓ BIRAJ · ←→ JAČINA · ENTER POTVRDI · ESC NASTAVI · M MUZIKA · C CRT · F FPS', 640, 760, 28, '#cfc8ff', 'VT', true, 'center');
  }
}

// brifing pre deonice: dispečerka (levo) čita zadatak, desno "fotografija" begunca i opis džipa
function crtajBrifing() {
  O.fillStyle = 'rgba(8,6,20,0.72)'; O.fillRect(0, 0, OW, OH);
  txt(`DEONICA ${S.id} · ${S.dn.naziv}`, 640, 40, 46, '#9fd3ff', 'VT', true, 'center');
  txt(`${S.dn.kmOd} KM DO HORGOŠA · ${S.dn.doba.toUpperCase()} · TEŽINA: ${T().naziv}`, 640, 94, 30, '#cfc8ff', 'VT', true, 'center');
  // dispečerka
  const bx = 70, by = 170;
  O.fillStyle = 'rgba(10,8,24,0.9)'; O.fillRect(bx - 8, by - 8, 168, 168); O.strokeStyle = '#9fd3ff'; O.lineWidth = 4; O.strokeRect(bx - 8, by - 8, 168, 168);
  O.save(); O.beginPath(); O.rect(bx, by, 152, 152); O.clip(); crtajPortret(O, 'dragana', bx, by, 152); O.restore();
  txt(DISP.ime, bx - 8, by + 172, 28, '#9fd3ff', 'VT', false);
  const lin = prelomi(S.b.brifing, 430, '34px VT');
  O.fillStyle = 'rgba(10,8,24,0.9)'; O.fillRect(250, 162, 470, Math.max(184, 30 + lin.length * 36)); O.strokeStyle = '#9fd3ff'; O.strokeRect(250, 162, 470, Math.max(184, 30 + lin.length * 36));
  lin.forEach((l, i) => txt(l, 270, 178 + i * 36, 34, '#ffffff', 'VT', false));
  // begunac: "fotografija" iz dosijea
  const fx = 790, fy = 150;
  O.save(); O.translate(fx + 200, fy + 170); O.rotate(0.03);
  O.fillStyle = '#f4ead2'; O.fillRect(-200, -170, 400, 470);
  O.fillStyle = '#1a1438'; O.fillRect(-170, -140, 340, 300);
  crtajPortret(O, 'b' + S.id, -150, -130, 300);
  O.fillStyle = '#2a2440'; O.font = '34px VT'; O.textBaseline = 'top'; O.textAlign = 'center';
  O.fillText(`${S.b.ime.toUpperCase()} · ${S.b.inicijali}`, 0, 172);
  O.font = '22px VT'; prelomi(S.b.uloga, 360, '22px VT').slice(0, 3).forEach((l, i) => O.fillText(l, 0, 206 + i * 22));
  O.fillStyle = '#c42a2a'; O.font = '26px VT'; O.fillText('TRAŽI SE', 0, 274); O.textAlign = 'left';
  O.restore();
  // džip
  txt('DŽIP:', 70, 560, 34, '#ffd34a', 'VT', false);
  prelomi(`${S.b.dzip.detalj[0].toUpperCase()}${S.b.dzip.detalj.slice(1)}. Tablice: ? ? ?`, 620, '32px VT').slice(0, 3).forEach((l, i) => txt(l, 160, 562 + i * 34, 32, '#ffffff', 'VT', false));
  txt('PREDMETI KROZ PROZOR USPORAVAJU, NOVČANICE SU BONUS', 70, 680, 28, '#cfc8ff', 'VT', false);
  if (Math.floor(S.tSve * 2) % 2) txt(REPLIKE.ekrani.pritisni, 640, 770, 24, '#ffffff', 'PS', true, 'center');
  txt('STRELICE/WASD VOŽNJA · SPACE TURBO · SHIFT MENJAČ · ESC PAUZA', 640, 830, 26, '#cfc8ff', 'VT', true, 'center');
}

function crtajRazglednicu(k) {
  const r = S.b.razglednica;
  O.save(); O.translate(640, 640 + (1 - k) * 300); O.rotate(-0.05); O.globalAlpha = k;
  O.fillStyle = 'rgba(0,0,0,0.5)'; O.fillRect(-300 + 10, -150 + 10, 600, 300);
  O.fillStyle = '#f4ead2'; O.fillRect(-300, -150, 600, 300);
  O.fillStyle = LGr(O, 0, -140, 0, 20, [[0, '#f7a840'], [1, '#c43c58']]); O.fillRect(-286, -136, 300, 160);
  O.fillStyle = '#fff3a8'; O.beginPath(); O.arc(-136, 0, 50, Math.PI, 0); O.fill();
  O.fillStyle = '#2a1232'; O.fillRect(-286, 4, 300, 20);
  O.textAlign = 'left'; O.textBaseline = 'top';
  O.fillStyle = '#ffffff'; O.font = '30px VT'; O.fillText('POZDRAV IZ', -272, -128);
  O.font = '64px VT'; O.fillText(r.grad.toUpperCase(), -272, -100);
  O.strokeStyle = '#c42a2a'; O.lineWidth = 3; O.strokeRect(196, -136, 90, 100); O.fillStyle = '#c42a2a'; O.font = '26px VT'; O.textAlign = 'center'; O.fillText('MARKA', 241, -98);
  O.fillStyle = '#2a2440'; O.textAlign = 'left'; O.font = '28px VT';
  const linije = prelomi(r.poruka, 256, '28px VT');
  O.fillStyle = '#2a2440'; O.textAlign = 'left';
  const lin = linije.slice(0, 5);
  lin.forEach((l, i) => O.fillText(l, 28, -20 + i * 28));
  O.fillStyle = '#b8a888'; O.fillRect(16, -130, 2, 260);
  O.fillStyle = '#1f3f7a'; O.font = '28px VT'; O.textAlign = 'right'; O.fillText('- ' + S.b.inicijali, 286, -12 + lin.length * 28);
  O.restore();
}

// ---------- petlja ----------
const FPS = { v: 0, n: 0, t: 0 };
let pre = 0, acc = 0;
function petlja(t) {
  const dt = Math.min(0.25, (t - pre) / 1000 || 0); pre = t;
  acc += dt;
  let n = 0;
  while (acc >= STEP && n < 20) { if (!window.__zamrzni) (IGRA.ekran === 'deonica' ? korak : korakMeta)(); acc -= STEP; n++; }   // __zamrzni: samo za probe iz konzole
  if (IGRA.ekran === 'deonica') crtajEkran(acc / STEP); else crtajMeta(acc / STEP);
  try { Zvuk.azuriraj(stanjeZvuka()); } catch (e) { /* zvuk nikad ne sme da zaustavi igru */ }
  FPS.n++; FPS.t += dt; if (FPS.t >= 1) { FPS.v = Math.round(FPS.n / FPS.t); FPS.n = 0; FPS.t = 0; window.__fps = FPS.v; }
  requestAnimationFrame(petlja);
}

// pokretanje je u ekrani.js (učitava se posle ovog fajla)
