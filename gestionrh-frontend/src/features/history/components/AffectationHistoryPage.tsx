import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../../api/axiosClient';
import {
    Clock, User, Building2, Briefcase, ArrowRight,
    Calendar, ShieldCheck, Search, Filter, X
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { usePagination } from '../../../hooks/usePagination';
import { PaginationControls } from '../../../components/PaginationControls';
import toast from 'react-hot-toast';

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
    const [filterType, setFilterType] = useState<'' | 'Mobilité interne' | 'Mutation service'>('');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');
    const pagination = usePagination();

    const { data: allHistory, isLoading, error } = useQuery<AffectationHistory[]>({
        queryKey: ['affectation-history'],
        queryFn: async () => {
            const response = await axiosClient.get('/history');
            return response.data;
        }
    });

    // Filtrer les données
    const filteredHistory = useMemo(() => {
        if (!allHistory) return [];
        
        let filtered = allHistory.filter(h => {
            // Filtre recherche
            const matchesSearch = 
                h.employeNomComplet.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.modifiePar.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Filtre type
            const typeValue = h.oldPoste !== h.newPoste ? 'Mobilité interne' : 'Mutation service';
            if (filterType && typeValue !== filterType) return false;

            // Filtre dates
            if (filterDateStart || filterDateEnd) {
                const changeDate = new Date(h.dateChangement);
                if (filterDateStart) {
                    const startDate = new Date(filterDateStart);
                    if (changeDate < startDate) return false;
                }
                if (filterDateEnd) {
                    const endDate = new Date(filterDateEnd);
                    endDate.setHours(23, 59, 59, 999);
                    if (changeDate > endDate) return false;
                }
            }

            return true;
        });

        return filtered;
    }, [allHistory, searchQuery, filterType, filterDateStart, filterDateEnd]);

    // Pagination des données filtrées
    const paginatedData = useMemo(() => {
        const start = pagination.page * pagination.size;
        const end = start + pagination.size;
        return filteredHistory.slice(start, end);
    }, [filteredHistory, pagination.page, pagination.size]);

    // Mettre à jour le total de pagination
    useEffect(() => {
        pagination.setTotal(filteredHistory.length, Math.ceil(filteredHistory.length / pagination.size));
    }, [filteredHistory, pagination.size, pagination.setTotal]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterType('');
        setFilterDateStart('');
        setFilterDateEnd('');
        pagination.goToPage(0);
        toast.success('Filtres réinitialisés');
    };

    const hasActiveFilters = searchQuery || filterType || filterDateStart || filterDateEnd;

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
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-900">Total:</span>
                    <span className="text-lg font-bold text-blue-600">{filteredHistory.length}</span>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <Filter className="w-5 h-5 text-blue-600" />
                        Filtres et Recherche
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={handleResetFilters}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Réinitialiser
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Recherche */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Search className="w-4 h-4 inline mr-1" />
                            Recherche (Nom / Email)
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Ahmed, fares@example.com..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                pagination.goToPage(0);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Type de changement */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type de Changement
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value as '' | 'Mobilité interne' | 'Mutation service');
                                pagination.goToPage(0);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">Tous les types</option>
                            <option value="Mobilité interne">📊 Mobilité interne</option>
                            <option value="Mutation service">🔄 Mutation service</option>
                        </select>
                    </div>

                    {/* Date début */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            À partir du
                        </label>
                        <input
                            type="date"
                            value={filterDateStart}
                            onChange={(e) => {
                                setFilterDateStart(e.target.value);
                                pagination.goToPage(0);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Date fin */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Jusqu'au
                        </label>
                        <input
                            type="date"
                            value={filterDateEnd}
                            onChange={(e) => {
                                setFilterDateEnd(e.target.value);
                                pagination.goToPage(0);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            {searchQuery && (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    🔍 {searchQuery}
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            pagination.goToPage(0);
                                        }}
                                        className="hover:text-blue-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filterType && (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    📋 {filterType}
                                    <button
                                        onClick={() => {
                                            setFilterType('');
                                            pagination.goToPage(0);
                                        }}
                                        className="hover:text-green-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filterDateStart && (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                    📅 À partir du {filterDateStart}
                                    <button
                                        onClick={() => {
                                            setFilterDateStart('');
                                            pagination.goToPage(0);
                                        }}
                                        className="hover:text-orange-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filterDateEnd && (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                    📅 Jusqu'au {filterDateEnd}
                                    <button
                                        onClick={() => {
                                            setFilterDateEnd('');
                                            pagination.goToPage(0);
                                        }}
                                        className="hover:text-purple-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employé</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Changement</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Par / Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedData.map((h) => (
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
                                                {h.oldPoste !== h.newPoste ? '📊 Mobilité interne' : '🔄 Mutation service'}
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
                {paginatedData.length === 0 && (
                    <div className="p-12 text-center">
                        <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">
                            {hasActiveFilters ? '❌ Aucun mouvement correspondant à vos critères.' : '📋 Aucun mouvement enregistré.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredHistory.length > 0 && (
                <PaginationControls
                    pagination={pagination}
                    pageSizes={[10, 20, 50]}
                />
            )}
        </div>
    );
};
