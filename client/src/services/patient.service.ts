import api from '@/lib/api';
import { Patient, PaginatedResponse, PatientFilterOptions } from '@/types';

export const patientService = {
  list: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    condition?: string;
    doctor?: string;
    from?: string;
    to?: string;
    sort?: string;
  }) => {
    const response = await api.get('/patients', { params });
    return response.data as PaginatedResponse<Patient>;
  },

  get: async (id: string) => {
    const response = await api.get(`/patients/${id}`);
    return response.data.data as Patient;
  },

  update: async (id: string, data: Partial<Patient>) => {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data.data as Patient;
  },

  delete: async (id: string) => {
    await api.delete(`/patients/${id}`);
  },

  getFilterOptions: async () => {
    const response = await api.get('/patients/filters/options');
    return response.data.data as PatientFilterOptions;
  },
};
