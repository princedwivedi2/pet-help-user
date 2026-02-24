import api from './api';

const blogService = {
  getCategories: () => api.get('/blog/categories'),
  getTags: () => api.get('/blog/tags'),
  getPosts: (params) => api.get('/blog/posts', { params }),
  getPost: (uuid) => api.get(`/blog/posts/${uuid}`),
  addComment: (uuid, data) => api.post(`/blog/posts/${uuid}/comments`, data),
  toggleLike: (uuid) => api.post(`/blog/posts/${uuid}/like`),
};

export default blogService;
