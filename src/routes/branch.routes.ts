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

const router = Router();

router.use(authMiddleware as RequestHandler);
router.use(allowRoles('BRANCH_MANAGER') as RequestHandler);

router.patch('/products/:id/stock', validate(stockUpdateSchema), updateStock as RequestHandler);
router.patch('/products/:id/discount', validate(discountUpdateSchema), updateDiscount as RequestHandler);
router.get('/menu', getMenu as RequestHandler);

export default router;

