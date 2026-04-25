import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parkingAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Shield, AlertTriangle, MapPin, Camera, Clock, Check, Loader2, Radio
} from 'lucide-react';
import type { ZoneStatus, Violation } from '../types';

const SecurityDashboard = () => {
  const [zones, setZones] = useState<ZoneStatus[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [zonesRes, violationsRes] = await Promise.all([
        parkingAPI.getRealTimeStatus(),
        adminAPI.getViolations(),
      ]);
      setZones(zonesRes.data);
      setViolations(violationsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalSlots = zones.reduce((s, z) => s + z.totalSlots, 0);
  const occupied = zones.reduce((s, z) => s + z.occupiedSlots, 0);
  const openViolations = violations.filter(v => ['OPEN', 'FINE_ISSUED'].includes(v.status)).length;

  const violationColor: Record<string, string> = {
    OPEN: 'badge-danger', FINE_ISSUED: 'badge-warning', PAID: 'badge-success',
    DISPUTED: 'badge-info', RESOLVED: 'badge-neutral',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-400" /> Security Dashboard
          </h1>
          <p className="text-dark-400 mt-1">Real-time monitoring and violation management</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-semibold">LIVE</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Capacity', value: totalSlots, icon: MapPin, color: 'text-primary-400' },
          { label: 'Currently Occupied', value: occupied, icon: Camera, color: 'text-amber-400' },
          { label: 'Available', value: totalSlots - occupied, icon: Check, color: 'text-emerald-400' },
          { label: 'Open Violations', value: openViolations, icon: AlertTriangle, color: 'text-red-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 flex items-center gap-4">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-dark-400">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Live Zone Status */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" /> Zone Occupancy
          </h3>
          <div className="space-y-4">
            {zones.map((z) => {
              const pct = z.totalSlots > 0 ? (z.occupiedSlots / z.totalSlots) * 100 : 0;
              return (
                <div key={z.zone.id} className="p-4 rounded-xl bg-dark-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: z.zone.color }} />
                      <span className="text-sm font-semibold text-white">{z.zone.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${pct > 80 ? 'text-red-400' : pct > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {z.occupiedSlots}/{z.totalSlots}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981' }}
                    />
                  </div>
                  {/* Mini slot grid */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {z.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`w-6 h-6 rounded text-[8px] flex items-center justify-center font-bold
                          ${slot.isOccupied ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
                        title={`${slot.slotNumber} - ${slot.isOccupied ? 'Occupied' : 'Available'}`}
                      >
                        {slot.slotNumber.slice(-2)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Violations */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" /> Recent Violations
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {violations.length === 0 ? (
              <p className="text-dark-400 text-center py-8">No violations recorded</p>
            ) : (
              violations.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{v.type.replace('_', ' ')}</p>
                      <p className="text-xs text-dark-400">{v.user?.name} • {v.vehicle?.licensePlate}</p>
                    </div>
                    <span className={violationColor[v.status]}>{v.status}</span>
                  </div>
                  {v.description && <p className="text-xs text-dark-500 mb-2">{v.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-red-400">₹{v.fineAmount}</span>
                    <span className="text-xs text-dark-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
