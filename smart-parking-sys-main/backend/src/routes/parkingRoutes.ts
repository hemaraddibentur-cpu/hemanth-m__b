import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as parkingController from '../controllers/parkingController';

const router = Router();

router.get('/real-time-status', parkingController.getRealTimeStatus);
router.get('/navigation/:slotId', parkingController.getNavigation);

router.use(authenticate);

router.post('/entry', authorize('ADMIN', 'SECURITY'), parkingController.processEntry);
router.post('/exit', authorize('ADMIN', 'SECURITY'), parkingController.processExit);

export default router;
