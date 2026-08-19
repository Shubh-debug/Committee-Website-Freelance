import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PUBLIC_FIELDS = 'id,title,content,image,published,created_at,updated_at';

// GET /api/announcements → published (public). ?all=1 → admin sees drafts too
router.get('/', async (req, res, next) => {
  try {
    if (req.query.all === '1') {
      return requireAdmin(req, res, async () => {
        const { data, error } = await supabaseAdmin
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      });
    }
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select(PUBLIC_FIELDS)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// GET /api/announcements/admin/:id → any announcement, admin only
router.get('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Announcement not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// GET /api/announcements/:id → published detail (public)
router.get('/:id', async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('id', req.params.id)
      .eq('published', true)
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Announcement not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// POST /api/announcements → admin create
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, content = '', image = null, published = false } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({ title: title.trim(), content, image, published })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
});

// PUT /api/announcements/:id → admin update
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const allowed = ['title', 'content', 'image', 'published'];
    const patch = {};
    for (const key of allowed) if (key in req.body) patch[key] = req.body[key];
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nothing to update' });

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Announcement not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/announcements/:id → admin delete
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { error } = await supabaseAdmin.from('announcements').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).json(null);
  } catch (err) {
    return next(err);
  }
});

export default router;
