-- RPC to resolve an email to a user_id.
-- Security: only callable by users who own at least one pipeline, to prevent
-- random authenticated users from enumerating the email->id table.

CREATE OR REPLACE FUNCTION public.resolve_user_by_email(p_email TEXT)
RETURNS UUID AS $$
  SELECT id FROM auth.users
  WHERE lower(email) = lower(p_email)
    AND EXISTS (SELECT 1 FROM pipelines WHERE owner_id = auth.uid())
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.resolve_user_by_email(TEXT) TO authenticated;

-- Batch reverse lookup: user_ids → emails. Restricted to ids already visible
-- via pipeline_members where caller owns the pipeline (so no global enumeration).
CREATE OR REPLACE FUNCTION public.resolve_user_emails(p_user_ids UUID[])
RETURNS TABLE(id UUID, email TEXT) AS $$
  SELECT u.id, u.email::TEXT
  FROM auth.users u
  WHERE u.id = ANY(p_user_ids)
    AND (
      u.id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM pipeline_members m
        JOIN pipelines p ON p.id = m.pipeline_id
        WHERE m.user_id = u.id AND p.owner_id = auth.uid()
      )
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.resolve_user_emails(UUID[]) TO authenticated;
