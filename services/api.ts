import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://kaay-mbayy-app-api.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/*
 * Render (offre gratuite) met le serveur en veille après ~15 min d'inactivité.
 * Le réveil ("cold start") peut prendre 30 à 50 secondes. Pour que l'app reste
 * fluide, on retente automatiquement UNE fois — avec un délai plus long — toute
 * requête qui échoue par timeout ou erreur réseau (signe que le serveur démarre).
 * On évite ce retry pour les FormData (upload diagnostic) car le flux ne peut
 * pas être relu une seconde fois de façon fiable.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isTimeoutOrNetwork =
      error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response;
    const isRetryable =
      isTimeoutOrNetwork && config && !config.__retried && !(config.data instanceof FormData);

    if (isRetryable) {
      config.__retried = true;
      config.timeout = 50000; // laisser le temps au serveur Render de se réveiller
      try {
        return await api(config);
      } catch (retryError: any) {
        error = retryError;
      }
    }

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

/**
 * Ping de "réveil" du serveur — à appeler le plus tôt possible au lancement
 * de l'app (écran de démarrage / chargement de session), pour que le serveur
 * Render commence à démarrer pendant que l'utilisateur est encore sur le
 * splash/écran de connexion. Quand il arrive sur les vrais écrans de données,
 * le serveur a de bonnes chances d'être déjà chaud → app perçue comme rapide.
 * Fire-and-forget : on ignore le résultat et les erreurs.
 */
export const wakeUpBackend = () => {
  axios.get(`${API_BASE_URL}/health`, { timeout: 60000 }).catch(() => {});
};

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
      // PlantNet ~10s + marge si le serveur Render vient de se réveiller
      timeout: 40000,
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
