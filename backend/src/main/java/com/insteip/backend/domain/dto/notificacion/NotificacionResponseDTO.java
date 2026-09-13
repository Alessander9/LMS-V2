package com.insteip.backend.domain.dto.notificacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacionResponseDTO {
    private Long id;
    private String titulo;
    private String mensaje;
    private String tipo;
    private String urlDestino;
    private String icono;
    private Boolean leido;
    private String prioridad;
    private Boolean fijado;
    private String adjuntoUrl;
    private String adjuntoNombre;
    private String adjuntoTamano;
    private LocalDateTime fechaCreacion;
}
