// Nedeljni izveštaj: A4, jedna strana, uvek svetla paleta za štampu (prenos report_pdf.py).
// PDF pravi sam pregledač: otvara se prozor za štampu u kome se bira „Sačuvaj kao PDF“.
(() => {
  const U = window.UG;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const P = {   // paleta za štampu
    ink: "#1c1e20", muted: "#5a6167", acc: "#a8600a", accFill: "#F0A23B", accTop: "#F5B65A", accBot: "#E08E1E",
    panel: "#faf8f4", border: "#ddd6ca", soft: "#f3efe7", alt: "#f9f7f3", grid: "#ebe6dc", chart: "#fbfaf7",
    up: "#1a7a42", down: "#c0392b",
  };
  const tColor = (dir) => (dir === "up" ? P.up : dir === "down" ? P.down : P.muted);
  function trend(pct, suffix = "") {
    const dir = U.trendDirection(pct);
    const head = pct !== null && pct !== undefined ? `${U.trendArrow(dir)} ${U.fmtPct(pct)}` : "-";
    return `<b style="color:${tColor(dir)}">${esc(head)}</b>${suffix ? ` <span class="mut">${esc(suffix)}</span>` : ""}`;
  }

  function chartSvg(s, todayD, first) {
    const W = 730, H = 280, top = 34, bottom = 30, ch = H - top - bottom, slot = (W - 20) / 7, bw = slot * 0.58;
    const all = [...s.vals, ...s.prevVals].filter((v) => v !== null);
    const max = Math.max(0, ...all);
    let g = `<svg viewBox="0 0 ${W} ${H}" width="100%"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.accTop}"/><stop offset="1" stop-color="${P.accBot}"/></linearGradient></defs>
      <rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="${P.chart}"/>`;
    for (const f of [0.5, 1]) { const y = top + ch - (ch - 6) * f; g += `<line x1="10" x2="${W - 10}" y1="${y}" y2="${y}" stroke="${P.grid}" stroke-dasharray="4 4"/>`; }
    g += `<line x1="10" x2="${W - 10}" y1="${top + ch}" y2="${top + ch}" stroke="${P.border}"/>`;
    for (let i = 0; i < 7; i++) {
      const d = U.addDays(s.monday, i), cx = 10 + slot * i + slot / 2, v = s.vals[i], pv = s.prevVals[i];
      if (v !== null && max > 0) {
        const h = Math.max(2, (ch - 6) * v / max);
        const labelY = Math.min(top + ch - h, pv !== null ? top + ch - (ch - 6) * pv / max : Infinity) - 7;   // iznad stubića i linije
        g += `<rect x="${cx - bw / 2}" y="${top + ch - h}" width="${bw}" height="${h}" rx="5" fill="url(#gb)"/>`;
        g += `<text x="${cx}" y="${labelY}" text-anchor="middle" font-size="12" font-weight="700" fill="${P.ink}">${U.fmtInt(v)}</text>`;
      } else {
        const miss = U.isMissingDay(window.UGApp.site(), d, todayD, first);
        g += `<text x="${cx}" y="${top + ch - 9}" text-anchor="middle" font-size="11" ${miss ? `font-weight="700" fill="${P.acc}"` : `fill="${P.muted}"`}>${miss ? "nedostaje" : "-"}</text>`;
      }
      if (pv !== null && max > 0) {
        const y = top + ch - (ch - 6) * pv / max;
        g += `<line x1="${cx - bw / 2 - 7}" x2="${cx + bw / 2 + 7}" y1="${y}" y2="${y}" stroke="${P.muted}" stroke-width="2"/>`;
      }
      g += `<text x="${cx}" y="${H - 10}" text-anchor="middle" font-size="12" fill="${P.muted}">${U.DAYS[i]}</text>`;
    }
    return g + "</svg>";
  }

  function html(s, zeno, version, generated) {
    const todayD = U.today(), site = window.UGApp.site(), first = U.firstEntryDate(site);
    const sunday = U.addDays(s.monday, 6), isCurrent = U.sameDay(s.monday, U.mondayFor(todayD));
    const note = isCurrent && todayD < sunday ? `podaci do ${U.fmtDate(todayD, "%d.%m.")} (nedelja je u toku)` : isCurrent ? "tekuća nedelja" : "";
    const n = s.nums.length;
    const cards = [
      ["UKUPNO POSETA", n ? U.fmtInt(s.total) : "-", s.pct !== null ? trend(s.pct, "prema prethodnoj") : esc(n ? `${n} od 7 dana uneto` : "nema unosa"), true],
      ["DNEVNI PROSEK", n ? U.fmtInt(s.avg) : "-", esc(`${n} od 7 dana uneto`)],
      ["NAJPOSEĆENIJI DAN", s.bestI !== null ? U.DAYS[s.bestI].toUpperCase() : "-", esc(s.bestI !== null ? `${U.fmtInt(s.vals[s.bestI])} poseta` : "nema podataka")],
      ["NAJSLABIJI DAN", s.worstI !== null ? U.DAYS[s.worstI].toUpperCase() : "-", esc(s.worstI !== null ? `${U.fmtInt(s.vals[s.worstI])} poseta` : "nema podataka")],
    ];
    const rows = U.DAYS.map((name, r) => {
      const d = U.addDays(s.monday, r), cur = s.vals[r], prev = s.prevVals[r];
      const miss = cur === null && U.isMissingDay(site, d, todayD, first);
      const change = cur !== null && prev ? U.pctValue(cur, prev) : null;
      return `<tr><td>${name}</td><td>${U.fmtDate(d, "%d.%m.%Y.")}</td>
        <td class="${miss ? "miss" : cur !== null ? "b" : ""}">${cur !== null ? U.fmtInt(cur) : miss ? "nedostaje" : "-"}</td>
        <td>${prev !== null ? U.fmtInt(prev) : "-"}</td><td>${trend(change)}</td></tr>`;
    }).join("");
    let zenoHtml = "";
    if (zeno) {
      const rec = zeno.record, prev = zeno.previous, wk = U.zenoWeekDate(rec);
      const head = zeno.exact ? `ZENO - NEDELJA OD ${U.fmtDate(wk, "%d.%m.%Y.")}` : `ZENO - POSLEDNJI DOSTUPAN IZVEŠTAJ (NEDELJA OD ${U.fmtDate(wk, "%d.%m.%Y.")})`;
      const pv = (k) => U.pctValue(rec[k] ?? 0, prev ? prev[k] : 0);
      const boxes = [
        ["USERS", U.fmtInt(rec.users ?? 0), trend(pv("users"), prev ? "prema prethodnom" : "")],
        ["SESSIONS", U.fmtInt(rec.sessions ?? 0), trend(pv("sessions"), prev ? "prema prethodnom" : "")],
        ["LISTENING TIME", U.fmtHours(rec.hours ?? 0), trend(pv("hours"), prev ? "prema prethodnom" : "")],
        ["PROSEČNA SESIJA", U.fmtSession(rec.hours ?? 0, rec.sessions ?? 0), '<span class="mut">slušanje po sesiji</span>'],
      ];
      zenoHtml = `<h2>${esc(head)}</h2><div class="cards z">${boxes.map(([l, v, sub]) =>
        `<div class="card"><div class="cl">${l}</div><div class="cv">${esc(v)}</div><div class="cs">${sub}</div></div>`).join("")}</div>`;
    }
    const legendPrev = s.prevVals.some((v) => v !== null) ? '<span class="lg"><i class="ln"></i>prethodna nedelja</span>' : "";
    const body = `<div class="cards">${cards.map(([l, v, sub, acc]) => `<div class="card${acc ? " acc" : ""}"><div class="cl">${l}</div><div class="cv">${esc(v)}</div><div class="cs">${sub}</div></div>`).join("")}</div>
<h2>POSETE PO DANIMA <span class="lgd"><span class="lg"><i></i>posete</span>${legendPrev}</span></h2>
${chartSvg(s, todayD, first)}
<table><thead><tr><th>DAN</th><th>DATUM</th><th>POSETE</th><th>PRETHODNA NEDELJA</th><th>PROMENA</th></tr></thead><tbody>${rows}</tbody></table>
${zenoHtml}`;
    return page({
      title: `undergrand_nedeljni_izvestaj_${U.iso(s.monday)}`, head: "NEDELJNI IZVEŠTAJ",
      range: `${U.fmtDate(s.monday, "%d.%m.")} – ${U.fmtDate(sunday, "%d.%m.%Y.")}`, note, body, version, generated,
    });
  }

  // Zajednički okvir strane A4: tamno zaglavlje sa logom, sadržaj, podnožje.
  function page({ title, head, range, note, body, version, generated }) {
    const g = generated;
    return `<!doctype html><html lang="sr-Latn"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; background: #fff; }
body { font-family: "Segoe UI", system-ui, sans-serif; color: ${P.ink}; }
.page { width: 210mm; height: 296mm; overflow: hidden; position: relative; }
.hd { background: #0d1013; height: 30mm; display: flex; align-items: center; justify-content: space-between; padding: 0 10mm; }
.hd img { height: 18mm; }
.hd .r { text-align: right; }
.hd .t { color: #fff; font-size: 19px; font-weight: 800; letter-spacing: 1.5px; }
.hd .d { color: ${P.accFill}; font-size: 16px; font-weight: 700; margin-top: 3px; }
.hd .n { color: #b9bfc4; font-size: 11px; margin-top: 3px; }
.body { padding: 6mm 10mm 0; }
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.card { border: 1px solid ${P.border}; background: ${P.panel}; border-radius: 10px; padding: 9px 8px 8px; text-align: center; }
.card.acc { border-top: 3px solid ${P.accFill}; }
.cl { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: ${P.muted}; }
.cv { font-size: 25px; font-weight: 800; margin: 6px 0 4px; white-space: nowrap; }
.card.acc .cv { color: ${P.acc}; }
.cards.z .cv { font-size: 19px; }
.cs { font-size: 11px; }
.mut { color: ${P.muted}; font-weight: 400; }
h2 { font-size: 13.5px; letter-spacing: 1px; color: ${P.acc}; margin: 6mm 0 2.5mm; display: flex; justify-content: space-between; align-items: center; }
.lgd { font-size: 11px; color: ${P.muted}; font-weight: 400; letter-spacing: 0; display: flex; gap: 14px; }
.lg { display: inline-flex; align-items: center; gap: 6px; }
.lg i { display: inline-block; width: 14px; height: 10px; border-radius: 3px; background: ${P.accFill}; }
.lg i.ln { height: 2px; background: ${P.muted}; border-radius: 0; }
.minis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
.mini { border: 1px solid ${P.border}; background: ${P.chart}; border-radius: 10px; padding: 7px 6px 2px; }
.mini .mt { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: ${P.muted}; text-align: center; }
table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${P.border}; border-radius: 10px; overflow: hidden; margin-top: 5mm; font-size: 12px; }
th { background: ${P.soft}; color: ${P.acc}; font-size: 10px; letter-spacing: .8px; padding: 7px 4px; }
td { text-align: center; padding: 6.5px 4px; }
table.dense td { padding: 5px 4px; }
tr:nth-child(even) td { background: ${P.alt}; }
td.b { font-weight: 700; } td.miss { color: ${P.acc}; font-weight: 700; }
.foot-note { font-size: 10.5px; color: ${P.muted}; margin-top: 3mm; }
.ft { position: absolute; left: 10mm; right: 10mm; bottom: 8mm; border-top: 1px solid ${P.border}; padding-top: 6px; display: flex; justify-content: space-between; font-size: 10.5px; color: ${P.muted}; }
</style></head><body><div class="page">
<div class="hd"><img src="assets/logo.png" alt="UnderGRAND"><div class="r"><div class="t">${esc(head)}</div>
<div class="d">${esc(range)}</div>${note ? `<div class="n">${esc(note)}</div>` : ""}</div></div>
<div class="body">${body}</div>
<div class="ft"><span>Napravljeno ${U.fmtDate(U.mkDate(g.getFullYear(), g.getMonth() + 1, g.getDate()), "%d.%m.%Y.")} ${String(g.getHours()).padStart(2, "0")}:${String(g.getMinutes()).padStart(2, "0")} · UnderGRAND Statistika v${esc(version)}</span><span>Strana 1 / 1</span></div>
</div></body></html>`;
  }

  // ---------- ZENO IZVEŠTAJ (4 nedelje ili tromesečje) ----------
  // data: { period: { start, end, items }, stats: zenoPeriodStats, weeks: zapisi po redu, n, title, name }
  const zv = (r, k) => Number(r[k] ?? 0);
  const wkLabel = (r, f) => { const d = U.zenoMailDate(r); return d ? U.fmtDate(d, f) : "-"; };

  function miniChart(title, weeks, key, fmt, n) {
    const W = 230, H = 175, top = 22, bottom = 22, ch = H - top - bottom, slot = (W - 12) / Math.max(weeks.length, 1);
    const vals = weeks.map((r) => zv(r, key)), max = Math.max(1, ...vals), bw = Math.min(slot * 0.62, 34);
    const showVal = n <= 4, every = slot < 26 ? 2 : 1;
    let g = `<svg viewBox="0 0 ${W} ${H}" width="100%"><defs><linearGradient id="gz${key}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.accTop}"/><stop offset="1" stop-color="${P.accBot}"/></linearGradient></defs>
      <line x1="6" x2="${W - 6}" y1="${top + ch}" y2="${top + ch}" stroke="${P.border}"/>`;
    vals.forEach((v, i) => {
      const cx = 6 + slot * i + slot / 2, h = Math.max(2, ch * v / max);
      g += `<rect x="${cx - bw / 2}" y="${top + ch - h}" width="${bw}" height="${h}" rx="3" fill="url(#gz${key})"/>`;
      if (showVal) g += `<text x="${cx}" y="${top + ch - h - 5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${P.ink}">${esc(fmt(v))}</text>`;
      if (i % every === 0) g += `<text x="${cx}" y="${H - 7}" text-anchor="middle" font-size="8.5" fill="${P.muted}">${esc(wkLabel(weeks[i], "%d.%m."))}</text>`;
    });
    return `<div class="mini"><div class="mt">${esc(title)}</div>${g}</svg></div>`;
  }

  function zenoHtml(d, version, generated) {
    const { period, stats, weeks, n } = d, { count, users, sessions, hours, changes, prev } = stats;
    const vs = prev ? "prema prethodnom periodu" : "";
    const cards = [
      ["PROSEK USERS", U.fmtDec(users / count, 1), prev ? trend(changes[0], vs) : '<span class="mut">po nedeljnom izveštaju</span>', true],
      ["SESSIONS", U.fmtInt(sessions), prev ? trend(changes[1], vs) : '<span class="mut">ukupno u periodu</span>'],
      ["SLUŠANJE", U.fmtHours(hours), prev ? trend(changes[2], vs) : `<span class="mut">${esc(U.fmtHours(hours / count))} po nedelji</span>`],
      ["PROSEČNA SESIJA", U.fmtSession(hours, sessions), '<span class="mut">slušanje po sesiji</span>'],
    ];
    const rows = weeks.map((r, i) => {
      const p = i ? weeks[i - 1] : null;
      return `<tr><td>${wkLabel(r, "%d.%m.%Y.")}</td><td class="b">${U.fmtInt(zv(r, "users"))}</td><td>${U.fmtInt(zv(r, "sessions"))}</td>
        <td>${U.fmtHours(zv(r, "hours"))}</td><td>${U.fmtSession(zv(r, "hours"), zv(r, "sessions"))}</td>
        <td>${p ? trend(U.pctValue(zv(r, "users"), zv(p, "users"))) : "-"}</td></tr>`;
    }).join("");
    const body = `<div class="cards z">${cards.map(([l, v, sub, acc]) => `<div class="card${acc ? " acc" : ""}"><div class="cl">${l}</div><div class="cv">${esc(v)}</div><div class="cs">${sub}</div></div>`).join("")}</div>
<h2>PO NEDELJAMA</h2>
<div class="minis">${miniChart("USERS", weeks, "users", U.fmtInt, n)}${miniChart("SESSIONS", weeks, "sessions", U.fmtInt, n)}${miniChart("SLUŠANJE (SATI)", weeks, "hours", (v) => U.fmtDec(v, 0), n)}</div>
<table class="${n > 4 ? "dense" : ""}"><thead><tr><th>NEDELJA</th><th>USERS</th><th>SESSIONS</th><th>SLUŠANJE</th><th>PROSEČNA SESIJA</th><th>USERS %</th></tr></thead><tbody>${rows}</tbody></table>
<p class="foot-note">Prosek USERS je prosek po nedeljnom izveštaju (Zeno ne daje broj jedinstvenih slušalaca za ceo period). Promena prema prethodnom periodu poredi proseke po izveštaju${count < n ? `; ovaj period ima ${count} od ${n} izveštaja` : ""}. USERS % je promena prema prethodnoj nedelji.</p>`;
    return page({
      title: d.fileName || "undergrand_zeno_izvestaj", head: d.title.replace("ZENO - ", "ZENO · "),
      range: `${U.fmtDate(period.start, "%d.%m.%Y.")} – ${U.fmtDate(period.end, "%d.%m.%Y.")}`,
      note: count < n ? `${count} od ${n} nedeljnih izveštaja` : `${count} nedeljnih izveštaja`, body, version, generated,
    });
  }

  function zenoTxt(d) {
    const { period, stats, weeks, n } = d, { count, users, sessions, hours, changes, prev } = stats;
    const ch = (c) => (c === null ? "-" : `${U.trendArrow(U.trendDirection(c))} ${U.fmtPct(c)}`);
    const lines = ["UNDERGRAND STATISTIKA", `Zeno - ${d.name}`,
      `Period: ${U.fmtDate(period.start, "%d.%m.%Y.")} – ${U.fmtDate(period.end, "%d.%m.%Y.")} (izveštaja: ${count >= n ? count : `${count} od ${n}`})`, "",
      `Prosek users: ${U.fmtDec(users / count, 1)}`, `Sessions: ${U.fmtInt(sessions)}`,
      `Slušanje: ${U.fmtHours(hours)} (prosek po nedelji: ${U.fmtHours(hours / count)})`, `Prosečna sesija: ${U.fmtSession(hours, sessions)}`];
    if (prev) lines.push("", "Promena prema prethodnom periodu (proseci po izveštaju):", `  users ${ch(changes[0])}, sessions ${ch(changes[1])}, slušanje ${ch(changes[2])}`);
    lines.push("", `${"Nedelja".padEnd(13)}${"Users".padStart(8)}${"Sessions".padStart(10)}${"Slušanje".padStart(14)}`);
    for (const r of weeks) {
      lines.push(`${wkLabel(r, "%d.%m.%Y.").padEnd(13)}${U.fmtInt(zv(r, "users")).padStart(8)}${U.fmtInt(zv(r, "sessions")).padStart(10)}${U.fmtHours(zv(r, "hours")).padStart(14)}`);
    }
    return lines.join("\n") + "\n";
  }

  // Štampa (i PDF) preko skrivenog okvira.
  async function print(htmlText, name) {
    const ifr = document.createElement("iframe");
    ifr.setAttribute("aria-hidden", "true");
    ifr.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.append(ifr);
    const doc = ifr.contentDocument;
    doc.open(); doc.write(htmlText); doc.close();
    await Promise.all([...doc.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
    const oldTitle = document.title;
    document.title = name || doc.title;   // predlog imena PDF fajla
    await new Promise((r) => setTimeout(r, 50));
    ifr.contentWindow.focus();
    ifr.contentWindow.print();
    document.title = oldTitle;
    setTimeout(() => ifr.remove(), 1000);
  }

  // Običan TXT izveštaj (kao u staroj verziji).
  function txt(s) {
    const lines = ["UNDERGRAND STATISTIKA", `Nedelja od ${U.fmtDate(s.monday, "%d.%m.%Y.")}`, "",
      `Ukupno: ${U.fmtInt(s.total)}`, `Dnevni prosek: ${U.fmtInt(s.avg)}`, ""];
    s.vals.forEach((v, i) => {
      lines.push(`${U.DAYS[i].padEnd(10)} ${U.fmtDate(U.addDays(s.monday, i))}  ${v !== null ? U.fmtInt(v) : "-"}`);
    });
    return lines.join("\n") + "\n";
  }
  window.UGReport = { print, txt, html, zenoHtml, zenoTxt };
})();
