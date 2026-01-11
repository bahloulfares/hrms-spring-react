import { axiosClient } from '../../../api/axiosClient';
import type { Departement, CreateDepartementRequest } from '../types';

export const getDepartements = async (): Promise<Departement[]> => {
    const response = await axiosClient.get('/departements');
    if (Array.isArray(response.data)) {
        return response.data;
    }
    if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
    }
    console.warn('[API] getDepartements: unexpected response structure', response.data);
    return [];
};

export const getDepartement = async (id: number): Promise<Departement> => {
    const response = await axiosClient.get(`/departements/${id}`);
    return response.data;
};

export const createDepartement = async (data: CreateDepartementRequest): Promise<Departement> => {
    const response = await axiosClient.post('/departements', data);
    return response.data;
};

export const updateDepartement = async (id: number, data: CreateDepartementRequest): Promise<Departement> => {
    const response = await axiosClient.put(`/departements/${id}`, data);
    return response.data;
};

export const deleteDepartement = async (id: number): Promise<void> => {
    await axiosClient.delete(`/departements/${id}`);
};
