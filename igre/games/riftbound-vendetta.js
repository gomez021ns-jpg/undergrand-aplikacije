(() => {
const F = window.FIG;

// ─────────────────────────────── ŠEME ───────────────────────────────

// Zed: kako radi motor Trash → Shadow Clone → Empower
const FIG_ZED_ENGINE = F.figure(
  480, 236,
  F.box(10, 10, 140, 74, "Puni Trash", { sub: ["discard, Burn,", "umrle jedinice"] }) +
    F.box(170, 10, 140, 74, "Clone napada", { cls: "f-acc", sub: ["banish jedinicu", "iz svog Trash-a"] }) +
    F.box(330, 10, 140, 74, "Assault 4", { sub: ["Clone udara jako", "ovog poteza"] }) +
    F.box(330, 150, 140, 74, "Zed Empowered", { cls: "f-acc", sub: ["jer si banish-ovao", "svoju kartu"] }) +
    F.box(170, 150, 140, 74, "Legend sposobnost", { sub: ["Disempower + exhaust:", "discard 1, vuci 1"] }) +
    F.arrow(150, 47, 168, 47) +
    F.arrow(310, 47, 328, 47) +
    F.arrow(400, 84, 400, 148) +
    F.arrow(330, 187, 312, 187) +
    F.arrow(168, 176, 92, 86, { dashed: true }) +
    F.text(78, 150, ["discard puni", "Trash ponovo"], { cls: "f-muted", lh: 15 }),
  { caption: "Zed-ov krug: karte u Trash-u postaju gorivo za Shadow Clone-ove, a svaki banish budi Zed-ovog Legend-a." }
);

// Shen: tačno dve jedinice na battlefield-u + Tank
const FIG_SHEN = F.figure(
  480, 176,
  F.rect(130, 14, 230, 140, { cls: "f-acc" }) +
    F.text(245, 36, "Battlefield", { cls: "f-title f-small" }) +
    F.rect(165, 56, 64, 84, { cls: "f-card" }) +
    F.text(197, 76, "Tank", { cls: "f-kw f-small" }) +
    F.text(197, 116, "4", { cls: "f-big" }) +
    F.rect(262, 56, 64, 84, { cls: "f-card" }) +
    F.text(294, 116, "2", { cls: "f-big" }) +
    F.text(118, 70, ["Legend (exhaust):", "jedinica dobija", "Tank ovog poteza"], { cls: "f-small", anchor: "end", lh: 16 }) +
    F.arrow(120, 100, 162, 100, { accent: true }) +
    F.text(372, 74, ["Tačno 2", "jedinice →"], { cls: "f-title f-small", anchor: "start", lh: 16 }) +
    F.text(372, 110, ["bonus poeni", "ili karte"], { cls: "f-muted", anchor: "start", lh: 15 }),
  { caption: "Shen drži battlefield sa tačno dve jedinice; Tank štiti onu slabiju." }
);

// Spisak karata u dve kolone
const deckTable = (rows) =>
  `<table class="decktable">${rows.map(([n, name]) => `<tr><td class="num">${n}</td><td>${name}</td></tr>`).join("")}</table>`;

// ─────────────────────────────── DODATAK ───────────────────────────────

registerExpansion("riftbound", {
  id: "vendetta-zed-shen",
  title: "Vendetta – Showdown Decks: Zed vs Shen",
  type: "Set 4 · Showdown Decks",
  released: "jul 2026",
  owned: true,
  summary:
    "Dva gotova špila za igru jedan protiv drugog, iz četvrtog seta (Vendetta). Zed je agresivan i igra se kroz Trash i Shadow Clone-ove; Shen je defanzivan, drži battlefield-e i štiti jedinice sa Tank. Oba špila su legalna za turnire odmah iz kutije.",

  quickRef: [
    {
      title: "Zed - Fury + Chaos",
      html: `
        <ul>
          <li><b>Legend:</b> Zed, Master of Shadows - kad <b class="kw">banish</b>-uješ svoju kartu, postaje <b class="kw">Empowered</b>. Action: disempower + exhaust → discard 1, vuci 1.</li>
          <li><b>Plan:</b> puni Trash, pa ga troši preko <b class="kw">Shadow Clone</b>-ova (napad → banish jedinicu iz Trash-a → <b class="kw">Assault 4</b>).</li>
          <li><b>Težina:</b> srednja - pazi da ne potrošiš Trash prebrzo.</li>
        </ul>`
    },
    {
      title: "Shen - Calm + Order",
      html: `
        <ul>
          <li><b>Legend:</b> Shen, Eye of Twilight - exhaust: tvoja jedinica dobija <b class="kw">Tank</b> ovog poteza.</li>
          <li><b>Plan:</b> osvoji battlefield i drži ga sa <b>tačno 2 jedinice</b> - šampioni za to daju poene ili karte.</li>
          <li><b>Težina:</b> laka - preporučeno za prvu partiju.</li>
        </ul>`
    },
    {
      title: "Nove ključne reči",
      html: `
        <table class="kwtable">
          <tr><td class="kw">Empower</td><td>plati cenu → karta postaje Empowered</td></tr>
          <tr><td class="kw">Empowered</td><td>dodatni tekst dok karta ima taj status</td></tr>
          <tr><td class="kw">Flow</td><td>spell iz Trash-a za Flow cenu, pa banish</td></tr>
          <tr><td class="kw">Burn X</td><td>X gornjih karata špila → Trash</td></tr>
          <tr><td class="kw">Skip</td><td>preskoči navedeni deo poteza</td></tr>
        </table>`
    }
  ],

  rules: [
    {
      id: "ven-kutija",
      title: "Šta je u kutiji i kako početi",
      html: `
        <ul>
          <li><b>2 gotova špila</b> od po 56 karata: 1 Legend + Main Deck od 40 karata (sa Chosen Champion-om) + 12 runa + 3 battlefield-a.</li>
          <li><b>Tokeni</b> (npr. Shadow Clone) - ne idu u špil, stoje sa strane dok ih neka karta ne kreira.</li>
          <li><b>2 Vendetta booster-a</b> - za kasnije doterivanje špilova.</li>
          <li><b>2 papirne podloge</b> (playmat) i <b>2 kutijice za špil</b>.</li>
          <li>Knjižica sa pravilima i vodičem za pravljenje špila.</li>
        </ul>
        <h4>Prva partija</h4>
        <ol>
          <li>Odvojte špilove: Zed ima rune <b class="kw">Fury</b> i <b class="kw">Chaos</b>, Shen <b class="kw">Calm</b> i <b class="kw">Order</b>.</li>
          <li>Tokene stavite sa strane, booster-e za sada ne otvarajte u špil - prvo odigrajte par partija sa gotovim špilovima.</li>
          <li>Pripremite igru po osnovnim pravilima (poglavlje „Priprema igre“): nasumično po 1 battlefield od svoja 3, 4 karte u ruku, mulligan.</li>
          <li>Ako je jedan igrač početnik, neka igra <b>Shen</b>-a - jednostavniji je. Zed traži više planiranja.</li>
        </ol>
        <div class="note">Oba špila imaju battlefield <i>Threshold of the Gray</i>, pa se može desiti da ga oba igrača izvuku. Zvanična pravila to ne rešavaju izričito - predlog (kućno pravilo): drugi igrač izvlači ponovo.</div>`
    },
    {
      id: "ven-zed",
      title: "Zed - agresija iz senke",
      html: `
        <p><b>Domeni:</b> <b class="kw">Fury</b> + <b class="kw">Chaos</b> · <b>Legend:</b> Zed, Master of Shadows · <b>Chosen Champion:</b> Zed, From the Shadows</p>
        <h4>Ključne karte</h4>
        <table>
          <tr><th>Karta</th><th>Šta radi</th></tr>
          <tr><td><b>Zed, Master of Shadows</b><br><span class="muted small">Legend</span></td><td>Kad banish-uješ kartu koju poseduješ, Zed postaje <b class="kw">Empowered</b>. <b class="kw">Action</b>: disempower-uj ga i exhaust-uj → odbaci 1 kartu, pa vuci 1 (filtriranje ruke, i to u tuđem potezu).</td></tr>
          <tr><td><b>Zed, From the Shadows</b><br><span class="muted small">Champion Unit</span></td><td>4 Might. Ima opcionu dodatnu cenu: odbaci 1 kartu. Ako je platiš, dobijaš i <b class="kw">Shadow Clone</b> token.</td></tr>
          <tr><td><b>Zed, Without a Sound</b><br><span class="muted small">Champion Unit</span></td><td>Pravi Shadow Clone-ove kad osvaja (Conquer) i može da zameni mesto sa svojim Clone-om.</td></tr>
          <tr><td><b>Death Mark</b><br><span class="muted small">Signature Spell</span></td><td><b class="kw">Burn</b> 3 (tri karte sa vrha špila u Trash) i dobijaš Shadow Clone. Ima <b class="kw">Flow</b> - može ponovo iz Trash-a.</td></tr>
          <tr><td><b>Shadow Clone</b><br><span class="muted small">Token Unit</span></td><td>0 Might. Kad napada, možeš banish-ovati jedinicu iz svog Trash-a - tada dobija <b class="kw">Assault 4</b> ovog poteza. Taj banish ujedno budi Zed-ovog Legend-a.</td></tr>
        </table>
        ${FIG_ZED_ENGINE}
        <h4>Kako se igra</h4>
        <ul>
          <li>Na početku igraj jeftine jedinice i karte koje odbacuju/pomeraju (npr. Traveling Merchant, Shadow Order Disciple) - one pune Trash.</li>
          <li>Shadow Clone je sam po sebi bezopasan (0 Might), ali uz banish iz Trash-a napada sa 4. Šalji ga na battlefield zajedno sa drugim jedinicama.</li>
          <li>Koristi Legend-ovu sposobnost da se oslobodiš karata koje ti ne trebaju - to je i gorivo za sledeći Clone.</li>
        </ul>
        <div class="note"><b>Zamka:</b> iste karte iz Trash-a trebaju i Clone-ovima i drugim efektima. Ne troši ih sve u jednom potezu. I pazi sa <b class="kw">Burn</b>: ako špil ostane prazan, <b class="kw">Burn Out</b> daje protivniku poen.</div>`
    },
    {
      id: "ven-shen",
      title: "Shen - štit i ravnoteža",
      html: `
        <p><b>Domeni:</b> <b class="kw">Calm</b> + <b class="kw">Order</b> · <b>Legend:</b> Shen, Eye of Twilight · <b>Chosen Champion:</b> Shen, Leader of the Kinkou Order</p>
        <h4>Ključne karte</h4>
        <table>
          <tr><th>Karta</th><th>Šta radi</th></tr>
          <tr><td><b>Shen, Eye of Twilight</b><br><span class="muted small">Legend</span></td><td>Exhaust: izabrana tvoja jedinica dobija <b class="kw">Tank</b> do kraja poteza - protivnik mora nju prvu da ubije u borbi. Shen ne koristi Empower.</td></tr>
          <tr><td><b>Shen šampioni</b><br><span class="muted small">Champion Units</span></td><td>Nagrađuju kad na battlefield-u imaš <b>tačno dve</b> jedinice - dodatnim poenima ili vučenjem karata.</td></tr>
          <tr><td><b>Shadow Dash</b><br><span class="muted small">Signature Spell</span></td><td>Ima <b class="kw">Flow</b> - posle prvog korišćenja može ponovo iz Trash-a.</td></tr>
        </table>
        ${FIG_SHEN}
        <h4>Kako se igra</h4>
        <ul>
          <li>Rano osvoji battlefield i drži ga - svaki <b class="kw">Hold</b> je poen, a Shen je jak u odbrani.</li>
          <li>Pre borbe daj <b class="kw">Tank</b> jedinici koja ima najviše Might-a ili koja najlakše preživljava, da bi zaštitio slabiju.</li>
          <li>Pazi na broj: treća jedinica na istom battlefield-u može da ugasi bonuse „tačno dve“. Višak šalji na drugi battlefield ili drži u bazi.</li>
          <li>Koristi <b class="kw">Hidden</b> karte na battlefield-u koji držiš - protivnik ne zna šta ga čeka.</li>
        </ul>
        <div class="note"><b>Zamka:</b> Shen pobeđuje strpljenjem. Ne napadaj ako ne moraš - pusti Zed-a da dođe kod tebe, gde tvoje jedinice imaju prednost.</div>`
    },
    {
      id: "ven-mehanike",
      title: "Nove mehanike iz Vendetta seta",
      html: `
        <table>
          <tr><th>Mehanika</th><th>Kako radi</th></tr>
          <tr><td><b class="kw">Empower</b></td><td>Aktivirana sposobnost na permanentima i Legend-ima: „[cena]: Empower-uj ovo“. Može samo ako karta već nije Empowered. Neke karte se empower-uju same, okidačem (npr. Zed).</td></tr>
          <tr><td><b class="kw">Empowered</b></td><td>Status. „Empowered → [tekst]“ znači: dok karta ima status, ima i taj tekst. Status traje dok se ne ukloni ili dok karta ne napusti igru. Ne kopira se.</td></tr>
          <tr><td><b class="kw">Disempower</b></td><td>Uklanja Empowered status (često kao cena neke sposobnosti). Karta koja nije Empowered ne može se disempower-ovati.</td></tr>
          <tr><td><b class="kw">Flow</b></td><td>Spell možeš odigrati <b>iz Trash-a</b> plaćajući Flow cenu umesto obične; posle toga se <b>banish</b>-uje. Brzina (Action/Reaction) ostaje ista.</td></tr>
          <tr><td><b class="kw">Burn X</b></td><td>Premesti X gornjih karata svog Main Deck-a u Trash. Ako nema dovoljno karata → <b class="kw">Burn Out</b> (protivnik dobija 1 poen), pa se nastavlja.</td></tr>
          <tr><td><b class="kw">Skip</b></td><td>Preskoči navedeni deo poteza (npr. fazu) - sve što bi se tada desilo, uključujući okidače, ne dešava se.</td></tr>
          <tr><td><b>Ne može biti izabran</b></td><td>Neke jedinice postaju nemete za protivničke spell-ove i sposobnosti. Ako je već bila izabrana, taj deo efekta se ne izvršava.</td></tr>
        </table>
        <h4>Promene osnovnih pravila (Vendetta, jul 2026)</h4>
        <ul>
          <li><b>Tokeni</b> više nisu „supertip“ već posebna kategorija: token nikad ne može postati karta, niti karta token.</li>
          <li>Plaćanje Energy/Power je <b>opciono</b> - ne moraš generisati resurse koje ne želiš.</li>
          <li>Power za višebojne <b>Signature</b> karte mora biti iz baš tih domena.</li>
          <li>Efekti koji menjaju štetu sada se uračunavaju već pri <b>raspodeli</b> borbene štete.</li>
          <li>U 2v2 igri tim deli poene.</li>
        </ul>
        <p class="muted small">Ove promene su deo zvaničnih pravila v2026-07-16, na kojima se zasniva i ova aplikacija.</p>`
    },
    {
      id: "ven-spiskovi",
      title: "Spiskovi karata",
      html: `
        <p>Da proveriš da li je sve u kutiji. Imena karata su na engleskom, kao na kartama.</p>
        <div class="decklists">
          <section>
            <h4>Zed (Fury + Chaos)</h4>
            <p class="small"><b>Legend:</b> Zed, Master of Shadows<br><b>Champion:</b> Zed, From the Shadows</p>
            ${deckTable([
              [3, "Blade Twirler"], [3, "Punching Poro"], [3, "Ruthless Strike"], [3, "Shadow Assassin"],
              [3, "Kinkou Lifeblade"], [3, "Shadow Order Disciple"], [3, "Shadowblade Lurker"],
              [2, "Traveling Merchant"], [2, "Perfect Execution"], [2, "Shadow Fiend"], [2, "Gust Monk"],
              [2, "Twilight Step"], [2, "Zed, Without a Sound"], [1, "Twilight Reveler"], [1, "Ravenbloom Prefect"],
              [1, "Wind and Ghosts"], [1, "Death Mark"], [1, "Morgana, Vindictive"], [1, "Mel, Defiant Soul"]
            ])}
            <p class="small"><b>Battlefields:</b> Zaun Warrens, Shadow Temple, Threshold of the Gray<br><b>Rune:</b> 6× Fury, 6× Chaos</p>
          </section>
          <section>
            <h4>Shen (Calm + Order)</h4>
            <p class="small"><b>Legend:</b> Shen, Eye of Twilight<br><b>Champion:</b> Shen, Leader of the Kinkou Order</p>
            ${deckTable([
              [3, "Mournful Witness"], [3, "Disciple of Shen"], [2, "Loyal Poro"], [2, "Field Musicians"],
              [2, "Serene Ascetic"], [2, "Pakaa Protector"], [2, "Keeper of Law"], [2, "Soulspinner"],
              [2, "Noxian Emissary"], [2, "Sacred Protector"], [2, "Shen, Scourge of Shadows"], [2, "Charm"],
              [2, "Discipline"], [2, "Hand Hammer"], [1, "Shen, Kinkou"], [1, "Kennen, Keeper of Balance"],
              [1, "Twilight Shroud"], [1, "Resonating Strike"], [1, "Steel Paws"], [1, "Dragon Form"],
              [1, "Ki Barrier"], [1, "Lacerate"], [1, "Shadow Dash"]
            ])}
            <p class="small"><b>Battlefields:</b> Grove of the God-Willow, Kinkou Temple, Threshold of the Gray<br><b>Rune:</b> 6× Calm, 6× Order</p>
          </section>
        </div>
        <p class="muted small">Spiskovi su preuzeti iz javno objavljenih lista (magicalmeta.ink); ako se nešto ne slaže sa tvojom kutijom, važi ono što je u kutiji.</p>`
    }
  ],

  glossary: [
    { term: "Burn X", group: "Vendetta", def: "Premesti X gornjih karata svog Main Deck-a u Trash. Ako karata nema dovoljno, sledi Burn Out (protivnik dobija 1 poen)." },
    { term: "Disempower", group: "Vendetta", def: "Ukloni Empowered status sa karte. Često je deo cene neke sposobnosti." },
    { term: "Empower", group: "Vendetta", def: "„[Cena]: Empower-uj ovo“ - aktivirana sposobnost permanenta ili Legend-a; može samo ako karta već nije Empowered." },
    { term: "Empowered", group: "Vendetta", def: "Status. „Empowered → [tekst]“: karta ima taj tekst dok je Empowered. Traje dok se ne ukloni ili karta ne napusti igru." },
    { term: "Flow", group: "Vendetta", def: "Spell možeš odigrati iz Trash-a plaćajući Flow cenu; posle toga se banish-uje." },
    { term: "Shadow Clone", group: "Vendetta", def: "Token jedinica (0 Might) iz Zed špila. Kad napada, možeš banish-ovati jedinicu iz svog Trash-a da dobije Assault 4 ovog poteza." },
    { term: "Skip", group: "Vendetta", def: "Preskoči navedeni deo poteza - ništa od onoga što bi se tada desilo (ni okidači) se ne dešava." }
  ],

  sources: [
    { label: "Vendetta patch notes (playriftbound.com)", url: "https://playriftbound.com/en-us/news/announcements/core-rules-vendetta-patch-notes" },
    { label: "Riot Store - Zed vs Shen Showdown Deck", url: "https://merch.riotgames.com/en-us/product/riftbound-vendetta-zed-shen-showdown/" },
    { label: "MMORPG.com - pregled Showdown špilova", url: "https://www.mmorpg.com/previews/hands-on-preview-riftbound-vendettas-showdown-decks-with-game-director-dave-guskin-2000138521" },
    { label: "Zed spisak (magicalmeta.ink)", url: "https://magicalmeta.ink/riftbound/decklists/zed-master-of-shadows-sealed-vendetta" },
    { label: "Shen spisak (magicalmeta.ink)", url: "https://magicalmeta.ink/riftbound/decklists/shen-eye-of-twilight-sealed-vendetta" }
  ]
});
})();
