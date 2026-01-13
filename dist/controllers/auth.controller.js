import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { SuccessMessage } from '../utils/errormessage';
export const login = async (req, res) => {
    const { email, password } = req.body;
    const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (authError) {
        return error(res, authError.message, 401);
    }
    return success(res, data, SuccessMessage.LOGIN_SUCCESSFUL);
};
