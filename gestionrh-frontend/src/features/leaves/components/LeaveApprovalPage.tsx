import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import type { Conge } from '../types';
import { useAuthCheck } from '@/hooks/useAuthCheck';

export const LeaveApprovalPage = () => {
    const { isAuthorized } = useAuthCheck({ requiredRoles: ['ADMIN', 'RH', 'MANAGER'] });
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('');

    const { data: pendingRequests, isLoading } = useQuery({
        queryKey: ['pending-leaves'],
        queryFn: leaveApi.getPendingRequests
    });

    const validationMutation = useMutation({
        mutationFn: ({ id, statut, commentaire }: { id: number, statut: 'APPROUVE' | 'REJETE', commentaire: string }) =>
            leaveApi.validateRequest(id, { statut, commentaire }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-leaves'] });
        }
    });

    const handleValidate = (id: number, statut: 'APPROUVE' | 'REJETE') => {
        const commentaire = window.prompt(`Commentaire pour le ${statut.toLowerCase()} :`);

        // Si l'utilisateur clique sur "Annuler", on ne fait rien
        if (commentaire === null) return;

        // Pour un rejet, on peut exiger un motif
        if (statut === 'REJETE' && !commentaire.trim()) {
            alert('Un motif est obligatoire pour rejeter une demande.');
            return;
        }

        validationMutation.mutate({ id, statut, commentaire: commentaire || '' });
    };

    const filtered = pendingRequests?.filter(r =>
        r.employeNom.toLowerCase().includes(filter.toLowerCase()) ||
        r.type.toLowerCase().includes(filter.toLowerCase())
    );

    if (!isAuthorized) return null;

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Validations en Attente</h2>
                <p className="text-sm text-gray-500">Gérez les demandes de congés de votre équipe.</p>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <Search className="w-5 h-5 text-gray-400 ml-2" />
                <input
                    type="text"
                    placeholder="Rechercher par employé ou type..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-1 outline-none text-sm"
                />
                <Filter className="w-5 h-5 text-gray-400 mr-2" />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filtered?.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Aucune demande en attente pour le moment.</p>
                    </div>
                ) : (
                    filtered?.map((request: Conge) => (
                        <div key={request.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {request.employeNom.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{request.employeNom}</div>
                                    <div className="text-xs text-gray-500">{request.employeEmail}</div>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Type</div>
                                    <div className="text-sm font-semibold text-gray-700">{request.type}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Durée</div>
                                    <div className="text-sm font-semibold text-gray-700">{request.nombreJours} jours</div>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Période</div>
                                    <div className="text-sm font-semibold text-gray-700">
                                        Du {new Date(request.dateDebut).toLocaleDateString()} au {new Date(request.dateFin).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleValidate(request.id, 'APPROUVE')}
                                    disabled={validationMutation.isPending}
                                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-300"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approuver
                                </button>
                                <button
                                    onClick={() => handleValidate(request.id, 'REJETE')}
                                    disabled={validationMutation.isPending}
                                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors border border-red-100 disabled:bg-gray-50 disabled:text-gray-300"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Rejeter
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
