-- ====================================================================
-- MIGRACIÓN V6: MEJORAS EN COMUNICADOS (100% ADITIVA Y SEGURA)
-- Prioridad visual, Fijar comunicados (Pin) y Adjuntos descargables
-- ====================================================================

-- Agregar columnas aditivas sin alterar los datos existentes
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'INFO';
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS fijado BOOLEAN DEFAULT false;
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS adjunto_url VARCHAR(500);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS adjunto_nombre VARCHAR(200);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS adjunto_tamano VARCHAR(50);

-- Índice para acelerar la consulta de notificaciones fijadas y recientes
CREATE INDEX IF NOT EXISTS idx_notificaciones_fijado_fecha ON notificaciones(usuario_id, fijado DESC, fecha_creacion DESC);
