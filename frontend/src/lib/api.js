import axios from "axios";

const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  
  if (envURL) {
    const cleanURL = envURL.replace(/\/api\/?$/, '');
    return cleanURL;
  }
  
  // ডিফল্ট URL
  return window.location.hostname.includes('localhost') 
    ? 'http://localhost:5000'
    : 'https://e-inject.onrender.com';
};

const baseURL = getBaseURL();
console.log('🌐 API Base URL (for debugging):', baseURL);

// Create axios instance
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ Response Error:', {
        status: error.response.status,
        url: error.response.config.url,
        data: error.response.data
      });
    } else {
      console.error('❌ Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
