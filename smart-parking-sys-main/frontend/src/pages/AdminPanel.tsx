import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, parkingAPI } from '../services/api';
import {
  BarChart3, TrendingUp, Users, AlertTriangle, DollarSign, Loader2, ParkingCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import type { DashboardStats, UsageAnalytics, RevenueAnalytics } from '../types';

const AdminPanel = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usage, setUsage] = useState<UsageAnalytics | null>(null);
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    try {
      const [statsRes, usageRes, revenueRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getUsageAnalytics({ period }),
        adminAPI.getRevenueAnalytics({ period }),
      ]);
      setStats(statsRes.data);
      setUsage(usageRes.data);
      setRevenue(revenueRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
          <p className="text-dark-400 mt-1">Analytics and management overview</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: stats.users.total, color: 'text-cyan-400', bg: 'from-cyan-500/20' },
            { icon: ParkingCircle, label: 'Occupancy', value: `${stats.parking.occupancyRate}%`, color: 'text-primary-400', bg: 'from-primary-500/20' },
            { icon: DollarSign, label: 'Revenue', value: `₹${stats.revenue.total.toLocaleString()}`, color: 'text-emerald-400', bg: 'from-emerald-500/20' },
            { icon: AlertTriangle, label: 'Violations', value: stats.violations.open, color: 'text-red-400', bg: 'from-red-500/20' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.bg} to-transparent opacity-50`} />
              <div className="relative">
                <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                <p className="text-2xl font-display font-bold text-white">{s.value}</p>
                <p className="text-sm text-dark-400">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        {usage && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" /> Booking Trends
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={usage.daily}>
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#3b82f6" fill="url(#bookingGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue Chart */}
        {revenue && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Revenue Overview
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenue.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Zone Usage */}
        {usage && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" /> Zone Usage
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={usage.byZone}
                  dataKey="bookings"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name?.split('-')[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {usage.byZone.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Peak Hours */}
        {usage && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-400" /> Peak Hours
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={usage.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: number) => [`${value}%`, 'Occupancy']}
                />
                <Bar dataKey="occupancy" radius={[2, 2, 0, 0]}>
                  {usage.peakHours.map((entry, i) => (
                    <Cell key={i} fill={entry.occupancy > 70 ? '#ef4444' : entry.occupancy > 40 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Zone Overview */}
      {stats && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Zone Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase">Zone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase">Occupied</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase">Available</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {stats.zones.map((z) => {
                  const pct = z.totalSlots > 0 ? (z.occupied / z.totalSlots) * 100 : 0;
                  return (
                    <tr key={z.id} className="table-row">
                      <td className="px-4 py-3 text-sm font-medium text-white">{z.name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{z.totalSlots}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{z.occupied}</td>
                      <td className="px-4 py-3 text-sm text-emerald-400 font-semibold">{z.available}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981' }} />
                          </div>
                          <span className="text-xs text-dark-400">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
