import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notificationApi';
import toast from 'react-hot-toast';

/**
 * Hook pour gérer les notifications avec React Query
 * Polling automatique toutes les 30 secondes
 */
export const useNotifications = () => {
    const queryClient = useQueryClient();

    // Query: Liste des notifications
    const {
        data: notifications = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationApi.getNotifications,
        refetchInterval: 30000, // Polling toutes les 30 secondes
        refetchOnWindowFocus: true,
    });

    // Query: Compteur non lues
    const {
        data: unreadCount = 0,
    } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationApi.getUnreadCount,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });

    // Mutation: Marquer comme lue
    const markAsReadMutation = useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
        onError: () => {
            toast.error('Erreur lors du marquage de la notification');
        },
    });

    // Mutation: Tout marquer comme lu
    const markAllAsReadMutation = useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: (count) => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            if (count > 0) {
                toast.success(`${count} notification${count > 1 ? 's' : ''} marquée${count > 1 ? 's' : ''} comme lue${count > 1 ? 's' : ''}`);
            }
        },
        onError: () => {
            toast.error('Erreur lors du marquage des notifications');
        },
    });

    // Mutation: Supprimer
    const deleteNotificationMutation = useMutation({
        mutationFn: notificationApi.deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
        onError: () => {
            toast.error('Erreur lors de la suppression de la notification');
        },
    });

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        deleteNotification: deleteNotificationMutation.mutate,
        isMarkingAsRead: markAsReadMutation.isPending,
        isMarkingAllAsRead: markAllAsReadMutation.isPending,
        isDeleting: deleteNotificationMutation.isPending,
    };
};
