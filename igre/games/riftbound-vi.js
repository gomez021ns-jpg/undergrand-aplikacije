(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Vi: višak štete → Legend ready-uje jedinicu → Ganking na drugi battlefield
const FIG_VI_COMBO = F.figure(
  480, 236,
  F.box(10, 10, 140, 74, "Napadni jako", { sub: ["Vault Breaker:", "Assault 2 + Ganking"] }) +
    F.box(170, 10, 140, 74, "Conquer", { cls: "f-acc", sub: ["višak štete ≥ 3", "+1 poen"] }) +
    F.box(330, 10, 140, 74, "Vi Legend", { cls: "f-acc", sub: ["exhaust Legend →", "ready jedinicu"] }) +
    F.box(330, 150, 140, 74, "Ganking", { sub: ["ista jedinica ide", "na drugi battlefield"] }) +
    F.box(170, 150, 140, 74, "Drugi Conquer", { cls: "f-acc", sub: ["još 1 poen", "u istom potezu"] }) +
    F.arrow(150, 47, 168, 47) +
    F.arrow(310, 47, 328, 47) +
    F.arrow(400, 84, 400, 148) +
    F.arrow(330, 187, 312, 187) +
    F.text(80, 150, ["bez Ganking-a:", "ready za odbranu", "ili za još jednu", "exhaust sposobnost"], { cls: "f-muted", lh: 15 }),
  { caption: "Vi-jev krug: prebij branioce sa bar 3 viška štete, Legend vrati jedinicu uspravno i ona napada ponovo." }
);

// Kako se računa višak štete
const FIG_VI_EXCESS = F.figure(
  480, 206,
  F.text(90, 22, "Napadači", { cls: "f-title f-small" }) +
    F.rect(30, 36, 54, 74, { cls: "f-card" }) +
    F.text(57, 84, "5", { cls: "f-big" }) +
    F.rect(96, 36, 54, 74, { cls: "f-card" }) +
    F.text(123, 84, "3", { cls: "f-big" }) +
    F.text(90, 132, "ukupno 8 štete", { cls: "f-small" }) +
    F.arrow(166, 73, 312, 73, { accent: true }) +
    F.text(239, 62, "raspodela", { cls: "f-muted" }) +
    F.text(390, 22, "Branioci", { cls: "f-title f-small" }) +
    F.rect(330, 36, 54, 74, { cls: "f-card" }) +
    F.text(357, 84, "2", { cls: "f-big" }) +
    F.rect(396, 36, 54, 74, { cls: "f-card" }) +
    F.text(423, 84, "3", { cls: "f-big" }) +
    F.text(357, 132, "dobija 2", { cls: "f-small" }) +
    F.text(423, 132, "3 + 3 viška", { cls: "f-small" }) +
    F.rect(60, 152, 360, 40, { cls: "f-acc" }) +
    F.text(240, 177, "višak = 8 − 2 − 3 = 3 → Vi Legend radi", { cls: "f-title f-small" }),
  { caption: "Prvo svaki branilac dobija tačno lethal štetu; sve što preostane ide na poslednjeg i to je višak." }
);

// Spisak karata u dve kolone
const deckTable = (rows) =>
  `<table class="decktable">${rows.map(([n, name]) => `<tr><td class="num">${n}</td><td>${name}</td></tr>`).join("")}</table>`;

// ─────────────────────────────── DODATAK ───────────────────────────────

registerExpansion("riftbound", {
  id: "unleashed-vi",
  title: "Unleashed - Champion Deck: Vi",
  type: "Set 3 · Champion Deck",
  released: "maj 2026",
  owned: true,
  summary:
    "Gotov špil od 56 karata iz trećeg seta (Unleashed), za Vi iz Piltover-a. Agresivan Fury + Order špil: jedinice sa puno Might-a prebijaju branioce, a kad osvojiš battlefield sa bar 3 viška štete, Vi-jev Legend vraća jedinicu uspravno da napadne ponovo. Legalan za turnire odmah iz kutije.",

  quickRef: [
    {
      title: "Vi - Fury + Order",
      html: `
        <ul>
          <li><b>Legend:</b> Vi, Piltover Enforcer - kad uradiš <b class="kw">Conquer</b> i dodelio si <b>3+ viška štete</b>, možeš da exhaust-uješ Legend → <b class="kw">ready</b> jednu svoju jedinicu.</li>
          <li><b>Plan:</b> napadaj sa više Might-a nego što treba (Vault Breaker, Square Up, Arena Kingpin), pa ready-ovanom jedinicom napadni ponovo.</li>
          <li><b class="kw">Ganking</b> (Vault Breaker, Vi Destructive, Rengar) vodi ready jedinicu pravo na drugi battlefield.</li>
          <li><b>Težina:</b> srednja - stalno računaj višak.</li>
        </ul>`
    },
    {
      title: "Višak štete i tokeni",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Višak</td><td>šteta posle lethal-a svim braniocima</td></tr>
          <tr><td class="kw">Bez branilaca</td><td>nema borbe → nema ni viška</td></tr>
          <tr><td class="kw">3+ viška</td><td>Vi Legend, Yeti Brawler, Trapping Grounds, Hextech Gauntlets</td></tr>
          <tr><td class="kw">Bird</td><td>token 1 Might, Deflect</td></tr>
          <tr><td class="kw">Gold</td><td>gear token: kill + exhaust → 1 Power bilo kog domena</td></tr>
        </table>`
    }
  ],

  rules: [
    {
      id: "vi-kutija",
      title: "Šta je u kutiji i kako početi",
      html: `
        <ul>
          <li><b>Gotov špil od 56 karata:</b> 1 Legend + Main Deck od 40 karata (sa 4 Vi jedinice) + 12 runa + 3 battlefield-a.</li>
          <li><b>4 dvostrana tokena</b> (Bird / Gold) - ne idu u špil, stoje sa strane dok ih neka karta ne kreira.</li>
          <li><b>1 Unleashed booster</b> - za kasnije doterivanje špila.</li>
          <li><b>Papirna podloga</b> (playmat), <b>kutijica za špil</b> i knjižica sa pravilima i vodičem za pravljenje špila.</li>
        </ul>
        <h4>Prva partija</h4>
        <ol>
          <li>Vi ima rune <b class="kw">Fury</b> i <b class="kw">Order</b> (po 6). Protivnik može da igra bilo koji drugi gotov špil iz kolekcije - Proving Grounds (Annie, Lux, Garen, Master Yi) ili Vendetta (Zed, Shen).</li>
          <li>Izaberi <b>Chosen Champion</b>-a: jednu od Vi jedinica iz špila staviš u Champion Zone na početku. Spisak ne propisuje koju. Za početak je dobra <b>Vi, Destructive</b>: jeftina je (2 Energy + 1 Fury), igra se rano i ima <b class="kw">Ganking</b>, pa najbolje koristi Legend-ovo ready-ovanje.</li>
          <li>Ostalo po osnovnim pravilima (poglavlje „Priprema igre“): nasumično 1 od 3 battlefield-a, 4 karte u ruku, mulligan.</li>
          <li>Booster za sada ne otvarajte u špil - prvo odigrajte par partija sa gotovim špilom.</li>
        </ol>`
    },
    {
      id: "vi-spil",
      title: "Vi - pobeda viškom snage",
      html: `
        <p><b>Domeni:</b> <b class="kw">Fury</b> + <b class="kw">Order</b> · <b>Legend:</b> Vi, Piltover Enforcer · <b>Signature:</b> Vault Breaker (spell), Hextech Gauntlets (gear)</p>
        <h4>Ključne karte</h4>
        <table>
          <tr><th>Karta</th><th>Šta radi</th></tr>
          <tr><td><b>Vi, Piltover Enforcer</b><br><span class="muted small">Legend</span></td><td>Kad uradiš <b class="kw">Conquer</b>, ako si dodelio 3 ili više viška štete, možeš da exhaust-uješ Legend da <b class="kw">ready</b>-uješ jednu jedinicu (bilo koju svoju, ne mora ona koja je osvojila).</td></tr>
          <tr><td><b>Vi, Destructive</b><br><span class="muted small">Champion · 2 + Fury · 3 Might</span></td><td><b class="kw">Ganking</b>. Recycle 1 kartu iz svog Trash-a → +1 Might ovog poteza (može više puta, dok imaš karata u Trash-u).</td></tr>
          <tr><td><b>Vi, Hotheaded</b><br><span class="muted small">Champion · 4 · 3 Might</span></td><td><b class="kw">Deflect</b>. Plati 2 Energy + 1 Fury → udvostruči joj Might ovog poteza. Sa buff-om ili opremom to brzo postane veliki višak.</td></tr>
          <tr><td><b>Vi, Peacekeeper</b><br><span class="muted small">Champion · 5 + Order · 5 Might</span></td><td><b class="kw">Ambush</b>. Kad napada, <b class="kw">Stun</b>-uje jednu protivničku jedinicu tu - ona ne nanosi borbenu štetu ovog poteza.</td></tr>
          <tr><td><b>Vault Breaker</b><br><span class="muted small">Signature Spell · Action</span></td><td>Jedinica dobija <b class="kw">Assault 2</b> i <b class="kw">Ganking</b> ovog poteza. Srce špila: daje i višak i put do drugog battlefield-a.</td></tr>
          <tr><td><b>Hextech Gauntlets</b><br><span class="muted small">Signature Gear · Equipment · +3 Might</span></td><td><b class="kw">Equip</b> košta 3 Energy + 1 Power bilo kog domena, a Energy deo se smanjuje za Might jedinice (na jedinici sa 3+ Might-a plaćaš samo 1 Power). Jedinica dobija: kad uradi Conquer sa 3+ viška, vuci 1.</td></tr>
          <tr><td><b>Square Up</b><br><span class="muted small">Spell</span></td><td>Jedinica dobija <b class="kw">Assault 4</b> ovog poteza. <b class="kw">Repeat</b> (discard 1) - ponovi, pa je ukupno +8 dok napada.</td></tr>
          <tr><td><b>Arena Kingpin</b> · <b>Xerath, Freed</b></td><td>Imaju exhaust sposobnosti (+3 Might jedinici / 3 štete jedinici dok je Xerath na battlefield-u). Kad ih Legend ready-uje, koriste ih ponovo.</td></tr>
          <tr><td><b>Yeti Brawler</b> · <b>Trapping Grounds</b></td><td>Takođe nagrađuju Conquer sa 3+ viška: Yeti daje 2 <b>Gold</b> tokena, battlefield daje <b>Bird</b> token.</td></tr>
        </table>
        ${FIG_VI_COMBO}
        <h4>Kako se igra</h4>
        <ul>
          <li>Ne napadaj „tačno toliko“ - uvek gledaj da posle ubijanja branilaca ostane <b>3 ili više</b> štete. Sabiraj Might, <b class="kw">Assault</b> i opremu pre nego što pošalješ jedinice.</li>
          <li><b>Vault Breaker</b> čuvaj za trenutak kad ti fali Might do viška - Ganking ti tada otvara drugi napad.</li>
          <li>Ready-uj jedinicu koja ima najviše koristi: onu sa Ganking-om (novi napad), Arena Kingpin-a ili Xerath-a (još jedna sposobnost), ili jaku jedinicu da ostane spremna.</li>
          <li><b>Inferna</b>, <b>Lord Broadmane</b> i <b>Vi, Peacekeeper</b> imaju <b class="kw">Ambush</b> - u toku borbe ih ubaciš kao Reaction i iznenada povećaš Might.</li>
          <li>Crimson Pigeons (+2 kad napada sa još nekim) i Lord Broadmane (ostale jedinice dobijaju Assault) nagrađuju napad u grupi.</li>
        </ul>
        <div class="note"><b>Zamka:</b> prazan battlefield ne daje višak - nema borbe, nema dodeljene štete. Legend i Yeti tu ne rade. I ne troši sve jedinice u napadu: Order deo špila (Mageseeker Investigator, Tactical Retreat, Loyal Poro) služi da preživiš protivnikov uzvratni udarac.</div>`
    },
    {
      id: "vi-visak",
      title: "Višak štete (excess damage)",
      html: `
        <p>Više karata u ovom špilu pita „ako si dodelio 3 ili više viška štete“. Višak se računa pri raspodeli borbene štete:</p>
        <ol>
          <li>Napadači sabiraju svoju štetu (Might + <b class="kw">Assault</b> + bonusi).</li>
          <li>Ti raspoređuješ tu štetu po braniocima: svaki branilac mora da dobije <b>lethal štetu u celosti</b> (koliko mu fali do Might-a) pre nego što pređeš na sledećeg, i ne sme da dobije više od toga dok ima drugih branilaca.</li>
          <li>Kad svi branioci imaju lethal štetu, sav ostatak ide na poslednjeg. <b>Taj ostatak je višak.</b></li>
        </ol>
        ${FIG_VI_EXCESS}
        <h4>Česte situacije</h4>
        <ul>
          <li><b>Nema branilaca</b> (prazan ili tvoj battlefield) → nema borbe ni dodeljene štete, pa ni viška. Conquer i dalje daje poen, ali „3+ viška“ efekti ne rade.</li>
          <li><b>Stun-ovan branilac</b> ne nanosi štetu, ali i dalje treba njegov pun Might da bi umro - i toliko se računa za lethal.</li>
          <li><b>Branilac koji već ima štetu</b> treba samo ostatak do svog Might-a, pa ostaje više za višak.</li>
          <li><b class="kw">Shield</b> povećava Might branioca dok se brani, pa i lethal štetu koju moraš prvo da mu daš.</li>
          <li>Višak se gleda tek kad uradiš <b class="kw">Conquer</b>: ako protivnik zadrži battlefield, okidači ne rade bez obzira na višak.</li>
        </ul>`
    },
    {
      id: "vi-spisak",
      title: "Spisak karata",
      html: `
        <p>Da proveriš da li je sve u kutiji. Imena karata su na engleskom, kao na kartama.</p>
        <div class="decklists">
          <section>
            <h4>Jedinice (26)</h4>
            ${deckTable([
              [1, "Vi, Destructive"], [1, "Vi, Hotheaded"], [2, "Vi, Peacekeeper"],
              [3, "Inferna"], [2, "Carrion Dredger"], [2, "Loyal Poro"], [2, "Crimson Pigeons"], [2, "Sharkling"],
              [2, "Mageseeker Investigator"], [1, "Rengar, Unseen"], [1, "Arena Kingpin"], [2, "Lord Broadmane"],
              [1, "Xerath, Freed"], [2, "Towering Pairofant"], [2, "Yeti Brawler"]
            ])}
          </section>
          <section>
            <h4>Spell-ovi (9) i gear (5)</h4>
            ${deckTable([
              [2, "Vault Breaker"], [1, "Upstage Comedy"], [1, "Tactical Retreat"], [1, "Soul Harvest"],
              [2, "Right of Conquest"], [2, "Square Up"],
              [2, "Serrated Dirk"], [2, "Divining Shells"], [1, "Hextech Gauntlets"]
            ])}
            <p class="small"><b>Legend:</b> Vi, Piltover Enforcer<br><b>Battlefields:</b> Star Spring, Trapping Grounds, Valley of Idols<br><b>Rune:</b> 6× Fury, 6× Order<br><b>Tokeni:</b> 4× Bird / Gold</p>
          </section>
        </div>
        <p class="muted small">Spisak je iz javno objavljene liste (riftboundguide.com) i poklapa se sa spiskom u aplikaciji Riftbound kolekcija; ako se nešto ne slaže sa tvojom kutijom, važi ono što je u kutiji.</p>`
    }
  ],

  glossary: [
    { term: "Višak štete (excess damage)", group: "Unleashed - Vi", def: "Borbena šteta koja ostane kad svaki branilac dobije lethal štetu; dodeljuje se poslednjem braniocu. Bez branilaca nema ni viška." },
    { term: "Bird", group: "Unleashed - Vi", def: "Token jedinica, 1 Might, sa Deflect. Prave je Carrion Dredger (kad umre) i battlefield Trapping Grounds." },
    { term: "Gold", group: "Unleashed - Vi", def: "Gear token: Reaction - kill ovaj token i exhaust ga → dodaj 1 Power bilo kog domena. Pravi ga Yeti Brawler." }
  ],

  sources: [
    { label: "Riftbound Guide - Vi Champion Deck (spisak i strategija)", url: "https://riftboundguide.com/2026/04/08/riftbound-vi-champion-deck-guide/" },
    { label: "Riftcodex - baza karata (tekstovi karata)", url: "https://riftcodex.com/" },
    { label: "Core Rules 467.2 - raspodela borbene štete (riftwatcher)", url: "https://riftwatcher.com/rules/step-2-the-combat-damage-step/" },
    { label: "Noble Knight - sadržaj kutije", url: "https://www.nobleknight.com/P/2148467839/Unleashed-Champion-Deck---Vi" }
  ]
});
})();
