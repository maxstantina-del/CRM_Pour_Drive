-- Notes libres par lead (résumé d'appel, commentaire de suivi, etc.) —
-- indépendantes des `next_actions` qui sont des tâches datées. Stockées en
-- JSONB sur la table leads pour rester aligné avec le pattern existant
-- (nextActions) et éviter une nouvelle table + RLS dédiée.
--
-- Format d'un élément :
--   { id: uuid-string, text: string, createdAt: ISO, updatedAt: ISO }

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS comment_notes JSONB NOT NULL DEFAULT '[]'::jsonb;
