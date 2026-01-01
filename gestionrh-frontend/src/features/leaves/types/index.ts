export type StatutConge = 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE';

export interface TypeConge {
    id: number;
    nom: string;
    code: string;
    joursParAn: number;
    compteWeekend: boolean;
    peutDeborderSurCP: boolean;
}

export interface SoldeConge {
    id: number;
    typeCongeNom: string;
    typeCongeCode: string;
    joursRestants: number;
    joursParAn: number;
    annee: number;
}

export interface Conge {
    id: number;
    dateDebut: string;
    dateFin: string;
    type: string; // Code du type
    statut: StatutConge;
    motif?: string;
    commentaireValidation?: string;
    nombreJours: number;
    employeId: number;
    employeNom: string;
    employeEmail: string;
    validateurId?: number;
    validateurNom?: string;
    dateDemande: string;
    dateValidation?: string;
}

export interface CreateCongeRequest {
    dateDebut: string;
    dateFin: string;
    type: string; // Code (CP, RTT, etc.)
    motif: string;
}

export interface ValidationCongeRequest {
    statut: 'APPROUVE' | 'REJETE';
    commentaire: string;
}
