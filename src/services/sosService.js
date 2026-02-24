import api from './api';

const sosService = {
  store: (data) => api.post('/sos', data),
  getActive: () => api.get('/sos/active'),
  updateStatus: (uuid, data) => api.put(`/sos/${uuid}/status`, data),
};

export default sosService;
