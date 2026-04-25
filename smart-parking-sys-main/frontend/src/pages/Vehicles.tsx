import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Car, Plus, Trash2, Loader2, Tag } from 'lucide-react';
import type { Vehicle, VehicleType } from '../types';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ licensePlate: '', vehicleType: 'CAR' as VehicleType, make: '', model: '', color: '' });

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    try {
      const res = await userAPI.getVehicles();
      setVehicles(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.addVehicle(form);
      toast.success('Vehicle added!');
      setShowForm(false);
      setForm({ licensePlate: '', vehicleType: 'CAR', make: '', model: '', color: '' });
      loadVehicles();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this vehicle?')) return;
    try {
      await userAPI.deleteVehicle(id);
      toast.success('Vehicle removed');
      loadVehicles();
    } catch (err) { console.error(err); }
  };

  const vehicleIcons: Record<string, string> = {
    CAR: '🚗', BIKE: '🏍️', TRUCK: '🚛', SUV: '🚙', VAN: '🚐',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Vehicles</h1>
          <p className="text-dark-400 mt-1">{vehicles.length}/3 vehicles registered</p>
        </div>
        {vehicles.length < 3 && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Register New Vehicle</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">License Plate *</label>
                <input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} className="input-field !py-2.5" placeholder="KA01AB1234" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Vehicle Type *</label>
                <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })} className="input-field !py-2.5">
                  {['CAR', 'BIKE', 'TRUCK', 'SUV', 'VAN'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Make</label>
                <input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className="input-field !py-2.5" placeholder="Toyota" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Model</label>
                <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="input-field !py-2.5" placeholder="Camry" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Color</label>
                <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input-field !py-2.5" placeholder="White" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary !py-2">Cancel</button>
              <button type="submit" className="btn-primary !py-2">Register Vehicle</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Vehicle List */}
      {vehicles.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Car className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No vehicles registered yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{vehicleIcons[v.vehicleType] || '🚗'}</div>
                  <div>
                    <p className="font-bold text-white text-lg font-mono">{v.licensePlate}</p>
                    <p className="text-xs text-dark-400">{v.vehicleType}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(v.id)} className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {v.make && <div className="flex justify-between"><span className="text-dark-400">Make/Model</span><span className="text-white">{v.make} {v.model}</span></div>}
                {v.color && <div className="flex justify-between"><span className="text-dark-400">Color</span><span className="text-white">{v.color}</span></div>}
                {v.rfidSticker && (
                  <div className="flex items-center gap-1 mt-3 px-3 py-1.5 bg-primary-500/10 rounded-lg">
                    <Tag className="w-3 h-3 text-primary-400" />
                    <span className="text-xs text-primary-400 font-mono">{v.rfidSticker}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
