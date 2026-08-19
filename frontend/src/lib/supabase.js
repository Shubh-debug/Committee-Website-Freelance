import { createClient } from '@supabase/supabase-js';

/**
 * Public client — anon key only. All write/delete operations are blocked by
 * RLS (see supabase/migrations/001_initial_schema.sql); content management
 * goes through the Express API which enforces admin role server-side.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — copy frontend/.env.example to frontend/.env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SITE_NAME = 'श्री गणेश मित्र मंडळ';
export const TAGLINE = 'गणपती बाप्पा मोरया! 🙏';
