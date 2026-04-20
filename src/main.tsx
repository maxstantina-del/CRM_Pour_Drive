import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { initSentry } from './lib/sentry.ts';
import './index.css';

initSentry();

document.documentElement.classList.add('dark');

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
