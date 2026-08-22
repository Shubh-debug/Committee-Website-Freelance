import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your full name.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
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
      <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-stone-50 px-6">
        <div className="absolute -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-maroon-800/15 blur-[120px]"></div>
        <div className="absolute -bottom-20 -right-20 h-[600px] w-[600px] rounded-full bg-gold-500/20 blur-[120px]"></div>
        <div className="mandala-overlay-light absolute inset-0 opacity-50 mix-blend-multiply"></div>
        
        <div className="relative w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-xl">
          <span className="text-6xl">✉️</span>
          <h1 className="mt-6 font-display text-3xl font-bold text-maroon-900">Check your inbox!</h1>
          <p className="mt-4 text-stone-600">
            We sent a confirmation link to <strong className="text-stone-800">{email}</strong>. Click it to activate your
            membership, then sign in. 🙏
          </p>
          <Link to="/login" className="mt-8 inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-[0.98]">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-stone-50 p-6 lg:p-12">
      
      {/* Enhanced Ambient Background */}
      <div className="absolute -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-maroon-800/15 blur-[120px]"></div>
      <div className="absolute -bottom-20 -right-20 h-[600px] w-[600px] rounded-full bg-gold-500/20 blur-[120px]"></div>
      <div className="mandala-overlay-light absolute inset-0 opacity-50 mix-blend-multiply"></div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN: BRANDING & LOGO */}
        {/* ==================================================== */}
        <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
          
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-800 ring-1 ring-orange-500/20">
            <span>🪔</span> Welcome to the family
          </div>
          
          {/* Unified Display Font for the entire heading */}
          <h1 className="mb-4 font-display text-4xl font-extrabold text-maroon-900 sm:text-5xl lg:text-6xl lg:leading-tight">
            Join श्री गणेश मित्र मंडळ
          </h1>
          
          <p className="mb-12 max-w-md text-lg text-stone-600">
            Every new member automatically receives the <strong className="text-stone-800">member</strong> role — follow
            events, announcements, and the gallery.
          </p>

          {/* Logo - Centered beneath text, scaled up */}
          <div className="relative flex w-full justify-center lg:justify-start lg:pl-10">
            <div className="absolute h-56 w-56 animate-pulse rounded-full bg-gold-400/40 blur-3xl" />
            <img
              src="/images/ganesha.png"
              alt="Shree Ganesh Mitra Mandal"
              className="relative z-10 w-56 object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105 lg:w-64"
            />
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: THE FORM CARD */}
        {/* ==================================================== */}
        <div className="flex w-full justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            
            <div className="mb-6 text-center lg:hidden">
              <h1 className="font-display text-2xl font-bold tracking-tight text-maroon-800">Join the Mandal 🙏</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohan Deshmukh"
                  className="w-full rounded-xl border border-stone-200 bg-white/70 px-4 py-2.5 text-stone-800 transition focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-stone-200 bg-white/70 px-4 py-2.5 text-stone-800 transition focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full rounded-xl border border-stone-200 bg-white/70 px-4 py-2.5 pr-10 text-stone-800 transition focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600">Confirm <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-xl border border-stone-200 bg-white/70 px-4 py-2.5 pr-10 text-stone-800 transition focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:from-orange-600 hover:to-orange-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-60 active:scale-[0.98]"
              >
                {loading ? 'Creating account…' : 'Register as Member'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-stone-500">
              Already a member?{' '}
              <Link to="/login" className="font-bold text-orange-600 transition-colors hover:text-orange-700 hover:underline">
                Sign In
              </Link>
            </p>
            
          </div>
        </div>

      </div>
    </div>
  );
}