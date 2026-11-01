// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Svaka izmena za korisnika = nov unos NA VRH liste, sa datumom i brojem X.Y.Z po veličini promene:
// X = novi veliki deo aplikacije, Y = nova funkcija, Z = dorada ili ispravka (manji brojevi se tada vraćaju na 0).
// Oznaka vrste (Novi deo / Novo / Dorada) računa se sama iz broja.
(() => {
  const VERZIJE = [
    { v: "1.4.0", datum: "2026-11-01", izmene: [
      "Demo kao na arkadi: ako niko ne krene u roku od 10 sekundi, igra 20 sekundi igra sama (redom nivo 1, 2 i 3), pa se vraća na početni ekran. Enter ili razmak usred dema odmah pokreće pravu igru, a bilo koji drugi taster ili klik vraća na početni ekran. Demo je bez zvuka i ne ulazi u rekorde.",
      "Kraj igre je sav na sredini. Ako posle kraja igre 5 sekundi ništa ne pritisneš, igra se vraća na početni ekran i pušta demo (upis tri slova za rekorde čeka koliko treba).",
    ] },
    { v: "1.3.7", datum: "2026-11-01", izmene: [
      "Tri slova u rekordima i pri upisu sada su jasna: u piksel slovima „G“ je ličilo na „Q“, pa slova idu istim čitljivim oblikom kao brojevi.",
    ] },
    { v: "1.3.6", datum: "2026-11-01", izmene: [
      "Brojevi se više ne brkaju: piksel slova su crtala „5“ skoro kao „8“, pa su sve cifre (skor, rekordi, verzije, poeni u igri) sada u jasnom, čitljivom obliku.",
    ] },
    { v: "1.3.5", datum: "2026-11-01", izmene: [
      "Megakrkan Pečat (bos nivoa 2) je lakši: treba ga pogoditi 24 puta umesto 30, a računa se i rif koji pogodi tik pored oka.",
      "I kad je ljut, pre svakog udarca se na podu kratko pojavi crvena meta, pa se vidi gde će pasti. Između dva dupla udarca ima više predaha.",
    ] },
    { v: "1.3.4", datum: "2026-11-01", izmene: [
      "Batinaš koji iskoči iz stroja više ne prolazi kroz crvenu liniju: stane na nju pa se ili odbije i vrati gore, ili polako potone ispod linije i nestane.",
      "Kad se igra završi, piše „kraj igre“ (umesto „kraj programa“).",
    ] },
    { v: "1.3.3", datum: "2026-10-31", izmene: [
      "Desni okvir sa skorom je ujednačen: skor i rekord gore, ispod životi, nivo i talas - svaki natpis je na sredini iznad svoje vrednosti. Posle četiri odašiljača u rezervi piše „+“ i broj.",
      "Svi okviri desno imaju iste razmake od ivica, a tekst ispod dugmeta na početnom ekranu se više ne lomi tako da jedna reč ostane sama.",
      "Nov okvir „Privatnost“: igra ne prikuplja ničije podatke i ništa ne šalje na internet; rekordi i podešavanja ostaju samo u pregledaču na tvom računaru.",
    ] },
    { v: "1.3.2", datum: "2026-10-31", izmene: [
      "Desno su nivo i talas razdvojeni: ispod natpisa „Nivo“ je broj nivoa, a ispod „Talas“ talas (ili „bos“), oba na sredini. Natpis iznad odašiljača u rezervi je kraći: samo „Životi“.",
    ] },
    { v: "1.3.1", datum: "2026-10-31", izmene: [
      "Početni ekran je sređen: sve je centrirano, ostalo je samo dugme „Uključi odašiljač“ (bez natpisa „nova igra · beta“ i dugmadi za kasnije nivoe).",
    ] },
    { v: "1.3.0", datum: "2026-10-31", izmene: [
      "Uvodna špica kao na starom kućnom računaru sa kasetom: plavi ekran, „PRESS PLAY ON TAPE“, šarene pruge po ivici i slika igre koja se učitava red po red, uz muziku za učitavanje.",
      "Usput se umeša ometač signala, a učitavanje zastane na 99 % dok čeka dozvolu inspekcije. Na kraju READY. RUN i naslovni ekran.",
      "Prvi taster ili klik pušta „kasetu“, sledeći preskače špicu; Esc je preskače odmah.",
    ] },
    { v: "1.2.1", datum: "2026-10-31", izmene: [
      "Nivo 2 je usklađen sa dizajnom bosova i sada se zove „Regulatorno telo“.",
      "Megakrkan Pečat se pogađa u oči, i to samo dok je podignut. Dok se spušta, leži na podu ili se diže, oči su zatvorene i rif se odbija.",
      "Gde pečat udari, zaklon nestaje i ostaje crveni trag „ODUZETA FREKVENCIJA“.",
      "Kad je ljut (druga polovina borbe), udari dvaput zaredom, brže i bez mete i alarma. Više ne šalje inspektore.",
    ] },
    { v: "1.2.0", datum: "2026-10-31", izmene: [
      "Nivo 3 „Brdo sa antenom“, poslednji: dva reda ometača, a talasi su najbrži i najniži do sada.",
      "Poslednji bos Megakrkan Ometač: četiri tanjira se ruše redom, odozdo nagore (onaj koji je na redu je uokviren žutim). Talasi smetnji na trenutak ugase delove ekrana, a kad padnu donji tanjiri, pali se crvena lampica - dok svetli, kontrole kasne pola sekunde.",
      "Kad pobediš sva tri bosa, igra je pređena. Na početnom ekranu je i dugme „Od nivoa 3“.",
      "Nova muzika za nivo 3: Smetnja na vezi, Antena na brdu i Beli šum, plus pesma bosa Megakrkan Ometač.",
      "Kad nema više odašiljača u rezervi, desno više ne piše nula - polje je prazno.",
    ] },
    { v: "1.1.1", datum: "2026-10-30", izmene: [
      "Životi se broje kao u arkadama: desno piše „Životi u rezervi“ i vide se samo rezervni odašiljači, bez onog koji je u igri (na početku su dva).",
      "Novi život na svakih 2.000 poena (umesto na 10.000). To piše i među bonusima ispod igrališta.",
    ] },
    { v: "1.1.0", datum: "2026-10-30", izmene: [
      "Nivo 2 „Inspekcijski nadzor“: posle pobede nad Megakrkan Ćacijem igra se nastavlja sa istim poenima i životima. Stroj ima dva reda inspektora (više pečata), a talasi su brži i niži.",
      "Novi bos Megakrkan Pečat: lebdi i kaplje mastilo koje pečatira zaklone, a kad nacilja (crvena meta na podu), udari i zgnječi sve ispod sebe. Gađa se crveno jastuče; kad je ljut, svaki udarac „izda rešenje“ - stižu dva inspektora.",
      "Nova muzika za nivo 2: Šalter zatvoren, Dozvola za dozvolu i Zapisnik, plus pesma bosa Megakrkan Pečat.",
      "Na početnom ekranu dugme „Od nivoa 2“ (beta), a rekordi pamte i nivo do kog si stigao.",
    ] },
    { v: "1.0.1", datum: "2026-10-29", izmene: [
      "Ispravka: igra se više ne ukoči kad se prva pesma završi i krene sledeća (posle otprilike minut igre).",
    ] },
    { v: "1.0.0", datum: "2026-10-29", izmene: [
      "Prva beta: UnderGRAND E ne'š kolega!!! - igra u kojoj si odašiljač UnderGRAND radija i braniš etar od Ćaci TV-a, batinaša, botova, inspektora i ometača.",
      "Nivo 1 „Desk udarnih vesti“: tri talasa, sve brža, pa bos Megakrkan Ćaci (prvo dve antene, pa ekran; kad ekran oslabi, pušta „reprizu“).",
      "Zakloni od kaseta i ploča koji se krune piksel po piksel, crni džip bez tablica za bonus poene i tri bonusa: Pištaljka, Solidarnost i Zvanični demanti.",
      "Muzika: tri naše pesme koje se smenjuju (Udarna vest, Autobusi iz unutrašnjosti, Pištaljka) i posebna pesma za bosa. Dugme „Sledeća pesma“ (taster B).",
      "Deset najboljih rezultata sa tri slova, čuvaju se samo u ovom pregledaču.",
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
