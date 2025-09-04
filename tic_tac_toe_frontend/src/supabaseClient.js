import { createClient } from '@supabase/supabase-js';
import { supabaseEnv } from './supabaseConfig';

// PUBLIC_INTERFACE
/**
 * Returns a singleton Supabase client using environment variables.
 * The env variables must be defined as:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY
 */
export function getSupabaseClient() {
  const { url, key } = supabaseEnv.getConfig();
  if (!url || !key) return null;
  // Avoid recreating client across hot reloads
  if (!window.__supabaseClient) {
    window.__supabaseClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return window.__supabaseClient;
}

// PUBLIC_INTERFACE
/**
 * Logs a completed Tic Tac Toe game to the 'games' table in Supabase.
 * The payload includes:
 * - players: ['X','O']
 * - moves: array of { index: number, player: 'X'|'O', moveNumber: number }
 * - winner: 'X' | 'O' | null
 * - result: 'win' | 'draw'
 * - finished_at: ISO timestamp
 *
 * Returns { success: boolean, error?: string }
 */
export async function logCompletedGame({ moves, winner }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase environment not configured' };
  }

  const result = winner ? 'win' : 'draw';
  const payload = {
    players: ['X', 'O'],
    moves,
    winner,
    result,
    finished_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('games').insert(payload);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e?.message || 'Unknown error' };
  }
}
