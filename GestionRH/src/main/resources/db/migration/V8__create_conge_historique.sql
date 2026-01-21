-- Create conge_historique table for audit trail
CREATE TABLE IF NOT EXISTS `conge_historique` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `conge_id` BIGINT NOT NULL,
    `statut_precedent` VARCHAR(50) NULL,
    `statut_nouveau` VARCHAR(50) NOT NULL,
    `acteur` VARCHAR(100) NOT NULL,
    `date_modification` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `commentaire` VARCHAR(500) NULL,
    FOREIGN KEY (`conge_id`) REFERENCES `conges`(`id`) ON DELETE CASCADE,
    INDEX `idx_conge_id` (`conge_id`),
    INDEX `idx_date_modification` (`date_modification`)
);

