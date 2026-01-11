/**
 * Types API - Interfaces TypeScript pour toutes les réponses/requêtes
 * 
 * Synchronisé avec: GestionRH/src/main/java/com/fares/gestionrh/dto/...
 */

// ============ AUTH ============

export interface LoginRequest {
  email: string
  motDePasse: string
}

export interface LoginResponse {
  token: string
  email: string
  nomComplet: string
  nom: string
  prenom: string
  telephone?: string
  departement?: string
  poste?: string
  roles: string[]
}

export interface RegisterRequest {
  email: string
  motDePasse: string
  nom: string
  prenom: string
  telephone?: string
  poste?: string
  departement?: string
}

export interface User {
  id: number
  email: string
  nom: string
  prenom: string
  nomComplet: string
  telephone?: string
  departement?: string
  poste?: string
  roles: string[]
  actif: boolean
  dateCreation: string
}

// ============ NOTIFICATION PREFERENCES ============

export interface NotificationPreferences {
  id?: number
  emailEnabled: boolean
  smsEnabled: boolean
  slackEnabled: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TestNotificationRequest {
  channel: 'email' | 'slack' | 'sms'
}

// ============ CONGÉS ============

export interface CongeRequest {
  dateDebut: string // YYYY-MM-DD
  dateFin: string
  type: string // CP, FORM, etc.
  dureeType?: 'JOURNEE_COMPLETE' | 'DEMI_JOUR_MATIN' | 'DEMI_JOUR_APRES_MIDI' | 'PAR_HEURE'
  heureDebut?: string // HH:mm
  heureFin?: string
  motif: string
}

export interface CongeResponse {
  id: number
  dateDebut: string
  dateFin: string
  type: string
  nombreJours: number
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE' | 'ANNULE'
  motif: string
  createdAt: string
  updatedAt: string
}

export interface ValidationCongeRequest {
  statut: 'APPROUVE' | 'REFUSE'
  commentaire: string
}

// ============ SOLDE CONGÉS ============

export interface SoldeConge {
  id: number
  annee: number
  type: string
  joursRestants: number
  joursInitiaux: number
}

// ============ API ERRORS ============

export interface ApiError {
  status: number
  message: string
  path?: string
  timestamp?: string
  details?: Record<string, string[]> // Erreurs validation
}
