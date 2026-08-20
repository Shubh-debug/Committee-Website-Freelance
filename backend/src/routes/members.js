import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;
const MAX_ADDRESS_LENGTH = 250;

// GET /api/members/me → own profile (any signed-in user)
router.get('/me', requireAuth, async (req, res) => res.json(req.profile));

// PUT /api/members/me → update own profile fields
router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, profile_image, phone, address } = req.body;
    const patch = {};
    if (typeof name === 'string' && name.trim()) patch.name = name.trim();
    if (typeof profile_image === 'string') patch.profile_image = profile_image || null;

    if (typeof phone === 'string') {
      const cleanedPhone = phone.trim();
      if (!cleanedPhone) {
        patch.phone = null;
      } else {
        if (!PHONE_RE.test(cleanedPhone)) {
          return res.status(400).json({ error: 'Invalid phone number format' });
        }
        patch.phone = cleanedPhone;
      }
    } else if (phone === null) {
      patch.phone = null;
    }

    if (typeof address === 'string') {
      const cleanedAddress = address.trim();
      if (!cleanedAddress) {
        patch.address = null;
      } else {
        if (cleanedAddress.length > MAX_ADDRESS_LENGTH) {
          return res.status(400).json({ error: `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters` });
        }
        patch.address = cleanedAddress;
      }
    } else if (address === null) {
      patch.address = null;
    }

    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nothing to update' });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(patch)
      .eq('id', req.profile.id)
      .select('id, name, email, role, profile_image, phone, address, created_at')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// GET /api/members → admin: list all members
router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, profile_image, phone, address, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// PUT /api/members/:id → admin: change role / name
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { name, role } = req.body;
    const patch = {};
    if (typeof name === 'string' && name.trim()) patch.name = name.trim();
    if (role) {
      if (!['member', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role must be member or admin' });
      }
      patch.role = role;
    }
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nothing to update' });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(patch)
      .eq('id', req.params.id)
      .select('id, name, email, role, profile_image, phone, address, created_at')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Member not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/members/:id → admin: remove member profile (+ cascades to content)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    if (req.params.id === req.profile.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).json(null);
  } catch (err) {
    return next(err);
  }
});

export default router;
