import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as paymentController from '../controllers/paymentController';

const router = Router();

router.use(authenticate);

router.post('/initiate', paymentController.initiatePayment);
router.post('/verify', paymentController.verifyPayment);
router.get('/history', paymentController.getPaymentHistory);

export default router;
