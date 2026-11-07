// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Broj se NE piše rukom (isto pravilo kao u Bronxampu, korisnik 7. 11. 2026): verzija je 0.Y.Z, gde je
// Y broj svih novih stvari od početka, a Z broj svih dorada i ispravki; nijedan se ne vraća na nulu.
// Računa ga `numerisi` iz spiskova `nove` i `dorade` — zato se brojevi starih verzija menjaju ako se stavka prekategorizuje.
// Nov unos ide NA VRH liste: datum, `nove` (šta je novo) i `dorade` (dorade i ispravke); oznaka vrste se računa sama.
(() => {
  const VERZIJE = [
    { datum: "2026-10-28",
      nove: [
        "Rezervna kopija i kao CSV fajl za Excel: u folderu save se posle svake izmene sam pravi riftbound-kolekcija.csv (kod, ime, set, tip, retkost, domen, broj primeraka i cena), a dugme „Sačuvaj kao CSV (Excel)“ ga čuva u Preuzimanja.",
        "Kolekcija može da se vrati i iz CSV fajla: „Učitaj fajl…“ ubaci fajl u polje, pa „Učitaj iz teksta“.",
      ],
      dorade: [] },
    { datum: "2026-10-28",
      nove: [],
      dorade: [
        "Novi naziv aplikacije: UnderGRAND Riftbound collection (u naslovu prozora, zaglavlju i na prečici na desktopu).",
      ] },
    { datum: "2026-10-27",
      nove: [],
      dorade: [
        "Ispravljeno: dopunske karte (npr. Shadow Clone // Tentacle) nisu se pojavljivale ako su cene bile preuzete malo pre prelaska na novu verziju.",
        "Ispravljeno: neke dopunske karte (npr. tokeni Mech // Buff, Sand Soldier // Buff, Mech // Recruit) bile su bez slike jer je TCGplayer nema; sada se slika uzima sa riftbound.gg.",
      ] },
    { datum: "2026-10-27",
      nove: [
        "Karte kojih nema u glavnoj bazi sada se dopunjuju sa TCGplayer-a: Vendetta i Unleashed tokeni (npr. Shadow Clone // Tentacle, VEN-T05) i ceo novi set Radiance. Mogu da se dodaju u kolekciju, imaju sliku, tekst i cenu.",
        "Dvostrane karte se u „Uvezi spisak“ prepoznaju i po imenu jedne strane (npr. samo „Shadow Clone“).",
      ],
      dorade: [] },
    { datum: "2026-10-27",
      nove: [],
      dorade: [
        "Ispravljeno: 9 Vendetta karata (Mel, Defiant Soul, Zed, Without a Sound, Shen, Scourge of Shadows, obe Akali, obe Ambessa, Jayce i Renekton) prikazivalo se sa alternativnim crtežom, pa ih je bilo teško prepoznati. Sada imaju običan crtež, kao na karti iz kesice.",
      ] },
    { datum: "2026-10-27",
      nove: [
        "U kartici „Dodaj karte u kolekciju“ je novi deo „Uvezi spisak“: nalepi ili ukucaj spisak karata (npr. ceo špil, bundle ili kesicu), jedna karta u redu, imenom ili kodom, sa brojem primeraka.",
        "Pre dodavanja vidiš šta je prepoznato i koliko ćeš imati posle uvoza, a redovi koje aplikacija ne prepozna su posebno označeni.",
        "Posle uvoza možeš jednim klikom da ga poništiš.",
      ],
      dorade: [] },
    { datum: "2026-10-24",
      nove: [
        "U zaglavlju je prekidač „Efekat“: uključuje i isključuje crno-beli zrnasti izgled karata. Kad je isključen, sve karte su odmah u boji. Izbor se pamti.",
      ],
      dorade: [] },
    { datum: "2026-10-22",
      nove: [],
      dorade: [
        "Karte u kolekciji su crno-bele i zrnaste, kao štampani plakat; kad pređeš mišem preko karte, polako se pojavi u punim bojama. Prozor karte ostaje u boji.",
      ] },
    { datum: "2026-10-21",
      nove: [
        "„Moja kolekcija“ ima izbor „Ređaj po“: set i broj, ime, energija, Might, kupljeni špil, broj primeraka, cena i retkost, uz dugme za obrnut redosled. Izbor se pamti.",
        "Kod energije, Might-a, retkosti i kupljenog špila karte su podeljene u grupe sa naslovom i brojem karata; karte bez te vrednosti (npr. rune) idu na kraj.",
        "Po kupljenom špilu: karte iz Proving Grounds, Vendetta Showdown i Vi špila su u svojoj grupi (karta iz više špilova je u svakom), a ostale pod „Iz boostera i ostalo“.",
        "Kad je izabrana cena, na svakoj karti piše koliko vredi.",
      ],
      dorade: [] },
    { datum: "2026-10-19",
      nove: [
        "Riftbound kolekcija je i na webu (gomez021ns-jpg.github.io/undergrand-aplikacije): svako može da vodi svoju kolekciju - čuva se u njegovom pregledaču i kreće prazna, sa cenama od poslednje objave sajta. Tvoja kolekcija se ne objavljuje i kod tebe sve radi kao do sada.",
      ],
      dorade: [] },
    { datum: "2026-10-18",
      nove: [
        "Nova kartica „Kolekcionar“: procenjena vrednost cele kolekcije po TCGplayer cenama, vrednost po setu i tvojih 10 najvrednijih karata (klik otvara kartu).",
        "Kompletiranje setova: za Origins, Proving Grounds, Spiritforged, Unleashed i Vendetta vidiš koliko karata imaš od ukupnog broja, i po retkosti.",
        "Za izabrani set spisak karata koje ti fale, sa cenom i koliko bi koštalo da dopuniš ceo set; može po retkosti i od najjeftinije ili najskuplje.",
      ],
      dorade: [] },
    { datum: "2026-10-16",
      nove: [
        "Novi izgled prozora karte: veća slika, troškovi i Might kao ikonice, tekst karte pregledniji.",
        "Simboli u tekstu karte (Might, energija, moć domena, exhaust) prikazuju se kao ikonice, a ključne reči (Hidden, Reaction, Assault…) su istaknute.",
        "Ispod teksta piše šta znače simboli i ključne reči sa te karte (na srpskom).",
        "U donjem desnom uglu je trenutna cena karte na tržištu (TCGplayer), uz foil cenu i link ka ponudama.",
      ],
      dorade: [] },
    { datum: "2026-10-15",
      nove: [
        "Kolekcija se sama čuva u folder save pored aplikacije, bez pitanja za dozvolu, i odatle se učitava pri svakom otvaranju.",
        "Aplikacija se sada pokreće prečicom kao Moji albumi i Kompilacije (mali crni prozor u pozadini); zatvori ga kad završiš.",
      ],
      dorade: [
        "U Rezervnoj kopiji piše tačno gde je fajl kolekcije, a dugme „Otvori folder save“ ga otvara.",
      ] },
    { datum: "2026-10-15",
      nove: [
        "Nova kartica „Dodaj karte u kolekciju“: pretraga cele baze (podnosi i sitne greške u kucanju) i dodavanje više primeraka odjednom, npr. posle otvaranja boostera.",
        "„Kolekcija“ je sada „Moja kolekcija“, sa brojem svih i različitih karata, i otvara se prva.",
        "Automatsko čuvanje kolekcije u folder save pored aplikacije, uz dnevni snimak. Kad čuvanje ne radi, u gornjoj traci se pojavi upozorenje.",
        "U kolekciju mogu da se unesu i token karte (ne ulaze u predlog špila).",
        "Predlog špila jasnije razdvaja Chosen Championa koji fali od manjka ostalih karata, a za karte koje fale nudi dugme za dodavanje.",
      ],
      dorade: [
        "Ispravljeno: Master of Shadows sada prepoznaje Zeda kao svog šampiona.",
      ] },
    { datum: "2026-10-15",
      nove: [
        "Prva verzija: kolekcija karata sa slikama (cela Riftbound baza sa riftcodex.com), sa filterima po domenu, tipu i setu i dugmićima za broj primeraka.",
        "Kolekcija je napunjena iz kupljenih špilova: Proving Grounds (Annie, Lux, Garen, Master Yi), Vendetta Showdown (Zed i Shen) i Unleashed Champion Deck (Vi).",
        "Predlog špila: za svakog Legenda koga imaš složi 40 karata od tvoje kolekcije, sa krivom energije, runama, bojnim poljima, upozorenjima i kartama koje bi ga ojačale.",
        "Rezervna kopija kolekcije (tekst ili fajl) i vraćanje na osnovne špilove.",
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
