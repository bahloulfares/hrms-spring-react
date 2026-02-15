export type StatutConge = 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE';

export type DureeType = 'JOURNEE_ENTIERE' | 'DEMI_JOUR_MATIN' | 'DEMI_JOUR_APRES_MIDI' | 'PAR_HEURE';

export interface TypeConge {
    id: number;
    nom: string;
    code: string;
    joursParAn: number;
    compteWeekend: boolean;
    peutDeborderSurCP: boolean;
    actif?: boolean;
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
    dureeType?: DureeType;
    heureDebut?: string; // Format HH:mm
    heureFin?: string;   // Format HH:mm
}

export interface CongeReportRequest {
    dateDebut?: string;
    dateFin?: string;
    typeConge?: string | null;
    statut?: StatutConge | '';
    departementId?: number;
    employeId?: number;
}

export interface CongeStatsResponse {
    totalDemandes: number;
    demandesEnAttente: number;
    demandesApprouvees: number;
    demandesRejetees: number;
    demandesAnnulees: number;
    totalJoursConsommes: number;
    parType: Record<string, number>;
    parStatut: Record<string, number>;
    joursParType: Record<string, number>;
}

export interface ValidationCongeRequest {
    statut: 'APPROUVE' | 'REJETE';
    commentaire: string;
}
