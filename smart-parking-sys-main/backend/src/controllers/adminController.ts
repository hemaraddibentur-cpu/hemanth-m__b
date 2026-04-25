import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../websocket';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalUsers,
      totalVehicles,
      totalBookings,
      todayBookings,
      activeBookings,
      totalRevenue,
      todayRevenue,
      totalViolations,
      openViolations,
      zones,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.booking.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
      prisma.violation.count(),
      prisma.violation.count({ where: { status: 'OPEN' } }),
      prisma.parkingZone.findMany({
        where: { isActive: true },
        include: { slots: { where: { isActive: true } } },
      }),
    ]);

    const totalSlots = zones.reduce((sum, z) => sum + z.slots.length, 0);
    const occupiedSlots = zones.reduce((sum, z) => sum + z.slots.filter((s) => s.isOccupied).length, 0);

    res.json({
      users: { total: totalUsers },
      vehicles: { total: totalVehicles },
      bookings: { total: totalBookings, today: todayBookings, active: activeBookings },
      revenue: { total: totalRevenue._sum.amount || 0, today: todayRevenue._sum.amount || 0 },
      violations: { total: totalViolations, open: openViolations },
      parking: {
        totalSlots,
        occupiedSlots,
        availableSlots: totalSlots - occupiedSlots,
        occupancyRate: totalSlots > 0 ? ((occupiedSlots / totalSlots) * 100).toFixed(1) : '0',
      },
      zones: zones.map((z) => ({
        id: z.id,
        name: z.name,
        totalSlots: z.slots.length,
        occupied: z.slots.filter((s) => s.isOccupied).length,
        available: z.slots.filter((s) => !s.isOccupied).length,
      })),
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getUsageAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '7d' } = req.query;
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, status: true, slot: { select: { zone: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const dailyData: Record<string, { date: string; bookings: number; cancellations: number }> = {};
    const zoneData: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dailyData[key] = { date: key, bookings: 0, cancellations: 0 };
    }

    bookings.forEach((b) => {
      const key = b.createdAt.toISOString().split('T')[0];
      if (dailyData[key]) {
        dailyData[key].bookings++;
        if (b.status === 'CANCELLED') dailyData[key].cancellations++;
      }
      const zoneName = b.slot.zone.name;
      zoneData[zoneName] = (zoneData[zoneName] || 0) + 1;
    });

    // Peak hours (simulated)
    const peakHours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      occupancy: Math.round(
        i >= 8 && i <= 18
          ? 50 + Math.random() * 40
          : 10 + Math.random() * 20
      ),
    }));

    res.json({
      daily: Object.values(dailyData),
      byZone: Object.entries(zoneData).map(([name, count]) => ({ name, bookings: count })),
      peakHours,
      summary: {
        totalBookings: bookings.length,
        avgDaily: (bookings.length / days).toFixed(1),
        cancellationRate: bookings.length > 0
          ? ((bookings.filter((b) => b.status === 'CANCELLED').length / bookings.length) * 100).toFixed(1)
          : '0',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage analytics' });
  }
};

export const getRevenueAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await prisma.payment.findMany({
      where: { createdAt: { gte: startDate }, status: 'COMPLETED' },
      select: { amount: true, method: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyRevenue: Record<string, number> = {};
    const methodBreakdown: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dailyRevenue[d.toISOString().split('T')[0]] = 0;
    }

    payments.forEach((p) => {
      const key = p.createdAt.toISOString().split('T')[0];
      if (dailyRevenue[key] !== undefined) dailyRevenue[key] += p.amount;
      methodBreakdown[p.method] = (methodBreakdown[p.method] || 0) + p.amount;
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      daily: Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount })),
      byMethod: Object.entries(methodBreakdown).map(([method, amount]) => ({ method, amount })),
      summary: {
        totalRevenue,
        avgDaily: (totalRevenue / days).toFixed(2),
        totalTransactions: payments.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

export const createZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, totalSlots, hourlyRate, dailyRate, monthlyRate, rules, latitude, longitude, color } = req.body;

    const zone = await prisma.parkingZone.create({
      data: { name, description, totalSlots, hourlyRate, dailyRate, monthlyRate, rules, latitude, longitude, color },
    });

    // Create slots for the zone
    const slots = Array.from({ length: totalSlots }, (_, i) => ({
      zoneId: zone.id,
      slotNumber: `${name.charAt(0).toUpperCase()}${(i + 1).toString().padStart(3, '0')}`,
      slotType: 'REGULAR' as const,
      posX: (i % 10) * 60,
      posY: Math.floor(i / 10) * 80,
    }));

    await prisma.parkingSlot.createMany({ data: slots });

    logger.info(`Zone created: ${zone.name} with ${totalSlots} slots`);
    res.status(201).json(zone);
  } catch (error) {
    logger.error('Create zone error:', error);
    res.status(500).json({ error: 'Failed to create zone' });
  }
};

export const updateZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const zone = await prisma.parkingZone.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update zone' });
  }
};

export const getViolations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const violations = await prisma.violation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        vehicle: { select: { licensePlate: true, vehicleType: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
};

export const createViolation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, vehicleId, type, description, fineAmount } = req.body;

    const violation = await prisma.violation.create({
      data: { userId, vehicleId, type, description, fineAmount, status: 'FINE_ISSUED' },
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { licensePlate: true } },
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Parking Violation',
        message: `A ${type} violation has been issued. Fine: ₹${fineAmount}. ${description || ''}`,
        type: 'error',
      },
    });

    try {
      const io = getIO();
      io.emit('violation-alert', violation);
    } catch (e) { /* WebSocket not initialized */ }

    res.status(201).json(violation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create violation' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          department: true, isActive: true, isVerified: true, createdAt: true,
          _count: { select: { vehicles: true, bookings: true, violations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, pagination: { total, page: parseInt(page as string), limit: parseInt(limit as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
    });

    res.json({ message: `User ${user.isActive ? 'suspended' : 'activated'} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};
