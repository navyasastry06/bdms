import api from './api';

const notificationService = {
  getNotifications: async (role = null) => {
    const params = role ? { role } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (role = null) => {
    const params = role ? { role } : {};
    const response = await api.put('/notifications/read-all', null, { params });
    return response.data;
  },
  clearAll: async (role = null) => {
    const params = role ? { role } : {};
    const response = await api.delete('/notifications/clear', { params });
    return response.data;
  }
};

export default notificationService;

