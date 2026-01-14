import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// JWT Configuration
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production';
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT Token types
export interface JWTPayload {
  id: number;
  email: string;
  role: 'HQ' | 'BRANCH' | 'ADMIN';
  hq_id?: number;
  branch_id?: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Generate access token
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Generate refresh token
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

// Generate token pair
export const generateTokens = (payload: JWTPayload): TokenPair => {
  const access_token = generateAccessToken(payload);
  const refresh_token = generateRefreshToken(payload);
  
  // Decode access token to get expiry
  const decoded = jwt.decode(access_token) as jwt.JwtPayload;
  const expires_at = decoded.exp || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

  return {
    access_token,
    refresh_token,
    expires_at,
  };
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

// Decode token without verification (for getting expiry, etc.)
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export default {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  JWT_SECRET,
};

