/**
 * Error Boundary - Capture les erreurs React et affiche une UI de secours
 * 
 * Empêche la page complète de crasher si un composant enfant crash
 * Log l'erreur pour debugging
 */

import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  // Extraire le message d'erreur
  let errorMessage = 'Une erreur inattendue s\'est produite';
  let statusCode: number | null = null;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText || errorMessage;
    if (error.data?.message) {
      errorMessage = error.data.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-red-100 rounded-full p-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              {statusCode ? `Erreur ${statusCode}` : 'Oops!'}
            </h1>
            <p className="text-slate-600">
              {statusCode === 404
                ? 'La page que vous cherchez n\'existe pas.'
                : statusCode === 401
                ? 'Vous devez vous connecter pour accéder à cette page.'
                : statusCode === 403
                ? 'Vous n\'avez pas la permission d\'accéder à cette page.'
                : 'Une erreur s\'est produite lors du traitement de votre demande.'}
            </p>
          </div>

          {/* Error Details (développement uniquement) */}
          {isDev && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 overflow-auto max-h-32">
              <p className="text-xs font-mono text-red-700 break-words">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </button>
            <button
              onClick={handleReload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger la page
            </button>
          </div>

          {/* Support Info */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Besoin d'aide?{' '}
              <a
                href="mailto:support@gestionrh.com"
                className="text-blue-600 hover:underline font-medium"
              >
                Contactez le support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          GestionRH © 2026
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;
