import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
            <span>🪔</span> Welcome back
          </div>

          <h1 className="mb-4 font-display text-4xl font-extrabold text-maroon-900 sm:text-5xl lg:text-6xl lg:leading-tight">
            Sign in to the Mandal
          </h1>
          
          <p className="mb-12 max-w-md text-lg text-stone-600">
            Access your profile, upcoming events, and community updates.
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
              <h1 className="font-display text-2xl font-bold tracking-tight text-maroon-800">Member Login 🙏</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600">Email <span className="text-red-500">*</span></label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-stone-800 transition focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-200 bg-white/70 px-4 py-3 pr-10 text-stone-800 transition focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link to="/forgot-password" className="text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:from-orange-600 hover:to-orange-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-60 active:scale-[0.98]"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-stone-500">
              New to the Mandal?{' '}
              <Link to="/register" className="font-bold text-orange-600 transition-colors hover:text-orange-700 hover:underline">
                Register as Member
              </Link>
            </p>
            
          </div>
        </div>

      </div>
    </div>
  );
}