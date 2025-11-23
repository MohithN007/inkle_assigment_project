import axios from 'axios';
const instance = axios.create({ baseURL: 'http://localhost:5000/api' });
instance.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default instance;
