import { Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth';

export const addVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { licensePlate, vehicleType, make, model, color } = req.body;

    const existing = await prisma.vehicle.findUnique({ where: { licensePlate } });
    if (existing) {
      res.status(409).json({ error: 'License plate already registered' });
      return;
    }

    const vehicleCount = await prisma.vehicle.count({ where: { userId: req.user!.id } });
    if (vehicleCount >= 3) {
      res.status(400).json({ error: 'Maximum 3 vehicles allowed per user' });
      return;
    }

    const rfidSticker = `RFID-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: req.user!.id,
        licensePlate: licensePlate.toUpperCase(),
        vehicleType,
        make,
        model,
        color,
        rfidSticker,
      },
    });

    logger.info(`Vehicle registered: ${vehicle.licensePlate} by user ${req.user!.id}`);
    res.status(201).json(vehicle);
  } catch (error) {
    logger.error('Add vehicle error:', error);
    res.status(500).json({ error: 'Failed to register vehicle' });
  }
};

export const getVehicles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.user!.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: { vehicleId: id, status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] } },
    });

    if (activeBookings > 0) {
      res.status(400).json({ error: 'Cannot delete vehicle with active bookings' });
      return;
    }

    await prisma.vehicle.update({ where: { id }, data: { isActive: false } });
    res.json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};
