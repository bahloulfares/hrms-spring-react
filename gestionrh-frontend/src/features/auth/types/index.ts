export type Role = {
  id: number;
  name: string;
};

export type User = {
  email: string;
  nomComplet: string;
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
  roles: Role[];
};
