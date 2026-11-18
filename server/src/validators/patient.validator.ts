import { z } from 'zod';

export const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(0).max(120),
    gender: z.enum(['male', 'female', 'other']),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email().optional(),
    condition: z.string().min(1, 'Condition is required'),
    notes: z.string().optional(),
    doctor: z.string().min(1, 'Doctor ID is required'),
  }),
});

export const updatePatientSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    age: z.number().min(0).max(120).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
    condition: z.string().min(1).optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listPatientsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    condition: z.string().optional(),
    doctor: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});
