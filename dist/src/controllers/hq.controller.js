import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
/**
 * Get all products for HQ
 */
export const getProducts = async (req, res) => {
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
    if (err)
        return error(res, err.message);
    return success(res, data, SuccessMessage.PRODUCT_RETRIEVED);
};
/**
 * Get all branches for HQ
 */
export const getBranches = async (req, res) => {
    const hqId = req.user?.hq_id;
    if (!hqId) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    const { data, error: err } = await supabase
        .from('branches')
        .select('*')
        .eq('hq_id', hqId)
        .order('name', { ascending: true });
    if (err)
        return error(res, err.message);
    return success(res, data, SuccessMessage.BRANCH_RETRIEVED);
};
/**
 * Get all stock records for HQ
 */
export const getStock = async (req, res) => {
    const hqId = req.user?.hq_id;
    if (!hqId) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    const { data, error: err } = await supabase
        .from('branch_products')
        .select('*')
        .order('created_at', { ascending: false });
    if (err)
        return error(res, err.message);
    // Map quantity to stock for frontend compatibility
    const stockWithMappedField = data?.map((item) => ({
        ...item,
        stock: item.quantity,
    })) || [];
    return success(res, stockWithMappedField, SuccessMessage.STOCK_REPORT_RETRIEVED);
};
/**
 * Create a new product (HQ only)
 */
export const createProduct = async (req, res) => {
    const { name, base_price, category } = req.body;
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
    if (err)
        return error(res, err.message);
    return success(res, data, SuccessMessage.PRODUCT_CREATED);
};
/**
 * Update a product owned by HQ
 */
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const hqId = req.user?.hq_id;
    if (!hqId) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    const updateData = req.body;
    const { data, error: err } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .eq('hq_id', hqId);
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
