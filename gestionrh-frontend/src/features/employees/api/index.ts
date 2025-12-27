import { axiosClient } from '../../../api/axiosClient';
import type { Employee, CreateEmployeeRequest } from '../types';

export const getEmployees = async (): Promise<Employee[]> => {
    const response = await axiosClient.get('/employes');
    return response.data;
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

export const updateEmployee = async (id: number, data: Partial<CreateEmployeeRequest>): Promise<Employee> => {
    const response = await axiosClient.put(`/employes/${id}`, data);
    return response.data;
};
