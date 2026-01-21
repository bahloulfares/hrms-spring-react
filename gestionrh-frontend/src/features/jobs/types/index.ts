export type Poste = {
    id: number;
    titre: string;
    description?: string;
    salaireMin?: number;
    salaireMax?: number;
    departementId: number;
    departementNom?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type CreatePosteRequest = {
    titre: string;
    description?: string;
    salaireMin?: number;
    salaireMax?: number;
    departementId: number;
};
