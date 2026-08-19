import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { formatDate, uploadErrorToMessage } from '../../lib/utils.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import Spinner from '../../components/Spinner.jsx';

const EMPTY = { title: '', description: '', event_date: '', event_time: '', location: '', image: '' };

export default function AdminEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.listEvents());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      event_date: item.event_date || '',
      event_time: item.event_time || '',
      location: item.location || '',
      image: item.image || '',
    });
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required.');
    if (!form.event_date) return setError('Date is required.');
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        event_date: form.event_date,
        event_time: form.event_time,
        location: form.location,
        image: form.image || null,
      };
      if (editingId) await api.updateEvent(editingId, payload);
      else await api.createEvent(payload);
      setNotice(editingId ? 'Event updated 🙏' : 'Event created 🙏');
      setEditingId(null);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(uploadErrorToMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete event "${item.title}"?`)) return;
    try {
      await api.deleteEvent(item.id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-800">Events</h1>
          <p className="mt-1 text-stone-500">Manage festival events and programs.</p>
        </div>
        <button onClick={startNew} className="btn-primary !px-5 !py-2 text-sm">+ New Event</button>
      </div>

      {notice && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>}

      <form onSubmit={handleSubmit} className="card mb-8 space-y-5 p-6">
        <h2 className="font-display text-lg font-bold text-maroon-800">{editingId ? '✏️ Edit Event' : '🗓️ New Event'}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ganesh sthapana puja" />
          </div>
          <div>
            <label className="label">Date *</label>
            <input type="date" className="input" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Event details…" />
          </div>
          <div>
            <label className="label">Time</label>
            <input className="input" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} placeholder="e.g. 6:00 PM" />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Mandal Mandap, Mumbai" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <ImageUpload label="Event Image" caption={form.title || 'Event'} value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
          </div>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving…' : editingId ? 'Update Event' : 'Create Event'}
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="card p-6 text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center text-stone-500">No events yet. Create your first event above.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow ring-1 ring-black/5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-maroon-800 text-cream-100">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((ev) => (
                <tr key={ev.id} className="hover:bg-saffron-50/50">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-stone-800">{ev.title}</td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(ev.event_date)}</td>
                  <td className="px-4 py-3 text-stone-500">{ev.event_time || '—'}</td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-stone-500">{ev.location || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => startEdit(ev)} className="rounded-lg bg-saffron-100 px-3 py-1.5 text-xs font-semibold text-saffron-700 hover:bg-saffron-200">Edit</button>
                      <button onClick={() => remove(ev)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
