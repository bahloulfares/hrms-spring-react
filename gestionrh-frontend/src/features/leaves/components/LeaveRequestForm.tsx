import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { AlertCircle, CalendarRange } from 'lucide-react';
import type { CreateCongeRequest, TypeConge } from '../types';
import { useMemo } from 'react';

interface Props {
    onSuccess: () => void;
}

export const LeaveRequestForm = ({ onSuccess }: Props) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, control, formState: { errors } } = useForm<CreateCongeRequest>({
        defaultValues: {
            type: 'CP'
        }
    });

    // Watch for changes to calculate duration
    const startDate = useWatch({ control, name: 'dateDebut' });
    const endDate = useWatch({ control, name: 'dateFin' });
    const selectedTypeCode = useWatch({ control, name: 'type' });

    const { data: types } = useQuery({
        queryKey: ['leave-types'],
        queryFn: leaveApi.getLeaveTypes
    });

    const selectedType = useMemo(() =>
        types?.find((t: TypeConge) => t.code === selectedTypeCode),
        [types, selectedTypeCode]);

    const calculatedDays = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return 0;

        if (selectedType?.compteWeekend) {
            const diffTime = Math.abs(end.getTime() - start.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        let count = 0;
        const cur = new Date(start);
        while (cur <= end) {
            const day = cur.getDay(); // 0 = Sunday, 6 = Saturday
            if (day !== 0 && day !== 6) {
                count++;
            }
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    }, [startDate, endDate, selectedType]);

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
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    />
                    {errors.dateDebut && <span className="text-xs text-red-500">{errors.dateDebut.message}</span>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date de fin</label>
                    <input
                        type="date"
                        {...register('dateFin', { required: 'Obligatoire' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    />
                    {errors.dateFin && <span className="text-xs text-red-500">{errors.dateFin.message}</span>}
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Type de congé</label>
                    <select
                        {...register('type', { required: 'Obligatoire' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white cursor-pointer"
                    >
                        {types?.map((t: TypeConge) => (
                            <option key={t.id} value={t.code}>{t.nom}</option>
                        ))}
                    </select>
                </div>

                {calculatedDays > 0 && (
                    <div className="w-32 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center p-2 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            <CalendarRange size={10} />
                            Total
                        </div>
                        <div className="text-xl font-black text-slate-800 leading-none">
                            {calculatedDays} <span className="text-[10px] font-bold text-slate-400">J</span>
                        </div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {selectedType?.compteWeekend ? 'Calendaires' : 'Ouvrés'}
                        </div>
                    </div>
                )}
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
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none mt-2"
            >
                {mutation.isPending ? 'Envoi en cours...' : 'Envoyer la demande'}
            </button>
        </form>
    );
};
