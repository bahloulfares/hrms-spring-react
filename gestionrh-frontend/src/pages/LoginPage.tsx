import React from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '../store'
import type { LoginRequest } from '../types'

interface LocationState {
  from?: string
}

const loginSchema = z.object({
  email: z
    .string()
    .email('Email invalide'),
  motDePasse: z
    .string()
    .min(6, 'Minimum 6 caractères'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const authStore = useAuthStore()
  const { login, error, loading, clearError } = authStore
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()
      const success = await login(data as LoginRequest)
      if (success) {
        // Attendre que le state du store se mette à jour avec isAuthenticated
        let attempts = 0
        while (attempts < 30) {
          const { isAuthenticated, user } = useAuthStore.getState()
          if (isAuthenticated && user) {
            console.log('[LoginPage] Auth synced, navigating to /dashboard', { isAuthenticated, user })
            const to = (location.state as LocationState | null)?.from || '/dashboard'
            navigate(to, { replace: true })
            return
          }
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
        console.warn('[LoginPage] Timeout waiting for auth state to sync')
      } else {
        console.warn('[LoginPage] Login failed, staying on login page')
      }
    } catch (err) {
      console.error('[LoginPage] Unexpected error:', err)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Gestion Congés
          </h1>
          <p className="mt-2 text-gray-600">
            Connexion à votre compte
          </p>
        </div>

        {/* Erreur API */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="demo@example.com"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mot de passe
            </label>
            <input
              {...register('motDePasse')}
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
            />
            {errors.motDePasse && (
              <p className="mt-1 text-sm text-red-600">
                {errors.motDePasse.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Pas encore de compte?{' '}
            <Link
              to="/register"
              className="text-indigo-600 hover:underline font-medium"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
