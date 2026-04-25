import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { bookingAPI, parkingAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin, Calendar, Clock, Car, Filter, Loader2, Check, ChevronRight, Zap
} from 'lucide-react';
import type { ParkingSlot, ZoneStatus, Vehicle } from '../types';

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [zoneStatus, setZoneStatus] = useState<ZoneStatus[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, vehiclesRes] = await Promise.all([
        parkingAPI.getRealTimeStatus(),
        userAPI.getVehicles(),
      ]);
      setZoneStatus(statusRes.data);
      setVehicles(vehiclesRes.data);

      // Default dates
      const now = new Date();
      setStartDate(now.toISOString().split('T')[0]);
      setStartTime(now.toTimeString().slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedZoneData = zoneStatus.find(z => z.zone.id === selectedZone);
  const availableSlots = selectedZoneData?.slots.filter(s => !s.isOccupied && !s.isReserved) || [];

  const calculateTotal = () => {
    if (!selectedZoneData) return 0;
    return duration * selectedZoneData.zone.hourlyRate;
  };

  const handleBook = async () => {
    if (!selectedSlot || !selectedVehicle || !startDate || !startTime) {
      toast.error('Please fill all fields');
      return;
    }

    setBooking(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 3600000);

      const res = await bookingAPI.create({
        slotId: selectedSlot.id,
        vehicleId: selectedVehicle,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      toast.success('Booking confirmed!');
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Book Parking</h1>
        <p className="text-dark-400 mt-1">Reserve your parking slot in advance</p>
      </div>

      {/* Step Progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          {['Select Zone', 'Choose Slot', 'Details', 'Confirmed'].map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'}`}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step >= i + 1 ? 'text-white' : 'text-dark-500'}`}>{s}</span>
              {i < 3 && <ChevronRight className="w-4 h-4 text-dark-600 ml-auto hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Zone */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" /> Select Parking Zone
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneStatus.map((zone) => (
              <motion.button
                key={zone.zone.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedZone(zone.zone.id); setStep(2); }}
                className={`glass-card-hover p-6 text-left transition-all ${selectedZone === zone.zone.id ? 'border-primary-500 shadow-glow' : ''}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: zone.zone.color }} />
                  <h4 className="font-semibold text-white">{zone.zone.name}</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{zone.availableSlots}</p>
                    <p className="text-[10px] text-dark-400 uppercase">Available</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-400">{zone.occupiedSlots}</p>
                    <p className="text-[10px] text-dark-400 uppercase">Occupied</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary-400">₹{zone.zone.hourlyRate}</p>
                    <p className="text-[10px] text-dark-400 uppercase">Per Hour</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Choose Slot */}
      {step === 2 && selectedZoneData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> {selectedZoneData.zone.name}
            </h3>
            <button onClick={() => setStep(1)} className="text-sm text-primary-400 hover:text-primary-300">Change Zone</button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs">
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" /> Available</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" /> Occupied</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-primary-500/20 border border-primary-500" /> Selected</span>
          </div>

          {/* Slot Grid */}
          <div className="glass-card p-6">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {selectedZoneData.slots.map((slot) => {
                const isAvail = !slot.isOccupied && !slot.isReserved;
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <motion.button
                    key={slot.id}
                    whileHover={isAvail ? { scale: 1.1 } : {}}
                    whileTap={isAvail ? { scale: 0.95 } : {}}
                    onClick={() => isAvail && setSelectedSlot(slot)}
                    className={isSelected ? 'parking-slot-selected' : isAvail ? 'parking-slot-available' : 'parking-slot-occupied'}
                    disabled={!isAvail}
                  >
                    {slot.slotNumber.slice(-3)}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {selectedSlot && (
            <div className="flex justify-end">
              <button onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 3: Details */}
      {step === 3 && selectedSlot && selectedZoneData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-400" /> Booking Details
          </h3>

          {/* Summary */}
          <div className="glass-card p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-dark-400 uppercase mb-1">Zone</p>
                <p className="text-sm font-semibold text-white">{selectedZoneData.zone.name}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase mb-1">Slot</p>
                <p className="text-sm font-semibold text-white">{selectedSlot.slotNumber} ({selectedSlot.slotType})</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase mb-1">Rate</p>
                <p className="text-sm font-semibold text-white">₹{selectedZoneData.zone.hourlyRate}/hour</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase mb-1">Floor</p>
                <p className="text-sm font-semibold text-white">Floor {selectedSlot.floor}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                <Car className="w-4 h-4 inline mr-1" /> Select Vehicle
              </label>
              <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="input-field">
                <option value="">Choose a vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.licensePlate} - {v.make} {v.model} ({v.vehicleType})</option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <p className="text-xs text-amber-400 mt-1">No vehicles registered. Please add a vehicle first.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" /> Date
                </label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" /> Start Time
                </label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Duration (hours)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 6, 8].map((h) => (
                  <button
                    key={h}
                    onClick={() => setDuration(h)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      duration === h
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Total Amount</p>
              <p className="text-3xl font-display font-bold gradient-text">₹{calculateTotal()}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
              <button
                onClick={handleBook}
                disabled={!selectedVehicle || booking}
                className="btn-primary flex items-center gap-2"
              >
                {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</> : <><Check className="w-4 h-4" /> Confirm Booking</>}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-dark-400">Your parking slot has been reserved. A QR code has been generated for entry.</p>
          </div>
          <div className="glass-card p-6 text-left space-y-3">
            <div className="flex justify-between"><span className="text-dark-400">Zone</span><span className="text-white font-medium">{selectedZoneData?.zone.name}</span></div>
            <div className="flex justify-between"><span className="text-dark-400">Slot</span><span className="text-white font-medium">{selectedSlot?.slotNumber}</span></div>
            <div className="flex justify-between"><span className="text-dark-400">Duration</span><span className="text-white font-medium">{duration} hours</span></div>
            <div className="flex justify-between"><span className="text-dark-400">Amount</span><span className="text-white font-bold">₹{calculateTotal()}</span></div>
          </div>
          <button onClick={() => { setStep(1); setSelectedSlot(null); setSelectedZone(''); }} className="btn-primary">
            Book Another Slot
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default BookingPage;
