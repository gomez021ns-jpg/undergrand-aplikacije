// Fudbalske lige sa ESPN-a (vidi SC.espnLeague u leagues/espn.js, mode "matchday").
// Nova liga = još jedan poziv sa ESPN kodom lige (npr. "esp.1" La Liga, "ita.1" Serie A, "uefa.europa").
(() => {
  const stat = (e, name) => e.stats.find((s) => s.name === name)?.displayValue ?? "";

  const COLUMNS = [
    { key: "gamesPlayed", label: "Ut.", title: "Odigrano utakmica" },
    { key: "wins", label: "P", title: "Pobede" },
    { key: "ties", label: "N", title: "Nerešeno" },
    { key: "losses", label: "I", title: "Porazi" },
    { key: "goals", label: "Gol.", title: "Dati : primljeni golovi", cls: "hide-sm",
      render: (e) => `${stat(e, "pointsFor")}:${stat(e, "pointsAgainst")}` },
    { key: "pointDifferential", label: "GR", title: "Gol razlika" },
    { key: "points", label: "Bod.", title: "Bodovi", render: (e) => `<b>${stat(e, "points")}</b>` },
  ];

  const NOTES = {
    "Champions League": "Liga šampiona",
    "Champions League Qualifying": "Kvalifikacije za Ligu šampiona",
    "Europa League": "Liga Evrope",
    "Conference League": "Liga konferencija",
    "Conference League Qualifying": "Kvalifikacije za Ligu konferencija",
    "Relegation": "Ispadanje",
    "Qualifies for round of 16": "Direktno u osminu finala",
    "Knockout phase playoffs - seeded": "Baraž za nokaut fazu (nosioci)",
    "Knockout phase playoffs - unseeded": "Baraž za nokaut fazu (nenosioci)",
    "Eliminated": "Eliminisani",
  };

  const base = {
    mode: "matchday", homeFirst: true, noRecord: true, noLines: true,
    sortStat: "rank", teamLabel: "Klub", columns: COLUMNS, notes: NOTES,
    gameLabel: () => "", groupName: (n) => n,
    detail: SC.espnSoccerDetail,   // „Detalji“ = prozor u aplikaciji (tok utakmice, postave, statistika, komentar)
  };

  SC.espnLeague({
    ...base,
    id: "premijer-liga", name: "Premijer liga", short: "Premijer liga", accent: "#7c3aed", icon: "🦁", visual: "fb",
    path: "soccer/eng.1", sourceUrl: "https://www.espn.com/soccer/league/_/name/eng.1",
  });

  SC.espnLeague({
    ...base,
    id: "liga-sampiona", name: "Liga šampiona", short: "Liga šampiona", accent: "#0e7490", icon: "⚽", visual: "fb",
    path: "soccer/uefa.champions", sourceUrl: "https://www.espn.com/soccer/league/_/name/uefa.champions",
    groupName: (n) => n.replace("League Phase", "Ligaška faza"),
    phaseLabel: (p) => ({
      "Knockout Round Playoffs": "Baraž za nokaut fazu",
      "Rd of 16": "Osmina finala",
      "Quarterfinals": "Četvrtfinale",
      "Semifinals": "Polufinale",
      "Final": "Finale",
    })[p] || p,
  });
})();
