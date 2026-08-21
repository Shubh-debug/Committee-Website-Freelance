import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { currentYearStartValue, formatCurrency, formatDate, todayInputValue } from '../../lib/utils.js';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useConfirm } from '../../components/ConfirmModal.jsx';

const FUNDS_YEARS = Array.from({ length: 11 }, (_, index) => 2025 + index);
const currentYear = new Date().getFullYear();
const EMPTY = { contribution_date: '', name: '', amount: '', type: 'people' };

export default function AdminFunds() {
  const [year, setYear] = useState(Math.min(Math.max(currentYear, 2025), 2035));
  const [overview, setOverview] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [initialBalance, setInitialBalance] = useState('');
  const [open, setOpen] = useState({ people: true, mandal_member: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const today = todayInputValue();
  const minDate = currentYearStartValue();
  const canMutate = year >= 2026 && year <= currentYear;

  const load = async () => {
    setLoading(true);
    try {
      const [nextOverview, nextItems, settings] = await Promise.all([
        api.financeOverview(year),
        api.contributions(year),
        api.financeSettings(),
      ]);
      setOverview(nextOverview);
      setItems(nextItems);
      setInitialBalance(settings?.initial_closing_balance ?? '');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [year]);

  const reset = () => { setEditingId(null); setForm(EMPTY); };

  const submitSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.updateFinanceSettings({ initial_closing_balance: initialBalance });
      showToast('2025 closing balance saved successfully.', 'success');
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const validateForm = () => {
    if (!canMutate) return `Contributions cannot be added for ${year}. Select the current year.`;
    if (!form.contribution_date) return 'Contribution date is required.';
    if (form.contribution_date.slice(0, 4) !== String(year)) return 'Date must belong to the selected year.';
    if (form.contribution_date > today) return 'Future dates cannot be used.';
    if (!form.name.trim()) return 'Name is required.';
    return '';
  };

  const submitContribution = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) return showToast(validationError, 'error');
    setSaving(true);
    try {
      const payload = { ...form, selected_year: year, name: form.name.trim() };
      if (editingId) await api.updateContribution(editingId, payload);
      else await api.createContribution(payload);
      showToast(editingId ? 'Contribution updated successfully.' : 'Contribution added successfully.', 'success');
      reset();
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
    setForm({ contribution_date: item.contribution_date, name: item.name, amount: item.amount, type: item.type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (item) => {
    await confirm({
      title: 'Delete Contribution',
      message: `Are you sure you want to delete the contribution from "${item.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        await api.deleteContribution(item.id);
        showToast('Contribution deleted successfully.', 'success');
        await load();
      },
      onError: (err) => showToast(err.message, 'error'),
    });
  };

  const rowsFor = (type) => items.filter((item) => item.type === type);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-3xl font-bold text-maroon-800">Funds</h1><p className="mt-1 text-stone-500">Manage contributions and yearly opening balances.</p></div>
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-600">Year
          <select className="input !w-auto" value={year} onChange={(event) => { reset(); setYear(Number(event.target.value)); }}>{FUNDS_YEARS.map((option) => <option key={option}>{option}</option>)}</select>
        </label>
      </div>
      {loading ? <Spinner full /> : (
        <>
          {!overview?.initialized && <form onSubmit={submitSettings} className="card mb-6 p-6"><h2 className="font-display text-lg font-bold text-maroon-800">Initialize financial system</h2><p className="mt-1 text-sm text-stone-500">Enter the 2025 closing balance once. Later years roll forward automatically.</p><div className="mt-4 flex flex-wrap items-end gap-3"><div><label className="label">2025 Closing Balance *</label><input className="input" type="number" min="0" step="0.01" value={initialBalance} onChange={(event) => setInitialBalance(event.target.value)} placeholder="10000" /></div><button disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving…' : 'Initialize'}</button></div></form>}
          {year > currentYear && <p className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">{year} is view-only. Contributions can be added after that year begins.</p>}
          {year === 2025 && <p className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">2025 is the initial baseline year. Transactions begin in 2026.</p>}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Summary label="Opening Balance" value={overview.openingBalance} /><Summary label="BY PEOPLE" value={overview.peopleContributions} /><Summary label="BY MANDAL MEMBERS" value={overview.mandalMemberContributions} /><Summary label="Total Funds" value={overview.totalFunds} /></div>
          <form onSubmit={submitContribution} className="card mb-8 space-y-4 p-6"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold text-maroon-800">{editingId ? 'Edit Contribution' : 'Add Contribution'}</h2>{editingId && <button type="button" onClick={reset} className="text-sm text-stone-400">Reset</button>}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><label className="label">Date *</label><input required disabled={!canMutate} min={minDate} max={today} type="date" className="input disabled:cursor-not-allowed disabled:bg-stone-100" value={form.contribution_date} onChange={(event) => setForm({ ...form, contribution_date: event.target.value })} /></div><div><label className="label">Name *</label><input required disabled={!canMutate} className="input disabled:cursor-not-allowed disabled:bg-stone-100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div><div><label className="label">Amount *</label><input required disabled={!canMutate} min="0.01" step="0.01" type="number" className="input disabled:cursor-not-allowed disabled:bg-stone-100" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></div><div><label className="label">Category *</label><select disabled={!canMutate} className="input disabled:cursor-not-allowed disabled:bg-stone-100" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="people">People</option><option value="mandal_member">Mandal Members</option></select></div></div><button disabled={saving || !canMutate} className="btn-primary disabled:opacity-60">{saving ? 'Saving…' : editingId ? 'Update Contribution' : 'Add Contribution'}</button></form>
          <ContributionSection title="Contribution from People" open={open.people} onToggle={() => setOpen({ ...open, people: !open.people })} rows={rowsFor('people')} onEdit={edit} onDelete={remove} />
          <ContributionSection title="Contribution from Mandal Members" open={open.mandal_member} onToggle={() => setOpen({ ...open, mandal_member: !open.mandal_member })} rows={rowsFor('mandal_member')} onEdit={edit} onDelete={remove} />
        </>
      )}
    </div>
  );
}

function Summary({ label, value }) { return <div className="card p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">{label}</p><p className="mt-2 break-words font-sans text-2xl font-bold leading-tight tabular-nums text-maroon-800">{formatCurrency(value)}</p></div>; }
function ContributionSection({ title, open, onToggle, rows, onEdit, onDelete }) { return <section className="mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><button type="button" onClick={onToggle} className="flex w-full items-center justify-between bg-maroon-800 px-5 py-4 text-left font-display text-lg font-bold text-cream-100"><span>{title}</span><span>{open ? '▲' : '▼'}</span></button>{open && (rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-stone-50 text-stone-600"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-stone-100">{rows.map((item) => <tr key={item.id} className="hover:bg-saffron-50/50"><td className="px-4 py-3">{formatDate(item.contribution_date)}</td><td className="px-4 py-3 font-medium">{item.name}</td><td className="px-4 py-3">{formatCurrency(item.amount)}</td><td className="px-4 py-3 text-right"><button disabled={!onEdit} onClick={() => onEdit(item)} className="mr-2 rounded-lg bg-saffron-100 px-3 py-1.5 text-xs font-semibold text-saffron-700 disabled:opacity-50">Edit</button><button onClick={() => onDelete(item)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">Delete</button></td></tr>)}</tbody></table></div> : <p className="p-8 text-center text-sm text-stone-500">No contributions for this year.</p>)}</section>; }