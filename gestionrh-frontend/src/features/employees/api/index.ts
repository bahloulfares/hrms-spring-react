import { axiosClient } from '../../../api/axiosClient';
import type { Employee, CreateEmployeeRequest } from '../types';

export const getEmployees = async (): Promise<Employee[]> => {
    const response = await axiosClient.get('/employes');
    // Le backend retourne une Page<Employe> ou un array?
    // Si c'est un objet avec .content (pagination), extraire le tableau
    if (Array.isArray(response.data)) {
        return response.data;
    }
    // Si c'est un Page object
    if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
    }
    // Fallback: retourner vide si structure inattendue
    console.warn('[API] getEmployees: unexpected response structure', response.data);
    return [];
};

export const getEmployee = async (id: number): Promise<Employee> => {
    const response = await axiosClient.get(`/employes/${id}`);
    return response.data;
};

export const createEmployee = async (data: CreateEmployeeRequest): Promise<Employee> => {
    const response = await axiosClient.post('/employes', data);
    return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
    await axiosClient.delete(`/employes/${id}`);
};

export const reactivateEmployee = async (id: number): Promise<Employee> => {
    const response = await axiosClient.post(`/employes/${id}/reactivate`);
    return response.data;
};

export const updateEmployee = async (id: number, data: Partial<CreateEmployeeRequest>): Promise<Employee> => {
    const response = await axiosClient.put(`/employes/${id}`, data);
    return response.data;
};
