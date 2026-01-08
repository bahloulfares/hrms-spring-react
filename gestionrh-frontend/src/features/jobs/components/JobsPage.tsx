import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getPostes, deletePoste } from '../api';
import { Modal } from '../../../components/common/Modal';
import { JobForm } from './JobForm';
import type { Poste } from '../types';
import { Briefcase, Building2, Coins, Search, Plus, Trash2, Edit3 } from 'lucide-react';

export const JobsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Poste | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    const { data: postes, isLoading, error } = useQuery({
        queryKey: ['postes'],
        queryFn: getPostes,
    });

    const handleCreate = () => {
        setSelectedJob(null);
        setIsModalOpen(true);
    };

    const handleEdit = (job: Poste) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) {
            try {
                await deletePoste(id);
                queryClient.invalidateQueries({ queryKey: ['postes'] });
                toast.success('Poste supprimé avec succès');
            } catch (err) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    // Grouping and Sorting Logic
    const groupedPostes = useMemo(() => {
        if (!postes) return {};

        const filtered = postes.filter(p =>
            p.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.departementNom?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const groups = filtered.reduce((acc, job) => {
            const dept = job.departementNom || 'Sans Département';
            if (!acc[dept]) acc[dept] = [];
            acc[dept].push(job);
            return acc;
        }, {} as Record<string, Poste[]>);

        // Sort departments
        const sortedGroups: Record<string, Poste[]> = {};
        Object.keys(groups).sort().forEach(dept => {
            // Sort jobs within department
            sortedGroups[dept] = groups[dept].sort((a, b) => a.titre.localeCompare(b.titre));
        });

        return sortedGroups;
    }, [postes, searchQuery]);

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Erreur lors du chargement des postes
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Postes</h2>
                    <p className="text-sm text-gray-500">Gérez les postes et leurs affectations par département.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nouveau Poste
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Filtrer par titre ou département..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
                />
            </div>

            {Object.keys(groupedPostes).length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucun poste ne correspond à votre recherche.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedPostes).map(([dept, jobs]) => (
                        <div key={dept} className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-bold text-gray-800">{dept}</h3>
                                <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                    {jobs.length} poste{jobs.length > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {jobs.map((job) => (
                                    <div key={job.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                    <Briefcase className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.titre}</h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                            <Coins className="w-4 h-4 text-green-500" />
                                            <span className="font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                                                {job.salaireMin?.toLocaleString()} - {job.salaireMax?.toLocaleString()} €
                                            </span>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-auto">
                                            <button
                                                onClick={() => handleEdit(job)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Modifier"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedJob ? "Modifier le Poste" : "Créer un Poste"}
            >
                <JobForm
                    initialData={selectedJob}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['postes'] });
                    }}
                />
            </Modal>
        </div>
    );
};

