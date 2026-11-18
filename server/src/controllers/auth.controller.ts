import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginService, registerService, getMeService } from '../services/auth.service.js';

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const result = await loginService(email, password);

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.json({
    success: true,
    data: result.user,
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.clearCookie('token');

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  const user = await getMeService(req.user.userId);

  res.json({
    success: true,
    data: user,
  });
});
