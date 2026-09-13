package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.notificacion.ComunicadoRequestDTO;
import com.insteip.backend.domain.dto.notificacion.NotificacionResponseDTO;
import com.insteip.backend.domain.dto.notificacion.NotificacionResumenDTO;
import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.Matricula;
import com.insteip.backend.domain.entity.Notificacion;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.NotificacionRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.NotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final MatriculaRepository matriculaRepository;
    private final CursoRepository cursoRepository;
    private final AuditoriaService auditoriaService;

    @Override
    @Transactional(readOnly = true)
    public NotificacionResumenDTO obtenerNotificacionesUsuario(String correo, int limite) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        int max = limite > 0 ? Math.min(limite, 50) : 20;
        List<Notificacion> list = notificacionRepository.findByUsuarioIdOrderByFijadoDescFechaCreacionDesc(
                usuario.getId(), PageRequest.of(0, max));

        long totalNoLeidas = notificacionRepository.countByUsuarioIdAndLeidoFalse(usuario.getId());

        List<NotificacionResponseDTO> dtoList = list.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return NotificacionResumenDTO.builder()
                .totalNoLeidas(totalNoLeidas)
                .notificaciones(dtoList)
                .build();
    }

    @Override
    @Transactional
    public void marcarComoLeida(Long notificacionId, String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Notificacion notificacion = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));

        if (!notificacion.getUsuario().getId().equals(usuario.getId())) {
            throw new BadRequestException("No tienes permiso para modificar esta notificación");
        }

        if (!notificacion.getLeido()) {
            notificacion.setLeido(true);
            notificacionRepository.save(notificacion);
        }
    }

    @Override
    @Transactional
    public void marcarTodasComoLeidas(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        notificacionRepository.marcarTodasComoLeidasPorUsuario(usuario.getId());
    }

    @Override
    @Transactional
    public void crearNotificacion(Long usuarioId, String titulo, String mensaje, String tipo, String urlDestino, String icono) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null || !Boolean.TRUE.equals(usuario.getEstado())) {
            return;
        }

        Notificacion n = Notificacion.builder()
                .usuario(usuario)
                .titulo(titulo)
                .mensaje(mensaje)
                .tipo(tipo)
                .urlDestino(urlDestino)
                .icono(icono != null && !icono.isBlank() ? icono : "notifications")
                .leido(false)
                .build();

        notificacionRepository.save(n);
    }

    @Override
    @Transactional
    public void notificarAlumnosDeCurso(Long cursoId, String titulo, String mensaje, String tipo, String urlDestino, String icono) {
        List<Matricula> matriculas = matriculaRepository.findByCursoIdAndEstadoTrue(cursoId);
        if (matriculas.isEmpty()) {
            return;
        }

        List<Notificacion> notificaciones = new ArrayList<>();
        for (Matricula m : matriculas) {
            Usuario alumno = m.getUsuario();
            if (alumno != null && Boolean.TRUE.equals(alumno.getEstado())) {
                Notificacion n = Notificacion.builder()
                        .usuario(alumno)
                        .titulo(titulo)
                        .mensaje(mensaje)
                        .tipo(tipo)
                        .urlDestino(urlDestino)
                        .icono(icono != null && !icono.isBlank() ? icono : "notifications")
                        .leido(false)
                        .build();
                notificaciones.add(n);
            }
        }

        if (!notificaciones.isEmpty()) {
            notificacionRepository.saveAll(notificaciones);
            log.info("Notificados {} alumnos del curso ID {}", notificaciones.size(), cursoId);
        }
    }

    @Override
    @Transactional
    public void notificarDocenteDeCurso(Long cursoId, String titulo, String mensaje, String tipo, String urlDestino, String icono) {
        Curso curso = cursoRepository.findById(cursoId).orElse(null);
        if (curso == null || curso.getDocente() == null) {
            return;
        }

        Usuario docente = curso.getDocente();
        if (Boolean.TRUE.equals(docente.getEstado())) {
            crearNotificacion(docente.getId(), titulo, mensaje, tipo, urlDestino, icono != null ? icono : "school");
        }
    }

    @Override
    @Transactional
    public void enviarComunicadoSegmentado(ComunicadoRequestDTO request, String correoAdmin) {
        String aud = request.getAudiencia() != null ? request.getAudiencia().toUpperCase().trim() : "TODOS";
        List<Usuario> destinatarios = new ArrayList<>();

        switch (aud) {
            case "SOLO_ESTUDIANTES":
                destinatarios = usuarioRepository.findByRolNombreInAndEstadoTrue(List.of("ALUMNO"));
                break;
            case "SOLO_DOCENTES":
                destinatarios = usuarioRepository.findByRolNombreInAndEstadoTrue(List.of("DOCENTE"));
                break;
            case "DOCENTES_Y_ESTUDIANTES":
                destinatarios = usuarioRepository.findByRolNombreInAndEstadoTrue(List.of("ALUMNO", "DOCENTE"));
                break;
            case "POR_CURSO":
                if (request.getCursoId() == null) {
                    throw new BadRequestException("El curso es obligatorio cuando la audiencia es POR_CURSO");
                }
                List<Matricula> matriculas = matriculaRepository.findByCursoIdAndEstadoTrue(request.getCursoId());
                destinatarios = matriculas.stream()
                        .map(Matricula::getUsuario)
                        .filter(u -> u != null && Boolean.TRUE.equals(u.getEstado()))
                        .distinct()
                        .collect(Collectors.toList());
                break;
            case "TODOS":
            default:
                destinatarios = usuarioRepository.findByEstadoTrue();
                break;
        }

        if (destinatarios.isEmpty()) {
            log.warn("No se encontraron destinatarios para el comunicado con audiencia {}", aud);
            return;
        }

        String icono = request.getIcono() != null && !request.getIcono().isBlank() ? request.getIcono() : "campaign";
        String prioridad = request.getPrioridad() != null && !request.getPrioridad().isBlank() ? request.getPrioridad() : "INFO";
        Boolean fijado = Boolean.TRUE.equals(request.getFijado());
        List<Notificacion> notificaciones = new ArrayList<>();

        for (Usuario u : destinatarios) {
            Notificacion n = Notificacion.builder()
                    .usuario(u)
                    .titulo(request.getTitulo())
                    .mensaje(request.getMensaje())
                    .tipo("COMUNICADO_GLOBAL")
                    .urlDestino(request.getUrlDestino())
                    .icono(icono)
                    .prioridad(prioridad)
                    .fijado(fijado)
                    .adjuntoUrl(request.getAdjuntoUrl())
                    .adjuntoNombre(request.getAdjuntoNombre())
                    .adjuntoTamano(request.getAdjuntoTamano())
                    .leido(false)
                    .build();
            notificaciones.add(n);
        }

        notificacionRepository.saveAll(notificaciones);
        auditoriaService.registrarEvento("COMUNICADO", "ENVIAR", 
                "Comunicado enviado a " + notificaciones.size() + " destinatarios (Audiencia: " + aud + ")");
        log.info("Comunicado '{}' enviado a {} destinatarios por {}", request.getTitulo(), notificaciones.size(), correoAdmin);
    }

    private NotificacionResponseDTO convertToDto(Notificacion n) {
        return NotificacionResponseDTO.builder()
                .id(n.getId())
                .titulo(n.getTitulo())
                .mensaje(n.getMensaje())
                .tipo(n.getTipo())
                .urlDestino(n.getUrlDestino())
                .icono(n.getIcono())
                .leido(n.getLeido())
                .prioridad(n.getPrioridad() != null ? n.getPrioridad() : "INFO")
                .fijado(Boolean.TRUE.equals(n.getFijado()))
                .adjuntoUrl(n.getAdjuntoUrl())
                .adjuntoNombre(n.getAdjuntoNombre())
                .adjuntoTamano(n.getAdjuntoTamano())
                .fechaCreacion(n.getFechaCreacion())
                .build();
    }
}
