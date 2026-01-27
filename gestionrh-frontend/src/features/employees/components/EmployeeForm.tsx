import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateEmployeeRequest, Role, Employee } from '../types';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createEmployee, updateEmployee } from '../api';
import { getDepartements } from '../../departments/api';
import { getPostesByDepartement } from '../../jobs/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

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
            toast.success('Employé créé avec succès');
            onSuccess();
        },
        onError: () => {
            toast.error('Erreur lors de la création de l\'employé');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateEmployeeRequest }) => updateEmployee(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employé modifié avec succès');
            onSuccess();
        },
        onError: () => {
            toast.error('Erreur lors de la modification de l\'employé');
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
            updateMutation.mutate({ id: initialData.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isEditMode = !!initialData;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            {/* Section Informations Personnelles */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-blue-600"></div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Informations Personnelles</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Nom"
                        id="nom"
                        type="text"
                        error={errors.nom?.message}
                        {...register('nom', { required: 'Requis' })}
                    />
                    <Input
                        label="Prénom"
                        id="prenom"
                        type="text"
                        error={errors.prenom?.message}
                        {...register('prenom', { required: 'Requis' })}
                    />
                </div>
                <Input
                    label="Email"
                    id="email"
                    type="email"
                    error={errors.email?.message}
                    {...register('email', { required: 'Requis' })}
                />
                <Input
                    label="Téléphone"
                    id="telephone"
                    type="tel"
                    error={errors.telephone?.message}
                    {...register('telephone', {
                        pattern: {
                            value: /^[0-9]{8}$/,
                            message: 'Le téléphone doit contenir 8 chiffres'
                        }
                    })}
                />
            </div>

            {/* Section Sécurité */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-amber-600"></div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Sécurité</h3>
                </div>
                <Input
                    label={`Mot de passe ${isEditMode ? '(laisser vide pour ne pas changer)' : ''}`}
                    id="motDePasse"
                    type="password"
                    error={errors.motDePasse?.message}
                    {...register('motDePasse', {
                        required: isEditMode ? false : 'Requis',
                        minLength: { value: 8, message: '8 caractères minimum' },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: 'Format requis: 8+ car., Maj, min, chiffre, spécial (@$!%*?&)'
                        }
                    })}
                />
            </div>

            {/* Section Affectation Professionnelle */}
            <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-blue-600"></div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Affectation Professionnelle</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Département"
                        id="departement"
                        {...register('departement')}
                        onChange={(e) => {
                            register('departement').onChange(e);
                            setValue('poste', '');
                        }}
                    >
                        <option value="">Sélectionner un département</option>
                        {departements?.map(d => <option key={d.id} value={d.nom}>{d.nom}</option>)}
                    </Select>

                    <Select
                        label="Poste"
                        id="poste"
                        disabled={!selectedDeptId || isLoadingPostes}
                        helperText={!selectedDeptId && !isLoadingPostes ? "Veuillez d'abord sélectionner un département." : undefined}
                        {...register('poste')}
                    >
                        <option value="">{selectedDeptId ? 'Sélectionner un poste' : 'Choisir un département d\'abord'}</option>
                        {filteredPostes?.map(p => <option key={p.id} value={p.titre}>{p.titre}</option>)}
                    </Select>
                </div>
            </div>

            {/* Section Rôle & Accès */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-purple-600"></div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Rôle & Accès</h3>
                </div>
                <Select
                    label="Rôle"
                    id="roles"
                    error={errors.roles?.message}
                    defaultValue={initialData?.roles?.[0] || "EMPLOYE"}
                    {...register('roles', { required: 'Requis' })}
                >
                    <option value="EMPLOYE">👥 Employé</option>
                    <option value="MANAGER">👨‍💼 Manager</option>
                    <option value="RH">📋 RH</option>
                    <option value="ADMIN">🔐 Admin</option>
                </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-black hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200/50 flex items-center gap-2"
                >
                    {createMutation.isPending || updateMutation.isPending ? (
                        <>
                            <span className="inline-flex animate-spin">⏳</span>
                            Enregistrement...
                        </>
                    ) : (
                        isEditMode ? 'Modifier' : 'Créer'
                    )}
                </button>
            </div>
            {(createMutation.isError || updateMutation.isError) && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Erreur lors de l'enregistrement.
                </div>
            )}
        </form>
    );
};
