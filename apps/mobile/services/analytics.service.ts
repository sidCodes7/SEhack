import api from './api';

export const analyticsService = {
  getAttendanceTrends: async () => {
    const response = await api.get('/analytics/attendance');
    return response.data.data;
  },

  getApprovalBottlenecks: async () => {
    const response = await api.get('/analytics/approvals');
    return response.data.data;
  },

  getIssueStats: async () => {
    const response = await api.get('/analytics/issues');
    return response.data.data;
  },
};
