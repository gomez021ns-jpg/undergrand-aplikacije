// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Svaka izmena za korisnika = nov unos NA VRH liste, sa datumom i brojem X.Y.Z po veličini promene:
// X = novi veliki deo aplikacije, Y = nova funkcija, Z = dorada ili ispravka (manji brojevi se tada vraćaju na 0).
// Oznaka vrste (Novi deo / Novo / Dorada) računa se sama iz broja.
// Istorija stare Python aplikacije (0.1–2.6.0) je u js/istorija.js i prikazuje se u prozoru HISTORY.
(() => {
  const VERZIJE = [
    { v: "3.3.5", datum: "2026-10-28", izmene: [
      "Novi naziv aplikacije: UnderGRAND statistika poseta (u naslovu prozora, zaglavlju i na prečici na desktopu).",
    ] },
    { v: "3.3.4", datum: "2026-10-14", izmene: [
      "Nova ikonica u stilu ostalih UnderGRAND aplikacija: UG sa narandžastim krugovima na tamnoj pločici sa narandžastim okvirom (i na prečici na desktopu i na kartici pregledača).",
    ] },
    { v: "3.3.3", datum: "2026-10-14", izmene: [
      "„Šta je novo“: najnovija verzija je sada na vrhu, a ispod sve starije.",
    ] },
    { v: "3.3.2", datum: "2026-10-09", izmene: [
      "Klizači više ne vire iz zaobljenih tabela: tanki su, zaobljeni i bez strelica (kao u staroj verziji programa), a pri prelasku mišem postaju narandžasti.",
    ] },
    { v: "3.3.1", datum: "2026-10-07", izmene: [
      "Novi naziv: UnderGRAND Statistika (u zaglavlju STATISTIKA, u naslovu prozora i u izveštajima - PDF, štampa i tekst).",
    ] },
    { v: "3.3.0", datum: "2026-10-07", izmene: [
      "Novo dugme „Pun ekran“ u gornjem desnom uglu: aplikacija se prikazuje preko celog ekrana, a dugme tada postaje „Izađi“ (radi i taster Esc).",
      "Nova prečica na desktopu „UnderGRAND Statistics (pun ekran)“: otvara aplikaciju u Edge-u kao zaseban prozor, odmah preko celog ekrana (izlaz tasterom F11). Ako aplikaciju inače otvaraš u drugom pregledaču, Edge će prvi put tražiti da izabereš bazu i folder za backup.",
    ] },
    { v: "3.2.1", datum: "2026-10-07", izmene: [
      "Umesto dugačke crte (—) svuda stoji obična crtica (-): u tabelama i karticama kad nema podatka, u naslovima, izveštajima (PDF, štampa, tekst), izvozu i istoriji.",
    ] },
    { v: "3.2.0", datum: "2026-10-07", izmene: [
      "Zeno tromesečje: pored perioda od 4 nedelje sada postoji i period od 12 nedelja (tab „Zeno periodi“, prekidač na vrhu) - ista tabela, nedelje, grafikon i izvoz u Excel.",
      "Zeno izveštaj za izabrani period (4 nedelje ili tromesečje): kartice sa promenom prema prethodnom periodu, tri mala grafikona (users, sessions, slušanje) i tabela nedelja - kao tekst, na štampač ili PDF, jedna A4 strana.",
      "Dugme Izveštaj nudi izbor: Nedeljni, Zeno 4 nedelje ili Zeno tromesečje.",
    ] },
    { v: "3.1.2", datum: "2026-10-07", izmene: [
      "Tabovi su moderniji: obična slova, ikonica ispred naziva, a izabrani tab je narandžasta pilula.",
    ] },
    { v: "3.1.1", datum: "2026-10-07", izmene: [
      "Moderniji izgled dugmadi: obična slova umesto svih velikih i ikonica ispred naziva.",
      "Novi nazivi: Izvoz u Excel, Napravi kopiju, Vrati iz kopije, Zeno mejl, Zeno arhiva, Izveštaj, Podešavanja i Istorija; tema se menja ikonicom sunca ili meseca.",
      "Zeno dugmad su izdvojena u svoju grupu u traci.",
    ] },
    { v: "3.1.0", datum: "2026-10-07", izmene: [
      "Nedeljni izveštaj može i direktno na štampač: pored TXT i PDF sada postoji dugme ŠTAMPAJ.",
    ] },
    { v: "3.0.1", datum: "2026-10-07", izmene: [
      "Prozor BAZA je uredniji: baza i folder za backup su u dva reda, svaki sa svojim dugmetom PROMENI.",
    ] },
    { v: "3.0.0", datum: "2026-10-07", izmene: [
      "Nova verzija UnderGRAND Statistics kao web aplikacija: otvara se duplim klikom na index.html u Edge-u, Chrome-u ili Vivaldiju, bez instalacije i bez interneta.",
      "Radi direktno sa postojećom bazom undergrand_stats.json (isti format: posete, Zeno, tema); pre svakog čuvanja pravi se backup u izabrani folder (poslednjih 10 + po jedan za svaki od poslednjih 30 dana).",
      "Svi obračuni isti kao ranije: nedeljni sažetak, trend samo za dane sa unosom u obe nedelje, prag od 1% za „bez promene“, Zeno nedelje i periodi od 4 nedelje.",
      "Ova nedelja: grafikon sada prikazuje i prošlu nedelju pored ove. Zeno statistika: novi grafikon za users, sessions ili sate slušanja.",
      "Uvoz Zeno mejlova prevlačenjem bilo gde u prozor (.eml, .mbox, Google Takeout .zip); nedeljni izveštaj u PDF-u (A4, jedna strana).",
      "Tamna tema sa narandžastim akcentom i svetla tema za rad danju.",
    ] },
  ];

  window.APP_VERZIJA = VERZIJE[0].v;
  window.APP_VERZIJE = VERZIJE;

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
