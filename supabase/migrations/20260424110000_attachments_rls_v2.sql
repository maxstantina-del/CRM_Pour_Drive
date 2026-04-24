-- Fix v2 : les policies RLS sur attachments + storage.objects utilisaient
-- `leads.owner_id = auth.uid() OR can_write_pipeline(leads.pipeline_id)`.
-- Si le lead a été importé sans owner_id, OU si la pipeline n'a pas
-- owner_id, les deux checks échouent et on bloque l'upload même quand
-- l'utilisateur voit bien le lead dans l'app.
--
-- Nouvelle logique : l'utilisateur peut uploader si:
--   1) Storage : le fichier est dans le bucket lead-attachments ET
--      le lead_id extrait du path existe dans leads (RLS SELECT sur
--      leads filtre déjà ce que l'user voit).
--   2) Attachments table : owner_id = auth.uid() ET le lead_id existe
--      dans leads (même filtre RLS).
--
-- Simple, robuste, aligné sur le fait que « voir un lead = pouvoir y
-- ajouter une pièce jointe ».

-- ATTACHMENTS TABLE
DROP POLICY IF EXISTS attachments_insert ON attachments;
CREATE POLICY attachments_insert ON attachments FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (SELECT 1 FROM leads WHERE leads.id = attachments.lead_id)
  );

-- Même simplification sur SELECT pour éviter double-check redondant.
DROP POLICY IF EXISTS attachments_select ON attachments;
CREATE POLICY attachments_select ON attachments FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM leads WHERE leads.id = attachments.lead_id)
  );

-- DELETE reste réservé à l'uploadeur
DROP POLICY IF EXISTS attachments_delete ON attachments;
CREATE POLICY attachments_delete ON attachments FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- STORAGE OBJECTS (bucket lead-attachments)
DROP POLICY IF EXISTS lead_attachments_select ON storage.objects;
CREATE POLICY lead_attachments_select ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND EXISTS (SELECT 1 FROM leads WHERE leads.id = split_part(name, '/', 1))
  );

DROP POLICY IF EXISTS lead_attachments_insert ON storage.objects;
CREATE POLICY lead_attachments_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lead-attachments'
    AND EXISTS (SELECT 1 FROM leads WHERE leads.id = split_part(name, '/', 1))
  );

DROP POLICY IF EXISTS lead_attachments_delete ON storage.objects;
CREATE POLICY lead_attachments_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND EXISTS (SELECT 1 FROM leads WHERE leads.id = split_part(name, '/', 1))
  );

-- Update policy sur storage pour permettre le chunked upload (Supabase fait
-- des UPDATE pendant les gros uploads).
DROP POLICY IF EXISTS lead_attachments_update ON storage.objects;
CREATE POLICY lead_attachments_update ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND EXISTS (SELECT 1 FROM leads WHERE leads.id = split_part(name, '/', 1))
  )
  WITH CHECK (
    bucket_id = 'lead-attachments'
    AND EXISTS (SELECT 1 FROM leads WHERE leads.id = split_part(name, '/', 1))
  );
