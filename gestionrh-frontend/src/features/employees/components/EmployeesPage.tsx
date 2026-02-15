import { useState, useMemo, memo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getEmployees, deleteEmployee, reactivateEmployee } from '../api';
import { Modal } from '../../../components/common/Modal';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { getDepartements } from '../../departments/api';
import { getPostes } from '../../jobs/api';
import { usePagination } from '../../../hooks/usePagination';
import { PaginationControls } from '../../../components/PaginationControls';
import { exportToExcel, exportToPdf } from '../../../utils/exportUtils';
import type { Employee } from '../types';
import {
    Search, Plus, Mail, Phone, Building2, Briefcase,
    Edit3, Filter, User, Eye, FileDown, FileSpreadsheet, RotateCcw, AlertCircle, Power
} from 'lucide-react';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useDataAccess } from '@/hooks/useAuthCheck';
import { useAuthStore } from '@/store/auth';

const EmployeesPageComponent = () => {
    const { isAuthorized } = useAuthCheck({ requiredRoles: ['ADMIN', 'RH', 'MANAGER'] });
    const { canViewAllEmails, canViewAllPhones, canManageRoles } = useDataAccess();
    const { user } = useAuthStore();
    const canEdit = user?.roles?.includes('ADMIN') || user?.roles?.includes('RH');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    
    // ✅ Pagination avec React Query
    const pagination = usePagination({ pageSize: 10 });

    const queryClient = useQueryClient();

    const { data: employees, isLoading, error } = useQuery({
        queryKey: ['employees'],
        queryFn: getEmployees,
    });

    const { data: departements } = useQuery({ queryKey: ['departements'], queryFn: getDepartements });
    const { data: postes } = useQuery({ queryKey: ['postes'], queryFn: getPostes });

    // ✅ Filtrage
    const filteredEmployees = useMemo(() => {
        if (!employees) return [];

        return employees.filter(emp => {
            const matchesSearch =
                emp.nomComplet.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = !deptFilter || emp.departement === deptFilter;
            const matchesJob = !jobFilter || emp.poste === jobFilter;

            return matchesSearch && matchesDept && matchesJob;
        }).sort((a, b) => a.nom.localeCompare(b.nom));
    }, [employees, searchQuery, deptFilter, jobFilter]);

    // ✅ Mettre à jour le total après filtrage (avec vérification pour éviter les cascades)
    useEffect(() => {
        const newTotal = filteredEmployees.length;
        const newPageCount = Math.ceil(newTotal / pagination.size);
        // Seulement mettre à jour si les valeurs ont vraiment changé
        if (pagination.totalElements !== newTotal || pagination.totalPages !== newPageCount) {
            pagination.setTotal(newTotal, newPageCount);
        }
    }, [filteredEmployees.length, pagination.size, pagination.totalElements, pagination.totalPages, pagination]);

    // ✅ Récupérer les employés pour la page courante
    const paginatedEmployees = useMemo(() => {
        const start = pagination.page * pagination.size;
        const end = start + pagination.size;
        return filteredEmployees.slice(start, end);
    }, [filteredEmployees, pagination.page, pagination.size]);

    // ✅ Actions
    const handleCreate = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        // Open detail modal instead of form modal
        setSelectedEmployeeId(employee.id);
        setIsDetailModalOpen(true);
    };

    const handleViewDetail = (employeeId: number) => {
        setSelectedEmployeeId(employeeId);
        setIsDetailModalOpen(true);
    };

    const handleToggleStatus = async (employee: Employee) => {
        const action = employee.actif ? 'désactiver' : 'réactiver';
        
        if (window.confirm(`Êtes-vous sûr de vouloir ${action} cet employé ?`)) {
            try {
                if (employee.actif) {
                    // Déactiver (soft delete)
                    await deleteEmployee(employee.id);
                    toast.success('Employé désactivé avec succès');
                } else {
                    // Réactiver
                    await reactivateEmployee(employee.id);
                    toast.success('Employé réactivé avec succès');
                }
                queryClient.invalidateQueries({ queryKey: ['employees'] });
            } catch {
                toast.error(`Erreur lors de la ${action} de l'employé`);
            }
        }
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        if (!filteredEmployees.length) {
            toast.error('Aucune donnée à exporter');
            return;
        }

        const columns = [
            { header: 'Nom complet', formatter: (e: Employee) => e.nomComplet },
            ...(canViewAllEmails ? [{ header: 'Email', formatter: (e: Employee) => e.email }] : []),
            ...(canViewAllPhones ? [{ header: 'Téléphone', formatter: (e: Employee) => e.telephone || '' }] : []),
            { header: 'Poste', formatter: (e: Employee) => e.poste || '' },
            { header: 'Département', formatter: (e: Employee) => e.departement || '' },
            ...(canManageRoles ? [{ header: 'Rôles', formatter: (e: Employee) => e.roles?.join(', ') || '' }] : []),
            { header: 'Statut', formatter: (e: Employee) => (e.actif ? 'Actif' : 'Inactif') },
        ];

        const base = {
            title: "Liste des Employés",
            columns,
            data: filteredEmployees,
            fileName: `employes_${new Date().toISOString().slice(0, 10)}`,
            orientation: 'landscape' as const,
        };

        if (type === 'pdf') {
            exportToPdf(base);
        } else {
            exportToExcel(base);
        }
    };


    // Role Color Mapping
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'RH': return 'bg-pink-50 text-pink-700 border-pink-100';
            case 'MANAGER': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
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
                <AlertCircle className="w-5 h-5" />
                Erreur lors du chargement des employés
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-200/50">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Effectifs</h2>
                        <p className="text-sm text-slate-600 font-medium mt-1">Gérez les informations et les accès des collaborateurs</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-end">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-xl font-bold border-2 border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm hover:shadow-md"
                    >
                        <FileDown className="w-5 h-5" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-xl font-bold border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 hover:text-green-600 transition-all shadow-sm hover:shadow-md"
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        Export Excel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-black hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-blue-200/50"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvel Employé
                    </button>
                </div>
            </div>

            {/* Filtering Controls */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-lg space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Filter className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-slate-700 uppercase tracking-wider">Filtres de recherche</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Nom, prénom ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                        <option value="">Tous les départements</option>
                        {departements?.map(d => <option key={d.id} value={d.nom}>{d.nom}</option>)}
                    </select>

                    <select
                        value={jobFilter}
                        onChange={(e) => setJobFilter(e.target.value)}
                        className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                        <option value="">Tous les postes</option>
                        {postes?.map(p => <option key={p.id} value={p.titre}>{p.titre}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Collaborateur</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Affectation</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Accès</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-5 text-right text-xs font-black text-slate-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                                    {emp.nom[0]}{emp.prenom[0]}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{emp.nomComplet}</div>
                                                <div className="text-[11px] text-gray-400 font-medium">ID: #{emp.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            {canViewAllEmails ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{emp.email}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Mail className="w-3.5 h-3.5 text-gray-300" />
                                                    <span>Email masqué</span>
                                                </div>
                                            )}

                                            {canViewAllPhones ? (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{emp.telephone || 'Non renseigné'}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Phone className="w-3.5 h-3.5 text-gray-300" />
                                                    <span>Téléphone masqué</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                                <span>{emp.poste || <span className="text-gray-300 font-normal">Sans poste</span>}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{emp.departement || <span className="text-gray-300">Aucun</span>}</span>
                                            </div>
                                        </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {canManageRoles ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {emp.roles.map(role => (
                                                        <span
                                                            key={role}
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRoleColor(role)} uppercase tracking-tighter`}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Accès limité</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                                                    emp.actif 
                                                        ? 'bg-green-100 text-green-800 border border-green-300' 
                                                        : 'bg-red-100 text-red-800 border border-red-300'
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full mr-1.5 ${emp.actif ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                    {emp.actif ? 'Actif' : 'Inactif'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(emp.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Voir détails"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleEdit(emp)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Modifier"
                                                    >
                                                        <Edit3 className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleToggleStatus(emp)}
                                                        className={`p-2 rounded-lg transition-all ${
                                                            emp.actif
                                                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                                        }`}
                                                        title={emp.actif ? 'Désactiver' : 'Réactiver'}
                                                    >
                                                        {emp.actif ? (
                                                            <Power className="w-5 h-5" />
                                                        ) : (
                                                            <RotateCcw className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                
                {/* ✅ Pagination Controls */}
                <PaginationControls pagination={pagination} pageSizes={[5, 10, 25, 50]} />
            </div>

            {pagination.isEmpty && (
                <div className="p-12 text-center">
                    <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucun collaborateur ne correspond aux critères.</p>
                    <button
                        onClick={() => { setSearchQuery(''); setDeptFilter(''); setJobFilter(''); pagination.reset(); }}
                        className="mt-2 text-blue-600 text-sm font-semibold hover:underline"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedEmployee ? "Modifier l'Employé" : "Créer un Employé"}
            >
                <EmployeeForm
                    initialData={selectedEmployee}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['employees'] });
                    }}
                />
            </Modal>

            {/* Detail Modal */}
            <EmployeeDetailModal
                isOpen={isDetailModalOpen}
                employeeId={selectedEmployeeId}
                onClose={() => setIsDetailModalOpen(false)}
                isReadOnly={!canEdit}
            />
        </div>
    );
};

export const EmployeesPage = memo(EmployeesPageComponent);
