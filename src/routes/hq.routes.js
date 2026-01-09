import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  stockReport,
} from '../controllers/hq.controller.js';

const router = express.Router();

router.use(authMiddleware);
router.use(allowRoles('HQ_ADMIN'));

router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/stock-report', stockReport);

export default router;
