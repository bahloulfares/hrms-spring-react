import { axiosClient } from '@/api/axiosClient';
import type { Notification, UnreadCountResponse, MarkAllReadResponse } from '@/types/notification';

export const notificationApi = {
    /**
     * Récupère toutes les notifications de l'utilisateur connecté
     */
    getNotifications: async (): Promise<Notification[]> => {
        const response = await axiosClient.get('/notifications');
        return response.data;
    },

    /**
     * Récupère le nombre de notifications non lues
     */
    getUnreadCount: async (): Promise<number> => {
        const response = await axiosClient.get<UnreadCountResponse>('/notifications/unread-count');
        return response.data.count;
    },

    /**
     * Marque une notification comme lue
     */
    markAsRead: async (notificationId: number): Promise<void> => {
        await axiosClient.put(`/notifications/${notificationId}/read`);
    },

    /**
     * Marque toutes les notifications comme lues
     */
    markAllAsRead: async (): Promise<number> => {
        const response = await axiosClient.post<MarkAllReadResponse>('/notifications/mark-all-read');
        return response.data.markedCount;
    },

    /**
     * Supprime une notification
     */
    deleteNotification: async (notificationId: number): Promise<void> => {
        await axiosClient.delete(`/notifications/${notificationId}`);
    },
};
