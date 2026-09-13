package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import com.insteip.backend.domain.dto.docente.DocenteEstudianteProgressResponse;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.DocenteDashboardService;
import com.insteip.backend.infrastructure.util.ProgresoAcademicoUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class DocenteDashboardServiceImpl implements DocenteDashboardService {

    private final UsuarioRepository usuarioRepository;

    private final CursoRepository cursoRepository;

    private final MatriculaRepository matriculaRepository;

    private final AvanceCursoRepository avanceCursoRepository;

    private final AvanceVideoRepository avanceVideoRepository;

    private final ModuloRepository moduloRepository;

    private final VideoRepository videoRepository;

    @Override
    public List<CursoResponseDTO> getCursosAsignados(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));

        List<Curso> cursos;
        if ("ADMINISTRADOR".equalsIgnoreCase(usuario.getRol().getNombre())) {
            cursos = cursoRepository.findAll();
        } else {
            cursos = cursoRepository.findByDocenteId(usuario.getId());
        }

        return cursos.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocenteEstudianteProgressResponse> getAlumnosCurso(String correo, Long cursoId) {
        Usuario docente = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + cursoId));

        if (!"ADMINISTRADOR".equalsIgnoreCase(docente.getRol().getNombre()) && 
            (curso.getDocente() == null || !curso.getDocente().getId().equals(docente.getId()))) {
            throw new ForbiddenException("No tiene permisos para ver los alumnos de este curso.");
        }

        List<Matricula> matriculas = matriculaRepository.findByCursoId(cursoId);
        List<AvanceCurso> avancesList = avanceCursoRepository.findByCursoId(cursoId);
        java.util.Map<Long, AvanceCurso> avancesMap = avancesList.stream()
                .filter(a -> a.getUsuario() != null)
                .collect(Collectors.toMap(a -> a.getUsuario().getId(), a -> a, (a1, a2) -> a1));

        return matriculas.stream()
                .map(m -> {
                    Usuario estudiante = m.getUsuario();
                    AvanceCurso avance = avancesMap.get(estudiante.getId());
                    
                    Double porcentaje = avance != null && avance.getPorcentajeAvance() != null 
                            ? avance.getPorcentajeAvance().doubleValue() 
                            : 0.0;
                    Boolean completado = avance != null && avance.getCompletado() != null 
                            ? avance.getCompletado() 
                            : false;
                    java.time.LocalDateTime fecha = avance != null ? avance.getFechaActualizacion() : m.getFechaMatricula();

                    return new DocenteEstudianteProgressResponse(
                            estudiante.getId(),
                            estudiante.getNombres(),
                            estudiante.getApellidos(),
                            estudiante.getCorreo(),
                            porcentaje,
                            completado,
                            fecha,
                            m.getId()
                    );
                })
                .collect(Collectors.toList());
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

        return completedVideos == totalVideos;
    }

    private AvanceCurso normalizeAvanceCursoIfNeeded(Usuario usuario, Curso curso, AvanceCurso avanceCurso) {
        boolean shouldBeComplete = isCursoCompletado(usuario.getId(), curso);
        if (!shouldBeComplete) return avanceCurso;

        if (avanceCurso == null) {
            avanceCurso = AvanceCurso.builder()
                    .usuario(usuario)
                    .curso(curso)
                    .build();
        }

        boolean needsNormalization = !Boolean.TRUE.equals(avanceCurso.getCompletado())
                || avanceCurso.getPorcentajeAvance() == null
                || avanceCurso.getPorcentajeAvance().doubleValue() < 100.0;

        if (needsNormalization) {
            avanceCurso.setPorcentajeAvance(BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP));
            avanceCurso.setCompletado(true);
            avanceCurso.setFechaActualizacion(java.time.LocalDateTime.now());
            return avanceCursoRepository.save(avanceCurso);
        }

        return avanceCurso;
    }

    private CursoResponseDTO convertToResponseDto(Curso c) {
        Long docenteId = c.getDocente() != null ? c.getDocente().getId() : null;
        String docenteNombre = c.getDocente() != null ? (c.getDocente().getNombres() + " " + c.getDocente().getApellidos()) : null;
        return new CursoResponseDTO(
                c.getId(),
                c.getNombre(),
                c.getDescripcion(),
                c.getImagenPortada(),
                c.getNivelesSuscripcion().stream().map(nivel -> nivel.getNombre()).collect(Collectors.toList()),
                c.getEstado(),
                docenteId,
                docenteNombre,
                c.getFechaCreacion()
        );
    }
}
