-- Datos iniciales y de prueba para INSTEIP (Versión Mejorada)
-- Motor: PostgreSQL

-- =========================================================================
-- 1. SEED: roles
-- =========================================================================
INSERT INTO roles (nombre) VALUES
('ADMINISTRADOR'),
('DOCENTE'),
('ALUMNO')
ON CONFLICT (nombre) DO NOTHING;

-- =========================================================================
-- 2. SEED: niveles_suscripcion
-- =========================================================================
INSERT INTO niveles_suscripcion (nombre, descripcion) VALUES
('BASICO', 'Acceso a cursos introductorios y material de lectura básico.'),
('INTERMEDIO', 'Acceso a cursos especializados, talleres prácticos y soporte moderado.'),
('PREMIUM', 'Acceso completo e ilimitado a todos los cursos, tutorías personalizadas y certificados oficiales.')
ON CONFLICT (nombre) DO NOTHING;

-- =========================================================================
-- 3. SEED: usuarios
-- =========================================================================
INSERT INTO usuarios (rol_id, nivel_suscripcion_id, nombres, apellidos, correo, password_hash, telefono) VALUES
(
  (SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR'),
  NULL,
  'Admin',
  'Insteip',
  'admin@insteip.com',
  '$2b$12$bri6YkCKP0IdTNWppx5RwO/5rqlH4gDftHHuLqSAxApcal9akw5yq',
  '+51 987654321'
),
(
  (SELECT id FROM roles WHERE nombre = 'DOCENTE'),
  NULL,
  'Carlos Alberto',
  'Docente Prado',
  'docente@insteip.com',
  '$2b$12$itDYwja7vYFphrRYO37rpulZi2AlRyLH97eoofNNeQOOftzZznSEO',
  '+51 999111222'
),
(
  (SELECT id FROM roles WHERE nombre = 'ALUMNO'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'BASICO'),
  'Juan Carlos',
  'Pérez Gómez',
  'juan.perez@insteip.com',
  '$2b$12$tdNEq3dmIAzzoWaJNz3TG.9QcbxVJSPWAvQi8hjCgMM53rVdhAAQO',
  '+51 912345678'
)
ON CONFLICT (correo) DO NOTHING;

-- =========================================================================
-- 4. SEED: pagos (NUEVO: Control Manual de Transacciones)
-- =========================================================================
-- Pago 1: Pendiente de aprobación (Juan Pérez solicita Intermedio)
INSERT INTO pagos (usuario_id, nivel_suscripcion_id, monto, metodo_pago, numero_operacion, observaciones, aprobado, fecha_pago) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'INTERMEDIO'),
  49.90,
  'YAPE',
  'OPER-99887766',
  'Transferencia realizada el lunes por la tarde. Adjunta captura.',
  FALSE,
  CURRENT_TIMESTAMP - INTERVAL '1 day'
);

-- =========================================================================
-- 5. SEED: login_auditoria (NUEVO)
-- =========================================================================
INSERT INTO login_auditoria (usuario_id, correo, ip, user_agent, exitoso, motivo) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  'juan.perez@insteip.com',
  '192.168.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0',
  TRUE,
  NULL
),
(
  NULL,
  'usuario.inexistente@insteip.com',
  '192.168.1.50',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/126.0',
  FALSE,
  'Credenciales inválidas'
);

-- =========================================================================
-- 6. SEED: cursos
-- =========================================================================
INSERT INTO cursos (nombre, descripcion, imagen_portada, docente_id) VALUES
(
  'Desarrollo Web Moderno con Angular',
  'Aprende a construir aplicaciones SPA escalables, rápidas y profesionales usando Angular 17+, TypeScript, RxJS y standalone components.',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  (SELECT id FROM usuarios WHERE correo = 'docente@insteip.com')
),
(
  'Backend Robusto con Spring Boot y JPA',
  'Domina la creación de REST APIs empresariales usando Spring Boot, Spring Security (JWT), PostgreSQL y Spring Data JPA de forma práctica.',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
  NULL
),
(
  'Arquitectura de Microservicios y DevOps Cloud',
  'Aprende a diseñar, desplegar y escalar microservicios en la nube usando Spring Cloud, Docker, Kubernetes, AWS y pipelines CI/CD con GitHub Actions.',
  'https://images.unsplash.com/photo-1607799279861-4dd421887fb3',
  NULL
),
(
  'Curso de Auriculoterapia',
  'Aprende auriculoterapia paso a paso, desde los fundamentos y cartografía auricular hasta tratamientos prácticos y casos reales.',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
  (SELECT id FROM usuarios WHERE correo = 'docente@insteip.com')
);

INSERT INTO curso_niveles_suscripcion (curso_id, nivel_suscripcion_id) VALUES
(
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'BASICO')
),
(
  (SELECT id FROM cursos WHERE nombre = 'Backend Robusto con Spring Boot y JPA'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'INTERMEDIO')
),
(
  (SELECT id FROM cursos WHERE nombre = 'Arquitectura de Microservicios y DevOps Cloud'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'PREMIUM')
),
(
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'BASICO')
),
(
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'INTERMEDIO')
),
(
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'PREMIUM')
);

-- =========================================================================
-- 7. SEED: modulos
-- =========================================================================
INSERT INTO modulos (curso_id, nombre, descripcion, orden) VALUES
(
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  'Módulo 1: Fundamentos de Angular',
  'Configuración del entorno, creación de proyectos con Angular CLI y arquitectura de la plataforma.',
  1
),
(
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  'Módulo 2: Componentes y Directivas',
  'Ciclo de vida de un componente, enlaces de datos (binding), directivas estructurales y de atributos.',
  2
),
(
  (SELECT id FROM cursos WHERE nombre = 'Backend Robusto con Spring Boot y JPA'),
  'Módulo 1: Iniciando con Spring Boot',
  'Configuración con Spring Initializr, estructura del proyecto y controladores REST básicos.',
  1
),
(
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia'),
  'Introducción',
  'Conceptos básicos e introducción al curso.',
  1
),
(
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia'),
  'Módulo 1',
  'Primeros pasos y cartografía auricular.',
  2
),
(
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia'),
  'Módulo 2',
  'Técnicas avanzadas y puntos auriculares clave.',
  3
),
(
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia'),
  'Módulo 3',
  'Tratamientos y prácticas de auriculoterapia.',
  4
),
(
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia'),
  'Módulo 4',
  'Auriculoterapia en vivo, moxibustión y cierre del curso.',
  5
);

-- =========================================================================
-- 8. SEED: videos
-- =========================================================================
INSERT INTO videos (modulo_id, titulo, descripcion, youtube_url, youtube_id, duracion_segundos, orden) VALUES
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Fundamentos de Angular'),
  '1.1. Introducción e Instalación del Entorno',
  'Aprenderemos a instalar Node.js, Angular CLI y a crear nuestro primer workspace.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  720,
  1
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Fundamentos de Angular'),
  '1.2. Arquitectura de un Proyecto Angular',
  'Estructura de archivos, modulos, componentes y la inyección de dependencias explicada.',
  'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
  '3JZ_D3ELwOQ',
  900,
  2
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 2: Componentes y Directivas'),
  '2.1. Creando nuestro primer Componente',
  'Cómo definir plantillas, estilos y lógica en un componente de Angular.',
  'https://www.youtube.com/watch?v=k5E2AV3-O90',
  'k5E2AV3-O90',
  1050,
  1
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Iniciando con Spring Boot'),
  '1.1. Hola Mundo con Spring Initializr',
  'Generación de dependencias iniciales, configuración de pom.xml y ejecución del primer REST Controller.',
  'https://www.youtube.com/watch?v=9SGDpanrc8U',
  '9SGDpanrc8U',
  800,
  1
),
-- Videos: Curso de Auriculoterapia - Introducción
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Introducción'),
  'Introducción a la Auriculoterapia',
  'Bienvenida al curso y conceptos iniciales sobre la auriculoterapia.',
  'https://youtu.be/9vSB2e9A5q0',
  '9vSB2e9A5q0',
  600,
  1
),
-- Videos: Curso de Auriculoterapia - Módulo 1
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 1'),
  'Clase 1',
  'Desarrollo de la clase 1 del módulo 1.',
  'https://youtu.be/5fg18BLWt0U',
  '5fg18BLWt0U',
  900,
  1
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 1'),
  'Clase 2',
  'Desarrollo de la clase 2 del módulo 1.',
  'https://youtu.be/3m1IQaVbLRw',
  '3m1IQaVbLRw',
  900,
  2
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 1'),
  'Clase 3',
  'Desarrollo de la clase 3 del módulo 1.',
  'https://youtu.be/cYzeuBDbIFc',
  'cYzeuBDbIFc',
  900,
  3
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 1'),
  'Clase 4',
  'Desarrollo de la clase 4 del módulo 1.',
  'https://youtu.be/obaNtWmOy7g',
  'obaNtWmOy7g',
  900,
  4
),
-- Videos: Curso de Auriculoterapia - Módulo 2
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 2'),
  'Clase 5',
  'Desarrollo de la clase 5 del módulo 2.',
  'https://youtu.be/W_hdH2EqtQI',
  'W_hdH2EqtQI',
  900,
  1
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 2'),
  'Clase 6',
  'Desarrollo de la clase 6 del módulo 2.',
  'https://youtu.be/8CiXAwcPLAY',
  '8CiXAwcPLAY',
  900,
  2
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 2'),
  'Clase 7',
  'Desarrollo de la clase 7 del módulo 2.',
  'https://youtu.be/FMmg_JfFGuY',
  'FMmg_JfFGuY',
  900,
  3
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 2'),
  'Clase 8',
  'Desarrollo de la clase 8 del módulo 2.',
  'https://youtu.be/6mbEUrLPTBg',
  '6mbEUrLPTBg',
  900,
  4
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 2'),
  'Clase 9',
  'Desarrollo de la clase 9 del módulo 2.',
  'https://youtu.be/vX9xJiHjzT8',
  'vX9xJiHjzT8',
  900,
  5
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 2'),
  'Clase 10',
  'Desarrollo de la clase 10 del módulo 2.',
  'https://youtu.be/wqRiNEMhbPg',
  'wqRiNEMhbPg',
  900,
  6
),
-- Videos: Curso de Auriculoterapia - Módulo 3
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 3'),
  'Auriculoterapia 1',
  'Práctica de auriculoterapia sesión 1.',
  'https://youtu.be/aUPMVQmhxCM',
  'aUPMVQmhxCM',
  1000,
  1
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 3'),
  'Auriculoterapia 2',
  'Práctica de auriculoterapia sesión 2.',
  'https://youtu.be/KaYa1rlpCJ4',
  'KaYa1rlpCJ4',
  1000,
  2
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 3'),
  'Auriculoterapia 3',
  'Práctica de auriculoterapia sesión 3.',
  'https://youtu.be/2ZvOx8PXWSo',
  '2ZvOx8PXWSo',
  1000,
  3
),
-- Videos: Curso de Auriculoterapia - Módulo 4
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 4'),
  'Auriculoterapia en vivo',
  'Sesión práctica en vivo de auriculoterapia.',
  'https://youtu.be/V0TLDL5ht4s',
  'V0TLDL5ht4s',
  1200,
  1
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 4'),
  'Auriculoterapia y moxbustion',
  'Integración de la auriculoterapia con moxibustión.',
  'https://youtu.be/QKJDQJmDbAc',
  'QKJDQJmDbAc',
  1200,
  2
),
(
  (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') AND nombre = 'Módulo 4'),
  'Auriculoterapia Final',
  'Conclusiones y cierre del curso de auriculoterapia.',
  'https://youtu.be/iqkafhRFi_s',
  'iqkafhRFi_s',
  1200,
  3
);

-- =========================================================================
-- 9. SEED: materiales (Mejorado: Asociados a Módulos)
-- =========================================================================
INSERT INTO materiales (modulo_id, nombre, archivo_url, archivo_interno, tipo_archivo, peso_bytes) VALUES
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Fundamentos de Angular'),
  'Guía de Instalación del Entorno (PDF)',
  'http://localhost:8081/api/materiales/1/download',
  'guia-instalacion.pdf',
  'application/pdf',
  2548000 -- ~2.4 MB
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Fundamentos de Angular'),
  'Ejercicios Resueltos - Sesión 1',
  'http://localhost:8081/api/materiales/2/download',
  'ejercicios-s1.zip',
  'application/zip',
  1450000 -- ~1.38 MB
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Iniciando con Spring Boot'),
  'Código Fuente del Hola Mundo (GitHub)',
  'https://github.com/insteip-cursos/spring-boot-hello-world',
  'hello-world-link',
  'url',
  NULL
);

-- =========================================================================
-- 10. SEED: matriculas
-- =========================================================================
INSERT INTO matriculas (usuario_id, curso_id) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular')
),
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia')
);

-- =========================================================================
-- 11. SEED: avance_videos
-- =========================================================================
INSERT INTO avance_videos (usuario_id, video_id, ultimo_segundo, porcentaje_visto, completado) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM videos WHERE titulo = '1.1. Introducción e Instalación del Entorno'),
  720,
  100.00,
  TRUE
),
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM videos WHERE titulo = '1.2. Arquitectura de un Proyecto Angular'),
  450,
  50.00,
  FALSE
);

-- =========================================================================
-- 12. SEED: avance_cursos
-- =========================================================================
INSERT INTO avance_cursos (usuario_id, curso_id, porcentaje_avance, completado) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  50.00,
  FALSE
);

-- =========================================================================
-- 13. SEED: certificados (Mejorado con URL de validación y Nro Registro)
-- =========================================================================
INSERT INTO certificados (usuario_id, curso_id, codigo, archivo_pdf, url_validacion, numero_registro) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  'INS-2026-ABX9F2K8',
  'http://localhost:8081/api/certificados/1/download',
  'http://localhost:4200/certificados/validar/INS-2026-ABX9F2K8',
  'REG-2026-90812'
);

-- =========================================================================
-- 14. SEED: plantilla_certificado (NUEVO)
-- =========================================================================
INSERT INTO plantilla_certificado (nombre, imagen_fondo, firma_director, cargo_director, activo) VALUES
(
  'Plantilla Oficial INSTEIP v1',
  '',
  'Director Académico',
  'Director de Asuntos Académicos',
  TRUE
);

-- =========================================================================
-- 15. SEED: configuracion_institucion
-- =========================================================================
INSERT INTO configuracion_institucion (nombre_institucion, logo_url, correo_contacto, telefono, qr_yape, qr_plin, paypal_url) VALUES
(
  'INSTEIP - Instituto de Terapias Integrales',
  'http://localhost:4200/assets/insteip-logo.png',
  'contacto@insteip.com',
  '+51 999 888 777',
  '',
  '',
  'https://paypal.me/insteip'
);

-- =========================================================================
-- 16. SEED: tareas
-- =========================================================================
INSERT INTO tareas (modulo_id, titulo, descripcion, fecha_limite, permitir_reenvio, estado, fecha_creacion) VALUES
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1' AND curso_id = (SELECT id FROM cursos WHERE nombre = 'Curso de Auriculoterapia') LIMIT 1),
  'Práctica Evaluativa: Cartografía Auricular y Protocolo de Relajación (Shen Men)',
  'Realiza la identificación y marcado de los puntos de la zona auricular correspondientes a la Fosa Escafoidea y Concha Cava. Describe el procedimiento de desinfección, aplicación de semillas o microesferas de acupuntura y la pauta de estimulación para el tratamiento del estrés y ansiedad. Sube tu ficha de práctica o registro fotográfico del procedimiento en formato PDF o Word.',
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP
);

