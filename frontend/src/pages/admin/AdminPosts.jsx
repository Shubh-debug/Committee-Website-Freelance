import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { formatDate, uploadErrorToMessage } from '../../lib/utils.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useConfirm } from '../../components/ConfirmModal.jsx';

const EMPTY = { title: '', excerpt: '', content: '', cover_image: '', published: false };

export default function AdminPosts() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const load = async (q = '') => {
    setLoading(true);
    try {
      setItems(await api.adminPosts(q));
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      cover_image: item.cover_image || '',
      published: Boolean(item.published),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast('Title is required.', 'error');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt,
        content: form.content,
        cover_image: form.cover_image || null,
        published: Boolean(form.published),
      };
      if (editingId) await api.updatePost(editingId, payload);
      else await api.createPost(payload);
      showToast(editingId ? 'Post updated successfully.' : 'Post created successfully.', 'success');
      setEditingId(null);
      setForm(EMPTY);
      await load(search);
    } catch (err) {
      showToast(uploadErrorToMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (item) => {
    try {
      await api.updatePost(item.id, { published: !item.published });
      await load(search);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const remove = async (item) => {
    await confirm({
      title: 'Delete Post',
      message: `Delete post "${item.title}"? This action cannot be undone.`,
      onConfirm: async () => { await api.deletePost(item.id); showToast('Post deleted successfully.', 'success'); await load(search); },
      onError: (err) => showToast(err.message, 'error'),
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-800">Posts</h1>
          <p className="mt-1 text-stone-500">Create, edit, publish and delete posts.</p>
        </div>
        <button onClick={startNew} className="btn-primary !px-5 !py-2 text-sm">
          + New Post
        </button>
      </div>

      {/* Editor */}
      <form onSubmit={handleSubmit} className="card mb-8 space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-maroon-800">
            {editingId ? '✏️ Edit Post' : '📝 New Post'}
          </h2>
          {(editingId !== null || form.title || form.content || form.cover_image) && (
            <button type="button" onClick={startNew} className="text-sm font-medium text-stone-400 hover:text-stone-600">
              Reset form
            </button>
          )}
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" />
            </div>
            <div>
              <label className="label">Excerpt (short summary)</label>
              <input className="input" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Shown on cards" />
            </div>
            <div>
              <label className="label">Content</label>
              <textarea className="input min-h-[220px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Full post content…" />
            </div>
          </div>
          <div className="space-y-5">
            <ImageUpload label="Cover Image" caption={form.title || 'Post cover'} value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} />
            <label className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-5 w-5 accent-saffron-600" />
              <span className="text-sm font-medium text-stone-700">Publish immediately</span>
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="mb-4 flex justify-end">
        <input className="input max-w-xs !rounded-full" placeholder="🔍 Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="card p-12 text-center text-stone-500">No posts found.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow ring-1 ring-black/5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-maroon-800 text-cream-100">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-saffron-50/50">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-stone-800">{p.title}</td>
                  <td className="px-4 py-3">{p.published ? <span className="badge-published">Published</span> : <span className="badge-draft">Draft</span>}</td>
                  <td className="px-4 py-3 text-stone-500">{p.author_name || '—'}</td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => startEdit(p)} className="rounded-lg bg-saffron-100 px-3 py-1.5 text-xs font-semibold text-saffron-700 hover:bg-saffron-200">Edit</button>
                      <button onClick={() => togglePublish(p)} className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200">
                        {p.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => remove(p)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">Delete</button>
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
