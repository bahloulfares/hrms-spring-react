import { axiosClient } from './axiosClient';

export interface Notification {
    id: number;
    userId: number;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
}

/**
 * Récupère la liste des notifications de l'utilisateur
 */
export const getNotifications = async (): Promise<Notification[]> => {
    const response = await axiosClient.get('/notifications');
    if (Array.isArray(response.data)) {
        return response.data;
    }
    if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
    }
    console.warn('[API] getNotifications: unexpected response structure', response.data);
    return [];
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = async (id: number): Promise<void> => {
    await axiosClient.put(`/notifications/${id}/read`);
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
    await axiosClient.put('/notifications/read-all');
};
