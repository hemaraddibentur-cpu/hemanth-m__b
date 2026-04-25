import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Users, Search, Filter, Shield, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const loadUsers = async () => {
    try {
      const params: any = { limit: 50 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id: string) => {
    try {
      await adminAPI.toggleUserStatus(id);
      toast.success('User status updated');
      loadUsers();
    } catch (err) { console.error(err); }
  };

  const roleBadges: Record<string, string> = {
    ADMIN: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    SECURITY: 'bg-red-500/20 text-red-400 border-red-500/30',
    FACULTY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    STAFF: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    STUDENT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    VISITOR: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-400" /> User Management
        </h1>
        <p className="text-dark-400 mt-1">{users.length} users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            className="input-field !pl-11"
            placeholder="Search by name or email..."
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field !w-auto">
          <option value="">All Roles</option>
          {['ADMIN', 'SECURITY', 'FACULTY', 'STAFF', 'STUDENT', 'VISITOR'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">User</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Department</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Stats</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-dark-400">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge border ${roleBadges[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-6 py-4 text-sm text-dark-300">{u.department || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3 text-xs text-dark-400">
                    <span>{u._count?.vehicles || 0} vehicles</span>
                    <span>{u._count?.bookings || 0} bookings</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={u.isActive ? 'badge-success' : 'badge-danger'}>{u.isActive ? 'Active' : 'Suspended'}</span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(u.id)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors" title={u.isActive ? 'Suspend' : 'Activate'}>
                    {u.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-dark-500" />}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
