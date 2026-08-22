import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase.js';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { recoverySession } = useAuth();
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [values, setValues] = useState({ next: '', confirm: '' });
  const [visible, setVisible] = useState({ next: false, confirm: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => { if (active) { setSession(currentSession); setChecking(false); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => { if (active) { setSession(currentSession); setChecking(false); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (values.next.length < 8) return showToast('Password must be at least 8 characters.', 'error');
    if (values.next !== values.confirm) return showToast('Passwords do not match.', 'error');
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: values.next });
    setSaving(false);
    if (error) {
      const message = error.message?.toLowerCase() || '';
      return showToast(message.includes('password') ? 'Password does not meet the required requirements.' : 'This password reset link is invalid or has expired.', 'error');
    }
    showToast('Password reset successfully. You can now log in with your new password.', 'success');
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  }

  if (checking) return <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-cream-50"><p className="text-sm text-stone-500">Checking password reset session…</p></div>;
  const recoveryUrl = window.location.hash.includes('type=recovery') || new URLSearchParams(window.location.search).get('type') === 'recovery';
  if (!session || (!recoverySession && !recoveryUrl)) return <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-cream-50 px-4"><div className="card w-full max-w-md p-8 text-center"><LockClosedIcon className="mx-auto h-10 w-10 text-maroon-700" /><h1 className="mt-4 font-display text-2xl font-bold text-maroon-800">Reset link unavailable</h1><p className="mt-2 text-sm text-stone-500">This password reset link is invalid or has expired.</p><Link to="/forgot-password" className="btn-primary mt-6 !rounded-xl">Request New Reset Link</Link></div></div>;

  return <div className="mandala-overlay flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-stone-50 to-gold-50 px-4 py-12"><div className="card w-full max-w-md p-6 sm:p-8"><div className="mb-7 text-center"><LockClosedIcon className="mx-auto h-9 w-9 text-maroon-700" /><h1 className="mt-3 font-display text-3xl font-bold text-maroon-800">Set New Password</h1><p className="mt-2 text-sm text-stone-500">Choose a new password for your account.</p></div><form onSubmit={submit} className="space-y-5"><PasswordField id="update-password" label="New Password" value={values.next} visible={visible.next} onChange={(event) => setValues({ ...values, next: event.target.value })} onToggle={() => setVisible({ ...visible, next: !visible.next })} /><PasswordField id="update-password-confirm" label="Confirm New Password" value={values.confirm} visible={visible.confirm} onChange={(event) => setValues({ ...values, confirm: event.target.value })} onToggle={() => setVisible({ ...visible, confirm: !visible.confirm })} /><div className="rounded-xl bg-stone-100 px-4 py-3 text-xs text-stone-600"><p className={values.next.length >= 8 ? 'text-emerald-700' : ''}>At least 8 characters</p><p className={values.next && values.next === values.confirm ? 'text-emerald-700' : ''}>Passwords match</p></div><button type="submit" disabled={saving} className="btn-primary w-full !rounded-xl">{saving ? 'Updating Password…' : 'Update Password'}</button></form></div></div>;
}

function PasswordField({ id, label, value, visible, onChange, onToggle }) {
  return <div><label htmlFor={id} className="label">{label}</label><div className="relative"><input id={id} required type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete="new-password" className="input pr-12" /><button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:text-maroon-800">{visible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button></div></div>;
}