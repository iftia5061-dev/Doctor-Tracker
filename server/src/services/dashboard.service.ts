import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import mongoose from 'mongoose';

export const getSummaryService = async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [totalDoctors, totalPatients, patientsToday, patientsThisWeek, patientsThisMonth] =
    await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.countDocuments({ createdAt: { $gte: today } }),
      Patient.countDocuments({ createdAt: { $gte: weekAgo } }),
      Patient.countDocuments({ createdAt: { $gte: monthAgo } }),
    ]);

  const avgPatientsPerDoctor = totalDoctors > 0 ? totalPatients / totalDoctors : 0;

  return {
    totalDoctors,
    totalPatients,
    patientsToday,
    patientsThisWeek,
    patientsThisMonth,
    avgPatientsPerDoctor: Math.round(avgPatientsPerDoctor * 100) / 100,
  };
};

export const getPatientsPerDoctorService = async (limit: number = 10) => {
  const result = await Patient.aggregate([
    {
      $group: {
        _id: '$doctor',
        patientCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor',
      },
    },
    {
      $unwind: '$doctor',
    },
    {
      $project: {
        _id: 0,
        doctorId: '$_id',
        doctorName: '$doctor.name',
        specialization: '$doctor.specialization',
        patientCount: 1,
      },
    },
    { $sort: { patientCount: -1 } },
    { $limit: limit },
  ]);

  return result;
};

export const getTimelineService = async (range: string = '7d') => {
  const now = new Date();
  let startDate: Date;
  let format: string;

  if (range === '7d') {
    format = '%Y-%m-%d';
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
  } else if (range === '30d') {
    format = '%Y-%m-%d';
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
  } else if (range === '12m') {
    format = '%Y-%m';
    startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 12);
  } else {
    throw new Error('Invalid range. Use 7d, 30d, or 12m');
  }

  const groupBy = {
    $dateToString: { format, date: '$createdAt' },
  };

  const [patientsTimeline, doctorsTimeline] = await Promise.all([
    Patient.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Doctor.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    patients: patientsTimeline,
    doctors: doctorsTimeline,
  };
};

export const getConditionsService = async () => {
  const result = await Patient.aggregate([
    {
      $group: {
        _id: '$condition',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return result;
};

export const getSpecializationsService = async () => {
  const result = await Doctor.aggregate([
    {
      $group: {
        _id: '$specialization',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return result;
};
