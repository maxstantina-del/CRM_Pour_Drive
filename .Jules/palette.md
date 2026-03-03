## 2026-01-31 - Optimistic UI Loading States
**Learning:** Even with optimistic UI updates (where data appears instantly), async background operations (like Supabase sync) require explicit loading states on forms to prevent double-submissions and indicate activity.
**Action:** When integrating with `usePipelines` or similar hooks, always wrap the async call in a local `isSubmitting` state, even if the hook doesn't expose one.
