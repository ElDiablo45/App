-- 0003_arsenal_likes.sql — Arsenal: likes (1 por usuario) + filtro por armas
--
-- Estrategia:
-- - Se reutiliza public.loadouts para lo publicado (sin tabla nueva de dotaciones).
-- - like_count desnormalizado: evita COUNT() por card en el grid.
-- - armas_slugs desnormalizado + índice GIN: filtra "contiene arma X" sin
--   escanear el jsonb de body en cada consulta.
-- - public.loadout_likes con PK compuesta (loadout_id, discord_id): garantiza
--   1 like por usuario a nivel de constraint, permite toggle (insert/delete).
-- - RLS: mismo patrón que 0001/0002 — deny anon/authenticated, solo
--   service_role vía Server Actions. Sin SECURITY DEFINER: el trigger corre
--   con los privilegios del llamante (service_role hace bypass de RLS).

-- 1) Columnas nuevas en loadouts
alter table public.loadouts
  add column if not exists like_count int not null default 0;
alter table public.loadouts
  add column if not exists armas_slugs text[] not null default '{}';

create index if not exists loadouts_like_idx
  on public.loadouts (like_count desc);
create index if not exists loadouts_armas_gin
  on public.loadouts using gin (armas_slugs);

-- 2) Tabla de likes: un voto por usuario y dotación
create table if not exists public.loadout_likes (
  loadout_id uuid not null references public.loadouts (id) on delete cascade,
  discord_id text not null,
  created_at timestamptz not null default now(),
  primary key (loadout_id, discord_id)
);

create index if not exists loadout_likes_discord_idx
  on public.loadout_likes (discord_id);

alter table public.loadout_likes enable row level security;

drop policy if exists "deny anon" on public.loadout_likes;
create policy "deny anon" on public.loadout_likes
  for all to anon using (false) with check (false);
drop policy if exists "deny authenticated" on public.loadout_likes;
create policy "deny authenticated" on public.loadout_likes
  for all to authenticated using (false) with check (false);

-- 3) Trigger: mantiene loadouts.like_count sincronizado
create or replace function public.sync_loadout_like_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.loadouts
      set like_count = like_count + 1, updated_at = now()
      where id = new.loadout_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.loadouts
      set like_count = greatest(like_count - 1, 0), updated_at = now()
      where id = old.loadout_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists loadout_likes_count_trigger on public.loadout_likes;
create trigger loadout_likes_count_trigger
  after insert or delete on public.loadout_likes
  for each row execute function public.sync_loadout_like_count();
