import axios from 'axios';

// Utiliser les routes Next.js API (même origine) au lieu du serveur Express
// Les routes Next.js sont sur /api/* et sont servies par le même serveur (port 3000)
const API_URL = typeof window !== 'undefined' 
  ? window.location.origin  // Utiliser l'origine actuelle (http://localhost:3000)
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - seulement si c'est vraiment une erreur d'auth
      const errorMessage = error.response?.data?.error || '';
      
      // Ne rediriger que si c'est vraiment une erreur d'authentification
      // (pas une erreur de validation ou autre)
      if (
        errorMessage.includes('token') ||
        errorMessage.includes('auth') ||
        errorMessage.includes('unauthorized') ||
        errorMessage === 'Invalid or expired token' ||
        errorMessage === 'No token provided'
      ) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Utiliser router.push au lieu de window.location pour éviter les rechargements
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
