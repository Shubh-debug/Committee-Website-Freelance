import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDate, initials, normalizeIndianPhone, storageUrl } from '../lib/utils.js';
import ImageUpload from '../components/ImageUpload.jsx';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../components/Toast.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';

export default function Profile() {
  const { user, profile, loading, isAdmin, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(profile?.profile_image || '');
  const [saving, setSaving] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { showToast } = useToast();

  if (loading) return <Spinner full label="Loading profile…" />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-5xl">🙏</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-maroon-800">Profile not loaded</h1>
        <p className="mt-2 text-stone-500">Please sign out and sign in again.</p>
        <button onClick={signOut} className="mt-6 rounded-xl bg-maroon-700 px-6 py-3 font-semibold text-white transition hover:bg-maroon-800">
          Sign Out
        </button>
      </div>
    );
  }

  const currentName = name || profile.name;
  const currentPhone = phone || profile.phone || '';
  const currentAddress = address || profile.address || '';
  const currentImage = profileImage || profile.profile_image || '';
  const phoneDigits = normalizeIndianPhone(currentPhone);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    if (currentPhone && !/^[6-9]\d{9}$/.test(phoneDigits)) {
      showToast('Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.', 'error');
      setSaving(false);
      return;
    }
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
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mandala-overlay relative min-h-screen bg-maroon-900 bg-gradient-to-br from-maroon-800 via-maroon-900 to-black px-4 py-12 sm:px-6 sm:py-16">
      <div className="relative mx-auto max-w-4xl">
        
        {/* Main Profile Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
          
          {/* Header Banner */}
          <div className="relative flex flex-col items-center gap-6 border-b border-stone-200 bg-gradient-to-r from-stone-50 to-stone-100 p-8 sm:flex-row sm:p-10">
            
            <div className="relative flex aspect-square h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-4xl font-bold text-maroon-900 shadow-xl ring-4 ring-white">
              {profile.profile_image ? (
                <img 
                  src={storageUrl(profile.profile_image)}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  alt={profile.name} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                initials(profile.name)
              )}
            </div>
            
            <div className="relative text-center sm:text-left">
              <h1 className="font-display text-3xl font-bold tracking-tight text-maroon-900 sm:text-4xl">
                {profile.name}
              </h1>
              <p className="mt-1.5 text-base font-medium text-stone-500">
                {profile.email}
              </p>
              <div className="mt-4 flex justify-center sm:justify-start">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-sm ${profile.role === 'admin' ? 'bg-maroon-800 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {profile.role === 'admin' ? '👑 Admin' : '🙏 Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="grid gap-10 p-8 sm:p-10 md:grid-cols-[1fr_280px]">
            
            {/* Left Column: Input Fields */}
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Full Name</label>
                <input 
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition focus:border-maroon-500 focus:outline-none focus:ring-2 focus:ring-maroon-500/20" 
                  value={currentName} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name" 
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Email Address</label>
                <input 
                  className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500 shadow-sm" 
                  value={profile.email} 
                  disabled 
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Phone Number</label>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition focus:border-maroon-500 focus:outline-none focus:ring-2 focus:ring-maroon-500/20"
                  value={phoneDigits}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                />
                <p className="mt-2 text-xs text-stone-500 flex items-center gap-1">
                  <span className="text-maroon-600/70 font-medium">+91</span> fixed country code · Enter 10 digits
                </p>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Address</label>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition focus:border-maroon-500 focus:outline-none focus:ring-2 focus:ring-maroon-500/20"
                  value={currentAddress}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your complete address"
                  autoComplete="street-address"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Member Since</label>
                <input 
                  type="text" 
                  className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500 shadow-sm" 
                  value={formatDate(profile.created_at)} 
                  disabled 
                />
              </div>

              {/* Primary Action - Reduced margin and padding here */}
              <div className="mt-2 border-t border-stone-100 pt-5">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-600/20 disabled:opacity-60 sm:w-auto"
                >
                  {saving ? 'Saving Changes…' : 'Save Profile Updates'}
                </button>
              </div>
            </div>

            {/* Right Column: Image Upload & Secondary Actions - Changed gap-8 to gap-5 */}
            <div className="flex flex-col gap-5 border-t border-stone-100 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              
              <div className="mx-auto w-full max-w-[260px] md:mx-0">
                <label className="mb-3 block text-sm font-semibold text-stone-700">Profile Photo (Optional)</label>
                <div className="overflow-hidden rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-2 transition hover:border-maroon-300">
                  <ImageUpload
                    caption={profile.name || 'Profile'}
                    value={currentImage}
                    onChange={setProfileImage}
                  />
                </div>
              </div>

              {/* Secondary System Actions - Removed mt-auto and added mt-2 */}
              <div className="mt-2 flex flex-col gap-3 rounded-2xl bg-stone-50 p-5 ring-1 ring-stone-900/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">System Actions</h3>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex w-full items-center justify-center rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-bold text-maroon-900 transition hover:bg-gold-400"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setChangePasswordOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-maroon-800 px-4 py-2.5 text-sm font-bold text-cream-100 transition hover:bg-maroon-700"
                >
                  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                  Change Password
                </button>
                <button 
                  type="button" 
                  onClick={signOut} 
                  className="flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-maroon-800 ring-1 ring-maroon-800/20 transition hover:bg-maroon-50"
                >
                  Logout
                </button>
              </div>
              
            </div>
          </form>
        </div>
      </div>
      {changePasswordOpen && <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />}
    </div>
  );
}