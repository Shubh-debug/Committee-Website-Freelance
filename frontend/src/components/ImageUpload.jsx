import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { storageUrl } from '../lib/utils.js';
import ImagePlaceholder from './ImagePlaceholder.jsx';

/**
 * ImageUpload — file picker that uploads to Supabase Storage (bucket 'images')
 * and returns the public URL via onChange. Also accepts an external URL.
 * Requires a signed-in user (storage insert policy allows authenticated).
 */
export default function ImageUpload({ value, onChange, caption = 'गणपती बाप्पा मोरया', label = 'Image' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlMode, setUrlMode] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB.');
      return;
    }
    setUploading(true);
    setError('');
    const ext = file.name.split('.').pop().toLowerCase() || 'png';
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) {
      setError(upErr.message || 'Upload failed. Check that Supabase Storage policies are applied.');
      setUploading(false);
      return;
    }
    onChange(`images/${path}`);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-3">
      <span className="label">{label}</span>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-outline !px-4 !py-2 text-sm disabled:opacity-60">
          {uploading ? 'Uploading…' : '📤 Upload Image'}
        </button>
        <button type="button" onClick={() => setUrlMode((v) => !v)} className="btn-outline !px-4 !py-2 text-sm">
          🔗 Use URL
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className="rounded-full px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
            ✕ Remove
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {urlMode && (
        <input
          className="input"
          placeholder="https://… (external image URL)"
          value={value && !value.startsWith('images/') && value.startsWith('http') ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="h-36 w-full overflow-hidden rounded-xl ring-1 ring-black/10">
        <ImagePlaceholder
          src={value}
          caption={caption}
          className="h-full w-full object-cover"
        />
      </div>
      {value && (
        <p className="truncate text-xs text-stone-400">
          {value.startsWith('images/') ? `📁 ${storageUrl(value)}` : value}
        </p>
      )}
    </div>
  );
}
