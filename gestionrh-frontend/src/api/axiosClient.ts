import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { addUnauthorizedInterceptor } from './authorizationInterceptor';
import { logger } from '@/utils/logger';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8088/api';

/**
 * Client HTTP Axios avec:
 * - Retry automatique avec backoff exponentiel
 * - Gestion des erreurs globales (401, 403, 500, etc.)
 * - Logging structuré
 * - Timeout configurable
 */
export const axiosClient: AxiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Important: include cookies for cross-origin requests (localhost:3001 -> 8088)
    withCredentials: true,
    timeout: 30000, // 30 secondes
});

// Intercepteur global pour 401/403 (toast + logout + redirection)
addUnauthorizedInterceptor(axiosClient);

/**
 * Configuration du retry
 */
interface RetryConfig extends AxiosRequestConfig {
    retryCount?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

/**
 * Fonction pour attendre avant retry (avec backoff exponentiel)
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Détermine si une erreur est "retryable"
 */
function isRetryableError(error: AxiosError): boolean {
    if (!error.response) {
        // Erreur réseau
        return true;
    }

    const status = error.response.status;
    
    // Retry sur:
    // - 408: Request Timeout
    // - 429: Too Many Requests
    // - 500: Server Error
    // - 502: Bad Gateway
    // - 503: Service Unavailable
    // - 504: Gateway Timeout
    return status === 408 || status === 429 || (status >= 500 && status < 600);
}

// ========================================
// INTERCEPTEUR REQUEST
// ========================================

/**
 * Ajoute le JWT token aux requêtes (via cookie httpOnly, pas de localStorage)
 */
axiosClient.interceptors.request.use(
    (config) => {
        // Initialiser le retryCount si absent
        if (!(config as RetryConfig).retryCount) {
            (config as RetryConfig).retryCount = 0;
        }

        // Log optionnel (désactiver en prod)
        logger.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);

        return config;
    },
    (error) => {
        logger.error('[API] Erreur Request:', error);
        return Promise.reject(error);
    }
);

// ========================================
// INTERCEPTEUR RESPONSE
// ========================================

/**
 * Gère les réponses et les erreurs avec retry
 */
axiosClient.interceptors.response.use(
    (response) => {
        logger.debug(`[API] ✓ ${response.status} ${response.config.url}`);
        return response;
    },
    async (error: AxiosError) => {
        const config = error.config as RetryConfig;
        const retryCount = config?.retryCount || 0;

        // ========================================
        // ERREUR 404 - NOT FOUND
        // ========================================
        if (error.response?.status === 404) {
            logger.debug('[API] ✗ 404 Not Found');
            return Promise.reject(error);
        }

        // ========================================
        // ERREUR 403 - FORBIDDEN (gérée aussi par authorizationInterceptor)
        // ========================================
        if (error.response?.status === 403) {
            logger.debug('[API] ✗ 403 Accès Refusé');
            return Promise.reject(error);
        }

        // ========================================
        // RETRY AUTOMATIQUE
        // ========================================
        if (isRetryableError(error) && retryCount < MAX_RETRIES) {
            const waitTime = RETRY_DELAY * Math.pow(2, retryCount); // Backoff exponentiel
            
            console.warn(
                `[API] ⚠️ Erreur ${error.response?.status || 'Network'} - Retry ${retryCount + 1}/${MAX_RETRIES} après ${waitTime}ms`
            );

            await delay(waitTime);

            // Incrémenter le retryCount
            (config as RetryConfig).retryCount = retryCount + 1;

            // Relancer la requête
            return axiosClient(config);
        }

        // ========================================
        // ERREURS AUTRES
        // ========================================
        
        // Erreur réseau (pas de réponse du serveur)
        if (!error.response) {
            logger.error('[API] ✗ Erreur réseau:', error.message);
            return Promise.reject({
                status: 0,
                message: 'Erreur réseau - Vérifiez votre connexion Internet',
                originalError: error
            });
        }

        // Erreur serveur (5xx) non retryable après tentatives
        if (error.response.status >= 500) {
            logger.error(`[API] ✗ Erreur serveur ${error.response.status}`);
            return Promise.reject({
                status: error.response.status,
                message: 'Erreur serveur - Le service est actuellement indisponible',
                originalError: error
            });
        }

        // Erreur validation (400)
        if (error.response.status === 400) {
            logger.debug('[API] ✗ 400 Erreur de validation');
            return Promise.reject(error);
        }

        // Erreur conflit (409)
        if (error.response.status === 409) {
            logger.debug('[API] ✗ 409 Conflit de données');
            return Promise.reject(error);
        }

        // Autres erreurs
        logger.error(`[API] ✗ Erreur ${error.response.status}:`, error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;
