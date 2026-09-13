package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.evento.EventoSistemaResponseDTO;
import com.insteip.backend.domain.dto.evento.LoginAuditoriaResponseDTO;
import java.time.LocalDate;
import java.util.List;

public interface AuditoriaService {
    void registrarEvento(String modulo, String accion, String descripcion);
    List<LoginAuditoriaResponseDTO> listarLoginAuditorias(LocalDate fecha, String correo, Boolean resultado);
    List<LoginAuditoriaResponseDTO> listarLoginAuditoriasPorUsuario(Long usuarioId);
    List<EventoSistemaResponseDTO> listarEventosSistema();
    List<EventoSistemaResponseDTO> listarEventosSistemaPorModulo(String modulo);
    List<EventoSistemaResponseDTO> listarEventosSistemaPorUsuario(Long usuarioId);
}
