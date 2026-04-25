import { Request, Response } from 'express';
import QRCode from 'qrcode';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../websocket';

export const checkAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, zone, vehicleType } = req.query;

    const where: any = { isActive: true };
    if (zone) where.zoneId = zone as string;

    const slots = await prisma.parkingSlot.findMany({
      where,
      include: {
        zone: { select: { id: true, name: true, hourlyRate: true, dailyRate: true, color: true } },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'ACTIVE'] },
            ...(date ? {
              startTime: { lte: new Date(date as string + 'T23:59:59') },
              endTime: { gte: new Date(date as string + 'T00:00:00') },
            } : {}),
          },
          select: { id: true, startTime: true, endTime: true, status: true },
        },
      },
      orderBy: [{ zone: { name: 'asc' } }, { slotNumber: 'asc' }],
    });

    const result = slots.map((slot) => ({
      ...slot,
      isAvailable: !slot.isOccupied && slot.bookings.length === 0,
    }));

    res.json(result);
  } catch (error) {
    logger.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slotId, vehicleId, startTime, endTime, notes } = req.body;

    // Validate vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: req.user!.id, isActive: true },
    });
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    // Check slot availability
    const slot = await prisma.parkingSlot.findUnique({
      where: { id: slotId },
      include: { zone: true },
    });
    if (!slot || !slot.isActive) {
      res.status(404).json({ error: 'Parking slot not found' });
      return;
    }

    // Check for conflicts
    const conflicting = await prisma.booking.findFirst({
      where: {
        slotId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
      },
    });

    if (conflicting) {
      res.status(409).json({ error: 'Slot is already booked for the selected time' });
      return;
    }

    // Calculate amount
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const totalAmount = hours * slot.zone.hourlyRate;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        slotId,
        vehicleId,
        startTime: start,
        endTime: end,
        totalAmount,
        status: 'CONFIRMED',
        notes,
      },
      include: {
        slot: { include: { zone: true } },
        vehicle: true,
      },
    });

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId: booking.id,
      slotNumber: slot.slotNumber,
      zoneName: slot.zone.name,
      vehiclePlate: vehicle.licensePlate,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
    const qrCode = await QRCode.toDataURL(qrData);
    await prisma.booking.update({ where: { id: booking.id }, data: { qrCode } });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Booking Confirmed',
        message: `Your parking slot ${slot.slotNumber} in ${slot.zone.name} is booked from ${start.toLocaleString()} to ${end.toLocaleString()}.`,
        type: 'success',
        link: `/bookings/${booking.id}`,
      },
    });

    // Emit real-time update
    try {
      const io = getIO();
      io.emit('slot-update', { slotId, isOccupied: false, isBooked: true, zoneId: slot.zoneId });
      io.emit('booking-update', { type: 'new', booking: { ...booking, qrCode } });
    } catch (e) { /* WebSocket not initialized */ }

    logger.info(`Booking created: ${booking.id} by user ${req.user!.id}`);
    res.status(201).json({ ...booking, qrCode });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId: req.user!.id };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          slot: { include: { zone: { select: { name: true, color: true } } } },
          vehicle: { select: { licensePlate: true, vehicleType: true, make: true, model: true, color: true } },
          payments: { select: { id: true, amount: true, status: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        slot: { include: { zone: true } },
        vehicle: true,
        payments: true,
        entryLogs: { include: { exitLog: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      res.status(400).json({ error: 'Cannot cancel this booking' });
      return;
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    });

    // Release slot
    await prisma.parkingSlot.update({
      where: { id: booking.slotId },
      data: { isOccupied: false, isReserved: false },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Booking Cancelled',
        message: `Your booking has been cancelled. A refund will be processed if applicable.`,
        type: 'warning',
      },
    });

    try {
      const io = getIO();
      io.emit('slot-update', { slotId: booking.slotId, isOccupied: false, isBooked: false });
    } catch (e) { /* WebSocket not initialized */ }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

export const getBookingQR = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      select: { qrCode: true, id: true, status: true },
    });

    if (!booking || !booking.qrCode) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }

    res.json({ qrCode: booking.qrCode, bookingId: booking.id, status: booking.status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
};
