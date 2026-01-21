/**
 * Validation Schemas - Zod
 * 
 * Centralise toute la logique de validation des formulaires
 * À utiliser avec react-hook-form pour validation côté client
 */

import { z } from 'zod';

// ============= EMPLOYÉ =============
export const CreateEmployeeSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit avoir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  prenom: z.string()
    .min(2, 'Le prénom doit avoir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  
  email: z.string()
    .email('Email invalide')
    .min(5, 'Email trop court')
    .max(100, 'Email trop long'),
  
  telephone: z.string()
    .regex(/^[0-9+\-\s()]+$/, 'Numéro de téléphone invalide')
    .min(10, 'Le téléphone doit avoir au moins 10 caractères')
    .max(20, 'Le téléphone ne peut pas dépasser 20 caractères'),
  
  dateEmbauche: z.coerce.date()
    .max(new Date(), 'La date d\'embauche ne peut pas être future'),
  
  departementId: z.coerce.number()
    .int('Le département doit être un entier')
    .positive('Le département doit être valide'),
  
  posteId: z.coerce.number()
    .int('Le poste doit être un entier')
    .positive('Le poste doit être valide'),
  
  salaire: z.coerce.number()
    .positive('Le salaire doit être positif')
    .max(9999999, 'Le salaire est trop élevé'),
  
  statut: z.enum(['ACTIF', 'INACTIF', 'CONGE'])
    .default('ACTIF'),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().omit({ email: true }); // Email non modifiable

export type CreateEmployeeFormData = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof UpdateEmployeeSchema>;

// ============= DÉPARTEMENT =============
export const CreateDepartmentSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit avoir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  
  responsableId: z.coerce.number()
    .int('Le responsable doit être un entier')
    .positive('Le responsable doit être valide')
    .optional(),
});

export const UpdateDepartmentSchema = CreateDepartmentSchema;

export type CreateDepartmentFormData = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentFormData = z.infer<typeof UpdateDepartmentSchema>;

// ============= POSTE =============
export const CreateJobSchema = z.object({
  titre: z.string()
    .min(2, 'Le titre doit avoir au moins 2 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  
  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
  
  niveau: z.enum(['JUNIOR', 'SENIOR', 'MANAGER', 'DIRECTOR'])
    .default('JUNIOR'),
  
  salaireMoyen: z.coerce.number()
    .positive('Le salaire moyen doit être positif')
    .optional(),
});

export const UpdateJobSchema = CreateJobSchema;

export type CreateJobFormData = z.infer<typeof CreateJobSchema>;
export type UpdateJobFormData = z.infer<typeof UpdateJobSchema>;

// ============= CONGÉ =============
export const CreateLeaveSchema = z.object({
  typeCongeId: z.coerce.number()
    .int('Le type de congé doit être un entier')
    .positive('Le type de congé doit être valide'),
  
  dateDebut: z.coerce.date()
    .refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'La date de début ne peut pas être antérieure à aujourd\'hui'
    }),
  
  dateFin: z.coerce.date(),
  
  motif: z.string()
    .min(5, 'Le motif doit avoir au moins 5 caractères')
    .max(500, 'Le motif ne peut pas dépasser 500 caractères')
    .optional(),
  
  nombreJours: z.coerce.number()
    .positive('Le nombre de jours doit être positif')
    .max(365, 'Le nombre de jours ne peut pas dépasser 365'),
}).refine(data => data.dateFin >= data.dateDebut, {
  message: 'La date de fin doit être après la date de début',
  path: ['dateFin'],
});

export const UpdateLeaveSchema = CreateLeaveSchema.partial();

export type CreateLeaveFormData = z.infer<typeof CreateLeaveSchema>;
export type UpdateLeaveFormData = z.infer<typeof UpdateLeaveSchema>;

// ============= LOGIN =============
export const LoginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(5, 'Email invalide'),
  
  password: z.string()
    .min(6, 'Le mot de passe doit avoir au moins 6 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

// ============= REGISTER =============
export const RegisterSchema = z.object({
  email: z.string()
    .email('Email invalide'),
  
  password: z.string()
    .min(8, 'Le mot de passe doit avoir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre')
    .regex(/[!@#$%^&*]/, 'Le mot de passe doit contenir un caractère spécial (!@#$%^&*)'),
  
  confirmPassword: z.string(),
  
  nom: z.string()
    .min(2, 'Le nom doit avoir au moins 2 caractères'),
  
  prenom: z.string()
    .min(2, 'Le prénom doit avoir au moins 2 caractères'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

// ============= PRÉFÉRENCES NOTIFICATIONS =============
export const NotificationPreferencesSchema = z.object({
  emailOnLeaveCreated: z.boolean().default(true),
  emailOnLeaveApproved: z.boolean().default(true),
  emailOnLeaveRejected: z.boolean().default(true),
  emailOnNewDepartmentMember: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
});

export type NotificationPreferencesFormData = z.infer<typeof NotificationPreferencesSchema>;
