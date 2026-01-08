import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDepartement, updateDepartement } from '../api';
import { getEmployees } from '../../employees/api';
import type { Departement, CreateDepartementRequest } from '../types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import toast from 'react-hot-toast';

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
            toast.success(initialData ? 'Département modifié avec succès' : 'Département créé avec succès');
            onSuccess();
        },
        onError: () => {
            toast.error(initialData ? 'Erreur lors de la modification du département' : 'Erreur lors de la création du département');
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
            <Input
                label="Nom du Département"
                id="nom"
                type="text"
                error={errors.nom?.message}
                {...register('nom', { required: 'Le nom est obligatoire' })}
            />

            <Textarea
                label="Description"
                id="description"
                {...register('description')}
            />

            <Select
                label="Manager / Chef de Département"
                id="managerId"
                {...register('managerId')}
            >
                <option value="">-- Aucun manager assigné --</option>
                {eligibleManagers.map(emp => (
                    <option key={emp.id} value={emp.id}>
                        {emp.prenom} {emp.nom} ({emp.email}) ({emp.roles.join(', ')})
                    </option>
                ))}
            </Select>

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
