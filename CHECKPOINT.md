# CHECKPOINT — IPEC v3

**Última actualización:** 2026-10-21 (America/Los_Angeles)

## En qué estamos trabajando
Reconstrucción desde cero del sitio y el panel admin de Iglesia Plenitud en Cristo (Next.js + Prisma + PostgreSQL, en Docker local). Reemplaza a `ipec_v2_clean`, que quedó mezclado e inestable.

## Dónde nos quedamos
- **Fase 1 TERMINADA en local, esperando aprobación de Juan** para hacer push a GitHub (`schoolipec/ipec_v3`) y etiquetar `fase-1`.
- Detalle y verificación: `C:\ProgramandoconClaude\Documentacion\IPEC_v3\04-FASE1-ESQUELETO.md`. Capturas: `C:\ProgramandoconClaude\Reportes\IPEC_v3\fase1\`.
- Levantar: `docker compose up -d` → http://localhost:3000 · admin http://localhost:3000/admin

## Tareas
- [x] Requisitos (`01-REQUISITOS.md`) y aclaraciones de Juan
- [x] Decisiones técnicas aprobadas (`02-DECISIONES-TECNICAS.md`)
- [x] Inventario de contenido v2/demo (`03-INVENTARIO-CONTENIDO.md`)
- [x] Fase 1: esqueleto + Docker + BD + 5 idiomas + tema (local)
- [ ] Fase 1: aprobación de Juan → push + etiqueta
- [ ] Fase 2: header (menú Home/About/Pastors/Contact us/Live, banderas, sol/luna) + footer + fondo con ondas
- [ ] Fase 3: páginas + formulario de oración (solo Contact us) + modal de la Biblia (30 s / 12 h / no volver)
- [ ] Fase 4: contenido editable por zonas e idioma (Prisma)
- [ ] Fase 5: admin (login, invitaciones, roles + permisos por casillas, perfil, contenido, pedidos de oración paginados)
- [ ] Fase 6: auditoría + VPS v2.suplenitud.com + prueba real n8n

## Avisos para la próxima sesión
- E: es un SSD USB: si Docker muestra la carpeta vacía, reiniciar Docker Desktop (ver 04-FASE1 → Problemas).
- Commits: `git -c user.name="IPEC Development" -c user.email="jscothserver@gmail.com" commit ...` (el equipo no tiene identidad global).

## Referencias (solo lectura, no modificar)
- v2 (solo referencia visual y de contenido): `C:\ProgramandoconClaude\Proyectos\enProceso\ipec_v2_clean`
- Demo funcional: `C:\ProgramandoconClaude\Proyectos\enProceso\IPEC\demo.suplenitud.com` → https://demo.suplenitud.com
