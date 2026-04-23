-- Attachments : fichiers (devis PDF, images, docs) joints à un lead.
-- Stockés dans le bucket Storage « lead-attachments ». Cette table garde les
-- métadonnées + RLS équivalente à activities (propriétaire + membres du
-- pipeline peuvent lire ; uploadeur peut supprimer).

CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS attachments_lead_idx ON attachments (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS attachments_owner_idx ON attachments (owner_id);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS attachments_select ON attachments;
CREATE POLICY attachments_select ON attachments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_access_pipeline(leads.pipeline_id))
    )
  );

DROP POLICY IF EXISTS attachments_insert ON attachments;
CREATE POLICY attachments_insert ON attachments FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_write_pipeline(leads.pipeline_id))
    )
  );

DROP POLICY IF EXISTS attachments_delete ON attachments;
CREATE POLICY attachments_delete ON attachments FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Realtime so a devis uploaded by the pipeline member pops up for the owner
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.attachments;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Storage bucket creation. Idempotent — safe to re-run.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lead-attachments',
  'lead-attachments',
  FALSE,
  10485760, -- 10 MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS : même logique que la table attachments. Le chemin d'un fichier
-- est `<lead_id>/<uuid>-<filename>` → on extrait le lead_id du premier segment
-- pour vérifier l'accès via can_access_pipeline.
DROP POLICY IF EXISTS lead_attachments_select ON storage.objects;
CREATE POLICY lead_attachments_select ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = split_part(name, '/', 1)
        AND (leads.owner_id = auth.uid() OR public.can_access_pipeline(leads.pipeline_id))
    )
  );

DROP POLICY IF EXISTS lead_attachments_insert ON storage.objects;
CREATE POLICY lead_attachments_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lead-attachments'
    AND owner = auth.uid()
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = split_part(name, '/', 1)
        AND (leads.owner_id = auth.uid() OR public.can_write_pipeline(leads.pipeline_id))
    )
  );

DROP POLICY IF EXISTS lead_attachments_delete ON storage.objects;
CREATE POLICY lead_attachments_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND owner = auth.uid()
  );
