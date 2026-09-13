package com.insteip.backend.domain.dto.anuncio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnuncioModalResponseDTO {
    private Long id;
    private String titulo;
    private String mensaje;
    private String imagenUrl;
    private String botonTexto;
    private String botonUrl;
    private String audiencia;
    private Boolean activo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String creadoPor;
    private LocalDateTime fechaCreacion;
}
