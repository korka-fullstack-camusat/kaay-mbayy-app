import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'http://172.20.10.2:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 406 = image envoyée n'est pas une plante (détecté par PlantNet)
    if (error.response?.status === 406) {
      return Promise.reject(new Error('not_plant'));
    }
    const msg =
      (typeof error.response?.data?.detail === 'string'
        ? error.response.data.detail
        : null) ||
      error.message ||
      'Erreur réseau';
    return Promise.reject(new Error(msg));
  }
);

export default api;

// Auth
export const authApi = {
  signup: (data: { name: string; phone: string; dial_code: string; password: string; location?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { phone: string; dial_code: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  savePushToken: (token: string) => api.post('/auth/push-token', { token }),
};

// Products
export const productsApi = {
  list: (q?: string) => api.get('/products', { params: { q } }),
  mine: () => api.get('/products/mine'),
  get: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// Orders
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  list: () => api.get('/orders'),
  received: () => api.get('/orders/received'),
  updateStatus: (id: number, status: 'confirmed' | 'cancelled') =>
    api.patch(`/orders/${id}/status`, { status }),
};

// Diagnoses
export const diagnosesApi = {
  create: (formData: FormData) =>
    api.post('/diagnoses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 25000, // PlantNet peut prendre jusqu'à ~10s
    }),
  list: () => api.get('/diagnoses'),
};

// Alerts
export const alertsApi = {
  list: () => api.get('/alerts'),
};

// Zones
export const zonesApi = {
  list: (q?: string) => api.get('/zones', { params: { q } }),
};

// Parcels
export const parcelsApi = {
  list: () => api.get('/parcels'),
  create: (data: any) => api.post('/parcels', data),
  delete: (id: number) => api.delete(`/parcels/${id}`),
};

// Weather
export const weatherApi = {
  get: (location?: string) => api.get('/weather', { params: { location } }),
};
