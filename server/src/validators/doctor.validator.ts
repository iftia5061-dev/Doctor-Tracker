import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    specialization: z.string().min(1, 'Specialization is required'),
    hospital: z.string().min(1, 'Hospital is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email'),
  }),
});

export const updateDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    specialization: z.string().min(1).optional(),
    hospital: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const getDoctorSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listDoctorsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    specialization: z.string().optional(),
    hospital: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});
