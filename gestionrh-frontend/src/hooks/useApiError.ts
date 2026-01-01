import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

/**
 * Structure d'une erreur API
 */
export interface ApiError {
    status: number;
    message: string;
    details?: string;
    errors?: Record<string, string>;
    path?: string;
    timestamp?: string;
}

/**
 * Hook pour la gestion centralisée des erreurs API
 * 
 * Utilisation:
 * const { handleError, getErrorMessage } = useApiError();
 * 
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleError(error as AxiosError);
 * }
 */
export const useApiError = () => {
    /**
     * Extrait un message d'erreur lisible
     */
    const getErrorMessage = useCallback((error: AxiosError | any): string => {
        // Erreur personnalisée structurée
        if (error.response?.data) {
            const data = error.response.data as ApiError;
            return data.message || 'Une erreur est survenue';
        }

        // Erreur réseau
        if (!error.response) {
            return 'Erreur réseau - Vérifiez votre connexion Internet';
        }

        // Messages par code HTTP
        const statusMessages: Record<number, string> = {
            400: 'Erreur de validation - Vérifiez vos données',
            401: 'Session expirée - Veuillez vous reconnecter',
            403: 'Vous n\'avez pas les permissions pour cette action',
            404: 'Ressource non trouvée',
            409: 'Conflit de données - Cette ressource existe déjà',
            500: 'Erreur serveur - Réessayez plus tard',
            503: 'Service indisponible - Le serveur est en maintenance',
        };

        return statusMessages[error.response.status] || 'Une erreur est survenue';
    }, []);

    /**
     * Extrait les erreurs de validation
     */
    const getValidationErrors = useCallback((error: AxiosError): Record<string, string> => {
        const data = error.response?.data as ApiError;
        return data?.errors || {};
    }, []);

    /**
     * Gère l'erreur et affiche un toast
     */
    const handleError = useCallback((error: AxiosError | any, options?: {
        showToast?: boolean;
        logError?: boolean;
    }) => {
        const showToast = options?.showToast ?? true;
        const logError = options?.logError ?? true;

        const message = getErrorMessage(error);

        if (logError) {
            console.error('[API Error]:', error);
        }

        if (showToast) {
            toast.error(message, {
                duration: 4000,
                position: 'top-right',
            });
        }

        return message;
    }, [getErrorMessage]);

    /**
     * Gère les erreurs de validation et affiche des toasts
     */
    const handleValidationError = useCallback((error: AxiosError | any) => {
        const validationErrors = getValidationErrors(error);
        
        if (Object.keys(validationErrors).length > 0) {
            // Afficher un toast pour chaque erreur
            Object.entries(validationErrors).forEach(([field, message]) => {
                toast.error(`${field}: ${message}`, {
                    duration: 3000,
                    position: 'top-right',
                });
            });
            return validationErrors;
        }

        // Sinon afficher un message générique
        const message = getErrorMessage(error);
        toast.error(message, { duration: 4000 });
        return {};
    }, [getErrorMessage, getValidationErrors]);

    return {
        getErrorMessage,
        getValidationErrors,
        handleError,
        handleValidationError,
    };
};
