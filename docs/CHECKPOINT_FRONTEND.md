# Checkpoint Frontend - INSTEIP

Fecha de corte: 2026-07-06

## Objetivo activo

Dejar el frontend consistente en light mode y dark mode, con aplicacion temprana del tema, sin flicker al cargar y con cobertura visual uniforme en las vistas principales del dashboard y paginas publicas clave.

## Estado actual

- El sistema de tema ya funciona de forma global.
- La preferencia se guarda en `localStorage` con la clave `insteip-theme`.
- Si no hay preferencia guardada, se respeta `prefers-color-scheme`.
- La clase `dark` se aplica sobre `<html>`.
- El frontend compila correctamente con `npm run build`.
- El ultimo build paso bien; solo quedo una advertencia de presupuesto en `login.component.css`.

## Archivos base del sistema de tema

- `frontend/src/index.html`
  - Inicializa el tema antes del primer render para evitar flash de modo incorrecto.
- `frontend/src/styles.css`
  - Define fondo global, `color-scheme: dark`, transiciones y utilidades globales.
- `frontend/src/app/core/services/theme.service.ts`
  - Centraliza la logica de lectura, persistencia y conmutacion del tema.

## Vistas ya revisadas y corregidas

### Publicas

- `frontend/src/app/features/auth/login/login.component.css`
- `frontend/src/app/features/certificacion/certificacion.component.html`
- `frontend/src/app/features/validar-certificado/validar-certificado.component.html`
- `frontend/src/app/features/por-que-elegirnos/por-que-elegirnos.component.html`

### Dashboard / panel

- `frontend/src/app/features/dashboard/dashboard.component.html`
- `frontend/src/app/features/dashboard/dashboard-home/dashboard-home.component.html`
- `frontend/src/app/features/dashboard/perfil/perfil.component.html`
- `frontend/src/app/features/dashboard/mis-cursos/mis-cursos.component.html`
- `frontend/src/app/features/dashboard/certificados/certificados.component.html`
- `frontend/src/app/features/dashboard/configuracion/configuracion.component.html`
- `frontend/src/app/features/dashboard/videos/videos.component.html`
- `frontend/src/app/features/dashboard/sistema/sistema.component.html`
- `frontend/src/app/features/dashboard/auditoria/auditoria.component.html`

### Componentes compartidos / soporte visual

- `frontend/src/app/core/components/toast/toast.component.ts`
- `frontend/src/app/core/components/confirm-modal/confirm-modal.component.ts`
- `frontend/src/app/core/utils/subscription.utils.ts`

## Pendientes recomendados

Estas vistas siguen siendo candidatas a una segunda pasada de dark mode para completar cobertura visual del frontend:

- `frontend/src/app/features/dashboard/cursos/cursos.component.html`
- `frontend/src/app/features/dashboard/cursos/curso-detalle/curso-detalle.component.html`
- `frontend/src/app/features/dashboard/alumnos/alumnos.component.html`
- `frontend/src/app/features/dashboard/materiales/materiales.component.html`
- `frontend/src/app/features/dashboard/docente/mis-cursos-docente/mis-cursos-docente.component.html`
- `frontend/src/app/features/dashboard/docente/mis-alumnos-docente/mis-alumnos-docente.component.html`

## Criterio de continuidad

Cuando se retome el trabajo:

1. Buscar clases claras sin variante oscura:
   - `bg-white`
   - `bg-slate-50`
   - `bg-slate-100`
   - `text-slate-900`
   - `text-slate-500`
   - `border-slate-200`
2. Verificar que cada bloque visible tenga su variante `dark:`.
3. Ejecutar `npm run build` en `frontend/` despues de cada tanda grande de cambios.
4. Priorizar primero vistas del dashboard con mayor uso antes que paginas secundarias.

## Comandos utiles

```powershell
cd frontend
npm run build
```

```powershell
rg -n "bg-white|bg-slate-50|bg-slate-100|text-slate-900|text-slate-500|border-slate-200" frontend/src/app/features/dashboard -g "*.html"
```

## Nota importante

`task.md` ya no refleja por completo el estado real del trabajo visual. Este archivo es el checkpoint vigente para continuar con el tema del frontend.
