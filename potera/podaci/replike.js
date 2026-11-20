// UnderGRAND — Potera do Horgoša: dispečerka Dragana, bilbordi, poruke
// {km} {vreme} {ime} se zamenjuju u igri. Oblačić ima najviše 3 reda po ~38 znakova.
// Ton (korisnik 13. 11. 2026): suv policijski radio-žargon i zvaničan jezik; smešno je što sadržaj nije ozbiljan.

window.UG_REPLIKE = {
  dispecerka: {
    ime: "DISPEČERKA DRAGANA",
    start: [
      "Jedinica 7, meta je {km} km ispred vas. Sirena uključena. Prijem.",
      "Centrala Jedinici 7. Put je slobodan, savest nije. Krenite.",
      "Odobrenje za poteru imate. Budžet za gorivo nemate. Prijem."
    ],
    dzipNaVidiku: [
      "Meta je u vidnom polju. Ostvarite kontakt.",
      "To je to vozilo. Tablice nečitke, savest takođe.",
      "Imate vizuelni kontakt. Njegov advokat još nema."
    ],
    udarac: [
      "Kontakt ostvaren. Nastavite.",
      "Prema podacima sa terena, oštećenje je značajno.",
      "Meta trubi. Upišite to kao priznanje."
    ],
    sudarSaobracaj: [
      "Jedinice 7, to je bio građanin. Upišite kao nezgodu bez povređenih.",
      "Saobraćaj nije meta. Ponavljam, saobraćaj nije meta.",
      "Izvinite se vozaču. Pismeno, u tri primerka."
    ],
    njiva: [
      "Jedinice 7, napustili ste autoput. Njiva nije u nadležnosti.",
      "Vlasnik parcele podnosi prijavu. Vratite se na asfalt.",
      "Poljoprivredno zemljište nije koridor. Prijem."
    ],
    malo_vremena: [
      "Ostalo je {vreme} sekundi. Granica ne čeka.",
      "Vreme ističe. Advokat je već na granici."
    ],
    uhapsen: [
      "{ime} je u pritvoru. Dokazi su u prtljažniku.",
      "Kofere u dokazni materijal, osumnjičenog u maricu.",
      "Predmet je predat tužilaštvu. Ostali su još u bekstvu."
    ],
    pobegao: [
      "Meta je prešla granicu. Očekujte razglednicu.",
      "Predmet se prosleđuje Interpolu. I oni su spori."
    ]
  },

  // natpisi na bilbordima pored puta: parodija propagande, bez stranaka i bez pravih imena
  bilbordi: [
    "GRADIMO. NE PITAJTE ŠTA.",
    "AUTOPUT OTVOREN TREĆI PUT",
    "INVESTICIJA VEKA · FAZA 1 OD 12",
    "TENDER JE ZATVOREN. ZAKASNILI STE.",
    "VAŠ KREDIT, NAŠA BUDUĆNOST",
    "SLUŠAJTE UNDERGRAND RADIO",
    "UNDERGRAND · 24/7",
    "KOFERI · POPUST ZA FUNKCIONERE",
    "IZLAZ ZA DUBAI · 2 KM",
    "MENJAČNICA NA GRANICI · 0-24"
  ],

  ekrani: {
    pritisni: "PRITISNI SPACE",
    deonicaPredjena: "DEONICA PREĐENA",
    vremeBonus: "BONUS ZA VREME",
    uhapsen: "UHAPŠEN!",
    pobegao: "DŽIP JE PREŠAO GRANICU",
    nastavak: "NASTAVAK?",
    pauza: "PAUZA",
    rekordi: "NAJBOLJI VOZAČI",
    unesiInicijale: "UNESI INICIJALE",
    // kraj igre kao sudski epilog
    kraj: [
      { min: 4, naslov: "PREDMET ZATVOREN", tekst: "Tužilaštvo je primilo četiri kofera dokaza. Suđenje zakazano za 2031." },
      { min: 3, naslov: "DELIMIČAN USPEH", tekst: "Jedan je na slobodi. Javlja se iz inostranstva, redovno." },
      { min: 2, naslov: "POLA-POLA", tekst: "Dvojica u pritvoru, dvojica na konferenciji za štampu." },
      { min: 1, naslov: "JEDAN OD ČETIRI", tekst: "Dispečerka kaže: \"I to je statistika.\"" },
      { min: 0, naslov: "NEMA NIKOGA", tekst: "Jedinica 7 je premeštena na naplatnu rampu." }
    ]
  },

  kartica: {
    naslov: "POTERA DO HORGOŠA",
    podnaslov: "UnderGRAND radio",
    tekst: "Zatvoreni predmeti: {broj} od 4. Skor: {skor}."
  }
};
