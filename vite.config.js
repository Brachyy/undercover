import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/undercover/',  // Important pour GitHub Pages
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
