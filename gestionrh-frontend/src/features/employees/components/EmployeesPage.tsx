import { useState, useMemo, memo, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getEmployees, deleteEmployee } from '../api';
import { Modal } from '../../../components/common/Modal';
import { EmployeeForm } from './EmployeeForm';
import { getDepartements } from '../../departments/api';
import { getPostes } from '../../jobs/api';
import type { Employee } from '../types';
import {
    Search, Plus, Mail, Phone, Building2, Briefcase,
    Edit3, Trash2, Filter, User
} from 'lucide-react';

const ROW_HEIGHT = 88;
const OVERSCAN = 8;

const EmployeesPageComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(600);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const queryClient = useQueryClient();

    const { data: employees, isLoading, error } = useQuery({
        queryKey: ['employees'],
        queryFn: getEmployees,
    });

    const { data: departements } = useQuery({ queryKey: ['departements'], queryFn: getDepartements });
    const { data: postes } = useQuery({ queryKey: ['postes'], queryFn: getPostes });

    useEffect(() => {
        const el = tableContainerRef.current;
        if (!el) return;

        const updateHeight = () => setContainerHeight(el.clientHeight || 600);
        updateHeight();

        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(el);

        return () => resizeObserver.disconnect();
    }, []);

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
                toast.success('Employé supprimé avec succès');
            } catch (err) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    // Advanced Filtering Logic
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

    const totalEmployees = filteredEmployees.length;
    const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(totalEmployees, startIndex + visibleCount);
    const topSpacer = startIndex * ROW_HEIGHT;
    const bottomSpacer = Math.max(0, (totalEmployees - endIndex) * ROW_HEIGHT);

    // Role Color Mapping
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'RH': return 'bg-pink-50 text-pink-700 border-pink-100';
            case 'MANAGER': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Erreur lors du chargement des employés
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Effectifs</h2>
                    <p className="text-sm text-gray-500">Gérez les informations et les accès des collaborateurs.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nouvel Employé
                </button>
            </div>

            {/* Filtering Controls */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Filtres de recherche</span>
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                    ref={tableContainerRef}
                    className="overflow-auto max-h-[640px]"
                    onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
                >
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Collaborateur</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Affectation</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Accès</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                    </table>
                    <div className="relative" style={{ height: totalEmployees * ROW_HEIGHT }}>
                        <table className="min-w-full divide-y divide-gray-100 absolute top-0 left-0">
                            <tbody className="divide-y divide-gray-50">
                                {topSpacer > 0 && (
                                    <tr style={{ height: topSpacer }}>
                                        <td colSpan={5} />
                                    </tr>
                                )}
                                {filteredEmployees.slice(startIndex, endIndex).map((emp) => (
                                    <tr key={emp.id} className="hover:bg-blue-50/20 transition-colors group" style={{ height: ROW_HEIGHT }}>
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
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{emp.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{emp.telephone || 'Non renseigné'}</span>
                                                </div>
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {bottomSpacer > 0 && (
                                    <tr style={{ height: bottomSpacer }}>
                                        <td colSpan={5} />
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {filteredEmployees.length === 0 && (
                <div className="p-12 text-center">
                    <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucun collaborateur ne correspond aux critères.</p>
                    <button
                        onClick={() => { setSearchQuery(''); setDeptFilter(''); setJobFilter(''); }}
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
        </div>
    );
};

export const EmployeesPage = memo(EmployeesPageComponent);
