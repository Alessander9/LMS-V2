# QA Unificado del Sistema INSTEIP

Este documento unifica y detalla el plan de pruebas masivas para el backend (pruebas unitarias e integración) y la validación integral del frontend usando **Selenium WebDriver**, cubriendo el 100% de la funcionalidad de la plataforma estructurada por roles.

---

## 1. Pruebas de Integración y Unitarias del Backend (API REST)

El backend de INSTEIP incluye 60 casos de prueba automatizados en Java (ejecutables con MockMvc). Cada caso valida las respuestas HTTP, el control de acceso y las reglas de negocio críticas.

| ID | Módulo | Descripción de la Funcionalidad | Método | Endpoint / Ruta | Código Esperado |
|---|---|---|---|---|---|
| **01** | AUTENTICACIÓN | Login incorrecto por credenciales inválidas | `POST` | `/api/auth/login` | 400 |
| **02** | AUTENTICACIÓN | Login correcto del Administrador | `POST` | `/api/auth/login` | 200 |
| **03** | AUTENTICACIÓN | Login correcto del Alumno | `POST` | `/api/auth/login` | 200 |
| **04** | AUTENTICACIÓN | Obtener perfil propio (Admin) | `GET` | `/api/auth/me` | 200 |
| **05** | AUTENTICACIÓN | Obtener perfil propio (Alumno) | `GET` | `/api/auth/me` | 200 |
| **06** | AUTENTICACIÓN | Obtener perfil sin token (Bloqueado) | `GET` | `/api/auth/me` | 403 |
| **07** | AUTENTICACIÓN | Solicitud de recuperación de contraseña | `POST` | `/api/auth/forgot-password` | 200 |
| **08** | AUTENTICACIÓN | Restablecer contraseña con token inválido | `POST` | `/api/auth/reset-password` | 400 |
| **09** | AUTENTICACIÓN | Renovación de token de sesión (Refresh) | `POST` | `/api/auth/refresh` | 200 |
| **10** | AUTENTICACIÓN | Cierre de sesión seguro (Logout) | `POST` | `/api/auth/logout` | 204 |
| **11** | USUARIOS | Listar alumnos con paginación backend | `GET` | `/api/usuarios` | 200 |
| **12** | USUARIOS | Buscar alumnos en backend | `GET` | `/api/usuarios?search=Juan` | 200 |
| **13** | USUARIOS | Obtener detalle de alumno por ID | `GET` | `/api/usuarios/{id}` | 200 |
| **14** | USUARIOS | Crear un nuevo alumno | `POST` | `/api/usuarios` | 201 |
| **15** | USUARIOS | Editar alumno existente | `PUT` | `/api/usuarios/{id}` | 200 |
| **16** | USUARIOS | Modificar estado (Borrado lógico) de alumno | `PATCH` | `/api/usuarios/{id}/estado` | 204 |
| **17** | CURSOS | Listar cursos con paginación backend | `GET` | `/api/cursos` | 200 |
| **18** | CURSOS | Buscar cursos en backend | `GET` | `/api/cursos?search=Excel` | 200 |
| **19** | CURSOS | Obtener detalle del curso por ID | `GET` | `/api/cursos/{id}` | 200 |
| **20** | CURSOS | Listar módulos asociados a un curso | `GET` | `/api/cursos/{id}/modulos` | 200 |
| **21** | CURSOS | Crear un nuevo curso | `POST` | `/api/cursos` | 201 |
| **22** | CURSOS | Editar curso existente | `PUT` | `/api/cursos/{id}` | 200 |
| **23** | CURSOS | Modificar estado (Borrado lógico) de curso | `PATCH` | `/api/cursos/{id}/estado` | 204 |
| **24** | MÓDULOS | Obtener detalle del módulo por ID | `GET` | `/api/modulos/{id}` | 200 |
| **25** | MÓDULOS | Listar videos de un módulo específico | `GET` | `/api/modulos/{id}/videos` | 200 |
| **26** | MÓDULOS | Listar materiales didácticos de un módulo | `GET` | `/api/modulos/{id}/materiales` | 200 |
| **27** | MÓDULOS | Crear un nuevo módulo en un curso | `POST` | `/api/modulos` | 201 |
| **28** | MÓDULOS | Editar módulo existente | `PUT` | `/api/modulos/{id}` | 200 |
| **29** | MÓDULOS | Modificar estado (Borrado lógico) de módulo | `PATCH` | `/api/modulos/{id}/estado` | 204 |
| **30** | VIDEOS | Listar videos con paginación backend | `GET` | `/api/videos` | 200 |
| **31** | VIDEOS | Crear un nuevo video en un módulo | `POST` | `/api/videos` | 201 |
| **32** | VIDEOS | Editar video existente | `PUT` | `/api/videos/{id}` | 200 |
| **33** | VIDEOS | Modificar estado (Borrado lógico) de video | `PATCH` | `/api/videos/{id}/estado` | 204 |
| **34** | MATERIALES | Subir un material (Multipart Form-Data) | `POST` | `/api/materiales` | 201 |
| **35** | MATERIALES | Editar material existente (Multipart) | `PUT` | `/api/materiales/{id}` | 200 |
| **36** | MATERIALES | Modificar estado (Borrado lógico) de material | `PATCH` | `/api/materiales/{id}/estado` | 204 |
| **37** | MATERIALES | Descargar archivo binario de un material | `GET` | `/api/materiales/{id}/download` | 200 |
| **38** | MATRÍCULAS | Matricular un alumno en un curso | `POST` | `/api/matriculas` | 201 |
| **39** | MATRÍCULAS | Listar matriculados en un curso | `GET` | `/api/matriculas/curso/{cursoId}` | 200 |
| **40** | MATRÍCULAS | Modificar estado (Borrado lógico) de matrícula | `PATCH` | `/api/matriculas/{id}/estado` | 204 |
| **41** | AVANCE REPRODUCCIÓN | Guardar progreso de reproducción de video | `POST` | `/api/avance` | 200 |
| **42** | AVANCE REPRODUCCIÓN | Obtener progreso de reproducción de un video | `GET` | `/api/avance/video/{id}` | 200 |
| **43** | CERTIFICADOS | Listar certificados emitidos (con búsqueda) | `GET` | `/api/certificados` | 200 |
| **44** | CERTIFICADOS | Generar automáticamente un certificado al culminar curso | `POST` | `/api/certificados/generar/{cursoId}` | 200 |
| **45** | CERTIFICADOS | Validar certificado públicamente por su código único | `GET` | `/api/certificados/validar/{codigo}` | 200 |
| **46** | CERTIFICADOS | Descargar certificado digital en PDF | `GET` | `/api/certificados/{id}/download` | 200 |
| **47** | REPORTES | Exportar listado de alumnos a archivo CSV | `GET` | `/api/reportes/alumnos` | 200 |
| **48** | REPORTES | Exportar listado de matriculados a archivo CSV | `GET` | `/api/reportes/matriculas` | 200 |
| **49** | REPORTES | Exportar listado de cursos a archivo CSV | `GET` | `/api/reportes/cursos` | 200 |
| **50** | REPORTES | Exportar listado de certificados a archivo CSV | `GET` | `/api/reportes/certificados` | 200 |
| **51** | DASHBOARD ALUMNO | Obtener métricas y progreso general del alumno | `GET` | `/api/alumno/dashboard` | 200 |
| **52** | DASHBOARD ALUMNO | Obtener listado de cursos matriculados del alumno | `GET` | `/api/alumno/cursos` | 200 |
| **53** | DASHBOARD ALUMNO | Obtener certificados emitidos del alumno | `GET` | `/api/alumno/certificados` | 200 |
| **54** | DASHBOARD ALUMNO | Obtener estructura de curso y avances para reproducción (Play) | `GET` | `/api/alumno/cursos/{id}/play` | 200 |
| **55** | CONFIGURACIÓN | Obtener configuraciones globales de la institución | `GET` | `/api/configuracion` | 200 |
| **56** | CONFIGURACIÓN | Actualizar configuraciones globales de la institución | `PUT` | `/api/configuracion` | 200 |
| **57** | SISTEMA Y MONITOREO | Obtener estado actual de recursos y bases de datos | `GET` | `/api/sistema/status` | 200 |
| **58** | SISTEMA Y MONITOREO | Ejecutar y disparar manualmente copia de seguridad | `POST` | `/api/sistema/backup` | 200 |
| **59** | SISTEMA Y MONITOREO | Verificar endpoint de salud Spring Boot Actuator | `GET` | `/actuator/health` | 200 |
| **60** | SISTEMA Y MONITOREO | Verificar endpoint de métricas Spring Boot Actuator | `GET` | `/actuator/metrics` | 200 |

---

## 2. Pruebas E2E del Frontend con Selenium (Súper Test de Interfaz)

El Súper Test E2E de Selenium (`scripts/selenium-super-test.js`) automatiza el flujo completo de la interfaz de usuario en orden cronológico, validando cada dashboard y validando las restricciones de seguridad por rol.

### 2.1 Flujo Público (Sin autenticar)
* **Página de Inicio (`/inicio`)**: Carga del titular dinámico y estructura visual.
* **Catálogo de Cursos (`/cursos`)**: Renderizado de las tarjetas del catálogo público.
* **Portal de Certificación (`/certificacion`)**: Formulario para validación de certificados.

### 2.2 Flujo del Administrador

La cuenta QA se obtiene de `QA_ADMIN_EMAIL` y `QA_ADMIN_PASSWORD`; no se documentan credenciales reales en este archivo.
* **Acceso y Estadísticas**: Validación de tarjetas de resumen (Total Alumnos, Cursos, Certificados).
* **Gestión de Alumnos**:
  * Creación de un alumno dinámico.
  * Búsqueda en tabla.
  * Apertura de modal de ficha técnica.
  * Modificación de campos y guardado.
  * Activación y desactivación lógica del alumno.
  * Descarga del reporte general de Alumnos en CSV.
* **Gestión de Docentes**:
  * Registro de un nuevo docente dinámico.
  * Edición de información del docente.
  * Modificación del estado (Activar/Desactivar).
* **Gestión de Cursos**:
  * Crear nuevo curso asignando docente y niveles de suscripción.
  * Edición de descripción del curso.
* **Estructura del Curso (Temario)**:
  * Registro de un módulo didáctico.
  * Subida y asignación de un material académico PDF (Multipart).
  * Registro y publicación de un video de clase (YouTube URL).
* **Matrículas**:
  * Búsqueda y matrícula del alumno dinámico en el curso creado.
  * Descarga de matrículas en CSV.
* **Reporte de Certificados**:
  * Visualización y exportación de bitácora general de certificados en CSV.
* **Configuración del Sistema**:
  * Modificación y guardado de datos generales, branding institucional y pasarelas de pago.
* **Auditoría & Monitoreo**:
  * Visualización de bitácora de eventos del sistema y accesos (Logins).
  * Disparo manual de copia de seguridad (Backup del sistema).
  * Consulta del estado de salud de servicios.

### 2.3 Flujo del Docente (`docente@insteip.com` o el docente dinámico creado)
* **Mis Cursos**: Listado de los programas asignados al docente autenticado.
* **Seguimiento Académico**: Acceso a la vista "Mis Alumnos" para comprobar el avance de matriculados.
* **Gestión de Contenidos**: Carga de videos y materiales en el temario de sus cursos asignados.

### 2.4 Flujo del Alumno (El alumno dinámico creado)
* **Matrícula y Progreso**: Validación de cursos activos del alumno matriculado.
* **Aula Virtual (Playroom)**:
  * Reproducción del video cargado.
  * Marcar el progreso como completado para registrar avance de reproducción.
  * Descarga de materiales de apoyo de la clase.
  * Bloqueo de seguridad: Validar que si intenta descargar un recurso sin matrícula autorizada obtenga un error controlado.
* **Diploma Académico**:
  * Desbloqueo automático del certificado al completar el 100% de las clases del curso.
  * Descarga del PDF oficial institucional.
  * Comprobación en el historial personal "Mis Certificados".

### 2.5 Validación Pública de Firma del Certificado
* **Pasarela Pública (`/certificados/validar/:codigo`)**: Acceso directo y verificación de que el código generado sea auténtico, reportando el nombre del alumno, curso y la validez legal del mismo sin credenciales de sesión activas.

---

## 3. Instrucciones de Ejecución de las Pruebas

Para garantizar que todos los componentes interactúen de forma limpia y transparente:

1. **Levantar base de datos limpia**:
   ```bash
   docker compose down -v
   docker compose up -d
   ```
2. **Arrancar backend (Puerto 8081)**:
   ```bash
   cd backend
   # En Windows:
   # Define DB_URL, DB_USERNAME y DB_PASSWORD en el entorno antes de ejecutar:
   .\mvnw.cmd spring-boot:run
   ```
3. **Arrancar frontend (Puerto 4200)**:
   ```bash
   cd frontend
   npm start
   ```
4. **Ejecutar pruebas del backend**:
   ```bash
   cd backend
   # En Windows:
   # Define DB_URL, DB_USERNAME y DB_PASSWORD en el entorno antes de ejecutar:
   .\mvnw.cmd test
   ```
5. **Ejecutar pruebas del frontend (Selenium)**:
   ```bash
   node scripts/selenium-super-test.js
   ```
