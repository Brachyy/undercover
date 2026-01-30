/**
 * UNDERCOVER - Vote Screen
 * Vote COLLECTIF : les joueurs discutent et choisissent UNE personne ensemble
 */

import { navigateTo } from '../app.js';
import { 
  getGame, 
  updateGame, 
  eliminatePlayer,
  checkWinCondition,
  endGame,
  mrWhiteGuess
} from '../game/state.js';
import { getAlivePlayers, getInitial, getColorFromName } from '../game/logic.js';

let selectedTarget = null;
let phase = 'voting'; // 'voting', 'confirm', 'result', 'mr_white_guess'
let eliminatedPlayer = null;

export function renderVote() {
  const screen = document.createElement('div');
  screen.className = 'screen vote-screen';
  
  const game = getGame();
  if (!game) {
    navigateTo('home');
    return screen;
  }
  
  phase = 'voting';
  selectedTarget = null;
  eliminatedPlayer = null;
  
  updateVoteScreen(screen, game);
  
  return screen;
}

function updateVoteScreen(screen, game) {
  const alivePlayers = getAlivePlayers();
  
  if (phase === 'voting') {
    // Vote collectif : tout le monde discute et choisit UNE personne
    screen.innerHTML = `
      <div class="screen-header">
        <h2>🗳️ Vote collectif</h2>
        <p style="color: var(--text-secondary); text-align: center;">
          Discutez entre vous et décidez qui éliminer !
        </p>
      </div>
      
      <div class="screen-content">
        <div class="vote-list">
          ${alivePlayers.map(player => `
            <div class="vote-item ${selectedTarget === player.name ? 'selected' : ''}" 
                 data-player="${player.name}">
              <div class="player-avatar" style="background: ${getColorFromName(player.name)}">
                ${getInitial(player.name)}
              </div>
              <span class="player-name">${player.name}</span>
              ${selectedTarget === player.name ? '<span style="color: var(--color-danger);">✓</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="screen-footer">
        <button class="btn btn-danger btn-full btn-lg" id="btn-eliminate" ${!selectedTarget ? 'disabled' : ''}>
          ☠️ Éliminer ${selectedTarget || '...'}
        </button>
        <button class="btn btn-ghost btn-full" id="btn-skip">
          Personne n'est éliminé (égalité)
        </button>
      </div>
    `;
    
    setTimeout(() => {
      // Sélection du joueur
      document.querySelectorAll('.vote-item').forEach(item => {
        item.addEventListener('click', () => {
          selectedTarget = item.dataset.player;
          updateVoteScreen(screen, game);
        });
      });
      
      // Confirmer l'élimination
      document.getElementById('btn-eliminate').addEventListener('click', () => {
        if (selectedTarget) {
          phase = 'confirm';
          updateVoteScreen(screen, game);
        }
      });
      
      // Égalité - personne éliminé
      document.getElementById('btn-skip').addEventListener('click', () => {
        // Continuer sans élimination
        updateGame({ phase: 'play', currentRound: game.currentRound + 1 });
        navigateTo('play');
      });
    }, 0);
    
  } else if (phase === 'confirm') {
    // Confirmation avant d'éliminer
    screen.innerHTML = `
      <div class="screen-header">
        <h2>⚠️ Confirmation</h2>
      </div>
      
      <div class="screen-content" style="text-align: center; justify-content: center;">
        <div class="player-avatar" style="background: ${getColorFromName(selectedTarget)}; width: 80px; height: 80px; font-size: 2rem; margin: 0 auto;">
          ${getInitial(selectedTarget)}
        </div>
        <h2 style="margin-top: var(--spacing-lg);">${selectedTarget}</h2>
        <p style="color: var(--text-muted); margin-top: var(--spacing-md);">
          Êtes-vous sûrs de vouloir éliminer ce joueur ?
        </p>
      </div>
      
      <div class="screen-footer">
        <button class="btn btn-danger btn-full btn-lg" id="btn-confirm">
          ☠️ Confirmer l'élimination
        </button>
        <button class="btn btn-secondary btn-full" id="btn-cancel">
          ← Annuler
        </button>
      </div>
    `;
    
    setTimeout(() => {
      document.getElementById('btn-confirm').addEventListener('click', () => {
        eliminatedPlayer = game.players.find(p => p.name === selectedTarget);
        
        // Vérifier si c'est Mr. White AVANT d'éliminer
        if (eliminatedPlayer.role.id === 'mr_white') {
          phase = 'mr_white_guess';
          updateVoteScreen(screen, game);
          return;
        }
        
        // Éliminer le joueur
        eliminatePlayer(selectedTarget);
        phase = 'result';
        updateVoteScreen(screen, game);
      });
      
      document.getElementById('btn-cancel').addEventListener('click', () => {
        phase = 'voting';
        selectedTarget = null;
        updateVoteScreen(screen, game);
      });
    }, 0);
    
  } else if (phase === 'result') {
    // Résultat de l'élimination
    const player = eliminatedPlayer;
    
    screen.innerHTML = `
      <div class="screen-header">
        <h2>☠️ Éliminé !</h2>
      </div>
      
      <div class="screen-content" style="text-align: center; justify-content: center;">
        <div class="player-avatar" style="background: ${getColorFromName(player.name)}; width: 80px; height: 80px; font-size: 2rem; margin: 0 auto; opacity: 0.5;">
          ${getInitial(player.name)}
        </div>
        <h2 style="margin-top: var(--spacing-lg); text-decoration: line-through; opacity: 0.6;">
          ${player.name}
        </h2>
        
        <div style="margin-top: var(--spacing-xl);">
          <p style="color: var(--text-muted); margin-bottom: var(--spacing-sm);">Son rôle était...</p>
          <div class="role-badge role-badge-${player.role.id}" style="font-size: 1.25rem; padding: var(--spacing-md) var(--spacing-lg);">
            ${player.role.emoji} ${player.role.name}
          </div>
        </div>
        
        <p style="color: var(--text-muted); margin-top: var(--spacing-lg);">
          Son mot : <strong>${player.word || 'Aucun'}</strong>
        </p>
      </div>
      
      <div class="screen-footer">
        <button class="btn btn-primary btn-full btn-lg" id="btn-continue">
          Continuer →
        </button>
      </div>
    `;
    
    setTimeout(() => {
      document.getElementById('btn-continue').addEventListener('click', () => {
        // Vérifier les conditions de victoire
        const winner = checkWinCondition();
        if (winner) {
          endGame(winner);
          navigateTo('results');
          return;
        }
        
        // Continuer la partie
        updateGame({ phase: 'play', currentRound: game.currentRound + 1 });
        navigateTo('play');
      });
    }, 0);
    
  } else if (phase === 'mr_white_guess') {
    // Mr. White peut deviner le mot
    screen.innerHTML = `
      <div class="screen-header">
        <h2>⬜ Dernière chance !</h2>
      </div>
      
      <div class="screen-content" style="text-align: center;">
        <div class="emoji-display large">⬜</div>
        <h3 style="margin-bottom: var(--spacing-lg);">
          ${eliminatedPlayer.name} est Mr. White !
        </h3>
        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xl);">
          Tu as une chance de gagner : devine le mot des autres joueurs !
        </p>
        
        <input type="text" class="input" id="guess-input" 
               placeholder="Quel est le mot ?" 
               style="text-align: center; font-size: 1.25rem;"
               autocomplete="off">
      </div>
      
      <div class="screen-footer">
        <button class="btn btn-primary btn-full btn-lg" id="btn-guess">
          📝 Deviner
        </button>
        <button class="btn btn-ghost btn-full" id="btn-skip">
          Je ne sais pas...
        </button>
      </div>
    `;
    
    setTimeout(() => {
      const input = document.getElementById('guess-input');
      input.focus();
      
      const handleGuess = () => {
        const guess = input.value.trim();
        if (guess) {
          const correct = mrWhiteGuess(guess);
          if (correct) {
            navigateTo('results');
          } else {
            // Mauvaise réponse
            eliminatePlayer(eliminatedPlayer.name);
            showWrongGuess(screen, game, guess);
          }
        }
      };
      
      document.getElementById('btn-guess').addEventListener('click', handleGuess);
      
      document.getElementById('btn-skip').addEventListener('click', () => {
        eliminatePlayer(eliminatedPlayer.name);
        const winner = checkWinCondition();
        if (winner) {
          endGame(winner);
          navigateTo('results');
        } else {
          updateGame({ phase: 'play', currentRound: game.currentRound + 1 });
          navigateTo('play');
        }
      });
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGuess();
      });
    }, 0);
  }
}

function showWrongGuess(screen, game, guess) {
  screen.innerHTML = `
    <div class="screen-header">
      <h2>❌ Raté !</h2>
    </div>
    
    <div class="screen-content" style="text-align: center; justify-content: center;">
      <div class="emoji-display large">😢</div>
      <p style="color: var(--text-muted); margin-top: var(--spacing-lg);">
        "${guess}" n'était pas le bon mot.
      </p>
      <p style="color: var(--text-secondary); margin-top: var(--spacing-md);">
        Le mot était : <strong style="color: var(--color-civil);">${game.words.main}</strong>
      </p>
    </div>
    
    <div class="screen-footer">
      <button class="btn btn-primary btn-full btn-lg" id="btn-continue">
        Continuer →
      </button>
    </div>
  `;
  
  setTimeout(() => {
    document.getElementById('btn-continue').addEventListener('click', () => {
      const winner = checkWinCondition();
      if (winner) {
        endGame(winner);
        navigateTo('results');
      } else {
        updateGame({ phase: 'play', currentRound: game.currentRound + 1 });
        navigateTo('play');
      }
    });
  }, 0);
}
