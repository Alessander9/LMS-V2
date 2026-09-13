# QA Total del Sistema INSTEIP

## Propósito

Este documento define el plan de QA y pruebas integrales para validar el sistema INSTEIP al 100%:

- Frontend completo con Selenium.
- Backend completo con pruebas de API y reglas de negocio.
- Cobertura por roles.
- Cobertura por pantallas, endpoints y flujos críticos.
- Cobertura de casos felices, negativos, permisos, validaciones y consistencia de datos.

El objetivo es que cualquier cambio importante pueda validarse con una sola guía de ejecución.

## Alcance

Este plan cubre:

- Público.
- Administrador.
- Alumno.
- Docente.
- Endpoints de autenticación, usuarios, cursos, módulos, videos, materiales, matrículas, avance, certificados, reportes, auditoría, pagos, sistema y configuración.
- Pantallas públicas y de dashboard.
- Regresión funcional y de seguridad.
- Flujos manuales y automatizados.

## Fuentes de automatización existentes

- [super-test.js](file:///c:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/scripts/tests/e2e/super-test.js)
- [selenium-test.js](file:///c:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/scripts/tests/e2e/selenium-test.js)
- [selenium-super-test.js](file:///c:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/scripts/tests/e2e/selenium-super-test.js)
- [backend/src/test/java/com/insteip/backend/SystemIntegrationTest.java](/C:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/backend/src/test/java/com/insteip/backend/SystemIntegrationTest.java)
- [backend/src/test/java/com/insteip/backend/controller/ContenidosControllerTest.java](/C:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/backend/src/test/java/com/insteip/backend/controller/ContenidosControllerTest.java)
- [backend/src/test/java/com/insteip/backend/controller/AdministracionControllerTest.java](/C:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/backend/src/test/java/com/insteip/backend/controller/AdministracionControllerTest.java)

## Entornos requeridos

| Componente | Requisito |
|---|---|
| Backend | Java, Maven Wrapper, base de datos configurada |
| Frontend | Node.js, Angular CLI o scripts del proyecto |
| Selenium | Google Chrome instalado y `selenium-webdriver` disponible |
| Playwright | `playwright` instalado y navegador Chrome disponible |
| Datos semilla | Usuarios, cursos, módulos, certificados, matrículas y archivos de prueba |

## Comandos de ejecución

| Objetivo | Comando |
|---|---|
| Compilar frontend | `npm run build` |
| Ejecutar tests backend | `./mvnw test -q` |
| Ejecutar smoke UI con Selenium | `node scripts/tests/e2e/selenium-test.js` |
| Ejecutar super test visual (Playwright) | `node scripts/tests/e2e/super-test.js` |
| Ejecutar súper test completo Selenium | `node scripts/tests/e2e/selenium-super-test.js` |

## Roles y expectativas

| Rol | Permisos esperados |
|---|---|
| Público | Ver landing, cursos públicos, programas, recursos, certificación pública y validación de certificado |
| ALUMNO | Ver su dashboard, sus cursos, avance, materiales permitidos, certificados propios y perfil |
| DOCENTE | Ver cursos asignados, alumnos de sus cursos, contenido de sus cursos y gestión permitida |
| ADMINISTRADOR | Acceso total administrativo, gestión de alumnos, docentes, cursos, configuración, auditoría, sistema y reportes |

## Reglas globales de negocio

| Regla | Esperado |
|---|---|
| Un usuario inactivo no debe autenticarse | Denegar login o acceso según configuración de seguridad |
| Un docente solo ve y manipula cursos asignados | Denegar acceso a recursos ajenos |
| Un alumno solo accede a cursos matriculados | Denegar contenido no matriculado |
| Los contenidos inactivos no deben descargarse ni visualizarse como activos | Respuesta de error o bloqueo |
| Los certificados deben validarse públicamente por código | Validación debe coincidir con el registro emitido |
| El administrador puede reactivar usuarios desactivados | Debe mostrarse el usuario inactivo en listados |
| El filtro por fecha debe conservar orden estable por página | Backend debe ordenar y paginar, no solo el frontend |

## Cobertura backend por módulos

### Autenticación

| Método | Endpoint | Validación |
|---|---|---|
| POST | `/api/auth/login` | Credenciales válidas e inválidas, token, rol, estado, bloqueo por intentos |
| POST | `/api/auth/refresh` | Renovación de token con sesión válida |
| POST | `/api/auth/logout` | Cierre seguro y revocación esperada |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| POST | `/api/auth/forgot-password` | Flujo de recuperación por correo |
| POST | `/api/auth/reset-password` | Token válido, token inválido, contraseña válida |

### Usuarios y docentes

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/usuarios` | Lista de alumnos con paginación, búsqueda, sort e inactivos según parámetro |
| GET | `/api/usuarios/{id}` | Detalle de alumno |
| POST | `/api/usuarios` | Crear alumno con DTO válido |
| PUT | `/api/usuarios/{id}` | Editar alumno existente |
| PATCH | `/api/usuarios/{id}/estado` | Activar/desactivar alumno |
| GET | `/api/usuarios/docentes` | Lista paginada de docentes con búsqueda y orden |
| GET | `/api/usuarios/docentes/{id}` | Detalle de docente |
| POST | `/api/usuarios/docentes` | Crear docente |
| PUT | `/api/usuarios/docentes/{id}` | Editar docente |
| PATCH | `/api/usuarios/docentes/{id}/estado` | Activar/desactivar docente |

### Cursos

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/cursos` | Listado paginado y buscable |
| GET | `/api/cursos/{id}` | Detalle de curso con seguridad por rol |
| GET | `/api/cursos/{id}/modulos` | Módulos del curso |
| POST | `/api/cursos` | Crear curso con suscripciones y docente opcional |
| PUT | `/api/cursos/{id}` | Editar curso |
| PATCH | `/api/cursos/{id}/estado` | Activar/desactivar curso |

### Módulos

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/modulos/{id}` | Detalle de módulo |
| GET | `/api/modulos/{id}/videos` | Videos paginados por módulo, búsqueda y sort |
| GET | `/api/modulos/{id}/materiales` | Materiales paginados por módulo, búsqueda y sort |
| POST | `/api/modulos` | Crear módulo |
| PUT | `/api/modulos/{id}` | Editar módulo |
| PATCH | `/api/modulos/{id}/estado` | Activar/desactivar módulo |

### Videos

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/videos` | Listado general paginado para admin |
| POST | `/api/videos` | Crear video con módulo, URL de YouTube y orden |
| PUT | `/api/videos/{id}` | Editar video |
| PATCH | `/api/videos/{id}/estado` | Activar/desactivar video |

### Materiales

| Método | Endpoint | Validación |
|---|---|---|
| POST | `/api/materiales` | Subir archivo multipart |
| PUT | `/api/materiales/{id}` | Editar material y reemplazar archivo opcionalmente |
| PATCH | `/api/materiales/{id}/estado` | Activar/desactivar material |
| GET | `/api/materiales/{id}/download` | Descarga protegida por rol, matrícula y estado |

### Matrículas

| Método | Endpoint | Validación |
|---|---|---|
| POST | `/api/matriculas` | Matricular alumno en curso |
| GET | `/api/matriculas/curso/{cursoId}` | Ver alumnos matriculados |
| PATCH | `/api/matriculas/{id}/estado` | Reactivar o dar de baja matrícula |

### Avance de reproducción

| Método | Endpoint | Validación |
|---|---|---|
| POST | `/api/avance` | Guardar progreso, porcentaje y estado de completado |
| GET | `/api/avance/video/{id}` | Recuperar avance de un video |

### Certificados

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/certificados` | Listado paginado, búsqueda, orden por fecha |
| POST | `/api/certificados/generar/{cursoId}` | Generación de certificado |
| GET | `/api/certificados/{id}/download` | Descarga PDF |
| GET | `/api/certificados/validar/{codigo}` | Validación pública por código |

### Reportes

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/reportes/alumnos` | CSV de alumnos |
| GET | `/api/reportes/matriculas` | CSV de matrículas |
| GET | `/api/reportes/cursos` | CSV de cursos |
| GET | `/api/reportes/certificados` | CSV de certificados |

### Auditoría y eventos

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/auditoria/login` | Auditoría de login |
| GET | `/api/auditoria/login/usuario/{id}` | Auditoría por usuario |
| GET | `/api/auditoria/eventos` | Eventos del sistema |
| GET | `/api/auditoria/eventos/modulo/{modulo}` | Eventos por módulo |
| GET | `/api/auditoria/eventos/usuario/{id}` | Eventos por usuario |
| GET | `/api/eventos` | Eventos del sistema |
| GET | `/api/eventos/modulo/{modulo}` | Eventos por módulo |
| GET | `/api/eventos/usuario/{id}` | Eventos por usuario |

### Configuración y sistema

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/configuracion` | Obtener configuración institucional |
| PUT | `/api/configuracion` | Actualizar configuración |
| GET | `/api/sistema/status` | Estado del sistema |
| POST | `/api/sistema/backup` | Ejecutar backup |
| GET | `/actuator/health` | Salud |
| GET | `/actuator/metrics` | Métricas |

### Pagos

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/pagos/pendientes` | Pagos pendientes |
| POST | `/api/pagos/{id}/aprobar` | Aprobar pago y activar suscripción |

### Dashboard de alumno y docente

| Método | Endpoint | Validación |
|---|---|---|
| GET | `/api/alumno/dashboard` | Métricas del alumno |
| GET | `/api/alumno/cursos` | Cursos inscritos |
| GET | `/api/alumno/certificados` | Certificados propios |
| GET | `/api/alumno/cursos/{id}/play` | Estructura y avance del curso |
| GET | `/api/docente/cursos` | Cursos asignados al docente |
| GET | `/api/docente/cursos/{id}/alumnos` | Alumnos del curso asignado |

## Cobertura frontend por pantallas

### Públicas

| Ruta | Qué validar |
|---|---|
| `/inicio` | Hero, portada, CTA, layout responsive |
| `/programas` | Listado de programas y navegación |
| `/recursos` | Recursos públicos |
| `/certificacion` | Flujo de certificación |
| `/por-que-elegirnos` | Sección informativa |
| `/cursos` | Catálogo público |
| `/cursos/:id` | Detalle público de curso |
| `/login` | Formulario, validaciones y recuperación de contraseña |
| `/certificados/validar/:codigo` | Validación pública del certificado |

### Dashboard de administrador

| Ruta | Qué validar |
|---|---|
| `/dashboard` | Home administrativo, métricas, tarjetas y accesos |
| `/dashboard/alumnos` | Listado, búsqueda, paginación, sort, activar/desactivar, crear/editar |
| `/dashboard/docentes` | Crear, listar, editar, activar/desactivar docentes |
| `/dashboard/cursos` | Crear, listar, editar, asignar docente, activar/desactivar |
| `/dashboard/cursos/:id` | Detalle, módulos, matrículas, edición, docente asignado |
| `/dashboard/modulos/:id/videos` | CRUD de videos del módulo |
| `/dashboard/modulos/:id/materiales` | CRUD de materiales del módulo |
| `/dashboard/certificados` | Lista, búsqueda, paginación, sort, exportación |
| `/dashboard/auditoria` | Auditoría de login y eventos |
| `/dashboard/sistema` | Estado, backup y métricas |
| `/dashboard/configuracion` | Configuración institucional |
| `/dashboard/perfil` | Perfil de admin |

### Dashboard de docente

| Ruta | Qué validar |
|---|---|
| `/dashboard/mis-cursos-docente` | Cursos asignados, búsqueda, sort, paginación |
| `/dashboard/mis-alumnos-docente/:id` | Alumnos del curso asignado |
| `/dashboard/cursos/:id` | Detalle del curso permitido al docente |
| `/dashboard/modulos/:id/videos` | Gestión de videos permitidos |
| `/dashboard/modulos/:id/materiales` | Gestión de materiales permitidos |

### Dashboard de alumno

| Ruta | Qué validar |
|---|---|
| `/dashboard` | Home del alumno |
| `/dashboard/mis-cursos` | Cursos matriculados, búsqueda, sort, paginación |
| `/dashboard/perfil` | Métricas, cursos recientes, paginación local consistente |
| `/dashboard/cursos-play/:id` | Reproducción, avance, bloqueo de contenido no matriculado |
| `/dashboard/certificados` | Certificados propios |

## Casos de prueba Selenium para frontend

### Smoke básico

| ID | Flujo | Resultado esperado |
|---|---|---|
| UI-01 | Abrir landing | Render completo sin errores visibles |
| UI-02 | Abrir cursos públicos | Tarjetas visibles y navegación funcional |
| UI-03 | Validar certificado público | Mensaje de certificado válido o inválido según código |
| UI-04 | Login admin | Acceso al dashboard administrativo |
| UI-05 | Login alumno | Acceso al dashboard de alumno |

### Admin

| ID | Flujo | Resultado esperado |
|---|---|---|
| UI-10 | Abrir dashboard | Tarjetas, stats y menú lateral visibles |
| UI-11 | Listar alumnos | Tabla, búsqueda, paginación y sort |
| UI-12 | Crear alumno | Guardado correcto y toast de éxito |
| UI-13 | Editar alumno | Persistencia de cambios |
| UI-14 | Desactivar alumno | El alumno sigue visible para reactivación |
| UI-15 | Listar docentes | Tabla con búsqueda, paginación y sort |
| UI-16 | Crear docente | Guardado correcto |
| UI-17 | Editar docente | Persistencia de cambios |
| UI-18 | Desactivar docente | Cambio de estado visible |
| UI-19 | Listar cursos | Búsqueda, paginación, sort y docente asignado |
| UI-20 | Crear curso | Guardado con docente y niveles |
| UI-21 | Editar curso | Persistencia de asignación docente |
| UI-22 | Abrir detalle de curso | Módulos, matrículas y contenido visibles |
| UI-23 | Abrir videos del módulo | CRUD y paginación correcta |
| UI-24 | Abrir materiales del módulo | CRUD y paginación correcta |
| UI-25 | Listar certificados | Tabla, búsqueda, paginación y exportación |
| UI-26 | Ver auditoría | Registros visibles y consistentes |
| UI-27 | Ver sistema | Estado y backup visibles |
| UI-28 | Configuración | Guardar cambios y persistir |

### Docente

| ID | Flujo | Resultado esperado |
|---|---|---|
| UI-30 | Abrir mis cursos | Ver solo cursos asignados |
| UI-31 | Buscar curso asignado | Filtrado correcto |
| UI-32 | Abrir detalle de curso asignado | Ver solo contenido permitido |
| UI-33 | Ver alumnos del curso | Solo alumnos del curso |
| UI-34 | Crear video en curso asignado | Video persistido |
| UI-35 | Editar video | Persistencia de edición |
| UI-36 | Desactivar video | Cambio visible |
| UI-37 | Subir material | Archivo descargable |
| UI-38 | Editar material | Persistencia de edición |
| UI-39 | Desactivar material | Cambio visible |
| UI-40 | Intentar abrir curso no asignado | Acceso denegado |

### Alumno

| ID | Flujo | Resultado esperado |
|---|---|---|
| UI-50 | Abrir mis cursos | Ver cursos matriculados |
| UI-51 | Buscar curso | Filtrado correcto |
| UI-52 | Abrir reproducción | Cargar videos, materiales y progreso |
| UI-53 | Guardar avance | Persistencia del progreso |
| UI-54 | Descargar material permitido | Descarga correcta |
| UI-55 | Ver certificados | Listado correcto |
| UI-56 | Descargar certificado | PDF válido |

## Casos negativos obligatorios

| ID | Caso | Resultado esperado |
|---|---|---|
| NEG-01 | Login con credenciales inválidas | Rechazo con mensaje correcto |
| NEG-02 | Login con usuario inactivo | Acceso bloqueado |
| NEG-03 | Acceso a dashboard sin token | Redirección o bloqueo |
| NEG-04 | Alumno intentando ver panel admin | Denegado |
| NEG-05 | Docente intentando ver panel admin | Denegado |
| NEG-06 | Alumno intentando descargar material no matriculado | Denegado |
| NEG-07 | Docente intentando acceder a curso no asignado | Denegado |
| NEG-08 | Crear curso sin campos requeridos | Error de validación |
| NEG-09 | Crear docente con correo repetido | Error de negocio |
| NEG-10 | Subir material con archivo peligroso | Rechazo |
| NEG-11 | Subir material > 10MB | Rechazo |
| NEG-12 | Validar certificado inexistente | Error correcto |
| NEG-13 | Descargar archivo inexistente | 404 o error esperado |
| NEG-14 | Backup sin `pg_dump` | Comportamiento controlado y visible |

## Backend: validaciones de negocio que deben comprobarse

| Regla | Qué probar |
|---|---|
| Rol en DTO de docentes | Solo `DOCENTE` en listado y detalle |
| Curso con docente asignado | `docenteId` persistido correctamente |
| Curso de docente | Solo cursos asignados al docente autenticado |
| Material protegido | Requiere usuario activo, curso activo y matrícula activa para alumno |
| Video protegido | Solo acceso permitido por seguridad de curso/módulo |
| Certificado | Debe estar ligado a curso y alumno correctos |
| Auditoría | Toda acción crítica debe dejar trazabilidad |
| Paginación | Debe respetar `page`, `size`, `search` y `sort` |
| Inactivos visibles en admin | Deben poder reactivarse desde la UI |

## Secuencia recomendada de ejecución

### 1. Backend unitario e integración

| Paso | Comando |
|---|---|
| Compilar y probar backend | `./mvnw test -q` |
| Verificar controladores de contenido | `ContenidosControllerTest` |
| Verificar administración | `AdministracionControllerTest` |
| Verificar sistema completo | `SystemIntegrationTest` |

### 2. Frontend

| Paso | Comando |
|---|---|
| Compilar frontend | `npm run build` |
| Smoke público | `node scripts/tests/e2e/selenium-test.js` |
| E2E completo (Playwright) | `node scripts/tests/e2e/super-test.js` |
| Súper Test E2E completo (Selenium) | `node scripts/tests/e2e/selenium-super-test.js` |

### 3. Validación manual final

| Paso | Qué revisar |
|---|---|
| Login admin | Acceso, menú, permisos |
| Crear y editar alumno | Persistencia y reactivación |
| Crear y editar docente | Persistencia y activación/desactivación |
| Crear curso y asignar docente | Persistencia en detalle del curso |
| Crear módulo/video/material | Gestión y acceso por rol |
| Matricular alumno | Acceso al contenido permitido |
| Generar y validar certificado | Flujo completo |
| Descargar reportes | CSV correcto |
| Revisar auditoría | Eventos de cada acción |

## Checklist completo de cierre

| Área | Criterio de salida |
|---|---|
| Funcionalidad | Todos los flujos críticos pasan |
| Seguridad | No hay fuga de permisos por rol |
| API | Códigos de respuesta correctos |
| UI | No hay rutas rotas ni templates faltantes |
| Datos | Los listados muestran estado correcto e inactivos visibles |
| Paginación | Todos los listados aplican paginado real donde corresponde |
| Orden | El orden por fecha es consistente |
| Descargas | PDFs, CSV y archivos funcionan |
| Observabilidad | Auditoría y logs críticos presentes |
| Rendimiento | No hay consultas innecesarias repetidas en flujos principales |

## Recomendación de mantenimiento

Cuando cambie una funcionalidad, actualizar este documento en el mismo PR que el código. Si se agrega un nuevo endpoint, ruta o rol, debe entrar a esta matriz antes de considerar el cambio cerrado.

