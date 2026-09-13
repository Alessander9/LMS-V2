-- ====================================================================
-- MIGRACIÓN V7: SISTEMA DE MENSAJERÍA INTERNA Y BUZÓN (100% ADITIVA)
-- Hilos de conversación, Prioridad, Doble Check, Audio y Adjuntos
-- ====================================================================

-- 1. TABLA DE CONVERSACIONES / HILOS
CREATE TABLE IF NOT EXISTS conversaciones (
    id BIGSERIAL PRIMARY KEY,
    asunto VARCHAR(200) NOT NULL,
    curso_id BIGINT,
    emisor_id BIGINT NOT NULL,
    destinatario_id BIGINT, -- NULL si es masivo o grupal
    tipo VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL', -- 'INDIVIDUAL', 'CURSO_MASIVO', 'ROL_MASIVO'
    prioridad VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- 'NORMAL', 'IMPORTANTE', 'URGENTE'
    ultimo_mensaje TEXT,
    fecha_ultimo_mensaje TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversacion_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL,
    CONSTRAINT fk_conversacion_emisor FOREIGN KEY (emisor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversacion_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices de alto rendimiento para conversaciones
CREATE INDEX IF NOT EXISTS idx_conversaciones_emisor ON conversaciones(emisor_id, fecha_ultimo_mensaje DESC);
CREATE INDEX IF NOT EXISTS idx_conversaciones_destinatario ON conversaciones(destinatario_id, fecha_ultimo_mensaje DESC);
CREATE INDEX IF NOT EXISTS idx_conversaciones_curso ON conversaciones(curso_id);

-- 2. TABLA DE MENSAJES INDIVIDUALES
CREATE TABLE IF NOT EXISTS mensajes (
    id BIGSERIAL PRIMARY KEY,
    conversacion_id BIGINT NOT NULL,
    remitente_id BIGINT NOT NULL,
    destinatario_id BIGINT,
    contenido TEXT NOT NULL,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- 'NORMAL', 'IMPORTANTE', 'URGENTE'
    adjunto_url TEXT,
    adjunto_nombre VARCHAR(200),
    adjunto_tamano VARCHAR(50),
    audio_url TEXT,
    leido BOOLEAN DEFAULT false,
    fecha_leido TIMESTAMP WITH TIME ZONE,
    destacado_remitente BOOLEAN DEFAULT false,
    destacado_destinatario BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mensaje_conversacion FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensaje_remitente FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensaje_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices de alto rendimiento para búsqueda de mensajes y conteo de no leídos
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id, fecha_envio ASC);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario_leido ON mensajes(destinatario_id, leido, fecha_envio DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id, fecha_envio DESC);
