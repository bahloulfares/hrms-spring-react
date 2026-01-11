import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaveApi } from '../api';
import { Modal } from '../../../components/common/Modal';
import { CheckCircle2, XCircle, Clock, Loader } from 'lucide-react';
// (no-op)

interface LeaveHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    leaveId: number;
}

/**
 * Modal simple affichant la timeline historique d'une demande de congé
 * Icônes colorées: ✅ approuvé, ❌ refusé, ⏳ en attente
 */
export const LeaveHistoryModal: React.FC<LeaveHistoryModalProps> = ({
    isOpen,
    onClose,
    leaveId
}) => {
    const { data: history, isLoading } = useQuery({
        queryKey: ['leave-history', leaveId],
        queryFn: () => leaveApi.getLeaveHistory(leaveId),
        enabled: isOpen // Seulement charger quand le modal est ouvert
    });

    const getStatusIcon = (status: string | null) => {
        if (!status) return <Clock className="w-5 h-5 text-blue-500" />;
        
        switch (status.toUpperCase()) {
            case 'APPROUVE':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'REJETE':
            case 'REFUSE':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'EN_ATTENTE':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'ANNULE':
                return <XCircle className="w-5 h-5 text-gray-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusLabel = (status: string | null) => {
        if (!status) return 'Demande créée';
        
        switch (status.toUpperCase()) {
            case 'APPROUVE':
                return 'Approuvée';
            case 'REJETE':
            case 'REFUSE':
                return 'Refusée';
            case 'EN_ATTENTE':
                return 'En attente';
            case 'ANNULE':
                return 'Annulée';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string | null) => {
        if (!status) return 'text-blue-600';
        
        switch (status.toUpperCase()) {
            case 'APPROUVE':
                return 'text-green-600';
            case 'REJETE':
            case 'REFUSE':
                return 'text-red-600';
            case 'EN_ATTENTE':
                return 'text-yellow-600';
            case 'ANNULE':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="📜 Historique de la Demande">
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                        <span>Chargement de l'historique...</span>
                    </div>
                ) : history && history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((entry, index) => (
                            <div key={entry.id} className="flex gap-4">
                                {/* Timeline connector */}
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center">
                                        {getStatusIcon(entry.statutNouveau)}
                                    </div>
                                    {index < history.length - 1 && (
                                        <div className="w-0.5 h-12 bg-gray-300 my-1" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                    {/* Status */}
                                    <div className={`font-semibold text-lg ${getStatusColor(entry.statutNouveau)}`}>
                                        {getStatusLabel(entry.statutNouveau)}
                                    </div>

                                    {/* Actor and Date */}
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">{entry.acteurNom}</span>
                                        <span className="mx-1">•</span>
                                        <span>
                                            {new Date(entry.dateModification).toLocaleDateString('fr-FR', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    {/* Status transition */}
                                    {entry.statutPrecedent && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {getStatusLabel(entry.statutPrecedent)} → {getStatusLabel(entry.statutNouveau)}
                                        </div>
                                    )}

                                    {/* Comment */}
                                    {entry.commentaire && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                            <span className="font-medium">Commentaire:</span> {entry.commentaire}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500">
                        Pas d'historique disponible
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 border-t pt-4 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
                >
                    Fermer
                </button>
            </div>
        </Modal>
    );
};

export default LeaveHistoryModal;
