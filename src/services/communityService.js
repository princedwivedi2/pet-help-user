import api from './api';

const communityService = {
  getTopics: () => api.get('/community/topics'),
  getPosts: (params) => api.get('/community/posts', { params }),
  getPost: (uuid) => api.get(`/community/posts/${uuid}`),
  getReplies: (uuid, params) => api.get(`/community/posts/${uuid}/replies`, { params }),
  storePost: (data) => api.post('/community/posts', data),
  deletePost: (uuid) => api.delete(`/community/posts/${uuid}`),
  storeReply: (uuid, data) => api.post(`/community/posts/${uuid}/replies`, data),
  deleteReply: (uuid) => api.delete(`/community/replies/${uuid}`),
  vote: (data) => api.post('/community/votes', data),
  report: (data) => api.post('/community/reports', data),
};

export default communityService;
