import { axiosClient } from '../../../api/axiosClient';
import type { Poste, CreatePosteRequest } from '../types';

export const getPostes = async (): Promise<Poste[]> => {
    const response = await axiosClient.get('/postes');
    return response.data;
};

export const getPostesByDepartement = async (departementId: number): Promise<Poste[]> => {
    const response = await axiosClient.get(`/postes/departement/${departementId}`);
    return response.data;
};

export const createPoste = async (data: CreatePosteRequest): Promise<Poste> => {
    const response = await axiosClient.post('/postes', data);
    return response.data;
};

export const updatePoste = async (id: number, data: CreatePosteRequest): Promise<Poste> => {
    const response = await axiosClient.put(`/postes/${id}`, data);
    return response.data;
};

export const deletePoste = async (id: number): Promise<void> => {
    await axiosClient.delete(`/postes/${id}`);
};

