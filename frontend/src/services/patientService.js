import api from './api';

/**
 * Patient service — used by hospital users to manage patient records.
 * Patients are hospital-scoped records, not independent system users.
 */
const patientService = {
  addPatient: async (data) => {
    const response = await api.post('/patient/add', data);
    return response.data;
  },

  getPatients: async () => {
    const response = await api.get('/patient/all');
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/patient/${id}/status`, { status });
    return response.data;
  },

  deletePatient: async (id) => {
    const response = await api.delete(`/patient/${id}`);
    return response.data;
  }
};

export default patientService;
