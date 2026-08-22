import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';

const EMPTY = { current: '', next: '', confirm: '' };

export default function ChangePasswordModal({ onClose }) {
  const { changePassword } = useAuth();
  const { showToast } = useToast();
  const [values, setValues] = useState(EMPTY);
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => { if (event.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const toggle = (field) => setVisible((current) => ({ ...current, [field]: !current[field] }));

  async function submit(event) {
    event.preventDefault();
    if (!values.current) return showToast('Current password is required.', 'error');
    if (values.next.length < 8) return showToast('Password must be at least 8 characters.', 'error');
    if (values.next !== values.confirm) return showToast('Passwords do not match.', 'error');
    if (values.current === values.next) return showToast('New password must differ from current password.', 'error');
    setSaving(true);
    try {
      await changePassword(values.current, values.next);
      setValues(EMPTY);
      onClose();
      showToast('Password changed successfully.', 'success');
    } catch (error) {
      const message = error.message?.toLowerCase() || '';
      showToast(message.includes('current password is incorrect') ? 'Current password is incorrect.' : message.includes('password') ? error.message : 'Unable to change password. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-maroon-950/60 p-4 backdrop-blur-sm" role="presentation">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="w-full max-w-lg rounded-3xl bg-cream-50 p-6 shadow-2xl ring-1 ring-gold-500/30 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-100 text-maroon-800"><LockClosedIcon className="h-5 w-5" /></span>
            <div><h2 id="change-password-title" className="font-display text-2xl font-bold text-maroon-800">Change Password</h2><p className="text-sm text-stone-500">Keep your account secure.</p></div>
          </div>
          <button ref={closeButtonRef} type="button" disabled={saving} onClick={onClose} aria-label="Close change password dialog" className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-maroon-800 disabled:opacity-50"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <PasswordField id="current-password" label="Current Password" value={values.current} onChange={update('current')} visible={visible.current} onToggle={() => toggle('current')} autoComplete="current-password" />
          <PasswordField id="new-password" label="New Password" value={values.next} onChange={update('next')} visible={visible.next} onToggle={() => toggle('next')} autoComplete="new-password" />
          <PasswordField id="confirm-password" label="Confirm New Password" value={values.confirm} onChange={update('confirm')} visible={visible.confirm} onToggle={() => toggle('confirm')} autoComplete="new-password" />
          <ul className="rounded-xl bg-stone-100 px-4 py-3 text-xs text-stone-600"><li className={values.next.length >= 8 ? 'text-emerald-700' : ''}>At least 8 characters</li><li className={values.next && values.next === values.confirm ? 'text-emerald-700' : ''}>New passwords match</li><li className={values.current && values.next && values.current !== values.next ? 'text-emerald-700' : ''}>New password differs from current</li></ul>
          <p className="text-sm text-stone-500">Forgot your password? <Link to="/forgot-password" onClick={onClose} className="font-semibold text-orange-600 hover:underline">Reset it here.</Link></p>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={onClose} className="btn-outline !px-5 !py-2.5">Cancel</button><button type="submit" disabled={saving} className="btn-primary !rounded-xl !px-5 !py-2.5">{saving ? 'Changing Password…' : 'Change Password'}</button></div>
        </form>
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle, autoComplete }) {
  return <div><label htmlFor={id} className="label">{label}</label><div className="relative"><input id={id} required type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} className="input pr-12" /><button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:text-maroon-800">{visible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button></div></div>;
}