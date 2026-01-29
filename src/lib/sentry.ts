/**
 * Sentry configuration for error monitoring
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Only initialize if DSN is provided
  if (!dsn || dsn.trim() === '') {
    console.log('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,

    // Set sample rate for performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Set sample rate for session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      // Browser profiling
      Sentry.browserTracingIntegration(),

      // Session replay
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),

      // React error boundary
      Sentry.reactRouterV6BrowserTracingIntegration(),
    ],

    // Filter out certain errors
    beforeSend(event, hint) {
      // Don't send localStorage quota errors in development
      const error = hint.originalException;
      if (error instanceof Error) {
        if (error.message?.includes('QuotaExceededError')) {
          console.warn('LocalStorage quota exceeded');
          return null;
        }

        // Don't send network errors in development
        if (!import.meta.env.PROD && error.message?.includes('NetworkError')) {
          return null;
        }
      }

      return event;
    },

    // Add custom tags
    initialScope: {
      tags: {
        app_version: '2.0.0',
      },
    },
  });

  // Set user context (if available)
  const userProfile = localStorage.getItem('crm_user_profile');
  if (userProfile) {
    try {
      const profile = JSON.parse(userProfile);
      Sentry.setUser({
        id: profile.id,
        email: profile.email,
      });
    } catch {
      // Ignore parsing errors
    }
  }
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message manually
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Set user context
 */
export function setUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Start a new span for performance monitoring
 */
export function startSpan<T>(name: string, op: string, callback: () => T): T {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    callback
  );
}
