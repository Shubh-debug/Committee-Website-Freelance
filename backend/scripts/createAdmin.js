/**
 * createAdmin.js — creates (or promotes) the admin account.
 *
 * Usage:  cd backend && npm run create:admin
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env (see .env.example).
 * The password is NEVER hardcoded in the repo and NEVER placed in the
 * frontend. Uses Supabase Admin API (server-side only, service-role key).
 * Idempotent: if the user already exists (even as 'member'), it is promoted.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  console.error('✖ Missing env vars. Copy backend/.env.example → backend/.env and fill:');
  console.error('  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prettyName = email
  .split('@')[0]
  .replace(/[._-]+/g, ' ')
  .replace(/\b\w/g, (c) => c.toUpperCase());

async function findUserByEmail() {
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

try {
  let userId;

  const existing = await findUserByEmail();

  if (existing) {
    userId = existing.id;
    console.log(`✔ User ${email} already exists — keeping account, promoting to admin.`);
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: prettyName },
    });
    if (error) {
      console.error(`✖ Could not create user: ${error.message}`);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`✔ Created user ${email} (email confirmed).`);
  }

  // keep an existing display name if present
  const { data: prof } = await sb
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle();

  const { error: upsertError } = await sb.from('profiles').upsert(
    { id: userId, name: prof?.name || prettyName, email, role: 'admin' },
    { onConflict: 'id' }
  );

  if (upsertError) {
    console.error(`✖ Could not set admin role: ${upsertError.message}`);
    process.exit(1);
  }

  console.log('✔ Admin role assigned.');
  console.log('✅ Done. Log in at the site with:', email);
  console.log('   (Change the password after first login via Profile → Security).');
} catch (err) {
  console.error('✖ Unexpected error:', err.message);
  process.exit(1);
}
