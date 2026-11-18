import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/buildPagination.js';
import mongoose from 'mongoose';

export const createDoctorService = async (data: {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}) => {
  const doctor = await Doctor.create(data);
  return doctor;
};

export const listDoctorsService = async (options: {
  page: number;
  limit: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  from?: string;
  to?: string;
  sort: string;
}) => {
  const { page, limit, search, specialization, hospital, from, to, sort } = options;

  // Build filter
  const filter: any = {};

  if (specialization) {
    filter.specialization = specialization;
  }

  if (hospital) {
    filter.hospital = hospital;
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  // Search using text index
  let query = Doctor.find(filter);

  if (search) {
    query = query.find({
      $text: { $search: search },
    });
  }

  // Verify index usage in development
  if (process.env.NODE_ENV === 'development') {
    const explainResult = await query.clone().explain('executionStats');
    console.log('Doctor list query explain:', JSON.stringify(explainResult.executionStats, null, 2));
  }

  // Count and data in parallel
  const [total, doctors] = await Promise.all([
    Doctor.countDocuments(filter),
    query
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Math.min(limit, 50))
      .lean(),
  ]);

  return {
    data: doctors,
    meta: buildPagination(page, limit, total),
  };
};

export const getDoctorService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid doctor ID');
  }

  const doctor = await Doctor.findById(id).lean();

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  // Get patient count
  const patientCount = await Patient.countDocuments({ doctor: id });

  return {
    ...doctor,
    patientCount,
  };
};

export const updateDoctorService = async (
  id: string,
  data: Partial<{
    name: string;
    specialization: string;
    hospital: string;
    phone: string;
    email: string;
  }>
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid doctor ID');
  }

  const doctor = await Doctor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  return doctor;
};

export const deleteDoctorService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid doctor ID');
  }

  const doctor = await Doctor.findByIdAndDelete(id);

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  // Cascade delete patients
  await Patient.deleteMany({ doctor: id });

  return doctor;
};

export const getDoctorPatientsService = async (
  doctorId: string,
  options: {
    page: number;
    limit: number;
    search?: string;
    condition?: string;
    sort: string;
  }
) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError(400, 'Invalid doctor ID');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const { page, limit, search, condition, sort } = options;

  const filter: any = { doctor: doctorId };

  if (condition) {
    filter.condition = condition;
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

export const addPatientToDoctorService = async (
  doctorId: string,
  patientData: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
    email?: string;
    condition: string;
    notes?: string;
  }
) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError(400, 'Invalid doctor ID');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const patient = await Patient.create({
    ...patientData,
    doctor: doctorId,
  });

  return patient;
};

export const removePatientFromDoctorService = async (
  doctorId: string,
  patientId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError(400, 'Invalid doctor ID');
  }

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw new ApiError(400, 'Invalid patient ID');
  }

  const patient = await Patient.findOneAndDelete({
    _id: patientId,
    doctor: doctorId,
  });

  if (!patient) {
    throw new ApiError(404, 'Patient not found under this doctor');
  }

  return patient;
};

export const getDoctorFilterOptionsService = async () => {
  const [specializations, hospitals] = await Promise.all([
    Doctor.distinct('specialization'),
    Doctor.distinct('hospital'),
  ]);

  return {
    specializations,
    hospitals,
  };
};
