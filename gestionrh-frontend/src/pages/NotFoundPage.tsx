import { useNavigate } from 'react-router-dom';
import { SearchX, Home, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Card principale */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header avec dégradé */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
                            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full animate-pulse delay-75"></div>
                        </div>
                        
                        {/* Code d'erreur 404 */}
                        <div className="relative mb-4">
                            <h1 className="text-9xl font-black text-white opacity-20 mb-0 leading-none">404</h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                                    <SearchX className="w-12 h-12 text-purple-600" />
                                </div>
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-black text-white mb-3 relative mt-8">
                            Page Introuvable
                        </h2>
                        <p className="text-purple-100 text-lg font-medium relative">
                            Oups ! Cette page semble avoir disparu
                        </p>
                    </div>

                    {/* Contenu */}
                    <div className="px-8 py-10">
                        {/* Message amusant mais pro */}
                        <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                                    <Compass className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-purple-900 mb-2">
                                        Vous vous êtes perdu ?
                                    </h3>
                                    <p className="text-sm text-purple-800 leading-relaxed">
                                        La page que vous recherchez n'existe pas ou a été déplacée. 
                                        Vérifiez l'URL ou retournez au tableau de bord pour continuer votre navigation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Raisons possibles */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                                Pourquoi cette erreur ?
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">
                                        •
                                    </span>
                                    <span>L'URL que vous avez tapée est incorrecte</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">
                                        •
                                    </span>
                                    <span>La page a été supprimée ou déplacée</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">
                                        •
                                    </span>
                                    <span>Le lien que vous avez suivi est obsolète</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleGoHome}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Retour à l'Accueil
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

                        {/* Pages populaires */}
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <p className="text-sm font-bold text-slate-700 mb-4">
                                Pages populaires :
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="text-sm text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 hover:border-purple-200 group"
                                >
                                    <span className="text-slate-900 font-medium group-hover:text-purple-600">🏠 Accueil</span>
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/leaves')}
                                    className="text-sm text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 hover:border-purple-200 group"
                                >
                                    <span className="text-slate-900 font-medium group-hover:text-purple-600">📅 Congés</span>
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/profile')}
                                    className="text-sm text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 hover:border-purple-200 group"
                                >
                                    <span className="text-slate-900 font-medium group-hover:text-purple-600">👤 Profil</span>
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/settings')}
                                    className="text-sm text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 hover:border-purple-200 group"
                                >
                                    <span className="text-slate-900 font-medium group-hover:text-purple-600">⚙️ Réglages</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer avec un peu d'humour */}
                <div className="text-center mt-6 text-sm text-slate-500">
                    <p>💡 Astuce : Utilisez le menu de navigation pour explorer l'application</p>
                </div>
            </div>
        </div>
    );
};
