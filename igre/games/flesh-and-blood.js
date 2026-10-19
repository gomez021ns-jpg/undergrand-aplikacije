(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

const leader = (x1, y1, x2, y2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="f-leader"/><circle cx="${x2}" cy="${y2}" r="2.5" class="f-dot"/>`;
const pitchDot = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="7" class="f-pitch-dot"/>`;

// Anatomija karte
const FIG_FAB_CARD = F.figure(
  480, 286,
  F.rect(150, 10, 180, 266, { cls: "f-card", r: 10 }) +
    F.rect(158, 18, 164, 10, { cls: "f-strip-red", r: 3 }) +
    pitchDot(170, 44) +
    `<circle cx="306" cy="44" r="14" class="f-cost"/>` + F.text(306, 49, "2", { cls: "f-title" }) +
    F.text(240, 49, "Ime karte", { cls: "f-title f-small" }) +
    F.rect(158, 62, 164, 96, { cls: "f-illus", r: 6 }) +
    F.text(240, 114, "ilustracija", { cls: "f-muted" }) +
    F.rect(158, 164, 164, 64, { cls: "f-box", r: 4 }) +
    `<line x1="168" y1="180" x2="312" y2="180" class="f-textline"/><line x1="168" y1="192" x2="312" y2="192" class="f-textline"/><line x1="168" y1="204" x2="260" y2="204" class="f-textline"/>` +
    F.text(240, 222, "Go again", { cls: "f-kw f-tiny" }) +
    F.text(240, 246, "Generic Action – Attack", { cls: "f-label" }) +
    `<circle cx="174" cy="258" r="13" class="f-val-atk"/>` + F.text(174, 263, "6", { cls: "f-title f-small f-on-dark" }) +
    `<circle cx="306" cy="258" r="13" class="f-def"/>` + F.text(306, 263, "3", { cls: "f-title f-small f-on-dark" }) +
    // oznake levo
    F.text(138, 27, "Boja (traka)", { cls: "f-small", anchor: "end" }) + leader(140, 23, 160, 23) +
    F.text(138, 48, ["Pitch -", "broj krugova"], { cls: "f-small f-title", anchor: "end", lh: 15 }) + leader(140, 46, 163, 44) +
    F.text(138, 200, "Tekst i ključne reči", { cls: "f-small", anchor: "end" }) + leader(140, 196, 158, 196) +
    F.text(138, 250, "Tip - podtip", { cls: "f-small", anchor: "end" }) + leader(140, 246, 168, 246) +
    F.text(138, 270, "Power (napad)", { cls: "f-small f-title", anchor: "end" }) + leader(140, 266, 164, 262) +
    // oznake desno
    F.text(342, 48, "Cena (resursi)", { cls: "f-small f-title", anchor: "start" }) + leader(340, 44, 320, 44) +
    F.text(342, 270, "Defense (odbrana)", { cls: "f-small f-title", anchor: "start" }) + leader(340, 266, 316, 262),
  { caption: "Raspored prema Comprehensive Rules: pitch gore levo, cena gore desno, power dole levo, defense dole desno. Hero karta umesto toga ima intellect (dole levo) i life (dole desno)." }
);

// Raspored igrača
const zone = (x, y, w, h, t, sub, cls) => F.box(x, y, w, h, t, { sub, cls: cls || "f-box", titleCls: "f-title f-small" });
const FIG_FAB_TABLE = F.figure(
  600, 300,
  F.rect(10, 10, 580, 70, { cls: "f-acc" }) +
    F.text(300, 40, "Combat chain", { cls: "f-title" }) +
    F.text(300, 60, "napadi i odbrane ovog poteza, chain link po chain link", { cls: "f-muted" }) +
    zone(10, 96, 90, 60, "Weapon", "oružje") +
    zone(110, 96, 90, 60, "Head", "oprema") +
    zone(210, 96, 180, 130, "Hero", ["life · intellect", "sposobnost heroja"], "f-card") +
    zone(400, 96, 90, 60, "Arms", "oprema") +
    zone(500, 96, 90, 60, "Weapon", "oružje") +
    zone(110, 166, 90, 60, "Chest", "oprema") +
    zone(400, 166, 90, 60, "Legs", "oprema") +
    zone(10, 166, 90, 60, "Arsenal", "1 karta") +
    zone(500, 166, 90, 60, "Pitch", "plaćeno") +
    zone(10, 236, 180, 56, "Deck", "špil") +
    zone(210, 236, 180, 56, "Graveyard", "groblje") +
    zone(410, 236, 180, 56, "Banished", "izbačeno"),
  { caption: "Tvoja strana stola (šematski). Oružje i oprema počinju u igri; arsenal čuva jednu kartu za kasnije." }
);

// Potez
const FIG_FAB_TURN = F.figure(
  480, 286,
  F.box(10, 10, 460, 52, "Start Phase", { sub: "efekti „na početku poteza“" }) +
    F.arrow(240, 62, 240, 80) +
    F.box(10, 82, 460, 92, "Action Phase", {
      cls: "f-acc",
      sub: ["imaš 1 action point; action karta troši 1 AP + cenu", "Go again vraća 1 AP · instant-i kad god imaš priority", "napad otvara combat chain"]
    }) +
    F.arrow(240, 174, 240, 192) +
    F.box(10, 194, 460, 82, "End Phase", {
      sub: ["1 karta u arsenal (ako je prazan) · pitch zona na dno špila", "untap · izgubi AP i resurse · vuci do intellect-a"]
    }),
  { caption: "Jedan potez. Zatim je na potezu sledeći igrač." }
);

// Combat chain koraci
const cStep = (x, n, t, sub, acc) =>
  F.box(x, 14, 80, 84, `${n}. ${t}`, { sub, cls: acc ? "f-acc" : "f-box", titleCls: "f-title f-tiny" });
const FIG_FAB_COMBAT = F.figure(
  580, 168,
  cStep(4, 1, "Layer", ["napad na", "stack-u"]) +
    cStep(86, 2, "Attack", ["napad na", "chain"]) +
    cStep(168, 3, "Defend", ["branilac", "bira karte"], true) +
    cStep(250, 4, "Reaction", ["reakcije", "obe strane"]) +
    cStep(332, 5, "Damage", ["power −", "defense"], true) +
    cStep(414, 6, "Resolution", ["Go again →", "novi napad?"]) +
    cStep(496, 7, "Close", ["chain se", "zatvara"]) +
    F.arrow(84, 56, 85, 56) + F.arrow(166, 56, 167, 56) + F.arrow(248, 56, 249, 56) + F.arrow(330, 56, 331, 56) + F.arrow(412, 56, 413, 56) + F.arrow(494, 56, 495, 56) +
    `<path d="M454,98 C454,140 44,140 44,100" class="f-line dashed"/>` +
    F.text(250, 158, "sa Go again: novi napad = novi chain link", { cls: "f-muted" }),
  { caption: "Koraci jednog chain link-a. Kad nema više napada, combat chain se zatvara." }
);

// Pitch primer
const pcard = (x, cls, n) =>
  F.rect(x, 30, 64, 88, { cls: "f-card", r: 6 }) + F.rect(x + 5, 35, 54, 8, { cls, r: 2 }) +
  Array.from({ length: n }, (_, i) => pitchDot(x + 14 + i * 16, 58)).join("") +
  F.text(x + 32, 102, `pitch ${n}`, { cls: "f-small f-title" });
const FIG_FAB_PITCH = F.figure(
  520, 160,
  pcard(10, "f-strip-red", 1) + pcard(88, "f-strip-yellow", 2) + pcard(166, "f-strip-blue", 3) +
    F.text(120, 140, "crvena = 1 · žuta = 2 · plava = 3 resursa", { cls: "f-muted" }) +
    F.arrow(244, 74, 284, 74, { accent: true }) +
    F.box(290, 24, 220, 100, "Karta cene 3", { cls: "f-acc", sub: ["plati: 1 plava (3)", "ili: crvena (1) + žuta (2)", "višak resursa ostaje do kraja poteza"] }),
  { caption: "Pitch: karte iz ruke „baciš“ u pitch zonu da bi platio. Na kraju poteza idu na dno špila." }
);

// ─────────────────────────────── IGRA ───────────────────────────────

registerGame({
  id: "flesh-and-blood",
  title: "Flesh and Blood",
  subtitle: "Trading card game - dvoboj heroja",
  publisher: "Legend Story Studios",
  players: "2 (postoje i multiplayer formati)",
  category: "Kartaška igra (TCG)",
  accent: "#c94a3a",
  cover: "images/flesh-and-blood.jpg",
  wishlist: true,              // korisnik je još nema
  owned: "Osnovna igra",
  rulesVersion: "Comprehensive Rules 2.15.0 (29. 9. 2026)",
  summary:
    "Dva heroja se bore do smrti. Svaki igrač počinje sa herojem, oružjem i opremom u igri. Iste karte iz ruke služe za napad, za odbranu i kao resurs za plaćanje - a svaki potez kreće iz pune ruke, pa je svaka odluka „napad ili odbrana“ ključna. Pobeđuje ko prvi spusti protivnikovog heroja na 0 life.",

  // ─────────────────────────────── BRZI PODSETNIK ───────────────────────────────
  quickRef: [
    {
      title: "Cilj",
      html: `<p>Spusti <b>life</b> protivničkog heroja na <b>0</b>. Ako oba padnu istovremeno - nerešeno.</p>`
    },
    {
      title: "Priprema",
      html: `
        <ol>
          <li>Hero u svoju hero zonu.</li>
          <li>Nasumično izabrani igrač bira ko igra prvi.</li>
          <li>Izaberi oružje i opremu (do 1 po zoni: head, chest, arms, legs, weapon), licem nadole, pa ih svi otkriju.</li>
          <li>Promešaj špil; protivnik ga može promešati/preseći.</li>
          <li>Vuci do <b class="kw">intellect</b>-a svog heroja.</li>
        </ol>`
    },
    {
      title: "Potez",
      html: `
        <ol>
          <li><b>Start Phase</b> - efekti na početku poteza.</li>
          <li><b>Action Phase</b> - imaš <b>1 action point</b>. Action karta košta 1 AP + cenu. <b class="kw">Go again</b> vraća 1 AP. Instant-i bilo kad uz priority.</li>
          <li><b>End Phase</b> - možeš staviti 1 kartu u prazan <b class="kw">arsenal</b>; pitch zona na dno špila; untap; izgubi AP i resurse; vuci do intellect-a.</li>
        </ol>`
    },
    {
      title: "Pitch (plaćanje)",
      html: `
        <ul>
          <li>Cena (gore desno) plaća se resursima. Resurse dobijaš kad <b class="kw">pitch</b>-uješ kartu iz ruke: crvena 1, žuta 2, plava 3.</li>
          <li>Pitch-uješ samo dok ne platiš; višak ostaje do kraja poteza.</li>
          <li>Pitch-ovane karte idu na dno špila na kraju poteza.</li>
        </ul>`
    },
    {
      title: "Combat chain",
      html: `
        <ol>
          <li><b>Layer</b> - napad na stack-u.</li>
          <li><b>Attack</b> - napad postaje chain link.</li>
          <li><b>Defend</b> - branilac bira karte iz ruke i opremu (defense).</li>
          <li><b>Reaction</b> - attack reaction (napadač), defense reaction (branilac).</li>
          <li><b>Damage</b> - šteta = power − ukupna defense (ako je veća).</li>
          <li><b>Resolution</b> - Go again → +1 AP, možeš novi napad.</li>
          <li><b>Close</b> - kad nema novih napada.</li>
        </ol>`
    },
    {
      title: "Tipovi karata",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Action</td><td>1 AP, kad je stack prazan i nema borbe</td></tr>
          <tr><td class="kw">Attack Reaction</td><td>napadač, u Reaction koraku</td></tr>
          <tr><td class="kw">Defense Reaction</td><td>branilac, u Reaction koraku; postaje odbrana</td></tr>
          <tr><td class="kw">Instant</td><td>bilo kad dok imaš priority</td></tr>
          <tr><td class="kw">Equipment</td><td>počinje u igri; može da brani</td></tr>
          <tr><td class="kw">Weapon</td><td>počinje u igri; napada aktivacijom</td></tr>
        </table>`
    },
    {
      title: "Česte ključne reči",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Go again</td><td>+1 action point po razrešenju</td></tr>
          <tr><td class="kw">Dominate</td><td>najviše 1 karta iz ruke u odbrani</td></tr>
          <tr><td class="kw">Blade Break</td><td>uništi se posle odbrane</td></tr>
          <tr><td class="kw">Battleworn</td><td>−1 defense posle odbrane</td></tr>
          <tr><td class="kw">Temper</td><td>−1 defense posle odbrane; na 0 se uništi</td></tr>
          <tr><td class="kw">Arcane Barrier N</td><td>plati N da spreči N arcane štete</td></tr>
        </table>`
    }
  ],

  // ─────────────────────────────── PUNA PRAVILA ───────────────────────────────
  rules: [
    {
      id: "fab-pregled",
      title: "Pregled igre",
      html: `
        <p>Flesh and Blood je kartaška igra u kojoj se dva heroja bore do smrti. Svaki igrač počinje sa svojim herojem, oružjem i opremom u igri. Borba se vodi pametnim korišćenjem resursa i procenom kada se braniti, a kada krenuti na ubijanje.</p>
        <ul>
          <li><b>Ista karta, tri uloge:</b> kartu iz ruke možeš <b>odigrati</b>, <b>braniti se</b> njome ili je <b>pitch-ovati</b> kao resurs za plaćanje druge karte.</li>
          <li><b>Puna ruka svakog poteza:</b> na kraju svog poteza vučeš do intellect-a heroja, pa svaki potez kreće „sveže“.</li>
          <li><b>Pobeda:</b> protivnikov heroj na 0 life.</li>
        </ul>
        <div class="note"><b>Zlatno pravilo:</b> ako efekat karte direktno protivreči pravilima, važi efekat.</div>`
    },
    {
      id: "fab-karte",
      title: "Karte i zone",
      html: `
        ${FIG_FAB_CARD}
        <h4>Vrednosti na karti</h4>
        <table>
          <tr><th>Vrednost</th><th>Gde</th><th>Značenje</th></tr>
          <tr><td><b class="kw">Pitch</b></td><td>gore levo (1–3 kruga)</td><td>Koliko resursa daje kad je pitch-uješ. Obično prati boju trake: crvena 1, žuta 2, plava 3.</td></tr>
          <tr><td><b>Cena</b></td><td>gore desno</td><td>Koliko resursa košta igranje.</td></tr>
          <tr><td><b class="kw">Power</b></td><td>dole levo</td><td>Snaga napada.</td></tr>
          <tr><td><b class="kw">Defense</b></td><td>dole desno</td><td>Koliko štete blokira kad se brani.</td></tr>
          <tr><td><b class="kw">Intellect</b> / <b class="kw">Life</b></td><td>na heroju, dole levo / desno</td><td>Do koliko karata vučeš / početni život.</td></tr>
        </table>
        <p>Ista karta često postoji u tri boje (crvena/žuta/plava): crvena je obično najjača, ali daje najmanje resursa kao pitch.</p>
        <h4>Zone</h4>
        ${FIG_FAB_TABLE}
        <ul>
          <li><b>Hero</b> - tvoj heroj sa life i intellect vrednošću i sposobnošću.</li>
          <li><b>Weapon</b> (2 zone), <b>head, chest, arms, legs</b> - oružje i oprema; počinju u igri.</li>
          <li><b class="kw">Arsenal</b> - najviše 1 karta licem nadole, sačuvana za kasnije; možeš je odigrati kao da je u ruci.</li>
          <li><b>Deck</b> (špil), <b>Graveyard</b> (groblje), <b>Banished</b> (izbačene karte), <b>Pitch</b> zona (karte kojima je plaćeno ovog poteza).</li>
          <li><b class="kw">Combat chain</b> - zajednička zona u kojoj se razrešavaju napadi.</li>
        </ul>`
    },
    {
      id: "fab-priprema",
      title: "Priprema igre",
      html: `
        <ol>
          <li>Svaki igrač stavlja <b>heroja</b> licem nagore u svoju hero zonu.</li>
          <li><b>Prvi igrač:</b> nasumično se izabere jedan igrač, koji odlučuje ko igra prvi. (U sledećim partijama meča bira onaj ko je izgubio prethodnu.)</li>
          <li>Svako tajno bira <b>oružje i opremu</b> sa kojima počinje - najviše po jednu kartu za head, chest, arms, legs i weapon zone - i stavlja ih licem nadole.</li>
          <li>Redom, počev od prvog igrača, svi <b>otkrivaju i opremaju</b> izabrane karte. Posle toga se ne menjaju.</li>
          <li>Svako bira karte za <b>špil</b>; ostatak card-pool-a je inventar (ostaje sa strane).</li>
          <li>Promešaj špil i daj protivniku da ga promeša i/ili preseče.</li>
          <li>Razreše se efekti „na početku igre“.</li>
          <li>Svako <b>vuče do intellect-a</b> svog heroja. Prvi igrač počinje svoj prvi potez.</li>
        </ol>`
    },
    {
      id: "fab-potez",
      title: "Potez",
      html: `
        ${FIG_FAB_TURN}
        <h4>Start Phase</h4>
        <p>Počinje potez; razreše se efekti „na početku poteza“. Niko nema priority u ovoj fazi.</p>
        <h4>Action Phase</h4>
        <ul>
          <li>Igrač na potezu dobija <b>1 action point (AP)</b> i priority.</li>
          <li><b>Action</b> karte i action sposobnosti koštaju <b>1 AP</b> (plus cenu u resursima) i mogu se igrati samo kad je stack prazan i nije u toku borba (osim u Resolution koraku borbe).</li>
          <li><b class="kw">Go again</b> vraća 1 AP kad se karta razreši - tako se nizaju akcije i napadi.</li>
          <li><b>Instant</b>-i mogu bilo kad dok imaš priority i ne troše AP.</li>
          <li>Faza se završava kad je stack prazan, combat chain zatvoren i oba igrača passuju zaredom.</li>
        </ul>
        <h4>End Phase</h4>
        <ol>
          <li>Efekti „na početku end phase“.</li>
          <li>Igrač na potezu <b>može staviti 1 kartu iz ruke licem nadole u prazan arsenal</b>.</li>
          <li>Svi stavljaju karte iz svoje <b>pitch zone na dno špila</b>, redosledom po izboru (redosled je tajan).</li>
          <li>Igrač na potezu <b>untap</b>-uje svoje permanente (npr. oružje).</li>
          <li>Svi gube sve preostale <b>action point-e i resurse</b>.</li>
          <li>Igrač na potezu <b>vuče do intellect-a</b>. U <b>prvom potezu igre</b> do intellect-a vuku i ostali igrači.</li>
        </ol>
        <p>Zatim je na potezu sledeći igrač (u smeru kazaljke).</p>`
    },
    {
      id: "fab-pitch",
      title: "Resursi i pitch",
      html: `
        ${FIG_FAB_PITCH}
        <ul>
          <li>Da platiš cenu, potrebni su ti <b>resource point</b>-i. Ako ih nemaš dovoljno, <b>pitch</b>-uješ karte iz ruke jednu po jednu: karta ide u pitch zonu i daje resursa koliko ima krugova.</li>
          <li>Smeš pitch-ovati samo dok ti trebaju resursi za trenutnu cenu (ne „na zalihu“).</li>
          <li>Ako platiš više nego što treba, <b>višak ostaje</b> u tvom resource pool-u i može se iskoristiti za sledeću kartu - ali se gubi na kraju poteza.</li>
          <li>Na kraju poteza pitch-ovane karte idu na <b>dno špila</b> - špil se ne troši tako brzo.</li>
          <li>Neki efekti daju <b>chi</b> (posebni resurs nekih klasa); on se troši pre običnih resursa.</li>
        </ul>
        <div class="example"><b>Primer iz pravila:</b> imaš 1 resurs i igraš kartu cene 3. Pitch-uješ plavu kartu (3) - plaćeno je, ostaje ti 1 resurs. Da si pitch-ovao crvenu (1), morao bi da nastaviš da pitch-uješ.</div>`
    },
    {
      id: "fab-borba",
      title: "Borba - combat chain",
      html: `
        ${FIG_FAB_COMBAT}
        <p>Kad odigraš napad (attack karta ili napad oružjem), <b>combat chain se otvara</b>. Dok je otvoren, ne mogu se igrati obične action karte - osim napada u Resolution koraku. Instant-i i reakcije mogu po pravilima.</p>
        <table>
          <tr><th>Korak</th><th>Šta se dešava</th></tr>
          <tr><td><b>1. Layer</b></td><td>Napad je na stack-u; igrači mogu odgovarati instant-ima. Kad svi passuju, napad ide dalje.</td></tr>
          <tr><td><b>2. Attack</b></td><td>Napad postaje novi <b>chain link</b> i „napada“. Okidaju se efekti „kad napada“.</td></tr>
          <tr><td><b>3. Defend</b></td><td>Napadnuti igrač bira bilo koliko karata iz ruke (ne defense reaction) i/ili opreme sa <b>defense</b> vrednošću. One postaju odbrana - nisu „odigrane“, ne plaćaju se i ne razrešava im se tekst.</td></tr>
          <tr><td><b>4. Reaction</b></td><td>Napadač može igrati <b class="kw">attack reaction</b>, a branilac <b class="kw">defense reaction</b> karte (koje postaju dodatna odbrana).</td></tr>
          <tr><td><b>5. Damage</b></td><td>Ako je power napada veći od ukupne defense, branilac prima razliku kao štetu - napad je „<b>pogodio</b>“ (hit).</td></tr>
          <tr><td><b>6. Resolution</b></td><td>Ako napad ima <b class="kw">go again</b>, napadač dobija 1 AP. Napadač sada može odigrati novi napad - on postaje sledeći chain link.</td></tr>
          <tr><td><b>7. Close</b></td><td>Kad nema novih napada, chain se zatvara: oprema se vraća u svoje zone, a ostale karte sa chain-a (napadi i odbrane iz ruke) idu na groblje.</td></tr>
        </table>
        <div class="example"><b>Primer iz pravila:</b> napad ima power 6, a branilac se brani sa dve karte, defense 3 i 2 (ukupno 5). Napad pogađa za 6 − 5 = <b>1</b> štete.</div>
        <div class="note">Odbrana iz ruke je skupa: svaka karta kojom se braniš je karta koju nećeš imati za svoj potez. Zato se ponekad isplati primiti malo štete.</div>`
    },
    {
      id: "fab-tipovi",
      title: "Tipovi karata",
      html: `
        <table>
          <tr><th>Tip</th><th>Pravila</th></tr>
          <tr><td><b class="kw">Hero</b></td><td>Tvoj heroj: life, intellect i sposobnost. Nije deo špila.</td></tr>
          <tr><td><b class="kw">Weapon</b></td><td>Počinje u weapon zoni. (1H) zauzima jednu, (2H) obe weapon zone. Napada aktiviranjem sposobnosti.</td></tr>
          <tr><td><b class="kw">Equipment</b></td><td>Počinje u head/chest/arms/legs zoni. Može da se brani (defense) i često ima sposobnosti.</td></tr>
          <tr><td><b class="kw">Action</b></td><td>Košta 1 AP; samo kad je stack prazan i nema borbe. Podtip <i>Attack</i> = napad; <i>Aura</i>, <i>Item</i> ostaju u igri.</td></tr>
          <tr><td><b class="kw">Attack Reaction</b></td><td>Igra je napadač u Reaction koraku.</td></tr>
          <tr><td><b class="kw">Defense Reaction</b></td><td>Igra je branilac u Reaction koraku; kad se razreši, postaje odbrana.</td></tr>
          <tr><td><b class="kw">Instant</b></td><td>Bilo kad dok imaš priority.</td></tr>
          <tr><td><b class="kw">Resource</b></td><td>Ne igra se - samo za pitch.</td></tr>
          <tr><td><b class="kw">Block</b></td><td>Ne igra se - samo za odbranu (ili pitch, ako ima pitch).</td></tr>
          <tr><td><b class="kw">Token</b></td><td>Postoji samo u areni; kad je napusti, nestaje iz igre.</td></tr>
          <tr><td><b class="kw">Ally</b></td><td>Saveznik sa sopstvenim life-om; može da napada i bude napadnut. Life mu se vraća na kraju poteza.</td></tr>
        </table>`
    },
    {
      id: "fab-formati",
      title: "Formati i pravljenje špila",
      html: `
        <table>
          <tr><th>Format</th><th>Heroj</th><th>Card-pool</th><th>Špil</th><th>Kopije</th></tr>
          <tr><td><b>Classic Constructed</b></td><td>odrasli (adult)</td><td>najviše 80 karata (oprema + špil)</td><td>najmanje 60</td><td>do 3</td></tr>
          <tr><td><b>Living Legend</b></td><td>odrasli, i Living Legend heroji</td><td>najviše 80</td><td>najmanje 60</td><td>do 3</td></tr>
          <tr><td><b>Silver Age</b></td><td>young</td><td>najviše 55</td><td>tačno 40</td><td>do 2; samo common i rare</td></tr>
          <tr><td><b>Blitz</b></td><td>young</td><td>najviše 52</td><td>tačno 40</td><td>do 1</td></tr>
        </table>
        <ul>
          <li><b class="kw">Specialization</b>: karta sme u špil samo uz navedenog heroja.</li>
          <li><b class="kw">Legendary</b>: najviše 1 primerak u špilu.</li>
          <li>Karte moraju odgovarati klasi i talentu heroja (ili biti <i>Generic</i>).</li>
        </ul>
        <p class="muted small">Formati su iz zvaničnih Tournament Rules; mogu se menjati - za turnir proveri aktuelna pravila.</p>`
    },
    {
      id: "fab-saveti",
      title: "Saveti za početnike",
      html: `
        <ul>
          <li><b>Planiraj ruku:</b> pre poteza podeli karte na „napad“, „pitch“ i „odbrana za protivnikov potez“.</li>
          <li><b>Plave karte su gorivo:</b> često ih pitch-uješ, a crvene igraš.</li>
          <li><b>Go again lanci:</b> karte sa go again omogućavaju više napada u jednom potezu.</li>
          <li><b>Arsenal:</b> karta koju ne iskoristiš ide u arsenal - biće ti na raspolaganju sledećeg poteza.</li>
          <li><b>Oprema brani besplatno</b> - ali Blade Break / Battleworn / Temper je troše.</li>
          <li><b>Ne brani se previše:</b> svaka karta iz ruke potrošena na odbranu slabi tvoj sledeći potez.</li>
        </ul>
        <p class="muted small">Ovo poglavlje su saveti, nisu deo zvaničnih pravila.</p>`
    }
  ],

  // ─────────────────────────────── KLJUČNE REČI ───────────────────────────────
  glossary: [
    { term: "Action point (AP)", group: "Osnovno", def: "Imaš 1 na početku action faze; action karte i sposobnosti troše po 1." },
    { term: "Pitch", group: "Osnovno", def: "Stavljanje karte iz ruke u pitch zonu da bi dobio resurse (1–3)." },
    { term: "Resource point", group: "Osnovno", def: "Valuta za cene karata; višak se gubi na kraju poteza." },
    { term: "Intellect", group: "Osnovno", def: "Do koliko karata vučeš na kraju svog poteza." },
    { term: "Life", group: "Osnovno", def: "Život heroja; na 0 gubiš." },
    { term: "Power", group: "Osnovno", def: "Snaga napada (dole levo)." },
    { term: "Defense", group: "Osnovno", def: "Koliko štete karta blokira u odbrani (dole desno)." },
    { term: "Arsenal", group: "Osnovno", def: "Zona za 1 kartu licem nadole; puni se na kraju tvog poteza." },
    { term: "Combat chain", group: "Osnovno", def: "Zona u kojoj se razrešavaju napadi; svaki napad je jedan chain link." },
    { term: "Hit", group: "Osnovno", def: "Napad je pogodio ako je naneo štetu heroju kroz korak Damage." },
    { term: "Go again", group: "Ability keywords", def: "Kad se razreši (kod napada: u Resolution koraku), dobijaš 1 action point." },
    { term: "Dominate", group: "Ability keywords", def: "Napad ne može braniti više od jedne karte iz ruke." },
    { term: "Blade Break", group: "Ability keywords", def: "Kad se combat chain zatvori, ako je branila - uništi se." },
    { term: "Battleworn", group: "Ability keywords", def: "Kad se chain zatvori, ako je branila - dobija −1 defense brojač." },
    { term: "Temper", group: "Ability keywords", def: "Kao Battleworn, ali na 0 defense se uništava." },
    { term: "Arcane Barrier N", group: "Ability keywords", def: "Kad bi primio arcane štetu, možeš platiti N resursa da sprečiš N te štete." },
    { term: "Spellvoid N", group: "Ability keywords", def: "Možeš uništiti ovu kartu da sprečiš N arcane štete." },
    { term: "Boost", group: "Ability keywords", def: "Mechanologist: dodatna cena - izbaci gornju kartu špila; ako je Mechanologist, karta dobija go again." },
    { term: "Specialization", group: "Ability keywords", def: "Karta sme u špil samo uz navedenog heroja." },
    { term: "Legendary", group: "Ability keywords", def: "Najviše 1 primerak u špilu." },
    { term: "Attack Reaction", group: "Tipovi", def: "Igra napadač u Reaction koraku borbe." },
    { term: "Defense Reaction", group: "Tipovi", def: "Igra branilac u Reaction koraku; postaje odbrana." },
    { term: "Instant", group: "Tipovi", def: "Bilo kad dok imaš priority, bez AP." },
    { term: "(1H) / (2H)", group: "Tipovi", def: "Oružje za jednu ili obe weapon zone." },
    { term: "Aura / Item", group: "Tipovi", def: "Kad se razreše, ostaju u areni kao permanent." }
  ],

  expansions: [],

  sources: [
    { label: "Comprehensive Rules 2.15.0 (PDF)", url: "https://rules.fabtcg.com/pdf/en-fab-cr.pdf" },
    { label: "Tournament Rules - konstruisani formati", url: "https://rules.fabtcg.com/en/trp/07-constructed-formats/" },
    { label: "Zvanični sajt (fabtcg.com)", url: "https://fabtcg.com/rules-and-policy-center/comprehensive-rules/" }
  ]
});
})();
