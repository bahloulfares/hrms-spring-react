import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Titre du Poste"
                id="titre"
                type="text"
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

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Salaire Min"
                    id="salaireMin"
                    type="number"
                    {...register('salaireMin')}
                />
                <Input
                    label="Salaire Max"
                    id="salaireMax"
                    type="number"
                    {...register('salaireMax')}
                />
            </div>

            <Textarea
                label="Description"
                id="description"
                {...register('description')}
            />

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    loading={mutation.isPending}
                >
                    {initialData ? 'Modifier' : 'Créer'}
                </Button>
            </div>

            {mutation.isError && (
                <div className="text-red-500 text-sm">Une erreur est survenue lors de la {initialData ? 'modification' : 'création'}.</div>
            )}
        </form>
    );
};
