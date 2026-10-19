// Centralni registar igara. Svaki fajl u games/ poziva registerGame({...}).
// Šema igre je opisana u CLAUDE.md.
window.GAMES = [];

function registerGame(game) {
  game.expansions = game.expansions || [];
  game.glossary = game.glossary || [];
  game.quickRef = game.quickRef || [];
  game.rules = game.rules || [];
  game.sources = game.sources || [];
  game.houseRules = game.houseRules || [];
  window.GAMES.push(game);
}

// Dodatak/ekspanzija u posebnom fajlu (učitava se posle fajla igre)
function registerExpansion(gameId, expansion) {
  const game = window.GAMES.find((g) => g.id === gameId);
  if (!game) {
    console.warn(`registerExpansion: igra "${gameId}" nije pronađena`);
    return;
  }
  game.expansions.push(expansion);
}
