-- Ajout des champs de durée partielle et horaire pour les congés
-- Check and add columns individually to make migration idempotent

-- Add duree_type
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE table_schema = DATABASE() 
                   AND table_name = 'conges' 
                   AND column_name = 'duree_type');
SET @query = IF(@col_exists = 0, 
                'ALTER TABLE conges ADD COLUMN duree_type VARCHAR(50) DEFAULT ''JOURNEE_ENTIERE'' NOT NULL', 
                'SELECT "duree_type already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add heure_debut
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE table_schema = DATABASE() 
                   AND table_name = 'conges' 
                   AND column_name = 'heure_debut');
SET @query = IF(@col_exists = 0, 
                'ALTER TABLE conges ADD COLUMN heure_debut TIME', 
                'SELECT "heure_debut already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add heure_fin
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE table_schema = DATABASE() 
                   AND table_name = 'conges' 
                   AND column_name = 'heure_fin');
SET @query = IF(@col_exists = 0, 
                'ALTER TABLE conges ADD COLUMN heure_fin TIME', 
                'SELECT "heure_fin already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
