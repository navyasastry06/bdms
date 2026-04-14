import api from './api';

const authService = {
  /* Register a new user (Donor or Hospital) */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  /* Login user */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  /* Logout user */
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  /* Get current logged-in user details & profile */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default authService;
