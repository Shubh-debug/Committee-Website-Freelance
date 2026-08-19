import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/utils.js';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import Section from '../components/Section.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    api
      .listPosts(debounced)
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <div>
      <section className="mandala-overlay bg-maroon-800 bg-gradient-to-br from-maroon-700 to-maroon-900 py-16 text-center text-cream-100">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">Blog</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">
            Posts & Stories
          </h1>
          <p className="mt-4 text-cream-100/95">Stories, reflections and updates from the Mandal.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex justify-center">
          <input
            className="input max-w-md !rounded-full"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <Spinner full />
        ) : error ? (
          <div className="card mx-auto max-w-xl p-10 text-center text-red-600">{error}</div>
        ) : posts.length === 0 ? (
          <div className="card mx-auto max-w-xl p-12 text-center">
            <h2 className="mt-3 font-display text-xl font-bold text-maroon-800">No posts found</h2>
            <p className="mt-2 text-stone-500">
              {debounced ? 'Try a different search term.' : 'Posts will appear here when published.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} to={`/posts/${p.id}`} className="card group flex flex-col overflow-hidden">
                <ImagePlaceholder
                  src={p.cover_image}
                  caption={p.title}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-medium text-stone-600">
                    {formatDate(p.created_at)} · {p.author_name}
                  </p>
                  <h2 className="mt-2 font-display text-lg font-bold text-maroon-800 group-hover:text-saffron-600">
                    {p.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-stone-500">
                    {p.excerpt || p.content}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron-600">
                    Read more
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
