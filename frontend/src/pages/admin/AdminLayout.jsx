import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ConfirmProvider } from '../../components/ConfirmModal.jsx';

// Updated Navigation Array with SVG Icons
const NAV_LINKS = [
  {
    to: '/admin',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    to: '/admin/posts',
    label: 'Posts',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/admin/events',
    label: 'Events',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/admin/announcements',
    label: 'Announcements',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/admin/gallery',
    label: 'Gallery',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/admin/members',
    label: 'Members',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    to: '/admin/funds',
    label: 'Funds',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h15a2 2 0 0 0 2-2v-2" />
        <path d="M2 6h16a2 2 0 0 1 2 2v2h-5a3 3 0 0 0 0 6h5v2" />
        <circle cx="16" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/admin/expenses',
    label: 'Expenses',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const { profile } = useAuth();

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-stone-100">
        <div className="flex flex-col lg:flex-row">
          
          {/* Sidebar */}
          <aside className="mandala-overlay-light flex flex-col bg-maroon-800 text-cream-100 lg:min-h-screen lg:w-64 lg:shrink-0">
            <div className="border-b border-cream-100/10 px-5 py-6">
              <p className="font-display text-lg font-bold text-gradient-gold">Admin Dashboard</p>
              <p className="mt-1 truncate text-xs font-medium tracking-wide text-cream-200/70">{profile?.email || 'Admin account'}</p>
            </div>
            
            <nav className="flex flex-1 flex-col gap-2 overflow-x-auto p-4 lg:overflow-visible">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                      isActive 
                        ? 'bg-gold-500 text-maroon-900 shadow-md' 
                        : 'text-cream-200/85 hover:bg-cream-100/10 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Dynamic Icon Colors */}
                      <div className={`transition-colors duration-200 ${isActive ? 'text-maroon-900' : 'text-gold-500'}`}>
                        {l.icon}
                      </div>
                      {l.label}
                    </>
                  )}
                </NavLink>
              ))}
              
              <div className="mt-auto pt-8">
                <Link to="/" className="flex items-center justify-center gap-2 rounded-xl border border-cream-100/15 bg-cream-100/10 px-4 py-3 text-sm font-semibold text-cream-100 transition hover:bg-cream-100/20">
                  <span>←</span> Back To Home
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
    </ConfirmProvider>
  );
}