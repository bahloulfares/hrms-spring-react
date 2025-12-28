import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api';
import {
    Calendar, Plus, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { LeaveRequestForm } from './LeaveRequestForm';
import type { Conge, SoldeConge } from '../types';

export const LeavesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: leaves, isLoading: leavesLoading } = useQuery({
        queryKey: ['my-leaves'],
        queryFn: leaveApi.getMyLeaves
    });

    const { data: balances, isLoading: balancesLoading } = useQuery({
        queryKey: ['my-balances'],
        queryFn: leaveApi.getMyBalances
    });

    const cancelMutation = useMutation({
        mutationFn: leaveApi.cancelLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
            queryClient.invalidateQueries({ queryKey: ['my-balances'] });
        }
    });

    const getStatutColor = (statut: string) => {
        switch (statut) {
            case 'APPROUVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJETE': return 'bg-red-100 text-red-700 border-red-200';
            case 'ANNULE': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatutIcon = (statut: string) => {
        switch (statut) {
            case 'APPROUVE': return <CheckCircle2 className="w-4 h-4" />;
            case 'REJETE': return <XCircle className="w-4 h-4" />;
            case 'ANNULE': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (leavesLoading || balancesLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Congés</h2>
                    <p className="text-sm text-gray-500">Gérez vos demandes et consultez vos soldes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nouvelle Demande
                </button>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {balances?.map((solde: SoldeConge) => (
                    <div key={solde.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${solde.typeConge.code === 'CP' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{solde.annee}</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">{solde.typeConge.nom}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">{solde.joursRestants}</span>
                            <span className="text-sm text-gray-400">jours restants</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                    <h3 className="font-bold text-gray-900">Mes Demandes Récentes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durée</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leaves?.map((leave: Conge) => (
                                <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{leave.type}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{leave.motif || 'Aucun motif'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="font-bold">{leave.nombreJours}</span> jours
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        Du {new Date(leave.dateDebut).toLocaleDateString()} au {new Date(leave.dateFin).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatutColor(leave.statut)}`}>
                                            {getStatutIcon(leave.statut)}
                                            {leave.statut}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {(leave.statut === 'EN_ATTENTE' || leave.statut === 'APPROUVE') && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Annuler cette demande ?')) {
                                                        cancelMutation.mutate(leave.id);
                                                    }
                                                }}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Annuler"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Déposer une Demande de Congé"
            >
                <LeaveRequestForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};
