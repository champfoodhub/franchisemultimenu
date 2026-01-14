import { Request, Response } from 'express';
import { query, queryOne } from '../config/mysql';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { LoginInput } from '../validators/schemas';
import { comparePassword, generateTokens, JWTPayload } from '../utils/auth';

// Define user interface matching database
interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'HQ' | 'BRANCH' | 'ADMIN';
  hq_id?: number;
  branch_id?: number;
  full_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await queryOne<User>(
      `SELECT id, email, password_hash, role, hq_id, branch_id, full_name, is_active 
       FROM users WHERE email = ? AND is_active = true`,
      [email]
    );

    if (!user) {
      return error(res, ErrorMessage.INVALID_CREDENTIALS, 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return error(res, ErrorMessage.INVALID_CREDENTIALS, 401);
    }

    // Create JWT payload
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      hq_id: user.hq_id || undefined,
      branch_id: user.branch_id || undefined,
    };

    // Generate tokens
    const tokens = generateTokens(payload);

    // Return user info (excluding password)
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      hq_id: user.hq_id,
      branch_id: user.branch_id,
      full_name: user.full_name,
    };

    return success(res, {
      ...tokens,
      user: userResponse,
    }, SuccessMessage.LOGIN_SUCCESSFUL);
  } catch (err) {
    console.error('Login error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

// Additional auth functions for user management
export const getUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = req.user?.id;

  if (!userId) {
    return error(res, ErrorMessage.UNAUTHORIZED, 401);
  }

  try {
    const user = await queryOne<User>(
      `SELECT id, email, role, hq_id, branch_id, full_name, is_active, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return error(res, ErrorMessage.USER_NOT_FOUND, 404);
    }

    return success(res, user, SuccessMessage.USER_RETRIEVED);
  } catch (err) {
    console.error('Get user error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

export const logout = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  // In a stateless JWT setup, logout is handled client-side
  // For stateless JWT, we don't need server-side logout
  // If you need token blacklisting, implement it here
  return success(res, null, SuccessMessage.LOGOUT_SUCCESSFUL);
};

