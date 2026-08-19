import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { placeholder } from '../lib/placeholder.js';
import { formatDate, eventDayLabel, timeAgo } from '../lib/utils.js';
import { useAuth } from '../context/AuthContext.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import Section from '../components/Section.jsx';
import Spinner from '../components/Spinner.jsx';

function Diya({ className = '' }) {
  return (
    <svg viewBox="0 0 60 40" className={className} fill="none">
      <path d="M8 30h44l-6 8H14l-6-8z" fill="#C2410C" />
      <path d="M18 30c0-9 24-9 24 0H18z" fill="#F97316" />
      <path d="M30 6c4 5 8 8 8 14" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="30" cy="21" rx="4" ry="6" fill="#FDE68A" />
    </svg>
  );
}

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.listEvents(),
      api.listAnnouncements(),
      api.listPosts(),
      api.listGallery(),
    ]).then(([e, a, p, g]) => {
      const ok = (r) => (r.status === 'fulfilled' ? r.value : []);
      setEvents(ok(e));
      setAnnouncements(ok(a).slice(0, 3));
      setPosts(ok(p).slice(0, 3));
      setGallery(ok(g).slice(0, 6));
      setLoading(false);
    });
  }, []);

  const upcoming = [...events]
    .filter((ev) => new Date(`${ev.event_date}T23:59:59`) >= new Date())
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 3);
  const heroEventsEmpty = upcoming.length === 0;

  return (
    <div>
      {/* ------------------------------------------------------------ HERO */}
      <section className="mandala-overlay relative overflow-hidden bg-maroon-800 bg-gradient-to-br from-maroon-700 via-maroon-800 to-deep text-cream-100">
        <div className="pointer-events-none absolute inset-0">
          <Diya className="anim-float absolute left-[6%] top-[14%] w-16 opacity-80" />
          <Diya className="anim-float absolute right-[8%] top-[20%] w-12 opacity-70" style={{ animationDelay: '0.7s' }} />
          <Diya className="anim-float absolute bottom-[16%] left-[12%] w-10 opacity-60" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-24 text-center lg:flex-row lg:py-28 lg:text-left">
          <div className="flex-1">
            <p className="anim-fade-up mb-4 inline-flex items-center gap-2 rounded-full bg-cream-100/10 px-4 py-1.5 text-sm font-medium text-gold-200 ring-1 ring-gold-500/40">
              आमचा गणेशोत्सव · 2026
            </p>
            <h1 className="anim-fade-up delay-100 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient-gold">श्री गणेश मित्र मंडळ</span>
              <span className="mt-2 block text-3xl text-cream-100 sm:text-4xl lg:text-5xl">2026</span>
            </h1>
            <p className="anim-fade-up delay-200 mt-4 text-2xl font-semibold text-saffron-300 sm:text-3xl">
              गणपती बाप्पा मोरया!
            </p>
            <p className="anim-fade-up delay-300 mx-auto mt-5 max-w-xl text-cream-100/95 lg:mx-0">
              Ministering to our community with devotion, tradition and celebration — join us for
              the most divine festival of the year.
            </p>
            <div className="anim-fade-up delay-400 mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link to="/events" className="btn-gold">View Events</Link>
              <Link to="/gallery" className="btn-outline-light">Gallery</Link>
              {user ? (
                <Link to={isAdmin ? '/admin' : '/profile'} className="btn-primary">
                  {isAdmin ? 'Admin Dashboard' : 'My Profile'}
                </Link>
              ) : (
                <Link to="/register" className="btn-primary">Login / Join</Link>
              )}
            </div>
          </div>

          {/* Hero image / Ganesha idol placeholder */}
          <div className="relative w-full max-w-md flex-1">
            <div className="anim-spin-slow absolute -inset-6 rounded-full border-2 border-dashed border-gold-500/40" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl ring-4 ring-gold-500/50">
              <ImagePlaceholder
                src=""
                caption="गणपती बाप्पा मोरया"
                variant="gold"
                className="aspect-[4/5] w-full object-cover"
                alt="Lord Ganesha idol — placeholder"
              />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-6 py-2 text-sm font-bold text-maroon-800 shadow-lg">
              शुभ गणेश चतुर्थी
            </div>
          </div>
        </div>

        <div className="relative border-t border-cream-100/10 bg-deep/40 py-3 text-center text-sm tracking-wide text-gold-200/80">
          धूमधडाक्यात साजरा करूया उत्सव — सप्टेंबर 2026
        </div>
      </section>

      {/* --------------------------------------------------- UPCOMING EVENTS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Section
          eyebrow="Events"
          title="Upcoming Events"
          subtitle="Mark your calendars — पुढील कार्यक्रम"
        />
        {loading ? (
          <Spinner />
        ) : heroEventsEmpty ? (
          <div className="empty-state flex max-w-xl flex-col items-center gap-3 p-12 text-center">
            <h3 className="text-xl font-bold text-maroon-800">No upcoming events yet</h3>
            <p className="text-stone-500">Events will appear here as the admin publishes them.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {upcoming.map((ev) => (
              <Link key={ev.id} to="/events" className="card group overflow-hidden">
                <ImagePlaceholder
                  src={ev.image}
                  caption={ev.title}
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-5">
                  <span className="badge-published">{eventDayLabel(ev.event_date)}</span>
                  <h3 className="mt-3 font-display text-lg font-bold text-maroon-800 group-hover:text-saffron-600">
                    {ev.title}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatDate(ev.event_date)} · {ev.event_time || '—'} · {ev.location || '—'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/events" className="btn-outline">All Events</Link>
        </div>
      </section>

      {/* --------------------------------------------------- ANNOUNCEMENTS */}
      <section className="mandala-overlay-light bg-maroon-800 bg-gradient-to-b from-maroon-800 to-maroon-900 py-20 text-cream-100">
        <div className="mx-auto max-w-7xl px-6">
          <Section
            eyebrow="Announcements"
            title="Latest Announcements"
            subtitle="घोषणा — महत्त्वाच्या बातम्या"
            theme="light"
          />
          {loading ? (
            <Spinner />
          ) : announcements.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-cream-100/20 bg-cream-100/5 p-10 text-center ring-1 ring-cream-100/10">
              <p className="mt-3 text-cream-100/90">No announcements yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {announcements.map((a) => (
                <Link key={a.id} to="/announcements" className="group rounded-2xl bg-cream-100/5 p-6 ring-1 ring-cream-100/10 transition hover:bg-cream-100/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">
                    {timeAgo(a.created_at)}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-bold text-gold-200 group-hover:text-saffron-300">
                    {a.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-cream-100/90">{a.content}</p>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link to="/announcements" className="btn-outline-light">All Announcements</Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- RECENT POSTS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Section
          eyebrow="Blog"
          title="Recent Posts"
          subtitle="लेख — आमच्या अनुभवांचा ठेवा"
        />
        {loading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <div className="empty-state max-w-xl">
            <p className="mt-3 text-stone-500">No posts published yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} to={`/posts/${p.id}`} className="card group overflow-hidden">
                <ImagePlaceholder
                  src={p.cover_image}
                  caption={p.title}
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-5">
                  <p className="text-xs text-stone-400">{formatDate(p.created_at)} · {p.author_name}</p>
                  <h3 className="mt-2 font-display text-lg font-bold text-maroon-800 group-hover:text-saffron-600">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-stone-500">{p.excerpt || p.content}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/posts" className="btn-outline">All Posts</Link>
        </div>
      </section>

      {/* --------------------------------------------------- GALLERY PREVIEW */}
      <section className="bg-gradient-to-b from-gold-100 to-cream-100 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Section
            eyebrow="Gallery"
            title="Gallery Highlights"
            subtitle="फोटो गॅलरी — उत्सवाचे क्षण"
          />
          {loading ? (
            <Spinner />
          ) : gallery.length === 0 ? (
            <div className="empty-state max-w-xl">
              <p className="mt-3 text-stone-500">Photos will appear here soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {gallery.map((g) => (
                <Link key={g.id} to="/gallery" className="group overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5">
                  <ImagePlaceholder
                    src={g.image_url}
                    caption={g.title || 'Gallery photo'}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------- CTA */}
      <section className="mandala-overlay mx-auto max-w-5xl px-6 py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-saffron-500 to-maroon-700 p-10 text-center text-white shadow-2xl sm:p-14">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Join the Mandal Family
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream-100/90">
            Become a member to stay connected with events, announcements and the community.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={user ? '/profile' : '/register'} className="rounded-full bg-white px-8 py-3 font-semibold text-maroon-700 shadow-lg transition hover:-translate-y-0.5">
              {user ? 'My Profile' : 'Join Now - Free'}
            </Link>
            <Link to="/contact" className="rounded-full border-2 border-white/70 px-8 py-3 font-semibold text-white transition hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
