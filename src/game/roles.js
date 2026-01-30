/**
 * UNDERCOVER - Roles Definition
 * Définition de tous les rôles du jeu
 */

export const ROLES = {
  CIVIL: {
    id: 'civil',
    name: 'Civil',
    emoji: '👤',
    color: '#22c55e',
    hasWord: true,
    wordType: 'main',
    canSpeak: true,
    description: 'Tu as le mot principal. Trouve les espions !',
    team: 'civil'
  },
  UNDERCOVER: {
    id: 'undercover',
    name: 'Undercover',
    emoji: '🕵️',
    color: '#ef4444',
    hasWord: true,
    wordType: 'similar',
    canSpeak: true,
    description: 'Tu as un mot différent. Fonds-toi dans la masse !',
    team: 'undercover'
  },
  MR_WHITE: {
    id: 'mr_white',
    name: 'Mr. White',
    emoji: '⬜',
    color: '#94a3b8',
    hasWord: false,
    wordType: null,
    canSpeak: true,
    description: 'Tu n\'as pas de mot. Bluffe ! Si tu es éliminé, devine le mot pour gagner.',
    team: 'mr_white'
  },
  MR_MIME: {
    id: 'mr_mime',
    name: 'Mr. Mime',
    emoji: '🤫',
    color: '#a855f7',
    hasWord: true,
    wordType: 'main', // Peut être 'main' ou 'similar'
    canSpeak: false,
    description: 'Tu ne peux pas parler ! Mime ton indice.',
    team: 'civil' // Le mime joue avec les civils par défaut
  },
  VOYANT: {
    id: 'voyant',
    name: 'Voyant',
    emoji: '👁️',
    color: '#3b82f6',
    hasWord: true,
    wordType: 'main',
    canSpeak: true,
    description: 'Une fois par partie, tu peux voir le rôle d\'un joueur.',
    team: 'civil',
    specialAbility: 'see_role'
  },
  CAMELEON: {
    id: 'cameleon',
    name: 'Caméléon',
    emoji: '🦎',
    color: '#f59e0b',
    hasWord: true,
    wordType: 'main',
    canSpeak: true,
    description: 'Tu changes de camp au milieu de la partie !',
    team: 'civil', // Commence civil, devient undercover
    specialAbility: 'change_team'
  }
};

/**
 * Configuration par défaut des rôles optionnels
 */
export const DEFAULT_ROLE_CONFIG = {
  undercover: { enabled: true, count: 1, min: 1, max: 3 },
  mr_white: { enabled: false, count: 1, min: 0, max: 2 },
  mr_mime: { enabled: false, count: 1, min: 0, max: 2 },
  voyant: { enabled: false, count: 1, min: 0, max: 1 },
  cameleon: { enabled: false, count: 1, min: 0, max: 1 }
};

/**
 * Obtenir les infos d'un rôle par son ID
 */
export function getRoleById(roleId) {
  return Object.values(ROLES).find(r => r.id === roleId) || ROLES.CIVIL;
}

/**
 * Attribuer les rôles aux joueurs
 * @param {Array} players - Liste des noms de joueurs
 * @param {Object} roleConfig - Configuration des rôles activés
 * @param {Object} words - Les mots {main, similar}
 * @returns {Array} Liste des joueurs avec leurs rôles et mots
 */
export function assignRoles(players, roleConfig, words) {
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const assignments = [];
  let playerIndex = 0;

  // Fonction helper pour assigner un rôle
  const assignRole = (roleId, wordType) => {
    if (playerIndex >= shuffledPlayers.length) return;
    
    const role = getRoleById(roleId);
    let word = null;
    
    if (role.hasWord) {
      word = wordType === 'similar' ? words.similar : words.main;
    }
    
    assignments.push({
      name: shuffledPlayers[playerIndex],
      role: role,
      word: word,
      isEliminated: false,
      hasVoted: false,
      votedFor: null
    });
    playerIndex++;
  };

  // 1. Attribuer les Undercovers
  if (roleConfig.undercover?.enabled) {
    for (let i = 0; i < (roleConfig.undercover.count || 1); i++) {
      assignRole('undercover', 'similar');
    }
  }

  // 2. Attribuer Mr. White
  if (roleConfig.mr_white?.enabled) {
    for (let i = 0; i < (roleConfig.mr_white.count || 1); i++) {
      assignRole('mr_white', null);
    }
  }

  // 3. Attribuer Mr. Mime
  if (roleConfig.mr_mime?.enabled) {
    for (let i = 0; i < (roleConfig.mr_mime.count || 1); i++) {
      // Le mime peut être civil ou undercover selon config
      assignRole('mr_mime', 'main');
    }
  }

  // 4. Attribuer le Voyant
  if (roleConfig.voyant?.enabled) {
    assignRole('voyant', 'main');
  }

  // 5. Attribuer le Caméléon
  if (roleConfig.cameleon?.enabled) {
    assignRole('cameleon', 'main');
  }

  // 6. Le reste devient Civil
  while (playerIndex < shuffledPlayers.length) {
    assignRole('civil', 'main');
  }

  // Mélanger l'ordre final pour ne pas révéler les rôles par position
  return assignments.sort(() => Math.random() - 0.5);
}

/**
 * Calculer le nombre recommandé d'undercovers selon le nombre de joueurs
 */
export function getRecommendedUndercoverCount(playerCount) {
  if (playerCount <= 5) return 1;
  if (playerCount <= 8) return 2;
  return 3;
}
