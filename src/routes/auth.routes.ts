import { Router } from 'express';
import { login, getUser, logout } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginSchema } from '../validators/schemas';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Auth Routes
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', authMiddleware, getUser);
router.post('/logout', authMiddleware, logout);

export default router;

