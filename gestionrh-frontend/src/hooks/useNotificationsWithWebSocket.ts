import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWebSocketService, type NotificationMessage } from '../services/webSocketService';
import { getNotifications } from '../api/notifications';

/**
 * Hook pour gérer les notifications avec WebSocket + fallback polling
 */
export const useNotificationsWithWebSocket = () => {
    const [wsConnected, setWsConnected] = useState(false);
    const [fallbackToPolling, setFallbackToPolling] = useState(false);
    const wsConnectionUnsubscribeRef = useRef<(() => void) | null>(null);
    const wsMessageUnsubscribeRef = useRef<(() => void) | null>(null);
    const queryClient = useQueryClient();

    // Polling fallback: toutes les 30s si WebSocket n'est pas connecté
    const pollingEnabled = fallbackToPolling || !wsConnected;
    const pollInterval = fallbackToPolling ? 30000 : undefined; // 30s fallback, disabled si WS connecté

    // Query pour les notifications (polling fallback)
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotifications(),
        staleTime: 25000,
        refetchInterval: pollInterval,
        enabled: pollingEnabled,
    });

    useEffect(() => {
        const ws = getWebSocketService();

        // Listener: changement de connexion WebSocket
        wsConnectionUnsubscribeRef.current = ws.onConnectionChange((connected) => {
            console.log('[useNotifications] WebSocket connection changed:', connected);
            setWsConnected(connected);

            if (!connected) {
                console.log('[useNotifications] WebSocket disconnected, enabling polling fallback');
                setFallbackToPolling(true);
            } else {
                console.log('[useNotifications] WebSocket connected, disabling polling fallback');
                setFallbackToPolling(false);
            }
        });

        // Listener: nouveau message WebSocket
        wsMessageUnsubscribeRef.current = ws.onMessage((message: NotificationMessage) => {
            console.log('[useNotifications] Received WebSocket notification:', message);
            
            // Mettre en cache la nouvelle notification
            queryClient.setQueryData(['notifications'], (oldData: NotificationMessage[] = []) => {
                // Éviter les doublons
                if (oldData.some(n => n.id === message.id)) {
                    return oldData;
                }
                return [message, ...oldData];
            });
        });

        // Tenter de se connecter
        console.log('[useNotifications] Attempting WebSocket connection');
        ws.connect();

        // Cleanup
        return () => {
            if (wsConnectionUnsubscribeRef.current) {
                wsConnectionUnsubscribeRef.current();
            }
            if (wsMessageUnsubscribeRef.current) {
                wsMessageUnsubscribeRef.current();
            }
        };
    }, [queryClient]);

    const unreadCount = notifications.filter((n: any) => !n.read).length;
    const isWebSocketConnected = wsConnected && !fallbackToPolling;

    return {
        notifications,
        unreadCount,
        wsConnected,
        isWebSocketConnected,
        fallbackToPolling,
        isLoading: false,
        status: wsConnected ? 'connected' : fallbackToPolling ? 'polling' : 'disconnected',
    };
};

/**
 * Hook antérieur (pour compatibilité) - utilise le polling uniquement
 * À supprimer après migration complète vers useNotificationsWithWebSocket
 */
export const useNotifications = () => {
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotifications(),
        staleTime: 25000,
        refetchInterval: 30000, // Polling toutes les 30s
    });

    return {
        notifications,
        wsConnected: false,
        fallbackToPolling: true,
        status: 'polling',
    };
};
