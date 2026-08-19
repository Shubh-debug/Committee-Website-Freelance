import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { formatDate, uploadErrorToMessage } from '../../lib/utils.js';
import ImagePlaceholder from '../../components/ImagePlaceholder.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.listGallery());
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageUrl) return setError('Please upload or provide an image first.');
    setSaving(true);
    setError('');
    try {
      await api.createGalleryItem({ title: title.trim(), description: description.trim(), image_url: imageUrl });
      setNotice('Photo added to gallery 🙏');
      setTitle('');
      setDescription('');
      setImageUrl('');
      await load();
    } catch (err) {
      setError(uploadErrorToMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove this photo from the gallery?`)) return;
    try {
      await api.deleteGalleryItem(item.id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-maroon-800">Gallery</h1>
        <p className="mt-1 text-stone-500">Upload festival photos. Files go to Supabase Storage.</p>
      </div>

      {notice && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>}

      <form onSubmit={handleAdd} className="card mb-8 space-y-5 p-6">
        <h2 className="font-display text-lg font-bold text-maroon-800">📸 Add Photo</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div>
              <label className="label">Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Visarjan 2026" />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional caption" />
            </div>
          </div>
          <div className="space-y-5">
            <ImageUpload label="Photo *" caption="Gallery photo" value={imageUrl} onChange={setImageUrl} />
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
              {saving ? 'Saving…' : 'Add to Gallery'}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="card p-6 text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center text-stone-500">No photos yet. Add the first one above.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g) => (
            <figure key={g.id} className="group overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5">
              <ImagePlaceholder src={g.image_url} caption={g.title || 'Photo'} className="aspect-square w-full object-cover" />
              <figcaption className="space-y-1 p-3">
                <p className="truncate text-sm font-semibold text-maroon-800">{g.title || 'Untitled'}</p>
                <p className="text-xs text-stone-400">{formatDate(g.created_at)}</p>
                <button onClick={() => remove(g)} className="w-full rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">
                  🗑 Delete
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
