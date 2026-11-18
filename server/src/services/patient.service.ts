import { Patient } from '../models/patient.model.js';
import { Doctor } from '../models/doctor.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/buildPagination.js';
import mongoose from 'mongoose';

export const listPatientsService = async (options: {
  page: number;
  limit: number;
  search?: string;
  condition?: string;
  doctor?: string;
  from?: string;
  to?: string;
  sort: string;
}) => {
  const { page, limit, search, condition, doctor, from, to, sort } = options;

  const filter: any = {};

  if (condition) {
    filter.condition = condition;
  }

  if (doctor) {
    filter.doctor = doctor;
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  let query = Patient.find(filter);

  if (search) {
    query = query.find({
      $text: { $search: search },
    });
  }

  const [total, patients] = await Promise.all([
    Patient.countDocuments(filter),
    query
      .populate('doctor', 'name specialization')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Math.min(limit, 50))
      .lean(),
  ]);

  return {
    data: patients,
    meta: buildPagination(page, limit, total),
  };
};

export const getPatientService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid patient ID');
  }

  const patient = await Patient.findById(id)
    .populate('doctor', 'name specialization hospital email phone')
    .lean();

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return patient;
};

export const updatePatientService = async (
  id: string,
  data: Partial<{
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
    email: string;
    condition: string;
    notes: string;
  }>
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid patient ID');
  }

  const patient = await Patient.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate('doctor', 'name specialization')
    .lean();

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return patient;
};

export const deletePatientService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid patient ID');
  }

  const patient = await Patient.findByIdAndDelete(id);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return patient;
};

export const getPatientFilterOptionsService = async () => {
  const conditions = await Patient.distinct('condition');
  const doctors = await Doctor.find()
    .select('name specialization')
    .lean();

  return {
    conditions,
    doctors,
  };
};
