# Informe de Testeo Previo al Deploy

**Fecha de ejecución final:** 2026-07-24  
**Base:** `docs/testeo_previo_deploy.md`  
**Frontend:** `http://localhost:4200`  
**Backend:** `http://localhost:8081`  
**Resultado actual:** **APTO PARA DEPLOY CON OBSERVACIONES OPERATIVAS**

## Resumen ejecutivo

Se corrigieron y repitieron los bloqueos principales del informe anterior:

- Payload de `/api/avance` corregido.
- Recuperación del avance verificada.
- Selectores Selenium del catálogo actualizados.
- Selenium ejecutado hasta dashboards, roles, certificados y health check.
- Matriz de permisos para administrador, docente y alumno ejecutada.
- Pruebas unitarias frontend configuradas y ejecutadas.
- Limpieza automática incorporada a las pruebas API y E2E.
- Regresión backend, API, frontend unitario y Selenium repetida.

El resultado final de las suites ejecutadas es satisfactorio. Antes de un deploy productivo deben mantenerse las observaciones de seguridad y operación indicadas al final.

## Checklist final

### Entorno

- [x] Backend disponible en `localhost:8081`.
- [x] Frontend compilable.
- [x] PostgreSQL disponible.
- [x] Suite API ejecutada desde datos de prueba.
- [x] Suite Selenium ejecutada desde datos de prueba.
- [x] Datos de prueba creados por API limpiados automáticamente.
- [x] Datos de prueba creados por Selenium limpiados automáticamente.
- [x] Verificación posterior sin usuarios, docentes ni cursos QA residuales.

### Backend Maven

Comando:

```text
backend/./mvnw.cmd test
```

Resultado:

```text
Tests run: 53, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

- [x] `AdministracionControllerTest`: 8/8.
- [x] `AuthControllerTest`: 6/6.
- [x] `ContenidosControllerTest`: 11/11.
- [x] `DashboardsControllerTest`: 5/5.
- [x] `CursoSecurityServiceTest`: 8/8.
- [x] `AuthServiceImplTest`: 5/5.
- [x] `DocenteDashboardServiceImplTest`: 6/6.
- [x] `MaterialServiceImplTest`: 3/3.
- [x] `SystemIntegrationTest`: 1/1.
- [x] Sin fallos, errores ni pruebas omitidas.

Evidencia:

```text
run-logs/qa-backend-final.log
```

### API super test

Comando:

```text
node scripts/tests/api/backend-api-super-test.js
```

- [x] Login de administrador.
- [x] Perfil actual.
- [x] CRUD de usuario de prueba.
- [x] Curso de prueba.
- [x] Módulo de prueba.
- [x] Matrícula de prueba.
- [x] Video de prueba.
- [x] `POST /api/avance` con `videoId` real.
- [x] `ultimoSegundo` obligatorio enviado correctamente.
- [x] Avance recuperado y comparado con el valor guardado.
- [x] Dashboards del alumno.
- [x] Reporte de certificados.
- [x] Validación esperada de certificado no completado (`400`).
- [x] Configuración.
- [x] Estado del sistema.
- [x] Auditoría.
- [x] Fallo crítico devuelve código de proceso diferente de cero.
- [x] Limpieza automática de matrícula, video, módulo, curso y usuario.

Evidencia:

```text
run-logs/qa-api-super-final.log
```

Resultados relevantes:

```text
Avance guardado correctamente.
Avance recuperado y verificado correctamente.
Eliminado recurso de prueba: /matriculas/14
Eliminado recurso de prueba: /videos/34
Eliminado recurso de prueba: /modulos/21
Eliminado recurso de prueba: /cursos/17
Eliminado recurso de prueba: /usuarios/18
```

### Permisos por rol

Comando:

```text
node scripts/tests/api/role-permissions-test.js
```

#### Administrador

- [x] Login: `200`.
- [x] `/api/usuarios`: `200`.
- [x] `/api/configuracion`: `200`.
- [x] `/api/sistema/status`: `200`.

#### Docente

- [x] Login: `200`.
- [x] `/api/docente/cursos`: `200`.
- [x] `/api/usuarios`: `403`.
- [x] `/api/configuracion`: `403`.
- [x] `/api/sistema/status`: `403`.
- [x] `/api/alumno/dashboard`: `403`.

#### Alumno

- [x] Login: `200`.
- [x] `/api/alumno/dashboard`: `200`.
- [x] `/api/alumno/cursos`: `200`.
- [x] `/api/usuarios`: `403`.
- [x] `/api/configuracion`: `403`.
- [x] `/api/sistema/status`: `403`.
- [x] `/api/docente/cursos`: `403`.
- [x] `/api/cursos`: `403`.

#### Sin autenticación

- [x] `/api/usuarios` sin token: `403`.

Evidencia:

```text
run-logs/qa-role-permissions-final.log
```

### Frontend build

Comando:

```text
frontend/npm run build
```

- [x] Bundles generados.
- [x] Assets copiados.
- [x] `index.html` generado.
- [x] Build de producción correcto.

Evidencia:

```text
run-logs/qa-frontend-build-final-2.log
```

### Pruebas unitarias frontend

Se configuró Karma/Jasmine para Angular y se agregó el proveedor de router requerido por `InicioComponent`.

Comando:

```text
frontend/npm test -- --watch=false --browsers=ChromeHeadless --no-progress
```

- [x] Script `npm test` configurado.
- [x] `angular.json` tiene target de pruebas.
- [x] `src/test.ts` configurado.
- [x] `tsconfig.spec.json` configurado.
- [x] Dependencias Karma/Jasmine instaladas.
- [x] `InicioComponent should create`: PASS.
- [x] Total: `1 SUCCESS`.

Evidencia:

```text
run-logs/qa-frontend-unit-final-3.log
```

**Observación:** actualmente existe un único spec frontend. La infraestructura ya está operativa, pero debe ampliarse la cobertura de componentes antes de afirmar cobertura unitaria completa.

### Selenium smoke test

Comando:

```text
node scripts/tests/e2e/selenium-test.js
```

- [x] `/inicio` carga.
- [x] Título principal visible.
- [x] Catálogo carga.
- [x] 13 cursos visibles.
- [x] Pasarela pública de certificado responde.
- [x] Certificado de prueba aparece como verificado.
- [x] Click de verificación corregido para evitar intercepción visual.

Evidencia:

```text
run-logs/qa-selenium-smoke-final-2.log
```

### Selenium super test

Comando:

```text
node scripts/tests/e2e/selenium-super-test.js
```

- [x] Inicio público.
- [x] Catálogo público.
- [x] Login administrador.
- [x] Métricas del dashboard administrador.
- [x] Exportación y CRUD de alumnos.
- [x] Activación/desactivación de alumno.
- [x] CRUD de docente.
- [x] Creación de curso y asignación de docente.
- [x] Edición del curso.
- [x] Creación de módulo.
- [x] Creación de video.
- [x] Subida de material PDF.
- [x] Matrícula de alumno.
- [x] Exportación de matrículas.
- [x] Reporte de certificados.
- [x] Configuración institucional.
- [x] Auditoría.
- [x] Estado del sistema.
- [x] Backup manual.
- [x] Logout administrador.
- [x] Login docente.
- [x] Cursos asignados al docente: 1.
- [x] Consulta de estudiantes del curso docente.
- [x] Logout docente.
- [x] Login alumno.
- [x] KPIs del alumno.
- [x] Inicio/continuación de curso.
- [x] Reproductor de clase.
- [x] Pestañas de información y materiales.
- [x] Descarga de material.
- [x] Guardado de avance al 100%.
- [x] Generación de certificado.
- [x] Código de certificado.
- [x] Descarga de diploma PDF.
- [x] Historial de certificados.
- [x] Perfil y nivel Premium.
- [x] Validación pública de certificado.
- [x] Actuator health `UP`.
- [x] Limpieza automática de curso, alumno y docente Selenium.

Evidencia:

```text
run-logs/qa-selenium-super-fixed-3.log
```

### Correcciones implementadas

- [x] Selector Selenium `.grid` actualizado a `.course-grid` y `.course-card`.
- [x] Selector Selenium del botón de inicio actualizado a `Iniciar`/`Continuar`.
- [x] Click de verificación pública protegido con scroll y fallback JavaScript.
- [x] Payload API de avance corregido con `ultimoSegundo` y `duracionSegundos`.
- [x] Verificación de lectura del avance agregada.
- [x] Super test API ahora falla con código no cero ante error crítico.
- [x] Limpieza automática agregada al super test API.
- [x] Limpieza automática agregada al super test Selenium.
- [x] `AccessDeniedException` mapeada a `403` mediante `GlobalExceptionHandler`.
- [x] Target `test` agregado a Angular.
- [x] Karma/Jasmine configurado.
- [x] Spec inicial corregido con `provideRouter([])`.

## Archivos modificados

```text
backend/src/main/java/com/insteip/backend/domain/exception/GlobalExceptionHandler.java
frontend/angular.json
frontend/package.json
frontend/package-lock.json
frontend/tsconfig.spec.json
frontend/src/test.ts
frontend/src/app/features/inicio/inicio.component.spec.ts
scripts/tests/api/backend-api-super-test.js
scripts/tests/api/role-permissions-test.js
scripts/tests/e2e/selenium-test.js
scripts/tests/e2e/selenium-super-test.js
```

## Validación de limpieza

Se consultó la API después de las ejecuciones y no quedaron registros con los patrones de prueba:

```text
Usuarios test.api.*: 0
Usuarios alumno.selenium.*: 0
Docentes docente.selenium.*: 0
Cursos Curso API Test *: 0
Cursos Curso Selenium *: 0
```

También se eliminaron manualmente tres cursos API históricos que habían quedado de ejecuciones anteriores:

```text
Curso API Test 1784869069997
Curso API Test 1784869232907
Curso API Test 1784870506401
```

## Observaciones antes de producción

- [ ] Ampliar specs unitarios frontend más allá de `InicioComponent`.
- [ ] Ejecutar auditoría de dependencias: `npm install` reportó vulnerabilidades conocidas en dependencias transitivas.
- [ ] Revisar advertencia de `cdn.tailwindcss.com` en runtime y evitar CDN en producción si sigue presente.
- [ ] Revisar advertencia de imagen LCP marcada como `loading="lazy"`.
- [ ] Confirmar que los secretos de producción no coincidan con credenciales de documentación.
- [ ] Ejecutar backup y restauración en el entorno de destino.
- [ ] Ejecutar smoke test post-deploy con dominio y HTTPS.
- [ ] Revisar manualmente archivos modificados en `database/local_data` antes de commit/deploy.

## Decisión

**APTO PARA DEPLOY CON OBSERVACIONES.**

La decisión se basa en que las pruebas automatizadas críticas ejecutadas en esta revisión pasan:

- Backend Maven: PASS.
- API super test: PASS.
- Permisos por rol: PASS.
- Frontend unit test configurado: PASS.
- Frontend build: PASS.
- Selenium smoke: PASS.
- Selenium super test: PASS.
- Limpieza de datos de prueba: PASS.

Las observaciones restantes son de endurecimiento, cobertura adicional y operación de producción; no bloquearon los flujos principales probados.
