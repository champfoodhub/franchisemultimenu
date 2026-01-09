import { supabase } from '../config/supabase.js';
import { success, error } from '../utils/response.js';

export const createProduct = async (req, res) => {
  const { name, base_price, category } = req.body;

  const { data, error: err } = await supabase.from('products').insert({
    hq_id: req.user.hq_id,
    name,
    base_price,
    category,
  });

  if (err) return error(res, err.message);
  success(res, data, 'Product created');
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;

  const { data, error: err } = await supabase
    .from('products')
    .update(req.body)
    .eq('id', id)
    .eq('hq_id', req.user.hq_id);

  if (err) return error(res, err.message);
  success(res, data, 'Product updated');
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const { error: err } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (err) return error(res, err.message);
  success(res, null, 'Product disabled');
};

export const stockReport = async (req, res) => {
  const { data, error: err } = await supabase.rpc('hq_stock_report');

  if (err) return error(res, err.message);
  success(res, data);
};
