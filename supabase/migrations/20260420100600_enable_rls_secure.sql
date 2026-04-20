-- Re-enable RLS with strict policies. Reverses 20260131120506_disable_rls.sql.
-- Access model: owner has full access; pipeline_members get scoped access via helpers.

-- Wipe any prior open policies left over from manual fixes
DROP POLICY IF EXISTS "Allow all access to leads" ON leads;
DROP POLICY IF EXISTS "Allow all access to pipelines" ON pipelines;
DROP POLICY IF EXISTS "Allow all access to activities" ON activities;
DROP POLICY IF EXISTS "Allow all access to tags" ON tags;
DROP POLICY IF EXISTS "Allow all access to lead_tags" ON lead_tags;
DROP POLICY IF EXISTS "Allow all access to pipeline_members" ON pipeline_members;

-- ENABLE RLS
ALTER TABLE pipelines        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- pipelines
-- ============================================
CREATE POLICY pipelines_select ON pipelines FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.can_access_pipeline(id));

CREATE POLICY pipelines_insert ON pipelines FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY pipelines_update ON pipelines FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY pipelines_delete ON pipelines FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ============================================
-- leads
-- ============================================
CREATE POLICY leads_select ON leads FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.can_access_pipeline(pipeline_id));

CREATE POLICY leads_insert ON leads FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (pipeline_id IS NULL OR public.can_write_pipeline(pipeline_id))
  );

CREATE POLICY leads_update ON leads FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.can_write_pipeline(pipeline_id))
  WITH CHECK (owner_id = auth.uid() OR public.can_write_pipeline(pipeline_id));

CREATE POLICY leads_delete ON leads FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.can_write_pipeline(pipeline_id));

-- ============================================
-- activities (inherits lead access)
-- ============================================
CREATE POLICY activities_select ON activities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = activities.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_access_pipeline(leads.pipeline_id))
    )
  );

CREATE POLICY activities_insert ON activities FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = activities.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_write_pipeline(leads.pipeline_id))
    )
  );

CREATE POLICY activities_update ON activities FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY activities_delete ON activities FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ============================================
-- tags (per-owner)
-- ============================================
CREATE POLICY tags_select ON tags FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY tags_insert ON tags FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY tags_update ON tags FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY tags_delete ON tags FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================
-- lead_tags (inherits lead access)
-- ============================================
CREATE POLICY lead_tags_select ON lead_tags FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_tags.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_access_pipeline(leads.pipeline_id))
    )
  );

CREATE POLICY lead_tags_write ON lead_tags FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_tags.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_write_pipeline(leads.pipeline_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_tags.lead_id
        AND (leads.owner_id = auth.uid() OR public.can_write_pipeline(leads.pipeline_id))
    )
  );

-- ============================================
-- pipeline_members
-- ============================================
CREATE POLICY pipeline_members_select ON pipeline_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM pipelines WHERE id = pipeline_members.pipeline_id AND owner_id = auth.uid())
  );

CREATE POLICY pipeline_members_write ON pipeline_members FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM pipelines WHERE id = pipeline_members.pipeline_id AND owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM pipelines WHERE id = pipeline_members.pipeline_id AND owner_id = auth.uid())
  );
