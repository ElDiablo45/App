# PoC “Discord Panel”

## Resumen

Crear una aplicación nueva con Next.js, TypeScript y diseño oscuro propio, inspirada en el flujo de Eleven Project: pantalla de acceso, aviso de datos, autenticación con Discord y perfil protegido.

La PoC solicitará únicamente el scope `identify`. No usará Supabase ni otra base de datos; la sesión será stateless y cifrada mediante Auth.js.

## Implementación

- Crear el proyecto con Next.js App Router, TypeScript, Tailwind CSS y npm.
- Implementar:
  - `/`: presentación, explicación de los datos solicitados, checkbox obligatorio y botón “Continuar con Discord”.
  - `/perfil`: página protegida con tarjeta del usuario y botón para cerrar sesión.
  - `/api/auth/[...nextauth]`: endpoints gestionados por Auth.js.
- Configurar el proveedor Discord mediante `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET` y `AUTH_SECRET`.
- Registrar callbacks de Discord para desarrollo local y Vercel.
- Mantener una sesión JWT cifrada de 8 horas. No exponer access token, refresh token ni client secret al navegador.
- Normalizar en un tipo `DiscordProfile` los campos obtenidos: ID, username, nombre visible, avatar, banner/color, idioma, flags públicas, decoración y guild principal. Los campos opcionales se ocultarán cuando Discord no los devuelva.
- Extender los tipos de sesión de Auth.js para que la interfaz reciba únicamente el perfil normalizado.
- Proteger `/perfil`: usuarios sin sesión vuelven al inicio; usuarios autenticados que visiten `/` podrán ir a su perfil.
- Añadir estados claros para carga, OAuth cancelado, configuración ausente y error de autenticación.
- Incluir `.env.example` y README con creación de la aplicación en Discord Developer Portal, variables, callbacks locales y despliegue en Vercel.
- Usar una estética original bajo el nombre provisional “Discord Panel”: fondo oscuro, acento inspirado en el color blurple de Discord, tarjeta responsive y accesible, sin copiar marca o recursos de Eleven Project.

## Interfaces y datos

- Scope OAuth: exclusivamente `identify`; no se solicitarán correo, servidores ni roles.
- El aviso indicará: “Autorizo a Discord Panel a leer y mostrar temporalmente la información básica de mi perfil de Discord”.
- El checkbox solo habilitará el inicio del flujo OAuth; no se presentará como aceptación de términos legales definitivos.
- No habrá API pública propia ni persistencia de usuarios.
- Supabase se reservará para una fase futura que necesite preferencias, configuración por servidor o auditoría.
- La futura administración de servidores requerirá una aplicación/bot de Discord y permisos adicionales, pero no se incluirá en esta PoC.

## Pruebas y aceptación

- Verificar lint, comprobación de tipos y build de producción.
- Probar la normalización de perfiles completos, perfiles sin avatar/banner y campos desconocidos.
- Probar que el botón de acceso permanece deshabilitado hasta aceptar el aviso.
- Probar protección y redirecciones de `/perfil`, cierre de sesión y estados de error.
- Validación manual con una aplicación real de Discord:
  - Discord muestra únicamente el permiso de identidad.
  - El callback inicia sesión correctamente.
  - La tarjeta presenta los datos disponibles.
  - Recargar conserva la sesión y cerrar sesión la elimina.
  - El flujo funciona tanto en localhost como en una URL de Vercel configurada.

## Supuestos

- El repositorio está vacío y no hay compatibilidad previa que conservar.
- Se usará la versión estable y compatible de Next.js/Auth.js disponible al implementar; Auth.js se elige por su soporte de sesiones stateless sin base de datos.
- El despliegue inicial en Vercel quedará documentado y preparado, pero necesita que el propietario configure la aplicación de Discord, sus secretos y la URL definitiva.
- No se crearán textos legales definitivos ni se copiarán imágenes, logotipos o contenido de Eleven Project.
