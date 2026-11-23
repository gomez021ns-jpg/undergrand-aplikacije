// Star Wars: Unlimited - vodič za početnike (kartica „Za početnike“).
// Prva partija sa korisnikovim starterom (Shadows of the Galaxy: The Mandalorian vs Moff Gideon).
// Pravila su ista kao u star-wars-unlimited.js (Quickstart + Comprehensive Rules 8.0) - ovde su objašnjena polako.
// Saveti su označeni kao saveti, ne kao pravila; primeri su sa izmišljenim jedinicama.
(() => {
const { FIG_SWU_TABLE, FIG_SWU_ROUND, FIG_SWU_ATTACK, FIG_SWU_ASPECTS } = window.SWU_FIG;
const game = window.GAMES.find((g) => g.id === "star-wars-unlimited");
if (!game) return;
const L = (tab, text) => `<a href="#/igra/star-wars-unlimited/${tab}">${text}</a>`;

game.beginner = [
  {
    id: "swup-kako",
    title: "Kako da naučiš igru",
    html: `
      <p>Ovaj vodič je za nekoga ko Star Wars: Unlimited nikad nije igrao. Uz tvoj starter (<b>Shadows of the Galaxy</b>) za stolom ste za desetak minuta.</p>
      <ol>
        <li>Pročitaj <b>„Igra u pet minuta“</b> i <b>„Reči koje moraš znati“</b>.</li>
        <li>Postavi sto po poglavlju <b>„Postavljanje stola korak po korak“</b>.</li>
        <li>Igraj, a pored sebe drži <b>„Runda: kontrolna lista“</b> (ili odštampaj vodič: „Štampaj / PDF“ → „Vodič za početnike“).</li>
        <li>Kad zapne oko napada ili cene karte, pogledaj ta poglavlja - napisana su redom kojim se pitanja javljaju.</li>
        <li>Posle 2-3 partije pređi na ${L("podsetnik", "Brzi podsetnik")} i ${L("pravila", "Puna pravila")}.</li>
      </ol>
      <div class="note"><b>Savet za prvu partiju:</b> igrajte otvorenih karata i čitajte karte naglas. Ne morate odmah da razumete sve ključne reči - kad se pojavi neka nova, pogledajte ${L("kljucne-reci", "Ključne reči")}.</div>`
  },
  {
    id: "swup-ideja",
    title: "Igra u pet minuta",
    html: `
      <p>Svako vodi jednog Star Wars junaka ili zlikovca - <b class="kw">leader</b>-a - i špil od 50 karata. <b>Spusti protivničku bazu na 0 HP i pobedio si.</b> Starter baze imaju <b>30 HP</b>.</p>
      <h4>Šta je posebno u ovoj igri</h4>
      <ul>
        <li><b>Naizmenične akcije.</b> Nema „mog poteza“ u kome radim sve. Igrači se smenjuju i svako uradi <b>po jednu stvar</b>: odigra kartu, napadne jednom jedinicom… pa je red na protivnika. Zato je svaka odluka bitna.</li>
        <li><b>Resursi su tvoje karte.</b> Na početku staviš 2 karte iz ruke licem nadole - to je tvoj „novac“. Svake runde možeš dodati još jednu.</li>
        <li><b>Dve arene.</b> Jedinice su ili na zemlji (<b>Ground</b>) ili u svemiru (<b>Space</b>). Bore se samo sa jedinicama iz svoje arene, ali <b>bazu mogu da napadnu svi</b>.</li>
        <li><b>Leader se pridružuje bici.</b> Na početku samo pomaže sposobnošću, a kad skupiš dovoljno resursa, okreneš ga i on postaje moćna jedinica.</li>
      </ul>
      <div class="example"><b>Kako da objasniš drugaru za minut:</b> „Svako ima bazu od 30 života. Smenjujemo se, svako po jedan potez: odigraš jedinicu ili napadneš. Jedinice se bore na zemlji ili u svemiru, a mogu i da udaraju u bazu. Karte plaćamo kartama koje smo stavili kao resurse. Ko prvi sruši bazu, pobeđuje.“</div>`
  },
  {
    id: "swup-reci",
    title: "Reči koje moraš znati",
    html: `
      <table>
        <tr><th>Reč</th><th>Šta znači</th></tr>
        <tr><td><b class="kw">Leader</b></td><td>Tvoj vođa. Ima sposobnost od početka igre, a kasnije postaje jedinica (deploy).</td></tr>
        <tr><td><b class="kw">Base</b></td><td>Tvoja baza: 30 HP. Kad padne na 0 - gubiš.</td></tr>
        <tr><td><b class="kw">Unit</b></td><td>Jedinica. Ima <b>power</b> (koliko štete nanosi) i <b>HP</b> (koliko štete podnosi).</td></tr>
        <tr><td><b class="kw">Event</b></td><td>Jednokratna karta: odigraš je, uradi šta piše, ide u discard.</td></tr>
        <tr><td><b class="kw">Upgrade</b></td><td>Oprema koja se kači na jedinicu i daje joj +power / +HP ili sposobnost.</td></tr>
        <tr><td><b class="kw">Resource</b></td><td>Karta licem nadole pored baze. Okreneš je da platiš 1.</td></tr>
        <tr><td><b class="kw">Exhaust</b> / <b class="kw">Ready</b></td><td>Okreni kartu bočno (iskorišćena) / uspravi je (spremna).</td></tr>
        <tr><td><b class="kw">Ground</b> / <b class="kw">Space</b></td><td>Dve arene. Piše na vrhu jedinice.</td></tr>
        <tr><td><b class="kw">Initiative</b></td><td>Žeton: ko ga ima, igra prvi u rundi.</td></tr>
        <tr><td><b class="kw">Aspect</b></td><td>Boje/ikone pored cene karte (npr. Command, Villainy). Od njih zavisi da li karta košta više.</td></tr>
        <tr><td><b class="kw">Deploy</b></td><td>Leader se okreće na stranu jedinice i ulazi u ground arenu, spreman.</td></tr>
        <tr><td><b class="kw">Shield</b></td><td>Token na jedinici: spreči sledeću štetu (bilo koliku), pa nestaje.</td></tr>
        <tr><td><b class="kw">Experience</b></td><td>Token na jedinici: +1 power i +1 HP.</td></tr>
      </table>`
  },
  {
    id: "swup-sto",
    title: "Postavljanje stola korak po korak",
    html: `
      <p>Iz kutije <b>Shadows of the Galaxy</b> uzmite dva gotova špila: <b>Moff Gideon</b> (jeftine jedinice i napad - preporuka za početnika) i <b>The Mandalorian</b> (oprema i kombinacije - malo složeniji).</p>
      <h4>1. Raspakuj</h4>
      <p>U svakom špilu odvoj <b>dvostrane karte</b> (leader, baza, tokeni) od ostalih <b>50 karata</b> sa standardnim leđima. Tokene (Shield, Experience) stavite sa strane.</p>
      <h4>2. Rasporedi sto</h4>
      ${FIG_SWU_TABLE}
      <ol>
        <li><b>Baza</b> na sredinu tvog dela stola, okrenuta ka protivnikovoj.</li>
        <li><b>Leader</b> ispod baze, <b>horizontalnom</b> stranom nagore (strana bez power i HP - jedinica postaje tek kasnije).</li>
        <li><b>Ground</b> arena je sa jedne strane baze, <b>Space</b> sa druge (podloge iz kutije to pokazuju).</li>
      </ol>
      <h4>3. Početak</h4>
      <ol>
        <li>Nasumično izaberite igrača; on odlučuje ko dobija žeton <b class="kw">Initiative</b> (ko igra prvi).</li>
        <li>Promešaj špil i vuci <b>6 karata</b>.</li>
        <li><b>Mulligan</b> (jednom, prvi odlučuje igrač sa inicijativom): celu ruku vrati u špil, promešaj i vuci novih 6. Novu ruku moraš zadržati.</li>
        <li>Izaberi tačno <b>2 karte</b> iz ruke i stavi ih licem nadole pored baze - to su tvoji prvi <b>resursi</b> (uspravni, odmah ih možeš koristiti).</li>
      </ol>
      <div class="note"><b>Savet iz pravila:</b> uzmi mulligan ako u ruci nemaš nijednu jedinicu koja košta 1 ili 2. Kao resurse stavi karte koje ti najmanje trebaju - obično najskuplje.</div>`
  },
  {
    id: "swup-runda",
    title: "Runda: kontrolna lista",
    html: `
      ${FIG_SWU_ROUND}
      <h4>Action faza - smenjujete se, po jedna akcija</h4>
      <p>Prvi je igrač sa inicijativom. Kad je tvoj red, izaberi <b>jedno</b>:</p>
      <table>
        <tr><th>Akcija</th><th>Šta radiš</th></tr>
        <tr><td><b>Odigraj kartu</b></td><td>Okreni toliko resursa kolika je cena (gore levo) i odigraj je. Jedinica ulazi <b>okrenuta</b> u svoju arenu.</td></tr>
        <tr><td><b>Napadni</b></td><td>Jednom <b>uspravnom</b> jedinicom (vidi „Napad, polako“).</td></tr>
        <tr><td><b>Action sposobnost</b></td><td>Npr. leader-ova („Action [exhaust]: …“). Plati cenu i iskoristi.</td></tr>
        <tr><td><b>Take the Initiative</b></td><td>Uzmi žeton inicijative - sledeće runde igraš prvi. Ali <b>do kraja ove faze više ništa ne radiš</b>. Samo jedan igrač po rundi.</td></tr>
        <tr><td><b>Pass</b></td><td>Ne radiš ništa sad. Ako protivnik posle tebe takođe passuje (ili uzme inicijativu) - faza je gotova.</td></tr>
      </table>
      <h4>Regroup faza - oba igrača</h4>
      <ol>
        <li><b>Vuci 2 karte.</b></li>
        <li><b>Resurs:</b> možeš (ne moraš) da staviš 1 kartu iz ruke kao novi resurs. Ulazi okrenut.</li>
        <li><b>Ready:</b> uspravi sve svoje karte - jedinice, resurse, leader-a.</li>
      </ol>
      <p>Zatim nova runda, nova action faza.</p>
      <div class="note"><b>Savet iz pravila:</b> stavljaj po jedan resurs svake runde, bar dok ne skupiš dovoljno za deploy svog leader-a (Gideon: <b>5</b>, Mandalorijanac: <b>6</b> resursa).</div>`
  },
  {
    id: "swup-cena",
    title: "Kako se plaća karta (i aspekti)",
    html: `
      <ul>
        <li><b>Cena</b> je broj gore levo. Okreneš toliko svojih resursa - bilo kojih.</li>
        <li>Okrenuti resursi se uspravljaju tek u Regroup fazi. Šta potrošiš u ovoj rundi, nemaš do sledeće.</li>
      </ul>
      <h4>Aspekti i doplata</h4>
      ${FIG_SWU_ASPECTS}
      <p>Pored cene su <b>ikone aspekata</b>. Leader ti daje <b>2</b> ikone, baza <b>1</b>. Za svaku ikonu na karti koju tvoj leader i baza <b>ne pokrivaju</b>, karta košta <b>2 više</b>.</p>
      <div class="example"><b>Primer sa Gideon špilom:</b> Moff Gideon daje <b>Command</b> i <b>Villainy</b>, baza Nevarro daje <b>Vigilance</b>.<br>
      • karta sa Command ikonom, cena 3 → plaćaš 3;<br>
      • karta sa Aggression ikonom, cena 3 → plaćaš <b>5</b> (Aggression nemaš);<br>
      • karta sa Heroism ikonom → +2 (Gideon je zlikovac, Heroism nemaš).</div>
      <p class="muted small">Gotovi špilovi su složeni za svog leader-a, ali uvek pogledaj ikone pre nego što računaš koliko resursa ti treba.</p>`
  },
  {
    id: "swup-napad",
    title: "Napad, polako",
    html: `
      ${FIG_SWU_ATTACK}
      <ol>
        <li><b>Okreni napadača</b> (mora biti uspravan) i izaberi metu: <b>protivničku jedinicu u istoj areni</b> ili <b>protivničku bazu</b>.
          <ul><li>Ako protivnik u toj areni ima jedinicu sa <b class="kw">Sentinel</b>, moraš napasti nju.</li></ul></li>
        <li>Razreši sposobnosti napadača koje se dešavaju „dok napada“ i „On Attack“ (npr. <b class="kw">Raid</b>, <b class="kw">Restore</b>).</li>
        <li><b>Šteta:</b>
          <ul>
            <li>Na <b>bazu</b>: baza prima štetu jednaku power-u napadača. Napadač ne prima ništa.</li>
            <li>Na <b>jedinicu</b>: obe jedinice <b>istovremeno</b> nanose štetu jednaku svom power-u. Ko ima štete koliko HP ili više - pada u discard.</li>
          </ul>
        </li>
      </ol>
      <h4>Tri primera</h4>
      <table>
        <tr><th>Napadač</th><th>Meta</th><th>Šta se desi</th></tr>
        <tr><td>3 power / 4 HP</td><td>baza</td><td>Baza -3 HP. Napadač ne prima ništa.</td></tr>
        <tr><td>3 power / 4 HP</td><td>jedinica 2 power / 3 HP</td><td>Meta prima 3 → pada. Napadač prima 2 → preživi sa 2 štete.</td></tr>
        <tr><td>2 power / 2 HP</td><td>jedinica 2 power / 5 HP</td><td>Napadač pada; meta ostaje sa 2 štete.</td></tr>
      </table>
      <div class="note"><b>Šteta na jedinicama ostaje</b> iz runde u rundu - jedinica se ne leči sama. Zato oštećenu protivničku jedinicu često vredi „dokrajčiti“.</div>
      <h4>Bazu ili jedinicu? <span class="muted small">(savet, ne pravilo)</span></h4>
      <ul>
        <li>Udaraj <b>bazu</b> kad protivnik nema čime da ti uzvrati ili kad juriš pobedu.</li>
        <li>Napadaj <b>jedinice</b> kad možeš da ih srušiš, a tvoja preživi - tako mu oduzimaš napade u sledećim rundama.</li>
        <li>Prazna arena kod protivnika (npr. nema ništa u svemiru) znači da tvoje jedinice iz te arene slobodno tuku bazu.</li>
      </ul>`
  },
  {
    id: "swup-leader",
    title: "Leader: kad i kako",
    html: `
      <ul>
        <li><b>Od prve runde</b> leader ima sposobnost na horizontalnoj strani. Gideon: <i>Action [exhaust]</i> - napadni jedinicom koja košta 3 ili manje (+1 power ako napada jedinicu). Mandalorijanac: kad odigraš upgrade, možeš ga okrenuti da okreneš protivničku jedinicu sa 4 ili manje preostalih HP.</li>
        <li><b>Deploy (Epic Action):</b> kad imaš dovoljno resursa (Gideon 5, Mandalorijanac 6), okreni leader-a na stranu jedinice i stavi ga u ground arenu, <b>uspravnog</b> - može da napadne iste runde. Deploy ne troši resurse, samo traži da ih imaš toliko.</li>
        <li>Deploy je <b>jednom po igri</b>. Ako leader-jedinica bude poražena, vraća se kod baze okrenuta na leader stranu i ne može ponovo da se deploy-uje (ali njena obična sposobnost i dalje radi).</li>
      </ul>
      <div class="note"><b>Savet:</b> leader-jedinica je najjača karta koju imaš. Pazi da je deploy-uješ kad može odmah nešto da uradi, a ne u trenutku kad je protivnik spreman da je obori.</div>`
  },
  {
    id: "swup-primer",
    title: "Primer prve runde",
    html: `
      <p>Izmišljene karte, prava pravila. Ana (Gideon) ima inicijativu, Boris igra Mandalorijanca. Oboje imaju po 2 resursa.</p>
      <ol>
        <li><b>Ana:</b> okreće 2 resursa i igra kopnenu jedinicu cene 2. Ulazi okrenuta.</li>
        <li><b>Boris:</b> okreće 2 resursa i igra svemirsku jedinicu cene 2.</li>
        <li><b>Ana:</b> nema više resursa. Ima leader sposobnost (napad jeftinom jedinicom), ali joj jedinica nije uspravna - <b>passuje</b>.</li>
        <li><b>Boris:</b> takođe nema šta - <b>passuje</b>. Dva pass-a zaredom: kraj action faze.</li>
        <li><b>Regroup:</b> oboje vuku 2, stavljaju po 1 kartu kao resurs (sad imaju po 3) i uspravljaju sve.</li>
      </ol>
      <h4>Druga runda, prvi potezi</h4>
      <ol>
        <li><b>Ana</b> (i dalje ima inicijativu): koristi Gideon-a - okreće ga i napada svojom jedinicom cene 2. Pošto Boris na zemlji nema jedinica, napada <b>bazu</b>: Borisova baza -2.</li>
        <li><b>Boris:</b> njegova svemirska jedinica ne može da napadne Aninu kopnenu, ali može <b>bazu</b>: Anina baza -2.</li>
        <li><b>Ana:</b> igra jedinicu cene 3 sa preostala 3 resursa…</li>
      </ol>
      <div class="note">Primeti: Ana je mogla i da uzme inicijativu umesto prvog pass-a, ali onda ne bi smela više ništa u toj fazi. Inicijativu uzimaš kad ti je važnije da sledeće runde igraš prvi.</div>`
  },
  {
    id: "swup-greske",
    title: "Najčešće greške u prvim partijama",
    html: `
      <table>
        <tr><th>Greška</th><th>Kako je zapravo</th></tr>
        <tr><td>Igraš više stvari zaredom</td><td>Jedna akcija, pa je red na protivnika.</td></tr>
        <tr><td>Jedinica napada u rundi kad je odigrana</td><td>Ulazi okrenuta - napada od sledeće runde (osim uz <b class="kw">Ambush</b>).</td></tr>
        <tr><td>Kopnena jedinica napada svemirsku</td><td>Samo ista arena. Bazu mogu sve.</td></tr>
        <tr><td>Sentinel preskočen</td><td>Ako u areni postoji protivnički Sentinel, mora se napasti on (osim uz <b class="kw">Saboteur</b>).</td></tr>
        <tr><td>Šteta na jedinicama se briše</td><td>Ostaje dok se ne izleči.</td></tr>
        <tr><td>Zaboravljeno uspravljanje u Regroup-u</td><td>Na kraju runde ready sve: jedinice, resurse, leader-a.</td></tr>
        <tr><td>Novi resurs ulazi uspravan</td><td>Samo 2 početna su uspravna; ostali ulaze okrenuti.</td></tr>
        <tr><td>Posle Take the Initiative igraš dalje</td><td>Do kraja te faze samo passuješ.</td></tr>
        <tr><td>Deploy „troši“ resurse</td><td>Ne troši - samo traži da ih imaš dovoljno.</td></tr>
        <tr><td>Doplata za aspekte zaboravljena</td><td>+2 za svaku ikonu koju leader i baza ne pokrivaju.</td></tr>
        <tr><td>Vučenje iz praznog špila</td><td>Umesto svake karte: 3 štete svojoj bazi.</td></tr>
        <tr><td>Dve iste unique karte u igri</td><td>Samo 1 kopija; drugu odmah uništi.</td></tr>
      </table>`
  },
  {
    id: "swup-dalje",
    title: "Posle prve partije",
    html: `
      <ol>
        <li><b>Zamenite špilove.</b> Mandalorijanac igra drugačije: oprema (upgrade) + okretanje i zarobljavanje protivničkih jedinica.</li>
        <li>Pročitajte poglavlja o svom špilu u kartici ${L("dodaci", "Dodaci")} (Shadows of the Galaxy): leader-i, ključne karte i nove mehanike <b>Capture</b>, <b>Bounty</b> i <b>Smuggle</b>.</li>
        <li>Kad vam faze uđu u ruke, koristite samo ${L("podsetnik", "Brzi podsetnik")}.</li>
        <li>Za sporne situacije: ${L("pravila", "Puna pravila")} - posebno „Sposobnosti na kartama“.</li>
      </ol>
      <div class="note">Kad niste sigurni kako karta radi, važi tekst karte. Ako ni to ne pomogne, dogovorite se i zapišite pitanje - dogovori koje hoćete da zadržite idu u ${L("kucna", "Kućna pravila")}.</div>`
  }
];
})();
