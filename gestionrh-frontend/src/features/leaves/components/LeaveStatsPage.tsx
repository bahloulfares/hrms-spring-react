import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { getDepartements } from '../../departments/api';
import type { CongeReportRequest, CongeStatsResponse, TypeConge } from '../types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SkeletonStatCard, SkeletonChart } from '@/components/ui/Skeleton';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Download, BarChart3, PieChart as PieIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useAuthStore } from '@/store/auth';

const STATUT_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'APPROUVE', label: 'Approuvé' },
    { value: 'REJETE', label: 'Rejeté' },
    { value: 'ANNULE', label: 'Annulé' }
];

const COLORS = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#6366f1', '#22c55e'];

const toISODate = (date: Date) => format(date, 'yyyy-MM-dd');

export const LeaveStatsPage: React.FC = () => {
    const { isAuthorized } = useAuthCheck({ requiredRoles: ['ADMIN', 'RH', 'MANAGER'] });
    const { user } = useAuthStore();
    const isManager = user?.roles?.includes('MANAGER');
    const managerDept = user?.departement;
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const { register, handleSubmit, reset } = useForm<CongeReportRequest>({
        defaultValues: {
            dateDebut: toISODate(monthStart),
            dateFin: toISODate(today),
            typeConge: '',
            statut: '',
            departementId: isManager ? undefined : undefined,
        }
    });

    const [filters, setFilters] = useState<CongeReportRequest>({
        dateDebut: toISODate(monthStart),
        dateFin: toISODate(today),
        typeConge: '',
        statut: '',
        departementId: isManager ? undefined : undefined,
    });

    const { data: types } = useQuery({
        queryKey: ['leave-types'],
        queryFn: leaveApi.getLeaveTypes
    });

    const { data: departements } = useQuery({
        queryKey: ['departements'],
        queryFn: getDepartements
    });

    const enforcedFilters = useMemo(() => {
        if (isManager && managerDept) {
            const deptId = departements?.find(d => d.nom === managerDept)?.id;
            return { ...filters, departementId: deptId };
        }
        return filters;
    }, [filters, isManager, managerDept, departements]);

    const { data: stats, isLoading, isError } = useQuery<CongeStatsResponse>({
        queryKey: ['leave-stats', enforcedFilters],
        queryFn: () => leaveApi.getStatistics(enforcedFilters)
    });

    const exportMutation = useMutation({
        mutationFn: () => leaveApi.exportCsv(filters),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rapport-conges.csv';
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Export CSV téléchargé avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de l\'export CSV');
        }
    });

    const onSubmit = handleSubmit((values) => {
        const payload: CongeReportRequest = {
            ...values,
            typeConge: values.typeConge || undefined,
            statut: values.statut || undefined,
            departementId: values.departementId || undefined,
        };

        // Force manager to own department
        if (isManager && managerDept) {
            const deptId = departements?.find(d => d.nom === managerDept)?.id;
            payload.departementId = deptId;
            reset({ ...values, departementId: deptId });
        }

        setFilters(payload);
    });

    const statutData = useMemo(() =>
        stats ? Object.entries(stats.parStatut || {}).map(([statut, value]) => ({ statut, value })) : [],
        [stats]
    );

    const typeData = useMemo(() =>
        stats ? Object.entries(stats.parType || {}).map(([type, value]) => ({ name: type, value })) : [],
        [stats]
    );

    const joursParTypeData = useMemo(() =>
        stats ? Object.entries(stats.joursParType || {}).map(([type, value]) => ({ type, value })) : [],
        [stats]
    );

    if (!isAuthorized) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Statistiques des congés</h1>
                    <p className="text-sm text-slate-500">Vue consolidée par période, statut et type</p>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    leftIcon={exportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isPending}
                >
                    {exportMutation.isPending ? 'Export...' : 'Exporter CSV'}
                </Button>
            </div>

            {isError && (
                <div className="p-3 border border-amber-200 bg-amber-50 text-amber-700 text-sm rounded-lg">
                    Impossible de charger les statistiques. Réessayez ou ajustez les filtres.
                </div>
            )}

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <Input label="Date début" type="date" wrapperClassName="md:col-span-2" {...register('dateDebut')} />
                <Input label="Date fin" type="date" wrapperClassName="md:col-span-2" {...register('dateFin')} />

                <Select label="Type de congé" wrapperClassName="md:col-span-1" {...register('typeConge')}>
                    <option value="">Tous</option>
                    {types?.map((t: TypeConge) => (
                        <option key={t.id} value={t.code}>{t.nom}</option>
                    ))}
                </Select>

                <Select label="Statut" wrapperClassName="md:col-span-1" {...register('statut')}>
                    {STATUT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Select>

                <Select
                    label="Département"
                    wrapperClassName="md:col-span-2"
                    disabled={isManager}
                    {...register('departementId', { valueAsNumber: true })}
                > 
                    <option value="">Tous</option>
                    {departements?.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.nom}</option>
                    ))}
                </Select>

                <div className="md:col-span-6 flex justify-end">
                    <Button type="submit" variant="primary">Actualiser</Button>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {isLoading ? (
                    <>
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                    </>
                ) : (
                    <>
                        <KpiCard label="Total demandes" value={stats?.totalDemandes ?? 0} />
                        <KpiCard label="En attente" value={stats?.demandesEnAttente ?? 0} color="text-amber-600" />
                        <KpiCard label="Approuvées" value={stats?.demandesApprouvees ?? 0} color="text-emerald-600" />
                        <KpiCard label="Rejetées" value={stats?.demandesRejetees ?? 0} color="text-rose-600" />
                        <KpiCard label="Jours consommés" value={(stats?.totalJoursConsommes ?? 0).toFixed(1)} suffix="j" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Répartition par statut" icon={<BarChart3 className="w-4 h-4 text-blue-600" />}>
                    <div className="h-64">
                        {isLoading ? (
                            <SkeletonChart height="16rem" className="border-0 p-0 shadow-none" />
                        ) : statutData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Aucune donnée disponible</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statutData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="statut" tick={{ fill: '#475569', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>

                <ChartCard title="Répartition par type" icon={<PieIcon className="w-4 h-4 text-emerald-600" />}>
                    <div className="h-64">
                        {isLoading ? (
                            <SkeletonChart height="16rem" className="border-0 p-0 shadow-none" />
                        ) : typeData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Aucune donnée disponible</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={typeData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={2}>
                                        {typeData.map((entry, index) => (
                                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>
            </div>

            <ChartCard title="Jours consommés par type" icon={<BarChart3 className="w-4 h-4 text-indigo-600" />}>
                <div className="h-72">
                    {isLoading ? (
                        <SkeletonChart height="18rem" className="border-0 p-0 shadow-none" />
                    ) : joursParTypeData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">Aucune donnée disponible</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={joursParTypeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="type" tick={{ fill: '#475569', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </ChartCard>
        </div>
    );
};

const KpiCard = ({ label, value, suffix, color }: { label: string; value: number | string; suffix?: string; color?: string }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color ?? 'text-slate-800'}`}>{value}{suffix ? <span className="text-sm ml-1 text-slate-400">{suffix}</span> : null}</p>
    </div>
);

const ChartCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            {icon}
            <span>{title}</span>
        </div>
        {children}
    </div>
);

export default LeaveStatsPage;
