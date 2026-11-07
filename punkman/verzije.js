// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Broj se NE piše rukom (isto pravilo kao u Bronxampu, korisnik 7. 11. 2026): verzija je 0.Y.Z, gde je
// Y broj svih novih stvari od početka, a Z broj svih dorada i ispravki; nijedan se ne vraća na nulu.
// Računa ga `numerisi` iz spiskova `nove` i `dorade` — zato se brojevi starih verzija menjaju ako se stavka prekategorizuje.
// Nov unos ide NA VRH liste: datum, `nove` (šta je novo) i `dorade` (dorade i ispravke); oznaka vrste se računa sama.
(() => {
  const VERZIJE = [
    { datum: "2026-11-07", nove: [
      "Varnice kad pojedeš zihadrnu, bedž ili duha.",
      "Ivice zidova svetle dok traje pojačalo (neon odsjaj preko cele table).",
    ], dorade: [
      "Zidovi su svetliji i imaju senku uz pod, pa se lavirint odmah vidi.",
      "Zihadrne su deblje i svetlije — lakše se prate u mraku.",
      "Duhovi imaju tanku tamnu konturu i ne stapaju se sa pozadinom ni sa ivicama zidova.",
    ] },
    { datum: "2026-11-01", nove: [
      "Demo kao na arkadi: ako niko ne krene u roku od 10 sekundi, panker 20 sekundi igra sam (redom Podrum, Klub i Grad), pa se igra vraća na početni ekran. Enter ili razmak usred dema odmah pokreće pravu igru, a bilo koji drugi taster ili klik vraća na početni ekran. Demo je bez zvuka i ne ulazi u rekorde.",
      "Svi flajeri preko table (početak, kraj svirke, upis rekorda, sledeća tabla) su sada poravnati na sredinu. Ako posle kraja svirke 5 sekundi ništa ne pritisneš, igra se vraća na početni ekran i pušta demo (upis tri slova za rekorde čeka koliko treba).",
    ], dorade: [] },
    { datum: "2026-10-31", nove: [
      "Novi okvir „Privatnost“ desno, ispod rekorda: igra ne prikuplja ničije podatke, nema praćenja, reklama ni kolačića za praćenje, a rekordi i podešavanja ostaju samo u pregledaču na tvom računaru.",
    ], dorade: [
      "Sređen izgled: listovi više nisu nakrivljeni i ništa ne štrči van ivica; Postava i Turneja su ispod table jedna pored druge; pojačalo i bonusi su u istom redu, sa natpisima kao u skoru.",
      "Ispravljeno: na uskom prozoru tabla se ponekad nije smanjila do kraja, a na telefonu je izlazila nekoliko tačaka van ekrana.",
    ] },
    { datum: "2026-10-29", nove: [
      "UnderGRAND logo u zaglavlju vodi na undergrandradio.com, a ispod igre piše „Igra UnderGRAND radija“ sa linkom.",
    ], dorade: [
      "Kad je prozor uzan (ili je igra ugrađena u stranicu drugog sajta), tabla se smanji da cela stane na ekran.",
    ] },
    { datum: "2026-10-29", nove: [
      "Muzika za sve tri table: Klub ima ska-pank (gitara na „i“, „duvači“ sa melodijom, pa brzi refren), a Grad hardcore (najbrži, sa sporim teškim delom u sredini).",
      "Fontovi su sada u samoj igri: izgled je isti i bez interneta, a igra ne učitava ništa sa drugih sajtova.",
      "Igra je spremna za sajt UnderGRAND aplikacija.",
    ], dorade: [
      "Kod rekorda piše da se čuvaju samo u ovom pregledaču i ne šalju se nikome.",
    ] },
    { datum: "2026-10-28", nove: [
      "Pozadinska muzika u pank stilu za prvu tablu (Podrum): izobličena gitara, bas i bubnjevi, refren sa melodijom i „stop“ deo. Pesma je naša, pravi je sama igra.",
      "Kad se odvrne pojačalo na 11, muzika ubrza, a kako se tabla prazni, tempo blago raste. Na pauzi i posle gubitka života je tišina, pa nastavlja odakle je stala.",
      "Novo dugme „Muzika“ u zaglavlju (i taster N), odvojeno od „Zvuk“ (M). Igra pamti izbor. Klub i Grad za sada nemaju muziku.",
    ], dorade: [] },
    { datum: "2026-10-28", nove: [
      "Novi život na svakih 7.000 poena (7.000, 14.000, 21.000...), umesto samo jednom na 10.000. Kad ih ima više od pet, pored sličica piše „+n“.",
    ], dorade: [
      "Zvuk je glasniji (oko tri puta), a ne krči ni kad se više efekata poklopi.",
    ] },
    { datum: "2026-10-28", nove: [], dorade: [
      "Novi naziv aplikacije: UnderGRAND Punkman (u naslovu prozora i na prečici na desktopu).",
    ] },
    { datum: "2026-10-28", nove: [], dorade: [
      "Tunel: čim Punkman (ili neprijatelj) uđe u crni deo sa strane table, odmah izlazi na suprotnoj strani, umesto da prolazi kroz ceo crni deo.",
    ] },
    { datum: "2026-10-28", nove: [], dorade: [
      "Veća tabla: sada se širi koliko dozvoli visina prozora (na većem ekranu i preko 800 tačaka umesto 560).",
      "Skor, rekord, životi, tabla i pojačalo su prešli u desnu kolonu, iznad rekorda, da tabla dobije celu visinu.",
    ] },
    { datum: "2026-10-28", nove: [
      "Rekordi desno od igre: deset najboljih, sa tri slova igrača, poenima, tablom do koje je stigao i datumom.",
      "Ko na kraju igre uđe među deset najboljih, upisuje svoja tri slova (mogu i Č, Ć, Ž, Š, Đ), pa Enter ili „Upiši“. Novi upis se istakne žuto, a igra pamti poslednja slova za sledeći put.",
    ], dorade: [] },
    { datum: "2026-10-28", nove: [
      "Prva verzija u UnderGRAND aplikacijama: Punkman, panker sa krestom koji jede zihernadle, bedževe i kasete i beži od sistema.",
      "Tri table (Podrum za probe, Klub, Grad), sve teže, i „Bis!“ posle treće - novi krug sa bržim protivnicima.",
      "Četiri neprijatelja: Murija, Menadžer izdavačke kuće, Pop zvezda iz rijalitija i Komunalni inspektor sa racijama.",
      "Pojačalo „odvrnuto na 11“ tera neprijatelje u bekstvo, a bonusi (gitara, kožna jakna, demo-snimak) donose dodatne poene.",
      "UnderGRAND logo, oznaka verzije i dugme „Pun ekran“ u zaglavlju, kao u ostalim aplikacijama.",
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
