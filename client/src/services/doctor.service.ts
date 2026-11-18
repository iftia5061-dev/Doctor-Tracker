import api from '@/lib/api';
import { Doctor, PaginatedResponse, FilterOptions } from '@/types';

export const doctorService = {
  list: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    specialization?: string;
    hospital?: string;
    from?: string;
    to?: string;
    sort?: string;
  }) => {
    const response = await api.get('/doctors', { params });
    return response.data as PaginatedResponse<Doctor>;
  },

  get: async (id: string) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data.data as Doctor;
  },

  create: async (data: {
    name: string;
    specialization: string;
    hospital: string;
    phone: string;
    email: string;
  }) => {
    const response = await api.post('/doctors', data);
    return response.data.data as Doctor;
  },

  update: async (id: string, data: Partial<Doctor>) => {
    const response = await api.patch(`/doctors/${id}`, data);
    return response.data.data as Doctor;
  },

  delete: async (id: string) => {
    await api.delete(`/doctors/${id}`);
  },

  getPatients: async (id: string, params: {
    page?: number;
    limit?: number;
    search?: string;
    condition?: string;
    sort?: string;
  }) => {
    const response = await api.get(`/doctors/${id}/patients`, { params });
    return response.data as PaginatedResponse<any>;
  },

  getDoctorPatients: async (id: string) => {
    const response = await api.get(`/doctors/${id}/patients`, { params: { limit: 100 } });
    return response.data.data || [];
  },

  addPatient: async (id: string, data: any) => {
    const response = await api.post(`/doctors/${id}/patients`, data);
    return response.data.data;
  },

  removePatientFromDoctor: async (id: string, patientId: string) => {
    await api.delete(`/doctors/${id}/patients/${patientId}`);
  },

  getFilterOptions: async () => {
    const response = await api.get('/doctors/filters/options');
    return response.data.data as FilterOptions;
  },
};
