import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getSummaryService,
  getPatientsPerDoctorService,
  getTimelineService,
  getConditionsService,
  getSpecializationsService,
} from '../services/dashboard.service.js';

export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = await getSummaryService();

  res.json({
    success: true,
    data: summary,
  });
});

export const getPatientsPerDoctor = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 10 } = req.query;
    const result = await getPatientsPerDoctorService(Number(limit));

    res.json({
      success: true,
      data: result,
    });
  }
);

export const getTimeline = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { range = '7d' } = req.query;
  const result = await getTimelineService(range as string);

  res.json({
    success: true,
    data: result,
  });
});

export const getConditions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await getConditionsService();

  res.json({
    success: true,
    data: result,
  });
});

export const getSpecializations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await getSpecializationsService();

  res.json({
    success: true,
    data: result,
  });
}
);
