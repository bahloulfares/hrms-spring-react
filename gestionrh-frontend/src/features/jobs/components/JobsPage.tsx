import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPostes, deletePoste } from '../api';
import { Modal } from '../../../components/common/Modal';
import { JobForm } from './JobForm';
import { useQueryClient } from '@tanstack/react-query';
import type { Poste } from '../types';

export const JobsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Poste | null>(null);
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
            } catch (err) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div className="text-red-500">Erreur lors du chargement</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Postes</h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Nouveau Poste
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salaire (Min-Max)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {postes?.map((poste) => (
                            <tr key={poste.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{poste.titre}</td>
                                <td className="px-6 py-4 text-gray-500">{poste.departementNom}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {poste.salaireMin} - {poste.salaireMax} €
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(poste)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Éditer
                                    </button>
                                    <button
                                        onClick={() => handleDelete(poste.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {postes?.length === 0 && (
                    <div className="p-6 text-center text-gray-500">Aucun poste trouvé.</div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedJob ? "Modifier le Poste" : "Créer un Poste"}
            >
                <JobForm
                    initialData={selectedJob}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

