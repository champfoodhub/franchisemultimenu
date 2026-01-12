import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface User {
      role?: string;
    }
  }
}

/**
 * Allowed roles middleware
 */
export const allowRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
