import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import { AlertTriangle, Clock, DollarSign, Filter, Loader2 } from 'lucide-react';
import type { Violation } from '../types';

const ViolationsPage = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadViolations(); }, []);

  const loadViolations = async () => {
    try {
      const res = await adminAPI.getViolations();
      setViolations(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const statusColors: Record<string, string> = {
    OPEN: 'badge-danger', FINE_ISSUED: 'badge-warning', PAID: 'badge-success',
    DISPUTED: 'badge-info', RESOLVED: 'badge-neutral',
  };

  const violationTypeColors: Record<string, string> = {
    OVERSTAY: 'text-amber-400', WRONG_ZONE: 'text-red-400', UNAUTHORIZED: 'text-red-500',
    NO_BOOKING: 'text-orange-400', EXPIRED_PASS: 'text-violet-400', DOUBLE_PARKING: 'text-rose-400',
  };

  const totalFines = violations.reduce((s, v) => s + v.fineAmount, 0);
  const collected = violations.filter(v => v.status === 'PAID').reduce((s, v) => s + v.fineAmount, 0);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" /> Violations
        </h1>
        <p className="text-dark-400 mt-1">{violations.length} total violations</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-dark-400">Total Fines</p>
          <p className="text-2xl font-bold text-white">₹{totalFines.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-dark-400">Collected</p>
          <p className="text-2xl font-bold text-emerald-400">₹{collected.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-dark-400">Pending</p>
          <p className="text-2xl font-bold text-amber-400">₹{(totalFines - collected).toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Type</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">User / Vehicle</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Description</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Fine</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((v, i) => (
              <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                <td className="px-6 py-4">
                  <span className={`text-sm font-semibold ${violationTypeColors[v.type] || 'text-white'}`}>
                    {v.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-white">{v.user?.name}</p>
                  <p className="text-xs text-dark-400">{v.vehicle?.licensePlate}</p>
                </td>
                <td className="px-6 py-4 text-sm text-dark-300 max-w-xs truncate">{v.description || '-'}</td>
                <td className="px-6 py-4 text-sm font-bold text-red-400">₹{v.fineAmount}</td>
                <td className="px-6 py-4"><span className={statusColors[v.status]}>{v.status}</span></td>
                <td className="px-6 py-4 text-sm text-dark-400">{new Date(v.createdAt).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViolationsPage;
