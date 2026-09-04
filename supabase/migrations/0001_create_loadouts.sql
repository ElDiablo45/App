create extension if not exists "pgcrypto";
create table if not exists public.loadouts (
  id uuid primary key default gen_random_uuid(),
  owner_discord_id text not null,
  owner_name text not null,
  owner_avatar_url text,
  title text not null,
  description text not null,
  topics text[] not null default '{}',
  cover_url text,
  body jsonb not null default '{}',
  rating_avg numeric not null default 0,
  rating_count int not null default 0,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists loadouts_created_idx on public.loadouts (created_at desc);
create index if not exists loadouts_rating_idx on public.loadouts (rating_avg desc);

alter table public.loadouts enable row level security;

drop policy if exists "deny anon" on public.loadouts;
create policy "deny anon" on public.loadouts for all to anon using (false) with check (false);
drop policy if exists "deny authenticated" on public.loadouts;
create policy "deny authenticated" on public.loadouts for all to authenticated using (false) with check (false);

insert into public.loadouts
  (owner_discord_id, owner_name, title, description, topics, rating_avg, rating_count, views, created_at)
values
  ('seed-1', 'drpenguin', 'FARMEO XP EARLY GAME - 0 RIESGO',
   'Ruta segura para subir de nivel tus personajes sin exponerte: qué llevar, por dónde entrar y cuándo extraer.',
   array['principiante','solo','eficiencia'], 4.6, 128, 19600, now() - interval '10 months'),
  ('seed-2', 'bazeso', 'CHULETA DE ITEMS',
   'Todos los materiales, dónde salen y qué merece la pena guardar en el alijo.',
   array['consejos','completo','gestion'], 4.6, 94, 19800, now() - interval '10 months'),
  ('seed-3', 'bazeso', 'CÁLCULO DE DAÑO DE ESCUDOS',
   'Cuánto aguanta cada escudo por tier y qué munición llevar contra cada uno.',
   array['pvp','defensivo','combate'], 4.9, 211, 24300, now() - interval '9 months'),
  ('seed-4', 'Villegas', 'PATRULLA NOCTURNA EN PAREJA',
   'Roles, comunicaciones y equipo mínimo para patrullar el condado de noche.',
   array['equipo','tacticas','nocturno'], 4.2, 37, 5200, now() - interval '2 days');
