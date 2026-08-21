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
  { key: 'announcements', label: 'Announcements', icon: '📣', to: '/admin/announcements', cls: 'from-emerald-500 to-emerald-700' },
  { key: 'gallery', label: 'Gallery Images', icon: '📸', to: '/admin/gallery', cls: 'from-sky-500 to-sky-700' },
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

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-800">Dashboard 🙏</h1>
          <p className="mt-1 text-stone-500">Overview of the Mandal website.</p>
        </div>
        <Link to="/admin/expenses" className="btn-gold min-h-12 max-w-full !px-4 !py-2 text-sm focus-visible:ring-4 focus-visible:ring-gold-200">
          <span aria-hidden="true">💰</span>
          <span className="flex flex-col items-start leading-tight"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-maroon-700/70">Current Balance</span><span className="font-sans text-base font-bold tabular-nums">{stats?.financialInitialized ? formatCurrency(stats.currentBalance) : 'Initialize balance'}</span></span>
        </Link>
      </div>

      {!stats ? (
        <Spinner full />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CARDS.map((c) => (
              <Link key={c.key} to={c.to} className="group">
                <div className={`flex min-h-[178px] h-full flex-col rounded-2xl bg-gradient-to-br ${c.cls} p-5 text-white shadow-lg transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-xl sm:p-6`}>
                  <span className="text-3xl">{c.icon}</span>
                  <p className="mt-3 min-w-0 flex-1 break-words font-sans text-2xl font-extrabold leading-tight tabular-nums sm:text-3xl">{c.key === 'totalFunds' || c.key === 'totalExpenses' ? (stats[c.key] === null ? '—' : formatCurrency(stats[c.key])) : (stats[c.key] ?? 0)}</p>
                  <p className="mt-2 text-sm text-white/85">{c.label}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Content status</p>
              <ul className="mt-4 space-y-3">
                <li className="flex justify-between text-sm">
                  <span>Published posts</span>
                  <strong>{stats.publishedPosts ?? 0} <span className="font-normal text-stone-400">/ {stats.posts ?? 0}</span></strong>
                </li>
                <li className="flex justify-between text-sm">
                  <span>Published announcements</span>
                  <strong>{stats.publishedAnnouncements ?? 0} <span className="font-normal text-stone-400">/ {stats.announcements ?? 0}</span></strong>
                </li>
              </ul>
            </div>
            <div className="card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/admin/posts" className="btn-primary !px-4 !py-2 text-sm">+ New Post</Link>
                <Link to="/admin/events" className="btn-primary !px-4 !py-2 text-sm">+ New Event</Link>
                <Link to="/admin/announcements" className="btn-primary !px-4 !py-2 text-sm">+ New Announcement</Link>
                <Link to="/admin/funds" className="btn-primary !px-4 !py-2 text-sm">+ New Fund</Link>
                <Link to="/admin/expenses" className="btn-primary !px-4 !py-2 text-sm">+ New Expense</Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
