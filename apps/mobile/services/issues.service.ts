import api from './api';

export const issuesService = {
  reportIssue: async (formData: FormData) => {
    const response = await api.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getIssues: async (params?: { category?: string; status?: string; building?: string }) => {
    const response = await api.get('/issues', { params });
    return response.data.data;
  },

  getHeatmap: async () => {
    const response = await api.get('/issues/heatmap');
    return response.data.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  },
};
