/**
 * UNDERCOVER - Home Screen
 * Écran d'accueil
 */

import { navigateTo } from '../app.js';
import { hasActiveGame, resetGame } from '../game/state.js';

export function renderHome() {
  const screen = document.createElement('div');
  screen.className = 'screen home-screen';
  
  const hasGame = hasActiveGame();
  
  screen.innerHTML = `
    <div class="home-logo">
      <div class="emoji-display">🕵️</div>
      <h1 class="home-title">UNDERCOVER</h1>
      <p class="home-subtitle">Qui est l'espion parmi vous ?</p>
    </div>
    
    <div class="home-actions">
      ${hasGame ? `
        <button class="btn btn-primary btn-full btn-lg" id="btn-resume">
          ▶️ Reprendre la partie
        </button>
        <button class="btn btn-secondary btn-full" id="btn-new">
          🆕 Nouvelle partie
        </button>
      ` : `
        <button class="btn btn-primary btn-full btn-lg" id="btn-new">
          🎮 Nouvelle partie
        </button>
      `}
      <button class="btn btn-ghost btn-full" id="btn-rules">
        📖 Règles du jeu
      </button>
    </div>
  `;
  
  // Event listeners
  setTimeout(() => {
    const btnResume = document.getElementById('btn-resume');
    const btnNew = document.getElementById('btn-new');
    const btnRules = document.getElementById('btn-rules');
    
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        navigateTo('play');
      });
    }
    
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        resetGame();
        navigateTo('setup');
      });
    }
    
    if (btnRules) {
      btnRules.addEventListener('click', () => {
        showRulesModal();
      });
    }
  }, 0);
  
  return screen;
}

function showRulesModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>📖 Règles du jeu</h2>
      </div>
      <div class="modal-body rules-content">
        <h3>🎯 But du jeu</h3>
        <p>Les <strong>Civils</strong> doivent trouver les <strong>Undercovers</strong> (espions) parmi eux. Les Undercovers doivent survivre sans se faire repérer.</p>
        
        <h3>🎮 Déroulement</h3>
        <ul>
          <li>Chaque joueur reçoit secrètement un mot</li>
          <li>Les Civils ont le <em>même mot</em></li>
          <li>Les Undercovers ont un <em>mot similaire</em></li>
          <li>À tour de rôle, donnez un indice d'<strong>un seul mot</strong></li>
          <li>Après un tour, votez pour éliminer un suspect</li>
        </ul>
        
        <h3>🎭 Les rôles</h3>
        <div class="rules-role">
          <span class="rules-role-emoji">👤</span>
          <div class="rules-role-info">
            <div class="rules-role-name">Civil</div>
            <div class="rules-role-desc">A le mot principal, doit trouver les espions</div>
          </div>
        </div>
        <div class="rules-role">
          <span class="rules-role-emoji">🕵️</span>
          <div class="rules-role-info">
            <div class="rules-role-name">Undercover</div>
            <div class="rules-role-desc">A un mot différent, doit se cacher</div>
          </div>
        </div>
        <div class="rules-role">
          <span class="rules-role-emoji">⬜</span>
          <div class="rules-role-info">
            <div class="rules-role-name">Mr. White</div>
            <div class="rules-role-desc">N'a pas de mot, doit bluffer. Peut deviner le mot s'il est éliminé.</div>
          </div>
        </div>
        <div class="rules-role">
          <span class="rules-role-emoji">🤫</span>
          <div class="rules-role-info">
            <div class="rules-role-name">Mr. Mime</div>
            <div class="rules-role-desc">Ne peut pas parler, doit mimer son indice</div>
          </div>
        </div>
        
        <h3>🏆 Victoire</h3>
        <ul>
          <li><strong>Civils</strong> : Tous les Undercovers éliminés</li>
          <li><strong>Undercovers</strong> : Égalité ou supériorité numérique</li>
          <li><strong>Mr. White</strong> : Devine le mot des Civils</li>
        </ul>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary btn-full" id="btn-close-rules">
          J'ai compris !
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('btn-close-rules').addEventListener('click', () => {
    overlay.remove();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}
