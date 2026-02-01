-- Changer le type de la colonne id de UUID à TEXT pour les pipelines

-- D'abord, supprimer la contrainte de clé primaire
ALTER TABLE pipelines DROP CONSTRAINT IF EXISTS pipelines_pkey;

-- Changer le type de la colonne id de UUID à TEXT
ALTER TABLE pipelines ALTER COLUMN id TYPE TEXT;

-- Recréer la contrainte de clé primaire
ALTER TABLE pipelines ADD PRIMARY KEY (id);

-- Faire la même chose pour la colonne pipeline_id dans leads si elle est en UUID
ALTER TABLE leads ALTER COLUMN pipeline_id TYPE TEXT;