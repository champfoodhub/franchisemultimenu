import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginSchema } from '../validators/schemas';
const router = Router();
// Auth Routes
router.post('/login', validate(loginSchema), login);
export default router;
