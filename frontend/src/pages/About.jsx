import { Link } from 'react-router-dom';
import Section from '../components/Section.jsx';

const VALUES = [
  { icon: 'ॐ', title: 'Devotion', text: 'At the heart of everything we do is bhakti — faith, discipline and gratitude towards Lord Ganesha.' },
  { icon: 'स', title: 'Community', text: 'A close-knit family of neighbours and friends who celebrate, serve and grow together.' },
  { icon: 'क', title: 'Culture', text: 'Preserving Marathi traditions — music, aarti, rangoli, modak and the spirit of Chaturthi.' },
  { icon: 'श', title: 'Seva', text: 'Serving the community through donations, blood camps, food drives and social initiatives.' },
];

const STATS = [
  { value: '2024', label: 'Establishment Year' },
  { value: '500+', label: 'Community Members' },
  { value: '15+', label: 'Programs per Season' },
  { value: '10+', label: 'Years of Devotion' },
];

export default function About() {
  return (
    <div>
      {/* ------------------------------------------------------------ HERO */}
      <section className="mandala-overlay bg-maroon-800 bg-gradient-to-br from-maroon-700 to-maroon-900 py-20 text-center text-cream-100">
        <div className="mx-auto max-w-3xl px-6">
          
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            About Us
          </p>
          
          <div className="mt-3 flex flex-col items-center justify-center gap-1 sm:gap-2">
            <h1 className="font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">
              श्री गणेश मित्र मंडळ
            </h1>
            <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1 text-base font-bold tracking-wide text-gold-200 shadow-sm backdrop-blur-sm sm:text-lg">
              स्थापना २०२४
            </span>
          </div>

          <p className="mt-6 text-xl font-medium tracking-wide text-cream-100/95 sm:text-2xl">
            गणपती बाप्पा मोरया! मंगलमूर्ती मोरया!
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ OUR STORY */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Logo replacing the rectangular placeholder */}
          <div className="relative flex items-center justify-center p-4 sm:p-8 lg:p-0">
            {/* Soft, warm ambient glow tailored for a light background */}
            <div className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gold-400/20 blur-[50px]" />
            
            {/* The Logo with a maroon-tinted drop shadow for depth */}
            <div className="relative z-10 w-full max-w-md drop-shadow-[0_20px_35px_rgba(131,24,67,0.15)] transition-transform duration-700 hover:scale-105">
              <img
                src="/images/ganesha.png"
                alt="श्री गणेश मित्र मंडळ - गणपती बाप्पा"
                className="mx-auto w-[85%] object-contain sm:w-[95%]"
              />
            </div>
          </div>

          {/* Text Content */}
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

      {/* ------------------------------------------------------------ VALUES */}
      <section className="bg-gradient-to-b from-gold-100 to-cream-100 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Section
            eyebrow="Values"
            title="What We Stand For"
            subtitle="आपली मूल्ये आणि विचार"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-6 text-center transition-shadow hover:shadow-lg">
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

      {/* ------------------------------------------------------------ STATS */}
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