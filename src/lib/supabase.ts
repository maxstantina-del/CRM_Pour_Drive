/**
 * Supabase configuration utilities
 */

/**
 * Check if Supabase is properly configured
 * @returns true if both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return Boolean(url && anonKey && url.trim() !== '' && anonKey.trim() !== '');
}

/**
 * Get Supabase URL from environment
 */
export function getSupabaseUrl(): string | undefined {
  return import.meta.env.VITE_SUPABASE_URL;
}

/**
 * Get Supabase anonymous key from environment
 */
export function getSupabaseAnonKey(): string | undefined {
  return import.meta.env.VITE_SUPABASE_ANON_KEY;
}

/**
 * Supabase configuration object.
 *
 * .trim() est crucial : si la env var Vercel a été collée avec un retour
 * chariot final (très facile à faire), le newline finit URL-encodé en %0A
 * dans l'apikey du WebSocket Realtime → connexion refusée avec "HTTP
 * Authentication failed". Le pipeline reste lisible (HTTP REST tolère le
 * trailing whitespace) mais aucun event live n'arrive jusqu'au client.
 */
export const supabaseConfig = {
  url: (getSupabaseUrl() || '').trim(),
  anonKey: (getSupabaseAnonKey() || '').trim(),
  isConfigured: isSupabaseConfigured()
};
