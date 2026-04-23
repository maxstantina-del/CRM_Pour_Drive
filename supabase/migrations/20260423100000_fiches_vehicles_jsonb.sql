-- Multi-vehicle support on fiches Autoglass.
-- Une fiche = un client / un sinistre, mais peut concerner plusieurs véhicules
-- à la fois (flotte). On stocke la liste dans une colonne JSONB. Les 3 colonnes
-- scalaires vehicle_type/_brand_model/_plate sont conservées (synchronisées sur
-- le 1er véhicule) pour ne pas casser les emails Resend et les triggers
-- notifications existants le temps que tout le code lise `vehicles`.

ALTER TABLE fiches
  ADD COLUMN IF NOT EXISTS vehicles JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill : pour les fiches déjà créées avec les colonnes scalaires, recopier
-- dans un tableau à 1 élément. Exécution idempotente (ne touche pas les fiches
-- qui ont déjà `vehicles` non vide).
UPDATE fiches
SET vehicles = jsonb_build_array(
  jsonb_strip_nulls(
    jsonb_build_object(
      'type', vehicle_type,
      'brandModel', vehicle_brand_model,
      'plate', vehicle_plate
    )
  )
)
WHERE vehicles = '[]'::jsonb
  AND (vehicle_type IS NOT NULL OR vehicle_brand_model IS NOT NULL OR vehicle_plate IS NOT NULL);
