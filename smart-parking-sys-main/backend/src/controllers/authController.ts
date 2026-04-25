import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (user: { id: string; email: string; role: string; name: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as string }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as string }
  );
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, role, department, employeeId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || 'STUDENT',
        department,
        employeeId,
        verificationToken,
        isVerified: true, // Auto-verify in dev
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role, name: user.name });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to Smart Parking!',
        message: `Hello ${user.name}, your account has been created successfully. Start by registering your vehicle.`,
        type: 'info',
      },
    });

    logger.info(`User registered: ${user.email}`);
    res.status(201).json({ user, ...tokens });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account has been suspended' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role, name: user.name });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

    logger.info(`User logged in: ${user.email}`);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        department: user.department,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.refreshSecret) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== token) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role, name: user.name });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      res.json({ message: 'If the email exists, a reset link will be sent.' });
      return;
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // In production, send email here
    logger.info(`Password reset requested for: ${email}, token: ${resetToken}`);
    res.json({ message: 'If the email exists, a reset link will be sent.', resetToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, name: true, phone: true, role: true,
        department: true, employeeId: true, rfidTag: true, avatarUrl: true,
        isVerified: true, createdAt: true, updatedAt: true,
        _count: { select: { vehicles: true, bookings: true } },
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, department } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone, department },
      select: {
        id: true, email: true, name: true, phone: true, role: true,
        department: true, avatarUrl: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
