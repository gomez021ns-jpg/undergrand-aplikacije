// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Broj se NE piše rukom (isto pravilo kao u Bronxampu, korisnik 7. 11. 2026): verzija je 0.Y.Z, gde je
// Y broj svih novih stvari od početka, a Z broj svih dorada i ispravki; nijedan se ne vraća na nulu.
// Računa ga `numerisi` iz spiskova `nove` i `dorade` — zato se brojevi starih verzija menjaju ako se stavka prekategorizuje.
// Nov unos ide NA VRH liste: datum, `nove` (šta je novo) i `dorade` (dorade i ispravke); oznaka vrste se računa sama.
(() => {
  const VERZIJE = [
    { datum: "2026-10-28",
      nove: [
        "Novi naziv aplikacije: UnderGRAND Društvene igre (u naslovu prozora i na prečici na desktopu).",
      ],
      dorade: [] },
    { datum: "2026-10-21",
      nove: [
        "Star Wars: Unlimited - Shadows of the Galaxy Two-Player Starter je stigao: oznaka „Stiže“ je sklonjena i dodatak se vodi kao deo kolekcije.",
      ],
      dorade: [] },
    { datum: "2026-10-18",
      nove: [
        "Novi dodatak za Riftbound: Unleashed - Champion Deck: Vi. Šta je u kutiji, kako se igra Vi (ključne karte, plan napada i šema), objašnjenje „viška štete“ na kome počiva špil, sa šemom i čestim situacijama, i spisak svih karata.",
      ],
      dorade: [] },
    { datum: "2026-10-14",
      nove: [],
      dorade: [
        "Nova ikonica u stilu ostalih UnderGRAND aplikacija: karte i kockica na tamnoj pločici sa narandžastim okvirom (i na prečici na desktopu i na kartici pregledača).",
      ] },
    { datum: "2026-10-14",
      nove: [],
      dorade: [
        "„Šta je novo“: najnovija verzija je sada na vrhu, a ispod sve starije.",
      ] },
    { datum: "2026-10-07",
      nove: [
        "Novo dugme „Pun ekran“ u gornjem desnom uglu: aplikacija se prikazuje preko celog ekrana, a dugme tada postaje „Izađi“ (radi i taster Esc).",
        "Nova prečica na desktopu „Moje društvene igre (pun ekran)“: otvara aplikaciju u Edge-u kao zaseban prozor, odmah preko celog ekrana (izlaz tasterom F11).",
      ],
      dorade: [] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Dugmad su sada kao u Statistici: blagi preliv i mala „dubina“ ispod, pri kliku se spuste; glavno dugme (Štampaj / PDF) je narandžasto. Isto važi za Podsetnik i Štampaj na karticama.",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Nove, šire slike za The Mandalorian: Adventures, Star Wars: Unlimited i Worms - lepo staju i na kartici i na stranici igre.",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Slike igara se više ne seku u usku traku: na kartici u kolekciji je slika u formatu 16:9, a na stranici igre se vidi cela, sa zamućenom istom slikom kao pozadinom sa strane.",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Slike za Riftbound, Star Wars: The Deckbuilding Game, Star Wars: Unlimited, The Mandalorian: Adventures i Worms - na kartici u kolekciji i na vrhu stranice igre, isečene tako da se vidi naziv igre.",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Umesto dugačke crte (—) svuda u tekstovima igara i aplikacije stoji obična crtica (-).",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Opis igre na vrhu stranice koristi celu širinu pored dugmeta Štampaj / PDF - umesto uskog stubca sada staje u dva reda.",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Uklonjen natpis „Otvori pravila →“ sa kartica (na užim karticama se sekao, a nije bio potreban): klik bilo gde na karticu otvara pravila, a kartica se pri prelasku mišem podigne i dobije okvir u boji igre.",
      ] },
    { datum: "2026-10-07",
      nove: [
        "Moderniji izgled kolekcije: svaka igra ima omot u svojoj boji sa monogramom (npr. SWU) i ikonicom vrste igre; kad dodaš fotografiju kutije, ona stoji umesto toga.",
      ],
      dorade: [
        "Kartice su iste visine; na svakoj su prečice Podsetnik i Štampaj (štampa brzog podsetnika bez otvaranja igre), a pri prelasku mišem piše „Otvori pravila →“.",
        "Gornji deo je kompaktniji: brojači (igre, dodaci, lista želja) i pretraga sa lupom u istom redu. Lista želja je prigušena, sa oznakom ♥ Želim. Strana je šira - na velikom ekranu staje 4 igre u red.",
      ] },
    { datum: "2026-10-07",
      nove: [
        "Novi izgled u stilu UnderGRAND aplikacija: zaglavlje sa UnderGRAND logom, nazivom DRUŠTVENE IGRE i sloganom, iste boje kao ostale aplikacije (narandžasti akcenat), oblija dugmad i tabovi kao pilule, tema se menja ikonicom sunca ili meseca.",
      ],
      dorade: [] },
    { datum: "2026-10-06",
      nove: [
        "Novi dodatak za Star Wars: Unlimited: Shadows of the Galaxy - Two-Player Starter (označen kao „Stiže“). Oba špila - The Mandalorian i Moff Gideon - sa liderima, bazama i savetima za igru, nove mehanike Capture, Bounty i Smuggle sa šemom, i u kojim formatima važe karte.",
      ],
      dorade: [] },
    { datum: "2026-10-06",
      nove: [],
      dorade: [
        "Star Wars: Unlimited je prebačen sa liste želja u kolekciju.",
      ] },
    { datum: "2026-10-06",
      nove: [
        "Riftbound: novo, detaljno poglavlje o igranju karata - četiri stanja poteza, Priority i Focus, chain korak po korak, sa dve nove šeme i primerom.",
        "Riftbound: nova poglavlja „Primer partije: prva dva poteza“ i „Česte situacije (FAQ)“; ključne reči kasnijih setova su razvrstane po setovima (Spiritforged, Unleashed).",
        "Star Wars: The Deckbuilding Game: novo poglavlje „2v2 - igra za četvoro“ po zvaničnim pravilima, sa šemom stola, čestim pitanjima i objašnjenjem karata u igri u timovima.",
        "Nova kartica „Kućna pravila“ kod svake igre - za vaše dogovore; ulazi i u štampu punih pravila.",
      ],
      dorade: [
        "Riftbound: ispravka - Reaction karta se u protivnikovom potezu igra samo kao odgovor (kad postoji chain) ili u showdown-u, ne „bilo kad“. Ispravljeno i u brzom podsetniku.",
      ] },
    { datum: "2026-10-06",
      nove: [
        "Nova „Lista želja“ na početnoj strani: igre koje još nemaš su u posebnom odeljku i ne broje se u kolekciju. Tamo su za sada Star Wars: Unlimited i Flesh and Blood - pravila ostaju spremna.",
      ],
      dorade: [] },
    { datum: "2026-10-06",
      nove: [],
      dorade: [
        "Brojevi verzija sada pokazuju veličinu promene (X.Y.Z): prvi broj raste za novi veliki deo aplikacije, drugi za novu igru, dodatak ili funkciju, treći za doradu ili ispravku. Cela istorija je prenumerisana, a uz svaku verziju piše Novi deo, Novo ili Dorada.",
      ] },
    { datum: "2026-10-04",
      nove: [
        "Oznaka trenutne verzije u gornjoj traci; klik na nju otvara ovaj spisak izmena, od prve verzije do najnovije.",
      ],
      dorade: [] },
    { datum: "2026-10-03",
      nove: [],
      dorade: [
        "Aplikacija je premeštena u svoj folder (igre), kao i ostale aplikacije; prečica na desktopu je prepravljena.",
      ] },
    { datum: "2026-10-02",
      nove: [
        "Nova igra: Flesh and Blood - opšta pravila po Comprehensive Rules 2.15.0: brzi podsetnik, 9 poglavlja, 5 šema (izgled karte, zone, potez, borba, pitch), 25 ključnih reči i formati igre.",
      ],
      dorade: [] },
    { datum: "2026-09-30",
      nove: [
        "Novi dodatak za Star Wars: The Deckbuilding Game: Rebel & Empire Reinforcements - misije i reinforcement karte, Upgraded Starter mod, kampanja od 5 partija, dve šeme.",
      ],
      dorade: [
        "Nepotvrđeni detalji (broj misija po partiji, detalji kampanje) su označeni dok ne stigne pravilnik iz kutije.",
      ] },
    { datum: "2026-09-30",
      nove: [],
      dorade: [
        "Ikonica aplikacije (karte i kockica) i prečica „Moje društvene igre“ na desktopu; ista ikonica i na kartici pregledača.",
      ] },
    { datum: "2026-09-30",
      nove: [
        "Nova igra: Star Wars: Unlimited - Spark of Rebellion (Quickstart + Comprehensive Rules 8.0): brzi podsetnik, 10 poglavlja, 4 šeme, 26 ključnih reči.",
      ],
      dorade: [] },
    { datum: "2026-09-29",
      nove: [
        "Nova igra: The Mandalorian: Adventures - brzi podsetnik, 12 poglavlja, šema action slotova; pravila koja Guide Deck otkriva kasnije su u posebnom poglavlju sa upozorenjem o spojlerima.",
      ],
      dorade: [] },
    { datum: "2026-09-29",
      nove: [
        "Nova igra: Worms: The Board Game, po konačnom pravilniku (24 str.): brzi podsetnik, 13 poglavlja, šema poteza i mreže heksova, 34 ključne reči.",
      ],
      dorade: [] },
    { datum: "2026-09-29",
      nove: [
        "Nova igra: Star Wars: The Deckbuilding Game, po zvaničnom FFG pravilniku: brzi podsetnik, 16 poglavlja, 6 šema, 29 ključnih reči.",
      ],
      dorade: [
        "Ispravka: na početnoj strani piše „2 igre“ umesto „2 igara“ (i množina za dodatke).",
      ] },
    { datum: "2026-09-29",
      nove: [
        "Prvi dodatak: Riftbound Vendetta - Showdown Decks Zed vs Shen (sadržaj kutije, oba špila, nove mehanike, spiskovi karata).",
        "Štampa ima i opciju „Samo dodaci“; ključne reči dodatka su u posebnoj grupi.",
      ],
      dorade: [] },
    { datum: "2026-09-29",
      nove: [
        "Riftbound: novo poglavlje „Karte: vrste, izgled i namena“ sa šemom svih vrsta karata i šemom „Kako se čita karta“.",
        "Brzi podsetnik ima karticu „Vrste karata“ i i dalje staje na jednu A4 stranu.",
      ],
      dorade: [] },
    { datum: "2026-09-29",
      nove: [
        "Šeme u pravilima (za Riftbound 6: sto, potez, rune, kretanje, dolazak na battlefield, primer borbe); prate svetlu/tamnu temu i štampu.",
        "Mesto za fotografiju kutije igre.",
      ],
      dorade: [] },
    { datum: "2026-09-29",
      nove: [
        "Prva verzija: kolekcija igara sa pretragom i Riftbound (osnovna igra) - brzi podsetnik na jednoj A4 strani, puna pravila sa pretragom i ključne reči.",
        "Štampa u PDF, svetla i tamna tema, radi i na telefonu.",
      ],
      dorade: [] },
  ];

  // 0.Y.Z iz cele istorije (kao u Bronxampu): Y = sve novo, Z = sve dorade; nikad se ne vraća na nulu.
  let novih = 0, dorada = 0;
  for (let i = VERZIJE.length - 1; i >= 0; i--) {
    novih += VERZIJE[i].nove.length;
    dorada += VERZIJE[i].dorade.length;
    VERZIJE[i].v = `0.${novih}.${dorada}`;
  }
  const linije = (x) => [...x.nove, ...x.dorade];

  window.APP_VERZIJA = VERZIJE[0].v;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtDate = (d) => { const [y, m, dd] = d.split("-"); return `${+dd}. ${+m}. ${y}.`; };

  // Vrsta promene iz spiskova (Novo / Dorada / oboje), kao u Bronxampu.
  function tip(x, prev) {
    if (!prev) return ["t-x", "Prva verzija"];
    if (x.nove.length && x.dorade.length) return ["t-y", "Novo i dorada"];
    return x.nove.length ? ["t-y", "Novo"] : ["t-z", "Dorada"];
  }

  function open() {
    let dlg = document.getElementById("ver-dlg");
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.id = "ver-dlg";
      dlg.className = "ver-dlg";
      dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-ver-close]")) dlg.close(); });
      document.body.append(dlg);
    }
    // Zaglavlje stoji, pomera se samo spisak; najnovija verzija je na vrhu, ispod sve starije (korisnikova želja, 14. 10. 2026).
    dlg.innerHTML = `<div class="ver-top">
        <div class="ver-h"><h2>Šta je novo</h2><button type="button" class="ver-x" data-ver-close aria-label="Zatvori">×</button></div>
        <p class="ver-cur">Trenutna verzija: <b>${esc(VERZIJE[0].v)}</b> · ${fmtDate(VERZIJE[0].datum)}</p>
      </div>
      <div class="ver-list">
      ${VERZIJE.map((x, i) => ({ x, t: tip(x, VERZIJE[i + 1]) })).map(({ x, t }) => `<section class="ver-item">
        <h3>Verzija ${esc(x.v)} <span class="ver-tip ${t[0]}">${t[1]}</span> <span>${fmtDate(x.datum)}</span></h3>
        <ul>${linije(x).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      </section>`).join("")}
      </div>`;
    dlg.showModal();
  }

  document.addEventListener("click", (e) => { if (e.target.closest("[data-verzije]")) open(); });
  // Dugme iz statičkog HTML-a dobija broj verzije; aplikacije koje same crtaju zaglavlje koriste window.APP_VERZIJA.
  document.querySelectorAll("[data-verzije]").forEach((el) => { if (!el.textContent.trim()) el.textContent = `v${VERZIJE[0].v}`; });
})();
