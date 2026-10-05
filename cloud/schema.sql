-- Run once in the chosen Supabase project. No personal data or keys in this file.
begin;
create table public.learning_events (
  seq bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null,
  kind text not null check (kind in ('completed','bookmarks','notes','answers')),
  item text not null check (length(item) between 1 and 200),
  value jsonb not null,
  received_at timestamptz not null default now(),
  unique(user_id,event_id)
);
create index learning_events_owner_seq on public.learning_events(user_id,seq);
alter table public.learning_events enable row level security;
revoke all on public.learning_events from public, anon, authenticated;
grant select on public.learning_events to authenticated;
create policy learning_events_read_own on public.learning_events for select to authenticated
  using ((select auth.uid()) = user_id);
-- Immutable operations prevent whole-document overwrites and preserve all note versions.
create function public.append_learning_events(operations jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); op jsonb;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if jsonb_typeof(operations) <> 'array' or jsonb_array_length(operations) > 100 then
    raise exception 'invalid batch';
  end if;
  -- Serialize writes per user so polling cursors cannot skip a late-committing operation.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,0));
  for op in select * from jsonb_array_elements(operations) loop
    if op->>'kind' not in ('completed','bookmarks','notes','answers')
       or coalesce(length(op->>'item'),0) not between 1 and 200
       or op->'value' is null then raise exception 'invalid operation'; end if;
    if op->>'kind' in ('completed','bookmarks') and jsonb_typeof(op->'value') <> 'boolean' then
      raise exception 'invalid boolean';
    elsif op->>'kind' = 'notes' and (jsonb_typeof(op->'value') <> 'string' or length(op->>'value') > 20000) then
      raise exception 'invalid note';
    elsif op->>'kind' = 'answers' and (jsonb_typeof(op->'value') <> 'object'
      or coalesce(op->'value'->>'answer','') not in ('0','1','2')
      or coalesce(length(op->'value'->>'at'),0) not between 1 and 100
      or octet_length((op->'value')::text) > 1000) then raise exception 'invalid answer'; end if;
    insert into public.learning_events(user_id,event_id,kind,item,value)
    values(uid,(op->>'event_id')::uuid,op->>'kind',op->>'item',op->'value')
    on conflict(user_id,event_id) do nothing;
  end loop;
end $$;
revoke all on function public.append_learning_events(jsonb) from public,anon;
grant execute on function public.append_learning_events(jsonb) to authenticated;
commit;
