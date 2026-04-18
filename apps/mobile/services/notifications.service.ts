import api from './api';

export const notificationsService = {
  registerPushToken: async (token: string) => {
    const response = await api.post('/notifications/register', { token });
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data.data;
  },

  markRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};
