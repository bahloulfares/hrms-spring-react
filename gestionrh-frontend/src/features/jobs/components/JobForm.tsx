import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Briefcase, DollarSign, AlertCircle } from 'lucide-react';
import { createPoste, updatePoste } from '../api';
import { getDepartements } from '../../departments/api';
import type { Poste, CreatePosteRequest } from '../types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import toast from 'react-hot-toast';

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
            toast.success(initialData ? 'Poste modifié avec succès' : 'Poste créé avec succès');
            onSuccess();
        },
        onError: () => {
            toast.error(initialData ? 'Erreur lors de la modification du poste' : 'Erreur lors de la création du poste');
        },
    });

    const onSubmit = (data: CreatePosteRequest) => {
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* En-tête du formulaire */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">
                        {initialData ? 'Modifier le poste' : 'Nouveau poste'}
                    </h3>
                    <p className="text-sm text-gray-500">Remplissez les informations ci-dessous</p>
                </div>
            </div>

            {/* Section Informations de base */}
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <Briefcase className="w-4 h-4" />
                    Informations de base
                </h4>
                
                <Input
                    label="Titre du Poste"
                    id="titre"
                    type="text"
                    placeholder="Ex: Développeur Full Stack, Chef de projet..."
                    error={errors.titre?.message}
                    {...register('titre', { required: 'Le titre est obligatoire' })}
                />

                <Select
                    label="Département"
                    id="departementId"
                    error={errors.departementId?.message}
                    {...register('departementId', { required: 'Le département est obligatoire' })}
                >
                    <option value="">Sélectionner un département</option>
                    {departements?.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.nom}</option>
                    ))}
                </Select>

                <Textarea
                    label="Description"
                    id="description"
                    placeholder="Décrivez les missions, responsabilités et compétences requises..."
                    rows={4}
                    {...register('description')}
                />
            </div>

            {/* Section Fourchette salariale */}
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <DollarSign className="w-4 h-4" />
                    Fourchette salariale
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Salaire Minimum (DT)"
                        id="salaireMin"
                        type="number"
                        placeholder="1000"
                        {...register('salaireMin')}
                    />
                    <Input
                        label="Salaire Maximum (DT)"
                        id="salaireMax"
                        type="number"
                        placeholder="2000"
                        {...register('salaireMax')}
                    />
                </div>
                
                <p className="flex items-start gap-2 text-xs text-gray-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Indiquez la fourchette salariale mensuelle en Dinars Tunisiens
                </p>
            </div>

            {/* Message d'erreur */}
            {mutation.isError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-red-900">Erreur</p>
                        <p className="text-red-800 text-sm">Une erreur est survenue lors de la {initialData ? 'modification' : 'création'}.</p>
                    </div>
                </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                    type="submit"
                    variant="primary"
                    loading={mutation.isPending}
                    className="min-w-[120px]"
                >
                    {initialData ? 'Modifier' : 'Créer'}
                </Button>
            </div>
        </form>
    );
};
