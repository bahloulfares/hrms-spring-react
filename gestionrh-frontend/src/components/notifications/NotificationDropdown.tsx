import { useRef, useEffect } from 'react';
import { BellRing, CheckCheck, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationDropdown = ({ isOpen, onClose }: NotificationDropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isMarkingAllAsRead,
    } = useNotifications();

    // Fermer le dropdown si on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-14 w-96 max-h-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsRead()}
                            disabled={isMarkingAllAsRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Tout marquer comme lu"
                        >
                            {isMarkingAllAsRead ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCheck className="w-4 h-4" />
                            )}
                            <span>Tout lire</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Contenu */}
            <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Chargement des notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <BellRing className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            Aucune notification
                        </h4>
                        <p className="text-sm text-gray-500 text-center">
                            Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.
                        </p>
                    </div>
                ) : (
                    <div>
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer (optionnel) */}
            {notifications.length > 0 && (
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-center">
                    <p className="text-xs text-gray-500">
                        Affichage des {notifications.length} dernières notifications
                    </p>
                </div>
            )}
        </div>
    );
};
