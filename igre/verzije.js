// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Svaka izmena za korisnika = nov unos NA VRH liste, sa datumom i brojem X.Y.Z po veličini promene:
// X = novi veliki deo aplikacije, Y = nova funkcija, Z = dorada ili ispravka (manji brojevi se tada vraćaju na 0).
// Oznaka vrste (Novi deo / Novo / Dorada) računa se sama iz broja.
(() => {
  const VERZIJE = [
    { v: "1.14.0", datum: "2026-10-18", izmene: [
      "Novi dodatak za Riftbound: Unleashed - Champion Deck: Vi. Šta je u kutiji, kako se igra Vi (ključne karte, plan napada i šema), objašnjenje „viška štete“ na kome počiva špil, sa šemom i čestim situacijama, i spisak svih karata.",
    ] },
    { v: "1.13.2", datum: "2026-10-14", izmene: [
      "Nova ikonica u stilu ostalih UnderGRAND aplikacija: karte i kockica na tamnoj pločici sa narandžastim okvirom (i na prečici na desktopu i na kartici pregledača).",
    ] },
    { v: "1.13.1", datum: "2026-10-14", izmene: [
      "„Šta je novo“: najnovija verzija je sada na vrhu, a ispod sve starije.",
    ] },
    { v: "1.13.0", datum: "2026-10-07", izmene: [
      "Novo dugme „Pun ekran“ u gornjem desnom uglu: aplikacija se prikazuje preko celog ekrana, a dugme tada postaje „Izađi“ (radi i taster Esc).",
      "Nova prečica na desktopu „Moje društvene igre (pun ekran)“: otvara aplikaciju u Edge-u kao zaseban prozor, odmah preko celog ekrana (izlaz tasterom F11).",
    ] },
    { v: "1.12.9", datum: "2026-10-07", izmene: [
      "Dugmad su sada kao u Statistici: blagi preliv i mala „dubina“ ispod, pri kliku se spuste; glavno dugme (Štampaj / PDF) je narandžasto. Isto važi za Podsetnik i Štampaj na karticama.",
    ] },
    { v: "1.12.8", datum: "2026-10-07", izmene: [
      "Nove, šire slike za The Mandalorian: Adventures, Star Wars: Unlimited i Worms - lepo staju i na kartici i na stranici igre.",
    ] },
    { v: "1.12.7", datum: "2026-10-07", izmene: [
      "Slike igara se više ne seku u usku traku: na kartici u kolekciji je slika u formatu 16:9, a na stranici igre se vidi cela, sa zamućenom istom slikom kao pozadinom sa strane.",
    ] },
    { v: "1.12.6", datum: "2026-10-07", izmene: [
      "Slike za Riftbound, Star Wars: The Deckbuilding Game, Star Wars: Unlimited, The Mandalorian: Adventures i Worms - na kartici u kolekciji i na vrhu stranice igre, isečene tako da se vidi naziv igre.",
    ] },
    { v: "1.12.5", datum: "2026-10-07", izmene: [
      "Umesto dugačke crte (—) svuda u tekstovima igara i aplikacije stoji obična crtica (-).",
    ] },
    { v: "1.12.4", datum: "2026-10-07", izmene: [
      "Opis igre na vrhu stranice koristi celu širinu pored dugmeta Štampaj / PDF - umesto uskog stubca sada staje u dva reda.",
    ] },
    { v: "1.12.3", datum: "2026-10-07", izmene: [
      "Uklonjen natpis „Otvori pravila →“ sa kartica (na užim karticama se sekao, a nije bio potreban): klik bilo gde na karticu otvara pravila, a kartica se pri prelasku mišem podigne i dobije okvir u boji igre.",
    ] },
    { v: "1.12.2", datum: "2026-10-07", izmene: [
      "Moderniji izgled kolekcije: svaka igra ima omot u svojoj boji sa monogramom (npr. SWU) i ikonicom vrste igre; kad dodaš fotografiju kutije, ona stoji umesto toga.",
      "Kartice su iste visine; na svakoj su prečice Podsetnik i Štampaj (štampa brzog podsetnika bez otvaranja igre), a pri prelasku mišem piše „Otvori pravila →“.",
      "Gornji deo je kompaktniji: brojači (igre, dodaci, lista želja) i pretraga sa lupom u istom redu. Lista želja je prigušena, sa oznakom ♥ Želim. Strana je šira - na velikom ekranu staje 4 igre u red.",
    ] },
    { v: "1.12.1", datum: "2026-10-07", izmene: [
      "Novi izgled u stilu UnderGRAND aplikacija: zaglavlje sa UnderGRAND logom, nazivom DRUŠTVENE IGRE i sloganom, iste boje kao ostale aplikacije (narandžasti akcenat), oblija dugmad i tabovi kao pilule, tema se menja ikonicom sunca ili meseca.",
    ] },
    { v: "1.12.0", datum: "2026-10-06", izmene: [
      "Novi dodatak za Star Wars: Unlimited: Shadows of the Galaxy - Two-Player Starter (označen kao „Stiže“). Oba špila - The Mandalorian i Moff Gideon - sa liderima, bazama i savetima za igru, nove mehanike Capture, Bounty i Smuggle sa šemom, i u kojim formatima važe karte.",
    ] },
    { v: "1.11.1", datum: "2026-10-06", izmene: [
      "Star Wars: Unlimited je prebačen sa liste želja u kolekciju.",
    ] },
    { v: "1.11.0", datum: "2026-10-06", izmene: [
      "Riftbound: novo, detaljno poglavlje o igranju karata - četiri stanja poteza, Priority i Focus, chain korak po korak, sa dve nove šeme i primerom.",
      "Riftbound: ispravka - Reaction karta se u protivnikovom potezu igra samo kao odgovor (kad postoji chain) ili u showdown-u, ne „bilo kad“. Ispravljeno i u brzom podsetniku.",
      "Riftbound: nova poglavlja „Primer partije: prva dva poteza“ i „Česte situacije (FAQ)“; ključne reči kasnijih setova su razvrstane po setovima (Spiritforged, Unleashed).",
      "Star Wars: The Deckbuilding Game: novo poglavlje „2v2 - igra za četvoro“ po zvaničnim pravilima, sa šemom stola, čestim pitanjima i objašnjenjem karata u igri u timovima.",
      "Nova kartica „Kućna pravila“ kod svake igre - za vaše dogovore; ulazi i u štampu punih pravila.",
    ] },
    { v: "1.10.0", datum: "2026-10-06", izmene: [
      "Nova „Lista želja“ na početnoj strani: igre koje još nemaš su u posebnom odeljku i ne broje se u kolekciju. Tamo su za sada Star Wars: Unlimited i Flesh and Blood - pravila ostaju spremna.",
    ] },
    { v: "1.9.3", datum: "2026-10-06", izmene: [
      "Brojevi verzija sada pokazuju veličinu promene (X.Y.Z): prvi broj raste za novi veliki deo aplikacije, drugi za novu igru, dodatak ili funkciju, treći za doradu ili ispravku. Cela istorija je prenumerisana, a uz svaku verziju piše Novi deo, Novo ili Dorada.",
    ] },
    { v: "1.9.2", datum: "2026-10-04", izmene: [
      "Oznaka trenutne verzije u gornjoj traci; klik na nju otvara ovaj spisak izmena, od prve verzije do najnovije.",
    ] },
    { v: "1.9.1", datum: "2026-10-03", izmene: [
      "Aplikacija je premeštena u svoj folder (igre), kao i ostale aplikacije; prečica na desktopu je prepravljena.",
    ] },
    { v: "1.9.0", datum: "2026-10-02", izmene: [
      "Nova igra: Flesh and Blood - opšta pravila po Comprehensive Rules 2.15.0: brzi podsetnik, 9 poglavlja, 5 šema (izgled karte, zone, potez, borba, pitch), 25 ključnih reči i formati igre.",
    ] },
    { v: "1.8.0", datum: "2026-09-30", izmene: [
      "Novi dodatak za Star Wars: The Deckbuilding Game: Rebel & Empire Reinforcements - misije i reinforcement karte, Upgraded Starter mod, kampanja od 5 partija, dve šeme.",
      "Nepotvrđeni detalji (broj misija po partiji, detalji kampanje) su označeni dok ne stigne pravilnik iz kutije.",
    ] },
    { v: "1.7.1", datum: "2026-09-30", izmene: [
      "Ikonica aplikacije (karte i kockica) i prečica „Moje društvene igre“ na desktopu; ista ikonica i na kartici pregledača.",
    ] },
    { v: "1.7.0", datum: "2026-09-30", izmene: [
      "Nova igra: Star Wars: Unlimited - Spark of Rebellion (Quickstart + Comprehensive Rules 8.0): brzi podsetnik, 10 poglavlja, 4 šeme, 26 ključnih reči.",
    ] },
    { v: "1.6.0", datum: "2026-09-29", izmene: [
      "Nova igra: The Mandalorian: Adventures - brzi podsetnik, 12 poglavlja, šema action slotova; pravila koja Guide Deck otkriva kasnije su u posebnom poglavlju sa upozorenjem o spojlerima.",
    ] },
    { v: "1.5.0", datum: "2026-09-29", izmene: [
      "Nova igra: Worms: The Board Game, po konačnom pravilniku (24 str.): brzi podsetnik, 13 poglavlja, šema poteza i mreže heksova, 34 ključne reči.",
    ] },
    { v: "1.4.0", datum: "2026-09-29", izmene: [
      "Nova igra: Star Wars: The Deckbuilding Game, po zvaničnom FFG pravilniku: brzi podsetnik, 16 poglavlja, 6 šema, 29 ključnih reči.",
      "Ispravka: na početnoj strani piše „2 igre“ umesto „2 igara“ (i množina za dodatke).",
    ] },
    { v: "1.3.0", datum: "2026-09-29", izmene: [
      "Prvi dodatak: Riftbound Vendetta - Showdown Decks Zed vs Shen (sadržaj kutije, oba špila, nove mehanike, spiskovi karata).",
      "Štampa ima i opciju „Samo dodaci“; ključne reči dodatka su u posebnoj grupi.",
    ] },
    { v: "1.2.0", datum: "2026-09-29", izmene: [
      "Riftbound: novo poglavlje „Karte: vrste, izgled i namena“ sa šemom svih vrsta karata i šemom „Kako se čita karta“.",
      "Brzi podsetnik ima karticu „Vrste karata“ i i dalje staje na jednu A4 stranu.",
    ] },
    { v: "1.1.0", datum: "2026-09-29", izmene: [
      "Šeme u pravilima (za Riftbound 6: sto, potez, rune, kretanje, dolazak na battlefield, primer borbe); prate svetlu/tamnu temu i štampu.",
      "Mesto za fotografiju kutije igre.",
    ] },
    { v: "1.0.0", datum: "2026-09-29", izmene: [
      "Prva verzija: kolekcija igara sa pretragom i Riftbound (osnovna igra) - brzi podsetnik na jednoj A4 strani, puna pravila sa pretragom i ključne reči.",
      "Štampa u PDF, svetla i tamna tema, radi i na telefonu.",
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
