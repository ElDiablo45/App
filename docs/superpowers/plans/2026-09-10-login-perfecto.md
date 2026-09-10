# Login perfecto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar `/` + `/registro` terminados: label Correo, medalla bandera en perfil, invitado solo-home con blur+candado, y fondo registro = hero-1.

**Architecture:** Cambios acotados sobre flujo existente: cookie `hh_registro` sigue igual, nueva cookie `hh_guest=1` para invitado sin NextAuth, mapa país→ISO para bandera, `DashboardShell(isGuest)` para bloqueo visual + guard server en páginas.

**Tech Stack:** Next.js App Router, NextAuth Discord, cookies `next/headers`, Lucide `Lock`, CSS actual `eleven-*` / `hunt-*`, vitest.

**Spec:** diseño aprobado en chat 10-09-2026 (Correo, bandera, invitado blur, hero-1).

## Global Constraints

- Copy en español, sentence case.
- No nuevas fuentes/librerías, seguir `globals.css`.
- Responsive `<960px` registro oculta derecha, foco visible, `prefers-reduced-motion`.
- TDD: test failing antes de implementar.

---

### Task 1: Label Correo

**Files:**
- Modify: `src/features/registro/registro-form.tsx:101-103`
- Modify: `src/features/registro/registro-validation.ts:72`
- Test: `src/features/registro/registro-validation.test.ts`, `src/features/registro/registro-form.test.tsx`

**Interfaces:**
- Consumes: nada previo.
- Produces: label `Correo`, error `Introduce un correo válido.`

- [ ] **Step 1: Write the failing test**

```tsx
// registro-validation.test.ts
expect(validateRegistro({ email: "no-es-email", birthDate: "2000-01-01", nationality: "" }).email).toBe("Introduce un correo válido.")
// registro-form.test.tsx
expect(screen.getByLabelText(/correo/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/registro -t "correo"`
Expected: FAIL (mensaje actual `Introduce un email válido.` / label `Email`)

- [ ] **Step 3: Write minimal implementation**

```tsx
// registro-form.tsx
<label className="eleven-label" htmlFor="registro-email">Correo</label>
// registro-validation.ts
errors.email = "Introduce un correo válido."
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/registro`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/registro/registro-form.tsx src/features/registro/registro-validation.ts src/features/registro/*.test.*
git commit -m "feat(registro): renombra Email a Correo"
```

### Task 2: País → bandera + medalla perfil

**Files:**
- Create: `src/features/registro/paises.ts`
- Create: `src/features/registro/paises.test.ts`
- Modify: `src/app/perfil/page.tsx`
- Modify: `src/features/profile/hunt-profile.tsx`
- Modify: `src/app/globals.css`
- Test: `src/features/registro/paises.test.ts`

**Interfaces:**
- Consumes: `RegistroData.nationality` (cookie `hh_registro`).
- Produces: `PAIS_A_ISO: Record<string, string | null>`, `banderaParaPais(nombre: string): string | null`, `isoABandera(iso: string): string`; prop `HuntProfile({ nationality?: string | null })`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest"
import { banderaParaPais } from "./paises"
describe("banderaParaPais", () => {
  it("España → 🇪🇸", () => { expect(banderaParaPais("España")).toBe("🇪🇸") })
  it("México → 🇲🇽", () => { expect(banderaParaPais("México")).toBe("🇲🇽") })
  it("Otro → null", () => { expect(banderaParaPais("Otro")).toBeNull() })
  it("vacío → null", () => { expect(banderaParaPais("")).toBeNull() })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/registro/paises.test.ts`
Expected: FAIL with "Cannot find module './paises'"

- [ ] **Step 3: Write minimal implementation**

```ts
export const PAIS_A_ISO: Record<string, string | null> = {
  "España": "ES", "México": "MX", "Argentina": "AR", "Colombia": "CO", "Chile": "CL",
  "Perú": "PE", "Venezuela": "VE", "Ecuador": "EC", "Guatemala": "GT", "Cuba": "CU",
  "Bolivia": "BO", "República Dominicana": "DO", "Honduras": "HN", "Paraguay": "PY",
  "El Salvador": "SV", "Nicaragua": "NI", "Costa Rica": "CR", "Panamá": "PA",
  "Uruguay": "UY", "Puerto Rico": "PR", "Estados Unidos": "US", "Portugal": "PT",
  "Francia": "FR", "Italia": "IT", "Alemania": "DE", "Reino Unido": "GB",
  "Países Bajos": "NL", "Bélgica": "BE", "Suiza": "CH", "Suecia": "SE",
  "Noruega": "NO", "Polonia": "PL", "Rumanía": "RO", "Marruecos": "MA",
  "Argelia": "DZ", "Brasil": "BR", "Canadá": "CA", "Andorra": "AD", "Otro": null,
}
export function isoABandera(iso: string): string {
  return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
}
export function banderaParaPais(nombre: string): string | null {
  const iso = PAIS_A_ISO[nombre?.trim() ?? ""]
  return iso ? isoABandera(iso) : null
}
```

Perfil: `parseRegistroCookie(registroRaw)?.nationality` → prop `nationality` → en `.hunt-medals` primera posición:
```tsx
{flag ? <span className="hunt-medal hunt-medal--flag" aria-label={nationality} title={nationality}>{flag}<span className="hunt-medal-tip" role="tooltip"><strong>{nationality}</strong><span>Tu nacionalidad</span></span></span> : null}
```
CSS: `.hunt-medal--flag{font-size:18px;line-height:1}`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/registro/paises.test.ts src/features/profile`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/registro/paises.ts src/features/registro/paises.test.ts src/app/perfil/page.tsx src/features/profile/hunt-profile.tsx src/app/globals.css
git commit -m "feat(perfil): medalla bandera por nacionalidad"
```

### Task 3: Invitado solo-home + blur/candado

**Files:**
- Create: `src/features/auth/guest-cookie.ts`
- Create: `src/features/auth/guest-cookie.test.ts`
- Modify: `src/features/auth/login-panel.tsx`
- Modify: `src/features/auth/login-panel.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/features/layout/dashboard-shell.tsx`
- Modify: `src/app/perfil/page.tsx`, `src/app/equipo/page.tsx`, `src/app/equipo/nueva/page.tsx`
- Modify: `src/app/globals.css`
- Test: `src/features/auth/guest-cookie.test.ts`, `login-panel.test.tsx`

**Interfaces:**
- Consumes: `GUEST_COOKIE = "hh_guest"`, `isGuestCookie(raw)`, `DashboardShell({ isGuest?: boolean })`.
- Produces: cookie `hh_guest=1` (28_800s, `SameSite=Lax`), home visible para guest, resto blur+candado.

- [ ] **Step 1: Write the failing test**

```ts
// guest-cookie.test.ts
expect(isGuestCookie("hh_guest=1; otro=2")).toBe(true)
// login-panel.test.tsx
expect(screen.getByRole("button", { name: /invitado/i })).toBeInTheDocument()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/auth/guest-cookie.test.ts`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

```ts
// guest-cookie.ts
export const GUEST_COOKIE = "hh_guest"
export const GUEST_MAX_AGE = 28_800
export function isGuestCookie(raw: string | null | undefined): boolean { ... }
// login-panel.tsx (client): botón secundario bajo el primario
<button className="eleven-guest-btn" type="button" onClick={() => { document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${GUEST_MAX_AGE}; SameSite=Lax`; router.push("/"); router.refresh() }}>Entrar como invitado</button>
// page.tsx (server): leer cookies().get(GUEST_COOKIE); si guest sin profile → DashboardShell isGuest + HomePage read-only
// dashboard-shell.tsx: prop isGuest; nav locked con <Lock size={12}/> + wrap blur+overlay "Bloqueado — Para acceder necesitas iniciar sesión con Discord [Iniciar sesión]"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/auth && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/ src/app/page.tsx src/features/layout/dashboard-shell.tsx src/app/perfil/page.tsx src/app/equipo/ src/app/globals.css
git commit -m "feat(auth): invitado solo-home con bloqueo blur+candado"
```

### Task 4: Fondo registro = hero-1 + verificación final

**Files:**
- Modify: `src/app/registro/page.tsx:58-66`
- Test: manual + `npx vitest run src/features/registro`

**Interfaces:**
- Consumes: `public/hunt/hero-1.jpg` (existe).
- Produces: `/registro` con hero propio.

- [ ] **Step 1: Write the failing check**

Buscar `images.unsplash.com` en `src/app/registro/page.tsx` — debe existir antes del cambio.

- [ ] **Step 2: Run check**

Run: `rg "unsplash" src/app/registro/page.tsx`
Expected: 1 match (fondo confeti actual)

- [ ] **Step 3: Write minimal implementation**

```tsx
<img src="/hunt/hero-1.jpg" alt="" className="eleven-registro-img" loading="eager" />
```

- [ ] **Step 4: Run tests + lint**

Run: `npx vitest run src/features/registro && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/registro/page.tsx
git commit -m "feat(registro): fondo propio hero-1"
```
