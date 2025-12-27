import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDepartements, deleteDepartement } from '../api';
import { Modal } from '../../../components/common/Modal';
import { DepartmentForm } from './DepartmentForm';
import type { Departement } from '../types';


export const DepartmentsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Departement | null>(null);
    const queryClient = useQueryClient();

    const { data: differents, isLoading, error } = useQuery({
        queryKey: ['departements'],
        queryFn: getDepartements,
    });

    const handleCreate = () => {
        setSelectedDepartment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dept: Departement) => {
        setSelectedDepartment(dept);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
            try {
                await deleteDepartement(id);
                queryClient.invalidateQueries({ queryKey: ['departements'] });
            } catch (err) {
                alert('Erreur lors de la suppression. Vérifiez si des employés y sont rattachés.');
            }
        }
    };

    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div className="text-red-500">Erreur lors du chargement</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Départements</h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Nouveau Département
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {differents?.map((dept) => (
                            <tr key={dept.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dept.nom}</td>
                                <td className="px-6 py-4 text-gray-500">{dept.description || '-'}</td>
                                <td className="px-6 py-4 text-gray-500">{dept.managerNom || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(dept)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Éditer
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {differents?.length === 0 && (
                    <div className="p-6 text-center text-gray-500">Aucun département trouvé.</div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedDepartment ? "Modifier le Département" : "Créer un Département"}
            >
                <DepartmentForm
                    initialData={selectedDepartment}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

