import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listPatientsService,
  getPatientService,
  updatePatientService,
  deletePatientService,
  getPatientFilterOptionsService,
} from '../services/patient.service.js';

const getQueryParam = (value: any): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  return undefined;
};

export const listPatients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    condition,
    doctor,
    from,
    to,
    sort = '-createdAt',
  } = req.query;

  const result = await listPatientsService({
    page: Number(getQueryParam(page) || '1'),
    limit: Number(getQueryParam(limit) || '10'),
    search: getQueryParam(search),
    condition: getQueryParam(condition),
    doctor: getQueryParam(doctor),
    from: getQueryParam(from),
    to: getQueryParam(to),
    sort: getQueryParam(sort) || '-createdAt',
  });

  res.json({
    success: true,
    ...result,
  });
});

export const getPatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const patient = await getPatientService(getQueryParam(id) || '');

  res.json({
    success: true,
    data: patient,
  });
});

export const updatePatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const patient = await updatePatientService(getQueryParam(id) || '', req.body);

  res.json({
    success: true,
    data: patient,
  });
});

export const deletePatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deletePatientService(getQueryParam(id) || '');

  res.json({
    success: true,
    message: 'Patient deleted successfully',
  });
});

export const getPatientFilterOptions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const options = await getPatientFilterOptionsService();

    res.json({
      success: true,
      data: options,
    });
  }
);
