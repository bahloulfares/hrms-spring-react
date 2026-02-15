import { useAuthStore } from '@/store/auth';
import { User, Mail, Phone, Building2, Briefcase, ShieldCheck, Calendar } from 'lucide-react';
import type { User as UserType } from '@/types';

export const ProfilePage = () => {
    const { user, loading } = useAuthStore() as { user: UserType | null; loading: boolean };

    // Show loading state while auth is being checked
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Show empty state if no user after loading
    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-gray-500 text-lg">Impossible de charger les données utilisateur</p>
            </div>
        );
    }

    const infoGroups = [
        {
            title: 'Informations Personnelles',
            icon: <User className="w-5 h-5 text-blue-600" />,
            items: [
                { label: 'Prénom', value: user.prenom || '-' },
                { label: 'Nom', value: user.nom || '-' },
                { label: 'Email', value: user.email, icon: <Mail className="w-4 h-4 text-gray-400" /> },
                { label: 'Téléphone', value: user.telephone || '-', icon: <Phone className="w-4 h-4 text-gray-400" /> },
            ]
        },
        {
            title: 'Affectation Professionnelle',
            icon: <Briefcase className="w-5 h-5 text-purple-600" />,
            items: [
                { label: 'Département', value: user.departement || '-', icon: <Building2 className="w-4 h-4 text-gray-400" /> },
                { label: 'Poste', value: user.poste || '-', icon: <Briefcase className="w-4 h-4 text-gray-400" /> },
                { label: 'Rôles', value: user.roles?.join(', ') || '-', icon: <ShieldCheck className="w-4 h-4 text-gray-400" /> },
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto w-full space-y-8">
            {/* Header / Banner */}
            <div className="relative h-56 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <div className="relative h-full flex items-end p-6 md:p-8">
                    <div className="flex items-end gap-4 md:gap-6 w-full flex-wrap md:flex-nowrap">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-1.5 shadow-xl flex-shrink-0">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 text-3xl md:text-5xl font-black">
                                {user?.nom?.charAt(0)?.toUpperCase() || user?.prenom?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className="pb-2 text-white flex-1 min-w-0">
                            <h1 className="text-2xl md:text-4xl font-bold mb-1 truncate">{`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}</h1>
                            <p className="text-blue-100 font-medium opacity-90 truncate">{user?.poste || user?.roles?.join(', ') || 'Employé'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Info Sections */}
                <div className="md:col-span-2 space-y-6">
                    {infoGroups.map((group, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-gray-50">
                                    {group.icon}
                                </div>
                                <h3 className="font-bold text-gray-900">{group.title}</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                {group.items.map((item, i) => (
                                    <div key={i} className="space-y-1.5 min-w-0">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{item.label}</label>
                                        <div className="flex items-center gap-2 text-gray-700 font-medium min-w-0">
                                            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                                            <span className={`truncate ${item.value === '-' ? 'text-gray-400 italic' : ''}`}>{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <span>Statut Compte</span>
                        </h3>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 mb-6">
                            <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse flex-shrink-0"></div>
                            <span className="text-sm font-bold uppercase tracking-wider">Actif</span>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-gray-500 font-medium flex items-center gap-2 flex-shrink-0">
                                    <Calendar className="w-4 h-4 flex-shrink-0" /> Membre depuis
                                </span>
                                <span className="text-gray-900 font-bold">{new Date(user?.dateCreation || 0).getFullYear()}</span>
                            </div>
                            <div className="h-[1px] bg-gray-100"></div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-gray-500 font-medium">Rôles</span>
                                <span className="text-gray-900 font-bold text-right">{user?.roles?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-blue-900 font-bold mb-2 relative flex items-center gap-2">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span>Besoin d'aide ?</span>
                        </h3>
                        <p className="text-blue-700 text-xs leading-relaxed relative mb-4">
                            Contactez le support RH pour toute modification de vos informations contractuelles.
                        </p>
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 relative">
                            Contacter le support →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
