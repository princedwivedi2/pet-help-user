import api from './api';

const guideService = {
  getCategories: () => api.get('/emergency-categories'),
  getAll: (params) => api.get('/guides', { params }),
  getOne: (id) => api.get(`/guides/${id}`),
};

export default guideService;
