export type Departement = {
    id: number;
    nom: string;
    description?: string;
    managerId?: number;
    managerNom?: string;
};

export type CreateDepartementRequest = {
    nom: string;
    description?: string;
    managerId?: number;
};
