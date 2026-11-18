import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const validate = (schema: ZodObject<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ApiError(400, 'Validation failed', errors));
      }
      next(error);
    }
  };
};
