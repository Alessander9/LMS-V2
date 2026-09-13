package com.insteip.backend.domain.dto.video;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VideoRequestDTO(
    @NotNull(message = "El ID del módulo es obligatorio")
    Long moduloId,
    
    @NotBlank(message = "El título del video es obligatorio")
    String titulo,
    
    String descripcion,
    
    @NotBlank(message = "La URL de YouTube es obligatoria")
    String youtubeUrl,
    
    @NotNull(message = "El orden del video es obligatorio")
    Integer orden,
    
    Integer duracionSegundos
){}
