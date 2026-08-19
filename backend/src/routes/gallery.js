import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/gallery → public list (newest first)
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(120);
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// POST /api/gallery → admin upload record (file itself goes to Supabase Storage)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title = '', description = '', image_url } = req.body;
    if (!image_url) return res.status(400).json({ error: 'image_url is required' });

    const { data, error } = await supabaseAdmin
      .from('gallery')
      .insert({ title, description, image_url, uploaded_by: req.profile.id })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/gallery/:id → admin delete (removes the row; storage file can be
// cleaned via Supabase Dashboard or the storage delete policy)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { error } = await supabaseAdmin.from('gallery').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).json(null);
  } catch (err) {
    return next(err);
  }
});

export default router;
