import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { AlertCircle, CalendarRange, Clock } from 'lucide-react';
import type { CreateCongeRequest, TypeConge } from '../types';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import toast from 'react-hot-toast';

interface Props {
    onSuccess: () => void;
}

export const LeaveRequestForm = ({ onSuccess }: Props) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, control, formState: { errors } } = useForm<CreateCongeRequest>({
        defaultValues: {
            type: 'CP',
            dureeType: 'JOURNEE_ENTIERE'
        }
    });

    // Watch for changes to calculate duration
    const startDate = useWatch({ control, name: 'dateDebut' });
    const endDate = useWatch({ control, name: 'dateFin' });
    const selectedTypeCode = useWatch({ control, name: 'type' });
    const dureeType = useWatch({ control, name: 'dureeType' });

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

        let baseDays = 0;

        if (selectedType?.compteWeekend) {
            const diffTime = Math.abs(end.getTime() - start.getTime());
            baseDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        } else {
            let count = 0;
            const cur = new Date(start);
            while (cur <= end) {
                const day = cur.getDay(); // 0 = Sunday, 6 = Saturday
                if (day !== 0 && day !== 6) {
                    count++;
                }
                cur.setDate(cur.getDate() + 1);
            }
            baseDays = count;
        }

        // Adjust based on duration type
        if (dureeType === 'DEMI_JOUR_MATIN' || dureeType === 'DEMI_JOUR_APRES_MIDI') {
            return baseDays * 0.5;
        } else if (dureeType === 'PAR_HEURE') {
            return 0; // Will be calculated on backend based on hours
        }

        return baseDays;
    }, [startDate, endDate, selectedType, dureeType]);

    const mutation = useMutation({
        mutationFn: leaveApi.createLeaveRequest,
        onMutate: async (newLeave) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['my-leaves'] });
            await queryClient.cancelQueries({ queryKey: ['my-balances'] });

            // Snapshot the previous values
            const previousLeaves = queryClient.getQueryData(['my-leaves']);
            const previousBalances = queryClient.getQueryData(['my-balances']);

            // Optimistically update to the new value
            queryClient.setQueryData(['my-leaves'], (old: any) => {
                if (!old) return old;
                return [
                    {
                        id: Date.now(), // temporary ID
                        ...newLeave,
                        statut: 'EN_ATTENTE',
                        createdAt: new Date().toISOString(),
                        _optimistic: true
                    },
                    ...old
                ];
            });

            // Return a context with the previous values
            return { previousLeaves, previousBalances };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
            queryClient.invalidateQueries({ queryKey: ['my-balances'] });
            toast.success('Demande de congé envoyée avec succès');
            onSuccess();
        },
        onError: (_error, _variables, context) => {
            // Rollback to the previous values on error
            if (context?.previousLeaves) {
                queryClient.setQueryData(['my-leaves'], context.previousLeaves);
            }
            if (context?.previousBalances) {
                queryClient.setQueryData(['my-balances'], context.previousBalances);
            }
            toast.error('Erreur lors de l\'envoi de la demande');
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
                <Input
                    type="date"
                    label="Date de début"
                    error={errors.dateDebut?.message}
                    {...register('dateDebut', { required: 'Obligatoire' })}
                />

                <Input
                    type="date"
                    label="Date de fin"
                    error={errors.dateFin?.message}
                    {...register('dateFin', { required: 'Obligatoire' })}
                />
            </div>

            <div className="flex gap-4">
                <Select
                    label="Type de congé"
                    wrapperClassName="flex-1"
                    {...register('type', { required: 'Obligatoire' })}
                >
                    {types?.map((t: TypeConge) => (
                        <option key={t.id} value={t.code}>{t.nom}</option>
                    ))}
                </Select>

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

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-900">Durée du congé</h3>
                </div>
                
                <Select
                    label="Type de durée"
                    {...register('dureeType')}
                >
                    <option value="JOURNEE_ENTIERE">Journée entière</option>
                    <option value="DEMI_JOUR_MATIN">Demi-journée (matin)</option>
                    <option value="DEMI_JOUR_APRES_MIDI">Demi-journée (après-midi)</option>
                    <option value="PAR_HEURE">Par heures</option>
                </Select>

                {dureeType === 'PAR_HEURE' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Input
                            type="time"
                            label="Heure de début"
                            error={errors.heureDebut?.message}
                            {...register('heureDebut', {
                                required: dureeType === 'PAR_HEURE' ? 'Obligatoire pour le mode par heures' : false
                            })}
                        />
                        <Input
                            type="time"
                            label="Heure de fin"
                            error={errors.heureFin?.message}
                            {...register('heureFin', {
                                required: dureeType === 'PAR_HEURE' ? 'Obligatoire pour le mode par heures' : false
                            })}
                        />
                    </div>
                )}

                {dureeType === 'PAR_HEURE' && (
                    <p className="text-xs text-blue-600 bg-blue-100/50 p-3 rounded-lg">
                        💡 Le nombre de jours sera automatiquement calculé en fonction des heures saisies (7h = 1 jour)
                    </p>
                )}
            </div>

            <Textarea
                label="Motif (optionnel)"
                placeholder="Pourquoi avez-vous besoin de ce congé ?"
                rows={3}
                {...register('motif')}
            />

            <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={mutation.isPending}
                className="w-full shadow-md mt-2"
            >
                Envoyer la demande
            </Button>
        </form>
    );
};
