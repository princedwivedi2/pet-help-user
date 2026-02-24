import api from './api';

const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getOne: (uuid) => api.get(`/appointments/${uuid}`),
  store: (data) => api.post('/appointments', data),
  getSlots: (vetUuid, params) => api.get(`/appointments/slots/${vetUuid}`, { params }),
  updateStatus: (uuid, data) => api.put(`/appointments/${uuid}/status`, data),
};

export default appointmentService;
