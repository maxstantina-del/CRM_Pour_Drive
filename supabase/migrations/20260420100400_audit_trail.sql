-- Audit trail columns + auto-fill trigger.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.set_audit_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid());
    NEW.updated_by = COALESCE(NEW.updated_by, auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
    NEW.created_by = OLD.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS leads_set_audit ON leads;
CREATE TRIGGER leads_set_audit
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_columns();

DROP TRIGGER IF EXISTS pipelines_set_audit ON pipelines;
CREATE TRIGGER pipelines_set_audit
  BEFORE INSERT OR UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_columns();
