import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { Calendar, TrendingUp, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SoldeConge, Conge } from '../types';
import { useAuthStore } from '@/store/auth';

export const DashboardHomePage = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('RH');
    const displayName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim() || 'Utilisateur';
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const { data: balances, isLoading: balancesLoading } = useQuery({
        queryKey: ['my-balances'],
        queryFn: leaveApi.getMyBalances
    });

    const { data: leaves, isLoading: leavesLoading } = useQuery({
        queryKey: ['my-leaves'],
        queryFn: leaveApi.getMyLeaves
    });

    const filteredBalances = useMemo(() => {
        return balances?.filter((b: SoldeConge) => b.annee === selectedYear) || [];
    }, [balances, selectedYear]);

    const pendingLeaves = leaves?.filter((leave: Conge) => leave.statut === 'EN_ATTENTE') || [];

    const availableYears = useMemo(() => {
        const years = balances?.map((b: SoldeConge) => b.annee) || [];
        const currentYear = new Date().getFullYear();
        if (!years.includes(currentYear)) years.push(currentYear);
        if (!years.includes(currentYear + 1)) years.push(currentYear + 1);
        return Array.from(new Set(years)).sort((a, b) => b - a);
    }, [balances]);

    if (balancesLoading || leavesLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome Header - Style Pro */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-2xl">👋</span>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Bienvenue, {displayName}</h1>
                            <p className="text-blue-100 font-medium mt-1">Voici un aperçu de vos congés et demandes en cours</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Cards */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200/50">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mes Soldes de Congés</h2>
                            <p className="text-sm text-slate-500 font-medium">Gestion de vos quotas annuels</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <button
                            onClick={() => setSelectedYear(y => y - 1)}
                            className="p-2.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all rounded-xl"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent border-none text-sm font-black text-slate-700 outline-none px-3 cursor-pointer focus:ring-0"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>Année {year}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setSelectedYear(y => y + 1)}
                            className="p-2.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all rounded-xl"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <Link
                        to="/dashboard/leaves"
                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group shadow-sm hover:shadow-md"
                    >
                        Détails complets <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {filteredBalances.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBalances.map((solde: SoldeConge) => {
                            const totalJours = solde.joursParAn || 0;
                            const joursUtilises = totalJours - solde.joursRestants;
                            const pourcentageUtilise = totalJours > 0 ? (joursUtilises / totalJours) * 100 : 0;

                            return (
                                <div key={solde.id} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl shadow-md group-hover:scale-110 transition-transform ${
                                            solde.typeCongeCode === 'CP' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200' :
                                            solde.typeCongeCode === 'RTT' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-200' :
                                            'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200'
                                        }`}>
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">{solde.annee}</span>
                                    </div>

                                    <h3 className="text-slate-600 text-sm font-bold mb-2 uppercase tracking-wide">{solde.typeCongeNom}</h3>

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-5xl font-black text-slate-900">{solde.joursRestants}</span>
                                        <span className="text-sm font-bold text-slate-400">/ {totalJours} jours</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500">
                                            <span>Utilisés: {joursUtilises} j</span>
                                            <span>{pourcentageUtilise.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 shadow-md ${
                                                    pourcentageUtilise > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                    pourcentageUtilise > 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                                    'bg-gradient-to-r from-emerald-500 to-green-500'
                                                }`}
                                                style={{ width: `${pourcentageUtilise}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 bg-white shadow-lg shadow-slate-200/50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Aucun solde pour {selectedYear}</h3>
                        <p className="text-slate-600 font-medium text-sm max-w-xs mx-auto">
                            Vos soldes seront automatiquement initialisés lors de votre prochaine demande de congé pour cette année.
                        </p>
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            {pendingLeaves.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-lg p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-200">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">Demandes en Attente</h2>
                            <p className="text-sm text-slate-500 font-medium">{pendingLeaves.length} demande{pendingLeaves.length > 1 ? 's' : ''} à traiter</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-4">
                            <p className="text-sm text-blue-800 font-medium">
                                ✓ Vous pouvez approuver ou rejeter les demandes dans la page de validation
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {pendingLeaves.slice(0, 3).map((leave: Conge) => (
                            <div key={leave.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-100 rounded-2xl hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-300"></div>
                                    <div>
                                        <p className="font-bold text-slate-900">
                                            {leave.type} - {leave.nombreJours} jour{leave.nombreJours > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-sm text-slate-600 font-medium mt-0.5">
                                            Du {new Date(leave.dateDebut).toLocaleDateString('fr-FR')} au {new Date(leave.dateFin).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-4 py-2 bg-amber-100 text-amber-700 text-xs font-black rounded-xl uppercase tracking-wide shadow-sm">
                                    En attente
                                </span>
                            </div>
                        ))}
                    </div>

                    {pendingLeaves.length > 3 && (
                        <Link
                            to="/dashboard/leaves"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all mx-auto shadow-sm hover:shadow-md"
                        >
                            Voir toutes les demandes ({pendingLeaves.length}) <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/dashboard/leaves"
                    className="group relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200/50 hover:shadow-2xl transition-all hover:scale-[1.02] overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">Nouvelle Demande</h3>
                        <p className="text-blue-100 font-medium">Créer une demande de congé</p>
                    </div>
                </Link>

                <Link
                    to="/dashboard/history"
                    className="group relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 p-8 rounded-3xl text-white shadow-xl shadow-purple-200/50 hover:shadow-2xl transition-all hover:scale-[1.02] overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">Historique</h3>
                        <p className="text-purple-100 font-medium">Consulter mes demandes</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};
