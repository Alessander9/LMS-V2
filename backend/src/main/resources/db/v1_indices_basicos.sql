-- Script de optimización básica de base de datos PostgreSQL
-- Creación de índices en llaves foráneas y columnas de consulta frecuente

-- 1. Índices para la tabla 'pagos'
CREATE INDEX IF NOT EXISTS idx_pagos_usuario_id ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_nivel_suscripcion_id ON pagos(nivel_suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON pagos(fecha_pago);

-- 2. Índices para la tabla 'login_auditoria'
CREATE INDEX IF NOT EXISTS idx_login_auditoria_usuario_id ON login_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_login_auditoria_correo ON login_auditoria(correo);
CREATE INDEX IF NOT EXISTS idx_login_auditoria_fecha ON login_auditoria(fecha);

-- 3. Índices para la tabla 'eventos_sistema'
CREATE INDEX IF NOT EXISTS idx_eventos_usuario_id ON eventos_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos_sistema(fecha);

-- 4. Índices para la tabla 'avance_cursos'
CREATE INDEX IF NOT EXISTS idx_avance_cursos_curso_id ON avance_cursos(curso_id);
