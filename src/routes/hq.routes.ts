import { Router } from 'express';
import {
  getProducts,
  getBranches,
  getStock,
  createProduct,
  updateProduct,
  deleteProduct,
  stockReport,
} from '../controllers/hq.controller';
import { authMiddleware, requireHQ } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/schemas';

const router = Router();

// All routes require authentication and HQ role
router.use(authMiddleware);
router.use(requireHQ);

// HQ Routes

// Product Routes (HQ only)
router.get('/products', getProducts);
router.post('/products', validate(createProductSchema), createProduct);
router.put('/products/:id', validate(updateProductSchema), updateProduct);
router.delete('/products/:id', deleteProduct);

// Branch Routes (HQ only)
router.get('/branches', getBranches);

// Stock Routes (HQ only)
router.get('/stock', getStock);
router.get('/stock/report', stockReport);

export default router;

