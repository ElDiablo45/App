# Equipo / Loadouts (fase visual + fundación Supabase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the visual Equipo/Loadouts section at `/equipo` plus the Supabase foundation with a real server read path and mock fallback.

**Architecture:** NextAuth Discord stays untouched. New `src/features/equipo/` module (types, mocks, filter/sort helpers, components) plus `src/lib/supabase/server.ts` (service_role, server-only). `getLoadouts()` reads Supabase, falls back to `MOCK_LOADOUTS` on any failure. TDD throughout; CSS is config (verified via build).

**Tech Stack:** Next.js 16 App Router, TypeScript, next-auth 4, `@supabase/supabase-js`, vitest + testing-library, Eleven oklch tokens in `globals.css`.

**Spec:** `docs/superpowers/specs/2026-09-04-equipo-loadouts-design.md`

## Global Constraints

- Spanish UI copy; dark Eleven theme only (no new fonts, Inter 800 uppercase tight tracking for titles).
- `SUPABASE_SERVICE_ROLE_KEY` never reaches the browser; only `src/lib/supabase/server.ts` (server code) may read it.
- Registro cookie flow unchanged; `/equipo` gating identical to Home (`/`).
- Pre-existing lint errors in `theme-provider.tsx` / `home-canales.tsx` stay untouched.
- Every task ends with its own test cycle before moving on.

---

### Task 1: Supabase server client + env

**Files:**
- Modify: `.env.example` (append Supabase vars)
- Create: `src/lib/supabase/server.ts`
- Test: `src/lib/supabase/server.test.ts`

**Interfaces:**
- Consumes: `process.env.SUPABASE_URL`, `process.env.SUPABASE_SERVICE_ROLE_KEY`
- Produces: `getServiceSupabase(): SupabaseClient | null` (null when env missing → callers fall back to mocks)

- [ ] **Step 1: Write the failing test**

```ts
import { afterEach, describe, expect, it, vi } from "vitest"
import { getServiceSupabase } from "./server"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("getServiceSupabase", () => {
  it("returns null when env is missing (fail open to mocks)", () => {
    vi.stubEnv("SUPABASE_URL", "")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "")
    expect(getServiceSupabase()).toBeNull()
  })

  it("returns a client when env is present", () => {
    vi.stubEnv("SUPABASE_URL", "https://xyz.supabase.co")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key")
    const client = getServiceSupabase()
    expect(client).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/supabase/server.test.ts`
Expected: FAIL with "Failed to resolve import ./server"

- [ ] **Step 3: Write minimal implementation**

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}
```

Requires: `npm install @supabase/supabase-js`. Append to `.env.example`:

```text
# Supabase (solo lectura/escritura desde el servidor con service_role)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/supabase/server.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add .env.example package.json package-lock.json src/lib/supabase/server.ts src/lib/supabase/server.test.ts
git commit -m "feat: add server-only Supabase client with mock fallback"
```

### Task 2: Migration + seeds (SQL)

**Files:**
- Create: `supabase/migrations/0001_create_loadouts.sql`

**Interfaces:**
- Consumes: nothing (run once by owner in Supabase SQL editor)
- Produces: `public.loadouts` table + RLS + 4 seed rows matching the UI type

- [ ] **Step 1: Write the migration file** (no automated test possible; verification is review + `typecheck` unaffected)

```sql
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
```

- [ ] **Step 2: Verify SQL scans clean** (read back the file, check column names match `LoadoutRow` in Task 4 exactly)
- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_create_loadouts.sql
git commit -m "feat: add loadouts table migration with seeds"
```

### Task 3: Types, topics, mocks, filter/sort helpers

**Files:**
- Create: `src/features/equipo/types.ts`
- Create: `src/features/equipo/data.ts`
- Create: `src/features/equipo/equipo-filter.ts`
- Test: `src/features/equipo/equipo-filter.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Loadout`, `LoadoutSort`, `TOPICS: string[]`, `MOCK_LOADOUTS: Loadout[]`, `filterLoadouts(items, query, topic): Loadout[]`, `sortLoadouts(items, sort): Loadout[]`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest"
import { MOCK_LOADOUTS } from "./data"
import { filterLoadouts, sortLoadouts } from "./equipo-filter"

describe("filterLoadouts", () => {
  it("filters by title, topic and author", () => {
    expect(filterLoadouts(MOCK_LOADOUTS, "escudos", "").length).toBe(1)
    expect(filterLoadouts(MOCK_LOADOUTS, "", "pvp").length).toBe(1)
    expect(filterLoadouts(MOCK_LOADOUTS, "bazeso", "").length).toBe(2)
  })

  it("returns all on empty query and topic", () => {
    expect(filterLoadouts(MOCK_LOADOUTS, "  ", "")).toEqual(MOCK_LOADOUTS)
  })
})

describe("sortLoadouts", () => {
  it("sorts by latest, views and rating without mutating input", () => {
    const input = [...MOCK_LOADOUTS]
    const byViews = sortLoadouts(input, "views")
    expect(byViews[0]!.views).toBeGreaterThanOrEqual(byViews[1]!.views)
    const latest = sortLoadouts(input, "latest")
    expect(new Date(latest[0]!.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(latest[1]!.createdAt).getTime(),
    )
    expect(input.map((l) => l.id)).toEqual(MOCK_LOADOUTS.map((l) => l.id))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/equipo/equipo-filter.test.ts`
Expected: FAIL with "Failed to resolve import"

- [ ] **Step 3: Write minimal implementation**

`types.ts`:

```ts
export type LoadoutSort = "popular" | "top" | "views" | "latest"

export interface Loadout {
  id: string
  title: string
  description: string
  topics: string[]
  authorName: string
  authorAvatarUrl?: string
  coverUrl?: string
  ratingAvg: number
  ratingCount: number
  views: number
  createdAt: string
}
```

`data.ts`: `TOPICS` (12 tags: pvp, pve, extracción, principiante, avanzado, equipo, solo, tácticas, sigilo, combate, defensivo, gestión) and `MOCK_LOADOUTS` mirroring the 4 seed rows (ids `mock-1..4`, ISO `createdAt`, `authorAvatarUrl` via `https://i.pravatar.cc/64?img=N`, `coverUrl` via images.unsplash.com game art).

`equipo-filter.ts`:

```ts
import type { Loadout, LoadoutSort } from "./types"

export function filterLoadouts(items: Loadout[], query: string, topic: string): Loadout[] {
  const q = query.trim().toLowerCase()
  return items.filter((l) => {
    const topicOk = !topic || l.topics.includes(topic)
    if (!topicOk) return false
    if (!q) return true
    const hay = `${l.title} ${l.description} ${l.authorName} ${l.topics.join(" ")}`.toLowerCase()
    return hay.includes(q)
  })
}

export function sortLoadouts(items: Loadout[], sort: LoadoutSort): Loadout[] {
  const copy = [...items]
  switch (sort) {
    case "views":
      return copy.sort((a, b) => b.views - a.views)
    case "latest":
      return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    case "popular":
    case "top":
      return copy.sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount)
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/equipo/equipo-filter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/equipo/types.ts src/features/equipo/data.ts src/features/equipo/equipo-filter.ts src/features/equipo/equipo-filter.test.ts
git commit -m "feat: add equipo types, mocks and filter-sort helpers"
```

### Task 4: Server fetch with mock fallback

**Files:**
- Create: `src/features/equipo/loadouts.ts`
- Test: `src/features/equipo/loadouts.test.ts`

**Interfaces:**
- Consumes: `getServiceSupabase()` from Task 1, `MOCK_LOADOUTS` from Task 3
- Produces: `getLoadouts(): Promise<Loadout[]>` (Supabase rows mapped, or `MOCK_LOADOUTS` on any failure), `mapRowToLoadout(row: LoadoutRow): Loadout`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest"
import { getLoadouts, mapRowToLoadout } from "./loadouts"
import { MOCK_LOADOUTS } from "./data"

const { getServiceSupabase } = vi.hoisted(() => ({ getServiceSupabase: vi.fn() }))
vi.mock("@/lib/supabase/server", () => ({ getServiceSupabase }))

describe("mapRowToLoadout", () => {
  it("maps a DB row to the UI type", () => {
    const l = mapRowToLoadout({
      id: "r1", owner_discord_id: "1", owner_name: "Solo", owner_avatar_url: null,
      title: "T", description: "D", topics: ["pvp"], cover_url: null, body: {},
      rating_avg: 4.5, rating_count: 10, views: 100,
      created_at: "2026-09-01T00:00:00.000Z", updated_at: "2026-09-01T00:00:00.000Z",
    })
    expect(l).toEqual({
      id: "r1", title: "T", description: "D", topics: ["pvp"],
      authorName: "Solo", authorAvatarUrl: undefined, coverUrl: undefined,
      ratingAvg: 4.5, ratingCount: 10, views: 100, createdAt: "2026-09-01T00:00:00.000Z",
    })
  })
})

describe("getLoadouts", () => {
  it("falls back to mocks when Supabase is not configured", async () => {
    getServiceSupabase.mockReturnValueOnce(null)
    await expect(getLoadouts()).resolves.toBe(MOCK_LOADOUTS)
  })

  it("falls back to mocks when the query throws", async () => {
    getServiceSupabase.mockReturnValueOnce({
      from: () => ({ select: () => ({ order: () => { throw new Error("db down") } }) }),
    })
    await expect(getLoadouts()).resolves.toBe(MOCK_LOADOUTS)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/equipo/loadouts.test.ts`
Expected: FAIL with "Failed to resolve import ./loadouts"

- [ ] **Step 3: Write minimal implementation**

```ts
import { getServiceSupabase } from "@/lib/supabase/server"
import { MOCK_LOADOUTS } from "./data"
import type { Loadout } from "./types"

export interface LoadoutRow {
  id: string
  owner_discord_id: string
  owner_name: string
  owner_avatar_url: string | null
  title: string
  description: string
  topics: string[]
  cover_url: string | null
  body: Record<string, unknown>
  rating_avg: number | string
  rating_count: number
  views: number
  created_at: string
  updated_at: string
}

export function mapRowToLoadout(row: LoadoutRow): Loadout {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    topics: row.topics ?? [],
    authorName: row.owner_name,
    authorAvatarUrl: row.owner_avatar_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    ratingAvg: Number(row.rating_avg ?? 0),
    ratingCount: row.rating_count ?? 0,
    views: row.views ?? 0,
    createdAt: row.created_at,
  }
}

export async function getLoadouts(): Promise<Loadout[]> {
  try {
    const supabase = getServiceSupabase()
    if (!supabase) return MOCK_LOADOUTS
    const { data, error } = await supabase
      .from("loadouts")
      .select("*")
      .order("created_at", { ascending: false })
    if (error || !data) {
      console.warn("[equipo] supabase read failed, using mocks")
      return MOCK_LOADOUTS
    }
    return (data as LoadoutRow[]).map(mapRowToLoadout)
  } catch {
    console.warn("[equipo] supabase read failed, using mocks")
    return MOCK_LOADOUTS
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/equipo/loadouts.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/equipo/loadouts.ts src/features/equipo/loadouts.test.ts
git commit -m "feat: add supabase loadouts fetch with mock fallback"
```

### Task 5: Card + header components

**Files:**
- Create: `src/features/equipo/loadout-card.tsx`
- Create: `src/features/equipo/equipo-header.tsx`
- Test: `src/features/equipo/equipo-components.test.tsx`

**Interfaces:**
- Consumes: `Loadout` type
- Produces: `LoadoutCard({ item }: { item: Loadout })`, `EquipoHeader({ registroComplete }: { registroComplete: boolean })`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LoadoutCard } from "./loadout-card"
import { EquipoHeader } from "./equipo-header"
import { MOCK_LOADOUTS } from "./data"

describe("LoadoutCard", () => {
  it("renders author, title, topics, rating and relative date", () => {
    render(<LoadoutCard item={MOCK_LOADOUTS[0]!} />)
    expect(screen.getByText("drpenguin")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /farmeo xp/i })).toBeInTheDocument()
    expect(screen.getByText("4.6")).toBeInTheDocument()
  })
})

describe("EquipoHeader", () => {
  it("disables create with a hint when registro is incomplete", () => {
    render(<EquipoHeader registroComplete={false} />)
    const btn = screen.getByRole("button", { name: /crear equipo/i })
    expect(btn).toBeDisabled()
    expect(screen.getByText(/próximamente/i)).toBeInTheDocument()
  })

  it("enables a placeholder create action when registro is complete", () => {
    render(<EquipoHeader registroComplete />)
    expect(screen.getByRole("link", { name: /crear equipo/i })).toHaveAttribute("href", "#")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/equipo/equipo-components.test.tsx`
Expected: FAIL with "Failed to resolve import"

- [ ] **Step 3: Write minimal implementation**

`loadout-card.tsx` (article with avatar/name, h3 title, topic pills, cover `next/image` unoptimized 480x270, rating number + 5-star row, footer stats + relative date via `Intl.RelativeTimeFormat("es")`).

`equipo-header.tsx`:

```tsx
export function EquipoHeader({ registroComplete }: { registroComplete: boolean }) {
  return (
    <div className="eq-header">
      <div>
        <h1 className="eq-title">EQUIPO</h1>
        <p className="eq-sub">Descubre los equipos de la comunidad...</p>
      </div>
      {registroComplete ? (
        <a href="#" className="eq-create" onClick={(e) => e.preventDefault()}>
          Crear equipo
        </a>
      ) : (
        <div>
          <button className="eq-create" type="button" disabled title="Completa tu registro para crear equipos">
            Crear equipo
          </button>
          <p className="eq-hint">Próximamente: completa tu registro para crear equipos.</p>
        </div>
      )}
    </div>
  )
}
```

CSS classes `.eq-*` go in `globals.css` in Task 7.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/equipo/equipo-components.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/equipo/loadout-card.tsx src/features/equipo/equipo-header.tsx src/features/equipo/equipo-components.test.tsx
git commit -m "feat: add equipo card and header components"
```

### Task 6: Interactive browser (search + sort + topics)

**Files:**
- Create: `src/features/equipo/equipo-browser.tsx`
- Test: extend `src/features/equipo/equipo-components.test.tsx` (append new describe block, do not rewrite existing tests)

**Interfaces:**
- Consumes: `Loadout[]`, `filterLoadouts`, `sortLoadouts`, `LoadoutCard`, `TOPICS`
- Produces: `EquipoBrowser({ items }: { items: Loadout[] })` (`"use client"`, internal query/topic/sort state, empty state "Sin resultados")

- [ ] **Step 1: Append the failing test**

```tsx
import userEvent from "@testing-library/user-event"
import { EquipoBrowser } from "./equipo-browser"

describe("EquipoBrowser", () => {
  it("filters by search and topic and shows an empty state", async () => {
    const user = userEvent.setup()
    render(<EquipoBrowser items={MOCK_LOADOUTS} />)
    expect(screen.getAllByRole("article").length).toBe(4)
    await user.type(screen.getByPlaceholderText(/buscar/i), "escudos")
    expect(screen.getAllByRole("article").length).toBe(1)
    await user.clear(screen.getByPlaceholderText(/buscar/i))
    await user.click(screen.getByRole("button", { name: "pvp" }))
    expect(screen.getAllByRole("article").length).toBe(1)
    await user.type(screen.getByPlaceholderText(/buscar/i), "zzz-sin-nada")
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/equipo/equipo-components.test.tsx`
Expected: FAIL with "Failed to resolve import ./equipo-browser"

- [ ] **Step 3: Write minimal implementation** (`"use client"`; `useState` for query/topic/sort; `useMemo` applying `filterLoadouts` then `sortLoadouts`; search input with placeholder "Buscar equipos, temas, creadores..."; sort tab buttons Popular/Top Rated/Más vistos/Recientes with `aria-pressed`; topic buttons toggle single-select; grid of `LoadoutCard`; empty-state paragraph)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/equipo/equipo-components.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/equipo/equipo-browser.tsx src/features/equipo/equipo-components.test.tsx
git commit -m "feat: add interactive equipo browser"
```

### Task 7: Route, sidebar wiring, styles, docs

**Files:**
- Create: `src/app/equipo/page.tsx`
- Modify: `src/features/layout/dashboard-shell.tsx` (active union + `"equipo"`, Equipo `<a href="#">` → `<Link href="/equipo">`)
- Modify: `src/app/globals.css` (append `.eq-*` styles)
- Modify: `README.md` (Supabase section)

**Interfaces:**
- Consumes: `getLoadouts()`, `getDiscordProfile()`, registro cookie helpers, `EquipoHeader`, `EquipoBrowser`
- Produces: `/equipo` page with Home-identical gating

- [ ] **Step 1: Write the route** (verified via build, no unit test — same gating shape as `src/app/page.tsx`):

```tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
} from "@/features/registro/registro-store"
import { getLoadouts } from "@/features/equipo/loadouts"
import { EquipoHeader } from "@/features/equipo/equipo-header"
import { EquipoBrowser } from "@/features/equipo/equipo-browser"
import { DashboardShell } from "@/features/layout/dashboard-shell"

export default async function EquipoPage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  if (!profile) redirect("/")

  const store = await cookies()
  const registroComplete = isRegistroCompleteForDiscord(
    store.get(REGISTRO_COOKIE)?.value ?? null,
    profile.id,
  )
  if (!registroComplete) redirect("/registro")

  const loadouts = await getLoadouts()

  return (
    <DashboardShell active="equipo" breadcrumb="Equipo" profile={profile}>
      <EquipoHeader registroComplete={registroComplete} />
      <EquipoBrowser items={loadouts} />
    </DashboardShell>
  )
}
```

Note: `registroComplete` is always true here (redirect otherwise), so the header's disabled branch is covered by component tests, not by the route. DashboardShell change:

```tsx
active?: "home" | "perfil" | "equipo"
...
<Link href="/equipo" className={`hunt-nav-item ${active === "equipo" ? "hunt-nav-item--active" : ""}`}>
  <Shield size={14} /> Equipo
</Link>
```

CSS: append `.eq-header/.eq-title/.eq-sub/.eq-create/.eq-hint/.eq-toolbar/.eq-search/.eq-tabs/.eq-topics/.eq-grid/.eq-card...` using `var(--eleven-*)` tokens. README: Supabase project setup, SQL migration step, env vars, Vercel notes.

- [ ] **Step 2: Run full verification**

Run: `npm test`, `npm run typecheck`, `npm run build`
Expected: tests 100% pass, typecheck clean, build lists `ƒ /equipo`

- [ ] **Step 3: Commit**

```bash
git add src/app/equipo/page.tsx src/features/layout/dashboard-shell.tsx src/app/globals.css README.md
git commit -m "feat: add equipo page, sidebar wiring, styles and docs"
```

## Self-Review

- Spec coverage: route/nav/gating (§UX) → Task 7; layout/cards/toolbar (§UX) → Tasks 5–6 + CSS Task 7; `loadouts` schema + RLS + seeds → Task 2; server-only client + fallback (§Architecture) → Tasks 1, 4; create-button disabled state (§UX) → Task 5; tests/typecheck/build (§Verification) → every task + Task 7 step 2; README/env (§Deployment) → Tasks 1, 7.
- Placeholders: none — SQL, components, tests and commands are fully written out.
- Type consistency: `Loadout` fields match `mapRowToLoadout` output, `MOCK_LOADOUTS`, card/browser props and test expectations (`ratingAvg`, `authorName`, `createdAt` ISO strings).
