import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 10000,
  withCredentials: true,
});

let onSessionRefresh: ((expiresAt: string) => void) | null = null;

export function setSessionRefreshHandler(handler: (expiresAt: string) => void) {
  onSessionRefresh = handler;
}

axiosInstance.interceptors.response.use(
  (response) => {
    const xSessionExpires = response.headers['x-session-expires'];
    if (xSessionExpires) {
      const expiresAt = new Date(xSessionExpires).toISOString();
      if (!isNaN(new Date(expiresAt).getTime())) {
        onSessionRefresh?.(expiresAt);
      }
    }
    return response;
  },
  (error) => {
    const isLoginPage = window.location.pathname === '/login';
    if (error.response?.status === 401 && !isLoginPage) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      sessionStorage.setItem('session_expired', 'true');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
