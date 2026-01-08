-- Ajout des champs de durée partielle et horaire pour les congés
ALTER TABLE conges
    ADD COLUMN IF NOT EXISTS duree_type VARCHAR(50) DEFAULT 'JOURNEE_ENTIERE' NOT NULL,
    ADD COLUMN IF NOT EXISTS heure_debut TIME,
    ADD COLUMN IF NOT EXISTS heure_fin TIME;
