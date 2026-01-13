import { useAppSelector } from '@/store/hooks';
import { User, Mail, Phone, Building2, Briefcase, ShieldCheck, Calendar } from 'lucide-react';

export const ProfilePage = () => {
    const { user, isLoading } = useAppSelector((state) => state.auth);

    // Show loading state while auth is being checked
    if (isLoading) {
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Banner */}
            <div className="relative h-56 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <div className="relative h-full flex items-end p-8">
                    <div className="flex items-end gap-6 w-full">
                        <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl flex-shrink-0">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 text-5xl font-black">
                                {user.nomComplet?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div className="pb-2 text-white">
                            <h1 className="text-4xl font-bold mb-1">{user.nomComplet || 'Utilisateur'}</h1>
                            <p className="text-blue-100 font-medium opacity-90">{user.poste || user.roles?.join(', ') || 'Employé'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                    <div key={i} className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{item.label}</label>
                                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                                            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                                            <span className={item.value === '-' ? 'text-gray-400 italic' : ''}>{item.value}</span>
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
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Statut Compte
                        </h3>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 mb-6">
                            <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse"></div>
                            <span className="text-sm font-bold uppercase tracking-wider">Actif</span>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Membre depuis
                                </span>
                                <span className="text-gray-900 font-bold">{new Date((user as any)?.dateCreation || Date.now()).getFullYear()}</span>
                            </div>
                            <div className="h-[1px] bg-gray-100"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Rôles</span>
                                <span className="text-gray-900 font-bold text-right">{user.roles?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-blue-900 font-bold mb-2 relative flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Besoin d'aide ?
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
