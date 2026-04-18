import api from './api';

export const attendanceService = {
  markAttendance: async (data: {
    classId: string;
    date: string;
    records: Array<{ studentId: string; status: 'present' | 'absent' }>;
  }) => {
    const response = await api.post('/attendance/mark', data);
    return response.data;
  },

  getClassAttendance: async (classId: string) => {
    const response = await api.get(`/attendance/class/${classId}`);
    return response.data.data;
  },

  getStudentSummary: async (studentId: string) => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data.data;
  },

  getTrends: async () => {
    const response = await api.get('/attendance/trends');
    return response.data.data;
  },
};
