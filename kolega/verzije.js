// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Broj se NE piše rukom (isto pravilo kao u Bronxampu, korisnik 7. 11. 2026): verzija je 0.Y.Z, gde je
// Y broj svih novih stvari od početka, a Z broj svih dorada i ispravki; nijedan se ne vraća na nulu.
// Računa ga `numerisi` iz spiskova `nove` i `dorade` — zato se brojevi starih verzija menjaju ako se stavka prekategorizuje.
// Nov unos ide NA VRH liste: datum, `nove` (šta je novo) i `dorade` (dorade i ispravke); oznaka vrste se računa sama.
(() => {
  const VERZIJE = [
    { datum: "2026-11-01", nove: [
      "Demo kao na arkadi: ako niko ne krene u roku od 10 sekundi, igra 20 sekundi igra sama (redom nivo 1, 2 i 3), pa se vraća na početni ekran. Enter ili razmak usred dema odmah pokreće pravu igru, a bilo koji drugi taster ili klik vraća na početni ekran. Demo je bez zvuka i ne ulazi u rekorde.",
      "Kraj igre je sav na sredini. Ako posle kraja igre 5 sekundi ništa ne pritisneš, igra se vraća na početni ekran i pušta demo (upis tri slova za rekorde čeka koliko treba).",
    ], dorade: [] },
    { datum: "2026-11-01", nove: [], dorade: [
      "Tri slova u rekordima i pri upisu sada su jasna: u piksel slovima „G“ je ličilo na „Q“, pa slova idu istim čitljivim oblikom kao brojevi.",
    ] },
    { datum: "2026-11-01", nove: [], dorade: [
      "Brojevi se više ne brkaju: piksel slova su crtala „5“ skoro kao „8“, pa su sve cifre (skor, rekordi, verzije, poeni u igri) sada u jasnom, čitljivom obliku.",
    ] },
    { datum: "2026-11-01", nove: [
      "I kad je ljut, pre svakog udarca se na podu kratko pojavi crvena meta, pa se vidi gde će pasti. Između dva dupla udarca ima više predaha.",
    ], dorade: [
      "Megakrkan Pečat (bos nivoa 2) je lakši: treba ga pogoditi 24 puta umesto 30, a računa se i rif koji pogodi tik pored oka.",
    ] },
    { datum: "2026-11-01", nove: [], dorade: [
      "Batinaš koji iskoči iz stroja više ne prolazi kroz crvenu liniju: stane na nju pa se ili odbije i vrati gore, ili polako potone ispod linije i nestane.",
      "Kad se igra završi, piše „kraj igre“ (umesto „kraj programa“).",
    ] },
    { datum: "2026-10-31", nove: [
      "Nov okvir „Privatnost“: igra ne prikuplja ničije podatke i ništa ne šalje na internet; rekordi i podešavanja ostaju samo u pregledaču na tvom računaru.",
    ], dorade: [
      "Desni okvir sa skorom je ujednačen: skor i rekord gore, ispod životi, nivo i talas - svaki natpis je na sredini iznad svoje vrednosti. Posle četiri odašiljača u rezervi piše „+“ i broj.",
      "Svi okviri desno imaju iste razmake od ivica, a tekst ispod dugmeta na početnom ekranu se više ne lomi tako da jedna reč ostane sama.",
    ] },
    { datum: "2026-10-31", nove: [], dorade: [
      "Desno su nivo i talas razdvojeni: ispod natpisa „Nivo“ je broj nivoa, a ispod „Talas“ talas (ili „bos“), oba na sredini. Natpis iznad odašiljača u rezervi je kraći: samo „Životi“.",
    ] },
    { datum: "2026-10-31", nove: [], dorade: [
      "Početni ekran je sređen: sve je centrirano, ostalo je samo dugme „Uključi odašiljač“ (bez natpisa „nova igra · beta“ i dugmadi za kasnije nivoe).",
    ] },
    { datum: "2026-10-31", nove: [
      "Uvodna špica kao na starom kućnom računaru sa kasetom: plavi ekran, „PRESS PLAY ON TAPE“, šarene pruge po ivici i slika igre koja se učitava red po red, uz muziku za učitavanje.",
      "Usput se umeša ometač signala, a učitavanje zastane na 99 % dok čeka dozvolu inspekcije. Na kraju READY. RUN i naslovni ekran.",
      "Prvi taster ili klik pušta „kasetu“, sledeći preskače špicu; Esc je preskače odmah.",
    ], dorade: [] },
    { datum: "2026-10-31", nove: [
      "Gde pečat udari, zaklon nestaje i ostaje crveni trag „ODUZETA FREKVENCIJA“.",
    ], dorade: [
      "Nivo 2 je usklađen sa dizajnom bosova i sada se zove „Regulatorno telo“.",
      "Megakrkan Pečat se pogađa u oči, i to samo dok je podignut. Dok se spušta, leži na podu ili se diže, oči su zatvorene i rif se odbija.",
      "Kad je ljut (druga polovina borbe), udari dvaput zaredom, brže i bez mete i alarma. Više ne šalje inspektore.",
    ] },
    { datum: "2026-10-31", nove: [
      "Nivo 3 „Brdo sa antenom“, poslednji: dva reda ometača, a talasi su najbrži i najniži do sada.",
      "Poslednji bos Megakrkan Ometač: četiri tanjira se ruše redom, odozdo nagore (onaj koji je na redu je uokviren žutim). Talasi smetnji na trenutak ugase delove ekrana, a kad padnu donji tanjiri, pali se crvena lampica - dok svetli, kontrole kasne pola sekunde.",
      "Kad pobediš sva tri bosa, igra je pređena. Na početnom ekranu je i dugme „Od nivoa 3“.",
      "Nova muzika za nivo 3: Smetnja na vezi, Antena na brdu i Beli šum, plus pesma bosa Megakrkan Ometač.",
    ], dorade: [
      "Kad nema više odašiljača u rezervi, desno više ne piše nula - polje je prazno.",
    ] },
    { datum: "2026-10-30", nove: [], dorade: [
      "Životi se broje kao u arkadama: desno piše „Životi u rezervi“ i vide se samo rezervni odašiljači, bez onog koji je u igri (na početku su dva).",
      "Novi život na svakih 2.000 poena (umesto na 10.000). To piše i među bonusima ispod igrališta.",
    ] },
    { datum: "2026-10-30", nove: [
      "Nivo 2 „Inspekcijski nadzor“: posle pobede nad Megakrkan Ćacijem igra se nastavlja sa istim poenima i životima. Stroj ima dva reda inspektora (više pečata), a talasi su brži i niži.",
      "Novi bos Megakrkan Pečat: lebdi i kaplje mastilo koje pečatira zaklone, a kad nacilja (crvena meta na podu), udari i zgnječi sve ispod sebe. Gađa se crveno jastuče; kad je ljut, svaki udarac „izda rešenje“ - stižu dva inspektora.",
      "Nova muzika za nivo 2: Šalter zatvoren, Dozvola za dozvolu i Zapisnik, plus pesma bosa Megakrkan Pečat.",
      "Na početnom ekranu dugme „Od nivoa 2“ (beta), a rekordi pamte i nivo do kog si stigao.",
    ], dorade: [] },

    { datum: "2026-10-29", nove: [], dorade: [
      "Ispravka: igra se više ne ukoči kad se prva pesma završi i krene sledeća (posle otprilike minut igre).",
    ] },
    { datum: "2026-10-29", nove: [
      "Prva beta: UnderGRAND E ne'š kolega!!! - igra u kojoj si odašiljač UnderGRAND radija i braniš etar od Ćaci TV-a, batinaša, botova, inspektora i ometača.",
      "Nivo 1 „Desk udarnih vesti“: tri talasa, sve brža, pa bos Megakrkan Ćaci (prvo dve antene, pa ekran; kad ekran oslabi, pušta „reprizu“).",
      "Zakloni od kaseta i ploča koji se krune piksel po piksel, crni džip bez tablica za bonus poene i tri bonusa: Pištaljka, Solidarnost i Zvanični demanti.",
      "Muzika: tri naše pesme koje se smenjuju (Udarna vest, Autobusi iz unutrašnjosti, Pištaljka) i posebna pesma za bosa. Dugme „Sledeća pesma“ (taster B).",
      "Deset najboljih rezultata sa tri slova, čuvaju se samo u ovom pregledaču.",
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
