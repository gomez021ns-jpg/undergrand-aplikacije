(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Tok jedne misije
const FIG_SWR_MISSION = F.figure(
  520, 214,
  F.box(6, 12, 118, 84, "Otkrij 2", { sub: ["sa vrha svog", "mission deck-a"] }) +
    F.box(138, 12, 118, 84, "Zadrži 1", { sub: ["drugu na dno", "mission deck-a"] }) +
    F.box(270, 12, 118, 84, "Ulaži resurse", { cls: "f-acc", sub: ["ostaju na karti", "kroz više poteza"] }) +
    F.box(402, 12, 112, 84, "Završena!", { sub: ["resursi =", "mission value"] }) +
    F.arrow(124, 54, 136, 54) + F.arrow(256, 54, 268, 54) + F.arrow(388, 54, 400, 54) +
    F.arrow(458, 96, 458, 128) +
    F.box(300, 130, 214, 74, "Nagrada", { cls: "f-acc", sub: ["reinforcement karta → na vrh špila", "misija → tvoj victory pile"] }) +
    F.text(12, 150, ["Na početku svakog tvog poteza:", "ako nemaš otvorenu misiju,", "otkrij 2 nove (dok ne dostigneš", "limit misija za partiju)."], { cls: "f-muted", anchor: "start", lh: 15 }),
  { caption: "Misija: otkrij 2, zadrži 1, ulaži resurse dok ne dostigneš njenu vrednost - nagrada ide na vrh tvog špila." }
);

// Kampanja
const game = (x, n, last) =>
  F.box(x, 18, 80, 60, `Igra ${n}`, { cls: last ? "f-acc" : "f-box", sub: last ? "5 baza za pobedu" : null, titleCls: "f-title f-small" });
const shop = (x) =>
  F.text(x, 104, ["poeni:", "baze + misije"], { cls: "f-muted", lh: 14 }) + F.text(x, 140, ["kupi upgraded", "startere"], { cls: "f-muted", lh: 14 });
const FIG_SWR_CAMPAIGN = F.figure(
  520, 168,
  game(6, 1) + game(110, 2) + game(214, 3) + game(318, 4) + game(422, 5, true) +
    F.arrow(86, 48, 108, 48) + F.arrow(190, 48, 212, 48) + F.arrow(294, 48, 316, 48) + F.arrow(398, 48, 420, 48) +
    shop(98) + shop(202) + shop(306) + shop(410),
  { caption: "Kampanja od 5 partija. Između partija: poeni za kupovinu jačih startera i zamena karata u galaxy deck-u osvojenim reinforcement kartama." }
);

// ─────────────────────────────── DODATAK ───────────────────────────────

registerExpansion("star-wars-deckbuilding", {
  id: "rebel-empire-reinforcements",
  title: "Rebel & Empire Reinforcements",
  type: "Ekspanzija",
  released: "jul 2026",
  owned: true,
  summary:
    "Direktna ekspanzija za originalno izdanje (Imperija vs Pobunjenici). Donosi misije kojima usred partije osvajaš legendarne jedinice i brodove (Yoda, Palpatine, Thrawn, Home One, Executor…), nove baze, jače starter karte i tri nova načina igre - uključujući kampanju od 5 partija. Nije samostalna igra: potrebna je osnovna kutija.",

  quickRef: [
    {
      title: "Misije - ukratko",
      html: `
        <ul>
          <li>Na kraju pripreme i na početku svakog tvog poteza: ako nemaš otvorenu misiju, otkrij <b>2</b> sa svog <b class="kw">mission deck</b>-a, zadrži 1, drugu stavi na dno.</li>
          <li>Tokom poteza ulaži <b>resurse</b> na misiju - ostaju na njoj iz poteza u potez.</li>
          <li>Kad je na njoj resursa koliko je <b class="kw">mission value</b> (broj na dnu karte): odgovarajuća <b class="kw">reinforcement</b> karta ide <b>na vrh tvog špila</b>, a misija u tvoj victory pile.</li>
          <li>Broj misija po partiji je <b>ograničen</b>.</li>
        </ul>`
    },
    {
      title: "Novi načini igre",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Sa misijama</td><td>standardna partija 1v1 + misije i reinforcement karte</td></tr>
          <tr><td class="kw">Upgraded Starter</td><td>špil od 10 jačih startera + nova baza (14 HP) - agresivan početak</td></tr>
          <tr><td class="kw">Kampanja</td><td>5 povezanih partija; poeni između partija; u 5. partiji pobeđuje ko uništi 5 baza</td></tr>
        </table>`
    }
  ],

  rules: [
    {
      id: "swr-sadrzaj",
      title: "Šta je u kutiji",
      html: `
        <p><b>140 novih karata</b>:</p>
        <ul>
          <li><b>50 reinforcement karata</b> (25 Pobunjenici, 25 Imperija) - ne mešaju se u galaxy deck, već se osvajaju misijama.</li>
          <li><b>Mission karte</b> - nova vrsta karata; svaka reinforcement karta ima svoju misiju.</li>
          <li><b>Nove baze</b> - deo njih reaguje na misije (npr. Klatooine, Death Star II), a deo ima „klasične“ sposobnosti (npr. Ryloth, Scarif).</li>
          <li><b>Upgraded starter karte</b> - po 5 vrsta za svaku frakciju, u po 2 primerka (10 po frakciji).</li>
        </ul>
        <table>
          <tr><th></th><th>Pobunjenici</th><th>Imperija</th></tr>
          <tr><td><b>Neke reinforcement karte</b></td><td>Mon Mothma, Yoda, R2-D2, C-3PO, Home One, Redemption</td><td>Admiral Thrawn, Emperor Palpatine, Grand Inquisitor, Dedra Meero, Chimaera, Executor</td></tr>
          <tr><td><b>Upgraded starteri</b></td><td>Rebel Astromech, Tauntaun Rider, Smuggling Ship, A-Wing, MC30 Scout Frigate</td><td>Probe Droid, Dewback Rider, VT-49 Decimator, TIE Striker, Arrestor Cruiser</td></tr>
        </table>
        <p>Primer para misija i nagrada: misija <i>Renounce the Empire</i> donosi Mon Mothmu, a <i>Restore Imperial Order</i> Admirala Thrawn-a.</p>
        <div class="note">Potrebno je <b>originalno izdanje</b> (Imperija vs Pobunjenici, SWG01). Ekspanzija nije za Clone Wars Edition.</div>`
    },
    {
      id: "swr-misije",
      title: "Misije i reinforcement karte",
      html: `
        ${FIG_SWR_MISSION}
        <h4>Priprema</h4>
        <ul>
          <li>Promešaj sve <b>mission karte svoje frakcije</b> u svoj mission deck.</li>
          <li>Reinforcement karte svoje frakcije ostavi <b>sa strane</b> (ne mešaju se u galaxy deck).</li>
          <li>Na kraju pripreme otkrij 2 misije, zadrži jednu licem nagore ispred sebe, drugu stavi na dno.</li>
        </ul>
        <h4>Tokom igre</h4>
        <ol>
          <li><b>Nova misija:</b> na početku svakog svog poteza, ako nemaš otvorenu misiju, otkrij gornje 2 karte mission deck-a, zadrži jednu, drugu vrati na dno.</li>
          <li><b>Ulaganje:</b> tokom svog poteza možeš stavljati resurse na misiju, slično kupovini karte iz galaxy row-a. Razlika: resursi <b>ostaju na misiji</b> dok se ne završi, pa je možeš završavati kroz više poteza.</li>
          <li><b>Završetak:</b> kad je na misiji resursa koliko iznosi njena <b class="kw">mission value</b> (broj na dnu karte), misija je završena. Odmah stavi odgovarajuću <b>reinforcement kartu na vrh svog špila</b> - izvući ćeš je uskoro.</li>
          <li>Završena misija ide u tvoj <b>victory pile</b> (pored uništenih protivničkih baza).</li>
          <li>Otvorena misija ostaje u igri dok je ne završiš.</li>
        </ol>
        <div class="note"><b>Ograničenje:</b> broj misija koje možeš završiti u jednoj partiji je ograničen, pa biraj pametno. Jedan izvor navodi da je limit jednak broju baza potrebnih za pobedu (npr. igra do 4 baze → najviše 4 misije). <b>Proveri tačno pravilo u pravilniku iz kutije.</b></div>`
    },
    {
      id: "swr-modovi",
      title: "Načini igre",
      html: `
        <h4>1. Standardna partija sa misijama</h4>
        <p>Glavni način igre sa ovom ekspanzijom: obična partija 1v1 po osnovnim pravilima, uz mission deck i reinforcement karte kako je opisano iznad.</p>
        <h4>2. Upgraded Starter mod</h4>
        <ul>
          <li>Umesto originalnih starter karata koristiš <b>10 upgraded starter karata</b> svoje frakcije (5 vrsta × 2).</li>
          <li>Umesto startne baze sa 8 HP uzimaš jednu od <b>novih baza sa 14 HP</b>, čija sposobnost reaguje na završene misije.</li>
          <li>Igra se sa misijama. Upgraded 2-cost Trooper jedinica daje Silu kad završiš misiju (jer u ovom modu nema originalne starter karte koja daje Silu).</li>
          <li>Mnogo agresivniji početak - već prvi potezi deluju kao sredina obične partije.</li>
        </ul>
        <h4>3. Kampanja</h4>
        ${FIG_SWR_CAMPAIGN}
        <ul>
          <li>Serija od <b>5 partija</b>, gde rezultat svake utiče na sledeću.</li>
          <li><b>Poeni:</b> na kraju partija 1–4 svaki igrač sabira broj uništenih protivničkih baza i završenih misija u svom victory pile-u.</li>
          <li><b>Upgraded starteri:</b> poene trošiš na upgraded starter karte svoje frakcije (cene od 1 do 5). Svaka kupljena karta <b>zamenjuje</b> jednu kartu iz starter špila - špil uvek ima 10 karata, ali postaje jači.</li>
          <li><b>Galaxy deck:</b> između partija menjaš karte iz galaxy deck-a osvojenim reinforcement kartama, pa je svaka kampanja drugačija.</li>
          <li><b>Pobeda:</b> ko u <b>5. partiji</b> uništi <b>5 protivničkih baza</b>, osvaja kampanju.</li>
        </ul>
        <div class="note">Detalje kampanje (cene, koliko karata se menja u galaxy deck-u, podešavanje baza) proveri u pravilniku iz kutije - FFG ih nije javno objavio.</div>`
    },
    {
      id: "swr-saveti",
      title: "Saveti",
      html: `
        <ul>
          <li><b>Misija je investicija:</b> resursi uloženi u nju ne kupuju karte iz galaxy row-a tog poteza - ali reinforcement karte su među najjačim u igri.</li>
          <li><b>Nagrada ide na vrh špila:</b> završi misiju pred kraj poteza i sledećeg poteza verovatno vučeš nagradu.</li>
          <li><b>Biraj misiju prema planu:</b> od dve otkrivene zadrži onu čija nagrada najviše pomaže tvom trenutnom špilu.</li>
          <li><b>U kampanji</b> neki igrači sve poene troše na jedan skupi capital ship, a drugi na više jeftinih jedinica - oba pristupa rade.</li>
        </ul>
        <p class="muted small">Saveti nisu deo zvaničnih pravila (poslednji je iz članka dizajnera).</p>`
    }
  ],

  glossary: [
    { term: "Mission card", group: "Rebel & Empire Reinforcements", def: "Nova vrsta karte. Ulažeš resurse u nju; kad ih ima koliko je mission value, dobijaš njenu reinforcement kartu." },
    { term: "Mission value", group: "Rebel & Empire Reinforcements", def: "Broj na dnu mission karte - koliko resursa treba uložiti da bi se završila." },
    { term: "Mission deck", group: "Rebel & Empire Reinforcements", def: "Promešane mission karte tvoje frakcije; otkrivaš po 2 kad nemaš otvorenu misiju." },
    { term: "Reinforcement card", group: "Rebel & Empire Reinforcements", def: "Moćna jedinica ili brod koji se ne meša u galaxy deck; osvaja se misijom i ide na vrh tvog špila." },
    { term: "Upgraded starter card", group: "Rebel & Empire Reinforcements", def: "Jača zamena za starter karte; koristi se u kampanji i u Upgraded Starter modu." },
    { term: "Campaign points", group: "Rebel & Empire Reinforcements", def: "Posle partija 1–4: uništene baze + završene misije; troše se na upgraded startere." }
  ],

  sources: [
    { label: "FFG: Rebels and Imperials (najava)", url: "https://www.fantasyflightgames.com/rebels-and-imperials/" },
    { label: "FFG: A Fresh Start (Caleb Grace o Upgraded Starter modu)", url: "https://www.fantasyflightgames.com/a-fresh-start/" },
    { label: "FFG: stranica proizvoda", url: "https://www.fantasyflightgames.com/product/rebels-empire-reinforcements-expansion/" }
  ]
});
})();
