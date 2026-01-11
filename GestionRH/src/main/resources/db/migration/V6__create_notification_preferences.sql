-- Création de la table notification_preferences
CREATE TABLE notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    slack_enabled BOOLEAN DEFAULT FALSE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_prefs_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Index pour accélérer les lookups par utilisateur
CREATE INDEX idx_notification_prefs_utilisateur ON notification_preferences(utilisateur_id);
