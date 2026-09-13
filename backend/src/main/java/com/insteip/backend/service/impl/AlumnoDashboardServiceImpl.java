package com.insteip.backend.service.impl;

import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.certificado.AlumnoCertificadoResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoCursoResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoDashboardMetrics;
import com.insteip.backend.domain.dto.alumno.AlumnoPlayCourseResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoPlayMaterial;
import com.insteip.backend.domain.dto.alumno.AlumnoPlayModulo;
import com.insteip.backend.domain.dto.alumno.AlumnoPlayVideo;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.AlumnoDashboardService;
import com.insteip.backend.infrastructure.util.ProgresoAcademicoUtils;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumnoDashboardServiceImpl implements AlumnoDashboardService {

    private final UsuarioRepository usuarioRepository;
    private final MatriculaRepository matriculaRepository;
    private final CertificadoRepository certificadoRepository;
    private final MatriculaModuloAccesoRepository matriculaModuloAccesoRepository;

    @Value("${application.api.base-url}")
    private String apiBaseUrl;

    @Value("${application.frontend.base-url}")
    private String frontendBaseUrl;

    private final CursoRepository cursoRepository;
    private final ModuloRepository moduloRepository;
    private final VideoRepository videoRepository;
    private final MaterialRepository materialRepository;
    private final AvanceVideoRepository avanceVideoRepository;
    private final AvanceCursoRepository avanceCursoRepository;

    @Override
    public AlumnoDashboardMetrics getMetrics(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Matricula> matriculas = matriculaRepository.findByUsuarioIdAndEstadoTrue(usuario.getId()).stream()
                .filter(m -> m.getCurso() != null && Boolean.TRUE.equals(m.getCurso().getEstado()) && (m.getCurso().getNombre() == null || !m.getCurso().getNombre().toLowerCase().contains("excel")))
                .collect(Collectors.toList());
        long totalCursos = matriculas.size();

        List<AvanceCurso> allAvances = avanceCursoRepository.findByUsuarioId(usuario.getId());
        java.util.Map<Long, AvanceCurso> avanceMap = allAvances.stream()
                .filter(a -> a.getCurso() != null)
                .collect(Collectors.toMap(a -> a.getCurso().getId(), a -> a, (a1, a2) -> a1));

        long completados = 0;
        for (Matricula matricula : matriculas) {
            AvanceCurso avance = avanceMap.get(matricula.getCurso().getId());
            avance = normalizeAvanceCursoIfNeeded(usuario, matricula.getCurso(), avance);
            if (avance != null) {
                if (avance.getCompletado() || isCursoCompletado(usuario.getId(), matricula.getCurso())) {
                    completados++;
                }
            } else {
                if (isCursoCompletado(usuario.getId(), matricula.getCurso())) {
                    completados++;
                }
            }
        }

        long totalCertificados = certificadoRepository.findByUsuarioId(usuario.getId()).size();

        return new AlumnoDashboardMetrics(totalCursos, completados, totalCertificados);
    }

    @Override
    public List<AlumnoCursoResponse> getEnrolledCursos(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Matricula> matriculas = matriculaRepository.findByUsuarioIdAndEstadoTrue(usuario.getId()).stream()
                .filter(m -> m.getCurso() != null && Boolean.TRUE.equals(m.getCurso().getEstado()) && (m.getCurso().getNombre() == null || !m.getCurso().getNombre().toLowerCase().contains("excel")))
                .collect(Collectors.toList());
        List<AvanceCurso> allAvances = avanceCursoRepository.findByUsuarioId(usuario.getId());
        java.util.Map<Long, AvanceCurso> avanceMap = allAvances.stream()
                .filter(a -> a.getCurso() != null)
                .collect(Collectors.toMap(a -> a.getCurso().getId(), a -> a, (a1, a2) -> a1));

        return matriculas.stream().map(matricula -> {
            Curso curso = matricula.getCurso();
            AvanceCurso avanceRecord = avanceMap.get(curso.getId());
            avanceRecord = normalizeAvanceCursoIfNeeded(usuario, curso, avanceRecord);
            
            BigDecimal avance;
            boolean completado;
            
            if (avanceRecord != null) {
                avance = avanceRecord.getPorcentajeAvance();
                completado = avanceRecord.getCompletado();
                if (!completado && isCursoCompletado(usuario.getId(), curso)) {
                    avance = BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP);
                    completado = true;
                }
            } else {
                avance = getCursoAvance(usuario.getId(), curso);
                completado = isCursoCompletado(usuario.getId(), curso);
            }

            LocalDateTime fMatricula = matricula.getFechaMatricula() != null ? matricula.getFechaMatricula() : LocalDateTime.now();
            LocalDateTime fExpiracion = matricula.getFechaExpiracion() != null ? matricula.getFechaExpiracion() : fMatricula.plusMonths(12);

            long diasRestantes = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), fExpiracion);
            String alerta = "OK";
            if (diasRestantes <= 0) {
                alerta = "EXPIRADO";
            } else if (diasRestantes <= 7) {
                alerta = "URGENTE_7_DIAS";
            } else if (diasRestantes <= 30) {
                alerta = "PROXIMO_30_DIAS";
            }

            return new AlumnoCursoResponse(
                    curso.getId(),
                    curso.getNombre(),
                    curso.getDescripcion(),
                    curso.getImagenPortada(),
                    formatNivelesSuscripcion(curso.getNivelesSuscripcion()),
                    avance,
                    completado,
                    fMatricula,
                    fExpiracion,
                    diasRestantes,
                    alerta
            );
        }).collect(Collectors.toList());
    }

    @Override
    public List<AlumnoCertificadoResponse> getCertificados(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Certificado> certificados = certificadoRepository.findByUsuarioId(usuario.getId());

        return certificados.stream().map(c -> new AlumnoCertificadoResponse(
                c.getId(),
                c.getCodigo(),
                c.getCurso().getNombre(),
                c.getFechaEmision(),
                c.getArchivoPdf() == null || c.getArchivoPdf().isBlank()
                        ? apiBaseUrl + "/api/certificados/" + c.getId() + "/download"
                        : c.getArchivoPdf(),
                c.getUrlValidacion() == null || c.getUrlValidacion().isBlank()
                        ? frontendBaseUrl + "/certificados/validar/" + c.getCodigo()
                        : c.getUrlValidacion()
        )).collect(Collectors.toList());
    }

    @Override
    public AlumnoPlayCourseResponse getPlayCourse(String correo, Long cursoId) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado"));

        Matricula matricula = matriculaRepository.findByUsuarioIdAndCursoId(usuario.getId(), cursoId)
                .filter(m -> Boolean.TRUE.equals(m.getEstado()))
                .orElseThrow(() -> new RuntimeException("No estás matriculado en este curso."));

        // Validación en tiempo real: verificar si la matrícula ha expirado
        if (matricula.getFechaExpiracion() != null && LocalDateTime.now().isAfter(matricula.getFechaExpiracion())) {
            matricula.setEstado(false);
            matriculaRepository.save(matricula);
            throw new RuntimeException("Tu matrícula en este curso ha expirado. Contacta con administración para renovarla.");
        }

        // Obtener permisos de acceso modular para esta matrícula
        List<MatriculaModuloAcceso> accesosModulo = matriculaModuloAccesoRepository.findByMatriculaId(matricula.getId());
        boolean tieneRestricciones = !accesosModulo.isEmpty();
        Map<Long, Boolean> mapaAccesos = accesosModulo.stream()
                .collect(Collectors.toMap(a -> a.getModulo().getId(), a -> Boolean.TRUE.equals(a.getHabilitado()), (a1, a2) -> a1));

        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(cursoId);
        List<AlumnoPlayModulo> playModulos = new ArrayList<>();

        List<AvanceVideo> allAvancesVideo = avanceVideoRepository.findByUsuarioId(usuario.getId());
        java.util.Map<Long, AvanceVideo> avanceVideoMap = allAvancesVideo.stream()
                .filter(av -> av.getVideo() != null)
                .collect(Collectors.toMap(av -> av.getVideo().getId(), av -> av, (v1, v2) -> v1));

        for (Modulo modulo : modulos) {
            if (Boolean.FALSE.equals(modulo.getEstado())) continue;

            boolean moduloHabilitado = true;
            if (tieneRestricciones) {
                // Si el alumno tiene restricciones configuradas, sólo accede a los módulos explícitamente habilitados
                moduloHabilitado = mapaAccesos.getOrDefault(modulo.getId(), false);
            }

            List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            List<AlumnoPlayVideo> playVideos = new ArrayList<>();

            for (Video video : videos) {
                if (Boolean.FALSE.equals(video.getEstado())) continue;

                AvanceVideo avance = avanceVideoMap.get(video.getId());
                avance = normalizeAvanceVideoIfNeeded(avance, video);

                int ultimoSegundo = avance != null ? avance.getUltimoSegundo() : 0;
                BigDecimal porcentajeVisto = avance != null ? avance.getPorcentajeVisto() : BigDecimal.ZERO;
                boolean completado = ProgresoAcademicoUtils.isVideoCompletado(video, avance);

                // Si el módulo está bloqueado, se omiten las URLs directas de reproducción
                String videoUrl = moduloHabilitado ? video.getYoutubeUrl() : null;
                String videoId = moduloHabilitado ? video.getYoutubeId() : null;

                playVideos.add(new AlumnoPlayVideo(
                        video.getId(),
                        video.getTitulo(),
                        video.getDescripcion(),
                        videoUrl,
                        videoId,
                        video.getDuracionSegundos(),
                        video.getOrden(),
                        ultimoSegundo,
                        porcentajeVisto,
                        completado
                ));
            }

            List<AlumnoPlayMaterial> playMateriales = new ArrayList<>();
            if (moduloHabilitado) {
                List<Material> materiales = materialRepository.findByModuloId(modulo.getId());
                playMateriales = materiales.stream()
                        .filter(material -> Boolean.TRUE.equals(material.getEstado()))
                        .map(m -> new AlumnoPlayMaterial(
                                m.getId(),
                                m.getNombre(),
                                m.getArchivoUrl(),
                                m.getTipoArchivo(),
                                m.getPesoBytes()
                        )).collect(Collectors.toList());
            }

            playModulos.add(new AlumnoPlayModulo(
                    modulo.getId(),
                    modulo.getNombre(),
                    modulo.getDescripcion(),
                    modulo.getOrden(),
                    playVideos,
                    playMateriales,
                    !moduloHabilitado,
                    !moduloHabilitado ? "Módulo pendiente de habilitación o pago de cuota." : null
            ));
        }

        return new AlumnoPlayCourseResponse(
                curso.getId(),
                curso.getNombre(),
                curso.getDescripcion(),
                curso.getImagenPortada(),
                formatNivelesSuscripcion(curso.getNivelesSuscripcion()),
                playModulos
        );
    }

    private BigDecimal getCursoAvance(Long usuarioId, Curso curso) {
        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
        int totalVideos = 0;
        int completedVideos = 0;

        for (Modulo modulo : modulos) {
            if (!modulo.getEstado()) continue;
            List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            for (Video video : videos) {
                if (!video.getEstado()) continue;
                totalVideos++;
                AvanceVideo avance = avanceVideoRepository.findByUsuarioIdAndVideoId(usuarioId, video.getId())
                        .orElse(null);
                if (ProgresoAcademicoUtils.isVideoCompletado(video, avance)) {
                    completedVideos++;
                }
            }
        }

        if (totalVideos == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf((double) completedVideos / totalVideos * 100).setScale(2, RoundingMode.HALF_UP);
    }

    private boolean isCursoCompletado(Long usuarioId, Curso curso) {
        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
        int totalVideos = 0;
        int completedVideos = 0;

        for (Modulo modulo : modulos) {
            if (!modulo.getEstado()) continue;
            List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            for (Video video : videos) {
                if (!video.getEstado()) continue;
                totalVideos++;
                AvanceVideo avance = avanceVideoRepository.findByUsuarioIdAndVideoId(usuarioId, video.getId())
                        .orElse(null);
                if (ProgresoAcademicoUtils.isVideoCompletado(video, avance)) {
                    completedVideos++;
                }
            }
        }

        return totalVideos > 0 && completedVideos == totalVideos;
    }

    private AvanceCurso normalizeAvanceCursoIfNeeded(Usuario usuario, Curso curso, AvanceCurso avance) {
        if (usuario == null || curso == null) {
            return avance;
        }

        boolean shouldBeCompleted = isCursoCompletado(usuario.getId(), curso);
        if (avance == null) {
            if (shouldBeCompleted) {
                AvanceCurso nuevo = AvanceCurso.builder()
                        .usuario(usuario)
                        .curso(curso)
                        .porcentajeAvance(BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP))
                        .completado(true)
                        .fechaActualizacion(LocalDateTime.now())
                        .build();
                return avanceCursoRepository.save(nuevo);
            }
            return null;
        }

        boolean modified = false;
        if (shouldBeCompleted && (!Boolean.TRUE.equals(avance.getCompletado()) || avance.getPorcentajeAvance().compareTo(BigDecimal.valueOf(100)) < 0)) {
            avance.setCompletado(true);
            avance.setPorcentajeAvance(BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP));
            avance.setFechaActualizacion(LocalDateTime.now());
            modified = true;
        }

        if (modified) {
            return avanceCursoRepository.save(avance);
        }

        return avance;
    }

    private AvanceVideo normalizeAvanceVideoIfNeeded(AvanceVideo avance, Video video) {
        if (avance == null || video == null) {
            return avance;
        }

        if (ProgresoAcademicoUtils.isVideoCompletado(video, avance) && !Boolean.TRUE.equals(avance.getCompletado())) {
            avance.setCompletado(true);
            avance.setFechaActualizacion(LocalDateTime.now());
            return avanceVideoRepository.save(avance);
        }

        return avance;
    }

    private String formatNivelesSuscripcion(List<NivelSuscripcion> niveles) {
        if (niveles == null || niveles.isEmpty()) {
            return "General";
        }
        return niveles.stream()
                .map(NivelSuscripcion::getNombre)
                .collect(Collectors.joining(", "));
    }
}
