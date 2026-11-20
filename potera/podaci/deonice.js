// UnderGRAND — Potera do Horgoša: deonice
// Kilometraža je igrovna (okvirno prati autoput Novi Sad – Subotica – Horgoš).
// Napomena: na maketi piše 142 km samo kao primer; važe brojevi iz ovog fajla.
// nebo: lista boja odozgo nadole (dithering između susednih), sunce: null ili {x, y, r}
// njive: redosled tipova iz FIELD u dizajn/scena.js (zito, suncokret, kukuruz, uzorano), smenjuju se na ~1 km
// saobracaj: gustina 0..1, vozila koja se pojavljuju
// krivine: niz [duzina_u_segmentima, krivina(-1..1), brdo(-1..1)]

window.UG_DEONICE = [
  {
    id: 1,
    naziv: "IZLAZ IZ NOVOG SADA",
    doba: "noć",
    kmOd: 128, kmDo: 98,
    vreme: 60,
    nebo: ["#05040f", "#0b0a24", "#141238", "#1d1a4a", "#2a2058", "#3a2a5e"],
    sunce: null,
    mesec: { x: 70, y: 30, r: 9 },
    siluete: ["zgrade", "dimnjak", "dalekovod"],
    svetla: true, // farovi, uključene bandere, prozori u zgradama
    njive: ["uzorano", "kukuruz"],
    pored: ["bandera", "bandera", "putokaz", "bilbord", "nadvoznjak", "naplatna_rampa"],
    putokazi: [
      { km: 125, tekst: ["HORGOŠ    125", "SUBOTICA  100"] },
      { km: 110, tekst: ["VRBAS      12", "HORGOŠ    110"] }
    ],
    saobracaj: { gustina: 0.6, vozila: ["mali_auto", "kombi", "kamion", "autobus"] },
    krivine: [[40, 0, 0], [30, 0.4, 0], [20, 0, 0.3], [40, -0.6, 0], [30, 0, -0.3], [50, 0.2, 0], [40, -0.3, 0.2]],
    muzika: "noc_grad"
  },
  {
    id: 2,
    naziv: "SRBOBRAN · KANAL",
    doba: "zora",
    kmOd: 98, kmDo: 66,
    vreme: 60,
    nebo: ["#1a2048", "#33306a", "#5a4482", "#8a5a8a", "#c27a86", "#eaa07a", "#f6c88a"],
    sunce: { x: 60, y: 102, r: 18 },
    siluete: ["topole", "salas", "silos"],
    njive: ["zito", "uzorano", "suncokret"],
    pored: ["bandera", "topola", "putokaz", "bilbord", "most_kanal"],
    putokazi: [
      { km: 90, tekst: ["SRBOBRAN    4", "HORGOŠ     90"] },
      { km: 72, tekst: ["FEKETIĆ     3", "HORGOŠ     72"] }
    ],
    saobracaj: { gustina: 0.45, vozila: ["mali_auto", "kamion", "traktor", "kombi"] },
    krivine: [[50, 0, 0], [40, 0.5, 0], [30, 0, 0.2], [30, -0.5, -0.2], [60, 0, 0], [30, 0.7, 0], [40, 0, 0]],
    muzika: "zora"
  },
  {
    id: 3,
    naziv: "BAČKA RAVNICA",
    doba: "zalazak",
    kmOd: 66, kmDo: 34,
    vreme: 60,
    // isto kao na maketi (pal u scena.js)
    nebo: ["#120a34", "#1e0e46", "#2e1256", "#421862", "#5c1e68", "#782666", "#963060", "#b43c58", "#ce4e4c", "#e26840", "#f0883a", "#f7a840", "#fac454"],
    sunce: { x: 228, y: 88, r: 26 },
    siluete: ["salas", "djeram", "topole", "crkva"],
    njive: ["zito", "suncokret", "uzorano", "kukuruz"],
    traktor: true, // traktor na njivi sa prašinom, kao na maketi
    pored: ["putokaz", "bilbord", "topola", "bandera", "salas_blizu"],
    putokazi: [
      { km: 60, tekst: ["B. TOPOLA   8", "HORGOŠ     60"] },
      { km: 40, tekst: ["SUBOTICA   15", "HORGOŠ     40"] }
    ],
    saobracaj: { gustina: 0.35, vozila: ["mali_auto", "kamion", "traktor", "autobus"] },
    krivine: [[60, 0, 0], [40, 0.3, 0], [50, 0, 0], [30, -0.4, 0.1], [70, 0, 0], [30, 0.5, 0], [50, -0.2, 0]],
    muzika: "ravnica"
  },
  {
    id: 4,
    naziv: "SUBOTICA · HORGOŠ",
    doba: "noć",
    kmOd: 34, kmDo: 0,
    vreme: 60,
    nebo: ["#020208", "#06061a", "#0c0c2a", "#14123a", "#1e1844", "#2a1e4a"],
    sunce: null,
    mesec: { x: 250, y: 24, r: 7 },
    siluete: ["vetrenjace", "salas", "reflektori_granica"],
    svetla: true,
    njive: ["uzorano", "zito"],
    pored: ["bandera", "putokaz", "bilbord", "red_kamiona", "granicni_prelaz"],
    putokazi: [
      { km: 30, tekst: ["SUBOTICA    2", "HORGOŠ     30"] },
      { km: 10, tekst: ["HORGOŠ     10", "GRANICA     10"] },
      { km: 2, tekst: ["GRANIČNI PRELAZ", "HORGOŠ"] }
    ],
    saobracaj: { gustina: 0.7, vozila: ["kamion", "kamion", "mali_auto", "kombi"] },
    krivine: [[40, 0, 0], [30, -0.6, 0], [30, 0.6, 0], [40, 0, 0.2], [30, -0.4, 0], [60, 0, 0], [30, 0.2, 0]],
    muzika: "granica"
  }
];
