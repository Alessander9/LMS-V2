package com.insteip.backend.infrastructure.config;

import com.insteip.backend.domain.entity.*;
import com.insteip.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final NivelSuscripcionRepository nivelSuscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final CertificadoRepository certificadoRepository;
    private final ModuloRepository moduloRepository;
    private final VideoRepository videoRepository;
    private final AvanceVideoRepository avanceVideoRepository;
    private final MatriculaRepository matriculaRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${application.frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${SEED_DEFAULT_USERS:false}")
    private boolean seedDefaultUsers;

    @Value("${SEED_ADMIN_EMAIL:}")
    private String seedAdminEmail;

    @Value("${SEED_ADMIN_PASSWORD:}")
    private String seedAdminPassword;

    @Value("${SEED_ALUMNO_EMAIL:}")
    private String seedAlumnoEmail;

    @Value("${SEED_ALUMNO_PASSWORD:}")
    private String seedAlumnoPassword;

    @Value("${SEED_DOCENTE_EMAIL:}")
    private String seedDocenteEmail;

    @Value("${SEED_DOCENTE_PASSWORD:}")
    private String seedDocentePassword;

    @Override
    public void run(String... args) throws Exception {
        // 1. Asegurar roles base
        rolRepository.findByNombre("ADMINISTRADOR")
                .orElseGet(() -> rolRepository.save(Rol.builder().nombre("ADMINISTRADOR").estado(true).build()));
        rolRepository.findByNombre("DOCENTE")
                .orElseGet(() -> rolRepository.save(Rol.builder().nombre("DOCENTE").estado(true).build()));
        rolRepository.findByNombre("ALUMNO")
                .orElseGet(() -> rolRepository.save(Rol.builder().nombre("ALUMNO").estado(true).build()));

        // 2. Seedar Niveles de Suscripción si está vacío
        if (nivelSuscripcionRepository.count() == 0) {
            NivelSuscripcion basico = NivelSuscripcion.builder().nombre("BASICO").descripcion("Acceso básico").estado(true).build();
            NivelSuscripcion intermedio = NivelSuscripcion.builder().nombre("INTERMEDIO").descripcion("Acceso intermedio").estado(true).build();
            NivelSuscripcion premium = NivelSuscripcion.builder().nombre("PREMIUM").descripcion("Acceso completo").estado(true).build();
            nivelSuscripcionRepository.save(basico);
            nivelSuscripcionRepository.save(intermedio);
            nivelSuscripcionRepository.save(premium);
        }

        // 3. Seedar Usuarios de prueba con contraseñas encriptadas
        if (seedDefaultUsers && usuarioRepository.count() == 0) {
            Rol adminRol = rolRepository.findByNombre("ADMINISTRADOR").orElse(null);
            Rol docenteRol = rolRepository.findByNombre("DOCENTE").orElse(null);
            Rol alumnoRol = rolRepository.findByNombre("ALUMNO").orElse(null);
            NivelSuscripcion premium = nivelSuscripcionRepository.findAll().stream()
                    .filter(n -> n.getNombre().equals("PREMIUM"))
                    .findFirst()
                    .orElse(null);

            if (adminRol != null) {
                Usuario admin = Usuario.builder()
                        .nombres("Admin")
                        .apellidos("Insteip")
                        .correo(seedAdminEmail)
                        .passwordHash(passwordEncoder.encode(seedAdminPassword))
                        .rol(adminRol)
                        .estado(true)
                        .build();
                usuarioRepository.save(admin);
            }

            if (alumnoRol != null) {
                Usuario alumno = Usuario.builder()
                        .nombres("Juan")
                        .apellidos("Pérez")
                        .correo(seedAlumnoEmail)
                        .passwordHash(passwordEncoder.encode(seedAlumnoPassword))
                        .rol(alumnoRol)
                        .nivelSuscripcion(premium)
                        .estado(true)
                        .build();
                usuarioRepository.save(alumno);
            }

            if (docenteRol != null) {
                Usuario docente = Usuario.builder()
                        .nombres("Carla")
                        .apellidos("Gutiérrez")
                        .correo(seedDocenteEmail)
                        .passwordHash(passwordEncoder.encode(seedDocentePassword))
                        .rol(docenteRol)
                        .estado(true)
                        .build();
                usuarioRepository.save(docente);
            }
        } else if (seedDefaultUsers) {
            // Asegurar que nombres, apellidos, suscripción premium y contraseñas coincidan exactamente con el super-test
            usuarioRepository.findByCorreo(seedAdminEmail).ifPresent(admin -> {
                admin.setPasswordHash(passwordEncoder.encode(seedAdminPassword));
                usuarioRepository.save(admin);
            });
            usuarioRepository.findByCorreo(seedAlumnoEmail).ifPresent(juan -> {
                if (!"Juan".equals(juan.getNombres()) || !"Pérez".equals(juan.getApellidos())) {
                    juan.setNombres("Juan");
                    juan.setApellidos("Pérez");
                }
                NivelSuscripcion premium = nivelSuscripcionRepository.findAll().stream()
                        .filter(n -> n.getNombre().equals("PREMIUM"))
                        .findFirst()
                        .orElse(null);
                if (premium != null) {
                    juan.setNivelSuscripcion(premium);
                }
                juan.setPasswordHash(passwordEncoder.encode(seedAlumnoPassword));
                usuarioRepository.save(juan);
            });
            usuarioRepository.findByCorreo(seedDocenteEmail).ifPresent(docente -> {
                if (!"Carla".equals(docente.getNombres()) || !"Gutiérrez".equals(docente.getApellidos())) {
                    docente.setNombres("Carla");
                    docente.setApellidos("Gutiérrez");
                }
                Rol docenteRol = rolRepository.findByNombre("DOCENTE").orElse(null);
                if (docenteRol != null) {
                    docente.setRol(docenteRol);
                }
                docente.setPasswordHash(passwordEncoder.encode(seedDocentePassword));
                usuarioRepository.save(docente);
            });
        }

        // 4. Seedar Cursos si no existe "Excel Avanzado"
        Curso excel = cursoRepository.findAll().stream()
                .filter(c -> c.getNombre().equals("Excel Avanzado"))
                .findFirst()
                .orElse(null);

        if (excel == null) {
            java.util.List<NivelSuscripcion> todos = nivelSuscripcionRepository.findAll();

            excel = Curso.builder()
                    .nombre("Excel Avanzado")
                    .descripcion("Curso completo de Excel avanzado, macros, tablas dinámicas y análisis de datos.")
                    .imagenPortada("https://images.unsplash.com/photo-1551288049-bebda4e38f71")
                    .nivelesSuscripcion(todos)
                    .estado(false)
                    .fechaCreacion(LocalDateTime.now())
                    .build();
            excel = cursoRepository.save(excel);
        }

        // Seed Module, Video, and AvanceVideo if they do not exist for this course
        if (moduloRepository.findByCursoIdOrderByOrdenAsc(excel.getId()).isEmpty()) {
            Modulo modulo = Modulo.builder()
                    .curso(excel)
                    .nombre("Módulo 1: Fórmulas y Funciones")
                    .descripcion("Aprende a usar BuscarV, Coincidir, SI anidado y fórmulas matriciales.")
                    .orden(1)
                    .estado(true)
                    .build();
            modulo = moduloRepository.save(modulo);

            Video video = Video.builder()
                    .modulo(modulo)
                    .titulo("1.1. BuscarV vs BuscarX")
                    .descripcion("Aprende la diferencia entre las dos funciones de búsqueda más importantes de Excel.")
                    .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .youtubeId("dQw4w9WgXcQ")
                    .duracionSegundos(600)
                    .orden(1)
                    .estado(true)
                    .fechaCreacion(LocalDateTime.now())
                    .build();
            video = videoRepository.save(video);

            Usuario juan = usuarioRepository.findByCorreo("juan.perez@insteip.com").orElse(null);
            if (juan != null) {
                AvanceVideo avance = AvanceVideo.builder()
                        .usuario(juan)
                        .video(video)
                        .ultimoSegundo(600)
                        .porcentajeVisto(java.math.BigDecimal.valueOf(100.0))
                        .completado(true)
                        .fechaActualizacion(LocalDateTime.now())
                        .build();
                avanceVideoRepository.save(avance);
            }
        }

        // 5. Seedar Matrícula de prueba (Juan -> Excel Avanzado)
        if (matriculaRepository.count() == 0) {
            Usuario juan = usuarioRepository.findByCorreo("juan.perez@insteip.com").orElse(null);
            if (juan != null && excel != null) {
                Matricula matricula = Matricula.builder()
                        .usuario(juan)
                        .curso(excel)
                        .estado(true)
                        .build();
                matriculaRepository.save(matricula);
            }
        }

        // 6. Seedar Certificado de prueba
        if (certificadoRepository.count() == 0) {
            Usuario juan = usuarioRepository.findByCorreo("juan.perez@insteip.com").orElse(null);
            if (juan != null && excel != null) {
                Certificado cert = Certificado.builder()
                        .usuario(juan)
                        .curso(excel)
                        .codigo("INS-2026-ABX9F2K8")
                        .archivoPdf("")
                        .urlValidacion(frontendBaseUrl + "/certificados/validar/INS-2026-ABX9F2K8")
                        .numeroRegistro("REG-2026-0001")
                        .fechaEmision(LocalDateTime.of(2026, 6, 4, 12, 0))
                        .build();
                certificadoRepository.save(cert);
            }
        }
    }
}
