import axios from 'axios';

/* Create an axios instance pointing to our API */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, /* Important: This allows passing HttpOnly cookies (refreshToken) */
  headers: {
    'Content-Type': 'application/json'
  }
});

/* Request Interceptor: Attach Access Token to every request */
api.interceptors.request.use(
  (config) => {
    /* We'll grab the token from context/localStorage later, 
       but storing access token in memory/localStorage is needed for the header */
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Response Interceptor: Handle Token Expiration (401 errors) */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    /* Do not attempt refresh for auth endpoints themselves */
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login')
      || originalRequest.url?.includes('/auth/register')
      || originalRequest.url?.includes('/auth/refresh');

    if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        /* Ask backend for a new access token using the HttpOnly refresh cookie */
        const refreshResponse = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        const newAccessToken = refreshResponse.data.accessToken;
        
        /* Save new access token */
        localStorage.setItem('accessToken', newAccessToken);
        
        /* Retry the original request with the new token */
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        /* If refresh fails (session truly expired), clear everything and redirect to login */
        localStorage.removeItem('accessToken');
        
        /* Prevent infinite redirect loops if we are already on an auth page */
        const currentLoc = window.location.pathname;
        if (currentLoc !== '/login' && currentLoc !== '/register' && currentLoc !== '/') {
           window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
