import axiosClient from '../../../api/axiosClient';
import type { NotificationPreferences, TestNotificationRequest } from '../types';

export const settingsApi = {
    getPreferences: async (): Promise<NotificationPreferences> => {
        const response = await axiosClient.get('/users/me/notification-preferences');
        return response.data;
    },

    updatePreferences: async (data: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
        const response = await axiosClient.post('/users/me/notification-preferences', data);
        return response.data;
    },

    testNotification: async (data: TestNotificationRequest): Promise<void> => {
        await axiosClient.post('/users/me/test-notification', data);
    },
};
