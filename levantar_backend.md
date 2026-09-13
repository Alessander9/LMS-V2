# 🚀 Cómo Levantar el Backend de LMS V2 en Local

Guía rápida para iniciar la base de datos y el servidor de desarrollo local del backend en Windows.

---

## 📌 1. Prerrequisitos

Antes de iniciar, asegúrate de tener:
1. **Docker Desktop** instalado y ejecutándose.
2. **Java 17 o superior** (Java 25 recomendado/instalado en la máquina).
3. El puerto `5455` libre (para la base de datos PostgreSQL de Docker) y el puerto `8081` libre (para el servidor Spring Boot).

---

## 🔑 2. Configuración de Entorno (.env)

El archivo `.env` en la raíz del proyecto define las credenciales locales. Los valores predeterminados para desarrollo local son:

```ini
# Configuración de Base de Datos local
DB_URL=jdbc:postgresql://localhost:5455/lms_v2_db
DB_USERNAME=lms_v2_user
DB_PASSWORD=lms_v2_password

# Credenciales para levantar el contenedor PostgreSQL
POSTGRES_USER=lms_v2_user
POSTGRES_PASSWORD=lms_v2_password
POSTGRES_DB=lms_v2_db

# Clave y expiración de JWT
JWT_SECRET=N82p03maxv8rOuuQA+LhqlztHymFQ3PtBsAJi+xxsok=
JWT_EXPIRATION=1800000

# Parámetros de URLs y almacenamiento
API_BASE_URL=http://localhost:8081
FRONTEND_BASE_URL=http://localhost:4200
STORAGE_PATH=uploads
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200

# Seeder automático de usuarios de prueba (Admin, Docente, Alumno)
SEED_DEFAULT_USERS=true
SEED_ADMIN_EMAIL=admin@plataformalms.com
SEED_ADMIN_PASSWORD=admin_password
SEED_ALUMNO_EMAIL=alumno@plataformalms.com
SEED_ALUMNO_PASSWORD=alumno_password
SEED_DOCENTE_EMAIL=docente@plataformalms.com
SEED_DOCENTE_PASSWORD=docente_password
```

---

## 🛠️ 3. Pasos para Iniciar Todo

### Paso A: Levantar la Base de Datos (PostgreSQL)

1. Abre **Docker Desktop**.
2. Desde la terminal en la raíz del proyecto, ejecuta:
   ```powershell
   docker-compose up -d
   ```
3. Verifica que el contenedor `lms-v2-postgres` esté corriendo en el puerto `5455` ejecutando `docker ps`.

### Paso B: Iniciar el Backend (Spring Boot)

El script `start-backend.bat` localizado en la carpeta `backend` cargará automáticamente todas las variables por defecto por ti si no están declaradas en tu entorno.

**Opción 1: Usar el script preconfigurado (Recomendado)**
* Abre PowerShell o CMD.
* Navega a la carpeta `backend` y ejecuta:
  ```cmd
  .\start-backend.bat
  ```
  *(El backend se ejecutará en segundo plano. Puedes monitorear la salida en el archivo `run-logs/backend-current.out.log` o `backend-current.err.log`)*

**Opción 2: Comando directo de inicio manual (PowerShell)**
Si deseas ver los logs de arranque en tiempo real directamente en tu terminal actual:
```powershell
# Cargar variables en la sesión
$env:DB_URL="jdbc:postgresql://localhost:5455/lms_v2_db"
$env:DB_USERNAME="lms_v2_user"
$env:DB_PASSWORD="lms_v2_password"
$env:JWT_SECRET="N82p03maxv8rOuuQA+LhqlztHymFQ3PtBsAJi+xxsok="
$env:JWT_EXPIRATION="1800000"
$env:API_BASE_URL="http://localhost:8081"
$env:FRONTEND_BASE_URL="http://localhost:4200"
$env:STORAGE_PATH="uploads"
$env:CORS_ALLOWED_ORIGINS="http://localhost:4200,http://127.0.0.1:4200"
$env:SEED_DEFAULT_USERS="true"
$env:SEED_ADMIN_EMAIL="admin@plataformalms.com"
$env:SEED_ADMIN_PASSWORD="admin_password"
$env:SEED_ALUMNO_EMAIL="alumno@plataformalms.com"
$env:SEED_ALUMNO_PASSWORD="alumno_password"
$env:SEED_DOCENTE_EMAIL="docente@plataformalms.com"
$env:SEED_DOCENTE_PASSWORD="docente_password"

# Levantar el servidor
cd backend
.\mvnw.cmd spring-boot:run
```

---

## 🔍 4. Verificación

Una vez ejecutado, puedes comprobar que el backend está respondiendo abriendo la siguiente URL en tu navegador o mediante un comando `curl`:
* URL de salud de la API: [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health)
* Respuesta esperada: `{"status":"UP"}`

---

## 🛠️ 5. Resolución de Problemas

* **Error `Could not resolve placeholder 'JWT_SECRET'`:**
  * Ocurre si ejecutas el comando `mvnw.cmd` directamente sin declarar la variable `JWT_SECRET`. Utiliza la **Opción 1** (el script `.bat` modificado) o sigue la **Opción 2** declarando la variable.
* **Error de conexión a base de datos (`Connection refused`):**
  * Asegúrate de que Docker Desktop esté abierto y que `docker ps` devuelva el contenedor `insteip-postgres` como activo en el puerto `5455`.
