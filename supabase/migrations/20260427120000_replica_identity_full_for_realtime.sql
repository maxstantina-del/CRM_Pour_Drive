-- Realtime + RLS = les events UPDATE/DELETE doivent contenir TOUTES les
-- colonnes utilisées dans les policies SELECT pour que Postgres puisse
-- évaluer si chaque subscriber a le droit de voir l'event. Avec
-- REPLICA IDENTITY DEFAULT (= PK uniquement), les colonnes owner_id /
-- pipeline_id manquent dans le payload → la RLS realtime échoue
-- silencieusement → le client ne reçoit jamais l'event.
--
-- Solution officielle Supabase : ALTER TABLE … REPLICA IDENTITY FULL pour
-- que le row complet soit streamé. Légère augmentation du WAL, négligeable
-- à notre échelle.

ALTER TABLE leads             REPLICA IDENTITY FULL;
ALTER TABLE pipelines         REPLICA IDENTITY FULL;
ALTER TABLE tags              REPLICA IDENTITY FULL;
ALTER TABLE lead_tags         REPLICA IDENTITY FULL;
ALTER TABLE activities        REPLICA IDENTITY FULL;
ALTER TABLE pipeline_members  REPLICA IDENTITY FULL;
ALTER TABLE attachments       REPLICA IDENTITY FULL;
ALTER TABLE fiches            REPLICA IDENTITY FULL;
ALTER TABLE notifications     REPLICA IDENTITY FULL;
