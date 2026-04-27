-- Realtime sync entre les utilisateurs membres d'un même pipeline.
--
-- Bug constaté : un client connecté ne voit pas les changements faits par
-- l'autre utilisateur tant qu'il ne rafraîchit pas la page. Cause : les
-- tables critiques ne font pas partie de la publication `supabase_realtime`,
-- donc Postgres n'émet pas les events INSERT/UPDATE/DELETE et aucun client
-- ne peut s'abonner même si le code JS ouvre un channel.
--
-- Tables déjà activées avant ce fix : attachments, fiches, notifications,
-- user_preferences.
-- On ajoute ici les tables qui changent en permanence quand on travaille
-- sur le pipeline.
--
-- Idempotent : on protège chaque ALTER pour ne pas planter si la table est
-- déjà publiée (cas où certains environnements seraient déjà à jour).

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['leads', 'pipelines', 'tags', 'lead_tags', 'activities', 'pipeline_members'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    END IF;
  END LOOP;
END $$;
