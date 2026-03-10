import api from './api';

const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  getOne: (uuid) => api.get(`/payments/${uuid}`),
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  recordOffline: (data) => api.post('/payments/offline', data),
  refund: (uuid, data) => api.post(`/payments/${uuid}/refund`, data),
  getWallet: () => api.get('/payments/wallet'),
};

export default paymentService;
