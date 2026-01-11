/**
 * Auth Store (Zustand) - Gestion globale de la session utilisateur
 * 
 * Stocke:
 * - user: données utilisateur connecté
 * - token: JWT token
 * - loading: état pendant login/register
 * - error: messages erreur
 * 
 * Persiste token dans localStorage pour survie rechargement page
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { axiosClient } from '../api/axiosClient'
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/api'

export interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (data: RegisterRequest) => Promise<boolean>
  initializeAuth: () => Promise<void> // Restore session from /auth/me
  logout: () => Promise<void>
  clearAuth: () => void
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      login: async (credentials: LoginRequest) => {
        set({ loading: true, error: null })
        try {
          console.log('[AuthStore] Logging in with:', credentials.email)
          console.log('[AuthStore] Posting to /auth/login')
          const response = await axiosClient.post<LoginResponse>(
            '/auth/login',
            credentials
          )
          console.log('[AuthStore] Login response:', response.data)
          const userData = response.data

          const newState = {
            user: {
              id: 0,
              ...userData,
              actif: true,
              dateCreation: new Date().toISOString(),
            },
            isAuthenticated: true,
            loading: false,
          }
          console.log('[AuthStore] Setting state:', newState)
          set(newState)
          console.log('[AuthStore] Login successful, token in HttpOnly cookie')
          return true
        } catch (err: any) {
          console.error('[AuthStore] Login error:', err)
          const status = err?.response?.status
          const serverMessage = err?.response?.data?.message
          let message = 'Erreur de connexion'
          if (status === 403) {
            message = 'Accès refusé: identifiants invalides ou droits insuffisants.'
          } else if (status === 401) {
            message = 'Non autorisé: veuillez vérifier vos identifiants.'
          } else if (serverMessage) {
            message = serverMessage
          }
          set({ error: message, loading: false })
          return false
        }
      },

      register: async (data: RegisterRequest) => {
        set({ loading: true, error: null })
        try {
          const response = await axiosClient.post<LoginResponse>(
            '/auth/register',
            data
          )
          const userData = response.data

          set({
            user: {
              id: 0,
              ...userData,
              actif: true,
              dateCreation: new Date().toISOString(),
            },
            isAuthenticated: true,
            loading: false,
          })

          return true
        } catch (err: any) {
          const message =
            err.response?.data?.message || 'Erreur lors de l\'inscription'
          set({ error: message, loading: false })
          return false
        }
      },

      initializeAuth: async () => {
        set({ loading: true })
        try {
          const response = await axiosClient.get<LoginResponse>('/auth/me')
          const userData = response.data
          console.log('[AuthStore] Session restored from /auth/me:', userData)
          set({
            user: {
              id: 0,
              ...userData,
              actif: true,
              dateCreation: new Date().toISOString(),
            },
            isAuthenticated: true,
            loading: false,
          })
        } catch (err) {
          console.log('[AuthStore] No active session, user is logged out')
          set({ user: null, isAuthenticated: false, loading: false })
        }
      },

      logout: async () => {
        try {
          // Call backend logout to clear HttpOnly cookie
          await axiosClient.post('/auth/logout')
          console.log('[AuthStore] Logout successful')
        } catch (err) {
          console.error('[AuthStore] Logout error:', err)
          // Continue to clear local state even if backend call fails
        } finally {
          set({ user: null, isAuthenticated: false, error: null })
        }
      },

      clearAuth: () => {
        set({ user: null, isAuthenticated: false, error: null })
      },

      setUser: (user: User) => {
        set({ user })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
