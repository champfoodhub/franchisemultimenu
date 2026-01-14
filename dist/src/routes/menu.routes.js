import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { updateMenuItem, deleteMenuItem, updateBranchMenu, } from '../controllers/menu.controller';
import { menuItemUpdateSchema, branchMenuUpdateSchema } from '../validators/schemas';
const router = Router();
// HQ routes - update menu item
router.put('/:id', authMiddleware, validate(menuItemUpdateSchema), updateMenuItem);
// HQ routes - delete menu item
router.delete('/:id', authMiddleware, deleteMenuItem);
// Branch routes - update stock/discount
router.patch('/:id/branch', authMiddleware, validate(branchMenuUpdateSchema), updateBranchMenu);
export default router;
