import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth';

export const initiatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, method, description } = req.body;

    // Simulate payment gateway
    const transactionId = `TXN-${Date.now()}-${uuidv4().split('-')[0]}`;

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: req.user!.id,
        amount,
        method: method || 'UPI',
        transactionId,
        status: 'PENDING',
        description: description || 'Parking payment',
      },
    });

    // Simulate payment processing (auto-complete for demo)
    setTimeout(async () => {
      try {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' },
        });
        logger.info(`Payment completed: ${payment.id}`);
      } catch (e) {
        logger.error('Payment auto-completion error:', e);
      }
    }, 2000);

    res.status(201).json({
      payment,
      gatewayUrl: `https://payment-gateway.example.com/pay/${transactionId}`,
      message: 'Payment initiated. In demo mode, payment will auto-complete in 2 seconds.',
    });
  } catch (error) {
    logger.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: { booking: true },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    // In demo mode, mark as completed
    if (payment.status === 'PENDING') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Payment Successful',
        message: `Payment of ₹${payment.amount} via ${payment.method} completed successfully. Transaction ID: ${transactionId}`,
        type: 'success',
      },
    });

    res.json({ ...payment, status: 'COMPLETED', verified: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: req.user!.id },
        include: {
          booking: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              slot: { select: { slotNumber: true, zone: { select: { name: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.payment.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};
