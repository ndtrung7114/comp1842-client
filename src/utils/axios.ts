import axios from "axios"

axios.defaults.withCredentials = true;
const BASE_URL = import.meta.env.VITE_API_URI;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URI,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

export const axiosPrivateInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URI,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

//  interceptor to handle token refresh
axiosPrivateInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axiosInstance.get(`${BASE_URL}/auth/refresh`);
        
        if (response.data.access_token) {
          // Update token in localStorage or your auth store
          // Retry the original request
          return axiosPrivateInstance(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);