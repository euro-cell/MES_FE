import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname === '/login';
    if (error.response?.status === 401 && !isLoginPage) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
