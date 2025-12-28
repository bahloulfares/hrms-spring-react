import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { AlertCircle } from 'lucide-react';
import type { CreateCongeRequest } from '../types';

interface Props {
    onSuccess: () => void;
}

export const LeaveRequestForm = ({ onSuccess }: Props) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<CreateCongeRequest>({
        defaultValues: {
            type: 'CP'
        }
    });

    const { data: types } = useQuery({
        queryKey: ['leave-types'],
        queryFn: leaveApi.getLeaveTypes
    });

    const mutation = useMutation({
        mutationFn: leaveApi.createLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
            queryClient.invalidateQueries({ queryKey: ['my-balances'] });
            onSuccess();
        }
    });

    const onSubmit = (data: CreateCongeRequest) => {
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mutation.isError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{(mutation.error as any)?.response?.data?.message || 'Une erreur est survenue'}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date de début</label>
                    <input
                        type="date"
                        {...register('dateDebut', { required: 'Obligatoire' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    {errors.dateDebut && <span className="text-xs text-red-500">{errors.dateDebut.message}</span>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date de fin</label>
                    <input
                        type="date"
                        {...register('dateFin', { required: 'Obligatoire' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    {errors.dateFin && <span className="text-xs text-red-500">{errors.dateFin.message}</span>}
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Type de congé</label>
                <select
                    {...register('type', { required: 'Obligatoire' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                >
                    {types?.map(t => (
                        <option key={t.id} value={t.code}>{t.nom}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Motif (optionnel)</label>
                <textarea
                    {...register('motif')}
                    rows={3}
                    placeholder="Pourquoi avez-vous besoin de ce congé ?"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md disabled:bg-gray-300 disabled:shadow-none mt-2"
            >
                {mutation.isPending ? 'Envoi en cours...' : 'Envoyer la demande'}
            </button>
        </form>
    );
};
