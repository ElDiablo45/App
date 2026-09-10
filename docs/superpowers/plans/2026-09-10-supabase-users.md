# Supabase + sesión persistente Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instalar Supabase (@supabase/ssr) correctamente y persistir usuarios/registro para no pedir login+verificación cada vez.

**Architecture:** Mantener NextAuth Discord como identidad (Opción A); Supabase solo como BD de perfiles `public.users`. Sesión JWT larga 30d, upsert en `completarRegistro`, lectura Supabase-first con cookie como fallback.

**Tech Stack:** Next.js 16.2.10, next-auth 4.24.14 (JWT), @supabase/supabase-js 2.115, @supabase/ssr (nuevo), Postgres Supabase, vitest.

**Spec:** Brainstorming architectural aprobado en chat (2026-09-10): sección 1 tal cual + sección 2 opción A.

## Global Constraints

- Alias `@/*` → `./src/*` (tsconfig.json).
- Supabase helpers viven en `src/lib/supabase/`, no en `utils/`.
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` se mantienen para server; añadir `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- RLS: deny anon/authenticated, solo service_role escribe (patrón `0001_create_loadouts.sql`).
- Cada tarea: `npm run typecheck`, `npm run lint`, `npm test`.

---

### Task 0: Skill Supabase + dependencia @supabase/ssr

**Files:**
- Modify: `package.json:13-21`
- Create (vía CLI): skill `supabase/agent-skills`

**Interfaces:**
- Consumes: nada
- Produces: `@supabase/ssr` disponible para Task 2

- [ ] **Step 1: Instalar skill**

```bash
npx skills add supabase/agent-skills
```

- [ ] **Step 2: Instalar dependencia**

```bash
npm install @supabase/ssr
```

- [ ] **Step 3: Verificar**

```bash
npm ls @supabase/ssr
```

Run: `npm ls @supabase/ssr`
Expected: PASS con versión instalada (@supabase/supabase-js ya está en 2.115, no reinstalar)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase ssr + agent skills"
```

---

### Task 1: Envs unificados

**Files:**
- Modify: `.env.local:1-6`
- Modify: `.env.example:1-15`
- Test: `src/lib/supabase/server.test.ts` (existente, ampliar si falta)

**Interfaces:**
- Consumes: Task 0
- Produces: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` disponibles en browser+server

- [ ] **Step 1: Añadir vars a .env.local**

```
NEXT_PUBLIC_SUPABASE_URL=https://yhsifeqfkybhpkwzyddl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pruNMLDF1U5YLCw5i44l5w_Db20naIv
```

- [ ] **Step 2: Añadir vars a .env.example (vacías, sin secretos)**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 3: Verificar tests + typecheck**

Run: `npm test -- src/lib/supabase/server.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "chore: add supabase public env vars"
```
(No commitear `.env.local` con secretos reales.)

---

### Task 2: Helpers Supabase @supabase/ssr + middleware

**Files:**
- Create: `src/lib/supabase/client.ts`
- Modify: `src/lib/supabase/server.ts:1-9`
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts` (raíz)
- Test: `src/lib/supabase/client.test.ts`, ampliar `src/lib/supabase/server.test.ts`

**Interfaces:**
- Consumes: Task 0, Task 1 (envs públicas)
- Produces: `createClient()` browser, `createServerSupabase()` + `getServiceSupabase()`, `updateSession(request)`

- [ ] **Step 1: Write failing test (client)**

```ts
import { describe, expect, it } from "vitest"
import { createClient } from "./client"
describe("supabase browser client", () => {
  it("creates a client", () => {
    expect(() => createClient()).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/supabase/client.test.ts`
Expected: FAIL with "function not defined" / module not found

- [ ] **Step 3: Write minimal implementation `src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!)
```

- [ ] **Step 4: Adaptar `src/lib/supabase/server.ts` (mantener service_role)**

```ts
import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Component: ignora si hay middleware refrescando sesión
        }
      },
    },
  })
}

export function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}
```

- [ ] **Step 5: Crear `src/lib/supabase/middleware.ts` (corregido, con getUser)**

```ts
import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })
  await supabase.auth.getUser()
  return supabaseResponse
}
```

- [ ] **Step 6: Crear `middleware.ts` raíz**

```ts
import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
```

- [ ] **Step 7: Run tests + typecheck**

Run: `npm test -- src/lib/supabase && npm run typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/supabase middleware.ts
git commit -m "feat: add supabase ssr helpers and session middleware"
```

---

### Task 3: Tabla public.users + migración

**Files:**
- Create: `supabase/migrations/0002_create_users.sql`
- Test: aplicar SQL en Supabase (dashboard / CLI)

**Interfaces:**
- Consumes: Task 2
- Produces: tabla `public.users` con PK `discord_id`

- [ ] **Step 1: Escribir migración**

```sql
create table if not exists public.users (
  discord_id text primary key,
  email text not null,
  birth_date date not null,
  nationality text,
  display_name text not null,
  avatar_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "deny anon" on public.users;
create policy "deny anon" on public.users for all to anon using (false) with check (false);
drop policy if exists "deny authenticated" on public.users;
create policy "deny authenticated" on public.users for all to authenticated using (false) with check (false);
```

- [ ] **Step 2: Aplicar en Supabase y verificar tabla existe**

Run: aplicar vía Dashboard SQL o `supabase db push` si hay CLI vinculado
Expected: `select * from public.users limit 1;` OK vacío

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_create_users.sql
git commit -m "feat: add users table migration"
```

---

### Task 4: Upsert en login/registro persistente

**Files:**
- Create: `src/features/registro/users-repo.ts`
- Create test: `src/features/registro/users-repo.test.ts`
- Modify: `src/features/registro/registro-actions.ts:21-64`
- Modify: `src/app/registro/page.tsx:21-25`
- Modify: `src/app/page.tsx:53-60`

**Interfaces:**
- Consumes: Task 3 (tabla users), `getServiceSupabase()`
- Produces: `getUserByDiscordId(discordId)`, `upsertUser(input)`

- [ ] **Step 1: Write failing test repo**

```ts
import { describe, expect, it, vi } from "vitest"
vi.mock("@/lib/supabase/server", () => ({ getServiceSupabase: vi.fn(() => null) }))
import { getUserByDiscordId } from "./users-repo"
describe("users-repo", () => {
  it("returns null without supabase", async () => {
    await expect(getUserByDiscordId("123")).resolves.toBeNull()
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm test -- src/features/registro/users-repo.test.ts`
Expected: FAIL (módulo no existe)

- [ ] **Step 3: Implementar `users-repo.ts`**

```ts
import "server-only"
import { getServiceSupabase } from "@/lib/supabase/server"
export interface RegistroUser { discord_id: string; email: string; birth_date: string; nationality?: string | null; display_name: string; avatar_url?: string | null }
export async function getUserByDiscordId(discordId: string) {
  const sb = getServiceSupabase()
  if (!sb) return null
  const { data } = await sb.from("users").select("*").eq("discord_id", discordId).maybeSingle()
  return data
}
export async function upsertUser(input: RegistroUser) {
  const sb = getServiceSupabase()
  if (!sb) return { ok: false as const, error: "Supabase no configurado" }
  const { error } = await sb.from("users").upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "discord_id" })
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}
```

- [ ] **Step 4: Modificar `completarRegistro` para upsert antes de cookie**

En `src/features/registro/registro-actions.ts` tras validar: llamar `upsertUser({ discord_id: profile.id, email, birth_date: birthDate, nationality, display_name: profile.displayName, avatar_url: profile.avatarUrl })`. Si falla → `return { ok:false, error: "No se pudo guardar..." }`. Si OK → set cookie actual como compat.

- [ ] **Step 5: Lectura Supabase-first en pages**

En `src/app/registro/page.tsx` y `src/app/page.tsx`: `const dbUser = await getUserByDiscordId(profile.id); if (dbUser) redirect("/")`. Mantener `isRegistroCompleteForDiscord` como fallback.

- [ ] **Step 6: Run tests**

Run: `npm test -- src/features/registro && npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/registro src/app/registro/page.tsx src/app/page.tsx
git commit -m "feat: persist registro users in supabase"
```

---

### Task 5: Sesión persistente 30 días

**Files:**
- Modify: `src/auth/options.ts:41-44`
- Modify: `src/features/registro/registro-store.ts:4`
- Test: `src/auth/options.test.ts`

**Interfaces:**
- Consumes: Task 4
- Produces: JWT `maxAge` 30d

- [ ] **Step 1: Cambiar maxAge**

```ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60,
  updateAge: 24 * 60 * 60,
},
```

- [ ] **Step 2: Igualar cookie registro**

```ts
export const REGISTRO_MAX_AGE = 30 * 24 * 60 * 60
```

- [ ] **Step 3: Run tests**

Run: `npm test -- src/auth && npm run typecheck && npm run lint`
Expected: PASS (actualizar `options.test.ts` si aserta 28800)

- [ ] **Step 4: Commit**

```bash
git add src/auth/options.ts src/features/registro/registro-store.ts
git commit -m "feat: extend session to 30 days"
```
