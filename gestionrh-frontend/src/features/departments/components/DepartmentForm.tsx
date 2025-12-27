import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartement, updateDepartement } from '../api';
import type { Departement, CreateDepartementRequest } from '../types';

interface DepartmentFormProps {
    initialData?: Departement | null;
    onSuccess: () => void;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ initialData, onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDepartementRequest>();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (initialData) {
            reset({
                nom: initialData.nom,
                description: initialData.description || '',
            });
        } else {
            reset({
                nom: '',
                description: '',
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
        mutation.mutate(data);
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
