import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ImagePlaceholder from './ImagePlaceholder.jsx';
import { initials, storageUrl } from '../lib/utils.js';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/posts', label: 'Posts' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate('/');
  }

  const linkCls = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-all ${
      isActive ? 'bg-saffron-500 text-white shadow-md shadow-saffron-200/60' : 'text-stone-700 hover:bg-saffron-50 hover:text-saffron-700'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gold-500/20 bg-cream-50/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-gold-500/70 shadow-sm">
            <img
  src="/images/ganesha.png"
  alt="श्री गणेश मित्र मंडळ"
  className="h-11 w-11 object-contain"
 />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-tight text-maroon-800 sm:text-base">
              श्री गणेश मित्र मंडळ
            </p>
            <p className="text-[10px] font-semibold text-gold-600 sm:text-xs">स्थापना २०२४</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkCls}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn-gold !mx-1 !px-4 !py-2 text-xs font-bold uppercase tracking-[0.12em] leading-none">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="btn-outline !px-3 !py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-saffron-100 text-[10px] font-bold text-saffron-700 ring-1 ring-saffron-200">
                    {profile?.profile_image ? (
                      <img
                        src={storageUrl(profile.profile_image)}
                        alt={profile?.name || 'Profile'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) parent.textContent = initials(profile?.name || 'User');
                        }}
                      />
                    ) : (
                      initials(profile?.name || 'User')
                    )}
                  </span>
                  {profile?.name?.split(' ')[0] || 'Profile'}
                </span>
              </Link>
              <button onClick={handleSignOut} className="btn-maroon !px-4 !py-2 text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline !px-5 !py-2 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-5 !py-2 text-sm">
                Join Mandal
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-maroon-200 bg-white p-2 text-maroon-800 shadow-sm lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gold-500/20 bg-cream-50 px-4 pb-5 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-saffron-500 text-white' : 'text-stone-700 hover:bg-saffron-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="btn-gold !my-1 !py-2 text-sm leading-none">
                      Admin
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setOpen(false)} className="btn-outline !py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-saffron-100 text-[10px] font-bold text-saffron-700 ring-1 ring-saffron-200">
                        {profile?.profile_image ? (
                          <img
                            src={storageUrl(profile.profile_image)}
                            alt={profile?.name || 'Profile'}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) parent.textContent = initials(profile?.name || 'User');
                            }}
                          />
                        ) : (
                          initials(profile?.name || 'User')
                        )}
                      </span>
                      My Profile
                    </span>
                  </Link>
                  <button onClick={handleSignOut} className="btn-maroon !py-2 text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline !py-2 text-sm">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary !py-2 text-sm">
                    Join Mandal 🙏
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
