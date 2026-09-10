create table if not exists public.users (
  discord_id text primary key,
  email text not null,
  birth_date date not null,
  nationality text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "deny anon" on public.users;
create policy "deny anon" on public.users for all to anon using (false) with check (false);
drop policy if exists "deny authenticated" on public.users;
create policy "deny authenticated" on public.users for all to authenticated using (false) with check (false);
