/**
 * API Service - Axios instance avec intercepteurs
 * 
 * Gère:
 * - Configuration base URL (env: VITE_API_URL)
 * - Injection token JWT dans chaque requête
 * - Gestion erreurs 401/403/500
 * - Refresh token (futur)
 */

import axios from 'axios'
import type { AxiosError } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088/api'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important: envoyer cookies (JWT)
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Intercepteur REQUEST: injecter token JWT depuis localStorage
 * (alternative: depuis le store Zustand)
 */
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Intercepteur RESPONSE: gérer erreurs globales
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 Unauthorized: token expiré ou invalide
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Import dynamique pour éviter dépendance circulaire
      import('../store/auth').then(({ useAuthStore }) => {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
      })
    }

    // 403 Forbidden: utilisateur sans permission
    if (error.response?.status === 403) {
      console.warn('Accès refusé (403)', error.response.data)
    }

    // 500 Server Error
    if (error.response?.status === 500) {
      console.error('Erreur serveur (500)', error.response.data)
    }

    return Promise.reject(error)
  }
)
