import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PUBLIC_FIELDS =
  'id,title,excerpt,cover_image,author_id,author_name,published,created_at,updated_at';

// GET /api/posts            → published posts (public). ?search=..., ?all=1 (admin)
router.get('/', async (req, res, next) => {
  try {
    if (req.query.all === '1') {
      // admin wants everything including drafts
      return requireAdmin(req, res, async () => {
        let q = supabaseAdmin.from('posts').select('*').order('created_at', { ascending: false });
        if (req.query.search) {
          const s = `%${req.query.search}%`;
          q = q.or(`title.ilike.${s},content.ilike.${s},excerpt.ilike.${s}`);
        }
        const { data, error } = await q;
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      });
    }

    let q = supabaseAdmin
      .from('posts')
      .select(PUBLIC_FIELDS)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(100);
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      q = q.or(`title.ilike.${s},content.ilike.${s},excerpt.ilike.${s}`);
    }
    const { data, error } = await q;
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// GET /api/posts/admin/:id  → any post (draft included) — admin only
router.get('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Post not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// GET /api/posts/:id        → published detail (public)
router.get('/:id', async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', req.params.id)
      .eq('published', true)
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Post not found or not published' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// POST /api/posts           → admin create
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, content = '', excerpt = '', cover_image = null, published = false } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title: title.trim(),
        content,
        excerpt,
        cover_image,
        published,
        author_id: req.profile.id,
        author_name: req.profile.name || req.profile.email,
      })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
});

// PUT /api/posts/:id        → admin update (incl. publish/unpublish)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });

    const allowed = ['title', 'content', 'excerpt', 'cover_image', 'published'];
    const patch = {};
    for (const key of allowed) if (key in req.body) patch[key] = req.body[key];
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nothing to update' });

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Post not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/posts/:id     → admin delete
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { error } = await supabaseAdmin.from('posts').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).json(null);
  } catch (err) {
    return next(err);
  }
});

export default router;
