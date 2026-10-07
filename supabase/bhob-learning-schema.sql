create table public.bhob_learning_records (
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('bookmark','completed','answer','note','setting')),
 item_id text not null check (length(item_id) between 1 and 200),
 value jsonb not null,
 deleted boolean not null default false,
 changed_at bigint not null check (changed_at > 0),
 primary key(user_id,kind,item_id)
);
alter table public.bhob_learning_records enable row level security;
revoke all on public.bhob_learning_records from anon;
grant select,insert,update on public.bhob_learning_records to authenticated;
create policy own_select on public.bhob_learning_records for select to authenticated using ((select auth.uid())=user_id);
create policy own_insert on public.bhob_learning_records for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_update on public.bhob_learning_records for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create function public.bhob_merge_learning(records jsonb) returns void
language plpgsql security invoker set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if jsonb_typeof(records) <> 'array' or jsonb_array_length(records)>5000 then raise exception 'Invalid records'; end if;
 insert into public.bhob_learning_records(user_id,kind,item_id,value,deleted,changed_at)
 select auth.uid(),r.kind,r.item_id,r.value,r.deleted,r.changed_at
 from jsonb_to_recordset(records) as r(kind text,item_id text,value jsonb,deleted boolean,changed_at bigint)
 on conflict(user_id,kind,item_id) do update set value=excluded.value,deleted=excluded.deleted,changed_at=excluded.changed_at
 where excluded.changed_at>bhob_learning_records.changed_at;
end $$;
revoke all on function public.bhob_merge_learning(jsonb) from public,anon;
grant execute on function public.bhob_merge_learning(jsonb) to authenticated;