import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: [
        {
          field: 'validation',
          message: err.message,
        },
      ],
    });
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && 'code' in err && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value',
      errors: [
        {
          field: 'duplicate',
          message: 'A record with this value already exists',
        },
      ],
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
