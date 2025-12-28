import { axiosClient } from '@/api/axiosClient';
import type {
    Conge,
    CreateCongeRequest,
    ValidationCongeRequest,
    SoldeConge,
    TypeConge
} from '../types';

export const leaveApi = {
    // Demandes personnelles
    getMyLeaves: async (): Promise<Conge[]> => {
        const response = await axiosClient.get('/conges/mes-conges');
        return response.data;
    },

    createLeaveRequest: async (data: CreateCongeRequest): Promise<Conge> => {
        const response = await axiosClient.post('/conges', data);
        return response.data;
    },

    cancelLeaveRequest: async (id: number): Promise<Conge> => {
        const response = await axiosClient.delete(`/conges/${id}`);
        return response.data;
    },

    // Soldes et Types
    getMyBalances: async (): Promise<SoldeConge[]> => {
        // Pour l'instant, on n'a pas d'endpoint dédié, on pourrait en créer un ou utiliser un filtre
        // En attendant, on va imaginer qu'on a /conges/mes-soldes
        const response = await axiosClient.get('/conges/mes-soldes');
        return response.data;
    },

    getLeaveTypes: async (): Promise<TypeConge[]> => {
        const response = await axiosClient.get('/conges/types');
        return response.data;
    },

    // Validation (Managers/Admins)
    getPendingRequests: async (): Promise<Conge[]> => {
        const response = await axiosClient.get('/conges/en-attente');
        return response.data;
    },

    validateRequest: async (id: number, data: ValidationCongeRequest): Promise<Conge> => {
        const response = await axiosClient.put(`/conges/${id}/valider`, data);
        return response.data;
    },

    getAllLeaves: async (): Promise<Conge[]> => {
        const response = await axiosClient.get('/conges/all');
        return response.data;
    },

    // Admin Specific - Configuration
    getAdminTypes: async (): Promise<TypeConge[]> => {
        const response = await axiosClient.get('/admin/type-conges');
        return response.data;
    },

    createType: async (data: Partial<TypeConge>): Promise<TypeConge> => {
        const response = await axiosClient.post('/admin/type-conges', data);
        return response.data;
    },

    updateType: async (id: number, data: Partial<TypeConge>): Promise<TypeConge> => {
        const response = await axiosClient.put(`/admin/type-conges/${id}`, data);
        return response.data;
    },

    deleteType: async (id: number): Promise<void> => {
        await axiosClient.delete(`/admin/type-conges/${id}`);
    }
};
