import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/authController';

const router = Router();

router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
