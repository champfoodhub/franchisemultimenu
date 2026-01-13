import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { SuccessMessage } from '../utils/errormessage';
import { MenuItemUpdateInput, BranchMenuUpdateInput } from '../validators/schemas';

/**
 * Update a menu item (HQ only)
 */
export const updateMenuItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: menuId } = req.params;
  const { name, price, category, is_active } = req.body as MenuItemUpdateInput;

  const { data, error: err } = await supabase
    .from('menu')
    .update({ name, price, category, is_active })
    .eq('id', menuId)
    .select()
    .single();

  if (err) {
    return error(res, err.message, 400);
  }

  return success(res, data, SuccessMessage.MENU_ITEM_UPDATED_SUCCESSFULLY);
};

/**
 * Delete a menu item (HQ only)
 */
export const deleteMenuItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: menuId } = req.params;

  const { error: err } = await supabase
    .from('menu')
    .delete()
    .eq('id', menuId);

  if (err) {
    return error(res, err.message, 400);
  }

  return success(res, null, SuccessMessage.MENU_ITEM_DELETED_SUCCESSFULLY);
};

/**
 * Update branch-specific menu (stock/discount)
 */
export const updateBranchMenu = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: menuId } = req.params;
  const { stock, discount_percent } = req.body as BranchMenuUpdateInput;

  const { data, error: err } = await supabase
    .from('branch_menu')
    .update({ stock, discount_percent })
    .eq('menu_id', menuId)
    .select()
    .single();

  if (err) {
    return error(res, err.message, 400);
  }

  return success(res, data, SuccessMessage.BRANCH_MENU_UPDATED);
};

