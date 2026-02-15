import { axiosClient } from '@/api/axiosClient';
import type {
    Conge,
    CreateCongeRequest,
    ValidationCongeRequest,
    SoldeConge,
    TypeConge,
    CongeReportRequest,
    CongeStatsResponse
} from '../types';

export interface CongeHistorique {
    id: number;
    statutPrecedent: string | null;
    statutNouveau: string;
    acteur: string; // Email
    acteurNom: string; // Nom complet
    dateModification: string; // ISO date format
    commentaire: string | null;
}

export const leaveApi = {
    // Demandes personnelles
    getMyLeaves: async (): Promise<Conge[]> => {
        const response = await axiosClient.get('/conges/mes-conges');
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    createLeaveRequest: async (data: CreateCongeRequest): Promise<Conge> => {
        const response = await axiosClient.post('/conges', data);
        return response.data;
    },

    cancelLeaveRequest: async (id: number): Promise<Conge> => {
        const response = await axiosClient.delete(`/conges/${id}`);
        return response.data;
    },

    // Historique et détails
    getLeaveHistory: async (id: number): Promise<CongeHistorique[]> => {
        const response = await axiosClient.get(`/conges/${id}/historique`);
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    getLeaveDetails: async (id: number): Promise<Conge> => {
        const response = await axiosClient.get(`/conges/${id}`);
        return response.data;
    },

    // Soldes et Types
    getMyBalances: async (): Promise<SoldeConge[]> => {
        // Pour l'instant, on n'a pas d'endpoint dédié, on pourrait en créer un ou utiliser un filtre
        // En attendant, on va imaginer qu'on a /conges/mes-soldes
        const response = await axiosClient.get('/conges/mes-soldes');
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    getEmployeeBalances: async (employeId: number): Promise<SoldeConge[]> => {
        const response = await axiosClient.get(`/conges/soldes/employe/${employeId}`);
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    getLeaveTypes: async (): Promise<TypeConge[]> => {
        const response = await axiosClient.get('/conges/types');
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    // Validation (Managers/Admins)
    getPendingRequests: async (): Promise<Conge[]> => {
        const response = await axiosClient.get('/conges/en-attente');
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    validateRequest: async (id: number, data: ValidationCongeRequest): Promise<Conge> => {
        const response = await axiosClient.put(`/conges/${id}/valider`, data);
        return response.data;
    },

    getAllLeaves: async (): Promise<Conge[]> => {
        const response = await axiosClient.get('/conges/all');
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    // Admin Specific - Configuration
    getAdminTypes: async (): Promise<TypeConge[]> => {
        const response = await axiosClient.get('/admin/type-conges');
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    getAdminTypesAll: async (): Promise<TypeConge[]> => {
        const response = await axiosClient.get('/admin/type-conges/all');
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    getInactiveTypes: async (): Promise<TypeConge[]> => {
        const response = await axiosClient.get('/admin/type-conges/inactive');
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
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
    },

    reactivateType: async (id: number): Promise<TypeConge> => {
        const response = await axiosClient.post(`/admin/type-conges/${id}/reactivate`);
        return response.data;
    },

    // Reporting / Statistiques
    getStatistics: async (payload: CongeReportRequest): Promise<CongeStatsResponse> => {
        const response = await axiosClient.post('/conges/report/statistics', payload);
        return response.data;
    },

    getReport: async (payload: CongeReportRequest): Promise<Conge[]> => {
        const response = await axiosClient.post('/conges/report/export', payload);
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.content)) return response.data.content;
        return [];
    },

    exportCsv: async (payload: CongeReportRequest): Promise<Blob> => {
        const response = await axiosClient.post('/conges/report/export-csv', payload, { responseType: 'blob' });
        return response.data;
    },

    // Initialiser les soldes pour tous les utilisateurs
    initializeBalances: async (): Promise<{
        utilisateursTraites: number;
        soldesCrees: number;
        soldesExistants: number;
        annee: number;
        message: string;
    }> => {
        const response = await axiosClient.post('/conges/admin/initialiser-soldes');
        return response.data;
    }
};
