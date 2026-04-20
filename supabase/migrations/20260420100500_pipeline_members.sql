-- Pipeline sharing: 2-5 user team. Members can read/write leads of shared pipelines.

CREATE TABLE IF NOT EXISTS pipeline_members (
  pipeline_id TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (pipeline_id, user_id)
);

CREATE INDEX IF NOT EXISTS pipeline_members_user_idx ON pipeline_members (user_id);

-- Helper: check if current user can access a pipeline (owner or member)
CREATE OR REPLACE FUNCTION public.can_access_pipeline(p_pipeline_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM pipelines WHERE id = p_pipeline_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM pipeline_members WHERE pipeline_id = p_pipeline_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user can WRITE to a pipeline (owner, admin, member - not viewer)
CREATE OR REPLACE FUNCTION public.can_write_pipeline(p_pipeline_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM pipelines WHERE id = p_pipeline_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM pipeline_members
    WHERE pipeline_id = p_pipeline_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'member')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
