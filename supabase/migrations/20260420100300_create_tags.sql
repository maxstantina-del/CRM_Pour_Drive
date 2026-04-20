-- Tags + lead_tags join table.

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, name)
);

CREATE TABLE IF NOT EXISTS lead_tags (
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, tag_id)
);

CREATE INDEX IF NOT EXISTS lead_tags_tag_idx ON lead_tags (tag_id);
