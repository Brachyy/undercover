/**
 * UNDERCOVER - Game State Management
 * Gestion de l'état du jeu avec persistance localStorage
 */

const STORAGE_KEY = 'undercover_game';

// État par défaut
const DEFAULT_STATE = {
  // Configuration
  config: {
    timerEnabled: false,
    timerDuration: 60, // en secondes
    roles: {
      undercover: { enabled: true, count: 1 },
      mr_white: { enabled: false, count: 1 },
      mr_mime: { enabled: false, count: 1 },
      voyant: { enabled: false, count: 1 },
      cameleon: { enabled: false, count: 1 }
    }
  },
  
  // Joueurs (noms uniquement avant le début)
  playerNames: [],
  
  // Données de la partie en cours
  game: null,
  // Structure de game quand actif:
  // {
  //   players: [{name, role, word, isEliminated, hasVoted, votedFor}],
  //   words: {main, similar},
  //   currentPlayerIndex: 0,
  //   currentRound: 1,
  //   phase: 'reveal' | 'play' | 'vote' | 'elimination' | 'finished',
  //   revealIndex: 0, // Pour la phase de révélation
  //   votes: {}, // {playerName: votesCount}
  //   winner: null, // 'civil' | 'undercover' | 'mr_white'
  //   mrWhiteGuess: null // Si Mr. White a deviné
  // }
};

// État en mémoire
let state = loadState();

/**
 * Charger l'état depuis localStorage
 */
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return { ...DEFAULT_STATE };
}

/**
 * Sauvegarder l'état dans localStorage
 */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

/**
 * Obtenir l'état complet
 */
export function getState() {
  return state;
}

/**
 * Obtenir la configuration
 */
export function getConfig() {
  return state.config;
}

/**
 * Mettre à jour la configuration
 */
export function updateConfig(updates) {
  state.config = { ...state.config, ...updates };
  saveState();
}

/**
 * Mettre à jour la config des rôles
 */
export function updateRoleConfig(roleId, updates) {
  if (state.config.roles[roleId]) {
    state.config.roles[roleId] = { ...state.config.roles[roleId], ...updates };
    saveState();
  }
}

/**
 * Obtenir les noms des joueurs
 */
export function getPlayerNames() {
  return state.playerNames;
}

/**
 * Ajouter un joueur
 */
export function addPlayerName(name) {
  const trimmed = name.trim();
  if (trimmed && !state.playerNames.includes(trimmed)) {
    state.playerNames.push(trimmed);
    saveState();
    return true;
  }
  return false;
}

/**
 * Supprimer un joueur
 */
export function removePlayerName(name) {
  const index = state.playerNames.indexOf(name);
  if (index > -1) {
    state.playerNames.splice(index, 1);
    saveState();
    return true;
  }
  return false;
}

/**
 * Réinitialiser les joueurs
 */
export function clearPlayerNames() {
  state.playerNames = [];
  saveState();
}

/**
 * Obtenir la partie en cours
 */
export function getGame() {
  return state.game;
}

/**
 * Démarrer une nouvelle partie
 */
export function startGame(players, words) {
  state.game = {
    players: players,
    words: words,
    currentPlayerIndex: 0,
    currentRound: 1,
    phase: 'reveal',
    revealIndex: 0,
    votes: {},
    winner: null,
    mrWhiteGuess: null
  };
  saveState();
}

/**
 * Mettre à jour la partie
 */
export function updateGame(updates) {
  if (state.game) {
    state.game = { ...state.game, ...updates };
    saveState();
  }
}

/**
 * Passer au joueur suivant pour la révélation
 */
export function nextReveal() {
  if (state.game) {
    state.game.revealIndex++;
    if (state.game.revealIndex >= state.game.players.length) {
      state.game.phase = 'play';
      state.game.currentPlayerIndex = 0;
    }
    saveState();
  }
}

/**
 * Passer au tour suivant
 */
export function nextTurn() {
  if (!state.game) return;
  
  const alivePlayers = state.game.players.filter(p => !p.isEliminated);
  let nextIndex = state.game.currentPlayerIndex;
  
  do {
    nextIndex = (nextIndex + 1) % state.game.players.length;
  } while (state.game.players[nextIndex].isEliminated && nextIndex !== state.game.currentPlayerIndex);
  
  state.game.currentPlayerIndex = nextIndex;
  
  // Vérifier si tout le monde a joué ce tour
  const currentPlayer = state.game.players[state.game.currentPlayerIndex];
  const firstAlive = alivePlayers[0];
  
  if (currentPlayer.name === firstAlive.name && state.game.currentRound > 0) {
    // Nouveau tour complet, passer au vote
    state.game.phase = 'vote';
    state.game.votes = {};
    // Reset les votes des joueurs
    state.game.players.forEach(p => {
      p.hasVoted = false;
      p.votedFor = null;
    });
  }
  
  saveState();
}

/**
 * Enregistrer un vote
 */
export function registerVote(voterName, targetName) {
  if (!state.game) return;
  
  const voter = state.game.players.find(p => p.name === voterName);
  if (voter && !voter.isEliminated && !voter.hasVoted) {
    voter.hasVoted = true;
    voter.votedFor = targetName;
    state.game.votes[targetName] = (state.game.votes[targetName] || 0) + 1;
    saveState();
  }
}

/**
 * Obtenir le joueur le plus voté
 */
export function getMostVotedPlayer() {
  if (!state.game || !state.game.votes) return null;
  
  let maxVotes = 0;
  let mostVoted = null;
  
  for (const [name, votes] of Object.entries(state.game.votes)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      mostVoted = name;
    }
  }
  
  return state.game.players.find(p => p.name === mostVoted);
}

/**
 * Éliminer un joueur
 */
export function eliminatePlayer(playerName) {
  if (!state.game) return null;
  
  const player = state.game.players.find(p => p.name === playerName);
  if (player) {
    player.isEliminated = true;
    saveState();
    return player;
  }
  return null;
}

/**
 * Vérifier les conditions de victoire
 * @returns {string|null} 'civil', 'undercover', 'mr_white', ou null si pas fini
 */
export function checkWinCondition() {
  if (!state.game) return null;
  
  const alive = state.game.players.filter(p => !p.isEliminated);
  const aliveUndercovers = alive.filter(p => p.role.team === 'undercover');
  const aliveCivils = alive.filter(p => p.role.team === 'civil');
  const aliveMrWhite = alive.filter(p => p.role.id === 'mr_white');
  
  // Mr. White gagne s'il devine le mot (géré ailleurs)
  
  // Undercovers gagnent si égalité ou plus nombreux
  if (aliveUndercovers.length >= aliveCivils.length + aliveMrWhite.length) {
    return 'undercover';
  }
  
  // Civils gagnent si tous les undercovers sont éliminés
  if (aliveUndercovers.length === 0) {
    // Vérifier s'il reste des Mr. White
    if (aliveMrWhite.length === 0) {
      return 'civil';
    }
    // Mr. White seul contre civils = civils peuvent continuer à chercher
    if (alive.length <= 2) {
      return 'civil'; // Trop peu de joueurs, fin de partie
    }
  }
  
  return null;
}

/**
 * Terminer la partie avec un gagnant
 */
export function endGame(winner) {
  if (state.game) {
    state.game.winner = winner;
    state.game.phase = 'finished';
    saveState();
  }
}

/**
 * Mr. White tente de deviner le mot
 */
export function mrWhiteGuess(guess) {
  if (!state.game) return false;
  
  state.game.mrWhiteGuess = guess;
  const correct = guess.toLowerCase().trim() === state.game.words.main.toLowerCase().trim();
  
  if (correct) {
    endGame('mr_white');
  }
  
  saveState();
  return correct;
}

/**
 * Vérifier s'il y a une partie en cours
 */
export function hasActiveGame() {
  return state.game !== null && state.game.phase !== 'finished';
}

/**
 * Réinitialiser la partie
 */
export function resetGame() {
  state.game = null;
  saveState();
}

/**
 * Réinitialiser tout
 */
export function resetAll() {
  state = { ...DEFAULT_STATE };
  saveState();
}
