// Worms: The Board Game - vodič za početnike (kartica „Za početnike“).
// Pravila su ista kao u worms.js (konačni pravilnik, Mantic 2023) - ovde su objašnjena polako i redom.
// Saveti su označeni kao saveti, ne kao pravila.
(() => {
const { FIG_W_TURN, FIG_W_DIRS } = window.W_FIG;
const game = window.GAMES.find((g) => g.id === "worms");
if (!game) return;
const L = (tab, text) => `<a href="#/igra/worms/${tab}">${text}</a>`;

game.beginner = [
  {
    id: "wp-kako",
    title: "Kako da naučiš igru",
    html: `
      <p>Worms je haotična i zabavna igra - ništa ne ide po planu, i to je poenta. Pravila su kratka; najviše se uči čitanjem kockica.</p>
      <ol>
        <li>Pročitaj <b>„Igra u pet minuta“</b> i <b>„Kockice: šta znače strane“</b>.</li>
        <li>Postavi sto po poglavlju <b>„Prva partija: postavljanje“</b> - u njoj svaki tim ima samo 2 crva.</li>
        <li>Igraj, a pored sebe drži <b>„Tvoj potez: kontrolna lista“</b> (ili odštampaj vodič: „Štampaj / PDF“ → „Vodič za početnike“).</li>
        <li>Kad prvi put pucaš, prati <b>„Prvi pucanj: Bazooka korak po korak“</b>.</li>
        <li>Posle prve partije igraj sa 4 crva i pređi na ${L("podsetnik", "Brzi podsetnik")}.</li>
      </ol>
      <div class="note"><b>Savet za prvu partiju:</b> svaki pucanj i skok najavite naglas („skačem ovde, bacam za Scatter“) i zajedno pročitajte šta je palo. Smejte se lošim bacanjima - u Worms-u ih ima mnogo.</div>`
  },
  {
    id: "wp-ideja",
    title: "Igra u pet minuta",
    html: `
      <p>Svako ima tim crva na mapi od šestouglova (heksova). Gađate se oružjem iz video-igre - bazukama, granatama, ovcama koje eksplodiraju - a vetar i rasipanje vam kvare nišan.</p>
      <ul>
        <li>U svom potezu biraš <b>jednog</b> crva: pomeriš ga do dva puta i ispališ <b>jedno</b> oružje (kartu iz ruke).</li>
        <li><b>Crv podnosi dva pogotka:</b> prvi ga obori (polegneš figuru - oštećen je), drugi ga uništi. Oštećenog crva izlečiš tako što ga aktiviraš u svom potezu.</li>
        <li><b>Voda ubija odmah.</b> Crv koji upadne u vodu (ili ga odbaci sa mape) je uništen.</li>
        <li>Nova oružja dobijaš iz kutija (<b class="kw">Supply Crate</b>) na mapi.</li>
        <li><b>Kraj:</b> čim neki igrač ostane bez crva, svi igraju još po jedan potez. <b>Pobeđuje ko ima najviše crva.</b></li>
      </ul>
      <div class="example"><b>Kako da objasniš drugaru za minut:</b> „Svako ima crve. U potezu pomeriš jednog crva i ispališ jedno oružje. Prvi pogodak ga obori, drugi ga ubije, a voda ga ubija odmah. Kockice odlučuju koliko si precizan i gde šta leti. Kad neko ostane bez crva, još jedan krug - i ko ima najviše crva, pobedio je.“</div>`
  },
  {
    id: "wp-reci",
    title: "Reči koje moraš znati",
    html: `
      <table>
        <tr><th>Reč</th><th>Šta znači</th></tr>
        <tr><td><b>Heks</b></td><td>Šestougaono polje na mapi. U jednom heksu mogu biti <b>najviše 3 stvari</b>.</td></tr>
        <tr><td><b>Stvar</b> (Thing)</td><td>Crvi, burad, kutije, mine, krateri i vatra.</td></tr>
        <tr><td><b class="kw">Inch</b></td><td>Korak: pomeri crva na <b>susedni</b> kopneni heks.</td></tr>
        <tr><td><b class="kw">Jump</b></td><td>Skok: na bilo koji heks <b>do 2</b> daleko, pa baci za <b>Scatter</b> (gde zapravo padneš).</td></tr>
        <tr><td><b class="kw">Scatter</b></td><td>Rasipanje: bacanje koje kaže da li se nešto pomera 1 heks i u kom pravcu.</td></tr>
        <tr><td><b class="kw">Wind Dial</b></td><td>Točak vetra na sredini mape - pokazuje pravac vetra (1–6).</td></tr>
        <tr><td><b class="kw">Direct hex</b></td><td>Heks u pravoj liniji od crva, u jednom od 6 pravaca.</td></tr>
        <tr><td><b class="kw">Accuracy X</b></td><td>Preciznost: bacaš X kockica i biraš najbolju. Što je meta dalje, X je manji.</td></tr>
        <tr><td><b class="kw">Blast</b></td><td>Eksplozija u heksu: krater + šteta i odbacivanje svega u njemu.</td></tr>
        <tr><td><b class="kw">Target Token</b></td><td>Žeton mete (ide u heks koji gađaš). Između poteza pokazuje ko je na redu.</td></tr>
        <tr><td><b class="kw">Danger Flipper</b></td><td>„Novčić“: Danger (opasnost) ili Safe (bezbedno).</td></tr>
        <tr><td><b class="kw">Drop</b> karta</td><td>Na kraju svakog poteza jedna: nove kutije, mine, promena vetra…</td></tr>
      </table>`
  },
  {
    id: "wp-sto",
    title: "Prva partija: postavljanje",
    html: `
      <p>Za prvu partiju pravilnik ima <b>uprošćeno postavljanje</b>:</p>
      <ol>
        <li><b>Mapa:</b> postavite pločice i stvari prema slici u pravilniku (str. 15). Za 2 igrača uklonite pločice označene sa 2 i 3; za 3 igrača pločicu označenu sa 3.</li>
        <li><b>Crvi:</b> svaki tim ima samo <b>2 crva</b>.</li>
        <li><b>Karte:</b> izdvojite Starter karte oružja (tamnija leđa). Svako uzima <b>Uzi, Bazooka, Ninja Rope i Girder</b>, plus jednu nasumičnu od ostalih Starter karata. To je 5 karata - drži ih u tajnosti.</li>
        <li><b>Supply Deck:</b> promešajte sve ostale karte oružja (ne-Starter).</li>
        <li><b>Drop Deck:</b> jednu <b>Sudden Death</b> kartu (ne gledajući) licem nadole, a preko nje promešanih <b>2 Drop karte po igraču + još 2</b>. Ostatak Drop i Sudden Death karata u kutiju.</li>
        <li><b>Vetar</b> postavite na <b>2</b>.</li>
        <li><b>Target Token</b> dobija <b>plavi</b> igrač - neka to bude onaj ko najbolje zna pravila. On igra prvi.</li>
      </ol>
      <div class="note">Od druge partije postavljanje je zabavniji deo igre: svi zajedno slažete mapu i stvari, a timove (boje) delite <b>tek posle toga</b>, nasumično. Vidi ${L("pravila", "Puna pravila")} → „Priprema igre“.</div>`
  },
  {
    id: "wp-potez",
    title: "Tvoj potez: kontrolna lista",
    html: `
      ${FIG_W_TURN}
      <table>
        <tr><th>Korak</th><th>Šta radiš</th><th>Na šta da paziš</th></tr>
        <tr><td><b>1 · Aktiviraj</b></td><td>Izaberi jednog svog crva.</td><td>Stoji na kutiji? Vuci kartu oružja.</td></tr>
        <tr><td><b>2 · Izleči</b></td><td>Ako je oboren (leži) - podigni ga. Opet je potpuno zdrav.</td><td>Najlakši način da spaseš crva!</td></tr>
        <tr><td><b>3 · Pomeri</b></td><td>Inch ili Jump - ili ništa.</td><td rowspan="2">Svaki heks u koji uđeš: proveri minu, vatru, kutiju, vodu.</td></tr>
        <tr><td><b>4 · Pomeri opet</b></td><td>Još jednom Inch ili Jump - ili ništa.</td></tr>
        <tr><td><b>5 · Oružje</b></td><td>Odigraj jednu kartu iz ruke (opciono).</td><td>Simboli na karti se rešavaju s leva na desno.</td></tr>
        <tr><td><b>6 · Kraj poteza</b></td><td>Efekti koji kažu „na kraju poteza“.</td><td></td></tr>
        <tr><td><b>7 · Drop</b></td><td>Otkrij gornju Drop kartu i uradi šta piše.</td><td>Posle Sudden Death karte - njen „Drop“ deo.</td></tr>
        <tr><td><b>8 · Target Token</b></td><td>Daj Target Token igraču levo.</td><td>Sad je on na potezu.</td></tr>
      </table>
      <div class="note"><b>Važno:</b> ako tvoj crv bude oboren ili uništen <b>u tvom potezu</b> (npr. sopstvenom eksplozijom), završi tekst karte koju si igrao i <b>odmah pređi na korak 6</b>. Nema više pomeranja ni pucanja.</div>`
  },
  {
    id: "wp-kockice",
    title: "Kockice: šta znače strane",
    html: `
      ${FIG_W_DIRS}
      <p>Svaka strana kockice je ili <b>broj 1–6</b> (pravac, kao na Wind Dial-u), ili <b>simbol vetra</b> (= pravac u koji duva vetar), ili <b>simbol mete</b> (= ništa se ne pomera / pogodak).</p>
      <table>
        <tr><th>Za šta bacaš</th><th>Broj</th><th>Vetar</th><th>Meta</th></tr>
        <tr><td><b class="kw">Accuracy</b> (nišan)</td><td>meta beži 1 heks u tom pravcu</td><td>meta beži 1 heks niz vetar</td><td><b>tačno pogođeno</b></td></tr>
        <tr><td><b class="kw">Blast</b> (eksplozija)</td><td>šteta + odbačen 1 heks u tom pravcu</td><td>šteta + odbačen niz vetar</td><td>samo šteta</td></tr>
        <tr><td><b class="kw">Scatter</b> (posle skoka)</td><td>1 heks u tom pravcu</td><td>1 heks niz vetar</td><td>ostaješ gde si skočio</td></tr>
      </table>
      <div class="example"><b>Primer:</b> crv skoči na heks pored vode i baci za Scatter. Padne „3“, a pravac 3 vodi u vodu → crv je uništen. Da je palo „meta“, ostao bi gde je skočio. Zato pre skoka pogledaj <b>šta je oko ciljnog heksa</b>.</div>`
  },
  {
    id: "wp-pucanj",
    title: "Prvi pucanj: Bazooka korak po korak",
    html: `
      <p>Bazooka imaš u početnoj ruci. Tekst karte: izaberi <b>Direct heks</b> kao metu, baci <b>Accuracy 4</b>, pa <b>Blast</b>.</p>
      <ol>
        <li><b>Izaberi metu.</b> Mora biti u pravoj liniji od tvog crva (jedan od 6 pravaca). Stavi tamo Target Token.</li>
        <li><b>Koliko kockica.</b> Ako je meta u tvom ili susednom heksu - bacaš 4. Za svaki heks dalje 1 manje: na 2 heksa → 3, na 3 heksa → 2, dalje → 1.</li>
        <li><b>Baci i izaberi jednu kockicu.</b> Meta se pomera po tabeli Accuracy (ili ostaje, ako izabereš „metu“).</li>
        <li><b>Blast u heksu gde je meta završila:</b> stavi krater. Za svaku stvar u heksu (<b>prvo crvi</b>) baci kockicu po tabeli Blast: šteta, i eventualno odbacivanje 1 heks.</li>
        <li>Odbačen crv „ulazi“ u novi heks - voda ga ubija, mina može da eksplodira.</li>
      </ol>
      <div class="example"><b>Primer iz pravilnika:</b> protivnički crv nije u pravoj liniji. Plavi zato gađa heks <b>pored</b> njega, na strani odakle duva vetar. Ima 3 kockice; jedna pokaže vetar i meta „odleti“ baš na protivnika. Blast: krater, kockica za crva → oboren i odbačen u jedini bezbedan pravac.</div>
      <div class="note"><b>Savet:</b> ako cilj nije u pravoj liniji, gađaj Direct heks <b>uz vetar</b> od njega - tada te bacanje „vetar“ dovodi pravo na cilj.</div>`
  },
  {
    id: "wp-opasnosti",
    title: "Opasnosti na mapi",
    html: `
      <table>
        <tr><th>Šta</th><th>Kad uđeš u heks</th><th>Kad ga pogodi eksplozija</th></tr>
        <tr><td><b>Voda</b></td><td>Crv (i sve drugo) tone - uništen.</td><td>Blast u vodi ne radi ništa.</td></tr>
        <tr><td><b>Mina</b></td><td>Ukloni je, baci Danger Flipper. „Danger“: eksplodira (Blast u tom heksu).</td><td>Eksplodira (Blast).</td></tr>
        <tr><td><b>Vatra</b></td><td>Ukloni je, baci Danger Flipper. „Danger“: crv je pogođen.</td><td>-</td></tr>
        <tr><td><b>Kutija</b> (Supply Crate)</td><td>Vuci kartu oružja.</td><td>Uništena - nema karte.</td></tr>
        <tr><td><b>Bure</b> (Oil Drum)</td><td>-</td><td>Eksplodira: baci 5 kockica; svaki pravac koji padne dobija štetu i vatru.</td></tr>
        <tr><td><b>3 kratera</b></td><td>-</td><td>Heks se ruši u vodu - sve u njemu je uništeno.</td></tr>
      </table>
      <ul>
        <li>Ako u heksu ima više stvari (npr. mina i kutija), <b>ti biraš redosled</b> - prvo uzmi kutiju.</li>
        <li>Sve van ivice mape se računa kao voda.</li>
      </ul>`
  },
  {
    id: "wp-greske",
    title: "Najčešće greške u prvim partijama",
    html: `
      <table>
        <tr><th>Greška</th><th>Kako je zapravo</th></tr>
        <tr><td>Igra se sa više crva u potezu</td><td>Jedan aktivni crv po potezu.</td></tr>
        <tr><td>Više od dva pomeranja</td><td>Dva Inch/Jump u koracima 3 i 4; dodatna samo ako ih daje strelica na karti oružja.</td></tr>
        <tr><td>Skok bez bacanja</td><td>Posle svakog Jump-a ide Scatter.</td></tr>
        <tr><td>Oboren crv nastavlja potez</td><td>Ako je pogođen u tvom potezu: završi kartu, pa odmah korak 6.</td></tr>
        <tr><td>Zaboravljeno lečenje</td><td>Aktiviran oboren crv se odmah diže (korak 2).</td></tr>
        <tr><td>Pucanje van prave linije</td><td>Bazooka i slična oružja traže Direct heks.</td></tr>
        <tr><td>Uvek 4 kockice za Accuracy</td><td>Za svaki heks preko susednog - kockica manje (najmanje 1).</td></tr>
        <tr><td>Iz više kockica se sabira</td><td>Baca se X kockica i bira <b>jedna</b>.</td></tr>
        <tr><td>4 stvari u heksu</td><td>Najviše 3; četvrta izaziva Knockback Scatter crva iz tog heksa.</td></tr>
        <tr><td>Zaboravljena Drop karta</td><td>Na kraju svakog poteza po jedna.</td></tr>
        <tr><td>Iskorišćena karta oružja ostaje u ruci</td><td>Posle upotrebe ide u kutiju.</td></tr>
        <tr><td>Igra se završava odmah posle eliminacije</td><td>Prvo još po jedan potez za svakog igrača.</td></tr>
      </table>`
  },
  {
    id: "wp-dalje",
    title: "Posle prve partije",
    html: `
      <ol>
        <li>Igrajte sa <b>4 crva</b> po timu i normalnim postavljanjem (mapu i stvari slažete zajedno, timove delite posle).</li>
        <li>Pročitajte ${L("pravila", "Puna pravila")} → „Karte oružja, Drop i Sudden Death“ i „Heksovi“.</li>
        <li>Probajte opciona pravila: <b>Parting Gifts</b> (uništen crv eksplodira) za više haosa, ili <b>Reduced Blast</b> za mirniju igru.</li>
        <li>Kad vam igra uđe u ruke, dovoljan je ${L("podsetnik", "Brzi podsetnik")}.</li>
      </ol>
      <div class="note">Kad niste sigurni, važi tekst karte. Dogovore koje hoćete da zadržite upišite u ${L("kucna", "Kućna pravila")}.</div>`
  }
];
})();
