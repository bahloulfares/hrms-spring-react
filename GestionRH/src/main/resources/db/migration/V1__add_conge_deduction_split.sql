-- Ajout des colonnes de traçabilité du split de déduction pour les congés
-- Exécuter sur une base existante avant de valider les nouvelles fonctionnalités

ALTER TABLE conges
    ADD COLUMN IF NOT EXISTS jours_deduction_specifique DOUBLE;

ALTER TABLE conges
    ADD COLUMN IF NOT EXISTS jours_deduction_cp DOUBLE;
