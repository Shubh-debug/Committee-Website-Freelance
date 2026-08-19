import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { formatDate, uploadErrorToMessage } from '../../lib/utils.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import Spinner from '../../components/Spinner.jsx';

const EMPTY = { title: '', content: '', image: '', published: false };

export default function AdminAnnouncements() {
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
      setItems(await api.adminAnnouncements());
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
    setForm({ title: item.title || '', content: item.content || '', image: item.image || '', published: Boolean(item.published) });
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
    setSaving(true);
    setError('');
    try {
      const payload = { title: form.title.trim(), content: form.content, image: form.image || null, published: Boolean(form.published) };
      if (editingId) await api.updateAnnouncement(editingId, payload);
      else await api.createAnnouncement(payload);
      setNotice(editingId ? 'Announcement updated 🙏' : 'Announcement created 🙏');
      setEditingId(null);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(uploadErrorToMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (item) => {
    try {
      await api.updateAnnouncement(item.id, { published: !item.published });
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete announcement "${item.title}"?`)) return;
    try {
      await api.deleteAnnouncement(item.id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-800">Announcements</h1>
          <p className="mt-1 text-stone-500">Share news and notices with members.</p>
        </div>
        <button onClick={startNew} className="btn-primary !px-5 !py-2 text-sm">+ New Announcement</button>
      </div>

      {notice && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>}

      <form onSubmit={handleSubmit} className="card mb-8 space-y-5 p-6">
        <h2 className="font-display text-lg font-bold text-maroon-800">{editingId ? '✏️ Edit Announcement' : '📣 New Announcement'}</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
            </div>
            <div>
              <label className="label">Content</label>
              <textarea className="input min-h-[140px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Announcement details…" />
            </div>
          </div>
          <div className="space-y-5">
            <ImageUpload label="Notice Image" caption={form.title || 'Announcement'} value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
            <label className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-5 w-5 accent-saffron-600" />
              <span className="text-sm font-medium text-stone-700">Publish immediately</span>
            </label>
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Update Announcement' : 'Create Announcement'}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="card p-6 text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center text-stone-500">No announcements yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow ring-1 ring-black/5">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-maroon-800 text-cream-100">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-saffron-50/50">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-stone-800">{a.title}</td>
                  <td className="px-4 py-3">{a.published ? <span className="badge-published">Published</span> : <span className="badge-draft">Draft</span>}</td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(a.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => startEdit(a)} className="rounded-lg bg-saffron-100 px-3 py-1.5 text-xs font-semibold text-saffron-700 hover:bg-saffron-200">Edit</button>
                      <button onClick={() => togglePublish(a)} className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200">
                        {a.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => remove(a)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">Delete</button>
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
