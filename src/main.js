/**
 * UNDERCOVER - Main Entry Point
 */

import './styles/index.css';
import './styles/components.css';
import './styles/screens.css';
import { initApp } from './app.js';

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
