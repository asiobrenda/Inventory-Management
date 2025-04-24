import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent/received

});

api.interceptors.request.use((config) => {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  });

export default api;
