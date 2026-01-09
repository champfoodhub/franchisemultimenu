import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import {
  updateStock,
  updateDiscount,
  getMenu,
} from '../controllers/branch.controller.js';

const router = express.Router();

router.use(authMiddleware);
router.use(allowRoles('BRANCH_MANAGER'));

router.patch('/products/:id/stock', updateStock);
router.patch('/products/:id/discount', updateDiscount);
router.get('/menu', getMenu);

export default router;
