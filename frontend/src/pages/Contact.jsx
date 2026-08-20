import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Contact() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill name, email and message.');
      return;
    }
    setSending(true);
    setError('');
    // Simple mailto hand-off (wire to your own form endpoint if needed).
    const subject = encodeURIComponent(form.subject || 'Contact from website');
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:mandal@example.com?subject=${subject}&body=${body}`;
    setSending(false);
    setSent(true);
  };

  return (
    <div>
      <section className="mandala-overlay bg-maroon-800 bg-gradient-to-br from-maroon-700 to-maroon-900 py-16 text-center text-cream-100">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-cream-100/95">Questions, suggestions or volunteering — we'd love to hear from you.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div className="card p-6">
  <h2 className="font-display text-lg font-bold text-maroon-800">
    Mandal Address
  </h2>

  <p className="mt-2 text-sm text-stone-600">
    Shri Krishna Nagar, Buti Bori,
    <br />
    Nagpur - Maharashtra, 441108, India
  </p>

  <a
    href="https://www.google.com/maps/search/?api=1&query=Shri+Krishna+Nagar,+Buti+Bori,+Nagpur,+Maharashtra+441108,+India"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-maroon-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-maroon-700"
  >
    📍 Open in Maps
  </a>
</div>
         <div className="card p-6">
  <h2 className="font-display text-lg font-bold text-maroon-800">
    Connect Us
  </h2>

  <div className="mt-3 space-y-4 text-sm text-stone-600">
    <div>
      <h3 className="font-semibold text-stone-800">Mandal</h3>
      <p>
        ✉️{' '}
        <a
          href="mailto:shriganeshmitramandal24@gmail.com"
          className="hover:text-orange-600 hover:underline"
        >
          shriganeshmitramandal24@gmail.com
        </a>
      </p>
    </div>

    <div>
      <h3 className="font-semibold text-stone-800">Milind Bawane</h3>
      <p>
        📞{' '}
        <a
          href="tel:+918999502699"
          className="hover:text-orange-600 hover:underline"
        >
          +91 89995 02699
        </a>
      </p>
      <p>
        ✉️{' '}
        <a
          href="mailto:milindbawane2002@gmail.com"
          className="hover:text-orange-600 hover:underline"
        >
          milindbawane2002@gmail.com
        </a>
      </p>
    </div>

    <div>
      <h3 className="font-semibold text-stone-800">Vishal Nerlekar</h3>
      <p>
        📞{' '}
        <a
          href="tel:+919403329478"
          className="hover:text-orange-600 hover:underline"
        >
          +91 94033 29478
        </a>
      </p>
      <p>
        ✉️{' '}
        <a
          href="mailto:nerlekarvishal2002@gmail.com"
          className="hover:text-orange-600 hover:underline"
        >
          nerlekarvishal2002@gmail.com
        </a>
      </p>
    </div>
  </div>
</div>
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-maroon-800">Office Hours</h2>
              <p className="mt-2 text-sm text-stone-600">Daily 10:00 AM – 8:00 PM</p>
              <p className="text-sm text-stone-600">(Extended during Ganesh Utsav)</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            {sent ? (
              <div className="card flex flex-col items-center gap-3 p-14 text-center">
                <h2 className="font-display text-2xl font-bold text-maroon-800">Message ready!</h2>
                <p className="max-w-md text-stone-500">
                  Your email app should have opened with the message pre-filled. If not, email us
                  directly at mandal@example.com.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card space-y-5 p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      className="input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      className="input"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input
                    className="input"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea
                    className="input min-h-[160px]"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your message…"
                  />
                </div>
                {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
                <button type="submit" disabled={sending} className="btn-primary disabled:opacity-60">
                  {sending ? 'Opening email…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
