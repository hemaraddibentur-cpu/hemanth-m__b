import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/analytics/usage', adminController.getUsageAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.post('/zones', adminController.createZone);
router.put('/zones/:id', adminController.updateZone);
router.get('/violations', adminController.getViolations);
router.post('/violations', adminController.createViolation);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);

export default router;
