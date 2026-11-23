// Star Wars: The Deckbuilding Game - vodič za početnike (kartica „Za početnike“).
// Pravila su ista kao u star-wars-deckbuilding.js (zvanični FFG pravilnik) - ovde su objašnjena polako i redom.
// Saveti su označeni kao saveti, ne kao pravila; primeri su sa izmišljenim kartama i brojevima.
(() => {
const { FIG_SW_TABLE, FIG_SW_TURN, FIG_SW_FORCE, FIG_SW_ATTACK, FIG_SW_BOUNTY } = window.SWD_FIG;
const game = window.GAMES.find((g) => g.id === "star-wars-deckbuilding");
if (!game) return;
const L = (tab, text) => `<a href="#/igra/star-wars-deckbuilding/${tab}">${text}</a>`;

game.beginner = [
  {
    id: "swp-kako",
    title: "Kako da naučiš igru",
    html: `
      <p>Ovaj vodič je za nekoga ko nikad nije igrao „deckbuilding“ igru. Igra je jednostavnija nego što izgleda: u svakom potezu radiš iste stvari, a karte su te koje se menjaju.</p>
      <ol>
        <li>Pročitaj <b>„Igra u pet minuta“</b> i <b>„Reči koje moraš znati“</b>.</li>
        <li>Postavi sto po poglavlju <b>„Postavljanje stola korak po korak“</b>.</li>
        <li>Igraj, a pored sebe drži <b>„Tvoj potez: kontrolna lista“</b> (ili odštampaj vodič: „Štampaj / PDF“ → „Vodič za početnike“).</li>
        <li>Kad krene napad, pogledaj <b>„Napad, korak po korak“</b>.</li>
        <li>Posle prve partije pređi na ${L("podsetnik", "Brzi podsetnik")} i ${L("pravila", "Puna pravila")}.</li>
      </ol>
      <div class="note"><b>Savet za prvu partiju:</b> igrajte do <b>2 uništene baze</b> umesto 3 (to je zvanično opciono pravilo „Dužina igre“) i čitajte karte naglas. Prva partija traje duže dok se ne naviknete na karte.</div>`
  },
  {
    id: "swp-ideja",
    title: "Igra u pet minuta",
    html: `
      <p>Jedan igrač je <b>Imperija</b>, drugi <b>Pobunjenici</b>. <b>Ko prvi uništi 3 protivničke baze - pobeđuje.</b></p>
      <h4>Šta je „deckbuilding“</h4>
      <ol>
        <li>Počinješ sa <b>slabim špilom od 10 karata</b> - uglavnom „novac“ (resursi).</li>
        <li>Svakog poteza vučeš <b>5 karata</b> i igraš ih: daju ti <b>resurse</b>, <b>napad</b> ili <b>Silu</b>.</li>
        <li>Resursima <b>kupuješ jače karte</b> iz reda od 6 karata na sredini stola (<b class="kw">Galaxy Row</b>). Kupljene karte idu u tvoj odbačeni špil (discard).</li>
        <li>Kad ti se špil isprazni, promešaš discard - i sad u njemu su i nove, jače karte. <b>Špil ti raste i jača iz poteza u potez.</b></li>
        <li>Napadom rušiš protivničku bazu. Kad padne, protivnik otkriva sledeću.</li>
        <li>Na kraju poteza sve odbacuješ i vučeš novih 5. <b>Ništa se ne čuva</b> - osim velikih brodova (capital ships) i štete na bazama.</li>
      </ol>
      <div class="example"><b>Kako da objasniš drugaru za minut:</b> „Svako ima mali špil. Igraš kartu, ona ti daje pare ili udarce. Parama kupuješ bolje karte iz reda na sredini, udarcima rušiš protivnikovu bazu. Kupljene karte ti se vremenom vrate u ruku. Ko prvi sruši tri baze, pobeđuje.“</div>`
  },
  {
    id: "swp-reci",
    title: "Reči koje moraš znati",
    html: `
      <table>
        <tr><th>Reč</th><th>Šta znači</th></tr>
        <tr><td><b class="kw">Resources</b></td><td>Resursi - „novac“ za kupovinu. Žuti žetoni. Šta ne potrošiš, vraćaš na kraju poteza.</td></tr>
        <tr><td><b class="kw">Attack</b></td><td>Napad - koliko štete karta nanosi kad je pošalješ u napad.</td></tr>
        <tr><td><b class="kw">Force</b></td><td>Sila - pomera beli marker na stazi ka tebi. Mnoge karte su jače „<i>If the Force is with you</i>“.</td></tr>
        <tr><td><b class="kw">Galaxy Row</b></td><td>6 otvorenih karata na sredini stola. Odavde kupuješ (i napadaš protivničke karte).</td></tr>
        <tr><td><b class="kw">Outer Rim Pilot</b></td><td>Neutralna karta koju uvek možeš kupiti (gomila od 10, pored reda).</td></tr>
        <tr><td><b class="kw">Unit</b></td><td>Jedinica - ostaje na stolu do kraja tvog poteza, pa u discard.</td></tr>
        <tr><td><b class="kw">Capital Ship</b></td><td>Veliki brod - <b>ostaje na stolu</b> iz poteza u potez, svakog poteza daje resurse i štiti tvoju bazu.</td></tr>
        <tr><td><b class="kw">Base</b></td><td>Baza koju protivnik ruši. Ima <b class="kw">Hit Points</b> - koliko štete je ruši.</td></tr>
        <tr><td><b>Discard</b></td><td>Tvoja gomila odbačenih karata. Kupljene karte idu na njen vrh.</td></tr>
        <tr><td><b class="kw">Exile</b></td><td>Izbaci kartu iz igre zauvek (u kutiju). Koristi se da se otarasiš slabih karata.</td></tr>
        <tr><td><b class="kw">Enemy card</b></td><td>Karta protivničke frakcije u Galaxy Row-u. Ne možeš je kupiti, ali je možeš napasti.</td></tr>
        <tr><td><b>Neutralna karta</b></td><td>Bez simbola frakcije. Mogu je kupiti oba igrača; ne napada se.</td></tr>
      </table>`
  },
  {
    id: "swp-sto",
    title: "Postavljanje stola korak po korak",
    html: `
      ${FIG_SW_TABLE}
      <ol>
        <li><b>Frakcije.</b> Dogovorite se ko je Imperija, a ko Pobunjenici.</li>
        <li><b>Baze.</b> Svako uzme svojih 5 baza:
          <ul>
            <li>Pobunjenici: <b>Dantooine</b> (startna), Hoth, Mon Cala, Sullust, Yavin IV;</li>
            <li>Imperija: <b>Lothal</b> (startna), Corellia, Coruscant, Death Star, Endor.</li>
          </ul>
          Startnu stavi licem nagore ispred sebe, ostale 4 licem nadole ispod nje. Ostale baze iz kutije vam sad ne trebaju.</li>
        <li><b>Tvoj špil.</b> Uzmi svojih 10 starter karata (7 Shuttle, 2 Trooper, 1 Temple Guardian ili Inquisitor), promešaj ih i stavi licem nadole.</li>
        <li><b>Galaxy Row.</b> Promešaj 90 galaxy karata (to je Galaxy Deck) i otvori <b>6</b> u red. Imperijalne karte okreni ka igraču Imperije, pobunjeničke ka Pobunjenicima, a neutralne bočno.</li>
        <li><b>Outer Rim Pilot</b>: 10 karata u gomilu licem nagore, na drugi kraj reda.</li>
        <li><b>Staza Sile</b> pored Outer Rim Pilot-a. Beli marker na <b>krajnje polje Pobunjenika</b>.</li>
        <li>Žetoni štete (ljubičasti) i resursa (žuti) na sredinu, da ih oba igrača dohvate.</li>
        <li>Svako vuče <b>5 karata</b>. <b>Imperija igra prva.</b></li>
      </ol>
      <div class="note">Pošto Sila počinje skroz kod Pobunjenika, Pobunjenici na početku svog prvog poteza dobijaju <b>+1 resurs</b> - osim ako ih Imperija u prvom potezu pomeri. To je nadoknada što igraju drugi.</div>`
  },
  {
    id: "swp-potez",
    title: "Tvoj potez: kontrolna lista",
    html: `
      ${FIG_SW_TURN}
      <h4>1. Početak poteza (skoro automatski)</h4>
      <table>
        <tr><th>Korak</th><th>Šta radiš</th></tr>
        <tr><td>Nova baza</td><td>Ako ti je baza srušena u protivnikovom potezu, pogledaj preostale i <b>izaberi jednu</b> - ona je tvoja nova baza.</td></tr>
        <tr><td>Sila</td><td>Ako je marker <b>skroz na tvojoj strani</b>: uzmi 1 resurs.</td></tr>
        <tr><td>Brodovi</td><td>Uzmi resurse od svakog svog <b>capital ship</b>-a na stolu.</td></tr>
      </table>
      <h4>2. Tvoj potez - bilo kojim redom, koliko god možeš</h4>
      <ul>
        <li><b>Igraj karte</b> iz ruke: čim kartu staviš na sto, uzmi njene resurse i pomeri Silu ka sebi.</li>
        <li><b>Kupuj</b> karte iz Galaxy Row-a ili Outer Rim Pilot-a. Kupljena karta ide na vrh tvog discard-a. Prazno mesto u redu <b>odmah</b> popuni novom kartom.</li>
        <li><b>Koristi sposobnosti</b> karata na stolu - svaku jednom po potezu (nakrivi kartu da zapamtiš).</li>
        <li><b>Napadaj</b> protivničku bazu ili protivničke karte u Galaxy Row-u.</li>
      </ul>
      <h4>3. Kraj poteza (redom)</h4>
      <ol>
        <li>Sve svoje <b>jedinice</b> sa stola u discard (capital ship-ovi ostaju).</li>
        <li>Ispravi bazu i brodove.</li>
        <li>Odbaci karte koje su ostale u ruci; neiskorišćene resurse vrati u zalihu.</li>
        <li>Vuci <b>5</b> novih. Ako se špil isprazni dok vučeš, promešaj discard i nastavi.</li>
      </ol>
      <div class="note"><b>Zašto se vuče na kraju, a ne na početku poteza?</b> Da bi u protivnikovom potezu već znao šta imaš i mogao da planiraš.</div>`
  },
  {
    id: "swp-kupovina",
    title: "Šta smeš da kupiš",
    html: `
      <table>
        <tr><th>Karta u redu</th><th>Imperija</th><th>Pobunjenici</th></tr>
        <tr><td>Imperijalna</td><td>kupuje</td><td>ne kupuje - <b>napada</b> (sabotaža)</td></tr>
        <tr><td>Pobunjenička</td><td>ne kupuje - <b>napada</b> (bounty hunting)</td><td>kupuje</td></tr>
        <tr><td>Neutralna</td><td>kupuje</td><td>kupuje</td></tr>
        <tr><td>Outer Rim Pilot</td><td>kupuje</td><td>kupuje</td></tr>
      </table>
      <ul>
        <li><b>Cena</b> je broj gore levo. Platiš je resursima (žetone vratiš u zalihu).</li>
        <li>Kupljena karta ne ide u ruku nego <b>na vrh discard-a</b> - stiže ti u ruku tek posle sledećeg mešanja.</li>
        <li>Možeš kupiti više karata u istom potezu, dok imaš resursa.</li>
      </ul>
      <h4>Šta da kupiš <span class="muted small">(savet, ne pravilo)</span></h4>
      <ul>
        <li><b>Prvih nekoliko poteza kupuj</b>, a napadaj samo usput - rano ulaganje se višestruko vraća.</li>
        <li><b>Capital ship</b> je dobra kupovina: daje resurse svakog poteza i štiti bazu.</li>
        <li>Karte koje <b>exile</b>-uju (izbacuju) Shuttle-ove čine špil jačim: manje slabih karata = češće izvlačiš dobre.</li>
        <li>Pogledaj šta protivnik želi da kupi i probaj da mu to <b>srušiš</b> u redu (vidi „Napad“).</li>
      </ul>`
  },
  {
    id: "swp-sila",
    title: "Sila, ukratko",
    html: `
      ${FIG_SW_FORCE}
      <ul>
        <li>Kad odigraš kartu sa simbolom Sile, pomeri marker toliko polja <b>ka sebi</b>.</li>
        <li>„<b>If the Force is with you</b>“ = marker je na bilo kom od <b>3 polja tvoje strane</b>. Srednje polje nije ničije.</li>
        <li>Ako je marker <b>skroz kod tebe</b> na početku tvog poteza: +1 resurs.</li>
      </ul>
      <div class="example"><b>Primer:</b> marker je na poslednjem polju pobunjeničke strane. Imperija igra kartu sa 2 Sile: marker ide 2 polja ka Imperiji i staje na prvo polje svetle strane - Sila je i dalje sa Pobunjenicima, ali više nije „skroz“ kod njih, pa sledećeg poteza nema +1 resursa.</div>`
  },
  {
    id: "swp-napad",
    title: "Napad, korak po korak",
    html: `
      <h4>Napad na protivničku bazu</h4>
      ${FIG_SW_ATTACK}
      <ol>
        <li>Odigraj jedinice (i brodove koje već imaš na stolu) i <b>pošalji ih u napad</b> - samo ih grupiši zajedno.</li>
        <li>Saberi im napad i uzmi toliko ljubičastih žetona štete.</li>
        <li>Ako protivnik ima <b>capital ship</b>-ove, šteta prvo mora da uništi <b>sve</b> njih (ti biraš kako je deliš).</li>
        <li>Ostatak ide na <b>bazu</b>. Šteta na bazi <b>ostaje</b> i sledećih poteza.</li>
        <li>Kad šteta dostigne Hit Points baze - baza je srušena. Stavi je na svoj kraj staze Sile (to je tvoj „trofej“). <b>Višak štete propada</b> - ne prelazi na sledeću bazu.</li>
      </ol>
      <h4>Napad na kartu u Galaxy Row-u</h4>
      ${FIG_SW_BOUNTY}
      <p>Imperija to zove <b class="kw">Bounty Hunting</b>, Pobunjenici <b class="kw">Sabotage</b> - isto je.</p>
      <ol>
        <li>Izaberi <b>protivničku</b> kartu u redu i stavi ispred nje jedinice koje napadaju (samo jedinice - brodovi ne mogu).</li>
        <li>Ako je zbir napada <b>bar koliko njen Target</b> (broj odštampan naopako, okrenut ka tebi) - karta je srušena: ide u galaxy discard, a na njeno mesto dolazi nova.</li>
        <li>Možeš uzeti njen <b class="kw">Reward</b> (nagradu).</li>
        <li>Ako je napad manji - ništa se ne dešava (šteta se ne pamti).</li>
      </ol>
      <div class="note">Svaka karta napada <b>samo jednom po potezu</b>. Kad napad završiš, karte koje su napadale drži sa strane do kraja poteza, da ih ne pošalješ opet.</div>`
  },
  {
    id: "swp-primer",
    title: "Primer prvih poteza",
    html: `
      <p>Karte su prave, ali su ruke izmišljene - da se vidi kako izgleda potez.</p>
      <h4>Imperija, 1. potez</h4>
      <ol>
        <li>Početak poteza: nema brodova, Sila je kod Pobunjenika - ništa.</li>
        <li>U ruci: 4 Imperial Shuttle i 1 Stormtrooper. Igra sve: <b>4 resursa</b> i <b>2 napada</b>.</li>
        <li>U redu je pobunjenička karta sa Target 2 → Imperija šalje Stormtrooper-a na nju. 2 ≥ 2: karta je srušena, Imperija uzima Reward, a na njeno mesto dolazi nova karta.</li>
        <li>Za 4 resursa kupuje jednu imperijalnu kartu cene 4 - ide na vrh discard-a.</li>
        <li>Kraj poteza: Shuttle-ovi i Stormtrooper u discard, vuče 5 novih.</li>
      </ol>
      <h4>Pobunjenici, 1. potez</h4>
      <ol>
        <li>Početak poteza: Sila je i dalje skroz kod njih → <b>+1 resurs</b>.</li>
        <li>U ruci: 3 Alliance Shuttle, 1 Rebel Trooper i Temple Guardian. Igraju sve i biraju šta Temple Guardian daje.</li>
        <li>Imaju 4 resursa (3 + 1 od Sile) - kupuju kartu cene 4. Rebel Trooper (2 napada) udara Lothal: 2 štete ostaju na bazi.</li>
      </ol>
      <div class="note">Prvih par poteza obično izgleda ovako: malo kupovine, malo napada. Igra se „otvori“ kad se kupljene karte posle prvog mešanja vrate u ruku.</div>`
  },
  {
    id: "swp-greske",
    title: "Najčešće greške u prvim partijama",
    html: `
      <table>
        <tr><th>Greška</th><th>Kako je zapravo</th></tr>
        <tr><td>Kupljena karta ide u ruku</td><td>Ide na vrh discard-a; u ruku stiže posle mešanja.</td></tr>
        <tr><td>Kupovina protivničke karte</td><td>Kupuješ samo svoje i neutralne. Protivničke se napadaju.</td></tr>
        <tr><td>Resursi se čuvaju za sledeći potez</td><td>Neiskorišćeni resursi se vraćaju na kraju poteza.</td></tr>
        <tr><td>Šteta na bazi nestaje</td><td>Ostaje dok je neka karta ne popravi (<b class="kw">Repair</b>).</td></tr>
        <tr><td>Napad ide pravo na bazu iako protivnik ima brod</td><td>Prvo moraju pasti <b>svi</b> capital ship-ovi. (Izuzetak: „deal damage“ sposobnosti idu pravo na bazu.)</td></tr>
        <tr><td>Višak štete prelazi na sledeću bazu</td><td>Propada. Nova baza počinje bez štete.</td></tr>
        <tr><td>Brod napada kartu u Galaxy Row-u</td><td>Bounty hunting / sabotaža samo jedinicama.</td></tr>
        <tr><td>Ista karta napada dvaput</td><td>Svaka karta jedan napad po potezu.</td></tr>
        <tr><td>Sposobnost se koristi dvaput</td><td>Jednom po potezu (osim okidača „When“).</td></tr>
        <tr><td>Zaboravljen +1 resurs od Sile</td><td>Na početku poteza proveri: je li marker skroz kod tebe?</td></tr>
        <tr><td>Galaxy Row ostaje sa praznim mestom</td><td>Popunjava se odmah, čim karta ode.</td></tr>
        <tr><td>Discard se meša čim se špil isprazni</td><td>Meša se tek kad treba da vučeš.</td></tr>
        <tr><td>Nova baza se bira odmah kad padne stara</td><td>Bira se na početku tvog sledećeg poteza.</td></tr>
      </table>`
  },
  {
    id: "swp-dalje",
    title: "Posle prve partije",
    html: `
      <ol>
        <li><b>Zamenite strane</b> - Imperija i Pobunjenici imaju različite karte i drugačije se igraju.</li>
        <li>Igrajte do <b>3 baze</b>, kako je zvanično.</li>
        <li>Pročitajte poglavlja ${L("pravila", "Puna pravila")} „Dodatna pravila i pojmovi“ i „Česta pitanja“ - tu su sve reči sa karata (Choose, Destroy, Reveal…).</li>
        <li>Kad vam igra uđe u ruke: napredni modovi (Full Galaxy, Secret Bases), dodatak <b>Rebel &amp; Empire Reinforcements</b> u kartici ${L("dodaci", "Dodaci")}, i 2v2 za četvoro.</li>
      </ol>
      <div class="note">Ako se ne slažete oko neke karte, dogovorite se, zapišite pitanje i posle proverite u pravilima. Dogovori koje hoćete da zadržite idu u ${L("kucna", "Kućna pravila")}.</div>`
  }
];
})();
