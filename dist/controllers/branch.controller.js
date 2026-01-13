import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
/**
 * Update product stock for a branch
 */
export const updateStock = async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    if (!req.user?.branch_id) {
        return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
    }
    const { error: err } = await supabase
        .from('branch_products')
        .update({ stock })
        .eq('product_id', id)
        .eq('branch_id', req.user.branch_id);
    if (err)
        return error(res, err.message);
    return success(res, null, SuccessMessage.STOCK_UPDATED);
};
/**
 * Update product discount for a branch
 */
export const updateDiscount = async (req, res) => {
    const { id } = req.params;
    const { discount } = req.body;
    if (!req.user?.branch_id) {
        return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
    }
    const { error: err } = await supabase
        .from('branch_products')
        .update({ discount })
        .eq('product_id', id)
        .eq('branch_id', req.user.branch_id);
    if (err)
        return error(res, err.message);
    return success(res, null, SuccessMessage.DISCOUNT_UPDATED);
};
/**
 * Get branch-specific menu using Supabase RPC
 */
export const getMenu = async (req, res) => {
    if (!req.user?.branch_id) {
        return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
    }
    const { data, error: err } = await supabase.rpc('branch_menu', {
        branch_id_input: req.user.branch_id,
    });
    if (err)
        return error(res, err.message);
    return success(res, data, SuccessMessage.MENU_RETRIEVED);
};
