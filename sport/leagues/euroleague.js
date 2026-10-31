// Evroliga sa zvaničnih Evroliginih izvora. Isti izvori pokrivaju i Evrokup (kod "U").
// Raspored: feeds.incrowdsports.com (?limit=500 = cela sezona). NE api-live.euroleague.net/v2/.../games:
// njegov Cloudflare keš za stranicu otvorenu iz fajla (Origin: null) vraća odgovor bez CORS dozvole, pa
// pregledač blokira podatke („Failed to fetch“) - provereno 4. 10. 2026. Isti problem ima i api-live v3
// (tabela, lideri - 29. 10. 2026), pa i oni idu preko feeds.incrowdsports.com (vidi API ispod).
(() => {
  const { esc, getJSON, gamesByDay, overviewGames, table, pager, logo } = SC;
  // Tabela i lideri: isti Evroligin v3 API, ali preko feeds.incrowdsports.com. NE api-live.euroleague.net:
  // njegov Cloudflare keš zapamti odgovor upućen bez Origin zaglavlja (npr. tuđi server) i posle ga daje
  // i pregledaču - bez CORS dozvole - pa tabela/lideri povremeno padaju („Failed to fetch“); provereno
  // 29. 10. 2026. feeds.incrowdsports.com dodaje Access-Control-Allow-Origin: * uvek kad postoji Origin.
  const API = "https://feeds.incrowdsports.com/provider/euroleague-feeds";
  const FEED = "https://feeds.incrowdsports.com/provider/euroleague-feeds/v2";

  // Sezona počinje u julu: oktobar 2026 → E2026 (sezona 2026-27).
  function seasonCode(comp) {
    const d = new Date();
    return comp + (d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1);
  }

  const roundLabel = (r) => (/^Round (\d+)$/.test(r?.name || "") ? `Kolo ${r.round}` : r?.name || `Kolo ${r?.round}`);

  function normalize(g) {
    const start = new Date(g.date);
    const now = Date.now();
    const done = g.status === "result";
    const q = g.home.quarters || {};
    const ot = ["ot1", "ot2", "ot3", "ot4", "ot5"].filter((k) => q[k] != null);
    let status = "pre", statusText = "";
    if (done) {
      status = "post";
      statusText = ot.length ? "Kraj (prod.)" : "Kraj";
    } else if (g.quarter != null || (g.status !== "confirmed" && now >= start)) {
      status = "in";
      statusText = g.quarter ? `${g.quarter}. četvrtina${g.remainingTime ? ` · ${g.remainingTime}` : ""}` : "U toku";
    } else if (now >= start && now < +start + 3 * 3600e3) {
      status = "in"; statusText = "U toku";
    }
    const side = (s, o) => {
      const p = s.quarters || {};
      return {
        name: s.abbreviatedName || s.name,
        abbr: s.tla || s.code,
        logo: s.imageUrls?.crest,
        score: s.score,
        winner: done && s.score > o.score,
        lines: status === "pre" ? [] : [p.q1, p.q2, p.q3, p.q4, ...ot.map((k) => p[k])].filter((v) => v != null),
      };
    };
    return {
      id: g.identifier, code: g.code, start, status, statusText,
      round: g.round?.round, phase: g.phaseType?.code,
      label: roundLabel(g.round),
      venue: (g.venue?.name || "").toLowerCase().split(" ").map(SC.cap).join(" "),
      // Evropska konvencija: domaćin gore.
      teams: [side(g.home, g.away), side(g.away, g.home)],
    };
  }

  function competition(cfg) {
    const season = seasonCode(cfg.comp);
    const href = (v) => `#/${cfg.id}/utakmice/${v}`;

    async function games() {
      const j = await getJSON(`${FEED}/competitions/${cfg.comp}/seasons/${season}/games?limit=500`, 60000);
      return j.data.map((x) => ({ ...normalize(x), detail: `${cfg.id}:${x.code}` }));
    }

    function rounds(list) {
      const m = new Map();
      for (const g of list) {
        const r = m.get(g.round) || { round: g.round, label: g.label, from: g.start, to: g.start, open: 0 };
        if (g.start < r.from) r.from = g.start;
        if (g.start > r.to) r.to = g.start;
        if (g.status !== "post") r.open++;
        m.set(g.round, r);
      }
      return [...m.values()].sort((a, b) => a.round - b.round);
    }

    async function renderGames(el, arg) {
      const list = await games();
      const rs = rounds(list);
      // Podrazumevano: prvo kolo koje još nije završeno.
      const cur = arg ? +arg : (rs.find((r) => r.open)?.round ?? rs.at(-1)?.round);
      const options = rs.map((r) => {
        const from = SC.fmt.dayMonth.format(r.from), to = SC.fmt.dayMonth.format(r.to);
        return { value: String(r.round), label: `${r.label} · ${from === to ? from : `${from} – ${to}`}` };
      });
      el.innerHTML = `<div class="toolbar"></div><div class="list"></div>`;
      pager(el.querySelector(".toolbar"), options, String(cur), href,
        `<a class="btn ghost" href="#/${cfg.id}/utakmice">Tekuće kolo</a>`);
      const inRound = list.filter((g) => g.round === cur);
      el.querySelector(".list").innerHTML = gamesByDay(inRound);
      return { live: inRound.some((g) => g.status === "in") };
    }

    async function renderStandings(el) {
      const list = await games();
      const played = list.filter((g) => g.status === "post" && g.phase === "RS");
      const round = Math.max(1, ...played.map((g) => g.round));
      const j = await getJSON(`${API}/v3/competitions/${cfg.comp}/seasons/${season}/rounds/${round}/basicstandings`, 120000);
      const cols = [
        { label: "#", cls: "num" }, { label: "Klub", cls: "team" },
        { label: "Ut.", title: "Odigrano", cls: "num" },
        { label: "P", title: "Pobede", cls: "num" }, { label: "I", title: "Porazi", cls: "num" },
        { label: "%", title: "Procenat pobeda", cls: "num hide-sm" },
        { label: "Kod kuće", cls: "num hide-sm" }, { label: "U gostima", cls: "num hide-sm" },
        { label: "+/-", title: "Koš razlika", cls: "num" },
        { label: "Forma", title: "Poslednjih 5 utakmica", cls: "form hide-sm" },
      ];
      const rows = j.teams.map((t) => ({
        cls: cfg.zone(t.position),
        cells: [
          String(t.position),
          `<span class="tcell">${logo(t.club.images?.crest, t.club.tvCode)}<span class="n-full">${esc(t.club.name)}</span><span class="n-short">${esc(t.club.abbreviatedName || t.club.tvCode)}</span></span>`,
          t.gamesPlayed, t.gamesWon, t.gamesLost, esc(t.winPercentage), esc(t.homeRecord), esc(t.awayRecord),
          esc(t.pointsDifference),
          (t.last5Form || []).map((f) => `<span class="fm fm-${f === "W" ? "w" : "l"}">${f === "W" ? "P" : "I"}</span>`).join(""),
        ].map(String),
      }));
      el.innerHTML = `<p class="hint">Sezona ${esc(season.slice(1))}-${String(+season.slice(-4) + 1).slice(2)} · posle ${round}. kola</p>`
        + table(cols, rows) + cfg.legend;
      return {};
    }

    // Vrh tabele za panel na početnoj strani.
    async function miniTable() {
      const list = await games();
      const played = list.filter((g) => g.status === "post" && g.phase === "RS");
      if (!played.length) return "";
      const round = Math.max(...played.map((g) => g.round));
      const j = await getJSON(`${API}/v3/competitions/${cfg.comp}/seasons/${season}/rounds/${round}/basicstandings`, 120000);
      return `<ol class="mini-tbl">${j.teams.slice(0, 5).map((t) =>
        `<li class="${cfg.zone(t.position)}"><span class="mt-pos">${t.position}</span>${logo(t.club.images?.crest, t.club.tvCode)}<span class="mt-name">${esc(t.club.abbreviatedName || t.club.name)}</span><span class="mt-val"><b>${t.gamesWon}-${t.gamesLost}</b></span></li>`).join("")}</ol>`;
    }

    // Lideri sezone: zvanični Evroligin izvor (prosek po utakmici; procenti sa minimumom pokušaja).
    const LEADERS = [["points", "Poeni"], ["rebounds", "Skokovi"], ["assists", "Asistencije"], ["pir", "Indeks (PIR)"],
      ["steals", "Ukradene lopte"], ["blocks", "Blokade"], ["threePointersPercentage", "Šut za 3 %"], ["twoPointersPercentage", "Šut za 2 %"]];
    const leadersData = () => getJSON(`${API}/v3/competitions/${cfg.comp}/statistics/players/leaders?seasonMode=Single&seasonCode=${season}&statisticMode=PerGame&limit=10`, 300000);
    const num = (v) => (typeof v === "number" ? v.toLocaleString("sr-Latn-RS", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : String(v ?? "").replace(".", ","));
    const leaderRows = (list, n = 10) => (list || []).slice(0, n).map((x) => ({
      img: x.details?.imageUrl, name: personName(x.details?.name), team: x.details?.team?.tvCodes || x.details?.team?.code,
      teamLogo: x.details?.team?.imageUrl, value: num(x.average ?? x.value), sub: x.gamesPlayed ? `${x.gamesPlayed} ut.` : "",
    }));

    async function renderLeaders(el) {
      const d = await leadersData();
      const boards = LEADERS.map(([k, label]) => SC.leaderBoard(label, leaderRows(d[k]))).join("");
      el.innerHTML = `<p class="hint">Sezona ${esc(season.slice(1))}-${String(+season.slice(-4) + 1).slice(2)} · prosek po utakmici · zvanični podaci Evrolige</p>`
        + (boards ? `<div class="lb-grid">${boards}</div>` : `<p class="empty">Lideri će biti dostupni posle prvog kola.</p>`);
      return {};
    }

    async function overview(el) {
      const [list, mini, lead] = await Promise.all([games(), miniTable().catch(() => ""), leadersData().catch(() => null)]);
      const ov = overviewGames(list);
      const scorers = leaderRows(lead?.points, 3);
      el.innerHTML = ov.html + (mini ? `<h4 class="ov-h">Tabela · <a href="#/${cfg.id}/tabela">cela</a></h4>${mini}` : "")
        + (scorers.length ? `<h4 class="ov-h">Najbolji strelci · <a href="#/${cfg.id}/lideri">lideri</a></h4><ol class="mini-tbl">${scorers.map((r, i) =>
          `<li><span class="mt-pos">${i + 1}</span>${logo(r.teamLogo, r.team)}<span class="mt-name">${esc(r.name)}</span><span class="mt-val"><b>${esc(r.value)}</b> <small class="muted">poena</small></span></li>`).join("")}</ol>` : "");
      return { live: ov.live };
    }

    SC.registerLeague({
      id: cfg.id, name: cfg.name, short: cfg.short, accent: cfg.accent, icon: cfg.icon, visual: cfg.visual,
      events: games, miniTable,
      source: { label: "EuroLeague", url: cfg.sourceUrl },
      tabs: [
        { id: "utakmice", label: "Raspored i rezultati", render: renderGames },
        { id: "tabela", label: "Tabela", render: renderStandings },
        { id: "lideri", label: "Lideri", render: renderLeaders },
      ],
      overview,
    });

    SC.registerDetail(cfg.id, async (el, code) => {
      const g = (await games()).find((x) => String(x.code) === String(code));
      if (!g) throw new Error("Utakmica nije pronađena.");
      return gameDetail(el, g, season);
    });
  }

  // ------------------------------------------------------------ detalji utakmice
  // Evroligin live izvor (live.euroleague.net/api, isti kao njihov zvanični prikaz utakmice): Header (rezultat,
  // četvrtina, vreme), Boxscore (statistika igrača i ekipa), PlayByPlay (akcija po akcija). CORS radi i za
  // Origin: null (provereno 8. 10. 2026). Pre početka utakmice vraća prazan odgovor.
  const LIVE = "https://live.euroleague.net/api";

  // "HIFI, NADIR" → "Nadir Hifi"
  const personName = (s) => {
    const [last, first] = String(s || "").split(",").map((x) => x.trim());
    // Inicijali bez samoglasnika (TJ, CJ) i rimski brojevi (II, IV) ostaju velikim slovima; JR/SR → Jr/Sr.
    const word = (w) => (/^(I{2,3}|IV|VI{0,3})$/.test(w) || (/^[A-Z]{2,3}$/.test(w) && !/[AEIOUY]/.test(w) && !/^(JR|SR)$/.test(w))
      ? w : w.toLowerCase().replace(/(^|['-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()));
    const tc = (s) => s.split(/\s+/).filter(Boolean).map(word).join(" ");
    return first ? `${tc(first)} ${tc(last)}` : tc(last);
  };
  const pct = (m, a) => (a ? `${m}/${a} (${Math.round((100 * m) / a)}%)` : `${m}/${a}`);
  const QNAMES = { FirstQuarter: "1.", SecondQuarter: "2.", ThirdQuarter: "3.", ForthQuarter: "4.", ExtraTime: "Prod." };

  async function gameDetail(el, g, season) {
    const [home, away] = g.teams;
    const head = (score, status, statusCls) => `<div class="gd-head">
      <div class="gd-team">${logo(home.logo, home.abbr)}<b>${esc(home.name)}</b><small class="muted">domaćin</small></div>
      <div class="gd-score"><div class="gd-nums">${score}</div><div class="gd-status ${statusCls}">${status}</div></div>
      <div class="gd-team">${logo(away.logo, away.abbr)}<b>${esc(away.name)}</b><small class="muted">gost</small></div>
    </div>`;

    if (g.status === "pre") {
      el.innerHTML = head(`<span class="muted">vs</span>`, esc(SC.when(g.start)), "pre") +
        `<section class="gd-sec"><p>Utakmica još nije počela.${g.venue ? ` Dvorana: ${esc(g.venue)}.` : ""} ${esc(g.label)}.</p>
        <p class="muted">Statistika i tok utakmice pojavljuju se ovde čim počne, i osvežavaju se sami.</p></section>`;
      return { live: false };
    }

    const q = `gamecode=${g.code}&seasoncode=${season}`;
    const [h, box, pbp] = await Promise.all([
      getJSON(`${LIVE}/Header?${q}`, 15000).catch(() => null),
      getJSON(`${LIVE}/Boxscore?${q}`, 15000).catch(() => null),
      getJSON(`${LIVE}/PlayByPlay?${q}`, 15000).catch(() => null),
    ]);
    const live = !!(h?.Live || box?.Live) || (g.status === "in" && !h);

    // Rezultat i status: live izvor ima prednost, raspored je rezerva.
    const sA = h?.ScoreA ?? home.score, sB = h?.ScoreB ?? away.score;
    const done = !live && g.status === "post";
    const qtxt = h?.Quarter ? (/^\d$/.test(h.Quarter) ? `${h.Quarter}. četvrtina` : h.Quarter.replace(/^OT/i, "Produžetak")) : "";
    const status = live ? `<span class="live-dot"></span>${esc([qtxt, h?.RemainingPartialTime].filter(Boolean).join(" · ") || g.statusText || "U toku")}`
      : esc(done ? g.statusText || "Kraj" : g.statusText || "");
    let html = head(`<span class="${done && +sA > +sB ? "w" : ""}">${esc(sA)}</span><span class="muted">:</span><span class="${done && +sB > +sA ? "w" : ""}">${esc(sB)}</span>`,
      status, live ? "in" : "");

    // Po četvrtinama.
    const bq = box?.ByQuarter;
    if (bq?.length === 2) {
      const ks = ["Quarter1", "Quarter2", "Quarter3", "Quarter4"];
      const ot = [h?.ScoreExtraTimeA, h?.ScoreExtraTimeB];
      const hasOt = ot.some((v) => v != null && v !== "" && +v > 0);
      const row = (t, abbr, total, extra) => `<tr><td>${esc(abbr)}</td>${ks.map((k) => `<td>${esc(t[k] ?? "")}</td>`).join("")}${hasOt ? `<td>${esc(extra ?? "")}</td>` : ""}<td><b>${esc(total)}</b></td></tr>`;
      html += `<table class="gd-q"><thead><tr><th></th><th>1.</th><th>2.</th><th>3.</th><th>4.</th>${hasOt ? "<th>Prod.</th>" : ""}<th>Ukupno</th></tr></thead>
        <tbody>${row(bq[0], home.abbr, sA, ot[0])}${row(bq[1], away.abbr, sB, ot[1])}</tbody></table>`;
    }
    if (live && h) {
      html += `<p class="hint gd-center">Lične greške ekipe u četvrtini: ${esc(home.abbr)} ${esc(h.FoultsA ?? 0)} - ${esc(h.FoultsB ?? 0)} ${esc(away.abbr)}</p>`;
    }

    const stats = box?.Stats || [];
    const [tA, tB] = stats;
    if (!tA || !tB) {
      el.innerHTML = html + `<section class="gd-sec"><p class="muted">Statistika još nije dostupna.</p></section>`;
      return { live };
    }
    const players = (t) => (t.PlayersStats || []).filter((p) => p.Player);

    // Najbolji igrači po kategorijama.
    const best = (t, k) => players(t).reduce((m, p) => ((p[k] ?? -99) > (m?.[k] ?? -99) ? p : m), null);
    const LEADERS = [["Points", "Poeni"], ["TotalRebounds", "Skokovi"], ["Assistances", "Asistencije"], ["Valuation", "Indeks (PIR)"]];
    const leadCell = (t, k) => { const p = best(t, k); return p ? `<b>${esc(personName(p.Player))}</b><br><small class="muted">${esc(p[k])}</small>` : "-"; };
    html += `<section class="gd-sec"><h3>Najbolji igrači</h3><div class="tbl-wrap"><table class="st gd-lead"><thead><tr><th></th>
      <th>${esc(home.abbr)}</th><th>${esc(away.abbr)}</th></tr></thead><tbody>${LEADERS.map(([k, label]) =>
      `<tr><td class="muted">${label}</td><td>${leadCell(tA, k)}</td><td>${leadCell(tB, k)}</td></tr>`).join("")}</tbody></table></div></section>`;

    // Akcije: uživo poslednje na vrhu; posle utakmice sklopljeno.
    const plays = pbp ? Object.entries(QNAMES).flatMap(([k, qn]) => (pbp[k] || []).map((p) => ({ ...p, qn }))) : [];
    const shown = plays.filter((p) => p.PLAYINFO && !/^(Begin Period|End Period|End Game)$/i.test(p.PLAYINFO.trim())).slice(-15).reverse();
    // Akcije nose Evroligin kod kluba (npr. PRS), a ostatak prozora skraćenice iz rasporeda (PBB).
    const teamAbbr = (c) => {
      const code = String(c || "").trim();
      return code === String(h?.CodeTeamA || "").trim() ? home.abbr : code === String(h?.CodeTeamB || "").trim() ? away.abbr : code;
    };
    if (shown.length) {
      const list = `<ul class="gd-plays">${shown.map((p) => `<li><span class="gd-pq">${esc(p.qn)} čet. ${esc(p.MARKERTIME || "")}</span>
        <span class="gd-pt">${p.PLAYER ? `<b>${esc(personName(p.PLAYER))}</b> <span class="muted">(${esc(teamAbbr(p.CODETEAM))})</span> ` : ""}${esc(p.PLAYINFO)}</span>
        <span class="gd-ps">${p.POINTS_A != null ? `${esc(p.POINTS_A)}-${esc(p.POINTS_B)}` : ""}</span></li>`).join("")}</ul>`;
      html += live ? `<section class="gd-sec"><h3>Poslednje akcije</h3>${list}</section>`
        : `<details class="gd-sec gd-players"><summary>Poslednje akcije utakmice</summary>${list}</details>`;
    }

    // Statistika ekipa.
    const a = tA.totr || {}, b = tB.totr || {};
    const TEAM = [
      ["Šut za 2", (t) => pct(t.FieldGoalsMade2, t.FieldGoalsAttempted2)],
      ["Šut za 3", (t) => pct(t.FieldGoalsMade3, t.FieldGoalsAttempted3)],
      ["Slobodna bacanja", (t) => pct(t.FreeThrowsMade, t.FreeThrowsAttempted)],
      ["Skokovi (napad + odbrana)", (t) => `${t.TotalRebounds} (${t.OffensiveRebounds} + ${t.DefensiveRebounds})`],
      ["Asistencije", (t) => t.Assistances], ["Ukradene lopte", (t) => t.Steals], ["Izgubljene lopte", (t) => t.Turnovers],
      ["Blokade", (t) => t.BlocksFavour], ["Lične greške", (t) => t.FoulsCommited], ["Indeks (PIR)", (t) => t.Valuation],
    ];
    html += `<section class="gd-sec"><h3>Statistika ekipa</h3><div class="tbl-wrap"><table class="st gd-stats"><thead><tr>
      <th class="num">${esc(home.abbr)}</th><th></th><th class="num">${esc(away.abbr)}</th></tr></thead><tbody>${TEAM.map(([label, f]) =>
      `<tr><td class="num">${esc(f(a) ?? "")}</td><td class="gd-mid muted">${label}</td><td class="num">${esc(f(b) ?? "")}</td></tr>`).join("")}</tbody></table></div></section>`;

    // Statistika igrača.
    const cols = [
      { label: "#", cls: "num" }, { label: "Igrač" }, { label: "Min", cls: "num" }, { label: "Poeni", cls: "num" },
      { label: "2P", title: "Šut za 2 (pogođeno/pokušaja)", cls: "num" }, { label: "3P", title: "Šut za 3", cls: "num" },
      { label: "SB", title: "Slobodna bacanja", cls: "num" }, { label: "Sk", title: "Skokovi", cls: "num" },
      { label: "As", title: "Asistencije", cls: "num" }, { label: "Uk", title: "Ukradene lopte", cls: "num" },
      { label: "IL", title: "Izgubljene lopte", cls: "num" }, { label: "Bl", title: "Blokade", cls: "num" },
      { label: "PIR", title: "Indeks korisnosti", cls: "num" }, { label: "+/-", cls: "num" },
    ];
    const ptable = (t) => table(cols, players(t).map((p) => ({
      cls: live && p.IsPlaying ? "on-court" : "",
      cells: [esc(p.Dorsal), `${esc(personName(p.Player))}${p.IsStarter ? ` <small class="muted" title="Starter">S</small>` : ""}`,
        esc(p.Minutes || "DNP"), `<b>${esc(p.Points)}</b>`, `${p.FieldGoalsMade2}/${p.FieldGoalsAttempted2}`,
        `${p.FieldGoalsMade3}/${p.FieldGoalsAttempted3}`, `${p.FreeThrowsMade}/${p.FreeThrowsAttempted}`,
        esc(p.TotalRebounds), esc(p.Assistances), esc(p.Steals), esc(p.Turnovers), esc(p.BlocksFavour), esc(p.Valuation), esc(p.Plusminus ?? "")],
    })));
    html += `<details class="gd-sec gd-players"${live ? " open" : ""}><summary>Statistika igrača</summary>
      <h4>${esc(home.name)}${h?.CoachA ? ` · trener ${esc(personName(h.CoachA))}` : ""}</h4>${ptable(tA)}
      <h4>${esc(away.name)}${h?.CoachB ? ` · trener ${esc(personName(h.CoachB))}` : ""}</h4>${ptable(tB)}
      ${live ? `<p class="hint">Istaknuti su igrači koji su trenutno na terenu. S = starter.</p>` : `<p class="hint">S = starter.</p>`}</details>`;

    // "RYZHYK, BORYS, RACYS, SAULIUS" → parovi prezime/ime
    const rp = String(box.Referees || "").split(",").map((x) => x.trim()).filter(Boolean);
    const refs = [];
    for (let i = 0; i + 1 < rp.length; i += 2) refs.push(personName(`${rp[i]}, ${rp[i + 1]}`));
    const info = [g.venue && `Dvorana: ${esc(g.venue)}`, box.Attendance && `gledalaca: ${esc(box.Attendance)}`,
      refs.length && `sudije: ${esc(refs.join(", "))}`].filter(Boolean).join(" · ");
    if (info) html += `<p class="gd-foot muted">${info}</p>`;
    el.innerHTML = html;
    return { live };
  }

  competition({
    id: "evroliga", name: "Evroliga", short: "Evroliga", comp: "E", accent: "#ea580c", icon: "🏀", visual: "el",
    sourceUrl: "https://www.euroleaguebasketball.net/euroleague/",
    zone: (p) => (p <= 6 ? "z-po" : p <= 10 ? "z-pi" : ""),
    legend: `<p class="legend"><span class="sw z-po"></span>Plej-of (1–6) <span class="sw z-pi"></span>Plej-in (7–10)</p>`,
  });
})();
