-- Add unique constraint on solde_conges to prevent duplicates
-- Check if constraint already exists before adding
SET @constraint_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                          WHERE table_schema = DATABASE() 
                          AND table_name = 'solde_conges' 
                          AND index_name = 'uk_solde_conges_user_type_year');

SET @add_query = IF(@constraint_exists = 0, 
                    'ALTER TABLE solde_conges ADD CONSTRAINT uk_solde_conges_user_type_year UNIQUE (utilisateur_id, type_conge_id, annee)', 
                    'SELECT "Constraint already exists" AS message');

PREPARE stmt FROM @add_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
