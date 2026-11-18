import api from '@/lib/api';
import { DashboardStats } from '@/types';

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data.data as DashboardStats;
  },

  getPatientsPerDoctor: async (limit = 10) => {
    const response = await api.get('/dashboard/patients-per-doctor', { params: { limit } });
    return response.data.data;
  },

  getTimeline: async (range = '7d') => {
    const response = await api.get('/dashboard/timeline', { params: { range } });
    return response.data.data;
  },

  getConditions: async () => {
    const response = await api.get('/dashboard/conditions');
    return response.data.data;
  },

  getSpecializations: async () => {
    const response = await api.get('/dashboard/specializations');
    return response.data.data;
  },
};
