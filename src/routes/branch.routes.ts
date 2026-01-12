import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import {
  updateStock,
  updateDiscount,
  getMenu,
} from '../controllers/branch.controller';

const router = Router();

router.use(authMiddleware);
router.use(allowRoles('BRANCH_MANAGER'));

router.patch('/products/:id/stock', async (req, res, next) => {
  try {
    await updateStock(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch('/products/:id/discount', async (req, res, next) => {
  try {
    await updateDiscount(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/menu', async (req, res, next) => {
  try {
    await getMenu(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
