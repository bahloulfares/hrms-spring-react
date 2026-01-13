import { useNavigate } from 'react-router-dom';
import { X, Check, Clock, ThumbsUp, ThumbsDown, Ban, FileText } from 'lucide-react';
import type { Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: number) => void;
    onDelete: (id: number) => void;
}

export const NotificationItem = ({ notification, onMarkAsRead, onDelete }: NotificationItemProps) => {
    const navigate = useNavigate();

    const getIcon = () => {
        switch (notification.type) {
            case 'LEAVE_CREATED':
                return <FileText className="w-5 h-5 text-blue-500" />;
            case 'LEAVE_APPROVED':
                return <ThumbsUp className="w-5 h-5 text-green-500" />;
            case 'LEAVE_REJECTED':
                return <ThumbsDown className="w-5 h-5 text-red-500" />;
            case 'LEAVE_CANCELLED':
                return <Ban className="w-5 h-5 text-orange-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBackgroundColor = () => {
        if (!notification.lue) {
            return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
        }
        return 'bg-white hover:bg-gray-50 border-gray-200';
    };

    const handleClick = () => {
        if (!notification.lue) {
            onMarkAsRead(notification.id);
        }
        if (notification.congeId) {
            navigate('/dashboard/leaves');
        }
    };

    const timeAgo = formatDistanceToNow(new Date(notification.dateCreation), {
        addSuffix: true,
        locale: fr,
    });

    return (
        <div
            className={`group relative p-4 border-b transition-all cursor-pointer ${getBackgroundColor()}`}
            onClick={handleClick}
        >
            {/* Badge non lue */}
            {!notification.lue && (
                <div className="absolute top-3 left-2 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}

            <div className="flex items-start gap-3 pl-3">
                {/* Icône */}
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-semibold ${notification.lue ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.titre}
                        </h4>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.lue && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkAsRead(notification.id);
                                    }}
                                    className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                                    title="Marquer comme lu"
                                    aria-label="Marquer comme lu"
                                >
                                    <Check className="w-4 h-4 text-green-600" />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(notification.id);
                                }}
                                className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                                title="Supprimer"
                                aria-label="Supprimer la notification"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <p className={`text-sm mb-2 ${notification.lue ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo}</span>
                        {notification.employeNom && (
                            <>
                                <span>•</span>
                                <span>{notification.employeNom}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
