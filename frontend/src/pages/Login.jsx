import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mandala-overlay relative min-h-[calc(100vh-72px)] bg-gradient-to-br from-maroon-700 via-maroon-800 to-deep py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 lg:grid-cols-2">
        <div className="hidden text-cream-100 lg:block">
          <p className="inline-flex items-center gap-2 rounded-full bg-cream-100/10 px-4 py-1.5 text-sm text-gold-200 ring-1 ring-gold-500/40">
            🪔 Welcome back
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-gradient-gold">
            Sign in to the Mandal
          </h1>
          <p className="mt-4 max-w-md text-cream-100/95">
            Access your profile, upcoming events and community updates.
          </p>
          <div className="mt-8 max-w-sm">
            <ImagePlaceholder src="" caption="गणपती बाप्पा मोरया" variant="gold" className="aspect-square w-full rounded-3xl object-cover ring-4 ring-gold-500/40" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5 p-8 shadow-lg sm:p-10">
          <div className="text-center lg:hidden">
            <h1 className="font-display text-2xl font-bold tracking-tight text-maroon-800">Member Login 🙏</h1>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required className="input" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In 🙏'}
          </button>
          <p className="text-center text-sm text-stone-500">
            New to the Mandal?{' '}
            <Link to="/register" className="font-semibold text-saffron-600 underline-offset-4 hover:underline">
              Register as Member
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
