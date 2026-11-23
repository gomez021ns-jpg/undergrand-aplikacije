// Lige sa ESPN javnog API-ja (site.api.espn.com). Nova ESPN liga = još jedan SC.espnLeague({...}) poziv
// (npr. path "hockey/nhl", "baseball/mlb", "soccer/esp.1"). Fudbalske lige su u leagues/fudbal.js.
(() => {
  const { esc, getJSON, gamesByDay, overviewGames, table, pager, logo } = SC;

  function statusText(st) {
    const t = st.type;
    if (t.state === "pre") return "";
    if (t.state === "post") {
      if (/POSTPONED/.test(t.name)) return "Odloženo";
      if (/CANCELED/.test(t.name)) return "Otkazano";
      if (/PEN/.test(t.name)) return "Kraj (penali)";
      if (/AET|EXTRA/.test(t.name)) return "Kraj (prod.)";
      return /OT/.test(t.shortDetail) ? "Kraj (prod.)" : "Kraj";
    }
    if (/HALFTIME/.test(t.name)) return "Poluvreme";
    return t.shortDetail;
  }

  function normalize(e, cfg) {
    const c = e.competitions[0];
    const t = e.status.type;
    const off = /POSTPONED|CANCELED/.test(t.name);
    // Američka konvencija: gost gore, domaćin dole („gost @ domaćin“); u fudbalu (homeFirst) domaćin gore.
    const first = cfg.homeFirst ? "home" : "away";
    const comps = [...c.competitors].sort((a, b) => (a.homeAway === first ? 0 : 1) - (b.homeAway === first ? 0 : 1));
    return {
      id: e.id,
      start: new Date(e.date),
      status: off ? "off" : t.state,
      statusText: statusText(e.status),
      label: cfg.gameLabel(e, c),
      venue: c.venue?.fullName,
      tv: (c.broadcasts || []).flatMap((b) => b.names || []).join(", "),
      link: e.links?.[0]?.href,
      detail: cfg.detail ? `${cfg.id}:${e.id}` : null,
      teams: comps.map((x) => ({
        name: x.team.displayName,
        abbr: x.team.abbreviation,
        logo: x.team.logo,
        score: x.shootoutScore != null ? `${x.score} (${x.shootoutScore})` : x.score,
        winner: !!x.winner,
        record: cfg.noRecord ? "" : x.records?.[0]?.summary,
        lines: cfg.noLines ? [] : (x.linescores || []).map((l) => l.displayValue ?? l.value),
      })),
    };
  }

  const noteColor = (n) => "#" + String(n.color || "999").replace(/^#+/, "");
  const stat = (entry, name) => entry.stats.find((s) => s.name === name);
  const statV = (entry, name) => stat(entry, name)?.displayValue ?? "";

  // Grupe tabele (konferencije/divizije) iz ugnežđene ESPN strukture.
  function collectGroups(node, out, parent = null, depth = 0) {
    if (node.standings) out.push({
      name: node.name, parent: depth > 1 ? parent : null,
      entries: node.standings.entries, season: node.standings.seasonDisplayName,
    });
    for (const ch of node.children || []) collectGroups(ch, out, node.name, depth + 1);
    return out;
  }

  function espnLeague(cfg) {
    const base = `https://site.api.espn.com/apis/site/v2/sports/${cfg.path}`;
    const href = (v) => `#/${cfg.id}/utakmice/${v}`;

    async function scoreboard(arg) {
      let url = `${base}/scoreboard`;
      if (arg && cfg.mode === "week") {
        const [st, w] = arg.split("-");
        url += `?seasontype=${st}&week=${w}`;
      } else if (arg) url += `?dates=${arg}`;
      return getJSON(url, 30000);
    }

    // Fudbal (mode "matchday"): ESPN ne daje broj kola i ne prima opseg datuma, ali prima ceo mesec
    // (dates=YYYYMM). Zato se povuče cela sezona po mesecima i utakmice se grupišu u kola.
    async function season() {
      const L = (await scoreboard()).leagues[0];
      const from = new Date(L.season.startDate), to = new Date(L.season.endDate);
      const now = new Date(), nowM = now.getFullYear() * 12 + now.getMonth();
      const months = [];
      for (let m = from.getUTCFullYear() * 12 + from.getUTCMonth(); m <= to.getUTCFullYear() * 12 + to.getUTCMonth(); m++) months.push(m);
      const pages = await Promise.all(months.map((m) => {
        const ym = `${Math.floor(m / 12)}${String((m % 12) + 1).padStart(2, "0")}`;
        // Tekući i susedni meseci se osvežavaju često (rezultati uživo), ostali retko.
        return getJSON(`${base}/scoreboard?dates=${ym}&limit=200`, Math.abs(m - nowM) <= 1 ? 30000 : 600000);
      }));
      const byId = new Map();
      for (const p of pages) for (const e of p.events) byId.set(e.id, e);
      const events = [...byId.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
      const phases = L.calendarType === "list" ? L.calendar?.[0]?.entries || [] : [];
      return buildRounds(events, phases);
    }

    // Novo kolo počinje posle bar jednog dana bez utakmica. Broj kola = najčešći redni broj
    // utakmice timova u tom kolu (otporno na odložene utakmice). Nokaut faze (Liga šampiona)
    // dobijaju ime faze iz ESPN kalendara + broj utakmice (1. / 2. meč).
    function buildRounds(events, phases) {
      const dayNo = (d) => Math.floor((d - d.getTimezoneOffset() * 60000) / 864e5);
      const played = new Map();
      const rounds = [];
      let cur = null, lastDay = -9;
      for (const e of events) {
        const d = new Date(e.date), day = dayNo(d);
        if (!cur || day - lastDay >= 2) rounds.push(cur = { events: [], nums: [], from: d });
        lastDay = day;
        cur.to = d;
        cur.events.push(e);
        cur.nums.push(Math.max(...e.competitions[0].competitors.map((x) => {
          played.set(x.team.id, (played.get(x.team.id) || 0) + 1);
          return played.get(x.team.id);
        })));
      }
      const legs = new Map();
      for (const r of rounds) {
        const i = phases.findIndex((p) => r.from >= new Date(p.startDate) && r.from < new Date(p.endDate));
        if (i > 0) {
          r.phase = phases[i].label;
          legs.set(r.phase, (legs.get(r.phase) || 0) + 1);
          r.leg = legs.get(r.phase);
        } else {
          const freq = new Map();
          for (const n of r.nums) freq.set(n, (freq.get(n) || 0) + 1);
          r.label = `Kolo ${[...freq].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0]}`;
        }
      }
      for (const r of rounds) {
        if (r.phase) r.label = (cfg.phaseLabel?.(r.phase) || r.phase) + (legs.get(r.phase) > 1 ? `, ${r.leg}. meč` : "");
        r.games = r.events.map((e) => ({ ...normalize(e, cfg), label: r.label }));
      }
      return rounds;
    }

    function roundRange(r) {
      const a = r.from, b = r.to;
      if (a.toDateString() === b.toDateString()) return SC.fmt.dayMonth.format(a);
      return a.getMonth() === b.getMonth() ? `${a.getDate()}–${SC.fmt.dayMonth.format(b)}` : `${SC.fmt.dayMonth.format(a)} – ${SC.fmt.dayMonth.format(b)}`;
    }

    async function renderMatchday(el, arg) {
      const rounds = await season();
      const live = rounds.findIndex((r) => r.games.some((g) => g.status === "in"));
      const open = rounds.findIndex((r) => r.games.some((g) => g.status === "pre"));
      const i = arg ? Math.min(Math.max(+arg - 1, 0), rounds.length - 1) : live >= 0 ? live : open >= 0 ? open : rounds.length - 1;
      const r = rounds[i];
      el.innerHTML = `<div class="toolbar"></div><div class="list"></div>`;
      pager(el.querySelector(".toolbar"), rounds.map((x, k) => ({ value: String(k + 1), label: `${x.label} · ${roundRange(x)}` })),
        String(i + 1), href, `<a class="btn ghost" href="#/${cfg.id}/utakmice">Tekuće kolo</a>`);
      // Oznaka kola je već u izboru gore, pa se na karticama ne ponavlja.
      el.querySelector(".list").innerHTML = r ? gamesByDay(r.games.map((g) => ({ ...g, label: "" }))) : `<p class="empty">Nema utakmica.</p>`;
      return { live: !!r?.games.some((g) => g.status === "in") };
    }

    // Opcije za navigaciju: nedelje (NFL) ili dani sa utakmicama (NBA).
    function navOptions(data) {
      const cal = data.leagues?.[0]?.calendar || [];
      if (cfg.mode === "week") {
        return {
          current: `${data.season.type}-${data.week?.number}`,
          options: cal.flatMap((g, gi) => (g.entries || []).map((e) => ({
            value: `${g.value ?? gi + 1}-${e.value}`,
            label: cfg.weekLabel(e.label),
            group: cfg.groupLabel(g.label),
          }))),
        };
      }
      const days = [...new Set(cal.map((d) => (typeof d === "string" ? d : d.startDate).slice(0, 10).replace(/-/g, "")))];
      const current = (data.day?.date || "").replace(/-/g, "");
      if (current && !days.includes(current)) days.push(current), days.sort();
      return {
        current,
        options: days.map((v) => {
          const d = new Date(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6));
          return { value: v, label: SC.cap(SC.fmt.dayShort.format(d)) + " " + v.slice(0, 4) };
        }),
      };
    }

    async function renderGames(el, arg) {
      if (cfg.mode === "matchday") return renderMatchday(el, arg);
      const data = await scoreboard(arg);
      const games = data.events.map((e) => normalize(e, cfg));
      const { options, current } = navOptions(data);
      el.innerHTML = `<div class="toolbar"></div>
        ${cfg.mode === "day" ? `<p class="hint">Dan po američkom vremenu; vremena početka su po tvom lokalnom vremenu.</p>` : ""}
        <div class="list"></div>`;
      pager(el.querySelector(".toolbar"), options, current, href,
        `<a class="btn ghost" href="#/${cfg.id}/utakmice">${cfg.mode === "week" ? "Tekuća nedelja" : "Danas"}</a>`);
      el.querySelector(".list").innerHTML = games.length
        ? gamesByDay(games)
        : `<p class="empty">Nema utakmica za izabrani ${cfg.mode === "week" ? "period" : "dan"}.</p>`;
      return { live: games.some((g) => g.status === "in") };
    }

    async function renderStandings(el) {
      // Bez seasontype ESPN u pripremnom periodu vraća tabelu pripremnih utakmica (npr. NBA 0-1 posle jedne
      // pripremne), pa američke lige traže regularni deo eksplicitno (cfg.standingsParams).
      const params = new URLSearchParams(cfg.standingsParams || {});
      if (cfg.standingsLevel) params.set("level", cfg.standingsLevel);
      const url = `https://site.api.espn.com/apis/v2/sports/${cfg.path}/standings${params.size ? `?${params}` : ""}`;
      const data = await getJSON(url, 120000);
      const groups = collectGroups(data, []);
      const season = groups[0]?.season;
      const played = groups.some((g) => g.entries.some((e) => (stat(e, "wins")?.value || 0) + (stat(e, "losses")?.value || 0) + (stat(e, "ties")?.value || 0) > 0));
      let html = season ? `<p class="hint">Sezona ${esc(season.match(/\d{4}(-\d{2,4})?/)?.[0] || season)}${played ? "" : " · regularni deo još nije počeo, tabela je po abecedi"}</p>` : "";
      let lastParent = null;
      // Pre prve utakmice ESPN nosioce daje kao 0 (ili nasumično), pa je redosled po abecedi i bez zona.
      const seedOf = (e) => (played ? stat(e, cfg.sortStat || "playoffSeed")?.value || 99 : 99);
      for (const g of groups) {
        if (g.parent && g.parent !== lastParent) html += `<h2 class="sec-h">${esc(cfg.groupName(g.parent))}</h2>`;
        lastParent = g.parent;
        const entries = [...g.entries].sort((a, b) => seedOf(a) - seedOf(b) || a.team.displayName.localeCompare(b.team.displayName));
        const cols = [{ label: "#", cls: "num" }, { label: cfg.teamLabel || "Tim", cls: "team" }, ...cfg.columns.map((c) => ({ ...c, cls: "num " + (c.cls || "") }))];
        const rows = entries.map((e, i) => ({
          cls: cfg.zone && played ? cfg.zone(i + 1, e) : "",
          style: e.note && cfg.notes ? `--zc:${noteColor(e.note)}` : "",
          cells: [
            String(i + 1),
            `<span class="tcell">${logo(e.team.logos?.[0]?.href, e.team.abbreviation)}<span class="n-full">${esc(e.team.displayName)}</span><span class="n-short">${esc(e.team.shortDisplayName || e.team.abbreviation)}</span></span>`,
            ...cfg.columns.map((c) => c.render ? c.render(e) : esc(statV(e, c.key))),
          ],
        }));
        if (groups.length > 1) html += `<h3 class="tbl-h">${esc(cfg.groupName(g.name))}</h3>`;
        html += table(cols, rows);
      }
      if (cfg.legend) html += cfg.legend;
      // Zone (plasman u Evropu, ispadanje…) iz ESPN napomena uz tim.
      if (cfg.notes) {
        const seen = new Map();
        for (const g of groups) for (const e of g.entries) if (e.note) seen.set(e.note.description, noteColor(e.note));
        if (seen.size) html += `<p class="legend">${[...seen].map(([d, c]) =>
          `<span class="sw" style="background:${esc(c)}"></span>${esc(cfg.notes[d] || d)}`).join(" ")}</p>`;
      }
      el.innerHTML = html;
      return {};
    }

    // Utakmice za početnu stranu: tekuća nedelja (NFL), današnji + susedni dani sa utakmicama (NBA),
    // cela sezona (fudbal). Koriste ih i paneli liga i kartice „Uživo sada / Uskoro“.
    async function overviewGamesList() {
      if (cfg.mode === "matchday") return (await season()).flatMap((r) => r.games);
      const data = await scoreboard();
      let games = data.events.map((e) => normalize(e, cfg));
      if (cfg.mode === "day") {
        const { options, current } = navOptions(data);
        const i = options.findIndex((o) => o.value === current);
        const extra = [options[i - 1], options[i + 1]].filter(Boolean).map((o) => scoreboard(o.value).catch(() => null));
        for (const d of await Promise.all(extra)) if (d) games = games.concat(d.events.map((e) => normalize(e, cfg)));
      }
      return games;
    }

    // Vrh tabele za panel na početnoj strani: 5 prvih (ili po 3 iz svake konferencije).
    async function miniTable() {
      const params = new URLSearchParams(cfg.standingsParams || {});
      const data = await getJSON(`https://site.api.espn.com/apis/v2/sports/${cfg.path}/standings${params.size ? `?${params}` : ""}`, 120000);
      const groups = collectGroups(data, []);
      const played = groups.some((g) => g.entries.some((e) => (stat(e, "wins")?.value || 0) + (stat(e, "losses")?.value || 0) + (stat(e, "ties")?.value || 0) > 0));
      if (!groups.length || !played) return `<p class="muted mini-empty">Tabela kreće sa početkom regularnog dela sezone.</p>`;
      const n = groups.length > 1 ? 3 : 5;
      const sortBy = cfg.sortStat || "playoffSeed";
      const value = cfg.mode === "matchday"
        ? (e) => `<b>${esc(statV(e, "points"))}</b> <small class="muted">b. · ${esc(statV(e, "gamesPlayed"))} ut.</small>`
        : (e) => `<b>${esc(statV(e, "wins"))}-${esc(statV(e, "losses"))}</b>`;
      return groups.map((g) => {
        const top = [...g.entries].sort((a, b) => (stat(a, sortBy)?.value || 99) - (stat(b, sortBy)?.value || 99)).slice(0, n);
        return `${groups.length > 1 ? `<p class="mini-grp">${esc(cfg.groupName(g.name))}</p>` : ""}<ol class="mini-tbl">${top.map((e, i) =>
          `<li style="${e.note && cfg.notes ? `--zc:${noteColor(e.note)}` : ""}"><span class="mt-pos">${i + 1}</span>${logo(e.team.logos?.[0]?.href, e.team.abbreviation)}<span class="mt-name">${esc(e.team.shortDisplayName || e.team.displayName)}</span><span class="mt-val">${value(e)}</span></li>`).join("")}</ol>`;
      }).join("");
    }

    // Lideri sezone (ESPN leaders: top 10 po kategoriji). Samo kategorije koje ESPN računa sa minimumom
    // utakmica - procenti i PER su na početku sezone besmisleni (npr. 100% za 3 iz jednog pokušaja).
    async function leadersData() {
      return getJSON(`https://site.api.espn.com/apis/site/v3/sports/${cfg.path}/leaders`, 300000);
    }
    const leaderRows = (c, n = 10) => (c?.leaders || []).slice(0, n).map((l) => ({
      img: l.athlete?.headshot?.href, name: l.athlete?.displayName || "", team: l.team?.abbreviation || "",
      teamLogo: l.team?.logos?.[0]?.href, value: String(l.displayValue ?? "").replace(".", ","),
    }));

    async function renderLeaders(el) {
      const d = await leadersData();
      const cats = d.leaders?.categories || [];
      const boards = cfg.leaders.map(([name, label]) => SC.leaderBoard(label, leaderRows(cats.find((x) => x.name === name)))).join("");
      el.innerHTML = `<p class="hint">Sezona ${esc(d.currentSeason?.displayName || "")} · prosek po utakmici · na početku sezone brojke se brzo menjaju</p>`
        + (boards ? `<div class="lb-grid">${boards}</div>` : `<p class="empty">Lideri će biti dostupni kad počne regularni deo sezone.</p>`);
      return {};
    }

    async function overview(el) {
      const [games, mini, lead] = await Promise.all([overviewGamesList(), miniTable().catch(() => ""),
        cfg.leaders ? leadersData().catch(() => null) : null]);
      const ov = overviewGames(games);
      const scorers = lead ? leaderRows(lead.leaders?.categories?.find((x) => x.name === cfg.leaders[0][0]), 3) : [];
      el.innerHTML = ov.html + (mini ? `<h4 class="ov-h">Tabela · <a href="#/${cfg.id}/tabela">cela</a></h4>${mini}` : "")
        + (scorers.length ? `<h4 class="ov-h">Najbolji strelci · <a href="#/${cfg.id}/lideri">lideri</a></h4><ol class="mini-tbl">${scorers.map((r, i) =>
          `<li><span class="mt-pos">${i + 1}</span>${logo(r.teamLogo, r.team)}<span class="mt-name">${esc(r.name)}</span><span class="mt-val"><b>${esc(r.value)}</b> <small class="muted">poena</small></span></li>`).join("")}</ol>` : "");
      return { live: ov.live };
    }

    SC.registerLeague({
      id: cfg.id, name: cfg.name, short: cfg.short, accent: cfg.accent, icon: cfg.icon, visual: cfg.visual,
      events: overviewGamesList, miniTable,
      source: { label: "ESPN", url: cfg.sourceUrl },
      tabs: [
        { id: "utakmice", label: "Raspored i rezultati", render: renderGames },
        { id: "tabela", label: "Tabela", render: renderStandings },
        ...(cfg.leaders ? [{ id: "lideri", label: "Lideri", render: renderLeaders }] : []),
      ],
      overview,
    });
    if (cfg.detail) SC.registerDetail(cfg.id, (el, id) => cfg.detail(el, id, base));
  }

  SC.espnLeague = espnLeague;

  // ------------------------------------------------------------ NFL: detalji utakmice (ESPN summary)
  const NFL_TEAM_STATS = [
    ["totalYards", "Ukupno jardi"], ["netPassingYards", "Jardi pasom"], ["rushingYards", "Jardi trčanjem"],
    ["firstDowns", "Prvi daunovi (first downs)"], ["thirdDownEff", "Treći daun (uspelo-pokušaja)"],
    ["fourthDownEff", "Četvrti daun (uspelo-pokušaja)"], ["completionAttempts", "Pasovi (uhvaćeni/ukupno)"],
    ["sacksYardsLost", "Sakovi - izgubljeni jardi"], ["redZoneAttempts", "Crvena zona (TD-ulazaka)"],
    ["turnovers", "Izgubljene lopte"], ["totalPenaltiesYards", "Kazne - jardi"], ["possessionTime", "Posed lopte"],
  ];
  const NFL_LEADERS = { passingYards: "Pas", rushingYards: "Trčanje", receivingYards: "Hvatanje" };
  const NFL_PLAYER_CATS = { passing: "Pas", rushing: "Trčanje", receiving: "Hvatanje" };

  // Zajednički vrh prozora za ESPN lige: ekipe, rezultat, status, delovi utakmice (četvrtine/poluvremena),
  // a uživo šansa za pobedu (NFL, NBA). Američke lige: gost levo; fudbal (homeFirst): domaćin levo.
  function espnTop(s, { homeFirst = false, record = true, period = (i) => (i < 4 ? `${i + 1}.` : "Prod.") } = {}) {
    const comp = s.header.competitions[0];
    const state = comp.status.type.state;
    const teams = [...comp.competitors].sort((a, b) => (a.homeAway === "away" ? 0 : 1) - (b.homeAway === "away" ? 0 : 1));
    const [away, home] = teams;
    const [left, right] = homeFirst ? [home, away] : [away, home];
    const tLogo = (c) => logo(c.team.logos?.[0]?.href || c.team.logo, c.team.abbreviation);
    for (const c of teams) c.recordText = record ? c.record?.[0]?.displayValue || c.record?.[0]?.summary || "" : "";
    const started = state !== "pre";
    const status = state === "pre"
      ? esc(SC.when(new Date(comp.date)))
      : state === "in" ? `<span class="live-dot"></span>${esc(statusText(comp.status))}` : esc(statusText(comp.status));
    const score = (c) => `<span class="${c.winner ? "w" : ""}">${esc(c.score)}${c.shootoutScore != null ? `<small> (${esc(c.shootoutScore)})</small>` : ""}</span>`;
    const side = (c) => `<div class="gd-team">${tLogo(c)}<b>${esc(c.team.displayName)}</b><small class="muted">${esc(c.recordText)}</small></div>`;

    let html = `<div class="gd-head">${side(left)}
      <div class="gd-score"><div class="gd-nums">${started ? `${score(left)}<span class="muted">:</span>${score(right)}` : `<span class="muted">vs</span>`}</div>
        <div class="gd-status ${state}">${status}</div></div>
      ${side(right)}</div>`;

    if (started && left.linescores?.length) {
      const n = Math.max(left.linescores.length, right.linescores?.length || 0);
      const head = Array.from({ length: n }, (_, i) => `<th>${period(i)}</th>`).join("");
      const row = (c) => `<tr><td>${esc(c.team.abbreviation)}</td>${Array.from({ length: n }, (_, i) => `<td>${esc(c.linescores?.[i]?.displayValue ?? "")}</td>`).join("")}<td><b>${esc(c.score)}</b></td></tr>`;
      html += `<table class="gd-q"><thead><tr><th></th>${head}<th>Ukupno</th></tr></thead><tbody>${row(left)}${row(right)}</tbody></table>`;
    }

    if (state === "in") {
      const wp = s.winprobability?.at(-1);
      if (wp) {
        const h = Math.round(wp.homeWinPercentage * 100), a = Math.max(0, 100 - h - Math.round((wp.tiePercentage || 0) * 100));
        html += `<div class="gd-wp"><span>${esc(away.team.abbreviation)} ${a}%</span><div class="gd-wp-bar"><i style="width:${a}%"></i></div><span>${h}% ${esc(home.team.abbreviation)}</span></div>
          <p class="hint gd-center">Šansa za pobedu (ESPN)</p>`;
      }
    }
    return { html, state, started, away, home, left, right };
  }

  // Najbolji igrači po kategorijama: tabela kategorija × ekipe (ESPN `leaders`).
  function espnLeaders(s, away, home, cats) {
    const leaders = (s.leaders || []).filter((t) => t.leaders?.length);
    if (!leaders.length) return "";
    const byTeam = new Map(leaders.map((t) => [t.team.abbreviation, t]));
    const cell = (t, cat) => {
      const l = t?.leaders.find((x) => x.name === cat)?.leaders?.[0];
      return l ? `<b>${esc(l.athlete?.shortName || l.athlete?.displayName)}</b><br><small class="muted">${esc(l.displayValue)}</small>` : "-";
    };
    return `<section class="gd-sec"><h3>Najbolji igrači</h3><div class="tbl-wrap"><table class="st gd-lead"><thead><tr><th></th>
      <th>${esc(away.team.abbreviation)}</th><th>${esc(home.team.abbreviation)}</th></tr></thead><tbody>${Object.entries(cats).map(([cat, label]) =>
      `<tr><td class="muted">${label}</td><td>${cell(byTeam.get(away.team.abbreviation), cat)}</td><td>${cell(byTeam.get(home.team.abbreviation), cat)}</td></tr>`).join("")}</tbody></table></div></section>`;
  }

  // Statistika ekipa: [ESPN naziv statistike, naš naziv, (opciono) fmt(vrednost, sve vrednosti ekipe)];
  // prikazuju se samo one koje postoje. Prva ekipa je leva kolona.
  function espnTeamStats(s, left, right, wanted) {
    const bt = s.boxscore?.teams || [];
    if (bt.length !== 2) return "";
    const st = (c) => new Map((bt.find((t) => t.team.abbreviation === c.team.abbreviation || t.team.id === c.team.id)?.statistics || []).map((x) => [x.name, x.displayValue]));
    const sa = st(left), sh = st(right);
    const rows = wanted.filter(([k]) => sa.has(k) || sh.has(k));
    if (!rows.length) return "";
    const val = (m, k, f) => (m.has(k) ? (f ? f(m.get(k), m) : m.get(k)) : "");
    return `<section class="gd-sec"><h3>Statistika ekipa</h3><div class="tbl-wrap"><table class="st gd-stats"><thead><tr>
      <th class="num">${esc(left.team.abbreviation)}</th><th></th><th class="num">${esc(right.team.abbreviation)}</th></tr></thead><tbody>${rows.map(([k, label, f]) =>
      `<tr><td class="num">${esc(val(sa, k, f))}</td><td class="gd-mid muted">${label}</td><td class="num">${esc(val(sh, k, f))}</td></tr>`).join("")}</tbody></table></div></section>`;
  }

  const espnLink = (s) => {
    const link = s.header.links?.[0]?.href;
    return link ? `<p class="gd-foot"><a href="${esc(link)}" target="_blank" rel="noopener">Još detalja na ESPN-u ↗</a></p>` : "";
  };

  // ------------------------------------------------------------ NBA: detalji utakmice (ESPN summary)
  const NBA_LEADERS = { points: "Poeni", rebounds: "Skokovi", assists: "Asistencije" };
  const NBA_TEAM_STATS = [
    ["fieldGoalsMade-fieldGoalsAttempted", "Šut iz igre"], ["fieldGoalPct", "Šut iz igre %"],
    ["threePointFieldGoalsMade-threePointFieldGoalsAttempted", "Šut za 3"], ["threePointFieldGoalPct", "Šut za 3 %"],
    ["freeThrowsMade-freeThrowsAttempted", "Slobodna bacanja"], ["freeThrowPct", "Slobodna bacanja %"],
    ["totalRebounds", "Skokovi"], ["offensiveRebounds", "Skokovi u napadu"], ["assists", "Asistencije"],
    ["steals", "Ukradene lopte"], ["blocks", "Blokade"], ["totalTurnovers", "Izgubljene lopte"],
    ["fastBreakPoints", "Poeni iz kontre"], ["pointsInPaint", "Poeni u reketu"], ["fouls", "Lične greške"],
    ["largestLead", "Najveće vođstvo"],
  ];
  // ESPN skraćenice kolona → naše (sa objašnjenjem na prelazu mišem).
  const NBA_COLS = {
    MIN: ["Min", "Minuti"], PTS: ["Poeni", "Poeni"], FG: ["Iz igre", "Šut iz igre (pogođeno-pokušaja)"], "3PT": ["3P", "Šut za 3"],
    FT: ["SB", "Slobodna bacanja"], REB: ["Sk", "Skokovi"], AST: ["As", "Asistencije"], TO: ["IL", "Izgubljene lopte"],
    STL: ["Uk", "Ukradene lopte"], BLK: ["Bl", "Blokade"], OREB: ["SkN", "Skokovi u napadu"], DREB: ["SkO", "Skokovi u odbrani"],
    PF: ["LG", "Lične greške"], "+/-": ["+/-", "Razlika u poenima dok je igrač na terenu"],
  };

  async function nbaDetail(el, id, base) {
    const s = await getJSON(`${base}/summary?event=${id}`, 20000);
    let { html, state, started, away, home } = espnTop(s);

    if (!started) {
      const v = s.gameInfo?.venue;
      html += `<section class="gd-sec"><p>Utakmica još nije počela.${v?.fullName ? ` Dvorana: ${esc(v.fullName)}${v.address?.city ? `, ${esc(v.address.city)}` : ""}.` : ""}</p>
        <p class="muted">Statistika i tok utakmice pojavljuju se ovde čim počne, i osvežavaju se sami.</p></section>`;
      el.innerHTML = html + espnLink(s);
      return { live: false };
    }

    html += espnLeaders(s, away, home, NBA_LEADERS);

    // Akcije: uživo poslednje na vrhu; posle utakmice sklopljeno.
    const plays = (s.plays || []).filter((p) => p.text && !/^(End of|Start of)/i.test(p.text)).slice(-15).reverse();
    if (plays.length) {
      const per = (n) => (n > 4 ? "Prod." : `${n}. čet.`);
      const list = `<ul class="gd-plays">${plays.map((p) => `<li><span class="gd-pq">${esc(per(p.period?.number))} ${esc(p.clock?.displayValue || "")}</span>
        <span class="gd-pt">${esc(p.text)}</span><span class="gd-ps">${p.scoringPlay ? `${esc(p.awayScore)}-${esc(p.homeScore)}` : ""}</span></li>`).join("")}</ul>`;
      html += state === "in" ? `<section class="gd-sec"><h3>Poslednje akcije</h3>${list}</section>`
        : `<details class="gd-sec gd-players"><summary>Poslednje akcije utakmice</summary>${list}</details>`;
    }

    html += espnTeamStats(s, away, home, NBA_TEAM_STATS);

    // Statistika igrača po ekipama (starteri pa klupa).
    const bp = s.boxscore?.players || [];
    let inner = "";
    for (const t of bp) {
      const c = t.statistics?.[0];
      if (!c?.athletes?.length) continue;
      const labels = c.labels || [];
      inner += `<h4>${esc(t.team.displayName || t.team.abbreviation)}</h4>` + table(
        [{ label: "Igrač" }, ...labels.map((l) => ({ label: NBA_COLS[l]?.[0] || l, title: NBA_COLS[l]?.[1], cls: "num" }))],
        c.athletes.map((a) => ({
          cells: [`${esc(a.athlete?.displayName || "")}${a.starter ? ` <small class="muted" title="Starter">S</small>` : ""}`,
            ...(a.stats?.length ? a.stats.map((v, i) => (labels[i] === "PTS" ? `<b>${esc(v)}</b>` : esc(v))) : [`<span class="muted">${esc(a.reason || "nije igrao")}</span>`, ...Array(Math.max(0, labels.length - 1)).fill("")])],
        })));
    }
    if (inner) html += `<details class="gd-sec gd-players"${state === "in" ? " open" : ""}><summary>Statistika igrača</summary>${inner}<p class="hint">S = starter.</p></details>`;

    el.innerHTML = html + espnLink(s);
    return { live: state === "in" };
  }

  // ------------------------------------------------------------ Fudbal: detalji utakmice (ESPN summary)
  // keyEvents (golovi, kartoni, izmene), rosters (postave), boxscore.teams, leaders, commentary. Domaćin levo.
  const ratio = (totalKey) => (v, m) => {
    const t = +m.get(totalKey);
    return t ? `${v}/${t} (${Math.round((100 * +v) / t)}%)` : v;
  };
  const SOCCER_TEAM_STATS = [
    ["possessionPct", "Posed lopte", (v) => `${Math.round(+v)}%`], ["totalShots", "Šutevi"], ["shotsOnTarget", "Šutevi u okvir"],
    ["wonCorners", "Korneri"], ["offsides", "Ofsajdi"], ["foulsCommitted", "Prekršaji"], ["yellowCards", "Žuti kartoni"],
    ["redCards", "Crveni kartoni"], ["saves", "Odbrane golmana"], ["accuratePasses", "Pasovi (tačni/ukupno)", ratio("totalPasses")],
    ["accurateCrosses", "Centaršutevi (tačni/ukupno)", ratio("totalCrosses")], ["accurateLongBalls", "Duge lopte (tačne/ukupno)", ratio("totalLongBalls")],
  ];
  const SOCCER_LEADERS = { totalShots: "Šutevi", accuratePasses: "Tačni pasovi", saves: "Odbrane" };
  const soccerPeriod = (i) => ["1. pol.", "2. pol.", "1. prod.", "2. prod.", "Penali"][i] || "";

  // Vrsta događaja po ESPN oznaci (type.type): [oznaka, ikonica-klasa].
  function eventKind(t) {
    const slug = t?.type || "", text = (t?.text || "").toLowerCase();
    if (/own/.test(slug)) return ["Autogol", "goal"];
    if (/penalty---(missed|saved)/.test(slug)) return ["Promašen penal", "miss"];
    if (/penalty---scored|penalty-goal/.test(slug)) return ["Gol iz penala", "goal"];
    if (/^goal/.test(slug)) return [/header/.test(slug) ? "Gol glavom" : /free-kick/.test(slug) ? "Gol iz slobodnjaka" : "Gol", "goal"];
    if (/yellow.*red|second-yellow/.test(slug) || /second yellow/.test(text)) return ["Drugi žuti - isključenje", "red"];
    if (/red-card/.test(slug)) return ["Crveni karton", "red"];
    if (/yellow-card/.test(slug)) return ["Žuti karton", "yellow"];
    if (/substitution/.test(slug)) return ["Izmena", "sub"];
    return null;
  }

  // ------------------------------------------------------------ Fudbal: teren (mapa šuteva i događaja, postave po formaciji)
  // ESPN commentary[].play: fieldPositionX/Y (gde je akcija), fieldPosition2X/Y (kuda je otišao šut; kod blokiranog
  // mesto bloka), u koordinatama ekipe iz play.team: 0-100, ekipa uvek napada ka x=100, y=0 je desna aut-linija
  // gledano u smeru napada (proveravano 22. 11. 2026). Na terenu domaćin napada nadesno, gost nalevo (preslikan).
  const pitchState = new Map();   // id utakmice → izabrani prikaz i filteri (da prežive osvežavanje)
  const SHOT_KIND = [
    [/^goal|penalty - scored/i, "goal", "Gol"], [/on target|saved/i, "on", "Šut u okvir"], [/woodwork|post|bar/i, "wood", "Stativa / prečka"],
    [/blocked/i, "blk", "Blokiran šut"], [/off target|missed|wide|over/i, "off", "Šut pored gola"],
  ];
  const OTHER_KIND = { Foul: ["foul", "Prekršaj"], "Corner Awarded": ["corner", "Korner"], Offside: ["offside", "Ofsajd"] };
  const hex = (c) => (/^[0-9a-f]{6}$/i.test(c || "") ? `#${c}` : "");
  const colorGap = (a, b) => { const n = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const [x, y] = [n(a), n(b)]; return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
  function teamColors(home, away) {
    const h = hex(home.team.color) || "#F0A23B";
    let a = hex(away.team.color) || "#4aa3ff";
    if (colorGap(h, a) < 120) a = hex(away.team.alternateColor) && colorGap(h, hex(away.team.alternateColor)) >= 120 ? hex(away.team.alternateColor) : (colorGap(h, "#ffffff") < 120 ? "#1d6fd1" : "#f4f4f4");
    return [h, a];
  }
  // Teren 105 × 68 m. Tačka ekipe (x, y u 0-100) → koordinate SVG-a.
  const P = (side, x, y) => (side === "L" ? [x * 1.05, (100 - y) * 0.68] : [(100 - x) * 1.05, y * 0.68]);
  const PITCH_LINES = `<rect x="0" y="0" width="105" height="68"/><line x1="52.5" y1="0" x2="52.5" y2="68"/><circle cx="52.5" cy="34" r="9.15"/>
    <circle cx="52.5" cy="34" r=".35" class="pt-dot"/>
    ${[0, 1].map((m) => { const X = (v) => (m ? 105 - v : v); return `<rect x="${Math.min(X(0), X(16.5))}" y="13.84" width="16.5" height="40.32"/>
      <rect x="${Math.min(X(0), X(5.5))}" y="24.84" width="5.5" height="18.32"/><circle cx="${X(11)}" cy="34" r=".35" class="pt-dot"/>
      <path d="M${X(16.5)} 26.69 A9.15 9.15 0 0 ${m ? 0 : 1} ${X(16.5)} 41.31"/><rect x="${m ? 105 : -2}" y="30.34" width="2" height="7.32" class="pt-goal"/>`; }).join("")}
    <path d="M0 1 A1 1 0 0 0 1 0 M104 0 A1 1 0 0 0 105 1 M105 67 A1 1 0 0 0 104 68 M1 68 A1 1 0 0 0 0 67"/>`;

  function pitchShots(s, home, away, sideById, colors) {
    // play.team ima samo ime (bez id-a).
    const sideOf = (t) => sideById(t) || (t?.displayName === home.team.displayName ? "L" : t?.displayName === away.team.displayName ? "R" : "");
    const plays = (s.commentary || []).map((c) => c.play).filter((p) => p && p.fieldPositionX != null && sideOf(p.team));
    const seen = new Set();
    const marks = [];
    const count = { L: 0, R: 0, goalL: 0, goalR: 0 };
    for (const p of plays) {
      const t = p.type?.text || "";
      const side = sideOf(p.team);
      const col = side === "L" ? colors[0] : colors[1];
      const half = p.period?.number === 1 ? "h1" : p.period?.number === 2 ? "h2" : "hx";
      const who = (p.participants || []).map((x) => x.athlete?.displayName).filter(Boolean);
      const [x, y] = P(side, +p.fieldPositionX, +p.fieldPositionY);
      const min = p.clock?.displayValue || "";
      const shot = /shot|goal|penalty/i.test(t) && !/kickoff/i.test(t) ? SHOT_KIND.find(([re]) => re.test(t)) : null;
      if (shot) {
        const [, k, label] = shot;
        count[side]++; if (k === "goal") count[`goal${side}`]++;
        const tip = `${min} ${who[0] || ""} (${p.team.displayName}) - ${label}${who[1] ? `, asist. ${who[1]}` : ""}`;
        let line = "";
        if (p.fieldPosition2X != null) {
          const [x2, y2] = P(side, +p.fieldPosition2X, +p.fieldPosition2Y);
          line = `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="pm-ln" stroke="${col}"/>`;
        }
        const r = k === "goal" ? 1.5 : 1.05;
        marks.push(`<g class="pm pm-shot pm-${k} pm-${half}">${line}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" stroke="${col}" fill="${k === "goal" || k === "on" ? col : "transparent"}"/>${k === "goal" ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r + 0.7}" class="pm-ring" stroke="${col}"/>` : ""}<title>${esc(tip)}</title></g>`);
        continue;
      }
      const other = OTHER_KIND[t];
      if (!other) continue;
      const key = `${t}|${min}|${p.fieldPositionX}|${p.fieldPositionY}`;   // prekršaj dolazi dva puta („faul“ i „dobija slobodan udarac“)
      if (seen.has(key)) continue;
      seen.add(key);
      const [k, label] = other;
      const tip = `${min} ${label} - ${p.team.displayName}${k === "foul" && who[0] ? ` (${who[0]})` : ""}`;
      const shape = k === "foul" ? `<path d="M${(x - 0.8).toFixed(1)} ${(y - 0.8).toFixed(1)} l1.6 1.6 m0 -1.6 l-1.6 1.6" stroke="${col}"/>`
        : k === "corner" ? `<rect x="${(x - 0.7).toFixed(1)}" y="${(y - 0.7).toFixed(1)}" width="1.4" height="1.4" fill="${col}" transform="rotate(45 ${x.toFixed(1)} ${y.toFixed(1)})"/>`
        : `<path d="M${x.toFixed(1)} ${(y - 0.9).toFixed(1)} l0.9 1.6 h-1.8 z" fill="${col}"/>`;
      marks.push(`<g class="pm pm-${k} pm-${half}">${shape}<title>${esc(tip)}</title></g>`);
    }
    return { svg: marks.join(""), count, any: marks.length > 0 };
  }

  // Postava na terenu: linije po formaciji („4-2-3-1“), igrači u liniju po dubini pozicije, levo-desno po oznaci L/R.
  const DEPTH = (a) => (a === "G" ? 0 : /^(CD|CB|SW|LB|RB)/.test(a) ? 1 : /WB/.test(a) ? 1.5 : /^(DM|CDM)/.test(a) ? 2 : /^(CM|LM|RM|M)/.test(a) ? 2.5
    : /^AM/.test(a) ? 3 : /^(LW|RW|LF|RF)/.test(a) ? 3.5 : /^(F|CF|ST|S)/.test(a) ? 4 : 2.5);
  // Bočni položaj: bekovi i krila (LB, RWB, LW, LM…) skroz sa strane, „-L“/„-R“ (levi/desni štoper, AM-L…) bliže sredini.
  const LAT = (a) => (/^L/.test(a) ? -2 : /^R/.test(a) ? 2 : /-L$/.test(a) ? -1 : /-R$/.test(a) ? 1 : 0);
  function pitchLineup(r, side, col) {
    const st = r.roster.filter((p) => p.starter);
    if (st.length < 11) return "";
    const ab = (p) => p.position?.abbreviation || "";
    const gk = st.find((p) => ab(p) === "G") || st.find((p) => +p.formationPlace === 1) || st[0];
    const out = st.filter((p) => p !== gk).sort((a, b) => DEPTH(ab(a)) - DEPTH(ab(b)) || (+a.formationPlace || 0) - (+b.formationPlace || 0));
    let counts = String(r.formation || "").split("-").map(Number).filter((n) => n > 0);
    if (counts.reduce((a, b) => a + b, 0) !== out.length) {   // bez formacije: linije po dubini
      counts = [];
      let prev = null;
      for (const p of out) { const d = DEPTH(ab(p)); if (d !== prev) counts.push(0); counts[counts.length - 1]++; prev = d; }
    }
    const lines = [[gk]];
    let i = 0;
    for (const n of counts) { lines.push(out.slice(i, i + n)); i += n; }
    const L = lines.length - 1;
    const res = [];
    lines.forEach((line, li) => {
      const depth = li === 0 ? 5 : 15 + (L > 1 ? ((li - 1) / (L - 1)) * 31 : 15);   // od gola do blizu centra (0-100 = ceo teren)
      const sorted = [...line].sort((a, b) => LAT(ab(a)) - LAT(ab(b)) || (+a.formationPlace || 0) - (+b.formationPlace || 0));
      sorted.forEach((p, k) => {
        const lat = ((k + 0.5) / sorted.length) * 100;   // levo krilo → desno krilo
        const [x, y] = P(side, depth, 100 - lat);
        const stt = Object.fromEntries((p.stats || []).map((v) => [v.name, +v.value || 0]));
        const nm = p.athlete?.lastName || String(p.athlete?.displayName || "").split(" ").slice(-1)[0] || "";
        const badges = [stt.totalGoals ? `<circle cx="${(x + 1.9).toFixed(1)}" cy="${(y - 1.9).toFixed(1)}" r=".8" class="lu-goal"/>` : "",
          stt.redCards ? `<rect x="${(x - 2.6).toFixed(1)}" y="${(y - 2.8).toFixed(1)}" width="1" height="1.4" class="lu-red"/>` : stt.yellowCards ? `<rect x="${(x - 2.6).toFixed(1)}" y="${(y - 2.8).toFixed(1)}" width="1" height="1.4" class="lu-yel"/>` : "",
          p.subbedOut ? `<text x="${(x + 2.2).toFixed(1)}" y="${(y + 1.2).toFixed(1)}" class="lu-sub">↓</text>` : ""].join("");
        const tip = `${p.jersey || ""} ${p.athlete?.displayName || ""} (${ab(p)})${stt.totalGoals ? ` · golova: ${stt.totalGoals}` : ""}${stt.yellowCards ? " · žuti" : ""}${stt.redCards ? " · crveni" : ""}${p.subbedOut ? " · izašao" : ""}`;
        res.push(`<g class="lu-p"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.8" fill="${col}"/><text x="${x.toFixed(1)}" y="${(y + 0.6).toFixed(1)}" class="lu-no" fill="${colorGap(col, "#ffffff") < 200 ? "#111" : "#fff"}">${esc(p.jersey || "")}</text>
          <text x="${x.toFixed(1)}" y="${(y + 3.7).toFixed(1)}" class="lu-nm">${esc(nm)}</text>${badges}<title>${esc(tip)}</title></g>`);
      });
    });
    return res.join("");
  }

  function pitchSection(s, id, home, away, sideOf) {
    const colors = teamColors(home, away);
    const shots = pitchShots(s, home, away, sideOf, colors);
    const rosters = (s.rosters || []).filter((r) => r.roster?.some((p) => p.starter));
    const lu = rosters.map((r) => pitchLineup(r, r.homeAway === "home" ? "L" : "R", r.homeAway === "home" ? colors[0] : colors[1])).join("");
    if (!shots.any && !lu) return "";
    const st = pitchState.get(id) || { view: shots.any ? "shots" : "lu", f: ["shot"], half: "all" };
    pitchState.set(id, st);
    const form = (side) => rosters.find((r) => r.homeAway === side)?.formation || "";
    const chip = (k, label) => `<button type="button" class="pt-chip${st.f.includes(k) ? " on" : ""}" data-f="${k}">${label}</button>`;
    return `<section class="gd-sec pt v-${st.view} h-${st.half} ${st.f.map((k) => `f-${k}`).join(" ")}" data-pt="${esc(id)}">
      <div class="pt-head"><h3>Teren</h3>
        <nav class="tabs pt-views">${shots.any ? `<a href="#" data-v="shots" class="${st.view === "shots" ? "active" : ""}">Šutevi i događaji</a>` : ""}${lu ? `<a href="#" data-v="lu" class="${st.view === "lu" ? "active" : ""}">Postave</a>` : ""}</nav>
        <span class="pt-filters">${chip("shot", "Šutevi")}${chip("foul", "Prekršaji")}${chip("corner", "Korneri")}${chip("offside", "Ofsajdi")}
          <select class="pager-sel pt-half"><option value="all"${st.half === "all" ? " selected" : ""}>Cela utakmica</option><option value="1"${st.half === "1" ? " selected" : ""}>1. poluvreme</option><option value="2"${st.half === "2" ? " selected" : ""}>2. poluvreme</option></select></span>
      </div>
      <div class="pt-teams"><span><i style="background:${colors[0]}"></i>${esc(home.team.displayName)} <small class="muted pt-sv">napada → · šuteva ${shots.count.L}</small><small class="muted pt-lv">${esc(form("home"))}</small></span>
        <span><small class="muted pt-sv">← napada · šuteva ${shots.count.R}</small><small class="muted pt-lv">${esc(form("away"))}</small> ${esc(away.team.displayName)}<i style="background:${colors[1]}"></i></span></div>
      <svg class="pt-svg" viewBox="-3 -1.5 111 71" role="img" aria-label="Teren"><g class="pt-lines">${PITCH_LINES}</g>
        <g class="pt-shots">${shots.svg}</g><g class="pt-lu">${lu}</g></svg>
      <p class="hint pt-legend"><span class="lg lg-goal"></span>gol <span class="lg lg-on"></span>u okvir <span class="lg lg-off"></span>pored / stativa <span class="lg lg-blk"></span>blokiran
        · linija pokazuje kuda je lopta otišla · <b>×</b> prekršaj (ko je napravio) · <b>◆</b> korner · <b>▲</b> ofsajd. Pređi mišem preko oznake za detalje.</p>
    </section>`;
  }
  // Klikovi na terenu: jedan slušalac na celom dokumentu (detalji se crtaju u privremeni element pa premeštaju),
  // stanje u pitchState jer se sadržaj uživo menja na 30 s.
  {
    const apply = (sec, st) => {
      sec.className = `gd-sec pt v-${st.view} h-${st.half} ${st.f.map((k) => `f-${k}`).join(" ")}`;
      sec.querySelectorAll(".pt-views a").forEach((a) => a.classList.toggle("active", a.dataset.v === st.view));
      sec.querySelectorAll(".pt-chip").forEach((b) => b.classList.toggle("on", st.f.includes(b.dataset.f)));
    };
    document.addEventListener("click", (e) => {
      const sec = e.target.closest(".pt");
      if (!sec) return;
      const st = pitchState.get(sec.dataset.pt);
      const v = e.target.closest(".pt-views a"), c = e.target.closest(".pt-chip");
      if (v) { e.preventDefault(); st.view = v.dataset.v; }
      else if (c) { const k = c.dataset.f; st.f = st.f.includes(k) ? st.f.filter((x) => x !== k) : [...st.f, k]; }
      else return;
      apply(sec, st);
    });
    document.addEventListener("change", (e) => {
      const sel = e.target.closest?.(".pt-half");
      if (!sel) return;
      const sec = sel.closest(".pt"), st = pitchState.get(sec.dataset.pt);
      st.half = sel.value;
      apply(sec, st);
    });
  }

  async function soccerDetail(el, id, base) {
    const s = await getJSON(`${base}/summary?event=${id}`, 20000);
    let { html, state, started, home, away } = espnTop(s, { homeFirst: true, record: false, period: soccerPeriod });
    const live = state === "in";
    const sideOf = (team) => (String(team?.id) === String(home.team.id) ? "L" : String(team?.id) === String(away.team.id) ? "R" : "");

    if (!started) {
      const v = s.gameInfo?.venue;
      html += `<section class="gd-sec"><p>Utakmica još nije počela.${v?.fullName ? ` Stadion: ${esc(v.fullName)}${v.address?.city ? `, ${esc(v.address.city)}` : ""}.` : ""}</p>
        <p class="muted">Postave obično stižu oko sat vremena pre početka. Tok utakmice i statistika pojavljuju se čim počne, i osvežavaju se sami.</p></section>`;
    }

    // Tok utakmice: domaćin levo, gost desno, minut u sredini.
    const events = (s.keyEvents || []).map((k) => ({ k, kind: eventKind(k.type) })).filter((x) => x.kind);
    if (events.length) {
      const scoreIn = (text) => {
        const m = String(text || "").match(/([^,.!\d]+?) (\d+), ([^,.\d]+?) (\d+)\./);
        if (!m) return "";
        const first = m[1].trim();
        return first === home.team.displayName || home.team.displayName.startsWith(first) ? `${m[2]}-${m[4]}` : `${m[4]}-${m[2]}`;
      };
      const rows = events.map(({ k, kind: [label, cls] }) => {
        const names = (k.participants || []).map((p) => p.athlete?.displayName).filter(Boolean);
        let body;
        if (cls === "sub") body = `<span class="ev-in">↑ ${esc(names[0] || "")}</span><span class="ev-out">↓ ${esc(names[1] || "")}</span>`;
        else body = `<b>${esc(names[0] || "")}</b>${cls === "goal" && names[1] && label !== "Autogol" ? `<small class="muted">asist. ${esc(names[1])}</small>` : ""}`;
        const sc = cls === "goal" ? scoreIn(k.text) : "";
        const cell = `<span class="ev ev-${cls}" title="${esc(label)}"></span><span class="ev-body"><span class="ev-label">${esc(label)}${sc ? ` <b class="ev-score">${esc(sc)}</b>` : ""}</span>${body}</span>`;
        const side = sideOf(k.team);
        return `<li class="${side === "R" ? "r" : "l"}"><div>${side !== "R" ? cell : ""}</div><span class="ev-min">${esc(k.clock?.displayValue || "")}</span><div>${side === "R" ? cell : ""}</div></li>`;
      }).join("");
      html += `<section class="gd-sec"><h3>Tok utakmice</h3><ul class="gd-tl">${rows}</ul></section>`;
    }

    html += pitchSection(s, String(id), home, away, sideOf);   // pre početka samo postave, ako su objavljene

    if (started) {
      html += espnTeamStats(s, home, away, SOCCER_TEAM_STATS);
      html += espnLeaders(s, home, away, SOCCER_LEADERS);
    }

    // Postave: starteri pa klupa, sa golovima, kartonima i izmenama.
    const rosters = (s.rosters || []).filter((r) => r.roster?.length);
    if (rosters.length) {
      const ordered = [...rosters].sort((a, b) => (a.homeAway === "home" ? 0 : 1) - (b.homeAway === "home" ? 0 : 1));
      const player = (p) => {
        const st = Object.fromEntries((p.stats || []).map((x) => [x.name, +x.value || 0]));
        const mins = (p.plays || []).map((x) => x.clock?.displayValue).filter(Boolean);
        const marks = [
          st.totalGoals ? `<span class="ev ev-goal" title="Golovi"></span>${st.totalGoals > 1 ? `×${st.totalGoals}` : ""}` : "",
          st.goalAssists ? `<small class="muted" title="Asistencije">A${st.goalAssists > 1 ? `×${st.goalAssists}` : ""}</small>` : "",
          st.yellowCards ? `<span class="ev ev-yellow" title="Žuti karton"></span>` : "",
          st.redCards ? `<span class="ev ev-red" title="Crveni karton"></span>` : "",
          p.subbedOut ? `<span class="ev-out" title="Izašao">↓ ${esc(mins.at(-1) || "")}</span>` : "",
          p.subbedIn ? `<span class="ev-in" title="Ušao${p.subbedInFor?.athlete ? ` umesto: ${esc(p.subbedInFor.athlete.displayName)}` : ""}">↑ ${esc(mins[0] || "")}</span>` : "",
        ].join(" ");
        return `<li class="${!p.starter && !p.subbedIn ? "unused" : ""}"><span class="lu-no">${esc(p.jersey || "")}</span>
          <span class="lu-name">${esc(p.athlete?.displayName || "")} <small class="muted">${esc(p.position?.abbreviation && p.position.abbreviation !== "SUB" ? p.position.abbreviation : "")}</small></span>
          <span class="lu-marks">${marks}</span></li>`;
      };
      const team = (r) => {
        const starters = r.roster.filter((p) => p.starter).sort((a, b) => (+a.formationPlace || 99) - (+b.formationPlace || 99));
        const bench = r.roster.filter((p) => !p.starter);
        return `<div><h4>${esc(r.team.displayName)}${r.formation ? ` <small class="muted">${esc(r.formation)}</small>` : ""}</h4>
          <ul class="gd-lu">${starters.map(player).join("")}</ul>
          ${bench.length ? `<p class="lu-bench">Klupa</p><ul class="gd-lu">${bench.map(player).join("")}</ul>` : ""}</div>`;
      };
      html += `<details class="gd-sec gd-players"${!started || live ? " open" : ""}><summary>Postave</summary>
        <div class="gd-lineups">${ordered.map(team).join("")}</div></details>`;
    }

    // Komentar minut po minut (ESPN, engleski): uživo poslednji na vrhu, posle utakmice ceo, sklopljeno.
    const comm = (s.commentary || []).filter((c) => c.text);
    if (comm.length) {
      const list = (items) => `<ul class="gd-plays">${items.map((c) => `<li><span class="gd-pq">${esc(c.time?.displayValue || "")}</span><span class="gd-pt">${esc(c.text)}</span><span></span></li>`).join("")}</ul>`;
      html += live ? `<section class="gd-sec"><h3>Komentar</h3>${list(comm.slice(-15).reverse())}</section>`
        : `<details class="gd-sec gd-players"><summary>Komentar minut po minut</summary>${list([...comm].reverse())}</details>`;
    }

    el.innerHTML = html + espnLink(s);
    return { live };
  }
  SC.espnSoccerDetail = soccerDetail;

  async function nflDetail(el, id, base) {
    const s = await getJSON(`${base}/summary?event=${id}`, 20000);
    let { html, state, started, away, home } = espnTop(s);

    // Uživo: tekući napad.
    if (state === "in") {
      const cur = s.drives?.current;
      if (cur) {
        const last = cur.plays?.at(-1);
        html += `<section class="gd-sec"><h3>Napad u toku · ${esc(cur.team?.abbreviation || "")}</h3>
          <p>${esc(cur.description || "")}</p>${last?.text ? `<p class="muted">Poslednja akcija: ${esc(last.text)}</p>` : ""}</section>`;
      }
    }

    if (!started) {
      const v = s.gameInfo?.venue;
      html += `<section class="gd-sec"><p>Utakmica još nije počela.${v?.fullName ? ` Stadion: ${esc(v.fullName)}${v.address?.city ? `, ${esc(v.address.city)}` : ""}.` : ""}</p></section>`;
    }

    if (started) html += espnLeaders(s, away, home, NFL_LEADERS);

    // Poeni (scoring plays) po četvrtinama.
    const plays = s.scoringPlays || [];
    if (plays.length) {
      html += `<section class="gd-sec"><h3>Poeni</h3><ul class="gd-plays">${plays.map((p) =>
        `<li><span class="gd-pq">${esc(p.period?.number > 4 ? "Prod." : `${p.period?.number}. čet.`)} ${esc(p.clock?.displayValue || "")}</span>
          <span class="gd-pt"><b>${esc(p.team?.abbreviation || "")}</b> ${esc(p.text || "")}</span>
          <span class="gd-ps">${esc(p.awayScore)}-${esc(p.homeScore)}</span></li>`).join("")}</ul></section>`;
    }

    if (started) html += espnTeamStats(s, away, home, NFL_TEAM_STATS);

    // Individualna statistika (pas, trčanje, hvatanje) - sklopljeno.
    const bp = s.boxscore?.players || [];
    if (started && bp.length) {
      let inner = "";
      for (const [cat, label] of Object.entries(NFL_PLAYER_CATS)) {
        for (const t of bp) {
          const c = t.statistics?.find((x) => x.name === cat);
          if (!c?.athletes?.length) continue;
          inner += `<h4>${label} · ${esc(t.team.abbreviation)}</h4>` + table(
            [{ label: "Igrač" }, ...(c.labels || []).map((l, i) => ({ label: l, title: c.descriptions?.[i], cls: "num" }))],
            c.athletes.map((a) => ({ cells: [esc(a.athlete?.displayName || ""), ...(a.stats || []).map(esc)] })));
        }
      }
      if (inner) html += `<details class="gd-sec gd-players"><summary>Statistika igrača</summary>${inner}</details>`;
    }

    el.innerHTML = html + espnLink(s);
    return { live: state === "in" };
  }

  const SEASON_GROUPS = { "Preseason": "Pripremne utakmice", "Regular Season": "Regularni deo", "Postseason": "Plej-of", "Off Season": "Van sezone" };

  espnLeague({
    id: "nfl", name: "NFL", short: "NFL", accent: "#1d4ed8", icon: "🏈", visual: "nfl",
    path: "football/nfl", mode: "week", standingsLevel: 3, standingsParams: { seasontype: 2 }, detail: nflDetail,
    sourceUrl: "https://www.espn.com/nfl/",
    weekLabel: (l) => l.replace(/^Week (\d+)$/, "Nedelja $1").replace(/^Preseason Week (\d+)$/, "Pripremna nedelja $1"),
    groupLabel: (l) => SEASON_GROUPS[l] || l,
    gameLabel: (e, c) => c.notes?.[0]?.headline || "",
    groupName: (n) => n.replace("American Football Conference", "AFC").replace("National Football Conference", "NFC"),
    columns: [
      { key: "wins", label: "P", title: "Pobede" },
      { key: "losses", label: "I", title: "Porazi" },
      { key: "ties", label: "N", title: "Nerešeno" },
      { key: "winPercent", label: "%", title: "Procenat pobeda" },
      { key: "pointsFor", label: "PF", title: "Postignuti poeni", cls: "hide-sm" },
      { key: "pointsAgainst", label: "PA", title: "Primljeni poeni", cls: "hide-sm" },
      { key: "differential", label: "+/-", title: "Razlika" },
      { key: "streak", label: "Niz", title: "Trenutni niz", cls: "hide-sm" },
      { key: "playoffSeed", label: "Nos.", title: "Nosilac u konferenciji (1–7 = plej-of)",
        render: (e) => { const v = stat(e, "playoffSeed")?.value; return v ? `<span class="${v <= 7 ? "seed-in" : ""}">${v}</span>` : ""; } },
    ],
    legend: `<p class="legend"><span class="seed-in">Nosilac 1–7</span> = trenutno u plej-ofu (pobednici divizija su nosioci 1–4).</p>`,
  });

  espnLeague({
    id: "nba", name: "NBA", short: "NBA", accent: "#c8102e", icon: "🏀", visual: "nba",
    path: "basketball/nba", mode: "day", standingsParams: { seasontype: 2 }, detail: nbaDetail,
    leaders: [["pointsPerGame", "Poeni"], ["reboundsPerGame", "Skokovi"], ["assistsPerGame", "Asistencije"], ["stealsPerGame", "Ukradene lopte"],
      ["blocksPerGame", "Blokade"], ["3PointsMadePerGame", "Pogođene trojke"], ["doubleDouble", "Double-double (ukupno)"], ["minutesPerGame", "Minuti"]],
    sourceUrl: "https://www.espn.com/nba/",
    gameLabel: (e, c) => c.notes?.[0]?.headline || (e.season?.slug === "preseason" ? "Pripremna" : ""),
    groupName: (n) => n.replace("Eastern Conference", "Istočna konferencija").replace("Western Conference", "Zapadna konferencija"),
    columns: [
      { key: "wins", label: "P", title: "Pobede" },
      { key: "losses", label: "I", title: "Porazi" },
      { key: "winPercent", label: "%", title: "Procenat pobeda" },
      { key: "gamesBehind", label: "Zaost.", title: "Zaostatak za prvim (utakmica)" },
      { key: "Home", label: "Kod kuće", cls: "hide-sm" },
      { key: "Road", label: "U gostima", cls: "hide-sm" },
      { key: "avgPointsFor", label: "Poena", title: "Prosek postignutih poena", cls: "hide-sm" },
      { key: "avgPointsAgainst", label: "Primlj.", title: "Prosek primljenih poena", cls: "hide-sm" },
      { key: "streak", label: "Niz", title: "Trenutni niz" },
    ],
    zone: (rank) => (rank <= 6 ? "z-po" : rank <= 10 ? "z-pi" : ""),
    legend: `<p class="legend"><span class="sw z-po"></span>Plej-of (1–6) <span class="sw z-pi"></span>Plej-in (7–10)</p>`,
  });
})();
