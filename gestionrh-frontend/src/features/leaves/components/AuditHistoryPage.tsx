import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePagination } from '../../../hooks/usePagination';
import { getAuditHistory } from '../api/auditHistory';
import { PaginationControls } from '../../../components/PaginationControls';
import type { StatutConge } from '../types';
import { Calendar, Filter, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthCheck } from '@/hooks/useAuthCheck';

/**
 * Page d'Audit Trail - Affiche l'historique de tous les changements de congés
 * Permet de filtrer par acteur, type d'action, et date
 */
export const AuditHistoryPage = () => {
    const { isAuthorized } = useAuthCheck({ requiredRoles: ['ADMIN', 'RH'] });
    // État des filtres
    const [filterActor, setFilterActor] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<StatutConge | ''>('');
    const [filterDateStart, setFilterDateStart] = useState<string>('');
    const [filterDateEnd, setFilterDateEnd] = useState<string>('');

    // Pagination
    const pagination = usePagination();

    // Construire les filtres pour l'API
    const filters = useMemo(() => {
        return {
            acteur: filterActor || undefined,
            statutNouveau: (filterStatus as StatutConge) || undefined,
            dateDebut: filterDateStart || undefined,
            dateFin: filterDateEnd || undefined,
        };
    }, [filterActor, filterStatus, filterDateStart, filterDateEnd]);

    // Récupérer les données d'audit
    const { data, isLoading, error } = useQuery({
        queryKey: ['audit-history', pagination.page, pagination.size, filters],
        queryFn: () => getAuditHistory(pagination.page, pagination.size, filters),
        staleTime: 30000,
    });

    // Mettre à jour le total de pagination
    useEffect(() => {
        if (data) {
            pagination.setTotal(data.totalElements, data.totalPages);
        }
    }, [data, pagination]);

    // Réinitialiser les filtres
    const handleResetFilters = () => {
        setFilterActor('');
        setFilterStatus('');
        setFilterDateStart('');
        setFilterDateEnd('');
        pagination.goToPage(0);
        toast.success('Filtres réinitialisés');
    };

    if (!isAuthorized) return null;

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Erreur lors du chargement de l'historique
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">📋 Historique d'Audit</h2>
                    <p className="text-sm text-gray-500">Consultez tous les changements de statut des demandes de congé.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-900">Total:</span>
                    <span className="text-lg font-bold text-blue-600">{data?.totalElements || 0}</span>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <Filter className="w-5 h-5 text-blue-600" />
                        Filtres et Recherche
                    </div>
                    {(filterActor || filterStatus || filterDateStart || filterDateEnd) && (
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
                    {/* Acteur Filter - Recherche par nom ou email */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Search className="w-4 h-4 inline mr-1" />
                            Recherche (Nom / Email)
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Ahmed, ahmed@example.com..."
                            value={filterActor}
                            onChange={(e) => {
                                setFilterActor(e.target.value);
                                pagination.goToPage(0);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                        />
                        {filterActor && (
                            <p className="text-xs text-gray-500 mt-1">
                                🔍 Affichage des résultats pour: <span className="font-medium">{filterActor}</span>
                            </p>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Statut Final
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value as StatutConge | '');
                                pagination.goToPage(0);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="EN_ATTENTE">⏳ En Attente</option>
                            <option value="APPROUVE">✅ Approuvé</option>
                            <option value="REJETE">❌ Rejeté</option>
                            <option value="ANNULE">🚫 Annulé</option>
                        </select>
                    </div>

                    {/* Date Start */}
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

                    {/* Date End */}
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
                {(filterActor || filterStatus || filterDateStart || filterDateEnd) && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            {filterActor && (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    🔍 {filterActor}
                                    <button
                                        onClick={() => {
                                            setFilterActor('');
                                            pagination.goToPage(0);
                                        }}
                                        className="hover:text-blue-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filterStatus && (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    📊 {filterStatus}
                                    <button
                                        onClick={() => {
                                            setFilterStatus('');
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

            {/* Results */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    📅 Date/Heure
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    👤 Acteur
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    📊 Avant
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    ➜ Après
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    💬 Commentaire
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data?.content && data.content.length > 0 ? (
                                data.content.map((entry, idx) => (
                                    <tr key={entry.id} className={`transition-colors hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                            {new Date(entry.dateModification).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-semibold text-gray-900">{entry.acteurNom || entry.acteur}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                ✉️ {entry.acteur}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {entry.statutPrecedent ? (
                                                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                                    {entry.statutPrecedent}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs font-medium">🆕 Création</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatutColor(entry.statutNouveau)}`}>
                                                {getStatutEmoji(entry.statutNouveau)} {entry.statutNouveau}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {entry.commentaire ? (
                                                <span title={entry.commentaire}>{entry.commentaire}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                                        {filterActor || filterStatus || filterDateStart || filterDateEnd
                                            ? '❌ Aucun historique correspondant à vos critères'
                                            : '📋 Aucun historique trouvé'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 0 && (
                <PaginationControls
                    pagination={pagination}
                    pageSizes={[10, 20, 50]}
                />
            )}
        </div>
    );
};

/**
 * Retourne les classes Tailwind pour colorer les statuts
 */
function getStatutColor(statut: string): string {
    switch (statut) {
        case 'EN_ATTENTE':
            return 'bg-yellow-100 text-yellow-800';
        case 'APPROUVE':
            return 'bg-green-100 text-green-800';
        case 'REJETE':
            return 'bg-red-100 text-red-800';
        case 'ANNULE':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Retourne l'emoji correspondant au statut
 */
function getStatutEmoji(statut: string): string {
    switch (statut) {
        case 'EN_ATTENTE':
            return '⏳';
        case 'APPROUVE':
            return '✅';
        case 'REJETE':
            return '❌';
        case 'ANNULE':
            return '🚫';
        default:
            return '📋';
    }
}
