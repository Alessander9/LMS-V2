package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.tarea.AlumnoTareaItemDTO;
import com.insteip.backend.domain.dto.tarea.TareaRequestDTO;
import com.insteip.backend.domain.dto.tarea.TareaResponseDTO;
import com.insteip.backend.domain.entity.EntregaTarea;
import com.insteip.backend.domain.entity.Matricula;
import com.insteip.backend.domain.entity.Modulo;
import com.insteip.backend.domain.entity.Tarea;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.EntregaTareaRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.ModuloRepository;
import com.insteip.backend.repository.TareaRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.TareaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TareaServiceImpl implements TareaService {

    private final TareaRepository tareaRepository;
    private final ModuloRepository moduloRepository;
    private final EntregaTareaRepository entregaTareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MatriculaRepository matriculaRepository;
    private final AuditoriaService auditoriaService;
    private final com.insteip.backend.service.interfaces.NotificacionService notificacionService;

    @Override
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarPorModulo(Long moduloId) {
        if (!moduloRepository.existsById(moduloId)) {
            throw new ResourceNotFoundException("Módulo no encontrado con ID: " + moduloId);
        }
        return tareaRepository.findByModuloIdOrderByFechaCreacionAsc(moduloId)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoTareaItemDTO> listarTareasPorCursoParaAlumno(Long cursoId, String correoAlumno) {
        Usuario alumno = usuarioRepository.findByCorreo(correoAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario alumno no encontrado"));

        List<Tarea> tareasActivas = tareaRepository.findByCursoIdAndEstadoTrue(cursoId);
        List<EntregaTarea> misEntregas = entregaTareaRepository.findByCursoIdAndUsuarioId(cursoId, alumno.getId());

        return mapTareasToAlumnoItems(tareasActivas, misEntregas);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoTareaItemDTO> listarTodasLasTareasParaAlumno(String correoAlumno) {
        Usuario alumno = usuarioRepository.findByCorreo(correoAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario alumno no encontrado"));

        List<Matricula> matriculasActivas = matriculaRepository.findByUsuarioIdAndEstadoTrue(alumno.getId());
        if (matriculasActivas.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> cursoIds = matriculasActivas.stream()
                .map(m -> m.getCurso().getId())
                .distinct()
                .collect(Collectors.toList());

        List<Tarea> tareasActivas = tareaRepository.findByCursoIdInAndEstadoTrue(cursoIds);
        List<EntregaTarea> misEntregas = entregaTareaRepository.findByUsuarioId(alumno.getId());

        return mapTareasToAlumnoItems(tareasActivas, misEntregas);
    }

    private List<AlumnoTareaItemDTO> mapTareasToAlumnoItems(List<Tarea> tareas, List<EntregaTarea> misEntregas) {
        Map<Long, EntregaTarea> entregaMap = misEntregas.stream()
                .collect(Collectors.toMap(e -> e.getTarea().getId(), e -> e, (existing, replacement) -> existing));

        LocalDateTime now = LocalDateTime.now();
        List<AlumnoTareaItemDTO> resultado = new ArrayList<>();

        for (Tarea t : tareas) {
            EntregaTarea entrega = entregaMap.get(t.getId());
            boolean entregada = entrega != null;
            boolean vencida = t.getFechaLimite() != null && now.isAfter(t.getFechaLimite());

            AlumnoTareaItemDTO item = AlumnoTareaItemDTO.builder()
                    .id(t.getId())
                    .cursoId(t.getModulo().getCurso() != null ? t.getModulo().getCurso().getId() : null)
                    .cursoNombre(t.getModulo().getCurso() != null ? t.getModulo().getCurso().getNombre() : "")
                    .moduloId(t.getModulo().getId())
                    .moduloNombre(t.getModulo().getNombre())
                    .moduloOrden(t.getModulo().getOrden())
                    .titulo(t.getTitulo())
                    .descripcion(t.getDescripcion())
                    .fechaLimite(t.getFechaLimite())
                    .permitirReenvio(t.getPermitirReenvio() != null ? t.getPermitirReenvio() : true)
                    .vencida(vencida)
                    .entregada(entregada)
                    .entregaId(entregada ? entrega.getId() : null)
                    .archivoUrl(entregada ? entrega.getArchivoUrl() : null)
                    .tipoArchivo(entregada ? entrega.getTipoArchivo() : null)
                    .pesoBytes(entregada ? entrega.getPesoBytes() : null)
                    .comentarioAlumno(entregada ? entrega.getComentarioAlumno() : null)
                    .calificacion(entregada ? entrega.getCalificacion() : null)
                    .feedbackDocente(entregada ? entrega.getFeedbackDocente() : null)
                    .fechaEntrega(entregada ? entrega.getFechaEntrega() : null)
                    .fechaCalificacion(entregada ? entrega.getFechaCalificacion() : null)
                    .estadoEntrega(entregada ? entrega.getEstado() : "PENDIENTE")
                    .build();

            resultado.add(item);
        }

        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public TareaResponseDTO obtenerPorId(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));
        return convertToResponseDto(tarea);
    }

    @Override
    @Transactional
    public TareaResponseDTO crear(TareaRequestDTO request) {
        Modulo modulo = moduloRepository.findById(request.getModuloId())
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con ID: " + request.getModuloId()));

        Tarea tarea = Tarea.builder()
                .modulo(modulo)
                .titulo(request.getTitulo().trim())
                .descripcion(request.getDescripcion())
                .fechaLimite(request.getFechaLimite())
                .permitirReenvio(request.getPermitirReenvio() != null ? request.getPermitirReenvio() : true)
                .estado(request.getEstado() != null ? request.getEstado() : true)
                .build();

        Tarea guardada = tareaRepository.save(tarea);
        auditoriaService.registrarEvento("TAREA", "CREAR", "Creada tarea: " + guardada.getTitulo() + " (ID: " + guardada.getId() + ")");

        if (modulo.getCurso() != null) {
            Long cursoId = modulo.getCurso().getId();
            notificacionService.notificarAlumnosDeCurso(
                    cursoId,
                    "📝 Nueva tarea asignada",
                    "Se ha publicado la tarea '" + guardada.getTitulo() + "' en el Módulo " + modulo.getOrden() + " (" + (modulo.getCurso().getNombre() != null ? modulo.getCurso().getNombre() : "") + ")",
                    "TAREA_NUEVA",
                    "/dashboard/cursos-play/" + cursoId,
                    "assignment"
            );
        }

        return convertToResponseDto(guardada);
    }

    @Override
    @Transactional
    public TareaResponseDTO actualizar(Long id, TareaRequestDTO request) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));

        tarea.setTitulo(request.getTitulo().trim());
        tarea.setDescripcion(request.getDescripcion());
        tarea.setFechaLimite(request.getFechaLimite());
        if (request.getPermitirReenvio() != null) {
            tarea.setPermitirReenvio(request.getPermitirReenvio());
        }
        if (request.getEstado() != null) {
            tarea.setEstado(request.getEstado());
        }

        Tarea guardada = tareaRepository.save(tarea);
        auditoriaService.registrarEvento("TAREA", "EDITAR", "Actualizada tarea: " + guardada.getTitulo() + " (ID: " + guardada.getId() + ")");
        return convertToResponseDto(guardada);
    }

    @Override
    @Transactional
    public void cambiarEstado(Long id, Boolean estado) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));
        tarea.setEstado(estado);
        tareaRepository.save(tarea);
        auditoriaService.registrarEvento("TAREA", estado ? "ACTIVAR" : "DESACTIVAR",
                (estado ? "Activada" : "Desactivada") + " tarea ID: " + id);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));
        String titulo = tarea.getTitulo();
        tareaRepository.delete(tarea);
        auditoriaService.registrarEvento("TAREA", "ELIMINAR", "Eliminada tarea: " + titulo + " (ID: " + id + ")");
    }

    private TareaResponseDTO convertToResponseDto(Tarea t) {
        int totalEntregas = entregaTareaRepository.findByTareaIdOrderByFechaEntregaDesc(t.getId()).size();
        return TareaResponseDTO.builder()
                .id(t.getId())
                .moduloId(t.getModulo().getId())
                .moduloNombre(t.getModulo().getNombre())
                .moduloOrden(t.getModulo().getOrden())
                .titulo(t.getTitulo())
                .descripcion(t.getDescripcion())
                .fechaLimite(t.getFechaLimite())
                .permitirReenvio(t.getPermitirReenvio())
                .estado(t.getEstado())
                .fechaCreacion(t.getFechaCreacion())
                .totalEntregas(totalEntregas)
                .build();
    }
}
