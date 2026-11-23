// The Mandalorian: Adventures - vodič za početnike (kartica „Za početnike“).
// Pravila su ista kao u mandalorian-adventures.js (zvanični pravilnik) - ovde su objašnjena polako i redom.
// BEZ SPOJLERA: ne pominje sadržaj koverti ni pravila koja Guide Deck uvodi kasnije.
// Saveti su označeni kao saveti, ne kao pravila; primeri su izmišljeni.
(() => {
const { FIG_M_TURN, FIG_M_SLOTS } = window.M_FIG;
const game = window.GAMES.find((g) => g.id === "mandalorian-adventures");
if (!game) return;
const L = (tab, text) => `<a href="#/igra/mandalorian-adventures/${tab}">${text}</a>`;

game.beginner = [
  {
    id: "mp-kako",
    title: "Kako da naučiš igru",
    html: `
      <p>Ova igra se <b>uči dok se igra</b>: špil karata <b class="kw">Guide Deck</b> vas vodi kroz prvu partiju i postepeno uvodi pravila. Ovaj vodič ti pomaže da razumeš ono što ostaje isto u svakoj misiji.</p>
      <ol>
        <li>Pročitaj <b>„Igra u pet minuta“</b> - najvažnije je razumeti kako rade <b>action slotovi</b>.</li>
        <li>Otvori kutiju i radi šta kaže Guide Deck (vidi „Prva partija: prati Guide Deck“).</li>
        <li>Tokom igre drži pored sebe <b>„Tvoj potez: kontrolna lista“</b> (ili odštampaj vodič: „Štampaj / PDF“ → „Vodič za početnike“).</li>
        <li>Posle prve misije pređi na ${L("podsetnik", "Brzi podsetnik")}.</li>
      </ol>
      <div class="note"><b>Bez spojlera:</b> ovaj vodič ne otkriva šta je u kovertama ni šta donose kasnije misije. Koverte otvarajte <b>samo kad vam Guide Deck kaže</b>. Zvanični video za učenje igre: <i>UnexpectedGames.com/Learn-Mandalorian</i>.</div>`
  },
  {
    id: "mp-ideja",
    title: "Igra u pet minuta",
    html: `
      <p><b>Kooperativna igra:</b> svi igrate zajedno, kao Mandalorijanac i saveznici. <b>Svi pobeđuju ili svi gube.</b> Svaka partija je jedna misija iz knjige, sa mapom, ciljem i uslovom neuspeha.</p>
      <h4>Glavna ideja: karte koje se gomilaju</h4>
      <ol>
        <li>U svom potezu igraš <b>2 karte</b> iz ruke, svaku na drugi <b>action slot</b> ispod mape (Move, Attack, Intel, Plan). Broj na karti (1–4) je koliko je akcija jaka: Move 3 = pomeri se do 3 polja.</li>
        <li>Karte <b>ostaju na slotu</b> i sabiraju se sa kartama koje su tu odigrali drugi igrači.</li>
        <li>Na kraju svakog poteza se gleda zbir na svakom slotu. Kad slot dostigne <b>5</b>, neprijatelji reaguju (<b>event</b>). Na <b>6 ili više</b> - još gore (<b>kriza</b>, pa event). Posle toga se slot čisti.</li>
      </ol>
      <p>Zato je igra slagalica: <b>jaka karta = jaka akcija, ali i brže buđenje neprijatelja.</b> Ponekad je pametno odigrati slabu kartu na „miran“ slot.</p>
      <div class="example"><b>Kako da objasniš drugaru za minut:</b> „Igramo zajedno protiv igre. U potezu igraš dve karte na dva različita polja ispod mape - kretanje, napad, izviđanje, planiranje. Karte se gomilaju, i kad na nekom polju bude pet ili više, neprijatelji udaraju. Zato se dogovaramo ko šta igra.“</div>`
  },
  {
    id: "mp-reci",
    title: "Reči koje moraš znati",
    html: `
      <table>
        <tr><th>Reč</th><th>Šta znači</th></tr>
        <tr><td><b class="kw">Skill karta</b></td><td>Karta iz špila tvog lika (12 karata). Broj gore levo je njena <b>snaga</b>.</td></tr>
        <tr><td><b class="kw">Action slot</b></td><td>Jedno od 4 polja ispod mape: <b>Move</b>, <b>Attack</b>, <b>Intel</b>, <b>Plan</b>.</td></tr>
        <tr><td><b class="kw">Disrupt token</b></td><td>Žeton na slotu koji mu dodaje snagu (pa se event pre pokrene).</td></tr>
        <tr><td><b class="kw">Event</b></td><td>Karta iz event špila: neprijatelji se kreću, napadaju, stižu pojačanja.</td></tr>
        <tr><td><b class="kw">Kriza</b></td><td>Okvir na dnu brifinga misije; dešava se kad slot ima 6+.</td></tr>
        <tr><td><b class="kw">Pretnja</b> (threat)</td><td>Žeton na mapi. Licem nadole - ne zna se šta je. Otkrivena je <b>neprijatelj</b> ili <b>feature</b> (predmet, cilj).</td></tr>
        <tr><td><b class="kw">Domet</b> (range)</td><td>Udaljenost u poljima. Domet 0 = isto polje, domet 1 = isto ili susedno.</td></tr>
        <tr><td><b class="kw">Planning karta</b></td><td>Korisna karta koju dobiješ akcijom Plan (npr. <b>Defend</b> - blokira 1 štetu).</td></tr>
        <tr><td><b class="kw">Guide Deck</b></td><td>Špil koji uvodi pravila i misije. <b>Nikad ga ne mešaj.</b></td></tr>
      </table>`
  },
  {
    id: "mp-prva",
    title: "Prva partija: prati Guide Deck",
    html: `
      <ol>
        <li>Uzmi <b>Guide Deck</b> (ne mešaj ga!). Pročitaj gornju kartu, uradi šta kaže, skloni je i otkrij sledeću. Tako redom do karte na kojoj piše <b>STOP</b>.</li>
        <li>Guide Deck vas vodi u <b>misiju 1</b>. Pročitajte uvodni strip u knjizi misija, pa okrenite na mapu i stavite knjigu na sredinu stola.</li>
        <li>Pročitajte <b>brifing</b> (sve levo od mape): cilj, uslov neuspeha i pravila mape. Uradite Setup.</li>
        <li><b>Izbor likova:</b> svako uzima jednog od likova koje misija nudi - karticu lika na stranu <b>„Novice“</b> (više zdravlja; preporuka za prvu partiju), figuru na startno polje, svojih 12 skill karata (promešaj, vuci <b>4</b>) i referentnu kartu.</li>
        <li>Prvi igrač: dogovorite se.</li>
      </ol>
      <div class="note">Ostatak pripreme (planning i event špil, disrupt tokeni na slotovima, pretnje na mapi) je u ${L("pravila", "Punim pravilima")} → „Priprema igre“. Igrate sami ili ima više igrača nego likova? Vidi „Solo i ograničenja likova“.</div>`
  },
  {
    id: "mp-potez",
    title: "Tvoj potez: kontrolna lista",
    html: `
      ${FIG_M_TURN}
      <h4>1 · Action Step - dve akcije</h4>
      <table>
        <tr><th>Akcija</th><th>Šta radi (snaga = broj na karti)</th></tr>
        <tr><td><b class="kw">Move</b></td><td>Pomeri se do [snaga] polja. Staješ čim uđeš u polje sa neprijateljem ili pretnjom licem nadole.</td></tr>
        <tr><td><b class="kw">Attack</b></td><td>[snaga] štete jednoj pretnji u dometu 1 (tvoje ili susedno polje).</td></tr>
        <tr><td><b class="kw">Intel</b></td><td>Tajno pogledaj pretnju licem nadole u dometu [snaga] - <b>ili</b> pomeri otkrivenog neprijatelja 1 polje.</td></tr>
        <tr><td><b class="kw">Plan</b></td><td>Vuci [snaga] planning karata, zadrži 1.</td></tr>
      </table>
      <ul>
        <li>Dve karte, <b>dva različita slota</b>. Kartu stavi preko onih koje su već tu, tako da se svi brojevi vide.</li>
        <li>Akciju ne moraš da izvršiš - karta se svejedno računa na slotu.</li>
      </ul>
      <h4>2 · Event Step - pogledaj slotove s leva na desno</h4>
      <table>
        <tr><th>Zbir na slotu (karte + disrupt)</th><th>Šta se dešava</th></tr>
        <tr><td><b>4 ili manje</b></td><td>Ništa. Sve ostaje na slotu.</td></tr>
        <tr><td><b>5</b></td><td>Event karta. Zatim očisti slot.</td></tr>
        <tr><td><b>6 ili više</b></td><td>Kriza misije, pa event karta. Zatim očisti slot.</td></tr>
      </table>
      <h4>3 · Draw Step</h4>
      <p>Dopuni ruku do <b>4</b> karte. Zatim igra igrač levo.</p>`
  },
  {
    id: "mp-slotovi",
    title: "Slotovi: kako da ne probudiš neprijatelje",
    html: `
      ${FIG_M_SLOTS}
      <p>Ovo je srce igre. Pre nego što odigraš kartu, <b>saberi šta je već na slotu</b> (karte i disrupt token).</p>
      <div class="example"><b>Primer sa šeme:</b> Move slot ima zbir 4 (disrupt 1 + karta 3). Hoćeš da se pomeriš kartom snage 3 - zbir postaje 7 → na kraju poteza <b>kriza i event</b>. Kartom snage 1 zbir je 5 → samo event. A ako kretanje može da sačeka, karta snage 1–3 na Plan slot (zbir 1) ne budi nikoga.</div>
      <h4>Pametno igranje slotova <span class="muted small">(saveti, ne pravila)</span></h4>
      <ul>
        <li><b>Pričajte.</b> Smete da kažete šta imate u ruci (samo ne pokazujte karte). „Imam Move 4, ali Move slot je na 3 - igraj ti nešto drugo tamo.“</li>
        <li><b>Planirajte ko „okida“ slot.</b> Event je neizbežan, ali bolje da se desi kad ste spremni (neprijatelji daleko, imate Defend).</li>
        <li><b>Slab Plan je jeftin.</b> Plan slot sa malim zbirom je dobro mesto za kartu koju ne želite da „protraćite“.</li>
        <li><b>Gledaj leđa event špila.</b> Ikona na gornjoj karti nagoveštava šta sledi.</li>
        <li><b>Ne troši sve na kretanje i napad.</b> Planning karta <b>Defend</b> (blokira 1 štetu) je jedna od najjačih, jer se šteta retko leči (savet iz pravilnika).</li>
      </ul>`
  },
  {
    id: "mp-neprijatelji",
    title: "Neprijatelji i pretnje",
    html: `
      <ul>
        <li><b>Pretnja licem nadole</b> se otkriva čim se nađeš u istom polju sa njom. Može biti neprijatelj ili feature (predmet, cilj misije).</li>
        <li><b>Neprijatelji se kreću i napadaju samo kad im event karta to kaže</b> - inače stoje.</li>
        <li>Kreću se uvek ka <b>najbližem</b> liku; napadaju najbližeg lika u dometu. Svaki napad = <b>1 šteta</b>.</li>
        <li>Ako bilo koji lik ima štete koliko zdravlja - <b>svi gube</b>.</li>
        <li>Event karta koja ništa ne promeni → <b>1 pojačanje</b> na najbliže polje sa zvezdom.</li>
      </ul>
      <h4>Sposobnost koju ćeš sresti u prvoj misiji</h4>
      <p><b class="kw">Sentry</b>: 1 šteta ako <b>završiš</b> kretanje u dometu 1 od njega. Prolazak pored ne boli - važno je gde staneš. Ako ga otkriješ ulaskom u njegovo polje, boli.</p>
      <p class="muted small">Ostale sposobnosti neprijatelja uvode se u kasnijim misijama - objašnjene su u ${L("pravila", "Punim pravilima")} → „Pretnje“, kad do njih dođete.</p>
      <div class="note"><b>Lečenje:</b> skoro ga nema. <b class="kw">Medpac</b> u tvom polju možeš odbaciti da izlečiš 1 štetu. Zato je svaka šteta ozbiljna.</div>`
  },
  {
    id: "mp-greske",
    title: "Najčešće greške u prvim partijama",
    html: `
      <table>
        <tr><th>Greška</th><th>Kako je zapravo</th></tr>
        <tr><td>Dve karte na isti slot</td><td>Dve akcije moraju biti na <b>različitim</b> slotovima.</td></tr>
        <tr><td>Bonus ikona se računa u Event Step-u</td><td>U Event Step-u važi samo odštampani broj (plus disrupt tokeni).</td></tr>
        <tr><td>Slot se čisti posle svakog poteza</td><td>Čisti se samo posle eventa. Na 4 ili manje sve ostaje i gomila se.</td></tr>
        <tr><td>Disrupt token zaboravljen u zbiru</td><td>Uvek se sabira sa kartama.</td></tr>
        <tr><td>Kretanje kroz pretnju licem nadole</td><td>Staješ u njenom polju i odmah je otkrivaš.</td></tr>
        <tr><td>Neprijatelji „sami“ napadaju</td><td>Samo kad event karta kaže.</td></tr>
        <tr><td>Sentry boli i u prolazu</td><td>Samo ako tu završiš kretanje (domet 1).</td></tr>
        <tr><td>Odbacivanje viška karata u Draw Step-u</td><td>Dopunjuješ do 4; ako već imaš 4, ne vučeš i ne odbacuješ.</td></tr>
        <tr><td>Pokazivanje karata</td><td>Smete da pričate o njima, ali ne i da ih pokazujete.</td></tr>
        <tr><td>Guide Deck promešan</td><td>Nikad. Ako se desi, složite ga po ID brojevima na kartama.</td></tr>
        <tr><td>Koverta otvorena ranije</td><td>Samo kad Guide Deck kaže.</td></tr>
        <tr><td>Cilj ispunjen usred poteza = pobeda</td><td>Većina ciljeva se proverava na kraju poteza - morate preživeti Event Step.</td></tr>
      </table>`
  },
  {
    id: "mp-dalje",
    title: "Posle prve misije",
    html: `
      <ol>
        <li>Bez obzira na ishod, <b>pratite Guide Deck</b> - on kaže šta se dodaje i koja je sledeća misija.</li>
        <li>Svaka misija je nova partija: šteta se briše, a likove i težinu možete menjati.</li>
        <li>Kad vam bude lako, probajte <b>Standard</b> (druga strana kartice lika, manje zdravlja), pa <b>Veteran</b> (i ruka od samo 3 karte).</li>
        <li>Nova pravila koja Guide Deck uvodi kasnije opisana su u ${L("pravila", "Punim pravilima")}, u posebnom poglavlju sa upozorenjem o spojlerima - čitajte ga tek kad do njih dođete.</li>
      </ol>
      <div class="note">Kad niste sigurni, igrač na potezu odlučuje o nerešenim situacijama i redosledu. Dogovore koje hoćete da zadržite upišite u ${L("kucna", "Kućna pravila")}.</div>`
  }
];
})();
