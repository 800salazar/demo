-- Un snapshot JSONB de la demostración por visitante.
-- Aún no se usa en tiempo de ejecución: hoy la demo persiste en el navegador (localStorage).
-- Queda lista para un adaptador de persistencia con Supabase usando inicios de sesión anónimos.

create table public.demo_sessions (
  owner_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  schema_version integer not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint demo_sessions_data_size check (pg_column_size(data) <= 524288)
);

comment on table public.demo_sessions is
  'Snapshot de la demostración por visitante (auth anónima). Preparada para un futuro adaptador de persistencia.';

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger demo_sessions_set_updated_at
  before update on public.demo_sessions
  for each row execute function public.set_updated_at();

alter table public.demo_sessions enable row level security;

-- Solo usuarios autenticados (incluidos los anónimos); nunca el rol anon.
revoke all on public.demo_sessions from anon;
grant select, insert, update, delete on public.demo_sessions to authenticated;

create policy "Visitors can read their own demo"
  on public.demo_sessions for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Visitors can create their own demo"
  on public.demo_sessions for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Visitors can update their own demo"
  on public.demo_sessions for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Visitors can delete their own demo"
  on public.demo_sessions for delete to authenticated
  using (owner_id = (select auth.uid()));
