import axios from 'axios';

// Create a base axios instance that will be used throughout the app
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401 && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
        
        // Don't redirect if we're already on a login page
        if (!currentPath.includes('login')) {
          // Clear auth data only if we're not on a login page
          localStorage.removeItem('token');
          localStorage.removeItem('isSuperAdmin');
          localStorage.removeItem('clinicId');
          localStorage.removeItem('clinicName');
          
          // Determine which login page to redirect to based on the current path and stored user type
          let redirectPath;
          if (currentPath.includes('super-admin') || isSuperAdmin) {
            redirectPath = '/super-admin/login';
          } else {
            redirectPath = '/login';
          }
          
          // Only redirect if we're not already on the target page
          if (currentPath !== redirectPath) {
            window.location.href = redirectPath;
          }
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Also export a configured axios for direct use when needed
export { axios }; 