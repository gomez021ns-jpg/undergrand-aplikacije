// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Svaka izmena za korisnika = nov unos NA VRH liste, sa datumom i brojem X.Y.Z po veličini promene:
// X = novi veliki deo aplikacije, Y = nova funkcija, Z = dorada ili ispravka (manji brojevi se tada vraćaju na 0).
// Oznaka vrste (Novi deo / Novo / Dorada) računa se sama iz broja.
(() => {
  const VERZIJE = [
    { v: "1.9.1", datum: "2026-10-28", izmene: [
      "Novi naziv aplikacije: UnderGRAND Sport (u naslovu prozora i na prečici na desktopu).",
    ] },
    { v: "1.9.0", datum: "2026-10-27", izmene: [
      "NBA i Evroliga: nova kartica „Lideri“ - top 10 igrača sezone po kategorijama, sa slikom igrača i ekipom. NBA: poeni, skokovi, asistencije, ukradene lopte, blokade, pogođene trojke, double-double i minuti. Evroliga (zvanični podaci): poeni, skokovi, asistencije, indeks (PIR), ukradene lopte, blokade, šut za 3 i za 2, uz broj odigranih utakmica.",
      "Na Pregledu paneli NBA i Evrolige prikazuju i tri najbolja strelca, sa linkom ka svim liderima.",
      "Evroliga: imena kao „TJ Shorts“ i „Wade Baldwin IV“ se sada pišu ispravno (i u Detaljima utakmice).",
    ] },
    { v: "1.8.3", datum: "2026-10-14", izmene: [
      "Nova ikonica u stilu ostalih UnderGRAND aplikacija: narandžasta lopta na tamnoj pločici sa narandžastim okvirom (i na prečici na desktopu i na kartici pregledača).",
    ] },
    { v: "1.8.2", datum: "2026-10-14", izmene: [
      "„Šta je novo“: najnovija verzija je sada na vrhu, a ispod sve starije.",
    ] },
    { v: "1.8.1", datum: "2026-10-14", izmene: [
      "Paneli liga na Pregledu zasvetle u boji lige kad se pređe mišem, umesto podvlačenja naslova; linija ispod naslova je mekša i postepeno se gubi.",
      "Nova ikonica F1 bolida (crvena, iste veličine kao ikonice ostalih liga) u navigaciji, panelu i karticama.",
    ] },
    { v: "1.8.0", datum: "2026-10-14", izmene: [
      "Novi izgled: sportski baner je pozadina zaglavlja UnderGRAND SPORT, a stranica koristi celu širinu ekrana.",
      "Navigacija: sedam jednakih dugmadi u jednom redu (Pregled i svih šest liga), sa ikonicom i svetlećim obrubom u boji lige; izabrano dugme je narandžasto.",
      "Na vrhu Pregleda su kartice „Uživo sada“ sa utakmicama i F1 sesijama u toku (rezultat, poeni po četvrtinama, minut ili krug); kad ništa ne traje, „Uskoro“ sa narednim događajima. Klik na karticu otvara „Detalji“.",
      "Paneli liga na Pregledu sada imaju i vrh tabele (prvih 5, kod NFL-a i NBA po 3 iz svake konferencije), uz poslednje rezultate i naredne utakmice.",
      "Svaki sport ima svoj vizual iz banera (bolid, lopte) u karticama, panelima i zaglavlju stranice lige. Sve radi u tamnoj i svetloj temi.",
    ] },
    { v: "1.7.0", datum: "2026-10-10", izmene: [
      "Premijer liga i Liga šampiona: „Detalji“ na utakmici sada otvaraju prozor u aplikaciji - rezultat po poluvremenima, tok utakmice (golovi sa međurezultatom i asistentom, autogolovi, penali, žuti i crveni kartoni, izmene; domaćin levo, gost desno), statistika ekipa (posed lopte, šutevi, korneri, pasovi...), najbolji igrači, postave sa formacijom i klupom, i komentar minut po minut.",
      "Tokom utakmice prozor se sam osvežava na 30 s, a postave i poslednji komentari su odmah otvoreni. Pre utakmice: vreme, stadion i postave čim budu objavljene.",
    ] },
    { v: "1.6.0", datum: "2026-10-08", izmene: [
      "NBA: „Detalji“ na utakmici sada otvaraju prozor u aplikaciji - rezultat po četvrtinama, najbolji igrači (poeni, skokovi, asistencije), statistika ekipa (šut, skokovi, asistencije, izgubljene lopte, poeni iz kontre i u reketu...) i statistika svakog igrača.",
      "Tokom utakmice prozor se sam osvežava na 30 s: šansa za pobedu i poslednje akcije na vrhu.",
      "U statistici igrača (NBA i Evroliga) izgubljene lopte su sada „IL“, da se ne mešaju sa šutem iz igre.",
    ] },
    { v: "1.5.0", datum: "2026-10-08", izmene: [
      "Evroliga: „Detalji“ na utakmici sada otvaraju prozor u aplikaciji - rezultat po četvrtinama, najbolji igrači (poeni, skokovi, asistencije, indeks), statistika ekipa (šut za 2 i 3, slobodna bacanja, skokovi, izgubljene lopte...) i statistika svakog igrača, uz trenere, sudije i broj gledalaca.",
      "Tokom utakmice prozor se sam osvežava na 30 s: tekuća četvrtina i preostalo vreme, poslednje akcije na vrhu, lične greške ekipa i igrači koji su trenutno na terenu.",
    ] },
    { v: "1.4.0", datum: "2026-10-07", izmene: [
      "Novo dugme „Pun ekran“ u gornjem desnom uglu: aplikacija se prikazuje preko celog ekrana, a dugme tada postaje „Izađi“ (radi i taster Esc).",
      "Nova prečica na desktopu „Sportski centar (pun ekran)“: otvara aplikaciju u Edge-u kao zaseban prozor, odmah preko celog ekrana (izlaz tasterom F11).",
    ] },
    { v: "1.3.6", datum: "2026-10-07", izmene: [
      "Ispravka: spisak za izbor kola, nedelje ili dana otvarao se sa belom pozadinom i skoro nevidljivim slovima. Sada je u bojama aplikacije, a izabrano kolo je istaknuto.",
    ] },
    { v: "1.3.5", datum: "2026-10-07", izmene: [
      "Dugmad su sada kao u ostalim UnderGRAND aplikacijama: blagi preliv i mala „dubina“ ispod, pri kliku se spuste (strelice i izbor dana/kola, zatvaranje prozora utakmice).",
    ] },
    { v: "1.3.4", datum: "2026-10-07", izmene: [
      "U tekstovima aplikacije umesto dugačke crte sada stoji obična crtica (-), kao i u ostalim aplikacijama.",
    ] },
    { v: "1.3.3", datum: "2026-10-07", izmene: [
      "Novi izgled u stilu UnderGRAND aplikacija: zaglavlje sa UnderGRAND logom, nazivom SPORT i sloganom, iste boje kao ostale aplikacije (narandžasti akcenat), lige i kartice kao pilule, tema se menja ikonicom sunca ili meseca. Boje liga ostaju kao oznake.",
    ] },
    { v: "1.3.2", datum: "2026-10-06", izmene: [
      "Brojevi verzija sada pokazuju veličinu promene (X.Y.Z): prvi broj raste za novi veliki deo aplikacije, drugi za novu funkciju (npr. nova liga), treći za doradu ili ispravku. Cela istorija je prenumerisana, a uz svaku verziju piše Novi deo, Novo ili Dorada.",
    ] },
    { v: "1.3.1", datum: "2026-10-04", izmene: [
      "Ispravka: Evroliga je javljala „Ne mogu da učitam podatke“ kad se aplikacija otvori preko prečice ili duplim klikom. Raspored i rezultati sada stižu sa drugog zvaničnog Evroliginog izvora, koji radi u svim slučajevima.",
    ] },
    { v: "1.3.0", datum: "2026-10-04", izmene: [
      "NFL: „Detalji“ na utakmici sada otvaraju prozor u aplikaciji umesto ESPN-a - rezultat po četvrtinama, poeni sa opisom akcija, najbolji igrači (pas, trčanje, hvatanje), statistika ekipa i igrača.",
      "Tokom utakmice prozor se sam osvežava na 30 s i prikazuje šansu za pobedu i napad u toku. Link ka ESPN-u je i dalje u dnu prozora.",
    ] },
    { v: "1.2.1", datum: "2026-10-04", izmene: [
      "F1: završena trka više ne izgleda kao da nije održana dok se čekaju zvanični rezultati. Odmah posle trke prikazuje se nezvaničan rezultat (pobednik u kalendaru, ceo poredak u detaljima trke, podijum kao „Poslednja trka“ na početnoj), sa oznakom „nezvanično“; zvanični rezultati i bodovi ga zamene čim budu objavljeni.",
      "F1 šampionat: tačan broj trka posle kojih važi tabela i napomena kad bodovi za poslednju trku još nisu uračunati.",
    ] },
    { v: "1.2.0", datum: "2026-10-04", izmene: [
      "F1 uživo: nova kartica „Uživo“ sa poretkom u realnom vremenu - razmak do vođe, interval, krugovi, poslednji i najbolji krug, gume, boks, stanje staze (žuta/crvena zastava, sigurnosni automobil) i poruke sudija.",
      "Dok traje trening, kvalifikacije ili trka, na početnoj strani u F1 delu je prvih pet vozača uživo.",
      "Izvor je zvanični F1 live timing, bez ključa i bez dodatnog programa.",
    ] },
    { v: "1.1.2", datum: "2026-10-04", izmene: [
      "Oznaka trenutne verzije u gornjoj traci; klik na nju otvara ovaj spisak izmena, od prve verzije do najnovije.",
    ] },
    { v: "1.1.1", datum: "2026-10-04", izmene: [
      "Ispravka NBA tabele: u pripremnom periodu prikazivala je rezultate pripremnih utakmica. Sada je uvek tabela regularnog dela; dok on ne počne, timovi su po abecedi, bez zona za plej-of.",
      "Isto podešeno i za NFL, da se greška ne ponovi sledećeg leta.",
    ] },
    { v: "1.1.0", datum: "2026-10-03", izmene: [
      "Nove lige: Premijer liga i Liga šampiona - raspored i rezultati po kolima (otvara se tekuće kolo) i tabele sa bojama zona.",
      "Liga šampiona: ligaška faza sa 36 klubova; nokaut faze dobijaju imena (baraž, osmina finala…) i oznaku 1. ili 2. meča.",
    ] },
    { v: "1.0.1", datum: "2026-10-03", izmene: [
      "Ikonica (narandžasta lopta) i prečica „Sportski centar“ na desktopu; ista ikonica i na kartici pregledača.",
    ] },
    { v: "1.0.0", datum: "2026-10-03", izmene: [
      "Prva verzija: pregled sa poslednjim rezultatima, utakmicama u toku i narednim utakmicama za svaku ligu.",
      "F1 (kalendar, satnica po lokalnom vremenu, rezultati trke, sprinta i kvalifikacija, šampionat), NFL (po nedeljama, tabela po divizijama), NBA (po danima, tabela po konferencijama) i Evroliga (po kolima, tabela sa formom).",
      "Utakmice u toku se same osvežavaju na 30 s; svetla i tamna tema, prilagođeno telefonu.",
    ] },
  ];

  window.APP_VERZIJA = VERZIJE[0].v;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtDate = (d) => { const [y, m, dd] = d.split("-"); return `${+dd}. ${+m}. ${y}.`; };

  // Vrsta promene iz broja verzije, u odnosu na prethodnu.
  function tip(v, prev) {
    if (!prev) return ["t-x", "Prva verzija"];
    const [a, b] = v.split(".").map(Number), [pa, pb] = prev.split(".").map(Number);
    return a !== pa ? ["t-x", "Novi deo"] : b !== pb ? ["t-y", "Novo"] : ["t-z", "Dorada"];
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
      ${VERZIJE.map((x, i) => ({ x, t: tip(x.v, VERZIJE[i + 1]?.v) })).map(({ x, t }) => `<section class="ver-item">
        <h3>Verzija ${esc(x.v)} <span class="ver-tip ${t[0]}">${t[1]}</span> <span>${fmtDate(x.datum)}</span></h3>
        <ul>${x.izmene.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      </section>`).join("")}
      </div>`;
    dlg.showModal();
  }

  document.addEventListener("click", (e) => { if (e.target.closest("[data-verzije]")) open(); });
  // Dugme iz statičkog HTML-a dobija broj verzije; aplikacije koje same crtaju zaglavlje koriste window.APP_VERZIJA.
  document.querySelectorAll("[data-verzije]").forEach((el) => { if (!el.textContent.trim()) el.textContent = `v${VERZIJE[0].v}`; });
})();
