import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import Spinner from '../../components/Spinner.jsx';
import { formatCurrency } from '../../lib/utils.js';
import { useToast } from '../../components/Toast.jsx';

const CARDS = [
  { key: 'members', label: 'Total Members', icon: '👥', to: '/admin/members', cls: 'from-saffron-500 to-saffron-700' },
  { key: 'posts', label: 'Total Posts', icon: '📝', to: '/admin/posts', cls: 'from-gold-500 to-gold-700' },
  { key: 'events', label: 'Total Events', icon: '🗓️', to: '/admin/events', cls: 'from-maroon-500 to-maroon-700' },
  { key: 'announcements', label: 'Total Announcements', icon: '📣', to: '/admin/announcements', cls: 'from-emerald-500 to-emerald-700' },
  { key: 'gallery', label: 'Total Gallery Images', icon: '📸', to: '/admin/gallery', cls: 'from-sky-500 to-sky-700' },
  { key: 'totalFunds', label: 'Total Funds', icon: '💰', to: '/admin/funds', cls: 'from-gold-500 to-gold-700' },
  { key: 'totalExpenses', label: 'Total Expenses', icon: '🧾', to: '/admin/expenses', cls: 'from-maroon-500 to-maroon-700' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .dashboardStats()
      .then(setStats)
      .catch((e) => showToast(e.message, 'error'));
  }, []);

  // Calculate Drafts (Total - Published) safely ensuring no negative numbers
  const draftPosts = Math.max(0, (stats?.posts || 0) - (stats?.publishedPosts || 0));
  const draftAnnouncements = Math.max(0, (stats?.announcements || 0) - (stats?.publishedAnnouncements || 0));

  return (
    <div className="pb-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-800">Dashboard</h1>
          <p className="mt-1 text-stone-500">Key Metrics and Operational Summary</p>
        </div>
        <Link
  to="/admin/expenses"
  className="btn-gold min-h-12 max-w-full !px-4 !py-2 text-sm shadow-sm transition hover:shadow-md focus-visible:ring-4 focus-visible:ring-gold-200"
>
  <svg
    className="h-5 w-5 shrink-0 text-maroon-700"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" />
    <path d="M16 12h4v4h-4a2 2 0 0 1 0-4Z" />
    <circle cx="17" cy="14" r="0.5" fill="currentColor" />
  </svg>

  <span className="flex flex-col items-start leading-tight">
    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-maroon-700/70">
      Current Balance
    </span>

    <span className="font-sans text-base font-bold tabular-nums">
      {stats?.financialInitialized
        ? formatCurrency(stats.currentBalance)
        : 'Initialize balance'}
    </span>
  </span>
</Link>
      </div>

      {!stats ? (
        <Spinner full />
      ) : (
        <>
          {/* Enhanced Summary Cards with Deeper Shadows on Hover */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CARDS.map((c) => (
              <Link key={c.key} to={c.to} className="group">
                <div className={`flex min-h-[178px] h-full flex-col rounded-2xl bg-gradient-to-br ${c.cls} p-5 text-white shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl sm:p-6`}>
                  <span className="text-3xl">{c.icon}</span>
                  <p className="mt-3 min-w-0 flex-1 break-words font-sans text-3xl font-extrabold leading-tight tabular-nums">
                    {c.key === 'totalFunds' || c.key === 'totalExpenses' 
                      ? (stats[c.key] === null ? '—' : formatCurrency(stats[c.key])) 
                      : (stats[c.key] ?? 0)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/90">{c.label}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            
            {/* New Design: Content Status with Draft Counts */}
            <div className="card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Content Status</p>
              <ul className="mt-5 space-y-4">
                <li className="flex items-center justify-between border-b border-stone-100 pb-4 text-sm">
                  <span className="font-semibold text-stone-600">Posts</span>
                  <div className="flex gap-2">
                    {draftPosts > 0 && (
                      <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
                        {draftPosts} Draft{draftPosts !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {stats.publishedPosts ?? 0} Published
                    </span>
                  </div>
                </li>
                <li className="flex items-center justify-between pt-1 text-sm">
                  <span className="font-semibold text-stone-600">Announcements</span>
                  <div className="flex gap-2">
                    {draftAnnouncements > 0 && (
                      <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
                        {draftAnnouncements} Draft{draftAnnouncements !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {stats.publishedAnnouncements ?? 0} Active
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* New Design: Quick Actions with Visual Hierarchy */}
            <div className="card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Quick Actions</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/admin/posts" className="btn-primary !px-4 !py-2 text-sm shadow-sm">+ New Post</Link>
                <Link to="/admin/events" className="btn-primary !px-4 !py-2 text-sm shadow-sm">+ New Event</Link>
                <Link to="/admin/announcements" className="btn-primary !px-4 !py-2 text-sm shadow-sm">+ New Announcement</Link>
                <Link to="/admin/funds" className="inline-flex items-center justify-center rounded-lg border-2 border-orange-500 px-4 py-1.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-500/20">
                  + New Fund
                </Link>
                <Link to="/admin/expenses" className="inline-flex items-center justify-center rounded-lg border-2 border-orange-500 px-4 py-1.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-500/20">
                  + New Expense
                </Link>
              </div>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}