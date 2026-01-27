import { useState, useMemo, memo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getDepartements, deleteDepartement } from '../api';
import { Modal } from '../../../components/common/Modal';
import { DepartmentForm } from './DepartmentForm';
import { DepartmentDetailModal } from './DepartmentDetailModal';
import { usePagination } from '../../../hooks/usePagination';
import { PaginationControls } from '../../../components/PaginationControls';
import { exportToExcel, exportToPdf } from '../../../utils/exportUtils';
import type { Departement } from '../types';
import { Building2, User, Search, Plus, Trash2, Edit3, AlignLeft, Eye, FileDown, FileSpreadsheet } from 'lucide-react';

const DepartmentsPageComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Departement | null>(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // ✅ Pagination
    const pagination = usePagination({ pageSize: 10 });
    
    const queryClient = useQueryClient();

    const { data: departements, isLoading, error } = useQuery({
        queryKey: ['departements'],
        queryFn: getDepartements,
    });

    const handleCreate = () => {
        setSelectedDepartment(null);
        setIsModalOpen(true);
    };

    const handleViewDetail = (deptId: number) => {
        setSelectedDepartmentId(deptId);
        setIsDetailModalOpen(true);
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
                pagination.reset();
                toast.success('Département supprimé avec succès');
            } catch (err) {
                toast.error('Erreur lors de la suppression. Vérifiez si des employés y sont rattachés.');
            }
        }
    };

    // ✅ Filter and Sort Logic
    const filteredDepartements = useMemo(() => {
        if (!departements) return [];

        return departements
            .filter(d =>
                d.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.managerNom?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => a.nom.localeCompare(b.nom));
    }, [departements, searchQuery]);

    const handleExport = (type: 'pdf' | 'excel') => {
        if (!filteredDepartements.length) {
            toast.error('Aucune donnée à exporter');
            return;
        }

        const columns = [
            { header: 'Nom', formatter: (d: Departement) => d.nom },
            { header: 'Description', formatter: (d: Departement) => d.description || '' },
            { header: 'Manager', formatter: (d: Departement) => d.managerNom || 'Non assigné' },
            { header: 'Créé le', formatter: (d: Departement) => d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '' },
        ];

        const base = {
            title: 'Liste des Départements',
            columns,
            data: filteredDepartements,
            fileName: `departements_${new Date().toISOString().slice(0, 10)}`,
            orientation: 'landscape' as const,
        };

        if (type === 'pdf') {
            exportToPdf(base);
        } else {
            exportToExcel(base);
        }
    };

    // ✅ Update pagination
    useEffect(() => {
        pagination.setTotal(filteredDepartements.length, Math.ceil(filteredDepartements.length / pagination.size));
    }, [filteredDepartements.length, pagination]);

    // ✅ Paginated departments
    const paginatedDepartements = useMemo(() => {
        const start = pagination.page * pagination.size;
        const end = start + pagination.size;
        return filteredDepartements.slice(start, end);
    }, [filteredDepartements, pagination.page, pagination.size]);

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Erreur lors du chargement des départements
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Gestion des Départements</h2>
                    <p className="text-sm text-slate-600 mt-2">Structurez votre organisation et gérez les responsables d'unités.</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-end">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="inline-flex items-center gap-2 bg-white text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                        <FileDown className="w-4 h-4" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        className="inline-flex items-center gap-2 bg-white text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Nouveau Département
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Rechercher un département, une description ou un manager..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
                />
            </div>

            {filteredDepartements.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucun département trouvé.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedDepartements.map((dept) => (
                            <div key={dept.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleViewDetail(dept.id)}
                                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                title="Voir les détails"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(dept)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Modifier"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dept.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{dept.nom}</h3>

                                    {dept.description && (
                                        <div className="flex items-start gap-2 text-sm text-gray-500 mb-4 line-clamp-2">
                                            <AlignLeft className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <p>{dept.description}</p>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Manager</p>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {dept.managerNom || <span className="text-gray-400 font-normal italic">Non assigné</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* ✅ Pagination */}
                    <PaginationControls pagination={pagination} pageSizes={[6, 12, 24]} />
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedDepartment ? "Modifier le Département" : "Créer un Département"}
            >
                <DepartmentForm
                    initialData={selectedDepartment}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['departements'] });
                    }}
                />
            </Modal>

            <DepartmentDetailModal
                isOpen={isDetailModalOpen}
                departmentId={selectedDepartmentId}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedDepartmentId(null);
                }}
                isReadOnly={true}
            />
        </div>
    );
};

export const DepartmentsPage = memo(DepartmentsPageComponent);

