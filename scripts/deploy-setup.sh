#!/bin/bash
# =============================================================================
#  🚀 Plataforma LMS — Script de Configuración Inicial del Servidor
#  Ejecutar UNA SOLA VEZ en el VPS (como root)
#  Ubuntu 24.04 LTS | IONOS VPS M+
# =============================================================================

set -e

# ─── Colores ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_step()   { echo -e "\n${CYAN}══════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  [${1}/10]${NC} ${BOLD}${2}${NC}"; echo -e "${CYAN}══════════════════════════════════════════════════${NC}\n"; }
print_ok()     { echo -e "  ${GREEN}✅ ${1}${NC}"; }
print_warn()   { echo -e "  ${YELLOW}⚠️  ${1}${NC}"; }
print_err()    { echo -e "  ${RED}❌ ${1}${NC}"; }

# ─── Validación inicial ───────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
    print_err "Este script debe ejecutarse como root (o con sudo)."
    exit 1
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${BOLD}Plataforma LMS — Configuración Inicial del Servidor${NC}        ${CYAN}║${NC}"
echo -e "${CYAN}║  ${BOLD}Ubuntu 24.04 LTS | IONOS VPS M+${NC}                   ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ─── Leer variables del usuario ──────────────────────────────────────────────
echo -e "${BOLD}Ingresa los datos de configuración:${NC}\n"

read -p "  Dominio (ej. Plataforma LMS.com): " DOMAIN
read -p "  Email para Certbot/SSL: " SSL_EMAIL
read -sp "  Contraseña para PostgreSQL: " DB_PASSWORD
echo ""

# ─── Verificaciones previas ──────────────────────────────────────────────────
if [ -z "$DOMAIN" ] || [ -z "$SSL_EMAIL" ] || [ -z "$DB_PASSWORD" ]; then
    print_err "Todos los campos son obligatorios."
    exit 1
fi

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 1: Actualizar sistema
# ──────────────────────────────────────────────────────────────────────────────
print_step 1 "Actualizar paquetes del sistema"

apt update && apt upgrade -y
print_ok "Sistema actualizado"

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 2: Instalar dependencias
# ──────────────────────────────────────────────────────────────────────────────
print_step 2 "Instalar dependencias (Java, Nginx, Docker, Certbot, Git)"

apt install -y \
    openjdk-21-jre-headless \
    nginx \
    docker.io \
    docker-compose \
    certbot python3-certbot-nginx \
    git \
    ufw

print_ok "openjdk-21-jre-headless: $(java -version 2>&1 | head -1)"
print_ok "nginx: $(nginx -v 2>&1 | head -1)"
print_ok "docker: $(docker --version)"
print_ok "docker-compose: $(docker-compose --version 2>/dev/null || echo '(instalado)')"

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 3: Configurar Firewall (UFW)
# ──────────────────────────────────────────────────────────────────────────────
print_step 3 "Configurar firewall (UFW)"

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
print_ok "Firewall activado (SSH + Nginx Full)"
ufw status verbose | head -5

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 4: Crear estructura de directorios y usuario del sistema
# ──────────────────────────────────────────────────────────────────────────────
print_step 4 "Crear estructura de directorios y usuario del sistema"

# Crear usuario sin privilegios 'Plataforma LMS'
if ! id "Plataforma LMS" &>/dev/null; then
    useradd -r -s /bin/false Plataforma LMS
    print_ok "Usuario del sistema 'Plataforma LMS' creado"
else
    print_ok "Usuario 'Plataforma LMS' ya existe"
fi

mkdir -p /opt/Plataforma LMS/database
mkdir -p /opt/Plataforma LMS/data/materiales

# Asignar pertenencia de la carpeta de datos al usuario Plataforma LMS
chown -R Plataforma LMS:Plataforma LMS /opt/Plataforma LMS/data
chmod -R 750 /opt/Plataforma LMS/data

print_ok "Directorios creados en /opt/Plataforma LMS/ y permisos asignados a 'Plataforma LMS'"

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 5: Iniciar PostgreSQL con Docker
# ──────────────────────────────────────────────────────────────────────────────
print_step 5 "Configurar e iniciar PostgreSQL con Docker"

cat > /opt/Plataforma LMS/docker-compose.yml <<EOF
version: '3.8'

services:
  postgres-db:
    image: postgres:15-alpine
    container_name: Plataforma LMS-postgres
    restart: always
    environment:
      POSTGRES_USER: Plataforma LMS_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: Plataforma LMS_db
    ports:
      - "5455:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

cd /opt/Plataforma LMS
docker-compose up -d

# Esperar a que PostgreSQL esté listo (hasta 30s)
print_ok "Esperando que PostgreSQL inicie..."
PG_READY=false
for i in $(seq 1 15); do
    if docker exec Plataforma LMS-postgres pg_isready -U Plataforma LMS_user > /dev/null 2>&1; then
        PG_READY=true
        break
    fi
    sleep 2
done

if [ "$PG_READY" = true ]; then
    print_ok "PostgreSQL 15 corriendo en puerto 5455"
else
    print_warn "PostgreSQL no responde después de 30s. Verifica con: docker logs Plataforma LMS-postgres"
fi

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 6: Configurar Nginx
# ──────────────────────────────────────────────────────────────────────────────
print_step 6 "Configurar Nginx como proxy reverso"

cat > /etc/nginx/sites-available/Plataforma LMS <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    root /opt/Plataforma LMS/frontend;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 110M;
    }

    location /actuator/health {
        proxy_pass http://127.0.0.1:8081/actuator/health;
        proxy_set_header Host \$host;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Activar sitio
ln -sf /etc/nginx/sites-available/Plataforma LMS /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx && print_ok "Nginx configurado y funcionando" || print_err "Error en configuración de Nginx"

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 7: Obtener SSL con Certbot
# ──────────────────────────────────────────────────────────────────────────────
print_step 7 "Obtener certificado SSL con Certbot (HTTPS)"

certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "${SSL_EMAIL}" \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}" \
    --redirect \
    || print_warn "Certbot falló. Ejecuta manualmente: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"

if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    print_ok "SSL activo para ${DOMAIN}"
    # Probar renovación automática
    certbot renew --dry-run > /dev/null 2>&1 && print_ok "Renovación automática configurada" || print_warn "Verifica renovación con: certbot renew --dry-run"
fi

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 8: Crear servicio systemd para el backend
# ──────────────────────────────────────────────────────────────────────────────
print_step 8 "Crear servicio systemd para el backend"

cat > /etc/systemd/system/Plataforma LMS-backend.service <<EOF
[Unit]
Description=Plataforma LMS Backend Service
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=Plataforma LMS
Group=Plataforma LMS
WorkingDirectory=/opt/Plataforma LMS
Environment="DB_URL=jdbc:postgresql://localhost:5455/Plataforma LMS_db"
Environment="DB_USERNAME=Plataforma LMS_user"
Environment="DB_PASSWORD=${DB_PASSWORD}"
Environment="STORAGE_PATH=/opt/Plataforma LMS/data"
Environment="API_BASE_URL=https://${DOMAIN}"
Environment="FRONTEND_BASE_URL=https://${DOMAIN}"
ExecStart=/usr/bin/java -Xms256m -Xmx1024m -jar /opt/Plataforma LMS/app/backend.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable Plataforma LMS-backend
print_ok "Servicio systemd creado (Plataforma LMS-backend)"

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 9: Crear script de backup automático
# ──────────────────────────────────────────────────────────────────────────────
print_step 9 "Configurar backup automático"

cat > /opt/Plataforma LMS/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups/Plataforma LMS"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec Plataforma LMS-postgres pg_dump -U Plataforma LMS_user Plataforma LMS_db > $BACKUP_DIR/db_$DATE.sql
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /opt/Plataforma LMS/data/
find $BACKUP_DIR -type f -mtime +30 -delete

echo "[$(date)] Backup completado: db_$DATE.sql + files_$DATE.tar.gz"
EOF

chmod +x /opt/Plataforma LMS/backup.sh

# Agregar al crontab (3 AM todos los días)
(crontab -l 2>/dev/null | grep -v "/opt/Plataforma LMS/backup.sh"; echo "0 3 * * * /opt/Plataforma LMS/backup.sh") | crontab -

print_ok "Backup diario configurado (3:00 AM, retención 30 días)"

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 10: Resumen final
# ──────────────────────────────────────────────────────────────────────────────
print_step 10 "Resumen del despliegue"

echo ""
echo -e "  ${BOLD}URL del sitio:${NC}       https://${DOMAIN}"
echo -e "  ${BOLD}Health check:${NC}        https://${DOMAIN}/actuator/health"
echo -e "  ${BOLD}PostgreSQL:${NC}          puerto 5455, usuario: Plataforma LMS_user"
echo -e "  ${BOLD}Backend JAR:${NC}         /opt/Plataforma LMS/app/backend.jar"
echo -e "  ${BOLD}Frontend:${NC}            /opt/Plataforma LMS/frontend/"
echo -e "  ${BOLD}Archivos subidos:${NC}    /opt/Plataforma LMS/data/materiales/"
echo -e "  ${BOLD}Backups:${NC}             /backups/Plataforma LMS/ (diario 3 AM)"
echo ""

print_warn "Próximos pasos MANUALES necesarios:"
echo ""
echo "  1. Compila el backend en tu PC:"
echo "     cd backend && ./mvnw clean package -DskipTests"
echo ""
echo "  2. Sube el JAR al servidor:"
echo "     scp backend/target/backend-0.0.1-SNAPSHOT.jar root@<IP>:/opt/Plataforma LMS/app/backend.jar"
echo ""
echo "  3. Compila el frontend en tu PC:"
echo "     cd frontend && npm install && npm run build"
echo ""
echo "  4. Sube el frontend al servidor:"
echo "     scp -r frontend/dist/frontend/browser/* root@<IP>:/opt/Plataforma LMS/frontend/"
echo ""
echo "  5. Inicia el backend:"
echo "     systemctl start Plataforma LMS-backend"
echo ""
echo "  6. ¡Listo! Abre https://${DOMAIN} en tu navegador"
echo ""

if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉  CONFIGURACIÓN COMPLETADA EXITOSAMENTE     ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
else
    echo -e "${YELLOW}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  Configuración completada (sin SSL)        ║${NC}"
    echo -e "${YELLOW}║  Ejecuta manualmente para SSL:                 ║${NC}"
    echo -e "${YELLOW}║  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} ${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════╝${NC}"
fi
