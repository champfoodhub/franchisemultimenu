import { supabase } from '../config/supabase.js';
import { success, error } from '../utils/response.js';

export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  const { error: err } = await supabase
    .from('branch_products')
    .update({ stock })
    .eq('product_id', id)
    .eq('branch_id', req.user.branch_id);

  if (err) return error(res, err.message);
  success(res, null, 'Stock updated');
};

export const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const { discount } = req.body;

  if (discount > 30) return error(res, 'Discount exceeds limit');

  const { error: err } = await supabase
    .from('branch_products')
    .update({ discount })
    .eq('product_id', id)
    .eq('branch_id', req.user.branch_id);

  if (err) return error(res, err.message);
  success(res, null, 'Discount updated');
};

export const getMenu = async (req, res) => {
  const { data, error: err } = await supabase.rpc(
    'branch_menu',
    { branch_id_input: req.user.branch_id }
  );

  if (err) return error(res, err.message);
  success(res, data);
};
