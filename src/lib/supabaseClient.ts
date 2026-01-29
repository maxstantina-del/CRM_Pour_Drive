/**
 * Supabase client initialization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './supabase';

/**
 * Supabase client instance
 * Only initialized if Supabase is properly configured
 */
export const supabase: SupabaseClient | null = supabaseConfig.isConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Check if Supabase client is available
 */
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}

/**
 * Get Supabase client (throws if not configured)
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }
  return supabase;
}
