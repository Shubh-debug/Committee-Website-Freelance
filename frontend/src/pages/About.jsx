import { Link } from 'react-router-dom';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import Section from '../components/Section.jsx';

const VALUES = [
  { icon: 'ॐ', title: 'Devotion', text: 'At the heart of everything we do is bhakti — faith, discipline and gratitude towards Lord Ganesha.' },
  { icon: 'स', title: 'Community', text: 'A close-knit family of neighbours and friends who celebrate, serve and grow together.' },
  { icon: 'क', title: 'Culture', text: 'Preserving Marathi traditions — music, aarti, rangoli, modak and the spirit of Chaturthi.' },
  { icon: 'श', title: 'Seva', text: 'Serving the community through donations, blood camps, food drives and social initiatives.' },
];

const STATS = [
  { value: '2026', label: 'Celebration Year' },
  { value: '500+', label: 'Community Members' },
  { value: '15+', label: 'Programs per Season' },
  { value: '10+', label: 'Years of Devotion' },
];

export default function About() {
  return (
    <div>
      <section className="mandala-overlay bg-maroon-800 bg-gradient-to-br from-maroon-700 to-maroon-900 py-20 text-center text-cream-100">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">About Us</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">
            श्री गणेश मित्र मंडळ 2026
          </h1>
          <p className="mt-4 text-lg text-cream-100/95">गणपती बाप्पा मोरया! मंगलमूर्ती मोरया!</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full border-2 border-dashed border-gold-500/50" />
            <ImagePlaceholder
              src=""
              caption="आमचा मित्र मंडळ"
              variant="default"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl ring-4 ring-gold-500/40"
              alt="Mandal group photo placeholder"
            />
          </div>
          <div>
            <Section align="left" eyebrow="Our Story" title="A Legacy of Togetherness" />
            <div className="-mt-4 space-y-4 text-stone-600">
              <p>
                Starting as a small group of devoted neighbours, <strong>श्री गणेश मित्र मंडळ</strong>{' '}
                has grown into a beloved community institution. Every Ganesh Chaturthi, we come
                together to install and worship Lord Ganesha with the grandeur and warmth our
                tradition deserves.
              </p>
              <p>
                Our celebration is a blend of the classic and the contemporary — traditional puja
                and aarti, soulful bhajans, exciting competitions for children, community feasts of
                modak, and evenings filled with music and laughter. But beyond the festival, the
                Mandal stands for <em>seva</em>: helping those in need and keeping our bond strong
                all year round.
              </p>
              <p>
                We invite every family in our locality to join us. Whether you want to volunteer,
                contribute, or simply pray together, there is a place for you here.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">Become a Member</Link>
              <Link to="/events" className="btn-outline">Our Events</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-gold-100 to-cream-100 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Section
            eyebrow="Values"
            title="What We Stand For"
            subtitle="आपली मूल्ये आणि विचार"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-6 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-saffron-100 text-3xl ring-2 ring-gold-500/40">
                  {v.icon}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-maroon-800">{v.title}</h3>
                <p className="mt-2 text-sm text-stone-500">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl bg-maroon-800 p-8 text-center text-cream-100 shadow-lg">
              <p className="font-display text-4xl font-extrabold text-gradient-gold">{s.value}</p>
              <p className="mt-2 text-sm text-cream-200/80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
