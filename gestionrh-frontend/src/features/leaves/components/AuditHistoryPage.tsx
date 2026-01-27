import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePagination } from '../../../hooks/usePagination';
import { getAuditHistory } from '../api/auditHistory';
import { PaginationControls } from '../../../components/PaginationControls';
import type { StatutConge } from '../types';
import { Calendar, Filter, Trash2 } from 'lucide-react';
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
                    <h2 className="text-2xl font-bold text-gray-900">Historique d'Audit</h2>
                    <p className="text-sm text-gray-500">Consultez tous les changements de statut des demandes de congé.</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Filter className="w-5 h-5" />
                    Filtres
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Acteur Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Acteur
                        </label>
                        <input
                            type="text"
                            placeholder="Email ou nom..."
                            value={filterActor}
                            onChange={(e) => {
                                setFilterActor(e.target.value);
                                pagination.goToPage(0);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Statut Final
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value as StatutConge | '');
                                pagination.goToPage(0);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="EN_ATTENTE">En Attente</option>
                            <option value="APPROUVE">Approuvé</option>
                            <option value="REJETE">Rejeté</option>
                            <option value="ANNULE">Annulé</option>
                        </select>
                    </div>

                    {/* Date Start */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date End */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Reset Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Date/Heure
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Acteur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Statut Précédent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Statut Nouveau
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Commentaire
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data?.content && data.content.length > 0 ? (
                                data.content.map((entry, idx) => (
                                    <tr key={entry.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(entry.dateModification).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{entry.acteurNom || entry.acteur}</div>
                                            <div className="text-xs text-gray-500">{entry.acteur}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {entry.statutPrecedent ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {entry.statutPrecedent}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Création</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(entry.statutNouveau)}`}>
                                                {entry.statutNouveau}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {entry.commentaire || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Aucun historique trouvé
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
            return 'bg-yellow-50 text-yellow-800';
        case 'APPROUVE':
            return 'bg-green-50 text-green-800';
        case 'REJETE':
            return 'bg-red-50 text-red-800';
        case 'ANNULE':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-50 text-gray-800';
    }
}
