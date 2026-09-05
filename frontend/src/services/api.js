import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const useMocks = import.meta.env.VITE_USE_MOCK_API === 'true';

const ACCESS_KEY = 'skillnet_access';
const REFRESH_KEY = 'skillnet_refresh';
let accessToken = sessionStorage.getItem(ACCESS_KEY);

export const setTokens = ({ access = null, refresh = null } = {}) => {
  accessToken = access;
  if (access) sessionStorage.setItem(ACCESS_KEY, access);
  else sessionStorage.removeItem(ACCESS_KEY);
  if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
  else if (refresh === null) sessionStorage.removeItem(REFRESH_KEY);
};
export const setAccessToken = (token) => setTokens({ access: token, refresh: sessionStorage.getItem(REFRESH_KEY) });
export const getRefreshToken = () => sessionStorage.getItem(REFRESH_KEY);
export const clearTokens = () => setTokens();

const api = axios.create({ baseURL: API_BASE_URL, timeout: 12000, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  const refresh = getRefreshToken();
  if (error.response?.status === 401 && refresh && !original?._retry && !original?.url?.includes('/auth/')) {
    original._retry = true;
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
      setTokens({ access: data.access, refresh: data.refresh || refresh });
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch {
      clearTokens();
    }
  }
  if (error.response?.status === 401) window.dispatchEvent(new Event('skillnet:unauthorized'));
  return Promise.reject(error);
});
export default api;
