import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import './index.css';

// PAS de Sentry
// PAS de ErrorBoundary
// PAS de dark mode

// Test sans dark mode
document.documentElement.classList.remove('dark');
document.body.style.background = 'white';
document.body.style.color = 'black';

console.log('🚀 main-simple.tsx chargé !');

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found!');
  }

  console.log('✅ Root trouvé, création de React root...');

  createRoot(root).render(
    <StrictMode>
      <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
        <h1 style={{ color: 'green' }}>✅ React Fonctionne !</h1>
        <p style={{ color: 'black' }}>Si vous voyez ceci, React se charge correctement.</p>
        <ToastProvider>
          <App />
        </ToastProvider>
      </div>
    </StrictMode>
  );

  console.log('✅ React render() appelé');
} catch (error) {
  console.error('❌ Erreur:', error);
  document.body.innerHTML = `
    <div style="padding: 50px; background: red; color: white;">
      <h1>ERREUR DÉTECTÉE</h1>
      <pre>${error}</pre>
    </div>
  `;
}
