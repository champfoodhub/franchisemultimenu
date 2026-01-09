import express from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// HQ updates a menu item
router.put('/:id', authMiddleware, async (req, res) => {
  const menuId = req.params.id;
  const { name, price, category, is_active } = req.body;

  try {
    const { data, error } = await supabase
      .from('menu')
      .update({ name, price, category, is_active })
      .eq('id', menuId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Menu item updated successfully', menu: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// HQ deletes a menu item
router.delete('/:id', authMiddleware, async (req, res) => {
  const menuId = req.params.id;

  try {
    const { error } = await supabase
      .from('menu')
      .delete()
      .eq('id', menuId);

    if (error) throw error;

    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Branch updates stock / discount only
router.patch('/:id/branch', authMiddleware, async (req, res) => {
  const menuId = req.params.id;
  const { stock, discount_percent } = req.body;

  try {
    const { data, error } = await supabase
      .from('branch_menu')
      .update({ stock, discount_percent })
      .eq('menu_id', menuId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Branch menu updated', branch_menu: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
