-- Script de optimizaciones avanzadas de base de datos PostgreSQL

-- 1. Habilitar la extensión de monitoreo de rendimiento pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. Configurar autovacuum de forma más agresiva en las tablas de auditoría/logs
-- Esto limpia el espacio ocupado por registros eliminados/actualizados de forma rápida
ALTER TABLE login_auditoria SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_vacuum_threshold = 50,
    autovacuum_analyze_scale_factor = 0.02,
    autovacuum_analyze_threshold = 25
);

ALTER TABLE eventos_sistema SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_vacuum_threshold = 50,
    autovacuum_analyze_scale_factor = 0.02,
    autovacuum_analyze_threshold = 25
);

-- 3. Crear índice parcial en la tabla 'usuarios' para optimizar la búsqueda de usuarios activos
-- Como la mayoría de búsquedas son para usuarios activos, reduce el tamaño del índice y lo acelera
CREATE INDEX IF NOT EXISTS idx_usuarios_activos_correo ON usuarios(correo) WHERE estado = true;
