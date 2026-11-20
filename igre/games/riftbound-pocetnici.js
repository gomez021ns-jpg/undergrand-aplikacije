// Riftbound - vodič za početnike (kartica „Za početnike“).
// Prva partija korak po korak, sa korisnikovim špilovima (Vendetta: Zed vs Shen; Unleashed: Vi).
// Pravila su ista kao u riftbound.js (Core Rules sa izmenama do Radiance, 16. 10. 2026) - ovde su samo
// objašnjena polako i redom; saveti (šta je pametno igrati) su označeni kao saveti, ne kao pravila.
(() => {
const F = window.FIG;
const { FIG_TABLE, FIG_TURN, FIG_RUNES, FIG_ARRIVE } = window.RB_FIG;
const game = window.GAMES.find((g) => g.id === "riftbound");
if (!game) return;

// Plaćanje karte: cena 3 + jedan Fury simbol, a na stolu 4 rune
const rune = (x, label, { ex, gone } = {}) =>
  (ex
    ? F.rect(x - 8, 128, 76, 52, { cls: "f-card" }) + F.text(x + 30, 160, label, { cls: "f-title f-small" })
    : F.rect(x, 116, 60, 76, { cls: gone ? "f-card f-dead" : "f-card" }) + F.text(x + 30, 160, label, { cls: "f-title f-small" }));
const FIG_PAY = F.figure(
  560, 300,
  F.rect(20, 10, 120, 170, { cls: "f-card", r: 9 }) +
    `<circle cx="44" cy="34" r="15" class="f-cost"/>` + F.text(44, 39, "3", { cls: "f-title" }) +
    `<circle cx="44" cy="60" r="7" class="f-acc"/>` +
    F.text(80, 110, ["Karta", "cena 3", "+ 1 Fury"], { cls: "f-muted", lh: 16 }) +
    F.text(80, 205, ["Treba:", "3 Energy", "+ 1 Fury Power"], { cls: "f-title f-small", lh: 17 }) +
    F.text(370, 22, "TVOJE RUNE U BAZI", { cls: "f-label" }) +
    rune(190, "Fury", { ex: true }) + rune(270, "Chaos", { ex: true }) + rune(350, "Chaos", { ex: true }) + rune(450, "Fury", { gone: true }) +
    F.text(270, 100, "1 · okreni 3 rune → 3 Energy", { cls: "f-kw f-small" }) +
    F.arrow(480, 196, 480, 236, { accent: true }) +
    F.text(480, 256, ["2 · vrati Fury runu na", "dno Rune Deck-a", "→ 1 Fury Power"], { cls: "f-kw f-small", lh: 16 }),
  { caption: "Primer plaćanja: tri rune okreneš za Energy, a jednu Fury runu vratiš u Rune Deck za Power. Može i neka od već okrenutih." }
);

game.beginner = [
  {
    id: "poc-kako",
    title: "Kako da naučiš igru",
    html: `
      <p>Ovaj vodič je za nekoga ko Riftbound nikad nije igrao. Ne moraš sve da zapamtiš odjednom - igra se najbrže uči igranjem.</p>
      <ol>
        <li>Pročitaj <b>„Igra u pet minuta“</b> i <b>„Reči koje moraš znati“</b>. To je dovoljno da sedneš za sto.</li>
        <li>Postavi sto po poglavlju <b>„Postavljanje stola korak po korak“</b>.</li>
        <li>Igraj, a pored sebe drži poglavlje <b>„Tvoj potez: kontrolna lista“</b> (ili odštampaj vodič: dugme „Štampaj / PDF“ → „Vodič za početnike“).</li>
        <li>Kad zapne, pogledaj poglavlja o plaćanju, borbi i poenima - napisana su redom kojim se pitanja javljaju u igri.</li>
        <li>Posle 2-3 partije pređi na <a href="#/igra/riftbound/pravila">Puna pravila</a> i <a href="#/igra/riftbound/kljucne-reci">Ključne reči</a>.</li>
      </ol>
      <div class="note"><b>Savet za prvu partiju:</b> igrajte otvorenih karata - pokažite jedno drugom ruke i glasno recite šta radite („okrećem dve rune, igram jedinicu“). Tako se greške uhvate odmah, a pravila se uče duplo brže. Pobednik prve partije nije bitan.</div>`
  },
  {
    id: "poc-ideja",
    title: "Igra u pet minuta",
    html: `
      <p>Riftbound je igra „kralja brda“, samo što brda ima dva. Između tebe i protivnika leže dva <b class="kw">Battlefield</b>-a. Ko ih drži, skuplja poene. <b>Prvi do 8 poena pobeđuje.</b></p>
      <h4>Šta imaš</h4>
      <ul>
        <li><b class="kw">Legend</b> - tvoj vođa. Stoji sa strane celu igru, ne bori se i ne može da pogine, ali ima korisnu sposobnost. Određuje i dve boje (domena) tvog špila.</li>
        <li><b class="kw">Chosen Champion</b> - tvoj glavni junak, jaka jedinica. Ne vučeš ga iz špila: čeka sa strane i možeš da ga odigraš kad god imaš dovoljno resursa.</li>
        <li><b>Špil od 40 karata</b> (sa Champion-om) - jedinice, čarolije i predmeti. Vučeš ih u ruku.</li>
        <li><b>12 runa</b> - tvoj „novac“. Ne vuku se u ruku, nego svakog poteza same stižu na sto.</li>
      </ul>
      <h4>Kako teče igra</h4>
      <ol>
        <li>Svakog poteza dobiješ <b>2 nove rune</b> i <b>1 kartu</b>. Što dalje igra ide, imaš više runa i možeš da igraš skuplje karte.</li>
        <li>Rune trošiš da bi igrao karte. Najvažnije su <b class="kw">jedinice</b> (Unit): samo one osvajaju battlefield-e.</li>
        <li>Jedinice iz svoje baze šalješ na battlefield. Ako je prazan, <b>osvajaš ga: +1 poen</b>. Ako su tamo protivničke jedinice, <b>bijete se</b>: sabere se snaga (<b class="kw">Might</b>) i slabiji gine.</li>
        <li>Na početku svakog tvog poteza dobijaš <b>+1 poen za svaki battlefield koji držiš</b>. A držiš ga samo dok na njemu stoje tvoje jedinice - zato je bitno ne samo osvojiti, nego i odbraniti.</li>
        <li>Šteta se na kraju poteza briše - ranjena jedinica sledećeg poteza je opet cela.</li>
      </ol>
      <div class="example"><b>Kako da objasniš drugaru za minut:</b> „Imamo dva brda između nas. Ko pošalje vojsku na prazno brdo, uzme ga i dobije poen. Ko ga drži na početku svog poteza, dobija još poen. Ako se vojske sretnu, jača pobeđuje. Svakog poteza dobijamo dve rune za plaćanje i jednu kartu. Prvi do osam pobeđuje.“</div>`
  },
  {
    id: "poc-reci",
    title: "Reči koje moraš znati",
    html: `
      <p>Termini su na engleskom, kao na kartama. Za prvu partiju dovoljno je ovih:</p>
      <table>
        <tr><th>Reč</th><th>Šta znači</th></tr>
        <tr><td><b class="kw">Unit</b></td><td>Jedinica - karta koja se kreće i bori. Broj gore desno je njen <b class="kw">Might</b>.</td></tr>
        <tr><td><b class="kw">Might</b></td><td>Snaga jedinice. Ujedno i koliko štete može da primi: jedinica sa Might 3 gine od 3 štete.</td></tr>
        <tr><td><b class="kw">Spell</b></td><td>Čarolija: odigraš je, uradi šta piše i ide u <b class="kw">Trash</b> (odbačene karte).</td></tr>
        <tr><td><b class="kw">Gear</b></td><td>Predmet koji ostaje na stolu u tvojoj bazi i daje trajnu korist.</td></tr>
        <tr><td><b class="kw">Rune</b></td><td>Karta-resurs. Okreneš je da dobiješ <b class="kw">Energy</b>, ili je vratiš u Rune Deck da dobiješ <b class="kw">Power</b>.</td></tr>
        <tr><td><b class="kw">Energy</b> / <b class="kw">Power</b></td><td>Dve vrste „novca“. Energy je bilo koje boje (broj na karti), Power mora biti baš te boje (simboli ispod broja).</td></tr>
        <tr><td><b class="kw">Base</b></td><td>Tvoja baza, tvoja strana stola. Ovde stoje rune, predmeti i nove jedinice.</td></tr>
        <tr><td><b class="kw">Battlefield</b></td><td>Bojno polje između igrača - mesto za koje se boriš i koje donosi poene.</td></tr>
        <tr><td><b class="kw">Exhaust</b> / <b class="kw">Ready</b></td><td>Okreni kartu bočno (iskorišćena je) / vrati je uspravno (spremna). Na početku tvog poteza sve tvoje karte postaju ready.</td></tr>
        <tr><td><b class="kw">Conquer</b></td><td>Osvajanje battlefield-a: +1 poen.</td></tr>
        <tr><td><b class="kw">Hold</b></td><td>Držanje battlefield-a na početku tvog poteza: +1 poen za svaki.</td></tr>
        <tr><td><b class="kw">Showdown</b></td><td>Kratka „pauza“ kad uđeš na prazan battlefield: protivnik dobija šansu da nešto odigra pre nego što ga osvojiš.</td></tr>
        <tr><td><b class="kw">Combat</b></td><td>Borba - kad se tvoje i protivničke jedinice nađu na istom battlefield-u.</td></tr>
        <tr><td><b class="kw">Action</b> / <b class="kw">Reaction</b></td><td>Oznake na kartama koje smeju da se igraju i van tvoje obične igre: tokom borbe, pa i u protivnikovom potezu.</td></tr>
      </table>
      <p class="muted small">Ostale ključne reči (Tank, Assault, Shield, Accelerate…) objašnjene su u kartici <a href="#/igra/riftbound/kljucne-reci">Ključne reči</a>, a često i u zagradi na samoj karti.</p>`
  },
  {
    id: "poc-sto",
    title: "Postavljanje stola korak po korak",
    html: `
      <p>Za prvu partiju uzmite kutiju <b>Vendetta - Zed vs Shen</b>: dva gotova špila napravljena da igraju jedan protiv drugog. Početniku dajte <b>Shen</b>-a (jednostavniji je), iskusnijem <b>Zed</b>-a. Kasnije možete probati i <b>Vi</b> špil iz Unleashed kutije.</p>
      <h4>1. Razvrstaj karte svog špila u gomilice</h4>
      <table>
        <tr><th>Gomilica</th><th>Koliko</th><th>Kako je prepoznaješ</th></tr>
        <tr><td><b class="kw">Legend</b></td><td>1</td><td>Piše <i>Legend</i>, nema cenu; kod Zed-a „Zed, Master of Shadows“, kod Shen-a „Shen, Eye of Twilight“.</td></tr>
        <tr><td><b class="kw">Chosen Champion</b></td><td>1</td><td>Zed: „Zed, From the Shadows“. Shen: „Shen, Leader of the Kinkou Order“.</td></tr>
        <tr><td><b class="kw">Battlefield</b>-i</td><td>3</td><td>Položene karte, tekst okrenut na obe strane.</td></tr>
        <tr><td><b class="kw">Rune</b></td><td>12</td><td>Veliki simbol boje na sredini. Zed: 6 Fury + 6 Chaos. Shen: 6 Calm + 6 Order.</td></tr>
        <tr><td><b>Main Deck</b></td><td>sve ostalo (39)</td><td>Jedinice, čarolije i predmeti. Zajedno sa Champion-om to je 40.</td></tr>
        <tr><td>Tokeni</td><td>-</td><td>Stoje sa strane (npr. Shadow Clone) dok ih neka karta ne napravi. Ne idu u špil.</td></tr>
      </table>
      <h4>2. Rasporedi sto</h4>
      ${FIG_TABLE}
      <ol>
        <li><b>Legend</b> stavi levo, a <b>Champion</b> pored njega, licem nagore.</li>
        <li><b>Battlefield:</b> promešaj svoja 3 licem nadole i izvuci jedan nasumično. Stavi ga na sredinu stola, pored protivnikovog. Druga dva vrati u kutiju. U igri su sada <b>dva battlefield-a</b>.</li>
        <li><b>Main Deck</b> i <b>Rune Deck</b> promešaj, svaki posebno, i stavi licem nadole desno. Pored ostavi mesta za <b>Trash</b>.</li>
        <li><b>Ne stavljaj rune na sto!</b> Rune stižu tek u prvom potezu, po dve.</li>
      </ol>
      <h4>3. Početak</h4>
      <ol>
        <li>Nasumično odredite ko igra prvi (novčić, kocka).</li>
        <li>Svako vuče <b>4 karte</b>.</li>
        <li><b>Mulligan</b> (prvi igrač pa drugi): ako ti se ruka ne sviđa, vrati <b>do 2 karte</b>, vuci isto toliko novih, a vraćene stavi na <b>dno</b> špila (bez mešanja).</li>
        <li>Prvi igrač počinje. <b>Drugi igrač</b> u svom prvom potezu dobija <b>3 rune</b> umesto 2 - to je nadoknada što igra drugi.</li>
      </ol>
      <div class="note"><b>Savet za mulligan:</b> dobra prva ruka ima 2-3 jeftine jedinice (cena 1-3). Ako imaš samo skupe karte (4 i više), vrati dve najskuplje.</div>
      <div class="note">Oba Vendetta špila imaju battlefield <i>Threshold of the Gray</i>. Ako ga izvucete oba, predlog je da drugi igrač izvuče ponovo (zvanična pravila to ne pominju - dogovorite se).</div>`
  },
  {
    id: "poc-potez",
    title: "Tvoj potez: kontrolna lista",
    html: `
      <p>Svaki potez ide istim redom. Prve četiri faze su skoro automatske - pamte se kao <b>A-B-C-D</b>. U prvim partijama ih izgovarajte naglas.</p>
      ${FIG_TURN}
      <table>
        <tr><th>Faza</th><th>Šta radiš rukama</th><th>Na šta da paziš</th></tr>
        <tr><td><b>A · Awaken</b></td><td>Ispravi (ready) <b>sve</b> svoje okrenute karte: rune, jedinice, predmete, Legend-a.</td><td>Protivnikove karte ne diraš.</td></tr>
        <tr><td><b>B · Beginning</b></td><td>Prvo efekti koji kažu „na početku poteza“. Zatim <b>prebroj battlefield-e koje držiš</b> i dodaj sebi po 1 poen (<b class="kw">Hold</b>).</td><td>Najčešće zaboravljen poen u igri!</td></tr>
        <tr><td><b>C · Channel</b></td><td>Uzmi <b>2 rune</b> sa vrha Rune Deck-a i stavi ih uspravno u bazu.</td><td>Drugi igrač u prvom potezu uzima 3.</td></tr>
        <tr><td><b>D · Draw</b></td><td>Vuci <b>1 kartu</b>.</td><td>Ako je špil prazan: <b class="kw">Burn Out</b> (vidi „Odakle dolaze poeni“).</td></tr>
        <tr><td><b>Main</b></td><td>Igraj karte, pomeraj jedinice, bori se, koristi sposobnosti - koliko hoćeš i kojim god redom.</td><td>Vidi poglavlje „Main faza: šta da radim“.</td></tr>
        <tr><td><b>End</b></td><td>Efekti „na kraju poteza“, pa <b>skini svu štetu</b> sa jedinica. Efekti „ovog poteza“ prestaju. Reci „kraj“.</td><td>Neiskorišćeni Energy i Power propadaju.</td></tr>
      </table>
      <div class="note"><b>Za stolom:</b> štetu na jedinicama obeležavajte kockicama ili žetonima, a poene na papiru ili dvema kockicama. Na kraju poteza sve kockice štete sklonite.</div>`
  },
  {
    id: "poc-placanje",
    title: "Kako se plaća karta",
    html: `
      <p>Gore levo na karti je <b>cena</b>:</p>
      <ul>
        <li><b>Broj</b> = koliko <b class="kw">Energy</b> plaćaš. Energy daje <b>bilo koja</b> runa: okreneš je bočno (<b class="kw">Exhaust</b>) i dobiješ 1.</li>
        <li><b>Simboli boje</b> ispod broja = koliko <b class="kw">Power</b> te boje plaćaš <b>pored</b> Energy-ja. Power daje samo runa <b>te boje</b>: vratiš je na dno Rune Deck-a (<b class="kw">Recycle</b>) i dobiješ 1.</li>
        <li>Ista runa može oba: prvo je okreneš za Energy, pa je vratiš za Power.</li>
      </ul>
      ${FIG_RUNES}
      <h4>Primeri</h4>
      <div class="example"><b>Cena 2, bez simbola.</b> Okreni bilo koje 2 rune. Gotovo.</div>
      <div class="example"><b>Cena 3 i jedan Fury simbol.</b> Treba 3 Energy + 1 Fury Power. Imaš 4 rune: 2 Fury i 2 Chaos. Okreni 3 rune (bilo koje) → 3 Energy. Zatim jednu Fury runu vrati na dno Rune Deck-a → 1 Fury Power. Na stolu ti ostaju 3 rune; vraćena će jednom ponovo stići kroz Channel.
      ${FIG_PAY}</div>
      <div class="example"><b>Cena 2 i dva Calm simbola, a imaš samo jednu Calm runu.</b> Ne možeš da je odigraš - Power mora biti baš te boje, bez obzira koliko drugih runa imaš.</div>
      <h4>Pravila koja treba zapamtiti</h4>
      <ul>
        <li>Dobijeni Energy i Power se odmah troše. Šta ne potrošiš, propada na kraju faze/poteza - ne možeš da „štediš“ za sledeći potez.</li>
        <li>Ali <b>runu</b> možeš da sačuvaš: ostavi je uspravnu, pa njom u protivnikovom potezu plati <b class="kw">Reaction</b> kartu.</li>
        <li>Na stolu nikad nema više od 12 runa (koliko ih ima u Rune Deck-u).</li>
      </ul>
      <div class="note"><b>Savet:</b> svaki Recycle ti oduzima runu sa stola, pa sledeći potez imaš manje Energy-ja. U početku igraj karte koje traže malo Power-a, a skupe sa više simbola ostavi za kasnije.</div>`
  },
  {
    id: "poc-main",
    title: "Main faza: šta da radim",
    html: `
      <p>U Main fazi radiš šta hoćeš, kojim god redom. Ovo su sve mogućnosti:</p>
      <table>
        <tr><th>Radnja</th><th>Kako</th></tr>
        <tr><td>Odigraj jedinicu</td><td>Plati cenu i stavi je u svoju bazu <b>ili</b> na battlefield koji već držiš. Ulazi <b>okrenuta (exhausted)</b> - ovog poteza ne može da se pomera (osim uz <b class="kw">Accelerate</b>).</td></tr>
        <tr><td>Odigraj Champion-a</td><td>Isto kao jedinicu, samo ga uzimaš iz Champion zone pored Legend-a.</td></tr>
        <tr><td>Odigraj čaroliju</td><td>Plati, uradi šta piše, karta ide u Trash.</td></tr>
        <tr><td>Odigraj predmet (Gear)</td><td>Plati i stavi ga u bazu. Ulazi uspravan i odmah može da se koristi.</td></tr>
        <tr><td>Pomeri jedinicu</td><td>Okreni uspravnu jedinicu i pomeri je: baza → battlefield ili battlefield → baza. Više jedinica može zajedno na isto mesto. Sa jednog battlefield-a na drugi samo uz <b class="kw">Ganking</b>.</td></tr>
        <tr><td>Sposobnost</td><td>Neke karte i Legend imaju sposobnost sa cenom, npr. „okreni me: …“. Plati i koristi.</td></tr>
      </table>
      <h4>Dobar redosled za početnika <span class="muted small">(savet, ne pravilo)</span></h4>
      <ol>
        <li><b>Pogledaj sto:</b> ko drži koji battlefield, koliko ko ima poena, koliko protivnik ima uspravnih runa i karata u ruci.</li>
        <li><b>Prvo pomeri spremne jedinice:</b> na prazan battlefield (osvajaš ga) ili na protivnika, ako ga jačinom nadmašuješ. Pre napada saberi Might obe strane.</li>
        <li><b>Zatim igraj nove jedinice</b> - ako si upravo osvojio battlefield, možeš ih staviti <b>pravo tamo</b>, da ga brane u protivnikovom potezu.</li>
        <li><b>Ne zaboravi Legend-a</b> - njegova sposobnost je često najjača stvar koju imaš.</li>
        <li><b>Odluči o preostalim runama:</b> potroši ih, ili ostavi 1-2 uspravne ako imaš Reaction kartu za protivnikov potez.</li>
      </ol>
      <div class="note"><b>Battlefield je tvoj samo dok su na njemu tvoje jedinice.</b> Ako ih sve vratiš u bazu ili poginu, gubiš ga - i nema Hold poena za njega. Jedinica u bazi ne brani ništa: ako hoćeš da zadržiš battlefield, na njemu mora da stoji bar jedna tvoja jedinica.</div>`
  },
  {
    id: "poc-borba",
    title: "Showdown i borba, polako",
    html: `
      <h4>Pre svakog pomeranja pitaj se</h4>
      <ol>
        <li><b>Gde jedinica stiže?</b> (slika ispod)</li>
        <li><b>Ako je borba - ko je jači?</b> Saberi Might svojih jedinica (napadači dodaju <b class="kw">Assault</b>) i protivničkih (branioci dodaju <b class="kw">Shield</b>).</li>
        <li><b>Šta protivnik još može?</b> Ako ima uspravne rune i karte u ruci, možda ima Action/Reaction kartu koja menja borbu.</li>
      </ol>
      ${FIG_ARRIVE}
      <h4>Showdown (prazan battlefield)</h4>
      <p>Uđeš na prazan battlefield koji nije tvoj. Pre nego što ga osvojiš, oba igrača naizmenično smeju da odigraju <b class="kw">Action</b> ili <b class="kw">Reaction</b> karte - prvo ti, pa protivnik. Kad oba kažu „dalje“ (pass) jedno za drugim, showdown je gotov. Ako su na battlefield-u i dalje samo tvoje jedinice - tvoj je: <b>+1 poen</b>.</p>
      <h4>Borba (na protivnika)</h4>
      <ol>
        <li><b>Prvo prozor za karte:</b> kao kod showdown-a - napadač pa branilac igraju Action/Reaction karte dok oba ne passuju.</li>
        <li><b>Šteta:</b> svaka strana nanosi štetu jednaku zbiru svog Might-a. Napadač prvi raspoređuje svoju štetu, pa branilac, ali se šteta dešava <b>istovremeno</b>.</li>
        <li><b>Raspoređivanje:</b> štetu ne deliš kako hoćeš - jednu jedinicu moraš da „dokrajčiš“ (daš joj štetu bar koliko njen Might) pre nego što pređeš na sledeću. Jedinice sa <b class="kw">Tank</b> moraju prve.</li>
        <li><b>Gine</b> svaka jedinica koja ima štete koliko njen Might ili više. Preživele se odmah leče.</li>
        <li><b>Ishod:</b> ako je branilac sačuvao bar jednu jedinicu, napadači se vraćaju u bazu i battlefield ostaje njegov. Ako su ostali samo napadači - osvojili su ga (<b>+1 poen</b>).</li>
      </ol>
      <h4>Tri primera</h4>
      <table>
        <tr><th>Napadač</th><th>Branilac</th><th>Šta se desi</th></tr>
        <tr><td>Might 4</td><td>Might 3</td><td>Napadač daje 4 → branilac gine. Branilac daje 3 → napadač (4) preživi. <b>Napadač osvaja.</b></td></tr>
        <tr><td>Might 3</td><td>Might 3</td><td>Obe ginu. Na battlefield-u nema nikog - <b>niko ga ne drži</b> i niko ne dobija poen.</td></tr>
        <tr><td>Might 2 + Might 2</td><td>Might 5</td><td>Napadač daje 4 → nedovoljno za 5. Branilac daje 5: 2 jednoj, 2 drugoj, 1 višak → obe napadačeve ginu. <b>Branilac zadržava battlefield.</b></td></tr>
      </table>
      <div class="note"><b>Zapamti:</b> zbir pobeđuje, ali se šteta deli. Dve slabe jedinice mogu da obore jednu jaku, a jedna jaka može da pobije dve slabe.</div>`
  },
  {
    id: "poc-poeni",
    title: "Odakle dolaze poeni",
    html: `
      <table>
        <tr><th>Način</th><th>Kada</th><th>Koliko</th></tr>
        <tr><td><b class="kw">Conquer</b></td><td>Kad osvojiš battlefield (posle showdown-a ili pobede u borbi).</td><td>+1</td></tr>
        <tr><td><b class="kw">Hold</b></td><td>Na početku svog poteza, za svaki battlefield koji držiš.</td><td>+1 po battlefield-u</td></tr>
        <tr><td><b class="kw">Burn Out</b></td><td>Kad protivnik treba da vuče, a špil mu je prazan.</td><td>+1 tebi</td></tr>
        <tr><td>Karte</td><td>Neke karte i battlefield-i daju poene direktno.</td><td>kako piše</td></tr>
      </table>
      <ul>
        <li>Isti battlefield donosi poen <b>najviše jednom u potezu</b>, bilo kojim načinom.</li>
        <li>Prvi do <b>8 poena</b> odmah pobeđuje.</li>
      </ul>
      <h4>Pravilo poslednjeg poena</h4>
      <p>Ovo zbunjuje svakog početnika. Ako bi ti <b class="kw">Conquer</b> doneo <b>8. poen</b>, dobijaš ga <b>samo ako si u istom potezu već bodovao i drugi battlefield</b>. Ako nisi, umesto poena vučeš 1 kartu. Hold daje 8. poen normalno.</p>
      <div class="example"><b>Primer:</b> imaš 7 poena. Na početku poteza držiš Južni → Hold → to bi bio 8. poen, i pobeđuješ odmah.<br>
      Drugi slučaj: imaš 7 poena i ne držiš ništa. Osvojiš Severni → nisi ovog poteza bodovao Južni → nema poena, vučeš kartu. Moraš da osvojiš i Južni u istom potezu, ili da Severni održiš do početka sledećeg poteza.</div>
      <h4>Burn Out</h4>
      <p>Kad treba da vučeš, a špil ti je prazan: promešaj svoj Trash - to je novi špil - a protivnik dobija 1 poen. Zato pazi na karte koje bacaju karte sa vrha špila u Trash (npr. <b class="kw">Burn</b> u Zed špilu).</p>`
  },
  {
    id: "poc-protivnik",
    title: "Protivnikov potez: kad smeš da reaguješ",
    html: `
      <p>U protivnikovom potezu uglavnom gledaš. Ali nisi potpuno bez odbrane:</p>
      <table>
        <tr><th>Situacija</th><th>Šta smeš</th></tr>
        <tr><td>Protivnik upravo igra kartu ili sposobnost</td><td>Samo <b class="kw">Reaction</b> karte - kao odgovor, pre nego što se njegova karta izvrši.</td></tr>
        <tr><td>Protivnik ušao na battlefield (showdown ili borba)</td><td><b class="kw">Action</b> i <b class="kw">Reaction</b> karte, kad dođeš na red.</td></tr>
        <tr><td>Protivnik samo završava potez</td><td>Ništa - bez povoda se ne može reagovati.</td></tr>
      </table>
      <h4>Kako se odgovara</h4>
      <p>Odigrane karte idu na <b class="kw">chain</b> (lanac), jedna na drugu. Kad svi kažu „dalje“, izvršavaju se <b>od poslednje ka prvoj</b>. Zato tvoj Reaction, iako odigran posle, deluje <b>pre</b> protivnikove karte.</p>
      <div class="example"><b>Primer:</b> protivnik igra čaroliju „3 štete jedinici“ na tvoju jedinicu sa Might 2. Ti odgovaraš Reaction kartom „+3 Might ovog poteza“. Prvo se izvrši tvoja (jedinica sada ima Might 5), pa njegova - 3 štete nisu dovoljne. Jedinica preživljava.</div>
      <h4>Šta ti treba</h4>
      <ul>
        <li>Reaction ili Action karta u ruci.</li>
        <li><b>Uspravne rune</b> da je platiš - zato ih ponekad vredi ne potrošiti u svom potezu.</li>
        <li>Neki Legend-i imaju sposobnost sa oznakom <b class="kw">Action</b> (npr. Zed, Master of Shadows) - i ona sme u protivnikovom potezu, u showdown-u i borbi.</li>
        <li><b class="kw">Hidden</b> karte: sakrivena karta na tvom battlefield-u sme da se odigra kao Reaction, besplatno, od tvog sledećeg poteza.</li>
      </ul>`
  },
  {
    id: "poc-primer",
    title: "Primer: kraj jedne partije",
    html: `
      <p>Izmišljene jedinice, prava pravila. Ana i Boris igraju; Ana ima <b>5</b> poena, Boris <b>6</b>. Ana drži <b>Severni</b> battlefield, gde joj stoji jedinica D (Might 2). Boris drži <b>Južni</b>, gde mu stoji jedinica C (Might 4). U bazi Ana ima spremne jedinice A (Might 3) i B (Might 2), a Boris jedinicu E (Might 4). Boris ima 2 uspravne rune i 3 karte u ruci.</p>
      <h4>Anin potez</h4>
      <ol>
        <li><b>Awaken</b>: Ana ispravlja svoje karte. <b>Beginning</b>: drži Severni → Hold, <b>Ana 6</b>. <b>Channel</b>: 2 rune. <b>Draw</b>: 1 karta.</li>
        <li><b>Main</b>: Ana šalje A i B (ukupno 5) iz baze na Južni, na Borisovu jedinicu C (4) → <b>borba</b>. Ana je napadač i prva je na redu; passuje.</li>
        <li>Boris plaća sa svoje 2 uspravne rune <b class="kw">Reaction</b> kartu „izabrana jedinica dobija +2 Might ovog poteza“ na C. Ana nema odgovor i passuje; karta se izvrši - C sada ima Might 6. Oba zatim passuju.</li>
        <li><b>Šteta</b>: Ana daje 5 jedinici C (Might 6) → preživi. Boris daje 6: 3 jedinici A, 2 jedinici B, 1 višak → <b>obe Anine jedinice ginu</b>. Južni ostaje Borisov.</li>
        <li>Ana preostalim runama igra jednu jedinicu u bazu. <b>End</b>: šteta se briše.</li>
      </ol>
      <h4>Borisov potez</h4>
      <ol>
        <li><b>Beginning</b>: Boris drži Južni → Hold, <b>Boris 7</b>.</li>
        <li><b>Main</b>: Boris šalje E (Might 4) iz baze na Severni, na Aninu jedinicu D (2) → borba. E daje 4 → D gine; D daje 2 → E preživi. Boris osvaja Severni.</li>
        <li>Da li dobija 8. poen? Pravilo poslednjeg poena: Boris je <b>ovog poteza već bodovao Južni</b> (Hold) → da. <b>Boris 8 - pobeda.</b></li>
      </ol>
      <h4>Šta je Ana mogla bolje</h4>
      <ul>
        <li>Boris je imao 2 uspravne rune i karte u ruci - znak da možda ima Reaction. Napad sa 5 na 4 nije bio siguran.</li>
        <li>Ana je znala da će Boris posle Hold-a imati 7 i da mu za pobedu treba samo Severni. Da je A i B poslala na <b>Severni</b> (svoj battlefield - tu nema borbe) pored D, Boris bi sa jednom jedinicom od 4 udario u zid od 7 (3 + 2 + 2).</li>
      </ul>
      <div class="note">Pouka: kad protivnik ima 6-7 poena, prvo brani. Kad ti imaš 7, računaj na pravilo poslednjeg poena.</div>`
  },
  {
    id: "poc-greske",
    title: "Najčešće greške u prvim partijama",
    html: `
      <table>
        <tr><th>Greška</th><th>Kako je zapravo</th></tr>
        <tr><td>Rune na stolu od početka igre</td><td>Kreće se bez runa; stižu po 2 u Channel fazi (drugi igrač prvi put 3).</td></tr>
        <tr><td>Zaboravljen Hold poen</td><td>Na početku svakog poteza prebroj battlefield-e koje držiš.</td></tr>
        <tr><td>Pomeranje jedinice odigrane ovog poteza</td><td>Ulazi okrenuta - pomera se tek sledećeg poteza (osim uz Accelerate).</td></tr>
        <tr><td>Šteta ostaje na jedinici</td><td>Na kraju poteza (i posle borbe) sva šteta se briše.</td></tr>
        <tr><td>Power plaćen pogrešnom bojom</td><td>Power mora biti boje simbola; Energy može bilo koja runa.</td></tr>
        <tr><td>Pomeranje sa battlefield-a na battlefield</td><td>Samo uz Ganking. Inače: battlefield → baza → (sledeći potez) drugi battlefield.</td></tr>
        <tr><td>Potrošene sve rune, pa nema čime da se plati Reaction</td><td>Ako imaš Reaction kartu, ostavi rune uspravne.</td></tr>
        <tr><td>Reaction „tek tako“ u protivnikovom potezu</td><td>Treba povod: protivnik nešto igra, ili je u toku showdown/borba.</td></tr>
        <tr><td>Pobeda osvajanjem sa 7 poena</td><td>Važi samo ako si ovog poteza bodovao i drugi battlefield (pravilo poslednjeg poena).</td></tr>
        <tr><td>Champion zaboravljen sa strane</td><td>Champion zone je kao karta stalno u ruci - igraj ga čim možeš da platiš.</td></tr>
        <tr><td>Legend se ne koristi</td><td>Pročitaj svog Legend-a pre partije i proveri ga svakog poteza.</td></tr>
        <tr><td>Jedinice „brane“ iz baze</td><td>Brane samo jedinice koje stoje na battlefield-u.</td></tr>
        <tr><td>Battlefield ostaje tvoj i kad sve jedinice odu</td><td>Čim na njemu nema tvojih jedinica, više nije tvoj (nema ni Hold poena).</td></tr>
        <tr><td>Mulligan sa mešanjem</td><td>Vraćene karte idu na dno špila, bez mešanja.</td></tr>
        <tr><td>Tekst karte protiv pravila</td><td>Važi tekst karte. A ako jedno kaže „može“, a drugo „ne može“ - ne može.</td></tr>
      </table>`
  },
  {
    id: "poc-dalje",
    title: "Posle prve partije",
    html: `
      <ol>
        <li><b>Zamenite špilove</b> i odigrajte još jednom - sa druge strane stola vidi se šta protivnik može.</li>
        <li>Pročitajte poglavlja o svom špilu u kartici <a href="#/igra/riftbound/dodaci">Dodaci</a> (Zed, Shen, Vi): ključne karte i plan igre.</li>
        <li>Kad vam faze uđu u ruke, koristite samo <a href="#/igra/riftbound/podsetnik">Brzi podsetnik</a> (staje na jednu stranu A4).</li>
        <li>Za sporne situacije: <a href="#/igra/riftbound/pravila">Puna pravila</a> - posebno „Igranje karata, Chain i brzine“ i „Česte situacije (FAQ)“.</li>
        <li>Kad poželite svoj špil: pravila sastavljanja su u poglavlju „Sastav špila“, a aplikacija <b>UnderGRAND Riftbound collection</b> (kartica „Predlog špila“) složi špil od karata koje imaš.</li>
      </ol>
      <div class="note">Tokom igre ne morate sve da znate napamet. Kad niste sigurni, dogovorite se kako ćete odigrati, zapišite pitanje i posle proverite u pravilima. Dogovori koje hoćete da zadržite mogu da se upišu u <a href="#/igra/riftbound/kucna">Kućna pravila</a>.</div>`
  }
];
})();
