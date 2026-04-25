import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../store';
import { parkingAPI, adminAPI, bookingAPI } from '../services/api';
import {
  Car, CalendarCheck, CreditCard, AlertTriangle, TrendingUp,
  MapPin, Clock, Users, ParkingCircle, ArrowUpRight, Loader2
} from 'lucide-react';
import type { ZoneStatus, DashboardStats, Booking } from '../types';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [zoneStatus, setZoneStatus] = useState<ZoneStatus[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, bookingsRes] = await Promise.all([
        parkingAPI.getRealTimeStatus(),
        bookingAPI.getAll({ limit: 5 }),
      ]);
      setZoneStatus(statusRes.data);
      setRecentBookings(bookingsRes.data.bookings || []);

      if (user?.role === 'ADMIN') {
        const statsRes = await adminAPI.getDashboardStats();
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSlots = zoneStatus.reduce((sum, z) => sum + z.totalSlots, 0);
  const occupiedSlots = zoneStatus.reduce((sum, z) => sum + z.occupiedSlots, 0);
  const availableSlots = totalSlots - occupiedSlots;
  const occupancyRate = totalSlots > 0 ? ((occupiedSlots / totalSlots) * 100).toFixed(1) : '0';

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'badge-success', CONFIRMED: 'badge-info', COMPLETED: 'badge-neutral',
      CANCELLED: 'badge-danger', PENDING: 'badge-warning',
    };
    return map[status] || 'badge-neutral';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Overview of your parking activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ParkingCircle, label: 'Available Slots', value: availableSlots, sub: `of ${totalSlots} total`, color: 'from-emerald-500/20 to-emerald-600/20', iconColor: 'text-emerald-400' },
          { icon: Car, label: 'Occupancy Rate', value: `${occupancyRate}%`, sub: `${occupiedSlots} occupied`, color: 'from-primary-500/20 to-primary-600/20', iconColor: 'text-primary-400' },
          { icon: CalendarCheck, label: 'My Bookings', value: recentBookings.length, sub: 'recent bookings', color: 'from-amber-500/20 to-amber-600/20', iconColor: 'text-amber-400' },
          { icon: CreditCard, label: stats ? 'Total Revenue' : 'Active Zones', value: stats ? `₹${stats.revenue.total.toLocaleString()}` : zoneStatus.length, sub: stats ? `₹${stats.revenue.today} today` : 'parking zones', color: 'from-violet-500/20 to-violet-600/20', iconColor: 'text-violet-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                <ArrowUpRight className="w-4 h-4 text-dark-500" />
              </div>
              <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
              <p className="text-xs text-dark-500 mt-0.5">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin-only stats row */}
      {stats && user?.role === 'ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: stats.users.total, color: 'text-cyan-400' },
            { icon: AlertTriangle, label: 'Open Violations', value: stats.violations.open, color: 'text-red-400' },
            { icon: TrendingUp, label: 'Today\'s Bookings', value: stats.bookings.today, color: 'text-emerald-400' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="glass-card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-dark-400">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Zone Status */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-400" /> Zone Status
            </h3>
            <span className="text-xs text-dark-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <div className="space-y-4">
            {zoneStatus.map((zone, i) => {
              const pct = zone.totalSlots > 0 ? (zone.occupiedSlots / zone.totalSlots) * 100 : 0;
              return (
                <motion.div
                  key={zone.zone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: zone.zone.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-white truncate">{zone.zone.name}</p>
                      <span className="text-xs text-dark-400">{zone.availableSlots}/{zone.totalSlots} available</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold shrink-0" style={{ color: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981' }}>
                    {pct.toFixed(0)}%
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-amber-400" /> Recent Bookings
          </h3>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-dark-400 text-sm text-center py-8">No bookings yet</p>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white">
                      {booking.slot?.zone?.name || 'Zone'}
                    </p>
                    <span className={statusBadge(booking.status)}>{booking.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-dark-400">{booking.slot?.slotNumber || 'Slot'}</p>
                    <p className="text-xs text-dark-400">₹{booking.totalAmount}</p>
                  </div>
                  <p className="text-xs text-dark-500 mt-1">
                    {new Date(booking.startTime).toLocaleDateString()} {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
