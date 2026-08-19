import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/utils.js';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import Spinner from '../components/Spinner.jsx';

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .getPost(id)
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      {loading ? (
        <Spinner full />
      ) : error || !post ? (
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-6xl">🪔</p>
          <h1 className="mt-4 font-display text-3xl font-bold text-maroon-800">Post not found</h1>
          <p className="mt-2 text-stone-500">It may have been unpublished or removed.</p>
          <Link to="/posts" className="btn-primary mt-8">Back to Posts</Link>
        </div>
      ) : (
        <article>
          <header className="mandala-overlay bg-maroon-800 bg-gradient-to-br from-maroon-700 to-maroon-900 py-16 text-center text-cream-100">
            <div className="mx-auto max-w-4xl px-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
                {formatDate(post.created_at)} · ✍️ {post.author_name}
              </p>
              <h1 className="mt-4 font-display text-3xl font-extrabold text-gradient-gold sm:text-5xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mx-auto mt-4 max-w-2xl text-lg text-cream-100/95">{post.excerpt}</p>
              )}
            </div>
          </header>

          <div className="mx-auto max-w-4xl px-6 py-12">
            <ImagePlaceholder
              src={post.cover_image}
              caption={post.title}
              className="aspect-[16/9] w-full rounded-3xl object-cover shadow-xl ring-4 ring-gold-500/30"
            />
            <div className="mx-auto mt-10 max-w-3xl">
              <div className="prose-stone whitespace-pre-line text-lg leading-relaxed text-stone-700">
                {post.content}
              </div>
              <div className="mt-12 flex items-center justify-between border-t border-stone-200 pt-6">
                <span className="rounded-full bg-saffron-100 px-4 py-2 text-sm font-semibold text-saffron-700">
                  गणपती बाप्पा मोरया 🙏
                </span>
                <Link to="/posts" className="btn-outline !px-5 !py-2 text-sm">
                  ← All Posts
                </Link>
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
