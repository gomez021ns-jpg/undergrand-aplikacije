(function () {
  "use strict";

  const app = document.getElementById("app");
  const printRoot = document.getElementById("print-root");

  const TABS = [
    { id: "podsetnik", label: "Brzi podsetnik" },
    { id: "pravila", label: "Puna pravila" },
    { id: "kljucne-reci", label: "Ključne reči" },
    { id: "dodaci", label: "Dodaci" },
    { id: "kucna", label: "Kućna pravila" }
  ];

  // ───────────── pomoćne funkcije ─────────────
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const stripTags = (html) => String(html ?? "").replace(/<[^>]+>/g, " ");

  // Pretraga ignoriše velika/mala slova i dijakritike (č = c, š = s…)
  const fold = (s) =>
    String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "dj");

  // Srpska množina: 1 igra, 2–4 igre, 5+ igara (11–14 → igara)
  function plural(n, one, few, many) {
    const d = n % 10, dd = n % 100;
    if (d === 1 && dd !== 11) return one;
    if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
    return many;
  }

  const findGame = (id) => window.GAMES.find((g) => g.id === id);

  function storage(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  // ───────────── tema ─────────────
  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }
  applyTheme(storage("theme"));

  function toggleTheme() {
    const current =
      document.documentElement.dataset.theme ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    storage("theme", next);
  }

  // ───────────── rutiranje (#/igra/<id>/<tab>) ─────────────
  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts[0] === "igra" && parts[1]) return { view: "game", id: parts[1], tab: parts[2] || "podsetnik" };
    return { view: "home" };
  }

  function render() {
    const route = parseRoute();
    if (route.view === "game") {
      const game = findGame(route.id);
      if (game) return renderGame(game, route.tab);
    }
    renderHome();
  }

  // ───────────── početna: biblioteka ─────────────
  function renderHome() {
    document.title = "Moje društvene igre";
    const sorted = [...window.GAMES].sort((a, b) => a.title.localeCompare(b.title, "sr"));
    // Igre sa liste želja (još nisu kupljene) idu u poseban odeljak i ne broje se u kolekciju
    const games = sorted.filter((g) => !g.wishlist);
    const wishlist = sorted.filter((g) => g.wishlist);

    const expCount = games.reduce((n, g) => n + g.expansions.filter((e) => e.owned).length, 0);
    app.innerHTML = `
      ${topbar()}
      <main class="wrap">
        <section class="hero">
          <div class="hero-text">
            <h1>Moja kolekcija</h1>
            <div class="stats">
              <span class="stat"><b>${games.length}</b> ${plural(games.length, "igra", "igre", "igara")}</span>
              ${expCount ? `<span class="stat"><b>${expCount}</b> ${plural(expCount, "dodatak", "dodatka", "dodataka")}</span>` : ""}
              ${wishlist.length ? `<span class="stat"><b>${wishlist.length}</b> na listi želja</span>` : ""}
            </div>
          </div>
          <label class="search-box">${ICON_SEARCH}
            <input id="lib-search" class="search" type="search" placeholder="Pretraži igre i dodatke…" autocomplete="off" aria-label="Pretraži igre">
          </label>
        </section>
        <section class="grid lib-grid">
          ${games.map(gameCard).join("")}
        </section>
        ${
          wishlist.length
            ? `<section class="lib-section" data-section>
                <h2 class="lib-title"><span class="heart" aria-hidden="true">♥</span> Lista želja <span class="count">${wishlist.length}</span></h2>
                <p class="muted small">Igre koje još nemaš - pravila su spremna za kad ih nabaviš.</p>
                <div class="grid lib-grid">${wishlist.map(gameCard).join("")}</div>
              </section>`
            : ""
        }
        <p id="lib-empty" class="empty" hidden>Nema igara koje odgovaraju pretrazi.</p>
        <section class="add-hint">
          <h2>Nova igra ili dodatak?</h2>
          <p>Reci Claude-u naziv igre ili dodatka, a on će pronaći pravila, prevesti ih i dodati ovde.</p>
        </section>
      </main>`;

    const search = document.getElementById("lib-search");
    search.addEventListener("input", () => {
      const q = fold(search.value.trim());
      let shown = 0;
      document.querySelectorAll(".lib-grid .game-card").forEach((el) => {
        const match = !q || fold(el.dataset.search).includes(q);
        el.hidden = !match;
        if (match) shown++;
      });
      // sakrij naslov liste želja ako u njoj nema rezultata
      document.querySelectorAll("[data-section]").forEach((sec) => {
        sec.hidden = !sec.querySelector(".game-card:not([hidden])");
      });
      document.getElementById("lib-empty").hidden = shown > 0;
    });
    // Brza štampa podsetnika sa kartice (bez otvaranja igre).
    app.querySelectorAll("[data-print-quick]").forEach((b) =>
      b.addEventListener("click", () => printGame(findGame(b.dataset.printQuick), "quick"))
    );
    bindTopbar();
  }

  // ───────────── kartica igre ─────────────
  const svgIcon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON_SEARCH = svgIcon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>');
  const ICON_PRINT = svgIcon('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>');
  const ICON_QUICK = svgIcon('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>');
  // Ikonica vrste igre (iz kategorije): karte, heksagon, ljudi (kooperativna) ili kocka.
  function kindIcon(category) {
    const c = fold(category);
    if (c.includes("hekso")) return svgIcon('<path d="M12 2.5 20.5 7.3v9.4L12 21.5 3.5 16.7V7.3z"/>');
    if (c.includes("kooperativ")) return svgIcon('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5.5"/>');
    if (c.includes("kart") || c.includes("tcg") || c.includes("deck")) return svgIcon('<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M8 3h10a2 2 0 0 1 2 2v13"/>');
    return svgIcon('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="16" cy="16" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>');
  }
  // Monogram: prva slova značajnih reči (do 3), npr. „Star Wars: Unlimited“ → SWU.
  function monogram(title) {
    const skip = new Set(["the", "a", "an", "of", "and", "i", "board", "game", "igra"]);
    const words = title.replace(/[:–—-]/g, " ").split(/\s+/).filter((w) => w && !skip.has(w.toLowerCase()));
    return (words.length ? words : [title]).slice(0, 3).map((w) => w[0]).join("").toUpperCase();
  }

  function gameCard(g) {
    const owned = g.expansions.filter((e) => e.owned).length;
    const searchText = [g.title, g.subtitle, g.category, g.publisher, ...g.expansions.map((e) => e.title)].join(" ");
    return `
      <article class="game-card${g.wishlist ? " wish" : ""}" style="--game-accent:${esc(g.accent || "var(--accent)")}" data-search="${esc(searchText)}">
        <a class="gc-link" href="#/igra/${esc(g.id)}" aria-label="${esc(g.title)} - otvori pravila"></a>
        <div class="gc-cover" aria-hidden="true">
          <span class="gc-mono">${esc(monogram(g.title))}</span>
          <span class="gc-kind">${kindIcon(g.category || "")}</span>
          ${coverImg(g, "gc-photo")}        </div>
        <div class="gc-body">
          <div class="eyebrow">${esc(g.category || "")}</div>
          <h3>${esc(g.title)}</h3>
          <p class="muted small">${esc(g.subtitle || "")}</p>
          <div class="chips">
            ${ownedChip(g)}
            ${g.players ? `<span class="chip">${esc(g.players.split(";")[0])}</span>` : ""}
            ${owned ? `<span class="chip">+${owned} ${plural(owned, "dodatak", "dodatka", "dodataka")}</span>` : ""}
          </div>
        </div>
        <div class="gc-actions">
          <a class="gc-btn" href="#/igra/${esc(g.id)}/podsetnik">${ICON_QUICK}Podsetnik</a>
          ${g.quickRef.length ? `<button class="gc-btn" type="button" data-print-quick="${esc(g.id)}" title="Štampaj brzi podsetnik (1 strana)">${ICON_PRINT}Štampaj</button>` : ""}
        </div>
      </article>`;
  }

  function ownedChip(g) {
    if (g.wishlist) return `<span class="chip chip-wish">♥ Želim</span>`;
    return g.owned ? `<span class="chip chip-accent">${esc(g.owned)}</span>` : "";
  }

  // Fotografija je opciona: ako fajl (npr. images/riftbound.jpg) ne postoji, slika se tiho uklanja.
  // coverPos (object-position) bira koji deo slike ostaje vidljiv kad se iseče u široku traku.
  function coverImg(g, cls) {
    if (!g.cover) return "";
    const pos = g.coverPos ? ` style="object-position:${esc(g.coverPos)}"` : "";
    return `<img class="${cls}" src="${esc(g.cover)}" alt="${esc(g.title)}"${pos} onerror="this.remove()">`;
  }

  // Na stranici igre slika se ne seče: cela je vidljiva, a pozadina je ista slika zamućena.
  function coverBanner(g) {
    if (!g.cover) return "";
    return `<div class="game-cover" style="--cover:url('${esc(g.cover)}')"><img src="${esc(g.cover)}" alt="${esc(g.title)}" onerror="this.parentNode.remove()"></div>`;
  }

  // ───────────── stranica igre ─────────────
  function renderGame(g, tab) {
    if (!TABS.some((t) => t.id === tab)) tab = "podsetnik";
    document.title = `${g.title} - pravila`;

    app.innerHTML = `
      ${topbar()}
      <main class="wrap" style="--game-accent:${esc(g.accent || "var(--accent)")}">
        <a class="back" href="#/">← Sve igre</a>
        <header class="game-head">
          <div>
            <div class="eyebrow">${esc(g.category || "")}${g.publisher ? " · " + esc(g.publisher) : ""}</div>
            <h1>${esc(g.title)}</h1>
            <p class="muted">${esc(g.subtitle || "")}</p>
            ${g.summary ? `<p class="summary">${esc(g.summary)}</p>` : ""}
            <div class="chips">
              ${g.players ? `<span class="chip">Igrači: ${esc(g.players)}</span>` : ""}
              ${g.rulesVersion ? `<span class="chip">${esc(g.rulesVersion)}</span>` : ""}
              ${ownedChip(g)}
            </div>
          </div>
          <div class="print-menu">
            <button class="btn btn-primary" id="print-btn" aria-haspopup="true" aria-expanded="false">Štampaj / PDF</button>
            <div class="print-pop" id="print-pop" hidden>
              <button data-print="quick"><b>Brzi podsetnik</b><span>1 strana, za sto</span></button>
              <button data-print="full"><b>Puna pravila</b><span>sva poglavlja + ključne reči</span></button>
              ${
                g.expansions.length
                  ? `<button data-print="expansions"><b>Samo dodaci</b><span>${esc(g.expansions.map((e) => e.title).join(", "))}</span></button>`
                  : ""
              }
              <button data-print="all"><b>Sve</b><span>podsetnik + pravila + dodaci</span></button>
              <p class="print-tip">U prozoru za štampu izaberi <b>„Save as PDF“</b> da dobiješ PDF fajl.</p>
            </div>
          </div>
        </header>
        ${coverBanner(g)}

        <nav class="tabs" role="tablist">
          ${TABS.map(
            (t) => `<a role="tab" href="#/igra/${esc(g.id)}/${t.id}" class="tab${t.id === tab ? " active" : ""}" aria-selected="${t.id === tab}">${t.label}${
              tabCount(g, t.id) ? ` <span class="count">${tabCount(g, t.id)}</span>` : ""
            }</a>`
          ).join("")}
        </nav>

        <section class="tab-panel">${renderTab(g, tab)}</section>
      </main>`;

    bindTopbar();
    bindPrintMenu(g);
    if (tab === "pravila") bindRulesSearch(g);
    if (tab === "dodaci") bindJumpLinks();
    if (tab === "kljucne-reci") bindGlossarySearch();
    window.scrollTo(0, 0);
  }

  function renderTab(g, tab) {
    switch (tab) {
      case "pravila":
        return rulesView(g);
      case "kljucne-reci":
        return glossaryView(g);
      case "dodaci":
        return expansionsView(g);
      case "kucna":
        return houseRulesView(g);
      default:
        return quickView(g);
    }
  }

  function quickView(g) {
    if (!g.quickRef.length) return `<p class="empty">Brzi podsetnik još nije dodat.</p>`;
    return `<div class="quick-grid">${g.quickRef.map(quickCard).join("")}</div>`;
  }

  const quickCard = (c) => `<article class="qcard"><h3>${esc(c.title)}</h3>${c.html}</article>`;

  function rulesView(g) {
    if (!g.rules.length) return `<p class="empty">Pravila još nisu dodata.</p>`;
    return `
      <div class="rules-layout">
        <aside class="toc">
          <input id="rules-search" class="search search-sm" type="search" placeholder="Pretraži pravila…" autocomplete="off">
          <ol>${g.rules.map((r) => `<li data-toc="${esc(r.id)}"><a href="#" data-jump="${esc(r.id)}">${esc(r.title)}</a></li>`).join("")}</ol>
        </aside>
        <div class="chapters">
          ${g.rules.map((r, i) => chapter(r, i)).join("")}
          <p id="rules-empty" class="empty" hidden>Ništa nije pronađeno. Probaj drugi termin ili pogledaj Ključne reči.</p>
          ${sourcesBlock(g)}
        </div>
      </div>`;
  }

  const chapter = (r, i) =>
    `<article class="chapter" id="ch-${esc(r.id)}" data-chapter="${esc(r.id)}"><h2><span class="num">${i + 1}</span>${esc(r.title)}</h2>${r.html}</article>`;

  function sourcesBlock(g) {
    if (!g.sources.length) return "";
    return `
      <footer class="sources">
        <h4>Izvori</h4>
        <ul>${g.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("")}</ul>
        ${g.rulesVersion ? `<p class="muted small">Sažeto prema: ${esc(g.rulesVersion)}. Za sporne situacije važe zvanična pravila.</p>` : ""}
      </footer>`;
  }

  function glossaryView(g) {
    const all = allGlossary(g);
    if (!all.length) return `<p class="empty">Ključne reči još nisu dodate.</p>`;
    const groups = groupBy(all, (k) => k.group || "Ostalo");
    return `
      <input id="gloss-search" class="search" type="search" placeholder="Pretraži ključne reči…" autocomplete="off">
      ${Object.entries(groups)
        .map(
          ([name, items]) => `
        <section class="gloss-group">
          <h3 class="group-title">${esc(name)}</h3>
          <dl class="glossary">
            ${items.map((k) => `<div class="gloss-item" data-search="${esc(k.term + " " + stripTags(k.def))}"><dt>${esc(k.term)}</dt><dd>${k.def}</dd></div>`).join("")}
          </dl>
        </section>`
        )
        .join("")}
      <p id="gloss-empty" class="empty" hidden>Nema rezultata.</p>`;
  }

  function allGlossary(g) {
    const extra = g.expansions.flatMap((e) => (e.glossary || []).map((k) => ({ ...k, group: k.group || e.title })));
    return [...g.glossary, ...extra];
  }

  function tabCount(g, tabId) {
    if (tabId === "dodaci") return g.expansions.length;
    if (tabId === "kucna") return g.houseRules.length;
    return 0;
  }

  // Kućna pravila: dogovori igrača koje Claude upisuje u fajl igre (polje houseRules)
  function houseRulesView(g) {
    if (!g.houseRules.length) {
      return `
        <div class="empty-state">
          <h3>Još nema kućnih pravila</h3>
          <p class="muted">Dogovorili ste se oko nečega što pravila ne pokrivaju, ili igrate po svom? Reci Claude-u i biće zapisano ovde - vidi se i u štampanoj verziji punih pravila.</p>
        </div>`;
    }
    return g.houseRules.map(houseRuleCard).join("");
  }

  const houseRuleCard = (h) => `
    <article class="chapter house-rule">
      <h2>${esc(h.title)}</h2>
      ${h.date ? `<p class="muted small">Dogovoreno ${esc(fmtDateSr(h.date))}</p>` : ""}
      ${h.html}
    </article>`;

  function fmtDateSr(d) {
    const [y, m, dd] = String(d).split("-");
    return dd ? `${+dd}. ${+m}. ${y}.` : d;
  }

  function expansionsView(g) {
    if (!g.expansions.length) {
      return `
        <div class="empty-state">
          <h3>Još nema dodataka</h3>
          <p class="muted">Kad nabaviš novi set, ekspanziju ili dodatak za ${esc(g.title)}, reci Claude-u naziv i biće dodat ovde - sa novim pravilima i ključnim rečima.</p>
        </div>`;
    }
    return g.expansions
      .map(
        (e) => `
      <article class="expansion">
        <header>
          <div class="eyebrow">${esc(e.type || "Dodatak")}${e.released ? " · " + esc(e.released) : ""}</div>
          <h2>${esc(e.title)}</h2>
          <div class="chips">${
            e.onTheWay
              ? `<span class="chip chip-wish">Stiže - naručeno</span>`
              : e.owned
                ? `<span class="chip chip-accent">U kolekciji</span>`
                : `<span class="chip">Nije u kolekciji</span>`
          }</div>
          ${e.summary ? `<p>${esc(e.summary)}</p>` : ""}
          ${
            (e.rules || []).length > 1
              ? `<nav class="exp-nav">${e.rules.map((r) => `<a href="#" data-jump="${esc(r.id)}">${esc(r.title)}</a>`).join("")}</nav>`
              : ""
          }
        </header>
        ${(e.quickRef || []).length ? `<div class="quick-grid">${e.quickRef.map(quickCard).join("")}</div>` : ""}
        ${(e.rules || []).map((r, i) => chapter(r, i)).join("")}
        ${sourcesBlock({ sources: e.sources || [] })}
      </article>`
      )
      .join("");
  }

  function groupBy(arr, fn) {
    return arr.reduce((acc, x) => ((acc[fn(x)] ||= []).push(x), acc), {});
  }

  // ───────────── pretraga u pravilima ─────────────
  function bindRulesSearch(g) {
    const input = document.getElementById("rules-search");
    const chapters = [...document.querySelectorAll(".chapter")];
    const originals = new Map(chapters.map((c) => [c, c.innerHTML]));

    bindJumpLinks();

    input.addEventListener("input", () => {
      const raw = input.value.trim();
      const q = fold(raw);
      let shown = 0;
      chapters.forEach((c) => {
        c.innerHTML = originals.get(c);
        const match = !q || fold(c.textContent).includes(q);
        c.hidden = !match;
        document.querySelector(`[data-toc="${c.dataset.chapter}"]`).hidden = !match;
        if (match) {
          shown++;
          if (q.length >= 2) highlight(c, q);
        }
      });
      document.getElementById("rules-empty").hidden = shown > 0;
    });
  }

  function bindJumpLinks() {
    document.querySelectorAll("[data-jump]").forEach((a) =>
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        document.getElementById("ch-" + a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );
  }

  function highlight(root, q) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const text = node.nodeValue;
      const folded = fold(text);
      // fold() može promeniti dužinu samo za "đ"; u tom slučaju preskačemo isticanje
      if (folded.length !== text.length) return;
      let idx = folded.indexOf(q);
      if (idx < 0) return;
      const frag = document.createDocumentFragment();
      let last = 0;
      while (idx >= 0) {
        frag.append(text.slice(last, idx));
        const mark = document.createElement("mark");
        mark.textContent = text.slice(idx, idx + q.length);
        frag.append(mark);
        last = idx + q.length;
        idx = folded.indexOf(q, last);
      }
      frag.append(text.slice(last));
      node.replaceWith(frag);
    });
  }

  function bindGlossarySearch() {
    const input = document.getElementById("gloss-search");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = fold(input.value.trim());
      let shown = 0;
      document.querySelectorAll(".gloss-group").forEach((group) => {
        let groupShown = 0;
        group.querySelectorAll(".gloss-item").forEach((it) => {
          const match = !q || fold(it.dataset.search).includes(q);
          it.hidden = !match;
          if (match) groupShown++;
        });
        group.hidden = groupShown === 0;
        shown += groupShown;
      });
      document.getElementById("gloss-empty").hidden = shown > 0;
    });
  }

  // ───────────── štampa / PDF ─────────────
  function bindPrintMenu(g) {
    const btn = document.getElementById("print-btn");
    const pop = document.getElementById("print-pop");
    const close = () => {
      pop.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    };
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      pop.hidden = !pop.hidden;
      btn.setAttribute("aria-expanded", String(!pop.hidden));
    });
    pop.addEventListener("click", (ev) => ev.stopPropagation());
    pop.querySelectorAll("[data-print]").forEach((b) =>
      b.addEventListener("click", () => {
        close();
        printGame(g, b.dataset.print);
      })
    );
  }

  function printGame(g, mode) {
    const date = new Date().toLocaleDateString("sr-Latn");
    const head = (label) => `
      <header class="p-head">
        <div><h1>${esc(g.title)}</h1><div class="p-sub">${esc(g.subtitle || "")}</div></div>
        <div class="p-label">${esc(label)}<br><span>${esc(g.rulesVersion || "")}</span></div>
      </header>`;

    const quick = `
      <section class="p-quick">
        ${head("Brzi podsetnik")}
        <div class="p-quick-grid">${g.quickRef.map(quickCard).join("")}</div>
      </section>`;

    const full = `
      <section class="p-full">
        ${head("Puna pravila")}
        <nav class="p-toc"><h3>Sadržaj</h3><ol>${g.rules.map((r) => `<li>${esc(r.title)}</li>`).join("")}</ol></nav>
        ${g.rules.map((r, i) => chapter(r, i)).join("")}
        ${
          allGlossary(g).length
            ? `<article class="chapter p-gloss"><h2>Ključne reči</h2><dl class="glossary">${allGlossary(g)
                .map((k) => `<div class="gloss-item"><dt>${esc(k.term)}</dt><dd>${k.def}</dd></div>`)
                .join("")}</dl></article>`
            : ""
        }
        ${g.houseRules.length ? `<article class="chapter"><h2>Kućna pravila</h2></article>${g.houseRules.map(houseRuleCard).join("")}` : ""}
        ${sourcesBlock(g)}
      </section>`;

    const expansions = g.expansions.length
      ? `<section class="p-full">${head("Dodaci")}${expansionsView(g)}</section>`
      : "";

    const parts = { quick: [quick], full: [full], expansions: [expansions], all: [quick, full, expansions] }[mode] || [quick];
    printRoot.innerHTML =
      parts.filter(Boolean).join("") + `<footer class="p-foot">Odštampano ${esc(date)} · Moje društvene igre</footer>`;
    document.body.classList.add("printing");

    const prevTitle = document.title;
    document.title = `${g.title} - ${{ quick: "podsetnik", full: "pravila", expansions: "dodaci", all: "kompletno" }[mode] || "pravila"}`;
    const cleanup = () => {
      document.body.classList.remove("printing");
      printRoot.innerHTML = "";
      document.title = prevTitle;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(() => window.print(), 50);
  }

  // ───────────── gornja traka ─────────────
  // UnderGRAND zaglavlje (isto u svim aplikacijama): logo | naziv + verzija, slogan | tema.
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const isDark = () =>
    (document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";

  function topbar() {
    const label = isDark() ? "Svetla tema" : "Tamna tema";
    return `
      <header class="ug-top">
        <div class="wrap ug-top-inner">
          <a class="ug-logo" href="#/" title="Sve igre"><img src="assets/logo.png" alt="UnderGRAND"></a>
          <div class="ug-sep" aria-hidden="true"></div>
          <div class="ug-title">
            <div class="ug-title-row"><span class="ug-name">DRUŠTVENE IGRE</span>
              <button class="ug-ver" type="button" data-verzije title="Šta je novo">v${esc(window.APP_VERZIJA || "")}</button></div>
            <p class="ug-slogan">Manje čitanja pravila, više igranja.</p>
          </div>
          <div class="ug-actions">
            <button class="ug-icon-btn" id="theme-btn" type="button" title="${label}" aria-label="${label}">${isDark() ? SUN : MOON}</button>
          </div>
        </div>
      </header>`;
  }

  function bindTopbar() {
    document.getElementById("theme-btn")?.addEventListener("click", (e) => {
      toggleTheme();
      const b = e.currentTarget, label = isDark() ? "Svetla tema" : "Tamna tema";
      b.innerHTML = isDark() ? SUN : MOON;
      b.title = label; b.setAttribute("aria-label", label);
    });
  }

  // Klik bilo gde van menija za štampu ga zatvara
  document.addEventListener("click", () => {
    const pop = document.getElementById("print-pop");
    if (pop && !pop.hidden) {
      pop.hidden = true;
      document.getElementById("print-btn")?.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();
