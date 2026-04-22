-- Notifications table for in-app alerts shared with pipeline members.
-- Triggered automatically when a lead is moved to a won stage.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_unread_idx
  on public.notifications (user_id)
  where read_at is null;

-- RLS: a user sees only their own notifications
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete using (auth.uid() = user_id);

-- No INSERT policy: rows are inserted only by the trigger below, running as
-- SECURITY DEFINER. Clients cannot insert arbitrary notifications.

-- Trigger: notify pipeline guests (role 'member' or 'viewer') when a lead
-- transitions into a won stage. Exclude the actor (updater).
create or replace function public.notify_lead_won()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pipeline_name text;
  payload_json jsonb;
  actor_id uuid;
begin
  if new.stage is distinct from old.stage
    and new.stage in ('won', 'closed_won')
    and coalesce(old.stage, '') not in ('won', 'closed_won')
  then
    actor_id := auth.uid();

    select p.name into pipeline_name
    from public.pipelines p
    where p.id = new.pipeline_id;

    payload_json := jsonb_build_object(
      'leadId', new.id,
      'leadName', new.name,
      'pipelineId', new.pipeline_id,
      'pipelineName', pipeline_name,
      'wonBy', actor_id,
      'wonAt', now()
    );

    insert into public.notifications (user_id, kind, payload)
    select pm.user_id, 'lead_won', payload_json
    from public.pipeline_members pm
    where pm.pipeline_id = new.pipeline_id
      and pm.role in ('member', 'viewer')
      and pm.user_id is distinct from actor_id;
  end if;

  return new;
end;
$$;

drop trigger if exists notify_lead_won_trg on public.leads;
create trigger notify_lead_won_trg
  after update of stage on public.leads
  for each row
  execute function public.notify_lead_won();

-- Enable realtime publication for the notifications table so the UI bell can
-- subscribe to INSERTs filtered by user_id.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.notifications;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;
