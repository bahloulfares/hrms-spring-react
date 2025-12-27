import type { Role } from '../../auth/types';
export type { Role };

export type Employee = {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    nomComplet: string;
    telephone?: string;
    poste?: string;
    departement?: string;
    roles: Role[];
    actif: boolean;
    dateCreation: string;
};

export type CreateEmployeeRequest = {
    email: string;
    motDePasse: string;
    nom: string;
    prenom: string;
    telephone?: string;
    poste?: string; // Nom du poste (lookup backend)
    departement?: string; // Nom du département (lookup backend)
    roles?: Role[];
    actif?: boolean;
};

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest> & {
    id: number;
};
