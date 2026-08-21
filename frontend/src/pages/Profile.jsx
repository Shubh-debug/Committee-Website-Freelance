import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDate, initials, storageUrl, uploadErrorToMessage } from '../lib/utils.js';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Profile() {
  const { user, profile, loading, isAdmin, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(profile?.profile_image || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (loading) return <Spinner full label="Loading profile…" />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-5xl">🙏</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-maroon-800">Profile not loaded</h1>
        <p className="mt-2 text-stone-500">Please sign out and sign in again.</p>
        <button onClick={signOut} className="btn-maroon mt-6">Sign Out</button>
      </div>
    );
  }

  const currentName = name || profile.name;
  const currentPhone = phone || profile.phone || '';
  const currentAddress = address || profile.address || '';
  const currentImage = profileImage || profile.profile_image || '';

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.updateMe({
        name: currentName,
        phone: currentPhone,
        address: currentAddress,
        profile_image: currentImage,
      });
      await refreshProfile();
      setName('');
      setPhone('');
      setAddress('');
      setProfileImage(profile?.profile_image || '');
      setMessage('Profile updated successfully 🙏');
    } catch (err) {
      setError(uploadErrorToMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="card overflow-hidden">
        <div className="mandala-overlay-light flex flex-col gap-5 bg-gradient-to-r from-maroon-700 to-maroon-800 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold-500 text-3xl font-bold text-maroon-800 ring-4 ring-gold-300/50 shadow-lg">
            {profile.profile_image ? (
              <img src={storageUrl(profile.profile_image)}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                alt="" className="h-full w-full object-cover" />
            ) : (
              initials(profile.name)
            )}
          </div>
          <div className="text-cream-100">
            <h1 className="font-display text-2xl font-bold tracking-tight text-gradient-gold sm:text-3xl">{profile.name}</h1>
            <p className="mt-1 text-sm font-semibold tracking-wide text-cream-50/95 [text-shadow:0_1px_2px_rgba(42,10,14,0.75)] break-all">
              {profile.email}
            </p>
            <span className={`mt-3 inline-flex ${profile.role === 'admin' ? 'badge-admin' : 'badge-published'}`}>
              {profile.role === 'admin' ? '👑 Admin' : '🙏 Member'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={currentName} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="label">Email (from account)</label>
              <input className="input bg-stone-100 text-stone-500" value={profile.email} disabled />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                className="input"
                value={currentPhone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                type="tel"
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="label">Address</label>
              <input
                className="input"
                value={currentAddress}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your address"
                autoComplete="street-address"
              />
            </div>
            <div>
              <label className="label">Member since</label>
              <p className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.75 text-sm text-stone-600 shadow-sm">{formatDate(profile.created_at)}</p>
            </div>
            {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>}
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>

          <div className="space-y-5">
            <ImageUpload
              label="Profile Photo (optional)"
              caption={profile.name || 'Profile'}
              value={currentImage}
              onChange={setProfileImage}
            />
            <div className="flex flex-wrap gap-3 pt-2">
              {isAdmin && <Link to="/admin" className="btn-gold">⚙️ Admin Dashboard</Link>}
              <button type="button" onClick={signOut} className="btn-maroon">Logout</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
