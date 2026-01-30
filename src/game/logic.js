/**
 * UNDERCOVER - Game Logic
 * Logique du jeu et utilitaires
 */

import { getGame, getState } from './state.js';

/**
 * Obtenir les joueurs encore en vie
 */
export function getAlivePlayers() {
  const game = getGame();
  if (!game) return [];
  return game.players.filter(p => !p.isEliminated);
}

/**
 * Obtenir le joueur actuel
 */
export function getCurrentPlayer() {
  const game = getGame();
  if (!game) return null;
  return game.players[game.currentPlayerIndex];
}

/**
 * Obtenir le joueur à révéler (phase reveal)
 */
export function getPlayerToReveal() {
  const game = getGame();
  if (!game || game.phase !== 'reveal') return null;
  return game.players[game.revealIndex];
}

/**
 * Vérifier si tous les joueurs ont voté
 */
export function allPlayersVoted() {
  const game = getGame();
  if (!game) return false;
  
  const alivePlayers = game.players.filter(p => !p.isEliminated);
  return alivePlayers.every(p => p.hasVoted);
}

/**
 * Obtenir le prochain votant
 */
export function getNextVoter() {
  const game = getGame();
  if (!game) return null;
  
  const alivePlayers = game.players.filter(p => !p.isEliminated);
  return alivePlayers.find(p => !p.hasVoted);
}

/**
 * Calculer le nombre minimum de joueurs requis
 */
export function getMinimumPlayers(roleConfig) {
  let minimum = 4; // Base minimum
  
  // Ajouter les rôles activés
  if (roleConfig.undercover?.enabled) {
    minimum = Math.max(minimum, (roleConfig.undercover.count || 1) + 3);
  }
  if (roleConfig.mr_white?.enabled) {
    minimum = Math.max(minimum, minimum + (roleConfig.mr_white.count || 1));
  }
  if (roleConfig.mr_mime?.enabled) {
    minimum = Math.max(minimum, minimum + (roleConfig.mr_mime.count || 1));
  }
  
  return minimum;
}

/**
 * Valider la configuration avant de démarrer
 */
export function validateGameSetup() {
  const state = getState();
  const playerCount = state.playerNames.length;
  const roleConfig = state.config.roles;
  
  const errors = [];
  
  // Minimum 4 joueurs
  if (playerCount < 4) {
    errors.push('Il faut au moins 4 joueurs');
  }
  
  // Calculer le nombre de rôles spéciaux
  let specialRolesCount = 0;
  if (roleConfig.undercover?.enabled) {
    specialRolesCount += roleConfig.undercover.count || 1;
  }
  if (roleConfig.mr_white?.enabled) {
    specialRolesCount += roleConfig.mr_white.count || 1;
  }
  if (roleConfig.mr_mime?.enabled) {
    specialRolesCount += roleConfig.mr_mime.count || 1;
  }
  if (roleConfig.voyant?.enabled) {
    specialRolesCount += 1;
  }
  if (roleConfig.cameleon?.enabled) {
    specialRolesCount += 1;
  }
  
  // Il doit rester au moins 2 civils
  if (specialRolesCount >= playerCount - 1) {
    errors.push('Trop de rôles spéciaux pour le nombre de joueurs');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Formater le temps en MM:SS
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Mélanger un tableau (Fisher-Yates)
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Obtenir l'initiale d'un nom
 */
export function getInitial(name) {
  return name.charAt(0).toUpperCase();
}

/**
 * Générer une couleur à partir d'un nom
 */
export function getColorFromName(name) {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
