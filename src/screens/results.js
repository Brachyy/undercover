/**
 * UNDERCOVER - Results Screen
 * Écran de fin de partie
 */

import { navigateTo } from '../app.js';
import { getGame, resetGame, clearPlayerNames } from '../game/state.js';
import { getInitial, getColorFromName } from '../game/logic.js';

export function renderResults() {
  const screen = document.createElement('div');
  screen.className = 'screen results-screen';
  
  const game = getGame();
  if (!game) {
    navigateTo('home');
    return screen;
  }
  
  const winner = game.winner;
  const winnerEmoji = getWinnerEmoji(winner);
  const winnerText = getWinnerText(winner);
  
  screen.innerHTML = `
    <div class="screen-header">
      <h2>🏆 Fin de partie</h2>
    </div>
    
    <div class="screen-content">
      <div class="results-winner">
        <div class="results-winner-emoji">${winnerEmoji}</div>
        <p class="results-winner-text">Victoire des</p>
        <h2 class="results-winner-team ${winner}">${winnerText}</h2>
      </div>
      
      <div class="results-words">
        <div class="results-word-card">
          <p class="results-word-label">Mot Civil</p>
          <p class="results-word-value" style="color: var(--color-civil);">${game.words.main}</p>
        </div>
        <div class="results-word-card">
          <p class="results-word-label">Mot Undercover</p>
          <p class="results-word-value" style="color: var(--color-undercover);">${game.words.similar}</p>
        </div>
      </div>
      
      <div class="results-players">
        <h3>Récapitulatif</h3>
        ${game.players.map(player => `
          <div class="results-player ${player.isEliminated ? 'eliminated' : ''}">
            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
              <div class="player-avatar" style="background: ${getColorFromName(player.name)}; width: 36px; height: 36px; font-size: 1rem;">
                ${getInitial(player.name)}
              </div>
              <span class="results-player-name">${player.name}</span>
              ${player.isEliminated ? '<span style="color: var(--text-muted);">☠️</span>' : ''}
            </div>
            <div class="role-badge role-badge-${player.role.id}" style="font-size: 0.75rem;">
              ${player.role.emoji} ${player.role.name}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="screen-footer">
      <button class="btn btn-primary btn-full btn-lg" id="btn-replay">
        🔄 Rejouer
      </button>
      <button class="btn btn-secondary btn-full" id="btn-new-players">
        👥 Nouveaux joueurs
      </button>
      <button class="btn btn-ghost btn-full" id="btn-home">
        🏠 Accueil
      </button>
    </div>
  `;
  
  // Event listeners
  setTimeout(() => {
    document.getElementById('btn-replay').addEventListener('click', () => {
      // Rejouer avec les mêmes joueurs
      resetGame();
      navigateTo('setup');
    });
    
    document.getElementById('btn-new-players').addEventListener('click', () => {
      resetGame();
      clearPlayerNames();
      navigateTo('setup');
    });
    
    document.getElementById('btn-home').addEventListener('click', () => {
      resetGame();
      navigateTo('home');
    });
  }, 0);
  
  return screen;
}

function getWinnerEmoji(winner) {
  switch (winner) {
    case 'civil': return '👤';
    case 'undercover': return '🕵️';
    case 'mr_white': return '⬜';
    default: return '🏆';
  }
}

function getWinnerText(winner) {
  switch (winner) {
    case 'civil': return 'CIVILS !';
    case 'undercover': return 'UNDERCOVERS !';
    case 'mr_white': return 'MR. WHITE !';
    default: return '???';
  }
}
