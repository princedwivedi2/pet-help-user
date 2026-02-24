import api from './api';

const vetService = {
  getAll: (params) => api.get('/vets', { params }),
  getOne: (uuid) => api.get(`/vets/${uuid}`),
};

export default vetService;
