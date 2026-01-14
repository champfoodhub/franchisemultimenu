import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import {
  getProducts,
  getBranches,
  getStock,
  createProduct,
  updateProduct,
  deleteProduct,
  stockReport,
} from '../controllers/hq.controller';
import { createProductSchema, updateProductSchema } from '../validators/schemas';

const router: Router = Router();

router.use(authMiddleware);
router.use(allowRoles('HQ'));

// Product routes
router.get('/products', getProducts);
router.post('/products', validate(createProductSchema), createProduct);
router.patch('/products/:id', validate(updateProductSchema), updateProduct);
router.delete('/products/:id', deleteProduct);

// Branch routes
router.get('/branches', getBranches);

// Stock routes
router.get('/stock', getStock);
router.get('/stock-report', stockReport);

export default router;

