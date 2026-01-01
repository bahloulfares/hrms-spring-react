import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { Calendar, TrendingUp, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SoldeConge, Conge } from '../types';
import { useAppSelector } from '../../../store/hooks';

export const DashboardHomePage = () => {
    const { user } = useAppSelector((state) => state.auth);
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
        <div className="space-y-8 p-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Bienvenue, {user?.nomComplet} 👋</h1>
                <p className="text-blue-100">Voici un aperçu de vos congés et demandes en cours</p>
            </div>

            {/* Balance Cards */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Mes Soldes de Congés</h2>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setSelectedYear(y => y - 1)}
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all rounded-lg"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent border-none text-sm font-black text-slate-700 outline-none px-2 cursor-pointer focus:ring-0"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>Année {year}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setSelectedYear(y => y + 1)}
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all rounded-lg"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <Link
                        to="/dashboard/leaves"
                        className="text-sm text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 group"
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
                                <div key={solde.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${solde.typeCongeCode === 'CP' ? 'bg-blue-50 text-blue-600' :
                                            solde.typeCongeCode === 'RTT' ? 'bg-purple-50 text-purple-600' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{solde.annee}</span>
                                    </div>

                                    <h3 className="text-gray-600 text-sm font-medium mb-2">{solde.typeCongeNom}</h3>

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-4xl font-bold text-gray-900">{solde.joursRestants}</span>
                                        <span className="text-sm text-gray-400">/ {totalJours} jours</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Utilisés: {joursUtilises} j</span>
                                            <span>{pourcentageUtilise.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${pourcentageUtilise > 80 ? 'bg-red-500' :
                                                    pourcentageUtilise > 50 ? 'bg-yellow-500' :
                                                        'bg-green-500'
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
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Aucun solde pour {selectedYear}</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            Vos soldes seront automatiquement initialisés lors de votre prochaine demande de congé pour cette année.
                        </p>
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            {pendingLeaves.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <h2 className="text-xl font-bold text-gray-900">Demandes en Attente ({pendingLeaves.length})</h2>
                    </div>

                    <div className="space-y-3">
                        {pendingLeaves.slice(0, 3).map((leave: Conge) => (
                            <div key={leave.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {leave.type} - {leave.nombreJours} jour{leave.nombreJours > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Du {new Date(leave.dateDebut).toLocaleDateString('fr-FR')} au {new Date(leave.dateFin).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                    En attente
                                </span>
                            </div>
                        ))}
                    </div>

                    {pendingLeaves.length > 3 && (
                        <Link
                            to="/dashboard/leaves"
                            className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Voir toutes les demandes ({pendingLeaves.length})
                        </Link>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/dashboard/leaves"
                    className="group bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold mb-1">Nouvelle Demande</h3>
                            <p className="text-blue-100 text-sm">Créer une demande de congé</p>
                        </div>
                        <TrendingUp className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>

                <Link
                    to="/dashboard/leaves"
                    className="group bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold mb-1">Historique</h3>
                            <p className="text-purple-100 text-sm">Consulter mes demandes</p>
                        </div>
                        <Calendar className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
            </div>
        </div>
    );
};
