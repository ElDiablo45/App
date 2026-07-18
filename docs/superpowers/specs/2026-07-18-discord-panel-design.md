# Discord Panel PoC — Design Specification

## Purpose

Build a small, deployable proof of concept that authenticates a user with Discord and displays the basic profile information granted by the `identify` OAuth scope. The application validates the authentication foundation for a future Discord server-management dashboard without adding bot permissions, server access, persistence, or Supabase yet.

## User experience

The application uses the provisional name **Discord Panel** and Spanish interface copy. Its visual identity is original: a responsive dark interface with a restrained Discord-blurple accent, without copying Eleven Project branding, assets, or page composition.

The public `/` route contains a short explanation of the data requested, an unchecked consent control, and a “Continuar con Discord” button. The button remains disabled until the user accepts this notice:

> Autorizo a Discord Panel a leer y mostrar temporalmente la información básica de mi perfil de Discord.

This notice explains data use but is not presented as acceptance of final legal terms. An authenticated visitor can navigate directly from `/` to their profile.

The protected `/perfil` route displays a single profile card and a sign-out action. It shows the Discord ID, username, display name, avatar, locale, accent/banner presentation, public flags or badges, avatar decoration, and primary guild identity when Discord provides them. Missing optional values are omitted or replaced with a neutral visual fallback; the interface never prints raw JSON.

## Architecture and data flow

The project uses Next.js App Router, TypeScript, Tailwind CSS, npm, and Auth.js/NextAuth with Discord as its only provider. Authentication routes live under `/api/auth/[...nextauth]`.

Discord OAuth requests only `identify`. Auth.js performs the authorization-code exchange and its built-in state/CSRF protections. The provider profile callback converts the Discord response into a small `DiscordProfile` model. JWT and session callbacks retain only normalized profile fields needed by the card; OAuth access tokens, refresh tokens, the Discord client secret, and the Auth secret are never included in the browser session.

Sessions use encrypted JWT cookies with an eight-hour maximum age and no database adapter. `/perfil` reads the session on the server and redirects unauthenticated visitors to `/`. Signing out clears the session and returns to `/`.

Required server environment variables are:

- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `AUTH_SECRET`

An `.env.example` documents them without real credentials. The Discord application must register a localhost callback for development and the final Vercel callback for production.

## Boundaries and failure behavior

This PoC does not request email, guild lists, member details, roles, channels, bot permissions, or message access. It does not create an application database or use Supabase. Future server management will add a Discord bot and explicitly scoped permissions as a separate feature.

Authentication cancellation or provider failures return the visitor to a friendly Spanish error state on the login page. Missing server configuration fails closed and is documented for developers without leaking secret values. Image and profile fields are treated as untrusted external data and rendered through normal framework escaping and constrained Discord CDN image handling.

## Verification

Automated tests cover Discord-profile normalization, optional-field fallbacks, the consent gate, authenticated and unauthenticated navigation decisions, and user-facing OAuth error messages. The project must pass unit/component tests, lint, TypeScript checking, and a production build.

Manual acceptance uses a real Discord developer application to verify that the consent screen requests only identity, authentication reaches `/perfil`, returned profile fields render correctly, refresh preserves the session, sign-out removes it, and both localhost and Vercel callback configurations work.

## Deployment and documentation

The README explains local installation, Discord Developer Portal setup, generation of `AUTH_SECRET`, callback URLs, development commands, tests, and Vercel environment configuration. Deployment is prepared but not performed automatically because the owner must supply the Discord application credentials and final Vercel domain.

