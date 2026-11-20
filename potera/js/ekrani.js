// UnderGRAND Potera do Horgoša - ekrani oko igre: učitavanje sa diska, naslovni ekran (sa demom posle 10 s), kraj na granici,
// rekordi (10 mesta, tri slova) i kartica za deljenje 1080×1080. Učitava se POSLEDNJI (posle igra.js) i pokreće igru.
'use strict';

// ---------- stanje cele igre (iznad jedne deonice) ----------
const IGRA = {
  ekran: 'ucitavanje',   // ucitavanje | naslov | deonica | kraj
  t: 0, idle: 0,
  demo: false,
  uhapseni: [null, null, null, null],   // po deonici: true = uhapšen, false = pobegao, null = nije stigao
  skor: 0, predao: false, unos: null, mesto: -1, karticaT: 0,
};
const DEMO_POSLE = 10, KRAJ_POSLE = 5;   // pravilo za sve igre u .claudapp (korisnik 1. 11. 2026)

function novaIgra() {
  IGRA.demo = false; IGRA.uhapseni = [null, null, null, null]; IGRA.ekran = 'deonica';
  Zvuk.efekat('whoop');   // sirena na polasku
  novaDeonica(DEONICA_START, 0);
  Ulaz.ikakav(); Ulaz.ocisti();
}
function pocniDemo() {
  IGRA.demo = true; IGRA.t = 0; IGRA.ekran = 'deonica';
  novaDeonica(1 + Math.floor(Math.random() * 4), 0);
  S.faza = 'voznja'; S.v = 210; S.menjac = 'HI';
  S.dzip.z = S.pos + PLAYER_DZ + 12000; S.dzip.pz = S.dzip.z;   // u demu je džip već blizu
  Ulaz.ikakav(); Ulaz.ocisti();
}
function zavrsiDemo() { IGRA.demo = false; naNaslov(); }

function naNaslov() {
  IGRA.ekran = 'naslov'; IGRA.t = 0; IGRA.idle = 0; IGRA.demo = false;
  novaDeonica(3, 0);                         // pozadina: Bačka ravnica, policija mirno vozi
  S.v = 70; S.menjac = 'HI';
  Ulaz.ikakav(); Ulaz.ocisti();
}

// kraj igre: posle 4. deonice ili kad istekne NASTAVAK (predao = true)
function zavrsiIgru(predao) {
  IGRA.skor = S.skor; IGRA.predao = !!predao; IGRA.ekran = 'kraj'; IGRA.t = 0; IGRA.idle = 0; IGRA.karticaT = 0;
  IGRA.mesto = -1;
  IGRA.unos = !IGRA.demo && kvalifikuje(IGRA.skor) ? { slova: (citajIme() + 'AAA').slice(0, 3).split(''), i: 0 } : null;
  // scena: noć na granici Horgoš, red kamiona, policija polako prilazi i staje
  novaDeonica(4, IGRA.skor);
  S.saobracaj = S.saobracaj.filter((a) => a.stoji);
  S.pos = (DUZ_DEONICE - 95) * SEG - PLAYER_DZ; S.ppos = S.pos; S.v = 40; S.x = 0.2; S.px = 0.2;
  Ulaz.ikakav(); Ulaz.ocisti();
}
const brojUhapsenih = () => IGRA.uhapseni.filter((u) => u === true).length;

// ---------- rekordi (samo u ovom pregledaču) ----------
// posebna tabela za svaku težinu; 'potera-rekordi' (bez nastavka) je TEŠKO - rekordi napravljeni pre uvođenja težina
const kljucRekorda = (t) => (t === 'tesko' ? 'potera-rekordi' : `potera-rekordi-${t}`);
function citajRekorde(t) { try { const r = JSON.parse(localStorage.getItem(kljucRekorda(t || tezina())) || '[]'); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function pisiRekorde(r, t) { try { localStorage.setItem(kljucRekorda(t || tezina()), JSON.stringify(r)); } catch (e) { /* privatni prozor */ } }
function citajIme() { try { return localStorage.getItem('potera-ime') || 'AAA'; } catch (e) { return 'AAA'; } }
function kvalifikuje(skor) { const r = citajRekorde(); return skor > 0 && (r.length < 10 || skor > r[r.length - 1].s); }
function upisiRekord(ini) {
  const r = citajRekorde(), d = new Date();
  const unos = { i: ini, s: IGRA.skor, u: brojUhapsenih(), d: `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}.`, id: Date.now() };
  r.push(unos); r.sort((a, b) => b.s - a.s); r.length = Math.min(r.length, 10);
  pisiRekorde(r); try { localStorage.setItem('potera-ime', ini); } catch (e) { /* nije bitno */ }
  IGRA.mesto = r.findIndex((x) => x.id === unos.id);
}

// slova se kucaju i direktno (A-Z), uz ↑↓ (menja slovo), ←→ (pomera), Enter (potvrđuje)
addEventListener('keydown', (e) => {
  const U = IGRA.unos;
  if (IGRA.ekran !== 'kraj' || !U || e.repeat) return;
  if (/^[a-zA-ZčćšžđČĆŠŽĐ]$/.test(e.key) && !e.ctrlKey && !e.altKey) {
    const L = e.key.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace('Đ', 'D');
    U.slova[U.i] = L; U.i = Math.min(2, U.i + 1); U.kucano = true; U.tip = true; e.preventDefault();
  } else if (e.key === 'Backspace') { U.i = Math.max(0, U.i - (U.kucano && U.i === 2 ? 0 : 1)); U.kucano = false; U.tip = true; e.preventDefault(); }
  // (U.tip: slovo A/W/S/D... je i taster za vožnju - taj pritisak ne sme da pomeri kursor ni da menja slovo)
});
function korakUnosa() {
  const U = IGRA.unos, AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (U.tip) { U.tip = false; Ulaz.ocisti(); return; }
  const pomeri = (k) => { const j = AZ.indexOf(U.slova[U.i]); U.slova[U.i] = AZ[(j + k + 26) % 26]; };
  if (Ulaz.pritisnut('gas')) { pomeri(1); Zvuk.efekat('klik'); }
  if (Ulaz.pritisnut('koc')) { pomeri(-1); Zvuk.efekat('klik'); }
  if (Ulaz.pritisnut('lev')) U.i = Math.max(0, U.i - 1);
  if (Ulaz.pritisnut('des')) U.i = Math.min(2, U.i + 1);
  if (Ulaz.pritisnut('ok') || Ulaz.pritisnut('turbo')) { upisiRekord(U.slova.join('')); IGRA.unos = null; IGRA.idle = 0; Ulaz.ikakav(); Zvuk.efekat('start'); }
}

// ---------- probni/demo vozač: zaobilazi vozila, juri džip, turbo kad je blizu ----------
function demoVozac(S) {
  const pz = S.pos + PLAYER_DZ, d = S.dzip, gap = d.z - pz;
  const slob = (l, dal) => !S.saobracaj.some((a) => Math.abs(a.x - l) < a.pw + POL_PW + 0.04 && a.z + a.duz - pz > -300 && a.z - pz < dal);
  let cilj;
  if (gap < 5000 && gap > -100 && slob(d.x, Math.max(1500, gap))) cilj = d.x;
  else {
    const tr = [-0.62, 0, 0.62, -1.2, 1.2].filter((l) => slob(l, 9000))
      .sort((a, b) => Math.abs(a) * 0.6 + Math.abs(a - S.x) * 0.5 + Math.abs(a - d.x) - (Math.abs(b) * 0.6 + Math.abs(b - S.x) * 0.5 + Math.abs(b - d.x)));
    cilj = tr.length ? tr[0] : S.x;
  }
  const sg = segNa(pz), err = cilj - S.x + 0.6 * 1.9 * (S.v / MAXV) ** 2 * sg.kriv / 2.2;
  const blizu = S.saobracaj.some((a) => Math.abs(a.x - S.x) < a.pw + POL_PW && a.z - pz > 0 && a.z - pz < 3500 && a.v < S.v - 10);
  return { gas: !blizu, koc: blizu && S.v > 110, lev: err < -0.03, des: err > 0.03, turbo: gap < 8000 && gap > 1500 };
}

// ---------- korak (ekrani van deonice) ----------
function korakMeta() {
  Ulaz.anketa();
  IGRA.t += STEP;
  if (IGRA.ekran !== 'kraj' || !IGRA.unos) { // dok se kucaju slova, C, F i M su slova, ne prečice
    if (Ulaz.pritisnut('crt')) { PODESAVANJA.crt = !PODESAVANJA.crt; sacuvajPodesavanja(); }
    if (Ulaz.pritisnut('fps')) { PODESAVANJA.fps = !PODESAVANJA.fps; sacuvajPodesavanja(); }
    if (Ulaz.pritisnut('muzika')) { PODESAVANJA.muzikaIskl = !PODESAVANJA.muzikaIskl; sacuvajPodesavanja(); }
  }
  if (IGRA.ekran === 'ucitavanje') {
    // pregledač pušta zvuk tek posle pritiska tastera/klika - zato "umetni disk i pritisni taster", pa tek onda čitanje
    if (!IGRA.cita) {
      if (Ulaz.ikakav()) { IGRA.cita = true; IGRA.t = 0; IGRA.trag = -1; Zvuk.efekat('pogon'); }
    } else {
      const trag = Math.floor(IGRA.t / 0.07);
      if (IGRA.t < 3.2 && trag !== IGRA.trag && Math.floor(IGRA.t / 0.45) % 3 !== 2) { IGRA.trag = trag; Zvuk.efekat('disk'); }
      if (IGRA.t >= 3.2 && !IGRA.dzingl) { IGRA.dzingl = true; Zvuk.efekat('dzingl'); }
      if (IGRA.t > 4.1 || (IGRA.t > 0.4 && Ulaz.ikakav())) { if (!IGRA.dzingl) Zvuk.efekat('dzingl'); naNaslov(); }
    }
    Ulaz.ocisti(); return;
  }
  if (S) { // pozadinska vožnja (naslov / kraj)
    S.t += STEP; S.tSve += STEP; S.ppos = S.pos; S.px = S.x;
    for (const a of S.saobracaj) { a.pz = a.z; a.px = a.x; }
    if (IGRA.ekran === 'kraj') { // prilazi granici i staje pred rampom
      const cilj = (DUZ_DEONICE - 18) * SEG - PLAYER_DZ;   // ~20 m pred nadstrešnicom, da se granica vidi
      S.v = Math.max(0, Math.min(40, (cilj - S.pos) / KMH * 0.8));
    }
    S.pos += S.v * KMH * STEP;
    saobracaj(); cesticeKorak();
  }
  if (IGRA.ekran === 'naslov') {
    if (Ulaz.pritisnut('ok') || Ulaz.pritisnut('turbo')) { novaIgra(); return; }
    const pomak = Ulaz.pritisnut('des') ? 1 : Ulaz.pritisnut('lev') ? -1 : 0;
    if (pomak) {
      const i = clamp(REDOSLED_TEZINA.indexOf(tezina()) + pomak, 0, REDOSLED_TEZINA.length - 1);
      PODESAVANJA.tezina = REDOSLED_TEZINA[i]; sacuvajPodesavanja(); Zvuk.efekat('klik'); IGRA.idle = 0;
    }
    if (Ulaz.ikakav()) IGRA.idle = 0; else IGRA.idle += STEP;
    if (IGRA.idle > DEMO_POSLE) { pocniDemo(); return; }
  } else if (IGRA.ekran === 'kraj') {
    if (IGRA.unos) { korakUnosa(); Ulaz.ocisti(); return; }
    if (Ulaz.pritisnut('karta')) { napraviKarticu(); IGRA.idle = 0; Zvuk.efekat('klik'); }
    if (IGRA.t > 1.5 && (Ulaz.pritisnut('ok') || Ulaz.pritisnut('turbo'))) { naNaslov(); return; }
    if (Ulaz.ikakav()) IGRA.idle = 0; else IGRA.idle += STEP;
    if (IGRA.idle > KRAJ_POSLE && IGRA.t > KRAJ_POSLE) { naNaslov(); IGRA.idle = DEMO_POSLE - 2; return; }   // pa demo za 2 s
  }
  Ulaz.ocisti();
}

// ---------- šta treba da svira (petlja to šalje zvuku svaki frejm) ----------
function stanjeZvuka() {
  const st = { motor: null, sirena: false, skripa: 0, prasina: 0, muzika: null, tempo: 1, pojacano: false, pauza: false, tisina: false };
  if (IGRA.ekran === 'naslov') { st.muzika = 'naslov'; return st; }
  if (IGRA.ekran === 'kraj') { st.muzika = brojUhapsenih() ? 'kraj' : 'kraj_mol'; return st; }
  if (IGRA.ekran !== 'deonica' || !S) return st;
  if (IGRA.demo) { st.tisina = true; return st; }   // demo je bez zvuka (kao u ostalim igrama)
  const f = S.faza === 'pauza' ? S.pauzaIz : S.faza;
  st.pauza = S.faza === 'pauza';
  st.motor = { v: S.v, menjac: S.menjac, gas: !!(S.kont && S.kont.gas), turbo: S.turboT > 0 };
  st.sirena = S.sirena && ['voznja', 'zaustavljanje', 'hapsenje', 'predjena'].includes(f);
  if (f === 'voznja') {
    const sp = S.v / MAXV, sg = segNa(S.pos + PLAYER_DZ), naPutu = Math.abs(S.x) < 1.12;
    st.skripa = naPutu ? clamp(Math.abs(sg.kriv) * sp * sp * 1.8 - 0.45, 0, 1) : 0;
    if (naPutu && S.kont && S.kont.koc && S.v > 90) st.skripa = Math.max(st.skripa, 0.7);
  }
  st.prasina = Math.abs(S.x) > 1.45 && S.v > 5 ? clamp(S.v / 110, 0.2, 1) : 0;
  if (f === 'start') st.muzika = 'brifing';                     // napeta podloga ispod brifinga
  else if (f === 'voznja' || f === 'zaustavljanje') st.muzika = S.dn.muzika;
  else if (f === 'hapsenje') st.muzika = S.pecat ? 'hapsenje' : S.dn.muzika;
  else if (f === 'predjena') st.muzika = 'hapsenje';           // fanfara se odsvira jednom, pa tišina
  else if (f === 'pobegao') st.muzika = S.t > 2.5 ? 'razglednica' : null;
  else if (f === 'nastavak') st.muzika = 'razglednica';
  st.tempo = f === 'voznja' && S.maloVremena ? 1.1 : 1;          // poslednjih 15 s brže
  st.pojacano = f === 'voznja' && S.sirena;                      // džip na vidiku: jači bubanj i bas
  return st;
}

// ---------- crtanje ----------
function prikaziSvet(al) {
  crtajSvet(al);
  O.setTransform(1, 0, 0, 1, 0, 0); O.globalAlpha = 1; O.globalCompositeOperation = 'source-over';
  O.imageSmoothingEnabled = true; O.imageSmoothingQuality = 'low';
  O.drawImage(buf, 0, 0, OW, OH);
  if (PODESAVANJA.crt) {
    bg.globalCompositeOperation = 'copy'; bg.filter = 'blur(1.2px)'; bg.drawImage(buf, 0, 0, 160, 112); bg.filter = 'none';
    O.save(); O.globalAlpha = 0.28; O.globalCompositeOperation = 'lighter'; O.imageSmoothingQuality = 'high'; O.drawImage(blm, 0, 0, OW, OH); O.restore();
  }
}
function zavrsniProlaz() {
  if (PODESAVANJA.crt) O.drawImage(crtSloj, 0, 0);
  if (PODESAVANJA.fps) txt(`${FPS.v} FPS`, 20, OH - 30, 14, '#7dffb0', 'PS', true);
}

function crtajMeta(al) {
  O.setTransform(1, 0, 0, 1, 0, 0);
  if (IGRA.ekran === 'ucitavanje') crtajUcitavanje();
  else if (IGRA.ekran === 'naslov') { prikaziSvet(al); crtajNaslov(); }
  else if (IGRA.ekran === 'kraj') { prikaziSvet(al); crtajKraj(); }
  zavrsniProlaz();
}

// učitavanje sa diska u stilu kućnih računara iz devedesetih (naš izgled, bez tuđih znakova)
function crtajUcitavanje() {
  const t = IGRA.cita ? IGRA.t : 0, p = clamp(t / 3.2, 0, 1);
  O.fillStyle = '#20324e'; O.fillRect(0, 0, OW, OH);
  for (let y = 0; y < OH; y += 8) { O.fillStyle = y % 16 ? '#1c2c46' : '#22365a'; O.fillRect(0, y, OW, 4); }
  // disketa
  const dx = 560, dy = 230;
  O.fillStyle = '#0c0c14'; O.fillRect(dx + 8, dy + 8, 160, 170);
  O.fillStyle = '#2a2a3a'; O.fillRect(dx, dy, 160, 170);
  O.fillStyle = '#a8b0bc'; O.fillRect(dx + 34, dy, 92, 58); O.fillStyle = '#2a2a3a'; O.fillRect(dx + 92 - 6 + Math.sin(t * 9) * 3, dy + 8, 18, 42);
  O.fillStyle = '#f2ead6'; O.fillRect(dx + 18, dy + 82, 124, 80);
  O.fillStyle = '#c42a2a'; O.fillRect(dx + 18, dy + 82, 124, 12);
  O.fillStyle = '#1b1b2a'; O.font = '22px VT'; O.textBaseline = 'top'; O.textAlign = 'center';
  O.fillText('POTERA', dx + 80, dy + 100); O.fillText('DO HORGOŠA', dx + 80, dy + 124); O.textAlign = 'left';
  txt('UNDERGRAND SOFTVER', 640, 140, 40, '#f1e6d0', 'VT', true, 'center');
  txt(!IGRA.cita ? 'UMETNI DISK' : p < 1 ? 'UČITAVAM' + '.'.repeat(1 + Math.floor(t * 3) % 3) : 'GOTOVO', 640, 450, 46, '#ffd34a', 'VT', true, 'center');
  // tačkasti progres i trag
  for (let i = 0; i < 40; i++) { O.fillStyle = i / 40 < p ? '#7dffb0' : '#3a4a6a'; O.fillRect(340 + i * 15, 530, 9, 9); }
  txt(`TRAG ${String(Math.floor(p * 79)).padStart(2, '0')} / 79`, 640, 570, 18, '#9fd3ff', 'PS', true, 'center');
  if (!IGRA.cita) { if (Math.floor(IGRA.t * 2) % 2) txt('PRITISNI BILO KOJI TASTER ILI KLIKNI', 640, 700, 34, '#ffffff', 'VT', true, 'center'); }
  else txt('BILO KOJI TASTER - PRESKOČI', 640, 780, 28, '#9fb0d0', 'VT', true, 'center');
}

const SILUETE = {};
function silueta(ime, sp) {
  if (SILUETE[ime]) return SILUETE[ime];
  const src = sp.lv[0].cv, c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#07040f'; x.fillRect(0, 0, c.width, c.height);
  return (SILUETE[ime] = { cv: c, f: sp.lv[0].f, l: sp.l, t: sp.t });
}
function crtajSiluetu(si, cx, by, vel) { // vel = izlazni piksel po jedinici crteža
  const k = vel / si.f; O.drawImage(si.cv, cx + si.l * vel, by + si.t * vel, si.cv.width * k, si.cv.height * k);
}

function crtajLogo(cy, t) {
  // copper bars iza logoa
  const BOJE = [[255, 80, 60], [255, 170, 40], [255, 220, 90], [120, 220, 255], [200, 90, 255]];
  for (let i = 0; i < 16; i++) {
    const y = cy - 112 + i * 14 + Math.sin(t * 2 + i * 0.5) * 4, c = BOJE[(i + Math.floor(t * 2)) % BOJE.length];
    const gr = O.createLinearGradient(0, y, 0, y + 12);
    gr.addColorStop(0, css(c.map((v) => v * 0.25))); gr.addColorStop(0.5, css(c)); gr.addColorStop(1, css(c.map((v) => v * 0.25)));
    O.globalAlpha = 0.5; O.fillStyle = gr; O.fillRect(0, y, OW, 12); O.globalAlpha = 1;
  }
  O.textAlign = 'center'; O.textBaseline = 'middle';
  for (const [s, y, vel] of [['POTERA', cy - 40, 170], ['DO HORGOŠA', cy + 74, 104]]) {
    O.font = `${vel}px VT`;
    O.lineJoin = 'round'; O.lineWidth = 14; O.strokeStyle = '#07040f'; O.strokeText(s, 640, y + 6);
    O.lineWidth = 8; O.strokeText(s, 640, y);
    const gr = O.createLinearGradient(0, y - vel * 0.35, 0, y + vel * 0.35);
    gr.addColorStop(0, '#fff3a8'); gr.addColorStop(0.45, '#ffc456'); gr.addColorStop(0.55, '#ff8a3a'); gr.addColorStop(1, '#c42a2a');
    O.fillStyle = gr; O.fillText(s, 640, y);
  }
  O.textAlign = 'left'; O.textBaseline = 'top';
}

function crtajNaslov() {
  const t = IGRA.t;
  O.fillStyle = 'rgba(8,6,20,0.45)'; O.fillRect(0, 0, OW, OH);
  crtajLogo(190, t);
  // siluete džipa i policijskog auta pored logoa
  // ista stvarna razmera: džip 1,9 m, policija 1,62 m (crtež policije je u koordinatama makete: sredina 160, dno 214)
  crtajSiluetu(silueta('dzip', dzip(BEGUNCI[0], false)), 175, 318, 3.2);
  crtajSiluetu(silueta('pol', policija()), 1105 - 160 * 3.2 * 0.366, 318 - 214 * 3.2 * 0.366, 3.2 * 0.366);
  if (Math.floor(t * 2) % 2) txt(REPLIKE.ekrani.pritisni, 640, 336, 24, '#ffffff', 'PS', true, 'center');
  // težina: ← → (sadašnja je istaknuta)
  txt('TEŽINA', 400, 372, 30, '#cfc8ff', 'VT', true, 'right');
  REDOSLED_TEZINA.forEach((k, i) => {
    const x = 500 + i * 150, akt = k === tezina();
    if (akt) { O.fillStyle = 'rgba(255,211,74,0.18)'; O.fillRect(x - 66, 368, 132, 36); O.strokeStyle = '#ffd34a'; O.lineWidth = 3; O.strokeRect(x - 66, 368, 132, 36); }
    txt(TEZINE[k].naziv, x, 372, 30, akt ? '#ffd34a' : '#8a84a8', 'VT', true, 'center');
  });
  txt('← →', 880, 372, 30, '#cfc8ff', 'VT', true, 'left');
  // kako se igra
  panel(60, 420, 520, 400, '#9fd3ff');
  txt('KAKO SE IGRA', 84, 436, 36, '#9fd3ff', 'VT', false);
  // tekst se prelama po širini okvira (ništa ne sme da štrči), tasteri i opisi u dve kolone
  const uvod = prelomi('Juri džip begunca autoputem ka Horgošu. Deset udaraca otpozadi ili sa strane i begunac je uhapšen. Imaš 60 sekundi po deonici: četiri deonice, četiri begunca.', 470, '28px VT');
  uvod.forEach((l, i) => txt(l, 84, 482 + i * 30, 28, '#ffffff', 'VT', false));
  const yT = 482 + uvod.length * 30 + 14;
  [['← →', 'težina (ovde, pre igre)'], ['STRELICE / WASD', 'vožnja'], ['SPACE', 'turbo (3 po deonici)'], ['SHIFT', 'menjač LO / HI'], ['ESC', 'pauza i jačina zvuka'], ['M  /  C', 'muzika  /  CRT efekat']]
    .forEach(([k, o], i) => { txt(k, 84, yT + i * 30, 28, '#ffd34a', 'VT', false); txt(o, 300, yT + i * 30, 28, '#cfc8ff', 'VT', false); });
  // rekordi
  panel(700, 420, 520, 400, '#ffd34a');
  txt(`${REPLIKE.ekrani.rekordi} · ${T().naziv}`, 724, 436, 36, '#ffd34a', 'VT', false);
  crtajRekorde(724, 484, 472, -1);
  txt('Igra UnderGRAND radija · undergrandradio.com', 640, 846, 28, '#cfc8ff', 'VT', true, 'center');
}
function panel(x, y, w, h, ivica) { O.fillStyle = 'rgba(10,8,24,0.82)'; O.fillRect(x, y, w, h); O.strokeStyle = ivica; O.lineWidth = 3; O.strokeRect(x, y, w, h); }
function crtajRekorde(x, y, w, istakni) {
  const r = citajRekorde();
  if (!r.length) { txt('Još nema rekorda.', x, y, 30, '#8a84a8', 'VT', false); txt('Budi prvi!', x, y + 34, 30, '#8a84a8', 'VT', false); return; }
  r.forEach((e, i) => {
    const boja = i === istakni ? (Math.floor(IGRA.t * 4) % 2 ? '#ffffff' : '#ffd34a') : i === 0 ? '#ffd34a' : '#ffffff';
    txt(`${String(i + 1).padStart(2, ' ')}.`, x, y + i * 31 + 4, 16, '#9fd3ff', 'PS', false);
    txt(e.i, x + 70, y + i * 31 + 4, 16, boja, 'PS', false);
    txt(`${'★'.repeat(e.u || 0)}`, x + 150, y + i * 31, 26, '#ff7a6a', 'VT', false);
    txt(String(e.s).padStart(7, '0'), x + w, y + i * 31 + 4, 16, boja, 'PS', false, 'right');
  });
}

function crtajKraj() {
  const t = IGRA.t, br = brojUhapsenih();
  O.fillStyle = 'rgba(6,4,16,0.5)'; O.fillRect(0, 0, OW, OH);
  const K = REPLIKE.ekrani.kraj.find((k) => br >= k.min);
  if (IGRA.predao) txt('KRAJ IGRE', 640, 26, 34, '#ff7a6a', 'VT', true, 'center');
  txt(K.naslov, 640, 54, 84, br ? '#ffd34a' : '#ff5a4a', 'VT', true, 'center');
  txt(K.tekst, 640, 142, 34, '#ffffff', 'VT', true, 'center');
  // četiri begunca: portret + pečat
  for (let i = 0; i < 4; i++) {
    const x = 140 + i * 260, y = 204, u = IGRA.uhapseni[i];
    O.fillStyle = 'rgba(10,8,24,0.85)'; O.fillRect(x - 6, y - 6, 132, 132);
    crtajPortret(O, 'b' + (i + 1), x, y, 120);
    if (u == null) { O.fillStyle = 'rgba(10,8,24,0.75)'; O.fillRect(x, y, 120, 120); }
    O.save(); O.translate(x + 60, y + 92); O.rotate(-0.15);
    O.font = '30px VT'; O.textAlign = 'center'; O.textBaseline = 'middle';
    const nat = u === true ? 'UHAPŠEN' : u === false ? 'POBEGAO' : 'NIJE STIGAO';
    O.fillStyle = u === true ? '#e8262a' : '#9a94b8'; O.strokeStyle = O.fillStyle; O.lineWidth = 3;
    const w = O.measureText(nat).width + 14; O.strokeRect(-w / 2, -17, w, 34); O.fillText(nat, 0, 1); O.restore();
    txt(BEGUNCI[i].ime, x + 60, y + 132, 24, '#cfc8ff', 'VT', true, 'center');
  }
  txt(`UHAPŠENO: ${br} OD 4`, 340, 396, 40, '#9fd3ff', 'VT', true, 'center');
  txt('SKOR', 820, 398, 36, '#ffd34a', 'VT', true); txt(String(IGRA.skor).padStart(7, '0'), 940, 402, 28, '#ffffff', 'PS', true);
  // rekordi / unos
  panel(340, 460, 600, 360, '#ffd34a');
  if (IGRA.unos) {
    const U = IGRA.unos;
    txt(REPLIKE.ekrani.unesiInicijale, 640, 480, 44, '#ffd34a', 'VT', false, 'center');
    txt('Ušao si među 10 najboljih vozača!', 640, 532, 30, '#ffffff', 'VT', false, 'center');
    for (let i = 0; i < 3; i++) {
      const x = 520 + i * 90, akt = i === U.i;
      O.fillStyle = akt ? '#2a2440' : '#1a1438'; O.fillRect(x, 590, 70, 90); O.strokeStyle = akt ? '#ffd34a' : '#5a5480'; O.lineWidth = 4; O.strokeRect(x, 590, 70, 90);
      txt(U.slova[i], x + 35, 612, 40, akt && Math.floor(IGRA.t * 3) % 2 ? '#ffffff' : '#ffd34a', 'PS', false, 'center');
    }
    txt('KUCAJ SLOVA ILI ↑↓ ←→ · ENTER POTVRDI', 640, 720, 28, '#cfc8ff', 'VT', false, 'center');
  } else {
    txt(`${REPLIKE.ekrani.rekordi} · ${T().naziv}`, 364, 476, 36, '#ffd34a', 'VT', false);
    crtajRekorde(364, 522, 552, IGRA.mesto);
    if (Math.floor(IGRA.t * 2) % 2) txt('K - KARTICA ZA DELJENJE · SPACE - NASLOVNI EKRAN', 640, 838, 28, '#ffffff', 'VT', true, 'center');
    if (IGRA.karticaT > 0 && IGRA.t - IGRA.karticaT < 3) txt('Kartica je sačuvana (potera-do-horgosa.png)', 640, 866, 26, '#7dffb0', 'VT', true, 'center');
  }
}

// ---------- kartica za deljenje 1080×1080 (PNG) ----------
function napraviKarticu() {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
  const x = c.getContext('2d'), br = brojUhapsenih();
  const nebo = DEONICE[2].nebo.map(hexRgb);
  const gr = x.createLinearGradient(0, 0, 0, 640); nebo.forEach((b, i) => gr.addColorStop(i / (nebo.length - 1), css(b)));
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 640);
  // retro sunce sa prugama
  const sg = x.createLinearGradient(0, 380, 0, 640); sg.addColorStop(0, '#fff3a8'); sg.addColorStop(0.5, '#ffc456'); sg.addColorStop(1, '#ff6a3a');
  x.fillStyle = sg; x.beginPath(); x.arc(540, 640, 250, Math.PI, 0); x.fill();
  for (let k = 0; k < 7; k++) { x.fillStyle = css(nebo[nebo.length - 1 - Math.min(k, 3)]); x.fillRect(280, 470 + k * 26, 520, 4 + k * 2.5); }
  // ravnica i put u perspektivi
  x.fillStyle = '#2a1232'; x.fillRect(0, 630, 1080, 14);
  const zg = x.createLinearGradient(0, 640, 0, 1080); zg.addColorStop(0, '#c9a24a'); zg.addColorStop(1, '#6a4a22'); x.fillStyle = zg; x.fillRect(0, 640, 1080, 440);
  x.fillStyle = '#4a4a5c'; x.beginPath(); x.moveTo(530, 640); x.lineTo(550, 640); x.lineTo(900, 1080); x.lineTo(180, 1080); x.fill();
  x.fillStyle = '#f2f2f2'; for (let k = 0; k < 8; k++) { const t0 = k / 8, t1 = t0 + 0.05, y0 = 640 + t0 * t0 * 440, y1 = 640 + t1 * t1 * 440; x.fillRect(538, y0, 4 + t0 * 14, y1 - y0); }
  // natpis
  x.textAlign = 'center'; x.textBaseline = 'middle';
  for (const [s, y, v] of [['POTERA', 120, 170], ['DO HORGOŠA', 240, 110]]) {
    x.font = `${v}px VT`; x.lineJoin = 'round'; x.lineWidth = 16; x.strokeStyle = '#07040f'; x.strokeText(s, 540, y);
    const lg = x.createLinearGradient(0, y - v * 0.35, 0, y + v * 0.35); lg.addColorStop(0, '#fff3a8'); lg.addColorStop(0.5, '#ffb04a'); lg.addColorStop(1, '#c42a2a');
    x.fillStyle = lg; x.fillText(s, 540, y);
  }
  // begunci
  for (let i = 0; i < 4; i++) {
    const bx = 75 + i * 240, by = 690, u = IGRA.uhapseni[i];
    x.fillStyle = '#f4ead2'; x.fillRect(bx - 10, by - 10, 210, 250);
    crtajPortret(x, 'b' + (i + 1), bx, by, 190);
    x.save(); x.translate(bx + 95, by + 150); x.rotate(-0.15); x.font = '40px VT';
    const nat = u === true ? 'UHAPŠEN' : u === false ? 'POBEGAO' : '?';
    x.fillStyle = u === true ? '#e8262a' : '#6a6480'; x.strokeStyle = x.fillStyle; x.lineWidth = 4;
    const w = x.measureText(nat).width + 18; x.strokeRect(-w / 2, -24, w, 48); x.fillText(nat, 0, 2); x.restore();
    x.fillStyle = '#2a2440'; x.font = '26px VT'; x.fillText(BEGUNCI[i].sifra || BEGUNCI[i].ime, bx + 95, by + 218);
  }
  const tekst = REPLIKE.kartica.tekst.replace('{broj}', br).replace('{skor}', IGRA.skor);
  x.fillStyle = 'rgba(8,6,20,0.8)'; x.fillRect(0, 960, 1080, 120);
  x.fillStyle = '#ffffff'; x.font = '50px VT'; x.fillText(tekst, 540, 996);
  x.fillStyle = '#ffd34a'; x.font = '36px VT'; x.fillText(`Težina: ${T().naziv} · ${REPLIKE.kartica.podnaslov} · undergrandradio.com`, 540, 1048);
  c.toBlob((b) => {
    if (!b) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'potera-do-horgosa.png';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    IGRA.karticaT = IGRA.t;
  }, 'image/png');
}

// ---------- portreti begunaca 1, 2, 4 (24×24, izmišljeni, po opisu iz begunci.js) ----------
Object.assign(PORTRETI, {
  b1: { // Direktor Fasciklić: proseda kosa začešljana preko ćele, debele naočare, sivo odelo, kravata sa šarom
    px: ['........................', '.......hhhhhhhhhh.......', '.....hhhshhhshhhshh.....', '....hhsssssssssssshh....', '....hssssssssssssssh....', '...hssssssssssssssssh...', '...sggggggssssggggggs...', '...sgweewgsggsgweewgs...', '...sggggggssssggggggs...', '...sssssssnnsssssssss...', '...ssssssssssssssssss...', '....ssssslllllsssssss...', '....ssssssssssssssss....', '.....ssssssssssssss.....', '.......ssssssssss.......', '.....ccccbbttbbcccc.....', '...ccccccbbtdbbcccccc...', '..cccccccbbttbbccccccc..', '.ccccccccbbtdbbcccccccc.', '.cccccccccbttbccccccccc.', '.ccccccccccdtcccccccccc.', '.ccccccccccttcccccccccc.', '.ccccccccccttcccccccccc.', '.ccccccccccccccccccccc..'],
    c: { h: '#a8a8b0', s: '#e8b090', g: '#141414', w: '#cfe0f0', e: '#223', n: '#c8906a', l: '#8a3a3a', c: '#5a5e68', b: '#e9edf2', t: '#a03030', d: '#f0c040' },
  },
  b2: { // Savetnik Zasvestić: zalizana kosa, preplanuo, sunčane naočare na čelu, otkopčana košulja, zlatni lanac
    px: ['........................', '.......hhhhhhhhhh.......', '.....hhhHHhhhhhhhh......', '....hhhhhhhhhhhhhhhh....', '....hoooooooOooooooh....', '....hssssssssssssssh....', '...hsssssssssssssssh....', '...sssweessssweessss....', '...sssssssssssssssss....', '...ssssssssnnsssssss....', '...ssssssssssssssss.....', '....sssslllllllsss......', '....ssssssssssssss......', '.....ssssssssssss.......', '.......ssssssss.........', '.....pppsssssspp........', '...ppppppssssspppppp....', '..pppppppszzzspppppppp..', '.ppppppppsszzsspppppppp.', '.pppppppppszzspppppppppp', '.ppppppppppsspppppppppp.', '.pppppppppppppppppppppp.', '.pppppppppppppppppppppp.', '.pppppppppppppppppppppp.'],
    c: { h: '#1a1008', H: '#6a5a4a', o: '#111', O: '#6a8ac0', s: '#c88a5a', w: '#ffffff', e: '#222', n: '#a86a40', l: '#7a2a2a', p: '#d8508a', z: '#ffd34a' },
  },
  b4: { // Gradonačelnik Neznalić: uplašen pogled, kosa na razdeljak, šal, jakna preko odela, mobilni na uvetu
    px: ['........................', '.......hhhhhhhhhh.......', '.....hhhhhhhh.hhhhh.....', '....hhhhhhhhs.hhhhhh....', '....hhssssssssssssshh...', '....hsyyysssssssyyysh...', '...hssssssssssssssssh...', '...sswwesssssewwssssMm..', '...sswwwssssswwwsssssMm.', '...ssssssssnnssssssssmm.', '...sssssssssssssssssmm..', '....sssssslllsssssssmm..', '....ssssssslllssssssm...', '.....ssssssssssssss.....', '......ffffffffffff......', '.....fFfFfFfFfFfFff.....', '...jjjffffffffffffjjj...', '..jjjjjjccffffccjjjjjj..', '.jjjjjjjccbffbccjjjjjjj.', '.jjjjjjjccbbbbccjjjjjjj.', '.jjjjjjjjccbbccjjjjjjjj.', '.jjjjjjjjjccccjjjjjjjjj.', '.jjjjjjjjjjjjjjjjjjjjjj.', '.jjjjjjjjjjjjjjjjjjjjjj.'],
    c: { h: '#4a3020', s: '#efc4a0', y: '#3a2010', w: '#ffffff', e: '#222', n: '#c8946a', l: '#6a2020', M: '#6ac0ff', m: '#222', f: '#c83a2a', F: '#f0d0a0', j: '#2a3a2a', c: '#3a3a48', b: '#e9edf2' },
  },
});

// ---------- pokretanje: fontovi, pa učitavanje sa diska ----------
const FONTOVI = ['16px PS', '16px VT'].flatMap((f) => [document.fonts.load(f, 'A0'), document.fonts.load(f, 'ŠĆČŽĐšćčžđ')]);
Promise.all(FONTOVI).catch(() => {}).then(() => {
  // ?deonica=N: odmah na tu deonicu (probe); inače učitavanje → naslovni ekran
  if (/[?&]deonica=\d/.test(location.search)) novaIgra(); else { IGRA.ekran = 'ucitavanje'; IGRA.t = 0; }
  window.POTERA = { get S() { return S; }, IGRA, novaDeonica, novaIgra, naNaslov, zavrsiIgru, pocniDemo };
  requestAnimationFrame((t) => { pre = t; requestAnimationFrame(petlja); });
});
