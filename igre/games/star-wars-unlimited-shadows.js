(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Capture: zarobljena karta ispod jedinice-čuvara
const FIG_SHD_CAPTURE = F.figure(
  520, 186,
  F.rect(36, 44, 92, 120, { cls: "f-card f-back", r: 6 }) +
    F.text(82, 150, "zarobljena", { cls: "f-muted" }) +
    F.rect(20, 20, 92, 120, { cls: "f-card", r: 6 }) +
    F.text(66, 70, ["Jedinica-", "čuvar"], { cls: "f-title f-small", lh: 16 }) +
    F.text(66, 112, "guarding unit", { cls: "f-muted" }) +
    F.arrow(150, 80, 196, 80, { accent: true }) +
    F.box(200, 30, 140, 100, "Čuvar napusti igru", { cls: "f-acc", sub: ["poražen, vraćen", "u ruku…"], titleCls: "f-title f-small" }) +
    F.arrow(344, 80, 386, 80, { accent: true }) +
    F.box(390, 30, 120, 100, "Rescue", { sub: ["vraća se u igru", "exhausted, kod", "vlasnika"], titleCls: "f-title f-small" }),
  { caption: "Capture: zarobljena jedinica leži licem nadole ispod čuvara. Kad čuvar napusti igru, ona se oslobađa - ali nije „odigrana“, pa nema When Played." }
);

// ─────────────────────────────── DODATAK ───────────────────────────────

registerExpansion("star-wars-unlimited", {
  id: "shadows-of-the-galaxy",
  title: "Shadows of the Galaxy - Two-Player Starter",
  type: "Set 2 · Starter",
  released: "jul 2024",
  owned: true,
  summary:
    "Drugi set Star Wars: Unlimited-a, u starteru za dvoje: The Mandalorian protiv Moff Gideon-a. Dva gotova špila od po 50 karata, spremna za igru odmah. Set donosi tri nove mehanike: Capture (zarobljavanje), Bounty (ucena) i Smuggle (krijumčarenje iz resursa).",

  quickRef: [
    {
      title: "Dva špila iz startera",
      html: `
        <table class="kwtable">
          <tr><td class="kw">The Mandalorian</td><td>Cunning + Heroism · baza Sorgan (Vigilance, 30 HP) · deploy: 6 resursa · upgrade-i i iscrpljivanje protivnika</td></tr>
          <tr><td class="kw">Moff Gideon</td><td>Command + Villainy · baza Nevarro (Vigilance, 30 HP) · deploy: 5 resursa · roj jeftinih jedinica sa Overwhelm</td></tr>
        </table>`
    },
    {
      title: "Nove mehanike",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Capture</td><td>jedinica ide licem nadole ispod tvog „čuvara“; oslobađa se (exhausted) kad čuvar napusti igru</td></tr>
          <tr><td class="kw">Bounty</td><td>kad je jedinica poražena ili zarobljena, protivnik uzima nagradu</td></tr>
          <tr><td class="kw">Smuggle [Y]</td><td>karta iz tvojih resursa se igra za Y; gornja karta špila postaje novi resurs</td></tr>
        </table>`
    }
  ],

  rules: [
    {
      id: "shd-kutija",
      title: "Šta je u kutiji",
      html: `
        <ul>
          <li><b>2 gotova špila</b> od po 50 karata - <b>The Mandalorian</b> i <b>Moff Gideon</b> - plus dvostrane karte lidera, baze i tokeni.</li>
          <li>10 karata ekskluzivnih za starter (nema ih u booster-ima). Među njima su i karte iz Spark of Rebellion u „Special“ retkosti: Death Trooper, System Patrol Craft, General Tagge, Seasoned Shoretrooper, Superlaser Technician, Snowtrooper Lieutenant, Cell Block Guard, Confiscate.</li>
          <li>40 counter-a, quickstart pravila, 2 papirne podloge i 2 kutijice za špil.</li>
        </ul>
        <h4>Raspakivanje</h4>
        <p>Odvoj dvostrane karte (lideri, baze, tokeni) od ostalih 50 karata u svakom špilu - one imaju standardna Star Wars: Unlimited leđa. Postavite podloge jednu naspram druge i igrajte po osnovnim pravilima (poglavlje „Priprema igre“).</p>
        <div class="note">Pravila igre su ista kao u Spark of Rebellion; quickstart iz ove kutije samo dodaje Capture, Bounty i Smuggle, koji se pojavljuju na kartama u starteru (vidi poglavlje „Nove mehanike“).</div>`
    },
    {
      id: "shd-mando",
      title: "Špil: The Mandalorian",
      html: `
        <p><b>Lider:</b> The Mandalorian, <i>Sworn to the Creed</i> · <b>aspekti</b> Cunning + Heroism · <b>baza</b> Sorgan, Remote Village (Vigilance, 30 HP)</p>
        <table>
          <tr><th>Strana</th><th>Sposobnost</th></tr>
          <tr><td><b>Leader</b></td><td>Kad odigraš <b class="kw">upgrade</b>: možeš exhaust-ovati ovog lidera; ako to uradiš, exhaust-uj protivničku jedinicu sa <b>4 ili manje</b> preostalih HP.</td></tr>
          <tr><td><b>Epic Action</b></td><td>Deploy kad imaš <b>6+ resursa</b>.</td></tr>
          <tr><td><b>Leader Unit</b> (4 power / 7 HP)</td><td>Kad odigraš upgrade: možeš exhaust-ovati protivničku jedinicu sa <b>6 ili manje</b> preostalih HP (bez exhaust-ovanja Mandalorijanca).</td></tr>
        </table>
        <h4>Kako se igra</h4>
        <ul>
          <li>Špil je pun <b>upgrade</b>-a (oružja i opreme). Svaki upgrade koji odigraš može da „zamrzne“ (exhaust) protivničku jedinicu - iscrpljena jedinica ne može da napadne.</li>
          <li><b>Mandalorian</b> jedinice i karte poput <i>The Armorer</i> (Shield-ovi za do 3 Mandalorijanca) i <i>This Is The Way</i> (traži Mandalorian karte i upgrade-e) grade jak kopneni front.</li>
          <li><b>The Mandalorian's Rifle</b>: ako ga zakačiš na Mandalorijanca, on može da <b class="kw">capture</b>-uje iscrpljenu protivničku jedinicu - exhaust pa capture je glavna kombinacija špila.</li>
          <li><i>Razor Crest</i> vraća upgrade-e iz discard-a; <i>Grogu</i> i <i>Foundling</i> podržavaju Mandalorian sinergiju.</li>
        </ul>
        <div class="note">Mandalorian špil je malo složeniji za početnike od Gideon-ovog - u njemu ima više ključnih reči (Ambush, Sentinel, Shielded, Restore).</div>`
    },
    {
      id: "shd-gideon",
      title: "Špil: Moff Gideon",
      html: `
        <p><b>Lider:</b> Moff Gideon, <i>Formidable Commander</i> · <b>aspekti</b> Command + Villainy · <b>baza</b> Nevarro, Remnant Science Facility (Vigilance, 30 HP)</p>
        <table>
          <tr><th>Strana</th><th>Sposobnost</th></tr>
          <tr><td><b>Leader</b></td><td><b>Action [exhaust]</b>: napadni jedinicom koja košta <b>3 ili manje</b>. Ako napada jedinicu, dobija +1/+0 za taj napad.</td></tr>
          <tr><td><b>Epic Action</b></td><td>Deploy kad imaš <b>5+ resursa</b>.</td></tr>
          <tr><td><b>Leader Unit</b> (3 power / 6 HP)</td><td><b class="kw">Overwhelm</b>. Svaka tvoja jedinica koja košta 3 ili manje dobija +1/+0 i Overwhelm dok napada protivničku jedinicu.</td></tr>
        </table>
        <h4>Kako se igra</h4>
        <ul>
          <li>Igraj puno <b>jeftinih jedinica</b> (cena 3 ili manje) - Gideon ih pojačava, a kad je deploy-ovan, njihov višak štete ide u protivničku bazu (Overwhelm).</li>
          <li>Leader sposobnost je kao „dodatni napad“: exhaust Gideon-a i napadni jeftinom jedinicom.</li>
          <li>Ključne karte: <i>Incinerator Trooper</i> (ekskluzivna za starter; nanosi štetu prvi), <i>Outland TIE Vanguard</i> (Experience token jeftinoj jedinici), <i>Death Trooper</i>.</li>
        </ul>
        <h4>Zvanična pojašnjenja (Moff Gideon)</h4>
        <ul>
          <li>„Košta 3 ili manje“ uvek gleda <b>odštampanu</b> cenu karte, bez obzira na umanjenja.</li>
          <li>Ako koristiš leader sposobnost, <b>moraš</b> napasti jedinicom cene 3 ili manje ako možeš; jedinica mora biti ready.</li>
          <li>Shield sprečava svu štetu i od napadača sa Overwhelm - nema viška, jer branilac nije poražen.</li>
          <li>Ako je branilac poražen pre borbene štete, napadač se i dalje smatra da napada jedinicu, pa je sva šteta višak za Overwhelm.</li>
        </ul>`
    },
    {
      id: "shd-mehanike",
      title: "Nove mehanike: Capture, Bounty, Smuggle",
      html: `
        <h4>Capture (zarobljavanje)</h4>
        ${FIG_SHD_CAPTURE}
        <ul>
          <li>Zarobljena jedinica <b>napušta igru</b>: upgrade-i na njoj se uništavaju, šteta se briše. Stavlja se licem nadole ispod jedinice koja je zarobila - <b>guarding unit</b> (čuvar).</li>
          <li>Zarobljena karta je van igre, ali <b>nije poražena</b> (nema When Defeated). Svi igrači smeju da je pogledaju.</li>
          <li>Jedan čuvar može čuvati više zarobljenih karata.</li>
          <li>Kad čuvar napusti igru iz bilo kog razloga, zarobljena jedinica je <b>oslobođena</b> (rescue): vraća se u igru <b>exhausted</b>, pod kontrolom vlasnika. Nije „odigrana“, pa ne aktivira When Played.</li>
        </ul>
        <h4>Bounty (ucena)</h4>
        <ul>
          <li>Kad je jedinica sa Bounty <b>poražena ili zarobljena</b>, njen <b>protivnik</b> može da uzme nagradu (collect the bounty) - npr. vuče kartu ili nanese štetu.</li>
          <li>Neki upgrade-i daju Bounty jedinici na koju se kače. Ako takav upgrade staviš na <b>protivničku</b> jedinicu, ti uzimaš nagradu kad ona padne.</li>
          <li>Uzimanje nagrade je opciono.</li>
        </ul>
        <h4>Smuggle [Y] (krijumčarenje)</h4>
        <ul>
          <li>Kartu sa Smuggle koja ti leži licem nadole kao <b>resurs</b> možeš odigrati plaćajući njenu Smuggle cenu Y (umesto obične).</li>
          <li>Na njeno mesto odmah ide <b>gornja karta tvog špila</b>, kao novi resurs, exhausted - broj resursa ostaje isti.</li>
          <li>Kartu smeš exhaust-ovati da pomogne u plaćanju sopstvene Smuggle cene. Važi aspect penalty kao i inače.</li>
          <li>Zato je dobra ideja karte sa Smuggle stavljati kao resurse - kasnije ih možeš „izvaditi“.</li>
        </ul>`
    },
    {
      id: "shd-formati",
      title: "U kojim formatima važe ove karte",
      html: `
        <ul>
          <li><b>Kod kuće (prijateljska igra):</b> starter špilovi su potpuno legalni - igrajte bez ograničenja.</li>
          <li><b>Premier</b> (najčešći turnirski format): Shadows of the Galaxy <b>više nije</b> u Premier-u, jer Premier koristi samo karte iz dve najnovije rotacije.</li>
          <li><b>Eternal, Trilogy, Twin Suns:</b> karte su legalne.</li>
        </ul>
        <p class="muted small">Status formata prema bazi karata SWUDB (oktobar 2026); za turnir proveri aktuelna pravila.</p>`
    }
  ],

  glossary: [
    { term: "Capture", group: "Shadows of the Galaxy", def: "Jedinica napušta igru (upgrade-i uništeni, šteta obrisana) i leži licem nadole ispod čuvara. Nije poražena. Kad čuvar napusti igru, oslobađa se i vraća exhausted." },
    { term: "Rescue", group: "Shadows of the Galaxy", def: "Oslobađanje zarobljene jedinice kad čuvar napusti igru; vraća se exhausted, bez When Played." },
    { term: "Bounty", group: "Shadows of the Galaxy", def: "Kad je jedinica poražena ili zarobljena, njen protivnik može uzeti navedenu nagradu." },
    { term: "Smuggle [Y]", group: "Shadows of the Galaxy", def: "Karta iz tvojih resursa se igra za cenu Y; gornja karta špila postaje novi resurs (exhausted)." }
  ],

  sources: [
    { label: "Shadows of the Galaxy Quickstart Rules (PDF)", url: "https://cdn.starwarsunlimited.com//Quickstart_Rules_Set_2_271c735e17.pdf" },
    { label: "Heated Rivals - zvanični članak o starteru", url: "https://starwarsunlimited.com/articles/heated-rivals" },
    { label: "SWUDB: Moff Gideon, Formidable Commander", url: "https://swudb.com/card/SHD/007" },
    { label: "SWUDB: The Mandalorian, Sworn to the Creed", url: "https://swudb.com/card/SHD/018" }
  ]
});
})();
