package com.insteip.backend.domain.dto.notificacion;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComunicadoRequestDTO {
    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje;

    private String urlDestino;
    private String icono;
    private String prioridad; // 'INFO', 'AVISO', 'URGENTE', 'PROMO'
    private Boolean fijado;
    private String adjuntoUrl;
    private String adjuntoNombre;
    private String adjuntoTamano;

    // Audiencia: 'TODOS', 'SOLO_ESTUDIANTES', 'SOLO_DOCENTES', 'DOCENTES_Y_ESTUDIANTES', 'POR_CURSO'
    @NotBlank(message = "La audiencia es obligatoria")
    private String audiencia;

    private Long cursoId; // Obligatorio solo si audiencia === 'POR_CURSO'
}
