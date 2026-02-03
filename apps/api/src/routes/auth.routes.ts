import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { authLimiter, registerLimiter } from '@/middleware/rate-limit.middleware';

const router = Router();

router.get('/health', authController.health.bind(authController));
router.post('/register', registerLimiter, authController.register.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;
