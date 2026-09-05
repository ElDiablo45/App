# Discord Panel

Prueba de concepto para iniciar sesión con Discord y visualizar la información básica que entrega el scope OAuth `identify`. La aplicación utiliza sesiones JWT cifradas, no guarda usuarios y no necesita Supabase.

## Requisitos

- Node.js 20.9 o posterior (recomendado: Node 22)
- npm 10 o posterior
- Una aplicación creada en [Discord Developer Portal](https://discord.com/developers/applications)

## Configuración de Discord

1. Crea una aplicación en Discord Developer Portal.
2. Abre **OAuth2** y añade esta URL a **Redirects** para desarrollo local:

   ```text
   http://localhost:3000/api/auth/callback/discord
   ```

3. Copia el **Client ID** y el **Client Secret**. El secret no debe publicarse ni incluirse en Git.
4. Cuando despliegues en Vercel, añade también:

   ```text
   https://<tu-dominio-vercel>/api/auth/callback/discord
   ```

La aplicación fuerza el scope `identify`. No solicita email, servidores, roles, mensajes ni permisos de bot.

## Desarrollo local

Instala las dependencias:

```powershell
npm install
```

Copia `.env.example` como `.env.local` y completa sus valores:

```dotenv
AUTH_DISCORD_ID=tu_client_id
AUTH_DISCORD_SECRET=tu_client_secret
AUTH_SECRET=un_secreto_aleatorio_largo
```

Puedes generar `AUTH_SECRET` con Node.js:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Después inicia el servidor:

```powershell
npm run dev
```

Abre `http://localhost:3000`, acepta el aviso de datos y pulsa **Continuar con Discord**.

## Comprobaciones

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

## Despliegue en Vercel

1. Importa el repositorio en Vercel como proyecto Next.js.
2. Configura `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET` y `AUTH_SECRET` en **Project Settings → Environment Variables**.
3. Despliega y registra el callback HTTPS definitivo en Discord Developer Portal.
4. Si cambia el dominio, actualiza el callback antes de probar de nuevo el login.

## Datos y límites de esta PoC

- El perfil normalizado vive únicamente en una cookie de sesión JWT cifrada durante un máximo de ocho horas.
- Los tokens OAuth de Discord nunca se copian a la sesión disponible en el navegador.
- Supabase se usa solo como base de datos (tabla `loadouts`); sin él, la app usa datos de ejemplo.
- La futura gestión de servidores requerirá añadir un bot de Discord y solicitar permisos concretos en una fase separada.

## Supabase

El proyecto usa Supabase solo como base de datos (el login sigue en NextAuth + Discord). El servidor accede con `service_role`; esa key jamás va al navegador.

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En **SQL Editor** ejecuta `supabase/migrations/0001_create_loadouts.sql` (crea la tabla `loadouts`, RLS y 4 filas de ejemplo).
3. Copia `.env.example` a `.env.local` y completa:
   ```dotenv
   SUPABASE_URL=https://<tu-proyecto>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```
   La `service_role` está en **Project Settings → API**. No la publiques ni la subas a Git.
4. En Vercel añade `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en **Project Settings → Environment Variables**.
5. Sin estas variables (o si la lectura falla) la app usa datos de ejemplo automáticamente.
