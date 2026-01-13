-- Fix Flyway schema history by deleting failed migration entry
-- Run this with: mysql -u gestionrh_app -p gestionrh < fix-flyway-history.sql

USE gestionrh;

-- Delete the failed V3 migration entry
DELETE FROM flyway_schema_history WHERE version = '3' AND success = 0;

-- Show remaining entries
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
