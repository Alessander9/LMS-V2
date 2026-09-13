package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.notificacion.ComunicadoRequestDTO;
import com.insteip.backend.domain.dto.notificacion.NotificacionResumenDTO;

public interface NotificacionService {

    NotificacionResumenDTO obtenerNotificacionesUsuario(String correo, int limite);

    void marcarComoLeida(Long notificacionId, String correo);

    void marcarTodasComoLeidas(String correo);

    void crearNotificacion(Long usuarioId, String titulo, String mensaje, String tipo, String urlDestino, String icono);

    void notificarAlumnosDeCurso(Long cursoId, String titulo, String mensaje, String tipo, String urlDestino, String icono);

    void notificarDocenteDeCurso(Long cursoId, String titulo, String mensaje, String tipo, String urlDestino, String icono);

    void enviarComunicadoSegmentado(ComunicadoRequestDTO request, String correoAdmin);
}
