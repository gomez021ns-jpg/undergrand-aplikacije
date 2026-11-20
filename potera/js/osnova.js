// UnderGRAND Potera do Horgoša - osnova: konstante, nasumičnost sa semenom, boje, tasteri i gamepad, podešavanja.
// Klasične skripte (ne moduli, zbog file://); redosled: osnova → nebo → sprajtovi → put → igra.
'use strict';

// Logičke koordinate 320×224, crta se na pomoćnom canvasu 640×448 (pola piksela), ekran je 1280×896.
const W = 320, H = 224, HZ = 104;
const BW = 640, BH = 448;
const OW = 1280, OH = 896, K4 = OW / W;
const STEP = 1 / 60;

// Put (pseudo 3D, "Lou's pseudo 3d"): dy = CAM_H*PF/z, pola širine puta = ROAD_W*PF/z.
// SVE JE U STVARNIM MERAMA (korisnik 12. 11. 2026: "vozila moraju biti ujednačena"): 1 m = M jedinica puta,
// put = 3 trake po 3,5 m (pola širine ROAD_W = 5,25 m), segment = 1,1 m (jedna traka po dubini).
// Kamera je ~7 m iza policijskog auta, visoko ~2,5 m, sa uskim uglom (kao u arkadnim poterama): zato je naš auto
// krupan, a džip kad ga stigneš skoro iste veličine. Put je na dnu ekrana širi od ekrana, njive se vide od sredine naviše.
const M = 181;
const SEG = 200;
const ROAD_W = 950;
const PF = 310;
const PLAYER_DZ = 1300;      // zadnji branik policijskog auta je ovoliko ispred kamere
const CAM_H = Math.round(110 * PLAYER_DZ / PF);   // tako da je zadnji branik na y = 214 (dy = 110)
const DRAW = 600;            // segmenata do horizonta (~660 m)
const SU = M / 21.7;         // jedinica puta po jedinici sprajta (sprajt: 21,7 jedinica = 1 m, kao na maketi)
const KMH = M / 3.6;         // jedinica puta u sekundi po 1 km/h (stvarno)
const MAXV = 290, TURBO_V = 60, TURBO_T = 3;
const DUZ_AUTA = Math.round(3.9 * M);   // dužina policijskog auta: dodir sa vozilom ispred
const POL_PW = 0.81 * M / ROAD_W;       // pola širine policijskog auta (1,62 m) u širinama puta

// ---------- nasumičnost sa semenom ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hash(n) { n = Math.imul((n | 0) ^ 0x27d4eb2d, 0x165667b1); n ^= n >>> 15; n = Math.imul(n, 0x85ebca6b); n ^= n >>> 13; return (n >>> 0) / 4294967296; }
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (a, b, t) => a + (b - a) * (-Math.cos(t * Math.PI) / 2 + 0.5);
const pick = (arr, r) => arr[Math.floor(r() * arr.length) % arr.length];

// ---------- boje ----------
function hexRgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function u32(c) { return ((255 << 24) | (Math.round(c[2]) << 16) | (Math.round(c[1]) << 8) | Math.round(c[0])) >>> 0; }
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function css(c, a) { return a == null ? `rgb(${c.map(Math.round)})` : `rgba(${c.map(Math.round)},${a})`; }
// rgba('rgba(r,g,b,a)') preko osnovne boje → rgb
function preko(base, rgbaStr) {
  const m = rgbaStr.match(/[\d.]+/g).map(Number);
  return mix(base, [m[0], m[1], m[2]], m[3] == null ? 1 : m[3]);
}

// ---------- podešavanja (samo u ovom pregledaču) ----------
const PODESAVANJA = { crt: true, fps: false, muzika: 0.7, efekti: 0.8, muzikaIskl: false, efektiIskl: false, tezina: 'srednje' };
try { Object.assign(PODESAVANJA, JSON.parse(localStorage.getItem('potera-podesavanja') || '{}')); } catch (e) { /* privatni prozor */ }
function sacuvajPodesavanja() { try { localStorage.setItem('potera-podesavanja', JSON.stringify(PODESAVANJA)); } catch (e) { /* nije bitno */ } }

// ---------- tasteri i gamepad ----------
// Ulaz.drzi(ime) = taster se drži; Ulaz.pritisnut(ime) = upravo pritisnut (troši se u jednom koraku logike).
const Ulaz = (() => {
  const MAPA = {
    ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'koc', KeyS: 'koc', ArrowLeft: 'lev', KeyA: 'lev', ArrowRight: 'des', KeyD: 'des',
    Space: 'turbo', ShiftLeft: 'menjac', ShiftRight: 'menjac', Escape: 'pauza', KeyP: 'pauza', Enter: 'ok', NumpadEnter: 'ok',
    KeyC: 'crt', KeyF: 'fps', KeyK: 'karta', KeyM: 'muzika',
  };
  const drzi = new Set(), novo = new Set();
  let poslednji = 0, bilo = false;   // bilo = pritisnut bilo koji taster (i nemapiran) - za demo i naslovni ekran
  addEventListener('keydown', (e) => {
    if (!e.repeat && !document.querySelector('dialog[open]')) bilo = true;
    const a = MAPA[e.code];
    if (!a) return;
    if (document.querySelector('dialog[open]')) return;
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    if (!e.repeat) novo.add(a);
    drzi.add(a);
    poslednji = performance.now();
  });
  addEventListener('keyup', (e) => { const a = MAPA[e.code]; if (a) drzi.delete(a); });
  addEventListener('pointerdown', (e) => { if (e.target && e.target.id === 'ekran') { bilo = true; poslednji = performance.now(); } });   // klik na igru = "bilo koji taster"
  addEventListener('blur', () => drzi.clear());

  // Gamepad: levi stik / krst = volan, A/RT = gas, B/LT = kočnica, X = turbo, Y/RB = menjač, Start = pauza.
  let padPre = {}; const pad = new Set();
  function anketa() {
    pad.clear();
    const gp = (navigator.getGamepads ? navigator.getGamepads() : []).find((g) => g && g.connected);
    if (!gp) return;
    const b = (i) => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.4));
    const ax = gp.axes[0] || 0;
    const sad = { gas: b(0) || b(7), koc: b(1) || b(6), lev: ax < -0.35 || b(14), des: ax > 0.35 || b(15), turbo: b(2), menjac: b(3) || b(5), pauza: b(9), ok: b(0) || b(9) };
    for (const k in sad) {
      if (sad[k]) { pad.add(k); if (!padPre[k]) { novo.add(k); bilo = true; poslednji = performance.now(); } }
    }
    padPre = sad;
  }
  return {
    anketa,
    drzi: (a) => drzi.has(a) || pad.has(a),
    pritisnut: (a) => { if (novo.has(a)) { novo.delete(a); return true; } return false; },
    ocisti: () => novo.clear(),
    ikakav: () => { const b = bilo; bilo = false; return b; },
    neaktivan: () => (performance.now() - poslednji) / 1000,
  };
})();
