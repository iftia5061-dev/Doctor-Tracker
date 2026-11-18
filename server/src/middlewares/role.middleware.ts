import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { ApiError } from '../utils/ApiError.js';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Not authorized'));
    }

    next();
  };
};
