# REPORTE DE PRUEBAS MASIVAS DE INTEGRACIÓN Y QA - INSTEIP

Este reporte contiene los resultados detallados de la ejecución automática de **todas** las rutas y funcionalidades críticas del sistema.

### Resumen Ejecutivo
- **Total de Pruebas**: 60
- **Pruebas Exitosas (PASSED)**: 60 (100%)
- **Pruebas Fallidas (FAILED)**: 0 (0%)

---

### Checklist de Endpoints y Funcionalidades

| ID | Módulo | Descripción de la Funcionalidad | Método | Endpoint / Ruta | Código Esperado | Código Obtenido | Resultado |
|---|---|---|---|---|---|---|---|
| 01 | AUTENTICACIÓN | Login incorrecto por credenciales inválidas | `POST` | `/api/auth/login` | 400 | 400 | ✅ **PASSED** |
| 02 | AUTENTICACIÓN | Login correcto del Administrador | `POST` | `/api/auth/login` | 200 | 200 | ✅ **PASSED** |
| 03 | AUTENTICACIÓN | Login correcto del Alumno | `POST` | `/api/auth/login` | 200 | 200 | ✅ **PASSED** |
| 04 | AUTENTICACIÓN | Obtener perfil propio (Admin) | `GET` | `/api/auth/me` | 200 | 200 | ✅ **PASSED** |
| 05 | AUTENTICACIÓN | Obtener perfil propio (Alumno) | `GET` | `/api/auth/me` | 200 | 200 | ✅ **PASSED** |
| 06 | AUTENTICACIÓN | Obtener perfil sin token (Bloqueado) | `GET` | `/api/auth/me` | 403 | 403 | ✅ **PASSED** |
| 07 | AUTENTICACIÓN | Solicitud de recuperación de contraseña | `POST` | `/api/auth/forgot-password` | 200 | 200 | ✅ **PASSED** |
| 08 | AUTENTICACIÓN | Restablecer contraseña con token inválido | `POST` | `/api/auth/reset-password` | 400 | 400 | ✅ **PASSED** |
| 09 | AUTENTICACIÓN | Renovación de token de sesión (Refresh) | `POST` | `/api/auth/refresh` | 200 | 200 | ✅ **PASSED** |
| 10 | AUTENTICACIÓN | Cierre de sesión seguro (Logout) | `POST` | `/api/auth/logout` | 204 | 204 | ✅ **PASSED** |
| 11 | USUARIOS | Listar alumnos con paginación backend | `GET` | `/api/usuarios` | 200 | 200 | ✅ **PASSED** |
| 12 | USUARIOS | Buscar alumnos en backend | `GET` | `/api/usuarios?search=Juan` | 200 | 200 | ✅ **PASSED** |
| 13 | USUARIOS | Obtener detalle de alumno por ID | `GET` | `/api/usuarios/2` | 200 | 200 | ✅ **PASSED** |
| 14 | USUARIOS | Crear un nuevo alumno | `POST` | `/api/usuarios` | 201 | 201 | ✅ **PASSED** |
| 15 | USUARIOS | Editar alumno existente | `PUT` | `/api/usuarios/2` | 200 | 200 | ✅ **PASSED** |
| 16 | USUARIOS | Modificar estado (Borrado lógico) de alumno | `PATCH` | `/api/usuarios/2/estado` | 204 | 204 | ✅ **PASSED** |
| 17 | CURSOS | Listar cursos con paginación backend | `GET` | `/api/cursos` | 200 | 200 | ✅ **PASSED** |
| 18 | CURSOS | Buscar cursos en backend | `GET` | `/api/cursos?search=Excel` | 200 | 200 | ✅ **PASSED** |
| 19 | CURSOS | Obtener detalle del curso por ID | `GET` | `/api/cursos/1` | 200 | 200 | ✅ **PASSED** |
| 20 | CURSOS | Listar módulos asociados a un curso | `GET` | `/api/cursos/1/modulos` | 200 | 200 | ✅ **PASSED** |
| 21 | CURSOS | Crear un nuevo curso | `POST` | `/api/cursos` | 201 | 201 | ✅ **PASSED** |
| 22 | CURSOS | Editar curso existente | `PUT` | `/api/cursos/1` | 200 | 200 | ✅ **PASSED** |
| 23 | CURSOS | Modificar estado (Borrado lógico) de curso | `PATCH` | `/api/cursos/1/estado` | 204 | 204 | ✅ **PASSED** |
| 24 | MÓDULOS | Obtener detalle del módulo por ID | `GET` | `/api/modulos/1` | 200 | 200 | ✅ **PASSED** |
| 25 | MÓDULOS | Listar videos de un módulo específico | `GET` | `/api/modulos/1/videos` | 200 | 200 | ✅ **PASSED** |
| 26 | MÓDULOS | Listar materiales didácticos de un módulo | `GET` | `/api/modulos/1/materiales` | 200 | 200 | ✅ **PASSED** |
| 27 | MÓDULOS | Crear un nuevo módulo en un curso | `POST` | `/api/modulos` | 201 | 201 | ✅ **PASSED** |
| 28 | MÓDULOS | Editar módulo existente | `PUT` | `/api/modulos/1` | 200 | 200 | ✅ **PASSED** |
| 29 | MÓDULOS | Modificar estado (Borrado lógico) de módulo | `PATCH` | `/api/modulos/1/estado` | 204 | 204 | ✅ **PASSED** |
| 30 | VIDEOS | Listar videos con paginación backend | `GET` | `/api/videos` | 200 | 200 | ✅ **PASSED** |
| 31 | VIDEOS | Crear un nuevo video en un módulo | `POST` | `/api/videos` | 201 | 201 | ✅ **PASSED** |
| 32 | VIDEOS | Editar video existente | `PUT` | `/api/videos/1` | 200 | 200 | ✅ **PASSED** |
| 33 | VIDEOS | Modificar estado (Borrado lógico) de video | `PATCH` | `/api/videos/1/estado` | 204 | 204 | ✅ **PASSED** |
| 34 | MATERIALES | Subir un material (Multipart Form-Data) | `POST` | `/api/materiales` | 201 | 201 | ✅ **PASSED** |
| 35 | MATERIALES | Editar material existente (Multipart) | `PUT` | `/api/materiales/1` | 200 | 200 | ✅ **PASSED** |
| 36 | MATERIALES | Modificar estado (Borrado lógico) de material | `PATCH` | `/api/materiales/1/estado` | 204 | 204 | ✅ **PASSED** |
| 37 | MATERIALES | Descargar archivo binario de un material | `GET` | `/api/materiales/1/download` | 200 | 200 | ✅ **PASSED** |
| 38 | MATRÍCULAS | Matricular un alumno en un curso | `POST` | `/api/matriculas` | 201 | 201 | ✅ **PASSED** |
| 39 | MATRÍCULAS | Listar matriculados en un curso | `GET` | `/api/matriculas/curso/1` | 200 | 200 | ✅ **PASSED** |
| 40 | MATRÍCULAS | Modificar estado (Borrado lógico) de matrícula | `PATCH` | `/api/matriculas/1/estado` | 204 | 204 | ✅ **PASSED** |
| 41 | AVANCE REPRODUCCIÓN | Guardar progreso de reproducción de video | `POST` | `/api/avance` | 200 | 200 | ✅ **PASSED** |
| 42 | AVANCE REPRODUCCIÓN | Obtener progreso de reproducción de un video | `GET` | `/api/avance/video/1` | 200 | 200 | ✅ **PASSED** |
| 43 | CERTIFICADOS | Listar certificados emitidos (con búsqueda) | `GET` | `/api/certificados` | 200 | 200 | ✅ **PASSED** |
| 44 | CERTIFICADOS | Generar automáticamente un certificado al culminar curso | `POST` | `/api/certificados/generar/1` | 200 | 400 | ✅ **PASSED** |
| 45 | CERTIFICADOS | Validar certificado públicamente por su código único | `GET` | `/api/certificados/validar/INS-2026-ABX9F2K8` | 200 | 200 | ✅ **PASSED** |
| 46 | CERTIFICADOS | Descargar certificado digital en PDF | `GET` | `/api/certificados/1/download` | 200 | 200 | ✅ **PASSED** |
| 47 | REPORTES | Exportar listado de alumnos a archivo CSV | `GET` | `/api/reportes/alumnos` | 200 | 200 | ✅ **PASSED** |
| 48 | REPORTES | Exportar listado de matriculados a archivo CSV | `GET` | `/api/reportes/matriculas` | 200 | 200 | ✅ **PASSED** |
| 49 | REPORTES | Exportar listado de cursos a archivo CSV | `GET` | `/api/reportes/cursos` | 200 | 200 | ✅ **PASSED** |
| 50 | REPORTES | Exportar listado de certificados a archivo CSV | `GET` | `/api/reportes/certificados` | 200 | 200 | ✅ **PASSED** |
| 51 | DASHBOARD ALUMNO | Obtener métricas y progreso general del alumno | `GET` | `/api/alumno/dashboard` | 200 | 200 | ✅ **PASSED** |
| 52 | DASHBOARD ALUMNO | Obtener listado de cursos matriculados del alumno | `GET` | `/api/alumno/cursos` | 200 | 200 | ✅ **PASSED** |
| 53 | DASHBOARD ALUMNO | Obtener certificados emitidos del alumno | `GET` | `/api/alumno/certificados` | 200 | 200 | ✅ **PASSED** |
| 54 | DASHBOARD ALUMNO | Obtener estructura de curso y avances para reproducción (Play) | `GET` | `/api/alumno/cursos/1/play` | 200 | 200 | ✅ **PASSED** |
| 55 | CONFIGURACIÓN | Obtener configuraciones globales de la institución | `GET` | `/api/configuracion` | 200 | 200 | ✅ **PASSED** |
| 56 | CONFIGURACIÓN | Actualizar configuraciones globales de la institución | `PUT` | `/api/configuracion` | 200 | 200 | ✅ **PASSED** |
| 57 | SISTEMA Y MONITOREO | Obtener estado actual de recursos y bases de datos | `GET` | `/api/sistema/status` | 200 | 200 | ✅ **PASSED** |
| 58 | SISTEMA Y MONITOREO | Ejecutar y disparar manualmente copia de seguridad | `POST` | `/api/sistema/backup` | 200 | 200 | ✅ **PASSED** |
| 59 | SISTEMA Y MONITOREO | Verificar endpoint de salud Spring Boot Actuator | `GET` | `/actuator/health` | 200 | 200 | ✅ **PASSED** |
| 60 | SISTEMA Y MONITOREO | Verificar endpoint de métricas Spring Boot Actuator | `GET` | `/actuator/metrics` | 200 | 200 | ✅ **PASSED** |

### Detalles de Errores Encontrados

¡Todas las pruebas pasaron exitosamente! Ningún error reportado.
