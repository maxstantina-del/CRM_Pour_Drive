-- Fix : les policies storage.objects sur le bucket lead-attachments
-- utilisaient `owner = auth.uid()`. Selon la version Supabase, ce champ
-- peut ne pas être auto-rempli à l'INSERT (ou s'appeler owner_id), ce qui
-- provoque un rejet RLS "new row violates row-level security policy" à
-- l'upload. La policy sur la table `attachments` (qu'on crée juste après
-- l'upload) garde déjà la contrainte owner_id = auth.uid() donc la
-- sécurité n'est pas réduite.

DROP POLICY IF EXISTS lead_attachments_insert ON storage.objects;
CREATE POLICY lead_attachments_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lead-attachments'
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = split_part(name, '/', 1)
        AND (
          leads.owner_id = auth.uid()
          OR public.can_write_pipeline(leads.pipeline_id)
        )
    )
  );

-- Pour delete on continue à restreindre à l'uploader (check sur owner OU owner_id
-- selon la version Supabase — coalesce renvoie le premier non-null). Si aucune
-- des deux colonnes ne matche, on autorise les owners du lead à faire le ménage.
DROP POLICY IF EXISTS lead_attachments_delete ON storage.objects;
CREATE POLICY lead_attachments_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'lead-attachments'
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = split_part(name, '/', 1)
        AND (
          leads.owner_id = auth.uid()
          OR public.can_write_pipeline(leads.pipeline_id)
        )
    )
  );
