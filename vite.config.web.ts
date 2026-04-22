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
    proxy: {
      // Proxy /api/* vers la prod pour que useAI fonctionne en dev local
      '/api': {
        target: 'https://crm-pour-drive.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react', 'better-sqlite3', 'electron'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer-motion-vendor': ['framer-motion'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'qrcode.react', 'canvas-confetti'],
          'recharts-vendor': ['recharts'],
          'xlsx-vendor': ['xlsx'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'sentry-vendor': ['@sentry/react'],
        }
      }
    }
  },
});
