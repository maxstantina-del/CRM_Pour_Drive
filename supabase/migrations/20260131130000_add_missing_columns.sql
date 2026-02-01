-- Ajouter les colonnes manquantes à la table leads

-- Colonnes d'adresse
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS country TEXT;

-- Autres colonnes potentiellement manquantes
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS siret TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS closed_date TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_actions JSONB DEFAULT '[]'::jsonb;