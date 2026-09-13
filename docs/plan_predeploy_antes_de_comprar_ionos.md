# Plan previo al deploy de INSTEIP

## Estado de ejecución

**Actualizado:** 2026-07-24  
**Estado:** Documento histórico de preparación. La infraestructura actual es Contabo + DonWeb y el despliegue productivo está documentado en `docs/estado_deploy_contabo_donweb.md`.

> No usar este documento como guía operativa actual. Conserva el historial de decisiones y validaciones previas a la compra del VPS.

## Pendientes antes de comprar el servidor

Estos son los únicos pendientes locales que deben cerrarse antes de contratar el VPS. No requieren todavía el servidor ni el dominio.

### Bloqueadores antes de comprar

- [x] Revisar `database/local_data`: es un directorio de datos PostgreSQL local versionado; no se copiará al VPS.
- [x] Respaldar la base local actual y verificar restauración en `insteip_restore_test`.
- [ ] Definir qué datos iniciales tendrá producción: administrador, docentes, cursos, configuraciones y catálogos.
- [x] Definir el método de inicialización productiva: base nueva `insteip_prod` y carga mediante migraciones/SQL controlado; no se copiará `database/local_data`.
- [x] Ejecutar búsqueda final de secretos en código, documentación, SQL y scripts: no quedan coincidencias de las credenciales QA conocidas ni claves fallback.
- [x] Retirar del repositorio las contraseñas QA de documentación, SQL y scripts auxiliares; las pruebas reciben credenciales por variables de entorno.
- [ ] Rotar las cuentas de prueba antes del primer uso productivo y confirmar que no se reutilizarán en producción.
- [ ] Preparar el archivo de variables productivas sin valores reales y verificar que todas las variables obligatorias estén documentadas.
- [ ] Confirmar la arquitectura final: frontend en el dominio principal y API mediante `/api`.
- [x] Revisar `git status`, `git diff` y `git diff --check`; `database/local_data` quedó fuera del índice y los artefactos QA fueron eliminados.
- [x] Ejecutar la validación limpia de backend, frontend y pruebas críticas después de los cambios: Maven 53/53, frontend build y unit tests pasan; API, roles y Selenium ya habían pasado con variables QA.

### Pendientes recomendados, pero no bloquean la compra

- [ ] Revisar y reducir vulnerabilidades de dependencias de desarrollo antes de publicar un pipeline CI/CD.
- [ ] Completar una matriz responsive automatizada para `320px`, `375px`, `640px`, `768px`, `1024px` y `1280px`.
- [ ] Ampliar la cobertura unitaria frontend más allá del spec actual de `InicioComponent`.
- [ ] Preparar un procedimiento escrito para rotación de JWT, contraseña PostgreSQL y cuentas administrativas.

### Lo que no puede hacerse antes de comprar

Estas tareas requieren la IP, el sistema operativo o el dominio real de IONOS:

- Configurar Ubuntu y actualizar el VPS.
- Crear el usuario Linux `insteip`.
- Configurar SSH y firewall.
- Instalar Java, Docker, Nginx y Certbot.
- Crear PostgreSQL productivo.
- Configurar los secretos reales en `/etc/insteip/backend.env`.
- Configurar DNS.
- Activar HTTPS.
- Configurar systemd y Nginx en el servidor.
- Probar backups externos y restauración en el VPS.
- Ejecutar el smoke test con el dominio real.

### Decisión de compra

La compra puede realizarse cuando los **bloqueadores antes de comprar** estén marcados como completados. La compra del VPS no implica que la aplicación esté todavía publicada: después deberán completarse las tareas de infraestructura, DNS, HTTPS, base de datos productiva y smoke test post-deploy.

### Última validación local

- [x] Tailwind CSS compilado localmente mediante PostCSS.
- [x] CDN de Tailwind eliminado de `frontend/src/index.html`.
- [x] Configuración visual trasladada a `frontend/tailwind.config.js`.
- [x] Las vistas vuelven a mostrar sus estilos en `localhost`.
- [x] `npm run build` finaliza correctamente después de la migración.
- [x] `npm test -- --watch=false --browsers=ChromeHeadless --no-progress` finaliza correctamente.
- [x] `npm audit --omit=dev --audit-level=high` reporta 0 vulnerabilidades productivas.
- [ ] El audit completo todavía reporta vulnerabilidades de tooling de desarrollo; revisar antes de exponer un pipeline CI/CD público.

### Avance actual

- [x] Frontend compila con `npm run build`.
- [x] Pruebas unitarias frontend configuradas y ejecutables.
- [x] Scripts de QA API y Selenium validan sintaxis.
- [x] Dependencias de producción auditadas: 0 vulnerabilidades con `npm audit --omit=dev --audit-level=high`.
- [x] Clave JWT, credenciales de seeder y credenciales QA fuera del código productivo.
- [x] CORS y URLs productivas definidos mediante variables sin fallback en `backend/src/main`.
- [x] Docker Compose parametrizado para recibir secretos externos.
- [x] Backup y restauración local verificados en base temporal `insteip_restore_test`.
- [x] `database/local_data` identificado como directorio de datos PostgreSQL local y excluido de futuros cambios mediante `.gitignore`.
- [x] Retirar del índice los 1,391 archivos locales versionados; `git ls-files database/local_data` devuelve 0.
- [x] QA completo repetido con PostgreSQL disponible: 53 pruebas Maven, build/unit frontend y suites API/roles/Selenium aprobadas.
- [ ] Compra de IONOS VPS M+ y dominio.

> Las credenciales del archivo de pruebas son solo para el entorno automatizado local. No deben reutilizarse en producción ni copiarse al VPS.

## Objetivo

Dejar el sistema completamente preparado, seguro y validado en local antes de comprar:

1. IONOS VPS M+.
2. Dominio de producción.

El VPS y el dominio son los últimos pasos del proceso.

---

## Arquitectura final recomendada

Usar un único dominio para el frontend y la API:

```text
Frontend: https://tudominio.com
Backend:  https://tudominio.com/api
```

Arquitectura:

```text
Usuario
   |
   v
https://tudominio.com
   |
   v
Nginx
   |-- Frontend Angular estático
   `-- /api/ -> Spring Boot :8081
                    |
                    |-- PostgreSQL
                    |-- Materiales
                    |-- Certificados
                    `-- Backups
```

No se deben exponer públicamente estos puertos:

```text
5432
5455
8081
```

---

# Fase 1: definir configuración de producción

## 1. Confirmar URLs finales

Antes de comprar el dominio, decidir que la aplicación utilizará:

```text
https://tudominio.com
https://tudominio.com/api
```

El frontend productivo debe utilizar:

```typescript
apiUrl: 'https://tudominio.com/api'
```

No utilizar inicialmente:

```text
https://api.insteip.com/api
```

salvo que se decida trabajar con un subdominio independiente.

## 2. Parametrizar el backend

Eliminar valores predeterminados inseguros de `application.properties`.

La configuración productiva debe utilizar variables obligatorias:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

application.security.jwt.secret-key=${JWT_SECRET}
application.security.jwt.expiration=${JWT_EXPIRATION:900000}

application.storage.path=${STORAGE_PATH}

application.api.base-url=${API_BASE_URL}
application.frontend.base-url=${FRONTEND_BASE_URL}
```

El backend debe fallar al iniciar si faltan secretos obligatorios.

No utilizar valores como:

```properties
DB_PASSWORD:valor_obligatorio_sin_default
JWT_SECRET:valor_obligatorio_sin_default
```

## 3. Crear plantilla de variables

Crear únicamente una plantilla sin valores reales:

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRATION=900000
API_BASE_URL=
FRONTEND_BASE_URL=
STORAGE_PATH=
CORS_ALLOWED_ORIGINS=
```

El archivo real con valores debe permanecer fuera de Git.

---

# Fase 2: seguridad de secretos

## 4. Rotar credenciales de prueba

Las credenciales que aparecen en documentación y scripts deben considerarse públicas.

Cambiar las cuentas de prueba:

```text
admin@insteip.com
juan.perez@insteip.com
docente@insteip.com
```

Acciones:

- [ ] Cambiar las contraseñas.
- [ ] Crear cuentas de producción nuevas.
- [ ] Desactivar cuentas de QA.
- [ ] Crear una cuenta administrativa exclusiva de producción.
- [ ] No utilizar cuentas Selenium en producción.
- [ ] Cambiar la contraseña de PostgreSQL.
- [ ] Generar una nueva clave JWT.

Generar una clave JWT segura:

```bash
openssl rand -base64 32
```

La clave nunca debe almacenarse en:

- Git.
- README.
- Scripts.
- Frontend.
- Logs.
- Documentación pública.

## 5. Proteger scripts de pruebas

Los scripts API y Selenium deben leer credenciales mediante variables de entorno:

```env
QA_ADMIN_EMAIL=
QA_ADMIN_PASSWORD=
QA_DOCENTE_EMAIL=
QA_DOCENTE_PASSWORD=
QA_ALUMNO_EMAIL=
QA_ALUMNO_PASSWORD=
```

Si una variable no existe, la prueba debe detenerse con un error claro.

No utilizar contraseñas escritas directamente en los scripts.

## 6. Revisar `.gitignore`

Agregar, si no existe:

```gitignore
.env
.env.*
!.env.example
*.secret
*.key
*.pem
```

No subir archivos con secretos reales al repositorio.

---

# Fase 3: configuración segura de Spring Boot

## 7. Crear configuración por entorno

Para producción:

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never
```

Motivos:

- `ddl-auto=update` puede modificar la base automáticamente.
- `show-sql=true` puede exponer información y llenar logs.
- Actuator con detalles completos puede revelar información del servidor.

En desarrollo se puede mantener otra configuración separada.

## 8. Parametrizar CORS

Desarrollo:

```env
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

Producción:

```env
CORS_ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
```

No permitir cualquier origen:

```text
*
```

## 9. Eliminar URLs localhost del código

Reemplazar referencias directas a:

```text
http://localhost:8081
http://localhost:4200
```

por propiedades configurables:

```properties
application.api.base-url=${API_BASE_URL}
application.frontend.base-url=${FRONTEND_BASE_URL}
```

Esto afecta especialmente:

- Enlaces de certificados.
- Validación pública.
- Seeders.
- URLs generadas por el backend.

---

# Fase 4: PostgreSQL y Docker

## 10. Corregir Docker Compose

No dejar contraseñas escritas directamente:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  POSTGRES_DB: ${POSTGRES_DB}
```

El puerto debe permanecer privado:

```yaml
ports:
  - "127.0.0.1:5455:5432"
```

No utilizar:

```yaml
- "5455:5432"
```

porque expondría PostgreSQL a Internet.

## 11. Separar bases de datos

Usar bases diferentes:

```text
insteip_dev
insteip_qa
insteip_prod
```

Nunca ejecutar Selenium o pruebas API contra producción.

## 12. Revisar datos locales

Revisar:

```text
database/local_data
```

Determinar si contiene:

- Datos reales.
- Datos de desarrollo.
- Datos de pruebas.
- Archivos internos de PostgreSQL.

No copiar estos archivos directamente al servidor productivo.

La base productiva debe inicializarse mediante migraciones, scripts SQL controlados o un backup restaurable.

---

# Fase 5: backup y restauración

## 13. Probar backup local

- [x] Crear backup.
- [x] Confirmar que el archivo existe.
- [x] Crear una base temporal.
- [x] Restaurar el backup.
- [x] Verificar usuarios.
- [x] Verificar cursos.
- [x] Verificar módulos.
- [x] Verificar matrículas.
- [x] Verificar avances.
- [x] Verificar certificados.
- [x] Eliminar la base temporal.

Un backup no debe considerarse válido hasta comprobar su restauración.

## 14. Definir política de backup

Definir:

```text
Frecuencia: diaria
Retención: mínimo 7 copias
Ubicación: servidor + almacenamiento externo
Cifrado: obligatorio
Prueba de restauración: mensual
```

No guardar todas las copias únicamente en el VPS.

---

# Fase 6: dependencias y rendimiento

## 15. Auditar dependencias frontend

Ejecutar:

```bash
cd frontend
npm audit
npm audit --omit=dev
```

Priorizar:

1. Vulnerabilidades críticas.
2. Vulnerabilidades altas.
3. Dependencias que llegan al bundle productivo.
4. Dependencias transitivas de desarrollo.

No ejecutar sin revisión:

```bash
npm audit fix --force
```

Después de actualizar dependencias:

```bash
npm ci
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## 16. Tailwind local

- [x] Tailwind compilado localmente con PostCSS.
- [x] CDN retirado de `frontend/src/index.html`.
- [x] Configuración visual trasladada a `frontend/tailwind.config.js`.
- [x] `frontend/postcss.config.js` configurado con Tailwind y Autoprefixer.
- [x] Las vistas se visualizan correctamente en desarrollo local.

Eliminar dependencias de:

```text
https://cdn.tailwindcss.com
```

La compilación productiva utiliza dependencias locales y controladas por npm.

## 17. Revisar imágenes LCP

Las imágenes Hero visibles al inicio no deben usar:

```html
loading="lazy"
```

Usar:

```html
<img
  src="..."
  fetchpriority="high"
  decoding="async"
  alt="...">
```

Las imágenes fuera del viewport sí pueden utilizar `loading="lazy"`.

## 18. Medir consumo

Revisar:

- CPU.
- RAM.
- Espacio de disco.
- Tiempo de respuesta.
- Generación de certificados.
- Backups.
- Carga de archivos.
- Consultas PostgreSQL.

Limitar Java en producción:

```text
-Xms256m -Xmx1024m
```

El VPS M+ tiene 4 GB de RAM, por lo que no se debe permitir que Java consuma toda la memoria.

---

# Fase 7: QA local completo

## 19. Build limpio del backend

```bash
cd backend
./mvnw clean test
./mvnw clean package
```

Resultado requerido:

```text
BUILD SUCCESS
```

## 20. Build limpio del frontend

```bash
cd frontend
npm ci
npm run build
```

Resultado requerido:

```text
Build correcto
```

## 21. Pruebas unitarias frontend

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Ampliar pruebas para:

- `AuthService`.
- `AuthGuard`.
- `RoleGuard`.
- `CursosComponent`.
- `InicioComponent`.
- `MisCursosComponent`.
- Reproductor.
- Certificados.
- Formularios administrativos.
- Interceptor JWT.
- Servicios de avance.
- Servicios de certificados.

## 22. Pruebas backend

```bash
cd backend
./mvnw test
```

Verificar autenticación, usuarios, cursos, módulos, materiales, dashboards, seguridad, certificados e integración.

## 23. Pruebas API

```bash
node scripts/tests/api/backend-api-super-test.js
node scripts/tests/api/role-permissions-test.js
```

Confirmar:

- Avance válido.
- Avance inválido.
- Recuperación del avance.
- Roles.
- Permisos.
- Generación de certificados.
- Limpieza de datos.

## 24. Pruebas Selenium

```bash
node scripts/tests/e2e/selenium-test.js
node scripts/tests/e2e/selenium-super-test.js
```

Validar:

- Inicio.
- Catálogo.
- Login.
- Dashboard administrador.
- Dashboard docente.
- Dashboard alumno.
- Alumnos.
- Docentes.
- Cursos.
- Módulos.
- Videos.
- Materiales.
- Matrículas.
- Certificados.
- Auditoría.
- Configuración.
- Backup.
- Validación pública.

## 25. Pruebas responsive

Validar en:

```text
320px
375px
640px
768px
1024px
1280px
```

Páginas mínimas:

- `/inicio`.
- `/TodosLosCursos.html`.
- Detalle de cursos.
- `/login`.
- Dashboard administrador.
- Dashboard docente.
- Dashboard alumno.
- Formularios.
- Tablas.
- Modales.
- Descargas.

Verificar:

- Sin scroll horizontal.
- Sin contenido cortado.
- Botones alineados.
- Textos completos.
- Menús visibles.
- Imágenes sin deformación.
- Modales dentro del viewport.

---

# Fase 8: seguridad por rol

## Administrador

- [ ] Login.
- [ ] Logout.
- [ ] Usuarios.
- [ ] Docentes.
- [ ] Cursos.
- [ ] Módulos.
- [ ] Videos.
- [ ] Materiales.
- [ ] Matrículas.
- [ ] Certificados.
- [ ] Reportes.
- [ ] Auditoría.
- [ ] Configuración.
- [ ] Pagos.
- [ ] Backup.
- [ ] Estado del sistema.

## Docente

- [ ] Login.
- [ ] Logout.
- [ ] Cursos asignados.
- [ ] Alumnos del curso.
- [ ] Progreso.
- [ ] Contenido autorizado.
- [ ] Materiales autorizados.
- [ ] Bloqueo de cursos ajenos.
- [ ] Bloqueo de funciones administrativas.

## Alumno

- [ ] Login.
- [ ] Logout.
- [ ] Cursos matriculados.
- [ ] Reproductor.
- [ ] Guardar avance.
- [ ] Continuar curso.
- [ ] Descargar materiales.
- [ ] Certificado.
- [ ] Bloqueo de cursos no matriculados.
- [ ] Bloqueo de funciones administrativas.

## Casos de seguridad

- [ ] Sin token.
- [ ] JWT inválido.
- [ ] JWT expirado.
- [ ] Rol incorrecto.
- [ ] Recurso ajeno.
- [ ] ID inexistente.
- [ ] Payload inválido.
- [ ] Archivo inválido.
- [ ] Path traversal.
- [ ] Descarga sin autorización.

---

# Fase 9: limpieza antes del release

## 26. Limpiar datos QA

Verificar que no queden:

```text
alumno.selenium.*
docente.selenium.*
Curso Selenium *
Curso API Test *
```

También limpiar:

- Matrículas de prueba.
- Certificados de prueba.
- Avances de prueba.
- Videos de prueba.
- Materiales de prueba.
- Archivos subidos por pruebas.

## 27. Revisar el repositorio

Antes del release:

```bash
git status
git diff --check
git diff
```

Confirmar que no existan:

- Secretos.
- Contraseñas.
- Tokens.
- Archivos `.env` reales.
- Dumps de bases productivas.
- Archivos temporales.
- Datos de usuarios reales.
- Certificados de prueba.

---

# Fase 10: preparar archivos de despliegue

## 28. Preparar systemd

No ejecutar Spring Boot como `root`.

Usar:

```ini
User=insteip
Group=insteip
EnvironmentFile=/etc/insteip/backend.env
ExecStart=/usr/bin/java -Xms256m -Xmx1024m -jar /opt/insteip/backend.jar
Restart=always
```

## 29. Preparar variables de producción

Ejemplo conceptual:

```env
DB_URL=jdbc:postgresql://localhost:5432/insteip_prod
DB_USERNAME=insteip_prod
DB_PASSWORD=CAMBIAR_EN_SERVIDOR
JWT_SECRET=GENERAR_EN_SERVIDOR
JWT_EXPIRATION=900000
API_BASE_URL=https://tudominio.com
FRONTEND_BASE_URL=https://tudominio.com
STORAGE_PATH=/opt/insteip/data
CORS_ALLOWED_ORIGINS=https://tudominio.com
```

No subir estos valores al repositorio.

## 30. Preparar Nginx

Nginx deberá:

- Servir Angular.
- Redirigir HTTP a HTTPS.
- Enviar `/api/` al backend.
- Aplicar límites de subida.
- Servir fallback de Angular.
- Aplicar compresión.
- Permitir certificados SSL.

---

# Fase 11: últimos pasos: comprar IONOS

Esta fase se realiza únicamente después de completar las fases anteriores.

## 31. Comprar IONOS VPS M+

Configuración recomendada:

```text
Plan: VPS M+
CPU: 4 vCores
RAM: 4 GB
Disco: 120 GB NVMe
Sistema: Ubuntu 24.04 LTS
```

El plan es compatible con:

- Angular 18.
- Spring Boot 3.4.
- Java 21.
- PostgreSQL 15.
- Docker.
- Nginx.
- Certbot.
- Materiales y certificados.

## 32. Comprar o asociar dominio

El dominio puede comprarse en IONOS o en otro proveedor.

Configuración recomendada:

```text
A     @       IP_DEL_VPS
A     www     IP_DEL_VPS
```

Si se utiliza subdominio para la API:

```text
A     api     IP_DEL_VPS
```

La opción recomendada inicialmente es:

```text
https://tudominio.com
https://tudominio.com/api
```

## 33. Configurar el VPS

Después de comprarlo:

- [ ] Conectar mediante SSH.
- [ ] Actualizar Ubuntu.
- [ ] Crear usuario `insteip`.
- [ ] Deshabilitar acceso root directo.
- [ ] Configurar SSH seguro.
- [ ] Instalar Java 21.
- [ ] Instalar Docker.
- [ ] Instalar Nginx.
- [ ] Instalar Certbot.
- [ ] Configurar firewall.
- [ ] Abrir únicamente SSH, HTTP y HTTPS.
- [ ] Configurar PostgreSQL privado.
- [ ] Crear carpetas de aplicación.
- [ ] Configurar secretos.
- [ ] Subir backend.
- [ ] Subir frontend.
- [ ] Configurar systemd.
- [ ] Configurar Nginx.
- [ ] Activar HTTPS.
- [ ] Ejecutar backup.
- [ ] Ejecutar smoke test real.

---

# Criterio final para comprar

Antes de comprar IONOS VPS M+ y dominio debe cumplirse:

- [x] No existen secretos predeterminados en `backend/src/main` ni scripts QA principales.
- [ ] Las credenciales reales fueron rotadas en la base local y proveedor productivo.
- [x] Las URLs están parametrizadas en backend y environment productivo.
- [x] CORS está parametrizado.
- [ ] PostgreSQL está separado por entorno.
- [x] Backup y restauración funcionan en local. Se restauró una copia en `insteip_restore_test`, se verificaron 18 tablas, usuarios, cursos, matrículas, avances y certificados, y se eliminó la base temporal.
- [x] Dependencias sin vulnerabilidades altas/críticas en producción tras actualizar Angular a `20.3.25`.
- [ ] Dependencias de desarrollo auditadas y reducidas. El audit completo reporta vulnerabilidades en tooling; no llegan al bundle productivo, pero deben revisarse antes de un pipeline CI/CD público.
- [ ] Build backend correcto en la última ejecución: `SystemIntegrationTest` falló por servicio no disponible (`Connection refused`); repetir con PostgreSQL/backend de integración activo.
- [x] Build frontend correcto.
- [x] Unit tests correctos.
- [x] API super test correcto con variables de entorno QA.
- [x] Permisos por rol correctos.
- [x] Selenium completo correcto con variables de entorno QA.
- [x] Responsive base validado durante la revisión del catálogo y las vistas públicas principales.
- [x] Datos QA limpiados después de las pruebas automatizadas.
- [x] Repositorio sin las credenciales QA conocidas ni claves fallback. Las credenciales reales de producción aún deben generarse y rotarse en el VPS.
- [x] Configuración systemd documentada.
- [x] Configuración Nginx documentada.
- [x] Variables productivas documentadas sin valores reales.

Después de completar esta lista:

1. Comprar IONOS VPS M+.
2. Comprar o asociar el dominio.
3. Configurar DNS.
4. Subir la aplicación.
5. Activar HTTPS.
6. Ejecutar el smoke test post-deploy.
