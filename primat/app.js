// Okvir oko igre: tema, dugmad, zvuk i spisak rekorda (igra je u game.js, window.DK).
(() => {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* bez trajnog pamćenja */ } },
  };

  // --- tema ---
  const themeBtn = document.getElementById("theme-btn");
  function applyTheme(t) {
    if (t) document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const isDark = () => (document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches);
  // Dugme pokazuje temu na koju se prelazi: sunce u tamnoj, mesec u svetloj.
  function themeIcon() {
    const label = isDark() ? "Svetla tema" : "Tamna tema";
    themeBtn.innerHTML = isDark() ? SUN : MOON;
    themeBtn.title = label; themeBtn.setAttribute("aria-label", label);
  }
  applyTheme(store.get("pr-theme"));
  themeIcon();
  themeBtn.addEventListener("click", () => {
    const t = isDark() ? "light" : "dark";
    applyTheme(t);
    store.set("pr-theme", t);
    themeIcon();
    themeBtn.blur();
  });

  // --- dugmad i zvuk (posle klika fokus se skida, da Space ostane skok) ---
  const newBtn = document.getElementById("new-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const snd = document.getElementById("snd");
  newBtn.addEventListener("click", () => { DK.start(); newBtn.blur(); });
  pauseBtn.addEventListener("click", () => { DK.togglePause(); pauseBtn.blur(); });
  snd.checked = DK.soundOn();
  snd.addEventListener("change", () => { DK.setSound(snd.checked); snd.blur(); });
  document.addEventListener("dk:zvuk", (e) => { snd.checked = e.detail; });
  const mus = document.getElementById("mus");
  mus.checked = DK.musicOn();
  mus.addEventListener("change", () => { DK.setMusic(mus.checked); mus.blur(); });
  document.addEventListener("dk:muzika", (e) => { mus.checked = e.detail; });
  document.addEventListener("dk:stanje", (e) => {
    const { state, paused, demo } = e.detail;
    const running = !demo && state !== "title" && state !== "over" && state !== "name";
    pauseBtn.disabled = !running;
    pauseBtn.textContent = paused ? "Nastavi" : "Pauza";
  });
  // Dok je otvoren prozor „Šta je novo“, igra stoji.
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-verzije]")) return;
    const s = DK.state();
    if (!s.paused && s.state !== "title" && s.state !== "over") DK.togglePause();
  }, true);

  // --- rekordi ---
  const rek = document.getElementById("rek");
  const fmtDate = (d) => { const [y, m, dd] = d.split("-"); return `${+dd}. ${+m}. ${y}.`; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  let newId = null; // upravo upisan rezultat se istakne
  function renderRek() {
    const r = DK.records();
    rek.innerHTML = r.length
      ? `<ol>${r.map((x) => `<li${x.id && x.id === newId ? ' class="new"' : ""}>
          <span class="ini">${esc(x.i || "---")}</span>
          <span class="pts">${Number(x.s).toLocaleString("sr-Latn")}</span>
          <span class="meta">nivo ${Number(x.n)} · ${fmtDate(String(x.d))}</span></li>`).join("")}</ol>`
      : `<p class="muted">Još nema rekorda - prvi je tvoj!</p>`;
  }
  document.addEventListener("dk:rekordi", (e) => { newId = e.detail?.id ?? null; renderRek(); });
  renderRek();
})();
