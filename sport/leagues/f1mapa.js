// F1 mapa staze: obris staze sa krivinama (MultiViewer), bolidi kao tačke u bojama timova.
// - Uživo: približan položaj iz zvaničnog F1 toka (mini-sektori, SC.f1live.track()) - pravi GPS traži F1 TV.
// - Reprodukcija završenih sesija: pravi položaji sa OpenF1 /location (~3,7 puta u sekundi), učitavaju se
//   minut po minut unapred. OpenF1 i MultiViewer šalju CORS i za Origin: null (provereno 22. 11. 2026);
//   položaji bolida i obris su u istom koordinatnom sistemu. OpenF1 tokom sesije zaključava API, pa se
//   reprodukcija nudi samo za završene sesije.
(() => {
  const { esc, getJSON, fmt } = SC;
  const MV = "https://api.multiviewer.app/api/v1/circuits";
  const OF1 = "https://api.openf1.org/v1";
  const NS = "http://www.w3.org/2000/svg";
  const SESSION_SR = {
    Race: "Trka", Sprint: "Sprint", Qualifying: "Kvalifikacije", "Sprint Qualifying": "Sprint kvalifikacije",
    "Sprint Shootout": "Sprint kvalifikacije", "Practice 1": "Trening 1", "Practice 2": "Trening 2", "Practice 3": "Trening 3",
  };

  // ------------------------------------------------------------ obris staze
  // Rotacija kao na TV grafici (MultiViewer `rotation` + 90°); y se obrće jer SVG raste naniže.
  async function circuit(key, year) {
    const c = await getJSON(`${MV}/${key}/${year}`, 24 * 3600e3);
    const th = (((c.rotation || 0) + 90) * Math.PI) / 180;
    const cos = Math.cos(th), sin = Math.sin(th);
    const cx = (Math.min(...c.x) + Math.max(...c.x)) / 2, cy = (Math.min(...c.y) + Math.max(...c.y)) / 2;
    const tr = (x, y) => { const dx = x - cx, dy = y - cy; return [dx * cos - dy * sin, -(dx * sin + dy * cos)]; };
    const pts = c.x.map((x, i) => tr(x, c.y[i]));
    const tmax = c.trackPositionTime?.at(-1) || 0;
    const tn = c.trackPositionTime?.length === pts.length && tmax ? c.trackPositionTime.map((t) => t / tmax) : null;
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const pad = size * 0.07;
    return {
      name: c.circuitName || "", pts, tn, tr, size,
      // Broj krivine malo pored staze, u smeru `angle` iz MultiViewer-a.
      corners: (c.corners || []).map((k) => {
        const a = ((k.angle || 0) * Math.PI) / 180, off = size * 0.045;
        return { n: k.number, p: tr(k.trackPosition.x + off * Math.cos(a), k.trackPosition.y + off * Math.sin(a)) };
      }),
      view: [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad],
    };
  }

  // Tačka na stazi za udeo kruga f (0-1), po vremenu duž kruga iz obrisa.
  function pointAt(c, f) {
    const tn = c.tn, n = c.pts.length;
    if (!tn) { const i = Math.floor(f * n) % n; return c.pts[i]; }
    let lo = 0, hi = n - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (tn[mid] <= f) lo = mid; else hi = mid - 1; }
    const a = c.pts[lo], b = c.pts[(lo + 1) % n];
    const ta = tn[lo], tb = lo + 1 < n ? tn[lo + 1] : 1;
    const u = tb > ta ? (f - ta) / (tb - ta) : 0;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }

  function trackSvg(c) {
    const d = "M" + c.pts.map((p) => `${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(" L") + " Z";
    const fs = c.size * 0.024;
    const s = c.pts[0];
    return `<svg class="f1m-svg" viewBox="${c.view.map((v) => v.toFixed(0)).join(" ")}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Staza ${esc(c.name)}">
      <path d="${d}" class="f1m-edge"/><path d="${d}" class="f1m-trk"/>
      <circle cx="${s[0].toFixed(0)}" cy="${s[1].toFixed(0)}" r="${(c.size * 0.008).toFixed(0)}" class="f1m-start"><title>Start / cilj</title></circle>
      ${c.corners.map((k) => `<text x="${k.p[0].toFixed(0)}" y="${k.p[1].toFixed(0)}" font-size="${fs.toFixed(0)}" class="f1m-corner">${k.n}</text>`).join("")}
      <g class="f1m-cars"></g></svg>`;
  }

  // Tačke bolida: jedna grupa po vozaču, posle se samo pomera (transform).
  function carLayer(svg, c) {
    const g = svg.querySelector(".f1m-cars");
    const r = c.size * 0.016, fs = c.size * 0.026;
    const map = new Map();
    return {
      set(cars) {   // cars: [{ num, tla, color, x, y, dim, pos }]
        const seen = new Set();
        for (const car of cars) {
          seen.add(car.num);
          let el = map.get(car.num);
          if (!el) {
            el = document.createElementNS(NS, "g");
            el.setAttribute("class", "f1m-car");
            el.innerHTML = `<circle r="${r.toFixed(0)}"></circle><text dy="${(-r * 1.5).toFixed(0)}" font-size="${fs.toFixed(0)}"></text><title></title>`;
            g.append(el); map.set(car.num, el);
          }
          el.querySelector("circle").setAttribute("fill", car.color);
          el.querySelector("text").textContent = car.tla;
          el.querySelector("title").textContent = `${car.pos < 99 ? `P${car.pos} ` : ""}${car.tla}`;
          el.setAttribute("transform", `translate(${car.x.toFixed(0)} ${car.y.toFixed(0)})`);
          el.classList.toggle("dim", !!car.dim);
          el.dataset.pos = car.pos;
        }
        for (const [num, el] of map) if (!seen.has(num)) { el.remove(); map.delete(num); }
        // Vodeći se crtaju poslednji (preko ostalih).
        [...map.values()].sort((a, b) => b.dataset.pos - a.dataset.pos).forEach((el) => g.append(el));
      },
    };
  }

  // ------------------------------------------------------------ uživo
  // Mapa pored tabele na kartici „Uživo“; sama se osvežava dok je element na strani.
  function mountLive(el) {
    let c = null, key = "", layer = null, loading = false;
    el.innerHTML = `<div class="f1m-wrap"><div class="f1m-head"><b>Staza</b><span class="muted f1m-note"></span></div><div class="f1m-box"><div class="loading"><span class="spinner"></span>Čekam F1 live timing…</div></div>
      <p class="hint f1m-hint">Položaj uživo je približan: zvanični F1 tok javlja kad bolid pređe neki od ~23 mini-sektora, a između njih tačka klizi procenjenom brzinom. Pravo kretanje: kartica <a href="#/f1/reprodukcija">Reprodukcija</a> posle sesije.</p></div>`;
    const box = el.querySelector(".f1m-box"), note = el.querySelector(".f1m-note");
    const tick = async () => {
      if (!el.isConnected) return;
      // Pored tabele uživo: vrh mape u ravni sa vrhom tabele (iznad tabele su natpis i zaglavlje sesije).
      const grid = el.closest(".live-grid"), tbl = grid?.querySelector(".live-view .tbl-wrap");
      if (tbl) el.style.marginTop = `${Math.max(0, Math.round(tbl.getBoundingClientRect().top - grid.getBoundingClientRect().top))}px`;
      const t = SC.f1live.track();
      if (t?.key && `${t.key}/${t.year}` !== key && !loading) {
        loading = true;
        try {
          c = await circuit(t.key, t.year);
          key = `${t.key}/${t.year}`;
          box.innerHTML = trackSvg(c);
          layer = carLayer(box.querySelector("svg"), c);
        } catch { box.innerHTML = `<p class="empty">Obris staze trenutno nije dostupan.</p>`; key = `${t.key}/${t.year}`; }
        loading = false;
      }
      if (t && layer) {
        note.textContent = `${t.name}${t.session ? ` · ${t.session}` : ""}${t.running ? "" : " · čeka start ili je završena"}`;
        layer.set(t.running ? t.cars.filter((x) => x.frac != null && !x.out).map((x) => {
          const [px, py] = pointAt(c, x.frac);
          return { ...x, x: px, y: py, dim: x.pit };
        }) : []);
      }
      setTimeout(tick, 100);
    };
    tick();
  }

  // ------------------------------------------------------------ reprodukcija (OpenF1)
  const CH = 60000;   // položaji se učitavaju u komadima od 1 minuta
  let replayState = null;   // jedna reprodukcija u isto vreme
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // OpenF1 bez ključa: najviše 3 zahteva u sekundi (inače 429) → svi zahtevi idu redom, ~380 ms razmaka,
  // a posle 429 ponovo. 404 („No results found“) = prazan spisak. Greška mreže (zaključan API) ide dalje.
  let of1Chain = Promise.resolve(), of1Last = 0;
  const of1Cache = new Map();
  function of1Fetch(path) {
    const job = of1Chain.then(async () => {
      for (let attempt = 0; ; attempt++) {
        const wait = of1Last + 380 - Date.now();
        if (wait > 0) await sleep(wait);
        of1Last = Date.now();
        const r = await fetch(`${OF1}/${path}`);
        if (r.status === 429 && attempt < 5) { await sleep(1200); continue; }
        if (r.status === 404) return [];
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }
    });
    of1Chain = job.catch(() => {});
    return job;
  }
  function of1(path, ttl) {
    const hit = of1Cache.get(path);
    if (hit && Date.now() - hit.t < ttl) return hit.p;
    const p = of1Fetch(path);
    of1Cache.set(path, { t: Date.now(), p });
    p.catch(() => of1Cache.delete(path));
    return p;
  }

  async function finishedSessions() {
    const y = new Date().getFullYear();
    const now = Date.now();
    let list = [];
    for (const year of [y, y - 1]) {
      const all = await of1(`sessions?year=${year}`, 600e3);
      list = all.filter((s) => SESSION_SR[s.session_name] && Date.parse(s.date_end) < now - 30 * 60e3);
      if (list.length) break;
    }
    return list.sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start));
  }

  async function renderReplay(el, arg) {
    let sessions;
    try { sessions = await finishedSessions(); } catch {
      // Dok traje bilo koja F1 sesija, OpenF1 bez plaćenog ključa odbija sve zahteve (i za stare sesije), bez CORS-a.
      el.innerHTML = `<p class="empty">Reprodukcija trenutno nije dostupna. Dok traje neka F1 sesija, OpenF1 zaključava pristup
        (i za ranije sesije) - otvara ga ponovo čim se sesija završi. Sesiju u toku prati na kartici <a href="#/f1/uzivo">Uživo</a>.</p>`;
      return {};
    }
    if (!sessions.length) { el.innerHTML = `<p class="empty">Još nema završenih sesija za reprodukciju.</p>`; return {}; }
    let s = sessions.find((x) => String(x.session_key) === arg);
    if (!s && /^\d{4}-\d{2}-\d{2}$/.test(arg)) {   // iz kalendara: trka tog dana (±1 dan)
      s = sessions.filter((x) => x.session_name === "Race").find((x) => Math.abs(Date.parse(x.date_start) - Date.parse(arg)) < 36 * 3600e3);
    }
    if (!s) s = [...sessions].reverse().find((x) => x.session_name === "Race") || sessions.at(-1);
    const meetings = [...new Map(sessions.map((x) => [x.meeting_key, x])).values()].reverse();
    const inMeeting = sessions.filter((x) => x.meeting_key === s.meeting_key);
    const label = (x) => `${x.country_name} · ${x.circuit_short_name} · ${fmt.dayMonth.format(new Date(x.date_start))}`;

    el.innerHTML = `<div class="rp">
      <div class="rp-top">
        <select class="pager-sel rp-meet">${meetings.map((m) => `<option value="${m.meeting_key}"${m.meeting_key === s.meeting_key ? " selected" : ""}>${esc(label(m))}</option>`).join("")}</select>
        <nav class="tabs rp-sess">${inMeeting.map((x) => `<a href="#/f1/reprodukcija/${x.session_key}" class="${x === s ? "active" : ""}">${esc(SESSION_SR[x.session_name])}</a>`).join("")}</nav>
      </div>
      <div class="rp-grid">
        <section class="card rp-map"><div class="f1m-box"><div class="loading"><span class="spinner"></span>Učitavam stazu i položaje…</div></div></section>
        <aside class="card rp-side"><h3>Poredak</h3><ol class="rp-order"></ol></aside>
      </div>
      <div class="rp-ctrl card">
        <button type="button" class="btn primary rp-play" disabled>▶ Pusti</button>
        <span class="rp-speeds">${[1, 2, 4, 8, 16].map((v) => `<button type="button" class="btn rp-speed${v === 4 ? " on" : ""}" data-v="${v}">${v}×</button>`).join("")}</span>
        <input type="range" class="rp-slider" min="0" max="1" step="1" value="0" disabled>
        <span class="rp-time">-</span>
      </div>
      <p class="hint">Pravi položaji svih bolida (OpenF1, oko 4 puta u sekundi), učitavaju se dok gledaš. Sesije se pojavljuju ovde kad se završe.</p>
    </div>`;
    el.querySelector(".rp-meet").addEventListener("change", (e) => {
      const first = sessions.filter((x) => String(x.meeting_key) === e.target.value);
      const pick = [...first].reverse().find((x) => x.session_name === "Race") || first.at(-1);
      location.hash = `#/f1/reprodukcija/${pick.session_key}`;
    });

    if (replayState) replayState.stop = true;
    const R = (replayState = { stop: false });
    const key = s.session_key;
    const [c, drivers, laps, positions] = await Promise.all([
      circuit(s.circuit_key, s.year),
      of1(`drivers?session_key=${key}`, 3600e3),
      of1(`laps?session_key=${key}`, 3600e3).catch(() => []),
      of1(`position?session_key=${key}`, 3600e3).catch(() => []),
    ]);
    if (R.stop || !el.isConnected) return {};
    const box = el.querySelector(".f1m-box");
    box.innerHTML = trackSvg(c);
    const layer = carLayer(box.querySelector("svg"), c);
    const dinfo = new Map(drivers.map((d) => [String(d.driver_number), { tla: d.name_acronym || String(d.driver_number), color: d.team_colour ? `#${d.team_colour}` : "#888", name: d.full_name || d.broadcast_name || "" }]));

    // Vremenski okvir: trka od starta prvog kruga do kraja poslednjeg; ostale sesije cele.
    const lapStarts = laps.filter((l) => l.date_start).map((l) => Date.parse(l.date_start));
    const isRace = /Race|Sprint$/.test(s.session_name) && lapStarts.length;
    const t0 = isRace ? Math.min(...lapStarts) - 5000 : Date.parse(s.date_start);
    const lapEnds = laps.filter((l) => l.date_start && l.lap_duration).map((l) => Date.parse(l.date_start) + l.lap_duration * 1000);
    const t1 = isRace && lapEnds.length ? Math.max(...lapEnds) + 15000 : Date.parse(s.date_end);
    const nChunks = Math.ceil((t1 - t0) / CH);
    const totalLaps = Math.max(0, ...laps.map((l) => l.lap_number || 0));
    const lapByTime = laps.filter((l) => l.date_start).map((l) => [Date.parse(l.date_start), l.lap_number]).sort((a, b) => a[0] - b[0]);
    const posBy = new Map();
    for (const p of [...positions].sort((a, b) => Date.parse(a.date) - Date.parse(b.date))) {
      const k = String(p.driver_number);
      if (!posBy.has(k)) posBy.set(k, []);
      posBy.get(k).push([Date.parse(p.date), p.position]);
    }

    // Komadi položaja: idx → Map(vozač → [[t, x, y], …]) (već u koordinatama mape).
    const chunks = new Map();
    let queue = Promise.resolve();
    function need(idx) {
      if (idx < 0 || idx >= nChunks || chunks.has(idx)) return;
      chunks.set(idx, null);
      queue = queue.then(async () => {
        if (R.stop) return;
        const a = new Date(t0 + idx * CH).toISOString(), b = new Date(t0 + (idx + 1) * CH).toISOString();
        for (let attempt = 0; attempt < 4; attempt++) {
          try {
            const rows = await of1Fetch(`location?session_key=${key}&date>=${encodeURIComponent(a)}&date<${encodeURIComponent(b)}`);
            const by = new Map();
            for (const p of rows) {
              const k = String(p.driver_number);
              if (!by.has(k)) by.set(k, []);
              const [x, y] = c.tr(p.x, p.y);
              by.get(k).push([Date.parse(p.date), x, y]);
            }
            for (const arr of by.values()) arr.sort((m, n) => m[0] - n[0]);
            chunks.set(idx, by);
            break;
          } catch { await sleep(1500); }
        }
        if (!chunks.get(idx)) chunks.delete(idx);   // posle neuspeha probaj ponovo kad zatreba
      });
    }
    const posAt = (num, t) => {
      for (const idx of [Math.floor((t - t0) / CH), Math.floor((t - t0) / CH) - 1]) {
        const arr = chunks.get(idx)?.get(num);
        if (!arr?.length) continue;
        if (arr[0][0] > t) {   // pre prve tačke komada: na samom početku pokaži prvu poznatu
          if (idx === Math.floor((t - t0) / CH) && arr[0][0] - t < 3000 && !chunks.get(idx - 1)?.get(num)?.length) return [arr[0][1], arr[0][2]];
          continue;
        }
        let lo = 0, hi = arr.length - 1;
        while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (arr[mid][0] <= t) lo = mid; else hi = mid - 1; }
        const a = arr[lo];
        let b = arr[lo + 1] || chunks.get(idx + 1)?.get(num)?.[0];
        if (!b || b[0] - a[0] > 3000) return [a[1], a[2]];
        const u = (t - a[0]) / (b[0] - a[0]);
        return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
      }
      return null;
    };
    const lastAt = (arr, t) => { let v = null; for (const [ts, val] of arr || []) { if (ts > t) break; v = val; } return v; };

    // Kontrole
    const playBtn = el.querySelector(".rp-play"), slider = el.querySelector(".rp-slider"), timeEl = el.querySelector(".rp-time");
    const orderEl = el.querySelector(".rp-order");
    let t = t0, playing = false, speed = 4, lastFrame = 0, lastOrder = 0;
    slider.max = String(Math.round((t1 - t0) / 1000));
    slider.disabled = false; playBtn.disabled = false;
    playBtn.addEventListener("click", () => { playing = !playing; playBtn.textContent = playing ? "⏸ Pauza" : "▶ Pusti"; if (t >= t1) t = t0; });
    el.querySelectorAll(".rp-speed").forEach((b) => b.addEventListener("click", () => {
      speed = +b.dataset.v;
      el.querySelectorAll(".rp-speed").forEach((x) => x.classList.toggle("on", x === b));
    }));
    slider.addEventListener("input", () => { t = t0 + +slider.value * 1000; lastOrder = 0; });

    const clock = (ms) => { const sec = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(sec / 3600) ? `${Math.floor(sec / 3600)}:` : ""}${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`; };
    function frame(now) {
      if (R.stop || !el.isConnected) { R.stop = true; return; }
      const dt = lastFrame ? now - lastFrame : 0;
      lastFrame = now;
      const idx = Math.floor((t - t0) / CH);
      need(idx); need(idx + 1); need(idx + 2);
      const ready = !!chunks.get(idx);
      if (playing && ready) {
        t = Math.min(t1, t + dt * speed);
        if (t >= t1) { playing = false; playBtn.textContent = "▶ Ponovo"; }
        slider.value = String(Math.round((t - t0) / 1000));
      }
      const cars = [];
      for (const [num, d] of dinfo) {
        const p = posAt(num, t);
        if (p) cars.push({ num, tla: d.tla, color: d.color, x: p[0], y: p[1], pos: lastAt(posBy.get(num), t) || 99 });
      }
      layer.set(cars);
      const lap = lastAt(lapByTime, t);
      timeEl.textContent = `${isRace && totalLaps ? `Krug ${Math.min(lap || 1, totalLaps)}/${totalLaps} · ` : ""}${clock(t - t0)}${ready ? "" : " · učitavam…"}`;
      if (now - lastOrder > 500) {
        lastOrder = now;
        const order = [...dinfo].map(([num, d]) => ({ num, ...d, pos: lastAt(posBy.get(num), t) || 99 })).sort((a, b) => a.pos - b.pos);
        orderEl.innerHTML = order.map((d) => `<li><span class="rp-pos">${d.pos < 99 ? d.pos : "-"}</span><i style="background:${esc(d.color)}"></i><b>${esc(d.tla)}</b><span class="muted">${esc(d.name)}</span></li>`).join("");
      }
      requestAnimationFrame(frame);
    }
    need(0); need(1); need(2);   // učitavanje kreće odmah, ne tek sa prvom sličicom
    requestAnimationFrame(frame);
    return {};
  }

  SC.f1map = { circuit, pointAt, trackSvg, mountLive, renderReplay };
})();
