-- V4__create_notifications_table.sql
-- Création de la table des notifications pour le système de notifications en temps réel

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    lue BOOLEAN DEFAULT FALSE NOT NULL,
    conge_id BIGINT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    employe_nom VARCHAR(255),
    type_conge VARCHAR(100),
    action_par VARCHAR(255),
    
    -- Indexes pour améliorer les performances
    INDEX idx_utilisateur_date (utilisateur_id, date_creation DESC),
    INDEX idx_utilisateur_lue (utilisateur_id, lue),
    INDEX idx_date_creation (date_creation),
    
    -- Contraintes de clés étrangères
    CONSTRAINT fk_notification_utilisateur 
        FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_notification_conge 
        FOREIGN KEY (conge_id) 
        REFERENCES conges(id) 
        ON DELETE SET NULL,
    
    -- Contrainte de vérification du type
    CONSTRAINT chk_notification_type 
        CHECK (type IN ('LEAVE_CREATED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Commentaires pour la documentation
ALTER TABLE notifications 
    COMMENT = 'Table des notifications système pour les événements de congés';

ALTER TABLE notifications 
    MODIFY COLUMN type VARCHAR(50) COMMENT 'Type de notification (LEAVE_CREATED, LEAVE_APPROVED, LEAVE_REJECTED, LEAVE_CANCELLED)',
    MODIFY COLUMN titre VARCHAR(255) COMMENT 'Titre court de la notification',
    MODIFY COLUMN message TEXT COMMENT 'Message détaillé de la notification',
    MODIFY COLUMN lue BOOLEAN COMMENT 'Indique si la notification a été lue par l''utilisateur',
    MODIFY COLUMN conge_id BIGINT COMMENT 'Référence vers le congé concerné (optionnel)',
    MODIFY COLUMN employe_nom VARCHAR(255) COMMENT 'Nom dénormalisé de l''employé pour éviter les jointures',
    MODIFY COLUMN type_conge VARCHAR(100) COMMENT 'Type de congé dénormalisé (Congé payé, RTT, etc.)',
    MODIFY COLUMN action_par VARCHAR(255) COMMENT 'Nom de l''utilisateur ayant effectué l''action';
