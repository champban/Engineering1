begin;

create table if not exists public.app_health (
  id boolean primary key default true check (id = true),
  status text not null default 'operational' check (status in ('operational', 'degraded', 'unavailable', 'unknown')),
  server_time timestamptz not null default now(),
  migration_marker text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_health (id, status, server_time, migration_marker, updated_at)
values (true, 'operational', now(), '0001_app_health', now())
on conflict (id) do update
set
  status = excluded.status,
  server_time = excluded.server_time,
  migration_marker = excluded.migration_marker,
  updated_at = excluded.updated_at;

alter table public.app_health enable row level security;

revoke insert, update, delete, truncate, references, trigger
on table public.app_health
from anon, authenticated;

grant select on table public.app_health to anon, authenticated;

drop policy if exists "app_health_select" on public.app_health;
create policy "app_health_select"
on public.app_health
for select
to anon, authenticated
using (true);

commit;
