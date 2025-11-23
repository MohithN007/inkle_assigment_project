
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL;
const instance = axios.create({ baseURL: baseURL });
instance.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default instance;
