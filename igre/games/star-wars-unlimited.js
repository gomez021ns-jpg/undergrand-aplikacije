(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Raspored stola
// Arene su zajedničke: kopnena je sa iste strane za oba igrača, pa se protivnik ne preslikava levo-desno.
const swuSide = (y, mirrored, dim) => {
  const box = (x, yy, w, h, t, sub, cls) => F.box(x, yy, w, h, t, { sub, cls, titleCls: "f-title f-small" });
  const top = mirrored ? y + 64 : y;      // red sa bazom
  const bottom = mirrored ? y : y + 94;   // red sa resursima/špilom
  return `<g class="${dim ? "f-dim" : ""}">` +
    box(10, top, 170, 84, "Ground arena", "kopnene jedinice", "f-acc") +
    box(220, mirrored ? top + 40 : top, 160, 44, "Base", "30 HP (starter)", "f-card") +
    box(240, mirrored ? top : top + 50, 120, 34, "Leader", null, "f-box") +
    box(420, top, 170, 84, "Space arena", "svemirske jedinice", "f-acc") +
    box(10, bottom, 250, 50, "Resursi", "karte licem nadole", "f-box") +
    box(280, bottom, 90, 50, "Špil", null, "f-box") +
    box(380, bottom, 90, 50, "Discard", null, "f-box") +
    `</g>`;
};
const FIG_SWU_TABLE = F.figure(
  600, 356,
  F.text(10, 12, "PROTIVNIK", { cls: "f-label", anchor: "start" }) +
    swuSide(18, true, true) +
    `<line x1="10" y1="176" x2="590" y2="176" class="f-divider"/>` +
    swuSide(188, false, false) +
    F.text(10, 350, "TI", { cls: "f-label", anchor: "start" }),
  { caption: "Arene su zajedničke: kopnena je sa jedne strane baza, svemirska sa druge - za oba igrača. Kopnene jedinice napadaju samo kopnene, svemirske samo svemirske, a obe mogu da napadnu bazu." }
);

// Runda
const FIG_SWU_ROUND = F.figure(
  480, 268,
  F.box(10, 10, 460, 104, "Action Phase - igrači naizmenično po 1 akciju", {
    cls: "f-acc",
    sub: ["prvi igra onaj ko ima initiative counter", "akcije: igraj kartu · napadni jedinicom · action sposobnost", "take the initiative · pass", "kraj: kad oba igrača passuju jedan za drugim"]
  }) +
    F.arrow(240, 114, 240, 136) +
    F.box(10, 138, 460, 76, "Regroup Phase", { sub: ["1. vuci 2 karte  ·  2. možeš staviti 1 kartu kao resurs", "3. ready sve svoje karte (jedinice, resurse, leader-a)"] }) +
    F.arrow(240, 214, 240, 234) +
    F.text(240, 254, "nova runda", { cls: "f-muted" }),
  { caption: "Jedna runda. Igra se dok baza nekog igrača ne padne na 0 HP." }
);

// Napad
const aStep = (x, n, t, sub, acc) =>
  F.box(x, 14, 106, 92, `${n}. ${t}`, { sub, cls: acc ? "f-acc" : "f-box", titleCls: "f-title f-small" });
const FIG_SWU_ATTACK = F.figure(
  560, 150,
  aStep(4, 1, "Exhaust", ["izaberi metu", "(Sentinel!)"], true) +
    aStep(116, 2, "Saboteur", ["uništi Shield", "branioca"]) +
    aStep(228, 3, "Restore", ["izleči svoju", "bazu"]) +
    aStep(340, 4, "On Attack", ["sposobnosti", "napadača"]) +
    aStep(452, 5, "Šteta", ["istovremeno,", "power ↔ power"], true) +
    F.arrow(110, 60, 114, 60) + F.arrow(222, 60, 226, 60) + F.arrow(334, 60, 338, 60) + F.arrow(446, 60, 450, 60) +
    F.text(280, 136, "Napad na bazu: samo napadač nanosi štetu. Napad na jedinicu: obe strane istovremeno.", { cls: "f-muted" }),
  { caption: "Koraci napada. Koraci 2–4 važe samo ako napadač ima te sposobnosti." }
);

// Aspekti
const aspect = (x, name, color) =>
  `<circle cx="${x}" cy="40" r="18" style="fill:${color}"/>` + F.text(x, 78, name, { cls: "f-small f-title" });
const FIG_SWU_ASPECTS = F.figure(
  520, 96,
  aspect(45, "Vigilance", "#3f78c9") + aspect(131, "Command", "#3f9a4f") + aspect(217, "Aggression", "#c43d3d") +
    aspect(303, "Cunning", "#d9b02f") + aspect(389, "Heroism", "#e8e4d8") + aspect(475, "Villainy", "#2b2b2b"),
  { caption: "Šest aspekata. Boje su okvirne - gledaj ikone na kartama." }
);

// ─────────────────────────────── IGRA ───────────────────────────────

registerGame({
  id: "star-wars-unlimited",
  title: "Star Wars: Unlimited",
  subtitle: "Trading card game - Star Wars kartaški dvoboj",
  publisher: "Fantasy Flight Games",
  players: "2; 3+ u Twin Suns formatu",
  category: "Kartaška igra (TCG)",
  accent: "#3a9bb0",
  cover: "images/star-wars-unlimited.jpg",
  owned: "Shadows of the Galaxy starter (stiže)",
  rulesVersion: "Quickstart (Spark of Rebellion) + Comprehensive Rules 8.0",
  summary:
    "Svaki igrač vodi jednog Star Wars junaka ili zlikovca (leader) i špil od 50 karata. Jedinice se bore u dve arene - na zemlji i u svemiru - a cilj je srušiti protivničku bazu na 0 HP. Igrači naizmenično povlače po jednu akciju, pa je svaka odluka bitna.",

  // ─────────────────────────────── BRZI PODSETNIK ───────────────────────────────
  quickRef: [
    {
      title: "Cilj",
      html: `
        <p>Spusti protivničku <b>bazu na 0 HP</b> (starter baze imaju 30 HP). Ako obe padnu istovremeno - nerešeno.</p>`
    },
    {
      title: "Priprema",
      html: `
        <ol>
          <li>Baza u igru; leader ispod nje, <b>horizontalnom</b> (ne-unit) stranom nagore.</li>
          <li>Nasumično izabrani igrač odlučuje ko počinje sa <b class="kw">Initiative</b> counter-om.</li>
          <li>Promešaj špil, vuci <b>6</b>. <b>Mulligan</b> jednom: celu ruku u špil, novih 6 (prvo odlučuje igrač sa inicijativom).</li>
          <li>Stavi tačno <b>2 karte</b> iz ruke licem nadole kao <b>resurse</b>.</li>
        </ol>`
    },
    {
      title: "Action Phase",
      html: `
        <p>Naizmenično po <b>jedna akcija</b>, prvi je igrač sa inicijativom:</p>
        <ul>
          <li><b>Igraj kartu</b> - plati cenu exhaust-ovanjem resursa.</li>
          <li><b>Napadni</b> ready jedinicom.</li>
          <li><b>Action sposobnost</b> (npr. leader-ova).</li>
          <li><b class="kw">Take the Initiative</b> - jednom po rundi; posle toga passuješ do kraja faze.</li>
          <li><b>Pass</b> - kad oba igrača passuju zaredom, faza se završava.</li>
        </ul>`
    },
    {
      title: "Regroup Phase",
      html: `
        <ol>
          <li>Svako vuče <b>2 karte</b>.</li>
          <li>Svako <b>može</b> staviti 1 kartu iz ruke kao resurs (prvi igrač sa inicijativom).</li>
          <li><b>Ready</b> sve svoje karte.</li>
        </ol>
        <p>Prazan špil: umesto vučenja, <b>3 štete svojoj bazi</b> po karti.</p>`
    },
    {
      title: "Napad",
      html: `
        <ol>
          <li><b>Exhaust</b> napadača, izaberi protivničku jedinicu u <b>istoj areni</b> ili bazu. <b class="kw">Sentinel</b> mora biti meta!</li>
          <li><b class="kw">Saboteur</b>: uništi Shield-ove branioca.</li>
          <li><b class="kw">Restore</b>: izleči svoju bazu.</li>
          <li><b>On Attack</b> sposobnosti.</li>
          <li><b>Šteta:</b> baza prima power napadača; kod jedinica obe strane istovremeno. Šteta ≥ HP → poražena.</li>
        </ol>`
    },
    {
      title: "Karte",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Unit</td><td>ulazi exhausted u svoju arenu; ostaje dok ne padne</td></tr>
          <tr><td class="kw">Event</td><td>jednokratno, pa u discard</td></tr>
          <tr><td class="kw">Upgrade</td><td>kači se na jedinicu (+power/+HP); pada sa njom</td></tr>
          <tr><td class="kw">Leader</td><td>sposobnost od početka; Epic Action → deploy kao jedinica, ready</td></tr>
          <tr><td class="kw">Shield</td><td>token: spreči sledeću štetu, pa nestaje</td></tr>
          <tr><td class="kw">Experience</td><td>token: +1/+1</td></tr>
        </table>`
    },
    {
      title: "Ključne reči (Spark of Rebellion)",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Ambush</td><td>kad uđe: može odmah napasti neprijateljsku jedinicu</td></tr>
          <tr><td class="kw">Grit</td><td>+1 power za svaku štetu na sebi</td></tr>
          <tr><td class="kw">Overwhelm</td><td>višak štete na jedinici ide u bazu</td></tr>
          <tr><td class="kw">Raid X</td><td>+X power dok napada</td></tr>
          <tr><td class="kw">Restore X</td><td>kad napada: izleči X sa svoje baze</td></tr>
          <tr><td class="kw">Saboteur</td><td>ignoriše Sentinel, uništava Shield-ove</td></tr>
          <tr><td class="kw">Sentinel</td><td>u toj areni mora se napasti prvi</td></tr>
          <tr><td class="kw">Shielded</td><td>ulazi sa Shield tokenom</td></tr>
        </table>`
    },
    {
      title: "Aspekti i cena",
      html: `
        <p>Leader daje 2 ikone aspekta, baza 1. Za svaku ikonu na karti koju <b>nemaš</b> plaćaš <b>+2 resursa</b> (<b class="kw">aspect penalty</b>).</p>
        <p>Samo <b>1 kopija</b> iste unique karte u igri; višak odmah uništi.</p>`
    }
  ],

  // ─────────────────────────────── PUNA PRAVILA ───────────────────────────────
  rules: [
    {
      id: "swu-pregled",
      title: "Pregled igre",
      html: `
        <p>Svaki igrač preuzima ulogu <b class="kw">leader</b>-a - poznatog Star Wars lika - koji vodi svoje snage u bitku. Snage su predstavljene špilom od (najmanje) 50 karata: jedinice, eventi i upgrade-i.</p>
        <p>Igra se u <b>rundama</b>. U <b>action fazi</b> igrači naizmenično igraju karte i napadaju protivničku bazu i jedinice. U <b>regroup fazi</b> vuku karte, grade resurse i pripremaju jedinice za sledeću rundu. Leader na početku deluje pasivno, a kasnije ulazi u bitku kao moćna jedinica.</p>
        <p><b>Pobeda:</b> kad protivnička baza padne na <b>0 HP</b>, igra se odmah završava. Ako obe baze padnu istovremeno - nerešeno.</p>
        <div class="note"><b>Zlatno pravilo:</b> ako se tekst karte kosi sa pravilima, važi karta.</div>`
    },
    {
      id: "swu-sor",
      title: "Spark of Rebellion",
      html: `
        <p><b>Spark of Rebellion</b> (oznaka seta <i>SOR</i>) je prvi set igre, sa 252 karte. Uvodi osnovna pravila i ključne reči: Ambush, Grit, Overwhelm, Raid, Restore, Saboteur, Sentinel i Shielded.</p>
        <h4>Two-Player Starter (Luke vs Vader)</h4>
        <p>Najpoznatiji proizvod iz ovog seta i najbolji ulaz u igru:</p>
        <ul>
          <li>2 gotova špila od po 50 karata, plus leader, baza i token karte:
            <ul>
              <li><b>Luke Skywalker</b> - aspekti Vigilance, Cunning i Heroism;</li>
              <li><b>Darth Vader</b> - aspekti Aggression, Command i Villainy.</li>
            </ul>
          </li>
          <li>Ukupno 110 karata (10 ekskluzivnih, nema ih u booster-ima), 40 counter-a, quickstart pravila, 2 podloge i 2 kutijice za špil.</li>
        </ul>
        <p>Pri raspakivanju odvoji dvostrane leader, base i token karte od ostalih 50 (sa standardnim Star Wars: Unlimited leđima).</p>
        <p class="muted small">Ovaj starter nije u tvojoj kolekciji - tvoj starter (Shadows of the Galaxy) je opisan u kartici „Dodaci“. Ovo poglavlje je tu jer prvi set uvodi osnovna pravila.</p>`
    },
    {
      id: "swu-priprema",
      title: "Priprema igre",
      html: `
        <ol>
          <li><b>Baza</b> - stavi je na vrh sredine svog prostora, okrenutu ka protivnikovoj.</li>
          <li><b>Leader</b> - ispod baze, <b>horizontalnom</b> stranom (Leader, ne Leader Unit) nagore.</li>
          <li><b>Prvi igrač</b> - nasumično izaberite igrača; on odlučuje ko počinje sa <b class="kw">initiative counter</b>-om (on ili protivnik). Ostale counter-e i tokene sklonite sa strane.</li>
          <li><b>Početna ruka</b> - promešaj špil i vuci <b>6</b> karata.</li>
          <li><b>Mulligan</b> - možeš jednom vratiti celu ruku u špil, promešati i vući novih 6; novu ruku moraš zadržati. Prvo odlučuje igrač sa inicijativom.</li>
          <li><b>Resursi</b> - izaberi tačno <b>2 karte</b> iz ruke i stavi ih licem nadole (ready) kao resurse.</li>
        </ol>
        <p>Počinje prva action faza.</p>
        <div class="note"><b>Savet iz pravila:</b> uzmi mulligan ako u ruci nemaš nijednu jedinicu koja košta 1 ili 2 za prvu rundu.</div>
        ${FIG_SWU_TABLE}`
    },
    {
      id: "swu-runda",
      title: "Runda: Action i Regroup faza",
      html: `
        ${FIG_SWU_ROUND}
        <h4>Action faza</h4>
        <p>Igrači naizmenično preduzimaju po <b>jednu akciju</b>. Prvi je igrač sa initiative counter-om. Moguće akcije:</p>
        <table>
          <tr><th>Akcija</th><th>Opis</th></tr>
          <tr><td><b>Play a card</b></td><td>Otkrij kartu iz ruke i plati cenu exhaust-ovanjem toliko resursa.</td></tr>
          <tr><td><b>Attack with a unit</b></td><td>Napadni jednom ready jedinicom (vidi „Napad“).</td></tr>
          <tr><td><b>Use an action ability</b></td><td>Iskoristi „Action“ sposobnost karte, plaćajući njenu cenu.</td></tr>
          <tr><td><b class="kw">Take the initiative</b></td><td>Uzmi initiative counter (i ako ga već imaš) - igraćeš prvi sledeće runde. Samo jedan igrač po rundi. Posle toga do kraja faze automatski passuješ.</td></tr>
          <tr><td><b>Pass</b></td><td>Ne radiš ništa; kasnije u fazi i dalje smeš da igraš. Kad posle tvog pass-a protivnik passuje ili uzme inicijativu, faza se odmah završava.</td></tr>
        </table>
        <h4>Regroup faza</h4>
        <ol>
          <li><b>Vuci 2 karte.</b></li>
          <li><b>Resurs:</b> možeš staviti 1 kartu iz ruke licem nadole kao resurs (ulazi exhausted), ili ne. Prvi odlučuje igrač sa inicijativom.</li>
          <li><b>Ready:</b> ispravi sve svoje exhausted karte - jedinice, resurse i leader-a.</li>
        </ol>
        <div class="note"><b>Savet iz pravila:</b> stavljaj po jedan resurs svake runde dok ne budeš imao dovoljno za leader-ov Epic Action.</div>
        <h4>Ready i exhausted</h4>
        <ul>
          <li><b>Exhausted</b> = karta okrenuta bočno. Jedinice i resursi (osim 2 početna) ulaze exhausted.</li>
          <li>Resursi se exhaust-uju da plate cene; jedinice da napadnu ili koriste neke sposobnosti (ikona exhaust). Exhausted karta ne može ponovo da se exhaust-uje dok ne postane ready.</li>
        </ul>`
    },
    {
      id: "swu-karte",
      title: "Vrste karata",
      html: `
        <table>
          <tr><th>Vrsta</th><th>Pravila</th></tr>
          <tr><td><b class="kw">Unit</b></td><td>Ima <b>power</b> (šteta koju nanosi) i <b>HP</b>. Ulazi <b>exhausted</b> u svoju arenu (Ground ili Space, piše na vrhu karte) i ostaje dok ne bude poražena: šteta ≥ HP → u discard.</td></tr>
          <tr><td><b class="kw">Event</b></td><td>Odigraj, razreši tekst, stavi u discard.</td></tr>
          <tr><td><b class="kw">Upgrade</b></td><td>Kači se na jedinicu (podvuci ga delimično ispod nje). Daje +power, +HP i/ili sposobnosti. Kad jedinica napusti igru, upgrade se uništava.</td></tr>
          <tr><td><b class="kw">Base</b></td><td>Tvoja baza: HP, aspekt i ponekad sposobnost. Pada na 0 HP → gubiš. Ne može se izlečiti iznad početnog HP-a.</td></tr>
          <tr><td><b class="kw">Leader</b></td><td>Dvostrana karta - vidi „Leader“.</td></tr>
          <tr><td><b class="kw">Token</b></td><td>Stoje sa strane, ne mešaju se u špil. <b>Experience</b>: +1/+1. <b>Shield</b>: spreči bilo koliku štetu jednom, pa se uništi. Token koji napušta igru ide nazad sa strane.</td></tr>
        </table>
        <h4>Na karti</h4>
        <ul>
          <li><b>Cena</b> - gore levo; pored nje <b>ikone aspekata</b>.</li>
          <li><b>Ground/Space</b> - za jedinice, na vrhu karte.</li>
          <li><b>Ime</b> (i podnaslov), <b>traits</b> (npr. REBEL, IMPERIAL - nemaju sopstvena pravila, ali karte ih proveravaju).</li>
          <li><b>Unique</b> simbol pre imena: u igri možeš imati samo 1 kopiju; ako dobiješ drugu, odmah uništi jednu.</li>
          <li><b>Power</b> i <b>HP</b> - kod jedinica; kod upgrade-a su bonusi (+X).</li>
        </ul>
        <h4>Ground i Space</h4>
        <p>Borba je podeljena na dve arene. Kopnene jedinice idu u ground arenu, svemirske u space arenu. <b>Kopnene ne mogu napasti svemirske i obrnuto</b>, ali obe mogu napasti protivničku bazu.</p>
        <p><b>Friendly</b> = karte koje ti kontrolišeš; <b>enemy</b> = protivnikove.</p>`
    },
    {
      id: "swu-napad",
      title: "Napad",
      html: `
        <p>Napad je glavni način da se nanese šteta bazi. Jedinica mora biti <b>ready</b>, i u jednoj akciji napada samo jedna jedinica.</p>
        ${FIG_SWU_ATTACK}
        <ol>
          <li><b>Exhaust napadača i izaberi metu:</b> bilo koju protivničku jedinicu u <b>istoj areni</b> ili protivničku bazu.
            <ul>
              <li>Ako protivnička jedinica u toj areni ima <b class="kw">Sentinel</b>, moraš napasti nju (osim ako napadač ima <b class="kw">Saboteur</b>). Ako ih ima više, biraš među njima.</li>
              <li>Sposobnosti koje važe „dok napada“ (npr. <b class="kw">Raid</b>) počinju da deluju.</li>
            </ul>
          </li>
          <li><b>Saboteur:</b> uništi sve Shield tokene na braniocu.</li>
          <li><b>Restore:</b> izleči toliko štete sa svoje baze.</li>
          <li><b>On Attack</b> sposobnosti napadača.</li>
          <li><b>Šteta:</b>
            <ul>
              <li>na <b>bazu</b>: napadač nanosi štetu jednaku svojoj power; ne prima ništa nazad;</li>
              <li>na <b>jedinicu</b>: napadač i branilac <b>istovremeno</b> nanose štetu jednaku svojoj power. Ko ima štete ≥ HP, odmah je poražen.</li>
            </ul>
          </li>
        </ol>
        <div class="example"><b>Primer iz pravila:</b> Consular Security Force (3 power, 7 HP) napada Death Star Stormtrooper-a (3 power, 1 HP). Svako nanese 3 - Stormtrooper je poražen, a Consular ostaje sa 3 štete (još 4 HP). Da je napao bazu, naneo bi joj 3 i ne bi primio ništa.</div>`
    },
    {
      id: "swu-leader",
      title: "Leader",
      html: `
        <ul>
          <li>Leader počinje na <b>horizontalnoj (Leader)</b> strani sa sposobnošću dostupnom od početka igre (npr. Luke i Vader se exhaust-uju za svoju Action sposobnost).</li>
          <li>Ima i <b class="kw">Epic Action</b> za <b>deploy</b>, koji se otključava kad imaš dovoljno resursa (piše na karti; npr. Luke: 6 resursa). Epic Action ne košta resurse i može se koristiti bez obzira na to da li je leader ready ili exhausted.</li>
          <li><b>Deploy:</b> okreni ga na <b>Leader Unit</b> stranu, stavi u ground arenu i <b>ready</b>-uj - može da napadne iste runde.</li>
          <li>Kao jedinica napada, može biti napadnut i koristi sposobnosti sa unit strane.</li>
          <li>Kad bude poražen: okreni ga nazad na Leader stranu, vrati kod baze, <b>exhausted</b>. Epic Action se više ne može koristiti (pokrij ga <b>epic action counter</b>-om), ali ostala sposobnost i dalje radi.</li>
          <li>Epic Action se generalno može koristiti samo <b>jednom po igri</b>.</li>
        </ul>`
    },
    {
      id: "swu-sposobnosti",
      title: "Sposobnosti na kartama",
      html: `
        <table>
          <tr><th>Vrsta</th><th>Kako radi</th></tr>
          <tr><td><b>Action</b></td><td>Podebljano „Action“, često sa cenom u zagradama (resursi i/ili exhaust), pa dvotačka i efekat. Koristi se kao akcija. Bez plaćene cene - nema sposobnosti.</td></tr>
          <tr><td><b>Triggered</b></td><td>„When…“ ili „On…“ - razrešava se automatski posle okidača. Obavezno, osim ako piše „may“.</td></tr>
          <tr><td>• <b>On Attack</b></td><td>Posle izbora napadača, pre štete.</td></tr>
          <tr><td>• <b>When Defeated</b></td><td>Posle poraza; karta je već u discard-u.</td></tr>
          <tr><td>• <b>When Played</b></td><td>Posle igranja; karta je u igri.</td></tr>
          <tr><td><b>Keyword</b></td><td>Crven tekst - vidi „Ključne reči“.</td></tr>
          <tr><td><b>Constant</b></td><td>Bez posebnog stila; važi dok je karta u igri (i kad je exhausted).</td></tr>
          <tr><td><b>Event</b></td><td>Jednokratno kad se event odigra.</td></tr>
        </table>
        <h4>Prazan špil</h4>
        <p>Nastavljaš igru sa kartama koje imaš. Svaki put kad bi vukao iz praznog špila, umesto toga nanosiš <b>3 štete svojoj bazi</b> po karti (npr. u regroup fazi: 6 štete).</p>`
    },
    {
      id: "swu-spil",
      title: "Pravljenje špila i aspekti",
      html: `
        ${FIG_SWU_ASPECTS}
        <h4>Sastav špila (Premier)</h4>
        <ul>
          <li>Tačno <b>1 leader</b> i <b>1 baza</b>.</li>
          <li>Najmanje <b>50</b> drugih karata (jedinice, eventi, upgrade-i).</li>
          <li>Najviše <b>3 kopije</b> iste karte. Dozvoljen je sideboard do 10 karata.</li>
        </ul>
        <h4>Aspect penalty</h4>
        <p>Leader daje <b>2</b> ikone aspekta, baza <b>1</b> - ukupno 3. U špil smeš staviti karte bilo kog aspekta, ali za <b>svaku ikonu na karti koju tvoj leader i baza ne pokrivaju</b> plaćaš <b>2 resursa više</b>.</p>
        <div class="example"><b>Primer:</b> leader daje Vigilance i Heroism, baza daje Command.<br>
        • karta sa jednom od te tri ikone - bez doplate;<br>
        • karta sa Aggression - +2;<br>
        • karta sa dve Vigilance ikone - +2 (imaš samo jednu Vigilance);<br>
        • karta sa Aggression i Cunning - +4.</div>
        <p><b>Savet iz pravila:</b> oko 30–40 jedinica (mešano ground i space) i 10–20 evenata i upgrade-a, sa dosta karata cene 1–3 za rani deo igre.</p>
        <h4>Drugi formati (ukratko)</h4>
        <table>
          <tr><th>Format</th><th>Pravila</th></tr>
          <tr><td><b>Premier / Eternal</b></td><td>Kao gore. Premier: samo karte iz dve najnovije rotacije; Eternal: sve karte.</td></tr>
          <tr><td><b>Trilogy</b></td><td>Tri špila, meč na 2 dobijene; ograničenja važe za sva tri špila zajedno.</td></tr>
          <tr><td><b>Sealed / Draft</b></td><td>Špil od najmanje 30 karata iz otvorenih booster-a.</td></tr>
          <tr><td><b>Twin Suns</b></td><td>Za 3+ igrača: 2 leader-a po špilu, najmanje 80 karata, po 1 kopija svake karte. Ima posebna pravila (blast i plan counter).</td></tr>
        </table>`
    },
    {
      id: "swu-saveti",
      title: "Saveti za početnike",
      html: `
        <ul>
          <li><b>Kriva cene:</b> u prvim rundama igraj jeftine jedinice, da ne bi čekao prazan.</li>
          <li><b>Resursi vs karte:</b> svaka karta stavljena kao resurs je karta koju nećeš odigrati - ali bez resursa nema leader-a ni skupih karata.</li>
          <li><b>Inicijativa:</b> uzmi je kad ti je važno da sledeće runde igraš prvi - ali time se odričeš ostatka runde.</li>
          <li><b>Dve arene:</b> ako protivnik nema ništa u svemiru, svemirske jedinice mogu slobodno da tuku bazu.</li>
          <li><b>Sentinel</b> štiti bazu - zato su Saboteur jedinice vredne.</li>
          <li><b>Pass je taktika:</b> čekanje da protivnik prvi potroši resurse često se isplati.</li>
        </ul>
        <p class="muted small">Ovo poglavlje su saveti, nisu deo zvaničnih pravila.</p>`
    }
  ],

  // ─────────────────────────────── KLJUČNE REČI ───────────────────────────────
  glossary: [
    { term: "Ambush", group: "Spark of Rebellion", def: "Kad je odigrana (ili deploy-ovana/kreirana): može odmah napasti neprijateljsku jedinicu, iako je exhausted. Ne može ako nema jedinice koju može napasti." },
    { term: "Grit", group: "Spark of Rebellion", def: "+1 power za svaku štetu na ovoj jedinici. U istovremenoj borbi nova šteta ne povećava power za tu borbu." },
    { term: "Overwhelm", group: "Spark of Rebellion", def: "Dok napada: višak borbene štete preko preostalog HP-a branioca ide u protivničku bazu. Ako Shield spreči štetu - ništa ne ide u bazu." },
    { term: "Raid X", group: "Spark of Rebellion", def: "Dok napada: +X power. Više Raid-ova se sabira." },
    { term: "Restore X", group: "Spark of Rebellion", def: "Kad napada: izleči X štete sa svoje baze (pre štete). Sabira se." },
    { term: "Saboteur", group: "Spark of Rebellion", def: "Sme da ignoriše Sentinel pri izboru mete i uništava sve Shield tokene branioca." },
    { term: "Sentinel", group: "Spark of Rebellion", def: "Protivničke jedinice u ovoj areni ne mogu napasti tvoje ne-Sentinel jedinice ni bazu. Nijedna sposobnost ga ne može zaštititi od napada." },
    { term: "Shielded", group: "Spark of Rebellion", def: "Kad uđe u igru, dobija Shield token." },
    { term: "Shield (token)", group: "Osnovno", def: "Spreči bilo koliku štetu jednom, pa se uništava." },
    { term: "Experience (token)", group: "Osnovno", def: "+1/+1 jedinici na kojoj je." },
    { term: "Initiative", group: "Osnovno", def: "Counter koji određuje ko prvi igra u rundi; uzima se akcijom Take the Initiative (jednom po rundi)." },
    { term: "Epic Action", group: "Osnovno", def: "Action sposobnost koja se koristi jednom po igri; najčešće deploy leader-a." },
    { term: "Deploy", group: "Osnovno", def: "Okreni leader-a na unit stranu, u ground arenu, ready." },
    { term: "Exhaust / Ready", group: "Osnovno", def: "Okreni kartu bočno (iskorišćena) / uspravi je." },
    { term: "Resource", group: "Osnovno", def: "Karta licem nadole koja se exhaust-uje za plaćanje." },
    { term: "Aspect penalty", group: "Osnovno", def: "+2 cene za svaku ikonu aspekta koju leader i baza ne pokrivaju." },
    { term: "Unique", group: "Osnovno", def: "Najviše 1 kopija u igri pod tvojom kontrolom." },
    { term: "Arena", group: "Osnovno", def: "Ground ili Space; jedinice napadaju samo jedinice u svojoj areni (i bazu)." },
    { term: "On Attack / When Played / When Defeated", group: "Osnovno", def: "Okidači: pri napadu (pre štete), posle igranja, posle poraza." },
    { term: "Coordinate", group: "Kasniji setovi", def: "Dok kontrolišeš 3+ jedinice, karta dobija navedenu sposobnost." },
    { term: "Exploit X", group: "Kasniji setovi", def: "Pri igranju možeš uništiti do X svojih jedinica; svaka smanjuje cenu za 2." },
    { term: "Piloting [Y]", group: "Kasniji setovi", def: "Jedinicu možeš odigrati kao upgrade na svoje VEHICLE vozilo za cenu Y." },
    { term: "Hidden", group: "Kasniji setovi", def: "Ne može biti napadnuta u fazi u kojoj je ušla u igru." },
    { term: "Plot", group: "Kasniji setovi", def: "Kad deploy-uješ leader-a, možeš odigrati ovu kartu iz resursa." }
  ],

  expansions: [],

  sources: [
    { label: "Spark of Rebellion Quickstart Rules (FFG, PDF)", url: "https://images-cdn.fantasyflightgames.com/filer_public/36/f6/36f6e0a5-a7a9-4cbe-8d73-70e61fe6f548/sw_unlimited_quickstart_rules.pdf" },
    { label: "Comprehensive Rules 8.0 (PDF)", url: "https://cdn.starwarsunlimited.com//SWH_Comp_Rules_v8_0_e26603c6e1.pdf" },
    { label: "Zvanična stranica: How to Play", url: "https://starwarsunlimited.com/how-to-play?chapter=rules" }
  ]
});
})();
