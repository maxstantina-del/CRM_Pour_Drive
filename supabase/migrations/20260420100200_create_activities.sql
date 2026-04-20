-- Activities timeline per lead (calls, emails, meetings, notes).

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'stage_change', 'task')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activities_lead_idx ON activities (lead_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS activities_owner_idx ON activities (owner_id);
