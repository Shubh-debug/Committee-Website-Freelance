import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useToast } from '../components/Toast.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/update-password` });
      if (error) throw error;
      setSent(true);
      showToast('If an account exists for this email address, a password reset link has been sent.', 'success');
    } catch (error) {
      const message = error.message?.toLowerCase() || '';
      showToast(message.includes('rate') ? 'Password reset emails are temporarily unavailable. Please try again later.' : 'Unable to send reset email. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return <AuthPage title="Forgot Password" subtitle="Enter your registered email address.">
    {sent ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">If an account exists for this email address, a password reset link has been sent.</div> : <form onSubmit={submit} className="space-y-5"><div><label htmlFor="recovery-email" className="label">Email</label><input id="recovery-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="input" /></div><button type="submit" disabled={loading} className="btn-primary w-full !rounded-xl">{loading ? 'Sending Reset Link…' : 'Send Reset Link'}</button></form>}
    <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-orange-600 hover:underline">Back to Login</Link>
  </AuthPage>;
}

function AuthPage({ title, subtitle, children }) {
  return <div className="mandala-overlay flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-stone-50 to-gold-50 px-4 py-12"><div className="card w-full max-w-md p-6 sm:p-8"><div className="mb-7 text-center"><h1 className="font-display text-3xl font-bold text-maroon-800">{title}</h1><p className="mt-2 text-sm text-stone-500">{subtitle}</p></div>{children}</div></div>;
}