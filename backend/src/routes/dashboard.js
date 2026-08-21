import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import { calculateOverview } from '../services/finance.js';

const router = Router();

async function count(table, filter = null, value = true) {
  let q = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
  if (filter) q = q.eq(filter, value);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

async function financialOverview(year) {
  const [settingsResult, contributionsResult, expensesResult] = await Promise.all([
    supabaseAdmin.from('financial_settings').select('*').eq('id', true).maybeSingle(),
    supabaseAdmin.from('financial_contributions').select('contribution_date,amount,type'),
    supabaseAdmin.from('financial_expenses').select('expense_date,amount'),
  ]);
  const error = settingsResult.error || contributionsResult.error || expensesResult.error;
  if (error) throw error;
  return calculateOverview({
    settings: settingsResult.data,
    contributions: contributionsResult.data || [],
    expenses: expensesResult.data || [],
    year,
  });
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

    const finances = await financialOverview(new Date().getFullYear());
    res.json({
      members,
      posts: totalPosts,
      publishedPosts,
      events,
      announcements: totalAnnouncements,
      publishedAnnouncements,
      gallery,
      financialInitialized: finances.initialized,
      totalFunds: finances.initialized ? finances.totalFunds : null,
      totalExpenses: finances.initialized ? finances.totalExpenses : null,
      currentBalance: finances.initialized ? finances.currentBalance : null,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
