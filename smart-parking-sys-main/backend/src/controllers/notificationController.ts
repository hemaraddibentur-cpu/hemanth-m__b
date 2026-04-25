import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { unreadOnly } = req.query;
    const where: any = { userId: req.user!.id };
    if (unreadOnly === 'true') where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id, isRead: false },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications' });
  }
};
