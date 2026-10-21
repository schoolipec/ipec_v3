# CHECKPOINT — IPEC v3

**Última actualización:** 2026-10-21 (America/Los_Angeles)

## En qué estamos trabajando
Reconstrucción desde cero del sitio y el panel admin de Iglesia Plenitud en Cristo (Next.js + Prisma + PostgreSQL, en Docker local). Reemplaza a `ipec_v2_clean`, que quedó mezclado e inestable.

## Dónde nos quedamos
- **Fase 1 APROBADA y publicada** en GitHub `schoolipec/ipec_v3` (commit `92dc0cc`, etiqueta `fase-1`).
- Fase 2 APROBADA y publicada (etiqueta `fase-2`).
- **Fase 3 TERMINADA en local, esperando aprobación de Juan** para push + etiqueta `fase-3`. Detalle: `Documentacion\IPEC_v3\06-FASE3-PAGINAS.md`. Capturas: `Reportes\IPEC_v3\fase3\`. Pregunta abierta: foto del grupo repetida en el Home.
- ⚠️ Tras editar código: `docker compose up -d --force-recreate --renew-anon-volumes app` (Docker en Windows no recarga solo).
- Detalle y verificación: `C:\ProgramandoconClaude\Documentacion\IPEC_v3\04-FASE1-ESQUELETO.md`. Capturas: `C:\ProgramandoconClaude\Reportes\IPEC_v3\fase1\`.
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
- [ ] Fase 3: aprobación de Juan → push + etiqueta `fase-3`
- [ ] Fase 4: contenido editable por zonas e idioma (Prisma)
- [ ] Fase 5: admin (login, invitaciones, roles + permisos por casillas, perfil, contenido, pedidos de oración paginados)
- [ ] Fase 6: auditoría + VPS v2.suplenitud.com + prueba real n8n

## Avisos para la próxima sesión
- E: es un SSD USB: si Docker muestra la carpeta vacía, reiniciar Docker Desktop (ver 04-FASE1 → Problemas).
- Commits: `git -c user.name="IPEC Development" -c user.email="jscothserver@gmail.com" commit ...` (el equipo no tiene identidad global).

## Referencias (solo lectura, no modificar)
- v2 (solo referencia visual y de contenido): `C:\ProgramandoconClaude\Proyectos\enProceso\ipec_v2_clean`
- Demo funcional: `C:\ProgramandoconClaude\Proyectos\enProceso\IPEC\demo.suplenitud.com` → https://demo.suplenitud.com
