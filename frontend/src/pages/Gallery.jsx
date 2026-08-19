import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { formatDate, storageUrl } from '../lib/utils.js';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import Section from '../components/Section.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    api
      .listGallery()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="mandala-overlay bg-maroon-800 bg-gradient-to-br from-maroon-700 to-maroon-900 py-16 text-center text-cream-100">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">Gallery</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">
            Photo Gallery
          </h1>
          <p className="mt-4 text-cream-100/95">Memories from our festivals and celebrations.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {loading ? (
          <Spinner full />
        ) : error ? (
          <div className="card mx-auto max-w-xl p-10 text-center text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="card mx-auto max-w-xl p-12 text-center">
            <h2 className="mt-3 font-display text-xl font-bold text-maroon-800">Gallery is empty</h2>
            <p className="mt-2 text-stone-500">Photos will appear here soon!</p>
          </div>
        ) : (
          <>
            <Section
              subtitle={`${items.length} photo${items.length > 1 ? 's' : ''} · उत्सवाचे सुंदर क्षण`}
            />
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {items.map((g, idx) => (
                <button
                  key={g.id}
                  onClick={() => setOpenIndex(idx)}
                  className="group mb-5 block w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 transition hover:shadow-2xl"
                >
                  <ImagePlaceholder
                    src={g.image_url}
                    caption={g.title || 'Gallery photo'}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    imgClassName=""
                  />
                  <div className="bg-white p-4 text-left">
                    <p className="font-semibold text-maroon-800">{g.title || 'Untitled'}</p>
                    {g.description && <p className="text-sm text-stone-500">{g.description}</p>}
                    <p className="mt-1 text-xs text-stone-400">{formatDate(g.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Lightbox */}
      {openIndex !== null && items[openIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={() => setOpenIndex(null)}
        >
          <button
            className="absolute right-5 top-5 rounded-full bg-white/15 px-4 py-2 text-white transition hover:bg-white/30"
            onClick={() => setOpenIndex(null)}
          >
            ✕ Close
          </button>
          <figure className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={storageUrl(items[openIndex].image_url)}
              alt={items[openIndex].title || 'Gallery photo'}
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
            <figcaption className="mt-4 text-center text-cream-100">
              <p className="font-semibold">{items[openIndex].title || 'Untitled'}</p>
              {items[openIndex].description && (
                <p className="text-sm text-cream-200/75">{items[openIndex].description}</p>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
