/**
 * ProtectedRoute - Wrapper pour routes nécessitant authentification
 * 
 * Usage:
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * 
 * Redirige vers /login si pas de token
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[] // Futur: filtrer par rôle (ADMIN, MANAGER, etc.)
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, user, loading } = useAuthStore()
  const location = useLocation()

  // Afficher une attente pendant les transitions d'auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Pas authentifié: rediriger vers login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Vérifier rôles si spécifiés (futur)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = user.roles.some((role) =>
      requiredRoles.includes(role)
    )
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}
