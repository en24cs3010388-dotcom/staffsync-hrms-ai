import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.ts';

/**
 * Authorize only users whose role is in allowedRoles
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Forbidden: role '${req.user.role}' does not have permission to perform this action.`,
      });
      return;
    }

    next();
  };
};
