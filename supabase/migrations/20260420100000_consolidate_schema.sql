-- Consolidate base schema: ensure tables, types, constraints, indexes are correct.
-- Idempotent: safe to re-run.

-- pipelines
CREATE TABLE IF NOT EXISTS pipelines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- leads
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  contact_name TEXT,
  siret TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  country TEXT,
  stage TEXT NOT NULL DEFAULT 'new',
  value NUMERIC,
  probability INTEGER,
  closed_date TIMESTAMPTZ,
  notes TEXT,
  next_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraints (drop+recreate to be idempotent across re-runs)
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_probability_range;
ALTER TABLE leads ADD CONSTRAINT leads_probability_range
  CHECK (probability IS NULL OR (probability >= 0 AND probability <= 100));

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_value_nonneg;
ALTER TABLE leads ADD CONSTRAINT leads_value_nonneg
  CHECK (value IS NULL OR value >= 0);

-- Indexes for query patterns
CREATE INDEX IF NOT EXISTS leads_pipeline_stage_idx ON leads (pipeline_id, stage);
CREATE INDEX IF NOT EXISTS leads_updated_at_idx ON leads (updated_at DESC);
CREATE INDEX IF NOT EXISTS leads_company_idx ON leads (company);
CREATE INDEX IF NOT EXISTS leads_city_idx ON leads (city);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_set_updated_at ON leads;
CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS pipelines_set_updated_at ON pipelines;
CREATE TRIGGER pipelines_set_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
