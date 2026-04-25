import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../config/logger';

let io: Server;

export const initializeWebSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('join-zone', (zoneId: string) => {
      socket.join(`zone-${zoneId}`);
      logger.debug(`Socket ${socket.id} joined zone-${zoneId}`);
    });

    socket.on('leave-zone', (zoneId: string) => {
      socket.leave(`zone-${zoneId}`);
    });

    socket.on('join-dashboard', () => {
      socket.join('dashboard');
      logger.debug(`Socket ${socket.id} joined dashboard`);
    });

    socket.on('join-security', () => {
      socket.join('security');
      logger.debug(`Socket ${socket.id} joined security room`);
    });

    socket.on('request-status', async () => {
      // Clients can request current status
      socket.emit('status-requested');
    });

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`WebSocket error for ${socket.id}:`, error);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
};
