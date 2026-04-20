-- Add owner_id (auth.users) to leads and pipelines.
-- Nullable for now; backfill expected via Supabase Studio or app, then enforce NOT NULL.

ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE leads     ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS pipelines_owner_idx ON pipelines (owner_id);
CREATE INDEX IF NOT EXISTS leads_owner_idx     ON leads (owner_id);
