(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Tok poteza: 8 koraka u "zmiji"
const wStep = (x, y, t, sub, acc) =>
  F.box(x, y, 108, 64, t, { sub, cls: acc ? "f-acc" : "f-box", titleCls: "f-title f-small" });
const FIG_W_TURN = F.figure(
  482, 186,
  wStep(10, 10, "1 · Aktiviraj", "izaberi crva") +
    wStep(128, 10, "2 · Izleči", "ako je oštećen") +
    wStep(246, 10, "3 · Pomeri", "Inch ili Jump") +
    wStep(364, 10, "4 · Pomeri opet", "Inch ili Jump") +
    wStep(364, 112, "5 · Oružje", "odigraj kartu", true) +
    wStep(246, 112, "6 · Kraj poteza", "efekti kraja") +
    wStep(128, 112, "7 · Drop karta", "razreši je") +
    wStep(10, 112, "8 · Target Token", "dodaj levo") +
    F.arrow(118, 42, 126, 42) + F.arrow(236, 42, 244, 42) + F.arrow(354, 42, 362, 42) +
    F.arrow(418, 74, 418, 110) +
    F.arrow(364, 144, 356, 144) + F.arrow(246, 144, 238, 144) + F.arrow(128, 144, 120, 144),
  { caption: "Svaki potez ima istih 8 koraka. Koraci 3 i 4 su opcioni - crv ne mora da se pomera." }
);

// Pravci i Direct heksovi (heksovi ravne gornje ivice, kao na mapi)
const S = 30, CX = 240, CY = 158, R3 = Math.sqrt(3);
const hexPts = (cx, cy) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i);
    return `${(cx + S * Math.cos(a)).toFixed(1)},${(cy + S * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
const hexCenter = (q, r) => [CX + S * 1.5 * q, CY + S * R3 * (r + q / 2)];
// pravci 1–6: gore, gore-desno, dole-desno, dole, dole-levo, gore-levo
const DIRS = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]];
const hexCells = [];
for (let q = -2; q <= 2; q++)
  for (let r = -2; r <= 2; r++) {
    if (Math.abs(q + r) > 2) continue;
    const direct = q === 0 || r === 0 || q + r === 0;
    const [x, y] = hexCenter(q, r);
    const center = q === 0 && r === 0;
    hexCells.push(`<polygon points="${hexPts(x, y)}" class="${center ? "f-card" : direct ? "f-acc" : "f-box"}"/>`);
  }
const dirLabels = DIRS.map(([q, r], i) => {
  const [x, y] = hexCenter(q, r);
  return F.text(x, y + 6, String(i + 1), { cls: "f-title" });
}).join("");
const FIG_W_DIRS = F.figure(
  480, 316,
  hexCells.join("") +
    `<circle cx="${CX}" cy="${CY}" r="11" class="f-worm"/>` +
    dirLabels +
    F.text(16, 40, ["Brojevi = 6 pravaca", "(kao na Wind Dial-u)"], { cls: "f-small", anchor: "start", lh: 16 }) +
    F.text(16, 280, ["Obojeni heksovi su", "Direct heksovi:", "u pravoj liniji od crva"], { cls: "f-small", anchor: "start", lh: 16 }) +
    F.text(464, 280, ["Sivi heksovi", "nisu Direct"], { cls: "f-muted", anchor: "end", lh: 15 }),
  { caption: "Crv u sredini. Pravci su numerisani 1–6 kao na Wind Dial-u; proveri brojeve na svom Wind Dial-u." }
);

// ─────────────────────────────── IGRA ───────────────────────────────

registerGame({
  id: "worms",
  title: "Worms: The Board Game",
  subtitle: "Crvi, bazuke i ovce koje eksplodiraju",
  publisher: "Mantic Games",
  players: "2–4; 45 min, 10+",
  category: "Taktička igra na heksovima",
  accent: "#e0662a",
  cover: "images/worms.jpg",
  owned: "Osnovna igra",
  rulesVersion: "Zvanični pravilnik (Mantic, 2023)",
  summary:
    "Društvena verzija kultne video-igre. Svaki igrač ima tim od 4 crva na mapi od heksova. U svakom potezu pomeraš jednog crva i ispaljuješ oružje - uz vetar, rasipanje i mnogo eksplozija. Kad prvi tim bude izbrisan, igra se još jedan krug, a pobeđuje ko ima najviše preživelih crva.",

  // ─────────────────────────────── BRZI PODSETNIK ───────────────────────────────
  quickRef: [
    {
      title: "Cilj i kraj igre",
      html: `
        <ul>
          <li>Kad nekom igraču ne ostane nijedan crv, on je <b>eliminisan</b>.</li>
          <li>Prva eliminacija pokreće kraj: završi tekući potez, pa <b>svako igra još jedan potez</b>.</li>
          <li>Pobeđuje ko ima <b>najviše crva</b>. Nerešeno → više <b>neoštećenih</b> crva. I dalje nerešeno → remi.</li>
        </ul>`
    },
    {
      title: "Potez (8 koraka)",
      html: `
        <ol>
          <li><b>Aktiviraj</b> jednog svog crva (ako stoji na <b class="kw">Supply Crate</b> - vuci kartu).</li>
          <li><b>Izleči</b> ga ako je oštećen (podigni ga).</li>
          <li><b class="kw">Inch</b> ili <b class="kw">Jump</b> (ili ništa).</li>
          <li>Još jednom <b>Inch</b> ili <b>Jump</b> (ili ništa).</li>
          <li>Odigraj <b>kartu oružja</b> (opciono).</li>
          <li><b>Kraj poteza</b> - efekti kraja poteza.</li>
          <li>Vuci i razreši <b class="kw">Drop</b> kartu.</li>
          <li>Dodaj <b class="kw">Target Token</b> igraču levo.</li>
        </ol>
        <p>Ako tvoj crv bude oštećen u tvom potezu: završi tekst karte, pa odmah pređi na korak 6.</p>`
    },
    {
      title: "Kretanje",
      html: `
        <ul>
          <li><b class="kw">Inch</b> - na susedni kopneni heks.</li>
          <li><b class="kw">Jump</b> - na bilo koji heks do 2 daleko (preskače), pa <b class="kw">Scatter</b>.</li>
          <li><b>Mina</b> → ukloni je, baci <b class="kw">Danger Flipper</b>: opasnost = Blast.</li>
          <li><b>Vatra</b> → ukloni je, baci Flipper: opasnost = crv oštećen.</li>
          <li><b>Supply Crate</b> → vuci kartu oružja.</li>
          <li><b>Voda</b> → crv (i sve drugo) tone i uništen je.</li>
          <li>4+ stvari u heksu → izaberi crva i uradi mu <b class="kw">Knockback Scatter</b>.</li>
        </ul>`
    },
    {
      title: "Karta oružja - Action Line",
      html: `
        <p>Razrešavaj simbole s leva na desno:</p>
        <ul>
          <li><b>Strelica</b> → crv može Inch ili Jump (za svaku strelicu).</li>
          <li><b>Karta</b> → odigraj još jednu kartu iz ruke.</li>
          <li><b>Meta</b> → razreši ceo tekst karte (za svaki simbol ponovo).</li>
        </ul>
        <p>Posle toga karta ide u kutiju.</p>`
    },
    {
      title: "Kockice",
      html: `
        <table class="kwtable">
          <tr><td></td><td><b>broj 1–6</b></td><td><b>vetar</b></td><td><b>meta</b></td></tr>
          <tr><td class="kw">Accuracy</td><td>meta 1 heks u tom pravcu</td><td>meta niz vetar</td><td>pogodak, ne mrdaj</td></tr>
          <tr><td class="kw">Blast</td><td>šteta + 1 heks u pravcu</td><td>šteta + niz vetar</td><td>samo šteta</td></tr>
          <tr><td class="kw">Scatter</td><td>1 heks u pravcu</td><td>niz vetar</td><td>ostaje</td></tr>
          <tr><td class="kw">Knockback</td><td>1 heks u pravcu</td><td>niz vetar</td><td>ti biraš pravac</td></tr>
          <tr><td class="kw">Change Wind</td><td>vetar na taj broj</td><td colspan="2">vetar se ne menja</td></tr>
        </table>`
    },
    {
      title: "Gađanje",
      html: `
        <ul>
          <li><b class="kw">Direct hex</b> - u pravoj liniji u jednom od 6 pravaca (i sopstveni heks).</li>
          <li><b class="kw">Accuracy X</b>: ako meta nije u tvom ni susednom heksu, X umanji za broj koraka do susedstva mete (min. 1). Baci X kockica, izaberi jednu.</li>
          <li><b class="kw">Blast</b>: stavi Crater; za svaku stvar (prvo crvi) baci kockicu → šteta ± pomeranje.</li>
          <li><b class="kw">Air Strike</b>: meta + 2 heksa u pravcu strelice na žetonu.</li>
        </ul>`
    },
    {
      title: "Šteta",
      html: `
        <ul>
          <li><b>Crv:</b> stoji → legne (oštećen). Već leži → uništen.</li>
          <li><b>Oil Drum:</b> uništi ga, baci 5 kockica; svaki dobijeni pravac: šteta svemu + Vatra.</li>
          <li><b>Mina:</b> uništi je i razreši Blast.</li>
          <li><b>Supply Crate:</b> uništen.</li>
          <li><b>3 kratera</b> u heksu → sve uništeno, heks postaje voda.</li>
        </ul>`
    },
    {
      title: "Drop i Sudden Death",
      html: `
        <ul>
          <li>Drop Deck: 2 karte po igraču + još 2, a na dnu <b class="kw">Sudden Death</b>.</li>
          <li>Kad se otkrije Sudden Death, ostaje otvorena: od tada umesto Drop karte razrešavaš njen „Drop“ deo.</li>
        </ul>`
    }
  ],

  // ─────────────────────────────── PUNA PRAVILA ───────────────────────────────
  rules: [
    {
      id: "w-pregled",
      title: "Pregled igre",
      html: `
        <p>Svaki igrač vodi tim od 4 crva na mapi od heksova. Igra se u potezima, u smeru kazaljke na satu. U svom potezu biraš <b>jednog</b> crva, pomeraš ga, skupljaš oružje iz kutija i ispaljuješ oružje na protivnike - a vetar, rasipanje i eksplozije se brinu da ništa ne ide po planu.</p>
        <p>Kad prvi tim bude potpuno uništen, igra se još jedan krug. Pobeđuje igrač sa <b>najviše preživelih crva</b>.</p>
        <div class="note"><b>Opšta pravila:</b><br>
        • Ako se više efekata aktivira istovremeno, igrač na potezu bira redosled.<br>
        • Ako se pravilo na karti i pravilo u knjižici kose - važi karta.<br>
        • „Ti“ i „tvoj crv“ u pravilima znači aktivni igrač i njegov aktivni crv.</div>`
    },
    {
      id: "w-sadrzaj",
      title: "Sadržaj kutije",
      html: `
        <table>
          <tr><th>Komponenta</th><th>Količina</th></tr>
          <tr><td>Crvi (4 različite figure)</td><td>16</td></tr>
          <tr><td>Plastični prstenovi u bojama timova (kače se na crve)</td><td>16</td></tr>
          <tr><td>Map Tiles (po 4–5 kopnenih heksova)</td><td>4</td></tr>
          <tr><td>Water hexes (vodeni heksovi)</td><td>9</td></tr>
          <tr><td>Wind Dial sa strelicom</td><td>1</td></tr>
          <tr><td>Supply Crates / Mines / Oil Drums</td><td>po 6</td></tr>
          <tr><td>Fire (vatra)</td><td>10</td></tr>
          <tr><td>Craters (krateri)</td><td>20</td></tr>
          <tr><td>Posebne kockice</td><td>5</td></tr>
          <tr><td>Danger Flipper, Target Token</td><td>po 1</td></tr>
          <tr><td>Karte: oružje, Drop, Sudden Death, referentne karte</td><td>80+</td></tr>
        </table>
        <p class="muted small">Referentne karte: po jedna za svakog igrača (boja tima) i po jedna za svaku „stvar“ i žeton u igri.</p>`
    },
    {
      id: "w-priprema",
      title: "Priprema igre",
      html: `
        <p>Za prvu partiju pogledaj „Prva partija“ ispod. Najmlađi igrač je prvi tokom pripreme.</p>
        <ol>
          <li><b>Mapa.</b> Stavi Wind Dial na sto. Počev od prvog igrača, u krug, svako postavlja po jednu Map Tile tako da ivicom dodiruje Wind Dial ili već postavljenu pločicu. Što više igrača, veća mapa.</li>
          <li><b>Skupljanje.</b> Za svakog igrača uzmi: <b>4 crva</b> jedne boje i po <b>1 Oil Drum, Mine i Supply Crate</b>. Stavi ih pored mape.</li>
          <li><b>Postavljanje.</b> Redom, svako stavlja po jednu stvar iz gomile (bilo koju - i crva bilo koje boje) na kopneni heks, dok se sve ne postavi. Najviše 3 stvari po heksu. Timovi još nisu podeljeni, pa nema dobrog ni lošeg izbora!</li>
          <li><b>Timovi.</b> Promešaj referentne karte boja koje se koriste i podeli nasumično. Boja koju dobiješ je tvoj tim.</li>
          <li><b>Početna ruka.</b> Izdvoj <b>Starter</b> karte oružja (tamnija leđa i poseban simbol). Svako uzima po jednu: <b>Uzi, Bazooka, Ninja Rope, Girder</b>. Ostale Starter karte promešaj i podeli po jednu licem nadole. Imaš 5 karata - drži ih u tajnosti.</li>
          <li><b>Špilovi.</b>
            <ul>
              <li><b>Supply Deck:</b> promešaj sve karte oružja koje nisu Starter.</li>
              <li><b>Drop Deck:</b> ne gledajući, izaberi jednu <b>Sudden Death</b> kartu i stavi je licem nadole. Uzmi <b>2 Drop karte po igraču + još 2</b>, promešaj ih i stavi preko Sudden Death karte.</li>
              <li>Ostale Drop, Sudden Death i Starter karte vrati u kutiju.</li>
            </ul>
          </li>
          <li><b>Prvi igrač.</b> Ko ima najmanji broj u donjem desnom uglu referentne karte (obično plavi) uzima <b>Target Token</b>. On baca kockicu dok ne dobije broj i postavlja vetar na taj pravac. Igrač sa Target Token-om igra prvi.</li>
        </ol>
        <h4>Prva partija</h4>
        <ul>
          <li>Postavite mapu i stvari prema slici u pravilniku (str. 15). Za 2 igrača uklonite pločice označene sa 2 i 3; za 3 igrača pločicu označenu sa 3.</li>
          <li>Svaki tim ima samo <b>2 crva</b>, dok se uhodate.</li>
          <li>Karte i špilovi kao gore. Vetar na <b>2</b>. Target Token dobija <b>plavi</b> igrač (neka to bude najiskusniji).</li>
        </ul>`
    },
    {
      id: "w-potez",
      title: "Tok poteza",
      html: `
        ${FIG_W_TURN}
        <h4>1. Aktiviraj crva</h4>
        <p>Izaberi bilo kog svog crva kao aktivnog. Ako nemaš nijednog - eliminisan si. Ako crv stoji u heksu sa <b class="kw">Supply Crate</b>, ukloni kutiju i vuci kartu iz Supply Deck-a.</p>
        <h4>2. Izleči crva</h4>
        <p>Ako je aktivni crv oštećen (leži), podigni ga - ponovo je potpuno zdrav.</p>
        <h4>3. i 4. Inch ili Jump (dvaput)</h4>
        <p>Dva puta možeš da uradiš <b class="kw">Inch</b> ili <b class="kw">Jump</b>, u bilo kojoj kombinaciji, ili da se ne pomeraš.</p>
        <h4>5. Odigraj kartu oružja</h4>
        <p>Možeš odigrati jednu kartu iz ruke (vidi „Karte“).</p>
        <h4>6. Kraj poteza</h4>
        <p>Razreši efekte koji se aktiviraju na kraju poteza.</p>
        <h4>7. Vuci Drop kartu</h4>
        <p>Otkrij gornju kartu Drop Deck-a i razreši ceo tekst, odozgo nadole. Zatim je vrati u kutiju.</p>
        <h4>8. Dodaj Target Token</h4>
        <p>Uzmi Target Token (sa mape ili ispred sebe) i daj ga igraču levo. Sada je on na potezu.</p>
        <div class="note">Ako tvoj crv bude <b>oštećen tokom tvog poteza</b>, završi tekst karte oružja (ako si je odigrao) i odmah pređi na korak 6.</div>`
    },
    {
      id: "w-kretanje",
      title: "Kretanje",
      html: `
        <table>
          <tr><th>Potez</th><th>Kako</th></tr>
          <tr><td><b class="kw">Inch</b></td><td>Pomeri crva sa kopnenog heksa na <b>susedni kopneni</b> heks.</td></tr>
          <tr><td><b class="kw">Jump</b></td><td>Izaberi bilo koji heks <b>do 2 heksa</b> daleko i prebaci crva tamo (preskače sve između). Zatim uradi <b class="kw">Scatter</b> crva - može da završi u vodi!</td></tr>
        </table>
        <h4>Šta se dešava kad uđeš u heks</h4>
        <ul>
          <li><b>Mina</b> - ukloni minu i baci <b class="kw">Danger Flipper</b>. „Safe“: mina je bila neispravna. „Danger“: mina eksplodira (Blast u tom heksu).</li>
          <li><b>Vatra</b> - ukloni vatru i baci Danger Flipper. „Danger“: crv je oštećen.</li>
          <li><b>Supply Crate</b> - vuci kartu iz Supply Deck-a u ruku; kutija se vraća sa strane mape.</li>
          <li><b>Voda</b> - sve što uđe ili bude postavljeno u vodu tone i uništeno je.</li>
          <li><b>Pun heks</b> - heks drži najviše 3 stvari. Ako posle pomeranja (i svih efekata) ima 4 ili više, izaberi crva u tom heksu i uradi mu <b class="kw">Knockback Scatter</b>. Ako nema crva, možeš „gurnuti“ bilo koju stvar osim kratera.</li>
        </ul>
        <p>Ako u heksu ima više stvari (npr. mina i kutija), ti biraš redosled razrešavanja - pametno je prvo uzeti kutiju!</p>
        <div class="example"><b>Primer:</b> crveni igrač pravi Inch, pa rizikuje Jump preko vode do heksa sa kutijom. Uzima kartu, pa baca za Scatter - pada simbol vetra i crv odlazi jedan heks niz vetar… pravo u vodu.</div>`
    },
    {
      id: "w-karte",
      title: "Karte oružja, Drop i Sudden Death",
      html: `
        <h4>Karta oružja</h4>
        <ul>
          <li><b>Naziv</b> - nema uticaj na pravila.</li>
          <li><b>Action Line</b> - niz simbola koji se razrešava s leva na desno.</li>
          <li><b>Tekst</b> - šta oružje radi (npr. Bazooka: izaberi Direct heks kao metu, baci Accuracy, pa Blast).</li>
          <li><b>Starter</b> simbol (tamnija leđa) ili <b>Superweapon</b> simbol (žuta traka naslova). Superweapon nema posebno pravilo osim kad se neka karta poziva na njega.</li>
        </ul>
        <h4>Simboli na Action Line</h4>
        <table>
          <tr><th>Simbol</th><th>Značenje</th></tr>
          <tr><td>Strelica</td><td>Crv može da uradi Inch ili Jump. Više strelica = više pomeranja.</td></tr>
          <tr><td>Karta</td><td>Odigraj još jednu kartu oružja iz ruke.</td></tr>
          <tr><td>Meta</td><td>Razreši ceo tekst karte, redom, pre nego što pređeš na sledeći simbol. Više simbola mete = ceo tekst se razrešava više puta.</td></tr>
        </table>
        <p>Posle potpunog razrešavanja karta ide u kutiju, licem nagore.</p>
        <h4>Drop karte</h4>
        <p>Na kraju svakog poteza (korak 7) vuče se jedna Drop karta - donose nove kutije, mine, promene vetra i slično. Ceo tekst se mora razrešiti, redom.</p>
        <h4>Sudden Death</h4>
        <p>Poslednja karta Drop Deck-a je Sudden Death. Kad se otkrije, razreši je i ostavi otvorenu pored mape. Do kraja igre, umesto nove Drop karte razrešavaš <b>„Drop“ deo</b> Sudden Death karte. Te karte uvode nova pravila i ubrzavaju kraj.</p>`
    },
    {
      id: "w-pravci",
      title: "Pravci, vetar i kockice",
      html: `
        ${FIG_W_DIRS}
        <ul>
          <li>Postoji <b>6 pravaca</b> - po jedan za svaku stranu heksa, numerisani kao na <b class="kw">Wind Dial</b>-u.</li>
          <li>Kockice pokazuju broj (pravac), <b>simbol vetra</b> ili <b>simbol mete</b>.</li>
          <li>Simbol vetra kao pravac = trenutni pravac vetra.</li>
          <li>Na početku igre vetar se postavlja nasumično. <b class="kw">Change Wind</b>: baci kockicu - broj postavlja novi vetar; vetar ili meta: ne menja se.</li>
          <li><b class="kw">Danger Flipper</b> je „novčić“: <b>Danger</b> (opasnost) ili <b>Safe</b> (bezbedno).</li>
        </ul>
        <h4>Tabele kockica</h4>
        <table>
          <tr><th>Bacanje</th><th>Broj 1–6</th><th>Simbol vetra</th><th>Simbol mete</th></tr>
          <tr><td><b class="kw">Accuracy</b></td><td>meta se pomera 1 heks u tom pravcu</td><td>meta 1 heks niz vetar</td><td>bez pomeranja - direktan pogodak!</td></tr>
          <tr><td><b class="kw">Blast</b></td><td>šteta, pa stvar 1 heks u tom pravcu</td><td>šteta, pa 1 heks niz vetar</td><td>samo šteta</td></tr>
          <tr><td><b class="kw">Scatter</b></td><td>1 heks u tom pravcu</td><td>1 heks niz vetar</td><td>ne pomera se</td></tr>
          <tr><td><b class="kw">Knockback Scatter</b></td><td>1 heks u tom pravcu</td><td>1 heks niz vetar</td><td>ti biraš pravac - uvek se pomera!</td></tr>
          <tr><td><b class="kw">Change Wind</b></td><td>vetar na taj broj</td><td colspan="2">vetar se ne menja</td></tr>
        </table>`
    },
    {
      id: "w-gadjanje",
      title: "Gađanje",
      html: `
        <p>Većina oružja stavlja <b class="kw">Target Token</b> u heks i deluje na njega. Target Token nije stvar - samo označava metu.</p>
        <h4>Ograničenja mete</h4>
        <ul>
          <li><b class="kw">Direct hex</b> - heks u pravoj liniji u jednom od 6 pravaca od tvog crva. Sopstveni heks je takođe Direct.</li>
          <li><b class="kw">Hex within X</b> - heks udaljen X ili manje. Sopstveni heks je uvek unutar X.</li>
          <li><b class="kw">New hex</b> - heks u kome trenutno nije Target Token (važno za oružja sa više pucnjeva, npr. Shotgun).</li>
        </ul>
        <h4>Accuracy X</h4>
        <p>Ako meta nije u tvom niti u susednom heksu, smanji X za broj koraka koje bi crv morao da napravi da stigne do susedstva mete (računaju se i vodeni heksovi). Minimum je 1. Baci X kockica i <b>izaberi jedan</b> rezultat.</p>
        <table>
          <tr><th>Udaljenost mete</th><th>Accuracy 4 → kockica</th></tr>
          <tr><td>tvoj heks ili susedni</td><td>4</td></tr>
          <tr><td>2 heksa</td><td>3</td></tr>
          <tr><td>3 heksa</td><td>2</td></tr>
          <tr><td>4 i više</td><td>1</td></tr>
        </table>
        <h4>Air Strike</h4>
        <p>Okreni Target Token na stranu sa strelicom i stavi ga u bilo koji heks (i vodeni), okrenut u jedan od 6 pravaca. Efekat (npr. Blast) deluje na heks sa žetonom i <b>još 2 heksa</b> u pravcu strelice, redom. Kad se Air Strike rasipa (Scatter), žeton zadržava pravac.</p>
        <div class="example"><b>Primer iz pravilnika:</b> plavi ispaljuje Bazooku. Crveni crv nije u pravoj liniji, pa plavi cilja susedni heks, nadajući se vetru. Accuracy 4 −1 za daljinu = 3 kockice; jedna pokaže vetar i meta se pomera baš na crvenog crva. Blast: krater u heks, kockica za crva → oštećen i odbačen u pravcu 1 (jedini bezbedan pravac!). Na kraju strelica sa Bazooke: plavi se pomera do kutije i vuče još jednu kartu.</div>`
    },
    {
      id: "w-steta",
      title: "Eksplozije i šteta",
      html: `
        <h4>Blast</h4>
        <ol>
          <li>Ako je meta vodeni heks - ništa se ne dešava.</li>
          <li>Inače stavi <b class="kw">Crater</b> u heks.</li>
          <li>Za svaku stvar u heksu, <b>prvo crvi</b>, baci kockicu (tabela Blast): šteta i eventualno pomeranje za 1 heks.</li>
        </ol>
        <p>Crv koji je odbačen u drugi heks razrešava sve kao da je ušao normalno: voda ga uništava, mina se može aktivirati, itd.</p>
        <h4>Šteta po vrsti stvari</h4>
        <table>
          <tr><th>Stvar</th><th>Kad primi štetu</th></tr>
          <tr><td><b>Crv</b></td><td>Ako stoji (zdrav) → polegni ga, sada je <b>oštećen</b>. Ako već leži → <b>uništen</b>, skloni ga.</td></tr>
          <tr><td><b class="kw">Oil Drum</b></td><td>Uništi bure i baci <b>5 kockica</b>. Za svaki dobijeni pravac (meta = heks bureta, vetar = pravac vetra): šteta svemu u tom heksu, pa stavi <b>Vatru</b>. Ponovljeni rezultati se ne računaju dvaput.</td></tr>
          <tr><td><b class="kw">Mine</b></td><td>Uništi minu i razreši <b>Blast</b> u njenom heksu.</td></tr>
          <tr><td><b class="kw">Supply Crate</b></td><td>Uništena.</td></tr>
        </table>
        <h4>Ostale stvari</h4>
        <ul>
          <li><b class="kw">Crater</b> - ne može se pomeriti ni uništiti (osim kad karta to kaže, npr. Girder). <b>3 kratera u heksu</b>: uništi sve u heksu, uključujući kratere, i stavi vodeni heks.</li>
          <li><b class="kw">Fire</b> - ne može se pomeriti ni uništiti, osim efektima koji je pominju (i vodom). Kad nešto uđe u vatru: ukloni vatru i baci Danger Flipper; „Danger“ = šteta.</li>
          <li><b>Uništeno</b> = skloni sa mape u rezervu pored mape. Crvi se ne vraćaju.</li>
        </ul>`
    },
    {
      id: "w-heksovi",
      title: "Heksovi",
      html: `
        <table>
          <tr><th>Pojam</th><th>Značenje</th></tr>
          <tr><td><b class="kw">Land hex</b></td><td>Heks potpuno ili uglavnom prekriven kopnom (može imati malo vode na slici).</td></tr>
          <tr><td><b class="kw">Water hex</b></td><td>Svaki heks koji nije kopno, ili je prekriven vodenim heksom. <b>Wind Dial je takođe vodeni heks.</b> Sve što uđe ili bude postavljeno u vodu tone - čak i vatra i krateri.</td></tr>
          <tr><td><b>„Phantom“ voda</b></td><td>Sve van ivice mape se računa kao vodeni heksovi - važe za brojanje daljine, rasipanje i gađanje. Crv odbačen sa mape je uništen.</td></tr>
          <tr><td><b class="kw">Full hex</b></td><td>Heks sa 3 stvari je pun. Ako ih bude 4+, Knockback Scatter crva iz tog heksa.</td></tr>
          <tr><td><b class="kw">Non-full hex</b></td><td>Kopneni heks sa manje od 3 stvari.</td></tr>
          <tr><td><b class="kw">Emptiest</b></td><td>Kopneni heks sa najmanje stvari (kod nerešenog bira aktivni igrač).</td></tr>
          <tr><td><b class="kw">Own hex</b></td><td>Heks u kome je tvoj crv.</td></tr>
          <tr><td><b class="kw">Place</b> / <b>Move</b></td><td>Place = uzmi iz rezerve i stavi u heks (ako ponestane komponenti, ne stavljaš). Move = pomeri nešto što je već na mapi.</td></tr>
        </table>
        <p><b>Stvari (Things):</b> crvi, Oil Drum, Supply Crate, mine, krateri i vatra. Target Token nije stvar.</p>`
    },
    {
      id: "w-pobeda",
      title: "Eliminacija i pobeda",
      html: `
        <ul>
          <li>Igrač kome ne ostane nijedan crv je <b>eliminisan</b>.</li>
          <li>Prva eliminacija pokreće kraj igre: završi potez igrača na potezu, pa <b>svaki igrač igra još jedan potez</b> (uključujući i onoga ko je upravo završio).</li>
          <li>Posle poslednjeg kruga pobeđuje igrač sa <b>najviše preostalih crva</b>.</li>
          <li>Nerešeno → pobeđuje ko ima više <b>neoštećenih</b> crva. Ako je i to isto → remi.</li>
        </ul>`
    },
    {
      id: "w-opciona",
      title: "Opciona pravila",
      html: `
        <table>
          <tr><th>Pravilo</th><th>Opis</th></tr>
          <tr><td><b>Parting Gifts</b></td><td>Kad crv bude uništen, razreši Blast u njegovom heksu. Ako ga je uništio Blast, prvo odredi gde je odbačen.</td></tr>
          <tr><td><b>True Elimination</b></td><td>Eliminacija ne pokreće kraj - igra traje dok ne ostane samo jedan igrač.</td></tr>
          <tr><td><b>Sudden Death Draft</b></td><td>Podeli Sudden Death karte igračima; svako izabere jednu, pa se nasumično zadrži samo jedna od izabranih.</td></tr>
          <tr><td><b>No Sudden Death</b></td><td>Bez Sudden Death karte; koriste se sve Drop karte, a kad se špil isprazni, promešaju se ponovo.</td></tr>
          <tr><td><b>Late Superweapons</b></td><td>Superweapon karte idu na dno Supply Deck-a, a preko njih po 2 obične karte po igraču.</td></tr>
          <tr><td><b>Longer game</b></td><td>U Drop Deck idu sve Drop karte.</td></tr>
          <tr><td><b>Reduced Blast</b></td><td>Blast ne nanosi štetu (ali i dalje stavlja kratere i rasipa stvari).</td></tr>
          <tr><td><b>Larger map</b></td><td>Dodaj još Map Tile-ova; svako postavi po jednu, a ostale postavlja najmlađi igrač.</td></tr>
          <tr><td><b>Timer</b></td><td>60 sekundi po potezu (do koraka 6). Ako istekne, odmah prelaziš na korak 6 - započeti tekst karte smeš da završiš.</td></tr>
        </table>`
    },
    {
      id: "w-saveti",
      title: "Saveti za početnike",
      html: `
        <ul>
          <li><b>Voda je najveći neprijatelj</b> - pre Jump-a pogledaj vetar i šta je oko ciljnog heksa.</li>
          <li><b>Kutije pre mina:</b> kad su u istom heksu, ti biraš redosled - prvo uzmi kartu.</li>
          <li><b>Leči crve:</b> aktiviranjem oštećenog crva on se odmah leči, pa često vredi igrati sa ranjenim.</li>
          <li><b>Gađaj bure</b> pored protivnika - Oil Drum može zapaliti više heksova odjednom.</li>
          <li><b>Koristi vetar:</b> kad cilj nije u pravoj liniji, gađaj heks „uz vetar“ od njega.</li>
          <li><b>Ne gomilaj crve</b> u istom heksu - jedan Blast može da ih pogodi sve.</li>
        </ul>
        <p class="muted small">Ovo poglavlje su saveti, nisu deo zvaničnih pravila.</p>`
    }
  ],

  // ─────────────────────────────── KLJUČNE REČI ───────────────────────────────
  glossary: [
    { term: "Active worm", group: "Osnovno", def: "Crv kog si izabrao u koraku 1; on se pomera i puca ovog poteza." },
    { term: "Thing (stvar)", group: "Osnovno", def: "Crvi, Oil Drum, Supply Crate, mine, krateri i vatra. Heks drži najviše 3 stvari." },
    { term: "Damaged", group: "Osnovno", def: "Oštećen crv leži na boku. Još jedna šteta ga uništava. Leči se kad ga aktiviraš." },
    { term: "Destroy", group: "Osnovno", def: "Ukloni stvar sa mape u rezervu. Tim bez crva je eliminisan." },
    { term: "Eliminated", group: "Osnovno", def: "Igrač bez crva. Prva eliminacija pokreće poslednji krug igre." },
    { term: "Target Token", group: "Osnovno", def: "Označava metu i ko je na potezu; nije stvar." },
    { term: "Inch", group: "Kretanje", def: "Pomeri crva na susedni kopneni heks." },
    { term: "Jump", group: "Kretanje", def: "Prebaci crva na heks do 2 daleko (preskače), pa Scatter." },
    { term: "Scatter", group: "Kretanje", def: "Baci kockicu: broj = 1 heks u tom pravcu, vetar = niz vetar, meta = ne pomera se." },
    { term: "Knockback Scatter", group: "Kretanje", def: "Kao Scatter, ali meta na kockici znači da ti biraš pravac - stvar se uvek pomera." },
    { term: "Place", group: "Kretanje", def: "Uzmi komponentu iz rezerve i stavi je u heks (Move = pomeranje nečega što je već na mapi)." },
    { term: "Accuracy X", group: "Oružje", def: "Baci X kockica (umanjeno za daljinu, min. 1), izaberi jednu i pomeri metu po njoj." },
    { term: "Blast", group: "Oružje", def: "Krater u heks; svaka stvar (prvo crvi) prima štetu i možda biva odbačena." },
    { term: "Air Strike", group: "Oružje", def: "Meta pokriva 3 heksa u liniji, u pravcu strelice na Target Token-u." },
    { term: "Action Line", group: "Oružje", def: "Niz simbola na karti oružja: pomeranje, još jedna karta, razrešavanje teksta - s leva na desno." },
    { term: "Starter Weapon", group: "Oružje", def: "Početne karte (tamnija leđa): Uzi, Bazooka, Ninja Rope, Girder + jedna nasumična." },
    { term: "Superweapon", group: "Oružje", def: "Karta sa žutom trakom naslova; nema posebno pravilo osim kad se druga karta poziva na nju." },
    { term: "Direct hex", group: "Heksovi", def: "Heks u pravoj liniji u jednom od 6 pravaca od crva (i sopstveni heks)." },
    { term: "Hex within X", group: "Heksovi", def: "Heks X ili manje daleko od crva." },
    { term: "New hex", group: "Heksovi", def: "Heks bez Target Token-a." },
    { term: "Own hex", group: "Heksovi", def: "Heks u kome je tvoj crv." },
    { term: "Emptiest", group: "Heksovi", def: "Kopneni heks sa najmanje stvari; kod nerešenog biraš ti." },
    { term: "Full / Non-full hex", group: "Heksovi", def: "Pun = 3 stvari. Ne-pun = kopneni heks sa manje od 3." },
    { term: "Water hex", group: "Heksovi", def: "Voda (i sve van mape, i Wind Dial). Sve što uđe tone." },
    { term: "Crater", group: "Stvari", def: "Nepomičan i neuništiv. Tri u istom heksu → heks postaje voda." },
    { term: "Fire", group: "Stvari", def: "Nepomična. Ko uđe u nju baca Danger Flipper; Danger = šteta." },
    { term: "Mine", group: "Stvari", def: "Ulazak: Danger Flipper, Danger = Blast. Šteta: odmah Blast." },
    { term: "Oil Drum", group: "Stvari", def: "Kad primi štetu: 5 kockica, šteta i vatra u svakom dobijenom pravcu." },
    { term: "Supply Crate", group: "Stvari", def: "Crv koji uđe ili počne potez na njoj vuče kartu oružja." },
    { term: "Danger Flipper", group: "Stvari", def: "Žeton-novčić: Danger ili Safe." },
    { term: "Wind Dial", group: "Vetar", def: "Vodeni heks sa strelicom koja pokazuje pravac vetra (1–6)." },
    { term: "Change Wind", group: "Vetar", def: "Baci kockicu; broj postavlja novi pravac vetra, ostalo ga ne menja." },
    { term: "Drop Card", group: "Karte", def: "Vuče se na kraju svakog poteza; donosi kutije, mine, promene vetra…" },
    { term: "Sudden Death", group: "Karte", def: "Poslednja karta Drop Deck-a; ostaje u igri i menja pravila do kraja." }
  ],

  expansions: [],

  sources: [
    { label: "Mantic Games - stranica igre", url: "https://www.manticgames.com/worms-the-board-game/" },
    { label: "Zvanični pravilnik (Google Drive, preko Kelsam Tabletop)", url: "https://drive.google.com/file/d/1sQDc-zUx7A1zBYNCJLexDR2fraiCzbYo/view?usp=sharing" },
    { label: "Radna verzija pravilnika (Mantic, PDF)", url: "https://www.manticgames.com/wp-content/uploads/2023/09/Worms-WIP-Rulebook.pdf" }
  ]
});
})();
