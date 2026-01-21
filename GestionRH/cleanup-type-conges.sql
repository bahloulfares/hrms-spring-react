-- Script de nettoyage des types de congés avec codes timestamps

USE gestionrh;

-- Désactiver le mode safe update et les contraintes de clés étrangères temporairement
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Voir les types de congés actuels
SELECT id, code, nom, actif 
FROM type_conges 
ORDER BY id;

-- 2. Supprimer d'abord les soldes de congés liés aux types bizarres
DELETE FROM solde_conges 
WHERE type_conge_id IN (
    SELECT id FROM type_conges 
    WHERE code REGEXP '[0-9]{10,}' OR LENGTH(code) > 20
);

-- 3. Supprimer tous les types de congés avec des codes contenant des timestamps (10 chiffres ou plus)
-- Garder seulement les types standards: CP, RTT, FORM, etc.
DELETE FROM type_conges 
WHERE code REGEXP '[0-9]{10,}' 
   OR LENGTH(code) > 20;

-- 3. Vérifier qu'il reste seulement les types standards
SELECT id, code, nom, actif 
FROM type_conges 
ORDER BY code;

-- 4. S'assurer qu'on a au moins les types de base
INSERT IGNORE INTO type_conges (code, nom, compteWeekend, joursParAn, peutDeborderSurCP, actif)
VALUES 
    ('CP', 'Congé Payé', 1, 25, 0, 1),
    ('RTT', 'RTT', 0, 10, 1, 1),
    ('FORM', 'Formation', 1, 5, 0, 1);

-- 5. Résultat final
SELECT COUNT(*) as total_types, 
       SUM(CASE WHEN actif = 1 THEN 1 ELSE 0 END) as types_actifs
FROM type_conges;

-- Réactiver le mode safe update et les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
