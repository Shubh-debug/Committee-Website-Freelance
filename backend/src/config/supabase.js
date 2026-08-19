import { createClient } from '@supabase/supabase-js';

/**
 * Admin (service-role) Supabase client.
 * ONLY used on the backend — bypasses RLS on purpose, which is why every
 * route that uses it MUST go through requireAdmin first (see middleware/auth.js).
 * The client never touches the browser; the key lives only in backend/.env.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const isSupabaseConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
