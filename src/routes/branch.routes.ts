import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import {
  updateStock,
  updateDiscount,
  getMenu,
} from '../controllers/branch.controller';
import { stockUpdateSchema, discountUpdateSchema } from '../validators/schemas';
import { getTimeBasedMenu } from '../controllers/schedule.controller';
import { branchMenuQuerySchema } from '../validators/schedule.schemas';

const router = Router();

router.use(authMiddleware as RequestHandler);
router.use(allowRoles('BRANCH') as RequestHandler);

// Product management endpoints
router.patch('/products/:id/stock', validate(stockUpdateSchema), updateStock as RequestHandler);
router.patch('/products/:id/discount', validate(discountUpdateSchema), updateDiscount as RequestHandler);

// Menu endpoints
router.get('/menu', getMenu as RequestHandler);

// Time-based menu endpoint
// Supports query params: ?time=12:30&date=2024-01-15&schedule_type=TIME_SLOT
router.get(
  '/menu/time-based',
  validate(branchMenuQuerySchema) as RequestHandler,
  getTimeBasedMenu as RequestHandler
);

export default router;

