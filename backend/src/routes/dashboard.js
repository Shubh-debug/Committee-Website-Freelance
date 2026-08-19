import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

async function count(table, filter = null, value = true) {
  let q = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
  if (filter) q = q.eq(filter, value);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

// GET /api/dashboard/stats → admin dashboard totals
router.get('/stats', requireAdmin, async (_req, res, next) => {
  try {
    const [members, totalPosts, publishedPosts, events, totalAnnouncements, publishedAnnouncements, gallery] =
      await Promise.all([
        count('profiles'),
        count('posts'),
        count('posts', 'published', true),
        count('events'),
        count('announcements'),
        count('announcements', 'published', true),
        count('gallery'),
      ]);

    res.json({
      members,
      posts: totalPosts,
      publishedPosts,
      events,
      announcements: totalAnnouncements,
      publishedAnnouncements,
      gallery,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
