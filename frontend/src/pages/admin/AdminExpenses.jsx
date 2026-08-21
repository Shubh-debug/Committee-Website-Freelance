import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { currentYearStartValue, formatCurrency, formatDate, todayInputValue } from '../../lib/utils.js';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useConfirm } from '../../components/ConfirmModal.jsx';

const EXPENSE_YEARS = Array.from({ length: 10 }, (_, index) => 2026 + index);
const currentYear = new Date().getFullYear();
const EMPTY = { expense_date: '', purpose: '', amount: '' };

export default function AdminExpenses() {
  const [year, setYear] = useState(Math.min(Math.max(currentYear, 2026), 2035));
  const [overview, setOverview] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const today = todayInputValue();
  const minDate = currentYearStartValue();
  const canMutate = year === currentYear;

  const load = async () => {
    setLoading(true);
    try {
      const [nextOverview, nextItems] = await Promise.all([api.financeOverview(year), api.expenses(year)]);
      setOverview(nextOverview);
      setItems(nextItems);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [year]);

  const validateForm = () => {
    if (!canMutate) return `Expenses cannot be added for ${year}. Select the current year.`;
    if (!form.expense_date) return 'Expense date is required.';
    if (form.expense_date.slice(0, 4) !== String(year)) return 'Date must belong to the selected year.';
    if (form.expense_date > today) return 'Future dates cannot be used.';
    if (!form.purpose.trim()) return 'Purpose is required.';
    return '';
  };

  const submit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) return showToast(validationError, 'error');
    setSaving(true);
    try {
      const payload = { ...form, selected_year: year, purpose: form.purpose.trim() };
      if (editingId) await api.updateExpense(editingId, payload);
      else await api.createExpense(payload);
      showToast(editingId ? 'Expense updated successfully.' : 'Expense added successfully.', 'success');
      setEditingId(null);
      setForm(EMPTY);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const edit = (item) => {
    if (!canMutate) return showToast('Only the current year can be edited.', 'info');
    setEditingId(item.id);
    setForm({ expense_date: item.expense_date, purpose: item.purpose, amount: item.amount });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (item) => {
    await confirm({
      title: 'Delete Expense',
      message: `Are you sure you want to delete "${item.purpose}"? This action cannot be undone.`,
      detail: formatCurrency(item.amount),
      onConfirm: async () => {
        await api.deleteExpense(item.id);
        showToast('Expense deleted successfully.', 'success');
        await load();
      },
      onError: (err) => showToast(err.message, 'error'),
    });
  };

  return <div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-3xl font-bold text-maroon-800">Expenses</h1><p className="mt-1 text-stone-500">Track spending and calculated running balances.</p></div><label className="flex items-center gap-2 text-sm font-semibold text-stone-600">Year<select className="input !w-auto" value={year} onChange={(event) => { setEditingId(null); setForm(EMPTY); setYear(Number(event.target.value)); }}>{EXPENSE_YEARS.map((option) => <option key={option}>{option}</option>)}</select></label></div>
    {loading ? <Spinner full /> : !overview?.initialized ? <div className="empty-state"><h2 className="font-display text-xl font-bold text-maroon-800">Financial system needs initialization</h2><p className="mt-2 text-sm text-stone-500">Set the 2025 closing balance on the Funds page before recording expenses.</p></div> : <>
      {year !== currentYear && <p className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">{year} is view-only. Expenses can be added after that year begins.</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><Summary label="Total Funds" value={overview.totalFunds} /><Summary label="Total Expenses" value={overview.totalExpenses} /><Summary label="Current Balance" value={overview.currentBalance} /></div>
      <form onSubmit={submit} className="card mb-8 space-y-4 p-6"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold text-maroon-800">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }} className="text-sm text-stone-400">Reset</button>}</div><div className="grid gap-4 sm:grid-cols-3"><div><label className="label">Date *</label><input required disabled={!canMutate} min={minDate} max={today} type="date" className="input disabled:cursor-not-allowed disabled:bg-stone-100" value={form.expense_date} onChange={(event) => setForm({ ...form, expense_date: event.target.value })} /></div><div><label className="label">Purpose *</label><input required disabled={!canMutate} className="input disabled:cursor-not-allowed disabled:bg-stone-100" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} /></div><div><label className="label">Amount *</label><input required disabled={!canMutate} min="0.01" step="0.01" type="number" className="input disabled:cursor-not-allowed disabled:bg-stone-100" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></div></div><button disabled={saving || !canMutate} className="btn-primary disabled:opacity-60">{saving ? 'Saving…' : editingId ? 'Update Expense' : 'Add Expense'}</button></form>
      {items.length === 0 ? <div className="empty-state">No expenses for {year}.</div> : <div className="overflow-x-auto rounded-2xl bg-white shadow ring-1 ring-black/5"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-maroon-800 text-cream-100"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Purpose</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-stone-100">{items.map((item) => <tr key={item.id} className="hover:bg-saffron-50/50"><td className="px-4 py-3 text-stone-500">{formatDate(item.expense_date)}</td><td className="px-4 py-3 font-medium">{item.purpose}</td><td className="px-4 py-3">{formatCurrency(item.amount)}</td><td className="px-4 py-3 font-semibold text-maroon-800">{formatCurrency(item.balance)}</td><td className="px-4 py-3 text-right"><button onClick={() => edit(item)} className="mr-2 rounded-lg bg-saffron-100 px-3 py-1.5 text-xs font-semibold text-saffron-700">Edit</button><button onClick={() => remove(item)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">Delete</button></td></tr>)}</tbody></table></div>}
    </>}
  </div>;
}

function Summary({ label, value }) { return <div className="card p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">{label}</p><p className="mt-2 break-words font-sans text-2xl font-bold leading-tight tabular-nums text-maroon-800">{formatCurrency(value)}</p></div>; }