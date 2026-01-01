-- Add unique constraint on solde_conges to prevent duplicates
ALTER TABLE solde_conges 
ADD CONSTRAINT uk_solde_conges_user_type_year 
UNIQUE (utilisateur_id, type_conge_id, annee);
