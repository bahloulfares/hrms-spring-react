import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../../api/axiosClient';
import {
    Clock, User, Building2, Briefcase, ArrowRight,
    Calendar, ShieldCheck, Search
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface AffectationHistory {
    id: number;
    utilisateurId: number;
    employeNomComplet: string;
    oldDepartement: string | null;
    newDepartement: string | null;
    oldPoste: string | null;
    newPoste: string | null;
    dateChangement: string;
    modifiePar: string;
}

export const AffectationHistoryPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: history, isLoading, error } = useQuery<AffectationHistory[]>({
        queryKey: ['affectation-history'],
        queryFn: async () => {
            const response = await axiosClient.get('/history');
            return response.data;
        }
    });

    const filteredHistory = useMemo(() => {
        if (!history) return [];
        return history.filter(h =>
            h.employeNomComplet.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.modifiePar.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [history, searchQuery]);

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Erreur lors du chargement de l'historique
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        Historique des Affectations
                    </h2>
                    <p className="text-sm text-gray-500">Suivez les mouvements de vos collaborateurs au sein de l'organisation.</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Chercher par nom d'employé ou modificateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employé</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Changement</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Par / Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredHistory.map((h) => (
                                <tr key={h.id} className="hover:bg-blue-50/10 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                                                {h.employeNomComplet}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            {/* Dept Change */}
                                            {(h.oldDepartement !== h.newDepartement) && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-gray-500 line-through">{h.oldDepartement || 'Aucun'}</span>
                                                    <ArrowRight className="w-3 h-3 text-blue-500" />
                                                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{h.newDepartement}</span>
                                                </div>
                                            )}
                                            {/* Poste Change */}
                                            {(h.oldPoste !== h.newPoste) && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-gray-500 line-through">{h.oldPoste || 'Sans poste'}</span>
                                                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                                                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">{h.newPoste}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Type</div>
                                            <div className="text-xs font-medium text-gray-600">
                                                {h.oldPoste !== h.newPoste ? 'Mobilité interne' : 'Mutation service'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold">
                                                <ShieldCheck className="w-3 h-3 text-gray-400" />
                                                {h.modifiePar}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(h.dateChangement).toLocaleString('fr-FR')}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredHistory.length === 0 && (
                    <div className="p-12 text-center">
                        <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Aucun mouvement enregistré.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
