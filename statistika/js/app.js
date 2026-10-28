// Glavni prozor: povezuje bazu, obračune i prikaz (prenos main_window.py).
(() => {
  const U = window.UG, B = window.UGBaza, M = window.UGMail, C = window.UGChart, R = window.UGReport;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* bez trajnog pamćenja */ } },
  };
  const app = $("#app");
  const TABS = [["nedelja", "Ova nedelja"], ["istorija", "Istorija nedelja"], ["meseci", "Mesečni pregled"], ["zeno", "Zeno statistika"], ["zeno4", "Zeno periodi"]];
  const METRICS = { USERS: "users", SESSIONS: "sessions", "SLUŠANJE": "hours" };

  // Linijske ikonice za dugmad (boja = boja teksta dugmeta).
  const svg = (d) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICON = {
    csv: svg('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>'),
    shield: svg('<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    restore: svg('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    archive: svg('<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M10 13h4"/>'),
    report: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    history: svg('<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>'),
    // tabovi
    nedelja: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 15h3"/>'),
    istorija: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    meseci: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2"/>'),
    zeno: svg('<path d="M12 12h.01"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7"/><path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>'),
    zeno4: svg('<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>'),
  };
  $("#btn-baza").innerHTML = `${ICON.gear}Podešavanja`;
  $("#btn-history").innerHTML = `${ICON.history}Istorija`;

  const S = {
    site: {}, zeno: [], theme: U.DEFAULT_THEME, darkName: "zar", ready: false,
    today: U.today(), selected: U.today(), missing: [],
    histMonday: null, histPinned: false,
    zenoWeek: null, zenoMetric: "USERS",
    periodStart: null, periodMetric: "USERS", periodDays: ls.get("ug-period") === "84" ? 84 : 28,
    tab: TABS.some(([id]) => id === ls.get("ug-tab")) ? ls.get("ug-tab") : "nedelja",
  };
  window.UGApp = { site: () => S.site };

  // ---------- TEMA: tamna ili svetla; u bazi ostaje ime palete stare verzije ("svetla" ili tamna paleta) ----------
  const uiTheme = () => document.documentElement.dataset.theme;
  function setUiTheme(t) {
    document.documentElement.dataset.theme = t;
    ls.set("ug-tema", t);
    const b = $("#btn-tema"), label = t === "light" ? "Tamna tema" : "Svetla tema";
    b.innerHTML = t === "light" ? ICON.moon : ICON.sun;
    b.title = label; b.setAttribute("aria-label", label);
  }
  setUiTheme(uiTheme() === "light" ? "light" : "dark");
  $("#btn-tema").addEventListener("click", async () => {
    const t = uiTheme() === "light" ? "dark" : "light";
    setUiTheme(t);
    S.theme = t === "light" ? "svetla" : S.darkName;
    if (S.ready) await persist({ backup: false });   // izbor teme ne troši rotaciju backupa
  });

  // ---------- PROZORI ----------
  // modal({ title, html, buttons: [{ label, value, cls, left }], wide, init(dlg, done) }) → vrednost dugmeta (Esc = null)
  function modal({ title, html = "", text, buttons = [{ label: "U redu", value: true, cls: "acc" }], wide, init }) {
    return new Promise((resolve) => {
      const dlg = document.createElement("dialog");
      dlg.className = "modal" + (wide ? " wide" : "");
      dlg.innerHTML = `<div class="m-body">${title ? `<h2>${esc(title)}</h2>` : ""}${text !== undefined ? `<p class="m-text">${esc(text)}</p>` : ""}${html}</div>
        <div class="m-foot">${buttons.map((b, i) => `<button type="button" class="pill ${b.cls || ""} ${b.left ? "left" : ""}" data-b="${i}">${esc(b.label)}</button>`).join("")}</div>`;
      let settled = false;
      const done = (v) => { if (settled) return; settled = true; dlg.close(); dlg.remove(); resolve(v); };
      dlg.addEventListener("cancel", (e) => { e.preventDefault(); if (!dlg.dataset.locked) done(null); });
      dlg.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => {
        const btn = buttons[+b.dataset.b];
        if (btn.onClick && btn.onClick(dlg, done) === false) return;
        done(btn.value);
      }));
      document.body.append(dlg);
      dlg.showModal();
      if (init) init(dlg, done);
      else { const acc = dlg.querySelector(".m-foot .acc"); if (acc) acc.focus(); }
    });
  }
  const alertBox = (title, text) => modal({ title, text });
  const confirmBox = (title, text, yes = "Da", no = "Ne") =>
    modal({ title, text, buttons: [{ label: no, value: false }, { label: yes, value: true, cls: "acc" }] }).then((v) => v === true);
  function toast(text, warn) {
    const t = document.createElement("div");
    t.className = "toast" + (warn ? " warn" : "");
    t.textContent = text;
    $("#toasts").append(t);
    setTimeout(() => t.remove(), warn ? 9000 : 4000);
  }

  // ---------- ČUVANJE: ako upis ne uspe, korisnik to vidi, a pozivalac poništava izmenu ----------
  async function persist({ backup = true } = {}) {
    const r = await B.save({ site: S.site, zeno: S.zeno, theme: S.theme }, {
      backup,
      onConflict: () => confirmBox("Baza je promenjena",
        "Fajl baze je u međuvremenu izmenjen van ove aplikacije (na primer u staroj verziji programa).\n\n" +
        "Ako nastaviš, te izmene se prepisuju (prethodno stanje ide u backup). Ako odustaneš, izmena se poništava; " +
        "bazu možeš ponovo da učitaš preko dugmeta Podešavanja.", "Prepiši", "Odustani"),
    });
    if (r.ok) { if (r.warning) toast(r.warning, true); return true; }
    if (!r.cancelled) await alertBox("Čuvanje podataka", `Podaci nisu upisani na disk, pa je izmena poništena.\n\n${r.error || ""}`);
    return false;
  }

  // ---------- POČETNI EKRANI (baza) ----------
  const APPDATA_NOTE = `<div class="note"><b>Baza iz stare verzije.</b> Edge, Chrome i Vivaldi iz bezbednosnih razloga ne puštaju
    stranice u folder <code>AppData</code>, pa <code>%APPDATA%\\UnderGRAND Statistics\\undergrand_stats.json</code> ne može da se otvori odatle
    (pregledač javlja da folder sadrži sistemske fajlove). Premesti folder <b>UnderGRAND Statistics</b> u <b>Dokumente</b> (ili bilo gde van AppData)
    i otvori bazu odatle; za backup izaberi njegov podfolder <code>backups</code>.</div>`;

  function screenUnsupported() {
    app.innerHTML = `<section class="panel start"><h2>Ovaj pregledač ne može da radi sa fajlom baze</h2>
      <p>UnderGRAND statistika poseta čuva podatke direktno u fajlu <code>undergrand_stats.json</code>, a za to je potreban pristup fajlovima
      (File System Access), koji ovaj pregledač nema ili ga je isključio.</p>
      <p><b>Otvori aplikaciju u Microsoft Edge-u ili Vivaldiju</b> (radi i u Google Chrome-u): desni klik na <code>index.html</code> → Otvori pomoću → Microsoft Edge.</p>
      <p class="hint">Firefox i Safari ne podržavaju ovaj pristup, a u Brave-u je podrazumevano isključen.</p></section>`;
  }

  function screenSetup(step) {
    const s1 = step === 1;
    app.innerHTML = `<section class="panel start">
      <h2>${s1 ? "Dobro došli u novu verziju" : "Folder za backup"}</h2>
      ${s1 ? `<p>Izaberi postojeću bazu <code>undergrand_stats.json</code> iz stare verzije programa, ili napravi novu praznu bazu.
        Aplikacija pamti izbor; posle ponovnog pokretanja traži samo jedan klik za dozvolu.</p>
        <div class="actions"><button class="pill acc" data-a="open">Otvori postojeću bazu</button><button class="pill" data-a="new">Napravi novu bazu</button></div>
        ${APPDATA_NOTE}`
      : `<p>Baza: <b>${esc(B.fileName)}</b></p>
        <p>Pre svakog čuvanja aplikacija pravi kopiju baze u ovaj folder i čuva poslednjih 10 kopija i po jednu za svaki od poslednjih 30 dana.
        Preporuka: podfolder <code>backups</code> pored baze (stari backupi su već tamo).</p>
        <div class="actions">${B.dirName ? `<button class="pill acc" data-a="dirok">Nastavi sa folderom „${esc(B.dirName)}“</button>` : ""}
          <button class="pill ${B.dirName ? "" : "acc"}" data-a="dir">Izaberi folder za backup</button></div>`}
      <p class="m-err" id="setup-err"></p></section>`;
    app.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => setupAction(b.dataset.a)));
  }
  async function setupAction(a) {
    const err = $("#setup-err");
    try {
      if (a === "open") { await B.pickDatabase(); B.hasDir && (await B.permitted("dir", true)) ? await start() : screenSetup(2); }
      else if (a === "new") { await B.createDatabase(); screenSetup(2); }
      else if (a === "dir") { await B.pickBackupDir(); await start(); }
      else if (a === "dirok") {
        if (await B.permitted("dir", true)) await start();
        else err.textContent = "Pregledač nije dozvolio pristup folderu. Izaberi folder ponovo.";
      }
    } catch (e) {
      if (e.name === "AbortError") return;
      err.textContent = e.name === "SecurityError" || e.name === "NotAllowedError"
        ? "Pregledač nije dozvolio pristup tom mestu. Izaberi fajl ili folder van AppData i sistemskih foldera."
        : `Greška: ${e.message || e}`;
    }
  }

  function screenResume(fileName) {
    app.innerHTML = `<section class="panel start"><h2>Nastavak rada</h2>
      <p>Pregledač traži potvrdu da aplikacija sme da koristi bazu <b>${esc(fileName)}</b>${B.dirName ? ` i folder za backup <b>${esc(B.dirName)}</b>` : ""}.</p>
      <p class="hint">U prozoru pregledača izaberi „Dozvoli pri svakoj poseti“ (ako se ponudi) da sledeći put ne bude ni ovog klika.</p>
      <div class="actions"><button class="pill acc" data-a="go">Nastavi</button><button class="pill" data-a="other">Izaberi drugu bazu</button></div>
      <p class="m-err" id="setup-err"></p></section>`;
    app.querySelector('[data-a="go"]').addEventListener("click", async () => {
      const { fileOk, dirOk } = await B.askPermissions();
      if (!fileOk) { $("#setup-err").textContent = "Bez dozvole aplikacija ne može da pročita bazu. Pokušaj ponovo ili izaberi bazu ponovo."; return; }
      if (!dirOk) { screenSetup(2); return; }
      await start();
    });
    app.querySelector('[data-a="other"]').addEventListener("click", () => screenSetup(1));
  }

  async function boot() {
    if (!B.supported()) { screenUnsupported(); return; }
    const r = await B.restore();
    if (!r.file) { screenSetup(1); return; }
    if (!r.fileOk) { screenResume(r.file.name); return; }
    if (!r.dirOk) { screenSetup(2); return; }
    await start();
  }

  async function start() {
    let store;
    try { store = await B.load(); }
    catch (e) {
      app.innerHTML = `<section class="panel start"><h2>Baza nije dostupna</h2><p>${esc(e.message || e)}</p>
        <p class="hint">Fajl je možda premešten ili obrisan.</p><div class="actions"><button class="pill acc" data-a="open">Izaberi bazu</button></div>
        <p class="m-err" id="setup-err"></p></section>`;
      app.querySelector("[data-a]").addEventListener("click", () => setupAction("open"));
      return;
    }
    S.site = store.site; S.zeno = store.zeno; S.theme = store.theme;
    if (store.theme !== "svetla") S.darkName = store.theme;
    if (!ls.get("ug-tema")) setUiTheme(store.theme === "svetla" ? "light" : "dark");
    S.theme = uiTheme() === "light" ? "svetla" : S.darkName;
    if (store.skipped.length) console.warn("Preskočeni neispravni unosi u bazi:", store.skipped);
    S.ready = true;
    S.today = U.today(); S.selected = S.today;
    $("#btn-baza").hidden = false;
    renderShell();
    refresh();
    if (B.notice) await alertBox("Baza podataka", B.notice);
  }

  // ---------- OSNOVA EKRANA ----------
  function renderShell() {
    app.innerHTML = `
      <section class="panel tools">
        <div class="tool-group"><p class="group-label">PODACI</p><div class="btn-row">
          <button class="pill" data-act="csv" title="Sve posete i Zeno podaci u CSV fajl koji se otvara u Excelu">${ICON.csv}Izvoz u Excel</button>
          <button class="pill acc" data-act="backup" title="Kopija baze u folder za backup">${ICON.shield}Napravi kopiju</button>
          <button class="pill" data-act="restore" title="Zameni bazu sadržajem ranije kopije">${ICON.restore}Vrati iz kopije</button>
        </div></div>
        <div class="tool-group"><p class="group-label">ZENO</p><div class="btn-row">
          <button class="pill" data-act="eml" title="Jedan ili više Zeno nedeljnih mejlova (.eml)">${ICON.mail}Zeno mejl</button>
          <button class="pill acc" data-act="arch" title="Google Takeout .zip ili .mbox arhiva">${ICON.archive}Zeno arhiva</button>
        </div></div>
        <div class="tool-group"><p class="group-label">IZVEŠTAJI</p><div class="btn-row">
          <button class="pill" data-act="report" title="Nedeljni ili Zeno izveštaj: tekst, štampa ili PDF">${ICON.report}Izveštaj</button>
        </div></div>
      </section>
      <nav class="tabs" role="tablist">${TABS.map(([id, label]) => `<button class="tab" role="tab" data-tab="${id}" aria-selected="${id === S.tab}">${ICON[id]}${label}</button>`).join("")}</nav>
      ${TABS.map(([id]) => `<section class="tabpanel" id="tp-${id}" role="tabpanel" ${id === S.tab ? "" : "hidden"}></section>`).join("")}`;
    app.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
    const acts = { csv: exportCsv, backup: manualBackup, restore: restoreBackup, eml: () => $("#f-eml").click(), arch: () => $("#f-arch").click(), report: () => reportDialog("week") };
    app.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => acts[b.dataset.act]()));
  }
  function showTab(id) {
    S.tab = id; ls.set("ug-tab", id);
    app.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === id));
    TABS.forEach(([t]) => { $(`#tp-${t}`).hidden = t !== id; });
  }

  function refresh() {
    S.today = U.today();
    renderWeek(); renderHistory(); renderMonths(); renderZeno(); renderPeriods();
  }

  const dayStr = (d) => U.fmtDate(d, "%d.%m.%Y");
  const trendHtml = (pct, extra = "") => {
    if (pct === null || pct === undefined) return "-";
    const dir = U.trendDirection(pct);
    return `<span class="t-${dir}">${U.trendArrow(dir)} ${U.fmtPct(pct)}</span>${extra}`;
  };
  const card = (title, value, sub, acc) =>
    `<div class="card${acc ? " acc" : ""}"><div class="card-title">${esc(title)}</div><div class="card-value${String(value).length > 7 ? " long" : ""}" title="${esc(value)}">${esc(value)}</div><div class="card-sub">${sub}</div></div>`;

  // ---------- OVA NEDELJA ----------
  function renderWeek() {
    const t = S.today, m = U.mondayFor(t), s = U.weekSummary(S.site, m, t), n = s.nums.length;
    S.missing = U.missingDays(S.site, t);
    let reminder = "";
    if (S.missing.length) {
      const days = S.missing;
      let text;
      if (days.length === 1) {
        text = U.sameDay(days[0], U.addDays(t, -1)) ? `Nedostaje unos za juče (${U.fmtDate(days[0], "%d.%m.")}).` : `Nedostaje unos za ${U.fmtDate(days[0], "%d.%m.%Y.")}.`;
      } else {
        text = `Nedostaje unos za ${days.length} dana: ${days.slice(0, 5).map((d) => U.fmtDate(d, "%d.%m.")).join(", ")}${days.length > 5 ? " …" : ""}`;
      }
      reminder = `<div class="reminder"><b>${esc(text)}</b><button class="pill acc" id="rem-go">Unesi sada</button></div>`;
    }
    let totalSub;
    if (s.hasCurrent && s.previousPeriod > 0) {
      totalSub = trendHtml((s.currentPeriod - s.previousPeriod) / s.previousPeriod * 100, " prema prethodnoj");
    } else totalSub = esc(n ? `${n} od 7 dana uneto` : "još nema unosa");
    const best = s.bestI, worst = s.worstI;
    let pctText = "-", pctCls = "t-flat";
    if (s.hasCurrent && s.previousPeriod > 0) {
      const ch = (s.currentPeriod - s.previousPeriod) / s.previousPeriod * 100, dir = U.trendDirection(ch);
      pctText = Math.abs(ch) < 0.05 ? "→ 0,0%" : `${U.trendArrow(dir)} ${U.fmtPct(ch)}`;
      pctCls = dir === "up" || dir === "down" ? `t-${dir}` : "t-flat";
    } else if (s.hasCurrent) pctText = "NOVO";
    const first = U.firstEntryDate(S.site);
    const inWeek = U.sameDay(U.mondayFor(S.selected), m);
    const rows = U.DAYS.map((name, i) => {
      const d = U.addDays(m, i), v = s.vals[i], miss = U.isMissingDay(S.site, d, t, first);
      return `<tr class="click ${inWeek && U.weekday(S.selected) === i ? "on" : ""}" data-day="${U.iso(d)}"><td>${name}</td><td>${dayStr(d)}</td>
        <td class="${v === null && miss ? "miss" : ""}">${v !== null ? U.fmtInt(v) : miss ? "nedostaje" : "-"}</td></tr>`;
    }).join("");
    // Polje je prazno posle čuvanja (kao ranije); vrednost dana upisuje tek izbor dana u tabeli ili UNESI.
    const sel = U.sameDay(S.selected, t) ? undefined : S.site[U.iso(S.selected)];
    $("#tp-nedelja").innerHTML = `<div class="stack">
      ${reminder}
      <section class="panel"><h2 class="section-title">DANAŠNJI UNOS</h2>
        <form class="entry-row" id="entry">
          <span class="muted">Datum</span><span class="date-value" id="sel-date">${dayStr(S.selected)}</span>
          <input class="inp" id="visits" inputmode="numeric" autocomplete="off" placeholder="Broj posetilaca" value="${sel !== undefined ? sel : ""}"
            title="Prazno polje + Sačuvaj briše unos za izabrani dan.">
          <button class="pill acc" type="submit">Sačuvaj</button>
          <span class="hint">Klik na dan u tabeli ispod bira drugi dan. Prazno polje + Sačuvaj briše unos.</span>
        </form></section>
      <div class="cards">
        ${card("Ukupno ove nedelje", n ? U.fmtInt(s.total) : "0", totalSub, true)}
        ${card("Dnevni prosek", n ? U.fmtInt(s.avg) : "-", esc(n ? `${n} od 7 dana uneto` : "još nema unosa"))}
        ${card("Najposećeniji dan", best !== null ? U.DAYS[best].toUpperCase() : "-", esc(best !== null ? `${U.fmtInt(s.vals[best])} poseta` : "još nema podataka"))}
        ${card("Najslabiji dan", worst !== null ? U.DAYS[worst].toUpperCase() : "-", esc(worst !== null ? `${U.fmtInt(s.vals[worst])} poseta` : "još nema podataka"))}
      </div>
      <section class="trend-panel"><h3>TREND NEDELJE</h3><p class="trend-sub">Poređenje sa prethodnom nedeljom</p>
        <p class="hint">Isti dani • samo dani sa unosom u obe nedelje</p>
        <div class="trend-cols">
          <div><div class="trend-label">PRETHODNA NEDELJA</div><div class="trend-value">${s.previousPeriod > 0 ? U.fmtInt(s.previousPeriod) : "-"}</div></div>
          <div><div class="trend-label">OVA NEDELJA</div><div class="trend-value">${s.hasCurrent ? U.fmtInt(s.currentPeriod) : "-"}</div></div>
          <div><div class="trend-label">PROMENA</div><div class="trend-value ${pctCls}">${esc(pctText)}</div></div>
        </div></section>
      <section class="panel"><div class="chart-head"><h2 class="section-title">POSETE PO DANIMA</h2>
        <div class="legend"><span><i class="lg-prev"></i>prošla nedelja</span><span><i class="lg-main"></i>ova nedelja</span></div></div>
        <div class="chart" id="ch-week"></div></section>
      <section class="panel"><div class="tbl-wrap"><table class="t" id="week-table"><thead><tr><th>DAN</th><th>DATUM</th><th>POSETE</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    </div>`;
    C.bars($("#ch-week"), {
      labels: U.DAYS, fmt: U.fmtInt, height: 270, title: "Posete po danima",
      series: [{ name: "Prošla nedelja", values: s.prevVals, kind: "prev" }, { name: "Ova nedelja", values: s.vals, kind: "main" }],
      notes: s.vals.map((v, i) => (v === null ? (U.isMissingDay(S.site, U.addDays(m, i), t, first) ? "nedostaje" : "-") : null)),
    });
    $("#rem-go")?.addEventListener("click", () => { if (S.missing.length) selectDay(S.missing[0]); });
    $("#entry").addEventListener("submit", (e) => { e.preventDefault(); saveSelectedDay(); });
    $("#week-table tbody").addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-day]");
      if (tr) selectDay(U.fromISO(tr.dataset.day));
    });
  }

  // Izbor dana za unos (klik na red tabele i UNESI u podsetniku).
  function selectDay(day) {
    S.selected = day;
    showTab("nedelja");
    $("#sel-date").textContent = dayStr(day);
    const v = S.site[U.iso(day)], inp = $("#visits");
    inp.value = v !== undefined ? v : "";
    document.querySelectorAll("#week-table tr[data-day]").forEach((tr) => tr.classList.toggle("on", tr.dataset.day === U.iso(day)));
    inp.focus(); inp.select();
  }

  // Upis jednog dana (null briše). Ako upis na disk ne uspe, vraća se staro stanje.
  async function setDay(day, value) {
    const key = U.iso(day), had = key in S.site, old = S.site[key];
    if (value === null) delete S.site[key]; else S.site[key] = value;
    if (await persist()) return true;
    if (had) S.site[key] = old; else delete S.site[key];
    return false;
  }

  async function saveSelectedDay() {
    const day = S.selected, raw = $("#visits").value.replace(/[.,\s]/g, ""), old = S.site[U.iso(day)];
    let value;
    if (raw === "") {
      if (old === undefined) { await alertBox("Unos", "Unesi broj posetilaca."); return; }
      if (!(await confirmBox("Brisanje unosa", `Obrisati unos za ${dayStr(day)} (${U.fmtInt(old)} poseta)?`))) return;
      value = null;
    } else if (/^[0-9]{1,9}$/.test(raw)) value = parseInt(raw, 10);
    else { await alertBox("Unos", "Unesi broj posetilaca."); return; }
    if (!(await setDay(day, value))) return;
    S.selected = U.today();
    refresh();
  }

  // ---------- ISTORIJA NEDELJA ----------
  function renderHistory() {
    const mondays = U.weekMondays(S.site);
    const target = S.histPinned && S.histMonday && mondays.some((m) => U.sameDay(m, S.histMonday)) ? S.histMonday : mondays[0] || null;
    S.histMonday = target;
    const rows = mondays.map((m) => {
      const nums = U.weekValues(S.site, m).filter((v) => v !== null), total = nums.reduce((a, b) => a + b, 0);
      return `<tr class="click ${U.sameDay(m, target) ? "on" : ""}" data-mon="${U.iso(m)}"><td>${dayStr(m)}</td><td>${U.fmtInt(total)}</td>
        <td>${U.fmtInt(nums.length ? U.pyRound(total / nums.length) : 0)}</td><td>${U.fmtInt(nums.length ? Math.max(...nums) : 0)}</td></tr>`;
    }).join("");
    let bottom = `<p class="hint">Još nema unetih poseta.</p>`;
    if (target) {
      const vals = U.weekValues(S.site, target), prev = U.weekValues(S.site, U.addDays(target, -7)), first = U.firstEntryDate(S.site);
      const days = U.DAYS.map((name, i) => {
        const d = U.addDays(target, i), v = vals[i], miss = U.isMissingDay(S.site, d, S.today, first);
        return `<tr class="click" data-day="${U.iso(d)}"><td>${name}</td><td>${dayStr(d)}</td>
          <td class="${v === null && miss ? "miss" : ""}">${v !== null ? U.fmtInt(v) : miss ? "nedostaje" : "-"}</td></tr>`;
      }).join("");
      bottom = `<div class="row-2">
        <section class="panel"><div class="chart-head"><h2 class="section-title">POSETE PO DANIMA - NEDELJA OD ${dayStr(target)}</h2>
          <div class="legend"><span><i class="lg-prev"></i>nedelja pre</span><span><i class="lg-main"></i>izabrana nedelja</span></div></div>
          <div class="chart" id="ch-hist"></div></section>
        <section class="panel"><h2 class="section-title">DANI U NEDELJI</h2><p class="hint" style="margin-bottom:8px">Klik na dan za unos, izmenu ili brisanje.</p>
          <div class="tbl-wrap"><table class="t" id="hist-days"><thead><tr><th>DAN</th><th>DATUM</th><th>POSETE</th></tr></thead><tbody>${days}</tbody></table></div></section>
      </div>`;
      queueMicrotask(() => C.bars($("#ch-hist"), {
        labels: U.DAYS, fmt: U.fmtInt, height: 260, title: "Posete po danima",
        series: [{ name: "Nedelja pre", values: prev, kind: "prev" }, { name: "Izabrana nedelja", values: vals, kind: "main" }],
        notes: vals.map((v, i) => (v === null ? (U.isMissingDay(S.site, U.addDays(target, i), S.today, first) ? "nedostaje" : "-") : null)),
      }));
    }
    $("#tp-istorija").innerHTML = `<div class="stack">
      <section class="panel"><h2 class="section-title">ISTORIJA NEDELJA</h2>
        <div class="tbl-wrap scroll"><table class="t" id="hist-weeks"><thead><tr><th>NEDELJA</th><th>UKUPNO</th><th>PROSEK</th><th>NAJBOLJI DAN</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      ${bottom}</div>`;
    $("#hist-weeks tbody").addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-mon]");
      if (!tr) return;
      S.histPinned = true; S.histMonday = U.fromISO(tr.dataset.mon);
      renderHistory();
    });
    $("#hist-days tbody")?.addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-day]");
      if (tr) { S.histPinned = true; editDay(U.fromISO(tr.dataset.day)); }
    });
  }

  // Prozor za unos, izmenu ili brisanje jednog dana.
  async function editDay(day) {
    if (day > U.today()) { await alertBox("Izmena podatka", "Za budući datum ne mogu da se unesu posete."); return; }
    const old = S.site[U.iso(day)];
    let value = null;
    const action = await modal({
      title: `${U.DAYS[U.weekday(day)]}, ${dayStr(day)}`,
      html: `<p class="muted" style="margin:0 0 10px">${old === undefined ? "Unesi broj posetilaca za ovaj dan." : `Trenutno: ${U.fmtInt(old)} poseta`}</p>
        <input class="inp" id="ed-val" inputmode="numeric" autocomplete="off" placeholder="Broj posetilaca" value="${old !== undefined ? old : ""}" style="width:100%">
        <p class="m-err" id="ed-err"></p>`,
      buttons: [
        ...(old !== undefined ? [{ label: "Obriši", value: "delete", cls: "danger", left: true }] : []),
        { label: "Otkaži", value: null },
        { label: "Sačuvaj", value: "save", cls: "acc", onClick: (dlg) => {
          const raw = $("#ed-val", dlg).value.replace(/[.,\s]/g, "");
          if (!/^[0-9]{1,9}$/.test(raw)) { $("#ed-err", dlg).textContent = "Unesi ceo broj, na primer 1234."; return false; }
          value = parseInt(raw, 10);
          return true;
        } },
      ],
      init: (dlg) => {
        const inp = $("#ed-val", dlg);
        inp.focus(); inp.select();
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); dlg.querySelector(".m-foot .acc").click(); } });
      },
    });
    if (action === "delete") {
      if (!(await confirmBox("Brisanje unosa", `Obrisati unos za ${dayStr(day)} (${U.fmtInt(old)} poseta)?`))) return;
      if (await setDay(day, null)) refresh();
    } else if (action === "save") {
      if (await setDay(day, value)) refresh();
    }
  }

  // ---------- MESEČNI PREGLED ----------
  function renderMonths() {
    const rows = U.months(S.site).map((x) => `<tr><td>${String(x.m).padStart(2, "0")}.${x.y}</td><td>${U.fmtInt(x.total)}</td><td>${U.fmtInt(x.avg)}</td></tr>`).join("");
    $("#tp-meseci").innerHTML = `<section class="panel"><h2 class="section-title">MESEČNI PREGLED</h2>
      ${rows ? `<div class="tbl-wrap"><table class="t"><thead><tr><th>MESEC</th><th>UKUPNO</th><th>DNEVNI PROSEK</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<p class="hint">Još nema unetih poseta.</p>`}</section>`;
  }

  // ---------- ZENO STATISTIKA ----------
  const zenoVal = (r, key) => Number(r[key] ?? 0);
  function segHtml(id, current) {
    return `<div class="seg" id="${id}" role="group">${Object.keys(METRICS).map((k) => `<button type="button" data-m="${k}" aria-pressed="${k === current}">${k}</button>`).join("")}</div>`;
  }
  const metricFmt = (metric) => (metric === "SLUŠANJE" ? U.fmtHours : U.fmtInt);

  function renderZeno() {
    const asc = [...S.zeno].sort(U.byWeekStr), desc = [...asc].reverse();
    if (!desc.some((x) => x.week === S.zenoWeek)) S.zenoWeek = desc[0] ? desc[0].week : null;
    const sel = desc.find((x) => x.week === S.zenoWeek) || null;
    const cards = sel ? [
      ["Users", U.fmtInt(zenoVal(sel, "users")), "jedinstveni korisnici"],
      ["Sessions", U.fmtInt(zenoVal(sel, "sessions")), "ukupno sesija"],
      ["Listening time", U.fmtHours(zenoVal(sel, "hours")), "ukupno vreme slušanja"],
      ["Prosečna sesija", U.fmtSession(zenoVal(sel, "hours"), zenoVal(sel, "sessions")), "slušanje po sesiji"],
    ] : [["Users", "-", ""], ["Sessions", "-", ""], ["Listening time", "-", ""], ["Prosečna sesija", "-", ""]];
    const rows = desc.map((item) => {
      const i = asc.indexOf(item), prev = i > 0 ? asc[i - 1] : null, shown = U.zenoMailDate(item);
      const ch = (k) => U.pctValue(item[k] ?? 0, prev ? prev[k] : 0);
      return `<tr class="click ${item.week === S.zenoWeek ? "on" : ""}" data-week="${esc(item.week)}"><td>${shown ? U.fmtDate(shown, "%d.%m.%Y.") : "-"}</td>
        <td>${U.fmtInt(item.users ?? 0)}</td><td>${U.fmtInt(item.sessions ?? 0)}</td><td>${U.fmtHours(item.hours ?? 0)}</td>
        <td>${U.fmtSession(item.hours ?? 0, item.sessions ?? 0)}</td><td>${trendHtml(ch("users"))}</td><td>${trendHtml(ch("sessions"))}</td><td>${trendHtml(ch("hours"))}</td></tr>`;
    }).join("");
    $("#tp-zeno").innerHTML = `<div class="stack">
      <div class="center"><h2 class="section-title center" style="margin-bottom:2px">ZENO STATISTIKA</h2>
        <p class="hint">Prevuci Zeno e-mail (.eml), .mbox ili Google Takeout .zip fajl bilo gde u prozor da ga uvezeš.</p></div>
      <div class="cards">${cards.map(([t, v, s], i) => card(t, v, esc(s), i === 0)).join("")}</div>
      <section class="panel"><div class="bar-row"><h2 class="section-title" style="margin:0">ZENO PO NEDELJAMA</h2>${segHtml("seg-zeno", S.zenoMetric)}</div>
        <div class="chart" id="ch-zeno"></div><p class="hint center">Klik na stubić bira nedelju (kartice iznad i red u tabeli).</p></section>
      <section class="panel"><h2 class="section-title center">ISTORIJA ZENO STATISTIKE</h2>
        ${rows ? `<div class="tbl-wrap scroll"><table class="t" id="zeno-table"><thead><tr><th>NEDELJA</th><th>USERS</th><th>SESSIONS</th><th>SLUŠANJE</th><th>PROSEČNA SESIJA</th>
          <th>USERS %</th><th>SESSIONS %</th><th>SLUŠANJE %</th></tr></thead><tbody>${rows}</tbody></table></div>`
          : `<p class="hint center">Još nema Zeno podataka. Uvezi nedeljni Zeno e-mail ili Google Takeout arhivu.</p>`}</section>
    </div>`;
    const key = METRICS[S.zenoMetric];
    C.bars($("#ch-zeno"), {
      labels: asc.map((r) => { const d = U.zenoMailDate(r); return d ? U.fmtDate(d, "%d.%m.") : "-"; }),
      series: [{ name: S.zenoMetric, values: asc.map((r) => zenoVal(r, key)), kind: "main" }],
      fmt: metricFmt(S.zenoMetric), height: 250, sparse: true, title: "Zeno po nedeljama", empty: "Još nema Zeno podataka.",
      selected: asc.findIndex((r) => r.week === S.zenoWeek),
      onSelect: (i) => { S.zenoWeek = asc[i].week; renderZeno(); },
    });
    $("#seg-zeno").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) { S.zenoMetric = b.dataset.m; renderZeno(); } });
    $("#zeno-table tbody")?.addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-week]");
      if (tr) { S.zenoWeek = tr.dataset.week; renderZeno(); }
    });
  }

  // ---------- ZENO PERIODI: 4 nedelje (28 dana) ili tromesečje (12 nedelja, 84 dana) ----------
  const PERIODS = {
    28: { n: 4, title: "ZENO - 4 NEDELJE", name: "4 nedelje", label: "4 nedelje", csv: "ZENO_4_NEDELJE", file: "undergrand_zeno_4_nedelje" },
    84: { n: 12, title: "ZENO - TROMESEČJE (12 NEDELJA)", name: "tromesečje (12 nedelja)", label: "Tromesečje · 12 nedelja", csv: "ZENO_12_NEDELJA", file: "undergrand_zeno_12_nedelja" },
  };
  const periodLabel = (p) => `${U.fmtDate(p.start, "%d.%m.%Y.")} – ${U.fmtDate(p.end, "%d.%m.%Y.")}`;

  function renderPeriods() {
    const days = S.periodDays, P = PERIODS[days];
    const periods = U.zenoPeriods(S.zeno, days);
    if (!periods.some((p) => U.sameDay(p.start, S.periodStart))) S.periodStart = periods[0] ? periods[0].start : null;
    const rows = periods.map((p) => {
      const { count, users, sessions, hours, changes } = U.zenoPeriodStats(periods, p, days);
      return `<tr class="click ${U.sameDay(p.start, S.periodStart) ? "on" : ""}" data-start="${U.iso(p.start)}">
        <td>${periodLabel(p)}</td>
        <td>${count >= P.n ? count : `${count} od ${P.n}`}</td>
        <td>${U.fmtDec(users / count, 1)}</td><td>${U.fmtInt(sessions)}</td><td>${U.fmtHours(hours)}</td><td>${U.fmtHours(hours / count)}</td>
        <td>${U.fmtSession(hours, sessions)}</td>${changes.map((c) => `<td>${trendHtml(c)}</td>`).join("")}</tr>`;
    }).join("");
    const weekly = S.periodStart ? U.zenoPeriodRecords(S.zeno, S.periodStart, days) : [];
    const wrows = weekly.map((r) => {
      const d = U.zenoMailDate(r);
      return `<tr><td>${d ? U.fmtDate(d, "%d.%m.%Y.") : "-"}</td><td>${U.fmtInt(zenoVal(r, "users"))}</td><td>${U.fmtInt(zenoVal(r, "sessions"))}</td><td>${U.fmtHours(zenoVal(r, "hours"))}</td></tr>`;
    }).join("");
    const chg = "Promena u odnosu na prethodni period (poređenje proseka po izveštaju)";
    $("#tp-zeno4").innerHTML = `<div class="stack">
      <div class="center"><div class="seg" id="seg-len" role="group" style="margin-bottom:12px">${Object.entries(PERIODS).map(([d, x]) =>
        `<button type="button" data-len="${d}" aria-pressed="${+d === days}">${x.label}</button>`).join("")}</div>
        <h2 class="section-title center" style="margin-bottom:2px">${P.title}</h2>
        <p class="hint">Zeno izveštaji se ovde grupišu u periode od ${days} dana (${P.n} nedelja). Periodi počinju od prvog dostupnog Zeno maila i ne zavise od kalendarskog meseca.</p></div>
      <section class="panel stack">
        ${rows ? `<div class="tbl-wrap"><table class="t" id="period-table"><thead><tr><th>PERIOD</th><th>IZVEŠTAJI</th><th class="wrap">PROSEK USERS</th><th>SESSIONS</th>
          <th>SLUŠANJE</th><th class="wrap" title="Prosečno slušanje po nedeljnom izveštaju">PROSEK / NED.</th><th class="wrap">PROSEČNA SESIJA</th>
          <th title="${chg}">USERS %</th><th title="${chg}">SESSIONS %</th><th title="${chg}">SLUŠANJE %</th></tr></thead><tbody>${rows}</tbody></table></div>
          <div class="tbl-wrap"><table class="t"><thead><tr><th>NEDELJA</th><th>USERS</th><th>SESSIONS</th><th>SLUŠANJE</th></tr></thead><tbody>${wrows}</tbody></table></div>`
          : `<p class="hint center">Još nema Zeno podataka.</p>`}
        <div class="bar-row"><div><span class="lbl">GRAFIKON:</span>${segHtml("seg-period", S.periodMetric)}</div>
          <div class="btn-row"><button class="pill" id="exp-period">${ICON.csv}Izvoz u Excel</button>
          <button class="pill acc" id="rep-period">${ICON.report}Izveštaj za period</button></div></div>
        <h2 class="section-title center" style="margin:0">${esc(S.periodMetric)} PO NEDELJAMA</h2>
        <div class="chart" id="ch-period"></div>
      </section>
      <p class="hint">Glavna tabela prikazuje prosečan USERS po nedeljnom izveštaju, a tabela ispod prikazuje stvaran USERS za svaku nedelju u izabranom periodu.
        Users se ne sabira kao broj jedinstvenih osoba za ceo period, jer Zeno nedeljni izveštaji ne daju taj podatak. Izveštaji se grupišu po obračunskoj nedelji
        (ponedeljak). Promena u odnosu na prethodni period poredi proseke po izveštaju, pa nepotpun period (manje od ${P.n} izveštaja) nije pogrešno prikazan kao pad.</p>
    </div>`;
    const key = METRICS[S.periodMetric];
    C.bars($("#ch-period"), {
      labels: weekly.map((r) => { const d = U.zenoMailDate(r); return d ? U.fmtDate(d, "%d.%m.") : "-"; }),
      series: [{ name: S.periodMetric, values: weekly.map((r) => zenoVal(r, key)), kind: "main" }],
      fmt: metricFmt(S.periodMetric), height: 250, sparse: true, title: "Zeno period", empty: "Nema podataka za izabrani period.",
    });
    $("#seg-len").addEventListener("click", (e) => {
      const b = e.target.closest("[data-len]");
      if (b && +b.dataset.len !== S.periodDays) { S.periodDays = +b.dataset.len; ls.set("ug-period", b.dataset.len); S.periodStart = null; renderPeriods(); }
    });
    $("#seg-period").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) { S.periodMetric = b.dataset.m; renderPeriods(); } });
    $("#period-table tbody")?.addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-start]");
      if (tr) { S.periodStart = U.fromISO(tr.dataset.start); renderPeriods(); }
    });
    $("#exp-period").addEventListener("click", exportPeriodsCsv);
    $("#rep-period").addEventListener("click", () => reportDialog(String(days)));
  }
  // ---------- IZVOZ (CSV kao Python csv.writer: ; razdvaja, navodnici samo kad treba, \r\n, UTF-8 sa BOM) ----------
  const csvLine = (cells) => cells.map((c) => { const s = String(c); return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(";") + "\r\n";
  const byMailDate = (a, b) => (U.zenoMailDate(a)?.getTime() ?? -Infinity) - (U.zenoMailDate(b)?.getTime() ?? -Infinity);

  async function saveFile(name, text, desc, ext, mime) {
    const blob = new Blob([text], { type: mime });
    if (window.showSaveFilePicker) {
      try {
        const h = await window.showSaveFilePicker({ id: "ug-izvoz", suggestedName: name, types: [{ description: desc, accept: { [mime]: [ext] } }] });
        const w = await h.createWritable();
        await w.write(blob); await w.close();
        return h.name;
      } catch (e) {
        if (e.name === "AbortError") return null;
        throw e;
      }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return name;
  }

  async function exportCsv() {
    let text = "﻿" + csvLine(["TIP", "DATUM", "POSETIOCI", "USERS", "SESSIONS", "SLUŠANJE_H", "PROSEČNA_SESIJA"]);
    for (const k of Object.keys(S.site).sort()) text += csvLine(["POSETE", dayStr(U.fromISO(k)), S.site[k], "", "", "", ""]);
    for (const item of [...S.zeno].sort(byMailDate)) {
      const shown = U.zenoMailDate(item);
      text += csvLine(["ZENO", shown ? dayStr(shown) : "", "", item.users ?? 0, item.sessions ?? 0, U.toFixedPy(Number(item.hours ?? 0), 2), U.fmtSession(item.hours ?? 0, item.sessions ?? 0)]);
    }
    try {
      if (!(await saveFile("undergrand_statistic.csv", text, "CSV", ".csv", "text/csv"))) return;
    } catch (e) { await alertBox("Izvoz", `Fajl nije sačuvan (možda je otvoren u drugom programu):\n${e.message || e}`); return; }
    await alertBox("Izvoz", `Kompletna statistika je sačuvana.\nPosete: ${Object.keys(S.site).length} dana\nZeno: ${S.zeno.length} nedeljnih izveštaja.`);
  }

  async function exportPeriodsCsv() {
    const days = S.periodDays, P = PERIODS[days], periods = U.zenoPeriods(S.zeno, days);
    if (!periods.length) { await alertBox("Zeno", "Nema Zeno podataka za izvoz."); return; }
    let text = "﻿" + csvLine(["TIP", "PERIOD", "NEDELJA", "USERS", "SESSIONS", "SLUŠANJE_H"]);
    for (const { start, end, items } of periods) {
      const period = `${U.fmtDate(start, "%d.%m.%Y.")} – ${U.fmtDate(end, "%d.%m.%Y.")}`;
      const sorted = [...items].sort((a, b) => (U.zenoWeekDate(a)?.getTime() ?? -Infinity) - (U.zenoWeekDate(b)?.getTime() ?? -Infinity));
      for (const item of sorted) {
        const shown = U.zenoMailDate(item);
        text += csvLine([P.csv, period, shown ? U.fmtDate(shown, "%d.%m.%Y.") : "", item.users ?? 0, item.sessions ?? 0, U.toFixedPy(Number(item.hours ?? 0), 2)]);
      }
    }
    try {
      if (!(await saveFile(`${P.file}.csv`, text, "CSV", ".csv", "text/csv"))) return;
    } catch (e) { await alertBox("Izvoz", `Fajl nije sačuvan (možda je otvoren u drugom programu):\n${e.message || e}`); return; }
    await alertBox("Izvoz", `Zeno pregled (${P.name}) je sačuvan.`);
  }

  // ---------- BACKUP I VRAĆANJE ----------
  async function ensureBackupDir() {
    if (B.hasDir && (await B.permitted("dir", true))) return true;
    if (!(await confirmBox("Folder za backup", "Folder za backup nije izabran ili pregledač nije dozvolio pristup. Izabrati ga sada?", "Izaberi", "Odustani"))) return false;
    try { await B.pickBackupDir(); return true; }
    catch (e) { if (e.name !== "AbortError") await alertBox("Folder za backup", `Folder nije izabran:\n${e.message || e}`); return false; }
  }

  async function manualBackup() {
    if (!(await ensureBackupDir())) return;
    try {
      const name = await B.createBackup();
      await alertBox("Kopija baze", `Kopija baze je napravljena.\n\n${name}`);
    } catch (e) { await alertBox("Kopija baze", `Kopija nije napravljena.\n${e.message || e}`); }
  }

  async function restoreBackup() {
    let picked;
    try { picked = await B.pickRestoreFile(); }
    catch (e) { if (e.name !== "AbortError") await alertBox("Vraćanje backupa", `Fajl nije otvoren:\n${e.message || e}`); return; }
    let restored;
    try {
      let raw;
      try { raw = JSON.parse(picked.text); } catch { throw new Error("Fajl nije ispravan JSON."); }
      if (!raw || typeof raw !== "object" || Array.isArray(raw) || !("site" in raw)) throw new Error("Izabrani fajl nije validna UnderGRAND JSON baza.");
      restored = U.parseStore(raw);
    } catch (e) { await alertBox("Vraćanje backupa", `Backup nije moguće učitati:\n${e.message}`); return; }
    if (!(await confirmBox("Vraćanje backupa",
      `Ovo će zameniti TRENUTNU bazu sadržajem izabranog backupa:\n\n${picked.name}\n\n` +
      "Trenutno stanje će prethodno biti sačuvano kao nova rezervna kopija, ali svi unosi napravljeni posle tog backupa " +
      "neće biti vidljivi dok se ne vrate ponovo.\n\nDa li si siguran/na da želiš da nastaviš?"))) return;
    // Bez rezervne kopije trenutnog stanja povratak ne može da se poništi, pa se u tom slučaju odustaje.
    if (!(await ensureBackupDir())) return;
    try { await B.createBackup(); }
    catch (e) { await alertBox("Vraćanje backupa", `Nije moguće napraviti rezervnu kopiju trenutnog stanja, pa vraćanje nije izvršeno.\n${e.message || e}`); return; }
    const old = { site: S.site, zeno: S.zeno, theme: S.theme };
    S.site = restored.site; S.zeno = restored.zeno; S.theme = restored.theme;
    if (!(await persist({ backup: false }))) { Object.assign(S, old); return; }
    if (restored.theme !== "svetla") S.darkName = restored.theme;
    setUiTheme(restored.theme === "svetla" ? "light" : "dark");
    S.selected = U.today();
    refresh();
    await alertBox("Vraćanje backupa", `JSON backup je vraćen.\n\n${picked.name}`);
  }

  // ---------- ZENO UVOZ ----------
  async function importEmlFiles(files) {
    const items = [], unreadable = [];
    let notZeno = 0;
    for (const f of files) {
      let item;
      try { item = await M.readEml(f); }
      catch (e) { console.error("Greška pri čitanju Zeno e-maila", f.name, e); unreadable.push(f.name); continue; }
      if (item) items.push(item); else notZeno++;
    }
    if (!items.length) {
      let text = `Nisam pronašao kompletan Zeno izveštaj (USERS, SESSIONS i LISTENING TIME), ili je mail stariji od ${U.ZENO_FIRST_YEAR}. godine.`;
      if (unreadable.length) text += "\n\nNije moguće pročitati: " + unreadable.slice(0, 5).join(", ");
      await alertBox("Zeno", text);
      return;
    }
    const before = S.zeno;
    S.zeno = U.mergeZeno(S.zeno, items);
    if (!(await persist())) { S.zeno = before; return; }
    const newest = items.reduce((a, b) => (b.week > a.week ? b : a));
    S.zenoWeek = newest.week;
    refresh();
    showTab("zeno");
    if (files.length === 1) {
      await alertBox("Zeno", `Uvezen je Zeno nedeljni izveštaj za ${newest.week}.\nUsers: ${U.fmtInt(newest.users)}\nSessions: ${U.fmtInt(newest.sessions)}\nListening Time: ${U.fmtHours(newest.hours)}`);
      return;
    }
    let text = `Uvezeno je ${new Set(items.map((i) => i.week)).size} nedeljnih Zeno izveštaja iz ${files.length} fajlova (u bazi ukupno ${S.zeno.length}).`;
    if (notZeno) text += `\nPreskočeno (nije Zeno izveštaj): ${notZeno}.`;
    if (unreadable.length) text += `\nNije moguće pročitati: ${unreadable.length}.`;
    await alertBox("Zeno", text);
  }

  async function importArchive(file) {
    let cancelled = false, setText, setBar;
    const prog = modal({
      title: "Uvoz Zeno arhive", html: `<p class="m-text" id="pg-text">Otvaram arhivu…</p><div class="progress"><div id="pg-bar"></div></div>`,
      buttons: [{ label: "Prekini", value: null, onClick: (dlg) => { cancelled = true; $("#pg-text", dlg).textContent = "Prekidam…"; return false; } }],
      init: (dlg) => {
        dlg.dataset.locked = "1";
        setText = (t) => { $("#pg-text", dlg).textContent = t; };
        setBar = (f) => { $("#pg-bar", dlg).style.width = `${Math.round(Math.min(1, f) * 100)}%`; };
      },
    });
    const closeProg = () => { const d = document.querySelector("dialog[data-locked]"); if (d) { d.close(); d.remove(); } };
    let result;
    try {
      result = await M.readArchive(file, (text, frac) => { if (!cancelled) { setText(text); setBar(frac); } return !cancelled; });
    } catch (e) {
      closeProg();
      if (e instanceof M.ImportCancelled) return;
      console.error("Greška pri uvozu Zeno arhive", e);
      await alertBox("Zeno", `Greška pri uvozu:\n${e.message || e}`);
      return;
    }
    closeProg();
    void prog;
    const { items, total, failed } = result;
    if (!items.length) {
      await alertBox("Zeno", `Nisam pronašao nijedan kompletan Zeno nedeljni izveštaj (od ${U.ZENO_FIRST_YEAR}. godine nadalje). Pregledano poruka: ${total}.` +
        (failed ? `\n\nPoruka sa greškom pri obradi: ${failed}.` : ""));
      return;
    }
    // Arhiva ne briše postojeće podatke: spaja se po obračunskoj nedelji.
    const before = S.zeno;
    S.zeno = U.mergeZeno(S.zeno, items);
    if (!(await persist())) { S.zeno = before; return; }
    S.zenoWeek = S.zeno[S.zeno.length - 1].week;
    refresh();
    showTab("zeno");
    let text = `Pronađeno ${new Set(items.map((i) => i.week)).size} nedeljnih Zeno izveštaja (u bazi ukupno ${S.zeno.length}).\n` +
      `Period: ${S.zeno[0].week} - ${S.zeno[S.zeno.length - 1].week}.\nPregledano poruka: ${total}.`;
    if (failed) text += `\nPoruka sa greškom pri obradi: ${failed}.`;
    await alertBox("Zeno", text);
  }

  // Prevučeni ili izabrani fajlovi: .eml (jedan ili više), .mbox i Google Takeout .zip.
  async function importFiles(files) {
    const ext = (f) => f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    const emls = files.filter((f) => ext(f) === ".eml"), archives = files.filter((f) => [".zip", ".mbox"].includes(ext(f)));
    const ignored = files.length - emls.length - archives.length;
    if (!emls.length && !archives.length) { await alertBox("Zeno", "Podržani su Zeno e-mail (.eml), .mbox i Google Takeout .zip fajlovi."); return; }
    if (emls.length) await importEmlFiles(emls);
    for (const a of archives) await importArchive(a);
    if (ignored) await alertBox("Zeno", `Nepodržanih fajlova preskočeno: ${ignored}.`);
  }
  $("#f-eml").addEventListener("change", (e) => { const f = [...e.target.files]; e.target.value = ""; if (f.length && S.ready) importEmlFiles(f); });
  $("#f-arch").addEventListener("change", (e) => { const f = [...e.target.files]; e.target.value = ""; if (f.length && S.ready) importFiles(f); });

  // Prevlačenje bilo gde u prozor.
  const drop = $("#drop");
  let depth = 0;
  const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
  window.addEventListener("dragenter", (e) => { if (!hasFiles(e)) return; e.preventDefault(); depth++; if (S.ready) drop.hidden = false; });
  window.addEventListener("dragover", (e) => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = S.ready ? "copy" : "none"; });
  window.addEventListener("dragleave", (e) => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) drop.hidden = true; });
  window.addEventListener("drop", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault(); depth = 0; drop.hidden = true;
    if (S.ready) importFiles([...e.dataTransfer.files]);
  });

  // ---------- IZVEŠTAJI: nedeljni ili Zeno (4 nedelje / tromesečje); tekst, štampa ili PDF ----------
  const REPORT_KINDS = [["week", "Nedeljni"], ["28", "Zeno 4 nedelje"], ["84", "Zeno tromesečje"]];

  function reportChoices(kind) {
    if (kind === "week") {
      const cur = U.mondayFor(U.today());
      const set = new Map([[cur.getTime(), cur]]);
      for (const m of U.weekMondays(S.site)) set.set(m.getTime(), m);
      return [...set.values()].sort((a, b) => b - a).slice(0, 26).map((m) => {
        const span = `${U.fmtDate(m, "%d.%m.")} – ${U.fmtDate(U.addDays(m, 6), "%d.%m.%Y.")}`;
        const label = U.sameDay(m, cur) ? `Tekuća nedelja (${span})` : U.sameDay(m, U.addDays(cur, -7)) ? `Prethodna nedelja (${span})` : span;
        return { value: m, label };
      });
    }
    const days = +kind, P = PERIODS[days];
    return U.zenoPeriods(S.zeno, days).map((p) => ({
      value: p, label: periodLabel(p) + (p.items.length < P.n ? ` · ${p.items.length} od ${P.n} izveštaja` : ""),
    }));
  }

  async function reportDialog(kind = "week") {
    let choices = [], chosen = null;
    const fill = (dlg) => {
      choices = reportChoices(kind);
      let sel = 0;
      if (kind !== "week" && +kind === S.periodDays && S.periodStart) sel = Math.max(0, choices.findIndex((c) => U.sameDay(c.value.start, S.periodStart)));
      chosen = choices[sel] ? choices[sel].value : null;
      dlg.querySelectorAll("[data-kind]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.kind === kind));
      $("#rep-list", dlg).innerHTML = choices.length
        ? `<p class="muted" style="margin:0 0 6px">${kind === "week" ? "Za koju nedelju?" : "Za koji period?"}</p><div class="m-list">${choices.map((c, i) =>
          `<label><input type="radio" name="rep" value="${i}" ${i === sel ? "checked" : ""}>${esc(c.label)}</label>`).join("")}</div>`
        : `<p class="hint">Još nema Zeno podataka.</p>`;
      dlg.querySelectorAll('input[name="rep"]').forEach((r) => r.addEventListener("change", () => { chosen = choices[+r.value].value; }));
      dlg.querySelectorAll(".m-foot [data-b]:not(.left)").forEach((b) => { b.disabled = !choices.length; });
    };
    const fmt = await modal({
      title: "Izveštaj",
      html: `<div class="seg" id="rep-kind" role="group" style="margin-bottom:12px">${REPORT_KINDS.map(([k, l]) => `<button type="button" data-kind="${k}">${l}</button>`).join("")}</div>
        <div id="rep-list"></div>
        <p class="hint" style="margin-top:10px">Štampaj: izveštaj ide na štampač (A4, jedna strana). PDF: u istom prozoru kao štampač izaberi „Sačuvaj kao PDF“.</p>`,
      buttons: [{ label: "Otkaži", value: null, left: true }, { label: "Tekst", value: "txt" }, { label: "Štampaj", value: "print" }, { label: "PDF", value: "pdf", cls: "acc" }],
      init: (dlg) => {
        fill(dlg);
        $("#rep-kind", dlg).addEventListener("click", (e) => { const b = e.target.closest("[data-kind]"); if (b) { kind = b.dataset.kind; fill(dlg); } });
        dlg.querySelector(".m-foot .acc").focus();
      },
    });
    if (!fmt || !chosen) return;
    const ver = window.APP_VERZIJA;
    let html, text, name;
    if (kind === "week") {
      const summary = U.weekSummary(S.site, chosen), zeno = U.zenoForWeek(S.zeno, chosen);
      html = () => R.html(summary, zeno, ver, new Date());
      text = () => R.txt(summary);
      name = `undergrand_nedeljni_izvestaj_${U.iso(chosen)}`;
    } else {
      const days = +kind, P = PERIODS[days], periods = U.zenoPeriods(S.zeno, days);
      const data = { period: chosen, stats: U.zenoPeriodStats(periods, chosen, days), weeks: U.zenoPeriodRecords(S.zeno, chosen.start, days), n: P.n, title: P.title, name: P.name };
      html = () => R.zenoHtml(data, ver, new Date());
      text = () => R.zenoTxt(data);
      name = `${P.file}_${U.iso(chosen.start)}`;
    }
    if (fmt === "pdf" || fmt === "print") { await R.print(html(), name); return; }
    try {
      const saved = await saveFile(`${name}.txt`, text(), "Tekst", ".txt", "text/plain");
      if (saved) await alertBox("Izveštaj", `Izveštaj je sačuvan:\n${saved}`);
    } catch (e) { await alertBox("Izveštaj", `Fajl nije sačuvan:\n${e.message || e}`); }
  }
  // ---------- HISTORY ----------
  $("#btn-history").addEventListener("click", () => {
    const web = [...(window.APP_VERZIJE || [])].reverse().map((x) => {
      const [y, m, d] = x.datum.split("-");
      return `\n\nVERZIJA ${x.v} (web)\n========================================\n${+d}.${+m}.${y}.\n\n${x.izmene.map((t) => `- ${t}`).join("\n")}`;
    }).join("");
    modal({
      wide: true,
      html: `<div class="h-top"><h2>ISTORIJA RAZVOJA</h2><span class="h-ver">v${esc(window.APP_VERZIJA)}</span></div>
        <p class="muted">Sve razvojne verzije aplikacije - od prve funkcionalne verzije do trenutne.</p>
        <pre class="history-text">${esc((window.UG_ISTORIJA || "version_history.txt nije pronađen.") + web)}</pre>`,
      buttons: [{ label: "Zatvori", value: true, cls: "acc" }],
    });
  });

  // ---------- BAZA (podešavanja) ----------
  $("#btn-baza").addEventListener("click", async () => {
    const a = await modal({
      title: "Baza i backup",
      html: `<div class="info-rows">
          <div class="info-row"><div><span class="info-label">BAZA</span><b>${esc(B.fileName || "-")}</b></div>
            <button type="button" class="pill small" data-pick="db">Promeni</button></div>
          <div class="info-row"><div><span class="info-label">FOLDER ZA BACKUP</span><b>${esc(B.dirName || "nije izabran")}</b></div>
            <button type="button" class="pill small" data-pick="dir">Promeni</button></div>
        </div>
        <p class="hint">Pre svakog čuvanja pravi se kopija baze u folder za backup: poslednjih 10 i po jedna za svaki od poslednjih 30 dana.</p>`,
      buttons: [{ label: "Učitaj ponovo", value: "reload", left: true }, { label: "Zatvori", value: null, cls: "acc" }],
      init: (dlg, done) => {
        dlg.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => done(b.dataset.pick)));
        dlg.querySelector(".m-foot .acc").focus();
      },
    });
    try {
      if (a === "db") { await B.pickDatabase(); await start(); }
      else if (a === "dir") { await B.pickBackupDir(); toast(`Folder za backup: ${B.dirName}`); }
      else if (a === "reload") { await start(); toast("Baza je ponovo učitana."); }
    } catch (e) { if (e.name !== "AbortError") await alertBox("Baza", `${e.message || e}`); }
  });

  // ---------- NOVI DAN: ako aplikacija ostane otvorena preko ponoći ----------
  function checkNewDay() {
    if (!S.ready) return;
    const t = U.today();
    if (U.sameDay(t, S.today)) return;
    if (U.sameDay(S.selected, S.today)) S.selected = t;   // korisnik nije birao drugi dan
    refresh();
  }
  setInterval(checkNewDay, 60000);
  window.addEventListener("focus", checkNewDay);

  boot();
})();
