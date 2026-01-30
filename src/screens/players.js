/**
 * UNDERCOVER - Players Screen
 * Gestion des joueurs
 */

import { navigateTo } from '../app.js';
import { 
  getPlayerNames, 
  addPlayerName, 
  removePlayerName, 
  getConfig,
  startGame 
} from '../game/state.js';
import { assignRoles } from '../game/roles.js';
import { getRandomWordPair } from '../game/words.js';
import { validateGameSetup, getInitial, getColorFromName } from '../game/logic.js';

export function renderPlayers() {
  const screen = document.createElement('div');
  screen.className = 'screen players-screen';
  
  updatePlayersScreen(screen);
  
  return screen;
}

function updatePlayersScreen(screen) {
  const playerNames = getPlayerNames();
  const validation = validateGameSetup();
  
  screen.innerHTML = `
    <div class="screen-header">
      <h2>👥 Joueurs</h2>
      <p class="players-count">${playerNames.length} joueur${playerNames.length > 1 ? 's' : ''} (min. 4)</p>
    </div>
    
    <div class="screen-content">
      <div class="add-player-form">
        <input type="text" class="input" id="player-input" 
               placeholder="Nom du joueur" maxlength="20" autocomplete="off">
        <button class="btn btn-primary btn-icon" id="btn-add">
          +
        </button>
      </div>
      
      <div class="players-list" id="players-list">
        ${playerNames.length === 0 ? `
          <div class="card" style="text-align: center; padding: var(--spacing-xl);">
            <p style="color: var(--text-muted);">Aucun joueur ajouté</p>
            <p style="color: var(--text-muted); font-size: 0.875rem;">Ajoute au moins 4 joueurs pour commencer</p>
          </div>
        ` : playerNames.map(name => `
          <div class="player-item" data-player="${name}">
            <div class="player-avatar" style="background: ${getColorFromName(name)}">
              ${getInitial(name)}
            </div>
            <span class="player-name">${name}</span>
            <button class="btn btn-ghost btn-icon btn-remove" data-player="${name}" style="width: 36px; height: 36px; font-size: 1rem;">
              ✕
            </button>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="screen-footer">
      ${!validation.valid ? `
        <div class="card" style="background: rgba(239, 68, 68, 0.1); border-color: var(--color-danger); margin-bottom: var(--spacing-md);">
          <p style="color: var(--color-danger); font-size: 0.875rem; text-align: center;">
            ⚠️ ${validation.errors[0]}
          </p>
        </div>
      ` : ''}
      <button class="btn btn-primary btn-full btn-lg" id="btn-start" ${!validation.valid ? 'disabled' : ''}>
        🎮 Commencer la partie
      </button>
      <button class="btn btn-ghost btn-full" id="btn-back">
        ← Retour
      </button>
    </div>
  `;
  
  // Event listeners
  setTimeout(() => {
    const input = document.getElementById('player-input');
    const btnAdd = document.getElementById('btn-add');
    
    const addPlayer = () => {
      const name = input.value.trim();
      if (name && addPlayerName(name)) {
        input.value = '';
        updatePlayersScreen(screen);
      } else if (name) {
        // Nom déjà utilisé
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      }
      input.focus();
    };
    
    btnAdd.addEventListener('click', addPlayer);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addPlayer();
    });
    
    // Focus auto sur l'input
    input.focus();
    
    // Boutons supprimer
    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.player;
        removePlayerName(name);
        updatePlayersScreen(screen);
      });
    });
    
    // Démarrer la partie
    document.getElementById('btn-start').addEventListener('click', () => {
      const validation = validateGameSetup();
      if (validation.valid) {
        startNewGame();
      }
    });
    
    // Retour
    document.getElementById('btn-back').addEventListener('click', () => {
      navigateTo('setup');
    });
  }, 0);
}

function startNewGame() {
  const playerNames = getPlayerNames();
  const config = getConfig();
  
  // Obtenir une paire de mots aléatoire
  const words = getRandomWordPair();
  
  // Attribuer les rôles
  const players = assignRoles(playerNames, config.roles, words);
  
  // Démarrer la partie
  startGame(players, words);
  
  // Naviguer vers la révélation
  navigateTo('reveal');
}
