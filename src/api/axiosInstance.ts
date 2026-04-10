import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !url.includes('/auth/status')) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
