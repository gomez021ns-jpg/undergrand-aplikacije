// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Broj se NE piše rukom (isto pravilo kao u Bronxampu, korisnik 7. 11. 2026): verzija je 0.Y.Z, gde je
// Y broj svih novih stvari od početka, a Z broj svih dorada i ispravki; nijedan se ne vraća na nulu.
// Računa ga `numerisi` iz spiskova `nove` i `dorade` — zato se brojevi starih verzija menjaju ako se stavka prekategorizuje.
// Nov unos ide NA VRH liste: datum, `nove` (šta je novo) i `dorade` (dorade i ispravke); oznaka vrste se računa sama.
(() => {
  const VERZIJE = [
    { datum: "2026-10-28",
      nove: [],
      dorade: [
        "Novi naziv aplikacije: UnderGRAND statistika poseta (u naslovu prozora, zaglavlju i na prečici na desktopu).",
      ] },
    { datum: "2026-10-14",
      nove: [],
      dorade: [
        "Nova ikonica u stilu ostalih UnderGRAND aplikacija: UG sa narandžastim krugovima na tamnoj pločici sa narandžastim okvirom (i na prečici na desktopu i na kartici pregledača).",
      ] },
    { datum: "2026-10-14",
      nove: [],
      dorade: [
        "„Šta je novo“: najnovija verzija je sada na vrhu, a ispod sve starije.",
      ] },
    { datum: "2026-10-09",
      nove: [],
      dorade: [
        "Klizači više ne vire iz zaobljenih tabela: tanki su, zaobljeni i bez strelica (kao u staroj verziji programa), a pri prelasku mišem postaju narandžasti.",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Novi naziv: UnderGRAND Statistika (u zaglavlju STATISTIKA, u naslovu prozora i u izveštajima - PDF, štampa i tekst).",
      ] },
    { datum: "2026-10-07",
      nove: [
        "Novo dugme „Pun ekran“ u gornjem desnom uglu: aplikacija se prikazuje preko celog ekrana, a dugme tada postaje „Izađi“ (radi i taster Esc).",
        "Nova prečica na desktopu „UnderGRAND Statistics (pun ekran)“: otvara aplikaciju u Edge-u kao zaseban prozor, odmah preko celog ekrana (izlaz tasterom F11). Ako aplikaciju inače otvaraš u drugom pregledaču, Edge će prvi put tražiti da izabereš bazu i folder za backup.",
      ],
      dorade: [] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Umesto dugačke crte (—) svuda stoji obična crtica (-): u tabelama i karticama kad nema podatka, u naslovima, izveštajima (PDF, štampa, tekst), izvozu i istoriji.",
      ] },
    { datum: "2026-10-07",
      nove: [
        "Zeno tromesečje: pored perioda od 4 nedelje sada postoji i period od 12 nedelja (tab „Zeno periodi“, prekidač na vrhu) - ista tabela, nedelje, grafikon i izvoz u Excel.",
        "Zeno izveštaj za izabrani period (4 nedelje ili tromesečje): kartice sa promenom prema prethodnom periodu, tri mala grafikona (users, sessions, slušanje) i tabela nedelja - kao tekst, na štampač ili PDF, jedna A4 strana.",
        "Dugme Izveštaj nudi izbor: Nedeljni, Zeno 4 nedelje ili Zeno tromesečje.",
      ],
      dorade: [] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Tabovi su moderniji: obična slova, ikonica ispred naziva, a izabrani tab je narandžasta pilula.",
      ] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Moderniji izgled dugmadi: obična slova umesto svih velikih i ikonica ispred naziva.",
        "Novi nazivi: Izvoz u Excel, Napravi kopiju, Vrati iz kopije, Zeno mejl, Zeno arhiva, Izveštaj, Podešavanja i Istorija; tema se menja ikonicom sunca ili meseca.",
        "Zeno dugmad su izdvojena u svoju grupu u traci.",
      ] },
    { datum: "2026-10-07",
      nove: [
        "Nedeljni izveštaj može i direktno na štampač: pored TXT i PDF sada postoji dugme ŠTAMPAJ.",
      ],
      dorade: [] },
    { datum: "2026-10-07",
      nove: [],
      dorade: [
        "Prozor BAZA je uredniji: baza i folder za backup su u dva reda, svaki sa svojim dugmetom PROMENI.",
      ] },
    { datum: "2026-10-07",
      nove: [
        "Nova verzija UnderGRAND Statistics kao web aplikacija: otvara se duplim klikom na index.html u Edge-u, Chrome-u ili Vivaldiju, bez instalacije i bez interneta.",
        "Radi direktno sa postojećom bazom undergrand_stats.json (isti format: posete, Zeno, tema); pre svakog čuvanja pravi se backup u izabrani folder (poslednjih 10 + po jedan za svaki od poslednjih 30 dana).",
        "Svi obračuni isti kao ranije: nedeljni sažetak, trend samo za dane sa unosom u obe nedelje, prag od 1% za „bez promene“, Zeno nedelje i periodi od 4 nedelje.",
        "Ova nedelja: grafikon sada prikazuje i prošlu nedelju pored ove. Zeno statistika: novi grafikon za users, sessions ili sate slušanja.",
        "Uvoz Zeno mejlova prevlačenjem bilo gde u prozor (.eml, .mbox, Google Takeout .zip); nedeljni izveštaj u PDF-u (A4, jedna strana).",
        "Tamna tema sa narandžastim akcentom i svetla tema za rad danju.",
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
