// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Broj se NE piše rukom (isto pravilo kao u Bronxampu, korisnik 7. 11. 2026): verzija je 0.Y.Z, gde je
// Y broj svih novih stvari od početka, a Z broj svih dorada i ispravki; nijedan se ne vraća na nulu.
// Računa ga `numerisi` iz spiskova `nove` i `dorade` — zato se brojevi starih verzija menjaju ako se stavka prekategorizuje.
// Nov unos ide NA VRH liste: datum, `nove` (šta je novo) i `dorade` (dorade i ispravke); oznaka vrste se računa sama.
(() => {
  const VERZIJE = [
    { datum: "2026-11-07", nove: [
      "Senka ispod Blokadera, Kralja, buradi, botova i Institucijane — odmah se vidi šta stoji na gredi.",
      "Prašina kad Blokader sleti, varnice kad se bure razbije.",
      "Tresenje ekrana pri udaru i gubitku života.",
    ], dorade: [] },
    { datum: "2026-11-07", nove: [
      "Svaki nivo ima svoje boje greda i pozadinu sa siluetom (zgrada institucije, dimnjaci, okno lifta, tribine).",
    ], dorade: [
      "Kralj ćacija i burad su u pikselima kao i Blokader, sa tankom tamnom ivicom; bure se kotrlja u osam položaja.",
      "Nove animacije: Kralj trepne i ljulja se pre bacanja, Blokader se u skoku izduži, botovi dime iz antene.",
    ] },
    { datum: "2026-11-01", nove: [], dorade: [
      "Ako posle kraja igre 5 sekundi ništa ne pritisneš, igra se vraća na početni ekran, a demo kreće posle 2 sekunde. Upis tri slova za rekorde čeka koliko treba.",
    ] },
    { datum: "2026-11-01", nove: [], dorade: [
      "Ispravka: tri slova u rekordima i pri upisu sada su jasna. U pikselskom fontu „G“ je ličilo na „Q“, pa slova sada idu istim mirnim fontom kao poeni.",
    ] },
    { datum: "2026-10-31", nove: [
      "Prva verzija: Nenadležni primat - povratak institucijama. Blokader se penje do Institucijane, a Kralj ćacija sa vrha baca burad.",
      "Četiri nivoa koja se smenjuju i ubrzavaju: Fakultet (burad), Fabrika saopštenja (pokretne trake i tabloidi), Lift za podobne (liftovi i opruge) i Kraljeva tribina (zakovice).",
      "Pištaljka rasteruje burad, tabloide i botove; indeks, transparent i Ustav donose bonus poene.",
      "Demo posle 10 sekundi na početnom ekranu, deset najboljih rezultata sa tri slova, muzika i zvuk sa posebnim prekidačima, okvir Privatnost.",
    ], dorade: [] },
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
