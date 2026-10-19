// Čitanje Zeno mejlova: .eml, .mbox (i velike, čitaju se u delovima) i Google Takeout .zip.
// Prenos zeno_body / zeno_parse_message iz zeno.py i _zeno_messages_from_file iz main_window.py.
(() => {
  const { zenoRecord, mkDate } = window.UG;

  // Bajtovi <-> "binarni" string (jedan znak = jedan bajt), da zaglavlja i kodiranja mogu da se čitaju regexom.
  function bin(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
    return s;
  }
  function unbin(s) {
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
    return out;
  }

  // ---------- ZAGLAVLJA ----------
  function splitHeaders(s) {
    const m = /\r?\n\r?\n/.exec(s);
    const head = m ? s.slice(0, m.index) : s, body = m ? s.slice(m.index + m[0].length) : "";
    const headers = {};
    for (const line of head.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i <= 0) continue;
      const name = line.slice(0, i).trim().toLowerCase();
      if (!(name in headers)) headers[name] = line.slice(i + 1).trim();   // kao msg.get(): prvo pojavljivanje
    }
    return { headers, body };
  }
  function param(value, name) {
    const m = new RegExp(`;\\s*${name}\\s*=\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|([^;\\s]+))`, "i").exec(value || "");
    return m ? (m[1] !== undefined ? m[1].replace(/\\(.)/g, "$1") : m[2]) : null;
  }

  // Datum iz zaglavlja Date (email.utils.parsedate_to_datetime(...).date()): dan po vremenskoj zoni samog zaglavlja.
  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
    "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  function parseMailDate(value) {
    if (!value) return null;
    let parts = value.trim().replace(/,/g, " ").split(/\s+/).filter(Boolean);
    if (!parts.length) return null;
    if (/^[a-z]+\.?$/i.test(parts[0]) && !MONTHS.includes(parts[0].toLowerCase().replace(".", ""))) parts = parts.slice(1);
    if (parts.length < 3) return null;
    let [dd, mm, yy] = parts;
    if (yy.includes(":") && parts[3]) yy = parts[3];   // asctime oblik: "Oct 5 08:00:00 2026"
    let mi = MONTHS.indexOf(mm.toLowerCase().replace(".", ""));
    if (mi < 0) { [dd, mm] = [mm, dd]; mi = MONTHS.indexOf(mm.toLowerCase().replace(".", "")); }
    if (mi < 0) return null;
    const month = (mi % 12) + 1;
    const day = parseInt(dd, 10);
    let year = parseInt(yy, 10);
    if (!Number.isFinite(day) || !Number.isFinite(year)) return null;
    if (yy.replace(/\D/g, "").length <= 2) year += year > 68 ? 1900 : 2000;
    return mkDate(year, month, day);
  }

  // ---------- DEKODIRANJE DELOVA ----------
  function decodeQP(s) {
    s = s.replace(/=\r?\n/g, "");
    return s.replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  function decodeB64(s) {
    let c = s.replace(/[^A-Za-z0-9+/]/g, "");
    c = c.slice(0, c.length - (c.length % 4 === 1 ? 1 : 0));
    while (c.length % 4) c += "=";
    try { return atob(c); } catch { return ""; }
  }
  function decodeText(binStr, charset) {
    const bytes = unbin(binStr);
    try { return new TextDecoder(charset || "utf-8").decode(bytes); }   // greške u bajtovima → zamena (kao "replace")
    catch { return new TextDecoder("utf-8").decode(bytes); }            // nepoznat charset
  }
  const entity = document.createElement("textarea");
  function unescapeHtml(s) {
    if (!s.includes("&")) return s;
    entity.innerHTML = s.replace(/</g, "&lt;");   // textarea samo dekodira entitete; ništa se ne izvršava
    return entity.value;
  }

  // Svi text/plain i text/html delovi (msg.walk()); HTML bez tagova.
  function collectText(s, parts, depth = 0) {
    const { headers, body } = splitHeaders(s);
    const ctype = ((headers["content-type"] || "text/plain").split(";")[0].trim().toLowerCase()) || "text/plain";
    if (ctype.startsWith("multipart/") && depth < 20) {
      const boundary = param(headers["content-type"], "boundary");
      if (!boundary) return;
      const sep = "--" + boundary;
      const chunks = body.split(sep);
      for (let i = 1; i < chunks.length; i++) {
        let c = chunks[i];
        if (c.startsWith("--")) break;               // kraj
        c = c.replace(/^[ \t]*\r?\n/, "").replace(/\r?\n$/, "");
        collectText(c, parts, depth + 1);
      }
      return;
    }
    if (ctype === "message/rfc822" && depth < 20) { collectText(body, parts, depth + 1); return; }
    if (ctype !== "text/plain" && ctype !== "text/html") return;
    const cte = (headers["content-transfer-encoding"] || "").trim().toLowerCase();
    const raw = cte === "base64" ? decodeB64(body) : cte === "quoted-printable" ? decodeQP(body) : body;
    if (!raw) return;
    let text = decodeText(raw, (param(headers["content-type"], "charset") || "").toLowerCase());
    if (ctype === "text/html") {
      text = text.replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ");
      text = unescapeHtml(text.replace(/<[^>]+>/g, " "));
    }
    parts.push(text);
  }

  // Jedna poruka (bajtovi) → Zeno zapis ili null. Datum se proverava prvo (jeftino).
  function parseMessage(bytes) {
    const headEnd = findHeaderEnd(bytes);
    const headStr = bin(bytes.subarray(0, headEnd));
    const sent = parseMailDate(splitHeaders(headStr + "\n\n").headers.date);
    if (!sent || sent.getUTCFullYear() < window.UG.ZENO_FIRST_YEAR) return null;
    const parts = [];
    collectText(bin(bytes), parts);
    return zenoRecord(sent, parts.join("\n"));
  }
  function findHeaderEnd(b) {
    for (let i = 0; i < b.length - 1; i++) {
      if (b[i] === 10 && (b[i + 1] === 10 || (b[i + 1] === 13 && b[i + 2] === 10))) return i + 1;
    }
    return b.length;
  }

  // ---------- MBOX: poruke se odvajaju redom koji počinje sa "From " ----------
  const FROM = [10, 70, 114, 111, 109, 32];   // "\nFrom "
  async function scanMbox(stream, onMessage) {
    const reader = stream.getReader();
    let carry = new Uint8Array(0), parts = [], started = false;
    const emit = () => {
      if (!parts.length) return;
      const len = parts.reduce((a, p) => a + p.length, 0), msg = new Uint8Array(len);
      let o = 0;
      for (const p of parts) { msg.set(p, o); o += p.length; }
      parts = [];
      // Prvi red "From ..." nije deo poruke.
      const nl = msg.indexOf(10);
      const bodyStart = started && msg[0] === 70 && nl >= 0 ? nl + 1 : 0;
      if (msg.length - bodyStart > 0) return onMessage(msg.subarray(bodyStart));
    };
    let first = true;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      let data = new Uint8Array(carry.length + value.length);
      data.set(carry); data.set(value, carry.length);
      if (first) { started = data[0] === 70; first = false; }
      let start = 0;
      for (let i = data.indexOf(10); i >= 0 && i <= data.length - FROM.length; i = data.indexOf(10, i + 1)) {
        let ok = true;
        for (let j = 1; j < FROM.length; j++) if (data[i + j] !== FROM[j]) { ok = false; break; }
        if (!ok) continue;
        parts.push(data.subarray(start, i + 1));
        await emit();
        started = true;
        start = i + 1;
      }
      const keep = Math.max(start, data.length - (FROM.length - 1));
      if (keep > start) parts.push(data.subarray(start, keep));
      carry = data.slice(keep);
    }
    if (carry.length) parts.push(carry);
    await emit();
  }

  // ---------- ZIP (Google Takeout): bez biblioteke, raspakivanje preko DecompressionStream ----------
  async function readBytes(file, start, end) { return new Uint8Array(await file.slice(start, end).arrayBuffer()); }
  async function zipEntries(file) {
    const tailLen = Math.min(file.size, 65557 + 20);
    const tail = await readBytes(file, file.size - tailLen, file.size);
    const dv = new DataView(tail.buffer);
    let eocd = -1;
    for (let i = tail.length - 22; i >= 0; i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error("Fajl nije ispravna ZIP arhiva.");
    let count = dv.getUint16(eocd + 10, true), cdSize = dv.getUint32(eocd + 12, true), cdOff = dv.getUint32(eocd + 16, true);
    if (count === 0xffff || cdSize === 0xffffffff || cdOff === 0xffffffff) {          // ZIP64 (arhive veće od 4 GB)
      const loc = eocd - 20;
      if (loc < 0 || dv.getUint32(loc, true) !== 0x07064b50) throw new Error("ZIP64 arhiva nije čitljiva.");
      const z64off = Number(dv.getBigUint64(loc + 8, true));
      const z = new DataView((await readBytes(file, z64off, z64off + 56)).buffer);
      if (z.getUint32(0, true) !== 0x06064b50) throw new Error("ZIP64 arhiva nije čitljiva.");
      count = Number(z.getBigUint64(32, true)); cdSize = Number(z.getBigUint64(40, true)); cdOff = Number(z.getBigUint64(48, true));
    }
    const cd = await readBytes(file, cdOff, cdOff + cdSize), c = new DataView(cd.buffer), entries = [];
    for (let p = 0, n = 0; n < count && p + 46 <= cd.length; n++) {
      if (c.getUint32(p, true) !== 0x02014b50) break;
      const flags = c.getUint16(p + 8, true), method = c.getUint16(p + 10, true);
      let comp = c.getUint32(p + 20, true), uncomp = c.getUint32(p + 24, true);
      const nameLen = c.getUint16(p + 28, true), extraLen = c.getUint16(p + 30, true), commLen = c.getUint16(p + 32, true);
      let local = c.getUint32(p + 42, true);
      const nameBytes = cd.subarray(p + 46, p + 46 + nameLen);
      const name = flags & 0x800 ? new TextDecoder().decode(nameBytes) : bin(nameBytes);
      for (let e = p + 46 + nameLen, end = e + extraLen; e + 4 <= end;) {      // ZIP64 dodatno polje
        const id = c.getUint16(e, true), size = c.getUint16(e + 2, true);
        if (id === 1) {
          let q = e + 4;
          if (uncomp === 0xffffffff) { uncomp = Number(c.getBigUint64(q, true)); q += 8; }
          if (comp === 0xffffffff) { comp = Number(c.getBigUint64(q, true)); q += 8; }
          if (local === 0xffffffff) { local = Number(c.getBigUint64(q, true)); }
        }
        e += 4 + size;
      }
      entries.push({ name, method, comp, uncomp, local });
      p += 46 + nameLen + extraLen + commLen;
    }
    return entries;
  }
  async function zipEntryStream(file, entry) {
    const h = new DataView((await readBytes(file, entry.local, entry.local + 30)).buffer);
    if (h.getUint32(0, true) !== 0x04034b50) throw new Error("ZIP arhiva je oštećena.");
    const start = entry.local + 30 + h.getUint16(26, true) + h.getUint16(28, true);
    const raw = file.slice(start, start + entry.comp).stream();
    if (entry.method === 0) return raw;
    if (entry.method === 8) return raw.pipeThrough(new DecompressionStream("deflate-raw"));
    throw new Error("ZIP koristi nepodržanu kompresiju.");
  }

  // Brojač preuzetih bajtova (za napredak).
  function counting(stream, onBytes) {
    let n = 0;
    return stream.pipeThrough(new TransformStream({ transform(chunk, ctl) { n += chunk.length; onBytes(n); ctl.enqueue(chunk); } }));
  }

  class ImportCancelled extends Error {}

  // Arhiva (.zip ili .mbox) → { items, total, failed }. progress(tekst) vraća false kad korisnik prekine.
  async function readArchive(file, progress) {
    const lower = file.name.toLowerCase();
    let stream, size, unit;
    if (lower.endsWith(".zip")) {
      const entries = (await zipEntries(file)).filter((e) => e.name.toLowerCase().endsWith(".mbox"));
      if (!entries.length) throw new Error("ZIP ne sadrži Zeno .mbox arhivu.");
      // Ako ih ima više, prednost ima Takeout oznaka koja u nazivu ima "zeno".
      const chosen = entries.find((e) => e.name.toLowerCase().includes("zeno")) || entries[0];
      stream = await zipEntryStream(file, chosen);
      size = chosen.uncomp; unit = "raspakovano";
    } else if (lower.endsWith(".mbox")) {
      stream = file.stream(); size = file.size; unit = "pročitano";
    } else {
      throw new Error("Izaberi Google Takeout .zip ili Zeno .mbox fajl.");
    }
    const items = [];
    let total = 0, failed = 0, bytes = 0, lastYield = performance.now();
    const mb = (n) => Math.floor(n / 1048576);
    const report = async (force) => {
      const now = performance.now();
      if (!force && now - lastYield < 150) return;
      lastYield = now;
      const ok = progress(`Pregledano poruka: ${total} · ${unit} ${mb(bytes)} od ${mb(size)} MB`, size ? bytes / size : 0);
      await new Promise((r) => setTimeout(r, 0));   // da prozor ostane živ i dugme „Prekini“ radi
      if (ok === false) throw new ImportCancelled();
    };
    await report(true);
    await scanMbox(counting(stream, (n) => { bytes = n; }), async (msg) => {
      total++;
      try {
        const item = parseMessage(msg);
        if (item) items.push(item);
      } catch (e) {
        failed++;
        if (failed <= 3) console.warn("Zeno: greška pri obradi poruke #" + total, e);
      }
      await report(false);
    });
    await report(true);
    return { items, total, failed };
  }

  // .eml fajl → Zeno zapis ili null.
  async function readEml(file) {
    return parseMessage(new Uint8Array(await file.arrayBuffer()));
  }

  window.UGMail = { readEml, readArchive, parseMessage, parseMailDate, ImportCancelled };
})();
