import { axiosClient } from '@/api/axiosClient';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await axiosClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    // Ajouter d'autres méthodes ici (logout, register, me...)
};
