import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApiError } from '../useApiError';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Mock toast
vi.mock('react-hot-toast');

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useApiError', () => {
  describe('getErrorMessage', () => {
    it('should return network error message when no response', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        message: 'Network Error',
        isAxiosError: true,
      } as AxiosError;
      
      const message = result.current.getErrorMessage(error);
      
      expect(message).toBe('Erreur réseau - Vérifiez votre connexion Internet');
    });

    it('should return generic message for 400 status', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 400,
          data: {},
        },
      } as AxiosError;
      
      const message = result.current.getErrorMessage(error);
      
      expect(message).toContain('Erreur de validation');
    });

    it('should return generic message for 401 status', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 401,
          data: {},
        },
      } as AxiosError;
      
      const message = result.current.getErrorMessage(error);
      
      expect(message).toContain('Session expirée');
    });

    it('should return generic message for 403 status', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 403,
          data: {},
        },
      } as AxiosError;
      
      const message = result.current.getErrorMessage(error);
      
      expect(message).toContain('permissions');
    });

    it('should return generic message for 404 status', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 404,
          data: {},
        },
      } as AxiosError;
      
      const message = result.current.getErrorMessage(error);
      
      expect(message).toContain('non trouvée');
    });

    it('should return generic message for 500 status', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 500,
          data: {},
        },
      } as AxiosError;
      
      const message = result.current.getErrorMessage(error);
      
      expect(message).toContain('Erreur serveur');
    });

    it('should return fallback message for unknown status', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 999,
          data: {},
        },
      } as AxiosError;
      
      const message = result.current.getErrorMessage(error);
      
      expect(message).toBe('Une erreur est survenue');
    });
  });

  describe('getValidationErrors', () => {
    it('should extract validation errors from response', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 400,
          data: {
            errors: {
              email: 'Email invalide',
              password: 'Mot de passe trop court',
            },
          },
        },
      } as AxiosError;
      
      const validationErrors = result.current.getValidationErrors(error);
      
      expect(validationErrors).toEqual({
        email: 'Email invalide',
        password: 'Mot de passe trop court',
      });
    });

    it('should return empty object when no validation errors', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 500,
          data: {},
        },
      } as AxiosError;
      
      const validationErrors = result.current.getValidationErrors(error);
      
      expect(validationErrors).toEqual({});
    });
  });

  describe('handleError', () => {
    it('should show toast by default', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 400,
          data: {},
        },
      } as AxiosError;
      
      result.current.handleError(error);
      
      expect(toast.error).toHaveBeenCalled();
    });

    it('should not show toast when showToast is false', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 400,
          data: {},
        },
      } as AxiosError;
      
      vi.clearAllMocks();
      result.current.handleError(error, { showToast: false });
      
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return error message', () => {
      const { result } = renderHook(() => useApiError());
      
      const error = {
        response: {
          status: 404,
          data: {},
        },
      } as AxiosError;
      
      const message = result.current.handleError(error);
      
      expect(message).toContain('non trouvée');
    });
  });
});
