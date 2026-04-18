import api from './api';

export const karmaService = {
  getScore: async () => {
    const response = await api.get('/karma/score');
    return response.data.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/karma/leaderboard');
    return response.data.data;
  },
};
