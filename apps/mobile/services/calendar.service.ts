import api from './api';

export const calendarService = {
  getEvents: async (params?: { month?: number; year?: number }) => {
    const response = await api.get('/calendar/events', { params });
    return response.data.data;
  },

  getRooms: async (params?: { date?: string }) => {
    const response = await api.get('/calendar/rooms', { params });
    return response.data.data;
  },

  bookRoom: async (data: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) => {
    const response = await api.post('/calendar/book', data);
    return response.data;
  },

  checkClash: async (params: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    const response = await api.get('/calendar/clash-check', { params });
    return response.data.data;
  },

  getSuggestions: async (params: { roomId: string; date: string }) => {
    const response = await api.get('/calendar/suggestions', { params });
    return response.data.data;
  },
};
