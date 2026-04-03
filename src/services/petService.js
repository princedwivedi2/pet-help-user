import api from './api';

const petService = {
  getAll: () => api.get('/pets'),
  getOne: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/pets/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    return api.put(`/pets/${id}`, data);
  },
  delete: (id) => api.delete(`/pets/${id}`),
};

export default petService;
