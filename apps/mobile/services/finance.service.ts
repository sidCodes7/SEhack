import api from './api';

export const financeService = {
  getDues: async () => {
    const response = await api.get('/finance/dues');
    return response.data.data;
  },

  initiatePayment: async (dueId: string) => {
    const response = await api.post(`/finance/pay/${dueId}`);
    return response.data.data;
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await api.post('/finance/verify', data);
    return response.data;
  },
};
