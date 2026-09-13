package com.insteip.backend.domain.dto.mensajeria;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MensajeRequestDTO {

    @NotBlank(message = "El asunto es obligatorio")
    private String asunto;

    @NotBlank(message = "El contenido del mensaje es obligatorio")
    private String contenido;

    private Long destinatarioId; // Obligatorio si tipo === 'INDIVIDUAL'
    private Long cursoId;        // Opcional o para 'CURSO_MASIVO'

    @Builder.Default
    private String tipo = "INDIVIDUAL"; // 'INDIVIDUAL', 'CURSO_MASIVO', 'TODOS_ALUMNOS', 'TODOS_DOCENTES'

    @Builder.Default
    private String prioridad = "NORMAL"; // 'NORMAL', 'IMPORTANTE', 'URGENTE'

    private String adjuntoUrl;
    private String adjuntoNombre;
    private String adjuntoTamano;
    private String audioUrl;
}
