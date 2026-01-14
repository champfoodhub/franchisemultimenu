import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { StockUpdateInput, DiscountUpdateInput } from '../validators/schemas';

/**
 * Update product stock for a branch
 */
export const updateStock = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { stock } = req.body as StockUpdateInput;
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  const { error: err } = await supabase
    .from('branch_products')
    .update({ stock })
    .eq('product_id', id)
    .eq('branch_id', branchId);

  if (err) return error(res, err.message);

  return success(res, null, SuccessMessage.STOCK_UPDATED);
};

/**
 * Update product discount for a branch
 */
export const updateDiscount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { discount } = req.body as DiscountUpdateInput;
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  const { error: err } = await supabase
    .from('branch_products')
    .update({ discount })
    .eq('product_id', id)
    .eq('branch_id', branchId);

  if (err) return error(res, err.message);

  return success(res, null, SuccessMessage.DISCOUNT_UPDATED);
};

/**
 * Get branch-specific menu using Supabase RPC
 */
export const getMenu = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  const { data, error: err } = await supabase.rpc('branch_menu', {
    branch_id_input: branchId,
  });

  if (err) return error(res, err.message);

  return success(res, data, SuccessMessage.MENU_RETRIEVED);
};

