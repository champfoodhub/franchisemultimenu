import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/auth';
import { ErrorMessage } from '../utils/errormessage';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: ErrorMessage.TOKEN_MISSING });
    return;
  }

  const token = authHeader.split(' ')[1];

  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ message: ErrorMessage.INVALID_TOKEN });
    return;
  }

  // Attach authenticated user to request
  req.user = payload;
  next();
};

// Role-based authorization middleware
export const requireRole = (...roles: ('HQ' | 'BRANCH' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: ErrorMessage.UNAUTHORIZED });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: ErrorMessage.FORBIDDEN });
      return;
    }

    next();
  };
};

// HQ-only middleware
export const requireHQ = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: ErrorMessage.UNAUTHORIZED });
    return;
  }

  if (req.user.role !== 'HQ' && req.user.role !== 'ADMIN') {
    res.status(403).json({ message: ErrorMessage.HQ_NOT_ASSIGNED });
    return;
  }

  next();
};

// Branch-only middleware
export const requireBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: ErrorMessage.UNAUTHORIZED });
    return;
  }

  if (req.user.role !== 'BRANCH' && req.user.role !== 'ADMIN') {
    res.status(403).json({ message: ErrorMessage.BRANCH_NOT_ASSIGNED });
    return;
  }

  if (!req.user.branch_id) {
    res.status(403).json({ message: ErrorMessage.BRANCH_NOT_ASSIGNED });
    return;
  }

  next();
};

export default {
  authMiddleware,
  requireRole,
  requireHQ,
  requireBranch,
};

