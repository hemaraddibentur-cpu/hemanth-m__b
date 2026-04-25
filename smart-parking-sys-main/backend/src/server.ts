import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initializeWebSocket } from './websocket';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import bookingRoutes from './routes/bookingRoutes';
import parkingRoutes from './routes/parkingRoutes';
import adminRoutes from './routes/adminRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);
});

export default app;
