# 🖥️ Guía de Servidores y Despliegue — Plataforma LMS

Documento técnico de referencia para el despliegue y mantenimiento de la plataforma en cualquier servidor VPS (Ubuntu 22.04 / 24.04 LTS).

---

## 📌 1. Información General de la Infraestructura

| Parámetro | Valor / Placeholder |
|---|---|
| **Proveedor VPS** | VPS Genérico (Ubuntu 24.04 LTS / 22.04 LTS) |
| **Dominio Principal** | `https://${APP_DOMAIN}` (ej. `https://plataformalms.com`) |
| **IP del Servidor** | `<IP_DEL_VPS>` |
| **Usuario SSH** | `root` (o usuario con privilegios `sudo`) |
| **Puertos de Red** | `80` (HTTP), `443` (HTTPS), `22` (SSH) |

---

## 🔑 2. Acceso SSH y Seguridad

Para desplegar de forma segura sin contraseñas:

1. **Generar clave SSH local (si no existe):**
   ```bash
   ssh-keygen -t ed25519 -C "admin@plataformalms.com"
   ```
2. **Copiar la clave pública a tu servidor:**
   ```bash
   ssh-copy-id root@<IP_DEL_VPS>
   ```
3. **Probar conexión:**
   ```bash
   ssh root@<IP_DEL_VPS>
   ```

---

## 📁 3. Estructura de Rutas Estándar en el Servidor

| Componente | Ruta en Servidor VPS |
|---|---|
| **Directorio Raíz de la App** | `/opt/plataforma-lms/` |
| **Archivos Estáticos Frontend** | `/var/www/plataforma-lms/` |
| **Carpeta de Assets (Imágenes)** | `/var/www/plataforma-lms/assets/` |
| **Archivo Ejecutable Backend** | `/opt/plataforma-lms/app/backend.jar` |
| **Archivos Subidos / Materiales** | `/opt/plataforma-lms/data/materiales/` |
| **Configuración de Variables** | `/etc/plataforma-lms/backend.env` |
| **Configuración Nginx** | `/etc/nginx/sites-available/plataforma-lms` |
| **Servicio Systemd Backend** | `/etc/systemd/system/plataforma-lms-backend.service` |

---

## 🚀 4. Comandos de Despliegue a Producción

### A. Desplegar Solo el Frontend (Angular)
```powershell
# 1. Compilar frontend en local
cd frontend
npm run build
cd ..

# 2. Subir archivos compilados al servidor
scp -r frontend/dist/frontend/* root@<IP_DEL_VPS>:/var/www/plataforma-lms/

# 3. Asegurar permisos de lectura en el servidor y recargar Nginx
ssh root@<IP_DEL_VPS> "chmod 755 /var/www/plataforma-lms/assets && find /var/www/plataforma-lms/assets -type f -exec chmod 644 {} \; && find /var/www/plataforma-lms/assets -type d -exec chmod 755 {} \;"
ssh root@<IP_DEL_VPS> "systemctl reload nginx"
```

---

### B. Desplegar Solo el Backend (Spring Boot)
```powershell
# 1. Compilar backend en local
cd backend
mvn clean package -DskipTests
cd ..

# 2. Subir JAR al servidor
scp backend/target/*.jar root@<IP_DEL_VPS>:/opt/plataforma-lms/app/backend.jar

# 3. Reiniciar servicio del backend
ssh root@<IP_DEL_VPS> "systemctl restart plataforma-lms-backend"
```

---

### C. Despliegue Automatizado Completo
Puedes utilizar el script universal incluido en el repositorio:
```bash
./scripts/deploy-update.sh root@<IP_DEL_VPS>
```

---

## 📋 5. Comandos de Diagnóstico en el Servidor

```bash
# Ver estado de los servicios
systemctl status plataforma-lms-backend
systemctl status nginx

# Ver logs en tiempo real del backend
journalctl -u plataforma-lms-backend -f -n 100

# Probar configuración de Nginx
nginx -t

# Ver uso de recursos
htop
free -h
df -h
```
