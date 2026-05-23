import api from './api';

const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getDonors: async () => {
    const response = await api.get('/admin/donors');
    return response.data;
  },
  deleteDonor: async (id) => {
    const response = await api.delete(`/admin/donors/${id}`);
    return response.data;
  },
  getRequests: async () => {
    const response = await api.get('/admin/requests');
    return response.data;
  },
  updateRequestStatus: async (id, statusData) => {
    const response = await api.put(`/admin/requests/${id}`, statusData);
    return response.data;
  },
  getInventory: async () => {
    const response = await api.get('/admin/inventory');
    return response.data;
  },
  updateInventory: async (inventoryData) => {
    const response = await api.put('/admin/inventory', inventoryData);
    return response.data;
  },
  getCamps: async () => {
    const response = await api.get('/admin/camps');
    return response.data;
  },
  createCamp: async (campData) => {
    const response = await api.post('/admin/camps', campData);
    return response.data;
  },
  updateCamp: async (id, campData) => {
    const response = await api.put(`/admin/camps/${id}`, campData);
    return response.data;
  },
  deleteCamp: async (id) => {
    const response = await api.delete(`/admin/camps/${id}`);
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },
  recordDonation: async (donationData) => {
    const response = await api.post('/admin/donations', donationData);
    return response.data;
  }
};

export default adminService;
