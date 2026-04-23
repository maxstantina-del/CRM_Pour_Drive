-- Cas fréquent sur le terrain : le prospect dit « pas d'assurance » et il
-- devient inutile de pouvoir saisir nom / bris de glace / contrat. Un flag
-- boolean gère ce cas sans polluer les champs structurés.

ALTER TABLE fiches
  ADD COLUMN IF NOT EXISTS no_insurance BOOLEAN NOT NULL DEFAULT FALSE;
