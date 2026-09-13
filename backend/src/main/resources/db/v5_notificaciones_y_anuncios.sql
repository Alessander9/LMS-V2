-- ====================================================================
-- MIGRACIÓN V5: SISTEMA DE NOTIFICACIONES Y ANUNCIOS POP-UP (ADITIVA)
-- ====================================================================

-- 1. TABLA DE NOTIFICACIONES DE USUARIO
CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'VIDEO_NUEVO', 'MATERIAL_NUEVO', 'TAREA_NUEVA', 'TAREA_CALIFICADA', 'TAREA_POR_VENCER', 'MATRICULA_NUEVA', 'ENTREGA_DOCENTE', 'COMUNICADO_GLOBAL'
    url_destino VARCHAR(500),
    icono VARCHAR(50) DEFAULT 'notifications',
    leido BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices de alto rendimiento para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leido ON notificaciones(usuario_id, leido, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON notificaciones(fecha_creacion DESC);

-- 2. TABLA DE ANUNCIOS Y OFERTAS EN MODAL (POP-UP)
CREATE TABLE IF NOT EXISTS anuncios_modal (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT,
    imagen_url VARCHAR(500),
    boton_texto VARCHAR(100) DEFAULT 'Ver Más',
    boton_url VARCHAR(500),
    audiencia VARCHAR(50) DEFAULT 'TODOS', -- 'TODOS', 'SOLO_ESTUDIANTES', 'SOLO_DOCENTES', 'DOCENTES_Y_ESTUDIANTES'
    activo BOOLEAN DEFAULT true,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    creado_por VARCHAR(150),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsqueda de anuncios activos vigentes
CREATE INDEX IF NOT EXISTS idx_anuncios_modal_activo ON anuncios_modal(activo, fecha_creacion DESC);
