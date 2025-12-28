import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDepartement, updateDepartement } from '../api';
import { getEmployees } from '../../employees/api';
import type { Departement, CreateDepartementRequest } from '../types';

interface DepartmentFormProps {
    initialData?: Departement | null;
    onSuccess: () => void;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ initialData, onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDepartementRequest>();
    const queryClient = useQueryClient();

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: getEmployees,
    });

    // Filtre pour ne garder que les profils capables de gérer un département
    const eligibleManagers = useMemo(() => {
        if (!employees) return [];
        return employees.filter(emp =>
            emp.roles.some(role => ['ADMIN', 'RH', 'MANAGER'].includes(role))
        );
    }, [employees]);

    useEffect(() => {
        if (initialData) {
            reset({
                nom: initialData.nom,
                description: initialData.description || '',
                managerId: initialData.managerId
            });
        } else {
            reset({
                nom: '',
                description: '',
                managerId: undefined
            });
        }
    }, [initialData, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateDepartementRequest) =>
            initialData
                ? updateDepartement(initialData.id, data)
                : createDepartement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departements'] });
            onSuccess();
        },
    });

    const onSubmit = (data: CreateDepartementRequest) => {
        // Prepare data: handle empty string for managerId
        const payload = {
            ...data,
            managerId: data.managerId ? Number(data.managerId) : undefined
        };
        mutation.mutate(payload);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom du Département</label>
                <input
                    type="text"
                    id="nom"
                    {...register('nom', { required: 'Le nom est obligatoire' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="description"
                    {...register('description')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>

            <div>
                <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">Manager / Chef de Département</label>
                <select
                    id="managerId"
                    {...register('managerId')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                >
                    <option value="">-- Aucun manager assigné --</option>
                    {eligibleManagers.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.prenom} {emp.nom} ({emp.email}) ({emp.roles.join(', ')})
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {mutation.isPending ? (initialData ? 'Modification...' : 'Création...') : (initialData ? 'Modifier' : 'Créer')}
                </button>
            </div>

            {mutation.isError && (
                <div className="text-red-500 text-sm">Une erreur est survenue lors de la {initialData ? 'modification' : 'création'}.</div>
            )}
        </form>
    );
};
