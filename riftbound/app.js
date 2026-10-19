// Riftbound kolekcija: baza karata (riftcodex.com), kolekcija korisnika i predlog špila.
// PRECONS dolazi iz data/precons.js. Kartice: coll (Moja kolekcija), kolekcionar (vrednost i setovi), add (Dodaj karte), deck (Predlog špila), backup (Rezervna kopija).
(() => {
  const DOMAINS = ["Fury", "Calm", "Mind", "Body", "Chaos", "Order"];
  const DCOL = { Fury: "var(--fury)", Calm: "var(--calm)", Mind: "var(--mind)", Body: "var(--body)", Chaos: "var(--chaos)", Order: "var(--order)" };
  const API = "https://api.riftcodex.com";
  const K_COLL = "rb-kolekcija", K_COLL_T = "rb-kolekcija-vreme", K_THEME = "rb-theme", K_TAB = "rb-tab-v2";
  const DB_TTL = 7 * 864e5; // baza karata se osvežava jednom nedeljno
  const DB_VER = 2;         // oblik karte u kešu (2: tekst sa simbolima, TCGplayer broj); promena → baza se ponovo preuzima

  /* ============ pomoćne ============ */
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const norm = (s) => String(s || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const compactNorm = (s) => norm(s).replace(/\s+/g, "");
  const SEARCH_ALIASES = { "marau spire": "marai spire", "ornn forge": "ornns forge" };
  // "ogs-013-024" → "ogs-013"; alt art "ven-042a-166" → "ven-042"
  const baseCode = (rid) => { const p = String(rid || "").toLowerCase().split("-"); return p.length >= 2 ? p[0] + "-" + p[1].replace(/[a-z]+$/, "") : p[0]; };
  // ime bez „(Starter)“, „(Alternate Art)“…; „Vi - Destructive“ i „Vi, Destructive“ daju isto
  const nameKey = (n) => norm(String(n || "").replace(/\s*\([^)]*\)\s*/g, " "));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  };
  // Keš baze karata ide u IndexedDB (localStorage je mali i deli se sa ostalim aplikacijama preko file://).
  const idb = {
    open() { return new Promise((res, rej) => { const r = indexedDB.open("riftbound", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
    async get(k) { try { const db = await this.open(); return await new Promise((res) => { const q = db.transaction("kv").objectStore("kv").get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); } catch { return null; } },
    async set(k, v) { try { const db = await this.open(); await new Promise((res) => { const t = db.transaction("kv", "readwrite"); t.objectStore("kv").put(v, k); t.oncomplete = res; t.onerror = res; }); } catch { /* bez keša */ } },
  };

  let ALL = [];           // sve karte iz baze, sa svim izdanjima (kompletiranje setova i cene)
  let DB = [];            // jedna karta po imenu
  let BY = new Map();     // kod (i alt kodovi) → karta
  let BYNAME = new Map(); // nameKey → karta
  let COLL = {};          // kod → broj primeraka
  let UNRESOLVED = [];
  const state = { tab: store.get(K_TAB) || "coll", legend: null, q: "", dom: new Set(), type: "", set: "", mine: true, limit: 120, addQ: "", addSet: "", addLimit: 30,
    cset: "", csort: "num", crar: "", climit: 60 };

  /* ============ tema (kao u ostalim aplikacijama) ============ */
  const themeBtn = $("#theme-btn");
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const applyTheme = (t) => { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; };
  const isDark = () => (document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  function themeIcon() { const l = isDark() ? "Svetla tema" : "Tamna tema"; themeBtn.innerHTML = isDark() ? SUN : MOON; themeBtn.title = l; themeBtn.setAttribute("aria-label", l); }
  applyTheme(store.get(K_THEME)); themeIcon();
  themeBtn.addEventListener("click", () => { const t = isDark() ? "light" : "dark"; applyTheme(t); store.set(K_THEME, t); themeIcon(); });

  /* ============ baza karata ============ */
  async function loadDB(force) {
    const cached = await idb.get("cards");
    if (cached && !force && cached.v === DB_VER && Date.now() - cached.t < DB_TTL) return cached.cards;
    const out = []; let page = 1, pages = 1;
    do {
      const r = await fetch(`${API}/cards?size=100&page=${page}&sort=collector_number`);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json(); pages = j.pages || 1;
      for (const c of j.items || []) out.push(slim(c));
      const bar = $("#progbar"), txt = $("#progtxt");
      if (bar) bar.style.width = (page / pages * 100) + "%";
      if (txt) txt.textContent = `${page} / ${pages}`;
      page++;
    } while (page <= pages);
    await idb.set("cards", { t: Date.now(), v: DB_VER, cards: out });
    return out;
  }
  function slim(c) {
    const cl = c.classification || {}, a = c.attributes || {}, m = c.metadata || {};
    return {
      rid: c.riftbound_id, code: baseCode(c.riftbound_id), pc: c.public_code, name: c.name,
      type: cl.type || "", sup: cl.supertype || "", rar: cl.rarity || "", dom: (cl.domain || []).filter((d) => DOMAINS.includes(d)),
      e: a.energy, m: a.might, p: a.power, txt: (c.text && c.text.plain) || "", set: (c.set && c.set.set_id) || "", setl: (c.set && c.set.label) || "",
      rich: (c.text && c.text.rich) || "", fl: (c.text && c.text.flavour) || "", tp: c.tcgplayer_id || "",
      img: (c.media && c.media.image_url) || "", tags: c.tags || [], or: c.orientation || "portrait",
      alt: !!(m.alternate_art || m.overnumbered || m.signature),
    };
  }
  function indexDB(cards) {
    ALL = cards; UNIT = null;
    const best = new Map(); // po kodu, prednost ne-alt verziji
    for (const c of cards) { if (!c.code) continue; const prev = best.get(c.code); if (!prev || (prev.alt && !c.alt)) best.set(c.code, c); }
    const byN = new Map();  // jedna karta po imenu + tipu (overnumbered / starter / alt se spajaju)
    for (const c of best.values()) {
      // Token karte ostaju u bazi da bi mogle da se unesu u kolekciju.
      // Generator ih zasebno isključuje iz glavnog špila.
      const k = nameKey(c.name) + "|" + c.type, prev = byN.get(k);
      if (!prev || (prev.alt && !c.alt)) byN.set(k, c);
    }
    DB = [...byN.values()];
    BY = new Map();
    for (const c of best.values()) { const k = byN.get(nameKey(c.name) + "|" + c.type); if (k) BY.set(c.code, k); }
    BYNAME = new Map(); for (const c of DB) { const k = nameKey(c.name); if (!BYNAME.has(k)) BYNAME.set(k, c); }
    // kolekcija sa kodovima alt verzija → glavna verzija
    for (const [k, v] of Object.entries(COLL)) { const c = BY.get(k); if (c && c.code !== k) { COLL[c.code] = (COLL[c.code] || 0) + v; delete COLL[k]; } }
  }
  function resolve(code, name) {
    if (code) { const c = BY.get(code.toLowerCase()); if (c) return c; }
    return name ? BYNAME.get(nameKey(name)) || null : null;
  }
  function seedCollection() {
    const coll = {}; UNRESOLVED = [];
    for (const d of PRECONS) for (const [q, code, name] of d.cards) {
      const c = resolve(code, name);
      if (!c) { UNRESOLVED.push(name); continue; }
      coll[c.code] = (coll[c.code] || 0) + q;
    }
    return coll;
  }
  function checkSeeds() { UNRESOLVED = []; for (const d of PRECONS) for (const [, code, name] of d.cards) if (!resolve(code, name)) UNRESOLVED.push(name); }
  function saveColl() {
    store.set(K_COLL, COLL); store.set(K_COLL_T, Date.now());
    renderStats();
    const total = $(".collection-counts div:first-child strong");
    const unique = $(".collection-counts div:last-child strong");
    if (total) total.textContent = Object.values(COLL).reduce((a, n) => a + (Number(n) || 0), 0);
    if (unique) unique.textContent = Object.values(COLL).filter((n) => Number(n) > 0).length;
    serverSave();
  }

  // Čuvanje u save/riftbound-kolekcija.json preko malog servera (server.py, Pokreni.bat).
  // Pregledač stranici otvorenoj iz fajla (file://) ne pamti dozvolu za folder, pa je
  // ranije pri svakom otvaranju tražio dozvolu; server upisuje sam, bez pitanja.
  // Bez servera (dupli klik na index.html) kolekcija ostaje samo u pregledaču.
  let SERVER = false;     // aplikacija je otvorena preko servera
  // Web verzija (GitHub Pages, od 1.5.0): objavi_web.py u objavljeni index.html ubaci window.RB_WEB = true.
  // Tada nema servera: kolekcija je posetiočeva (u njegovom pregledaču, kreće prazna), cene su iz data/cene.json.
  const WEB = !!window.RB_WEB;
  let saveFile = "";      // pun put do save/riftbound-kolekcija.json (javlja server)
  let saveStateMessage = "";
  let saveWarn = false;   // čuvanje u folder ne radi → upozorenje u gornjoj traci
  let saving = null, saveAgain = false, saveTimer = 0;
  function setSaveMsg(text, warn) {
    saveStateMessage = text; saveWarn = warn;
    const msg = $("#save-status"); if (msg) msg.textContent = text;
    renderStats();
  }
  async function serverLoad() {
    if (WEB) {
      setSaveMsg("Kolekcija se čuva u ovom pregledaču, na ovom računaru. Povremeno napravi rezervnu kopiju (dugme ispod) - ako obrišeš podatke pregledača, kolekcija nestaje.", false);
      return null;
    }
    if (!location.protocol.startsWith("http")) {
      setSaveMsg("Aplikacija je otvorena kao fajl, pa se kolekcija čuva samo u ovom pregledaču. Otvori je prečicom na desktopu (Pokreni.bat) da bi se čuvala u folder save.", true);
      return null;
    }
    try {
      const r = await fetch("/api/kolekcija", { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      SERVER = true; saveFile = j.fajl || "";
      setSaveMsg(j.kolekcija ? "Kolekcija je učitana iz foldera save i čuva se automatski pri svakoj izmeni." : "Kolekcija će se automatski čuvati u folder save pri svakoj izmeni.", false);
      return j;
    } catch {
      setSaveMsg("Server aplikacije ne odgovara, pa se kolekcija čuva samo u ovom pregledaču. Pokreni aplikaciju prečicom na desktopu.", true);
      return null;
    }
  }
  // Upisi idu jedan za drugim (uz kratko čekanje, da brzi klikovi na +/- budu jedan upis);
  // izmene tokom upisa spajaju se u još jedan upis sa najnovijim stanjem.
  function serverSave() {
    if (!SERVER) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (saving) { saveAgain = true; return; }
      saving = (async () => { do { saveAgain = false; await putCollection(); } while (saveAgain); })().finally(() => { saving = null; });
    }, 300);
  }
  async function putCollection() {
    try {
      const r = await fetch("/api/kolekcija", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(COLL) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "HTTP " + r.status);
      setSaveMsg(`Automatski sačuvano u folder save u ${j.vreme}.`, false);
    } catch (err) {
      setSaveMsg(`Čuvanje u folder save nije uspelo (${err.message === "Failed to fetch" ? "server ne radi" : err.message}). Izmene su za sada sačuvane samo u pregledaču; pokreni aplikaciju ponovo prečicom.`, true);
    }
  }

  /* ============ pravila i predlog špila ============ */
  const isLegend = (c) => c.type === "Legend", isRune = (c) => c.type === "Rune", isBF = (c) => c.type === "Battlefield", isToken = (c) => c.sup === "Token" || c.type === "Token";
  const isMain = (c) => !isLegend(c) && !isRune(c) && !isBF(c) && !isToken(c);
  // šampion Legenda: iz naziva („Vi - Piltover Enforcer“), a kad ga naziv ne sadrži
  // („Master of Shadows“ je Zed), iz prvog taga
  const champOf = (leg) => {
    const fromName = leg.name.split(/\s+-\s+|,\s+/)[0].trim();
    return leg.tags.some((t) => norm(t) === norm(fromName)) ? fromName : leg.tags[0] || fromName;
  };
  const kartaWord = (n) => (n % 10 === 1 && n % 100 !== 11 ? "karta" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "karte" : "karata");
  const RAR = { Common: 1, Uncommon: 1.35, Rare: 1.75, Epic: 2.2, Showcase: 2.2, Promo: 1.5 };
  const CURVE = [{ k: "0–2", f: (e) => e <= 2, t: 13 }, { k: "3", f: (e) => e === 3, t: 9 }, { k: "4", f: (e) => e === 4, t: 8 }, { k: "5", f: (e) => e === 5, t: 5 }, { k: "6+", f: (e) => e >= 6, t: 4 }];
  const bucketOf = (e) => CURVE.findIndex((b) => b.f(e ?? 0));

  function legalFor(leg, c) {
    if (!isMain(c)) return false;
    if (c.dom.length && !c.dom.every((d) => leg.dom.includes(d))) return false;
    if (c.sup === "Signature" && !c.tags.some((t) => norm(t) === norm(champOf(leg)))) return false;
    return true;
  }
  function cardScore(leg, c) {
    const ch = norm(champOf(leg)), t = c.tags.map(norm);
    let s = RAR[c.rar] || 1;
    if (t.includes(ch)) s += 2.5;
    const lt = leg.tags.map(norm).filter((x) => x !== ch);
    if (t.some((x) => lt.includes(x))) s += 1;
    if (c.sup === "Champion") s += 0.5;
    if (c.sup === "Signature") s += 1;
    return s;
  }
  function buildDeck(leg) {
    const pool = (code) => COLL[code] || 0;
    const ch = norm(champOf(leg));
    const champs = DB.filter((c) => c.sup === "Champion" && c.type === "Unit" && norm(c.name).startsWith(ch + " ") && legalFor(leg, c));
    const chosen = champs.filter((c) => pool(c.code) > 0).sort((a, b) => (RAR[b.rar] || 1) - (RAR[a.rar] || 1))[0] || null;
    const used = new Map(), bucket = CURVE.map(() => 0), notes = [];
    let units = 0, spells = 0;
    if (chosen) { used.set(chosen.code, 1); bucket[bucketOf(chosen.e)]++; units++; }
    else if (champs.length) {
      notes.push({ w: true, t: `Nemaš odgovarajućeg Chosen Championa za ${leg.name} u kolekciji. Dodaj ${[...new Set(champs.map((c) => `„${c.name}“`))].join(" ili ")} da bi špil bio legalan.` });
    } else {
      notes.push({ w: true, t: `U bazi nema Champion jedinice za ${champOf(leg)} iz domena ${leg.dom.join(" + ")}, pa ovaj Legend nema Chosen Championa.` });
    }
    const cands = DB.filter((c) => legalFor(leg, c) && pool(c.code) > 0).map((c) => ({ c, s: cardScore(leg, c), max: Math.min(3, pool(c.code)) }));
    // pohlepno, jedna po jedna karta: ocena minus kazna za prepunjenu krivu i disbalans jedinica/spelova
    for (let picked = 0; picked < 39; picked++) {
      let best = null, bs = -1e9;
      for (const o of cands) {
        const u = used.get(o.c.code) || 0; if (u >= o.max) continue;
        const bi = bucketOf(o.c.e); let s = o.s;
        if (bucket[bi] >= CURVE[bi].t) s -= 1.1 * (bucket[bi] - CURVE[bi].t + 1);
        const isU = o.c.type === "Unit";
        if (isU && units >= 24) s -= 1.5;
        if (!isU && spells >= 19) s -= 1.5;
        s -= u * 0.15; // blaga prednost raznovrsnosti
        if (s > bs) { bs = s; best = o; }
      }
      if (!best) break;
      used.set(best.c.code, (used.get(best.c.code) || 0) + 1);
      bucket[bucketOf(best.c.e)]++; best.c.type === "Unit" ? units++ : spells++;
    }
    const main = [...used].map(([code, q]) => ({ c: BY.get(code), q: chosen && code === chosen.code ? q - 1 : q })).filter((x) => x.q > 0);
    const total = main.reduce((a, x) => a + x.q, 0) + (chosen ? 1 : 0);
    // Manjak karata javlja se odvojeno od nedostajućeg Chosen Championa: bez njega je 39/40
    // očekivano, jer njegov slot ne sme da se popuni proizvoljnom kartom.
    // Pohlepno biranje uzima svaki slobodan primerak, pa manje od 39 znači da legalnih karata nema dovoljno.
    const others = main.reduce((sum, x) => sum + x.q, 0);
    if (others < 39) {
      const n = 39 - others;
      notes.push({ w: true, t: `Fali još ${n} ${kartaWord(n)} iz domena ${leg.dom.join(" + ")}${chosen ? "" : " (pored Chosen Championa)"} - u kolekciji nema dovoljno legalnih karata.` });
    }

    // rune: proporcionalno kartama po domenu, 4–8 po domenu
    const dc = {}; leg.dom.forEach((d) => (dc[d] = 0));
    for (const x of main) for (const d of x.c.dom) if (d in dc) dc[d] += x.q;
    const sum = Object.values(dc).reduce((a, b) => a + b, 0) || 1;
    const owned = (d) => DB.filter((c) => isRune(c) && c.dom.includes(d)).reduce((a, c) => a + pool(c.code), 0);
    const runes = leg.dom.map((d) => ({ d, n: Math.round(12 * dc[d] / sum), own: owned(d) }));
    if (runes.length === 2) { runes[0].n = Math.max(4, Math.min(8, runes[0].n)); runes[1].n = 12 - runes[0].n; }
    else if (runes.length === 1) runes[0].n = 12;
    for (const r of runes) if (r.n > r.own) notes.push({ w: true, t: `Treba ${r.n} ${r.d} runa, imaš ${r.own}.` });

    // bojna polja: prvo iz istog precon-a, pa ostala koja imaš
    const pre = PRECONS.find((p) => { const c = resolve(p.legend, p.legendName); return c && c.code === leg.code; });
    const preBF = [];
    if (pre) { (pre.bf || []).forEach((k) => { const c = resolve(k); if (c) preBF.push(c); }); (pre.bfNames || []).forEach((n) => { const c = resolve(null, n); if (c) preBF.push(c); }); }
    const ownBF = DB.filter((c) => isBF(c) && pool(c.code) > 0);
    const bfs = [...new Map([...preBF.filter((c) => pool(c.code) > 0), ...ownBF].map((c) => [c.code, c])).values()].slice(0, 3);
    if (bfs.length < 3) notes.push({ w: true, t: `Imaš samo ${bfs.length} bojnih polja (treba 3).` });

    const missing = DB.filter((c) => legalFor(leg, c) && !pool(c.code)).map((c) => ({ c, s: cardScore(leg, c) }))
      .sort((a, b) => b.s - a.s || a.c.name.localeCompare(b.c.name)).slice(0, 12).map((x) => x.c);
    const quality = main.reduce((a, x) => a + x.q * cardScore(leg, x.c), 0) / Math.max(1, total - (chosen ? 1 : 0));
    return { leg, chosen, champs, main, total, bucket, units, spells, runes, bfs, notes, missing, quality };
  }
  function rankLegends() {
    return DB.filter((c) => isLegend(c) && COLL[c.code] > 0)
      .map((l) => { const d = buildDeck(l); return { l, d, score: (d.total >= 40 ? 100 : d.total * 2) + d.quality * 10 + (d.chosen ? 20 : 0) }; })
      .sort((a, b) => b.score - a.score);
  }

  /* ============ prikaz ============ */
  const domDots = (ds) => ds.map((d) => `<i class="dot" style="background:${DCOL[d]}" title="${d}"></i>`).join("");
  function renderStats() {
    const vals = Object.values(COLL);
    const legs = DB.filter((c) => isLegend(c) && COLL[c.code] > 0).length;
    $("#stats").innerHTML = `<span><b>${vals.filter((q) => q > 0).length}</b> različitih</span><span><b>${vals.reduce((a, b) => a + b, 0)}</b> ukupno</span><span><b>${legs}</b> legendi</span>${saveWarn ? `<button type="button" class="save-warn" data-tab="backup" title="${esc(saveStateMessage)}">Čuvanje u folder ne radi</button>` : ""}`;
  }
  function tileHTML(c, { qty, ctl, cls = "", tag } = {}) {
    const own = COLL[c.code] || 0;
    const land = c.or === "landscape" || isBF(c);
    return `<div class="tile ${land ? "land" : ""} ${cls}" data-code="${c.code}">
      <div class="img" data-open="${c.code}" title="${esc(c.name)}">${c.img ? `<img loading="lazy" src="${esc(c.img)}" alt="${esc(c.name)}" onerror="this.remove()">` : ""}<div class="ph">${esc(c.name)}</div>
        ${qty ? `<span class="qty">${qty}×</span>` : ""}${ctl && own ? `<span class="badge">${own}</span>` : ""}${tag ? `<span class="tag">${tag}</span>` : ""}</div>
      ${ctl ? `<div class="ctl"><button class="btn" data-d="-1" aria-label="Manje">−</button><span class="n">${own}</span><button class="btn" data-d="1" aria-label="Više">+</button><span class="nm" title="${esc(c.name)}">${esc(c.name)}</span></div>`
            : `<div class="nm" title="${esc(c.name)}">${esc(c.name)}</div>`}
    </div>`;
  }

  function renderDeck() {
    const ranked = rankLegends();
    if (!ranked.length) { $("#app").innerHTML = `<div class="status">Nemaš nijednog Legenda u kolekciji. Dodaj ga u kartici „Dodaj karte u kolekciju“.</div>`; return; }
    if (!state.legend || !ranked.find((r) => r.l.code === state.legend)) state.legend = ranked[0].l.code;
    const d = ranked.find((r) => r.l.code === state.legend).d;
    const maxB = Math.max(...d.bucket, 1);
    const groups = CURVE.map((b, i) => ({ b, items: d.main.filter((x) => bucketOf(x.c.e) === i).sort((a, z) => (a.c.e ?? 0) - (z.c.e ?? 0) || a.c.name.localeCompare(z.c.name)) })).filter((g) => g.items.length);
    $("#app").innerHTML = `<div class="deckwrap">
      <div class="legends"><h2>Tvoje legende</h2><p class="hint">Poređane po tome koliko dobar špil možeš da složiš od karata koje imaš.</p>
        ${ranked.map((r, i) => `<button class="leg ${r.d.total < 40 ? "dis" : ""} ${r.l.code === state.legend ? "active" : ""}" data-leg="${r.l.code}">
          <img src="${esc(r.l.img)}" alt="" loading="lazy">
          <div><div class="t">${esc(r.l.name)}</div><div class="d">${domDots(r.l.dom)} ${r.l.dom.join(" · ")}</div></div>
          <div class="sc">${i === 0 ? "★ " : ""}${r.d.total}/40</div></button>`).join("")}
      </div>
      <div class="panel">
        <div class="top">
          <div class="heroes">
            <div class="lane"><span class="label">Legend</span>${tileHTML(d.leg)}</div>
            ${d.chosen ? `<div class="lane"><span class="label">Chosen Champion</span>${tileHTML(d.chosen)}</div>` : ""}
          </div>
          <div class="summary">
            <h2>${esc(d.leg.name)}</h2>
            <div class="kv">
              <div><span class="label">Glavni špil</span><b>${d.total}/40</b></div>
              <div><span class="label">Jedinice</span><b>${d.units}</b></div>
              <div><span class="label">Spelovi i oprema</span><b>${d.spells}</b></div>
              <div><span class="label">Domeni</span><span class="doms">${domDots(d.leg.dom)} ${d.leg.dom.join(" + ")}</span></div>
            </div>
            <div><span class="label">Kriva energije</span>
              <div class="curve">${d.bucket.map((n, i) => `<div class="col"><span class="v">${n}</span><div class="b" style="height:${n / maxB * 62}px"></div><span class="l">${CURVE[i].k}</span></div>`).join("")}</div></div>
            <ul class="notes">${d.notes.map((n) => `<li class="${n.w ? "warn" : ""}">${esc(n.t)}</li>`).join("") || "<li>Špil je kompletan: 40 karata, 12 runa i 3 bojna polja.</li>"}</ul>
          </div>
        </div>
        ${!d.chosen && d.champs.length ? `<section class="missing-panel"><h3>Nedostaje Chosen Champion</h3><p class="hint">Izaberi kartu da je pronađeš u bazi i dodaš u kolekciju. Karta se ne dodaje automatski.</p><div class="fan">${d.champs.map((c) => `<div class="suggest-card">${tileHTML(c, { tag: "nedostaje" })}<button class="btn" type="button" data-find-card="${esc(c.name)}">Pronađi za dodavanje</button></div>`).join("")}</div></section>` : ""}
        ${groups.map((g) => `<div class="lane"><span class="label">Energija ${g.b.k} · ${g.items.reduce((a, x) => a + x.q, 0)} karata</span><div class="fan">${g.items.map((x) => tileHTML(x.c, { qty: x.q })).join("")}</div></div>`).join("")}
        <div class="lane"><span class="label">Rune (12)</span><div class="runes">${d.runes.map((r) => `<div class="rune"><i class="dot" style="background:${DCOL[r.d]}"></i>${r.d}<b>${r.n}</b><span class="hint">imaš ${r.own}</span></div>`).join("")}</div></div>
        <div class="lane"><span class="label">Bojna polja</span><div class="bfs">${d.bfs.map((c) => tileHTML(c)).join("")}</div></div>
        <section class="missing-panel"><h3>Karte koje bi ojačale ovaj špil, a nemaš ih</h3><p class="hint">Najbolje ocenjene karte iz domena ovog Legenda koje trenutno nemaš. Izborom karte otvara se unos u kolekciju; karta se ne dodaje automatski.</p><div class="fan">${d.missing.map((c) => `<div class="suggest-card">${tileHTML(c, { tag: "nedostaje" })}<button class="btn" type="button" data-find-card="${esc(c.name)}">Pronađi za dodavanje</button></div>`).join("") || '<span class="hint">Ništa značajno ne fali.</span>'}</div></section>
      </div></div>`;
  }

  function filtered() {
    const q = norm(state.q);
    return DB.filter((c) => {
      if (state.mine && !(COLL[c.code] > 0)) return false;
      if (state.type && c.type !== state.type) return false;
      if (state.set && c.set !== state.set) return false;
      if (state.dom.size && !c.dom.some((d) => state.dom.has(d))) return false;
      if (q && !norm(c.name + " " + c.tags.join(" ") + " " + c.pc + " " + c.code).includes(q)) return false;
      return true;
    }).sort((a, b) => a.set.localeCompare(b.set) || a.code.localeCompare(b.code));
  }
  function renderColl() {
    const types = [...new Set(DB.map((c) => c.type).filter(Boolean))].sort();
    const sets = [...new Map(DB.map((c) => [c.set, c.setl])).entries()].filter((x) => x[0]).sort();
    const totalCards = Object.values(COLL).reduce((a, n) => a + (Number(n) || 0), 0);
    const uniqueCards = Object.values(COLL).filter((n) => Number(n) > 0).length;
    $("#app").innerHTML = `<div class="collection-page">
      <section class="panel collection-summary">
        <div><h2>Moja kolekcija</h2><p class="hint">Pregled karata koje poseduješ. Ovde menjaš broj primeraka; nove karte dodaješ u posebnoj kartici.</p></div>
        <div class="collection-counts"><div><strong>${totalCards}</strong><span>ukupno karata</span></div><div><strong>${uniqueCards}</strong><span>različitih karata</span></div></div>
      </section>
      <div class="coll">
        <div class="rail">
          <div><label class="label" for="q">Pretraga</label><input id="q" type="search" placeholder="ime, tag ili kod (OGN-042)" value="${esc(state.q)}"></div>
          <label class="toggle"><input id="mine" type="checkbox" ${state.mine ? "checked" : ""}> Samo moje karte</label>
          <div><span class="label">Domen</span><div class="chips">${DOMAINS.map((d) => `<button class="chip" data-dom="${d}" aria-pressed="${state.dom.has(d)}"><i class="dot" style="background:${DCOL[d]}"></i>${d}</button>`).join("")}</div></div>
          <div><label class="label" for="type">Tip</label><select id="type"><option value="">Svi tipovi</option>${types.map((t) => `<option ${t === state.type ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></div>
          <div><label class="label" for="set">Set</label><select id="set"><option value="">Svi setovi</option>${sets.map(([k, l]) => `<option value="${esc(k)}" ${k === state.set ? "selected" : ""}>${esc(l || k)} (${esc(k)})</option>`).join("")}</select></div>
        </div>
        <div class="coll-main"><div class="collection-list-head"><h2>Karte u tvojoj kolekciji</h2><span class="hint">Broj primeraka menjaš pomoću − / +</span></div><div id="grid" class="grid"></div><div class="more" id="more"></div></div>
      </div></div>`;
    renderGrid();
  }
  function renderAddPage() {
    const sets = [...new Map(DB.map((c) => [c.set, c.setl])).entries()].filter((x) => x[0]).sort();
    $("#app").innerHTML = `<div class="add-page">
      <section class="panel">
        <div><h2>Dodaj karte u kolekciju</h2><p class="hint">Pretraži bazu, unesi koliko primeraka si izvukao iz boostera i dodaj ih. Količina se sabira sa onim što već imaš.</p></div>
        <div class="booster-tools">
          <label><span class="label">Pretraga karata</span><input id="add-q" type="search" placeholder="Naziv karte, tag ili kod (OGN-042)" value="${esc(state.addQ)}"></label>
          <label><span class="label">Izdanje</span><select id="add-set"><option value="">Sva izdanja</option>${sets.map(([k, l]) => `<option value="${esc(k)}" ${k === state.addSet ? "selected" : ""}>${esc(l || k)} (${esc(k)})</option>`).join("")}</select></label>
        </div>
        <div id="add-results" class="add-results"></div>
      </section>
    </div>`;
    renderAddResults();
  }
  function renderAddResults() {
    const host = $("#add-results"); if (!host) return;
    const rawQ = norm(state.addQ);
    const q = SEARCH_ALIASES[rawQ] || rawQ;
    const qCompact = compactNorm(q);
    const list = DB.filter((c) => {
      if (state.addSet && c.set !== state.addSet) return false;
      if (!q) return true;
      const hay = norm(c.name + " " + c.tags.join(" ") + " " + (c.pc || "") + " " + c.code + " " + c.set);
      const compactHay = compactNorm(c.name + " " + c.tags.join(" ") + " " + (c.pc || "") + " " + c.code + " " + c.set);
      // Tolerantna pretraga: apostrofi i kose crte ne smetaju (Ornns Forge, Mech Buff).
      if (hay.includes(q) || compactHay.includes(qCompact)) return true;
      // Jedno slovo greške u kratkom nazivu (npr. Marau umesto Marai) i dalje pronađe kartu.
      const target = compactNorm(c.name);
      if (qCompact.length >= 5 && Math.abs(target.length - qCompact.length) <= 1) {
        let i = 0, j = 0, edits = 0;
        while (i < target.length && j < qCompact.length) {
          if (target[i] === qCompact[j]) { i++; j++; continue; }
          edits++; if (edits > 1) break;
          if (target.length > qCompact.length) i++; else if (qCompact.length > target.length) j++; else { i++; j++; }
        }
        edits += (target.length - i) + (qCompact.length - j);
        if (edits <= 1) return true;
      }
      return false;
    }).sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
    const shown = list.slice(0, state.addLimit);
    host.innerHTML = shown.length ? `<div class="add-list">${shown.map((c) => `<div class="add-row" data-add-row="${esc(c.code)}">
      <div class="add-card-img">${c.img ? `<img loading="lazy" src="${esc(c.img)}" alt="">` : ""}</div>
      <div class="add-card-name"><b>${esc(c.name)}</b><span>${esc(c.setl || c.set || "Nepoznato izdanje")} · ${esc((c.pc || c.code).toUpperCase())}</span><small>Trenutno imaš: <strong>${COLL[c.code] || 0}</strong></small></div>
      <label class="add-qty"><span class="label">Dodaj</span><input type="number" min="1" max="99" value="1" data-add-qty="${esc(c.code)}" aria-label="Broj primeraka za ${esc(c.name)}"></label>
      <button class="btn primary" type="button" data-add-card="${esc(c.code)}">Dodaj</button>
    </div>`).join("")}</div>${list.length > state.addLimit ? `<button class="btn" id="add-more">Prikaži još (${list.length - state.addLimit})</button>` : `<span class="hint">Prikazano ${shown.length} od ${list.length} karata.</span>`}` : `<p class="hint">Nema karata koje odgovaraju pretrazi.</p>`;
  }
  function renderGrid() {
    const list = filtered();
    $("#grid").innerHTML = list.slice(0, state.limit).map((c) => tileHTML(c, { ctl: true, cls: COLL[c.code] > 0 ? "" : "unowned" })).join("") || `<p class="hint">Nema karata za ovaj filter.</p>`;
    $("#more").innerHTML = list.length > state.limit ? `<button class="btn" id="morebtn">Prikaži još (${list.length - state.limit})</button>` : `<span class="hint">${list.length} karata</span>`;
  }
  function renderBackup() {
    $("#app").innerHTML = `<div class="backup">
      <div class="panel"><h2>Automatska rezervna kopija</h2>
        ${SERVER ? `<p class="hint">Kolekcija se posle svake izmene sama upisuje u <code>${esc(saveFile)}</code>, uz snimak stanja za svaki dan (poslednjih 60 dana). Pri otvaranju aplikacija čita kolekciju odatle.</p>` : ""}
        <div class="row">${SERVER ? '<button class="btn" id="open-save">Otvori folder save</button>' : ""}<span class="hint" id="save-status">${esc(saveStateMessage)}</span></div>
      </div>
      <div class="panel"><h2>Ručna rezervna kopija</h2>
        <p class="hint">Ovo je dodatna mogućnost za ručni izvoz, kopiranje ili vraćanje kolekcije.</p>
        <textarea id="bk" spellcheck="false">${esc(JSON.stringify(COLL))}</textarea>
        <div class="row"><button class="btn primary" id="bkfile">Sačuvaj kao fajl</button><button class="btn" id="bkcopy">Kopiraj</button><button class="btn" id="bkload">Učitaj iz teksta</button><span class="hint" id="bkmsg"></span></div>
      </div>
      ${WEB ? `<div class="panel"><h2>Baza karata</h2>
        <p class="hint">Karte i slike stižu sa riftcodex.com; cene su TCGplayer cene od poslednje objave sajta${PRICES?.t ? ` (${new Date(PRICES.t * 1000).toLocaleDateString("sr-RS")})` : ""}.</p>
        <div class="row"><button class="btn" id="refresh">Osveži bazu karata</button><span class="hint" id="rsmsg"></span></div>
      </div>` : `<div class="panel"><h2>Osnovni špilovi</h2>
        <p class="hint">Kolekcija je napunjena iz: ${PRECONS.map((p) => esc(p.product)).join(", ")}.</p>
        ${UNRESOLVED.length ? `<p class="err">Nisu pronađene u bazi: ${UNRESOLVED.map(esc).join(", ")}</p>` : ""}
        <div class="row"><button class="btn" id="reseed">Vrati kolekciju na osnovne špilove</button><button class="btn" id="refresh">Osveži bazu karata</button><span class="hint" id="rsmsg"></span></div>
      </div>`}</div>`;
  }
  /* ============ kolekcionar: vrednost kolekcije i kompletiranje setova ============ */
  // Glavni setovi redom izlaska. Promo karte (OPP, PR, JDG) nemaju zaokružen spisak, pa se ne prate kao setovi.
  const MAIN_SETS = ["OGN", "OGS", "SFD", "UNL", "VEN"];
  const RAR_ORDER = ["Common", "Uncommon", "Rare", "Epic"];
  // Spisak seta: karte sa brojem bez slova koji nije veći od ukupnog („036“ od „298“). Alt art, overnumbered
  // i signature verzije su dodatne i ne ulaze u spisak. Imena se ne ponavljaju između glavnih setova,
  // pa je karta „u kolekciji“ kad imaš bilo koje njeno izdanje (kolekcija pamti karte po imenu).
  function setLists() {
    const out = new Map(MAIN_SETS.map((s) => [s, new Map()]));
    for (const c of ALL) {
      const list = out.get(c.set), p = String(c.rid).toLowerCase().split("-");
      if (!list || c.alt || p.length < 3 || !/^\d+$/.test(p[1]) || +p[1] > +p[2] || list.has(p[1])) continue;
      const canon = BY.get(c.code); if (!canon) continue;
      list.set(p[1], { num: p[1], c: canon, print: c, rar: c.rar });
    }
    return out;
  }
  // Cena karte = najniža TCGplayer cena među njenim običnim (ne alt) izdanjima: tržišna, pa najniža ponuda,
  // pa foil ako obične nema. Karte iz gotovih špilova i boostera su obično najjeftinije izdanje.
  let UNIT = null; // kod karte → { v: cena po primerku, pr: izdanje po kome je cena } (samo karte koje imaju cenu)
  const priceOf = (pid) => {
    const p = pid && PRICES && PRICES.cene[String(pid)]; if (!p) return null;
    const v = (x) => (x ? x.m ?? x.l ?? null : null);
    return v(p.n) ?? v(p.f);
  };
  function unitPrices() {
    if (UNIT) return UNIT;
    UNIT = new Map();
    for (const c of ALL) {
      if (c.alt) continue;
      const canon = BY.get(c.code); if (!canon) continue;
      const v = priceOf(c.tp || (PRICES.kod || {})[c.code]); if (v == null) continue;
      const prev = UNIT.get(canon.code); if (!prev || v < prev.v) UNIT.set(canon.code, { v, pr: c });
    }
    return UNIT;
  }
  function collectionValue(lists) {
    const U = unitPrices(), home = new Map();
    for (const s of MAIN_SETS) for (const x of lists.get(s).values()) if (!home.has(x.c.code)) home.set(x.c.code, s);
    let total = 0, priced = 0, unpriced = 0;
    const bySet = new Map(), rows = [];
    for (const [code, q] of Object.entries(COLL)) {
      const c = BY.get(code); if (!c || !(q > 0)) continue;
      const u = U.get(c.code);
      if (!u) { unpriced += q; continue; }
      const v = u.v;
      priced += q; total += v * q;
      const s = home.get(c.code) || "other";
      bySet.set(s, (bySet.get(s) || 0) + v * q);
      rows.push({ c, q, v, pr: u.pr });
    }
    rows.sort((a, b) => b.v - a.v || b.q - a.q);
    return { total, priced, unpriced, bySet, top: rows.slice(0, 10) };
  }
  function valueHTML(lists, labels) {
    if (!SERVER && !WEB) return `<p class="hint">Vrednost se računa iz TCGplayer cena, koje stižu preko servera aplikacije. Otvori aplikaciju prečicom na desktopu.</p>`;
    if (!PRICES) return `<p class="hint">${pricesErr ? "Cene trenutno nisu dostupne (nema veze sa TCGplayer-om). Pokušaj ponovo kasnije." : "Učitavam cene…"}</p>`;
    const v = collectionValue(lists);
    const sets = [...v.bySet].sort((a, b) => b[1] - a[1]);
    const max = Math.max(...sets.map((x) => x[1]), 0.01);
    const when = new Date(PRICES.t * 1000).toLocaleString("sr-RS", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    return `<div class="collection-counts cv-counts">
        <div><strong>${usd(v.total)}</strong><span>procenjena vrednost</span></div>
        <div><strong>${v.priced}</strong><span>karata sa cenom</span></div>
        <div><strong>${v.unpriced}</strong><span>karata bez cene</span></div>
      </div>
      <div class="cv-cols">
        <div class="cv-sets"><span class="label">Vrednost po setu</span>
          ${sets.map(([s, val]) => `<div class="cv-set"><span class="cv-set-n">${esc(s === "other" ? "Ostalo (promo, tokeni)" : labels.get(s) || s)}</span><span class="cv-bar"><i style="width:${(val / max * 100).toFixed(1)}%"></i></span><b>${usd(val)}</b></div>`).join("")}
        </div>
        <div class="cv-top"><span class="label">Najvrednije karte koje imaš</span>
          <ol class="top-cards">${v.top.map((x) => `<li><button type="button" class="tc" data-open="${esc(x.c.code)}">
            <span class="tc-img">${x.c.img ? `<img loading="lazy" src="${esc(x.c.img)}" alt="">` : ""}</span>
            <span class="tc-n"><b>${esc(x.c.name)}</b><small>${esc(x.pr.setl || x.pr.set)} · ${esc(x.pr.rar || "")}${x.q > 1 ? ` · imaš ${x.q}` : ""}</small></span>
            <span class="tc-v">${usd(x.v)}${x.q > 1 ? `<small>ukupno ${usd(x.v * x.q)}</small>` : ""}</span></button></li>`).join("")}</ol>
        </div>
      </div>
      <p class="hint">Cene: TCGplayer, ${PRICES.staro ? "stare cene (nema interneta), " : ""}${esc(when)}. Svaka karta se računa po najjeftinijem običnom izdanju; foil, Showcase i alt art verzije se ne računaju posebno. Ovo je procena u dolarima, ne cena za koju bi karte prodao.</p>`;
  }
  function renderCollector() {
    const lists = setLists();
    const labels = new Map(ALL.map((c) => [c.set, c.setl]));
    const own = (x) => COLL[x.c.code] > 0;
    const prog = MAIN_SETS.filter((s) => lists.get(s).size).map((s) => {
      const items = [...lists.get(s).values()].sort((a, b) => +a.num - +b.num);
      const rar = RAR_ORDER.map((r) => { const it = items.filter((x) => x.rar === r); return { r, n: it.length, have: it.filter(own).length }; }).filter((x) => x.n);
      return { s, label: labels.get(s) || s, items, have: items.filter(own).length, rar };
    });
    if (!prog.some((p) => p.s === state.cset)) state.cset = (prog.find((p) => p.have) || prog[0] || {}).s || "";
    const sel = prog.find((p) => p.s === state.cset);
    const U = PRICES ? unitPrices() : new Map();
    let miss = sel ? sel.items.filter((x) => !own(x)) : [];
    const price = (x) => U.get(x.c.code)?.v;
    const missCost = miss.reduce((a, x) => a + (price(x) || 0), 0), missNoPrice = miss.filter((x) => !U.has(x.c.code)).length;
    if (state.crar) miss = miss.filter((x) => x.rar === state.crar);
    if (state.csort !== "num") {
      const dir = state.csort === "cheap" ? 1 : -1;
      miss.sort((a, b) => { const pa = price(a), pb = price(b); if (pa == null) return 1; if (pb == null) return -1; return (pa - pb) * dir || +a.num - +b.num; });
    }
    const pct = (a, b) => (b ? Math.floor(a / b * 100) : 0);
    $("#app").innerHTML = `<div class="collector">
      <section class="panel"><div><h2>Vrednost kolekcije</h2><p class="hint">Koliko vredi sve što imaš, po trenutnim cenama na tržištu.</p></div>${valueHTML(lists, labels)}</section>
      <section class="panel">
        <div><h2>Kompletiranje setova</h2><p class="hint">Koliko različitih karata iz svakog seta imaš. Broje se karte sa redovnim brojem u setu; alt art i posebne verzije su dodatne. Izaberi set da vidiš šta ti fali.</p></div>
        <div class="set-cards">${prog.map((p) => `<button type="button" class="set-card ${p.s === state.cset ? "active" : ""}" data-cset="${p.s}">
          <span class="sc-top"><b>${esc(p.label)}</b><span class="sc-code">${p.s}</span></span>
          <span class="sc-num"><strong>${p.have}</strong> / ${p.items.length}<em>${pct(p.have, p.items.length)}%</em></span>
          <span class="cv-bar"><i style="width:${pct(p.have, p.items.length)}%"></i></span>
          <span class="sc-rar">${p.rar.map((r) => `<span title="${r.r}: imaš ${r.have} od ${r.n}">${r.r[0]} ${r.have}/${r.n}</span>`).join("")}</span>
        </button>`).join("")}</div>
        ${sel ? `<div class="miss-head">
          <div><h3>Fali ti iz seta ${esc(sel.label)}: ${sel.items.length - sel.have} ${kartaWord(sel.items.length - sel.have)}</h3>
            ${PRICES ? `<p class="hint">Da dopuniš ceo set, po jedan primerak: oko <b>${usd(missCost)}</b>${missNoPrice ? ` (${missNoPrice} bez cene nisu uračunate)` : ""}.</p>` : ""}</div>
          <div class="miss-tools">
            <label><span class="label">Retkost</span><select id="c-rar" class="pager-sel"><option value="">Sve</option>${sel.rar.map((r) => `<option ${r.r === state.crar ? "selected" : ""}>${r.r}</option>`).join("")}</select></label>
            <label><span class="label">Redosled</span><select id="c-sort" class="pager-sel">${[["num", "Po broju u setu"], ["cheap", "Najjeftinije prvo"], ["dear", "Najskuplje prvo"]].map(([k, l]) => `<option value="${k}" ${k === state.csort ? "selected" : ""} ${k !== "num" && !PRICES ? "disabled" : ""}>${l}</option>`).join("")}</select></label>
          </div></div>
        <div class="fan miss-grid">${miss.slice(0, state.climit).map((x) => `<div class="suggest-card">${tileHTML(x.print)}
          <span class="miss-meta">#${x.num} · ${esc(x.rar || "")}${U.has(x.c.code) ? ` · <b>${usd(price(x))}</b>` : ""}</span>
          <button class="btn" type="button" data-find-card="${esc(x.c.name)}">Pronađi za dodavanje</button></div>`).join("") || `<p class="hint">${state.crar ? "Imaš sve karte ove retkosti." : "Imaš ceo set!"}</p>`}</div>
        ${miss.length > state.climit ? `<div class="more"><button class="btn" id="c-more">Prikaži još (${miss.length - state.climit})</button></div>` : ""}` : ""}
      </section></div>`;
    if ((SERVER || WEB) && !PRICES && !pricesErr) loadPrices().then(() => { if (state.tab === "kolekcionar") renderCollector(); }).catch(() => { if (state.tab === "kolekcionar") renderCollector(); });
  }

  function render() {
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === state.tab));
    if (state.tab === "coll") renderColl(); else if (state.tab === "kolekcionar") renderCollector(); else if (state.tab === "add") renderAddPage(); else if (state.tab === "deck") renderDeck(); else renderBackup();
    renderStats();
  }

  /* ============ prozor karte: tekst sa simbolima, objašnjenja i cena ============ */
  // Simboli iz teksta karte (:rb_might: …) i ključne reči ([Assault 2] …). Objašnjenja su prevod
  // podsetnika koji pišu na samim kartama; reči bez sigurnog objašnjenja se samo istaknu.
  const SVG_MIGHT = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.5 2.5 21.5 2.5 21.5 9.5 11 20 8.5 17.5 6.3 19.7 7.4 20.8 6 22.2 1.8 18 3.2 16.6 4.3 17.7 6.5 15.5 4 13z"/></svg>';
  const SVG_EXHAUST = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M3 3v5h5"/></svg>';
  const SYM = {
    might: ["Might", "Snaga jedinice. U borbi (showdown) jedinica zadaje štetu jednaku svom Might-u, a uništena je kad primi toliko štete. „+2 Might this turn“ znači da je jača za 2 do kraja poteza."],
    energy: ["Energija", "Broj u krugu je trošak u energiji. Energija se plaća iscrpljivanjem (exhaust) runa."],
    rune: ["Moć domena", "Trošak u moći domena te boje. Plaća se recikliranjem rune istog domena."],
    rainbow: ["Moć bilo kog domena", "Trošak u moći koji može da se plati runom bilo kog domena."],
    exhaust: ["Exhaust", "Iscrpi ovu kartu (okreni je bočno) da bi platio sposobnost. Na početku tvog poteza karta se ponovo sprema."],
    arrow: ["Strelica", "Levo je uslov ili okidač, desno efekat koji se tada dešava."],
  };
  const KW = {
    accelerate: "Možeš da platiš dodatni trošak (energija i moć domena) da jedinica uđe spremna (ready), a ne iscrpljena.",
    action: "Igra se u tvom potezu ili tokom showdown-a.",
    reaction: "Igra se bilo kada, čak i pre nego što se razreše spelovi i sposobnosti.",
    ambush: "Možeš da je odigraš kao Reaction, na bojno polje na kome imaš jedinice.",
    assault: "Dok napada, jedinica ima toliko više Might-a (Assault 2 = +2).",
    shield: "Dok brani, jedinica ima toliko više Might-a (Shield 2 = +2).",
    backline: "Šteta u borbi joj se dodeljuje poslednjoj.",
    tank: "Šteta u borbi joj se dodeljuje prvoj.",
    deflect: "Protivnik mora da plati toliko moći bilo kog domena da bi je izabrao spelom ili sposobnošću.",
    ganking: "Može da se pomera direktno sa bojnog polja na bojno polje.",
    hidden: "Možeš da je sakriješ (licem nadole) za 1 moć bilo kog domena, pa da je kasnije odigraš kao Reaction za 0 energije.",
    hunt: "Kad jedinica osvoji ili zadrži bojno polje, dobijaš toliko XP-a.",
    level: "Efekat važi samo dok imaš bar toliko XP-a.",
    "quick-draw": "Ima Reaction; kad je odigraš, zakači je za jedinicu koju kontrolišeš.",
    temporary: "Uništava se na početku Beginning Phase svog vlasnika, pre bodovanja.",
    unique: "U špilu može biti samo 1 karta sa ovim imenom.",
    vision: "Kad je odigraš, pogledaj gornju kartu glavnog špila; možeš da je recikliraš.",
    weaponmaster: "Kad je odigraš, možeš da joj opremiš (Equip) svoju opremu za 1 moć manje, čak i ako je već zakačena.",
    equip: "Plati trošak da ovu opremu zakačiš za jedinicu koju kontrolišeš.",
    deathknell: "Efekat se dešava kad jedinica umre.",
    empower: "Plati trošak da osnažiš ovu kartu (samo ako već nije osnažena).",
    empowered: "Efekat važi dok je karta osnažena (Empower).",
    add: "Dodaje energiju ili moć za plaćanje; na to se ne može reagovati.",
    legion: "Efekat važi ako si u ovom potezu već odigrao drugu kartu.",
    mighty: "Jedinica je Mighty kad ima 5 ili više Might-a.",
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function symHTML(k, used) {
    if (k === "might") { used.add("might"); return `<span class="ic ic-might" title="Might">${SVG_MIGHT}</span>`; }
    if (k === "exhaust") { used.add("exhaust"); return `<span class="ic ic-ex" title="Exhaust">${SVG_EXHAUST}</span>`; }
    if (k === "rune_rainbow") { used.add("rainbow"); return '<i class="ic ic-rune rainbow" title="Moć bilo kog domena"></i>'; }
    let m = k.match(/^energy_(\d+)$/);
    if (m) { used.add("energy"); return `<span class="ic ic-en" title="${m[1]} energije">${m[1]}</span>`; }
    m = k.match(/^rune_([a-z]+)$/);
    if (m && DOMAINS.includes(cap(m[1]))) { used.add("rune"); const d = cap(m[1]); return `<i class="ic ic-rune" style="--c:${DCOL[d]}" title="${d} moć"></i>`; }
    return null;
  }
  // tekst (već bez HTML-a) → bezbedan HTML sa ikonicama i istaknutim ključnim rečima
  function fmtText(t, used) {
    return esc(t)
      .replace(/:rb_([a-z0-9_]+):/g, (all, k) => symHTML(k, used) ?? all)
      .replace(/\[([^\]]+)\]/g, (all, k) => {
        if (k === "&gt;") { used.add("arrow"); return '<span class="ic-arrow" title="Okidač → efekat">→</span>'; }
        if (k === "&gt;&gt;") return '<span class="ic-arrow">»</span>';
        if (/^no text$/i.test(k)) return '<span class="hint">(bez teksta)</span>';
        const base = k.replace(/\s+\d+$/, "").toLowerCase();
        if (KW[base]) used.add("kw:" + base);
        return `<span class="kw${KW[base] ? " tip" : ""}"${KW[base] ? ` title="${esc(KW[base])}"` : ""}>${k}</span>`;
      });
  }
  // tekst karte dolazi kao HTML sa riftcodex-a: zadržavaju se samo pasusi, prelomi i spiskovi
  function cardTextHTML(c, used) {
    const doc = new DOMParser().parseFromString(c.rich || `<p>${c.txt}</p>`, "text/html");
    const TAGS = { P: "p", UL: "ul", LI: "li", EM: "em", I: "em", STRONG: "strong", B: "strong" };
    const walk = (n) => [...n.childNodes].map((x) => {
      if (x.nodeType === 3) return fmtText(x.textContent, used);
      if (x.nodeType !== 1) return "";
      if (x.tagName === "BR") return "<br>";
      const t = TAGS[x.tagName];
      return t ? `<${t}>${walk(x)}</${t}>` : walk(x);
    }).join("");
    return walk(doc.body);
  }
  function legendHTML(used) {
    const sample = { might: `<span class="ic ic-might">${SVG_MIGHT}</span>`, energy: '<span class="ic ic-en">2</span>', rune: `<i class="ic ic-rune" style="--c:${DCOL.Calm}"></i>`,
      rainbow: '<i class="ic ic-rune rainbow"></i>', exhaust: `<span class="ic ic-ex">${SVG_EXHAUST}</span>`, arrow: '<span class="ic-arrow">→</span>' };
    const rows = Object.keys(SYM).filter((k) => used.has(k)).map((k) => `<dt>${sample[k]} ${SYM[k][0]}</dt><dd>${SYM[k][1]}</dd>`)
      .concat([...used].filter((k) => k.startsWith("kw:")).map((k) => k.slice(3)).map((k) => `<dt><span class="kw">${esc(cap(k))}</span></dt><dd>${esc(KW[k])}</dd>`));
    return rows.length ? `<section class="cd-legend"><span class="label">Šta znače simboli i ključne reči</span><dl>${rows.join("")}</dl></section>` : "";
  }

  // cene: TCGplayer preko servera (tcgcsv.com); keš je na serveru, ovde se učitaju jednom po otvaranju aplikacije
  let PRICES = null, pricesP = null, pricesErr = false;
  function loadPrices() {
    if (!pricesP) pricesP = fetch(WEB ? "data/cene.json" : "/api/cene").then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((j) => { UNIT = null; pricesErr = false; return (PRICES = j); }).catch((err) => { pricesP = null; pricesErr = true; throw err; });
    return pricesP;
  }
  const usd = (v) => "$" + Number(v).toFixed(2);
  function priceHTML(c) {
    const pid = c.tp || (PRICES.kod || {})[c.code];
    const p = pid && PRICES.cene[String(pid)];
    const val = (x) => x && (x.m ?? x.l);
    if (!p || val(p.n || p.f) == null) return '<span class="label">Cena na tržištu</span><span class="hint">Trenutno nema ponuda na TCGplayer-u.</span>';
    const main = p.n && val(p.n) != null ? p.n : p.f;
    const what = (main.m != null ? "tržišna cena" : "najniža ponuda") + (main === p.f ? ", foil" : "");
    const foil = main !== p.f && val(p.f) != null ? ` · foil ${usd(val(p.f))}` : "";
    const when = new Date(PRICES.t * 1000).toLocaleString("sr-RS", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
    return `<span class="label">Cena na tržištu</span><b>${usd(val(main))}</b>
      <span class="hint">${what}${foil}</span>
      <span class="hint">TCGplayer · ${PRICES.staro ? "stare cene (nema interneta), " : ""}${esc(when)}</span>
      <a href="https://www.tcgplayer.com/product/${encodeURIComponent(pid)}" target="_blank" rel="noopener">Pogledaj na TCGplayer-u ↗</a>`;
  }

  function openCard(code) {
    const c = BY.get(code); if (!c) return;
    let dlg = $("#card-dlg");
    if (!dlg) {
      dlg = document.createElement("dialog"); dlg.id = "card-dlg"; dlg.className = "card-dlg";
      dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
      document.body.append(dlg);
    }
    const used = new Set();
    const text = cardTextHTML(c, used);
    const land = c.or === "landscape" || isBF(c);
    const pills = [c.type, c.sup, c.setl && `${c.setl} · ${(c.pc || c.code).toUpperCase()}`].filter(Boolean).map((t) => `<span class="cd-pill">${esc(t)}</span>`).join("")
      + (c.rar ? `<span class="cd-pill rar">${esc(c.rar)}</span>` : "");
    const rune = c.dom.length === 1 ? `<i class="ic ic-rune" style="--c:${DCOL[c.dom[0]]}"></i>` : '<i class="ic ic-rune rainbow"></i>';
    const stats = [
      c.e != null && `<div class="cd-stat"><span class="label">Energija</span><b><span class="ic ic-en">${c.e}</span></b></div>`,
      c.p ? `<div class="cd-stat"><span class="label">Moć</span><b>${c.p}<span class="cd-runes">${rune.repeat(Math.min(c.p, 6))}</span></b></div>` : "",
      c.m != null && `<div class="cd-stat"><span class="label">Might</span><b><span class="ic ic-might">${SVG_MIGHT}</span>${c.m}</b></div>`,
      `<div class="cd-stat own"><span class="label">Imaš</span><b>${COLL[c.code] || 0}</b></div>`,
    ].filter(Boolean).join("");
    const doms = c.dom.length ? c.dom.map((d) => `<span class="cd-dom"><i class="dot" style="background:${DCOL[d]}"></i>${d}</span>`).join("") : '<span class="cd-dom">Colorless</span>';
    dlg.innerHTML = `<div class="cd ${land ? "land" : ""}">
      <button class="cd-x" type="button" data-close aria-label="Zatvori" title="Zatvori">×</button>
      <div class="cd-img">${c.img ? `<img src="${esc(c.img)}" alt="${esc(c.name)}">` : ""}</div>
      <div class="cd-body">
        <div class="cd-head"><h3>${esc(c.name)}</h3><div class="cd-pills">${pills}</div></div>
        <div class="cd-stats">${stats}</div>
        <div class="cd-doms">${doms}</div>
        ${text ? `<div class="cd-text">${text}</div>` : ""}
        ${c.fl ? `<p class="cd-flavor">„${esc(c.fl)}“</p>` : ""}
        ${legendHTML(used)}
        ${c.tags.length ? `<p class="hint cd-tags">${c.tags.map(esc).join(" · ")}</p>` : ""}
      </div>
      <div class="cd-foot"><button class="btn" type="button" data-close>Zatvori</button><div class="cd-price" id="cd-price"></div></div>
    </div>`;
    const box = $("#cd-price");
    if (!SERVER && !WEB) box.innerHTML = '<span class="label">Cena na tržištu</span><span class="hint">Cena se vidi kad se aplikacija otvori prečicom.</span>';
    else if (PRICES) box.innerHTML = priceHTML(c);
    else {
      box.innerHTML = '<span class="label">Cena na tržištu</span><span class="hint">Učitavam cenu…</span>';
      loadPrices().then(() => { if (box.isConnected) box.innerHTML = priceHTML(c); })
        .catch(() => { if (box.isConnected) box.innerHTML = '<span class="label">Cena na tržištu</span><span class="hint">Cena trenutno nije dostupna.</span>'; });
    }
    dlg.showModal();
  }

  /* ============ događaji ============ */
  document.addEventListener("click", async (e) => {
    const t = e.target.closest("button,[data-open],[data-tab]"); if (!t) return;
    if (t.dataset.tab) { e.preventDefault(); state.tab = t.dataset.tab; store.set(K_TAB, state.tab); if (DB.length) render(); return; }
    if (t.dataset.cset) { state.cset = t.dataset.cset; state.crar = ""; state.climit = 60; renderCollector(); return; }
    if (t.id === "c-more") { state.climit += 60; renderCollector(); return; }
    if (t.dataset.leg) { state.legend = t.dataset.leg; renderDeck(); window.scrollTo({ top: 0 }); return; }
    if (t.dataset.dom) { state.dom.has(t.dataset.dom) ? state.dom.delete(t.dataset.dom) : state.dom.add(t.dataset.dom); state.limit = 120; renderColl(); return; }
    if (t.dataset.d) {
      const tile = t.closest(".tile"), code = tile.dataset.code;
      COLL[code] = Math.max(0, (COLL[code] || 0) + +t.dataset.d); if (!COLL[code]) delete COLL[code];
      saveColl();
      const n = COLL[code] || 0;
      tile.querySelector(".n").textContent = n; tile.classList.toggle("unowned", !n);
      const img = tile.querySelector(".img"); let b = img.querySelector(".badge");
      if (n) { if (!b) { b = document.createElement("span"); b.className = "badge"; img.append(b); } b.textContent = n; } else if (b) b.remove();
      return;
    }
    if (t.dataset.open) { openCard(t.dataset.open); return; }
    if (t.dataset.findCard) { state.addQ = t.dataset.findCard; state.addSet = ""; state.addLimit = 30; state.tab = "add"; store.set(K_TAB, state.tab); render(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (t.dataset.addCard) {
      const code = t.dataset.addCard;
      const input = document.querySelector(`[data-add-qty="${CSS.escape(code)}"]`);
      const qty = Math.floor(Number(input && input.value));
      if (!Number.isFinite(qty) || qty < 1 || qty > 99) { if (input) { input.focus(); input.setCustomValidity("Unesi broj od 1 do 99."); input.reportValidity(); input.setCustomValidity(""); } return; }
      COLL[code] = (COLL[code] || 0) + qty;
      saveColl();
      renderAddResults();
      if ($("#grid")) renderGrid();
      const msg = document.createElement("span"); msg.className = "add-confirm"; msg.textContent = `Dodato ${qty}×.`;
      const row = document.querySelector(`[data-add-row="${CSS.escape(code)}"]`);
      if (row) { const prev = row.querySelector(".add-confirm"); if (prev) prev.remove(); row.append(msg); }
      return;
    }
    if (t.id === "add-more") { state.addLimit += 30; renderAddResults(); return; }
    if (t.id === "morebtn") { state.limit += 120; renderGrid(); return; }
    if (t.id === "open-save") { fetch("/api/otvori-save", { method: "POST" }).catch(() => {}); return; }
    if (t.id === "bkcopy") { const ta = $("#bk"); try { await navigator.clipboard.writeText(ta.value); $("#bkmsg").textContent = "Kopirano."; } catch { ta.select(); $("#bkmsg").textContent = "Označeno - pritisni Ctrl+C."; } return; }
    if (t.id === "bkload") {
      try {
        const o = JSON.parse($("#bk").value); if (typeof o !== "object" || !o || Array.isArray(o)) throw 0;
        COLL = {}; for (const [k, v] of Object.entries(o)) if (+v > 0) COLL[k.toLowerCase()] = +v;
        saveColl(); $("#bkmsg").textContent = "Kolekcija učitana.";
      } catch { $("#bkmsg").textContent = "Tekst nije ispravna rezervna kopija."; }
      return;
    }
    if (t.id === "bkfile") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(COLL, null, 1)], { type: "application/json" }));
      a.download = `riftbound-kolekcija-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      $("#bkmsg").textContent = "Fajl je u folderu Preuzimanja.";
      return;
    }
    if (t.id === "reseed") {
      if (t.dataset.sure) { COLL = seedCollection(); saveColl(); $("#rsmsg").textContent = "Kolekcija je vraćena na osnovne špilove."; delete t.dataset.sure; t.textContent = "Vrati kolekciju na osnovne špilove"; }
      else { t.dataset.sure = 1; t.textContent = "Sigurno? Klikni ponovo"; $("#rsmsg").textContent = "Ovo briše ručne izmene kolekcije."; }
      return;
    }
    if (t.id === "refresh") {
      $("#rsmsg").textContent = "Osvežavam…";
      try { indexDB(await loadDB(true)); saveColl(); $("#rsmsg").textContent = `Baza je osvežena: ${DB.length} karata.`; }
      catch (err) { $("#rsmsg").textContent = "Ne mogu da dohvatim bazu: " + err.message; }
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "q") { state.q = e.target.value; state.limit = 120; renderGrid(); }
    else if (e.target.id === "add-q") { state.addQ = e.target.value; state.addLimit = 30; renderAddResults(); }
  });
  document.addEventListener("change", (e) => {
    const id = e.target.id;
    if (id === "add-set") { state.addSet = e.target.value; state.addLimit = 30; renderAddResults(); return; }
    if (id === "c-sort" || id === "c-rar") { state[id === "c-sort" ? "csort" : "crar"] = e.target.value; state.climit = 60; renderCollector(); return; }
    if (id === "mine") state.mine = e.target.checked;
    else if (id === "type") state.type = e.target.value;
    else if (id === "set") state.set = e.target.value;
    else return;
    state.limit = 120; renderGrid();
  });

  /* ============ start ============ */
  (async () => {
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === state.tab));
    let saved = store.get(K_COLL);
    const srv = await serverLoad();
    // folder save ima prednost, osim kad je u pregledaču novije stanje koje nije stiglo do servera (server nije radio)
    const localNewer = saved && (store.get(K_COLL_T) || 0) > (srv?.t || 0) + 2000;
    if (srv && srv.kolekcija && typeof srv.kolekcija === "object" && !localNewer) saved = srv.kolekcija;
    if (saved && typeof saved === "object") COLL = saved;
    try { indexDB(await loadDB(false)); }
    catch (err) {
      $("#status").innerHTML = `<p class="err">Ne mogu da učitam bazu karata sa riftcodex.com (${esc(err.message)}).</p><p class="hint">Proveri internet vezu pa osveži stranicu.</p>`;
      return;
    }
    if (!saved || !Object.keys(saved).length) { COLL = WEB ? {} : seedCollection(); saveColl(); }
    else {
      checkSeeds();
      if (SERVER && (!srv.kolekcija || localNewer)) saveColl(); // kolekcija iz pregledača ide u folder save
      else store.set(K_COLL, COLL);
    }
    render();
  })();
})();
