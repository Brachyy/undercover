/**
 * UNDERCOVER - Setup Screen
 * Configuration de la partie
 */

import { navigateTo } from '../app.js';
import { getConfig, updateConfig, updateRoleConfig } from '../game/state.js';
import { ROLES, getRecommendedUndercoverCount } from '../game/roles.js';

export function renderSetup() {
  const screen = document.createElement('div');
  screen.className = 'screen setup-screen';
  
  const config = getConfig();
  
  screen.innerHTML = `
    <div class="screen-header">
      <h2>⚙️ Configuration</h2>
      <p class="text-muted">Personnalise ta partie</p>
    </div>
    
    <div class="screen-content">
      <!-- Timer -->
      <div class="setup-section">
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-icon">⏱️</span>
            <div class="setting-text">
              <h4>Timer</h4>
              <p>Limite de temps par tour</p>
            </div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="timer-toggle" ${config.timerEnabled ? 'checked' : ''}>
            <div class="toggle-track">
              <div class="toggle-thumb"></div>
            </div>
          </label>
        </div>
        
        <div class="slider-container ${config.timerEnabled ? '' : 'hidden'}" id="timer-slider-container">
          <div class="slider-header">
            <span class="slider-label">Durée</span>
            <span class="slider-value" id="timer-value">${config.timerDuration}s</span>
          </div>
          <input type="range" class="slider" id="timer-slider" 
                 min="30" max="120" step="10" value="${config.timerDuration}">
        </div>
      </div>
      
      <!-- Rôles -->
      <div class="setup-section">
        <h3 class="setup-section-title">🎭 Rôles spéciaux</h3>
        <div class="roles-grid">
          ${renderRoleSettings(config.roles)}
        </div>
      </div>
    </div>
    
    <div class="screen-footer">
      <button class="btn btn-primary btn-full btn-lg" id="btn-next">
        Suivant →
      </button>
      <button class="btn btn-ghost btn-full" id="btn-back">
        ← Retour
      </button>
    </div>
  `;
  
  // Event listeners
  setTimeout(() => {
    // Timer toggle
    const timerToggle = document.getElementById('timer-toggle');
    const timerSliderContainer = document.getElementById('timer-slider-container');
    const timerSlider = document.getElementById('timer-slider');
    const timerValue = document.getElementById('timer-value');
    
    timerToggle.addEventListener('change', (e) => {
      updateConfig({ timerEnabled: e.target.checked });
      timerSliderContainer.classList.toggle('hidden', !e.target.checked);
    });
    
    timerSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      timerValue.textContent = `${value}s`;
      updateConfig({ timerDuration: value });
    });
    
    // Role toggles
    document.querySelectorAll('.role-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const roleId = e.target.dataset.role;
        updateRoleConfig(roleId, { enabled: e.target.checked });
        
        // Toggle count slider visibility
        const countContainer = document.getElementById(`count-${roleId}`);
        if (countContainer) {
          countContainer.classList.toggle('hidden', !e.target.checked);
        }
      });
    });
    
    // Role count sliders
    document.querySelectorAll('.role-count-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const roleId = e.target.dataset.role;
        const value = parseInt(e.target.value);
        document.getElementById(`count-value-${roleId}`).textContent = value;
        updateRoleConfig(roleId, { count: value });
      });
    });
    
    // Navigation
    document.getElementById('btn-next').addEventListener('click', () => {
      navigateTo('players');
    });
    
    document.getElementById('btn-back').addEventListener('click', () => {
      navigateTo('home');
    });
  }, 0);
  
  return screen;
}

function renderRoleSettings(rolesConfig) {
  const rolesList = [
    { id: 'undercover', ...ROLES.UNDERCOVER, hasCount: true, min: 1, max: 3 },
    { id: 'mr_white', ...ROLES.MR_WHITE, hasCount: true, min: 1, max: 2 },
    { id: 'mr_mime', ...ROLES.MR_MIME, hasCount: true, min: 1, max: 2 },
    { id: 'voyant', ...ROLES.VOYANT, hasCount: false },
    { id: 'cameleon', ...ROLES.CAMELEON, hasCount: false }
  ];
  
  return rolesList.map(role => {
    const config = rolesConfig[role.id] || { enabled: false, count: 1 };
    const isUndercover = role.id === 'undercover';
    
    return `
      <div class="card">
        <div class="setting-row" style="padding: 0; border: none; background: transparent;">
          <div class="setting-info">
            <span class="setting-icon">${role.emoji}</span>
            <div class="setting-text">
              <h4>${role.name}</h4>
              <p>${role.description}</p>
            </div>
          </div>
          ${isUndercover ? `
            <span class="role-badge role-badge-undercover">Obligatoire</span>
          ` : `
            <label class="toggle">
              <input type="checkbox" class="role-toggle" data-role="${role.id}" ${config.enabled ? 'checked' : ''}>
              <div class="toggle-track">
                <div class="toggle-thumb"></div>
              </div>
            </label>
          `}
        </div>
        
        ${role.hasCount ? `
          <div class="slider-container ${config.enabled || isUndercover ? '' : 'hidden'}" 
               id="count-${role.id}" style="margin-top: var(--spacing-md);">
            <div class="slider-header">
              <span class="slider-label">Nombre</span>
              <span class="slider-value" id="count-value-${role.id}">${config.count || 1}</span>
            </div>
            <input type="range" class="slider role-count-slider" data-role="${role.id}"
                   min="${role.min}" max="${role.max}" value="${config.count || 1}">
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}
