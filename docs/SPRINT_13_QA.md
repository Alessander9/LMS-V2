# Sprint 13 - QA y Pruebas Funcionales

## Alcance

Este sprint valida los flujos críticos del sistema INSTEIP después de cerrar seguridad empresarial en sprint 12.

## Cobertura mínima

### Flujo Administrador

- Login.
- Crear alumno.
- Editar alumno.
- Crear curso.
- Editar curso.
- Crear módulo.
- Crear video.
- Subir material.
- Matricular alumno.
- Generar certificado.

### Flujo Alumno

- Login.
- Ver cursos.
- Ver videos.
- Guardar progreso.
- Continuar reproducción.
- Descargar material.
- Descargar certificado.

### Flujo Certificados

- Generación PDF.
- QR.
- Validación pública.
- Descarga.

### Seguridad

- Acceso sin login.
- JWT inválido.
- Curso sin matrícula.
- Material sin permiso.
- Intentos fallidos.

## Automatización agregada

- Pruebas unitarias de autenticación y seguridad de sesiones en [AuthServiceImplTest.java](backend/src/test/java/com/insteip/backend/service/impl/AuthServiceImplTest.java).
- Pruebas unitarias de validación de archivos y descarga segura en [MaterialServiceImplTest.java](backend/src/test/java/com/insteip/backend/service/impl/MaterialServiceImplTest.java).

## Estado

- Backend: validado con `mvn test`.
- Frontend: validado con la suite de pruebas E2E automatizada con Playwright en [scripts/super-test.js](/c:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/scripts/super-test.js).

## Observaciones

- El backend ya cubre bloqueo temporal por intentos fallidos, refresh token, auditoría y descarga segura.
- El dashboard de auditoría del admin queda disponible para verificar trazabilidad operativa.
