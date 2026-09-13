package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.mensajeria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MensajeriaService {

    // Envío de nuevo mensaje / creación de hilo
    MensajeResponseDTO enviarMensaje(MensajeRequestDTO request, String correoRemitente);

    // Responder en un hilo existente
    MensajeResponseDTO responderMensaje(Long conversacionId, RespuestaMensajeDTO request, String correoRemitente);

    // Listar conversaciones (con filtro opcional de curso)
    Page<ConversacionResponseDTO> listarConversaciones(String correo, Long cursoId, Pageable pageable);

    // Obtener detalle completo de un hilo con sus mensajes
    ConversacionResponseDTO obtenerConversacion(Long conversacionId, String correo);

    // Bandejas de mensajes individuales (RECIBIDOS, ENVIADOS, NO_LEIDOS, DESTACADOS)
    Page<MensajeResponseDTO> obtenerBandeja(String correo, String carpeta, Pageable pageable);

    // Marcar mensaje como leído (con hora de visto)
    void marcarComoLeido(Long mensajeId, String correo);

    // Marcar conversación entera como leída
    void marcarConversacionComoLeida(Long conversacionId, String correo);

    // Alternar estrella / destacado
    void toggleDestacado(Long mensajeId, String correo);

    // Obtener lista inteligente de contactos/destinatarios permitidos según rol
    List<DestinatarioDTO> obtenerDestinatariosDisponibles(String correo);

    // Obtener contadores del buzón
    BuzonResumenDTO obtenerResumenBuzon(String correo);
}
