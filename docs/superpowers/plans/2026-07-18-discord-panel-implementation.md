# Discord Panel PoC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable Spanish-language Next.js proof of concept that signs users in with Discord using only `identify` and renders a protected profile card without a database.

**Architecture:** Next.js App Router renders a public login route and a server-protected profile route. NextAuth 4 uses its Discord provider and encrypted JWT sessions; pure mapping/session helpers keep Discord data normalization testable and ensure OAuth tokens never enter the browser session.

**Tech Stack:** Node 22, npm 10, Next.js 16.2.10, React 19.2.7, TypeScript, NextAuth 4.24.14, Tailwind CSS 4.3.3, Vitest 4.1.10, Testing Library 16.3.2, jsdom 29.1.1.

## Global Constraints

- OAuth requests exactly the `identify` scope; do not request email, guilds, roles, bot, or message permissions.
- Sessions are encrypted JWT cookies with `maxAge: 28_800` seconds and no adapter or database.
- Never include `access_token`, `refresh_token`, `AUTH_DISCORD_SECRET`, or `AUTH_SECRET` in the session returned to the browser.
- Interface text is Spanish, the provisional product name is “Discord Panel”, and the visual style is original rather than a copy of Eleven Project.
- Missing Discord fields render as neutral fallbacks or are omitted; raw JSON is never rendered.
- The user approved project/test scaffolding as the sole TDD exception; all application behavior follows red-green-refactor.

---

### Task 1: Project and test foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `eslint.config.mjs`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, and `test`; `@/*` resolves to `src/*`.

- [ ] **Step 1: Create the approved scaffolding exception**

Create the package manifest with pinned runtime dependencies and compatible development dependencies:

```json
{
  "name": "discord-panel",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "16.2.10",
    "next-auth": "4.24.14",
    "react": "19.2.7",
    "react-dom": "19.2.7"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.3.3",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "eslint-config-next": "16.2.10",
    "jsdom": "29.1.1",
    "tailwindcss": "4.3.3",
    "typescript": "latest",
    "vitest": "4.1.10"
  }
}
```

Configure strict TypeScript, the Next.js plugin, Tailwind PostCSS, jsdom, Testing Library matchers, and the `@/*` alias. Create a minimal root layout importing `globals.css` and a temporary home page containing only `Discord Panel`; it will be replaced test-first in Task 4.

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and npm exits successfully with no unresolved peer dependency.

- [ ] **Step 3: Verify the empty baseline**

Run: `npm test; npm run typecheck; npm run lint`

Expected: Vitest reports no test files without treating it as a failure (configure `passWithNoTests: true`), TypeScript passes, and ESLint passes.

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs vitest.config.ts vitest.setup.ts eslint.config.mjs src/app
git commit -m "chore: scaffold Discord Panel"
```

### Task 2: Discord profile normalization

**Files:**
- Create: `src/features/discord/discord-profile.ts`
- Create: `src/features/discord/discord-profile.test.ts`

**Interfaces:**
- Produces: `normalizeDiscordProfile(raw: DiscordApiProfile): DiscordProfile`.
- Produces: exported `DiscordApiProfile`, `DiscordProfile`, and `PrimaryGuild` types.

- [ ] **Step 1: Write failing normalization tests**

Cover a complete profile and a minimal profile:

```ts
import { describe, expect, it } from "vitest"
import { normalizeDiscordProfile } from "./discord-profile"

describe("normalizeDiscordProfile", () => {
  it("maps the Discord identify response into safe display fields", () => {
    expect(normalizeDiscordProfile({
      id: "80351110224678912",
      username: "nelly",
      global_name: "Nelly",
      avatar: "a_avatarhash",
      banner: "bannerhash",
      accent_color: 5793266,
      locale: "es-ES",
      public_flags: 64,
      avatar_decoration_data: { asset: "decoration", sku_id: "1" },
      primary_guild: {
        identity_guild_id: "123",
        identity_enabled: true,
        tag: "DISC",
        badge: "badgehash"
      }
    })).toMatchObject({
      id: "80351110224678912",
      username: "nelly",
      displayName: "Nelly",
      avatarUrl: "https://cdn.discordapp.com/avatars/80351110224678912/a_avatarhash.gif?size=256",
      bannerUrl: "https://cdn.discordapp.com/banners/80351110224678912/bannerhash.png?size=600",
      accentColor: "#5865f2",
      locale: "es-ES",
      publicFlags: 64,
      avatarDecorationUrl: "https://cdn.discordapp.com/avatar-decoration-presets/decoration.png?size=96&passthrough=true",
      primaryGuild: { id: "123", tag: "DISC", badgeUrl: "https://cdn.discordapp.com/clan-badges/123/badgehash.png?size=64" }
    })
  })

  it("uses the username and undefined optional fields for a minimal profile", () => {
    expect(normalizeDiscordProfile({ id: "1", username: "solo" })).toEqual({
      id: "1",
      username: "solo",
      displayName: "solo",
      publicFlags: 0
    })
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/features/discord/discord-profile.test.ts`

Expected: FAIL because `./discord-profile` does not exist.

- [ ] **Step 3: Implement the minimal normalizer**

Define the raw response with optional Discord fields, generate Discord CDN URLs only when their hashes exist, select GIF for hashes beginning with `a_`, format accent color as a zero-padded six-digit hexadecimal value, and omit `primaryGuild` unless `identity_enabled`, guild ID, and tag are all present.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/features/discord/discord-profile.test.ts`

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/features/discord
git commit -m "feat: normalize Discord identity profiles"
```

### Task 3: Stateless Auth.js session

**Files:**
- Create: `src/auth/session.ts`
- Create: `src/auth/session.test.ts`
- Create: `src/auth/options.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `.env.example`

**Interfaces:**
- Consumes: `normalizeDiscordProfile(raw): DiscordProfile`.
- Produces: `persistDiscordProfile(token, user)` and `exposeDiscordProfile(session, token)` pure callback helpers.
- Produces: `authOptions: NextAuthOptions` and NextAuth GET/POST route handlers.

- [ ] **Step 1: Write failing session-boundary tests**

```ts
import { describe, expect, it } from "vitest"
import { exposeDiscordProfile, persistDiscordProfile } from "./session"

const profile = { id: "1", username: "solo", displayName: "Solo", publicFlags: 0 }

describe("Auth session callbacks", () => {
  it("stores only the normalized profile in the encrypted JWT", () => {
    expect(persistDiscordProfile({ accessToken: "must-not-copy" }, { discordProfile: profile })).toEqual({
      accessToken: "must-not-copy",
      discordProfile: profile
    })
  })

  it("exposes the normalized profile without OAuth tokens", () => {
    expect(exposeDiscordProfile(
      { user: { name: "Solo" }, expires: "2099-01-01" },
      { discordProfile: profile, accessToken: "secret", refreshToken: "secret" }
    )).toEqual({
      user: { name: "Solo", discordProfile: profile },
      expires: "2099-01-01"
    })
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/auth/session.test.ts`

Expected: FAIL because `./session` does not exist.

- [ ] **Step 3: Implement session helpers and verify GREEN**

Implement the two immutable helpers, explicitly constructing the public session rather than spreading token properties. Run the same test and expect 2 passing tests.

- [ ] **Step 4: Configure Discord and route handlers**

Configure `DiscordProvider` with `clientId: process.env.AUTH_DISCORD_ID`, `clientSecret: process.env.AUTH_DISCORD_SECRET`, authorization params `{ scope: "identify" }`, and a `profile` callback that returns the standard Auth.js fields plus `discordProfile: normalizeDiscordProfile(profile)`. Set `session: { strategy: "jwt", maxAge: 28_800 }`, use the pure JWT/session helpers, and set `/` as the custom sign-in and error page. Export the handler as both `GET` and `POST`.

Augment `next-auth`, `next-auth/jwt`, and the provider user type so `session.user.discordProfile`, `token.discordProfile`, and `user.discordProfile` are typed as `DiscordProfile`. Document empty values in `.env.example`.

- [ ] **Step 5: Verify auth configuration**

Run: `npm test; npm run typecheck; npm run lint`

Expected: all tests, type checking, and lint pass; no secret value exists in tracked files.

- [ ] **Step 6: Commit**

```powershell
git add src/auth src/types src/app/api .env.example
git commit -m "feat: add stateless Discord authentication"
```

### Task 4: Public login and OAuth error experience

**Files:**
- Create: `src/features/auth/auth-errors.ts`
- Create: `src/features/auth/auth-errors.test.ts`
- Create: `src/features/auth/login-panel.tsx`
- Create: `src/features/auth/login-panel.test.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `getAuthErrorMessage(code?: string): string | undefined`.
- Produces: `<LoginPanel authenticated boolean errorCode?: string />`.

- [ ] **Step 1: Write failing error-message tests**

Assert `AccessDenied` maps to “Has cancelado o rechazado el acceso con Discord.”, `OAuthCallback` maps to “Discord no pudo completar el inicio de sesión. Inténtalo de nuevo.”, unknown codes map to a generic safe message, and `undefined` returns `undefined`. Run the focused test and verify it fails because the module is missing.

- [ ] **Step 2: Implement error mapping and verify GREEN**

Implement a fixed record plus generic fallback, rerun the focused test, and expect all cases to pass.

- [ ] **Step 3: Write failing consent-gate component tests**

Mock `next-auth/react` only at the network boundary and assert:

```ts
it("requires the data notice before starting Discord OAuth", async () => {
  const user = userEvent.setup()
  render(<LoginPanel authenticated={false} />)
  const button = screen.getByRole("button", { name: /continuar con discord/i })
  expect(button).toBeDisabled()
  await user.click(screen.getByRole("checkbox"))
  expect(button).toBeEnabled()
  await user.click(button)
  expect(signIn).toHaveBeenCalledWith("discord", { callbackUrl: "/perfil" })
})
```

Also assert the exact notice copy, safe error rendering, and an authenticated “Ver mi perfil” link instead of the consent form. Run the test and verify RED because the component is missing.

- [ ] **Step 4: Implement the login experience and verify GREEN**

Build an accessible client component with a real checkbox/label pair, disabled/loading button state, `aria-live` error alert, and authenticated link. Update the server home page to call `getServerSession(authOptions)`, accept `searchParams.error`, and pass only booleans/error codes to the client component. Rerun focused tests and expect them to pass.

- [ ] **Step 5: Commit**

```powershell
git add src/features/auth src/app/page.tsx
git commit -m "feat: add Discord consent login flow"
```

### Task 5: Protected Discord profile card

**Files:**
- Create: `src/features/profile/profile-card.tsx`
- Create: `src/features/profile/profile-card.test.tsx`
- Create: `src/features/profile/sign-out-button.tsx`
- Create: `src/app/perfil/page.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `DiscordProfile` and `session.user.discordProfile`.
- Produces: `<ProfileCard profile: DiscordProfile />` and `<SignOutButton />`.

- [ ] **Step 1: Write failing card tests**

Render a complete profile and assert display name, `@username`, Discord ID, locale, guild tag, avatar alt text, public-flags value, and decoration are visible. Render a minimal profile and assert initials replace the image while locale, guild, banner, and decoration labels are absent. Run the focused test and verify RED because the component is missing.

- [ ] **Step 2: Implement the minimal card and verify GREEN**

Implement a semantic card with `<dl>` metadata, conditional optional sections, constrained remote images, initials fallback, and decoration overlay. Configure `next/image` only for HTTPS `cdn.discordapp.com`. Run the focused tests and expect both variants to pass.

- [ ] **Step 3: Add protected route and sign-out action**

Create a server page that calls `getServerSession(authOptions)` and `redirect("/")` when `session?.user.discordProfile` is absent. Render the card and a client sign-out button that calls `signOut({ callbackUrl: "/" })` otherwise.

- [ ] **Step 4: Verify the feature**

Run: `npm test; npm run typecheck; npm run lint`

Expected: all tests and static checks pass.

- [ ] **Step 5: Commit**

```powershell
git add src/features/profile src/app/perfil next.config.ts
git commit -m "feat: show protected Discord profile"
```

### Task 6: Original responsive styling, documentation, and production verification

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `README.md`

**Interfaces:**
- Produces: documented local and Vercel deployment workflow.

- [ ] **Step 1: Add the original responsive theme**

Define Tailwind import plus CSS design tokens for dark surfaces, blurple accent, focus rings, text contrast, reduced motion, and responsive card/login layouts. Use system fonts and CSS decoration only; add no copied images or external brand assets. Set Spanish metadata and `lang="es"` in the root layout.

- [ ] **Step 2: Document setup and callbacks**

Write README steps for `npm install`, copying `.env.example` to `.env.local`, generating `AUTH_SECRET`, creating a Discord application, and registering:

- `http://localhost:3000/api/auth/callback/discord`
- `https://<vercel-domain>/api/auth/callback/discord`

Document `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, Vercel environment variables, exact `identify` scope, the absence of Supabase, and the future bot boundary.

- [ ] **Step 3: Run complete verification**

Run: `npm test; npm run typecheck; npm run lint; npm run build`

Expected: all tests pass, typecheck and lint exit zero, and Next.js produces a successful production build containing `/`, `/perfil`, and `/api/auth/[...nextauth]`.

- [ ] **Step 4: Inspect repository hygiene**

Run: `git status --short; git diff --check; git grep -n -E "(AUTH_DISCORD_SECRET|AUTH_SECRET)=.+" -- ':!package-lock.json'`

Expected: only intended files are modified, no whitespace errors, and no populated secret is tracked.

- [ ] **Step 5: Commit**

```powershell
git add src/app README.md
git commit -m "docs: finish Discord Panel proof of concept"
```

- [ ] **Step 6: Perform manual OAuth acceptance when credentials are available**

Start with `npm run dev`, accept the data notice, authenticate with a Discord test account, confirm Discord requests only identity, verify `/perfil`, refresh persistence, and sign-out. If credentials are not available, report this manual check as pending rather than fabricating a pass.

