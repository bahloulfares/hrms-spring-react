-- Migration pour ajouter le champ actif sur type_conges
-- et créer la table conge_historique pour l'audit trail

-- 1. Ajouter le champ actif à type_conges
ALTER TABLE `type_conges`
ADD COLUMN `actif` BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Créer la table conge_historique pour l'audit trail
CREATE TABLE `conge_historique` (
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
