// Dugme „Pun ekran“ u gornjem desnom uglu zaglavlja (Fullscreen API). Isti fajl u svim aplikacijama.
// U punom ekranu dugme postaje „Izađi“ (radi i Esc). Ako je ceo prozor pregledača preko celog ekrana
// (taster F11 ili prečica „pun ekran“ koja otvara Edge sa --start-fullscreen), stranica ne može sama
// da izađe - tada dugme podseća na F11.
(() => {
  const root = document.documentElement;
  if (!root.requestFullscreen) return; // npr. iPhone: nema Fullscreen API-ja

  const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const IN = svg("M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5");
  const OUT = svg("M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5");
  const pageFull = () => !!document.fullscreenElement;
  const windowFull = () => !pageFull() && matchMedia("(display-mode: fullscreen)").matches;
  let hintTimer = 0;

  function paint(b, hint) {
    const full = pageFull() || windowFull();
    const text = hint || (full ? "Izađi" : "Pun ekran");
    b.innerHTML = `${full ? OUT : IN}<span class="fs-txt">${text}</span>`;
    b.title = full ? (windowFull() ? "Izlaz iz punog ekrana: taster F11" : "Izađi iz punog ekrana (Esc)") : "Pun ekran";
    b.setAttribute("aria-label", b.title);
  }
  const paintAll = (hint) => document.querySelectorAll("[data-pun-ekran]").forEach((b) => paint(b, hint));

  function hintF11() {
    paintAll("Pritisni F11");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => paintAll(), 2500);
  }

  // Zaglavlje se u nekim aplikacijama iscrtava ponovo - dugme se tada vraća samo.
  function ensure() {
    const bar = document.querySelector(".ug-actions, .top-actions");
    if (!bar || bar.querySelector("[data-pun-ekran]")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "fs-btn";
    b.dataset.punEkran = "";
    paint(b);
    bar.append(b);
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-pun-ekran]")) return;
    if (pageFull()) document.exitFullscreen();
    else if (windowFull()) hintF11();
    else root.requestFullscreen().catch(() => {});
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && windowFull() && !document.querySelector("dialog[open]")) hintF11();
  });
  document.addEventListener("fullscreenchange", () => paintAll());
  matchMedia("(display-mode: fullscreen)").addEventListener("change", () => paintAll());

  ensure();
  new MutationObserver(ensure).observe(document.body, { childList: true, subtree: true });
})();
