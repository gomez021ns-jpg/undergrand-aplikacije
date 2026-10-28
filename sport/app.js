// Rutiranje (#/ = pregled, #/<liga>/<kartica>/<arg>), zaglavlje, automatsko osvežavanje.
(() => {
  const { leagues, esc, loading, errorBox, fmt } = SC;
  const main = document.getElementById("main");
  const nav = document.getElementById("league-nav");
  const subbar = document.getElementById("subbar");
  const foot = document.getElementById("foot");
  const LIVE_REFRESH = 30000, IDLE_REFRESH = 5 * 60000;
  let timer = null;

  // --- tema ---
  const themeBtn = document.getElementById("theme-btn");
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* bez trajnog pamćenja */ } },
  };
  function applyTheme(t) {
    if (t) document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const isDark = () => (document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches);
  // Dugme pokazuje temu na koju se prelazi: sunce u tamnoj, mesec u svetloj.
  function themeIcon() {
    const label = isDark() ? "Svetla tema" : "Tamna tema";
    themeBtn.innerHTML = isDark() ? SUN : MOON;
    themeBtn.title = label; themeBtn.setAttribute("aria-label", label);
  }
  applyTheme(store.get("sc-theme"));
  themeIcon();
  themeBtn.addEventListener("click", () => {
    const t = isDark() ? "light" : "dark";
    applyTheme(t);
    store.set("sc-theme", t);
    themeIcon();
  });

  function parse() {
    const [lid, tab, ...rest] = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const league = leagues.find((l) => l.id === lid);
    if (!league) return { league: null };
    const t = league.tabs.find((x) => x.id === tab) || league.tabs[0];
    return { league, tab: t, arg: rest.join("/") || "" };
  }

  function renderChrome(route) {
    // Sedam jednakih dugmadi: Pregled + lige, svaka sa ikonicom i obrubom u svojoj boji.
    nav.innerHTML = `<a href="#/" class="nav-home${route.league ? "" : " active"}"><span class="nav-ic" aria-hidden="true">🏠</span>Pregled</a>` +
      leagues.map((l) => `<a href="#/${l.id}" style="--acc:${l.accent}" class="${route.league === l ? "active" : ""}"><span class="nav-ic" aria-hidden="true">${l.icon || ""}</span>${esc(l.short)}<i class="dot"></i></a>`).join("");
    if (route.league) {
      document.body.style.setProperty("--acc", route.league.accent);
      subbar.className = `subbar${route.league.visual ? ` vis v-${route.league.visual}` : ""}`;
      subbar.innerHTML = `<div class="wrap subbar-in"><h1>${esc(route.league.name)}</h1><nav class="tabs">${route.league.tabs.map((t) =>
        `<a href="#/${route.league.id}/${t.id}" class="${t === route.tab ? "active" : ""}">${esc(t.label)}</a>`).join("")}</nav></div>`;
      document.title = `${route.league.name} · UnderGRAND Sport`;
    } else {
      document.body.style.removeProperty("--acc");
      subbar.className = "subbar";
      subbar.innerHTML = "";
      document.title = "UnderGRAND Sport";
    }
    const sources = route.league ? [route.league.source] : leagues.map((l) => l.source);
    const uniq = [...new Map(sources.map((s) => [s.label, s])).values()];
    foot.innerHTML = `Podaci: ${uniq.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(", ")}
      · osveženo u ${fmt.time.format(new Date())} · vremena su po tvom lokalnom vremenu`;
  }

  // --- kartice „Uživo sada / Uskoro“ ---
  // Uživo: sve što trenutno traje (najviše 8, naizmenično po ligama). Kad je toga malo ili ništa:
  // naredni događaj svake lige. Klik na karticu otvara „Detalji“ (ili F1 uživo).
  function soccerMinute(text) {
    if (/poluvreme/i.test(text)) return 50;
    const m = String(text || "").match(/(\d+)'(?:\+(\d+))?/);
    return m ? Math.min(100, Math.round(((+m[1] + (+m[2] || 0)) / 90) * 100)) : 0;
  }

  function quarterBars(teams) {
    const [a, b] = teams;
    const n = Math.max(a.lines?.length || 0, b.lines?.length || 0);
    if (!n) return "";
    const max = Math.max(1, ...[...(a.lines || []), ...(b.lines || [])].map(Number).filter((x) => !isNaN(x)));
    const h = (v) => `${Math.round(((+v || 0) / max) * 100)}%`;
    return `<div class="ec-q" title="Poeni po delovima utakmice (${esc(a.abbr)} / ${esc(b.abbr)})">${Array.from({ length: n }, (_, i) =>
      `<div><span style="height:${h(a.lines?.[i])}"></span><span class="b" style="height:${h(b.lines?.[i])}"></span><small>${i < 4 ? i + 1 : "P"}</small></div>`).join("")}</div>`;
  }

  function eventCard(ev) {
    const l = ev.league;
    const live = ev.status === "in";
    const badge = live ? `<span class="ec-badge live">UŽIVO</span>` : `<span class="ec-badge">${esc(SC.when(ev.start))}</span>`;
    const top = `<div class="ec-top"><span class="ec-ic" aria-hidden="true">${l.icon || ""}</span><b>${esc(l.name)}</b>${badge}</div>`;
    if (ev.kind === "f1") {
      const s = ev.sum;
      const body = live
        ? `<p class="ec-sub">${esc(s.session)} · ${esc(ev.race)}${s.track && !/Zelena/.test(s.track) ? ` · <b class="ec-warn">${esc(s.track)}</b>` : ""}</p>
          ${s.rows.map((r) => `<div class="ec-f1"><span class="ec-p">${esc(r.pos)}</span><b><i style="background:${esc(r.color || "var(--muted)")}"></i>${esc(r.code)}</b><span class="ec-gap">${esc(r.gap === "Vodi" ? "vodi" : r.gap)}</span></div>`).join("")}
          ${s.lap ? `<div class="ec-prog"><span>Krug ${s.lap.cur} / ${s.lap.total}</span><div class="bar"><i style="width:${Math.round((100 * s.lap.cur) / s.lap.total)}%"></i></div></div>`
            : s.clock ? `<div class="ec-prog"><span>Preostalo ${esc(s.clock)}</span></div>` : ""}`
        : `<p class="ec-sub">${esc(ev.race)}</p><p class="ec-big">${esc(ev.session)}</p><p class="ec-sub">${esc(ev.place)}</p>`;
      return `<a class="ev-card v-f1" style="--c:${l.accent}" href="#/f1/${live ? "uzivo" : "kalendar"}">${top}${body}</a>`;
    }
    const [a, b] = ev.teams;
    const scored = ev.status !== "pre";
    const row = (t, o) => `<div class="ec-row${scored && +t.score > +o.score ? " lead" : ""}">${SC.logo(t.logo, t.abbr)}<span class="ec-name">${esc(t.name)}</span><span class="ec-sc">${scored ? esc(t.score) : ""}</span></div>`;
    const sub = live ? ev.statusText : [ev.label, ev.venue].filter(Boolean).join(" · ");
    let bottom = "";
    if (live && l.visual === "fb") {
      const p = soccerMinute(ev.statusText);
      bottom = `<div class="ec-prog"><span>${esc(ev.statusText)}</span><div class="bar"><i style="width:${p}%"></i></div></div>`;
    } else if (scored) bottom = quarterBars(ev.teams);
    return `<a class="ev-card v-${l.visual}" style="--c:${l.accent}" href="#/${l.id}"${ev.detail ? ` data-detail="${esc(ev.detail)}"` : ""}>
      ${top}<p class="ec-sub">${esc(sub || "")}</p>${row(a, b)}${row(b, a)}${bottom}</a>`;
  }

  async function renderEvents(box) {
    const lists = await Promise.all(leagues.filter((l) => l.events).map((l) =>
      l.events().then((list) => list.map((ev) => ({ ...ev, league: l }))).catch(() => [])));
    const now = Date.now();
    // Naizmenično po ligama, da jedna liga (npr. NFL nedeljom) ne zauzme sve kartice.
    const liveBy = lists.map((list) => list.filter((ev) => ev.status === "in"));
    const live = [];
    for (let i = 0; live.length < 8 && liveBy.some((x) => x[i]); i++) for (const x of liveBy) if (x[i] && live.length < 8) live.push(x[i]);
    const next = lists.map((list) => list.filter((ev) => ev.status === "pre" && +ev.start > now).sort((x, y) => x.start - y.start)[0])
      .filter(Boolean).sort((x, y) => x.start - y.start);
    // Četiri kartice u redu (kao na skici); kad uživo ima manje od 4, dopuni narednim događajima.
    const cards = live.length >= 4 ? live : [...live, ...next].slice(0, 4);
    box.querySelector(".ev-h h2").textContent = live.length ? "Uživo sada" : "Uskoro";
    box.classList.toggle("is-live", live.length > 0);
    const grid = box.querySelector(".ev-grid");
    grid.style.setProperty("--n", Math.max(Math.min(cards.length, 4), 1));
    grid.innerHTML = cards.length ? cards.map(eventCard).join("") : `<p class="empty">Trenutno nema događaja.</p>`;
    return { live: live.length > 0 };
  }

  // --- početna strana ---
  async function renderHome(el) {
    el.innerHTML = `<section class="ev-sec"><div class="ev-h"><span class="beacon" aria-hidden="true"></span><h2>Uživo sada</h2></div>
        <div class="ev-grid">${loading()}</div></section>
      <div class="home-grid">${leagues.map((l) => `
      <section class="panel${l.visual ? ` vis v-${l.visual}` : ""}" style="--acc:${l.accent}" data-id="${l.id}">
        <header class="panel-h"><a href="#/${l.id}"><span class="nav-ic" aria-hidden="true">${l.icon || ""}</span>${esc(l.name)}</a>
          <a class="more" href="#/${l.id}/${l.tabs[1]?.id || l.tabs[0].id}">${esc(l.tabs[1]?.label || "Više")} ›</a></header>
        <div class="panel-b">${loading()}</div>
      </section>`).join("")}</div>`;
    const evBox = el.querySelector(".ev-sec");
    const [ev, ...results] = await Promise.all([
      renderEvents(evBox).catch((e) => { evBox.querySelector(".ev-grid").innerHTML = errorBox(e); return {}; }),
      ...leagues.map(async (l) => {
        const body = el.querySelector(`.panel[data-id="${l.id}"] .panel-b`);
        try { return await l.overview(body); } catch (e) { body.innerHTML = errorBox(e); return {}; }
      }),
    ]);
    return { live: !!ev?.live || results.some((r) => r?.live) };
  }

  async function renderRoute(route, el) {
    if (!route.league) return renderHome(el);
    try { return await route.tab.render(el, route.arg); } catch (e) { el.innerHTML = errorBox(e); return {}; }
  }

  function schedule(route, live) {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      // Tiho osvežavanje: crta se u nevidljiv element pa se zameni kad je gotovo.
      const fresh = document.createElement("div");
      const r = await renderRoute(route, fresh);
      if (route.token !== current) return;
      main.replaceChildren(fresh);
      renderChrome(route);
      schedule(route, r?.live);
    }, live ? LIVE_REFRESH : IDLE_REFRESH);
  }

  let current = 0;
  async function go() {
    clearTimeout(timer);
    const route = parse();
    route.token = ++current;
    renderChrome(route);
    const view = document.createElement("div");
    view.innerHTML = loading();
    main.replaceChildren(view);
    const r = await renderRoute(route, view);
    if (route.token === current) schedule(route, r?.live);
  }

  window.addEventListener("hashchange", () => { go(); window.scrollTo(0, 0); });
  go();
})();
