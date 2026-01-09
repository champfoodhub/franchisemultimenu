import { supabase } from '../config/supabase.js';
import { success, error } from '../utils/response.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) return error(res, authError.message, 401);

  return success(res, data, 'Login successful');
};
