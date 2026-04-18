import api from './api';

export const dashboardService = {
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data.data;
  },

  getProfessorDashboard: async () => {
    const response = await api.get('/dashboard/professor');
    return response.data.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data.data;
  },
};
