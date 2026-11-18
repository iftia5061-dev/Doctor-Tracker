import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createDoctorService,
  listDoctorsService,
  getDoctorService,
  updateDoctorService,
  deleteDoctorService,
  getDoctorPatientsService,
  addPatientToDoctorService,
  removePatientFromDoctorService,
  getDoctorFilterOptionsService,
} from '../services/doctor.service.js';

const getQueryParam = (value: any): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  return undefined;
};

export const createDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doctor = await createDoctorService(req.body);

  res.status(201).json({
    success: true,
    data: doctor,
  });
});

export const listDoctors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    specialization,
    hospital,
    from,
    to,
    sort = '-createdAt',
  } = req.query;

  const result = await listDoctorsService({
    page: Number(getQueryParam(page) || '1'),
    limit: Number(getQueryParam(limit) || '10'),
    search: getQueryParam(search),
    specialization: getQueryParam(specialization),
    hospital: getQueryParam(hospital),
    from: getQueryParam(from),
    to: getQueryParam(to),
    sort: getQueryParam(sort) || '-createdAt',
  });

  res.json({
    success: true,
    ...result,
  });
});

export const getDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const doctor = await getDoctorService(getQueryParam(id) || '');

  res.json({
    success: true,
    data: doctor,
  });
});

export const updateDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const doctor = await updateDoctorService(getQueryParam(id) || '', req.body);

  res.json({
    success: true,
    data: doctor,
  });
});

export const deleteDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteDoctorService(getQueryParam(id) || '');

  res.json({
    success: true,
    message: 'Doctor deleted successfully',
  });
});

export const getDoctorPatients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    page = 1,
    limit = 10,
    search,
    condition,
    sort = '-createdAt',
  } = req.query;

  const result = await getDoctorPatientsService(getQueryParam(id) || '', {
    page: Number(getQueryParam(page) || '1'),
    limit: Number(getQueryParam(limit) || '10'),
    search: getQueryParam(search),
    condition: getQueryParam(condition),
    sort: getQueryParam(sort) || '-createdAt',
  });

  res.json({
    success: true,
    ...result,
  });
});

export const addPatientToDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const patient = await addPatientToDoctorService(getQueryParam(id) || '', req.body);

  res.status(201).json({
    success: true,
    data: patient,
  });
});

export const removePatientFromDoctor = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id, patientId } = req.params;
    await removePatientFromDoctorService(
      getQueryParam(id) || '',
      getQueryParam(patientId) || ''
    );

    res.json({
      success: true,
      message: 'Patient removed successfully',
    });
  }
);

export const getDoctorFilterOptions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const options = await getDoctorFilterOptionsService();

    res.json({
      success: true,
      data: options,
    });
  }
);
