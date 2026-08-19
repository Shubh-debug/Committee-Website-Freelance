import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { formatDateTime } from '../lib/utils.js';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import Section from '../components/Section.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listAnnouncements()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="mandala-overlay bg-maroon-800 bg-gradient-to-br from-maroon-700 to-maroon-900 py-16 text-center text-cream-100">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">Updates</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">
            Announcements
          </h1>
          <p className="mt-4 text-cream-100/95">Important news and notices from the Mandal.</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        {loading ? (
          <Spinner full />
        ) : error ? (
          <div className="card mx-auto max-w-xl p-10 text-center text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="card mx-auto max-w-xl p-12 text-center">
            <h2 className="mt-3 font-display text-xl font-bold text-maroon-800">No announcements</h2>
            <p className="mt-2 text-stone-500">Announcements will appear here when published.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {items.map((a, idx) => (
              <article key={a.id} className="card anim-fade-up overflow-hidden" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
                  {a.image && (
                    <ImagePlaceholder
                      src={a.image}
                      caption={a.title}
                      className="h-32 w-full rounded-xl object-cover sm:w-48"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <span className="badge-published">Official</span>
                      <time className="text-xs text-stone-400">{formatDateTime(a.created_at)}</time>
                    </div>
                    <h2 className="mt-2 font-display text-xl font-bold text-maroon-800">{a.title}</h2>
                    {a.content && (
                      <p className="mt-3 whitespace-pre-line text-stone-600">{a.content}</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
