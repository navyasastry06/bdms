import api from './api';

const hospitalService = {
  getDashboard: async () => {
    const response = await api.get('/hospital/dashboard');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/hospital/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/hospital/profile', profileData);
    return response.data;
  },
  searchBlood: async (bloodGroup) => {
    const response = await api.get('/hospital/search', { params: { bloodGroup } });
    return response.data;
  },
  getMyRequests: async () => {
    const response = await api.get('/hospital/requests');
    return response.data;
  },
  createRequest: async (requestData) => {
    const response = await api.post('/hospital/request', requestData);
    return response.data;
  }
};

export default hospitalService;
