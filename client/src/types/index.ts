export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount?: number;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  condition: string;
  status: 'active' | 'inactive';
  notes?: string;
  lastVisit?: string;
  doctor: {
    _id: string;
    name: string;
    specialization: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  patientsToday: number;
  patientsThisWeek: number;
  patientsThisMonth: number;
  avgPatientsPerDoctor: number;
}

export interface FilterOptions {
  specializations: string[];
  hospitals: string[];
}

export interface PatientFilterOptions {
  conditions: string[];
  doctors: Doctor[];
}
