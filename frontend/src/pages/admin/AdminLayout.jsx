import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/members', label: 'Members' },
];

export default function AdminLayout() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="mandala-overlay-light flex flex-col bg-maroon-800 text-cream-100 lg:min-h-screen lg:w-72 lg:shrink-0">
          <div className="border-b border-cream-100/10 px-5 py-5">
            <p className="font-display text-lg font-bold text-gradient-gold">Admin Dashboard</p>
            <p className="mt-1 truncate text-xs text-cream-200/70">{profile?.email || 'Admin account'}</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1.5 overflow-x-auto p-4 lg:overflow-visible">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive ? 'bg-gold-500 text-maroon-800 shadow' : 'text-cream-200/85 hover:bg-cream-100/10'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-auto pt-6">
              <Link to="/" className="block rounded-xl border border-cream-100/15 bg-cream-100/10 px-4 py-2.5 text-sm font-semibold text-cream-100 transition hover:bg-cream-100/20">
                ← View Public Site
              </Link>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
