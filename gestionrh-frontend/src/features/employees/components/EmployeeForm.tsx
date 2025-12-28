import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateEmployeeRequest, Role, Employee } from '../types';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createEmployee, updateEmployee } from '../api';
import { getDepartements } from '../../departments/api';
import { getPostesByDepartement } from '../../jobs/api';

interface EmployeeFormProps {
    onSuccess: () => void;
    initialData?: Employee | null;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSuccess, initialData }) => {
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CreateEmployeeRequest>();
    const queryClient = useQueryClient();

    const selectedDepartementName = watch('departement');

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                nom: initialData.nom,
                prenom: initialData.prenom,
                email: initialData.email,
                telephone: initialData.telephone,
                departement: initialData.departement,
                poste: initialData.poste,
                roles: initialData.roles
            });
        } else {
            reset({
                nom: '', prenom: '', email: '', telephone: '', motDePasse: '', roles: []
            });
        }
    }, [initialData, reset]);

    const { data: departements } = useQuery({ queryKey: ['departements'], queryFn: getDepartements });

    // Solve ID of selected department to fetch related jobs
    const selectedDeptId = departements?.find(d => d.nom === selectedDepartementName)?.id;

    const { data: filteredPostes, isLoading: isLoadingPostes } = useQuery({
        queryKey: ['postes', selectedDeptId],
        queryFn: () => getPostesByDepartement(selectedDeptId!),
        enabled: !!selectedDeptId
    });

    const createMutation = useMutation({
        mutationFn: createEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            onSuccess();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateEmployeeRequest>) => updateEmployee(initialData!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            onSuccess();
        },
    });

    const onSubmit = (data: CreateEmployeeRequest) => {
        const selectedRoles = Array.isArray(data.roles) ? data.roles : [data.roles].filter(Boolean);
        const payload = {
            ...data,
            roles: selectedRoles as Role[],
            actif: true
        };

        if (initialData) {
            // For update, we might not send password if empty (logic needed in handleSubmit or specific handling)
            if (!data.motDePasse) delete (payload as any).motDePasse;
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const isEditMode = !!initialData;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                    <input type="text" id="nom" {...register('nom', { required: 'Requis' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    {errors.nom && <p className="text-red-500 text-xs">{errors.nom.message}</p>}
                </div>
                <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input type="text" id="prenom" {...register('prenom', { required: 'Requis' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    {errors.prenom && <p className="text-red-500 text-xs">{errors.prenom.message}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" {...register('email', { required: 'Requis' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                    type="text"
                    id="telephone"
                    {...register('telephone', {
                        pattern: {
                            value: /^[0-9]{8}$/,
                            message: 'Le téléphone doit contenir 8 chiffres'
                        }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
                {errors.telephone && <p className="text-red-500 text-xs">{errors.telephone.message}</p>}
            </div>

            <div>
                <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
                    Mot de passe {isEditMode && '(laisser vide pour ne pas changer)'}
                </label>
                <input
                    type="password"
                    id="motDePasse"
                    {...register('motDePasse', {
                        required: isEditMode ? false : 'Requis',
                        minLength: { value: 8, message: '8 caractères minimum' },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: 'Format requis: 8+ car., Maj, min, chiffre, spécial (@$!%*?&)'
                        }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
                {errors.motDePasse && <p className="text-red-500 text-xs">{errors.motDePasse.message}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Affectation Professionnelle</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="departement" className="block text-sm font-medium text-gray-700">Département</label>
                        <select
                            id="departement"
                            {...register('departement')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => {
                                register('departement').onChange(e);
                                setValue('poste', ''); // Reset poste when department changes
                            }}
                        >
                            <option value="">Sélectionner un département</option>
                            {departements?.map(d => <option key={d.id} value={d.nom}>{d.nom}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="poste" className="block text-sm font-medium text-gray-700">
                            Poste {isLoadingPostes && <span className="text-xs text-blue-500 animate-pulse ml-2">(Chargement...)</span>}
                        </label>
                        <select
                            id="poste"
                            {...register('poste')}
                            disabled={!selectedDeptId || isLoadingPostes}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white focus:ring-blue-500 focus:border-blue-500 ${(!selectedDeptId || isLoadingPostes) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                            <option value="">{selectedDeptId ? 'Sélectionner un poste' : 'Choisir un département d\'abord'}</option>
                            {filteredPostes?.map(p => <option key={p.id} value={p.titre}>{p.titre}</option>)}
                        </select>
                        {!selectedDeptId && !isLoadingPostes && (
                            <p className="text-[10px] text-gray-500 mt-1 italic">Veuillez d'abord sélectionner un département.</p>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="roles" className="block text-sm font-medium text-gray-700">Rôle</label>
                <select
                    id="roles"
                    {...register('roles', { required: 'Requis' })}
                    // Handle multiple roles if needed, for now simplistic defaulting to first role or EMPLOYE
                    defaultValue={initialData?.roles?.[0] || "EMPLOYE"}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                >
                    <option value="EMPLOYE">Employé</option>
                    <option value="MANAGER">Manager</option>
                    <option value="RH">RH</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                    {(createMutation.isPending || updateMutation.isPending) ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer')}
                </button>
            </div>
            {(createMutation.isError || updateMutation.isError) && <div className="text-red-500 text-sm">Erreur lors de l'enregistrement.</div>}
        </form>
    );
};
