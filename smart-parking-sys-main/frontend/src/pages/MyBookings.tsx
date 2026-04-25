import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Car, Clock, XCircle, QrCode, Loader2, Filter } from 'lucide-react';
import type { Booking } from '../types';

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [qrModal, setQrModal] = useState<string | null>(null);

  useEffect(() => { loadBookings(); }, [filter]);

  const loadBookings = async () => {
    try {
      const params: any = { limit: 50 };
      if (filter) params.status = filter;
      const res = await bookingAPI.getAll(params);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err) { console.error(err); }
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'badge-success', CONFIRMED: 'badge-info', COMPLETED: 'badge-neutral',
    CANCELLED: 'badge-danger', PENDING: 'badge-warning', EXPIRED: 'badge-danger',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Bookings</h1>
          <p className="text-dark-400 mt-1">{bookings.length} bookings found</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-dark-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field !w-auto !py-2 !px-3 text-sm">
            <option value="">All Status</option>
            {['CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No bookings found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {bookings.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{booking.slot?.zone?.name || 'Zone'}</p>
                    <p className="text-xs text-dark-400">Slot {booking.slot?.slotNumber}</p>
                  </div>
                </div>
                <span className={statusColors[booking.status] || 'badge-neutral'}>{booking.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                  <Car className="w-4 h-4 text-dark-500" />
                  <span>{booking.vehicle?.licensePlate || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Clock className="w-4 h-4 text-dark-500" />
                  <span>{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Calendar className="w-4 h-4 text-dark-500" />
                  <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-dark-400 text-xs">₹</span>
                  <span className="text-white font-semibold">{booking.totalAmount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-dark-800">
                {booking.qrCode && ['CONFIRMED', 'ACTIVE'].includes(booking.status) && (
                  <button onClick={() => setQrModal(booking.qrCode!)} className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> QR Code
                  </button>
                )}
                {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                  <button onClick={() => handleCancel(booking.id)} className="btn-danger !py-2 !px-3 text-xs flex items-center gap-1 ml-auto">
                    <XCircle className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setQrModal(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Your Booking QR Code</h3>
            <div className="bg-white rounded-xl p-4 inline-block mb-4">
              <img src={qrModal} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm text-dark-400 mb-4">Show this QR code at the parking gate for entry</p>
            <button onClick={() => setQrModal(null)} className="btn-secondary w-full">Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
