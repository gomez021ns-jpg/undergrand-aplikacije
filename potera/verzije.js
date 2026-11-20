// Verzija igre i istorija izmena (prozor „Šta je novo“).
// Broj se NE piše rukom (isto pravilo kao u Bronxampu, korisnik 7. 11. 2026): verzija je 0.Y.Z, gde je
// Y broj svih novih stvari od početka, a Z broj svih dorada i ispravki; nijedan se ne vraća na nulu.
// Računa ga `numerisi` iz spiskova `nove` i `dorade` — zato se brojevi starih verzija menjaju ako se stavka prekategorizuje.
// Nov unos ide NA VRH liste: datum, `nove` (šta je novo) i `dorade` (dorade i ispravke); oznaka vrste se računa sama.
(() => {
  const VERZIJE = [
    { datum: "2026-11-20",
      nove: [],
      dorade: [
        "U prozoru „Šta je novo“ svaka stavka ima oznaku: + je nešto novo, − je sitnija dorada ili ispravka.",
      ] },
    { datum: "2026-11-14", nove: [], dorade: [
      "Registracija na džipu (? ? ?) je sada tačno na sredini bele tablice - ranije je bila uz levu ivicu, jer se tekst crtao levo poravnat.",
    ] },
    { datum: "2026-11-14", nove: [], dorade: [
      "Asfalt ima teksturu: zrno, tamne zakrpe i šavove na spoju segmenata, tragove guma u svakoj traci i zaprljanu ivicu; bankina i njive su prošarane, brazde su jasnije, a linije i ivičnjak su tanji i sa tamnim obrisom.",
      "Sunce više ne baca pruge van kruga - pruge su unutar zalazećeg diska; dodata su brda u daljini, topao sjaj uz horizont i senčenje oblaka.",
      "Vozila imaju mekšu senku ispod (elipsa sa prelivom umesto pune linije), odsjaj na zadnjem staklu i liniju krova; autobus ima senku pri dnu karoserije.",
      "CRT: blagi crveno-plavi razliv na ivicama, odsjaj stakla i blaža vinjeta - natpisi u uglovima (DO HORGOŠA, KM) su sada čitljivi.",
    ] },
    { datum: "2026-11-14", nove: [], dorade: [
      "Odrasliji ton: begunci su sada predmeti sa šiframa (ANEKS, SAVET, KOFERI, NE ZNAM) i dosijeom sa funkcijom i inicijalima, dispečerka govori suvim policijskim radio-jezikom, izgovori pri hapšenju zvuče kao saopštenja za javnost, a bilbordi kao parodija propagande.",
      "Kraj igre je sudski epilog (\"PREDMET ZATVOREN\", \"DELIMIČAN USPEH\"...), razglednice su kratke i suve, a kartica za deljenje broji zatvorene predmete.",
    ] },
    { datum: "2026-11-13", nove: [
      "Tri težine - LAKO, SREDNJE i TEŠKO - biraju se strelicama levo-desno na naslovnom ekranu i pamte se. Dosadašnja igra je TEŠKO. Na lakšim je džip sporiji, više popušta kad zaostaneš, ređe izmiče i baca predmete, posle udarca manje pobegne, saobraćaj je ređi, a udarac lakše \"uhvati\"; na LAKO džip ne beži bankinom.",
      "Posebna tabela najboljih vozača za svaku težinu (dosadašnji rekordi su na TEŠKO); težina piše i na brifingu, na kraju igre i na kartici za deljenje.",
    ], dorade: [] },
    { datum: "2026-11-12", nove: [
      "Učitavanje počinje pritiskom na taster ili klikom (\"umetni disk\"), pa se čuje disk koji čita i džingl kad se učita. Pregledač inače ne pušta zvuk pre prvog pritiska, pa je početak ranije bio nem.",
      "Početak igre ima zvuk: sirena na polasku, napeta muzika ispod brifinga i motor koji se vrti u prazno kad krene vožnja.",
    ], dorade: [
      "Okvir \"Kako se igra\" na naslovnom ekranu: tekst se prelama unutar okvira (ništa više ne štrči), a tasteri i opisi su poravnati u dve kolone; dodati Esc za jačinu zvuka i M za muziku.",
    ] },
    { datum: "2026-11-12", nove: [
      "Zvuk: motor čija visina prati brzinu i menjač, sirena kad je džip blizu, turbo, sudari, udarci u džip, škripa guma u krivinama i pri kočenju, prašina sa njive, novčanice, pečat \"UHAPŠEN!\", radio-veza dispečerke i teleprinter na brifingu.",
      "Muzika u stilu starih kućnih računara, drugačija za svaku deonicu: novi talas za noćni Novi Sad, svetli synth-pop za zoru kod Srbobrana, synthwave za Bačku ravnicu (sa čardašom na tamburici koji ubrzava) i najbrža za noć do Horgoša.",
      "Muzika prati poteru: kad je džip na vidiku pojačaju se bubanj i bas, a poslednjih 15 sekundi ubrzava.",
      "Fanfara za hapšenje, ofucana hotelska muzika uz razglednicu iz inostranstva, glavna tema na naslovnom ekranu i završna tema (u molu, na harmonici, ako su svi pobegli).",
      "Jačina muzike i efekata posebno u pauzi (←→), dugmad Muzika i Zvuk gore i taster M za muziku. Demo je bez zvuka.",
    ], dorade: [] },
    { datum: "2026-11-12", nove: [
      "Sve četiri deonice redom, svaka sa svojim beguncem: noćni izlaz iz Novog Sada (grad, nadvožnjaci, naplatna stanica), zora kod Srbobrana (most preko kanala, traktori na putu), Bačka ravnica u zalasku i noć od Subotice do Horgoša (vetrenjače, red kamiona, granični prelaz).",
      "Noću svetle bandere, stop svetla vozila i farovi policijskog auta.",
      "Brifing pre svake deonice: dispečerka Dragana čita zadatak, a pored je fotografija begunca iz dosijea i opis džipa.",
      "Učitavanje sa diska na početku (bilo koji taster ga preskače).",
      "Naslovni ekran sa naslovom u prelivima, kratkim uputstvom i tabelom najboljih vozača; posle 10 sekundi bez pritiska igra sama vozi demo (Enter ili razmak pokreće pravu igru).",
      "Kraj igre noću na graničnom prelazu Horgoš: ko je uhapšen a ko pobegao, poruka po broju uhapšenih i upis tri slova među 10 najboljih (pamti se samo u ovom pregledaču). Posle 5 sekundi bez pritiska nazad na naslovni ekran.",
      "Kartica za deljenje 1080×1080 (taster K na kraju igre): uhapšeni begunci, skor i UnderGRAND radio.",
    ], dorade: [
      "Kad begunac pobegne, NASTAVAK vodi poteru na sledeću deonicu sa istim bodovima; na poslednjoj deonici ide se pravo na kraj.",
      "Dispečerka više ne pominje kofere na krovu kod džipova koji ih nemaju.",
      "Ikonica u UnderGRAND stilu i prečica na desktopu.",
    ] },
    { datum: "2026-11-12", nove: [
      "Begunac u gužvi beži i bankinom kad su sve trake zauzete. I ti možeš bankinom: tamo auto ide do 170 km/h, a tek njiva usporava na 90.",
    ], dorade: [
      "Teže je: džip je brži, manje popušta kad zaostaneš, izmiče kad mu priđeš, češće baca predmete, a posle svakog udarca na kratko pobegne, pa svaki sledeći udarac traži novo sustizanje.",
      "Okvir sa brzinom je sređen: broj je poravnat uz KM/H, ispod je BRZINA i menjač LO/HI (uključen svetli), natpis TURBO i tri polja su poravnati sa okvirom, a FPS je dole levo.",
    ] },
    { datum: "2026-11-12", nove: [], dorade: [
      "Džip više ne prolazi kroz druga vozila: iza sporijeg uspori i drži razmak, a u susednu traku prelazi samo kad je slobodna. Isto važi i za saobraćaj među sobom i prema policijskom autu.",
      "Kad policijskim autom zađeš bočno u vozilo pored (na primer uz dugačak autobus ili kamion), odbiješ se u stranu umesto da prođeš kroz njega.",
    ] },
    { datum: "2026-11-12", nove: [
      "Nov kamion u saobraćaju: tamić (manji, sa maslinastom ceradom), pored velikog kamiona.",
      "Džip može da se udari i sa strane, kad ste rame uz rame.",
    ], dorade: [
      "Sva vozila su u stvarnim merama i ujednačena: fića, mali auto, policijski auto, džip, kombi, tamić, kamion, autobus i traktor su međusobno veliki koliko i u stvarnosti. Kamera je sada iza policijskog auta (kao u arkadnim poterama), pa je džip kad ga stigneš skoro iste veličine kao tvoj auto.",
      "Bandere, topole, bilbordi, putokazi, salaši i biljke na njivi su u stvarnoj veličini i na stvarnim razmacima, a njive su duže.",
    ] },
    { datum: "2026-11-12", nove: [
      "Prva beta: UnderGRAND Potera do Horgoša - voziš policijski auto NS-007 i juriš džip begunca autoputem ka Horgošu, u izgledu Amiga igara.",
      "Deonica 3 \"Bačka ravnica\" u zalasku sunca, kao na odobrenom predlogu: njive žita, suncokreta, kukuruza i uzorane zemlje, traktori na njivama, topole, salaši, bandere, putokazi i bilbordi sa satiričnim natpisima.",
      "Vožnja: gas, kočnica, menjač HI/LO, tri turba po deonici, krivine i blagi usponi; van puta auto usporava i diže prašinu, a u sudaru sa saobraćajem samo se trese.",
      "Saobraćaj: fića, mali auto, kamion sa ceradom, autobus i spori traktor na autoputu.",
      "Potera: džip kreće 2 km ispred, vijuga, koči i izbacuje kofere, kese sa novcem i fascikle \"POVERLJIVO\"; deset udaraca i begunac je uhapšen, a ako istekne 60 sekundi - stiže razglednica iz inostranstva.",
      "Dispečerka Dragana javlja šta se dešava, a pečat \"UHAPŠEN!\" i bonus za preostalo vreme i vožnju bez sudara stižu na kraju deonice.",
      "CRT efekat (sjaj, linije i tamne ivice) može da se isključi dugmetom gore, tasterom C ili u pauzi; radi i gamepad.",
    ], dorade: [] },
  ];

  // 0.Y.Z iz cele istorije (kao u Bronxampu): Y = sve novo, Z = sve dorade; nikad se ne vraća na nulu.
  let novih = 0, dorada = 0;
  for (let i = VERZIJE.length - 1; i >= 0; i--) {
    novih += VERZIJE[i].nove.length;
    dorada += VERZIJE[i].dorade.length;
    VERZIJE[i].v = `0.${novih}.${dorada}`;
  }
  // Svaka stavka nosi svoju vrstu: + novo, − dorada i ispravka (korisnik 20. 11. 2026).
  const linije = (x) => [...x.nove.map((t) => ["ver-novo", t]), ...x.dorade.map((t) => ["ver-dorada", t])];

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
        <ul>${linije(x).map(([k, t]) => `<li class="${k}" title="${k === "ver-novo" ? "Novo" : "Dorada ili ispravka"}">${esc(t)}</li>`).join("")}</ul>
      </section>`).join("")}
      </div>`;
    dlg.showModal();
  }

  document.addEventListener("click", (e) => { if (e.target.closest("[data-verzije]")) open(); });
  // Dugme iz statičkog HTML-a dobija broj verzije; aplikacije koje same crtaju zaglavlje koriste window.APP_VERZIJA.
  document.querySelectorAll("[data-verzije]").forEach((el) => { if (!el.textContent.trim()) el.textContent = `v${VERZIJE[0].v}`; });
})();
