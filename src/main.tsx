import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import './index.css';

// PAS de Sentry - causait l'écran noir
// PAS de ErrorBoundary - peut bloquer le rendu
// Mode dark activé après le rendu

console.log('🚀 CRM Starting...');

const root = document.getElementById('root');

if (!root) {
  document.body.innerHTML = '<div style="padding: 50px; background: red; color: white;"><h1>ERROR: Root element not found!</h1></div>';
  throw new Error('Root element not found');
}

console.log('✅ Root element found');

// Activer le dark mode
document.documentElement.classList.add('dark');

console.log('✅ Dark mode enabled');

try {
  createRoot(root).render(
    <StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  document.body.innerHTML = `
    <div style="padding: 50px; background: red; color: white;">
      <h1>ERROR LOADING CRM</h1>
      <pre>${error}</pre>
      <p>Check console (F12) for details</p>
    </div>
  `;
}
