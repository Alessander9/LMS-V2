package com.insteip.backend.domain.dto.mensajeria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversacionResponseDTO {
    private Long id;
    private String asunto;
    private Long cursoId;
    private String cursoNombre;
    private String tipo;
    private String prioridad;

    // Emisor original
    private Long emisorId;
    private String emisorNombre;
    private Boolean soyEmisor;

    // Contacto con quien se conversa
    private Long contactoId;
    private String contactoNombre;
    private String contactoCorreo;
    private String contactoRol;

    private Long ultimoMensajeRemitenteId;
    private Boolean tieneMensajesRecibidos;
    private Boolean tieneMensajesEnviados;
    private Boolean tieneDestacados;

    private String ultimoMensaje;
    private LocalDateTime fechaUltimoMensaje;
    private Long totalMensajes;
    private Long noLeidosCount;

    private List<MensajeResponseDTO> mensajes;
    private LocalDateTime fechaCreacion;
}
