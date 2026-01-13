import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
/**
 * Create a new product (HQ only)
 */
export const createProduct = async (req, res) => {
    const { name, base_price, category } = req.body;
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    const { data, error: err } = await supabase.from('products').insert({
        hq_id: req.user.hq_id,
        name,
        base_price,
        category,
    });
    if (err)
        return error(res, err.message);
    return success(res, data, SuccessMessage.PRODUCT_CREATED);
};
/**
 * Update a product owned by HQ
 */
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    const updateData = req.body;
    const { data, error: err } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .eq('hq_id', req.user.hq_id);
    if (err)
        return error(res, err.message);
    return success(res, data, SuccessMessage.PRODUCT_UPDATED);
};
/**
 * Soft delete (disable) a product
 */
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const { error: err } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
    if (err)
        return error(res, err.message);
    return success(res, null, SuccessMessage.PRODUCT_DISABLED);
};
/**
 * Get HQ-wide stock report (RPC)
 */
export const stockReport = async (_req, res) => {
    const { data, error: err } = await supabase.rpc('hq_stock_report');
    if (err)
        return error(res, err.message);
    return success(res, data, SuccessMessage.STOCK_REPORT_RETRIEVED);
};
