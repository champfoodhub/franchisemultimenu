import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { CreateProductInput, UpdateProductInput } from '../validators/schemas';

type AuthenticatedRequest = Request;

/**
 * Create a new product (HQ only)
 */
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { name, base_price, category } = req.body as CreateProductInput;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  const { data, error: err } = await supabase.from('products').insert({
    hq_id: req.user.hq_id,
    name,
    base_price,
    category,
  });

  if (err) return error(res, err.message);

  return success(res, data, SuccessMessage.PRODUCT_CREATED);
};

/**
 * Update a product owned by HQ
 */
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  const updateData = req.body as UpdateProductInput;

  const { data, error: err } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .eq('hq_id', req.user.hq_id);

  if (err) return error(res, err.message);

  return success(res, data, SuccessMessage.PRODUCT_UPDATED);
};

/**
 * Soft delete (disable) a product
 */
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const { error: err } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (err) return error(res, err.message);

  return success(res, null, SuccessMessage.PRODUCT_DISABLED);
};

/**
 * Get HQ-wide stock report (RPC)
 */
export const stockReport = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const { data, error: err } = await supabase.rpc('hq_stock_report');

  if (err) return error(res, err.message);

  return success(res, data, SuccessMessage.STOCK_REPORT_RETRIEVED);
};

