import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { SuccessMessage, ErrorMessage } from '../utils/errormessage';
import { LoginInput } from '../validators/schemas';

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;

  const { data, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    return error(res, authError.message, 401);
  }

  return success(res, data, SuccessMessage.LOGIN_SUCCESSFUL);
};

