-- Base de datos INSTEIP (Versión Mejorada)
-- Motor: PostgreSQL

-- =========================================================================
-- 1. TABLA: roles
-- =========================================================================
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 2. TABLA: niveles_suscripcion
-- =========================================================================
CREATE TABLE niveles_suscripcion (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. TABLA: usuarios
-- =========================================================================
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    rol_id BIGINT NOT NULL,
    nivel_suscripcion_id BIGINT,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    telefono VARCHAR(30),
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP,
    password_reset_token VARCHAR(100),
    password_reset_token_expira TIMESTAMP,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (rol_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_usuario_suscripcion
        FOREIGN KEY (nivel_suscripcion_id)
        REFERENCES niveles_suscripcion(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX idx_usuarios_suscripcion ON usuarios(nivel_suscripcion_id);

-- =========================================================================
-- 4. TABLA: pagos (Nueva: Gestión Manual de Pagos)
-- =========================================================================
CREATE TABLE pagos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nivel_suscripcion_id BIGINT NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    numero_operacion VARCHAR(150),
    observaciones TEXT,
    aprobado BOOLEAN DEFAULT FALSE,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP,
    aprobado_por BIGINT,

    CONSTRAINT fk_pago_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pago_suscripcion
        FOREIGN KEY (nivel_suscripcion_id)
        REFERENCES niveles_suscripcion(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_pago_aprobador
        FOREIGN KEY (aprobado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX idx_pagos_suscripcion ON pagos(nivel_suscripcion_id);
CREATE INDEX idx_pagos_aprobador ON pagos(aprobado_por);

-- =========================================================================
-- 5. TABLA: login_auditoria (Nueva: Historial de Accesos)
-- =========================================================================
CREATE TABLE login_auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    correo VARCHAR(150),
    ip VARCHAR(100),
    user_agent TEXT,
    exitoso BOOLEAN NOT NULL,
    motivo VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_login_auditoria_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_login_auditoria_usuario ON login_auditoria(usuario_id);

-- =========================================================================
-- 5b. TABLA: eventos_sistema (Nueva: Auditoría del Sistema)
-- =========================================================================
CREATE TABLE eventos_sistema (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    modulo VARCHAR(100) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_eventos_sistema_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_eventos_sistema_usuario ON eventos_sistema(usuario_id);

-- =========================================================================
-- 5c. TABLA: refresh_tokens (Nueva: Persistencia de Sesión)
-- =========================================================================
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiracion TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_token_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_usuario ON refresh_tokens(usuario_id);

-- =========================================================================
-- 6. TABLA: cursos
-- =========================================================================
CREATE TABLE cursos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    imagen_portada TEXT,
    docente_id BIGINT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_curso_docente
        FOREIGN KEY (docente_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_cursos_docente ON cursos(docente_id);


CREATE TABLE curso_niveles_suscripcion (
    id BIGSERIAL PRIMARY KEY,
    curso_id BIGINT NOT NULL,
    nivel_suscripcion_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_curso_nivel_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_curso_nivel_suscripcion
        FOREIGN KEY (nivel_suscripcion_id)
        REFERENCES niveles_suscripcion(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_curso_nivel
        UNIQUE(curso_id,nivel_suscripcion_id)
);

CREATE INDEX idx_curso_niveles_suscripcion_curso ON curso_niveles_suscripcion(curso_id);
CREATE INDEX idx_curso_niveles_suscripcion_nivel ON curso_niveles_suscripcion(nivel_suscripcion_id);

-- =========================================================================
-- 7. TABLA: modulos
-- =========================================================================
CREATE TABLE modulos (
    id BIGSERIAL PRIMARY KEY,
    curso_id BIGINT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL,
    estado BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_modulo_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_modulos_curso ON modulos(curso_id);

-- =========================================================================
-- 8. TABLA: videos
-- =========================================================================
CREATE TABLE videos (
    id BIGSERIAL PRIMARY KEY,
    modulo_id BIGINT NOT NULL,
    titulo VARCHAR(250) NOT NULL,
    descripcion TEXT,
    youtube_url TEXT NOT NULL,
    youtube_id VARCHAR(50),
    duracion_segundos INTEGER,
    orden INTEGER NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_video_modulo
        FOREIGN KEY (modulo_id)
        REFERENCES modulos(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_videos_modulo ON videos(modulo_id);

-- =========================================================================
-- 9. TABLA: materiales (Mejorada: Relación con Módulos)
-- =========================================================================
CREATE TABLE materiales (
    id BIGSERIAL PRIMARY KEY,
    modulo_id BIGINT NOT NULL,
    nombre VARCHAR(250) NOT NULL,
    archivo_url TEXT NOT NULL,
    archivo_interno VARCHAR(120) NOT NULL UNIQUE,
    tipo_archivo VARCHAR(100),
    peso_bytes BIGINT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_material_modulo
        FOREIGN KEY (modulo_id)
        REFERENCES modulos(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_materiales_modulo ON materiales(modulo_id);

-- =========================================================================
-- 10. TABLA: matriculas
-- =========================================================================
CREATE TABLE matriculas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    curso_id BIGINT NOT NULL,
    fecha_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_matricula_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_matricula_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_matricula_usuario_curso
        UNIQUE (usuario_id, curso_id)
);

CREATE INDEX idx_matriculas_usuario ON matriculas(usuario_id);
CREATE INDEX idx_matriculas_curso ON matriculas(curso_id);

-- =========================================================================
-- 11. TABLA: avance_videos
-- =========================================================================
CREATE TABLE avance_videos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    video_id BIGINT NOT NULL,
    ultimo_segundo INTEGER DEFAULT 0,
    porcentaje_visto NUMERIC(5,2) DEFAULT 0,
    completado BOOLEAN DEFAULT FALSE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_avance_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_avance_video
        FOREIGN KEY (video_id)
        REFERENCES videos(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_avance_usuario_video
        UNIQUE (usuario_id, video_id)
);

CREATE INDEX idx_avance_videos_usuario ON avance_videos(usuario_id);
CREATE INDEX idx_avance_videos_video ON avance_videos(video_id);

-- =========================================================================
-- 12. TABLA: avance_cursos
-- =========================================================================
CREATE TABLE avance_cursos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    curso_id BIGINT NOT NULL,
    porcentaje_avance NUMERIC(5,2) DEFAULT 0,
    completado BOOLEAN DEFAULT FALSE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_avancecurso_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_avancecurso_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_avance_usuario_curso
        UNIQUE (usuario_id, curso_id)
);

CREATE INDEX idx_avance_cursos_usuario ON avance_cursos(usuario_id);
CREATE INDEX idx_avance_cursos_curso ON avance_cursos(curso_id);

-- =========================================================================
-- 13. TABLA: certificados (Mejorada con validación y registro)
-- =========================================================================
CREATE TABLE certificados (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    curso_id BIGINT NOT NULL,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    archivo_pdf TEXT,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url_validacion TEXT,
    numero_registro VARCHAR(100),

    CONSTRAINT fk_cert_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_cert_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_certificado_usuario_curso
        UNIQUE (usuario_id, curso_id)
);

CREATE INDEX idx_certificados_usuario ON certificados(usuario_id);
CREATE INDEX idx_certificados_curso ON certificados(curso_id);

-- =========================================================================
-- 14. TABLA: plantilla_certificado (Nueva: Gestión de Plantillas)
-- =========================================================================
CREATE TABLE plantilla_certificado (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    imagen_fondo TEXT,
    firma_director TEXT,
    cargo_director VARCHAR(150),
    activo BOOLEAN DEFAULT TRUE
);

-- =========================================================================
-- 15. TABLA: configuracion_institucion
-- =========================================================================
CREATE TABLE configuracion_institucion (
    id BIGSERIAL PRIMARY KEY,
    nombre_institucion VARCHAR(250),
    logo_url TEXT,
    correo VARCHAR(150),
    telefono VARCHAR(50),
    direccion VARCHAR(250),
    qr_yape TEXT,
    qr_plin TEXT,
    paypal_url TEXT,
    color_principal VARCHAR(50),
    color_secundario VARCHAR(50)
);

-- =========================================================================
-- 16. TABLA: matricula_modulos_acceso (Gestión de Acceso Modular por Cuotas)
-- =========================================================================
CREATE TABLE IF NOT EXISTS matricula_modulos_acceso (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL,
    modulo_id BIGINT NOT NULL,
    habilitado BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_habilitacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_acceso_matricula
        FOREIGN KEY (matricula_id)
        REFERENCES matriculas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_acceso_modulo
        FOREIGN KEY (modulo_id)
        REFERENCES modulos(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_matricula_modulo_acceso
        UNIQUE (matricula_id, modulo_id)
);

CREATE INDEX idx_matricula_modulos_matricula ON matricula_modulos_acceso(matricula_id);
CREATE INDEX idx_matricula_modulos_modulo ON matricula_modulos_acceso(modulo_id);

