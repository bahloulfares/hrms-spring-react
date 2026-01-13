export interface Notification {
    id: number;
    type: 'LEAVE_CREATED' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'LEAVE_CANCELLED';
    titre: string;
    message: string;
    lue: boolean;
    congeId?: number;
    dateCreation: string;
    employeNom?: string;
    typeConge?: string;
    actionPar?: string;
}

export interface UnreadCountResponse {
    count: number;
}

export interface MarkAllReadResponse {
    markedCount: number;
}
