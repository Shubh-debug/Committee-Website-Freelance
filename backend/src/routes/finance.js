import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  addRunningBalances,
  amountToCents,
  calculateOverview,
  nonNegativeAmountToCents,
  sorted,
  validateTransactionDate,
  validateId,
  validateYear,
} from '../services/finance.js';

const router = Router();
const CONTRIBUTION_FIELDS = 'id,contribution_date,name,amount,type,created_at,updated_at';
const EXPENSE_FIELDS = 'id,expense_date,purpose,amount,created_at,updated_at';

function fail(res, error) {
  let message = error.message || 'Invalid financial request';
  if (message.includes('Insufficient balance')) message = 'Insufficient balance. Please reduce the expense amount.';
  if (message.includes('financial_expenses_expense_date_check') || message.includes('financial_contributions_contribution_date_check')) {
    message = 'Financial transactions begin in 2026.';
  }
  return res.status(400).json({ error: message });
}

async function loadLedger() {
  const [settingsResult, contributionsResult, expensesResult] = await Promise.all([
    supabaseAdmin.from('financial_settings').select('*').eq('id', true).maybeSingle(),
    supabaseAdmin.from('financial_contributions').select(CONTRIBUTION_FIELDS),
    supabaseAdmin.from('financial_expenses').select(EXPENSE_FIELDS),
  ]);
  const failure = settingsResult.error || contributionsResult.error || expensesResult.error;
  if (failure) throw failure;
  return {
    settings: settingsResult.data,
    contributions: contributionsResult.data || [],
    expenses: expensesResult.data || [],
  };
}

router.get('/overview', requireAdmin, async (req, res, next) => {
  try {
    const year = validateYear(req.query.year || new Date().getFullYear());
    const ledger = await loadLedger();
    return res.json(calculateOverview({ ...ledger, year }));
  } catch (error) {
    if (error.message.startsWith('Invalid financial year')) return fail(res, error);
    return next(error);
  }
});

router.get('/settings', requireAdmin, async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('financial_settings').select('*').eq('id', true).maybeSingle();
    if (error) return next(error);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.put('/settings', requireAdmin, async (req, res, next) => {
  try {
    const balance = nonNegativeAmountToCents(req.body.initial_closing_balance, '2025 closing balance') / 100;
    const { data, error } = await supabaseAdmin
      .from('financial_settings')
      .upsert({ id: true, initial_year: 2025, initial_closing_balance: balance }, { onConflict: 'id' })
      .select()
      .single();
    if (error) return fail(res, error);
    return res.json(data);
  } catch (error) {
    if (error.message.includes('closing balance')) return fail(res, error);
    return next(error);
  }
});

router.get('/contributions', requireAdmin, async (req, res, next) => {
  try {
    const year = validateYear(req.query.year || new Date().getFullYear());
    const { data, error } = await supabaseAdmin
      .from('financial_contributions')
      .select(CONTRIBUTION_FIELDS)
      .gte('contribution_date', `${year}-01-01`)
      .lte('contribution_date', `${year}-12-31`);
    if (error) return next(error);
    return res.json(sorted(data || [], 'contribution_date'));
  } catch (error) {
    if (error.message.startsWith('Invalid financial year')) return fail(res, error);
    return next(error);
  }
});

router.post('/contributions', requireAdmin, async (req, res, next) => {
  try {
    const { contribution_date, name, type, selected_year } = req.body;
    const amount = amountToCents(req.body.amount) / 100;
    validateTransactionDate(contribution_date, 'Contribution date', selected_year);
    if (typeof name !== 'string' || !name.trim()) throw new Error('Name is required');
    if (!['people', 'mandal_member'].includes(type)) throw new Error('Contribution type is invalid');
    const { data, error } = await supabaseAdmin
      .from('financial_contributions')
      .insert({ contribution_date, name: name.trim(), amount, type })
      .select(CONTRIBUTION_FIELDS)
      .single();
    if (error) return fail(res, error);
    return res.status(201).json(data);
  } catch (error) {
    return fail(res, error);
  }
});

router.put('/contributions/:id', requireAdmin, async (req, res, next) => {
  try {
    validateId(req.params.id);
    const patch = {};
    if (!('contribution_date' in req.body)) throw new Error('Contribution date is required');
    patch.contribution_date = validateTransactionDate(req.body.contribution_date, 'Contribution date', req.body.selected_year);
    if ('name' in req.body) {
      if (typeof req.body.name !== 'string' || !req.body.name.trim()) throw new Error('Name is required');
      patch.name = req.body.name.trim();
    }
    if ('amount' in req.body) patch.amount = amountToCents(req.body.amount) / 100;
    if ('type' in req.body) {
      if (!['people', 'mandal_member'].includes(req.body.type)) throw new Error('Contribution type is invalid');
      patch.type = req.body.type;
    }
    if (!Object.keys(patch).length) throw new Error('Nothing to update');
    const { data, error } = await supabaseAdmin
      .from('financial_contributions')
      .update(patch)
      .eq('id', req.params.id)
      .select(CONTRIBUTION_FIELDS)
      .maybeSingle();
    if (error) return fail(res, error);
    if (!data) return res.status(404).json({ error: 'Contribution not found' });
    return res.json(data);
  } catch (error) {
    return fail(res, error);
  }
});

router.delete('/contributions/:id', requireAdmin, async (req, res, next) => {
  try {
    validateId(req.params.id);
    const { error } = await supabaseAdmin.from('financial_contributions').delete().eq('id', req.params.id);
    if (error) return fail(res, error);
    return res.status(204).json(null);
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/expenses', requireAdmin, async (req, res, next) => {
  try {
    const year = validateYear(req.query.year || new Date().getFullYear());
    const ledger = await loadLedger();
    const overview = calculateOverview({ ...ledger, year });
    const rows = ledger.expenses.filter((row) => String(row.expense_date).slice(0, 4) === String(year));
    return res.json(addRunningBalances(rows, overview.totalFunds));
  } catch (error) {
    if (error.message.startsWith('Invalid financial year')) return fail(res, error);
    return next(error);
  }
});

router.post('/expenses', requireAdmin, async (req, res, next) => {
  try {
    const { expense_date, purpose, selected_year } = req.body;
    const amount = amountToCents(req.body.amount) / 100;
    validateTransactionDate(expense_date, 'Expense date', selected_year);
    if (typeof purpose !== 'string' || !purpose.trim()) throw new Error('Purpose is required');
    const { data, error } = await supabaseAdmin
      .from('financial_expenses')
      .insert({ expense_date, purpose: purpose.trim(), amount })
      .select(EXPENSE_FIELDS)
      .single();
    if (error) return fail(res, error);
    return res.status(201).json(data);
  } catch (error) {
    return fail(res, error);
  }
});

router.put('/expenses/:id', requireAdmin, async (req, res, next) => {
  try {
    validateId(req.params.id);
    const patch = {};
    if (!('expense_date' in req.body)) throw new Error('Expense date is required');
    patch.expense_date = validateTransactionDate(req.body.expense_date, 'Expense date', req.body.selected_year);
    if ('purpose' in req.body) {
      if (typeof req.body.purpose !== 'string' || !req.body.purpose.trim()) throw new Error('Purpose is required');
      patch.purpose = req.body.purpose.trim();
    }
    if ('amount' in req.body) patch.amount = amountToCents(req.body.amount) / 100;
    if (!Object.keys(patch).length) throw new Error('Nothing to update');
    const { data, error } = await supabaseAdmin
      .from('financial_expenses')
      .update(patch)
      .eq('id', req.params.id)
      .select(EXPENSE_FIELDS)
      .maybeSingle();
    if (error) return fail(res, error);
    if (!data) return res.status(404).json({ error: 'Expense not found' });
    return res.json(data);
  } catch (error) {
    return fail(res, error);
  }
});

router.delete('/expenses/:id', requireAdmin, async (req, res, next) => {
  try {
    validateId(req.params.id);
    const { error } = await supabaseAdmin.from('financial_expenses').delete().eq('id', req.params.id);
    if (error) return fail(res, error);
    return res.status(204).json(null);
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
