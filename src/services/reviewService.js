import api from './api';

const reviewService = {
  store: (data) => api.post('/reviews', data),
  getForVet: (uuid, params) => api.get(`/reviews/vet/${uuid}`, { params }),
  reply: (uuid, data) => api.put(`/reviews/${uuid}/reply`, data),
  flag: (uuid, data) => api.put(`/reviews/${uuid}/flag`, data),
};

export default reviewService;
