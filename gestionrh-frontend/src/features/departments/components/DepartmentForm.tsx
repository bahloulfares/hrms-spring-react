import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, User, AlertCircle } from 'lucide-react';
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* En-tête du formulaire */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">
                        {initialData ? 'Modifier le département' : 'Nouveau département'}
                    </h3>
                    <p className="text-sm text-gray-500">Remplissez les informations ci-dessous</p>
                </div>
            </div>

            {/* Section Informations de base */}
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <Building2 className="w-4 h-4" />
                    Informations de base
                </h4>
                
                <Input
                    label="Nom du Département"
                    id="nom"
                    type="text"
                    placeholder="Ex: Informatique, Ressources Humaines..."
                    error={errors.nom?.message}
                    {...register('nom', { required: 'Le nom est obligatoire' })}
                />

                <Textarea
                    label="Description"
                    id="description"
                    placeholder="Décrivez le rôle et les responsabilités du département..."
                    rows={4}
                    {...register('description')}
                />
            </div>

            {/* Section Responsable */}
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <User className="w-4 h-4" />
                    Responsable
                </h4>
                
                <Select
                    label="Manager / Chef de Département"
                    id="managerId"
                    {...register('managerId')}
                >
                    <option value="">-- Aucun manager assigné --</option>
                    {eligibleManagers.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.prenom} {emp.nom} ({emp.email}) - {emp.roles.join(', ')}
                        </option>
                    ))}
                </Select>
                
                <p className="flex items-start gap-2 text-xs text-gray-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Seuls les employés avec les rôles ADMIN, RH ou MANAGER peuvent être assignés comme managers
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
