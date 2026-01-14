import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { CreateProductInput, UpdateProductInput } from '../validators/schemas';

/**
 * Get all products for HQ
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const hqId = req.user?.hq_id;
  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  const { data, error: err } = await supabase
    .from('products')
    .select('*')
    .eq('hq_id', hqId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (err) return error(res, err.message);

  return success(res, data, SuccessMessage.PRODUCT_RETRIEVED);
};

/**
 * Get all branches for HQ
 */
export const getBranches = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const hqId = req.user?.hq_id;
  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  const { data, error: err } = await supabase
    .from('branches')
    .select('*')
    .eq('hq_id', hqId)
    .order('name', { ascending: true });

  if (err) return error(res, err.message);

  return success(res, data, SuccessMessage.BRANCH_RETRIEVED);
};

/**
 * Get all stock records for HQ
 */
export const getStock = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const hqId = req.user?.hq_id;
  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  const { data, error: err } = await supabase
    .from('branch_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (err) return error(res, err.message);

  // Map quantity to stock for frontend compatibility
  const stockWithMappedField = data?.map((item: any) => ({
    ...item,
    stock: item.quantity,
  })) || [];

  return success(res, stockWithMappedField, SuccessMessage.STOCK_REPORT_RETRIEVED);
};

/**
 * Create a new product (HQ only)
 */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, base_price, category } = req.body as CreateProductInput;
  const hqId = req.user?.hq_id;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  const { data, error: err } = await supabase.from('products').insert({
    hq_id: hqId,
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
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const hqId = req.user?.hq_id;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  const updateData = req.body as UpdateProductInput;

  const { data, error: err } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .eq('hq_id', hqId);

  if (err) return error(res, err.message);

  return success(res, data, SuccessMessage.PRODUCT_UPDATED);
};

/**
 * Soft delete (disable) a product
 */
export const deleteProduct = async (
  req: Request,
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

