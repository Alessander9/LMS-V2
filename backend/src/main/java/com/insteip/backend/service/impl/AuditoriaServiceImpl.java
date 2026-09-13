package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.evento.EventoSistemaResponseDTO;
import com.insteip.backend.domain.dto.evento.LoginAuditoriaResponseDTO;
import com.insteip.backend.domain.entity.EventoSistema;
import com.insteip.backend.domain.entity.LoginAuditoria;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.repository.EventoSistemaRepository;
import com.insteip.backend.repository.LoginAuditoriaRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements AuditoriaService {

    private final EventoSistemaRepository eventoSistemaRepository;
    private final LoginAuditoriaRepository loginAuditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public void registrarEvento(String modulo, String accion, String descripcion) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuario = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            String correo = authentication.getName();
            usuario = usuarioRepository.findByCorreo(correo).orElse(null);
        }

        EventoSistema evento = EventoSistema.builder()
                .usuario(usuario)
                .modulo(modulo)
                .accion(accion)
                .descripcion(descripcion)
                .fecha(LocalDateTime.now())
                .build();

        eventoSistemaRepository.save(evento);
    }

    @Override
    public List<LoginAuditoriaResponseDTO> listarLoginAuditorias(LocalDate fecha, String correo, Boolean resultado) {
        return loginAuditoriaRepository.findAllByOrderByFechaDesc()
                .stream()
                .filter(audit -> fecha == null || (audit.getFecha() != null && audit.getFecha().toLocalDate().equals(fecha)))
                .filter(audit -> correo == null || correo.isBlank() || (audit.getCorreo() != null && audit.getCorreo().equalsIgnoreCase(correo)))
                .filter(audit -> resultado == null || (audit.getExitoso() != null && audit.getExitoso().equals(resultado)))
                .map(this::mapLoginAudit)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoginAuditoriaResponseDTO> listarLoginAuditoriasPorUsuario(Long usuarioId) {
        return loginAuditoriaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId)
                .stream()
                .map(this::mapLoginAudit)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventoSistemaResponseDTO> listarEventosSistema() {
        return eventoSistemaRepository.findAllByOrderByFechaDesc()
                .stream()
                .map(this::mapEventoSistema)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventoSistemaResponseDTO> listarEventosSistemaPorModulo(String modulo) {
        return eventoSistemaRepository.findAllByOrderByFechaDesc()
                .stream()
                .filter(evento -> modulo == null || modulo.isBlank() || (evento.getModulo() != null && evento.getModulo().equalsIgnoreCase(modulo)))
                .map(this::mapEventoSistema)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventoSistemaResponseDTO> listarEventosSistemaPorUsuario(Long usuarioId) {
        return eventoSistemaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId)
                .stream()
                .map(this::mapEventoSistema)
                .collect(Collectors.toList());
    }

    private LoginAuditoriaResponseDTO mapLoginAudit(LoginAuditoria audit) {
        return new LoginAuditoriaResponseDTO(
                audit.getId(),
                audit.getUsuario() != null ? audit.getUsuario().getId() : null,
                audit.getCorreo(),
                audit.getIp(),
                audit.getUserAgent(),
                audit.getExitoso(),
                audit.getMotivo(),
                audit.getFecha()
        );
    }

    private EventoSistemaResponseDTO mapEventoSistema(EventoSistema evento) {
        return new EventoSistemaResponseDTO(
                evento.getId(),
                evento.getUsuario() != null ? evento.getUsuario().getId() : null,
                evento.getModulo(),
                evento.getAccion(),
                evento.getDescripcion(),
                evento.getFecha()
        );
    }
}
