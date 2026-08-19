import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/events → public list (upcoming first, then past)
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(200);
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// GET /api/events/:id → public detail
router.get('/:id', async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Event not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// POST /api/events → admin create
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      event_date,
      event_time = '',
      location = '',
      image = null,
    } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!event_date) return res.status(400).json({ error: 'Date is required' });

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({ title: title.trim(), description, event_date, event_time, location, image })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
});

// PUT /api/events/:id → admin update
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const allowed = ['title', 'description', 'event_date', 'event_time', 'location', 'image'];
    const patch = {};
    for (const key of allowed) if (key in req.body) patch[key] = req.body[key];
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nothing to update' });

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Event not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/events/:id → admin delete
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { error } = await supabaseAdmin.from('events').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).json(null);
  } catch (err) {
    return next(err);
  }
});

export default router;
