import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';

export default function Register() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your full name.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      // If email confirmation is enabled, session is null until verified.
      const {
        data: { session },
      } = await import('../lib/supabase.js').then((m) => m.supabase.auth.getSession());
      if (session) {
        navigate('/', { replace: true });
      } else {
        setNeedsConfirmation(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation || (user && !user.email_confirmed_at)) {
    return (
      <div className="mandala-overlay flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-maroon-700 to-deep px-6 py-16">
        <div className="card max-w-lg p-10 text-center">
          <span className="text-6xl">✉️</span>
          <h1 className="mt-4 font-display text-2xl font-bold text-maroon-800">Check your inbox!</h1>
          <p className="mt-3 text-stone-500">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
            membership, then sign in. 🙏
          </p>
          <Link to="/login" className="btn-primary mt-6">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mandala-overlay relative min-h-[calc(100vh-72px)] bg-gradient-to-br from-maroon-700 via-maroon-800 to-deep py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 lg:grid-cols-2">
        <div className="hidden text-cream-100 lg:block">
          <p className="inline-flex items-center gap-2 rounded-full bg-cream-100/10 px-4 py-1.5 text-sm text-gold-200 ring-1 ring-gold-500/40">
            🪔 Welcome to the family
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-gradient-gold">
            Join श्री गणेश मित्र मंडळ 2026
          </h1>
          <p className="mt-4 max-w-md text-cream-100/95">
            Every new member automatically receives the <strong>member</strong> role — follow
            events, announcements and the community gallery.
          </p>
          <div className="mt-8 max-w-sm">
            <ImagePlaceholder src="" caption="स्वागत आहे 🙏" variant="saffron" className="aspect-square w-full rounded-3xl object-cover ring-4 ring-gold-500/40" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5 p-8 shadow-lg sm:p-10">
          <div className="text-center lg:hidden">
            <h1 className="font-display text-2xl font-bold tracking-tight text-maroon-800">Join the Mandal 🙏</h1>
          </div>
          <div>
            <label className="label">Full Name</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan Deshmukh" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
            </div>
          </div>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Creating account…' : 'Register as Member 🙏'}
          </button>
          <p className="text-center text-sm text-stone-500">
            Already a member?{' '}
            <Link to="/login" className="font-semibold text-saffron-600 underline-offset-4 hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
