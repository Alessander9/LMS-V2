# 🚀 Guía de Despliegue en Servidores VPS — Plataforma LMS

Esta guía documenta los pasos para desplegar la arquitectura completa de Plataforma LMS (Frontend Angular + Backend Spring Boot + Base de Datos PostgreSQL) en cualquier servidor Linux Ubuntu.

---

## 🏗️ 1. Arquitectura de Despliegue

- **Frontend:** Angular compilado estáticamente servido por Nginx.
- **Backend:** Spring Boot (Java 17/21) ejecutándose como servicio systemd.
- **Base de Datos:** PostgreSQL en Docker o nativo en localhost:5432.
- **Proxy Inverso & SSL:** Nginx con Certbot (Let's Encrypt).

---

## 🛠️ 2. Puesta en Marcha Inicial

1. Ejecutar el script de aprovisionamiento en el VPS:
   ```bash
   sudo ./scripts/deploy-setup.sh
   ```
2. Configurar el archivo `/etc/plataforma-lms/backend.env` con las variables de producción:
   - `DB_URL=jdbc:postgresql://localhost:5432/lms_db`
   - `DB_USERNAME=lms_user`
   - `DB_PASSWORD=...`
   - `JWT_SECRET=...`
   - `API_BASE_URL=https://plataformalms.com`

---

## 🔄 3. Actualización Continua

Para desplegar nuevas versiones desde tu máquina de desarrollo:
```bash
./scripts/deploy-update.sh root@<IP_DEL_VPS>
```
