(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Tok poteza
const FIG_M_TURN = F.figure(
  480, 262,
  F.box(10, 10, 460, 70, "1 · Action Step", { sub: ["odigraj 2 skill karte na 2 različita action slota", "i razreši te akcije"] }) +
    F.arrow(240, 80, 240, 98) +
    F.box(10, 100, 460, 70, "2 · Event Step", {
      cls: "f-acc",
      sub: ["za svaki slot saberi snagu: 4 ili manje → ništa · 5 → event", "6 ili više → kriza, pa event · posle toga očisti slot"]
    }) +
    F.arrow(240, 170, 240, 188) +
    F.box(10, 190, 460, 62, "3 · Draw Step", { sub: "dopuni ruku do 4 skill karte (veteran: 3)" }),
  { caption: "Jedan potez. Zatim igra igrač levo." }
);

// Action slotovi i Event Step
const slot = (x, label, disrupt, cards, total, result, note, resCls) => {
  const cx = x + 55;
  let s = F.text(cx, 20, label, { cls: "f-label" }) + F.rect(x, 28, 110, 124, { cls: "f-box" });
  s += `<circle cx="${cx}" cy="52" r="13" class="f-disrupt"/>` + F.text(cx, 57, String(disrupt), { cls: "f-title f-small" });
  cards.forEach((c, i) => {
    s += F.rect(cx - 22, 74 + i * 34, 44, 28, { cls: "f-card", r: 4 }) + F.text(cx, 93 + i * 34, String(c), { cls: "f-title" });
  });
  return (
    s +
    F.text(cx, 174, `= ${total}`, { cls: "f-title" }) +
    F.text(cx, 194, result, { cls: resCls }) +
    F.text(cx, 211, note, { cls: "f-muted" })
  );
};
const FIG_M_SLOTS = F.figure(
  520, 222,
  slot(10, "MOVE", 1, [3], 4, "ništa", "sve ostaje", "f-title f-small") +
    slot(140, "ATTACK", 2, [3], 5, "Event", "pa očisti slot", "f-kw") +
    slot(270, "INTEL", 2, [1, 3], 6, "Kriza + Event", "pa očisti slot", "f-danger") +
    slot(400, "PLAN", 1, [], 1, "ništa", "sve ostaje", "f-title f-small"),
  { caption: "Action slotovi ispod mape. Krug je disrupt token, pravougaonici su odigrane skill karte. Snaga se sabira kroz više poteza!" }
);

// ─────────────────────────────── IGRA ───────────────────────────────

registerGame({
  id: "mandalorian-adventures",
  title: "The Mandalorian: Adventures",
  subtitle: "Kooperativne misije iz 1. sezone serije",
  publisher: "Unexpected Games (Asmodee)",
  players: "1–4",
  category: "Kooperativna igra sa misijama",
  accent: "#6a8ea3",
  cover: "images/mandalorian-adventures.jpg",
  owned: "Osnovna igra",
  rulesVersion: "Zvanični pravilnik (Unexpected Games, 2024)",
  summary:
    "Igrači zajedno vode Mandalorijanca i njegove saveznike kroz misije inspirisane 1. sezonom serije. Svaka partija je jedna misija iz knjige misija. Svaki potez igraš dve skill karte za akcije - ali karte se gomilaju na zajedničkim slotovima i kad ih bude previše, pokreću neprijateljske događaje. Svi pobeđuju ili svi gube zajedno.",

  // ─────────────────────────────── BRZI PODSETNIK ───────────────────────────────
  quickRef: [
    {
      title: "Cilj",
      html: `
        <ul>
          <li><b>Kooperativna igra:</b> svi pobeđuju ili svi gube.</li>
          <li>Ispuni <b>cilj misije</b> (obično na kraju poteza - morate preživeti Event Step).</li>
          <li><b>Poraz:</b> ispunjen uslov neuspeha misije ili bilo koji lik ima štete ≥ svoje zdravlje.</li>
          <li>Pre i posle svake partije: prati <b class="kw">Guide Deck</b> (ne mešaj ga!).</li>
        </ul>`
    },
    {
      title: "Potez",
      html: `
        <ol>
          <li><b>Action Step:</b> tačno <b>2 različite akcije</b> - po jedna skill karta na slot.</li>
          <li><b>Event Step:</b> za svaki slot, s leva na desno, saberi snagu (karte + disrupt tokeni):
            <ul>
              <li><b>6+</b> → kriza misije, pa event karta</li>
              <li><b>5</b> → event karta</li>
              <li><b>4 ili manje</b> → ništa, sve ostaje</li>
            </ul>
            Posle kriza/eventa očisti taj slot.</li>
          <li><b>Draw Step:</b> dopuni ruku do 4 (veteran: 3).</li>
        </ol>`
    },
    {
      title: "Akcije",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Move</td><td>pomeri se do [snaga] polja</td></tr>
          <tr><td class="kw">Attack</td><td>[snaga] štete pretnji do domet 1</td></tr>
          <tr><td class="kw">Intel</td><td>tajno pogledaj pretnju ili pomeri neprijatelja 1 polje (domet = snaga)</td></tr>
          <tr><td class="kw">Plan</td><td>vuci [snaga] planning karata, zadrži 1</td></tr>
        </table>
        <p>Skill karta ne mora da izvrši akciju - snaga joj se svejedno računa u Event Step-u.</p>`
    },
    {
      title: "Kretanje i teren",
      html: `
        <ul>
          <li><b>Staješ</b> kad uđeš u polje sa neprijateljem ili pretnjom licem nadole.</li>
          <li>Pretnja licem nadole u tvom polju → odmah je otkrij.</li>
          <li>Počinješ u polju sa neprijateljem → slobodno izlaziš.</li>
          <li><b>Zid</b> i <b>zaključana vrata</b>: ni kretanje ni domet. <b>Elevacija</b> (tačkasta linija): kretanje ne, domet da. <b>Crvene pruge</b>: nisu polja.</li>
        </ul>`
    },
    {
      title: "Neprijatelji",
      html: `
        <ul>
          <li>Pomeraju se i napadaju <b>samo</b> kad event karta to kaže, uvek ka <b>najbližem</b> liku.</li>
          <li>Napad neprijatelja = <b>1 šteta</b> liku.</li>
          <li>Event bez efekta → <b>pojačanje</b> na najbliže polje sa zvezdom.</li>
        </ul>
        <table class="kwtable">
          <tr><td class="kw">Sentry</td><td>1 šteta ako završiš kretanje u dometu 1</td></tr>
          <tr><td class="kw">Grapple</td><td>1 šteta ako izađeš iz njegovog polja</td></tr>
          <tr><td class="kw">Sabotage</td><td>posle kretanja u Event Step-u: disrupt najslabiji slot</td></tr>
          <tr><td class="kw">Mission Effect</td><td>kad se otkrije: pogledaj pravila misije</td></tr>
        </table>`
    },
    {
      title: "Važno - lako se zaboravi",
      html: `
        <ul>
          <li>Igrač na potezu rešava sve nerešene situacije i redosled.</li>
          <li>Skill sposobnosti su opcione; koriste se pre ili posle akcije.</li>
          <li>U Event Step-u važi <b>samo odštampani broj</b> (+ disrupt), ne bonus ikone.</li>
          <li><b class="kw">Medpac</b>: odbaci ga iz svog polja → izleči 1 štetu.</li>
          <li>Domet se broji kroz pretnje, likove, elevaciju i otključana vrata - i oko ćoškova.</li>
          <li>Pričaj slobodno o kartama, ali ih ne pokazuj.</li>
        </ul>`
    }
  ],

  // ─────────────────────────────── PUNA PRAVILA ───────────────────────────────
  rules: [
    {
      id: "m-pregled",
      title: "Pregled igre",
      html: `
        <p>Igrači zajedno igraju kao Mandalorijanac i njegovi saveznici. Svaka partija je jedna <b>misija</b> iz knjige misija, sa svojom mapom, ciljem i uslovima neuspeha.</p>
        <ul>
          <li><b>Misije:</b> svaka ima cilj koji morate ispuniti. Mape se kasnije ponovo koriste na nove načine.</li>
          <li><b class="kw">Guide Deck</b>: špil karata u tačno određenom redosledu koji postepeno uvodi nova pravila i karte. <b>Nikad ga ne mešaj.</b> Ako se to desi, složi ga ponovo po ID brojevima na kartama.</li>
          <li><b>Koverte:</b> neke komponente su u zatvorenim kovertama (novi načini igre). <b>Ne otvaraj ih dok ti Guide Deck ne kaže.</b></li>
        </ul>
        <div class="note">Umesto čitanja pravila možeš pogledati zvanični video: <i>UnexpectedGames.com/Learn-Mandalorian</i>.</div>`
    },
    {
      id: "m-sadrzaj",
      title: "Sadržaj kutije",
      html: `
        <table>
          <tr><th>Komponenta</th><th>Količina</th></tr>
          <tr><td>Knjiga misija</td><td>1</td></tr>
          <tr><td>Kartice likova</td><td>8</td></tr>
          <tr><td>Standee figure (sa postoljima)</td><td>8</td></tr>
          <tr><td>Skill karte (po 12 za svakog lika)</td><td>96</td></tr>
          <tr><td>Planning karte</td><td>20</td></tr>
          <tr><td>Event karte</td><td>12</td></tr>
          <tr><td>Guide Deck karte (ne mešati!)</td><td>71</td></tr>
          <tr><td>Referentne karte</td><td>4</td></tr>
          <tr><td>Threat tokeni (pretnje)</td><td>106</td></tr>
          <tr><td>Disrupt tokeni</td><td>10</td></tr>
          <tr><td>Damage tokeni (1/2 i 3/4)</td><td>25</td></tr>
          <tr><td>The Child token</td><td>1</td></tr>
          <tr><td>Zatvorene koverte</td><td>2</td></tr>
        </table>`
    },
    {
      id: "m-priprema",
      title: "Priprema igre",
      html: `
        <ol>
          <li><b>Priprema misije.</b>
            <ul>
              <li>Pročitaj gornju kartu <b>Guide Deck</b>-a i uradi šta kaže. Zatim je trajno ukloni i otkrij sledeću. Ponavljaj dok ne dođeš do karte na kojoj piše <b>STOP</b>.</li>
              <li>Guide Deck kaže koju misiju igrate (prva partija: misija 1). Pročitaj uvodni strip misije u knjizi.</li>
              <li>Okreni stranu na mapu misije i stavi knjigu na sredinu stola.</li>
              <li>Pročitaj brifing misije (sve levo od mape) i pravila mape. Uradi sve Setup instrukcije.</li>
            </ul>
          </li>
          <li><b>Planning deck:</b> promešaj i stavi na dohvat svima.</li>
          <li><b>Event deck:</b> promešaj sve event karte (ne obraćaj pažnju na ikone na leđima) i stavi ispod polja „6+“ u brifingu misije.</li>
          <li><b>Tokeni štete i disrupt tokeni:</b>
            <ul>
              <li>Damage tokene stavi u rezervu.</li>
              <li>Nađi 5 disrupt tokena sa <b>belim licem</b>. Nasumično stavi po jedan licem nagore na svaki action slot ispod mape.</li>
              <li>Sve ostale disrupt tokene (i preostale bele) promešaj licem nadole (broj dole) u rezervu.</li>
            </ul>
          </li>
          <li><b>Threat tokeni:</b> uzmi sve pretnje sa brojem ove misije na poleđini, razdvoji ih po obliku i promešaj svaku gomilu. Stavi ih na mapu prema simbolima: jedni oblici idu <b>licem nadole</b>, drugi <b>licem nagore</b>, a narandžasti idu u gomilu licem nadole pored mape kao <b>pojačanja</b> (reinforcements). Ostale pretnje ostaju u kutiji. (Tačne simbole vidi u pravilniku, str. 3.)</li>
          <li><b>Izbor likova:</b> misija navodi koji likovi su dostupni. Svaki igrač bira drugog i uzima:
            <ul>
              <li><b>karticu lika</b> - strana „Novice“ (više zdravlja), osim na težim nivoima;</li>
              <li><b>standee</b> - na startno polje mape;</li>
              <li><b>12 skill karata</b> - promešaj, vuci <b>4</b> (veteran: 3), ne pokazuj ih;</li>
              <li><b>referentnu kartu</b>.</li>
            </ul>
          </li>
          <li><b>Prvi igrač:</b> dogovorite se; ako ne možete - nasumično.</li>
        </ol>
        <h4>Nivoi težine</h4>
        <table>
          <tr><th>Nivo</th><th>Pravilo</th></tr>
          <tr><td><b>Novice</b></td><td>„Novice“ strana kartice lika (više zdravlja). Preporuka za prvu partiju.</td></tr>
          <tr><td><b>Standard</b></td><td>Standardna strana kartice lika (manje zdravlja).</td></tr>
          <tr><td><b>Veteran</b></td><td>Standardna strana + ruka od samo <b>3</b> skill karte.</td></tr>
        </table>
        <div class="note">Solo ili više igrača nego likova u misiji? Vidi poglavlje „Solo i ograničenja likova“.</div>`
    },
    {
      id: "m-potez",
      title: "Tok poteza",
      html: `
        ${FIG_M_TURN}
        <ol>
          <li><b>Action Step</b> - izvedi tačno <b>dve različite akcije</b>: za svaku odigraj po jednu skill kartu iz ruke na action slot ispod mape i razreši akciju.</li>
          <li><b>Event Step</b> - za svaki slot sa 5+ ukupne snage razreši event (a sa 6+ prvo krizu), pa očisti slot. Ako su svi slotovi na 4 ili manje, preskoči ovaj korak.</li>
          <li><b>Draw Step</b> - vuci skill karte dok ne imaš 4 u ruci (veteran: 3). Ako je ruka već puna, ne vučeš i ne odbacuješ.</li>
        </ol>
        <p>Zatim igra igrač levo, i tako redom dok misija ne bude ispunjena ili izgubljena.</p>`
    },
    {
      id: "m-akcije",
      title: "Action Step i akcije",
      html: `
        <h4>Skill karte i action slotovi</h4>
        <ul>
          <li>Svaki špil lika ima karte snage <b>1 do 4</b>. Snaga određuje koliko je akcija jaka.</li>
          <li>Kartu stavljaš na bilo koji action slot (odštampan ispod mape). Ako tu već ima karata, stavi je preko, tako da se svi brojevi vide.</li>
          <li>Na svaki slot možeš staviti <b>samo jednu kartu po potezu</b>, pa su dve akcije uvek različite.</li>
          <li>Kartu možeš odigrati i bez izvršavanja akcije - snaga joj se svejedno računa u Event Step-u.</li>
        </ul>
        <h4>Move - kretanje</h4>
        <p>Pomeri svog lika <b>do</b> onoliko polja kolika je snaga karte (sa snagom 2: 0, 1 ili 2 polja), polje po polje, na susedna polja.</p>
        <ul>
          <li>Kad uđeš u polje sa <b>neprijateljem</b> ili <b>pretnjom licem nadole</b>, moraš stati.</li>
          <li>Drugi likovi i otkriveni feature tokeni ne zaustavljaju kretanje. U polju može biti neograničeno likova, neprijatelja i pretnji.</li>
          <li>Ako počinješ kretanje u polju sa neprijateljem, slobodno izlaziš.</li>
          <li><b>Kad god deliš polje sa pretnjom licem nadole, odmah je otkrij.</b></li>
          <li>Ova pravila važe za svako kretanje, ne samo za Move akciju.</li>
        </ul>
        <h4>Attack - napad</h4>
        <p>Nanesi štetu jednaku snazi karte pretnji u <b>dometu 1</b> (tvoje polje ili susedno). Stavi damage token te vrednosti. Šteta ostaje dok neprijatelj ne bude poražen: kad je šteta ≥ zdravlja, skini ga sa mape.</p>
        <p>Možeš napasti i <b>pretnju licem nadole</b>, nadajući se da je neprijatelj: posle svih odluka je otkrij - ako je neprijatelj, dobija štetu; ako nije, ostaje otkrivena bez štete.</p>
        <h4>Intel - izviđanje</h4>
        <ul>
          <li><b>Pogledaj pretnju:</b> tajno pogledaj pretnju licem nadole u dometu jednakom snazi karte, pa je vrati. Možeš pričati šta si video (čak i lagati).</li>
          <li><b>Ili pomeri neprijatelja:</b> izaberi otkrivenog neprijatelja u dometu i pomeri ga 1 polje (npr. da izbegneš Sentry).</li>
          <li>Ne radi kroz zidove, zaključana vrata ni zabranjene zone.</li>
        </ul>
        <h4>Plan - planiranje</h4>
        <p>Vuci onoliko planning karata kolika je snaga karte (ne pokazuj ih, ali možeš pričati o njima).</p>
        <ul>
          <li>Jednu možeš zadržati licem nagore ispod svoje kartice lika. Karte „Bad Luck“ (bez efekta) ne možeš zadržati, niti dve iste karte.</li>
          <li>Jednu možeš vratiti na vrh planning špila (za kasnije).</li>
          <li>Ostale odbaci licem nagore.</li>
        </ul>
        <div class="note"><b>Savet iz pravilnika:</b> ne troši sve akcije na kretanje i napad. Planning karta <b>Defend</b> (blokira 1 štetu) je jedan od najjačih efekata, jer se šteta retko leči.</div>
        <h4>Posebne skill karte</h4>
        <ul>
          <li><b>Bonus ikona</b> ispod snage: +1 snage kad se odigra na slot sa istom ikonom. U Event Step-u se ne računa.</li>
          <li><b>Skill sposobnost</b> (npr. „Move: …“): koristi se samo ako je karta na tom slotu, pre ili posle akcije (ne usred nje, osim ako karta kaže). Opciona je, ali ako je koristiš - ceo tekst, osim delova sa „may“.</li>
          <li><b>Dve lampice</b> ispod imena = karta je dvaput u špilu.</li>
        </ul>
        <h4>Dodatne i besplatne akcije</h4>
        <ul>
          <li><b>Dodatna akcija:</b> igraš skill kartu normalno, ali na slot na koji ovog poteza još nisi igrao.</li>
          <li><b>Besplatna akcija</b> („free action“): razrešiš akciju bez karte; može biti i ista akcija koju si već izveo.</li>
          <li>Ni jedne ni druge se ne računaju u dve obavezne akcije.</li>
        </ul>`
    },
    {
      id: "m-teren",
      title: "Teren i domet",
      html: `
        <table>
          <tr><th>Teren</th><th>Pravilo</th></tr>
          <tr><td><b>Polje</b></td><td>Polja odvojena tankom linijom su susedna. U polju može biti bilo koliko likova i tokena.</td></tr>
          <tr><td><b>Zid</b> (debela siva linija)</td><td>Nije susedno; nema kretanja ni brojanja dometa kroz zid.</td></tr>
          <tr><td><b>Zaključana vrata</b></td><td>Nema kretanja ni dometa, dok ih pravila mape ne otključaju.</td></tr>
          <tr><td><b>Elevacija</b> (tačkasta linija)</td><td>Nije susedno za kretanje, ali <b>domet se broji</b> - može se napadati preko.</td></tr>
          <tr><td><b>Polje sa zvezdom</b></td><td>Tu se najčešće pojavljuju pojačanja. Boja zvezde je bitna samo kad misija to kaže.</td></tr>
          <tr><td><b>Zabranjena zona</b> (crvene pruge)</td><td>Nisu polja - ne može se ući ni brojati domet kroz njih.</td></tr>
          <tr><td><b>Numerisana polja</b></td><td>Mali broj u uglu polja; misije ga koriste (npr. „stavi token na polje #8“).</td></tr>
        </table>
        <h4>Domet (range)</h4>
        <ul>
          <li>Broji polja od lika do tokena najkraćim putem. Neprijatelj u tvom polju je na dometu 0.</li>
          <li>„Unutar dometa X“ znači X ili bliže.</li>
          <li>Domet se broji <b>kroz</b> pretnje, likove, elevaciju i otključana vrata, i <b>oko</b> zidova i ćoškova - ali ne kroz zidove, zaključana vrata i zabranjene zone.</li>
        </ul>`
    },
    {
      id: "m-pretnje",
      title: "Pretnje: neprijatelji i feature-i",
      html: `
        <p>Threat tokeni su ljudi, predmeti i ciljevi na mapi. Neki počinju licem nadole, neki licem nagore. Ostaju dok ne budu poraženi ili odbačeni. Otkrivena pretnja je <b>neprijatelj</b> ili <b>feature</b>; pretnja licem nadole nije ni jedno ni drugo.</p>
        <h4>Neprijatelji</h4>
        <ul>
          <li><b>Klasa:</b> Sharpshooter (strelac), Melee (blisko), Blaster. Sama ne radi ništa, ali je karte pominju (npr. „pomeri sve Blaster neprijatelje“).</li>
          <li><b>Zdravlje:</b> koliko štete treba da se porazi.</li>
          <li><b>Sposobnost:</b> ikona, npr. Sentry.</li>
        </ul>
        <h4>Sposobnosti neprijatelja</h4>
        <table>
          <tr><th>Sposobnost</th><th>Pravilo</th></tr>
          <tr><td><b class="kw">Sentry</b></td><td>1 šteta ako <b>završiš</b> kretanje u dometu 1 od njega. Prolazak pored ne boli ako završiš na 2+. Ako ga otkriješ ulaskom u njegovo polje - boli; ako se otkrije na drugi način - ne. Pomeranje za 0 polja ne aktivira Sentry.</td></tr>
          <tr><td><b class="kw">Grapple</b></td><td>1 šteta ako <b>izađeš</b> iz njegovog polja (pre izlaska). Ako se on pomeri iz tvog polja (npr. Intel akcijom) - nema štete.</td></tr>
          <tr><td><b class="kw">Sabotage</b></td><td>Posle njegovog kretanja u Event Step-u: disrupt action slot sa najmanjom snagom. Ako se ne pomeri, ili se pomeri u Action Step-u - ništa.</td></tr>
          <tr><td><b class="kw">Mission Effect</b></td><td>Kad se otkrije, pogledaj brifing misije. Ne može se poništiti; važi i ako je neprijatelj poražen. Može biti i na feature-ima.</td></tr>
        </table>
        <p class="muted small">Sentry se pojavljuje od 1. misije; Grapple, Sabotage i Mission Effect od 2. misije.</p>
        <h4>Feature-i</h4>
        <p>Imaju veliku ikonu i predstavljaju ciljeve ili predmete; efekat opisuje misija. Feature u svom polju možeš koristiti bilo kad tokom Action Step-a - i u prolazu, i pre nego što deluju sposobnosti neprijatelja. Otkriveni feature-i ne zaustavljaju kretanje.</p>
        <p><b class="kw">Medpac</b>: odbaci ga iz svog polja tokom Action Step-a da izlečiš <b>1 štetu</b> svom liku. Jedan od retkih načina lečenja. Ne može na drugog lika ni ako nemaš štete.</p>`
    },
    {
      id: "m-event",
      title: "Event Step",
      html: `
        ${FIG_M_SLOTS}
        <p>Proveri svaki action slot <b>s leva na desno</b> i saberi snagu (sve skill karte + disrupt tokeni):</p>
        <table>
          <tr><th>Snaga slota</th><th>Šta se dešava</th></tr>
          <tr><td><b>6 ili više</b></td><td>Razreši <b>krizu</b> misije, pa <b>event</b>. Zatim odbaci sve karte i tokene sa slota.</td></tr>
          <tr><td><b>5</b></td><td>Razreši <b>event</b>. Zatim odbaci sve karte i tokene sa slota.</td></tr>
          <tr><td><b>4 ili manje</b></td><td>Ništa. Karte i tokeni <b>ostaju</b> na slotu (i sabiraju se u sledećim potezima).</td></tr>
        </table>
        <p>U Event Step-u se računaju samo brojevi odštampani u gornjem levom uglu skill karata (plus disrupt tokeni) - bonus ikone i sposobnosti ne.</p>
        <h4>Kriza</h4>
        <p>Svaka misija ima svoj okvir krize na dnu brifinga - uradi šta piše.</p>
        <h4>Event karta</h4>
        <ul>
          <li>Vuci gornju event kartu i razreši njene sposobnosti jednu po jednu, odozgo nadole.</li>
          <li>Ti donosiš sve odluke za event karte izvučene u tvom potezu (npr. koji je lik „najbliži“ kod izjednačenja).</li>
          <li>Neke karte imaju „<b>6+</b>“ sposobnost - važi samo ako slot ima 6 ili više.</li>
          <li><b>Leđa</b> event karte imaju ikonu koja nagoveštava šta sledi - koristi to za planiranje. Pri mešanju ne gledaj ikone.</li>
        </ul>
        <h4>Neprijatelji se kreću</h4>
        <p>Event kaže koliko neprijatelja, koje klase i koliko polja. Uvek se kreću <b>ka najbližem liku</b> najkraćim putem. Biraš neprijatelje, ali moraš izabrati one koji će se pomeriti bar 1 polje. Prolaze kroz likove i druge pretnje. Bez naredbe se ne kreću i ne napadaju.</p>
        <h4>Neprijatelji napadaju</h4>
        <p>Event kaže koliko neprijatelja, koje klase i koji domet. Svaki napad = <b>1 šteta</b> na kartici lika, uvek na <b>najbližeg</b> lika u dometu. Biraš tako da napadne <b>što više</b> neprijatelja. Ako lik ima štete ≥ svog zdravlja - <b>svi gube</b>.</p>
        <h4>Pojačanja</h4>
        <ul>
          <li>Uzmi gornji token iz gomile pojačanja i stavi ga licem nagore na navedeno polje (izaberi polje pre nego što vučeš token).</li>
          <li>Nema više pojačanja u gomili → promešaj poražena pojačanja u novu gomilu. Ako su sva u igri - ništa se ne dešava.</li>
        </ul>
        <div class="note"><b>Event bez efekta:</b> ako event karta ništa ne promeni (npr. nema neprijatelja te klase), stavi <b>1 pojačanje na najbliže polje sa zvezdom</b>. Ako je bilo šta promenila, makar minimalno - ne.</div>
        <h4>Disrupt tokeni</h4>
        <ul>
          <li>Leže na action slotovima i dodaju snagu u Event Step-u.</li>
          <li>Kad efekat „disrupt-uje“ akciju: nasumičan token iz rezerve stavi brojem nagore na taj slot. Ako to usred Event Step-a podigne slot na 5+, razreši i njegov event posle trenutnog.</li>
          <li>Nema ograničenja po slotu. Kad ponestane, promešaj odbačene; ako su svi u upotrebi - koristi novčić kao token snage 1.</li>
        </ul>`
    },
    {
      id: "m-pobeda",
      title: "Pobeda, poraz i kraj partije",
      html: `
        <ul>
          <li>Igra se završava kad je <b>cilj misije</b> ispunjen ili je ispunjen <b>uslov neuspeha</b>. Većina ciljeva se proverava na kraju poteza - morate preživeti Event Step.</li>
          <li>Cilj ispunjen → <b>svi pobeđuju</b>. Uslov neuspeha → <b>svi odmah gube</b>.</li>
          <li>Posle svake partije (pobeda ili poraz) prati gornju kartu Guide Deck-a: dodaje nove karte, pravila i komponente i kaže koju misiju igrati sledeću.</li>
          <li>Čuvaj Guide Deck na sigurnom da ne izgubi redosled.</li>
          <li>Svaka misija je zasebna partija: šteta se briše, a likovi, igrači, težina i način igre se mogu menjati između partija.</li>
        </ul>
        <h4>Zlatna pravila</h4>
        <ul>
          <li>Ako se karta ili pravilo misije kose sa pravilnikom - važi karta/misija. Ako se dve karte kose, igrač na potezu bira.</li>
          <li>Igrač na potezu rešava sva izjednačenja i redosled istovremenih efekata; prvi efekat se razreši do kraja pre drugog.</li>
          <li>Kad se špil isprazni, odmah promešaj njegov odbačeni deo u novi špil.</li>
        </ul>`
    },
    {
      id: "m-solo",
      title: "Solo i ograničenja likova",
      html: `
        <p>Ako ima više igrača nego dostupnih likova u misiji, ili igraš sam, izaberi jedan od dva načina:</p>
        <h4>Sandbox mod</h4>
        <p>Svaki igrač bira <b>bilo kog</b> lika, čak i onog koji nije naveden u misiji (ne mora niko biti Mandalorijanac). Lik bez posebnih pravila misije samo ide na startno polje. Brzo i jednostavno.</p>
        <h4>Shared Character mod (deljeni likovi)</h4>
        <ul>
          <li>Svi igrači zajedno upravljaju sa <b>tačno dva</b> lika iz misije.</li>
          <li>Skill špilovi oba lika se mešaju u jedan zajednički špil; svaki igrač vuče svoju ruku iz njega.</li>
          <li>Akciju izvodi lik prikazan na odigranoj skill karti.</li>
          <li>Planning karte idu ispod kartice lika koji ih dobije (po jedna od svake).</li>
          <li>„Ti“ = lik koji izvodi akciju; kod eventa - lik čija je karta na vrhu tog slota.</li>
        </ul>
        <h4>Solo</h4>
        <p>Igraj Shared Character mod sa jednom rukom koja upravlja sa oba lika. Sve ostalo je isto, uključujući Guide Deck.</p>
        <h4>Komunikacija</h4>
        <p>O kartama u ruci smeš da pričaš, ali ne i da ih pokazuješ. Isto važi za tajno pogledane pretnje (smeš i da lažeš). Odbačene karte su javne; u event špil se ne gleda, osim ikone na leđima gornje karte.</p>`
    },
    {
      id: "m-kasnije",
      title: "Pravila koja otkriva Guide Deck",
      html: `
        <div class="note"><b>Pažnja - blagi spojler.</b> Ova pravila ti daje Guide Deck tek posle prvih partija. Čitaj ih kad dođe vreme. Sadržaj koverti ovde nije opisan.</div>
        <h4>The Child (od 2. misije)</h4>
        <ul>
          <li>Kad izvodiš bilo koju akciju u polju sa The Child, možeš ga <b>spasiti</b> - stavi token na svoju karticu lika. Može i u prolazu tokom kretanja.</li>
          <li>Ne može ako ga nosi drugi lik ili neprijatelj. Kad neprijatelj koji ga nosi bude poražen, The Child ostaje u njegovom polju.</li>
          <li>Ne smeš ga namerno ispustiti ni dati drugom liku, niti ga spasiti ako je pobegao ovog poteza.</li>
          <li><b>Bekstvo:</b> ako primiš štetu (koju ne blokiraš) dok ga nosiš, The Child beži na susedno polje - ako može, na polje sa neprijateljem ili pretnjom licem nadole.</li>
        </ul>
        <h4>Disrupt neprijatelja</h4>
        <p>Neke sposobnosti stavljaju disrupt token (brojem dole) na neprijatelja. Takav neprijatelj u Event Step-u ne može da se kreće ni napada - umesto toga skini jedan token. Ne može ni da koristi sposobnosti (npr. Grapple). Najviše 2 tokena po neprijatelju.</p>
        <h4>Tactical skill karte</h4>
        <p>Skill karte sa posebnom ikonom u gornjem levom uglu imaju moćne sposobnosti, ali snagu 0. Sposobnost karte koristiš ako je odigraš na slot naveden na karti. U Event Step-u taj slot se računa kao da ima <b>tačno 5</b> snage, bez obzira na ostale karte i tokene. <span class="muted small">(Tačan tekst pravila je na Guide Deck karti.)</span></p>
        <h4>Akcije posebne za misiju (od 3. misije)</h4>
        <p>Zeleni action slotovi rade kao ostali i dobijaju beli disrupt token u pripremi. Neki traže „4+“ - kartu možeš igrati bilo koje snage, ali efekat važi samo ako je snaga 4 ili više.</p>`
    },
    {
      id: "m-saveti",
      title: "Saveti za početnike",
      html: `
        <ul>
          <li><b>Pazi na slotove:</b> pre nego što odigraš kartu, saberi šta je već na slotu. Slot na 4 je „tempirana bomba“ - i kartica snage 1 ga gura na event.</li>
          <li><b>Jake karte = više eventova:</b> karta snage 4 je moćna akcija, ali brzo puni slot. Ponekad je slabija karta pametniji izbor.</li>
          <li><b>Gledaj leđa event karte</b> - ikona otkriva koji neprijatelji će se pomerati ili napadati.</li>
          <li><b>Plan akcija</b> nije gubljenje vremena: Defend i slične karte spasavaju partije.</li>
          <li><b>Intel pre ulaska:</b> pogledaj pretnju licem nadole pre nego što stupiš na nju - može biti Sentry.</li>
          <li><b>Dogovarajte se:</b> recite koje karte imate (bez pokazivanja) i planirajte redosled.</li>
        </ul>
        <p class="muted small">Ovo poglavlje su saveti, nisu deo zvaničnih pravila.</p>`
    }
  ],

  // ─────────────────────────────── KLJUČNE REČI ───────────────────────────────
  glossary: [
    { term: "Mission", group: "Osnovno", def: "Jedna partija: mapa, cilj, uslovi neuspeha, kriza i posebna pravila iz knjige misija." },
    { term: "Guide Deck", group: "Osnovno", def: "Špil u fiksnom redosledu koji pre i posle partija uvodi nova pravila i karte. Nikad se ne meša." },
    { term: "Skill card", group: "Osnovno", def: "Karta lika snage 1–4 kojom se izvode akcije; 12 po liku." },
    { term: "Strength (snaga)", group: "Osnovno", def: "Broj na skill karti ili disrupt tokenu; određuje jačinu akcije i puni action slot." },
    { term: "Action slot", group: "Osnovno", def: "Mesto za akciju ispod mape (Move, Attack, Intel, Plan, ponekad posebna akcija misije)." },
    { term: "Novice / Standard / Veteran", group: "Osnovno", def: "Nivoi težine: strana kartice lika i veličina ruke (veteran: 3)." },
    { term: "Move", group: "Akcije", def: "Kretanje do [snaga] polja; staje se kod neprijatelja ili pretnje licem nadole." },
    { term: "Attack", group: "Akcije", def: "[Snaga] štete pretnji u dometu 1; može i pretnji licem nadole." },
    { term: "Intel", group: "Akcije", def: "Tajno pogledaj pretnju ili pomeri neprijatelja 1 polje, u dometu jednakom snazi." },
    { term: "Plan", group: "Akcije", def: "Vuci [snaga] planning karata; zadrži 1, 1 možeš vratiti na vrh špila." },
    { term: "Free action", group: "Akcije", def: "Akcija bez igranja karte; ne računa se u dve obavezne." },
    { term: "Additional action", group: "Akcije", def: "Dodatna akcija sa kartom, na slot koji ovog poteza još nisi koristio." },
    { term: "Bonus icon", group: "Akcije", def: "+1 snage kad se karta odigra na slot sa istom ikonom; ne važi u Event Step-u." },
    { term: "Planning card", group: "Akcije", def: "Karta zadržana ispod kartice lika do upotrebe (npr. Defend, Retaliate, Strategize)." },
    { term: "Event Step", group: "Događaji", def: "Posle akcija: slot 5 = event, 6+ = kriza i event, 4 ili manje = ništa." },
    { term: "Crisis", group: "Događaji", def: "Negativan efekat misije iz okvira na dnu brifinga; kad slot ima 6+." },
    { term: "Event card", group: "Događaji", def: "Neprijateljske akcije: kretanje, napadi, pojačanja…" },
    { term: "Reinforcement", group: "Događaji", def: "Novi neprijatelj iz gomile pojačanja, obično na polje sa zvezdom." },
    { term: "Disrupt token", group: "Događaji", def: "Token na action slotu koji dodaje snagu (ili, kasnije, na neprijatelju koji ga blokira)." },
    { term: "Threat token", group: "Pretnje", def: "Token na mapi: licem nadole nepoznat, licem nagore neprijatelj ili feature." },
    { term: "Enemy", group: "Pretnje", def: "Otkrivena pretnja sa klasom, zdravljem i možda sposobnošću." },
    { term: "Feature", group: "Pretnje", def: "Otkrivena pretnja-cilj ili predmet (npr. Medpac); efekat opisuje misija." },
    { term: "Medpac", group: "Pretnje", def: "Odbaci ga iz svog polja da izlečiš 1 štetu." },
    { term: "Sentry", group: "Sposobnosti neprijatelja", def: "1 šteta ako završiš kretanje u dometu 1." },
    { term: "Grapple", group: "Sposobnosti neprijatelja", def: "1 šteta ako izađeš iz njegovog polja." },
    { term: "Sabotage", group: "Sposobnosti neprijatelja", def: "Posle kretanja u Event Step-u: disrupt najslabiji slot." },
    { term: "Mission Effect", group: "Sposobnosti neprijatelja", def: "Kad se otkrije, razreši efekat iz brifinga misije." },
    { term: "Range (domet)", group: "Teren", def: "Broj polja najkraćim putem; kroz pretnje, likove, elevaciju i otključana vrata, ne kroz zidove." },
    { term: "Wall", group: "Teren", def: "Debela siva linija: bez kretanja i dometa." },
    { term: "Elevation", group: "Teren", def: "Tačkasta linija: bez kretanja, ali domet prolazi." },
    { term: "Forbidden area", group: "Teren", def: "Crvene pruge - nisu polja." },
    { term: "Star space", group: "Teren", def: "Polje sa zvezdom gde se pojavljuju pojačanja." },
    { term: "The Child", group: "Kasnije (Guide Deck)", def: "Token koji likovi spasavaju i nose; beži kad nosilac primi štetu." }
  ],

  expansions: [],

  sources: [
    { label: "Pravilnik (PDF, preko Games4You)", url: "https://games-for-you.oozmi-cdn.com/products/07d719f2-a030-4336-8516-bec490285d02/pdfs/drustvena-igra-mandalorian-adventures-rules.pdf" },
    { label: "Pravilnik na BoardGameGeek-u", url: "https://boardgamegeek.com/filepage/282759/the-mandaloriantm-adventures-rulebook" },
    { label: "Asmodee - stranica igre", url: "https://store.asmodee.com/products/the-mandalorian-adventures" }
  ]
});
})();
