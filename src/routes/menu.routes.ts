import { Router } from 'express';
import { authMiddleware, requireHQ, requireBranch } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  updateMenuItem,
  deleteMenuItem,
  updateBranchMenu,
  createMenuItem,
  getAllMenuItems,
} from '../controllers/menu.controller';
import { menuItemUpdateSchema, branchMenuUpdateSchema, createMenuItemSchema } from '../validators/schemas';

const router: Router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all menu items (public for authenticated users)
router.get('/', getAllMenuItems);

// HQ routes - create menu item
router.post('/', requireHQ, validate(createMenuItemSchema), createMenuItem);

// HQ routes - update menu item
router.put('/:id', requireHQ, validate(menuItemUpdateSchema), updateMenuItem);

// HQ routes - delete menu item
router.delete('/:id', requireHQ, deleteMenuItem);

// Branch routes - update stock/discount
router.patch('/:id/branch', requireBranch, validate(branchMenuUpdateSchema), updateBranchMenu);

export default router;

