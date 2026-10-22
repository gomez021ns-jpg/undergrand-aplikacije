// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Svaka izmena za korisnika = nov unos NA VRH liste, sa datumom i brojem X.Y.Z po veličini promene:
// X = novi veliki deo aplikacije, Y = nova funkcija, Z = dorada ili ispravka (manji brojevi se tada vraćaju na 0).
// Oznaka vrste (Novi deo / Novo / Dorada) računa se sama iz broja.
(() => {
  const VERZIJE = [
    { v: "1.6.1", datum: "2026-10-22", izmene: [
      "Karte u kolekciji su crno-bele i zrnaste, kao štampani plakat; kad pređeš mišem preko karte, polako se pojavi u punim bojama. Prozor karte ostaje u boji.",
    ] },
    { v: "1.6.0", datum: "2026-10-21", izmene: [
      "„Moja kolekcija“ ima izbor „Ređaj po“: set i broj, ime, energija, Might, kupljeni špil, broj primeraka, cena i retkost, uz dugme za obrnut redosled. Izbor se pamti.",
      "Kod energije, Might-a, retkosti i kupljenog špila karte su podeljene u grupe sa naslovom i brojem karata; karte bez te vrednosti (npr. rune) idu na kraj.",
      "Po kupljenom špilu: karte iz Proving Grounds, Vendetta Showdown i Vi špila su u svojoj grupi (karta iz više špilova je u svakom), a ostale pod „Iz boostera i ostalo“.",
      "Kad je izabrana cena, na svakoj karti piše koliko vredi.",
    ] },
    { v: "1.5.0", datum: "2026-10-19", izmene: [
      "Riftbound kolekcija je i na webu (gomez021ns-jpg.github.io/undergrand-aplikacije): svako može da vodi svoju kolekciju - čuva se u njegovom pregledaču i kreće prazna, sa cenama od poslednje objave sajta. Tvoja kolekcija se ne objavljuje i kod tebe sve radi kao do sada.",
    ] },
    { v: "1.4.0", datum: "2026-10-18", izmene: [
      "Nova kartica „Kolekcionar“: procenjena vrednost cele kolekcije po TCGplayer cenama, vrednost po setu i tvojih 10 najvrednijih karata (klik otvara kartu).",
      "Kompletiranje setova: za Origins, Proving Grounds, Spiritforged, Unleashed i Vendetta vidiš koliko karata imaš od ukupnog broja, i po retkosti.",
      "Za izabrani set spisak karata koje ti fale, sa cenom i koliko bi koštalo da dopuniš ceo set; može po retkosti i od najjeftinije ili najskuplje.",
    ] },
    { v: "1.3.0", datum: "2026-10-16", izmene: [
      "Novi izgled prozora karte: veća slika, troškovi i Might kao ikonice, tekst karte pregledniji.",
      "Simboli u tekstu karte (Might, energija, moć domena, exhaust) prikazuju se kao ikonice, a ključne reči (Hidden, Reaction, Assault…) su istaknute.",
      "Ispod teksta piše šta znače simboli i ključne reči sa te karte (na srpskom).",
      "U donjem desnom uglu je trenutna cena karte na tržištu (TCGplayer), uz foil cenu i link ka ponudama.",
    ] },
    { v: "1.2.0", datum: "2026-10-15", izmene: [
      "Kolekcija se sama čuva u folder save pored aplikacije, bez pitanja za dozvolu, i odatle se učitava pri svakom otvaranju.",
      "Aplikacija se sada pokreće prečicom kao Moji albumi i Kompilacije (mali crni prozor u pozadini); zatvori ga kad završiš.",
      "U Rezervnoj kopiji piše tačno gde je fajl kolekcije, a dugme „Otvori folder save“ ga otvara.",
    ] },
    { v: "1.1.0", datum: "2026-10-15", izmene: [
      "Nova kartica „Dodaj karte u kolekciju“: pretraga cele baze (podnosi i sitne greške u kucanju) i dodavanje više primeraka odjednom, npr. posle otvaranja boostera.",
      "„Kolekcija“ je sada „Moja kolekcija“, sa brojem svih i različitih karata, i otvara se prva.",
      "Automatsko čuvanje kolekcije u folder save pored aplikacije, uz dnevni snimak. Kad čuvanje ne radi, u gornjoj traci se pojavi upozorenje.",
      "U kolekciju mogu da se unesu i token karte (ne ulaze u predlog špila).",
      "Predlog špila jasnije razdvaja Chosen Championa koji fali od manjka ostalih karata, a za karte koje fale nudi dugme za dodavanje.",
      "Ispravljeno: Master of Shadows sada prepoznaje Zeda kao svog šampiona.",
    ] },
    { v: "1.0.0", datum: "2026-10-15", izmene: [
      "Prva verzija: kolekcija karata sa slikama (cela Riftbound baza sa riftcodex.com), sa filterima po domenu, tipu i setu i dugmićima za broj primeraka.",
      "Kolekcija je napunjena iz kupljenih špilova: Proving Grounds (Annie, Lux, Garen, Master Yi), Vendetta Showdown (Zed i Shen) i Unleashed Champion Deck (Vi).",
      "Predlog špila: za svakog Legenda koga imaš složi 40 karata od tvoje kolekcije, sa krivom energije, runama, bojnim poljima, upozorenjima i kartama koje bi ga ojačale.",
      "Rezervna kopija kolekcije (tekst ili fajl) i vraćanje na osnovne špilove.",
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
