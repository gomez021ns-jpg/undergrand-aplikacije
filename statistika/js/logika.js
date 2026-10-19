// Obračuni bez prikaza: prenos stats.py, zeno.py (merge, brojevi) i _parse_store iz storage.py.
// Rezultati moraju biti ISTI kao u Python verziji, pa su ovde i Python pravila zaokruživanja
// (round = half-even, format "{:.2f}" = tačna decimalna vrednost + half-even) i sum() za float (Neumaier).
(() => {
  const DAYS = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota", "Nedelja"];
  const ZENO_FIRST_YEAR = 2026;        // izveštaji stariji od ove godine se ne uvoze
  const ZENO_REPORTS_PER_PERIOD = 4;   // 28 dana = 4 nedeljna izveštaja
  const TREND_NEUTRAL_BAND = 1.0;      // promena manja od 1% = "bez promene"
  const THEMES = ["zuto", "premium", "hladna", "zar", "svetla"];   // dozvoljene vrednosti polja "theme" u bazi
  const DEFAULT_THEME = "zuto";

  // ---------- DATUMI: Date u UTC ponoć, da letnje računanje vremena ne pomera dane ----------
  const DAY_MS = 86400000;
  const pad = (n, w = 2) => String(n).padStart(w, "0");

  function mkDate(y, m, d) {
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCFullYear(y);   // godine < 100
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? dt : null;
  }
  // Strogi YYYY-MM-DD (kao date.fromisoformat za ključeve baze).
  function fromISO(s) {
    const m = typeof s === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    return m ? mkDate(+m[1], +m[2], +m[3]) : null;
  }
  // strptime("%Y-%m-%d"): mesec i dan mogu i sa jednom cifrom; ne-string = None.
  function isoToDate(s) {
    const m = typeof s === "string" && /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    return m ? mkDate(+m[1], +m[2], +m[3]) : null;
  }
  const iso = (d) => `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);
  const weekday = (d) => (d.getUTCDay() + 6) % 7;            // ponedeljak = 0
  const mondayFor = (d) => addDays(d, -weekday(d));
  const daysBetween = (a, b) => Math.round((b - a) / DAY_MS);  // b - a u danima
  const sameDay = (a, b) => a && b && a.getTime() === b.getTime();
  function today() {
    const n = new Date();
    return mkDate(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }
  // strftime za %d %m %Y (ostali znakovi ostaju).
  const fmtDate = (d, f = "%d.%m.%Y") =>
    f.replace("%d", pad(d.getUTCDate())).replace("%m", pad(d.getUTCMonth() + 1)).replace("%Y", pad(d.getUTCFullYear(), 4));

  // ---------- PYTHON ARITMETIKA ----------
  // round(x) za float: polovina ide ka parnom (Python), ne naviše (Math.round).
  function pyRound(x) {
    const f = Math.floor(x), diff = x - f;
    if (diff > 0.5) return f + 1;
    if (diff < 0.5) return f;
    return f % 2 === 0 ? f : f + 1;
  }
  // sum() za float u Pythonu 3.12+: Neumaier kompenzovano sabiranje.
  function pySum(values) {
    let s = 0, c = 0;
    for (const x of values) {
      const t = s + x;
      c += Math.abs(s) >= Math.abs(x) ? (s - t) + x : (x - t) + s;
      s = t;
    }
    return c && Number.isFinite(c) ? s + c : s;
  }
  // Tačna decimalna vrednost double broja (BigInt), pa zaokruživanje na `digits` mesta half-even - kao "{:.Nf}".
  function exactParts(a) {
    const dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, a);
    const hi = dv.getUint32(0), lo = dv.getUint32(4), exp = (hi >>> 20) & 0x7ff;
    let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo), e;
    if (exp === 0) e = -1074; else { mant |= 1n << 52n; e = exp - 1075; }
    if (e >= 0) return { int: mant << BigInt(e), frac: "" };
    const k = -e, s = (mant * 5n ** BigInt(k)).toString().padStart(k + 1, "0");
    return { int: BigInt(s.slice(0, s.length - k)), frac: s.slice(s.length - k) };
  }
  function toFixedPy(x, digits) {
    const neg = x < 0 || Object.is(x, -0);
    const { int, frac } = exactParts(Math.abs(x));
    const keep = frac.slice(0, digits).padEnd(digits, "0"), rest = frac.slice(digits);
    let n = int * 10n ** BigInt(digits) + BigInt(keep || "0");
    if (rest) {
      const first = rest[0], tail = /[1-9]/.test(rest.slice(1));
      if (first > "5" || (first === "5" && (tail || n % 2n === 1n))) n += 1n;
    }
    let s = n.toString().padStart(digits + 1, "0");
    s = digits ? `${s.slice(0, -digits)}.${s.slice(-digits)}` : s;
    return (neg ? "-" : "") + s;
  }
  const group = (intStr, sep) => intStr.replace(/\B(?=(\d{3})+(?!\d))/g, sep);

  // ---------- FORMATIRANJE BROJEVA: tačka za hiljade, zarez za decimale ----------
  function fmtInt(n) {
    const r = pyRound(Number(n));
    return (r < 0 ? "-" : "") + group(String(Math.abs(r)), ".");
  }
  function fmtDec(x, digits = 2) {
    const s = toFixedPy(Number(x), digits), neg = s.startsWith("-");
    const [i, f] = (neg ? s.slice(1) : s).split(".");
    return (neg ? "-" : "") + group(i, ".") + (f !== undefined ? "," + f : "");
  }
  const fmtHours = (h) => fmtDec(h, 2) + " h";
  const fmtPct = (x) => (x >= 0 ? "+" : "") + fmtDec(x, 1) + "%";
  function fmtSession(hours, sessions) {
    if (!sessions) return "-";
    const total = pyRound(hours * 60 / sessions);
    return `${Math.floor(total / 60)} h ${pad(((total % 60) + 60) % 60)} min`;
  }

  // ---------- TREND ----------
  const pctValue = (current, previous) => (previous ? (current - previous) / previous * 100 : null);
  const pctChange = (c, p) => { const v = pctValue(c, p); return v !== null ? fmtPct(v) : "-"; };
  function trendDirection(change) {
    if (change === null || change === undefined) return "none";
    if (Math.abs(change) < TREND_NEUTRAL_BAND) return "flat";
    return change > 0 ? "up" : "down";
  }
  const trendArrow = (dir) => ({ up: "↑", down: "↓", flat: "→" })[dir] || "";

  // ---------- STATISTIKA SAJTA (data = { "YYYY-MM-DD": broj }) ----------
  const weekValues = (data, monday) =>
    Array.from({ length: 7 }, (_, i) => { const v = data[iso(addDays(monday, i))]; return v === undefined ? null : v; });

  function firstEntryDate(data) {
    let min = null;
    for (const k of Object.keys(data)) { const d = fromISO(k); if (d && (!min || d < min)) min = d; }
    return min;
  }
  // Dan "nedostaje" samo ako je prošao i nije pre prvog unetog dana.
  function isMissingDay(data, d, todayD, first) {
    todayD = todayD || today();
    if (first === undefined) first = firstEntryDate(data);
    return first !== null && first <= d && d < todayD && !(iso(d) in data);
  }
  // Dani bez unosa u poslednjih `lookback` dana (bez današnjeg), od najstarijeg ka najnovijem.
  function missingDays(data, todayD, lookback = 7) {
    todayD = todayD || today();
    const first = firstEntryDate(data);
    if (first === null) return [];
    const back = addDays(todayD, -lookback), start = first > back ? first : back, out = [];
    for (let d = start; d < todayD; d = addDays(d, 1)) if (!(iso(d) in data)) out.push(d);
    return out;
  }

  // Sažetak nedelje (isti brojevi za ekran i izveštaj). Trend poredi samo dane sa unosom u OBE nedelje;
  // za tekuću nedelju samo protekle dane, za protekle svih sedam.
  function weekSummary(data, monday, todayD) {
    todayD = todayD || today();
    const vals = weekValues(data, monday), prevVals = weekValues(data, addDays(monday, -7));
    const nums = vals.filter((v) => v !== null);
    const total = nums.reduce((a, b) => a + b, 0);
    const avg = nums.length ? pyRound(total / nums.length) : 0;
    let bestI = null, worstI = null;
    for (let i = 0; i < 7; i++) {
      if (vals[i] === null) continue;
      if (bestI === null || vals[i] > vals[bestI]) bestI = i;
      if (worstI === null || vals[i] < vals[worstI]) worstI = i;
    }
    const cur = mondayFor(todayD);
    const elapsed = sameDay(monday, cur) ? weekday(todayD) + 1 : monday > cur ? 0 : 7;
    const paired = [];
    for (let i = 0; i < elapsed; i++) if (vals[i] !== null && prevVals[i] !== null) paired.push(i);
    const currentPeriod = paired.reduce((a, i) => a + vals[i], 0);
    const previousPeriod = paired.reduce((a, i) => a + prevVals[i], 0);
    const hasCurrent = vals.slice(0, elapsed).some((v) => v !== null);
    const pct = paired.length && previousPeriod > 0 ? pctValue(currentPeriod, previousPeriod) : null;
    return { monday, vals, prevVals, nums, total, avg, bestI, worstI, elapsed, currentPeriod, previousPeriod, hasCurrent, pct };
  }

  // Ponedeljci svih nedelja sa unosom, od najnovije.
  function weekMondays(data) {
    const set = new Map();
    for (const k of Object.keys(data)) { const d = fromISO(k); if (d) { const m = mondayFor(d); set.set(m.getTime(), m); } }
    return [...set.values()].sort((a, b) => b - a);
  }
  // Mesečni pregled: [{ y, m, total, avg }], od najnovijeg.
  function months(data) {
    const map = new Map();
    for (const [k, v] of Object.entries(data)) {
      const d = fromISO(k); if (!d) continue;
      const key = d.getUTCFullYear() * 100 + d.getUTCMonth() + 1;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(v);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([key, vals]) => {
      const total = vals.reduce((a, b) => a + b, 0);
      return { y: Math.floor(key / 100), m: key % 100, total, avg: pyRound(total / vals.length), days: vals.length };
    });
  }

  // ---------- ZENO ----------
  const zenoWeekDate = (r) => isoToDate(r.week) || isoToDate(r.mail_date);   // obračunski ponedeljak
  const zenoMailDate = (r) => isoToDate(r.mail_date) || isoToDate(r.week);   // datum maila (prikaz)
  const num = (v) => { const n = Number(v ?? 0); return Number.isFinite(n) ? n : 0; };
  const zenoTotals = (items) => [
    pySum(items.map((x) => num(x.users))), pySum(items.map((x) => num(x.sessions))), pySum(items.map((x) => num(x.hours))),
  ];

  // '6,161.9' / '1,234,567' / '6161.9' / '12,5'; baca grešku ako format nije jasan.
  function parseNumber(value) {
    const v = value.trim().replace(/[.,]+$/, "");
    if (/^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/.test(v)) return parseFloat(v.replace(/,/g, ""));
    if (/^\d+,\d+$/.test(v)) return parseFloat(v.replace(",", "."));
    throw new Error(`Neprepoznat format broja: '${value}'`);
  }

  const RE_USERS = /\bUSERS[\s:]*([\d,.]+)/i;
  const RE_SESSIONS = /\bSESSIONS[\s:]*([\d,.]+)/i;
  const RE_HOURS = /\bLISTENING\s+TIME[\s:]*([\d,.]+)/i;

  // Zeno zapis iz datuma slanja i teksta maila; null ako nije (kompletan) Zeno izveštaj iz 2026+.
  function zenoRecord(sentDate, body) {
    if (!sentDate || sentDate.getUTCFullYear() < ZENO_FIRST_YEAR) return null;
    const um = RE_USERS.exec(body), sm = RE_SESSIONS.exec(body), hm = RE_HOURS.exec(body);
    if (!(um && sm && hm)) return null;
    let users, sessions, hours;
    try {
      users = Math.trunc(parseNumber(um[1]));
      sessions = Math.trunc(parseNumber(sm[1]));
      hours = parseNumber(hm[1]);
    } catch { return null; }
    // Obračunska nedelja = ponedeljak KALENDARSKE nedelje pre datuma slanja.
    const week = iso(addDays(sentDate, -(weekday(sentDate) + 7)));
    return { week, mail_date: iso(sentDate), users, sessions, hours };
  }

  // Spajanje po nedelji: novi zamenjuje postojeći; među novim duplikatima pobeđuje kasnije poslat mail.
  function mergeZeno(existing, newItems) {
    const newest = new Map();
    for (const item of newItems) {
      const w = item.week, cur = newest.get(w);
      if (!cur || (item.mail_date || "") >= (cur.mail_date || "")) newest.set(w, item);
    }
    const byWeek = new Map();
    for (const x of existing) if (x.week) byWeek.set(x.week, x);
    for (const [w, x] of newest) byWeek.set(w, x);
    return [...byWeek.values()].sort((a, b) => (a.week < b.week ? -1 : a.week > b.week ? 1 : 0));
  }

  const byWeekStr = (a, b) => { const x = a.week || "", y = b.week || ""; return x < y ? -1 : x > y ? 1 : 0; };

  // Zeno izveštaj za nedelju ili poslednji raniji: { record, previous, exact } ili null.
  function zenoForWeek(zeno, monday) {
    const records = zeno.filter((r) => zenoWeekDate(r)).sort((a, b) => zenoWeekDate(a) - zenoWeekDate(b));
    const exact = records.filter((r) => sameDay(zenoWeekDate(r), monday));
    let pick = exact[0] || null;
    if (!pick) for (let i = records.length - 1; i >= 0; i--) if (zenoWeekDate(records[i]) <= monday) { pick = records[i]; break; }
    if (!pick) return null;
    const idx = records.indexOf(pick);
    return { record: pick, previous: idx ? records[idx - 1] : null, exact: exact.length > 0 };
  }

  // Periodi od `days` dana (28 = 4 nedelje, 84 = tromesečje) od prvog Zeno izveštaja: [{ start, end, items }], od najnovijeg.
  function zenoPeriods(zeno, days = 28) {
    const valid = zeno.map((r) => [zenoWeekDate(r), r]).filter(([d]) => d).sort((a, b) => a[0] - b[0]);
    if (!valid.length) return [];
    const anchor = valid[0][0], map = new Map();
    for (const [d, item] of valid) {
      const start = addDays(anchor, Math.floor(daysBetween(anchor, d) / days) * days);
      if (!map.has(start.getTime())) map.set(start.getTime(), { start, end: addDays(start, days - 1), items: [] });
      map.get(start.getTime()).items.push(item);
    }
    return [...map.values()].sort((a, b) => b.start - a.start);
  }
  function zenoPeriodRecords(zeno, start, days = 28) {
    const end = addDays(start, days - 1);
    return zeno.map((r) => [zenoWeekDate(r), r]).filter(([d]) => d && d >= start && d <= end)
      .sort((a, b) => a[0] - b[0]).map(([, r]) => r);
  }
  // Zbirovi perioda i promena prema prethodnom periodu (poređenje proseka po izveštaju, kao u Zeno 4 nedelje).
  function zenoPeriodStats(periods, period, days = 28) {
    const count = period.items.length, [users, sessions, hours] = zenoTotals(period.items);
    const prev = periods.find((p) => sameDay(p.start, addDays(period.start, -days))) || null;
    let changes = [null, null, null];
    if (prev) {
      const pc = prev.items.length, [pu, ps, ph] = zenoTotals(prev.items);
      changes = [pctValue(users / count, pu / pc), pctValue(sessions / count, ps / pc), pctValue(hours / count, ph / pc)];
    }
    return { count, users, sessions, hours, changes, prev };
  }

  // ---------- BAZA: validacija sadržaja (kao _parse_store) ----------
  // Python int(): broj se seče, string mora biti ceo broj, bool je 0/1; ostalo je greška.
  function pyInt(v) {
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "number") { if (!Number.isFinite(v)) throw new Error("nije broj"); return Math.trunc(v); }
    if (typeof v === "string" && /^\s*[+-]?\d+(_\d+)*\s*$/.test(v)) return parseInt(v.replace(/_/g, ""), 10);
    throw new Error("nije ceo broj");
  }
  const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

  function parseStore(raw) {
    if (!isObj(raw)) throw new Error("koren baze nije objekat");
    const newFormat = "site" in raw;
    const src = newFormat ? raw.site : raw;   // stari v1.5.x format: datumi u korenu
    if (!isObj(src)) throw new Error("polje 'site' nije objekat");
    const site = {}, skipped = [];
    for (const [k, v] of Object.entries(src)) {
      try {
        if (!fromISO(k)) throw new Error("datum");
        const n = pyInt(v);
        if (n < 0) throw new Error("negativna vrednost");
        site[k] = n;
      } catch { skipped.push(k); }
    }
    const zr = (newFormat ? raw.zeno : null) || [];
    const zeno = Array.isArray(zr) ? zr.filter(isObj) : [];
    const theme = THEMES.includes(raw.theme) ? raw.theme : DEFAULT_THEME;
    return { site, zeno, theme, skipped };
  }

  // JSON kao Python json.dumps(indent=2, ensure_ascii=False): "hours" je u Pythonu uvek float (4363.0).
  function serializeStore(store) {
    const text = JSON.stringify({ site: store.site, zeno: store.zeno, theme: store.theme }, null, 2);
    return text.replace(/^(\s*"hours": )(-?\d+)(,?)$/gm, "$1$2.0$3");
  }

  window.UG = {
    DAYS, ZENO_FIRST_YEAR, ZENO_REPORTS_PER_PERIOD, THEMES, DEFAULT_THEME,
    mkDate, fromISO, isoToDate, iso, addDays, weekday, mondayFor, daysBetween, sameDay, today, fmtDate,
    pyRound, pySum, toFixedPy, fmtInt, fmtDec, fmtHours, fmtPct, fmtSession,
    pctValue, pctChange, trendDirection, trendArrow,
    weekValues, firstEntryDate, isMissingDay, missingDays, weekSummary, weekMondays, months,
    zenoWeekDate, zenoMailDate, zenoTotals, parseNumber, zenoRecord, mergeZeno, byWeekStr, zenoForWeek,
    zenoPeriods, zenoPeriodRecords, zenoPeriodStats, parseStore, serializeStore,
  };
})();
