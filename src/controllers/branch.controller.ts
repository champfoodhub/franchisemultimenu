import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';

/**
 * Custom request type to include authenticated user
 */
type AuthenticatedRequest = Request & {
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
): Promise<Response | void> => {
  const { id } = req.params;
  const { stock } = req.body;

  if (!req.user?.branch_id) {
    return error(res, 'Branch not assigned', 403);
  }

  const { error: err } = await supabase
    .from('branch_products')
    .update({ stock })
    .eq('product_id', id)
    .eq('branch_id', req.user.branch_id);

  if (err) return error(res, err.message);

  return success(res, null, 'Stock updated');
};

/**
 * Update product discount for a branch
 */
export const updateDiscount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;
  const { discount } = req.body;

  if (!req.user?.branch_id) {
    return error(res, 'Branch not assigned', 403);
  }

  if (discount > 30) {
    return error(res, 'Discount exceeds limit', 400);
  }

  const { error: err } = await supabase
    .from('branch_products')
    .update({ discount })
    .eq('product_id', id)
    .eq('branch_id', req.user.branch_id);

  if (err) return error(res, err.message);

  return success(res, null, 'Discount updated');
};

/**
 * Get branch-specific menu using Supabase RPC
 */
export const getMenu = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  if (!req.user?.branch_id) {
    return error(res, 'Branch not assigned', 403);
  }

  const { data, error: err } = await supabase.rpc('branch_menu', {
    branch_id_input: req.user.branch_id,
  });

  if (err) return error(res, err.message);

  return success(res, data, 'Menu retrieved');
};
