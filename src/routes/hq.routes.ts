import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  stockReport,
} from '../controllers/hq.controller';

const router: Router = Router();

router.use(authMiddleware);

router.use(allowRoles('HQ_ADMIN'));


router.post('/products', createProduct);

router.patch('/products/:id', updateProduct);


router.delete('/products/:id', deleteProduct);


router.get('/stock-report', stockReport);

export default router;
