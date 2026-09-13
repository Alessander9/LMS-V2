package com.insteip.backend.domain.dto.mensajeria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MensajeResponseDTO {
    private Long id;
    private Long conversacionId;
    private String asunto;
    private String contenido;
    private String prioridad;

    // Remitente
    private Long remitenteId;
    private String remitenteNombre;
    private String remitenteCorreo;
    private String remitenteRol;

    // Destinatario
    private Long destinatarioId;
    private String destinatarioNombre;
    private String destinatarioCorreo;
    private String destinatarioRol;

    // Adjuntos y Multimedia
    private String adjuntoUrl;
    private String adjuntoNombre;
    private String adjuntoTamano;
    private String audioUrl;

    // Estados
    private Boolean leido;
    private LocalDateTime fechaLeido;
    private Boolean destacado;
    private Boolean esMio; // Si el mensaje fue enviado por el usuario en sesión

    private LocalDateTime fechaEnvio;
}
