import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, initials, storageUrl, uploadErrorToMessage } from '../../lib/utils.js';
import Spinner from '../../components/Spinner.jsx';

export default function AdminMembers() {
  const { profile: me } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.adminMembers());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (member, role) => {
    if (!window.confirm(`Set role of ${member.email} to "${role}"?`)) return;
    try {
      await api.updateMember(member.id, { role });
      setNotice(`Role updated for ${member.email} 🙏`);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (member) => {
    if (member.id === me?.id) return alert('You cannot delete your own account.');
    if (!window.confirm(`Delete member ${member.email}? Their content will also be removed.`)) return;
    try {
      await api.deleteMember(member.id);
      setNotice(`Member ${member.email} deleted.`);
      await load();
    } catch (err) {
      alert(uploadErrorToMessage(err));
    }
  };

  const members = items.filter((m) => m.role === 'member');
  const admins = items.filter((m) => m.role === 'admin');

  function MemberTable({ rows }) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-maroon-800 text-cream-100">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-saffron-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-saffron-100 text-xs font-bold text-saffron-700">
                      {m.profile_image ? (
                        <img
                          src={storageUrl(m.profile_image)}
                          alt={m.name || m.email}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.textContent = initials(m.name || 'User');
                          }}
                        />
                      ) : (
                        initials(m.name || 'User')
                      )}
                    </span>
                    <div>
                      <p className="font-medium text-stone-800">{m.name || '—'}</p>
                      <p className="text-xs text-stone-400">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {m.role === 'admin' ? <span className="badge-admin">Admin</span> : <span className="badge-published">Member</span>}
                </td>
                <td className="px-4 py-3 text-stone-500">{formatDate(m.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <select
                      className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs shadow-sm outline-none transition focus:border-saffron-500 focus:ring-2 focus:ring-saffron-100"
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value)}
                      disabled={m.id === me?.id}
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={() => remove(m)}
                      disabled={m.id === me?.id}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-maroon-800">Members</h1>
        <p className="mt-1 text-stone-500">Manage roles and remove members.</p>
      </div>

      {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>}
      {error && <div className="card mb-6 border-red-200 bg-red-50 p-6 text-red-600">{error}</div>}

      {loading ? (
        <Spinner full />
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-maroon-800">
              👑 Admins <span className="text-sm font-normal text-stone-400">({admins.length})</span>
            </h2>
            <MemberTable rows={admins} />
          </section>
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-maroon-800">
              🙏 Members <span className="text-sm font-normal text-stone-400">({members.length})</span>
            </h2>
            <MemberTable rows={members} />
          </section>
        </div>
      )}
    </div>
  );
}
