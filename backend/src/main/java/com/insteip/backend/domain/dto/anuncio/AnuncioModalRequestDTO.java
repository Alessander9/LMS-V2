package com.insteip.backend.domain.dto.anuncio;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnuncioModalRequestDTO {
    @NotBlank(message = "El título del anuncio es obligatorio")
    private String titulo;

    private String mensaje;
    private String imagenUrl;
    private String botonTexto;
    private String botonUrl;
    private String audiencia; // 'TODOS', 'SOLO_ESTUDIANTES', 'SOLO_DOCENTES', 'DOCENTES_Y_ESTUDIANTES'
    private Boolean activo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
