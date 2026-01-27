import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';

export const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const displayName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim() || 'Non identifié';
    const displayRoles = user?.roles?.join(', ') || 'EMPLOYE';

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Card principale */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header avec dégradé */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                        </div>
                        
                        {/* Icône principale */}
                        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-xl">
                            <ShieldAlert className="w-12 h-12 text-orange-500" />
                        </div>
                        
                        <h1 className="text-4xl font-black text-white mb-3 relative">
                            Accès Refusé
                        </h1>
                        <p className="text-orange-100 text-lg font-medium relative">
                            Vous n'avez pas les autorisations nécessaires
                        </p>
                    </div>

                    {/* Contenu */}
                    <div className="px-8 py-10">
                        {/* Message contextuel */}
                        <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mt-0.5">
                                    <ShieldAlert className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-orange-900 mb-2">
                                        Pourquoi je vois cette page ?
                                    </h3>
                                    <p className="text-sm text-orange-800 leading-relaxed">
                                        La page ou la fonctionnalité que vous essayez d'accéder nécessite des privilèges
                                        spécifiques. Votre rôle actuel <span className="font-bold">({displayRoles})</span> ne 
                                        dispose pas des autorisations requises.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Informations utilisateur */}
                        <div className="bg-slate-50 rounded-xl p-5 mb-8">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500 font-medium block mb-1">Utilisateur</span>
                                    <span className="text-slate-900 font-bold">{displayName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-medium block mb-1">Rôle(s)</span>
                                    <span className="text-slate-900 font-bold">{displayRoles}</span>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions d'actions */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Que puis-je faire ?
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs mt-0.5">
                                        1
                                    </span>
                                    <span>Retournez au tableau de bord et accédez aux fonctionnalités disponibles pour votre rôle</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs mt-0.5">
                                        2
                                    </span>
                                    <span>Si vous pensez que cette restriction est une erreur, contactez votre responsable RH ou l'administrateur</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs mt-0.5">
                                        3
                                    </span>
                                    <span>Vérifiez que vous êtes connecté avec le bon compte utilisateur</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleGoHome}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Retour au Dashboard
                            </Button>
                            
                            <Button
                                onClick={handleGoBack}
                                variant="outline"
                                className="flex-1 border-2 border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Page Précédente
                            </Button>
                        </div>

                        {/* Contact support */}
                        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                            <p className="text-sm text-slate-500 mb-3">
                                Besoin d'aide supplémentaire ?
                            </p>
                            <a
                                href="mailto:support@gestionrh.com"
                                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                Contacter le Support RH
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="text-center mt-6 text-sm text-slate-500">
                    Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur système
                </div>
            </div>
        </div>
    );
};
