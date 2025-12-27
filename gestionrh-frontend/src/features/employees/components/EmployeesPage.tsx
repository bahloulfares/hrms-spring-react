import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmployees, deleteEmployee } from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../components/common/Modal';
import { EmployeeForm } from './EmployeeForm';
import type { Employee } from '../types';

export const EmployeesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const queryClient = useQueryClient();
    const { data: employees, isLoading, error } = useQuery({
        queryKey: ['employees'],
        queryFn: getEmployees,
    });

    const handleCreate = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
            try {
                await deleteEmployee(id);
                queryClient.invalidateQueries({ queryKey: ['employees'] });
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
                <h2 className="text-2xl font-bold text-gray-800">Employés</h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Nouvel Employé
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees?.map((emp) => (
                            <tr key={emp.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                                                <span className="font-medium leading-none text-white">{emp.nom[0]}{emp.prenom[0]}</span>
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{emp.nomComplet}</div>
                                            <div className="text-sm text-gray-500">{emp.telephone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.poste || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.departement || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {emp.roles.join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(emp)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Éditer
                                    </button>
                                    <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-900">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {employees?.length === 0 && (
                    <div className="p-6 text-center text-gray-500">Aucun employé trouvé.</div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedEmployee ? "Modifier l'Employé" : "Créer un Employé"}
            >
                <EmployeeForm
                    initialData={selectedEmployee}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
