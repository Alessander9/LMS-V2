package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.mensajeria.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.MensajeriaService;
import com.insteip.backend.service.interfaces.NotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MensajeriaServiceImpl implements MensajeriaService {

    private final ConversacionRepository conversacionRepository;
    private final MensajeRepository mensajeRepository;
    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final MatriculaRepository matriculaRepository;
    private final NotificacionService notificacionService;
    private final AuditoriaService auditoriaService;

    @Override
    @Transactional
    public MensajeResponseDTO enviarMensaje(MensajeRequestDTO request, String correoRemitente) {
        Usuario remitente = usuarioRepository.findByCorreo(correoRemitente)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario remitente no encontrado"));

        String rolRemitente = remitente.getRol() != null ? remitente.getRol().getNombre() : "ALUMNO";
        String tipo = request.getTipo() != null ? request.getTipo().toUpperCase() : "INDIVIDUAL";
        String prioridad = request.getPrioridad() != null ? request.getPrioridad().toUpperCase() : "NORMAL";

        Curso curso = null;
        if (request.getCursoId() != null) {
            curso = cursoRepository.findById(request.getCursoId()).orElse(null);
        }

        if ("INDIVIDUAL".equalsIgnoreCase(tipo)) {
            if (request.getDestinatarioId() == null) {
                throw new BadRequestException("El destinatario es obligatorio para mensajes individuales");
            }
            Usuario destinatario = usuarioRepository.findById(request.getDestinatarioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario destinatario no encontrado"));

            validarPermisoEnvio(remitente, destinatario, curso);

            Conversacion conversacion = Conversacion.builder()
                    .asunto(request.getAsunto().trim())
                    .curso(curso)
                    .emisor(remitente)
                    .destinatario(destinatario)
                    .tipo("INDIVIDUAL")
                    .prioridad(prioridad)
                    .ultimoMensaje(request.getContenido().length() > 400 ? request.getContenido().substring(0, 397) + "..." : request.getContenido())
                    .fechaUltimoMensaje(LocalDateTime.now())
                    .build();

            Conversacion conversacionGuardada = conversacionRepository.save(conversacion);

            Mensaje mensaje = Mensaje.builder()
                    .conversacion(conversacionGuardada)
                    .remitente(remitente)
                    .destinatario(destinatario)
                    .contenido(request.getContenido().trim())
                    .prioridad(prioridad)
                    .adjuntoUrl(request.getAdjuntoUrl())
                    .adjuntoNombre(request.getAdjuntoNombre())
                    .adjuntoTamano(request.getAdjuntoTamano())
                    .audioUrl(request.getAudioUrl())
                    .leido(false)
                    .build();

            Mensaje mensajeGuardado = mensajeRepository.save(mensaje);

            // Notificar al destinatario mediante la campanita
            String tituloNotif = (prioridad.equals("URGENTE") ? "🔴 [URGENTE] " : "📩 ") + "Nuevo mensaje de " + remitente.getNombres();
            notificacionService.crearNotificacion(
                    destinatario.getId(),
                    tituloNotif,
                    "Asunto: " + request.getAsunto(),
                    "MENSAJE_NUEVO",
                    "/dashboard/mensajes",
                    "mail"
            );

            auditoriaService.registrarEvento("MENSAJERIA", "ENVIAR", "Mensaje enviado a " + destinatario.getCorreo());
            return convertMensajeToDto(mensajeGuardado, remitente.getId());
        } else {
            // Envío Masivo / Grupal (Sólo ADMINISTRADOR o DOCENTE para sus cursos)
            if (!"ADMINISTRADOR".equalsIgnoreCase(rolRemitente) && !"DOCENTE".equalsIgnoreCase(rolRemitente)) {
                throw new ForbiddenException("No tienes permisos para emitir mensajes grupales");
            }

            List<Usuario> destinatariosList = new ArrayList<>();
            if ("CURSO_MASIVO".equalsIgnoreCase(tipo) && curso != null) {
                if ("DOCENTE".equalsIgnoreCase(rolRemitente) && (curso.getDocente() == null || !curso.getDocente().getId().equals(remitente.getId()))) {
                    throw new ForbiddenException("Solo puedes enviar mensajes a tus propios cursos asignados");
                }
                destinatariosList = matriculaRepository.findByCursoIdAndEstadoTrue(curso.getId())
                        .stream().map(Matricula::getUsuario).filter(u -> u != null && Boolean.TRUE.equals(u.getEstado())).collect(Collectors.toList());
            } else if ("TODOS_ALUMNOS".equalsIgnoreCase(tipo) && "ADMINISTRADOR".equalsIgnoreCase(rolRemitente)) {
                destinatariosList = usuarioRepository.findByRolNombreInAndEstadoTrue(List.of("ALUMNO"));
            } else if ("TODOS_DOCENTES".equalsIgnoreCase(tipo) && "ADMINISTRADOR".equalsIgnoreCase(rolRemitente)) {
                destinatariosList = usuarioRepository.findByRolNombreInAndEstadoTrue(List.of("DOCENTE"));
            }

            if (destinatariosList.isEmpty()) {
                throw new BadRequestException("No se encontraron destinatarios para este envío");
            }

            LocalDateTime ahora = LocalDateTime.now();
            String asunto = request.getAsunto().trim();
            String contenido = request.getContenido().trim();
            String extracto = contenido.length() > 400 ? contenido.substring(0, 397) + "..." : contenido;

            List<Conversacion> conversacionesBatch = new ArrayList<>();
            for (Usuario dest : destinatariosList) {
                conversacionesBatch.add(Conversacion.builder()
                        .asunto(asunto)
                        .curso(curso)
                        .emisor(remitente)
                        .destinatario(dest)
                        .tipo(tipo)
                        .prioridad(prioridad)
                        .ultimoMensaje(extracto)
                        .fechaUltimoMensaje(ahora)
                        .build());
            }

            List<Conversacion> savedConversaciones = conversacionRepository.saveAll(conversacionesBatch);

            List<Mensaje> mensajesBatch = new ArrayList<>();
            List<Notificacion> notificacionesBatch = new ArrayList<>();

            for (int i = 0; i < destinatariosList.size(); i++) {
                Usuario dest = destinatariosList.get(i);
                Conversacion conv = savedConversaciones.get(i);

                mensajesBatch.add(Mensaje.builder()
                        .conversacion(conv)
                        .remitente(remitente)
                        .destinatario(dest)
                        .contenido(contenido)
                        .prioridad(prioridad)
                        .adjuntoUrl(request.getAdjuntoUrl())
                        .adjuntoNombre(request.getAdjuntoNombre())
                        .adjuntoTamano(request.getAdjuntoTamano())
                        .audioUrl(request.getAudioUrl())
                        .leido(false)
                        .build());

                notificacionesBatch.add(Notificacion.builder()
                        .usuario(dest)
                        .titulo("📩 Nuevo comunicado de " + remitente.getNombres())
                        .mensaje(asunto)
                        .tipo("MENSAJE_NUEVO")
                        .urlDestino("/dashboard/mensajes")
                        .icono("mail")
                        .leido(false)
                        .build());
            }

            List<Mensaje> savedMensajes = mensajeRepository.saveAll(mensajesBatch);
            notificacionRepository.saveAll(notificacionesBatch);

            Mensaje ultimoCreado = savedMensajes.isEmpty() ? null : savedMensajes.get(savedMensajes.size() - 1);

            auditoriaService.registrarEvento("MENSAJERIA", "ENVIO_GRUPAL", "Mensaje grupal enviado a " + destinatariosList.size() + " usuarios");
            return convertMensajeToDto(ultimoCreado, remitente.getId());
        }
    }

    @Override
    @Transactional
    public MensajeResponseDTO responderMensaje(Long conversacionId, RespuestaMensajeDTO request, String correoRemitente) {
        Usuario remitente = usuarioRepository.findByCorreo(correoRemitente)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario remitente no encontrado"));

        Conversacion conversacion = conversacionRepository.findById(conversacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversación no encontrada con ID: " + conversacionId));

        if (!conversacion.getEmisor().getId().equals(remitente.getId()) &&
            (conversacion.getDestinatario() == null || !conversacion.getDestinatario().getId().equals(remitente.getId()))) {
            throw new ForbiddenException("No tienes permiso para responder en esta conversación");
        }

        Usuario destinatario = conversacion.getEmisor().getId().equals(remitente.getId())
                ? conversacion.getDestinatario()
                : conversacion.getEmisor();

        Mensaje mensaje = Mensaje.builder()
                .conversacion(conversacion)
                .remitente(remitente)
                .destinatario(destinatario)
                .contenido(request.getContenido().trim())
                .prioridad(conversacion.getPrioridad())
                .adjuntoUrl(request.getAdjuntoUrl())
                .adjuntoNombre(request.getAdjuntoNombre())
                .adjuntoTamano(request.getAdjuntoTamano())
                .audioUrl(request.getAudioUrl())
                .leido(false)
                .build();

        Mensaje guardado = mensajeRepository.save(mensaje);

        // Actualizar último mensaje de la conversación
        conversacion.setUltimoMensaje(request.getContenido().length() > 400 ? request.getContenido().substring(0, 397) + "..." : request.getContenido());
        conversacion.setFechaUltimoMensaje(LocalDateTime.now());
        conversacionRepository.save(conversacion);

        if (destinatario != null) {
            notificacionService.crearNotificacion(
                    destinatario.getId(),
                    "💬 Respuesta de " + remitente.getNombres(),
                    "En: " + conversacion.getAsunto(),
                    "MENSAJE_NUEVO",
                    "/dashboard/mensajes",
                    "chat"
            );
        }

        return convertMensajeToDto(guardado, remitente.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConversacionResponseDTO> listarConversaciones(String correo, Long cursoId, Pageable pageable) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Page<Conversacion> page;
        if (cursoId != null && cursoId > 0) {
            page = conversacionRepository.findMisConversacionesPorCurso(usuario.getId(), cursoId, pageable);
        } else {
            page = conversacionRepository.findMisConversaciones(usuario.getId(), pageable);
        }

        List<ConversacionResponseDTO> list = page.getContent().stream()
                .map(c -> convertConversacionToDto(c, usuario.getId(), false))
                .collect(Collectors.toList());

        return new PageImpl<>(list, pageable, page.getTotalElements());
    }

    @Override
    @Transactional
    public ConversacionResponseDTO obtenerConversacion(Long conversacionId, String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Conversacion conversacion = conversacionRepository.findById(conversacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversación no encontrada con ID: " + conversacionId));

        if (!conversacion.getEmisor().getId().equals(usuario.getId()) &&
            (conversacion.getDestinatario() == null || !conversacion.getDestinatario().getId().equals(usuario.getId()))) {
            throw new ForbiddenException("No tienes permiso para ver esta conversación");
        }

        // Marcar mensajes como leídos con timestamp de visto
        mensajeRepository.marcarComoLeidosEnConversacion(conversacionId, usuario.getId());

        return convertConversacionToDto(conversacion, usuario.getId(), true);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MensajeResponseDTO> obtenerBandeja(String correo, String carpeta, Pageable pageable) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String c = carpeta != null ? carpeta.toUpperCase().trim() : "RECIBIDOS";
        Page<Mensaje> page;

        switch (c) {
            case "ENVIADOS":
                page = mensajeRepository.findBandejaEnviados(usuario.getId(), pageable);
                break;
            case "NO_LEIDOS":
                page = mensajeRepository.findBandejaNoLeidos(usuario.getId(), pageable);
                break;
            case "DESTACADOS":
                page = mensajeRepository.findBandejaDestacados(usuario.getId(), pageable);
                break;
            case "RECIBIDOS":
            default:
                page = mensajeRepository.findBandejaRecibidos(usuario.getId(), pageable);
                break;
        }

        List<MensajeResponseDTO> dtoList = page.getContent().stream()
                .map(m -> convertMensajeToDto(m, usuario.getId()))
                .collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageable, page.getTotalElements());
    }

    @Override
    @Transactional
    public void marcarComoLeido(Long mensajeId, String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Mensaje mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado con ID: " + mensajeId));

        if (mensaje.getDestinatario() != null && mensaje.getDestinatario().getId().equals(usuario.getId())) {
            if (!Boolean.TRUE.equals(mensaje.getLeido())) {
                mensaje.setLeido(true);
                mensaje.setFechaLeido(LocalDateTime.now());
                mensajeRepository.save(mensaje);
            }
        }
    }

    @Override
    @Transactional
    public void marcarConversacionComoLeida(Long conversacionId, String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        mensajeRepository.marcarComoLeidosEnConversacion(conversacionId, usuario.getId());
    }

    @Override
    @Transactional
    public void toggleDestacado(Long mensajeId, String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Mensaje mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado con ID: " + mensajeId));

        if (mensaje.getRemitente().getId().equals(usuario.getId())) {
            mensaje.setDestacadoRemitente(!Boolean.TRUE.equals(mensaje.getDestacadoRemitente()));
        } else if (mensaje.getDestinatario() != null && mensaje.getDestinatario().getId().equals(usuario.getId())) {
            mensaje.setDestacadoDestinatario(!Boolean.TRUE.equals(mensaje.getDestacadoDestinatario()));
        } else {
            throw new ForbiddenException("No tienes permiso para modificar este mensaje");
        }

        mensajeRepository.save(mensaje);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DestinatarioDTO> obtenerDestinatariosDisponibles(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String rol = usuario.getRol() != null ? usuario.getRol().getNombre() : "ALUMNO";
        List<DestinatarioDTO> resultado = new ArrayList<>();

        if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
            // Admin puede hablar con todos los usuarios activos
            List<Usuario> todos = usuarioRepository.findByEstadoTrue();
            for (Usuario u : todos) {
                if (!u.getId().equals(usuario.getId())) {
                    resultado.add(DestinatarioDTO.builder()
                            .id(u.getId())
                            .nombreCompleto(u.getNombres() + " " + u.getApellidos())
                            .correo(u.getCorreo())
                            .rol(u.getRol() != null ? u.getRol().getNombre() : "USUARIO")
                            .build());
                }
            }
        } else if ("DOCENTE".equalsIgnoreCase(rol)) {
            // Docente: puede hablar con el Administrador y con alumnos de sus cursos
            List<Usuario> admins = usuarioRepository.findByRolNombreInAndEstadoTrue(List.of("ADMINISTRADOR"));
            for (Usuario admin : admins) {
                resultado.add(DestinatarioDTO.builder()
                        .id(admin.getId())
                        .nombreCompleto("🛡️ " + admin.getNombres() + " " + admin.getApellidos() + " (Dirección Académica)")
                        .correo(admin.getCorreo())
                        .rol("ADMINISTRADOR")
                        .build());
            }

            List<Curso> misCursos = cursoRepository.findByDocenteId(usuario.getId());
            for (Curso c : misCursos) {
                List<Matricula> matriculas = matriculaRepository.findByCursoIdAndEstadoTrue(c.getId());
                for (Matricula m : matriculas) {
                    Usuario alumno = m.getUsuario();
                    if (alumno != null && Boolean.TRUE.equals(alumno.getEstado())) {
                        resultado.add(DestinatarioDTO.builder()
                                .id(alumno.getId())
                                .nombreCompleto(alumno.getNombres() + " " + alumno.getApellidos())
                                .correo(alumno.getCorreo())
                                .rol("ALUMNO")
                                .cursoNombre(c.getNombre())
                                .cursoId(c.getId())
                                .build());
                    }
                }
            }
        } else {
            // ALUMNO: puede hablar con el Administrador y con los docentes de sus cursos activos
            List<Usuario> admins = usuarioRepository.findByRolNombreInAndEstadoTrue(List.of("ADMINISTRADOR"));
            for (Usuario admin : admins) {
                resultado.add(DestinatarioDTO.builder()
                        .id(admin.getId())
                        .nombreCompleto("🛡️ " + admin.getNombres() + " " + admin.getApellidos() + " (Soporte y Dirección)")
                        .correo(admin.getCorreo())
                        .rol("ADMINISTRADOR")
                        .build());
            }

            List<Matricula> misMatriculas = matriculaRepository.findByUsuarioIdAndEstadoTrue(usuario.getId());
            for (Matricula m : misMatriculas) {
                Curso c = m.getCurso();
                if (c != null && c.getDocente() != null && Boolean.TRUE.equals(c.getDocente().getEstado())) {
                    Usuario docente = c.getDocente();
                    resultado.add(DestinatarioDTO.builder()
                            .id(docente.getId())
                            .nombreCompleto("👨‍🏫 " + docente.getNombres() + " " + docente.getApellidos() + " (" + c.getNombre() + ")")
                            .correo(docente.getCorreo())
                            .rol("DOCENTE")
                            .cursoNombre(c.getNombre())
                            .cursoId(c.getId())
                            .build());
                }
            }
        }

        return resultado.stream()
                .distinct()
                .sorted(Comparator.comparing(DestinatarioDTO::getNombreCompleto))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BuzonResumenDTO obtenerResumenBuzon(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        long totalRecibidos = mensajeRepository.countByDestinatarioId(usuario.getId());
        long totalNoLeidos = mensajeRepository.countByDestinatarioIdAndLeidoFalse(usuario.getId());
        long totalEnviados = mensajeRepository.countByRemitenteId(usuario.getId());
        long totalDestacados = mensajeRepository.countDestacadosByUsuarioId(usuario.getId());

        return BuzonResumenDTO.builder()
                .totalRecibidos(totalRecibidos)
                .totalNoLeidos(totalNoLeidos)
                .totalEnviados(totalEnviados)
                .totalDestacados(totalDestacados)
                .build();
    }

    private void validarPermisoEnvio(Usuario remitente, Usuario destinatario, Curso curso) {
        String rolRem = remitente.getRol() != null ? remitente.getRol().getNombre() : "ALUMNO";
        String rolDest = destinatario.getRol() != null ? destinatario.getRol().getNombre() : "ALUMNO";

        if ("ADMINISTRADOR".equalsIgnoreCase(rolRem) || "ADMINISTRADOR".equalsIgnoreCase(rolDest)) {
            return; // Comunicación con Admin siempre es libre
        }

        if ("DOCENTE".equalsIgnoreCase(rolRem) && "ALUMNO".equalsIgnoreCase(rolDest)) {
            return;
        }

        if ("ALUMNO".equalsIgnoreCase(rolRem) && "DOCENTE".equalsIgnoreCase(rolDest)) {
            return;
        }

        if ("ALUMNO".equalsIgnoreCase(rolRem) && "ALUMNO".equalsIgnoreCase(rolDest)) {
            throw new ForbiddenException("Los alumnos no tienen habilitado el envío de mensajes privados directos entre sí");
        }
    }

    private MensajeResponseDTO convertMensajeToDto(Mensaje m, Long usuarioSesionId) {
        boolean esMio = m.getRemitente().getId().equals(usuarioSesionId);
        boolean destacado = esMio ? Boolean.TRUE.equals(m.getDestacadoRemitente()) : Boolean.TRUE.equals(m.getDestacadoDestinatario());

        return MensajeResponseDTO.builder()
                .id(m.getId())
                .conversacionId(m.getConversacion().getId())
                .asunto(m.getConversacion().getAsunto())
                .contenido(m.getContenido())
                .prioridad(m.getPrioridad())
                .remitenteId(m.getRemitente().getId())
                .remitenteNombre(m.getRemitente().getNombres() + " " + m.getRemitente().getApellidos())
                .remitenteCorreo(m.getRemitente().getCorreo())
                .remitenteRol(m.getRemitente().getRol() != null ? m.getRemitente().getRol().getNombre() : "ALUMNO")
                .destinatarioId(m.getDestinatario() != null ? m.getDestinatario().getId() : null)
                .destinatarioNombre(m.getDestinatario() != null ? m.getDestinatario().getNombres() + " " + m.getDestinatario().getApellidos() : "Varios")
                .destinatarioCorreo(m.getDestinatario() != null ? m.getDestinatario().getCorreo() : "")
                .destinatarioRol(m.getDestinatario() != null && m.getDestinatario().getRol() != null ? m.getDestinatario().getRol().getNombre() : "")
                .adjuntoUrl(m.getAdjuntoUrl())
                .adjuntoNombre(m.getAdjuntoNombre())
                .adjuntoTamano(m.getAdjuntoTamano())
                .audioUrl(m.getAudioUrl())
                .leido(m.getLeido())
                .fechaLeido(m.getFechaLeido())
                .destacado(destacado)
                .esMio(esMio)
                .fechaEnvio(m.getFechaEnvio())
                .build();
    }

    private ConversacionResponseDTO convertConversacionToDto(Conversacion c, Long usuarioSesionId, boolean incluirMensajes) {
        boolean soyEmisor = c.getEmisor().getId().equals(usuarioSesionId);
        Usuario contacto = soyEmisor ? c.getDestinatario() : c.getEmisor();
        long totalMsg = 0;
        long noLeidos = mensajeRepository.countByConversacionIdAndDestinatarioIdAndLeidoFalse(c.getId(), usuarioSesionId);

        boolean tieneRecibidos = false;
        boolean tieneEnviados = false;
        boolean tieneDestacados = false;
        Long ultimoRemitenteId = null;

        List<Mensaje> msgs = mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(c.getId());
        totalMsg = msgs.size();
        for (Mensaje m : msgs) {
            boolean esMio = m.getRemitente().getId().equals(usuarioSesionId);
            if (esMio) {
                tieneEnviados = true;
                if (Boolean.TRUE.equals(m.getDestacadoRemitente())) {
                    tieneDestacados = true;
                }
            } else {
                tieneRecibidos = true;
                if (Boolean.TRUE.equals(m.getDestacadoDestinatario())) {
                    tieneDestacados = true;
                }
            }
            ultimoRemitenteId = m.getRemitente().getId();
        }

        List<MensajeResponseDTO> mensajesDto = null;
        if (incluirMensajes) {
            mensajesDto = msgs.stream().map(m -> convertMensajeToDto(m, usuarioSesionId)).collect(Collectors.toList());
        }

        return ConversacionResponseDTO.builder()
                .id(c.getId())
                .asunto(c.getAsunto())
                .cursoId(c.getCurso() != null ? c.getCurso().getId() : null)
                .cursoNombre(c.getCurso() != null ? c.getCurso().getNombre() : null)
                .tipo(c.getTipo())
                .prioridad(c.getPrioridad())
                .emisorId(c.getEmisor().getId())
                .emisorNombre(c.getEmisor().getNombres() + " " + c.getEmisor().getApellidos())
                .soyEmisor(soyEmisor)
                .contactoId(contacto != null ? contacto.getId() : null)
                .contactoNombre(contacto != null ? contacto.getNombres() + " " + contacto.getApellidos() : "Difusión Masiva")
                .contactoCorreo(contacto != null ? contacto.getCorreo() : "")
                .contactoRol(contacto != null && contacto.getRol() != null ? contacto.getRol().getNombre() : "")
                .ultimoMensajeRemitenteId(ultimoRemitenteId)
                .tieneMensajesRecibidos(tieneRecibidos)
                .tieneMensajesEnviados(tieneEnviados)
                .tieneDestacados(tieneDestacados)
                .ultimoMensaje(c.getUltimoMensaje())
                .fechaUltimoMensaje(c.getFechaUltimoMensaje())
                .totalMensajes(totalMsg)
                .noLeidosCount(noLeidos)
                .mensajes(mensajesDto)
                .fechaCreacion(c.getFechaCreacion())
                .build();
    }
}
