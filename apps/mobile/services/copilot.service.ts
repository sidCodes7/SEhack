import api from './api';

export const copilotService = {
  sendMessage: async (message: string, language?: string) => {
    const response = await api.post('/copilot/chat', { message, language });
    return response.data.data;
  },

  getSession: async () => {
    const response = await api.get('/copilot/session');
    return response.data.data;
  },

  getProactiveAlerts: async () => {
    const response = await api.post('/copilot/proactive');
    return response.data.data;
  },

  getLanguages: async () => {
    const response = await api.get('/copilot/languages');
    return response.data.data;
  },
};
