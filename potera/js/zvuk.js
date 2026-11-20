// UnderGRAND Potera do Horgoša - zvuk: sve se sintetizuje Web Audio API-jem, bez fajlova.
// Efekti (motor, sirena, škripa guma, prašina, sudar, udarac, turbo...) i muzika u stilu Amiga trekera
// (4 kanala: bas, bubanj, akordi, melodija), drugačija za svaku deonicu. Pesme su NAŠE - ne kopirati prave.
// Pregledač pušta zvuk tek posle prvog pritiska tastera ili klika (tada se pravi AudioContext).
'use strict';

const Zvuk = (() => {
  let AC = null, izlaz, busM, busE, ehoUlaz, sumBuf;
  let motor = null, sir = null, skr = null, pra = null;

  // ---------- osnova ----------
  function gradi(ctx, stalni) {
    AC = ctx;
    const komp = ctx.createDynamicsCompressor(); komp.threshold.value = -16; komp.ratio.value = 4; komp.connect(ctx.destination);
    izlaz = ctx.createGain(); izlaz.gain.value = 0.9; izlaz.connect(komp);
    busM = ctx.createGain(); busM.gain.value = 0; busM.connect(izlaz);
    busE = ctx.createGain(); busE.gain.value = 0; busE.connect(izlaz);
    // eho na melodiji (kao u trekerima): kašnjenje 3/16 takta sa povratnom spregom
    ehoUlaz = ctx.createGain(); ehoUlaz.gain.value = 0.32;
    const d = ctx.createDelay(1); d.delayTime.value = 0.33;
    const fb = ctx.createGain(); fb.gain.value = 0.3;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    ehoUlaz.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(busM);
    sumBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const ch = sumBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    if (stalni) gradiStalne(ctx);
  }

  // motor, sirena, škripa i prašina sviraju stalno, menja im se samo jačina i visina
  function gradiStalne(ctx) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.Q.value = 3;
    const g = ctx.createGain(); g.gain.value = 0; lp.connect(g); g.connect(busE);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator();
    o1.type = 'sawtooth'; o2.type = 'sawtooth'; o2.detune.value = 18; o3.type = 'square';
    [o1, o2, o3].forEach((o) => { o.frequency.value = 40; o.connect(lp); o.start(); });
    motor = { o1, o2, o3, lp, g };

    const so = ctx.createOscillator(); so.type = 'square';
    const sl = ctx.createBiquadFilter(); sl.type = 'lowpass'; sl.frequency.value = 2200;
    const sg = ctx.createGain(); sg.gain.value = 0; so.connect(sl); sl.connect(sg); sg.connect(busE); so.start();
    sir = { o: so, g: sg };

    const sum = (tip, f, q) => {
      const src = ctx.createBufferSource(); src.buffer = sumBuf; src.loop = true;
      const fi = ctx.createBiquadFilter(); fi.type = tip; fi.frequency.value = f; fi.Q.value = q;
      const gg = ctx.createGain(); gg.gain.value = 0; src.connect(fi); fi.connect(gg); gg.connect(busE); src.start();
      return { g: gg, f: fi };
    };
    skr = sum('bandpass', 2300, 5);
    pra = sum('lowpass', 420, 1);
  }

  function otkljucaj() {
    try {
      if (!AC) { const K = window.AudioContext || window.webkitAudioContext; if (!K) return; gradi(new K(), true); }
      if (AC.state === 'suspended') AC.resume();
    } catch (e) { /* bez zvuka */ }
  }
  addEventListener('keydown', otkljucaj, true);
  addEventListener('pointerdown', otkljucaj, true);

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const IMENA = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function nota(s) { // "C#5", "Bb4" → MIDI
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) return null;
    return 12 * (+m[3] + 1) + IMENA[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  const KVAL = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10] };
  function akord(s) { const m = /^([A-G][#b]?)(.*)$/.exec(s); return { koren: nota(m[1] + '2'), tonovi: KVAL[m[2]] || KVAL[''] }; }

  // ---------- građa zvukova ----------
  function env(g, t, a, vrh, d, kraj) {
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vrh, t + a);
    g.gain.setTargetAtTime(0.0001, t + a, d); if (kraj) g.gain.setValueAtTime(0, kraj);
  }
  function osc(tip, f, t, dur, vol, bus, opc) {
    const o = AC.createOscillator(); o.type = tip; o.frequency.setValueAtTime(f, t);
    if (opc && opc.do) o.frequency.exponentialRampToValueAtTime(Math.max(20, opc.do), t + (opc.za || dur));
    if (opc && opc.detune) o.detune.value = opc.detune;
    const g = AC.createGain(); env(g, t, (opc && opc.a) || 0.004, vol, (opc && opc.d) || dur / 3, t + dur + 0.05);
    let cvor = o;
    if (opc && opc.lp) { const f2 = AC.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.setValueAtTime(opc.lp, t); if (opc.lpDo) f2.frequency.exponentialRampToValueAtTime(opc.lpDo, t + dur); f2.Q.value = opc.q || 1; o.connect(f2); cvor = f2; }
    cvor.connect(g); g.connect(bus); if (opc && opc.eho) g.connect(ehoUlaz);
    o.start(t); o.stop(t + dur + 0.08);
    return o;
  }
  function sum(t, dur, vol, tip, f, bus, opc) {
    const s = AC.createBufferSource(); s.buffer = sumBuf; s.playbackRate.value = (opc && opc.brz) || 1;
    const fi = AC.createBiquadFilter(); fi.type = tip; fi.frequency.setValueAtTime(f, t); fi.Q.value = (opc && opc.q) || 1;
    if (opc && opc.fDo) fi.frequency.exponentialRampToValueAtTime(opc.fDo, t + dur);
    const g = AC.createGain(); env(g, t, (opc && opc.a) || 0.002, vol, (opc && opc.d) || dur / 3, t + dur + 0.05);
    s.connect(fi); fi.connect(g); g.connect(bus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.08);
  }

  // ---------- efekti ----------
  const EFEKTI = {
    sudar(t) { sum(t, 0.4, 0.7, 'lowpass', 900, busE, { d: 0.12 }); osc('sine', 95, t, 0.3, 0.7, busE, { do: 38, d: 0.1 }); },
    okrzni(t) { sum(t, 0.16, 0.35, 'bandpass', 1600, busE, { q: 2, d: 0.05 }); },
    udarac(t) {
      osc('square', 220, t, 0.3, 0.22, busE, { d: 0.08, lp: 3000 }); osc('square', 331, t, 0.3, 0.18, busE, { d: 0.07, lp: 3000 });
      sum(t, 0.12, 0.4, 'highpass', 3000, busE, { d: 0.03 }); osc('sine', 110, t, 0.2, 0.6, busE, { do: 45, d: 0.07 });
    },
    turbo(t) { sum(t, 0.7, 0.35, 'bandpass', 400, busE, { fDo: 3200, q: 3, a: 0.05, d: 0.3 }); osc('sawtooth', 70, t, 0.7, 0.18, busE, { do: 180, lp: 900, a: 0.05, d: 0.3 }); },
    predmet(t) { osc('sine', 130, t, 0.18, 0.55, busE, { do: 55, d: 0.06 }); sum(t, 0.12, 0.3, 'lowpass', 700, busE, { d: 0.04 }); },
    novac(t) { [1320, 1568, 2093].forEach((f, i) => osc('triangle', f, t + i * 0.05, 0.12, 0.18, busE, { d: 0.05 })); },
    novcanica(t) { osc('triangle', 1046, t, 0.05, 0.16, busE, { d: 0.03 }); osc('triangle', 1568, t + 0.05, 0.1, 0.16, busE, { d: 0.05 }); },
    pecat(t) { osc('sine', 85, t, 0.5, 0.9, busE, { do: 30, d: 0.18 }); sum(t, 0.25, 0.6, 'lowpass', 600, busE, { d: 0.08 }); },
    menjac(t) { osc('square', 2200, t, 0.015, 0.12, busE, { d: 0.006 }); osc('sine', 140, t, 0.05, 0.3, busE, { do: 80, d: 0.02 }); },
    klik(t) { osc('square', 1300, t, 0.03, 0.12, busE, { d: 0.01 }); },
    radio(t) { sum(t, 0.09, 0.18, 'bandpass', 1800, busE, { q: 4, d: 0.04 }); osc('sine', 1400, t + 0.07, 0.07, 0.12, busE, { d: 0.03 }); },
    start(t) { osc('sine', 880, t, 0.09, 0.2, busE, { d: 0.05 }); osc('sine', 1320, t + 0.12, 0.14, 0.2, busE, { d: 0.07 }); },
    tik(t) { sum(t, 0.014, 0.14, 'highpass', 4200, busE, { d: 0.004, brz: 1.5 }); },
    disk(t) { osc('square', 70, t, 0.025, 0.3, busE, { d: 0.01, lp: 500 }); sum(t, 0.02, 0.2, 'bandpass', 1200, busE, { d: 0.006 }); },
    // pogon diska dok čita (zujanje motora) - 3,5 s
    pogon(t) { osc('sawtooth', 48, t, 3.5, 0.14, busE, { lp: 260, a: 0.15, d: 2.5 }); sum(t, 3.5, 0.05, 'bandpass', 900, busE, { q: 2, a: 0.2, d: 2.5 }); },
    // džingl kad se učita: UnderGRAND akord naviše
    dzingl(t) {
      [72, 76, 79, 84].forEach((m, i) => { const f = 440 * Math.pow(2, (m - 69) / 12); osc('square', f, t + i * 0.09, i === 3 ? 0.7 : 0.16, 0.13, busE, { lp: 3000, d: i === 3 ? 0.25 : 0.06 }); osc('triangle', f * 2, t + i * 0.09, 0.3, 0.06, busE, { d: 0.1 }); });
      osc('sawtooth', 65.4, t + 0.27, 0.7, 0.2, busE, { lp: 600, d: 0.3 });
    },
    // sirena "uuu-iii" na polasku i motor koji se vrti u prazno
    whoop(t) { const o = osc('square', 520, t, 1.1, 0.12, busE, { lp: 2400, a: 0.05, d: 0.6 }); o.frequency.linearRampToValueAtTime(1150, t + 0.45); o.frequency.linearRampToValueAtTime(600, t + 1.05); },
    rev(t) { const o = osc('sawtooth', 55, t, 1.0, 0.22, busE, { lp: 700, a: 0.03, d: 0.5 }); o.frequency.linearRampToValueAtTime(190, t + 0.35); o.frequency.linearRampToValueAtTime(80, t + 0.95); },
  };
  function efekat(ime) {
    if (!AC || AC.state !== 'running' || !EFEKTI[ime]) return;
    try { EFEKTI[ime](AC.currentTime + 0.005); } catch (e) { /* tiho */ }
  }

  // ---------- instrumenti muzike ----------
  const vel = { bas: 0.30, stab: 0.05, pad: 0.035, lead: 0.11 };
  function bas(t, f, dur, jac) { osc('sawtooth', f, t, dur, vel.bas * (jac || 1), busM, { lp: 1600, lpDo: 260, q: 5, d: Math.max(0.05, dur / 2) }); }
  function stab(t, fs, dur) { fs.forEach((f) => { osc('square', f, t, dur, vel.stab, busM, { lp: 2000, lpDo: 700, detune: -7, d: dur / 2 }); osc('square', f, t, dur, vel.stab, busM, { lp: 2000, lpDo: 700, detune: 7, d: dur / 2 }); }); }
  function pad(t, fs, dur, mek) { fs.forEach((f) => { osc(mek ? 'sine' : 'triangle', f, t, dur, vel.pad, busM, { a: mek ? 0.02 : 0.15, d: dur * 0.6 }); osc('sawtooth', f, t, dur, vel.pad * 0.4, busM, { a: 0.2, d: dur * 0.6, lp: 1200, detune: 9 }); }); }
  function lead(t, f, dur, inst) {
    const v = vel.lead;
    if (inst === 'tambura') { // tremolo trzanje kao na tamburici
      const k = 0.055; for (let x = 0; x < dur - 0.01; x += k) osc('triangle', f, t + x, k * 0.9, v * (x === 0 ? 1.1 : 0.75), busM, { d: 0.03, eho: x === 0 });
      osc('square', f * 2, t, Math.min(dur, 0.08), v * 0.25, busM, { d: 0.02, lp: 3000 });
      return;
    }
    if (inst === 'harmonika') {
      [-9, 9].forEach((dt) => { const o = osc('sawtooth', f, t, dur, v * 0.55, busM, { a: 0.04, d: dur * 0.7, lp: 1700, q: 2, detune: dt }); vibrato(o, t, 5.5, 4); });
      return;
    }
    if (inst === 'rodos') { osc('sine', f, t, dur, v * 0.9, busM, { a: 0.01, d: dur * 0.5, eho: true }); osc('sine', f * 2, t, dur, v * 0.25, busM, { a: 0.005, d: 0.08 }); return; }
    if (inst === 'hor') { [-12, 12].forEach((dt) => { const o = osc('sawtooth', f, t, dur, v * 0.45, busM, { a: 0.05, d: dur * 0.8, lp: 1500, detune: dt, eho: true }); vibrato(o, t, 4.5, 6); }); return; }
    if (inst === 'testera') { const o = osc('sawtooth', f, t, dur, v * 0.8, busM, { lp: 3200, lpDo: 1400, d: dur * 0.6, eho: true }); vibrato(o, t + 0.12, 6, 12); return; }
    if (inst === 'truba') { osc('sawtooth', f, t, dur, v, busM, { lp: 600, lpDo: 2600, a: 0.03, d: dur * 0.8 }); osc('square', f, t, dur, v * 0.4, busM, { lp: 1800, a: 0.03, d: dur * 0.8, detune: 6 }); return; }
    const o = osc('square', f, t, dur, v * 0.8, busM, { lp: 2600, d: dur * 0.7, eho: true }); vibrato(o, t + 0.1, 5.5, 10);
  }
  function vibrato(o, t, brz, cent) {
    const l = AC.createOscillator(), g = AC.createGain(); l.frequency.value = brz; g.gain.value = cent;
    l.connect(g); g.connect(o.detune); l.start(t); l.stop(t + 4);
  }
  function kick(t, j) { osc('sine', 150, t, 0.16, 0.85 * (j || 1), busM, { do: 42, za: 0.12, d: 0.06 }); }
  function snare(t, j) { sum(t, 0.14, 0.38 * (j || 1), 'highpass', 1400, busM, { d: 0.045 }); osc('triangle', 190, t, 0.08, 0.25 * (j || 1), busM, { d: 0.03 }); }
  function hat(t, otv, j) { sum(t, otv ? 0.16 : 0.035, (otv ? 0.12 : 0.09) * (j || 1), 'highpass', 7200, busM, { d: otv ? 0.06 : 0.012, brz: 1.3 }); }
  function cinela(t) { sum(t, 1.2, 0.16, 'highpass', 5000, busM, { d: 0.5 }); }

  // ---------- pesme (naše) ----------
  // Takt = 16 šesnaestina. akordi: jedan po taktu. bas: 16 znakova (1 3 5 7 8 = ton akorda, . = drži, - = pauza)
  // ili 16 nota razdvojenih razmakom. bubanj: k/s/h niske od 16 (x udar, o otvoren hat, c činela).
  // akordi u ritmu (stab): x = kratko, p = drži ceo takt, a = arpeđo. mel: 16 nota/./- po taktu.
  const PESME = {
    naslov: { bpm: 132, inst: 'kvadrat', bas: '1.18.1.5.1.18.5.', stab: 'x.....x...x.....',
      bubanj: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      delovi: {
        A: { akordi: ['Am', 'F', 'C', 'G'], mel: [
          'A4 . . . C5 . E5 . A5 . . . G5 . E5 .', 'F5 . . . E5 . C5 . A4 . . . C5 . . .',
          'G4 . . . C5 . E5 . G5 . . . F5 . E5 .', 'D5 . . . B4 . . . G4 . . . - - - -'] },
        B: { akordi: ['Dm', 'Am', 'E', 'E'], mel: [
          'D5 . . . F5 . A5 . D6 . . . C6 . A5 .', 'C6 . . . B5 . A5 . E5 . . . - - - -',
          'G#5 . . . B5 . . . E6 . . . D6 . B5 .', 'G#5 . . . . . . . E5 . . . - - - -'] },
      }, red: ['A', 'A', 'B', 'A'] },

    // deonica 1: noć, grad - novosadski novi talas: bas vodi, hladni "hor" iznad
    noc_grad: { bpm: 145, inst: 'hor', stab: 'p...............',
      bubanj: { k: 'x...x...x...x...', s: '....x.......x...', h: '..o...o...o...o.' },
      delovi: {
        A: { akordi: ['Em', 'C', 'D', 'Bm'], bas: [
          'E2 . E3 . B2 . E2 . G2 . F#2 . E2 . D2 .', 'C3 . C3 . G2 . C3 . E3 . D3 . C3 . B2 .',
          'D3 . D3 . A2 . D3 . F#3 . E3 . D3 . C#3 .', 'B2 . B2 . F#2 . B2 . D3 . C#3 . B2 . A2 .'], mel: [
          'B4 . . . . . . . G4 . . . A4 . . .', 'G4 . . . E4 . . . . . . . - - - -',
          'F#4 . . . A4 . . . D5 . . . C#5 . . .', 'B4 . . . . . . . . . . . - - - -'] },
        B: { akordi: ['Em', 'C', 'G', 'D'], bas: [
          'E2 . E3 . B2 . E2 . G2 . F#2 . E2 . D2 .', 'C3 . C3 . G2 . C3 . E3 . D3 . C3 . B2 .',
          'G2 . G2 . D3 . G2 . B2 . A2 . G2 . F#2 .', 'D3 . D3 . A2 . D3 . F#3 . E3 . D3 . C#3 .'], mel: [
          'E5 . D5 . B4 . . . G4 . A4 . B4 . . .', 'C5 . B4 . G4 . . . E4 . . . - - - -',
          'D5 . . . B4 . D5 . G5 . . . F#5 . . .', 'F#5 . . . E5 . D5 . A4 . . . - - - -'] },
      }, red: ['A', 'A', 'B', 'B'] },

    // deonica 2: zora - svetli synth-pop, arpeđo se penje kao sunce
    zora: { bpm: 128, inst: 'kvadrat', bas: '1.8.1.8.1.8.1.8.', stab: 'aaaaaaaaaaaaaaaa',
      bubanj: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      delovi: {
        A: { akordi: ['C', 'G', 'Am', 'F'], mel: [
          'E5 . . . G5 . . . C6 . . . B5 . G5 .', 'D5 . . . . . . . B4 . . . - - - -',
          'C5 . . . E5 . . . A5 . . . G5 . E5 .', 'F5 . . . . . E5 . C5 . . . - - - -'] },
        B: { akordi: ['F', 'G', 'Em', 'Am'], mel: [
          'A5 . . . G5 . F5 . C5 . . . F5 . . .', 'G5 . . . F5 . D5 . B4 . . . - - - -',
          'G5 . . . E5 . . . B5 . . . A5 . G5 .', 'A5 . . . . . . . E5 . . . - - - -'] },
      }, red: ['A', 'A', 'B', 'A'] },

    // deonica 3: Bačka ravnica - synthwave, pa upad čardaša na tamburici koji ubrzava
    ravnica: { bpm: 138, inst: 'kvadrat', bas: '1.1.8.1.1.1.8.1.', stab: 'p...............',
      bubanj: { k: 'x...x...x...x...', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx' },
      delovi: {
        A: { akordi: ['Am', 'Am', 'F', 'G'], mel: [
          'E5 . . . . . A4 . C5 . E5 . . . D5 .', 'C5 . . . . . . . A4 . . . - - - -',
          'F5 . . . E5 . C5 . A4 . . . C5 . D5 .', 'E5 . . . D5 . . . B4 . . . G4 . . .'] },
        B: { akordi: ['Dm', 'Am', 'F', 'E'], mel: [
          'F5 . . . A5 . . . D6 . . . C6 . A5 .', 'E5 . . . . . . . C5 . . . - - - -',
          'C6 . . . A5 . F5 . C5 . . . F5 . . .', 'E5 . . . G#5 . . . B5 . . . - - - -'] },
        C: { bpm: 150, inst: 'tambura', bas: '1...5...1...5...', stab: '..x...x...x...x.',
          bubanj: { k: 'x.......x.......', s: '....x.......x...', h: '................' },
          akordi: ['Dm', 'Dm', 'A7', 'Dm'], mel: [
          'D5 E5 F5 G5 A5 . A5 . A5 . . . G5 F5 E5 D5', 'F5 . F5 . E5 . E5 . D5 . . . - - - -',
          'E5 F5 G5 A5 Bb5 . Bb5 . A5 . G5 . F5 . E5 .', 'D5 . A4 . D5 . . . - - - - - - - -'] },
      }, red: ['A', 'B', 'A', 'C', 'C+', 'B'] },

    // deonica 4: noć, granica - najbrža, breakbeat i testera
    granica: { bpm: 165, inst: 'testera', bas: '1.1.1.1.1.1.1.8.', stab: 'x..x..x...x..x..',
      bubanj: { k: 'x.....x.x.....x.', s: '....x.......x..x', h: 'xxxxxxxxxxxxxxxx' },
      delovi: {
        A: { akordi: ['Dm', 'Bb', 'C', 'A'], mel: [
          'D5 . D5 . F5 . D5 . A5 . . . G5 . F5 .', 'F5 . . . D5 . . . Bb4 . . . - - - -',
          'E5 . E5 . G5 . E5 . C6 . . . Bb5 . G5 .', 'A5 . . . . . . . C#6 . . . - - - -'] },
        B: { akordi: ['Gm', 'Dm', 'Bb', 'A'], mel: [
          'G5 . . . Bb5 . . . D6 . . . C6 . Bb5 .', 'A5 . . . F5 . . . D5 . . . - - - -',
          'F5 . G5 . A5 . Bb5 . D6 . . . C6 . . .', 'C#6 . . . A5 . . . E5 . . . - - - -'] },
      }, red: ['A', 'A', 'B', 'A'] },

    // brifing: napeta podloga ispod dispečerkinog teksta (tiha, kao radio-veza)
    brifing: { bpm: 110, inst: 'hor', bas: '1.1.1.1.1.1.1.1.', stab: 'p...............', tiho: 0.6,
      bubanj: { k: 'x.......x.......', s: '................', h: 'x.x.x.x.x.x.x.x.' },
      delovi: { A: { akordi: ['Am', 'Am', 'F', 'E'], mel: [
        'E5 . . . . . . . - - - - - - - -', 'C5 . . . B4 . . . A4 . . . - - - -',
        'A4 . . . C5 . . . F5 . . . E5 . . .', 'E5 . . . . . . . G#4 . . . - - - -'] } }, red: ['A'] },

    // hapšenje: kratka fanfara (svira jednom)
    hapsenje: { bpm: 120, inst: 'truba', petlja: false, bas: '1...............', stab: 'x.......x.......',
      bubanj: { k: 'x.......x.......', s: '................', h: 'c...............' },
      delovi: { A: { akordi: ['C', 'C'], mel: ['G4 . C5 . E5 . G5 . . . E5 . G5 . . .', 'C6 . . . . . . . . . . . . . . .'],
        stab: 'x.......x.......' } }, red: ['A'] },

    // razglednica: ofucana hotelska "lift muzika" (Dubai, Beč, Carigrad, Budimpešta)
    razglednica: { bpm: 100, inst: 'rodos', bas: '1.......5.......', stab: 'p...............',
      bubanj: { k: 'x.......x.......', s: '....x.......x...', h: 'x..x..x.x..x..x.' }, tiho: 0.5,
      delovi: { A: { akordi: ['Bbmaj7', 'Gm7', 'Cm7', 'F7'], mel: [
        'D5 . . . . . F5 . . . . . D5 . . .', 'Bb4 . . . . . . . - - - - - - - -',
        'Eb5 . . . . . G5 . . . . . Eb5 . . .', 'C5 . . . . . . . A4 . . . - - - -'] } }, red: ['A'] },

    // kraj (bar jedan uhapšen): spora, pobednička tema
    kraj: { bpm: 92, inst: 'kvadrat', bas: '1.......5.......', stab: 'p...............',
      bubanj: { k: 'x.......x.......', s: '........x.......', h: 'x...x...x...x...' },
      delovi: { A: { akordi: ['C', 'F', 'G', 'C'], mel: [
        'E5 . . . G5 . . . C6 . . . . . . .', 'A5 . . . G5 . F5 . A5 . . . . . . .',
        'G5 . . . F5 . E5 . D5 . . . B4 . . .', 'C5 . . . . . . . . . . . - - - -'] } }, red: ['A'] },

    // kraj (svi pobegli): tema u molu, na harmonici
    kraj_mol: { bpm: 84, inst: 'harmonika', bas: '1.......5.......', stab: 'p...............',
      bubanj: { k: 'x...............', s: '................', h: '................' },
      delovi: { A: { akordi: ['Am', 'Dm', 'E', 'Am'], mel: [
        'E5 . . . . . A4 . C5 . . . B4 . A4 .', 'F5 . . . . . D5 . A4 . . . - - - -',
        'G#4 . . . B4 . . . E5 . . . D5 . B4 .', 'A4 . . . . . . . . . . . - - - -'] } }, red: ['A'] },
  };
  // "C+" = isti čardaš, još brži
  PESME.ravnica.delovi['C+'] = Object.assign({}, PESME.ravnica.delovi.C, { bpm: 162 });

  // pripremi takte: razbij niske u tokene jednom
  const tokeni = (x) => (Array.isArray(x) ? x : [x]).map((b) => (b.includes(' ') ? b.trim().split(/\s+/) : b.split('')));
  for (const p of Object.values(PESME)) for (const d of Object.values(p.delovi)) {
    d._mel = tokeni(d.mel); d._bas = tokeni(d.bas || p.bas); d._akordi = d.akordi.map(akord);
  }

  // ---------- sekvencer (gleda 0,15 s unapred) ----------
  const M = { ime: null, p: null, red: 0, korak: 0, next: 0, tempo: 1, pojacano: false, kraj: false, korakaUkupno: 0 };
  function pustiMuziku(ime) {
    if (M.ime === ime) return;
    M.ime = ime; M.p = ime ? PESME[ime] : null; M.red = 0; M.korak = 0; M.kraj = false;
    M.next = AC ? AC.currentTime + 0.08 : 0;
  }
  const deo = () => M.p.delovi[M.p.red[M.red]];
  function trajanje(tok, i) { let n = 1; while (i + n < tok.length && tok[i + n] === '.') n++; return n; }

  function odsviraj(t) {
    const P = M.p, D = deo(), bpm = (D.bpm || P.bpm) * M.tempo, kd = 60 / bpm / 4;
    const takt = Math.floor(M.korak / 16), s = M.korak % 16, ak = D._akordi[takt % D._akordi.length];
    const bub = D.bubanj || P.bubanj, jac = P.tiho || 1;
    // bubanj
    if (bub.k[s] === 'x') kick(t, jac);
    if (bub.s[s] === 'x') snare(t, jac);
    if (bub.h[s] === 'x') hat(t, false, jac); else if (bub.h[s] === 'o') hat(t, true, jac); else if (bub.h[s] === 'c') cinela(t);
    if (M.pojacano) { if (s === 6 || s === 14) kick(t, 0.8); if (bub.h[s] !== 'x' && s % 2 === 1) hat(t, false, 0.7); }
    // bas
    const bt = D._bas[takt % D._bas.length], b = bt[s];
    if (b && b !== '.' && b !== '-') {
      let m = /^\d$/.test(b) ? ak.koren + ({ 1: 0, 3: ak.tonovi[1], 5: 7, 7: ak.tonovi[3] || 10, 8: 12 })[b] : nota(b);
      if (m != null) { const dur = trajanje(bt, s) * kd; bas(t, mtof(m), dur); if (M.pojacano) bas(t, mtof(m + 12), dur, 0.45); }
    }
    // akordi
    const st = (D.stab || P.stab)[s], tonovi = ak.tonovi.map((x) => mtof(ak.koren + 24 + x));
    if (st === 'x') stab(t, tonovi, kd * 2);
    else if (st === 'p') pad(t, tonovi, kd * 16, P === PESME.razglednica);
    else if (st === 'a') { const arp = [0, 1, 2, 1]; osc('square', tonovi[arp[s % 4] % tonovi.length] * 2, t, kd * 0.9, 0.045, busM, { lp: 3000, d: kd * 0.4 }); }
    // melodija
    const mt = D._mel[takt % D._mel.length], n = mt[s];
    if (n && n !== '.' && n !== '-') { const m = nota(n); if (m != null) lead(t, mtof(m), trajanje(mt, s) * kd * 0.95, D.inst || P.inst); }
    // dalje
    M.korak++; M.korakaUkupno++;
    if (M.korak >= D._akordi.length * 16) {
      M.korak = 0; M.red++;
      if (M.red >= P.red.length) { if (P.petlja === false) M.kraj = true; else M.red = 0; }
    }
    M.next += kd;
  }
  function rasporedi() {
    if (!AC || !M.p || M.kraj) return;
    const sad = AC.currentTime;
    if (M.next < sad - 0.25) M.next = sad + 0.03;   // posle zastoja (sakriven prozor) ne nadoknađuj stare note
    let n = 0;
    while (M.next < sad + 0.15 && n++ < 12 && !M.kraj) odsviraj(M.next);
  }
  setInterval(() => { try { rasporedi(); } catch (e) { /* tiho */ } }, 30);

  // ---------- poziva se iz petlje svaki frejm ----------
  // st = { motor: {v, menjac, gas, turbo} | null, sirena, skripa 0..1, prasina 0..1, muzika: ime | null, tempo, pojacano, pauza, tisina }
  let zadnjaSir = -1;
  function azuriraj(st) {
    if (!AC) return;
    const t = AC.currentTime, P = PODESAVANJA;
    const mJ = P.muzikaIskl || st.tisina ? 0 : P.muzika * 0.6 * (st.pauza ? 0.35 : 1);
    const eJ = P.efektiIskl || st.tisina ? 0 : P.efekti * 0.85;
    busM.gain.setTargetAtTime(mJ, t, 0.05); busE.gain.setTargetAtTime(eJ, t, 0.05);
    if (motor) {
      const m = st.pauza ? null : st.motor;
      let f = 32;
      if (m) f = (m.menjac === 'LO' ? 44 + Math.min(m.v, 175) / 175 * 125 : 36 + m.v / MAXV * 105) * (m.turbo ? 1.15 : 1);
      [motor.o1, motor.o2].forEach((o) => o.frequency.setTargetAtTime(f, t, 0.06));
      motor.o3.frequency.setTargetAtTime(f / 2, t, 0.06);
      motor.lp.frequency.setTargetAtTime(380 + f * 7, t, 0.06);
      motor.g.gain.setTargetAtTime(m ? (m.gas ? 0.11 : 0.065) : 0, t, 0.08);
      const sOn = st.sirena && !st.pauza, faza = Math.floor(t / 0.42) % 2;
      if (faza !== zadnjaSir) { zadnjaSir = faza; sir.o.frequency.setTargetAtTime(faza ? 880 : 660, t, 0.004); }
      sir.g.gain.setTargetAtTime(sOn ? 0.035 : 0, t, 0.05);
      skr.g.gain.setTargetAtTime(st.pauza ? 0 : (st.skripa || 0) * 0.09, t, 0.06);
      pra.g.gain.setTargetAtTime(st.pauza ? 0 : (st.prasina || 0) * 0.28, t, 0.08);
    }
    pustiMuziku(st.muzika || null);
    M.tempo = st.tempo || 1; M.pojacano = !!st.pojacano;
    rasporedi();
  }

  // ---------- proba bez slušanja: pesma se "odsvira" u OfflineAudioContext i izmeri ----------
  async function proba(ime, sekundi) {
    const sacuvano = { AC, izlaz, busM, busE, ehoUlaz, sumBuf, M: Object.assign({}, M) };
    const off = new OfflineAudioContext(1, Math.round(44100 * sekundi), 44100);
    gradi(off, false); busM.gain.value = 0.6; busE.gain.value = 0.85;
    M.ime = null; pustiMuziku(ime); M.next = 0.05;
    let n = 0; while (M.next < sekundi - 0.2 && !M.kraj && n++ < 5000) odsviraj(M.next);
    const koraka = M.korakaUkupno;
    ({ AC, izlaz, busM, busE, ehoUlaz, sumBuf } = sacuvano); Object.assign(M, sacuvano.M);
    const buf = await off.startRendering(), d = buf.getChannelData(0);
    let zbir = 0, vrh = 0; for (let i = 0; i < d.length; i++) { zbir += d[i] * d[i]; vrh = Math.max(vrh, Math.abs(d[i])); }
    return { ime, rms: +Math.sqrt(zbir / d.length).toFixed(4), vrh: +vrh.toFixed(3), nota: koraka - sacuvano.M.korakaUkupno };
  }

  return { otkljucaj, efekat, azuriraj, pustiMuziku, proba, PESME, get M() { return M; }, get AC() { return AC; } };
})();

// ostavljeno mesto za prave MOD fajlove kasnije - sada pušta sintetizovanu pesmu po imenu
function pustiMuziku(ime) { Zvuk.pustiMuziku(ime); }
