/**
 * UNDERCOVER - Application Router
 * Gestion des écrans et navigation
 */

import { renderHome } from './screens/home.js';
import { renderSetup } from './screens/setup.js';
import { renderPlayers } from './screens/players.js';
import { renderReveal } from './screens/reveal.js';
import { renderPlay } from './screens/play.js';
import { renderVote } from './screens/vote.js';
import { renderResults } from './screens/results.js';
import { hasActiveGame, getGame } from './game/state.js';

// Conteneur principal
let appContainer = null;

// Écran actuel
let currentScreen = 'home';

// Map des renderers
const screens = {
  home: renderHome,
  setup: renderSetup,
  players: renderPlayers,
  reveal: renderReveal,
  play: renderPlay,
  vote: renderVote,
  results: renderResults
};

/**
 * Initialiser l'application
 */
export function initApp() {
  appContainer = document.getElementById('app');
  
  // Vérifier s'il y a une partie en cours
  if (hasActiveGame()) {
    const game = getGame();
    navigateTo(game.phase === 'finished' ? 'results' : game.phase);
  } else {
    navigateTo('home');
  }
}

/**
 * Naviguer vers un écran
 */
export function navigateTo(screenName) {
  if (!screens[screenName]) {
    console.error(`Screen "${screenName}" not found`);
    return;
  }
  
  currentScreen = screenName;
  render();
}

/**
 * Rendre l'écran actuel
 */
export function render() {
  if (!appContainer) return;
  
  // Nettoyer
  appContainer.innerHTML = '';
  
  // Rendre l'écran
  const screenElement = screens[currentScreen]();
  appContainer.appendChild(screenElement);
}

/**
 * Obtenir l'écran actuel
 */
export function getCurrentScreen() {
  return currentScreen;
}
