import { supabaseAdmin } from '../config/supabase.js';

/**
 * Verifies the Bearer JWT (issued by Supabase Auth) and loads the caller's
 * profile from the `profiles` table. Attaches req.user + req.profile.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized — missing token' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Unauthorized — invalid token' });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, role, profile_image, phone, address, created_at')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return res.status(401).json({ error: 'Profile not found — please sign out and sign in again' });
  }

  req.user = data.user;
  req.profile = profile;
  return next();
}

/**
 * Admin-only gate. Used on every mutation route (create / edit / delete /
 * publish) so that no non-admin can ever reach the data layer, even if
 * someone crafts requests by hand.
 */
export async function requireAdmin(req, res, next) {
  try {
    await requireAuth(req, res, () => {
      if (req.profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden — admin access required' });
      }
      return next();
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
