import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createPoste, updatePoste } from '../api';
import { getDepartements } from '../../departments/api';
import type { Poste, CreatePosteRequest } from '../types';

interface JobFormProps {
    initialData?: Poste | null;
    onSuccess: () => void;
}

export const JobForm: React.FC<JobFormProps> = ({ initialData, onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePosteRequest>();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (initialData) {
            reset({
                titre: initialData.titre,
                departementId: initialData.departementId,
                salaireMin: initialData.salaireMin,
                salaireMax: initialData.salaireMax,
                description: initialData.description || '',
            });
        } else {
            reset({
                titre: '',
                departementId: undefined,
                salaireMin: 0,
                salaireMax: 0,
                description: '',
            });
        }
    }, [initialData, reset]);

    const { data: departements } = useQuery({
        queryKey: ['departements'],
        queryFn: getDepartements,
    });

    const mutation = useMutation({
        mutationFn: (data: CreatePosteRequest) =>
            initialData
                ? updatePoste(initialData.id, data)
                : createPoste(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postes'] });
            onSuccess();
        },
    });

    const onSubmit = (data: CreatePosteRequest) => {
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Titre du Poste</label>
                <input
                    type="text"
                    id="titre"
                    {...register('titre', { required: 'Le titre est obligatoire' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
                {errors.titre && <p className="text-red-500 text-xs mt-1">{errors.titre.message}</p>}
            </div>

            <div>
                <label htmlFor="departementId" className="block text-sm font-medium text-gray-700">Département</label>
                <select
                    id="departementId"
                    {...register('departementId', { required: 'Le département est obligatoire' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                >
                    <option value="">Sélectionner un département</option>
                    {departements?.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.nom}</option>
                    ))}
                </select>
                {errors.departementId && <p className="text-red-500 text-xs mt-1">{errors.departementId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="salaireMin" className="block text-sm font-medium text-gray-700">Salaire Min</label>
                    <input
                        type="number"
                        id="salaireMin"
                        {...register('salaireMin')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label htmlFor="salaireMax" className="block text-sm font-medium text-gray-700">Salaire Max</label>
                    <input
                        type="number"
                        id="salaireMax"
                        {...register('salaireMax')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
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
