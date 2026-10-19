(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Raspored stola 1v1
const tableRow = (y, mirrored, dim) => {
  const W = 600;
  const items = [
    [10, 0, 70, 80, "Legend"],
    [88, 0, 80, 80, "Champion"],
    [176, 0, 236, 80, "Base", "rune · jedinice · gear"],
    [420, 0, 86, 37, "Main Deck"],
    [420, 43, 86, 37, "Rune Deck"],
    [514, 0, 76, 80, "Trash"]
  ];
  return `<g class="${dim ? "f-dim" : ""}">${items
    .map(([x, dy, w, h, t, sub]) => {
      const xx = mirrored ? W - x - w : x;
      const yy = mirrored ? y + (80 - dy - h) : y + dy;
      return F.box(xx, yy, w, h, t, { sub, titleCls: h < 40 ? "f-title f-small" : "f-title" });
    })
    .join("")}</g>`;
};

const FIG_TABLE = F.figure(
  600, 386,
  F.text(10, 18, "PROTIVNIK", { cls: "f-label", anchor: "start" }) +
    tableRow(26, true, true) +
    F.box(110, 142, 180, 96, "Battlefield", { cls: "f-acc", sub: "izabrao igrač 1" }) +
    F.box(310, 142, 180, 96, "Battlefield", { cls: "f-acc", sub: "izabrao igrač 2" }) +
    tableRow(272, false, false) +
    F.text(10, 376, "TI", { cls: "f-label", anchor: "start" }),
  { caption: "Raspored stola u igri 1v1. Base i battlefield-i su „tabla“; Legend, Champion Zone, špilovi i Trash su van nje." }
);

// Tok poteza
const step = (x, y, t, sub, acc) => F.box(x, y, 140, 74, t, { sub, cls: acc ? "f-acc" : "f-box" });
const FIG_TURN = F.figure(
  480, 234,
  step(10, 10, "A · Awaken", "ready sve karte") +
    step(170, 10, "B · Beginning", "okidači + Hold") +
    step(330, 10, "C · Channel", "+2 rune u bazu") +
    step(330, 150, "D · Draw", "+1 karta") +
    step(170, 150, "Main", "igraj · kreći · bori se", true) +
    step(10, 150, "End", "leči · briše efekte") +
    F.arrow(150, 47, 168, 47) +
    F.arrow(310, 47, 328, 47) +
    F.arrow(400, 84, 400, 148) +
    F.arrow(330, 187, 312, 187) +
    F.arrow(170, 187, 152, 187) +
    F.arrow(80, 150, 80, 86, { dashed: true }) +
    F.text(92, 122, "sledeći igrač", { cls: "f-muted", anchor: "start" }),
  { caption: "Potez: prve četiri faze su automatske (A-B-C-D), zatim Main faza u kojoj igraš, pa kraj poteza." }
);

// Exhaust vs Recycle
const FIG_RUNES = F.figure(
  480, 200,
  F.rect(200, 20, 80, 110, { cls: "f-card" }) +
    `<circle cx="240" cy="58" r="16" class="f-acc"/>` +
    F.text(240, 108, "Runa", { cls: "f-title" }) +
    // exhaust: runa okrenuta bočno
    F.rect(20, 42, 110, 66, { cls: "f-card" }) +
    `<circle cx="50" cy="75" r="13" class="f-acc"/>` +
    F.text(94, 80, "Runa", { cls: "f-title f-small" }) +
    F.arrow(198, 75, 134, 75, { accent: true }) +
    F.text(166, 64, "Exhaust", { cls: "f-kw f-small" }) +
    // recycle: na dno Rune Deck-a
    F.rect(362, 28, 80, 102, { cls: "f-card f-back" }) +
    F.rect(356, 24, 80, 102, { cls: "f-card f-back" }) +
    F.rect(350, 20, 80, 102, { cls: "f-card f-back" }) +
    F.text(390, 68, ["Rune", "Deck"], { cls: "f-title f-small", lh: 17 }) +
    F.arrow(282, 75, 346, 75, { accent: true }) +
    F.text(314, 64, "Recycle", { cls: "f-kw f-small" }) +
    F.text(75, 152, "+1 Energy", { cls: "f-title" }) +
    F.text(75, 170, ["bilo koji domen", "runa ostaje u bazi"], { cls: "f-muted", lh: 15 }) +
    F.text(396, 152, "+1 Power", { cls: "f-title" }) +
    F.text(396, 170, ["domena te rune", "runa ide na dno špila"], { cls: "f-muted", lh: 15 }),
  { caption: "Dva načina da runa da resurs. Ista runa može oba: prvo Exhaust, pa Recycle." }
);

// Standard Move
const FIG_MOVE = F.figure(
  480, 248,
  F.box(20, 10, 180, 70, "Battlefield 1", { cls: "f-acc" }) +
    F.box(280, 10, 180, 70, "Battlefield 2", { cls: "f-acc" }) +
    F.box(140, 172, 200, 66, "Base", { sub: "tvoja baza" }) +
    F.arrow(185, 170, 120, 82, { both: true }) +
    F.arrow(295, 170, 360, 82, { both: true }) +
    F.arrow(203, 45, 277, 45, { both: true, dashed: true, accent: true }) +
    F.text(240, 36, "Ganking", { cls: "f-kw f-small" }) +
    F.text(138, 122, "Standard Move", { cls: "f-title f-small", anchor: "end" }) +
    F.text(138, 138, "exhaust jedinice", { cls: "f-muted", anchor: "end" }) +
    F.text(342, 122, "Standard Move", { cls: "f-title f-small", anchor: "start" }) +
    F.text(342, 138, "exhaust jedinice", { cls: "f-muted", anchor: "start" }),
  { caption: "Baza ↔ battlefield uvek; battlefield ↔ battlefield samo jedinice sa Ganking." }
);

// Šta se dešava po dolasku
const branch = (x, q, result, note, acc) =>
  F.rect(x, 118, 148, 108, { cls: acc ? "f-acc" : "f-box" }) +
  F.text(x + 74, 140, q, { cls: "f-muted", lh: 15 }) +
  F.text(x + 74, 190, result, { cls: acc ? "f-kw f-mid" : "f-title" }) +
  (note ? F.text(x + 74, 210, note, { cls: "f-muted" }) : "");
const FIG_ARRIVE = F.figure(
  480, 232,
  F.box(115, 8, 250, 50, "Jedinica stiže na battlefield") +
    F.arrow(240, 58, 80, 116) +
    F.arrow(240, 58, 240, 116) +
    F.arrow(240, 58, 400, 116) +
    branch(6, ["Već ga", "kontrolišeš"], "Ništa posebno") +
    branch(166, ["Prazan je i", "nije tvoj"], "Showdown", "→ Conquer +1", true) +
    branch(326, ["Tu su protivničke", "jedinice"], "Combat", "pobednik: Conquer +1", true),
  { caption: "Posle svakog pomeranja proveri gde je jedinica stigla." }
);

// Primer dodele štete u borbi
const card = (x, might, { tank, dead } = {}) =>
  F.rect(x, 56, 80, 96, { cls: dead ? "f-card f-dead" : "f-card" }) +
  (tank ? F.text(x + 40, 76, "Tank", { cls: "f-kw f-small" }) : "") +
  F.text(x + 40, 116, String(might), { cls: "f-big" }) +
  F.text(x + 40, 138, "Might", { cls: "f-muted" });
const dmg = (x, amount, dies) =>
  F.text(x + 40, 174, amount, { cls: "f-title f-small" }) +
  F.text(x + 40, 192, dies ? "✕ umire" : "✓ preživi", { cls: dies ? "f-danger" : "f-ok" });
const FIG_COMBAT = F.figure(
  480, 204,
  F.text(110, 22, "NAPADAČ", { cls: "f-label" }) +
    F.text(110, 40, "ukupno 5 štete", { cls: "f-muted" }) +
    F.text(370, 22, "BRANILAC", { cls: "f-label" }) +
    F.text(370, 40, "ukupno 6 štete", { cls: "f-muted" }) +
    `<line x1="240" y1="8" x2="240" y2="200" class="f-divider"/>` +
    card(30, 3, { dead: true }) + card(130, 2, { dead: true }) +
    card(280, 2, { tank: true, dead: true }) + card(380, 4) +
    dmg(30, "prima 3", true) + dmg(130, "prima 2 (+1)", true) +
    dmg(280, "prima 2", true) + dmg(380, "prima 3", false),
  { caption: "Primer: raspodela borbene štete." }
);

// Anatomija karte (jedinica) - šematski, sa oznakama
const textLines = (x, y, w, n, gap = 11) =>
  Array.from({ length: n }, (_, i) =>
    `<line x1="${x}" y1="${y + i * gap}" x2="${x + (i === n - 1 ? w * 0.6 : w)}" y2="${y + i * gap}" class="f-textline"/>`
  ).join("");
const leader = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="f-leader"/><circle cx="${x2}" cy="${y2}" r="2.5" class="f-dot"/>`;

const FIG_CARD_ANATOMY = F.figure(
  480, 272,
  F.rect(150, 10, 180, 252, { cls: "f-card", r: 10 }) +
    F.rect(158, 18, 164, 112, { cls: "f-illus", r: 6 }) +
    F.text(240, 84, "ilustracija", { cls: "f-muted" }) +
    `<circle cx="174" cy="36" r="15" class="f-cost"/>` +
    F.text(174, 41, "3", { cls: "f-title" }) +
    `<circle cx="174" cy="62" r="6.5" class="f-acc"/><circle cx="174" cy="79" r="6.5" class="f-acc"/>` +
    F.rect(292, 22, 28, 28, { cls: "f-might", r: 5 }) +
    F.text(306, 41, "4", { cls: "f-title" }) +
    F.rect(158, 134, 164, 20, { cls: "f-box", r: 4 }) +
    F.text(240, 148, "Ime karte", { cls: "f-title f-small" }) +
    F.text(240, 168, "CHAMPION UNIT · TAG", { cls: "f-label" }) +
    F.rect(158, 176, 164, 60, { cls: "f-box", r: 4 }) +
    textLines(168, 190, 144, 3) +
    `<line x1="180" y1="226" x2="290" y2="226" class="f-textline f-flavor"/>` +
    `<circle cx="312" cy="248" r="6" class="f-acc"/>` +
    F.text(240, 252, "OGN · 042 · ◆", { cls: "f-muted" }) +
    // oznake levo
    F.text(138, 40, "Cena (Energy)", { cls: "f-small f-title", anchor: "end" }) + leader(140, 36, 158, 36) +
    F.text(138, 74, ["Power -", "simboli domena"], { cls: "f-small", anchor: "end", lh: 15 }) + leader(140, 74, 167, 70) +
    F.text(138, 148, "Ime", { cls: "f-small f-title", anchor: "end" }) + leader(140, 144, 158, 144) +
    F.text(138, 172, "Tip i tagovi", { cls: "f-small f-title", anchor: "end" }) + leader(140, 168, 170, 166) +
    // oznake desno
    F.text(342, 40, "Might", { cls: "f-small f-title", anchor: "start" }) + leader(340, 36, 320, 36) +
    F.text(342, 196, ["Tekst: ključne reči", "i sposobnosti"], { cls: "f-small", anchor: "start", lh: 15 }) + leader(340, 196, 322, 196) +
    F.text(342, 234, "Domen (boja)", { cls: "f-small f-title", anchor: "start" }) + leader(340, 238, 318, 246) +
    F.text(342, 262, "Set · broj · retkost", { cls: "f-small", anchor: "start" }) + leader(340, 258, 282, 250),
  { caption: "Šematski prikaz jedinice. Spell i Gear izgledaju isto, samo bez Might-a." }
);

// Sve vrste karata jedna pored druge
const mini = (x, kind) => {
  const y = 14, w = 80, h = 118;
  if (kind === "battlefield") {
    return (
      F.rect(x, 31, 118, 84, { cls: "f-card f-acc-stroke", r: 7 }) +
      F.rect(x + 6, 50, 106, 46, { cls: "f-illus", r: 4 }) +
      `<line x1="${x + 20}" y1="42" x2="${x + 98}" y2="42" class="f-textline"/>` +
      `<line x1="${x + 20}" y1="105" x2="${x + 98}" y2="105" class="f-textline"/>`
    );
  }
  let s = F.rect(x, y, w, h, { cls: "f-card", r: 7 });
  if (kind === "rune") return s + `<circle cx="${x + 40}" cy="${y + 52}" r="22" class="f-acc"/>` + textLines(x + 14, y + 96, 52, 2, 9);
  s += F.rect(x + 6, y + 6, 68, 56, { cls: "f-illus", r: 4 });
  if (kind === "legend") s += `<circle cx="${x + 15}" cy="${y + 16}" r="6" class="f-acc"/><circle cx="${x + 29}" cy="${y + 16}" r="6" class="f-acc"/>`;
  else s += `<circle cx="${x + 15}" cy="${y + 16}" r="9" class="f-cost"/>`;
  if (kind === "unit") s += F.rect(x + 56, y + 7, 17, 17, { cls: "f-might", r: 3 });
  s += textLines(x + 10, y + 76, 60, kind === "spell" ? 4 : 3, 9);
  if (kind === "gear") s += F.text(x + 66, y + 112, "+1", { cls: "f-kw f-tiny" });
  return s;
};
const typeLabel = (cx, name, lines) =>
  F.text(cx, 154, name, { cls: "f-title f-small" }) + F.text(cx, 171, lines, { cls: "f-muted", lh: 14 });
const FIG_CARD_TYPES = F.figure(
  600, 200,
  mini(10, "legend") + typeLabel(50, "Legend", ["vođa špila", "sposobnosti"]) +
    mini(102, "unit") + typeLabel(142, "Unit", ["bori se", "osvaja poene"]) +
    mini(194, "spell") + typeLabel(234, "Spell", ["jednokratno", "→ Trash"]) +
    mini(286, "gear") + typeLabel(326, "Gear", ["trajni predmet", "u bazi"]) +
    mini(378, "rune") + typeLabel(418, "Rune", ["daje Energy", "i Power"]) +
    mini(470, "battlefield") + typeLabel(529, "Battlefield", ["mesto borbe", "donosi poene"]),
  { caption: "Vrste karata ukratko. Krug gore levo je cena, kvadrat gore desno je Might (samo jedinice)." }
);

// Četiri stanja poteza (2×2)
const stateCell = (x, y, title, lines, acc) =>
  F.rect(x, y, 190, 80, { cls: acc ? "f-acc" : "f-box" }) +
  F.text(x + 95, y + 26, title, { cls: "f-title f-small" }) +
  F.text(x + 95, y + 48, lines, { cls: "f-muted", lh: 15 });
const FIG_STATES = F.figure(
  520, 214,
  F.text(225, 20, "nema chain-a → Open", { cls: "f-label" }) +
    F.text(420, 20, "ima chain → Closed", { cls: "f-label" }) +
    F.text(108, 76, ["Neutral", "(nema", "showdown-a)"], { cls: "f-title f-small", anchor: "end", lh: 15 }) +
    F.text(108, 166, ["Showdown", "ili borba"], { cls: "f-title f-small", anchor: "end", lh: 15 }) +
    stateCell(130, 34, "Neutral Open", ["sve karte - samo igrač", "na potezu, u Main fazi"]) +
    stateCell(325, 34, "Neutral Closed", ["samo Reaction", "(oba igrača)"], true) +
    stateCell(130, 124, "Showdown Open", ["Action i Reaction", "- ko ima Focus"]) +
    stateCell(325, 124, "Showdown Closed", ["samo Reaction", "(oba igrača)"], true),
  { caption: "Chain „zatvara“ stanje: dok postoji, igraju se samo Reaction karte." }
);

// Chain: koraci + primer
const chainStep = (y, t, sub) => F.box(10, y, 190, 44, t, { sub, titleCls: "f-title f-small" });
const FIG_CHAIN = F.figure(
  540, 252,
  chainStep(10, "1 · Finalize", "mete i cena su zaključani") +
    chainStep(66, "2 · Execute", "Reaction ili pass") +
    chainStep(122, "3 · Pass", "svi passovali redom?") +
    chainStep(178, "4 · Resolve", "razreši najnoviju stavku") +
    F.arrow(105, 54, 105, 64) + F.arrow(105, 110, 105, 120) + F.arrow(105, 166, 105, 176) +
    `<path d="M200,200 C246,200 246,88 202,88" class="f-line dashed"/>` + `<polygon class="f-head" points="202,88 211,84 211,92"/>` +
    F.text(246, 146, ["još", "stavki?"], { cls: "f-muted", anchor: "start", lh: 14 }) +
    F.text(105, 242, "kad se chain isprazni → Open", { cls: "f-muted" }) +
    F.text(430, 22, "CHAIN (primer)", { cls: "f-label" }) +
    F.box(340, 34, 180, 56, "2. Reaction protivnika", { cls: "f-acc", sub: "+3 Might jedinici", titleCls: "f-title f-small" }) +
    F.box(340, 98, 180, 56, "1. Tvoj spell", { sub: "3 štete jedinici", titleCls: "f-title f-small" }) +
    F.arrow(528, 150, 528, 40, { accent: true }) +
    F.text(430, 178, ["Razrešava se odozgo:", "prvo +3 Might, pa 3 štete", "→ jedinica preživi"], { cls: "f-muted", lh: 15 }),
  { caption: "Chain: poslednje dodato se razrešava prvo. Posle svakog razrešavanja može se ponovo odgovarati." }
);

registerGame({
  id: "riftbound",
  cover: "images/riftbound.jpg",
  coverPos: "50% 0%",
  title: "Riftbound",
  subtitle: "League of Legends Trading Card Game",
  publisher: "Riot Games",
  players: "2 (1v1); 3–4 u multiplayer modovima",
  category: "Kartaška igra (TCG)",
  accent: "#c8a24a",
  owned: "Osnovna igra",
  rulesVersion: "Core Rules v2026-07-16",
  summary:
    "Dva igrača, svaki sa svojim Legend-om i šampionom, bore se za kontrolu nad battlefield-ima. Osvajaj i drži battlefield-e da skupljaš poene - prvi do 8 poena pobeđuje.",

  // ─────────────────────────────── BRZI PODSETNIK (1 strana A4) ───────────────────────────────
  quickRef: [
    {
      title: "Cilj igre",
      html: `
        <p>Prvi igrač sa <b>8 poena</b> pobeđuje (1v1).</p>
        <ul>
          <li><b class="kw">Conquer</b> - preuzmeš kontrolu nad battlefield-om: <b>+1</b></li>
          <li><b class="kw">Hold</b> - na početku svog poteza, za svaki battlefield koji kontrolišeš: <b>+1</b></li>
          <li><b class="kw">Burn Out</b> - protivnik treba da vuče iz praznog špila: tebi <b>+1</b></li>
          <li>Svaki battlefield boduješ <b>najviše jednom po potezu</b>.</li>
        </ul>
        <p class="note"><b>Poslednji poen:</b> pobedonosni poen preko <b class="kw">Conquer</b> dobijaš samo ako si ovaj potez već bodovao <i>sve ostale</i> battlefield-e. Inače umesto poena vučeš 1 kartu. (Hold važi normalno.)</p>`
    },
    {
      title: "Priprema",
      html: `
        <ol>
          <li><b class="kw">Legend</b> u Legend Zone, <b class="kw">Chosen Champion</b> u Champion Zone.</li>
          <li>Svaki igrač nasumično bira 1 od svoja 3 battlefield-a → u igri su 2.</li>
          <li>Promešaj Main Deck (40+) i Rune Deck (12) odvojeno.</li>
          <li>Izvuci <b>4 karte</b>. Mulligan: odloži do 2, izvuci isto toliko, odložene <b class="kw">Recycle</b> (na dno špila, bez mešanja).</li>
          <li>Drugi igrač u svom prvom Channel-u uzima <b>3 rune</b> umesto 2.</li>
        </ol>`
    },
    {
      title: "Potez - A · B · C · D",
      html: `
        <ol>
          <li><b>Awaken</b> - ready sve svoje karte (rune, jedinice, gear, legend).</li>
          <li><b>Beginning</b> - okidači „na početku poteza“; <b class="kw">Temporary</b> umire; zatim <b class="kw">Hold</b> bodovanje.</li>
          <li><b>Channel</b> - 2 rune sa Rune Deck-a stavi u bazu.</li>
          <li><b>Draw</b> - vuci 1 kartu. Rune Pool se prazni.</li>
          <li><b>Main</b> - igraj karte, pomeraj jedinice, aktiviraj sposobnosti, bori se.</li>
          <li><b>End</b> - okidači kraja poteza → sve jedinice se leče, efekti „this turn“ ističu, Stun nestaje, Rune Pool se prazni.</li>
        </ol>`
    },
    {
      title: "Resursi (runes)",
      html: `
        <ul>
          <li><b class="kw">Exhaust</b> runu → <b>1 Energy</b> (bilo koje boje). Broj u uglu karte.</li>
          <li><b class="kw">Recycle</b> runu (na dno Rune Deck-a) → <b>1 Power</b> domena te rune. Simboli na karti.</li>
          <li>Ista runa može prvo da se exhaust-uje, pa recycle-uje.</li>
          <li>Neiskorišćen Energy/Power nestaje na kraju poteza.</li>
        </ul>`
    },
    {
      title: "Vrste karata",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Unit</td><td>bori se i osvaja; ima Might (gore desno)</td></tr>
          <tr><td class="kw">Spell</td><td>jednokratni efekat → Trash</td></tr>
          <tr><td class="kw">Gear</td><td>trajni predmet u bazi, ulazi ready</td></tr>
          <tr><td class="kw">Rune</td><td>resursi; stižu iz Rune Deck-a</td></tr>
          <tr><td class="kw">Legend</td><td>vođa: boje špila + sposobnosti</td></tr>
          <tr><td class="kw">Battlefield</td><td>mesto borbe, donosi poene</td></tr>
        </table>
        <p>Cena gore levo: broj = Energy, simboli ispod = Power te boje.</p>`
    },
    {
      title: "Kretanje",
      html: `
        <ul>
          <li>Jedinice ulaze u igru <b>exhausted</b> (osim uz <b class="kw">Accelerate</b>), u tvoju bazu ili na battlefield koji kontrolišeš.</li>
          <li><b>Standard Move</b> = exhaust jedinicu: baza ↔ battlefield. Više jedinica može zajedno.</li>
          <li>Battlefield → battlefield samo uz <b class="kw">Ganking</b>.</li>
          <li>Ulazak na prazan tuđi/neutralni battlefield → <b>Showdown</b>. Na protivničke jedinice → <b>Combat</b>.</li>
        </ul>`
    },
    {
      title: "Borba (Combat)",
      html: `
        <ol>
          <li>Ko je ušao = <b>napadač</b> (dobija Focus). Okidači napada/odbrane.</li>
          <li>Naizmenično <b class="kw">Action</b> / <b class="kw">Reaction</b> karte dok oba igrača ne passuju.</li>
          <li>Svaka strana sabira <b>Might</b>. Napadač prvi raspoređuje štetu, pa branilac.</li>
          <li>Pravila raspodele: jedna jedinica mora dobiti <b>smrtonosnu</b> štetu pre sledeće; <b class="kw">Tank</b> prvi, <b class="kw">Backline</b> poslednji. Šteta se deli istovremeno.</li>
          <li>Umire svaka jedinica sa štetom ≥ Might. Sve preživele se leče.</li>
          <li>Ako branilac ima preživele → napadači <b>recall</b> u bazu. Ako samo napadač ima jedinice → kontrola + <b class="kw">Conquer</b>.</li>
        </ol>`
    },
    {
      title: "Brzine karata",
      html: `
        <ul>
          <li><b>Bez ključne reči</b> - samo u tvom Main-u, kad nema chain-a ni showdown-a.</li>
          <li><b class="kw">Action</b> - to, plus tokom showdown-a/borbe (kad imaš Focus), u bilo čijem potezu.</li>
          <li><b class="kw">Reaction</b> - sve to, plus kao <b>odgovor na chain</b>. U protivnikovom potezu: samo kad postoji chain ili showdown.</li>
          <li>Chain se razrešava <b>od poslednjeg ka prvom</b>. Jedinice i gear se razrešavaju odmah - na njih se ne odgovara.</li>
        </ul>`
    },
    {
      title: "Ključne reči (Origins)",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Accelerate</td><td>+1 Energy +1 Power pri igranju → ulazi ready</td></tr>
          <tr><td class="kw">Assault X</td><td>+X Might dok napada</td></tr>
          <tr><td class="kw">Shield X</td><td>+X Might dok brani</td></tr>
          <tr><td class="kw">Tank</td><td>mora prvi da primi smrtonosnu štetu</td></tr>
          <tr><td class="kw">Ganking</td><td>Standard Move battlefield → battlefield</td></tr>
          <tr><td class="kw">Deflect X</td><td>protivnik plaća +X Power da ga cilja</td></tr>
          <tr><td class="kw">Hidden</td><td>sakrij na svoj battlefield za 1 Power; od sledećeg poteza igraj besplatno kao Reaction</td></tr>
          <tr><td class="kw">Legion</td><td>bonus ako si ovaj potez već odigrao drugu kartu</td></tr>
          <tr><td class="kw">Deathknell</td><td>„Kad umrem…“</td></tr>
          <tr><td class="kw">Vision</td><td>kad uđe: pogledaj vrh špila, možeš ga Recycle</td></tr>
          <tr><td class="kw">Temporary</td><td>umire na početku tvog Beginning-a</td></tr>
        </table>`
    }
  ],

  // ─────────────────────────────── PUNA PRAVILA ───────────────────────────────
  rules: [
    {
      id: "pregled",
      title: "Pregled igre",
      html: `
        <p>Riftbound je kartaška igra smeštena u svet League of Legends. Svaki igrač vodi jednog <b class="kw">Legend</b>-a (vođu špila) i njegovog <b class="kw">Chosen Champion</b>-a. Na stolu se nalaze <b class="kw">Battlefield</b>-i - mesta za koja se igrači bore. Jedinice šalješ iz svoje <b class="kw">Base</b> na battlefield-e; ko ih kontroliše, osvaja poene.</p>
        <p>Resursi dolaze iz <b class="kw">Rune</b> karata, koje svakog poteza stižu iz posebnog Rune Deck-a. Rune daju <b class="kw">Energy</b> (opšti resurs) i <b class="kw">Power</b> (resurs određene boje/domena).</p>
        <p>U igri 1v1 pobeđuje prvi igrač koji skupi <b>8 poena</b>.</p>
        <div class="note"><b>Zlatno pravilo:</b> ako se tekst na karti kosi sa pravilima, važi tekst karte.<br>
        <b>„Can't“ pobeđuje „Can“:</b> ako jedan efekat kaže da nešto <i>može</i>, a drugi da <i>ne može</i> - ne može.</div>`
    },
    {
      id: "spil",
      title: "Sastav špila",
      html: `
        <p>Kompletan špil čine:</p>
        <table>
          <tr><th>Deo</th><th>Pravilo</th></tr>
          <tr><td><b class="kw">Champion Legend</b></td><td>Tačno 1. Određuje <b>Domain Identity</b> špila (dva domena prikazana u gornjem levom uglu).</td></tr>
          <tr><td><b class="kw">Main Deck</b></td><td><b>Najmanje 40 karata</b>, uključujući Chosen Champion-a.</td></tr>
          <tr><td><b class="kw">Chosen Champion</b></td><td>Champion jedinica sa istim champion tag-om kao Legend (npr. Legend „Jinx“ → neka Jinx karta). Ne sme biti Signature jedinica.</td></tr>
          <tr><td><b class="kw">Rune Deck</b></td><td><b>Tačno 12 runa</b> iz domena tvog Legend-a.</td></tr>
          <tr><td><b class="kw">Battlefields</b></td><td>Za 1v1: <b>3 različita</b> battlefield-a.</td></tr>
        </table>
        <h4>Ograničenja</h4>
        <ul>
          <li>Najviše <b>3 kopije</b> karte istog imena (računajući i Chosen Champion-a). Različite verzije istog šampiona (npr. „Yasuo, Remorseful“ i „Yasuo, Windrider“) su različita imena.</li>
          <li>Najviše <b>3 Signature karte ukupno</b>, i sve moraju imati champion tag tvog Legend-a.</li>
          <li>Karte sa <b class="kw">Unique</b>: najviše 1 kopija.</li>
          <li>Svaka karta mora odgovarati Domain Identity-ju: jednobojna karta mora biti jednog od tvoja dva domena; višebojna mora imati <i>sve</i> svoje domene u tvom identitetu.</li>
        </ul>
        <h4>Domeni (boje)</h4>
        <p><b class="kw">Fury</b> (crvena) · <b class="kw">Calm</b> (zelena) · <b class="kw">Mind</b> (plava) · <b class="kw">Body</b> (narandžasta) · <b class="kw">Chaos</b> (ljubičasta) · <b class="kw">Order</b> (žuta)</p>
        <div class="note">Starter/demo špilovi iz osnovne kutije su već složeni po ovim pravilima - možeš odmah da igraš.</div>`
    },
    {
      id: "zone",
      title: "Zone i sto",
      html: `
        ${FIG_TABLE}
        <h4>Na tabli (Board)</h4>
        <ul>
          <li><b class="kw">Base</b> - tvoja baza. Ovde ulaze rune, gear i (najčešće) jedinice. Jedinice odavde kreću ka battlefield-ima.</li>
          <li><b class="kw">Battlefield</b>-i - lokacije za koje se igra bori. Mogu imati sopstvene sposobnosti koje se aktiviraju kad ih neko boduje.</li>
        </ul>
        <h4>Van table</h4>
        <ul>
          <li><b class="kw">Legend Zone</b> - tvoj Legend. Nikada ne ulazi na tablu, ne može biti ubijen niti pomeren (ali može biti meta efekata). Često ima sposobnosti koje aktiviraš tako što ga exhaust-uješ.</li>
          <li><b class="kw">Champion Zone</b> - Chosen Champion čeka ovde i možeš ga odigrati odavde kao da je u ruci.</li>
          <li><b class="kw">Main Deck</b> i <b class="kw">Rune Deck</b> - dva odvojena špila, licem nadole.</li>
          <li><b class="kw">Hand</b> - ruka. Nema ograničenja broja karata u ruci.</li>
          <li><b class="kw">Trash</b> - odbačene karte, uništene jedinice, odigrani spell-ovi.</li>
          <li><b class="kw">Banishment</b> - karte uklonjene iz igre.</li>
          <li><b class="kw">Chain</b> - privremena zona gde stoje odigrane karte i sposobnosti dok se ne razreše.</li>
        </ul>`
    },
    {
      id: "karte",
      title: "Karte: vrste, izgled i namena",
      html: `
        <p>Karte se dele u dve grupe:</p>
        <ul>
          <li><b>Karte iz Main Deck-a</b> - <b class="kw">Unit</b> (jedinice), <b class="kw">Spell</b> i <b class="kw">Gear</b>. Njih vučeš u ruku i igraš plaćajući cenu.</li>
          <li><b>Posebne karte</b> - <b class="kw">Legend</b>, <b class="kw">Rune</b> i <b class="kw">Battlefield</b>. One se ne vuku u ruku i nemaju cenu; imaju svoja mesta na stolu i drugačija leđa, pa se ne mešaju sa Main Deck-om.</li>
        </ul>
        ${FIG_CARD_TYPES}

        <h4>Kako se čita karta</h4>
        ${FIG_CARD_ANATOMY}
        <ul>
          <li><b>Cena</b> (gore levo) - broj je koliko <b>Energy</b> plaćaš. Simboli domena ispod broja su <b>Power</b>: svaki simbol = 1 Power te boje. Karta bez simbola traži samo Energy.</li>
          <li><b class="kw">Might</b> (gore desno, samo jedinice) - snaga u borbi i ujedno koliko štete jedinica podnosi pre nego što umre.</li>
          <li><b>Ime</b> - različite verzije istog šampiona imaju različita imena (npr. „Yasuo, Remorseful“ i „Yasuo, Windrider“) i broje se kao različite karte.</li>
          <li><b>Tip i tagovi</b> - traka ispod ilustracije, npr. <i>Champion Unit · Jinx · Zaun</i>. Tagovi sami ne rade ništa, ali ih druge karte proveravaju („svaka tvoja Zaun jedinica…“). Tag šampiona povezuje Legend, Champion i Signature karte.</li>
          <li><b>Tekst</b> - ključne reči (Tank, Accelerate…) i sposobnosti. Tekst u zagradi je samo podsetnik šta ključna reč znači. <i>Flavor tekst</i> (kurziv, priča iz sveta LoL-a) nema uticaj na igru.</li>
          <li><b>Domen</b> - boja karte; mora odgovarati jednom od dva domena tvog Legend-a.</li>
          <li><b>Dno karte</b> - oznaka seta (npr. <i>OGN</i> = Origins), broj karte i simbol retkosti (Common, Uncommon, Rare, Epic, posebne verzije). Retkost ne utiče na igru.</li>
        </ul>

        <h4>Domeni (boje)</h4>
        <table>
          <tr><th>Domen</th><th>Boja</th></tr>
          <tr><td><b class="kw">Fury</b></td><td>crvena</td></tr>
          <tr><td><b class="kw">Calm</b></td><td>zelena</td></tr>
          <tr><td><b class="kw">Mind</b></td><td>plava</td></tr>
          <tr><td><b class="kw">Body</b></td><td>narandžasta</td></tr>
          <tr><td><b class="kw">Chaos</b></td><td>ljubičasta</td></tr>
          <tr><td><b class="kw">Order</b></td><td>žuta</td></tr>
        </table>

        <h4>Svaka vrsta detaljno</h4>
        <div class="types">
          <section class="type-card">
            <h5>Unit - jedinica</h5>
            <dl>
              <dt>Izgled</dt><dd>Cena gore levo, <b>Might</b> gore desno.</dd>
              <dt>Namena</dt><dd>Jedine karte koje se kreću, bore i osvajaju battlefield-e. Bez jedinica nema poena.</dd>
              <dt>U igri</dt><dd>Igra se u bazu ili na battlefield koji kontrolišeš i ulazi <b>exhausted</b>. Umire kad ima štete ≥ Might; preživele se leče na kraju poteza.</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Champion Unit - šampion</h5>
            <dl>
              <dt>Izgled</dt><dd>Kao jedinica, sa oznakom <i>Champion</i> ispred tipa i tagom sa imenom šampiona.</dd>
              <dt>Namena</dt><dd>Jače jedinice sa posebnim sposobnostima. Tvoj <b class="kw">Chosen Champion</b> počinje u Champion Zone, pa ti je uvek dostupan - kao karta koja ti je stalno u ruci.</dd>
              <dt>U špilu</dt><dd>Mora imati isti tag kao tvoj Legend. Do 3 kopije ukupno, računajući Chosen Champion-a.</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Signature - karta šampiona</h5>
            <dl>
              <dt>Izgled</dt><dd>Oznaka <i>Signature</i> ispred tipa (Signature Unit, Spell ili Gear) i tag šampiona.</dd>
              <dt>Namena</dt><dd>Posebno moćne karte vezane za jednog šampiona.</dd>
              <dt>U špilu</dt><dd>Samo ako tag odgovara tvom Legend-u, najviše <b>3 ukupno</b>. Ne može biti Chosen Champion.</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Spell - čarolija</h5>
            <dl>
              <dt>Izgled</dt><dd>Cena gore levo, bez Might-a. U tekstu može imati <b class="kw">Action</b> ili <b class="kw">Reaction</b>.</dd>
              <dt>Namena</dt><dd>Jednokratni efekat: šteta, ubijanje, pomeranje, vučenje karata, pojačanja…</dd>
              <dt>U igri</dt><dd>Ide na chain, razreši se i odlazi u <b>Trash</b>. Brzina određuje kada sme da se igra (vidi „Igranje karata“).</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Gear - predmet</h5>
            <dl>
              <dt>Izgled</dt><dd>Cena gore levo, bez Might-a.</dd>
              <dt>Namena</dt><dd>Trajni efekat ili sposobnost koju možeš koristiti svakog poteza.</dd>
              <dt>U igri</dt><dd>Igra se u tvoju <b>bazu</b> i ulazi <b>ready</b> - upotrebljiv odmah.</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Equipment - oprema <span class="muted small">(kasniji setovi)</span></h5>
            <dl>
              <dt>Izgled</dt><dd>Gear sa <b class="kw">Equip</b> cenom, bonusom <b>+N</b> dole desno i posebnim panelom sa efektom.</dd>
              <dt>Namena</dt><dd>Kačiš je na svoju jedinicu: jedinica dobija +N Might i efekat sa panela.</dd>
              <dt>U igri</dt><dd>Kad jedinica umre, oprema se otkači i ostaje tvoja.</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Rune - runa</h5>
            <dl>
              <dt>Izgled</dt><dd>Veliki simbol domena na sredini, bez cene i Might-a.</dd>
              <dt>Namena</dt><dd>Izvor resursa: Exhaust → 1 Energy, Recycle → 1 Power svoje boje.</dd>
              <dt>U igri</dt><dd>12 u Rune Deck-u. Ne igraju se iz ruke - svakog poteza 2 stižu u bazu (Channel).</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Legend - vođa</h5>
            <dl>
              <dt>Izgled</dt><dd>Bez cene i Might-a; prikazuje <b>dva domena</b> i tip <i>Legend</i> sa tagom šampiona.</dd>
              <dt>Namena</dt><dd>Određuje boje tvog špila i koji šampion ti je Chosen Champion. Ima svoje sposobnosti, često „exhaust Legend: …“.</dd>
              <dt>U igri</dt><dd>Stoji u Legend Zone celu igru. Ne može biti ubijen, pomeren niti napadnut.</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Battlefield - bojno polje</h5>
            <dl>
              <dt>Izgled</dt><dd>Stoji između igrača; tekst je odštampan dvaput, okrenut ka oba igrača.</dd>
              <dt>Namena</dt><dd>Mesto za koje se boriš i koje donosi poene (Conquer i Hold). Mnogi imaju sposobnost koja se aktivira kad ga neko boduje.</dd>
              <dt>U igri</dt><dd>Svaki igrač donosi 3, a u 1v1 se nasumično bira po 1.</dd>
            </dl>
          </section>
          <section class="type-card">
            <h5>Token</h5>
            <dl>
              <dt>Izgled</dt><dd>Oznaka <i>Token</i>, bez cene; broj karte počinje slovom T.</dd>
              <dt>Namena</dt><dd>Jedinice ili predmeti koje kreiraju efekti drugih karata (npr. Sand Soldier). Ne idu u špil.</dd>
              <dt>U igri</dt><dd>Kreiranje tokena se ne računa kao „odigrana karta“ (npr. za Legion).</dd>
            </dl>
          </section>
        </div>
        <p class="muted small">U kasnijim setovima postoje i pomoćne karte-podsetnici (npr. <i>Buff</i> i <i>XP Tracker</i>) koje služe samo za praćenje stanja.</p>`
    },
    {
      id: "priprema",
      title: "Priprema igre (1v1)",
      html: `
        <ol>
          <li>Stavi svog <b class="kw">Champion Legend</b>-a u Legend Zone.</li>
          <li>Stavi <b class="kw">Chosen Champion</b>-a u Champion Zone.</li>
          <li>Svaki igrač <b>nasumično</b> bira 1 od svoja 3 battlefield-a i stavlja ga na sto; preostala dva se sklanjaju. U igri su dakle 2 battlefield-a.</li>
          <li>Promešaj Main Deck i Rune Deck, svaki posebno, i stavi ih na svoja mesta.</li>
          <li>Nasumično odredite ko igra prvi (novčić, kockica…).</li>
          <li>Svako vuče <b>4 karte</b>.</li>
          <li><b>Mulligan</b> (redom, počev od prvog igrača): možeš da odložiš <b>do 2 karte</b>, izvučeš isto toliko novih, pa odložene <b class="kw">Recycle</b>-uješ (stavljaš na dno Main Deck-a). Špil se <b>ne meša</b>.</li>
          <li>Prvi igrač počinje. <b>Drugi igrač</b> u svojoj prvoj Channel fazi uzima <b>3 rune</b> umesto 2 (kompenzacija).</li>
        </ol>
        <p>U mečevima na 2 dobijene (Bo3) battlefield se bira, a isti battlefield ne sme se koristiti dvaput u meču.</p>`
    },
    {
      id: "resursi",
      title: "Rune, Energy i Power",
      html: `
        <p>Rune su karte u tvojoj bazi. Svaka runa pripada jednom domenu. One nisu same po sebi resurs - koristiš ih da dodaš resurse u svoj <b class="kw">Rune Pool</b>:</p>
        <ul>
          <li><b class="kw">Exhaust</b> (okreni bočno) runu → dodaj <b>1 Energy</b>. Energy je generički - bilo koja runa odgovara.</li>
          <li><b class="kw">Recycle</b> runu (vrati je na dno Rune Deck-a) → dodaj <b>1 Power</b> domena te rune.</li>
        </ul>
        <p>Istu runu možeš prvo exhaust-ovati za Energy, pa je onda recycle-ovati za Power. Recycle-ovana runa se vraća u Rune Deck i kasnije ponovo stiže kroz Channel.</p>
        ${FIG_RUNES}
        <h4>Rune Pool</h4>
        <ul>
          <li>Energy i Power moraju prvo da uđu u Rune Pool pa se onda troše na cene.</li>
          <li>Pool se prazni <b>na početku tvoje Main faze</b> i <b>na kraju poteza</b>. Ono što ne potrošiš - propada.</li>
          <li>Neke cene traže Power „bilo kog domena“ (npr. Hidden, Deflect) - tada odgovara bilo koja runa.</li>
        </ul>
        <div class="note">Savet: u ranoj igri obično samo exhaust-uješ rune za Energy. Recycle koristiš kad ti treba Power određene boje - ali tada gubiš runu sa stola do sledećeg izvlačenja.</div>`
    },
    {
      id: "potez",
      title: "Struktura poteza",
      html: `
        <p>Potez ima fiksne faze. Prve četiri se pamte kao <b>A-B-C-D</b>.</p>
        ${FIG_TURN}
        <h4>A - Awaken</h4>
        <p>Ready-uj (vrati uspravno) sve svoje exhaust-ovane karte: rune, jedinice, gear, Legend.</p>
        <h4>B - Beginning</h4>
        <ol>
          <li>Razreše se efekti „na početku poteza“. Permanenti sa <b class="kw">Temporary</b> umiru (pre bodovanja).</li>
          <li><b>Bodovanje (Hold):</b> za svaki battlefield koji kontrolišeš dobijaš 1 poen.</li>
        </ol>
        <h4>C - Channel</h4>
        <p>Uzmi 2 rune sa vrha Rune Deck-a i stavi ih u bazu (ready). Ako ih ima manje od 2, uzimaš koliko ima. Drugi igrač u svom prvom potezu uzima 3.</p>
        <h4>D - Draw</h4>
        <p>Vuci 1 kartu. Ako je Main Deck prazan - <b class="kw">Burn Out</b> (vidi poglavlje Bodovanje). Na kraju ove faze Rune Pool se prazni.</p>
        <h4>Main faza</h4>
        <p>Glavni deo poteza. Redosled je slobodan i možeš raditi koliko god hoćeš:</p>
        <ul>
          <li>igrati karte iz ruke (i Chosen Champion-a iz Champion Zone),</li>
          <li>pomerati jedinice (Standard Move),</li>
          <li>aktivirati sposobnosti karata i Legend-a,</li>
          <li>sakrivati <b class="kw">Hidden</b> karte.</li>
        </ul>
        <p>Pomeranja pokreću Showdown-e i borbe. Protivnik u tvojoj Main fazi ne može da igra ništa osim Reaction karata kao odgovor na chain, i Action/Reaction karata tokom showdown-a i borbi.</p>
        <h4>End (kraj poteza)</h4>
        <ol>
          <li>Razreše se efekti „na kraju poteza“.</li>
          <li>Sve jedinice se <b>leče</b> (sva šteta se uklanja).</li>
          <li>Svi efekti „this turn“ ističu; <b class="kw">Stun</b> nestaje.</li>
          <li>Rune Pool se prazni.</li>
          <li>Potez prelazi na sledećeg igrača.</li>
        </ol>
        <div class="note">Šteta se ne čuva između poteza: jedinica koju nisi ubio ovaj potez sledećeg je potpuno zdrava.</div>`
    },
    {
      id: "igranje",
      title: "Igranje karata, Chain i brzine",
      html: `
        <h4>Četiri stanja poteza</h4>
        <p>Šta sme da se igra zavisi od dve stvari: da li je u toku <b>showdown/borba</b> i da li postoji <b class="kw">chain</b>.</p>
        ${FIG_STATES}
        <table>
          <tr><th>Stanje</th><th>Kada</th><th>Šta sme</th></tr>
          <tr><td><b>Neutral Open</b></td><td>nema showdown-a, nema chain-a</td><td>Sve karte i sposobnosti - ali samo igrač na potezu, u svojoj Main fazi.</td></tr>
          <tr><td><b>Neutral Closed</b></td><td>nema showdown-a, ima chain</td><td>Samo <b class="kw">Reaction</b> (oba igrača, kad dobiju priority).</td></tr>
          <tr><td><b>Showdown Open</b></td><td>showdown ili borba, nema chain-a</td><td><b class="kw">Action</b> i <b class="kw">Reaction</b> - igrač koji ima Focus.</td></tr>
          <tr><td><b>Showdown Closed</b></td><td>showdown ili borba, ima chain</td><td>Samo <b class="kw">Reaction</b>.</td></tr>
        </table>
        <h4>Brzine (timing)</h4>
        <table>
          <tr><th>Karta</th><th>Kada može</th></tr>
          <tr><td>Bez ključne reči</td><td>Samo u <b>tvojoj Main fazi</b>, u stanju Neutral Open.</td></tr>
          <tr><td><b class="kw">Action</b></td><td>Kao gore, plus u <b>Showdown Open</b> stanju - u bilo čijem potezu, kad imaš Focus.</td></tr>
          <tr><td><b class="kw">Reaction</b></td><td>Sve što može Action, plus u <b>svakom Closed</b> stanju (kao odgovor na chain) - u bilo čijem potezu.</td></tr>
        </table>
        <div class="note"><b>Česta zabuna:</b> Reaction karta se u protivnikovom potezu <b>ne može</b> igrati „bilo kad“. Treba ti povod: chain (protivnik je nešto odigrao) ili showdown/borba. Kad protivnik samo završava potez, ne možeš ubaciti Reaction.</div>
        <h4>Priority i Focus</h4>
        <ul>
          <li><b>Priority</b> = pravo da upravo sada nešto odigraš ili aktiviraš. Ko nema priority, ne može ništa odigrati (osim obaveznih radnji koje mu se nalože).</li>
          <li>Priority dobijaš: u svojoj Main fazi (Neutral Open); kad dobiješ Focus u showdown-u; kad si kontrolor sledeće stavke na chain-u; i kad igrač pre tebe passuje dok postoji chain.</li>
          <li><b>Focus</b> postoji samo tokom showdown-a: to je pravo da u Showdown Open stanju igraš Action/Reaction karte. Prvi ga dobija igrač koji je izazvao showdown (kod borbe - napadač). Ko dobije Focus, dobija i priority.</li>
          <li>Igrač sa Focus-om ili igra kartu (otvara chain) ili passuje. Kad se chain isprazni, Focus prelazi na sledećeg igrača. Kad <b>svi igrači passuju redom</b>, showdown se završava.</li>
          <li>Igrač zadržava Focus i kad prepusti priority drugom igraču tokom chain-a.</li>
        </ul>
        <h4>Chain korak po korak</h4>
        ${FIG_CHAIN}
        <ol>
          <li><b>Igranje:</b> karta ide na chain (stanje postaje Closed). Biraju se mete, lokacija i opcione dodatne cene, pa se plaća cena (Energy + Power, plus npr. Accelerate, Deflect, Repeat). Dok sve to nije završeno, stavka je „pending“.</li>
          <li><b>Finalize:</b> stavka se zaključava; finalizovanje ne prepušta priority. <b>Jedinice, gear i sposobnosti koje dodaju Energy/Power razrešavaju se odmah</b> posle finalizacije - na njih se ne može odgovoriti (ali na njihove okidače, npr. „kad uđe u igru“, može).</li>
          <li><b>Execute:</b> igrač sa priority-jem može odigrati <b>Reaction</b> (ide na vrh chain-a, pa nazad na Finalize) ili passovati - priority ide sledećem igraču.</li>
          <li><b>Pass:</b> ako su <b>svi igrači passovali redom</b> bez dodavanja, prelazi se na razrešavanje. Ako je neko nešto dodao, nastavlja se sa Execute.</li>
          <li><b>Resolve:</b> razreši se <b>najnovija</b> stavka, u celosti. Ako na chain-u još ima stavki, priority dobija kontrolor sledeće najnovije stavke i ponovo se može odgovarati. Kad se chain isprazni, stanje je ponovo Open.</li>
        </ol>
        <div class="example"><b>Primer:</b> ti igraš spell „3 štete jedinici“ na protivnikovu jedinicu Might 2. Protivnik odgovara Reaction-om „+3 Might ovog poteza“ na istu jedinicu. Ti passuješ, on passuje. Prvo se razreši njegov Reaction (jedinica sada ima Might 5), pa tvoj spell - 3 štete nisu dovoljne i jedinica preživljava. Da si pre razrešavanja odgovorio još jednim Reaction-om, on bi se razrešio prvi.</div>
        <h4>Mete</h4>
        <p>Karta cilja samo ako izričito „bira“ (choose) nešto. Mete se biraju pri igranju. Ako sve mete postanu nevažeće, taj deo efekta ne radi, ali se ostatak karte razrešava. Instrukcije koje ne mogu da se izvrše se preskaču.</p>`
    },
    {
      id: "kretanje",
      title: "Kretanje jedinica",
      html: `
        <h4>Standard Move</h4>
        <p>U svojoj Main fazi (van borbe i showdown-a) možeš jedinicu pomeriti tako što je <b>exhaust</b>-uješ:</p>
        <ul>
          <li>baza → battlefield</li>
          <li>battlefield → baza</li>
          <li>battlefield → battlefield - <b>samo</b> ako jedinica ima <b class="kw">Ganking</b></li>
        </ul>
        <p>Možeš pomeriti <b>više jedinica odjednom</b>, ako je odredište dozvoljeno za sve. Exhaust-ovana jedinica ne može da koristi Standard Move.</p>
        <p>Pomeranje putem karata i sposobnosti ne exhaust-uje jedinicu (osim ako karta ne kaže drugačije).</p>
        ${FIG_MOVE}
        <h4>Šta se dešava po dolasku</h4>
        ${FIG_ARRIVE}
        <ul>
          <li>Battlefield koji <b>već kontrolišeš</b> → ništa posebno.</li>
          <li><b>Prazan</b> battlefield koji ne kontrolišeš → postaje <b>Contested</b> → <b>Showdown</b>.</li>
          <li>Battlefield sa <b>protivničkim jedinicama</b> → <b>Combat</b>.</li>
        </ul>
        <h4>Recall</h4>
        <p><b class="kw">Recall</b> vraća permanent u bazu, ali <b>nije pomeranje</b> - ne okida efekte kretanja i ne menja stanje jedinice (ready/exhausted, šteta).</p>`
    },
    {
      id: "showdown",
      title: "Showdown",
      html: `
        <p>Showdown je „prozor“ u kome oba igrača mogu da igraju <b class="kw">Action</b> i <b class="kw">Reaction</b> karte oko jednog battlefield-a.</p>
        <h4>Showdown bez borbe</h4>
        <p>Nastaje kada tvoje jedinice uđu na <b>prazan</b> battlefield koji ne kontrolišeš.</p>
        <ol>
          <li>Ti (onaj koji je ušao) dobijaš <b>Focus</b>.</li>
          <li>Igrač sa Focus-om ili igra Action/Reaction kartu ili passuje. Focus zatim prelazi dalje.</li>
          <li>Kada <b>svi igrači passuju redom</b>, showdown se završava.</li>
          <li>Ako su na battlefield-u ostale samo tvoje jedinice → preuzimaš kontrolu i dobijaš <b class="kw">Conquer</b> poen (ako taj battlefield još nisi bodovao ovaj potez).</li>
        </ol>
        <div class="note">Showdown daje protivniku šansu da reaguje - npr. da Action kartom ubije tvoju jedinicu ili da nekog pošalje na taj battlefield i pretvori ga u borbu.</div>`
    },
    {
      id: "borba",
      title: "Borba (Combat)",
      html: `
        <p>Borba nastaje kada su na istom battlefield-u jedinice dva različita igrača. Počinje kad je chain prazan. Ako se to desi na više battlefield-a, igrač na potezu bira redosled.</p>
        <h4>Korak 1 - Showdown borbe</h4>
        <ul>
          <li>Igrač koji je izazvao sukob je <b>napadač</b> (Attacker), drugi je <b>branilac</b> (Defender). Njihove jedinice na tom battlefield-u dobijaju iste oznake.</li>
          <li>Okidaju se sposobnosti „kad napadam“ / „kad branim“ (prvo napadačeve, zatim braniočeve).</li>
          <li>Napadač ima Focus. Igrači naizmenično igraju Action/Reaction karte dok svi ne passuju.</li>
        </ul>
        <h4>Korak 2 - Šteta</h4>
        <ol>
          <li>Svaka strana <b>sabira Might</b> svih svojih jedinica u borbi (uključujući <b class="kw">Assault</b> za napadače i <b class="kw">Shield</b> za branioce). <b class="kw">Stun</b>-ovane jedinice ne doprinose.</li>
          <li><b>Napadač prvi</b> raspoređuje svoju ukupnu štetu na braniočeve jedinice, zatim branilac na napadačeve.</li>
          <li>Pravila raspodele:
            <ul>
              <li>Jednoj jedinici moraš dodeliti <b>smrtonosnu štetu</b> (≥ njen Might) pre nego što bilo šta dodeliš sledećoj.</li>
              <li>Ne smeš dodeliti više od smrtonosne štete dok ima drugih jedinica kojima nisi dodelio.</li>
              <li><b class="kw">Tank</b> jedinice moraju prve dobiti smrtonosnu štetu; <b class="kw">Backline</b> jedinice poslednje.</li>
            </ul>
          </li>
          <li>Sva šteta se nanosi <b>istovremeno</b>. Jedinice sa štetom ≥ Might umiru i idu u Trash.</li>
        </ol>
        <h4>Korak 3 - Razrešenje</h4>
        <ol>
          <li>Sve preživele jedinice se <b>leče</b>.</li>
          <li>Ako branilac ima preživele jedinice, sve napadačeve jedinice se <b>recall</b>-uju u bazu.</li>
          <li>Ishod: pobeđuje onaj ko jedini ima jedinice na battlefield-u. Ako niko nema jedinice - nema pobednika.</li>
          <li>Ako je pobednik napadač, preuzima kontrolu → <b class="kw">Conquer</b> poen (ako taj battlefield nije već bodovao ovaj potez).</li>
          <li>Ako nijedna strana nema jedinice, battlefield postaje neutralan (niko ga ne kontroliše).</li>
          <li>Efekti „do kraja borbe“ ističu.</li>
        </ol>
        <h4>Primer</h4>
        <p>Napadaš sa jedinicama Might 3 i 2. Branilac ima Might 4 i Might 2 sa <b class="kw">Tank</b>:</p>
        ${FIG_COMBAT}
        <ol>
          <li>Napadač deli 5 štete. <b class="kw">Tank</b> mora prvi da dobije smrtonosnu štetu: 2 na Tank, ostatak 3 na jedinicu Might 4 (nedovoljno da je ubije).</li>
          <li>Branilac deli 6: 3 na jedinicu Might 3, 2 na jedinicu Might 2, a višak od 1 ide bilo gde → obe napadačeve jedinice umiru.</li>
          <li>Branilac ima preživelu jedinicu → zadržava battlefield.</li>
        </ol>`
    },
    {
      id: "bodovanje",
      title: "Bodovanje i pobeda",
      html: `
        <h4>Načini da osvojiš poen</h4>
        <table>
          <tr><th>Način</th><th>Kada</th></tr>
          <tr><td><b class="kw">Conquer</b></td><td>Kada preuzmeš kontrolu nad battlefield-om (posle showdown-a ili borbe).</td></tr>
          <tr><td><b class="kw">Hold</b></td><td>U svojoj Beginning fazi, za svaki battlefield koji kontrolišeš.</td></tr>
          <tr><td><b class="kw">Burn Out</b></td><td>Kada protivnik mora da vuče/uzme kartu iz praznog Main Deck-a - ti dobijaš 1 poen.</td></tr>
          <tr><td>Efekti karata</td><td>Neke karte i battlefield-i direktno daju poene.</td></tr>
        </table>
        <ul>
          <li>Isti battlefield možeš bodovati <b>samo jednom po potezu</b>, bilo kojim načinom.</li>
          <li>Kada boduješ battlefield, aktiviraju se i njegove sposobnosti (ako ih ima).</li>
        </ul>
        <h4>Pravilo poslednjeg poena</h4>
        <p>Ako bi ti <b class="kw">Conquer</b> doneo pobedonosni poen, dobijaš ga <b>samo ako si ovog poteza već bodovao sve ostale battlefield-e</b>. U suprotnom, umesto poena <b>vučeš 1 kartu</b>. Hold i efekti karata daju poslednji poen normalno.</p>
        <div class="note">Praktično: sa 7 poena ne možeš pobediti samo osvajanjem jednog battlefield-a - moraš u istom potezu bodovati oba, ili sačekati Hold na početku sledećeg poteza.</div>
        <h4>Burn Out detaljno</h4>
        <ol>
          <li>Uzmeš koliko god karata možeš.</li>
          <li>Promešaj svoj Trash i on postaje novi Main Deck.</li>
          <li>Protivnik dobija 1 poen.</li>
          <li>Nastavi započetu radnju (npr. dovuci ostatak karata).</li>
        </ol>
        <p>Ako su i špil i Trash prazni, Burn Out se ponavlja dok neko ne pobedi.</p>
        <h4>Pobeda</h4>
        <p>Kada igrač ima <b>8 ili više poena</b> i više od svih protivnika, odmah pobeđuje.</p>`
    },
    {
      id: "mehanike",
      title: "Statusi i česte radnje",
      html: `
        <table>
          <tr><th>Termin</th><th>Značenje</th></tr>
          <tr><td><b class="kw">Exhaust / Ready</b></td><td>Okreni kartu bočno (iskorišćena) / vrati uspravno. Sve se ready-uje u Awaken fazi.</td></tr>
          <tr><td><b class="kw">Recycle</b></td><td>Stavi kartu na dno odgovarajućeg špila (rune u Rune Deck, ostalo u Main Deck).</td></tr>
          <tr><td><b class="kw">Kill</b></td><td>Uništi permanent - ide u Trash. Okida <b class="kw">Deathknell</b>.</td></tr>
          <tr><td><b class="kw">Banish</b></td><td>Ukloni kartu iz igre (u Banishment).</td></tr>
          <tr><td><b class="kw">Stun</b></td><td>Jedinica ne nanosi borbenu štetu ovog poteza. Nestaje na kraju poteza. Već stun-ovana jedinica ne može ponovo.</td></tr>
          <tr><td><b class="kw">Buff</b></td><td>Žeton +1 Might na jedinici. Jedinica može imati <b>najviše 1 buff</b>. Neke karte „troše“ buff kao cenu. Buff nestaje kad jedinica napusti tablu.</td></tr>
          <tr><td><b class="kw">Mighty</b></td><td>Jedinica sa Might 5 ili više. Neke karte proveravaju da li je jedinica Mighty.</td></tr>
          <tr><td><b class="kw">Heal</b></td><td>Ukloni štetu sa jedinice. Sve jedinice se leče na kraju poteza i posle borbe.</td></tr>
          <tr><td><b class="kw">Predict</b></td><td>Pogledaj vrh svog Main Deck-a; možeš tu kartu Recycle-ovati.</td></tr>
          <tr><td><b class="kw">Recall</b></td><td>Vrati permanent u bazu - nije pomeranje, ne menja mu stanje.</td></tr>
          <tr><td><b class="kw">Counter</b></td><td>Poništi kartu/sposobnost na chain-u.</td></tr>
          <tr><td><b class="kw">Token</b></td><td>Kreirana jedinica/predmet koja ne postoji kao karta u špilu.</td></tr>
        </table>`
    },
    {
      id: "modovi",
      title: "Načini igre",
      html: `
        <table>
          <tr><th>Mod</th><th>Opis</th></tr>
          <tr><td><b>1v1 Duel</b></td><td>Jedna partija. Svaki igrač nasumično bira 1 od 3 battlefield-a. Pobeda na 8 poena. Drugi igrač u prvom potezu uzima 3 rune.</td></tr>
          <tr><td><b>1v1 Match</b></td><td>Najbolji od 3 partije (Bo3). Battlefield se bira, a nijedan se ne sme ponoviti u meču.</td></tr>
          <tr><td><b>Multiplayer</b></td><td>Postoje i modovi za 3 igrača (Skirmish), 4 igrača (War) i 2v2 (Magma Chamber). Imaju drugačiji broj battlefield-a i pobedničke poene - pogledaj zvanična pravila pre igranja.</td></tr>
        </table>`
    },
    {
      id: "primer",
      title: "Primer partije: prva dva poteza",
      html: `
        <p>Ilustrativan primer sa izmišljenim jedinicama, da se vidi kako se faze, rune, kretanje, showdown i borba uklapaju. Ana igra prva, Boris drugi. U igri su battlefield-i <b>Severni</b> i <b>Južni</b>.</p>
        <h4>Priprema</h4>
        <p>Svako vuče 4 karte; Boris koristi mulligan i menja 2 karte (vuče 2 nove, a odbačene stavlja na dno špila).</p>
        <h4>Potez 1 - Ana</h4>
        <ol>
          <li><b>Awaken / Beginning:</b> nema šta da se ready-uje ni boduje.</li>
          <li><b>Channel:</b> 2 rune iz Rune Deck-a u bazu. <b>Draw:</b> 1 karta (5 u ruci).</li>
          <li><b>Main:</b> exhaust-uje obe rune (2 Energy) i igra jedinicu cene 2, Might 2. Jedinica ulazi u bazu <b>exhausted</b> - ne može se pomeriti ovog poteza.</li>
          <li><b>End:</b> Rune Pool se prazni. Kraj poteza.</li>
        </ol>
        <h4>Potez 1 - Boris</h4>
        <ol>
          <li><b>Channel:</b> kao drugi igrač u prvom potezu uzima <b>3 rune</b>. <b>Draw:</b> 1 karta.</li>
          <li><b>Main:</b> exhaust-uje 3 rune i igra jedinicu cene 3, Might 3. Ona takođe ulazi exhausted.</li>
        </ol>
        <h4>Potez 2 - Ana</h4>
        <ol>
          <li><b>Awaken:</b> ready-uje runu i jedinicu. <b>Beginning:</b> ne kontroliše battlefield, nema Hold poena. <b>Channel:</b> sada ima 4 rune. <b>Draw.</b></li>
          <li><b>Main:</b> Standard Move - exhaust-uje jedinicu i šalje je na prazan <b>Severni</b> battlefield. On postaje Contested → <b>Showdown</b>.</li>
          <li>Ana ima Focus i passuje. Focus dobija Boris: mogao bi da odigra Action/Reaction (npr. da ošteti jedinicu), ali nema takvu kartu i passuje. Oba su passovala redom → showdown je gotov.</li>
          <li>Ana preuzima kontrolu → <b>Conquer: Ana 1 poen</b>.</li>
          <li>Sa 4 rune igra još jednu jedinicu (cena 3, Might 3) u bazu.</li>
          <li><b>End:</b> jedinice se leče, Rune Pool se prazni.</li>
        </ol>
        <h4>Potez 2 - Boris</h4>
        <ol>
          <li><b>Awaken, Channel</b> (sada 5 runa), <b>Draw</b>.</li>
          <li><b>Main:</b> šalje svoju jedinicu Might 3 na <b>Severni</b>, gde je Anina jedinica Might 2 → <b>Combat</b>. Boris je napadač i ima Focus.</li>
          <li>Boris passuje; Ana bi mogla da ubaci Action/Reaction, ali passuje i ona.</li>
          <li><b>Šteta:</b> Boris dodeljuje 3 Aninoj jedinici (smrtonosno je 2; višak sme jer drugih jedinica nema). Ana dodeljuje 2 Borisovoj (Might 3 - preživljava). Anina jedinica umire.</li>
          <li>Samo Boris ima jedinice na Severnom → preuzima kontrolu → <b>Conquer: Boris 1 poen</b>. Sve preživele jedinice se leče.</li>
        </ol>
        <div class="note"><b>Šta dalje:</b> ako Boris zadrži Severni do početka svog sledećeg poteza, dobiće <b>Hold</b> poen. Ana zato u svom potezu verovatno napada Severni svojom Might 3 jedinicom ili šalje nekoga na prazan Južni da i sama boduje.</div>`
    },
    {
      id: "faq",
      title: "Česte situacije (FAQ)",
      html: `
        <dl class="faq">
          <dt>Mogu li da odigram Reaction na kraju protivnikovog poteza, „tek tako“?</dt>
          <dd>Ne. U protivnikovom potezu Reaction ti treba povod: chain (nešto je odigrano) ili showdown/borba.</dd>
          <dt>Mogu li da koristim sposobnost svog Legend-a u protivnikovom potezu?</dt>
          <dd>Samo ako ima <b class="kw">Action</b> ili <b class="kw">Reaction</b> (i tada po njihovim pravilima). Ostale sposobnosti - samo u tvojoj Main fazi, van borbe.</dd>
          <dt>Mogu li istu runu i da exhaust-ujem i da recycle-ujem?</dt>
          <dd>Da: prvo exhaust za 1 Energy, pa recycle za 1 Power njenog domena.</dd>
          <dt>Koliko runa mogu imati na stolu?</dt>
          <dd>Najviše onoliko koliko ih je u Rune Deck-u - 12.</dd>
          <dt>Šta ako posle borbe obe strane imaju preživele jedinice?</dt>
          <dd>Napadači se vraćaju (recall) u bazu, branilac zadržava kontrolu, a niko ne boduje.</dd>
          <dt>Mogu li da dodam jedinicu u borbu koja je već počela?</dt>
          <dd>Samo spell-om ili sposobnošću sa Action/Reaction brzinom koja pomera ili igra jedinicu tamo.</dd>
          <dt>Da li pomeranje spell-om exhaust-uje jedinicu?</dt>
          <dd>Ne, osim ako karta to kaže. Exhaust-uje samo Standard Move.</dd>
          <dt>Kada se leči šteta?</dt>
          <dd>Na kraju svake borbe i na kraju svakog poteza - šteta se nikad ne prenosi.</dd>
          <dt>Imam 7 poena i osvojim battlefield. Da li sam pobedio?</dt>
          <dd>Samo ako si ovog poteza već bodovao sve ostale battlefield-e. Inače umesto poena vučeš kartu. Hold na početku poteza donosi pobedu normalno.</dd>
          <dt>Hidden: gde smem da sakrijem kartu i kada je igram?</dt>
          <dd>Na battlefield koji kontrolišeš (uz 1 Power bilo kog domena). Igraš je najranije sledećeg poteza, kao Reaction, besplatno - jedinica ide na taj battlefield, a spell bira mete tamo. Sakrivanje se ne računa kao „odigrana karta“ za Legion.</dd>
        </dl>
        <p class="muted small">Prema zvaničnom FAQ-u i Core Rules (riftwatcher.com/rules/faq).</p>`
    },
    {
      id: "saveti",
      title: "Česte greške i saveti",
      html: `
        <ul>
          <li><b>Jedinice ulaze exhausted</b> - ne mogu se pomeriti u potezu u kom su odigrane (osim uz Accelerate).</li>
          <li><b>Šteta se briše na kraju poteza</b> - jedinicu moraš ubiti u jednom potezu.</li>
          <li><b>Rune Pool se prazni</b> - ne štedi Energy za protivnikov potez; umesto toga ostavi rune neiskorišćene (ready) da bi mogao da platiš Reaction.</li>
          <li><b>Poslednji poen</b> - ne zaboravi pravilo da Conquer ne donosi pobedu ako nisi bodovao sve battlefield-e tog poteza.</li>
          <li><b>Hold se računa pre Channel-a i Draw-a</b> - kontrola battlefield-a na kraju protivnikovog poteza je ono što se broji.</li>
          <li><b>Legend nije jedinica</b> - ne može da napada ni da bude ubijen, ali njegove sposobnosti su često ključ špila.</li>
          <li><b>Mulligan ne meša špil</b> - odložene karte idu na dno.</li>
        </ul>`
    }
  ],

  // ─────────────────────────────── KLJUČNE REČI ───────────────────────────────
  glossary: [
    { term: "Accelerate", group: "Origins", def: "Pri igranju jedinice možeš platiti dodatno 1 Energy i 1 Power njenog domena. Ako platiš, jedinica ulazi <b>ready</b> umesto exhausted (može odmah da se pomeri)." },
    { term: "Action", group: "Origins", def: "Karta/sposobnost može da se igra i tokom showdown-a i borbe, u bilo čijem potezu." },
    { term: "Assault X", group: "Origins", def: "Dok je jedinica napadač, ima +X Might. Bez broja = 1. Više izvora se sabira." },
    { term: "Deathknell", group: "Origins", def: "„Kad ova karta umre, [efekat].“ Okida se samo kad je ubijena (ne kad je banish/recall). Razrešava se posle lečenja iz borbe." },
    { term: "Deflect X", group: "Origins", def: "Protivnik mora platiti dodatnih X Power (bilo kog domena) za svaki put kad izabere ovaj permanent za metu. Ne važi za efekte koji ne biraju (npr. „sve jedinice“)." },
    { term: "Ganking", group: "Origins", def: "Standard Move može da pomeri jedinicu sa jednog battlefield-a direktno na drugi." },
    { term: "Hidden", group: "Origins", def: "U svom potezu (kad nema chain-a) kartu iz ruke možeš sakriti licem nadole na battlefield koji kontrolišeš, plaćajući 1 Power bilo kog domena. Na jednom battlefield-u može biti samo 1 sakrivena karta, i ostaje dok ga kontrolišeš. <b>Od sledećeg poteza</b> možeš je odigrati kao Reaction <b>besplatno</b> (ignorišeš osnovnu cenu) - ali samo na tom battlefield-u / ciljajući stvari tamo." },
    { term: "Legion", group: "Origins", def: "„Legion → [tekst]“: karta dobija taj tekst ako si ovaj potez već odigrao neku drugu kartu. Tokeni i sposobnosti se ne računaju." },
    { term: "Reaction", group: "Origins", def: "Može da se igra bilo kada, u bilo čijem potezu - uključujući kao odgovor na chain. Obuhvata i sve što dozvoljava Action." },
    { term: "Shield X", group: "Origins", def: "Dok je jedinica branilac, ima +X Might. Bez broja = 1. Više izvora se sabira." },
    { term: "Tank", group: "Origins", def: "U borbi mora prva da dobije smrtonosnu štetu pre ostalih jedinica istog igrača bez Tank-a." },
    { term: "Temporary", group: "Origins", def: "Na početku Beginning faze svog kontrolora (pre bodovanja) ovaj permanent umire." },
    { term: "Vision", group: "Origins", def: "Kada uđe u igru: Predict (pogledaj vrh Main Deck-a, možeš ga Recycle-ovati)." },

    // Setovi prema zvaničnim patch notes: Spiritforged (dec. 2025), Unleashed (apr. 2026)
    { term: "Equip", group: "Spiritforged", def: "„[Cena]: zakači ovaj gear na svoju jedinicu.“ Jedinica dobija Might bonus i efekte opreme. Kad jedinica napusti tablu, oprema se otkači i ostaje." },
    { term: "Quick-Draw", group: "Spiritforged", def: "Gear ima Reaction brzinu i kad ga odigraš odmah se kači na tvoju jedinicu." },
    { term: "Repeat", group: "Spiritforged", def: "Opciona dodatna cena: ako je platiš, efekat se izvršava još jednom (mete mogu biti druge)." },
    { term: "Weaponmaster", group: "Spiritforged", def: "Kad odigraš ovu jedinicu, možeš na nju zakačiti svoju opremu plaćajući umanjenu Equip cenu." },

    { term: "Ambush", group: "Unleashed", def: "Jedinica može da se odigra na battlefield gde već imaš jedinice, i tada ima Reaction brzinu." },
    { term: "Backline", group: "Unleashed", def: "U borbi prima smrtonosnu štetu tek posle svih jedinica istog igrača bez Backline-a." },
    { term: "Hunt X", group: "Unleashed", def: "Kad ova jedinica uradi Conquer ili Hold, dobijaš X XP." },
    { term: "Level N", group: "Unleashed", def: "„Level N → [tekst]“: karta ima taj tekst dok imaš N ili više XP." },
    { term: "Unique", group: "Unleashed", def: "U špilu sme biti samo 1 kopija ove karte." },
    { term: "XP", group: "Unleashed", def: "Resurs igrača (javan, bez gornje granice) koji se dobija i troši efektima karata." }
  ],

  expansions: [],

  sources: [
    { label: "Zvanični Rules Hub (playriftbound.com)", url: "https://playriftbound.com/en-us/news/rules-and-releases/gameplay-guide-core-rules/" },
    { label: "Core Rules referenca po sekcijama (riftwatcher.com)", url: "https://riftwatcher.com/rules/" },
    { label: "FAQ (riftwatcher.com)", url: "https://riftwatcher.com/rules/faq/" },
    { label: "Patch notes: Spiritforged", url: "https://playriftbound.com/en-us/news/rules-and-releases/riftbound-core-rules-spiritforged-patch-notes/" },
    { label: "Patch notes: Unleashed", url: "https://playriftbound.com/en-us/news/rules-and-releases/riftbound-core-rules-unleashed-patch-notes/" }
  ]
});
})();
