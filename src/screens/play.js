/**
 * UNDERCOVER - Play Screen
 * Phase de jeu tour par tour
 */

import { navigateTo, render } from '../app.js';
import { getGame, updateGame, getConfig } from '../game/state.js';
import { getAlivePlayers, formatTime, getInitial, getColorFromName } from '../game/logic.js';

let timerInterval = null;
let timeRemaining = 0;

export function renderPlay() {
  const screen = document.createElement('div');
  screen.className = 'screen play-screen';
  
  const game = getGame();
  if (!game) {
    navigateTo('home');
    return screen;
  }
  
  // Nettoyer le timer précédent
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  const config = getConfig();
  const alivePlayers = getAlivePlayers();
  const currentPlayer = game.players[game.currentPlayerIndex];
  
  // S'assurer que le joueur actuel est en vie
  if (currentPlayer.isEliminated) {
    goToNextPlayer(game, alivePlayers);
    return screen;
  }
  
  const isMime = currentPlayer.role.id === 'mr_mime';
  
  screen.innerHTML = `
    <div class="screen-header">
      <h2>Tour ${game.currentRound}</h2>
      <p style="color: var(--text-muted);">Donne un indice d'un mot</p>
    </div>
    
    <div class="screen-content">
      <div class="play-current">
        <p class="play-current-label">C'est au tour de</p>
        <h2 class="play-current-name">${currentPlayer.name}</h2>
        
        ${isMime ? `
          <div class="role-badge role-badge-mr_mime play-current-role">
            🤫 MIME (pas de parole !)
          </div>
        ` : ''}
      </div>
      
      ${config.timerEnabled ? `
        <div class="play-timer-container">
          <div class="timer" id="timer">
            ${formatTime(config.timerDuration)}
          </div>
        </div>
      ` : ''}
      
      <div style="margin-top: auto;">
        <p style="color: var(--text-muted); text-align: center; margin-bottom: var(--spacing-md);">
          Joueurs restants
        </p>
        <div class="play-players-done">
          ${alivePlayers.map((p, index) => {
            const isCurrent = p.name === currentPlayer.name;
            const hasPassed = index < alivePlayers.indexOf(currentPlayer);
            return `
              <div class="play-player-chip ${isCurrent ? 'current' : ''} ${hasPassed ? 'done' : ''}">
                ${p.name}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    
    <div class="screen-footer">
      <button class="btn btn-primary btn-full btn-lg" id="btn-next-player">
        ✓ Indice donné → Suivant
      </button>
      <button class="btn btn-secondary btn-full" id="btn-vote">
        🗳️ Passer au vote
      </button>
    </div>
  `;
  
  // Timer
  if (config.timerEnabled) {
    timeRemaining = config.timerDuration;
    startTimer();
  }
  
  // Event listeners
  setTimeout(() => {
    document.getElementById('btn-next-player').addEventListener('click', () => {
      stopTimer();
      goToNextPlayer(game, alivePlayers);
    });
    
    document.getElementById('btn-vote').addEventListener('click', () => {
      stopTimer();
      updateGame({ phase: 'vote' });
      // Reset les votes
      game.players.forEach(p => {
        p.hasVoted = false;
        p.votedFor = null;
      });
      updateGame({ votes: {} });
      navigateTo('vote');
    });
  }, 0);
  
  return screen;
}

function goToNextPlayer(game, alivePlayers) {
  const currentIndex = alivePlayers.findIndex(p => p.name === game.players[game.currentPlayerIndex].name);
  const nextIndex = (currentIndex + 1) % alivePlayers.length;
  
  // Si on revient au premier joueur, nouveau tour
  if (nextIndex === 0) {
    updateGame({ 
      currentRound: game.currentRound + 1,
      phase: 'vote'
    });
    // Reset les votes
    game.players.forEach(p => {
      p.hasVoted = false;
      p.votedFor = null;
    });
    updateGame({ votes: {} });
    navigateTo('vote');
    return;
  }
  
  // Trouver l'index dans le tableau complet
  const nextPlayer = alivePlayers[nextIndex];
  const fullIndex = game.players.findIndex(p => p.name === nextPlayer.name);
  
  updateGame({ currentPlayerIndex: fullIndex });
  render();
}

function startTimer() {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    timerEl.textContent = formatTime(timeRemaining);
    
    if (timeRemaining <= 10) {
      timerEl.classList.add('danger');
    } else if (timeRemaining <= 20) {
      timerEl.classList.add('warning');
      timerEl.classList.remove('danger');
    }
    
    if (timeRemaining <= 0) {
      stopTimer();
      // Temps écoulé, passer au suivant automatiquement
      const game = getGame();
      const alivePlayers = getAlivePlayers();
      goToNextPlayer(game, alivePlayers);
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
