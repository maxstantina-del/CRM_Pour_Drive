import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration pour le développement web (sans Electron)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5179,
    strictPort: true, // Force le port 5179, erreur si déjà utilisé
    open: false, // Le script batch ouvre le navigateur
  },
  optimizeDeps: {
    exclude: ['lucide-react', 'better-sqlite3', 'electron'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
