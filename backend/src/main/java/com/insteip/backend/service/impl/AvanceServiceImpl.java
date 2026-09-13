package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.avance.AvanceProgressRequest;
import com.insteip.backend.domain.dto.avance.AvanceProgressResponse;
import com.insteip.backend.domain.entity.AvanceVideo;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.entity.Video;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.AvanceVideoRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.repository.VideoRepository;
import com.insteip.backend.service.interfaces.AvanceService;
import com.insteip.backend.service.interfaces.CertificadoService;
import com.insteip.backend.infrastructure.util.ProgresoAcademicoUtils;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AvanceServiceImpl implements AvanceService {

    private final AvanceVideoRepository avanceVideoRepository;

    private final UsuarioRepository usuarioRepository;

    private final VideoRepository videoRepository;

    private final com.insteip.backend.repository.AvanceCursoRepository avanceCursoRepository;

    private final com.insteip.backend.repository.ModuloRepository moduloRepository;

    private final EntityManager entityManager;

    private final CertificadoService certificadoService;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public AvanceProgressResponse guardarProgreso(Long usuarioId, AvanceProgressRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado"));

        AvanceVideo avance = avanceVideoRepository.findByUsuarioIdAndVideoId(usuarioId, request.getVideoId())
                .orElseGet(() -> AvanceVideo.builder()
                        .usuario(usuario)
                        .video(video)
                        .build());

        // Preferir la duración real enviada por el reproductor para evitar
        // que una duración semilla desactualizada impida marcar el video como completo.
        Integer requestDuration = request.getDuracionSegundos();
        Integer storedDuration = video.getDuracionSegundos();
        int duracion = (requestDuration != null && requestDuration > 0)
                ? requestDuration
                : ((storedDuration != null && storedDuration > 0) ? storedDuration : ProgresoAcademicoUtils.resolveDuracionVideo(video));

        if (requestDuration != null && requestDuration > 0
                && (storedDuration == null || !storedDuration.equals(requestDuration))) {
            video.setDuracionSegundos(requestDuration);
            videoRepository.save(video);
        }

        // Lógica de cálculo del porcentaje visto
        int boundedSeconds = Math.max(0, Math.min(request.getUltimoSegundo(), duracion));
        double percent = (double) boundedSeconds / duracion * 100;
        if (percent > 100) percent = 100;

        avance.setUltimoSegundo(boundedSeconds);
        avance.setPorcentajeVisto(BigDecimal.valueOf(percent).setScale(2, RoundingMode.HALF_UP));
        avance.setCompletado(ProgresoAcademicoUtils.isVideoCompletado(video, avance));
        avance.setFechaActualizacion(LocalDateTime.now());

        avance = avanceVideoRepository.save(avance);

        // Actualizar progreso del curso de forma consolidada en avance_cursos
        updateCursoAvance(usuario, video.getModulo().getCurso());

        return AvanceProgressResponse.builder()
                .videoId(video.getId())
                .ultimoSegundo(avance.getUltimoSegundo())
                .porcentajeVisto(avance.getPorcentajeVisto())
                .completado(avance.getCompletado())
                .build();
    }

    private void updateCursoAvance(Usuario usuario, com.insteip.backend.domain.entity.Curso curso) {
        if (curso == null) return;

        java.util.List<com.insteip.backend.domain.entity.Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
        int totalVideos = 0;
        int completedVideos = 0;

        for (com.insteip.backend.domain.entity.Modulo modulo : modulos) {
            if (!modulo.getEstado()) continue;
            java.util.List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            for (Video v : videos) {
                if (!v.getEstado()) continue;
                totalVideos++;
                AvanceVideo avVideo = avanceVideoRepository.findByUsuarioIdAndVideoId(usuario.getId(), v.getId())
                        .orElse(null);
                if (ProgresoAcademicoUtils.isVideoCompletado(v, avVideo)) {
                    completedVideos++;
                }
            }
        }

        double progressPercent = 0.0;
        boolean completado = false;
        if (totalVideos > 0) {
            progressPercent = (completedVideos * 100.0) / totalVideos;
            completado = (completedVideos == totalVideos);
        } else {
            progressPercent = 100.00;
            completado = true;
        }

        com.insteip.backend.domain.entity.AvanceCurso avanceCurso = avanceCursoRepository.findByUsuarioIdAndCursoId(usuario.getId(), curso.getId())
                .orElseGet(() -> com.insteip.backend.domain.entity.AvanceCurso.builder()
                        .usuario(usuario)
                        .curso(curso)
                        .build());

        avanceCurso.setPorcentajeAvance(BigDecimal.valueOf(progressPercent).setScale(2, RoundingMode.HALF_UP));
        avanceCurso.setCompletado(completado);
        avanceCurso.setFechaActualizacion(LocalDateTime.now());

        avanceCursoRepository.save(avanceCurso);

        // 🏆 Generar certificado automáticamente si el curso se completó
        if (completado) {
            // Forzar flush para que las consultas en generarCertificado vean los datos actualizados
            entityManager.flush();
            try {
                certificadoService.generarCertificado(usuario.getId(), curso.getId());
            } catch (Exception e) {
                // Si ya existe un certificado o hay error, lo ignoramos silenciosamente
                System.err.println("Auto-certificado: " + e.getMessage());
            }
        }
    }

    @Override
    public AvanceProgressResponse obtenerProgreso(Long usuarioId, Long videoId) {
        AvanceVideo avance = avanceVideoRepository.findByUsuarioIdAndVideoId(usuarioId, videoId)
                .orElseThrow(() -> new ResourceNotFoundException("No hay registro de progreso para este video"));

        return AvanceProgressResponse.builder()
                .videoId(avance.getVideo().getId())
                .ultimoSegundo(avance.getUltimoSegundo())
                .porcentajeVisto(avance.getPorcentajeVisto())
                .completado(avance.getCompletado())
                .build();
    }
}
