# 🖥️ Información del Servidor y Despliegue — Plataforma LMS

Documento de referencia técnica con la información de acceso, configuración del servidor, claves SSH y comandos necesarios para desplegar cambios a producción.

---

## 📌 1. Información General de la Infraestructura

| Parámetro | Valor / Detalle |
|---|---|
| **Proveedor VPS** | Contabo (Cloud VPS Core 6) |
| **Dominio Principal** | [https://Plataforma LMS.com](https://Plataforma LMS.com) |
| **Proveedor DNS** | DonWeb (Apuntando registros A a `62.146.226.81`) |
| **IP del Servidor** | `62.146.226.81` |
| **Sistema Operativo** | Ubuntu 24.04 LTS |
| **Usuario SSH** | `root` |
| **Panel de Control VPS** | [my.contabo.com](https://my.contabo.com) (Sección *VPS control* -> *Manage*) |

---

## 🔑 2. Credenciales y Claves de Acceso SSH

### Acceso SSH mediante Clave Pública (Configurado y Activo)
Tu computadora y el servidor Contabo están vinculados con una clave SSH ED25519 de alta seguridad. **No necesitas escribir contraseña para conectarte o desplegar.**

- **Clave Privada Local:** `C:\Users\Alessander\.ssh\id_ed25519`
- **Clave Pública Local:** `C:\Users\Alessander\.ssh\id_ed25519.pub`
- **Identificador de Clave en Contabo:** `mi-pc-Plataforma LMS`
- **Valor de la Clave Pública:**
  ```text
  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILIOQ4wIzxMIOu1UAMULnfTLqPX9jvntmJ9NoqUmO0qp alessander@DESKTOP-MRK7PSU
  ```

### Contraseña de Usuario `root`
- **Uso:** Solo necesaria si te conectas desde otra computadora que no tenga la clave SSH autorizada o si ingresas por la consola web VNC de Contabo.
- **Gestión:** Puedes consultar la contraseña inicial en el correo de bienvenida de Contabo (*"Your VPS is ready"*) o restablecerla en cualquier momento desde el panel [my.contabo.com](https://my.contabo.com) (*VPS control -> Manage -> Password Reset*).

---

## 📁 3. Estructura de Rutas en el Servidor Producción

| Componente | Ruta en Servidor VPS |
|---|---|
| **Directorio Raíz de la App** | `/opt/Plataforma LMS/` |
| **Archivos Estáticos Frontend** | `/var/www/Plataforma LMS/` |
| **Carpeta de Assets (Imágenes)** | `/var/www/Plataforma LMS/assets/` |
| **Archivo Ejecutable Backend** | `/opt/Plataforma LMS/app/backend.jar` |
| **Archivos Subidos / Materiales** | `/opt/Plataforma LMS/data/materiales/` |
| **Configuración de Variables** | `/etc/Plataforma LMS/backend.env` |
| **Configuración Nginx (activa)** | `/etc/nginx/sites-available/Plataforma LMS` ← **ESTE es el archivo activo** |
| **Enlace simbólico Nginx** | `/etc/nginx/sites-enabled/Plataforma LMS` |

> ⚠️ **IMPORTANTE:** El archivo de configuración de Nginx que está realmente activo para `Plataforma LMS.com` es `/etc/nginx/sites-available/Plataforma LMS`, **NO** el `default`. El archivo `default` está en el servidor pero no está habilitado para este dominio.

---

## 🚀 4. Comandos de Despliegue a Producción

### A. Desplegar Solo el Frontend (El más común — Modificaciones en UI / Angular)

Ejecutar **en orden** desde PowerShell en la raíz del proyecto:

```powershell
# Paso 1: Compilar en modo producción
cd frontend
ng build --configuration production
cd ..

# Paso 2: Subir archivos al servidor
scp -r -i "C:\Users\Alessander\.ssh\id_ed25519" frontend/dist/frontend/* root@62.146.226.81:/var/www/Plataforma LMS/

# Paso 3: CRITICO — Corregir permisos del directorio assets (SIEMPRE hacerlo después del SCP)
# El SCP puede subir la carpeta assets sin permisos de lectura para Nginx (www-data),
# lo que provoca que todas las imágenes devuelvan 403 Forbidden.
ssh -i "C:\Users\Alessander\.ssh\id_ed25519" root@62.146.226.81 "chmod 755 /var/www/Plataforma LMS/assets && find /var/www/Plataforma LMS/assets -type f -exec chmod 644 {} \; && find /var/www/Plataforma LMS/assets -type d -exec chmod 755 {} \;"

# Paso 4: Recargar Nginx
ssh -i "C:\Users\Alessander\.ssh\id_ed25519" root@62.146.226.81 "systemctl reload nginx && echo 'Nginx recargado OK'"
```

---

### B. Desplegar Solo el Backend (Modificaciones en Java / Spring Boot)

```powershell
cd backend
.\mvnw.cmd clean package -DskipTests
cd ..
scp -i "C:\Users\Alessander\.ssh\id_ed25519" backend/target/*.jar root@62.146.226.81:/opt/Plataforma LMS/app/backend.jar
ssh -i "C:\Users\Alessander\.ssh\id_ed25519" root@62.146.226.81 "systemctl restart Plataforma LMS-backend"
```

---

### C. Desplegar Todo (Frontend + Backend)

```powershell
# 1. Build y subida del Frontend
cd frontend
ng build --configuration production
cd ..
scp -r -i "C:\Users\Alessander\.ssh\id_ed25519" frontend/dist/frontend/* root@62.146.226.81:/var/www/Plataforma LMS/

# 2. CRITICO — Corregir permisos assets
ssh -i "C:\Users\Alessander\.ssh\id_ed25519" root@62.146.226.81 "chmod 755 /var/www/Plataforma LMS/assets && find /var/www/Plataforma LMS/assets -type f -exec chmod 644 {} \; && find /var/www/Plataforma LMS/assets -type d -exec chmod 755 {} \;"

# 3. Recargar Nginx
ssh -i "C:\Users\Alessander\.ssh\id_ed25519" root@62.146.226.81 "systemctl reload nginx"

# 4. Build y subida del Backend
cd backend
.\mvnw.cmd clean package -DskipTests
cd ..
scp -i "C:\Users\Alessander\.ssh\id_ed25519" backend/target/*.jar root@62.146.226.81:/opt/Plataforma LMS/app/backend.jar
ssh -i "C:\Users\Alessander\.ssh\id_ed25519" root@62.146.226.81 "systemctl restart Plataforma LMS-backend"
```

---

## ⚠️ 5. Errores Conocidos y Cómo Evitarlos

### Error: Imágenes dan 403 Forbidden después del deploy
**Causa:** El directorio `/var/www/Plataforma LMS/assets/` se sube con permisos `drwx------` (solo accesible por el usuario `Plataforma LMS`). Nginx corre como `www-data` y no puede leer los archivos.

**Solución:** Ejecutar SIEMPRE después de cada SCP el paso 3 del despliegue:
```bash
chmod 755 /var/www/Plataforma LMS/assets
find /var/www/Plataforma LMS/assets -type f -exec chmod 644 {} \;
find /var/www/Plataforma LMS/assets -type d -exec chmod 755 {} \;
```

### Error: Los cambios no se ven en el navegador después del deploy
**Causa:** El navegador tiene caché del JS/CSS anterior (Nginx los cachea por 1 año en producción con `Cache-Control: public, immutable`).

**Solución:** Abrir una **pestaña de incógnito** para ver los cambios sin caché. Los usuarios que ya visitaron el sitio deben hacer `Ctrl + Shift + R` (Windows) o limpiar caché desde el navegador.

> El `index.html` siempre se sirve sin caché (`no-store, no-cache`), por lo que cada vez que Angular genera un nuevo build con hashes diferentes en los nombres de archivo, los usuarios recibirán los archivos actualizados en su próxima visita normal.

### Error: Nginx no carga el sitio de Plataforma LMS.com al editar configuración
**Causa:** Editar el archivo `/etc/nginx/sites-available/default` en lugar del archivo correcto.

**Solución:** El archivo de configuración activo es `/etc/nginx/sites-available/Plataforma LMS`. Para editar:
```bash
nano /etc/nginx/sites-available/Plataforma LMS
nginx -t          # verificar sintaxis antes de recargar
systemctl reload nginx
```

---

## 🛠️ 6. Comandos Útiles de Mantenimiento en el Servidor

Conectarse directamente por SSH:
```powershell
ssh -i "C:\Users\Alessander\.ssh\id_ed25519" root@62.146.226.81
```

- **Ver logs en tiempo real del backend:**
  ```bash
  journalctl -u Plataforma LMS-backend -f
  ```
- **Verificar estado de los servicios:**
  ```bash
  systemctl status Plataforma LMS-backend
  systemctl status nginx
  docker ps
  ```
- **Reiniciar servicios manualmente:**
  ```bash
  systemctl restart Plataforma LMS-backend
  systemctl reload nginx
  ```
- **Verificar que una imagen es accesible (reemplazar nombre):**
  ```bash
  curl -s -o /dev/null -w '%{http_code}' https://Plataforma LMS.com/assets/Plataforma LMS-logo.png
  # Debe devolver 200. Si devuelve 403, ejecutar el fix de permisos del paso 3.
  ```
- **Ver permisos del directorio assets:**
  ```bash
  ls -la /var/www/Plataforma LMS/assets/ | head -5
  # El directorio debe tener drwxr-xr-x (755), no drwx------ (700)
  ```
