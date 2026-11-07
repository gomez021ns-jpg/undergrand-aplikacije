// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Broj se NE piše rukom (isto pravilo kao u Bronxampu, korisnik 7. 11. 2026): verzija je 0.Y.Z, gde je
// Y broj svih novih stvari od početka, a Z broj svih dorada i ispravki; nijedan se ne vraća na nulu.
// Računa ga `numerisi` iz spiskova `nove` i `dorade` — zato se brojevi starih verzija menjaju ako se stavka prekategorizuje.
// Nov unos ide NA VRH liste: datum, `nove` (šta je novo) i `dorade` (dorade i ispravke); oznaka vrste se računa sama.
(() => {
  const VERZIJE = [
    { datum: "2026-10-29",
      nove: [],
      dorade: [
        "Ispravka: Evroligina tabela i lideri povremeno su javljali „Ne mogu da učitam podatke“. Sada stižu sa Evroliginog izvora koji uvek dozvoljava učitavanje, pa greška ne bi trebalo da se ponavlja.",
      ] },
    { datum: "2026-10-28",
      nove: [],
      dorade: [
        "Novi naziv aplikacije: UnderGRAND Sport (u naslovu prozora i na prečici na desktopu).",
      ] },
    { datum: "2026-10-27",
      nove: [
        "NBA i Evroliga: nova kartica „Lideri“ - top 10 igrača sezone po kategorijama, sa slikom igrača i ekipom. NBA: poeni, skokovi, asistencije, ukradene lopte, blokade, pogođene trojke, double-double i minuti. Evroliga (zvanični podaci): poeni, skokovi, asistencije, indeks (PIR), ukradene lopte, blokade, šut za 3 i za 2, uz broj odigranih utakmica.",
        "Na Pregledu paneli NBA i Evrolige prikazuju i tri najbolja strelca, sa linkom ka svim liderima.",
      ],
      dorade: [
        "Evroliga: imena kao „TJ Shorts“ i „Wade Baldwin IV“ se sada pišu ispravno (i u Detaljima utakmice).",
      ] },
    { datum: "2026-10-14",
      nove: [],
      dorade: [
        "Nova ikonica u stilu ostalih UnderGRAND aplikacija: narandžasta lopta na tamnoj pločici sa narandžastim okvirom (i na prečici na desktopu i na kartici pregledača).",
      ] },
    { datum: "2026-10-14",
      nove: [],
      dorade: [
        "„Šta je novo“: najnovija verzija je sada na vrhu, a ispod sve starije.",
      ] },
    { datum: "2026-10-14",
      nove: [
        "Paneli liga na Pregledu zasvetle u boji lige kad se pređe mišem, umesto podvlačenja naslova; linija ispod naslova je mekša i postepeno se gubi.",
      ],
      dorade: [
        "Nova ikonica F1 bolida (crvena, iste veličine kao ikonice ostalih liga) u navigaciji, panelu i karticama.",
      ] },
    { datum: "2026-10-14",
      nove: [
        "Novi izgled: sportski baner je pozadina zaglavlja UnderGRAND SPORT, a stranica koristi celu širinu ekrana.",
        "Navigacija: sedam jednakih dugmadi u jednom redu (Pregled i svih šest liga), sa ikonicom i svetlećim obrubom u boji lige; izabrano dugme je narandžasto.",
        "Na vrhu Pregleda su kartice „Uživo sada“ sa utakmicama i F1 sesijama u toku (rezultat, poeni po četvrtinama, minut ili krug); kad ništa ne traje, „Uskoro“ sa narednim događajima. Klik na karticu otvara „Detalji“.",
        "Paneli liga na Pregledu sada imaju i vrh tabele (prvih 5, kod NFL-a i NBA po 3 iz svake konferencije), uz poslednje rezultate i naredne utakmice.",
        "Svaki sport ima svoj vizual iz banera (bolid, lopte) u karticama, panelima i zaglavlju stranice lige. Sve radi u tamnoj i svetloj temi.",
      ],
      dorade: [] },
    { datum: "2026-10-10",
      nove: [
        "Premijer liga i Liga šampiona: „Detalji“ na utakmici sada otvaraju prozor u aplikaciji - rezultat po poluvremenima, tok utakmice (golovi sa međurezultatom i asistentom, autogolovi, penali, žuti i crveni kartoni, izmene; domaćin levo, gost desno), statistika ekipa (posed lopte, šutevi, korneri, pasovi...), najbolji igrači, postave sa formacijom i klupom, i komentar minut po minut.",
        "Tokom utakmice prozor se sam osvežava na 30 s, a postave i poslednji komentari su odmah otvoreni. Pre utakmice: vreme, stadion i postave čim budu objavljene.",
      ],
      dorade: [] },
    { datum: "2026-10-08",
      nove: [
        "NBA: „Detalji“ na utakmici sada otvaraju prozor u aplikaciji - rezultat po četvrtinama, najbolji igrači (poeni, skokovi, asistencije), statistika ekipa (šut, skokovi, asistencije, izgubljene lopte, poeni iz kontre i u reketu...) i statistika svakog igrača.",
        "Tokom utakmice prozor se sam osvežava na 30 s: šansa za pobedu i poslednje akcije na vrhu.",
        "U statistici igrača (NBA i Evroliga) izgubljene lopte su sada „IL“, da se ne mešaju sa šutem iz igre.",
      ],
      dorade: [] },
    { datum: "2026-10-08",
      nove: [
        "Evroliga: „Detalji“ na utakmici sada otvaraju prozor u aplikaciji - rezultat po četvrtinama, najbolji igrači (poeni, skokovi, asistencije, indeks), statistika ekipa (šut za 2 i 3, slobodna bacanja, skokovi, izgubljene lopte...) i statistika svakog igrača, uz trenere, sudije i broj gledalaca.",
        "Tokom utakmice prozor se sam osvežava na 30 s: tekuća četvrtina i preostalo vreme, poslednje akcije na vrhu, lične greške ekipa i igrači koji su trenutno na terenu.",
      ],
      dorade: [] },
    { datum: "2026-10-07",
      nove: [
        "Novo dugme „Pun ekran“ u gornjem desnom uglu: aplikacija se prikazuje preko celog ekrana, a dugme tada postaje „Izađi“ (radi i taster Esc).",
        "Nova prečica na desktopu „Sportski centar (pun ekran)“: otvara aplikaciju u Edge-u kao zaseban prozor, odmah preko celog ekrana (izlaz tasterom F11).",
      ],
      dorade: [] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Ispravka: spisak za izbor kola, nedelje ili dana otvarao se sa belom pozadinom i skoro nevidljivim slovima. Sada je u bojama aplikacije, a izabrano kolo je istaknuto.",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Dugmad su sada kao u ostalim UnderGRAND aplikacijama: blagi preliv i mala „dubina“ ispod, pri kliku se spuste (strelice i izbor dana/kola, zatvaranje prozora utakmice).",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "U tekstovima aplikacije umesto dugačke crte sada stoji obična crtica (-), kao i u ostalim aplikacijama.",
      ] },
    { datum: "2026-10-07",
      nove: [
        "Novi izgled u stilu UnderGRAND aplikacija: zaglavlje sa UnderGRAND logom, nazivom SPORT i sloganom, iste boje kao ostale aplikacije (narandžasti akcenat), lige i kartice kao pilule, tema se menja ikonicom sunca ili meseca. Boje liga ostaju kao oznake.",
      ],
      dorade: [] },
    { datum: "2026-10-06",
      nove: [],
      dorade: [
        "Brojevi verzija sada pokazuju veličinu promene (X.Y.Z): prvi broj raste za novi veliki deo aplikacije, drugi za novu funkciju (npr. nova liga), treći za doradu ili ispravku. Cela istorija je prenumerisana, a uz svaku verziju piše Novi deo, Novo ili Dorada.",
      ] },
    { datum: "2026-10-04",
      nove: [],
      dorade: [
        "Ispravka: Evroliga je javljala „Ne mogu da učitam podatke“ kad se aplikacija otvori preko prečice ili duplim klikom. Raspored i rezultati sada stižu sa drugog zvaničnog Evroliginog izvora, koji radi u svim slučajevima.",
      ] },
    { datum: "2026-10-04",
      nove: [
        "NFL: „Detalji“ na utakmici sada otvaraju prozor u aplikaciji umesto ESPN-a - rezultat po četvrtinama, poeni sa opisom akcija, najbolji igrači (pas, trčanje, hvatanje), statistika ekipa i igrača.",
        "Tokom utakmice prozor se sam osvežava na 30 s i prikazuje šansu za pobedu i napad u toku. Link ka ESPN-u je i dalje u dnu prozora.",
      ],
      dorade: [] },
    { datum: "2026-10-04",
      nove: [],
      dorade: [
        "F1: završena trka više ne izgleda kao da nije održana dok se čekaju zvanični rezultati. Odmah posle trke prikazuje se nezvaničan rezultat (pobednik u kalendaru, ceo poredak u detaljima trke, podijum kao „Poslednja trka“ na početnoj), sa oznakom „nezvanično“; zvanični rezultati i bodovi ga zamene čim budu objavljeni.",
        "F1 šampionat: tačan broj trka posle kojih važi tabela i napomena kad bodovi za poslednju trku još nisu uračunati.",
      ] },
    { datum: "2026-10-04",
      nove: [
        "F1 uživo: nova kartica „Uživo“ sa poretkom u realnom vremenu - razmak do vođe, interval, krugovi, poslednji i najbolji krug, gume, boks, stanje staze (žuta/crvena zastava, sigurnosni automobil) i poruke sudija.",
        "Dok traje trening, kvalifikacije ili trka, na početnoj strani u F1 delu je prvih pet vozača uživo.",
        "Izvor je zvanični F1 live timing, bez ključa i bez dodatnog programa.",
      ],
      dorade: [] },
    { datum: "2026-10-04",
      nove: [
        "Oznaka trenutne verzije u gornjoj traci; klik na nju otvara ovaj spisak izmena, od prve verzije do najnovije.",
      ],
      dorade: [] },
    { datum: "2026-10-04",
      nove: [],
      dorade: [
        "Ispravka NBA tabele: u pripremnom periodu prikazivala je rezultate pripremnih utakmica. Sada je uvek tabela regularnog dela; dok on ne počne, timovi su po abecedi, bez zona za plej-of.",
        "Isto podešeno i za NFL, da se greška ne ponovi sledećeg leta.",
      ] },
    { datum: "2026-10-03",
      nove: [
        "Nove lige: Premijer liga i Liga šampiona - raspored i rezultati po kolima (otvara se tekuće kolo) i tabele sa bojama zona.",
        "Liga šampiona: ligaška faza sa 36 klubova; nokaut faze dobijaju imena (baraž, osmina finala…) i oznaku 1. ili 2. meča.",
      ],
      dorade: [] },
    { datum: "2026-10-03",
      nove: [],
      dorade: [
        "Ikonica (narandžasta lopta) i prečica „Sportski centar“ na desktopu; ista ikonica i na kartici pregledača.",
      ] },
    { datum: "2026-10-03",
      nove: [
        "Prva verzija: pregled sa poslednjim rezultatima, utakmicama u toku i narednim utakmicama za svaku ligu.",
        "F1 (kalendar, satnica po lokalnom vremenu, rezultati trke, sprinta i kvalifikacija, šampionat), NFL (po nedeljama, tabela po divizijama), NBA (po danima, tabela po konferencijama) i Evroliga (po kolima, tabela sa formom).",
        "Utakmice u toku se same osvežavaju na 30 s; svetla i tamna tema, prilagođeno telefonu.",
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
