import api from './api';

export const approvalsService = {
  submitRequest: async (data: {
    type: 'room_booking' | 'certificate' | 'leave';
    details: Record<string, unknown>;
  }) => {
    const response = await api.post('/workflow/request', data);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get('/workflow/requests');
    return response.data.data;
  },

  getRequestById: async (id: string) => {
    const response = await api.get(`/workflow/requests/${id}`);
    return response.data.data;
  },

  getPending: async () => {
    const response = await api.get('/workflow/pending');
    return response.data.data;
  },

  approve: async (id: string, note?: string) => {
    const response = await api.post(`/workflow/requests/${id}/approve`, { note });
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await api.post(`/workflow/requests/${id}/reject`, { reason });
    return response.data;
  },
};
