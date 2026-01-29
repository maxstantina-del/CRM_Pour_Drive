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
 * Supabase configuration object
 */
export const supabaseConfig = {
  url: getSupabaseUrl() || '',
  anonKey: getSupabaseAnonKey() || '',
  isConfigured: isSupabaseConfigured()
};
