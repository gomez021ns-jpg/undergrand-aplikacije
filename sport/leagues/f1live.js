// F1 uživo: zvanični F1 live timing (livetiming.formula1.com, SignalR Core preko WebSocket-a), bez ključa.
// HTTP zahtevi ka njemu nemaju CORS, ali WebSocket radi direktno iz pregledača. Telemetrija i GPS pozicije
// (CarData.z, Position.z) traže F1 TV pretplatu i ne koriste se. Prvi odgovor na Subscribe je celo trenutno
// stanje, a posle stižu samo izmene ("feed") koje se spajaju u to stanje (merge).
(() => {
  const { esc, fmt } = SC;
  const WS_URL = "wss://livetiming.formula1.com/signalrcore";
  const RS = "\x1e";
  const TOPICS = ["SessionInfo", "SessionStatus", "TimingData", "TimingAppData", "DriverList", "LapCount",
    "TrackStatus", "RaceControlMessages", "ExtrapolatedClock"];

  let ws = null, state = null, conn = "idle", retry = 0, pingTimer = null, finished = false, dirty = false, idleSince = 0;
  let stateAt = 0;
  const views = new Set();   // { el, compact }
  const waiters = [];        // čekaju prvo stanje (SC.f1live.snapshot)

  // Izmene stižu kao delimični objekti; liste kao {"3": {...}} (indeks → izmena).
  function merge(t, p) {
    if (p === null || typeof p !== "object" || Array.isArray(p)) return p;
    if (t === null || typeof t !== "object") t = {};
    for (const [k, v] of Object.entries(p)) {
      if (k === "_deleted") { for (const d of v) delete t[d]; continue; }
      const key = Array.isArray(t) ? +k : k;
      t[key] = merge(t[key], v);
    }
    return t;
  }

  function connect() {
    if (ws && ws.readyState <= 1) return;
    conn = state ? "reconnecting" : "connecting";
    finished = false;
    dirty = true;
    try { ws = new WebSocket(WS_URL); } catch { conn = "error"; return; }
    ws.onopen = () => {
      ws.send(JSON.stringify({ protocol: "json", version: 1 }) + RS);
      ws.send(JSON.stringify({ type: 1, target: "Subscribe", arguments: [TOPICS], invocationId: "0" }) + RS);
      clearInterval(pingTimer);
      pingTimer = setInterval(() => ws?.readyState === 1 && ws.send(JSON.stringify({ type: 6 }) + RS), 15000);
    };
    ws.onmessage = (ev) => {
      for (const part of String(ev.data).split(RS)) {
        if (!part) continue;
        const m = JSON.parse(part);
        if (m.type === 3 && m.invocationId === "0") {
          state = m.result || {};
          stateAt = Date.now();
          conn = "open";
          retry = 0;
          waiters.splice(0).forEach((w) => w(state));
          // Ako nijedna sesija ne traje, stanje je konačno - veza nije potrebna.
          if (!isRunning()) { finished = true; ws.close(); }
        } else if (m.type === 1 && Array.isArray(m.arguments) && state) {
          const [topic, data] = m.arguments;
          if (typeof topic === "string") state[topic] = merge(state[topic], data);
        } else if (m.type === 7) {
          conn = "error";
        }
        dirty = true;
      }
    };
    ws.onerror = () => {};
    ws.onclose = () => {
      clearInterval(pingTimer);
      ws = null;
      dirty = true;
      if (finished || !views.size) { conn = state ? "closed" : "idle"; return; }
      conn = "reconnecting";
      setTimeout(() => views.size && connect(), Math.min(30000, 2000 * 2 ** retry++));
    };
  }

  const sessionStatus = () => state?.SessionStatus?.Status || state?.SessionInfo?.SessionStatus || "";
  const isRunning = () => ["Started", "Aborted"].includes(sessionStatus());

  // ------------------------------------------------------------ prikaz
  const SESSION_NAMES = { Race: "Trka", Qualifying: "Kvalifikacije", Sprint: "Sprint", "Sprint Qualifying": "Sprint kvalifikacije",
    "Sprint Shootout": "Sprint kvalifikacije", "Practice 1": "Trening 1", "Practice 2": "Trening 2", "Practice 3": "Trening 3" };
  const STATUS = {
    Started: ["UŽIVO", "live"], Aborted: ["Prekinuto", "warn"], Inactive: ["Nije počelo", ""],
    Finished: ["Završeno", ""], Finalised: ["Završeno", ""], Ends: ["Završeno", ""],
  };
  const TRACK = {
    1: ["Zelena - staza čista", "ok"], 2: ["Žuta zastava", "yellow"], 4: ["Sigurnosni automobil", "yellow"],
    5: ["Crvena zastava", "red"], 6: ["Virtuelni sigurnosni automobil", "yellow"], 7: ["VSC se završava", "yellow"],
  };
  const TYRES = { SOFT: ["S", "#e10600"], MEDIUM: ["M", "#f5c400"], HARD: ["H", "#e8e8e8"], INTERMEDIATE: ["I", "#3fae49"], WET: ["W", "#2d7dd2"] };

  function gap(v) {
    if (v == null || v === "") return "";
    const s = String(v);
    if (/^LAP/i.test(s)) return "Vodi";
    const m = s.match(/^(\d+)\s*L$/i);
    if (m) return `+${m[1]} ${+m[1] === 1 ? "krug" : "kruga"}`;
    return s;
  }

  function clockText() {
    const c = state?.ExtrapolatedClock;
    if (!c?.Remaining) return "";
    let [h, m, s] = c.Remaining.split(":").map(Number);
    let left = h * 3600 + m * 60 + s;
    if (c.Extrapolating && c.Utc) left = Math.max(0, left - Math.floor((Date.now() - Date.parse(c.Utc)) / 1000));
    const hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60), ss = left % 60;
    return `${hh ? `${hh}:` : ""}${String(mm).padStart(hh ? 2 : 1, "0")}:${String(ss).padStart(2, "0")}`;
  }

  function rows(s = state) {
    const lines = s?.TimingData?.Lines || {};
    const drivers = s?.DriverList || {};
    const app = s?.TimingAppData?.Lines || {};
    return Object.entries(lines)
      .map(([num, l]) => {
        const d = drivers[num] || {};
        const stints = Object.values(app[num]?.Stints || {});
        const tyre = stints.at(-1);
        return { num, l, d, tyre };
      })
      .filter((r) => r.l.Position)
      .sort((a, b) => +a.l.Position - +b.l.Position);
  }

  function driverCell(r) {
    const color = r.d.TeamColour ? `#${r.d.TeamColour}` : "var(--muted)";
    return `<span class="team-c live-drv"><i style="background:${esc(color)}"></i><b>${esc(r.d.Tla || r.num)}</b><span class="n-full">${esc(r.d.LastName || r.d.FullName || "")}</span></span>`;
  }

  function lapTime(t) {
    if (!t?.Value) return "";
    const cls = t.OverallFastest ? "lt-best" : t.PersonalFastest ? "lt-pb" : "";
    return `<span class="${cls}">${esc(t.Value)}</span>`;
  }

  function tyreCell(t) {
    if (!t?.Compound) return "";
    const [ch, col] = TYRES[t.Compound] || ["?", "var(--muted)"];
    return `<span class="tyre" style="--ty:${col}" title="${esc(t.Compound)}${t.New === "true" || t.New === true ? ", nove" : ""}">${ch}</span><small class="muted">${esc(t.TotalLaps ?? "")}</small>`;
  }

  function statusFor(l) {
    if (l.Retired) return `<span class="tag">Odustao</span>`;
    if (l.Stopped) return `<span class="tag">Stao</span>`;
    if (l.InPit) return `<span class="tag tag-pit">Boks</span>`;
    if (l.PitOut) return `<span class="tag tag-pit">Iz boksa</span>`;
    return "";
  }

  function header(compact) {
    const si = state.SessionInfo || {};
    const [stText, stCls] = STATUS[sessionStatus()] || [sessionStatus() || "-", ""];
    const name = SESSION_NAMES[si.Name] || si.Name || "";
    const lap = state.LapCount?.CurrentLap ? `Krug ${state.LapCount.CurrentLap} / ${state.LapCount.TotalLaps}` : "";
    const clock = !lap && isRunning() ? clockText() : "";
    const [trText, trCls] = TRACK[state.TrackStatus?.Status] || [state.TrackStatus?.Message || "", ""];
    const conn2 = conn === "reconnecting" ? `<span class="muted">· ponovo se povezujem…</span>` : "";
    return `<div class="live-head${compact ? " compact" : ""}">
      <span class="live-badge ${stCls}">${stCls === "live" ? `<span class="live-dot"></span>` : ""}${esc(stText)}</span>
      <b>${esc(si.Meeting?.Name || "")}</b><span class="muted">${esc(name)}</span>
      ${lap ? `<span class="live-lap">${esc(lap)}</span>` : ""}${clock ? `<span class="live-lap">Preostalo ${esc(clock)}</span>` : ""}
      ${isRunning() && trText ? `<span class="track ${trCls}">${esc(trText)}</span>` : ""}${conn2}
    </div>`;
  }

  function fullHtml() {
    const rs = rows();
    const race = /Race|Sprint$/.test(state.SessionInfo?.Type || "") || !!state.LapCount;
    const body = rs.map((r) => {
      const l = r.l;
      const g = race ? gap(l.GapToLeader) : gap(l.TimeDiffToFastest) || (l.Position === "1" ? "Najbrži" : "");
      const iv = race ? gap(l.IntervalToPositionAhead?.Value) : gap(l.TimeDiffToPositionAhead);
      return `<tr class="${l.KnockedOut || l.Retired ? "out" : ""}${+l.Position <= 3 ? " podium" : ""}">
        <td class="num">${esc(l.Position)}</td><td>${driverCell(r)} ${statusFor(l)}</td>
        <td class="hide-sm muted">${esc(r.d.TeamName || "")}</td>
        <td class="num">${esc(g)}</td><td class="num hide-sm">${esc(iv === "Vodi" ? "" : iv)}</td>
        <td class="num hide-sm">${esc(l.NumberOfLaps ?? "")}</td>
        <td class="num">${lapTime(l.LastLapTime)}</td><td class="num hide-sm">${lapTime(l.BestLapTime)}</td>
        <td class="tyre-col">${tyreCell(r.tyre)}</td><td class="num hide-sm">${esc(l.NumberOfPitStops ?? "")}</td>
      </tr>`;
    }).join("");
    const msgs = Object.values(state.RaceControlMessages?.Messages || {}).slice(-6).reverse();
    return header(false) +
      `<div class="tbl-wrap"><table class="st live-tbl"><thead><tr>
        <th class="num">Poz.</th><th>Vozač</th><th class="hide-sm">Tim</th><th class="num">${race ? "Razmak" : "Zaostatak"}</th>
        <th class="num hide-sm">Interval</th><th class="num hide-sm" title="Završenih krugova">Krugova</th><th class="num">Poslednji</th>
        <th class="num hide-sm">Najbolji</th><th>Guma</th><th class="num hide-sm" title="Broj zaustavljanja u boksu">Boks</th>
      </tr></thead><tbody>${body}</tbody></table></div>` +
      (msgs.length ? `<section class="card rc"><h3>Poruke sudija <small>(engleski)</small></h3><ul>${msgs.map((m) =>
        `<li><span class="muted">${m.Lap ? `Krug ${esc(m.Lap)} · ` : ""}${m.Utc ? esc(fmt.time.format(new Date(m.Utc + (/Z$/.test(m.Utc) ? "" : "Z")))) : ""}</span> ${esc(m.Message)}</li>`).join("")}</ul></section>` : "") +
      `<p class="hint live-note"><span class="lt-best">ljubičasto</span> = najbrži krug sesije, <span class="lt-pb">zeleno</span> = lični najbolji. Izvor: zvanični F1 live timing - može biti nekoliko sekundi ispred TV prenosa.</p>`;
  }

  function compactHtml() {
    const rs = rows().slice(0, 5);
    const race = !!state.LapCount;
    return header(true) + `<ol class="podium-list live-top">${rs.map((r) => {
      const g = race ? gap(r.l.GapToLeader) : gap(r.l.TimeDiffToFastest);
      return `<li>${driverCell(r)} <span class="muted">${esc(g === "Vodi" ? "" : g)}</span></li>`;
    }).join("")}</ol><a href="#/f1/uzivo">Prati uživo ›</a>`;
  }

  function viewHtml(compact) {
    if (!state) {
      if (conn === "error") return `<p class="empty">Ne mogu da se povežem na F1 live timing. Proveri internet vezu.</p>`;
      return `<div class="loading"><span class="spinner"></span>Povezujem se na F1 live timing…</div>`;
    }
    if (!rows().length) return header(compact) + `<p class="empty">Još nema podataka o vremenima za ovu sesiju.</p>`;
    const note = !isRunning() ? `<p class="hint">Nijedna sesija trenutno ne traje - prikazano je stanje na kraju poslednje sesije.</p>` : "";
    return (compact ? "" : note) + (compact ? compactHtml() : fullHtml());
  }

  // Prikaz se osvežava najviše jednom u sekundi (i svake sekunde dok teče sat sesije).
  setInterval(() => {
    for (const v of views) if (!v.el.isConnected) views.delete(v);
    if (!views.size) {
      if (ws && !idleSince) idleSince = Date.now();
      if (ws && Date.now() - idleSince > 20000) { finished = true; ws.close(); }   // niko ne gleda - zatvori vezu
      return;
    }
    idleSince = 0;
    if (state?.ExtrapolatedClock?.Extrapolating && isRunning()) dirty = true;
    if (!dirty) return;
    dirty = false;
    for (const v of views) v.el.innerHTML = viewHtml(v.compact);
  }, 1000);

  // Konačan poredak završene trke iz poslednjeg stanja F1 toka (nezvaničan rezultat dok Jolpica ne objavi zvanični).
  // Vraća null ako poslednja sesija nije trka koja počinje u `start` (±36 h) ili ako još nije završena.
  function classification(s, start) {
    const si = s?.SessionInfo;
    if (!si || si.Name !== "Race" || !si.StartDate) return null;
    const [oh, om] = String(si.GmtOffset || "0:0").split(":").map(Number);
    const startUtc = Date.parse(si.StartDate + "Z") - ((oh || 0) * 60 + Math.sign(oh || 1) * (om || 0)) * 60e3;
    if (Math.abs(startUtc - start) > 36 * 3600e3) return null;
    const st = s.SessionStatus?.Status || si.SessionStatus;
    if (!["Finished", "Finalised", "Ends"].includes(st)) return null;
    return rows(s).map((r) => ({
      pos: r.l.Position, code: r.d.Tla || r.num, name: [r.d.FirstName, r.d.LastName].filter(Boolean).join(" ") || r.d.FullName || "",
      team: r.d.TeamName || "", color: r.d.TeamColour ? `#${r.d.TeamColour}` : "",
      laps: r.l.NumberOfLaps ?? "",
      gap: r.l.Retired ? "Odustao" : r.l.Stopped ? "Stao" : r.l.Position === "1" ? "" : gap(r.l.GapToLeader),
    }));
  }

  // Kratak sažetak za karticu na početnoj strani: sesija, krug/vreme, prva tri.
  function summary(s) {
    if (!s?.SessionInfo) return null;
    const si = s.SessionInfo;
    const st = s.SessionStatus?.Status || si.SessionStatus || "";
    const race = !!s.LapCount;
    return {
      running: ["Started", "Aborted"].includes(st), aborted: st === "Aborted",
      session: SESSION_NAMES[si.Name] || si.Name || "", meeting: si.Meeting?.Name || "",
      lap: race && s.LapCount.CurrentLap ? { cur: +s.LapCount.CurrentLap, total: +s.LapCount.TotalLaps } : null,
      clock: !race && s === state ? clockText() : "",
      track: TRACK[s.TrackStatus?.Status]?.[0] || "",
      rows: rows(s).slice(0, 3).map((r) => ({
        pos: r.l.Position, code: r.d.Tla || r.num, color: r.d.TeamColour ? `#${r.d.TeamColour}` : "",
        gap: race ? gap(r.l.GapToLeader) : gap(r.l.TimeDiffToFastest) || (r.l.Position === "1" ? "Najbrži" : ""),
      })),
    };
  }

  SC.f1live = {
    classification, summary,
    // Trenutno stanje bez prikaza: koristi otvorenu vezu ili je kratko otvori (zatvara se sama ako sesija ne traje).
    snapshot() {
      if (state && (ws || Date.now() - stateAt < 60000)) return Promise.resolve(state);
      return new Promise((resolve) => {
        waiters.push(resolve);
        setTimeout(() => { const i = waiters.indexOf(resolve); if (i >= 0) { waiters.splice(i, 1); resolve(state); } }, 12000);
        if (!ws) connect();
      });
    },
    // Prikači pogled u element; veza se otvara po potrebi i zatvara kad ga niko ne gleda.
    mount(el, { compact = false } = {}) {
      for (const v of views) if (v.el === el) views.delete(v);
      views.add({ el, compact });
      el.innerHTML = viewHtml(compact);
      if (!ws && (!finished || !state || isRunning() || Date.now() - (SC.f1live.lastConnect || 0) > 60000)) {
        SC.f1live.lastConnect = Date.now();
        connect();
      }
      return { live: isRunning() };
    },
  };
})();
