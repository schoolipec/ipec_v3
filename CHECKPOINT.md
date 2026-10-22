# CHECKPOINT — IPEC v3

**Última actualización:** 2026-10-21 (America/Los_Angeles)

## En qué estamos trabajando
Reconstrucción desde cero del sitio y el panel admin de Iglesia Plenitud en Cristo (Next.js + Prisma + PostgreSQL, en Docker local). Reemplaza a `ipec_v2_clean`, que quedó mezclado e inestable.

## Dónde nos quedamos
- **Fase 1 APROBADA y publicada** en GitHub `schoolipec/ipec_v3` (commit `92dc0cc`, etiqueta `fase-1`).
- Fase 2 APROBADA y publicada (etiqueta `fase-2`).
- Fase 3 APROBADA y publicada (etiqueta `fase-3`). Detalle: `Documentacion\IPEC_v3\06-FASE3-PAGINAS.md`.
- Dominio final cambia a **v3.suplenitud.com**. Imágenes de prueba con nombre `placeholder-*` (una copia por sección).
- **Fase 4 APROBADA y publicada** (commits `f16afcc` + `fb85ce9`, etiqueta `fase-4`). Detalle: `C:\ProgramandoconClaude\Documentacion\IPEC_v3\07-FASE4-CONTENIDO-EN-BD.md`.
- **Fase 5 APROBADA y publicada** (commit `536a909`, etiqueta `fase-5`). Detalle: `C:\ProgramandoconClaude\Documentacion\IPEC_v3\08-FASE5-ADMIN.md`.
- **Fase 6 EN PROGRESO** — VPS Iglesia (179.236.255.48) operativo en `v3.suplenitud.com`.
- **Rediseño admin completado (2026-10-21):** Nueva estructura de rutas `/admin/*` (route group `(protected)`), sidebar colapsable con Lucide, topbar con dropdown de usuario, dark/light mode con next-themes, i18n EN/ES, tablas react-table v8, SecurityPanel con 2FA (TOTP otplib v13) + timeout de sesión. Migración Prisma aplicada (`admin_security_session`). Build limpio verificado.
- ✅ **Migración a Gitea COMPLETA (2026-10-21):**
  - Código: `git.sistemasass.online/jscothserver/ipec-v3` (branch `main`)
  - Docker image: `git.sistemasass.online/jscothserver/ipec-v3:latest` (sha256: `ecf42fce...`)
  - `docker-compose.prod.yml` en VPS iglesia actualizado para usar imagen de Gitea
  - VPS iglesia con login a `git.sistemasass.online` configurado en `/root/.docker/config.json`
  - DockerHub: imagen `soporteyapame/ipec-v3:latest` pendiente de eliminar (después de confirmar estabilidad)
  - GitHub: repo `schoolipec/ipec_v3` pendiente de eliminar (lo dejamos al final)
- ⚠️ Fix Docker login Gitea: usar `-p "PASSWORD"` directo, NO `--password-stdin` desde PowerShell (el pipe corrompe el pass). Además se debe desactivar el flag `must_change_password` del admin: `docker exec -u git gitea gitea admin user must-change-password --unset USERNAME`.
- VPS Iglesia: SSH alias `vps-iglesia`; credenciales en `C:\ProgramandoconClaude\Proyectos\enProceso\IPEC\credenciales de acceso\VPS-Iglesia.md`.
- ⚠️ Tras editar código: `docker compose up -d --force-recreate --renew-anon-volumes app` (Docker en Windows no recarga solo).
- Documentación de cada fase: `C:\ProgramandoconClaude\Documentacion\IPEC_v3\04..07-*.md`. Capturas: `C:\ProgramandoconClaude\Reportes\IPEC_v3\fase1..4\`.
- Levantar: `docker compose up -d` → http://localhost:3000 · admin http://localhost:3000/admin

## Tareas
- [x] Requisitos (`01-REQUISITOS.md`) y aclaraciones de Juan
- [x] Decisiones técnicas aprobadas (`02-DECISIONES-TECNICAS.md`)
- [x] Inventario de contenido v2/demo (`03-INVENTARIO-CONTENIDO.md`)
- [x] Fase 1: esqueleto + Docker + BD + 5 idiomas + tema (local)
- [x] Fase 1: aprobación de Juan → push + etiqueta `fase-1`
- [x] Fase 2: header (menú Home/About/Pastors/Contact us/Live, banderas, sol/luna) + footer + fondo con ondas (local)
- [x] Fase 2: aprobación de Juan → push + etiqueta `fase-2`
- [x] Fase 3: páginas + formulario de oración (solo Contact us) + modal de la Biblia (30 s / 12 h / no volver) (local)
- [x] Fase 3: aprobación de Juan → push + etiqueta `fase-3`
- [x] Fase 4: contenido editable por zonas e idioma (Prisma) (local)
- [x] Fase 4: aprobación de Juan → push + etiqueta `fase-4`
- [x] Fase 5: admin (login, invitaciones, roles + permisos por casillas, perfil, contenido, pedidos de oración paginados) (local)
- [x] Fase 5: aprobación de Juan → push + etiqueta `fase-5`
- [ ] Fase 6: auditoría + VPS v3.suplenitud.com + prueba real n8n
  - [x] Auditoría del código (sin issues de seguridad)
  - [x] Dockerfile.prod (multi-stage) creado
  - [x] docker-compose.prod.yml creado (Traefik + n8n-internal)
  - [x] deploy/README.md + deploy/env.example creados
  - [x] Identificar VPS correcto (179.236.255.48 — VPS Iglesia, NO el de Juan)
  - [x] Credenciales reales subidas al VPS (.env con POSTGRES_PASSWORD, SESSION_SECRET, etc.)
  - [x] DNS: `v3.suplenitud.com` ya cubre con wildcard `* → 179.236.255.48` (confirmado por Juan)
  - [x] Deploy inicial en vps-iglesia (código clonado en /opt/ipec-v3/app)
  - [x] Fix Dockerfile.prod — copiar `node_modules` completo (Prisma v6 tiene deps externas profundas)
  - [x] Fix Traefik — agregar entradas en `/opt/n8n/traefik/dynamic.yml` (Traefik usa file provider, no labels Docker)
  - [x] Verificar `https://v3.suplenitud.com/api/health` → `{"ok":true,"database":true}` ✓
  - [x] Imagen subida a DockerHub: `soporteyapame/ipec-v3:latest`
  - [x] VPS actualizado para usar imagen de DockerHub (sin rebuild)
  - [x] Migración a Gitea: código en `git.sistemasass.online/jscothserver/ipec-v3`, imagen en `git.sistemasass.online/jscothserver/ipec-v3:latest`
  - [x] docker-compose.prod.yml en VPS iglesia actualizado para usar imagen Gitea
  - [ ] Eliminar imagen DockerHub `soporteyapame/ipec-v3:latest` (pendiente confirmar estabilidad)
  - [ ] Eliminar repo GitHub `schoolipec/ipec_v3` (explícitamente al final)
  - [ ] Prueba real del webhook n8n (formulario petición de oración → Telegram)

## Panel admin v2 (2026-10-21) — en local, SIN desplegar
- Hecho y probado en navegador (dev en :3001): logo según tema (`logo-white` oscuro / `logo-transparent` claro), título "Iglesia / Plenitud en Cristo" sobre el menú, topbar sin "Panel /".
- Idioma del panel: por defecto EN, se guarda en `localStorage` (`ipec_admin_lang`). Ya no está en el perfil ni en BD (se quitó `User.adminLocale`).
- Inicio: analítica de visitas (`PageVisit`), sin IP: visitante = hash diario. País = cabecera CDN si existe; si no, región de `Accept-Language` (aproximado). Bots y redirecciones no cuentan.
- Pedidos de oración: filtro por estado, búsqueda por nombre en servidor, paginación real (15), cambio de estado (`PrayerStatus`).
- Usuarios: diálogo de edición (nombre, correo, rol, teléfono, WhatsApp, Telegram chat ID, avisos). ADMIN no edita SUPERADMIN.
- Perfil: rediseñado en secciones; campos de contacto y Telegram; avisos por Telegram / correo.
- Migración local: `20261021230000_admin_v2_visitas_contacto_estado` (aplicada en BD local; NO en VPS).
- Idioma: si nunca se eligió, detecta el idioma del navegador al entrar; el selector de la topbar guarda la preferencia.
- Usuarios: ADMIN no ve SUPERADMIN (lista y edición).
- `adminLocale` se CONSERVA (obsoleto) para poder revertir; se quita en una publicación posterior.
- País: IP del visitante -> geoip-lite (solo búsqueda, la IP no se guarda). `cf-ipcountry` tiene prioridad si hay CDN.
- n8n: endpoint `/api/internal/prayer-recipients` (header `x-internal-token` = `N8N_INTERNAL_TOKEN`). Falta conectar el flujo v2 (instancia de la iglesia, no accesible desde el MCP actual).
- Pendiente: ruta **Mails** (Mailcow, peticiones@suplenitud.com). Credenciales IMAP/SMTP NO están en la carpeta IPEC (solo VPS-Iglesia.md).
- Deuda: reglas `react-hooks/set-state-in-effect` (lint) en hidratación de localStorage; mismo patrón ya existía en ProtectedShell/ContentEditor.

## Estado final del panel v3 (2026-10-22)
- Desplegado en v3.suplenitud.com con imagen de Gitea. Migraciones aplicadas (MediaAsset, estados Recibida/Descargada, datos de contacto, PageVisit).
- Correo de invitación: enviado con SMTP (variables SMTP_* copiadas de la demo). Probado en producción.
- Correo de peticiones: HTML con el diseño del PDF, por n8n (flujo v2 activo, un solo envío a peticiones@ con copia oculta a administradores).
- Ruta Correo (ADMIN y SUPERADMIN): recibidos y enviados, leer, responder, redactar, eliminar y adjuntos. Usa MAIL_HOST/MAIL_USER/MAIL_PASS.
- Pendiente recomendado: cambiar MAIL_PASS por una contraseña de aplicación de Mailcow (la actual es la contraseña principal del buzón).
- Pendiente: limpiar datos de prueba de producción (pedidos "Prueba", invitación de prueba eliminada, correos de prueba en Enviados) al pasar a suplenitud.com.
- Deuda: reglas set-state-in-effect del lint (hidratación de localStorage).

## Avisos para la próxima sesión
- E: es un SSD USB: si Docker muestra la carpeta vacía, reiniciar Docker Desktop (ver 04-FASE1 → Problemas).
- Commits: `git -c user.name="IPEC Development" -c user.email="jscothserver@gmail.com" commit ...` (el equipo no tiene identidad global).

## Referencias (solo lectura, no modificar)
- v2 (solo referencia visual y de contenido): `C:\ProgramandoconClaude\Proyectos\enProceso\ipec_v2_clean`
- Demo funcional: `C:\ProgramandoconClaude\Proyectos\enProceso\IPEC\demo.suplenitud.com` → https://demo.suplenitud.com

## Publicación 2026-10-22 — acceso del panel (login, recuperar y nueva contraseña)
- [x] Login con logo recortado (`public/assets/logo-white-login.png`), formulario a la altura de la línea roja (14vh), sin "Panel administrativo", tarjeta opaca con degradado de las ondas.
- [x] Recuperar contraseña (`/admin/forgot`) y nueva contraseña (`/admin/reset/[token]`), enlace de un solo uso que vence en 1 h (tabla `PasswordReset`, migración `20261022040000_password_reset`).
- [x] Mostrar/ocultar contraseña (ícono de ojo).
- [x] Espacio entre logo y formulario reducido (logo recortado + margen 24 px).
- [x] Idioma en las pantallas de acceso: selector EN/ES en la esquina de la tarjeta; inglés por defecto; la preferencia se guarda en `ipec_admin_lang` y se comparte con el panel.
- [x] Revisado en escritorio (1920×1040) y celular (390×844): sin desplazamiento horizontal.
- [x] `tsc --noEmit` sin errores.
- [x] Commit `cbcd80e` + push a Gitea (`gitea/main`), NO GitHub.
- [x] Imagen Docker `git.sistemasass.online/jscothserver/ipec-v3:latest` construida y subida (digest `sha256:e60c8f0c…`).
- [x] Despliegue en VPS Iglesia (`179.236.255.48`) 2026-10-22: respaldo previo en `BackupsProyectosIPEC_v3ipec-2026-10-22-pre-deploy.sql`; imagen enviada por SSH (`docker save | docker load`), app recreada; migración `password_reset` aplicada.
- [x] Verificación HTTP: /api/health OK; /admin/login 200 (EN); /admin/forgot 200; /admin/reset/x 200; /es 200.
- [ ] Pruebas funcionales de Juan: correo de invitación, cambio de contraseña, peticiones de oración, PDF.
- [ ] Pendiente técnico: `EACCES` al escribir `/app/.next/cache` (la imagen corre como `nextjs` y la carpeta es de root). No rompe la app; solo impide cachear imágenes. Corregir en Dockerfile.prod con chown y republicar.
- [ ] Limpieza de datos de prueba en producción (pendiente; pedir lista exacta a Juan).

### Deuda conocida (lint, no bloquea build)
- `react-hooks/set-state-in-effect` en AdminLangContext, AdminSidebar, AdminTopbar, ContentEditor, MailsPanel, PrayerTable, ProtectedShell (hidratación de localStorage). Ya existía; no tocar sin pedirlo.
- Warnings de `no-unused-vars` en logout, export-quelea, users route y ContentEditor; `incompatible-library` de TanStack Table en UsersPanel.

## Versículos del día y orden de contacto (2026-10-22, local, SIN publicar)
- [x] Página de contacto: formulario de oración primero (antes el mapa). Revisado en escritorio y 390 px.
- [x] Modelo `BibleVerse` (libro, capítulo, versículo, idioma, traducción, referencia, texto). Migración `20261022050000_bible_verses`.
- [x] 31 versículos (uno por día) en 5 idiomas = 155 filas en `prisma/data/bible-verses.json`, descargadas de Bolls Bible API.
  - es: RV1960 · en: KJV · pt: ARA · de: LUT · ko: KRV (개역한글)
- [x] Seed carga los versículos sin duplicar (`[seed] versículos: 155 definidos, 0 nuevos` en la segunda corrida).
- [ ] Licencias: RV1960 (Sociedades Bíblicas Unidas) y ARA (Sociedade Bíblica do Brasil) tienen copyright. Verificar permiso o límite de uso antes de publicar. KJV y KRV de dominio público.
- [ ] Mostrar el versículo del día en el sitio (rotación por fecha, zona America/Los_Angeles).
- [ ] Publicar (commit, push a Gitea, imagen y despliegue) cuando Juan lo apruebe.
- Nota dev: `/contact` (sin prefijo) da bucle de redirección en `127.0.0.1:3001` tras el cambio de Prisma; producción responde bien. Probar con reinicio del dev server cuando convenga.

## Modal de versículos desde la BD y correo de peticiones (2026-10-22, local + n8n en producción)
- [x] `BibleModal` pide el versículo a `/api/verse-of-day?locale=xx` justo antes de mostrarse (a los 30 s). Si no hay versículo, el modal no aparece.
- [x] Idioma: el del visitante; si falta, inglés (regla de Juan). Día según fecha de Los Ángeles (`src/server/verse-of-day.ts`).
- [x] Probado en producción local (imagen de producción contra la BD de desarrollo): 5 idiomas responden; modal muestra "2 Corintios 5:17" (22 de octubre) en español.
- [x] Limpieza de traducciones en inglés: notas del traductor de KJV y encabezado del Salmo 119 eliminados del archivo de datos y de la BD de desarrollo.
- [x] Correo de peticiones (n8n `IPEC - Prayer request delivery v2`): texto plano con fecha en español (`setLocale('es')`) y sin el campo `adminPanelText` que no existía. Activo; respaldo antes del cambio en `BackupsProyectos\IPEC_v3\n8n\prayer-delivery-v2-antes-2026-10-22.json`.
- [ ] Confirmar con una petición real de prueba que la fecha sale en español (no hay prueba automática).
- [ ] Publicar la aplicación (modal, versículos, orden de contacto) en v3.suplenitud.com cuando Juan apruebe.
- Nota dev: el contenedor de desarrollo tuvo problemas de caché de Prisma/Turbopack al agregar modelos. La imagen de producción no tiene ese problema.

## Despliegue 2026-10-22 ~17:50 (v3.suplenitud.com) — imagen 6f4fa0d
- [x] Respaldo previo: `BackupsProyectos\IPEC_v3\ipec-2026-10-22-pre-versiculos.sql`.
- [x] Imagen `sha256:c749fcc…` enviada por SSH y publicada en Gitea; app recreada; migración `bible_verses` y seed (155 versículos).
- [x] Verificado: /api/health OK; /api/verse-of-day en es/en/pt/de/ko; /contact, /es/contact, /pt, /ko, /de, /admin/login, /admin/forgot, /admin/reset 200; logs sin errores (sin EACCES).
- [x] Modal de versículos en producción: aparece a los 30 s con "2 Corintios 5:17".
- [x] Contacto: formulario primero en celular (producción).
- [x] Login en inglés por defecto (producción).
- [x] Correo de peticiones (n8n): texto plano con fecha en español; flujo activo.
- [ ] Prueba real: correo de invitación (falta dirección de prueba de Juan).
- [ ] Prueba real: cambio de contraseña (enlace a un correo de prueba).
- [ ] Prueba real: petición de oración (correo a peticiones@, Telegram, PDF).
- [ ] Limpieza de datos de prueba en producción (lista por confirmar).

## Correos y PDF (2026-10-22) — en preparación para despliegue
- [x] Invitación: "El Pastor Mario Alsina te invita…" (sin el nombre de quien la envía), idioma elegido en el panel (inglés por defecto), fondo de ondas y logo grande como el login.
- [x] Recuperación de contraseña: mismo diseño y en el idioma de la pantalla desde la que se pide.
- [x] Página de invitación: mismo diseño del login (fondo, logo grande, selector EN/ES).
- [x] PDF de peticiones: nombre "Peticiones MM-DD-YYYY.pdf" (fecha de Los Ángeles).
- [x] Remitente de todos los correos: "Iglesia Plenitud en Cristo <no-reply@suplenitud.com>" (app por defecto, n8n de peticiones y panel de Correo con nombre).
- [x] Causa de "no llegó el correo de peticiones": Mailcow aplica límite de envíos a no-reply@ (451 Ratelimit) tras las pruebas seguidas. Pendiente: ajustar ese límite en Mailcow o esperar la ventana.
- [ ] SMTP_FROM en el .env de producción debe ser "Iglesia Plenitud en Cristo <no-reply@suplenitud.com>".

## Limpieza y despliegue de correos (2026-10-22, tarde)
- [x] Despliegue: imagen con remitente "Iglesia Plenitud en Cristo <no-reply@suplenitud.com>" (SMTP_FROM en .env de producción). Health OK; páginas 200.
- [x] Limpieza en producción (BD): 4 peticiones de oración de prueba, 22 visitas de prueba, 2 invitaciones de prueba. Respaldo previo: `ipec-2026-10-22-pre-correos.sql` en BackupsProyectos.
- [x] Usuario SUPERADMIN (jscothserver@gmail.com) se conserva.
- [x] Buzón no-reply@: 0 mensajes, sin carpeta de enviados. El envío por SMTP no guarda copias en Mailcow; no hay que borrar ni configurar nada.
- [ ] Buzón peticiones@: lo borra Juan.
- [ ] Mailcow: límite de envíos de no-reply@ (451 Ratelimit) — ajustar si vuelve a fallar.
- [x] Permisos de roles: ADMIN no puede invitar ni asignar SUPERADMIN, ni cambiar su propio rol (servidor y UI).
