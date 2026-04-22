import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { TagsProvider } from './contexts/TagsContext.tsx';
import { FichesProvider } from './contexts/FichesContext.tsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { initSentry } from './lib/sentry.ts';
import './index.css';

// Defer Sentry init until the browser is idle — loads 263 KB after first paint,
// not during the critical render path.
const scheduleSentryInit = () => {
  const run = () => { void initSentry(); };
  if (typeof window !== 'undefined') {
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    if (ric) ric(run, { timeout: 3000 });
    else setTimeout(run, 1500);
  }
};
scheduleSentryInit();

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TagsProvider>
            <FichesProvider>
              <ToastProvider>
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              </ToastProvider>
            </FichesProvider>
          </TagsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
