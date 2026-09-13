-- ============================================================
-- v4_tareas_y_entregas.sql
-- Tablas aditivas para el sistema de tareas y entregas de alumnos
-- ============================================================

-- 1. Tabla de Tareas asignadas a un módulo
CREATE TABLE IF NOT EXISTS tareas (
    id BIGSERIAL PRIMARY KEY,
    modulo_id BIGINT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    titulo VARCHAR(250) NOT NULL,
    descripcion TEXT,
    fecha_limite TIMESTAMP,
    permitir_reenvio BOOLEAN NOT NULL DEFAULT TRUE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Entregas realizadas por los alumnos
CREATE TABLE IF NOT EXISTS entregas_tareas (
    id BIGSERIAL PRIMARY KEY,
    tarea_id BIGINT NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    archivo_url TEXT NOT NULL,
    archivo_interno VARCHAR(120) NOT NULL UNIQUE,
    tipo_archivo VARCHAR(100),
    peso_bytes BIGINT,
    comentario_alumno TEXT,
    calificacion NUMERIC(4, 2), -- Escala 0 a 20
    feedback_docente TEXT,
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_calificacion TIMESTAMP,
    estado VARCHAR(30) NOT NULL DEFAULT 'ENTREGADO', -- 'ENTREGADO', 'APROBADO', 'DESAPROBADO', 'OBSERVADO'
    CONSTRAINT uq_entrega_tarea_usuario UNIQUE (tarea_id, usuario_id)
);

-- 3. Índices para consultas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_tareas_modulo ON tareas(modulo_id);
CREATE INDEX IF NOT EXISTS idx_entregas_tarea ON entregas_tareas(tarea_id);
CREATE INDEX IF NOT EXISTS idx_entregas_usuario ON entregas_tareas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entregas_tarea_usuario ON entregas_tareas(tarea_id, usuario_id);
