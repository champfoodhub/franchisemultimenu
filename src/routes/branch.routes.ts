import { Router } from 'express';
import {
  updateStock,
  updateDiscount,
  getMenu,
  getBranch,
  getBranchProducts,
  updateBranchMenuItem,
} from '../controllers/branch.controller';
import { authMiddleware, requireBranch } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  stockUpdateSchema,
  discountUpdateSchema,
  branchMenuUpdateSchema,
} from '../validators/schemas';

const router = Router();

// All routes require authentication and BRANCH role
router.use(authMiddleware);
router.use(requireBranch);

// Branch Routes

// Get branch info
router.get('/branch', getBranch);

// Get branch products with stock
router.get('/products', getBranchProducts);

// Stock management
router.put('/stock/:id', validate(stockUpdateSchema), updateStock);
router.put('/discount/:id', validate(discountUpdateSchema), updateDiscount);

// Menu routes
router.get('/menu', getMenu);
router.put('/menu/:id', validate(branchMenuUpdateSchema), updateBranchMenuItem);

export default router;

