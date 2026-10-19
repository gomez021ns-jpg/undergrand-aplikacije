// Baza (undergrand_stats.json) preko File System Access API-ja: otvaranje, čuvanje, backup i oporavak.
// Prenos storage.py. Izbor fajla i foldera se pamti u IndexedDB-u (pregledač posle ponovnog pokretanja
// samo traži jedan klik za dozvolu).
(() => {
  const { parseStore, serializeStore, DEFAULT_THEME, today, addDays, fromISO } = window.UG;
  const BACKUP_PREFIX = "undergrand_stats_";
  const BACKUP_KEEP_RECENT = 10;      // uvek se čuva bar poslednjih 10 kopija
  const BACKUP_KEEP_DAILY_DAYS = 30;  // i po jedna (najnovija) kopija za svaki od poslednjih 30 dana
  const RW = { mode: "readwrite" };

  const supported = () => "showOpenFilePicker" in window && "showDirectoryPicker" in window;

  // ---------- IndexedDB: pamćenje izabranih fajlova ----------
  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("undergrand-statistics", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("handles");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function kv(mode, fn) {
    const db = await idb();
    return new Promise((res, rej) => {
      const tx = db.transaction("handles", mode), st = tx.objectStore("handles"), req = fn(st);
      tx.oncomplete = () => { db.close(); res(req && req.result); };
      tx.onerror = () => { db.close(); rej(tx.error); };
    });
  }
  const getH = (k) => kv("readonly", (s) => s.get(k)).catch(() => null);
  const setH = (k, v) => kv("readwrite", (s) => s.put(v, k));

  const state = { file: null, dir: null, lastText: null, notice: null };

  async function permitted(h, ask) {
    if (!h) return false;
    try {
      if ((await h.queryPermission(RW)) === "granted") return true;
      return ask ? (await h.requestPermission(RW)) === "granted" : false;
    } catch { return false; }
  }

  // Zapamćeni fajl i folder (bez traženja dozvole): { file, dir, fileOk, dirOk }.
  async function restore() {
    state.file = await getH("baza");
    state.dir = await getH("backup");
    return { file: state.file, dir: state.dir, fileOk: await permitted(state.file, false), dirOk: await permitted(state.dir, false) };
  }
  // Dozvole za oba posle klika korisnika.
  async function askPermissions() {
    const fileOk = await permitted(state.file, true);
    const dirOk = state.dir ? await permitted(state.dir, true) : false;
    return { fileOk, dirOk };
  }

  const JSON_TYPES = [{ description: "UnderGRAND baza (JSON)", accept: { "application/json": [".json"] } }];

  async function pickDatabase() {
    const [h] = await window.showOpenFilePicker({ id: "ug-baza", types: JSON_TYPES, startIn: "documents" });
    if (!(await permitted(h, true))) throw new Error("Pregledač nije dozvolio upis u izabrani fajl.");
    state.file = h; state.lastText = null;
    await setH("baza", h);
    return h;
  }
  async function createDatabase() {
    const h = await window.showSaveFilePicker({ id: "ug-baza", suggestedName: "undergrand_stats.json", types: JSON_TYPES, startIn: "documents" });
    const text = serializeStore({ site: {}, zeno: [], theme: DEFAULT_THEME });
    await writeFile(h, text);
    state.file = h; state.lastText = text;
    await setH("baza", h);
    return h;
  }
  async function pickBackupDir() {
    const opts = { id: "ug-backup", mode: "readwrite" };
    if (state.file) opts.startIn = state.file;
    const h = await window.showDirectoryPicker(opts);
    if (!(await permitted(h, true))) throw new Error("Pregledač nije dozvolio upis u izabrani folder.");
    state.dir = h;
    await setH("backup", h);
    return h;
  }

  async function writeFile(handle, text) {
    const w = await handle.createWritable();   // upis ide u privremeni fajl i zamenjuje original tek na close()
    try { await w.write(text); await w.close(); }
    catch (e) { try { await w.abort(); } catch { /* već zatvoreno */ } throw e; }
  }
  const readText = async (h) => (await h.getFile()).text();

  const pad = (n, w = 2) => String(n).padStart(w, "0");
  function stamp() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-${pad(d.getMilliseconds(), 3)}000`;
  }

  // Spisak backup kopija (naziv počinje sa undergrand_stats_ i završava se sa .json), od najnovije.
  async function listBackups() {
    const names = [];
    for await (const [name, h] of state.dir.entries()) {
      if (h.kind === "file" && name.startsWith(BACKUP_PREFIX) && name.endsWith(".json")) names.push(name);
    }
    return names.sort().reverse();
  }

  // Retencija: poslednjih 10 + najnovija kopija za svaki dan u poslednjih 30 dana; nepoznat naziv se ne briše.
  async function pruneBackups() {
    try {
      const files = await listBackups();
      const keep = new Set(files.slice(0, BACKUP_KEEP_RECENT));
      const cutoff = addDays(today(), -BACKUP_KEEP_DAILY_DAYS), seen = new Set();
      for (const f of files) {
        const day = fromISO(f.slice(BACKUP_PREFIX.length, BACKUP_PREFIX.length + 10));
        if (!day) { keep.add(f); continue; }
        if (day >= cutoff && !seen.has(day.getTime())) { seen.add(day.getTime()); keep.add(f); }
      }
      for (const f of files) if (!keep.has(f)) { try { await state.dir.removeEntry(f); } catch (e) { console.warn("Backup nije obrisan", f, e); } }
    } catch (e) { console.warn("Greška pri čišćenju backupa", e); }
  }

  // Kopija trenutnog sadržaja baze u folder za backup. Vraća naziv kopije; baca grešku sa objašnjenjem.
  async function createBackup(text) {
    if (!state.dir) throw new Error("Folder za backup nije izabran.");
    if (!(await permitted(state.dir, true))) throw new Error("Pregledač nije dozvolio upis u folder za backup.");
    if (text === undefined) text = await readText(state.file);
    let name = `${BACKUP_PREFIX}${stamp()}.json`;
    for (let i = 1; await exists(name); i++) name = name.replace(/(\d{3})(\d{3})\.json$/, (_, ms) => `${ms}${pad(i, 3)}.json`);
    await writeFile(await state.dir.getFileHandle(name, { create: true }), text);
    await pruneBackups();
    return name;
  }
  async function exists(name) {
    try { await state.dir.getFileHandle(name); return true; } catch { return false; }
  }

  // Učitavanje. Ako baza nije čitljiva: pokvaren sadržaj se čuva u folderu za backup pod novim imenom,
  // a podaci se vraćaju iz najnovijeg ispravnog backupa (kao load_data u storage.py).
  async function load() {
    state.notice = null;
    const text = await readText(state.file);
    try {
      const store = parseStore(JSON.parse(text));
      state.lastText = text;
      return store;
    } catch (err) {
      console.error("Greška pri učitavanju baze", err);
    }
    state.lastText = text;   // sledeće čuvanje sme da prepiše pokvareni fajl (sadržaj je sačuvan ispod)
    let kept = "";
    const dirOk = await permitted(state.dir, false);
    if (dirOk) {
      try {
        const d = new Date();
        const name = `${state.file.name}.corrupt-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        await writeFile(await state.dir.getFileHandle(name, { create: true }), text);
        kept = `Pokvareni sadržaj je sačuvan u folderu za backup kao:\n${name}\n\n`;
      } catch (e) { console.error(e); }
      for (const name of await listBackups()) {
        try {
          const store = parseStore(JSON.parse(await readText(await state.dir.getFileHandle(name))));
          state.notice = "Baza podataka nije mogla da se pročita.\n\n" + kept +
            `Podaci su vraćeni iz najnovijeg ispravnog backupa:\n${name}\n\nUnosi nastali posle tog backupa mogu nedostajati.`;
          return store;
        } catch { /* sledeći */ }
      }
    }
    state.notice = "Baza podataka nije mogla da se pročita, a nijedan ispravan backup nije pronađen" +
      (dirOk ? "" : " (folder za backup nije dostupan)") + ".\n\n" + kept + "Program počinje sa praznom bazom.";
    return { site: {}, zeno: [], theme: DEFAULT_THEME, skipped: [] };
  }

  // Čuvanje: pre upisa backup trenutnog stanja na disku (ako je to ispravna baza), pa atomski upis.
  // Vraća { ok, warning, conflict }. Ne baca grešku - pozivalac poništava izmenu i javlja korisniku.
  async function save(store, { backup = true, onConflict } = {}) {
    try {
      if (!(await permitted(state.file, true))) return { ok: false, error: "Pregledač nije dozvolio upis u bazu." };
      const disk = await readText(state.file);
      if (state.lastText !== null && disk !== state.lastText && onConflict && !(await onConflict())) {
        return { ok: false, cancelled: true };
      }
      let warning = null;
      if (backup) {
        let valid = true;
        try { parseStore(JSON.parse(disk)); } catch { valid = false; }
        if (valid) {
          try { await createBackup(disk); }
          catch (e) { warning = `Backup nije napravljen: ${e.message || e}`; }
        }
      }
      const text = serializeStore(store);
      await writeFile(state.file, text);
      state.lastText = text;
      return { ok: true, warning };
    } catch (e) {
      console.error("Greška pri čuvanju baze", e);
      return { ok: false, error: e.message || String(e) };
    }
  }

  // Izbor backup fajla za vraćanje (otvara se u folderu za backup).
  async function pickRestoreFile() {
    const opts = { id: "ug-vrati", types: JSON_TYPES };
    if (state.dir) opts.startIn = state.dir;
    const [h] = await window.showOpenFilePicker(opts);
    return { name: h.name, text: await readText(h) };
  }

  window.UGBaza = {
    supported, restore, askPermissions, pickDatabase, createDatabase, pickBackupDir, load, save, createBackup,
    pickRestoreFile, permitted: (which, ask) => permitted(which === "dir" ? state.dir : state.file, ask),
    get fileName() { return state.file ? state.file.name : null; },
    get dirName() { return state.dir ? state.dir.name : null; },
    get hasDir() { return !!state.dir; },
    get notice() { return state.notice; },
  };
})();
