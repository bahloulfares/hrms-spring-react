import type { StatutConge } from './index';

/**
 * Historique des changements de statut d'une demande de congé
 * Utilisé pour l'audit trail du système
 */
export interface CongeHistorique {
  id: number;
  congeId: number;
  
  // Statuts
  statutPrecedent?: StatutConge;  // null si création initiale
  statutNouveau: StatutConge;
  
  // Acteur
  acteur: string;                 // Email de l'utilisateur
  acteurNom?: string;             // Nom complet (ex: "Jean Dupont")
  
  // Timestamp
  dateModification: string;        // ISO format
  
  // Détails additionnels
  commentaire?: string;
}

/**
 * Filtre pour l'Audit Trail
 */
export interface AuditHistoryFilters {
  acteur?: string;                // Email de l'acteur
  statutNouveau?: StatutConge;    // Filtrer par statut final
  dateDebut?: string;             // YYYY-MM-DD
  dateFin?: string;               // YYYY-MM-DD
  congeId?: number;               // Historique d'un congé spécifique
}

/**
 * Réponse paginée pour l'historique
 */
export interface AuditHistoryResponse {
  content: CongeHistorique[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}
