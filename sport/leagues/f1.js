// Formula 1 sa Jolpica API-ja (naslednik Ergast-a): api.jolpi.ca/ergast/f1
(() => {
  const { esc, getJSON, table, fmt, relDay } = SC;
  const API = "https://api.jolpi.ca/ergast/f1";

  const TEAM_COLORS = {
    mercedes: "#27f4d2", ferrari: "#e8002d", mclaren: "#ff8000", red_bull: "#3671c6", rb: "#6692ff",
    alpine: "#0093cc", haas: "#b6babd", audi: "#f50537", sauber: "#52e252", williams: "#64c4ff",
    aston_martin: "#229971", cadillac: "#8c8f94",
  };
  const SESSIONS = [
    ["FirstPractice", "Trening 1"], ["SecondPractice", "Trening 2"], ["ThirdPractice", "Trening 3"],
    ["SprintQualifying", "Sprint kvalifikacije"], ["Sprint", "Sprint"], ["Qualifying", "Kvalifikacije"],
  ];

  // Ikonica F1 bolida (bočno), iste veličine i jačine kao emoji ikonice ostalih liga (🏈 🏀 ⚽).
  const F1_ICON = `<svg class="ic-svg" viewBox="0 0 32 20" aria-hidden="true">
    <path d="M1.5 15.2 4.8 10.6l7.4-1.2 2.4-4.1h6.6l2.2 3.9 4.8.8V5.6h3.3v9.6z" fill="#e10600"/>
    <path d="M4.8 13.4h22.6" stroke="#9e0400" stroke-width="1.6"/>
    <path d="M13.6 9.7h9.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="18" cy="6.9" r="2.1" fill="#ffd400" stroke="#1b1d20" stroke-width=".8"/>
    <rect x=".5" y="14.6" width="9.5" height="2.6" rx="1.3" fill="#b80500"/>
    <circle cx="8.6" cy="15.6" r="4" fill="#1b1d20" stroke="#a3a8ae" stroke-width="1.6"/>
    <circle cx="25.4" cy="15.6" r="4" fill="#1b1d20" stroke="#a3a8ae" stroke-width="1.6"/>
  </svg>`;

  const at = (o) => (o?.date ? new Date(`${o.date}T${o.time || "12:00:00Z"}`) : null);
  const raceStart = (r) => at(r);
  const team = (c) => `<span class="team-c"><i style="background:${TEAM_COLORS[c.constructorId] || "var(--muted)"}"></i>${esc(c.name.replace(/ F1 Team$/, ""))}</span>`;
  const driver = (d) => `<span class="drv"><b>${esc(d.code || "")}</b> <span class="n-full">${esc(d.givenName)} </span>${esc(d.familyName)}</span>`;

  function sessions(r) {
    return [...SESSIONS.filter(([k]) => r[k]).map(([k, label]) => ({ label, d: at(r[k]), timed: !!r[k].time })),
      { label: "Trka", d: raceStart(r), timed: !!r.time, race: true }].sort((a, b) => a.d - b.d);
  }

  function statusText(res) {
    if (res.Time?.time) return esc(res.Time.time);
    const s = res.status || "";
    if (/^\+1 Laps?$/.test(s)) return "+1 krug";
    const m = s.match(/^\+(\d+) Laps$/);
    if (m) return `+${m[1]} kruga`;
    return esc({ Lapped: "Zaostao krug", Retired: "Odustao", Disqualified: "Diskvalifikovan", "Did not start": "Nije startovao", Finished: "Završio" }[s] || s);
  }

  async function season() {
    const [cal, win] = await Promise.all([
      getJSON(`${API}/current.json`, 3600e3),
      getJSON(`${API}/current/results/1.json?limit=50`, 300e3),
    ]);
    const races = cal.MRData.RaceTable.Races;
    const winners = new Map(win.MRData.RaceTable.Races.map((r) => [r.round, r.Results[0]]));
    const nextRace = races.find((r) => !winners.has(r.round) && raceStart(r) > Date.now() - 4 * 3600e3);
    return { year: cal.MRData.RaceTable.season, races, winners, nextRace };
  }

  // Jolpica rezultate objavljuje sa zakašnjenjem (nekad i dan kasnije). Za trku koja je prošla, a još nema
  // zvaničan rezultat, prikazuje se nezvaničan: iz zvaničnog F1 toka (poredak, timovi, razmaci) dok je to
  // poslednja sesija, inače sa ESPN-a (samo redosled). Čim Jolpica objavi, ovo se više ne koristi.
  const RACE_DONE_AFTER = 2.5 * 3600e3;
  const pendingRaces = (races, winners) => races.filter((r) => !winners.has(r.round) && raceStart(r) < Date.now() - RACE_DONE_AFTER);
  const provCache = new Map();

  async function provisional(r) {
    const hit = provCache.get(r.round);
    if (hit && Date.now() - hit.t < 120000) return hit.v;
    let v = null;
    try {
      const rows = SC.f1live.classification(await SC.f1live.snapshot(), +raceStart(r));
      if (rows?.length) v = { source: "zvanični F1 live timing", rows };
    } catch { /* probaj ESPN */ }
    if (!v) {
      try {
        const d = await getJSON(`https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard?dates=${r.date.replace(/-/g, "")}`, 300e3);
        for (const e of d.events || []) {
          const c = (e.competitions || []).find((x) => x.type?.abbreviation === "Race" && x.status?.type?.state === "post");
          if (c && Math.abs(Date.parse(c.date) - raceStart(r)) < 36 * 3600e3) {
            const rows = [...c.competitors].filter((x) => x.order).sort((a, b) => a.order - b.order)
              .map((x) => ({ pos: String(x.order), code: "", name: x.athlete?.displayName || "", team: "", color: "", laps: "", gap: "" }));
            if (rows.length) v = { source: "ESPN", rows };
          }
        }
      } catch { /* nema rezervnog izvora */ }
    }
    provCache.set(r.round, { t: Date.now(), v });
    return v;
  }

  const provDriver = (x) => x.code
    ? `<span class="team-c live-drv">${x.color ? `<i style="background:${esc(x.color)}"></i>` : ""}<b>${esc(x.code)}</b><span class="n-full">${esc(x.name)}</span></span>`
    : `<span class="drv">${esc(x.name)}</span>`;
  const provTag = `<span class="tag tag-prov" title="Zvanični rezultat još nije objavljen">nezvanično</span>`;

  function dateRange(r) {
    const s = sessions(r);
    const a = s[0].d, b = s.at(-1).d;
    return a.getMonth() === b.getMonth()
      ? `${a.getDate()}–${fmt.dayMonth.format(b)}`
      : `${fmt.dayMonth.format(a)} – ${fmt.dayMonth.format(b)}`;
  }

  async function renderCalendar(el, arg) {
    if (arg) return renderRace(el, arg);
    const { year, races, winners, nextRace } = await season();
    const pending = pendingRaces(races, winners);
    const prov = new Map(await Promise.all(pending.slice(-2).map(async (r) => [r.round, await provisional(r)])));
    const items = races.map((r) => {
      const w = winners.get(r.round);
      const isNext = r === nextRace;
      const p = !w && pending.includes(r) ? prov.get(r.round) : null;
      const win = w ? `🏆 ${driver(w.Driver)}${team(w.Constructor)}`
        : p ? `<span>🏆 ${provDriver(p.rows[0])} ${provTag}</span>${p.rows[0].team ? `<span class="team-c">${esc(p.rows[0].team)}</span>` : ""}`
        : pending.includes(r) ? `<span class="muted">Završena · rezultati uskoro</span>`
        : isNext ? esc(SC.when(raceStart(r))) : "";
      return `<a class="race${w || pending.includes(r) ? " done" : ""}${isNext ? " next" : ""}" href="#/f1/kalendar/${r.round}">
        <span class="race-rnd">${r.round}</span>
        <span class="race-main">
          <span class="race-name">${esc(r.raceName)}${r.Sprint ? ` <span class="tag">Sprint</span>` : ""}${isNext ? ` <span class="tag tag-acc">Sledeća</span>` : ""}</span>
          <span class="race-sub">${esc(r.Circuit.Location.locality)}, ${esc(r.Circuit.Location.country)} · ${esc(dateRange(r))}</span>
        </span>
        <span class="race-win">${win}</span>
      </a>`;
    }).join("");
    el.innerHTML = `<p class="hint">Sezona ${esc(year)} · ${races.length} trka · klikni na trku za satnicu i rezultate</p><div class="races">${items}</div>`;
    return {};
  }

  function resultsTable(results, sprint) {
    const cols = [
      { label: "Poz.", cls: "num" }, { label: "Vozač" }, { label: "Tim", cls: "hide-sm" },
      { label: "Start", title: "Startna pozicija", cls: "num hide-sm" }, { label: "Krugova", cls: "num hide-sm" },
      { label: "Vreme / status" }, { label: "Bod.", title: "Bodovi", cls: "num" },
    ];
    return table(cols, results.map((x) => ({
      cls: x.position <= 3 ? "podium" : "",
      cells: [
        esc(x.positionText === "R" ? "-" : x.positionText),
        driver(x.Driver) + (x.FastestLap?.rank === "1" && !sprint ? ` <span class="tag tag-fl" title="Najbrži krug ${esc(x.FastestLap.Time?.time)}">NK</span>` : ""),
        team(x.Constructor), esc(x.grid === "0" ? "PL" : x.grid), esc(x.laps), statusText(x), esc(x.points),
      ],
    })));
  }

  async function renderRace(el, round) {
    const { races, nextRace } = await season();
    const r = races.find((x) => x.round === round);
    if (!r) { el.innerHTML = `<p class="empty">Trka nije pronađena.</p>`; return {}; }
    const now = Date.now();
    const sess = sessions(r).map((s) => `<tr class="${s.d < now ? "past" : ""}${s.race ? " race-row" : ""}">
      <td>${esc(s.label)}</td><td>${esc(relDay(s.d))}</td><td class="num">${s.timed ? esc(fmt.time.format(s.d)) : "-"}</td></tr>`).join("");
    const started = raceStart(r) < now || +round < +(nextRace?.round || 999);
    const [res, quali, spr] = await Promise.all([
      getJSON(`${API}/current/${round}/results.json`, 120000),
      getJSON(`${API}/current/${round}/qualifying.json`, 120000),
      r.Sprint ? getJSON(`${API}/current/${round}/sprint.json`, 120000) : null,
    ]);
    const raceRes = res.MRData.RaceTable.Races[0]?.Results || [];
    const qRes = quali.MRData.RaceTable.Races[0]?.QualifyingResults || [];
    const sRes = spr?.MRData.RaceTable.Races[0]?.SprintResults || [];
    const loc = r.Circuit.Location;

    let html = `<a class="back" href="#/f1/kalendar">‹ Kalendar</a>
      <div class="race-head">
        <span class="race-rnd big">${esc(r.round)}</span>
        <div><h2>${esc(r.raceName)}</h2>
        <p class="hint">${esc(r.Circuit.circuitName)} · ${esc(loc.locality)}, ${esc(loc.country)}</p></div>
      </div>
      <div class="race-grid">
        <section class="card"><h3>Satnica <small>(tvoje lokalno vreme)</small></h3>
          <table class="sess">${sess}</table></section>`;
    let raceBody;
    if (raceRes.length) raceBody = resultsTable(raceRes);
    else if (raceStart(r) < now - RACE_DONE_AFTER) {
      const p = await provisional(r);
      raceBody = p
        ? `<p class="hint prov-note">${provTag} Zvanični rezultati i bodovi još nisu objavljeni - ovo je konačan poredak sa izvora: ${esc(p.source)}. Zameniće ga zvanični čim budu objavljeni.</p>` +
          table([{ label: "Poz.", cls: "num" }, { label: "Vozač" }, { label: "Tim", cls: "hide-sm" }, { label: "Krugova", cls: "num hide-sm" }, { label: "Razmak / status" }],
            p.rows.map((x) => ({ cls: +x.pos <= 3 ? "podium" : "", cells: [esc(x.pos), provDriver(x), esc(x.team), esc(x.laps), esc(x.gap)] })))
        : `<p class="empty">Trka je završena, ali zvanični rezultati još nisu objavljeni.</p>`;
    } else raceBody = `<p class="empty">${started ? `Trka je u toku - prati je na kartici <a href="#/f1/uzivo">Uživo</a>.` : "Rezultati će biti dostupni posle trke."}</p>`;
    html += `<section class="card"><h3>Trka</h3>${raceBody}</section>`;
    html += `</div>`;
    if (sRes.length) html += `<section class="card"><h3>Sprint</h3>${resultsTable(sRes, true)}</section>`;
    if (qRes.length) {
      html += `<section class="card"><h3>Kvalifikacije</h3>${table(
        [{ label: "Poz.", cls: "num" }, { label: "Vozač" }, { label: "Tim", cls: "hide-sm" }, { label: "Q1", cls: "num" }, { label: "Q2", cls: "num" }, { label: "Q3", cls: "num" }],
        qRes.map((q) => ({ cells: [esc(q.position), driver(q.Driver), team(q.Constructor), esc(q.Q1 || ""), esc(q.Q2 || ""), esc(q.Q3 || "")] })),
      )}</section>`;
    }
    el.innerHTML = html;
    return {};
  }

  async function renderChampionship(el) {
    const [ds, cs] = await Promise.all([
      getJSON(`${API}/current/driverStandings.json`, 300e3),
      getJSON(`${API}/current/constructorStandings.json`, 300e3),
    ]);
    const dl = ds.MRData.StandingsTable.StandingsLists[0];
    const cl = cs.MRData.StandingsTable.StandingsLists[0];
    if (!dl) { el.innerHTML = `<p class="empty">Šampionat još nije počeo.</p>`; return {}; }
    const bar = (p, max) => `<span class="pts"><span class="pts-bar" style="width:${max ? (100 * p) / max : 0}%"></span><b>${p}</b></span>`;
    const dMax = +dl.DriverStandings[0].points, cMax = +(cl?.ConstructorStandings[0]?.points || 0);
    const { races, winners } = await season();
    // Jolpica ponekad napravi tabelu za sledeću rundu pre nego što unese rezultate (oznaka „runda 16“, a bodovi
    // posle 15.) - zato se broj trka uzima iz poslednje trke koja zaista ima zvaničan rezultat.
    const done = Math.min(+dl.round, Math.max(0, ...[...winners.keys()].map(Number)));
    const missing = pendingRaces(races, winners).filter((r) => +r.round > done);
    el.innerHTML = `<p class="hint">Sezona ${esc(dl.season)} · posle ${done}. trke${missing.length
      ? ` · <b>bodovi za ${esc(missing.map((r) => r.raceName).join(", "))} još nisu uračunati</b> (čeka se zvaničan rezultat)` : ""}</p>
      <div class="champ-grid">
        <section class="card"><h3>Vozači</h3>${table(
          [{ label: "#", cls: "num" }, { label: "Vozač" }, { label: "Tim", cls: "hide-sm" }, { label: "Pob.", title: "Pobede", cls: "num" }, { label: "Bodovi", cls: "pts-col" }],
          dl.DriverStandings.map((d) => ({ cells: [esc(d.positionText), driver(d.Driver), team(d.Constructors.at(-1)), esc(d.wins), bar(+d.points, dMax)] })),
        )}</section>
        ${cl ? `<section class="card"><h3>Konstruktori</h3>${table(
          [{ label: "#", cls: "num" }, { label: "Tim" }, { label: "Pob.", title: "Pobede", cls: "num" }, { label: "Bodovi", cls: "pts-col" }],
          cl.ConstructorStandings.map((c) => ({ cells: [esc(c.positionText), team(c.Constructor), esc(c.wins), bar(+c.points, cMax)] })),
        )}</section>` : ""}
      </div>`;
    return {};
  }

  async function overview(el) {
    const [{ nextRace }, last, ds] = await Promise.all([
      season(),
      getJSON(`${API}/current/last/results.json`, 300e3),
      getJSON(`${API}/current/driverStandings.json`, 300e3),
    ]);
    let html = "";
    // Dok traje neka sesija vikenda (po satnici, uz rezervu za kašnjenja), na vrhu je poredak uživo.
    const now = Date.now();
    const liveNow = nextRace && sessions(nextRace).some((s) => now >= +s.d - 15 * 60e3 && now <= +s.d + (s.race ? 4 : 2) * 3600e3);
    if (liveNow) html += `<div class="ov-live"></div>`;
    if (nextRace) {
      const rows = sessions(nextRace).map((s) => `<tr class="${s.d < now ? "past" : ""}${s.race ? " race-row" : ""}"><td>${esc(s.label)}</td><td>${esc(relDay(s.d))}</td><td class="num">${s.timed ? esc(fmt.time.format(s.d)) : "-"}</td></tr>`).join("");
      html += `<h4 class="ov-h">Sledeća trka</h4>
        <a class="ov-race" href="#/f1/kalendar/${nextRace.round}"><b>${esc(nextRace.raceName)}</b>
        <span class="hint">${esc(nextRace.Circuit.Location.locality)}, ${esc(nextRace.Circuit.Location.country)} · runda ${esc(nextRace.round)}</span></a>
        <table class="sess">${rows}</table>`;
    } else html += `<p class="empty">Sezona je završena.</p>`;
    const lr = last.MRData.RaceTable.Races[0];
    // Ako je posle poslednje zvanične trke odvožena još jedna, ona je „poslednja“ - sa nezvaničnim podijumom.
    const { races, winners } = await season();
    const pend = pendingRaces(races, winners).filter((r) => !lr || +r.round > +lr.round).at(-1);
    const p = pend ? await provisional(pend) : null;
    if (pend) {
      html += `<h4 class="ov-h">Poslednja trka · <a href="#/f1/kalendar/${pend.round}">${esc(pend.raceName)}</a> ${p ? provTag : ""}</h4>` +
        (p ? `<ol class="podium-list">${p.rows.slice(0, 3).map((x) => `<li>${provDriver(x)}${x.team ? ` <span class="team-c">${esc(x.team)}</span>` : ""}</li>`).join("")}</ol>`
          : `<p class="muted">Završena - rezultati uskoro.</p>`);
    } else if (lr) {
      html += `<h4 class="ov-h">Poslednja trka · <a href="#/f1/kalendar/${lr.round}">${esc(lr.raceName)}</a></h4>
        <ol class="podium-list">${lr.Results.slice(0, 3).map((x) => `<li>${driver(x.Driver)} ${team(x.Constructor)}</li>`).join("")}</ol>`;
    }
    const dl = ds.MRData.StandingsTable.StandingsLists[0];
    if (dl) {
      html += `<h4 class="ov-h">Šampionat vozača · <a href="#/f1/sampionat">sve</a></h4>
        <ol class="podium-list">${dl.DriverStandings.slice(0, 5).map((d) => `<li>${driver(d.Driver)} <span class="muted">${esc(d.points)} b.</span></li>`).join("")}</ol>`;
    }
    el.innerHTML = html;
    if (liveNow) SC.f1live.mount(el.querySelector(".ov-live"), { compact: true });
    return { live: !!liveNow };
  }

  // Kartica za „Uživo sada / Uskoro“ na početnoj strani: sesija u toku (prva tri iz F1 toka) ili naredna sesija.
  async function events() {
    const { nextRace } = await season();
    if (!nextRace) return [];
    const now = Date.now();
    const ss = sessions(nextRace);
    const place = `${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country}`;
    const cur = ss.find((s) => now >= +s.d - 15 * 60e3 && now <= +s.d + (s.race ? 4 : 2) * 3600e3);
    if (cur) {
      try {
        const sum = SC.f1live.summary(await SC.f1live.snapshot());
        if (sum?.running) return [{ kind: "f1", status: "in", start: cur.d, race: nextRace.raceName, place, sum }];
      } catch { /* F1 tok nedostupan - prikaži narednu sesiju */ }
    }
    const next = ss.find((s) => +s.d > now);
    return next ? [{ kind: "f1", status: "pre", start: next.d, session: next.label, race: nextRace.raceName, place }] : [];
  }

  function renderLive(el) {
    el.innerHTML = `<div class="live-view"></div>`;
    SC.f1live.mount(el.firstChild);
    return {};   // pogled se sam osvežava preko WebSocket-a
  }

  SC.registerLeague({
    id: "f1", name: "Formula 1", short: "F1", accent: "#e10600", icon: F1_ICON, visual: "f1", events,
    source: { label: "Jolpica F1 API i F1 live timing", url: "https://github.com/jolpica/jolpica-f1" },
    tabs: [
      { id: "kalendar", label: "Kalendar i rezultati", render: renderCalendar },
      { id: "sampionat", label: "Šampionat", render: renderChampionship },
      { id: "uzivo", label: "Uživo", render: renderLive },
    ],
    overview,
  });
})();
