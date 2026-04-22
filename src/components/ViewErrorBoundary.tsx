import React, { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { reportErrorBoundary, type SentryFeature } from '../lib/sentry';

export interface ViewErrorBoundaryProps {
  feature: SentryFeature;
  viewName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class ViewErrorBoundary extends Component<ViewErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null, eventId: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in view "${this.props.viewName}":`, error, errorInfo);
    reportErrorBoundary(error, {
      feature: this.props.feature,
      view: this.props.viewName,
      extras: errorInfo as any,
    }).then((eventId) => {
      if (eventId) this.setState({ eventId });
    });
  }

  handleReset = () => this.setState({ hasError: false, error: null, eventId: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, eventId } = this.state;
    return (
      <div className="p-6 min-h-[400px] flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-lg shadow-lg p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            La vue « {this.props.viewName} » a planté
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Le reste de l'application fonctionne toujours. Essaie de recharger cette section.
            L'erreur a été envoyée à Sentry.
          </p>
          {error && (
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
              onClick={this.handleReset}
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
    );
  }
}
