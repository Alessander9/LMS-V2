# Testeo previo al deploy - INSTEIP

**Fecha de ejecución:** 2026-07-24  
**Entorno:** local  
**Frontend:** `http://localhost:4200`  
**Backend usado por las pruebas API:** `http://localhost:8081/api`  
**Base de datos:** PostgreSQL local  
**Objetivo:** consolidar el estado real de las pruebas previas al despliegue y contrastarlo con `docs/QA_TOTAL_SISTEMA.md`, `docs/QA_UNIFICADO.md`, `docs/SPRINT_13_QA.md`, `docs/test_results.md`, `docs/CHECKPOINT_FRONTEND.md`, `docs/contexto.md` y `docs/GUIA_DEPLOY_IONOS.md`.

> Este documento distingue entre pruebas ejecutadas en esta revisión, pruebas históricas documentadas y cobertura pendiente. Un resultado histórico de `100%` no se presenta como evidencia de una ejecución actual.

## 1. Veredicto actual

**Estado: NO APTO todavía para declarar deploy aprobado.**

El backend tiene una base automatizada sólida y las pruebas Maven actuales pasan. La prueba API super test también termina con estado de proceso `0`, pero registra un error real en el flujo de avance que el script deja como aviso. La validación Selenium actual falla en el segundo paso por un selector obsoleto (`.grid`) que ya no corresponde al catálogo actual. El frontend compila correctamente, pero no existe un script `npm test` configurado y no se ejecutó una regresión visual completa por cada rol, vista, botón y flujo.

### Resumen de esta revisión

| Área | Evidencia actual | Estado |
|---|---|---|
| Backend unitario/integración | `./mvnw.cmd test` | **PASS: 53 pruebas, 0 fallos, 0 errores, 0 omitidas** |
| Backend API super test | `scripts/tests/api/backend-api-super-test.js` | **PASS CON INCIDENCIA:** proceso `0`, pero `/api/avance` devuelve `500` por `ultimoSegundo` nulo |
| Frontend build | `npm run build` en `frontend/` | **PASS** |
| Frontend unit tests | `npm test -- --watch=false --browsers=ChromeHeadless` | **NO EJECUTABLE:** `Missing script: "test"` |
| Selenium smoke | `scripts/tests/e2e/selenium-test.js` | **FAIL:** espera `.grid` en catálogo |
| Selenium super test | `scripts/tests/e2e/selenium-super-test.js` | **FAIL:** espera `.grid` en catálogo |
| Cobertura visual completa de botones y vistas | No existe evidencia automatizada completa actual | **PENDIENTE** |
| Regresión por rol completa | No ejecutada en esta revisión | **PENDIENTE** |
| Revisión responsive y accesibilidad completa | No ejecutada con matriz de viewports | **PENDIENTE** |

## 2. Contraste con la documentación existente

### 2.1 `QA_TOTAL_SISTEMA.md`

Define como alcance: público, administrador, alumno y docente; endpoints de autenticación, usuarios, cursos, módulos, videos, materiales, matrículas, avance, certificados, reportes, auditoría, pagos, sistema y configuración; pantallas públicas y dashboards; casos positivos, negativos, permisos, validaciones y consistencia.

La intención de cobertura coincide con este documento. Sin embargo, la ejecución actual no demuestra el 100% de ese alcance porque:

- Selenium se detiene al navegar al catálogo debido al selector `.grid` obsoleto.
- El script API continúa después de un `500` en avance y lo presenta como aviso.
- No hay ejecución actual documentada de todos los botones y vistas por rol.
- El frontend no tiene comando de pruebas unitarias configurado.

### 2.2 `QA_UNIFICADO.md` y `test_results.md`

Ambos documentos registran históricamente 60 casos de backend con `60/60 PASSED`. Esa evidencia debe conservarse como histórico, pero no sustituye la ejecución de esta revisión. La suite Maven actual reporta 53 pruebas automatizadas y pasa completa.

La diferencia debe verificarse antes de publicar un porcentaje de cobertura: el inventario actual de controladores contiene **77 endpoints anotados** distribuidos en **18 controladores**, mientras que los 60 casos históricos no necesariamente representan una prueba individual de cada método HTTP.

### 2.3 `SPRINT_13_QA.md`

Declara cobertura de administrador, alumno, certificados y seguridad, y afirma validación backend con `mvn test` y frontend con una suite E2E. En la ejecución actual se confirma el backend Maven y el build, pero la suite Selenium falla antes de llegar a login y dashboards. Por tanto, las afirmaciones de regresión E2E completa quedan pendientes de actualización.

### 2.4 `CHECKPOINT_FRONTEND.md`

El documento indica que el frontend compila y que se revisaron vistas públicas y dashboards, especialmente tema claro/oscuro. En esta revisión `npm run build` pasa. No se ejecutó una prueba visual completa de tema, responsive, botones y estados de error en todos los dashboards.

### 2.5 `contexto.md`

Confirma los roles `ADMINISTRADOR`, `DOCENTE` y `ALUMNO`, la arquitectura Angular + Spring Boot + PostgreSQL y los flujos académicos principales. Esta información coincide con el inventario actual de rutas y controladores.

## 3. Evidencias ejecutadas

Archivos de salida generados durante esta revisión:

- `run-logs/qa-api-super-current.log`
- `run-logs/qa-selenium-current.log`
- `run-logs/qa-selenium-super-current.log`
- `run-logs/qa-endpoint-inventory-current.txt`

Comandos ejecutados:

```text
backend/./mvnw.cmd test
frontend/npm run build
node scripts/tests/api/backend-api-super-test.js
node scripts/tests/e2e/selenium-test.js
node scripts/tests/e2e/selenium-super-test.js
frontend/npm test -- --watch=false --browsers=ChromeHeadless
```

## 4. Pruebas backend actuales

### 4.1 Suite Maven

Resultado actual:

```text
Tests run: 53, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Suites reportadas:

| Suite | Casos | Resultado |
|---|---:|---|
| `AdministracionControllerTest` | 8 | PASS |
| `AuthControllerTest` | 6 | PASS |
| `ContenidosControllerTest` | 11 | PASS |
| `DashboardsControllerTest` | 5 | PASS |
| `CursoSecurityServiceTest` | 8 | PASS |
| `AuthServiceImplTest` | 5 | PASS |
| `DocenteDashboardServiceImplTest` | 6 | PASS |
| `MaterialServiceImplTest` | 3 | PASS |
| `SystemIntegrationTest` | 1 | PASS |
| **Total** | **53** | **PASS** |

### 4.2 Inventario actual de endpoints

El inventario se obtuvo directamente de los controladores actuales y se guardó en `run-logs/qa-endpoint-inventory-current.txt`.

#### Autenticación

| Método | Endpoint | Cobertura requerida |
|---|---|---|
| POST | `/api/auth/login` | credenciales válidas, inválidas, validación |
| POST | `/api/auth/refresh` | refresh válido, inválido y expirado |
| POST | `/api/auth/logout` | cierre de sesión y revocación |
| GET | `/api/auth/me` | token válido, ausente e inválido |
| POST | `/api/auth/forgot-password` | correo existente/no existente y validación |
| POST | `/api/auth/reset-password` | token válido, inválido, expirado y contraseña inválida |

#### Usuarios y docentes

| Método | Endpoint | Rol principal |
|---|---|---|
| GET | `/api/usuarios` | Administrador |
| GET | `/api/usuarios/docentes` | Administrador |
| GET | `/api/usuarios/docentes/{id}` | Administrador |
| POST | `/api/usuarios/docentes` | Administrador |
| PUT | `/api/usuarios/docentes/{id}` | Administrador |
| DELETE | `/api/usuarios/docentes/{id}` | Administrador |
| PATCH | `/api/usuarios/docentes/{id}/estado` | Administrador |
| GET | `/api/usuarios/{id}` | Administrador |
| POST | `/api/usuarios` | Administrador |
| PUT | `/api/usuarios/{id}` | Administrador |
| DELETE | `/api/usuarios/{id}` | Administrador |
| PATCH | `/api/usuarios/{id}/estado` | Administrador |

#### Cursos y contenidos

| Método | Endpoint |
|---|---|
| GET | `/api/cursos` |
| GET | `/api/cursos/{id}` |
| GET | `/api/cursos/{id}/modulos` |
| POST | `/api/cursos` |
| PUT | `/api/cursos/{id}` |
| DELETE | `/api/cursos/{id}` |
| PATCH | `/api/cursos/{id}/estado` |
| GET | `/api/modulos/{id}` |
| GET | `/api/modulos/{id}/videos` |
| GET | `/api/modulos/{id}/materiales` |
| POST | `/api/modulos` |
| PUT | `/api/modulos/{id}` |
| DELETE | `/api/modulos/{id}` |
| PATCH | `/api/modulos/{id}/estado` |
| GET | `/api/videos` |
| POST | `/api/videos` |
| PUT | `/api/videos/{id}` |
| POST | `/api/videos/{id}/duracion` |
| DELETE | `/api/videos/{id}` |
| PATCH | `/api/videos/{id}/estado` |
| POST | `/api/materiales` |
| PUT | `/api/materiales/{id}` |
| DELETE | `/api/materiales/{id}` |
| PATCH | `/api/materiales/{id}/estado` |
| GET | `/api/materiales/{id}/download` |

#### Matrículas, avance y dashboards

| Método | Endpoint | Rol principal |
|---|---|---|
| POST | `/api/matriculas` | Administrador |
| GET | `/api/matriculas/curso/{cursoId}` | Administrador |
| DELETE | `/api/matriculas/{id}` | Administrador |
| PATCH | `/api/matriculas/{id}/estado` | Administrador |
| POST | `/api/avance` | Alumno/Administrador |
| GET | `/api/avance/video/{id}` | Alumno/Administrador |
| GET | `/api/alumno/dashboard` | Alumno/Administrador |
| GET | `/api/alumno/cursos` | Alumno/Administrador |
| GET | `/api/alumno/certificados` | Alumno/Administrador |
| GET | `/api/alumno/cursos/{id}/play` | Alumno/Administrador |
| GET | `/api/docente/cursos` | Docente/Administrador |
| GET | `/api/docente/cursos/{id}/alumnos` | Docente/Administrador |

#### Certificados, reportes y operación

| Método | Endpoint | Rol principal |
|---|---|---|
| GET | `/api/certificados` | Alumno/Administrador |
| POST | `/api/certificados/generar/{cursoId}` | Alumno/Administrador |
| GET | `/api/certificados/{id}/download` | Alumno/Administrador |
| GET | `/api/certificados/validar/{codigo}` | Público |
| GET | `/api/reportes/alumnos` | Administrador |
| GET | `/api/reportes/matriculas` | Administrador |
| GET | `/api/reportes/cursos` | Administrador |
| GET | `/api/reportes/certificados` | Administrador |
| GET | `/api/auditoria/login` | Administrador |
| GET | `/api/auditoria/login/usuario/{id}` | Administrador |
| GET | `/api/auditoria/eventos` | Administrador |
| GET | `/api/auditoria/eventos/modulo/{modulo}` | Administrador |
| GET | `/api/auditoria/eventos/usuario/{id}` | Administrador |
| GET | `/api/eventos` | Administrador |
| GET | `/api/eventos/modulo/{modulo}` | Administrador |
| GET | `/api/eventos/usuario/{id}` | Administrador |
| GET | `/api/configuracion` | Administrador |
| PUT | `/api/configuracion` | Administrador |
| GET | `/api/pagos/pendientes` | Administrador |
| POST | `/api/pagos/{id}/aprobar` | Administrador |
| POST | `/api/sistema/backup` | Administrador |
| GET | `/api/sistema/status` | Administrador |

### 4.3 Incidencia detectada en API super test

El script `backend-api-super-test.js` crea usuario, curso, módulo y video correctamente. Al guardar avance falla:

```text
POST /api/avance -> HTTP 500
Validation failed ... field 'ultimoSegundo': rejected value [null]
El último segundo es obligatorio
```

El script continúa y termina con código `0`, por lo que su estado final no representa un 100% real. Debe corregirse el payload del test para incluir, como mínimo:

```json
{
  "videoId": 1,
  "porcentajeVisto": 50,
  "ultimoSegundo": 30,
  "completado": false
}
```

Los nombres exactos deben contrastarse con `AvanceProgressRequest.java` antes de cambiar el script. El endpoint debe probarse además con `400` para payload inválido, `401/403` sin autorización y `200` con payload válido.

### 4.4 Riesgo de datos de prueba

El super test API crea registros reales. Durante esta revisión generó, entre otros, un usuario de prueba y un curso de prueba. Además, los archivos de `database/local_data` aparecen modificados en el workspace. No se deben revertir automáticamente porque pueden ser datos del usuario, pero antes del deploy debe limpiarse o aislarse la data de QA y confirmar que no queden usuarios, cursos, módulos, videos o matrículas de prueba.

## 5. Pruebas frontend actuales

### 5.1 Build

```text
npm run build -> PASS
```

El build confirma compilación Angular y copia de assets. No confirma que cada interacción visual funcione en navegador.

### 5.2 Unit tests

El frontend contiene al menos un archivo `inicio.component.spec.ts`, pero `frontend/package.json` no define script `test` ni dependencias/configuración Karma/Jest ejecutable mediante `npm test`.

Resultado:

```text
npm test -- --watch=false --browsers=ChromeHeadless
npm error Missing script: "test"
```

Estado: **PENDIENTE**. Antes del deploy debe definirse una estrategia: configurar Karma/Jasmine para Angular o incorporar un runner aprobado por el proyecto.

### 5.3 Selenium smoke y super test

Ambos scripts parten correctamente de `/inicio` y encuentran el título principal. Ambos fallan al navegar al catálogo porque esperan `.grid`:

```text
Waiting for element to be located By(css selector, .grid)
```

El catálogo actual usa selectores como `.course-grid`, `.course-card`, `.catalog-page` y la ruta también está disponible como `/TodosLosCursos.html`. Por tanto, la prueba está desactualizada y no constituye una falla funcional confirmada del catálogo; sí constituye una falla de la automatización que bloquea la regresión E2E.

El super test también registra una advertencia de navegador por `cdn.tailwindcss.com` y una imagen LCP con `loading="lazy"`. Estas advertencias no bloquearon la prueba, pero deben revisarse antes del deploy.

### 5.4 Vistas públicas a cubrir con Selenium

La matriz mínima debe visitar y validar render, navegación, imágenes, scroll, botones, enlaces, formularios y ausencia de errores de consola en:

- `/inicio`
- `/programas`
- `/recursos`
- `/certificacion`
- `/por-que-elegirnos`
- `/como-aprenderas`
- `/cursos`
- `/TodosLosCursos.html`
- Todas las rutas `/cursos/...` declaradas en `app.routes.ts`
- Login, recuperación y validación pública de certificado

Para cada página se debe validar al menos:

- HTTP/render exitoso.
- Título o encabezado principal visible.
- Imágenes sin `404`.
- Enlaces internos navegables.
- Botones habilitados cuando corresponda.
- Formularios: campos obligatorios, formato inválido y envío válido.
- Scroll vertical sin corte horizontal en `320px`, `375px`, `768px`, `1024px` y desktop.
- No existencia de excepciones JavaScript en consola.

## 6. Flujos por rol

### 6.1 Público

| Flujo | Validaciones |
|---|---|
| Landing | Hero, navegación, CTA, tarjetas, footer y scroll |
| Catálogo | Búsqueda, filtros, ordenamiento, links online/presencial y responsive |
| Detalle de curso | Hero, imágenes, formación completa, plan de estudios, docente, CTA |
| Login | Validación de campos, credenciales inválidas y acceso correcto |
| Recuperación | Solicitud, errores de validación y confirmación |
| Certificado público | Código válido, código inválido y descarga/visualización |

### 6.2 Administrador

Debe ejecutarse con una cuenta de prueba aislada y comprobar tanto UI como respuesta HTTP:

- Login y logout.
- Dashboard y métricas.
- Listado, búsqueda, paginación y ordenamiento de alumnos.
- Crear, editar, activar/desactivar y eliminar alumno.
- Listar, crear, editar, activar/desactivar y eliminar docente.
- Crear, editar, activar/desactivar y eliminar curso.
- Crear, editar, activar/desactivar y eliminar módulo.
- Crear, editar, activar/desactivar y eliminar video.
- Definir duración de video.
- Subir, editar, activar/desactivar, descargar y eliminar material.
- Matricular alumno, listar matriculados, cambiar estado y eliminar matrícula.
- Reportes CSV/PDF disponibles.
- Auditoría de logins y eventos.
- Configuración institucional.
- Pagos pendientes y aprobación.
- Backup manual y estado del sistema.
- Generación de certificado cuando el curso esté completado.
- Cambio de tema, logout, navegación lateral y estados vacíos/errores.

### 6.3 Docente

- Login y logout.
- Dashboard docente.
- Ver únicamente cursos asignados.
- Consultar alumnos y progreso de un curso asignado.
- Crear/editar contenido permitido del curso asignado.
- Subir/editar/descargar material permitido.
- Crear/editar video y duración permitido.
- Confirmar que un docente no puede modificar cursos ajenos ni acceder a módulos ajenos.
- Validar navegación, paginación, modales, mensajes de error y logout.

### 6.4 Alumno

- Login y logout.
- Dashboard del alumno.
- Ver cursos matriculados.
- Abrir reproductor de curso autorizado.
- Reproducir videos.
- Guardar avance con `ultimoSegundo`, porcentaje y completado.
- Recuperar avance y continuar reproducción.
- Descargar materiales autorizados.
- Rechazar acceso a curso no matriculado.
- Ver certificados.
- Generar certificado únicamente al completar el curso.
- Descargar certificado.
- Perfil, edición permitida y cambio de tema.

## 7. Matriz de seguridad y resultados esperados

Ejecutar para cada endpoint protegido y para cada rol:

| Caso | Resultado esperado |
|---|---|
| Sin token | `401` o `403` según configuración documentada |
| JWT inválido | `401` o `403` |
| Token expirado | `401` |
| Alumno en endpoint admin | `403` |
| Docente en endpoint admin | `403` |
| Admin en endpoint permitido | `200`, `201`, `204` según operación |
| Docente en curso ajeno | `403` |
| Alumno en curso no matriculado | `403` |
| Material no autorizado | `403` |
| ID inexistente | `404` |
| Payload inválido | `400` |
| Archivo inválido o demasiado grande | `400` |
| Eliminación de recurso inexistente | `404` o respuesta de negocio definida |

## 8. Pruebas de consistencia y datos

- Ejecutar pruebas sobre una base de datos de QA, no sobre datos personales o productivos.
- Confirmar aislamiento de registros generados por automatización.
- Verificar que una matrícula no se duplique indebidamente.
- Verificar que activar/desactivar no borre relaciones.
- Confirmar que eliminar curso/módulo/video respete las reglas de integridad.
- Confirmar que el avance se asocie al usuario autenticado, no a un ID recibido arbitrariamente.
- Confirmar que el certificado solo se emita al 100%.
- Confirmar que la descarga de materiales y certificados no permita path traversal.
- Confirmar que auditoría registre login, cambios administrativos, matrícula, contenido, pagos y backup.
- Confirmar que backup cree un archivo válido y recuperable.

## 9. Pruebas de calidad frontend

- Build de producción.
- Navegación directa a todas las rutas.
- Recarga de ruta profunda sin pantalla en blanco.
- Pruebas Selenium con selectores actuales.
- Responsive en `320px`, `375px`, `768px`, `1024px` y `1280px`.
- Light mode y dark mode.
- `prefers-reduced-motion`.
- Estados loading, vacío, error y éxito.
- Imágenes locales y externas con fallback o carga controlada.
- Botones sin acciones duplicadas.
- Formularios con foco, labels, errores y teclado.
- Contraste y foco visible.
- Sin scroll horizontal involuntario.
- Sin errores JS de consola.

## 10. Condiciones de aprobación antes de deploy

No aprobar el despliegue hasta cumplir:

- [ ] Corregir el selector `.grid` de Selenium y ejecutar la suite completa.
- [ ] Hacer que el script API falle si cualquier endpoint crítico devuelve error inesperado.
- [ ] Corregir y repetir el caso válido de `/api/avance` incluyendo `ultimoSegundo`.
- [ ] Ejecutar casos negativos y de autorización por cada rol.
- [ ] Ejecutar regresión Selenium de vistas públicas y dashboards.
- [ ] Configurar y ejecutar pruebas unitarias del frontend o documentar formalmente su ausencia.
- [ ] Limpiar los registros y archivos generados por las pruebas.
- [ ] Confirmar que no haya secretos, credenciales de prueba ni datos de QA en el artefacto.
- [ ] Revisar errores y warnings del navegador.
- [ ] Ejecutar build frontend y `./mvnw.cmd test` desde un entorno limpio.
- [ ] Verificar migración/backup y restauración de PostgreSQL.
- [ ] Hacer smoke test post-deploy sobre dominio, SSL, API, login y descarga de archivos.

## 11. Criterio de cierre

El documento podrá marcarse como **APTO PARA DEPLOY** únicamente cuando las condiciones de aprobación estén comprobadas con fecha, comando, resultado y evidencia. Mientras exista un `500` no esperado, una suite E2E detenida o cobertura por rol no ejecutada, el estado debe permanecer **NO APTO**.

## 12. Nota sobre el PDF adjunto

El archivo `docs/Manual_de_Usuario_INSTEIP.pdf` está incluido en la documentación del proyecto. En esta sesión el lector disponible no pudo extraer su contenido, por lo que el contraste detallado se realizó con `docs/manual.html` y los documentos Markdown. El PDF debe revisarse manualmente o convertirse a texto en una herramienta compatible antes del cierre documental definitivo.
