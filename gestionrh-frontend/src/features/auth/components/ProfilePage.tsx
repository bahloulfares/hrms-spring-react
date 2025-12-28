import { useAppSelector } from '@/store/hooks';
import { User, Mail, Phone, Building2, Briefcase, ShieldCheck, Calendar } from 'lucide-react';

export const ProfilePage = () => {
    const { user } = useAppSelector((state) => state.auth);

    if (!user) return null;

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
            <div className="relative h-48 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl">
                        <div className="w-full h-full rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 text-4xl font-black">
                            {user.nomComplet?.charAt(0)}
                        </div>
                    </div>
                    <div className="pb-14 text-white">
                        <h1 className="text-3xl font-bold">{user.nomComplet}</h1>
                        <p className="text-blue-100 font-medium opacity-90">{user.poste || 'Utilisateur'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
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
                                    <div key={i} className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{item.label}</label>
                                        <div className="flex items-center gap-2 text-gray-700 font-medium h-6">
                                            {item.icon}
                                            <span>{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Statut Compte</h3>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 mb-4">
                            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                            <span className="text-sm font-bold uppercase tracking-wider">Actif</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Membre depuis
                                </span>
                                <span className="text-gray-900 font-bold">2024</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-blue-900 font-bold mb-2 relative">Besoin d'aide ?</h3>
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
