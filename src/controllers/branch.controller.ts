import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { StockUpdateInput, DiscountUpdateInput } from '../validators/schemas';

/**
 * Custom request type to include authenticated user
 */
export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    branch_id: string;
    role?: string;
  };
};

/**
 * Update product stock for a branch
 */
export const updateStock = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { stock } = req.body as StockUpdateInput;

  if (!req.user?.branch_id) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  const { error: err } = await supabase
    .from('branch_products')
    .update({ stock })
    .eq('product_id', id)
    .eq('branch_id', req.user.branch_id);

  if (err) return error(res, err.message);

  return success(res, null, SuccessMessage.STOCK_UPDATED);
};

/**
 * Update product discount for a branch
 */
export const updateDiscount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { discount } = req.body as DiscountUpdateInput;

  if (!req.user?.branch_id) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  const { error: err } = await supabase
    .from('branch_products')
    .update({ discount })
    .eq('product_id', id)
    .eq('branch_id', req.user.branch_id);

  if (err) return error(res, err.message);

  return success(res, null, SuccessMessage.DISCOUNT_UPDATED);
};

/**
 * Get branch-specific menu using Supabase RPC
 */
export const getMenu = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user?.branch_id) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  const { data, error: err } = await supabase.rpc('branch_menu', {
    branch_id_input: req.user.branch_id,
  });

  if (err) return error(res, err.message);

  return success(res, data, SuccessMessage.MENU_RETRIEVED);
};

