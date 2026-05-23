import api from './api';

const donorService = {
  getDashboard: async () => {
    const response = await api.get('/donor/dashboard');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/donor/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/donor/profile', profileData);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/donor/history');
    return response.data;
  },
  getUpcomingCamps: async () => {
    const response = await api.get('/donor/camps');
    return response.data;
  },
  registerForCamp: async (campId) => {
    const response = await api.post(`/donor/camps/${campId}/register`);
    return response.data;
  },
  unregisterFromCamp: async (campId) => {
    const response = await api.delete(`/donor/camps/${campId}/register`);
    return response.data;
  }
};

export default donorService;
