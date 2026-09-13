-- ============================================================
-- v3_matricula_expiracion.sql
-- Agrega columna fecha_expiracion a la tabla matriculas
-- y calcula su valor para los registros existentes.
-- ============================================================

-- 1. Agregar la columna fecha_expiracion si no existe
ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS fecha_expiracion TIMESTAMP;

-- 2. Calcular fecha_expiracion para las matrículas existentes
-- (12 meses después de la fecha de matrícula)
UPDATE matriculas
SET fecha_expiracion = fecha_matricula + INTERVAL '12 months'
WHERE fecha_expiracion IS NULL;

-- 3. Crear índice para optimizar la consulta del proceso nocturno
CREATE INDEX IF NOT EXISTS idx_matriculas_fecha_expiracion ON matriculas(fecha_expiracion);
