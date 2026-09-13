# Guía histórica de despliegue — INSTEIP en IONOS VPS

> Documento obsoleto para la infraestructura actual. INSTEIP está desplegado en Contabo con el dominio gestionado en DonWeb. Para el estado vigente consultar `docs/estado_deploy_contabo_donweb.md`.

> **Versión:** 1.0 — Julio 2026  
> **Stack:** Angular 18 + Spring Boot 3.4 + PostgreSQL 15 + Nginx  
> **Servidor:** IONOS VPS M+ (4 vCPU, 4 GB RAM, 120 GB NVMe, $11/mes)

---

## 📋 Prerrequisitos

### 1. Contratar VPS en IONOS

1. Ir a [IONOS VPS](https://www.ionos.com/servers/vps)
2. Seleccionar plan **VPS M+** (4 vCPU, 4 GB RAM, 120 GB NVMe)
3. Elegir **Ubuntu 24.04 LTS** como sistema operativo
4. Configurar nombre de dominio (ej. `insteip.com`) — IONOS incluye .COM
5. Completar compra y esperar credenciales SSH

### 2. Herramientas locales necesarias

| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20+ | Compilar frontend Angular |
| Java JDK | 21 | Compilar backend Spring Boot |
| Maven | 3.9+ | Build del backend |
| Git | — | Subir código al servidor |
| SSH Client | — | Conectarse al VPS |

---

## 🔧 Configuración Inicial del Servidor

### Paso 1: Conectarse al VPS por SSH

```bash
# Reemplaza con la IP y usuario que IONOS te asignó
ssh root@<IP_DEL_VPS>
```

> Si usas usuario no-root, antepone `sudo` a todos los comandos.

### Paso 2: Actualizar sistema

```bash
apt update && apt upgrade -y
```

### Paso 3: Instalar dependencias

```bash
# Java 21 (JDK para ejecutar JAR)
apt install -y openjdk-21-jre-headless

# Nginx
apt install -y nginx

# Docker y Docker Compose
apt install -y docker.io docker-compose

# Certbot para SSL
apt install -y certbot python3-certbot-nginx

# Git
apt install -y git

# Verificar instalaciones
java -version
nginx -v
docker --version
docker-compose --version
```

### Paso 4: Configurar firewall básico

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## 📁 Estructura de Archivos en el Servidor

```
/opt/insteip/
├── backend.jar              ← App Spring Boot compilada
├── database/
│   ├── schema.sql           ← Esquema SQL
│   └── seed.sql             ← Datos iniciales
├── docker-compose.yml       ← Config de PostgreSQL
├── frontend/                ← Angular compilado (archivos estáticos)
│   └── browser/
└── data/                    ← Archivos subidos por usuarios
    └── materiales/
```

---

## 🗄️ Paso 5: PostgreSQL con Docker

### 5.1 Crear estructura de directorios

```bash
mkdir -p /opt/insteip/database
cd /opt/insteip
```

### 5.2 Crear `docker-compose.yml`

```bash
nano docker-compose.yml
```

Pegar este contenido:

```yaml
version: '3.8'

services:
  postgres-db:
    image: postgres:15-alpine
    container_name: insteip-postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "127.0.0.1:5455:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

> **Seguridad:** Define `POSTGRES_PASSWORD` fuera del repositorio; nunca escribas una contraseña real en este archivo.
> Los scripts `schema.sql` y `seed.sql` se ejecutarán a través de Spring Boot con `ddl-auto=update`, por lo que no son necesarios en el docker-compose.

### 5.3 Iniciar PostgreSQL

```bash
docker-compose up -d
docker ps  # Verificar que el contenedor esté corriendo
```

---

## 🏗️ Paso 6: Compilar y Subir Backend

### 6.1 Compilar localmente (en tu PC)

```bash
# En tu máquina local, desde la raíz del proyecto
cd backend

# Compilar y empaquetar JAR
./mvnw clean package -DskipTests

# El JAR se genera en:
# backend/target/backend-0.0.1-SNAPSHOT.jar
```

### 6.2 Subir JAR al servidor

```bash
# Desde tu máquina local
scp backend/target/backend-0.0.1-SNAPSHOT.jar root@<IP_DEL_VPS>:/opt/insteip/backend.jar

# Subir scripts SQL (soporte para seed manual)
scp database/schema.sql root@<IP_DEL_VPS>:/opt/insteip/database/
scp database/seed.sql root@<IP_DEL_VPS>:/opt/insteip/database/
```

---

## 🎨 Paso 7: Compilar y Subir Frontend

### 7.1 Compilar localmente (en tu PC)

```bash
# En tu máquina local, desde la raíz del proyecto
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Editar environment.prod.ts con la URL real
# nano src/environments/environment.prod.ts
```

Editar `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tudominio.com/api'   // ← Cambiar por tu dominio real
};
```

Compilar:

```bash
npm run build

# Los archivos estáticos se generan en:
# frontend/dist/frontend/browser/
```

### 7.2 Subir frontend compilado al servidor

```bash
# Desde tu máquina local
scp -r frontend/dist/frontend/browser/* root@<IP_DEL_VPS>:/opt/insteip/frontend/
```

---

## 🔗 Paso 8: Configurar Nginx como Proxy Reverso

### 8.1 Crear configuración de Nginx

```bash
nano /etc/nginx/sites-available/insteip
```

Pegar este contenido (reemplaza `tudominio.com`):

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Frontend Angular (archivos estáticos)
    root /opt/insteip/frontend;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;

    # Archivos estáticos con caché
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API → Backend Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts largos para subida de archivos (100MB)
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 110M;
    }

    # Health check de Actuator
    location /actuator/health {
        proxy_pass http://127.0.0.1:8081/actuator/health;
        proxy_set_header Host $host;
    }

    # SPA: todas las rutas no coincidentes → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 8.2 Activar sitio

```bash
ln -s /etc/nginx/sites-available/insteip /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Eliminar default

nginx -t  # Verificar configuración
systemctl reload nginx
```

---

## 🔒 Paso 9: SSL con Certbot (HTTPS)

```bash
certbot --nginx -d tudominio.com -d www.tudominio.com
```

Sigue las instrucciones interactivas:
- Ingresa tu correo electrónico
- Acepta los términos de servicio
- Elige si redirigir todo el tráfico a HTTPS (recomendado: **Sí**)

Certbot automáticamente:
- Obtiene certificado SSL gratuito
- Modifica la configuración de Nginx para HTTPS
- Programa renovación automática (cada 90 días)

Verificar renovación automática:

```bash
certbot renew --dry-run
```

---

## ⚙️ Paso 10: Crear Archivo de Servicio Systemd para el Backend

Para que el backend se inicie automáticamente al encender el servidor:

```bash
nano /etc/systemd/system/insteip-backend.service
```

Pegar:

```ini
[Unit]
Description=INSTEIP Backend Service
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=insteip
Group=insteip
WorkingDirectory=/opt/insteip
Environment="DB_URL=jdbc:postgresql://localhost:5455/insteip_db"
Environment="DB_USERNAME=insteip_user"
EnvironmentFile=/etc/insteip/backend.env
Environment="STORAGE_PATH=/opt/insteip/data"
Environment="API_BASE_URL=https://tudominio.com"
Environment="FRONTEND_BASE_URL=https://tudominio.com"
ExecStart=/usr/bin/java -jar /opt/insteip/backend.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Registrar e iniciar:

```bash
systemctl daemon-reload
systemctl enable insteip-backend
systemctl start insteip-backend
```

Verificar:

```bash
systemctl status insteip-backend
journalctl -u insteip-backend -f  # Ver logs en tiempo real
```

---

## 🧪 Paso 11: Verificar el Despliegue

### 11.1 Probar endpoints

```bash
# Health check
curl https://tudominio.com/actuator/health

# Login QA: usa QA_ADMIN_EMAIL y QA_ADMIN_PASSWORD; no pongas credenciales en el historial de shell.

# Deberías recibir un token JWT
```

### 11.2 Verificar frontend

Abrir en el navegador: `https://tudominio.com`

- [ ] La página de inicio carga correctamente
- [ ] El login funciona
- [ ] El dashboard se ve bien
- [ ] Los videos de YouTube se reproducen
- [ ] La subida de archivos funciona

### 11.3 Verificar archivos subidos

```bash
ls -la /opt/insteip/data/materiales/
```

---

## 📦 Resumen de Comandos Útiles

### Gestión del Backend

```bash
systemctl start insteip-backend      # Iniciar
systemctl stop insteip-backend       # Detener
systemctl restart insteip-backend   # Reiniciar
systemctl status insteip-backend    # Estado
journalctl -u insteip-backend -f    # Logs en vivo
```

### Gestión de PostgreSQL

```bash
docker-compose -f /opt/insteip/docker-compose.yml up -d   # Iniciar
docker-compose -f /opt/insteip/docker-compose.yml down    # Detener
docker logs insteip-postgres -f                           # Logs
```

### Gestión de Nginx

```bash
systemctl reload nginx          # Recargar configuración
systemctl restart nginx         # Reiniciar
nginx -t                        # Validar configuración
```

---

## 🔄 Actualizar la Aplicación

### Actualizar Backend

```bash
# 1. En tu PC: compilar nuevo JAR
cd backend && ./mvnw clean package -DskipTests

# 2. Subir al servidor
scp backend/target/backend-0.0.1-SNAPSHOT.jar root@<IP>:/opt/insteip/backend.jar

# 3. En el servidor: reiniciar
systemctl restart insteip-backend
```

### Actualizar Frontend

```bash
# 1. En tu PC: compilar
cd frontend && npm run build

# 2. Subir al servidor
scp -r frontend/dist/frontend/browser/* root@<IP>:/opt/insteip/frontend/

# 3. No necesita reinicio — Nginx sirve los archivos nuevos inmediatamente
```

---

## 💾 Backup y Restauración

### Backup automático (cron diario)

```bash
# Crear script de backup
nano /opt/insteip/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/insteip"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
docker exec insteip-postgres pg_dump -U insteip_user insteip_db > $BACKUP_DIR/db_$DATE.sql

# Backup de archivos subidos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /opt/insteip/data/

# Eliminar backups mayores a 30 días
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completado: $DATE"
```

```bash
chmod +x /opt/insteip/backup.sh

# Agregar al crontab (se ejecuta a las 3 AM)
echo "0 3 * * * /opt/insteip/backup.sh" | crontab -
```

### Restaurar desde backup

```bash
# Restaurar BD
cat /backups/insteip/db_20260701_030000.sql | docker exec -i insteip-postgres psql -U insteip_user insteip_db

# Restaurar archivos
tar -xzf /backups/insteip/files_20260701_030000.tar.gz -C /
```

---

## 📊 Monitoreo

### Recursos del servidor

```bash
htop                    # CPU y RAM en tiempo real
df -h                   # Espacio en disco
docker stats            # Estado de contenedores
```

### Logs de la aplicación

```bash
# Backend
journalctl -u insteip-backend -n 100 --no-pager

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL
docker logs insteip-postgres --tail 50
```

---

## 🛟 Solución de Problemas Comunes

### "Port 8081 already in use"
```bash
netstat -tlnp | grep 8081
kill <PID>
systemctl restart insteip-backend
```

### "Connection refused" a PostgreSQL
```bash
docker ps                    # ¿El contenedor está running?
docker logs insteip-postgres # ¿Hay errores?
systemctl restart docker     # Reiniciar Docker si es necesario
docker-compose up -d        # Recrear contenedor
```

### Nginx no sirve el frontend
```bash
nginx -t                    # Validar configuración
ls -la /opt/insteip/frontend/  # ¿Existen los archivos?
systemctl reload nginx      # Recargar configuración
```

### Certificado SSL por vencer
```bash
certbot renew               # Renovar manualmente
certbot renew --dry-run     # Probar renovación automática
```

---

## 🏁 Checklist Final de Despliegue

- [ ] VPS contratado y accesible por SSH
- [ ] Ubuntu 24.04 actualizado
- [ ] Java 21, Nginx, Docker, Certbot instalados
- [ ] PostgreSQL corriendo en Docker
- [ ] Backend JAR compilado y subido
- [ ] Frontend compilado y subido
- [ ] Nginx configurado como proxy reverso
- [ ] SSL/HTTPS funcionando con Certbot
- [ ] Servicio systemd creado y habilitado
- [ ] Firewall configurado (ufw)
- [ ] Backup automático configurado
- [ ] Login QA funciona usando `QA_ADMIN_EMAIL` y `QA_ADMIN_PASSWORD`.
- [ ] Página principal carga por HTTPS
- [ ] Archivos se pueden subir y descargar

---

> 📝 **Nota:** Todas las contraseñas en esta guía son de ejemplo.  
> **En producción, usa contraseñas seguras y variables de entorno diferentes.**
