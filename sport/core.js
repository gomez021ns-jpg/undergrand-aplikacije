// Zajednički pomoćnici: preuzimanje podataka, formatiranje, kartice utakmica, tabele.
// Svaka liga se registruje preko SC.registerLeague({...}) - vidi leagues/*.js.
window.SC = (() => {
  const LOC = "sr-Latn-RS";
  const leagues = [];
  const cache = new Map();

  function registerLeague(def) { leagues.push(def); }

  // Keš u memoriji da prelazak između kartica ne povlači iste podatke ponovo.
  function getJSON(url, ttl = 60000) {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.t < ttl) return hit.p;
    const p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    cache.set(url, { t: Date.now(), p });
    p.catch(() => cache.delete(url));
    return p;
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

  const fmt = {
    time: new Intl.DateTimeFormat(LOC, { hour: "2-digit", minute: "2-digit" }),
    dayShort: new Intl.DateTimeFormat(LOC, { weekday: "short", day: "numeric", month: "short" }),
    dayLong: new Intl.DateTimeFormat(LOC, { weekday: "long", day: "numeric", month: "long" }),
    dayMonth: new Intl.DateTimeFormat(LOC, { day: "numeric", month: "short" }),
  };

  function dayDiff(d) {
    const a = new Date(d); a.setHours(0, 0, 0, 0);
    const b = new Date(); b.setHours(0, 0, 0, 0);
    return Math.round((a - b) / 864e5);
  }
  function relDay(d) {
    const n = dayDiff(d);
    if (n === 0) return "Danas";
    if (n === 1) return "Sutra";
    if (n === -1) return "Juče";
    return cap(fmt.dayShort.format(d));
  }
  function dayHeading(d) {
    const n = dayDiff(d);
    const long = fmt.dayLong.format(d);
    return Math.abs(n) <= 1 ? `${relDay(d)}, ${long}` : cap(long);
  }
  const when = (d) => `${relDay(d)} · ${fmt.time.format(d)}`;

  function logo(src, abbr) {
    if (!src) return `<span class="logo logo-ph">${esc((abbr || "?").slice(0, 3))}</span>`;
    return `<img class="logo" src="${esc(src)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`;
  }

  // Normalizovana utakmica:
  // { id, start: Date, status: "pre"|"in"|"post"|"off", statusText, label, venue, tv, link,
  //   teams: [{ name, abbr, logo, score, winner, record, lines: [] }, …] }
  function linesTable(g) {
    const n = Math.max(...g.teams.map((t) => t.lines.length));
    const head = Array.from({ length: n }, (_, i) => `<th>${i < 4 ? i + 1 : "P" + (i - 3)}</th>`).join("");
    const rows = g.teams.map((t) =>
      `<tr><td>${esc(t.abbr)}</td>${Array.from({ length: n }, (_, i) => `<td>${esc(t.lines[i] ?? "")}</td>`).join("")}</tr>`).join("");
    return `<table class="g-lines"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function gameCard(g, opt = {}) {
    let st;
    if (g.status === "in") st = `<span class="live-dot"></span>${esc(g.statusText || "Uživo")}`;
    else if (g.status === "post") st = esc(g.statusText || "Kraj") + (opt.day ? ` · ${esc(relDay(g.start))}` : "");
    else if (g.status === "off") st = esc(g.statusText || "Odloženo");
    else st = esc(opt.day ? when(g.start) : fmt.time.format(g.start));
    const showScore = g.status === "in" || g.status === "post";
    const teams = g.teams.map((t) => `
      <div class="g-team${t.winner ? " win" : ""}">
        ${logo(t.logo, t.abbr)}
        <span class="g-name">${esc(t.name)}</span>
        ${t.record ? `<span class="g-rec">${esc(t.record)}</span>` : ""}
        <span class="g-score">${showScore ? esc(t.score) : ""}</span>
      </div>`).join("");
    const lines = !opt.compact && showScore && g.teams[0].lines?.length ? linesTable(g) : "";
    const foot = opt.compact ? "" : [g.venue, g.tv].filter(Boolean).map(esc).join(" · ");
    // Liga sa sopstvenim prikazom detalja (registerDetail) otvara prozor u aplikaciji; ostale vode na ESPN.
    const link = opt.compact ? ""
      : g.detail ? `<button type="button" class="linkbtn" data-detail="${esc(g.detail)}">Detalji</button>`
      : g.link ? `<a href="${esc(g.link)}" target="_blank" rel="noopener">Detalji ↗</a>` : "";
    return `<article class="game ${g.status}">
      <header class="g-head"><span class="g-status">${st}</span>${g.label ? `<span class="g-label">${esc(g.label)}</span>` : ""}</header>
      ${teams}${lines}
      ${foot || link ? `<footer class="g-foot"><span>${foot}</span>${link}</footer>` : ""}
    </article>`;
  }

  // Lista utakmica grupisana po lokalnom datumu.
  function gamesByDay(games) {
    if (!games.length) return `<p class="empty">Nema utakmica.</p>`;
    const groups = new Map();
    for (const g of [...games].sort((a, b) => a.start - b.start)) {
      const k = g.start.toDateString();
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(g);
    }
    return [...groups.values()].map((list) =>
      `<h3 class="day-h">${esc(dayHeading(list[0].start))}</h3>
       <div class="games">${list.map((g) => gameCard(g)).join("")}</div>`).join("");
  }

  // Pregled za početnu stranu: uživo, poslednji rezultati, predstojeće.
  function overviewGames(games, n = 4) {
    const live = games.filter((g) => g.status === "in");
    const recent = games.filter((g) => g.status === "post").sort((a, b) => b.start - a.start).slice(0, n);
    const next = games.filter((g) => g.status === "pre").sort((a, b) => a.start - b.start).slice(0, n);
    const sec = (title, list) => list.length
      ? `<h4 class="ov-h">${title}</h4><div class="games compact">${list.map((g) => gameCard(g, { compact: true, day: true })).join("")}</div>`
      : "";
    const html = sec("Uživo", live) + sec("Poslednji rezultati", recent) + sec("Predstojeće", next);
    return { html: html || `<p class="empty">Trenutno nema utakmica.</p>`, live: live.length > 0 };
  }

  // Tabela: cols = [{ label, title?, cls? }], rows = [{ cls?, cells: [html…] }]
  function table(cols, rows, cls = "") {
    const th = cols.map((c) => `<th class="${c.cls || ""}"${c.title ? ` title="${esc(c.title)}"` : ""}>${esc(c.label)}</th>`).join("");
    const tr = rows.map((r) => `<tr class="${r.cls || ""}"${r.style ? ` style="${esc(r.style)}"` : ""}>${r.cells.map((c, i) => `<td class="${cols[i].cls || ""}">${c}</td>`).join("")}</tr>`).join("");
    return `<div class="tbl-wrap"><table class="st ${cls}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
  }

  function select(options, current, cls = "") {
    // options: [{ value, label, group? }]
    let html = "", group = null;
    for (const o of options) {
      if (o.group !== group) {
        if (group !== null) html += "</optgroup>";
        if (o.group) html += `<optgroup label="${esc(o.group)}">`;
        group = o.group;
      }
      html += `<option value="${esc(o.value)}"${o.value === current ? " selected" : ""}>${esc(o.label)}</option>`;
    }
    if (group) html += "</optgroup>";
    return `<select class="${cls}">${html}</select>`;
  }

  // Navigacija prethodno / izbor / sledeće; onChange dobija izabranu vrednost.
  function pager(el, options, current, hrefFor, extra = "") {
    const i = options.findIndex((o) => o.value === current);
    const prev = i > 0 ? options[i - 1] : null;
    const next = i >= 0 && i < options.length - 1 ? options[i + 1] : null;
    el.innerHTML = `<div class="pager">
      <a class="btn${prev ? "" : " disabled"}" href="${prev ? esc(hrefFor(prev.value)) : "#"}" aria-label="Prethodno">‹</a>
      ${select(options, current, "pager-sel")}
      <a class="btn${next ? "" : " disabled"}" href="${next ? esc(hrefFor(next.value)) : "#"}" aria-label="Sledeće">›</a>
      ${extra}
    </div>`;
    el.querySelector("select").addEventListener("change", (e) => { location.hash = hrefFor(e.target.value); });
  }

  const loading = () => `<div class="loading"><span class="spinner"></span>Učitavanje…</div>`;
  const errorBox = (err) => `<div class="error-box"><b>Ne mogu da učitam podatke.</b>
    <span>Proveri internet vezu i pokušaj ponovo. (${esc(err?.message || err)})</span>
    <button class="btn" type="button" onclick="SC.reload()">Pokušaj ponovo</button></div>`;

  // ------------------------------------------------------------ detalji utakmice (prozor)
  // registerDetail(ligaId, render(el, eventId) → { live }); kartica dobija g.detail = "ligaId:eventId".
  const detailRenderers = new Map();
  let detailTimer = null;

  function registerDetail(leagueId, render) { detailRenderers.set(leagueId, render); }

  async function openDetail(key) {
    const [leagueId, eventId] = key.split(":");
    const render = detailRenderers.get(leagueId);
    if (!render) return;
    let dlg = document.getElementById("game-dlg");
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.id = "game-dlg";
      dlg.className = "gd";
      dlg.innerHTML = `<button type="button" class="gd-close" aria-label="Zatvori">×</button><div class="gd-body"></div>`;
      dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest(".gd-close")) dlg.close(); });
      dlg.addEventListener("close", () => clearTimeout(detailTimer));
      document.body.append(dlg);
    }
    const body = dlg.querySelector(".gd-body");
    const league = leagues.find((l) => l.id === leagueId);
    dlg.style.setProperty("--acc", league?.accent || "");
    body.innerHTML = loading();
    dlg.dataset.key = key;
    if (!dlg.open) dlg.showModal();
    const run = async (first) => {
      clearTimeout(detailTimer);
      try {
        // Osvežavanje crta u nevidljiv element pa menja sadržaj, da prozor ne treperi.
        const tmp = document.createElement("div");
        const r = await render(tmp, eventId);
        if (!dlg.open || dlg.dataset.key !== key) return;
        body.replaceChildren(...tmp.childNodes);
        if (r?.live) detailTimer = setTimeout(() => run(false), 30000);
      } catch (e) {
        if (first) body.innerHTML = errorBox(e);
        else detailTimer = setTimeout(() => run(false), 30000);
      }
    };
    run(true);
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-detail]");
    if (b) { e.preventDefault(); openDetail(b.dataset.detail); }
  });

  return {
    leagues, registerLeague, getJSON, esc, cap, fmt, relDay, dayHeading, when, logo,
    gameCard, gamesByDay, overviewGames, table, select, pager, loading, errorBox, registerDetail, openDetail,
    reload: () => window.dispatchEvent(new HashChangeEvent("hashchange")),
  };
})();
