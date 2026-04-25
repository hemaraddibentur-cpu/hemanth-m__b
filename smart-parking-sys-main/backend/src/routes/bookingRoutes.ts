import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as bookingController from '../controllers/bookingController';

const router = Router();

router.get('/availability', bookingController.checkAvailability);

router.use(authenticate);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBooking);
router.put('/:id/cancel', bookingController.cancelBooking);
router.get('/:id/qrcode', bookingController.getBookingQR);

export default router;
