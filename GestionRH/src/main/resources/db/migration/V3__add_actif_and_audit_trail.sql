-- Migration pour ajouter le champ actif sur type_conges
-- et créer la table conge_historique pour l'audit trail

-- 1. Ajouter le champ actif à type_conges (conditionally - check if it exists first)
SET @col_exists := 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'type_conges' 
AND COLUMN_NAME = 'actif';

SET @sql := IF(@col_exists = 0, 'ALTER TABLE `type_conges` ADD COLUMN `actif` BOOLEAN NOT NULL DEFAULT TRUE', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Créer la table conge_historique pour l'audit trail
CREATE TABLE IF NOT EXISTS `conge_historique` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `conge_id` BIGINT NOT NULL,
    `statut_precedent` VARCHAR(50),
    `statut_nouveau` VARCHAR(50) NOT NULL,
    `acteur` VARCHAR(100) NOT NULL,
    `date_modification` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `commentaire` VARCHAR(500),
    CONSTRAINT `fk_conge_historique_conge`
        FOREIGN KEY (`conge_id`) REFERENCES `conges` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Index pour améliorer les requêtes d'historique
CREATE INDEX `idx_conge_historique_conge` ON `conge_historique` (`conge_id`, `date_modification` DESC);
CREATE INDEX `idx_conge_historique_acteur` ON `conge_historique` (`acteur`);
