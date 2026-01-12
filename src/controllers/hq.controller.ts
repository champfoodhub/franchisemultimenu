import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';

declare global {
  namespace Express {
    interface User {
      hq_id?: string;
    }
  }
}

type AuthenticatedRequest = Request;

/**
 * Create a new product (HQ only)
 */
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  const { name, base_price, category } = req.body;

  if (!req.user?.hq_id) {
    return error(res, 'HQ not assigned', 403);
  }

  const { data, error: err } = await supabase.from('products').insert({
    hq_id: req.user.hq_id,
    name,
    base_price,
    category,
  });

  if (err) return error(res, err.message);

  return success(res, data, 'Product created');
};

/**
 * Update a product owned by HQ
 */
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;

  if (!req.user?.hq_id) {
    return error(res, 'HQ not assigned', 403);
  }

  const { data, error: err } = await supabase
    .from('products')
    .update(req.body)
    .eq('id', id)
    .eq('hq_id', req.user.hq_id);

  if (err) return error(res, err.message);

  return success(res, data, 'Product updated');
};

/**
 * Soft delete (disable) a product
 */
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;

  const { error: err } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (err) return error(res, err.message);

  return success(res, null, 'Product disabled');
};

/**
 * Get HQ-wide stock report (RPC)
 */
export const stockReport = async (
  _req: Request,
  res: Response
): Promise<Response | void> => {
  const { data, error: err } = await supabase.rpc('hq_stock_report');

  if (err) return error(res, err.message);

  return success(res, data);
};
