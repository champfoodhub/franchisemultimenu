import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

/**
 * HQ updates a menu item
 */
router.put(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response): Promise<Response> => {
    const { id: menuId } = req.params;
    const { name, price, category, is_active } = req.body;

    try {
      const { data, error } = await supabase
        .from('menu')
        .update({ name, price, category, is_active })
        .eq('id', menuId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      return res.json({
        message: 'Menu item updated successfully',
        menu: data,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * HQ deletes a menu item
 */
router.delete(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response): Promise<Response> => {
    const { id: menuId } = req.params;

    try {
      const { error } = await supabase
        .from('menu')
        .delete()
        .eq('id', menuId);

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      return res.json({ message: 'Menu item deleted successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * Branch updates stock / discount only
 */
router.patch(
  '/:id/branch',
  authMiddleware,
  async (req: Request, res: Response): Promise<Response> => {
    const { id: menuId } = req.params;
    const { stock, discount_percent } = req.body;

    try {
      const { data, error } = await supabase
        .from('branch_menu')
        .update({ stock, discount_percent })
        .eq('menu_id', menuId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      return res.json({
        message: 'Branch menu updated',
        branch_menu: data,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
