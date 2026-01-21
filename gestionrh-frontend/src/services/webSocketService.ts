/**
 * Service WebSocket pour les notifications en temps réel
 * Avec support de reconnexion auto et fallback polling
 */

export type NotificationMessage = {
    id: number;
    userId: number;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
};

export type WebSocketMessage = {
    type: 'notification' | 'ping' | 'pong' | 'connected';
    payload?: any;
};

type ConnectionCallback = (connected: boolean) => void;
type MessageCallback = (message: NotificationMessage) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // ms
    private reconnectDelayMax = 30000; // ms
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private heartbeatTimeout: NodeJS.Timeout | null = null;
    private isIntentionallyClosed = false;

    // Callbacks
    private connectionCallbacks: Set<ConnectionCallback> = new Set();
    private messageCallbacks: Set<MessageCallback> = new Set();

    constructor(url?: string) {
        this.url = url || this.buildWebSocketUrl();
    }

    /**
     * Construit l'URL WebSocket en fonction de l'environnement
     */
    private buildWebSocketUrl(): string {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/api/notifications/ws`;
    }

    /**
     * Se connecte au serveur WebSocket
     */
    public connect(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('[WebSocket] Already connected');
            return;
        }

        console.log(`[WebSocket] Connecting to ${this.url}`);
        this.isIntentionallyClosed = false;

        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('[WebSocket] Connected');
                this.reconnectAttempts = 0;
                this.startHeartbeat();
                this.notifyConnectionChange(true);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as WebSocketMessage;
                    console.log('[WebSocket] Received message:', data);

                    if (data.type === 'notification' && data.payload) {
                        this.notifyMessage(data.payload);
                    } else if (data.type === 'ping') {
                        // Pong automatique pour heartbeat serveur
                        this.send({ type: 'pong' });
                    }

                    this.resetHeartbeat();
                } catch (error) {
                    console.error('[WebSocket] Error parsing message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
                this.notifyConnectionChange(false);
            };

            this.ws.onclose = () => {
                console.log('[WebSocket] Closed');
                this.stopHeartbeat();
                this.notifyConnectionChange(false);

                if (!this.isIntentionallyClosed) {
                    this.attemptReconnect();
                }
            };
        } catch (error) {
            console.error('[WebSocket] Connection error:', error);
            this.notifyConnectionChange(false);
            this.attemptReconnect();
        }
    }

    /**
     * Tente de se reconnecter avec backoff exponentiel
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[WebSocket] Max reconnection attempts reached. Fallback to polling.');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.reconnectDelayMax
        );

        console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
    }

    /**
     * Démarre le heartbeat (ping/pong)
     */
    private startHeartbeat(): void {
        this.stopHeartbeat();
        
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                console.log('[WebSocket] Sending heartbeat ping');
                this.send({ type: 'ping' });

                // Timeout si pas de réponse dans 5s
                this.heartbeatTimeout = setTimeout(() => {
                    console.warn('[WebSocket] Heartbeat timeout - closing connection');
                    this.close();
                }, 5000);
            }
        }, 30000); // Ping toutes les 30s
    }

    /**
     * Réinitialise le timeout du heartbeat quand on reçoit un message
     */
    private resetHeartbeat(): void {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
    }

    /**
     * Arrête le heartbeat
     */
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    /**
     * Envoie un message au serveur
     */
    public send(message: WebSocketMessage): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('[WebSocket] Cannot send: connection not ready', { readyState: this.ws?.readyState });
        }
    }

    /**
     * Ferme la connexion volontairement
     */
    public close(): void {
        console.log('[WebSocket] Closing connection');
        this.isIntentionallyClosed = true;
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.notifyConnectionChange(false);
    }

    /**
     * Retourne l'état de la connexion
     */
    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * S'abonne aux changements de connexion
     */
    public onConnectionChange(callback: ConnectionCallback): () => void {
        this.connectionCallbacks.add(callback);
        // Retourner une fonction de désabonnement
        return () => {
            this.connectionCallbacks.delete(callback);
        };
    }

    /**
     * S'abonne aux nouveaux messages de notification
     */
    public onMessage(callback: MessageCallback): () => void {
        this.messageCallbacks.add(callback);
        // Retourner une fonction de désabonnement
        return () => {
            this.messageCallbacks.delete(callback);
        };
    }

    /**
     * Notifie tous les listeners de changement de connexion
     */
    private notifyConnectionChange(connected: boolean): void {
        this.connectionCallbacks.forEach(callback => {
            try {
                callback(connected);
            } catch (error) {
                console.error('[WebSocket] Error in connection callback:', error);
            }
        });
    }

    /**
     * Notifie tous les listeners d'un nouveau message
     */
    private notifyMessage(message: NotificationMessage): void {
        this.messageCallbacks.forEach(callback => {
            try {
                callback(message);
            } catch (error) {
                console.error('[WebSocket] Error in message callback:', error);
            }
        });
    }

    /**
     * Retourne les callbacks actuels (pour les tests)
     */
    public getCallbackCount(): { connection: number; message: number } {
        return {
            connection: this.connectionCallbacks.size,
            message: this.messageCallbacks.size,
        };
    }
}

// Singleton global
let wsServiceInstance: WebSocketService | null = null;

export function getWebSocketService(url?: string): WebSocketService {
    if (!wsServiceInstance) {
        wsServiceInstance = new WebSocketService(url);
    }
    return wsServiceInstance;
}

export function resetWebSocketService(): void {
    if (wsServiceInstance) {
        wsServiceInstance.close();
        wsServiceInstance = null;
    }
}
