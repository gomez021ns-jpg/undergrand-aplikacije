// Verzija aplikacije i istorija izmena (prozor „Šta je novo“).
// Svaka izmena za korisnika = nov unos NA VRH liste, sa datumom i brojem X.Y.Z po veličini promene:
// X = novi veliki deo aplikacije, Y = nova funkcija, Z = dorada ili ispravka (manji brojevi se tada vraćaju na 0).
// Oznaka vrste (Novi deo / Novo / Dorada) računa se sama iz broja.
(() => {
  const VERZIJE = [
    { v: "1.3.1", datum: "2026-10-29", izmene: [
      "UnderGRAND logo u zaglavlju vodi na undergrandradio.com, a ispod igre piše „Igra UnderGRAND radija“ sa linkom.",
      "Kad je prozor uzan (ili je igra ugrađena u stranicu drugog sajta), tabla se smanji da cela stane na ekran.",
    ] },
    { v: "1.3.0", datum: "2026-10-29", izmene: [
      "Muzika za sve tri table: Klub ima ska-pank (gitara na „i“, „duvači“ sa melodijom, pa brzi refren), a Grad hardcore (najbrži, sa sporim teškim delom u sredini).",
      "Fontovi su sada u samoj igri: izgled je isti i bez interneta, a igra ne učitava ništa sa drugih sajtova.",
      "Kod rekorda piše da se čuvaju samo u ovom pregledaču i ne šalju se nikome.",
      "Igra je spremna za sajt UnderGRAND aplikacija.",
    ] },
    { v: "1.2.0", datum: "2026-10-28", izmene: [
      "Pozadinska muzika u pank stilu za prvu tablu (Podrum): izobličena gitara, bas i bubnjevi, refren sa melodijom i „stop“ deo. Pesma je naša, pravi je sama igra.",
      "Kad se odvrne pojačalo na 11, muzika ubrza, a kako se tabla prazni, tempo blago raste. Na pauzi i posle gubitka života je tišina, pa nastavlja odakle je stala.",
      "Novo dugme „Muzika“ u zaglavlju (i taster N), odvojeno od „Zvuk“ (M). Igra pamti izbor. Klub i Grad za sada nemaju muziku.",
    ] },
    { v: "1.1.4", datum: "2026-10-28", izmene: [
      "Zvuk je glasniji (oko tri puta), a ne krči ni kad se više efekata poklopi.",
      "Novi život na svakih 7.000 poena (7.000, 14.000, 21.000...), umesto samo jednom na 10.000. Kad ih ima više od pet, pored sličica piše „+n“.",
    ] },
    { v: "1.1.3", datum: "2026-10-28", izmene: [
      "Novi naziv aplikacije: UnderGRAND Punkman (u naslovu prozora i na prečici na desktopu).",
    ] },
    { v: "1.1.2", datum: "2026-10-28", izmene: [
      "Tunel: čim Punkman (ili neprijatelj) uđe u crni deo sa strane table, odmah izlazi na suprotnoj strani, umesto da prolazi kroz ceo crni deo.",
    ] },
    { v: "1.1.1", datum: "2026-10-28", izmene: [
      "Veća tabla: sada se širi koliko dozvoli visina prozora (na većem ekranu i preko 800 tačaka umesto 560).",
      "Skor, rekord, životi, tabla i pojačalo su prešli u desnu kolonu, iznad rekorda, da tabla dobije celu visinu.",
    ] },
    { v: "1.1.0", datum: "2026-10-28", izmene: [
      "Rekordi desno od igre: deset najboljih, sa tri slova igrača, poenima, tablom do koje je stigao i datumom.",
      "Ko na kraju igre uđe među deset najboljih, upisuje svoja tri slova (mogu i Č, Ć, Ž, Š, Đ), pa Enter ili „Upiši“. Novi upis se istakne žuto, a igra pamti poslednja slova za sledeći put.",
    ] },
    { v: "1.0.0", datum: "2026-10-28", izmene: [
      "Prva verzija u UnderGRAND aplikacijama: Punkman, panker sa krestom koji jede zihernadle, bedževe i kasete i beži od sistema.",
      "Tri table (Podrum za probe, Klub, Grad), sve teže, i „Bis!“ posle treće - novi krug sa bržim protivnicima.",
      "Četiri neprijatelja: Murija, Menadžer izdavačke kuće, Pop zvezda iz rijalitija i Komunalni inspektor sa racijama.",
      "Pojačalo „odvrnuto na 11“ tera neprijatelje u bekstvo, a bonusi (gitara, kožna jakna, demo-snimak) donose dodatne poene.",
      "UnderGRAND logo, oznaka verzije i dugme „Pun ekran“ u zaglavlju, kao u ostalim aplikacijama.",
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
