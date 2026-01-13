-- Fix Flyway schema history
USE gestionrh;

-- 1. Afficher l'historique actuel avec les migrations échouées
SELECT version, description, type, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;

-- 2. Supprimer toutes les entrées de migration échouées
DELETE FROM flyway_schema_history WHERE success = 0;

-- 3. Afficher l'historique nettoyé
SELECT version, description, type, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;
