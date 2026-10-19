// Pomoćne funkcije za crtanje šema (inline SVG) u pravilima.
// Boje dolaze iz CSS klasa (.f-box, .f-acc, .f-line…) pa šeme prate svetlu/tamnu temu i štampu.
window.FIG = (() => {
  const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => `${k}="${v}"`).join(" ");

  // Tekst; `lines` može biti string ili niz redova
  function text(x, y, lines, { cls = "", anchor = "middle", lh = 16 } = {}) {
    const arr = Array.isArray(lines) ? lines : [lines];
    const spans = arr.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${l}</tspan>`).join("");
    return `<text ${attrs({ x, y, class: cls || undefined, "text-anchor": anchor })}>${spans}</text>`;
  }

  function rect(x, y, w, h, { cls = "f-box", r = 8 } = {}) {
    return `<rect ${attrs({ x, y, width: w, height: h, rx: r, class: cls })}/>`;
  }

  // Pravougaonik sa naslovom i (opciono) podnaslovom, centrirano
  function box(x, y, w, h, title, { cls = "f-box", sub, r = 8, titleCls = "f-title" } = {}) {
    const cx = x + w / 2;
    const subLines = sub ? (Array.isArray(sub) ? sub : [sub]) : [];
    const block = 18 + subLines.length * 15;
    const ty = y + h / 2 - block / 2 + 13;
    return (
      rect(x, y, w, h, { cls, r }) +
      text(cx, ty, title, { cls: titleCls }) +
      (subLines.length ? text(cx, ty + 17, subLines, { cls: "f-muted", lh: 15 }) : "")
    );
  }

  function head(x, y, angle, cls) {
    const L = 10, s = 0.45;
    const p1 = [x - L * Math.cos(angle - s), y - L * Math.sin(angle - s)];
    const p2 = [x - L * Math.cos(angle + s), y - L * Math.sin(angle + s)];
    return `<polygon class="${cls}" points="${x},${y} ${p1.join(",")} ${p2.join(",")}"/>`;
  }

  // Strelica od (x1,y1) do (x2,y2); both = dvosmerna
  function arrow(x1, y1, x2, y2, { both = false, dashed = false, accent = false } = {}) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const lineCls = `f-line${dashed ? " dashed" : ""}${accent ? " f-acc-line" : ""}`;
    const headCls = accent ? "f-acc-head" : "f-head";
    return (
      `<line ${attrs({ x1, y1, x2, y2, class: lineCls })}/>` +
      head(x2, y2, a, headCls) +
      (both ? head(x1, y1, a + Math.PI, headCls) : "")
    );
  }

  function figure(w, h, body, { caption, label } = {}) {
    return `<figure class="fig"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label || caption || ""}">${body}</svg>${
      caption ? `<figcaption>${caption}</figcaption>` : ""
    }</figure>`;
  }

  return { text, rect, box, arrow, figure };
})();
