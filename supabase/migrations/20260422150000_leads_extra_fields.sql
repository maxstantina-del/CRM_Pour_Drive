-- Extra lead fields: department/region as queryable text + metadata JSONB catch-all.
-- Purpose: let the import wizard retain every Excel column, not just the 14 mapped ones.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS leads_department_idx ON leads(department);
CREATE INDEX IF NOT EXISTS leads_region_idx ON leads(region);
