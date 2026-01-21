import { axiosClient } from '../../../api/axiosClient';
import type { CongeHistorique, AuditHistoryFilters, AuditHistoryResponse } from '../types/auditHistory';

/**
 * Récupère l'historique d'un congé spécifique
 */
export const getCongeHistorique = async (congeId: number): Promise<CongeHistorique[]> => {
    const response = await axiosClient.get(`/conges/${congeId}/historique`);
    if (Array.isArray(response.data)) {
        return response.data;
    }
    console.warn('[API] getCongeHistorique: unexpected response structure', response.data);
    return [];
};

/**
 * Récupère l'audit trail global (historique de tous les congés)
 * Avec support pagination et filtres
 */
export const getAuditHistory = async (
    page: number = 0,
    size: number = 20,
    filters?: AuditHistoryFilters
): Promise<AuditHistoryResponse> => {
    // Construire les paramètres de query
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    // Ajouter les filtres s'ils sont définis
    if (filters?.acteur) params.append('acteur', filters.acteur);
    if (filters?.statutNouveau) params.append('statusNouveau', filters.statutNouveau);
    if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
    if (filters?.dateFin) params.append('dateFin', filters.dateFin);
    if (filters?.congeId) params.append('congeId', filters.congeId.toString());

    const response = await axiosClient.get(`/audit-history?${params.toString()}`);
    
    // Gérer les réponses possibles
    if (response.data && response.data.content) {
        return response.data as AuditHistoryResponse;
    }
    
    // Fallback: si c'est juste un array
    if (Array.isArray(response.data)) {
        return {
            content: response.data,
            totalPages: 1,
            totalElements: response.data.length,
            currentPage: 0,
            pageSize: response.data.length,
        };
    }

    console.warn('[API] getAuditHistory: unexpected response structure', response.data);
    return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        pageSize: 0,
    };
};

/**
 * Récupère les statistiques d'audit (nombre d'actions par acteur, par type, etc.)
 * Optionnel - pour des graphiques ou des statistiques
 */
export const getAuditStats = async (): Promise<{
    totalActions: number;
    actionsByActor: Record<string, number>;
    actionsByStatus: Record<string, number>;
    lastUpdated: string;
}> => {
    const response = await axiosClient.get('/audit-history/stats');
    return response.data;
};
