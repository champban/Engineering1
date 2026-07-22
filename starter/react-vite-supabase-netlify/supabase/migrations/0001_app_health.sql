begin;

create table if not exists public.app_health (
  id boolean primary key default true check (id = true),
  status text not null default 'operational' check (status in ('operational', 'degraded', 'unavailable', 'unknown')),
  migration_marker text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_health (id, status, migration_marker, updated_at)
values (true, 'operational', '0001_app_health', now())
on conflict (id) do update
set
  status = excluded.status,
  migration_marker = excluded.migration_marker,
  updated_at = excluded.updated_at;

alter table public.app_health enable row level security;

revoke all on table public.app_health from anon, authenticated;
grant select on table public.app_health to anon, authenticated;

drop policy if exists "app_health_select" on public.app_health;
create policy "app_health_select"
on public.app_health
for select
to anon, authenticated
using (id = true);

drop function if exists public.get_app_health();
create function public.get_app_health()
returns table (
  status text,
  server_time timestamptz,
  migration_marker text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select h.status, now(), h.migration_marker
  from public.app_health h
  where h.id = true;
$$;

revoke execute on function public.get_app_health() from public;
revoke execute on function public.get_app_health() from anon, authenticated;
grant execute on function public.get_app_health() to anon, authenticated;

commit;
