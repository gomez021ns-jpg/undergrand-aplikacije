// Nenadležni primat - satirična arkadna igra (nastala od naše igre „Donkey Kong“, ali bez Nintendovih imena i likova):
// Blokader se penje do Institucijane, a Kralj ćacija baca burad. Četiri nivoa se smenjuju u krugu, svaki krug je brži.
// U kodu su ostala stara interna imena (m = junak, dk = kralj, paul = Institucijana, hammer = pištaljka, fires = botovi,
// pies = tabloidi) - menja se samo ono što igrač vidi.
// Sve se crta kodom (bez slika sa interneta). Logička veličina je kao na arkadi (224 × 256), platno je 4× veće
// pa su pikseli oštri. Igra ide u koracima od 1/60 s, nezavisno od brzine ekrana.
(() => {
  const W = 224, H = 256, S = 4;
  const cv = document.getElementById("game");
  cv.width = W * S; cv.height = H * S;
  const c = cv.getContext("2d");
  c.setTransform(S, 0, 0, S, 0, 0);
  c.imageSmoothingEnabled = false;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* bez trajnog pamćenja */ } },
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pad = (n) => String(n).padStart(6, "0");

  // ---------- Pozornice ----------
  // Grede su delovi (seg): sprat f, gornja ivica od x1 do x2 na visini yL (levo) .. yR (desno).
  // block = bubanj (zid; bure ili kolač koji upadne u njega izgori), belt = pokretna traka (id u `belts`).
  // Merdevine: f = sprat na kome počinju (dole), broken = Mario ne može njima (burad mogu),
  // retract = uvlače se, mogu da se koriste samo kad su izvučene.
  const seg = (f, x1, x2, yL, yR = yL, o = {}) => ({ f, x1, x2, yL, yR, ...o });
  function cut(f, x1, x2, yL, yR, at, o1, o2) {
    const y = yL + (yR - yL) * (at - x1) / (x2 - x1);
    return [seg(f, x1, at, yL, y, o1), seg(f, at, x2, y, yR, o2)];
  }
  const STAGES = {
    barrels: {
      kind: "barrels", name: "FAKULTET", title: "BEZBROJ BURADI",
      seg: [
        ...cut(0, 0, 224, 247, 241, 24, { block: true }, {}),
        seg(1, 0, 208, 208, 214), seg(2, 16, 224, 181, 175), seg(3, 0, 208, 142, 148),
        seg(4, 16, 224, 115, 109), seg(5, 0, 208, 76, 82), seg(6, 88, 136, 48),
      ],
      lad: [
        { x: 84, f: 0, broken: true }, { x: 184, f: 0 },
        { x: 32, f: 1 }, { x: 104, f: 1 }, { x: 160, f: 1, broken: true },
        { x: 64, f: 2, broken: true }, { x: 112, f: 2 }, { x: 184, f: 2 },
        { x: 32, f: 3 }, { x: 80, f: 3 }, { x: 144, f: 3, broken: true },
        { x: 104, f: 4, broken: true }, { x: 184, f: 4 },
        { x: 128, f: 5 },
      ],
      hammers: [{ f: 1, x: 20 }, { f: 4, x: 204 }],
      prizes: [],
      start: { f: 0, x: 64 }, goal: 6,
      paul: { x: 98 }, help: { x: 112, y: 24 }, heart: { x: 112, y: 22 },
      dk: { f: 5, x: 40, lo: 40, hi: 40 }, stack: true,
    },
    belts: {
      kind: "belts", name: "FABRIKA SAOPŠTENJA", title: "TRAKE I TABLOIDI",
      seg: [
        seg(0, 0, 224, 247),
        seg(1, 0, 104, 207, 207, { belt: "L1" }), seg(1, 104, 120, 207, 207, { block: true }), seg(1, 120, 224, 207, 207, { belt: "R1" }),
        seg(2, 0, 48, 167), seg(2, 64, 160, 167, 167, { belt: "M2" }), seg(2, 176, 224, 167),
        seg(3, 0, 224, 127, 127, { belt: "B3" }),
        seg(4, 0, 56, 87), seg(4, 56, 184, 87, 87, { belt: "D4" }), seg(4, 184, 224, 87),
        seg(5, 8, 64, 52),
      ],
      lad: [
        { x: 24, f: 0 }, { x: 200, f: 0 },
        { x: 32, f: 1 }, { x: 96, f: 1 }, { x: 192, f: 1 },
        { x: 24, f: 2, retract: true }, { x: 112, f: 2 }, { x: 200, f: 2, retract: true },
        { x: 16, f: 3, retract: true }, { x: 72, f: 3 },
        { x: 32, f: 4 },
      ],
      hammers: [{ f: 2, x: 8 }, { f: 3, x: 180 }],
      prizes: [{ kind: "hat", f: 1, x: 168 }, { kind: "purse", f: 2, x: 212 }, { kind: "umbrella", f: 3, x: 140 }],
      start: { f: 0, x: 112 }, goal: 5,
      paul: { x: 14 }, help: { x: 32, y: 40 }, heart: { x: 40, y: 30 },
      dk: { f: 4, x: 140, lo: 112, hi: 168 },
      // L1 i R1 (oko bubnja) uvek idu u suprotnim smerovima; kolači dolaze samo na trake gde je pies
      belts: { L1: { dir: 1, pies: true, pair: "R1" }, R1: { dir: -1, pies: true, mirror: true }, M2: { dir: 1, pies: true }, B3: { dir: -1, pies: true }, D4: { dir: 1 } },
    },
    // Ostrvca levo (A dole, B, C), u sredini (M1, M2) i desno (R1-R4), gore DK-ov sprat i Pauline.
    // Između njih dva okna sa liftovima (levo idu gore, desno dole) - preko rupa se skače.
    lifts: {
      kind: "lifts", name: "LIFT ZA PODOBNE", title: "LIFTOVI I OPRUGE",
      seg: [
        seg(0, 0, 48, 247), seg(1, 0, 48, 207), seg(2, 0, 40, 160),
        seg(3, 96, 128, 192), seg(4, 96, 128, 136),
        seg(5, 176, 224, 216), seg(6, 176, 224, 176), seg(7, 176, 224, 136), seg(8, 176, 224, 100),
        seg(9, 0, 208, 76), seg(10, 96, 152, 44),
      ],
      lad: [
        { x: 24, f: 0 }, { x: 32, f: 1 }, { x: 112, f: 3 },
        { x: 184, f: 5 }, { x: 208, f: 6 }, { x: 184, f: 7 }, { x: 196, f: 8 },
        { x: 144, f: 9 },
      ],
      // okna: x1..x2, lift ide od top do bot (dir -1 = gore)
      shafts: [{ x1: 64, x2: 80, dir: -1 }, { x1: 144, x2: 160, dir: 1 }],
      liftTop: 96, liftBot: 256,
      hammers: [],
      prizes: [{ kind: "purse", f: 2, x: 8 }, { kind: "umbrella", f: 3, x: 124 }, { kind: "hat", f: 8, x: 216 }],
      fires: [{ f: 4, x: 104 }, { f: 2, x: 20 }, { f: 6, x: 196 }],
      start: { f: 0, x: 36 }, goal: 10,
      paul: { x: 104 }, help: { x: 120, y: 30 }, heart: { x: 124, y: 22 },
      dk: { f: 9, x: 28, lo: 28, hi: 28 },
    },
    // Spratovi 1-4 imaju po dve zakovice (deo grede širok 8 px, rivet: true). Kad Mario pređe preko zakovice,
    // ona nestaje i ostaje rupa; kad nestane svih 8, DK-ov sprat popusti i DK padne (pobeda).
    rivets: {
      kind: "rivets", name: "KRALJEVA TRIBINA", title: "ZAKOVICE", tip: "IZVADI SVIH 8 ZAKOVICA",
      seg: [
        seg(0, 0, 224, 247),
        ...riveted(1, 8, 216, 205, [40, 184]),
        ...riveted(2, 16, 208, 163, [40, 184]),
        ...riveted(3, 24, 200, 121, [48, 176]),
        ...riveted(4, 32, 192, 79, [48, 176]),
        seg(5, 120, 168, 46),
      ],
      lad: [
        { x: 24, f: 0 }, { x: 112, f: 0 }, { x: 200, f: 0 },
        { x: 64, f: 1 }, { x: 160, f: 1 },
        { x: 32, f: 2 }, { x: 112, f: 2 }, { x: 192, f: 2 },
        { x: 40, f: 3 }, { x: 184, f: 3 },
      ],
      hammers: [{ f: 1, x: 136 }, { f: 3, x: 96 }],
      prizes: [{ kind: "umbrella", f: 0, x: 160 }, { kind: "hat", f: 2, x: 140 }, { kind: "purse", f: 3, x: 140 }],
      start: { f: 0, x: 64 }, goal: 99, // do Pauline se ne stiže merdevinama
      paul: { x: 138, f: 5 }, help: { x: 96, y: 30 }, heart: { x: 128, y: 22 },
      dk: { f: 4, x: 96, lo: 88, hi: 104 }, // levo ostaje mesta za zalet preko rupe od zakovice 48
    },
  };
  // grede sa zakovicama: deli sprat na delove, zakovica je deo grede od x-4 do x+4
  function riveted(f, x1, x2, y, xs) {
    const out = []; let a = x1;
    for (const x of xs) { out.push(seg(f, a, x - 4, y), seg(f, x - 4, x + 4, y, y, { rivet: true })); a = x + 4; }
    out.push(seg(f, a, x2, y));
    return out;
  }
  const STAGE_ORDER = [STAGES.rivets, STAGES.barrels, STAGES.belts, STAGES.lifts]; // po ostatku nivo % 4
  const rivKey = (s) => `${s.f}:${s.x1}`;
  let rivGone = new Set(); // izvađene zakovice ostaju izvađene i posle izgubljenog života (kao na arkadi)
  const surf = (s, x) => s.yL + (s.yR - s.yL) * (clamp(x, s.x1, s.x2) - s.x1) / (s.x2 - s.x1);
  const downDir = (s) => (s.yR > s.yL ? 1 : -1); // na koju stranu se bure kotrlja
  const WALK = 0.75, CLIMB = 0.6, JV = 1.95, GRAV = 0.12, MAX_FALL = 22;

  let stage, segs, blocks, lads, belts, lifts;
  // Deo grede na spratu f ispod tačke x (prvo pravi delovi; bubanj samo ako solid = false).
  function segAt(f, x, solid = true) {
    let hit = null;
    for (const s of segs) {
      if (s.f !== f || s.gone || x < s.x1 - 0.01 || x > s.x2 + 0.01) continue;
      if (!s.block) return s;
      hit = hit || s;
    }
    return solid ? null : hit;
  }
  const floorY = (f, x) => surf(segAt(f, x, false), x);
  // gura telo širine 2*half iz bubnja na spratu f
  function wall(f, x, half) {
    for (const b of blocks) if (b.f === f && x + half > b.x1 && x - half < b.x2) x = x < (b.x1 + b.x2) / 2 ? b.x1 - half : b.x2 + half;
    return x;
  }
  // „staza“ = susedni pravi delovi istog sprata (vatrice hodaju po celoj stazi); rupa od zakovice je prekida
  function computeRuns() {
    const ok = (o, s) => o.f === s.f && !o.block && !o.gone;
    for (const s of segs) {
      if (s.block || s.gone) continue;
      let lo = s, hi = s, n;
      while ((n = segs.find((o) => ok(o, s) && Math.abs(o.x2 - lo.x1) < 0.5))) lo = n;
      while ((n = segs.find((o) => ok(o, s) && Math.abs(o.x1 - hi.x2) < 0.5))) hi = n;
      s.lo = lo.x1; s.hi = hi.x2;
    }
  }
  function loadStage() {
    stage = STAGE_ORDER[level % 4];
    // liftovi su pokretni delovi grede (svaki svoj „sprat“ 100+), po tri u oknu
    lifts = [];
    for (const [i, sh] of (stage.shafts || []).entries()) {
      const span = stage.liftBot - stage.liftTop;
      for (let k = 0; k < 3; k++) {
        const y = stage.liftTop + 14 + k * span / 3;
        lifts.push(seg(100 + i * 3 + k, sh.x1, sh.x2, y, y, { lift: true, dir: sh.dir }));
      }
    }
    segs = stage.seg.concat(lifts);
    blocks = segs.filter((s) => s.block);
    for (const s of segs) if (s.rivet) s.gone = rivGone.has(rivKey(s));
    computeRuns();
    lads =stage.lad.map((l) => ({ ...l, top: floorY(l.f + 1, l.x), bot: floorY(l.f, l.x), ext: 1, t: l.retract ? Math.floor(rnd(0, 300)) : 0 }));
    belts = {};
    for (const [id, b] of Object.entries(stage.belts || {})) belts[id] = { ...b, phase: 0, t: Math.round(rnd(par.revMin, par.revMax)), pieT: Math.round(rnd(40, 160)) };
  }

  // ---------- Sličice (pikseli kao slova, „.“ = providno) ----------
  // T duks, O ranac (narandžasti), J farmerke, W patike; N kosa i G zlato (Institucijana), L svetloplava draperija
  const PAL = { R: "#e8402a", B: "#2a5cff", S: "#ffc08a", H: "#5a3418", Y: "#ffd400", K: "#1a1010", W: "#ffffff", P: "#ff5fb8", O: "#F0A23B",
    T: "#2a9d8f", J: "#34528a", N: "#3b2414", G: "#e0b53a", L: "#9cc8ff" };
  const MARIO_TOP = [ // Blokader iz profila (gleda udesno): kosa, lice, duks, ranac na leđima
    "....HHHHH...",
    "...HHHHHHH..",
    "...HHSSKSS..",
    "...HSSSSSSS.",
    "....SSSSSS..",
    ".....SSSS...",
    "..OOTTTTT...",
    ".OOOTTTTTT..",
    ".OOOTTTTTSS.",
    ".OOOTTTTT...",
  ];
  const SP = {};
  function bake(map, pal = PAL) {
    const h = map.length, w = Math.max(...map.map((r) => r.length));
    const mk = (flip) => {
      const o = document.createElement("canvas");
      o.width = w * S; o.height = h * S;
      const x = o.getContext("2d");
      map.forEach((row, r) => [...row].forEach((ch, i) => {
        if (!pal[ch]) return;
        x.fillStyle = pal[ch];
        x.fillRect((flip ? w - 1 - i : i) * S, r * S, S, S);
      }));
      return o;
    };
    return { w, h, n: mk(false), f: mk(true) };
  }
  function put(sp, x, y, flip = false, sc = 1) { c.drawImage(flip ? sp.f : sp.n, Math.round(x), Math.round(y), sp.w * sc, sp.h * sc); }

  SP.stand = bake([...MARIO_TOP,
    "..OOTTTTT...",
    "...JJJJJJ...",
    "...JJJ.JJJ..",
    "...JJ...JJ..",
    "..WWW..WWW..",
    "..WWW...WWW.",
  ]);
  SP.walk = bake([...MARIO_TOP,
    "..OOTTTTT...",
    "...JJJJJJ...",
    "....JJJJ....",
    "....JJJJ....",
    "...WWWWW....",
    "...WWW.WW...",
  ]);
  SP.climb = bake([ // s leđa: veliki ranac
    "....HHHH....",
    "...HHHHHH...",
    "...HHHHHH...",
    "...HHHHHH...",
    "....HHHH....",
    "SS..TTTT....",
    "SSTTTTTTTT..",
    "..TOOOOOOT..",
    "..TOOOOOOTSS",
    "..TOOOOOOTSS",
    "..TTOOOOTT..",
    "..JJJJJJJJ..",
    "..JJJ..JJJ..",
    "..JJJ..JJJ..",
    "..WWW..JJJ..",
    ".......WWW..",
  ]);
  // Institucijana: kao boginja pravde - punđa, povez preko očiju, bela toga sa zlatom i svetloplavom draperijom
  const PAUL_HEAD = [
    "....NNNN....",
    "...NNNNNN...",
    "..NNSSSSNN..",
    "..NSSSSSSN..",
    "..NWWWWWWN..",
    "..NSSSSSSN..",
  ];
  const PAUL_LEGS = [
    "..WWLWWWWW..",
    "..WWLWWWWW..",
    ".WWWLWWWWWW.",
    ".WWWWLWWWWW.",
    "WWWWWLWWWWWW",
    "GWGWGWGWGWGW",
    "...SS..SS...",
    "...SS..SS...",
    "..GGG..GGG..",
  ];
  SP.paul = bake([...PAUL_HEAD,
    "..NNSSSSNN..",
    "..NNNSSNNN..",
    "...WWWWWW...",
    "..WWGWWGWW..",
    ".SWWWWWWWWS.",
    "S.WWWWWWWW.S",
    ...PAUL_LEGS]);
  SP.paulWave = bake([...PAUL_HEAD,
    "S.NNSSSSNN.S",
    "S.NNNSSNNN.S",
    ".SSWWWWWWSS.",
    "..WWGWWGWW..",
    "..WWWWWWWW..",
    "..WWWWWWWW..",
    ...PAUL_LEGS]);
  SP.heart = bake([
    ".RR.RR.",
    "RRRRRRR",
    "RRRRRRR",
    ".RRRRR.",
    "..RRR..",
    "...R...",
  ], { R: "#ff3a6e" });
  SP.girder = bake([
    "LLLLLLLL",
    "GG....GG",
    ".GG..GG.",
    "...GG...",
    "...GG...",
    ".GG..GG.",
    "GG....GG",
    "GGGGGGGG",
  ], { G: "#d8304f", L: "#ff7088" });

  // ---------- Zvuk (Web Audio, kratki tonovi kao na arkadi) ----------
  const Snd = {
    a: null, out: null, on: store.get("pr-zvuk") !== "0",
    unlock() {
      if (this.a) { if (this.a.state === "suspended") this.a.resume(); return; }
      try {
        this.a = new (window.AudioContext || window.webkitAudioContext)();
        this.out = this.a.createGain(); this.out.gain.value = 0.16; this.out.connect(this.a.destination);
      } catch { this.a = null; }
    },
    tone(f, d, { type = "square", vol = 1, to = 0, at = 0 } = {}) {
      if (demo || !this.on || !this.a || this.a.state !== "running") return; // demo je nem, kao na arkadi
      const t0 = this.a.currentTime + at, o = this.a.createOscillator(), g = this.a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t0);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + d);
      o.connect(g); g.connect(this.out); o.start(t0); o.stop(t0 + d + 0.02);
    },
    seq(notes, step, opts = {}) { notes.forEach((f, i) => { if (f) this.tone(f, step * 0.9, { ...opts, at: i * step }); }); },
  };
  const sfx = {
    jump: () => Snd.tone(260, 0.16, { to: 620, vol: 0.5 }),
    step: () => Snd.tone(150, 0.025, { type: "triangle", vol: 0.35 }),
    point: () => Snd.seq([1046, 1568], 0.06, { vol: 0.35 }),
    smash: () => { Snd.tone(220, 0.18, { to: 50, vol: 0.7, type: "sawtooth" }); Snd.seq([0, 1318, 1760], 0.05, { vol: 0.3 }); },
    hammer: () => Snd.seq([1760, 0, 1760, 2093], 0.05, { vol: 0.3 }), // podignuta pištaljka
    swing: (up) => Snd.tone(up ? 2093 : 1865, 0.06, { vol: 0.12 }), // zvižduk
    death: () => Snd.seq([784, 740, 698, 659, 622, 587, 554, 523, 0, 392, 0, 262], 0.09, { vol: 0.45 }),
    win: () => Snd.seq([523, 659, 784, 1046, 0, 784, 1046], 0.1, { vol: 0.45 }),
    boom: () => Snd.tone(90, 0.12, { type: "triangle", vol: 0.9, to: 50 }),
    toss: () => Snd.tone(180, 0.1, { type: "triangle", to: 90, vol: 0.6 }),
    fire: () => Snd.tone(600, 0.25, { type: "sawtooth", to: 120, vol: 0.22 }),
    life: () => Snd.seq([784, 988, 1175, 1568], 0.08, { vol: 0.4 }),
    start: () => Snd.seq([392, 523, 659, 784, 0, 659, 784], 0.1, { vol: 0.4 }),
    prize: () => Snd.seq([880, 1175, 1397, 1760], 0.05, { vol: 0.35 }),
    flip: () => Snd.tone(140, 0.08, { type: "square", to: 200, vol: 0.25 }),
    boing: () => Snd.tone(330, 0.12, { type: "triangle", to: 880, vol: 0.35 }),
  };

  // ---------- Muzika (petlje u 8-bitnom zvuku; melodije su naše, u duhu arkade - ne kopije originala) ----------
  // Svaki nivo ima svoju petlju, čekić svoju bržu. Korak = osmina; "." = pauza. Posebno uključivanje od efekata.
  const SONGS = {
    barrels: { bpm: 150,
      mel: "A4 . C5 E5 . D5 C5 . B4 . D5 G5 . F5 E5 . A4 . C5 E5 . A5 G5 E5 D5 . B4 G4 . B4 C5 .",
      bas: "A2 . A2 . E2 . E2 . G2 . G2 . D2 . D2 . F2 . F2 . C3 . C3 . E2 . E2 . E2 . G#2 ." },
    belts: { bpm: 160,
      mel: "C5 E5 G5 E5 C5 . G4 . D5 F5 A5 F5 D5 . A4 . E5 G5 C6 G5 E5 . C5 . D5 . G5 . F5 E5 D5 .",
      bas: "C3 . G2 . C3 . G2 . D3 . A2 . D3 . A2 . C3 . G2 . C3 . G2 . G2 . D3 . G2 . B2 ." },
    lifts: { bpm: 140,
      mel: "D5 . . A4 . . C5 . D5 . E5 . F5 . E5 . D5 . . A4 . . G4 . A4 . C5 . D5 . . .",
      bas: "D3 . A2 . D3 . A2 . C3 . G2 . C3 . G2 . A#2 . F2 . A#2 . F2 . A2 . E2 . A2 . C#3 ." },
    rivets: { bpm: 170,
      mel: "E5 . E5 G5 . E5 D5 . E5 . B4 . D5 . E5 . G5 . G5 A5 . G5 F#5 . E5 . D5 . B4 . . .",
      bas: "E2 . E3 . E2 . E3 . E2 . E3 . D2 . D3 . C2 . C3 . C2 . C3 . B1 . B2 . B1 . D#2 ." },
    hammer: { bpm: 200,
      mel: "C5 G5 E5 G5 C6 G5 E5 G5 D5 A5 F5 A5 D6 A5 F5 A5",
      bas: "C3 . C3 . C3 . C3 . D3 . D3 . D3 . D3 ." },
  };
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const hz = (n) => { const r = /^([A-G])(#?)(\d)$/.exec(n); return r ? 440 * 2 ** ((12 * (+r[3] + 1) + NOTE[r[1]] + (r[2] ? 1 : 0) - 69) / 12) : 0; };
  for (const s of Object.values(SONGS)) { s.mel = s.mel.split(" ").map(hz); s.bas = s.bas.split(" ").map(hz); }
  const Mus = {
    on: store.get("pr-muzika") !== "0", name: null, step: 0, next: 0, out: null,
    play(name) { // null = tišina; nova petlja kreće od početka
      if (name === this.name) return;
      this.name = name; this.step = 0; this.next = 0;
    },
    note(f, t0, d, type, vol) {
      const a = Snd.a, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t0);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + d);
      o.connect(g); g.connect(this.out); o.start(t0); o.stop(t0 + d + 0.02);
    },
    tick() { // zakazuje note malo unapred po satu zvuka, pa petlja ne šteca ako korak kasni
      const a = Snd.a, song = SONGS[this.name];
      if (!song || !this.on || !a || a.state !== "running") return;
      if (!this.out) { this.out = a.createGain(); this.out.gain.value = 0.5; this.out.connect(Snd.out); }
      const dt = 30 / song.bpm;
      if (this.next < a.currentTime) this.next = a.currentTime + 0.05;
      while (this.next < a.currentTime + 0.15) {
        const i = this.step % song.mel.length, j = this.step % song.bas.length;
        if (song.mel[i]) this.note(song.mel[i], this.next, dt * 0.8, "square", 0.16);
        if (song.bas[j]) this.note(song.bas[j], this.next, dt * 0.9, "triangle", 0.42);
        this.next += dt; this.step++;
      }
    },
  };
  function setMusic(on) {
    Mus.on = on; store.set("pr-muzika", on ? "1" : "0");
    document.dispatchEvent(new CustomEvent("dk:muzika", { detail: on }));
  }

  // ---------- Stanje igre ----------
  const REK_KEY = "pr-rekordi", REK_MAX = 10;
  const ALPHA = [..."ABCČĆDĐEFGHIJKLMNOPQRSŠTUVWXYZŽ"]; // slova za upis (↑↓ ih vrti ovim redom)
  let name = ["A", "A", "A"], nameI = 0;
  function records() {
    try { const r = JSON.parse(store.get(REK_KEY) || "[]"); return Array.isArray(r) ? r : []; } catch { return []; }
  }
  let best = records()[0]?.s || 0;
  let state = "title", paused = false, T = 0, st = 0, newBest = false;
  let score = 0, lives = 3, level = 1, bonus = 5000, bonusT = 0, extra = false, jumpId = 0;
  let m, barrels, pies, springs, fires, pops, hams, prizes, oilLit, oilFlare, dk, par;

  // Težina: krug = četiri nivoa (25 m, 50 m, 75 m, 100 m); r = 0 u prvom krugu.
  const P = () => {
    const r = Math.ceil(level / 4) - 1;
    return {
      bSpd: Math.min(1.8, 0.95 + 0.12 * r),         // brzina bureta
      ladP: Math.min(0.55, 0.22 + 0.06 * r),        // koliko često bure krene niz merdevine
      minI: Math.max(42, 100 - 8 * r),              // razmak između bacanja (koraci)
      maxI: Math.max(80, 190 - 14 * r),
      fSpd: Math.min(0.85, 0.42 + 0.06 * r),        // brzina vatrice
      maxF: Math.min(4, 2 + Math.floor(r / 2)),     // najviše vatrica odjednom
      bonus0: Math.min(8000, 5000 + 500 * (level - 1)),
      beltSp: Math.min(0.75, 0.38 + 0.06 * r),      // brzina traka
      revMin: Math.max(240, 420 - 30 * r), revMax: Math.max(420, 760 - 40 * r), // kad se traka okrene
      pieMin: Math.max(50, 120 - 12 * r), pieMax: Math.max(110, 240 - 20 * r),  // razmak kolača na jednoj traci
      fireMin: Math.max(240, 480 - 40 * r), fireMax: Math.max(420, 760 - 50 * r), // nova vatrica iz bubnja
      prize: [300, 500, 800][Math.min(r, 2)],
      liftSp: Math.min(0.8, 0.45 + 0.05 * r),       // brzina liftova
      sprMin: Math.max(70, 140 - 12 * r), sprMax: Math.max(130, 230 - 20 * r), // razmak između opruga
      sprVx: Math.min(1.5, 1 + 0.1 * r),            // koliko brzo opruga skakuće udesno
      liftF: Math.min(3, 2 + r),                    // vatrice na 75 m
      rivF: Math.min(5, 2 + r),                     // najviše vatrica na 100 m
      rivMin: Math.max(150, 300 - 30 * r), rivMax: Math.max(260, 480 - 40 * r), // nova vatrica sa strane (100 m)
    };
  };

  const emit = () => document.dispatchEvent(new CustomEvent("dk:stanje", { detail: { state, paused, demo } }));

  function resetStage() {
    loadStage();
    const s0 = segAt(stage.start.f, stage.start.x);
    m = { x: stage.start.x, y: surf(s0, stage.start.x), s: s0, f: s0.f, vx: 0, vy: 0, face: 1, st: "walk", lad: null, walk: 0, climb: 0, hammer: 0, hUp: true, peak: 0 };
    barrels = []; pies = []; springs = []; pops = [];
    // na 75 m vatrice su na ostrvcima od početka
    fires = (stage.fires || []).slice(0, par.liftF).map((o) => {
      const s = segAt(o.f, o.x);
      return { x: o.x, y: surf(s, o.x), f: o.f, s, dir: 1, st: "walk", air: false, t: 0, lad: null, last: null, jid: -1 };
    });
    oilLit = !!stage.belts; oilFlare = 0;
    hams = stage.hammers.map((h) => ({ ...h, y: floorY(h.f, h.x) - 22, on: true }));
    prizes = stage.prizes.map((p) => ({ ...p, y: floorY(p.f, p.x) - 22, on: true }));
    dk = { pose: "idle", t: 0, next: 50, first: true, x: stage.dk.x, vx: 0.35, fireT: Math.round(rnd(par.fireMin, par.fireMax)) };
    bonus = par.bonus0; bonusT = 0;
  }

  // igra ne teče (nema pauze ni automatskog zaustavljanja); demo se ne pauzira
  const idle = () => demo || state === "title" || state === "over" || state === "name";

  // Nova igra uvek kreće od prvog nivoa (korisnik 31. 10. 2026: bez izbora „Kreni od“); `from` služi samo za proveru.
  function start(from) {
    if (state === "name") saveName(); // „Nova igra“ usred upisa: sačuvaj ono što je ukucano
    demo = false;
    Snd.unlock();
    score = 0; lives = 3; level = from || 1; extra = false; newBest = false; rivGone = new Set();
    par = P(); resetStage();
    state = "ready"; st = 0; paused = false;
    sfx.start(); emit();
  }

  // ---------- Demo (kao na arkadi: posle 10 s na naslovnom ekranu igra igra sama ~15 s, pa nazad) ----------
  // Naizmenično nivo 1 i nivo 2; bez zvuka i muzike, ne broji se u rekorde. Enter/Space ili „Nova igra“ odmah kreće pravu igru.
  let demo = false, demoT = 0, demoN = 0;
  const DEMO_WAIT = 600, DEMO_LEN = 900; // koraci od 1/60 s
  const DEMO_ROUTE = { barrels: [184, 104, 112, 80, 184, 128], belts: [24, 32, 24, 72, 32] }; // merdevine po spratu
  function startDemo() {
    demo = true; demoT = 0;
    score = 0; lives = 3; level = demoN++ % 2 ? 2 : 1; extra = true; newBest = false; rivGone = new Set();
    par = P(); resetStage();
    state = "play"; st = 0; paused = false; emit();
  }
  function endDemo() {
    demo = false; score = 0; lives = 3; level = 1; extra = false; rivGone = new Set();
    par = P(); resetStage();
    state = "title"; st = 0; emit();
  }
  function demoAI() { // „igrač“ u demu: ide ka merdevinama svog sprata, preskače ono što mu ide u susret
    for (const k in K) K[k] = false;
    const floorOf = (e) => e.f ?? e.s?.f, moveOf = (e) => e.dir ?? Math.sign(e.v || 0);
    // nešto na spratu f ide ka tački x (ili je već tu)
    const near = (f, x, r) => [...barrels, ...pies, ...fires].some((e) => !e.air && !["drop", "ladder", "fall", "climb"].includes(e.st)
      && floorOf(e) === f && Math.abs(e.x - x) < r && (Math.abs(e.x - x) < 9 || Math.sign(x - e.x) === moveOf(e)));
    if (m.st === "climb") { // pri vrhu merdevina sačeka da gornji sprat bude slobodan
      if (!(m.y - m.lad.top < 16 && near(m.lad.f + 1, m.lad.x, 26))) K.up = true;
      return;
    }
    if (m.st !== "walk") return;
    const tx = (DEMO_ROUTE[stage.kind] || [])[m.f];
    const dir = tx === undefined ? 0 : Math.sign(tx - m.x);
    const danger = !m.hammer && near(m.f, m.x, 18);
    if (danger) { K.jump = true; if (dir > 0) K.right = true; else if (dir < 0) K.left = true; return; }
    if (tx === undefined) return;
    if (Math.abs(m.x - tx) <= 2) {
      const l = lads.find((o) => o.x === tx && o.f === m.f);
      if (l && usable(l) && !m.hammer && !near(m.f + 1, l.x, 30)) K.up = true;
      return;
    }
    if (dir > 0) K.right = true; else K.left = true;
  }

  function setPaused(v) {
    if (idle()) return;
    paused = v; emit();
  }

  function addScore(n, x, y) {
    score += n;
    if (x !== undefined) pops.push({ x, y, text: String(n), t: 0 });
    if (!extra && score >= 7000) { extra = true; lives++; sfx.life(); }
  }

  function die() {
    if (state !== "play") return;
    state = "dying"; st = 0; m.st = "dead"; m.hammer = 0;
    sfx.death();
  }
  function afterDeath() {
    lives--;
    if (lives <= 0) return gameOver();
    resetStage(); state = "ready"; st = 0; emit();
  }
  // Kraj igre: ko uđe među REK_MAX najboljih, upisuje tri slova (stanje "name"), kao na arkadi.
  function gameOver() {
    if (demo) return endDemo();
    newBest = score > 0 && score > best;
    const r = records();
    st = 0;
    if (score > 0 && (r.length < REK_MAX || score > r[r.length - 1].s)) {
      state = "name"; nameI = 0;
      name = [...(store.get("pr-ime") || "")].filter((ch) => ALPHA.includes(ch)).slice(0, 3);
      while (name.length < 3) name.push("A");
    } else state = "over";
    emit();
  }
  function saveName() {
    const i = name.join("");
    store.set("pr-ime", i);
    const entry = { s: score, n: level, d: new Date().toISOString().slice(0, 10), i, id: Date.now() };
    const r = records();
    r.push(entry);
    r.sort((a, b) => b.s - a.s);
    store.set(REK_KEY, JSON.stringify(r.slice(0, REK_MAX)));
    best = Math.max(best, score);
    state = "over"; st = 0;
    sfx.prize();
    document.dispatchEvent(new CustomEvent("dk:rekordi", { detail: { id: entry.id } }));
    emit();
  }
  function nameKey(e) {
    e.preventDefault();
    const cycle = (d) => { name[nameI] = ALPHA[(ALPHA.indexOf(name[nameI]) + d + ALPHA.length) % ALPHA.length]; };
    if (e.code === "Enter" || e.code === "NumpadEnter") { if (!e.repeat && st > 20) saveName(); }
    else if (e.code === "Backspace" || e.code === "ArrowLeft") nameI = Math.max(0, nameI - 1);
    else if (e.code === "ArrowRight") nameI = Math.min(2, nameI + 1);
    else if (e.code === "ArrowUp") cycle(1);
    else if (e.code === "ArrowDown") cycle(-1);
    else if (e.key.length === 1 && ALPHA.includes(e.key.toUpperCase())) {
      name[nameI] = e.key.toUpperCase(); sfx.step();
      if (nameI < 2) nameI++;
    }
  }
  function win() {
    state = "win"; st = 0; barrels = []; pies = []; springs = []; fires = []; m.hammer = 0; m.st = "walk";
    sfx.win();
  }
  function nextLevel() {
    addScore(bonus);
    level++; par = P(); rivGone = new Set(); resetStage();
    state = "ready"; st = 0; emit();
  }

  // ---------- Tastatura ----------
  const K = { left: false, right: false, up: false, down: false, jump: false };
  const KEYMAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down" };
  const blocked = () => !!document.querySelector("dialog[open]");
  const canStart = () => state === "title" || demo || (state === "over" && st > 60);
  addEventListener("keydown", (e) => {
    if (blocked() || e.ctrlKey || e.altKey || e.metaKey) return;
    Snd.unlock();
    if (state === "name") return nameKey(e);
    const k = KEYMAP[e.code];
    if (k) { K[k] = true; e.preventDefault(); return; }
    if (e.code === "Space") {
      e.preventDefault();
      if (e.repeat) return;
      if (canStart()) start(); else K.jump = true;
    } else if (e.code === "Enter" || e.code === "NumpadEnter") {
      e.preventDefault();
      if (e.repeat) return;
      if (canStart()) start(); else setPaused(!paused);
    } else if (e.code === "KeyP" && !e.repeat) setPaused(!paused);
    else if (e.code === "KeyM" && !e.repeat) setSound(!Snd.on);
    else if (e.code === "KeyN" && !e.repeat) setMusic(!Mus.on);
  });
  addEventListener("keyup", (e) => {
    const k = KEYMAP[e.code];
    if (k) K[k] = false;
    if (e.code === "Space") e.preventDefault();
  });
  const releaseAll = () => { for (const k in K) K[k] = false; };
  addEventListener("blur", () => { releaseAll(); if (!idle()) setPaused(true); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && demo) endDemo(); else if (document.hidden && !idle()) setPaused(true); });

  function setSound(on) {
    Snd.on = on; store.set("pr-zvuk", on ? "1" : "0");
    document.dispatchEvent(new CustomEvent("dk:zvuk", { detail: on }));
  }

  // ---------- Mario ----------
  const usable = (l) => !l.broken && l.ext === 1;
  function ladderNear(f, dir) {
    for (const l of lads) {
      if (!usable(l)) continue;
      if ((dir === "up" ? l.f === f : l.f + 1 === f) && Math.abs(m.x - l.x) <= 3.5) return l;
    }
    return null;
  }
  function pickUps() {
    const touch = (o) => o.on && Math.abs(m.x - o.x) < 7 && m.y - 16 < o.y + 8 && m.y > o.y;
    if (!m.hammer) for (const h of hams) if (touch(h)) { h.on = false; m.hammer = 620; m.hUp = true; sfx.hammer(); }
    for (const p of prizes) if (touch(p)) { p.on = false; addScore(par.prize, p.x, p.y - 2); sfx.prize(); }
  }
  function land(s) { // Mario staje na deo grede s
    m.s = s; m.f = s.f; m.y = surf(s, m.x); m.st = "walk";
    if (m.f === stage.goal) win();
  }
  // Zakovica se vadi kad Mario pređe preko nje (hodom ili skokom) i siđe sa nje na bilo koju stranu.
  function updRivets() {
    for (const s of segs) {
      if (!s.rivet || s.gone) continue;
      const cx = (s.x1 + s.x2) / 2, y = s.yL;
      const over = Math.abs(m.x - cx) < 4 && m.y <= y + 0.5 && m.y >= y - 28 && m.st !== "climb";
      if (over) s.touch = true;
      else if (s.touch && Math.abs(m.x - cx) >= 5) {
        s.touch = false;
        if (m.s === s) continue; // još stoji na njoj
        s.gone = true; rivGone.add(rivKey(s));
        addScore(100, cx, y - 6); sfx.point();
        pops.push({ x: cx, y: y + 4, t: 0, boom: true });
        computeRuns();
        for (const f of fires) if (!f.air && f.s && f.s.gone) { f.gone = true; pops.push({ x: f.x, y: f.y - 5, t: 0, boom: true }); }
        if (segs.every((o) => !o.rivet || o.gone)) return win();
      } else if (!over && Math.abs(m.x - cx) >= 5) s.touch = false;
    }
  }
  function updMario() {
    if (m.hammer > 0) {
      m.hammer--;
      const up = Math.floor(m.hammer / 9) % 2 === 0;
      if (up !== m.hUp) { m.hUp = up; sfx.swing(up); }
    }
    const dx = (K.right ? 1 : 0) - (K.left ? 1 : 0);
    const jump = K.jump; K.jump = false;

    if (m.st === "walk") {
      if (!m.hammer) {
        const l = (K.up && ladderNear(m.f, "up")) || (K.down && ladderNear(m.f, "down"));
        if (l) { m.st = "climb"; m.lad = l; m.x = l.x; m.y = K.up ? l.bot : l.top; return; }
        if (jump) { m.st = "jump"; m.vx = dx * WALK; m.vy = -JV; m.peak = m.y; jumpId++; sfx.jump(); return; }
      }
      if (dx) { m.face = dx; m.x += dx * WALK; if (++m.walk % 10 === 0) sfx.step(); }
      if (m.s.belt) m.x += belts[m.s.belt].dir * par.beltSp; // traka nosi Marija
      m.x = clamp(wall(m.f, m.x, 4), 6, 218);
      if (m.x < m.s.x1 || m.x > m.s.x2) {
        const n = segAt(m.f, m.x);
        if (n && Math.abs(surf(n, m.x) - surf(m.s, m.x)) < 1.5) m.s = n;
        else if (m.x < m.s.x1 - 1 || m.x > m.s.x2 + 1) { m.st = "jump"; m.vx = dx * WALK * 0.5; m.vy = 0; m.peak = m.y; return; }
      }
      m.y = surf(m.s, m.x);
      pickUps();
    } else if (m.st === "climb") {
      const l = m.lad;
      if (l.ext < 1) m.y += 1.4; // merdevine se uvlače: Mario sklizne dole
      else if (K.up) { m.y -= CLIMB; m.climb++; } else if (K.down) { m.y += CLIMB; m.climb++; }
      if (m.y <= l.top) { m.y = l.top; land(segAt(l.f + 1, l.x)); }
      else if (m.y >= l.bot) { m.y = l.bot; land(segAt(l.f, l.x)); }
    } else if (m.st === "jump") {
      const py = m.y;
      m.vy = Math.min(3, m.vy + GRAV); m.x += m.vx; m.y += m.vy;
      if (m.x < 6 || m.x > 218) { m.x = clamp(m.x, 6, 218); m.vx = -m.vx; } // odbije se od ivice ekrana
      for (const b of blocks) { // ne može kroz bubanj ni u vazduhu
        const by = surf(b, (b.x1 + b.x2) / 2);
        if (m.y > by - 16 && m.y - 14 < by) { const nx = wall(b.f, m.x, 4); if (nx !== m.x) { m.x = nx; m.vx = 0; } }
      }
      if (m.y < m.peak) m.peak = m.y;
      pickUps();
      if (m.vy > 0) for (const s of segs) {
        if (s.block || s.gone || m.x < s.x1 - 1 || m.x > s.x2 + 1) continue;
        const y = surf(s, m.x);
        if (py <= y + (s.lift ? 0.9 : 0.01) && m.y >= y) { // lift koji ide gore „susreće“ Marija
          m.y = y;
          if (y - m.peak > MAX_FALL) return die();
          return land(s);
        }
      }
      if (m.y > H + 16) die();
    }
  }

  // ---------- Donkey Kong ----------
  function updDK() {
    dk.t++;
    if (stage.kind === "belts" || stage.kind === "rivets") {
      // 50 m i 100 m: šeta po svom spratu; vatrice izlaze iz bubnja (50 m) ili dolaze sa strane (100 m)
      dk.x += dk.vx;
      if (dk.x < stage.dk.lo || dk.x > stage.dk.hi || Math.random() < 0.004) { dk.vx = -dk.vx; dk.x = clamp(dk.x, stage.dk.lo, stage.dk.hi); }
      if (--dk.fireT <= 0) {
        if (stage.kind === "belts") {
          dk.fireT = Math.round(rnd(par.fireMin, par.fireMax));
          if (fires.length < par.maxF) spawnFire(blocks[0], Math.random() < 0.5 ? -1 : 1);
        } else {
          dk.fireT = Math.round(rnd(par.rivMin, par.rivMax));
          if (fires.length < par.rivF) sideFire();
        }
      }
      return;
    }
    if (dk.pose === "idle") {
      if (--dk.next <= 0) { dk.pose = "grab"; dk.t = 0; }
    } else if (dk.pose === "grab" && dk.t > 16) {
      dk.pose = dk.first && stage.kind === "barrels" ? "drop" : "hold"; dk.t = 0;
    } else if (dk.pose === "hold" && dk.t > 16 && stage.kind === "lifts") {
      // 75 m: opruga skakuće udesno po gornjem spratu, na kraju pada niz desnu stranu
      const x = dk.x + 24;
      springs.push({ x, y: floorY(stage.dk.f, x) - 6, vx: par.sprVx, vy: -1.2, st: "hop", sq: 0 });
      sfx.toss(); dk.pose = "idle"; dk.next = Math.round(rnd(par.sprMin, par.sprMax));
    } else if (dk.pose === "hold" && dk.t > 16) {
      const s = segAt(stage.dk.f, 64);
      barrels.push(newBarrel({ x: 64, y: surf(s, 64), s, f: s.f, dir: 1, st: "roll", blue: Math.random() < 0.18 }));
      sfx.toss(); dk.pose = "idle"; dk.next = Math.round(rnd(par.minI, par.maxI));
    } else if (dk.pose === "drop" && dk.t > 22) {
      // prvo bure posle svakog početka pada pravo dole, u bubanj sa uljem (kao na arkadi)
      barrels.push(newBarrel({ x: dk.x, y: floorY(stage.dk.f, dk.x) - 2, s: null, f: stage.dk.f, dir: -1, st: "drop", vy: 0.4, blue: true }));
      sfx.toss(); dk.first = false; dk.pose = "idle"; dk.next = Math.round(rnd(par.minI, par.maxI));
    }
  }

  // ---------- Burad (25 m) ----------
  const newBarrel = (o) => ({ vy: 0, hz: 0, hv: 0, rot: 0, seen: new Set(), jid: -1, lad: null, ...o });

  function spawnFire(drum, dir) {
    const cx = (drum.x1 + drum.x2) / 2;
    fires.push({ x: cx + dir * 4, y: surf(drum, cx) - 16, f: drum.f, s: null, dir, st: "walk", air: true, vx: dir * 0.55, vy: -1.6, t: 0, lad: null, last: null, jid: -1 });
  }
  function sideFire() { // 100 m: vatrica ulazi sa leve ili desne ivice jednog od donja četiri sprata
    for (let k = 0; k < 6; k++) {
      const f = Math.floor(rnd(0, 4)), dir = Math.random() < 0.5 ? 1 : -1;
      const ends = segs.filter((s) => s.f === f && !s.gone && !s.rivet);
      const s = dir > 0 ? ends.reduce((a, b) => (b.x1 < a.x1 ? b : a)) : ends.reduce((a, b) => (b.x2 > a.x2 ? b : a));
      const x = dir > 0 ? s.x1 + 6 : s.x2 - 6;
      if (m.f === f && Math.abs(m.x - x) < 48) continue;
      fires.push({ x, y: surf(s, x), f, s, dir, st: "walk", air: false, t: 0, lad: null, last: null, jid: -1 });
      sfx.fire(); return;
    }
  }
  function burn(drum) { oilFlare = 40; sfx.fire(); return drum; }
  function intoOil(b, drum) {
    burn(drum);
    if (!oilLit || b.blue) {
      oilLit = true;
      if (fires.length < par.maxF) spawnFire(drum, 1);
    }
  }

  function updBarrels() {
    const sp = par.bSpd;
    for (const b of barrels) {
      if (b.st === "roll") {
        const px = b.x;
        b.x += b.dir * sp; b.rot += sp;
        if (b.f > 0) for (const l of lads) {
          if (l.f + 1 !== b.f || b.seen.has(l) || (px - l.x) * (b.x - l.x) > 0) continue;
          b.seen.add(l);
          let p = par.ladP;
          if (m.f < b.f) p += 0.12;
          if (m.f < b.f && Math.abs(m.x - l.x) < 28) p += 0.15;
          if (Math.random() < p) { b.st = "ladder"; b.x = l.x; b.lad = l; break; }
        }
        if (b.st === "roll" && (b.x < b.s.x1 || b.x > b.s.x2)) {
          const n = segAt(b.f, b.x, false);
          if (n && n.block) { b.gone = true; intoOil(b, n); }
          else if (n) b.s = n;
          else { b.st = "fall"; b.vy = 0.3; }
        }
        if (b.st === "roll") b.y = surf(b.s, b.x);
      } else if (b.st === "fall") {
        b.vy = Math.min(2.6, b.vy + 0.14); b.y += b.vy;
        b.x = clamp(b.x + b.dir * sp * 0.45, 4, 220);
        const n = segAt(b.f - 1, b.x);
        if (n && b.y >= surf(n, b.x)) {
          b.s = n; b.f = n.f; b.y = surf(n, b.x); b.dir = downDir(n); b.st = "roll"; b.hv = -1.1; sfx.boom();
        }
      } else if (b.st === "ladder") {
        b.y += sp * 0.75;
        if (b.y >= b.lad.bot) { b.f = b.lad.f; b.s = segAt(b.f, b.lad.x); b.y = b.lad.bot; b.dir = downDir(b.s); b.st = "roll"; b.hv = -0.8; }
      } else if (b.st === "drop") {
        b.vy = Math.min(2.2, b.vy + 0.08); b.y += b.vy;
        const s0 = segAt(0, b.x);
        if (s0 && b.y >= surf(s0, b.x)) { b.s = s0; b.f = 0; b.y = surf(s0, b.x); b.dir = -1; b.st = "roll"; b.hv = -1.4; sfx.boom(); }
      }
      if (b.hv || b.hz < 0) { b.hz += b.hv; b.hv += 0.15; if (b.hz >= 0) { b.hz = 0; b.hv = 0; } }
      if (b.y > H + 20) b.gone = true;
    }
    barrels = barrels.filter((b) => !b.gone);
  }

  // ---------- Trake i kolači (50 m) ----------
  function updBelts() {
    for (const b of Object.values(belts)) {
      b.phase += b.dir * par.beltSp;
      if (b.mirror) continue;
      if (--b.t <= 0) {
        b.dir = -b.dir; b.t = Math.round(rnd(par.revMin, par.revMax));
        if (b.pair) belts[b.pair].dir = -b.dir;
        sfx.flip();
      }
    }
    for (const s of segs) {
      const b = s.belt && belts[s.belt];
      if (!b || !b.pies || --b.pieT > 0) continue;
      b.pieT = Math.round(rnd(par.pieMin, par.pieMax));
      // kolač dolazi na početak trake: sa ivice ekrana ili iz rupe, ne iz bubnja
      const end = b.dir > 0 ? s.x1 : s.x2, x = end + b.dir * 5;
      const nb = segAt(s.f, end - b.dir, false);
      if (nb && nb.block) continue;
      if (m.f === s.f && Math.abs(m.x - x) < 24) continue;
      if (pies.some((p) => p.s === s && Math.abs(p.x - x) < 16)) continue;
      pies.push({ x, y: surf(s, x) - 16, s, st: "drop", vy: 0, v: 0, jid: -1 });
    }
  }
  function updPies() {
    for (const p of pies) {
      if (p.st === "drop") {
        p.vy += 0.14; p.y += p.vy;
        if (p.y >= surf(p.s, p.x)) { p.y = surf(p.s, p.x); p.st = "ride"; }
      } else if (p.st === "ride") {
        if (p.s.belt) p.v = belts[p.s.belt].dir * par.beltSp;
        p.x += p.v;
        if (p.x < p.s.x1 || p.x > p.s.x2) {
          if (p.x <= 0 || p.x >= W) { p.gone = true; continue; }
          const n = segAt(p.s.f, p.x, false);
          if (n && n.block) { p.gone = true; burn(n); continue; }
          if (n) p.s = n; else { p.st = "fall"; p.vy = 0.3; continue; }
        }
        p.y = surf(p.s, p.x);
      } else if (p.st === "fall") {
        p.vy = Math.min(2.6, p.vy + 0.14); p.y += p.vy; p.x += p.v * 0.4;
        const below = segAt(p.s.f - 1, p.x, false);
        if (below && p.y >= surf(below, p.x)) { p.gone = true; pops.push({ x: p.x, y: p.y - 3, t: 0, boom: true }); sfx.boom(); }
        if (p.y > H + 10) p.gone = true;
      }
    }
    pies = pies.filter((p) => !p.gone);
  }
  function updLadders() {
    for (const l of lads) if (l.retract) {
      // 300 koraka izvučene, 40 se uvlače, 180 uvučene, 40 se izvlače
      l.t = (l.t + 1) % 560;
      const t = l.t;
      l.ext = t < 300 ? 1 : t < 340 ? 1 - (t - 300) / 40 : t < 520 ? 0 : (t - 520) / 40;
      if (t === 300 && m.lad === l && m.st === "climb") sfx.flip();
    }
  }

  // ---------- Liftovi i opruge (75 m) ----------
  function updLifts() {
    const span = stage.liftBot - stage.liftTop;
    for (const l of lifts) {
      let y = l.yL + l.dir * par.liftSp;
      const out = l.dir < 0 ? y < stage.liftTop : y > stage.liftBot;
      if (out) {
        // lift nestaje gore (u motoru) ili dole - ko je na njemu, gotov je
        if (m.s === l && m.st === "walk") { die(); return; }
        y -= l.dir * span;
      }
      l.yL = l.yR = y;
    }
  }
  function updSprings() {
    for (const s of springs) {
      if (s.sq) s.sq--;
      if (s.st === "hop") {
        s.vy += 0.12; s.y += s.vy; s.x += s.vx;
        if (s.x >= 206) { s.st = "drop"; s.x = 210; s.vx = 0; s.vy = Math.max(s.vy, 0.5); continue; }
        const fy = floorY(stage.dk.f, s.x);
        if (s.vy > 0 && s.y >= fy) { s.y = fy; s.vy = -2.2; s.sq = 6; sfx.boing(); }
      } else {
        s.vy = Math.min(3, s.vy + 0.12); s.y += s.vy;
        if (s.y > H + 10) s.gone = true;
      }
    }
    springs = springs.filter((s) => !s.gone);
  }

  // ---------- Vatrice ----------
  function updFires() {
    const sp = par.fSpd;
    for (const f of fires) {
      f.t++;
      if (f.air) { // iskoči iz bubnja
        const py = f.y;
        f.vy += 0.1; f.y += f.vy; f.x = clamp(f.x + f.vx, 8, 216);
        if (f.vy > 0) for (const s of segs) {
          if (s.block || s.gone || f.x < s.x1 || f.x > s.x2) continue;
          const y = surf(s, f.x);
          if (py <= y + 0.01 && f.y >= y) { f.y = y; f.s = s; f.f = s.f; f.air = false; break; }
        }
        if (f.y > H) f.gone = true;
        continue;
      }
      if (f.st === "walk") {
        if (f.t % 90 === 0) {
          if (f.f === m.f && Math.random() < 0.65) f.dir = m.x > f.x ? 1 : -1;
          else if (Math.random() < 0.35) f.dir = -f.dir;
        }
        const px = f.x;
        f.x += f.dir * sp;
        const lo = f.s.lo + 5, hi = f.s.hi - 5;
        if (f.x < lo) { f.x = lo; f.dir = 1; }
        if (f.x > hi) { f.x = hi; f.dir = -1; }
        if (f.x < f.s.x1 || f.x > f.s.x2) f.s = segAt(f.f, f.x) || f.s;
        f.y = surf(f.s, f.x);
        if (f.last && Math.abs(f.x - f.last.x) > 6) f.last = null;
        for (const l of lads) {
          if (!usable(l) || l === f.last || (px - l.x) * (f.x - l.x) > 0) continue;
          const up = l.f === f.f && l.f + 1 < stage.goal, down = l.f + 1 === f.f;
          if (!up && !down) continue;
          f.last = l;
          const p = (up && m.f > f.f) || (down && m.f < f.f) ? 0.6 : 0.25;
          if (Math.random() < p) { f.st = "climb"; f.lad = l; f.x = l.x; f.cdir = up ? -1 : 1; }
          break;
        }
      } else if (f.st === "climb") {
        const l = f.lad;
        f.y += l.ext < 1 ? 1.4 : f.cdir * sp * 0.6;
        const end = (ff) => { f.f = ff; f.s = segAt(ff, l.x); f.st = "walk"; f.last = l; };
        if (f.y <= l.top) { f.y = l.top; end(l.f + 1); }
        else if (f.y >= l.bot) { f.y = l.bot; end(l.f); }
      }
    }
    fires = fires.filter((f) => !f.gone);
  }

  // ---------- Sudari ----------
  const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  function hammerBox() {
    // čekić pokriva prostor ispred Marija i iznad glave (obe faze zamaha)
    const f = m.face;
    return { l: f > 0 ? m.x - 6 : m.x - 19, r: f > 0 ? m.x + 19 : m.x + 6, t: m.y - 32, b: m.y };
  }
  function collide() {
    if (m.st === "dead") return;
    const mb = { l: m.x - 3.5, r: m.x + 3.5, t: m.y - 14, b: m.y - 1 };
    const hb = m.hammer ? hammerBox() : null;
    const inAir = m.st === "jump";
    const check = (list, h, pts = true) => {
      for (const e of list) {
        if (e.air || (e.st === "drop" && list === pies)) continue;
        const ey = e.y + (e.hz || 0);
        const eb = { l: e.x - 4.5, r: e.x + 4.5, t: ey - h, b: ey - 1 };
        if (hb && hit(hb, eb)) {
          e.gone = true;
          pops.push({ x: e.x, y: ey - 5, t: 0, boom: true });
          addScore([300, 300, 500, 800][Math.floor(Math.random() * 4)], e.x, ey - 12);
          sfx.smash();
          continue;
        }
        if (hit(mb, eb)) { die(); return true; }
        if (pts && inAir && e.jid !== jumpId && Math.abs(e.x - m.x) < 7 && ey > m.y && ey - m.y < 30) {
          e.jid = jumpId; addScore(100, e.x, ey - 14); sfx.point();
        }
      }
      return false;
    };
    if (check(barrels, 8) || check(pies, 6) || check(fires, 9) || check(springs, 8, false)) return;
    barrels = barrels.filter((b) => !b.gone);
    pies = pies.filter((p) => !p.gone);
    fires = fires.filter((f) => !f.gone);
    const dy = floorY(stage.dk.f, dk.x); // dodir sa Donkey Kongom
    if (hit(mb, { l: dk.x - 17, r: dk.x + 17, t: dy - 34, b: dy })) die();
  }

  // ---------- Glavni korak ----------
  function play() {
    if (demo) demoAI();
    updLadders(); updBelts(); updLifts(); if (state !== "play") return;
    updMario(); if (state !== "play") return;
    if (stage.kind === "rivets") { updRivets(); if (state !== "play") return; }
    updDK(); updBarrels(); updPies(); updSprings(); updFires(); collide();
    if (state !== "play") return;
    if (++bonusT >= 120) { bonusT = 0; bonus -= 100; if (bonus <= 0) { bonus = 0; die(); } }
    if (oilFlare > 0) oilFlare--;
  }
  function tick() {
    T++;
    // muzika svira samo dok se igra (ne na pauzi, pri gubitku života, pobedi ni na kraju)
    Mus.play(state === "play" && !paused && !demo ? (m.hammer ? "hammer" : stage.kind) : null);
    Mus.tick();
    if (paused) return;
    st++;
    if (state === "title" && st > DEMO_WAIT && !blocked() && !document.hidden) return startDemo();
    if (demo && ++demoT > DEMO_LEN) return endDemo();
    if (state === "ready" && st > 100) { state = "play"; st = 0; emit(); }
    else if (state === "play") play();
    else if (state === "dying" && st > 130) afterDeath();
    else if (state === "win" && st > 170) nextLevel();
    for (const p of pops) p.t++;
    pops = pops.filter((p) => p.t < 60);
  }

  // ---------- Crtanje ----------
  const FUR = "#a3471a", FURD = "#5e260b", TAN = "#f3c48d";
  function ell(x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  function limb(x0, y0, x1, y1) {
    c.strokeStyle = FUR; c.lineWidth = 6; c.lineCap = "round";
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    ell(x1, y1, 3.6, 3.2, TAN);
  }
  // Pixelify Sans (lokalno, assets/fonts) kao u igri „E ne'š kolega!!!“; dok se ne učita, crta se rezervnim fontom
  const FONT = '"Pixelify Sans", Consolas, "Courier New", monospace';
  // Cifre NE idu Pixelify-em: njegova „5“ liči na „8“, a „7“ na „1“ (korisnik video „28 m“ umesto „25 m“, 31. 10. 2026),
  // pa se brojevi crtaju fontom IBM Plex Mono (isti lokalni fajlovi), a slova ostaju pikselska.
  const DIGITS = '"IBM Plex Mono", Consolas, monospace';
  if (document.fonts) {
    document.fonts.load('700 16px "Pixelify Sans"').catch(() => {});
    document.fonts.load('600 16px "IBM Plex Mono"').catch(() => {});
  }
  const fontFor = (ch, size, mono) => (mono || /[0-9]/.test(ch) ? `600 ${size}px ${DIGITS}` : `700 ${size}px ${FONT}`);
  // tekst se deli na delove (cifre / ostalo), svaki svojim fontom; poravnanje po ukupnoj širini
  function runs(s) { return s.match(/[0-9]+|[^0-9]+/g) || []; }
  function textWidth(s, size, mono) {
    return runs(s).reduce((w, r) => { c.font = fontFor(r[0], size, mono); return w + c.measureText(r).width; }, 0);
  }
  function txt(s, x, y, col, align = "left", size = 8, mono = false) { // mono: sve u IBM Plex Mono (slova za rekord)
    s = String(s);
    const w = textWidth(s, size, mono);
    let px = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
    c.textAlign = "left"; c.fillStyle = col;
    for (const r of runs(s)) { c.font = fontFor(r[0], size, mono); c.fillText(r, px, y); px += c.measureText(r).width; }
  }

  function drawSeg(s) {
    if (s.gone) return; // rupa od izvađene zakovice
    if (s.rivet) { // žuta zakovica
      const x = Math.round(s.x1), y = Math.round(s.yL);
      c.fillStyle = "#ffd23a"; c.fillRect(x, y, 8, 8);
      c.fillStyle = "#b8860b"; c.fillRect(x + 2, y + 2, 4, 4);
      c.fillStyle = "#fff4b0"; c.fillRect(x, y, 8, 1);
      return;
    }
    for (let x = s.x1; x < s.x2; x += 8) { // poslednja pločica se seče na kraju dela grede
      const w = Math.min(8, s.x2 - x), y = Math.round(surf(s, x + w / 2));
      c.drawImage(SP.girder.n, 0, 0, w * S, 8 * S, x, y, w, 8);
    }
    if (!s.belt) return;
    // traka: tamna površina sa svetlim crticama koje putuju u smeru trake, valjci na krajevima
    const b = belts[s.belt], y = Math.round(s.yL);
    c.fillStyle = "#2a1c0a"; c.fillRect(s.x1, y, s.x2 - s.x1, 2);
    c.fillStyle = "#ffb000";
    const off = ((b.phase % 6) + 6) % 6;
    for (let x = s.x1 - 6 + off; x < s.x2; x += 6) {
      const a = Math.max(x, s.x1), e = Math.min(x + 3, s.x2);
      if (e > a) c.fillRect(a, y, e - a, 1);
    }
    for (const ex of [s.x1 + 4, s.x2 - 4]) {
      ell(ex, y + 4.5, 3.5, 3.5, "#ffb000");
      const a = b.phase / 3.5;
      c.fillStyle = "#6b3a00";
      c.fillRect(Math.round(ex + Math.cos(a) * 2) - 0.5, Math.round(y + 4.5 + Math.sin(a) * 2) - 0.5, 1, 1);
      c.fillRect(Math.round(ex - Math.cos(a) * 2) - 0.5, Math.round(y + 4.5 - Math.sin(a) * 2) - 0.5, 1, 1);
    }
  }
  function drawLadder(l) {
    const top = Math.round(l.top) + 8, bot = Math.round(l.bot);
    c.fillStyle = l.retract ? "#7fe8ff" : "#3fd7f2";
    const seg = (a, b) => {
      c.fillRect(l.x - 4, a, 1, b - a); c.fillRect(l.x + 3, a, 1, b - a);
      for (let y = a + 2; y < b; y += 4) c.fillRect(l.x - 4, y, 8, 1);
    };
    if (l.broken) { seg(top, top + 6); seg(bot - 8, bot); }
    else if (l.retract) seg(top, Math.round(top + (bot - top) * (0.3 + 0.7 * l.ext)));
    else seg(top, bot);
  }
  function drawShafts() { // sajle, motor gore i točak dole za svako okno
    for (const sh of stage.shafts || []) {
      const t = stage.liftTop;
      c.fillStyle = "#4a5560";
      c.fillRect(sh.x1 + 2, t, 1, H - t); c.fillRect(sh.x2 - 3, t, 1, H - t);
      c.fillStyle = "#ffb000"; c.fillRect(sh.x1 - 2, t - 8, sh.x2 - sh.x1 + 4, 8);
      c.fillStyle = "#6b3a00"; c.fillRect(sh.x1, t - 6, sh.x2 - sh.x1, 1); c.fillRect(sh.x1, t - 3, sh.x2 - sh.x1, 1);
      // strelica smera
      const cx = (sh.x1 + sh.x2) / 2, ay = t - 4;
      c.fillStyle = "#101214";
      for (let i = 0; i < 3; i++) c.fillRect(cx - i, ay + (sh.dir < 0 ? i : -i) - 0.5 + (sh.dir < 0 ? -1 : 1), 2 * i + 1, 1);
      ell(cx, H - 3, 5, 3, "#ffb000");
    }
  }
  function drawSpring(x, y, squash) { // y = dno opruge
    const h = squash ? 5 : 8, t = Math.round(y - h), l = Math.round(x - 4);
    c.strokeStyle = "#7fe8ff"; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i <= 4; i++) c.lineTo(i % 2 ? l + 7 : l + 1, t + 1 + (h - 2) * i / 4);
    c.stroke();
    c.fillStyle = "#c9d2dc"; c.fillRect(l, t, 8, 1); c.fillRect(l, Math.round(y) - 1, 8, 1);
  }
  function drawDrum(d) {
    const cx = (d.x1 + d.x2) / 2, b = Math.round(surf(d, cx)), x = Math.round(cx - 8), y = b - 16;
    if (oilLit) {
      const big = oilFlare > 0 ? 4 : 0;
      for (let i = 0; i < 4; i++) {
        const h = 4 + big + ((T >> 2) + i * 3) % 4;
        ell(x + 3 + i * 3.3, y - h / 2, 2.2, h / 2 + 0.5, i % 2 ? "#ff5a1f" : "#ff8a1f");
        ell(x + 3 + i * 3.3, y - h / 4, 1.2, h / 4 + 0.3, "#ffd23a");
      }
    }
    c.fillStyle = "#1f5bd6"; c.fillRect(x, y, 16, 16);
    c.fillStyle = "#6aa8ff"; c.fillRect(x, y + 1, 16, 2); c.fillRect(x, y + 13, 16, 2);
    c.fillStyle = "#0d2f80"; c.fillRect(x, y, 16, 1);
    txt("BOT", cx, y + 10.5, "#fff", "center", 6);
  }
  function drawHammer(h) { // pištaljka na vrpci
    if (!h.on) return;
    c.strokeStyle = "#e8402a"; c.lineWidth = 0.75;
    c.beginPath(); c.moveTo(h.x - 2, h.y + 4); c.lineTo(h.x - 1, h.y - 1); c.lineTo(h.x + 2, h.y + 2); c.stroke();
    ell(h.x, h.y + 5.5, 3.2, 2.6, "#ffd23a");
    c.fillStyle = "#ffd23a"; c.fillRect(h.x + 2, h.y + 3, 4, 2);
    c.fillStyle = "#8a6a10"; c.fillRect(h.x - 1, h.y + 5, 2, 1);
  }
  function drawPrize(p) { // Institucijanine stvari: indeks (hat), transparent (purse), Ustav (umbrella)
    if (!p.on) return;
    const x = p.x, y = p.y;
    if (p.kind === "hat") { // indeks
      c.fillStyle = "#2a5cff"; c.fillRect(x - 4, y + 1, 8, 7);
      c.fillStyle = "#fff"; c.fillRect(x - 2, y + 3, 4, 2);
      c.fillStyle = "#123a9c"; c.fillRect(x - 4, y + 1, 1, 7);
    } else if (p.kind === "purse") { // transparent na štapu
      c.fillStyle = "#c8742c"; c.fillRect(x - 0.5, y + 4, 1, 4);
      c.fillStyle = "#fff"; c.fillRect(x - 5, y, 10, 5);
      c.fillStyle = "#e8402a"; c.fillRect(x - 4, y + 1, 8, 1); c.fillRect(x - 3, y + 3, 6, 1);
    } else { // Ustav
      c.fillStyle = "#8a1c1c"; c.fillRect(x - 4, y + 1, 8, 7);
      c.fillStyle = "#e0b53a"; c.fillRect(x - 2, y + 3, 4, 1); c.fillRect(x - 1, y + 5, 2, 1);
    }
  }
  function barrelUp(x, y) { // uspravno bure (gomila pored Donkey Konga)
    c.fillStyle = "#c8742c"; c.fillRect(x, y, 8, 10);
    c.fillStyle = "#6b3510"; c.fillRect(x, y + 1, 8, 1); c.fillRect(x, y + 8, 8, 1);
    c.fillStyle = "#f0b070"; c.fillRect(x + 2, y + 3, 1, 4);
  }
  function barrelFront(cx, by, blue) {
    const x = Math.round(cx - 8), t = Math.round(by - 10);
    c.fillStyle = blue ? "#2d6bff" : "#c8742c"; c.fillRect(x + 1, t, 14, 10); c.fillRect(x, t + 1, 16, 8);
    c.fillStyle = blue ? "#123a9c" : "#6b3510"; c.fillRect(x, t + 2, 16, 1); c.fillRect(x, t + 7, 16, 1);
    c.fillStyle = blue ? "#9cc4ff" : "#f0b070"; c.fillRect(x + 3, t + 4, 10, 1);
  }
  function drawBarrel(b) {
    const y = b.y + b.hz;
    if (b.st === "ladder" || b.st === "drop") return barrelFront(b.x, y, b.blue);
    const x = Math.round(b.x - 6), t = Math.round(y - 10);
    c.fillStyle = b.blue ? "#2d6bff" : "#c8742c"; c.fillRect(x + 1, t, 10, 10); c.fillRect(x, t + 1, 12, 8);
    c.fillStyle = b.blue ? "#123a9c" : "#6b3510"; c.fillRect(x + 2, t, 1, 10); c.fillRect(x + 9, t, 1, 10);
    // svetla pruga se pomera dok se bure kotrlja
    const k = Math.floor(b.rot / 3) % 4;
    const row = b.dir > 0 ? k : 3 - k;
    c.fillStyle = b.blue ? "#9cc4ff" : "#f0b070"; c.fillRect(x + 3, t + 1 + row * 2, 6, 1);
    c.fillStyle = b.blue ? "#123a9c" : "#6b3510"; c.fillRect(x + 3, t + 1 + ((row + 2) % 4) * 2, 6, 1);
  }
  function drawPie(p) { // svežanj tabloida: crveni naslov, sivi redovi
    const x = Math.round(p.x - 5), t = Math.round(p.y - 6);
    c.fillStyle = "#f1efea"; c.fillRect(x, t, 10, 6);
    c.fillStyle = "#e8402a"; c.fillRect(x + 1, t + 1, 8, 2);
    c.fillStyle = "#8a9099"; c.fillRect(x + 1, t + 4, 3, 1); c.fillRect(x + 5, t + 4, 4, 1);
    c.fillStyle = "#5f6670"; c.fillRect(x, t + 5, 10, 1);
  }
  function drawFire(f) { // bot: siva glava sa antenom, crvene oči, nožice
    const x = Math.round(f.x), y = Math.round(f.y - 1 - ((T >> 3) % 2));
    const leg = (T >> 3) % 2;
    c.fillStyle = "#c9d2dc"; c.fillRect(x - 0.5, y - 11, 1, 2);
    c.fillStyle = (T >> 4) % 2 ? "#ff4a3d" : "#ffd23a"; c.fillRect(x - 1, y - 12, 2, 1);
    c.fillStyle = "#9aa3ad"; c.fillRect(x - 4, y - 9, 8, 7);
    c.fillStyle = "#5f6670"; c.fillRect(x - 4, y - 3, 8, 1);
    c.fillStyle = "#ff4a3d"; c.fillRect(x - 3 + (f.dir > 0 ? 1 : 0), y - 7, 2, 2); c.fillRect(x + 1 + (f.dir > 0 ? 1 : 0), y - 7, 2, 2);
    c.fillStyle = "#1a1010"; c.fillRect(x - 2, y - 4, 4, 1);
    c.fillStyle = "#5f6670"; c.fillRect(x - 3 + leg, y - 2, 1, 2); c.fillRect(x + 2 - leg, y - 2, 1, 2);
  }
  function drawPauline() {
    const wave = state === "play" && Math.floor(T / 20) % 2 === 0;
    const gy = floorY(stage.paul.f ?? stage.goal, stage.paul.x + 6);
    put(wave ? SP.paulWave : SP.paul, stage.paul.x, gy - 21);
    if ((state === "play" || state === "ready") && Math.floor(T / 40) % 3 !== 0) txt("VRATI ME!", stage.help.x, stage.help.y, "#fff", "left", 6);
    if (state === "win") put(SP.heart, stage.heart.x, stage.heart.y - (st < 20 ? (20 - st) / 4 : 0));
  }
  function drawDK() {
    const fall = state === "win" && stage.kind === "rivets" ? Math.max(0, st - 30) ** 2 * 0.02 : 0; // 100 m: DK propada
    const cx = Math.round(dk.x), by = Math.round(floorY(stage.dk.f, dk.x) + fall);
    let pose = dk.pose;
    if (state === "win" || state === "dying") pose = "beat";
    if (pose === "idle" && (T % 240) < 60) pose = "beat";
    if (state === "title" && (T % 180) < 70) pose = "beat";
    const up = Math.floor(T / 8) % 2;
    // noge i telo (u 50 m korača dok šeta)
    const step = (stage.kind === "belts" || stage.kind === "rivets") && state === "play" ? (Math.floor(T / 10) % 2 ? 1.5 : -1.5) : 0;
    ell(cx - 10, by - 5 - Math.max(0, step), 7, 5, FUR); ell(cx + 10, by - 5 - Math.max(0, -step), 7, 5, FUR);
    ell(cx - 13, by - 1.6, 5, 2, TAN); ell(cx + 13, by - 1.6, 5, 2, TAN);
    ell(cx, by - 15, 15, 11, FUR);
    ell(cx, by - 14, 9, 7.5, TAN);
    // glava
    ell(cx, by - 28, 9, 8, FUR);
    ell(cx - 8, by - 28, 2.5, 3, TAN); ell(cx + 8, by - 28, 2.5, 3, TAN);
    ell(cx, by - 25, 7, 5, TAN);
    ell(cx - 3, by - 30, 2.4, 2.4, "#fff"); ell(cx + 3, by - 30, 2.4, 2.4, "#fff");
    c.fillStyle = "#000"; c.fillRect(cx - 3, by - 30, 1.4, 1.6); c.fillRect(cx + 2, by - 30, 1.4, 1.6);
    c.fillStyle = FURD; c.fillRect(cx - 6, by - 33.6, 5, 1.4); c.fillRect(cx + 1, by - 33.6, 5, 1.4);
    // kruna Kralja ćacija (lik iz stripa, ne liči ni na koga stvarnog)
    c.fillStyle = "#ffd23a"; c.fillRect(cx - 6, by - 38, 12, 3);
    c.fillRect(cx - 6, by - 41, 2, 3); c.fillRect(cx - 1, by - 42, 2, 4); c.fillRect(cx + 4, by - 41, 2, 3);
    c.fillStyle = "#e8402a"; c.fillRect(cx - 1, by - 37, 2, 1);
    c.fillRect(cx - 2, by - 26.8, 1, 1); c.fillRect(cx + 1, by - 26.8, 1, 1);
    if (pose === "beat") { ell(cx, by - 23, 4, 2, "#3a1405"); c.fillStyle = "#fff"; c.fillRect(cx - 3, by - 24.4, 6, 1); }
    else { c.fillStyle = "#3a1405"; c.fillRect(cx - 4, by - 23.4, 8, 1.4); }
    // ruke
    if (pose === "beat") {
      limb(cx - 12, by - 21, cx - 5, by - (up ? 19 : 13));
      limb(cx + 12, by - 21, cx + 5, by - (up ? 13 : 19));
    } else if (pose === "grab") {
      limb(cx - 12, by - 20, cx - 24, by - 10);
      limb(cx + 12, by - 21, cx - 20, by - 19);
    } else if (pose === "hold") {
      if (stage.kind === "lifts") drawSpring(cx + 25, by - 8, false); else barrelFront(cx + 25, by - 8, false);
      limb(cx - 12, by - 21, cx + 18, by - 17);
      limb(cx + 12, by - 20, cx + 32, by - 14);
    } else if (pose === "drop") {
      limb(cx - 12, by - 20, cx - 7, by - 8);
      limb(cx + 12, by - 20, cx + 7, by - 8);
      barrelFront(cx, by - 2, true);
    } else {
      limb(cx - 12, by - 20, cx - 18, by - 6);
      limb(cx + 12, by - 20, cx + 18, by - 6);
    }
  }
  function drawStack() {
    if (!stage.stack) return;
    const b = Math.round(floorY(stage.dk.f, 10));
    barrelUp(2, b - 10); barrelUp(11, b - 10); barrelUp(2, b - 20); barrelUp(11, b - 20);
  }
  function drawMario() {
    const x = m.x - 6, y = m.y - 16, flip = m.face < 0;
    if (state === "dying") {
      c.save();
      c.translate(Math.round(m.x), Math.round(m.y - 8));
      const a = st < 80 ? Math.floor(st / 8) : 1;
      c.rotate(a * Math.PI / 2);
      put(SP.stand, -6, -8, flip);
      c.restore();
      if (st >= 80) ell(m.x, m.y - 17, 5, 1.5, "rgba(255,255,255,.7)");
      return;
    }
    if (m.st === "climb") return put(SP.climb, x, y, Math.floor(m.climb / 8) % 2 === 1);
    const moving = K.left || K.right;
    const sp = m.st === "jump" ? SP.walk : moving && Math.floor(m.walk / 6) % 2 ? SP.walk : SP.stand;
    put(sp, x, y, flip);
    if (m.hammer) { // pištaljka na ustima, talasi zvižduka ispred (pred kraj crveni)
      const f = m.face, mx = Math.round(m.x + f * 5), my = Math.round(m.y - 12);
      c.fillStyle = "#ffd23a"; c.fillRect(f > 0 ? mx : mx - 3, my, 3, 2);
      const col = m.hammer < 120 && (T >> 2) % 2 ? "#ff4a3d" : "#fff4b0";
      c.strokeStyle = col; c.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) {
        const r = 4 + i * 4 + (m.hUp ? 0 : 2);
        c.beginPath(); c.arc(mx, my + 1, r, f > 0 ? -0.7 : Math.PI - 0.7, f > 0 ? 0.7 : Math.PI + 0.7); c.stroke();
      }
    }
  }
  function drawPops() {
    for (const p of pops) {
      if (p.boom) {
        if (p.t < 18) {
          c.strokeStyle = p.t % 4 < 2 ? "#fff" : "#ffd23a"; c.lineWidth = 1;
          c.beginPath(); c.arc(p.x, p.y, 2 + p.t * 0.5, 0, Math.PI * 2); c.stroke();
        }
      } else txt(p.text, p.x, p.y - p.t * 0.1, "#fff", "center", 6);
    }
  }
  function hud() {
    txt("1UP", 10, 9, "#ff4a3d"); txt(pad(score), 10, 18, "#fff");
    txt("REKORD", 112, 9, "#ff4a3d", "center"); txt(pad(Math.max(best, score)), 112, 18, "#fff", "center");
    txt("NIVO", 214, 9, "#ff4a3d", "right"); txt(String(level).padStart(2, "0"), 214, 18, "#fff", "right");
    for (let i = 0; i < Math.min(lives - 1, 6); i++) put(SP.stand, 10 + i * 8, 22, false, 0.5);
    c.strokeStyle = "#2a5cff"; c.lineWidth = 1; c.strokeRect(170.5, 28.5, 45, 18);
    txt("BONUS", 193, 35, "#3fd7f2", "center", 5);
    const warn = bonus <= 1000 && state === "play" && (T >> 4) % 2;
    txt(String(bonus), 193, 44, warn ? "#ff4a3d" : "#fff", "center", 7);
  }
  // Poziv na novu igru stoji ceo (ne trepće - korisnikova želja), a boje putuju preko slova kao talas.
  const WAVE = ["#3fd7f2", "#7fe8ff", "#ffffff", "#ffd23a", "#F0A23B", "#ff4a3d", "#ff5fb8", "#c58bff"];
  function waveTxt(s, cx, y, size = 7) {
    c.textAlign = "left";
    let x = cx - textWidth(s, size) / 2;
    [...s].forEach((ch, i) => {
      c.font = fontFor(ch, size);
      c.fillStyle = WAVE[(i + (T >> 3)) % WAVE.length];
      c.fillText(ch, x, y);
      x += c.measureText(ch).width;
    });
  }
  function box(lines, y = 150) {
    const h = lines.length * 12 + 10;
    c.fillStyle = "rgba(0,0,0,.84)"; c.fillRect(30, y - h / 2, 164, h);
    c.strokeStyle = "#F0A23B"; c.lineWidth = 1; c.strokeRect(30.5, y - h / 2 + 0.5, 163, h - 1);
    lines.forEach((ln, i) => {
      const ly = y - h / 2 + 15 + i * 12;
      if (ln[1] === "wave") waveTxt(ln[0], 112, ly, ln[2] || 8);
      else txt(ln[0], 112, ly, ln[1] || "#fff", "center", ln[2] || 8);
    });
  }
  function drawNameEntry() { // upis tri slova za rekord; izabrano slovo se preliva bojama (ne trepće)
    const top = 94, h = 116;
    c.fillStyle = "rgba(0,0,0,.88)"; c.fillRect(30, top, 164, h);
    c.strokeStyle = "#F0A23B"; c.lineWidth = 1; c.strokeRect(30.5, top + 0.5, 163, h - 1);
    txt("KRAJ IGRE", 112, top + 16, "#ff4a3d", "center");
    txt(`POENI ${score}`, 112, top + 28, "#fff", "center");
    txt(newBest ? "NOVI REKORD!" : "MEĐU DESET NAJBOLJIH!", 112, top + 40, "#F0A23B", "center", newBest ? 8 : 7);
    txt("UPIŠI SVOJA TRI SLOVA", 112, top + 54, "#c9ccd1", "center", 6);
    for (let i = 0; i < 3; i++) {
      const x = 92 + i * 20, cur = i === nameI;
      txt(name[i], x, top + 80, cur ? WAVE[(T >> 3) % WAVE.length] : "#fff", "center", 18, true); // u Pixelify-ju G liči na Q
      c.fillStyle = cur ? "#F0A23B" : "#4a5560"; c.fillRect(x - 6, top + 84, 12, cur ? 2 : 1);
    }
    txt("slova sa tastature ili ↑↓, pa ENTER", 112, top + 104, "#7d868e", "center", 5);
  }
  function panel(x, y, w, h, a) { // tamni providni okvir zaobljenih uglova sa tankim narandžastim rubom
    c.fillStyle = `rgba(0,0,0,${a})`;
    c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill();
    c.strokeStyle = "rgba(240,162,59,.55)"; c.lineWidth = 0.75;
    c.beginPath(); c.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, 6); c.stroke();
  }
  function overlay() {
    if (state === "title") {
      // tamni providni okvir samo oko naslova, ostatak table se vidi (korisnik 31. 10. 2026)
      panel(28, 90, 168, 100, 0.74);
      for (const [s, y] of [["NENADLEŽNI", 116], ["PRIMAT", 138]]) { txt(s, 113.5, y + 1.5, "#8a1c1c", "center", 20); txt(s, 112, y, "#F0A23B", "center", 20); }
      txt("Povratak institucijama", 112, 156, "#fff", "center", 8);
      txt("Jedan student. Jedan kralj. Bezbroj buradi.", 112, 167, "#c9ccd1", "center", 5);
      waveTxt("ENTER ili SPACE - nova igra", 112, 178, 7);
    } else if (demo) {
      panel(40, 124, 144, 36, 0.62);
      txt("DEMO", 112, 138, "#F0A23B", "center", 9);
      waveTxt("ENTER ili SPACE - nova igra", 112, 152, 7);
    } else if (state === "ready") {
      box([[`NIVO ${level}`, "#F0A23B"], [stage.name, "#3fd7f2", 8], [stage.title, "#c9ccd1", 6], ...(stage.tip ? [[stage.tip, "#ffd23a", 6]] : []), ["SPREMI SE!"]]);
    } else if (state === "win") {
      box([["INSTITUCIJA VRAĆENA!", "#F0A23B"], [`BONUS +${bonus}`]]);
    } else if (state === "over") {
      const lines = [["KRAJ IGRE", "#ff4a3d"], [`POENI ${score}`]];
      if (newBest) lines.push(["NOVI REKORD!", "#F0A23B"]);
      // red stoji od početka (okvir ne skače); prvih trenutaka je prigušen dok Enter još ne važi
      lines.push(canStart() ? ["ENTER - nova igra", "wave", 7] : ["ENTER - nova igra", "#4a5560", 7]);
      box(lines);
    } else if (state === "name") drawNameEntry();
    if (paused) box([["PAUZA", "#F0A23B"], ["P ili ENTER - nastavi", "#fff", 7]]);
  }
  function draw() {
    c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
    drawShafts();
    for (const l of lads) drawLadder(l);
    for (const s of segs) drawSeg(s);
    blocks.forEach(drawDrum); hams.forEach(drawHammer); prizes.forEach(drawPrize);
    drawStack(); drawPauline(); drawDK();
    barrels.forEach(drawBarrel); pies.forEach(drawPie); fires.forEach(drawFire);
    springs.forEach((s) => drawSpring(s.x, s.y, s.sq > 0));
    drawMario(); drawPops(); hud(); overlay();
  }

  // ---------- Petlja ----------
  par = P(); resetStage();
  let last = performance.now(), acc = 0;
  const STEP = 1000 / 60;
  function frame(now) {
    acc += Math.min(250, now - last); last = now;
    while (acc >= STEP) { tick(); acc -= STEP; }
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.DK = {
    start,
    togglePause: () => setPaused(!paused),
    setSound,
    soundOn: () => Snd.on,
    setMusic,
    musicOn: () => Mus.on,
    records,
    state: () => ({ state, paused, demo }),
    // za proveru iz konzole (vidi CLAUDE.md)
    _dbg: () => ({ mus: Mus, snd: Snd, songs: SONGS, m, barrels, pies, springs, fires, score, lives, level, bonus, hams, prizes, lads, belts, lifts, dk }),
    _step: (n) => { for (let i = 0; i < n; i++) tick(); draw(); },
    _clear: () => { barrels = []; pies = []; springs = []; fires = []; },
  };
})();
