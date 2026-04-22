-- Fiches Autoglass: prospect information forms attached to a lead.
-- Multi-vehicle per company: several fiches can exist for the same lead.

CREATE TABLE IF NOT EXISTS fiches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contact (peut différer du contact principal du lead si la personne à
  -- l'adresse d'intervention est différente du décideur)
  contact_name TEXT,
  contact_role TEXT,
  contact_phone TEXT,
  contact_email TEXT,

  -- Véhicule
  vehicle_type TEXT CHECK (vehicle_type IN ('VL', 'utilitaire', 'poids_lourd')),
  vehicle_brand_model TEXT,
  vehicle_plate TEXT,

  -- Sinistre
  damage_type TEXT CHECK (damage_type IN ('impact', 'fissure', 'bris_complet')),
  damage_location TEXT CHECK (damage_location IN ('pare_brise', 'laterale', 'lunette')),

  -- Urgence
  immobilized BOOLEAN,

  -- Intervention
  intervention_address TEXT,
  intervention_place TEXT CHECK (intervention_place IN ('sur_site', 'en_centre')),
  availability TEXT,

  -- Assurance
  insurance_name TEXT,
  insurance_glass_covered TEXT CHECK (insurance_glass_covered IN ('oui', 'non', 'inconnu')),
  insurance_contract TEXT,

  comment TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fiches_lead_idx ON fiches (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS fiches_owner_idx ON fiches (owner_id);

-- Keep updated_at fresh on UPDATE
CREATE OR REPLACE FUNCTION public.fiches_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fiches_set_updated_at_trg ON fiches;
CREATE TRIGGER fiches_set_updated_at_trg
  BEFORE UPDATE ON fiches
  FOR EACH ROW
  EXECUTE FUNCTION public.fiches_set_updated_at();

-- RLS: same model as activities (inherits access from parent lead's pipeline)
ALTER TABLE fiches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fiches_select ON fiches;
CREATE POLICY fiches_select ON fiches FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = fiches.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_access_pipeline(leads.pipeline_id))
    )
  );

DROP POLICY IF EXISTS fiches_insert ON fiches;
CREATE POLICY fiches_insert ON fiches FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = fiches.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_write_pipeline(leads.pipeline_id))
    )
  );

DROP POLICY IF EXISTS fiches_update ON fiches;
CREATE POLICY fiches_update ON fiches FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS fiches_delete ON fiches;
CREATE POLICY fiches_delete ON fiches FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Realtime so new fiches pop up for pipeline guests immediately
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.fiches;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;
