/**
 * Per-view Sentry ErrorBoundary with a friendly inline fallback — lets other
 * parts of the app keep working if a specific view (Pipeline, Tableau…)
 * crashes.
 */

import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { SentryFeature } from '../lib/sentry';

export interface ViewErrorBoundaryProps {
  feature: SentryFeature;
  viewName: string;
  children: React.ReactNode;
}

export function ViewErrorBoundary({ feature, viewName, children }: ViewErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setTag('feature', feature);
        scope.setTag('view', viewName);
      }}
      fallback={({ error, resetError, eventId }) => (
        <div className="p-6 min-h-[400px] flex items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-lg shadow-lg p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              La vue « {viewName} » a planté
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Le reste de l'application fonctionne toujours. Essaie de recharger
              cette section. L'erreur a été envoyée à Sentry.
            </p>
            {error instanceof Error && (
              <details className="mb-4 text-left text-xs text-gray-500 dark:text-gray-400">
                <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded overflow-x-auto">
                  {error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={resetError}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
              >
                <RefreshCw size={14} />
                Réessayer
              </button>
              {eventId && (
                <a
                  href={`https://sentry.io/organizations/_/issues/?query=${eventId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Voir l'erreur
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
