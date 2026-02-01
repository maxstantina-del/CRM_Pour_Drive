-- Créer ou réparer la table pipelines avec toutes les colonnes nécessaires

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS pipelines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes si la table existe déjà mais qu'il manque des colonnes
ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Pipeline';
ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Désactiver RLS sur pipelines
ALTER TABLE pipelines DISABLE ROW LEVEL SECURITY;