/**
 * UNDERCOVER - Reveal Screen
 * Distribution secrète des rôles - SANS révéler le rôle (seulement le mot)
 */

import { navigateTo, render } from '../app.js';
import { getGame, nextReveal, updateGame } from '../game/state.js';

let isRevealed = false;

export function renderReveal() {
  const screen = document.createElement('div');
  screen.className = 'screen reveal-screen';
  
  const game = getGame();
  if (!game) {
    navigateTo('home');
    return screen;
  }
  
  const currentPlayer = game.players[game.revealIndex];
  if (!currentPlayer) {
    // Tous les joueurs ont vu leur rôle
    updateGame({ phase: 'play', currentPlayerIndex: 0 });
    navigateTo('play');
    return screen;
  }
  
  isRevealed = false;
  updateRevealScreen(screen, currentPlayer, game);
  
  return screen;
}

function updateRevealScreen(screen, player, game) {
  if (!isRevealed) {
    // Afficher "Passe le téléphone à..."
    screen.innerHTML = `
      <div class="reveal-pass">
        <div class="emoji-display large">📱</div>
        <p class="reveal-pass-title">Passe le téléphone à</p>
        <h2 class="reveal-pass-name">${player.name}</h2>
        <p style="color: var(--text-muted); margin-top: var(--spacing-lg);">
          Joueur ${game.revealIndex + 1}/${game.players.length}
        </p>
        <button class="btn btn-primary btn-lg" id="btn-reveal" style="margin-top: var(--spacing-xl);">
          👁️ Voir mon mot
        </button>
      </div>
    `;
    
    setTimeout(() => {
      document.getElementById('btn-reveal').addEventListener('click', () => {
        isRevealed = true;
        updateRevealScreen(screen, player, game);
      });
    }, 0);
  } else {
    // Afficher le mot SANS révéler le rôle
    const role = player.role;
    const isMime = role.id === 'mr_mime';
    const isMrWhite = role.id === 'mr_white';
    
    // Pour Mr. White : pas de mot
    // Pour Mr. Mime : mot + indication qu'il doit mimer
    // Pour tous les autres (Civil, Undercover) : JUSTE le mot, rien d'autre !
    
    let content = '';
    
    if (isMrWhite) {
      // Mr. White - cas spécial : il sait qu'il n'a pas de mot
      content = `
        <div class="reveal-card">
          <div class="emoji-display large">⬜</div>
          <h2 style="color: var(--color-mr-white); margin-bottom: var(--spacing-md);">Mr. White</h2>
          
          <div class="reveal-word">
            <p class="reveal-word-label">Ton mot</p>
            <p class="reveal-word-value word-hidden">Tu n'as pas de mot</p>
          </div>
          
          <p class="reveal-hint" style="margin-top: var(--spacing-lg);">
            Tu dois bluffer ! Écoute les autres et fais semblant d'avoir un mot.
            Si tu es éliminé, tu peux deviner le mot des autres pour gagner seul !
          </p>
          
          <button class="btn btn-primary btn-full btn-lg" id="btn-understood" style="margin-top: var(--spacing-lg);">
            ✓ J'ai compris
          </button>
        </div>
      `;
    } else if (isMime) {
      // Mr. Mime - cas spécial : il sait qu'il doit mimer
      content = `
        <div class="reveal-card">
          <div class="reveal-word" style="margin-bottom: var(--spacing-lg);">
            <p class="reveal-word-label">Ton mot</p>
            <p class="reveal-word-value">${player.word}</p>
          </div>
          
          <div class="role-badge role-badge-mr_mime" style="font-size: 1rem; padding: var(--spacing-md);">
            🤫 Tu dois MIMER (interdit de parler !)
          </div>
          
          <p class="reveal-hint" style="margin-top: var(--spacing-lg);">
            Tu ne peux pas parler. Mime ton indice pour faire deviner ton mot !
          </p>
          
          <button class="btn btn-primary btn-full btn-lg" id="btn-understood" style="margin-top: var(--spacing-lg);">
            ✓ J'ai compris
          </button>
        </div>
      `;
    } else {
      // Civil OU Undercover - on ne dit PAS lequel !
      // Juste le mot, sans aucune indication de rôle
      content = `
        <div class="reveal-card">
          <div class="reveal-word">
            <p class="reveal-word-label">Ton mot secret</p>
            <p class="reveal-word-value">${player.word}</p>
          </div>
          
          <p class="reveal-hint" style="margin-top: var(--spacing-xl);">
            Mémorise bien ton mot !<br>
            Tu devras donner des indices sans le révéler directement.
          </p>
          
          <button class="btn btn-primary btn-full btn-lg" id="btn-understood" style="margin-top: var(--spacing-xl);">
            ✓ J'ai compris
          </button>
        </div>
      `;
    }
    
    screen.innerHTML = content;
    
    setTimeout(() => {
      document.getElementById('btn-understood').addEventListener('click', () => {
        nextReveal();
        render(); // Re-render pour le prochain joueur
      });
    }, 0);
  }
}
