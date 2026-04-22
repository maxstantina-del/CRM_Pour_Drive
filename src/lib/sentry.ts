/**
 * Sentry wrappers with lazy loading — the @sentry/react bundle (≈263 KB) is
 * only downloaded when one of these helpers is actually called. initSentry()
 * is meant to be deferred until after first paint (see main.tsx).
 */

type SentryModule = typeof import('@sentry/react');

let sentryPromise: Promise<SentryModule> | null = null;
let initialized = false;

function loadSentry(): Promise<SentryModule> {
  if (!sentryPromise) {
    sentryPromise = import('@sentry/react');
  }
  return sentryPromise;
}

export async function initSentry(): Promise<void> {
  if (initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || dsn.trim() === '') {
    console.log('Sentry DSN not configured, skipping initialization');
    return;
  }
  const Sentry = await loadSentry();
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracePropagationTargets: [
      'localhost',
      /^\//,
      /^https:\/\/gudmtivemddhnhhfilvc\.supabase\.co/,
    ],
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error instanceof Error) {
        if (error.message?.includes('QuotaExceededError')) {
          console.warn('LocalStorage quota exceeded');
          return null;
        }
        if (!import.meta.env.PROD && error.message?.includes('NetworkError')) {
          return null;
        }
      }
      return event;
    },
    initialScope: {
      tags: {
        app_version: '2.0.0',
      },
    },
  });
  initialized = true;

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

export type SentryFeature =
  | 'import'
  | 'bulk-action'
  | 'pipeline-drag'
  | 'lead-crud'
  | 'tag-management'
  | 'ai-chat'
  | 'auth'
  | 'activity'
  | 'dashboard'
  | 'settings';

export function captureException(error: Error, context?: Record<string, any>): void {
  loadSentry().then((Sentry) => {
    Sentry.captureException(error, { extra: context });
  });
}

export function captureFeatureException(
  feature: SentryFeature,
  error: unknown,
  context?: Record<string, any>
): void {
  loadSentry().then((Sentry) => {
    Sentry.withScope((scope) => {
      scope.setTag('feature', feature);
      if (context) scope.setExtras(context);
      Sentry.captureException(error);
    });
  });
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  loadSentry().then((Sentry) => {
    Sentry.captureMessage(message, level);
  });
}

export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
): void {
  loadSentry().then((Sentry) => {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  });
}

export function setUser(userId: string, email?: string): void {
  loadSentry().then((Sentry) => {
    Sentry.setUser({ id: userId, email });
  });
}

export function clearUser(): void {
  loadSentry().then((Sentry) => {
    Sentry.setUser(null);
  });
}

/**
 * Report a captured React error with context tags (used by error boundaries).
 * Returns the Sentry event ID once available, or null if Sentry isn't loaded
 * yet (fire-and-forget).
 */
export function reportErrorBoundary(
  error: Error,
  context: {
    feature?: SentryFeature;
    view?: string;
    extras?: Record<string, any>;
  }
): Promise<string | null> {
  return loadSentry().then((Sentry) => {
    let eventId: string | null = null;
    Sentry.withScope((scope) => {
      if (context.feature) scope.setTag('feature', context.feature);
      if (context.view) scope.setTag('view', context.view);
      if (context.extras) scope.setExtras(context.extras);
      eventId = Sentry.captureException(error) as string;
    });
    return eventId;
  });
}

/**
 * Open Sentry's user feedback dialog for a given event. Does nothing if the
 * Sentry module hasn't loaded yet (shouldn't happen since we only show the
 * button after we already have an eventId).
 */
export function showReportDialog(eventId: string): void {
  loadSentry().then((Sentry) => {
    Sentry.showReportDialog({ eventId });
  });
}
