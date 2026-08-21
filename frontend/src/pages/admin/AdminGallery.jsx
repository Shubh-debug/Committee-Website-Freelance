import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { formatDate, uploadErrorToMessage } from '../../lib/utils.js';
import ImagePlaceholder from '../../components/ImagePlaceholder.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useConfirm } from '../../components/ConfirmModal.jsx';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.listGallery());
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageUrl) return showToast('Please upload or provide an image first.', 'error');
    setSaving(true);
    try {
      await api.createGalleryItem({ title: title.trim(), description: description.trim(), image_url: imageUrl });
      showToast('Photo added to gallery successfully.', 'success');
      setTitle('');
      setDescription('');
      setImageUrl('');
      await load();
    } catch (err) {
      showToast(uploadErrorToMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    await confirm({
      title: 'Delete Gallery Photo',
      message: 'Remove this photo from the gallery? This action cannot be undone.',
      onConfirm: async () => { await api.deleteGalleryItem(item.id); showToast('Photo deleted successfully.', 'success'); await load(); },
      onError: (err) => showToast(err.message, 'error'),
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-maroon-800">Gallery</h1>
        <p className="mt-1 text-stone-500">Upload festival photos. Files go to Supabase Storage.</p>
      </div>

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
            <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
              {saving ? 'Saving…' : 'Add to Gallery'}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <Spinner />
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
