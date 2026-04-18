import api from './api';

export const pyqService = {
  searchPapers: async (params?: {
    subject?: string;
    year?: number;
    semester?: number;
    query?: string;
  }) => {
    const response = await api.get('/pyq/papers', { params });
    return response.data.data;
  },

  getPaperById: async (id: string) => {
    const response = await api.get(`/pyq/papers/${id}`);
    return response.data.data;
  },
};
