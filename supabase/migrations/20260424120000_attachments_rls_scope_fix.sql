-- Bug : dans les policies storage.objects, la clause
--   EXISTS (SELECT 1 FROM leads WHERE leads.id = split_part(name, '/', 1))
-- résolvait `name` vers `leads.name` (shadowing SQL) au lieu de
-- `storage.objects.name`. Résultat : `split_part(leads.name, '/', 1)` qui
-- tourne sur une colonne jamais au format `lead_id/filename` → aucun match
-- → INSERT rejeté avec « new row violates RLS ».
--
-- Correction : reformuler avec `IN (SELECT id FROM leads)` qui ne risque
-- pas de shadowing car la seule colonne référencée côté subquery est
-- `leads.id`, et le `name` côté extérieur résout sans ambiguïté vers
-- storage.objects.name.

DROP POLICY IF EXISTS lead_attachments_select ON storage.objects;
CREATE POLICY lead_attachments_select ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND split_part(name, '/', 1) IN (SELECT id FROM leads)
  );

DROP POLICY IF EXISTS lead_attachments_insert ON storage.objects;
CREATE POLICY lead_attachments_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lead-attachments'
    AND split_part(name, '/', 1) IN (SELECT id FROM leads)
  );

DROP POLICY IF EXISTS lead_attachments_update ON storage.objects;
CREATE POLICY lead_attachments_update ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND split_part(name, '/', 1) IN (SELECT id FROM leads)
  )
  WITH CHECK (
    bucket_id = 'lead-attachments'
    AND split_part(name, '/', 1) IN (SELECT id FROM leads)
  );

DROP POLICY IF EXISTS lead_attachments_delete ON storage.objects;
CREATE POLICY lead_attachments_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND split_part(name, '/', 1) IN (SELECT id FROM leads)
  );
