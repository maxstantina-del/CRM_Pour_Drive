import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration pour le développement web (sans Electron)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    strictPort: false, // Permet d'utiliser un port alternatif si 5173 est occupé
    open: false, // Le script batch ouvre déjà le navigateur
  },
  optimizeDeps: {
    exclude: ['lucide-react', 'better-sqlite3', 'electron'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'framer-motion'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'xlsx-vendor': ['xlsx'],
          'ui-vendor': ['lucide-react', 'qrcode.react', 'canvas-confetti']
        }
      }
    }
  },
});
