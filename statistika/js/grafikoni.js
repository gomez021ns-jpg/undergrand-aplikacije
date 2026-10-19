// Stubičasti grafikoni u SVG-u (bez biblioteke). Crtaju se prema stvarnoj širini i ponovo pri promeni veličine.
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const specs = new WeakMap();
  const ro = new ResizeObserver((entries) => { for (const e of entries) { const s = specs.get(e.target); if (s) draw(e.target, s); } });

  // spec: { labels, series: [{ name, values, kind: "main"|"prev" }], fmt, notes: [tekst ispod praznog dana],
  //         selected, onSelect(i), height, sparse }
  function bars(el, spec) {
    specs.set(el, spec);
    ro.observe(el);
    draw(el, spec);
  }

  function draw(el, spec) {
    const W = Math.max(280, el.clientWidth || 600), H = spec.height || 260;
    const n = spec.labels.length;
    if (!n) { el.innerHTML = `<div class="chart-empty">${esc(spec.empty || "Nema podataka.")}</div>`; return; }
    const padL = 10, padR = 10, top = 28, bottom = 30, ch = H - top - bottom;
    const main = spec.series.find((s) => s.kind === "main"), prev = spec.series.find((s) => s.kind === "prev");
    const all = spec.series.flatMap((s) => s.values).filter((v) => v !== null && v !== undefined);
    const max = Math.max(1, ...all);
    const slot = (W - padL - padR) / n;
    const groupW = Math.min(slot * 0.72, 120);
    const longest = main ? Math.max(0, ...main.values.map((v) => (v === null || v === undefined ? 0 : spec.fmt(v).length))) : 0;
    const showVal = !spec.sparse || longest * 6.8 <= slot - 2;   // vrednosti iznad stubića samo ako staju
    const labelEvery = Math.max(1, Math.ceil(46 / slot));
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(spec.title || "grafikon")}">`;
    for (const f of [0.5, 1]) {
      const y = top + ch - ch * f;
      svg += `<line class="ch-grid" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/>`;
    }
    svg += `<line class="ch-axis" x1="${padL}" x2="${W - padR}" y1="${top + ch}" y2="${top + ch}"/>`;
    for (let i = 0; i < n; i++) {
      const cx = padL + slot * i + slot / 2;
      const sel = spec.selected === i;
      const both = prev && main;
      const bw = both ? groupW / 2 - 2 : groupW;
      if (sel) svg += `<rect class="ch-sel" x="${cx - slot / 2 + 1}" y="2" width="${slot - 2}" height="${H - 4}" rx="10"/>`;
      if (prev) {
        const v = prev.values[i];
        if (v !== null && v !== undefined) {
          const h = Math.max(2, ch * v / max), x = both ? cx - bw - 2 : cx - bw / 2;
          svg += `<rect class="ch-prev" x="${x}" y="${top + ch - h}" width="${bw}" height="${h}" rx="${Math.min(6, bw / 3)}"><title>${esc(prev.name)}: ${esc(spec.fmt(v))}</title></rect>`;
          if (showVal && bw >= 34) svg += `<text class="ch-val prev" x="${x + bw / 2}" y="${top + ch - h - 7}" text-anchor="middle">${esc(spec.fmt(v))}</text>`;
        }
      }
      if (main) {
        const v = main.values[i], x = both ? cx + 2 : cx - bw / 2;
        if (v !== null && v !== undefined) {
          const h = Math.max(v > 0 ? 3 : 2, ch * v / max);
          svg += `<rect class="ch-bar" x="${x}" y="${top + ch - h}" width="${bw}" height="${h}" rx="${Math.min(7, bw / 3)}"><title>${esc(main.name)}: ${esc(spec.fmt(v))}</title></rect>`;
          if (showVal) svg += `<text class="ch-val" x="${x + bw / 2}" y="${top + ch - h - 7}" text-anchor="middle">${esc(spec.fmt(v))}</text>`;
        } else if (spec.notes && spec.notes[i]) {
          svg += `<text class="ch-note ${spec.notes[i] === "nedostaje" ? "miss" : ""}" x="${x + bw / 2}" y="${top + ch - 8}" text-anchor="middle">${esc(spec.notes[i])}</text>`;
        }
      }
      const nearSel = spec.selected >= 0 && !sel && Math.abs(i - spec.selected) < labelEvery;   // ne preklapa izabrani
      if ((i % labelEvery === 0 && !nearSel) || sel) {
        svg += `<text class="ch-lab ${sel ? "on" : ""}" x="${cx}" y="${H - 10}" text-anchor="middle">${esc(spec.labels[i])}</text>`;
      }
      if (spec.onSelect) svg += `<rect class="ch-hit" data-i="${i}" x="${cx - slot / 2}" y="0" width="${slot}" height="${H}"/>`;
    }
    svg += "</svg>";
    el.innerHTML = svg;
    if (spec.onSelect) {
      el.querySelectorAll(".ch-hit").forEach((r) => r.addEventListener("click", () => spec.onSelect(+r.dataset.i)));
    }
  }

  window.UGChart = { bars };
})();
