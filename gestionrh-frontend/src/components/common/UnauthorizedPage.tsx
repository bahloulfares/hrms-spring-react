import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import accessDeniedImg from '../../assets/access-denied.png';

export const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 flex flex-col items-center text-center">
                    {/* Visual Asset */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50 scale-150"></div>
                        <img
                            src={accessDeniedImg}
                            alt="Accès Refusé"
                            className="relative w-48 h-48 object-contain drop-shadow-2xl animate-pulse"
                        />
                    </div>

                    {/* Icon and Title */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <ShieldAlert size={14} />
                        Sécurité
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-2">Accès Refusé</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Désolé, vous n'avez pas les autorisations nécessaires pour accéder à cette section.
                        Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            <ArrowLeft size={18} />
                            Retour
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all border-2 border-transparent"
                        >
                            <Home size={18} />
                            Tableau de bord
                        </button>
                    </div>
                </div>

                {/* Footer info */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 italic">
                        ID de l'incident : {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
};
