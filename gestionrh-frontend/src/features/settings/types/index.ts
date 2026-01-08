export interface NotificationPreferences {
    id?: number;
    userId?: number;
    emailEnabled: boolean;
    slackEnabled: boolean;
    smsEnabled: boolean;
    notificationTypes: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface TestNotificationRequest {
    channel: 'EMAIL' | 'SLACK' | 'SMS';
    message?: string;
}
