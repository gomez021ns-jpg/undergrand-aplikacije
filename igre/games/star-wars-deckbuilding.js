(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Raspored stola
const swRow = (y, mirrored, dim) => {
  const W = 600;
  const items = [
    [10, 80, "Špil", "player deck"],
    [98, 80, "Discard", null],
    [186, 250, "Play area", "jedinice · capital ships"],
    [444, 146, "Baza", "ostale baze ispod"]
  ];
  return `<g class="${dim ? "f-dim" : ""}">${items
    .map(([x, w, t, sub]) => F.box(mirrored ? W - x - w : x, y, w, 84, t, { sub, cls: t === "Baza" ? "f-acc" : "f-box" }))
    .join("")}</g>`;
};
const rowCard = (x, letter) =>
  F.rect(x, 146, 54, 78, { cls: "f-card", r: 5 }) + F.text(x + 27, 192, letter, { cls: letter === "N" ? "f-muted" : "f-title" });
const forceDots = Array.from({ length: 7 }, (_, i) => {
  const cls = i < 3 ? "f-dark-side" : i === 3 ? "f-box" : "f-light-side";
  return `<circle cx="566" cy="${150 + i * 12}" r="4.5" class="${cls}"/>`;
}).join("");
const FIG_SW_TABLE = F.figure(
  600, 380,
  F.text(10, 12, "IMPERIJA", { cls: "f-label", anchor: "start" }) +
    swRow(20, true, true) +
    F.rect(10, 146, 54, 78, { cls: "f-card f-back", r: 5 }) +
    F.text(37, 182, ["Galaxy", "Deck"], { cls: "f-tiny f-title", lh: 13 }) +
    ["E", "R", "N", "E", "R", "N"].map((l, i) => rowCard(76 + i * 64, l)).join("") +
    F.text(254, 240, "Galaxy Row - 6 karata (E = Imperija, R = Pobunjenici, N = neutralna)", { cls: "f-muted" }) +
    F.rect(462, 146, 70, 78, { cls: "f-card", r: 5 }) +
    F.text(497, 180, ["Outer Rim", "Pilot ×10"], { cls: "f-tiny f-title", lh: 13 }) +
    F.rect(548, 140, 36, 90, { cls: "f-box", r: 6 }) +
    forceDots +
    `<circle cx="566" cy="222" r="7" class="f-marker"/>` +
    F.text(566, 134, "Sila", { cls: "f-tiny f-title" }) +
    swRow(270, false, false) +
    F.text(10, 374, "POBUNJENICI", { cls: "f-label", anchor: "start" }),
  { caption: "Sto posle pripreme. Galaxy Row je u sredini; karte su okrenute ka igraču koji ih može kupiti. Sila počinje skroz na strani Pobunjenika." }
);

// Ravnoteža Sile
const trackDot = (i) => {
  const x = 70 + i * 63;
  const cls = i < 3 ? "f-dark-side" : i === 3 ? "f-box" : "f-light-side";
  return `<circle cx="${x}" cy="72" r="17" class="${cls}"/>`;
};
const FIG_SW_FORCE = F.figure(
  520, 156,
  `<line x1="70" y1="72" x2="448" y2="72" class="f-line"/>` +
    Array.from({ length: 7 }, (_, i) => trackDot(i)).join("") +
    `<circle cx="448" cy="72" r="25" class="f-marker-ring"/>` +
    F.text(133, 30, "Sila je sa Imperijom", { cls: "f-title f-small" }) +
    F.text(259, 30, "niko", { cls: "f-muted" }) +
    F.text(385, 30, "Sila je sa Pobunjenicima", { cls: "f-title f-small" }) +
    F.text(70, 116, ["krajnje polje:", "+1 resurs"], { cls: "f-muted", lh: 14 }) +
    F.text(448, 116, ["početak igre", "+1 resurs"], { cls: "f-muted", lh: 14 }) +
    F.text(259, 116, ["kad dobiješ Silu,", "pomeri marker ka sebi"], { cls: "f-muted", lh: 14 }),
  { caption: "Balance of the Force: 3 polja tamne strane, neutralno polje i 3 polja svetle strane." }
);

// Tok poteza
const FIG_SW_TURN = F.figure(
  480, 262,
  F.box(10, 10, 460, 62, "Početak poteza", { sub: "nova baza (ako treba) → +1 resurs ako je Sila skroz kod tebe → resursi od capital ship-ova" }) +
    F.arrow(240, 72, 240, 94) +
    F.box(10, 96, 460, 78, "Tvoj potez - bilo kojim redom, koliko god možeš", {
      cls: "f-acc",
      sub: ["igraj kartu · kupi kartu · koristi sposobnost", "pošalji jedinice u napad · razreši napad"]
    }) +
    F.arrow(240, 174, 240, 196) +
    F.box(10, 198, 460, 62, "Kraj poteza", { sub: "odbaci jedinice iz igre, ruku i resurse → vuci 5 (capital ships ostaju)" }),
  { caption: "Jedan potez u Star Wars: The Deckbuilding Game." }
);

// Napad na bazu
const atk = (x, n) => F.rect(x, 36, 36, 52, { cls: "f-card", r: 4 }) + F.text(x + 18, 70, String(n), { cls: "f-title" });
const FIG_SW_ATTACK = F.figure(
  480, 168,
  atk(16, 3) + atk(58, 2) + atk(100, 4) +
    F.text(76, 112, "ukupno 9 napada", { cls: "f-title f-small" }) +
    F.arrow(146, 62, 176, 62) +
    F.box(180, 22, 130, 80, "Capital ship", { sub: "5 HP" }) +
    F.arrow(312, 62, 336, 62) +
    F.box(340, 22, 130, 80, "Baza", { cls: "f-acc", sub: "8 HP, već 2 štete" }) +
    F.text(245, 126, ["① prima 5 štete", "→ uništen"], { cls: "f-small", lh: 16 }) +
    F.text(405, 126, ["② ostatak 4 štete", "→ baza ima 6 od 8"], { cls: "f-small", lh: 16 }),
  { caption: "Šteta prvo uništava protivničke capital ship-ove, tek ostatak ide na bazu." }
);

// Bounty hunting / sabotaža
const FIG_SW_BOUNTY = F.figure(
  480, 188,
  F.rect(14, 30, 74, 96, { cls: "f-card", r: 5 }) + F.text(51, 50, "X-Wing", { cls: "f-tiny f-title" }) + F.text(51, 92, "3", { cls: "f-big" }) +
    F.rect(98, 30, 74, 96, { cls: "f-card", r: 5 }) + F.text(135, 50, ["Rebel", "Commando"], { cls: "f-tiny f-title", lh: 12 }) + F.text(135, 98, "3", { cls: "f-big" }) +
    F.text(93, 150, "napad 3 + 3 = 6", { cls: "f-title f-small" }) +
    F.arrow(178, 78, 214, 78, { accent: true }) +
    F.rect(218, 14, 104, 146, { cls: "f-card", r: 6 }) +
    F.text(270, 40, ["Director", "Krennic"], { cls: "f-small f-title", lh: 15 }) +
    F.text(270, 76, "Imperija", { cls: "f-muted" }) +
    F.rect(224, 108, 92, 46, { cls: "f-acc", r: 4 }) +
    `<text class="f-small f-title" text-anchor="middle" transform="rotate(180 270 131)"><tspan x="270" y="128">Target 5</tspan><tspan x="270" dy="15">Reward</tspan></text>` +
    F.text(336, 44, "6 ≥ 5 → uspeh!", { cls: "f-title f-small", anchor: "start" }) +
    F.text(336, 70, ["karta odlazi u", "galaxy discard"], { cls: "f-muted", anchor: "start", lh: 15 }) +
    F.text(336, 112, ["možeš uzeti nagradu:", "+3 resursa, +2 Sile"], { cls: "f-muted", anchor: "start", lh: 15 }),
  { caption: "Primer iz pravilnika: Pobunjenici sabotiraju Krennic-a. Target i Reward su odštampani naopako - okrenuti ka protivniku." }
);

// Anatomija karte
const leader = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="f-leader"/><circle cx="${x2}" cy="${y2}" r="2.5" class="f-dot"/>`;
const val = (cy, cls, n) => `<circle cx="172" cy="${cy}" r="10" class="${cls}"/>` + F.text(172, cy + 4, n, { cls: "f-tiny f-title f-on-dark" });
const FIG_SW_ANATOMY = F.figure(
  480, 278,
  F.rect(150, 10, 180, 256, { cls: "f-card", r: 10 }) +
    F.rect(158, 18, 164, 110, { cls: "f-illus", r: 6 }) +
    F.text(248, 80, "ilustracija", { cls: "f-muted" }) +
    `<circle cx="174" cy="34" r="14" class="f-cost"/>` + F.text(174, 39, "6", { cls: "f-title" }) +
    val(62, "f-val-atk", "2") + val(86, "f-val-res", "2") + val(110, "f-val-force", "2") +
    `<circle cx="308" cy="32" r="10" class="f-light-side"/>` +
    F.rect(158, 132, 164, 20, { cls: "f-box", r: 4 }) +
    F.text(240, 146, "PRINCESS LEIA", { cls: "f-label" }) +
    F.text(240, 166, "UNIT · Officer.", { cls: "f-muted" }) +
    F.rect(158, 174, 164, 46, { cls: "f-box", r: 4 }) +
    `<line x1="168" y1="188" x2="312" y2="188" class="f-textline"/><line x1="168" y1="199" x2="312" y2="199" class="f-textline"/><line x1="168" y1="210" x2="260" y2="210" class="f-textline"/>` +
    F.rect(158, 226, 164, 32, { cls: "f-acc", r: 4 }) +
    `<text class="f-tiny f-title" text-anchor="middle" transform="rotate(180 240 242)"><tspan x="240" y="239">Target 6 · Reward</tspan></text>` +
    F.text(138, 38, "Cena", { cls: "f-small f-title", anchor: "end" }) + leader(140, 34, 160, 34) +
    F.text(138, 66, ["Napad (crveno)", "Resursi (žuto)", "Sila (plavo)"], { cls: "f-small", anchor: "end", lh: 22 }) + leader(140, 86, 162, 86) +
    F.text(138, 146, "Ime", { cls: "f-small f-title", anchor: "end" }) + leader(140, 142, 158, 142) +
    F.text(138, 170, "Tip i osobine", { cls: "f-small f-title", anchor: "end" }) + leader(140, 166, 188, 166) +
    F.text(342, 36, "Frakcija", { cls: "f-small f-title", anchor: "start" }) + leader(340, 32, 318, 32) +
    F.text(342, 200, "Sposobnost", { cls: "f-small f-title", anchor: "start" }) + leader(340, 196, 322, 196) +
    F.text(342, 238, ["Target i Reward", "(naopako, za protivnika)"], { cls: "f-small", anchor: "start", lh: 15 }) + leader(340, 242, 322, 242),
  { caption: "Šematski prikaz jedinice (Unit). Tačan raspored ikona proveri na kartama iz kutije." }
);

// 2v2 sto
const FIG_SW_2V2 = F.figure(
  600, 330,
  F.text(145, 14, "REGION 1", { cls: "f-label" }) + F.text(455, 14, "REGION 2", { cls: "f-label" }) +
    F.box(20, 22, 180, 52, "Tim A - igrač 1", { titleCls: "f-title f-small" }) +
    F.box(210, 22, 180, 52, "Shared zone tima A", { cls: "f-acc", sub: "baze + capital ships", titleCls: "f-title f-small" }) +
    F.box(400, 22, 180, 52, "Tim A - igrač 2", { titleCls: "f-title f-small" }) +
    F.box(20, 128, 250, 72, "Galaxy row 1", { sub: ["svoj galaxy deck", "i Outer Rim Pilot-i"], titleCls: "f-title f-small" }) +
    F.rect(285, 100, 30, 128, { cls: "f-box", r: 6 }) +
    Array.from({ length: 7 }, (_, i) => `<circle cx="300" cy="${116 + i * 16}" r="5" class="${i < 3 ? "f-dark-side" : i === 3 ? "f-box" : "f-light-side"}"/>`).join("") +
    F.text(300, 244, "Sila", { cls: "f-tiny f-title" }) +
    F.box(330, 128, 250, 72, "Galaxy row 2", { sub: ["svoj galaxy deck", "i Outer Rim Pilot-i"], titleCls: "f-title f-small" }) +
    F.box(20, 266, 180, 52, "Tim B - igrač 1", { titleCls: "f-title f-small" }) +
    F.box(210, 266, 180, 52, "Shared zone tima B", { cls: "f-acc", sub: "baze + capital ships", titleCls: "f-title f-small" }) +
    F.box(400, 266, 180, 52, "Tim B - igrač 2", { titleCls: "f-title f-small" }) +
    `<line x1="300" y1="80" x2="300" y2="98" class="f-divider"/><line x1="300" y1="250" x2="300" y2="262" class="f-divider"/>`,
  { caption: "2v2: staza Sile deli sto na dva regiona. U svakom regionu su po jedan igrač iz oba tima i zajednički galaxy row." }
);

// ─────────────────────────────── IGRA ───────────────────────────────

registerGame({
  id: "star-wars-deckbuilding",
  title: "Star Wars: The Deckbuilding Game",
  subtitle: "Imperija protiv Pobunjenika",
  publisher: "Fantasy Flight Games",
  players: "2; 4 u 2v2 modu (potrebne dve kutije)",
  category: "Deckbuilding kartaška igra",
  accent: "#4a7fd4",
  cover: "images/star-wars-deckbuilding.jpg",
  coverPos: "50% 15%",
  owned: "Osnovna igra",
  rulesVersion: "Zvanični pravilnik (FFG, 2023)",
  summary:
    "Jedan igrač vodi Imperiju, drugi Pobunjenike. Krećeš sa slabim špilom od 10 karata, kupuješ jače karte iz zajedničkog Galaxy Row-a i napadaš protivničke baze. Ko prvi uništi 3 protivničke baze - pobeđuje.",

  // ─────────────────────────────── BRZI PODSETNIK ───────────────────────────────
  quickRef: [
    {
      title: "Cilj igre",
      html: `
        <p>Prvi ko uništi <b>3 baze</b> protivnika pobeđuje. Igra se završava odmah, bez razrešavanja bilo čega drugog.</p>
        <p><b>Imperija igra prva.</b></p>`
    },
    {
      title: "Priprema",
      html: `
        <ol>
          <li>Izaberite frakcije. Svako uzima svojih 5 početnih baza: startna baza licem nagore, ostale 4 licem nadole ispod nje.</li>
          <li>Promešaj svojih 10 starter karata - to je tvoj špil.</li>
          <li>Promešaj 90 galaxy karata, otvori <b>6</b> u Galaxy Row. Karte okreni ka igraču koji ih kupuje; neutralne bočno.</li>
          <li>10 <b class="kw">Outer Rim Pilot</b> karata licem nagore na drugi kraj reda.</li>
          <li>Marker Sile na krajnje polje <b>Pobunjenika</b>.</li>
          <li>Svako vuče <b>5 karata</b>.</li>
        </ol>`
    },
    {
      title: "Početak poteza",
      html: `
        <ol>
          <li>Nemaš bazu? Izaberi novu iz svojih preostalih.</li>
          <li>Sila je skroz na tvojoj strani → <b>+1 resurs</b>.</li>
          <li>Uzmi resurse od svojih <b class="kw">Capital Ship</b>-ova u igri.</li>
        </ol>`
    },
    {
      title: "Tvoj potez (bilo kojim redom)",
      html: `
        <ul>
          <li><b>Igraj kartu</b> → odmah uzmi njene resurse i pomeri Silu ka sebi.</li>
          <li><b>Kupi kartu</b> iz Galaxy Row-a ili Outer Rim Pilot-a → ide na vrh tvog discard-a. Upražnjeno mesto se odmah popunjava.</li>
          <li><b>Koristi sposobnost</b> - svaku jednom po potezu (nakrivi kartu). Sve je opciono.</li>
          <li><b>Pošalji u napad</b> i <b>razreši napad</b>. Svaka karta napada jednom po potezu.</li>
        </ul>
        <p>Kupuješ samo <b>svoje</b> i <b>neutralne</b> karte, nikad protivničke.</p>`
    },
    {
      title: "Napad na bazu",
      html: `
        <ul>
          <li>Saberi napad jedinica i capital ship-ova koje šalješ.</li>
          <li>Šteta prvo mora da uništi <b>sve protivničke capital ship-ove</b> (ti raspoređuješ), tek ostatak ide na <b>bazu</b>.</li>
          <li>Šteta ≥ Hit Points → uništeno. Uništena baza ide u tvoj victory pile; višak štete propada.</li>
          <li>Šteta na bazi ostaje dok se ne popravi (<b class="kw">Repair</b>).</li>
        </ul>`
    },
    {
      title: "Bounty Hunting / Sabotaža",
      html: `
        <ul>
          <li>Napad <b>jedinicama</b> (ne capital ship-ovima) na <b>protivničku</b> kartu u Galaxy Row-u.</li>
          <li>Napad ≥ <b class="kw">Target</b> → karta u galaxy discard, zameni je novom, možeš uzeti <b class="kw">Reward</b>.</li>
          <li>Manje od Target → ništa se ne dešava. Višak napada propada.</li>
        </ul>`
    },
    {
      title: "Sila (Force)",
      html: `
        <ul>
          <li>Kad dobiješ Silu, pomeri marker ka sebi.</li>
          <li><b>„If the Force is with you“</b> = marker je na jednom od <b>3 tvoja polja</b>. Srednje polje nije ničije.</li>
          <li>Marker skroz kod tebe na početku poteza = +1 resurs.</li>
        </ul>`
    },
    {
      title: "Kraj poteza",
      html: `
        <ol>
          <li>Odbaci sve svoje <b>jedinice</b> iz igre (capital ships ostaju).</li>
          <li>Ispravi bazu i capital ship-ove.</li>
          <li>Odbaci ruku, vrati neiskorišćene resurse.</li>
          <li>Vuci <b>5</b>. Prazan špil → promešaj discard i nastavi.</li>
        </ol>`
    },
    {
      title: "Pojmovi",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Exile</td><td>ukloni kartu iz igre (u kutiju)</td></tr>
          <tr><td class="kw">Repair</td><td>skini štetu sa svoje baze</td></tr>
          <tr><td class="kw">Hit Points</td><td>šteta potrebna da se uništi baza/brod</td></tr>
          <tr><td class="kw">Target</td><td>napad potreban za kartu u Galaxy Row-u</td></tr>
          <tr><td class="kw">Reward</td><td>nagrada za poraženu kartu (opciona)</td></tr>
          <tr><td class="kw">When</td><td>okidač - nije ograničen na 1× po potezu</td></tr>
          <tr><td class="kw">While</td><td>važi dok je uslov ispunjen</td></tr>
        </table>`
    }
  ],

  // ─────────────────────────────── PUNA PRAVILA ───────────────────────────────
  rules: [
    {
      id: "sw-pregled",
      title: "Pregled igre",
      html: `
        <p>Igra za dva igrača: jedan vodi <b>Imperiju</b> (Empire), drugi <b>Pobunjenike</b> (Rebels). Oba igrača počinju sa slabim špilom od 10 karata koji uglavnom daje resurse. Tim resursima kupuješ jače karte iz zajedničkog <b class="kw">Galaxy Row</b>-a i tako gradiš sve jači špil (to je „deckbuilding“).</p>
        <p>Jačim špilom napadaš protivničku bazu. <b>Ko prvi uništi 3 protivničke baze, pobeđuje.</b></p>
        <div class="note">Sve sposobnosti na kartama su <b>opcione</b> - uvek možeš odlučiti da ih ne koristiš. Ali ako koristiš sposobnost, izvrši je koliko god možeš.</div>`
    },
    {
      id: "sw-sadrzaj",
      title: "Sadržaj kutije",
      html: `
        <table>
          <tr><th>Komponenta</th><th>Količina</th></tr>
          <tr><td>Galaxy karte</td><td>90</td></tr>
          <tr><td>Starter karte</td><td>10 Imperija + 10 Pobunjenici</td></tr>
          <tr><td>Baze</td><td>20 (10 Imperija + 10 Pobunjenici)</td></tr>
          <tr><td>Outer Rim Pilot karte</td><td>10</td></tr>
          <tr><td>Referentne karte</td><td>2</td></tr>
          <tr><td>Balance of the Force staza + marker Sile</td><td>1 + 1 (beli)</td></tr>
          <tr><td>Žetoni resursa</td><td>20 (žuti)</td></tr>
          <tr><td>Žetoni štete</td><td>50 (ljubičasti)</td></tr>
        </table>`
    },
    {
      id: "sw-priprema",
      title: "Priprema igre",
      html: `
        <ol>
          <li>Izaberite frakciju: Imperija ili Pobunjenici.</li>
          <li>Svako izdvaja svojih <b>5 početnih baza</b> (ostalih 5 ostaje u kutiji - koriste se u naprednim modovima):
            <ul>
              <li><b>Pobunjenici:</b> Dantooine (startna), Hoth, Mon Cala, Sullust, Yavin IV</li>
              <li><b>Imperija:</b> Lothal (startna), Corellia, Coruscant, Death Star, Endor</li>
            </ul>
          </li>
          <li>Startnu bazu stavi licem nagore ispred sebe, ostale 4 licem nadole ispod nje (redosled nije bitan).</li>
          <li>Uzmi svojih 10 starter karata i promešaj ih - to je tvoj špil:
            <ul>
              <li><b>Pobunjenici:</b> 7× Alliance Shuttle, 2× Rebel Trooper, 1× Temple Guardian</li>
              <li><b>Imperija:</b> 7× Imperial Shuttle, 2× Stormtrooper, 1× Inquisitor</li>
            </ul>
          </li>
          <li>Promešaj 90 galaxy karata (Galaxy Deck) i otvori prvih <b>6</b> u red - to je <b class="kw">Galaxy Row</b>. Imperijalne karte okreni ka igraču Imperije, pobunjeničke ka Pobunjenicima, a <b>neutralne bočno</b>. Galaxy Deck stavi licem nadole na jedan kraj reda.</li>
          <li>10 <b class="kw">Outer Rim Pilot</b> karata stavi u gomilu licem nagore na drugi kraj reda.</li>
          <li>Žetone štete i resursa stavi na dohvat obojici.</li>
          <li>Rasklopi stazu <b>Balance of the Force</b> pored Outer Rim Pilot-a, simbolom Pobunjenika ka igraču Pobunjenika. Marker Sile stavi na <b>krajnje polje na strani Pobunjenika</b>.</li>
          <li>Svako vuče <b>5 karata</b>. <b>Imperija igra prva.</b></li>
        </ol>
        ${FIG_SW_TABLE}`
    },
    {
      id: "sw-deckbuilding",
      title: "Osnove deckbuilding-a",
      html: `
        <ul>
          <li>Počinješ sa 10 slabih karata. Na početku igre koristi njihove resurse da <b>kupuješ nove karte</b>.</li>
          <li>Kupljena karta ide na vrh tvog <b>discard</b>-a. Kad se špil isprazni, discard se promeša i postaje novi špil - tada ćeš izvlačiti i nove karte.</li>
          <li>Svakog poteza vučeš 5 novih karata, a sve neiskorišćeno odbacuješ - ništa se ne čuva za sledeći potez (osim capital ship-ova i štete na bazama).</li>
          <li><b class="kw">Exile</b> izbacuje slabe karte (npr. Shuttle) iz tvog špila zauvek, pa češće izvlačiš jake karte.</li>
          <li>Prati šta protivnik kupuje - tako vidiš njegovu strategiju.</li>
        </ul>`
    },
    {
      id: "sw-sila",
      title: "Ravnoteža Sile",
      html: `
        <p>Staza <b class="kw">Balance of the Force</b> pokazuje na čijoj je strani Sila.</p>
        ${FIG_SW_FORCE}
        <ul>
          <li>Marker na jednom od <b>3 polja tamne strane</b> → Sila je sa Imperijom.</li>
          <li>Marker na jednom od <b>3 polja svetle strane</b> → Sila je sa Pobunjenicima.</li>
          <li>Marker na <b>srednjem polju</b> → Sila nije ni sa kim.</li>
          <li>Kad dobiješ Silu (npr. igraš kartu sa vrednošću Sile), pomeri marker toliko polja <b>ka sebi</b>.</li>
          <li>Sposobnosti koje počinju sa <b>„If the Force is with you…“</b> rade samo dok je marker na tvojoj strani.</li>
          <li>Ako je marker <b>skroz na tvojoj strani</b> na početku tvog poteza, dobijaš <b>+1 resurs</b> za taj potez.</li>
        </ul>
        <div class="note">Sila počinje skroz na strani Pobunjenika. Pošto Imperija igra prva, Pobunjenici na početku svog prvog poteza dobijaju +1 resurs ako Imperija nije pomerila marker.</div>`
    },
    {
      id: "sw-karte",
      title: "Karte: vrste i izgled",
      html: `
        <h4>Tri vrste karata</h4>
        <table>
          <tr><th>Vrsta</th><th>Opis</th></tr>
          <tr><td><b class="kw">Unit</b> (jedinica)</td><td>Većina karata. Kad je odigraš, ostaje u igri <b>do kraja poteza</b>, pa ide u discard. Može napadati bazu i protivničke karte u Galaxy Row-u.</td></tr>
          <tr><td><b class="kw">Capital Ship</b> (veliki brod)</td><td><b>Ostaje u igri</b> iz poteza u potez dok ga ne unište. Na početku svakog tvog poteza daje resurse. Štiti tvoju bazu: protivnik mora prvo njega da uništi. Ima <b class="kw">Hit Points</b> (dole na karti). Napada samo bazu, ne karte u Galaxy Row-u.</td></tr>
          <tr><td><b class="kw">Base</b> (baza)</td><td>Tvoja baza koju protivnik napada. Ima Hit Points i često posebnu sposobnost koja važi dok je to tvoja baza.</td></tr>
        </table>
        <h4>Frakcije</h4>
        <ul>
          <li>Svaka galaxy karta je <b>imperijalna</b>, <b>pobunjenička</b> ili <b>neutralna</b> (bez simbola frakcije).</li>
          <li>Kupuješ samo karte <b>svoje frakcije</b> i <b>neutralne</b>. Karte protivničke frakcije su <b>enemy</b> karte - njih ne kupuješ, već ih napadaš (bounty hunting / sabotaža).</li>
          <li><b class="kw">Outer Rim Pilot</b> je neutralna karta koju uvek možeš kupiti. Daje 2 resursa, a posle toga je možeš <b class="kw">Exile</b>-ovati za 1 Silu.</li>
        </ul>
        <h4>Kako se čita karta</h4>
        ${FIG_SW_ANATOMY}
        <ul>
          <li><b>Cena</b> (gore levo) - koliko resursa košta kupovina iz Galaxy Row-a.</li>
          <li><b>Napad</b>, <b>resursi</b> i <b>Sila</b> - šta karta daje kad je odigraš.</li>
          <li><b>Tip i osobine</b> (traits: Trooper, Fighter, Officer, Bounty Hunter…) - druge karte ih proveravaju (npr. „svaki tvoj Fighter dobija +1 napad“).</li>
          <li><b>Simbol jedinstvenosti</b> - označava jedinstvene likove na koje se druge karte mogu pozivati.</li>
          <li><b>Sposobnost</b> - posebno dejstvo karte.</li>
          <li><b class="kw">Target</b> i <b class="kw">Reward</b> - dole, naopako odštampani da ih čita protivnik: koliko napada treba da se karta porazi u Galaxy Row-u i šta dobija onaj ko je porazi.</li>
          <li><b class="kw">Hit Points</b> - na bazama i capital ship-ovima: koliko štete ih uništava.</li>
        </ul>
        <h4>Starter karte</h4>
        <table>
          <tr><th>Karta</th><th>Daje</th></tr>
          <tr><td>Alliance / Imperial Shuttle ×7</td><td>1 resurs</td></tr>
          <tr><td>Rebel Trooper / Stormtrooper ×2</td><td>2 napada</td></tr>
          <tr><td>Temple Guardian / Inquisitor ×1</td><td>po izboru jedno: napad, resurs ili Silu (vidi tekst karte)</td></tr>
        </table>`
    },
    {
      id: "sw-potez",
      title: "Tok poteza",
      html: `
        ${FIG_SW_TURN}
        <h4>Početak poteza</h4>
        <ol>
          <li>Ako nemaš bazu (protivnik ti je uništio bazu u svom potezu), pogledaj preostale baze i <b>izaberi jednu</b> da je otkriješ kao novu.</li>
          <li>Ako je Sila <b>skroz na tvojoj strani</b>, uzmi 1 žeton resursa.</li>
          <li>Uzmi resurse od svakog svog <b>capital ship</b>-a u igri.</li>
        </ol>
        <p>Resursi koje dobiješ u potezu čine tvoj <b>resource pool</b>.</p>
        <h4>Tokom poteza</h4>
        <p>Bilo kojim redom i koliko god puta možeš:</p>
        <ul>
          <li>igraj kartu,</li>
          <li>kupi kartu,</li>
          <li>koristi sposobnost karte,</li>
          <li>pošalji karte u napad (commit),</li>
          <li>razreši napad,</li>
          <li>završi potez.</li>
        </ul>
        <h4>Kraj poteza</h4>
        <ol>
          <li>Odbaci sve svoje <b>jedinice</b> iz igre u discard.</li>
          <li>Vrati bazu i capital ship-ove u normalan položaj (ispravi nakrivljene).</li>
          <li>Odbaci karte koje su ostale u ruci; neiskorišćene resurse vrati u zalihu.</li>
          <li>Vuci <b>5 karata</b>. Ako se špil isprazni tokom vučenja, promešaj discard kao novi špil i nastavi.</li>
        </ol>
        <div class="example"><b>Primer:</b> u špilu su ti ostale 3 karte. Izvučeš te 3, promešaš discard u novi špil i izvučeš još 2 - ukupno 5.</div>`
    },
    {
      id: "sw-igranje",
      title: "Igranje karata i sposobnosti",
      html: `
        <h4>Igranje karte</h4>
        <ol>
          <li>Stavi kartu iz ruke licem nagore u svoju zonu - sada je „u igri“.</li>
          <li>Odmah uzmi resurse jednake njenoj vrednosti resursa.</li>
          <li>Pomeri marker Sile ka sebi za njenu vrednost Sile.</li>
        </ol>
        <p>Posle toga možeš koristiti njenu sposobnost i/ili je poslati u napad. Ne moraš odigrati sve karte iz ruke, ali neodigrane se svejedno odbacuju na kraju poteza.</p>
        <h4>Sposobnosti</h4>
        <ul>
          <li>Sposobnost svake karte u igri koristiš <b>najviše jednom po potezu</b>, i to već u potezu kad je odigraš. Posle korišćenja <b>blago nakrivi kartu</b> kao podsetnik.</li>
          <li>Sposobnost ne moraš koristiti odmah - osim ako počinje sa „<b>When</b>“ (vidi Dodatna pravila).</li>
          <li>Sposobnosti su opcione. Ako je koristiš, izvrši je koliko možeš, a ono što ne može da se izvrši preskoči.</li>
          <li>Svaku vrednost na karti (napad, resursi, Sila) koristiš jednom po potezu.</li>
        </ul>`
    },
    {
      id: "sw-kupovina",
      title: "Kupovina karata",
      html: `
        <ul>
          <li>Kupuješ karte iz <b>Galaxy Row</b>-a ili sa gomile <b>Outer Rim Pilot</b>.</li>
          <li><b>Pobunjenici</b> kupuju pobunjeničke i neutralne karte. <b>Imperija</b> kupuje imperijalne i neutralne. Karte protivnika ne možeš kupiti.</li>
          <li>Plati cenu iz resource pool-a (vrati žetone u zalihu) i stavi kartu <b>licem nagore na vrh svog discard-a</b>. Biće u tvom špilu posle sledećeg mešanja.</li>
          <li>Kad karta napusti Galaxy Row (kupovinom, napadom ili odbacivanjem), <b>odmah</b> je zameni gornjom kartom Galaxy Deck-a.</li>
        </ul>`
    },
    {
      id: "sw-napad",
      title: "Napad na protivničku bazu",
      html: `
        <h4>Slanje u napad (commit)</h4>
        <ul>
          <li>Jedinice i capital ship-ove koje šalješ na bazu grupiši zajedno (ili ih stavi ispred protivničke baze).</li>
          <li>Svaka karta može učestvovati u <b>jednom napadu po potezu</b>. Pri pomeranju zadrži nakrivljenost (da se vidi da li je sposobnost korišćena).</li>
          <li>Slanje ne razrešava napad odmah - možeš dodavati karte pa sve razrešiti zajedno.</li>
        </ul>
        <h4>Razrešavanje</h4>
        ${FIG_SW_ATTACK}
        <ol>
          <li>Saberi napad svih poslatih karata i uzmi toliko žetona štete.</li>
          <li>Prvo moraš uništiti <b>sve protivničke capital ship-ove</b>. Ako ih ima više, ti raspoređuješ štetu. Capital ship sa štetom ≥ Hit Points je uništen i ide u vlasnikov discard.</li>
          <li>Preostala šteta ide na <b>bazu</b>. Šteta na bazi ostaje dok je neka sposobnost ne popravi.</li>
          <li>Baza sa štetom ≥ Hit Points je uništena: stavi je na <b>svoj kraj staze Sile</b> (tvoj victory pile), a žetone vrati u zalihu.</li>
          <li><b>Višak štete propada</b> - ne prelazi na sledeću bazu.</li>
        </ol>
        <p>Protivnik bira novu bazu tek na početku svog sledećeg poteza. Karte koje su napale drži sa strane do kraja poteza, da ne napadnu ponovo.</p>
        <div class="note">Ako je protivnikova baza već uništena sposobnošću, i dalje možeš napasti da bi oštetio njegove capital ship-ove; šteta koja bi išla na bazu propada.</div>`
    },
    {
      id: "sw-bounty",
      title: "Bounty Hunting i sabotaža",
      html: `
        <p>Isti napad pod dva imena: Imperija radi <b class="kw">Bounty Hunting</b>, Pobunjenici <b class="kw">Sabotage</b>. Napadaš <b>protivničku</b> kartu u Galaxy Row-u.</p>
        ${FIG_SW_BOUNTY}
        <ol>
          <li>Izaberi kartu protivničke frakcije u Galaxy Row-u i stavi ispred nje jedinice koje napadaju.</li>
          <li>Saberi njihov napad. Ako je ≥ <b class="kw">Target</b> vrednosti te karte, napad uspeva.</li>
          <li>Poraženu kartu stavi u <b>galaxy discard</b> i zameni je gornjom kartom Galaxy Deck-a.</li>
          <li>Možeš uzeti <b class="kw">Reward</b> sa poražene karte (opciono).</li>
        </ol>
        <ul>
          <li><b>Capital ship-ovi</b> ne mogu učestvovati u ovom napadu.</li>
          <li>Višak napada propada; na metu se ne stavljaju žetoni štete.</li>
          <li>Ako je napad manji od Target - ništa se ne dešava.</li>
          <li><b>Neutralne</b> karte se ne mogu napadati (vidi opciono pravilo „Isplata neutralnih karata“).</li>
          <li>Ako neka sposobnost odbaci kartu iz Galaxy Row-a, ne dobijaš njen Reward.</li>
        </ul>
        <div class="note">Sabotaža je dvostruko korisna: dobijaš nagradu, a protivnik gubi kartu koju je možda planirao da kupi.</div>`
    },
    {
      id: "sw-pobeda",
      title: "Pobeda",
      html: `
        <p>Prvi igrač koji uništi <b>3 protivničke baze</b> pobeđuje. Igra se završava <b>odmah</b> kad padne treća baza - ništa se više ne razrešava.</p>
        <p>Broj baza se može menjati opcionim pravilom (vidi „Napredni modovi i opciona pravila“).</p>`
    },
    {
      id: "sw-dodatna",
      title: "Dodatna pravila i pojmovi",
      html: `
        <table>
          <tr><th>Pojam</th><th>Značenje</th></tr>
          <tr><td><b>Sposobnosti</b></td><td>Bez navedenog trenutka mogu se koristiti bilo kada u tvom potezu dok je karta u igri - jednom po potezu. Opcione su; ako ih koristiš, izvrši koliko možeš (npr. „repair 3“ na bazi sa 2 štete popravlja 2).</td></tr>
          <tr><td><b class="kw">Choose</b></td><td>Biraš jednu od opcija, ali samo onu koju možeš izvršiti.</td></tr>
          <tr><td><b class="kw">Deal damage</b></td><td>Šteta ide direktno na bazu, <b>preskačući capital ship-ove</b>.</td></tr>
          <tr><td><b class="kw">Destroy</b></td><td>Uništi capital ship protivnika (ide u njegov discard) ili u Galaxy Row-u (ide u galaxy discard).</td></tr>
          <tr><td><b class="kw">Discard</b></td><td>Iz svoje ruke biraš kartu sam, osim ako piše „nasumično“. Karta ide u odgovarajući discard.</td></tr>
          <tr><td><b class="kw">Gain</b></td><td>Dobijaš dodatni napad, resurse ili Silu pod uslovima iz teksta.</td></tr>
          <tr><td><b class="kw">If</b></td><td>Uslovna sposobnost - radi samo ako je uslov ispunjen.</td></tr>
          <tr><td><b class="kw">Look</b></td><td>Tajno pogledaj gornju kartu Galaxy Deck-a i vrati je.</td></tr>
          <tr><td><b class="kw">Exile</b></td><td>Ukloni kartu iz igre (vrati u kutiju). Karta koja exile-uje samu sebe prvo daje svoj napad, resurse i Silu. Karta iz ruke koju exile-uješ se ne može odigrati tog poteza.</td></tr>
          <tr><td><b class="kw">Repair</b></td><td>Skini toliko žetona štete sa svoje baze.</td></tr>
          <tr><td><b class="kw">Reveal</b></td><td>Otkrij gornju kartu Galaxy Deck-a svima; ako ne piše da se odbacuje, vrati je nazad licem nadole.</td></tr>
          <tr><td><b class="kw">When</b></td><td>Okidač - razrešava se u tom trenutku, i to <b>svaki put</b> kad se uslov ispuni (nije ograničen na 1× po potezu). Ako se sukobi sa Reward-om, prvo ide Reward.</td></tr>
          <tr><td><b class="kw">While</b></td><td>Stalna sposobnost - važi dok je uslov ispunjen; prestaje čim karta napusti igru.</td></tr>
          <tr><td><b>Prazan špil</b></td><td>Discard se meša u novi špil tek kad treba vući kartu, ne čim se špil isprazni. Isto važi za Galaxy Deck.</td></tr>
          <tr><td><b>Discard gomile</b></td><td>Sva tri discard-a su javna - smeš ih pregledati, ali ne i menjati im redosled.</td></tr>
        </table>`
    },
    {
      id: "sw-modovi",
      title: "Napredni modovi i opciona pravila",
      html: `
        <h4>Napredni modovi</h4>
        <table>
          <tr><th>Mod</th><th>Opis</th></tr>
          <tr><td><b>Full Galaxy</b></td><td>Igra „kako je zamišljena“: svako koristi svih <b>10 baza</b> svoje frakcije, pa ima više izbora pri biranju nove baze. Preporuka: igrati do 4 baze.</td></tr>
          <tr><td><b>Secret Bases</b></td><td>Počinješ sa startnom bazom i <b>tajno</b> biraš 4 od preostalih 9; ostale vraćaš u kutiju. Ne znaš koje baze protivnik ima. Preporuka: igrati do 4 baze.</td></tr>
          <tr><td><b>2v2</b></td><td>Dva tima po dva igrača; potrebne su dve kutije. Vidi poglavlje „2v2 - igra za četvoro“.</td></tr>
        </table>
        <h4>Opciona pravila</h4>
        <ul>
          <li><b>Dužina igre:</b> dogovorite se unapred - do 2 baze za kraću igru, do 4 ili 5 za dužu.</li>
          <li><b>Isplata neutralnih karata:</b> platiš cenu neutralne karte u Galaxy Row-u i odbaciš je u galaxy discard, umesto da je kupiš. Korisno da skloniš kartu koju ne želiš da protivnik uzme.</li>
        </ul>`
    },
    {
      id: "sw-2v2",
      title: "2v2 - igra za četvoro",
      html: `
        <p>Četiri igrača u dva tima. Potrebne su <b>dve kutije</b> igre (mogu i dva različita izdanja, npr. originalno + Clone Wars).</p>
        ${FIG_SW_2V2}
        <h4>Priprema</h4>
        <ol>
          <li>Timovi sede jedan naspram drugog: saigrači jedan pored drugog, svako preko puta jednog protivnika.</li>
          <li>Jedna staza Sile ide na <b>sredinu stola</b> i deli ga na dva <b>regiona</b>. U svakom regionu je po jedan igrač iz svakog tima.</li>
          <li>Igrači u svakom regionu postavljaju igru kao za 1v1: <b>svaki region ima svoj galaxy deck, galaxy row i Outer Rim Pilot gomilu</b>.</li>
          <li>Svako ima svoj špil (u svom regionu) i svoje baze. Baze oba saigrača stoje jedna pored druge, ispod staze Sile - to je <b>shared zone</b> tima.</li>
          <li>Nasumično odredite tim koji igra prvi. Drugi tim počinje sa markerom Sile skroz na svojoj strani.</li>
        </ol>
        <p><b>Timovi:</b> bilo koja kombinacija frakcija, ali u svakom regionu igrači moraju biti <b>različitih</b> frakcija (npr. dva Pobunjenika protiv dva Imperijalca, ili mešano - tada svaki Pobunjenik deli region sa Imperijalcem iz drugog tima).</p>
        <h4>Timski rad</h4>
        <ul>
          <li>Na kartama „<b>you/your</b>“ znači „<b>tvoj tim</b>“. Npr. ako ti imaš Stormtroopera u igri, saigračev General Veers sme da vuče kartu.</li>
          <li>Važi i za baze: stalne sposobnosti (npr. Endor) važe za karte oba saigrača; okidače (npr. Corellia, Yavin IV) može aktivirati bilo koji saigrač, ali i dalje samo jednom po okidaču.</li>
          <li><b>Izuzetak - Exile:</b> ne možeš exile-ovati saigračeve karte. Svoje exile-ovane karte držiš u svojoj gomili.</li>
        </ul>
        <h4>Regioni i shared zone</h4>
        <ul>
          <li>Sa galaxy deck-om, galaxy row-om i Outer Rim Pilot-ima radiš <b>samo u svom regionu</b>. Karte ne prelaze iz regiona u region.</li>
          <li>„Protivnik“ na karti je <b>protivnik iz tvog regiona</b> - ne možeš kupovati iz drugog galaxy row-a ni terati drugog protivnika da odbacuje karte.</li>
          <li>Karte u shared zone-u su u oba regiona. <b>Capital ship</b> stavljaš na svoju stranu shared zone-a svog tima: štiti <b>obe baze</b> tima, ali resurse od njega dobija samo onaj ko ga je odigrao.</li>
          <li>Bazama i capital ship-ovima u protivničkom shared zone-u prilaziš kao da su u tvom regionu.</li>
        </ul>
        <h4>Igra</h4>
        <ul>
          <li><b>Zajednički potez:</b> u potezu tvog tima ti i saigrač igrate <b>istovremeno</b>. Slobodno se dogovarajte oko redosleda.</li>
          <li>Ako je Sila skroz kod vas na početku poteza, <b>svaki</b> saigrač dobija 1 resurs.</li>
          <li><b>Resursi se ne dele</b>: svako kupuje svojim resursima, samo iz galaxy row-a svog regiona, i samo za svoj špil.</li>
          <li><b>Napad:</b> saberite napad oba saigrača i rasporedite štetu na dve protivničke baze kako hoćete - ali prvo moraju pasti <b>svi</b> protivnički capital ship-ovi (sa obe strane njihovog shared zone-a).</li>
        </ul>
        <div class="example"><b>Primer iz pravila:</b> tvoj X-Wing ne može da vuče kartu jer je Sila na neutralnom polju. Saigrač igra Temple Guardian-a, uzima 1 Silu i pomera marker na svetlu stranu - sada tvoj X-Wing radi.</div>
        <h4>Pobeda</h4>
        <p>Uništi <b>po 3 baze svakom protivniku - ukupno 6</b>. Dodatne baze jednog protivnika se ne računaju. Preporuka: igrajte sa <b>Full Galaxy</b> pravilima (svih 10 baza).</p>
        <h4>Česta pitanja (2v2)</h4>
        <dl class="faq">
          <dt>Mogu li da uništim baze oba protivnika u istom potezu?</dt><dd>Da - štetu delite kako hoćete.</dd>
          <dt>Šta ako je moja treća baza pala, a saigračeva nije?</dt><dd>Biraš novu bazu na početku sledećeg poteza kao i obično. Ako ti ponestane baza, igraš dalje bez baze, a protivnici štetu nanose saigračevoj bazi.</dd>
          <dt>Ako saigrač ima unique kartu u igri (npr. Yavin IV ili Darth Vader), smem li i ja svoju?</dt><dd>Da, saigrači mogu imati istu bazu i istu unique kartu.</dd>
        </dl>
        <h4>Karte u 2v2 (originalno izdanje, izbor)</h4>
        <table>
          <tr><th>Karta</th><th>Kako radi u 2v2</th></tr>
          <tr><td>Admiral Piett, Imperial Carrier, Endor</td><td>Bonus važi i za saigračeve brodove/jedinice. Dva Endor-a = +2 napada.</td></tr>
          <tr><td>Bespin, Kafrene, Jedha, Sullust, Coruscant</td><td>Bilo koji saigrač, ali samo jednom po potezu (dve iste baze = dvostruko).</td></tr>
          <tr><td>Death Star, Ord Mantell</td><td>Bilo koji saigrač, jednom po potezu po kopiji.</td></tr>
          <tr><td>Hoth</td><td>Dva Hoth-a zajedno sprečavaju do 4 štete u bilo kojoj kombinaciji.</td></tr>
          <tr><td>Corellia, Mon Cala, Tatooine, Rodia</td><td>Kad otkriješ bazu, ti biraš da li sposobnost koristiš ti ili saigrač.</td></tr>
          <tr><td>TIE Fighter, Chewbacca, General Veers, Han Solo</td><td>Uslov se gleda za ceo tim (npr. capital ship saigrača).</td></tr>
          <tr><td>U-Wing, HWK-290, Landing Craft, C-ROC</td><td>Popravka sme na tvojoj ili saigračevoj bazi.</td></tr>
          <tr><td>Nebulon-B, Rebel Transport, Gozanti</td><td>Bilo koji saigrač, ali jednom po potezu.</td></tr>
          <tr><td>Princess Leia, Grand Moff Tarkin</td><td>Ne možeš kupovati za saigrača ni stavljati karte u njegov špil.</td></tr>
          <tr><td>Kel Dor Mystic, IG-88, Quarren Mercenary, Dagobah, Kessel</td><td>Exile samo tvojih karata.</td></tr>
          <tr><td>Yavin IV</td><td>Kad bilo koji protivnik odbaci kartu u vašem potezu, 2 štete bilo kojoj protivničkoj bazi.</td></tr>
          <tr><td>Z-95</td><td>Vuče kartu ako protivnički tim ima bar 1 capital ship u shared zone-u.</td></tr>
        </table>
        <p class="muted small">Potpuna lista (i za Clone Wars izdanje) je u zvaničnom 2v2 dokumentu (FFG, v1.1).</p>`
    },
    {
      id: "sw-faq",
      title: "Česta pitanja",
      html: `
        <dl class="faq">
          <dt>Moram li odigrati sve karte iz ruke?</dt><dd>Ne. Ali neodigrane karte se odbacuju na kraju poteza.</dd>
          <dt>Moram li sposobnost koristiti odmah kad odigram kartu?</dt><dd>Ne, biraš kada - osim ako počinje sa „When“.</dd>
          <dt>Mogu li iskoristiti samo deo sposobnosti?</dt><dd>Ne. Ako je koristiš, izvršavaš je koliko god možeš.</dd>
          <dt>Moram li uzeti Reward?</dt><dd>Ne, nagrade su opcione.</dd>
          <dt>„Exile iz ruke ili discard-a“ - mogu li iz oba?</dt><dd>Da, iz ruke, iz discard-a ili kombinovano.</dd>
          <dt>Scout Trooper otkrije neutralnu kartu?</dt><dd>Ništa se ne dešava, vrati je licem nadole.</dd>
          <dt>Sila je skroz kod Pobunjenika, a Imperija igra Duros Spy - mogu li izabrati da oni dobiju Silu?</dt><dd>Ne. Moraš odbaciti kartu, jer je to jedina opcija koja se može u potpunosti izvršiti.</dd>
          <dt>Koliko puta po potezu radi sposobnost Yavin IV?</dt><dd>Svaki put kad se ispuni uslov - okidači („When“) nisu ograničeni na jednom po potezu.</dd>
        </dl>`
    },
    {
      id: "sw-saveti",
      title: "Saveti za početnike",
      html: `
        <ul>
          <li><b>Na početku kupuj</b>, ne napadaj - rano ulaganje u jače karte se višestruko isplati.</li>
          <li><b>Exile-uj Shuttle-ove</b> kad god možeš: tanji špil = češće izvlačiš jake karte.</li>
          <li><b>Capital ship-ovi</b> su dugoročna investicija: daju resurse svakog poteza i štite bazu.</li>
          <li><b>Sabotiraj/lovi</b> protivnikove skupe karte u Galaxy Row-u pre nego što ih kupi.</li>
          <li><b>Pazi na Silu</b> - mnoge karte su mnogo jače „if the Force is with you“.</li>
          <li><b>Biraj bazu pametno:</b> sposobnost nove baze može preokrenuti igru (npr. Hoth sprečava prve 2 štete svakog poteza).</li>
        </ul>
        <p class="muted small">Ovo poglavlje su saveti, nisu deo zvaničnih pravila.</p>`
    }
  ],

  // ─────────────────────────────── KLJUČNE REČI ───────────────────────────────
  glossary: [
    { term: "Attack (napad)", group: "Osnovno", def: "Šteta koju karta nanosi kad učestvuje u napadu." },
    { term: "Resources (resursi)", group: "Osnovno", def: "Valuta za kupovinu karata. Dobijaš ih igranjem karata, od capital ship-ova i od Sile. Neiskorišćeni se vraćaju na kraju poteza." },
    { term: "Force (Sila)", group: "Osnovno", def: "Pomera marker na stazi Balance of the Force ka tebi." },
    { term: "If the Force is with you", group: "Osnovno", def: "Uslov: marker Sile je na jednom od 3 polja tvoje strane." },
    { term: "Unit", group: "Osnovno", def: "Jedinica - ostaje u igri do kraja poteza, pa ide u discard." },
    { term: "Capital Ship", group: "Osnovno", def: "Veliki brod - ostaje u igri dok ne bude uništen, daje resurse na početku poteza i mora biti uništen pre nego što šteta ode na bazu." },
    { term: "Base", group: "Osnovno", def: "Baza koju protivnik napada. Uništi 3 protivničke baze za pobedu." },
    { term: "Hit Points", group: "Osnovno", def: "Koliko štete je potrebno da se uništi baza ili capital ship." },
    { term: "Galaxy Row", group: "Osnovno", def: "6 otvorenih karata iz Galaxy Deck-a koje igrači kupuju ili napadaju." },
    { term: "Outer Rim Pilot", group: "Osnovno", def: "Neutralna karta uvek dostupna za kupovinu (10 komada). Daje 2 resursa; posle toga je možeš exile-ovati za 1 Silu." },
    { term: "Neutral", group: "Osnovno", def: "Karta bez simbola frakcije; mogu je kupiti oba igrača, ali se ne može napadati." },
    { term: "Enemy card", group: "Osnovno", def: "Karta protivničke frakcije - ne možeš je kupiti, ali je možeš napasti u Galaxy Row-u." },
    { term: "Victory pile", group: "Osnovno", def: "Tvoj kraj staze Sile, gde stavljaš uništene protivničke baze." },
    { term: "Bounty Hunting", group: "Napad", def: "Imperijalni napad jedinicama na pobunjeničku kartu u Galaxy Row-u." },
    { term: "Sabotage", group: "Napad", def: "Pobunjenički napad jedinicama na imperijalnu kartu u Galaxy Row-u." },
    { term: "Target", group: "Napad", def: "Napad potreban da se porazi karta u Galaxy Row-u; odštampano naopako, ka protivniku." },
    { term: "Reward", group: "Napad", def: "Nagrada za poraženu kartu u Galaxy Row-u. Opciona." },
    { term: "Commit", group: "Napad", def: "Slanje karte u napad. Svaka karta napada jednom po potezu." },
    { term: "Deal damage", group: "Napad", def: "Šteta direktno na bazu, preskačući capital ship-ove." },
    { term: "Destroy", group: "Napad", def: "Uništi capital ship (u igri ili u Galaxy Row-u)." },
    { term: "Exile", group: "Sposobnosti", def: "Ukloni kartu iz igre (u kutiju). Tako se špil čisti od slabih karata." },
    { term: "Repair", group: "Sposobnosti", def: "Skini žetone štete sa svoje baze." },
    { term: "Discard", group: "Sposobnosti", def: "Odbaci kartu u odgovarajući discard. Iz svoje ruke biraš sam, osim ako piše nasumično." },
    { term: "Reveal", group: "Sposobnosti", def: "Pokaži gornju kartu Galaxy Deck-a svima, pa je vrati (osim ako je treba odbaciti)." },
    { term: "Look", group: "Sposobnosti", def: "Tajno pogledaj gornju kartu Galaxy Deck-a i vrati je." },
    { term: "Choose", group: "Sposobnosti", def: "Izaberi jednu opciju - samo onu koju možeš izvršiti." },
    { term: "When", group: "Sposobnosti", def: "Okidač; razrešava se svaki put kad se uslov ispuni." },
    { term: "While", group: "Sposobnosti", def: "Stalno dejstvo dok je uslov ispunjen." },
    { term: "Traits", group: "Sposobnosti", def: "Osobine karte (Trooper, Fighter, Officer, Jedi, Bounty Hunter…) na koje se druge karte pozivaju." }
  ],

  expansions: [],

  sources: [
    { label: "Zvanični pravilnik (Fantasy Flight Games, PDF)", url: "https://images-cdn.fantasyflightgames.com/filer_public/2d/41/2d41282a-2f80-41da-9555-61ee9ec4e61a/swg01_rulebook_v2-compressed.pdf" },
    { label: "Stranica igre (fantasyflightgames.com)", url: "https://www.fantasyflightgames.com/en/products/star-wars-the-deckbuilding-game/" },
    { label: "2v2 Multiplayer Rules v1.1 (FFG, PDF)", url: "https://images-cdn.fantasyflightgames.com/filer_public/2a/00/2a00b9ac-8506-4e0d-bd2c-0b13ce0b35de/swg02_multiplayer_v1-1_compressed.pdf" }
  ]
});
})();
