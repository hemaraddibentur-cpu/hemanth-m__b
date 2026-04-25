import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState, AppDispatch } from '../store';
import { setUser } from '../store/authSlice';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building, Shield, Save, Loader2 } from 'lucide-react';

const Settings = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      dispatch(setUser({ ...user!, ...res.data }));
      toast.success('Profile updated!');
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-violet-500', SECURITY: 'bg-red-500', FACULTY: 'bg-blue-500',
    STAFF: 'bg-emerald-500', STUDENT: 'bg-amber-500', VISITOR: 'bg-cyan-500',
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Profile Settings</h1>
        <p className="text-dark-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-8 flex items-center gap-6">
        <div className={`w-20 h-20 rounded-2xl ${roleColors[user?.role || 'STUDENT']} flex items-center justify-center text-white text-3xl font-bold`}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-dark-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-dark-500" />
            <span className="text-sm text-dark-300 capitalize">{user?.role?.toLowerCase()}</span>
            {user?.department && <span className="text-xs text-dark-500">• {user.department}</span>}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
        <h3 className="text-lg font-semibold text-white">Edit Information</h3>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2"><User className="w-4 h-4 inline mr-1" /> Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2"><Phone className="w-4 h-4 inline mr-1" /> Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2"><Building className="w-4 h-4 inline mr-1" /> Department</label>
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2"><Mail className="w-4 h-4 inline mr-1" /> Email (read-only)</label>
          <input value={user?.email || ''} disabled className="input-field !opacity-50 !cursor-not-allowed" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </motion.form>
    </div>
  );
};

export default Settings;
