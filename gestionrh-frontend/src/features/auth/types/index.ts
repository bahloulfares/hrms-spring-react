export type Role = 'ADMIN' | 'RH' | 'MANAGER' | 'EMPLOYE';

export type User = {
  email: string;
  nomComplet: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  departement?: string;
  poste?: string;
  roles: Role[];
  token: string;
};

export type LoginRequest = {
  email: string;
  motDePasse: string;
};

export type LoginResponse = {
  token: string;
  type: string;
  email: string;
  nomComplet: string;
  prenom: string;
  nom: string;
  telephone: string;
  departement: string;
  poste: string;
  roles: Role[];
};
