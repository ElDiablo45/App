-- 0002_create_users.sql — users + comunidad (roles por ID de Discord, no por nombre)
--
-- La ID de Discord manda: si renombras un rol en Discord no se rompe nada.
-- STAFF_ROLE_ID    = 1352786195482017873
-- STREAMER_ROLE_ID = 1352786191593767022

-- 1) users queda como estaba (sin tocar)
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

-- 2) Catálogo de roles: la ID de Discord manda, el nombre es solo etiqueta
create table if not exists public.community_roles (
  role_id text primary key,
  key text not null unique,
  name text not null
);
insert into public.community_roles (role_id, key, name) values
  ('1352786195482017873', 'staff', 'Staff'),
  ('1352786191593767022', 'streamer', 'Streamer')
on conflict (role_id) do update set key = excluded.key, name = excluded.name;

-- 3) Cache visible de miembros (lo que lee el home, 0 llamadas a Discord)
create table if not exists public.community_members (
  discord_id text primary key,
  display_name text,
  avatar_url text,
  nick text,
  joined_at timestamptz,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Quién tiene qué rol (solo IDs a ambos lados)
create table if not exists public.community_member_roles (
  discord_id text not null references public.community_members (discord_id) on delete cascade,
  role_id text not null references public.community_roles (role_id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (discord_id, role_id)
);
create index if not exists cmr_role_idx on public.community_member_roles (role_id);

alter table public.community_roles enable row level security;
alter table public.community_members enable row level security;
alter table public.community_member_roles enable row level security;
-- Sin políticas de lectura pública: solo service_role (mismo patrón que users).
