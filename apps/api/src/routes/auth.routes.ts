import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

router.get('/health', authController.health.bind(authController));
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;
