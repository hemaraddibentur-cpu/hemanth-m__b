import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../websocket';

export const processEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, vehicleId, entryGate, licensePlateCaptured, verificationMethod } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true, slot: { include: { zone: true } } },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.status !== 'CONFIRMED') {
      res.status(400).json({ error: `Booking status is ${booking.status}, expected CONFIRMED` });
      return;
    }

    // Update booking and slot
    await prisma.booking.update({ where: { id: bookingId }, data: { status: 'ACTIVE' } });
    await prisma.parkingSlot.update({ where: { id: booking.slotId }, data: { isOccupied: true } });

    const entryLog = await prisma.entryLog.create({
      data: {
        bookingId,
        vehicleId: vehicleId || booking.vehicleId,
        entryGate: entryGate || 'Gate A',
        licensePlateCaptured,
        verificationMethod: verificationMethod || 'QR_CODE',
      },
      include: { booking: { include: { slot: { include: { zone: true } } } }, vehicle: true },
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: 'Vehicle Entered',
        message: `Your vehicle ${booking.vehicle.licensePlate} has entered through ${entryGate || 'Gate A'}. Slot: ${booking.slot.slotNumber}, Zone: ${booking.slot.zone.name}`,
        type: 'info',
      },
    });

    try {
      const io = getIO();
      io.emit('slot-update', { slotId: booking.slotId, isOccupied: true, zoneId: booking.slot.zoneId });
      io.emit('entry-event', { entryLog, booking });
    } catch (e) { /* WebSocket not initialized */ }

    logger.info(`Entry processed: ${entryLog.id} for booking ${bookingId}`);
    res.status(201).json(entryLog);
  } catch (error) {
    logger.error('Process entry error:', error);
    res.status(500).json({ error: 'Failed to process entry' });
  }
};

export const processExit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { entryLogId, exitGate } = req.body;

    const entryLog = await prisma.entryLog.findUnique({
      where: { id: entryLogId },
      include: {
        booking: { include: { slot: { include: { zone: true } } } },
        vehicle: true,
        exitLog: true,
      },
    });

    if (!entryLog) {
      res.status(404).json({ error: 'Entry log not found' });
      return;
    }

    if (entryLog.exitLog) {
      res.status(400).json({ error: 'Exit already processed' });
      return;
    }

    const exitTime = new Date();
    const duration = Math.ceil((exitTime.getTime() - entryLog.entryTime.getTime()) / (1000 * 60)); // minutes
    const hours = Math.ceil(duration / 60);
    const amountPaid = hours * entryLog.booking.slot.zone.hourlyRate;

    const exitLog = await prisma.exitLog.create({
      data: {
        entryLogId,
        exitTime,
        exitGate: exitGate || 'Gate A',
        duration,
        amountPaid,
        paymentStatus: 'COMPLETED',
      },
    });

    // Update booking and slot
    await prisma.booking.update({ where: { id: entryLog.bookingId }, data: { status: 'COMPLETED' } });
    await prisma.parkingSlot.update({ where: { id: entryLog.booking.slotId }, data: { isOccupied: false } });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: entryLog.bookingId,
        userId: entryLog.booking.userId,
        amount: amountPaid,
        method: 'UPI',
        status: 'COMPLETED',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        description: `Parking fee for ${duration} minutes`,
      },
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId: entryLog.booking.userId,
        title: 'Vehicle Exited',
        message: `Your vehicle has exited. Duration: ${Math.floor(duration / 60)}h ${duration % 60}m. Amount: ₹${amountPaid.toFixed(2)}`,
        type: 'info',
      },
    });

    try {
      const io = getIO();
      io.emit('slot-update', { slotId: entryLog.booking.slotId, isOccupied: false, zoneId: entryLog.booking.slot.zoneId });
      io.emit('exit-event', { exitLog, entryLog });
    } catch (e) { /* WebSocket not initialized */ }

    logger.info(`Exit processed: ${exitLog.id}`);
    res.status(201).json({ exitLog, duration, amountPaid });
  } catch (error) {
    logger.error('Process exit error:', error);
    res.status(500).json({ error: 'Failed to process exit' });
  }
};

export const getRealTimeStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const zones = await prisma.parkingZone.findMany({
      where: { isActive: true },
      include: {
        slots: {
          where: { isActive: true },
          select: {
            id: true, slotNumber: true, slotType: true, floor: true,
            isOccupied: true, isReserved: true, posX: true, posY: true,
          },
        },
      },
    });

    const status = zones.map((zone) => {
      const totalSlots = zone.slots.length;
      const occupiedSlots = zone.slots.filter((s) => s.isOccupied).length;
      const reservedSlots = zone.slots.filter((s) => s.isReserved).length;
      const availableSlots = totalSlots - occupiedSlots - reservedSlots;

      return {
        zone: { id: zone.id, name: zone.name, color: zone.color, hourlyRate: zone.hourlyRate },
        totalSlots,
        occupiedSlots,
        reservedSlots,
        availableSlots,
        occupancyRate: totalSlots > 0 ? ((occupiedSlots / totalSlots) * 100).toFixed(1) : '0',
        slots: zone.slots,
      };
    });

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch real-time status' });
  }
};

export const getNavigation = async (req: Request, res: Response): Promise<void> => {
  try {
    const slot = await prisma.parkingSlot.findUnique({
      where: { id: req.params.slotId },
      include: { zone: true },
    });

    if (!slot) {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }

    // Simulated navigation data
    const navigation = {
      slot: {
        id: slot.id,
        number: slot.slotNumber,
        floor: slot.floor,
        type: slot.slotType,
        position: { x: slot.posX, y: slot.posY },
      },
      zone: {
        id: slot.zone.id,
        name: slot.zone.name,
        latitude: slot.zone.latitude,
        longitude: slot.zone.longitude,
      },
      directions: [
        { step: 1, instruction: `Enter through the main gate`, distance: '50m' },
        { step: 2, instruction: `Head towards ${slot.zone.name}`, distance: '120m' },
        { step: 3, instruction: `Go to Floor ${slot.floor}`, distance: '30m' },
        { step: 4, instruction: `Your slot is ${slot.slotNumber}`, distance: '15m' },
      ],
      estimatedTime: '3 minutes',
    };

    res.json(navigation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get navigation' });
  }
};
