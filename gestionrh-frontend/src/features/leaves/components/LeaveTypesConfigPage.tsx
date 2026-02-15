import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { Plus, Edit2, Trash2, Calendar, Hash, Tag, AlertCircle, RotateCcw } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { TypeConge } from '../types';

export const LeaveTypesConfigPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TypeConge | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: types = [], isLoading } = useQuery({
        queryKey: ['admin-leave-types', showInactive],
        queryFn: showInactive ? leaveApi.getAdminTypesAll : leaveApi.getAdminTypes,
        staleTime: 0, // Force toujours un refetch
    });

    const deleteMutation = useMutation({
        mutationFn: leaveApi.deleteType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-leave-types'] });
            setErrorMessage(null);
            toast.success('Type de congé supprimé avec succès');
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            const message = error?.response?.data?.message || 'Erreur lors de la suppression';
            setErrorMessage(message);
            toast.error(message);
            setTimeout(() => setErrorMessage(null), 8000);
        }
    });

    const reactivateMutation = useMutation({
        mutationFn: leaveApi.reactivateType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-leave-types'] });
            setErrorMessage(null);
            toast.success('Type de congé réactivé avec succès');
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            const message = error?.response?.data?.message || 'Erreur lors de la réactivation';
            setErrorMessage(message);
            toast.error(message);
            setTimeout(() => setErrorMessage(null), 8000);
        }
    });

    const openModal = (type: TypeConge | null = null) => {
        setSelectedType(type);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const displayedTypes = showInactive
        ? [...types].sort((a, b) => Number(b.actif !== false) - Number(a.actif !== false))
        : types;

    return (
        <div className="space-y-8">
            {errorMessage && (
                <div className="p-5 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">Opération impossible</h4>
                        <p className="text-sm leading-relaxed">{errorMessage}</p>
                    </div>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="text-red-400 hover:text-red-600 text-xl leading-none"
                    >
                        ×
                    </button>
                </div>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Configuration des Congés</h2>
                    <p className="text-slate-500 font-medium">
                        Gérez les types de congés et leurs quotas.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            className="accent-blue-600"
                        />
                        Afficher les inactifs
                    </label>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Nouveau Type
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedTypes.map((type: TypeConge) => (
                    <div
                        key={type.id}
                        className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 group relative overflow-hidden ${type.actif === false ? 'opacity-60' : 'hover:shadow-xl'}`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Calendar className="w-16 h-16 text-slate-900" />
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                {type.actif === false ? (
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Réactiver le type "${type.nom}" ?`)) {
                                                reactivateMutation.mutate(type.id);
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => openModal(type)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Supprimer le type "${type.nom}" ?`)) {
                                                    deleteMutation.mutate(type.id);
                                                }
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 mb-6">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">CODE: {type.code}</div>
                            <h3 className="text-xl font-bold text-slate-900">{type.nom}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 py-4 px-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                                <Hash className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-2xl font-black text-slate-900 leading-tight">{type.joursParAn}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">jours / an</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-3 py-4 px-5 rounded-2xl border border-slate-100/50 ${type.compteWeekend ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                <Calendar className="w-5 h-5 opacity-40" />
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter leading-tight">Calcul</div>
                                    <div className="text-xs font-bold leading-none">{type.compteWeekend ? 'Calendaires' : 'Ouvrés'}</div>
                                </div>
                            </div>
                        </div>

                        {type.peutDeborderSurCP && (
                            <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Débordement sur CP autorisé</span>
                            </div>
                        )}
                        {type.actif === false && (
                            <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Type inactif
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedType ? 'Modifier le type' : 'Ajouter un type'}
            >
                <TypeCongeForm
                    initialData={selectedType}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedType(null);
                    }}
                />
            </Modal>
        </div>
    );
};

const TypeCongeForm = ({
    initialData,
    onSuccess,
}: {
    initialData: TypeConge | null;
    onSuccess: () => void;
}) => {
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TypeConge>({
        defaultValues: {
            nom: '',
            code: '',
            joursParAn: 25,
            compteWeekend: false,
            peutDeborderSurCP: false,
        },
    });

    // 🔥 FIX IMPORTANT : reset quand on change de type
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                nom: '',
                code: '',
                joursParAn: 25,
                compteWeekend: false,
                peutDeborderSurCP: false,
            });
        }
    }, [initialData, reset]);

    const mutation = useMutation({
        mutationFn: (data: TypeConge) =>
            initialData
                ? leaveApi.updateType(initialData.id, data)
                : leaveApi.createType(data),
        onSuccess: async (data: TypeConge) => {
            await queryClient.invalidateQueries({ queryKey: ['admin-leave-types'] });
            await queryClient.refetchQueries({ queryKey: ['admin-leave-types'] });
            toast.success(
                initialData 
                    ? `Type "${data.nom}" modifié avec succès`
                    : `Type "${data.nom}" créé avec succès`
            );
            onSuccess();
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            const message = error?.response?.data?.message || 'Une erreur est survenue';
            toast.error(message);
        },
    });

    const onSubmit = (data: TypeConge) => {
        mutation.mutate({
            ...data,
            actif: true, // 🔥 IMPORTANT pour le soft delete
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {mutation.isError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue'}</p>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nom complet</label>
                <input
                    {...register('nom', { 
                        required: 'Le nom est obligatoire',
                        maxLength: {
                            value: 100,
                            message: 'Maximum 100 caractères'
                        }
                    })}
                    placeholder="Ex: Congé Exceptionnel"
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
                {errors.nom && <p className="text-xs text-red-500 font-medium ml-1">{errors.nom.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Code court</label>
                    <input
                        {...register('code', { 
                            required: 'Le code est obligatoire',
                            pattern: {
                                value: /^[A-Z0-9_]+$/,
                                message: 'Majuscules, chiffres et _ uniquement'
                            },
                            maxLength: {
                                value: 20,
                                message: 'Maximum 20 caractères'
                            }
                        })}
                        placeholder="Ex: CEXP"
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all uppercase"
                        style={{ textTransform: 'uppercase' }}
                    />
                    {errors.code && <p className="text-xs text-red-500 font-medium ml-1">{errors.code.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Quota (Jours)</label>
                    <input
                        type="number"
                        {...register('joursParAn', { 
                            required: 'Le quota est obligatoire',
                            min: { value: 1, message: 'Minimum 1 jour' },
                            max: { value: 365, message: 'Maximum 365 jours' },
                            valueAsNumber: true
                        })}
                        placeholder="Ex: 25"
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    />
                    {errors.joursParAn && <p className="text-xs text-red-500 font-medium ml-1">{errors.joursParAn.message}</p>}
                </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            Inclure les Weekends
                        </label>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                            Si activé, les samedis et dimanches seront déduits du solde (ex: Maladie).
                            Sinon, seuls les jours ouvrés comptent (ex: CP).
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            {...register('compteWeekend')}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-blue-600 transition-all shadow-inner"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            Autoriser le débordement sur CP
                        </label>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                            Si activé, le surplus de jours sera automatiquement déduit du solde Congés Payés (CP).
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            {...register('peutDeborderSurCP')}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-purple-600 transition-all shadow-inner"></div>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed mt-4"
            >
                {mutation.isPending ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer le type'}
            </button>
        </form>
    );
};
