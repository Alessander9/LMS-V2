#!/bin/bash
# =============================================================================
#  🚀 Plataforma LMS — Script de Actualización Automática
#  Ejecutar desde tu PC LOCAL cada vez que quieras desplegar cambios
#  Compila backend + frontend, los sube al servidor y reinicia servicios
# =============================================================================

set -e

# ─── Colores ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_step()  { echo -e "\n${CYAN}[${1}/6]${NC} ${BOLD}${2}${NC}"; echo -e "${CYAN}──────────────────────────────────────────────${NC}\n"; }
print_ok()    { echo -e "  ${GREEN}✅ ${1}${NC}"; }
print_warn()  { echo -e "  ${YELLOW}⚠️  ${1}${NC}"; }
print_err()   { echo -e "  ${RED}❌ ${1}${NC}"; }

# ─── Configuración ────────────────────────────────────────────────────────────

# Configura aquí tus datos (o pásalos como argumentos):
#   ./deploy-update.sh usuario@ip-server
SERVER="${1:-}"
SSH_KEY="${2:-}"  # Opcional: ruta a clave SSH, ej: ~/.ssh/id_rsa

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# ─── Función de ayuda ────────────────────────────────────────────────────────
show_help() {
    echo ""
    echo -e "${BOLD}Uso:${NC}"
    echo "  ./$(basename "$0") <usuario@servidor> [clave_ssh]"
    echo ""
    echo -e "${BOLD}Ejemplos:${NC}"
    echo "  ./$(basename "$0") root@123.123.123.123"
    echo "  ./$(basename "$0") root@midominio.com ~/.ssh/id_rsa"
    echo ""
    echo -e "${BOLD}Opciones:${NC}"
    echo "  --help      Muestra esta ayuda"
    echo "  --skip-build   Solo sube archivos (no recompila)"
    echo "  --skip-frontend  No compila ni sube el frontend"
    echo "  --skip-backend   No compila ni sube el backend"
    echo ""
    exit 0
}

# ─── Procesar flags ──────────────────────────────────────────────────────────
SKIP_BUILD=false
SKIP_FRONTEND=false
SKIP_BACKEND=false

for arg in "$@"; do
    case "$arg" in
        --help) show_help ;;
        --skip-build) SKIP_BUILD=true ;;
        --skip-frontend) SKIP_FRONTEND=true ;;
        --skip-backend) SKIP_BACKEND=true ;;
    esac
done

# ─── Validaciones ─────────────────────────────────────────────────────────────
if [ "$1" = "--help" ]; then show_help; fi

if [ -z "$SERVER" ]; then
    print_err "Debes especificar el servidor."
    echo "  Uso: ./$(basename "$0") <usuario@servidor>"
    echo "  Ej:  ./$(basename "$0") root@midominio.com"
    exit 1
fi

SSH_CMD="ssh -o StrictHostKeyChecking=accept-new" 
SCP_CMD="scp -o StrictHostKeyChecking=accept-new"
if [ -n "$SSH_KEY" ]; then
    SSH_CMD="$SSH_CMD -i $SSH_KEY"
    SCP_CMD="$SCP_CMD -i $SSH_KEY"
fi

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🚀  Plataforma LMS — Deploy Automático                    ║${NC}"
echo -e "${CYAN}║  Servidor: ${BOLD}${SERVER}${NC}                         ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 1: Verificar conectividad
# ──────────────────────────────────────────────────────────────────────────────
print_step 1 "Verificar conectividad con el servidor"

if $SSH_CMD "$SERVER" "echo OK" > /dev/null 2>&1; then
    print_ok "Conexión SSH exitosa a ${SERVER}"
else
    print_err "No se puede conectar a ${SERVER}"
    echo "  Verifica:"
    echo "    - Que el servidor esté encendido"
    echo "    - Que la IP/dominio sea correcta"
    echo "    - Que tengas acceso SSH configurado"
    exit 1
fi

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 2: Compilar backend
# ──────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_BACKEND" = false ]; then
    if [ "$SKIP_BUILD" = false ]; then
        print_step 2 "Compilar backend (Spring Boot)"

        cd "$PROJECT_DIR/backend"

        if [ ! -f "./mvnw" ]; then
            print_err "No se encuentra ./mvnw en backend/. ¿Estás en el directorio correcto?"
            exit 1
        fi

        ./mvnw clean package -DskipTests -q

        JAR_FILE="target/backend-0.0.1-SNAPSHOT.jar"
        if [ ! -f "$JAR_FILE" ]; then
            # Buscar cualquier JAR
            JAR_FILE=$(ls -t target/*.jar 2>/dev/null | head -1)
            if [ -z "$JAR_FILE" ]; then
                print_err "No se encontró el JAR compilado en target/"
                exit 1
            fi
        fi

        print_ok "Backend compilado: $(basename "$JAR_FILE")"
    else
        print_step 2 "Compilar backend (SKIP — usando JAR existente)"
        JAR_FILE="target/backend-0.0.1-SNAPSHOT.jar"
        if [ ! -f "$PROJECT_DIR/backend/$JAR_FILE" ]; then
            JAR_FILE=$(ls -t "$PROJECT_DIR/backend/target/"*.jar 2>/dev/null | head -1)
            JAR_FILE="${JAR_FILE#$PROJECT_DIR/backend/}"
        fi
    fi
else
    print_step 2 "Compilar backend (SKIP — omitido por --skip-backend)"
fi

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 3: Compilar frontend
# ──────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_FRONTEND" = false ]; then
    if [ "$SKIP_BUILD" = false ]; then
        print_step 3 "Compilar frontend (Angular)"

        cd "$PROJECT_DIR/frontend"

        if [ ! -d "node_modules" ]; then
            print_warn "node_modules no encontrado. Instalando dependencias..."
            npm install
        fi

        npm run build -- --configuration production --no-progress 2>&1 | tail -3

        if [ ! -d "dist/frontend" ]; then
            print_err "La compilación del frontend falló. Verifica errores arriba."
            exit 1
        fi

        print_ok "Frontend compilado en dist/frontend/"
    else
        print_step 3 "Compilar frontend (SKIP — usando build existente)"
    fi
else
    print_step 3 "Compilar frontend (SKIP — omitido por --skip-frontend)"
fi

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 4: Subir archivos al servidor
# ──────────────────────────────────────────────────────────────────────────────
print_step 4 "Subir archivos al servidor"

cd "$PROJECT_DIR"

# Subir backend
if [ "$SKIP_BACKEND" = false ]; then
    echo "  Subiendo backend..."
    $SCP_CMD "backend/${JAR_FILE}" "${SERVER}:/opt/Plataforma LMS/app/backend.jar"
    print_ok "Backend subido (app/backend.jar)"
fi

# Subir frontend
if [ "$SKIP_FRONTEND" = false ]; then
    echo "  Subiendo frontend..."
    $SSH_CMD "$SERVER" "mkdir -p /var/www/Plataforma LMS"
    $SCP_CMD -r "frontend/dist/frontend/"* "${SERVER}:/var/www/Plataforma LMS/"
    print_ok "Frontend subido correctamente"
fi

# Subir scripts SQL (si existen)
if [ -f "database/schema.sql" ]; then
    $SCP_CMD "database/schema.sql" "${SERVER}:/opt/Plataforma LMS/database/" 2>/dev/null || true
fi
if [ -f "database/seed.sql" ]; then
    $SCP_CMD "database/seed.sql" "${SERVER}:/opt/Plataforma LMS/database/" 2>/dev/null || true
fi

print_ok "Archivos transferidos correctamente"

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 5: Reiniciar servicios en el servidor
# ──────────────────────────────────────────────────────────────────────────────
print_step 5 "Reiniciar servicios en el servidor"

if [ "$SKIP_BACKEND" = false ]; then
    echo "  Reiniciando backend..."
    $SSH_CMD "$SERVER" "systemctl restart Plataforma LMS-backend" && print_ok "Backend reiniciado" || print_err "Error al reiniciar backend"
fi

if [ "$SKIP_FRONTEND" = false ]; then
    echo "  Recargando Nginx (no necesita reinicio)..."
    $SSH_CMD "$SERVER" "systemctl reload nginx" 2>/dev/null || $SSH_CMD "$SERVER" "systemctl restart nginx"
    print_ok "Nginx recargado"
fi

# ──────────────────────────────────────────────────────────────────────────────
#  PASO 6: Verificar despliegue
# ──────────────────────────────────────────────────────────────────────────────
print_step 6 "Verificar estado del despliegue"

echo "  Esperando que el backend inicie... (hasta 60s)"

# Health check con reintentos (hasta 60s)
HEALTH="000"
for i in $(seq 1 30); do
    HEALTH=$($SSH_CMD "$SERVER" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8081/actuator/health" 2>/dev/null || echo "000")
    if [ "$HEALTH" = "200" ]; then
        break
    fi
    sleep 2
done

if [ "$HEALTH" = "200" ]; then
    print_ok "Backend saludable (HTTP 200)"
elif [ "$HEALTH" != "000" ]; then
    print_warn "Backend respondió con código HTTP ${HEALTH}"
else
    print_warn "Health check no disponible después de 60s"
fi

# Verificar frontend
FRONTEND_FILES=$($SSH_CMD "$SERVER" "ls /var/www/Plataforma LMS/index.html 2>/dev/null && echo 'OK' || echo 'NO'")
if [ "$FRONTEND_FILES" = "OK" ]; then
    print_ok "Frontend desplegado correctamente"
fi

# Logs del backend (últimas líneas)
echo ""
echo -e "  ${BOLD}Últimos logs del backend:${NC}"
$SSH_CMD "$SERVER" "journalctl -u Plataforma LMS-backend -n 5 --no-pager 2>/dev/null" || echo "  (no hay logs disponibles)"

# ─── Resumen ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉  DESPLIEGUE COMPLETADO                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Servidor:${NC}    ${SERVER}"
echo -e "  ${BOLD}Health:${NC}      https://dominio/actuator/health"
echo ""
echo -e "  ${YELLOW}⚠️  Si algo falla, revisa los logs:${NC}"
echo "    ssh ${SERVER} 'journalctl -u Plataforma LMS-backend -f'"
echo ""

# ─── Tiempo total ────────────────────────────────────────────────────────────
echo -e "  ${BOLD}Tiempo total:${NC} ${SECONDS}s"
echo ""
