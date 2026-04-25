import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as vehicleController from '../controllers/vehicleController';

const router = Router();

router.use(authenticate);

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/vehicles', vehicleController.addVehicle);
router.get('/vehicles', vehicleController.getVehicles);
router.delete('/vehicles/:id', vehicleController.deleteVehicle);

export default router;
