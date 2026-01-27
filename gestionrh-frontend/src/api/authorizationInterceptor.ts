/**
 * Service pour gérer les erreurs d'autorisation (403)
 * À ajouter dans le client axios
 */
import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';

/**
 * Ajoute un intercepteur pour gérer les réponses 401/403 sur un client axios donné
 * Redirige vers la page unauthorized et affiche un message
 */
export const addUnauthorizedInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const requestUrl = error.config?.url || '';

      if (error.response?.status === 403) {
        // Erreur d'autorisation
        const message = (error.response?.data as any)?.message || 
                       'Vous n\'avez pas les permissions pour effectuer cette action';
        
        toast.error(message);
        
        // Optionnel: redirection vers unauthorized (à gérer au niveau du composant)
        // window.location.href = '/unauthorized';
      } else if (error.response?.status === 401) {
        // Ignorer la restauration de session /auth/me pour éviter boucle
        if (requestUrl.includes('/auth/me')) {
          return Promise.reject(error);
        }

        // Token expiré
        const { logout } = useAuthStore.getState();
        await logout();
        window.location.href = '/login';
        toast.error('Votre session a expiré. Veuillez vous reconnecter.');
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Fonction utilitaire pour vérifier si une erreur est une erreur d'autorisation
 */
export const isUnauthorizedError = (error: unknown): error is AxiosError<{ message: string }> => {
  return (
    axios.isAxiosError(error) && 
    error.response?.status === 403
  );
};

/**
 * Fonction utilitaire pour vérifier si une erreur est une session expirée
 */
export const isSessionExpiredError = (error: unknown): error is AxiosError => {
  return (
    axios.isAxiosError(error) && 
    error.response?.status === 401
  );
};
