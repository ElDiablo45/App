# Equipo / Loadouts (fase visual + fundación Supabase) — Design Specification

## Purpose

Add a new **Equipo** section to Hunt Hispano, visually modeled on the provided
Arc Raiders GUIDES reference, where logged-in users can browse community
loadouts. This phase ships the complete visual system plus the Supabase
foundation (project wiring, server-only client, `loadouts` table, seed rows)
with a real server read path and mock fallback. Creation, detail view,
voting, real view counts, comments, and the internal loadout content model
are explicitly fase 2.

Auth strategy (decided): keep NextAuth Discord untouched; Supabase is used
only as a database, accessed from the server with `service_role`. No
`profiles` table: Discord remains the source of truth for name, email and
avatar (read from the session at login), and the registro cookie keeps
gating creation eligibility.

## User experience

New `/equipo` route inside the existing `DashboardShell` (sidebar item
`Equipo` stops being a dead `#` link; shell `active` gains `"equipo"`).
Same gating as Home: no session redirects to `/`, session without completed
registro redirects to `/registro`. Viewing requires login; creating is fase 2.

Layout mapping from the reference screenshot, using the audited Eleven
tokens (`oklch` backgrounds, white 8% borders, `.75rem` radius, Inter):

- Header: uppercase title in Inter 800 with tight letter-spacing (no new
  font) + short description + create button in
  Eleven blue (`--eleven-primary`) + side character art.
- Left `TOPICS` sidebar: tag cloud acting as single-select filter.
- Search box filtering title, topics and author; sort tabs Popular
  (`rating_avg` desc), Top Rated (same signal, kept as separate tab per
  reference), Más vistos (`views` desc), Recientes (`created_at` desc).
  Search, topic and sort are client-side state over the loaded rows.
- Cards: author avatar + name, uppercase title in Inter 800 with tight
  letter-spacing (no new font), topic pills,
  cover image right, big rating + stars, footer with rating, views,
  comment count (static `0` in this phase) and relative date in Spanish.
- Create button: rendered but disabled with the hint "Próximamente:
  requiere completar el registro" when registro is incomplete; otherwise it
  points to `#` (fase 2 wires the form). No dead-end confusion: the hint is
  always visible on the disabled state.

## Architecture and data flow

New `src/features/equipo/` module: `types.ts` (UI `Loadout` type),
`data.ts` (`TOPICS`, `MOCK_LOADOUTS`), `equipo-*.tsx` components
(header, topics sidebar, toolbar with search + sort, card, page
composition), `loadouts.ts` server fetch (`getLoadouts()`).

`getLoadouts()` reads Supabase with the server-only client and returns rows
mapped to the UI type; on any failure or missing configuration it returns
`undefined` and the page falls back to `MOCK_LOADOUTS` (same pattern as
`discord-members.ts` → `MOCK_*`). Cards render as articles with no detail
route yet (`/equipo/[id]` is fase 2).

Supabase access lives in `src/lib/supabase/server.ts`, constructed only
from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, imported exclusively by
server code. The service key never reaches the browser. Row Level Security
denies everything to `anon`/`authenticated`; only `service_role` bypasses,
so all reads/writes go through our server.

Migration `supabase/migrations/0001_create_loadouts.sql` creates the table,
indexes, RLS policies and 3–6 Spanish seed rows.

Minimal schema (designed so fase 2 needs no migration):

- `id uuid primary key default gen_random_uuid()`
- `owner_discord_id text not null` (who owns it; joins nothing)
- `owner_name text not null`, `owner_avatar_url text` (snapshot for
  listing without per-row Discord calls)
- `title text not null`, `description text not null`
- `topics text[] not null default '{}'`
- `cover_url text`
- `body jsonb not null default '{}'` (reserved for the fase-2 structured
  content; empty in this phase)
- `rating_avg numeric not null default 0`, `rating_count int not null
  default 0`, `views int not null default 0` (display signals; real
  voting/counting is fase 2)
- `created_at / updated_at timestamptz not null default now()`

Required new server environment variables (documented in `.env.example`,
never committed with real values):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

New dependency: `@supabase/supabase-js` (server reads only in this phase;
no `@supabase/ssr` until fase 2 needs browser writes).

## Boundaries and failure behavior

This phase does not include: create/edit form, detail page, voting,
real view counting, comments, the structured loadout content model,
Supabase Auth, or a `profiles` table. The registro cookie flow is
unchanged. Missing Supabase env vars fail open to mocks with a server
console warning (never leaking values); Supabase errors also fall back to
mocks. External cover/author image URLs render via `next/image`
`unoptimized` under the existing remote-pattern allowlist.

## Verification

Unit/component tests cover: card and toolbar rendering, topic filter,
search filter, each sort order, disabled create-button hint states, and the
Supabase→mock fallback of `getLoadouts()`. The change must pass `npm test`,
`npm run typecheck` and `npm run build`. Pre-existing lint errors in
`theme-provider.tsx` and `home-canales.tsx` are out of scope and stay
untouched. Manual acceptance: `/equipo` renders seeded rows from Supabase
when configured and mocks otherwise; sidebar link highlights; gating
redirects behave like Home; disabled button always explains why.

## Deployment and documentation

README gains a Supabase section: project creation, where to find URL and
`service_role` key, applying the migration, local `.env.local` values and
Vercel environment variables. The owner supplies the project and keys;
deployment is prepared, not performed.
