import api from './api';

const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllAsRead: () => api.put('/notifications/read-all'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export default notificationService;
